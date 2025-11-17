---
title: FRONTEND CODE ASSETS
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---
# 前端代码资产清单

> 版本：v1.0  
> 更新日期：2025-11-15  
> 适用范围：Front项目 + Admin项目

---

## 1. 概述

本文档全面盘点项目前端代码资产，包括代码结构、组件统计、工具函数、类型定义、配置文件等，为代码维护、重构和文档更新提供基础数据。

---

## 2. Front项目代码结构

### 2.1 目录结构

```
springboot1ngh61a2/src/main/resources/front/front/src/
├── pages/              # 页面组件（62个文件）
├── components/         # 组件库（37个文件）
├── composables/        # 组合式函数（9个文件）
├── services/           # 服务层（3个文件）
├── stores/             # 状态管理（4个文件）
├── router/             # 路由配置（2个文件）
├── common/             # 通用工具（11个文件）
├── config/             # 配置文件（5个文件）
├── types/              # 类型定义（5个文件）
├── utils/              # 工具函数（10个文件）
├── styles/             # 样式文件（4个文件）
├── assets/             # 静态资源
├── App.vue             # 根组件
├── main.ts             # 入口文件
└── env.d.ts            # 环境类型定义
```

### 2.2 页面组件（Pages）

#### 2.2.1 业务页面（按模块分类）

