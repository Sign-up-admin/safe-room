<#
    start-all.ps1
    Launch PostgreSQL, Spring Boot, front-end, and admin dev servers.
#>

[CmdletBinding()]
param(
    [switch]$SkipDatabase,
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$SkipAdmin,
    [switch]$SkipChecks
)

$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptRoot

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$logDir = Join-Path $scriptRoot 'logs'
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

$masterLog = Join-Path $logDir "start-all-$timestamp.log"
$processInfoPath = Join-Path $logDir 'start-all-processes.json'

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet('INFO','WARN','ERROR')]
        [string]$Level = 'INFO'
    )
    $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $formatted = "[$stamp] [$Level] $Message"
    Add-Content -Path $masterLog -Value $formatted
    switch ($Level) {
        'ERROR' { Write-Host $formatted -ForegroundColor Red }
        'WARN'  { Write-Host $formatted -ForegroundColor Yellow }
        Default { Write-Host $formatted -ForegroundColor Cyan }
    }
}

function Ensure-Command {
    param(
        [string]$Command,
        [string]$FriendlyName
    )
    try {
        & $Command --version > $null 2>&1
        Write-Log "$FriendlyName check passed"
    } catch {
        Write-Log "$FriendlyName is missing or not in PATH (command: $Command)" 'ERROR'
        throw
    }
}

function Wait-PortReady {
    param(
        [int]$Port,
        [string]$Hostname = '127.0.0.1',
        [int]$TimeoutSeconds = 180,
        [string]$ServiceName = 'service'
    )
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $endpoint = '{0}:{1}' -f $Hostname, $Port
    while ((Get-Date) -lt $deadline) {
        $client = $null
        try {
            $client = [System.Net.Sockets.TcpClient]::new()
            $client.Connect($Hostname, $Port)
            $client.Dispose()
            Write-Log "$ServiceName port $endpoint is ready"
            return $true
        } catch {
            Start-Sleep -Milliseconds 250
        } finally {
            if ($client) {
                $client.Dispose()
            }
        }
        Start-Sleep -Seconds 2
    }
    Write-Log "$ServiceName did not open $endpoint within $TimeoutSeconds seconds" 'WARN'
    return $false
}

function Wait-DatabaseHealthy {
    param(
        [string]$ContainerName,
        [int]$TimeoutSeconds = 180
    )
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $status = docker inspect --format='{{.State.Health.Status}}' $ContainerName 2>$null
        if ($status -eq 'healthy') {
            Write-Log "Database container $ContainerName is healthy"
            return $true
        }
        Start-Sleep -Seconds 3
    }
    Write-Log "Timed out waiting for $ContainerName health check" 'WARN'
    return $false
}

function Test-PortInUse {
    param([int]$Port)
    try {
        $conn = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
        return [bool]$conn
    } catch {
        return $false
    }
}

function Start-ServiceWindow {
    param(
        [string]$Name,
        [string]$WorkingDirectory,
        [string]$CommandText,
        [string]$LogPath
    )
    if (-not (Test-Path $WorkingDirectory)) {
        Write-Log "$Name directory not found: $WorkingDirectory" 'ERROR'
        throw "$Name directory not found"
    }

    $commandTemplate = "Set-Location '{0}'; Write-Host '[{1}] starting...' -ForegroundColor Green; {2} 2>&1 | Tee-Object -FilePath '{3}'"
    $command = [string]::Format($commandTemplate, $WorkingDirectory, $Name, $CommandText, $LogPath)
    $arguments = @('-NoExit','-NoLogo','-Command', $command)

    $process = Start-Process -FilePath 'powershell.exe' -ArgumentList $arguments -WorkingDirectory $WorkingDirectory -PassThru -WindowStyle Normal
    Write-Log "$Name started. Log: $LogPath. PID: $($process.Id)"
    return $process
}

