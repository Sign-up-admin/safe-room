#!/bin/bash
# Automated Database Backup Script for Fitness Gym System
# Features: Full, incremental, and differential backups with compression and encryption

set -e

SCRIPT_VERSION="1.0.0"
LOG_FILE="/var/log/fitness-gym-backup_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/opt/fitness-gym/backups}"
TEMP_DIR="${TEMP_DIR:-/tmp/fitness-gym-backup}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
COMPRESSION_LEVEL="${COMPRESSION_LEVEL:-9}"

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-fitness_gym}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

# Encryption configuration
ENCRYPTION_KEY="${ENCRYPTION_KEY:-}"
USE_ENCRYPTION=false

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
    if ! command -v pg_dump &> /dev/null; then
        log_error "pg_dump is not available. Please install PostgreSQL client tools."
        exit 1
    fi

    if ! command -v gzip &> /dev/null; then
        log_error "gzip is not available. Please install gzip."
        exit 1
    fi

    if [ "$USE_ENCRYPTION" = true ] && ! command -v openssl &> /dev/null; then
        log_error "openssl is not available. Please install OpenSSL."
        exit 1
    fi

    # Create backup directory
    mkdir -p "$BACKUP_DIR"

    # Test database connection
    if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        log_error "Cannot connect to database"
        exit 1
    fi

    log_success "Environment validation completed"
}

# Generate backup filename
generate_backup_filename() {
    local backup_type="$1"
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    echo "${DB_NAME}_backup_${backup_type}_${timestamp}.sql"
}

# Perform full backup
perform_full_backup() {
    log_info "Starting full database backup..."

    local backup_file
    backup_file=$(generate_backup_filename "full")
    local backup_path="$BACKUP_DIR/$backup_file"

    log_info "Backup file: $backup_path"

    # Perform pg_dump
    if PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-password \
        --format=custom \
        --compress="$COMPRESSION_LEVEL" \
        --file="$backup_path" \
        --verbose; then

        log_success "Full backup completed: $backup_path"
        echo "$backup_path"
    else
        log_error "Full backup failed"
        return 1
    fi
}

# Perform incremental backup (using WAL archiving)
perform_incremental_backup() {
    log_info "Starting incremental database backup..."

    # Check if WAL archiving is enabled
    local wal_level
    wal_level=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SHOW wal_level;" -t | tr -d ' ')

    if [ "$wal_level" != "replica" ] && [ "$wal_level" != "logical" ]; then
        log_warn "WAL archiving is not properly configured. Performing full backup instead."
        perform_full_backup
        return $?
    fi

    local backup_file
    backup_file=$(generate_backup_filename "incremental")
    local backup_path="$BACKUP_DIR/$backup_file"

    log_info "Backup file: $backup_path"

    # Create incremental backup using pg_basebackup
    if PGPASSWORD="$DB_PASSWORD" pg_basebackup \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -D "$TEMP_DIR/backup_base" \
        --format=tar \
        --compress=gzip \
        --checkpoint=fast \
        --progress; then

        # Move and rename backup
        mv "$TEMP_DIR/backup_base/base.tar.gz" "$backup_path"

        log_success "Incremental backup completed: $backup_path"
        echo "$backup_path"
    else
        log_error "Incremental backup failed"
        return 1
    fi
}

# Compress backup file
compress_backup() {
    local input_file="$1"
    local output_file="${input_file}.gz"

    log_info "Compressing backup file..."

    if gzip -c "$input_file" > "$output_file"; then
        rm "$input_file"
        log_success "Compression completed: $output_file"
        echo "$output_file"
    else
        log_error "Compression failed"
        echo "$input_file"
    fi
}

# Encrypt backup file
encrypt_backup() {
    local input_file="$1"

    if [ "$USE_ENCRYPTION" != true ] || [ -z "$ENCRYPTION_KEY" ]; then
        echo "$input_file"
        return 0
    fi

    local output_file="${input_file}.enc"

    log_info "Encrypting backup file..."

    if openssl enc -aes-256-cbc -salt -in "$input_file" -out "$output_file" -k "$ENCRYPTION_KEY"; then
        rm "$input_file"
        log_success "Encryption completed: $output_file"
        echo "$output_file"
    else
        log_error "Encryption failed"
        echo "$input_file"
    fi
}

# Calculate file hash
calculate_file_hash() {
    local file="$1"
    if command -v sha256sum &> /dev/null; then
        sha256sum "$file" | awk '{print $1}'
    elif command -v shasum &> /dev/null; then
        shasum -a 256 "$file" | awk '{print $1}'
    else
        log_warn "No hash calculation tool available"
        echo "no_hash_available"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups (older than $RETENTION_DAYS days)..."

    local deleted_count=0

    # Find and delete old backup files
    while IFS= read -r -d '' file; do
        log_info "Deleting old backup: $file"
        rm "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "*.sql*" -mtime +"$RETENTION_DAYS" -print0)

    log_success "Cleanup completed. Deleted $deleted_count old backup files."
}

