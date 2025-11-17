#!/bin/bash
# Enhanced Docker deployment script
# Features: Environment checks, pre-deploy validation, health checks, rollback, logging

set -e

# Enable BuildKit to support cache mount functionality (speed up Maven and NPM dependency downloads)
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Configuration
SCRIPT_VERSION="2.0.0"
LOG_FILE="/tmp/docker-deploy_$(date +%Y%m%d_%H%M%S).log"
DEPLOYMENT_BACKUP_DIR="/tmp/deployment_backup_$(date +%Y%m%d_%H%M%S)"

# Default values
ACTION="${1:-up}"
BUILD=false
DETACHED=true
REMOVE_VOLUMES=false
SKIP_CHECKS=false
ROLLBACK_TAG=""
ENVIRONMENT="development"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD=true
            shift
            ;;
        --no-detach)
            DETACHED=false
            shift
            ;;
        --remove-volumes)
            REMOVE_VOLUMES=true
            shift
            ;;
        --skip-checks)
            SKIP_CHECKS=true
            shift
            ;;
        --rollback-tag)
            ROLLBACK_TAG="$2"
            shift 2
            ;;
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

# Logging functions
log_info() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $*" | tee -a "$LOG_FILE"
}

log_warn() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARN] $*" | tee -a "$LOG_FILE" >&2
}

log_error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $*" | tee -a "$LOG_FILE" >&2
}

# Environment validation
validate_environment() {
    log_info "Validating environment..."

    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi

    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not available"
        exit 1
    fi

    # Check required files
    if [ ! -f "docker-compose.yml" ]; then
        log_error "docker-compose.yml not found"
        exit 1
    fi

    if [ ! -f ".env" ]; then
        log_warn ".env file not found, copying from env.example..."
        if [ -f "env.example" ]; then
            cp env.example .env
            log_info "Copied env.example to .env"
        else
            log_warn "env.example not found, proceeding without environment file"
        fi
    fi

    # Validate environment variables based on target environment
    validate_environment_variables

    log_info "Environment validation completed"
}

validate_environment_variables() {
    log_info "Validating environment variables..."

    # Load environment variables
    if [ -f ".env" ]; then
        set -a
        source .env
        set +a
    fi

    # Required variables based on environment
    local required_vars=("POSTGRES_PASSWORD")

    if [ "$ENVIRONMENT" = "production" ]; then
        required_vars+=("DB_HOST" "DB_USER" "DB_PASSWORD" "REDIS_HOST" "MINIO_ACCESS_KEY" "MINIO_SECRET_KEY")
    fi

    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        exit 1
    fi

    log_info "Environment variables validation completed"
}

# Pre-deployment checks
pre_deployment_checks() {
    if [ "$SKIP_CHECKS" = true ]; then
        log_warn "Skipping pre-deployment checks as requested"
        return
    fi

    log_info "Running pre-deployment checks..."

    # Check system resources
    check_system_resources

    # Check port availability
    check_port_availability

    # Backup current deployment
    create_deployment_backup

    log_info "Pre-deployment checks completed"
}

check_system_resources() {
    log_info "Checking system resources..."

    # Check available memory
    local available_memory
    available_memory=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [ "$available_memory" -lt 1024 ]; then
        log_warn "Available memory is low: ${available_memory}MB (recommended: 1024MB+)"
    fi

    # Check available disk space
    local available_disk
    available_disk=$(df / | awk 'NR==2{printf "%.0f", $4/1024}')
    if [ "$available_disk" -lt 5 ]; then
        log_error "Available disk space is too low: ${available_disk}GB (required: 5GB+)"
        exit 1
    fi

    # Check Docker resources
    local docker_images
    docker_images=$(docker images -q | wc -l)
    log_info "Docker images count: $docker_images"

    log_info "System resources check completed"
}

