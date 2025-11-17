---
title: TROUBLESHOOTING
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---
# 故障排查指南

> 版本：v1.0
> 更新日期：2025-11-16
> 适用范围：Docker部署环境

---

## 概述

本文档提供健身房综合管理系统常见问题的诊断和解决方法，包括故障排查流程、紧急处理预案、问题分类和解决方案。遵循系统化的故障排查方法可以快速定位和解决问题，减少系统 downtime。

## 故障排查流程

### 1.1 通用排查流程

#### 第一步：收集信息

```bash
# 1. 查看服务状态
docker-compose ps

# 2. 检查系统资源
docker stats --no-stream
df -h
free -h

# 3. 查看最近日志
docker-compose logs --since "1h" --tail=50

# 4. 检查网络连通性
curl -f http://localhost:8080/springboot1ngh61a2/user/login || echo "后端服务异常"
docker-compose exec postgres pg_isready -U postgres -d fitness_gym || echo "数据库连接异常"
```

#### 第二步：问题分类

根据现象将问题分类：

| 现象 | 可能原因 | 排查方向 |
|------|----------|----------|
| 服务无法访问 | 服务未启动、端口冲突、配置错误 | 服务状态、端口占用、配置检查 |
| 响应缓慢 | 资源不足、数据库慢查询、内存泄漏 | 性能监控、数据库查询、JVM分析 |
| 功能异常 | 代码错误、数据问题、依赖服务故障 | 日志分析、数据验证、依赖检查 |
| 系统崩溃 | 内存溢出、磁盘空间不足、硬件故障 | 资源监控、日志分析、硬件检查 |

#### 第三步：问题诊断

```bash
#!/bin/bash
# diagnostic.sh - 自动诊断脚本

echo "=== 系统诊断报告 $(date) ==="

# 检查Docker服务
echo "1. Docker服务检查:"
if docker info >/dev/null 2>&1; then
    echo "   ✅ Docker运行正常"
else
    echo "   ❌ Docker服务异常"
    exit 1
fi

# 检查容器状态
echo "2. 容器状态检查:"
SERVICES=("postgres" "backend" "minio")
for service in "${SERVICES[@]}"; do
    if docker-compose ps $service | grep -q "Up"; then
        echo "   ✅ $service 运行正常"
    else
        echo "   ❌ $service 服务异常"
        docker-compose logs --tail=10 $service
    fi
done

# 检查端口占用
echo "3. 端口占用检查:"
PORTS=(5432 8080 9000)
for port in "${PORTS[@]}"; do
    if lsof -i :$port >/dev/null 2>&1; then
        echo "   ⚠️  端口 $port 已被占用"
        lsof -i :$port
    else
        echo "   ✅ 端口 $port 可用"
    fi
done

# 检查磁盘空间
echo "4. 磁盘空间检查:"
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "   ❌ 磁盘空间不足: $DISK_USAGE%"
else
    echo "   ✅ 磁盘空间正常: $DISK_USAGE%"
fi

# 检查内存使用
echo "5. 内存使用检查:"
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEM_USAGE -gt 90 ]; then
    echo "   ❌ 内存使用过高: $MEM_USAGE%"
else
    echo "   ✅ 内存使用正常: $MEM_USAGE%"
fi

echo "诊断完成"
```

#### 第四步：问题解决

根据诊断结果执行相应解决方案。

---

## 2. 服务启动问题

### 2.1 后端服务启动失败

#### 症状
- 容器无法启动
- Spring Boot应用启动失败
- 端口绑定错误

#### 排查步骤

```bash
# 1. 查看启动日志
docker-compose logs backend

# 2. 检查端口冲突
netstat -tlnp | grep 8080
lsof -i :8080

# 3. 检查JVM参数
docker-compose exec backend java -version

# 4. 检查配置文件
docker-compose exec backend cat /app/application.yml | head -20

# 5. 检查数据库连接
docker-compose exec backend nc -zv postgres 5432
```

#### 常见解决方案

**端口冲突**
```bash
# 修改端口配置
echo "SERVER_PORT=8081" >> .env
docker-compose up -d backend
```

**内存不足**
```bash
# 增加JVM内存
echo "JAVA_OPTS=-Xmx512m -Xms256m" >> .env
docker-compose up -d backend
```

