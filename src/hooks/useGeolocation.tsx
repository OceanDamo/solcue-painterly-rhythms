
import { useState, useEffect } from 'react';

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  location: GeolocationData | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    const success = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
      setLoading(false);
    };

    const error = (err: GeolocationPositionError) => {
      setError(err.message);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 600000, // 10 minutes
    });
  }, []);

  return { location, error, loading };
};
