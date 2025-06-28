// SimpleAddSession.tsx - Web version with Today option and persistent dropdown
import React, { useState } from "react";
import { Preferences } from "@capacitor/preferences";

interface SimpleAddSessionProps {
  onSessionAdded: () => void;
}

export const SimpleAddSession: React.FC<SimpleAddSessionProps> = ({
  onSessionAdded,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("today");
  const [selectedDuration, setSelectedDuration] = useState("15");
  const [selectedWindow, setSelectedWindow] = useState("morning");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showWindowDropdown, setShowWindowDropdown] = useState(false);

  // Generate date options: Today, Yesterday, and last 14 days
  const getDateOptions = () => {
    const options = [];
    const today = new Date();

    for (let i = 0; i <= 15; i++) {
      // 0 = today, 1 = yesterday, etc.
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      let label;
      let value;

      if (i === 0) {
        label = "Today";
        value = "today";
      } else if (i === 1) {
        label = "Yesterday";
        value = "yesterday";
      } else {
        label = date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        value = date.toDateString();
      }

      options.push({
        date: date,
        label: label,
        value: value,
      });
    }

    return options;
  };

  const dateOptions = getDateOptions();
  const durationOptions = [
    { value: "10", label: "10 minutes" },
    { value: "15", label: "15 minutes" },
    { value: "20", label: "20 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
  ];

  const windowOptions = [
    { value: "morning", label: "Morning Prime (5:00-8:15 AM)" },
    { value: "evening", label: "Evening Prime (6:00-8:15 PM)" },
    { value: "regular", label: "Regular Time" },
  ];

  const getSelectedDateObject = () => {
    if (selectedDate === "today") {
      return new Date();
    } else if (selectedDate === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    } else {
      return new Date(selectedDate);
    }
  };

  const handleAddSession = async () => {
    try {
      const sessionDate = getSelectedDateObject();
      const dateString = sessionDate.toDateString();
      const minutes = parseInt(selectedDuration);
      const inPrimeWindow = selectedWindow !== "regular";
      const inMorningPrime = selectedWindow === "morning";
      const inEveningPrime = selectedWindow === "evening";

      // Create session data
      const sessionData = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(), // Simplified for manual entry
        endTime: new Date().toISOString(),
        duration: minutes * 60, // Convert to seconds
        minutes: minutes,
        date: dateString,
        inPrimeWindow,
        inMorningPrime,
        inEveningPrime,
        qualifiesForStreak: minutes >= 10 && inPrimeWindow,
        type: "manual",
      };

      // Save session
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

      // Update daily total
      const existingTimeResult = await Preferences.get({
        key: `outsideTime_${dateString}`,
      });
      const currentMinutes = existingTimeResult.value
        ? parseInt(existingTimeResult.value)
        : 0;
      const newTotal = currentMinutes + minutes;
      await Preferences.set({
        key: `outsideTime_${dateString}`,
        value: newTotal.toString(),
      });

      // Update prime time if applicable
      if (inPrimeWindow) {
        const existingPrimeResult = await Preferences.get({
          key: `primeTime_${dateString}`,
        });
        const currentPrime = existingPrimeResult.value
          ? parseInt(existingPrimeResult.value)
          : 0;
        const newPrimeTotal = currentPrime + minutes;
        await Preferences.set({
          key: `primeTime_${dateString}`,
          value: newPrimeTotal.toString(),
        });
      }

      // Update streak calculation
      await updateDayStreak();

      // Reset form and close
      setSelectedDate("today");
      setSelectedDuration("15");
      setSelectedWindow("morning");
      setIsOpen(false);

      // Close all dropdowns
      setShowDateDropdown(false);
      setShowDurationDropdown(false);
      setShowWindowDropdown(false);

      onSessionAdded();

      // Success message
      alert(
        `Added ${minutes} minutes of outdoor time${
          inPrimeWindow ? " (prime window!)" : ""
        }!`
      );
    } catch (error) {
      console.error("Error adding session:", error);
      alert("Error adding session. Please try again.");
    }
  };

  // Update day streak (simplified version)
  const updateDayStreak = async () => {
    try {
      let streak = 0;
      const today = new Date();

      // Check consecutive days backwards from today
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

  const getSelectedLabel = (options: any[], value: string) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-medium text-sm"
      >
        +Add Light Session
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6">
        Add Light Session
      </h3>

      {/* Date Selection */}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-white/80 mb-2">
          Date
        </label>
        <button
          onClick={() => setShowDateDropdown(!showDateDropdown)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white flex justify-between items-center hover:bg-white/15 transition-colors"
        >
          <span>{getSelectedLabel(dateOptions, selectedDate)}</span>
          <span className="text-white/60">{showDateDropdown ? "▲" : "▼"}</span>
        </button>

        {/* Date Dropdown - Persistent until selection */}
        {showDateDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
            {dateOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedDate(option.value);
                  setShowDateDropdown(false); // Close only on selection
                }}
                className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                  selectedDate === option.value
                    ? "bg-blue-600/30 text-blue-200"
                    : "text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Duration Selection */}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-white/80 mb-2">
          Duration
        </label>
        <button
          onClick={() => setShowDurationDropdown(!showDurationDropdown)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white flex justify-between items-center hover:bg-white/15 transition-colors"
        >
          <span>{getSelectedLabel(durationOptions, selectedDuration)}</span>
          <span className="text-white/60">
            {showDurationDropdown ? "▲" : "▼"}
          </span>
        </button>

        {/* Duration Dropdown */}
        {showDurationDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-xl z-50">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedDuration(option.value);
                  setShowDurationDropdown(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                  selectedDuration === option.value
                    ? "bg-blue-600/30 text-blue-200"
                    : "text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prime Window Selection */}
      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-white/80 mb-2">
          Time Window
        </label>
        <button
          onClick={() => setShowWindowDropdown(!showWindowDropdown)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white flex justify-between items-center hover:bg-white/15 transition-colors"
        >
          <span>{getSelectedLabel(windowOptions, selectedWindow)}</span>
          <span className="text-white/60">
            {showWindowDropdown ? "▲" : "▼"}
          </span>
        </button>

        {/* Window Dropdown */}
        {showWindowDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-xl z-50">
            {windowOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedWindow(option.value);
                  setShowWindowDropdown(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                  selectedWindow === option.value
                    ? "bg-blue-600/30 text-blue-200"
                    : "text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <p className="text-sm text-white/80">
          <span className="text-cyan-400">Preview:</span>{" "}
          {getSelectedLabel(durationOptions, selectedDuration)} on{" "}
          {getSelectedLabel(dateOptions, selectedDate).toLowerCase()}
          {selectedWindow !== "regular" && (
            <span className="text-yellow-400"> (qualifies for streak!)</span>
          )}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setIsOpen(false);
            setShowDateDropdown(false);
            setShowDurationDropdown(false);
            setShowWindowDropdown(false);
          }}
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/15 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleAddSession}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium"
        >
          Add Session
        </button>
      </div>
    </div>
  );
};
