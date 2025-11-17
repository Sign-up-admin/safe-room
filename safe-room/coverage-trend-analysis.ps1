#!/usr/bin/env powershell
<#
.SYNOPSIS
    覆盖率趋势分析脚本 - 分析覆盖率历史数据并生成趋势报告

.DESCRIPTION
    该脚本分析覆盖率历史数据，计算趋势，生成图表和报告。

.PARAMETER HistoryFile
    覆盖率历史记录文件路径

.PARAMETER OutputDir
    输出目录路径

.PARAMETER Days
    分析最近N天的趋势

.EXAMPLE
    .\coverage-trend-analysis.ps1

.EXAMPLE
    .\coverage-trend-analysis.ps1 -Days 30 -OutputDir "reports"
#>

param(
    [string]$HistoryFile = "coverage-history.json",
    [string]$OutputDir = "coverage-reports",
    [int]$Days = 30,
    [switch]$Verbose
)

class CoverageTrend {
    [datetime]$Date
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

function Get-CoverageHistory {
    param([string]$HistoryPath)

    if (!(Test-Path $HistoryPath)) {
        Write-Warning "历史文件不存在: $HistoryPath"
        return @()
    }

    try {
        $json = Get-Content $HistoryPath -Raw | ConvertFrom-Json
        $history = @()

        foreach ($item in $json) {
            $trend = [CoverageTrend]::new()
            $trend.Date = [datetime]::Parse($item.Timestamp).Date
            $trend.LineCoverage = [double]$item.LineCoverage
            $trend.BranchCoverage = [double]$item.BranchCoverage
            $trend.InstructionCoverage = [double]$item.InstructionCoverage
            $trend.MethodCoverage = [double]$item.MethodCoverage
            $trend.ClassCoverage = [double]$item.ClassCoverage
            $trend.TotalLines = [int]$item.TotalLines
            $trend.CoveredLines = [int]$item.CoveredLines
            $trend.TotalBranches = [int]$item.TotalBranches
            $trend.CoveredBranches = [int]$item.CoveredBranches
            $history += $trend
        }

        return $history
    }
    catch {
        Write-Error "读取历史文件失败: $($_.Exception.Message)"
        return @()
    }
}

function Get-CoverageStatistics {
    param([CoverageTrend[]]$History)

    if ($History.Count -eq 0) {
        return $null
    }

    $stats = @{
        TotalRecords = $History.Count
        DateRange = @{
            Start = ($History | Measure-Object -Property Date -Minimum).Minimum
            End = ($History | Measure-Object -Property Date -Maximum).Maximum
        }
        LineCoverage = @{
            Current = $History[-1].LineCoverage
            Average = [math]::Round(($History | Measure-Object -Property LineCoverage -Average).Average, 2)
            Min = ($History | Measure-Object -Property LineCoverage -Minimum).Minimum
            Max = ($History | Measure-Object -Property LineCoverage -Maximum).Maximum
            Trend = 0
        }
        BranchCoverage = @{
            Current = $History[-1].BranchCoverage
            Average = [math]::Round(($History | Measure-Object -Property BranchCoverage -Average).Average, 2)
            Min = ($History | Measure-Object -Property BranchCoverage -Minimum).Minimum
            Max = ($History | Measure-Object -Property BranchCoverage -Maximum).Maximum
            Trend = 0
        }
        InstructionCoverage = @{
            Current = $History[-1].InstructionCoverage
            Average = [math]::Round(($History | Measure-Object -Property InstructionCoverage -Average).Average, 2)
            Min = ($History | Measure-Object -Property InstructionCoverage -Minimum).Minimum
            Max = ($History | Measure-Object -Property InstructionCoverage -Maximum).Maximum
            Trend = 0
        }
    }

    # 计算趋势（最近7天与前7天的比较）
    if ($History.Count -ge 14) {
        $recent = $History[-7..-1]
        $previous = $History[-14..-8]

        $stats.LineCoverage.Trend = [math]::Round(
            (($recent | Measure-Object -Property LineCoverage -Average).Average) -
            (($previous | Measure-Object -Property BranchCoverage -Average).Average), 2)

        $stats.BranchCoverage.Trend = [math]::Round(
            (($recent | Measure-Object -Property BranchCoverage -Average).Average) -
            (($previous | Measure-Object -Property BranchCoverage -Average).Average), 2)

        $stats.InstructionCoverage.Trend = [math]::Round(
            (($recent | Measure-Object -Property InstructionCoverage -Average).Average) -
            (($previous | Measure-Object -Property InstructionCoverage -Average).Average), 2)
    }

    return $stats
}

function Generate-HTMLReport {
    param(
        [CoverageTrend[]]$History,
        [hashtable]$Stats,
        [string]$OutputPath
    )

    $html = @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>代码覆盖率趋势分析报告</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1, h2 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007acc; }
        .stat-value { font-size: 2em; font-weight: bold; color: #007acc; }
        .stat-label { color: #666; margin-top: 5px; }
        .trend-up { color: #28a745; }
        .trend-down { color: #dc3545; }
        .trend-neutral { color: #6c757d; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        tr:hover { background-color: #f5f5f5; }
        .chart-container { margin: 20px 0; height: 400px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>代码覆盖率趋势分析报告</h1>
        <p><strong>生成时间:</strong> $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")</p>
        <p><strong>分析周期:</strong> $($Stats.DateRange.Start.ToString("yyyy-MM-dd")) 至 $($Stats.DateRange.End.ToString("yyyy-MM-dd"))</p>
        <p><strong>数据点数量:</strong> $($Stats.TotalRecords)</p>

        <h2>覆盖率统计</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">$($Stats.LineCoverage.Current)%</div>
                <div class="stat-label">当前行覆盖率</div>
                <div class="stat-label">平均: $($Stats.LineCoverage.Average)% | 范围: $($Stats.LineCoverage.Min)% - $($Stats.LineCoverage.Max)%</div>
                <div class="stat-label $(if ($Stats.LineCoverage.Trend -gt 0) { 'trend-up' } elseif ($Stats.LineCoverage.Trend -lt 0) { 'trend-down' } else { 'trend-neutral' })">
                    7日趋势: $(if ($Stats.LineCoverage.Trend -gt 0) { '+' })$($Stats.LineCoverage.Trend)%
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-value">$($Stats.BranchCoverage.Current)%</div>
                <div class="stat-label">当前分支覆盖率</div>
                <div class="stat-label">平均: $($Stats.BranchCoverage.Average)% | 范围: $($Stats.BranchCoverage.Min)% - $($Stats.BranchCoverage.Max)%</div>
                <div class="stat-label $(if ($Stats.BranchCoverage.Trend -gt 0) { 'trend-up' } elseif ($Stats.BranchCoverage.Trend -lt 0) { 'trend-down' } else { 'trend-neutral' })">
                    7日趋势: $(if ($Stats.BranchCoverage.Trend -gt 0) { '+' })$($Stats.BranchCoverage.Trend)%
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-value">$($Stats.InstructionCoverage.Current)%</div>
                <div class="stat-label">当前指令覆盖率</div>
                <div class="stat-label">平均: $($Stats.InstructionCoverage.Average)% | 范围: $($Stats.InstructionCoverage.Min)% - $($Stats.InstructionCoverage.Max)%</div>
                <div class="stat-label $(if ($Stats.InstructionCoverage.Trend -gt 0) { 'trend-up' } elseif ($Stats.InstructionCoverage.Trend -lt 0) { 'trend-down' } else { 'trend-neutral' })">
                    7日趋势: $(if ($Stats.InstructionCoverage.Trend -gt 0) { '+' })$($Stats.InstructionCoverage.Trend)%
                </div>
            </div>
        </div>

        <h2>覆盖率趋势图表</h2>
        <div class="chart-container">
            <canvas id="coverageChart"></canvas>
        </div>

        <h2>详细数据</h2>
        <table>
            <thead>
                <tr>
                    <th>日期</th>
                    <th>行覆盖率</th>
                    <th>分支覆盖率</th>
                    <th>指令覆盖率</th>
                    <th>方法覆盖率</th>
                    <th>类覆盖率</th>
                    <th>覆盖行数</th>
                    <th>总行数</th>
                </tr>
            </thead>
            <tbody>
"@

    # 按日期分组并排序
    $dailyData = $History | Group-Object Date | ForEach-Object {
        $group = $_.Group
        $latest = $group | Sort-Object Date -Descending | Select-Object -First 1
        $latest
    } | Sort-Object Date

    foreach ($item in $dailyData) {
        $html += @"
                <tr>
                    <td>$($item.Date.ToString("yyyy-MM-dd"))</td>
                    <td>$($item.LineCoverage)%</td>
                    <td>$($item.BranchCoverage)%</td>
                    <td>$($item.InstructionCoverage)%</td>
                    <td>$($item.MethodCoverage)%</td>
                    <td>$($item.ClassCoverage)%</td>
                    <td>$($item.CoveredLines)</td>
                    <td>$($item.TotalLines)</td>
                </tr>
"@
    }

    $html += @"
            </tbody>
        </table>
    </div>

    <script>
        // 准备图表数据
        const chartData = {
            labels: [
"@

    $dates = $dailyData | ForEach-Object { "'$($_.Date.ToString("MM-dd"))'" }
    $html += $dates -join ","

    $html += @"
            ],
            datasets: [{
                label: '行覆盖率 (%)',
                data: [
"@

    $lineData = $dailyData | ForEach-Object { $_.LineCoverage }
    $html += $lineData -join ","

    $html += @"
                ],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }, {
                label: '分支覆盖率 (%)',
                data: [
"@

    $branchData = $dailyData | ForEach-Object { $_.BranchCoverage }
    $html += $branchData -join ","

    $html += @"
                ],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1
            }]
        };

        // 创建图表
        const ctx = document.getElementById('coverageChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '覆盖率 (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '日期'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '代码覆盖率趋势'
                    }
                }
            }
        });
    </script>
</body>
</html>
"@

    $html | Set-Content $OutputPath -Encoding UTF8
    Write-Host "HTML报告已生成: $OutputPath" -ForegroundColor Green
}

function Main {
    Write-Host "开始覆盖率趋势分析..." -ForegroundColor Blue

    # 检查历史文件
    if (!(Test-Path $HistoryFile)) {
        Write-Warning "历史文件不存在: $HistoryFile"
        Write-Host "请先运行覆盖率监控脚本来生成历史数据。" -ForegroundColor Yellow
        exit 1
    }

    # 创建输出目录
    if (!(Test-Path $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
        Write-VerboseLog "创建输出目录: $OutputDir"
    }

    try {
        # 读取历史数据
        Write-Host "读取覆盖率历史数据..." -ForegroundColor Yellow
        $history = Get-CoverageHistory $HistoryFile

        if ($history.Count -eq 0) {
            Write-Warning "没有找到有效的历史数据"
            exit 1
        }

        # 过滤最近N天的数��
        $cutoffDate = (Get-Date).AddDays(-$Days)
        $filteredHistory = $history | Where-Object { $_.Date -ge $cutoffDate }

        Write-VerboseLog "分析最近 $Days 天的 $($filteredHistory.Count) 个数据点"

        # 计算统计信息
        $stats = Get-CoverageStatistics $filteredHistory

        # 生成报告
        $reportPath = Join-Path $OutputDir "coverage-trend-report.html"
        Generate-HTMLReport $filteredHistory $stats $reportPath

        # 显示摘要
        Write-Host "=== 覆盖率趋势分析摘要 ===" -ForegroundColor Green
        Write-Host "分析周期: 最近 $Days 天"
        Write-Host "数据点数: $($filteredHistory.Count)"
        Write-Host ""
        Write-Host "行覆盖率:   当前 $($stats.LineCoverage.Current)% | 平均 $($stats.LineCoverage.Average)% | 趋势 $(if ($stats.LineCoverage.Trend -gt 0) { '+' })$($stats.LineCoverage.Trend)%"
        Write-Host "分支覆盖率: 当前 $($stats.BranchCoverage.Current)% | 平均 $($stats.BranchCoverage.Average)% | 趋势 $(if ($stats.BranchCoverage.Trend -gt 0) { '+' })$($stats.BranchCoverage.Trend)%"
        Write-Host "指令覆盖率: 当前 $($stats.InstructionCoverage.Current)% | 平均 $($stats.InstructionCoverage.Average)% | 趋势 $(if ($stats.InstructionCoverage.Trend -gt 0) { '+' })$($stats.InstructionCoverage.Trend)%"
        Write-Host ""
        Write-Host "详细报告已生成: $reportPath" -ForegroundColor Green

        Write-Host "覆盖率趋势分析完成 ✅" -ForegroundColor Green

    }
    catch {
        Write-Error "覆盖率趋势分析失败: $($_.Exception.Message)"
        exit 1
    }
}

# 执行主函数
Main
