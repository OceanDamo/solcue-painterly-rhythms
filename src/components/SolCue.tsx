
import React, { useState, useEffect } from 'react';
import { Sun, Moon, MapPin, Play, Square } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useSessionTracking } from '@/hooks/useSessionTracking';

interface SolCueProps {
  currentTime?: Date;
}

const SolCue: React.FC<SolCueProps> = ({ currentTime = new Date() }) => {
  const [time, setTime] = useState(currentTime);
  const [isInPrimeWindow, setIsInPrimeWindow] = useState(false);
  
  // Location and session hooks
  const { location, loading: locationLoading, error: locationError, hasPermission, requestPermission, getCurrentLocation } = useLocation();
  const { currentSession, startSession, endSession, stats } = useSessionTracking();

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
  const eveningPrimeStart = sunsetMinutes - 135; // 3:45 PM
  const eveningPrimeEnd = sunsetMinutes + 15; // 6:15 PM
  
  const inMorningPrime = totalMinutes >= morningPrimeStart && totalMinutes <= morningPrimeEnd;
  const inEveningPrime = totalMinutes >= eveningPrimeStart && totalMinutes <= eveningPrimeEnd;
  const currentlyInPrime = inMorningPrime || inEveningPrime;

  useEffect(() => {
    setIsInPrimeWindow(currentlyInPrime);
  }, [currentlyInPrime]);

  const handleSessionAction = async () => {
    if (currentSession) {
      // End current session
      endSession();
    } else {
      // Start new session
      let currentLocation = location;
      
      if (!currentLocation && hasPermission) {
        currentLocation = await getCurrentLocation();
      } else if (!hasPermission) {
        await requestPermission();
      }
      
      const sessionType = inMorningPrime ? 'morning' : inEveningPrime ? 'evening' : 'manual';
      startSession(sessionType);
    }
  };

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
  const isPrimeTime = isInPrimeWindow;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.primary} p-4 transition-all duration-2000 ease-in-out relative overflow-hidden`}>
      {/* Enhanced atmospheric layers with painterly textures */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary atmospheric layer */}
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-radial ${colors.atmospheric} opacity-60 animate-breathe`}></div>
        
        {/* Floating paint strokes */}
        <div className={`absolute top-1/6 left-1/5 w-96 h-64 bg-gradient-to-br ${colors.textured} opacity-50 rounded-full blur-3xl animate-float transform rotate-12`}></div>
        <div className={`absolute bottom-1/4 right-1/6 w-80 h-96 bg-gradient-to-tl ${colors.textured} opacity-40 rounded-full blur-2xl animate-float delay-500 transform -rotate-12`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial ${colors.secondary} opacity-30 rounded-full blur-xl animate-pulse delay-1000`}></div>
        
        {/* Additional texture layers */}
        <div className={`absolute top-3/4 left-1/8 w-48 h-48 bg-gradient-to-br ${colors.textured} opacity-35 rounded-full blur-2xl animate-float delay-1500 transform rotate-45`}></div>
        <div className={`absolute top-1/8 right-1/4 w-64 h-32 bg-gradient-to-l ${colors.textured} opacity-45 rounded-full blur-xl animate-float delay-2000 transform -rotate-6`}></div>
      </div>

      {/* Painterly overlay texture */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, ${colors.textured.includes('amber') ? '#fbbf24' : colors.textured.includes('blue') ? '#3b82f6' : colors.textured.includes('red') ? '#ef4444' : '#8b5cf6'}20 2px, transparent 2px),
                         radial-gradient(circle at 75% 75%, ${colors.textured.includes('amber') ? '#f59e0b' : colors.textured.includes('blue') ? '#1d4ed8' : colors.textured.includes('red') ? '#dc2626' : '#7c3aed'}15 1px, transparent 1px)`,
        backgroundSize: '30px 30px, 20px 20px'
      }}></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header with enhanced typography */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white drop-shadow-2xl mb-2 tracking-wide" style={{
            textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)'
          }}>SolCue</h1>
          <p className="text-xl text-white/95 drop-shadow-lg tracking-wider">Circadian Rhythm Tracker</p>
        </div>

        {/* Main Clock Container with enhanced painterly effects */}
        <div className="flex flex-col items-center">
          {/* Location Status */}
          {!locationLoading && (
            <div className="mb-4 flex items-center space-x-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {location ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` : 
                 locationError ? 'Location unavailable' : 'Location not set'}
              </span>
            </div>
          )}

          {/* Session Status */}
          {currentSession && (
            <div className="mb-6 px-6 py-3 rounded-full bg-green-500/80 backdrop-blur-sm border border-white/30 shadow-xl">
              <div className="flex items-center space-x-3 text-white">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-medium">Session Active</span>
                <span className="text-sm opacity-90">
                  Started: {currentSession.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )}

          {/* Prime Time Status with enhanced styling */}
          {isPrimeTime && (
            <div className={`mb-8 px-10 py-5 rounded-full ${colors.accent} ${colors.glow} shadow-2xl animate-breathe relative overflow-hidden`}>
              {/* Inner glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 rounded-full"></div>
              <div className="relative flex items-center space-x-4">
                <Sun className="w-7 h-7 text-white animate-spin drop-shadow-lg" style={{ animationDuration: '8s' }} />
                <span className="text-white font-semibold text-xl tracking-wide drop-shadow-lg">Prime Light Window Active</span>
                <Sun className="w-7 h-7 text-white animate-spin drop-shadow-lg" style={{ animationDuration: '8s' }} />
              </div>
            </div>
          )}

          {/* Enhanced Central Clock with multiple layers */}
          <div className="relative">
            {/* Outermost atmospheric ring */}
            <div className={`absolute -inset-4 rounded-full bg-gradient-to-br ${colors.atmospheric} opacity-40 blur-sm animate-pulse`}></div>
            
            {/* Main clock container with enhanced effects */}
            <div className={`w-80 h-80 rounded-full bg-gradient-to-br ${colors.accent} ${colors.glow} shadow-2xl animate-breathe flex items-center justify-center transition-all duration-2000 relative overflow-hidden`}>
              
              {/* Painterly texture overlay on clock face */}
              <div className="absolute inset-0 rounded-full opacity-30" style={{
                background: `conic-gradient(from 0deg, 
                  ${colors.textured.includes('amber') ? '#fbbf24' : colors.textured.includes('blue') ? '#3b82f6' : colors.textured.includes('red') ? '#ef4444' : '#8b5cf6'}20 0deg,
                  transparent 60deg,
                  ${colors.textured.includes('amber') ? '#f59e0b' : colors.textured.includes('blue') ? '#1d4ed8' : colors.textured.includes('red') ? '#dc2626' : '#7c3aed'}15 120deg,
                  transparent 180deg,
                  ${colors.textured.includes('amber') ? '#fbbf24' : colors.textured.includes('blue') ? '#3b82f6' : colors.textured.includes('red') ? '#ef4444' : '#8b5cf6'}10 240deg,
                  transparent 300deg,
                  ${colors.textured.includes('amber') ? '#f59e0b' : colors.textured.includes('blue') ? '#1d4ed8' : colors.textured.includes('red') ? '#dc2626' : '#7c3aed'}20 360deg)`
              }}></div>
              
              {/* Inner clock face with enhanced depth */}
              <div className="w-72 h-72 rounded-full bg-white/25 backdrop-blur-sm border-2 border-white/40 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                
                {/* Inner texture pattern */}
                <div className="absolute inset-0 rounded-full" style={{
                  backgroundImage: `radial-gradient(circle at center, transparent 40%, ${colors.textured.includes('amber') ? '#fbbf24' : colors.textured.includes('blue') ? '#3b82f6' : colors.textured.includes('red') ? '#ef4444' : '#8b5cf6'}10 45%, transparent 50%)`,
                  backgroundSize: '40px 40px'
                }}></div>
                
                {/* Time display with enhanced styling */}
                <div className="text-center mb-6 relative z-10">
                  <div className="text-5xl font-bold text-white drop-shadow-2xl tracking-wider" style={{
                    textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)'
                  }}>
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-lg text-white/95 drop-shadow-lg mt-2 tracking-wide">
                    {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Enhanced phase indicator */}
                <div className="flex items-center space-x-3 text-white/95 relative z-10">
                  {hours >= 6 && hours < 18 ? (
                    <Sun className="w-9 h-9 animate-spin drop-shadow-lg" style={{ 
                      animationDuration: '20s',
                      filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.6))'
                    }} />
                  ) : (
                    <Moon className="w-9 h-9 drop-shadow-lg" style={{
                      filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.6))'
                    }} />
                  )}
                  <span className="font-medium text-lg tracking-wide drop-shadow-lg">
                    {inMorningPrime ? 'Morning Prime' : 
                     inEveningPrime ? 'Evening Prime' : 
                     hours >= 6 && hours < 18 ? 'Daylight' : 'Night'}
                  </span>
                </div>

                {/* Enhanced painterly texture overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent rounded-full"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/10 to-white/20 rounded-full"></div>
              </div>
            </div>

            {/* Enhanced orbital elements with trails */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '60s' }}>
              <div className={`absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full ${colors.accent} ${colors.glow} shadow-lg`}>
                <div className="absolute inset-0 rounded-full bg-white/40 animate-pulse"></div>
              </div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }}>
              <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-white/80 shadow-xl`}>
                <div className="absolute inset-0 rounded-full bg-white animate-pulse"></div>
              </div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '90s' }}>
              <div className={`absolute top-1/2 right-1 transform -translate-y-1/2 w-2 h-2 rounded-full bg-white/60 shadow-lg`}></div>
            </div>
          </div>

          {/* Enhanced Prime Windows Visualization */}
          <div className="mt-10 w-full max-w-md">
            <div className="bg-white/25 backdrop-blur-md rounded-2xl p-8 border-2 border-white/40 shadow-2xl relative overflow-hidden">
              {/* Background texture */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `linear-gradient(45deg, ${colors.textured.includes('amber') ? '#fbbf24' : colors.textured.includes('blue') ? '#3b82f6' : colors.textured.includes('red') ? '#ef4444' : '#8b5cf6'}10 25%, transparent 25%), linear-gradient(-45deg, ${colors.textured.includes('amber') ? '#f59e0b' : colors.textured.includes('blue') ? '#1d4ed8' : colors.textured.includes('red') ? '#dc2626' : '#7c3aed'}10 25%, transparent 25%)`,
                backgroundSize: '20px 20px'
              }}></div>
              
              <h3 className="text-white font-semibold mb-6 text-center text-lg tracking-wide drop-shadow-lg relative z-10">Today's Prime Windows</h3>
              
              <div className="space-y-4 relative z-10">
                <div className={`flex items-center justify-between p-4 rounded-xl transition-all duration-700 border ${inMorningPrime ? `bg-gradient-to-r ${colors.textured} border-yellow-300/60 shadow-lg` : 'bg-white/15 border-white/30'}`}>
                  <div className="flex items-center space-x-3">
                    <Sun className="w-5 h-5 text-white drop-shadow" />
                    <span className="text-white font-medium tracking-wide">Morning</span>
                  </div>
                  <span className="text-white font-mono tracking-wider drop-shadow">5:45 AM - 8:15 AM</span>
                </div>
                
                <div className={`flex items-center justify-between p-4 rounded-xl transition-all duration-700 border ${inEveningPrime ? `bg-gradient-to-r ${colors.textured} border-orange-300/60 shadow-lg` : 'bg-white/15 border-white/30'}`}>
                  <div className="flex items-center space-x-3">
                    <Sun className="w-5 h-5 text-white drop-shadow" />
                    <span className="text-white font-medium tracking-wide">Evening</span>
                  </div>
                  <span className="text-white font-mono tracking-wider drop-shadow">3:45 PM - 6:15 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Action Button with Session Control */}
          <div className="mt-10">
            <button 
              onClick={handleSessionAction}
              className={`px-16 py-5 rounded-full ${colors.accent} ${colors.glow} shadow-2xl text-white font-semibold text-xl tracking-wide hover:scale-105 transform transition-all duration-500 active:scale-95 relative overflow-hidden border-2 border-white/30`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 rounded-full"></div>
              <span className="relative z-10 drop-shadow-lg flex items-center space-x-3">
                {currentSession ? (
                  <>
                    <Square className="w-6 h-6" />
                    <span>End Session</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    <span>{isPrimeTime ? 'Start Session' : 'Add Manual Session'}</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Enhanced Stats Preview with Real Data */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/25 backdrop-blur-md rounded-2xl p-8 border-2 border-white/40 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
            <div className="relative z-10">
              <div className="text-4xl font-bold text-white mb-3 drop-shadow-lg tracking-wide">{stats?.dayStreak || 0}</div>
              <div className="text-white/95 tracking-wide">Day Streak</div>
            </div>
          </div>
          <div className="bg-white/25 backdrop-blur-md rounded-2xl p-8 border-2 border-white/40 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
            <div className="relative z-10">
              <div className="text-4xl font-bold text-white mb-3 drop-shadow-lg tracking-wide">{stats?.weeklyMinutes || 0}</div>
              <div className="text-white/95 tracking-wide">Minutes This Week</div>
            </div>
          </div>
          <div className="bg-white/25 backdrop-blur-md rounded-2xl p-8 border-2 border-white/40 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
            <div className="relative z-10">
              <div className="text-4xl font-bold text-white mb-3 drop-shadow-lg tracking-wide">⚡</div>
              <div className="text-white/95 tracking-wide">Energy Level</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolCue;
