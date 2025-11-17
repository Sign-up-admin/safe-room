#!/bin/bash
# Backup Verification Script for Fitness Gym System
# Features: File integrity checks, restore testing, and backup validation

set -e

SCRIPT_VERSION="1.0.0"
LOG_FILE="/tmp/backup-verification_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEMP_DIR="${TEMP_DIR:-/tmp/backup-verification}"
RESTORE_TEST_DB="${RESTORE_TEST_DB:-fitness_gym_restore_test}"

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-fitness_gym}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

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

# Validate environment
validate_environment() {
    log_info "Validating environment..."

    # Check if required tools are available
    if ! command -v pg_restore &> /dev/null && ! command -v psql &> /dev/null; then
        log_error "PostgreSQL tools are not available"
        exit 1
    fi

    if ! command -v file &> /dev/null; then
        log_warn "file command not available - file type detection will be limited"
    fi

    # Create temporary directory
    mkdir -p "$TEMP_DIR"

    # Test database connection
    if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        log_error "Cannot connect to database"
        exit 1
    fi

    log_success "Environment validation completed"
}

# Detect file type
detect_file_type() {
    local file="$1"

    if command -v file &> /dev/null; then
        file "$file" | head -1
    else
        # Basic detection based on extension
        case "$file" in
            *.sql)
                echo "ASCII text (SQL dump)"
                ;;
            *.sql.gz)
                echo "gzip compressed data (SQL dump)"
                ;;
            *.sql.enc)
                echo "encrypted data (SQL dump)"
                ;;
            *.tar.gz)
                echo "gzip compressed tar archive"
                ;;
            *)
                echo "unknown file type"
                ;;
        esac
    fi
}

# Check file integrity
check_file_integrity() {
    local file="$1"

    log_info "Checking file integrity: $file"

    # Check if file exists
    if [ ! -f "$file" ]; then
        log_error "Backup file does not exist: $file"
        return 1
    fi

    # Check file size
    local file_size
    file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")

    if [ "$file_size" -eq 0 ]; then
        log_error "Backup file is empty: $file"
        return 1
    fi

    log_info "File size: $file_size bytes"

    # Detect file type
    local file_type
    file_type=$(detect_file_type "$file")
    log_info "File type: $file_type"

    # Check if file is readable
    if [ ! -r "$file" ]; then
        log_error "Backup file is not readable: $file"
        return 1
    fi

    # Check for corruption (basic checks)
    case "$file" in
        *.gz)
            if ! gzip -t "$file" 2>/dev/null; then
                log_error "Compressed file appears to be corrupted: $file"
                return 1
            fi
            ;;
        *.sql)
            # Check if file contains valid SQL (very basic check)
            if ! head -1 "$file" | grep -q -i "postgresql\|pg_dump\|sql" 2>/dev/null; then
                log_warn "File does not appear to be a valid SQL dump: $file"
            fi
            ;;
    esac

    log_success "File integrity check passed"
    return 0
}

# Calculate and verify file hash
calculate_file_hash() {
    local file="$1"

    log_info "Calculating file hash..."

    if command -v sha256sum &> /dev/null; then
        sha256sum "$file" | awk '{print $1}'
    elif command -v shasum &> /dev/null; then
        shasum -a 256 "$file" | awk '{print $1}'
    else
        log_warn "No hash calculation tool available"
        echo "no_hash_available"
    fi
}

# Decrypt backup file if needed
decrypt_backup() {
    local input_file="$1"
    local output_file="$2"
    local encryption_key="$3"

    if [[ "$input_file" != *.enc ]]; then
        # File is not encrypted, just copy
        cp "$input_file" "$output_file"
        echo "$output_file"
        return 0
    fi

    if [ -z "$encryption_key" ]; then
        log_error "Encryption key required for encrypted backup"
        return 1
    fi

    log_info "Decrypting backup file..."

    if openssl enc -d -aes-256-cbc -in "$input_file" -out "$output_file" -k "$encryption_key"; then
        log_success "Decryption completed"
        echo "$output_file"
    else
        log_error "Decryption failed"
        return 1
    fi
}

# Decompress backup file if needed
decompress_backup() {
    local input_file="$1"
    local output_file="$2"

    if [[ "$input_file" != *.gz ]]; then
        # File is not compressed, just copy
        cp "$input_file" "$output_file"
        echo "$output_file"
        return 0
    fi

    log_info "Decompressing backup file..."

    if gzip -dc "$input_file" > "$output_file"; then
        log_success "Decompression completed"
        echo "$output_file"
    else
        log_error "Decompression failed"
        return 1
    fi
}

