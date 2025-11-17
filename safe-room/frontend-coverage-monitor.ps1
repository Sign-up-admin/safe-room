#!/usr/bin/env powershell
<#
.SYNOPSIS
    前端测试覆盖率监控脚本 - 监控前端代码覆盖率变化并提供告警

.DESCRIPTION
    该脚本运行前端测试生成覆盖率报告，分析覆盖率变化，
    并在覆盖率下降时提供告警。

.PARAMETER Project
    要监控的项目 (front 或 admin)

.PARAMETER ThresholdLine
    行覆盖率阈值 (默认: 30%)

.PARAMETER ThresholdFunction
    函数覆盖率阈值 (默认: 30%)

.PARAMETER ThresholdBranch
    分支覆盖率阈值 (默认: 25%)

.PARAMETER ThresholdStatement
    语句覆盖率阈值 (默认: 30%)

.PARAMETER HistoryFile
    覆盖率历史记录文件路径

.EXAMPLE
    .\frontend-coverage-monitor.ps1 -Project front

.EXAMPLE
    .\frontend-coverage-monitor.ps1 -Project admin -ThresholdLine 40
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("front", "admin")]
    [string]$Project,
    
    [double]$ThresholdLine = 30.0,
    [double]$ThresholdFunction = 30.0,
    [double]$ThresholdBranch = 25.0,
    [double]$ThresholdStatement = 30.0,
    [string]$HistoryFile = "frontend-coverage-history-$Project.json",
    [switch]$Verbose
)

# 配置
$ProjectPath = if ($Project -eq "front") {
    "springboot1ngh61a2\src\main\resources\front\front"
} else {
    "springboot1ngh61a2\src\main\resources\admin\admin"
}

$CoverageReportFile = "$ProjectPath\coverage\coverage-summary.json"

class CoverageData {
    [datetime]$Timestamp
    [double]$LineCoverage
    [double]$FunctionCoverage
    [double]$BranchCoverage
    [double]$StatementCoverage
    [int]$TotalLines
    [int]$CoveredLines
    [int]$TotalFunctions
    [int]$CoveredFunctions
    [int]$TotalBranches
    [int]$CoveredBranches
    [int]$TotalStatements
    [int]$CoveredStatements
}

function Write-VerboseLog {
    param([string]$Message)
    if ($Verbose) {
        Write-Host "VERBOSE: $Message" -ForegroundColor Cyan
    }
}

function Get-CoverageFromReport {
    param([string]$ReportPath)

    if (!(Test-Path $ReportPath)) {
        throw "覆盖率报告文件不存在: $ReportPath"
    }

    Write-VerboseLog "解析覆盖率报告: $ReportPath"

    $json = Get-Content $ReportPath -Raw | ConvertFrom-Json
    $total = $json.total

    $coverage = [CoverageData]::new()
    $coverage.Timestamp = Get-Date

    if ($total.lines) {
        $coverage.LineCoverage = [math]::Round($total.lines.pct, 2)
        $coverage.TotalLines = $total.lines.total
        $coverage.CoveredLines = $total.lines.covered
    }

    if ($total.functions) {
        $coverage.FunctionCoverage = [math]::Round($total.functions.pct, 2)
        $coverage.TotalFunctions = $total.functions.total
        $coverage.CoveredFunctions = $total.functions.covered
    }

    if ($total.branches) {
        $coverage.BranchCoverage = [math]::Round($total.branches.pct, 2)
        $coverage.TotalBranches = $total.branches.total
        $coverage.CoveredBranches = $total.branches.covered
    }

    if ($total.statements) {
        $coverage.StatementCoverage = [math]::Round($total.statements.pct, 2)
        $coverage.TotalStatements = $total.statements.total
        $coverage.CoveredStatements = $total.statements.covered
    }

    return $coverage
}

