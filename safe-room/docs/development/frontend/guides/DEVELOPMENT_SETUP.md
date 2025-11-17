---
title: DEVELOPMENT SETUP
version: v1.0.0
last_updated: 2025-11-16
status: active
category: development
tags: [frontend, development, setup, environment]
---

# Front前端开发环境搭建指南

> **版本**：v1.0.0
> **更新日期**：2025-11-16
> **适用范围**：Front前端项目开发环境配置
> **关键词**：开发环境, 搭建指南, 前端, 配置

---

## 📋 目录

- [概述](#概述)
- [系统要求](#系统要求)
- [安装Node.js](#安装nodejs)
- [配置项目](#配置项目)
- [运行项目](#运行项目)
- [开发工具](#开发工具)
- [常见问题](#常见问题)

---

## 📖 概述

### 环境简介

Front前端项目基于Vue 3 + TypeScript + Vite构建，本指南将帮助您快速搭建开发环境。

### 前置条件

- 操作系统：Windows 10+ / macOS 10.15+ / Ubuntu 18.04+
- 内存：至少8GB RAM
- 磁盘空间：至少5GB可用空间

---

## 💻 系统要求

### 硬件要求

| 组件 | 最低配置 | 推荐配置 | 说明 |
|------|----------|----------|------|
| CPU | Intel Core i3 / AMD Ryzen 3 | Intel Core i5 / AMD Ryzen 5 | 支持SSE4.2指令集 |
| 内存 | 8GB | 16GB | Vue开发需要较多内存 |
| 存储 | 5GB SSD | 10GB SSD | 项目文件和node_modules |
| 显示器 | 1366x768 | 1920x1080 | 支持高DPI显示 |

### 软件要求

| 软件 | 版本 | 必需性 | 说明 |
|------|------|--------|------|
| Node.js | 18.0+ | ✅ 必需 | JavaScript运行环境 |
| npm | 8.0+ | ✅ 必需 | 包管理器（随Node.js安装） |
| Git | 2.30+ | ✅ 必需 | 版本控制 |
| VS Code | 1.70+ | 🔶 推荐 | 代码编辑器 |

---

## 🚀 安装Node.js

### Windows环境

#### 方法1：使用安装程序（推荐）

1. 访问[Node.js官网](https://nodejs.org/)
2. 下载LTS版本安装程序
3. 运行安装程序，选择默认选项
4. 验证安装：

```bash
node --version
npm --version
```

#### 方法2：使用包管理器

```bash
# 使用Chocolatey
choco install nodejs-lts

# 或使用winget
winget install OpenJS.NodeJS.LTS
```

### macOS环境

#### 方法1：使用Homebrew（推荐）

```bash
# 安装Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装Node.js
brew install node
```

#### 方法2：使用安装程序

1. 访问[Node.js官网](https://nodejs.org/)
2. 下载macOS安装程序
3. 运行安装程序

### Linux环境（Ubuntu/Debian）

```bash
# 使用NodeSource仓库
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 验证安装

运行以下命令验证Node.js和npm是否正确安装：

```bash
# 检查版本
node --version
npm --version

# 检查npm配置
npm config list

# 创建测试文件验证运行
echo 'console.log("Node.js工作正常！")' > test.js && node test.js && rm test.js
```

---

## ⚙️ 配置项目

### 克隆项目

```bash
# 克隆项目仓库
git clone <repository-url>
cd safe-room

# 进入前端项目目录
cd springboot1ngh61a2/src/main/resources/front/front
```

### 安装依赖

```bash
# 安装项目依赖
npm install

# 如果安装缓慢，可以使用国内镜像
npm config set registry https://registry.npmmirror.com

# 重新安装
npm install
```

### 环境配置

#### 1. 环境变量文件

复制环境配置文件：

```bash
# 复制环境变量模板
cp .env.example .env.local
```

编辑`.env.local`文件，配置以下变量：

```bash
# API基础URL
VITE_API_BASE_URL=http://localhost:8080

# 应用配置
VITE_APP_TITLE=健身房综合管理系统
VITE_APP_ENV=development

# 其他配置...
```

#### 2. IDE配置

##### VS Code推荐扩展

安装以下VS Code扩展以获得最佳开发体验：

```json
{
  "recommendations": [
    "vue.volar",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json",
    "christian-kohler.path-intellisense",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.npm-intellisense"
  ]
}
```

##### TypeScript配置

项目已配置TypeScript，如需自定义配置可以编辑`tsconfig.json`。

---

## ▶️ 运行项目

### 开发模式

```bash
# 启动开发服务器
npm run dev

# 或使用简写
npm start
```

开发服务器将在`http://localhost:5173`启动。

### 构建生产版本

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 其他命令

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check

# 测试
npm run test
```

---

## 🛠️ 开发工具

### 核心工具

#### Vite

项目使用Vite作为构建工具，提供：

- 快速的冷启动
- 热模块替换（HMR）
- 优化的生产构建

#### Vue DevTools

1. 安装浏览器扩展
2. 在开发模式下自动启用
3. 用于调试Vue组件状态

#### VueUse

项目集成了VueUse，提供常用的组合式函数：

```typescript
import { useLocalStorage, useDebounce } from '@vueuse/core'

// 使用示例
const searchText = useLocalStorage('search-text', '')
const debouncedSearch = useDebounce(searchText, 300)
```

### 调试工具

#### 浏览器开发者工具

- **Elements**：检查DOM结构
- **Console**：查看日志输出
- **Network**：监控网络请求
- **Application**：检查本地存储

#### VS Code调试

在`.vscode/launch.json`中配置：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "vuejs: chrome",
      "url": "http://localhost:5173",
      "webRoot": "\${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "\${webRoot}/*"
      }
    }
  ]
}
```

### 代码质量工具

#### ESLint

代码质量检查：

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix
```

#### Prettier

代码格式化：

```bash
# 格式化代码
npm run format
```

---

## 🔧 常见问题

### 安装问题

#### npm install失败

**问题**：网络问题导致安装失败

**解决方案**：
```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 清除缓存重新安装
npm cache clean --force
npm install
```

#### 权限问题

**问题**：安装全局包时权限不足

**解决方案**：
```bash
# 使用npx替代全局安装
npx create-vue-app my-app

# 或修改npm配置
npm config set prefix ~/.npm-global
```

### 运行问题

#### 端口占用

**问题**：开发服务器端口被占用

**解决方案**：
```bash
# 指定其他端口
npm run dev -- --port 3000

# 或修改vite.config.ts
export default defineConfig({
  server: {
    port: 3000
  }
})
```

#### 热重载不工作

**问题**：文件更改后页面不自动刷新

**解决方案**：
- 检查文件是否在Vite监听范围内
- 重启开发服务器
- 检查浏览器缓存

### 构建问题

#### 构建失败

**问题**：生产构建失败

**解决方案**：
```bash
# 清除缓存
npm run clean

# 检查TypeScript错误
npm run type-check

# 重新构建
npm run build
```

#### 包体积过大

**问题**：生产包体积过大

**解决方案**：
- 使用动态导入
- 配置代码分割
- 移除未使用的依赖

---

## 📚 相关链接

- [项目README](../../README.md)
- [Front前端架构概览](../../technical/frontend/architecture/FRONTEND_ARCHITECTURE_OVERVIEW.md)
- [开发规范](CODING_STANDARDS.md)
- [测试指南](TESTING_STRATEGY.md)

---

**最后更新**：2025-11-16
**维护责任人**：前端开发团队
**联系方式**：dev-team@company.com

