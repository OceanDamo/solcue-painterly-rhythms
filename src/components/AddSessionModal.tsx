
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: { date: string; time: string; duration: number }) => void;
  currentTime: Date;
}

const AddSessionModal: React.FC<AddSessionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentTime 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('07:00');
  const [duration, setDuration] = useState(15);

  const hours = currentTime.getHours();

  const getTimeColors = () => {
    if (hours >= 5 && hours < 8) {
      return {
        primary: 'from-rose-300 via-orange-300 via-amber-300 to-yellow-400',
        accent: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
        glow: 'shadow-orange-400/60',
        atmospheric: 'from-orange-200/40 via-pink-300/30 to-yellow-200/20',
      };
    } else if (hours >= 8 && hours < 17) {
      return {
        primary: 'from-sky-300 via-blue-400 via-cyan-400 to-teal-400',
        accent: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500',
        glow: 'shadow-blue-400/60',
        atmospheric: 'from-cyan-200/40 via-blue-300/30 to-sky-200/20',
      };
    } else if (hours >= 17 && hours < 20) {
      return {
        primary: 'from-red-400 via-orange-500 via-pink-500 to-purple-600',
        accent: 'bg-gradient-to-br from-orange-500 via-red-500 to-purple-600',
        glow: 'shadow-red-400/60',
        atmospheric: 'from-red-200/40 via-orange-300/30 to-purple-200/20',
      };
    } else {
      return {
        primary: 'from-indigo-700 via-purple-700 via-blue-800 to-slate-800',
        accent: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-slate-700',
        glow: 'shadow-purple-400/60',
        atmospheric: 'from-indigo-300/40 via-purple-400/30 to-slate-300/20',
      };
    }
  };

  const colors = getTimeColors();

  const handleSave = () => {
    onSave({
      date: selectedDate,
      time: selectedTime,
      duration: duration
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`relative bg-gradient-to-br ${colors.primary} rounded-2xl p-6 border-2 border-white/40 ${colors.glow} shadow-2xl max-w-sm w-full`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white drop-shadow-lg">Add Light Session</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Duration (minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`flex-1 py-3 px-4 ${colors.accent} ${colors.glow} shadow-lg rounded-lg text-white font-medium hover:scale-105 transform transition-all duration-300 flex items-center justify-center space-x-2`}
            >
              <Plus className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSessionModal;