function Get-CoverageHistory {
    param([string]$HistoryPath)

    if (!(Test-Path $HistoryPath)) {
        Write-VerboseLog "历史文件不存在，创建新文件: $HistoryPath"
        return @()
    }

    try {
        $json = Get-Content $HistoryPath -Raw | ConvertFrom-Json
        $history = @()

        foreach ($item in $json) {
            $data = [CoverageData]::new()
            $data.Timestamp = [datetime]::Parse($item.Timestamp)
            $data.LineCoverage = [double]$item.LineCoverage
            $data.FunctionCoverage = [double]$item.FunctionCoverage
            $data.BranchCoverage = [double]$item.BranchCoverage
            $data.StatementCoverage = [double]$item.StatementCoverage
            $data.TotalLines = [int]$item.TotalLines
            $data.CoveredLines = [int]$item.CoveredLines
            $data.TotalFunctions = [int]$item.TotalFunctions
            $data.CoveredFunctions = [int]$item.CoveredFunctions
            $data.TotalBranches = [int]$item.TotalBranches
            $data.CoveredBranches = [int]$item.CoveredBranches
            $data.TotalStatements = [int]$item.TotalStatements
            $data.CoveredStatements = [int]$item.CoveredStatements
            $history += $data
        }

        return $history
    }
    catch {
        Write-Warning "读取历史文件失败: $($_.Exception.Message)"
        return @()
    }
}

function Save-CoverageHistory {
    param(
        [CoverageData[]]$History,
        [string]$HistoryPath
    )

    $jsonData = $History | ForEach-Object {
        @{
            Timestamp = $_.Timestamp.ToString("o")
            LineCoverage = $_.LineCoverage
            FunctionCoverage = $_.FunctionCoverage
            BranchCoverage = $_.BranchCoverage
            StatementCoverage = $_.StatementCoverage
            TotalLines = $_.TotalLines
            CoveredLines = $_.CoveredLines
            TotalFunctions = $_.TotalFunctions
            CoveredFunctions = $_.CoveredFunctions
            TotalBranches = $_.TotalBranches
            CoveredBranches = $_.CoveredBranches
            TotalStatements = $_.TotalStatements
            CoveredStatements = $_.CoveredStatements
        }
    }

    $jsonData | ConvertTo-Json | Set-Content $HistoryPath -Encoding UTF8
    Write-VerboseLog "保存覆盖率历史到: $HistoryPath"
}

function Test-CoverageThresholds {
    param(
        [CoverageData]$Current,
        [double]$ThresholdLine,
        [double]$ThresholdFunction,
        [double]$ThresholdBranch,
        [double]$ThresholdStatement
    )

    $alerts = @()

    if ($Current.LineCoverage -lt $ThresholdLine) {
        $alerts += "行覆盖率 $($Current.LineCoverage)% 低于阈值 $ThresholdLine%"
    }

    if ($Current.FunctionCoverage -lt $ThresholdFunction) {
        $alerts += "函数覆盖率 $($Current.FunctionCoverage)% 低于阈值 $ThresholdFunction%"
    }

    if ($Current.BranchCoverage -lt $ThresholdBranch) {
        $alerts += "分支覆盖率 $($Current.BranchCoverage)% 低于阈值 $ThresholdBranch%"
    }

    if ($Current.StatementCoverage -lt $ThresholdStatement) {
        $alerts += "语句覆盖率 $($Current.StatementCoverage)% 低于阈值 $ThresholdStatement%"
    }

    return $alerts
}

function Test-CoverageRegression {
    param(
        [CoverageData[]]$History,
        [CoverageData]$Current,
        [double]$RegressionThreshold = 1.0
    )

    if ($History.Count -eq 0) {
        return @()
    }

    $latest = $History | Sort-Object Timestamp -Descending | Select-Object -First 1
    $alerts = @()

    if (($latest.LineCoverage - $Current.LineCoverage) -gt $RegressionThreshold) {
        $alerts += "行覆盖率下降: $($latest.LineCoverage)% -> $($Current.LineCoverage)% (下降了 $([math]::Round($latest.LineCoverage - $Current.LineCoverage, 2))%)"
    }

    if (($latest.FunctionCoverage - $Current.FunctionCoverage) -gt $RegressionThreshold) {
        $alerts += "函数覆盖率下降: $($latest.FunctionCoverage)% -> $($Current.FunctionCoverage)% (下降了 $([math]::Round($latest.FunctionCoverage - $Current.FunctionCoverage, 2))%)"
    }

    if (($latest.BranchCoverage - $Current.BranchCoverage) -gt $RegressionThreshold) {
        $alerts += "分支覆盖率下降: $($latest.BranchCoverage)% -> $($Current.BranchCoverage)% (下降了 $([math]::Round($latest.BranchCoverage - $Current.BranchCoverage, 2))%)"
    }

    if (($latest.StatementCoverage - $Current.StatementCoverage) -gt $RegressionThreshold) {
        $alerts += "语句覆盖率下降: $($latest.StatementCoverage)% -> $($Current.StatementCoverage)% (下降了 $([math]::Round($latest.StatementCoverage - $Current.StatementCoverage, 2))%)"
    }

    return $alerts
}

