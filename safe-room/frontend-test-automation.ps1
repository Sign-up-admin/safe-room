#!/usr/bin/env powershell
<#
.SYNOPSIS
    前端测试自动化脚本 - 支持并行运行、失败重试和报告汇总

.DESCRIPTION
    该脚本提供完整的前端测试自动化功能，包括：
    - 并行运行多个项目的测试
    - 失败重试机制
    - 测试报告汇总
    - 覆盖率分析

.PARAMETER Type
    测试类型 (unit, e2e, coverage, all)

.PARAMETER App
    要测试的应用 (front, admin, both)

.PARAMETER Parallel
    是否并行运行测试

.PARAMETER Retry
    失败重试次数 (默认: 2)

.PARAMETER GenerateReport
    是否生成汇总报告

.EXAMPLE
    .\frontend-test-automation.ps1 -Type all -App both -Parallel

.EXAMPLE
    .\frontend-test-automation.ps1 -Type unit -App front -Retry 3
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("unit", "e2e", "coverage", "all")]
    [string]$Type = "all",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("front", "admin", "both")]
    [string]$App = "both",
    
    [switch]$Parallel,
    [int]$Retry = 2,
    [switch]$GenerateReport,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# 颜色输出函数
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Error { Write-ColorOutput Red $args }
function Write-Info { Write-ColorOutput Cyan $args }
function Write-Warning { Write-ColorOutput Yellow $args }

# 项目路径
$Projects = @{
    front = "springboot1ngh61a2\src\main\resources\front\front"
    admin = "springboot1ngh61a2\src\main\resources\admin\admin"
}

# 测试结果类
class TestResult {
    [string]$Project
    [string]$Type
    [bool]$Success
    [int]$Duration
    [string]$Output
    [int]$RetryCount
    [datetime]$Timestamp
}

$Global:TestResults = @()

# 运行测试的函数
function Run-Test {
    param(
        [string]$Path,
        [string]$ProjectName,
        [string]$TestType,
        [int]$MaxRetries = 0
    )
    
    $result = [TestResult]::new()
    $result.Project = $ProjectName
    $result.Type = $TestType
    $result.Timestamp = Get-Date
    $result.RetryCount = 0
    
    $startTime = Get-Date
    
    Push-Location $Path
    
    try {
        Write-Info "`n========================================="
        Write-Info "运行 $ProjectName - $TestType 测试"
        Write-Info "=========================================`n"
        
        $command = ""
        switch ($TestType) {
            "unit" { $command = "npm run test:unit" }
            "e2e" { $command = "npm run test:e2e" }
            "coverage" { $command = "npm run test:coverage" }
        }
        
        Write-Info "执行命令: $command`n"
        
        # 检查是否安装了依赖
        if (-not (Test-Path "node_modules")) {
            Write-Warning "未找到 node_modules，正在安装依赖..."
            npm install
            if ($LASTEXITCODE -ne 0) {
                throw "依赖安装失败"
            }
        }
        
        # 重试逻辑
        $attempt = 0
        $success = $false
        
        while ($attempt -le $MaxRetries -and -not $success) {
            if ($attempt -gt 0) {
                Write-Warning "第 $attempt 次重试..."
                Start-Sleep -Seconds 2
            }
            
            $output = & { Invoke-Expression $command } 2>&1 | Out-String
            $result.Output = $output
            $result.RetryCount = $attempt
            
            if ($LASTEXITCODE -eq 0) {
                $success = $true
                $result.Success = $true
                Write-Success "`n✓ $ProjectName - $TestType 测试通过"
            } else {
                $attempt++
                if ($attempt -le $MaxRetries) {
                    Write-Warning "测试失败，准备重试..."
                } else {
                    $result.Success = $false
                    Write-Error "`n✗ $ProjectName - $TestType 测试失败"
                }
            }
        }
        
        $endTime = Get-Date
        $result.Duration = [math]::Round(($endTime - $startTime).TotalSeconds, 2)
        
        return $result
    }
    catch {
        $result.Success = $false
        $result.Output = $_.Exception.Message
        $endTime = Get-Date
        $result.Duration = [math]::Round(($endTime - $startTime).TotalSeconds, 2)
        Write-Error "运行测试时出错: $_"
        return $result
    }
    finally {
        Pop-Location
    }
}

