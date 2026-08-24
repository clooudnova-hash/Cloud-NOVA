import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cloudnova.app',
  appName: 'Cloud Nova',
  webDir: 'build',
  server: {
    url: process.env.REACT_APP_API_URL || 'https://clooudnova.up.railway.app',
    cleartext: false,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false
  }
};

export default config;
