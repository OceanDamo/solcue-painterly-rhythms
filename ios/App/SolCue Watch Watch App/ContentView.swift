//
//  ContentView.swift
//  SolCue Watch Watch App
//
//  Beautiful Circadian Clock for Apple Watch
//

import SwiftUI
import CoreLocation

// MARK: - Location Manager

// Battery-friendly location: asks for permission once, takes ONE approximate
// fix when the app becomes active (and again if it has been open for hours),
// then stops. The last real location is saved on the watch and used if a fresh
// fix isn't available. There is no made-up default location: if the app has
// never had a real one, `location` stays nil and the UI explains.
class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private let defaults = UserDefaults.standard
    private var isRequesting = false
    private var lastFixDate: Date?
    private var lastAttemptDate: Date?

    // How long before an open app refreshes its location again.
    private static let staleAfter: TimeInterval = 3 * 60 * 60
    private static let latKey = "solcue.lastLocation.latitude"
    private static let lonKey = "solcue.lastLocation.longitude"
    private static let dateKey = "solcue.lastLocation.date"

    // Always a REAL location: a fresh fix, or the last one saved on the watch.
    @Published var location: CLLocation?
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published var lastRequestFailed = false

    override init() {
        super.init()
        manager.delegate = self
        // Approximate is plenty for sun times.
        manager.desiredAccuracy = kCLLocationAccuracyKilometer
        authorizationStatus = manager.authorizationStatus
        loadSavedLocation()
    }

    var isDenied: Bool {
        authorizationStatus == .denied || authorizationStatus == .restricted
    }

    // Call when the app becomes active: one fresh fix.
    func refresh() {
        switch manager.authorizationStatus {
        case .notDetermined:
            // Ask once. The answer arrives in locationManagerDidChangeAuthorization.
            manager.requestWhenInUseAuthorization()
        case .authorizedWhenInUse, .authorizedAlways:
            requestSingleFix()
        default:
            break  // denied or restricted: keep using the saved location, if any
        }
    }

    // Cheap check, safe to call often: refreshes only if the last fix is old.
    func refreshIfStale() {
        guard let lastFixDate = lastFixDate else { return }
        // Measure from the last attempt too, so a failed request isn't retried every second.
        let reference = max(lastFixDate, lastAttemptDate ?? lastFixDate)
        if Date().timeIntervalSince(reference) > Self.staleAfter {
            refresh()
        }
    }

    private func requestSingleFix() {
        guard !isRequesting else { return }
        isRequesting = true
        lastAttemptDate = Date()
        manager.requestLocation()  // one fix, then location updates stop by themselves
    }

    private func loadSavedLocation() {
        guard let lat = defaults.object(forKey: Self.latKey) as? Double,
              let lon = defaults.object(forKey: Self.lonKey) as? Double,
              abs(lat) <= 90, abs(lon) <= 180 else { return }
        location = CLLocation(latitude: lat, longitude: lon)
        lastFixDate = defaults.object(forKey: Self.dateKey) as? Date
    }

    private func save(_ location: CLLocation) {
        defaults.set(location.coordinate.latitude, forKey: Self.latKey)
        defaults.set(location.coordinate.longitude, forKey: Self.lonKey)
        defaults.set(Date(), forKey: Self.dateKey)
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        isRequesting = false
        // Use the most recent location in the batch, not the first.
        guard let latest = locations.last else { return }
        location = latest
        lastRequestFailed = false
        lastFixDate = Date()
        save(latest)
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        isRequesting = false
        lastRequestFailed = true  // keep whatever real location we already have
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        authorizationStatus = manager.authorizationStatus
        if authorizationStatus == .authorizedWhenInUse || authorizationStatus == .authorizedAlways {
            requestSingleFix()
        }
    }
}

// Calm message shown when the app has never had a real location.
struct LocationMessageView: View {
    let isDenied: Bool
    let requestFailed: Bool