**数据库连接失败**
```bash
# 检查数据库状态
docker-compose ps postgres
docker-compose logs postgres

# 验证数据库连接
docker-compose exec postgres pg_isready -U postgres -d fitness_gym
```

### 2.2 数据库启动失败

#### 症状
- PostgreSQL容器无法启动
- 数据库初始化失败
- 数据卷权限问题

#### 排查步骤

```bash
# 1. 查看数据库日志
docker-compose logs postgres

# 2. 检查数据卷
docker volume ls | grep postgres
docker volume inspect safe-room_postgres_data

# 3. 检查端口占用
lsof -i :5432

# 4. 检查数据卷权限
docker run --rm -v safe-room_postgres_data:/data alpine ls -la /data

# 5. 检查初始化脚本
docker-compose exec postgres ls -la /docker-entrypoint-initdb.d/
```

#### 常见解决方案

**数据卷损坏**
```bash
# 删除并重新创建数据卷
docker-compose down -v
docker-compose up -d postgres
```

**权限问题**
```bash
# 修复数据卷权限
docker run --rm -v safe-room_postgres_data:/data alpine chown -R 999:999 /data
docker-compose restart postgres
```

**初始化脚本错误**
```bash
# 检查SQL脚本语法
docker-compose exec postgres psql -U postgres -f /docker-entrypoint-initdb.d/01-schema.sql
docker-compose exec postgres psql -U postgres -f /docker-entrypoint-initdb.d/02-data.sql
```

---

## 3. 运行时问题

### 3.1 应用响应缓慢

#### 症状
- API响应时间变长
- 用户操作卡顿
- 系统整体变慢

#### 性能诊断

```bash
# 1. 检查系统资源
docker stats

# 2. 查看JVM GC情况
docker-compose exec backend jstat -gcutil 1 1000 5

# 3. 检查数据库连接
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"

# 4. 查看慢查询
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT query, total_time/calls as avg_time, calls
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 5;"

# 5. 检查缓存命中率
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT sum(blks_hit)*100/(sum(blks_hit)+sum(blks_read)) as cache_hit_ratio
FROM pg_stat_database WHERE datname='fitness_gym';"
```

#### 性能优化措施

**JVM调优**
```bash
# 调整GC参数
export JAVA_OPTS="-Xmx2g -Xms1g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
docker-compose restart backend
```

**数据库调优**
```sql
-- 添加缺失的索引
CREATE INDEX idx_bookings_user_date ON course_bookings(user_id, booking_date);
CREATE INDEX idx_courses_category ON courses(category);

-- 增加工作内存
ALTER SYSTEM SET work_mem = '8MB';
SELECT pg_reload_conf();
```

**连接池调优**
```yaml
# application-prod.yml
spring:
  datasource:
    hikari:
      maximum-pool-size: 30
      minimum-idle: 5
```

### 3.2 内存泄漏

#### 症状
- JVM堆内存持续增长
- 频繁Full GC
- 最终导致OutOfMemoryError

#### 内存泄漏排查

```bash
# 1. 查看JVM堆使用
docker-compose exec backend jmap -heap 1

# 2. 生成堆转储
docker-compose exec backend jmap -dump:format=b,file=/app/logs/heapdump.hprof 1

# 3. 分析堆对象
docker-compose exec backend jmap -histo:live 1 | head -20

# 4. 查看GC日志
docker-compose exec backend tail -f /app/logs/gc.log | grep -E "Full GC|major"

# 5. 分析线程
docker-compose exec backend jstack 1 | grep -A 5 -B 5 "BLOCKED\|WAITING"
```

#### 解决方案

**重启服务释放内存**
```bash
docker-compose restart backend
```

**代码层面的修复**
```java
// 避免内存泄漏的示例
@Service
public class BookingService {

    // 使用弱引用缓存
    private final Cache<Long, Booking> bookingCache = Caffeine.newBuilder()
        .weakKeys()
        .weakValues()
        .build();

    // 正确关闭资源
    public void processBookings() {
        try (Stream<Booking> bookings = bookingRepository.findAllStream()) {
            bookings.forEach(this::processBooking);
        } // Stream会自动关闭
    }

    // 清理缓存
    @Scheduled(fixedDelay = 3600000) // 每小时清理一次
    public void cleanupCache() {
        bookingCache.cleanUp();
    }
}
```

### 3.3 数据库连接问题

#### 症状
- 连接池耗尽
- "Connection timeout"错误
- 数据库响应缓慢

