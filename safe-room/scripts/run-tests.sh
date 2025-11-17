#!/bin/bash
# Automated Test Runner for Fitness Gym System
# Features: Unit tests, Integration tests, E2E tests, Performance tests

set -e

SCRIPT_VERSION="1.0.0"
LOG_FILE="/tmp/fitness-gym-tests_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Test configuration
BACKEND_DIR="springboot1ngh61a2"
FRONTEND_DIR="$BACKEND_DIR/src/main/resources/front/front"
ADMIN_DIR="$BACKEND_DIR/src/main/resources/admin/admin"

# Test results
TEST_RESULTS=()
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Run backend unit tests
run_backend_unit_tests() {
    log_info "🏃 Running backend unit tests..."

    if [ ! -d "$BACKEND_DIR" ]; then
        log_error "Backend directory not found: $BACKEND_DIR"
        return 1
    fi

    cd "$BACKEND_DIR"

    # Run Maven tests
    if mvn test -Dspring.profiles.active=test -q; then
        log_success "Backend unit tests passed"
        TEST_RESULTS+=("backend_unit: PASSED")
        ((PASSED_TESTS++))
    else
        log_error "Backend unit tests failed"
        TEST_RESULTS+=("backend_unit: FAILED")
        ((FAILED_TESTS++))
    fi

    ((TOTAL_TESTS++))
    cd - > /dev/null
}

# Run frontend unit tests
run_frontend_unit_tests() {
    local project_name="$1"
    local project_dir="$2"

    log_info "🏃 Running $project_name frontend unit tests..."

    if [ ! -d "$project_dir" ]; then
        log_warn "$project_name directory not found: $project_dir"
        return 0
    fi

    cd "$project_dir"

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies for $project_name..."
        npm ci
    fi

    # Run unit tests
    if npm run test:unit; then
        log_success "$project_name frontend unit tests passed"
        TEST_RESULTS+=("${project_name}_unit: PASSED")
        ((PASSED_TESTS++))
    else
        log_error "$project_name frontend unit tests failed"
        TEST_RESULTS+=("${project_name}_unit: FAILED")
        ((FAILED_TESTS++))
    fi

    ((TOTAL_TESTS++))
    cd - > /dev/null
}

# Run integration tests
run_integration_tests() {
    log_info "🔗 Running integration tests..."

    # Start test environment with Docker Compose
    if [ -f "docker-compose.test.yml" ]; then
        log_info "Starting test environment..."

        # Clean up any existing containers
        docker-compose -f docker-compose.test.yml down -v 2>/dev/null || true

        # Start services
        if docker-compose -f docker-compose.test.yml up --abort-on-container-exit --timeout 300; then
            log_success "Integration tests passed"
            TEST_RESULTS+=("integration: PASSED")
            ((PASSED_TESTS++))
        else
            log_error "Integration tests failed"
            TEST_RESULTS+=("integration: FAILED")
            ((FAILED_TESTS++))
        fi

        # Clean up
        docker-compose -f docker-compose.test.yml down -v 2>/dev/null || true
    else
        log_warn "Integration test configuration not found: docker-compose.test.yml"
        log_info "Skipping integration tests"
        TEST_RESULTS+=("integration: SKIPPED")
    fi

    ((TOTAL_TESTS++))
}

# Run E2E tests
run_e2e_tests() {
    log_info "🌐 Running E2E tests..."

    # Check if Playwright is available
    if command -v npx &> /dev/null; then
        # Run E2E tests for frontend
        if [ -d "$FRONTEND_DIR" ]; then
            cd "$FRONTEND_DIR"

            if npm run test:e2e; then
                log_success "Frontend E2E tests passed"
                TEST_RESULTS+=("frontend_e2e: PASSED")
                ((PASSED_TESTS++))
            else
                log_error "Frontend E2E tests failed"
                TEST_RESULTS+=("frontend_e2e: FAILED")
                ((FAILED_TESTS++))
            fi

            cd - > /dev/null
        fi

        # Run E2E tests for admin
        if [ -d "$ADMIN_DIR" ]; then
            cd "$ADMIN_DIR"

            if npm run test:e2e; then
                log_success "Admin E2E tests passed"
                TEST_RESULTS+=("admin_e2e: PASSED")
                ((PASSED_TESTS++))
            else
                log_error "Admin E2E tests failed"
                TEST_RESULTS+=("admin_e2e: FAILED")
                ((FAILED_TESTS++))
            fi

            cd - > /dev/null
        fi
    else
        log_warn "E2E test tools not available (npx not found)"
        TEST_RESULTS+=("e2e: SKIPPED")
    fi

    ((TOTAL_TESTS++))
}

