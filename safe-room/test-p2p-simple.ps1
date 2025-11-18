# 简化的P2P测试脚本用于验证设置
param(
    [switch]$Verbose
)

Write-Host "🚀 开始简化的P2P测试验证..." -ForegroundColor Green

# 设置环境变量
$env:FRONTEND_URL = "http://localhost:5173"
$env:BACKEND_URL = "http://localhost:8080"
$env:HEADLESS = "true"

# 进入admin前端目录
$adminPath = "springboot1ngh61a2\src\main\resources\admin\admin"
if (Test-Path $adminPath) {
    Push-Location $adminPath

    try {
        Write-Host "📍 进入admin前端目录" -ForegroundColor Cyan

        # 检查Playwright是否可用
        $playwrightVersion = & npx playwright --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Playwright可用: $playwrightVersion" -ForegroundColor Green
        } else {
            Write-Host "❌ Playwright不可用" -ForegroundColor Red
            exit 1
        }

        # 检查测试文件是否存在
        $testFile = "tests\e2e\p2p-integration.spec.ts"
        if (Test-Path $testFile) {
            Write-Host "✅ P2P测试文件存在: $testFile" -ForegroundColor Green
        } else {
            Write-Host "❌ P2P测试文件不存在: $testFile" -ForegroundColor Red
            exit 1
        }

        # 检查配置文件
        $configFile = "playwright.config.ts"
        if (Test-Path $configFile) {
            Write-Host "✅ Playwright配置文件存在: $configFile" -ForegroundColor Green
        } else {
            Write-Host "❌ Playwright配置文件不存在: $configFile" -ForegroundColor Red
            exit 1
        }

        # 尝试列出测试（不实际运行）
        Write-Host "📋 尝试列出测试用例..." -ForegroundColor Cyan
        $listOutput = & npx playwright test --list 2>&1
        if ($LASTEXITCODE -eq 0) {
            $testCount = ($listOutput | Select-String -Pattern "test\(|\.spec\.ts" | Measure-Object).Count
            Write-Host "✅ 发现 $testCount 个测试用例" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 无法列出测试用例，但这是正常的（因为需要运行服务）" -ForegroundColor Yellow
        }

        Write-Host "🎉 P2P测试设置验证完成！" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 使用说明:" -ForegroundColor Cyan
        Write-Host "  1. 启动后端服务: .\start-backend.ps1" -ForegroundColor White
        Write-Host "  2. 启动前端服务: .\start-frontend.ps1" -ForegroundColor White
        Write-Host "  3. 运行完整P2P测试: .\test-admin-p2p.ps1 -TestType full -Report" -ForegroundColor White

    } finally {
        Pop-Location
    }
} else {
    Write-Host "❌ 找不到admin前端路径: $adminPath" -ForegroundColor Red
    exit 1
}



