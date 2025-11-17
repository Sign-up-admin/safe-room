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

// 智能超时配置函数
function getTimeoutConfig(testInfo: any) {
  const testName = testInfo.title.toLowerCase();

  // 根据测试名称动态调整超时时间
  if (testName.includes('login') || testName.includes('auth')) {
    return { test: 45_000, action: 10_000, navigation: 20_000 };
  } else if (testName.includes('search') || testName.includes('filter')) {
    return { test: 40_000, action: 8_000, navigation: 15_000 };
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
  fullyParallel: process.env.E2E_PARALLEL === 'true' ? true : false, // 根据环境变量控制是否并行，默认串行（适合笔记本）
  timeout: 90_000, // 进一步增加复杂流程的测试超时时间，支持智能等待
  expect: {
    timeout: 20_000, // 增加断言超时时间
  },
  workers: process.env.CI ? 3 : 6, // 控制并发worker数量，用户前端测试较多，允许更多并发
  reporter: process.env.CI ? [['github'], ['html', { outputFolder: 'playwright-report' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: storageState(),
    actionTimeout: 20_000, // 增加操作超时时间，支持复杂交互和重试
    navigationTimeout: 45_000, // 增加导航超时时间，支持慢速网络和重试

    // 增强的智能等待配置
    waitFor: {
      // 等待网络空闲的超时时间（增加以支持慢速网络）
      networkIdle: 12000,
      // 等待DOM稳定的超时时间
      domContentLoaded: 10000,
    },

    // 添加智能重试和超时配置
    retry: {
      delay: 2000, // 增加重试间隔，避免频繁重试
      maxRetries: 3, // 增加最大重试次数，提高成功率
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
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),

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


