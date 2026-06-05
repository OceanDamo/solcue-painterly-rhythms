//
//  ContentView.swift
//  SolCue Watch Watch App
//
//  Beautiful Circadian Clock for Apple Watch
//

import SwiftUI
import CoreLocation

// MARK: - Location Manager
class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    @Published var location: CLLocation?
    @Published var authorizationStatus: CLAuthorizationStatus?
    
    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyKilometer
        manager.requestWhenInUseAuthorization()
        manager.startUpdatingLocation()
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        location = locations.first
    }
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        authorizationStatus = status
    }
}

struct ContentView: View {
    @Environment(\.scenePhase) private var scenePhase  // For Always-On Display dimming
    @StateObject private var locationManager = LocationManager()
    @State private var currentTime = Date()
    @State private var isTracking = false
    @State private var currentThemeIndex = 0
    @State private var crownValue = 0.0  // For Digital Crown theme switching
    
    // Timer to update every second
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    // ORIGINAL 4 color themes from iPhone app (EXACT from project files)
    let themes: [ClockTheme] = [
        ClockTheme(name: "Natural",
                   deepNight: Color(hex: "0f172a"),       // Deep slate navy
                   astronomical: Color(hex: "312e81"),    // Indigo purple
                   nautical: Color(hex: "1e40af"),        // Royal blue
                   civil: Color(hex: "f59e0b"),           // Amber
                   daylight: Color(hex: "60a5fa"),        // Light blue
                   morningPrime: Color(hex: "fbbf24"),    // Golden yellow
                   eveningPrime: Color(hex: "f97316")),   // Orange
        ClockTheme(name: "Cosmic Purple",
                   deepNight: Color(hex: "1e1b4b"),       // Dark indigo
                   astronomical: Color(hex: "4c1d95"),    // Deep purple
                   nautical: Color(hex: "6b21a8"),        // Purple
                   civil: Color(hex: "a855f7"),           // Light purple
                   daylight: Color(hex: "93c5fd"),        // Light blue
                   morningPrime: Color(hex: "c084fc"),    // Lavender
                   eveningPrime: Color(hex: "d946ef")),   // Bright magenta
        ClockTheme(name: "Ocean Blue",
                   deepNight: Color(hex: "0c4a6e"),       // Deep ocean
                   astronomical: Color(hex: "075985"),    // Dark cyan
                   nautical: Color(hex: "0284c7"),        // Cyan
                   civil: Color(hex: "06b6d4"),           // Bright cyan
                   daylight: Color(hex: "7dd3fc"),        // Sky blue
                   morningPrime: Color(hex: "38bdf8"),    // Light cyan
                   eveningPrime: Color(hex: "22d3ee")),   // Bright cyan
        ClockTheme(name: "Midnight",
                   deepNight: Color(hex: "0f172a"),       // Near black (not pure black!)
                   astronomical: Color(hex: "334155"),    // Dark gray
                   nautical: Color(hex: "475569"),        // Medium gray
                   civil: Color(hex: "64748b"),           // Gray
                   daylight: Color(hex: "cbd5e1"),        // Very light gray
                   morningPrime: Color(hex: "9ca3af"),    // Light gray
                   eveningPrime: Color(hex: "94a3b8"))    // Light gray
    ]
    
