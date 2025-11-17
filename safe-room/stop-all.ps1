param(
    [switch]$WithDatabase
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptRoot

$logDir = Join-Path $scriptRoot "logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

$logPath = Join-Path $logDir ("stop-all-{0}.log" -f (Get-Date -Format "yyyyMMdd_HHmmss"))
$processInfoPath = Join-Path $logDir "start-all-processes.json"

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("INFO","WARN","ERROR")]
        [string]$Level = "INFO"
    )
    $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $formatted = "[$stamp] [$Level] $Message"
    Add-Content -Path $logPath -Value $formatted
    if ($Level -eq "ERROR") {
        Write-Host $formatted -ForegroundColor Red
    } elseif ($Level -eq "WARN") {
        Write-Host $formatted -ForegroundColor Yellow
    } else {
        Write-Host $formatted -ForegroundColor Green
    }
}

if (-not (Test-Path $processInfoPath)) {
    Write-Log "start-all-processes.json not found; nothing to stop." "ERROR"
    throw "Missing process info file: $processInfoPath"
}

$processInfo = Get-Content $processInfoPath -Raw | ConvertFrom-Json
$stopped = @()

function Stop-ServiceProcess {
    param(
        [pscustomobject]$Entry,
        [string]$Key
    )
    if (-not $Entry -or -not $Entry.pid) {
        Write-Log "$Key has no recorded PID. Skipping." "WARN"
        return
    }
    try {
        $proc = Get-Process -Id $Entry.pid -ErrorAction Stop
        Stop-Process -Id $Entry.pid -Force
        Write-Log "Stopped $Key (PID $($Entry.pid))"
        $script:stopped += $Key
    } catch {
        Write-Log "$Key (PID $($Entry.pid)) is not running." "WARN"
    }
}

Stop-ServiceProcess -Entry $processInfo.admin -Key "Admin Vite"
Stop-ServiceProcess -Entry $processInfo.frontend -Key "Front Vite"
Stop-ServiceProcess -Entry $processInfo.backend -Key "Spring Boot backend"

if ($WithDatabase) {
    Write-Log "Stopping database container (docker-compose down)"
    docker-compose down
}

Remove-Item $processInfoPath -ErrorAction SilentlyContinue

Write-Log ("Services targeted for stop: {0}" -f ($stopped -join ", "))
Write-Log "stop-all.ps1 finished."


