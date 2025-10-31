import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Dumbbell, Timer, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ImprovementPlan = () => {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState("running");
  const [selectedGoal, setSelectedGoal] = useState("endurance");
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  const toggleDay = (dayIndex: number) => {
    setCompletedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const plans = {
    running: {
      endurance: [
        { day: "Monday", focus: "GA1 Base", session: "Easy Run 5 km", duration: "35 min", intensity: "Low" },
        { day: "Tuesday", focus: "Recovery", session: "Core Training + Mobility", duration: "30 min", intensity: "Low" },
        { day: "Wednesday", focus: "Tempo", session: "Intervals 6×400m @ 5K pace", duration: "45 min", intensity: "High" },
        { day: "Thursday", focus: "Active Recovery", session: "Easy Run 3 km + Stretching", duration: "25 min", intensity: "Low" },
        { day: "Friday", focus: "Stability", session: "Strength Training (Lower Body)", duration: "40 min", intensity: "Medium" },
        { day: "Saturday", focus: "Quality", session: "Threshold Run 8 km", duration: "50 min", intensity: "High" },
        { day: "Sunday", focus: "Endurance", session: "Long Run 12 km", duration: "70 min", intensity: "Medium" },
      ],
      power: [
        { day: "Monday", focus: "Explosive Power", session: "Hill Sprints 8×30s", duration: "40 min", intensity: "High" },
        { day: "Tuesday", focus: "Recovery", session: "Easy Run 4 km", duration: "30 min", intensity: "Low" },
        { day: "Wednesday", focus: "Strength", session: "Plyometric Training", duration: "45 min", intensity: "High" },
        { day: "Thursday", focus: "Technique", session: "Running Drills + Strides", duration: "35 min", intensity: "Medium" },
        { day: "Friday", focus: "Rest", session: "Complete Rest or Light Yoga", duration: "20 min", intensity: "Low" },
        { day: "Saturday", focus: "Speed", session: "200m Repeats × 10", duration: "50 min", intensity: "High" },
        { day: "Sunday", focus: "Endurance", session: "Easy Long Run 10 km", duration: "60 min", intensity: "Low" },
      ],
    },
    strength: {
      power: [
        { day: "Monday", focus: "Lower Body Power", session: "Squats 5×5, Deadlifts 3×5", duration: "60 min", intensity: "High" },
        { day: "Tuesday", focus: "Active Recovery", session: "Mobility + Light Cardio", duration: "30 min", intensity: "Low" },
        { day: "Wednesday", focus: "Upper Body Power", session: "Bench Press 5×5, Rows 4×6", duration: "60 min", intensity: "High" },
        { day: "Thursday", focus: "Core & Stability", session: "Planks, Anti-Rotation Work", duration: "35 min", intensity: "Medium" },
        { day: "Friday", focus: "Explosive", session: "Olympic Lifts: Clean & Jerk", duration: "50 min", intensity: "High" },
        { day: "Saturday", focus: "Hypertrophy", session: "Accessory Work (8-12 reps)", duration: "45 min", intensity: "Medium" },
        { day: "Sunday", focus: "Recovery", session: "Stretching + Foam Rolling", duration: "25 min", intensity: "Low" },
      ],
    },
    basketball: {
      endurance: [
        { day: "Monday", focus: "Jump Training", session: "Box Jumps + Vertical Leap Drills", duration: "45 min", intensity: "High" },
        { day: "Tuesday", focus: "Court Conditioning", session: "Suicide Runs + Defensive Slides", duration: "40 min", intensity: "High" },
        { day: "Wednesday", focus: "Strength", session: "Lower Body (Squats, Lunges)", duration: "50 min", intensity: "Medium" },
        { day: "Thursday", focus: "Agility", session: "Cone Drills + Ladder Work", duration: "35 min", intensity: "Medium" },
        { day: "Friday", focus: "Shooting Practice", session: "3-Point Shooting + Free Throws", duration: "60 min", intensity: "Low" },
        { day: "Saturday", focus: "Scrimmage", session: "Full-Court 5v5 Game", duration: "60 min", intensity: "High" },
        { day: "Sunday", focus: "Recovery", session: "Mobility + Core Stability", duration: "30 min", intensity: "Low" },
      ],
    },
    football: {
      endurance: [
        { day: "Monday", focus: "Sprint Work", session: "30m Sprints × 10", duration: "45 min", intensity: "High" },
        { day: "Tuesday", focus: "Strength", session: "Lower Body Strength", duration: "55 min", intensity: "High" },
        { day: "Wednesday", focus: "Ball Skills", session: "Dribbling + Passing Drills", duration: "50 min", intensity: "Medium" },
        { day: "Thursday", focus: "Conditioning", session: "Interval Runs (field lengths)", duration: "40 min", intensity: "High" },
        { day: "Friday", focus: "Recovery", session: "Light Jog + Stretching", duration: "25 min", intensity: "Low" },
        { day: "Saturday", focus: "Match Practice", session: "11v11 Scrimmage", duration: "90 min", intensity: "High" },
        { day: "Sunday", focus: "Regeneration", session: "Yoga + Foam Rolling", duration: "30 min", intensity: "Low" },
      ],
    },
  };

  const currentPlan = plans[selectedSport as keyof typeof plans]?.[selectedGoal as keyof typeof plans.running] || plans.running.endurance;

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
              <p className="text-muted-foreground">Personalized training schedule</p>
            </div>
            <div className="flex gap-3">
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="strength">Strength Training</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="power">Power</SelectItem>
                  <SelectItem value="technique">Technique</SelectItem>
                  <SelectItem value="prevention">Prevention</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
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
                  <Badge 
                    variant={
                      day.intensity === "High" 
                        ? "destructive" 
                        : day.intensity === "Medium" 
                        ? "default" 
                        : "secondary"
                    }
                  >
                    {day.intensity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{day.session}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{day.duration}</span>
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
