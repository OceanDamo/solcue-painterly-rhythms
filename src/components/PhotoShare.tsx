
import React, { useState, useRef } from 'react';
import { Camera, Share2, Download, X, Sun, Moon } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useSessionTracking } from '../hooks/useSessionTracking';

interface PhotoShareProps {
  currentTheme: string;
  sunTimes: any;
  currentHour: number;
  isTracking: boolean;
  timeElapsed: number;
  onClose: () => void;
}

// Match the existing color themes from UnifiedSunClock
const colorThemes = {
  default: {
    name: "Natural",
    primary: "#fbbf24",
    secondary: "#f59e0b",
    accent: "#dc2626",
    background: "from-amber-900 via-orange-800 to-red-900",
  },
  purple: {
    name: "Cosmic Purple",
    primary: "#c084fc",
    secondary: "#a855f7",
    accent: "#9333ea",
    background: "from-purple-900 via-violet-800 to-indigo-900",
  },
  ocean: {
    name: "Ocean Blue",
    primary: "#38bdf8",
    secondary: "#0284c7",
    accent: "#06b6d4",
    background: "from-blue-900 via-cyan-800 to-teal-900",
  },
  monochrome: {
    name: "Midnight",
    primary: "#9ca3af",
    secondary: "#6b7280",
    accent: "#4b5563",
    background: "from-gray-900 via-slate-800 to-zinc-900",
  },
};

