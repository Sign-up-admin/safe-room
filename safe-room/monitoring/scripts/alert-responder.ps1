# Alert Response Automation Script for Fitness Gym System
# Features: Automated response to common alerts, service restart, scaling actions

param(
    [Parameter(Mandatory=$true)]
    [string]$AlertType,

    [Parameter(Mandatory=$false)]
    [string]$Instance = "backend",

    [Parameter(Mandatory=$false)]
    [ValidateSet("info", "warning", "critical")]
    [string]$Severity = "warning",

    [switch]$Help
)

$SCRIPT_VERSION = "1.0.0"
$LOG_FILE = ".\alert-responder_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Colors for output
$Colors = @{
    Red = [ConsoleColor]::Red
    Green = [ConsoleColor]::Green
    Yellow = [ConsoleColor]::Yellow
    Blue = [ConsoleColor]::Blue
    White = [ConsoleColor]::White
}

# Configuration
$SLACK_WEBHOOK_URL = $env:SLACK_WEBHOOK_URL
$EMAIL_RECIPIENTS = $env:EMAIL_RECIPIENTS

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

# Send Slack notification
function Send-SlackNotification {
    param([string]$Message, [string]$Channel = "#alerts")

    if ($SLACK_WEBHOOK_URL) {
        try {
            $payload = @{
                text = $Message
                channel = $Channel
            } | ConvertTo-Json

            Invoke-RestMethod -Uri $SLACK_WEBHOOK_URL -Method Post -Body $payload -ContentType 'application/json'
        } catch {
            Write-LogWarn "Failed to send Slack notification: $($_.Exception.Message)"
        }
    }
}

# Send email notification (simplified - requires SMTP configuration)
function Send-EmailNotification {
    param([string]$Subject, [string]$Body)

    # Note: This would require SMTP configuration in a real environment
    Write-LogInfo "Email notification: $Subject"
    Write-LogInfo "Recipients: $EMAIL_RECIPIENTS"
}

# Check service health
function Test-ServiceHealth {
    param([string]$Service)
    $maxAttempts = 3
    $attempt = 1

    Write-LogInfo "Checking health of service: $Service"

    while ($attempt -le $maxAttempts) {
        try {
            $status = docker-compose ps $Service
            if ($status -match "Up") {
                Write-LogSuccess "Service $Service is healthy"
                return $true
            }
        } catch {
            # Continue to next attempt
        }

        Write-LogWarn "Service $Service not healthy (attempt $attempt/$maxAttempts)"
        Start-Sleep -Seconds 5
        $attempt++
    }

    Write-LogError "Service $Service failed health check after $maxAttempts attempts"
    return $false
}

# Restart service
function Restart-Service {
    param([string]$Service)
    Write-LogInfo "Restarting service: $Service"

    try {
        docker-compose restart $Service
        Write-LogSuccess "Service $Service restarted successfully"

        # Wait for service to be ready
        Start-Sleep -Seconds 10

        # Check health after restart
        if (Test-ServiceHealth $Service) {
            Send-SlackNotification "✅ Service $Service restarted successfully" "#alerts"
            return $true
        } else {
            Write-LogError "Service $Service failed to start after restart"
            Send-SlackNotification "❌ Service $Service failed to start after restart" "#alerts-critical"
            return $false
        }
    } catch {
        Write-LogError "Failed to restart service: $Service. Error: $($_.Exception.Message)"
        Send-SlackNotification "❌ Failed to restart service $Service" "#alerts-critical"
        return $false
    }
}

# Scale service
function Scale-Service {
    param([string]$Service, [int]$Replicas)
    Write-LogInfo "Scaling service $Service to $Replicas replicas"

    try {
        docker-compose up -d --scale "$Service=$Replicas"
        Write-LogSuccess "Service $Service scaled to $Replicas replicas"

        # Wait for scaling to complete
        Start-Sleep -Seconds 15

        # Check health of scaled services
        if (Test-ServiceHealth $Service) {
            Send-SlackNotification "✅ Service $Service scaled to $Replicas replicas successfully" "#alerts"
            return $true
        } else {
            Write-LogError "Service $Service unhealthy after scaling"
            Send-SlackNotification "❌ Service $Service unhealthy after scaling to $Replicas replicas" "#alerts-critical"
            return $false
        }
    } catch {
        Write-LogError "Failed to scale service $Service. Error: $($_.Exception.Message)"
        Send-SlackNotification "❌ Failed to scale service $Service to $Replicas replicas" "#alerts-critical"
        return $false
    }
}

