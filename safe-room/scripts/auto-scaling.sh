#!/bin/bash
# Auto-Scaling Script for Fitness Gym System
# Features: CPU/memory-based scaling, configurable thresholds, scaling policies

set -e

SCRIPT_VERSION="1.0.0"
LOG_FILE="/var/log/auto-scaling_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CPU_THRESHOLD_HIGH="${CPU_THRESHOLD_HIGH:-80}"
CPU_THRESHOLD_LOW="${CPU_THRESHOLD_LOW:-30}"
MEMORY_THRESHOLD_HIGH="${MEMORY_THRESHOLD_HIGH:-85}"
MEMORY_THRESHOLD_LOW="${MEMORY_THRESHOLD_LOW:-40}"
CHECK_INTERVAL="${CHECK_INTERVAL:-60}"  # seconds
MAX_INSTANCES="${MAX_INSTANCES:-5}"
MIN_INSTANCES="${MIN_INSTANCES:-1}"
SERVICE_NAME="${SERVICE_NAME:-backend}"

# Scaling state
CURRENT_INSTANCES=0
LAST_SCALE_TIME=0
SCALE_COOLDOWN=300  # 5 minutes cooldown between scaling operations

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

log_scale() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] [SCALE]${NC} $*" | tee -a "$LOG_FILE"
}

# Validate environment
validate_environment() {
    log_info "Validating environment..."

    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not available"
        exit 1
    fi

    # Check if services are running
    if ! docker-compose ps | grep -q "Up"; then
        log_error "No services are currently running"
        exit 1
    fi

    # Get current instance count
    CURRENT_INSTANCES=$(docker-compose ps "$SERVICE_NAME" | grep -c "Up" || echo "0")

    if [ "$CURRENT_INSTANCES" -eq 0 ]; then
        log_error "Target service $SERVICE_NAME is not running"
        exit 1
    fi

    log_success "Environment validation completed. Current instances: $CURRENT_INSTANCES"
}

# Get CPU usage
get_cpu_usage() {
    # Get CPU usage for all instances of the service
    local cpu_usage

    # Use docker stats to get CPU usage
    cpu_usage=$(docker stats --no-stream --format "table {{.CPUPerc}}" | tail -n +2 | sed 's/%//' | awk '{sum+=$1; count++} END {if(count>0) print sum/count; else print 0}')

    # Fallback to top command if docker stats fails
    if [ -z "$cpu_usage" ] || [ "$cpu_usage" = "0" ]; then
        cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    fi

    echo "$cpu_usage"
}

# Get memory usage
get_memory_usage() {
    # Get memory usage for all instances of the service
    local memory_usage

    memory_usage=$(docker stats --no-stream --format "table {{.MemPerc}}" | tail -n +2 | sed 's/%//' | awk '{sum+=$1; count++} END {if(count>0) print sum/count; else print 0}')

    echo "$memory_usage"
}

# Get request rate (if available)
get_request_rate() {
    # Try to get request rate from application metrics
    local request_rate=0

    # Check if metrics endpoint is available
    if curl -f -s "http://localhost:8080/actuator/metrics/http.server.requests" >/dev/null 2>&1; then
        # Parse metrics response (simplified)
        request_rate=$(curl -s "http://localhost:8080/actuator/metrics/http.server.requests" | grep -o '"count":[0-9]*' | head -1 | cut -d':' -f2 || echo "0")
    fi

    echo "$request_rate"
}

# Check if scaling is allowed (cooldown check)
can_scale() {
    local current_time
    current_time=$(date +%s)

    if [ $((current_time - LAST_SCALE_TIME)) -lt $SCALE_COOLDOWN ]; then
        return 1  # Cannot scale, in cooldown period
    fi

    return 0  # Can scale
}

