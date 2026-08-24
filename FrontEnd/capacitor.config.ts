import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cloudnova.app',
  appName: 'Cloud Nova',
  webDir: 'remote-shell',
  server: {
    url: 'https://clooudnova.up.railway.app',
    cleartext: false
  }
};

export default config;
