#!/bin/bash

# Test Quality Gate Script for Linux/macOS
# Checks test results, coverage, and quality metrics

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

TEST_REPORT_PATH="${TEST_REPORT_PATH:-$PROJECT_ROOT/springboot1ngh61a2/target/surefire-reports}"
COVERAGE_REPORT_PATH="${COVERAGE_REPORT_PATH:-$PROJECT_ROOT/springboot1ngh61a2/target/site/jacoco/jacoco.xml}"
CONFIG_FILE="${CONFIG_FILE:-$PROJECT_ROOT/springboot1ngh61a2/.test-config.json}"

# Default configuration
TEST_FAILURE_THRESHOLD=0
LINE_COVERAGE_MIN=65
BRANCH_COVERAGE_MIN=45
INSTRUCTION_COVERAGE_MIN=65
METHOD_COVERAGE_MIN=75
CLASS_COVERAGE_MIN=90
CONTROLLER_COVERAGE_MIN=30
SERVICE_COVERAGE_MIN=60
MAX_TEST_DURATION=1800

# Load custom configuration if exists
if [ -f "$CONFIG_FILE" ]; then
    echo "Loading configuration from: $CONFIG_FILE"
    if command -v jq &> /dev/null; then
        TEST_FAILURE_THRESHOLD=$(jq -r '.testFailureThreshold // 0' "$CONFIG_FILE")
        LINE_COVERAGE_MIN=$(jq -r '.coverageThresholds.line // 65' "$CONFIG_FILE")
        BRANCH_COVERAGE_MIN=$(jq -r '.coverageThresholds.branch // 45' "$CONFIG_FILE")
        CONTROLLER_COVERAGE_MIN=$(jq -r '.coverageThresholds.controller // 30' "$CONFIG_FILE")
        SERVICE_COVERAGE_MIN=$(jq -r '.coverageThresholds.service // 60' "$CONFIG_FILE")
        MAX_TEST_DURATION=$(jq -r '.maxTestDuration // 1800' "$CONFIG_FILE")
    else
        echo "Warning: jq not available, using default configuration"
    fi
fi

