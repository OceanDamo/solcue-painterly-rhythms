
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oceandamo.SolCue', // Fixed bundle ID
  appName: 'SolCue',
  webDir: 'dist',
  // Remove server config for production builds
  // server: {
  //   url: 'https://a34cb0d7-5f9b-47cd-a9e6-d2923619dfd4.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  bundledWebRuntime: false,
  ios: {
    path: 'ios/App',
    supportsTablet: false, // iPhone only like original
    requireFullScreen: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    Geolocation: {
      permissions: ['location']
    }
  }
};

export default config;
