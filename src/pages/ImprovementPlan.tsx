import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Dumbbell, Timer, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PlanGeneratorDialog } from "@/components/PlanGeneratorDialog";
import { generatePlan, loadSessions, loadPlan, savePlan, PlanResponse } from "@/lib/athleteVision";

const ImprovementPlan = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanResponse | null>(() => loadPlan());
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('athletevision_completed_days');
    if (saved) setCompletedDays(JSON.parse(saved));
  }, []);

  const toggleDay = (dayIndex: number) => {
    const updated = completedDays.includes(dayIndex)
      ? completedDays.filter(d => d !== dayIndex)
      : [...completedDays, dayIndex];
    setCompletedDays(updated);
    localStorage.setItem('athletevision_completed_days', JSON.stringify(updated));
  };

  const handleGeneratePlan = async (sport: string, goal: string) => {
    setLoading(true);
    try {
      const sessions = loadSessions();
      if (sessions.length === 0) {
        toast.error("Please add training sessions before generating a plan");
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const newPlan = await generatePlan(today, sport, goal, sessions);
      
      setPlan(newPlan);
      savePlan(newPlan);
      setCompletedDays([]);
      localStorage.removeItem('athletevision_completed_days');
      
      toast.success(`${newPlan.plan_type} plan generated successfully!`);
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">7-Day Improvement Plan</h1>
                <p className="text-muted-foreground">Generate your personalized training schedule</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8 max-w-2xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Plan Generated Yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Create a personalized 7-day improvement plan based on your training data
              </p>
              <PlanGeneratorDialog onGenerate={handleGeneratePlan} loading={loading}>
                <Button size="lg">Generate Your Plan</Button>
              </PlanGeneratorDialog>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentPlan = plan.week_plan;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">7-Day Improvement Plan</h1>
              <p className="text-muted-foreground">
                {plan.plan_type} plan - {plan.reason}
              </p>
            </div>
            <div className="flex gap-3">
              <PlanGeneratorDialog onGenerate={handleGeneratePlan} loading={loading}>
                <Button variant="outline">Regenerate Plan</Button>
              </PlanGeneratorDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Badge variant={
                    plan.plan_type === "Performance" ? "default" :
                    plan.plan_type === "Deload" ? "secondary" : "outline"
                  }>{plan.plan_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan Type</p>
                  <p className="text-sm font-medium">{plan.plan_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedDays.length}/7</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Timer className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="text-2xl font-bold">5h 45m</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-success/10">
                  <Dumbbell className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Intensity</p>
                  <p className="text-2xl font-bold">Medium</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Plan Cards */}
        <div className="grid gap-4">
          {currentPlan.map((day, index) => (
            <Card 
              key={index}
              className={`transition-all ${
                completedDays.includes(index) 
                  ? "bg-success/5 border-success/30" 
                  : "hover:shadow-md"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={completedDays.includes(index)}
                        onCheckedChange={() => toggleDay(index)}
                        className="mt-1"
                      />
                      <div>
                        <CardTitle className="text-lg">{day.day}</CardTitle>
                        <CardDescription>{day.focus}</CardDescription>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{day.session}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feedback Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Weekly Feedback</CardTitle>
            <CardDescription>Help us improve your next plan</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/feedback")}>
              Submit Weekly Feedback
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ImprovementPlan;
