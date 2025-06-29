
import React, { useState, useEffect } from "react";
import { Sun } from "lucide-react";

interface UVClockMockupProps {
  currentTime?: Date;
}

// Color themes matching the main SolCue app
const colorThemes = {
  default: {
    name: "Natural",
    representativeColor: "#fbbf24",
  },
  purple: {
    name: "Cosmic Purple", 
    representativeColor: "#c084fc",
  },
  ocean: {
    name: "Ocean Blue",
    representativeColor: "#38bdf8",
  },
  monochrome: {
    name: "Midnight",
    representativeColor: "#9ca3af",
  },
};

const UVClockMockup: React.FC<UVClockMockupProps> = ({
  currentTime = new Date(),
}) => {
  const [time, setTime] = useState(currentTime);
  const [currentTheme, setCurrentTheme] = useState("default");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Convert hours to angle (24-hour clock, midnight at top)
  const hoursToAngle = (hours: number) => (hours / 24) * 360;

  // Mock UV index data based on time of day and season
  const calculateUVIndex = (hour: number) => {
    // Simplified UV curve - peaks around noon, zero at night
    if (hour < 6 || hour > 18) return 0; // Night/early morning/late evening
    
    // Create a bell curve peaking at noon (12)
    const peakHour = 12;
    const distance = Math.abs(hour - peakHour);
    
    if (distance <= 1) return 11; // Peak UV (11am-1pm)
    if (distance <= 2) return 9;  // High UV (10am-2pm)
    if (distance <= 3) return 7;  // Moderate-high UV (9am-3pm)
    if (distance <= 4) return 5;  // Moderate UV (8am-4pm)
    if (distance <= 5) return 3;  // Low-moderate UV (7am-5pm)
    return 1; // Low UV (6am-6pm)
  };

  // Get UV color based on index
  const getUVColor = (uvIndex: number) => {
    if (uvIndex === 0) return "#0f172a"; // Deep night blue
    if (uvIndex <= 2) return "#312e81"; // Dark purple
    if (uvIndex <= 4) return "#1e40af"; // Dark blue
    if (uvIndex <= 6) return "#0ea5e9"; // Light blue
    if (uvIndex <= 8) return "#fbbf24"; // Yellow
    if (uvIndex <= 10) return "#f97316"; // Orange
    return "#dc2626"; // Red for 11+
  };

  // Get UV intensity (opacity/brightness)
  const getUVIntensity = (uvIndex: number) => {
    return Math.max(0.3, Math.min(1, uvIndex / 11));
  };

  // Calculate current time values
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const currentHour = hours + minutes / 60;
  const currentUV = calculateUVIndex(currentHour);

  // Create UV segments for the clock
  const uvSegments = Array.from({ length: 24 }, (_, hour) => {
    const uvIndex = calculateUVIndex(hour);
    const startAngle = hoursToAngle(hour) - 90;
    const endAngle = hoursToAngle(hour + 1) - 90;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const centerX = 160;
    const centerY = 160;
    const radius = 120;
    
    const x1 = centerX + Math.cos(startAngleRad) * radius;
    const y1 = centerY + Math.sin(startAngleRad) * radius;
    const x2 = centerX + Math.cos(endAngleRad) * radius;
    const y2 = centerY + Math.sin(endAngleRad) * radius;
    
    const largeArcFlag = 0; // Always 0 for 1-hour segments
    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    return {
      hour,
      uvIndex,
      color: getUVColor(uvIndex),
      intensity: getUVIntensity(uvIndex),
      path,
      isPeak: uvIndex >= 9,
    };
  });

  // Calculate sun position
  const sunAngle = hoursToAngle(currentHour) - 90;
  const sunSize = Math.max(20, 20 + (currentUV * 2)); // Larger sun during high UV

  return (
    <div 
      className="min-h-screen p-4 flex flex-col items-center relative overflow-hidden"
      style={{
        background: "#000000",
        paddingTop: "60px",
      }}
    >
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Header - Fixed at top */}
        <div className="mb-8 mt-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-2xl mb-2 tracking-wide">
            SolCue
          </h1>
          <p className="text-lg text-white/90 drop-shadow-lg mb-1">
            Get your vitamin D
          </p>
          <p className="text-base text-white/80 drop-shadow-lg">
            Today's UV Index
          </p>
        </div>

        {/* Spacer to push content down */}
        <div className="flex-1"></div>

        {/* Main Clock Container */}
        <div className="relative flex justify-center items-center mb-8">
          <div className="relative w-80 h-80">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full bg-black/80 backdrop-blur-sm border border-white/20"></div>

            {/* UV Segments */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
              <defs>
                <radialGradient id="peakUVGlow" cx="50%" cy="50%" r="80%">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#f97316" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              </defs>

              {uvSegments.map((segment, index) => (
                <path
                  key={index}
                  d={segment.path}
                  fill={segment.color}
                  opacity={segment.intensity}
                  className={segment.isPeak ? "animate-[pulse_6s_ease-in-out_infinite]" : ""}
                />
              ))}
            </svg>

            {/* Hour markers for reference */}
            {[0, 6, 12, 18].map((hour) => {
              const angle = hoursToAngle(hour) - 90;
              const radius = 135;
              const x = 160 + Math.cos((angle * Math.PI) / 180) * radius;
              const y = 160 + Math.sin((angle * Math.PI) / 180) * radius;
              
              return (
                <div
                  key={hour}
                  className="absolute text-white font-light flex items-center justify-center bg-black/60 rounded-full"
                  style={{
                    left: x - 15,
                    top: y - 10,
                    width: "30px",
                    height: "20px",
                    fontSize: "12px",
                    opacity: 0.8,
                  }}
                >
                  {hour === 0 ? "12a" : hour === 12 ? "12p" : `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "p" : "a"}`}
                </div>
              );
            })}

            {/* Enhanced Sun Indicator */}
            <div
              className="absolute transition-all duration-1000"
              style={{
                left: 160 + Math.cos((sunAngle * Math.PI) / 180) * 100,
                top: 160 + Math.sin((sunAngle * Math.PI) / 180) * 100,
                width: `${sunSize}px`,
                height: `${sunSize}px`,
                marginLeft: `-${sunSize / 2}px`,
                marginTop: `-${sunSize / 2}px`,
              }}
            >
              <div className="relative">
                {/* UV-based sun glow - slowed down pulse */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    width: `${sunSize * 3}px`,
                    height: `${sunSize * 3}px`,
                    marginLeft: `-${sunSize}px`,
                    marginTop: `-${sunSize}px`,
                    background: `radial-gradient(circle, ${getUVColor(currentUV)}60 0%, ${getUVColor(currentUV)}30 40%, transparent 70%)`,
                    filter: "blur(8px)",
                    animation: currentUV >= 9 ? "pulse 6s infinite ease-in-out" : "none",
                  }}
                ></div>
                {/* Sun core */}
                <div
                  className="relative z-10 rounded-full shadow-lg border border-yellow-300/50"
                  style={{
                    width: `${sunSize}px`,
                    height: `${sunSize}px`,
                    background: `linear-gradient(135deg, ${getUVColor(currentUV)}, #fbbf24)`,
                  }}
                ></div>
              </div>
            </div>

            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-white rounded-full shadow-lg"></div>
          </div>
        </div>

        {/* Time Display */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-white mb-2">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="text-lg text-white/90">
            {time.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
          </div>
        </div>

        {/* Controls - matching main SolCue design */}
        <div className="flex gap-6 justify-center items-center mb-6">
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

          {/* UV Button - matching main clock design */}
          <button className="flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white/90 hover:bg-white/20 transition-all duration-300 text-xs">
            UV
          </button>
        </div>

        {/* Peak UV Hours - Horizontal Layout */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 max-w-md mx-auto mb-4">
          <h3 className="text-white font-semibold mb-3 text-center">Peak Hours Today</h3>
          <div className="flex justify-center items-center gap-2">
            {uvSegments
              .filter(s => s.uvIndex >= 7)
              .map((segment, index) => (
                <div key={segment.hour} className="text-center flex flex-col items-center">
                  <div 
                    className="w-6 h-6 rounded-full mb-1"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <div className="text-white/80 text-xs">
                    {segment.hour === 0 ? "12a" : segment.hour === 12 ? "12p" : 
                     `${segment.hour > 12 ? segment.hour - 12 : segment.hour}${segment.hour >= 12 ? "p" : "a"}`}
                  </div>
                  {index < uvSegments.filter(s => s.uvIndex >= 7).length - 1 && (
                    <div className="w-4 h-0.5 bg-white/30 mt-2"></div>
                  )}
                </div>
              ))
            }
          </div>
        </div>

        {/* Current UV Display - Below Peak Hours */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 max-w-sm mx-auto">
          <div className="text-white/90 text-sm mb-1">Current UV Index</div>
          <div 
            className="text-3xl font-bold mb-2"
            style={{ color: getUVColor(currentUV) }}
          >
            {currentUV}
          </div>
          <div className="text-white/70 text-xs">
            {currentUV === 0 && "No UV - Safe"}
            {currentUV >= 1 && currentUV <= 2 && "Low UV - Minimal risk"}
            {currentUV >= 3 && currentUV <= 5 && "Moderate UV - Some protection needed"}
            {currentUV >= 6 && currentUV <= 7 && "High UV - Protection required"}
            {currentUV >= 8 && currentUV <= 10 && "Very High UV - Extra protection"}
            {currentUV >= 11 && "Extreme UV - Avoid midday sun"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UVClockMockup;
