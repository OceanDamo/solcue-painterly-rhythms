// src/lib/sunMath.ts
//
// Single source of truth for solar calculations across the app.
//
// Real astronomical calculation for any date and location, ported from the
// NOAA Solar Calculator algorithm used in the Watch app
// (ios/App/SolCue Watch Watch App/ContentView.swift).
// Source: https://gml.noaa.gov/grad/solcalc/calcdetails.html
//
// Both the visual sun clock (UnifiedSunClock) and the streak / session
// tracking logic (useSessionTracking) consume these functions so that the
// "prime circadian windows" they reason about are always identical.

// Default location (Providence, RI) used whenever GPS is unavailable.
export const PROVIDENCE_FALLBACK = {
  latitude: 41.8236,
  longitude: -71.4222,
};

// A session must be at least this many minutes (and fall in a prime window)
// to count toward the day streak.
export const STREAK_MIN_MINUTES = 10;

export interface SunTimes {
  sunrise: number;
  sunset: number;
  astronomicalNightEnd: number;
  nauticalTwilightEnd: number;
  civilTwilightEnd: number;
  civilTwilightStart: number;
  nauticalTwilightStart: number;
  astronomicalNightStart: number;
  solarNoon: number;
  // Prime circadian windows - first 2 hours after sunrise and last 2 hours
  // before sunset, expressed in local clock hours.
  morningPrimeStart: number;
  morningPrimeEnd: number;
  eveningPrimeStart: number;
  eveningPrimeEnd: number;
}

// All values are returned in local clock hours (e.g. 5.5 = 5:30 AM).
export const calculateSunTimes = (
  lat: number,
  lon: number,
  date: Date
): SunTimes => {
  const toRad = (d: number) => (d * Math.PI) / 180.0;
  const toDeg = (r: number) => (r * 180.0) / Math.PI;

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JS months are 0-based
  const day = date.getDate();

  // Julian Day (integer arithmetic, matching the NOAA reference)
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  const jd = jdn + 0.5;

  // Julian Century
  const jc = (jd - 2451545.0) / 36525.0;

  // Geometric Mean Longitude of the Sun (degrees)
  const geomMeanLongSun =
    (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360.0;

  // Geometric Mean Anomaly of the Sun (degrees)
  const geomMeanAnomSun = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);

  // Eccentricity of Earth's orbit
  const eccentOrbit = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);

  // Sun's Equation of the Center
  const sunEqOfCtr =
    Math.sin(toRad(geomMeanAnomSun)) *
      (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
    Math.sin(toRad(2 * geomMeanAnomSun)) * (0.019993 - 0.000101 * jc) +
    Math.sin(toRad(3 * geomMeanAnomSun)) * 0.000289;

  // Sun's True Longitude (degrees)
  const sunTrueLong = geomMeanLongSun + sunEqOfCtr;

  // Sun's Apparent Longitude (degrees)
  const sunAppLong =
    sunTrueLong - 0.00569 - 0.00478 * Math.sin(toRad(125.04 - 1934.136 * jc));

  // Mean Obliquity of the Ecliptic (degrees)
  const meanObliqEcliptic =
    23.0 +
    (26.0 +
      (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60.0) /
      60.0;

  // Obliquity correction (degrees)
  const obliqCorr =
    meanObliqEcliptic + 0.00256 * Math.cos(toRad(125.04 - 1934.136 * jc));

  // Sun's Declination (degrees)
  const sunDeclin = toDeg(
    Math.asin(Math.sin(toRad(obliqCorr)) * Math.sin(toRad(sunAppLong)))
  );

  const varY =
    Math.tan(toRad(obliqCorr / 2.0)) * Math.tan(toRad(obliqCorr / 2.0));

  // Equation of Time (minutes)
  const eqTime =
    4.0 *
    toDeg(
      varY * Math.sin(2.0 * toRad(geomMeanLongSun)) -
        2.0 * eccentOrbit * Math.sin(toRad(geomMeanAnomSun)) +
        4.0 *
          eccentOrbit *
          varY *
          Math.sin(toRad(geomMeanAnomSun)) *
          Math.cos(2.0 * toRad(geomMeanLongSun)) -
        0.5 * varY * varY * Math.sin(4.0 * toRad(geomMeanLongSun)) -
        1.25 *
          eccentOrbit *
          eccentOrbit *
          Math.sin(2.0 * toRad(geomMeanAnomSun))
    );

  // Hour Angle of Sunrise (degrees), using the 90.833° zenith for refraction
  const haSunrise = toDeg(
    Math.acos(
      Math.cos(toRad(90.833)) /
        (Math.cos(toRad(lat)) * Math.cos(toRad(sunDeclin))) -
        Math.tan(toRad(lat)) * Math.tan(toRad(sunDeclin))
    )
  );

  // Local timezone offset in hours (east of GMT positive)
  const timeZoneOffset = -date.getTimezoneOffset() / 60.0;

  // Solar noon and sunrise/sunset, expressed in local clock hours
  const solarNoon = (720.0 - 4.0 * lon - eqTime + timeZoneOffset * 60.0) / 60.0;
  const sunrise = solarNoon - (haSunrise * 4.0) / 60.0;
  const sunset = solarNoon + (haSunrise * 4.0) / 60.0;

  // Twilight calculations (in hours before/after sunrise/sunset)
  const astronomicalTwilight = 1.5;
  const nauticalTwilight = 0.9;
  const civilTwilight = 0.4;

  return {
    sunrise,
    sunset,
    astronomicalNightEnd: sunrise - astronomicalTwilight,
    nauticalTwilightEnd: sunrise - nauticalTwilight,
    civilTwilightEnd: sunrise - civilTwilight,
    civilTwilightStart: sunset + civilTwilight,
    nauticalTwilightStart: sunset + nauticalTwilight,
    astronomicalNightStart: sunset + astronomicalTwilight,
    solarNoon,

    // Prime circadian windows - 2 hours after sunrise and 2 hours before sunset
    morningPrimeStart: sunrise,
    morningPrimeEnd: sunrise + 2,
    eveningPrimeStart: sunset - 2,
    eveningPrimeEnd: sunset,
  };
};

export interface PrimeStatus {
  inMorningPrime: boolean;
  inEveningPrime: boolean;
}

// Returns whether the given moment falls inside the morning or evening prime
// circadian window for the supplied location. The hour-of-day is taken from
// `date` in local time, and the prime windows are derived from the same NOAA
// sun times the clock displays.
export const getPrimeStatus = (
  date: Date,
  lat: number,
  lon: number
): PrimeStatus => {
  const sunTimes = calculateSunTimes(lat, lon, date);
  const hour = date.getHours() + date.getMinutes() / 60;

  return {
    inMorningPrime:
      hour >= sunTimes.morningPrimeStart && hour <= sunTimes.morningPrimeEnd,
    inEveningPrime:
      hour >= sunTimes.eveningPrimeStart && hour <= sunTimes.eveningPrimeEnd,
  };
};
