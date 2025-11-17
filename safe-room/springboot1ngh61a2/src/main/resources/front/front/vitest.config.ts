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
    setupFiles: ['./tests/setup/vitest.setup.ts'],
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
      lines: 30,
      functions: 30,
      branches: 25,
      statements: 30
    },
    all: false,
    skipFull: false,
  },
})