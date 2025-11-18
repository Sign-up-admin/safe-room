# 快速端口冲突修复脚本
# 自动解决E2E测试中的端口占用问题

Write-Host "=== 快速端口冲突修复 ===" -ForegroundColor Cyan

# 检查并停止占用端口的进程
$ports = @(8080, 8081, 8082)

foreach ($port in $ports) {
    Write-Host "检查端口 $port..." -ForegroundColor Yellow

    $netstat = netstat -ano | findstr ":$port"
    if ($netstat) {
        $lines = $netstat -split "`n" | Where-Object { $_ -match "LISTENING\s+(\d+)$" }
        $pids = $lines | ForEach-Object { $matches[1] } | Select-Object -Unique

        foreach ($pid in $pids) {
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  发现进程: $($process.ProcessName) (PID: $pid) 占用端口 $port" -ForegroundColor Yellow

                    # 检查是否是Docker相关进程
                    if ($process.ProcessName -like "*docker*") {
                        Write-Host "  💡 这是Docker进程，尝试重启Docker Desktop..." -ForegroundColor Blue

                        # 停止Docker Desktop
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Write-Host "  已停止Docker进程" -ForegroundColor Green

                        # 等待几秒
                        Start-Sleep -Seconds 3

                        # 启动Docker Desktop (如果存在)
                        $dockerPath = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
                        if (Test-Path $dockerPath) {
                            Start-Process $dockerPath
                            Write-Host "  已启动Docker Desktop，请等待其完全启动" -ForegroundColor Green
                        }
                    } else {
                        # 对于其他进程，直接停止
                        $process.Kill()
                        Write-Host "  已停止进程: $($process.ProcessName)" -ForegroundColor Green
                    }
                }
            } catch {
                Write-Host "  无法停止进程 $pid : $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  端口 $port 未被占用" -ForegroundColor Green
    }
}

# 验证端口是否已释放
Write-Host "`n验证端口状态..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

foreach ($port in $ports) {
    $check = netstat -ano | findstr ":$port"
    if ($check) {
        Write-Host "❌ 端口 $port 仍被占用" -ForegroundColor Red
    } else {
        Write-Host "✅ 端口 $port 已释放" -ForegroundColor Green
    }
}

Write-Host "`n=== 端口修复完成 ===" -ForegroundColor Cyan
Write-Host "现在可以重新运行E2E测试了" -ForegroundColor Green
