import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";
import { analyzeTraining, parseCSV, saveMetrics, TrainingSession } from "@/lib/athleteVision";

const DataInput = () => {
  const navigate = useNavigate();
  const { sessions, addSession, addSessions } = useTrainingSessions();
  const [rpe, setRpe] = useState([5]);
  const [soreness, setSoreness] = useState([3]);
  const [sport, setSport] = useState("Running");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const session: TrainingSession = {
        date: formData.get('date') as string,
        sport: sport,
        duration_min: parseFloat(formData.get('duration') as string),
        rpe_1_10: rpe[0],
        distance_km: parseFloat(formData.get('distance') as string) || undefined,
        avg_hr_bpm: parseFloat(formData.get('hr') as string) || undefined,
        sleep_hours: parseFloat(formData.get('sleep') as string) || 7.0,
        hrv_ms: parseFloat(formData.get('hrv') as string) || undefined,
        soreness_1_10: soreness[0],
        notes: formData.get('notes') as string || undefined,
      };

      addSession(session);

      // Analyze with updated sessions
      const today = new Date().toISOString().split('T')[0];
      const metrics = await analyzeTraining(today, [...sessions, session]);
      saveMetrics(metrics);

      toast.success("Training session saved and analyzed!");
      navigate("/");
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error("Failed to save session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const parsedSessions = parseCSV(text);
      
      if (parsedSessions.length === 0) {
        toast.error("No valid sessions found in CSV");
        return;
      }

      addSessions(parsedSessions);

      // Analyze with all sessions
      const today = new Date().toISOString().split('T')[0];
      const metrics = await analyzeTraining(today, [...sessions, ...parsedSessions]);
      saveMetrics(metrics);

      toast.success(`Imported ${parsedSessions.length} sessions successfully!`);
      navigate("/");
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error("Failed to parse CSV. Please check the format.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Sport Type */}
                  <div className="space-y-2">
                    <Label htmlFor="sport">Sport Type</Label>
                    <Select value={sport} onValueChange={setSport}>
                      <SelectTrigger id="sport">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Running">Running</SelectItem>
                        <SelectItem value="Strength">Strength Training</SelectItem>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Basketball">Basketball</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input id="duration" name="duration" type="number" placeholder="45" min="1" required />
                  </div>

                  {/* Distance */}
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (km)</Label>
                    <Input id="distance" name="distance" type="number" step="0.1" placeholder="5.0" min="0" />
                  </div>

                  {/* Heart Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="hr">Avg Heart Rate (bpm)</Label>
                    <Input id="hr" name="hr" type="number" placeholder="145" min="40" max="220" />
                  </div>

                  {/* HRV */}
                  <div className="space-y-2">
                    <Label htmlFor="hrv">HRV (ms)</Label>
                    <Input id="hrv" name="hrv" type="number" placeholder="55" min="0" />
                  </div>

                  {/* Sleep */}
                  <div className="space-y-2">
                    <Label htmlFor="sleep">Sleep (hours)</Label>
                    <Input id="sleep" name="sleep" type="number" step="0.5" placeholder="7.5" min="0" max="12" />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Input id="notes" name="notes" type="text" placeholder="Session details or feelings..." />
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
                  <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                    <Save className="h-4 w-4" />
                    {loading ? "Saving..." : "Save & Analyze"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/")} disabled={loading}>
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
              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload CSV with columns: date, sport, duration_min, rpe_1_10, distance_km, avg_hr_bpm, sleep_hours, hrv_ms, soreness_1_10
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                  disabled={loading}
                />
                <Button 
                  variant="outline" 
                  className="mt-2" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Select CSV File"}
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
