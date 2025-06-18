import React, { useState } from 'react';
import { Plus, Sun, Moon, Heart, Zap, Brain, Bed } from 'lucide-react';
import AddSessionModal from './AddSessionModal';

interface StatsPageProps {
  currentTime: Date;
}

// Mock data - in real app this would come from hooks/storage
const mockStats = {
  dayStreak: 7,
  weeklyMinutes: 142,
  primeMinutes: 89,
  pulseScores: { sleep: 6, mood: 7, energy: 5, focus: 6 },
  lastSessionDate: new Date(),
  circadianBenefits: [
    { 
      id: 1, 
      name: 'Dream Fuel', 
      description: 'Sleep Quality Enhancement', 
      requiredDays: 3, 
      currentDays: 2, 
      state: 'flowing',
      shortTip: 'Just 10–30 minutes of morning sunlight helps you fall asleep faster.',
      evidence: 'Light exposure within 2 hours of waking helps regulate melatonin production and circadian rhythm, improving sleep quality in 2-4 days.'
    },
    { 
      id: 2, 
      name: 'Sunshine Boost', 
      description: 'Mood Regulation', 
      requiredDays: 4, 
      currentDays: 4, 
      state: 'harmony',
      shortTip: 'A short sunrise walk boosts serotonin in just 4 days.',
      evidence: '20+ minutes of outdoor light for 4 consecutive days increases serotonin production and supports positive mood regulation through light-sensitive pathways.'
    },
    { 
      id: 3, 
      name: 'Brain Bright', 
      description: 'Cognitive Performance', 
      requiredDays: 2, 
      currentDays: 0, 
      state: 'invitation',
      shortTip: 'Just two days of morning sunlight can boost memory and focus.',
      evidence: 'Morning light exposure for 2+ days enhances cognitive function through improved circadian rhythm regulation and increased alertness hormones.'
    },
    { 
      id: 4, 
      name: 'Gut Glow', 
      description: 'Digestive Health', 
      requiredDays: 3, 
      currentDays: 1, 
      state: 'flowing',
      shortTip: 'Morning light helps your gut reset its rhythm in 3–4 days.',  
      evidence: 'Light exposure helps synchronize gut microbiome circadian rhythms, improving digestive function and regularity within 3-4 days.'
    },
    { 
      id: 5, 
      name: 'Shield Mode', 
      description: 'Immune Function', 
      requiredDays: 4, 
      currentDays: 0, 
      state: 'invitation',
      shortTip: 'Four days of sunlight supports immune system and fights inflammation.',
      evidence: '4+ days of consistent light exposure strengthens immune function through vitamin D synthesis and circadian immune cell regulation.'
    },
    { 
      id: 6, 
      name: 'Crave Control', 
      description: 'Metabolic Health', 
      requiredDays: 7, 
      currentDays: 3, 
      state: 'flowing',
      shortTip: 'Early sunlight for 1 week helps reset appetite and reduce cravings.',
      evidence: '7 days of morning light exposure regulates appetite hormones (ghrelin/leptin) and improves metabolic function through circadian clock genes.'
    },
    { 
      id: 7, 
      name: 'Energy Flow', 
      description: 'Hormonal Balance', 
      requiredDays: 5, 
      currentDays: 5, 
      state: 'harmony',
      shortTip: 'Morning light helps regulate cortisol and sex hormones in under a week.',
      evidence: '5+ days of morning light exposure optimizes cortisol rhythm and supports healthy hormone production through hypothalamic-pituitary axis regulation.'
    },
    { 
      id: 8, 
      name: 'Heart Sync', 
      description: 'Cardiovascular Health', 
      requiredDays: 5, 
      currentDays: 2, 
      state: 'flowing',
      shortTip: 'Morning light lowers blood pressure and supports heart rhythm.',
      evidence: '5+ days of light exposure improves cardiovascular health through blood pressure regulation and heart rate variability optimization.'
    },
    { 
      id: 9, 
      name: 'Chill Shield', 
      description: 'Stress Resilience', 
      requiredDays: 5, 
      currentDays: 0, 
      state: 'invitation',
      shortTip: '10 minutes of early sun for 3–5 days reduces cortisol spikes.',
      evidence: '3-5 days of morning light exposure reduces stress hormone reactivity and improves stress resilience through improved circadian cortisol patterns.'
    }
  ]
};

