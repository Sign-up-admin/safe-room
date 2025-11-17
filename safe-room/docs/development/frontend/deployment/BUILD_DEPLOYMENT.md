---
title: BUILD DEPLOYMENT
version: v1.0.0
last_updated: 2025-11-16
status: active
category: development
tags: [frontend, deployment, build, ci-cd]
---

# Front前端构建部署指南

> **版本**：v1.0.0
> **更新日期**：2025-11-16
> **适用范围**：Front前端项目的构建和部署流程
> **关键词**：构建部署, 前端, CI/CD, 自动化

---

## 📋 目录

- [概述](#概述)
- [构建流程](#构建流程)
- [环境配置](#环境配置)
- [部署策略](#部署策略)
- [监控告警](#监控告警)
- [回滚策略](#回滚策略)
- [性能优化](#性能优化)

---

## 📖 概述

### 构建目标

- **自动化构建**：集成到CI/CD流程
- **多环境支持**：开发、测试、生产环境
- **性能优化**：代码分割、压缩、缓存
- **质量保证**：构建时质量检查

### 技术栈

- **构建工具**：Vite 4.x
- **CI/CD**：GitHub Actions
- **部署平台**：Vercel/Netlify 或 Docker + Nginx
- **监控工具**：Sentry + Vercel Analytics

---

## 🔨 构建流程

### 本地构建

#### 开发环境构建

```bash
# 安装依赖
npm ci

# 开发服务器
npm run dev

# 开发构建（带source map）
npm run build:dev
```

#### 生产环境构建

```bash
# 生产构建
npm run build

# 构建产物位于 dist/ 目录
ls -la dist/
```

### 构建配置

#### Vite配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus'],
          utils: ['axios', 'vueuse']
        }
      }
    }
  }
})
```

#### 环境变量配置

```bash
# .env.production
VITE_API_BASE_URL=https://api.gym.com
VITE_APP_ENV=production
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 构建优化

#### 代码分割

```typescript
// 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/courses',
    component: () => import('@/views/Courses.vue')
  }
]
```

#### Bundle分析

```bash
# 安装bundle分析器
npm install --save-dev rollup-plugin-visualizer

# 生成分析报告
npm run build -- --mode analyze
```

---

## 🌍 环境配置

### 多环境配置

#### 环境定义

| 环境 | 用途 | 域名 | 特点 |
|------|------|------|------|
| **开发** | 开发调试 | localhost:5173 | 热重载，调试信息 |
| **测试** | 集成测试 | test.gym.com | 与测试API集成 |
| **预发布** | 用户验收 | staging.gym.com | 生产环境镜像 |
| **生产** | 用户使用 | gym.com | 优化配置，监控完整 |

#### 环境变量

```typescript
// src/config/env.ts
export const config = {
  development: {
    apiBaseUrl: 'http://localhost:8080',
    enableDebug: true,
    logLevel: 'debug'
  },
  test: {
    apiBaseUrl: 'https://api-test.gym.com',
    enableDebug: false,
    logLevel: 'info'
  },
  staging: {
    apiBaseUrl: 'https://api-staging.gym.com',
    enableDebug: false,
    logLevel: 'warn'
  },
  production: {
    apiBaseUrl: 'https://api.gym.com',
    enableDebug: false,
    logLevel: 'error'
  }
}

export const currentConfig = config[import.meta.env.MODE || 'development']
```

---

## 🚀 部署策略

### 静态部署

#### Vercel部署

```javascript
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### Netlify部署

```yaml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Docker部署

#### Dockerfile

```dockerfile
# 多阶段构建
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 生产镜像
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx配置

```nginx
# nginx.conf
events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;

  server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_types text/css application/javascript application/json;

    # 缓存策略
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }

    # SPA路由处理
    location / {
      try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
      proxy_pass http://backend:8080;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
}
```

### CI/CD流程

#### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📊 监控告警

### 性能监控

#### Vercel Analytics

```typescript
// src/plugins/analytics.ts
import { inject } from '@vercel/analytics'

export const setupAnalytics = () => {
  if (import.meta.env.PROD) {
    inject()
  }
}
```

#### Sentry错误监控

```typescript
// src/plugins/sentry.ts
import * as Sentry from '@sentry/vue'

