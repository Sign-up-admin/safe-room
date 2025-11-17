#!/usr/bin/env powershell
<#
.SYNOPSIS
    覆盖率监控脚本 - 监控代码覆盖率变化并提供告警

.DESCRIPTION
    该脚本运行测试生成覆盖率报告，分析覆盖率变化，
    并在覆盖率下降时提供告警。

.PARAMETER ThresholdLine
    行覆盖率阈值 (默认: 50%)

.PARAMETER ThresholdBranch
    分支覆盖率阈值 (默认: 40%)

.PARAMETER ThresholdInstruction
    指令覆盖率阈值 (默认: 50%)

.PARAMETER HistoryFile
    覆盖率历史记录文件路径

.EXAMPLE
    .\coverage-monitor.ps1

.EXAMPLE
    .\coverage-monitor.ps1 -ThresholdLine 60 -ThresholdBranch 50
#>

param(
    [double]$ThresholdLine = 50.0,
    [double]$ThresholdBranch = 40.0,
    [double]$ThresholdInstruction = 50.0,
    [string]$HistoryFile = "coverage-history.json",
    [switch]$Verbose
)

# 配置
$ProjectDir = "springboot1ngh61a2"
$JacocoReportDir = "$ProjectDir/target/site/jacoco"
$JacocoReportFile = "$JacocoReportDir/jacoco.xml"

class CoverageData {
    [datetime]$Timestamp
    [double]$LineCoverage
    [double]$BranchCoverage
    [double]$InstructionCoverage
    [double]$MethodCoverage
    [double]$ClassCoverage
    [int]$TotalLines
    [int]$CoveredLines
    [int]$TotalBranches
    [int]$CoveredBranches
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
        throw "JaCoCo报告文件不存在: $ReportPath"
    }

    Write-VerboseLog "解析覆盖率报告: $ReportPath"

    [xml]$xml = Get-Content $ReportPath

    $counter = $xml.report.counter

    $lineCounter = $counter | Where-Object { $_.type -eq "LINE" }
    $branchCounter = $counter | Where-Object { $_.type -eq "BRANCH" }
    $instructionCounter = $counter | Where-Object { $_.type -eq "INSTRUCTION" }
    $methodCounter = $counter | Where-Object { $_.type -eq "METHOD" }
    $classCounter = $counter | Where-Object { $_.type -eq "CLASS" }

    $coverage = [CoverageData]::new()
    $coverage.Timestamp = Get-Date

    if ($lineCounter) {
        $coverage.LineCoverage = [math]::Round(($lineCounter.covered * 100.0 / $lineCounter.missed), 2)
        $coverage.TotalLines = [int]$lineCounter.missed + [int]$lineCounter.covered
        $coverage.CoveredLines = [int]$lineCounter.covered
    }

    if ($branchCounter) {
        $coverage.BranchCoverage = [math]::Round(($branchCounter.covered * 100.0 / $branchCounter.missed), 2)
        $coverage.TotalBranches = [int]$branchCounter.missed + [int]$branchCounter.covered
        $coverage.CoveredBranches = [int]$branchCounter.covered
    }

    if ($instructionCounter) {
        $coverage.InstructionCoverage = [math]::Round(($instructionCounter.covered * 100.0 / $instructionCounter.missed), 2)
    }

    if ($methodCounter) {
        $coverage.MethodCoverage = [math]::Round(($methodCounter.covered * 100.0 / $methodCounter.missed), 2)
    }

    if ($classCounter) {
        $coverage.ClassCoverage = [math]::Round(($classCounter.covered * 100.0 / $classCounter.missed), 2)
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
            $data.BranchCoverage = [double]$item.BranchCoverage
            $data.InstructionCoverage = [double]$item.InstructionCoverage
            $data.MethodCoverage = [double]$item.MethodCoverage
            $data.ClassCoverage = [double]$item.ClassCoverage
            $data.TotalLines = [int]$item.TotalLines
            $data.CoveredLines = [int]$item.CoveredLines
            $data.TotalBranches = [int]$item.TotalBranches
            $data.CoveredBranches = [int]$item.CoveredBranches
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
            BranchCoverage = $_.BranchCoverage
            InstructionCoverage = $_.InstructionCoverage
            MethodCoverage = $_.MethodCoverage
            ClassCoverage = $_.ClassCoverage
            TotalLines = $_.TotalLines
            CoveredLines = $_.CoveredLines
            TotalBranches = $_.TotalBranches
            CoveredBranches = $_.CoveredBranches
        }
    }

    $jsonData | ConvertTo-Json | Set-Content $HistoryPath -Encoding UTF8
    Write-VerboseLog "保存覆盖率历史到: $HistoryPath"
}

