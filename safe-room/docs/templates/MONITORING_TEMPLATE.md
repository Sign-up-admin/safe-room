---
title: [系统名称]监控告警指南
version: v1.0.0
last_updated: 2025-11-16
category: technical
status: active
tags: [monitoring, alerting, prometheus, grafana]
---

# [系统名称]监控告警指南

> **版本**：v1.0.0
> **更新日期**：2025-11-16
> **适用范围**：[系统名称]监控和告警配置
> **关键词**：监控, 告警, Prometheus, Grafana, 指标

---

## 📋 目录

- [监控概述](#监控概述)
- [监控架构](#监控架构)
- [指标收集](#指标收集)
- [可视化配置](#可视化配置)
- [告警规则](#告警规则)
- [告警处理](#告警处理)
- [监控最佳实践](#监控最佳实践)
- [故障排查](#故障排查)

---

## 监控概述

### 1.1 监控目标

[系统名称]监控系统旨在实现以下目标：

- **实时监控**: 系统运行状态的实时监控和预警
- **性能分析**: 关键性能指标的收集和分析
- **故障诊断**: 快速定位和诊断系统故障
- **容量规划**: 基于监控数据进行容量规划
- **业务洞察**: 业务指标监控和趋势分析

### 1.2 监控范围

#### 系统监控

- **基础设施**: CPU、内存、磁盘、网络
- **操作系统**: 系统负载、进程状态、日志
- **网络设备**: 交换机、路由器、防火墙

#### 应用监控

- **应用性能**: 响应时间、吞吐量、错误率
- **业务指标**: 用户访问、订单量、转化率
- **服务状态**: 服务可用性、健康检查
- **依赖服务**: 数据库、缓存、消息队列

#### 安全监控

- **访问控制**: 异常登录、权限变更
- **网络安全**: 入侵检测、流量异常
- **数据安全**: 敏感数据访问、泄露检测

### 1.3 监控分层

```
第4层: 业务监控
├── 用户体验监控
├── 业务指标监控
└── SLA监控

第3层: 应用监控
├── API监控
├── 服务监控
├── 数据库监控
└── 缓存监控

第2层: 系统监控
├── 服务器监控
├── 网络监控
└── 存储监控

第1层: 基础设施监控
├── 硬件监控
├── 虚拟化监控
└── 云资源监控
```

---

## 监控架构

### 2.1 技术栈

#### 核心组件

| 组件 | 版本 | 功能 | 端口 |
|------|------|------|------|
| Prometheus | 2.45+ | 指标收集和存储 | 9090 |
| Alertmanager | 0.26+ | 告警管理 | 9093 |
| Grafana | 10.0+ | 可视化仪表板 | 3000 |
| Node Exporter | 1.7+ | 系统指标收集 | 9100 |
| cAdvisor | 0.47+ | 容器指标收集 | 8080 |
| Blackbox Exporter | 0.24+ | 网络探测 | 9115 |

#### 辅助工具

- **Pushgateway**: 批处理作业指标推送
- **Alertmanager Webhook**: 自定义告警通知
- **Grafana Loki**: 日志聚合
- **VictoriaMetrics**: 长期指标存储

### 2.2 架构图

```mermaid
graph TB
    subgraph "监控目标"
        A[应用服务器]
        B[数据库服务器]
        C[缓存服务器]
        D[前端应用]
    end

    subgraph "指标收集器"
        E[Node Exporter]
        F[Java应用指标]
        G[PostgreSQL Exporter]
        H[Redis Exporter]
    end

    subgraph "监控平台"
        I[Prometheus]
        J[Alertmanager]
        K[Grafana]
    end

    subgraph "通知渠道"
        L[邮件]
        M[短信]
        N[IM工具]
        O[电话]
    end

    A --> E
    A --> F
    B --> G
    C --> H

    E --> I
    F --> I
    G --> I
    H --> I

    I --> J
    J --> L
    J --> M
    J --> N
    J --> O

    I --> K
```

### 2.3 数据流

1. **指标收集**: Exporter从监控目标收集指标
2. **数据存储**: Prometheus存储时间序列数据
3. **规则评估**: 根据告警规则评估指标
4. **告警触发**: 触发告警发送到Alertmanager
5. **告警处理**: Alertmanager路由和发送通知
6. **可视化**: Grafana查询Prometheus数据展示

---

## 指标收集

### 3.1 系统指标

#### Node Exporter配置

```yaml
# docker-compose.yml
node-exporter:
  image: prom/node-exporter:latest
  container_name: node-exporter
  restart: unless-stopped
  ports:
    - "9100:9100"
  volumes:
    - /proc:/host/proc:ro
    - /sys:/host/sys:ro
    - /:/rootfs:ro
  command:
    - '--path.procfs=/host/proc'
    - '--path.rootfs=/rootfs'
    - '--path.sysfs=/host/sys'
    - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
```

#### Prometheus抓取配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: ${1}:9100

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: ${1}:8080
```

#### 关键系统指标

```prometheus
# CPU使用率
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 内存使用率
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# 磁盘使用率
(1 - node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100

# 网络流量
irate(node_network_receive_bytes_total[5m])
irate(node_network_transmit_bytes_total[5m])
```

### 3.2 应用指标

#### Spring Boot Actuator配置

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
    metrics:
      enabled: true
  metrics:
    export:
      prometheus:
        enabled: true
  health:
    diskspace:
      enabled: true
    db:
      enabled: true
    redis:
      enabled: true
```

#### JVM指标

```prometheus
# JVM堆内存使用率
(jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100

# GC次数
increase(jvm_gc_collection_seconds_count[5m])

# 线程数
jvm_threads_live_threads

# HTTP请求数
increase(http_server_requests_seconds_count[5m])
```

#### 业务指标

```java
// 自定义业务指标
@RestController
public class MetricsController {

    @Autowired
    private MeterRegistry meterRegistry;

    @PostMapping("/api/orders")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        // 业务逻辑...

        // 记录订单创建数
        meterRegistry.counter("orders_created_total").increment();

        // 记录订单金额
        meterRegistry.counter("orders_amount_total")
            .increment(request.getAmount().doubleValue());

        return ResponseEntity.ok(order);
    }
}
```

### 3.3 数据库指标

#### PostgreSQL Exporter

```yaml
# docker-compose.yml
postgres-exporter:
  image: prometheuscommunity/postgres-exporter:latest
  container_name: postgres-exporter
  restart: unless-stopped
  environment:
    DATA_SOURCE_NAME: postgresql://postgres:password@postgres:5432/fitness_gym?sslmode=disable
  ports:
    - "9187:9187"
```

#### 关键数据库指标

```prometheus
# 连接数
pg_stat_activity_count

# 慢查询
increase(pg_stat_statements_total_time{query=~".*"}[5m]) / increase(pg_stat_statements_calls[5m])

# 缓存命中率
pg_stat_database_blks_hit / (pg_stat_database_blks_hit + pg_stat_database_blks_read) * 100

# 表大小
pg_total_relation_size
```

### 3.4 缓存指标

#### Redis Exporter

```yaml
# docker-compose.yml
redis-exporter:
  image: oliver006/redis_exporter:latest
  container_name: redis-exporter
  restart: unless-stopped
  environment:
    REDIS_ADDR: redis://redis:6379
    REDIS_PASSWORD: password
  ports:
    - "9121:9121"
```

#### 关键缓存指标

```prometheus
# 内存使用率
redis_memory_used_bytes / redis_memory_max_bytes * 100

# 连接数
redis_connected_clients

# 命中率
redis_keyspace_hits_total / (redis_keyspace_hits_total + redis_keyspace_misses_total) * 100

# 操作数
increase(redis_commands_total[5m])
```

---

## 可视化配置

### 4.1 Grafana安装

#### Docker部署

```yaml
# docker-compose.yml
grafana:
  image: grafana/grafana:latest
  container_name: grafana
  restart: unless-stopped
  environment:
    GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD}
    GF_USERS_ALLOW_SIGN_UP: false
  ports:
    - "3000:3000"
  volumes:
    - grafana_data:/var/lib/grafana
    - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
```

#### 数据源配置

```yaml
# provisioning/datasources/prometheus.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

### 4.2 仪表板配置

#### 系统监控仪表板

```json
{
  "dashboard": {
    "title": "[系统名称]系统监控",
    "tags": ["system", "monitoring"],
    "timezone": "Asia/Shanghai",
    "panels": [
      {
        "title": "CPU使用率",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by (instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{instance}}"
          }
        ]
      },
      {
        "title": "内存使用率",
        "type": "graph",
        "targets": [
          {
            "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
            "legendFormat": "{{instance}}"
          }
        ]
      }
    ]
  }
}
```

#### 应用监控仪表板

```json
{
  "dashboard": {
    "title": "[系统名称]应用监控",
    "tags": ["application", "monitoring"],
    "panels": [
      {
        "title": "HTTP请求响应时间",
        "type": "graph",
        "targets": [
          {
            "expr": "http_server_requests_seconds{quantile=\"0.95\"}",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "错误率",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_server_requests_seconds_count{status=~\"5..\"}[5m]) / rate(http_server_requests_seconds_count[5m]) * 100",
            "legendFormat": "Error rate"
          }
        ]
      }
    ]
  }
}
```

### 4.3 自定义面板

#### 业务指标面板

```json
{
  "title": "业务指标总览",
  "type": "stat",
  "targets": [
    {
      "expr": "sum(rate(orders_created_total[5m]))",
      "legendFormat": "订单创建数"
    },
    {
      "expr": "sum(rate(user_registrations_total[5m]))",
      "legendFormat": "用户注册数"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "reqps",
      "color": {
        "mode": "thresholds"
      },
      "thresholds": {
        "mode": "absolute",
        "steps": [
          { "color": "green", "value": null },
          { "color": "red", "value": 80 }
        ]
      }
    }
  }
}
```

---

## 告警规则

### 5.1 告警分级

#### 告警级别定义

| 级别 | 描述 | 响应时间 | 通知方式 | 升级条件 |
|------|------|----------|----------|----------|
| 🔴 Critical | 严重故障，系统不可用 | 5分钟 | 电话+短信+IM | 立即 |
| 🟠 Major | 主要功能受影响 | 15分钟 | 短信+IM | 30分钟未解决 |
| 🟡 Minor | 次要功能异常 | 30分钟 | IM+邮件 | 2小时未解决 |
| 🔵 Info | 信息提示，无影响 | - | 邮件 | - |

#### 告警持续时间

- **Critical**: 立即告警，无延迟
- **Major**: 持续5分钟后告警
- **Minor**: 持续15分钟后告警
- **Info**: 立即告警或定时报告

### 5.2 告警规则配置

#### 系统告警规则

```yaml
# alerting_rules.yml
groups:
  - name: system-alerts
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
          team: infrastructure
        annotations:
          summary: "CPU使用率过高 (instance: {{ $labels.instance }})"
          description: "CPU使用率已超过80%持续5分钟，当前值: {{ $value }}%"
          runbook_url: "https://docs.example.com/runbooks/cpu-high-usage"

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
        for: 5m
        labels:
          severity: critical
          team: infrastructure
        annotations:
          summary: "内存使用率过高 (instance: {{ $labels.instance }})"
          description: "内存使用率已超过90%持续5分钟，当前值: {{ $value }}%"
```

#### 应用告警规则

```yaml
  - name: application-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_server_requests_seconds_count{status=~"[45].."}[5m]) / rate(http_server_requests_seconds_count[5m]) * 100 > 5
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "API错误率过高"
          description: "HTTP错误率超过5%持续5分钟，当前值: {{ $value }}%"

      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m])) > 5
        for: 5m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "响应时间过慢"
          description: "95分位响应时间超过5秒，当前值: {{ $value }}s"
```

#### 数据库告警规则

```yaml
  - name: database-alerts
    rules:
      - alert: HighConnectionCount
        expr: pg_stat_activity_count > 80
        for: 5m
        labels:
          severity: warning
          team: database
        annotations:
          summary: "数据库连接数过高"
          description: "数据库连接数超过80，当前值: {{ $value }}"

      - alert: SlowQueryDetected
        expr: increase(pg_stat_statements_total_time[5m]) / increase(pg_stat_statements_calls[5m]) > 1000
        for: 5m
        labels:
          severity: info
          team: database
        annotations:
          summary: "检测到慢查询"
          description: "平均查询时间超过1秒"
```

### 5.3 告警抑制

#### 抑制规则配置

```yaml
# alertmanager.yml
inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']

  - source_match:
      alertname: 'ServiceDown'
    target_match_re:
      alertname: '.*'
    equal: ['instance']
```

---

## 告警处理

### 6.1 告警接收

#### Alertmanager配置

```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alerts@example.com'
  smtp_auth_username: 'alerts@example.com'
  smtp_auth_password: 'password'

route:
  group_by: ['alertname', 'instance', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical'
    - match:
        team: database
      receiver: 'database-team'

receivers:
  - name: 'default'
    email_configs:
      - to: 'devops@example.com'
        subject: '[{{ .GroupLabels.alertname }}] {{ .Annotations.summary }}'

  - name: 'critical'
    email_configs:
      - to: 'devops@example.com'
    webhook_configs:
      - url: 'http://webhook.example.com/alert'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'

  - name: 'database-team'
    email_configs:
      - to: 'dba@example.com'
```

#### 通知渠道

- **邮件**: 所有告警的基础通知方式
- **短信**: Critical和Major级别告警
- **IM工具**: 团队协作平台集成
- **电话**: Critical级别告警升级
- **Webhook**: 自定义集成

### 6.2 告警响应流程

```mermaid
graph TD
    A[接收告警] --> B{评估严重程度}
    B -->|Critical| C[立即响应 <5min]
    B -->|Major| D[快速响应 <15min]
    B -->|Minor| E[正常响应 <30min]
    B -->|Info| F[记录处理]

    C --> G[确认影响范围]
    D --> G
    E --> G

    G --> H[通知相关团队]
    H --> I[启动故障排查]
    I --> J{是否能快速解决}
    J -->|是| K[执行修复]
    J -->|否| L[升级处理级别]

    K --> M[验证修复效果]
    M --> N{问题解决?}
    N -->|是| O[关闭告警]
    N -->|否| P[继续排查]

    L --> Q[寻求专家帮助]
    Q --> R[制定详细方案]
    R --> K

    O --> S[撰写事件报告]
    S --> T[复盘改进]
```

### 6.3 告警管理

#### 告警抑制

```bash
# 临时抑制告警
amtool silence add alertname=HighCPUUsage instance=server01 --duration=1h --comment="计划维护"

# 查看抑制规则
amtool silence query

# 取消抑制
amtool silence expire <silence-id>
```

#### 告警维护

```bash
# 查看活跃告警
amtool alert query

# 查看告警历史
amtool alert query --state=all --limit=50

# 手动触发告警测试
curl -XPOST http://alertmanager:9093/api/v1/alerts \
  -H 'Content-Type: application/json' \
  -d '[{"labels":{"alertname":"TestAlert","severity":"info"},"annotations":{"summary":"测试告警"}}]'
```

---

## 监控最佳实践

### 7.1 指标设计原则

#### RED方法论

- **Rate**: 请求速率 (requests per second)
- **Error**: 错误率 (error rate)
- **Duration**: 请求持续时间 (response time)

#### USE方法论

- **Utilization**: 资源利用率
- **Saturation**: 资源饱和度
- **Errors**: 错误数量

#### 指标层次

1. **业务指标**: 用户体验、业务目标
2. **应用指标**: 性能、可用性、正确性
3. **系统指标**: 资源使用、饱和度
4. **基础设施指标**: 硬件、网络状态

### 7.2 告警设计原则

#### 告警规则设计

1. **避免噪音**: 只告警真正需要关注的问题
2. **分层告警**: Critical → Major → Minor → Info
3. **设置阈值**: 基于历史数据和业务需求
4. **告警收敛**: 避免告警风暴
5. **告警升级**: 未解决的告警自动升级

#### 告警响应时间

- **Critical**: 5分钟内响应，1小时内解决
- **Major**: 15分钟内响应，4小时内解决
- **Minor**: 30分钟内响应，24小时内解决
- **Info**: 按需处理，无严格时间要求

### 7.3 仪表板设计

#### 仪表板布局

```
┌─────────────────────────────────────┐
│           总体状态概览               │
├─────────────────┬───────────────────┤
│   关键指标       │   趋势图          │
├─────────────────┴───────────────────┤
│           详细指标图表               │
├─────────────────────────────────────┤
│           告警和日志                │
└─────────────────────────────────────┘
```

#### 图表类型选择

- **Gauge**: 瞬时值 (CPU使用率、内存使用率)
- **Graph**: 时间序列 (请求数、响应时间)
- **Table**: 详细数据 (Top N、状态列表)
- **Stat**: 单一数值 (总数、平均值)
- **Heatmap**: 分布情况 (响应时间分布)

### 7.4 容量规划

#### 基于监控数据的容量规划

```python
# 容量规划计算
def calculate_capacity(current_load, target_threshold=0.8):
    """
    基于当前负载计算容量需求
    """
    if current_load > target_threshold:
        growth_rate = (current_load - target_threshold) / target_threshold
        recommended_capacity = current_load / target_threshold
        return {
            'expansion_needed': True,
            'growth_rate': growth_rate,
            'recommended_capacity': recommended_capacity,
            'timeline': 'immediate' if growth_rate > 0.5 else 'planned'
        }
    return {'expansion_needed': False}
```

#### 自动扩缩容

```yaml
# Kubernetes HPA配置
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: [system-name]-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: [system-name]
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 故障排查

### 8.1 监控系统故障

#### Prometheus故障排查

```bash
# 检查Prometheus状态
curl http://prometheus:9090/-/healthy
curl http://prometheus:9090/-/ready

# 查看Prometheus日志
docker-compose logs prometheus

# 检查配置语法
promtool check config prometheus.yml

# 检查指标收集状态
curl http://prometheus:9090/api/v1/targets
```

#### Grafana故障排查

```bash
# 检查Grafana状态
curl http://grafana:3000/api/health

# 查看Grafana日志
docker-compose logs grafana

# 重置管理员密码
docker-compose exec grafana grafana-cli admin reset-admin-password newpassword
```

### 8.2 告警系统故障

#### Alertmanager故障排查

```bash
# 检查Alertmanager状态
curl http://alertmanager:9093/-/healthy
curl http://alertmanager:9093/-/ready

# 查看活跃告警
curl http://alertmanager:9093/api/v1/alerts

# 查看告警组
curl http://alertmanager:9093/api/v1/alerts/groups

# 测试邮件配置
amtool check-config alertmanager.yml
```

### 8.3 性能问题诊断

#### 高CPU使用率诊断

```bash
# 查看系统负载
uptime
top -b -n1 | head -20

# 查看Prometheus指标
curl "http://prometheus:9090/api/v1/query?query=100%20-%20(avg%20by%20(instance)%20(irate(node_cpu_seconds_total%7Bmode%3D%22idle%22%7D%5B5m%5D))%20*%20100)"

# 分析进程
ps aux --sort=-%cpu | head -10

# 生成火焰图 (需要perf工具)
perf record -F 99 -p $(pgrep java) -g -- sleep 30
perf script | stackcollapse-perf.pl | flamegraph.pl > flamegraph.svg
```

#### 内存问题诊断

```bash
# 查看内存使用
free -h
vmstat 1 10

# 查看进程内存
ps aux --sort=-%mem | head -10

# JVM堆分析
jmap -heap $(pgrep java)
jmap -histo:live $(pgrep java) > heap_histo.txt

# 生成堆转储
jmap -dump:live,file=heap_dump.hprof $(pgrep java)
```

---

## 更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|----------|--------|
| 2025-11-16 | v1.0.0 | 初始版本 | [作者] |

---

> 💡 **提示**: 监控告警系统是系统稳定运行的重要保障。建议定期审查监控指标和告警规则，确保其有效性和准确性。
