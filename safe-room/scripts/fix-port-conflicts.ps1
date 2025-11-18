# 端口冲突修复脚本
# 解决E2E测试中的端口占用问题

param(
    [switch]$CheckOnly,
    [switch]$ForceRestart,
    [switch]$UseAlternativePorts
)

Write-Host "=== E2E测试端口冲突修复工具 ===" -ForegroundColor Cyan

# 定义需要的端口
$requiredPorts = @(8080, 8081, 8082)
$alternativePorts = @{8080 = 18080; 8081 = 18081; 8082 = 18082}

function Get-ProcessUsingPort {
    param([int]$Port)
    try {
        $netstat = netstat -ano | findstr ":$Port"
        if ($netstat) {
            $lines = $netstat -split "`n"
            $pids = @()
            foreach ($line in $lines) {
                if ($line -match "LISTENING\s+(\d+)$") {
                    $pids += $matches[1]
                }
            }
            return $pids | Select-Object -Unique
        }
    } catch {
        Write-Warning "检查端口 $Port 时出错: $($_.Exception.Message)"
    }
    return $null
}

function Get-ProcessDetails {
    param([int]$Pid)
    try {
        $process = Get-Process -Id $Pid -ErrorAction SilentlyContinue
        if ($process) {
            return @{
                Name = $process.ProcessName
                Description = $process.Description
                Path = $process.Path
                IsDocker = $process.ProcessName -like "*docker*"
            }
        }
    } catch {
        Write-Warning "获取进程 $Pid 详情时出错: $($_.Exception.Message)"
    }
    return $null
}

