# 性能报告生成脚本
# 分析测试结果中的性能数据并生成综合报告

param(
    [string]$ReportDir = "test-results/performance",
    [string]$OutputDir = "performance-reports",
    [switch]$OpenBrowser,
    [switch]$Verbose
)

Write-Host "🚀 生成性能报告" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查报告目录是否存在
if (!(Test-Path $ReportDir)) {
    Write-Host "❌ 性能报告目录不存在: $ReportDir" -ForegroundColor Red
    exit 1
}

# 创建输出目录
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# 查找所有性能报告文件
$reportFiles = Get-ChildItem -Path $ReportDir -Filter "performance-*.json" | Sort-Object LastWriteTime -Descending

if ($reportFiles.Count -eq 0) {
    Write-Host "❌ 未找到性能报告文件" -ForegroundColor Red
    exit 1
}

Write-Host "📊 找到 $($reportFiles.Count) 个性能报告文件" -ForegroundColor Yellow

# 读取和分析所有报告
$reports = @()
$summary = @{
    totalTests = 0
    totalDuration = 0
    totalViolations = 0
    violationsByCategory = @{}
    violationsByType = @{}
    recommendations = @()
    slowestTests = @()
    performanceTrends = @{
        pageLoadTimes = @()
        networkRequests = @()
        memoryUsage = @()
    }
}

foreach ($file in $reportFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw | ConvertFrom-Json
        $reports += $content

        # 汇总统计
        $summary.totalTests++
        $summary.totalDuration += $content.duration
        $summary.totalViolations += $content.violations.Count

        # 违规分类统计
        foreach ($violation in $content.violations) {
            $category = $violation.category
            $type = $violation.type

            if (!$summary.violationsByCategory.ContainsKey($category)) {
                $summary.violationsByCategory[$category] = 0
            }
            $summary.violationsByCategory[$category]++

            if (!$summary.violationsByType.ContainsKey($type)) {
                $summary.violationsByType[$type] = 0
            }
            $summary.violationsByType[$type]++
        }

        # 收集建议
        $summary.recommendations += $content.recommendations

        # 收集性能趋势数据
        $summary.performanceTrends.pageLoadTimes += $content.metrics.pageLoad.load
        $summary.performanceTrends.networkRequests += $content.metrics.network.totalRequests
        $summary.performanceTrends.memoryUsage += $content.metrics.resources.heapUsed

    } catch {
        Write-Warning "无法读取报告文件: $($file.Name) - $($_.Exception.Message)"
    }
}

# 计算平均值和趋势
if ($summary.totalTests -gt 0) {
    $summary.averageDuration = $summary.totalDuration / $summary.totalTests
    $summary.averagePageLoad = ($summary.performanceTrends.pageLoadTimes | Measure-Object -Average).Average
    $summary.averageNetworkRequests = ($summary.performanceTrends.networkRequests | Measure-Object -Average).Average
    $summary.averageMemoryUsage = ($summary.performanceTrends.memoryUsage | Measure-Object -Average).Average
}

# 找出最慢的测试
$slowestTests = $reports | Sort-Object -Property duration -Descending | Select-Object -First 5
$summary.slowestTests = $slowestTests | ForEach-Object {
    @{
        name = $_.testName
        duration = $_.duration
        violations = $_.violations.Count
    }
}

# 去重建议
$summary.recommendations = $summary.recommendations | Select-Object -Unique

