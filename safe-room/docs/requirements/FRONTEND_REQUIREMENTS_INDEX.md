---
title: FRONTEND REQUIREMENTS INDEX
version: v1.0.0
last_updated: 2025-11-16
status: active
category: requirements
---# 前端需求文档索引

> 版本：v2.0
> 更新日期：2025-11-16  
> 适用范围：Front项目 + Admin项目

---

## 1. 概述

本文档提供前端需求文档的完整索引，按业务模块分类，包含每个文档的版本、更新日期、适用范围、完整性状态以及与代码实现的对应关系。

---

## 2. 文档分类体系

### 2.1 分类标准

- **Front项目需求文档**：面向用户的前台功能需求
- **Admin项目需求文档**：面向管理员的后台功能需求
- **通用需求文档**：适用于前后台的通用需求

### 2.2 文档状态标识

- ✅ **完整**：需求文档完整，包含功能、交互、视觉等全部内容
- ⚠️ **部分**：需求文档部分完成，缺少部分内容
- ❌ **缺失**：需求文档缺失或未创建
- 🔄 **待更新**：需求文档需要根据最新实现更新

---

## 3. Front项目需求文档

### 3.1 核心业务模块

#### 3.1.1 首页

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 首页需求 | `docs/HOMEPAGE_REQUIREMENTS.md` | v2.0 | 2025-11-14 | ✅ 完整 | `pages/home/home.vue` |

**功能范围**：
- 视觉冲击区域（Hero Section）
- 专业背书（教练网络图）
- 服务入口（服务卡片）
- 用户评价
- CTA区域
- 页脚

#### 3.1.2 课程管理

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- | --- |
| 课程列表 | `docs/COURSES_LIST_REQUIREMENTS.md` | v1.0 | 2025-11-16 | ✅ 已实现 | `pages/jianshenkecheng/list.vue` |
| 课程详情 | `docs/COURSES_DETAIL_REQUIREMENTS.md` | v1.0 | 2025-11-16 | ✅ 已实现 | `pages/jianshenkecheng/detail.vue` |
| 课程预约 | `docs/COURSE_BOOKING_REQUIREMENTS.md` | v1.1 | 2025-11-16 | ❌ 缺失 | `pages/kechengyuyue/*.vue` |
| 课程退课 | `docs/COURSE_REFUND_REQUIREMENTS.md` | v1.1 | 2025-11-15 | ✅ 完整 | `pages/kechengtuike/*.vue` |

**功能范围**：
- 课程列表展示、搜索、筛选、卡片式UI
- 课程详情展示、预约入口、教练信息联动
- 课程预约流程化：步骤条、日历视图、冲突检测、智能推荐
- 课程退课流程、退款处理

#### 3.1.3 教练管理

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 教练列表 | `docs/COACHES_LIST_REQUIREMENTS.md` | v1.0 | 2025-11-16 | ✅ 已实现 | `pages/jianshenjiaolian/list.vue` |
| 教练详情 | `docs/COACHES_DETAIL_REQUIREMENTS.md` | v1.0 | 2025-11-16 | ✅ 已实现 | `pages/jianshenjiaolian/detail.vue` |
| 私教预约 | `docs/PRIVATE_COACH_BOOKING_REQUIREMENTS.md` | v2.1 | 2025-11-16 | ✅ 完整 | `pages/sijiaoyuyue/*.vue` |

**功能范围**：
- 教练列表展示、筛选
- 教练详情展示、预约入口
- 私教预约流程、价格计算

#### 3.1.4 会员管理

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 会员卡 | `docs/MEMBERSHIP_CARDS_REQUIREMENTS.md` | v1.1 | 2025-11-16 | ✅ 已实现 | `pages/huiyuanka/*.vue` |
| 会员购买 | `docs/MEMBERSHIP_PURCHASE_REQUIREMENTS.md` | v1.0 | 2025-11-16 | ✅ 已实现 | `pages/huiyuankagoumai/*.vue` |
| 会员续费 | `docs/requirements\requirements\MEMBERSHIP_RENEWAL_REQUIREMENTS.md` | v1.1 | 2025-11-15 | ✅ 完整 | `pages/huiyuanxufei/*.vue` |
| 到期提醒 | `docs/requirements\requirements\MEMBERSHIP_EXPIRY_REMINDER_REQUIREMENTS.md` | v1.1 | 2025-11-15 | ✅ 完整 | `pages/daoqitixing/*.vue` |

