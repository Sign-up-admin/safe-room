#!/bin/bash
# Database Maintenance Script for Fitness Gym System
# Performs routine maintenance tasks: vacuum, analyze, reindex, cleanup

set -e

SCRIPT_VERSION="1.0.0"
LOG_FILE="/var/log/database-maintenance_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-fitness_gym}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

# Maintenance settings
VACUUM_ANALYZE=true
REINDEX_TABLES=true
CLEANUP_OLD_DATA=true
UPDATE_STATISTICS=true

# Data retention settings (days)
AUDIT_LOG_RETENTION=90
SESSION_LOG_RETENTION=30
OPERATION_LOG_RETENTION=180

# Performance monitoring
START_TIME=$(date +%s)
QUERIES_EXECUTED=0

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

# Execute SQL query with error handling
execute_sql() {
    local query="$1"
    local description="$2"

    log_info "Executing: $description"

    local result
    if result=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$query" 2>&1); then
        log_success "$description completed"
        ((QUERIES_EXECUTED++))
        echo "$result"
    else
        log_error "Failed to execute: $description"
        log_error "Error: $result"
        return 1
    fi
}

# Get database size information
get_database_size() {
    log_info "Analyzing database size..."

    local size_query="SELECT
        pg_size_pretty(pg_database_size('$DB_NAME')) as database_size,
        pg_size_pretty(sum(pg_total_relation_size(quote_ident(schemaname)||'.'||quote_ident(tablename)))) as tables_size,
        pg_size_pretty(sum(pg_total_relation_size(quote_ident(schemaname)||'.'||quote_ident(tablename)) - pg_relation_size(quote_ident(schemaname)||'.'||quote_ident(tablename)))) as indexes_size
    FROM pg_tables
    WHERE schemaname = 'public';"

    execute_sql "$size_query" "Database size analysis"
}

# Vacuum and analyze tables
perform_vacuum_analyze() {
    if [ "$VACUUM_ANALYZE" != true ]; then
        log_info "Vacuum and analyze skipped (disabled)"
        return 0
    fi

    log_info "🧹 Performing VACUUM ANALYZE on all tables..."

    # VACUUM ANALYZE to reclaim space and update statistics
    local vacuum_query="VACUUM ANALYZE;"

    if execute_sql "$vacuum_query" "VACUUM ANALYZE all tables"; then
        log_success "VACUUM ANALYZE completed successfully"

        # Get vacuum statistics
        local stats_query="SELECT
            schemaname,
            tablename,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes,
            n_live_tup as live_rows,
            n_dead_tup as dead_rows
        FROM pg_stat_user_tables
        ORDER BY n_dead_tup DESC
        LIMIT 10;"

        execute_sql "$stats_query" "Post-vacuum statistics"
    fi
}

# Reindex tables
perform_reindex() {
    if [ "$REINDEX_TABLES" != true ]; then
        log_info "Reindexing skipped (disabled)"
        return 0
    fi

    log_info "🔄 Performing REINDEX on tables..."

    # Get tables that need reindexing (high dead tuple ratio)
    local reindex_query="
    SELECT schemaname || '.' || tablename as table_name
    FROM pg_stat_user_tables
    WHERE n_dead_tup > 1000
    ORDER BY n_dead_tup DESC
    LIMIT 10;"

    local tables_to_reindex
    tables_to_reindex=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "$reindex_query" 2>/dev/null)

    if [ -z "$tables_to_reindex" ]; then
        log_info "No tables require reindexing"
        return 0
    fi

    log_info "Tables to reindex:"
    echo "$tables_to_reindex"

    # Reindex each table
    echo "$tables_to_reindex" | while read -r table_name; do
        if [ -n "$table_name" ]; then
            local reindex_cmd="REINDEX TABLE CONCURRENTLY $table_name;"
            execute_sql "$reindex_cmd" "REINDEX TABLE $table_name"
        fi
    done
}

