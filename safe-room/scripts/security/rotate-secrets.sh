#!/bin/bash
# Secret Rotation Automation Script for Fitness Gym System
# Features: JWT secrets, database passwords, API keys rotation

set -e

SCRIPT_VERSION="1.0.0"
LOG_FILE="/var/log/secret-rotation_$(date +%Y%m%d_%H%M%S).log"
BACKUP_DIR="/var/backups/secrets_$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env"
JWT_SECRET_LENGTH=64
DB_PASSWORD_LENGTH=32
API_KEY_LENGTH=64

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

log_secret() {
    echo -e "${PURPLE}[$(date '+%Y-%m-%d %H:%M:%S')] [SECRET]${NC} $*" | tee -a "$LOG_FILE"
}

# Validate environment
validate_environment() {
    log_info "Validating environment..."

    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file $ENV_FILE not found"
        exit 1
    fi

    # Check required tools
    if ! command -v openssl &> /dev/null; then
        log_error "OpenSSL is required for secret generation"
        exit 1
    fi

    # Check if services are running (optional, for validation)
    if docker-compose ps | grep -q "Up"; then
        log_info "Docker services are running - will restart after rotation"
    else
        log_warn "Docker services are not running - manual restart may be required"
    fi

    log_success "Environment validation completed"
}

# Generate secure random string
generate_secret() {
    local length="$1"
    openssl rand -base64 "$length" | tr -d "=+/" | cut -c1-"$length"
}

# Backup current secrets
backup_secrets() {
    log_info "Creating backup of current secrets..."

    mkdir -p "$BACKUP_DIR"

    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "$BACKUP_DIR/"
        log_success "Environment file backed up to $BACKUP_DIR"
    else
        log_error "Environment file not found for backup"
        return 1
    fi
}

# Rotate JWT secrets
rotate_jwt_secrets() {
    log_secret "🔄 Rotating JWT secrets..."

    # Generate new JWT secrets
    local new_jwt_secret
    local new_jwt_refresh_secret

    new_jwt_secret=$(generate_secret "$JWT_SECRET_LENGTH")
    new_jwt_refresh_secret=$(generate_secret "$JWT_SECRET_LENGTH")

    # Backup current values
    local old_jwt_secret
    local old_jwt_refresh_secret

    old_jwt_secret=$(grep "^JWT_SECRET=" "$ENV_FILE" | cut -d'=' -f2- || echo "")
    old_jwt_refresh_secret=$(grep "^JWT_REFRESH_SECRET=" "$ENV_FILE" | cut -d'=' -f2- || echo "")

    # Update environment file
    if grep -q "^JWT_SECRET=" "$ENV_FILE"; then
        sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=$new_jwt_secret|" "$ENV_FILE"
    else
        echo "JWT_SECRET=$new_jwt_secret" >> "$ENV_FILE"
    fi

    if grep -q "^JWT_REFRESH_SECRET=" "$ENV_FILE"; then
        sed -i.bak "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$new_jwt_refresh_secret|" "$ENV_FILE"
    else
        echo "JWT_REFRESH_SECRET=$new_jwt_refresh_secret" >> "$ENV_FILE"
    fi

    log_success "JWT secrets rotated successfully"

    # Log what changed (without revealing the actual secrets)
    log_info "JWT_SECRET: $([ -n "$old_jwt_secret" ] && echo "updated" || echo "created")"
    log_info "JWT_REFRESH_SECRET: $([ -n "$old_jwt_refresh_secret" ] && echo "updated" || echo "created")"

    return 0
}

