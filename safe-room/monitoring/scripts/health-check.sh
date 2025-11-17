#!/bin/bash
# 健康检查脚本
# 用于检查系统各项服务的健康状态

set -e

# 配置
SCRIPT_VERSION="2.0.0"
LOG_FILE="/tmp/health-check_$(date +%Y%m%d_%H%M%S).log"
REPORT_FILE="/tmp/health-report_$(date +%Y%m%d_%H%M%S).json"

# 服务配置
SERVICES=(
    "prometheus:http://localhost:9090/-/healthy"
    "alertmanager:http://localhost:9093/-/healthy"
    "grafana:http://localhost:3000/api/health"
    "fitness-gym-backend:http://localhost:8080/springboot1ngh61a2/actuator/health"
    "fitness-gym-frontend:http://localhost:8080/front/front/index.html"
    "postgres:pg_isready://localhost:5432/fitness_gym"
    "redis:redis://localhost:6379"
    "minio:http://localhost:9000/minio/health/live"
)

# 健康检查阈值
CPU_THRESHOLD_WARN=80
CPU_THRESHOLD_CRIT=90
MEMORY_THRESHOLD_WARN=85
MEMORY_THRESHOLD_CRIT=95
DISK_THRESHOLD_WARN=80
DISK_THRESHOLD_CRIT=90
RESPONSE_TIME_THRESHOLD_WARN=2.0  # seconds
RESPONSE_TIME_THRESHOLD_CRIT=5.0  # seconds

# 日志函数
log_info() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $*" | tee -a "$LOG_FILE"
}

log_warn() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARN] $*" | tee -a "$LOG_FILE" >&2
}

log_error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $*" | tee -a "$LOG_FILE" >&2
}