check_port_availability() {
    log_info "Checking port availability..."

    local ports_to_check=("5432" "6379" "8080" "9000" "9001")

    for port in "${ports_to_check[@]}"; do
        if lsof -Pi :"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
            local service
            service=$(lsof -Pi :"$port" -sTCP:LISTEN | tail -n 1 | awk '{print $1}')
            log_warn "Port $port is already in use by: $service"
        else
            log_info "Port $port is available"
        fi
    done

    log_info "Port availability check completed"
}

create_deployment_backup() {
    log_info "Creating deployment backup..."

    mkdir -p "$DEPLOYMENT_BACKUP_DIR"

    # Backup current docker-compose configuration
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml "$DEPLOYMENT_BACKUP_DIR/"
    fi

    # Backup environment file
    if [ -f ".env" ]; then
        cp .env "$DEPLOYMENT_BACKUP_DIR/"
    fi

    # Backup current running containers configuration
    if docker-compose ps -q | grep -q .; then
        docker-compose config > "$DEPLOYMENT_BACKUP_DIR/running-config.yml" 2>/dev/null || true
    fi

    log_info "Deployment backup created at: $DEPLOYMENT_BACKUP_DIR"
}

# Post-deployment health checks
health_checks() {
    log_info "Running post-deployment health checks..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts"

        if perform_health_checks; then
            log_info "All health checks passed!"
            return 0
        fi

        log_info "Health checks failed, waiting 10 seconds before retry..."
        sleep 10
        ((attempt++))
    done

    log_error "Health checks failed after $max_attempts attempts"
    return 1
}

perform_health_checks() {
    local checks_passed=0
    local total_checks=0

    # Check if services are running
    ((total_checks++))
    if docker-compose ps | grep -q "Up"; then
        log_info "✅ Services are running"
        ((checks_passed++))
    else
        log_warn "❌ Services are not running"
    fi

    # Backend health check
    ((total_checks++))
    if curl -f -s --max-time 10 http://localhost:8080/springboot1ngh61a2/user/login >/dev/null 2>&1; then
        log_info "✅ Backend API is responding"
        ((checks_passed++))
    else
        log_warn "❌ Backend API is not responding"
    fi

    # Database health check
    ((total_checks++))
    if docker-compose exec -T postgres pg_isready -U postgres -d fitness_gym >/dev/null 2>&1; then
        log_info "✅ Database is healthy"
        ((checks_passed++))
    else
        log_warn "❌ Database health check failed"
    fi

    # Redis health check
    ((total_checks++))
    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        log_info "✅ Redis is healthy"
        ((checks_passed++))
    else
        log_warn "❌ Redis health check failed"
    fi

    # MinIO health check
    ((total_checks++))
    if curl -f -s --max-time 10 http://localhost:9000/minio/health/live >/dev/null 2>&1; then
        log_info "✅ MinIO is healthy"
        ((checks_passed++))
    else
        log_warn "❌ MinIO health check failed"
    fi

    # Calculate success rate
    local success_rate=$((checks_passed * 100 / total_checks))

    if [ $success_rate -ge 80 ]; then
        log_info "Health check success rate: ${success_rate}%"
        return 0
    else
        log_error "Health check success rate too low: ${success_rate}%"
        return 1
    fi
}

# Rollback functionality
perform_rollback() {
    log_warn "Performing rollback..."

    if [ -z "$ROLLBACK_TAG" ]; then
        # Auto-detect previous version
        ROLLBACK_TAG=$(docker images fitness_gym_backend --format "{{.Tag}}" | sed -n '2p')
        if [ -z "$ROLLBACK_TAG" ]; then
            log_error "No rollback tag specified and no previous version found"
            return 1
        fi
        log_info "Auto-detected rollback tag: $ROLLBACK_TAG"
    fi

    # Stop current services
    log_info "Stopping current services..."
    docker-compose down

    # Update docker-compose.yml with rollback tag
    sed -i.bak "s|fitness_gym_backend:.*|fitness_gym_backend:$ROLLBACK_TAG|" docker-compose.yml

    # Start services with rollback version
    log_info "Starting services with rollback version: $ROLLBACK_TAG"
    docker-compose up -d

    # Wait for services to start
    sleep 30

    # Perform health checks
    if health_checks; then
        log_info "Rollback completed successfully"
        return 0
    else
        log_error "Rollback failed - services are not healthy"
        return 1
    fi
}

