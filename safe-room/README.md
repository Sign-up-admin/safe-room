## 项目简介

本仓库 `safe-room` 承载了健身房综合管理系统。项目包含 Spring Boot 后端、Vue 3 前台站点与 Vue 3 管理后台，并提供 Docker 化数据库、自动化测试、代码检查与完善的需求/规范文档体系，旨在支撑课程、教练、会员、预约、支付等业务端到端交付。

## 核心特性

- **多终端体验**：前台站点与后台控制台均基于 Vue 3 + TypeScript + Vite，支持现代交互与组件化开发。
- **模块化后端**：Spring Boot + MyBatis Plus + PostgreSQL，覆盖 25+ 业务域（课程、教练、预约、会员等），并集成 JaCoCo 覆盖率测试。
- **自动化能力**：`mvn test` 触发 MockMvc 集成测试与 service 层单测，前端提供 Vitest/Playwright 与完善的 lint/format 工具链。
- **完善文档体系**：包含 80+ 份技术文档、需求文档、测试报告与开发指南，支持团队高效协同。

## 技术栈总览

| 层级 | 技术 |
| --- | --- |
| 后端 | Java 21、Spring Boot、MyBatis Plus、PostgreSQL、Maven、JaCoCo |
| 前端（用户站点 / 管理后台） | Vue 3、TypeScript、Vite、Pinia、Vue Router、Element Plus、GSAP、D3.js、Three.js |
| 开发运维 | Docker Compose、npm、Husky、lint-staged |

## 仓库结构

```
safe-room/
├── README.md                          # 项目主文档
├── CONTRIBUTING.md                    # 贡献指南
├── CHANGELOG.md                       # 变更日志
├── LICENSE                            # MIT许可证
├── docs/                              # 文档体系（80+ 份文档）
│   ├── README.md                      # 文档导航中心
│   ├── requirements/                  # 需求文档（计划中）
│   ├── technical/                     # 技术文档（计划中）
│   ├── development/                   # 开发文档（计划中）
│   ├── reports/                       # 报告文档（计划中）
│   ├── templates/                     # 文档模板（计划中）
│   └── scripts/                       # 文档自动化脚本（计划中）
├── springboot1ngh61a2/                # 后端 Spring Boot 工程
├── docker-compose.yml                 # PostgreSQL 本地环境
├── DEPLOYMENT.md                      # 部署指南
├── TESTING.md                         # 测试执行指南
├── package.json                       # 前端依赖管理
├── test-results/                      # 测试结果目录
├── logs/                              # 日志文件目录
└── scripts/                           # 自动化脚本
```

## 快速开始

### 1. 启动数据库

```powershell
.\start-db.ps1
# 或
docker-compose up -d
```

### 2. 启动后端

```powershell
cd springboot1ngh61a2
mvn spring-boot:run
# 或生产配置
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### 3. 启动前台 / 后台

```bash
# 前台
cd springboot1ngh61a2/src/main/resources/front/front
npm install
npm run dev

# 管理后台
cd springboot1ngh61a2/src/main/resources/admin/admin
npm install
npm run dev
```

### 4. 自动化测试

```bash
# 后端集成 & 单元测试
cd springboot1ngh61a2
mvn test

# 前端 Vitest/Playwright
npm run test:unit
npm run test:e2e
```

### 5. 代码质量

```bash
npm run check:all:fix  # 前端项目（front/admin）各自执行
```

## 文档导航

### 📖 文档总览

访问 [`docs/README.md`](docs/README.md) 可快速检索全部 80+ 份文档。

### 🏗️ 核心技术文档

| 文档 | 内容 |
| --- | --- |
| [`docs/technical/architecture/ARCHITECTURE.md`](docs/technical/architecture/ARCHITECTURE.md) | 系统架构说明 |
| [`docs/technical/api/API.md`](docs/technical/api/API.md) | 后端 API 完整文档 |
| [`docs/technical/database/DATABASE.md`](docs/technical/database/DATABASE.md) | 数据库设计与数据字典 |
| [`docs/development/guides/DEVELOPMENT.md`](docs/development/guides/DEVELOPMENT.md) | 开发者指南 |

### 📋 需求与功能文档

| 文档 | 内容 |
| --- | --- |
| [`docs/README.md`](docs/README.md) | 需求文档导航中心 |
| [`docs/FRONTEND_REQUIREMENTS_OVERVIEW.md`](docs/FRONTEND_REQUIREMENTS_OVERVIEW.md) | 前端需求总览 |
| [`docs/FRONTEND_REQUIREMENTS_INDEX.md`](docs/FRONTEND_REQUIREMENTS_INDEX.md) | 前端需求文档索引 |
| `docs/*_REQUIREMENTS.md` | 各业务模块需求文档（50+ 份） |

### 🧪 测试与质量文档

| 文档 | 内容 |
| --- | --- |
| [`TESTING.md`](TESTING.md) | 测试执行指南 |
| [`docs/development/testing/TESTING_STRATEGY.md`](docs/development/testing/TESTING_STRATEGY.md) | 测试策略总览 |
| [`docs/development/testing/TESTING_IMPLEMENTATION.md`](docs/development/testing/TESTING_IMPLEMENTATION.md) | 测试实现指南 |
| [`docs/development/testing/TESTING_BEST_PRACTICES.md`](docs/development/testing/TESTING_BEST_PRACTICES.md) | 测试最佳实践 |
| [`docs/development/testing/BACKEND_TESTING_GUIDE.md`](docs/development/testing/BACKEND_TESTING_GUIDE.md) | 后端测试详细指南 |

### 🚀 部署与运维文档

| 文档 | 内容 |
| --- | --- |
| [`docs/technical/deployment/DEPLOYMENT.md`](docs/technical/deployment/DEPLOYMENT.md) | 生产部署指南 |
| [`docs/technical/deployment/DOCKER.md`](docs/technical/deployment/DOCKER.md) | Docker 化部署文档 |
| [`docs/technical/deployment/DOCKER_BUILD_OPTIMIZATION.md`](docs/technical/deployment/DOCKER_BUILD_OPTIMIZATION.md) | Docker 构建优化 |
| [`docs/technical/deployment/DOCKER_QUICK_START.md`](docs/technical/deployment/DOCKER_QUICK_START.md) | Docker 快速开始 |

### 📊 报告与分析文档

| 文档 | 内容 |
| --- | --- |
| [`CHANGELOG.md`](CHANGELOG.md) | 项目变更日志 |
| `*_REPORT.md` | 测试报告、代码审查报告等（15+ 份） |
| [`CODE_REVIEW_REPORT.md`](CODE_REVIEW_REPORT.md) | 代码审查报告 |
| [`FRONTEND_TEST_REPORT.md`](FRONTEND_TEST_REPORT.md) | 前端测试报告 |

## 许可

本项目采用 [MIT License](LICENSE) 开源协议。

### 许可证说明

MIT License 是一个宽松的开源协议，允许您：
- ✅ 商业使用
- ✅ 修改代码
- ✅ 分发代码
- ✅ 私人使用

完整的许可证内容请查看 [LICENSE](LICENSE) 文件。

### 法律文档

- [使用条款](TERMS.md)
- [隐私政策](PRIVACY.md)

### 开源信息

- [开源项目说明](docs/OPEN_SOURCE.md)
- [贡献者列表](CONTRIBUTORS.md)
- [贡献指南](CONTRIBUTING.md)

