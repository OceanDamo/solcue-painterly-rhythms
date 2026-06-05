import React, { useState, useRef } from "react";
import { Camera, Share2, X, Quote, RefreshCw, Palette } from "lucide-react";
import {
  Camera as CapacitorCamera,
  CameraResultType,
  CameraSource,
} from "@capacitor/camera";
import { useSessionTracking } from "../hooks/useSessionTracking";
import { getRandomQuote } from "../data/quotes";
// Import the real logo assets
import SolCueNameLogoVertical from "../assets/logos/SolCue name logo vertical.png";
import SolCueLightIsMedicine from "../assets/logos/SolCue Light is medicine Get daily dose.png";
// Import the sun clock capture function
import { captureSunClockImage } from "./UnifiedSunClock";

interface PhotoShareProps {
  currentTheme: string;
  sunTimes: any;
  currentHour: number;
  isTracking: boolean;
  timeElapsed: number;
  onClose: () => void;
  sunClockImageData?: string;
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
    background: "from-gray-900 via-slate-800 to-black",
  },
};

// FIXED: Text color options - only white and black
const textColorOptions = [
  { name: "White", value: "#ffffff", preview: "bg-white" },
  { name: "Black", value: "#000000", preview: "bg-black" },
];

const PhotoShare: React.FC<PhotoShareProps> = ({
  currentTheme,
  sunTimes,
  currentHour,
  isTracking,
  timeElapsed,
  onClose,
  sunClockImageData,
}) => {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showQuote, setShowQuote] = useState(true);
  const [currentQuote, setCurrentQuote] = useState(getRandomQuote());
  const [textColor, setTextColor] = useState("#ffffff");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [location, setLocation] = useState<{
    city: string;
    state: string;
    lat: number;
    lng: number;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const theme = colorThemes[currentTheme as keyof typeof colorThemes];

  React.useEffect(() => {
    getCurrentLocation();
    console.log("PhotoShare component mounted, getting location...");
  }, []);

  // Helper function to add cardinal directions
  const formatCoordinates = (lat: number, lng: number) => {
    const latDirection = lat >= 0 ? "N" : "S";
    const lngDirection = lng >= 0 ? "E" : "W";
    const latValue = Math.abs(Math.round(lat * 100) / 100);
    const lngValue = Math.abs(Math.round(lng * 100) / 100);
    return `${latValue}°${latDirection}, ${lngValue}°${lngDirection}`;
  };

  // Helper function to format current time
  const getCurrentTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to check if image is from camera (vs sun clock)
  const isCameraPhoto = (imageData: string) => {
    return imageData && imageData.startsWith("data:image/jpeg;base64,/9j/");
  };

  // FIXED: Helper function to check if location text is too long for one line
  const isLocationTextTooLong = (location: any) => {
    if (!location) return false;
    const locationText = `${location.city}, ${
      location.state
    } • ${formatCoordinates(
      location.lat,
      location.lng
    )} • ${getCurrentTimeString()}`;
    return locationText.length > 45; // Adjust threshold as needed
  };

  // FIXED: Helper function to split location into two lines if needed
  const getLocationLines = (location: any) => {
    if (!location) return { line1: "", line2: "", twoLines: false };

    const cityState = `${location.city}, ${location.state}`;
    const coordinates = formatCoordinates(location.lat, location.lng);
    const time = getCurrentTimeString();
    const coordsAndTime = `${coordinates} • ${time}`;

    if (isLocationTextTooLong(location)) {
      return {
        line1: cityState,
        line2: coordsAndTime,
        twoLines: true,
      };
    } else {
      return {
        line1: `${cityState} • ${coordsAndTime}`,
        line2: "",
        twoLines: false,
      };
    }
  };

  // FIXED: Real GPS location with reverse geocoding
  const getCurrentLocation = async () => {
    try {
      console.log("Starting geolocation process...");

      const { Geolocation } = await import("@capacitor/geolocation");

      const permission = await Geolocation.requestPermissions();
      console.log("Geolocation permission result:", permission);

      if (permission.location === "granted") {
        console.log("Permission granted, getting position...");

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        const { latitude, longitude } = position.coords;
        console.log("Got real location:", latitude, longitude);

        // Reverse geocode to get city/state/country
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();

          console.log("Geocoding result:", data);

          // Extract city and region/country
          const city = data.city || data.locality || "Current";
          const region =
            data.principalSubdivision || data.countryName || "Location";

          setLocation({
            city,
            state: region,
            lat: latitude,
            lng: longitude,
          });

          console.log(`Location set to: ${city}, ${region}`);
        } catch (geocodeError) {
          console.log("Geocoding failed, using coordinates:", geocodeError);
          setLocation({
            city: "Current",
            state: "Location",
            lat: latitude,
            lng: longitude,
          });
        }
      } else {
        console.log("Location permission denied, using fallback");
        setLocation({
          city: "Providence",
          state: "RI",
          lat: 41.82,
          lng: -71.41,
        });
      }
    } catch (error) {
      console.error("Location setup error:", error);
      setLocation({
        city: "Providence",
        state: "RI",
        lat: 41.82,
        lng: -71.41,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCurrentPhase = () => {
    if (!sunTimes || !sunTimes.sunrise || !sunTimes.sunset) {
      if (currentHour >= 6 && currentHour <= 8) return "Sunrise";
      if (currentHour >= 18 && currentHour <= 20) return "Sunset";
      if (currentHour >= 6 && currentHour <= 18) return "Daylight";
      return "Night";
    }

    const currentMinutes = currentHour * 60;

    const sunriseDate =
      typeof sunTimes.sunrise === "string"
        ? new Date(sunTimes.sunrise)
        : sunTimes.sunrise;
    const sunsetDate =
      typeof sunTimes.sunset === "string"
        ? new Date(sunTimes.sunset)
        : sunTimes.sunset;

    const sunriseMinutes =
      sunriseDate.getHours() * 60 + sunriseDate.getMinutes();
    const sunsetMinutes = sunsetDate.getHours() * 60 + sunsetDate.getMinutes();

    const morningStart = sunriseMinutes - 15;
    const morningEnd = sunriseMinutes + 135;
    const eveningStart = sunsetMinutes - 120;
    const eveningEnd = sunsetMinutes + 15;

    if (currentMinutes >= morningStart && currentMinutes <= morningEnd) {
      return "Sunrise";
    } else if (currentMinutes >= eveningStart && currentMinutes <= eveningEnd) {
      return "Sunset";
    } else if (
      currentMinutes >= sunriseMinutes &&
      currentMinutes <= sunsetMinutes
    ) {
      return "Daylight";
    } else {
      return "Night";
    }
  };

  const takePhoto = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 95,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        setActiveImage(image.dataUrl);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  const captureSunClock = async () => {
    try {
      console.log("Attempting to capture real sun clock...");

      const realSunClockImage = await captureSunClockImage();
      console.log("Successfully captured real sun clock!");
      setActiveImage(realSunClockImage);
    } catch (error) {
      console.log(
        "Failed to capture real sun clock, using themed version:",
        error
      );

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Canvas context not available");
        return;
      }

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );

      const themeColors = colorThemes[currentTheme as keyof typeof colorThemes];
      gradient.addColorStop(0, themeColors.primary);
      gradient.addColorStop(0.5, themeColors.secondary);
      gradient.addColorStop(1, themeColors.accent);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 200, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, 2 * Math.PI);
      ctx.fill();

      const dataURL = canvas.toDataURL("image/jpeg", 0.95);
      setActiveImage(dataURL);
    }
  };

  const refreshQuote = () => {
    setCurrentQuote(getRandomQuote());
  };

  const generateShareableImage = (): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas || !activeImage) {
        resolve("");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("");
        return;
      }

      canvas.width = 1080;
      canvas.height = 1350;

      const img = new Image();
      img.onload = async () => {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw photo with correct aspect ratio
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;

        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspect > canvasAspect) {
          drawHeight = canvas.height;
          drawWidth = drawHeight * imgAspect;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = drawWidth / imgAspect;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Subtle overlay
        const overlayGradient = ctx.createLinearGradient(
          0,
          0,
          0,
          canvas.height
        );
        overlayGradient.addColorStop(0, "rgba(0,0,0,0.1)");
        overlayGradient.addColorStop(1, "rgba(0,0,0,0.3)");
        ctx.fillStyle = overlayGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Quote - CONDITIONAL BACKGROUND BASED ON IMAGE TYPE
        if (showQuote) {
          const quoteText = `"${currentQuote.text}"`;
          const maxQuoteWidth = canvas.width - 100;

          const quoteAreaStart = 60;
          const quoteAreaHeight = 200;
          const quoteX = 50;
          const quoteWidth = canvas.width - 100;

          // Only add grey background for camera photos, not sun clock
          if (isCameraPhoto(activeImage)) {
            ctx.fillStyle = "rgba(128,128,128,0.5)";
            ctx.fillRect(quoteX, quoteAreaStart, quoteWidth, quoteAreaHeight);
          }

          ctx.fillStyle = textColor;
          ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, serif";
          ctx.textAlign = "center";

          const words = quoteText.split(" ");
          const lines = [];
          let currentLine = "";

          for (const word of words) {
            const testLine = currentLine + word + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxQuoteWidth && currentLine !== "") {
              lines.push(currentLine.trim());
              currentLine = word + " ";
            } else {
              currentLine = testLine;
            }
          }
          lines.push(currentLine.trim());

          const quoteStartY = quoteAreaStart + 50;
          const lineHeight = 42;

          lines.forEach((line, index) => {
            ctx.fillText(
              line,
              canvas.width / 2,
              quoteStartY + index * lineHeight
            );
          });

          ctx.font = "26px -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.fillText(
            `— ${currentQuote.author}`,
            canvas.width / 2,
            quoteStartY + lines.length * lineHeight + 30
          );
        }

        // FIXED: Better bottom elements with improved spacing
        const bottomMargin = 80; // Increased from 50
        const elementSpacing = 35; // Increased from 25
        let currentY = canvas.height - bottomMargin;

        // 1. Location info with responsive layout (at very bottom)
        if (location) {
          const locationLines = getLocationLines(location);

          ctx.font = "28px -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.fillStyle = textColor;
          ctx.textAlign = "center";

          if (locationLines.twoLines) {
            // Two lines: city/state on first line, coords/time on second
            ctx.fillText(locationLines.line1, canvas.width / 2, currentY);
            currentY -= 35; // Space between lines
            ctx.fillText(locationLines.line2, canvas.width / 2, currentY);
            currentY -= elementSpacing;
          } else {
            // Single line
            ctx.fillText(locationLines.line1, canvas.width / 2, currentY);
            currentY -= elementSpacing;
          }
        }

        // 2. Logo (middle)
        const logoImg = new Image();
        logoImg.onload = () => {
          const logoWidth = 140;
          const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
          const logoX = (canvas.width - logoWidth) / 2;
          const logoY = currentY - logoHeight;

          ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

          currentY = logoY - elementSpacing; // Same spacing as location

          // 3. Tagline image (top of bottom section)
          const taglineImg = new Image();
          taglineImg.onload = () => {
            const taglineWidth = 550;
            const taglineHeight =
              (taglineImg.height / taglineImg.width) * taglineWidth;
            const taglineX = (canvas.width - taglineWidth) / 2;
            const taglineY = currentY - taglineHeight;

            ctx.globalCompositeOperation = "source-over";

            if (textColor === "#ffffff") {
              ctx.drawImage(
                taglineImg,
                taglineX,
                taglineY,
                taglineWidth,
                taglineHeight
              );
            } else if (textColor === "#000000") {
              ctx.filter = "invert(1)";
              ctx.drawImage(
                taglineImg,
                taglineX,
                taglineY,
                taglineWidth,
                taglineHeight
              );
              ctx.filter = "none";
            } else {
              ctx.drawImage(
                taglineImg,
                taglineX,
                taglineY,
                taglineWidth,
                taglineHeight
              );
              ctx.globalCompositeOperation = "source-in";
              ctx.fillStyle = textColor;
              ctx.fillRect(taglineX, taglineY, taglineWidth, taglineHeight);
              ctx.globalCompositeOperation = "source-over";
            }

            // Session info (if tracking) - positioned above tagline
            if (isTracking) {
              const sessionY = taglineY - 80; // More space above tagline

              ctx.font = "28px -apple-system, BlinkMacSystemFont, sans-serif";
              ctx.fillStyle = textColor;
              ctx.textAlign = "center";

              const sessionText = `${formatTime(
                timeElapsed
              )} in ${getCurrentPhase()}`;
              const textWidth = ctx.measureText(sessionText).width;
              const backWidth = textWidth + 60;
              const backX = (canvas.width - backWidth) / 2;

              ctx.fillStyle = "rgba(128,128,128,0.5)";
              ctx.fillRect(backX, sessionY - 35, backWidth, 45);

              ctx.fillStyle = textColor;
              ctx.fillText(sessionText, canvas.width / 2, sessionY);
            }

            const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
            resolve(dataUrl);
          };

          taglineImg.onerror = () => {
            const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
            resolve(dataUrl);
          };

          taglineImg.src = SolCueLightIsMedicine;
        };

        logoImg.onerror = () => {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
          resolve(dataUrl);
        };

        logoImg.src = SolCueNameLogoVertical;
      };

      img.src = activeImage;
    });
  };

  const handleShare = async () => {
    try {
      console.log("Starting share process...");

      const imageDataUrl = await generateShareableImage();
      if (!imageDataUrl) {
        console.error("Failed to generate image");
        return;
      }

      console.log("Image generated, preparing for share...");

      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const { Share } = await import("@capacitor/share");

      const base64Data = imageDataUrl.split(",")[1];
      const fileName = `solcue-share-${Date.now()}.jpg`;

      console.log("Writing file to filesystem...");

      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
      });

      const fileUri = await Filesystem.getUri({
        directory: Directory.Documents,
        path: fileName,
      });

      console.log("File written, sharing...", fileUri.uri);

      await Share.share({
        url: fileUri.uri,
      });

      console.log("Share completed");

      setTimeout(async () => {
        try {
          await Filesystem.deleteFile({
            path: fileName,
            directory: Directory.Documents,
          });
          console.log("Temporary file cleaned up");
        } catch (error) {
          console.log("Cleanup failed (not critical):", error);
        }
      }, 5000);
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-16 bg-black/50">
        <h2 className="text-white text-lg font-semibold">Share Your Light</h2>
        <button
          onClick={onClose}
          className="text-white bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {!activeImage ? (
          /* Image Selection */
          <div className="text-center flex flex-col items-center">
            <div className="w-48 h-60 bg-gray-800 rounded-lg mb-6 flex items-center justify-center mx-auto">
              <Camera className="w-16 h-16 text-gray-400" />
            </div>

            <button
              onClick={takePhoto}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-medium mb-4 w-full max-w-xs"
            >
              Take Photo
            </button>

            <p className="text-gray-500 text-xs mb-2">or</p>

            <button
              onClick={captureSunClock}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium w-full max-w-xs"
            >
              Use Sunclock Image
            </button>

            <p className="text-gray-400 text-xs mt-2 max-w-xs text-center">
              Capture this moment's light energy
            </p>
          </div>
        ) : (
          /* Photo Preview - COMPLETELY FIXED */
          <div className="w-full max-w-sm">
            <div className="relative aspect-[4/5] mb-6 rounded-lg overflow-hidden">
              <img
                src={activeImage}
                alt="Selected image"
                className="w-full h-full object-cover"
              />

              {/* Quote Overlay - safe padding from sun clock with conditional background */}
              {showQuote && (
                <div className="absolute top-8 left-4 right-4 z-10">
                  <div
                    className={`rounded-lg p-4 ${
                      isCameraPhoto(activeImage)
                        ? "bg-gray-500/50 backdrop-blur-sm border border-white/20"
                        : ""
                    }`}
                  >
                    <p
                      className="text-sm italic mb-2 text-center"
                      style={{
                        color: textColor,
                        textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                      }}
                    >
                      "{currentQuote.text}"
                    </p>
                    <p
                      className="text-xs opacity-80 text-center"
                      style={{
                        color: textColor,
                        textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                      }}
                    >
                      — {currentQuote.author}
                    </p>
                  </div>
                </div>
              )}

              {/* FIXED Bottom elements with proper spacing and responsive location */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent">
                <div className="p-4 flex flex-col items-center space-y-4">
                  {/* Tagline - FIRST (top of bottom section) */}
                  <div className="order-1">
                    <img
                      src={SolCueLightIsMedicine}
                      alt="Light is Medicine - Get Daily Dose"
                      className="w-56 h-auto opacity-95 mx-auto block"
                      style={{
                        filter:
                          textColor !== "#ffffff"
                            ? `brightness(0) saturate(100%) invert(${
                                textColor === "#000000" ? "0" : "1"
                              }) drop-shadow(2px 2px 4px rgba(0,0,0,0.8))`
                            : "drop-shadow(2px 2px 4px rgba(0,0,0,0.8))",
                      }}
                    />
                  </div>

                  {/* Logo - SECOND (middle) */}
                  <div className="order-2">
                    <img
                      src={SolCueNameLogoVertical}
                      alt="SolCue Logo"
                      className="w-14 h-auto opacity-95 mx-auto block"
                      style={{
                        filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.8))",
                      }}
                    />
                  </div>

                  {/* FIXED Location - THIRD (bottom) with responsive layout */}
                  {location && (
                    <div className="order-3">
                      {(() => {
                        const locationLines = getLocationLines(location);
                        return (
                          <div className="text-xs opacity-90 text-center px-2 space-y-1">
                            <div
                              style={{
                                color: textColor,
                                textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                              }}
                            >
                              {locationLines.line1}
                            </div>
                            {locationLines.twoLines && (
                              <div
                                style={{
                                  color: textColor,
                                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                                }}
                              >
                                {locationLines.line2}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Session Info - positioned in center if tracking */}
              {isTracking && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                  <p className="text-white text-sm font-medium">
                    {formatTime(timeElapsed)} in {getCurrentPhase()}
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowQuote(!showQuote)}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm ${
                  showQuote
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-transparent text-white border-gray-600"
                }`}
              >
                <Quote className="w-4 h-4 inline mr-1" />
                Quote
              </button>
              <button
                onClick={refreshQuote}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm"
              >
                Next
              </button>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>

            {/* FIXED Color Picker - only white and black */}
            {showColorPicker && (
              <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                <p className="text-white text-xs mb-2">Text Color:</p>
                <div className="flex gap-2 justify-center">
                  {textColorOptions.map((option) => (
                    <button
                      key={option.name}
                      onClick={() => {
                        setTextColor(option.value);
                        setShowColorPicker(false);
                      }}
                      className={`w-8 h-8 rounded-full border-2 ${
                        option.preview
                      } ${
                        textColor === option.value
                          ? "border-white"
                          : "border-gray-600"
                      }`}
                      title={option.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full bg-green-500 text-white py-3 rounded-lg text-lg font-medium flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Your Light
            </button>

            {/* Retake Button */}
            <button
              onClick={() => setActiveImage(null)}
              className="w-full mt-3 bg-gray-600 text-white py-2 rounded-lg"
            >
              Choose Different Image
            </button>
          </div>
        )}
      </div>

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default PhotoShare;