# Clean up disk space
function Clear-DiskSpace {
    Write-LogInfo "Performing disk cleanup..."

    # Clean Docker resources
    Write-LogInfo "Cleaning Docker resources..."
    try {
        docker system prune -f
        docker volume prune -f
        docker image prune -f
    } catch {
        Write-LogWarn "Docker cleanup failed: $($_.Exception.Message)"
    }

    # Note: Log file cleanup would require admin privileges on Windows
    Write-LogInfo "Log cleanup skipped on Windows (requires admin privileges)"

    # Clean temporary files
    Write-LogInfo "Cleaning temporary files..."
    try {
        Get-ChildItem -Path $env:TEMP -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force
    } catch {
        Write-LogWarn "Temp file cleanup failed: $($_.Exception.Message)"
    }

    Write-LogSuccess "Disk cleanup completed"
    Send-SlackNotification "🧹 Disk cleanup completed" "#alerts"
}

# Handle high CPU usage
function Handle-HighCPU {
    param([string]$Service = "backend")
    Write-LogInfo "Handling high CPU usage for service: $Service"

    # Get current replica count (simplified)
    $currentReplicas = 1  # Default assumption
    try {
        $status = docker-compose ps $Service
        $upCount = ($status | Select-String -Pattern "Up" | Measure-Object).Count
        if ($upCount -gt 0) { $currentReplicas = $upCount }
    } catch {
        Write-LogWarn "Could not determine current replica count"
    }

    $newReplicas = $currentReplicas + 1

    if ($newReplicas -le 5) {  # Max 5 replicas
        Write-LogInfo "Attempting to scale service to handle high CPU"
        if (Scale-Service $Service $newReplicas) {
            Send-SlackNotification "📈 Scaled $Service to $newReplicas replicas due to high CPU usage" "#alerts"
            return $true
        }
    }

    # If scaling fails or at max capacity, restart the service
    Write-LogInfo "Scaling not possible or failed, attempting service restart"
    return Restart-Service $Service
}

# Handle high memory usage
function Handle-HighMemory {
    param([string]$Service = "backend")
    Write-LogInfo "Handling high memory usage for service: $Service"

    # Restart service to free memory
    Write-LogInfo "Restarting service to free memory"
    return Restart-Service $Service
}

# Handle database connection issues
function Handle-DatabaseConnectionError {
    Write-LogInfo "Handling database connection error"

    # Check if database container is running
    try {
        $status = docker-compose ps postgres
        if ($status -notmatch "Up") {
            Write-LogInfo "Database container not running, restarting..."
            return Restart-Service "postgres"
        }
    } catch {
        Write-LogInfo "Database container not running, restarting..."
        return Restart-Service "postgres"
    }

    # Check database connectivity
    try {
        docker-compose exec -T postgres pg_isready -U postgres -d fitness_gym > $null 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-LogInfo "Database not responding, restarting..."
            return Restart-Service "postgres"
        }
    } catch {
        Write-LogInfo "Database connectivity check failed, restarting..."
        return Restart-Service "postgres"
    }

    Write-LogWarn "Database appears healthy, connection issue may be temporary"
    return $true
}

# Handle Redis connection issues
function Handle-RedisConnectionError {
    Write-LogInfo "Handling Redis connection error"
    return Restart-Service "redis"
}

# Handle API down
function Handle-APIDown {
    Write-LogInfo "Handling API down alert"
    return Restart-Service "backend"
}

# Handle MinIO down
function Handle-MinIODown {
    Write-LogInfo "Handling MinIO down alert"
    return Restart-Service "minio"
}