#### 连接问题诊断

```bash
# 1. 查看连接状态
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"

# 2. 查看连接详情
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT pid, usename, client_addr, state, query_start
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;"

# 3. 检查连接池配置
docker-compose logs backend | grep -i hikari | tail -10

# 4. 查看长时间运行的查询
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT pid, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '30 seconds'
ORDER BY query_start;"

# 5. 检查网络连通性
docker-compose exec backend nc -zv postgres 5432
```

#### 连接问题解决方案

**终止长时间运行的查询**
```sql
-- 查找并终止长时间运行的查询
SELECT pid, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '5 minutes';

-- 终止特定进程
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = XXX;
```

**调整连接池配置**
```yaml
# application-prod.yml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20  # 减少最大连接数
      idle-timeout: 300000   # 5分钟空闲超时
      max-lifetime: 1200000  # 20分钟最大生命周期
      leak-detection-threshold: 300000  # 5分钟泄漏检测
```

**数据库连接清理**
```bash
# 重启数据库释放所有连接
docker-compose restart postgres

# 或者优雅关闭连接
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
  AND state = 'idle'
  AND now() - state_change > interval '30 minutes';"
```

---

## 4. 数据问题

### 4.1 数据不一致

#### 症状
- 用户数据丢失
- 预约记录异常
- 统计数据不准确

#### 数据一致性检查

```sql
-- 检查数据完整性
-- 1. 检查外键约束
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';

-- 2. 检查数据一致性
SELECT 'Users without bookings' as check_type, count(*) as count
FROM users u
LEFT JOIN course_bookings b ON u.id = b.user_id
WHERE b.id IS NULL;

-- 3. 检查孤立记录
SELECT 'Orphaned bookings' as check_type, count(*) as count
FROM course_bookings b
LEFT JOIN users u ON b.user_id = u.id
WHERE u.id IS NULL;

-- 4. 检查重复数据
SELECT username, count(*) as count
FROM users
GROUP BY username
HAVING count(*) > 1;
```

#### 数据修复脚本

```sql
-- 数据清理和修复脚本
BEGIN;

-- 1. 删除孤立的预约记录
DELETE FROM course_bookings
WHERE user_id NOT IN (SELECT id FROM users);

-- 2. 修复用户状态
UPDATE users
SET status = 'ACTIVE'
WHERE status IS NULL;

-- 3. 清理过期的会话
DELETE FROM user_sessions
WHERE expires_at < NOW();

-- 4. 重新计算统计数据
UPDATE courses
SET booking_count = (
    SELECT COUNT(*) FROM course_bookings
    WHERE course_id = courses.id
    AND booking_status = 'CONFIRMED'
);

COMMIT;
```

### 4.2 数据损坏

#### 症状
- 数据库无法启动
- 数据查询返回错误
- 数据文件损坏

#### 数据损坏排查

```bash
# 1. 检查数据库日志
docker-compose logs postgres | grep -i error

# 2. 运行数据库完整性检查
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT tablename, n_tup_ins, n_tup_upd, n_tup_del, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;"

# 3. 检查表空间
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# 4. 尝试修复
docker-compose exec postgres psql -U postgres -d fitness_gym -c "VACUUM FULL ANALYZE;"

# 5. 如果修复失败，从备份恢复
# 参考 BACKUP_RECOVERY.md
```

---

## 5. 网络和安全问题

### 5.1 网络连通性问题

#### 症状
- 服务间无法通信
- 外部访问失败
- DNS解析问题

#### 网络问题排查

```bash
# 1. 检查容器网络
docker network ls
docker network inspect safe-room_fitness_gym_network

# 2. 测试服务间连通性
docker-compose exec backend ping postgres
docker-compose exec backend nc -zv minio 9000

# 3. 检查端口映射
docker-compose ps
docker port fitness_gym_backend

# 4. 测试外部访问
curl -v http://localhost:8080/springboot1ngh61a2/user/login

# 5. 检查防火墙
sudo ufw status
sudo iptables -L
```

#### 网络问题解决方案

**容器网络重建**
```bash
# 重建网络
docker-compose down
docker network rm safe-room_fitness_gym_network
docker-compose up -d
```

**DNS配置检查**
```bash
# 检查DNS配置
cat /etc/resolv.conf

# 测试DNS解析
nslookup localhost
nslookup postgres
```