const PhotoShare: React.FC<PhotoShareProps> = ({
  currentTheme,
  sunTimes,
  currentHour,
  isTracking,
  timeElapsed,
  onClose
}) => {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const theme = colorThemes[currentTheme as keyof typeof colorThemes];
  const { stats } = useSessionTracking();

  const takePhoto = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      
      setCapturedPhoto(image.dataUrl || null);
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentPhase = () => {
    const inMorningPrime = currentHour >= sunTimes.morningPrimeStart && currentHour <= sunTimes.morningPrimeEnd;
    const inEveningPrime = currentHour >= sunTimes.eveningPrimeStart && currentHour <= sunTimes.eveningPrimeEnd;
    
    if (inMorningPrime) return "Morning Prime Light";
    if (inEveningPrime) return "Evening Prime Light";
    if (currentHour >= sunTimes.sunrise && currentHour <= sunTimes.sunset) return "Daylight";
    return "Night Cycle";
  };

  const generateShareableCard = async () => {
    if (!capturedPhoto || !canvasRef.current) return;

    setIsGeneratingCard(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to Instagram story dimensions (9:16 ratio)
    canvas.width = 1080;
    canvas.height = 1920;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, theme.primary + '40');
    gradient.addColorStop(0.5, theme.secondary + '20');
    gradient.addColorStop(1, theme.accent + '40');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw user photo
    const img = new Image();
    img.onload = async () => {
      // Draw user photo (circular, centered)
      const photoSize = 400;
      const photoX = (canvas.width - photoSize) / 2;
      const photoY = 200;

      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX + photoSize/2, photoY + photoSize/2, photoSize/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
      ctx.restore();

      // Draw circular border around photo
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(photoX + photoSize/2, photoY + photoSize/2, photoSize/2 + 4, 0, Math.PI * 2);
      ctx.stroke();

      // Draw SolCue branding
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SolCue', canvas.width / 2, 120);
      
      ctx.font = '40px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#ffffff90';
      ctx.fillText('Circadian Light Tracker', canvas.width / 2, 170);

      // Draw mini sun clock representation
      const clockSize = 150;
      const clockX = canvas.width / 2 - clockSize / 2;
      const clockY = 700;
      
      // Clock background
      ctx.fillStyle = '#00000040';
      ctx.beginPath();
      ctx.arc(clockX + clockSize/2, clockY + clockSize/2, clockSize/2, 0, Math.PI * 2);
      ctx.fill();

      // Draw current time indicator
      const angle = (currentHour / 24) * 360 - 90;
      const angleRad = (angle * Math.PI) / 180;
      const sunX = clockX + clockSize/2 + Math.cos(angleRad) * (clockSize/3);
      const sunY = clockY + clockSize/2 + Math.sin(angleRad) * (clockSize/3);
      
      ctx.fillStyle = theme.primary;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw session stats
      const statsY = 900;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      
      if (isTracking) {
        ctx.fillText(`${formatTime(timeElapsed)} in ${getCurrentPhase()}`, canvas.width / 2, statsY);
      } else {
        ctx.fillText(`Connected to Nature's Rhythm`, canvas.width / 2, statsY);
      }

      ctx.font = '36px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#ffffff80';
      ctx.fillText(`${getCurrentTimeString()} • ${getCurrentPhase()}`, canvas.width / 2, statsY + 60);

      // Draw weekly stats if available
      if (stats && stats.weeklyMinutes) {
        ctx.fillText(`This week: ${Math.floor(stats.weeklyMinutes / 7)}min daily average`, canvas.width / 2, statsY + 120);
      }

      // Draw inspirational message
      ctx.font = '44px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = theme.primary;
      ctx.fillText('Living in sync with nature\'s cycles', canvas.width / 2, 1400);

      // Draw theme signature
      ctx.font = '32px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#ffffff60';
      ctx.fillText(`${theme.name} Theme • Ocean State of Mind`, canvas.width / 2, 1500);

      // Add decorative elements
      ctx.strokeStyle = theme.primary + '40';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(100, 650);
      ctx.lineTo(canvas.width - 100, 650);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(100, 1300);
      ctx.lineTo(canvas.width - 100, 1300);
      ctx.stroke();

      setIsGeneratingCard(false);
    };
    
    img.src = capturedPhoto;
  };

  const shareCard = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png', 0.9);
      
      // Fallback sharing method using Web Share API or download
      if (navigator.share) {
        const blob = await fetch(dataUrl).then(res => res.blob());
        const file = new File([blob], 'solcue-session.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'My SolCue Light Session',
          text: 'Living in sync with nature\'s circadian rhythms 🌅',
          files: [file]
        });
      } else {
        // Fallback to download
        downloadCard();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to download
      downloadCard();
    }
  };

  const downloadCard = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `solcue-session-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/80 rounded-2xl border border-white/20 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Share Your Light Session</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Photo capture section */}
        {!capturedPhoto ? (
          <div className="text-center py-8">
            <div className="mb-6">
              <Camera className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <p className="text-white/80 mb-2">Capture this moment</p>
              <p className="text-white/60 text-sm">
                {isTracking ? `You've been outside for ${formatTime(timeElapsed)}` : 'Share your connection to nature'}
              </p>
            </div>
            
            <button
              onClick={takePhoto}
              className="px-6 py-3 bg-gradient-to-r text-white rounded-full font-semibold hover:scale-105 transition-transform"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` 
              }}
            >
              Take Photo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Photo preview */}
            <div className="aspect-square rounded-xl overflow-hidden">
              <img 
                src={capturedPhoto} 
                alt="Captured session" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Session info */}
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {currentHour >= sunTimes.sunrise && currentHour <= sunTimes.sunset ? (
                  <Sun className="w-5 h-5" style={{ color: theme.primary }} />
                ) : (
                  <Moon className="w-5 h-5" style={{ color: theme.primary }} />
                )}
                <span className="text-white font-medium">{getCurrentPhase()}</span>
              </div>
              <p className="text-white/80 text-sm">
                {isTracking ? `Session: ${formatTime(timeElapsed)}` : getCurrentTimeString()}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={generateShareableCard}
                disabled={isGeneratingCard}
                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50 font-medium"
              >
                {isGeneratingCard ? 'Creating...' : 'Create Story Card'}
              </button>
              
              <button
                onClick={() => setCapturedPhoto(null)}
                className="px-4 py-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                Retake
              </button>
            </div>

            {/* Share buttons (shown after card generation) */}
            {capturedPhoto && !isGeneratingCard && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={shareCard}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-medium hover:scale-105 transition-transform"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` 
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  Share Story
                </button>
                
                <button
                  onClick={downloadCard}
                  className="px-4 py-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hidden canvas for card generation */}
        <canvas
          ref={canvasRef}
          className="hidden"
          width={1080}
          height={1920}
        />
      </div>
    </div>
  );
};

export default PhotoShare;
