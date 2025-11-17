# Admin 文档索引

> 本文档是 Admin 前端项目的文档中心，包含需求文档、技术文档、测试报告等。

## 📚 文档结构

```
docs/
├── README.md                    # 本文档（文档索引）
├── requirements/                # 需求文档
│   ├── ADMIN_OVERVIEW_REQUIREMENTS.md
│   ├── ADMIN_LOGIN_REQUIREMENTS.md
│   ├── ADMIN_REGISTER_REQUIREMENTS.md
│   ├── ADMIN_FORGOT_PASSWORD_REQUIREMENTS.md
│   ├── ADMIN_HOME_REQUIREMENTS.md
│   ├── ADMIN_LAYOUT_REQUIREMENTS.md
│   ├── ADMIN_MODULE_CRUD_REQUIREMENTS.md
│   ├── ADMIN_USER_MANAGEMENT_REQUIREMENTS.md
│   ├── ADMIN_FITNESS_COURSE_REQUIREMENTS.md
│   ├── ADMIN_CONFIG_MANAGEMENT_REQUIREMENTS.md
│   ├── ADMIN_OPERATION_LOG_REQUIREMENTS.md
│   ├── ADMIN_CONFIG_CENTER_REQUIREMENTS.md
│   └── ADMIN_SYSTEM_MANAGEMENT_REQUIREMENTS.md
├── technical/                   # 技术文档
│   ├── ADMIN_FRONTEND_TECHNICAL_DOCUMENTATION.md
│   └── ADMIN_FRONTEND_SECURITY_IMPROVEMENTS.md
└── testing/                     # 测试文档
    ├── ADMIN_FRONTEND_TEST_EXECUTION_REPORT.md
    └── ADMIN_TEST_COVERAGE_IMPROVEMENT.md
```

---

## 1. 需求文档 (Requirements)

需求文档描述了 Admin 系统的功能需求和设计规范。

### 核心需求文档

| 文档 | 描述 | 状态 |
| --- | --- | --- |
| [系统总览](./requirements/ADMIN_OVERVIEW_REQUIREMENTS.md) | 后台管理系统总体需求、设计关键词、视觉规范 | ✅ |
| [登录需求](./requirements/ADMIN_LOGIN_REQUIREMENTS.md) | 登录页面功能需求、安全要求 | ✅ |
| [注册需求](./requirements/ADMIN_REGISTER_REQUIREMENTS.md) | 注册页面功能需求 | ✅ |
| [忘记密码](./requirements/ADMIN_FORGOT_PASSWORD_REQUIREMENTS.md) | 忘记密码功能需求 | ✅ |
| [首页需求](./requirements/ADMIN_HOME_REQUIREMENTS.md) | 仪表盘首页功能需求 | ✅ |
| [布局需求](./requirements/ADMIN_LAYOUT_REQUIREMENTS.md) | 布局壳体、导航、菜单需求 | ✅ |

### 业务模块需求文档

| 文档 | 描述 | 状态 |
| --- | --- | --- |
| [模块CRUD](./requirements/ADMIN_MODULE_CRUD_REQUIREMENTS.md) | 通用业务模块CRUD功能需求 | ✅ |
| [用户管理](./requirements/ADMIN_USER_MANAGEMENT_REQUIREMENTS.md) | 会员信息管理、到期提醒功能需求 | ✅ |
| [健身课程](./requirements/ADMIN_FITNESS_COURSE_REQUIREMENTS.md) | 课程管理、排课、预约集成功能需求 | ✅ |
| [配置管理](./requirements/ADMIN_CONFIG_MANAGEMENT_REQUIREMENTS.md) | 系统配置、轮播图管理功能需求 | ✅ |
| [操作日志](./requirements/ADMIN_OPERATION_LOG_REQUIREMENTS.md) | 操作日志记录、审计、安全监控需求 | ✅ |

### 系统功能需求文档

| 文档 | 描述 | 状态 |
| --- | --- | --- |
| [配置中心](./requirements/ADMIN_CONFIG_CENTER_REQUIREMENTS.md) | 配置中心功能需求 | ✅ |
| [系统管理](./requirements/ADMIN_SYSTEM_MANAGEMENT_REQUIREMENTS.md) | 系统管理功能需求 | ✅ |
| [业务模块](./requirements/ADMIN_BUSINESS_MODULES_REQUIREMENTS.md) | 反馈管理、资产管理等业务模块需求 | ✅ |

### 设计关键词

- **效率优先**：最少点击完成配置、审批、统计等任务
- **数据一目了然**：清晰的表格、图表展示
- **稳健权限**：完善的权限验证机制
- **浅色专业**：浅色主题，提升可读性和专业感
- **低噪动效**：适度的动画效果，不干扰操作

---

