#!/bin/bash
# 监控指标收集脚本
# 收集系统和应用指标，发送到监控系统

set -e

# 配置
SCRIPT_VERSION="2.0.0"
LOG_FILE="/tmp/metrics-collector_$(date +%Y%m%d_%H%M%S).log"
PUSHGATEWAY_URL="${PUSHGATEWAY_URL:-http://localhost:9091}"
JOB_NAME="${JOB_NAME:-fitness-gym-custom}"

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

# 收集系统指标
collect_system_metrics() {
    log_info "Collecting system metrics..."

    local timestamp
    timestamp=$(date +%s)

    # CPU使用率
    local cpu_usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')

    # 内存信息
    local mem_total mem_used mem_available
    mem_total=$(free | grep Mem | awk '{print $2}')
    mem_used=$(free | grep Mem | awk '{print $3}')
    mem_available=$(free | grep Mem | awk '{print $7}')

    # 磁盘信息
    local disk_total disk_used disk_available
    disk_total=$(df / | tail -1 | awk '{print $2}')
    disk_used=$(df / | tail -1 | awk '{print $3}')
    disk_available=$(df / | tail -1 | awk '{print $4}')

    # 网络信息
    local net_rx net_tx
    net_rx=$(cat /proc/net/dev | grep -E "^\s*eth0|^enp" | awk '{print $2}')
    net_tx=$(cat /proc/net/dev | grep -E "^\s*eth0|^enp" | awk '{print $10}')

    # 系统负载
    local load1 load5 load15
    read -r load1 load5 load15 <<< "$(uptime | awk -F'load average:' '{ print $2 }' | sed 's/,//g')"

    # 生成Prometheus格式的指标
    cat << EOF
# HELP fitness_gym_cpu_usage_percent CPU usage percentage
# TYPE fitness_gym_cpu_usage_percent gauge
fitness_gym_cpu_usage_percent $cpu_usage $timestamp

# HELP fitness_gym_memory_total_bytes Total memory in bytes
# TYPE fitness_gym_memory_total_bytes gauge
fitness_gym_memory_total_bytes $mem_total $timestamp

# HELP fitness_gym_memory_used_bytes Used memory in bytes
# TYPE fitness_gym_memory_used_bytes gauge
fitness_gym_memory_used_bytes $mem_used $timestamp

# HELP fitness_gym_memory_available_bytes Available memory in bytes
# TYPE fitness_gym_memory_available_bytes gauge
fitness_gym_memory_available_bytes $mem_available $timestamp

# HELP fitness_gym_disk_total_bytes Total disk space in bytes
# TYPE fitness_gym_disk_total_bytes gauge
fitness_gym_disk_total_bytes $disk_total $timestamp

# HELP fitness_gym_disk_used_bytes Used disk space in bytes
# TYPE fitness_gym_disk_used_bytes gauge
fitness_gym_disk_used_bytes $disk_used $timestamp

# HELP fitness_gym_disk_available_bytes Available disk space in bytes
# TYPE fitness_gym_disk_available_bytes gauge
fitness_gym_disk_available_bytes $disk_available $timestamp

# HELP fitness_gym_network_receive_bytes Network receive bytes
# TYPE fitness_gym_network_receive_bytes counter
fitness_gym_network_receive_bytes $net_rx $timestamp

# HELP fitness_gym_network_transmit_bytes Network transmit bytes
# TYPE fitness_gym_network_transmit_bytes counter
fitness_gym_network_transmit_bytes $net_tx $timestamp

# HELP fitness_gym_load_average_1m System load average 1 minute
# TYPE fitness_gym_load_average_1m gauge
fitness_gym_load_average_1m $load1 $timestamp

# HELP fitness_gym_load_average_5m System load average 5 minutes
# TYPE fitness_gym_load_average_5m gauge
fitness_gym_load_average_5m $load5 $timestamp

# HELP fitness_gym_load_average_15m System load average 15 minutes
# TYPE fitness_gym_load_average_15m gauge
fitness_gym_load_average_15m $load15 $timestamp
EOF
}

