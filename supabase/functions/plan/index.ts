import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Session {
  date: string;
  sport: string;
  duration_min: number;
  rpe_1_10: number;
  distance_km?: number;
  avg_hr_bpm?: number;
  sleep_hours?: number;
  hrv_ms?: number;
  soreness_1_10?: number;
  notes?: string;
}

interface DayPlan {
  day: string;
  session: string;
  focus: string;
}

// Copy of analyze logic for metrics calculation
function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

function toDate(s: string): Date {
  return new Date(s);
}

function trainingLoad(session: Session): number {
  return session.duration_min * session.rpe_1_10;
}

function aggregateMetrics(sessions: Session[], today: string) {
  const td = toDate(today);
  const win7 = new Date(td.getTime() - 7 * 24 * 60 * 60 * 1000);
  const win14 = new Date(td.getTime() - 14 * 24 * 60 * 60 * 1000);

  let tl7 = 0.0, tl14 = 0.0, count7 = 0, avgSleep7 = 0.0, avgSoreness7 = 0.0;
  const rpeList7: number[] = [];

  for (const s of sessions) {
    const d = toDate(s.date);
    const tl = trainingLoad(s);
    if (d > win14 && d <= td) tl14 += tl;
    if (d > win7 && d <= td) {
      tl7 += tl;
      count7 += 1;
      avgSleep7 += s.sleep_hours || 7.0;
      avgSoreness7 += s.soreness_1_10 || 0.0;
      rpeList7.push(s.rpe_1_10);
    }
  }

  avgSleep7 = count7 ? avgSleep7 / count7 : 7.0;
  avgSoreness7 = count7 ? avgSoreness7 / count7 : 0.0;
  const avgRpe7 = rpeList7.length ? rpeList7.reduce((a, b) => a + b, 0) / rpeList7.length : 5.0;

  const TL_MAX_7D = 3000.0;
  const tl7Norm = clamp(tl7 / TL_MAX_7D, 0, 1);

  const sleepFactor = clamp(avgSleep7 / 8.0, 0, 1.25);
  const sorenessFactor = clamp(1.0 - (avgSoreness7 / 10.0), 0, 1);
  const recoveryIndex = clamp(100.0 * (0.65 * (1 - tl7Norm) + 0.25 * sleepFactor + 0.10 * sorenessFactor), 0, 100);

  const injuryRisk = clamp(
    0.45 * tl7Norm + 0.20 * (avgRpe7 / 10.0) + 0.20 * (1.0 - clamp(avgSleep7 / 8.0, 0, 1)) + 0.15 * (avgSoreness7 / 10.0),
    0, 1
  );

  return { tl_7d: Math.round(tl7), tl_14d: Math.round(tl14), tl7_norm: tl7Norm, avg_sleep7: avgSleep7, avg_soreness7: avgSoreness7, avg_rpe7: avgRpe7, recovery_index: Math.round(recoveryIndex), injury_risk: injuryRisk, today };
}

