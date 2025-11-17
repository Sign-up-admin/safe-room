---
title: DEPLOYMENT OPERATIONS
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---
# 运维操作指南

> 版本：v1.0
> 更新日期：2025-11-16
> 适用范围：Docker部署环境

---

## 概述

本文档介绍健身房综合管理系统在生产环境中的日常运维操作，包括服务管理、健康检查、日志查看、性能监控等核心运维内容。

## 环境准备

### 前置要求

- Docker 和 Docker Compose 已安装并运行
- 具有 sudo 或管理员权限
- 网络连接正常
- `.env` 文件已正确配置

### 常用命令别名

```bash
# Linux/Mac
alias dps='docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
alias dlogs='docker-compose logs -f --tail=100'
alias dstatus='docker-compose ps && echo "--- Resource Usage ---" && docker stats --no-stream'

# Windows PowerShell
function dps { docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}" }
function dlogs { docker-compose logs -f --tail=100 }
function dstatus { docker-compose ps; Write-Host "--- Resource Usage ---"; docker stats --no-stream }
```

---

## 1. 服务管理

### 1.1 启动服务

#### 完整启动所有服务

```bash
# 使用部署脚本（推荐）
.\docker-deploy.ps1 -Action up
# 或
./docker-deploy.sh up

# 或者直接使用 Docker Compose
docker-compose up -d

# 查看启动状态
docker-compose ps
```

#### 选择性启动服务

```bash
# 仅启动数据库
docker-compose up -d postgres

# 仅启动后端服务
docker-compose up -d backend

# 仅启动MinIO
docker-compose up -d minio
```

### 1.2 停止服务

#### 正常停止

```bash
# 使用部署脚本（推荐）
.\docker-deploy.ps1 -Action down
# 或
./docker-deploy.sh down

# 或者直接使用 Docker Compose
docker-compose down
```

#### 强制停止

```bash
# 强制停止所有服务（不等待优雅关闭）
docker-compose down --timeout 0

# 停止并删除数据卷（危险操作）
docker-compose down -v
```

#### 停止特定服务

```bash
# 停止后端服务
docker-compose stop backend

# 停止数据库
docker-compose stop postgres
```

### 1.3 重启服务

#### 重启所有服务

```bash
# 使用部署脚本
.\docker-deploy.ps1 -Action restart
# 或
./docker-deploy.sh restart

# 或者直接重启
docker-compose restart
```

#### 重启特定服务

```bash
# 重启后端服务
docker-compose restart backend

# 重启数据库
docker-compose restart postgres
```

### 1.4 服务状态检查

```bash
# 查看服务状态
docker-compose ps

# 查看详细状态（包括端口映射）
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"

# 查看服务健康状态
docker-compose exec postgres pg_isready -U postgres -d fitness_gym
curl -f http://localhost:8080/springboot1ngh61a2/user/login
```

---

## 2. 健康检查

### 2.1 应用健康检查

#### 后端服务健康检查

```bash
# 检查后端API健康状态
curl -s http://localhost:8080/springboot1ngh61a2/user/login

# 检查详细健康信息
curl -s http://localhost:8080/springboot1ngh61a2/actuator/health

# 检查数据库连接健康状态
curl -s http://localhost:8080/springboot1ngh61a2/actuator/health/db
```

#### 数据库健康检查

```bash
# 检查PostgreSQL服务状态
docker-compose exec postgres pg_isready -U postgres -d fitness_gym

# 检查数据库连接数
docker-compose exec postgres psql -U postgres -d fitness_gym -c "SELECT count(*) FROM pg_stat_activity;"

# 检查数据库大小
docker-compose exec postgres psql -U postgres -d fitness_gym -c "SELECT pg_size_pretty(pg_database_size('fitness_gym'));"
```

#### MinIO健康检查

```bash
# 检查MinIO服务状态
curl -f http://localhost:9000/minio/health/live

# 检查MinIO控制台
curl -f http://localhost:9001/login
```

### 2.2 容器健康检查

```bash
# 查看容器健康状态
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 检查特定容器健康状态
docker inspect --format='{{.State.Health.Status}}' fitness_gym_backend

# 查看容器资源使用情况
docker stats --no-stream
```

