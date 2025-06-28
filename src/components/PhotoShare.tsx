
import React, { useState, useRef } from 'react';
import { Camera, Share2, Download, X, Sun, Moon, Quote, RefreshCw } from 'lucide-react';
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

// Sunrise/sunset ocean images - curated for SolCue aesthetic
const defaultImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop', // Ocean sunrise with warm colors
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=800&fit=crop', // Lake sunrise with mountains
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=800&fit=crop', // Ocean sunset with dramatic sky
  'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=800&h=800&fit=crop', // Beach sunrise with palm trees
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop', // Golden hour ocean
  'https://images.unsplash.com/photo-1484821582734-6c6c9f99a672?w=800&h=800&fit=crop', // Peaceful sunrise over water
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
  const [showQuote, setShowQuote] = useState(true);
  const [currentQuote, setCurrentQuote] = useState(getRandomQuote());
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

  const getNextQuote = () => {
    setCurrentQuote(getRandomQuote());
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

    // Load and draw background image (full bleed)
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      // Draw full background image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Add subtle dark overlay for text legibility
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0,0,0,0.1)');
      gradient.addColorStop(0.7, 'rgba(0,0,0,0.3)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw quote with shadow backdrop (lower third area) - only if showQuote is true
      if (showQuote) {
        const quoteText = `"${currentQuote.text}"`;
        const maxQuoteWidth = canvas.width - 120;
        
        // Position quote in lower third (starting around 67% down)
        const quoteAreaStart = canvas.height * 0.67;
        
        // Create shadow backdrop for quote
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(60, quoteAreaStart, canvas.width - 120, 300);
        
        // Draw quote text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, serif';
        ctx.textAlign = 'center';
        
        // Wrap quote text
        const words = quoteText.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxQuoteWidth && currentLine !== '') {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine.trim());
        
        // Draw quote lines
        const quoteStartY = quoteAreaStart + 60;
        lines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, quoteStartY + index * 60);
        });
        
        // Draw quote author
        ctx.font = '36px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`— ${currentQuote.author}`, canvas.width / 2, quoteStartY + lines.length * 60 + 60);
      }

      // Draw "Light is medicine" centered at bottom
      const bottomY = canvas.height - 120;
      ctx.font = '42px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('Light is medicine', canvas.width / 2, bottomY);

      // Draw SolCue logo at bottom right
      const logoX = canvas.width - 180;
      const logoY = canvas.height - 180;
      
      // Draw sun icon (matching your logo style)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(logoX, logoY, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw sun rays (matching your logo)
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        const x1 = logoX + Math.cos(angle) * 35;
        const y1 = logoY + Math.sin(angle) * 35;
        const x2 = logoX + Math.cos(angle) * 50;
        const y2 = logoY + Math.sin(angle) * 50;
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      
      // Draw horizontal lines (waves from logo)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const y = logoY + 60 + i * 8;
        ctx.beginPath();
        ctx.moveTo(logoX - 40 + i * 8, y);
        ctx.lineTo(logoX + 40 - i * 8, y);
        ctx.stroke();
      }
      
      // Draw "SOLCUE" text below logo
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '4px';
      ctx.fillText('SOLCUE', logoX, logoY + 100);

      // Add session info if tracking
      if (isTracking) {
        ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(`${formatTime(timeElapsed)} in ${getCurrentPhase()}`, canvas.width / 2, bottomY - 60);
      }

      setIsGeneratingCard(false);
    };
    
    img.src = imageToUse;
  };

  const shareCard = async () => {
    await generateShareableCard();
    
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png', 0.9);
      
      if (navigator.share) {
        const blob = await fetch(dataUrl).then(res => res.blob());
        const file = new File([blob], 'solcue-session.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'My SolCue Light Session',
          text: 'Living in sync with nature\'s circadian rhythms 🌅',
          files: [file]
        });
      } else {
        downloadCard();
      }
    } catch (error) {
      console.error('Error sharing:', error);
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
              
              <div className="text-white/60 text-sm">Or choose a sunrise/sunset scene:</div>
              
              <div className="grid grid-cols-2 gap-2">
                {defaultImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => selectDefaultImage(imageUrl)}
                    className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform border border-white/20"
                  >
                    <img 
                      src={imageUrl} 
                      alt={`Sunrise/sunset scene ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Photo preview with overlays */}
            <div className="aspect-square rounded-xl overflow-hidden relative">
              <img 
                src={activeImage} 
                alt="Selected image" 
                className="w-full h-full object-cover"
              />
              
              {/* Light is Medicine - centered at bottom */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                <div className="text-white text-lg font-medium drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  Light is medicine
                </div>
              </div>

              {/* SolCue Logo - bottom right */}
              <div className="absolute bottom-4 right-4 text-center">
                {/* Sun icon with rays */}
                <div className="relative mb-2">
                  <div className="w-6 h-6 bg-white rounded-full mx-auto relative">
                    {/* Sun rays */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-2 bg-white"
                        style={{
                          top: '-8px',
                          left: '50%',
                          transformOrigin: '1px 14px',
                          transform: `translateX(-50%) rotate(${i * 45}deg)`
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* SolCue text */}
                <div className="text-white font-bold text-sm tracking-wider drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  SOLCUE
                </div>
              </div>

              {/* Quote Overlay (toggleable) - positioned in lower third */}
              {showQuote && (
                <div className="absolute bottom-20 left-4 right-4">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <p className="text-white text-sm italic mb-2">"{currentQuote.text}"</p>
                    <p className="text-white/80 text-xs">— {currentQuote.author}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quote controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowQuote(!showQuote)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  showQuote 
                    ? 'bg-white/20 text-white border border-white/30' 
                    : 'bg-white/10 text-white/60 border border-white/20'
                }`}
              >
                <Quote className="w-4 h-4" />
                <span className="text-sm">Show Quote</span>
              </button>

              {showQuote && (
                <button
                  onClick={getNextQuote}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/80 rounded-full hover:bg-white/20 transition-colors border border-white/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Next Quote</span>
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={shareCard}
                disabled={isGeneratingCard}
                className="flex-1 px-4 py-3 text-white rounded-xl font-medium hover:scale-105 transition-transform disabled:opacity-50"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` 
                }}
              >
                {isGeneratingCard ? 'Creating...' : 'Share to Social'}
              </button>
              
              <button
                onClick={() => {
                  setCapturedPhoto(null);
                  setSelectedDefaultImage(null);
                }}
                className="px-4 py-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                Choose New Image
              </button>
            </div>
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
