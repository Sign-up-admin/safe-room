---
title: SCRIPTS REFERENCE
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---
# 脚本参考手册

> 版本：v1.0
> 更新日期：2025-11-16
> 适用范围：Windows PowerShell 和 Linux Bash 环境

---

## 概述

本文档提供健身房综合管理系统所有运维脚本的完整参考，包括功能说明、使用示例、参数说明和注意事项。这些脚本涵盖了部署、测试、数据库管理、监控等各个方面，帮助运维人员高效执行日常任务。

## 脚本分类

### 1. Docker部署脚本

#### docker-build.ps1 / docker-build.sh

**功能说明**: 构建Docker镜像，支持增量构建和强制重新构建。

**位置**: 项目根目录

**参数**:
- `-NoCache`: 强制重新构建，不使用缓存
- `-Tag <string>`: 指定镜像标签（默认: latest）

**使用示例**:

```powershell
# Windows PowerShell
.\docker-build.ps1
.\docker-build.ps1 -NoCache
.\docker-build.ps1 -Tag v1.0.0

# Linux Bash
./docker-build.sh
./docker-build.sh --no-cache
./docker-build.sh --tag v1.0.0
```

**注意事项**:
- 需要Docker BuildKit支持
- 构建过程可能需要几分钟
- 确保有足够的磁盘空间

#### docker-deploy.ps1 / docker-deploy.sh

**功能说明**: Docker服务部署和管理，支持启动、停止、重启、日志查看等操作。

**位置**: 项目根目录

**参数**:
- `-Action <string>`: 操作类型 (up/down/restart/logs/status/build/clean)
- `-Build`: 启动时重新构建镜像
- `-Detached`: 后台运行（默认）
- `-RemoveVolumes`: 停止时删除数据卷

**使用示例**:

```powershell
# 启动服务
.\docker-deploy.ps1 -Action up
.\docker-deploy.ps1 -Action up -Build

# 停止服务
.\docker-deploy.ps1 -Action down
.\docker-deploy.ps1 -Action down -RemoveVolumes

# 查看日志
.\docker-deploy.ps1 -Action logs

# 重启服务
.\docker-deploy.ps1 -Action restart

# 清理资源
.\docker-deploy.ps1 -Action clean

# Linux等效命令
./docker-deploy.sh up
./docker-deploy.sh down --remove-volumes
./docker-deploy.sh logs
```

**注意事项**:
- 删除数据卷操作会丢失所有数据
- 构建操作需要网络连接下载依赖
- 日志查看支持实时监控

#### redeploy.ps1 / redeploy.sh

**功能说明**: 快速重新部署整个系统，支持代码更新、镜像重建和服务重启。

**位置**: 项目根目录

**参数**: 无

**使用示例**:

```powershell
# 交互式重新部署
.\redeploy.ps1

# Linux等效命令
./redeploy.sh
```

**执行流程**:
1. 停止现有服务
2. 可选择清理数据卷
3. 可选择重新构建镜像
4. 启动所有服务
5. 验证服务状态

**注意事项**:
- 会询问是否清理数据和重新构建
- 重新构建可能需要较长时间

### 2. 数据库管理脚本

#### rebuild-database.ps1 / rebuild-database.sh

**功能说明**: 重建PostgreSQL数据库，包括删除现有数据库、创建新数据库、执行初始化脚本。

**位置**: 项目根目录

**参数**:
- `-DbName <string>`: 数据库名称（默认: fitness_gym）
- `-DbUser <string>`: 数据库用户名（默认: postgres）
- `-DbPassword <string>`: 数据库密码（默认: postgres）
- `-DbHost <string>`: 数据库主机（默认: localhost）
- `-DbPort <int>`: 数据库端口（默认: 5432）

**使用示例**:

```powershell
# 使用默认参数重建数据库
.\rebuild-database.ps1

# 指定自定义参数
.\rebuild-database.ps1 -DbName mydb -DbUser admin -DbPassword secret123

# Linux等效命令
./rebuild-database.sh
./rebuild-database.sh -DbName mydb -DbUser admin -DbPassword secret123
```

**执行流程**:
1. 检查PostgreSQL连接
2. 确认操作（会删除所有数据）
3. 终止现有连接
4. 删除现有数据库
5. 创建新数据库
6. 执行schema脚本
7. 执行数据脚本
8. 验证结果

**注意事项**:
- **危险操作，会删除所有数据**
- 需要PostgreSQL管理员权限
- 确保有数据库备份

#### start-database.ps1 / start-db.ps1 / start-db.sh

**功能说明**: 启动PostgreSQL数据库容器。

**位置**: 项目根目录

**参数**: 无

**使用示例**:

```powershell
# 启动数据库
.\start-database.ps1
# 或
.\start-db.ps1

# Linux等效命令
./start-db.sh
```

**注意事项**:
- 使用Docker Compose启动服务
- 会自动执行数据库初始化