### 2.3 自动化健康监控脚本

```bash
#!/bin/bash
# health-check.sh

echo "=== 健康检查报告 $(date) ==="

# 检查Docker服务
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker服务异常"
    exit 1
fi

# 检查容器状态
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ 部分服务未运行"
    docker-compose ps
    exit 1
fi

# 检查后端健康
if ! curl -f -s http://localhost:8080/springboot1ngh61a2/user/login >/dev/null; then
    echo "❌ 后端服务异常"
    exit 1
fi

# 检查数据库连接
if ! docker-compose exec -T postgres pg_isready -U postgres -d fitness_gym >/dev/null; then
    echo "❌ 数据库连接异常"
    exit 1
fi

echo "✅ 所有服务正常"
```

---

## 3. 日志查看与分析

### 3.1 查看服务日志

#### 查看所有服务日志

```bash
# 查看最近100行日志
docker-compose logs --tail=100

# 实时查看日志（按Ctrl+C退出）
docker-compose logs -f

# 查看特定时间范围的日志
docker-compose logs --since "2024-01-01T00:00:00" --until "2024-01-01T23:59:59"
```

#### 查看特定服务日志

```bash
# 查看后端日志
docker-compose logs -f backend

# 查看数据库日志
docker-compose logs -f postgres

# 查看MinIO日志
docker-compose logs -f minio
```

#### 查看历史日志文件

```bash
# 进入容器查看日志文件
docker-compose exec backend bash
ls -la /app/logs/

# 查看应用日志
docker-compose exec backend tail -f /app/logs/springboot-schema.log

# 查看错误日志
docker-compose exec backend grep "ERROR" /app/logs/springboot-schema.log | tail -20
```

### 3.2 日志分析

#### 统计错误日志

```bash
# 统计各类型日志数量
docker-compose logs backend | grep -E "(ERROR|WARN|INFO)" | awk '{print $1}' | sort | uniq -c

# 查看最近的错误
docker-compose logs --tail=1000 backend | grep "ERROR" | tail -10

# 按小时统计错误
docker-compose logs backend | grep "ERROR" | awk '{print substr($1,1,13)}' | sort | uniq -c
```

#### 性能相关日志分析

```bash
# 查看慢查询日志（如果启用）
docker-compose logs backend | grep -i "slow\|timeout\|performance"

# 查看数据库连接池日志
docker-compose logs backend | grep -i "hikari\|connection"

# 查看内存使用日志
docker-compose logs backend | grep -i "memory\|gc\|heap"
```

### 3.3 日志轮转与清理

```bash
# 查看日志文件大小
docker-compose exec backend du -sh /app/logs/*

# 清理旧日志（保留最近7天）
docker-compose exec backend find /app/logs -name "*.log.*" -mtime +7 -delete

# 压缩日志文件
docker-compose exec backend gzip /app/logs/*.log.2024-01-*

# 查看磁盘使用情况
docker system df
docker system df -v
```

---

## 4. 性能监控

### 4.1 系统资源监控

#### CPU和内存使用情况

```bash
# 查看容器资源使用
docker stats

# 查看特定容器资源使用
docker stats fitness_gym_backend fitness_gym_postgres

# 查看系统资源
top
htop  # 如果安装了
```

#### 磁盘使用情况

```bash
# 查看磁盘使用
df -h

# 查看Docker卷使用情况
docker system df -v

# 查看数据卷大小
docker run --rm -v fitness_gym_postgres_data:/data alpine du -sh /data
```

### 4.2 数据库性能监控

#### 数据库连接监控

```bash
# 查看活跃连接
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';"

# 查看连接详情
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT datname, usename, client_addr, state, query_start FROM pg_stat_activity;"

# 查看连接池状态（通过应用日志）
docker-compose logs backend | grep -i "hikari" | tail -10
```

#### 查询性能监控

```bash
# 查看慢查询（需要启用pg_stat_statements扩展）
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT query, calls, total_time/calls as avg_time, rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;"

# 查看表大小和索引使用
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### 4.3 应用性能监控

#### JVM性能监控

```bash
# 查看JVM内存使用
docker-compose exec backend jcmd 1 VM.native_memory summary

