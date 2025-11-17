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

const DEFAULT_PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 8081
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${DEFAULT_PORT}`
const storageStatePath = path.resolve(__dirname, 'tests/.auth/admin-user.json')

function storageState() {
  if (fs.existsSync(storageStatePath)) {
    return storageStatePath
  }
  return undefined
}

// 智能超时配置函数
function getTimeoutConfig(testInfo: any) {
  const testName = testInfo.title.toLowerCase();

  // 根据测试名称动态调整超时时间
  if (testName.includes('login') || testName.includes('auth')) {
    return { test: 45_000, action: 10_000, navigation: 20_000 };
  } else if (testName.includes('management') || testName.includes('admin')) {
    return { test: 80_000, action: 20_000, navigation: 40_000 };
  } else if (testName.includes('upload') || testName.includes('download')) {
    return { test: 90_000, action: 30_000, navigation: 45_000 };
  } else if (testName.includes('complex') || testName.includes('workflow')) {
    return { test: 120_000, action: 25_000, navigation: 60_000 };
  } else {
    // 默认配置
    return { test: 60_000, action: 15_000, navigation: 30_000 };
  }
}

export default defineConfig({
  testDir: path.resolve(__dirname, 'tests/e2e'),
  // 使用专门的TypeScript配置
  // tsconfig: path.resolve(__dirname, 'playwright.tsconfig.json'),
  fullyParallel: process.env.E2E_PARALLEL === 'true' ? true : false, // 根据环境变量控制是否并行，默认串行（适合笔记本）
  timeout: 60_000, // 默认测试超时时间
  expect: {
    timeout: 15_000, // 断言超时时间
  },
  workers: process.env.CI ? 2 : 4, // 控制并发worker数量，避免资源过度竞争
  // 避免与vitest的冲突
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { outputFolder: 'playwright-report' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: storageState(),
    actionTimeout: 15_000, // 默认操作超时时间
    navigationTimeout: 30_000, // 默认导航超时时间

    // 增强的智能等待配置
    waitFor: {
      // 等待网络空闲的超时时间
      networkIdle: 8000,
      // 等待DOM稳定的超时时间
      domContentLoaded: 8000,
    },

    // 添加智能重试和超时配置
    retry: {
      delay: 1000, // 重试间隔1秒
      maxRetries: 2, // 最大重试次数
    },

    // 性能监控配置
    performance: {
      enabled: true,
      collectMetrics: true,
      collectTraces: true,
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
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // 全局测试钩子
  globalSetup: path.resolve(__dirname, 'tests/setup/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'tests/setup/global-teardown.ts'),

  // 测试执行监控
  metadata: {
    execution: {
      startTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      version: process.env.npm_package_version || 'unknown',
    },
  },
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