# Deployment reporting
generate_deployment_report() {
    local deployment_status="$1"
    local start_time="$2"
    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - start_time))

    log_info "Generating deployment report..."

    cat > deployment_report.md << EOF
# 🚀 部署报告

## 部署信息
- **部署时间**: $(date -d "@$start_time" '+%Y-%m-%d %H:%M:%S')
- **持续时间**: ${duration}秒
- **环境**: $ENVIRONMENT
- **状态**: $deployment_status
- **操作**: $ACTION

## 部署详情
- **构建镜像**: $BUILD
- **后台运行**: $DETACHED
- **跳过检查**: $SKIP_CHECKS

## 服务状态
\`\`\`
$(docker-compose ps)
\`\`\`

## 健康检查结果
- **后端API**: $(curl -f -s http://localhost:8080/springboot1ngh61a2/user/login >/dev/null 2>&1 && echo "✅ 正常" || echo "❌ 异常")
- **数据库**: $(docker-compose exec -T postgres pg_isready -U postgres -d fitness_gym >/dev/null 2>&1 && echo "✅ 正常" || echo "❌ 异常")
- **Redis**: $(docker-compose exec -T redis redis-cli ping >/dev/null 2>&1 && echo "✅ 正常" || echo "❌ 异常")
- **MinIO**: $(curl -f -s http://localhost:9000/minio/health/live >/dev/null 2>&1 && echo "✅ 正常" || echo "❌ 异常")

## 日志位置
- **部署日志**: $LOG_FILE
- **备份目录**: $DEPLOYMENT_BACKUP_DIR

---
*报告生成时间: $(date)*
EOF

    log_info "Deployment report generated: deployment_report.md"
}

show_help() {
    cat << EOF
Enhanced Docker Deployment Script v$SCRIPT_VERSION

用法: $0 [命令] [选项]

命令:
    up              启动服务
    down            停止服务
    restart         重启服务
    logs            查看日志
    status          查看状态
    build           构建镜像
    clean           清理资源
    rollback        回滚到上一版本

选项:
    --build         重新构建镜像
    --no-detach     不使用后台模式
    --remove-volumes 删除数据卷（危险操作）
    --skip-checks   跳过部署前检查
    --rollback-tag  指定回滚的镜像标签
    --environment   指定部署环境 (development/staging/production)
    --help          显示帮助信息

示例:
    # 启动服务
    $0 up

    # 构建并启动服务
    $0 up --build

    # 部署到生产环境
    $0 up --environment production

    # 回滚到指定版本
    $0 rollback --rollback-tag v1.0.0

    # 清理所有资源
    $0 clean --remove-volumes

EOF
}

show_status() {
    echo "========================================="
    echo "Service Status"
    echo "========================================="
    docker-compose ps
}

show_logs() {
    echo "========================================="
    echo "Service Logs (Press Ctrl+C to exit)"
    echo "========================================="
    docker-compose logs -f
}

case "$ACTION" in
    up)
        log_info "Starting deployment process..."
        DEPLOYMENT_START_TIME=$(date +%s)

        # Environment validation
        validate_environment

        # Pre-deployment checks
        pre_deployment_checks

        # Start deployment
        log_info "Starting Docker Compose services..."
        COMPOSE_ARGS=("up")
        if [ "$BUILD" = true ]; then
            COMPOSE_ARGS+=("--build")
            log_info "Will rebuild images (BuildKit enabled, using cache to speed up)"
        fi
        if [ "$DETACHED" = true ]; then
            COMPOSE_ARGS+=("-d")
        fi

        if docker-compose "${COMPOSE_ARGS[@]}"; then
            log_info "Docker Compose services started successfully"

            # Post-deployment health checks
            if health_checks; then
                log_info "Deployment completed successfully!"
                generate_deployment_report "成功" "$DEPLOYMENT_START_TIME"

                echo ""
                echo "========================================="
                echo "🎉 Services started successfully!"
                echo "========================================="
                echo ""
                echo "Access URLs:"
                echo "  Backend API: http://localhost:8080/springboot1ngh61a2"
                echo "  Frontend App: http://localhost:8080/springboot1ngh61a2/front/front/index.html"
                echo "  Admin Panel: http://localhost:8080/springboot1ngh61a2/admin/admin/index.html"
                echo "  MinIO Console: http://localhost:9001"
                echo ""
                echo "📊 Deployment Report: deployment_report.md"
                echo "📝 Deployment Log: $LOG_FILE"
                echo "💾 Deployment Backup: $DEPLOYMENT_BACKUP_DIR"
                echo ""
                echo "View logs: ./docker-deploy.sh logs"
                echo "View status: ./docker-deploy.sh status"
            else
                log_error "Health checks failed after deployment"
                generate_deployment_report "失败 - 健康检查未通过" "$DEPLOYMENT_START_TIME"
                exit 1
            fi
        else
            log_error "Failed to start Docker Compose services"
            generate_deployment_report "失败 - 服务启动失败" "$DEPLOYMENT_START_TIME"
            exit 1
        fi
        ;;
    
    down)
        echo "Stopping Docker Compose services..."
        COMPOSE_ARGS=("down")
        if [ "$REMOVE_VOLUMES" = true ]; then
            COMPOSE_ARGS+=("-v")
            echo "Warning: Will delete all data volumes!"
        fi
        docker-compose "${COMPOSE_ARGS[@]}"
        ;;
    
    restart)
        echo "Restarting Docker Compose services..."
        docker-compose restart
        show_status
        ;;
    
    logs)
        show_logs
        ;;
    
    status)
        show_status
        ;;
    
    build)
        log_info "Building Docker Compose services..."
        log_info "BuildKit enabled, using cache to speed up build"

        # Validate environment before building
        validate_environment

        if docker-compose build; then
            log_info "Build completed successfully"
        else
            log_error "Build failed"
            exit 1
        fi
        ;;

    rollback)
        log_info "Starting rollback process..."
        DEPLOYMENT_START_TIME=$(date +%s)

        # Validate environment
        validate_environment

        # Perform rollback
        if perform_rollback; then
            log_info "Rollback completed successfully"
            generate_deployment_report "回滚成功" "$DEPLOYMENT_START_TIME"
        else
            log_error "Rollback failed"
            generate_deployment_report "回滚失败" "$DEPLOYMENT_START_TIME"
            exit 1
        fi
        ;;

    clean)
        log_warn "Cleaning Docker resources..."
        log_warn "This will remove all containers and volumes!"

        # Validate environment
        validate_environment

        log_info "Stopping and removing containers..."
        docker-compose down -v

        log_info "Removing unused images..."
        docker image prune -f

        log_info "Removing unused volumes..."
        docker volume prune -f

        log_info "Cleanup completed!"

        # Generate cleanup report
        cat > cleanup_report.md << EOF
# 🧹 清理报告

## 清理信息
- **清理时间**: $(date)
- **清理类型**: 完整清理
- **删除数据卷**: 是

## 清理结果
- **停止的容器**: $(docker-compose ps -q | wc -l)
- **删除的镜像**: $(docker image prune -f 2>/dev/null | grep -c "deleted\|untagged" || echo "0")
- **删除的卷**: $(docker volume prune -f 2>/dev/null | grep -c "deleted" || echo "0")

---
*报告生成时间: $(date)*
EOF

        log_info "Cleanup report generated: cleanup_report.md"
        ;;

    health)
        log_info "Running health checks..."
        if health_checks; then
            log_info "All health checks passed!"
            echo "✅ System is healthy"
        else
            log_error "Health checks failed"
            echo "❌ System has issues"
            exit 1
        fi
        ;;

    *)
        echo "Unknown action: $ACTION"
        echo ""
        show_help
        exit 1
        ;;
esac
