import React, { useState, useEffect } from "react";
import { Bed, Heart, Zap, Brain } from "lucide-react";
import { SimpleAddSession } from "./SimpleAddSession";

interface StatsPageProps {
  currentTime?: Date; // Made optional to handle undefined case
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

interface LastCheckIns {
  sleep: number | null;
  mood: number | null;
  energy: number | null;
  focus: number | null;
}

// Real stats loading with proper error handling + AUTO-REFRESH
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
  const [loading, setLoading] = useState(true);

  // Original useEffect - load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // NEW: Auto-refresh every 30 seconds (reduced from 10 to prevent jumping)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing stats...");
      loadStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // NEW: Refresh when component becomes visible (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👁️ Page became visible, refreshing stats...");
        loadStats();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const { Preferences } = await import("@capacitor/preferences");

      // Load streak
      const streakResult = await Preferences.get({ key: "dayStreak" });
      const dayStreak = streakResult.value ? parseInt(streakResult.value) : 0;

      // Load today's prime time
      const today = new Date().toDateString();
      const todayPrimeResult = await Preferences.get({
        key: `primeTime_${today}`,
      });
      const primeMinutesToday = todayPrimeResult.value
        ? parseInt(todayPrimeResult.value)
        : 0;

      // Load yesterday's prime time
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      const yesterdayPrimeResult = await Preferences.get({
        key: `primeTime_${yesterdayString}`,
      });
      const primeMinutesYesterday = yesterdayPrimeResult.value
        ? parseInt(yesterdayPrimeResult.value)
        : 0;

      // Calculate weekly totals (last 7 days)
      let weeklyMinutes = 0;
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dateString = checkDate.toDateString();