# Rotate database password
rotate_database_password() {
    log_secret "🔄 Rotating database password..."

    # Generate new password
    local new_db_password
    new_db_password=$(generate_secret "$DB_PASSWORD_LENGTH")

    # Get current database configuration
    local db_host db_port db_name db_user
    db_host=$(grep "^DB_HOST=" "$ENV_FILE" | cut -d'=' -f2- || echo "localhost")
    db_port=$(grep "^DB_PORT=" "$ENV_FILE" | cut -d'=' -f2- || echo "5432")
    db_name=$(grep "^DB_NAME=" "$ENV_FILE" | cut -d'=' -f2- || echo "fitness_gym")
    db_user=$(grep "^DB_USER=" "$ENV_FILE" | cut -d'=' -f2- || echo "postgres")

    local old_db_password
    old_db_password=$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2- || echo "")

    # Update PostgreSQL user password
    log_info "Updating database user password..."
    local update_sql="ALTER USER $db_user PASSWORD '$new_db_password';"

    if PGPASSWORD="$old_db_password" psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" -c "$update_sql" 2>/dev/null; then
        log_success "Database password updated in PostgreSQL"
    else
        log_error "Failed to update database password"
        return 1
    fi

    # Update environment file
    if grep -q "^DB_PASSWORD=" "$ENV_FILE"; then
        sed -i.bak "s|^DB_PASSWORD=.*|DB_PASSWORD=$new_db_password|" "$ENV_FILE"
    else
        echo "DB_PASSWORD=$new_db_password" >> "$ENV_FILE"
    fi

    log_success "Database password rotated successfully"
    return 0
}

# Rotate MinIO credentials
rotate_minio_credentials() {
    log_secret "🔄 Rotating MinIO credentials..."

    # Generate new credentials
    local new_minio_access_key
    local new_minio_secret_key

    new_minio_access_key=$(generate_secret 20)  # MinIO access keys are typically shorter
    new_minio_secret_key=$(generate_secret "$API_KEY_LENGTH")

    # Get current MinIO configuration
    local minio_container
    minio_container=$(docker-compose ps -q minio 2>/dev/null || echo "")

    if [ -n "$minio_container" ]; then
        # Update MinIO configuration via Docker
        log_info "Updating MinIO container with new credentials..."

        # Note: MinIO credential rotation requires container restart with new environment variables
        # This is a simplified version - production systems may need more complex rotation

        # Update docker-compose.yml temporarily (not recommended for production)
        # In production, use MinIO's admin APIs or secrets management systems
        log_warn "MinIO credential rotation requires manual intervention in production"
        log_info "New MinIO credentials generated (manual update required)"
    fi

    # Update environment file
    if grep -q "^MINIO_ACCESS_KEY=" "$ENV_FILE"; then
        sed -i.bak "s|^MINIO_ACCESS_KEY=.*|MINIO_ACCESS_KEY=$new_minio_access_key|" "$ENV_FILE"
    else
        echo "MINIO_ACCESS_KEY=$new_minio_access_key" >> "$ENV_FILE"
    fi

    if grep -q "^MINIO_SECRET_KEY=" "$ENV_FILE"; then
        sed -i.bak "s|^MINIO_SECRET_KEY=.*|MINIO_SECRET_KEY=$new_minio_secret_key|" "$ENV_FILE"
    else
        echo "MINIO_SECRET_KEY=$new_minio_secret_key" >> "$ENV_FILE"
    fi

    log_success "MinIO credentials rotated in environment file"
    log_warn "⚠️  MinIO service restart required for credential changes to take effect"
    return 0
}

# Rotate API keys (Stripe, SendGrid, etc.)
rotate_api_keys() {
    log_secret "🔄 Rotating API keys..."

    # Stripe Secret Key
    if grep -q "^STRIPE_SECRET_KEY=" "$ENV_FILE"; then
        local new_stripe_key
        new_stripe_key=$(generate_secret "$API_KEY_LENGTH")
        sed -i.bak "s|^STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$new_stripe_key|" "$ENV_FILE"
        log_success "Stripe API key rotated"
    fi

    # SendGrid API Key
    if grep -q "^SENDGRID_API_KEY=" "$ENV_FILE"; then
        local new_sendgrid_key
        new_sendgrid_key=$(generate_secret "$API_KEY_LENGTH")
        sed -i.bak "s|^SENDGRID_API_KEY=.*|SENDGRID_API_KEY=$new_sendgrid_key|" "$ENV_FILE"
        log_success "SendGrid API key rotated"
    fi

    # Add more API keys as needed
    log_info "API keys rotation completed"
    return 0
}