| 模块 | 页面 | 路由 | 文件路径 |
| --- | --- | --- | --- |
| **用户管理** | 用户列表 | `/index/yonghu` | `pages/yonghu/list.vue` |
| | 用户详情 | `/index/yonghuDetail` | `pages/yonghu/detail.vue` |
| | 用户添加 | `/index/yonghuAdd` | `pages/yonghu/add.vue` |
| **教练管理** | 教练列表 | `/index/jianshenjiaolian` | `pages/jianshenjiaolian/list.vue` |
| | 教练详情 | `/index/jianshenjiaolianDetail` | `pages/jianshenjiaolian/detail.vue` |
| | 教练添加 | `/index/jianshenjiaolianAdd` | `pages/jianshenjiaolian/add.vue` |
| **课程管理** | 课程列表 | `/index/jianshenkecheng` | `pages/jianshenkecheng/list.vue` |
| | 课程详情 | `/index/jianshenkechengDetail` | `pages/jianshenkecheng/detail.vue` |
| | 课程添加 | `/index/jianshenkechengAdd` | `pages/jianshenkecheng/add.vue` |
| | 课程类型列表 | `/index/kechengleixing` | `pages/kechengleixing/list.vue` |
| | 课程类型详情 | `/index/kechengleixingDetail` | `pages/kechengleixing/detail.vue` |
| | 课程类型添加 | `/index/kechengleixingAdd` | `pages/kechengleixing/add.vue` |
| **预约管理** | 课程预约列表 | `/index/kechengyuyue` | `pages/kechengyuyue/list.vue` |
| | 课程预约详情 | `/index/kechengyuyueDetail` | `pages/kechengyuyue/detail.vue` |
| | 课程预约添加 | `/index/kechengyuyueAdd` | `pages/kechengyuyue/add.vue` |
| | 私教预约列表 | `/index/sijiaoyuyue` | `pages/sijiaoyuyue/list.vue` |
| | 私教预约详情 | `/index/sijiaoyuyueDetail` | `pages/sijiaoyuyue/detail.vue` |
| | 私教预约添加 | `/index/sijiaoyuyueAdd` | `pages/sijiaoyuyue/add.vue` |
| | 课程退课列表 | `/index/kechengtuike` | `pages/kechengtuike/list.vue` |
| | 课程退课详情 | `/index/kechengtuikeDetail` | `pages/kechengtuike/detail.vue` |
| | 课程退课添加 | `/index/kechengtuikeAdd` | `pages/kechengtuike/add.vue` |
| **会员管理** | 会员卡列表 | `/index/huiyuanka` | `pages/huiyuanka/list.vue` |
| | 会员卡详情 | `/index/huiyuankaDetail` | `pages/huiyuanka/detail.vue` |
| | 会员卡添加 | `/index/huiyuankaAdd` | `pages/huiyuanka/add.vue` |
| | 会员卡购买列表 | `/index/huiyuankagoumai` | `pages/huiyuankagoumai/list.vue` |
| | 会员卡购买详情 | `/index/huiyuankagoumaiDetail` | `pages/huiyuankagoumai/detail.vue` |
| | 会员卡购买添加 | `/index/huiyuankagoumaiAdd` | `pages/huiyuankagoumai/add.vue` |
| | 会员续费列表 | `/index/huiyuanxufei` | `pages/huiyuanxufei/list.vue` |
| | 会员续费详情 | `/index/huiyuanxufeiDetail` | `pages/huiyuanxufei/detail.vue` |
| | 会员续费添加 | `/index/huiyuanxufeiAdd` | `pages/huiyuanxufei/add.vue` |
| | 到期提醒列表 | `/index/daoqitixing` | `pages/daoqitixing/list.vue` |
| | 到期提醒详情 | `/index/daoqitixingDetail` | `pages/daoqitixing/detail.vue` |
| | 到期提醒添加 | `/index/daoqitixingAdd` | `pages/daoqitixing/add.vue` |
| **内容管理** | 新闻列表 | `/index/news` | `pages/news/news-list.vue` |
| | 新闻详情 | `/index/newsDetail` | `pages/news/news-detail.vue` |
| | 新闻类型列表 | `/index/newstype` | `pages/newstype/list.vue` |
| | 新闻类型详情 | `/index/newstypeDetail` | `pages/newstype/detail.vue` |
| | 新闻类型添加 | `/index/newstypeAdd` | `pages/newstype/add.vue` |
| | 课程讨论列表 | `/index/discussjianshenkecheng` | `pages/discussjianshenkecheng/list.vue` |
| | 课程讨论详情 | `/index/discussjianshenkechengDetail` | `pages/discussjianshenkecheng/detail.vue` |
| | 课程讨论添加 | `/index/discussjianshenkechengAdd` | `pages/discussjianshenkecheng/add.vue` |
| **设施管理** | 健身器材列表 | `/index/jianshenqicai` | `pages/jianshenqicai/list.vue` |
| | 健身器材详情 | `/index/jianshenqicaiDetail` | `pages/jianshenqicai/detail.vue` |
| | 健身器材添加 | `/index/jianshenqicaiAdd` | `pages/jianshenqicai/add.vue` |
| **系统页面** | 首页 | `/index/home` | `pages/home/home.vue` |
| | 登录 | `/login` | `pages/login/login.vue` |
| | 注册 | `/register` | `pages/register/register.vue` |
| | 个人中心 | `/index/center` | `pages/center/center.vue` |
| | 支付 | `/index/pay` | `pages/pay/index.vue` |
| | 收藏 | `/index/storeup` | `pages/storeup/list.vue` |
| | 聊天列表 | `/index/chat` | `pages/chat/list.vue` |
| | 聊天添加 | `/index/chatAdd` | `pages/chat/add.vue` |
| | 法律条款 | `/index/legal/terms` | `pages/legal/terms.vue` |
| | 法律声明 | `/index/legal/disclaimer` | `pages/legal/disclaimer.vue` |
| | 需求说明 | `/index/legal/requirements` | `pages/legal/requirements.vue` |
| | API文档 | `/index/api/docs` | `pages/api/docs.vue` |
| | 404错误 | - | `pages/error/404.vue` |
| | 错误页面 | - | `pages/error/ErrorPage.vue` |
| **共享页面** | 模块列表页 | - | `pages/shared/ModuleListPage.vue` |
| | 模块详情页 | - | `pages/shared/ModuleDetailPage.vue` |
| | 模块表单页 | - | `pages/shared/ModuleFormPage.vue` |

**统计**：共62个页面组件文件

#### 2.2.2 页面组件分类统计

- **业务CRUD页面**：45个（列表/详情/添加 × 15个模块）
- **系统功能页面**：10个（首页/登录/注册/个人中心/支付/收藏/聊天/法律/API文档/错误页）
- **共享页面组件**：3个（ModuleListPage/ModuleDetailPage/ModuleFormPage）
- **其他页面**：4个（新闻详情/新闻列表/错误页等）

### 2.3 组件库（Components）

#### 2.3.1 组件分类