# Clean up old data
perform_data_cleanup() {
    if [ "$CLEANUP_OLD_DATA" != true ]; then
        log_info "Data cleanup skipped (disabled)"
        return 0
    fi

    log_info "🗑️  Performing data cleanup..."

    # Clean up audit logs older than retention period
    local audit_cleanup_query="DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '$AUDIT_LOG_RETENTION days';"
    execute_sql "$audit_cleanup_query" "Cleanup audit logs older than $AUDIT_LOG_RETENTION days"

    # Clean up session logs
    local session_cleanup_query="DELETE FROM session_logs WHERE created_at < NOW() - INTERVAL '$SESSION_LOG_RETENTION days';"
    execute_sql "$session_cleanup_query" "Cleanup session logs older than $SESSION_LOG_RETENTION days"

    # Clean up operation logs
    local operation_cleanup_query="DELETE FROM operation_logs WHERE created_at < NOW() - INTERVAL '$OPERATION_LOG_RETENTION days';"
    execute_sql "$operation_cleanup_query" "Cleanup operation logs older than $OPERATION_LOG_RETENTION days"

    # Clean up expired tokens
    local token_cleanup_query="DELETE FROM tokens WHERE expires_at < NOW();"
    execute_sql "$token_cleanup_query" "Cleanup expired tokens"

    # Clean up old workout reservations (completed sessions older than 30 days)
    local reservation_cleanup_query="
    DELETE FROM workout_reservations
    WHERE status = 'completed'
    AND updated_at < NOW() - INTERVAL '30 days';"
    execute_sql "$reservation_cleanup_query" "Cleanup old completed workout reservations"

    log_success "Data cleanup completed"
}

# Update table statistics
perform_statistics_update() {
    if [ "$UPDATE_STATISTICS" != true ]; then
        log_info "Statistics update skipped (disabled)"
        return 0
    fi

    log_info "📊 Updating table statistics..."

    # ANALYZE to update statistics
    local analyze_query="ANALYZE;"

    if execute_sql "$analyze_query" "ANALYZE all tables for statistics update"; then
        log_success "Statistics update completed"

        # Show updated statistics info
        local stats_info_query="
        SELECT schemaname, tablename, last_analyze, last_autoanalyze
        FROM pg_stat_user_tables
        WHERE last_analyze IS NOT NULL
        ORDER BY last_analyze DESC
        LIMIT 5;"

        execute_sql "$stats_info_query" "Recent statistics updates"
    fi
}

# Check database health
check_database_health() {
    log_info "🏥 Checking database health..."

    # Check connection count
    local connection_query="SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';"
    execute_sql "$connection_query" "Active database connections check"

    # Check for long-running queries
    local long_queries_query="
    SELECT pid, now() - pg_stat_activity.query_start as duration, query
    FROM pg_stat_activity
    WHERE state = 'active'
    AND now() - pg_stat_activity.query_start > interval '5 minutes'
    ORDER BY duration DESC;"

    local long_queries
    long_queries=$(execute_sql "$long_queries_query" "Long-running queries check")

    if echo "$long_queries" | grep -q "rows)"; then
        log_warn "Found long-running queries - manual review recommended"
    fi

    # Check table bloat
    local bloat_query="
    SELECT schemaname, tablename,
           pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
           pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as data_size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LIMIT 5;"

    execute_sql "$bloat_query" "Table size analysis"
}

# Generate maintenance report
generate_maintenance_report() {
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))

    log_info "📊 Generating maintenance report..."

    cat > "database-maintenance-report-$(date +%Y%m%d_%H%M%S).md" << EOF
# Database Maintenance Report

**Maintenance Date**: $(date)
**Duration**: ${duration} seconds
**Database**: $DB_NAME
**Host**: $DB_HOST:$DB_PORT

## Maintenance Tasks Performed

### Vacuum and Analyze
- **Status**: $([ "$VACUUM_ANALYZE" = true ] && echo "✅ Executed" || echo "⏭️ Skipped")
- **Purpose**: Reclaim disk space and update query planner statistics

### Table Reindexing
- **Status**: $([ "$REINDEX_TABLES" = true ] && echo "✅ Executed" || echo "⏭️ Skipped")
- **Purpose**: Optimize index performance for tables with high dead tuple ratios

### Data Cleanup
- **Status**: $([ "$CLEANUP_OLD_DATA" = true ] && echo "✅ Executed" || echo "⏭️ Skipped")
- **Retention Policies**:
  - Audit logs: $AUDIT_LOG_RETENTION days
  - Session logs: $SESSION_LOG_RETENTION days
  - Operation logs: $OPERATION_LOG_RETENTION days
  - Completed reservations: 30 days

### Statistics Update
- **Status**: $([ "$UPDATE_STATISTICS" = true ] && echo "✅ Executed" || echo "⏭️ Skipped")
- **Purpose**: Ensure query optimizer has current table statistics

## Database Health Summary

### Connection Information
- **Active Connections**: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null || echo "Unknown")

### Table Statistics
- **Total Tables**: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "Unknown")
- **Queries Executed**: $QUERIES_EXECUTED

### Performance Metrics
- **Database Size**: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null || echo "Unknown")
- **Maintenance Duration**: ${duration}s

## Recommendations

### Immediate Actions
- Monitor query performance after maintenance
- Review application logs for any issues
- Verify backup integrity (recommended after maintenance)

### Scheduled Maintenance
- Run this maintenance script weekly during low-traffic periods
- Monitor database growth trends
- Review and adjust retention policies as needed

