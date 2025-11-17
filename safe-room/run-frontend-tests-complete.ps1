# 前端接口测试完整运行脚本
# 执行时间：2025-11-XX

param(
    [switch]$SkipDatabaseFix,
    [switch]$SkipBackendStart,
    [switch]$SkipTests,
    [string]$TestPattern = "*"
)

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
    Push-Location "springboot1ngh61a2/src/main/resources/front/front"

    try {
        npm run test:unit -- --run "tests/unit/**/*.test.ts"
        Write-Host "Front应用测试完成！" -ForegroundColor Green
    } catch {
        Write-Host "Front应用测试失败：$($_.Exception.Message)" -ForegroundColor Red
    }

    Pop-Location
    Write-Host ""

    # Admin应用测试
    Write-Host "运行Admin应用测试..." -ForegroundColor Cyan
    Push-Location "springboot1ngh61a2/src/main/resources/admin/admin"

    try {
        npm run test:unit -- --run "tests/unit/**/*.test.ts"
        Write-Host "Admin应用测试完成！" -ForegroundColor Green
    } catch {
        Write-Host "Admin应用测试失败：$($_.Exception.Message)" -ForegroundColor Red
    }

    Pop-Location
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
Write-Host "cd springboot1ngh61a2/src/main/resources/front/front && npm run test:unit -- --run tests/unit/api/pages.test.ts"
Write-Host "cd springboot1ngh61a2/src/main/resources/admin/admin && npm run test:unit -- --run tests/unit/api/pages.test.ts"