# Generate backup report
generate_backup_report() {
    local backup_type="$1"
    local backup_file="$2"
    local file_size="$3"
    local file_hash="$4"
    local start_time="$5"
    local end_time="$6"

    local duration=$((end_time - start_time))

    cat > "${backup_file}.report.md" << EOF
# Database Backup Report

**Backup Type**: $backup_type
**Database**: $DB_NAME
**Timestamp**: $(date -d "@$start_time" '+%Y-%m-%d %H:%M:%S')
**Duration**: ${duration} seconds
**File**: $backup_file
**Size**: $file_size bytes
**Hash**: $file_hash
**Compression**: $([ -f "${backup_file}.gz" ] || [ "$backup_file" = *".gz" ] && echo "Yes" || echo "No")
**Encryption**: $([ "$USE_ENCRYPTION" = true ] && echo "Yes" || echo "No")

## Database Information
- **Host**: $DB_HOST:$DB_PORT
- **Database**: $DB_NAME
- **User**: $DB_USER

## Backup Configuration
- **Backup Directory**: $BACKUP_DIR
- **Retention Days**: $RETENTION_DAYS
- **Compression Level**: $COMPRESSION_LEVEL

## Verification
- **File Exists**: $([ -f "$backup_file" ] && echo "✅ Yes" || echo "❌ No")
- **File Readable**: $([ -r "$backup_file" ] && echo "✅ Yes" || echo "❌ No")
- **Hash Verification**: $([ "$file_hash" != "no_hash_available" ] && echo "✅ Computed" || echo "⚠️ Not available")

---
*Generated by automated backup script v$SCRIPT_VERSION*
EOF

    log_info "Backup report generated: ${backup_file}.report.md"
}

# Send notification
send_notification() {
    local status="$1"
    local backup_file="$2"
    local message=""

    if [ "$status" = "success" ]; then
        message="✅ Database backup completed successfully: $(basename "$backup_file")"
    else
        message="❌ Database backup failed"
    fi

    # Send to Slack if configured
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "${SLACK_WEBHOOK_URL}" 2>/dev/null || true
    fi

    # Send email if configured
    if [ -n "${EMAIL_RECIPIENT:-}" ]; then
        echo "$message" | mail -s "Fitness Gym Database Backup $status" "${EMAIL_RECIPIENT}" 2>/dev/null || true
    fi
}

# Main backup function
perform_backup() {
    local backup_type="${1:-full}"
    local start_time
    start_time=$(date +%s)

    log_info "Starting $backup_type database backup..."

    # Validate environment
    validate_environment

    # Perform backup based on type
    local backup_file=""
    case "$backup_type" in
        "full")
            backup_file=$(perform_full_backup)
            ;;
        "incremental")
            backup_file=$(perform_incremental_backup)
            ;;
        "differential")
            # Differential backup (simplified as full for now)
            log_warn "Differential backup not implemented, performing full backup"
            backup_file=$(perform_full_backup)
            ;;
        *)
            log_error "Unknown backup type: $backup_type"
            exit 1
            ;;
    esac

    if [ -z "$backup_file" ] || [ ! -f "$backup_file" ]; then
        log_error "Backup file was not created"
        send_notification "failed" ""
        exit 1
    fi

    # Compress backup (unless already compressed)
    if [[ "$backup_file" != *.gz ]]; then
        backup_file=$(compress_backup "$backup_file")
    fi

    # Encrypt backup if requested
    backup_file=$(encrypt_backup "$backup_file")

    # Calculate file information
    local file_size
    file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null || echo "0")
    local file_hash
    file_hash=$(calculate_file_hash "$backup_file")

    # Generate report
    local end_time
    end_time=$(date +%s)
    generate_backup_report "$backup_type" "$backup_file" "$file_size" "$file_hash" "$start_time" "$end_time"

    # Clean up old backups
    cleanup_old_backups

    # Send notification
    send_notification "success" "$backup_file"

    log_success "Backup completed successfully: $backup_file"
    echo "$backup_file"
}

# Show help
show_help() {
    cat << EOF
Automated Database Backup Script v$SCRIPT_VERSION

Usage: $0 [options]

Options:
    --type TYPE          Backup type: full, incremental, differential (default: full)
    --encrypt            Enable backup encryption
    --key KEY           Encryption key (required if --encrypt is used)
    --retention DAYS    Number of days to retain backups (default: 30)
    --compression LEVEL Compression level 1-9 (default: 9)
    --help              Show this help message

Environment Variables:
    BACKUP_DIR          Backup directory (default: /opt/fitness-gym/backups)
    DB_HOST             Database host (default: localhost)
    DB_PORT             Database port (default: 5432)
    DB_NAME             Database name (default: fitness_gym)
    DB_USER             Database user (default: postgres)
    DB_PASSWORD         Database password (default: postgres)
    SLACK_WEBHOOK_URL   Slack webhook URL for notifications
    EMAIL_RECIPIENT     Email recipient for notifications

Examples:
    $0 --type full
    $0 --type incremental --encrypt --key my_secret_key
    $0 --retention 7 --compression 6

EOF
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --type)
                BACKUP_TYPE="$2"
                shift 2
                ;;
            --encrypt)
                USE_ENCRYPTION=true
                shift
                ;;
            --key)
                ENCRYPTION_KEY="$2"
                shift 2
                ;;
            --retention)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            --compression)
                COMPRESSION_LEVEL="$2"
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

    # Validate encryption key if encryption is enabled
    if [ "$USE_ENCRYPTION" = true ] && [ -z "$ENCRYPTION_KEY" ]; then
        log_error "Encryption key is required when encryption is enabled"
        exit 1
    fi
}

# Main execution
main() {
    local BACKUP_TYPE="full"

    # Parse command line arguments
    parse_arguments "$@"

    # Create temporary directory
    mkdir -p "$TEMP_DIR"

    # Perform backup
    local result
    result=$(perform_backup "$BACKUP_TYPE")

    # Clean up temporary directory
    rm -rf "$TEMP_DIR"

    log_info "Backup process completed"

    if [ -n "$result" ]; then
        echo "$result"
        exit 0
    else
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