    var body: some View {
        ZStack {
            // Background
            Color.black.edgesIgnoringSafeArea(.all)
            
            VStack(spacing: 0) {
                // Main circular clock with time labels overlay
                ZStack {
                    CircularClockView(
                        time: currentTime,
                        theme: themes[currentThemeIndex],
                        sunTimes: calculateSunTimes()
                    )
                    .frame(width: 160, height: 160, alignment: .center)  // Visual clock size, don't clip
                    
                    TimeLabelsView()
                        .frame(width: 240, height: 240)  // Large frame to prevent edge clipping
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)  // Allow sun glow to extend
                .ignoresSafeArea(.all)  // Full screen
                
                Spacer()
                    .frame(height: 8)  // Small spacer for breathing room
                
                // Theme selector (tiny dots)
                HStack(spacing: 3) {
                    ForEach(0..<themes.count, id: \.self) { index in
                        Circle()
                            .fill(themes[index].morningPrime)
                            .frame(width: currentThemeIndex == index ? 5 : 3, height: currentThemeIndex == index ? 5 : 3)
                            .onTapGesture {
                                currentThemeIndex = index
                                crownValue = Double(index)  // Sync crown value with tap
                            }
                    }
                }
                .padding(.bottom, 16)  // More padding to ensure dots visible
            }
        }
        .opacity(scenePhase == .inactive ? 0.6 : 1.0)  // Dim when wrist down (Always-On Display)
        .animation(.easeInOut(duration: 0.3), value: scenePhase)  // Smooth transition
        .focusable()  // Enable Digital Crown interaction
        .digitalCrownRotation($crownValue, from: 0.0, through: Double(themes.count - 1), by: 1.0, sensitivity: .low, isContinuous: false, isHapticFeedbackEnabled: false)
        .onChange(of: crownValue) { oldValue, newValue in  // Fixed deprecated syntax
            // Round to nearest integer to snap to theme
            let newIndex = Int(round(newValue))
            if newIndex != currentThemeIndex && newIndex >= 0 && newIndex < themes.count {
                currentThemeIndex = newIndex
                crownValue = Double(newIndex)  // Snap crown value to integer
            }
        }
        .onReceive(timer) { _ in
            currentTime = Date()
        }
    }
    
    // MARK: - Computed Properties
    
