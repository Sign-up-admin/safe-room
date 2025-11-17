#!/bin/bash
# Blue-Green Deployment Script for Fitness Gym System
# Features: Zero-downtime deployment, automatic rollback, health checks

set -e

SCRIPT_VERSION="1.0.0"
LOG_FILE="/tmp/blue-green-deploy_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BLUE_PORT=8080
GREEN_PORT=8081
BACKUP_DIR="/tmp/deployment_backup_$(date +%Y%m%d_%H%M%S)"
CURRENT_COLOR_FILE="/tmp/current_deployment_color.txt"

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

# Get current deployment color
get_current_color() {
    if [ -f "$CURRENT_COLOR_FILE" ]; then
        cat "$CURRENT_COLOR_FILE"
    else
        echo "blue"  # Default to blue
    fi
}

# Update current deployment color
update_current_color() {
    local new_color="$1"
    echo "$new_color" > "$CURRENT_COLOR_FILE"
    log_info "Updated current deployment color to: $new_color"
}

# Switch traffic between blue and green
switch_traffic() {
    local new_color="$1"
    log_info "Switching traffic to $new_color environment..."

    if [ "$new_color" = "blue" ]; then
        # Switch to blue (8080)
        update_nginx_config "$BLUE_PORT"
    else
        # Switch to green (8081)
        update_nginx_config "$GREEN_PORT"
    fi

    # Reload nginx
    if command -v nginx &> /dev/null; then
        nginx -s reload
        log_success "Nginx reloaded successfully"
    else
        log_warn "Nginx not found, manual traffic switching required"
    fi
}

