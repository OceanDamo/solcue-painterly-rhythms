
import React from 'react';
import { Home, BarChart, Info } from 'lucide-react';

interface NavigationProps {
  activeTab: 'home' | 'stats' | 'about';
  onTabChange: (tab: 'home' | 'stats' | 'about') => void;
  currentTime: Date;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, currentTime }) => {
  const hours = currentTime.getHours();
  
  // Enhanced painterly color palette based on time
  const getTimeColors = () => {
    if (hours >= 5 && hours < 8) {
      return {
        primary: 'from-rose-300 via-orange-300 via-amber-300 to-yellow-400',
        accent: 'from-amber-400 via-orange-500 to-rose-500',
        glow: 'shadow-orange-400/60',
        atmospheric: 'from-orange-200/40 via-pink-300/30 to-yellow-200/20'
      };
    } else if (hours >= 8 && hours < 17) {
      return {
        primary: 'from-sky-300 via-blue-400 via-cyan-400 to-teal-400',
        accent: 'from-cyan-400 via-blue-500 to-indigo-500',
        glow: 'shadow-blue-400/60',
        atmospheric: 'from-cyan-200/40 via-blue-300/30 to-sky-200/20'
      };
    } else if (hours >= 17 && hours < 20) {
      return {
        primary: 'from-red-400 via-orange-500 via-pink-500 to-purple-600',
        accent: 'from-orange-500 via-red-500 to-purple-600',
        glow: 'shadow-red-400/60',
        atmospheric: 'from-red-200/40 via-orange-300/30 to-purple-200/20'
      };
    } else {
      return {
        primary: 'from-indigo-700 via-purple-700 via-blue-800 to-slate-800',
        accent: 'from-indigo-600 via-purple-600 to-slate-700',
        glow: 'shadow-purple-400/60',
        atmospheric: 'from-indigo-300/40 via-purple-400/30 to-slate-300/20'
      };
    }
  };

  const colors = getTimeColors();

  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'stats' as const, icon: BarChart, label: 'Stats' },
    { id: 'about' as const, icon: Info, label: 'About' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className={`bg-gradient-to-r ${colors.accent} backdrop-blur-md border-t border-white/20 ${colors.glow} shadow-2xl relative overflow-hidden`}>
        {/* Atmospheric background */}
        <div className={`absolute inset-0 bg-gradient-to-r ${colors.atmospheric} opacity-60 animate-breathe`}></div>
        
        {/* Paint stroke effects */}
        <div className={`absolute top-0 left-1/4 w-32 h-8 bg-gradient-to-r ${colors.primary} opacity-30 rounded-full blur-sm animate-float`}></div>
        <div className={`absolute top-0 right-1/4 w-24 h-6 bg-gradient-to-l ${colors.primary} opacity-25 rounded-full blur-md animate-float delay-1000`}></div>
        
        <div className="flex justify-around items-center py-2 relative z-10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-500 relative overflow-hidden ${
                  isActive 
                    ? `bg-white/25 ${colors.glow} shadow-lg animate-breathe` 
                    : 'hover:bg-white/15'
                }`}
              >
                {/* Active indicator glow */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.primary} opacity-30 rounded-xl blur-sm animate-pulse`}></div>
                )}
                
                <div className="relative z-10 flex flex-col items-center">
                  <IconComponent 
                    className={`w-6 h-6 transition-all duration-300 ${
                      isActive 
                        ? 'text-white drop-shadow-lg scale-110' 
                        : 'text-white/80'
                    }`} 
                  />
                  <span 
                    className={`text-xs mt-1 font-medium tracking-wide transition-all duration-300 ${
                      isActive 
                        ? 'text-white drop-shadow-lg' 
                        : 'text-white/80'
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
