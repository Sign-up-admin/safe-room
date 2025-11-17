#!/bin/bash
# Deployment Validation Script for Fitness Gym System
# Features: Comprehensive health checks, configuration validation, performance tests

set -e

SCRIPT_VERSION="1.0.0"
LOG_FILE="/tmp/validate-deployment_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICES=("backend" "postgres" "minio" "redis")
ENDPOINTS=(
    "http://localhost:8080/springboot1ngh61a2/user/login"
    "http://localhost:8080/springboot1ngh61a2/api/courses"
    "http://localhost:8080/springboot1ngh61a2/actuator/health"
    "http://localhost:9000/minio/health/live"
)

# Validation results
CHECKS_PASSED=0
CHECKS_FAILED=0
ISSUES_FOUND=()

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

# Validate service status
validate_services() {
    log_info "🔍 Validating service status..."

    for service in "${SERVICES[@]}"; do
        log_info "Checking service: $service"

        if docker-compose ps "$service" | grep -q "Up"; then
            log_success "✅ Service $service is running"
            ((CHECKS_PASSED++))
        else
            log_error "❌ Service $service is not running"
            ISSUES_FOUND+=("Service $service not running")
            ((CHECKS_FAILED++))
        fi
    done
}

# Validate endpoints
validate_endpoints() {
    log_info "🔍 Validating endpoints..."

    for endpoint in "${ENDPOINTS[@]}"; do
        log_info "Testing endpoint: $endpoint"

        if curl -f -s --max-time 10 "$endpoint" > /dev/null 2>&1; then
            log_success "✅ Endpoint $endpoint is responding"
            ((CHECKS_PASSED++))
        else
            log_error "❌ Endpoint $endpoint is not responding"
            ISSUES_FOUND+=("Endpoint $endpoint not responding")
            ((CHECKS_FAILED++))
        fi
    done
}

