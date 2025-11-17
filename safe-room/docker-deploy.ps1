# Enhanced Docker deployment script
# Features: Environment checks, pre-deploy validation, health checks, rollback, logging

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("up", "down", "restart", "logs", "status", "build", "clean", "rollback", "health")]
    [string]$Action = "up",

    [switch]$Build,
    [switch]$Detached = $true,
    [switch]$RemoveVolumes,
    [switch]$SkipChecks,
    [string]$RollbackTag,
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",
    [switch]$Help
)

# Enable BuildKit to support cache mount functionality (speed up Maven and NPM dependency downloads)
$env:DOCKER_BUILDKIT = "1"
$env:COMPOSE_DOCKER_CLI_BUILD = "1"

# Configuration
$SCRIPT_VERSION = "2.0.0"
$LOG_FILE = ".\docker-deploy_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$DEPLOYMENT_BACKUP_DIR = ".\deployment_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Help function
function Show-Help {
    $helpText = @"
Enhanced Docker Deployment Script v$SCRIPT_VERSION

Usage: .\docker-deploy.ps1 [-Action] <String> [Parameters]

Actions:
    up              Start services
    down            Stop services
    restart         Restart services
    logs            View logs
    status          View status
    build           Build images
    clean           Clean resources
    rollback        Rollback to previous version
    health          Run health checks

Parameters:
    -Build          Rebuild images
    -Detached       Run in background (default: true)
    -RemoveVolumes  Remove data volumes (dangerous)
    -SkipChecks     Skip pre-deployment checks
    -RollbackTag    Specify rollback image tag
    -Environment    Target environment (development/staging/production)
    -Help           Show this help

Examples:
    # Start services
    .\docker-deploy.ps1

    # Build and start services
    .\docker-deploy.ps1 -Action up -Build

    # Deploy to production
    .\docker-deploy.ps1 -Action up -Environment production

    # Rollback to specific version
    .\docker-deploy.ps1 -Action rollback -RollbackTag v1.0.0

    # Clean all resources
    .\docker-deploy.ps1 -Action clean -RemoveVolumes
"@
    Write-Host $helpText
}

# Logging functions
function Write-LogInfo {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp [INFO] $Message"
    Write-Host $logMessage -ForegroundColor Green
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Write-LogWarn {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp [WARN] $Message"
    Write-Host $logMessage -ForegroundColor Yellow
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Write-LogError {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp [ERROR] $Message"
    Write-Host $logMessage -ForegroundColor Red
    Add-Content -Path $LOG_FILE -Value $logMessage
}

# Environment validation
function Test-Environment {
    Write-LogInfo "Validating environment..."

    # Check if Docker is installed and running
    try {
        $dockerVersion = docker --version
        Write-LogInfo "Docker: $dockerVersion"
    } catch {
        Write-LogError "Docker is not installed or not accessible"
        exit 1
    }

    try {
        $dockerInfo = docker info 2>$null
        Write-LogInfo "Docker daemon is running"
    } catch {
        Write-LogError "Docker daemon is not running"
        exit 1
    }

    # Check if Docker Compose is available
    try {
        $composeVersion = docker-compose --version
        Write-LogInfo "Docker Compose: $composeVersion"
    } catch {
        try {
            $composeVersion = docker compose version
            Write-LogInfo "Docker Compose (v2): $composeVersion"
        } catch {
            Write-LogError "Docker Compose is not available"
            exit 1
        }
    }

    # Check required files
    if (-not (Test-Path "docker-compose.yml")) {
        Write-LogError "docker-compose.yml not found"
        exit 1
    }

    if (-not (Test-Path ".env")) {
        Write-LogWarn ".env file not found, copying from env.example..."
        if (Test-Path "env.example") {
            Copy-Item "env.example" ".env" -ErrorAction SilentlyContinue
            Write-LogInfo "Copied env.example to .env"
        } else {
            Write-LogWarn "env.example not found, proceeding without environment file"
        }
    }

    # Validate environment variables based on target environment
    Test-EnvironmentVariables

    Write-LogInfo "Environment validation completed"
}

function Test-EnvironmentVariables {
    Write-LogInfo "Validating environment variables..."

    # Load environment variables
    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match '^([^=]+)=(.*)$') {
                $key = $matches[1]
                $value = $matches[2]
                Set-Variable -Name $key -Value $value -Scope Script
            }
        }
    }

    # Required variables based on environment
    $requiredVars = @("POSTGRES_PASSWORD")

    if ($Environment -eq "production") {
        $requiredVars += @("DB_HOST", "DB_USER", "DB_PASSWORD", "REDIS_HOST", "MINIO_ACCESS_KEY", "MINIO_SECRET_KEY")
    }

    $missingVars = @()
    foreach ($var in $requiredVars) {
        if (-not (Get-Variable -Name $var -ValueOnly -ErrorAction SilentlyContinue)) {
            $missingVars += $var
        }
    }

    if ($missingVars.Count -gt 0) {
        Write-LogError "Missing required environment variables: $($missingVars -join ', ')"
        exit 1
    }

    Write-LogInfo "Environment variables validation completed"
}