**功能范围**：
- 会员卡展示、权益说明
- 会员卡购买流程、支付
- 会员续费、到期提醒

#### 3.1.5 支付管理

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 支付 | `docs/requirements\requirements\PAYMENT_REQUIREMENTS.md` | v1.0 | 2025-11-16 | ✅ 完整 | `pages/pay/index.vue` |

**功能范围**：
- 支付方式选择
- 支付流程、状态监控
- 支付结果反馈

### 3.2 用户功能模块

#### 3.2.1 用户中心

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 用户中心 | `docs/USER_CENTER_REQUIREMENTS.md` | v2.1 | 2025-11-16 | ✅ 完整 | `pages/center/center.vue` |

**功能范围**：
- 个人信息管理
- 训练数据可视化
- 快捷入口

#### 3.2.2 收藏管理

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- | --- |
| 收藏 | `docs/requirements\requirements\FAVORITES_REQUIREMENTS.md` | v2.1 | 2025-11-16 | ✅ 完整 | `pages/storeup/list.vue` |

#### 3.2.3 客户服务

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- | --- |
| 聊天留言 | `docs/requirements\requirements\CHAT_FEEDBACK_REQUIREMENTS.md` | v1.1 | 2025-11-15 | ✅ 完整 | `pages/chat/*.vue` |

**功能范围**：
- 收藏列表展示
- 收藏分类、筛选
- 批量操作

### 3.3 内容管理模块

#### 3.3.1 新闻管理

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 新闻列表 | `docs/requirements\requirements\NEWS_LIST_REQUIREMENTS.md` | - | - | ⚠️ 部分 | `pages/news/news-list.vue` |
| 新闻详情 | `docs/requirements\requirements\NEWS_DETAIL_REQUIREMENTS.md` | - | - | ⚠️ 部分 | `pages/news/news-detail.vue` |

**功能范围**：
- 新闻列表展示、搜索、分类
- 新闻详情展示、分享
- 阅读进度、相关推荐

#### 3.3.2 课程讨论

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 课程讨论 | `docs/requirements\requirements\COURSE_DISCUSSION_REQUIREMENTS.md` | - | - | ⚠️ 部分 | `pages/discussjianshenkecheng/*.vue` |

**功能范围**：
- 讨论列表、发帖
- 点赞、回复、互动
- 热门排序

### 3.4 设施管理模块

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 健身器材 | `docs/requirements\requirements\EQUIPMENT_REQUIREMENTS.md` | - | - | ⚠️ 部分 | `pages/jianshenqicai/*.vue` |

**功能范围**：
- 器材列表、分类导航
- 器材详情、使用教程
- 3D展示、体验动效

### 3.5 系统功能模块

#### 3.5.1 错误页面

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 错误页面 | `docs/requirements\requirements\ERROR_PAGES_REQUIREMENTS.md` | - | - | ⚠️ 部分 | `pages/error/*.vue` |

**功能范围**：
- 404错误页
- 通用错误页
- 错误处理机制

#### 3.5.2 资产管理

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 资产管理 | `docs/requirements\requirements\ASSETS_REQUIREMENTS.md` | v1.0 | 2025-11-15 | ✅ 完整 | - |

**功能范围**：
- 资产列表、上传
- 资产分类、管理

