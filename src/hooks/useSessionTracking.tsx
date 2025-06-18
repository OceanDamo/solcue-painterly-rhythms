
import { useState, useEffect } from 'react';

interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  location?: { latitude: number; longitude: number };
  type: 'morning' | 'evening' | 'manual';
}

export const useSessionTracking = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('solcue-sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed.map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined
        })));
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem('solcue-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const startSession = (type: 'morning' | 'evening' | 'manual', location?: { latitude: number; longitude: number }) => {
    const newSession: Session = {
      id: Date.now().toString(),
      startTime: new Date(),
      location,
      type
    };
    
    setCurrentSession(newSession);
    return newSession.id;
  };

  const endSession = () => {
    if (!currentSession) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - currentSession.startTime.getTime()) / 1000 / 60); // minutes

    const completedSession: Session = {
      ...currentSession,
      endTime,
      duration
    };

    setSessions(prev => [completedSession, ...prev]);
    setCurrentSession(null);
    
    return completedSession;
  };

  const addManualSession = (duration: number, date: Date, location?: { latitude: number; longitude: number }) => {
    const session: Session = {
      id: Date.now().toString(),
      startTime: date,
      endTime: new Date(date.getTime() + duration * 60 * 1000),
      duration,
      location,
      type: 'manual'
    };

    setSessions(prev => [session, ...prev]);
    return session;
  };

  const getWeeklyMinutes = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return sessions
      .filter(session => session.startTime >= oneWeekAgo && session.duration)
      .reduce((total, session) => total + (session.duration || 0), 0);
  };

  const getCurrentStreak = () => {
    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const nextDay = new Date(checkDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const hasSession = sessions.some(session => 
        session.startTime >= checkDate && session.startTime < nextDay
      );

      if (hasSession) {
        streak++;
      } else if (i === 0) {
        // If no session today, check yesterday
        continue;
      } else {
        break;
      }
    }

    return streak;
  };

  return {
    sessions,
    currentSession,
    startSession,
    endSession,
    addManualSession,
    getWeeklyMinutes,
    getCurrentStreak
  };
};