# 查看GC情况
docker-compose exec backend jstat -gcutil 1 1000 5

# 查看线程信息
docker-compose exec backend jstack 1 | head -50
```

#### 接口响应时间监控

```bash
# 测试API响应时间
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/springboot1ngh61a2/user/login

# 其中 curl-format.txt 内容：
#      time_namelookup:  %{time_namelookup}\n
#         time_connect:  %{time_connect}\n
#      time_appconnect:  %{time_appconnect}\n
#         time_pretransfer:  %{time_pretransfer}\n
#            time_redirect:  %{time_redirect}\n
#       time_starttransfer:  %{time_starttransfer}\n
#                          ----------
#               time_total:  %{time_total}\n
```

### 4.4 监控告警脚本

```bash
#!/bin/bash
# monitor.sh

THRESHOLD_CPU=80
THRESHOLD_MEM=80
THRESHOLD_DISK=90

# CPU监控
CPU_USAGE=$(docker stats --no-stream --format "{{.CPUPerc}}" fitness_gym_backend | sed 's/%//')
if (( $(echo "$CPU_USAGE > $THRESHOLD_CPU" | bc -l) )); then
    echo "警告：CPU使用率过高 $CPU_USAGE%"
fi

# 内存监控
MEM_USAGE=$(docker stats --no-stream --format "{{.MemPerc}}" fitness_gym_backend | sed 's/%//')
if (( $(echo "$MEM_USAGE > $THRESHOLD_MEM" | bc -l) )); then
    echo "警告：内存使用率过高 $MEM_USAGE%"
fi

# 磁盘监控
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if (( DISK_USAGE > THRESHOLD_DISK )); then
    echo "警告：磁盘使用率过高 $DISK_USAGE%"
fi
```

---

## 5. 日常运维任务

### 5.1 定期检查清单

#### 每日检查

```bash
# 1. 服务状态检查
docker-compose ps

# 2. 健康检查
curl -f http://localhost:8080/springboot1ngh61a2/user/login
docker-compose exec postgres pg_isready -U postgres -d fitness_gym

# 3. 资源使用检查
docker stats --no-stream

# 4. 磁盘空间检查
df -h && docker system df

# 5. 日志检查（查看是否有错误）
docker-compose logs --since "24h" | grep -i error
```

#### 每周检查

```bash
# 1. 数据库备份验证
ls -la backup_*.sql

# 2. 日志轮转检查
docker-compose exec backend find /app/logs -name "*.log" -mtime +7

# 3. 数据库性能检查
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC
LIMIT 10;"

# 4. 安全检查
docker-compose exec postgres psql -U postgres -c "
SELECT usename, usecreatedb, usesuper, valuntil
FROM pg_user
WHERE valuntil IS NOT NULL AND valuntil < now() + interval '7 days';"
```

### 5.2 定期维护任务

#### 数据库维护

```bash
# 数据库清理
docker-compose exec postgres psql -U postgres -d fitness_gym -c "VACUUM ANALYZE;"

# 重新索引（在低峰期执行）
docker-compose exec postgres psql -U postgres -d fitness_gym -c "REINDEX DATABASE fitness_gym;"

# 更新统计信息
docker-compose exec postgres psql -U postgres -d fitness_gym -c "ANALYZE;"
```

#### 日志维护

```bash
# 压缩旧日志
docker-compose exec backend find /app/logs -name "*.log" -mtime +30 -exec gzip {} \;

# 删除超期日志（保留90天）
docker-compose exec backend find /app/logs -name "*.gz" -mtime +90 -delete
```

#### Docker维护

```bash
# 清理未使用的镜像
docker image prune -f

# 清理未使用的卷
docker volume prune -f

# 清理构建缓存
docker builder prune -f
```

---

## 6. 紧急处理流程

### 6.1 服务异常处理

#### 后端服务异常

```bash
# 1. 检查服务状态
docker-compose ps backend

# 2. 查看错误日志
docker-compose logs --tail=50 backend | grep -i error

# 3. 检查资源使用
docker stats fitness_gym_backend

# 4. 重启服务
docker-compose restart backend