# Pre-deployment checks
function Invoke-PreDeploymentChecks {
    if ($SkipChecks) {
        Write-LogWarn "Skipping pre-deployment checks as requested"
        return
    }

    Write-LogInfo "Running pre-deployment checks..."

    # Check system resources
    Test-SystemResources

    # Check port availability
    Test-PortAvailability

    # Backup current deployment
    New-DeploymentBackup

    Write-LogInfo "Pre-deployment checks completed"
}

function Test-SystemResources {
    Write-LogInfo "Checking system resources..."

    # Check available memory
    try {
        $osInfo = Get-CimInstance -ClassName Win32_OperatingSystem
        $totalMemoryGB = [math]::Round($osInfo.TotalVisibleMemorySize / 1MB, 2)
        $freeMemoryGB = [math]::Round($osInfo.FreePhysicalMemory / 1MB, 2)

        if ($freeMemoryGB -lt 1) {
            Write-LogWarn "Available memory is low: ${freeMemoryGB}GB (recommended: 1GB+)"
        } else {
            Write-LogInfo "Available memory: ${freeMemoryGB}GB of ${totalMemoryGB}GB"
        }
    } catch {
        Write-LogWarn "Unable to check system memory"
    }

    # Check available disk space
    try {
        $diskInfo = Get-PSDrive -Name C
        $freeSpaceGB = [math]::Round($diskInfo.Free / 1GB, 2)

        if ($freeSpaceGB -lt 5) {
            Write-LogError "Available disk space is too low: ${freeSpaceGB}GB (required: 5GB+)"
            exit 1
        } else {
            Write-LogInfo "Available disk space: ${freeSpaceGB}GB"
        }
    } catch {
        Write-LogWarn "Unable to check disk space"
    }

    # Check Docker resources
    try {
        $imageCount = (docker images -q | Measure-Object).Count
        Write-LogInfo "Docker images count: $imageCount"
    } catch {
        Write-LogWarn "Unable to check Docker images"
    }

    Write-LogInfo "System resources check completed"
}

function Test-PortAvailability {
    Write-LogInfo "Checking port availability..."

    $portsToCheck = @(5432, 6379, 8080, 9000, 9001)

    foreach ($port in $portsToCheck) {
        try {
            $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
            if ($connection.TcpTestSucceeded) {
                Write-LogWarn "Port $port is already in use"
            } else {
                Write-LogInfo "Port $port is available"
            }
        } catch {
            Write-LogWarn "Unable to check port $port"
        }
    }

    Write-LogInfo "Port availability check completed"
}

function New-DeploymentBackup {
    Write-LogInfo "Creating deployment backup..."

    New-Item -ItemType Directory -Path $DEPLOYMENT_BACKUP_DIR -Force | Out-Null

    # Backup current docker-compose configuration
    if (Test-Path "docker-compose.yml") {
        Copy-Item "docker-compose.yml" $DEPLOYMENT_BACKUP_DIR
    }

    # Backup environment file
    if (Test-Path ".env") {
        Copy-Item ".env" $DEPLOYMENT_BACKUP_DIR
    }

    # Backup current running containers configuration
    try {
        docker-compose config > "$DEPLOYMENT_BACKUP_DIR\running-config.yml" 2>$null
    } catch {
        # Ignore errors
    }

    Write-LogInfo "Deployment backup created at: $DEPLOYMENT_BACKUP_DIR"
}

