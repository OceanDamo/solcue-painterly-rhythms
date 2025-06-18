
import React from 'react';

interface AboutPageProps {
  currentTime: Date;
}

const AboutPage: React.FC<AboutPageProps> = ({ currentTime }) => {
  const hours = currentTime.getHours();

  const getTimeColors = () => {
    if (hours >= 5 && hours < 8) {
      return {
        primary: 'from-rose-300 via-orange-300 via-amber-300 to-yellow-400',
        secondary: 'from-pink-200 via-orange-200 to-yellow-300',
        atmospheric: 'from-orange-200/40 via-pink-300/30 to-yellow-200/20',
        textured: 'from-amber-500/20 via-orange-400/30 to-rose-400/20'
      };
    } else if (hours >= 8 && hours < 17) {
      return {
        primary: 'from-sky-300 via-blue-400 via-cyan-400 to-teal-400',
        secondary: 'from-blue-200 via-cyan-200 to-sky-300',
        atmospheric: 'from-cyan-200/40 via-blue-300/30 to-sky-200/20',
        textured: 'from-blue-500/20 via-cyan-400/30 to-teal-400/20'
      };
    } else if (hours >= 17 && hours < 20) {
      return {
        primary: 'from-red-400 via-orange-500 via-pink-500 to-purple-600',
        secondary: 'from-orange-300 via-red-300 to-pink-400',
        atmospheric: 'from-red-200/40 via-orange-300/30 to-purple-200/20',
        textured: 'from-red-500/20 via-orange-400/30 to-pink-400/20'
      };
    } else {
      return {
        primary: 'from-indigo-700 via-purple-700 via-blue-800 to-slate-800',
        secondary: 'from-indigo-400 via-purple-500 to-blue-600',
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
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-radial ${colors.atmospheric} opacity-40 animate-breathe`}></div>
        <div className={`absolute top-1/6 left-1/5 w-96 h-64 bg-gradient-to-br ${colors.textured} opacity-30 rounded-full blur-3xl animate-float transform rotate-12`}></div>
        <div className={`absolute bottom-1/4 right-1/6 w-80 h-96 bg-gradient-to-tl ${colors.textured} opacity-25 rounded-full blur-2xl animate-float delay-500 transform -rotate-12`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial ${colors.secondary} opacity-20 rounded-full blur-xl animate-pulse delay-1000`}></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-white drop-shadow-2xl mb-4 tracking-wide" style={{
            textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)'
          }}>SolCue</h1>
          <p className="text-xl text-white/95 drop-shadow-lg tracking-wider mb-8">Circadian Light Tracker</p>
          <p className="text-lg text-white/90 drop-shadow-lg tracking-wider mb-2">Developer: Damian Ewens</p>
          <p className="text-base text-white/85 drop-shadow-lg tracking-wider mb-4">Ocean State of Mind LLC</p>
          <a 
            href="https://www.oceanstateofmind.blue/app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-white/90 hover:text-white underline decoration-white/50 hover:decoration-white transition-all duration-300 drop-shadow-lg"
          >
            oceanstateofmind.blue/app
          </a>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-left">
          {/* Ocean State of Mind */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border-2 border-white/40 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20 rounded-2xl"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold text-white mb-4 drop-shadow-lg">Ocean State of Mind</h2>
              <p className="text-white/90 leading-relaxed">
                SolCue embodies the philosophy that the most powerful medicine is nature itself. By aligning with natural light cycles, 
                we tap into our body's ancient wisdom and flow with the rhythms that have guided life for millions of years.
              </p>
            </div>
          </div>

          {/* Circadian Science */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border-2 border-white/40 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20 rounded-2xl"></div>
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
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border-2 border-white/40 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20 rounded-2xl"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold text-white mb-4 drop-shadow-lg">About the App</h2>
              <p className="text-white/90 leading-relaxed">
                Created with love to help people reconnect with natural rhythms in our modern world. 
                SolCue makes it simple to track light exposure and experience the profound benefits of circadian alignment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