# Update nginx configuration
update_nginx_config() {
    local port="$1"
    log_info "Updating nginx configuration to port: $port"

    # This is a simplified nginx config update
    # In production, you would update the actual nginx configuration file
    cat > /tmp/nginx_fitness_gym.conf << EOF
upstream fitness_gym_backend {
    server localhost:$port;
}

server {
    listen 80;
    server_name localhost;

    location /springboot1ngh61a2 {
        proxy_pass http://fitness_gym_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    log_info "Nginx configuration updated"
}

# Wait for service to be ready
wait_for_service() {
    local port="$1"
    local max_attempts=30
    local attempt=1

    log_info "Waiting for service on port $port to be ready..."

    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts"

        if curl -f -s --max-time 10 "http://localhost:$port/springboot1ngh61a2/user/login" > /dev/null 2>&1; then
            log_success "Service is ready on port $port"
            return 0
        fi

        log_info "Service not ready yet, waiting 10 seconds..."
        sleep 10
        ((attempt++))
    done

    log_error "Service failed to start on port $port after $max_attempts attempts"
    return 1
}

# Run smoke tests
run_smoke_tests() {
    local port="$1"
    log_info "Running smoke tests on port $port..."

    local tests_passed=0
    local total_tests=0

    # Test basic endpoints
    ((total_tests++))
    if curl -f -s --max-time 10 "http://localhost:$port/springboot1ngh61a2/user/login" > /dev/null 2>&1; then
        log_success "✅ Login endpoint test passed"
        ((tests_passed++))
    else
        log_error "❌ Login endpoint test failed"
    fi

    ((total_tests++))
    if curl -f -s --max-time 10 "http://localhost:$port/springboot1ngh61a2/api/courses" > /dev/null 2>&1; then
        log_success "✅ Courses API test passed"
        ((tests_passed++))
    else
        log_error "❌ Courses API test failed"
    fi

    ((total_tests++))
    if curl -f -s --max-time 10 "http://localhost:$port/springboot1ngh61a2/actuator/health" > /dev/null 2>&1; then
        log_success "✅ Health endpoint test passed"
        ((tests_passed++))
    else
        log_error "❌ Health endpoint test failed"
    fi

    local success_rate=$((tests_passed * 100 / total_tests))
    log_info "Smoke tests completed: $tests_passed/$total_tests passed ($success_rate%)"

    if [ $success_rate -ge 80 ]; then
        return 0
    else
        log_error "Smoke tests failed: success rate too low ($success_rate%)"
        return 1
    fi
}

# Backup current deployment
create_backup() {
    log_info "Creating deployment backup..."

    mkdir -p "$BACKUP_DIR"

    # Backup docker-compose files
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml "$BACKUP_DIR/"
    fi

    if [ -f ".env" ]; then
        cp .env "$BACKUP_DIR/"
    fi

    # Backup current running containers state
    if docker-compose ps -q | grep -q .; then
        docker-compose config > "$BACKUP_DIR/running-config.yml" 2>/dev/null || true
    fi

    log_success "Backup created at: $BACKUP_DIR"
}

# Rollback deployment
rollback_deployment() {
    local target_color="$1"
    log_warn "Rolling back to $target_color environment..."

    # Stop the failed environment
    if [ "$target_color" = "blue" ]; then
        docker-compose -f docker-compose.green.yml down 2>/dev/null || true
    else
        docker-compose -f docker-compose.blue.yml down 2>/dev/null || true
    fi

    # Switch traffic back to the working environment
    switch_traffic "$target_color"

    # Restore from backup if needed
    if [ -d "$BACKUP_DIR" ]; then
        log_info "Restoring configuration from backup..."
        if [ -f "$BACKUP_DIR/docker-compose.yml" ]; then
            cp "$BACKUP_DIR/docker-compose.yml" .
        fi
        if [ -f "$BACKUP_DIR/.env" ]; then
            cp "$BACKUP_DIR/.env" .
        fi
    fi

    log_success "Rollback completed"
}

# Main blue-green deployment function
perform_blue_green_deployment() {
    local start_time=$(date +%s)

    log_info "🚀 Starting blue-green deployment..."

    # Get current deployment color
    local current_color=$(get_current_color)
    local new_color
    local old_port
    local new_port

    if [ "$current_color" = "blue" ]; then
        new_color="green"
        old_port=$BLUE_PORT
        new_port=$GREEN_PORT
    else
        new_color="blue"
        old_port=$GREEN_PORT
        new_port=$BLUE_PORT
    fi

    log_info "Current environment: $current_color (port $old_port)"
    log_info "New environment: $new_color (port $new_port)"

    # Create backup
    create_backup

    # Start new environment
    log_info "🚀 Starting $new_color environment..."
    if [ "$new_color" = "blue" ]; then
        docker-compose -f docker-compose.blue.yml up -d
    else
        docker-compose -f docker-compose.green.yml up -d
    fi

    # Wait for new environment to be ready
    if ! wait_for_service "$new_port"; then
        log_error "New environment failed to start"
        rollback_deployment "$current_color"
        return 1
    fi

    # Run smoke tests
    log_info "🧪 Running smoke tests..."
    if ! run_smoke_tests "$new_port"; then
        log_error "Smoke tests failed"
        # Stop the failed environment
        if [ "$new_color" = "blue" ]; then
            docker-compose -f docker-compose.blue.yml down
        else
            docker-compose -f docker-compose.green.yml down
        fi
        rollback_deployment "$current_color"
        return 1
    fi

    # Switch traffic
    log_success "✅ Tests passed, switching traffic..."
    switch_traffic "$new_color"

    # Wait a moment for traffic to switch
    sleep 5

    # Verify the switch worked
    if curl -f -s --max-time 10 "http://localhost/springboot1ngh61a2/user/login" > /dev/null 2>&1; then
        log_success "✅ Traffic switch successful"

        # Stop old environment
        log_info "🧹 Stopping $current_color environment..."
        if [ "$current_color" = "blue" ]; then
            docker-compose -f docker-compose.blue.yml down
        else
            docker-compose -f docker-compose.green.yml down
        fi

        # Update current color
        update_current_color "$new_color"

        local end_time=$(date +%s)
        local duration=$((end_time - start_time))

        log_success "🎉 Blue-green deployment completed successfully in ${duration}s"
        return 0
    else
        log_error "Traffic switch failed"
        rollback_deployment "$current_color"
        return 1
    fi
}

# Generate deployment report
generate_deployment_report() {
    local status="$1"
    local start_time="$2"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local current_color=$(get_current_color)

    log_info "📊 Generating deployment report..."

    cat > blue-green-deployment-report.md << EOF
# 🚀 Blue-Green Deployment Report

**Deployment Time**: $(date -d "@$start_time" '+%Y-%m-%d %H:%M:%S')
**Duration**: ${duration} seconds
**Status**: $status
**Current Environment**: $current_color (Port $([ "$current_color" = "blue" ] && echo $BLUE_PORT || echo $GREEN_PORT))

## Deployment Details

- **Blue Environment**: Port $BLUE_PORT
- **Green Environment**: Port $GREEN_PORT
- **Traffic Switch**: $([ "$status" = "SUCCESS" ] && echo "Completed" || echo "Failed")

## Environment Status

### Blue Environment
- **Status**: $(docker-compose -f docker-compose.blue.yml ps --services --filter "status=running" | wc -l) services running
- **Port**: $BLUE_PORT

### Green Environment
- **Status**: $(docker-compose -f docker-compose.green.yml ps --services --filter "status=running" | wc -l) services running
- **Port**: $GREEN_PORT

## Health Checks

- **Login Endpoint**: $(curl -f -s "http://localhost:$BLUE_PORT/springboot1ngh61a2/user/login" > /dev/null 2>&1 && echo "✅ Blue" || echo "❌ Blue") | $(curl -f -s "http://localhost:$GREEN_PORT/springboot1ngh61a2/user/login" > /dev/null 2>&1 && echo "✅ Green" || echo "❌ Green")
- **Courses API**: $(curl -f -s "http://localhost:$BLUE_PORT/springboot1ngh61a2/api/courses" > /dev/null 2>&1 && echo "✅ Blue" || echo "❌ Blue") | $(curl -f -s "http://localhost:$GREEN_PORT/springboot1ngh61a2/api/courses" > /dev/null 2>&1 && echo "✅ Green" || echo "❌ Green")
- **Health Endpoint**: $(curl -f -s "http://localhost:$BLUE_PORT/springboot1ngh61a2/actuator/health" > /dev/null 2>&1 && echo "✅ Blue" || echo "❌ Blue") | $(curl -f -s "http://localhost:$GREEN_PORT/springboot1ngh61a2/actuator/health" > /dev/null 2>&1 && echo "✅ Green" || echo "❌ Green")

## Logs

- **Deployment Log**: $LOG_FILE
- **Backup Directory**: $BACKUP_DIR

---
*Generated by blue-green deployment script v$SCRIPT_VERSION*
EOF

    log_info "Deployment report generated: blue-green-deployment-report.md"
}

# Show help
show_help() {
    cat << EOF
Blue-Green Deployment Script v$SCRIPT_VERSION

Usage: $0 [options]

Options:
    --deploy       Perform blue-green deployment (default)
    --status       Show current deployment status
    --rollback     Rollback to previous environment
    --help         Show this help message

Examples:
    $0                         # Perform blue-green deployment
    $0 --deploy               # Same as above
    $0 --status               # Show deployment status
    $0 --rollback             # Rollback deployment

Environment Variables:
    BLUE_PORT     Port for blue environment (default: 8080)
    GREEN_PORT    Port for green environment (default: 8081)

EOF
}

# Show deployment status
show_status() {
    local current_color=$(get_current_color)
    local blue_running=$(docker-compose -f docker-compose.blue.yml ps --services --filter "status=running" 2>/dev/null | wc -l || echo "0")
    local green_running=$(docker-compose -f docker-compose.green.yml ps --services --filter "status=running" 2>/dev/null | wc -l || echo "0")

    echo "========================================="
    echo "Blue-Green Deployment Status"
    echo "========================================="
    echo "Current Environment: $current_color"
    echo "Blue Environment: $blue_running services running (Port: $BLUE_PORT)"
    echo "Green Environment: $green_running services running (Port: $GREEN_PORT)"
    echo ""
    echo "Active Port: $([ "$current_color" = "blue" ] && echo $BLUE_PORT || echo $GREEN_PORT)"
    echo "========================================="
}

# Main function
main() {
    local action="deploy"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --deploy)
                action="deploy"
                shift
                ;;
            --status)
                action="status"
                shift
                ;;
            --rollback)
                action="rollback"
                shift
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

    case $action in
        "deploy")
            log_info "Starting blue-green deployment process..."
            DEPLOYMENT_START_TIME=$(date +%s)

            if perform_blue_green_deployment; then
                log_success "Blue-green deployment completed successfully"
                generate_deployment_report "SUCCESS" "$DEPLOYMENT_START_TIME"
                exit 0
            else
                log_error "Blue-green deployment failed"
                generate_deployment_report "FAILED" "$DEPLOYMENT_START_TIME"
                exit 1
            fi
            ;;
        "status")
            show_status
            ;;
        "rollback")
            log_info "Starting rollback process..."
            current_color=$(get_current_color)
            target_color=$([ "$current_color" = "blue" ] && echo "green" || echo "blue")
            rollback_deployment "$target_color"
            ;;
        *)
            log_error "Unknown action: $action"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
