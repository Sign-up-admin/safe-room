---
title: API SECURITY
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---
# 后端接口安全详尽文档 / Backend API Security Detailed Documentation

> 本文聚焦 `safe-room` 项目后端 `springboot1ngh61a2` 的 API 安全现状与改进路线，旨在为后续开发、测试与运维提供统一的安全作战手册。

---

## 1. 概述与范围 / Overview & Scope

- **文档目的 / Purpose**  
  描述接口安全基线，识别风险与整改优先级，为未来的安全开发、测试、运维提供参考。
- **适用范围 / Scope**  
  所有暴露在 `http://<host>:8080/springboot1ngh61a2` 下的 REST API，包括门户、管理后台、移动端使用的 23 个 Controller 及公共通用接口。
- **安全原则 / Principles**  
  - OWASP API Security Top 10、OWASP Top 10、CWE-287/352/639 等标准。  
  - 最小权限、纵深防御、零信任、可观测性。
- **接口分类体系 / Taxonomy**  
  - 公开接口（`@IgnoreAuth`）。  
  - 需认证接口（携带 `Token` 头）。  
  - 需授权接口（角色、数据域隔离）。  
  - 高敏接口（支付、批量审核、密码重置等）。

---

## 2. 接口安全分类 / Endpoint Security Classification

| 分类 | 代表控制器 | 安全关注点 | 示例 |
| --- | --- | --- | --- |
| **公开接口** / Public | `CommonController`, `FileController`, `UsersController` 登录/注册 | 滥用、CSRF、暴力破解、未授权数据访问 | `/users/login`, `/file/download`, `/common/value/...` |
| **认证接口** / Authenticated | 所有 `*/page|list|info|save` 需 Token | 会话绑定、Token 生命周期、重放 | `/yonghu/page`, `/kechengyuyue/add` |
| **授权接口** / Privileged | 管理端 CRUD、批量操作 | 角色校验、字段级控制、越权访问 | `/users/delete`, `/common/sh/{table}` |
| **敏感接口** / Sensitive | 支付、会员卡、密码重置、批量审核 | 审计、双人复核、速率限制、幂等性 | `/huiyuankagoumai/save`, `*/resetPass`, `/kechengyuyue/shBatch` |

> 依据 `docs/API.md` 及 Controller 实现整理。分类用于后续风险评估与测试优先级。

---

## 3. 当前实现安全分析 / Current-State Security Analysis

### 3.1 认证机制 / Authentication

- Token 由 `TokenService.generateToken` 生成 32 位随机串并保存在数据库，`AuthorizationInterceptor` 负责校验、写入 Session。

```
38:80:springboot1ngh61a2/src/main/java/com/interceptor/AuthorizationInterceptor.java
//...省略...
String token = request.getHeader(LOGIN_TOKEN_KEY);
TokenEntity tokenEntity = tokenService.getTokenEntity(token);
request.getSession().setAttribute("userId", tokenEntity.getUserid());
request.getSession().setAttribute("role", tokenEntity.getRole());
//...省略...
```

- **风险**：Token 未签名、无绑定 UA/IP；Session 未设置过期策略；`Access-Control-Allow-Origin` 回显请求头导致任意域可携带 Cookie，引发 CSRF。
- **改进建议**：使用 JWT/HMAC 签名或引入 Redis 会话；Token 绑定设备指纹；统一 Token 失效策略与刷新机制；CORS 白名单。

### 3.2 授权机制 / Authorization

- 多角色表（`/users`, `/user`, `/yonghu`, `/jianshenjiaolian`）共用 Token 表，通过 Session `tableName`、`role` 在 Service 层做条件拼接。
- 大量前台 `list/detail` 接口标记 `@IgnoreAuth`，缺乏字段白名单与输出过滤；批量审核、统计接口暴露在 `CommonController`，未做表/列白名单。
- **建议**：引入 Spring Security `@PreAuthorize`、数据行级权限；为 `CommonController` 添加表/列白名单与角色限制；梳理 `@IgnoreAuth` 列表并最小化。

### 3.3 输入验证 / Input Validation

- ORM 使用 MyBatis-Plus 预编译；`SQLFilter.sqlInject` 对排序字段做关键字检测。

```
14:37:springboot1ngh61a2/src/main/java/com/utils/SQLFilter.java
public static String sqlInject(String str){
    if(StringUtils.isBlank(str)){
        return null;
    }
    str = StringUtils.replace(str, "'", "");
    //...
    String[] keywords = {"master","truncate","insert","select","delete","update","declare","alter","drop","exec","execute"};
    //...
}
```

