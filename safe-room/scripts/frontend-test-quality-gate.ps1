# Frontend Test Quality Gate Script
# 集成覆盖率、通过率、性能检查的质量门禁系统

param(
    [Parameter(Mandatory=$false)]
    [string]$TestReportPath = ".\test-reports",

    [Parameter(Mandatory=$false)]
    [string]$CoverageReportPath = ".\coverage",

    [Parameter(Mandatory=$false)]
    [string]$ConfigFile = ".\scripts\config\frontend-quality-gate.json",

    [Parameter(Mandatory=$false)]
    [switch]$Strict,

    [Parameter(Mandatory=$false)]
    [switch]$Verbose,

    [Parameter(Mandatory=$false)]
    [switch]$GenerateReport,

    [Parameter(Mandatory=$false)]
    [string]$Project = "all"  # front, admin, or all
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

# 颜色输出函数
function Write-QualityGateSuccess { Write-TestLog $args "SUCCESS" }
function Write-QualityGateError { Write-TestLog $args "ERROR" }
function Write-QualityGateWarning { Write-TestLog $args "WARN" }
function Write-QualityGateInfo {
    param([string]$Message, [switch]$NoTimestamp)
    Write-TestLog $Message "INFO" -NoTimestamp:$NoTimestamp
}

# 默认配置
$DefaultConfig = @{
    CoverageThresholds = @{
        lines = 85
        functions = 85
        branches = 80
        statements = 85
    }
    TestQualityThresholds = @{
        passRate = 95  # 95% 测试通过率
        maxFailures = 5  # 最大失败测试数
        maxSkipped = 10  # 最大跳过测试数
    }
    PerformanceThresholds = @{
        maxDuration = 600  # 最大测试执行时间（秒）
        maxSlowTests = 3   # 最大慢测试数量
        slowTestThreshold = 30  # 慢测试阈值（秒）
    }
    QualityChecks = @{
        enableCoverageCheck = $true
        enableTestQualityCheck = $true
        enablePerformanceCheck = $true
        enableDependencyCheck = $true
        enableCodeQualityCheck = $false  # 需要额外配置
    }
}

# 加载配置
function Load-QualityGateConfig {
    param([string]$ConfigPath)

    $config = $DefaultConfig.Clone()

    if (Test-Path $ConfigPath) {
        try {
            $customConfig = Get-Content $ConfigPath -Raw | ConvertFrom-Json

            # 合并覆盖率阈值
            if ($customConfig.thresholds) {
                if ($customConfig.thresholds.lines) { $config.CoverageThresholds.lines = $customConfig.thresholds.lines }
                if ($customConfig.thresholds.functions) { $config.CoverageThresholds.functions = $customConfig.thresholds.functions }
                if ($customConfig.thresholds.branches) { $config.CoverageThresholds.branches = $customConfig.thresholds.branches }
                if ($customConfig.thresholds.statements) { $config.CoverageThresholds.statements = $customConfig.thresholds.statements }
            }

            # 合并测试质量阈值
            if ($customConfig.testQuality) {
                if ($customConfig.testQuality.passRate) { $config.TestQualityThresholds.passRate = $customConfig.testQuality.passRate }
                if ($customConfig.testQuality.maxFailures) { $config.TestQualityThresholds.maxFailures = $customConfig.testQuality.maxFailures }
                if ($customConfig.testQuality.maxSkipped) { $config.TestQualityThresholds.maxSkipped = $customConfig.testQuality.maxSkipped }
            }

            # 合并性能阈值
            if ($customConfig.performance) {
                if ($customConfig.performance.maxDuration) { $config.PerformanceThresholds.maxDuration = $customConfig.performance.maxDuration }
                if ($customConfig.performance.maxSlowTests) { $config.PerformanceThresholds.maxSlowTests = $customConfig.performance.maxSlowTests }
                if ($customConfig.performance.slowTestThreshold) { $config.PerformanceThresholds.slowTestThreshold = $customConfig.performance.slowTestThreshold }
            }

            # 合并质量检查启用状态
            if ($customConfig.checks) {
                if ($null -ne $customConfig.checks.enableCoverageCheck) { $config.QualityChecks.enableCoverageCheck = $customConfig.checks.enableCoverageCheck }
                if ($null -ne $customConfig.checks.enableTestQualityCheck) { $config.QualityChecks.enableTestQualityCheck = $customConfig.checks.enableTestQualityCheck }
                if ($null -ne $customConfig.checks.enablePerformanceCheck) { $config.QualityChecks.enablePerformanceCheck = $customConfig.checks.enablePerformanceCheck }
                if ($null -ne $customConfig.checks.enableDependencyCheck) { $config.QualityChecks.enableDependencyCheck = $customConfig.checks.enableDependencyCheck }
                if ($null -ne $customConfig.checks.enableCodeQualityCheck) { $config.QualityChecks.enableCodeQualityCheck = $customConfig.checks.enableCodeQualityCheck }
            }

            Write-QualityGateInfo "Loaded configuration from: $ConfigPath"
        } catch {
            Write-QualityGateWarning "Failed to load configuration file: $ConfigPath. Using defaults."
        }
    } else {
        Write-QualityGateInfo "Configuration file not found, using defaults: $ConfigPath"
    }

    return $config
}

# 解析测试报告
function Get-TestResults {
    param([string]$ReportPath)

    $results = @{
        Total = 0
        Passed = 0
        Failed = 0
        Skipped = 0
        Duration = 0
        Tests = @()
    }

    # 查找最新的测试报告
    $jsonFiles = Get-ChildItem -Path $ReportPath -Filter "*.json" -File |
                 Sort-Object LastWriteTime -Descending

    foreach ($jsonFile in $jsonFiles) {
        try {
            $reportData = Get-Content $jsonFile.FullName -Raw | ConvertFrom-Json

            # 处理不同格式的测试报告
            if ($reportData.numTotalTests) {
                # Vitest 格式
                $results.Total += $reportData.numTotalTests
                $results.Passed += $reportData.numPassedTests
                $results.Failed += $reportData.numFailedTests
                $results.Skipped += $reportData.numPendingTests
                $results.Duration += [math]::Round($reportData.duration / 1000, 2)  # 转换为秒
            } elseif ($reportData.stats) {
                # Playwright 格式
                $results.Total += $reportData.stats.expected
                $results.Passed += $reportData.stats.passes
                $results.Failed += $reportData.stats.failures
                $results.Skipped += $reportData.stats.pending
                $results.Duration += [math]::Round($reportData.stats.duration / 1000, 2)  # 转换为秒
            }

            # 收集测试详情
            if ($reportData.testResults) {
                foreach ($testResult in $reportData.testResults) {
                    $results.Tests += @{
                        name = $testResult.title
                        status = if ($testResult.status -eq 'passed') { 'passed' } elseif ($testResult.status -eq 'failed') { 'failed' } else { 'skipped' }
                        duration = [math]::Round($testResult.duration / 1000, 2)
                        project = $jsonFile.Name -replace '\.json$', ''
                    }
                }
            }

        } catch {
            Write-QualityGateWarning "Failed to parse test report: $($jsonFile.Name)"
        }
    }

    return $results
}

# 解析覆盖率报告
function Get-CoverageResults {
    param([string]$CoveragePath)

    $results = @{
        lines = 0
        functions = 0
        branches = 0
        statements = 0
        details = @{}
    }

    # 查找覆盖率报告文件
    $coverageFiles = @(
        "coverage-final.json",
        "coverage-summary.json",
        "lcov-report/index.html"
    )

    foreach ($file in $coverageFiles) {
        $filePath = Join-Path $CoveragePath $file
        if (Test-Path $filePath) {
            try {
                if ($file.EndsWith('.json')) {
                    $coverageData = Get-Content $filePath -Raw | ConvertFrom-Json

                    if ($coverageData.total) {
                        $results.lines = [math]::Round($coverageData.total.lines.pct, 2)
                        $results.functions = [math]::Round($coverageData.total.functions.pct, 2)
                        $results.branches = [math]::Round($coverageData.total.branches.pct, 2)
                        $results.statements = [math]::Round($coverageData.total.statements.pct, 2)
                        $results.details = $coverageData
                    }
                }
                break
            } catch {
                Write-QualityGateWarning "Failed to parse coverage file: $file"
            }
        }
    }

    return $results
}

# 检查覆盖率阈值
function Test-CoverageThresholds {
    param(
        [hashtable]$CoverageResults,
        [hashtable]$Thresholds,
        [switch]$Verbose
    )

    $passed = $true
    $issues = @()

    $checks = @(
        @{ Name = "Lines"; Value = $CoverageResults.lines; Threshold = $Thresholds.lines },
        @{ Name = "Functions"; Value = $CoverageResults.functions; Threshold = $Thresholds.functions },
        @{ Name = "Branches"; Value = $CoverageResults.branches; Threshold = $Thresholds.branches },
        @{ Name = "Statements"; Value = $CoverageResults.statements; Threshold = $Thresholds.statements }
    )

    foreach ($check in $checks) {
        if ($check.Value -lt $check.Threshold) {
            $issues += "$($check.Name) coverage ($($check.Value)%) below threshold ($($check.Threshold)%)"
            $passed = $false
        } elseif ($Verbose) {
            Write-QualityGateInfo "$($check.Name) coverage: $($check.Value)% (threshold: $($check.Threshold)%) ✓"
        }
    }

    return @{
        Passed = $passed
        Issues = $issues
    }
}

# 检查测试质量
function Test-TestQuality {
    param(
        [hashtable]$TestResults,
        [hashtable]$Thresholds,
        [switch]$Verbose
    )

    $passed = $true
    $issues = @()

    # 计算通过率
    $passRate = if ($TestResults.Total -gt 0) {
        [math]::Round(($TestResults.Passed / $TestResults.Total) * 100, 2)
    } else {
        0
    }

    if ($passRate -lt $Thresholds.passRate) {
        $issues += "Test pass rate ($passRate%) below threshold ($($Thresholds.passRate)%)"
        $passed = $false
    } elseif ($Verbose) {
        Write-QualityGateInfo "Test pass rate: $passRate% (threshold: $($Thresholds.passRate)%) ✓"
    }

    # 检查失败测试数量
    if ($TestResults.Failed -gt $Thresholds.maxFailures) {
        $issues += "Failed tests ($($TestResults.Failed)) exceed threshold ($($Thresholds.maxFailures))"
        $passed = $false
    } elseif ($Verbose) {
        Write-QualityGateInfo "Failed tests: $($TestResults.Failed) (max: $($Thresholds.maxFailures)) ✓"
    }

    # 检查跳过测试数量
    if ($TestResults.Skipped -gt $Thresholds.maxSkipped) {
        $issues += "Skipped tests ($($TestResults.Skipped)) exceed threshold ($($Thresholds.maxSkipped))"
        $passed = $false
    } elseif ($Verbose) {
        Write-QualityGateInfo "Skipped tests: $($TestResults.Skipped) (max: $($Thresholds.maxSkipped)) ✓"
    }

    return @{
        Passed = $passed
        Issues = $issues
        PassRate = $passRate
    }
}

# 检查性能阈值
function Test-PerformanceThresholds {
    param(
        [hashtable]$TestResults,
        [hashtable]$Thresholds,
        [switch]$Verbose
    )

    $passed = $true
    $issues = @()

    # 检查总执行时间
    if ($TestResults.Duration -gt $Thresholds.maxDuration) {
        $issues += "Total test duration ($($TestResults.Duration)s) exceeds threshold ($($Thresholds.maxDuration)s)"
        $passed = $false
    } elseif ($Verbose) {
        Write-QualityGateInfo "Total duration: $($TestResults.Duration)s (max: $($Thresholds.maxDuration)s) ✓"
    }

    # 检查慢测试数量
    $slowTests = $TestResults.Tests | Where-Object { $_.duration -gt $Thresholds.slowTestThreshold }
    if ($slowTests.Count -gt $Thresholds.maxSlowTests) {
        $issues += "Slow tests ($($slowTests.Count)) exceed threshold ($($Thresholds.maxSlowTests))"
        $passed = $false
    } elseif ($Verbose) {
        Write-QualityGateInfo "Slow tests: $($slowTests.Count) (max: $($Thresholds.maxSlowTests)) ✓"
    }

    return @{
        Passed = $passed
        Issues = $issues
        SlowTests = $slowTests
    }
}

# 检查依赖完整性
function Test-DependenciesHealth {
    param([string]$ProjectPath, [switch]$Verbose)

    $passed = $true
    $issues = @()

    try {
        # 检查依赖完整性
        $dependencyCheck = Test-DependenciesIntegrity -ProjectPath $ProjectPath -CheckVersions -Verbose:$Verbose
        if (-not $dependencyCheck) {
            $issues += "Dependencies integrity check failed"
            $passed = $false
        } elseif ($Verbose) {
            Write-QualityGateInfo "Dependencies integrity check passed ✓"
        }
    } catch {
        $issues += "Dependencies check error: $($_.Exception.Message)"
        $passed = $false
    }

    return @{
        Passed = $passed
        Issues = $issues
    }
}

# 生成质量门禁报告
function New-QualityGateReport {
    param(
        [hashtable]$Results,
        [hashtable]$Config,
        [string]$ReportPath = "quality-gate-report.html"
    )

    $status = if ($Results.OverallPassed) { "✅ PASSED" } else { "❌ FAILED" }
    $statusColor = if ($Results.OverallPassed) { "green" } else { "red" }

    $html = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Frontend Test Quality Gate Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        .status { font-size: 24px; font-weight: bold; color: $statusColor; margin: 20px 0; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .passed { background: #d4edda; border-color: #c3e6cb; }
        .failed { background: #f8d7da; border-color: #f5c6cb; }
        .warning { background: #fff3cd; border-color: #ffeaa7; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .issues { color: #dc3545; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛡️ Frontend Test Quality Gate Report</h1>
        <p><strong>Generated:</strong> $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
        <p><strong>Project:</strong> $Project</p>
        <div class="status">$status</div>

        <div class="section passed">
            <h2>📊 Coverage Metrics</h2>
            <div class="metric">
                <span>Lines Coverage:</span>
                <span>$($Results.Coverage.lines)% (threshold: $($Config.CoverageThresholds.lines)%)</span>
            </div>
            <div class="metric">
                <span>Functions Coverage:</span>
                <span>$($Results.Coverage.functions)% (threshold: $($Config.CoverageThresholds.functions)%)</span>
            </div>
            <div class="metric">
                <span>Branches Coverage:</span>
                <span>$($Results.Coverage.branches)% (threshold: $($Config.CoverageThresholds.branches)%)</span>
            </div>
            <div class="metric">
                <span>Statements Coverage:</span>
                <span>$($Results.Coverage.statements)% (threshold: $($Config.CoverageThresholds.statements)%)</span>
            </div>
            $(if ($Results.CoverageCheck.Issues.Count -gt 0) { "<div class='issues'>Issues: $($Results.CoverageCheck.Issues -join ', ')</div>" })
        </div>

        <div class="section passed">
            <h2>🧪 Test Quality</h2>
            <div class="metric">
                <span>Total Tests:</span>
                <span>$($Results.TestResults.Total)</span>
            </div>
            <div class="metric">
                <span>Passed:</span>
                <span>$($Results.TestResults.Passed)</span>
            </div>
            <div class="metric">
                <span>Failed:</span>
                <span>$($Results.TestResults.Failed)</span>
            </div>
            <div class="metric">
                <span>Skipped:</span>
                <span>$($Results.TestResults.Skipped)</span>
            </div>
            <div class="metric">
                <span>Pass Rate:</span>
                <span>$($Results.TestQuality.PassRate)% (threshold: $($Config.TestQualityThresholds.passRate)%)</span>
            </div>
            $(if ($Results.TestQuality.Issues.Count -gt 0) { "<div class='issues'>Issues: $($Results.TestQuality.Issues -join ', ')</div>" })
        </div>

        <div class="section passed">
            <h2>⚡ Performance</h2>
            <div class="metric">
                <span>Total Duration:</span>
                <span>$($Results.TestResults.Duration)s (max: $($Config.PerformanceThresholds.maxDuration)s)</span>
            </div>
            <div class="metric">
                <span>Slow Tests:</span>
                <span>$($Results.Performance.SlowTests.Count) (max: $($Config.PerformanceThresholds.maxSlowTests))</span>
            </div>
            $(if ($Results.Performance.Issues.Count -gt 0) { "<div class='issues'>Issues: $($Results.Performance.Issues -join ', ')</div>" })
        </div>

        $(if ($Results.Performance.SlowTests.Count -gt 0) {
        "<div class='section warning'>
            <h2>🐌 Slow Tests</h2>
            <table>
                <tr><th>Test Name</th><th>Duration (s)</th><th>Project</th></tr>
                $($Results.Performance.SlowTests | ForEach-Object {
                    "<tr><td>$($_.name)</td><td>$($_.duration)</td><td>$($_.project)</td></tr>"
                })
            </table>
        </div>"
        })

        <div class="section $(if ($Results.Dependencies.Passed) { 'passed' } else { 'failed' })">
            <h2>📦 Dependencies</h2>
            <div class="metric">
                <span>Status:</span>
                <span>$(if ($Results.Dependencies.Passed) { '✅ Healthy' } else { '❌ Issues Found' })</span>
            </div>
            $(if ($Results.Dependencies.Issues.Count -gt 0) { "<div class='issues'>Issues: $($Results.Dependencies.Issues -join ', ')</div>" })
        </div>
    </div>
</body>
</html>
"@

    $html | Out-File -FilePath $ReportPath -Encoding UTF8
    Write-QualityGateInfo "Quality gate report saved to: $ReportPath"
}

# 主函数
function Invoke-QualityGate {
    param(
        [string]$TestReportPath,
        [string]$CoverageReportPath,
        [string]$ConfigFile,
        [string]$Project,
        [switch]$Strict,
        [switch]$Verbose,
        [switch]$GenerateReport
    )

    Write-QualityGateInfo "========================================="
    Write-QualityGateInfo "   Frontend Test Quality Gate"
    Write-QualityGateInfo "========================================="

    # 加载配置
    $config = Load-QualityGateConfig -ConfigPath $ConfigFile

    # 初始化结果
    $results = @{
        OverallPassed = $true
        Coverage = $null
        CoverageCheck = $null
        TestResults = $null
        TestQuality = $null
        Performance = $null
        Dependencies = $null
    }

    # 确定要检查的项目
    $projectsToCheck = @()
    switch ($Project) {
        "front" { $projectsToCheck = @("front") }
        "admin" { $projectsToCheck = @("admin") }
        "all" { $projectsToCheck = @("front", "admin") }
        default { $projectsToCheck = @("front", "admin") }
    }

    # 1. 检查覆盖率
    if ($config.QualityChecks.enableCoverageCheck) {
        Write-QualityGateInfo "`n🔍 Checking coverage thresholds..."

        foreach ($project in $projectsToCheck) {
            $projectCoveragePath = Join-Path $CoverageReportPath $project
            if (Test-Path $projectCoveragePath) {
                $coverageResults = Get-CoverageResults -CoveragePath $projectCoveragePath
                $coverageCheck = Test-CoverageThresholds -CoverageResults $coverageResults -Thresholds $config.CoverageThresholds -Verbose:$Verbose

                if (-not $coverageCheck.Passed) {
                    $results.OverallPassed = $false
                    Write-QualityGateError "Coverage check failed for $project`: $($coverageCheck.Issues -join ', ')"
                }

                # 合并覆盖率结果（取最高值）
                if (-not $results.Coverage -or $coverageResults.lines -gt $results.Coverage.lines) {
                    $results.Coverage = $coverageResults
                    $results.CoverageCheck = $coverageCheck
                }
            }
        }
    }

    # 2. 检查测试质量
    if ($config.QualityChecks.enableTestQualityCheck) {
        Write-QualityGateInfo "`n🧪 Checking test quality..."

        $testResults = Get-TestResults -ReportPath $TestReportPath
        $testQuality = Test-TestQuality -TestResults $testResults -Thresholds $config.TestQualityThresholds -Verbose:$Verbose

        if (-not $testQuality.Passed) {
            $results.OverallPassed = $false
            Write-QualityGateError "Test quality check failed: $($testQuality.Issues -join ', ')"
        }

        $results.TestResults = $testResults
        $results.TestQuality = $testQuality
    }

    # 3. 检查性能阈值
    if ($config.QualityChecks.enablePerformanceCheck) {
        Write-QualityGateInfo "`n⚡ Checking performance thresholds..."

        $performance = Test-PerformanceThresholds -TestResults $results.TestResults -Thresholds $config.PerformanceThresholds -Verbose:$Verbose

        if (-not $performance.Passed) {
            $results.OverallPassed = $false
            Write-QualityGateError "Performance check failed: $($performance.Issues -join ', ')"
        }

        $results.Performance = $performance
    }

    # 4. 检查依赖完整性
    if ($config.QualityChecks.enableDependencyCheck) {
        Write-QualityGateInfo "`n📦 Checking dependencies health..."

        foreach ($project in $projectsToCheck) {
            $projectPath = Join-Path $PSScriptRoot "..\springboot1ngh61a2\src\main\resources\$project\$project"
            $dependencyCheck = Test-DependenciesHealth -ProjectPath $projectPath -Verbose:$Verbose

            if (-not $dependencyCheck.Passed) {
                $results.OverallPassed = $false
                Write-QualityGateError "Dependencies check failed for $project`: $($dependencyCheck.Issues -join ', ')"
            }

            # 如果还没有依赖检查结果，或者当前检查通过了，保留结果
            if (-not $results.Dependencies -or $dependencyCheck.Passed) {
                $results.Dependencies = $dependencyCheck
            }
        }
    }

    # 生成报告
    if ($GenerateReport) {
        $reportPath = "frontend-quality-gate-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
        New-QualityGateReport -Results $results -Config $config -ReportPath $reportPath
    }

    # 输出总结
    Write-QualityGateInfo "`n========================================="
    if ($results.OverallPassed) {
        Write-QualityGateSuccess "QUALITY GATE PASSED - All checks successful! 🎉"
        exit 0
    } else {
        Write-QualityGateError "QUALITY GATE FAILED - Some checks failed. Please review the issues above."
        exit 1
    }
}

# 执行质量门禁检查
try {
    Invoke-QualityGate -TestReportPath $TestReportPath -CoverageReportPath $CoverageReportPath -ConfigFile $ConfigFile -Project $Project -Strict:$Strict -Verbose:$Verbose -GenerateReport:$GenerateReport
} catch {
    Write-QualityGateError "Quality gate execution failed: $($_.Exception.Message)"
    exit 1
}
