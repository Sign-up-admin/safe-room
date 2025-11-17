---
title: FRONTEND TEST AUTOMATION
version: v1.0.0
last_updated: 2025-11-16
status: active
category: development
tags: [testing, automation, frontend, vitest, playwright]
---

# 前端测试自动化指南

## 📋 概述

本文档介绍前端测试自动化系统的完整功能和使用方法。系统提供了全面的测试自动化能力，包括单元测试、E2E测试、覆盖率监控和报告生成。

## 🚀 快速开始

### 1. 运行所有测试

```powershell
# 使用自动化脚本运行所有测试
.\frontend-test-automation.ps1 -Type all -App both

# 或使用 npm 脚本
npm run test:all
```

### 2. 运行单元测试

```powershell
# 运行所有项目的单元测试
.\frontend-test-automation.ps1 -Type unit -App both

# 或使用 npm 脚本
npm run test:unit
```

### 3. 运行覆盖率测试

```powershell
# 运行覆盖率测试并生成报告
.\frontend-test-automation.ps1 -Type coverage -App both -GenerateReport

# 或使用 npm 脚本
npm run coverage
```

## 📚 功能特性

### 1. 测试自动化脚本 (`frontend-test-automation.ps1`)

#### 主要功能

- ✅ **并行运行**: 支持并行运行多个项目的测试，提高执行效率
- ✅ **失败重试**: 自动重试失败的测试，提高稳定性
- ✅ **报告生成**: 自动生成HTML格式的测试报告
- ✅ **详细日志**: 提供详细的测试执行日志

#### 使用方法

```powershell
# 基本用法
.\frontend-test-automation.ps1 -Type unit -App front

# 并行运行所有测试
.\frontend-test-automation.ps1 -Type all -App both -Parallel

# 带重试机制
.\frontend-test-automation.ps1 -Type unit -App both -Retry 3

# 生成报告
.\frontend-test-automation.ps1 -Type all -App both -GenerateReport

# 详细输出
.\frontend-test-automation.ps1 -Type unit -App front -Verbose
```

#### 参数说明

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `Type` | string | 测试类型 (unit, e2e, coverage, all) | all |
| `App` | string | 应用 (front, admin, both) | both |
| `Parallel` | switch | 是否并行运行 | false |
| `Retry` | int | 失败重试次数 | 2 |
| `GenerateReport` | switch | 是否生成报告 | false |
| `Verbose` | switch | 详细输出 | false |

### 2. 覆盖率监控脚本 (`frontend-coverage-monitor.ps1`)

#### 主要功能

- ✅ **覆盖率监控**: 自动运行测试并生成覆盖率报告
- ✅ **阈值检查**: 检查覆盖率是否达到设定阈值
- ✅ **历史追踪**: 追踪覆盖率历史变化
- ✅ **回归检测**: 检测覆盖率下降情况

#### 使用方法

```powershell
# 监控前端项目
.\frontend-coverage-monitor.ps1 -Project front

# 监控后台项目
.\frontend-coverage-monitor.ps1 -Project admin

# 自定义阈值
.\frontend-coverage-monitor.ps1 -Project front -ThresholdLine 40 -ThresholdFunction 40

# 详细输出
.\frontend-coverage-monitor.ps1 -Project front -Verbose
```

#### 参数说明

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `Project` | string | 项目名称 (front, admin) | 必填 |
| `ThresholdLine` | double | 行覆盖率阈值 (%) | 30 |
| `ThresholdFunction` | double | 函数覆盖率阈值 (%) | 30 |
| `ThresholdBranch` | double | 分支覆盖率阈值 (%) | 25 |
| `ThresholdStatement` | double | 语句覆盖率阈值 (%) | 30 |
| `HistoryFile` | string | 历史记录文件路径 | frontend-coverage-history-{Project}.json |
| `Verbose` | switch | 详细输出 | false |

### 3. CI/CD 集成

#### GitHub Actions 工作流

项目已配置完整的 GitHub Actions 工作流，自动运行测试：

- **触发条件**:
  - 推送到 main/master/develop 分支
  - 创建 Pull Request
  - 手动触发 (workflow_dispatch)
  - 定时任务 (每天凌晨2点)

- **测试任务**:
  - 单元测试 (unit-tests)
  - 覆盖率测试 (test-coverage)
  - E2E 测试 (e2e-tests)
  - 测试汇总 (test-summary)

