import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cloudnova.app',
  appName: 'Cloud Nova',
  webDir: 'build',
  server: {
    url: 'https://cloudyyy.up.railway.app',
    cleartext: false
  }
};

export default config;
