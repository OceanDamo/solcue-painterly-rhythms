// src/lib/sunMath.ts
//
// Single source of truth for solar calculations across the app.
//
// Real astronomical calculation for any date and location, ported from the
// NOAA Solar Calculator algorithm used in the Watch app
// (ios/App/SolCue Watch Watch App/ContentView.swift). The Watch keeps a
// line-for-line Swift copy of this file - if you change a rule here, change
// it there too.
// Source: https://gml.noaa.gov/grad/solcalc/calcdetails.html
//
// Both the visual sun clock (UnifiedSunClock) and the streak / session
// tracking logic (useSessionTracking) consume these functions so that the
// "prime circadian windows" they reason about are always identical.

// A session must be at least this many minutes (and fall in a prime window)
// to count toward the day streak.
export const STREAK_MIN_MINUTES = 10;

// Sun zenith angles (degrees from straight up) for each kind of dawn/dusk.
// 90.833 is sunrise/sunset (sun's centre 50 arc-minutes below the horizon,
// which accounts for atmospheric refraction and the sun's radius).
const ZENITH_SUNRISE = 90.833;
const ZENITH_CIVIL = 96; // sun 6 degrees below the horizon
const ZENITH_NAUTICAL = 102; // sun 12 degrees below the horizon
const ZENITH_ASTRONOMICAL = 108; // sun 18 degrees below the horizon

// How long (in hours) the sun's colour takes to fade between red-orange and
// golden around sunrise and sunset. Same length on both ends of the day.
export const SUN_COLOR_BLEND_HOURS = 0.75;

// "none"  - the sun rises and sets normally today.
// "day"   - polar day: the sun never sets today (midnight sun).
// "night" - polar night: the sun never rises today.
export type PolarState = "none" | "day" | "night";

export interface SunTimes {
  sunrise: number;
  sunset: number;
  astronomicalNightEnd: number; // sun reaches 18 degrees below (dawn side)
  nauticalTwilightEnd: number; // 12 degrees below (dawn side)
  civilTwilightEnd: number; // 6 degrees below (dawn side) = civil dawn, "first light"
  civilTwilightStart: number; // 6 degrees below (dusk side) = civil dusk, "last light"
  nauticalTwilightStart: number; // 12 degrees below (dusk side)
  astronomicalNightStart: number; // 18 degrees below (dusk side)
  solarNoon: number;
  // Prime circadian windows: first light -> 2 hours after sunrise, and
  // 2 hours before sunset -> last light. Local clock hours.
  morningPrimeStart: number;
  morningPrimeEnd: number;
  eveningPrimeStart: number;
  eveningPrimeEnd: number;
  // Polar-day / polar-night flag. When not "none" there are no prime windows.
  polar: PolarState;
}

const clampHour = (h: number) => Math.min(24, Math.max(0, h));