# Post-deployment health checks
function Test-HealthChecks {
    Write-LogInfo "Running post-deployment health checks..."

    $maxAttempts = 30
    $attempt = 1

    while ($attempt -le $maxAttempts) {
        Write-LogInfo "Health check attempt $attempt/$maxAttempts"

        if (Invoke-HealthChecks) {
            Write-LogInfo "All health checks passed!"
            return $true
        }

        Write-LogInfo "Health checks failed, waiting 10 seconds before retry..."
        Start-Sleep -Seconds 10
        $attempt++
    }

    Write-LogError "Health checks failed after $maxAttempts attempts"
    return $false
}

function Invoke-HealthChecks {
    $checksPassed = 0
    $totalChecks = 0

    # Check if services are running
    $totalChecks++
    try {
        $runningServices = docker-compose ps --services --filter "status=running"
        if ($runningServices) {
            Write-LogInfo "✅ Services are running"
            $checksPassed++
        } else {
            Write-LogWarn "❌ Services are not running"
        }
    } catch {
        Write-LogWarn "❌ Unable to check service status"
    }

    # Backend health check
    $totalChecks++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/springboot1ngh61a2/user/login" -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-LogInfo "✅ Backend API is responding"
            $checksPassed++
        } else {
            Write-LogWarn "❌ Backend API returned status: $($response.StatusCode)"
        }
    } catch {
        Write-LogWarn "❌ Backend API is not responding"
    }

    # Database health check
    $totalChecks++
    try {
        $result = docker-compose exec -T postgres pg_isready -U postgres -d fitness_gym 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-LogInfo "✅ Database is healthy"
            $checksPassed++
        } else {
            Write-LogWarn "❌ Database health check failed"
        }
    } catch {
        Write-LogWarn "❌ Database health check failed"
    }

    # Redis health check
    $totalChecks++
    try {
        $result = docker-compose exec -T redis redis-cli ping 2>$null
        if ($result -eq "PONG") {
            Write-LogInfo "✅ Redis is healthy"
            $checksPassed++
        } else {
            Write-LogWarn "❌ Redis health check failed"
        }
    } catch {
        Write-LogWarn "❌ Redis health check failed"
    }

    # MinIO health check
    $totalChecks++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9000/minio/health/live" -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-LogInfo "✅ MinIO is healthy"
            $checksPassed++
        } else {
            Write-LogWarn "❌ MinIO returned status: $($response.StatusCode)"
        }
    } catch {
        Write-LogWarn "❌ MinIO health check failed"
    }

    # Calculate success rate
    $successRate = [math]::Round(($checksPassed / $totalChecks) * 100, 2)

    if ($successRate -ge 80) {
        Write-LogInfo "Health check success rate: ${successRate}%"
        return $true
    } else {
        Write-LogError "Health check success rate too low: ${successRate}%"
        return $false
    }
}

# Rollback functionality
function Invoke-Rollback {
    Write-LogWarn "Performing rollback..."

    if (-not $RollbackTag) {
        # Auto-detect previous version
        try {
            $RollbackTag = docker images fitness_gym_backend --format "{{.Tag}}" | Select-Object -Skip 1 | Select-Object -First 1
        } catch {
            $RollbackTag = $null
        }

        if (-not $RollbackTag) {
            Write-LogError "No rollback tag specified and no previous version found"
            return $false
        }
        Write-LogInfo "Auto-detected rollback tag: $RollbackTag"
    }

    # Stop current services
    Write-LogInfo "Stopping current services..."
    docker-compose down

    # Update docker-compose.yml with rollback tag
    $composeContent = Get-Content "docker-compose.yml" -Raw
    $composeContent = $composeContent -replace 'fitness_gym_backend:.+', "fitness_gym_backend:$RollbackTag"
    Set-Content "docker-compose.yml" $composeContent

    # Start services with rollback version
    Write-LogInfo "Starting services with rollback version: $RollbackTag"
    docker-compose up -d

    # Wait for services to start
    Start-Sleep -Seconds 30

    # Perform health checks
    if (Test-HealthChecks) {
        Write-LogInfo "Rollback completed successfully"
        return $true
    } else {
        Write-LogError "Rollback failed - services are not healthy"
        return $false
    }
}