function Stop-ProcessGracefully {
    param([int]$Pid, [string]$ProcessName)
    Write-Host "尝试停止进程: $ProcessName (PID: $Pid)" -ForegroundColor Yellow

    # 首先尝试优雅停止
    try {
        $process = Get-Process -Id $Pid -ErrorAction SilentlyContinue
        if ($process) {
            $process.CloseMainWindow() | Out-Null
            Start-Sleep -Seconds 3

            if (!$process.HasExited) {
                $process.Kill()
                Write-Host "已强制停止进程: $ProcessName" -ForegroundColor Green
            } else {
                Write-Host "进程已优雅退出: $ProcessName" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "停止进程失败: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    return $true
}

function Update-ApplicationPorts {
    param([hashtable]$PortMapping)

    Write-Host "更新应用配置使用替代端口..." -ForegroundColor Yellow

    # 更新前端配置
    $frontConfigPath = "springboot1ngh61a2/src/main/resources/front/front/playwright.config.ts"
    if (Test-Path $frontConfigPath) {
        $content = Get-Content $frontConfigPath -Raw
        $content = $content -replace 'const DEFAULT_PORT = process\.env\.E2E_PORT \? Number\(process\.env\.E2E_PORT\) : 8082',
                                  "const DEFAULT_PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : $($PortMapping[8082])"
        $content | Set-Content $frontConfigPath -Encoding UTF8
        Write-Host "已更新前端配置端口: 8082 -> $($PortMapping[8082])" -ForegroundColor Green
    }

    # 更新后端配置 (如果有的话)
    $backendConfigPath = "springboot1ngh61a2/src/main/resources/application.yml"
    if (Test-Path $backendConfigPath) {
        $content = Get-Content $backendConfigPath -Raw
        if ($content -match 'server:\s*port:\s*8080') {
            $content = $content -replace 'server:\s*port:\s*8080', "server:`n  port: $($PortMapping[8080])"
            $content | Set-Content $backendConfigPath -Encoding UTF8
            Write-Host "已更新后端配置端口: 8080 -> $($PortMapping[8080])" -ForegroundColor Green
        }
    }

    Write-Host "应用配置更新完成" -ForegroundColor Green
}

# 主逻辑
$conflicts = @()
$portProcesses = @{}

Write-Host "检查端口占用情况..." -ForegroundColor Yellow

foreach ($port in $requiredPorts) {
    $pids = Get-ProcessUsingPort $port
    if ($pids) {
        $conflicts += $port
        $processList = @()
        foreach ($pid in $pids) {
            $details = Get-ProcessDetails $pid
            if ($details) {
                $processList += $details
            }
        }
        $portProcesses[$port] = $processList
    }
}

if ($conflicts.Count -eq 0) {
    Write-Host "✅ 所有必需端口都可用，无需处理" -ForegroundColor Green
    exit 0
}

Write-Host "`n发现端口冲突:" -ForegroundColor Red
foreach ($port in $conflicts) {
    Write-Host "  端口 $port 被以下进程占用:" -ForegroundColor Red
    foreach ($process in $portProcesses[$port]) {
        Write-Host "    - $($process.Name) ($($process.Description))" -ForegroundColor Red
        if ($process.IsDocker) {
            Write-Host "      💡 这是Docker相关进程，可能需要重启Docker Desktop" -ForegroundColor Blue
        }
    }
}

if ($CheckOnly) {
    Write-Host "`n仅检查模式，退出。" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n选择解决方案:" -ForegroundColor Cyan
Write-Host "1. 停止冲突进程 (推荐)" -ForegroundColor White
Write-Host "2. 使用替代端口" -ForegroundColor White
Write-Host "3. 手动处理 (显示详细信息)" -ForegroundColor White

$choice = Read-Host "`n请选择 (1/2/3)"

switch ($choice) {
    "1" {
        Write-Host "`n正在停止冲突进程..." -ForegroundColor Yellow
        $allStopped = $true

        foreach ($port in $conflicts) {
            foreach ($process in $portProcesses[$port]) {
                if (-not (Stop-ProcessGracefully -Pid $process.Pid -ProcessName $process.Name)) {
                    $allStopped = $false
                }
            }
        }

        if ($allStopped) {
            Write-Host "`n✅ 所有冲突进程已停止，请重新运行E2E测试" -ForegroundColor Green
        } else {
            Write-Host "`n⚠️ 某些进程未能停止，建议使用替代端口方案" -ForegroundColor Yellow
        }
        break
    }

    "2" {
        Write-Host "`n正在配置应用使用替代端口..." -ForegroundColor Yellow
        Update-ApplicationPorts -PortMapping $alternativePorts
        Write-Host "`n✅ 已配置使用替代端口，请重新运行E2E测试" -ForegroundColor Green
        Write-Host "新端口映射:" -ForegroundColor Cyan
        foreach ($port in $requiredPorts) {
            Write-Host "  $port -> $($alternativePorts[$port])" -ForegroundColor Cyan
        }
        break
    }

    "3" {
        Write-Host "`n=== 详细进程信息 ===" -ForegroundColor Cyan
        foreach ($port in $conflicts) {
            Write-Host "`n端口 $port 详细信息:" -ForegroundColor Yellow
            foreach ($process in $portProcesses[$port]) {
                Write-Host "进程名: $($process.Name)" -ForegroundColor White
                Write-Host "描述: $($process.Description)" -ForegroundColor White
                Write-Host "路径: $($process.Path)" -ForegroundColor White
                Write-Host "PID: $($process.Pid)" -ForegroundColor White
                Write-Host ""
            }
        }

        Write-Host "手动处理步骤:" -ForegroundColor Cyan
        Write-Host "1. 打开任务管理器" -ForegroundColor White
        Write-Host "2. 找到上述进程" -ForegroundColor White
        Write-Host "3. 右键 -> 结束任务" -ForegroundColor White
        Write-Host "4. 或者使用以下命令停止进程:" -ForegroundColor White
        foreach ($port in $conflicts) {
            foreach ($process in $portProcesses[$port]) {
                Write-Host "   taskkill /PID $($process.Pid) /F" -ForegroundColor Gray
            }
        }
        break
    }

    default {
        Write-Host "无效选择，退出。" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n=== 端口冲突修复完成 ===" -ForegroundColor Cyan
