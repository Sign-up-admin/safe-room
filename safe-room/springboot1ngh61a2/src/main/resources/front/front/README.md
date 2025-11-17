# Gym Frontend - Vue 3 + TypeScript + Vite

## 技术栈

- Vue 3.3.11
- TypeScript 5.3.3
- Vite 5.0.8
- Element Plus 2.4.4
- Pinia 2.1.7
- Vue Router 4.2.5

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 预览构建结果

```bash
npm run preview
```

## Playwright 端到端测试

1. 复制示例环境变量：

```bash
cp e2e.env.example .env
# 或使用你自己的凭证与 API 地址
```

2. 安装浏览器依赖（首次运行需要）：

```bash
npx playwright install
```

3. 运行测试：

```bash
npm run test:e2e         # 无头模式
npm run test:e2e:ui      # 可视化模式
npm run test:e2e:debug   # 调试模式
npm run test:e2e:report  # 查看最近一次测试报告
```

> 若在 CI 环境执行，可设置 `E2E_NO_SERVER=1` 并提前启动或部署应用，避免重复启动 Dev Server。

## 主要变更

### 从 Vue 2 升级到 Vue 3

- 使用 `createApp` 替代 `new Vue()`
- 使用 Composition API 和 `<script setup>`

### 从 vue-resource 迁移到 axios

- 所有 HTTP 请求现在使用 axios
- 拦截器配置在 `src/common/http.ts`

### 从 Element UI 升级到 Element Plus

- 组件 API 有部分变化
- 图标使用方式改变

### 从 Vuex 升级到 Pinia

- Store 定义方式改变
- 使用 `defineStore` 定义 store

### 从 Vue Router 3 升级到 Vue Router 4

- 使用 `createRouter` 和 `createWebHashHistory`

## 注意事项

1. 部分组件仍在迁移中
2. 地图组件需要更新到新的 API
3. 富文本编辑器使用 @vueup/vue-quill

