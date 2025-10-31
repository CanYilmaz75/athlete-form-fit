import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const Analysis = () => {
  const navigate = useNavigate();

  // Mock data for charts
  const rpeData = [
    { day: "Mon", rpe: 4, load: 180 },
    { day: "Tue", rpe: 6, load: 360 },
    { day: "Wed", rpe: 3, load: 120 },
    { day: "Thu", rpe: 7, load: 420 },
    { day: "Fri", rpe: 5, load: 250 },
    { day: "Sat", rpe: 8, load: 480 },
    { day: "Sun", rpe: 4, load: 200 },
  ];

  const recoveryData = [
    { week: "W1", hrv: 45, sleep: 6.5, recovery: 55 },
    { week: "W2", hrv: 52, sleep: 7.2, recovery: 68 },
    { week: "W3", hrv: 48, sleep: 6.8, recovery: 62 },
    { week: "W4", hrv: 58, sleep: 7.8, recovery: 75 },
  ];

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
                <BarChart data={rpeData}>
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

          {/* Recovery Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery Metrics</CardTitle>
              <CardDescription>HRV, sleep quality, and recovery index over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={recoveryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="hrv" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    name="HRV (ms)"
                    dot={{ fill: 'hsl(var(--chart-1))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sleep" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    name="Sleep (h)"
                    dot={{ fill: 'hsl(var(--chart-2))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="recovery" 
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={2}
                    name="Recovery Index"
                    dot={{ fill: 'hsl(var(--chart-3))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
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
