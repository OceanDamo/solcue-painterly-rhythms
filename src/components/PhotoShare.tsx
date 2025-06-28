
import React, { useState, useRef } from 'react';
import { Camera, Share2, Download, X, Sun, Moon } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useSessionTracking } from '../hooks/useSessionTracking';
import { getRandomQuote } from '../data/quotes';

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

// Default placeholder images
const defaultImages = [
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=800&fit=crop', // Foggy mountain
  'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=800&fit=crop', // Blue starry night
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=800&fit=crop', // Pine trees
];

const PhotoShare: React.FC<PhotoShareProps> = ({
  currentTheme,
  sunTimes,
  currentHour,
  isTracking,
  timeElapsed,
  onClose
}) => {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [selectedDefaultImage, setSelectedDefaultImage] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [currentQuote] = useState(getRandomQuote());
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
      setSelectedDefaultImage(null);
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const selectDefaultImage = (imageUrl: string) => {
    setSelectedDefaultImage(imageUrl);
    setCapturedPhoto(null);
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
    const imageToUse = capturedPhoto || selectedDefaultImage;
    if (!imageToUse || !canvasRef.current) return;

    setIsGeneratingCard(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to Instagram story dimensions (9:16 ratio)
    canvas.width = 1080;
    canvas.height = 1920;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(0.5, '#2d2d2d');
    gradient.addColorStop(1, '#1a1a1a');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw user photo
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      // Draw large photo (main focal point)
      const photoSize = 600;
      const photoX = (canvas.width - photoSize) / 2;
      const photoY = 300;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoSize, photoSize, 20);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
      ctx.restore();

      // Draw subtle border around photo
      ctx.strokeStyle = theme.primary + '80';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoSize, photoSize, 20);
      ctx.stroke();

      // Draw SolCue logo at top (using the uploaded logo as reference)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      
      // Draw sun icon (simple representation)
      const logoY = 120;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, logoY - 20, 20, 0, Math.PI * 2);
      ctx.fillStyle = theme.primary;
      ctx.fill();
      
      // Draw sun rays
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        const x1 = canvas.width / 2 + Math.cos(angle) * 30;
        const y1 = logoY - 20 + Math.sin(angle) * 30;
        const x2 = canvas.width / 2 + Math.cos(angle) * 40;
        const y2 = logoY - 20 + Math.sin(angle) * 40;
        
        ctx.strokeStyle = theme.primary;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText('SOLCUE', canvas.width / 2, logoY + 20);
      
      // Draw "Light is Medicine" tagline
      ctx.font = '32px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = theme.primary;
      ctx.fillText('Light is Medicine', canvas.width / 2, logoY + 70);

      // Draw inspirational quote
      ctx.fillStyle = '#ffffff';
      ctx.font = '36px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      
      // Wrap quote text
      const maxWidth = 900;
      const words = `"${currentQuote.text}"`.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine !== '') {
          lines.push(currentLine);
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
      
      // Draw quote lines
      const quoteStartY = 950;
      lines.forEach((line, index) => {
        ctx.fillText(line.trim(), canvas.width / 2, quoteStartY + index * 50);
      });
      
      // Draw quote author
      ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = theme.primary;
      ctx.fillText(`— ${currentQuote.author}`, canvas.width / 2, quoteStartY + lines.length * 50 + 40);

      // Draw session stats
      const statsY = 1400;
      ctx.fillStyle = '#ffffff';
      ctx.font = '40px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      
      if (isTracking) {
        ctx.fillText(`${formatTime(timeElapsed)} in ${getCurrentPhase()}`, canvas.width / 2, statsY);
      } else {
        ctx.fillText(`Connected to Nature's Rhythm`, canvas.width / 2, statsY);
      }

      ctx.font = '32px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#ffffff80';
      ctx.fillText(`${getCurrentTimeString()} • ${getCurrentPhase()}`, canvas.width / 2, statsY + 50);

      // Draw weekly stats if available
      if (stats && stats.weeklyMinutes) {
        ctx.fillText(`This week: ${Math.floor(stats.weeklyMinutes / 7)}min daily average`, canvas.width / 2, statsY + 100);
      }

      // Draw theme signature
      ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#ffffff60';
      ctx.fillText(`${theme.name} Theme • Ocean State of Mind`, canvas.width / 2, 1600);

      // Add decorative elements
      ctx.strokeStyle = theme.primary + '40';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(100, 250);
      ctx.lineTo(canvas.width - 100, 250);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(100, 1350);
      ctx.lineTo(canvas.width - 100, 1350);
      ctx.stroke();

      setIsGeneratingCard(false);
    };
    
    img.src = imageToUse;
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

  const activeImage = capturedPhoto || selectedDefaultImage;

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

        {/* Photo capture/selection section */}
        {!activeImage ? (
          <div className="text-center py-8">
            <div className="mb-6">
              <Camera className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <p className="text-white/80 mb-2">Capture or choose an image</p>
              <p className="text-white/60 text-sm">
                {isTracking ? `You've been outside for ${formatTime(timeElapsed)}` : 'Share your connection to nature'}
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={takePhoto}
                className="w-full px-6 py-3 bg-gradient-to-r text-white rounded-full font-semibold hover:scale-105 transition-transform"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` 
                }}
              >
                Take Photo
              </button>
              
              <div className="text-white/60 text-sm">Or choose a nature scene:</div>
              
              <div className="grid grid-cols-3 gap-2">
                {defaultImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => selectDefaultImage(imageUrl)}
                    className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform"
                  >
                    <img 
                      src={imageUrl} 
                      alt={`Nature scene ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Photo preview */}
            <div className="aspect-square rounded-xl overflow-hidden">
              <img 
                src={activeImage} 
                alt="Selected image" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quote preview */}
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white/90 text-sm italic mb-2">"{currentQuote.text}"</p>
              <p className="text-white/70 text-xs">— {currentQuote.author}</p>
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
                onClick={() => {
                  setCapturedPhoto(null);
                  setSelectedDefaultImage(null);
                }}
                className="px-4 py-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                Choose Again
              </button>
            </div>

            {/* Share buttons (shown after card generation) */}
            {!isGeneratingCard && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={shareCard}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-medium hover:scale-105 transition-transform"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` 
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  Share to Social
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