# 5. 如果重启无效，查看详细日志
docker-compose logs -f backend
```

#### 数据库连接异常

```bash
# 1. 检查数据库状态
docker-compose ps postgres

# 2. 检查数据库健康
docker-compose exec postgres pg_isready -U postgres -d fitness_gym

# 3. 查看数据库日志
docker-compose logs --tail=50 postgres

# 4. 检查连接数
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"

# 5. 重启数据库
docker-compose restart postgres
```

### 6.2 性能问题处理

#### 高CPU使用率

```bash
# 1. 识别高CPU进程
docker stats

# 2. 查看容器内进程
docker-compose exec backend ps aux --sort=-%cpu | head -10

# 3. 查看JVM线程
docker-compose exec backend jstack 1 | grep -A 5 -B 5 "cpu"

# 4. 重启服务或扩展资源
docker-compose restart backend
```

#### 高内存使用

```bash
# 1. 检查内存使用
docker stats --no-stream

# 2. 查看JVM内存
docker-compose exec backend jmap -heap 1

# 3. 强制GC
docker-compose exec backend jcmd 1 GC.run

# 4. 如果无效，重启服务
docker-compose restart backend
```

### 6.3 磁盘空间不足

```bash
# 1. 检查磁盘使用
df -h

# 2. 清理Docker资源
docker system prune -f

# 3. 清理日志
docker-compose exec backend find /app/logs -name "*.log" -mtime +7 -delete

# 4. 清理数据库
docker-compose exec postgres psql -U postgres -d fitness_gym -c "VACUUM FULL;"

# 5. 如果仍不足，考虑扩容
```

---

## 6. 自动化运维

### 6.1 自动化部署

#### 使用增强部署脚本

```bash
# 完整部署流程（包含环境检查、健康检查、回滚）
./docker-deploy.sh up --environment production

# 构建并部署
./docker-deploy.sh up --build --environment staging

# 回滚到上一版本
./docker-deploy.sh rollback --rollback-tag v1.0.0
```

```powershell
# PowerShell 部署
.\docker-deploy.ps1 -Action up -Environment production

# 带构建的部署
.\docker-deploy.ps1 -Action up -Build -Environment staging

# 回滚部署
.\docker-deploy.ps1 -Action rollback -RollbackTag v1.0.0
```

#### 部署验证

```bash
# 运行健康检查
./docker-deploy.sh health

# 查看部署报告
cat deployment_report.md
```

### 6.2 自动化备份

#### 数据库备份

```bash
# 完整数据库备份
.\scripts\backup\backup-database.ps1 -BackupType full -Compress -Encrypt -EncryptionKey "your-key"

# 增量备份（标记）
.\scripts\backup\backup-database.ps1 -BackupType incremental

# 上传到S3
.\scripts\backup\backup-database.ps1 -UploadToS3 -S3Bucket "fitness-gym-backups" -S3Path "database/"
```

#### 备份监控

```bash
# 检查备份状态
.\scripts\backup\backup-monitor.ps1 -BackupDir ".\backups" -GenerateReport

# 发送通知的监控
.\scripts\backup\backup-monitor.ps1 -SendNotifications -SlackWebhookUrl "https://hooks.slack.com/..."
```

#### 数据库恢复

```bash
# 从备份恢复数据库
.\scripts\backup\restore-database.ps1 -BackupFile ".\backups\fitness_gym_db_backup_full_20251116.sql"

# 恢复到新数据库
.\scripts\backup\restore-database.ps1 -BackupFile ".\backups\backup.sql" -DatabaseName "fitness_gym_restored" -CreateDatabase

# 从加密备份恢复
.\scripts\backup\restore-database.ps1 -BackupFile ".\backups\backup.sql.enc" -Decrypt -DecryptionKey "your-key"
```

### 6.3 CI/CD集成

#### GitHub Actions 工作流

系统配置了完整的CI/CD流水线，包括：

- **代码质量检查**: 自动化代码格式化、单元测试、静态分析
- **安全扫描**: 依赖漏洞扫描、容器镜像安全检查
- **自动化部署**: 支持多环境自动部署
- **文档发布**: 自动生成和发布技术文档

#### 工作流触发

```yaml
# 主要分支推送触发完整CI/CD
on:
  push:
    branches: [ main, develop ]