# 生成测试报告
function Generate-TestReport {
    param([TestResult[]]$Results)
    
    $reportPath = "frontend-test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>前端测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .summary-card { flex: 1; padding: 15px; border-radius: 8px; text-align: center; }
        .success { background: #d4edda; color: #155724; }
        .failure { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #4CAF50; color: white; }
        tr:hover { background: #f5f5f5; }
        .status-success { color: #28a745; font-weight: bold; }
        .status-failure { color: #dc3545; font-weight: bold; }
        .output { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 前端测试自动化报告</h1>
        <p><strong>生成时间:</strong> $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
        
        <div class="summary">
            <div class="summary-card info">
                <h2>$($Results.Count)</h2>
                <p>总测试数</p>
            </div>
            <div class="summary-card success">
                <h2>$($Results | Where-Object { $_.Success } | Measure-Object | Select-Object -ExpandProperty Count)</h2>
                <p>通过</p>
            </div>
            <div class="summary-card failure">
                <h2>$($Results | Where-Object { -not $_.Success } | Measure-Object | Select-Object -ExpandProperty Count)</h2>
                <p>失败</p>
            </div>
            <div class="summary-card info">
                <h2>$([math]::Round(($Results | Measure-Object -Property Duration -Sum).Sum, 2))</h2>
                <p>总耗时 (秒)</p>
            </div>
        </div>
        
        <h2>测试详情</h2>
        <table>
            <thead>
                <tr>
                    <th>项目</th>
                    <th>类型</th>
                    <th>状态</th>
                    <th>耗时 (秒)</th>
                    <th>重试次数</th>
                    <th>时间</th>
                </tr>
            </thead>
            <tbody>
"@

    foreach ($result in $Results) {
        $status = if ($result.Success) { '<span class="status-success">✅ 通过</span>' } else { '<span class="status-failure">❌ 失败</span>' }
        $html += @"
                <tr>
                    <td>$($result.Project)</td>
                    <td>$($result.Type)</td>
                    <td>$status</td>
                    <td>$($result.Duration)</td>
                    <td>$($result.RetryCount)</td>
                    <td>$($result.Timestamp.ToString('yyyy-MM-dd HH:mm:ss'))</td>
                </tr>
"@
    }

    $html += @"
            </tbody>
        </table>
        
        <h2>失败详情</h2>
"@

    $failedResults = $Results | Where-Object { -not $_.Success }
    if ($failedResults.Count -eq 0) {
        $html += "<p>✅ 所有测试均通过！</p>"
    } else {
        foreach ($result in $failedResults) {
            $html += @"
            <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #dc3545; background: #f8f9fa;">
                <h3>$($result.Project) - $($result.Type)</h3>
                <div class="output">$($result.Output -replace '<', '&lt;' -replace '>', '&gt;')</div>
            </div>
"@
        }
    }

    $html += @"
    </div>
</body>
</html>
"@

    $html | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Success "`n测试报告已生成: $reportPath"
    return $reportPath
}

# 主逻辑
Write-Info "========================================="
Write-Info "前端测试自动化"
Write-Info "========================================="
Write-Info "测试类型: $Type"
Write-Info "应用: $App"
Write-Info "并行运行: $Parallel"
Write-Info "重试次数: $Retry"
Write-Info "=========================================`n"

# 确定要运行的测试类型
$testTypes = @()
switch ($Type) {
    "unit" { $testTypes = @("unit") }
    "e2e" { $testTypes = @("e2e") }
    "coverage" { $testTypes = @("coverage") }
    "all" { $testTypes = @("unit", "coverage", "e2e") }
}

# 确定要运行的应用
$apps = @()
switch ($App) {
    "front" { $apps = @("front") }
    "admin" { $apps = @("admin") }
    "both" { $apps = @("front", "admin") }
}

# 运行测试
$jobs = @()

foreach ($testType in $testTypes) {
    foreach ($appName in $apps) {
        $path = $Projects[$appName]
        
        if ($Parallel) {
            # 并行运行
            $job = Start-Job -ScriptBlock {
                param($Path, $AppName, $TestType, $MaxRetries)
                . $using:function:Run-Test
                return Run-Test -Path $Path -ProjectName $AppName -TestType $TestType -MaxRetries $MaxRetries
            } -ArgumentList $path, $appName, $testType, $Retry
            $jobs += $job
        } else {
            # 串行运行
            $result = Run-Test -Path $path -ProjectName $appName -TestType $testType -MaxRetries $Retry
            $Global:TestResults += $result
        }
    }
}

# 等待并行任务完成
if ($Parallel -and $jobs.Count -gt 0) {
    Write-Info "`n等待 $($jobs.Count) 个并行任务完成..."
    $jobs | Wait-Job | Out-Null
    foreach ($job in $jobs) {
        $result = Receive-Job -Job $job
        $Global:TestResults += $result
        Remove-Job -Job $job
    }
}

# 生成报告
if ($GenerateReport) {
    $reportPath = Generate-TestReport -Results $Global:TestResults
}

# 输出总结
Write-Info "`n========================================="
Write-Info "测试总结"
Write-Info "========================================="

$allPassed = $true
foreach ($result in $Global:TestResults) {
    if ($result.Success) {
        Write-Success "✓ $($result.Project) - $($result.Type) : 通过 (耗时: $($result.Duration)s)"
    } else {
        Write-Error "✗ $($result.Project) - $($result.Type) : 失败 (耗时: $($result.Duration)s, 重试: $($result.RetryCount))"
        $allPassed = $false
    }
}

Write-Info "=========================================`n"

if ($allPassed) {
    Write-Success "所有测试通过！"
    exit 0
} else {
    Write-Error "部分测试失败，请检查上面的输出"
    exit 1
}

