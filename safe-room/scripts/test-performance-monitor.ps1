# Test Performance Monitor Script
# 监控测试执行性能，建立基准线，检测性能回归

param(
    [Parameter(Mandatory=$false)]
    [string]$TestResultsPath = ".\test-reports",

    [Parameter(Mandatory=$false)]
    [string]$BaselineFile = ".\scripts\config\test-performance-baseline.json",

    [Parameter(Mandatory=$false)]
    [switch]$UpdateBaseline,

    [Parameter(Mandatory=$false)]
    [switch]$GenerateReport,

    [Parameter(Mandatory=$false)]
    [int]$HistoryDays = 30,

    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# 导入环境检查函数库
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$envLibPath = Join-Path $scriptRoot "common\Test-Environment.ps1"
if (Test-Path $envLibPath) {
    . $envLibPath
} else {
    Write-Error "Error: Environment check function library not found: $envLibPath"
    exit 1
}

# 性能监控配置
$PerformanceConfig = @{
    SlowTestThreshold = 30  # 慢测试阈值（秒）
    PerformanceRegressionThreshold = 20  # 性能回归阈值百分比
    MinSamplesForBaseline = 3  # 建立基准线的最小样本数
    BaselineUpdateInterval = 7  # 基准线更新间隔（天）
}

# 颜色输出函数
function Write-PerformanceSuccess { Write-TestLog $args "SUCCESS" }
function Write-PerformanceError { Write-TestLog $args "ERROR" }
function Write-PerformanceWarning { Write-TestLog $args "WARN" }
function Write-PerformanceInfo {
    param([string]$Message, [switch]$NoTimestamp)
    Write-TestLog $Message "INFO" -NoTimestamp:$NoTimestamp
}

# 解析测试结果获取性能数据
function Get-TestPerformanceData {
    param([string]$ResultsPath)

    $performanceData = @{
        TotalTests = 0
        PassedTests = 0
        FailedTests = 0
        SkippedTests = 0
        TotalDuration = 0
        AverageDuration = 0
        SlowTests = @()
        FastTests = @()
        TestDetails = @()
        Timestamp = Get-Date
        Environment = @{
            NodeVersion = $null
            NpmVersion = $null
            Platform = $env:OS
            CPU = $null
            Memory = $null
        }
    }

    try {
        # 获取环境信息
        try { $performanceData.Environment.NodeVersion = & node --version 2>$null } catch {}
        try { $performanceData.Environment.NpmVersion = & npm --version 2>$null } catch {}

        # 获取系统信息
        try {
            $computerSystem = Get-WmiObject -Class Win32_ComputerSystem -ErrorAction SilentlyContinue
            if ($computerSystem) {
                $performanceData.Environment.CPU = "$($computerSystem.NumberOfLogicalProcessors) cores"
            }
        } catch {}

        # 查找最新的测试报告
        $jsonFiles = Get-ChildItem -Path $ResultsPath -Filter "*.json" -File -ErrorAction SilentlyContinue |
                     Sort-Object LastWriteTime -Descending

        foreach ($jsonFile in $jsonFiles) {
            try {
                $reportData = Get-Content $jsonFile.FullName -Raw | ConvertFrom-Json

                # 处理不同格式的测试报告
                if ($reportData.numTotalTests) {
                    # Vitest 格式
                    $performanceData.TotalTests += $reportData.numTotalTests
                    $performanceData.PassedTests += $reportData.numPassedTests
                    $performanceData.FailedTests += $reportData.numFailedTests
                    $performanceData.SkippedTests += $reportData.numPendingTests
                    $performanceData.TotalDuration += [math]::Round($reportData.duration / 1000, 2)

                    # 收集测试详情
                    if ($reportData.testResults) {
                        foreach ($testResult in $reportData.testResults) {
                            $performanceData.TestDetails += @{
                                name = $testResult.title
                                duration = [math]::Round($testResult.duration / 1000, 2)
                                status = if ($testResult.status -eq 'passed') { 'passed' } elseif ($testResult.status -eq 'failed') { 'failed' } else { 'skipped' }
                                project = $jsonFile.Name -replace '\.json$', ''
                            }
                        }
                    }
                } elseif ($reportData.stats) {
                    # Playwright 格式
                    $performanceData.TotalTests += $reportData.stats.expected
                    $performanceData.PassedTests += $reportData.stats.passes
                    $performanceData.FailedTests += $reportData.stats.failures
                    $performanceData.SkippedTests += $reportData.stats.pending
                    $performanceData.TotalDuration += [math]::Round($reportData.stats.duration / 1000, 2)
                }

            } catch {
                Write-PerformanceWarning "Failed to parse test report: $($jsonFile.Name)"
            }
        }

        # 计算平均值
        if ($performanceData.TotalTests -gt 0) {
            $performanceData.AverageDuration = [math]::Round($performanceData.TotalDuration / $performanceData.TotalTests, 2)
        }

        # 识别慢测试和快测试
        $performanceData.SlowTests = $performanceData.TestDetails |
            Where-Object { $_.duration -gt $PerformanceConfig.SlowTestThreshold } |
            Sort-Object duration -Descending

        $performanceData.FastTests = $performanceData.TestDetails |
            Where-Object { $_.duration -gt 0 -and $_.duration -le 1 } |
            Sort-Object duration

    } catch {
        Write-PerformanceError "Error collecting performance data: $($_.Exception.Message)"
    }

    return $performanceData
}

# 加载性能基准线
function Get-PerformanceBaseline {
    param([string]$BaselinePath)

    $baseline = @{
        CreatedAt = $null
        UpdatedAt = $null
        Samples = @()
        Averages = @{
            TotalDuration = 0
            AverageDuration = 0
            SlowTestCount = 0
        }
        Trends = @{
            DurationTrend = 0
            PerformanceChange = 0
        }
    }

    if (Test-Path $BaselinePath) {
        try {
            $baselineData = Get-Content $BaselinePath -Raw | ConvertFrom-Json

            $baseline.CreatedAt = [DateTime]::Parse($baselineData.CreatedAt)
            $baseline.UpdatedAt = [DateTime]::Parse($baselineData.UpdatedAt)
            $baseline.Samples = $baselineData.Samples
            $baseline.Averages = $baselineData.Averages
            $baseline.Trends = $baselineData.Trends

        } catch {
            Write-PerformanceWarning "Failed to load baseline file: $BaselinePath. Creating new baseline."
        }
    }

    return $baseline
}

# 保存性能基准线
function Save-PerformanceBaseline {
    param(
        [string]$BaselinePath,
        [hashtable]$Baseline
    )

    $baselineDirectory = Split-Path $BaselinePath -Parent
    if (-not (Test-Path $baselineDirectory)) {
        New-Item -ItemType Directory -Path $baselineDirectory -Force | Out-Null
    }

    $baselineData = @{
        CreatedAt = $Baseline.CreatedAt.ToString('o')
        UpdatedAt = $Baseline.UpdatedAt.ToString('o')
        Samples = $Baseline.Samples
        Averages = $Baseline.Averages
        Trends = $Baseline.Trends
    }

    $baselineData | ConvertTo-Json -Depth 5 | Set-Content $BaselinePath -Encoding UTF8
    Write-PerformanceInfo "Performance baseline saved to: $BaselinePath"
}

# 更新性能基准线
function Update-PerformanceBaseline {
    param(
        [hashtable]$Baseline,
        [hashtable]$CurrentData,
        [string]$BaselinePath
    )

    $now = Get-Date

    # 初始化基准线
    if (-not $Baseline.CreatedAt) {
        $Baseline.CreatedAt = $now
    }
    $Baseline.UpdatedAt = $now

    # 添加当前样本
    $sample = @{
        Timestamp = $now.ToString('o')
        TotalDuration = $CurrentData.TotalDuration
        AverageDuration = $CurrentData.AverageDuration
        SlowTestCount = $CurrentData.SlowTests.Count
        TotalTests = $CurrentData.TotalTests
        PassedTests = $CurrentData.PassedTests
        Environment = $CurrentData.Environment
    }

    $Baseline.Samples += $sample

    # 限制样本数量（保留最近30天的样本）
    $cutoffDate = $now.AddDays(-$HistoryDays)
    $Baseline.Samples = $Baseline.Samples | Where-Object {
        [DateTime]::Parse($_.Timestamp) -gt $cutoffDate
    }

    # 计算平均值
    if ($Baseline.Samples.Count -ge $PerformanceConfig.MinSamplesForBaseline) {
        $durations = $Baseline.Samples | ForEach-Object { $_.TotalDuration }
        $avgDurations = $Baseline.Samples | ForEach-Object { $_.AverageDuration }
        $slowCounts = $Baseline.Samples | ForEach-Object { $_.SlowTestCount }

        $Baseline.Averages.TotalDuration = [math]::Round(($durations | Measure-Object -Average).Average, 2)
        $Baseline.Averages.AverageDuration = [math]::Round(($avgDurations | Measure-Object -Average).Average, 2)
        $Baseline.Averages.SlowTestCount = [math]::Round(($slowCounts | Measure-Object -Average).Average, 2)

        # 计算趋势（最近7天 vs 之前）
        $recentSamples = $Baseline.Samples | Where-Object {
            [DateTime]::Parse($_.Timestamp) -gt $now.AddDays(-7)
        }
        $olderSamples = $Baseline.Samples | Where-Object {
            [DateTime]::Parse($_.Timestamp) -le $now.AddDays(-7)
        }

        if ($recentSamples.Count -gt 0 -and $olderSamples.Count -gt 0) {
            $recentAvg = ($recentSamples | ForEach-Object { $_.TotalDuration } | Measure-Object -Average).Average
            $olderAvg = ($olderSamples | ForEach-Object { $_.TotalDuration } | Measure-Object -Average).Average

            if ($olderAvg -gt 0) {
                $Baseline.Trends.DurationTrend = [math]::Round((($recentAvg - $olderAvg) / $olderAvg) * 100, 2)
            }
        }
    }

    # 保存基准线
    Save-PerformanceBaseline -BaselinePath $BaselinePath -Baseline $Baseline
}

# 检测性能回归
function Test-PerformanceRegression {
    param(
        [hashtable]$CurrentData,
        [hashtable]$Baseline
    )

    $regressions = @{
        HasRegression = $false
        Issues = @()
        Improvements = @()
        Summary = @{
            DurationChange = 0
            SlowTestChange = 0
            OverallScore = 0
        }
    }

    # 检查是否有足够的基准数据
    if ($Baseline.Samples.Count -lt $PerformanceConfig.MinSamplesForBaseline) {
        $regressions.Issues += "Insufficient baseline data ($($Baseline.Samples.Count) samples). Need at least $($PerformanceConfig.MinSamplesForBaseline) samples."
        return $regressions
    }

    # 检查总执行时间回归
    if ($Baseline.Averages.TotalDuration -gt 0) {
        $durationChange = (($CurrentData.TotalDuration - $Baseline.Averages.TotalDuration) / $Baseline.Averages.TotalDuration) * 100
        $regressions.Summary.DurationChange = [math]::Round($durationChange, 2)

        if ($durationChange -gt $PerformanceConfig.PerformanceRegressionThreshold) {
            $regressions.HasRegression = $true
            $regressions.Issues += "Total execution time increased by $($regressions.Summary.DurationChange)% (from $($Baseline.Averages.TotalDuration)s to $($CurrentData.TotalDuration)s)"
        } elseif ($durationChange -lt -$PerformanceConfig.PerformanceRegressionThreshold) {
            $regressions.Improvements += "Total execution time improved by $([math]::Abs($regressions.Summary.DurationChange))% (from $($Baseline.Averages.TotalDuration)s to $($CurrentData.TotalDuration)s)"
        }
    }

    # 检查慢测试数量变化
    $slowTestChange = $CurrentData.SlowTests.Count - $Baseline.Averages.SlowTestCount
    $regressions.Summary.SlowTestChange = $slowTestChange

    if ($slowTestChange -gt 2) {
        $regressions.HasRegression = $true
        $regressions.Issues += "Slow test count increased by $slowTestChange (from $($Baseline.Averages.SlowTestCount) to $($CurrentData.SlowTests.Count))"
    } elseif ($slowTestChange -lt -2) {
        $regressions.Improvements += "Slow test count decreased by $([math]::Abs($slowTestChange)) (from $($Baseline.Averages.SlowTestCount) to $($CurrentData.SlowTests.Count))"
    }

    # 计算整体性能评分
    $score = 100
    if ($regressions.Summary.DurationChange -gt 0) {
        $score -= [math]::Min($regressions.Summary.DurationChange, 50)
    } else {
        $score += [math]::Min([math]::Abs($regressions.Summary.DurationChange), 20)
    }

    if ($slowTestChange -gt 0) {
        $score -= $slowTestChange * 5
    } else {
        $score += [math]::Abs($slowTestChange) * 5
    }

    $regressions.Summary.OverallScore = [math]::Max(0, [math]::Min(100, $score))

    return $regressions
}

# 生成性能报告
function New-PerformanceReport {
    param(
        [hashtable]$CurrentData,
        [hashtable]$Baseline,
        [hashtable]$RegressionAnalysis,
        [string]$ReportPath = "performance-report.html"
    )

    $status = if ($RegressionAnalysis.HasRegression) { "⚠️ REGRESSION DETECTED" } else { "✅ PERFORMANCE OK" }
    $statusColor = if ($RegressionAnalysis.HasRegression) { "#dc3545" } else { "#28a745" }

    $html = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        .status { font-size: 24px; font-weight: bold; color: $statusColor; margin: 20px 0; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .regression { background: #f8d7da; border-color: #f5c6cb; }
        .improvement { background: #d4edda; border-color: #c3e6cb; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .issues { color: #dc3545; margin: 10px 0; }
        .improvements { color: #28a745; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; }
        .chart { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚡ Test Performance Report</h1>
        <p><strong>Generated:</strong> $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
        <div class="status">$status</div>

        <div class="section">
            <h2>📊 Current Performance Metrics</h2>
            <div class="metric">
                <span>Total Tests:</span>
                <span>$($CurrentData.TotalTests)</span>
            </div>
            <div class="metric">
                <span>Total Duration:</span>
                <span>$($CurrentData.TotalDuration)s</span>
            </div>
            <div class="metric">
                <span>Average Duration:</span>
                <span>$($CurrentData.AverageDuration)s per test</span>
            </div>
            <div class="metric">
                <span>Slow Tests (>30s):</span>
                <span>$($CurrentData.SlowTests.Count)</span>
            </div>
            <div class="metric">
                <span>Performance Score:</span>
                <span>$($RegressionAnalysis.Summary.OverallScore)/100</span>
            </div>
        </div>

        <div class="section">
            <h2>📈 Baseline Comparison</h2>
            <div class="metric">
                <span>Baseline Duration:</span>
                <span>$($Baseline.Averages.TotalDuration)s</span>
            </div>
            <div class="metric">
                <span>Duration Change:</span>
                <span>$($RegressionAnalysis.Summary.DurationChange)%</span>
            </div>
            <div class="metric">
                <span>Slow Test Change:</span>
                <span>$($RegressionAnalysis.Summary.SlowTestChange)</span>
            </div>
            <div class="metric">
                <span>Baseline Samples:</span>
                <span>$($Baseline.Samples.Count)</span>
            </div>
        </div>

        $(if ($RegressionAnalysis.Issues.Count -gt 0) {
        "<div class='section regression'>
            <h2>⚠️ Performance Regressions</h2>
            $($RegressionAnalysis.Issues | ForEach-Object { "<div class='issues'>• $_</div>" })
        </div>"
        })

        $(if ($RegressionAnalysis.Improvements.Count -gt 0) {
        "<div class='section improvement'>
            <h2>✅ Performance Improvements</h2>
            $($RegressionAnalysis.Improvements | ForEach-Object { "<div class='improvements'>• $_</div>" })
        </div>"
        })

        $(if ($CurrentData.SlowTests.Count -gt 0) {
        "<div class='section'>
            <h2>🐌 Slow Tests</h2>
            <table>
                <tr><th>Test Name</th><th>Duration (s)</th><th>Project</th></tr>
                $($CurrentData.SlowTests | ForEach-Object {
                    "<tr><td>$($_.name)</td><td>$($_.duration)</td><td>$($_.project)</td></tr>"
                })
            </table>
        </div>"
        })

        <div class="section">
            <h2>💻 Environment Information</h2>
            <div class="metric">
                <span>Node Version:</span>
                <span>$($CurrentData.Environment.NodeVersion)</span>
            </div>
            <div class="metric">
                <span>NPM Version:</span>
                <span>$($CurrentData.Environment.NpmVersion)</span>
            </div>
            <div class="metric">
                <span>Platform:</span>
                <span>$($CurrentData.Environment.Platform)</span>
            </div>
            <div class="metric">
                <span>CPU:</span>
                <span>$($CurrentData.Environment.CPU)</span>
            </div>
        </div>
    </div>
</body>
</html>
"@

    $html | Out-File -FilePath $ReportPath -Encoding UTF8
    Write-PerformanceInfo "Performance report saved to: $ReportPath"
}

# 主函数
function Invoke-PerformanceMonitoring {
    param(
        [string]$TestResultsPath,
        [string]$BaselineFile,
        [switch]$UpdateBaseline,
        [switch]$GenerateReport,
        [switch]$Verbose
    )

    Write-PerformanceInfo "========================================="
    Write-PerformanceInfo "   Test Performance Monitoring"
    Write-PerformanceInfo "========================================="

    # 获取当前性能数据
    Write-PerformanceInfo "`n📊 Collecting current performance data..."
    $currentData = Get-TestPerformanceData -ResultsPath $TestResultsPath

    if ($Verbose) {
        Write-PerformanceInfo "Current Data Summary:" -NoTimestamp
        Write-PerformanceInfo "  Total Tests: $($currentData.TotalTests)" -NoTimestamp
        Write-PerformanceInfo "  Total Duration: $($currentData.TotalDuration)s" -NoTimestamp
        Write-PerformanceInfo "  Average Duration: $($currentData.AverageDuration)s" -NoTimestamp
        Write-PerformanceInfo "  Slow Tests: $($currentData.SlowTests.Count)" -NoTimestamp
    }

    # 加载基准线
    Write-PerformanceInfo "`n📈 Loading performance baseline..."
    $baseline = Get-PerformanceBaseline -BaselinePath $BaselineFile

    # 检测性能回归
    Write-PerformanceInfo "`n🔍 Analyzing performance regression..."
    $regressionAnalysis = Test-PerformanceRegression -CurrentData $currentData -Baseline $baseline

    # 显示结果
    Write-PerformanceInfo "`n📋 Performance Analysis Results:"
    Write-PerformanceInfo "Duration Change: $($regressionAnalysis.Summary.DurationChange)%" -NoTimestamp
    Write-PerformanceInfo "Slow Test Change: $($regressionAnalysis.Summary.SlowTestChange)" -NoTimestamp
    Write-PerformanceInfo "Performance Score: $($regressionAnalysis.Summary.OverallScore)/100" -NoTimestamp

    if ($regressionAnalysis.HasRegression) {
        Write-PerformanceError "`n⚠️ PERFORMANCE REGRESSION DETECTED!"
        $regressionAnalysis.Issues | ForEach-Object {
            Write-PerformanceError "  • $_"
        }
    } else {
        Write-PerformanceSuccess "`n✅ No performance regression detected."
    }

    if ($regressionAnalysis.Improvements.Count -gt 0) {
        Write-PerformanceInfo "`n✅ Performance Improvements:"
        $regressionAnalysis.Improvements | ForEach-Object {
            Write-PerformanceInfo "  • $_"
        }
    }

    # 更新基准线
    if ($UpdateBaseline) {
        Write-PerformanceInfo "`n📝 Updating performance baseline..."
        Update-PerformanceBaseline -Baseline $baseline -CurrentData $currentData -BaselinePath $BaselineFile
        Write-PerformanceSuccess "Performance baseline updated."
    }

    # 生成报告
    if ($GenerateReport) {
        $reportPath = "test-performance-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
        New-PerformanceReport -CurrentData $currentData -Baseline $baseline -RegressionAnalysis $regressionAnalysis -ReportPath $reportPath
    }

    # 返回结果
    return @{
        CurrentData = $currentData
        Baseline = $baseline
        RegressionAnalysis = $regressionAnalysis
        HasRegression = $regressionAnalysis.HasRegression
    }
}

# 执行性能监控
try {
    $result = Invoke-PerformanceMonitoring -TestResultsPath $TestResultsPath -BaselineFile $BaselineFile -UpdateBaseline:$UpdateBaseline -GenerateReport:$GenerateReport -Verbose:$Verbose

    # 设置退出代码
    if ($result.HasRegression) {
        exit 1
    } else {
        exit 0
    }
} catch {
    Write-PerformanceError "Performance monitoring failed: $($_.Exception.Message)"
    exit 1
}
