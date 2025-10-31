import { useState, useEffect } from "react";
import { TrainingSession, loadSessions, saveSessions } from "@/lib/athleteVision";

export function useTrainingSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  const addSession = (session: TrainingSession) => {
    const updated = [...sessions, session];
    setSessions(updated);
    saveSessions(updated);
  };

  const addSessions = (newSessions: TrainingSession[]) => {
    const updated = [...sessions, ...newSessions];
    setSessions(updated);
    saveSessions(updated);
  };

  const clearSessions = () => {
    setSessions([]);
    saveSessions([]);
  };

  return { sessions, addSession, addSessions, clearSessions };
}