# 手动触发部署
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        options: [development, staging, production]
```

### 6.4 定时任务配置

#### Linux Cron 任务

```bash
# 编辑 crontab
crontab -e

# 添加定时任务
# 每日凌晨2点执行备份
0 2 * * * /path/to/scripts/backup/backup-database.ps1 -BackupType full -Compress

# 每小时检查健康状态
0 * * * * /path/to/docker-deploy.sh health

# 每日早上9点发送监控报告
0 9 * * * /path/to/monitoring/scripts/health-check.sh --output /var/log/daily-health-report.json
```

#### Windows 任务计划程序

```powershell
# 创建备份任务
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument ".\scripts\backup\backup-database.ps1 -BackupType full -Compress"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -TaskName "FitnessGym-DatabaseBackup" -Action $action -Trigger $trigger -User "SYSTEM"

# 创建健康检查任务
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument ".\docker-deploy.ps1 -Action health"
$trigger = New-ScheduledTaskTrigger -Hourly
Register-ScheduledTask -TaskName "FitnessGym-HealthCheck" -Action $action -Trigger $trigger -User "SYSTEM"
```

## 7. 监控和告警

### 7.1 Prometheus + Grafana 监控

#### 启动监控栈

```bash
# 使用 Docker Compose 启动监控服务
docker-compose -f monitoring/docker-compose.yml up -d

# 或者使用增强部署脚本
./docker-deploy.sh up --monitoring-only
```

#### 监控配置

系统配置了以下监控组件：

- **Prometheus**: 指标收集和存储
- **Grafana**: 可视化仪表板
- **Alertmanager**: 告警管理
- **Node Exporter**: 系统指标收集
- **cAdvisor**: 容器指标收集

#### 访问监控界面

```bash
# Grafana 界面 (默认用户名/密码: admin/admin)
open http://localhost:3000

# Prometheus 界面
open http://localhost:9090

# Alertmanager 界面
open http://localhost:9093
```

### 7.2 健康检查脚本

#### 运行健康检查

```bash
# 基础健康检查
./monitoring/scripts/health-check.sh --service api --endpoint http://localhost:3000/health

# 数据库连接检查
./monitoring/scripts/health-check.sh --check-db --db-connection "postgresql://user:pass@localhost:5432/fitness_gym"

# 生成健康报告
./monitoring/scripts/health-check.sh --all --output health-report.json --format json
```

#### 健康检查指标

脚本检查以下方面：

- **API 端点响应**: HTTP 状态码、响应时间
- **数据库连接**: 连接状态、查询性能
- **系统资源**: CPU、内存、磁盘使用率
- **容器状态**: Docker 容器健康状态
- **外部服务**: 邮件服务、支付网关等

### 7.3 告警配置

#### Alertmanager 配置

```yaml
# monitoring/alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@fitness-gym.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'email-alerts'

receivers:
- name: 'email-alerts'
  email_configs:
  - to: 'ops@fitness-gym.com'
    send_resolved: true
```

#### 告警规则示例

```yaml
# monitoring/alerts.yml
groups:
- name: fitness_gym_alerts
  rules:
  - alert: HighCPUUsage
    expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is {{ $value }}% on {{ $labels.instance }}"

  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Service {{ $labels.job }} is down"
      description: "Service {{ $labels.job }} has been down for more than 1 minute"
```

#### 自定义告警通知

```bash
# 发送告警通知
./monitoring/scripts/alert-notifier.sh --alert-type "ServiceDown" --message "API service is down" --channel slack --webhook-url "https://hooks.slack.com/..."

