# 启动前端并捕获错误
$ErrorActionPreference = "Stop"
$frontendPath = "springboot1ngh61a2\src\main\resources\front\front"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$logDir = Join-Path $scriptRoot "logs"
$installLog = Join-Path $logDir "npm-install-$timestamp.log"
$devLog = Join-Path $logDir "vite-dev-$timestamp.log"
$errorLog = Join-Path $logDir "errors-$timestamp.log"

# 创建日志目录
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $errorLog -Value $logMessage
    Write-Host $logMessage
}

try {
Write-Log "Start frontend dev server..." "INFO"
Write-Host "Working directory: $PWD\$frontendPath" -ForegroundColor Yellow

    # 检查 Node.js 是否安装
    try {
        $nodeVersion = node --version 2>&1
        Write-Log "Node.js 版本: $nodeVersion" "INFO"
    } catch {
        Write-Log "Error: Node.js not installed or missing from PATH" "ERROR"
        Write-Host "Please install Node.js first: https://nodejs.org/" -ForegroundColor Red
        exit 1
    }

    # 检查 npm 是否安装
    try {
        $npmVersion = npm --version 2>&1
        Write-Log "npm 版本: $npmVersion" "INFO"
    } catch {
        Write-Log "Error: npm not installed or missing from PATH" "ERROR"
        Write-Host "Please install npm first" -ForegroundColor Red
        exit 1
    }

    # 切换到前端目录
    if (-not (Test-Path $frontendPath)) {
        Write-Log "Error: frontend directory not found: $frontendPath" "ERROR"
        exit 1
    }
    Set-Location $frontendPath
    Write-Log "已切换到目录: $(Get-Location)" "INFO"

    # 检查 package.json 是否存在
    if (-not (Test-Path "package.json")) {
        Write-Log "Error: package.json not found" "ERROR"
        exit 1
    }

    # 检查并安装依赖
    if (-not (Test-Path "node_modules")) {
        Write-Log "node_modules missing, installing dependencies..." "INFO"
        Write-Host "Installing dependencies, this may take a few minutes..." -ForegroundColor Yellow
        
        $installOutput = npm install 2>&1 | Tee-Object -FilePath $installLog
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Dependency install failed, exit code: $LASTEXITCODE" "ERROR"
            Write-Host "Install logs saved to: $installLog" -ForegroundColor Red
            Write-Host "Please review the log file for details" -ForegroundColor Red
            exit 1
        }
        Write-Log "依赖安装成功" "INFO"
    } else {
        Write-Log "node_modules already exists, skipping install" "INFO"
    }

    # 检查端口是否被占用
    $port = 8082
    $portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Log "Warning: port $port already in use, Vite will pick another port" "WARN"
        Write-Host "Warning: port $port already in use, Vite will pick another port" -ForegroundColor Yellow
    }

    # 启动开发服务器
    Write-Log "Starting Vite dev server..." "INFO"
    Write-Host "Dev server is starting, logs will be saved to: $devLog" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ("=" * 60) -ForegroundColor Cyan
    
    # 启动开发服务器并实时显示输出，同时保存到日志文件
    # 使用 Tee-Object 同时输出到控制台和文件
    try {
        npm run dev 2>&1 | Tee-Object -FilePath $devLog
    } catch {
        $errorMessage = $_.Exception.Message
        Write-Log "Dev server failed to start: $errorMessage" "ERROR"
        Write-Host "Dev server failed to start: $errorMessage" -ForegroundColor Red
        Write-Host "Detailed logs saved to: $devLog" -ForegroundColor Red
        exit 1
    }
    
} catch {
    $errorMessage = $_.Exception.Message
    $errorStackTrace = $_.Exception.StackTrace
    Write-Log "Unhandled error: $errorMessage" "ERROR"
    Write-Log "Stack trace: $errorStackTrace" "ERROR"
    Write-Host "Error details saved to: $errorLog" -ForegroundColor Red
    Write-Host "Error message: $errorMessage" -ForegroundColor Red
    exit 1
} finally {
    Write-Log "Script finished" "INFO"
}

