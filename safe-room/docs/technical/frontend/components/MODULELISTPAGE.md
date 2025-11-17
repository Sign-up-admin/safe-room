---
title: MODULELISTPAGE
version: v1.0.0
last_updated: 2025-11-17
status: active
category: technical
tags: [vue, component, frontend, page, list, shared, module]
---

# MODULELISTPAGE

> **版本**：v1.0.0
> **更新日期**：2025-11-17
> **组件类型**：页面组件（共享组件）
> **适用框架**：Vue 3 + TypeScript + Element Plus

ModuleListPage是一个通用的模块列表页面组件，为所有业务模块提供统一的列表展示、筛选、分页功能。

## ✨ 功能特性

- [x] **通用列表展示**：支持任意业务模块的数据列表
- [x] **动态筛选**：多条件组合筛选
- [x] **分页支持**：完整的分页导航
- [x] **排序功能**：多字段排序
- [x] **操作集成**：查看、编辑、删除等操作入口
- [x] **响应式设计**：适配移动端展示

## 🔧 API接口

| 属性名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| `moduleKey` | `ModuleKey` | 是 | 业务模块标识符 |
| `detailRoute` | `string` | 否 | 详情页面路由 |
| `editRoute` | `string` | 否 | 编辑页面路由 |

---

## 🔄 更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|----------|--------|
| 2025-11-17 | v1.0.0 | 初始版本 | 文档工程团队 |