# Run performance tests
run_performance_tests() {
    log_info "⚡ Running performance tests..."

    # Check if Artillery is available
    if command -v npx &> /dev/null && [ -f "artillery-config.yml" ]; then
        if npx artillery run --output performance-results.json artillery-config.yml; then
            log_success "Performance tests passed"
            TEST_RESULTS+=("performance: PASSED")
            ((PASSED_TESTS++))
        else
            log_error "Performance tests failed"
            TEST_RESULTS+=("performance: FAILED")
            ((FAILED_TESTS++))
        fi
    else
        log_warn "Performance test configuration not found or Artillery not available"
        TEST_RESULTS+=("performance: SKIPPED")
    fi

    ((TOTAL_TESTS++))
}

# Generate test report
generate_test_report() {
    log_info "📊 Generating test report..."

    local report_file="test-report-$(date +%Y%m%d_%H%M%S).md"

    cat > "$report_file" << EOF
# 🧪 Fitness Gym System Test Report

**Generated**: $(date)
**Total Tests**: $TOTAL_TESTS
**Passed**: $PASSED_TESTS
**Failed**: $FAILED_TESTS
**Success Rate**: $(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")%

## Test Results

EOF

    for result in "${TEST_RESULTS[@]}"; do
        echo "- $result" >> "$report_file"
    done

    cat >> "$report_file" << EOF

## Test Execution Details

**Backend Unit Tests**: $(mvn --version 2>/dev/null | head -1 || echo "Maven not available")
**Frontend Unit Tests**: $(node --version 2>/dev/null || echo "Node.js not available")
**Integration Tests**: Docker Compose $(docker-compose --version 2>/dev/null || echo "not available")
**E2E Tests**: $(npx playwright --version 2>/dev/null || echo "Playwright not available")
**Performance Tests**: $(npx artillery --version 2>/dev/null || echo "Artillery not available")

## Log File

Test execution log: $LOG_FILE

---
*Generated by automated test runner v$SCRIPT_VERSION*
EOF

    log_info "Test report generated: $report_file"
}

# Main function
main() {
    local run_all=true
    local test_type=""

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --unit)
                test_type="unit"
                run_all=false
                shift
                ;;
            --integration)
                test_type="integration"
                run_all=false
                shift
                ;;
            --e2e)
                test_type="e2e"
                run_all=false
                shift
                ;;
            --performance)
                test_type="performance"
                run_all=false
                shift
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --unit        Run only unit tests"
                echo "  --integration Run only integration tests"
                echo "  --e2e         Run only E2E tests"
                echo "  --performance Run only performance tests"
                echo "  --help        Show this help"
                echo ""
                echo "If no options specified, runs all tests."
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    log_info "🚀 Starting Fitness Gym System Test Suite v$SCRIPT_VERSION"

    # Run specific test type or all tests
    case $test_type in
        "unit")
            run_backend_unit_tests
            run_frontend_unit_tests "frontend" "$FRONTEND_DIR"
            run_frontend_unit_tests "admin" "$ADMIN_DIR"
            ;;
        "integration")
            run_integration_tests
            ;;
        "e2e")
            run_e2e_tests
            ;;
        "performance")
            run_performance_tests
            ;;
        *)
            # Run all tests
            run_backend_unit_tests
            run_frontend_unit_tests "frontend" "$FRONTEND_DIR"
            run_frontend_unit_tests "admin" "$ADMIN_DIR"
            run_integration_tests
            run_e2e_tests
            run_performance_tests
            ;;
    esac

    # Generate report
    generate_test_report

    # Summary
    log_info "🏁 Test execution completed"
    log_info "Total: $TOTAL_TESTS, Passed: $PASSED_TESTS, Failed: $FAILED_TESTS"

    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "🎉 All tests passed!"
        exit 0
    else
        log_error "❌ Some tests failed. Check the log file: $LOG_FILE"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
