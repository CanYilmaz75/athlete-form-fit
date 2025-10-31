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

  let tl7 = 0.0;
  let tl14 = 0.0;
  let count7 = 0;
  let avgSleep7 = 0.0;
  let avgSoreness7 = 0.0;
  const rpeList7: number[] = [];

  for (const s of sessions) {
    const d = toDate(s.date);
    const tl = trainingLoad(s);
    
    if (d > win14 && d <= td) {
      tl14 += tl;
    }
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

  // Normalization (heuristic for MVP)
  const TL_MAX_7D = 3000.0;
  const tl7Norm = clamp(tl7 / TL_MAX_7D, 0, 1);

  // Recovery Index (0..100)
  const sleepFactor = clamp(avgSleep7 / 8.0, 0, 1.25);
  const sorenessFactor = clamp(1.0 - (avgSoreness7 / 10.0), 0, 1);
  const recoveryIndex = clamp(
    100.0 * (0.65 * (1 - tl7Norm) + 0.25 * sleepFactor + 0.10 * sorenessFactor),
    0,
    100
  );

  // Injury Risk (0..1)
  const injuryRisk = clamp(
    0.45 * tl7Norm +
    0.20 * (avgRpe7 / 10.0) +
    0.20 * (1.0 - clamp(avgSleep7 / 8.0, 0, 1)) +
    0.15 * (avgSoreness7 / 10.0),
    0,
    1
  );

  return {
    tl_7d: Math.round(tl7),
    tl_14d: Math.round(tl14),
    tl7_norm: parseFloat(tl7Norm.toFixed(3)),
    avg_sleep7: parseFloat(avgSleep7.toFixed(1)),
    avg_soreness7: parseFloat(avgSoreness7.toFixed(1)),
    avg_rpe7: parseFloat(avgRpe7.toFixed(1)),
    recovery_index: Math.round(recoveryIndex),
    injury_risk: parseFloat(injuryRisk.toFixed(3)),
    today: today
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { today, sessions } = await req.json();

    if (!today || !sessions || !Array.isArray(sessions)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: today, sessions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required session fields
    for (const session of sessions) {
      if (!session.date || !session.sport || session.duration_min === undefined || session.rpe_1_10 === undefined) {
        return new Response(
          JSON.stringify({ error: 'Each session must have: date, sport, duration_min, rpe_1_10' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Set defaults for optional fields
      session.sleep_hours = session.sleep_hours ?? 7.0;
      session.soreness_1_10 = session.soreness_1_10 ?? 0.0;
    }

    const metrics = aggregateMetrics(sessions, today);

    console.log('Analyze metrics:', metrics);

    return new Response(
      JSON.stringify(metrics),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