| 类别 | 组件 | 文件路径 | 说明 |
| --- | --- | --- | --- |
| **首页组件** | SmartHeader | `components/home/SmartHeader.vue` | 智能头部导航 |
| | HeroSection | `components/home/HeroSection.vue` | 英雄区域 |
| | CoachNetwork | `components/home/CoachNetwork.vue` | 教练网络图 |
| | ServiceCards | `components/home/ServiceCards.vue` | 服务卡片 |
| | Testimonials | `components/home/Testimonials.vue` | 用户评价 |
| | Footer | `components/home/Footer.vue` | 页脚 |
| | FloatingServiceButton | `components/home/FloatingServiceButton.vue` | 浮动服务按钮 |
| **预约组件** | BookingCalendar | `components/booking/BookingCalendar.vue` | 预约日历 |
| | BookingSummary | `components/booking/BookingSummary.vue` | 预约摘要 |
| | CoachRecommend | `components/booking/CoachRecommend.vue` | 教练推荐 |
| | CoursePicker | `components/booking/CoursePicker.vue` | 课程选择器 |
| | GoalSelector | `components/booking/GoalSelector.vue` | 目标选择器 |
| | SchedulePlanner | `components/booking/SchedulePlanner.vue` | 日程规划器 |
| **支付组件** | PaymentStepper | `components/payment/PaymentStepper.vue` | 支付步骤条 |
| | PaymentMethodCard | `components/payment/PaymentMethodCard.vue` | 支付方式卡片 |
| | PaymentResult | `components/payment/PaymentResult.vue` | 支付结果 |
| **课程组件** | CourseCard | `components/courses/CourseCard.vue` | 课程卡片 |
| | CourseBenefitsChart | `components/courses/CourseBenefitsChart.vue` | 课程收益图表 |
| **通用组件** | TechButton | `components/common/TechButton.vue` | 科技风按钮 |
| | TechCard | `components/common/TechCard.vue` | 科技风卡片 |
| | Stepper | `components/common/Stepper.vue` | 步骤条 |
| | SafeHtml | `components/common/SafeHtml.vue` | 安全HTML渲染 |
| | Breadcrumb | `components/Breadcrumb.vue` | 面包屑导航 |
| | FileUpload | `components/FileUpload.vue` | 文件上传 |
| | Editor | `components/Editor.vue` | 富文本编辑器 |
| | CountDown | `components/CountDown.vue` | 倒计时 |
| | CookieConsent | `components/CookieConsent.vue` | Cookie同意 |
| | img | `components/img.vue` | 图片组件 |
| | timeable | `components/timeable.vue` | 时间表 |
| **模块组件** | ModuleList | `components/modules/ModuleList.vue` | 模块列表 |
| | ModuleDetail | `components/modules/ModuleDetail.vue` | 模块详情 |
| | ModuleForm | `components/modules/ModuleForm.vue` | 模块表单 |

**统计**：共37个组件文件

#### 2.3.2 组件分类统计

- **首页组件**：7个
- **预约组件**：6个
- **支付组件**：3个
- **课程组件**：2个
- **通用组件**：10个
- **模块组件**：3个
- **其他组件**：6个

### 2.4 组合式函数（Composables）

| 函数 | 文件路径 | 说明 |
| --- | --- | --- |
| useAnimations | `composables/useAnimations.ts` | 动画控制 |
| useBookingConflict | `composables/useBookingConflict.ts` | 预约冲突检测 |
| useHoverGlow | `composables/useHoverGlow.ts` | 悬停发光效果 |
| useModuleCrud | `composables/useModuleCrud.ts` | 模块CRUD操作 |
| useMotion | `composables/useMotion.ts` | 运动检测 |
| usePageTransition | `composables/usePageTransition.ts` | 页面过渡 |
| useParticleSystem | `composables/useParticleSystem.ts` | 粒子系统 |
| usePaymentStatus | `composables/usePaymentStatus.ts` | 支付状态管理 |
| useScrollAnimation | `composables/useScrollAnimation.ts` | 滚动动画 |

**统计**：共9个组合式函数

### 2.5 服务层（Services）

| 服务 | 文件路径 | 说明 |
| --- | --- | --- |
| common | `services/common.ts` | 通用服务 |
| crud | `services/crud.ts` | CRUD服务 |
| file | `services/file.ts` | 文件服务 |

