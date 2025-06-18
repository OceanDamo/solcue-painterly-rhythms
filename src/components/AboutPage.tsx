
import React from 'react';

interface AboutPageProps {
  currentTime: Date;
}

const AboutPage: React.FC<AboutPageProps> = ({ currentTime }) => {
  const hours = currentTime.getHours();

  const getTimeColors = () => {
    if (hours >= 5 && hours < 8) {
      return {
        primary: 'from-gray-900 via-gray-800 to-black',
        secondary: 'from-orange-900/20 via-amber-900/15 to-yellow-900/10',
        atmospheric: 'from-orange-400/10 via-pink-400/8 to-yellow-400/5',
        textured: 'from-amber-600/15 via-orange-500/20 to-rose-500/15'
      };
    } else if (hours >= 8 && hours < 17) {
      return {
        primary: 'from-gray-900 via-gray-800 to-black',
        secondary: 'from-blue-900/20 via-cyan-900/15 to-teal-900/10',
        atmospheric: 'from-cyan-400/10 via-blue-400/8 to-sky-400/5',
        textured: 'from-blue-600/15 via-cyan-500/20 to-teal-500/15'
      };
    } else if (hours >= 17 && hours < 20) {
      return {
        primary: 'from-gray-900 via-gray-800 to-black',
        secondary: 'from-red-900/20 via-orange-900/15 to-pink-900/10',
        atmospheric: 'from-red-400/10 via-orange-400/8 to-purple-400/5',
        textured: 'from-red-600/15 via-orange-500/20 to-pink-500/15'
      };
    } else {
      return {
        primary: 'from-gray-900 via-gray-800 to-black',
        secondary: 'from-indigo-900/20 via-purple-900/15 to-blue-900/10',
        atmospheric: 'from-indigo-400/10 via-purple-400/8 to-slate-400/5',
        textured: 'from-indigo-600/15 via-purple-500/20 to-blue-600/15'
      };
    }
  };

  const colors = getTimeColors();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.primary} p-4 pb-24 transition-all duration-2000 ease-in-out relative overflow-hidden`}>
      {/* Enhanced atmospheric layers with darker tones */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-radial ${colors.atmospheric} opacity-20 animate-breathe`}></div>
        <div className={`absolute top-1/6 left-1/5 w-96 h-64 bg-gradient-to-br ${colors.textured} opacity-15 rounded-full blur-3xl animate-float transform rotate-12`}></div>
        <div className={`absolute bottom-1/4 right-1/6 w-80 h-96 bg-gradient-to-tl ${colors.textured} opacity-12 rounded-full blur-2xl animate-float delay-500 transform -rotate-12`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial ${colors.secondary} opacity-10 rounded-full blur-xl animate-pulse delay-1000`}></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-white drop-shadow-2xl mb-4 tracking-wide" style={{
            textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)'
          }}>SolCue</h1>
          <p className="text-xl text-white/95 drop-shadow-lg tracking-wider mb-8">Circadian Light Tracker</p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-left">
          {/* Ocean State of Mind */}
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/30 rounded-2xl"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold text-white mb-4 drop-shadow-lg">Ocean State of Mind</h2>
              <p className="text-white/90 leading-relaxed">
                SolCue embodies the philosophy that the most powerful medicine is nature itself. By aligning with natural light cycles, 
                we tap into our body's ancient wisdom and flow with the rhythms that have guided life for millions of years.
              </p>
            </div>
          </div>

          {/* Circadian Science */}
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/30 rounded-2xl"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold text-white mb-4 drop-shadow-lg">The Science of Light</h2>
              <p className="text-white/90 leading-relaxed mb-4">
                Light is the primary cue that synchronizes our circadian rhythms. Morning light exposure helps regulate:
              </p>
              <ul className="text-white/90 space-y-2 ml-4">
                <li>• Sleep-wake cycles and melatonin production</li>
                <li>• Hormone balance including cortisol and growth hormone</li>
                <li>• Metabolism and digestive rhythms</li>
                <li>• Mood regulation through serotonin pathways</li>
                <li>• Immune function and cellular repair</li>
              </ul>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/30 rounded-2xl"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold text-white mb-4 drop-shadow-lg">About the App</h2>
              <p className="text-white/90 leading-relaxed">
                Created with love to help people reconnect with natural rhythms in our modern world. 
                SolCue makes it simple to track light exposure and experience the profound benefits of circadian alignment.
              </p>
            </div>
          </div>
        </div>

        {/* Developer info moved to bottom */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-base text-white/80 drop-shadow-lg tracking-wider mb-2">Developer: Damian Ewens</p>
          <p className="text-sm text-white/70 drop-shadow-lg tracking-wider mb-4">Ocean State of Mind LLC</p>
          <a 
            href="https://www.oceanstateofmind.blue/app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-white/80 hover:text-white underline decoration-white/50 hover:decoration-white transition-all duration-300 drop-shadow-lg text-sm"
          >
            oceanstateofmind.blue/app
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
