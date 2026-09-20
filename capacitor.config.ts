import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.signmind.app',
  appName: 'SIGNMIND',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
