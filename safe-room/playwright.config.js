const { defineConfig, devices } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

// 避免vitest与playwright的冲突
process.env.VITEST = 'false'
process.env.NODE_ENV = 'playwright'

const DEFAULT_PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 8082
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${DEFAULT_PORT}`

function storageState() {
  const storageStatePath = path.resolve(__dirname, 'tests/.auth/front-user.json')
  if (fs.existsSync(storageStatePath)) {
    return storageStatePath
  }
  return undefined
}

// 智能超时配置函数
function getTimeoutConfig(testInfo) {
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

module.exports = defineConfig({
  testDir: path.resolve(__dirname, 'tests/e2e'),
  fullyParallel: process.env.E2E_PARALLEL === 'true' ? true : false, // 根据环境变量控制是否并行，默认串行（适合笔记本）
  timeout: 90_000, // 进一步增加复杂流程的测试超时时间，支持智能等待
  expect: {
    timeout: 20_000, // 增加断言超时时间
  },
  workers: process.env.CI ? 3 : 6, // 控制并发worker数量，用户前端测试较多，允许更多并发
  reporter: process.env.CI ? [['github'], ['html', { outputFolder: 'playwright-report' }]] : [['list'], ['html', { open: 'never' }]],

  // Test filtering and grouping
  grep: process.env.TEST_GREP || /.*/,
  grepInvert: process.env.TEST_GREP_INVERT,

  // Test dependencies and retries with smart retry logic
  dependencies: ['setup'], // Run setup tests first

  // Enhanced expect configuration
  expect: {
    timeout: 20_000, // 增加断言超时时间
    toHaveScreenshot: {
      threshold: 0.1, // Allow 10% difference for visual regression
      maxDiffPixelRatio: 0.05, // Maximum diff pixel ratio
    },
  },
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
    // 桌面浏览器测试
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

    // 移动端浏览器测试
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'tablet-chrome',
      use: { ...devices['iPad Pro'] },
    },
    {
      name: 'tablet-safari',
      use: { ...devices['iPad'] },
    },

    // 兼容性测试（针对特定场景）
    {
      name: 'chromium-headless',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        // 专门用于CI环境的快速测试
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'chromium-slow-network',
      use: {
        ...devices['Desktop Chrome'],
        // 模拟慢速网络环境
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'],
        },
        contextOptions: {
          // 模拟3G网络速度
          permissions: [],
        },
      },
    },

    // 特定功能测试
    {
      name: 'accessibility',
      use: {
        ...devices['Desktop Chrome'],
        // 无障碍测试配置
        launchOptions: {
          args: ['--enable-accessibility-object-model'],
        },
      },
      testMatch: '**/*accessibility*.spec.ts',
    },
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
        // 性能测试配置
        launchOptions: {
          args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
        },
      },
      testMatch: '**/*performance*.spec.ts',
    },
  ],

  // 全局测试钩子
  globalSetup: path.resolve(__dirname, 'springboot1ngh61a2/src/main/resources/front/front/tests/setup/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'springboot1ngh61a2/src/main/resources/front/front/tests/setup/global-teardown.ts'),

  // 测试执行监控
  metadata: {
    execution: {
      startTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      version: process.env.npm_package_version || 'unknown',
    },
  },
  // webServer disabled for mock-based testing
  webServer: undefined,
})
