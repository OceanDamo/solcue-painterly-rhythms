
import React from 'react';
import { Home, BarChart3 } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'home' | 'stats';
  onTabChange: (tab: 'home' | 'stats') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/20 backdrop-blur-md border-t border-white/30 safe-area-pb">
      <div className="flex">
        <button
          onClick={() => onTabChange('home')}
          className={`flex-1 flex flex-col items-center py-3 px-4 transition-colors ${
            activeTab === 'home' 
              ? 'text-white bg-white/20' 
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Home</span>
        </button>
        
        <button
          onClick={() => onTabChange('stats')}
          className={`flex-1 flex flex-col items-center py-3 px-4 transition-colors ${
            activeTab === 'stats' 
              ? 'text-white bg-white/20' 
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <BarChart3 className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Stats</span>
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;
