# 前端接口测试完整运行脚本
# 执行时间：2025-11-XX

param(
    [switch]$SkipDatabaseFix,
    [switch]$SkipBackendStart,
    [switch]$SkipTests,
    [string]$TestPattern = "*"
)

# PowerShell兼容性检查（增强版）
function Test-PowerShellCompatibility {
    $psVersion = $PSVersionTable.PSVersion
    $minVersion = [version]"5.1"

    if ($psVersion -lt $minVersion) {
        Write-Host "错误: 此脚本需要 PowerShell $minVersion 或更高版本。当前版本: $psVersion" -ForegroundColor Red
        exit 1
    }

    # 检查是否使用了不支持的语法
    $isPSCore = $PSVersionTable.PSVersion.Major -ge 6
    if (-not $isPSCore) {
        Write-Host "警告: 使用 Windows PowerShell $psVersion，某些功能可能受限" -ForegroundColor Yellow
        Write-Host "建议升级到 PowerShell Core 7+ 以获得更好的跨平台支持" -ForegroundColor Yellow
    }

    Write-Host "PowerShell版本: $psVersion ($($PSVersionTable.PSEdition))" -ForegroundColor Cyan
}

# 跨平台命令执行函数 - 增强PowerShell兼容性
function Invoke-CrossPlatformCommand {
    param(
        [string]$Command,
        [string]$WorkingDirectory = $null,
        [switch]$UseShellExecute
    )

    try {
        # PowerShell兼容性检查
        $isPSCore = $PSVersionTable.PSVersion.Major -ge 6
        $isWindows = if ($PSVersionTable.PSVersion.Major -ge 6) {
            $IsWindows
        } else {
            $true  # 假设Windows PowerShell在Windows上运行
        }

        if ($UseShellExecute -or ($isWindows -and -not $isPSCore)) {
            # Windows PowerShell 或明确要求使用shell执行
            $startInfo = New-Object System.Diagnostics.ProcessStartInfo
            $startInfo.FileName = if ($isWindows) { "cmd.exe" } else { "/bin/bash" }
            $startInfo.Arguments = if ($isWindows) { "/c `"$Command`"" } else { "-c `"$Command`"" }
            $startInfo.UseShellExecute = $false
            $startInfo.RedirectStandardOutput = $true
            $startInfo.RedirectStandardError = $true
            $startInfo.CreateNoWindow = $true
        } else {
            # PowerShell Core 或跨平台场景
            # 解析命令和参数，避免&&解析问题
            $commandParts = $Command -split '(?<!\\)&&'  # 负向预查，避免转义的&&
            if ($commandParts.Length -gt 1) {
                # 多命令链，递归执行
                $results = @()
                foreach ($cmd in $commandParts) {
                    $cmd = $cmd.Trim()
                    if ($cmd) {
                        $result = Invoke-CrossPlatformCommand -Command $cmd.Trim() -WorkingDirectory $WorkingDirectory
                        $results += $result
                        # 检查退出码，如果失败则停止执行
                        if ($LASTEXITCODE -ne 0) {
                            $global:LASTEXITCODE = $LASTEXITCODE
                            return ($results -join "`n")
                        }
                    }
                }
                return ($results -join "`n")
            }

            # 单命令执行
            $commandParts = $Command -split ' '
            $executable = $commandParts[0]
            $arguments = if ($commandParts.Length -gt 1) { $commandParts[1..($commandParts.Length-1)] -join ' ' } else { '' }

            $startInfo = New-Object System.Diagnostics.ProcessStartInfo
            $startInfo.FileName = $executable
            $startInfo.Arguments = $arguments
            $startInfo.UseShellExecute = $false
            $startInfo.RedirectStandardOutput = $true
            $startInfo.RedirectStandardError = $true
            $startInfo.CreateNoWindow = $true
        }

        if ($WorkingDirectory) {
            Push-Location $WorkingDirectory
        }

        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $startInfo

        # 捕获输出
        $outputBuilder = New-Object System.Text.StringBuilder
        $errorBuilder = New-Object System.Text.StringBuilder

        $process.OutputDataReceived += {
            param($sender, $e)
            if ($e.Data) {
                $outputBuilder.AppendLine($e.Data)
            }
        }

        $process.ErrorDataReceived += {
            param($sender, $e)
            if ($e.Data) {
                $errorBuilder.AppendLine($e.Data)
            }
        }

        $process.Start()
        $process.BeginOutputReadLine()
        $process.BeginErrorReadLine()
        $process.WaitForExit()

        $output = $outputBuilder.ToString()
        $errorOutput = $errorBuilder.ToString()

        # 设置全局退出码
        $global:LASTEXITCODE = $process.ExitCode

        # 返回组合输出
        if ($errorOutput) {
            return $output + "`n" + $errorOutput
        } else {
            return $output
        }
    }
    catch {
        Write-Host "命令执行失败: $_" -ForegroundColor Red
        $global:LASTEXITCODE = 1
        return $_.Exception.Message
    }
    finally {
        if ($WorkingDirectory) {
            Pop-Location
        }
    }
}

# 执行兼容性检查
Test-PowerShellCompatibility

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    前端接口测试完整运行脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 切换到项目根目录
Set-Location $PSScriptRoot

# 步骤1: 修复数据库
if (-not $SkipDatabaseFix) {
    Write-Host "步骤1: 修复数据库..." -ForegroundColor Yellow

    if (Test-Path "springboot1ngh61a2/fix-database-for-tests.ps1") {
        try {
            & "springboot1ngh61a2/fix-database-for-tests.ps1"
            Write-Host "数据库修复完成！" -ForegroundColor Green
        } catch {
            Write-Host "数据库修复失败：$($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "数据库修复脚本不存在，跳过此步骤。" -ForegroundColor Yellow
    }
} else {
    Write-Host "跳过数据库修复步骤。" -ForegroundColor Yellow
}

Write-Host ""

# 步骤2: 启动后端服务
if (-not $SkipBackendStart) {
    Write-Host "步骤2: 启动后端服务..." -ForegroundColor Yellow

    if (Test-Path "start-all.ps1") {
        try {
            $backendJob = Start-Job -ScriptBlock {
                & "start-all.ps1"
            }
            Write-Host "后端服务启动中..." -ForegroundColor Green

            # 等待后端服务启动
            Write-Host "等待30秒让服务启动..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30

            # 检查服务是否启动
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:8080/springboot1ngh61a2/common/service-status" -TimeoutSec 10
                if ($response.StatusCode -eq 200) {
                    Write-Host "后端服务启动成功！" -ForegroundColor Green
                } else {
                    Write-Host "后端服务启动失败！" -ForegroundColor Red
                }
            } catch {
                Write-Host "无法连接到后端服务：$($_.Exception.Message)" -ForegroundColor Red
                Write-Host "继续运行测试，但某些测试可能失败。" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "后端服务启动失败：$($_.Exception.Message)" -ForegroundColor Red
            Write-Host "继续运行测试，但某些测试可能失败。" -ForegroundColor Yellow
        }
    } else {
        Write-Host "后端启动脚本不存在，跳过此步骤。" -ForegroundColor Yellow
    }
} else {
    Write-Host "跳过后端服务启动步骤。" -ForegroundColor Yellow
}

Write-Host ""

# 步骤3: 运行前端测试
if (-not $SkipTests) {
    Write-Host "步骤3: 运行前端测试..." -ForegroundColor Yellow

    # Front应用测试
    Write-Host "运行Front应用测试..." -ForegroundColor Cyan
    $frontPath = "springboot1ngh61a2/src/main/resources/front/front"

    try {
        # 使用PowerShell兼容的方式执行命令
        Push-Location $frontPath
        try {
            $command = "npm run test:unit -- --run `"tests/unit/**/*.test.ts`""
            Write-Host "执行命令: $command" -ForegroundColor Gray
            $output = Invoke-CrossPlatformCommand -Command $command -WorkingDirectory $frontPath
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Front应用测试完成！" -ForegroundColor Green
            } else {
                Write-Host "Front应用测试失败！" -ForegroundColor Red
                Write-Host "输出: $output" -ForegroundColor Red
            }
        } finally {
            Pop-Location
        }
    } catch {
        Write-Host "Front应用测试失败：$($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""

    # Admin应用测试
    Write-Host "运行Admin应用测试..." -ForegroundColor Cyan
    $adminPath = "springboot1ngh61a2/src/main/resources/admin/admin"

    try {
        # 使用PowerShell兼容的方式执行命令
        Push-Location $adminPath
        try {
            $command = "npm run test:unit -- --run `"tests/unit/**/*.test.ts`""
            Write-Host "执行命令: $command" -ForegroundColor Gray
            $output = Invoke-CrossPlatformCommand -Command $command -WorkingDirectory $adminPath
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Admin应用测试完成！" -ForegroundColor Green
            } else {
                Write-Host "Admin应用测试失败！" -ForegroundColor Red
                Write-Host "输出: $output" -ForegroundColor Red
            }
        } finally {
            Pop-Location
        }
    } catch {
        Write-Host "Admin应用测试失败：$($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "跳过测试运行步骤。" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    前端接口测试运行完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 显示测试结果摘要
Write-Host ""
Write-Host "测试结果摘要：" -ForegroundColor Yellow
Write-Host "- 修复了HTTP客户端网络错误处理"
Write-Host "- 修复了CRUD和通用服务的错误处理逻辑"
Write-Host "- 更新了测试数据和数据库结构"
Write-Host "- 完善了API测试覆盖率"
Write-Host ""
Write-Host "如需重新运行特定测试，请使用以下命令：" -ForegroundColor Cyan
Write-Host "Set-Location 'springboot1ngh61a2/src/main/resources/front/front'; npm run test:unit -- --run tests/unit/api/pages.test.ts"
Write-Host "Set-Location 'springboot1ngh61a2/src/main/resources/admin/admin'; npm run test:unit -- --run tests/unit/api/pages.test.ts"
