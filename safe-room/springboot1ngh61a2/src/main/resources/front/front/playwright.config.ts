import { defineConfig, devices } from '@playwright/test'
import { config as loadEnv } from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// 避免vitest与playwright的冲突
process.env.VITEST = 'false'
process.env.NODE_ENV = 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

loadEnv({ path: path.resolve(__dirname, '.env') })

const DEFAULT_PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 8082
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${DEFAULT_PORT}`
const storageStatePath = path.resolve(__dirname, 'tests/.auth/front-user.json')

function storageState() {
  if (fs.existsSync(storageStatePath)) {
    return storageStatePath
  }
  return undefined
}

export default defineConfig({
  testDir: path.resolve(__dirname, 'tests/e2e'),
  fullyParallel: false,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: process.env.CI ? [['github'], ['html', { outputFolder: 'playwright-report' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: storageState(),
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
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : {
        command: process.env.CI
          ? 'npm run build && npm run preview -- --host 0.0.0.0 --port ' + DEFAULT_PORT
          : `npm run dev -- --host 0.0.0.0 --port ${DEFAULT_PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: 'pipe',
        stderr: 'pipe',
      },
})


