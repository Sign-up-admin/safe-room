# Admin 前端部署指南

> 版本：v1.0
> 更新日期：2025-11-16
> 适用项目：`springboot1ngh61a2/src/main/resources/admin/admin`

---

## 目录

- [1. 概述](#1-概述)
- [2. 构建准备](#2-构建准备)
- [3. 本地构建](#3-本地构建)
- [4. 服务器部署](#4-服务器部署)
  - [4.1 Nginx 部署](#41-nginx-部署)
  - [4.2 Apache 部署](#42-apache-部署)
  - [4.3 Docker 部署](#43-docker-部署)
- [5. 云服务部署](#5-云服务部署)
  - [5.1 AWS S3 + CloudFront](#51-aws-s3--cloudfront)
  - [5.2 阿里云 OSS + CDN](#52-阿里云-oss--cdn)
  - [5.3 Vercel 部署](#53-vercel-部署)
- [6. CI/CD 集成](#6-cicd-集成)
  - [6.1 GitHub Actions](#61-github-actions)
  - [6.2 Jenkins 部署](#62-jenkins-部署)
- [7. 环境配置](#7-环境配置)
- [8. 性能优化](#8-性能优化)
- [9. 监控和维护](#9-监控和维护)
- [10. 故障排除](#10-故障排除)
- [11. 附录](#11-附录)

---

## 1. 概述

本文档详细介绍 Admin 前端的构建、打包和部署流程，涵盖从开发环境到生产环境的完整部署方案。

### 1.1 部署架构

```
开发环境 (Development)
    ↓
本地构建 (Build)
    ↓
测试环境 (Staging)
    ↓
生产环境 (Production)
```

### 1.2 支持的部署方式

- **传统服务器**: Nginx, Apache
- **云服务**: AWS S3, 阿里云 OSS, Vercel
- **容器化**: Docker
- **CI/CD**: GitHub Actions, Jenkins

### 1.3 前置条件

- Node.js >= 16.0.0
- npm >= 8.0.0
- Git >= 2.0.0
- 服务器权限（部署时）

---

## 2. 构建准备

### 2.1 环境变量配置

创建生产环境配置文件：

```bash
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/springboot1ngh61a2
VITE_APP_TITLE=健身房管理系统
VITE_APP_ENV=production
```

### 2.2 依赖检查

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 安装依赖
npm ci --production=false
```

### 2.3 代码检查

```bash
# TypeScript 类型检查
npm run type-check

# 代码规范检查
npm run check

# 单元测试
npm run test:unit

# 构建测试
npm run build
```

---

## 3. 本地构建

### 3.1 标准构建流程

```bash
# 1. 清理缓存
rm -rf node_modules/.vite dist

# 2. 安装依赖
npm ci

# 3. 构建生产版本
npm run build

# 4. 预览构建结果
npm run preview
```

### 3.2 构建产物说明

构建完成后会在 `dist/` 目录生成以下文件：

```
dist/
├── assets/
│   ├── css/
│   │   ├── element-plus-*.css    # Element Plus 样式
│   │   ├── index-*.css           # 应用样式
│   │   └── vendor-*.css          # 第三方样式
│   ├── js/
│   │   ├── element-plus-*.js     # Element Plus 组件
│   │   ├── index-*.js            # 应用主文件
│   │   ├── vendor-*.js           # 第三方库
│   │   └── vue-vendor-*.js       # Vue 相关库
│   ├── img/                      # 图片资源
│   └── fonts/                    # 字体文件
├── lunar/                        # 农历组件
├── verifys/                      # 验证码组件
├── favicon.ico                   # 网站图标
└── index.html                    # 入口文件
```

### 3.3 构建配置优化

**vite.config.ts** 关键配置：

```typescript
export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,

    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',

        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus')) return 'element-plus'
            if (id.includes('echarts')) return 'echarts'
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue-vendor'
            }
            return 'vendor'
          }
        }
      }
    }
  }
})
```

---

## 4. 服务器部署

### 4.1 Nginx 部署

#### 4.1.1 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx

# macOS (使用 Homebrew)
brew install nginx
```

#### 4.1.2 配置 Nginx

创建配置文件 `/etc/nginx/sites-available/admin`:

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;
    root /var/www/admin/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # 缓存策略
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /springboot1ngh61a2 {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # 错误页面
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
}
```

#### 4.1.3 部署步骤

```bash
# 1. 创建目录
sudo mkdir -p /var/www/admin

# 2. 上传构建文件
scp -r dist/* user@server:/var/www/admin/

# 3. 设置权限
sudo chown -R www-data:www-data /var/www/admin
sudo chmod -R 755 /var/www/admin

# 4. 启用配置
sudo ln -s /etc/nginx/sites-available/admin /etc/nginx/sites-enabled/

# 5. 测试配置
sudo nginx -t

# 6. 重启 Nginx
sudo systemctl restart nginx
```

#### 4.1.4 SSL 配置 (HTTPS)

```nginx
server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate /etc/ssl/certs/admin.yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/admin.yourdomain.com.key;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 其他配置同上...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name admin.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 4.2 Apache 部署

#### 4.2.1 安装 Apache

```bash
# Ubuntu/Debian
sudo apt install apache2

# CentOS/RHEL
sudo yum install httpd
```

#### 4.2.2 配置 Apache

创建配置文件 `/etc/apache2/sites-available/admin.conf`:

```apache
<VirtualHost *:80>
    ServerName admin.yourdomain.com
    DocumentRoot /var/www/admin/dist

    # SPA 路由支持
    <Directory /var/www/admin/dist>
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # API 代理
    ProxyPass /springboot1ngh61a2 http://localhost:8080/springboot1ngh61a2
    ProxyPassReverse /springboot1ngh61a2 http://localhost:8080/springboot1ngh61a2

    # 缓存设置
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/svg+xml "access plus 1 year"
    </IfModule>

    # 安全设置
    Header always set X-Frame-Options SAMEORIGIN
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"

    ErrorDocument 404 /index.html
</VirtualHost>
```

#### 4.2.3 启用模块并部署

```bash
# 启用必要模块
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod expires

# 启用站点
sudo a2ensite admin

# 重启 Apache
sudo systemctl restart apache2
```

### 4.3 Docker 部署

#### 4.3.1 创建 Dockerfile

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产镜像
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### 4.3.2 创建 nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # SPA 路由支持
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API 代理（如果需要）
        location /springboot1ngh61a2 {
            proxy_pass http://host.docker.internal:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

#### 4.3.3 构建和运行

```bash
# 构建镜像
docker build -t admin-frontend .

# 运行容器
docker run -d \
  --name admin-frontend \
  -p 80:80 \
  admin-frontend

# 查看日志
docker logs admin-frontend
```

#### 4.3.4 Docker Compose

```yaml
version: '3.8'

services:
  admin-frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  admin-backend:
    image: your-backend-image
    ports:
      - "8080:8080"
    depends_on:
      - admin-frontend
```

---

## 5. 云服务部署

### 5.1 AWS S3 + CloudFront

#### 5.1.1 上传到 S3

```bash
# 安装 AWS CLI
pip install awscli

# 配置 AWS 凭据
aws configure

# 创建 S3 存储桶
aws s3 mb s3://your-admin-bucket

# 上传文件
aws s3 sync dist/ s3://your-admin-bucket --delete

# 设置公共读取权限
aws s3 website s3://your-admin-bucket --index-document index.html --error-document index.html
```

#### 5.1.2 配置 CloudFront

1. 创建 CloudFront 发行版
2. 设置源域名为 S3 存储桶
3. 配置缓存行为
4. 设置自定义错误页面

#### 5.1.3 自动化部署脚本

```bash
#!/bin/bash
# deploy-to-aws.sh

# 构建应用
npm run build

# 上传到 S3
aws s3 sync dist/ s3://your-admin-bucket --delete

# 使更改生效
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### 5.2 阿里云 OSS + CDN

#### 5.2.1 安装 OSS 工具

```bash
# 安装 ossutil
wget http://gosspublic.alicdn.com/ossutil/1.7.8/ossutil64
chmod 755 ossutil64
sudo mv ossutil64 /usr/local/bin/ossutil
```

#### 5.2.2 配置和上传

```bash
# 配置 OSS
ossutil config

# 上传文件
ossutil sync dist/ oss://your-bucket/admin/

# 设置静态网站托管
ossutil website --index index.html --error index.html oss://your-bucket
```

#### 5.2.3 配置 CDN

1. 在阿里云 CDN 控制台创建加速域名
2. 设置源站为 OSS 存储桶
3. 配置缓存规则
4. 设置 HTTPS 证书

### 5.3 Vercel 部署

#### 5.3.1 安装 Vercel CLI

```bash
npm i -g vercel
```

#### 5.3.2 配置部署

创建 `vercel.json`:

```json
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
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-api-domain.com/api/$1"
    }
  ]
}
```

#### 5.3.3 部署命令

```bash
# 登录 Vercel
vercel login

# 部署
vercel --prod

# 查看部署状态
vercel ls
```

---

## 6. CI/CD 集成

### 6.1 GitHub Actions

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy Admin Frontend

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm run test:unit

    - name: Build application
      run: npm run build
      env:
        VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
        VITE_APP_TITLE: ${{ secrets.VITE_APP_TITLE }}

    - name: Deploy to production
      if: github.ref == 'refs/heads/main'
      run: |
        # 部署到服务器或云服务
        echo "Deploying to production..."
        # 添加你的部署命令
```

### 6.2 Jenkins 部署

#### 6.2.1 创建 Jenkins 任务

```groovy
pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        DEPLOY_PATH = '/var/www/admin'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-org/admin-frontend.git'
            }
        }

        stage('Setup Node.js') {
            steps {
                sh 'curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -'
                sh 'sudo apt-get install -y nodejs'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test:unit'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    sudo rm -rf ${DEPLOY_PATH}/*
                    sudo cp -r dist/* ${DEPLOY_PATH}/
                    sudo chown -R www-data:www-data ${DEPLOY_PATH}
                    sudo systemctl restart nginx
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
```

---

## 7. 环境配置

### 7.1 环境变量

#### 开发环境 (.env.development)

```bash
VITE_API_BASE_URL=http://localhost:8080/springboot1ngh61a2
VITE_APP_TITLE=健身房管理系统 (开发版)
VITE_APP_ENV=development
VITE_DEBUG=true
```

#### 测试环境 (.env.staging)

```bash
VITE_API_BASE_URL=https://staging-api.yourdomain.com/springboot1ngh61a2
VITE_APP_TITLE=健身房管理系统 (测试版)
VITE_APP_ENV=staging
```

#### 生产环境 (.env.production)

```bash
VITE_API_BASE_URL=https://api.yourdomain.com/springboot1ngh61a2
VITE_APP_TITLE=健身房管理系统
VITE_APP_ENV=production
```

### 7.2 运行时配置

```typescript
// src/config/index.ts
export const config = {
  development: {
    apiBaseUrl: 'http://localhost:8080/springboot1ngh61a2',
    title: '健身房管理系统 (开发版)',
    debug: true,
  },
  staging: {
    apiBaseUrl: 'https://staging-api.yourdomain.com/springboot1ngh61a2',
    title: '健身房管理系统 (测试版)',
    debug: false,
  },
  production: {
    apiBaseUrl: 'https://api.yourdomain.com/springboot1ngh61a2',
    title: '健身房管理系统',
    debug: false,
  },
}

export const currentConfig = config[import.meta.env.VITE_APP_ENV as keyof typeof config] || config.production
```

---

## 8. 性能优化

### 8.1 构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus'],
          utils: ['axios', 'dayjs', 'lodash-es'],
        },
      },
    },
  },
})
```

### 8.2 资源优化

```typescript
// 图片压缩
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [{ removeViewBox: false }],
      },
    }),
  ],
})
```

### 8.3 缓存策略

```nginx
# Nginx 缓存配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Cache-Status $upstream_cache_status;
}

# API 缓存
location /api/ {
    proxy_cache my_cache;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    proxy_cache_valid 200 10m;
    proxy_cache_valid 404 1m;
}
```

---

## 9. 监控和维护

### 9.1 应用监控

#### 性能监控

```typescript
// src/utils/performance.ts
export const initPerformanceMonitoring = () => {
  // Core Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log)
    getFID(console.log)
    getFCP(console.log)
    getLCP(console.log)
    getTTFB(console.log)
  })

  // 错误监控
  window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error)
    // 发送错误报告到监控服务
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    // 发送错误报告
  })
}
```

#### 健康检查

```typescript
// 健康检查端点
export const healthCheck = async () => {
  try {
    const response = await http.get('/health')
    return response.data.status === 'ok'
  } catch (error) {
    console.error('Health check failed:', error)
    return false
  }
}
```

### 9.2 日志配置

```typescript
// src/utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, data)
    }
    // 发送日志到服务
  },

  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error)
    // 发送错误日志
  },

  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data)
  },
}
```

### 9.3 备份策略

```bash
#!/bin/bash
# backup.sh

# 创建备份目录
BACKUP_DIR="/var/backups/admin-frontend"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份应用文件
tar -czf $BACKUP_DIR/admin-frontend_$DATE.tar.gz /var/www/admin

# 备份配置文件
cp /etc/nginx/sites-available/admin $BACKUP_DIR/nginx_config_$DATE

# 清理旧备份（保留7天）
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "nginx_config_*" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/admin-frontend_$DATE.tar.gz"
```

---

## 10. 故障排除

### 10.1 常见部署问题

#### 问题1: 构建失败

```bash
# 检查 Node.js 版本
node --version

# 检查依赖
npm ls --depth=0

# 清理缓存
rm -rf node_modules/.vite
npm run build
```

#### 问题2: 404错误

```nginx
# 检查 Nginx 配置
sudo nginx -t

# 检查文件权限
ls -la /var/www/admin/

# 检查重写规则
curl -I http://yourdomain.com/some-page
```

#### 问题3: API调用失败

```bash
# 检查后端服务状态
curl http://localhost:8080/springboot1ngh61a2/health

# 检查防火墙
sudo ufw status

# 检查代理配置
curl http://yourdomain.com/springboot1ngh61a2/health
```

#### 问题4: HTTPS证书问题

```bash
# 检查证书有效期
openssl x509 -in /etc/ssl/certs/admin.crt -text -noout | grep "Not"

# 续订证书 (Let's Encrypt)
sudo certbot renew

# 重启服务
sudo systemctl restart nginx
```

### 10.2 性能问题排查

```bash
# 检查系统资源
top
free -h
df -h

# 检查 Nginx 状态
sudo systemctl status nginx

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 性能分析
curl -w "@curl-format.txt" -o /dev/null -s http://yourdomain.com
```

### 10.3 回滚策略

```bash
#!/bin/bash
# rollback.sh

# 停止服务
sudo systemctl stop nginx

# 恢复备份
BACKUP_FILE="/var/backups/admin-frontend/admin-frontend_20241115_120000.tar.gz"
sudo tar -xzf $BACKUP_FILE -C /var/www/

# 恢复配置
sudo cp /var/backups/admin-frontend/nginx_config_20241115_120000 /etc/nginx/sites-available/admin

# 检查配置
sudo nginx -t

# 启动服务
sudo systemctl start nginx

echo "Rollback completed"
```

---

## 11. 附录

### 11.1 部署检查清单

#### 构建前检查
- [ ] Node.js 版本 >= 16.0.0
- [ ] npm 版本 >= 8.0.0
- [ ] 所有测试通过
- [ ] 代码规范检查通过
- [ ] 环境变量配置正确

#### 部署前检查
- [ ] 服务器网络可达
- [ ] SSH 密钥配置正确
- [ ] 目标目录权限正确
- [ ] 备份策略已配置
- [ ] 监控告警已配置

#### 部署后检查
- [ ] 应用可正常访问
- [ ] API 接口正常
- [ ] 静态资源加载正常
- [ ] HTTPS 证书有效
- [ ] 性能监控正常

### 11.2 服务器要求

| 组件 | 最低要求 | 推荐配置 |
|------|----------|----------|
| CPU | 1 核心 | 2 核心 |
| 内存 | 1GB | 2GB |
| 存储 | 10GB | 50GB SSD |
| 网络 | 1Mbps | 10Mbps |

### 11.3 安全配置

#### Nginx 安全头

```nginx
# 安全头配置
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

#### 防火墙配置

```bash
# UFW 配置
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 11.4 监控命令

```bash
# 系统监控
htop
iotop
nmon

# 应用监控
sudo journalctl -u nginx -f
sudo journalctl -u admin-backend -f

# 网络监控
ss -tuln
netstat -tuln

# 磁盘监控
du -sh /var/www/admin
df -h
```

---

**文档维护者**: 开发团队
**最后更新**: 2025-11-16
**版本**: v1.0