**统计**：共3个服务文件

### 2.6 状态管理（Stores）

| Store | 文件路径 | 说明 |
| --- | --- | --- |
| app | `stores/app.ts` | 应用状态 |
| booking | `stores/booking.ts` | 预约状态 |
| error | `stores/error.ts` | 错误状态 |
| index | `stores/index.ts` | Pinia实例 |

**统计**：共4个Store文件

### 2.7 路由配置

| 文件 | 路径 | 说明 |
| --- | --- | --- |
| index.ts | `router/index.ts` | Vue Router 4配置（TypeScript） |
| router.js | `router/router.js` | 旧版路由配置（JavaScript，遗留） |

**路由统计**：
- 主路由：1个（/）
- 子路由：约60+个
- 路由守卫：已配置

### 2.8 工具函数（Common/Utils）

#### 2.8.1 Common目录

| 文件 | 说明 | 状态 |
| --- | --- | --- |
| http.ts | HTTP请求封装（axios） | ✅ TypeScript |
| storage.ts | 本地存储工具 | ✅ TypeScript |
| validate.ts | 表单验证工具 | ✅ TypeScript |
| system.ts | 系统工具函数 | ✅ TypeScript |
| des.ts | 加密解密工具 | ✅ TypeScript |
| errorHandler.ts | 错误处理 | ✅ TypeScript |
| cryptojs.js | CryptoJS封装 | ⚠️ JavaScript（遗留） |
| storage.js | 旧版存储工具 | ⚠️ JavaScript（遗留） |
| system.js | 旧版系统工具 | ⚠️ JavaScript（遗留） |
| validate.js | 旧版验证工具 | ⚠️ JavaScript（遗留） |
| des.js | 旧版加密工具 | ⚠️ JavaScript（遗留） |

#### 2.8.2 Utils目录

| 文件 | 说明 | 状态 |
| --- | --- | --- |
| animationConfig.ts | 动画配置 | ✅ TypeScript |
| csrf.ts | CSRF防护 | ✅ TypeScript |
| fileUpload.ts | 文件上传工具 | ✅ TypeScript |
| forceGraph.ts | 力导向图工具 | ✅ TypeScript |
| formatters.ts | 格式化工具 | ✅ TypeScript |
| mask.ts | 数据脱敏 | ✅ TypeScript |
| particleSystem.ts | 粒子系统工具 | ✅ TypeScript |
| secureStorage.ts | 安全存储 | ✅ TypeScript |
| security.ts | 安全工具 | ✅ TypeScript |
| validator.ts | 验证器 | ✅ TypeScript |

**统计**：共21个工具文件（11个TypeScript，10个JavaScript遗留）

### 2.9 配置文件（Config）

| 文件 | 说明 | 状态 |
| --- | --- | --- |
| config.ts | 应用配置 | ✅ TypeScript |
| menu.ts | 菜单配置 | ✅ TypeScript |
| modules.ts | 模块配置 | ✅ TypeScript |
| config.js | 旧版配置 | ⚠️ JavaScript（遗留） |
| menu.js | 旧版菜单配置 | ⚠️ JavaScript（遗留） |

**统计**：共5个配置文件（3个TypeScript，2个JavaScript遗留）

### 2.10 类型定义（Types）

| 文件 | 说明 |
| --- | --- |
| api.ts | API响应类型 |
| content.ts | 内容类型 |
| cryptojs.d.ts | CryptoJS类型定义 |
| menu.ts | 菜单类型 |
| modules.ts | 模块类型 |

**统计**：共5个类型定义文件

### 2.11 样式文件（Styles）

| 文件 | 说明 |
| --- | --- |
| design-tokens.scss | 设计令牌 |
| error-pages.scss | 错误页样式 |
| responsive.scss | 响应式样式 |
| theme.scss | 主题样式 |

**统计**：共4个样式文件

---

## 3. Admin项目代码结构

### 3.1 目录结构

