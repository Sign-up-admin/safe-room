#!/bin/bash
# Alert Response Automation Script for Fitness Gym System
# Features: Automated response to common alerts, service restart, scaling actions

set -e

SCRIPT_VERSION="1.0.0"
LOG_FILE="/var/log/fitness-gym-alert-responder_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL_RECIPIENTS="${EMAIL_RECIPIENTS:-ops@fitness-gym.com}"

# Logging functions
log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]${NC} $*" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] [WARN]${NC} $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR]${NC} $*" | tee -a "$LOG_FILE" >&2
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS]${NC} $*" | tee -a "$LOG_FILE"
}

# Send Slack notification
send_slack_notification() {
    local message="$1"
    local channel="${2:-#alerts}"

    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\", \"channel\":\"$channel\"}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || log_warn "Failed to send Slack notification"
    fi
}

# Send email notification
send_email_notification() {
    local subject="$1"
    local body="$2"

    if command -v mail &> /dev/null; then
        echo "$body" | mail -s "$subject" "$EMAIL_RECIPIENTS" 2>/dev/null || log_warn "Failed to send email notification"
    fi
}

# Check service health
check_service_health() {
    local service="$1"
    local max_attempts=3
    local attempt=1

    log_info "Checking health of service: $service"

    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps "$service" | grep -q "Up"; then
            log_success "Service $service is healthy"
            return 0
        fi

        log_warn "Service $service not healthy (attempt $attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done

    log_error "Service $service failed health check after $max_attempts attempts"
    return 1
}

# Restart service
restart_service() {
    local service="$1"
    log_info "Restarting service: $service"

    if docker-compose restart "$service"; then
        log_success "Service $service restarted successfully"

        # Wait for service to be ready
        sleep 10

        # Check health after restart
        if check_service_health "$service"; then
            send_slack_notification "✅ Service $service restarted successfully" "#alerts"
            return 0
        else
            log_error "Service $service failed to start after restart"
            send_slack_notification "❌ Service $service failed to start after restart" "#alerts-critical"
            return 1
        fi
    else
        log_error "Failed to restart service: $service"
        send_slack_notification "❌ Failed to restart service $service" "#alerts-critical"
        return 1
    fi
}

# Scale service
scale_service() {
    local service="$1"
    local replicas="$2"

    log_info "Scaling service $service to $replicas replicas"

    if docker-compose up -d --scale "$service=$replicas"; then
        log_success "Service $service scaled to $replicas replicas"

        # Wait for scaling to complete
        sleep 15

        # Check health of scaled services
        if check_service_health "$service"; then
            send_slack_notification "✅ Service $service scaled to $replicas replicas successfully" "#alerts"
            return 0
        else
            log_error "Service $service unhealthy after scaling"
            send_slack_notification "❌ Service $service unhealthy after scaling to $replicas replicas" "#alerts-critical"
            return 1
        fi
    else
        log_error "Failed to scale service $service"
        send_slack_notification "❌ Failed to scale service $service to $replicas replicas" "#alerts-critical"
        return 1
    fi
}

# Clean up disk space
cleanup_disk_space() {
    log_info "Performing disk cleanup..."

    # Clean Docker resources
    log_info "Cleaning Docker resources..."
    docker system prune -f
    docker volume prune -f
    docker image prune -f

    # Clean old log files
    log_info "Cleaning old log files..."
    find /var/log -name "*.log" -mtime +30 -exec gzip {} \; 2>/dev/null || true
    find /var/log -name "*.gz" -mtime +90 -delete 2>/dev/null || true

    # Clean temporary files
    log_info "Cleaning temporary files..."
    find /tmp -type f -mtime +7 -delete 2>/dev/null || true

    log_success "Disk cleanup completed"
    send_slack_notification "🧹 Disk cleanup completed" "#alerts"
}

# Handle high CPU usage
handle_high_cpu() {
    local service="${1:-backend}"
    log_info "Handling high CPU usage for service: $service"

    # Try to scale the service first
    current_replicas=$(docker-compose ps "$service" | grep -c "Up" || echo "1")
    new_replicas=$((current_replicas + 1))

    if [ $new_replicas -le 5 ]; then  # Max 5 replicas
        log_info "Attempting to scale service to handle high CPU"
        if scale_service "$service" "$new_replicas"; then
            send_slack_notification "📈 Scaled $service to $new_replicas replicas due to high CPU usage" "#alerts"
            return 0
        fi
    fi

    # If scaling fails or at max capacity, restart the service
    log_info "Scaling not possible or failed, attempting service restart"
    restart_service "$service"
}

# Handle high memory usage
handle_high_memory() {
    local service="${1:-backend}"
    log_info "Handling high memory usage for service: $service"

    # Restart service to free memory
    log_info "Restarting service to free memory"
    restart_service "$service"
}

