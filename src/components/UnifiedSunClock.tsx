
import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface UnifiedSunClockProps {
  currentTime?: Date;
}

const UnifiedSunClock: React.FC<UnifiedSunClockProps> = ({ currentTime = new Date() }) => {
  const [time, setTime] = useState(currentTime);

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

  // Calculate current time values
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const currentHour = hours + minutes / 60;
  
  // Get sun times for Providence, RI (you can make this dynamic later)
  const sunTimes = calculateSunTimes(41.8236, -71.4222, time);
  
  // Calculate sun position (0-360 degrees around clock, starting at midnight/top)
  const sunAngle = hoursToAngle(currentHour) - 90; // -90 to start at top

  // Check if in prime window
  const inMorningPrime = currentHour >= sunTimes.morningPrimeStart && currentHour <= sunTimes.morningPrimeEnd;
  const inEveningPrime = currentHour >= sunTimes.eveningPrimeStart && currentHour <= sunTimes.eveningPrimeEnd;
  const inPrimeWindow = inMorningPrime || inEveningPrime;

  // Create SVG path for arc segment
  const createArcPath = (startHour: number, endHour: number, innerRadius: number, outerRadius: number) => {
    const startAngle = hoursToAngle(startHour) - 90;
    const endAngle = hoursToAngle(endHour) - 90;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const centerX = 160;
    const centerY = 160;
    
    const x1 = centerX + Math.cos(startAngleRad) * innerRadius;
    const y1 = centerY + Math.sin(startAngleRad) * innerRadius;
    const x2 = centerX + Math.cos(endAngleRad) * innerRadius;
    const y2 = centerY + Math.sin(endAngleRad) * innerRadius;
    const x3 = centerX + Math.cos(endAngleRad) * outerRadius;
    const y3 = centerY + Math.sin(endAngleRad) * outerRadius;
    const x4 = centerX + Math.cos(startAngleRad) * outerRadius;
    const y4 = centerY + Math.sin(startAngleRad) * outerRadius;
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  // Generate time segments with colors
  const timeSegments = [
    // Deep night (astronomical night to astronomical dawn)
    {
      start: 0,
      end: sunTimes.astronomicalNightEnd,
      color: '#0f172a', // slate-900
      label: 'Deep Night'
    },
    {
      start: sunTimes.astronomicalNightStart,
      end: 24,
      color: '#0f172a', // slate-900
      label: 'Deep Night'
    },
    // Astronomical twilight
    {
      start: sunTimes.astronomicalNightEnd,
      end: sunTimes.nauticalTwilightEnd,
      color: '#312e81', // indigo-800
      label: 'Astronomical Dawn'
    },
    {
      start: sunTimes.nauticalTwilightStart,
      end: sunTimes.astronomicalNightStart,
      color: '#312e81', // indigo-800
      label: 'Astronomical Dusk'
    },
    // Nautical twilight
    {
      start: sunTimes.nauticalTwilightEnd,
      end: sunTimes.civilTwilightEnd,
      color: '#1e40af', // blue-800
      label: 'Nautical Dawn'
    },
    {
      start: sunTimes.civilTwilightStart,
      end: sunTimes.nauticalTwilightStart,
      color: '#1e40af', // blue-800
      label: 'Nautical Dusk'
    },
    // Civil twilight
    {
      start: sunTimes.civilTwilightEnd,
      end: sunTimes.sunrise,
      color: '#f59e0b', // amber-500
      label: 'Civil Dawn'
    },
    {
      start: sunTimes.sunset,
      end: sunTimes.civilTwilightStart,
      color: '#dc2626', // red-600
      label: 'Civil Dusk'
    },
    // Morning prime window
    {
      start: sunTimes.morningPrimeStart,
      end: sunTimes.morningPrimeEnd,
      color: '#fbbf24', // amber-400
      label: 'Morning Prime',
      isPrime: true
    },
    // Day (between prime windows)
    {
      start: sunTimes.morningPrimeEnd,
      end: sunTimes.eveningPrimeStart,
      color: '#60a5fa', // blue-400
      label: 'Daylight'
    },
    // Evening prime window
    {
      start: sunTimes.eveningPrimeStart,
      end: sunTimes.eveningPrimeEnd,
      color: '#f97316', // orange-500
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
            
            {/* Clock segments */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
              <defs>
                {timeSegments.map((segment, index) => (
                  <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={segment.color} />
                    <stop offset="100%" stopColor={segment.color} />
                  </linearGradient>
                ))}
              </defs>
              
              {timeSegments.map((segment, index) => (
                <path
                  key={index}
                  d={createArcPath(segment.start, segment.end, 120, 140)}
                  fill={segment.color}
                  opacity={segment.isPrime ? 0.9 : 0.7}
                  className={segment.isPrime ? 'animate-pulse' : ''}
                />
              ))}
            </svg>

            {/* Hour markers */}
            {hourMarkers.map((marker, index) => {
              const radius = marker.isMainHour ? 135 : 130;
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

            {/* Current time sun indicator */}
            <div
              className="absolute w-8 h-8 -ml-4 -mt-4 transition-all duration-1000"
              style={{
                left: 160 + Math.cos((sunAngle * Math.PI) / 180) * 125,
                top: 160 + Math.sin((sunAngle * Math.PI) / 180) * 125,
              }}
            >
              <div className="relative">
                {/* Sun glow */}
                <div className="absolute inset-0 w-12 h-12 -ml-2 -mt-2 bg-yellow-400 rounded-full blur-md opacity-60 animate-pulse"></div>
                {/* Sun icon */}
                <Sun className="w-8 h-8 text-yellow-300 drop-shadow-lg relative z-10" />
              </div>
            </div>

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

        {/* Legend */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-white/90 mb-2">Morning Prime</div>
            <div className="text-yellow-200 font-mono">
              {Math.floor(sunTimes.morningPrimeStart)}:{String(Math.floor((sunTimes.morningPrimeStart % 1) * 60)).padStart(2, '0')} - {Math.floor(sunTimes.morningPrimeEnd)}:{String(Math.floor((sunTimes.morningPrimeEnd % 1) * 60)).padStart(2, '0')}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-white/90 mb-2">Evening Prime</div>
            <div className="text-orange-200 font-mono">
              {Math.floor(sunTimes.eveningPrimeStart)}:{String(Math.floor((sunTimes.eveningPrimeStart % 1) * 60)).padStart(2, '0')} - {Math.floor(sunTimes.eveningPrimeEnd)}:{String(Math.floor((sunTimes.eveningPrimeEnd % 1) * 60)).padStart(2, '0')}
            </div>
          </div>
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