## 2. 技术文档 (Technical)

技术文档包含开发指南、架构说明、安全实践等。

### 技术文档列表

| 文档 | 描述 | 版本 |
| --- | --- | --- |
| [技术文档](./technical/ADMIN_FRONTEND_TECHNICAL_DOCUMENTATION.md) | 完整的技术文档，包含项目概述、技术栈、项目结构、开发规范等 | v2.0.0 |
| [安全改进](./technical/ADMIN_FRONTEND_SECURITY_IMPROVEMENTS.md) | 安全工程改进总结，包含Token存储、XSS防护、输入验证等 | - |

### 技术栈

- **框架**：Vue 3.5.13 + TypeScript 5.3.3
- **构建工具**：Vite 5.0.8
- **UI组件库**：Element Plus 2.8.8
- **状态管理**：Pinia 2.2.6
- **路由**：Vue Router 4.5.0
- **测试框架**：Vitest + Playwright
- **代码规范**：ESLint + Prettier + Stylelint

### 核心特性

- ✅ 现代化技术栈（Vue 3 + TypeScript + Vite）
- ✅ 组件化开发（基于 Element Plus）
- ✅ 类型安全（完整的 TypeScript 类型定义）
- ✅ 状态管理（Pinia）
- ✅ 路由管理（Vue Router 4）
- ✅ 安全机制（Token 认证、CSRF 防护、安全存储）
- ✅ 错误处理（全局错误捕获和处理）
- ✅ 代码质量（ESLint、Prettier、Stylelint）
- ✅ 测试覆盖（单元测试和端到端测试）

---

## 3. 测试文档 (Testing)

测试文档包含测试执行报告、覆盖率报告等。

### 测试文档列表

| 文档 | 描述 | 日期 |
| --- | --- | --- |
| [测试执行报告](./testing/ADMIN_FRONTEND_TEST_EXECUTION_REPORT.md) | Admin前端测试执行报告，包含测试统计、问题分析、修复建议 | 2025-11-15 |
| [覆盖率提升报告](./testing/ADMIN_TEST_COVERAGE_IMPROVEMENT.md) | 测试覆盖率提升报告，包含新增测试文件、覆盖率分析 | - |

### 测试框架

- **单元测试**：Vitest + Vue Test Utils + Happy DOM
- **端到端测试**：Playwright
- **覆盖率工具**：@vitest/coverage-v8

### 测试命令

```bash
# 运行单元测试
npm run test:unit

# 运行单元测试（Watch模式）
npm run test:unit:watch

# 运行单元测试（UI模式）
npm run test:unit:ui

# 运行覆盖率测试
npm run test:coverage

# 运行端到端测试
npm run test:e2e

# 运行端到端测试（UI模式）
npm run test:e2e:ui
```

---

## 4. 快速导航

### 新手入门

1. 阅读 [系统总览](./requirements/ADMIN_OVERVIEW_REQUIREMENTS.md) 了解整体设计
2. 查看 [技术文档](./technical/ADMIN_FRONTEND_TECHNICAL_DOCUMENTATION.md) 了解技术栈和项目结构
3. 参考 [登录需求](./requirements/ADMIN_LOGIN_REQUIREMENTS.md) 开始开发

### 开发指南

1. 查看 [技术文档](./technical/ADMIN_FRONTEND_TECHNICAL_DOCUMENTATION.md) 的开发环境配置
2. 阅读 [安全改进](./technical/ADMIN_FRONTEND_SECURITY_IMPROVEMENTS.md) 了解安全实践
3. 参考需求文档了解功能需求

### 测试指南

1. 查看 [测试执行报告](./testing/ADMIN_FRONTEND_TEST_EXECUTION_REPORT.md) 了解测试状态
2. 阅读 [覆盖率提升报告](./testing/ADMIN_TEST_COVERAGE_IMPROVEMENT.md) 了解测试覆盖情况
3. 运行测试命令进行测试

---

## 5. 相关链接

### 项目文档

- [项目根目录 README](../../../../../../README.md) - 项目总览
- [Admin README](../README.md) - Admin项目快速开始
- [主文档中心](../../../../../../docs/README.md) - 项目文档索引

### 外部资源

- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vite 文档](https://vitejs.dev/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Vue Router 文档](https://router.vuejs.org/)

---

## 6. 文档维护

### 更新原则

1. **需求文档**：当功能需求变更时，及时更新对应的需求文档
2. **技术文档**：当技术栈或架构变更时，更新技术文档
3. **测试文档**：每次测试执行后，更新测试报告

### 文档规范

- 使用 Markdown 格式
- 遵循统一的文档结构
- 保持文档的时效性和准确性
- 添加适当的代码示例和截图

---

**最后更新**：2025-11-16  
**维护者**：开发团队

