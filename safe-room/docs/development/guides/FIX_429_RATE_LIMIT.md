---
title: FIX 429 RATE LIMIT
version: v1.0.0
last_updated: 2025-11-17
status: active
category: development
tags: [rate-limit, troubleshooting, guide, fix, 429]
---

# 解决429限流错误（Too Many Requests）

## 问题说明

当您看到 `429 (Too Many Requests)` 错误时，表示登录请求过于频繁，触发了系统的速率限制。

**限流规则**：
- 登录接口：每个IP每分钟最多5次请求
- 限流记录会在2分钟后自动过期

## 立即解决方案

### 方案0：直接修改数据库（开发环境推荐）

如果是开发环境，可以直接修改数据库重置账户：

**Windows PowerShell**:
```powershell
.\reset-admin-direct.ps1
```

**Linux/Mac**:
```bash
chmod +x reset-admin-direct.sh
./reset-admin-direct.sh
```

**直接使用SQL**:
```sql
UPDATE users 
SET 
    password = 'admin',
    password_hash = NULL,
    failed_login_attempts = 0,
    lock_until = NULL,
    status = 0
WHERE username = 'admin';
```

**注意**：这只能重置账户密码和锁定状态，不能清除429限流（限流在内存中）。如果遇到429错误，仍需等待或使用清除限流接口。

### 方案1：等待自动解除（推荐）

限流记录会在 **2分钟** 后自动过期，您可以：
1. 等待2分钟后重试登录
2. 在此期间不要继续尝试登录，否则会重置过期时间

### 方案2：使用清除限流接口

如果应用正在运行，可以使用清除限流接口：

```bash
# 清除当前IP的限流记录
curl -X POST "http://192.168.3.142:8081/springboot1ngh61a2/admin/clearRateLimit"

# 或者指定IP
curl -X POST "http://192.168.3.142:8081/springboot1ngh61a2/admin/clearRateLimit?ip=192.168.3.142"

# 如果配置了安全密钥
curl -X POST "http://192.168.3.142:8081/springboot1ngh61a2/admin/clearRateLimit?ip=192.168.3.142&key=your_secret_key"
```

**注意**：如果配置了环境变量 `ADMIN_CLEAR_RATE_LIMIT_KEY`，需要提供正确的密钥。

### 方案3：重启应用服务器

重启应用服务器会清除内存中的所有限流记录：

```bash
# 如果使用Docker
docker restart <springboot-container-name>

# 如果直接运行Java应用
# 停止应用后重新启动
```

### 方案4：使用浏览器开发者工具清除前端限流

打开浏览器开发者工具（F12），在Console中执行：

```javascript
// 清除前端限流记录
localStorage.removeItem('rateLimit_login_admin');
sessionStorage.clear();

// 或者清除所有限流相关记录
Object.keys(localStorage).forEach(key => {
    if (key.startsWith('rateLimit_')) {
        localStorage.removeItem(key);
    }
});
```

然后刷新页面重试登录。

## 长期解决方案

### 1. 调整限流配置

如果需要调整限流规则，可以修改 `RateLimitInterceptor.java`：

```java
// 登录接口限流：改为10次/分钟
private static final double LOGIN_RATE = 10.0;
```

然后重新编译和部署应用。

### 2. 配置安全密钥（可选）

为了安全，可以设置清除限流接口的密钥：

**Windows PowerShell**:
```powershell
$env:ADMIN_CLEAR_RATE_LIMIT_KEY = "your_secret_key_here"
```

**Linux/Mac Bash**:
```bash
export ADMIN_CLEAR_RATE_LIMIT_KEY="your_secret_key_here"
```

**Docker Compose** (在 `docker-compose.yml` 中添加):
```yaml
environment:
  - ADMIN_CLEAR_RATE_LIMIT_KEY=your_secret_key_here
```

### 3. 使用不同的IP或网络

如果可能，可以：
- 使用不同的网络连接
- 使用VPN切换IP
- 等待网络IP变化（如果使用动态IP）

## 预防措施

1. **避免频繁重试**：登录失败后，等待几秒再重试
2. **检查密码**：确认密码正确后再尝试登录
3. **使用记住账号功能**：减少输入错误的可能性
4. **检查网络连接**：确保网络稳定，避免重复提交

## 相关文件

- `springboot1ngh61a2/src/main/java/com/interceptor/RateLimitInterceptor.java` - 限流拦截器
- `springboot1ngh61a2/src/main/java/com/controller/AdminController.java` - 管理接口
- `springboot1ngh61a2/src/main/resources/admin/admin/src/views/login.vue` - 登录页面

## 技术细节

**限流实现**：
- 使用 Guava 的 `RateLimiter` 实现令牌桶算法
- 基于IP地址进行限流
- 使用 `CacheBuilder` 存储限流记录，自动过期清理

**限流策略**：
- 登录接口：5次/分钟
- 注册接口：3次/分钟
- 密码重置接口：2次/分钟

**过期时间**：
- 限流记录在最后一次访问后2分钟自动过期