# 收集业务指标
collect_business_metrics() {
    log_info "Collecting business metrics..."

    local timestamp
    timestamp=$(date +%s)

    # 从数据库收集业务指标（如果可用）
    if command -v psql >/dev/null 2>&1; then
        # 用户数量
        local user_count
        user_count=$(psql -U fitness_gym_user -d fitness_gym -h localhost -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")

        # 课程数量
        local course_count
        course_count=$(psql -U fitness_gym_user -d fitness_gym -h localhost -t -c "SELECT COUNT(*) FROM courses;" 2>/dev/null || echo "0")

        # 订单数量
        local order_count
        order_count=$(psql -U fitness_gym_user -d fitness_gym -h localhost -t -c "SELECT COUNT(*) FROM orders;" 2>/dev/null || echo "0")

        # 今日订单数量
        local today_orders
        today_orders=$(psql -U fitness_gym_user -d fitness_gym -h localhost -t -c "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE;" 2>/dev/null || echo "0")

        cat << EOF
# HELP fitness_gym_user_count Total number of users
# TYPE fitness_gym_user_count gauge
fitness_gym_user_count $user_count $timestamp

# HELP fitness_gym_course_count Total number of courses
# TYPE fitness_gym_course_count gauge
fitness_gym_course_count $course_count $timestamp

# HELP fitness_gym_order_count Total number of orders
# TYPE fitness_gym_order_count gauge
fitness_gym_order_count $order_count $timestamp

# HELP fitness_gym_today_orders Orders created today
# TYPE fitness_gym_today_orders gauge
fitness_gym_today_orders $today_orders $timestamp
EOF
    else
        log_warn "psql command not found, skipping business metrics collection"
    fi
}

# 收集应用指标
collect_application_metrics() {
    log_info "Collecting application metrics..."

    local timestamp
    timestamp=$(date +%s)

    # 检查应用健康状态
    if curl -f -s http://localhost:8080/springboot1ngh61a2/actuator/health >/dev/null 2>&1; then
        local app_status=1
    else
        local app_status=0
    fi

    # 检查数据库连接
    if curl -f -s http://localhost:8080/springboot1ngh61a2/actuator/health | grep -q '"db":{"status":"UP"'; then
        local db_status=1
    else
        local db_status=0
    fi

    # 检查Redis连接
    if curl -f -s http://localhost:8080/springboot1ngh61a2/actuator/health | grep -q '"redis":{"status":"UP"'; then
        local redis_status=1
    else
        local redis_status=0
    fi

    # 应用版本（从环境变量或配置文件读取）
    local app_version="${APP_VERSION:-unknown}"

    cat << EOF
# HELP fitness_gym_app_status Application health status (1=healthy, 0=unhealthy)
# TYPE fitness_gym_app_status gauge
fitness_gym_app_status $app_status $timestamp

# HELP fitness_gym_db_status Database connection status (1=connected, 0=disconnected)
# TYPE fitness_gym_db_status gauge
fitness_gym_db_status $db_status $timestamp

# HELP fitness_gym_redis_status Redis connection status (1=connected, 0=disconnected)
# TYPE fitness_gym_redis_status gauge
fitness_gym_redis_status $redis_status $timestamp

# HELP fitness_gym_app_info Application information
# TYPE fitness_gym_app_info gauge
fitness_gym_app_info{version="$app_version"} 1 $timestamp
EOF
}

# 发送指标到Pushgateway
send_metrics() {
    local metrics="$1"
    local instance="${INSTANCE:-$(hostname)}"

    log_info "Sending metrics to Pushgateway..."

    # 发送到Pushgateway
    if echo "$metrics" | curl -s --data-binary @- "$PUSHGATEWAY_URL/metrics/job/$JOB_NAME/instance/$instance"; then
        log_info "Metrics sent successfully"
    else
        log_error "Failed to send metrics to Pushgateway"
        return 1
    fi
}

# 清理旧指标
cleanup_metrics() {
    local instance="${INSTANCE:-$(hostname)}"

    log_info "Cleaning up old metrics..."

    if curl -s -X DELETE "$PUSHGATEWAY_URL/metrics/job/$JOB_NAME/instance/$instance" >/dev/null 2>&1; then
        log_info "Old metrics cleaned up"
    else
        log_warn "Failed to cleanup old metrics"
    fi
}

# 主函数
main() {
    log_info "Starting metrics collection script v$SCRIPT_VERSION"

    # 收集所有指标
    local system_metrics business_metrics app_metrics all_metrics

    system_metrics=$(collect_system_metrics)
    business_metrics=$(collect_business_metrics)
    app_metrics=$(collect_application_metrics)

    # 合并所有指标
    all_metrics=$(cat << EOF
$system_metrics

$business_metrics

$app_metrics
EOF
)

    # 清理旧指标
    cleanup_metrics

    # 发送新指标
    if send_metrics "$all_metrics"; then
        log_info "Metrics collection completed successfully"
        exit 0
    else
        log_error "Metrics collection failed"
        exit 1
    fi
}

# 参数解析
while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            echo "Metrics Collector Script v$SCRIPT_VERSION"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --pushgateway-url URL    Pushgateway URL (default: $PUSHGATEWAY_URL)"
            echo "  --job-name NAME          Job name (default: $JOB_NAME)"
            echo "  --instance NAME          Instance name (default: hostname)"
            echo "  --help                   Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  PUSHGATEWAY_URL          Pushgateway URL"
            echo "  JOB_NAME                 Job name"
            echo "  INSTANCE                 Instance name"
            echo "  APP_VERSION              Application version"
            echo ""
            echo "Examples:"
            echo "  $0"
            echo "  $0 --pushgateway-url http://pushgateway:9091 --job-name fitness-gym-prod"
            exit 0
            ;;
        --pushgateway-url)
            PUSHGATEWAY_URL="$2"
            shift 2
            ;;
        --job-name)
            JOB_NAME="$2"
            shift 2
            ;;
        --instance)
            INSTANCE="$2"
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
