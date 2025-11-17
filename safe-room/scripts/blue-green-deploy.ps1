# Blue-Green Deployment Script for Fitness Gym System
# Features: Zero-downtime deployment, automatic rollback, health checks

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("deploy", "status", "rollback")]
    [string]$Action = "deploy",

    [switch]$Help
)

$SCRIPT_VERSION = "1.0.0"
$LOG_FILE = ".\blue-green-deploy_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Colors for output
$Colors = @{
    Red = [ConsoleColor]::Red
    Green = [ConsoleColor]::Green
    Yellow = [ConsoleColor]::Yellow
    Blue = [ConsoleColor]::Blue
    White = [ConsoleColor]::White
}

# Configuration
$BLUE_PORT = $env:BLUE_PORT ? $env:BLUE_PORT : 8080
$GREEN_PORT = $env:GREEN_PORT ? $env:GREEN_PORT : 8081
$BACKUP_DIR = ".\deployment_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$CURRENT_COLOR_FILE = ".\current_deployment_color.txt"

# Logging functions
function Write-LogInfo {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [INFO] $Message"
    Write-Host $logMessage -ForegroundColor $Colors.Blue
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Write-LogWarn {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [WARN] $Message"
    Write-Host $logMessage -ForegroundColor $Colors.Yellow
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Write-LogError {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [ERROR] $Message"
    Write-Host $logMessage -ForegroundColor $Colors.Red
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Write-LogSuccess {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [SUCCESS] $Message"
    Write-Host $logMessage -ForegroundColor $Colors.Green
    Add-Content -Path $LOG_FILE -Value $logMessage
}

# Get current deployment color
function Get-CurrentColor {
    if (Test-Path $CURRENT_COLOR_FILE) {
        Get-Content $CURRENT_COLOR_FILE -Raw
    } else {
        "blue"  # Default to blue
    }
}

# Update current deployment color
function Update-CurrentColor {
    param([string]$NewColor)
    $NewColor | Out-File -FilePath $CURRENT_COLOR_FILE -Encoding UTF8
    Write-LogInfo "Updated current deployment color to: $NewColor"
}

# Switch traffic between blue and green
function Switch-Traffic {
    param([string]$NewColor)
    Write-LogInfo "Switching traffic to $NewColor environment..."

    # Note: In Windows/IIS environment, you would update IIS configuration here
    # For this example, we'll simulate the traffic switch
    if ($NewColor -eq "blue") {
        Write-LogInfo "Traffic switched to blue environment (port $BLUE_PORT)"
    } else {
        Write-LogInfo "Traffic switched to green environment (port $GREEN_PORT)"
    }

    Write-LogSuccess "Traffic switch completed"
}

# Wait for service to be ready
function Wait-Service {
    param([int]$Port)
    $maxAttempts = 30
    $attempt = 1

    Write-LogInfo "Waiting for service on port $Port to be ready..."

    while ($attempt -le $maxAttempts) {
        Write-LogInfo "Health check attempt $attempt/$maxAttempts"

        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$Port/springboot1ngh61a2/user/login" -TimeoutSec 10 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-LogSuccess "Service is ready on port $Port"
                return $true
            }
        } catch {
            # Service not ready yet
        }

        Write-LogInfo "Service not ready yet, waiting 10 seconds..."
        Start-Sleep -Seconds 10
        $attempt++
    }

    Write-LogError "Service failed to start on port $Port after $maxAttempts attempts"
    return $false
}

# Run smoke tests
function Test-SmokeTests {
    param([int]$Port)
    Write-LogInfo "Running smoke tests on port $Port..."

    $testsPassed = 0
    $totalTests = 0

    # Test basic endpoints
    $totalTests++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/springboot1ngh61a2/user/login" -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-LogSuccess "✅ Login endpoint test passed"
            $testsPassed++
        } else {
            Write-LogError "❌ Login endpoint test failed with status: $($response.StatusCode)"
        }
    } catch {
        Write-LogError "❌ Login endpoint test failed: $($_.Exception.Message)"
    }

    $totalTests++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/springboot1ngh61a2/api/courses" -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-LogSuccess "✅ Courses API test passed"
            $testsPassed++
        } else {
            Write-LogError "❌ Courses API test failed with status: $($response.StatusCode)"
        }
    } catch {
        Write-LogError "❌ Courses API test failed: $($_.Exception.Message)"
    }

    $totalTests++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/springboot1ngh61a2/actuator/health" -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-LogSuccess "✅ Health endpoint test passed"
            $testsPassed++
        } else {
            Write-LogError "❌ Health endpoint test failed with status: $($response.StatusCode)"
        }
    } catch {
        Write-LogError "❌ Health endpoint test failed: $($_.Exception.Message)"
    }

    $successRate = [math]::Round(($testsPassed / $totalTests) * 100, 2)
    Write-LogInfo "Smoke tests completed: $testsPassed/$totalTests passed ($successRate%)"

    if ($successRate -ge 80) {
        return $true
    } else {
        Write-LogError "Smoke tests failed: success rate too low ($successRate%)"
        return $false
    }
}

