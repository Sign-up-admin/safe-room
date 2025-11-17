/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 兼容 Vue 3
        }
      }
    })
  ],
  optimizeDeps: {
    exclude: ['@vite/client', '@vite/env']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/vitest.setup.ts', './tests/setup/performance.setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/target/**',
      '**/dist/**',
      'tests/e2e/**',
      '**/target/classes/**',
      'target/classes/**',
      '../../**/target/classes/**',
      '../../../**/target/classes/**',
      '../**/target/classes/**'
    ],
    // 性能优化配置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4, // 根据CPU核心数调整
        useAtomics: true,
        isolate: true
      }
    },
    maxConcurrency: 3, // 降低并发限制，避免资源竞争
    fileParallelism: true,
    // 优化超时配置
    testTimeout: 15000, // 稍微增加以适应复杂测试
    hookTimeout: 10000,
    teardownTimeout: 5000,
    isolate: true,

    // 添加智能重试机制
    retry: 2, // 失败测试重试2次
    retryDelay: 1000, // 重试间隔1秒
    deps: {
      inline: [/@vue/],
    }
  },
  coverage: {
    provider: 'v8',
    reporter: ['text', 'lcov', 'html', 'json', 'json-summary'],
    reportsDirectory: './coverage',
    include: ['src/**/*.{ts,tsx,js,jsx,vue}'],
    exclude: [
      'src/main.ts',
      'src/router/**',
      'src/**/__tests__/**',
      'src/**/*.d.ts',
      'src/**/types/**',
      'src/**/*.config.{ts,js}',
      'src/**/env.d.ts',
      '**/*.spec.{ts,js}',
      '**/*.test.{ts,js}',
    ],
    thresholds: {
      lines: 85,
      functions: 85,
      branches: 80,
      statements: 85
    },
    all: false,
    skipFull: false,
  },
})