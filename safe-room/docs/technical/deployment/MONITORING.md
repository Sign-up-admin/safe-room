---
title: MONITORING
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---
# 监控指南

> 版本：v1.0
> 更新日期：2025-11-16
> 适用范围：Docker部署环境

---

## 概述

本文档介绍健身房综合管理系统的监控策略，包括监控指标定义、健康检查配置、资源监控、数据库监控、应用性能监控以及告警配置。完善的监控体系是保障系统稳定运行的关键。

## 监控架构

### 1.1 监控层次

健身房管理系统采用分层监控架构：

```
┌─────────────────┐
│   业务监控       │  用户体验、业务指标
├─────────────────┤
│   应用监控       │  API响应、错误率、性能指标
├─────────────────┤
│   系统监控       │  CPU、内存、磁盘、网络
├─────────────────┤
│   基础设施监控   │  容器状态、网络连通性
└─────────────────┘
```

### 1.2 监控指标分类

| 分类 | 说明 | 示例指标 |
|------|------|----------|
| **可用性** | 系统是否正常运行 | 服务状态、健康检查、响应时间 |
| **性能** | 系统性能表现 | 响应时间、吞吐量、资源利用率 |
| **容量** | 资源使用情况 | CPU使用率、内存使用率、磁盘使用率 |
| **错误** | 错误和异常情况 | 错误率、异常数量、失败请求 |
| **业务** | 业务相关指标 | 用户活跃度、业务完成率 |

---

## 2. 健康检查配置

### 2.1 应用健康检查

#### Spring Boot健康端点

Spring Boot Actuator提供内置健康检查端点：

```yaml
# application-prod.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized
  health:
    db:
      enabled: true
    diskspace:
      enabled: true
      threshold: 10MB  # 磁盘空间阈值
    ping:
      enabled: true
```

#### 健康检查端点说明

| 端点 | 说明 | 正常响应 |
|------|------|----------|
| `/health` | 整体健康状态 | `{"status":"UP"}` |
| `/health/db` | 数据库连接健康 | `{"status":"UP"}` |
| `/health/disk` | 磁盘空间健康 | `{"status":"UP"}` |
| `/info` | 应用信息 | 版本、构建信息等 |
| `/metrics` | 性能指标 | JVM、HTTP等指标 |

#### Docker健康检查

```yaml
# docker-compose.yml
services:
  backend:
    # ... 其他配置
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/springboot1ngh61a2/user/login || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  postgres:
    # ... 其他配置
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d fitness_gym"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  minio:
    # ... 其他配置
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
      start_period: 30s
```

### 2.2 自定义健康检查

#### 业务逻辑健康检查

```java
@Component
public class BusinessHealthIndicator implements HealthIndicator {

    @Autowired
    private UserService userService;

    @Override
    public Health health() {
        try {
            // 检查业务关键功能
            long userCount = userService.countActiveUsers();
            if (userCount >= 0) {
                return Health.up()
                    .withDetail("activeUsers", userCount)
                    .build();
            } else {
                return Health.down()
                    .withDetail("error", "用户计数异常")
                    .build();
            }
        } catch (Exception e) {
            return Health.down(e)
                .withDetail("error", "业务检查失败")
                .build();
        }
    }
}
```

#### 外部服务健康检查

```java
@Component
public class ExternalServiceHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        try {
            // 检查MinIO连接
            boolean minioHealthy = checkMinioHealth();
            // 检查Redis连接（如果有）
            boolean redisHealthy = checkRedisHealth();

            if (minioHealthy && redisHealthy) {
                return Health.up().build();
            } else {
                return Health.down()
                    .withDetail("minio", minioHealthy)
                    .withDetail("redis", redisHealthy)
                    .build();
            }
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }

    private boolean checkMinioHealth() {
        // MinIO健康检查逻辑
        return true;
    }

    private boolean checkRedisHealth() {
        // Redis健康检查逻辑
        return true;
    }
}
```

---

## 3. 资源监控

### 3.1 系统资源监控

#### Docker容器监控

```bash
# 查看容器资源使用
docker stats

# 查看特定容器
docker stats fitness_gym_backend fitness_gym_postgres

# 查看容器资源使用历史
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
```

#### 资源使用阈值监控

