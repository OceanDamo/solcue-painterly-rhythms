
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

  // Calculate time values
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  
  // Sun times (demo values - replace with real calculation)
  const sunriseMinutes = 6 * 60; // 6:00 AM
  const sunsetMinutes = 18 * 60; // 6:00 PM
  
  // Extended prime windows (2h 15m each)
  const morningPrimeStart = sunriseMinutes - 15; // 5:45 AM
  const morningPrimeEnd = sunriseMinutes + 135; // 8:15 AM
  const eveningPrimeStart = sunsetMinutes - 135; // 3:45 PM
  const eveningPrimeEnd = sunsetMinutes + 15; // 6:15 PM
  
  // Twilight phases
  const astronomicalDawnStart = sunriseMinutes - 90; // 4:30 AM
  const nauticalDawnStart = sunriseMinutes - 60; // 5:00 AM
  const civilDawnStart = sunriseMinutes - 30; // 5:30 AM
  const civilDuskEnd = sunsetMinutes + 30; // 6:30 PM
  const nauticalDuskEnd = sunsetMinutes + 60; // 7:00 PM
  const astronomicalDuskEnd = sunsetMinutes + 90; // 7:30 PM

  // Calculate sun position (0-360 degrees around clock)
  const sunAngle = (totalMinutes / (24 * 60)) * 360 - 90; // -90 to start at top

  // Check if in prime window
  const inMorningPrime = totalMinutes >= morningPrimeStart && totalMinutes <= morningPrimeEnd;
  const inEveningPrime = totalMinutes >= eveningPrimeStart && totalMinutes <= eveningPrimeEnd;
  const inPrimeWindow = inMorningPrime || inEveningPrime;

  // Generate clock segments for different phases
  const generateClockSegments = () => {
    const segments = [];
    const segmentCount = 96; // 15-minute segments for smooth gradients
    
    for (let i = 0; i < segmentCount; i++) {
      const segmentMinutes = (i * 15);
      const startAngle = (segmentMinutes / (24 * 60)) * 360 - 90;
      const endAngle = ((segmentMinutes + 15) / (24 * 60)) * 360 - 90;
      
      let color = '';
      let opacity = 0.6;
      
      // Determine color based on time phase
      if (segmentMinutes >= astronomicalDawnStart && segmentMinutes < nauticalDawnStart) {
        // Astronomical dawn - deep purple to navy
        color = 'from-indigo-900 to-purple-800';
        opacity = 0.8;
      } else if (segmentMinutes >= nauticalDawnStart && segmentMinutes < civilDawnStart) {
        // Nautical dawn - navy to deep blue
        color = 'from-purple-800 to-blue-700';
        opacity = 0.7;
      } else if (segmentMinutes >= civilDawnStart && segmentMinutes < sunriseMinutes) {
        // Civil dawn - deep blue to sunrise colors
        color = 'from-blue-700 to-orange-400';
        opacity = 0.8;
      } else if (segmentMinutes >= morningPrimeStart && segmentMinutes <= morningPrimeEnd) {
        // Morning prime window - warm sunrise colors
        color = 'from-orange-400 via-yellow-400 to-amber-300';
        opacity = inMorningPrime ? 1.0 : 0.9;
      } else if (segmentMinutes > morningPrimeEnd && segmentMinutes < eveningPrimeStart) {
        // Daytime - bright sky colors
        color = 'from-sky-400 to-blue-400';
        opacity = 0.7;
      } else if (segmentMinutes >= eveningPrimeStart && segmentMinutes <= eveningPrimeEnd) {
        // Evening prime window - warm sunset colors
        color = 'from-orange-500 via-red-400 to-pink-500';
        opacity = inEveningPrime ? 1.0 : 0.9;
      } else if (segmentMinutes > sunsetMinutes && segmentMinutes < civilDuskEnd) {
        // Civil dusk - sunset to deep blue
        color = 'from-pink-500 to-blue-700';
        opacity = 0.8;
      } else if (segmentMinutes >= civilDuskEnd && segmentMinutes < nauticalDuskEnd) {
        // Nautical dusk - deep blue to navy
        color = 'from-blue-700 to-purple-800';
        opacity = 0.7;
      } else if (segmentMinutes >= nauticalDuskEnd && segmentMinutes < astronomicalDuskEnd) {
        // Astronomical dusk - navy to deep purple
        color = 'from-purple-800 to-indigo-900';
        opacity = 0.8;
      } else {
        // Night - deep cosmic colors
        color = 'from-indigo-900 to-slate-900';
        opacity = 0.9;
      }

      segments.push({
        startAngle,
        endAngle,
        color,
        opacity,
        isPrime: (segmentMinutes >= morningPrimeStart && segmentMinutes <= morningPrimeEnd) ||
                (segmentMinutes >= eveningPrimeStart && segmentMinutes <= eveningPrimeEnd)
      });
    }
    
    return segments;
  };

  const clockSegments = generateClockSegments();

  // Hour markers
  const hourMarkers = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * 360 - 90;
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
                {clockSegments.map((segment, index) => (
                  <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={segment.color.includes('from-') ? segment.color.split(' ')[0].replace('from-', '') : '#3b82f6'} />
                    <stop offset="100%" stopColor={segment.color.includes('to-') ? segment.color.split(' ').pop()?.replace('to-', '') : '#1d4ed8'} />
                  </linearGradient>
                ))}
              </defs>
              
              {clockSegments.map((segment, index) => {
                const radius = 140;
                const innerRadius = 120;
                const centerX = 160;
                const centerY = 160;
                
                const startAngleRad = (segment.startAngle * Math.PI) / 180;
                const endAngleRad = (segment.endAngle * Math.PI) / 180;
                
                const x1 = centerX + Math.cos(startAngleRad) * innerRadius;
                const y1 = centerY + Math.sin(startAngleRad) * innerRadius;
                const x2 = centerX + Math.cos(endAngleRad) * innerRadius;
                const y2 = centerY + Math.sin(endAngleRad) * innerRadius;
                const x3 = centerX + Math.cos(endAngleRad) * radius;
                const y3 = centerY + Math.sin(endAngleRad) * radius;
                const x4 = centerX + Math.cos(startAngleRad) * radius;
                const y4 = centerY + Math.sin(startAngleRad) * radius;
                
                const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                
                return (
                  <path
                    key={index}
                    d={`M ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`}
                    fill={`url(#gradient-${index})`}
                    opacity={segment.opacity}
                    className={segment.isPrime ? 'animate-pulse' : ''}
                  />
                );
              })}
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
            <div className="text-yellow-200 font-mono">5:45 AM - 8:15 AM</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-white/90 mb-2">Evening Prime</div>
            <div className="text-orange-200 font-mono">3:45 PM - 6:15 PM</div>
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