- 绝大多数 Controller 注释掉 `ValidatorUtils.validateEntity`，实体未加 Bean Validation 注解；富文本字段未做 XSS 清洗；`CommonController` 允许任意表/列，存在盲注与越权读取风险。
- **建议**：恢复 Bean Validation、集中处理错误；对富文本使用 HTML Sanitizer；为 `CommonController`、`MPUtil.likeOrEq` 传参建立白名单。

### 3.4 文件上传 / File Handling

```
47:116:springboot1ngh61a2/src/main/java/com/controller/FileController.java
@IgnoreAuth
@RequestMapping("/upload")
public R upload(@RequestParam("file") MultipartFile file,String type) throws Exception {
    String fileExt = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".")+1);
    File upload = new File(path.getAbsolutePath(),"/upload/");
    String fileName = new Date().getTime()+"."+fileExt;
    file.transferTo(dest);
    //...
}
```

- **问题**：未验证 MIME/扩展名白名单、未做病毒扫描或大小限制；上传路径与静态资源共享，存在 WebShell 风险；下载接口缺乏鉴权与路径校验。
- **建议**：限制可执行扩展、强制 UUID 文件名、引入对象存储或隔离目录、对下载添加签名 URL/Token。

### 3.5 错误处理与日志 / Error Handling & Observability

- `GlobalExceptionHandler` 统一返回 `R` 对象但仍包含真实异常信息。

```
33:66:springboot1ngh61a2/src/main/java/com/config/GlobalExceptionHandler.java
@ExceptionHandler(Exception.class)
public R handleException(Exception e) {
    logger.error("Unexpected exception: {}", e.getMessage(), e);
    return R.error("An unexpected error occurred: " + e.getMessage());
}
```

- **风险**：向客户端暴露内部信息；未对安全事件打专门审计日志；无请求 ID 关联。
- **建议**：对外返回标准错误码+泛化消息，内部记录详细日志并打标签；为敏感接口记录审计链路。

### 3.6 CORS/CSRF

- `AuthorizationInterceptor` 对所有请求设置 `Access-Control-Allow-Origin` 为来访 Origin，并允许携带 Cookie，未校验白名单。
- `@IgnoreAuth` 接口依赖 Session（如 `/common/sh`）可能被 CSRF 利用。
- **建议**：明确白名单、对需要 Session 的接口启用 CSRF Token 或改为纯 Token 模式；在 Nginx 侧加入 Referer/Origin 校验。

---

## 4. 接口安全实践指南 / Practical Guidelines

### 4.1 认证接口（登录/注册/重置）

| 检查点 | 说明 |
| --- | --- |
| 密码哈希 | 使用 BCrypt/Argon2 存储口令，禁止明文。 |
| 速率限制 | 登录、注册、重置添加 IP/User 限流（如 `5/min`），配合验证码。 |
| MFA/二次校验 | 重置密码需短信/邮件验证码或管理员审批。 |
| Token 生命周期 | 设定 1h 过期 + 静默刷新；支持主动吊销。 |

### 4.2 通用 CRUD 接口

- 只接受白名单字段；分页/排序参数统一封装；对 `page/list` 输出字段做脱敏（电话、身份证）。
- `save/update` 必须调用 Bean Validation，拒绝不合规输入。
- 逻辑删除与批量操作需要二次确认与审计记录。

### 4.3 文件/公共接口

- 上传必须验证 Content-Type、扩展名、大小；写入隔离目录或对象存储；生成一次性访问 URL。  
- 下载与通用统计接口需加入鉴权开关与速率限制；对 `/common/*` 引入表/列白名单配置。

### 4.4 统计/报表接口

- 对聚合结果做最小粒度限制，防止差分攻击；对跨角色查询引入行级过滤。  
- 生产环境禁用自由 SQL 或在 DAO 层加模板校验。

### 4.5 批量与敏感操作

- 审批、支付、重置类接口需 RBAC + 操作日志 + 幂等 Token。  
- 尽量通过后端生成一次性确认码，避免前端拼装敏感参数。

---

## 5. 安全风险与缓解措施 / Risks & Mitigations

