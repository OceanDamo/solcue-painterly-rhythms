
import React, { useState, useEffect } from 'react';
import { Images, X, Share2, Trash2 } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';

interface SavedPhoto {
  id: string;
  imageUrl: string;
  timestamp: Date;
  sessionData?: {
    duration: number;
    phase: string;
    timeOfDay: string;
  };
  quote?: {
    text: string;
    author: string;
  };
}

interface PhotoGalleryProps {
  currentTheme: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ currentTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [savedPhotos, setSavedPhotos] = useState<SavedPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<SavedPhoto | null>(null);

  // Load saved photos from storage
  useEffect(() => {
    loadSavedPhotos();
  }, []);

  const loadSavedPhotos = async () => {
    try {
      const { value } = await Preferences.get({ key: 'saved_photos' });
      if (value) {
        const photos = JSON.parse(value) as SavedPhoto[];
        // Convert timestamp strings back to Date objects
        const photosWithDates = photos.map(photo => ({
          ...photo,
          timestamp: new Date(photo.timestamp)
        }));
        setSavedPhotos(photosWithDates.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      }
    } catch (error) {
      console.error('Error loading saved photos:', error);
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      const updatedPhotos = savedPhotos.filter(photo => photo.id !== photoId);
      setSavedPhotos(updatedPhotos);
      await Preferences.set({
        key: 'saved_photos',
        value: JSON.stringify(updatedPhotos)
      });
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const sharePhoto = async (photo: SavedPhoto) => {
    if (navigator.share) {
      try {
        const response = await fetch(photo.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `solcue-${photo.id}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'My SolCue Light Journey',
          text: 'Living in sync with nature\'s circadian rhythms 🌅',
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing photo:', error);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPhotosGroupedByDay = () => {
    const groups: { [key: string]: SavedPhoto[] } = {};
    
    savedPhotos.forEach(photo => {
      const dayKey = photo.timestamp.toDateString();
      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(photo);
    });

    return Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white/90 hover:bg-white/20 transition-all duration-300 text-xs"
        title="Photo Gallery"
      >
        <Images className="w-3 h-3" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/80 rounded-2xl border border-white/20 p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">My Light Journey</h2>
            <p className="text-white/70 text-sm">{savedPhotos.length} moments captured</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {savedPhotos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center py-12">
            <div>
              <Images className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-white/80 text-lg mb-2">No photos yet</h3>
              <p className="text-white/60 text-sm">
                Start capturing your light sessions to build your circadian story
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {selectedPhoto ? (
              /* Photo Detail View */
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-white/70 hover:text-white text-sm mb-4"
                >
                  ← Back to gallery
                </button>
                
                <div className="aspect-square max-w-md mx-auto rounded-xl overflow-hidden relative">
                  <img 
                    src={selectedPhoto.imageUrl} 
                    alt="Selected photo" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Metadata overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-white text-sm mb-1">
                        {formatDate(selectedPhoto.timestamp)}
                      </div>
                      {selectedPhoto.sessionData && (
                        <div className="text-white/80 text-xs">
                          {selectedPhoto.sessionData.phase} • {selectedPhoto.sessionData.timeOfDay}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => sharePhoto(selectedPhoto)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={() => deletePhoto(selectedPhoto.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              /* Gallery Grid View */
              <div className="space-y-6">
                {getPhotosGroupedByDay().map(([dayString, dayPhotos]) => (
                  <div key={dayString}>
                    <h3 className="text-white/80 text-sm font-medium mb-3">
                      {new Date(dayString).toLocaleDateString([], {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {dayPhotos.map((photo) => (
                        <button
                          key={photo.id}
                          onClick={() => setSelectedPhoto(photo)}
                          className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform group relative"
                        >
                          <img 
                            src={photo.imageUrl} 
                            alt={`Photo from ${formatDate(photo.timestamp)}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Time overlay */}
                          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                            <span className="text-white text-xs">
                              {photo.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;