```
springboot1ngh61a2/src/main/resources/admin/admin/src/
├── views/              # 视图组件（32个文件）
├── components/         # 组件库（16个文件）
├── utils/              # 工具函数（27个文件）
├── stores/             # 状态管理（4个文件）
├── router/             # 路由配置（2个文件）
├── constants/          # 常量配置（5个文件）
├── types/              # 类型定义（3个文件）
├── styles/             # 样式文件（2个文件）
├── icons/              # 图标资源（161个SVG）
├── assets/             # 静态资源
├── App.vue             # 根组件
├── main.ts             # 入口文件
└── env.d.ts            # 环境类型定义
```

### 3.2 视图组件（Views）

#### 3.2.1 系统页面

| 页面 | 路由 | 文件路径 |
| --- | --- | --- |
| 首页 | `/` | `views/home.vue` |
| 登录 | `/login` | `views/login.vue` |
| 注册 | `/register` | `views/register.vue` |
| 个人中心 | `/center` | `views/center.vue` |
| 修改密码 | `/updatePassword` | `views/update-password.vue` |
| 支付 | `/pay` | `views/pay.vue` |
| 404 | - | `views/404.vue` |
| 错误页 | - | `views/error/ErrorPage.vue` |
| 看板 | - | `views/board.vue` |
| 布局 | - | `views/index.vue` |

#### 3.2.2 模块管理页面

| 模块 | 路由 | 文件路径 |
| --- | --- | --- |
| 用户管理 | `/yonghu` | `views/modules/yonghu/list.vue` |
| 健身教练 | `/jianshenjiaolian` | `views/modules/jianshenjiaolian/list.vue` |
| 私教预约 | `/sijiaoyuyue` | `views/modules/sijiaoyuyue/list.vue` |
| 课程类型 | `/kechengleixing` | `views/modules/kechengleixing/list.vue` |
| 健身课程 | `/jianshenkecheng` | `views/modules/jianshenkecheng/list.vue` |
| 课程预约 | `/kechengyuyue` | `views/modules/kechengyuyue/list.vue` |
| 课程退课 | `/kechengtuike` | `views/modules/kechengtuike/list.vue` |
| 会员卡 | `/huiyuanka` | `views/modules/huiyuanka/list.vue` |
| 会员卡购买 | `/huiyuankagoumai` | `views/modules/huiyuankagoumai/list.vue` |
| 会员续费 | `/huiyuanxufei` | `views/modules/huiyuanxufei/list.vue` |
| 到期提醒 | `/daoqitixing` | `views/modules/daoqitixing/list.vue` |
| 健身器材 | `/jianshenqicai` | `views/modules/jianshenqicai/list.vue` |
| 新闻 | `/news` | `views/modules/news/list.vue` |
| 新闻类型 | `/newstype` | `views/modules/newstype/list.vue` |
| 课程讨论 | `/discussjianshenkecheng` | `views/modules/discussjianshenkecheng/list.vue` |
| 聊天 | `/chat` | `views/modules/chat/list.vue` |
| 配置 | `/config` | `views/modules/config/list.vue` |
| 资产 | `/assets` | `views/modules/assets/list.vue` |
| 服务状态 | `/service-status` | `views/modules/service-status/list.vue` |
| 法律条款 | `/legal-terms` | `views/modules/legal-terms/list.vue` |

#### 3.2.3 共享组件

| 组件 | 文件路径 |
| --- | --- |
| ModuleCrudPage | `views/modules/components/ModuleCrudPage.vue` |
| ModulePlaceholder | `views/modules/ModulePlaceholder.vue` |

**统计**：共32个视图文件

### 3.3 组件库（Components）

#### 3.3.1 布局组件

| 组件 | 文件路径 | 说明 |
| --- | --- | --- |
| IndexMain | `components/index/IndexMain.vue` | 主布局 |
| IndexHeader | `components/index/IndexHeader.vue` | 头部 |
| IndexAside | `components/index/IndexAside.vue` | 侧边栏（动态） |
| IndexAsideStatic | `components/index/IndexAsideStatic.vue` | 侧边栏（静态） |
| IndexAsideSub | `components/index/IndexAsideSub.vue` | 侧边栏子菜单 |
| TagsView | `components/index/TagsView/index.vue` | 标签视图 |
| ScrollPane | `components/index/TagsView/ScrollPane.vue` | 滚动面板 |

#### 3.3.2 通用组件

