---
title: SECURITY
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---
# 安全最佳实践与指南 / Security Best Practices & Guidelines

> 本文针对 `safe-room` 健身房综合管理系统的当前实现，梳理安全架构、识别风险并提供改进建议。所有内容采用中英双语，便于跨团队协作。  
> This document summarizes the security architecture of the project, highlights current risks, and provides actionable recommendations in bilingual form.

## 目录 / Table of Contents
1. [认证与授权](#认证与授权--authentication--authorization)
2. [密码安全](#密码安全--password-security)
3. [输入验证与防护](#输入验证与防护--input-validation--protection)
4. [API 安全](#api-安全--api-security)
5. [数据安全](#数据安全--data-security)
6. [安全配置](#安全配置--security-configuration)
7. [安全测试](#安全测试--security-testing)
8. [事件响应](#事件响应--incident-response)

---

## 认证与授权 / Authentication & Authorization

- **当前实现 / Current State**
  - 后端通过 `AuthorizationInterceptor` 校验 `Token` 头并写入 `HttpSession` (`springboot1ngh61a2/src/main/java/com/interceptor/AuthorizationInterceptor.java`)。
  - Token 由 `TokenServiceImpl.generateToken` 生成，长度 32、有效期 1 小时，存储于数据库 (`TokenEntity`)。
  - 前端 Axios 拦截器自动附带 `Token` 头，并在 `401` 时跳转登录 (`src/main/resources/admin/admin/src/utils/http.ts`)。
  - 多角色（管理员 `/users`、教练 `/jianshenjiaolian`、会员 `/yonghu`、普通 `/user`）共用同一 Token 表。

- **风险 / Risks**
  - Token 只是随机字符串，缺乏签名与篡改检测。
  - Session 未绑定 UA/IP，存在被窃取后的重放风险。
  - `@IgnoreAuth` 广泛用于前台接口，需要定期审计防止越权。

- **建议 / Recommendations**
  - 升级为 JWT 或 HMAC-signed token，或在现有 token 表中记录客户端指纹。
  - 对敏感接口添加角色白名单与 `@PreAuthorize`（Spring Security）。
  - 记录并监控 Token 使用（IP、UA、地理位置），检测异常行为。
  - 审计 `@IgnoreAuth` 方法列表，必要时增加只读查询参数校验。

## 密码安全 / Password Security

- **当前实现 / Current State**
  - 所有用户（`UsersEntity`, `UserEntity`, `YonghuEntity`, `JianshenjiaolianEntity`）密码以明文形式存储，与登录时直接比对。
  - 密码重置接口 (`*/resetPass`) 无身份验证，直接重置为固定值 `123456`。
  - `EncryptUtil` 提供 MD5/SHA-256，但未在登录/注册流程中使用。

- **风险 / Risks**
  - 明文存储存在数据库泄漏时的巨大风险。
  - 固定密码重置可能被滥用；无速率限制会导致撞库。

- **建议 / Recommendations**
  - 全面采用 BCrypt/Argon2 进行密码哈希；迁移方案：新增 `passwordHash` 字段、强制用户在登录时重设密码。
  - 重置流程要求二次验证：邮箱/短信验证码或管理员审批。
  - 引入密码复杂度与历史密码校验，防止弱口令。
  - 配置登录/重置速率限制与验证码，阻断暴力破解。

## 输入验证与防护 / Input Validation & Protection

- **当前实现 / Current State**
  - QueryWrapper 与 MyBatis-Plus 默认使用预编译语句。
  - `SQLFilter.sqlInject` 提供额外字符串检测，并有单元测试 (`SQLFilterTest`)。
  - 大量控制器保留 `ValidatorUtils` 调用但被注释，缺乏实体级校验。

- **风险 / Risks**
  - 部分接口通过 Query 参数直接拼接（如 `MPUtil.likeOrEq`），需确保字段白名单。
  - 未启用 Bean Validation（`@NotBlank`, `@Size`）导致 XSS/格式攻击风险。

- **建议 / Recommendations**
  - 恢复 `ValidatorUtils.validateEntity` 并加上 JSR‑380 约束。
  - 为富文本字段启用 HTML 清洗（如 OWASP Java HTML Sanitizer）。
  - 统一封装分页/排序参数，阻止任意字段排序。
  - 在前端处理用户输入时使用 `v-html` 谨慎策略，默认转义。

## API 安全 / API Security

- **当前实现 / Current State**
  - `AuthorizationInterceptor` 同时处理 CORS：允许任意 Origin，`Access-Control-Allow-Credentials=true`。
  - Token 通过自定义 `Token` 头传输，Axios `withCredentials=true`。
  - 公共接口（文件下载、统计、`/common`）多为 `@IgnoreAuth`。

- **风险 / Risks**
  - 任意 Origin + Cookies 组合可能导致 CSRF，尤其是 `@IgnoreAuth` 但依赖 Session 的接口。
  - 缺少速率限制 / IP 黑名单，容易被暴力枚举。
  - 缺少统一的错误码与审计日志，难以追溯攻击。

- **建议 / Recommendations**
  - 限制 `Access-Control-Allow-Origin` 为可信域或使用白名单。
  - 对需要 Session 的接口启用 CSRF Token 或改用完全无状态 API。
  - 配置 API Gateway / Nginx 限流（如 `200 req/min`），并在后端对登录等接口做速率限制。
  - 在 `GlobalExceptionHandler` 中区分安全相关错误并打审计日志。

## 数据安全 / Data Security

- **当前实现 / Current State**
  - 数据库脚本 (`schema-postgresql.sql`) 包含业务表但未描述列级别安全。
  - 文件上传接口 `/file/upload` 将文件保存到 `static/upload/`，无病毒扫描或文件类型校验。
  - 日志目录 `logs/` 未设置敏感字段脱敏。

- **风险 / Risks**
  - 上传文件可被执行（若部署到同域名的静态目录），需要白名单 + 重命名。
  - 数据库连接信息在 `application.yml` 中明文，需与环境变量解耦。

- **建议 / Recommendations**
  - 启用对象存储或隔离的文件服务器，限制可执行扩展，校验 MIME/内容。
  - 对日志中的手机号、身份证等敏感数据进行掩码处理。
  - 使用 Vault/KMS 管理数据库凭据，生产环境通过环境变量注入。
  - 对备份数据加密并制定访问控制策略。

## 安全配置 / Security Configuration

- **当前实现 / Current State**
  - `application-prod.yml` 仅区分数据库等基础配置，尚未启用 HSTS/HTTPS。
  - Docker Compose 暴露 PostgreSQL 默认端口，缺少网络隔离。
  - `GlobalExceptionHandler` 提供统一错误处理。

- **建议 / Recommendations**
  - 反向代理（Nginx）强制 HTTPS，开启 HSTS，禁用 TLS 1.0/1.1。
  - 在容器/服务器层面使用安全基线：最小权限、自动更新、日志集中。
  - PostgreSQL 启用 `pg_hba.conf` 网络白名单与强密码策略。
  - 在 `GlobalExceptionHandler` 中避免泄露堆栈信息，统一返回业务错误码。

## 安全测试 / Security Testing

- **当前实现 / Current State**
  - 单元测试覆盖 `AuthorizationInterceptor`、`SQLFilter` 等关键组件。
  - `BACKEND_AUTOMATION.md` 记录自动化测试计划，但未纳入安全测试。

- **建议 / Recommendations**
  - 将 SAST/DAST 工具（如 SonarQube, OWASP ZAP）纳入 CI。
  - 编写安全回归测试：弱口令、越权、CSRF、SQLi、XSS。
  - 在 `TESTING.md` 中新增“安全测试”章节，描述命令与预期。
  - 对关键接口进行定期渗透测试，输出报告。

## 事件响应 / Incident Response

- **当前实现 / Current State**
  - 目前仅依赖第三方库自带的 `SECURITY.md`/`INCIDENT_RESPONSE_PROCESS.md`，缺乏项目级流程。

- **建议 / Recommendations**
  - 建立事件响应手册：发现、分级、通报、遏制、根因分析、复盘。
  - 指定安全联络方式（安全邮箱、值班渠道），定义 SLA（如 24h 响应）。
  - 为日志、数据库、上传目录配置只读副本，便于取证。
  - 在 CHANGELOG 中记录安全修复，必要时发布安全公告。

---

## 快速行动清单 / Quick Action Checklist

1. 引入密码哈希与安全的重置流程。  
   Implement password hashing and secure reset flow.
2. 审计 `@IgnoreAuth` 接口，收紧 CORS/CSRF 策略。  
   Review `@IgnoreAuth` endpoints and tighten CORS/CSRF policies.
3. 部署速率限制与日志审计，发现异常行为。  
   Enable rate limiting and audit logging to detect anomalies.
4. 在 CI 中加入安全扫描，并定期进行渗透测试。  
   Integrate security scans into CI and schedule periodic pentests.
5. 建立事件响应机制，明确联系人与流程。  
   Define incident response procedures and owners.

> 任何安全相关的改动完成后，请同步更新本文件与 `docs/ARCHITECTURE.md` 的安全章节，以保持单一事实来源。  
> After any security-related change, update this file and the security section in `docs/ARCHITECTURE.md` to maintain a single source of truth.