# Main alert response function
function Invoke-AlertResponse {
    param([string]$AlertType, [string]$Instance, [string]$Severity)

    Write-LogInfo "Responding to alert: $AlertType (severity: $Severity, instance: $Instance)"

    # Send initial response notification
    Send-SlackNotification "🤖 Auto-response triggered for: $AlertType" "#alerts"

    $result = $false

    switch ($AlertType) {
        "HighCPUUsage" {
            $result = Handle-HighCPU $Instance
        }
        "HighMemoryUsage" {
            $result = Handle-HighMemory $Instance
        }
        "LowDiskSpace" {
            Clear-DiskSpace
            $result = $true
        }
        "DatabaseConnectionError" {
            $result = Handle-DatabaseConnectionError
        }
        "RedisDown" {
            $result = Handle-RedisConnectionError
        }
        "APIDown" {
            $result = Handle-APIDown
        }
        "MinIODown" {
            $result = Handle-MinIODown
        }
        "ContainerRestarting" {
            Write-LogInfo "Container $Instance restarting frequently"
            $result = Restart-Service $Instance
        }
        default {
            Write-LogWarn "No automated response defined for alert type: $AlertType"
            Send-SlackNotification "⚠️ Manual intervention required for: $AlertType" "#alerts-critical"
            $result = $false
        }
    }

    Write-LogInfo "Alert response completed for: $AlertType"
    return $result
}

# Generate response report
function New-ResponseReport {
    param([string]$AlertType, [string]$ActionTaken, [bool]$Success)

    $reportFile = "alert-response-report-$(Get-Date -Format 'yyyyMMdd_HHmmss').md"

    $reportContent = @"
# 🤖 Alert Auto-Response Report

**Timestamp**: $(Get-Date)
**Alert Type**: $AlertType
**Action Taken**: $ActionTaken
**Success**: $(if ($Success) { "✅ Yes" } else { "❌ No" })

## Response Details

- **Alert**: $AlertType
- **Action**: $ActionTaken
- **Result**: $(if ($Success) { "Successful" } else { "Failed"})
- **Log File**: $LOG_FILE

## Next Steps

$(if ($Success) {
    "- ✅ Automated response completed successfully`n- Monitor system for continued stability"
} else {
    "- ❌ Automated response failed`n- Manual intervention required`n- Check system logs for detailed error information"
})

---
*Generated by alert responder v$SCRIPT_VERSION*
"@

    $reportContent | Out-File -FilePath $reportFile -Encoding UTF8
    Write-LogInfo "Response report generated: $reportFile"
}

# Show help
function Show-Help {
    $helpText = @"
Alert Response Automation Script v$SCRIPT_VERSION

Usage: .\alert-responder.ps1 -AlertType <AlertType> [-Instance <Instance>] [-Severity <Severity>]

Parameters:
    -AlertType     The type of alert to respond to (required)
    -Instance      The affected instance/service (default: backend)
    -Severity      Alert severity level (info/warning/critical, default: warning)
    -Help          Show this help message

Supported Alert Types:
    HighCPUUsage          Scale service or restart
    HighMemoryUsage       Restart service
    LowDiskSpace          Clean up disk space
    DatabaseConnectionError Restart database
    RedisDown             Restart Redis
    APIDown               Restart backend API
    MinIODown             Restart MinIO
    ContainerRestarting   Restart container

Examples:
    .\alert-responder.ps1 -AlertType HighCPUUsage -Instance backend -Severity warning
    .\alert-responder.ps1 -AlertType DatabaseConnectionError -Severity critical
    .\alert-responder.ps1 -AlertType APIDown

Environment Variables:
    SLACK_WEBHOOK_URL     Slack webhook URL for notifications
    EMAIL_RECIPIENTS      Email recipients for notifications

"@
    Write-Host $helpText
}

# Main function
function Invoke-Main {
    if ($Help) {
        Show-Help
        return
    }

    Write-LogInfo "🚨 Alert Responder started - Type: $AlertType, Instance: $Instance, Severity: $Severity"

    # Respond to the alert
    $startTime = Get-Date
    $success = Invoke-AlertResponse -AlertType $AlertType -Instance $Instance -Severity $Severity
    $endTime = Get-Date
    $duration = [math]::Round(($endTime - $startTime).TotalSeconds, 2)

    # Generate report
    New-ResponseReport -AlertType $AlertType -ActionTaken "Automated response" -Success $success

    Write-LogInfo "Alert response completed in ${duration}s"

    if ($success) {
        Write-LogSuccess "✅ Alert response successful"
        exit 0
    } else {
        Write-LogError "❌ Alert response failed"
        exit 1
    }
}

# Run main function
Invoke-Main