| 组件 | 文件路径 | 说明 |
| --- | --- | --- |
| BreadCrumbs | `components/common/BreadCrumbs.vue` | 面包屑 |
| FileUpload | `components/common/FileUpload.vue` | 文件上传 |
| ExcelFileUpload | `components/common/ExcelFileUpload.vue` | Excel上传 |
| Editor | `components/common/Editor.vue` | 富文本编辑器 |
| SafeHtml | `components/common/SafeHtml.vue` | 安全HTML |
| img | `components/common/img.vue` | 图片组件 |
| timeable | `components/common/timeable.vue` | 时间表 |
| SvgIcon | `components/SvgIcon/index.vue` | SVG图标 |

#### 3.3.3 图表组件

| 组件 | 文件路径 | 说明 |
| --- | --- | --- |
| echarts | `components/echarts/china.json` | 中国地图数据 |

**统计**：共16个组件文件

### 3.4 工具函数（Utils）

| 文件 | 说明 | 状态 |
| --- | --- | --- |
| http.ts | HTTP请求封装 | ✅ TypeScript |
| storage.ts | 本地存储 | ✅ TypeScript |
| validate.ts | 表单验证 | ✅ TypeScript |
| utils.ts | 通用工具 | ✅ TypeScript |
| base.ts | 基础配置 | ✅ TypeScript |
| des.ts | 加密解密 | ✅ TypeScript |
| menu.ts | 菜单工具 | ✅ TypeScript |
| api.ts | API端点 | ✅ TypeScript |
| i18n.ts | 国际化 | ✅ TypeScript |
| errorHandler.ts | 错误处理 | ✅ TypeScript |
| fileUpload.ts | 文件上传 | ✅ TypeScript |
| secureStorage.ts | 安全存储 | ✅ TypeScript |
| security.ts | 安全工具 | ✅ TypeScript |
| validator.ts | 验证器 | ✅ TypeScript |
| mask.ts | 数据脱敏 | ✅ TypeScript |
| csrf.ts | CSRF防护 | ✅ TypeScript |
| particles.js | 粒子系统 | ⚠️ JavaScript（遗留） |
| http.js | 旧版HTTP | ⚠️ JavaScript（遗留） |
| storage.js | 旧版存储 | ⚠️ JavaScript（遗留） |
| validate.js | 旧版验证 | ⚠️ JavaScript（遗留） |
| utils.js | 旧版工具 | ⚠️ JavaScript（遗留） |
| base.js | 旧版配置 | ⚠️ JavaScript（遗留） |
| des.js | 旧版加密 | ⚠️ JavaScript（遗留） |
| menu.js | 旧版菜单 | ⚠️ JavaScript（遗留） |
| api.js | 旧版API | ⚠️ JavaScript（遗留） |
| i18n.js | 旧版国际化 | ⚠️ JavaScript（遗留） |

**统计**：共27个工具文件（16个TypeScript，11个JavaScript遗留）

### 3.5 状态管理（Stores）

| Store | 文件路径 | 说明 |
| --- | --- | --- |
| tagsView | `stores/tagsView.ts` | 标签视图状态 |
| error | `stores/error.ts` | 错误状态 |
| index | `stores/index.ts` | Pinia实例 |

**统计**：共4个Store文件

### 3.6 路由配置

| 文件 | 路径 | 说明 |
| --- | --- | --- |
| index.ts | `router/index.ts` | Vue Router 4配置（TypeScript） |
| router-static.js | `router/router-static.js` | 静态路由配置（JavaScript，遗留） |

**路由统计**：
- 主路由：1个（/）
- 子路由：约30+个
- 路由守卫：已配置

### 3.7 常量配置（Constants）

| 文件 | 说明 | 状态 |
| --- | --- | --- |
| menu.ts | 菜单配置 | ✅ TypeScript |
| apiEndpoints.ts | API端点 | ✅ TypeScript |
| menu.js | 旧版菜单配置 | ⚠️ JavaScript（遗留） |
| apiEndpoints.js | 旧版API端点 | ⚠️ JavaScript（遗留） |
| sidebarStyles.js | 侧边栏样式 | ⚠️ JavaScript（遗留） |

**统计**：共5个常量文件（2个TypeScript，3个JavaScript遗留）

### 3.8 类型定义（Types）

