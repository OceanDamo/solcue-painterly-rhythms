
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface SacredTrackerProps {
  isInPrimeWindow: boolean;
  currentPhase: string;
  onClose: () => void;
}

const SacredTracker: React.FC<SacredTrackerProps> = ({ isInPrimeWindow, currentPhase, onClose }) => {
  const [todaysMoments, setTodaysMoments] = useState(0);
  const [todaysMinutes, setTodaysMinutes] = useState(0);

  const handleQuickMoment = () => {
    setTodaysMoments(prev => prev + 1);
    navigator?.vibrate?.(50);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 max-w-xs">
      <div className="text-center mb-4">
        <h3 className="text-white font-light text-sm mb-1">Light Time Today</h3>
        <p className="text-white/60 text-xs font-light">Optional tracking</p>
      </div>

      {/* Quick Moment Button */}
      {isInPrimeWindow && (
        <div className="text-center mb-4">
          <Button
            onClick={handleQuickMoment}
            size="sm"
            className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 hover:from-yellow-400/30 hover:to-orange-500/30 border border-yellow-400/40 text-white font-light px-4 py-2 rounded-full text-xs"
          >
            <Heart className="w-3 h-3 mr-1" />
            I'm in the light
          </Button>
        </div>
      )}

      {/* Simple Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center">
          <div className="text-xl font-light text-yellow-400">{todaysMoments}</div>
          <div className="text-xs text-white/60 font-light">Moments</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-light text-blue-300">{todaysMinutes}</div>
          <div className="text-xs text-white/60 font-light">Minutes</div>
        </div>
      </div>

      {/* Close Button */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-white/40 hover:text-white/60 text-xs font-light"
        >
          Close
        </Button>
      </div>
    </Card>
  );
};

export default SacredTracker;
