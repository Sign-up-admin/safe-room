---
title: DOC CLASSIFICATION STANDARDS
version: v1.1.0
last_updated: 2025-11-17
status: active
category: technical
tags: [documentation, classification, standards, organization]
---

# 文档分类标准

> **版本**：v1.1.0
> **更新日期**：2025-11-17
> **适用范围**：所有文档贡献者
> **状态**：active

---

## 📋 目录

- [概述](#概述)
- [分类体系](#分类体系)
- [分类标准](#分类标准)
- [文件命名规范](#文件命名规范)
- [路径结构](#路径结构)
- [分类变更流程](#分类变更流程)
- [相关文档](#相关文档)

---

## 📖 概述

本文档定义了健身房综合管理系统项目的文档分类标准，确保文档能够按照统一的规则进行组织和管理，提高文档的可维护性和可查找性。

### 目的

- **统一性**：建立统一的文档分类标准
- **可维护性**：便于文档的组织和管理
- **可查找性**：提高文档的查找效率
- **一致性**：确保文档分类的一致性

---

## 🗂️ 分类体系

### 主要分类

项目采用四级分类体系：

#### 1. requirements（需求文档）
**路径**：`docs/requirements/`

**适用场景**：
- 用户需求描述
- 功能需求规范
- 界面设计需求
- 业务逻辑需求
- 验收标准定义

**示例**：
- `FRONTEND_REQUIREMENTS.md`
- `ADMIN_LOGIN_REQUIREMENTS.md`
- `PAYMENT_REQUIREMENTS.md`

#### 2. technical（技术文档）
**路径**：`docs/technical/`

**适用场景**：
- 系统架构设计
- API接口规范
- 数据库设计
- 部署运维文档
- 技术实现说明

**子分类**：
- `technical/frontend/` - 前端技术文档
  - `technical/frontend/components/` - 组件技术文档
  - `technical/frontend/composables/` - 组合式函数文档
  - `technical/frontend/api/` - 前端API接口文档
- `technical/backend/` - 后端技术文档
  - `technical/backend/api/` - 后端API文档
  - `technical/backend/service/` - 服务层文档
  - `technical/backend/database/` - 数据库文档

#### 3. development（开发文档）
**路径**：`docs/development/`

**适用场景**：
- 开发环境搭建
- 开发流程指南
- 测试策略和规范
- 代码规范和最佳实践
- 开发工具使用

**子分类**：
- `development/guides/` - 开发指南
- `development/testing/` - 测试文档

#### 4. reports（报告文档）
**路径**：`docs/reports/`

**适用场景**：
- 测试结果报告
- 代码审查报告
- 质量分析报告
- 项目进展报告
- 性能测试报告

**命名要求**：报告文档文件名必须包含 `_REPORT` 或 `CODE_REVIEW`

---

## 📏 分类标准

### 需求文档 (requirements)

#### 必须包含
- 用户故事或功能描述
- 验收标准
- 界面原型或设计要求
- 业务规则说明

#### 分类依据
- 是否描述用户需求 ✓
- 是否定义功能规格 ✓
- 是否包含验收标准 ✓

### 技术文档 (technical)

#### 必须包含
- 技术实现细节
- 系统架构说明
- 接口或数据结构定义
- 配置和部署信息

#### 分类依据
- 是否涉及技术实现 ✓
- 是否包含代码相关内容 ✓
- 是否描述系统架构 ✓

### 开发文档 (development)

#### 必须包含
- 开发流程说明
- 工具使用指南
- 代码规范定义
- 测试策略描述

#### 分类依据
- 是否指导开发活动 ✓
- 是否描述开发流程 ✓
- 是否包含工具使用说明 ✓

### 报告文档 (reports)

#### 必须包含
- 数据分析结果
- 测试或审查结论
- 问题发现和建议
- 度量指标统计

#### 分类依据
- 是否包含数据分析 ✓
- 是否提供结论和建议 ✓
- 是否属于报告性质 ✓

---

## 📝 文件命名规范

### 通用规则

1. **全大写**：使用全大写字母和下划线
2. **英文单词**：使用英文单词，避免中文
3. **语义清晰**：命名应准确反映文档内容
4. **长度适中**：控制在3-5个英文单词以内

### 分类命名模式

#### 需求文档
```
[模块名称]_REQUIREMENTS.md
[页面名称]_REQUIREMENTS.md
[功能名称]_REQUIREMENTS.md
```

**示例**：
- `USER_LOGIN_REQUIREMENTS.md`
- `PAYMENT_PROCESS_REQUIREMENTS.md`
- `ADMIN_DASHBOARD_REQUIREMENTS.md`

#### 技术文档
```
[主题]_ARCHITECTURE.md
API.md / API_REFERENCE.md
DATABASE.md / DATABASE_SCHEMA.md
[功能]_TECHNICAL.md
```

**示例**：
- `SYSTEM_ARCHITECTURE.md`
- `API_REFERENCE.md`
- `DATABASE_SCHEMA.md`

#### 开发文档
```
[主题]_GUIDE.md
TESTING_[主题].md
[工具]_GUIDE.md
```

**示例**：
- `DEVELOPMENT_GUIDE.md`
- `TESTING_STRATEGY.md`
- `GIT_WORKFLOW_GUIDE.md`

#### 报告文档
```
[主题]_REPORT_[日期].md
CODE_REVIEW_REPORT_[日期].md
[项目]_ANALYSIS_REPORT.md
```

**示例**：
- `TEST_COVERAGE_REPORT_2025-11-16.md`
- `CODE_REVIEW_REPORT_2025-11-15.md`
- `PERFORMANCE_ANALYSIS_REPORT.md`

### 特殊文档

#### 索引文档
- `INDEX.md` - 分类索引
- `README.md` - 项目说明（根目录）

#### 模板文档
- `[主题]_TEMPLATE.md` - 模板文件
- `PAGE_REQUIREMENTS_TEMPLATE.md`

#### 导航文档
- `NAVIGATION.md` - 文档导航

---

## 🗂️ 路径结构

### 标准路径结构

```
docs/
├── requirements/           # 需求文档
│   ├── frontend/          # 前端需求
│   ├── admin/             # 管理后台需求
│   └── INDEX.md           # 需求文档索引
├── technical/             # 技术文档
│   ├── frontend/          # 前端技术文档
│   │   ├── components/    # 组件技术文档
│   │   ├── composables/   # 组合式函数文档
│   │   └── api/          # 前端API接口文档
│   ├── backend/           # 后端技术文档
│   │   ├── api/          # 后端API文档
│   │   ├── service/      # 服务层文档
│   │   └── database/     # 数据库文档
│   └── INDEX.md          # 技术文档索引
├── development/           # 开发文档
│   ├── guides/           # 开发指南
│   ├── testing/          # 测试文档
│   └── INDEX.md          # 开发文档索引
├── reports/              # 报告文档
│   ├── quality/          # 质量报告
│   ├── coverage/         # 覆盖率报告
│   └── INDEX.md          # 报告文档索引
├── templates/            # 文档模板
├── scripts/              # 自动化脚本
├── DOC_CLASSIFICATION_STANDARDS.md  # 本文档
├── DOCUMENTATION_GUIDE.md           # 文档编写指南
├── INDEX.md              # 主索引
├── NAVIGATION.md         # 导航中心
└── README.md             # 项目说明
```

### 路径一致性检查

文档的分类头部必须与其实际路径保持一致：

- `category: requirements` → 路径应为 `docs/requirements/`
- `category: technical` → 路径应为 `docs/technical/`
- `category: development` → 路径应为 `docs/development/`
- `category: reports` → 路径应为 `docs/reports/`

---

## 🔄 分类变更流程

### 分类变更申请

1. **识别问题**：发现文档分类不合理的情况
2. **分析原因**：确定正确的分类和路径
3. **准备方案**：制定文档移动和链接更新的方案

### 执行变更

1. **备份文档**：使用重组工具创建备份
2. **移动文档**：使用 `reorganize-docs.js` 执行移动
3. **更新链接**：自动更新所有相关文档的内部链接
4. **验证结果**：运行校验工具确认变更正确

### 验证与确认

1. **格式校验**：确保文档头部信息正确
2. **链接校验**：确保所有内部链接有效
3. **索引更新**：更新相关索引文件
4. **功能测试**：确认文档导航正常工作

---

## 📚 相关文档

### 内部文档

- [文档编写指南](development/DOCUMENTATION_GUIDE.md) - 文档编写规范
- [文档索引](INDEX.md) - 文档导航中心
- [文档工具使用指南](development/guides/DOC_TOOLS_GUIDE.md) - 自动化工具说明

### 外部资源

- [Markdown 规范](https://www.markdownguide.org/) - Markdown 语法标准
- [语义化版本](https://semver.org/) - 版本号规范
- [文档工程最佳实践](https://www.writethedocs.org/) - 文档工程社区

---

## 🔄 更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|----------|--------|
| 2025-11-17 | v1.1.0 | 更新技术文档分类，增加前端/后端子目录结构 | 文档工程团队 |
| 2025-11-16 | v1.0.0 | 初始版本，建立文档分类标准 | 文档工程团队 |

---
