import React, { useState, useEffect } from "react";
import { Plus, Bed, Heart, Zap, Brain } from "lucide-react";

interface StatsPageProps {
  currentTime?: Date;
}

interface Stats {
  dayStreak: number;
  primeMinutesToday: number;
  weeklyMinutes: number;
  totalSessions: number;
  lastSessionDate: string;
  primeMinutesYesterday: number;
  weeklyMinutesLastWeek: number;
}

interface PulseScores {
  sleep: number;
  mood: number;
  energy: number;
  focus: number;
}

// Real stats loading with proper error handling
const useStatsData = () => {
  const [stats, setStats] = useState<Stats>({
    dayStreak: 0,
    primeMinutesToday: 0,
    weeklyMinutes: 0,
    totalSessions: 0,
    lastSessionDate: "",
    primeMinutesYesterday: 0,
    weeklyMinutesLastWeek: 0,
  });

  const loadStats = async () => {
    try {
      const { Preferences } = await import("@capacitor/preferences");

      // Load day streak
      const streakResult = await Preferences.get({ key: "dayStreak" });
      const dayStreak = streakResult.value ? parseInt(streakResult.value) : 0;

      // Calculate today's prime minutes
      const today = new Date().toDateString();
      const primeResult = await Preferences.get({ key: `primeTime_${today}` });
      const primeMinutesToday = primeResult.value
        ? parseInt(primeResult.value)
        : 0;

      // Calculate weekly totals (last 7 days)
      let weeklyMinutes = 0;
      let totalSessions = 0;
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();

        const dayResult = await Preferences.get({
          key: `outsideTime_${dateStr}`,
        });
        const dayMinutes = dayResult.value ? parseInt(dayResult.value) : 0;
        weeklyMinutes += dayMinutes;

        const sessionsResult = await Preferences.get({
          key: `sessions_${dateStr}`,
        });
        if (sessionsResult.value) {
          const sessions = JSON.parse(sessionsResult.value);
          totalSessions += sessions.length;
        }
      }

      // Get yesterday's prime minutes
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayPrimeResult = await Preferences.get({
        key: `primeTime_${yesterday.toDateString()}`,
      });
      const primeMinutesYesterday = yesterdayPrimeResult.value
        ? parseInt(yesterdayPrimeResult.value)
        : 0;

      // Calculate last week's total
      let weeklyMinutesLastWeek = 0;
      for (let i = 7; i < 14; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();

        const dayResult = await Preferences.get({
          key: `outsideTime_${dateStr}`,
        });
        const dayMinutes = dayResult.value ? parseInt(dayResult.value) : 0;
        weeklyMinutesLastWeek += dayMinutes;
      }

      setStats({
        dayStreak,
        primeMinutesToday,
        weeklyMinutes,
        totalSessions,
        lastSessionDate: today,
        primeMinutesYesterday,
        weeklyMinutesLastWeek,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return { stats, loadStats };
};

// Pulse scores with real data loading
const usePulseScores = () => {
  const [pulseScores, setPulseScores] = useState<PulseScores>({
    sleep: 0,
    mood: 0,
    energy: 0,
    focus: 0,
  });

  const loadPulseScores = async () => {
    try {
      const { Preferences } = await import("@capacitor/preferences");
      const today = new Date().toDateString();

      const categories = ["sleep", "mood", "energy", "focus"];
      const scores: PulseScores = { sleep: 0, mood: 0, energy: 0, focus: 0 };

      for (const category of categories) {
        const result = await Preferences.get({
          key: `checkIn_${category}_${today}`,
        });
        if (result.value) {
          const data = JSON.parse(result.value);
          scores[category as keyof PulseScores] = data.score || 0;
        }
      }

      setPulseScores(scores);
    } catch (error) {
      console.error("Error loading pulse scores:", error);
    }
  };

  const savePulseScore = async (category: keyof PulseScores, score: number) => {
    try {
      const { Preferences } = await import("@capacitor/preferences");
      const today = new Date().toDateString();

      const checkInData = {
        category,
        score,
        timestamp: new Date().toISOString(),
        date: today,
      };

      await Preferences.set({
        key: `checkIn_${category}_${today}`,
        value: JSON.stringify(checkInData),
      });

      setPulseScores((prev) => ({ ...prev, [category]: score }));
      console.log(`✅ Saved ${category} score: ${score}`);
    } catch (error) {
      console.error(`❌ Error saving ${category} score:`, error);
    }
  };

  return { pulseScores, loadPulseScores, savePulseScore };
};

const StatsPage: React.FC<StatsPageProps> = ({ currentTime = new Date() }) => {
  const { stats, loadStats } = useStatsData();
  const { pulseScores, loadPulseScores, savePulseScore } = usePulseScores();
  const [showAddSession, setShowAddSession] = useState(false);

  // Get current time info for colors and sunrise/sunset
  const hours = currentTime.getHours();

  // Enhanced time-based color system (RESTORED)
  const getTimeColors = () => {
    if (hours >= 5 && hours < 8) {
      return {
        primary: "from-gray-900 via-gray-800 to-black",
        secondary: "from-orange-900/20 via-amber-900/15 to-yellow-900/10",
        accent:
          "bg-gradient-to-br from-amber-600/80 via-orange-600/80 to-rose-600/80",
        glow: "shadow-orange-600/30",
        atmospheric: "from-orange-400/10 via-pink-400/8 to-yellow-400/5",
        textured: "from-amber-600/15 via-orange-500/20 to-rose-500/15",
      };
    } else if (hours >= 8 && hours < 17) {
      return {
        primary: "from-gray-900 via-gray-800 to-black",
        secondary: "from-blue-900/20 via-cyan-900/15 to-teal-900/10",
        accent:
          "bg-gradient-to-br from-cyan-600/80 via-blue-600/80 to-indigo-600/80",
        glow: "shadow-blue-600/30",
        atmospheric: "from-cyan-400/10 via-blue-400/8 to-sky-400/5",
        textured: "from-blue-600/15 via-cyan-500/20 to-teal-500/15",
      };
    } else if (hours >= 17 && hours < 20) {
      return {
        primary: "from-gray-900 via-gray-800 to-black",
        secondary: "from-red-900/20 via-orange-900/15 to-pink-900/10",
        accent:
          "bg-gradient-to-br from-orange-600/80 via-red-600/80 to-purple-600/80",
        glow: "shadow-red-600/30",
        atmospheric: "from-red-400/10 via-orange-400/8 to-purple-400/5",
        textured: "from-red-600/15 via-orange-500/20 to-pink-500/15",
      };
    } else {
      return {
        primary: "from-gray-900 via-gray-800 to-black",
        secondary: "from-indigo-900/20 via-purple-900/15 to-blue-900/10",
        accent:
          "bg-gradient-to-br from-indigo-600/80 via-purple-600/80 to-slate-600/80",
        glow: "shadow-purple-600/30",
        atmospheric: "from-indigo-400/10 via-purple-400/8 to-slate-400/5",
        textured: "from-indigo-600/15 via-purple-500/20 to-blue-600/15",
      };
    }
  };

  const colors = getTimeColors();

  const getProgressColor = (progress: number) => {
    if (progress < 0.3) return "from-blue-600 to-cyan-600";
    if (progress < 0.7) return "from-yellow-600 to-orange-600";
    return "from-orange-600 to-rose-600";
  };

  // Auto-refresh every 5 minutes (CHANGED FROM 30 seconds)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadStats();
      loadPulseScores();
    }, 5 * 60 * 1000); // 5 minutes = 5 * 60 * 1000 milliseconds

    return () => clearInterval(refreshInterval);
  }, []);

  // Initial load
  useEffect(() => {
    loadStats();
    loadPulseScores();
  }, []);

  // Comprehensive circadian benefits with scientific evidence (RESTORED)
  const circadianBenefits = [
    {
      id: 1,
      name: "Dream Fuel",
      description: "Sleep Quality Enhancement",
      requiredDays: 3,
      currentDays: Math.min(stats.dayStreak, 3),
      state:
        stats.dayStreak >= 3
          ? "harmony"
          : stats.dayStreak > 0
          ? "flowing"
          : "invitation",
      shortTip:
        "Just 10–30 minutes of morning sunlight helps you fall asleep faster.",
      evidence:
        "Light exposure within 2 hours of waking helps regulate melatonin production and circadian rhythm, improving sleep quality in 2-4 days.",
    },
    {
      id: 2,
      name: "Sunshine Boost",
      description: "Mood Regulation",
      requiredDays: 4,
      currentDays: Math.min(stats.dayStreak, 4),
      state:
        stats.dayStreak >= 4
          ? "harmony"
          : stats.dayStreak > 0
          ? "flowing"
          : "invitation",
      shortTip: "A short sunrise walk boosts serotonin in just 4 days.",
      evidence:
        "20+ minutes of outdoor light for 4 consecutive days increases serotonin production and supports positive mood regulation.",
    },
    {
      id: 3,
      name: "Brain Bright",
      description: "Cognitive Performance",
      requiredDays: 2,
      currentDays: Math.min(stats.dayStreak, 2),
      state:
        stats.dayStreak >= 2
          ? "harmony"
          : stats.dayStreak > 0
          ? "flowing"
          : "invitation",
      shortTip: "Just two days of morning sunlight can boost memory and focus.",
      evidence:
        "Morning light exposure for 2+ days enhances cognitive function through improved circadian rhythm regulation.",
    },
    {
      id: 4,
      name: "Gut Glow",
      description: "Digestive Health",
      requiredDays: 3,
      currentDays: Math.min(stats.dayStreak, 3),
      state:
        stats.dayStreak >= 3
          ? "harmony"
          : stats.dayStreak > 0
          ? "flowing"
          : "invitation",
      shortTip: "Morning light helps your gut reset its rhythm in 3–4 days.",
      evidence:
        "Light exposure helps synchronize gut microbiome circadian rhythms, improving digestive function within 3-4 days.",
    },
    {
      id: 5,
      name: "Shield Mode",
      description: "Immune Function",
      requiredDays: 4,
      currentDays: Math.min(stats.dayStreak, 4),
      state:
        stats.dayStreak >= 4
          ? "harmony"
          : stats.dayStreak > 0
          ? "flowing"
          : "invitation",
      shortTip:
        "Four days of sunlight supports immune system and fights inflammation.",
      evidence:
        "4+ days of consistent light exposure strengthens immune function through vitamin D synthesis and circadian regulation.",
    },
    {
      id: 6,
      name: "Crave Control",
      description: "Metabolic Health",
      requiredDays: 7,
      currentDays: Math.min(stats.dayStreak, 7),
      state:
        stats.dayStreak >= 7
          ? "harmony"
          : stats.dayStreak > 0
          ? "flowing"
          : "invitation",
      shortTip:
        "Early sunlight for 1 week helps reset appetite and reduce cravings.",
      evidence:
        "7 days of morning light exposure regulates appetite hormones and improves metabolic function through circadian clock genes.",
    },
    {
      id: 7,
      name: "Energy Flow",
      description: "Hormonal Balance",
      requiredDays: 5,
      currentDays: Math.min(stats.dayStreak, 5),
      state:
        stats.dayStreak >= 5
          ? "harmony"
          : stats.dayStreak > 0
          ? "flowing"
          : "invitation",
      shortTip:
        "Morning light helps regulate cortisol and sex hormones in under a week.",
      evidence:
        "5+ days of morning light exposure optimizes cortisol rhythm and supports healthy hormone production.",
    },
    {
      id: 8,
      name: "Heart Sync",
      description: "Cardiovascular Health",
      requiredDays: 5,
      currentDays: Math.min(stats.dayStreak, 5),
      state:
        stats.dayStreak >= 5
          ? "harmony"
          : stats.dayStreak > 0
          ? "flowing"
          : "invitation",
      shortTip:
        "Morning light lowers blood pressure and supports heart rhythm.",
      evidence:
        "5+ days of light exposure improves cardiovascular health through blood pressure regulation and heart rate variability.",
    },
    {
      id: 9,
      name: "Chill Shield",
      description: "Stress Resilience",
      requiredDays: 5,
      currentDays: Math.min(stats.dayStreak, 5),
      state:
        stats.dayStreak >= 5
          ? "harmony"
          : stats.dayStreak > 0
          ? "flowing"
          : "invitation",
      shortTip: "10 minutes of early sun for 3–5 days reduces cortisol spikes.",
      evidence:
        "3-5 days of morning light exposure reduces stress hormone reactivity and improves stress resilience.",
    },
  ];

  const getStateStyles = (state: string, progress: number) => {
    switch (state) {
      case "invitation":
        return {
          bg: "bg-black/60 border-white/20",
          glow: "",
          animation: "",
          text: "text-white/90",
          status: "🌅 Open",
        };
      case "flowing":
        return {
          bg: `bg-gradient-to-br ${colors.textured} bg-black/60 border-yellow-400/20`,
          glow: colors.glow,
          animation: "",
          text: "text-white",
          status: "🌊 Flowing",
        };
      case "harmony":
        return {
          bg: `bg-gradient-to-br ${colors.accent} bg-black/60 border-white/30`,
          glow: `${colors.glow} shadow-xl`,
          animation: "",
          text: "text-white",
          status: "✨ Harmony",
        };
      default:
        return {
          bg: "bg-black/60 border-white/20",
          glow: "",
          animation: "",
          text: "text-white/90",
          status: "🌅 Open",
        };
    }
  };

  const pulseCategories = [
    { key: "sleep" as const, label: "Sleep", icon: Bed },
    { key: "mood" as const, label: "Mood", icon: Heart },
    { key: "energy" as const, label: "Energy", icon: Zap },
    { key: "focus" as const, label: "Focus", icon: Brain },
  ];

  const handleSaveAllPulseScores = async () => {
    console.log("✅ All pulse scores already saved individually");
    // Refresh stats to ensure UI is up to date
    await loadStats();
    await loadPulseScores();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 p-6 text-white">
      <div className="max-w-2xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
          <p className="text-blue-200">Track your circadian rhythm journey</p>
        </div>

        {/* Core Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.dayStreak}
            </div>
            <div className="text-sm text-gray-300">Day Streak</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-blue-400">
              {stats.primeMinutesToday}
            </div>
            <div className="text-sm text-gray-300">Prime Min Today</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-green-400">
              {stats.weeklyMinutes}
            </div>
            <div className="text-sm text-gray-300">Weekly Total</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-purple-400">
              {stats.totalSessions}
            </div>
            <div className="text-sm text-gray-300">Total Sessions</div>
          </div>
        </div>

        {/* Add Session Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowAddSession(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full text-white font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-lg border border-white/20"
          >
            <Plus className="w-5 h-5" />
            Add Light Session
          </button>
        </div>

        {/* Simple Add Session Modal */}
        {showAddSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-white/20">
              <h3 className="text-xl font-bold mb-4 text-center">
                Add Light Session
              </h3>

              {/* Import and use the working SimpleAddSession component */}
              <SimpleAddSession
                onClose={() => setShowAddSession(false)}
                onSessionAdded={() => {
                  setShowAddSession(false);
                  loadStats(); // Refresh stats after adding session
                }}
              />
            </div>
          </div>
        )}

        {/* Daily Pulse Check-in */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold mb-4 text-center">
            Daily Pulse Check-in
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Rate how you're feeling today (1-10)
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {pulseCategories.map(({ key, label, icon: Icon }) => (
              <div key={key} className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-3 mb-2 mx-auto w-fit">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium mb-2">{label}</div>

                {/* Score buttons */}
                <div className="flex flex-wrap justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      onClick={() => savePulseScore(key, score)}
                      className={`w-6 h-6 rounded text-xs font-medium transition-all ${
                        pulseScores[key] === score
                          ? "bg-white text-gray-900 scale-110"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>

                {/* Show last check-in */}
                {pulseScores[key] > 0 && (
                  <div className="text-xs text-gray-400">
                    Last Check-In: {pulseScores[key]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* FIXED: Save button now same width as Add Light Session button */}
          <div className="flex justify-center">
            <button
              onClick={handleSaveAllPulseScores}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg border border-white/20"
            >
              Save Check-in
            </button>
          </div>

          {/* REMOVED: Redundant "Tap Save Check-in" text eliminated */}
        </div>

        {/* RESTORED: Circadian Health Challenges */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold mb-4 text-center">
            Circadian Health Challenges
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Evidence-based benefits unlock as you build consistent light
            exposure habits
          </p>

          <div className="grid gap-4">
            {circadianBenefits.map((benefit) => {
              const progress = benefit.currentDays / benefit.requiredDays;
              const styles = getStateStyles(benefit.state, progress);

              return (
                <div
                  key={benefit.id}
                  className={`${styles.bg} ${styles.glow} rounded-lg p-4 border-2 transition-all duration-300`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className={`font-bold text-lg ${styles.text}`}>
                        {benefit.name}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {benefit.description}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-white/20 rounded-full">
                      {styles.status}
                    </span>
                  </div>

                  <p className={`text-sm mb-3 ${styles.text}`}>
                    {benefit.shortTip}
                  </p>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">
                      Progress: {benefit.currentDays}/{benefit.requiredDays}{" "}
                      days
                    </span>
                    <span className={`font-medium ${styles.text}`}>
                      {Math.round(progress * 100)}%
                    </span>
                  </div>

                  {benefit.state === "flowing" && (
                    <div className="mt-3 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressColor(
                          progress
                        )} transition-all duration-500`}
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2 italic">
                    {benefit.evidence}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Insights */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold mb-4">Weekly Insights</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">This Week's Light</span>
              <span className="font-medium">{stats.weeklyMinutes} minutes</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Last Week</span>
              <span className="font-medium">
                {stats.weeklyMinutesLastWeek} minutes
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Weekly Change</span>
              <span
                className={`font-medium ${
                  stats.weeklyMinutes >= stats.weeklyMinutesLastWeek
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {stats.weeklyMinutes >= stats.weeklyMinutesLastWeek ? "+" : ""}
                {stats.weeklyMinutes - stats.weeklyMinutesLastWeek} min
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Yesterday's Prime Light</span>
              <span className="font-medium text-blue-400">
                {stats.primeMinutesYesterday} minutes
              </span>
            </div>
          </div>
        </div>

        {/* Simple Add Session Modal */}
        {showAddSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-white/20">
              <h3 className="text-xl font-bold mb-4 text-center">
                Add Light Session
              </h3>

              {/* Import and use the working SimpleAddSession component */}
              <SimpleAddSession
                onClose={() => setShowAddSession(false)}
                onSessionAdded={() => {
                  setShowAddSession(false);
                  loadStats(); // Refresh stats after adding session
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Import the working SimpleAddSession component (you mentioned this is working)
const SimpleAddSession: React.FC<{
  onClose: () => void;
  onSessionAdded: () => void;
}> = ({ onClose, onSessionAdded }) => {
  const [selectedDate, setSelectedDate] = useState("today");
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("06:30");

  const handleAddSession = async () => {
    try {
      const { Preferences } = await import("@capacitor/preferences");

      // Calculate session date
      let sessionDate = new Date();
      if (selectedDate !== "today") {
        const daysAgo = parseInt(selectedDate);
        sessionDate.setDate(sessionDate.getDate() - daysAgo);
      }

      // Parse times
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);

      const startDateTime = new Date(sessionDate);
      startDateTime.setHours(startHour, startMin, 0, 0);

      const endDateTime = new Date(sessionDate);
      endDateTime.setHours(endHour, endMin, 0, 0);

      // Calculate duration
      const durationMs = endDateTime.getTime() - startDateTime.getTime();
      const minutes = Math.floor(durationMs / (1000 * 60));

      if (minutes <= 0) {
        alert("End time must be after start time");
        return;
      }

      // Determine if in prime windows (simplified)
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      // Prime windows: 5:00-8:15 AM (300-495 min) and 6:00-8:15 PM (1080-1215 min)
      const inMorningPrime =
        (startMinutes >= 300 && startMinutes <= 495) ||
        (endMinutes >= 300 && endMinutes <= 495);
      const inEveningPrime =
        (startMinutes >= 1080 && startMinutes <= 1215) ||
        (endMinutes >= 1080 && endMinutes <= 1215);
      const inPrimeWindow = inMorningPrime || inEveningPrime;

      // Create session data
      const sessionData = {
        id: Date.now().toString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: durationMs / 1000,
        minutes,
        date: sessionDate.toDateString(),
        inPrimeWindow,
        inMorningPrime,
        inEveningPrime,
        qualifiesForStreak: minutes >= 10 && inPrimeWindow,
        type: "manual" as const,
      };

      // Save session
      const dateStr = sessionDate.toDateString();
      const existingResult = await Preferences.get({
        key: `sessions_${dateStr}`,
      });
      const sessions = existingResult.value
        ? JSON.parse(existingResult.value)
        : [];
      sessions.push(sessionData);

      await Preferences.set({
        key: `sessions_${dateStr}`,
        value: JSON.stringify(sessions),
      });

      // Update daily totals
      const existingTimeResult = await Preferences.get({
        key: `outsideTime_${dateStr}`,
      });
      const currentMinutes = existingTimeResult.value
        ? parseInt(existingTimeResult.value)
        : 0;
      const newTotal = currentMinutes + minutes;

      await Preferences.set({
        key: `outsideTime_${dateStr}`,
        value: newTotal.toString(),
      });

      // Update prime time if applicable
      if (inPrimeWindow) {
        const existingPrimeResult = await Preferences.get({
          key: `primeTime_${dateStr}`,
        });
        const currentPrime = existingPrimeResult.value
          ? parseInt(existingPrimeResult.value)
          : 0;
        const newPrimeTotal = currentPrime + minutes;

        await Preferences.set({
          key: `primeTime_${dateStr}`,
          value: newPrimeTotal.toString(),
        });
      }

      // Update streak
      await updateDayStreak();

      alert(`✅ Added ${minutes} minutes!`);
      onSessionAdded();
    } catch (error) {
      console.error("Error adding session:", error);
      alert("Error adding session. Please try again.");
    }
  };

  const updateDayStreak = async () => {
    try {
      const { Preferences } = await import("@capacitor/preferences");

      let streak = 0;
      const today = new Date();

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toDateString();

        const sessionsResult = await Preferences.get({
          key: `sessions_${dateString}`,
        });
        if (sessionsResult.value) {
          const sessions = JSON.parse(sessionsResult.value);
          const hasQualifyingSession = sessions.some(
            (session: any) => session.minutes >= 10 && session.inPrimeWindow
          );

          if (hasQualifyingSession) {
            streak++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      await Preferences.set({ key: "dayStreak", value: streak.toString() });
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Date</label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">Today</option>
          <option value="1">Yesterday</option>
          <option value="2">2 days ago</option>
          <option value="3">3 days ago</option>
          <option value="4">4 days ago</option>
          <option value="5">5 days ago</option>
          <option value="6">6 days ago</option>
          <option value="7">1 week ago</option>
        </select>
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleAddSession}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Add Session
        </button>
      </div>
    </div>
  );
};

export default StatsPage;