# 生成详细的HTML报告
$htmlReport = @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>前端E2E性能报告</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-card h3 {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .stat-card .value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        .stat-card.warning .value { color: #ffc107; }
        .stat-card.error .value { color: #dc3545; }
        .stat-card.success .value { color: #28a745; }
        .charts-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        .chart-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .chart-card h3 {
            margin-bottom: 20px;
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .violations-section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .violation-item {
            padding: 15px;
            border-left: 4px solid #dc3545;
            background: #f8f9fa;
            margin-bottom: 10px;
            border-radius: 0 5px 5px 0;
        }
        .violation-item.warning {
            border-left-color: #ffc107;
        }
        .violation-item.error {
            border-left-color: #dc3545;
        }
        .recommendations-section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .recommendation-item {
            padding: 15px;
            background: #e7f3ff;
            border-left: 4px solid #667eea;
            margin-bottom: 10px;
            border-radius: 0 5px 5px 0;
        }
        .slow-tests-section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .slow-test-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #eee;
        }
        .slow-test-item:last-child {
            border-bottom: none;
        }
        .test-name {
            font-weight: bold;
            color: #333;
        }
        .test-duration {
            color: #dc3545;
            font-weight: bold;
        }
        .test-violations {
            color: #ffc107;
        }
        .footer {
            text-align: center;
            color: #666;
            margin-top: 30px;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 前端E2E性能报告</h1>
            <p>生成时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>总测试数</h3>
                <div class="value">$($summary.totalTests)</div>
            </div>
            <div class="stat-card $(if ($summary.averageDuration -gt 60000) { 'warning' } else { 'success' })">
                <h3>平均耗时</h3>
                <div class="value">$([math]::Round($summary.averageDuration / 1000, 1))s</div>
            </div>
            <div class="stat-card $(if ($summary.totalViolations -gt 10) { 'error' } elseif ($summary.totalViolations -gt 5) { 'warning' } else { 'success' })">
                <h3>性能违规</h3>
                <div class="value">$($summary.totalViolations)</div>
            </div>
            <div class="stat-card $(if ($summary.averagePageLoad -gt 5000) { 'warning' } else { 'success' })">
                <h3>平均页面加载</h3>
                <div class="value">$([math]::Round($summary.averagePageLoad, 0))ms</div>
            </div>
        </div>

        <div class="charts-section">
            <div class="chart-card">
                <h3>📈 性能指标趋势</h3>
                <canvas id="performanceChart" width="400" height="300"></canvas>
            </div>
            <div class="chart-card">
                <h3>🔍 违规分布</h3>
                <canvas id="violationsChart" width="400" height="300"></canvas>
            </div>
        </div>

        $(if ($summary.totalViolations -gt 0) {
        "<div class='violations-section'>
            <h3>⚠️ 性能违规详情</h3>"
            foreach ($violation in ($reports | ForEach-Object { $_.violations } | Where-Object { $_ } | Select-Object -First 10)) {
                "<div class='violation-item $(if ($violation.type -eq 'error') { 'error' } else { 'warning' })'>
                    <strong>$($violation.category) - $($violation.metric)</strong><br>
                    实际值: $($violation.actual) | 阈值: $($violation.threshold)<br>
                    $($violation.message)
                </div>"
            }
        "</div>"
        })

        $(if ($summary.recommendations.Count -gt 0) {
        "<div class='recommendations-section'>
            <h3>💡 性能优化建议</h3>"
            foreach ($recommendation in $summary.recommendations) {
                "<div class='recommendation-item'>
                    $recommendation
                </div>"
            }
        "</div>"
        })

        <div class='slow-tests-section'>
            <h3>🐌 最慢测试用例</h3>
            $($summary.slowestTests | ForEach-Object {
                "<div class='slow-test-item'>
                    <div class='test-name'>$($_.name)</div>
                    <div>
                        <span class='test-duration'>$([math]::Round($_.duration / 1000, 1))s</span>
                        $(if ($_.violations -gt 0) { "<span class='test-violations'> | 违规: $($_.violations)</span>" })
                    </div>
                </div>"
            })
        </div>

        <div class="footer">
            <p>📊 报告生成于 $(Get-Date -Format "yyyy-MM-dd HH:mm:ss") | 共分析了 $($reportFiles.Count) 个测试结果</p>
        </div>
    </div>

    <script>
        // 性能指标图表
        const performanceCtx = document.getElementById('performanceChart').getContext('2d');
        new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['页面加载', '网络请求', '内存使用'],
                datasets: [{
                    label: '平均值',
                    data: [
                        $($summary.averagePageLoad),
                        $($summary.averageNetworkRequests),
                        $($summary.averageMemoryUsage)
                    ],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // 违规分布图表
        const violationsCtx = document.getElementById('violationsChart').getContext('2d');
        new Chart(violationsCtx, {
            type: 'doughnut',
            data: {
                labels: $($summary.violationsByCategory.Keys | ConvertTo-Json),
                datasets: [{
                    data: $($summary.violationsByCategory.Values | ConvertTo-Json),
                    backgroundColor: ['#dc3545', '#ffc107', '#28a745', '#17a2b8']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    </script>
</body>
</html>
"@

# 保存HTML报告
$htmlPath = Join-Path $OutputDir "performance-report.html"
$htmlReport | Out-File -FilePath $htmlPath -Encoding UTF8

# 生成JSON摘要报告
$jsonSummary = @{
    generatedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    summary = $summary
    totalReports = $reports.Count
    dateRange = @{
        earliest = ($reports | Sort-Object { [DateTime]::Parse($_.timestamp) } | Select-Object -First 1).timestamp
        latest = ($reports | Sort-Object { [DateTime]::Parse($_.timestamp) } -Descending | Select-Object -First 1).timestamp
    }
} | ConvertTo-Json -Depth 10

$jsonPath = Join-Path $OutputDir "performance-summary.json"
$jsonSummary | Out-File -FilePath $jsonPath -Encoding UTF8

Write-Host ""
Write-Host "✅ 性能报告生成完成!" -ForegroundColor Green
Write-Host "📁 报告位置:" -ForegroundColor Cyan
Write-Host "   HTML报告: $htmlPath" -ForegroundColor White
Write-Host "   JSON摘要: $jsonPath" -ForegroundColor White

# 显示统计摘要
Write-Host ""
Write-Host "📊 统计摘要:" -ForegroundColor Yellow
Write-Host "   总测试数: $($summary.totalTests)" -ForegroundColor White
Write-Host "   平均耗时: $([math]::Round($summary.averageDuration / 1000, 1))秒" -ForegroundColor White
Write-Host "   性能违规: $($summary.totalViolations)" -ForegroundColor $(if ($summary.totalViolations -gt 10) { 'Red' } elseif ($summary.totalViolations -gt 5) { 'Yellow' } else { 'Green' })
Write-Host "   平均页面加载: $([math]::Round($summary.averagePageLoad, 0))ms" -ForegroundColor White

if ($Verbose) {
    Write-Host ""
    Write-Host "🔍 详细违规统计:" -ForegroundColor Cyan
    foreach ($category in $summary.violationsByCategory.GetEnumerator()) {
        Write-Host "   $($category.Key): $($category.Value)" -ForegroundColor White
    }
}

if ($OpenBrowser) {
    try {
        Start-Process $htmlPath
        Write-Host ""
        Write-Host "🌐 已打开浏览器查看报告" -ForegroundColor Green
    } catch {
        Write-Warning "无法自动打开浏览器，请手动打开: $htmlPath"
    }
}

Write-Host ""
Write-Host "🎯 主要发现:" -ForegroundColor Cyan
if ($summary.totalViolations -eq 0) {
    Write-Host "   ✅ 所有测试均符合性能标准" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ 发现 $($summary.totalViolations) 项性能违规需要关注" -ForegroundColor Yellow
    if ($summary.recommendations.Count -gt 0) {
        Write-Host "   💡 提供了 $($summary.recommendations.Count) 条优化建议" -ForegroundColor Cyan
    }
}