# Scale service up
scale_up() {
    local new_instances=$((CURRENT_INSTANCES + 1))

    if [ $new_instances -gt $MAX_INSTANCES ]; then
        log_warn "Cannot scale up: would exceed maximum instances ($MAX_INSTANCES)"
        return 1
    fi

    log_scale "🔼 Scaling UP from $CURRENT_INSTANCES to $new_instances instances"

    if docker-compose up -d --scale "$SERVICE_NAME=$new_instances"; then
        CURRENT_INSTANCES=$new_instances
        LAST_SCALE_TIME=$(date +%s)

        # Wait for new instances to be ready
        sleep 30

        # Verify scaling was successful
        local actual_instances
        actual_instances=$(docker-compose ps "$SERVICE_NAME" | grep -c "Up" || echo "0")

        if [ "$actual_instances" -eq "$new_instances" ]; then
            log_success "✅ Successfully scaled to $new_instances instances"
            send_notification "🔼 Scaled $SERVICE_NAME up to $new_instances instances (CPU/Memory high)"
            return 0
        else
            log_error "❌ Scaling verification failed. Expected: $new_instances, Actual: $actual_instances"
            return 1
        fi
    else
        log_error "❌ Failed to scale up service"
        return 1
    fi
}

# Scale service down
scale_down() {
    local new_instances=$((CURRENT_INSTANCES - 1))

    if [ $new_instances -lt $MIN_INSTANCES ]; then
        log_warn "Cannot scale down: would go below minimum instances ($MIN_INSTANCES)"
        return 1
    fi

    log_scale "🔽 Scaling DOWN from $CURRENT_INSTANCES to $new_instances instances"

    if docker-compose up -d --scale "$SERVICE_NAME=$new_instances"; then
        CURRENT_INSTANCES=$new_instances
        LAST_SCALE_TIME=$(date +%s)

        # Wait for scaling to complete
        sleep 10

        log_success "✅ Successfully scaled to $new_instances instances"
        send_notification "🔽 Scaled $SERVICE_NAME down to $new_instances instances (CPU/Memory low)"
        return 0
    else
        log_error "❌ Failed to scale down service"
        return 1
    fi
}

# Evaluate scaling decision
evaluate_scaling() {
    local cpu_usage="$1"
    local memory_usage="$2"
    local request_rate="$3"

    log_info "Evaluating scaling: CPU=${cpu_usage}%, Memory=${memory_usage}%, Requests=${request_rate}"

    # Scale up conditions
    local should_scale_up=false

    if (( $(echo "$cpu_usage > $CPU_THRESHOLD_HIGH" | bc -l 2>/dev/null || echo "0") )); then
        log_info "CPU usage above threshold: ${cpu_usage}% > ${CPU_THRESHOLD_HIGH}%"
        should_scale_up=true
    fi

    if (( $(echo "$memory_usage > $MEMORY_THRESHOLD_HIGH" | bc -l 2>/dev/null || echo "0") )); then
        log_info "Memory usage above threshold: ${memory_usage}% > ${MEMORY_THRESHOLD_HIGH}%"
        should_scale_up=true
    fi

    # High request rate (if available)
    if [ "$request_rate" -gt 1000 ] 2>/dev/null; then
        log_info "High request rate detected: $request_rate requests"
        should_scale_up=true
    fi

    if [ "$should_scale_up" = true ]; then
        if can_scale; then
            scale_up
        else
            log_info "Cannot scale up: in cooldown period"
        fi
        return
    fi

    # Scale down conditions
    local should_scale_down=false

    if (( $(echo "$cpu_usage < $CPU_THRESHOLD_LOW" | bc -l 2>/dev/null || echo "0") )) && \
       (( $(echo "$memory_usage < $MEMORY_THRESHOLD_LOW" | bc -l 2>/dev/null || echo "0") )); then
        log_info "Both CPU and memory usage below thresholds"
        should_scale_down=true
    fi

    # Low request rate (if available)
    if [ "$request_rate" -lt 100 ] 2>/dev/null && [ "$request_rate" -gt 0 ]; then
        log_info "Low request rate detected: $request_rate requests"
        should_scale_down=true
    fi

    if [ "$should_scale_down" = true ] && [ $CURRENT_INSTANCES -gt $MIN_INSTANCES ]; then
        if can_scale; then
            scale_down
        else
            log_info "Cannot scale down: in cooldown period"
        fi
    fi
}