| 风险 | 影响 | 当前状态 | 缓解措施 | 优先级 |
| --- | --- | --- | --- | --- |
| 随机 Token 无签名 | 会话劫持、伪造 | Token 表 + Session | 引入 JWT/HMAC、绑定指纹、统一过期 | 高 |
| 明文密码 + 固定重置 | 数据泄漏、撞库 | 数据库存明文，`resetPass=123456` | Hash + 随机重置 + MFA | 高 |
| 任意 Origin + Cookie | CSRF、跨站调用 | 所有响应回显 Origin | 白名单、禁用 Credentials 或改 Token-only | 高 |
| `CommonController` 任意表列 | 数据外泄、盲注 | `@IgnoreAuth` + 无白名单 | 表/列白名单、需 Token、速率限制 | 高 |
| 文件上传未校验 | WebShell、DoS | 任意扩展/大小 | 扩展白名单、扫描、隔离目录 | 高 |
| 缺乏输入校验 | XSS/业务脆弱性 | Validator 注释、富文本未清洗 | 启用 Bean Validation、HTML Sanitizer | 中 |
| 缺少审计日志 | 难以追踪攻击 | 仅有通用日志 | 审计事件、请求 ID、集中化日志 | 中 |
| 错误消息泄露 | 信息泄漏 | 直接返回异常文本 | 统一错误码、隐藏细节 | 中 |

---

## 6. 接口安全测试 / Testing Guidelines

### 6.1 测试用例模板

| 用例 | 目标 | 步骤 | 期望 |
| --- | --- | --- | --- |
| 未授权访问 | 验证未带 Token 的接口 | 对任意需 Token 接口发送请求 | 返回 `401`，无数据泄漏 |
| 角色越权 | 验证行级权限 | 以会员 Token 调用 `/users/page` 等管理员接口 | 返回 `403` 或空数据 |
| 参数注入 | 验证 SQL/XSS | 构造 `sidx=1 desc;drop table`、`<img src=x onerror=alert(1)>` | 请求被拒或输出被转义 |
| 文件上传 | 验证类型限制 | 上传 `.jsp/.exe/.zip` | 被拒绝且记录事件 |
| CSRF | 验证跨站提交 | 模拟第三方站点发起表单 | 请求被拒（Origin 校验或 CSRF Token） |

### 6.2 渗透测试检查清单

- OWASP ZAP/ Burp Suite 对登录、上传、统计接口做模糊测试。  
- 核查速率限制、锁定策略、Token 预测性。  
- 验证常见业务漏洞（重复支付、预约重放、库存绕过）。  
- 对 `/common/*`、`/file/*`、`/errorReport` 做参数操控与目录遍历测试。

### 6.3 自动化安全测试

- 在 CI 中集成 SAST（SonarQube/CodeQL）与 DAST（OWASP ZAP CLI）。  
- 单元/集成测试补充：  
  - Token 过期/吊销场景。  
  - `SQLFilter` 关键字拦截。  
  - `AuthorizationInterceptor` 对 `@IgnoreAuth`、OPTIONS、异常路径的处理。

---

## 7. 安全加固路线图 / Hardening Roadmap

| 阶段 | 时间 | 关键动作 |
| --- | --- | --- |
| **短期** | 1-2 周 | 引入密码哈希、修复 CORS、为公共接口加白名单与速率限制、限制文件上传。 |
| **中期** | 1-2 月 | 接入 Spring Security RBAC、实施 Token 指纹、启用 Bean Validation 与 HTML Sanitizer、完善日志/审计。 |
| **长期** | 3-6 月 | 落地 API Gateway 限流、统一 Secrets 管理、引入零信任接入、建立定期渗透测试与红蓝对抗流程。 |

每个阶段结束后，需同步更新 `docs/SECURITY.md` 与本文件，确保安全事实来源唯一。

---

## 8. 附录 / Appendix

### 8.1 接口安全检查清单 / Checklist

1. 是否需要鉴权？`@IgnoreAuth` 是否合理？  
2. 请求是否通过 Bean Validation？  
3. 输出是否做脱敏/转义？  
4. 是否记录操作日志和请求 ID？  
5. 是否具备速率限制与重放防护？  
6. 是否在 `docs/API.md` 同步更新安全要求？

### 8.2 常见漏洞示例 / Common Issues

- **明文密码**：`UsersController.resetPass` 重置为固定值，容易被遍历。  
- **任意读**：`CommonController.follow` 允许传入任意表/列。  
- **任意上传**：`FileController.upload` 未校验扩展及大小。

### 8.3 参考资源 / References

- `docs/SECURITY.md` – 全局安全最佳实践。  
- `docs/API.md` – 接口定义与角色说明。  
- OWASP API Security Top 10 2023.  
- NIST SP 800-204A/B – Microservices Security Guidelines.

---

> 建议将本文件纳入代码评审与发布 Checklist，中短期内每次安全相关改动均需引用此文档的章节与检查清单。


