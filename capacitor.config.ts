
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a34cb0d75f9b47cda9e6d2923619dfd4',
  appName: 'SolCue',
  webDir: 'dist',
  server: {
    url: 'https://a34cb0d7-5f9b-47cd-a9e6-d2923619dfd4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false,
  ios: {
    path: 'ios/App'
  }
};

export default config;