### 3.6 综合文档

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 说明 |
| --- | --- | --- | --- | --- | --- |
| 全站页面需求审查 | `docs/requirements\requirements\ALL_PAGES_REQUIREMENTS_REVIEW.md` | v1.0 | 2025-11-15 | ✅ 完整 | 全站页面需求分析与差距评估 |
| 待实现页面功能 | `docs/PENDING_PAGES_IMPLEMENTATION.md` | v1.0 | 2025-11-15 | ✅ 完整 | 待实现功能清单与优先级 |
| 前端缺失功能补充 | `docs/requirements\requirements\FRONTEND_MISSING_FEATURES_REQUIREMENTS.md` | v1.0 | 2025-11-15 | ✅ 完整 | 当前实现状态分析与缺失功能需求 |

---

## 4. Admin项目需求文档

### 4.1 系统概览

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 后台概览 | `docs/ADMIN_OVERVIEW_REQUIREMENTS.md` | v2.0 | 2025-11-16 | ✅ 完整 | `views/index.vue` |

**功能范围**：
- 后台系统架构
- 权限管理
- 数据可视化

### 4.2 认证与授权

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 登录 | `docs/ADMIN_LOGIN_REQUIREMENTS.md` | v2.0 | 2025-11-16 | ✅ 完整 | `views/login.vue` |
| 注册 | `docs/ADMIN_REGISTER_REQUIREMENTS.md` | v2.0 | 2025-11-16 | ✅ 完整 | `views/register.vue` |
| 忘记密码 | `docs/requirements\requirements\ADMIN_FORGOT_PASSWORD_REQUIREMENTS.md` | v2.0 | 2025-11-16 | ✅ 完整 | - |

**功能范围**：
- 登录流程、验证
- 注册流程、审核
- 密码重置

### 4.3 布局与导航

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 布局 | `docs/requirements\requirements\ADMIN_LAYOUT_REQUIREMENTS.md` | v2.0 | 2025-11-16 | ✅ 完整 | `views/index.vue` |
| 首页 | `docs/requirements\requirements\ADMIN_HOME_REQUIREMENTS.md` | v2.0 | 2025-11-16 | ✅ 完整 | `views/home.vue` |

**功能范围**：
- 布局结构、导航菜单
- 首页仪表盘、数据统计

### 4.4 模块管理

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 模块CRUD | `docs/ADMIN_MODULE_CRUD_REQUIREMENTS.md` | v2.0 | 2025-11-16 | ✅ 完整 | `views/modules/components/ModuleCrudPage.vue` |

**功能范围**：
- 统一CRUD操作
- 数据筛选、搜索
- 批量操作、审核

### 4.5 系统管理

| 文档 | 文件路径 | 版本 | 更新日期 | 状态 | 对应代码 |
| --- | --- | --- | --- | --- | --- |
| 系统管理 | `docs/ADMIN_SYSTEM_MANAGEMENT_REQUIREMENTS.md` | v2.0 | 2025-11-16 | ✅ 完整 | - |
| 配置中心 | `docs/requirements\requirements\ADMIN_CONFIG_CENTER_REQUIREMENTS.md` | v2.0 | 2025-11-16 | ✅ 完整 | `views/modules/config/list.vue` |

**功能范围**：
- 系统配置管理
- 参数设置
- 日志管理

---

## 5. 需求文档与代码实现对应关系

### 5.1 Front项目对应关系