# Create backup
function New-Backup {
    Write-LogInfo "Creating deployment backup..."

    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null

    # Backup docker-compose files
    if (Test-Path "docker-compose.yml") {
        Copy-Item "docker-compose.yml" $BACKUP_DIR
    }

    if (Test-Path ".env") {
        Copy-Item ".env" $BACKUP_DIR
    }

    # Backup current running containers state
    try {
        docker-compose config > "$BACKUP_DIR\running-config.yml" 2>$null
    } catch {
        # Ignore errors
    }

    Write-LogSuccess "Backup created at: $BACKUP_DIR"
}

# Rollback deployment
function Invoke-Rollback {
    param([string]$TargetColor)
    Write-LogWarn "Rolling back to $TargetColor environment..."

    # Stop the failed environment
    if ($TargetColor -eq "blue") {
        try { docker-compose -f docker-compose.green.yml down } catch { }
    } else {
        try { docker-compose -f docker-compose.blue.yml down } catch { }
    }

    # Switch traffic back to the working environment
    Switch-Traffic $TargetColor

    # Restore from backup if needed
    if (Test-Path $BACKUP_DIR) {
        Write-LogInfo "Restoring configuration from backup..."
        if (Test-Path "$BACKUP_DIR\docker-compose.yml") {
            Copy-Item "$BACKUP_DIR\docker-compose.yml" .
        }
        if (Test-Path "$BACKUP_DIR\.env") {
            Copy-Item "$BACKUP_DIR\.env" .
        }
    }

    Write-LogSuccess "Rollback completed"
}

