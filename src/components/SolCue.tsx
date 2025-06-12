
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Clock } from 'lucide-react';

interface SolCueProps {
  currentTime?: Date;
}

const SolCue: React.FC<SolCueProps> = ({ currentTime = new Date() }) => {
  const [time, setTime] = useState(currentTime);
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
  const eveningPrimeStart = sunsetMinutes - 135; // 3:45 PM
  const eveningPrimeEnd = sunsetMinutes + 15; // 6:15 PM
  
  const inMorningPrime = totalMinutes >= morningPrimeStart && totalMinutes <= morningPrimeEnd;
  const inEveningPrime = totalMinutes >= eveningPrimeStart && totalMinutes <= eveningPrimeEnd;
  const currentlyInPrime = inMorningPrime || inEveningPrime;

  useEffect(() => {
    setIsInPrimeWindow(currentlyInPrime);
  }, [currentlyInPrime]);

  // Dynamic color palette based on time
  const getTimeColors = () => {
    if (hours >= 5 && hours < 8) {
      // Sunrise colors
      return {
        primary: 'from-orange-300 via-pink-400 to-purple-500',
        secondary: 'from-yellow-200 to-orange-300',
        accent: 'bg-gradient-to-br from-amber-400 to-orange-500',
        glow: 'shadow-orange-500/50'
      };
    } else if (hours >= 8 && hours < 17) {
      // Daytime colors
      return {
        primary: 'from-blue-400 via-cyan-300 to-blue-500',
        secondary: 'from-sky-200 to-blue-300',
        accent: 'bg-gradient-to-br from-cyan-400 to-blue-500',
        glow: 'shadow-blue-500/50'
      };
    } else if (hours >= 17 && hours < 20) {
      // Sunset colors
      return {
        primary: 'from-orange-400 via-red-400 to-purple-600',
        secondary: 'from-orange-200 to-red-300',
        accent: 'bg-gradient-to-br from-orange-500 to-red-600',
        glow: 'shadow-red-500/50'
      };
    } else {
      // Night colors
      return {
        primary: 'from-indigo-600 via-purple-600 to-blue-800',
        secondary: 'from-indigo-300 to-purple-400',
        accent: 'bg-gradient-to-br from-indigo-500 to-purple-600',
        glow: 'shadow-purple-500/50'
      };
    }
  };

  const colors = getTimeColors();
  const isPrimeTime = isInPrimeWindow;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.primary} p-4 transition-all duration-1000 ease-in-out`}>
      {/* Background atmospheric effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial ${colors.secondary} opacity-30 rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-radial ${colors.secondary} opacity-20 rounded-full blur-2xl animate-pulse delay-1000`}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-2">SolCue</h1>
          <p className="text-xl text-white/90 drop-shadow">Circadian Rhythm Tracker</p>
        </div>

        {/* Main Clock Container */}
        <div className="flex flex-col items-center">
          {/* Prime Time Status */}
          {isPrimeTime && (
            <div className={`mb-6 px-8 py-4 rounded-full ${colors.accent} ${colors.glow} shadow-2xl animate-pulse`}>
              <div className="flex items-center space-x-3">
                <Sun className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '8s' }} />
                <span className="text-white font-semibold text-lg">Prime Light Window Active</span>
                <Sun className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            </div>
          )}

          {/* Central Clock */}
          <div className="relative">
            {/* Outer ring with breathing effect */}
            <div className={`w-80 h-80 rounded-full bg-gradient-to-br ${colors.accent} ${colors.glow} shadow-2xl animate-pulse flex items-center justify-center transition-all duration-1000`}>
              
              {/* Inner clock face */}
              <div className="w-72 h-72 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex flex-col items-center justify-center relative overflow-hidden">
                
                {/* Time display */}
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-white drop-shadow-lg">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-lg text-white/90 drop-shadow">
                    {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Current phase indicator */}
                <div className="flex items-center space-x-2 text-white/90">
                  {hours >= 6 && hours < 18 ? (
                    <Sun className="w-8 h-8 animate-spin" style={{ animationDuration: '20s' }} />
                  ) : (
                    <Moon className="w-8 h-8" />
                  )}
                  <span className="font-medium">
                    {inMorningPrime ? 'Morning Prime' : 
                     inEveningPrime ? 'Evening Prime' : 
                     hours >= 6 && hours < 18 ? 'Daylight' : 'Night'}
                  </span>
                </div>

                {/* Painterly texture overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>
              </div>
            </div>

            {/* Orbital elements */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '60s' }}>
              <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full ${colors.accent} ${colors.glow}`}></div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }}>
              <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-white/70 shadow-lg`}></div>
            </div>
          </div>

          {/* Prime Windows Visualization */}
          <div className="mt-8 w-full max-w-md">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30">
              <h3 className="text-white font-semibold mb-4 text-center">Today's Prime Windows</h3>
              
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg ${inMorningPrime ? 'bg-gradient-to-r from-yellow-400/30 to-orange-400/30 border border-yellow-300/50' : 'bg-white/10'} transition-all duration-500`}>
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-white" />
                    <span className="text-white text-sm">Morning</span>
                  </div>
                  <span className="text-white text-sm font-mono">5:45 AM - 8:15 AM</span>
                </div>
                
                <div className={`flex items-center justify-between p-3 rounded-lg ${inEveningPrime ? 'bg-gradient-to-r from-orange-400/30 to-red-400/30 border border-orange-300/50' : 'bg-white/10'} transition-all duration-500`}>
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-white" />
                    <span className="text-white text-sm">Evening</span>
                  </div>
                  <span className="text-white text-sm font-mono">3:45 PM - 6:15 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8">
            <button className={`px-12 py-4 rounded-full ${colors.accent} ${colors.glow} shadow-2xl text-white font-semibold text-lg hover:scale-105 transform transition-all duration-300 active:scale-95`}>
              {isPrimeTime ? 'Start Session' : 'Add Manual Session'}
            </button>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30 text-center">
            <div className="text-3xl font-bold text-white mb-2">7</div>
            <div className="text-white/90">Day Streak</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30 text-center">
            <div className="text-3xl font-bold text-white mb-2">142</div>
            <div className="text-white/90">Minutes This Week</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30 text-center">
            <div className="text-3xl font-bold text-white mb-2">⚡</div>
            <div className="text-white/90">Energy Level</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolCue;