// Plan templates
const TEMPLATES: Record<string, Record<string, DayPlan[]>> = {
  Running: {
    Endurance: [
      { day: "Mon", session: "Easy Run 5–6 km", focus: "GA1" },
      { day: "Tue", session: "Mobility + Core 20'", focus: "Stabilität" },
      { day: "Wed", session: "Intervals 6×400 m, 90\" TP", focus: "Tempo" },
      { day: "Thu", session: "Rest / Walk 30'", focus: "Recovery" },
      { day: "Fri", session: "Strength Core 30'", focus: "Rumpf" },
      { day: "Sat", session: "Long Run 10–12 km", focus: "Ausdauer" },
      { day: "Sun", session: "Rest + Stretch 15'", focus: "Regeneration" }
    ],
    Technique: [
      { day: "Mon", session: "Drills: A-/B-Skips, Strides 6×80 m", focus: "Lauftechnik" },
      { day: "Tue", session: "Easy Run 5 km", focus: "GA1" },
      { day: "Wed", session: "Hill Repeats 8×30–45\"", focus: "Kraft-Ausdauer" },
      { day: "Thu", session: "Mobility 20'", focus: "Beweglichkeit" },
      { day: "Fri", session: "Plyo light + Core", focus: "Ökonomie" },
      { day: "Sat", session: "Progressive Run 8 km", focus: "Steigerung" },
      { day: "Sun", session: "Rest", focus: "Regeneration" }
    ],
    Prevention: [
      { day: "Mon", session: "Mobility + Balance 25'", focus: "Prävention" },
      { day: "Tue", session: "Easy Run 4–5 km", focus: "Locker" },
      { day: "Wed", session: "Core Antirotation 20'", focus: "Stabilität" },
      { day: "Thu", session: "Rest", focus: "Recovery" },
      { day: "Fri", session: "Strength legs leicht", focus: "Beinachse" },
      { day: "Sat", session: "Long Run 8–10 km locker", focus: "GA1" },
      { day: "Sun", session: "Rest + Stretch", focus: "Regeneration" }
    ]
  },
  Strength: {
    Power: [
      { day: "Mon", session: "Lower: Squat 4×5, RDL 3×6, Core", focus: "Maxkraft" },
      { day: "Tue", session: "Mobility 20'", focus: "Beweglichkeit" },
      { day: "Wed", session: "Upper: Bench 4×5, Row 4×6", focus: "Maxkraft" },
      { day: "Thu", session: "Rest / Walk", focus: "Recovery" },
      { day: "Fri", session: "Plyo: Box Jumps 5×3, Medball 4×5", focus: "Explosivität" },
      { day: "Sat", session: "Full Body 3×8", focus: "Kraft" },
      { day: "Sun", session: "Rest + Stretch", focus: "Regeneration" }
    ],
    Hypertrophy: [
      { day: "Mon", session: "Push 4×8–12", focus: "Volumen" },
      { day: "Tue", session: "Pull 4×8–12", focus: "Volumen" },
      { day: "Wed", session: "Legs 4×8–12", focus: "Volumen" },
      { day: "Thu", session: "Core + Mobility", focus: "Stabilität" },
      { day: "Fri", session: "Full Body 3×10", focus: "Hypertrophie" },
      { day: "Sat", session: "Cardio locker 20–30'", focus: "GA1" },
      { day: "Sun", session: "Rest", focus: "Regeneration" }
    ],
    Prevention: [
      { day: "Mon", session: "Prehab: Shoulder + Hip", focus: "Prävention" },
      { day: "Tue", session: "Full Body 3×8 moderat", focus: "Kraft" },
      { day: "Wed", session: "Mobility 25'", focus: "Beweglichkeit" },
      { day: "Thu", session: "Core Antirotation 20'", focus: "Stabilität" },
      { day: "Fri", session: "Glute + Hamstrings 3×12", focus: "Beinachse" },
      { day: "Sat", session: "Cardio locker 20–30'", focus: "GA1" },
      { day: "Sun", session: "Rest", focus: "Regeneration" }
    ]
  },
  Football: {
    Endurance: [
      { day: "Mon", session: "Tempo Intervals 8×200 m", focus: "Schnelligkeitsausdauer" },
      { day: "Tue", session: "Mobility + Core", focus: "Stabilität" },
      { day: "Wed", session: "Small Sided Games 4×6'", focus: "Matchfitness" },
      { day: "Thu", session: "Rest", focus: "Recovery" },
      { day: "Fri", session: "Strength Lower 3×6", focus: "Kraft" },
      { day: "Sat", session: "Endurance Run 30–40'", focus: "GA1" },
      { day: "Sun", session: "Rest + Stretch", focus: "Regeneration" }
    ],
    Technique: [
      { day: "Mon", session: "Ball mastery + Turns", focus: "Technik" },
      { day: "Tue", session: "Speed Ladder + Accel 6×20 m", focus: "Agility" },
      { day: "Wed", session: "SSG 3×8' + Passing", focus: "Spielnahe Technik" },
      { day: "Thu", session: "Mobility + Core", focus: "Stabilität" },
      { day: "Fri", session: "Finishing Drills", focus: "Abschluss" },
      { day: "Sat", session: "Easy Run 20–30'", focus: "GA1" },
      { day: "Sun", session: "Rest", focus: "Regeneration" }
    ],
    Prevention: [
      { day: "Mon", session: "Nordic Hamstrings + Copenhagen", focus: "Prävention" },
      { day: "Tue", session: "Mobility Hips/Ankles", focus: "Beweglichkeit" },
      { day: "Wed", session: "Core + Balance", focus: "Stabilität" },
      { day: "Thu", session: "Rest / Walk", focus: "Recovery" },
      { day: "Fri", session: "Light SSG 3×5'", focus: "Belastung niedrig" },
      { day: "Sat", session: "Easy Run 20–25'", focus: "GA1" },
      { day: "Sun", session: "Rest + Stretch", focus: "Regeneration" }
    ]
  },
  Basketball: {
    Explosiveness: [
      { day: "Mon", session: "Jump Drills: CMJ/Depth Jumps", focus: "Plyometrics" },
      { day: "Tue", session: "Ballhandling + Pace", focus: "Technik" },
      { day: "Wed", session: "Strength Lower 4×5", focus: "Power" },
      { day: "Thu", session: "Mobility Ankles/Hips", focus: "Beweglichkeit" },
      { day: "Fri", session: "Agility: Ladders + Closeouts", focus: "Schnelligkeit" },
      { day: "Sat", session: "Shooting Volume 200", focus: "Skill" },
      { day: "Sun", session: "Rest + Stretch", focus: "Regeneration" }
    ],
    Technique: [
      { day: "Mon", session: "Shooting Mechanics", focus: "Form" },
      { day: "Tue", session: "Footwork + Finishing", focus: "Technik" },
      { day: "Wed", session: "Strength Full Body 3×8", focus: "Kraft" },
      { day: "Thu", session: "Mobility + Core", focus: "Stabilität" },
      { day: "Fri", session: "Pick&Roll Reads", focus: "Decision" },
      { day: "Sat", session: "Conditioning Intervals", focus: "Ausdauer" },
      { day: "Sun", session: "Rest", focus: "Regeneration" }
    ],
    Prevention: [
      { day: "Mon", session: "Knee/Ankle Prehab", focus: "Prävention" },
      { day: "Tue", session: "Core Antirotation", focus: "Stabilität" },
      { day: "Wed", session: "Strength light 3×10", focus: "Kraft-Erhalt" },
      { day: "Thu", session: "Mobility Full Body", focus: "Beweglichkeit" },
      { day: "Fri", session: "Landing Mechanics", focus: "Technik" },
      { day: "Sat", session: "Shooting light 100", focus: "Skill" },
      { day: "Sun", session: "Rest", focus: "Regeneration" }
    ]
  }
};

