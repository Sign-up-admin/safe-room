---
title: DOCKER QUICK START
version: v1.0.0
last_updated: 2025-11-15
status: active
category: technical
tags: [docker, quick-start, deployment, guide]
---

# Docker 快速启动指南

本文档提供使用 Docker 快速启动健身房综合管理系统的步骤。

## 前置要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

## 快速开始

### 1. 配置环境变量

```bash
# Windows PowerShell
Copy-Item env.example .env

# Linux/Mac
cp env.example .env
```

编辑 `.env` 文件，根据需要修改配置（特别是数据库密码）。

### 2. 启动所有服务

**Windows PowerShell:**
```powershell
.\docker-deploy.ps1 -Action up
```

**Linux/Mac:**
```bash
./docker-deploy.sh up
```

**或使用 Docker Compose 直接启动:**
```bash
docker-compose up -d
```

### 3. 查看服务状态

```bash
# 使用脚本
.\docker-deploy.ps1 -Action status
# 或
docker-compose ps
```

### 4. 查看日志

```bash
# 使用脚本
.\docker-deploy.ps1 -Action logs
# 或
docker-compose logs -f
```

### 5. 访问应用

启动成功后，可以通过以下地址访问：

- **后端 API**: http://localhost:8080/springboot1ngh61a2
- **前端应用**: http://localhost:8080/springboot1ngh61a2/front/front/index.html
- **管理后台**: http://localhost:8080/springboot1ngh61a2/admin/admin/index.html
- **MinIO 控制台**: http://localhost:9001 (用户名/密码: minioadmin/minioadmin)

## 常用命令

### 构建镜像

**Windows:**
```powershell
.\docker-build.ps1
# 不使用缓存构建
.\docker-build.ps1 -NoCache
```

**Linux/Mac:**
```bash
./docker-build.sh
# 不使用缓存构建
./docker-build.sh --no-cache
```

### 管理服务

**启动服务:**
```bash
.\docker-deploy.ps1 -Action up
# 或重新构建后启动
.\docker-deploy.ps1 -Action up -Build
```

**停止服务:**
```bash
.\docker-deploy.ps1 -Action down
# 停止并删除数据卷（警告：会删除所有数据）
.\docker-deploy.ps1 -Action down -RemoveVolumes
```

**重启服务:**
```bash
.\docker-deploy.ps1 -Action restart
```

**查看日志:**
```bash
.\docker-deploy.ps1 -Action logs
```

**查看状态:**
```bash
.\docker-deploy.ps1 -Action status
```

**清理资源:**
```bash
.\docker-deploy.ps1 -Action clean
```

## 服务说明

### Backend (后端服务)
- **容器名**: `fitness_gym_backend`
- **端口**: 8080
- **健康检查**: http://localhost:8080/springboot1ngh61a2/user/login
- **数据卷**:
  - `backend_logs`: 应用日志
  - `upload_data`: 上传的文件

### PostgreSQL (数据库)
- **容器名**: `fitness_gym_postgres`
- **端口**: 5432
- **数据卷**: `postgres_data`
- **初始化**: 自动执行 `schema-postgresql.sql` 和 `data.sql`

### MinIO (对象存储)
- **容器名**: `fitness_gym_minio`
- **API 端口**: 9000
- **控制台端口**: 9001
- **数据卷**: `minio_data`
- **默认凭据**: minioadmin/minioadmin

## 默认账户

系统初始化后，可以使用以下账户登录：

### 管理员账户
- 用户名: `admin`
- 密码: `admin`

### 用户账户
- 用户名: `user01` 到 `user10`
- 密码: `123456`

### 教练账户
- 工号: `coach001` 到 `coach005`
- 密码: `123456`

**⚠️ 注意**: 生产环境请立即修改默认密码！

## 故障排查

### 后端无法启动

1. 检查数据库是否正常运行：
   ```bash
   docker-compose ps postgres
   ```

2. 查看后端日志：
   ```bash
   docker-compose logs backend
   ```

3. 检查端口是否被占用：
   ```bash
   # Windows
   netstat -ano | findstr :8080
   
   # Linux/Mac
   lsof -i :8080
   ```

### 数据库连接失败

1. 检查数据库健康状态：
   ```bash
   docker-compose exec postgres pg_isready -U postgres
   ```

2. 验证环境变量：
   ```bash
   docker-compose exec backend env | grep DB_
   ```

### 端口冲突

修改 `.env` 文件中的端口配置：
```env
SERVER_PORT=8081
POSTGRES_PORT=5433
```

然后重启服务：
```bash
docker-compose down
docker-compose up -d
```

### 内存不足

调整 Java 内存设置（在 `.env` 文件中）：
```env
JAVA_OPTS=-Xmx256m -Xms128m
```

## 数据备份

### 备份数据库

```bash
docker-compose exec postgres pg_dump -U postgres fitness_gym > backup.sql
```

### 恢复数据库

```bash
docker-compose exec -T postgres psql -U postgres fitness_gym < backup.sql
```

## 生产环境建议

1. **修改默认密码**: 确保修改 `.env` 文件中的 `POSTGRES_PASSWORD` 和 MinIO 凭据
2. **使用外部数据库**: 考虑使用托管数据库服务（如 AWS RDS、Azure Database）
3. **配置反向代理**: 使用 Nginx 或 Traefik 作为反向代理
4. **启用 HTTPS**: 配置 SSL/TLS 证书
5. **定期备份**: 设置数据库自动备份
6. **监控和日志**: 配置日志聚合和监控服务
7. **资源限制**: 已在 `docker-compose.yml` 中配置资源限制

## 更多信息

- [完整 Docker 部署指南](DOCKER.md)
- [Docker 实践指南](DOCKER.md)
- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 官方文档](https://docs.docker.com/compose/)

