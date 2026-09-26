// src/lib/locationStore.ts
//
// One shared place for "where is the user?" so the sun clock and the session
// tracker never disagree, and never invent a location.
//
// - Asks for location permission once (iOS only shows the prompt the first
//   time; if it was denied we never nag, we just explain).
// - Uses approximate accuracy: sun times don't change over a few kilometres.
// - Saves the last REAL location on the device. If a fresh fix isn't
//   available we fall back to that saved location, never to a made-up one.
// - If there has never been a real location, `location` stays null and the
//   UI shows a friendly message instead of wrong sun times.

import { Geolocation } from "@capacitor/geolocation";
import { Preferences } from "@capacitor/preferences";
import { AppLauncher } from "@capacitor/app-launcher";

export interface LocationData {
  latitude: number;
  longitude: number;
  // When this location was obtained (ms since epoch).
  timestamp: number;
}

export type LocationStatus =
  | "idle" // not started yet
  | "loading" // waiting on permission or a GPS fix
  | "ready" // we have a location (fresh or saved)
  | "denied" // permission denied and no saved location
  | "unavailable"; // permission ok but no fix and no saved location

export interface LocationSnapshot {
  location: LocationData | null;
  status: LocationStatus;
  hasPermission: boolean;
}

const STORAGE_KEY = "solcue_last_location";
// Sun times barely move over a few hours of travel; refresh at most this often.
const REFRESH_AFTER_MS = 3 * 60 * 60 * 1000;

let snapshot: LocationSnapshot = {
  location: null,
  status: "idle",
  hasPermission: false,
};
const listeners = new Set<() => void>();
let started = false;
let inFlight: Promise<void> | null = null;

const setSnapshot = (next: Partial<LocationSnapshot>) => {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l());
};

export const subscribeLocation = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getLocationSnapshot = () => snapshot;

const isValid = (lat: number, lon: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lon) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lon) <= 180;

const loadSaved = async (): Promise<LocationData | null> => {
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    if (!value) return null;
    const parsed = JSON.parse(value);
    if (isValid(parsed?.latitude, parsed?.longitude)) {
      return {
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        timestamp: Number(parsed.timestamp) || 0,
      };
    }
  } catch {
    // ignore: treat as no saved location
  }
  return null;
};

const save = async (location: LocationData) => {
  try {
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(location) });
  } catch {
    // Saving is best-effort.
  }
};

const doRefresh = async (force: boolean) => {
  const hasLocation = snapshot.location !== null;
  const isFresh =
    hasLocation &&
    snapshot.status === "ready" &&
    Date.now() - snapshot.location!.timestamp < REFRESH_AFTER_MS;
  if (isFresh && !force) return;

  if (!hasLocation) setSnapshot({ status: "loading" });

  // 1. Permission: ask once, only if we have never asked before.
  let granted = false;
  try {
    let perm = await Geolocation.checkPermissions();
    if (perm.location === "prompt" || perm.location === "prompt-with-rationale") {
      perm = await Geolocation.requestPermissions();
    }
    granted = perm.location === "granted";
  } catch {
    // Some environments (e.g. a plain browser) can't report permission state;
    // just try to get a position and see.
    granted = true;
  }
  setSnapshot({ hasPermission: granted });

  if (!granted) {
    setSnapshot({ status: snapshot.location ? "ready" : "denied" });
    return;
  }

  // 2. One approximate fix.
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 30 * 60 * 1000,
    });
    const { latitude, longitude } = position.coords;
    if (!isValid(latitude, longitude)) throw new Error("Invalid coordinates");
    const fresh: LocationData = { latitude, longitude, timestamp: Date.now() };
    setSnapshot({ location: fresh, status: "ready" });
    await save(fresh);
  } catch {
    // Keep whatever real location we already have (saved from before).
    setSnapshot({ status: snapshot.location ? "ready" : "unavailable" });
  }
};

// Get a fresh location (or the saved one). Safe to call from many places at
// once - concurrent calls share a single request.
export const refreshLocation = (force = false): Promise<void> => {
  if (!inFlight) {
    inFlight = doRefresh(force).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
};

// Call once at startup: loads the saved location, then refreshes.
export const startLocation = () => {
  if (started) return;
  started = true;

  (async () => {
    const saved = await loadSaved();
    if (saved && !snapshot.location) {
      setSnapshot({ location: saved, status: "ready" });
    }
    await refreshLocation();
  })();

  // When the app returns to the foreground (for example after the user turns
  // location on in Settings) try again if we still have nothing fresh.
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") return;
      const needsRetry =
        snapshot.status === "denied" || snapshot.status === "unavailable";
      refreshLocation(needsRetry);
    });
  }
};

// Opens this app's page in the iOS Settings app (where location can be
// switched on). Does nothing where that isn't possible (e.g. a browser).
export const openAppSettings = async () => {
  try {
    await AppLauncher.openUrl({ url: "app-settings:" });
  } catch {
    // Not available here.
  }
};
