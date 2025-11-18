import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DEFAULT_PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 8082
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${DEFAULT_PORT}`

function storageState() {
  const storageStatePath = path.resolve(__dirname, 'tests/.auth/front-user.json')
  if (fs.existsSync(storageStatePath)) {
    return storageStatePath
  }
  return undefined
}

export default defineConfig({
  testDir: path.resolve(__dirname, 'tests/e2e'),
  timeout: 90_000,
  expect: {
    timeout: 20_000,
  },
  workers: process.env.CI ? 3 : 6,
  reporter: process.env.CI ? [['github'], ['html', { outputFolder: 'playwright-report' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: storageState(),
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    waitFor: {
      networkIdle: 12000,
      domContentLoaded: 10000,
    },
    retry: {
      delay: 2000,
      maxRetries: 3,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
})
