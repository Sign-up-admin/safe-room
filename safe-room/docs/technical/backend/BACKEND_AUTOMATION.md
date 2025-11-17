---
title: BACKEND AUTOMATION
version: v1.0.0
last_updated: 2025-11-14
status: active
category: technical
tags: [backend, automation, debug, baseline]
---

# Backend Automation & Debug Baseline

This document captures the current state of the backend ("后端自动化调试") so we can measure and expand coverage consistently.

## Module Inventory

| Layer | Modules |
| --- | --- |
| Controllers (`com.controller`) | chat, common, config, daoqitixing, discussjianshenkecheng, errorReport, file, huiyuanka, huiyuankagoumai, huiyuanxufei, jianshenjiaolian, jianshenkecheng, jianshenqicai, kechengleixing, kechengtuike, kechengyuyue, news, newstype, sijiaoyuyue, storeup, user, users, yonghu |
| Services (`com.service`) | 全部 24 个服务接口及其 `impl` 实现，覆盖上述业务域 (chat → yonghu) |

## Existing Automated Debug Coverage (Before This Iteration)

- **Controller tests**: `UserControllerTest`, `UsersControllerTest`, `YonghuControllerTest`
- **Service tests**: `UserServiceImplTest`, `TokenServiceImplTest`
- **Utilities**: `TestUtils` 提供基础实体构造
- **Database fixtures**: `test-schema.sql` 仅包含 `token/users/user/yonghu`

## Gaps Identified

1. 19 controllers lacked any automated regression coverage
2. No reusable base class for controller smoke/integration scenarios
3. Service/DAO 层仅覆盖 token/user，两百余条 SQL 未被验证
4. 没有统一的测试数据集，无法在本地或 CI 中跑通所有端点
5. CI 未启用覆盖率，难以量化“自动化调试”范围

## Goals For Expansion

- 全量建模测试数据（所有表都有示例记录、token、用户）
- 为每个 controller 至少提供分页/详情的烟雾测试 + 关键 CRUD 用例
- 为代表性 service/dao 编写业务规则测试
- 引入 JaCoCo 并在 `mvn test` 里跑完整回归
- 在 `TESTING.md` 中记录执行流程，供本地与 CI 复用

> 本文件会随任务推进更新，用于审计“后端自动化调试”覆盖面。

## 2025-11-14 更新

- 新增 `test-schema.sql` 与 `test-data.sql`，涵盖 18 个核心业务表以及管理员/会员 token
- 创建 `AbstractControllerIntegrationTest`，整合 `MockMvc`、`@Sql` 与通用辅助方法
- 提供 `BackendControllersSmokeTest` + 针对课程 / 预约的 CRUD 集成测试
- 扩展 `TestUtils` 以生成课程、预约、token、登录等测试样板
- 为 `JianshenkechengService`、`KechengyuyueService`、`StoreupService` 添加数据驱动单元测试
- `pom.xml` 集成 JaCoCo（40% 行覆盖率门槛），`TESTING.md` 记录运行与报告说明
- `mvn test` 即可完成“后端自动化调试”并产出覆盖率报告