### 3. 服务管理脚本

#### start-all.ps1

**功能说明**: 启动完整的开发环境，包括数据库、后端、前端和Admin。

**位置**: 项目根目录

**参数**:
- `-SkipDatabase`: 跳过数据库启动
- `-SkipBackend`: 跳过后端启动
- `-SkipFrontend`: 跳过前端启动
- `-SkipAdmin`: 跳过Admin启动
- `-SkipChecks`: 跳过依赖检查

**使用示例**:

```powershell
# 启动所有服务
.\start-all.ps1

# 仅启动后端和数据库
.\start-all.ps1 -SkipFrontend -SkipAdmin

# 跳过检查（快速启动）
.\start-all.ps1 -SkipChecks
```

**功能特性**:
- 自动检查系统依赖
- 并行启动各个服务
- 等待服务就绪
- 创建进程信息文件用于停止

**注意事项**:
- 需要安装所有必要的开发工具
- 会打开多个PowerShell窗口

#### stop-all.ps1

**功能说明**: 停止所有开发环境服务。

**位置**: 项目根目录

**参数**:
- `-WithDatabase`: 同时停止数据库容器

**使用示例**:

```powershell
# 停止所有服务（不含数据库）
.\stop-all.ps1

# 停止所有服务（包含数据库）
.\stop-all.ps1 -WithDatabase
```

**执行流程**:
1. 读取进程信息文件
2. 终止各个服务进程
3. 可选择停止数据库容器
4. 清理进程信息文件

**注意事项**:
- 需要start-all.ps1创建的进程信息文件
- 强制终止进程，可能丢失未保存的工作

#### start-frontend.ps1 / start-frontend-both.ps1

**功能说明**: 启动前端开发服务。

**位置**: 项目根目录

**使用示例**:

```powershell
# 启动单个前端服务
.\start-frontend.ps1

# 启动前后端两个前端服务
.\start-frontend-both.ps1
```

### 4. 测试脚本

#### run-frontend-tests.ps1 / run-frontend-tests-complete.ps1 / run-frontend-tests-complete.sh

**功能说明**: 执行前端测试。

**位置**: 项目根目录

**使用示例**:

```powershell
# 运行前端测试
.\run-frontend-tests.ps1

# 运行完整前端测试套件
.\run-frontend-tests-complete.ps1

# Linux等效命令
./run-frontend-tests-complete.sh
```

#### run-admin-frontend-tests.ps1

**功能说明**: 执行Admin前端测试。

**位置**: 项目根目录

**使用示例**:

```powershell
.\run-admin-frontend-tests.ps1
```

#### test-admin-automation.ps1

**功能说明**: 执行Admin自动化测试。

**位置**: 项目根目录

**使用示例**:

```powershell
.\test-admin-automation.ps1
```

#### test-single.ps1

**功能说明**: 执行单个测试。

**位置**: 项目根目录

**参数**: 测试文件路径

**使用示例**:

```powershell
.\test-single.ps1 "path/to/test/file"
```

#### frontend-coverage-monitor.ps1 / coverage-monitor.ps1

**功能说明**: 监控前端测试覆盖率。

**位置**: 项目根目录

**使用示例**:

```powershell
.\frontend-coverage-monitor.ps1
.\coverage-monitor.ps1
```

#### coverage-trend-analysis.ps1

**功能说明**: 分析测试覆盖率趋势。

**位置**: 项目根目录

**使用示例**:

```powershell
.\coverage-trend-analysis.ps1
```

#### frontend-test-automation.ps1

**功能说明**: 前端测试自动化。

**位置**: 项目根目录

**使用示例**:

```powershell
.\frontend-test-automation.ps1
```

### 5. 数据库维护脚本

#### reset-admin-password.ps1 / reset-admin-password.sh

**功能说明**: 重置管理员密码。

**位置**: 项目根目录

**使用示例**:

```powershell
.\reset-admin-password.ps1
# Linux等效命令
./reset-admin-password.sh
```

#### reset-admin-direct.ps1 / reset-admin-direct.sh

**功能说明**: 直接重置管理员账户。

**位置**: 项目根目录

**使用示例**:

```powershell
.\reset-admin-direct.ps1
# Linux等效命令
./reset-admin-direct.sh
```

#### clear-rate-limit.ps1 / clear-rate-limit.sh

**功能说明**: 清除速率限制。

**位置**: 项目根目录

**使用示例**:

```powershell
.\clear-rate-limit.ps1
# Linux等效命令
./clear-rate-limit.sh
```

#### create-test-db.ps1

**功能说明**: 创建测试数据库。

**位置**: 项目根目录

**使用示例**:

```powershell
.\create-test-db.ps1
```

### 6. 脚本工具

#### scripts/aggregate-test-results.js

**功能说明**: 聚合测试结果。

**位置**: scripts/目录

**使用示例**:

```bash
node scripts/aggregate-test-results.js
```