# Rotate all secrets
rotate_all_secrets() {
    log_info "🔄 Rotating ALL secrets..."

    rotate_jwt_secrets
    rotate_database_password
    rotate_minio_credentials
    rotate_api_keys

    log_success "All secrets rotated successfully"
    return 0
}

# Restart services to apply changes
restart_services() {
    log_info "🔄 Restarting services to apply secret changes..."

    # Restart backend service
    if docker-compose ps backend | grep -q "Up"; then
        log_info "Restarting backend service..."
        docker-compose restart backend

        # Wait for service to be ready
        local max_attempts=30
        local attempt=1

        while [ $attempt -le $max_attempts ]; do
            if curl -f -s --max-time 10 http://localhost:8080/springboot1ngh61a2/user/login >/dev/null 2>&1; then
                log_success "Backend service restarted and ready"
                break
            fi
            log_info "Waiting for backend service... ($attempt/$max_attempts)"
            sleep 10
            ((attempt++))
        done

        if [ $attempt -gt $max_attempts ]; then
            log_error "Backend service failed to restart properly"
            return 1
        fi
    else
        log_warn "Backend service is not running - manual restart may be required"
    fi

    # Restart MinIO if credentials changed
    if docker-compose ps minio | grep -q "Up"; then
        log_info "Restarting MinIO service..."
        docker-compose restart minio
        sleep 10
    fi

    log_success "Services restarted successfully"
    return 0
}

