import { useEffect, useSyncExternalStore } from "react";
import {
  getLocationSnapshot,
  openAppSettings,
  refreshLocation,
  startLocation,
  subscribeLocation,
} from "../lib/locationStore";
import type { LocationData } from "../lib/locationStore";

export type { LocationData };

// Shared, device-wide location state. `location` is always a REAL location
// (a fresh fix, or the last real one saved on the device) - or null if the app
// has never had one. It is never a made-up default.
export const useLocation = () => {
  const snapshot = useSyncExternalStore(subscribeLocation, getLocationSnapshot);

  useEffect(() => {
    startLocation();
  }, []);

  const getCurrentLocation = async () => {
    await refreshLocation(true);
    return getLocationSnapshot().location;
  };

  const requestPermission = async () => {
    await refreshLocation(true);
    return getLocationSnapshot().hasPermission;
  };

  const checkPermission = async () => getLocationSnapshot().hasPermission;

  return {
    location: snapshot.location,
    status: snapshot.status,
    loading: snapshot.status === "loading" || snapshot.status === "idle",
    error:
      snapshot.status === "denied"
        ? "Location permission denied"
        : snapshot.status === "unavailable"
        ? "Failed to get current location"
        : null,
    hasPermission: snapshot.hasPermission,
    requestPermission,
    getCurrentLocation,
    checkPermission,
    refresh: () => refreshLocation(true),
    openSettings: openAppSettings,
  };
};
