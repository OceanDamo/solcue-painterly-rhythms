
export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  morningPrimeStart: Date;
  morningPrimeEnd: Date;
  eveningPrimeStart: Date;
  eveningPrimeEnd: Date;
}

export const calculateSunTimes = (latitude: number, longitude: number, date: Date = new Date()): SunTimes => {
  // Simplified sun calculation for demo purposes
  // In production, consider using a library like suncalc
  
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Basic approximation for mid-latitude locations
  let sunriseHour = 6;
  let sunsetHour = 18;
  
  // Adjust for latitude (very simplified)
  if (latitude > 40) {
    sunriseHour -= 0.5;
    sunsetHour += 0.5;
  } else if (latitude < 30) {
    sunriseHour += 0.5;
    sunsetHour -= 0.5;
  }
  
  // Create date objects
  const sunrise = new Date(date);
  sunrise.setHours(Math.floor(sunriseHour), (sunriseHour % 1) * 60, 0, 0);
  
  const sunset = new Date(date);
  sunset.setHours(Math.floor(sunsetHour), (sunsetHour % 1) * 60, 0, 0);
  
  // Prime windows: 15 min before sunrise + 2h 15min after sunrise
  const morningPrimeStart = new Date(sunrise.getTime() - 15 * 60 * 1000);
  const morningPrimeEnd = new Date(sunrise.getTime() + 135 * 60 * 1000);
  
  // Evening: 2h before sunset + 15 min after sunset
  const eveningPrimeStart = new Date(sunset.getTime() - 120 * 60 * 1000);
  const eveningPrimeEnd = new Date(sunset.getTime() + 15 * 60 * 1000);
  
  return {
    sunrise,
    sunset,
    morningPrimeStart,
    morningPrimeEnd,
    eveningPrimeStart,
    eveningPrimeEnd,
  };
};
