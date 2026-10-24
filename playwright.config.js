import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 720 } } },
    { name: 'phone-375', use: { viewport: { width: 375, height: 667 } } },
    { name: 'phone-landscape', use: { viewport: { width: 667, height: 375 } } }
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: 'msedge',
    headless: true
  },
  webServer: {
    command: 'node tests/e2e/static-server.js',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true
  }
});
