# Gym Admin - Vue 3 + TypeScript + Vite

## 技术栈

- Vue 3.5.13
- TypeScript 5.3.3
- Vite 5.0.8
- Element Plus 2.8.8
- Pinia 2.2.6
- Vue Router 4.5.0

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
npm run test:e2e:report  # 查看报告
```

> 建议在 CI 中设置 `E2E_NO_SERVER=1` 并复用已启动的服务器，以避免重复构建。

## 主要变更

### 从 Vue 2 升级到 Vue 3

- 使用 `createApp` 替代 `new Vue()`
- 使用 Composition API 和 `<script setup>`
- 全局属性使用 `app.config.globalProperties`

### 从 Element UI 升级到 Element Plus

- 组件 API 有部分变化，请参考 Element Plus 文档
- 图标使用方式改变，使用 `@element-plus/icons-vue`

### 从 Vuex 升级到 Pinia

- Store 定义方式改变
- 使用 `defineStore` 定义 store
- 在组件中使用 `useStore()` 访问

### 从 Vue Router 3 升级到 Vue Router 4

- 使用 `createRouter` 和 `createWebHashHistory`
- 路由配置基本兼容

### 从 Vue CLI 迁移到 Vite

- 更快的开发服务器启动
- 更快的 HMR
- 构建配置在 `vite.config.ts`

## 注意事项

1. 部分组件仍在迁移中，使用 Options API 的组件会逐步迁移到 Composition API
2. 第三方库兼容性：
   - echarts 已更新到 5.x
   - 地图组件需要更新到新的 API
   - 富文本编辑器使用 @vueup/vue-quill

## 📚 文档导航

完整的项目文档位于 `docs/` 目录，包含需求文档、技术文档、测试报告等。

### 快速链接

- **[文档索引](./docs/README.md)** - 完整的文档导航和索引
- **[技术文档](./docs/technical/ADMIN_FRONTEND_TECHNICAL_DOCUMENTATION.md)** - 项目技术文档、开发指南
- **[系统总览](./docs/requirements/ADMIN_OVERVIEW_REQUIREMENTS.md)** - 系统总体需求文档
- **[安全改进](./docs/technical/ADMIN_FRONTEND_SECURITY_IMPROVEMENTS.md)** - 安全工程改进总结

### 文档分类

#### 需求文档 (`docs/requirements/`)
- [系统总览](./docs/requirements/ADMIN_OVERVIEW_REQUIREMENTS.md) - 总体需求、设计规范
- [登录需求](./docs/requirements/ADMIN_LOGIN_REQUIREMENTS.md) - 登录功能需求
- [注册需求](./docs/requirements/ADMIN_REGISTER_REQUIREMENTS.md) - 注册功能需求
- [忘记密码](./docs/requirements/ADMIN_FORGOT_PASSWORD_REQUIREMENTS.md) - 忘记密码功能需求
- [首页需求](./docs/requirements/ADMIN_HOME_REQUIREMENTS.md) - 仪表盘首页需求
- [布局需求](./docs/requirements/ADMIN_LAYOUT_REQUIREMENTS.md) - 布局和导航需求
- [模块CRUD](./docs/requirements/ADMIN_MODULE_CRUD_REQUIREMENTS.md) - 业务模块CRUD需求
- [配置中心](./docs/requirements/ADMIN_CONFIG_CENTER_REQUIREMENTS.md) - 配置中心需求
- [系统管理](./docs/requirements/ADMIN_SYSTEM_MANAGEMENT_REQUIREMENTS.md) - 系统管理需求

#### 技术文档 (`docs/technical/`)
- [技术文档](./docs/technical/ADMIN_FRONTEND_TECHNICAL_DOCUMENTATION.md) - 完整技术文档
- [安全改进](./docs/technical/ADMIN_FRONTEND_SECURITY_IMPROVEMENTS.md) - 安全工程改进

#### 测试文档 (`docs/testing/`)
- [测试执行报告](./docs/testing/ADMIN_FRONTEND_TEST_EXECUTION_REPORT.md) - 测试执行报告
- [覆盖率提升报告](./docs/testing/ADMIN_TEST_COVERAGE_IMPROVEMENT.md) - 测试覆盖率报告

#### 项目文档
- [API文档](./docs/technical/ADMIN_FRONTEND_API_DOCUMENTATION.md) - 完整的API接口文档
- [组件使用指南](./docs/technical/ADMIN_FRONTEND_COMPONENTS_GUIDE.md) - 组件使用和API文档
- [故障排除指南](./docs/technical/ADMIN_FRONTEND_TROUBLESHOOTING.md) - 常见问题和解决方案
- [部署指南](./docs/technical/ADMIN_FRONTEND_DEPLOYMENT_GUIDE.md) - 构建和部署文档
- [开发环境配置](./docs/technical/ADMIN_FRONTEND_ENVIRONMENT_SETUP.md) - 环境搭建详细指南
- [更新日志](./CHANGELOG.md) - 版本变更历史
- [贡献指南](./CONTRIBUTING.md) - 代码贡献规范

> 💡 提示：更多文档请查看 [文档索引](./docs/README.md)

