
import React from 'react';
import { Sun, Moon, MapPin, Clock, Calendar, TrendingUp } from 'lucide-react';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { useLocation } from '@/hooks/useLocation';

const StatsView: React.FC = () => {
  const { sessions, currentSession, getWeeklyMinutes, getCurrentStreak } = useSessionTracking();
  const { location } = useLocation();

  const todaySessions = sessions.filter(session => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDate = new Date(session.startTime);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });

  const totalSessionsToday = todaySessions.length;
  const totalMinutesToday = todaySessions.reduce((total, session) => total + (session.duration || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
            Light Tracking Stats
          </h1>
          <p className="text-white/90">Evidence-based wellness tracking</p>
        </div>

        {/* Current Session */}
        {currentSession && (
          <div className="mb-6 p-6 rounded-2xl bg-green-500/80 backdrop-blur-sm border border-white/30 shadow-xl">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold text-lg">Active Session</span>
            </div>
            <div className="mt-3 text-white/95">
              <p>Started: {currentSession.startTime.toLocaleTimeString()}</p>
              <p>Type: {currentSession.type}</p>
              {currentSession.location && (
                <p className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Location: {currentSession.location.latitude.toFixed(2)}, {currentSession.location.longitude.toFixed(2)}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/40 text-center shadow-xl">
            <TrendingUp className="w-8 h-8 text-white mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{getCurrentStreak()}</div>
            <div className="text-white/90 text-sm">Day Streak</div>
          </div>
          
          <div className="bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/40 text-center shadow-xl">
            <Clock className="w-8 h-8 text-white mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{getWeeklyMinutes()}</div>
            <div className="text-white/90 text-sm">Weekly Minutes</div>
          </div>
          
          <div className="bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/40 text-center shadow-xl">
            <Sun className="w-8 h-8 text-white mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{totalSessionsToday}</div>
            <div className="text-white/90 text-sm">Today's Sessions</div>
          </div>
          
          <div className="bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/40 text-center shadow-xl">
            <Calendar className="w-8 h-8 text-white mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{totalMinutesToday}</div>
            <div className="text-white/90 text-sm">Today's Minutes</div>
          </div>
        </div>

        {/* Location Info */}
        <div className="mb-8 p-6 rounded-2xl bg-white/25 backdrop-blur-md border border-white/40 shadow-xl">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Current Location</span>
          </h3>
          {location ? (
            <div className="text-white/90">
              <p>Latitude: {location.latitude.toFixed(6)}</p>
              <p>Longitude: {location.longitude.toFixed(6)}</p>
              <p className="text-sm mt-2 text-white/70">
                Last updated: {new Date(location.timestamp).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-white/70">Location not available</p>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl">
          <h3 className="text-white font-semibold text-lg mb-4">Recent Sessions</h3>
          {sessions.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {sessions.slice(0, 10).map((session) => (
                <div key={session.id} className="bg-white/15 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {session.type === 'morning' ? (
                        <Sun className="w-5 h-5 text-yellow-300" />
                      ) : session.type === 'evening' ? (
                        <Moon className="w-5 h-5 text-orange-300" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-300" />
                      )}
                      <div>
                        <p className="text-white font-medium capitalize">{session.type} Session</p>
                        <p className="text-white/70 text-sm">
                          {new Date(session.startTime).toLocaleDateString()} at {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{session.duration || 0} min</p>
                      {session.location && (
                        <p className="text-white/60 text-xs">GPS tracked</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/70 text-center py-8">No sessions recorded yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsView;
