
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.OceanDamo.solcue',
  appName: 'SolCue',
  webDir: 'dist',
  // Remove server config for production builds
  // server: {
  //   url: 'https://a34cb0d7-5f9b-47cd-a9e6-d2923619dfd4.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  bundledWebRuntime: false,
  ios: {
    path: 'ios/App'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