function decidePlanType(injuryRisk: number, recoveryIndex: number): string {
  if (injuryRisk > 0.70) return "Regeneration";
  if (recoveryIndex < 40.0) return "Deload";
  return "Performance";
}

function generateBasePlan(sport: string, goal: string): DayPlan[] {
  const tmpl = TEMPLATES[sport]?.[goal];
  return tmpl || TEMPLATES.Running.Endurance;
}

function adaptPlanForState(plan: DayPlan[], planType: string): DayPlan[] {
  return plan.map(item => {
    const sess = { ...item };
    if (planType === "Regeneration") {
      if (sess.session.includes("Intervals") || sess.session.includes("Depth") || 
          sess.session.includes("SSG") || sess.session.includes("Hill")) {
        sess.session = "Mobility + Core 20'";
        sess.focus = "Recovery";
      }
      if (sess.session.includes("Long Run")) {
        sess.session = "Easy Run 5–6 km";
        sess.focus = "Locker";
      }
    } else if (planType === "Deload") {
      sess.session += " (−30% Volumen)";
    }
    return sess;
  });
}

function explainReason(m: any, planType: string): string {
  const ir = m.injury_risk.toFixed(2);
  const ri = Math.round(m.recovery_index);
  const tl = Math.round(m.tl_7d);
  
  if (planType === "Regeneration") {
    return `Erhöhtes Verletzungsrisiko (${ir}); Recovery Index ${ri}. Fokus auf Entlastung. TL7=${tl}.`;
  }
  if (planType === "Deload") {
    return `Recovery Index niedrig (${ri}); leichte Deload-Woche empfohlen. TL7=${tl}.`;
  }
  return `Werte stabil (IR ${ir}, RI ${ri}); Performance-Progression möglich. TL7=${tl}.`;
}

function generatePlan(sport: string, goal: string, sessions: Session[], today: string) {
  const metrics = aggregateMetrics(sessions, today);
  const planType = decidePlanType(metrics.injury_risk, metrics.recovery_index);
  const base = generateBasePlan(sport, goal);
  const plan = adaptPlanForState(base, planType);

  return {
    plan_type: planType,
    reason: explainReason(metrics, planType),
    week_plan: plan,
    metrics: metrics
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { today, sport, goal, sessions } = await req.json();

    if (!today || !sport || !goal || !sessions || !Array.isArray(sessions)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: today, sport, goal, sessions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and set defaults
    for (const session of sessions) {
      if (!session.date || !session.sport || session.duration_min === undefined || session.rpe_1_10 === undefined) {
        return new Response(
          JSON.stringify({ error: 'Each session must have: date, sport, duration_min, rpe_1_10' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      session.sleep_hours = session.sleep_hours ?? 7.0;
      session.soreness_1_10 = session.soreness_1_10 ?? 0.0;
    }

    const result = generatePlan(sport, goal, sessions, today);

    console.log('Generated plan:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in plan function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
