import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [resolve(__dirname, 'src/icons/svg')],
      symbolId: 'icon-[name]',
      inject: 'body-last',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@/constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
      '@/stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/views': fileURLToPath(new URL('./src/views', import.meta.url)),
      '@/types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@/assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url)),
      '#': fileURLToPath(new URL('./src/types', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['tests/setup/vitest.setup.ts'],
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts'
      // E2E tests are handled by Playwright, not Vitest
    ],
    // 解决测试挂起问题
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        useAtomics: true
      }
    },
    // 添加 Vue 组件测试配置
    css: false,
    server: {
      deps: {
        inline: ['element-plus', 'parse5', '@vue/test-utils', 'jsdom']
      }
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      // 完全排除front项目的任何文件
      '**/*front*/**',
      '**/front/**',
      '**/target/**',
      // 排除编译产物测试
      '**/target/classes/**',
      'target/classes/**',
      '../../**/target/classes/**',
      '../../../**/target/classes/**',
      '../**/target/classes/**',
      // 排除其他项目目录
      '../../**/front/**',
      '../../../**/front/**',
      '../**/front/**',
      'springboot1ngh61a2/**/front/**',
      'src/**/front/**',
      'target/**/front/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx,js,jsx,vue}'],
      exclude: [
        'src/main.ts',
        'src/main.js',
        'src/router/**',
        'src/**/__tests__/**',
        'src/**/*.d.ts',
        'src/**/types/**',
        'src/**/*.config.{ts,js}',
        'src/**/env.d.ts',
        '**/*.spec.{ts,js}',
        '**/*.test.{ts,js}',
        '**/tests/**',
        '**/*.config.{js,ts}',
      ],
      // 渐进式阈值策略：当前最低阈值80%，目标阈值100%
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
        // 100% 覆盖率目标（长期目标，当前不强制）
        // 可以通过逐步提升thresholds来达到
      },
      // 启用覆盖率阈值检查
      all: false,
      // 显示未覆盖的行
      skipFull: false,
    },
    // 浏览器测试配置（可选，用于 E2E 测试）
    // browser: {
    //   enabled: true,
    //   headless: true,
    //   provider: 'playwright',
    //   name: 'chromium'
    // }
  },
  // 测试环境优化
  optimizeDeps: {
    exclude: ['vue-demi']
  },
  // 定义测试环境变量
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    // 处理 import.meta.url 在测试环境中的问题
    'import.meta.url': 'new URL("file://" + process.cwd() + "/").href',
    // Element Plus 组件全局 mock
    'process.env.VITE_APP_BASE_API': '"/api"',
    'process.env.VITE_APP_ENV': '"test"'
  },
  esbuild: {
    loader: 'ts',
    include: /\.(ts|tsx|js|jsx)$/,
    exclude: /\.vue$/,
  },
})