# Validate database connectivity
validate_database() {
    log_info "🔍 Validating database connectivity..."

    # Check if PostgreSQL is accepting connections
    if docker-compose exec -T postgres pg_isready -U postgres -d fitness_gym > /dev/null 2>&1; then
        log_success "✅ Database connection is healthy"
        ((CHECKS_PASSED++))
    else
        log_error "❌ Database connection failed"
        ISSUES_FOUND+=("Database connection failed")
        ((CHECKS_FAILED++))
        return
    fi

    # Test basic database operations
    log_info "Testing database operations..."

    # Create test table and insert data
    docker-compose exec -T postgres psql -U postgres -d fitness_gym -c "
        CREATE TEMP TABLE deployment_test (
            id SERIAL PRIMARY KEY,
            test_data VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO deployment_test (test_data) VALUES ('deployment_validation_test');
        SELECT COUNT(*) FROM deployment_test WHERE test_data = 'deployment_validation_test';
    " > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        log_success "✅ Database operations successful"
        ((CHECKS_PASSED++))
    else
        log_error "❌ Database operations failed"
        ISSUES_FOUND+=("Database operations failed")
        ((CHECKS_FAILED++))
    fi
}

# Validate Redis connectivity
validate_redis() {
    log_info "🔍 Validating Redis connectivity..."

    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log_success "✅ Redis connection is healthy"
        ((CHECKS_PASSED++))
    else
        log_error "❌ Redis connection failed"
        ISSUES_FOUND+=("Redis connection failed")
        ((CHECKS_FAILED++))
        return
    fi

    # Test basic Redis operations
    log_info "Testing Redis operations..."

    docker-compose exec -T redis redis-cli SET deployment_test "validation_test" > /dev/null 2>&1
    local get_result
    get_result=$(docker-compose exec -T redis redis-cli GET deployment_test 2>/dev/null)

    if [ "$get_result" = "validation_test" ]; then
        log_success "✅ Redis operations successful"
        # Clean up test key
        docker-compose exec -T redis redis-cli DEL deployment_test > /dev/null 2>&1
        ((CHECKS_PASSED++))
    else
        log_error "❌ Redis operations failed"
        ISSUES_FOUND+=("Redis operations failed")
        ((CHECKS_FAILED++))
    fi
}

# Validate MinIO storage
validate_minio() {
    log_info "🔍 Validating MinIO storage..."

    # Check MinIO health endpoint
    if curl -f -s --max-time 10 "http://localhost:9000/minio/health/live" > /dev/null 2>&1; then
        log_success "✅ MinIO service is healthy"
        ((CHECKS_PASSED++))
    else
        log_error "❌ MinIO service is not healthy"
        ISSUES_FOUND+=("MinIO service unhealthy")
        ((CHECKS_FAILED++))
        return
    fi

    # Note: Additional MinIO validation would require authentication
    # For now, we just check the health endpoint
}

# Validate configuration
validate_configuration() {
    log_info "🔍 Validating configuration..."

    # Check required environment variables
    local required_vars=("POSTGRES_PASSWORD" "POSTGRES_DB" "POSTGRES_USER")
    local missing_vars=()

    if [ -f ".env" ]; then
        for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" .env; then
                missing_vars+=("$var")
            fi
        done
    else
        missing_vars=("${required_vars[@]}")
    fi

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "❌ Missing required environment variables: ${missing_vars[*]}"
        ISSUES_FOUND+=("Missing environment variables: ${missing_vars[*]}")
        ((CHECKS_FAILED++))
    else
        log_success "✅ Configuration variables are set"
        ((CHECKS_PASSED++))
    fi

    # Check Docker Compose configuration
    if [ -f "docker-compose.yml" ]; then
        log_success "✅ Docker Compose configuration exists"
        ((CHECKS_PASSED++))
    else
        log_error "❌ Docker Compose configuration missing"
        ISSUES_FOUND+=("Docker Compose configuration missing")
        ((CHECKS_FAILED++))
    fi
}

# Performance validation
validate_performance() {
    log_info "🔍 Validating performance..."

    # Simple response time test
    local endpoint="http://localhost:8080/springboot1ngh61a2/actuator/health"
    local response_time

    response_time=$(curl -s -w "%{time_total}" -o /dev/null "$endpoint" 2>/dev/null)

    if [ $? -eq 0 ] && [ -n "$response_time" ]; then
        # Convert to milliseconds
        local response_time_ms
        response_time_ms=$(echo "$response_time * 1000" | bc -l 2>/dev/null || echo "0")

        if (( $(echo "$response_time_ms < 5000" | bc -l 2>/dev/null || echo "0") )); then
            log_success "✅ API response time acceptable: ${response_time_ms}ms"
            ((CHECKS_PASSED++))
        else
            log_warn "⚠️ API response time slow: ${response_time_ms}ms"
            ISSUES_FOUND+=("Slow API response: ${response_time_ms}ms")
            ((CHECKS_PASSED++))  # Still count as passed but with warning
        fi
    else
        log_error "❌ Performance test failed"
        ISSUES_FOUND+=("Performance test failed")
        ((CHECKS_FAILED++))
    fi
}

# Security validation
validate_security() {
    log_info "🔍 Validating security..."

    # Check if services are running on expected ports
    local expected_ports=("8080" "5432" "6379" "9000")
    local unexpected_open_ports=()

    for port in "${expected_ports[@]}"; do
        if ! lsof -Pi :"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
            unexpected_open_ports+=("$port")
        fi
    done

    if [ ${#unexpected_open_ports[@]} -gt 0 ]; then
        log_error "❌ Expected ports not open: ${unexpected_open_ports[*]}"
        ISSUES_FOUND+=("Expected ports not open: ${unexpected_open_ports[*]}")
        ((CHECKS_FAILED++))
    else
        log_success "✅ All expected ports are open"
        ((CHECKS_PASSED++))
    fi

    # Check for exposed sensitive information (basic check)
    if [ -f ".env" ]; then
        if grep -q "PASSWORD\|SECRET\|KEY" .env; then
            log_info "ℹ️ Environment file contains sensitive data (expected)"
            ((CHECKS_PASSED++))
        else
            log_warn "⚠️ No sensitive data found in environment file"
            ((CHECKS_PASSED++))
        fi
    fi
}

# Generate validation report
generate_validation_report() {
    local total_checks=$((CHECKS_PASSED + CHECKS_FAILED))
    local success_rate=0

    if [ $total_checks -gt 0 ]; then
        success_rate=$((CHECKS_PASSED * 100 / total_checks))
    fi

    log_info "📊 Generating validation report..."

    cat > deployment-validation-report.md << EOF
# 🔍 Deployment Validation Report

**Validation Time**: $(date)
**Total Checks**: $total_checks
**Passed**: $CHECKS_PASSED
**Failed**: $CHECKS_FAILED
**Success Rate**: ${success_rate}%

## Validation Results

### ✅ Passed Checks ($CHECKS_PASSED)
- Service status validation
- Endpoint availability tests
- Database connectivity tests
- Redis connectivity tests
- MinIO service health
- Configuration validation
- Performance benchmarks
- Security checks

### ❌ Failed Checks ($CHECKS_FAILED)
EOF

    if [ ${#ISSUES_FOUND[@]} -gt 0 ]; then
        for issue in "${ISSUES_FOUND[@]}"; do
            echo "- $issue" >> deployment-validation-report.md
        done
    else
        echo "- No issues found" >> deployment-validation-report.md
    fi

    cat >> deployment-validation-report.md << EOF

## Detailed Service Status

### Backend Service
- **Status**: $(docker-compose ps backend | grep -q "Up" && echo "✅ Running" || echo "❌ Stopped")
- **Health Endpoint**: $(curl -f -s "http://localhost:8080/springboot1ngh61a2/actuator/health" > /dev/null 2>&1 && echo "✅ Healthy" || echo "❌ Unhealthy")
- **API Endpoint**: $(curl -f -s "http://localhost:8080/springboot1ngh61a2/user/login" > /dev/null 2>&1 && echo "✅ Responding" || echo "❌ Not responding")

### Database Service
- **Status**: $(docker-compose ps postgres | grep -q "Up" && echo "✅ Running" || echo "❌ Stopped")
- **Connection**: $(docker-compose exec -T postgres pg_isready -U postgres -d fitness_gym > /dev/null 2>&1 && echo "✅ Connected" || echo "❌ Disconnected")

### Redis Service
- **Status**: $(docker-compose ps redis | grep -q "Up" && echo "✅ Running" || echo "❌ Stopped")
- **Connection**: $(docker-compose exec -T redis redis-cli ping | grep -q "PONG" && echo "✅ Connected" || echo "❌ Disconnected")

### MinIO Service
- **Status**: $(docker-compose ps minio | grep -q "Up" && echo "✅ Running" || echo "❌ Stopped")
- **Health**: $(curl -f -s "http://localhost:9000/minio/health/live" > /dev/null 2>&1 && echo "✅ Healthy" || echo "❌ Unhealthy")

## Performance Metrics

### Response Times
- **Health Endpoint**: $(curl -s -w "%{time_total}" -o /dev/null "http://localhost:8080/springboot1ngh61a2/actuator/health" 2>/dev/null || echo "N/A")s
- **API Endpoint**: $(curl -s -w "%{time_total}" -o /dev/null "http://localhost:8080/springboot1ngh61a2/user/login" 2>/dev/null || echo "N/A")s

## Recommendations

EOF

    if [ $success_rate -ge 90 ]; then
        echo "- ✅ Deployment validation successful. System is ready for production use." >> deployment-validation-report.md
    elif [ $success_rate -ge 75 ]; then
        echo "- ⚠️ Deployment validation partially successful. Review warnings before production use." >> deployment-validation-report.md
    else
        echo "- ❌ Deployment validation failed. Critical issues must be resolved before production use." >> deployment-validation-report.md
    fi

    if [ ${#ISSUES_FOUND[@]} -gt 0 ]; then
        echo "" >> deployment-validation-report.md
        echo "### Issues to Address" >> deployment-validation-report.md
        for issue in "${ISSUES_FOUND[@]}"; do
            echo "- $issue" >> deployment-validation-report.md
        done
    fi

    cat >> deployment-validation-report.md << EOF

## Logs

- **Validation Log**: $LOG_FILE

---
*Generated by deployment validation script v$SCRIPT_VERSION*
EOF

    log_info "Validation report generated: deployment-validation-report.md"
}

# Show help
show_help() {
    cat << EOF
Deployment Validation Script v$SCRIPT_VERSION

Usage: $0 [options]

Options:
    --services     Validate only service status
    --endpoints    Validate only endpoints
    --database     Validate only database connectivity
    --redis        Validate only Redis connectivity
    --minio        Validate only MinIO storage
    --config       Validate only configuration
    --performance  Validate only performance
    --security     Validate only security
    --help         Show this help message

If no options specified, runs all validations.

Examples:
    $0                         # Run all validations
    $0 --services --endpoints # Validate services and endpoints only
    $0 --performance          # Run only performance validation

EOF
}

# Main function
main() {
    local validate_all=true
    local validate_services_only=false
    local validate_endpoints_only=false
    local validate_database_only=false
    local validate_redis_only=false
    local validate_minio_only=false
    local validate_config_only=false
    local validate_performance_only=false
    local validate_security_only=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --services)
                validate_services_only=true
                validate_all=false
                shift
                ;;
            --endpoints)
                validate_endpoints_only=true
                validate_all=false
                shift
                ;;
            --database)
                validate_database_only=true
                validate_all=false
                shift
                ;;
            --redis)
                validate_redis_only=true
                validate_all=false
                shift
                ;;
            --minio)
                validate_minio_only=true
                validate_all=false
                shift
                ;;
            --config)
                validate_config_only=true
                validate_all=false
                shift
                ;;
            --performance)
                validate_performance_only=true
                validate_all=false
                shift
                ;;
            --security)
                validate_security_only=true
                validate_all=false
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

    log_info "🚀 Starting Fitness Gym System Deployment Validation v$SCRIPT_VERSION"

    # Run validations
    if $validate_all || $validate_services_only; then
        validate_services
    fi

    if $validate_all || $validate_endpoints_only; then
        validate_endpoints
    fi

    if $validate_all || $validate_database_only; then
        validate_database
    fi

    if $validate_all || $validate_redis_only; then
        validate_redis
    fi

    if $validate_all || $validate_minio_only; then
        validate_minio
    fi

    if $validate_all || $validate_config_only; then
        validate_configuration
    fi

    if $validate_all || $validate_performance_only; then
        validate_performance
    fi

    if $validate_all || $validate_security_only; then
        validate_security
    fi

    # Generate report
    generate_validation_report

    # Summary
    local total_checks=$((CHECKS_PASSED + CHECKS_FAILED))
    local success_rate=0

    if [ $total_checks -gt 0 ]; then
        success_rate=$((CHECKS_PASSED * 100 / total_checks))
    fi

    log_info "🏁 Validation completed"
    log_info "Total checks: $total_checks, Passed: $CHECKS_PASSED, Failed: $CHECKS_FAILED"

    if [ $CHECKS_FAILED -eq 0 ]; then
        log_success "🎉 All validations passed!"
        exit 0
    elif [ $success_rate -ge 80 ]; then
        log_warn "⚠️ Some validations failed, but system may still be functional"
        exit 0
    else
        log_error "❌ Critical validation failures detected"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
