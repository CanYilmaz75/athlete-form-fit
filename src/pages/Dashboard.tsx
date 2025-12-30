import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Moon, Activity, TrendingUp, ChevronRight, AlertTriangle, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadMetrics, loadSessions, AnalyzeResponse } from "@/lib/athleteVision";
import { CircularProgress } from "@/components/CircularProgress";

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AnalyzeResponse | null>(() => loadMetrics());
  const [recentSessions, setRecentSessions] = useState(() => {
    const sessions = loadSessions();
    return sessions.slice(-5).reverse();
  });

  useEffect(() => {
    const handleFocus = () => {
      setMetrics(loadMetrics());
      const sessions = loadSessions();
      setRecentSessions(sessions.slice(-5).reverse());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const trainingLoad = metrics?.tl_7d || 0;
  const trainingLoadPercent = Math.min((trainingLoad / 3000) * 100, 100);
  const recoveryIndex = metrics?.recovery_index || 0;
  const avgSleep = metrics?.avg_sleep7 || 7;
  const sleepPercent = Math.min((avgSleep / 9) * 100, 100);
  const injuryRisk = Math.round((metrics?.injury_risk || 0) * 100);

  // Insights
  const getInsights = () => {
    const insights: { type: "positive" | "warning" | "tip"; title: string; text: string }[] = [];

    if (metrics) {
      if (recoveryIndex >= 70) {
        insights.push({
          type: "positive",
          title: "Starke Erholung",
          text: `Erholungsindex bei ${recoveryIndex}% – bereit für intensive Einheiten.`
        });
      } else if (recoveryIndex < 40) {
        insights.push({
          type: "warning",
          title: "Niedrige Erholung",
          text: `Nur ${recoveryIndex}%. Deload oder Ruhetag empfohlen.`
        });
      }

      if (injuryRisk > 60) {
        insights.push({
          type: "warning",
          title: "Erhöhtes Risiko",
          text: `Verletzungsrisiko bei ${injuryRisk}%. Intensität reduzieren.`
        });
      }

      if (avgSleep < 6.5) {
        insights.push({
          type: "warning",
          title: "Schlafdefizit",
          text: `Nur ${avgSleep.toFixed(1)}h Schlaf. Ziel: 7-8h.`
        });
      }

      if (trainingLoad > 2000) {
        insights.push({
          type: "tip",
          title: "Hohe Belastung",
          text: `TL7 = ${trainingLoad}. Nächste Woche leichter gestalten.`
        });
      }
    }

    if (insights.length === 0) {
      insights.push({
        type: "tip",
        title: "Starte jetzt",
        text: "Füge Trainingseinheiten hinzu für personalisierte Insights."
      });
    }

    return insights.slice(0, 2);
  };

  const insights = getInsights();

  const getRiskColor = (risk: number) => {
    if (risk < 40) return "hsl(var(--success))";
    if (risk < 70) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const sportIcons: Record<string, string> = {
    Running: "🏃",
    Strength: "🏋️",
    Football: "⚽",
    Basketball: "🏀"
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                <span className="text-gradient">Athlete</span>
                <span className="text-foreground">Vision</span>
              </h1>
              <p className="text-muted-foreground mt-1">Performance & Prevention</p>
            </div>
            <Button onClick={() => navigate("/data-input")} size="lg" className="gap-2 glow-primary">
              <Plus className="h-5 w-5" />
              Training hinzufügen
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-10">
        {/* Main Metrics - Circular Gauges */}
        <div className="grid gap-8 md:grid-cols-3 mb-10">
          {/* Belastung */}
          <Card className="glass group hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Belastung (7 Tage)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4">
              <CircularProgress
                value={trainingLoadPercent}
                max={100}
                size={160}
                strokeWidth={12}
                color="hsl(var(--primary))"
                className="mb-4"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">{trainingLoad}</div>
                  <div className="text-xs text-muted-foreground mt-1">TL</div>
                </div>
              </CircularProgress>
              <p className="text-sm text-muted-foreground">
                {trainingLoadPercent < 50 ? "Leichte Woche" : trainingLoadPercent < 75 ? "Moderate Belastung" : "Hohe Belastung"}
              </p>
            </CardContent>
          </Card>

          {/* Erholung */}
          <Card className="glass group hover:border-success/50 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                Erholung
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4">
              <CircularProgress
                value={recoveryIndex}
                max={100}
                size={160}
                strokeWidth={12}
                color="hsl(var(--success))"
                className="mb-4"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">{recoveryIndex}</div>
                  <div className="text-xs text-muted-foreground mt-1">%</div>
                </div>
              </CircularProgress>
              <p className="text-sm text-muted-foreground">
                {recoveryIndex >= 70 ? "Optimal erholt" : recoveryIndex >= 40 ? "Moderat erholt" : "Erschöpft"}
              </p>
            </CardContent>
          </Card>

          {/* Schlaf */}
          <Card className="glass group hover:border-accent/50 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Moon className="h-4 w-4 text-accent" />
                Schlaf (Ø 7 Tage)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4">
              <CircularProgress
                value={sleepPercent}
                max={100}
                size={160}
                strokeWidth={12}
                color="hsl(var(--accent))"
                className="mb-4"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">{avgSleep.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Stunden</div>
                </div>
              </CircularProgress>
              <p className="text-sm text-muted-foreground">
                {avgSleep >= 7.5 ? "Ausreichend Schlaf" : avgSleep >= 6.5 ? "Könnte besser sein" : "Zu wenig Schlaf"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Injury Risk Banner */}
        <Card 
          className="mb-10 overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${getRiskColor(injuryRisk)}15, transparent)`,
            borderColor: getRiskColor(injuryRisk) + "40"
          }}
        >
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <CircularProgress
                  value={injuryRisk}
                  max={100}
                  size={80}
                  strokeWidth={8}
                  color={getRiskColor(injuryRisk)}
                >
                  <span className="text-xl font-bold">{injuryRisk}%</span>
                </CircularProgress>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Verletzungsrisiko</h3>
                  <p className="text-muted-foreground">
                    {injuryRisk < 40 
                      ? "Niedriges Risiko – weiter trainieren" 
                      : injuryRisk < 70 
                      ? "Moderates Risiko – achtsam bleiben" 
                      : "Hohes Risiko – Erholung priorisieren"}
                  </p>
                </div>
              </div>
              <div 
                className="w-3 h-16 rounded-full"
                style={{ backgroundColor: getRiskColor(injuryRisk) }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Insights TL;DR */}
        {insights.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 mb-10">
            {insights.map((insight, i) => (
              <Card 
                key={i} 
                className={`glass border-l-4 ${
                  insight.type === "positive" 
                    ? "border-l-success" 
                    : insight.type === "warning" 
                    ? "border-l-warning" 
                    : "border-l-primary"
                }`}
              >
                <CardContent className="py-4 flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    insight.type === "positive" 
                      ? "bg-success/20 text-success" 
                      : insight.type === "warning" 
                      ? "bg-warning/20 text-warning" 
                      : "bg-primary/20 text-primary"
                  }`}>
                    {insight.type === "positive" && <Zap className="h-5 w-5" />}
                    {insight.type === "warning" && <AlertTriangle className="h-5 w-5" />}
                    {insight.type === "tip" && <Lightbulb className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{insight.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom Grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Recent Activity */}
          <Card className="glass lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Letzte Einheiten</span>
                <Button variant="ghost" size="sm" onClick={() => navigate("/data-input")} className="text-muted-foreground hover:text-foreground">
                  Alle anzeigen <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏃</div>
                  <p className="text-muted-foreground">Noch keine Einheiten.</p>
                  <Button onClick={() => navigate("/data-input")} variant="outline" className="mt-4">
                    Erste Einheit hinzufügen
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((session, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{sportIcons[session.sport] || "🏃"}</div>
                        <div>
                          <p className="font-medium text-foreground">{session.sport}</p>
                          <p className="text-sm text-muted-foreground">{session.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{session.duration_min} min</p>
                        <p className="text-sm text-muted-foreground">RPE {session.rpe_1_10}/10</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Improvement Plan CTA */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30 glow-primary">
            <CardHeader>
              <CardTitle className="text-2xl">7-Tage Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Generiere einen personalisierten Trainingsplan basierend auf deinen Daten, Zielen und Erholungszustand.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">🏃</div>
                  <div className="text-muted-foreground">Running</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">🏋️</div>
                  <div className="text-muted-foreground">Kraft</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">⚽</div>
                  <div className="text-muted-foreground">Fußball</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">🏀</div>
                  <div className="text-muted-foreground">Basketball</div>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/improvement-plan")}
                className="w-full mt-4"
                size="lg"
              >
                Plan erstellen
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