// All values are returned in local clock hours (e.g. 5.5 = 5:30 AM).
//
// Polar / high-latitude handling (never returns NaN):
//  - If the sun never rises today -> polar = "night" (ring drawn as all night).
//  - If the sun never sets today  -> polar = "day"   (ring drawn as all day).
//  - If the sun never gets deep enough for a given twilight (e.g. no true
//    darkness on a summer night at 60 degrees north), that twilight boundary
//    collapses onto the next-lighter one (astronomical -> nautical -> civil
//    -> sunrise/sunset), so the bands simply vanish instead of misbehaving.
//  - Times that would spill past midnight are clamped to the 0-24 range.
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

  // Hour angle (degrees) at which the sun's centre sits at the given zenith
  // angle. Returns null when that angle is never reached today (cos out of
  // range) or the maths is not a number.
  const hourAngleFor = (zenith: number): number | null => {
    const cosH =
      Math.cos(toRad(zenith)) /
        (Math.cos(toRad(lat)) * Math.cos(toRad(sunDeclin))) -
      Math.tan(toRad(lat)) * Math.tan(toRad(sunDeclin));
    if (!Number.isFinite(cosH) || cosH > 1 || cosH < -1) return null;
    return toDeg(Math.acos(cosH));
  };

  // Local timezone offset in hours (east of GMT positive)
  const timeZoneOffset = -date.getTimezoneOffset() / 60.0;

  // Solar noon in local clock hours
  const solarNoon = (720.0 - 4.0 * lon - eqTime + timeZoneOffset * 60.0) / 60.0;

  const hourAt = (ha: number, sign: 1 | -1) =>
    clampHour(solarNoon + (sign * ha * 4.0) / 60.0);

  const sunHa = hourAngleFor(ZENITH_SUNRISE);

  if (sunHa === null) {
    // Sun never crosses the horizon today. Decide which way from the sun's
    // height at solar noon: above the horizon all day = polar day.
    const noonZenith = Math.abs(lat - sunDeclin);
    const polar: PolarState =
      Number.isFinite(noonZenith) && noonZenith < ZENITH_SUNRISE
        ? "day"
        : "night";
    // "day": sunrise at 0, sunset at 24 (always up). "night": both at 24,
    // so every hour reads as "before sunrise" (always down).
    const rise = polar === "day" ? 0 : 24;
    const set = 24;
    return {
      sunrise: rise,
      sunset: set,
      astronomicalNightEnd: rise,
      nauticalTwilightEnd: rise,
      civilTwilightEnd: rise,
      civilTwilightStart: set,
      nauticalTwilightStart: set,
      astronomicalNightStart: set,
      solarNoon,
      morningPrimeStart: rise,
      morningPrimeEnd: rise,
      eveningPrimeStart: set,
      eveningPrimeEnd: set,
      polar,
    };
  }

  // Each twilight falls back to the next-lighter one when it never occurs.
  const civilHa = hourAngleFor(ZENITH_CIVIL) ?? sunHa;
  const nauticalHa = hourAngleFor(ZENITH_NAUTICAL) ?? civilHa;
  const astronomicalHa = hourAngleFor(ZENITH_ASTRONOMICAL) ?? nauticalHa;

  const sunrise = hourAt(sunHa, -1);
  const sunset = hourAt(sunHa, 1);
  const civilDawn = hourAt(civilHa, -1);
  const civilDusk = hourAt(civilHa, 1);

  return {
    sunrise,
    sunset,
    astronomicalNightEnd: hourAt(astronomicalHa, -1),
    nauticalTwilightEnd: hourAt(nauticalHa, -1),
    civilTwilightEnd: civilDawn,
    civilTwilightStart: civilDusk,
    nauticalTwilightStart: hourAt(nauticalHa, 1),
    astronomicalNightStart: hourAt(astronomicalHa, 1),
    solarNoon,

    // Prime circadian windows:
    //   morning = civil dawn ("first light") -> sunrise + 2 hours
    //   evening = sunset - 2 hours -> civil dusk ("last light")
    morningPrimeStart: civilDawn,
    morningPrimeEnd: clampHour(sunrise + 2),
    eveningPrimeStart: clampHour(sunset - 2),
    eveningPrimeEnd: civilDusk,
    polar: "none",
  };
};

// Whether a local clock hour (e.g. 6.5 = 6:30 AM) is inside a prime window.
// Polar day / polar night have no prime windows.
export const isInMorningPrime = (sunTimes: SunTimes, hour: number): boolean =>
  sunTimes.polar === "none" &&
  hour >= sunTimes.morningPrimeStart &&
  hour <= sunTimes.morningPrimeEnd;

export const isInEveningPrime = (sunTimes: SunTimes, hour: number): boolean =>
  sunTimes.polar === "none" &&
  hour >= sunTimes.eveningPrimeStart &&
  hour <= sunTimes.eveningPrimeEnd;

// How "night-coloured" the sun should be at a given local clock hour:
//   1 = full red-orange (sunset until sunrise, including first light)
//   0 = full gold (daytime)
// It fades from 1 to 0 over the SUN_COLOR_BLEND_HOURS after sunrise, and
// from 0 to 1 over the same length of time leading up to sunset.
export const getNightBlend = (sunTimes: SunTimes, hour: number): number => {
  if (sunTimes.polar === "day") return 0;
  if (sunTimes.polar === "night") return 1;

  const blend = SUN_COLOR_BLEND_HOURS;
  const { sunrise, sunset } = sunTimes;

  if (hour < sunrise || hour > sunset) return 1;
  if (hour < sunrise + blend) return 1 - (hour - sunrise) / blend;
  if (hour > sunset - blend) return (hour - (sunset - blend)) / blend;
  return 0;
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
    inMorningPrime: isInMorningPrime(sunTimes, hour),
    inEveningPrime: isInEveningPrime(sunTimes, hour),
  };
};