# Test restore to temporary database
test_restore() {
    local backup_file="$1"
    local encryption_key="$2"

    log_info "Testing backup restore..."

    # Create temporary database
    local test_db="${RESTORE_TEST_DB}_$(date +%s)"

    log_info "Creating temporary database: $test_db"

    if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $test_db;" > /dev/null 2>&1; then
        log_error "Failed to create temporary database"
        return 1
    fi

    # Prepare backup file for restore
    local working_file="$TEMP_DIR/backup_working.sql"

    # Decrypt if needed
    local decrypted_file
    decrypted_file=$(decrypt_backup "$backup_file" "$TEMP_DIR/backup_decrypted.sql" "$encryption_key")
    if [ $? -ne 0 ]; then
        cleanup_test_db "$test_db"
        return 1
    fi

    # Decompress if needed
    local decompressed_file
    decompressed_file=$(decompress_backup "$decrypted_file" "$working_file")
    if [ $? -ne 0 ]; then
        cleanup_test_db "$test_db"
        return 1
    fi

    # Attempt restore
    log_info "Restoring backup to temporary database..."

    if [[ "$working_file" == *.sql ]]; then
        # Plain SQL dump
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$test_db" -f "$working_file" > /dev/null 2>&1; then
            log_success "SQL restore completed"
        else
            log_error "SQL restore failed"
            cleanup_test_db "$test_db"
            return 1
        fi
    else
        # Custom format dump
        if PGPASSWORD="$DB_PASSWORD" pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$test_db" "$working_file" > /dev/null 2>&1; then
            log_success "pg_restore completed"
        else
            log_error "pg_restore failed"
            cleanup_test_db "$test_db"
            return 1
        fi
    fi

    # Verify restore by checking some basic tables
    log_info "Verifying restored data..."

    local table_count
    table_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$test_db" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" -t | tr -d ' ')

    if [ "$table_count" -gt 0 ]; then
        log_success "Restore verification passed - $table_count tables found"

        # Try to get record count from a common table
        local record_count
        record_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$test_db" -c "SELECT COUNT(*) FROM users;" -t 2>/dev/null | tr -d ' ' || echo "0")
        log_info "Sample table (users) contains $record_count records"
    else
        log_error "Restore verification failed - no tables found"
        cleanup_test_db "$test_db"
        return 1
    fi

    # Clean up
    cleanup_test_db "$test_db"

    log_success "Restore test completed successfully"
    return 0
}

# Clean up temporary database
cleanup_test_db() {
    local test_db="$1"

    log_info "Cleaning up temporary database: $test_db"

    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $test_db;" > /dev/null 2>&1 || true
}

# Generate verification report
generate_verification_report() {
    local backup_file="$1"
    local file_integrity="$2"
    local file_hash="$3"
    local restore_test="$4"
    local start_time="$5"
    local end_time="$6"

    local duration=$((end_time - start_time))

    cat > "${backup_file}.verification.md" << EOF
# Backup Verification Report

**Backup File**: $backup_file
**Verification Time**: $(date -d "@$start_time" '+%Y-%m-%d %H:%M:%S')
**Duration**: ${duration} seconds

## Verification Results

### File Integrity Check
**Status**: $([ "$file_integrity" = "PASSED" ] && echo "✅ PASSED" || echo "❌ FAILED")
**File Size**: $(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null || echo "Unknown") bytes
**File Type**: $(detect_file_type "$backup_file")

### File Hash
**SHA256**: $file_hash

### Restore Test
**Status**: $([ "$restore_test" = "PASSED" ] && echo "✅ PASSED" || echo "❌ FAILED")
**Test Database**: $RESTORE_TEST_DB

## Database Information
- **Host**: $DB_HOST:$DB_PORT
- **Database**: $DB_NAME
- **User**: $DB_USER

## Verification Summary

EOF

    if [ "$file_integrity" = "PASSED" ] && [ "$restore_test" = "PASSED" ]; then
        cat >> "${backup_file}.verification.md" << EOF
✅ **Backup verification successful**
- File integrity: OK
- Restore capability: OK
- Backup is ready for production use

EOF
    else
        cat >> "${backup_file}.verification.md" << EOF
❌ **Backup verification failed**
- File integrity: $([ "$file_integrity" = "PASSED" ] && echo "OK" || echo "FAILED")
- Restore capability: $([ "$restore_test" = "PASSED" ] && echo "OK" || echo "FAILED")

**Action Required**: Do not use this backup for production restore
EOF
    fi

    cat >> "${backup_file}.verification.md" << EOF
---
*Generated by backup verification script v$SCRIPT_VERSION*
EOF

    log_info "Verification report generated: ${backup_file}.verification.md"
}