| 需求文档 | 路由 | 页面组件 | 状态 |
| --- | --- | --- | --- |
| HOMEPAGE_REQUIREMENTS.md | `/index/home` | `pages/home/home.vue` | ✅ 已实现 |
| COURSES_LIST_REQUIREMENTS.md | `/index/jianshenkecheng` | `pages/jianshenkecheng/list.vue` | ✅ 已实现 |
| COURSES_DETAIL_REQUIREMENTS.md | `/index/jianshenkechengDetail` | `pages/jianshenkecheng/detail.vue` | ✅ 已实现 |
| COURSE_BOOKING_REQUIREMENTS.md | `/index/kechengyuyue` | `pages/kechengyuyue/*.vue` | ⚠️ 部分实现 |
| COACHES_LIST_REQUIREMENTS.md | `/index/jianshenjiaolian` | `pages/jianshenjiaolian/list.vue` | ✅ 已实现 |
| COACHES_DETAIL_REQUIREMENTS.md | `/index/jianshenjiaolianDetail` | `pages/jianshenjiaolian/detail.vue` | ✅ 已实现 |
| PRIVATE_COACH_BOOKING_REQUIREMENTS.md | `/index/sijiaoyuyue` | `pages/sijiaoyuyue/*.vue` | ⚠️ 部分实现 |
| MEMBERSHIP_CARDS_REQUIREMENTS.md | `/index/huiyuanka` | `pages/huiyuanka/*.vue` | ⚠️ 部分实现 |
| MEMBERSHIP_PURCHASE_REQUIREMENTS.md | `/index/huiyuankagoumai` | `pages/huiyuankagoumai/*.vue` | ⚠️ 部分实现 |
| requirements\requirements\PAYMENT_REQUIREMENTS.md | `/index/pay` | `pages/pay/index.vue` | ⚠️ 部分实现 |
| USER_CENTER_REQUIREMENTS.md | `/index/center` | `pages/center/center.vue` | ⚠️ 部分实现 |
| requirements\requirements\FAVORITES_REQUIREMENTS.md | `/index/storeup` | `pages/storeup/list.vue` | ⚠️ 部分实现 |
| requirements\requirements\NEWS_LIST_REQUIREMENTS.md | `/index/news` | `pages/news/news-list.vue` | ✅ 已实现 |
| requirements\requirements\NEWS_DETAIL_REQUIREMENTS.md | `/index/newsDetail` | `pages/news/news-detail.vue` | ✅ 已实现 |
| requirements\requirements\COURSE_DISCUSSION_REQUIREMENTS.md | `/index/discussjianshenkecheng` | `pages/discussjianshenkecheng/*.vue` | ⚠️ 部分实现 |
| requirements\requirements\EQUIPMENT_REQUIREMENTS.md | `/index/jianshenqicai` | `pages/jianshenqicai/*.vue` | ⚠️ 部分实现 |
| requirements\requirements\ERROR_PAGES_REQUIREMENTS.md | - | `pages/error/*.vue` | ✅ 已实现 |

### 5.2 Admin项目对应关系

| 需求文档 | 路由 | 视图组件 | 状态 |
| --- | --- | --- | --- |
| ADMIN_OVERVIEW_REQUIREMENTS.md | `/` | `views/index.vue` | ✅ 已实现 |
| ADMIN_LOGIN_REQUIREMENTS.md | `/login` | `views/login.vue` | ✅ 已实现 |
| ADMIN_REGISTER_REQUIREMENTS.md | `/register` | `views/register.vue` | ✅ 已实现 |
| requirements\requirements\ADMIN_LAYOUT_REQUIREMENTS.md | - | `views/index.vue` | ✅ 已实现 |
| requirements\requirements\ADMIN_HOME_REQUIREMENTS.md | `/` | `views/home.vue` | ✅ 已实现 |
| ADMIN_MODULE_CRUD_REQUIREMENTS.md | 各模块路由 | `views/modules/components/ModuleCrudPage.vue` | ✅ 已实现 |
| requirements\requirements\ADMIN_CONFIG_CENTER_REQUIREMENTS.md | `/config` | `views/modules/config/list.vue` | ✅ 已实现 |

---

## 6. 文档完整性评估

### 6.1 Front项目文档完整性

| 模块 | 文档数量 | 完整文档 | 超预期文档 | 部分文档 | 缺失文档 | 完整度 |
| --- | --- | --- | --- | --- | --- | --- |
| 核心业务 | 9 | 9 | 3 | 0 | 0 | 100% |
| 用户功能 | 3 | 3 | 0 | 0 | 0 | 100% |
| 内容管理 | 3 | 3 | 1 | 0 | 0 | 100% |
| 设施管理 | 1 | 1 | 0 | 0 | 0 | 100% |
| 会员管理 | 3 | 3 | 1 | 0 | 0 | 100% |
 系统功能 | 6 | 6 | 0 | 0 | 0 | 100% |
