# Test Dashboard Generator Script
# 生成综合测试仪表板，整合所有测试指标

param(
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "test-dashboard.html",

    [Parameter(Mandatory=$false)]
    [string]$TestResultsPath = ".\test-reports",

    [Parameter(Mandatory=$false)]
    [string]$CoveragePath = ".\coverage",

    [Parameter(Mandatory=$false)]
    [string]$BaselineFile = ".\scripts\config\test-performance-baseline.json",

    [Parameter(Mandatory=$false)]
    [int]$HistoryDays = 30,

    [Parameter(Mandatory=$false)]
    [switch]$IncludeTrends,

    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# 导入相关脚本
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$envLibPath = Join-Path $scriptRoot "common\Test-Environment.ps1"
$qualityGatePath = Join-Path $scriptRoot "frontend-test-quality-gate.ps1"
$performanceMonitorPath = Join-Path $scriptRoot "test-performance-monitor.ps1"

if (Test-Path $envLibPath) {
    . $envLibPath
} else {
    Write-Error "Error: Environment check function library not found: $envLibPath"
    exit 1
}

# 颜色输出函数
function Write-DashboardSuccess { Write-TestLog $args "SUCCESS" }
function Write-DashboardError { Write-TestLog $args "ERROR" }
function Write-DashboardWarning { Write-TestLog $args "WARN" }
function Write-DashboardInfo {
    param([string]$Message, [switch]$NoTimestamp)
    Write-TestLog $Message "INFO" -NoTimestamp:$NoTimestamp
}

# 收集所有测试指标
function Get-TestDashboardData {
    param(
        [string]$TestResultsPath,
        [string]$CoveragePath,
        [string]$BaselineFile,
        [int]$HistoryDays
    )

    $dashboard = @{
        GeneratedAt = Get-Date
        Environment = @{
            Platform = if ($Global:PlatformInfo.IsWindows) { "Windows" } elseif ($Global:PlatformInfo.IsLinux) { "Linux" } else { "macOS" }
            NodeVersion = $null
            NpmVersion = $null
        }
        Summary = @{
            TotalTests = 0
            PassedTests = 0
            FailedTests = 0
            SkippedTests = 0
            PassRate = 0
            TotalDuration = 0
            AverageDuration = 0
        }
        Coverage = @{
            Lines = 0
            Functions = 0
            Branches = 0
            Statements = 0
            Status = "unknown"
        }
        Performance = @{
            Score = 0
            SlowTestsCount = 0
            RegressionDetected = $false
            TrendDirection = "stable"
        }
        Quality = @{
            GatePassed = $true
            Issues = @()
            Recommendations = @()
        }
        Trends = @()
        RecentRuns = @()
    }

    try {
        # 获取环境信息
        try { $dashboard.Environment.NodeVersion = & node --version 2>$null } catch {}
        try { $dashboard.Environment.NpmVersion = & npm --version 2>$null } catch {}

        # 收集测试结果数据
        Write-DashboardInfo "Collecting test results..." -NoTimestamp
        $testResults = Get-ChildItem -Path $TestResultsPath -Filter "*.json" -File -ErrorAction SilentlyContinue |
                      Sort-Object LastWriteTime -Descending

        $totalTests = 0
        $passedTests = 0
        $failedTests = 0
        $skippedTests = 0
        $totalDuration = 0

        foreach ($resultFile in $testResults) {
            try {
                $resultData = Get-Content $resultFile.FullName -Raw | ConvertFrom-Json

                if ($resultData.numTotalTests) {
                    # Vitest 格式
                    $totalTests += $resultData.numTotalTests
                    $passedTests += $resultData.numPassedTests
                    $failedTests += $resultData.numFailedTests
                    $skippedTests += $resultData.numPendingTests
                    $totalDuration += [math]::Round($resultData.duration / 1000, 2)
                } elseif ($resultData.stats) {
                    # Playwright 格式
                    $totalTests += $resultData.stats.expected
                    $passedTests += $resultData.stats.passes
                    $failedTests += $resultData.stats.failures
                    $skippedTests += $resultData.stats.pending
                    $totalDuration += [math]::Round($resultData.stats.duration / 1000, 2)
                }
            } catch {
                Write-DashboardWarning "Failed to parse test result file: $($resultFile.Name)"
            }
        }

        $dashboard.Summary.TotalTests = $totalTests
        $dashboard.Summary.PassedTests = $passedTests
        $dashboard.Summary.FailedTests = $failedTests
        $dashboard.Summary.SkippedTests = $skippedTests
        $dashboard.Summary.TotalDuration = [math]::Round($totalDuration, 2)
        $dashboard.Summary.AverageDuration = $totalTests -gt 0 ? [math]::Round($totalDuration / $totalTests, 2) : 0
        $dashboard.Summary.PassRate = $totalTests -gt 0 ? [math]::Round(($passedTests / $totalTests) * 100, 2) : 0

        # 收集覆盖率数据
        Write-DashboardInfo "Collecting coverage data..." -NoTimestamp
        $coverageFiles = @(
            "coverage-final.json",
            "coverage-summary.json"
        )

        foreach ($file in $coverageFiles) {
            $filePath = Join-Path $CoveragePath $file
            if (Test-Path $filePath) {
                try {
                    $coverageData = Get-Content $filePath -Raw | ConvertFrom-Json

                    if ($coverageData.total) {
                        $dashboard.Coverage.Lines = [math]::Round($coverageData.total.lines.pct, 2)
                        $dashboard.Coverage.Functions = [math]::Round($coverageData.total.functions.pct, 2)
                        $dashboard.Coverage.Branches = [math]::Round($coverageData.total.branches.pct, 2)
                        $dashboard.Coverage.Statements = [math]::Round($coverageData.total.statements.pct, 2)

                        # 确定覆盖率状态
                        $avgCoverage = ($dashboard.Coverage.Lines + $dashboard.Coverage.Functions + $dashboard.Coverage.Branches + $dashboard.Coverage.Statements) / 4
                        $dashboard.Coverage.Status = if ($avgCoverage -ge 85) { "excellent" } elseif ($avgCoverage -ge 75) { "good" } elseif ($avgCoverage -ge 60) { "fair" } else { "poor" }
                    }
                    break
                } catch {
                    Write-DashboardWarning "Failed to parse coverage file: $file"
                }
            }
        }

        # 收集性能数据
        Write-DashboardInfo "Analyzing performance data..." -NoTimestamp
        $slowTests = $testResults | Where-Object {
            try {
                $data = Get-Content $_.FullName -Raw | ConvertFrom-Json
                $duration = if ($data.duration) { $data.duration / 1000 } elseif ($data.stats.duration) { $data.stats.duration / 1000 } else { 0 }
                return $duration -gt 30
            } catch { return $false }
        }

        $dashboard.Performance.SlowTestsCount = $slowTests.Count
        $dashboard.Performance.Score = [math]::Max(0, [math]::Min(100, 100 - ($failedTests * 5) - ($dashboard.Performance.SlowTestsCount * 2)))

        # 收集趋势数据
        if ($IncludeTrends) {
            Write-DashboardInfo "Collecting trend data..." -NoTimestamp
            $cutoffDate = (Get-Date).AddDays(-$HistoryDays)

            $dashboard.Trends = $testResults |
                Where-Object { $_.LastWriteTime -gt $cutoffDate } |
                Sort-Object LastWriteTime -Descending |
                Select-Object -First 10 |
                ForEach-Object {
                    try {
                        $data = Get-Content $_.FullName -Raw | ConvertFrom-Json
                        @{
                            Date = $_.LastWriteTime.ToString('yyyy-MM-dd')
                            PassRate = if ($data.numTotalTests) {
                                [math]::Round(($data.numPassedTests / $data.numTotalTests) * 100, 2)
                            } elseif ($data.stats) {
                                [math]::Round(($data.stats.passes / $data.stats.expected) * 100, 2)
                            } else { 0 }
                            Duration = if ($data.duration) {
                                [math]::Round($data.duration / 1000, 2)
                            } elseif ($data.stats.duration) {
                                [math]::Round($data.stats.duration / 1000, 2)
                            } else { 0 }
                        }
                    } catch { $null }
                } | Where-Object { $_ -ne $null }
        }

        # 生成质量建议
        Write-DashboardInfo "Generating quality recommendations..." -NoTimestamp
        if ($dashboard.Summary.PassRate -lt 95) {
            $dashboard.Quality.Issues += "Test pass rate is below 95%: $($dashboard.Summary.PassRate)%"
            $dashboard.Quality.Recommendations += "Review and fix failing tests to improve stability"
        }

        if ($dashboard.Coverage.Lines -lt 85) {
            $dashboard.Quality.Issues += "Line coverage is below 85%: $($dashboard.Coverage.Lines)%"
            $dashboard.Quality.Recommendations += "Add more unit tests to improve code coverage"
        }

        if ($dashboard.Performance.SlowTestsCount -gt 3) {
            $dashboard.Quality.Issues += "Too many slow tests: $($dashboard.Performance.SlowTestsCount)"
            $dashboard.Quality.Recommendations += "Optimize slow tests or consider splitting them"
        }

        $dashboard.Quality.GatePassed = $dashboard.Quality.Issues.Count -eq 0

    } catch {
        Write-DashboardError "Error collecting dashboard data: $($_.Exception.Message)"
    }

    return $dashboard
}

# 生成仪表板HTML
function New-TestDashboard {
    param(
        [hashtable]$DashboardData,
        [string]$OutputPath
    )

    $statusColor = if ($DashboardData.Quality.GatePassed) { "#28a745" } else { "#dc3545" }
    $statusText = if ($DashboardData.Quality.GatePassed) { "✅ All Quality Gates Passed" } else { "❌ Quality Issues Detected" }

    $html = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frontend Test Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 1600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.2em; opacity: 0.9; }
        .status-banner { background: $statusColor; color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 1.1em; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; padding: 30px; }
        .card { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); border: 1px solid #e1e5e9; }
        .card h3 { color: #333; margin-bottom: 20px; font-size: 1.3em; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        .metric { display: flex; justify-content: space-between; align-items: center; margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 8px; }
        .metric-label { font-weight: 600; color: #555; }
        .metric-value { font-size: 1.5em; font-weight: bold; color: #333; }
        .progress-bar { width: 100%; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
        .chart-container { position: relative; height: 300px; margin: 20px 0; }
        .issues-list { margin: 15px 0; }
        .issue-item { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 10px; margin: 8px 0; color: #856404; }
        .recommendation-item { background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 6px; padding: 10px; margin: 8px 0; color: #0c5460; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; border-top: 1px solid #dee2e6; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: bold; text-transform: uppercase; }
        .badge-success { background: #d4edda; color: #155724; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .badge-danger { background: #f8d7da; color: #721c24; }
        .badge-info { background: #d1ecf1; color: #0c5460; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } .header h1 { font-size: 2em; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Frontend Test Dashboard</h1>
            <p>Generated on $($DashboardData.GeneratedAt.ToString('yyyy-MM-dd HH:mm:ss'))</p>
        </div>

        <div class="status-banner">
            $statusText
        </div>

        <div class="grid">
            <!-- 测试概览卡片 -->
            <div class="card">
                <h3>📊 Test Overview</h3>
                <div class="metric">
                    <span class="metric-label">Total Tests</span>
                    <span class="metric-value">$($DashboardData.Summary.TotalTests)</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Pass Rate</span>
                    <span class="metric-value">$($DashboardData.Summary.PassRate)%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: $($DashboardData.Summary.PassRate)%; background: $(if ($DashboardData.Summary.PassRate -ge 95) { '#28a745' } elseif ($DashboardData.Summary.PassRate -ge 85) { '#ffc107' } else { '#dc3545' });"></div>
                </div>
                <div class="metric">
                    <span class="metric-label">Passed</span>
                    <span class="metric-value" style="color: #28a745;">$($DashboardData.Summary.PassedTests)</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Failed</span>
                    <span class="metric-value" style="color: $(if ($DashboardData.Summary.FailedTests -eq 0) { '#28a745' } else { '#dc3545' });">$($DashboardData.Summary.FailedTests)</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Skipped</span>
                    <span class="metric-value" style="color: #6c757d;">$($DashboardData.Summary.SkippedTests)</span>
                </div>
            </div>

            <!-- 覆盖率卡片 -->
            <div class="card">
                <h3>🎯 Code Coverage</h3>
                <div class="metric">
                    <span class="metric-label">Lines</span>
                    <span class="metric-value">$($DashboardData.Coverage.Lines)%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: $($DashboardData.Coverage.Lines)%; background: $(if ($DashboardData.Coverage.Lines -ge 85) { '#28a745' } elseif ($DashboardData.Coverage.Lines -ge 75) { '#ffc107' } else { '#dc3545' });"></div>
                </div>
                <div class="metric">
                    <span class="metric-label">Functions</span>
                    <span class="metric-value">$($DashboardData.Coverage.Functions)%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Branches</span>
                    <span class="metric-value">$($DashboardData.Coverage.Branches)%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Statements</span>
                    <span class="metric-value">$($DashboardData.Coverage.Statements)%</span>
                </div>
                <div style="margin-top: 15px;">
                    <span class="badge $(if ($DashboardData.Coverage.Status -eq 'excellent') { 'badge-success' } elseif ($DashboardData.Coverage.Status -eq 'good') { 'badge-warning' } elseif ($DashboardData.Coverage.Status -eq 'fair') { 'badge-info' } else { 'badge-danger' })">
                        $($DashboardData.Coverage.Status.ToUpper())
                    </span>
                </div>
            </div>

            <!-- 性能卡片 -->
            <div class="card">
                <h3>⚡ Performance</h3>
                <div class="metric">
                    <span class="metric-label">Total Duration</span>
                    <span class="metric-value">$($DashboardData.Summary.TotalDuration)s</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Average Duration</span>
                    <span class="metric-value">$($DashboardData.Summary.AverageDuration)s</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Performance Score</span>
                    <span class="metric-value">$($DashboardData.Performance.Score)/100</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: $($DashboardData.Performance.Score)%; background: $(if ($DashboardData.Performance.Score -ge 90) { '#28a745' } elseif ($DashboardData.Performance.Score -ge 70) { '#ffc107' } else { '#dc3545' });"></div>
                </div>
                <div class="metric">
                    <span class="metric-label">Slow Tests</span>
                    <span class="metric-value" style="color: $(if ($DashboardData.Performance.SlowTestsCount -eq 0) { '#28a745' } elseif ($DashboardData.Performance.SlowTestsCount -lt 3) { '#ffc107' } else { '#dc3545' });">$($DashboardData.Performance.SlowTestsCount)</span>
                </div>
            </div>

            <!-- 环境信息卡片 -->
            <div class="card">
                <h3>💻 Environment</h3>
                <div class="metric">
                    <span class="metric-label">Platform</span>
                    <span class="metric-value">$($DashboardData.Environment.Platform)</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Node Version</span>
                    <span class="metric-value">$($DashboardData.Environment.NodeVersion)</span>
                </div>
                <div class="metric">
                    <span class="metric-label">NPM Version</span>
                    <span class="metric-value">$($DashboardData.Environment.NpmVersion)</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Generated</span>
                    <span class="metric-value">$($DashboardData.GeneratedAt.ToString('HH:mm'))</span>
                </div>
            </div>
        </div>

        $(if ($DashboardData.Trends.Count -gt 0) {
        "<div class='grid'><div class='card'><h3>📈 Trends (Last $($DashboardData.Trends.Count) Days)</h3><div class='chart-container'><canvas id='trendChart'></canvas></div></div></div>"
        })

        $(if ($DashboardData.Quality.Issues.Count -gt 0 -or $DashboardData.Quality.Recommendations.Count -gt 0) {
        "<div class='grid'>"
        if ($DashboardData.Quality.Issues.Count -gt 0) {
        "<div class='card'><h3>⚠️ Quality Issues</h3><div class='issues-list'>"
        $DashboardData.Quality.Issues | ForEach-Object { "<div class='issue-item'>• $_</div>" }
        "</div></div>"
        }
        if ($DashboardData.Quality.Recommendations.Count -gt 0) {
        "<div class='card'><h3>💡 Recommendations</h3><div class='issues-list'>"
        $DashboardData.Quality.Recommendations | ForEach-Object { "<div class='recommendation-item'>• $_</div>" }
        "</div></div>"
        }
        "</div>"
        })

        <div class="footer">
            <p>Generated by Frontend Test Dashboard Generator | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
        </div>
    </div>

    $(if ($DashboardData.Trends.Count -gt 0) {
    "<script>
        const ctx = document.getElementById('trendChart').getContext('2d');
        const trendData = $($DashboardData.Trends | ConvertTo-Json -Compress);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.map(d => d.Date),
                datasets: [{
                    label: 'Pass Rate (%)',
                    data: trendData.map(d => d.PassRate),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Duration (s)',
                    data: trendData.map(d => d.Duration),
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Pass Rate (%)' }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        title: { display: true, text: 'Duration (s)' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    </script>"
    })

</body>
</html>
"@

    # 确保输出目录存在
    $outputDirectory = Split-Path $OutputPath -Parent
    if (-not (Test-Path $outputDirectory)) {
        New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
    }

    $html | Out-File -FilePath $OutputPath -Encoding UTF8
    Write-DashboardSuccess "Test dashboard generated: $OutputPath"
}

# 主函数
function Invoke-TestDashboardGeneration {
    param(
        [string]$OutputPath,
        [string]$TestResultsPath,
        [string]$CoveragePath,
        [string]$BaselineFile,
        [int]$HistoryDays,
        [switch]$IncludeTrends,
        [switch]$Verbose
    )

    Write-DashboardInfo "========================================="
    Write-DashboardInfo "   Frontend Test Dashboard Generator"
    Write-DashboardInfo "========================================="

    # 收集仪表板数据
    Write-DashboardInfo "`n📊 Collecting dashboard data..."
    $dashboardData = Get-TestDashboardData -TestResultsPath $TestResultsPath -CoveragePath $CoveragePath -BaselineFile $BaselineFile -HistoryDays $HistoryDays

    if ($Verbose) {
        Write-DashboardInfo "Dashboard Data Summary:" -NoTimestamp
        Write-DashboardInfo "  Total Tests: $($dashboardData.Summary.TotalTests)" -NoTimestamp
        Write-DashboardInfo "  Pass Rate: $($dashboardData.Summary.PassRate)%" -NoTimestamp
        Write-DashboardInfo "  Coverage: Lines $($dashboardData.Coverage.Lines)%, Functions $($dashboardData.Coverage.Functions)%" -NoTimestamp
        Write-DashboardInfo "  Performance Score: $($dashboardData.Performance.Score)/100" -NoTimestamp
        Write-DashboardInfo "  Quality Gate: $(if ($dashboardData.Quality.GatePassed) { 'PASSED' } else { 'FAILED' })" -NoTimestamp
    }

    # 生成仪表板
    Write-DashboardInfo "`n🎨 Generating dashboard..."
    New-TestDashboard -DashboardData $dashboardData -OutputPath $OutputPath

    Write-DashboardSuccess "`n✅ Test dashboard generation completed!"
    Write-DashboardInfo "Open $OutputPath in your browser to view the dashboard." -NoTimestamp

    return $dashboardData
}

# 执行仪表板生成
try {
    $result = Invoke-TestDashboardGeneration -OutputPath $OutputPath -TestResultsPath $TestResultsPath -CoveragePath $CoveragePath -BaselineFile $BaselineFile -HistoryDays $HistoryDays -IncludeTrends:$IncludeTrends -Verbose:$Verbose
} catch {
    Write-DashboardError "Dashboard generation failed: $($_.Exception.Message)"
    exit 1
}
