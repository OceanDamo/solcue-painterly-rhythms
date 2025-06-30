
import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Clock,
  Waves,
  Share2,
  Download,
  Camera,
  X,
  Play,
  Pause,
  AlertTriangle,
} from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { calculateSunTimes } from "@/utils/sunCalc";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import PhotoShare from "@/components/PhotoShare";
import { Link } from "react-router-dom";
import PhotoGallery from "./PhotoGallery";

// Clock format options
type ClockFormat = "12hr" | "24hr" | "main" | "none";

// Color themes
const colorThemes = {
  default: {
    name: "Natural",
    primary: "#fbbf24",
    secondary: "#f59e0b",
    accent: "#dc2626",
    background: "from-amber-900 via-orange-800 to-red-900",
    representativeColor: "#fbbf24",
  },
  purple: {
    name: "Cosmic Purple",
    primary: "#c084fc",
    secondary: "#a855f7",
    accent: "#9333ea",
    background: "from-purple-900 via-violet-800 to-indigo-900",
    representativeColor: "#c084fc",
  },
  ocean: {
    name: "Ocean Blue",
    primary: "#38bdf8",
    secondary: "#0284c7",
    accent: "#06b6d4",
    background: "from-blue-900 via-cyan-800 to-teal-900",
    representativeColor: "#38bdf8",
  },
  monochrome: {
    name: "Midnight",
    primary: "#9ca3af",
    secondary: "#6b7280",
    accent: "#4b5563",
    background: "from-gray-900 via-slate-800 to-zinc-900",
    representativeColor: "#9ca3af",
  },
};

