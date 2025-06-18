
import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';

interface StatsPageProps {
  currentTime: Date;
}

// Mock data - in real app this would come from hooks/storage
const mockStats = {
  dayStreak: 7,
  weeklyMinutes: 142,
  primeMinutes: 89,
  moodScore: 6,
  lastSessionDate: new Date(),
  naturalRhythms: [
    { id: 1, name: 'Dream Deeper', description: 'Sleep Harmony', requiredDays: 3, currentDays: 2, state: 'flowing' },
    { id: 2, name: 'Heart Brighter', description: 'Mood Flow', requiredDays: 4, currentDays: 4, state: 'harmony' },
    { id: 3, name: 'Mind Clearer', description: 'Focus Flow', requiredDays: 2, currentDays: 0, state: 'invitation' },
    { id: 4, name: 'Body Wiser', description: 'Digestive Flow', requiredDays: 3, currentDays: 1, state: 'flowing' },
    { id: 5, name: 'Shield Stronger', description: 'Immune Flow', requiredDays: 4, currentDays: 0, state: 'invitation' },
    { id: 6, name: 'Hunger Balanced', description: 'Metabolic Flow', requiredDays: 7, currentDays: 3, state: 'flowing' },
    { id: 7, name: 'Energy Flowing', description: 'Hormonal Flow', requiredDays: 5, currentDays: 5, state: 'harmony' },
    { id: 8, name: 'Heart Steady', description: 'Cardiovascular Flow', requiredDays: 5, currentDays: 2, state: 'flowing' },
    { id: 9, name: 'Mind Calm', description: 'Stress Flow', requiredDays: 5, currentDays: 0, state: 'invitation' }
  ]
};