    var timeString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm"
        return formatter.string(from: currentTime)
    }
    
    var dateString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE, MMM d"
        return formatter.string(from: currentTime)
    }
    
    var sunriseString: String {
        let sunTimes = calculateSunTimes()
        return formatHour(sunTimes.sunrise)
    }
    
    var sunsetString: String {
        let sunTimes = calculateSunTimes()
        return formatHour(sunTimes.sunset)
    }
    
    func formatHour(_ hour: Double) -> String {
        let h = Int(hour)
        let m = Int((hour - Double(h)) * 60)
        let period = h >= 12 ? "PM" : "AM"
        let displayHour = h > 12 ? h - 12 : (h == 0 ? 12 : h)
        return String(format: "%d:%02d %@", displayHour, m, period)
    }
    
    func toggleTracking() {
        isTracking.toggle()
        WKInterfaceDevice.current().play(isTracking ? .start : .stop)
    }
    
    // MARK: - Sun Calculations
    
    func calculateSunTimes() -> SunTimes {
        // Get actual coordinates from GPS, fallback to Providence, RI
        let latitude = locationManager.location?.coordinate.latitude ?? 41.8236
        let longitude = locationManager.location?.coordinate.longitude ?? -71.4222
        
        return calculateSunTimesFor(latitude: latitude, longitude: longitude, date: currentTime)
    }
    
    func calculateSunTimesFor(latitude: Double, longitude: Double, date: Date) -> SunTimes {
        // NOAA Solar Calculator Algorithm
        // This is the same algorithm used by weather.com and other weather services
        // Source: https://gml.noaa.gov/grad/solcalc/calcdetails.html
        
        let calendar = Calendar.current
        let year = calendar.component(.year, from: date)
        let month = calendar.component(.month, from: date)
        let day = calendar.component(.day, from: date)
        
        // Julian Day
        let a = (14 - month) / 12
        let y = year + 4800 - a
        let m = month + 12 * a - 3
        let jdn = day + (153 * m + 2) / 5 + 365 * y + y / 4 - y / 100 + y / 400 - 32045
        let jd = Double(jdn) + 0.5
        
        // Julian Century
        let jc = (jd - 2451545.0) / 36525.0
        
        // Geometric Mean Long Sun (degrees)
        let geomMeanLongSun = (280.46646 + jc * (36000.76983 + jc * 0.0003032)).truncatingRemainder(dividingBy: 360.0)
        
        // Geometric Mean Anom Sun (degrees)
        let geomMeanAnomSun = 357.52911 + jc * (35999.05029 - 0.0001537 * jc)
        
        // Eccent Earth Orbit
        let eccentOrbit = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc)
        
        // Sun Eq of Ctr
        let sunEqOfCtr = sin(geomMeanAnomSun * .pi / 180.0) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
                         sin(2 * geomMeanAnomSun * .pi / 180.0) * (0.019993 - 0.000101 * jc) +
                         sin(3 * geomMeanAnomSun * .pi / 180.0) * 0.000289
        
        // Sun True Long (degrees)
        let sunTrueLong = geomMeanLongSun + sunEqOfCtr
        
        // Sun App Long (degrees)
        let sunAppLong = sunTrueLong - 0.00569 - 0.00478 * sin((125.04 - 1934.136 * jc) * .pi / 180.0)
        
        // Mean Obliq Ecliptic (degrees)
        let meanObliqEcliptic = 23.0 + (26.0 + ((21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813)))) / 60.0) / 60.0
        
        // Obliq Corr (degrees)
        let obliqCorr = meanObliqEcliptic + 0.00256 * cos((125.04 - 1934.136 * jc) * .pi / 180.0)
        
        // Sun Declin (degrees)
        let sunDeclin = asin(sin(obliqCorr * .pi / 180.0) * sin(sunAppLong * .pi / 180.0)) * 180.0 / .pi
        
        // var y
        let varY = tan(obliqCorr / 2.0 * .pi / 180.0) * tan(obliqCorr / 2.0 * .pi / 180.0)
        
        // Eq of Time (minutes)
        let eqTime = 4.0 * (varY * sin(2.0 * geomMeanLongSun * .pi / 180.0) -
                           2.0 * eccentOrbit * sin(geomMeanAnomSun * .pi / 180.0) +
                           4.0 * eccentOrbit * varY * sin(geomMeanAnomSun * .pi / 180.0) * cos(2.0 * geomMeanLongSun * .pi / 180.0) -
                           0.5 * varY * varY * sin(4.0 * geomMeanLongSun * .pi / 180.0) -
                           1.25 * eccentOrbit * eccentOrbit * sin(2.0 * geomMeanAnomSun * .pi / 180.0)) * 180.0 / .pi
        
        // HA Sunrise (degrees)
        let haSunrise = acos(cos(90.833 * .pi / 180.0) / (cos(latitude * .pi / 180.0) * cos(sunDeclin * .pi / 180.0)) -
                            tan(latitude * .pi / 180.0) * tan(sunDeclin * .pi / 180.0)) * 180.0 / .pi
        
        // Solar Noon (LST)
        let timeZoneOffset = Double(TimeZone.current.secondsFromGMT(for: date)) / 3600.0
        let solarNoon = (720.0 - 4.0 * longitude - eqTime + timeZoneOffset * 60.0) / 60.0
        
        // Sunrise Time (LST)
        let sunrise = solarNoon - haSunrise * 4.0 / 60.0
        
        // Sunset Time (LST)
        let sunset = solarNoon + haSunrise * 4.0 / 60.0
        
        // Debug output
        print("🌅 NOAA Solar Times for \(latitude), \(longitude) on \(date):")
        print("   Sunrise: \(formatHourDebug(sunrise))")
        print("   Sunset: \(formatHourDebug(sunset))")
        print("   Solar Noon: \(formatHourDebug(solarNoon))")
        
        return SunTimes(
            sunrise: sunrise,
            sunset: sunset,
            astronomicalStart: sunrise - 1.5,
            nauticalStart: sunrise - 0.9,
            civilStart: sunrise - 0.4,
            civilEnd: sunset + 0.4,
            nauticalEnd: sunset + 0.9,
            astronomicalEnd: sunset + 1.5,
            morningPrimeStart: sunrise,
            morningPrimeEnd: sunrise + 2,
            eveningPrimeStart: sunset - 2,
            eveningPrimeEnd: sunset
        )
    }
    
    func formatHourDebug(_ hour: Double) -> String {
        let h = Int(hour)
        let m = Int((hour - Double(h)) * 60)
        let period = h >= 12 ? "PM" : "AM"
        let displayHour = h > 12 ? h - 12 : (h == 0 ? 12 : h)
        return String(format: "%d:%02d %@", displayHour, m, period)
    }
    
    func getSunGlowConfig(currentHour: Double, sunTimes: SunTimes, inMorningPrime: Bool, inEveningPrime: Bool) -> SunGlowConfig {
        // Sunrise glow (deep orange to golden yellow)
        if inMorningPrime {
            return SunGlowConfig(
                coreColor: Color(hex: "ffd54f"),     // Golden yellow
                innerColor: Color(hex: "ffa726"),    // Orange
                middleColor: Color(hex: "ff6b35"),   // Deep orange
                outerColor: Color(hex: "ff8a65"),    // Soft coral
                innerPulseScale: 1.15,  // Bigger pulse during prime
                outerPulseScale: 1.2
            )
        }
        
        // Sunset glow (golden orange to deep amber)
        if inEveningPrime {
            return SunGlowConfig(
                coreColor: Color(hex: "ffb74d"),     // Golden amber
                innerColor: Color(hex: "ff9800"),    // Deep orange
                middleColor: Color(hex: "f4511e"),   // Burnt orange
                outerColor: Color(hex: "d84315"),    // Deep red-orange
                innerPulseScale: 1.15,
                outerPulseScale: 1.2
            )
        }
        
        // Midday sun (bright, minimal pulse)
        if currentHour >= sunTimes.morningPrimeEnd && currentHour < sunTimes.eveningPrimeStart {
            return SunGlowConfig(
                coreColor: Color(hex: "ffeb3b"),     // Bright yellow
                innerColor: Color(hex: "fff176"),    // Light yellow
                middleColor: Color(hex: "fdd835"),   // Yellow
                outerColor: Color(hex: "fbc02d"),    // Amber
                innerPulseScale: 1.05,  // Subtle pulse
                outerPulseScale: 1.08
            )
        }
        
        // Night/twilight sun (dim, minimal pulse)
        return SunGlowConfig(
            coreColor: Color(hex: "ffcc80"),         // Pale orange
            innerColor: Color(hex: "ffb74d"),        // Muted orange
            middleColor: Color(hex: "ff9800"),       // Orange
            outerColor: Color(hex: "f57c00"),        // Dark orange
            innerPulseScale: 1.02,  // Very subtle
            outerPulseScale: 1.03
        )
    }
}

