# PowerShell版本的覆盖率检查脚本
# 使用方法: $env:ENABLE_COVERAGE_CHECK="true"; npm run prepare

if ($env:ENABLE_COVERAGE_CHECK -ne "true") {
    Write-Host "⏭️  覆盖率检查已跳过 (设置 ENABLE_COVERAGE_CHECK=true 启用)" -ForegroundColor Yellow
    exit 0
}

Write-Host "🔍 运行覆盖率检查..." -ForegroundColor Cyan

# 运行覆盖率测试
npm run test:coverage

# 检查退出码
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 覆盖率检查通过" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ 覆盖率检查失败，请确保覆盖率达到阈值" -ForegroundColor Red
    Write-Host "💡 提示: 可以通过设置 ENABLE_COVERAGE_CHECK=false 跳过此检查" -ForegroundColor Yellow
    exit 1
}

