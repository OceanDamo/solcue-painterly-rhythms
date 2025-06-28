import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oceandamo.SolCue',
  appName: 'SolCue',
  webDir: 'dist',
  bundledWebRuntime: false,
  ios: {
    path: 'ios/App',
    supportsTablet: false,
    requireFullScreen: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;