| 文件 | 说明 |
| --- | --- |
| api.ts | API响应类型 |
| cryptojs.d.ts | CryptoJS类型定义 |
| menu.ts | 菜单类型 |

**统计**：共3个类型定义文件

### 3.9 样式文件（Styles）

| 文件 | 说明 |
| --- | --- |
| design-tokens.scss | 设计令牌 |
| theme.scss | 主题样式 |

**统计**：共2个样式文件

### 3.10 图标资源（Icons）

- SVG图标：161个
- 图标索引：`icons/index.ts`
- SVG目录：`icons/svg/`

---

## 4. 代码资产统计汇总

### 4.1 文件数量统计

| 类别 | Front项目 | Admin项目 | 总计 |
| --- | --- | --- | --- |
| 页面/视图组件 | 62 | 32 | 94 |
| 组件 | 37 | 16 | 53 |
| 组合式函数 | 9 | 0 | 9 |
| 服务 | 3 | 0 | 3 |
| Store | 4 | 4 | 8 |
| 工具函数（TS） | 11 | 16 | 27 |
| 工具函数（JS遗留） | 10 | 11 | 21 |
| 配置文件（TS） | 3 | 2 | 5 |
| 配置文件（JS遗留） | 2 | 3 | 5 |
| 类型定义 | 5 | 3 | 8 |
| 样式文件 | 4 | 2 | 6 |
| 路由配置 | 2 | 2 | 4 |
| **总计** | **152** | **91** | **243** |

### 4.2 技术栈统计

| 技术 | Front项目 | Admin项目 | 状态 |
| --- | --- | --- | --- |
| Vue 3 | ✅ | ✅ | 已迁移 |
| TypeScript | ✅ | ✅ | 已迁移 |
| Pinia | ✅ | ✅ | 已迁移 |
| Vue Router 4 | ✅ | ✅ | 已迁移 |
| Element Plus | ✅ | ✅ | 已迁移 |
| Vite | ✅ | ✅ | 已迁移 |
| JavaScript遗留 | ⚠️ 10个文件 | ⚠️ 11个文件 | 待清理 |

### 4.3 模块统计

| 业务模块 | Front页面数 | Admin页面数 | 需求文档 |
| --- | --- | --- | --- |
| 用户管理 | 3 | 1 | ✅ |
| 教练管理 | 3 | 1 | ✅ |
| 课程管理 | 9 | 1 | ✅ |
| 预约管理 | 9 | 2 | ✅ |
| 会员管理 | 12 | 3 | ✅ |
| 内容管理 | 6 | 2 | ✅ |
| 设施管理 | 3 | 1 | ✅ |
| 系统功能 | 10 | 10 | ✅ |

---

## 5. 代码质量指标

### 5.1 迁移完成度

- **Vue 3迁移**：100%（所有组件已迁移）
- **TypeScript迁移**：约70%（仍有21个JS遗留文件）
- **Pinia迁移**：100%（已完全迁移）
- **Vue Router 4迁移**：100%（已完全迁移）
- **Element Plus迁移**：100%（已完全迁移）

### 5.2 代码组织

- **模块化程度**：高（清晰的目录结构）
- **组件复用性**：中高（共享组件已建立）
- **类型安全**：中（部分遗留JS文件未类型化）
- **文档完整性**：中（需求文档齐全，代码注释待完善）

---

## 6. 待处理事项

### 6.1 遗留代码清理

- [ ] 清理Front项目的10个JavaScript遗留文件
- [ ] 清理Admin项目的11个JavaScript遗留文件
- [ ] 删除旧版路由配置文件（router.js/router-static.js）
- [ ] 删除备份文件（main.js.bak）

### 6.2 代码优化

- [ ] 统一工具函数命名规范
- [ ] 完善TypeScript类型定义
- [ ] 增加组件文档注释
- [ ] 优化组件复用性

### 6.3 文档完善

- [ ] 为每个组件添加使用说明
- [ ] 完善API文档
- [ ] 更新迁移状态文档

---

## 7. 更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
| --- | --- | --- | --- |
| 2025-11-15 | v1.0 | 初始版本，完成代码资产盘点 | - |

---

> 本文档需随代码变更及时更新，建议每次重大重构后同步更新资产清单。