// MARK: - Circular Clock View

// Pulsing Modifier for Prime Windows
struct PulsingModifier: ViewModifier {
    let isActive: Bool
    let maxScale: Double
    let duration: Double
    
    @State private var scale: Double = 1.0
    
    func body(content: Content) -> some View {
        content
            .scaleEffect(scale)
            .onChange(of: isActive) { _, newValue in
                if newValue {
                    // Start pulsing
                    withAnimation(.easeInOut(duration: duration).repeatForever(autoreverses: true)) {
                        scale = maxScale
                    }
                } else {
                    // Stop pulsing, return to normal
                    withAnimation(.easeOut(duration: 0.5)) {
                        scale = 1.0
                    }
                }
            }
            .onAppear {
                if isActive {
                    withAnimation(.easeInOut(duration: duration).repeatForever(autoreverses: true)) {
                        scale = maxScale
                    }
                }
            }
    }
}

struct CircularClockView: View {
    let time: Date
    let theme: ClockTheme
    let sunTimes: SunTimes
    
    var body: some View {
        ZStack {
            // Background circle
            Circle()
                .fill(Color.black)
            
            // Calculate current time and prime window status
            let currentHour = Double(Calendar.current.component(.hour, from: time)) + Double(Calendar.current.component(.minute, from: time)) / 60.0
            let inMorningPrime = currentHour >= sunTimes.morningPrimeStart && currentHour <= sunTimes.morningPrimeEnd
            let inEveningPrime = currentHour >= sunTimes.eveningPrimeStart && currentHour <= sunTimes.eveningPrimeEnd
            
            // BLENDED SEGMENTS - Simplified gradient
            let gradientStops = createGradientStops(
                sunTimes: sunTimes,
                theme: theme,
                inMorningPrime: inMorningPrime,
                inEveningPrime: inEveningPrime
            )
            
            Circle()
                .fill(
                    AngularGradient(
                        gradient: Gradient(stops: gradientStops),
                        center: .center,
                        startAngle: .degrees(-90),
                        endAngle: .degrees(270)
                    )
                )
                .scaleEffect(inMorningPrime || inEveningPrime ? 1.0 : 1.0)  // Base scale
                .modifier(PulsingModifier(isActive: inMorningPrime || inEveningPrime, maxScale: 1.12, duration: 8.0))
            
            // SUN POSITION - Tracks 24-hour clock time
            // offset(y: -80) positions sun at TOP (midnight position)
            // Then we rotate clockwise: 0°=top, 90°=right, 180°=bottom, 270°=left
            let sunAngle = (currentHour / 24.0) * 360.0  // Removed -90 because offset already positions at top
            
            // Get sun color configuration
            let glowConfig = getSunGlowConfig(
                currentHour: currentHour,
                sunTimes: sunTimes,
                inMorningPrime: inMorningPrime,
                inEveningPrime: inEveningPrime
            )
            
            ZStack {
                // Check if sun is below horizon (after sunset or before sunrise)
                let afterSunset = currentHour < sunTimes.sunrise || currentHour > sunTimes.sunset
                
                // OUTER LAYER: Even bigger after sunset for visibility
                Circle()
                    .fill(
                        RadialGradient(
                            gradient: Gradient(stops: [
                                .init(color: glowConfig.outerColor.opacity(afterSunset ? 0.4 : 0.3), location: 0.0),
                                .init(color: glowConfig.middleColor.opacity(afterSunset ? 0.25 : 0.2), location: 0.3),
                                .init(color: theme.daylight.opacity(afterSunset ? 0.2 : 0.15), location: 0.5),
                                .init(color: Color.clear, location: 0.7)
                            ]),
                            center: .center,
                            startRadius: 0,
                            endRadius: afterSunset ? 70 : 60  // Bigger after sunset
                        )
                    )
                    .frame(width: afterSunset ? 140 : 120, height: afterSunset ? 140 : 120)
                    .blur(radius: afterSunset ? 16 : 14)
                    .modifier(PulsingModifier(isActive: inMorningPrime || inEveningPrime, maxScale: 1.8, duration: 8.0))
                
                // INNER LAYER: More prominent after sunset
                Circle()
                    .fill(
                        RadialGradient(
                            gradient: Gradient(stops: [
                                .init(color: glowConfig.coreColor.opacity(afterSunset ? 0.8 : 0.7), location: 0.0),
                                .init(color: glowConfig.innerColor.opacity(afterSunset ? 0.6 : 0.5), location: 0.2),
                                .init(color: glowConfig.middleColor.opacity(afterSunset ? 0.5 : 0.4), location: 0.35),
                                .init(color: theme.daylight.opacity(afterSunset ? 0.4 : 0.3), location: 0.5),
                                .init(color: theme.astronomical.opacity(afterSunset ? 0.25 : 0.2), location: 0.65),
                                .init(color: Color.clear, location: 0.8)
                            ]),
                            center: .center,
                            startRadius: 0,
                            endRadius: 45
                        )
                    )
                    .frame(width: afterSunset ? 90 : 80, height: afterSunset ? 90 : 80)
                    .blur(radius: afterSunset ? 10 : 8)
                    .modifier(PulsingModifier(isActive: inMorningPrime || inEveningPrime, maxScale: 1.7, duration: 7.0))
                
                // SUN CORE - remains visible even after sunset
                Circle()
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                glowConfig.coreColor,
                                glowConfig.innerColor,
                                glowConfig.middleColor
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 12, height: 12)
                    .opacity(afterSunset ? 0.75 : 1.0)  // Slightly dimmer after sunset but still visible
                    .overlay(
                        Circle()
                            .stroke(Color.yellow.opacity(afterSunset ? 0.6 : 0.5), lineWidth: 0.5)
                    )
            }
            .offset(y: -80)
            .rotationEffect(.degrees(sunAngle))
        }
    }
    
    
    func getSunGlowConfig(currentHour: Double, sunTimes: SunTimes, inMorningPrime: Bool, inEveningPrime: Bool) -> SunGlowConfig {
        let afterSunset = currentHour < sunTimes.sunrise || currentHour > sunTimes.sunset
        
        // AFTER SUNSET - Red/Orange sun (nature's surprise!)
        if afterSunset {
            return SunGlowConfig(
                coreColor: Color(hex: "ff6b4a"),    // Deep red-orange
                innerColor: Color(hex: "ff5733"),    // Red-orange
                middleColor: Color(hex: "e74c3c"),   // Deeper red
                outerColor: Color(hex: "c0392b"),    // Dark red
                innerPulseScale: 1.02,
                outerPulseScale: 1.03
            )
        }
        
        // Sunrise glow (deep orange to golden yellow)
        if inMorningPrime {
            return SunGlowConfig(
                coreColor: Color(hex: "ffd54f"),
                innerColor: Color(hex: "ffa726"),
                middleColor: Color(hex: "ff6b35"),
                outerColor: Color(hex: "ff8a65"),
                innerPulseScale: 1.15,
                outerPulseScale: 1.2
            )
        }
        
        // Sunset glow (golden orange to deep amber)
        if inEveningPrime {
            return SunGlowConfig(
                coreColor: Color(hex: "ffb74d"),
                innerColor: Color(hex: "ff9800"),
                middleColor: Color(hex: "f4511e"),
                outerColor: Color(hex: "d84315"),
                innerPulseScale: 1.15,
                outerPulseScale: 1.2
            )
        }
        
        // Midday sun (bright, minimal pulse)
        if currentHour >= sunTimes.morningPrimeEnd && currentHour < sunTimes.eveningPrimeStart {
            return SunGlowConfig(
                coreColor: Color(hex: "ffeb3b"),
                innerColor: Color(hex: "fff176"),
                middleColor: Color(hex: "fdd835"),
                outerColor: Color(hex: "fbc02d"),
                innerPulseScale: 1.05,
                outerPulseScale: 1.08
            )
        }
        
        // Dawn/Dusk twilight (soft orange)
        return SunGlowConfig(
            coreColor: Color(hex: "ffcc80"),
            innerColor: Color(hex: "ffb74d"),
            middleColor: Color(hex: "ff9800"),
            outerColor: Color(hex: "f57c00"),
            innerPulseScale: 1.02,
            outerPulseScale: 1.03
        )
    }
    
    func createGradientStops(sunTimes: SunTimes, theme: ClockTheme, inMorningPrime: Bool, inEveningPrime: Bool) -> [Gradient.Stop] {
        // Smooth blend amount for transitions
        let blend = 0.15  // 9 minutes of blending between segments
        
        return [
            // Deep night → Astronomical (smooth blend)
            .init(color: theme.deepNight, location: 0.0),
            .init(color: theme.deepNight, location: max(0, (sunTimes.astronomicalStart - blend) / 24.0)),
            .init(color: theme.astronomical, location: (sunTimes.astronomicalStart + blend) / 24.0),
            
            // Astronomical → Nautical (smooth blend)
            .init(color: theme.astronomical, location: max(0, (sunTimes.nauticalStart - blend) / 24.0)),
            .init(color: theme.nautical, location: (sunTimes.nauticalStart + blend) / 24.0),
            
            // Nautical → Civil (smooth blend)
            .init(color: theme.nautical, location: max(0, (sunTimes.civilStart - blend) / 24.0)),
            .init(color: theme.civil, location: (sunTimes.civilStart + blend) / 24.0),
            
            // Civil → Morning Prime (smooth blend)
            .init(color: theme.civil, location: max(0, (sunTimes.sunrise - blend) / 24.0)),
            .init(color: theme.morningPrime, location: (sunTimes.sunrise + blend) / 24.0),
            .init(color: theme.morningPrime, location: (sunTimes.morningPrimeEnd - blend) / 24.0),
            
            // Morning Prime → Daylight (smooth blend)
            .init(color: theme.daylight, location: (sunTimes.morningPrimeEnd + blend) / 24.0),
            .init(color: theme.daylight, location: (sunTimes.eveningPrimeStart - blend) / 24.0),
            
            // Daylight → Evening Prime (smooth blend)
            .init(color: theme.eveningPrime, location: (sunTimes.eveningPrimeStart + blend) / 24.0),
            .init(color: theme.eveningPrime, location: (sunTimes.sunset - blend) / 24.0),
            
            // Evening Prime → Civil (smooth blend)
            .init(color: theme.civil, location: (sunTimes.sunset + blend) / 24.0),
            .init(color: theme.civil, location: (sunTimes.civilEnd - blend) / 24.0),
            
            // Civil → Nautical (smooth blend)
            .init(color: theme.nautical, location: (sunTimes.civilEnd + blend) / 24.0),
            .init(color: theme.nautical, location: (sunTimes.nauticalEnd - blend) / 24.0),
            
            // Nautical → Astronomical (smooth blend)
            .init(color: theme.astronomical, location: (sunTimes.nauticalEnd + blend) / 24.0),
            .init(color: theme.astronomical, location: (sunTimes.astronomicalEnd - blend) / 24.0),
            
            // Astronomical → Deep night (smooth blend)
            .init(color: theme.deepNight, location: (sunTimes.astronomicalEnd + blend) / 24.0),
            .init(color: theme.deepNight, location: 1.0)
        ]
    }
}

