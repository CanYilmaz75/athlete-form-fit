import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Feedback = () => {
  const navigate = useNavigate();
  const [fatigue, setFatigue] = useState([5]);
  const [pain, setPain] = useState([2]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Feedback submitted! Your next plan will be adjusted.");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/improvement-plan")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Weekly Feedback</h1>
              <p className="text-muted-foreground">Share your experience from this week</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>How was your training week?</CardTitle>
            <CardDescription>Your feedback helps us optimize your next improvement plan</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fatigue Level */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="fatigue">Overall Fatigue Level</Label>
                  <span className="text-sm font-medium text-primary">{fatigue[0]}/10</span>
                </div>
                <Slider
                  id="fatigue"
                  min={1}
                  max={10}
                  step={1}
                  value={fatigue}
                  onValueChange={setFatigue}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Fresh & Energized</span>
                  <span>Moderate</span>
                  <span>Completely Exhausted</span>
                </div>
              </div>

              {/* Pain Level */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="pain">Pain or Discomfort Level</Label>
                  <span className="text-sm font-medium text-primary">{pain[0]}/10</span>
                </div>
                <Slider
                  id="pain"
                  min={0}
                  max={10}
                  step={1}
                  value={pain}
                  onValueChange={setPain}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>No Pain</span>
                  <span>Mild Discomfort</span>
                  <span>Severe Pain</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific issues, achievements, or observations from this week..."
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Example: "Left knee felt tight after intervals" or "Hit a new PR on my long run!"
                </p>
              </div>

              {/* Difficulty Assessment */}
              <div className="space-y-2">
                <Label>How challenging was this week's plan?</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button type="button" variant="outline" className="h-auto py-4 flex flex-col gap-2">
                    <span className="text-2xl">😊</span>
                    <span className="text-xs">Too Easy</span>
                  </Button>
                  <Button type="button" variant="outline" className="h-auto py-4 flex flex-col gap-2 border-primary bg-primary/5">
                    <span className="text-2xl">💪</span>
                    <span className="text-xs">Just Right</span>
                  </Button>
                  <Button type="button" variant="outline" className="h-auto py-4 flex flex-col gap-2">
                    <span className="text-2xl">😰</span>
                    <span className="text-xs">Too Hard</span>
                  </Button>
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full gap-2">
                <Send className="h-4 w-4" />
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground">
              <span className="font-semibold text-primary">💡 How it works:</span> Based on your feedback,
              our algorithm will automatically adjust your next week's training load, intensity, and recovery
              sessions to optimize your performance and prevent injury.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Feedback;