    var body: some View {
        VStack(spacing: 6) {
            if isDenied || requestFailed {
                Text("Turn on location to see your sun.")
                    .font(.system(size: 15, weight: .medium))
                    .multilineTextAlignment(.center)
                Text(isDenied
                     ? "Allow SolCue in Settings > Privacy & Security > Location Services."
                     : "We couldn't find your location just now.")
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.6))
                    .multilineTextAlignment(.center)
            } else {
                Text("Finding your sun…")
                    .font(.system(size: 15, weight: .medium))
            }
        }
        .foregroundColor(.white)
        .padding(.horizontal, 12)
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
            
            if let sunTimes = calculateSunTimes() {
            VStack(spacing: 0) {
                // Main circular clock with time labels overlay
                ZStack {
                    CircularClockView(
                        time: currentTime,
                        theme: themes[currentThemeIndex],
                        sunTimes: sunTimes
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
            } else {
                LocationMessageView(isDenied: locationManager.isDenied,
                                    requestFailed: locationManager.lastRequestFailed)
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
        .onAppear {
            locationManager.refresh()
        }
        .onChange(of: scenePhase) { _, newPhase in
            // One fresh location each time the app becomes active.
            if newPhase == .active {
                locationManager.refresh()
            }
        }
        .onReceive(timer) { _ in
            currentTime = Date()
            locationManager.refreshIfStale()  // refresh if it's been hours
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
        guard let sunTimes = calculateSunTimes() else { return "--" }
        return formatHour(sunTimes.sunrise)
    }
    
    var sunsetString: String {
        guard let sunTimes = calculateSunTimes() else { return "--" }
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
    
    // Sun times for the user's real location, or nil if the app has never had one.
    func calculateSunTimes() -> SunTimes? {
        guard let location = locationManager.location else { return nil }
        return SunCalculator.sunTimes(latitude: location.coordinate.latitude,
                                      longitude: location.coordinate.longitude,
                                      date: currentTime)
    }
}

// MARK: - Sun Calculator
//
// NOAA Solar Calculator algorithm - https://gml.noaa.gov/grad/solcalc/calcdetails.html
// This is a line-for-line port of src/lib/sunMath.ts in the iPhone app. If you
// change a rule in one, change it in the other so both apps always agree.

// Sun zenith angles (degrees from straight up). 90.833 is sunrise/sunset.
private let zenithSunrise = 90.833
private let zenithCivil = 96.0          // sun 6 degrees below the horizon
private let zenithNautical = 102.0      // sun 12 degrees below the horizon
private let zenithAstronomical = 108.0  // sun 18 degrees below the horizon

// How long (hours) the sun's colour takes to fade between red-orange and gold
// around sunrise and sunset. Same length on both ends of the day.
private let sunColorBlendHours = 0.75

enum PolarState {
    case none   // the sun rises and sets normally today
    case day    // polar day: the sun never sets today
    case night  // polar night: the sun never rises today
}

enum SunCalculator {
    private static func clampHour(_ h: Double) -> Double { min(24, max(0, h)) }
    
    // Never returns NaN:
    //  - sun never rises today -> polar = .night; never sets -> polar = .day
    //  - a twilight that never occurs collapses onto the next-lighter one
    //    (astronomical -> nautical -> civil -> sunrise/sunset)
    //  - times that would spill past midnight are clamped to 0...24
    static func sunTimes(latitude: Double, longitude: Double, date: Date) -> SunTimes {
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
        
        // Hour angle (degrees) at which the sun's centre sits at the given zenith
        // angle. nil when that angle is never reached today (or the maths isn't a number).
        func hourAngle(for zenith: Double) -> Double? {
            let cosH = cos(zenith * .pi / 180.0) / (cos(latitude * .pi / 180.0) * cos(sunDeclin * .pi / 180.0)) -
                       tan(latitude * .pi / 180.0) * tan(sunDeclin * .pi / 180.0)
            guard cosH.isFinite, cosH <= 1, cosH >= -1 else { return nil }
            return acos(cosH) * 180.0 / .pi
        }
        
        // Solar Noon (LST)
        let timeZoneOffset = Double(TimeZone.current.secondsFromGMT(for: date)) / 3600.0
        let solarNoon = (720.0 - 4.0 * longitude - eqTime + timeZoneOffset * 60.0) / 60.0
        
        func hourAt(_ ha: Double, _ sign: Double) -> Double {
            clampHour(solarNoon + sign * ha * 4.0 / 60.0)
        }
        
        guard let sunHa = hourAngle(for: zenithSunrise) else {
            // The sun never crosses the horizon today. Above the horizon at solar noon = polar day.
            let noonZenith = abs(latitude - sunDeclin)
            let polar: PolarState = (noonZenith.isFinite && noonZenith < zenithSunrise) ? .day : .night
            // .day: sunrise at 0, sunset at 24 (always up). .night: both at 24 (always down).
            let rise = polar == .day ? 0.0 : 24.0
            let set = 24.0
            return SunTimes(sunrise: rise, sunset: set,
                            astronomicalStart: rise, nauticalStart: rise, civilStart: rise,
                            civilEnd: set, nauticalEnd: set, astronomicalEnd: set,
                            morningPrimeStart: rise, morningPrimeEnd: rise,
                            eveningPrimeStart: set, eveningPrimeEnd: set,
                            polar: polar)
        }
        
        // Each twilight falls back to the next-lighter one when it never occurs.
        let civilHa = hourAngle(for: zenithCivil) ?? sunHa
        let nauticalHa = hourAngle(for: zenithNautical) ?? civilHa
        let astronomicalHa = hourAngle(for: zenithAstronomical) ?? nauticalHa
        
        let sunrise = hourAt(sunHa, -1)
        let sunset = hourAt(sunHa, 1)
        let civilDawn = hourAt(civilHa, -1)
        let civilDusk = hourAt(civilHa, 1)
        
        return SunTimes(
            sunrise: sunrise,
            sunset: sunset,
            astronomicalStart: hourAt(astronomicalHa, -1),
            nauticalStart: hourAt(nauticalHa, -1),
            civilStart: civilDawn,
            civilEnd: civilDusk,
            nauticalEnd: hourAt(nauticalHa, 1),
            astronomicalEnd: hourAt(astronomicalHa, 1),
            // Prime windows:
            //   morning = civil dawn ("first light") -> sunrise + 2 hours
            //   evening = sunset - 2 hours -> civil dusk ("last light")
            morningPrimeStart: civilDawn,
            morningPrimeEnd: clampHour(sunrise + 2),
            eveningPrimeStart: clampHour(sunset - 2),
            eveningPrimeEnd: civilDusk,
            polar: .none
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
            let inMorningPrime = sunTimes.inMorningPrime(at: currentHour)
            let inEveningPrime = sunTimes.inEveningPrime(at: currentHour)
            
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
        // NIGHT - red/orange sun from sunset until sunrise (this includes first
        // light, the mirror image of the sunset glow).
        let night = SunGlowConfig(
            coreColor: Color(hex: "ff6b4a"),    // Deep red-orange
            innerColor: Color(hex: "ff5733"),    // Red-orange
            middleColor: Color(hex: "e74c3c"),   // Deeper red
            outerColor: Color(hex: "c0392b"),    // Dark red
            innerPulseScale: 1.02,
            outerPulseScale: 1.03
        )
        
        // DAYTIME colours
        let day: SunGlowConfig
        if inMorningPrime {
            // Sunrise glow (deep orange to golden yellow)
            day = SunGlowConfig(
                coreColor: Color(hex: "ffd54f"),
                innerColor: Color(hex: "ffa726"),
                middleColor: Color(hex: "ff6b35"),
                outerColor: Color(hex: "ff8a65"),
                innerPulseScale: 1.15,
                outerPulseScale: 1.2
            )
        } else if inEveningPrime {
            // Sunset glow (golden orange to deep amber)
            day = SunGlowConfig(
                coreColor: Color(hex: "ffb74d"),
                innerColor: Color(hex: "ff9800"),
                middleColor: Color(hex: "f4511e"),
                outerColor: Color(hex: "d84315"),
                innerPulseScale: 1.15,
                outerPulseScale: 1.2
            )
        } else if currentHour >= sunTimes.morningPrimeEnd && currentHour < sunTimes.eveningPrimeStart {
            // Midday sun (bright, minimal pulse)
            day = SunGlowConfig(
                coreColor: Color(hex: "ffeb3b"),
                innerColor: Color(hex: "fff176"),
                middleColor: Color(hex: "fdd835"),
                outerColor: Color(hex: "fbc02d"),
                innerPulseScale: 1.05,
                outerPulseScale: 1.08
            )
        } else {
            // Soft orange (only reached on very short days when the prime windows overlap)
            day = SunGlowConfig(
                coreColor: Color(hex: "ffcc80"),
                innerColor: Color(hex: "ffb74d"),
                middleColor: Color(hex: "ff9800"),
                outerColor: Color(hex: "f57c00"),
                innerPulseScale: 1.02,
                outerPulseScale: 1.03
            )
        }
        
        // Fade smoothly between the two around sunrise and sunset.
        let t = sunTimes.nightBlend(at: currentHour)
        if t >= 1 { return night }
        if t <= 0 { return day }
        return day.blended(with: night, by: t)
    }
    
    func createGradientStops(sunTimes: SunTimes, theme: ClockTheme, inMorningPrime: Bool, inEveningPrime: Bool) -> [Gradient.Stop] {
        // Polar day / polar night: one solid colour all round.
        if sunTimes.polar == .day {
            return [.init(color: theme.daylight, location: 0.0), .init(color: theme.daylight, location: 1.0)]
        }
        if sunTimes.polar == .night {
            return [.init(color: theme.deepNight, location: 0.0), .init(color: theme.deepNight, location: 1.0)]
        }
        
        // Smooth blend amount for transitions
        let blend = 0.15  // 9 minutes of blending between segments
        
        // Ring bands: night -> astronomical -> nautical -> MORNING PRIME (starts at
        // civil dawn / first light) -> daylight -> EVENING PRIME (ends at civil
        // dusk / last light) -> nautical -> astronomical -> night.
        let raw: [(Color, Double)] = [
            (theme.deepNight, 0.0),
            (theme.deepNight, sunTimes.astronomicalStart - blend),
            (theme.astronomical, sunTimes.astronomicalStart + blend),
            
            (theme.astronomical, sunTimes.nauticalStart - blend),
            (theme.nautical, sunTimes.nauticalStart + blend),
            
            (theme.nautical, sunTimes.morningPrimeStart - blend),
            (theme.morningPrime, sunTimes.morningPrimeStart + blend),
            (theme.morningPrime, sunTimes.morningPrimeEnd - blend),
            
            (theme.daylight, sunTimes.morningPrimeEnd + blend),
            (theme.daylight, sunTimes.eveningPrimeStart - blend),
            
            (theme.eveningPrime, sunTimes.eveningPrimeStart + blend),
            (theme.eveningPrime, sunTimes.eveningPrimeEnd - blend),
            
            (theme.nautical, sunTimes.eveningPrimeEnd + blend),
            (theme.nautical, sunTimes.nauticalEnd - blend),
            (theme.astronomical, sunTimes.nauticalEnd + blend),
            (theme.astronomical, sunTimes.astronomicalEnd - blend),
            (theme.deepNight, sunTimes.astronomicalEnd + blend),
            (theme.deepNight, 24.0)
        ]
        
        // Keep every stop inside 0...1 and in order, even when bands are very
        // short or collapsed (high latitudes), so the gradient never misbehaves.
        var previous = 0.0
        return raw.map { color, hour in
            let location = min(1.0, max(previous, hour / 24.0))
            previous = location
            return Gradient.Stop(color: color, location: location)
        }
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
    let astronomicalStart: Double  // sun 18 degrees below the horizon (dawn side)
    let nauticalStart: Double      // 12 degrees below (dawn side)
    let civilStart: Double         // 6 degrees below (dawn side) = civil dawn, "first light"
    let civilEnd: Double           // 6 degrees below (dusk side) = civil dusk, "last light"
    let nauticalEnd: Double
    let astronomicalEnd: Double
    let morningPrimeStart: Double
    let morningPrimeEnd: Double
    let eveningPrimeStart: Double
    let eveningPrimeEnd: Double
    let polar: PolarState
    
    // Polar day / polar night have no prime windows.
    func inMorningPrime(at hour: Double) -> Bool {
        polar == .none && hour >= morningPrimeStart && hour <= morningPrimeEnd
    }
    
    func inEveningPrime(at hour: Double) -> Bool {
        polar == .none && hour >= eveningPrimeStart && hour <= eveningPrimeEnd
    }
    
    // How "night-coloured" the sun should be at a given hour:
    //   1 = full red-orange (sunset until sunrise, including first light)
    //   0 = full gold (daytime)
    // Fades 1 -> 0 over sunColorBlendHours after sunrise, and 0 -> 1 over the
    // same length of time leading up to sunset.
    func nightBlend(at hour: Double) -> Double {
        if polar == .day { return 0 }
        if polar == .night { return 1 }
        if hour < sunrise || hour > sunset { return 1 }
        if hour < sunrise + sunColorBlendHours { return 1 - (hour - sunrise) / sunColorBlendHours }
        if hour > sunset - sunColorBlendHours { return (hour - (sunset - sunColorBlendHours)) / sunColorBlendHours }
        return 0
    }
}

struct SunGlowConfig {
    let coreColor: Color
    let innerColor: Color
    let middleColor: Color
    let outerColor: Color
    let innerPulseScale: CGFloat
    let outerPulseScale: CGFloat
    
    // Fades from `self` (t = 0) to `other` (t = 1).
    func blended(with other: SunGlowConfig, by t: Double) -> SunGlowConfig {
        SunGlowConfig(
            coreColor: coreColor.mix(with: other.coreColor, by: t),
            innerColor: innerColor.mix(with: other.innerColor, by: t),
            middleColor: middleColor.mix(with: other.middleColor, by: t),
            outerColor: outerColor.mix(with: other.outerColor, by: t),
            innerPulseScale: innerPulseScale + (other.innerPulseScale - innerPulseScale) * CGFloat(t),
            outerPulseScale: outerPulseScale + (other.outerPulseScale - outerPulseScale) * CGFloat(t)
        )
    }
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
 NOTE: The Watch's location permission text is set in the target's build settings
 (INFOPLIST_KEY_NSLocationWhenInUseUsageDescription in project.pbxproj):
 "SolCue uses your location to find sunrise, sunset, and twilight where you are, so your sun clock matches your sky."
 */
