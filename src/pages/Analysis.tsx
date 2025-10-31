import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { loadMetrics, loadSessions } from "@/lib/athleteVision";

const Analysis = () => {
  const navigate = useNavigate();
  const [metrics] = useState(() => loadMetrics());
  const [chartData] = useState(() => {
    const sessions = loadSessions().slice(-7);
    return sessions.map(s => ({
      day: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
      load: Math.round(s.duration_min * s.rpe_1_10),
      rpe: s.rpe_1_10
    }));
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Performance Analysis</h1>
              <p className="text-muted-foreground">Detailed insights and trends</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6">
          {/* Training Load & RPE Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Training Load & RPE Trend</CardTitle>
              <CardDescription>Weekly training intensity and perceived exertion</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="load" fill="hsl(var(--primary))" name="Training Load" radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="right" dataKey="rpe" fill="hsl(var(--accent))" name="RPE" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recovery Metrics - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery Metrics</CardTitle>
              <CardDescription>Track metrics over time to see recovery trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Add more sessions with HRV and sleep data to see recovery trends
              </p>
            </CardContent>
          </Card>

          {/* Insights Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-success/10 border-success/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-success">Positive Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">
                  Your HRV has improved by <span className="font-bold text-success">22%</span> over the past month,
                  indicating better recovery and adaptation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-warning/10 border-warning/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-warning">Watch Out</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">
                  Training load spiked <span className="font-bold text-warning">+40%</span> this week.
                  Consider adding recovery sessions to prevent overtraining.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/10 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-primary">Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">
                  Based on your data, you're ready for a <span className="font-bold text-primary">progressive overload</span> phase.
                  Check your improvement plan for details.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