function Test-CoverageThresholds {
    param(
        [CoverageData]$Current,
        [double]$ThresholdLine,
        [double]$ThresholdBranch,
        [double]$ThresholdInstruction
    )

    $alerts = @()

    if ($Current.LineCoverage -lt $ThresholdLine) {
        $alerts += "行覆盖率 $($Current.LineCoverage)% 低于阈值 $ThresholdLine%"
    }

    if ($Current.BranchCoverage -lt $ThresholdBranch) {
        $alerts += "分支覆盖率 $($Current.BranchCoverage)% 低于阈值 $ThresholdBranch%"
    }

    if ($Current.InstructionCoverage -lt $ThresholdInstruction) {
        $alerts += "指令覆盖率 $($Current.InstructionCoverage)% 低于阈值 $ThresholdInstruction%"
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

    if (($latest.BranchCoverage - $Current.BranchCoverage) -gt $RegressionThreshold) {
        $alerts += "分支覆盖率下降: $($latest.BranchCoverage)% -> $($Current.BranchCoverage)% (下降了 $([math]::Round($latest.BranchCoverage - $Current.BranchCoverage, 2))%)"
    }

    if (($latest.InstructionCoverage - $Current.InstructionCoverage) -gt $RegressionThreshold) {
        $alerts += "指令覆盖率下降: $($latest.InstructionCoverage)% -> $($Current.InstructionCoverage)% (下降了 $([math]::Round($latest.InstructionCoverage - $Current.InstructionCoverage, 2))%)"
    }

    return $alerts
}

function Write-CoverageReport {
    param([CoverageData]$Coverage)

    Write-Host "=== 覆盖率报告 ===" -ForegroundColor Green
    Write-Host "时间: $($Coverage.Timestamp)"
    Write-Host "行覆盖率: $($Coverage.LineCoverage)% ($($Coverage.CoveredLines)/$($Coverage.TotalLines) 行)"
    Write-Host "分支覆盖率: $($Coverage.BranchCoverage)% ($($Coverage.CoveredBranches)/$($Coverage.TotalBranches) 分支)"
    Write-Host "指令覆盖率: $($Coverage.InstructionCoverage)%"
    Write-Host "方法覆盖率: $($Coverage.MethodCoverage)%"
    Write-Host "类覆盖率: $($Coverage.ClassCoverage)%"
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
    Write-Host "开始覆盖率监控..." -ForegroundColor Blue

    # 检查项目目录
    if (!(Test-Path $ProjectDir)) {
        throw "项目目录不存在: $ProjectDir"
    }

    Push-Location $ProjectDir

    try {
        # 运行测试并生成覆盖率报告
        Write-Host "运行测试并生成覆盖率报告..." -ForegroundColor Yellow
        & mvn clean test jacoco:report -q

        if ($LASTEXITCODE -ne 0) {
            throw "Maven测试失败，退出代码: $LASTEXITCODE"
        }

        # 解析覆盖率报告
        $coverage = Get-CoverageFromReport $JacocoReportFile

        # 显示当前覆盖率
        Write-CoverageReport $coverage

        # 检查阈值
        $thresholdAlerts = Test-CoverageThresholds $coverage $ThresholdLine $ThresholdBranch $ThresholdInstruction

        # 检查历史回归
        $history = Get-CoverageHistory "../$HistoryFile"
        $regressionAlerts = Test-CoverageRegression $history $coverage

        # 显示告警
        $allAlerts = $thresholdAlerts + $regressionAlerts
        Write-AlertReport $allAlerts

        # 保存历史记录
        $history += $coverage
        # 只保留最近30天的记录
        $cutoffDate = (Get-Date).AddDays(-30)
        $history = $history | Where-Object { $_.Timestamp -gt $cutoffDate }
        Save-CoverageHistory $history "../$HistoryFile"

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