const UnifiedSunClock: React.FC = () => {
  // Geolocation hook
  const { location, error: geoError } = useGeolocation();

  // State variables
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sunTimes, setSunTimes] = useState<any>(null);
  const [currentTheme, setCurrentTheme] = useState("default");
  const [clockFormat, setClockFormat] = useState<ClockFormat>("12hr");
  const [showTides, setShowTides] = useState(false);
  const [showPhotoShare, setShowPhotoShare] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);

  // Session tracking hook - using the correct method names
  const {
    isTracking,
    startSession,
    endSession,
    getCurrentSessionElapsed,
    stats,
  } = useSessionTracking();

  // Get elapsed time
  const timeElapsed = getCurrentSessionElapsed();

  // Ref for the audio element
  const audioRef = useRef<HTMLAudioElement>(null);

  // Update time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Calculate sun times when location changes
  useEffect(() => {
    if (location) {
      const { latitude, longitude } = location;
      const times = calculateSunTimes(latitude, longitude);
      setSunTimes(times);
    }
  }, [location]);

  // Show location error if geolocation fails
  useEffect(() => {
    if (geoError) {
      setShowLocationError(true);
    }
  }, [geoError]);

  // Get current hour in 24-hour format
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;

  // Determine current phase of day
  const getCurrentPhase = () => {
    if (!sunTimes) return "Loading...";

    const inMorningPrime =
      currentHour >= sunTimes.morningPrimeStart &&
      currentHour <= sunTimes.morningPrimeEnd;
    const inEveningPrime =
      currentHour >= sunTimes.eveningPrimeStart &&
      currentHour <= sunTimes.eveningPrimeEnd;

    if (inMorningPrime) return "Morning Prime Light";
    if (inEveningPrime) return "Evening Prime Light";
    if (currentHour >= sunTimes.sunrise && currentHour <= sunTimes.sunset)
      return "Daylight";
    return "Night Cycle";
  };

  // Format time based on clock format
  const formatTime = () => {
    switch (clockFormat) {
      case "12hr":
        return currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      case "24hr":
        return currentTime.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });
      case "main":
        return currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      default:
        return "";
    }
  };

  // Get theme colors
  const theme = colorThemes[currentTheme as keyof typeof colorThemes];

  // Function to play the audio
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Playback failed:", error);
      });
    }
  };

  // Function to pause the audio
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Handle session tracking
  const handleStartSession = () => {
    startSession("manual");
    playAudio();
  };

  const handleEndSession = () => {
    endSession();
    pauseAudio();
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${theme.background})`,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Animated gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.background} opacity-20 blur-3xl animate-gradient`}
      ></div>

      {/* Location Error Modal */}
      {showLocationError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-black/80 rounded-2xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <AlertTriangle className="text-red-500 w-6 h-6" />
              <h2 className="text-lg font-bold text-white">
                Location Error
              </h2>
            </div>
            <p className="text-white/80 mb-4">
              We couldn't retrieve your location. Please make sure location
              services are enabled for SolCue.
            </p>
            <button
              onClick={() => setShowLocationError(false)}
              className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Photo Share Modal */}
      {showPhotoShare && sunTimes && (
        <PhotoShare
          currentTheme={currentTheme}
          sunTimes={sunTimes}
          currentHour={currentHour}
          isTracking={isTracking}
          timeElapsed={timeElapsed}
          onClose={() => setShowPhotoShare(false)}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center p-4">
        {/* Header */}
        <div className="mb-8 mt-16">
          <h1 className="text-5xl font-bold text-white drop-shadow-2xl mb-2 tracking-wide">
            SolCue
          </h1>
          <p className="text-lg text-white/90 drop-shadow-lg mb-1">
            Get your vitamin D
          </p>
          <p className="text-base text-white/80 drop-shadow-lg">
            {sunTimes
              ? `Sunrise ${new Date(
                  sunTimes.sunrise
                ).toLocaleTimeString()} / Sunset ${new Date(
                  sunTimes.sunset
                ).toLocaleTimeString()}`
              : "Loading Sun Times..."}
          </p>
        </div>

        {/* Sun and Moon Icons */}
        <div className="flex justify-center items-center mb-6">
          <Sun className="text-yellow-400 w-6 h-6 mr-2 drop-shadow-md" />
          <Moon className="text-gray-500 w-5 h-5 ml-2 drop-shadow-md" />
        </div>

        {/* Time Display */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            {formatTime()}
          </div>
          <div className="text-lg text-white/90 drop-shadow-lg">
            {currentTime.toLocaleDateString([], {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Current Phase */}
        <div className="mb-8">
          <p className="text-xl text-white/90 drop-shadow-lg">
            {getCurrentPhase()}
          </p>
        </div>

        {/* Session Tracking Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {isTracking ? (
            <>
              <button
                onClick={handleEndSession}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4 mr-2 inline-block" />
                Stop Session
              </button>
            </>
          ) : (
            <button
              onClick={handleStartSession}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-2 inline-block" />
              Start Session
            </button>
          )}
        </div>

        {/* Session Tracking Stats */}
        {isTracking && (
          <div className="mb-8">
            <p className="text-white/80">
              Time Elapsed: {Math.floor(timeElapsed / 60)}:
              {(timeElapsed % 60).toString().padStart(2, "0")}
            </p>
            {stats && (
              <div className="text-white/60 text-sm">
                <p>
                  Weekly Minutes: {stats.weeklyMinutes} / Prime Minutes: {stats.primeMinutes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Simplified Controls */}
        <div className="flex gap-6 justify-center items-center">
          {/* Tiny colored circles for theme selection */}
          <div className="flex gap-2">
            {Object.entries(colorThemes).map(([key, themeOption]) => (
              <button
                key={key}
                onClick={() => setCurrentTheme(key)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentTheme === key
                    ? "ring-1 ring-white/60 ring-offset-1 ring-offset-black scale-125"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: themeOption.representativeColor }}
                title={themeOption.name}
              />
            ))}
          </div>

          {/* Gallery Button */}
          <PhotoGallery currentTheme={currentTheme} />

          {/* Just clock icon for time format */}
          <button
            onClick={() => {
              const formats: ClockFormat[] = ["12hr", "24hr", "main", "none"];
              const currentIndex = formats.indexOf(clockFormat);
              const nextIndex = (currentIndex + 1) % formats.length;
              setClockFormat(formats[nextIndex]);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white/90 hover:bg-white/20 transition-all duration-300 text-xs"
            title={`Clock format: ${clockFormat}`}
          >
            <Clock className="w-3 h-3" />
          </button>

          {/* Tides Button */}
          <button
            onClick={() => setShowTides(!showTides)}
            className="flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white/90 hover:bg-white/20 transition-all duration-300 text-xs"
          >
            <Waves className="w-3 h-3" />
          </button>
        </div>

        {/* Tides Information */}
        {showTides && location && (
          <div className="mt-6">
            <p className="text-white/80">
              Tide information is not available in this mockup.{" "}
              <Link
                to="https://www.tide-forecast.com/"
                className="text-blue-400 hover:underline"
              >
                Check tide-forecast.com
              </Link>
            </p>
          </div>
        )}

        {/* Share Button */}
        <button
          onClick={() => setShowPhotoShare(true)}
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Share2 className="w-4 h-4 mr-2 inline-block" />
          Share
        </button>
      </div>

      {/* Audio element */}
      <audio
        ref={audioRef}
        src="/audio/ocean-ambient.mp3"
        loop
        preload="auto"
        onPlay={() => console.log("Audio playing")}
        onPause={() => console.log("Audio paused")}
      />
    </div>
  );
};

export default UnifiedSunClock;