# 邮件告警
./monitoring/scripts/alert-notifier.sh --alert-type "HighCPU" --message "CPU usage > 80%" --channel email --to "ops@fitness-gym.com"
```

### 7.4 监控仪表板

#### 系统监控仪表板

预配置的 Grafana 仪表板包含：

- **CPU 使用率**: 实时 CPU 监控，按核心展示
- **内存使用**: RAM 和交换分区使用情况
- **磁盘 I/O**: 读写性能和存储使用率
- **网络流量**: 入站/出站带宽使用
- **系统负载**: 1/5/15 分钟平均负载

#### 应用监控仪表板

应用级监控指标：

- **请求率**: 每秒 API 请求数量
- **响应时间**: P95/P99 响应时间
- **错误率**: HTTP 4xx/5xx 错误百分比
- **数据库连接**: 活跃连接数和连接池状态
- **业务指标**: 用户注册、课程预订等

#### 创建自定义仪表板

```json
// Grafana 仪表板 JSON 配置示例
{
  "dashboard": {
    "title": "Fitness Gym Application",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P95 Response Time"
          }
        ]
      }
    ]
  }
}
```

### 7.5 日志管理

#### 集中日志配置

```yaml
# docker-compose.yml 中的日志配置
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  database:
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"
```

#### 日志轮转和清理

```bash
# 手动日志清理
docker-compose logs --no-color > full_logs.txt
docker-compose logs --no-color | grep ERROR > error_logs.txt

# 压缩旧日志
find /var/log -name "*.log" -mtime +30 -exec gzip {} \;

# 删除超过90天的压缩日志
find /var/log -name "*.gz" -mtime +90 -delete
```

### 7.6 性能监控

#### 性能基准测试

```bash
# 使用 Apache Bench 进行负载测试
ab -n 1000 -c 10 http://localhost:3000/api/workouts

# 使用 wrk 进行高并发测试
wrk -t12 -c400 -d30s http://localhost:3000/api/classes

# 数据库性能测试
pgbench -i -s 50 fitness_gym_db
pgbench -c 10 -j 2 -t 10000 fitness_gym_db
```

#### 性能指标收集

```bash
# 收集自定义指标
./monitoring/scripts/metrics-collector.sh --collect-system
./monitoring/scripts/metrics-collector.sh --collect-app --endpoint http://localhost:3000/metrics

# 导出 Prometheus 格式指标
./monitoring/scripts/metrics-collector.sh --export-prometheus > custom_metrics.txt
```

### 7.7 告警响应流程

#### 告警严重级别

1. **信息 (Info)**: 需要注意但不紧急的情况
2. **警告 (Warning)**: 可能影响服务质量的问题
3. **错误 (Error)**: 影响部分功能的问题
4. **严重 (Critical)**: 服务完全不可用的紧急情况

#### 响应时间目标

- **警告级别**: 15 分钟内响应
- **错误级别**: 5 分钟内响应
- **严重级别**: 1 分钟内响应

#### 事件响应流程

```mermaid
graph TD
    A[收到告警] --> B{严重级别?}
    B -->|严重| C[立即通知所有值班人员]
    B -->|错误| D[通知主要值班人员]
    B -->|警告| E[添加到响应队列]

    C --> F[启动应急响应]
    D --> F
    E --> G[正常工作时间响应]

    F --> H[调查根本原因]
    G --> H

    H --> I{是否需要回滚?}
    I -->|是| J[执行回滚]
    I -->|否| K[应用修复]

    J --> L[验证修复]
    K --> L

    L --> M[编写事件报告]
    M --> N[更新监控规则]
```

#### 事件报告模板

```markdown
# 事件报告

## 事件概况
- **事件ID**: INC-2025-0116-001
- **发生时间**: 2025-11-16 14:30 UTC
- **解决时间**: 2025-11-16 15:15 UTC
- **影响范围**: API 服务响应延迟增加 20%

## 根本原因
数据库连接池耗尽导致的性能问题

## 影响评估
- 用户体验: 中等影响 (响应时间增加)
- 业务影响: 订单处理延迟
- 数据影响: 无数据丢失

## 解决措施
1. 增加数据库连接池大小
2. 添加连接池监控告警
3. 实施渐进式部署策略

## 预防措施
- 定期审查连接池配置
- 添加自动化性能测试
- 建立容量规划流程
```

### 7.8 监控最佳实践

#### 监控覆盖范围

确保监控覆盖以下方面：

- **基础设施**: CPU、内存、磁盘、网络
- **应用性能**: 响应时间、吞吐量、错误率
- **业务指标**: 用户活跃度、转化率、收入指标
- **安全事件**: 异常访问、漏洞扫描结果
- **依赖服务**: 外部 API、数据库、缓存服务

#### 告警规则设计

```yaml
# 好的告警规则示例
alert: APISlowResponse
expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
for: 5m
labels:
  severity: warning