const StatsPage: React.FC<StatsPageProps> = ({ currentTime }) => {
  const [showAddSession, setShowAddSession] = useState(false);
  const [selectedMood, setSelectedMood] = useState(mockStats.moodScore);

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

  const getProgressColor = (progress: number) => {
    if (progress < 0.3) return 'from-blue-400 to-cyan-500';
    if (progress < 0.7) return 'from-yellow-400 to-orange-500';
    return 'from-orange-400 to-rose-500';
  };

  const getStateStyles = (state: string, progress: number) => {
    switch (state) {
      case 'invitation':
        return {
          bg: 'bg-white/15 border-white/30',
          glow: '',
          animation: 'animate-breathe',
          text: 'text-white/90',
          status: '🌅 Open'
        };
      case 'flowing':
        return {
          bg: `bg-gradient-to-br ${colors.textured} border-yellow-300/40`,
          glow: colors.glow,
          animation: 'animate-pulse',
          text: 'text-white',
          status: '🌊 Flowing'
        };
      case 'harmony':
        return {
          bg: `bg-gradient-to-br ${colors.accent} border-white/50`,
          glow: `${colors.glow} shadow-2xl`,
          animation: 'animate-breathe',
          text: 'text-white',
          status: '✨ Harmony'
        };
      default:
        return {
          bg: 'bg-white/15 border-white/30',
          glow: '',
          animation: '',
          text: 'text-white/90',
          status: '🌅 Open'
        };
    }
  };

  const moodEmojis = ['😰', '😟', '😐', '🙂', '😊', '😄', '🤩'];
  const moodLabels = ['Very Low', 'Low', 'Below Average', 'Average', 'Good', 'Great', 'Excellent'];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.primary} p-4 pb-24 transition-all duration-2000 ease-in-out relative overflow-hidden`}>
      {/* Enhanced atmospheric layers with painterly textures */}
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
          }}>Flow Progress</h1>
          <p className="text-lg text-white/95 drop-shadow-lg tracking-wider">Natural Rhythm Tracking</p>
        </div>

        {/* Main Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Day Streak - Primary Focus */}
          <div className="md:col-span-1 bg-white/25 backdrop-blur-md rounded-2xl p-6 border-2 border-white/40 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
            <div className="relative z-10 text-center">
              {/* Glowing mandala visualization */}
              <div className="relative mb-4">
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${getProgressColor(mockStats.dayStreak / 30)} ${colors.glow} shadow-2xl animate-breathe flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 rounded-full"></div>
                  <span className="text-2xl font-bold text-white drop-shadow-lg relative z-10">{mockStats.dayStreak}</span>
                </div>
                {/* Orbital rings */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                  <div className="w-28 h-28 border border-white/30 rounded-full"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">Day Flow</h3>
              <p className="text-white/90 text-sm">Consecutive days in rhythm</p>
            </div>
          </div>

          {/* Weekly Flow */}
          <div className="md:col-span-1 bg-white/25 backdrop-blur-md rounded-2xl p-6 border-2 border-white/40 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-lg text-center">Weekly Rhythm</h3>
              {/* Flowing wave progress */}
              <div className="relative mb-4">
                <div className="h-6 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getProgressColor(mockStats.weeklyMinutes / 200)} rounded-full animate-pulse transition-all duration-1000`}
                    style={{ width: `${Math.min((mockStats.weeklyMinutes / 200) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-2xl font-bold text-white drop-shadow-lg">{mockStats.weeklyMinutes}</span>
                  <span className="text-white/90 text-sm ml-1">minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prime Window Balance */}
          <div className="md:col-span-1 bg-white/25 backdrop-blur-md rounded-2xl p-6 border-2 border-white/40 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-white mb-4 drop-shadow-lg text-center">Light Harmony</h3>
              {/* Sunrise/Sunset Balance */}
              <div className="flex justify-center items-center mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-white/90 mt-1">Morning</span>
                  </div>
                  <div className="text-white/60">~</div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse delay-500"></div>
                    <span className="text-xs text-white/90 mt-1">Evening</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-white drop-shadow-lg">{mockStats.primeMinutes}</span>
                <span className="text-white/90 text-sm ml-1">prime minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Session Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowAddSession(!showAddSession)}
            className={`px-8 py-4 rounded-full ${colors.accent} ${colors.glow} shadow-2xl text-white font-semibold text-lg tracking-wide hover:scale-105 transform transition-all duration-500 active:scale-95 relative overflow-hidden border-2 border-white/30`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 rounded-full"></div>
            <span className="relative z-10 drop-shadow-lg flex items-center space-x-3">
              <Plus className="w-5 h-5" />
              <span>Add Session</span>
            </span>
          </button>
        </div>

        {/* Daily Check-in */}
        <div className="mb-8 bg-white/25 backdrop-blur-md rounded-2xl p-6 border-2 border-white/40 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-white mb-4 drop-shadow-lg text-center">Today's Flow Check-in</h3>
            <div className="flex justify-center space-x-4 flex-wrap">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMood(index + 1)}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    selectedMood === index + 1
                      ? `bg-white/30 ${colors.glow} shadow-lg scale-110`
                      : 'bg-white/15 hover:bg-white/25 hover:scale-105'
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-white/90 mt-2 text-sm">
              {moodLabels[selectedMood - 1]}
            </p>
          </div>
        </div>

        {/* Natural Rhythm Invitations */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 drop-shadow-lg text-center tracking-wide">Natural Rhythm Invitations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockStats.naturalRhythms.map((rhythm) => {
              const progress = rhythm.currentDays / rhythm.requiredDays;
              const styles = getStateStyles(rhythm.state, progress);
              
              return (
                <div
                  key={rhythm.id}
                  className={`${styles.bg} backdrop-blur-md rounded-xl p-4 border ${styles.glow} shadow-xl ${styles.animation} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className={`font-semibold ${styles.text} drop-shadow text-sm`}>{rhythm.name}</h4>
                        <p className={`${styles.text} opacity-80 text-xs`}>{rhythm.description}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-white/20 rounded-full text-white/90">
                        {styles.status}
                      </span>
                    </div>
                    
                    {/* Organic progress visualization */}
                    <div className="relative mb-2">
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${getProgressColor(progress)} rounded-full transition-all duration-1000 animate-pulse`}
                          style={{ width: `${Math.min(progress * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-white/80 mt-1">
                        <span>{rhythm.currentDays} days</span>
                        <span>{rhythm.requiredDays} needed</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
