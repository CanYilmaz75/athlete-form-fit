import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, Shield, Plus, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadMetrics, loadSessions } from "@/lib/athleteVision";

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(() => loadMetrics());
  const [recentSessions, setRecentSessions] = useState(() => {
    const sessions = loadSessions();
    return sessions.slice(-3).reverse();
  });

  useEffect(() => {
    // Refresh data when page becomes visible
    const handleFocus = () => {
      setMetrics(loadMetrics());
      const sessions = loadSessions();
      setRecentSessions(sessions.slice(-3).reverse());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const trainingLoad = metrics?.tl_7d || 0;
  const recoveryIndex = metrics?.recovery_index || 0;
  const injuryRisk = Math.round((metrics?.injury_risk || 0) * 100);

  const getRiskColor = (risk: number) => {
    if (risk < 40) return "text-success";
    if (risk < 70) return "text-warning";
    return "text-destructive";
  };

  const getRiskBg = (risk: number) => {
    if (risk < 40) return "bg-success/10";
    if (risk < 70) return "bg-warning/10";
    return "bg-destructive/10";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">AthleteVision</h1>
              <p className="text-muted-foreground">Performance & Prevention Dashboard</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/data-input")} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Training
              </Button>
              <Button variant="outline" onClick={() => navigate("/analysis")} className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analysis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Training Load Card */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Training Load</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{trainingLoad}</div>
              <Progress value={trainingLoad} className="mt-3" />
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-accent font-medium">+5%</span> from last week
              </p>
            </CardContent>
          </Card>

          {/* Recovery Index Card */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recovery Index</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{recoveryIndex}%</div>
              <Progress value={recoveryIndex} className="mt-3 [&>div]:bg-success" />
              <p className="text-xs text-muted-foreground mt-2">
                Moderate recovery state
              </p>
            </CardContent>
          </Card>

          {/* Injury Risk Card */}
          <Card className={`transition-all hover:shadow-lg ${getRiskBg(injuryRisk)}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Injury Risk</CardTitle>
              <Shield className={`h-4 w-4 ${getRiskColor(injuryRisk)}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getRiskColor(injuryRisk)}`}>
                {injuryRisk}%
              </div>
              <Progress 
                value={injuryRisk} 
                className={`mt-3 ${
                  injuryRisk < 40 
                    ? "[&>div]:bg-success" 
                    : injuryRisk < 70 
                    ? "[&>div]:bg-warning" 
                    : "[&>div]:bg-destructive"
                }`} 
              />
              <p className="text-xs text-muted-foreground mt-2">
                Low risk - continue training
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your last training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No training sessions yet. Add your first session to get started!
                  </p>
                ) : recentSessions.map((session, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{session.sport}</p>
                      <p className="text-sm text-muted-foreground">{session.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{session.duration_min} min</p>
                      <p className="text-sm text-muted-foreground">RPE: {session.rpe_1_10}/10</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Improvement Plan CTA */}
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Ready for Your Next Plan?</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Get a personalized 7-day improvement plan based on your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-primary-foreground/90">
                  Our algorithm analyzes your training load, recovery, and injury risk to create
                  an optimal weekly plan tailored to your sport and goals.
                </p>
                <Button 
                  onClick={() => navigate("/improvement-plan")}
                  variant="secondary"
                  className="w-full"
                >
                  Generate Improvement Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
