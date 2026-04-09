import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  /* Run tests in parallel across files */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  /* Use multiple workers for parallel execution */
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? 'github' : 'html',
  /* Fast timeout — if page doesn't load in 5s, something is wrong */
  timeout: 10_000,

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    navigationTimeout: 5_000,
  },

  projects: [
    {
      name: 'Desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Tablet',
      use: {
        ...devices['iPad Pro 11'],
      },
    },
    {
      name: 'Mobile',
      use: {
        ...devices['iPhone 14'],
      },
    },
  ],

  /* Auto-start dev server for local and CI */
  webServer: {
    command: process.env.CI ? 'pnpm start' : 'pnpm dev:fast',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
