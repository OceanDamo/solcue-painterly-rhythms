
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import SacredTracker from './SacredTracker';

const UnifiedSunClock = () => {
  const [time, setTime] = useState(new Date());
  const [isInPrimeWindow, setIsInPrimeWindow] = useState(false);
  const [colorTheme, setColorTheme] = useState('natural');
  const [hourFormat, setHourFormat] = useState('12h');
  const [showSettings, setShowSettings] = useState(false);
  const [showTracker, setShowTracker] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate time-based values
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  
  // Simulate sunrise/sunset times (6 AM / 6 PM for demo)
  const sunriseMinutes = 6 * 60; // 6:00 AM
  const sunsetMinutes = 18 * 60; // 6:00 PM
  
  // Extended prime windows (2h 15m each)
  const morningPrimeStart = sunriseMinutes - 15; // 5:45 AM
  const morningPrimeEnd = sunriseMinutes + 135; // 8:15 AM
  const eveningPrimeStart = sunsetMinutes - 120; // 3:45 PM
  const eveningPrimeEnd = sunsetMinutes + 15; // 6:15 PM
  
  const inMorningPrime = totalMinutes >= morningPrimeStart && totalMinutes <= morningPrimeEnd;
  const inEveningPrime = totalMinutes >= eveningPrimeStart && totalMinutes <= eveningPrimeEnd;
  const currentlyInPrime = inMorningPrime || inEveningPrime;

  useEffect(() => {
    setIsInPrimeWindow(currentlyInPrime);
  }, [currentlyInPrime]);

  // Color themes
  const colorThemes = {
    natural: {
      daylight: '#FFD700',
      prime: '#FF8C00',
      night: '#2C3E50',
      background: 'from-blue-400 via-purple-500 to-pink-500',
      sunGlow: '#FFD700'
    },
    ocean: {
      daylight: '#00CED1',
      prime: '#1E90FF',
      night: '#191970',
      background: 'from-cyan-400 via-blue-500 to-indigo-600',
      sunGlow: '#00CED1'
    },
    forest: {
      daylight: '#32CD32',
      prime: '#228B22',
      night: '#2F4F4F',
      background: 'from-green-400 via-emerald-500 to-teal-600',
      sunGlow: '#32CD32'
    },
    sunset: {
      daylight: '#FF6347',
      prime: '#FF4500',
      night: '#8B0000',
      background: 'from-orange-400 via-red-500 to-purple-600',
      sunGlow: '#FF6347'
    }
  };

  const currentTheme = colorThemes[colorTheme];

  // Calculate sun position
  const sunAngle = (totalMinutes / (24 * 60)) * 360;
  
  // Generate 24 segments extending to center
  const generateSegments = () => {
    const segments = [];
    for (let i = 0; i < 24; i++) {
      const segmentStart = i * 15; // Each hour = 15 degrees
      const segmentEnd = (i + 1) * 15;
      const hourMinutes = i * 60;
      
      // Determine if this hour is in daylight
      const isDaylight = hourMinutes >= sunriseMinutes && hourMinutes < sunsetMinutes;
      const isPrimeTime = (hourMinutes >= morningPrimeStart && hourMinutes <= morningPrimeEnd) ||
                         (hourMinutes >= eveningPrimeStart && hourMinutes <= eveningPrimeEnd);
      
      let segmentColor = currentTheme.night;
      if (isDaylight) {
        segmentColor = isPrimeTime ? currentTheme.prime : currentTheme.daylight;
      }
      
      // Calculate path for segment extending to center
      const startAngle = (segmentStart - 90) * (Math.PI / 180);
      const endAngle = (segmentEnd - 90) * (Math.PI / 180);
      const outerRadius = 120;
      
      const x1 = 160; // center
      const y1 = 160; // center
      const x2 = 160 + Math.cos(endAngle) * outerRadius;
      const y2 = 160 + Math.sin(endAngle) * outerRadius;
      const x3 = 160 + Math.cos(startAngle) * outerRadius;
      const y3 = 160 + Math.sin(startAngle) * outerRadius;
      
      const largeArcFlag = segmentEnd - segmentStart <= 180 ? "0" : "1";
      
      const pathData = [
        `M ${x1} ${y1}`,
        `L ${x3} ${y3}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      segments.push(
        <path
          key={i}
          d={pathData}
          fill={segmentColor}
          opacity={isDaylight ? 0.9 : 0.4}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
      );
    }
    return segments;
  };

  const formatHourLabel = (hour) => {
    if (hourFormat === '12h') {
      if (hour === 0) return '12a';
      if (hour < 12) return `${hour}a`;
      if (hour === 12) return '12p';
      return `${hour - 12}p`;
    }
    return hour.toString().padStart(2, '0');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.background} p-4 transition-all duration-1000 ease-in-out relative overflow-hidden`}>
      {/* Top Navigation */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        {/* About Tab */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white/90 text-sm font-light">
              About
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-black/80 backdrop-blur-md border-white/20">
            <SheetHeader>
              <SheetTitle className="text-white font-light text-2xl">SolCue</SheetTitle>
              <SheetDescription className="text-white/80 font-light">
                Circadian Light Tracker
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4 text-white/90 font-light">
              <p>A natural rhythm tracker that helps you align with optimal light exposure times.</p>
              <p>The colored segments show daylight hours and prime light windows for circadian health.</p>
              <p>Created to help you reconnect with nature's timing.</p>
            </div>
          </SheetContent>
        </Sheet>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-light mb-2 block">Color Theme</label>
                <Select value={colorTheme} onValueChange={setColorTheme}>
                  <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Natural</SelectItem>
                    <SelectItem value="ocean">Ocean</SelectItem>
                    <SelectItem value="forest">Forest</SelectItem>
                    <SelectItem value="sunset">Sunset</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white text-sm font-light mb-2 block">Hour Format</label>
                <Select value={hourFormat} onValueChange={setHourFormat}>
                  <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 Hour</SelectItem>
                    <SelectItem value="24h">24 Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Settings Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-white/60 hover:text-white/90"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-16">
          <h1 className="text-6xl font-light text-white drop-shadow-2xl mb-2 tracking-wide" style={{
            textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)'
          }}>SolCue</h1>
          <p className="text-xl text-white/95 drop-shadow-lg tracking-wider font-light">Circadian Light Tracker</p>
        </div>

        {/* Main Clock Container */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Radial Sun Clock */}
            <div className="w-80 h-80 rounded-full relative">
              <svg width="320" height="320" className="absolute inset-0">
                {/* Clock face background */}
                <circle cx="160" cy="160" r="140" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                
                {/* Hour segments extending to center */}
                {generateSegments()}
                
                {/* Hour labels */}
                {Array.from({ length: 24 }, (_, i) => {
                  const angle = (i * 15) - 90;
                  const radian = (angle * Math.PI) / 180;
                  const radius = 130;
                  const x = 160 + Math.cos(radian) * radius;
                  const y = 160 + Math.sin(radian) * radius;
                  
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.8)"
                      fontSize="11"
                      fontWeight="300"
                    >
                      {formatHourLabel(i)}
                    </text>
                  );
                })}
              </svg>

              {/* Realistic Sun with Diffuse Glow */}
              <div
                className="absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `calc(50% + ${Math.cos((sunAngle - 90) * Math.PI / 180) * 100}px)`,
                  top: `calc(50% + ${Math.sin((sunAngle - 90) * Math.PI / 180) * 100}px)`,
                  background: `radial-gradient(circle, ${currentTheme.sunGlow} 0%, ${currentTheme.sunGlow}80 30%, ${currentTheme.sunGlow}40 60%, transparent 100%)`,
                  boxShadow: `0 0 20px ${currentTheme.sunGlow}, 0 0 40px ${currentTheme.sunGlow}80, 0 0 60px ${currentTheme.sunGlow}40`
                }}
              />

              {/* Prime Time Glow Effect */}
              {isInPrimeWindow && (
                <div className="absolute inset-0 rounded-full animate-pulse" style={{
                  boxShadow: `0 0 40px ${currentTheme.prime}, inset 0 0 40px rgba(255, 193, 7, 0.2)`
                }}></div>
              )}
            </div>

            {/* Time Display Below Clock */}
            <div className="mt-6 text-center">
              <div className="text-4xl font-light text-white drop-shadow-2xl tracking-wider mb-2" style={{
                textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)'
              }}>
                {time.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: hourFormat === '12h'
                })}
              </div>
              <div className="text-sm text-white/90 drop-shadow-lg tracking-wide font-light">
                {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Subtle Tracking Button */}
          <div className="mt-8 flex flex-col items-center space-y-4">
            {!showTracker ? (
              <Button
                variant="ghost"
                onClick={() => setShowTracker(true)}
                className="text-white/50 hover:text-white/80 text-sm font-light tracking-wide px-6 py-2"
              >
                Track Light Time
              </Button>
            ) : (
              <SacredTracker 
                isInPrimeWindow={isInPrimeWindow} 
                currentPhase={hours >= 6 && hours < 18 ? 'Day' : 'Night'}
                onClose={() => setShowTracker(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSunClock;
