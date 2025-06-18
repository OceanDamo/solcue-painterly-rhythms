// capacitor.config.ts - FIXED
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oceandamo.SolCue', // FIXED: Consistent casing (oceandamo not OceanDamo)
  appName: 'SolCue',
  webDir: 'dist',
  // Server config correctly removed for App Store
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