```bash
#!/bin/bash
# resource-monitor.sh

# 阈值设置
CPU_THRESHOLD=80
MEM_THRESHOLD=85
DISK_THRESHOLD=90

echo "=== 资源监控报告 $(date) ==="

# CPU监控
CPU_USAGE=$(docker stats --no-stream --format "{{.CPUPerc}}" fitness_gym_backend | sed 's/%//')
if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
    echo "⚠️ CPU使用率过高: $CPU_USAGE%"
fi

# 内存监控
MEM_USAGE=$(docker stats --no-stream --format "{{.MemPerc}}" fitness_gym_backend | sed 's/%//')
if (( $(echo "$MEM_USAGE > $MEM_THRESHOLD" | bc -l) )); then
    echo "⚠️ 内存使用率过高: $MEM_USAGE%"
fi

# 磁盘监控
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if (( DISK_USAGE > DISK_THRESHOLD )); then
    echo "⚠️ 磁盘使用率过高: $DISK_USAGE%"
fi

echo "资源监控完成"
```

### 3.2 JVM性能监控

#### JVM指标收集

```yaml
# application-prod.yml
management:
  metrics:
    export:
      jmx:
        enabled: true
    enable:
      jvm: true
      system: true
      http: true
      hikaricp: true  # 数据库连接池指标
```

#### 关键JVM指标

| 指标 | 说明 | 正常范围 |
|------|------|----------|
| `jvm.memory.used` | JVM内存使用 | < 80% |
| `jvm.gc.pause` | GC暂停时间 | < 500ms |
| `jvm.threads.live` | 活跃线程数 | 根据应用而定 |
| `hikaricp.connections.active` | 活跃数据库连接 | < 最大连接数80% |

#### JVM监控命令

```bash
# 查看JVM内存使用
docker-compose exec backend jcmd 1 VM.native_memory summary

# 查看GC情况
docker-compose exec backend jstat -gcutil 1 1000 5

# 查看线程信息
docker-compose exec backend jstack 1 | head -50

# 查看JVM系统属性
docker-compose exec backend jinfo 1
```

---

## 4. 数据库监控

### 4.1 PostgreSQL内置监控

#### 数据库连接监控

```sql
-- 查看活跃连接
SELECT
    datname as database_name,
    usename as username,
    client_addr as client_ip,
    state,
    query_start,
    state_change
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY query_start;

-- 查看连接统计
SELECT
    state,
    count(*) as connections
FROM pg_stat_activity
GROUP BY state;
```

#### 查询性能监控

```sql
-- 查看慢查询（需要启用pg_stat_statements）
SELECT
    query,
    calls,
    total_time/calls as avg_time,
    rows,
    shared_blks_hit,
    shared_blks_read
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- 查看表大小和索引使用
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### 数据库健康检查脚本

```bash
#!/bin/bash
# db-monitor.sh

echo "=== 数据库监控报告 $(date) ==="