# Main blue-green deployment function
function Invoke-BlueGreenDeployment {
    $startTime = Get-Date

    Write-LogInfo "🚀 Starting blue-green deployment..."

    # Get current deployment color
    $currentColor = Get-CurrentColor
    $newColor = if ($currentColor -eq "blue") { "green" } else { "blue" }
    $oldPort = if ($currentColor -eq "blue") { $BLUE_PORT } else { $GREEN_PORT }
    $newPort = if ($newColor -eq "blue") { $BLUE_PORT } else { $GREEN_PORT }

    Write-LogInfo "Current environment: $currentColor (port $oldPort)"
    Write-LogInfo "New environment: $newColor (port $newPort)"

    # Create backup
    New-Backup

    # Start new environment
    Write-LogInfo "🚀 Starting $newColor environment..."
    try {
        if ($newColor -eq "blue") {
            docker-compose -f docker-compose.blue.yml up -d
        } else {
            docker-compose -f docker-compose.green.yml up -d
        }
    } catch {
        Write-LogError "Failed to start $newColor environment: $($_.Exception.Message)"
        Invoke-Rollback $currentColor
        return $false
    }

    # Wait for new environment to be ready
    if (-not (Wait-Service $newPort)) {
        Write-LogError "New environment failed to start"
        Invoke-Rollback $currentColor
        return $false
    }

    # Run smoke tests
    Write-LogInfo "🧪 Running smoke tests..."
    if (-not (Test-SmokeTests $newPort)) {
        Write-LogError "Smoke tests failed"
        # Stop the failed environment
        try {
            if ($newColor -eq "blue") {
                docker-compose -f docker-compose.blue.yml down
            } else {
                docker-compose -f docker-compose.green.yml down
            }
        } catch {
            # Ignore errors during cleanup
        }
        Invoke-Rollback $currentColor
        return $false
    }

    # Switch traffic
    Write-LogSuccess "✅ Tests passed, switching traffic..."
    Switch-Traffic $newColor

    # Wait a moment for traffic to switch
    Start-Sleep -Seconds 5

    # Verify the switch worked
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/springboot1ngh61a2/user/login" -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-LogSuccess "✅ Traffic switch successful"

            # Stop old environment
            Write-LogInfo "🧹 Stopping $currentColor environment..."
            try {
                if ($currentColor -eq "blue") {
                    docker-compose -f docker-compose.blue.yml down
                } else {
                    docker-compose -f docker-compose.green.yml down
                }
            } catch {
                Write-LogWarn "Warning: Failed to stop old environment: $($_.Exception.Message)"
            }

            # Update current color
            Update-CurrentColor $newColor

            $endTime = Get-Date
            $duration = [math]::Round(($endTime - $startTime).TotalSeconds, 2)

            Write-LogSuccess "🎉 Blue-green deployment completed successfully in ${duration}s"
            return $true
        } else {
            Write-LogError "Traffic switch failed - received status: $($response.StatusCode)"
        }
    } catch {
        Write-LogError "Traffic switch failed: $($_.Exception.Message)"
    }

    Invoke-Rollback $currentColor
    return $false
}

# Generate deployment report
function New-DeploymentReport {
    param(
        [string]$Status,
        [DateTime]$StartTime
    )

    $endTime = Get-Date
    $duration = [math]::Round(($endTime - $StartTime).TotalSeconds, 2)
    $currentColor = Get-CurrentColor

    Write-LogInfo "📊 Generating deployment report..."

    $reportContent = @"
# 🚀 Blue-Green Deployment Report

**Deployment Time**: $($StartTime.ToString('yyyy-MM-dd HH:mm:ss'))
**Duration**: $duration seconds
**Status**: $Status
**Current Environment**: $currentColor (Port $(if ($currentColor -eq "blue") { $BLUE_PORT } else { $GREEN_PORT }))

## Deployment Details

- **Blue Environment**: Port $BLUE_PORT
- **Green Environment**: Port $GREEN_PORT
- **Traffic Switch**: $(if ($Status -eq "SUCCESS") { "Completed" } else { "Failed" })

## Environment Status

### Blue Environment
- **Status**: $(try { (docker-compose -f docker-compose.blue.yml ps --services --filter "status=running" | Measure-Object).Count } catch { 0 }) services running
- **Port**: $BLUE_PORT

### Green Environment
- **Status**: $(try { (docker-compose -f docker-compose.green.yml ps --services --filter "status=running" | Measure-Object).Count } catch { 0 }) services running
- **Port**: $GREEN_PORT

## Health Checks

- **Login Endpoint**: $(try { $r = Invoke-WebRequest -Uri "http://localhost:$BLUE_PORT/springboot1ngh61a2/user/login" -TimeoutSec 5; if ($r.StatusCode -eq 200) { "✅ Blue" } else { "❌ Blue" } } catch { "❌ Blue" }) | $(try { $r = Invoke-WebRequest -Uri "http://localhost:$GREEN_PORT/springboot1ngh61a2/user/login" -TimeoutSec 5; if ($r.StatusCode -eq 200) { "✅ Green" } else { "❌ Green" } } catch { "❌ Green" })
- **Courses API**: $(try { $r = Invoke-WebRequest -Uri "http://localhost:$BLUE_PORT/springboot1ngh61a2/api/courses" -TimeoutSec 5; if ($r.StatusCode -eq 200) { "✅ Blue" } else { "❌ Blue" } } catch { "❌ Blue" }) | $(try { $r = Invoke-WebRequest -Uri "http://localhost:$GREEN_PORT/springboot1ngh61a2/api/courses" -TimeoutSec 5; if ($r.StatusCode -eq 200) { "✅ Green" } else { "❌ Green" } } catch { "❌ Green" })
- **Health Endpoint**: $(try { $r = Invoke-WebRequest -Uri "http://localhost:$BLUE_PORT/springboot1ngh61a2/actuator/health" -TimeoutSec 5; if ($r.StatusCode -eq 200) { "✅ Blue" } else { "❌ Blue" } } catch { "❌ Blue" }) | $(try { $r = Invoke-WebRequest -Uri "http://localhost:$GREEN_PORT/springboot1ngh61a2/actuator/health" -TimeoutSec 5; if ($r.StatusCode -eq 200) { "✅ Green" } else { "❌ Green" } } catch { "❌ Green" })

## Logs

- **Deployment Log**: $LOG_FILE
- **Backup Directory**: $BACKUP_DIR

---
*Generated by blue-green deployment script v$SCRIPT_VERSION*
"@

    $reportContent | Out-File -FilePath "blue-green-deployment-report.md" -Encoding UTF8
    Write-LogInfo "Deployment report generated: blue-green-deployment-report.md"
}