try {
    Write-Log '=== Full-stack dev launcher ==='

    if ($SkipChecks) {
        Write-Log 'Skipping dependency checks (--SkipChecks)'
    } else {
        Ensure-Command -Command 'docker' -FriendlyName 'Docker'
        Ensure-Command -Command 'java' -FriendlyName 'Java'
        Ensure-Command -Command 'mvn' -FriendlyName 'Maven'
        Ensure-Command -Command 'node' -FriendlyName 'Node.js'
        Ensure-Command -Command 'npm' -FriendlyName 'npm'
    }

    $processInfo = @{
        createdAt = (Get-Date).ToString('s')
        log = $masterLog
    }

    if (-not $SkipDatabase) {
        $containerName = 'fitness_gym_postgres'
        $existingId = docker ps -q -f "name=$containerName"
        if ([string]::IsNullOrEmpty($existingId)) {
            Write-Log 'Starting PostgreSQL container...'
            & "$scriptRoot\start-db.ps1"
        } else {
            Write-Log "PostgreSQL container already running: $containerName"
        }
        Wait-DatabaseHealthy -ContainerName $containerName | Out-Null
        Wait-PortReady -Port 5432 -ServiceName 'PostgreSQL' | Out-Null
    } else {
        Write-Log 'Skipping database (--SkipDatabase)'
    }

    if (-not $SkipBackend) {
        $backendDir = Join-Path $scriptRoot 'springboot1ngh61a2'
        if (Test-PortInUse -Port 8080) {
            Write-Log 'Warning: port 8080 already in use; Spring Boot may fail to bind' 'WARN'
        }
        $backendLog = Join-Path $logDir "backend-$timestamp.log"
        $backendProcess = Start-ServiceWindow -Name 'Spring Boot backend' -WorkingDirectory $backendDir -CommandText 'mvn spring-boot:run' -LogPath $backendLog
        $processInfo.backend = @{
            pid = $backendProcess.Id
            log = $backendLog
            port = 8080
        }
        Wait-PortReady -Port 8080 -ServiceName 'Spring Boot backend' | Out-Null
    } else {
        Write-Log 'Skipping backend (--SkipBackend)'
    }

    if (-not $SkipFrontend) {
        $frontDir = Join-Path $scriptRoot 'springboot1ngh61a2\src\main\resources\front\front'
        if (Test-PortInUse -Port 8082) {
            Write-Log 'Note: port 8082 already in use; Vite will pick another port' 'WARN'
        }
        $frontLog = Join-Path $logDir "front-vite-$timestamp.log"
        $frontProcess = Start-ServiceWindow -Name 'Front Vite' -WorkingDirectory $frontDir -CommandText 'npm run dev' -LogPath $frontLog
        $processInfo.frontend = @{
            pid = $frontProcess.Id
            log = $frontLog
            port = 8082
        }
        Wait-PortReady -Port 8082 -ServiceName 'Front Vite' | Out-Null
    } else {
        Write-Log 'Skipping front-end (--SkipFrontend)'
    }

    if (-not $SkipAdmin) {
        $adminDir = Join-Path $scriptRoot 'springboot1ngh61a2\src\main\resources\admin\admin'
        if (Test-PortInUse -Port 8081) {
            Write-Log 'Note: port 8081 already in use; admin Vite will pick another port' 'WARN'
        }
        $adminLog = Join-Path $logDir "admin-vite-$timestamp.log"
        $adminProcess = Start-ServiceWindow -Name 'Admin Vite' -WorkingDirectory $adminDir -CommandText 'npm run dev' -LogPath $adminLog
        $processInfo.admin = @{
            pid = $adminProcess.Id
            log = $adminLog
            port = 8081
        }
        Wait-PortReady -Port 8081 -ServiceName 'Admin Vite' | Out-Null
    } else {
        Write-Log 'Skipping admin (--SkipAdmin)'
    }

    $processInfo | ConvertTo-Json -Depth 5 | Set-Content $processInfoPath
    Write-Log "Process info written to: $processInfoPath"
    Write-Log 'All services triggered. Check each console window for live logs.'
    Write-Log 'Use .\stop-all.ps1 to stop services when finished.'
} catch {
    Write-Log "Error while launching services: $($_.Exception.Message)" 'ERROR'
    throw
}


