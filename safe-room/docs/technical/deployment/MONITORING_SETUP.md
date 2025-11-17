---
title: MONITORING SETUP
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---
# 监控系统设置指南

> **版本**: v1.0
> **最后更新**: 2025-11-16
> **维护者**: 运维团队

## 概述

本指南详细介绍健身房管理系统监控系统的完整设置过程，包括 Prometheus、Grafana、Alertmanager 以及相关监控脚本的配置和部署。

## 目录

- [1. 监控架构](#1-监控架构)
- [2. Prometheus 设置](#2-prometheus-设置)
- [3. Grafana 配置](#3-grafana-配置)
- [4. Alertmanager 配置](#4-alertmanager-配置)
- [5. 监控脚本部署](#5-监控脚本部署)
- [6. 仪表板配置](#6-仪表板配置)
- [7. 告警规则配置](#7-告警规则配置)
- [8. 测试和验证](#8-测试和验证)

---

## 1. 监控架构

### 系统架构图

```mermaid
graph TB
    subgraph "应用层"
        A[API 服务] --> M1[应用指标]
        F[前端服务] --> M2[前端指标]
        A --> L1[应用日志]
        F --> L2[前端日志]
    end

    subgraph "数据层"
        D[(PostgreSQL)] --> M3[数据库指标]
        R[(Redis)] --> M4[缓存指标]
        D --> L3[数据库日志]
    end

    subgraph "基础设施层"
        S[系统] --> M5[系统指标]
        C[Docker 容器] --> M6[容器指标]
    end

    subgraph "监控栈"
        P[Prometheus] --> |收集指标| M1
        P --> |收集指标| M2
        P --> |收集指标| M3
        P --> |收集指标| M4
        P --> |收集指标| M5
        P --> |收集指标| M6

        P --> |触发告警| AM[Alertmanager]

        G[Grafana] --> |查询数据| P
    end

    subgraph "外部集成"
        AM --> |邮件| Email[SMTP]
        AM --> |Slack| Slack
        AM --> |Webhook| Webhook
    end

    subgraph "日志聚合"
        L1 --> ELK[ELK Stack]
        L2 --> ELK
        L3 --> ELK
    end
```

### 组件说明

| 组件 | 功能 | 端口 | 配置文件 |
|------|------|------|----------|
| **Prometheus** | 指标收集和存储 | 9090 | `prometheus.yml` |
| **Grafana** | 可视化仪表板 | 3000 | `grafana/dashboards/` |
| **Alertmanager** | 告警管理 | 9093 | `alertmanager.yml` |
| **Node Exporter** | 系统指标收集 | 9100 | - |
| **cAdvisor** | 容器指标收集 | 8080 | - |
| **PostgreSQL Exporter** | 数据库指标收集 | 9187 | - |

---

## 2. Prometheus 设置

### 2.1 Docker Compose 配置

创建监控专用配置文件：

```yaml
# monitoring/docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:v2.45.0
    container_name: fitness-gym-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:10.1.0
    container_name: fitness-gym-grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
      - ./grafana/dashboards:/var/lib/grafana/dashboards:ro
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-piechart-panel,grafana-worldmap-panel
    restart: unless-stopped
    networks:
      - monitoring

  alertmanager:
    image: prom/alertmanager:v0.26.0
    container_name: fitness-gym-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/config.yml:ro
    command:
      - '--config.file=/etc/alertmanager/config.yml'
      - '--storage.path=/alertmanager'
    restart: unless-stopped
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:v1.6.1
    container_name: fitness-gym-node-exporter
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
    restart: unless-stopped
    networks:
      - monitoring

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.0
    container_name: fitness-gym-cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    devices:
      - /dev/kmsg
    restart: unless-stopped
    networks:
      - monitoring

  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:v0.13.0
    container_name: fitness-gym-postgres-exporter
    ports:
      - "9187:9187"
    environment:
      - DATA_SOURCE_NAME=postgresql://fitness_user:${DB_PASSWORD}@database:5432/fitness_gym?sslmode=disable
    depends_on:
      - database
    restart: unless-stopped
    networks:
      - monitoring
      - fitness-gym

volumes:
  prometheus_data:
  grafana_data:

networks:
  monitoring:
    driver: bridge
  fitness-gym:
    external: true
```

### 2.2 Prometheus 主配置文件

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s      # 采集间隔
  evaluation_interval: 15s  # 规则评估间隔
  scrape_timeout: 10s       # 采集超时时间

rule_files:
  - "alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # Prometheus 自身监控
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
    scrape_interval: 5s
    metrics_path: '/metrics'

  # 健身房 API 服务
  - job_name: 'fitness-gym-api'
    static_configs:
      - targets: ['api:3000']
    scrape_interval: 15s
    metrics_path: '/metrics'
    http_config:
      follow_redirects: true
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'fitness-gym-api'

  # 前端服务监控 (如果有指标端点)
  - job_name: 'fitness-gym-frontend'
    static_configs:
      - targets: ['frontend:80']
    scrape_interval: 30s
    metrics_path: '/metrics'
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'fitness-gym-frontend'

  # Node Exporter - 系统指标
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 15s

  # cAdvisor - 容器指标
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
    scrape_interval: 15s
    metrics_path: '/metrics'

  # PostgreSQL 数据库监控
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']
    scrape_interval: 30s

  # Redis 缓存监控 (如果需要)
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']
    scrape_interval: 30s
```

### 2.3 启动 Prometheus

```bash
# 创建监控目录
mkdir -p monitoring/grafana/{provisioning/datasources,provisioning/dashboards,dashboards}

# 启动监控栈
docker-compose -f monitoring/docker-compose.yml up -d

# 验证服务状态
docker-compose -f monitoring/docker-compose.yml ps

# 查看 Prometheus 日志
docker-compose -f monitoring/docker-compose.yml logs prometheus
```

---

## 3. Grafana 配置

### 3.1 数据源配置

创建数据源配置文件：

```yaml
# monitoring/grafana/provisioning/datasources/prometheus.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

### 3.2 仪表板配置

```yaml
# monitoring/grafana/provisioning/dashboards/dashboard.yml
apiVersion: 1

providers:
  - name: 'fitness-gym-dashboards'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
```

### 3.3 系统监控仪表板

创建系统监控仪表板 JSON：

```json
// monitoring/grafana/dashboards/system-dashboard.json
{
  "dashboard": {
    "title": "系统监控",
    "tags": ["system", "fitness-gym"],
    "timezone": "browser",
    "panels": [
      {
        "title": "CPU 使用率",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{instance}}"
          }
        ],
        "yAxes": [
          {
            "unit": "percent",
            "min": 0,
            "max": 100
          }
        ]
      },
      {
        "title": "内存使用率",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - ((node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100)",
            "legendFormat": "{{instance}}"
          }
        ],
        "yAxes": [
          {
            "unit": "percent",
            "min": 0,
            "max": 100
          }
        ]
      },
      {
        "title": "磁盘使用率",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100",
            "legendFormat": "{{instance}} - {{mountpoint}}"
          }
        ]
      },
      {
        "title": "网络流量",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(node_network_receive_bytes_total[5m])",
            "legendFormat": "{{instance}} - {{device}} RX"
          },
          {
            "expr": "rate(node_network_transmit_bytes_total[5m])",
            "legendFormat": "{{instance}} - {{device}} TX"
          }
        ],
        "yAxes": [
          {
            "unit": "Bps"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

### 3.4 应用监控仪表板

```json
// monitoring/grafana/dashboards/application-dashboard.json
{
  "dashboard": {
    "title": "应用监控",
    "tags": ["application", "fitness-gym"],
    "timezone": "browser",
    "panels": [
      {
        "title": "API 请求率",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "总请求率"
          },
          {
            "expr": "rate(http_requests_total{status=~\"4..\"}[5m])",
            "legendFormat": "4xx 错误"
          },
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx 错误"
          }
        ]
      },
      {
        "title": "API 响应时间",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P95 响应时间"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P50 响应时间"
          }
        ],
        "yAxes": [
          {
            "unit": "s"
          }
        ]
      },
      {
        "title": "数据库连接数",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_activity_count",
            "legendFormat": "活跃连接数"
          }
        ]
      },
      {
        "title": "业务指标",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(fitness_gym_workout_bookings_total[5m])",
            "legendFormat": "课程预订率"
          },
          {
            "expr": "fitness_gym_active_users",
            "legendFormat": "活跃用户数"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

### 3.5 Grafana 初始化

```bash
# 启动 Grafana
docker-compose -f monitoring/docker-compose.yml up -d grafana

# 等待服务启动
sleep 30

# 验证 Grafana 访问
curl -s http://localhost:3000/api/health

# 创建管理员用户 (如果需要)
curl -X PUT -H "Content-Type: application/json" \
  -d '{"oldPassword": "admin", "newPassword": "your-strong-password", "confirmNew": "your-strong-password"}' \
  http://admin:admin@localhost:3000/api/user/password
```

---

## 4. Alertmanager 配置

### 4.1 基础配置

```yaml
# monitoring/alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@fitness-gym.com'
  smtp_auth_username: 'alerts@fitness-gym.com'
  smtp_auth_password: 'your-app-password'

templates:
  - '/etc/alertmanager/templates/*.tmpl'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'team-notifications'
  routes:
    - match:
        severity: critical
      receiver: 'critical-notifications'
      continue: true
    - match:
        severity: warning
      receiver: 'warning-notifications'
      continue: true

receivers:
  - name: 'team-notifications'
    email_configs:
      - to: 'ops@fitness-gym.com'
        send_resolved: true
        headers:
          subject: '[{{ .GroupLabels.alertname }}] {{ .Annotations.summary }}'
        html: |
          <h2>{{ .GroupLabels.alertname }}</h2>
          <p><strong>状态:</strong> {{ .Status }}</p>
          <p><strong>严重程度:</strong> {{ .Labels.severity }}</p>
          <p><strong>描述:</strong> {{ .Annotations.description }}</p>
          <p><strong>开始时间:</strong> {{ .StartsAt.Format "2006-01-02 15:04:05" }}</p>
          {{ if .EndsAt }}
          <p><strong>结束时间:</strong> {{ .EndsAt.Format "2006-01-02 15:04:05" }}</p>
          {{ end }}
          <p><strong>标签:</strong></p>
          <ul>
          {{ range .Labels.SortedPairs }}
            <li>{{ .Name }}: {{ .Value }}</li>
          {{ end }}
          </ul>

  - name: 'critical-notifications'
    email_configs:
      - to: 'critical-alerts@fitness-gym.com'
        send_resolved: true
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#critical-alerts'
        send_resolved: true
        title: '[CRITICAL] {{ .GroupLabels.alertname }}'
        text: |
          *状态:* {{ .Status }}
          *严重程度:* {{ .Labels.severity }}
          *描述:* {{ .Annotations.description }}
          *时间:* {{ .StartsAt.Format "2006-01-02 15:04:05" }}

  - name: 'warning-notifications'
    email_configs:
      - to: 'warnings@fitness-gym.com'
        send_resolved: true
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#warnings'
        send_resolved: true
```

### 4.2 告警模板

创建告警邮件模板：

```html
<!-- monitoring/alertmanager/templates/email.tmpl -->
{{ define "email.default.html" }}
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ .GroupLabels.alertname }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .alert-critical { color: #d9534f; }
        .alert-warning { color: #f0ad4e; }
        .alert-info { color: #5bc0de; }
        .header { background-color: #f8f9fa; padding: 10px; border-radius: 5px; }
        .content { margin: 20px 0; }
        .footer { font-size: 12px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h2 class="alert-{{ .Labels.severity }}">{{ .GroupLabels.alertname }}</h2>
        <p><strong>状态:</strong> {{ .Status }}</p>
        <p><strong>严重程度:</strong> {{ .Labels.severity }}</p>
    </div>

    <div class="content">
        <p><strong>描述:</strong> {{ .Annotations.description }}</p>
        <p><strong>开始时间:</strong> {{ .StartsAt.Format "2006-01-02 15:04:05 UTC" }}</p>
        {{ if .EndsAt }}
        <p><strong>结束时间:</strong> {{ .EndsAt.Format "2006-01-02 15:04:05 UTC" }}</p>
        {{ end }}

        <h3>标签信息</h3>
        <ul>
        {{ range .Labels.SortedPairs }}
            <li><strong>{{ .Name }}:</strong> {{ .Value }}</li>
        {{ end }}
        </ul>

        {{ if .Annotations.runbook_url }}
        <p><strong>运维手册:</strong> <a href="{{ .Annotations.runbook_url }}">{{ .Annotations.runbook_url }}</a></p>
        {{ end }}
    </div>

    <div class="footer">
        <p>此告警由健身房管理系统监控栈生成</p>
        <p>如有问题，请联系运维团队: ops@fitness-gym.com</p>
    </div>
</body>
</html>
{{ end }}
```

---

## 5. 监控脚本部署

### 5.1 健康检查脚本

```bash
#!/bin/bash
# monitoring/scripts/health-check.sh

# 配置
LOG_FILE="/var/log/fitness-gym-health.log"
ADMIN_EMAIL="admin@fitness-gym.com"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

# 日志函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $*" | tee -a "$LOG_FILE"
}

# 发送告警
send_alert() {
    local message="$1"
    local severity="${2:-warning}"

    log "发送告警: $message"

    # 邮件告警
    if [ -n "$ADMIN_EMAIL" ]; then
        echo "$message" | mail -s "健身房系统健康检查告警 - $severity" "$ADMIN_EMAIL"
    fi

    # Slack 告警
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🏥 健康检查告警 [$severity]: $message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
}

# API 健康检查
check_api() {
    log "检查 API 服务..."

    if curl -f -s --max-time 10 --retry 3 --retry-delay 2 \
        http://localhost:3000/health > /dev/null 2>&1; then
        log "✅ API 服务正常"
        return 0
    else
        send_alert "API 服务无响应" "critical"
        return 1
    fi
}

# 数据库健康检查
check_database() {
    log "检查数据库连接..."

    if docker-compose exec -T database pg_isready \
        -U fitness_user -d fitness_gym -h localhost > /dev/null 2>&1; then
        log "✅ 数据库连接正常"
        return 0
    else
        send_alert "数据库连接异常" "critical"
        return 1
    fi
}

# 前端健康检查
check_frontend() {
    log "检查前端服务..."

    if curl -f -s --max-time 10 --retry 3 --retry-delay 2 \
        http://localhost:8080 > /dev/null 2>&1; then
        log "✅ 前端服务正常"
        return 0
    else
        send_alert "前端服务无响应" "warning"
        return 1
    fi
}

# 系统资源检查
check_system_resources() {
    log "检查系统资源..."

    # CPU 使用率
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    CPU_USAGE=${CPU_USAGE%.*}

    if [ "$CPU_USAGE" -gt 90 ]; then
        send_alert "CPU 使用率过高: ${CPU_USAGE}%" "critical"
    elif [ "$CPU_USAGE" -gt 80 ]; then
        send_alert "CPU 使用率较高: ${CPU_USAGE}%" "warning"
    else
        log "✅ CPU 使用率正常: ${CPU_USAGE}%"
    fi

    # 内存使用率
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')

    if [ "$MEMORY_USAGE" -gt 90 ]; then
        send_alert "内存使用率过高: ${MEMORY_USAGE}%" "critical"
    elif [ "$MEMORY_USAGE" -gt 85 ]; then
        send_alert "内存使用率较高: ${MEMORY_USAGE}%" "warning"
    else
        log "✅ 内存使用率正常: ${MEMORY_USAGE}%"
    fi

    # 磁盘使用率
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

    if [ "$DISK_USAGE" -gt 95 ]; then
        send_alert "磁盘使用率过高: ${DISK_USAGE}%" "critical"
    elif [ "$DISK_USAGE" -gt 90 ]; then
        send_alert "磁盘使用率较高: ${DISK_USAGE}%" "warning"
    else
        log "✅ 磁盘使用率正常: ${DISK_USAGE}%"
    fi
}

# 磁盘空间检查
check_disk_space() {
    log "检查磁盘空间..."

    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

    if [ "$DISK_USAGE" -gt 90 ]; then
        # 尝试清理
        log "磁盘空间不足，执行清理..."
        docker system prune -f > /dev/null 2>&1
        find /tmp -type f -mtime +7 -delete 2>/dev/null || true

        # 重新检查
        NEW_DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
        if [ "$NEW_DISK_USAGE" -gt 90 ]; then
            send_alert "磁盘空间仍然不足: ${NEW_DISK_USAGE}%" "critical"
        else
            log "✅ 磁盘清理后空间正常: ${NEW_DISK_USAGE}%"
        fi
    else
        log "✅ 磁盘空间正常: ${DISK_USAGE}%"
    fi
}

# 主函数
main() {
    log "开始健康检查..."

    local failed_checks=0

    check_api || ((failed_checks++))
    check_database || ((failed_checks++))
    check_frontend || ((failed_checks++))
    check_system_resources
    check_disk_space

    if [ $failed_checks -eq 0 ]; then
        log "🎉 所有健康检查通过"
        exit 0
    else
        log "❌ $failed_checks 个检查失败"
        exit 1
    fi
}

# 参数处理
case "${1:-all}" in
    "api") check_api ;;
    "database") check_database ;;
    "frontend") check_frontend ;;
    "system") check_system_resources ;;
    "disk") check_disk_space ;;
    "all") main ;;
    *) echo "用法: $0 [api|database|frontend|system|disk|all]"; exit 1 ;;
esac
```

### 5.2 指标收集脚本

```bash
#!/bin/bash
# monitoring/scripts/metrics-collector.sh

# 输出格式: Prometheus 格式
echo "# HELP fitness_gym_custom_metrics Custom application metrics"
echo "# TYPE fitness_gym_custom_metrics gauge"

# 收集应用指标
collect_app_metrics() {
    # API 响应时间
    API_RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:3000/health 2>/dev/null || echo "0")
    echo "fitness_gym_api_response_time_seconds $API_RESPONSE_TIME"

    # 数据库连接数
    DB_CONNECTIONS=$(docker-compose exec -T database psql -U fitness_user -d fitness_gym -c "SELECT count(*) FROM pg_stat_activity;" -t 2>/dev/null | tr -d ' ' || echo "0")
    echo "fitness_gym_db_connections $DB_CONNECTIONS"

    # 活跃用户数 (示例)
    ACTIVE_USERS=$(docker-compose exec -T database psql -U fitness_user -d fitness_gym -c "SELECT count(*) FROM user_sessions WHERE last_activity > NOW() - INTERVAL '30 minutes';" -t 2>/dev/null | tr -d ' ' || echo "0")
    echo "fitness_gym_active_users $ACTIVE_USERS"

    # 今日预订数
    TODAY_BOOKINGS=$(docker-compose exec -T database psql -U fitness_user -d fitness_gym -c "SELECT count(*) FROM workout_bookings WHERE DATE(created_at) = CURRENT_DATE;" -t 2>/dev/null | tr -d ' ' || echo "0")
    echo "fitness_gym_today_bookings $TODAY_BOOKINGS"

    # 系统负载
    LOAD_1=$(uptime | awk -F'load average:' '{ print $2 }' | cut -d, -f1 | tr -d ' ')
    LOAD_5=$(uptime | awk -F'load average:' '{ print $2 }' | cut -d, -f2 | tr -d ' ')
    LOAD_15=$(uptime | awk -F'load average:' '{ print $2 }' | cut -d, -f3 | tr -d ' ')

    echo "fitness_gym_system_load_1 $LOAD_1"
    echo "fitness_gym_system_load_5 $LOAD_5"
    echo "fitness_gym_system_load_15 $LOAD_15"
}

# 收集系统指标
collect_system_metrics() {
    # 进程数
    PROCESS_COUNT=$(ps aux | wc -l)
    echo "fitness_gym_process_count $PROCESS_COUNT"

    # 网络连接数
    TCP_CONNECTIONS=$(netstat -tun | grep ESTABLISHED | wc -l)
    echo "fitness_gym_tcp_connections $TCP_CONNECTIONS"

    # Docker 容器数
    RUNNING_CONTAINERS=$(docker ps | wc -l)
    RUNNING_CONTAINERS=$((RUNNING_CONTAINERS - 1))  # 减去表头行
    echo "fitness_gym_running_containers $RUNNING_CONTAINERS"
}

# 主函数
main() {
    echo "# 健身房管理系统自定义指标"
    echo "# 收集时间: $(date -Iseconds)"

    case "${1:-app}" in
        "app") collect_app_metrics ;;
        "system") collect_system_metrics ;;
        "all")
            collect_app_metrics
            collect_system_metrics
            ;;
        *) echo "用法: $0 [app|system|all]"; exit 1 ;;
    esac
}

main "$@"
```

### 5.3 告警通知脚本

```bash
#!/bin/bash
# monitoring/scripts/alert-notifier.sh

# 配置
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"
EMAIL_RECIPIENTS="${EMAIL_RECIPIENTS:-admin@fitness-gym.com}"

# 发送 Slack 通知
send_slack_notification() {
    local message="$1"
    local channel="${2:-#alerts}"
    local severity="${3:-info}"

    if [ -z "$SLACK_WEBHOOK_URL" ]; then
        echo "Slack Webhook URL 未配置，跳过 Slack 通知"
        return 1
    fi

    local color
    case "$severity" in
        "critical") color="danger" ;;
        "warning") color="warning" ;;
        "info") color="good" ;;
        *) color="#808080" ;;
    esac

    local payload="{
        \"channel\": \"$channel\",
        \"attachments\": [
            {
                \"color\": \"$color\",
                \"title\": \"健身房系统告警\",
                \"text\": \"$message\",
                \"fields\": [
                    {
                        \"title\": \"严重程度\",
                        \"value\": \"$severity\",
                        \"short\": true
                    },
                    {
                        \"title\": \"时间\",
                        \"value\": \"$(date)\",
                        \"short\": true
                    }
                ],
                \"footer\": \"健身房监控系统\",
                \"ts\": $(date +%s)
            }
        ]
    }"

    curl -X POST -H 'Content-type: application/json' \
        --data "$payload" \
        "$SLACK_WEBHOOK_URL"
}

# 发送 Discord 通知
send_discord_notification() {
    local message="$1"
    local severity="${2:-info}"

    if [ -z "$DISCORD_WEBHOOK_URL" ]; then
        echo "Discord Webhook URL 未配置，跳过 Discord 通知"
        return 1
    fi

    local color
    case "$severity" in
        "critical") color="15158332" ;;  # 红色
        "warning") color="16776960" ;;   # 橙色
        "info") color="5763719" ;;       # 绿色
        *) color="9807270" ;;           # 灰色
    esac

    local payload="{
        \"embeds\": [
            {
                \"title\": \"健身房系统告警\",
                \"description\": \"$message\",
                \"color\": $color,
                \"fields\": [
                    {
                        \"name\": \"严重程度\",
                        \"value\": \"$severity\",
                        \"inline\": true
                    },
                    {
                        \"name\": \"时间\",
                        \"value\": \"$(date)\",
                        \"inline\": true
                    }
                ],
                \"footer\": {
                    \"text\": \"健身房监控系统\"
                },
                \"timestamp\": \"$(date -Iseconds)\"
            }
        ]
    }"

    curl -X POST -H 'Content-type: application/json' \
        --data "$payload" \
        "$DISCORD_WEBHOOK_URL"
}

# 发送邮件通知
send_email_notification() {
    local subject="$1"
    local message="$2"
    local severity="${3:-info}"

    if ! command -v mail &> /dev/null; then
        echo "mail 命令不可用，跳过邮件通知"
        return 1
    fi

    echo "$message" | mail -s "[$severity] $subject" $EMAIL_RECIPIENTS
}

# 主函数
main() {
    local alert_type="$1"
    local message="$2"
    local channel="${3:-all}"
    local severity="${4:-warning}"

    if [ -z "$alert_type" ] || [ -z "$message" ]; then
        echo "用法: $0 <alert_type> <message> [channel] [severity]"
        echo "  alert_type: 告警类型"
        echo "  message: 告警消息"
        echo "  channel: 通知渠道 (slack|discord|email|all), 默认为 all"
        echo "  severity: 严重程度 (critical|warning|info), 默认为 warning"
        exit 1
    fi

    echo "$(date): 发送告警通知 - 类型: $alert_type, 渠道: $channel, 严重程度: $severity"
    echo "消息: $message"

    case "$channel" in
        "slack")
            send_slack_notification "$message" "#alerts" "$severity"
            ;;
        "discord")
            send_discord_notification "$message" "$severity"
            ;;
        "email")
            send_email_notification "$alert_type" "$message" "$severity"
            ;;
        "all"|*)
            send_slack_notification "$message" "#alerts" "$severity"
            send_discord_notification "$message" "$severity"
            send_email_notification "$alert_type" "$message" "$severity"
            ;;
    esac
}

main "$@"
```

---

## 6. 仪表板配置

### 6.1 创建监控目录结构

```bash
# 创建监控配置目录
mkdir -p monitoring/{grafana/{provisioning/{datasources,dashboards},dashboards},scripts}

# 设置权限
chmod +x monitoring/scripts/*.sh
```

### 6.2 仪表板文件组织

```
monitoring/
├── docker-compose.yml          # 监控栈容器编排
├── prometheus.yml              # Prometheus 主配置
├── alerts.yml                  # 告警规则
├── alertmanager.yml            # Alertmanager 配置
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── prometheus.yml   # Grafana 数据源配置
│   │   └── dashboards/
│   │       └── dashboard.yml    # 仪表板配置
│   └── dashboards/
│       ├── system-dashboard.json      # 系统监控仪表板
│       └── application-dashboard.json # 应用监控仪表板
└── scripts/
    ├── health-check.sh          # 健康检查脚本
    ├── metrics-collector.sh     # 指标收集脚本
    └── alert-notifier.sh        # 告警通知脚本
```

---

## 7. 告警规则配置

### 7.1 告警规则文件

```yaml
# monitoring/alerts.yml
groups:
- name: fitness_gym_alerts
  rules:
  # 基础设施告警
  - alert: HighCPUUsage
    expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "CPU 使用率过高"
      description: "CPU 使用率超过 85% (当前值: {{ $value }}%)"
      runbook_url: "https://docs.fitness-gym.com/runbooks/high-cpu-usage"

  - alert: HighMemoryUsage
    expr: 100 - ((node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100) > 90
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "内存使用率过高"
      description: "可用内存不足 10% (当前值: {{ $value }}%)"
      runbook_url: "https://docs.fitness-gym.com/runbooks/high-memory-usage"

  - alert: HighDiskUsage
    expr: (node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100 > 90
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "磁盘使用率过高"
      description: "磁盘使用率超过 90% (当前值: {{ $value }}%)"
      runbook_url: "https://docs.fitness-gym.com/runbooks/high-disk-usage"

  # 应用性能告警
  - alert: APISlowResponse
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "API 响应时间过慢"
      description: "95th percentile 响应时间超过 2 秒 (当前值: {{ $value }}s)"
      runbook_url: "https://docs.fitness-gym.com/runbooks/api-slow-response"

  - alert: APIHighErrorRate
    expr: rate(http_requests_total{status=~"[45].*"}[5m]) / rate(http_requests_total[5m]) * 100 > 5
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "API 错误率过高"
      description: "HTTP 4xx/5xx 错误率超过 5% (当前值: {{ $value }}%)"
      runbook_url: "https://docs.fitness-gym.com/runbooks/api-high-error-rate"

  # 服务可用性告警
  - alert: ServiceDown
    expr: up == 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "服务不可用"
      description: "服务 {{ $labels.job }} 已经宕机超过 2 分钟"
      runbook_url: "https://docs.fitness-gym.com/runbooks/service-down"

  # 数据库告警
  - alert: DatabaseHighConnections
    expr: pg_stat_activity_count > 50
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "数据库连接数过高"
      description: "数据库活跃连接数超过 50 (当前值: {{ $value }})"
      runbook_url: "https://docs.fitness-gym.com/runbooks/database-high-connections"

  - alert: DatabaseSlowQueries
    expr: rate(pg_stat_activity_max_tx_duration{state="active"}[5m]) > 30
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "数据库慢查询"
      description: "存在运行时间超过 30 秒的查询"
      runbook_url: "https://docs.fitness-gym.com/runbooks/database-slow-queries"

  # 业务指标告警
  - alert: LowActiveUsers
    expr: fitness_gym_active_users < 5
    for: 15m
    labels:
      severity: info
    annotations:
      summary: "活跃用户数过低"
      description: "当前活跃用户少于 5 人 (当前值: {{ $value }})"

  - alert: HighBookingRate
    expr: rate(fitness_gym_workout_bookings_total[5m]) > 10
    for: 2m
    labels:
      severity: info
    annotations:
      summary: "预订率激增"
      description: "课程预订率每分钟超过 10 次 (当前值: {{ $value }})"

  # 容器告警
  - alert: ContainerRestarting
    expr: rate(container_last_seen[5m]) > 0
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "容器重启"
      description: "容器 {{ $labels.name }} 在过去 5 分钟内重启"
      runbook_url: "https://docs.fitness-gym.com/runbooks/container-restarting"
```

---

## 8. 测试和验证

### 8.1 启动监控系统

```bash
# 1. 启动监控栈
echo "启动监控系统..."
docker-compose -f monitoring/docker-compose.yml up -d

# 2. 等待服务启动
echo "等待服务启动..."
sleep 30

# 3. 检查服务状态
echo "检查服务状态..."
docker-compose -f monitoring/docker-compose.yml ps

# 4. 验证 Prometheus 配置
echo "验证 Prometheus 配置..."
curl -s http://localhost:9090/-/ready

# 5. 验证 Grafana 访问
echo "验证 Grafana 访问..."
curl -s http://localhost:3000/api/health

# 6. 验证 Alertmanager
echo "验证 Alertmanager..."
curl -s http://localhost:9093/-/ready
```

### 8.2 验证指标收集

```bash
# 1. 检查 Prometheus 目标状态
echo "检查监控目标..."
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health, lastError: .lastError}'

# 2. 查询基本指标
echo "查询系统 CPU 使用率..."
curl -s "http://localhost:9090/api/v1/query?query=100%20-%20(avg%20by(instance)%20(irate(node_cpu_seconds_total%7Bmode%3D%22idle%22%7D%5B5m%5D))%20*%20100)" | jq '.data.result[] | {instance: .metric.instance, value: .value[1]}'

# 3. 测试健康检查脚本
echo "运行健康检查..."
./monitoring/scripts/health-check.sh all

# 4. 测试指标收集
echo "收集自定义指标..."
./monitoring/scripts/metrics-collector.sh all
```

### 8.3 测试告警功能

```bash
# 1. 创建测试告警
echo "创建测试告警..."
curl -X POST http://localhost:9090/-/reload

# 2. 触发测试告警 (临时修改阈值)
echo "触发 CPU 告警测试..."
# 注意: 这只是测试，不要在生产环境中使用

# 3. 检查告警状态
echo "检查活跃告警..."
curl -s http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | select(.state == "firing") | {name: .labels.alertname, severity: .labels.severity, description: .annotations.description}'

# 4. 测试告警通知
echo "测试告警通知..."
./monitoring/scripts/alert-notifier.sh "TestAlert" "这是测试告警消息" "all" "info"
```

### 8.4 性能测试

```bash
# 1. 测试监控系统性能
echo "测试 Prometheus 查询性能..."
time curl -s "http://localhost:9090/api/v1/query_range?query=up&start=$(date -d '1 hour ago' +%s)&end=$(date +%s)&step=60" > /dev/null

# 2. 测试 Grafana 仪表板加载
echo "测试 Grafana 仪表板..."
time curl -s http://localhost:3000/api/dashboards > /dev/null

# 3. 监控资源使用
echo "监控监控系统资源使用..."
docker stats --no-stream monitoring_prometheus_1 monitoring_grafana_1 monitoring_alertmanager_1
```

### 8.5 故障模拟测试

```bash
# 1. 停止 API 服务模拟故障
echo "模拟 API 服务故障..."
docker-compose stop api

# 2. 等待告警触发
echo "等待告警触发..."
sleep 30

# 3. 检查告警
curl -s http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | select(.state == "firing" and .labels.alertname == "ServiceDown")'

# 4. 恢复服务
echo "恢复 API 服务..."
docker-compose start api

# 5. 验证告警恢复
echo "验证告警恢复..."
sleep 30
curl -s http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | select(.state == "firing" and .labels.alertname == "ServiceDown")'
```

### 8.6 配置验证清单

- [ ] Prometheus 配置文件语法正确
- [ ] Alertmanager 配置文件有效
- [ ] Grafana 数据源连接正常
- [ ] 所有监控目标状态为 UP
- [ ] 告警规则加载成功
- [ ] 仪表板可正常访问
- [ ] 健康检查脚本运行正常
- [ ] 告警通知功能正常
- [ ] 备份监控脚本工作正常
- [ ] 日志轮转配置正确

### 8.7 监控系统维护

```bash
# 创建维护脚本
cat > monitoring/maintenance.sh << 'EOF'
#!/bin/bash
# 监控系统维护脚本

LOG_FILE="/var/log/monitoring-maintenance.log"

log() {
    echo "$(date): $*" | tee -a "$LOG_FILE"
}

# 清理 Prometheus 数据 (保留最近30天)
cleanup_prometheus() {
    log "清理 Prometheus 数据..."
    # 注意: 这会删除旧数据，确保有备份
    docker-compose exec -T prometheus find /prometheus -name "*.db" -mtime +30 -delete 2>/dev/null || true
}

# 清理 Grafana 日志
cleanup_grafana() {
    log "清理 Grafana 日志..."
    docker-compose exec -T grafana find /var/log/grafana -name "*.log" -mtime +7 -delete 2>/dev/null || true
}

# 重启监控服务
restart_monitoring() {
    log "重启监控服务..."
    docker-compose restart
}

# 验证监控健康状态
verify_monitoring() {
    log "验证监控系统健康状态..."
    # 检查所有服务的健康状态
    services=$(docker-compose ps --services)
    for service in $services; do
        if docker-compose ps $service | grep -q "Up"; then
            log "✅ $service 运行正常"
        else
            log "❌ $service 运行异常"
        fi
    done
}

main() {
    log "开始监控系统维护..."

    case "${1:-all}" in
        "cleanup") cleanup_prometheus && cleanup_grafana ;;
        "restart") restart_monitoring ;;
        "verify") verify_monitoring ;;
        "all") cleanup_prometheus && cleanup_grafana && verify_monitoring ;;
        *) echo "用法: $0 [cleanup|restart|verify|all]"; exit 1 ;;
    esac

    log "监控系统维护完成"
}

main "$@"
EOF

chmod +x monitoring/maintenance.sh
```

---

## 总结

监控系统设置完成后，您将获得：

### 📊 **全面监控覆盖**
- 系统基础设施监控 (CPU、内存、磁盘、网络)
- 应用性能监控 (响应时间、错误率、吞吐量)
- 数据库监控 (连接数、查询性能、存储使用)
- 容器监控 (资源使用、健康状态)

### 🚨 **智能告警系统**
- 多级别告警 (Info、Warning、Critical)
- 多渠道通知 (邮件、Slack、Discord)
- 自动告警抑制和分组
- 告警升级机制

### 📈 **可视化仪表板**
- 实时监控仪表板
- 历史趋势分析
- 自定义图表和指标
- 移动端访问支持

### 🔧 **自动化运维**
- 自动故障检测
- 健康检查脚本
- 性能监控和告警
- 定期维护任务

### 📋 **监控最佳实践**
- 告警疲劳管理
- 监控数据保留策略
- 监控系统高可用性
- 持续的监控改进

通过这套完整的监控系统，您可以确保健身房管理系统的稳定运行，快速响应问题，并持续优化系统性能。

---

*最后更新: 2025-11-16*  
*版本: v1.0*  
*维护者: 运维团队*