# Send notification
send_notification() {
    local message="$1"

    # Send to Slack if configured
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🤖 Auto-scaling: $message\"}" \
            "${SLACK_WEBHOOK_URL}" 2>/dev/null || true
    fi

    # Send email if configured
    if [ -n "${EMAIL_RECIPIENT:-}" ]; then
        echo "Auto-scaling: $message" | mail -s "Fitness Gym Auto-scaling Alert" "${EMAIL_RECIPIENT}" 2>/dev/null || true
    fi
}

# Generate scaling report
generate_scaling_report() {
    local report_file="auto-scaling-report-$(date +%Y%m%d_%H%M%S).md"

    cat > "$report_file" << EOF
# 📊 Auto-Scaling Report

**Service**: $SERVICE_NAME
**Timestamp**: $(date)
**Current Instances**: $CURRENT_INSTANCES
**Min Instances**: $MIN_INSTANCES
**Max Instances**: $MAX_INSTANCES

## Configuration

| Setting | Value |
|---------|-------|
| CPU High Threshold | ${CPU_THRESHOLD_HIGH}% |
| CPU Low Threshold | ${CPU_THRESHOLD_LOW}% |
| Memory High Threshold | ${MEMORY_THRESHOLD_HIGH}% |
| Memory Low Threshold | ${MEMORY_THRESHOLD_LOW}% |
| Check Interval | ${CHECK_INTERVAL}s |
| Scale Cooldown | ${SCALE_COOLDOWN}s |

## Scaling Events

EOF

    # Add recent scaling events from log
    if [ -f "$LOG_FILE" ]; then
        grep "\[SCALE\]" "$LOG_FILE" | tail -10 >> "$report_file" || true
    fi

    cat >> "$report_file" << EOF

## Current Metrics

- **CPU Usage**: $(get_cpu_usage)%
- **Memory Usage**: $(get_memory_usage)%
- **Request Rate**: $(get_request_rate) requests

## Recommendations

- Monitor system performance during peak hours
- Adjust thresholds based on actual usage patterns
- Consider implementing predictive scaling based on historical data

---
*Generated by auto-scaling script v$SCRIPT_VERSION*
EOF

    log_info "Scaling report generated: $report_file"
}

# Show current status
show_status() {
    local cpu_usage
    local memory_usage
    local request_rate

    cpu_usage=$(get_cpu_usage)
    memory_usage=$(get_memory_usage)
    request_rate=$(get_request_rate)

    echo "========================================="
    echo "Auto-Scaling Status"
    echo "========================================="
    echo "Service: $SERVICE_NAME"
    echo "Current Instances: $CURRENT_INSTANCES (Min: $MIN_INSTANCES, Max: $MAX_INSTANCES)"
    echo "CPU Usage: ${cpu_usage}% (High: ${CPU_THRESHOLD_HIGH}%, Low: ${CPU_THRESHOLD_LOW}%)"
    echo "Memory Usage: ${memory_usage}% (High: ${MEMORY_THRESHOLD_HIGH}%, Low: ${MEMORY_THRESHOLD_LOW}%)"
    echo "Request Rate: $request_rate requests"
    echo "Last Scale Time: $(date -d "@$LAST_SCALE_TIME" 2>/dev/null || echo 'Never')"
    echo "========================================="
}

