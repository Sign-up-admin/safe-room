# 分阶段E2E测试执行脚本
# 简化用户调用，支持多种执行模式

param(
    [switch]$Fast,
    [switch]$Thorough,
    [switch]$Serial,
    [switch]$FailFast,
    [switch]$Verbose,
    [switch]$OnlyAdmin,
    [switch]$OnlyFront,
    [int]$MaxParallel = 1,
    [string]$Projects = "admin,front",
    [switch]$Help
)

# 显示帮助信息
if ($Help) {
    Write-Host "分阶段E2E测试执行脚本" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "用法:" -ForegroundColor Yellow
    Write-Host "  .\run-phased-e2e.ps1 [参数]"
    Write-Host ""
    Write-Host "参数:" -ForegroundColor Yellow
    Write-Host "  -Fast         快速模式（平衡并发，适合中等性能机器）"
    Write-Host "  -Thorough     全面模式（低并发，高稳定性）"
    Write-Host "  -Serial       串行模式（默认，适合笔记本）"
    Write-Host "  -FailFast     失败立即停止"
    Write-Host "  -Verbose      详细输出"
    Write-Host "  -OnlyAdmin    只测试admin项目"
    Write-Host "  -OnlyFront    只测试front项目"
    Write-Host "  -MaxParallel  最大并发数（默认1）"
    Write-Host "  -Projects     指定项目（用逗号分隔，默认admin,front）"
    Write-Host "  -Help         显示此帮助信息"
    Write-Host ""
    Write-Host "示例:" -ForegroundColor Yellow
    Write-Host "  .\run-phased-e2e.ps1 -Fast -Verbose"
    Write-Host "  .\run-phased-e2e.ps1 -OnlyFront -MaxParallel 2"
    Write-Host "  .\run-phased-e2e.ps1 -Thorough -FailFast"
    exit 0
}

# 构建命令行参数
$args = @()

if ($Fast) {
    $args += "--fast"
} elseif ($Thorough) {
    $args += "--thorough"
} elseif ($Serial) {
    $args += "--serial"
}

if ($FailFast) {
    $args += "--fail-fast"
}

if ($Verbose) {
    $args += "--verbose"
}

if ($OnlyAdmin) {
    $args += "--only-admin"
} elseif ($OnlyFront) {
    $args += "--only-front"
} else {
    $args += "--projects=$Projects"
}

if ($MaxParallel -gt 1) {
    $args += "--max-parallel=$MaxParallel"
}

# 显示执行信息
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    分阶段E2E测试执行" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "执行参数: $($args -join ' ')" -ForegroundColor Yellow
Write-Host ""

# 执行分阶段测试
try {
    $process = Start-Process -FilePath "node.exe" -ArgumentList "phased-e2e-execution-manager.js" @args -NoNewWindow -Wait -PassThru

    if ($process.ExitCode -eq 0) {
        Write-Host ""
        Write-Host "✅ 分阶段E2E测试执行完成" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ 分阶段E2E测试执行失败" -ForegroundColor Red
        exit $process.ExitCode
    }
} catch {
    Write-Host ""
    Write-Host "❌ 执行过程中发生错误: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