# Results tracking
FAILED_CHECKS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test results analysis
analyze_test_results() {
    log_info "Analyzing test results..."

    if [ ! -d "$TEST_REPORT_PATH" ]; then
        log_error "Test report path not found: $TEST_REPORT_PATH"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi

    local total_tests=0
    local failed_tests=0
    local error_tests=0
    local skipped_tests=0

    # Parse XML files using grep (fallback if xmlstarlet not available)
    for xml_file in "$TEST_REPORT_PATH"/*.xml; do
        if [ -f "$xml_file" ]; then
            # Extract test counts using grep
            tests=$(grep -oP '(?<=tests=")[^"]*' "$xml_file" | head -1)
            failures=$(grep -oP '(?<=failures=")[^"]*' "$xml_file" | head -1)
            errors=$(grep -oP '(?<=errors=")[^"]*' "$xml_file" | head -1)
            skipped=$(grep -oP '(?<=skipped=")[^"]*' "$xml_file" | head -1)

            total_tests=$((total_tests + ${tests:-0}))
            failed_tests=$((failed_tests + ${failures:-0}))
            error_tests=$((error_tests + ${errors:-0}))
            skipped_tests=$((skipped_tests + ${skipped:-0}))
        fi
    done

    local passed_tests=$((total_tests - failed_tests - error_tests - skipped_tests))
    local total_failures=$((failed_tests + error_tests))

    log_info "Test Results: Total=$total_tests, Passed=$passed_tests, Failed=$failed_tests, Errors=$error_tests, Skipped=$skipped_tests"

    if [ $total_failures -gt $TEST_FAILURE_THRESHOLD ]; then
        log_error "Test failures ($total_failures) exceed threshold ($TEST_FAILURE_THRESHOLD)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    else
        log_success "Test failures within acceptable threshold"
    fi

    # Export for report generation
    export TEST_TOTAL=$total_tests
    export TEST_PASSED=$passed_tests
    export TEST_FAILED=$failed_tests
    export TEST_ERRORS=$error_tests
    export TEST_SKIPPED=$skipped_tests
}

# Coverage analysis
analyze_coverage() {
    log_info "Analyzing coverage results..."

    if [ ! -f "$COVERAGE_REPORT_PATH" ]; then
        log_error "Coverage report not found: $COVERAGE_REPORT_PATH"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi

    # Check if xmlstarlet is available
    if command -v xmlstarlet &> /dev/null; then
        # Use xmlstarlet for precise parsing
        LINE_COVERAGE=$(xmlstarlet sel -t -v "//report/counter[@type='LINE']/@covered" "$COVERAGE_REPORT_PATH" | head -1)
        LINE_TOTAL=$(xmlstarlet sel -t -v "//report/counter[@type='LINE']/@total" "$COVERAGE_REPORT_PATH" | head -1)
        LINE_PERCENTAGE=$(awk "BEGIN {printf \"%.2f\", ($LINE_COVERAGE/$LINE_TOTAL)*100}")

        BRANCH_COVERAGE=$(xmlstarlet sel -t -v "//report/counter[@type='BRANCH']/@covered" "$COVERAGE_REPORT_PATH" | head -1)
        BRANCH_TOTAL=$(xmlstarlet sel -t -v "//report/counter[@type='BRANCH']/@total" "$COVERAGE_REPORT_PATH" | head -1)
        BRANCH_PERCENTAGE=$(awk "BEGIN {printf \"%.2f\", ($BRANCH_COVERAGE/$BRANCH_TOTAL)*100}")

        INSTRUCTION_COVERAGE=$(xmlstarlet sel -t -v "//report/counter[@type='INSTRUCTION']/@covered" "$COVERAGE_REPORT_PATH" | head -1)
        INSTRUCTION_TOTAL=$(xmlstarlet sel -t -v "//report/counter[@type='INSTRUCTION']/@total" "$COVERAGE_REPORT_PATH" | head -1)
        INSTRUCTION_PERCENTAGE=$(awk "BEGIN {printf \"%.2f\", ($INSTRUCTION_COVERAGE/$INSTRUCTION_TOTAL)*100}")

        METHOD_COVERAGE=$(xmlstarlet sel -t -v "//report/counter[@type='METHOD']/@covered" "$COVERAGE_REPORT_PATH" | head -1)
        METHOD_TOTAL=$(xmlstarlet sel -t -v "//report/counter[@type='METHOD']/@total" "$COVERAGE_REPORT_PATH" | head -1)
        METHOD_PERCENTAGE=$(awk "BEGIN {printf \"%.2f\", ($METHOD_COVERAGE/$METHOD_TOTAL)*100}")

        CLASS_COVERAGE=$(xmlstarlet sel -t -v "//report/counter[@type='CLASS']/@covered" "$COVERAGE_REPORT_PATH" | head -1)
        CLASS_TOTAL=$(xmlstarlet sel -t -v "//report/counter[@type='CLASS']/@total" "$COVERAGE_REPORT_PATH" | head -1)
        CLASS_PERCENTAGE=$(awk "BEGIN {printf \"%.2f\", ($CLASS_COVERAGE/$CLASS_TOTAL)*100}")

        # Package-level coverage
        CONTROLLER_LINE_COVERAGE=$(xmlstarlet sel -t -v "//package[contains(@name,'controller')]/counter[@type='LINE']/@covered" "$COVERAGE_REPORT_PATH" | paste -sd+ | bc 2>/dev/null || echo "0")
        CONTROLLER_LINE_TOTAL=$(xmlstarlet sel -t -v "//package[contains(@name,'controller')]/counter[@type='LINE']/@total" "$COVERAGE_REPORT_PATH" | paste -sd+ | bc 2>/dev/null || echo "1")
        CONTROLLER_LINE_PERCENTAGE=$(awk "BEGIN {printf \"%.2f\", ($CONTROLLER_LINE_COVERAGE/$CONTROLLER_LINE_TOTAL)*100}")

        SERVICE_LINE_COVERAGE=$(xmlstarlet sel -t -v "//package[contains(@name,'service')]/counter[@type='LINE']/@covered" "$COVERAGE_REPORT_PATH" | paste -sd+ | bc 2>/dev/null || echo "0")
        SERVICE_LINE_TOTAL=$(xmlstarlet sel -t -v "//package[contains(@name,'service')]/counter[@type='LINE']/@total" "$COVERAGE_REPORT_PATH" | paste -sd+ | bc 2>/dev/null || echo "1")
        SERVICE_LINE_PERCENTAGE=$(awk "BEGIN {printf \"%.2f\", ($SERVICE_LINE_COVERAGE/$SERVICE_LINE_TOTAL)*100}")

    else
        # Fallback to grep-based parsing (less accurate)
        log_warning "xmlstarlet not available, using fallback parsing"
        LINE_COVERAGE=$(grep -oP '(?<=<counter type="LINE" covered=")[^"]*' "$COVERAGE_REPORT_PATH" | head -1)
        BRANCH_COVERAGE=$(grep -oP '(?<=<counter type="BRANCH" covered=")[^"]*' "$COVERAGE_REPORT_PATH" | head -1)
        # Simplified percentage calculation
        LINE_PERCENTAGE="N/A"
        BRANCH_PERCENTAGE="N/A"
        INSTRUCTION_PERCENTAGE="N/A"
        METHOD_PERCENTAGE="N/A"
        CLASS_PERCENTAGE="N/A"
        CONTROLLER_LINE_PERCENTAGE="N/A"
        SERVICE_LINE_PERCENTAGE="N/A"
    fi

    log_info "Coverage Results: Line=${LINE_PERCENTAGE}%, Branch=${BRANCH_PERCENTAGE}%, Method=${METHOD_PERCENTAGE}%, Class=${CLASS_PERCENTAGE}%"
    log_info "Package Coverage: Controller=${CONTROLLER_LINE_PERCENTAGE}%, Service=${SERVICE_LINE_PERCENTAGE}%"

    # Export for report generation
    export COVERAGE_LINE=$LINE_PERCENTAGE
    export COVERAGE_BRANCH=$BRANCH_PERCENTAGE
    export COVERAGE_INSTRUCTION=$INSTRUCTION_PERCENTAGE
    export COVERAGE_METHOD=$METHOD_PERCENTAGE
    export COVERAGE_CLASS=$CLASS_PERCENTAGE
    export COVERAGE_CONTROLLER=$CONTROLLER_LINE_PERCENTAGE
    export COVERAGE_SERVICE=$SERVICE_LINE_PERCENTAGE

    # Check coverage thresholds (skip if N/A)
    if [ "$LINE_PERCENTAGE" != "N/A" ] && (( $(echo "$LINE_PERCENTAGE < $LINE_COVERAGE_MIN" | bc -l 2>/dev/null || echo "1") )); then
        log_error "Line coverage (${LINE_PERCENTAGE}%) below threshold ($LINE_COVERAGE_MIN%)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi

    if [ "$BRANCH_PERCENTAGE" != "N/A" ] && (( $(echo "$BRANCH_PERCENTAGE < $BRANCH_COVERAGE_MIN" | bc -l 2>/dev/null || echo "1") )); then
        log_error "Branch coverage (${BRANCH_PERCENTAGE}%) below threshold ($BRANCH_COVERAGE_MIN%)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi

    if [ "$CONTROLLER_LINE_PERCENTAGE" != "N/A" ] && (( $(echo "$CONTROLLER_LINE_PERCENTAGE < $CONTROLLER_COVERAGE_MIN" | bc -l 2>/dev/null || echo "1") )); then
        log_error "Controller coverage (${CONTROLLER_LINE_PERCENTAGE}%) below threshold ($CONTROLLER_COVERAGE_MIN%)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi

    if [ "$SERVICE_LINE_PERCENTAGE" != "N/A" ] && (( $(echo "$SERVICE_LINE_PERCENTAGE < $SERVICE_COVERAGE_MIN" | bc -l 2>/dev/null || echo "1") )); then
        log_error "Service coverage (${SERVICE_LINE_PERCENTAGE}%) below threshold ($SERVICE_COVERAGE_MIN%)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# Quality metrics analysis
analyze_quality_metrics() {
    log_info "Analyzing quality metrics..."

    local build_errors=0
    local build_warnings=0
    local test_duration=0

    # Check build logs
    local build_log="$TEST_REPORT_PATH/../build.log"
    if [ -f "$build_log" ]; then
        build_errors=$(grep -c "ERROR\|error" "$build_log" 2>/dev/null || echo "0")
        build_warnings=$(grep -c "WARNING\|warning" "$build_log" 2>/dev/null || echo "0")

        log_info "Build Quality: Errors=$build_errors, Warnings=$build_warnings"

        if [ "$build_errors" -gt 0 ]; then
            log_error "Build errors detected: $build_errors"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi

        if [ "$build_warnings" -gt 50 ]; then
            log_warning "High number of build warnings: $build_warnings"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi

    # Check test execution time
    local duration_file="$TEST_REPORT_PATH/../test-duration.txt"
    if [ -f "$duration_file" ]; then
        test_duration=$(cat "$duration_file" 2>/dev/null || echo "0")
        log_info "Test Execution Time: ${test_duration} seconds"

        if [ "$test_duration" -gt "$MAX_TEST_DURATION" ]; then
            log_warning "Test execution time exceeds maximum ($MAX_TEST_DURATION seconds)"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi

    # Export for report generation
    export BUILD_ERRORS=$build_errors
    export BUILD_WARNINGS=$build_warnings
    export TEST_DURATION=$test_duration
}

# Generate quality gate report
generate_report() {
    log_info "Generating quality gate report..."

    local timestamp=$(date +%Y%m%d_%H%M%S)
    local report_file="quality-gate-report-${timestamp}.md"

    cat > "$report_file" << EOF
# Quality Gate Report

**Generated**: $(date)
**Test Reports**: $TEST_REPORT_PATH
**Coverage Report**: $COVERAGE_REPORT_PATH
**Configuration**: $CONFIG_FILE

## Executive Summary

**Status**: $([ $FAILED_CHECKS -gt 0 ] && echo "❌ FAILED" || echo "✅ PASSED")
**Failed Checks**: $FAILED_CHECKS
**Warnings**: $WARNINGS

## Test Results

- **Total Tests**: ${TEST_TOTAL:-0}
- **Passed**: ${TEST_PASSED:-0}
- **Failed**: ${TEST_FAILED:-0}
- **Errors**: ${TEST_ERRORS:-0}
- **Skipped**: ${TEST_SKIPPED:-0}

## Coverage Metrics

- **Line Coverage**: ${COVERAGE_LINE:-0}%
- **Branch Coverage**: ${COVERAGE_BRANCH:-0}%
- **Instruction Coverage**: ${COVERAGE_INSTRUCTION:-0}%
- **Method Coverage**: ${COVERAGE_METHOD:-0}%
- **Class Coverage**: ${COVERAGE_CLASS:-0}%
- **Controller Coverage**: ${COVERAGE_CONTROLLER:-0}%
- **Service Coverage**: ${COVERAGE_SERVICE:-0}%

## Quality Metrics

- **Build Errors**: ${BUILD_ERRORS:-0}
- **Build Warnings**: ${BUILD_WARNINGS:-0}
- **Test Duration**: ${TEST_DURATION:-0} seconds

## Thresholds

- **Test Failure Threshold**: $TEST_FAILURE_THRESHOLD
- **Line Coverage Minimum**: $LINE_COVERAGE_MIN%
- **Branch Coverage Minimum**: $BRANCH_COVERAGE_MIN%
- **Controller Coverage Minimum**: $CONTROLLER_COVERAGE_MIN%
- **Service Coverage Minimum**: $SERVICE_COVERAGE_MIN%
- **Max Test Duration**: $MAX_TEST_DURATION seconds

---

*Generated by Test Quality Gate Script v1.0.0*
EOF

    log_info "Quality gate report saved to: $report_file"
    echo "$report_file"
}

# Main execution
main() {
    log_info "Starting Test Quality Gate Analysis..."
    log_info "Test Reports: $TEST_REPORT_PATH"
    log_info "Coverage Report: $COVERAGE_REPORT_PATH"

    # Run all analyses
    analyze_test_results
    analyze_coverage
    analyze_quality_metrics

    # Generate report
    local report_file=$(generate_report)

    # Summary
    echo
    echo -e "${BLUE}$(printf '%.0s=' {1..60})${NC}"
    echo -e "${BLUE}           QUALITY GATE SUMMARY${NC}"
    echo -e "${BLUE}$(printf '%.0s=' {1..60})${NC}"

    if [ $FAILED_CHECKS -gt 0 ]; then
        echo -e "${RED}Failed Checks: $FAILED_CHECKS${NC}"
    else
        echo -e "${GREEN}Failed Checks: $FAILED_CHECKS${NC}"
    fi

    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
    else
        echo -e "${GREEN}Warnings: $WARNINGS${NC}"
    fi

    echo

    if [ $FAILED_CHECKS -gt 0 ]; then
        log_error "QUALITY GATE FAILED - $FAILED_CHECKS checks failed"
        log_info "Report saved to: $report_file"
        exit 1
    else
        log_success "QUALITY GATE PASSED - All checks successful"
        if [ $WARNINGS -gt 0 ]; then
            log_warning "$WARNINGS warnings detected - consider addressing"
        fi
        exit 0
    fi
}

# Run main function
main "$@"