# Deployment reporting
function New-DeploymentReport {
    param(
        [string]$DeploymentStatus,
        [int]$StartTime
    )

    $endTime = Get-Date -UFormat %s
    $duration = $endTime - $StartTime

    Write-LogInfo "Generating deployment report..."

    $reportContent = @"
# 🚀 部署报告

## 部署信息
- **部署时间**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
- **持续时间**: $duration 秒
- **环境**: $Environment
- **状态**: $DeploymentStatus
- **操作**: $Action

## 部署详情
- **构建镜像**: $Build
- **后台运行**: $Detached
- **跳过检查**: $SkipChecks

## 服务状态
```
docker-compose ps
```

## 健康检查结果
- **后端API**: $(try { $r = Invoke-WebRequest -Uri "http://localhost:8080/springboot1ngh61a2/user/login" -TimeoutSec 5; if ($r.StatusCode -eq 200) { "✅ 正常" } else { "❌ 异常" } } catch { "❌ 异常" })
- **数据库**: $(try { docker-compose exec -T postgres pg_isready -U postgres -d fitness_gym >`$null 2>&1; if (`$LASTEXITCODE -eq 0) { "✅ 正常" } else { "❌ 异常" } } catch { "❌ 异常" })
- **Redis**: $(try { `$result = docker-compose exec -T redis redis-cli ping 2>`$null; if (`$result -eq "PONG") { "✅ 正常" } else { "❌ 异常" } } catch { "❌ 异常" })
- **MinIO**: $(try { $r = Invoke-WebRequest -Uri "http://localhost:9000/minio/health/live" -TimeoutSec 5; if ($r.StatusCode -eq 200) { "✅ 正常" } else { "❌ 异常" } } catch { "❌ 异常" })

## 日志位置
- **部署日志**: $LOG_FILE
- **备份目录**: $DEPLOYMENT_BACKUP_DIR

---
*报告生成时间: $(Get-Date)*
"@

    $reportContent | Out-File -FilePath "deployment_report.md" -Encoding UTF8
    Write-LogInfo "Deployment report generated: deployment_report.md"
}

function Show-Status {
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Service Status" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    docker-compose ps
}

function Show-Logs {
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Service Logs (Press Ctrl+C to exit)" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    docker-compose logs -f
}

# Check for help request
if ($Help) {
    Show-Help
    exit 0
}

switch ($Action) {
    "up" {
        Write-LogInfo "Starting deployment process..."
        $DEPLOYMENT_START_TIME = Get-Date -UFormat %s

        # Environment validation
        Test-Environment

        # Pre-deployment checks
        Invoke-PreDeploymentChecks

        # Start deployment
        Write-LogInfo "Starting Docker Compose services..."
        $composeArgs = @("up")
        if ($Build) {
            $composeArgs += "--build"
            Write-LogInfo "Will rebuild images (BuildKit enabled, using cache to speed up)"
        }
        if ($Detached) {
            $composeArgs += "-d"
        }

        if (docker-compose @composeArgs) {
            Write-LogInfo "Docker Compose services started successfully"

            # Post-deployment health checks
            if (Test-HealthChecks) {
                Write-LogInfo "Deployment completed successfully!"
                New-DeploymentReport "成功" $DEPLOYMENT_START_TIME

                Write-Host ""
                Write-Host "=========================================" -ForegroundColor Green
                Write-Host "🎉 Services started successfully!" -ForegroundColor Green
                Write-Host "=========================================" -ForegroundColor Green
                Write-Host ""
                Write-Host "Access URLs:" -ForegroundColor Cyan
                Write-Host "  Backend API: http://localhost:8080/springboot1ngh61a2" -ForegroundColor White
                Write-Host "  Frontend App: http://localhost:8080/springboot1ngh61a2/front/front/index.html" -ForegroundColor White
                Write-Host "  Admin Panel: http://localhost:8080/springboot1ngh61a2/admin/admin/index.html" -ForegroundColor White
                Write-Host "  MinIO Console: http://localhost:9001" -ForegroundColor White
                Write-Host ""
                Write-Host "📊 Deployment Report: deployment_report.md" -ForegroundColor Cyan
                Write-Host "📝 Deployment Log: $LOG_FILE" -ForegroundColor Cyan
                Write-Host "💾 Deployment Backup: $DEPLOYMENT_BACKUP_DIR" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "View logs: .\docker-deploy.ps1 -Action logs" -ForegroundColor Cyan
                Write-Host "View status: .\docker-deploy.ps1 -Action status" -ForegroundColor Cyan
            } else {
                Write-LogError "Health checks failed after deployment"
                New-DeploymentReport "失败 - 健康检查未通过" $DEPLOYMENT_START_TIME
                exit 1
            }
        } else {
            Write-LogError "Failed to start Docker Compose services"
            New-DeploymentReport "失败 - 服务启动失败" $DEPLOYMENT_START_TIME
            exit 1
        }
    }
    
    "down" {
        Write-Host "Stopping Docker Compose services..." -ForegroundColor Cyan
        $composeArgs = @("down")
        if ($RemoveVolumes) {
            $composeArgs += "-v"
            Write-Host "Warning: Will delete all data volumes!" -ForegroundColor Red
        }
        docker-compose @composeArgs
    }
    
    "restart" {
        Write-Host "Restarting Docker Compose services..." -ForegroundColor Cyan
        docker-compose restart
        Show-Status
    }
    
    "logs" {
        Show-Logs
    }
    
    "status" {
        Show-Status
    }
    
    "build" {
        Write-LogInfo "Building Docker Compose services..."
        Write-LogInfo "BuildKit enabled, using cache to speed up build"

        # Validate environment before building
        Test-Environment

        if (docker-compose build) {
            Write-LogInfo "Build completed successfully"
        } else {
            Write-LogError "Build failed"
            exit 1
        }
    }

    "rollback" {
        Write-LogInfo "Starting rollback process..."
        $DEPLOYMENT_START_TIME = Get-Date -UFormat %s

        # Validate environment
        Test-Environment

        # Perform rollback
        if (Invoke-Rollback) {
            Write-LogInfo "Rollback completed successfully"
            New-DeploymentReport "回滚成功" $DEPLOYMENT_START_TIME
        } else {
            Write-LogError "Rollback failed"
            New-DeploymentReport "回滚失败" $DEPLOYMENT_START_TIME
            exit 1
        }
    }

    "health" {
        Write-LogInfo "Running health checks..."
        if (Test-HealthChecks) {
            Write-LogInfo "All health checks passed!"
            Write-Host "✅ System is healthy" -ForegroundColor Green
        } else {
            Write-LogError "Health checks failed"
            Write-Host "❌ System has issues" -ForegroundColor Red
            exit 1
        }
    }

    "clean" {
        Write-LogWarn "Cleaning Docker resources..."
        Write-LogWarn "This will remove all containers and volumes!"

        # Validate environment
        Test-Environment

        Write-LogInfo "Stopping and removing containers..."
        docker-compose down -v

        Write-LogInfo "Removing unused images..."
        docker image prune -f

        Write-LogInfo "Removing unused volumes..."
        docker volume prune -f

        Write-LogInfo "Cleanup completed!"

        # Generate cleanup report
        $cleanupReport = @"
# 🧹 清理报告

## 清理信息
- **清理时间**: $(Get-Date)
- **清理类型**: 完整清理
- **删除数据卷**: 是

## 清理结果
- **停止的容器**: $(try { (docker-compose ps -q | Measure-Object).Count } catch { 0 })
- **删除的镜像**: $(try { (docker image prune -f 2>$null | Select-String -Pattern "deleted|untagged" | Measure-Object).Count } catch { 0 })
- **删除的卷**: $(try { (docker volume prune -f 2>$null | Select-String -Pattern "deleted" | Measure-Object).Count } catch { 0 })

---
*报告生成时间: $(Get-Date)*
"@

        $cleanupReport | Out-File -FilePath "cleanup_report.md" -Encoding UTF8
        Write-LogInfo "Cleanup report generated: cleanup_report.md"
    }

    default {
        Write-Host "Unknown action: $Action" -ForegroundColor Red
        Write-Host ""
        Show-Help
        exit 1
    }
}