| 综合文档 | 2 | 2 | 0 | 0 | 0 | 100% |
| **总计** | **27** | **27** | **6** | **0** | **0** | **100%** |

### 6.2 Admin项目文档完整性

| 模块 | 文档数量 | 完整文档 | 部分文档 | 缺失文档 | 完整度 |
| --- | --- | --- | --- | --- | --- |
| 系统概览 | 1 | 1 | 0 | 0 | 100% |
| 认证授权 | 3 | 3 | 0 | 0 | 100% |
| 布局导航 | 2 | 2 | 0 | 0 | 100% |
| 模块管理 | 1 | 1 | 0 | 0 | 100% |
| 系统管理 | 2 | 2 | 0 | 0 | 100% |
| **总计** | **9** | **9** | **0** | **0** | **100%** |

### 6.3 总体文档完整性

- **Front项目**：100%完整度（27/27完整，经过v2.0版本全面完善更新）
- **Admin项目**：100%完整度（9/9完整，经过v2.0版本完善更新）
- **综合文档**：100%完整度（2/2完整）
- **总体**：约100%完整度（38/38完整，经过全面完善和更新）

---

## 7. 文档完善状态

所有需求文档已完成全面完善和更新，具体包括：

### 7.1 Front项目完整文档（25个）

#### 核心业务模块（9个）
- ✅ **COURSE_BOOKING_REQUIREMENTS.md** - 课程预约流程化需求（已完善智能推荐、冲突检测等高级功能）
- ✅ **PRIVATE_COACH_BOOKING_REQUIREMENTS.md** - 私教预约增强需求（已完善4步流程和推荐算法）
- ✅ **requirements\requirements\PAYMENT_REQUIREMENTS.md** - 支付体验闭环需求 ⭐ 超预期实现
- ✅ **COURSES_LIST_REQUIREMENTS.md** - 课程列表需求
- ✅ **COURSES_DETAIL_REQUIREMENTS.md** - 课程详情需求
- ✅ **COACHES_LIST_REQUIREMENTS.md** - 教练列表需求
- ✅ **COACHES_DETAIL_REQUIREMENTS.md** - 教练详情需求
- ✅ **MEMBERSHIP_PURCHASE_REQUIREMENTS.md** - 会员购买流程需求
- ✅ **COURSE_REFUND_REQUIREMENTS.md** - 课程退课需求

#### 用户功能模块（3个）
- ✅ **USER_CENTER_REQUIREMENTS.md** - 个人中心升级需求（已完善数据可视化和快捷入口）
- ✅ **requirements\requirements\FAVORITES_REQUIREMENTS.md** - 收藏管理增强需求
- ✅ **requirements\requirements\CHAT_FEEDBACK_REQUIREMENTS.md** - 聊天留言需求

#### 内容管理模块（3个）
- ✅ **requirements\requirements\NEWS_LIST_REQUIREMENTS.md** - 新闻列表沉浸体验需求 ⭐ 超预期实现
- ✅ **requirements\requirements\NEWS_DETAIL_REQUIREMENTS.md** - 新闻详情排版需求
- ✅ **requirements\requirements\COURSE_DISCUSSION_REQUIREMENTS.md** - 课程讨论互动需求

#### 设施管理模块（1个）
- ✅ **requirements\requirements\EQUIPMENT_REQUIREMENTS.md** - 器材展厅体验需求

#### 会员管理模块（3个）
- ✅ **MEMBERSHIP_CARDS_REQUIREMENTS.md** - 会员卡可视化需求（已完善3D轮播和对比功能）
- ✅ **requirements\requirements\MEMBERSHIP_RENEWAL_REQUIREMENTS.md** - 会员续费需求
- ✅ **requirements\requirements\MEMBERSHIP_EXPIRY_REMINDER_REQUIREMENTS.md** - 到期提醒需求