## 脚本执行环境

### 系统要求

| 组件 | Windows | Linux/Mac |
|------|---------|----------|
| **PowerShell** | 5.1+ | PowerShell Core 7+ |
| **Bash** | - | 4.0+ |
| **Docker** | 20.10+ | 20.10+ |
| **Node.js** | 16+ | 16+ |
| **Java** | 21+ | 21+ |
| **Maven** | 3.6+ | 3.6+ |

### 环境变量

```bash
# Docker相关
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1

# 数据库连接
POSTGRES_DB=fitness_gym
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Java环境
JAVA_HOME=/path/to/java
JAVA_OPTS=-Xmx2g -Xms512m

# Node环境
NODE_ENV=development
```

### 权限要求

- **Docker操作**: 需要docker组权限或sudo
- **文件操作**: 需要适当的文件系统权限
- **数据库操作**: 需要PostgreSQL管理员权限
- **网络操作**: 需要适当的网络权限

## 脚本依赖关系

```
start-all.ps1
├── start-db.ps1 (数据库)
├── springboot1ngh61a2/ (后端)
├── start-frontend.ps1 (前端)
└── start-admin.ps1 (管理后台)

docker-deploy.ps1
├── docker-compose.yml
├── .env
└── Dockerfile

rebuild-database.ps1
├── PostgreSQL客户端
├── schema-postgresql.sql
└── data.sql

测试脚本
├── Node.js/npm
├── 测试框架 (Vitest/Playwright)
└── 浏览器 (Chrome/Firefox)
```

## 故障排除

### 常见问题

#### 脚本执行失败

```bash
# 检查脚本权限
ls -la script.ps1
chmod +x script.sh

# 检查PowerShell执行策略
Get-ExecutionPolicy
Set-ExecutionPolicy RemoteSigned

# 检查依赖
docker --version
java -version
mvn -version
node --version
```

#### Docker相关问题

```bash
# 检查Docker状态
docker ps
docker-compose ps

# 查看Docker日志
docker-compose logs
docker logs container_name

# 检查磁盘空间
df -h
docker system df
```

#### 数据库连接问题

```bash
# 检查数据库状态
docker-compose exec postgres pg_isready -U postgres -d fitness_gym

# 查看数据库日志
docker-compose logs postgres

# 测试连接
psql -h localhost -p 5432 -U postgres -d fitness_gym
```

#### 前端构建问题

```bash
# 清理缓存
rm -rf node_modules/.vite
npm cache clean --force

# 检查Node版本
node --version
npm --version

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### 调试技巧

#### 启用详细输出

```powershell
# PowerShell详细输出
$VerbosePreference = "Continue"
.\script.ps1 -Verbose

# Bash调试模式
bash -x script.sh
```

#### 日志记录

```powershell
# PowerShell日志
Start-Transcript -Path "script-log.txt"
.\script.ps1
Stop-Transcript

# Bash日志
exec > script-log.txt 2>&1
./script.sh
```

## 最佳实践

### 1. 执行前准备

- **备份重要数据**: 在执行数据库相关脚本前备份
- **检查系统状态**: 确认系统资源充足
- **验证参数**: 确认脚本参数正确
- **记录操作**: 记录脚本执行过程

### 2. 安全考虑

- **最小权限**: 使用最小必要权限执行脚本
- **参数验证**: 验证脚本输入参数的安全性
- **审计日志**: 记录脚本执行的审计信息
- **定期更新**: 保持脚本和依赖的更新

### 3. 维护建议

- **版本控制**: 将脚本纳入版本控制
- **文档更新**: 及时更新脚本文档
- **测试验证**: 在测试环境验证脚本功能
- **定期审查**: 定期审查脚本的安全性和有效性

### 4. 使用建议

- **标准化**: 使用统一的命名和参数格式
- **模块化**: 将复杂逻辑拆分为可重用函数
- **错误处理**: 添加适当的错误处理和回滚机制
- **日志记录**: 添加详细的执行日志

## 脚本维护

### 更新流程

1. **功能需求**: 确认新的脚本需求
2. **设计审查**: 审查脚本设计和实现
3. **测试验证**: 在测试环境验证功能
4. **文档更新**: 更新脚本文档和使用说明
5. **上线部署**: 部署到生产环境

### 版本管理

- **语义化版本**: 使用v1.0.0格式
- **变更日志**: 记录脚本的重要变更
- **向后兼容**: 保持脚本的向后兼容性
- **弃用通知**: 提前通知脚本的弃用计划

## 相关文档

- [部署指南](DEPLOYMENT.md) - 部署流程和配置
- [Docker部署指南](DOCKER.md) - Docker环境使用
- [运维操作指南](DEPLOYMENT_OPERATIONS.md) - 日常运维操作
- [故障排查指南](TROUBLESHOOTING.md) - 问题诊断和解决
- [README.md](../../README.md) - 项目快速开始指南
