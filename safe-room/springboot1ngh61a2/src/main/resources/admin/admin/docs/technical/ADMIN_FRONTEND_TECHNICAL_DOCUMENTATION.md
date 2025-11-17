# Admin 前端技术文档

> 版本：v2.0.0  
> 更新日期：2025-01-XX  
> 适用项目：`springboot1ngh61a2/src/main/resources/admin/admin`

---

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 技术栈](#2-技术栈)
- [3. 项目结构](#3-项目结构)
- [4. 开发环境配置](#4-开发环境配置)
- [5. 核心功能模块](#5-核心功能模块)
- [6. API接口规范](#6-api接口规范)
- [7. 数据流与状态管理](#7-数据流与状态管理)
- [8. 安全实现](#8-安全实现)
- [9. 开发规范](#9-开发规范)
- [10. 构建与部署](#10-构建与部署)
- [11. 测试](#11-测试)
- [12. 常见问题](#12-常见问题)
- [13. 参考资料](#13-参考资料)

---

## 1. 项目概述

Admin 前端是健身房管理系统的后台管理界面，为管理员、运营人员和教练提供数据管理、内容配置、用户管理等功能。

### 1.1 主要特性

- ✅ **现代化技术栈**：Vue 3 + TypeScript + Vite
- ✅ **组件化开发**：基于 Element Plus 组件库
- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **状态管理**：Pinia 状态管理
- ✅ **路由管理**：Vue Router 4 路由守卫
- ✅ **安全机制**：Token 认证、CSRF 防护、安全存储
- ✅ **错误处理**：全局错误捕获和处理
- ✅ **代码质量**：ESLint、Prettier、Stylelint 代码规范
- ✅ **测试覆盖**：单元测试（Vitest）和端到端测试（Playwright）

### 1.2 设计原则

- **效率优先**：最少点击完成配置、审批、统计等任务
- **数据一目了然**：清晰的表格、图表展示
- **稳健权限**：完善的权限验证机制
- **浅色专业**：浅色主题，提升可读性和专业感
- **低噪动效**：适度的动画效果，不干扰操作

---

## 2. 技术栈

### 2.1 核心框架

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| Vue | ^3.5.13 | 渐进式 JavaScript 框架，Composition API |
| TypeScript | ~5.3.3 | 类型安全的 JavaScript 超集，严格模式配置 |
| Vite | ^5.0.8 | 下一代前端构建工具，支持热更新和快速构建 |

### 2.2 UI 组件库

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| Element Plus | ^2.8.8 | Vue 3 企业级组件库，暗色主题适配 |
| @element-plus/icons-vue | ^2.3.1 | Element Plus 图标库，159个SVG图标 |

### 2.3 状态管理与路由

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| Pinia | ^2.2.6 | Vue 官方状态管理库，标签页和错误状态管理 |
| Vue Router | ^4.5.0 | Vue 官方路由管理器，支持路由守卫和懒加载 |

### 2.4 工具库

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| Axios | ^1.7.9 | HTTP 客户端，支持请求拦截和错误重试 |
| ECharts | ^5.4.3 | 数据可视化图表库，首页统计图表展示 |
| echarts-wordcloud | ^2.1.0 | ECharts 词云插件，扩展图表类型 |
| @vueup/vue-quill | ^1.2.0 | 富文本编辑器，公告内容编辑 |
| Quill | ^1.3.7 | 富文本编辑器核心库 |
| js-md5 | ^0.8.3 | MD5 加密工具，安全存储 |
| DOMPurify | ^3.0.8 | HTML 内容净化，防止XSS攻击 |
| @amap/amap-jsapi-loader | ^1.0.1 | 高德地图API加载器，地图功能支持 |
| print-js | ^1.6.0 | 网页打印工具，导出功能支持 |

### 2.5 开发工具

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| ESLint | ^8.56.0 | JavaScript/TypeScript 代码检查，Vue 3 支持 |
| Prettier | ^3.4.2 | 代码格式化工具，统一代码风格 |
| Stylelint | ^16.9.1 | CSS/SCSS 代码检查，样式规范 |
| Vitest | ^1.0.0 | 单元测试框架，Vue 3 和 TypeScript 支持 |
| @vue/test-utils | ^2.4.3 | Vue 组件测试工具 |
| @vitest/ui | ^1.0.0 | Vitest 可视化测试界面 |
| @vitest/coverage-v8 | ^1.0.0 | 测试覆盖率工具，V8 引擎支持 |
| Playwright | ^1.49.0 | 端到端测试框架，跨浏览器测试 |
| Husky | ^9.1.7 | Git hooks 工具，提交前代码检查 |
| lint-staged | ^15.2.11 | Git staged 文件检查工具 |
| Happy DOM | ^12.0.0 | 轻量级 DOM 实现，单元测试使用 |
| jsdom | ^23.0.0 | DOM 环境模拟，测试支持 |

### 2.6 构建工具插件

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| @vitejs/plugin-vue | ^4.5.2 | Vite Vue 插件，支持 Vue 3 |
| unplugin-auto-import | ^0.17.2 | 自动导入 Vue API 和 Element Plus 组件 |
| unplugin-vue-components | ^0.25.2 | 自动导入组件，减少手动导入 |
| vite-plugin-svg-icons | ^2.0.1 | SVG 图标插件，159个自定义图标支持 |
| axios-mock-adapter | ^2.1.0 | Axios 请求模拟器，开发环境测试使用 |
| crypto-js | ^4.2.0 | 加密算法库，安全存储支持 |
| dotenv | ^16.4.5 | 环境变量加载器，配置管理 |
| vue-tsc | ^1.8.25 | Vue TypeScript 类型检查器 |

---

## 3. 项目结构

### 3.1 目录结构

```
admin/admin/
├── public/                 # 静态资源（不经过 Vite 处理）
├── src/
│   ├── assets/            # 静态资源
│   │   ├── css/          # 样式文件
│   │   ├── img/          # 图片资源
│   │   └── js/           # JavaScript 资源
│   ├── components/        # 组件库
│   │   ├── common/       # 通用组件
│   │   ├── echarts/      # 图表组件
│   │   └── index/        # 布局组件
│   ├── constants/         # 常量配置
│   ├── icons/             # 图标资源
│   │   └── svg/          # SVG 图标
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── styles/            # 全局样式
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   │   ├── modules/      # 业务模块页面
│   │   └── error/        # 错误页面
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── tests/                 # 测试文件
│   ├── unit/             # 单元测试
│   └── e2e/              # 端到端测试
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── README.md              # 项目说明
```

### 3.2 核心文件说明

#### 3.2.1 入口文件 (`src/main.ts`)

应用入口文件，负责：
- 创建 Vue 应用实例
- 注册全局插件（Pinia、Router、Element Plus）
- 注册全局组件
- 配置全局属性
- 初始化错误处理器

#### 3.2.2 路由配置 (`src/router/index.ts`)

- 定义所有路由规则
- 配置路由懒加载
- 实现路由守卫（权限验证）
- Token 验证和重定向逻辑

#### 3.2.3 状态管理 (`src/stores/`)

使用 Pinia 进行状态管理：
- `index.ts`：Pinia 实例创建
- `tagsView.ts`：标签页视图状态
- `error.ts`：错误状态管理

#### 3.2.4 HTTP 请求 (`src/utils/http.ts`)

基于 Axios 的 HTTP 客户端：
- 请求/响应拦截器
- Token 自动注入
- CSRF 防护
- 错误重试机制
- 统一错误处理

#### 3.2.5 工具函数 (`src/utils/`)

| 文件 | 说明 |
| --- | --- |
| `storage.ts` | 本地存储封装（localStorage/sessionStorage） |
| `secureStorage.ts` | 安全存储（加密 Token） |
| `validate.ts` | 表单验证工具 |
| `api.ts` | API 端点定义 |
| `base.ts` | 基础配置 |
| `des.ts` | DES 加密解密 |
| `menu.ts` | 菜单工具函数 |
| `utils.ts` | 通用工具函数 |
| `errorHandler.ts` | 错误处理 |
| `csrf.ts` | CSRF 防护 |
| `security.ts` | 安全工具 |

---

## 4. 开发环境配置

### 4.1 环境要求

- **Node.js**：>= 16.0.0
- **npm**：>= 8.0.0 或 **yarn**：>= 1.22.0
- **Git**：>= 2.0.0

### 4.2 安装依赖

```bash
cd springboot1ngh61a2/src/main/resources/admin/admin
npm install
```

### 4.3 环境变量

项目使用环境变量进行配置，可通过 `.env` 文件设置：

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/springboot1ngh61a2
VITE_APP_TITLE=健身房管理系统
```

### 4.4 开发服务器

启动开发服务器：

```bash
npm run dev
```

开发服务器将在 `http://localhost:8081` 启动，支持：
- 热模块替换（HMR）
- 自动打开浏览器
- 代理配置（`/springboot1ngh61a2` → `http://localhost:8080/springboot1ngh61a2/`）

### 4.5 代码检查

```bash
# 检查代码规范
npm run check

# 自动修复代码规范问题
npm run check:fix

# 检查所有（包括样式）
npm run check:all

# 自动修复所有
npm run check:all:fix
```

### 4.6 类型检查

```bash
npm run type-check
```

---

## 5. 核心功能模块

### 5.1 认证模块

#### 5.1.1 登录 (`views/login.vue`)

- 用户名/密码登录
- Token 存储（安全存储）
- 登录状态持久化
- 自动重定向

#### 5.1.2 注册 (`views/register.vue`)

- 用户注册
- 表单验证
- 密码强度检查

#### 5.1.3 路由守卫

路由守卫实现权限验证：

```typescript
router.beforeEach((to, from, next) => {
  // 公开路由检查
  // Token 验证
  // 重定向逻辑
})
```

### 5.2 布局模块

#### 5.2.1 主布局 (`views/index.vue`)

包含：
- 顶部导航栏（`IndexHeader`）
- 侧边栏菜单（`IndexAside`）
- 主内容区（`IndexMain`）
- 标签页视图（`TagsView`）

#### 5.2.2 组件说明

| 组件 | 路径 | 说明 |
| --- | --- | --- |
| `IndexHeader` | `components/index/IndexHeader.vue` | 顶部导航栏 |
| `IndexAside` | `components/index/IndexAside.vue` | 侧边栏菜单 |
| `IndexMain` | `components/index/IndexMain.vue` | 主内容区 |
| `TagsView` | `components/index/TagsView/index.vue` | 标签页视图 |

### 5.3 业务模块

#### 5.3.1 模块列表

| 模块 | 路由 | 文件路径 | 说明 |
| --- | --- | --- | --- |
| 用户管理 | `/yonghu` | `views/modules/yonghu/list.vue` | 会员信息管理，支持到期提醒 |
| 健身教练 | `/jianshenjiaolian` | `views/modules/jianshenjiaolian/list.vue` | 教练信息管理 |
| 健身课程 | `/jianshenkecheng` | `views/modules/jianshenkecheng/list.vue` | 课程信息管理，支持评论查看 |
| 课程预约 | `/kechengyuyue` | `views/modules/kechengyuyue/list.vue` | 课程预约管理，支持审核和支付 |
| 私教预约 | `/sijiaoyuyue` | `views/modules/sijiaoyuyue/list.vue` | 私人教练预约管理 |
| 会员卡管理 | `/huiyuanka` | `views/modules/huiyuanka/list.vue` | 会员卡类型设置 |
| 会员卡购买 | `/huiyuankagoumai` | `views/modules/huiyuankagoumai/list.vue` | 会员卡销售记录 |
| 会员续费 | `/huiyuanxufei` | `views/modules/huiyuanxufei/list.vue` | 会员续费记录管理 |
| 健身器材 | `/jianshenqicai` | `views/modules/jianshenqicai/list.vue` | 健身器材信息管理 |
| 课程类型 | `/kechengleixing` | `views/modules/kechengleixing/list.vue` | 课程分类管理 |
| 课程退课 | `/kechengtuike` | `views/modules/kechengtuike/list.vue` | 退课申请处理 |
| 到期提醒 | `/daoqitixing` | `views/modules/daoqitixing/list.vue` | 会员到期提醒管理 |
| 课程评论 | `/discussjianshenkecheng` | `views/modules/discussjianshenkecheng/list.vue` | 课程评价管理 |
| 公告管理 | `/news` | `views/modules/news/list.vue` | 系统公告发布管理 |
| 公告分类 | `/newstype` | `views/modules/newstype/list.vue` | 公告分类设置 |
| 反馈管理 | `/chat` | `views/modules/chat/list.vue` | 用户反馈消息管理 |
| 轮播管理 | `/config` | `views/modules/config/list.vue` | 首页轮播图配置 |
| 资产管理 | `/assets` | `views/modules/assets/list.vue` | 系统资源文件管理 |
| 服务状态 | `/service-status` | `views/modules/service-status/list.vue` | 系统服务状态监控 |
| 法律条款 | `/legal-terms` | `views/modules/legal-terms/list.vue` | 法律条款管理 |
| 操作日志 | `/operation-log` | `views/modules/operation-log/list.vue` | 系统操作日志查看 |
| 管理员用户 | `/users` | `views/modules/users/list.vue` | 后台管理员账号管理 |

#### 5.3.2 通用 CRUD 组件

`ModuleCrudPage.vue` 提供通用的 CRUD 功能：
- 列表展示
- 搜索过滤
- 新增/编辑/删除
- 批量操作
- 分页

### 5.4 通用组件

#### 5.4.1 文件上传

| 组件 | 路径 | 说明 |
| --- | --- | --- |
| `FileUpload` | `components/common/FileUpload.vue` | 文件上传组件 |
| `ImageUpload` | `components/common/ImageUpload.vue` | 图片上传组件 |
| `ExcelFileUpload` | `components/common/ExcelFileUpload.vue` | Excel 文件上传组件 |

#### 5.4.2 富文本编辑器

| 组件 | 路径 | 说明 |
| --- | --- | --- |
| `Editor` | `components/common/Editor.vue` | 富文本编辑器（基于 Quill） |
| `RichTextEditor` | `components/common/RichTextEditor.vue` | 富文本编辑器（备用） |

#### 5.4.3 其他组件

| 组件 | 路径 | 说明 |
| --- | --- | --- |
| `BreadCrumbs` | `components/common/BreadCrumbs.vue` | 面包屑导航 |
| `SafeHtml` | `components/common/SafeHtml.vue` | 安全的 HTML 渲染 |
| `SvgIcon` | `components/SvgIcon/index.vue` | SVG 图标组件 |

### 5.5 工具函数

#### 5.5.1 存储工具

```typescript
// localStorage/sessionStorage 封装
import storage from '@/utils/storage'

storage.set('key', 'value')
storage.get('key')
storage.remove('key')

// 安全存储（加密 Token）
import { tokenStorage } from '@/utils/secureStorage'

tokenStorage.setToken('token')
tokenStorage.getToken()
tokenStorage.clearToken()
```

#### 5.5.2 HTTP 请求

```typescript
import http from '@/utils/http'

// GET 请求
const response = await http.get('/api/users')

// POST 请求
const response = await http.post('/api/users', { name: 'John' })

// 响应类型
interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}
```

#### 5.5.3 表单验证

```typescript
import * as validate from '@/utils/validate'

// 验证邮箱
validate.isEmail('test@example.com')

// 验证手机号
validate.isMobile('13800138000')

// 验证身份证
validate.isIdCard('110101199001011234')
```

---

## 6. API接口规范

### 6.1 接口设计原则

- **RESTful规范**：使用标准的HTTP方法和资源路径
- **统一响应格式**：所有接口返回统一的JSON格式
- **错误处理**：统一的错误码和错误信息
- **分页规范**：列表接口支持分页参数

### 6.2 请求/响应格式

#### 6.2.1 统一响应格式

```typescript
interface ApiResponse<T = any> {
  code: number      // 状态码：0成功，-1失败
  msg: string       // 响应消息
  data?: T         // 响应数据
}
```

#### 6.2.2 分页响应格式

```typescript
interface PageResponse<T = any> {
  code: 0
  msg: 'success'
  data: {
    list: T[]        // 数据列表
    total: number    // 总记录数
    page: number     // 当前页码
    limit: number    // 每页条数
  }
}
```

#### 6.2.3 统计接口响应格式

```typescript
interface CountResponse {
  code: 0
  msg: 'success'
  data: number  // 统计数值
}
```

### 6.3 核心API接口

#### 6.3.1 认证相关

| 接口 | 方法 | 路径 | 说明 |
| --- | --- | --- | --- |
| 登录 | POST | `/auth/login` | 用户登录 |
| 注册 | POST | `/auth/register` | 用户注册 |
| 登出 | POST | `/auth/logout` | 用户登出 |
| 刷新Token | POST | `/auth/refresh` | 刷新访问令牌 |

#### 6.3.2 通用CRUD接口

所有业务模块遵循统一的CRUD接口规范：

| 操作 | 方法 | 路径模式 | 请求体 | 说明 |
| --- | --- | --- | --- | --- |
| **列表查询** | GET | `/{module}/list` | Query参数 | 支持分页、筛选、排序 |
| **新增** | POST | `/{module}/save` | JSON对象 | 创建新记录 |
| **编辑** | POST | `/{module}/update` | JSON对象 | 更新现有记录（需包含id） |
| **删除** | POST | `/{module}/delete` | `{ids: number[]}` | 删除单条或多条记录 |
| **详情查看** | GET | `/{module}/info/{id}` | - | 获取单条记录详情 |
| **统计计数** | GET | `/{module}/count` | Query参数 | 获取记录总数 |

#### 6.3.3 业务模块接口映射

| 模块 | 路径前缀 | 说明 |
| --- | --- | --- |
| 用户管理 | `/yonghu` | 会员信息管理 |
| 健身教练 | `/jianshenjiaolian` | 教练信息管理 |
| 健身课程 | `/jianshenkecheng` | 课程信息管理 |
| 课程预约 | `/kechengyuyue` | 课程预约管理 |
| 会员卡 | `/huiyuanka` | 会员卡类型管理 |
| 会员卡购买 | `/huiyuankagoumai` | 购卡记录管理 |
| 会员续费 | `/huiyuanxufei` | 续费记录管理 |
| 私教预约 | `/sijiaoyuyue` | 私人教练预约 |
| 课程退款 | `/kechengtuike` | 退款申请管理 |
| 健身器材 | `/jianshenqicai` | 设备资产管理 |
| 轮播图 | `/config` | 系统配置管理 |
| 公告 | `/news` | 公告内容管理 |
| 反馈 | `/chat` | 用户反馈管理 |
| 操作日志 | `/operationLog` | 系统操作日志 |

### 6.4 HTTP客户端封装

#### 6.4.1 Axios配置 (`src/utils/http.ts`)

```typescript
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'

// 创建axios实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加Token
    const token = storage.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加CSRF token
    const csrfToken = storage.get('csrfToken')
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }

    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response

    if (data.code === 0) {
      return response
    } else {
      // 处理业务错误
      ElMessage.error(data.msg || '请求失败')
      return Promise.reject(new Error(data.msg || '请求失败'))
    }
  },
  (error) => {
    // 处理HTTP错误
    if (error.response?.status === 401) {
      // Token过期，跳转登录
      storage.clear()
      router.push('/login')
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default instance
```

#### 6.4.2 使用示例

```typescript
import http from '@/utils/http'

// GET请求
const response = await http.get<PageResponse<User>>('/yonghu/list', {
  params: { page: 1, limit: 10 }
})

// POST请求
const newUser = await http.post<ApiResponse<User>>('/yonghu/save', {
  username: 'test',
  password: '123456'
})
```

---

## 7. 数据流与状态管理

### 7.1 Pinia状态管理

#### 7.1.1 Store结构

```typescript
// stores/tagsView.ts - 标签页状态
export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<RouteRecordRaw[]>([])
  const cachedViews = ref<string[]>([])

  // 添加标签页
  const addVisitedView = (view: RouteRecordRaw) => {
    // 实现逻辑
  }

  // 删除标签页
  const delVisitedView = (view: RouteRecordRaw) => {
    // 实现逻辑
  }

  return {
    visitedViews,
    cachedViews,
    addVisitedView,
    delVisitedView
  }
})

// stores/error.ts - 全局错误状态
export const useErrorStore = defineStore('error', () => {
  const errors = ref<ErrorInfo[]>([])

  const addError = (error: ErrorInfo) => {
    errors.value.push(error)
  }

  const clearErrors = () => {
    errors.value = []
  }

  return {
    errors,
    addError,
    clearErrors
  }
})
```

### 7.2 数据流向图

```
用户操作 → Vue组件 → API调用 → 后端接口 → 数据库
    ↓         ↓         ↓         ↓         ↓
状态更新 ← 响应处理 ← 数据解析 ← 统一响应 ← 数据返回
```

#### 7.2.1 典型数据流

1. **用户触发操作**：点击按钮、提交表单等
2. **组件处理**：表单验证、权限检查、Loading状态
3. **API调用**：通过封装的http客户端发送请求
4. **响应处理**：统一错误处理、数据转换、状态更新
5. **UI更新**：响应式数据变化驱动界面重新渲染

### 7.3 缓存策略

#### 7.3.1 内存缓存

```typescript
// 简单内存缓存实现
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number }>()

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    // 缓存过期检查（5分钟）
    if (Date.now() - item.timestamp > 5 * 60 * 1000) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
}
```

#### 7.3.2 首页数据缓存

```typescript
// 首页统计数据缓存5分钟
const DASHBOARD_CACHE_KEY = 'dashboard_stats'
const CACHE_DURATION = 5 * 60 * 1000

const getCachedStats = () => {
  const cached = localStorage.getItem(DASHBOARD_CACHE_KEY)
  if (!cached) return null

  try {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(DASHBOARD_CACHE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

const setCachedStats = (data: any) => {
  localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({
    data,
    timestamp: Date.now()
  }))
}
```

---

## 8. 安全实现

### 8.1 认证安全

#### 8.1.1 Token管理

```typescript
// utils/storage.ts - 安全存储
export const storage = {
  // Token存储
  setToken(token: string) {
    sessionStorage.setItem('token', token)
    // 设置过期时间（7天）
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000
    sessionStorage.setItem('token_expiry', expiry.toString())
  },

  getToken(): string | null {
    const token = sessionStorage.getItem('token')
    const expiry = sessionStorage.getItem('token_expiry')

    if (!token || !expiry) return null

    // 检查是否过期
    if (Date.now() > parseInt(expiry)) {
      this.clearToken()
      return null
    }

    return token
  },

  clearToken() {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('token_expiry')
  }
}
```

#### 8.1.2 自动续期

```typescript
// 路由守卫中的Token检查
router.beforeEach(async (to, from, next) => {
  const token = storage.getToken()

  if (!token && to.path !== '/login') {
    next('/login')
    return
  }

  // 检查Token是否即将过期（提前5分钟）
  const expiry = sessionStorage.getItem('token_expiry')
  if (expiry && Date.now() > parseInt(expiry) - 5 * 60 * 1000) {
    try {
      // 自动续期
      const response = await http.post('/auth/refresh')
      if (response.data.code === 0) {
        storage.setToken(response.data.data.token)
      }
    } catch {
      // 续期失败，跳转登录
      storage.clear()
      next('/login')
      return
    }
  }

  next()
})
```

### 8.2 CSRF防护

#### 8.2.1 CSRF Token管理

```typescript
// 获取CSRF Token
const getCsrfToken = async (): Promise<string> => {
  const response = await http.get('/auth/csrf-token')
  const token = response.data.data.token
  storage.set('csrfToken', token)
  return token
}

// 在需要CSRF保护的请求中添加
const protectedRequest = async (config: AxiosRequestConfig) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
    let csrfToken = storage.get('csrfToken')
    if (!csrfToken) {
      csrfToken = await getCsrfToken()
    }
    config.headers['X-CSRF-Token'] = csrfToken
  }
  return config
}
```

### 8.3 数据安全

#### 8.3.1 输入验证

```typescript
// utils/validate.ts
export const validate = {
  // SQL注入防护
  sanitizeInput(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
  },

  // XSS防护
  sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
      ALLOWED_ATTR: []
    })
  },

  // 文件上传验证
  validateFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    return allowedTypes.includes(file.type) && file.size <= maxSize
  }
}
```

#### 8.3.2 权限检查

```typescript
// utils/security.ts
export const security = {
  // 权限验证
  hasPermission(table: string, action: string): boolean {
    return isAuth(table, action)
  },

  // 数据隔离检查（教练只能看到自己的数据）
  checkDataIsolation(userRole: string, userId: string, dataOwnerId: string): boolean {
    if (userRole === 'Coach' && userId !== dataOwnerId) {
      return false
    }
    return true
  },

  // 操作审计
  auditLog(operation: string, table: string, data: any) {
    const logData = {
      username: storage.get('username'),
      operation,
      table,
      time: getCurDateTime(),
      params: JSON.stringify(data)
    }

    http.post('/operationLog/save', logData).catch(() => {
      // 日志记录失败不影响主业务
      console.warn('操作日志记录失败')
    })
  }
}
```

### 8.4 安全监控

#### 8.4.1 异常监控

```typescript
// 全局错误处理
app.config.errorHandler = (error, instance, info) => {
  // 记录错误信息
  console.error('Global error:', error)
  console.error('Component instance:', instance)
  console.error('Error info:', info)

  // 发送错误报告（可选）
  if (import.meta.env.PROD) {
    http.post('/error/report', {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
  }

  // 显示用户友好的错误提示
  ElMessage.error('系统出现异常，请稍后重试')
}
```

#### 8.4.2 性能监控

```typescript
// 页面加载性能监控
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  // 发送性能数据
  http.post('/performance/log', {
    url: window.location.href,
    loadTime: perfData.loadEventEnd - perfData.fetchStart,
    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
    firstPaint: perfData.responseStart - perfData.fetchStart
  }).catch(() => {})
})
```

---

## 9. 开发规范

### 9.1 代码风格

#### 9.1.1 TypeScript

- 使用严格的 TypeScript 配置
- 所有函数必须有类型注解
- 避免使用 `any`，使用 `unknown` 或具体类型
- 使用接口定义数据结构

#### 9.1.2 Vue 组件

- 使用 `<script setup>` 语法
- 使用 Composition API
- 组件名使用 PascalCase
- Props 和 Emits 必须定义类型

示例：

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  update: [value: number]
}>()

const doubleCount = computed(() => props.count * 2)
</script>
```

#### 9.1.3 样式规范

- 使用 SCSS 预处理器
- 遵循 BEM 命名规范
- 使用设计令牌（`styles/design-tokens.scss`）
- 响应式设计使用断点变量

### 9.2 文件命名

- **组件文件**：PascalCase，如 `UserList.vue`
- **工具文件**：camelCase，如 `http.ts`
- **类型文件**：camelCase，如 `api.ts`
- **常量文件**：camelCase，如 `menu.ts`

### 9.3 目录组织

- 按功能模块组织文件
- 相关文件放在同一目录
- 公共组件放在 `components/common/`
- 业务组件放在对应模块目录

### 9.4 Git 提交规范

使用 Conventional Commits 规范：

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

### 9.5 注释规范

- 公共函数必须添加 JSDoc 注释
- 复杂逻辑添加行内注释
- TODO 注释标注待办事项

---

## 10. 构建与部署

### 10.1 构建

```bash
# 构建生产版本
npm run build
```

构建产物输出到 `dist/` 目录：
- `assets/js/`：JavaScript 文件
- `assets/css/`：CSS 文件
- `assets/img/`：图片资源
- `index.html`：入口 HTML

### 10.2 预览构建结果

```bash
npm run preview
```

### 10.3 部署

#### 7.3.1 静态资源部署

将 `dist/` 目录内容部署到 Web 服务器（Nginx、Apache 等）。

#### 7.3.2 Nginx 配置示例

```nginx
server {
    listen 80;
    server_name admin.example.com;
    root /var/www/admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /springboot1ngh61a2 {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 7.3.3 环境变量配置

生产环境需要配置：
- API 基础 URL
- 应用标题
- 其他环境相关配置

---

## 11. 测试

### 11.1 测试框架概览

项目采用现代化的测试技术栈：

| 测试类型 | 框架 | 位置 | 说明 |
| --- | --- | --- | --- |
| **单元测试** | Vitest + @vue/test-utils | `tests/unit/` | 组件、工具函数测试 |
| **集成测试** | Vitest + @vue/test-utils | `tests/integration/` | 组件间交互测试 |
| **端到端测试** | Playwright | `tests/e2e/` | 用户流程完整测试 |

### 11.2 单元测试

**测试配置**（`vitest.config.ts`）：
- 使用 `happy-dom` 环境模拟浏览器API
- 全局测试设置（`tests/setup/vitest.setup.ts`）
- 覆盖率目标：语句80%、函数80%、分支70%、行80%

**运行命令**：
```bash
# 运行单元测试
npm run test:unit

# 监听模式（开发时推荐）
npm run test:unit:watch

# UI界面查看测试结果
npm run test:unit:ui

# 生成覆盖率报告
npm run test:coverage
```

**测试文件组织**：
```
tests/unit/
├── components/     # 组件测试
│   ├── App.test.ts
│   └── IndexHeader.test.ts
├── utils/          # 工具函数测试
│   ├── utils.test.ts
│   ├── security.test.ts
│   └── validate.test.ts
├── stores/         # 状态管理测试
├── constants/      # 常量配置测试
└── views/          # 页面组件测试
```

### 11.3 集成测试

**测试内容**：
- 组件间数据流转
- 导航流程完整性
- 用户操作序列

**测试文件**：
```
tests/integration/
├── component-interaction.test.ts  # 组件交互测试
├── data-flow.test.ts              # 数据流测试
└── navigation-flow.test.ts        # 导航流程测试
```

### 11.4 端到端测试

**测试配置**：
- 使用 Playwright 测试真实浏览器环境
- 支持多浏览器测试（Chrome、Firefox、Safari）
- 自动截图和视频录制失败用例

**运行命令**：
```bash
# 安装浏览器依赖（首次运行）
npx playwright install

# 运行端到端测试
npm run test:e2e

# UI模式调试
npm run test:e2e:ui

# 调试模式
npm run test:e2e:debug

# 查看测试报告
npm run test:e2e:report
```

**测试覆盖场景**：
- 用户登录流程
- 权限验证
- CRUD 操作完整流程
- 数据导出功能
- 响应式布局适配

### 11.5 测试覆盖率

**覆盖率目标**（`vitest.config.ts` 配置）：

| 指标 | 当前阈值 | 长期目标 | 说明 |
| --- | --- | --- | --- |
| **语句覆盖率** | ≥80% | 100% | 执行到的代码行比例 |
| **函数覆盖率** | ≥80% | 100% | 被调用到的函数比例 |
| **分支覆盖率** | ≥70% | 100% | 条件分支执行比例 |
| **行覆盖率** | ≥80% | 100% | 代码行执行比例 |

**覆盖率报告**：
- HTML报告：`coverage/index.html`
- LCOV报告：`coverage/lcov-report/`
- JSON摘要：`coverage/coverage-summary.json`

**覆盖范围**：
```typescript
include: ['src/**/*.{ts,tsx,js,jsx,vue}']
exclude: [
  'src/main.ts',
  'src/router/**',
  'src/**/*.d.ts',
  'src/**/types/**',
  // ... 其他配置文件
]
```

---

## 12. 常见问题

### 12.1 开发环境问题

#### Q: 启动开发服务器失败

**A:** 检查：
1. Node.js 版本是否符合要求
2. 依赖是否完整安装（`npm install`）
3. 端口 8081 是否被占用

#### Q: 热更新不生效

**A:** 
1. 检查文件是否在 `src/` 目录下
2. 检查 Vite 配置是否正确
3. 重启开发服务器

### 9.2 构建问题

#### Q: 构建失败

**A:** 检查：
1. TypeScript 类型错误（`npm run type-check`）
2. ESLint 错误（`npm run lint:check`）
3. 依赖版本冲突

#### Q: 构建产物过大

**A:**
1. 检查是否有未使用的依赖
2. 使用代码分割（路由懒加载）
3. 优化图片资源

### 9.3 运行时问题

#### Q: Token 失效后无法跳转登录页

**A:** 检查路由守卫配置，确保正确处理 Token 失效情况。

#### Q: API 请求失败

**A:** 检查：
1. 后端服务是否启动
2. 代理配置是否正确
3. Token 是否正确注入
4. CORS 配置是否正确

### 9.4 类型问题

#### Q: TypeScript 类型错误

**A:**
1. 检查类型定义文件是否存在
2. 使用 `@ts-ignore` 临时忽略（不推荐）
3. 添加正确的类型注解

---

## 13. 参考资料

### 13.1 官方文档

- [Vue 3 文档](https://cn.vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/zh/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/zh-CN/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Vue Router 文档](https://router.vuejs.org/zh/)

### 10.2 项目文档

- [架构文档](./ARCHITECTURE.md)
- [前端代码资产清单](./FRONTEND_CODE_ASSETS.md)
- [前端迁移状态](./FRONTEND_MIGRATION_STATUS.md)
- [Admin 需求文档](./ADMIN_OVERVIEW_REQUIREMENTS.md)

### 10.3 工具文档

- [ESLint 文档](https://eslint.org/)
- [Prettier 文档](https://prettier.io/)
- [Stylelint 文档](https://stylelint.io/)
- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)

---

## 附录

### A. 项目配置说明

#### A.1 Vite 配置 (`vite.config.ts`)

- **插件配置**：Vue 插件、自动导入、SVG 图标
- **路径别名**：`@` → `src/`
- **代理配置**：开发环境 API 代理
- **构建配置**：输出目录、代码分割、资源处理

#### A.2 TypeScript 配置 (`tsconfig.json`)

- **严格模式**：启用所有严格检查
- **路径映射**：`@/*` → `src/*`
- **模块解析**：bundler 模式
- **目标版本**：ES2020

#### A.3 代码检查配置

- **ESLint**：`.eslintrc.js`
- **Prettier**：`.prettierrc`
- **Stylelint**：`.stylelintrc.cjs`

### B. 开发工作流

1. **创建功能分支**
   ```bash
   git checkout -b feat/new-feature
   ```

2. **开发功能**
   - 编写代码
   - 运行代码检查
   - 编写测试

3. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 新功能描述"
   ```

4. **推送并创建 PR**
   ```bash
   git push origin feat/new-feature
   ```

### C. 性能优化建议

1. **代码分割**：使用路由懒加载
2. **资源优化**：压缩图片、使用 CDN
3. **缓存策略**：合理使用浏览器缓存
4. **打包优化**：Tree-shaking、代码压缩

---

**文档维护者**：开发团队  
**最后更新**：2025-01-XX  
**文档版本**：v2.0.0