export const setupSentry = (app: App) => {
  if (import.meta.env.PROD) {
    Sentry.init({
      app,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay()
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0
    })
  }
}
```

### 健康检查

#### 应用健康检查

```typescript
// src/utils/health.ts
export const checkAppHealth = async () => {
  try {
    const response = await fetch('/health')
    return response.ok
  } catch {
    return false
  }
}
```

#### 部署健康检查

```bash
# 部署后检查
curl -f https://gym.com/health || exit 1
```

### 告警配置

#### 错误告警

- Sentry错误率 > 5%
- API响应时间 > 3秒
- JavaScript错误数量激增

#### 性能告警

- First Contentful Paint > 2秒
- Largest Contentful Paint > 4秒
- Cumulative Layout Shift > 0.25

---

## 🔄 回滚策略

### 快速回滚

#### Vercel回滚

```bash
# 查看部署历史
vercel deployments ls

# 回滚到指定版本
vercel rollback <deployment-id>
```

#### Git回滚

```bash
# 创建回滚提交
git revert HEAD

# 强制推送（谨慎使用）
git push --force-with-lease
```

### 渐进式回滚

#### 蓝绿部署

```nginx
# nginx配置实现蓝绿部署
upstream blue {
  server blue-app:3000;
}

upstream green {
  server green-app:3000;
}

# 根据cookie路由到不同版本
split_clients $cookie_version $upstream {
  90% blue;
  10% green;
}
```

#### 金丝雀部署

```yaml
# Kubernetes配置
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: gym-ingress
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"
```

### 回滚检查清单

- [ ] 确认问题原因
- [ ] 通知相关团队
- [ ] 准备回滚方案
- [ ] 执行回滚操作
- [ ] 验证回滚结果
- [ ] 监控系统状态
- [ ] 总结问题原因

---

## ⚡ 性能优化

### 构建时优化

#### 代码分割策略

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 第三方库
          if (id.includes('node_modules')) {
            if (id.includes('vue')) return 'vue-vendor'
            if (id.includes('element-plus')) return 'ui-vendor'
            return 'vendor'
          }

          // 业务代码
          if (id.includes('src/views')) return 'views'
          if (id.includes('src/components')) return 'components'
        }
      }
    }
  }
})
```

#### 资源优化

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true
    })
  ],
  build: {
    assetsInlineLimit: 4096, // 小于4kb的资源内联
    chunkSizeWarningLimit: 1000, // 包大小警告阈值
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true
      }
    }
  }
})
```

### 运行时优化

#### 懒加载

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)
</script>

<template>
  <HeavyComponent v-if="showHeavy" />
</template>
```

#### 图片优化

```vue
<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const imgRef = ref<HTMLImageElement>()
const isVisible = ref(false)

useIntersectionObserver(imgRef, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    isVisible.value = true
  }
})
</script>

<template>
  <img
    ref="imgRef"
    v-if="isVisible"
    :src="imageSrc"
    loading="lazy"
    decoding="async"
  />
</template>
```

### CDN优化

#### 静态资源CDN

```typescript
// vite.config.ts
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? 'https://cdn.gym.com/' : '/',
  build: {
    assetsDir: 'assets',
    outDir: 'dist'
  }
})
```

#### 动态CDN

```html
<!-- index.html -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script src="https://unpkg.com/vue-router@4/dist/vue-router.global.js"></script>
```

---

## 📊 部署指标

### 性能指标

| 指标 | 目标值 | 监控工具 |
|------|--------|----------|
| First Contentful Paint | < 1.5秒 | Lighthouse |
| Largest Contentful Paint | < 2.5秒 | Lighthouse |
| First Input Delay | < 100ms | Lighthouse |
| Bundle大小 | < 500KB | Bundle Analyzer |

### 可用性指标

| 指标 | 目标值 | 监控工具 |
|------|--------|----------|
| 正常运行时间 | > 99.9% | Vercel Status |
| API响应时间 | < 200ms | Vercel Analytics |
| 错误率 | < 0.1% | Sentry |

---

## 📚 相关链接

- [开发环境搭建](../guides/DEVELOPMENT_SETUP.md)
- [测试策略](../testing/TESTING_STRATEGY.md)
- [CI/CD指南](../guides/CI_CD_GUIDE.md)

---

**最后更新**：2025-11-16
**维护责任人**：DevOps团队
**联系方式**：devops@company.com