### 5.2 安全问题

#### 症状
- 权限访问异常
- 认证失败
- 数据泄露

#### 安全问题排查

```bash
# 1. 检查文件权限
docker-compose exec backend ls -la /app/logs/
docker-compose exec backend ls -la /app/static/upload/

# 2. 检查数据库权限
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'users';"

# 3. 检查SSL/TLS配置
openssl s_client -connect localhost:8080 -servername localhost

# 4. 检查密码策略
docker-compose exec postgres psql -U postgres -c "
SELECT usename, valuntil, useconfig
FROM pg_user
WHERE usename LIKE '%';"

# 5. 审计日志检查
grep -i "failed.*login\|unauthorized\|forbidden" /app/logs/springboot-schema.log
```

---

## 6. 紧急处理流程

### 6.1 紧急响应分级

#### 级别一：一般故障（RTO: 4小时）
- 服务响应缓慢但可用
- 部分功能异常
- 数据完整性问题

**处理流程：**
1. 立即通知开发团队
2. 收集诊断信息
3. 实施临时修复方案
4. 制定详细修复计划

#### 级别二：严重故障（RTO: 1小时）
- 服务完全不可用
- 大量用户受影响
- 核心功能瘫痪

**处理流程：**
1. 立即启动应急响应
2. 通知所有相关方
3. 激活备用系统
4. 并行处理问题诊断和修复

#### 级别三：灾难级别（RTO: 15分钟）
- 系统完全崩溃
- 数据严重丢失
- 业务无法继续

**处理流程：**
1. 激活灾难恢复预案
2. 立即切换到备用站点
3. 从备份恢复数据
4. 通知用户和服务对象

### 6.2 应急工具包

#### 快速恢复脚本

```bash
#!/bin/bash
# emergency-recovery.sh

echo "=== 紧急恢复程序 $(date) ==="

# 1. 强制重启所有服务
echo "强制重启所有服务..."
docker-compose down --timeout 0
docker-compose up -d --force-recreate

# 2. 检查服务状态
echo "检查服务状态..."
sleep 30
docker-compose ps

# 3. 验证关键功能
echo "验证关键功能..."
if curl -f -s http://localhost:8080/springboot1ngh61a2/user/login >/dev/null; then
    echo "✅ 后端服务恢复正常"
else
    echo "❌ 后端服务仍异常"
fi

if docker-compose exec -T postgres pg_isready -U postgres -d fitness_gym >/dev/null; then
    echo "✅ 数据库连接正常"
else
    echo "❌ 数据库连接异常"
fi

echo "紧急恢复完成"
```

#### 系统快照脚本

```bash
#!/bin/bash
# system-snapshot.sh

SNAPSHOT_DIR="/emergency/snapshots/$(date +%Y%m%d_%H%M%S)"
mkdir -p $SNAPSHOT_DIR

echo "创建系统快照: $SNAPSHOT_DIR"

# 1. 收集系统状态
docker-compose ps > $SNAPSHOT_DIR/services.txt
docker stats --no-stream > $SNAPSHOT_DIR/resources.txt
df -h > $SNAPSHOT_DIR/disk.txt

# 2. 收集日志快照
docker-compose logs --tail=100 backend > $SNAPSHOT_DIR/backend_logs.txt
docker-compose logs --tail=100 postgres > $SNAPSHOT_DIR/postgres_logs.txt

# 3. 收集配置信息
cp .env $SNAPSHOT_DIR/ 2>/dev/null || echo "No .env file"
cp docker-compose.yml $SNAPSHOT_DIR/

# 4. 收集数据库统计
docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables;" > $SNAPSHOT_DIR/db_stats.txt

echo "系统快照创建完成: $SNAPSHOT_DIR"
```

### 6.3 联系和升级流程

#### 内部联系人

| 角色 | 姓名 | 联系方式 | 职责 |
|------|------|----------|------|
| 主要负责人 | 系统管理员 | admin@example.com | 问题诊断和修复 |
| 后备负责人 | 开发主管 | dev@example.com | 代码层面的问题解决 |
| DBA | 数据库管理员 | dba@example.com | 数据库相关问题 |
| 运维支持 | 运维工程师 | ops@example.com | 基础设施支持 |

#### 升级流程

1. **0-15分钟**: 主要负责人处理
2. **15-60分钟**: 增加后备负责人
3. **1-4小时**: 增加DBA和运维支持
4. **4+小时**: 升级到管理层