        const dayPrimeResult = await Preferences.get({
          key: `primeTime_${dateString}`,
        });
        weeklyMinutes += dayPrimeResult.value
          ? parseInt(dayPrimeResult.value)
          : 0;
      }

      // Calculate last week's total (days 7-14 ago)
      let weeklyMinutesLastWeek = 0;
      for (let i = 7; i < 14; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dateString = checkDate.toDateString();

        const dayPrimeResult = await Preferences.get({
          key: `primeTime_${dateString}`,
        });
        weeklyMinutesLastWeek += dayPrimeResult.value
          ? parseInt(dayPrimeResult.value)
          : 0;
      }

      setStats({
        dayStreak,
        primeMinutesToday,
        weeklyMinutes,
        totalSessions: 0, // TODO: Calculate from sessions
        lastSessionDate: today,
        primeMinutesYesterday,
        weeklyMinutesLastWeek,
      });

      console.log("✅ Stats updated:", {
        dayStreak,
        primeMinutesToday,
        weeklyMinutes,
      });
    } catch (error) {
      console.error("❌ Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Return stats, loading, AND the refresh function
  return { stats, loading, refreshStats: loadStats };
};

const StatsPage: React.FC<StatsPageProps> = ({ currentTime }) => {
  const { stats, loading, refreshStats } = useStatsData();
  const [selectedScores, setSelectedScores] = useState<PulseScores>({
    sleep: 5,
    mood: 5,
    energy: 5,
    focus: 5,
  });
  const [lastCheckIns, setLastCheckIns] = useState<LastCheckIns>({
    sleep: null,
    mood: null,
    energy: null,
    focus: null,
  });
  const [expandedBenefit, setExpandedBenefit] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fix: Add fallback for currentTime and handle undefined case
  const safeCurrentTime = currentTime || new Date();
  const hours = safeCurrentTime.getHours();

  // Load last check-ins for all 4 categories
  const loadLastCheckIns = async () => {
    try {
      const { Preferences } = await import("@capacitor/preferences");
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      // Load for each category
      const categories = ["sleep", "mood", "energy", "focus"];
      const newLastCheckIns: LastCheckIns = {
        sleep: null,
        mood: null,
        energy: null,
        focus: null,
      };

      for (const category of categories) {
        // Check today first, then yesterday
        let lastEntryResult = await Preferences.get({
          key: `checkIn_${category}_${today}`,
        });

        if (!lastEntryResult.value) {
          lastEntryResult = await Preferences.get({
            key: `checkIn_${category}_${yesterdayString}`,
          });
        }

        if (lastEntryResult.value) {
          const lastValue = parseInt(lastEntryResult.value);
          newLastCheckIns[category as keyof LastCheckIns] = lastValue;

          // If it's from today, show it as current selection
          if (lastEntryResult.value) {
            setSelectedScores((prev) => ({
              ...prev,
              [category]: lastValue,
            }));
          }
        }
      }

      setLastCheckIns(newLastCheckIns);
    } catch (error) {
      console.error("Error loading last check-ins:", error);
    }
  };

  // Handle score selection with unsaved changes tracking
  const handleScoreSelect = (category: keyof PulseScores, score: number) => {
    setSelectedScores((prev) => ({
      ...prev,
      [category]: score,
    }));
    setHasUnsavedChanges(true);
  };

  // Save all check-ins
  const handleSaveCheckIns = async () => {
    try {
      const { Preferences } = await import("@capacitor/preferences");
      const today = new Date().toDateString();

      // Save each category
      for (const [category, score] of Object.entries(selectedScores)) {
        await Preferences.set({
          key: `checkIn_${category}_${today}`,
          value: score.toString(),
        });
      }

      // Update last check-ins state
      setLastCheckIns({ ...selectedScores });
      setHasUnsavedChanges(false);

      alert(
        "Check-ins saved! Your inner rhythms have been recorded for today."
      );
    } catch (error) {
      console.error("Error saving check-ins:", error);
      alert("Error saving your check-ins. Please try again.");
    }
  };

  // Enhanced time-based color system
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

  // Comprehensive circadian benefits with scientific evidence
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

  // Load last check-ins when component mounts
  useEffect(() => {
    loadLastCheckIns();
  }, []);

  if (loading || !currentTime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-lg">Loading your progress...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${colors.primary} transition-all duration-2000 ease-in-out relative overflow-hidden`}
    >
      {/* Enhanced atmospheric layers */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-0 left-0 w-full h-full bg-gradient-radial ${colors.atmospheric} opacity-20 animate-breathe`}
        ></div>
        <div
          className={`absolute top-1/6 left-1/5 w-96 h-64 bg-gradient-to-br ${colors.textured} opacity-15 rounded-full blur-3xl animate-float transform rotate-12`}
        ></div>
        <div
          className={`absolute bottom-1/4 right-1/6 w-80 h-96 bg-gradient-to-tl ${colors.textured} opacity-12 rounded-full blur-2xl animate-float delay-500 transform -rotate-12`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial ${colors.secondary} opacity-10 rounded-full blur-xl animate-pulse delay-1000`}
        ></div>
      </div>

      {/* Fixed container with proper padding */}
      <div className="relative z-10 max-w-4xl mx-auto p-4 pb-24 pt-20">
        {/* Header - FIXED positioning */}
        <div className="text-center mb-8 mt-4">
          <h1
            className="text-4xl font-bold text-white drop-shadow-2xl mb-2 tracking-wide"
            style={{
              textShadow:
                "0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)",
            }}
          >
            The Pulse
          </h1>
          <p className="text-lg text-white/95 drop-shadow-lg tracking-wider">
            Circadian Health Tracking
          </p>
        </div>

        {/* Compact Top Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Day Streak */}
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
            <div className="relative z-10 text-center">
              <div
                className={`w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br ${getProgressColor(
                  stats.dayStreak / 30
                )} ${colors.glow} shadow-xl flex items-center justify-center`}
              >
                <span className="text-xl font-bold text-white drop-shadow-lg">
                  {stats.dayStreak}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 drop-shadow-lg">
                Day Flow
              </h3>
              <p className="text-white/90 text-xs">
                Consecutive days with 10 mins outside
              </p>
            </div>
          </div>

          {/* Prime Light Today */}
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
            <div className="relative z-10 text-center">
              <div
                className={`w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br ${getProgressColor(
                  stats.primeMinutesToday / 120
                )} ${colors.glow} shadow-xl flex items-center justify-center`}
              >
                <div>
                  <span className="text-lg font-bold text-white drop-shadow-lg">
                    {stats.primeMinutesToday}
                  </span>
                  <span className="text-white/90 text-xs block">min</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 drop-shadow-lg">
                Prime Light Today
              </h3>
              <p className="text-white/70 text-xs">
                {stats.primeMinutesYesterday} min Yesterday
              </p>
            </div>
          </div>

          {/* Prime Light This Week */}
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
            <div className="relative z-10 text-center">
              <div
                className={`w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br ${getProgressColor(
                  stats.weeklyMinutes / 300
                )} ${colors.glow} shadow-xl flex items-center justify-center`}
              >
                <div>
                  <span className="text-lg font-bold text-white drop-shadow-lg">
                    {stats.weeklyMinutes}
                  </span>
                  <span className="text-white/90 text-xs block">min</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 drop-shadow-lg">
                Prime Light Week
              </h3>
              <p className="text-white/70 text-xs">
                {stats.weeklyMinutesLastWeek} min Last Week
              </p>
            </div>
          </div>
        </div>

        {/* SIMPLIFIED: Checking Your Inner Rhythms - Only 4 Categories */}
        <div className="mb-8 bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg text-center">
              Checking Your Inner Rhythms
            </h3>
            <p className="text-white/70 text-sm mb-6 text-center">
              How are you feeling today?
            </p>

            {/* 4 Categories: Sleep, Mood, Energy, Focus */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {pulseCategories.map((category) => {
                const IconComponent = category.icon;
                const score = selectedScores[category.key];
                const lastScore = lastCheckIns[category.key];

                return (
                  <div key={category.key} className="text-center">
                    <div className="mb-3">
                      <IconComponent className="w-6 h-6 text-white/90 mx-auto mb-2" />
                      <h4 className="text-white/90 text-sm font-medium mb-3">
                        {category.label}
                      </h4>

                      {/* Last Check-In Display */}
                      <div className="text-xs text-white/60 mb-3 h-4">
                        {lastScore !== null
                          ? `Last Check-In: ${lastScore}`
                          : ""}
                      </div>
                    </div>

                    <div className="flex justify-center space-x-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const isSelected = score === num;
                        const getScoreColor = (scoreNum: number) => {
                          if (scoreNum <= 3) return "bg-red-500/80 text-white";
                          if (scoreNum <= 6)
                            return "bg-yellow-500/80 text-white";
                          return "bg-green-500/80 text-white";
                        };

                        return (
                          <button
                            key={num}
                            onClick={() => handleScoreSelect(category.key, num)}
                            className={`w-6 h-6 rounded-full text-xs font-bold transition-all duration-200 ${
                              isSelected
                                ? `${getScoreColor(num)} scale-110 shadow-lg`
                                : "bg-white/20 text-white/70 hover:bg-white/30"
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveCheckIns}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                hasUnsavedChanges
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  : "bg-white/20 text-white/70"
              }`}
            >
              {hasUnsavedChanges ? "Save Check-in" : "Check-in Saved"}
            </button>

            {/* Unsaved Changes Indicator */}
            {hasUnsavedChanges && (
              <p className="text-yellow-400 text-xs text-center mt-2 italic">
                Tap "Save Check-in" to record your inner rhythms
              </p>
            )}
          </div>
        </div>

        {/* Circadian Health Benefits */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 drop-shadow-lg text-center tracking-wide">
            Circadian Health Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {circadianBenefits.map((benefit) => {
              const progress = benefit.currentDays / benefit.requiredDays;
              const styles = getStateStyles(benefit.state, progress);
              const isExpanded = expandedBenefit === benefit.id;

              return (
                <div
                  key={benefit.id}
                  className={`${styles.bg} backdrop-blur-md rounded-xl p-4 border ${styles.glow} shadow-xl relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                  onClick={() =>
                    setExpandedBenefit(isExpanded ? null : benefit.id)
                  }
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4
                          className={`font-semibold ${styles.text} drop-shadow text-sm`}
                        >
                          {benefit.name}
                        </h4>
                        <p className={`${styles.text} opacity-80 text-xs`}>
                          {benefit.description}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-white/20 rounded-full text-white/90">
                        {styles.status}
                      </span>
                    </div>

                    <div className="mb-2">
                      <p className="text-white/90 text-xs mb-2">
                        {benefit.shortTip}
                      </p>
                      {isExpanded && (
                        <p className="text-white/80 text-xs italic">
                          {benefit.evidence}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getProgressColor(
                            progress
                          )} rounded-full transition-all duration-1000`}
                          style={{ width: `${Math.min(progress * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-white/80 mt-1">
                        <span>{benefit.currentDays} days</span>
                        <span>{benefit.requiredDays} needed</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FIXED: Add Light Session - Smaller Button */}
        <div className="mt-8 pt-6 border-t border-white/20 flex justify-center">
          <div className="w-64">
            <SimpleAddSession onSessionAdded={refreshStats} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes breathe {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1) rotate(2deg);
            opacity: 0.6;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(10px, -10px) rotate(1deg);
          }
          50% {
            transform: translate(-5px, -20px) rotate(-1deg);
          }
          75% {
            transform: translate(-10px, -10px) rotate(1deg);
          }
        }
        .animate-breathe {
          animation: breathe 8s infinite ease-in-out;
        }
        .animate-float {
          animation: float 20s infinite ease-in-out;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};

export default StatsPage;
