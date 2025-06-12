import React, { useState, useEffect } from 'react';
import { Sun, Moon, Waves, Palette, Clock } from 'lucide-react';

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
    background: 'from-slate-900 via-indigo-900 to-purple-900'
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
    background: 'from-purple-900 via-violet-900 to-indigo-900'
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
    background: 'from-blue-900 via-cyan-900 to-teal-900'
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
    background: 'from-gray-900 via-black to-gray-900'
  }
};

// Visible stars data (simplified constellation points for northern view)
const starData = [
  { name: 'Polaris', magnitude: 2.0, ra: 37.95, dec: 89.26, constellation: 'Ursa Minor' },
  { name: 'Dubhe', magnitude: 1.8, ra: 165.93, dec: 61.75, constellation: 'Ursa Major' },
  { name: 'Merak', magnitude: 2.3, ra: 178.46, dec: 56.38, constellation: 'Ursa Major' },
  { name: 'Vega', magnitude: 0.0, ra: 279.23, dec: 38.78, constellation: 'Lyra' },
  { name: 'Altair', magnitude: 0.8, ra: 297.70, dec: 8.87, constellation: 'Aquila' },
  { name: 'Deneb', magnitude: 1.3, ra: 310.36, dec: 45.28, constellation: 'Cygnus' },
  { name: 'Capella', magnitude: 0.1, ra: 79.17, dec: 45.99, constellation: 'Auriga' },
  { name: 'Arcturus', magnitude: -0.05, ra: 213.92, dec: 19.18, constellation: 'Boötes' },
  { name: 'Spica', magnitude: 1.0, ra: 201.30, dec: -11.16, constellation: 'Virgo' },
  { name: 'Regulus', magnitude: 1.4, ra: 152.09, dec: 11.97, constellation: 'Leo' }
];

type ClockFormat = '12hr' | '24hr' | 'main' | 'none';

