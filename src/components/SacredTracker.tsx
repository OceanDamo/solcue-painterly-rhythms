
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Sunrise, Sunset, Star } from 'lucide-react';

interface SacredTrackerProps {
  isInPrimeWindow: boolean;
  currentPhase: string;
}

const SacredTracker: React.FC<SacredTrackerProps> = ({ isInPrimeWindow, currentPhase }) => {
  const [showTracker, setShowTracker] = useState(false);
  const [todaysMoments, setTodaysMoments] = useState(0);
  const [todaysMinutes, setTodaysMinutes] = useState(0);

  const handleQuickMoment = () => {
    setTodaysMoments(prev => prev + 1);
    // Simple haptic feedback simulation
    navigator?.vibrate?.(50);
  };

  if (!showTracker) {
    return (
      <div className="flex justify-center mt-6">
        <Button
          variant="ghost"
          onClick={() => setShowTracker(true)}
          className="text-white/60 hover:text-white/80 text-sm font-light tracking-wide"
        >
          Optional Tracking ✨
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 mt-6">
      <div className="text-center mb-6">
        <h3 className="text-white font-light text-lg mb-2">Light Exposure Today</h3>
        <p className="text-white/70 text-sm font-light">
          Optional reflection • No pressure, only presence
        </p>
      </div>

      {/* Quick Moment Button */}
      {isInPrimeWindow && (
        <div className="text-center mb-6">
          <Button
            onClick={handleQuickMoment}
            className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 hover:from-yellow-400/30 hover:to-orange-500/30 border border-yellow-400/40 text-white font-light px-8 py-3 rounded-full transition-all duration-500 shadow-lg"
          >
            <Heart className="w-4 h-4 mr-2" />
            I'm Present with Light
          </Button>
        </div>
      )}

      {/* Gentle Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-light text-yellow-400 mb-1">{todaysMoments}</div>
          <div className="text-xs text-white/60 font-light">Conscious Moments</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-light text-blue-300 mb-1">{todaysMinutes}</div>
          <div className="text-xs text-white/60 font-light">Minutes in Light</div>
        </div>
      </div>

      {/* Weekly Flow */}
      <div className="mb-6">
        <h4 className="text-white/80 text-sm font-light mb-3 text-center">This Week's Flow</h4>
        <div className="flex justify-center space-x-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                index < 4 ? 'bg-yellow-400/30 text-yellow-200' : 'bg-white/10 text-white/40'
              }`}>
                {index < 4 ? '✨' : '○'}
              </div>
              <div className="text-xs text-white/40 mt-1 font-light">{day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Invitation */}
      <div className="text-center">
        <p className="text-white/70 text-sm font-light italic">
          {isInPrimeWindow 
            ? `The ${currentPhase.toLowerCase()} window is open—feel the invitation`
            : 'Rest in the rhythm • The next optimal window approaches'
          }
        </p>
      </div>

      {/* Minimize Button */}
      <div className="text-center mt-4">
        <Button
          variant="ghost"
          onClick={() => setShowTracker(false)}
          className="text-white/40 hover:text-white/60 text-xs font-light"
        >
          Return to Pure Experience
        </Button>
      </div>
    </Card>
  );
};

export default SacredTracker;
