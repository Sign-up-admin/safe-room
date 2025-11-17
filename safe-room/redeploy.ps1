# Docker redeployment script
# Used to quickly redeploy the fitness gym management system

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fitness Gym Management System" -ForegroundColor Cyan
Write-Host "  Docker Redeployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "[1/5] Checking Docker status..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running, please start Docker Desktop first" -ForegroundColor Red
    exit 1
}

# Stop existing containers
Write-Host ""
Write-Host "[2/5] Stopping existing containers..." -ForegroundColor Yellow
docker-compose down
Write-Host "✓ Containers stopped" -ForegroundColor Green

# Ask whether to clean volumes
Write-Host ""
$cleanVolumes = Read-Host "Clean data volumes? This will delete all data (y/N)"
if ($cleanVolumes -eq "y" -or $cleanVolumes -eq "Y") {
    Write-Host "Cleaning data volumes..." -ForegroundColor Yellow
    docker-compose down -v
    Write-Host "✓ Data volumes cleaned" -ForegroundColor Green
}

# Ask whether to rebuild
Write-Host ""
$rebuild = Read-Host "Rebuild images? (Y/n)"
if ($rebuild -ne "n" -and $rebuild -ne "N") {
    # Ask whether to use cache (default use cache to speed up build)
    Write-Host ""
    $noCache = Read-Host "Force rebuild (no cache)? (y/N)"
    $buildArgs = @("build")
    if ($noCache -eq "y" -or $noCache -eq "Y") {
        $buildArgs += "--no-cache"
        Write-Host "[3/5] Rebuilding images (no cache)..." -ForegroundColor Yellow
    } else {
        Write-Host "[3/5] Rebuilding images (using cache to speed up)..." -ForegroundColor Yellow
        Write-Host "Tip: BuildKit enabled, Maven dependencies will use cache" -ForegroundColor Cyan
    }
    
    # Enable BuildKit to support cache mount functionality
    $env:DOCKER_BUILDKIT = "1"
    $env:COMPOSE_DOCKER_CLI_BUILD = "1"
    
    docker-compose @buildArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Image build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Image build completed" -ForegroundColor Green
} else {
    Write-Host "[3/5] Skipping image build" -ForegroundColor Yellow
}

# Start services
Write-Host ""
Write-Host "[4/5] Starting services..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Service startup failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Services started" -ForegroundColor Green

# Wait for services to be ready
Write-Host ""
Write-Host "[5/5] Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service status:" -ForegroundColor Yellow
docker-compose ps
Write-Host ""
Write-Host "View logs: docker-compose logs -f" -ForegroundColor Cyan
Write-Host "Stop services: docker-compose down" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host "  Backend API: http://localhost:8080/springboot1ngh61a2" -ForegroundColor White
Write-Host "  Frontend App: http://localhost:8080/springboot1ngh61a2/front/front/index.html" -ForegroundColor White
Write-Host "  Admin Panel: http://localhost:8080/springboot1ngh61a2/admin/admin/index.html" -ForegroundColor White
Write-Host ""