#### 工作流文件

`.github/workflows/frontend-test-coverage.yml`

## 📊 测试覆盖率

> 📖 **详细指南**: 有关前端测试覆盖率的完整方法，请参考 [`FRONTEND_COVERAGE_METHODS.md`](FRONTEND_COVERAGE_METHODS.md)

### 当前阈值

| 指标 | 最低阈值 | 目标阈值 |
|------|----------|----------|
| 行覆盖率 | 30% | 80% |
| 函数覆盖率 | 30% | 80% |
| 分支覆盖率 | 25% | 75% |
| 语句覆盖率 | 30% | 80% |

### 查看覆盖率报告

```powershell
# 生成覆盖率报告
npm run coverage:report

# 查看报告
# Windows
start springboot1ngh61a2\src\main\resources\front\front\coverage\index.html
start springboot1ngh61a2\src\main\resources\admin\admin\coverage\index.html
```

## 🔧 测试配置

### Vitest 配置

配置文件位于各项目的 `vitest.config.ts`:

- **测试环境**: happy-dom
- **覆盖率提供者**: v8
- **报告格式**: text, lcov, html, json, json-summary

### Playwright 配置

配置文件位于各项目的 `playwright.config.ts`:

- **浏览器**: Chromium, Firefox, WebKit
- **超时时间**: 30秒
- **测试目录**: tests/e2e

## 📝 使用示例

### 示例 1: 开发时运行测试

```powershell
# 运行前端项目的单元测试（Watch 模式）
cd springboot1ngh61a2\src\main\resources\front\front
npm run test:unit:watch
```

### 示例 2: 提交前检查

```powershell
# 运行所有测试并生成报告
.\frontend-test-automation.ps1 -Type all -App both -GenerateReport -Parallel
```

### 示例 3: 覆盖率监控

```powershell
# 监控前端项目覆盖率
.\frontend-coverage-monitor.ps1 -Project front

# 监控后台项目覆盖率
.\frontend-coverage-monitor.ps1 -Project admin
```

### 示例 4: CI/CD 环境

在 CI/CD 环境中，测试会自动运行。你也可以手动触发：

```powershell
# 运行所有测试
npm run test:all

# 运行覆盖率检查
npm run coverage:check
```

## 🐛 故障排查

### 常见问题

#### 1. 测试失败

**问题**: 测试执行失败

**解决方案**:
- 检查依赖是否已安装: `npm install`
- 检查测试环境配置
- 查看详细错误日志: 使用 `-Verbose` 参数

#### 2. 覆盖率不达标

**问题**: 覆盖率低于阈值

**解决方案**:
- 查看覆盖率报告，找出未覆盖的代码
- 添加更多测试用例
- 检查覆盖率配置是否正确

#### 3. 并行测试冲突

**问题**: 并行运行时出现冲突

**解决方案**:
- 使用串行模式: 移除 `-Parallel` 参数
- 检查测试是否相互独立
- 增加重试次数: `-Retry 3`

#### 4. E2E 测试失败

**问题**: E2E 测试在 CI 环境中失败

**解决方案**:
- 确保 Playwright 浏览器已安装: `npx playwright install`
- 检查测试服务器是否正常启动
- 增加超时时间

## 📈 最佳实践

### 1. 测试编写

- ✅ 编写独立的测试用例
- ✅ 使用描述性的测试名称
- ✅ Mock 外部依赖
- ✅ 测试边界条件和异常情况

### 2. 测试执行

- ✅ 提交前运行所有测试
- ✅ 使用 Watch 模式进行开发
- ✅ 定期检查覆盖率
- ✅ 关注测试执行时间

### 3. 覆盖率管理

- ✅ 保持覆盖率在阈值以上
- ✅ 定期审查覆盖率报告
- ✅ 关注覆盖率趋势
- ✅ 逐步提高覆盖率目标

## 🔗 相关文档

- [前端测试指南](FRONTEND_TESTING_GUIDE.md)
- [前端测试报告](FRONTEND_TEST_REPORT.md)
- [覆盖率监控说明](COVERAGE_MONITORING_README.md)

## 📞 支持

如有问题或建议，请：

1. 查看本文档的故障排查部分
2. 检查测试日志和报告
3. 联系开发团队

---

**最后更新**: 2025-01-XX

