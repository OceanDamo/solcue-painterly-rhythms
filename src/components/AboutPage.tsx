
import React from 'react';
import { Heart, Waves, Sun, Moon } from 'lucide-react';

interface AboutPageProps {
  currentTime: Date;
}

const AboutPage: React.FC<AboutPageProps> = ({ currentTime }) => {
  const hours = currentTime.getHours();

  // Enhanced painterly color palette based on time
  const getTimeColors = () => {
    if (hours >= 5 && hours < 8) {
      return {
        primary: 'from-rose-300 via-orange-300 via-amber-300 to-yellow-400',
        secondary: 'from-pink-200 via-orange-200 to-yellow-300',
        accent: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
        glow: 'shadow-orange-400/60',
        atmospheric: 'from-orange-200/40 via-pink-300/30 to-yellow-200/20',
        textured: 'from-amber-500/20 via-orange-400/30 to-rose-400/20'
      };
    } else if (hours >= 8 && hours < 17) {
      return {
        primary: 'from-sky-300 via-blue-400 via-cyan-400 to-teal-400',
        secondary: 'from-blue-200 via-cyan-200 to-sky-300',
        accent: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500',
        glow: 'shadow-blue-400/60',
        atmospheric: 'from-cyan-200/40 via-blue-300/30 to-sky-200/20',
        textured: 'from-blue-500/20 via-cyan-400/30 to-teal-400/20'
      };
    } else if (hours >= 17 && hours < 20) {
      return {
        primary: 'from-red-400 via-orange-500 via-pink-500 to-purple-600',
        secondary: 'from-orange-300 via-red-300 to-pink-400',
        accent: 'bg-gradient-to-br from-orange-500 via-red-500 to-purple-600',
        glow: 'shadow-red-400/60',
        atmospheric: 'from-red-200/40 via-orange-300/30 to-purple-200/20',
        textured: 'from-red-500/20 via-orange-400/30 to-pink-400/20'
      };
    } else {
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
    <div className={`min-h-screen bg-gradient-to-br ${colors.primary} p-4 pb-24 transition-all duration-2000 ease-in-out relative overflow-hidden`}>
      {/* Enhanced atmospheric layers */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-radial ${colors.atmospheric} opacity-60 animate-breathe`}></div>
        <div className={`absolute top-1/6 left-1/5 w-96 h-64 bg-gradient-to-br ${colors.textured} opacity-50 rounded-full blur-3xl animate-float transform rotate-12`}></div>
        <div className={`absolute bottom-1/4 right-1/6 w-80 h-96 bg-gradient-to-tl ${colors.textured} opacity-40 rounded-full blur-2xl animate-float delay-500 transform -rotate-12`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial ${colors.secondary} opacity-30 rounded-full blur-xl animate-pulse delay-1000`}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-2xl mb-2 tracking-wide" style={{
            textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)'
          }}>About SolCue</h1>
          <p className="text-lg text-white/95 drop-shadow-lg tracking-wider">Ocean State of Mind</p>
        </div>

        {/* Philosophy Card */}
        <div className="mb-8 bg-white/25 backdrop-blur-md rounded-3xl p-8 border-2 border-white/40 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent rounded-3xl"></div>
          <div className="absolute top-4 right-4">
            <div className={`w-16 h-16 rounded-full ${colors.accent} ${colors.glow} shadow-xl animate-breathe flex items-center justify-center`}>
              <Sun className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '20s' }} />
            </div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg tracking-wide">
              "The most powerful medicine is nature itself"
            </h2>
            <p className="text-white/95 text-lg leading-relaxed mb-6">
              SolCue embodies the Ocean State of Mind philosophy - a way of living that honors natural rhythms and cycles. 
              In our modern world of artificial light and disconnected schedules, we've lost touch with the fundamental 
              patterns that have guided life for millions of years.
            </p>
            <p className="text-white/90 leading-relaxed">
              By syncing with the rhythm of light, we take the first solid step towards rewilding ourselves - 
              remembering who we are when in tune with nature and our own nature.
            </p>
          </div>
        </div>

        {/* Company Info */}
        <div className="mb-8 bg-white/25 backdrop-blur-md rounded-2xl p-6 border-2 border-white/40 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-full ${colors.accent} ${colors.glow} shadow-lg animate-breathe flex items-center justify-center mr-4`}>
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white drop-shadow-lg">Ocean State of Mind LLC</h3>
                <p className="text-white/90 text-sm">Founded by Damian Ewens</p>
              </div>
            </div>
            
            <p className="text-white/95 leading-relaxed mb-4">
              Ocean State of Mind represents a return to natural living - flowing with the tides of light, 
              season, and circadian rhythm rather than fighting against them. Our mission is to help people 
              reconnect with their innate wisdom through simple, beautiful technology.
            </p>
            
            <div className="flex items-center space-x-4 text-white/90">
              <Heart className="w-5 h-5 text-red-300 animate-pulse" />
              <span className="text-sm">Made with love in Rhode Island, the Ocean State</span>
            </div>
          </div>
        </div>

        {/* Circadian Science */}
        <div className="mb-8 bg-white/25 backdrop-blur-md rounded-2xl p-6 border-2 border-white/40 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-white mb-4 drop-shadow-lg">The Science of Light</h3>
            
            <div className="space-y-4 text-white/95">
              <div className="flex items-start space-x-3">
                <Sun className="w-6 h-6 text-yellow-300 mt-1 animate-pulse" />
                <div>
                  <h4 className="font-medium text-white mb-1">Prime Windows</h4>
                  <p className="text-sm text-white/90">
                    Research shows that exposure to natural light 2 hours after sunrise and 2 hours before sunset 
                    is crucial for maintaining healthy circadian rhythms.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Moon className="w-6 h-6 text-blue-300 mt-1 animate-pulse delay-500" />
                <div>
                  <h4 className="font-medium text-white mb-1">Natural Cycles</h4>
                  <p className="text-sm text-white/90">
                    These light exposures help regulate sleep, mood, metabolism, and overall well-being by 
                    synchronizing your internal clock with the earth's rotation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extended Prime Windows */}
        <div className="mb-8 bg-white/25 backdrop-blur-md rounded-2xl p-6 border-2 border-white/40 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-white mb-4 drop-shadow-lg">Extended Prime Windows</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 ${colors.glow} shadow-xl animate-breathe flex items-center justify-center`}>
                  <Sun className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">Morning Window</h4>
                <p className="text-sm text-white/90">
                  15 minutes before sunrise + 2h 15min after sunrise
                </p>
                <p className="text-xs text-white/80 mt-1">Encourages actual sunrise viewing</p>
              </div>
              
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 ${colors.glow} shadow-xl animate-breathe delay-500 flex items-center justify-center`}>
                  <Moon className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">Evening Window</h4>
                <p className="text-sm text-white/90">
                  2h before sunset + 15 minutes after sunset
                </p>
                <p className="text-xs text-white/80 mt-1">Promotes sunset connection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-lg">App Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/80">Version:</span>
                <span className="text-white ml-2">1.0.0</span>
              </div>
              <div>
                <span className="text-white/80">Platform:</span>
                <span className="text-white ml-2">iOS, Web</span>
              </div>
              <div>
                <span className="text-white/80">Framework:</span>
                <span className="text-white ml-2">React + Capacitor</span>
              </div>
              <div>
                <span className="text-white/80">Location:</span>
                <span className="text-white ml-2">Providence, RI</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/30">
              <p className="text-white/90 text-sm text-center">
                Built with ❤️ for those seeking harmony with natural rhythms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
