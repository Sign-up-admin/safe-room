# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-16

### Added

#### 文档工程体系建设
- **文档分类体系**：建立 requirements/、technical/、development/、reports/ 等分类目录
- **文档自动化工具**：创建文档生成、校验、索引更新等自动化脚本
- **文档模板系统**：标准化需求文档、技术文档、变更日志等模板
- **文档导航中心**：完善 `docs/README.md` 作为文档导航枢纽

#### 文档内容完善
- **技术文档补充**：完善 API 参考文档、数据库架构说明、部署运维文档
- **测试文档体系**：建立完整的测试策略、实现指南、最佳实践文档体系
- **需求文档同步**：更新需求文档与代码实现的一致性，完善状态标识
- **报告文档整理**：整理测试报告、代码审查报告等，形成报告文档体系

#### 文档质量保障
- **文档格式统一**：统一文档元数据、命名规范、样式标准
- **链接验证机制**：建立文档内部链接有效性检查
- **版本管理机制**：建立文档版本控制和变更追踪
- **CI/CD 集成**：文档校验集成到持续集成流程

### Changed

- **README.md**：更新项目状态、技术栈版本、文档导航结构
- **docs/README.md**：升级为完整的文档导航中心
- **文档结构重组**：从平面结构升级为分类分层结构
- **文档数量**：从 56 份增加到 80+ 份文档

### Fixed

- 文档链接路径更新，确保所有内部链接有效
- 文档版本信息标准化
- 文档状态标识统一

## [1.0.0] - 2025-11-15

### Added

#### 核心架构与基础设施
- **多终端 Vue 3 应用架构**：前台站点与管理后台基于 Vue 3 + TypeScript + Vite
- **Spring Boot 后端服务**：Java 21 + MyBatis Plus + PostgreSQL，支持 20+ 业务模块
- **Docker 化部署**：完整的容器化方案，支持一键部署和数据库初始化
- **自动化测试体系**：前端 Vitest/Playwright，后端 JaCoCo 覆盖率测试

#### 前端组件库
- **通用组件系统**：
  - `ModuleCrudPage`：通用 CRUD 页面组件，支持权限控制和数据分页
  - `TechCard`、`TechButton`、`TechStepper`：科技风设计系统组件
  - `BookingCalendar`、`PaymentStepper`：业务专用组件
- **组合式 API 工具库**：
  - `useBookingConflict`、`usePaymentStatus`、`useHoverGlow` 等业务逻辑
  - `useAnimations`、`useParticleSystem`：动效与交互工具
- **响应式设计系统**：移动端优先，断点适配策略

#### 业务功能模块
- **课程管理**：课程列表、详情、预约、退课、讨论
- **教练系统**：教练列表、详情、私教预约、推荐算法
- **会员管理**：会员卡展示、购买、续费、到期提醒
- **支付系统**：多渠道支付、状态监控、订单管理
- **内容系统**：新闻列表、详情、收藏管理
- **设备展示**：健身器材展厅、3D 展示、教程

#### 文档体系
- **需求文档**：56 个页面需求文档，覆盖全站功能
- **技术文档**：架构设计、API 规范、数据库字典
- **开发指南**：贡献流程、代码规范、部署运维
- **安全文档**：前端安全实践、API 安全、隐私政策

### Changed

- **技术栈升级**：从 Vue 2 迁移至 Vue 3，引入 Composition API
- **构建工具**：从 Webpack 迁移至 Vite，提升开发体验
- **类型安全**：全栈 TypeScript 支持，提高代码质量
- **UI 设计**：采用科技风设计语言，增强用户体验

### Security

- 前端安全加固：CSRF 防护、XSS 防护、安全存储
- API 安全：JWT 认证、权限控制、输入验证
- 隐私合规：符合 GDPR 标准的数据处理流程

## [0.1.0] - 2024-11-01

### Added

- 项目基础架构搭建
- 根目录 `README.md`，提供项目简介、技术栈、快速开始与文档导航
- `docs/DEVELOPMENT.md`：开发者指南
- `docs/README.md`：文档索引
- `docs/ARCHITECTURE.md`：系统架构说明
- `docs/API.md`：后端接口概览
- `docs/DATABASE.md`：数据库设计文档
- `CONTRIBUTING.md`：贡献指南
- `CHANGELOG.md`：变更记录

### Updated

- 文档结构统一引用路径，指向新建文档

[1.0.0]: https://github.com/your-org/safe-room/releases/tag/v1.0.0
[0.1.0]: https://github.com/your-org/safe-room/releases/tag/v0.1.0