#### 外部联系

- **用户通知**: 通过网站公告和邮件通知用户
- **供应商支持**: 联系云服务提供商获得支持
- **监管机构**: 如涉及敏感数据，通知相关监管机构

---

## 7. 问题跟踪和预防

### 7.1 问题记录

#### 问题跟踪模板

```markdown
# 问题报告

## 基本信息
- **问题ID**: ISSUE-2024-001
- **报告时间**: 2024-01-15 14:30:00
- **报告人**: 系统管理员
- **优先级**: 高

## 问题描述
- **现象**: 用户无法登录系统
- **影响范围**: 所有用户
- **影响程度**: 系统不可用

## 诊断过程
1. 检查服务状态 - 发现后端服务异常
2. 查看日志 - 发现数据库连接超时
3. 检查数据库 - 发现连接池耗尽
4. 分析原因 - 长事务导致连接泄漏

## 解决方案
1. 终止长时间运行的事务
2. 重启后端服务
3. 调整连接池配置
4. 添加监控告警

## 预防措施
- 增加连接池监控
- 设置事务超时时间
- 添加定期健康检查

## 相关文档
- [连接池配置](PERFORMANCE_TUNING.md#连接池优化)
- [监控配置](MONITORING.md#数据库监控)
```

### 7.2 预防措施

#### 定期维护任务

```bash
#!/bin/bash
# preventive-maintenance.sh

echo "=== 预防性维护 $(date) ==="

# 1. 更新系统和容器
docker-compose pull
docker system prune -f

# 2. 数据库维护
docker-compose exec postgres psql -U postgres -d fitness_gym -c "VACUUM ANALYZE;"

# 3. 日志轮转
find /app/logs -name "*.log" -size +100M -exec gzip {} \;

# 4. 备份验证
# 参考 BACKUP_RECOVERY.md 中的验证脚本

# 5. 安全检查
# 检查文件权限
# 检查密码过期
# 检查访问日志

echo "预防性维护完成"
```

#### 监控阈值调整

基于历史数据调整监控阈值：

```bash
# 动态阈值计算脚本
#!/bin/bash
# dynamic-thresholds.sh

# 计算7天平均值
AVG_CPU=$(docker stats --no-stream --format "{{.CPUPerc}}" fitness_gym_backend 2>/dev/null | sed 's/%//' | awk '{sum+=$1; count++} END {print sum/count}')

AVG_MEM=$(docker stats --no-stream --format "{{.MemPerc}}" fitness_gym_backend 2>/dev/null | sed 's/%//' | awk '{sum+=$1; count++} END {print sum/count}')

# 设置动态阈值（平均值的1.5倍）
CPU_THRESHOLD=$(echo "$AVG_CPU * 1.5" | bc -l)
MEM_THRESHOLD=$(echo "$AVG_MEM * 1.5" | bc -l)

echo "动态阈值更新:"
echo "CPU阈值: $CPU_THRESHOLD%"
echo "内存阈值: $MEM_THRESHOLD%"
```

---

## 8. 最佳实践

### 8.1 故障排查原则

- **系统化方法**: 遵循标准排查流程，避免盲目尝试
- **最小化影响**: 在排查过程中尽量减少对用户的影响
- **记录过程**: 详细记录排查步骤和解决方案
- **知识积累**: 将问题和解决方案整理成知识库

### 8.2 预防性维护

- **定期检查**: 建立日常、每周、每月的检查计划
- **自动化监控**: 实施全面的自动化监控和告警
- **容量规划**: 根据业务增长规划系统容量
- **备份验证**: 定期测试备份恢复的有效性

### 8.3 应急准备

- **预案演练**: 定期进行故障恢复演练
- **工具准备**: 准备应急工具和快速恢复脚本
- **联系方式**: 维护完整的应急联系人信息
- **文档更新**: 及时更新故障处理文档

---

## 相关文档

- [运维操作指南](DEPLOYMENT_OPERATIONS.md) - 日常运维操作
- [监控指南](MONITORING.md) - 系统监控配置
- [日志管理指南](LOGGING.md) - 日志分析方法
- [性能调优指南](PERFORMANCE_TUNING.md) - 性能问题解决
- [备份恢复指南](BACKUP_RECOVERY.md) - 数据恢复方法
