
import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface LocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
}

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
    hasPermission: false
  });

  const requestPermission = async () => {
    try {
      const permission = await Geolocation.requestPermissions();
      const hasPermission = permission.location === 'granted';
      setState(prev => ({ ...prev, hasPermission, error: hasPermission ? null : 'Location permission denied' }));
      return hasPermission;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to request location permission', hasPermission: false }));
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: position.timestamp
      };
      
      setState(prev => ({ 
        ...prev, 
        location: locationData, 
        loading: false,
        error: null 
      }));
      
      return locationData;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to get current location' 
      }));
      return null;
    }
  };

  const checkPermission = async () => {
    try {
      const permission = await Geolocation.checkPermissions();
      const hasPermission = permission.location === 'granted';
      setState(prev => ({ ...prev, hasPermission }));
      return hasPermission;
    } catch (error) {
      setState(prev => ({ ...prev, hasPermission: false }));
      return false;
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return {
    ...state,
    requestPermission,
    getCurrentLocation,
    checkPermission
  };
};