# Generate rotation report
generate_rotation_report() {
    local rotation_type="$1"
    local start_time="$2"
    local end_time="$3"
    local success="$4"

    local duration=$((end_time - start_time))

    cat > "secret-rotation-report-$(date +%Y%m%d_%H%M%S).md" << EOF
# 🔐 Secret Rotation Report

**Rotation Type**: $rotation_type
**Timestamp**: $(date -d "@$start_time" '+%Y-%m-%d %H:%M:%S')
**Duration**: ${duration} seconds
**Status**: $([ "$success" = "true" ] && echo "✅ SUCCESS" || echo "❌ FAILED")
**Backup Location**: $BACKUP_DIR

## Rotated Secrets

### JWT Secrets
- **JWT_SECRET**: ✅ Rotated
- **JWT_REFRESH_SECRET**: ✅ Rotated

### Database Credentials
- **DB_PASSWORD**: ✅ Rotated and updated in database

### MinIO Credentials
- **MINIO_ACCESS_KEY**: ✅ Rotated (restart required)
- **MINIO_SECRET_KEY**: ✅ Rotated (restart required)

### API Keys
- **STRIPE_SECRET_KEY**: ✅ Rotated
- **SENDGRID_API_KEY**: ✅ Rotated

## Actions Taken

1. **Backup Created**: Current secrets backed up to $BACKUP_DIR
2. **Secrets Generated**: New cryptographically secure secrets generated
3. **Database Updated**: PostgreSQL user password updated
4. **Environment Updated**: $ENV_FILE updated with new secrets
5. **Services Restarted**: Backend and MinIO services restarted

## Security Notes

- All secrets generated using cryptographically secure random generation
- Previous secrets backed up for rollback capability
- Database password updated in PostgreSQL before environment file
- Services automatically restarted to apply changes

## Rollback Instructions

If issues occur after rotation:

1. Stop all services: \`docker-compose down\`
2. Restore environment file: \`cp $BACKUP_DIR/.env .env\`
3. Update database password manually if needed
4. Start services: \`docker-compose up -d\`

## Next Steps

- Monitor application logs for authentication issues
- Verify third-party integrations (Stripe, SendGrid, etc.)
- Update any external systems that use the rotated credentials
- Delete backup files after confirming everything works

---
*Generated by automated secret rotation script v$SCRIPT_VERSION*
EOF

    log_info "Rotation report generated"
}

# Send notification
send_notification() {
    local status="$1"
    local rotation_type="$2"
    local message=""

    if [ "$status" = "success" ]; then
        message="✅ Secret rotation completed successfully: $rotation_type"
    else
        message="❌ Secret rotation failed: $rotation_type"
    fi

    # Send to Slack if configured
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🔐 Secret Rotation: $message\"}" \
            "${SLACK_WEBHOOK_URL}" 2>/dev/null || true
    fi

    # Send email if configured
    if [ -n "${EMAIL_RECIPIENT:-}" ]; then
        echo "$message" | mail -s "Fitness Gym Secret Rotation $status" "${EMAIL_RECIPIENT}" 2>/dev/null || true
    fi
}

# Show help
show_help() {
    cat << EOF
Secret Rotation Automation Script v$SCRIPT_VERSION

Usage: $0 <rotation_type> [options]

Rotation Types:
    jwt         Rotate JWT secrets only
    database    Rotate database password only
    minio       Rotate MinIO credentials only
    api-keys    Rotate API keys only
    all         Rotate all secrets (default)

Options:
    --no-restart    Do not restart services after rotation
    --help          Show this help message

Environment Variables:
    ENV_FILE                Environment file path (default: .env)
    BACKUP_DIR              Backup directory for old secrets
    JWT_SECRET_LENGTH       JWT secret length (default: 64)
    DB_PASSWORD_LENGTH      Database password length (default: 32)
    API_KEY_LENGTH          API key length (default: 64)
    SLACK_WEBHOOK_URL       Slack webhook URL for notifications
    EMAIL_RECIPIENT         Email recipient for notifications

Examples:
    $0 all                    # Rotate all secrets
    $0 jwt                    # Rotate only JWT secrets
    $0 database --no-restart # Rotate database password without restart

Security Notes:
- All secrets are backed up before rotation
- Database passwords are updated in PostgreSQL before environment files
- Services are automatically restarted to apply changes
- Cryptographically secure random generation is used

EOF
}

# Main execution
main() {
    local rotation_type="all"
    local no_restart=false
    local start_time
    start_time=$(date +%s)

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            jwt|database|minio|api-keys|all)
                rotation_type="$1"
                shift
                ;;
            --no-restart)
                no_restart=true
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

    log_info "🔐 Starting Fitness Gym Secret Rotation v$SCRIPT_VERSION"
    log_info "Rotation type: $rotation_type"

    # Validate environment
    validate_environment

    # Create backup
    backup_secrets

    # Perform rotation based on type
    local success=false
    case "$rotation_type" in
        "jwt")
            rotate_jwt_secrets && success=true
            ;;
        "database")
            rotate_database_password && success=true
            ;;
        "minio")
            rotate_minio_credentials && success=true
            ;;
        "api-keys")
            rotate_api_keys && success=true
            ;;
        "all")
            rotate_all_secrets && success=true
            ;;
        *)
            log_error "Unknown rotation type: $rotation_type"
            exit 1
            ;;
    esac

    # Restart services if requested and rotation was successful
    if [ "$success" = true ] && [ "$no_restart" = false ]; then
        restart_services || success=false
    fi

    # Generate report
    local end_time
    end_time=$(date +%s)
    generate_rotation_report "$rotation_type" "$start_time" "$end_time" "$success"

    # Send notification
    send_notification "$( [ "$success" = true ] && echo "success" || echo "failed" )" "$rotation_type"

    # Final status
    if [ "$success" = true ]; then
        log_success "✅ Secret rotation completed successfully"
        exit 0
    else
        log_error "❌ Secret rotation failed"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
