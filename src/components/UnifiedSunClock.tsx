
import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import SacredTracker from './SacredTracker';

const UnifiedSunClock = () => {
  const [time, setTime] = useState(new Date());
  const [isInPrimeWindow, setIsInPrimeWindow] = useState(false);

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

  // Calculate sun position (0-360 degrees)
  const sunAngle = (totalMinutes / (24 * 60)) * 360;

  // Enhanced painterly color palette based on time
  const getTimeColors = () => {
    if (hours >= 5 && hours < 8) {
      // Sunrise colors - warm dawn palette
      return {
        primary: 'from-rose-300 via-orange-300 via-amber-300 to-yellow-400',
        secondary: 'from-pink-200 via-orange-200 to-yellow-300',
        accent: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
        glow: 'shadow-orange-400/60',
        atmospheric: 'from-orange-200/40 via-pink-300/30 to-yellow-200/20',
        textured: 'from-amber-500/20 via-orange-400/30 to-rose-400/20'
      };
    } else if (hours >= 8 && hours < 17) {
      // Daytime colors - clear sky palette
      return {
        primary: 'from-sky-300 via-blue-400 via-cyan-400 to-teal-400',
        secondary: 'from-blue-200 via-cyan-200 to-sky-300',
        accent: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500',
        glow: 'shadow-blue-400/60',
        atmospheric: 'from-cyan-200/40 via-blue-300/30 to-sky-200/20',
        textured: 'from-blue-500/20 via-cyan-400/30 to-teal-400/20'
      };
    } else if (hours >= 17 && hours < 20) {
      // Sunset colors - dramatic evening palette
      return {
        primary: 'from-red-400 via-orange-500 via-pink-500 to-purple-600',
        secondary: 'from-orange-300 via-red-300 to-pink-400',
        accent: 'bg-gradient-to-br from-orange-500 via-red-500 to-purple-600',
        glow: 'shadow-red-400/60',
        atmospheric: 'from-red-200/40 via-orange-300/30 to-purple-200/20',
        textured: 'from-red-500/20 via-orange-400/30 to-pink-400/20'
      };
    } else {
      // Night colors - deep cosmic palette
      return {
        primary: 'from-indigo-700 via-purple-700 via-blue-800 to-slate-800',
        secondary: 'from-indigo-400 via-purple-500 to-blue-600',
        accent: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-slate-700',
        glow: 'shadow-purple-400/60',
        atmospheric: 'from-indigo-300/40 via-purple-400/30 to-slate-300/20',
        textured: 'from-indigo-600/20 via-purple-500/30 to-blue-600/20'
      };
    }
  };

  const colors = getTimeColors();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.primary} p-4 transition-all duration-2000 ease-in-out relative overflow-hidden`}>
      {/* Atmospheric background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-radial ${colors.atmospheric} opacity-60 animate-breathe`}></div>
        
        <div className={`absolute top-1/6 left-1/5 w-96 h-64 bg-gradient-to-br ${colors.textured} opacity-50 rounded-full blur-3xl animate-float transform rotate-12`}></div>
        <div className={`absolute bottom-1/4 right-1/6 w-80 h-96 bg-gradient-to-tl ${colors.textured} opacity-40 rounded-full blur-2xl animate-float delay-500 transform -rotate-12`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial ${colors.secondary} opacity-30 rounded-full blur-xl animate-pulse delay-1000`}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-light text-white drop-shadow-2xl mb-2 tracking-wide" style={{
            textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)'
          }}>SolCue</h1>
          <p className="text-xl text-white/95 drop-shadow-lg tracking-wider font-light">Circadian Light Tracker</p>
        </div>

        {/* Main Clock Container */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Main Clock Face */}
            <div className="w-80 h-80 rounded-full relative">
              {/* Clock Face Background */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-4 border-white/20"></div>
              
              {/* 24-Hour Labels */}
              {Array.from({ length: 24 }, (_, i) => {
                const angle = (i * 15) - 90; // Start from top (12a)
                const radian = (angle * Math.PI) / 180;
                const radius = 130;
                const x = Math.cos(radian) * radius;
                const y = Math.sin(radian) * radius;
                
                return (
                  <div
                    key={i}
                    className="absolute text-white/80 text-sm font-light"
                    style={{
                      left: `calc(50% + ${x}px - 12px)`,
                      top: `calc(50% + ${y}px - 8px)`,
                      width: '24px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i-12}p`}
                  </div>
                );
              })}

              {/* Sun Position Indicator */}
              <div
                className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `calc(50% + ${Math.cos((sunAngle - 90) * Math.PI / 180) * 100}px)`,
                  top: `calc(50% + ${Math.sin((sunAngle - 90) * Math.PI / 180) * 100}px)`,
                  boxShadow: '0 0 20px rgba(255, 193, 7, 0.8)'
                }}
              >
                <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse"></div>
              </div>

              {/* Center Time Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-light text-white drop-shadow-2xl tracking-wider mb-2" style={{
                    textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)'
                  }}>
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm text-white/90 drop-shadow-lg tracking-wide font-light">
                    {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Prime Time Glow Effect */}
              {isInPrimeWindow && (
                <div className="absolute inset-0 rounded-full animate-pulse" style={{
                  boxShadow: '0 0 40px rgba(255, 193, 7, 0.6), inset 0 0 40px rgba(255, 193, 7, 0.2)'
                }}></div>
              )}
            </div>
          </div>

          {/* Start Light Session Button */}
          <div className="mt-8">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-12 rounded-full text-lg shadow-2xl transition-all duration-300 transform hover:scale-105">
              Start Light Session
            </button>
          </div>

          {/* Circadian Tracker - New gentle tracking component */}
          <SacredTracker 
            isInPrimeWindow={isInPrimeWindow} 
            currentPhase={hours >= 6 && hours < 18 ? 'Day' : 'Night'}
          />
        </div>
      </div>
    </div>
  );
};

export default UnifiedSunClock;