const StatsPage: React.FC<StatsPageProps> = ({ currentTime }) => {
  const [showAddSession, setShowAddSession] = useState(false);
  const [selectedScores, setSelectedScores] = useState(mockStats.pulseScores);
  const [expandedBenefit, setExpandedBenefit] = useState<number | null>(null);

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

  const handleAddSession = (session: { date: string; time: string; duration: number }) => {
    console.log('Adding session:', session);
    // TODO: Update stats based on new session
  };

  const pulseCategories = [
    { key: 'sleep' as const, label: 'Sleep', icon: Bed },
    { key: 'mood' as const, label: 'Mood', icon: Heart },
    { key: 'energy' as const, label: 'Energy', icon: Zap },
    { key: 'focus' as const, label: 'Focus', icon: Brain },
  ];

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
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white drop-shadow-2xl mb-2 tracking-wide" style={{
            textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)'
          }}>Flow Progress</h1>
          <p className="text-lg text-white/95 drop-shadow-lg tracking-wider">Natural Rhythm Tracking</p>
        </div>

        {/* Compact Top Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Day Streak */}
          <div className="bg-white/25 backdrop-blur-md rounded-xl p-4 border-2 border-white/40 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
            <div className="relative z-10 text-center">
              <div className={`w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br ${getProgressColor(mockStats.dayStreak / 30)} ${colors.glow} shadow-xl animate-breathe flex items-center justify-center`}>
                <span className="text-xl font-bold text-white drop-shadow-lg">{mockStats.dayStreak}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 drop-shadow-lg">Day Flow</h3>
              <p className="text-white/90 text-xs">Consecutive days</p>
            </div>
          </div>

          {/* Weekly Minutes */}
          <div className="bg-white/25 backdrop-blur-md rounded-xl p-4 border-2 border-white/40 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
            <div className="relative z-10 text-center">
              <div className="mb-2">
                <span className="text-xl font-bold text-white drop-shadow-lg">{mockStats.weeklyMinutes}</span>
                <span className="text-white/90 text-xs ml-1">min</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 drop-shadow-lg">Weekly</h3>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getProgressColor(mockStats.weeklyMinutes / 200)} rounded-full animate-pulse`}
                  style={{ width: `${Math.min((mockStats.weeklyMinutes / 200) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Prime Minutes */}
          <div className="bg-white/25 backdrop-blur-md rounded-xl p-4 border-2 border-white/40 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
            <div className="relative z-10 text-center">
              <div className="flex justify-center items-center mb-2 space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse delay-500"></div>
              </div>
              <div className="mb-1">
                <span className="text-xl font-bold text-white drop-shadow-lg">{mockStats.primeMinutes}</span>
                <span className="text-white/90 text-xs ml-1">min</span>
              </div>
              <h3 className="text-sm font-semibold text-white drop-shadow-lg">Prime Light</h3>
            </div>
          </div>
        </div>

        {/* Add Session Button */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowAddSession(true)}
            className={`px-6 py-3 rounded-full ${colors.accent} ${colors.glow} shadow-2xl text-white font-semibold tracking-wide hover:scale-105 transform transition-all duration-500 relative overflow-hidden border-2 border-white/30`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 rounded-full"></div>
            <span className="relative z-10 drop-shadow-lg flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Session</span>
            </span>
          </button>
        </div>

        {/* The Pulse: Inner Rhythms Check-in */}
        <div className="mb-8 bg-white/25 backdrop-blur-md rounded-2xl p-6 border-2 border-white/40 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg text-center">The Pulse</h3>
            <p className="text-white/90 text-center mb-4 text-sm">Checking your inner rhythms</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pulseCategories.map((category) => {
                const IconComponent = category.icon;
                const score = selectedScores[category.key];
                
                return (
                  <div key={category.key} className="text-center">
                    <div className="mb-2">
                      <IconComponent className="w-6 h-6 text-white/90 mx-auto mb-1" />
                      <h4 className="text-white/90 text-sm font-medium">{category.label}</h4>
                    </div>
                    <div className="flex justify-center space-x-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setSelectedScores(prev => ({ ...prev, [category.key]: num }))}
                          className={`w-6 h-6 rounded-full text-xs font-bold transition-all duration-200 ${
                            score === num
                              ? 'bg-white text-black scale-110'
                              : 'bg-white/20 text-white/70 hover:bg-white/30'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Circadian Health Benefits */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 drop-shadow-lg text-center tracking-wide">Circadian Health Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockStats.circadianBenefits.map((benefit) => {
              const progress = benefit.currentDays / benefit.requiredDays;
              const styles = getStateStyles(benefit.state, progress);
              const isExpanded = expandedBenefit === benefit.id;
              
              return (
                <div
                  key={benefit.id}
                  className={`${styles.bg} backdrop-blur-md rounded-xl p-4 border ${styles.glow} shadow-xl ${styles.animation} relative overflow-hidden cursor-pointer transition-all duration-300`}
                  onClick={() => setExpandedBenefit(isExpanded ? null : benefit.id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className={`font-semibold ${styles.text} drop-shadow text-sm`}>{benefit.name}</h4>
                        <p className={`${styles.text} opacity-80 text-xs`}>{benefit.description}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-white/20 rounded-full text-white/90">
                        {styles.status}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-white/90 text-xs mb-2">{benefit.shortTip}</p>
                      {isExpanded && (
                        <p className="text-white/80 text-xs italic">{benefit.evidence}</p>
                      )}
                    </div>
                    
                    <div className="relative">
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${getProgressColor(progress)} rounded-full transition-all duration-1000 animate-pulse`}
                          style={{ width: `${Math.min(progress * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-white/80 mt-1">
                        <span>{benefit.currentDays} days</span>
                        <span>{benefit.requiredDays} needed</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AddSessionModal
        isOpen={showAddSession}
        onClose={() => setShowAddSession(false)}
        onSave={handleAddSession}
        currentTime={currentTime}
      />
    </div>
  );
};

export default StatsPage;