// MARK: - Time Labels

struct TimeLabelsView: View {
    var body: some View {
        ZStack {
            // Tick marks for ALL 24 hours - OUTSIDE the circle
            ForEach(0..<24) { hour in
                let angle = Double(hour) * 15.0 - 90.0  // 360/24 = 15° per hour, -90 to start at top
                let isLabeledHour = hour % 3 == 0  // Every 3 hours gets a number label
                
                // Tick mark (all 24 hours) - TINY
                Rectangle()
                    .fill(Color.white.opacity(isLabeledHour ? 0.4 : 0.25))  // More subtle
                    .frame(width: 0.5, height: isLabeledHour ? 4 : 2)  // Much smaller
                    .offset(y: -92)  // Adjusted for smaller clock
                    .rotationEffect(.degrees(angle))
            }
            
            // 8 hour labels positioned OUTSIDE the circle (every 3 hours) - TINY
            Text("12a")
                .font(.system(size: 8, weight: .medium))  // Increased from 7 to 8
                .foregroundColor(.white.opacity(0.5))
                .offset(x: 0, y: -95)  // Closer to circle (was -105)
            
            Text("3a")
                .font(.system(size: 8, weight: .medium))
                .foregroundColor(.white.opacity(0.5))
                .offset(x: 67, y: -67)  // Closer (was 74, -74)
            
            Text("6a")
                .font(.system(size: 8, weight: .medium))
                .foregroundColor(.white.opacity(0.5))
                .offset(x: 95, y: 0)  // Closer (was 105)
            
            Text("9a")
                .font(.system(size: 8, weight: .medium))
                .foregroundColor(.white.opacity(0.5))
                .offset(x: 67, y: 67)  // Closer (was 74, 74)
            
            Text("12p")
                .font(.system(size: 8, weight: .medium))
                .foregroundColor(.white.opacity(0.5))
                .offset(x: 0, y: 95)  // Closer (was 105)
            
            Text("3p")
                .font(.system(size: 8, weight: .medium))
                .foregroundColor(.white.opacity(0.5))
                .offset(x: -67, y: 67)  // Closer (was -74, 74)
            
            Text("6p")
                .font(.system(size: 8, weight: .medium))
                .foregroundColor(.white.opacity(0.5))
                .offset(x: -95, y: 0)  // Closer (was -105)
            
            Text("9p")
                .font(.system(size: 8, weight: .medium))
                .foregroundColor(.white.opacity(0.5))
                .offset(x: -60, y: -60)  // Moved inward from (-67, -67)
        }
    }
}

// MARK: - Data Models

struct ClockTheme {
    let name: String
    let deepNight: Color
    let astronomical: Color
    let nautical: Color
    let civil: Color
    let daylight: Color
    let morningPrime: Color
    let eveningPrime: Color
}

struct SunTimes {
    let sunrise: Double
    let sunset: Double
    let astronomicalStart: Double
    let nauticalStart: Double
    let civilStart: Double
    let civilEnd: Double
    let nauticalEnd: Double
    let astronomicalEnd: Double
    let morningPrimeStart: Double
    let morningPrimeEnd: Double
    let eveningPrimeStart: Double
    let eveningPrimeEnd: Double
}

struct SunGlowConfig {
    let coreColor: Color
    let innerColor: Color
    let middleColor: Color
    let outerColor: Color
    let innerPulseScale: CGFloat
    let outerPulseScale: CGFloat
}

// MARK: - Color Extension (Hex Support)

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    ContentView()
}

/*
 IMPORTANT: Add these to your Info.plist for location access:
 
 <key>NSLocationWhenInUseUsageDescription</key>
 <string>SolCue needs your location to calculate accurate sunrise and sunset times for your area.</string>
 
 <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
 <string>SolCue needs your location to calculate accurate sunrise and sunset times for your area.</string>
 */
