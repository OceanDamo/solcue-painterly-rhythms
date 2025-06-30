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
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1484821582734-6c6c9f99a672?w=800&h=800&fit=crop',
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
  const [showSunClock, setShowSunClock] = useState(false);
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

  // Enhanced function to draw curved text around a circle
  const drawCurvedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    fontSize: number,
    color: string = '#ffffff'
  ) => {
    ctx.save();
    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const angleStep = (Math.PI * 1.5) / text.length; // Spread across 3/4 of circle
    
    for (let i = 0; i < text.length; i++) {
      const angle = startAngle + i * angleStep;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
    
    ctx.restore();
  };

  // Enhanced function to draw a simplified sun clock for sharing
  const drawSunClockForShare = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    // Draw clock background with subtle border
    ctx.save();
    
    // Outer border/glow
    const gradient = ctx.createRadialGradient(centerX, centerY, radius - 20, centerX, centerY, radius + 10);
    gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0.3)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Main clock circle
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Clock segments (simplified)
    const segments = 8;
    const segmentAngle = (Math.PI * 2) / segments;
    
    for (let i = 0; i < segments; i++) {
      const startAngle = i * segmentAngle - Math.PI / 2;
      const endAngle = (i + 1) * segmentAngle - Math.PI / 2;
      
      // Alternate colors for visual interest
      const colors = [theme.primary, theme.secondary, theme.accent];
      ctx.fillStyle = colors[i % colors.length] + '80'; // Add transparency
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius - 10, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
    }
    
    // Current time indicator (sun position)
    const currentAngle = ((currentHour / 24) * Math.PI * 2) - Math.PI / 2;
    const sunX = centerX + Math.cos(currentAngle) * (radius - 30);
    const sunY = centerY + Math.sin(currentAngle) * (radius - 30);
    
    // Sun glow
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 25);
    sunGlow.addColorStop(0, '#FFD700');
    sunGlow.addColorStop(0.5, '#FFA500');
    sunGlow.addColorStop(1, 'rgba(255,165,0,0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun core
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Center dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  // Function to draw the SolCue logo - placeholder for when you upload the actual icons
  const drawSolCueLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1) => {
    ctx.save();
    
    // Set drawing properties
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3 * scale;
    ctx.lineCap = 'round';
    
    // Draw the main sun circle (larger, like in your design)
    const sunRadius = 25 * scale;
    ctx.beginPath();
    ctx.arc(x, y - 20 * scale, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw sun rays around the circle (12 rays like in your design)
    const rayLength = 15 * scale;
    const rayStartRadius = sunRadius + 5 * scale;
    const rayEndRadius = rayStartRadius + rayLength;
    
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const x1 = x + Math.cos(angle) * rayStartRadius;
      const y1 = (y - 20 * scale) + Math.sin(angle) * rayStartRadius;
      const x2 = x + Math.cos(angle) * rayEndRadius;
      const y2 = (y - 20 * scale) + Math.sin(angle) * rayEndRadius;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    // Draw the horizon line (thicker, like in your design)
    ctx.lineWidth = 6 * scale;
    const horizonWidth = 80 * scale;
    ctx.beginPath();
    ctx.moveTo(x - horizonWidth/2, y + 30 * scale);
    ctx.lineTo(x + horizonWidth/2, y + 30 * scale);
    ctx.stroke();
    
    // Draw the wave lines (3 waves, decreasing in width)
    ctx.lineWidth = 4 * scale;
    const waveSpacing = 12 * scale;
    const waveWidths = [60 * scale, 45 * scale, 30 * scale];
    
    for (let i = 0; i < 3; i++) {
      const waveY = y + 45 * scale + i * waveSpacing;
      const waveWidth = waveWidths[i];
      
      ctx.beginPath();
      ctx.moveTo(x - waveWidth/2, waveY);
      ctx.lineTo(x + waveWidth/2, waveY);
      ctx.stroke();
    }
    
    // Draw "SOLCUE" text below the logo
    ctx.font = `bold ${32 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText('SOLCUE', x, y + 120 * scale);
    
    ctx.restore();
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

    // Load and draw background
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      if (showSunClock) {
        // Sun clock background - solid color with subtle gradient
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#000814');
        bgGradient.addColorStop(0.5, '#001d3d');
        bgGradient.addColorStop(1, '#003566');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw enhanced sun clock in center
        const clockRadius = 300;
        const clockCenterX = canvas.width / 2;
        const clockCenterY = canvas.height * 0.4; // Position in upper-middle area
        drawSunClockForShare(ctx, clockCenterX, clockCenterY, clockRadius);
        
        // Draw curved quote around the clock
        if (showQuote) {
          const quoteText = `"${currentQuote.text}"`;
          const quoteRadius = clockRadius + 80; // Position outside the clock
          
          // Create a subtle background arc for the quote
          ctx.save();
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 60;
          ctx.beginPath();
          ctx.arc(clockCenterX, clockCenterY, quoteRadius, -Math.PI * 0.75, Math.PI * 0.75);
          ctx.stroke();
          ctx.restore();
          
          // Curved quote text
          drawCurvedText(
            ctx,
            quoteText,
            clockCenterX,
            clockCenterY,
            quoteRadius,
            -Math.PI * 0.75, // Start from top-left
            28,
            '#ffffff'
          );
          
          // Author text (straight, below clock)
          ctx.font = '32px -apple-system, BlinkMacSystemFont, serif';
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.textAlign = 'center';
          ctx.fillText(`— ${currentQuote.author}`, clockCenterX, clockCenterY + clockRadius + 180);
        }
        
      } else {
        // Photo background mode
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Add subtle dark overlay for text legibility
        const overlay = ctx.createLinearGradient(0, 0, 0, canvas.height);
        overlay.addColorStop(0, 'rgba(0,0,0,0.1)');
        overlay.addColorStop(0.7, 'rgba(0,0,0,0.2)');
        overlay.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw quote in top area with better styling
        if (showQuote) {
          const quoteText = `"${currentQuote.text}"`;
          const maxQuoteWidth = canvas.width - 120;
          
          // Create styled quote background
          const quoteAreaStart = canvas.height * 0.08;
          const quoteAreaHeight = canvas.height * 0.2;
          
          // Rounded rectangle background
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.beginPath();
          ctx.roundRect(40, quoteAreaStart, canvas.width - 80, quoteAreaHeight, 20);
          ctx.fill();
          
          // Border
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Quote text with better formatting
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, serif';
          ctx.textAlign = 'center';
          
          // Text wrapping
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
          const lineHeight = 55;
          const quoteStartY = quoteAreaStart + 60;
          
          lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, quoteStartY + index * lineHeight);
          });
          
          // Author
          ctx.font = '32px -apple-system, BlinkMacSystemFont, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fillText(`— ${currentQuote.author}`, canvas.width / 2, quoteStartY + lines.length * lineHeight + 40);
        }
      }

      // Bottom section with tagline and logo (consistent for both modes)
      const bottomSectionY = canvas.height - 300;
      
      // "Light is medicine" with better styling
      ctx.font = '48px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText('Light is medicine', canvas.width / 2, bottomSectionY);
      ctx.shadowBlur = 0; // Reset shadow
      
      // Tagline
      ctx.font = '36px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText('Get your daily dose', canvas.width / 2, bottomSectionY + 50);

      // Enhanced SolCue logo
      const logoX = canvas.width - 180;
      const logoY = canvas.height - 180;
      drawSolCueLogo(ctx, logoX, logoY, 1.3);

      // Session info and location
      if (isTracking) {
        ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.textAlign = 'right';
        ctx.fillText(`${formatTime(timeElapsed)} in ${getCurrentPhase()}`, canvas.width - 40, logoY - 80);
      }
      
      // Location (bottom center)
      ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('Providence, RI • 41.82°N, 71.41°W', canvas.width / 2, canvas.height - 60);

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
              
              <button
                onClick={() => setShowSunClock(true)}
                className="w-full px-6 py-3 bg-gradient-to-r text-white rounded-full font-semibold hover:scale-105 transition-transform border border-white/20"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.secondary}, ${theme.accent})` 
                }}
              >
                Use Current Sun Clock
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
            {/* Enhanced preview */}
            <div className="aspect-[9/16] rounded-xl overflow-hidden relative border-2 border-white/20">
              {showSunClock ? (
                // Sun clock preview with proper layout
                <div className="w-full h-full bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center p-4">
                  {/* Quote area at top */}
                  {showQuote && (
                    <div className="absolute top-4 left-4 right-4 text-center">
                      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <p className="text-white text-xs italic mb-1">"{currentQuote.text}"</p>
                        <p className="text-white/70 text-xs">— {currentQuote.author}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Simplified sun clock in center */}
                  <div className="relative w-48 h-48 rounded-full border-2 border-white/30 bg-black/40 flex items-center justify-center">
                    <div className="absolute inset-2 rounded-full" style={{ background: `conic-gradient(${theme.primary}, ${theme.secondary}, ${theme.accent}, ${theme.primary})` }}>
                      <div className="w-full h-full rounded-full bg-black/60 flex items-center justify-center">
                        <Sun className="w-8 h-8 text-yellow-400" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom info */}
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="text-white text-sm font-medium mb-1">Light is medicine</div>
                    <div className="text-white/70 text-xs mb-2">Get your daily dose</div>
                    <div className="text-white/60 text-xs">Providence, RI</div>
                  </div>
                </div>
              ) : (
                // Photo preview
                <>
                  <img 
                    src={activeImage} 
                    alt="Selected image" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Quote overlay at top */}
                  {showQuote && (
                    <div className="absolute top-4 left-4 right-4">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="text-white text-xs italic mb-1">"{currentQuote.text}"</p>
                        <p className="text-white/80 text-xs">— {currentQuote.author}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Bottom content - non-overlapping */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="text-white text-sm font-medium drop-shadow-2xl mb-1">Light is medicine</div>
                    <div className="text-white/80 text-xs drop-shadow-lg">Get your daily dose</div>
                  </div>
                </>
              )}
            </div>

            {/* Enhanced controls */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowQuote(!showQuote)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  showQuote 
                    ? 'bg-white/20 text-white border border-white/30' 
                    : 'bg-white/10 text-white/60 border border-white/20'
                }`}
              >
                <Quote className="w-4 h-4" />
                <span className="text-sm">Quote</span>
              </button>

              {showQuote && (
                <button
                  onClick={getNextQuote}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white/80 rounded-full hover:bg-white/20 transition-colors border border-white/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">New Quote</span>
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
                  setShowSunClock(false);
                }}
                className="px-4 py-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                Reset
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