annotations:
  summary: "API response time is slow"
  description: "95th percentile response time is {{ $value }}s, expected < 2s"
  runbook_url: "https://docs.fitness-gym.com/runbooks/api-slow-response"
```

#### 监控数据保留

```yaml
# Prometheus 配置数据保留
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts.yml"

# 数据保留策略
storage:
  tsdb:
    retention.time: 30d  # 保留30天数据
    retention.size: 10GB  # 最大存储大小
```

## 8. 应急响应

### 8.1 应急响应团队

#### 响应角色定义

- **主要响应者 (Primary Responder)**: 第一个收到告警并开始调查的人
- **二级响应者 (Secondary Responder)**: 协助主要响应者，提供技术支持
- **沟通协调员 (Communications Coordinator)**: 负责与利益相关者沟通
- **管理层代表 (Management Liaison)**: 负责业务影响评估和决策

#### 联系信息

```markdown
# 应急响应联系人

## 技术团队
- **系统管理员**: admin@fitness-gym.com, +1 (555) 123-4567
- **开发负责人**: dev-lead@fitness-gym.com, +1 (555) 123-4568
- **数据库管理员**: dba@fitness-gym.com, +1 (555) 123-4569

## 业务团队
- **运营总监**: ops-director@fitness-gym.com, +1 (555) 987-6543
- **客服经理**: support@fitness-gym.com, +1 (555) 987-6544

## 外部支持
- **云服务提供商**: aws-support@amazon.com
- **监控服务商**: monitoring@datadog.com
- **安全团队**: security@fitness-gym.com
```

### 8.2 常见应急场景

#### 场景1: 服务完全不可用

```bash
# 立即响应步骤
1. 确认服务状态
docker-compose ps

2. 检查系统资源
docker stats

3. 查看错误日志
docker-compose logs --tail=100 api

4. 启动备用服务 (如果配置了)
./docker-deploy.sh up --failover

5. 通知用户
# 通过社交媒体、邮件、短信通知用户
```

#### 场景2: 数据库连接问题

```bash
# 数据库问题排查
1. 检查数据库状态
docker-compose exec database pg_isready

2. 查看数据库日志
docker-compose logs database

3. 检查连接数
docker-compose exec database psql -U fitness_user -d fitness_gym -c "SELECT count(*) FROM pg_stat_activity;"

4. 重启数据库服务
docker-compose restart database

5. 如果需要，从备份恢复
.\scripts\backup\restore-database.ps1 -BackupFile ".\backups\latest_backup.sql"
```

#### 场景3: 高CPU/内存使用

```bash
# 性能问题排查
1. 识别问题进程
docker stats

2. 查看详细资源使用
top -p $(pgrep -f "node|python|java")

3. 检查应用日志中的性能警告
docker-compose logs --tail=50 api | grep -i "slow\|timeout\|memory"

4. 重启受影响的服务
docker-compose restart api

5. 如果问题持续，考虑扩容
docker-compose up -d --scale api=2
```

### 8.3 回滚流程

#### 自动回滚

```bash
# 使用增强部署脚本回滚
./docker-deploy.sh rollback --rollback-tag v1.2.0

# 或者指定具体镜像
./docker-deploy.sh rollback --rollback-image fitness-gym-api:v1.1.5
```

#### 手动回滚步骤

```bash
1. 停止当前服务
docker-compose down

2. 修改 docker-compose.yml 使用之前的镜像版本
# 将 image: fitness-gym-api:latest 改为 image: fitness-gym-api:v1.1.5

3. 启动服务
docker-compose up -d

4. 验证服务状态
./docker-deploy.sh health

5. 监控恢复情况
# 检查错误率是否降低，响应时间是否恢复正常
```

### 8.4 沟通模板

#### 内部状态更新模板

```markdown
# 事件状态更新 - #{事件ID}

**当前状态**: [调查中/修复中/已解决/监控中]