# Handle database connection issues
handle_database_connection_error() {
    log_info "Handling database connection error"

    # Check if database container is running
    if ! docker-compose ps postgres | grep -q "Up"; then
        log_info "Database container not running, restarting..."
        restart_service "postgres"
        return $?
    fi

    # Check database connectivity
    if ! docker-compose exec -T postgres pg_isready -U postgres -d fitness_gym >/dev/null 2>&1; then
        log_info "Database not responding, restarting..."
        restart_service "postgres"
        return $?
    fi

    log_warn "Database appears healthy, connection issue may be temporary"
    return 0
}

# Handle Redis connection issues
handle_redis_connection_error() {
    log_info "Handling Redis connection error"
    restart_service "redis"
}

# Handle API down
handle_api_down() {
    log_info "Handling API down alert"
    restart_service "backend"
}

# Handle MinIO down
handle_minio_down() {
    log_info "Handling MinIO down alert"
    restart_service "minio"
}

# Main alert response function
respond_to_alert() {
    local alert_type="$1"
    local instance="$2"
    local severity="$3"

    log_info "Responding to alert: $alert_type (severity: $severity, instance: $instance)"

    # Send initial response notification
    send_slack_notification "🤖 Auto-response triggered for: $alert_type" "#alerts"

    case "$alert_type" in
        "HighCPUUsage")
            handle_high_cpu "$instance"
            ;;
        "HighMemoryUsage")
            handle_high_memory "$instance"
            ;;
        "LowDiskSpace")
            cleanup_disk_space
            ;;
        "DatabaseConnectionError")
            handle_database_connection_error
            ;;
        "RedisDown")
            handle_redis_connection_error
            ;;
        "APIDown")
            handle_api_down
            ;;
        "MinIODown")
            handle_minio_down
            ;;
        "ContainerRestarting")
            # For frequently restarting containers, check logs and restart
            log_info "Container $instance restarting frequently"
            restart_service "$instance"
            ;;
        *)
            log_warn "No automated response defined for alert type: $alert_type"
            send_slack_notification "⚠️ Manual intervention required for: $alert_type" "#alerts-critical"
            ;;
    esac

    log_info "Alert response completed for: $alert_type"
}

# Generate response report
generate_response_report() {
    local alert_type="$1"
    local action_taken="$2"
    local success="$3"

    local report_file="alert-response-report-$(date +%Y%m%d_%H%M%S).md"

    cat > "$report_file" << EOF
# 🤖 Alert Auto-Response Report

**Timestamp**: $(date)
**Alert Type**: $alert_type
**Action Taken**: $action_taken
**Success**: $([ "$success" = "true" ] && echo "✅ Yes" || echo "❌ No")

## Response Details

- **Alert**: $alert_type
- **Action**: $action_taken
- **Result**: $([ "$success" = "true" ] && echo "Successful" || echo "Failed")
- **Log File**: $LOG_FILE

## Next Steps

$(if [ "$success" = "true" ]; then
    echo "- ✅ Automated response completed successfully"
    echo "- Monitor system for continued stability"
else
    echo "- ❌ Automated response failed"
    echo "- Manual intervention required"
    echo "- Check system logs for detailed error information"
fi)

---
*Generated by alert responder v$SCRIPT_VERSION*
EOF

    log_info "Response report generated: $report_file"
}

# Show help
show_help() {
    cat << EOF
Alert Response Automation Script v$SCRIPT_VERSION

Usage: $0 <alert_type> [instance] [severity]

Arguments:
    alert_type    The type of alert to respond to
    instance      The affected instance/service (optional)
    severity      Alert severity level (optional)

Supported Alert Types:
    HighCPUUsage          Scale service or restart
    HighMemoryUsage       Restart service
    LowDiskSpace          Clean up disk space
    DatabaseConnectionError Restart database
    RedisDown             Restart Redis
    APIDown               Restart backend API
    MinIODown             Restart MinIO
    ContainerRestarting   Restart container

Examples:
    $0 HighCPUUsage backend warning
    $0 DatabaseConnectionError postgres critical
    $0 APIDown

Environment Variables:
    SLACK_WEBHOOK_URL     Slack webhook URL for notifications
    EMAIL_RECIPIENTS      Email recipients for notifications

EOF
}

# Main function
main() {
    if [ $# -lt 1 ]; then
        log_error "Alert type is required"
        show_help
        exit 1
    fi

    local alert_type="$1"
    local instance="${2:-backend}"
    local severity="${3:-warning}"

    log_info "🚨 Alert Responder started - Type: $alert_type, Instance: $instance, Severity: $severity"

    # Respond to the alert
    local start_time=$(date +%s)
    respond_to_alert "$alert_type" "$instance" "$severity"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Determine success based on exit code
    local success=$([ $? -eq 0 ] && echo "true" || echo "false")

    # Generate report
    generate_response_report "$alert_type" "Automated response" "$success"

    log_info "Alert response completed in ${duration}s"

    if [ "$success" = "true" ]; then
        log_success "✅ Alert response successful"
        exit 0
    else
        log_error "❌ Alert response failed"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
