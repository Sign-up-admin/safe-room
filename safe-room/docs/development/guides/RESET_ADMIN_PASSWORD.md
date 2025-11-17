---
title: RESET ADMIN PASSWORD
version: v1.0.0
last_updated: 2025-11-17
status: active
category: development
tags: [password, reset, admin, guide, troubleshooting]
---

# 重置Admin账户密码指南

如果admin账户密码被修改或忘记，可以使用以下方法重置密码。

## 方法1：使用SQL脚本（推荐）

### Windows PowerShell

```powershell
# 在项目根目录执行
.\reset-admin-password.ps1

# 或者指定参数
.\reset-admin-password.ps1 -Username "admin" -NewPassword "admin" -DbHost "localhost" -DbPort 5432
```

### Linux/Mac Bash

```bash
# 添加执行权限
chmod +x reset-admin-password.sh

# 执行脚本
./reset-admin-password.sh

# 或者指定参数
./reset-admin-password.sh admin admin
```

### 直接使用SQL

```sql
-- 连接到PostgreSQL数据库
psql -h localhost -U postgres -d fitness_gym

-- 执行重置SQL
UPDATE users 
SET 
    password = 'admin',
    password_hash = NULL,
    failed_login_attempts = 0,
    lock_until = NULL
WHERE username = 'admin';

-- 验证结果
SELECT id, username, password, password_hash, failed_login_attempts, lock_until, role 
FROM users 
WHERE username = 'admin';
```

## 方法2：使用密码重置API

如果应用正在运行，可以使用密码重置API：

```bash
# 使用curl
curl -X POST "http://localhost:8080/springboot1ngh61a2/users/resetPass?username=admin"

# 响应示例
# {
#   "code": 0,
#   "msg": "密码已重置，新密码为：Abc123XyZ789"
# }
```

**注意**：API会生成一个随机密码并返回，请保存好返回的密码。

## 方法3：使用Docker容器

如果使用Docker部署，可以通过容器执行SQL：

```bash
# 查找PostgreSQL容器名称
docker ps | grep postgres

# 执行SQL重置密码
docker exec -it <postgres-container-name> psql -U postgres -d fitness_gym -c "
UPDATE users 
SET 
    password = 'admin',
    password_hash = NULL,
    failed_login_attempts = 0,
    lock_until = NULL
WHERE username = 'admin';
"
```

## 登录说明

重置密码后：

1. **如果 `password_hash` 为 NULL**：
   - 使用重置的明文密码登录（例如：`admin`）
   - 系统会在首次登录成功后自动将密码迁移到BCrypt加密格式

2. **如果 `password_hash` 已设置**：
   - 需要使用对应的密码登录
   - 如果使用API重置，使用返回的随机密码

## 默认账户信息

根据 `data.sql`，系统默认的admin账户：

- **用户名**: `admin`
- **默认密码**: `admin`
- **角色**: `管理员`

其他测试账户：
- `manager` / `123456`
- `operator` / `123456`

## 故障排查

### 问题1：账户被锁定

如果账户因登录失败次数过多被锁定，重置脚本会自动清除锁定状态。也可以手动执行：

```sql
UPDATE users 
SET failed_login_attempts = 0, lock_until = NULL 
WHERE username = 'admin';
```

### 问题2：密码哈希不匹配

如果 `password_hash` 字段有值但无法登录，可以将其设置为 NULL，让系统使用旧密码字段：

```sql
UPDATE users 
SET password_hash = NULL 
WHERE username = 'admin';
```

### 问题3：数据库连接失败

检查数据库连接信息：
- 主机地址是否正确
- 端口是否正确（默认5432）
- 用户名和密码是否正确
- 数据库名称是否正确（默认 `fitness_gym`）

## 安全建议

1. **生产环境**：重置密码后，请立即登录并修改为强密码
2. **密码复杂度**：建议使用至少8位，包含大小写字母、数字和特殊字符
3. **定期更换**：建议定期更换管理员密码
4. **审计日志**：系统会记录密码重置操作，可在操作日志中查看

## 相关文件

- `reset-admin-password.sql` - SQL脚本
- `reset-admin-password.ps1` - PowerShell脚本
- `reset-admin-password.sh` - Bash脚本
- `springboot1ngh61a2/src/main/java/com/controller/UsersController.java` - 密码重置API





