import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const DataInput = () => {
  const navigate = useNavigate();
  const [rpe, setRpe] = useState([5]);
  const [soreness, setSoreness] = useState([3]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Training session saved successfully!");
    navigate("/");
  };

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
              <h1 className="text-2xl font-bold text-foreground">Add Training Session</h1>
              <p className="text-muted-foreground">Record your training data</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="grid gap-6">
          {/* Manual Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle>Training Details</CardTitle>
              <CardDescription>Enter your session information manually</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>

                  {/* Sport Type */}
                  <div className="space-y-2">
                    <Label htmlFor="sport">Sport Type</Label>
                    <Select defaultValue="running">
                      <SelectTrigger id="sport">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="strength">Strength Training</SelectItem>
                        <SelectItem value="football">Football</SelectItem>
                        <SelectItem value="basketball">Basketball</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input id="duration" type="number" placeholder="45" min="1" />
                  </div>

                  {/* Distance */}
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (km)</Label>
                    <Input id="distance" type="number" step="0.1" placeholder="5.0" min="0" />
                  </div>

                  {/* Heart Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="hr">Avg Heart Rate (bpm)</Label>
                    <Input id="hr" type="number" placeholder="145" min="40" max="220" />
                  </div>

                  {/* HRV */}
                  <div className="space-y-2">
                    <Label htmlFor="hrv">HRV (ms)</Label>
                    <Input id="hrv" type="number" placeholder="55" min="0" />
                  </div>

                  {/* Sleep */}
                  <div className="space-y-2">
                    <Label htmlFor="sleep">Sleep (hours)</Label>
                    <Input id="sleep" type="number" step="0.5" placeholder="7.5" min="0" max="12" />
                  </div>

                  {/* Goal */}
                  <div className="space-y-2">
                    <Label htmlFor="goal">Training Goal</Label>
                    <Select defaultValue="endurance">
                      <SelectTrigger id="goal">
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

                {/* RPE Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="rpe">Rate of Perceived Exertion (RPE)</Label>
                    <span className="text-sm font-medium text-primary">{rpe[0]}/10</span>
                  </div>
                  <Slider
                    id="rpe"
                    min={1}
                    max={10}
                    step={1}
                    value={rpe}
                    onValueChange={setRpe}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Easy</span>
                    <span>Moderate</span>
                    <span>Maximum</span>
                  </div>
                </div>

                {/* Soreness Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="soreness">Muscle Soreness</Label>
                    <span className="text-sm font-medium text-primary">{soreness[0]}/10</span>
                  </div>
                  <Slider
                    id="soreness"
                    min={1}
                    max={10}
                    step={1}
                    value={soreness}
                    onValueChange={setSoreness}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>No Soreness</span>
                    <span>Moderate</span>
                    <span>Very Sore</span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 gap-2">
                    <Save className="h-4 w-4" />
                    Save Training Session
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* CSV Upload Option */}
          <Card>
            <CardHeader>
              <CardTitle>Import from CSV</CardTitle>
              <CardDescription>Upload training data from Strava, Garmin, or Apple Health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <Button variant="outline" className="mt-2">
                  Select File
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DataInput;