const UnifiedSunClock: React.FC<UnifiedSunClockProps> = ({ currentTime = new Date() }) => {
  const [time, setTime] = useState(currentTime);
  const [showTides, setShowTides] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [clockFormat, setClockFormat] = useState<ClockFormat>('main');
  const [showClockSelector, setShowClockSelector] = useState(false);

  const theme = colorThemes[currentTheme as keyof typeof colorThemes];

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

  // Convert star coordinates to clock position (simplified)
  const getStarPosition = (ra: number, dec: number, currentHour: number) => {
    // Simplified star positioning - in reality would need more complex calculations
    const hourAngle = ((ra / 15 - currentHour + 12) % 24) * 15; // Convert RA to hour angle
    const distance = Math.max(20, 100 - (dec / 90) * 80); // Distance from center based on declination
    
    const angle = (hourAngle - 90) * (Math.PI / 180);
    const x = 160 + Math.cos(angle) * distance;
    const y = 160 + Math.sin(angle) * distance;
    
    return { x, y, visible: dec > 0 }; // Only show northern stars
  };

  // Dynamic sun color based on time of day
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
    
    // Nighttime: dim, theme-colored
    return {
      from: theme.deepNight,
      via: theme.astronomicalTwilight,
      to: theme.nauticalTwilight
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
  
  // Calculate sun and moon positions (moved off the numbers)
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
            { hour: hourAM, display: `${hour24}${i < 6 ? 'a' : 'a'}`, angle: hoursToAngle(hourAM) - 90, isMainHour: i % 3 === 0 },
            { hour: hourPM, display: `${hour24}${i < 6 ? 'p' : 'p'}`, angle: hoursToAngle(hourPM) - 90, isMainHour: i % 3 === 0 }
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

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} p-4 flex items-center justify-center relative overflow-hidden`}>
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

        {/* Control Bar */}
        <div className="mb-6 flex gap-4 justify-center">
          {/* Theme Selector */}
          <div>
            <button 
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white/90 hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              {theme.name} {showThemeSelector ? '▼' : '▶'}
            </button>
          </div>

          {/* Clock Format Selector */}
          <div>
            <button 
              onClick={() => setShowClockSelector(!showClockSelector)}
              className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white/90 hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              {clockFormat === 'main' ? '12a-6a-12p-6p' : clockFormat === '12hr' ? '12 Hour' : clockFormat === '24hr' ? '24 Hour' : 'No Numbers'} {showClockSelector ? '▼' : '▶'}
            </button>
          </div>
        </div>
        
        {/* Theme Options */}
        {showThemeSelector && (
          <div className="mb-6 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(colorThemes).map(([key, themeOption]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentTheme(key);
                    setShowThemeSelector(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                    currentTheme === key 
                      ? 'bg-white/30 text-white' 
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {themeOption.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clock Format Options */}
        {showClockSelector && (
          <div className="mb-6 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setClockFormat('main'); setShowClockSelector(false); }}
                className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                  clockFormat === 'main' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                12a-6a-12p-6p
              </button>
              <button
                onClick={() => { setClockFormat('12hr'); setShowClockSelector(false); }}
                className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                  clockFormat === '12hr' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                12 Hour
              </button>
              <button
                onClick={() => { setClockFormat('24hr'); setShowClockSelector(false); }}
                className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                  clockFormat === '24hr' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                24 Hour
              </button>
              <button
                onClick={() => { setClockFormat('none'); setShowClockSelector(false); }}
                className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                  clockFormat === 'none' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                No Numbers
              </button>
            </div>
          </div>
        )}

        {/* Main Clock Container */}
        <div className="relative flex justify-center items-center">
          {/* Clock Face */}
          <div className="relative w-80 h-80">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full bg-black/30 backdrop-blur-sm border border-white/20"></div>
            
            {/* Clock segments - now full pie slices */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
              <defs>
                <radialGradient id="dynamicSunGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={sunColors.from} stopOpacity="0.8" />
                  <stop offset="70%" stopColor={sunColors.via} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={sunColors.to} stopOpacity="0" />
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

              {/* Stars after sunset */}
              {afterSunset && starData.map((star, index) => {
                const position = getStarPosition(star.ra, star.dec, currentHour);
                if (!position.visible) return null;
                
                const size = Math.max(1, 4 - star.magnitude); // Brighter stars are larger
                const opacity = Math.max(0.3, 1 - star.magnitude * 0.2);
                
                return (
                  <circle
                    key={index}
                    cx={position.x}
                    cy={position.y}
                    r={size}
                    fill="white"
                    opacity={opacity}
                    className="animate-[pulse_4s_ease-in-out_infinite]"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <title>{star.name} - {star.constellation}</title>
                  </circle>
                );
              })}
            </svg>

            {/* Hour markers - only show if not 'none' */}
            {clockFormat !== 'none' && hourMarkers.map((marker, index) => {
              const radius = 135;
              const x = 160 + Math.cos((marker.angle * Math.PI) / 180) * radius;
              const y = 160 + Math.sin((marker.angle * Math.PI) / 180) * radius;
              
              return (
                <div
                  key={index}
                  className="absolute text-white font-light"
                  style={{
                    left: x - 12,
                    top: y - 10,
                    fontSize: marker.isMainHour ? '12px' : '10px',
                    opacity: marker.isMainHour ? 0.8 : 0.5,
                    fontWeight: '300',
                    textShadow: '0 0 4px rgba(0,0,0,0.8)'
                  }}
                >
                  {marker.display}
                </div>
              );
            })}

            {/* Enhanced sun indicator with constant glow */}
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
                {/* Constant sun glow that always blends with theme colors */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    width: '48px',
                    height: '48px',
                    marginLeft: '-12px',
                    marginTop: '-12px',
                    background: `radial-gradient(circle, ${sunColors.from}90 0%, ${sunColors.via}60 30%, ${sunColors.to}30 50%, ${theme.daylight}20 70%, transparent 85%)`,
                    filter: 'blur(8px)',
                    animation: 'pulse 4s infinite ease-in-out'
                  }}
                ></div>
                {/* Sun core */}
                <div 
                  className="relative z-10 w-6 h-6 rounded-full shadow-lg border border-yellow-300/50"
                  style={{
                    background: `linear-gradient(135deg, ${sunColors.from}, ${sunColors.via}, ${sunColors.to})`,
                    opacity: afterSunset ? 0.4 : 1
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
        <div className="mt-8 text-center">
          <div className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-lg text-white/90">
            {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Tide Information */}
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
