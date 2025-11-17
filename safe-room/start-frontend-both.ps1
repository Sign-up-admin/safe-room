# 启动前端前台和后台
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

function Start-FrontendService {
    param(
        [string]$Name,
        [string]$Path,
        [int]$Port,
        [string]$LogFile
    )
    
    if (-not (Test-Path $Path)) {
        Write-Log "错误: $Name 目录不存在: $Path" "ERROR"
        return $null
    }
    
    # 检查端口是否被占用
    $portInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Log "警告: 端口 $Port 已被占用，$Name 可能会选择其他端口" "WARN"
    }
    
    # 检查 node_modules
    $nodeModulesPath = Join-Path $Path "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Log "${Name}: 检测到缺少 node_modules，正在安装依赖..." "INFO"
        Push-Location $Path
        try {
            npm install 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Log "${Name}: 依赖安装失败" "ERROR"
                return $null
            }
            Write-Log "${Name}: 依赖安装成功" "INFO"
        } finally {
            Pop-Location
        }
    }
    
    # 在新窗口中启动服务
    $command = "Set-Location '$Path'; Write-Host '[$Name] 正在启动...' -ForegroundColor Green; npm run dev 2>&1 | Tee-Object -FilePath '$LogFile'"
    $process = Start-Process -FilePath "powershell.exe" -ArgumentList @("-NoExit", "-NoLogo", "-Command", $command) -PassThru -WindowStyle Normal
    
    Write-Log "$Name 已启动 (PID: $($process.Id), 端口: $Port, 日志: $LogFile)" "INFO"
    return $process
}

try {
    Write-Log "=== 启动前端前台和后台 ===" "INFO"
    
    # 检查 Node.js 和 npm
    try {
        $nodeVersion = node --version 2>&1
        $npmVersion = npm --version 2>&1
        Write-Log "Node.js 版本: $nodeVersion, npm 版本: $npmVersion" "INFO"
    } catch {
        Write-Log "错误: Node.js 或 npm 未安装或不在 PATH 中" "ERROR"
        Write-Host "请先安装 Node.js: https://nodejs.org/" -ForegroundColor Red
        exit 1
    }
    
    $processes = @{}
    
    # 启动前台 (Front)
    $frontPath = Join-Path $scriptRoot "springboot1ngh61a2\src\main\resources\front\front"
    $frontLog = Join-Path $logDir "front-vite-$timestamp.log"
    $frontProcess = Start-FrontendService -Name "前台 (Front)" -Path $frontPath -Port 8082 -LogFile $frontLog
    if ($frontProcess) {
        $processes["front"] = $frontProcess
    }
    
    # 启动后台 (Admin)
    $adminPath = Join-Path $scriptRoot "springboot1ngh61a2\src\main\resources\admin\admin"
    $adminLog = Join-Path $logDir "admin-vite-$timestamp.log"
    $adminProcess = Start-FrontendService -Name "后台 (Admin)" -Path $adminPath -Port 8081 -LogFile $adminLog
    if ($adminProcess) {
        $processes["admin"] = $adminProcess
    }
    
    if ($processes.Count -eq 0) {
        Write-Log "错误: 未能启动任何前端服务" "ERROR"
        exit 1
    }
    
    Write-Log "所有前端服务已启动！" "INFO"
    Write-Log "前台访问地址: http://localhost:8082" "INFO"
    Write-Log "后台访问地址: http://localhost:8081" "INFO"
    Write-Log "日志文件保存在: $logDir" "INFO"
    Write-Log "按 Ctrl+C 停止服务，或关闭对应的 PowerShell 窗口" "INFO"
    
    # 保存进程信息
    $processInfo = @{
        createdAt = (Get-Date).ToString('s')
        processes = @{}
    }
    foreach ($key in $processes.Keys) {
        $processInfo.processes[$key] = @{
            pid = $processes[$key].Id
            port = if ($key -eq "front") { 8082 } else { 8081 }
        }
    }
    $processInfoPath = Join-Path $logDir "frontend-processes-$timestamp.json"
    $processInfo | ConvertTo-Json -Depth 5 | Set-Content $processInfoPath
    Write-Log "进程信息已保存到: $processInfoPath" "INFO"
    
} catch {
    Write-Log "启动过程中发生错误: $($_.Exception.Message)" "ERROR"
    Write-Host $_.Exception.StackTrace -ForegroundColor Red
    exit 1
}