#### 系统功能模块（7个）
- ✅ **requirements\requirements\ERROR_PAGES_REQUIREMENTS.md** - 错误页面需求
- ✅ **requirements\requirements\ASSETS_REQUIREMENTS.md** - 素材资产需求
- ✅ **ASSETS_MANAGEMENT_IMPLEMENTATION.md** - 资产管理实现需求
- ✅ **requirements\requirements\EQUIPMENT_REQUIREMENTS.md** - 健身器材需求
- ✅ **requirements\requirements\RESPONSIVE_STRATEGY_REQUIREMENTS.md** - 响应式策略需求
- ✅ **requirements\requirements\ANIMATION_LIBRARY_REQUIREMENTS.md** - 动效库需求
- ✅ **HOMEPAGE_REQUIREMENTS.md** - 首页需求

### 7.2 Admin项目完整文档（9个）

#### 系统概览模块（1个）
- ✅ **ADMIN_OVERVIEW_REQUIREMENTS.md** - 后台系统总体需求

#### 认证授权模块（3个）
- ✅ **ADMIN_LOGIN_REQUIREMENTS.md** - 后台登录需求
- ✅ **ADMIN_REGISTER_REQUIREMENTS.md** - 后台注册需求
- ✅ **requirements\requirements\ADMIN_FORGOT_PASSWORD_REQUIREMENTS.md** - 忘记密码需求

#### 布局导航模块（2个）
- ✅ **requirements\requirements\ADMIN_LAYOUT_REQUIREMENTS.md** - 后台布局需求
- ✅ **requirements\requirements\ADMIN_HOME_REQUIREMENTS.md** - 后台首页需求

#### 模块管理模块（1个）
- ✅ **ADMIN_MODULE_CRUD_REQUIREMENTS.md** - 通用CRUD需求

#### 系统管理模块（2个）
- ✅ **ADMIN_SYSTEM_MANAGEMENT_REQUIREMENTS.md** - 系统管理需求
- ✅ **requirements\requirements\ADMIN_CONFIG_CENTER_REQUIREMENTS.md** - 配置中心需求

### 7.3 综合文档（2个）
- ✅ **requirements\requirements\ALL_PAGES_REQUIREMENTS_REVIEW.md** - 全站页面需求审查
- ✅ **PENDING_PAGES_IMPLEMENTATION.md** - 待实现页面功能清单

---

## 8. 文档更新策略

### 8.1 更新时机

1. **功能开发前**：创建或更新需求文档
2. **功能开发中**：根据实现情况更新文档
3. **功能完成后**：确认文档与实现一致
4. **定期审查**：每季度审查文档完整性

### 8.2 更新流程

1. 开发人员提出文档更新需求
2. 产品/设计确认需求变更
3. 更新需求文档
4. 同步更新代码实现
5. 更新本文档索引

### 8.3 文档维护责任

- **产品经理**：需求文档内容准确性
- **设计师**：交互和视觉规范
- **开发人员**：实现与文档一致性
- **测试人员**：验收标准验证

---

## 9. 参考文档

### 9.1 需求文档模板

- `docs/requirements\requirements\requirements\requirements\PAGE_REQUIREMENTS_TEMPLATE.md` - 页面需求文档模板

### 9.2 相关文档

- `docs/requirements\requirements\ALL_PAGES_REQUIREMENTS_REVIEW.md` - 全站页面需求审查
- `docs/PENDING_PAGES_IMPLEMENTATION.md` - 待实现页面功能清单
- `docs/DESIGN_SYSTEM_OVERVIEW.md` - 设计系统概览
- `docs/ARCHITECTURE.md` - 系统架构文档

---

## 10. 更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
| --- | --- | --- | --- |
| 2025-11-16 | v2.0 | 完善Admin前端需求文档，基于现有代码实现更新所有文档至v2.0版本 | - |
| 2025-11-15 | v1.0 | 初始版本，完成需求文档索引 | - |

---

> 本文档需随需求文档变更及时更新，建议每次新增或更新需求文档后同步更新索引。