# 连接数监控
ACTIVE_CONNECTIONS=$(docker-compose exec postgres psql -U postgres -d fitness_gym -t -c "
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';")

IDLE_CONNECTIONS=$(docker-compose exec postgres psql -U postgres -d fitness_gym -t -c "
SELECT count(*) FROM pg_stat_activity WHERE state = 'idle';")

echo "活跃连接数: $ACTIVE_CONNECTIONS"
echo "空闲连接数: $IDLE_CONNECTIONS"

# 数据库大小监控
DB_SIZE=$(docker-compose exec postgres psql -U postgres -d fitness_gym -t -c "
SELECT pg_size_pretty(pg_database_size('fitness_gym'));")

echo "数据库大小: $DB_SIZE"

# 表大小监控
LARGEST_TABLES=$(docker-compose exec postgres psql -U postgres -d fitness_gym -c "
SELECT
    schemaname||'.'||tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 5;")

echo "最大表大小:"
echo "$LARGEST_TABLES"

echo "数据库监控完成"
```

### 4.2 数据库性能指标

#### 关键性能指标

| 指标 | 说明 | 监控阈值 |
|------|------|-----------|
| 连接数 | 活跃数据库连接 | < 最大连接数80% |
| 查询响应时间 | SQL执行时间 | < 1000ms |
| 缓存命中率 | 共享缓冲区命中率 | > 95% |
| 锁等待 | 锁竞争情况 | < 5% |
| 死锁 | 死锁发生次数 | = 0 |

#### 性能监控查询

```sql
-- 缓存命中率
SELECT
    sum(blks_hit) * 100 / (sum(blks_hit) + sum(blks_read)) as cache_hit_ratio
FROM pg_stat_database
WHERE datname = 'fitness_gym';

-- 锁等待统计
SELECT
    locktype,
    mode,
    count(*) as count
FROM pg_locks
GROUP BY locktype, mode
ORDER BY count DESC;

-- 索引使用统计
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC
LIMIT 10;
```

---

## 5. 应用性能监控

### 5.1 HTTP请求监控

#### Spring Boot指标

```yaml
# application-prod.yml
management:
  metrics:
    enable:
      http: true
  web:
    server:
      request:
        autotime:
          enabled: true
          percentiles: 0.5,0.95,0.99
```

#### HTTP性能指标

| 指标 | 说明 | 正常范围 |
|------|------|----------|
| `http.server.requests` | HTTP请求统计 | - |
| `http.server.requests.duration` | 请求响应时间 | P95 < 2000ms |
| `http.server.requests.count` | 请求数量 | 根据业务负载 |
| `http.server.requests.error` | 错误请求数 | < 5% |

### 5.2 业务指标监控

#### 自定义业务指标

```java
@Service
public class MetricsService {

    private final MeterRegistry meterRegistry;

    public MetricsService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public void recordUserLogin(String username, boolean success) {
        Counter.builder("user.login")
            .tag("username", username)
            .tag("success", String.valueOf(success))
            .register(meterRegistry)
            .increment();
    }

    public void recordApiCall(String endpoint, long duration, boolean success) {
        Timer.builder("api.call")
            .tag("endpoint", endpoint)
            .tag("success", String.valueOf(success))
            .register(meterRegistry)
            .record(duration, TimeUnit.MILLISECONDS);
    }

    public void recordBusinessOperation(String operation, String result) {
        Counter.builder("business.operation")
            .tag("operation", operation)
            .tag("result", result)
            .register(meterRegistry)
            .increment();
    }
}
```

#### 业务指标示例

```java
// 在业务代码中使用
@Autowired
private MetricsService metricsService;

public User login(String username, String password) {
    long startTime = System.currentTimeMillis();

    try {
        User user = userService.authenticate(username, password);
        metricsService.recordUserLogin(username, true);
        metricsService.recordApiCall("/api/login", System.currentTimeMillis() - startTime, true);
        return user;
    } catch (Exception e) {
        metricsService.recordUserLogin(username, false);
        metricsService.recordApiCall("/api/login", System.currentTimeMillis() - startTime, false);
        throw e;
    }
}
```

---

## 6. 告警配置

### 6.1 告警级别定义

| 级别 | 说明 | 响应时间 | 通知方式 |
|------|------|----------|----------|
| **Critical** | 严重故障，系统不可用 | 立即响应 | 电话 + 短信 + 邮件 |
| **Warning** | 警告，性能下降或潜在问题 | 30分钟内 | 邮件 + 企业微信 |
| **Info** | 信息，提供状态信息 | 工作时间内 | 邮件 |

### 6.2 告警规则配置

#### 系统告警规则

```bash
#!/bin/bash
# alert-monitor.sh

# 配置
ALERT_EMAIL="admin@example.com,ops@example.com"
SLACK_WEBHOOK="https://hooks.slack.com/services/xxx/xxx/xxx"

# 阈值设置
CPU_CRITICAL=90
CPU_WARNING=75
MEM_CRITICAL=95
MEM_WARNING=85
DISK_CRITICAL=95
DISK_WARNING=85
ERROR_RATE_CRITICAL=10
ERROR_RATE_WARNING=5

echo "=== 告警监控 $(date) ==="

# CPU告警
CPU_USAGE=$(docker stats --no-stream --format "{{.CPUPerc}}" fitness_gym_backend | sed 's/%//')
if (( $(echo "$CPU_USAGE >= $CPU_CRITICAL" | bc -l) )); then
    send_alert "CRITICAL" "CPU使用率过高: $CPU_USAGE%" "系统性能严重下降，请立即处理"
elif (( $(echo "$CPU_USAGE >= $CPU_WARNING" | bc -l) )); then
    send_alert "WARNING" "CPU使用率较高: $CPU_USAGE%" "请关注系统性能"
fi

# 内存告警
MEM_USAGE=$(docker stats --no-stream --format "{{.MemPerc}}" fitness_gym_backend | sed 's/%//')
if (( $(echo "$MEM_USAGE >= $MEM_CRITICAL" | bc -l) )); then
    send_alert "CRITICAL" "内存使用率过高: $MEM_USAGE%" "系统可能即将崩溃，请立即处理"
elif (( $(echo "$MEM_USAGE >= $MEM_WARNING" | bc -l) )); then
    send_alert "WARNING" "内存使用率较高: $MEM_USAGE%" "请关注内存使用情况"
fi

# 磁盘告警
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if (( DISK_USAGE >= DISK_CRITICAL )); then
    send_alert "CRITICAL" "磁盘使用率过高: $DISK_USAGE%" "磁盘空间不足，可能导致服务不可用"
elif (( DISK_USAGE >= DISK_WARNING )); then
    send_alert "WARNING" "磁盘使用率较高: $DISK_WARNING%" "请及时清理磁盘空间"
fi

# 错误率告警
ERROR_COUNT=$(docker-compose logs --since "1h" backend | grep -c "ERROR")
REQUEST_COUNT=$(docker-compose logs --since "1h" backend | grep -c "HTTP")
if [ $REQUEST_COUNT -gt 0 ]; then
    ERROR_RATE=$((ERROR_COUNT * 100 / REQUEST_COUNT))
    if [ $ERROR_RATE -ge $ERROR_RATE_CRITICAL ]; then
        send_alert "CRITICAL" "错误率过高: $ERROR_RATE%" "系统出现严重错误，请立即调查"
    elif [ $ERROR_RATE -ge $ERROR_RATE_WARNING ]; then
        send_alert "WARNING" "错误率较高: $ERROR_RATE%" "请检查系统错误情况"
    fi
fi

echo "告警监控完成"
```

#### 告警发送函数

```bash
#!/bin/bash
# alert-functions.sh

send_alert() {
    local level=$1
    local subject=$2
    local message=$3

    # 邮件告警
    echo "级别: $level
时间: $(date)
主题: $subject
详情: $message

服务器: $(hostname)
项目: 健身房管理系统" | mail -s "[$level] $subject" $ALERT_EMAIL

    # Slack告警
    curl -X POST -H 'Content-type: application/json' \
        --data "{
            \"text\": \"*[$level]* $subject\",
            \"attachments\": [{
                \"text\": \"$message\",
                \"fields\": [
                    {\"title\": \"时间\", \"value\": \"$(date)\", \"short\": true},
                    {\"title\": \"服务器\", \"value\": \"$(hostname)\", \"short\": true}
                ]
            }]
        }" $SLACK_WEBHOOK
}

# 健康检查告警
check_service_health() {
    local service=$1
    local endpoint=$2
    local service_name=$3

    if ! curl -f -s "$endpoint" >/dev/null 2>&1; then
        send_alert "CRITICAL" "$service_name 服务异常" "$service_name ($service) 健康检查失败，请立即检查"
    fi
}
```

### 6.3 告警升级策略

#### 告警升级流程

1. **初始告警** (0分钟)
   - 发送邮件和企业微信通知
   - 记录告警日志

2. **首次升级** (15分钟后仍未解决)
   - 电话通知负责人
   - 升级到更高优先级

3. **二次升级** (60分钟后仍未解决)
   - 短信通知所有相关人员
   - 启动应急响应流程

4. **最高级别** (120分钟后仍未解决)
   - 通知管理层
   - 考虑服务降级或切换

#### 告警抑制规则

```bash
# 避免告警风暴 - 相同告警5分钟内不重复发送
ALERT_CACHE_FILE="/tmp/alert_cache.txt"

send_alert_with_suppression() {
    local alert_key=$1
    local level=$2
    local subject=$3
    local message=$4

    local cache_entry="$alert_key:$(date +%s)"
    local last_alert=$(grep "^$alert_key:" $ALERT_CACHE_FILE 2>/dev/null | tail -1 | cut -d: -f2)

    if [ -n "$last_alert" ]; then
        local time_diff=$(( $(date +%s) - last_alert ))
        if [ $time_diff -lt 300 ]; then  # 5分钟内
            echo "告警抑制: $subject (距离上次告警 ${time_diff}秒)"
            return
        fi
    fi

    send_alert "$level" "$subject" "$message"
    echo "$cache_entry" >> $ALERT_CACHE_FILE

    # 清理过期缓存（保留24小时）
    awk -F: '$2 > '$(date +%s)' - 86400' $ALERT_CACHE_FILE > ${ALERT_CACHE_FILE}.tmp
    mv ${ALERT_CACHE_FILE}.tmp $ALERT_CACHE_FILE
}
```

---

## 7. 监控面板

### 7.1 Grafana + Prometheus监控栈

#### Prometheus配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'spring-boot'
    static_configs:
      - targets: ['backend:8080']
    metrics_path: '/actuator/prometheus'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:9187']  # 需要postgres_exporter

  - job_name: 'docker'
    static_configs:
      - targets: ['docker-exporter:9323']
```

#### Grafana仪表板

推荐的仪表板包括：

1. **系统概览面板**
   - CPU使用率趋势
   - 内存使用率趋势
   - 磁盘使用率趋势
   - 网络流量

2. **应用性能面板**
   - HTTP请求响应时间
   - 错误率统计
   - JVM内存使用
   - 活跃线程数

3. **数据库性能面板**
   - 连接数统计
   - 查询响应时间
   - 缓存命中率
   - 表大小统计

4. **业务指标面板**
   - 用户活跃度
   - API调用统计
   - 业务完成率

### 7.2 自定义监控面板

#### 简单的Web监控页面

```html
<!DOCTYPE html>
<html>
<head>
    <title>健身房管理系统监控</title>
    <style>
        .metric { margin: 10px; padding: 10px; border: 1px solid #ccc; }
        .healthy { background-color: #d4edda; }
        .warning { background-color: #fff3cd; }
        .critical { background-color: #f8d7da; }
    </style>
</head>
<body>
    <h1>健身房管理系统监控面板</h1>

    <div id="metrics"></div>

    <script>
        async function updateMetrics() {
            try {
                const response = await fetch('/api/metrics');
                const metrics = await response.json();

                const container = document.getElementById('metrics');
                container.innerHTML = '';

                metrics.forEach(metric => {
                    const div = document.createElement('div');
                    div.className = `metric ${metric.status}`;
                    div.innerHTML = `
                        <h3>${metric.name}</h3>
                        <p>值: ${metric.value}</p>
                        <p>状态: ${metric.status}</p>
                        <p>时间: ${new Date(metric.timestamp).toLocaleString()}</p>
                    `;
                    container.appendChild(div);
                });
            } catch (error) {
                console.error('获取监控数据失败:', error);
            }
        }

        // 每30秒更新一次
        updateMetrics();
        setInterval(updateMetrics, 30000);
    </script>
</body>
</html>
```

---

## 8. 最佳实践

### 8.1 监控策略最佳实践

- **分层监控**：基础设施、系统、应用、业务层层监控
- **关键指标优先**：重点监控对用户体验影响最大的指标
- **适当告警**：避免告警疲劳，设置合理的告警阈值
- **数据保留**：根据需要设置不同的数据保留策略

### 8.2 告警管理最佳实践

- **告警分级**：根据严重程度设置不同的响应流程
- **告警抑制**：避免相同告警的重复发送
- **告警升级**：长时间未解决的告警自动升级
- **告警验证**：定期验证告警规则的有效性

### 8.3 监控维护最佳实践

- **定期审查**：定期审查监控指标和告警规则
- **性能影响**：监控系统本身不应影响被监控系统
- **自动化部署**：监控配置应随应用一同部署
- **文档更新**：及时更新监控和告警文档

---

## 相关文档

- [运维操作指南](DEPLOYMENT_OPERATIONS.md) - 日常运维操作流程
- [日志管理指南](LOGGING.md) - 日志配置和分析
- [性能调优指南](PERFORMANCE_TUNING.md) - 系统性能优化
- [故障排查指南](TROUBLESHOOTING.md) - 问题诊断和解决
