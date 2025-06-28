// src/hooks/useSessionTracking.tsx - COMPLETE FIXED VERSION
import { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  location?: { latitude: number; longitude: number };
  type: "morning" | "evening" | "manual";
  inMorningPrime?: boolean;
  inEveningPrime?: boolean;
  qualifiesForStreak?: boolean;
}

interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-7 scale
  timestamp: Date;
}

interface StatsData {
  dayStreak: number;
  weeklyMinutes: number;
  primeMinutes: number;
  primeMinutesYesterday: number;
  weeklyMinutesLastWeek: number;
  pulseScores: { sleep: number; mood: number; energy: number; focus: number };
  pulseScoresYesterday: {
    sleep: number;
    mood: number;
    energy: number;
    focus: number;
  };
  sessions: Session[];
}

interface Location {
  latitude: number;
  longitude: number;
}

export const useSessionTracking = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  useEffect(() => {
    loadData();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (sessions.length > 0 || currentSession) {
      saveData();
      calculateStats();
    }
  }, [sessions, moodEntries, currentSession]);

  // 📍 GPS LOCATION FUNCTION
  const getCurrentLocation = async () => {
    try {
      if ("geolocation" in navigator) {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: false,
            });
          }
        );

        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(location);
        console.log("📍 GPS location:", location);
        return location;
      } else {
        throw new Error("Geolocation not supported");
      }
    } catch (error) {
      console.log("⚠️ GPS failed, using Providence, RI fallback:", error);
      const fallback = { latitude: 41.8236, longitude: -71.4222 };
      setUserLocation(fallback);
      return fallback;
    }
  };

  // 🌅 SUN TIME CALCULATION
  const calculateSunTimes = (location: Location, date: Date) => {
    const lat = location.latitude;
    const lon = location.longitude;

    // Simplified calculation for summer months
    // For Providence area in June: Sunrise ~5:14 AM, Sunset ~8:14 PM
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
    );

    // Basic approximation (for production, use SunCalc library)
    let sunriseHours = 5.23; // ~5:14 AM
    let sunsetHours = 20.23; // ~8:14 PM

    // Adjust slightly based on latitude (very simplified)
    if (lat > 42) {
      // Further north
      sunriseHours -= 0.2;
      sunsetHours += 0.2;
    } else if (lat < 40) {
      // Further south
      sunriseHours += 0.2;
      sunsetHours -= 0.2;
    }

    console.log(
      `🌅 Calculated sun times for lat ${lat.toFixed(
        2
      )}: Sunrise ${sunriseHours.toFixed(2)}, Sunset ${sunsetHours.toFixed(2)}`
    );

    return { sunriseHours, sunsetHours };
  };

  // 🕰️ PRIME WINDOW CALCULATION
  const getPrimeWindows = () => {
    if (!userLocation) {
      // Fallback to Providence times
      return {
        morningStart: 4.98, // 15 min before 5:14 AM
        morningEnd: 7.48, // 2h 15m after 5:14 AM
        eveningStart: 18.23, // 2h before 8:14 PM
        eveningEnd: 20.48, // 15 min after 8:14 PM
      };
    }

    const sunTimes = calculateSunTimes(userLocation, new Date());

    return {
      morningStart: sunTimes.sunriseHours - 15 / 60, // 15 min before sunrise
      morningEnd: sunTimes.sunriseHours + 135 / 60, // 2h 15m after sunrise
      eveningStart: sunTimes.sunsetHours - 120 / 60, // 2h before sunset
      eveningEnd: sunTimes.sunsetHours + 15 / 60, // 15 min after sunset
    };
  };

  const loadData = async () => {
    try {
      // Load sessions
      const { value: sessionsData } = await Preferences.get({
        key: "solcue-sessions",
      });
      if (sessionsData) {
        const parsed = JSON.parse(sessionsData);
        setSessions(
          parsed.map((s: any) => ({
            ...s,
            startTime: new Date(s.startTime),
            endTime: s.endTime ? new Date(s.endTime) : undefined,
          }))
        );
      }

      // Load current session
      const { value: currentSessionData } = await Preferences.get({
        key: "solcue-current-session",
      });
      if (currentSessionData) {
        const parsed = JSON.parse(currentSessionData);
        setCurrentSession({
          ...parsed,
          startTime: new Date(parsed.startTime),
        });
        console.log("📱 Restored session from storage:", parsed.id);
      }
    } catch (error) {
      console.error("❌ Failed to load data:", error);
    }
  };

  const saveData = async () => {
    try {
      // Save sessions array
      await Preferences.set({
        key: "solcue-sessions",
        value: JSON.stringify(sessions),
      });

      // Save current session
      if (currentSession) {
        await Preferences.set({
          key: "solcue-current-session",
          value: JSON.stringify(currentSession),
        });
      } else {
        await Preferences.remove({ key: "solcue-current-session" });
      }
    } catch (error) {
      console.error("❌ Failed to save data:", error);
    }
  };

  // 🔧 FIXED: Save in StatsPage format with correct data
  const saveStatsPageFormat = async (sessionsToSave: Session[]) => {
    try {
      console.log("💾 Saving in StatsPage format...");

      // Group sessions by date - ONLY count prime time minutes
      const dailyPrimeTotals = new Map<string, number>();

      sessionsToSave.forEach((session) => {
        if (!session.duration) return;

        const dateKey = session.startTime.toDateString();

        // ONLY count minutes if session was in prime window
        if (session.inMorningPrime || session.inEveningPrime) {
          const existing = dailyPrimeTotals.get(dateKey) || 0;
          dailyPrimeTotals.set(dateKey, existing + session.duration);
        }
      });

      // Save ONLY prime minutes (this is what stats should show)
      for (const [dateString, primeMinutes] of dailyPrimeTotals) {
        await Preferences.set({
          key: `outsideTime_${dateString}`,
          value: primeMinutes.toString(),
        });

        await Preferences.set({
          key: `primeTime_${dateString}`,
          value: primeMinutes.toString(),
        });
      }

      // Save streak (only prime time counts for streak)
      const streak = calculateStreak(sessionsToSave);
      await Preferences.set({
        key: "dayStreak",
        value: streak.toString(),
      });

      console.log(
        "✅ StatsPage format saved. Prime time totals:",
        Array.from(dailyPrimeTotals.entries())
      );
    } catch (error) {
      console.error("❌ Error saving StatsPage format:", error);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ONLY count prime time minutes for stats
    const primeMinutes = sessions
      .filter(
        (s) =>
          s.startTime >= oneWeekAgo &&
          s.duration &&
          (s.inMorningPrime || s.inEveningPrime)
      )
      .reduce((total, s) => total + (s.duration || 0), 0);

    const dayStreak = calculateStreak(sessions);

    setStats({
      dayStreak,
      weeklyMinutes: primeMinutes, // This should be PRIME minutes only
      primeMinutes,
      primeMinutesYesterday: 0,
      weeklyMinutesLastWeek: 0,
      pulseScores: { sleep: 5, mood: 5, energy: 5, focus: 5 },
      pulseScoresYesterday: { sleep: 5, mood: 5, energy: 5, focus: 5 },
      sessions,
    });
  };

  // 🔧 FIXED: Only count prime time for streak
  const calculateStreak = (sessionsArray: Session[]) => {
    if (sessionsArray.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const nextDay = new Date(checkDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // ONLY count sessions in prime windows with 10+ minutes
      const hasQualifyingSession = sessionsArray.some(
        (session) =>
          session.startTime >= checkDate &&
          session.startTime < nextDay &&
          session.duration &&
          session.duration >= 10 &&
          (session.inMorningPrime || session.inEveningPrime) // MUST be in prime window
      );

      if (hasQualifyingSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  };

  const startSession = (type: "morning" | "evening" | "manual") => {
    const now = new Date();
    const currentHours = now.getHours() + now.getMinutes() / 60;

    // 🔧 FIXED: Use real GPS-based prime windows
    const primeWindows = getPrimeWindows();

    const inMorningPrime =
      currentHours >= primeWindows.morningStart &&
      currentHours <= primeWindows.morningEnd;
    const inEveningPrime =
      currentHours >= primeWindows.eveningStart &&
      currentHours <= primeWindows.eveningEnd;

    console.log(
      `⏰ Current time: ${currentHours.toFixed(
        2
      )} hours (${now.toLocaleTimeString()})`
    );
    console.log(
      `🌅 Morning prime: ${primeWindows.morningStart.toFixed(
        2
      )} - ${primeWindows.morningEnd.toFixed(2)} (${
        inMorningPrime ? "ACTIVE" : "inactive"
      })`
    );
    console.log(
      `🌇 Evening prime: ${primeWindows.eveningStart.toFixed(
        2
      )} - ${primeWindows.eveningEnd.toFixed(2)} (${
        inEveningPrime ? "ACTIVE" : "inactive"
      })`
    );

    const newSession: Session = {
      id: Date.now().toString(),
      startTime: now,
      type,
      location: userLocation || undefined,
      inMorningPrime,
      inEveningPrime,
      qualifiesForStreak: inMorningPrime || inEveningPrime, // Only prime time qualifies
    };

    setCurrentSession(newSession);
    console.log("🚀 Session started:", newSession.id, "Type:", type);
    console.log("📊 Prime status:", {
      inMorningPrime,
      inEveningPrime,
      qualifiesForStreak: newSession.qualifiesForStreak,
    });
    return newSession.id;
  };

  // 🔧 FIXED: Better endSession with immediate data saving
  const endSession = async () => {
    if (!currentSession) {
      console.warn("⚠️ No current session to end");
      return;
    }

    const endTime = new Date();
    const duration = Math.round(
      (endTime.getTime() - currentSession.startTime.getTime()) / 1000 / 60
    );

    const completedSession: Session = {
      ...currentSession,
      endTime,
      duration,
    };

    console.log(
      "🏁 Session completed:",
      completedSession.id,
      "Duration:",
      duration,
      "minutes"
    );

    // 🚀 CRITICAL FIX: Update sessions AND save StatsPage format immediately
    const newSessions = [completedSession, ...sessions];

    try {
      // Save sessions array immediately
      await Preferences.set({
        key: "solcue-sessions",
        value: JSON.stringify(newSessions),
      });

      // 🚀 CRITICAL: Save in StatsPage format with the updated sessions array
      await saveStatsPageFormat(newSessions);

      // Remove current session
      await Preferences.remove({ key: "solcue-current-session" });

      // Update state (this will trigger the useEffect, but data is already saved)
      setSessions(newSessions);
      setCurrentSession(null);

      console.log("✅ Session saved and StatsPage format updated!");
    } catch (error) {
      console.error("❌ Error ending session:", error);
    }

    return completedSession;
  };

  const getCurrentSessionElapsed = () => {
    if (!currentSession) return 0;
    return Math.floor(
      (new Date().getTime() - currentSession.startTime.getTime()) / 1000
    );
  };

  const addMoodEntry = (mood: number) => {
    const now = new Date();
    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: now.toDateString(),
      mood,
      timestamp: now,
    };

    setMoodEntries((prev) => [entry, ...prev]);
    return entry;
  };

  return {
    sessions,
    currentSession,
    startSession,
    endSession,
    stats,
    moodEntries,
    addMoodEntry,
    getCurrentSessionElapsed,
    isTracking: !!currentSession,
    loadData,
    saveData,
  };
};
