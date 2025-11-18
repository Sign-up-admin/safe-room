import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

function publicPath() {
  if (process.env.NODE_ENV === 'production') {
    return './'
  } else {
    return '/'
  }
}

const isProd = process.env.NODE_ENV === 'production'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => /^(radialgradient|lineargradient|radialGradient|linearGradient)$/i.test(tag),
        },
      },
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true,
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    dedupe: ['vue', 'vue-demi'],
  },
  base: publicPath(),
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'], // 静默 legacy-js-api 弃用警告
      },
    },
  },
  optimizeDeps: {
    exclude: ['vue-demi'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8082,
    proxy: {
      '/springboot1ngh61a2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // 不重写路径，保持 /springboot1ngh61a2 前缀
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: !isProd,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks: (id) => {
          // Vue生态系统
          if (id.includes('node_modules/vue') ||
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/pinia') ||
              id.includes('node_modules/@vue')) {
            return 'vue-vendor';
          }

          // Element Plus
          if (id.includes('node_modules/element-plus') ||
              id.includes('node_modules/@element-plus')) {
            return 'element-plus';
          }

          // 工具库
          if (id.includes('node_modules/lodash') ||
              id.includes('node_modules/dayjs') ||
              id.includes('node_modules/axios') ||
              id.includes('node_modules/qs')) {
            return 'utils';
          }

          // 大页面组件拆分
          if (id.includes('src/pages/booking') ||
              id.includes('src/pages/list') ||
              id.includes('src/components/booking')) {
            return 'booking';
          }

          if (id.includes('src/pages/membership') ||
              id.includes('src/components/membership')) {
            return 'membership';
          }

          if (id.includes('src/pages/chat') ||
              id.includes('src/components/discussion')) {
            return 'chat';
          }

          // 其他第三方库
          if (id.includes('node_modules')) {
            return 'vendor';
          }

          // 业务代码保持在主chunk中
          return 'main';
        },
      },
    },
  },
})

