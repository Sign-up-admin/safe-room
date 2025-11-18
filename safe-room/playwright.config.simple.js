const { defineConfig, devices } = require('@playwright/test')
const path = require('path')

const DEFAULT_PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 8082
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${DEFAULT_PORT}`

module.exports = defineConfig({
  testDir: 'springboot1ngh61a2/src/main/resources/front/front/tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 20_000,
  },
  workers: 1, // 串行运行，适合笔记本
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // webServer disabled - server started manually
})
