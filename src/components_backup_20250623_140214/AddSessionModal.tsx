import React, { useState, useCallback, useEffect } from "react";
import { X, Calendar, Clock, Save } from "lucide-react";
import { Preferences } from "@capacitor/preferences";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded: () => void;
}

const AddSessionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSessionAdded,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startHour, setStartHour] = useState(6);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(6);
  const [endMinute, setEndMinute] = useState(30);

  // FIXED: Only reset when modal opens, use separate hour/minute states
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setSelectedDate(new Date(now));
      setStartHour(6);
      setStartMinute(0);
      setEndHour(6);
      setEndMinute(30);
    }
  }, [isOpen]);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = new Date(e.target.value + "T00:00:00");
      console.log("📅 Date changed to:", newDate.toDateString());
      setSelectedDate(newDate);
      // Don't touch the hour/minute states - they stay as user set them
    },
    []
  );

  const handleStartTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const [hours, minutes] = e.target.value.split(":").map(Number);
      console.log("🕐 Start time changed to:", hours, ":", minutes);
      setStartHour(hours);
      setStartMinute(minutes);
      // selectedDate remains unchanged!
    },
    []
  );

  const handleEndTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const [hours, minutes] = e.target.value.split(":").map(Number);
      console.log("🕐 End time changed to:", hours, ":", minutes);
      setEndHour(hours);
      setEndMinute(minutes);
      // selectedDate remains unchanged!
    },
    []
  );

  const getDurationAndPrimeInfo = useCallback(() => {
    // Create actual start/end times from date + hour/minute
    const startTime = new Date(selectedDate);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    if (endTime <= startTime) {
      return {
        duration: 0,
        inPrimeWindow: false,
        primeWindowType: "",
        startTime,
        endTime,
      };
    }

    const durationMinutes = Math.floor(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    );
    const sessionStartMinutes = startHour * 60 + startMinute;
    const sessionEndMinutes = endHour * 60 + endMinute;

    // Extended prime windows: 5:00-8:15 AM and 6:00-8:15 PM
    const morningPrimeStart = 5 * 60; // 5:00 AM
    const morningPrimeEnd = 8 * 60 + 15; // 8:15 AM
    const eveningPrimeStart = 18 * 60; // 6:00 PM
    const eveningPrimeEnd = 20 * 60 + 15; // 8:15 PM

    const inMorningPrime =
      sessionStartMinutes < morningPrimeEnd &&
      sessionEndMinutes > morningPrimeStart;
    const inEveningPrime =
      sessionStartMinutes < eveningPrimeEnd &&
      sessionEndMinutes > eveningPrimeStart;
    const inPrimeWindow = inMorningPrime || inEveningPrime;
    const primeWindowType = inMorningPrime
      ? "Morning"
      : inEveningPrime
      ? "Evening"
      : "";

    return {
      duration: durationMinutes,
      inPrimeWindow,
      primeWindowType,
      startTime,
      endTime,
    };
  }, [selectedDate, startHour, startMinute, endHour, endMinute]);

  const { duration, inPrimeWindow, primeWindowType, startTime, endTime } =
    getDurationAndPrimeInfo();

  // Reliable streak calculation that always works
  const updateDayStreak = async () => {
    try {
      console.log("🔄 Updating day streak...");
      let streak = 0;
      const today = new Date();

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toDateString();

        const sessionsResult = await Preferences.get({
          key: `sessions_${dateString}`,
        });
        if (sessionsResult.value) {
          const sessions = JSON.parse(sessionsResult.value);
          const hasQualifyingSession = sessions.some((session: any) => {
            return session.minutes >= 10 && session.inPrimeWindow;
          });

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
      console.log(`🔥 Day streak: ${streak}`);
      return streak;
    } catch (error) {
      console.error("Streak update error:", error);
      return 0;
    }
  };

  const handleSave = async () => {
    // Validation
    if (duration <= 0) {
      alert("End time must be after start time");
      return;
    }

    if (duration < 5) {
      alert("Please enter a session of at least 5 minutes");
      return;
    }

    // Show immediate feedback
    const savingMessage = `Saving ${duration} minutes...`;
    console.log(savingMessage);

    try {
      const qualifiesForStreak = inPrimeWindow && duration >= 10;

      const sessionData = {
        id: Date.now().toString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: duration,
        minutes: duration,
        date: selectedDate.toDateString(),
        inPrimeWindow: inPrimeWindow,
        inMorningPrime: primeWindowType === "Morning",
        inEveningPrime: primeWindowType === "Evening",
        qualifiesForStreak: qualifiesForStreak,
        type: "manual" as const,
      };

      console.log("💾 Saving session data:", sessionData);

      const dateString = selectedDate.toDateString();

      // Save all data synchronously to prevent race conditions
      const existingSessionsResult = await Preferences.get({
        key: `sessions_${dateString}`,
      });
      const sessions = existingSessionsResult.value
        ? JSON.parse(existingSessionsResult.value)
        : [];
      sessions.push(sessionData);
      await Preferences.set({
        key: `sessions_${dateString}`,
        value: JSON.stringify(sessions),
      });

      const existingDailyResult = await Preferences.get({
        key: `outsideTime_${dateString}`,
      });
      const currentDaily = existingDailyResult.value
        ? parseInt(existingDailyResult.value)
        : 0;
      const newDailyTotal = currentDaily + duration;
      await Preferences.set({
        key: `outsideTime_${dateString}`,
        value: newDailyTotal.toString(),
      });

      if (inPrimeWindow) {
        const existingPrimeResult = await Preferences.get({
          key: `primeTime_${dateString}`,
        });
        const currentPrime = existingPrimeResult.value
          ? parseInt(existingPrimeResult.value)
          : 0;
        const newPrimeTotal = currentPrime + duration;
        await Preferences.set({
          key: `primeTime_${dateString}`,
          value: newPrimeTotal.toString(),
        });
      }

      // Update streak immediately and wait for it
      await updateDayStreak();

      console.log("✅ Session saved successfully with streak updated!");

      // Success message only (NO error alert)
      alert(
        `✅ Session Added!\n${duration} minutes${
          qualifiesForStreak ? " (qualifies for streak!)" : ""
        }\n${
          inPrimeWindow
            ? `✨ Prime ${primeWindowType} Window`
            : "Regular session"
        }`
      );

      // Close modal and refresh stats
      onSessionAdded();
      onClose();
    } catch (error) {
      console.error("❌ Save failed:", error);
      // Only show error if save actually failed
      alert("❌ Save failed. Please try again.");
    }
  };

  // Format display values - use the separated hour/minute states
  const dateValue = selectedDate.toISOString().split("T")[0];
  const startTimeValue = `${startHour.toString().padStart(2, "0")}:${startMinute
    .toString()
    .padStart(2, "0")}`;
  const endTimeValue = `${endHour.toString().padStart(2, "0")}:${endMinute
    .toString()
    .padStart(2, "0")}`;
  const maxDate = new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border"
        style={{
          background:
            "linear-gradient(135deg, #124559 0%, #1d7088 50%, #05445e 100%)",
          borderColor: "rgba(255, 215, 0, 0.3)",
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add Light Session</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Fixed Debug info - shows date persistence */}
        <div className="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-400/30">
          <div className="text-sm text-blue-200 font-mono">
            📅 {selectedDate.toDateString()} | 🕐 {startTimeValue} →{" "}
            {endTimeValue}
          </div>
          <div className="text-xs text-blue-300 mt-1">
            ✅ Date should NOT change when editing times
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white/90 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date
          </label>
          <input
            type="date"
            value={dateValue}
            onChange={handleDateChange}
            max={maxDate}
            className="w-full p-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-lg"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white/90 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Start Time
          </label>
          <input
            type="time"
            value={startTimeValue}
            onChange={handleStartTimeChange}
            className="w-full p-3 border border-white/20 rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-lg"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white/90 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            End Time
          </label>
          <input
            type="time"
            value={endTimeValue}
            onChange={handleEndTimeChange}
            className="w-full p-3 border border-white/20 rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-lg"
          />
        </div>

        <div
          className="mb-6 p-4 rounded-lg border"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 167, 38, 0.1) 100%)",
            borderColor: "rgba(255, 215, 0, 0.3)",
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-white/90">Duration:</span>
            <span
              className={`text-xl font-bold ${
                duration >= 10
                  ? "text-yellow-400"
                  : duration > 0
                  ? "text-orange-400"
                  : "text-red-400"
              }`}
            >
              {duration} minutes
            </span>
          </div>

          {inPrimeWindow && (
            <div className="text-sm text-yellow-400 font-medium mb-1">
              ✨ {primeWindowType} Prime Window (5:00-8:15 AM or 6:00-8:15 PM)
            </div>
          )}

          {duration >= 10 && inPrimeWindow && (
            <div className="text-sm text-green-400 font-medium">
              🏆 Qualifies for Day Flow streak!
            </div>
          )}

          {duration > 0 && duration < 10 && (
            <div className="text-sm text-orange-400">
              Need 10+ minutes to qualify for streak
            </div>
          )}

          {duration <= 0 && (
            <div className="text-sm text-red-400">
              End time must be after start time
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-white/30 text-white/90 rounded-lg hover:bg-white/10 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={duration <= 0}
            className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 ${
              duration > 0
                ? "bg-yellow-600 hover:bg-yellow-500 shadow-lg"
                : "bg-gray-600 cursor-not-allowed opacity-50"
            }`}
          >
            <Save className="w-4 h-4" />
            Save Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSessionModal;
