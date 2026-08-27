import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cloudnova.app',
  appName: 'Cloud Nova',
  webDir: 'build',
  server: {
    url: 'https://clooudnova.up.railway.app',
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 250,
      backgroundColor: '#0b0c0f'
    }
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false
  }
};

export default config;
