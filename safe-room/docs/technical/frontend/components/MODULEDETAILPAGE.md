---
title: MODULEDETAILPAGE
version: v1.0.0
last_updated: 2025-11-17
status: active
category: technical
tags: [vue, component, frontend, page, detail, shared, module]
---

# MODULEDETAILPAGE

> **版本**：v1.0.0
> **更新日期**：2025-11-17
> **组件类型**：页面组件（共享组件）
> **适用框架**：Vue 3 + TypeScript + Element Plus

ModuleDetailPage是一个通用的模块详情页面组件，为所有业务模块提供统一的详情查看和关联数据展示功能。

## ✨ 功能特性

- [x] **通用详情展示**：支持任意业务模块的详情数据
- [x] **关联数据查询**：支持通过关联字段查询数据
- [x] **导航集成**：返回列表页面的统一导航
- [x] **错误处理**：数据加载失败的友好提示
- [x] **加载状态**：骨架屏加载状态展示

## 🔧 API接口

| 属性名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| `moduleKey` | `ModuleKey` | 是 | 业务模块标识符 |
| `listRoute` | `string` | 是 | 列表页面路由路径 |

#### 路由参数
- `id`: 记录ID（直接查询）
- `followColumn` & `followValue`: 关联查询参数

---

## 🔄 更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|----------|--------|
| 2025-11-17 | v1.0.0 | 初始版本 | 文档工程团队 |
