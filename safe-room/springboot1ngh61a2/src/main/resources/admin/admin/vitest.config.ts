import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve, join } from 'node:path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { fileURLToPath } from 'node:url'

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
    alias: [
      { find: '@', replacement: resolve(__dirname, 'src') },
      { find: '@/utils', replacement: resolve(__dirname, 'src/utils') },
      { find: '@/components', replacement: resolve(__dirname, 'src/components') },
      { find: '@/stores', replacement: resolve(__dirname, 'src/stores') },
      { find: '@/views', replacement: resolve(__dirname, 'src/views') },
      { find: '@/types', replacement: resolve(__dirname, 'src/types') },
      { find: '@/constants', replacement: resolve(__dirname, 'src/constants') },
      { find: '@/assets', replacement: resolve(__dirname, 'src/assets') },
    ],
  },
  // Add TypeScript path mapping for tests
  esbuild: {
    // Ensure ES modules work correctly
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['tests/setup/vitest.setup.ts', 'tests/setup/performance.setup.ts'],
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts'
      // E2E tests are handled by Playwright, not Vitest
    ],
    // 优化超时配置和性能
    testTimeout: 15000, // 降低超时，提高响应性
    hookTimeout: 10000,
    teardownTimeout: 5000,
    isolate: true,
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
    fileParallelism: true, // 保持文件级并行控制

    // 添加智能重试机制
    retry: 2, // 失败测试重试2次
    retryDelay: 1000, // 重试间隔1秒
    // 添加 Vue 组件测试配置
    css: false,
    server: {
      deps: {
        inline: [
          'element-plus',
          'parse5',
          '@vue/test-utils',
          'jsdom',
          'vue',
          'vue-router',
          'pinia',
          '@element-plus/icons-vue',
          '@vueup/vue-quill',
          'js-md5',
          'echarts-wordcloud',
          'quill',
          '@amap/amap-jsapi-loader',
          // Ensure path aliases work in tests
          'path'
        ]
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
    // Happy DOM 配置选项
    environmentOptions: {
      happyDom: {
        url: 'http://localhost:8081',
        settings: {
          disableCSSFileLoading: true,
          disableJavaScriptFileLoading: true,
          disableComputedStyleRendering: true,
          strict: false
        }
      }
    },
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
      // 渐进式阈值策略：当前最低阈值85%，目标阈值100%
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
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