# 检查单个服务
check_service() {
    local service_name="$1"
    local service_url="$2"
    local start_time
    start_time=$(date +%s)

    log_info "Checking $service_name..."

    local status="unknown"
    local response_time=0
    local error_message=""
    local severity="info"
    local details="{}"

    case "$service_name" in
        "postgres")
            if command -v pg_isready >/dev/null 2>&1; then
                local pg_start
                pg_start=$(date +%s.%3N)
                if pg_isready -h localhost -p 5432 -U postgres -d fitness_gym >/dev/null 2>&1; then
                    status="healthy"
                    local pg_end
                    pg_end=$(date +%s.%3N)
                    response_time=$(echo "$pg_end - $pg_start" | bc 2>/dev/null || echo "0")

                    # Get additional PostgreSQL stats
                    local connection_count
                    connection_count=$(PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h localhost -p 5432 -U postgres -d fitness_gym -c "SELECT count(*) FROM pg_stat_activity;" -t 2>/dev/null | tr -d ' ' || echo "0")
                    details="{\"active_connections\": $connection_count}"
                else
                    status="unhealthy"
                    error_message="pg_isready check failed"
                    severity="critical"
                fi
            else
                status="unknown"
                error_message="pg_isready command not found"
                severity="warning"
            fi
            ;;
        "redis")
            if command -v redis-cli >/dev/null 2>&1; then
                local redis_start
                redis_start=$(date +%s.%3N)
                local ping_result
                ping_result=$(redis-cli -h localhost -p 6379 ping 2>/dev/null || echo "FAILED")
                if [ "$ping_result" = "PONG" ]; then
                    status="healthy"
                    local redis_end
                    redis_end=$(date +%s.%3N)
                    response_time=$(echo "$redis_end - $redis_start" | bc 2>/dev/null || echo "0")

                    # Get Redis stats
                    local connected_clients
                    connected_clients=$(redis-cli -h localhost -p 6379 info clients 2>/dev/null | grep "connected_clients" | cut -d: -f2 || echo "0")
                    local used_memory
                    used_memory=$(redis-cli -h localhost -p 6379 info memory 2>/dev/null | grep "used_memory:" | cut -d: -f2 || echo "0")
                    details="{\"connected_clients\": $connected_clients, \"used_memory_bytes\": $used_memory}"
                else
                    status="unhealthy"
                    error_message="redis-cli ping failed"
                    severity="critical"
                fi
            else
                status="unknown"
                error_message="redis-cli command not found"
                severity="warning"
            fi
            ;;
        "fitness-gym-backend")
            # Enhanced backend checks
            local check_start
            check_start=$(date +%s.%3N)
            if curl -f -s --max-time 10 "$service_url" >/dev/null 2>&1; then
                local check_end
                check_end=$(date +%s.%3N)
                response_time=$(echo "$check_end - $check_start" | bc 2>/dev/null || echo "0")

                # Check response time threshold
                if (( $(echo "$response_time > $RESPONSE_TIME_THRESHOLD_CRIT" | bc -l 2>/dev/null || echo "0") )); then
                    status="unhealthy"
                    severity="critical"
                    error_message="Response time too high: ${response_time}s"
                elif (( $(echo "$response_time > $RESPONSE_TIME_THRESHOLD_WARN" | bc -l 2>/dev/null || echo "0") )); then
                    status="degraded"
                    severity="warning"
                    error_message="Response time high: ${response_time}s"
                else
                    status="healthy"
                fi

                # Get application metrics if available
                local app_metrics="{}"
                if curl -f -s --max-time 5 "http://localhost:8080/actuator/metrics/jvm.memory.used" >/dev/null 2>&1; then
                    local heap_used
                    heap_used=$(curl -s "http://localhost:8080/actuator/metrics/jvm.memory.used" | grep -o '"measurements":\[[^]]*\]' | grep -o '"value":[0-9.]*' | head -1 | cut -d: -f2 || echo "0")
                    app_metrics="{\"heap_used_bytes\": $heap_used}"
                fi
                details="$app_metrics"
            else
                status="unhealthy"
                error_message="HTTP check failed"
                severity="critical"
            fi
            ;;
        *)
            # Standard HTTP-based services
            local check_start
            check_start=$(date +%s.%3N)
            if curl -f -s --max-time 10 "$service_url" >/dev/null 2>&1; then
                local check_end
                check_end=$(date +%s.%3N)
                response_time=$(echo "$check_end - $check_start" | bc 2>/dev/null || echo "0")

                # Check response time threshold
                if (( $(echo "$response_time > $RESPONSE_TIME_THRESHOLD_CRIT" | bc -l 2>/dev/null || echo "0") )); then
                    status="unhealthy"
                    severity="critical"
                    error_message="Response time too high: ${response_time}s"
                elif (( $(echo "$response_time > $RESPONSE_TIME_THRESHOLD_WARN" | bc -l 2>/dev/null || echo "0") )); then
                    status="degraded"
                    severity="warning"
                    error_message="Response time high: ${response_time}s"
                else
                    status="healthy"
                fi
            else
                status="unhealthy"
                error_message="HTTP check failed"
                severity="critical"
            fi
            ;;
    esac

    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # 返回JSON格式的结果
    cat << EOF
{
    "service": "$service_name",
    "url": "$service_url",
    "status": "$status",
    "severity": "$severity",
    "response_time": $response_time,
    "duration": $duration,
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "error": "$error_message",
    "details": $details
}
EOF
}

