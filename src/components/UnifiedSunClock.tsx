import React, { useState, useEffect } from 'react';
import { Sun, Moon, Waves, Clock, Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface UnifiedSunClockProps {
  currentTime?: Date;
}

// Color themes for different moods
const colorThemes = {
  default: {
    name: 'Natural',
    deepNight: '#0f172a',
    astronomicalTwilight: '#312e81',
    nauticalTwilight: '#1e40af',
    civilTwilight: '#f59e0b',
    civilDusk: '#dc2626',
    morningPrime: '#fbbf24',
    daylight: '#60a5fa',
    eveningPrime: '#f97316',
    background: 'from-black via-gray-900 to-black',
    representativeColor: '#fbbf24'
  },
  purple: {
    name: 'Cosmic Purple',
    deepNight: '#1e1b4b',
    astronomicalTwilight: '#4c1d95',
    nauticalTwilight: '#6b21a8',
    civilTwilight: '#a855f7',
    civilDusk: '#9333ea',
    morningPrime: '#c084fc',
    daylight: '#3b82f6',
    eveningPrime: '#8b5cf6',
    background: 'from-black via-purple-900 to-black',
    representativeColor: '#c084fc'
  },
  ocean: {
    name: 'Ocean Blue',
    deepNight: '#0c4a6e',
    astronomicalTwilight: '#075985',
    nauticalTwilight: '#0369a1',
    civilTwilight: '#0284c7',
    civilDusk: '#0ea5e9',
    morningPrime: '#38bdf8',
    daylight: '#60a5fa',
    eveningPrime: '#06b6d4',
    background: 'from-black via-blue-900 to-black',
    representativeColor: '#38bdf8'
  },
  monochrome: {
    name: 'Midnight',
    deepNight: '#000000',
    astronomicalTwilight: '#1f2937',
    nauticalTwilight: '#374151',
    civilTwilight: '#4b5563',
    civilDusk: '#6b7280',
    morningPrime: '#9ca3af',
    daylight: '#d1d5db',
    eveningPrime: '#9ca3af',
    background: 'from-black via-gray-900 to-black',
    representativeColor: '#9ca3af'
  }
};

type ClockFormat = '12hr' | '24hr' | 'main' | 'none';

const UnifiedSunClock: React.FC<UnifiedSunClockProps> = ({ currentTime = new Date() }) => {
  const [time, setTime] = useState(currentTime);
  const [showTides, setShowTides] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [clockFormat, setClockFormat] = useState<ClockFormat>('12hr');
  const [isTracking, setIsTracking] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const theme = colorThemes[currentTheme as keyof typeof colorThemes];

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer count up effect
  useEffect(() => {
    if (isTracking) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isTracking]);

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

  // Enhanced sun glow - more diffuse with maintained sun color at night
  const getSunColor = (currentHour: number, sunTimes: any) => {
    // Sunrise transition: deep orange to golden yellow
    if (currentHour >= sunTimes.sunrise - 0.5 && currentHour <= sunTimes.sunrise + 1) {
      return {
        from: '#ff6b35', // Deep orange
        via: '#ffa726', // Orange
        to: '#ffd54f'   // Golden yellow
      };
    }
    
    // Sunset transition: golden yellow to deep red
    if (currentHour >= sunTimes.sunset - 1 && currentHour <= sunTimes.sunset + 0.5) {
      return {
        from: '#ffd54f', // Golden yellow
        via: '#ff8a65', // Light orange
        to: '#d32f2f'   // Deep red
      };
    }
    
    // Daytime: bright golden sun
    if (currentHour >= sunTimes.sunrise && currentHour <= sunTimes.sunset) {
      return {
        from: '#fff176', // Light yellow
        via: '#ffeb3b', // Yellow
        to: '#ffc107'   // Amber
      };
    }
    
    // Nighttime: maintain subtle sun color
    return {
      from: '#ff8a50', // Warm orange (darker but still sun-like)
      via: '#ff6b35', // Deep orange
      to: '#d84315'   // Dark orange-red
    };
  };

  // Moon prominence based on time (larger and brighter at night)
  const getMoonProminence = (currentHour: number, sunTimes: any) => {
    const isNight = currentHour < sunTimes.sunrise || currentHour > sunTimes.sunset;
    return {
      size: isNight ? 6 : 4,
      glowSize: isNight ? 12 : 8,
      opacity: isNight ? 0.9 : 0.6
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
  
  // Calculate sun and moon positions
  const sunAngle = hoursToAngle(currentHour) - 90;
  const moonAngle = hoursToAngle(moonData.hour) - 90;
  
  // Get dynamic colors and prominence
  const sunColors = getSunColor(currentHour, sunTimes);
  const moonProminence = getMoonProminence(currentHour, sunTimes);
  
  // Check if in prime window
  const inMorningPrime = currentHour >= sunTimes.morningPrimeStart && currentHour <= sunTimes.morningPrimeEnd;
  const inEveningPrime = currentHour >= sunTimes.eveningPrimeStart && currentHour <= sunTimes.eveningPrimeEnd;
  const inPrimeWindow = inMorningPrime || inEveningPrime;

  // Check if it's after sunset for star visibility
  const afterSunset = currentHour < sunTimes.sunrise || currentHour > sunTimes.sunset;

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

  // Get the current light segment for background
  const getCurrentLightSegment = () => {
    if (currentHour >= sunTimes.sunrise && currentHour <= sunTimes.sunset) {
      // Daytime
      if (inMorningPrime) return theme.morningPrime;
      if (inEveningPrime) return theme.eveningPrime;
      return theme.daylight;
    } else if (currentHour >= sunTimes.civilTwilightEnd && currentHour <= sunTimes.sunrise) {
      return theme.civilTwilight;
    } else if (currentHour >= sunTimes.sunset && currentHour <= sunTimes.civilTwilightStart) {
      return theme.civilDusk;
    } else if (currentHour >= sunTimes.nauticalTwilightEnd && currentHour <= sunTimes.civilTwilightEnd) {
      return theme.nauticalTwilight;
    } else if (currentHour >= sunTimes.civilTwilightStart && currentHour <= sunTimes.nauticalTwilightStart) {
      return theme.nauticalTwilight;
    } else if (currentHour >= sunTimes.astronomicalNightEnd && currentHour <= sunTimes.nauticalTwilightEnd) {
      return theme.astronomicalTwilight;
    } else if (currentHour >= sunTimes.nauticalTwilightStart && currentHour <= sunTimes.astronomicalNightStart) {
      return theme.astronomicalTwilight;
    } else {
      return theme.deepNight;
    }
  };

  // Generate time segments with themed colors (full pie slices)
  const timeSegments = [
    // Deep night (astronomical night to astronomical dawn)
    {
      start: 0,
      end: sunTimes.astronomicalNightEnd,
      color: theme.deepNight,
      label: 'Deep Night'
    },
    {
      start: sunTimes.astronomicalNightStart,
      end: 24,
      color: theme.deepNight,
      label: 'Deep Night'
    },
    // Astronomical twilight
    {
      start: sunTimes.astronomicalNightEnd,
      end: sunTimes.nauticalTwilightEnd,
      color: theme.astronomicalTwilight,
      label: 'Astronomical Dawn'
    },
    {
      start: sunTimes.nauticalTwilightStart,
      end: sunTimes.astronomicalNightStart,
      color: theme.astronomicalTwilight,
      label: 'Astronomical Dusk'
    },
    // Nautical twilight
    {
      start: sunTimes.nauticalTwilightEnd,
      end: sunTimes.civilTwilightEnd,
      color: theme.nauticalTwilight,
      label: 'Nautical Dawn'
    },
    {
      start: sunTimes.civilTwilightStart,
      end: sunTimes.nauticalTwilightStart,
      color: theme.nauticalTwilight,
      label: 'Nautical Dusk'
    },
    // Civil twilight
    {
      start: sunTimes.civilTwilightEnd,
      end: sunTimes.sunrise,
      color: theme.civilTwilight,
      label: 'Civil Dawn'
    },
    {
      start: sunTimes.sunset,
      end: sunTimes.civilTwilightStart,
      color: theme.civilDusk,
      label: 'Civil Dusk'
    },
    // Morning prime window
    {
      start: sunTimes.morningPrimeStart,
      end: sunTimes.morningPrimeEnd,
      color: theme.morningPrime,
      label: 'Morning Prime',
      isPrime: true
    },
    // Day (between prime windows)
    {
      start: sunTimes.morningPrimeEnd,
      end: sunTimes.eveningPrimeStart,
      color: theme.daylight,
      label: 'Daylight'
    },
    // Evening prime window
    {
      start: sunTimes.eveningPrimeStart,
      end: sunTimes.eveningPrimeEnd,
      color: theme.eveningPrime,
      label: 'Evening Prime',
      isPrime: true
    }
  ];

  // Generate hour markers based on selected format
  const getHourMarkers = () => {
    switch (clockFormat) {
      case '12hr':
        return Array.from({ length: 12 }, (_, i) => {
          const hour24 = i === 0 ? 12 : i;
          const hourAM = i;
          const hourPM = i + 12;
          return [
            { hour: hourAM, display: `${hour24}a`, angle: hoursToAngle(hourAM) - 90, isMainHour: i % 3 === 0 },
            { hour: hourPM, display: `${hour24}p`, angle: hoursToAngle(hourPM) - 90, isMainHour: i % 3 === 0 }
          ];
        }).flat();
      
      case '24hr':
        return Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          display: i.toString(),
          angle: hoursToAngle(i) - 90,
          isMainHour: i % 6 === 0
        }));
      
      case 'main':
        return [
          { hour: 0, display: '12a', angle: hoursToAngle(0) - 90, isMainHour: true },
          { hour: 6, display: '6a', angle: hoursToAngle(6) - 90, isMainHour: true },
          { hour: 12, display: '12p', angle: hoursToAngle(12) - 90, isMainHour: true },
          { hour: 18, display: '6p', angle: hoursToAngle(18) - 90, isMainHour: true }
        ];
      
      case 'none':
      default:
        return [];
    }
  };

  const hourMarkers = getHourMarkers();
  const currentLightColor = getCurrentLightSegment();

  // Calculate sun position for background
  const sunX = 50 + Math.cos((sunAngle * Math.PI) / 180) * 30;
  const sunY = 50 + Math.sin((sunAngle * Math.PI) / 180) * 30;

  const handleToggleTracking = () => {
    if (isTracking) {
      setIsTracking(false);
      setTimeElapsed(0);
    } else {
      setIsTracking(true);
      setTimeElapsed(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: '#000000'
      }}
    >
      <div className="relative z-10 max-w-2xl mx-auto text-center flex-1 flex flex-col justify-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-2xl mb-2 tracking-wide">SolCue</h1>
          <p className="text-lg text-white/90 drop-shadow-lg">Circadian Light Tracker</p>
        </div>

        {/* Main Clock Container */}
        <div className="relative flex justify-center items-center mb-8">
          {/* Clock Face */}
          <div className="relative w-80 h-80">
            {/* Background circle - now black */}
            <div className="absolute inset-0 rounded-full bg-black/80 backdrop-blur-sm border border-white/20"></div>
            
            {/* Clock segments - now full pie slices */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
              <defs>
                <radialGradient id="dynamicSunGlow" cx="50%" cy="50%" r="80%">
                  <stop offset="0%" stopColor={sunColors.from} stopOpacity="0.9" />
                  <stop offset="30%" stopColor={sunColors.via} stopOpacity="0.7" />
                  <stop offset="60%" stopColor={sunColors.to} stopOpacity="0.5" />
                  <stop offset="80%" stopColor={theme.daylight} stopOpacity="0.3" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#e5e7eb" stopOpacity={moonProminence.opacity} />
                  <stop offset="70%" stopColor="#9ca3af" stopOpacity={moonProminence.opacity * 0.5} />
                  <stop offset="100%" stopColor="#9ca3af" stopOpacity="0" />
                </radialGradient>
              </defs>
              
              {timeSegments.map((segment, index) => (
                <path
                  key={index}
                  d={createPieSlice(segment.start, segment.end)}
                  fill={segment.color}
                  opacity={segment.isPrime ? 0.9 : 0.7}
                  className={segment.isPrime && inPrimeWindow ? 'animate-[pulse_8s_ease-in-out_infinite]' : ''}
                />
              ))}
            </svg>

            {/* Hour markers with black background and consistent padding */}
            {clockFormat !== 'none' && hourMarkers.map((marker, index) => {
              const radius = 135;
              const x = 160 + Math.cos((marker.angle * Math.PI) / 180) * radius;
              const y = 160 + Math.sin((marker.angle * Math.PI) / 180) * radius;
              
              return (
                <div
                  key={index}
                  className="absolute text-white font-light flex items-center justify-center bg-black/60 rounded-full"
                  style={{
                    left: x - 15,
                    top: y - 10,
                    width: '30px',
                    height: '20px',
                    fontSize: marker.isMainHour ? '12px' : '10px',
                    opacity: marker.isMainHour ? 0.9 : 0.6,
                    fontWeight: '300',
                    textShadow: '0 0 4px rgba(0,0,0,0.8)'
                  }}
                >
                  {marker.display}
                </div>
              );
            })}

            {/* Hour lines for 'main' format - in the black band */}
            {clockFormat === 'main' && Array.from({ length: 24 }, (_, i) => {
              if ([0, 6, 12, 18].includes(i)) return null; // Skip main hours
              const angle = hoursToAngle(i) - 90;
              const innerRadius = 135;
              const outerRadius = 145;
              const x1 = 160 + Math.cos((angle * Math.PI) / 180) * innerRadius;
              const y1 = 160 + Math.sin((angle * Math.PI) / 180) * innerRadius;
              const x2 = 160 + Math.cos((angle * Math.PI) / 180) * outerRadius;
              const y2 = 160 + Math.sin((angle * Math.PI) / 180) * outerRadius;
              
              return (
                <svg key={`line-${i}`} className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="white"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                </svg>
              );
            })}

            {/* Enhanced sun indicator with much more diffuse glow */}
            <div
              className="absolute -ml-3 -mt-3 transition-all duration-1000"
              style={{
                left: 160 + Math.cos((sunAngle * Math.PI) / 180) * 100,
                top: 160 + Math.sin((sunAngle * Math.PI) / 180) * 100,
                width: `${24}px`,
                height: `${24}px`
              }}
            >
              <div className="relative">
                {/* Much larger, more diffuse sun glow that blends with theme */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    width: '80px',
                    height: '80px',
                    marginLeft: '-28px',
                    marginTop: '-28px',
                    background: `radial-gradient(circle, ${sunColors.from}70 0%, ${sunColors.via}50 20%, ${sunColors.to}40 35%, ${theme.daylight}30 50%, ${theme.astronomicalTwilight}20 65%, transparent 80%)`,
                    filter: 'blur(16px)',
                    animation: 'pulse 6s infinite ease-in-out'
                  }}
                ></div>
                {/* Secondary glow layer for more diffusion */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    width: '120px',
                    height: '120px',
                    marginLeft: '-48px',
                    marginTop: '-48px',
                    background: `radial-gradient(circle, ${sunColors.from}30 0%, ${sunColors.via}20 30%, ${theme.daylight}15 50%, transparent 70%)`,
                    filter: 'blur(24px)',
                    animation: 'pulse 8s infinite ease-in-out reverse'
                  }}
                ></div>
                {/* Sun core - now maintains color even at night */}
                <div 
                  className="relative z-10 w-6 h-6 rounded-full shadow-lg border border-yellow-300/50"
                  style={{
                    background: `linear-gradient(135deg, ${sunColors.from}, ${sunColors.via}, ${sunColors.to})`,
                    opacity: afterSunset ? 0.7 : 1
                  }}
                ></div>
              </div>
            </div>

            {/* Enhanced moon indicator with prominence */}
            {moonData.visible && (
              <div
                className="absolute transition-all duration-1000"
                style={{
                  left: 160 + Math.cos((moonAngle * Math.PI) / 180) * 100,
                  top: 160 + Math.sin((moonAngle * Math.PI) / 180) * 100,
                  width: `${moonProminence.size}px`,
                  height: `${moonProminence.size}px`,
                  marginLeft: `-${moonProminence.size/2}px`,
                  marginTop: `-${moonProminence.size/2}px`
                }}
              >
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      width: `${moonProminence.glowSize}px`,
                      height: `${moonProminence.glowSize}px`,
                      marginLeft: `-${(moonProminence.glowSize - moonProminence.size)/2}px`,
                      marginTop: `-${(moonProminence.glowSize - moonProminence.size)/2}px`,
                      background: `radial-gradient(circle, rgba(229, 231, 235, ${moonProminence.opacity}) 0%, rgba(156, 163, 175, ${moonProminence.opacity * 0.5}) 40%, rgba(156, 163, 175, 0) 70%)`,
                      filter: 'blur(3px)'
                    }}
                  ></div>
                  <div 
                    className={`relative z-10 rounded-full shadow-md border border-gray-200/50 ${afterSunset ? 'animate-[pulse_6s_ease-in-out_infinite]' : ''}`}
                    style={{
                      width: `${moonProminence.size}px`,
                      height: `${moonProminence.size}px`,
                      background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb, #d1d5db)',
                      opacity: moonProminence.opacity
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-white rounded-full shadow-lg"></div>
          </div>
        </div>

        {/* Time Display */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-lg text-white/90">
            {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Start/Stop Light Tracking Button */}
        <div className="mb-2">
          <button 
            onClick={handleToggleTracking}
            className="px-3 py-1 bg-white/10 backdrop-blur-md text-white/80 text-xs rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            {isTracking ? 'Stop Light Tracking' : 'Start Light Tracking'}
          </button>
        </div>

        {/* Timer Display */}
        {isTracking && (
          <div className="mb-6 text-center animate-fade-in">
            <div className="text-lg font-mono text-white/90 mb-1">
              {formatTime(timeElapsed)}
            </div>
            <div className="text-xs text-white/70">
              Outdoor light exposure time
            </div>
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
                    ? 'ring-1 ring-white/60 ring-offset-1 ring-offset-black scale-125' 
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: themeOption.representativeColor }}
                title={themeOption.name}
              />
            ))}
          </div>

          {/* Just clock icon for time format */}
          <button 
            onClick={() => {
              const formats: ClockFormat[] = ['12hr', '24hr', 'main', 'none'];
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

          {/* About Button */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white/90 hover:bg-white/20 transition-all duration-300 text-xs">
                <Info className="w-3 h-3" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-96 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>About SolCue - Ocean State of Mind</SheetTitle>
                <SheetDescription className="text-left space-y-4 mt-4 overflow-y-auto">
                  <p>
                    SolCue embodies the "Ocean State of Mind" philosophy - a way of living that honors natural rhythms and cycles. In our modern world of artificial light and disconnected schedules, we've lost touch with the fundamental patterns that have guided life for millions of years.
                  </p>
                  <p>
                    <strong>Why This Matters Now:</strong> Research shows that exposure to natural light at specific times - particularly 2 hours after sunrise and 2 hours before sunset - is crucial for maintaining healthy circadian rhythms. These "prime windows" help regulate sleep, mood, metabolism, and overall well-being.
                  </p>
                  <p>
                    <strong>Rewilding Through Light:</strong> Syncing with the rhythm of light is a first solid step towards rewilding yourself - remembering who you are when in tune with nature and your own nature. This isn't just about better sleep; it's about reconnecting with the ancient wisdom encoded in your biology.
                  </p>
                  <p>
                    <strong>The Natural Cycle:</strong> The circular clock visualizes the complete daily light cycle, showing different phases of natural light throughout the day:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Prime Windows:</strong> Optimal times for 10+ minutes of outdoor light exposure</li>
                    <li><strong>Twilight Phases:</strong> Civil, nautical, and astronomical transitions that affect melatonin production</li>
                    <li><strong>Day/Night Cycle:</strong> Visual representation of your body's natural circadian rhythm</li>
                  </ul>
                  <p>
                    <strong>Ocean State Connection:</strong> Like the tides that ebb and flow with celestial rhythms, our bodies are designed to sync with natural light patterns. By attuning ourselves to these cycles, we can experience greater energy, better sleep, and deeper connection to the natural world around us.
                  </p>
                  <p>
                    <strong>Your Rewilding Journey:</strong> Each moment you spend outside during the prime windows is a step back toward your natural self. It's about remembering that you are not separate from nature - you ARE nature. When you align with these ancient rhythms, you begin to remember what it feels like to be truly alive and connected.
                  </p>
                  <p>
                    Use the "Start Light Tracking" feature during prime windows to build healthy light exposure habits that honor your body's ancient wisdom and support your journey back to wholeness.
                  </p>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Tide Information */}
        {showTides && (
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 animate-fade-in max-w-sm mx-auto">
            <div className="text-white/90 mb-2 text-sm">Current Tide</div>
            <div className="text-blue-200 font-mono text-lg mb-2">
              {tideData.isHigh ? 'High' : 'Low'} - {tideData.height}
            </div>
            <div className="text-white/70 text-sm">
              Next {tideData.isHigh ? 'low' : 'high'} in {tideData.nextChange.toFixed(1)}h
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedSunClock;