**最新进展**:
- [简要描述最新发现或采取的措施]

**影响评估**:
- 用户影响: [无影响/轻微影响/中等影响/严重影响]
- 业务影响: [描述对业务的具体影响]

**预计恢复时间**: [具体时间或时间范围]

**下一步行动**:
- [计划采取的下一步措施]

**需要支持**: [是否需要其他团队支持]
```

#### 用户通知模板

```markdown
# 服务维护通知

亲爱的健身房会员：

我们正在经历技术问题，目前正在全力修复。

**问题描述**: [简要描述用户可见的问题]

**影响**: [对用户体验的具体影响]

**预计解决时间**: [具体时间或时间范围]

**备用方案**: [如果有，提供备用访问方式]

我们为带来的不便深表歉意，将尽快恢复正常服务。

如有疑问，请联系客服: support@fitness-gym.com

健身房技术团队
```

### 8.5 事后回顾

#### 回顾会议议程

```markdown
# 事件回顾会议 - #{事件ID}

## 参会人员
- [列出所有参与事件响应的人员]

## 时间线回顾
- 事件开始时间: [时间]
- 告警触发时间: [时间]
- 响应开始时间: [时间]
- 问题解决时间: [时间]
- 服务完全恢复时间: [时间]

## 事件分析
### 根本原因
[详细描述导致事件的根本原因]

### 影响范围
- 受影响的用户数量: [数量]
- 受影响的功能: [列出具体功能]
- 业务损失评估: [财务或运营影响]

## 响应评估
### 做得好的地方
- [积极方面]

### 需要改进的地方
- [发现的问题点]

## 改进措施
### 短期措施 (1-2周内实施)
1. [具体措施]

### 长期措施 (1-3个月内实施)
1. [具体措施]

## 行动项分配
- [负责人]: [具体任务和截止时间]
- [负责人]: [具体任务和截止时间]
```

#### 改进跟踪

创建改进任务跟踪表：

```markdown
| 改进项 | 负责人 | 优先级 | 状态 | 截止日期 | 验证标准 |
|--------|--------|--------|------|----------|----------|
| 增加数据库连接池监控 | @dba | 高 | 进行中 | 2025-12-01 | 监控指标正常，告警规则生效 |
| 实施蓝绿部署策略 | @devops | 中 | 待开始 | 2025-12-15 | 部署脚本支持蓝绿部署 |
| 添加自动化性能测试 | @qa | 中 | 待开始 | 2025-12-31 | CI/CD 流水线包含性能测试 |
```

### 8.6 灾难恢复

#### 数据中心故障场景

```bash
# 灾难恢复流程
1. 激活备用数据中心
   # 使用云服务提供商的故障转移功能

2. 启动备份服务
   docker-compose -f docker-compose.backup.yml up -d

3. 恢复最新数据备份
   .\scripts\backup\restore-database.ps1 -BackupFile ".\backups\disaster-recovery.sql"

4. 更新 DNS 记录指向备用站点
   # 修改 DNS A 记录或使用 CDN 故障转移

5. 验证服务可用性
   ./monitoring/scripts/health-check.sh --all --comprehensive

6. 通知用户服务已恢复
```

#### 灾难恢复测试

```bash
# 定期进行灾难恢复演练
1. 安排维护窗口
2. 创建测试环境模拟生产环境
3. 执行完整的故障转移流程
4. 验证数据一致性和服务可用性
5. 记录演练结果和改进点
6. 更新灾难恢复文档
```

### 8.7 最佳实践

#### 预防措施

- **定期备份**: 确保数据备份的完整性和可恢复性
- **监控覆盖**: 实施全面的监控和告警系统
- **自动化测试**: 建立自动化测试确保代码质量
- **容量规划**: 定期评估系统容量和性能瓶颈
- **安全加固**: 实施安全最佳实践防止安全事件

#### 响应原则

- **快速响应**: 按照严重级别及时响应告警
- **有效沟通**: 保持所有利益相关者及时了解情况
- **透明记录**: 详细记录事件处理过程和决策
- **持续改进**: 从每次事件中学习并改进系统

---

*最后更新: 2025-11-16*  
*版本: v2.1*  
*维护者: 运维团队*
