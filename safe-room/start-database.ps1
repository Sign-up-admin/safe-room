# Auto start PostgreSQL database script
Write-Host "Starting PostgreSQL database..." -ForegroundColor Green

# Check if Docker is running
$dockerRunning = $false
try {
    $result = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
        Write-Host "Docker is running" -ForegroundColor Green
    }
} catch {
    $dockerRunning = $false
}

# If Docker is not running, try to start Docker Desktop
if (-not $dockerRunning) {
    Write-Host "Docker is not running, trying to start Docker Desktop..." -ForegroundColor Yellow
    
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
        Write-Host "Docker Desktop started, waiting for Docker engine..." -ForegroundColor Yellow
        
        $maxWait = 60
        $waited = 0
        while ($waited -lt $maxWait) {
            Start-Sleep -Seconds 2
            $waited += 2
            try {
                $result = docker ps 2>&1
                if ($LASTEXITCODE -eq 0) {
                    $dockerRunning = $true
                    Write-Host "Docker is ready!" -ForegroundColor Green
                    break
                }
            } catch {
                # Continue waiting
            }
            Write-Host "Waiting for Docker... ($waited/$maxWait seconds)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Docker Desktop not found, please start it manually" -ForegroundColor Red
        exit 1
    }
}

if (-not $dockerRunning) {
    Write-Host "Docker startup timeout, please start Docker Desktop manually" -ForegroundColor Red
    exit 1
}

# Start PostgreSQL container
Write-Host "Starting PostgreSQL container..." -ForegroundColor Green
docker-compose up -d postgres

if ($LASTEXITCODE -eq 0) {
    Write-Host "PostgreSQL container started!" -ForegroundColor Green
    Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
    
    $maxAttempts = 30
    $attempt = 0
    $ready = $false
    
    while ($attempt -lt $maxAttempts -and -not $ready) {
        Start-Sleep -Seconds 2
        $attempt++
        try {
            $health = docker inspect --format='{{.State.Health.Status}}' fitness_gym_postgres 2>$null
            if ($health -eq "healthy") {
                $ready = $true
                Write-Host "Database is ready!" -ForegroundColor Green
            } else {
                Write-Host "Waiting for database... ($attempt/$maxAttempts)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "Waiting for database... ($attempt/$maxAttempts)" -ForegroundColor Yellow
        }
    }
    
    if ($ready) {
        Write-Host ""
        Write-Host "Database connection info:" -ForegroundColor Cyan
        Write-Host "  Host: localhost" -ForegroundColor White
        Write-Host "  Port: 5432" -ForegroundColor White
        Write-Host "  Database: fitness_gym" -ForegroundColor White
        Write-Host "  User: postgres" -ForegroundColor White
        Write-Host "  Password: postgres" -ForegroundColor White
    } else {
        Write-Host "Database may not be fully ready yet" -ForegroundColor Yellow
    }
} else {
    Write-Host "Failed to start PostgreSQL container" -ForegroundColor Red
    exit 1
}
