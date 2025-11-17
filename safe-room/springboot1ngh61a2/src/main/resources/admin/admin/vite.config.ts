import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// 设置环境变量以静默 Sass 弃用警告
if (!process.env.SASS_SILENCE_DEPRECATION) {
  process.env.SASS_SILENCE_DEPRECATION = 'legacy-js-api'
}

function publicPath() {
  if (process.env.NODE_ENV === 'production') {
    return './'
  } else {
    return '/'
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  build: {
    chunkSizeWarningLimit: 2000, // 增加块大小警告阈值为2MB
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks: (id) => {
          // 将 node_modules 中的大型库分离到单独的 chunk
          if (id.includes('node_modules')) {
            // Element Plus 单独打包
            if (id.includes('element-plus')) {
              return 'element-plus';
            }
            // Vue 相关库打包在一起
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue-vendor';
            }
            // 其他第三方库
            return 'vendor';
          }
        },
      },
    },
  },
  plugins: [
    AutoImport({
      // 只导入 Vue、Vue Router 和 Pinia，不使用 ElementPlusResolver 避免导入不存在的组件
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true,
    }),
    Components({
      // 移除 ElementPlusResolver，避免生成不存在组件的类型定义
      // Element Plus 组件通过全局注册使用
      resolvers: [],
      // 只扫描 src/components 目录中的自定义组件
      dirs: ['src/components'],
      dts: true,
    }),
    vue({
      // Vue 插件配置
      // Element Plus 组件会通过全局注册和 ElementPlusResolver 自动识别
    }),
    createSvgIconsPlugin({
      iconDirs: [resolve(__dirname, 'src/icons/svg')],
      symbolId: 'icon-[name]',
      inject: 'body-last',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    dedupe: ['vue', 'vue-demi'],
  },
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
  base: publicPath(),
  server: {
    host: '0.0.0.0',
    port: 8081,
    proxy: {
      '/springboot1ngh61a2': {
        target: 'http://localhost:8080/springboot1ngh61a2/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/springboot1ngh61a2/, ''),
      },
    },
  },
})