### Performance Monitoring
- Set up alerts for:
  - High connection counts (> 80% of max)
  - Slow queries (> 5 seconds)
  - High table bloat (> 50% of table size)

## Log Files

- **Maintenance Log**: $LOG_FILE
- **Database Logs**: Check PostgreSQL logs for any errors

---
*Generated by automated database maintenance script v$SCRIPT_VERSION*
EOF

    log_info "Maintenance report generated"
}

# Send notification
send_notification() {
    local status="$1"
    local message=""

    if [ "$status" = "success" ]; then
        message="✅ Database maintenance completed successfully - $QUERIES_EXECUTED queries executed"
    else
        message="❌ Database maintenance failed"
    fi

    # Send to Slack if configured
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🗄️ Database Maintenance: $message\"}" \
            "${SLACK_WEBHOOK_URL}" 2>/dev/null || true
    fi

    # Send email if configured
    if [ -n "${EMAIL_RECIPIENT:-}" ]; then
        echo "$message" | mail -s "Fitness Gym Database Maintenance $status" "${EMAIL_RECIPIENT}" 2>/dev/null || true
    fi
}

# Show help
show_help() {
    cat << EOF
Database Maintenance Script v$SCRIPT_VERSION

Usage: $0 [options]

Options:
    --no-vacuum        Skip VACUUM ANALYZE operations
    --no-reindex       Skip table reindexing
    --no-cleanup       Skip data cleanup operations
    --no-stats         Skip statistics updates
    --dry-run         Show what would be done without executing
    --help            Show this help message

Environment Variables:
    DB_HOST           Database host (default: localhost)
    DB_PORT           Database port (default: 5432)
    DB_NAME           Database name (default: fitness_gym)
    DB_USER           Database user (default: postgres)
    DB_PASSWORD       Database password (default: postgres)
    SLACK_WEBHOOK_URL Slack webhook URL for notifications
    EMAIL_RECIPIENT   Email recipient for notifications

Retention Settings:
    AUDIT_LOG_RETENTION    Audit log retention in days (default: 90)
    SESSION_LOG_RETENTION  Session log retention in days (default: 30)
    OPERATION_LOG_RETENTION Operation log retention in days (default: 180)

Description:
    This script performs comprehensive database maintenance including:
    - VACUUM ANALYZE for space reclamation and statistics
    - Table reindexing for performance optimization
    - Old data cleanup based on retention policies
    - Statistics updates for query optimization
    - Health checks and performance monitoring

Examples:
    $0                           # Run full maintenance
    $0 --no-cleanup             # Skip data cleanup
    $0 --dry-run                # Show maintenance plan

EOF
}

# Parse command line arguments
parse_arguments() {
    local dry_run=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-vacuum)
                VACUUM_ANALYZE=false
                shift
                ;;
            --no-reindex)
                REINDEX_TABLES=false
                shift
                ;;
            --no-cleanup)
                CLEANUP_OLD_DATA=false
                shift
                ;;
            --no-stats)
                UPDATE_STATISTICS=false
                shift
                ;;
            --dry-run)
                dry_run=true
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

    if [ "$dry_run" = true ]; then
        log_info "DRY RUN MODE - Showing maintenance plan:"
        echo ""
        echo "This maintenance script will perform the following tasks:"
        echo "- Database size analysis"
        echo "- Database health checks"
        if [ "$VACUUM_ANALYZE" = true ]; then echo "- VACUUM ANALYZE all tables"; fi
        if [ "$REINDEX_TABLES" = true ]; then echo "- REINDEX tables with high dead tuples"; fi
        if [ "$CLEANUP_OLD_DATA" = true ]; then echo "- Cleanup old data based on retention policies"; fi
        if [ "$UPDATE_STATISTICS" = true ]; then echo "- UPDATE table statistics"; fi
        echo ""
        echo "Use without --dry-run to execute actual maintenance."
        exit 0
    fi
}

# Main execution
main() {
    log_info "🗄️  Starting Fitness Gym Database Maintenance v$SCRIPT_VERSION"

    # Parse command line arguments
    parse_arguments "$@"

    # Pre-maintenance checks
    get_database_size
    check_database_health

    # Perform maintenance tasks
    perform_vacuum_analyze
    perform_reindex
    perform_data_cleanup
    perform_statistics_update

    # Post-maintenance checks
    get_database_size

    # Generate report
    generate_maintenance_report

    # Send notification
    send_notification "success"

    log_success "✅ Database maintenance completed successfully"
    log_info "Executed $QUERIES_EXECUTED SQL queries in $(( $(date +%s) - START_TIME )) seconds"
}

# Run main function with all arguments
main "$@"