# Show help
function Show-Help {
    $helpText = @"
Blue-Green Deployment Script v$SCRIPT_VERSION

Usage: .\blue-green-deploy.ps1 [-Action] <String> [Parameters]

Actions:
    deploy       Perform blue-green deployment (default)
    status       Show current deployment status
    rollback     Rollback to previous environment

Parameters:
    -Help        Show this help message

Examples:
    .\blue-green-deploy.ps1                      # Perform blue-green deployment
    .\blue-green-deploy.ps1 -Action deploy      # Same as above
    .\blue-green-deploy.ps1 -Action status      # Show deployment status
    .\blue-green-deploy.ps1 -Action rollback    # Rollback deployment

Environment Variables:
    BLUE_PORT    Port for blue environment (default: 8080)
    GREEN_PORT   Port for green environment (default: 8081)

"@
    Write-Host $helpText
}

# Show deployment status
function Show-Status {
    $currentColor = Get-CurrentColor
    $blueRunning = try { (docker-compose -f docker-compose.blue.yml ps --services --filter "status=running" 2>$null | Measure-Object).Count } catch { 0 }
    $greenRunning = try { (docker-compose -f docker-compose.green.yml ps --services --filter "status=running" 2>$null | Measure-Object).Count } catch { 0 }

    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Blue-Green Deployment Status" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Current Environment: $currentColor" -ForegroundColor White
    Write-Host "Blue Environment: $blueRunning services running (Port: $BLUE_PORT)" -ForegroundColor White
    Write-Host "Green Environment: $greenRunning services running (Port: $GREEN_PORT)" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "Active Port: $(if ($currentColor -eq "blue") { $BLUE_PORT } else { $GREEN_PORT })" -ForegroundColor White
    Write-Host "=========================================" -ForegroundColor Cyan
}

# Main function
function Invoke-Main {
    if ($Help) {
        Show-Help
        return
    }

    switch ($Action) {
        "deploy" {
            Write-LogInfo "Starting blue-green deployment process..."
            $DEPLOYMENT_START_TIME = Get-Date

            if (Invoke-BlueGreenDeployment) {
                Write-LogSuccess "Blue-green deployment completed successfully"
                New-DeploymentReport "SUCCESS" $DEPLOYMENT_START_TIME
            } else {
                Write-LogError "Blue-green deployment failed"
                New-DeploymentReport "FAILED" $DEPLOYMENT_START_TIME
                exit 1
            }
        }
        "status" {
            Show-Status
        }
        "rollback" {
            Write-LogInfo "Starting rollback process..."
            $currentColor = Get-CurrentColor
            $targetColor = if ($currentColor -eq "blue") { "green" } else { "blue" }
            Invoke-Rollback $targetColor
        }
        default {
            Write-LogError "Unknown action: $Action"
            Show-Help
            exit 1
        }
    }
}

# Run main function
Invoke-Main
