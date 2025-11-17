# PowerShell script to start PostgreSQL database in Docker
# Usage: .\start-db.ps1

Write-Host "Starting PostgreSQL database container..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "Warning: .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "Please edit .env file with your configuration before continuing." -ForegroundColor Yellow
    } else {
        Write-Host "Error: .env.example not found. Please create .env file manually." -ForegroundColor Red
        exit 1
    }
}

# Start Docker Compose
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database container started successfully!" -ForegroundColor Green
    Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
    
    # Wait for health check
    $maxAttempts = 30
    $attempt = 0
    $ready = $false
    
    while ($attempt -lt $maxAttempts -and -not $ready) {
        Start-Sleep -Seconds 2
        $health = docker inspect --format='{{.State.Health.Status}}' fitness_gym_postgres 2>$null
        if ($health -eq "healthy") {
            $ready = $true
            Write-Host "Database is ready!" -ForegroundColor Green
        } else {
            $attempt++
            Write-Host "Waiting... ($attempt/$maxAttempts)" -ForegroundColor Yellow
        }
    }
    
    if ($ready) {
        Write-Host "`nDatabase connection info:" -ForegroundColor Cyan
        Write-Host "  Host: localhost" -ForegroundColor White
        Write-Host "  Port: 5432" -ForegroundColor White
        Write-Host "  Database: fitness_gym" -ForegroundColor White
        Write-Host "  User: postgres" -ForegroundColor White
        Write-Host "`nTo view logs: docker-compose logs -f postgres" -ForegroundColor Cyan
        Write-Host "To stop: docker-compose down" -ForegroundColor Cyan
    } else {
        Write-Host "Warning: Database may not be fully ready. Check logs with: docker-compose logs postgres" -ForegroundColor Yellow
    }
} else {
    Write-Host "Failed to start database container. Check Docker is running." -ForegroundColor Red
    exit 1
}