# Send notification
send_notification() {
    local status="$1"
    local backup_file="$2"
    local message=""

    if [ "$status" = "success" ]; then
        message="✅ Backup verification completed successfully: $(basename "$backup_file")"
    else
        message="❌ Backup verification failed: $(basename "$backup_file")"
    fi

    # Send to Slack if configured
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "${SLACK_WEBHOOK_URL}" 2>/dev/null || true
    fi
}

# Main verification function
verify_backup() {
    local backup_file="$1"
    local encryption_key="$2"
    local perform_restore_test="${3:-false}"

    local start_time
    start_time=$(date +%s)

    log_info "Starting backup verification: $backup_file"

    # Validate environment
    validate_environment

    # Check file integrity
    local file_integrity="FAILED"
    if check_file_integrity "$backup_file"; then
        file_integrity="PASSED"
    fi

    # Calculate file hash
    local file_hash
    file_hash=$(calculate_file_hash "$backup_file")

    # Test restore if requested
    local restore_test="SKIPPED"
    if [ "$perform_restore_test" = true ]; then
        if test_restore "$backup_file" "$encryption_key"; then
            restore_test="PASSED"
        else
            restore_test="FAILED"
        fi
    fi

    # Generate report
    local end_time
    end_time=$(date +%s)
    generate_verification_report "$backup_file" "$file_integrity" "$file_hash" "$restore_test" "$start_time" "$end_time"

    # Send notification
    local overall_status="success"
    if [ "$file_integrity" = "FAILED" ] || [ "$restore_test" = "FAILED" ]; then
        overall_status="failed"
    fi

    send_notification "$overall_status" "$backup_file"

    # Summary
    log_info "Verification completed"
    log_info "File integrity: $file_integrity"
    log_info "Restore test: $restore_test"

    if [ "$file_integrity" = "PASSED" ] && ([ "$restore_test" = "PASSED" ] || [ "$restore_test" = "SKIPPED" ]); then
        log_success "✅ Backup verification successful"
        return 0
    else
        log_error "❌ Backup verification failed"
        return 1
    fi
}

# Show help
show_help() {
    cat << EOF
Backup Verification Script v$SCRIPT_VERSION

Usage: $0 <backup_file> [options]

Arguments:
    backup_file        Path to the backup file to verify

Options:
    --encrypt KEY      Decryption key for encrypted backups
    --restore-test     Perform actual restore test (creates temporary database)
    --help            Show this help message

Environment Variables:
    TEMP_DIR          Temporary directory for processing (default: /tmp/backup-verification)
    RESTORE_TEST_DB   Base name for temporary restore test database
    DB_HOST           Database host (default: localhost)
    DB_PORT           Database port (default: 5432)
    DB_NAME           Database name (default: fitness_gym)
    DB_USER           Database user (default: postgres)
    DB_PASSWORD       Database password (default: postgres)
    SLACK_WEBHOOK_URL Slack webhook URL for notifications

Examples:
    $0 /opt/backups/fitness_gym_backup_full_20241117.sql
    $0 /opt/backups/encrypted_backup.sql.gz.enc --encrypt my_secret_key --restore-test

EOF
}

# Main execution
main() {
    local backup_file=""
    local encryption_key=""
    local perform_restore_test=false

    # Parse arguments
    if [ $# -eq 0 ]; then
        log_error "Backup file is required"
        show_help
        exit 1
    fi

    backup_file="$1"
    shift

    while [[ $# -gt 0 ]]; do
        case $1 in
            --encrypt)
                encryption_key="$2"
                shift 2
                ;;
            --restore-test)
                perform_restore_test=true
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

    # Verify backup
    if verify_backup "$backup_file" "$encryption_key" "$perform_restore_test"; then
        exit 0
    else
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
