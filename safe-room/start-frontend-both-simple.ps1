# 启动两个前端服务 - 简化的版本
$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logDir = Join-Path $scriptRoot "logs"

# 创建日志目录
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    $color = "Cyan"
    if ($Level -eq "ERROR") {
        $color = "Red"
    } elseif ($Level -eq "WARN") {
        $color = "Yellow"
    }
    Write-Host $logMessage -ForegroundColor $color
}

try {
    Write-Log "=== 启动前端前台和后台 ===" "INFO"

    # 检查 Node.js 和 npm
    $nodeVersion = node --version 2>&1
    $npmVersion = npm --version 2>&1
    Write-Log "Node.js 版本: $nodeVersion, npm 版本: $npmVersion" "INFO"

    # 启动前台 (端口 8082)
    $frontPath = Join-Path $scriptRoot "springboot1ngh61a2\src\main\resources\front\front"
    if (Test-Path $frontPath) {
        Write-Log "启动前台服务..." "INFO"
        $frontCommand = "cd '$frontPath'; npm run dev -- --port 8082"
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "start", "cmd.exe", "/k", $frontCommand -WindowStyle Normal
        Write-Log "前台服务已启动 (端口 8082)" "INFO"
    } else {
        Write-Log "前台目录不存在: $frontPath" "ERROR"
    }

    # 启动后台 (端口 8081)
    $adminPath = Join-Path $scriptRoot "springboot1ngh61a2\src\main\resources\admin\admin"
    if (Test-Path $adminPath) {
        Write-Log "启动后台服务..." "INFO"
        $adminCommand = "cd '$adminPath'; npm run dev -- --port 8081"
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "start", "cmd.exe", "/k", $adminCommand -WindowStyle Normal
        Write-Log "后台服务已启动 (端口 8081)" "INFO"
    } else {
        Write-Log "后台目录不存在: $adminPath" "ERROR"
    }

    Write-Log "所有前端服务启动完成！" "INFO"
    Write-Log "前台访问地址: http://localhost:8082" "INFO"
    Write-Log "后台访问地址: http://localhost:8081" "INFO"
    Write-Log "按 Ctrl+C 或关闭对应的命令窗口来停止服务" "INFO"

} catch {
    Write-Log "启动过程中发生错误: $($_.Exception.Message)" "ERROR"
    exit 1
}