function Write-CoverageReport {
    param([CoverageData]$Coverage)

    Write-Host "=== 覆盖率报告 ===" -ForegroundColor Green
    Write-Host "项目: $Project"
    Write-Host "时间: $($Coverage.Timestamp)"
    Write-Host "行覆盖率: $($Coverage.LineCoverage)% ($($Coverage.CoveredLines)/$($Coverage.TotalLines) 行)"
    Write-Host "函数覆盖率: $($Coverage.FunctionCoverage)% ($($Coverage.CoveredFunctions)/$($Coverage.TotalFunctions) 函数)"
    Write-Host "分支覆盖率: $($Coverage.BranchCoverage)% ($($Coverage.CoveredBranches)/$($Coverage.TotalBranches) 分支)"
    Write-Host "语句覆盖率: $($Coverage.StatementCoverage)% ($($Coverage.CoveredStatements)/$($Coverage.TotalStatements) 语句)"
    Write-Host ""
}

function Write-AlertReport {
    param([string[]]$Alerts)

    if ($Alerts.Count -eq 0) {
        Write-Host "✅ 所有覆盖率指标正常" -ForegroundColor Green
        return
    }

    Write-Host "⚠️  覆盖率告警:" -ForegroundColor Yellow
    foreach ($alert in $Alerts) {
        Write-Host "  - $alert" -ForegroundColor Red
    }
    Write-Host ""
}

# 主函数
function Main {
    Write-Host "开始前端覆盖率监控..." -ForegroundColor Blue
    Write-Host "项目: $Project" -ForegroundColor Cyan

    # 检查项目目录
    if (!(Test-Path $ProjectPath)) {
        throw "项目目录不存在: $ProjectPath"
    }

    Push-Location $ProjectPath

    try {
        # 运行测试并生成覆盖率报告
        Write-Host "运行测试并生成覆盖率报告..." -ForegroundColor Yellow
        npm run test:coverage

        if ($LASTEXITCODE -ne 0) {
            throw "测试失败，退出代码: $LASTEXITCODE"
        }

        # 解析覆盖率报告
        $coverage = Get-CoverageFromReport $CoverageReportFile

        # 显示当前覆盖率
        Write-CoverageReport $coverage

        # 检查阈值
        $thresholdAlerts = Test-CoverageThresholds $coverage $ThresholdLine $ThresholdFunction $ThresholdBranch $ThresholdStatement

        # 检查历史回归
        $history = Get-CoverageHistory "..\..\..\..\$HistoryFile"
        $regressionAlerts = Test-CoverageRegression $history $coverage

        # 显示告警
        $allAlerts = $thresholdAlerts + $regressionAlerts
        Write-AlertReport $allAlerts

        # 保存历史记录
        $history += $coverage
        # 只保留最近30天的记录
        $cutoffDate = (Get-Date).AddDays(-30)
        $history = $history | Where-Object { $_.Timestamp -gt $cutoffDate }
        Save-CoverageHistory $history "..\..\..\..\$HistoryFile"

        # 设置退出代码
        if ($allAlerts.Count -gt 0) {
            exit 1
        } else {
            Write-Host "覆盖率监控完成 ✅" -ForegroundColor Green
            exit 0
        }

    }
    catch {
        Write-Error "覆盖率监控失败: $($_.Exception.Message)"
        exit 1
    }
    finally {
        Pop-Location
    }
}

# 执行主函数
Main

