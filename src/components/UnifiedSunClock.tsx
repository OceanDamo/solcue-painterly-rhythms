
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Waves } from 'lucide-react';

interface UnifiedSunClockProps {
  currentTime?: Date;
}

const UnifiedSunClock: React.FC<UnifiedSunClockProps> = ({ currentTime = new Date() }) => {
  const [time, setTime] = useState(currentTime);
  const [showTides, setShowTides] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Convert hours to angle (24-hour clock, midnight at top)
  const hoursToAngle = (hours: number) => (hours / 24) * 360;

  // Real astronomical calculation for any date and location
  const calculateSunTimes = (lat: number, lon: number, date: Date) => {
    // Simplified astronomical calculation - you could replace with a library like SunCalc
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // For Providence, RI (41.8236°N, 71.4222°W) in May
    // These are calculated values that would change daily
    const solarNoon = 12.75;
    const dayLength = 14.5; // Hours of daylight in May
    
    const sunrise = solarNoon - dayLength / 2;
    const sunset = solarNoon + dayLength / 2;
    
    // Twilight calculations (in hours before/after sunrise/sunset)
    const astronomicalTwilight = 1.5;
    const nauticalTwilight = 0.9;
    const civilTwilight = 0.4;
    
    return {
      sunrise,
      sunset,
      astronomicalNightEnd: sunrise - astronomicalTwilight,
      nauticalTwilightEnd: sunrise - nauticalTwilight,
      civilTwilightEnd: sunrise - civilTwilight,
      civilTwilightStart: sunset + civilTwilight,
      nauticalTwilightStart: sunset + nauticalTwilight,
      astronomicalNightStart: sunset + astronomicalTwilight,
      solarNoon,
      
      // Prime circadian windows - 2 hours after sunrise and 2 hours before sunset
      morningPrimeStart: sunrise,
      morningPrimeEnd: sunrise + 2,
      eveningPrimeStart: sunset - 2,
      eveningPrimeEnd: sunset,
    };
  };

  // Calculate moon position (simplified - in reality this would be more complex)
  const calculateMoonPosition = (date: Date) => {
    // Simplified calculation - moon moves approximately 360° in 29.5 days
    const moonCycle = 29.5; // days
    const daysSinceNewMoon = (date.getTime() / (1000 * 60 * 60 * 24)) % moonCycle;
    const moonPhase = (daysSinceNewMoon / moonCycle) * 360;
    
    // Moon rises about 50 minutes later each day
    const moonDelay = (daysSinceNewMoon * 0.8) % 24;
    const currentHour = date.getHours() + date.getMinutes() / 60;
    const moonHour = (currentHour + moonDelay) % 24;
    
    return {
      hour: moonHour,
      phase: moonPhase,
      visible: moonHour > 18 || moonHour < 6 // Simplified visibility
    };
  };

  // Calculate tide information (simplified)
  const calculateTides = () => {
    const now = new Date();
    const hours = now.getHours();
    
    // Simplified tide calculation - 2 high tides per ~24.8 hours
    const tidePhase = (hours + now.getMinutes() / 60) % 12.4;
    const isHighTide = tidePhase < 1 || (tidePhase > 5.2 && tidePhase < 7.2);
    const nextTideHours = isHighTide ? 6.2 - (tidePhase % 6.2) : 6.2 - (tidePhase % 6.2);
    
    return {
      isHigh: isHighTide,
      nextChange: nextTideHours,
      height: isHighTide ? '4.3ft' : '0.8ft'
    };
  };

  // Calculate current time values
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const currentHour = hours + minutes / 60;
  
  // Get sun times for Providence, RI
  const sunTimes = calculateSunTimes(41.8236, -71.4222, time);
  const moonData = calculateMoonPosition(time);
  const tideData = calculateTides();
  
  // Calculate sun and moon positions (moved off the numbers)
  const sunAngle = hoursToAngle(currentHour) - 90;
  const moonAngle = hoursToAngle(moonData.hour) - 90;
  
  // Check if in prime window
  const inMorningPrime = currentHour >= sunTimes.morningPrimeStart && currentHour <= sunTimes.morningPrimeEnd;
  const inEveningPrime = currentHour >= sunTimes.eveningPrimeStart && currentHour <= sunTimes.eveningPrimeEnd;
  const inPrimeWindow = inMorningPrime || inEveningPrime;

  // Create SVG path for pie slice segments (extending to center)
  const createPieSlice = (startHour: number, endHour: number) => {
    const startAngle = hoursToAngle(startHour) - 90;
    const endAngle = hoursToAngle(endHour) - 90;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const centerX = 160;
    const centerY = 160;
    const radius = 120;
    
    const x1 = centerX + Math.cos(startAngleRad) * radius;
    const y1 = centerY + Math.sin(startAngleRad) * radius;
    const x2 = centerX + Math.cos(endAngleRad) * radius;
    const y2 = centerY + Math.sin(endAngleRad) * radius;
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Generate time segments with colors (full pie slices)
  const timeSegments = [
    // Deep night (astronomical night to astronomical dawn)
    {
      start: 0,
      end: sunTimes.astronomicalNightEnd,
      color: '#0f172a',
      label: 'Deep Night'
    },
    {
      start: sunTimes.astronomicalNightStart,
      end: 24,
      color: '#0f172a',
      label: 'Deep Night'
    },
    // Astronomical twilight
    {
      start: sunTimes.astronomicalNightEnd,
      end: sunTimes.nauticalTwilightEnd,
      color: '#312e81',
      label: 'Astronomical Dawn'
    },
    {
      start: sunTimes.nauticalTwilightStart,
      end: sunTimes.astronomicalNightStart,
      color: '#312e81',
      label: 'Astronomical Dusk'
    },
    // Nautical twilight
    {
      start: sunTimes.nauticalTwilightEnd,
      end: sunTimes.civilTwilightEnd,
      color: '#1e40af',
      label: 'Nautical Dawn'
    },
    {
      start: sunTimes.civilTwilightStart,
      end: sunTimes.nauticalTwilightStart,
      color: '#1e40af',
      label: 'Nautical Dusk'
    },
    // Civil twilight
    {
      start: sunTimes.civilTwilightEnd,
      end: sunTimes.sunrise,
      color: '#f59e0b',
      label: 'Civil Dawn'
    },
    {
      start: sunTimes.sunset,
      end: sunTimes.civilTwilightStart,
      color: '#dc2626',
      label: 'Civil Dusk'
    },
    // Morning prime window
    {
      start: sunTimes.morningPrimeStart,
      end: sunTimes.morningPrimeEnd,
      color: '#fbbf24',
      label: 'Morning Prime',
      isPrime: true
    },
    // Day (between prime windows)
    {
      start: sunTimes.morningPrimeEnd,
      end: sunTimes.eveningPrimeStart,
      color: '#60a5fa',
      label: 'Daylight'
    },
    // Evening prime window
    {
      start: sunTimes.eveningPrimeStart,
      end: sunTimes.eveningPrimeEnd,
      color: '#f97316',
      label: 'Evening Prime',
      isPrime: true
    }
  ];

  // Hour markers
  const hourMarkers = Array.from({ length: 24 }, (_, i) => {
    const angle = hoursToAngle(i) - 90;
    const isMainHour = i % 6 === 0;
    return { hour: i, angle, isMainHour };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-4 flex items-center justify-center relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-400/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial from-purple-400/20 to-transparent rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-2xl mb-2 tracking-wide">SolCue</h1>
          <p className="text-lg text-white/90 drop-shadow-lg">Circadian Light Tracker</p>
        </div>

        {/* Main Clock Container */}
        <div className="relative flex justify-center items-center">
          {/* Clock Face */}
          <div className="relative w-80 h-80">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full bg-black/30 backdrop-blur-sm border border-white/20"></div>
            
            {/* Clock segments - now full pie slices */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
              <defs>
                <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#e5e7eb" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#9ca3af" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#9ca3af" stopOpacity="0" />
                </radialGradient>
              </defs>
              
              {timeSegments.map((segment, index) => (
                <path
                  key={index}
                  d={createPieSlice(segment.start, segment.end)}
                  fill={segment.color}
                  opacity={segment.isPrime ? 0.9 : 0.7}
                  className={segment.isPrime ? 'animate-pulse' : ''}
                />
              ))}
            </svg>

            {/* Hour markers */}
            {hourMarkers.map((marker, index) => {
              const radius = 135;
              const x = 160 + Math.cos((marker.angle * Math.PI) / 180) * radius;
              const y = 160 + Math.sin((marker.angle * Math.PI) / 180) * radius;
              
              return (
                <div
                  key={index}
                  className="absolute text-white text-xs font-medium"
                  style={{
                    left: x - 8,
                    top: y - 8,
                    fontSize: marker.isMainHour ? '14px' : '10px',
                    opacity: marker.isMainHour ? 1 : 0.7,
                    textShadow: '0 0 4px rgba(0,0,0,0.8)'
                  }}
                >
                  {marker.hour}
                </div>
              );
            })}

            {/* Current time sun indicator - moved closer to center */}
            <div
              className="absolute w-6 h-6 -ml-3 -mt-3 transition-all duration-1000"
              style={{
                left: 160 + Math.cos((sunAngle * Math.PI) / 180) * 100,
                top: 160 + Math.sin((sunAngle * Math.PI) / 180) * 100,
              }}
            >
              <div className="relative">
                {/* Enhanced sun glow */}
                <div className="absolute inset-0 w-16 h-16 -ml-5 -mt-5 rounded-full" style={{
                  background: 'radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, rgba(245, 158, 11, 0.4) 40%, rgba(245, 158, 11, 0) 70%)',
                  filter: 'blur(4px)',
                  animation: 'pulse 2s infinite'
                }}></div>
                {/* Realistic sun */}
                <div className="relative z-10 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-orange-500 shadow-lg border border-yellow-300/50"></div>
              </div>
            </div>

            {/* Moon indicator */}
            {moonData.visible && (
              <div
                className="absolute w-4 h-4 -ml-2 -mt-2 transition-all duration-1000"
                style={{
                  left: 160 + Math.cos((moonAngle * Math.PI) / 180) * 100,
                  top: 160 + Math.sin((moonAngle * Math.PI) / 180) * 100,
                }}
              >
                <div className="relative">
                  {/* Moon glow */}
                  <div className="absolute inset-0 w-8 h-8 -ml-2 -mt-2 rounded-full" style={{
                    background: 'radial-gradient(circle, rgba(229, 231, 235, 0.6) 0%, rgba(156, 163, 175, 0.3) 40%, rgba(156, 163, 175, 0) 70%)',
                    filter: 'blur(2px)'
                  }}></div>
                  {/* Realistic moon */}
                  <div className="relative z-10 w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 shadow-md border border-gray-200/50"></div>
                </div>
              </div>
            )}

            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-white rounded-full shadow-lg"></div>
          </div>
        </div>

        {/* Time Display */}
        <div className="mt-8 text-center">
          <div className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-lg text-white/90">
            {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          
          {inPrimeWindow && (
            <div className="mt-4 px-6 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full border border-yellow-400/30">
              <span className="text-yellow-200 font-medium">Prime Light Window</span>
            </div>
          )}
        </div>

        {/* Tide Information (replaces prime time blocks) */}
        <div className="mt-8">
          <button 
            onClick={() => setShowTides(!showTides)}
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white/90 hover:bg-white/20 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <Waves className="w-4 h-4" />
            Tides {showTides ? '▼' : '▶'}
          </button>
          
          {showTides && (
            <div className="mt-4 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 animate-fade-in">
              <div className="text-white/90 mb-2">Current Tide</div>
              <div className="text-blue-200 font-mono text-lg mb-2">
                {tideData.isHigh ? 'High' : 'Low'} - {tideData.height}
              </div>
              <div className="text-white/70 text-sm">
                Next {tideData.isHigh ? 'low' : 'high'} in {tideData.nextChange.toFixed(1)}h
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-blue-500/50">
            {inPrimeWindow ? 'Start Light Session' : 'Add Manual Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSunClock;