# 系统资源检查
check_system_resources() {
    log_info "Checking system resources..."

    # CPU使用率
    local cpu_usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')

    # CPU状态判断
    local cpu_status="healthy"
    local cpu_severity="info"
    if (( $(echo "$cpu_usage > $CPU_THRESHOLD_CRIT" | bc -l 2>/dev/null || echo "0") )); then
        cpu_status="critical"
        cpu_severity="critical"
    elif (( $(echo "$cpu_usage > $CPU_THRESHOLD_WARN" | bc -l 2>/dev/null || echo "0") )); then
        cpu_status="warning"
        cpu_severity="warning"
    fi

    # 内存使用率
    local mem_total mem_used
    mem_total=$(free | grep Mem | awk '{print $2}')
    mem_used=$(free | grep Mem | awk '{print $3}')
    local mem_usage
    mem_usage=$(echo "scale=2; $mem_used * 100 / $mem_total" | bc 2>/dev/null || echo "0")

    # 内存状态判断
    local mem_status="healthy"
    local mem_severity="info"
    if (( $(echo "$mem_usage > $MEMORY_THRESHOLD_CRIT" | bc -l 2>/dev/null || echo "0") )); then
        mem_status="critical"
        mem_severity="critical"
    elif (( $(echo "$mem_usage > $MEMORY_THRESHOLD_WARN" | bc -l 2>/dev/null || echo "0") )); then
        mem_status="warning"
        mem_severity="warning"
    fi

    # 磁盘使用率
    local disk_usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

    # 磁盘状态判断
    local disk_status="healthy"
    local disk_severity="info"
    if [ "$disk_usage" -gt "$DISK_THRESHOLD_CRIT" ] 2>/dev/null; then
        disk_status="critical"
        disk_severity="critical"
    elif [ "$disk_usage" -gt "$DISK_THRESHOLD_WARN" ] 2>/dev/null; then
        disk_status="warning"
        disk_severity="warning"
    fi

    # 网络连接数
    local network_connections
    network_connections=$(netstat -tun 2>/dev/null | wc -l || ss -tun 2>/dev/null | wc -l || echo "0")

    # 系统负载
    local load_average
    load_average=$(uptime | awk -F'load average:' '{ print $2 }' | cut -d, -f1 | tr -d ' ' || echo "0.00")

    # 返回JSON格式的结果
    cat << EOF
{
    "resource": "system",
    "cpu_usage": $cpu_usage,
    "cpu_status": "$cpu_status",
    "cpu_severity": "$cpu_severity",
    "memory_usage": $mem_usage,
    "memory_status": "$mem_status",
    "memory_severity": "$mem_severity",
    "disk_usage": $disk_usage,
    "disk_status": "$disk_status",
    "disk_severity": "$disk_severity",
    "network_connections": $network_connections,
    "load_average": $load_average,
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

# 生成报告
generate_report() {
    local results="$1"
    local system_info="$2"

    log_info "Generating health check report..."

    # 计算整体健康状态
    local healthy_count unhealthy_count total_count
    healthy_count=$(echo "$results" | grep -c '"status": "healthy"')
    unhealthy_count=$(echo "$results" | grep -c '"status": "unhealthy"')
    total_count=$(echo "$results" | wc -l)

    local overall_status="healthy"
    if [ "$unhealthy_count" -gt 0 ]; then
        overall_status="unhealthy"
    elif [ "$healthy_count" -lt "$total_count" ]; then
        overall_status="degraded"
    fi

    # 生成JSON报告
    cat > "$REPORT_FILE" << EOF
{
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "version": "$SCRIPT_VERSION",
    "overall_status": "$overall_status",
    "summary": {
        "total_services": $total_count,
        "healthy_services": $healthy_count,
        "unhealthy_services": $unhealthy_count,
        "health_percentage": $(echo "scale=2; $healthy_count * 100 / $total_count" | bc 2>/dev/null || echo "0")
    },
    "system_resources": $system_info,
    "services": [
        $results
    ]
}
EOF

    log_info "Health check report generated: $REPORT_FILE"
    log_info "Overall status: $overall_status"
    log_info "Healthy services: $healthy_count/$total_count"
}

# 主函数
main() {
    log_info "Starting health check script v$SCRIPT_VERSION"

    local results=""
    local first=true

    # 检查所有服务
    for service_info in "${SERVICES[@]}"; do
        IFS=':' read -r service_name service_url <<< "$service_info"

        if [ "$first" = true ]; then
            first=false
        else
            results="${results},"
        fi

        local result
        result=$(check_service "$service_name" "$service_url")
        results="${results}${result}"
    done

    # 检查系统资源
    local system_info
    system_info=$(check_system_resources)

    # 生成报告
    generate_report "$results" "$system_info"

    # 输出结果摘要
    local unhealthy_count
    unhealthy_count=$(echo "$results" | grep -c '"status": "unhealthy"')

    if [ "$unhealthy_count" -gt 0 ]; then
        log_error "Health check completed with $unhealthy_count unhealthy services"
        echo "$results" | jq -r '. | select(.status == "unhealthy") | "\(.service): \(.error)"'
        exit 1
    else
        log_info "All health checks passed"
        exit 0
    fi
}

# 参数解析
while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            echo "Health Check Script v$SCRIPT_VERSION"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --help          Show this help message"
            echo "  --log-file      Specify log file (default: auto-generated)"
            echo "  --report-file   Specify report file (default: auto-generated)"
            echo ""
            echo "Examples:"
            echo "  $0"
            echo "  $0 --log-file /var/log/health-check.log"
            exit 0
            ;;
        --log-file)
            LOG_FILE="$2"
            shift 2
            ;;
        --report-file)
            REPORT_FILE="$2"
            shift 2
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# 运行主函数
main "$@"