# Main monitoring loop
start_monitoring() {
    log_info "🚀 Starting auto-scaling monitoring for service: $SERVICE_NAME"
    log_info "Configuration: CPU(${CPU_THRESHOLD_LOW}%-${CPU_THRESHOLD_HIGH}%), Memory(${MEMORY_THRESHOLD_LOW}%-${MEMORY_THRESHOLD_HIGH}%), Interval(${CHECK_INTERVAL}s)"

    # Generate initial report
    generate_scaling_report

    while true; do
        # Get current metrics
        local cpu_usage
        local memory_usage
        local request_rate

        cpu_usage=$(get_cpu_usage)
        memory_usage=$(get_memory_usage)
        request_rate=$(get_request_rate)

        # Evaluate scaling decision
        evaluate_scaling "$cpu_usage" "$memory_usage" "$request_rate"

        # Wait for next check
        sleep "$CHECK_INTERVAL"
    done
}

# Show help
show_help() {
    cat << EOF
Auto-Scaling Script v$SCRIPT_VERSION

Usage: $0 [command] [options]

Commands:
    start       Start auto-scaling monitoring (default)
    status      Show current scaling status
    scale-up    Manually scale up by one instance
    scale-down  Manually scale down by one instance
    report      Generate scaling report

Options:
    --service NAME     Target service name (default: backend)
    --cpu-high PCT     CPU high threshold percentage (default: 80)
    --cpu-low PCT      CPU low threshold percentage (default: 30)
    --mem-high PCT     Memory high threshold percentage (default: 85)
    --mem-low PCT      Memory low threshold percentage (default: 40)
    --max-instances N  Maximum instances (default: 5)
    --min-instances N  Minimum instances (default: 1)
    --interval SEC     Check interval in seconds (default: 60)
    --help             Show this help message

Environment Variables:
    SERVICE_NAME         Target service name
    CPU_THRESHOLD_HIGH   CPU high threshold
    CPU_THRESHOLD_LOW    CPU low threshold
    MEMORY_THRESHOLD_HIGH Memory high threshold
    MEMORY_THRESHOLD_LOW Memory low threshold
    MAX_INSTANCES        Maximum instances
    MIN_INSTANCES        Minimum instances
    CHECK_INTERVAL       Check interval
    SLACK_WEBHOOK_URL    Slack webhook URL for notifications
    EMAIL_RECIPIENT      Email recipient for notifications

Examples:
    $0 start                                    # Start monitoring with defaults
    $0 start --cpu-high 90 --mem-high 90       # Start with custom thresholds
    $0 status                                   # Show current status
    $0 scale-up                                 # Manually scale up
    $0 report                                   # Generate report

EOF
}

# Parse command line arguments
parse_arguments() {
    local command="start"

    while [[ $# -gt 0 ]]; do
        case $1 in
            start|status|scale-up|scale-down|report)
                command="$1"
                shift
                ;;
            --service)
                SERVICE_NAME="$2"
                shift 2
                ;;
            --cpu-high)
                CPU_THRESHOLD_HIGH="$2"
                shift 2
                ;;
            --cpu-low)
                CPU_THRESHOLD_LOW="$2"
                shift 2
                ;;
            --mem-high)
                MEMORY_THRESHOLD_HIGH="$2"
                shift 2
                ;;
            --mem-low)
                MEMORY_THRESHOLD_LOW="$2"
                shift 2
                ;;
            --max-instances)
                MAX_INSTANCES="$2"
                shift 2
                ;;
            --min-instances)
                MIN_INSTANCES="$2"
                shift 2
                ;;
            --interval)
                CHECK_INTERVAL="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # Execute command
    case "$command" in
        start)
            validate_environment
            start_monitoring
            ;;
        status)
            validate_environment
            show_status
            ;;
        scale-up)
            validate_environment
            if can_scale; then
                scale_up
            else
                log_error "Cannot scale up: in cooldown period"
                exit 1
            fi
            ;;
        scale-down)
            validate_environment
            if can_scale; then
                scale_down
            else
                log_error "Cannot scale down: in cooldown period"
                exit 1
            fi
            ;;
        report)
            validate_environment
            generate_scaling_report
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Main execution
main() {
    # Set trap for clean exit
    trap 'log_info "Auto-scaling monitoring stopped"; exit 0' INT TERM

    # Parse arguments and execute
    parse_arguments "$@"
}

# Run main function with all arguments
main "$@"
