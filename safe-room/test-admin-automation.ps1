# Admin 前端自动化测试脚本
# 专门用于运行 admin 项目的所有测试并生成详细报告

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("unit", "integration", "e2e", "coverage", "all")]
    [string]$Type = "all",

    [Parameter(Mandatory=$false)]
    [switch]$Watch,

    [Parameter(Mandatory=$false)]
    [switch]$UI,

    [Parameter(Mandatory=$false)]
    [switch]$Debug,

    [Parameter(Mandatory=$false)]
    [switch]$Report,

    [Parameter(Mandatory=$false)]
    [switch]$Verbose,

    [Parameter(Mandatory=$false)]
    [string]$OutputFormat = "console"
)

$ErrorActionPreference = "Continue"  # 改为 Continue 以便更好地处理错误

# 测试统计信息
$global:TestStats = @{
    TotalTests = 0
    PassedTests = 0
    FailedTests = 0
    SkippedTests = 0
    StartTime = Get-Date
    EndTime = $null
    Duration = $null
}

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
function Write-Verbose { if ($Verbose) { Write-ColorOutput Magenta $args } }

# Admin 项目路径
$AdminPath = "springboot1ngh61a2\src\main\resources\admin\admin"
$ReportDir = "test-reports\admin"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# 测试结果类
class TestResult {
    [string]$TestType
    [bool]$Success
    [string]$Output
    [string]$ErrorMessage
    [TimeSpan]$Duration
    [int]$TestCount
    [int]$PassedCount
    [int]$FailedCount

    TestResult([string]$type) {
        $this.TestType = $type
        $this.Success = $false
        $this.Output = ""
        $this.ErrorMessage = ""
        $this.Duration = [TimeSpan]::Zero
        $this.TestCount = 0
        $this.PassedCount = 0
        $this.FailedCount = 0
    }
}

# 工具函数
function Test-CommandExists {
    param([string]$command)
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Get-TestCommand {
    param([string]$testType, [bool]$watch, [bool]$ui, [bool]$debug)

    switch ($testType) {
        "unit" {
            if ($watch) { return "npm run test:unit:watch" }
            elseif ($ui) { return "npm run test:unit:ui" }
            else { return "npm run test:unit" }
        }
        "integration" {
            if ($watch) { return "npm run test:integration" } # integration 通常不支持 watch
            elseif ($ui) { return "npm run test:integration" }
            else { return "npm run test:integration" }
        }
        "e2e" {
            if ($ui) { return "npm run test:e2e:ui" }
            elseif ($debug) { return "npm run test:e2e:debug" }
            else { return "npm run test:e2e" }
        }
        "coverage" {
            return "npm run test:coverage"
        }
    }
    return $null
}

function Invoke-TestCommand {
    param([string]$command, [string]$logFile, [bool]$captureOutput = $false)

    Write-Verbose "执行命令: $command"

    try {
        if ($captureOutput -and $logFile) {
            $output = Invoke-Expression "$command 2>&1" | Tee-Object -FilePath $logFile
            return @{ Success = ($LASTEXITCODE -eq 0); Output = $output; ExitCode = $LASTEXITCODE }
        } else {
            Invoke-Expression $command
            return @{ Success = ($LASTEXITCODE -eq 0); Output = ""; ExitCode = $LASTEXITCODE }
        }
    } catch {
        Write-Verbose "命令执行异常: $_"
        return @{ Success = $false; Output = $_.Exception.Message; ExitCode = 1 }
    }
}

function Write-TestHeader {
    param([string]$title)

    Write-Info "╔══════════════════════════════════════╗"
    Write-Info "║ $title"
    Write-Info "╚══════════════════════════════════════╝"
}

function Write-TestSummary {
    param([hashtable]$stats)

    Write-Info "`n📊 测试统计摘要:"
    Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Info ("总测试数: " + $stats.TotalTests)
    Write-Info ("✅ 通过: " + $stats.PassedTests)
    Write-Info ("❌ 失败: " + $stats.FailedTests)
    Write-Info ("⏭️  跳过: " + $stats.SkippedTests)

    if ($stats.Duration) {
        Write-Info ("⏱️  耗时: " + $stats.Duration.ToString("mm\:ss\.fff"))
    }

    $passRate = if ($stats.TotalTests -gt 0) {
        [math]::Round(($stats.PassedTests / $stats.TotalTests) * 100, 1)
    } else { 0 }
    Write-Info ("📈 通过率: $passRate%")
}

# 主逻辑开始
Write-TestHeader "Admin 前端自动化测试"

# 参数验证
if (-not (Test-Path $AdminPath)) {
    Write-Error "❌ 错误: 找不到 admin 项目路径: $AdminPath"
    Write-Error "请确保项目结构正确，或修改脚本中的路径配置"
    exit 1
}

# 检查必要的命令
$requiredCommands = @("node", "npm", "npx")
foreach ($cmd in $requiredCommands) {
    if (-not (Test-CommandExists $cmd)) {
        Write-Error "❌ 错误: 找不到必需的命令 '$cmd'"
        Write-Error "请确保 Node.js 和 npm 已正确安装"
        exit 1
    }
}

# 创建报告目录
if (-not (Test-Path $ReportDir)) {
    try {
        New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null
        Write-Verbose "创建报告目录: $ReportDir"
    } catch {
        Write-Warning "⚠️  警告: 无法创建报告目录: $_"
    }
}

# 输出配置信息
Write-Info "📁 项目路径: $AdminPath"
Write-Info "📂 报告目录: $ReportDir"
Write-Info "🏷️  测试类型: $Type"
if ($Watch) { Write-Info "👀 模式: Watch" }
if ($UI) { Write-Info "🖥️  模式: UI" }
if ($Debug) { Write-Info "🐛 模式: Debug" }
if ($Verbose) { Write-Info "📝 模式: Verbose" }
Write-Info ""

Push-Location $AdminPath

try {
    # 检查依赖
    Write-Verbose "检查项目依赖..."
    if (-not (Test-Path "node_modules")) {
        Write-Warning "⚠️  未找到 node_modules，正在安装依赖..."
        $installResult = Invoke-TestCommand "npm install" $null $false
        if (-not $installResult.Success) {
            Write-Error "❌ 依赖安装失败"
            Write-Error "请检查网络连接或 package.json 配置"
            exit 1
        }
        Write-Success "✅ 依赖安装完成"
    } else {
        Write-Verbose "✅ 依赖已存在"
    }

    # 检查 Playwright 浏览器（E2E 测试需要）
    if (($Type -eq "e2e" -or $Type -eq "all") -and -not $Watch) {
        Write-Verbose "检查 Playwright 浏览器..."
        $playwrightCache = "node_modules\.cache\playwright"
        if (-not (Test-Path $playwrightCache)) {
            Write-Warning "⚠️  Playwright 浏览器未安装，正在安装..."
            $installResult = Invoke-TestCommand "npx playwright install --with-deps" $null $false
            if ($installResult.Success) {
                Write-Success "✅ Playwright 浏览器安装完成"
            } else {
                Write-Warning "⚠️  Playwright 浏览器安装失败，E2E 测试可能无法运行"
            }
        } else {
            Write-Verbose "✅ Playwright 浏览器已安装"
        }
    }

    # 初始化测试结果
    $testResults = @{}
    $testTypes = @()

    # 确定要运行的测试类型
    switch ($Type) {
        "unit" { $testTypes = @("unit") }
        "integration" { $testTypes = @("integration") }
        "e2e" { $testTypes = @("e2e") }
        "coverage" { $testTypes = @("coverage") }
        "all" { $testTypes = @("unit", "integration", "e2e") }
    }

    # 运行测试
    foreach ($testType in $testTypes) {
        Write-TestHeader "运行 $testType 测试"

        $result = [TestResult]::new($testType)
        $startTime = Get-Date
        $logFile = "$ReportDir\$testType-$Timestamp.log"

        try {
            $command = Get-TestCommand $testType $Watch $UI $Debug

            if (-not $command) {
                Write-Warning "⚠️  跳过 $testType 测试：不支持的测试类型或模式组合"
                $result.Success = $true
                $result.ErrorMessage = "Skipped: Unsupported test type/mode combination"
                $global:TestStats.SkippedTests++
                continue
            }

            # Watch 模式特殊处理
            if ($Watch -and $testType -eq "unit") {
                Write-Info "👀 启动 Watch 模式（按 Ctrl+C 退出）..."
                Write-Verbose "执行命令: $command"
                & npm run test:unit:watch
                exit $LASTEXITCODE
            }

            Write-Info "🚀 执行命令: $command"

            # 运行测试
            $testResult = Invoke-TestCommand $command $logFile $Report
            $result.Success = $testResult.Success
            $result.Output = $testResult.Output
            $result.ErrorMessage = if (-not $testResult.Success) { $testResult.Output } else { "" }

            # 解析测试输出中的统计信息（简化版本）
            if ($testResult.Output -match 'Tests?\s*:\s*(\d+)') {
                $result.TestCount = [int]$matches[1]
            }
            if ($testResult.Output -match 'Passed?\s*:\s*(\d+)') {
                $result.PassedCount = [int]$matches[1]
            }
            if ($testResult.Output -match 'Failed?\s*:\s*(\d+)') {
                $result.FailedCount = [int]$matches[1]
            }

            # 更新全局统计
            $global:TestStats.TotalTests += $result.TestCount
            $global:TestStats.PassedTests += $result.PassedCount
            $global:TestStats.FailedTests += $result.FailedCount

        } catch {
            $result.Success = $false
            $result.ErrorMessage = $_.Exception.Message
            Write-Verbose "测试执行异常: $_"
        } finally {
            $result.Duration = (Get-Date) - $startTime
        }

        # 显示结果
        if ($result.Success) {
            Write-Success "✅ $testType 测试通过"
            if ($result.TestCount -gt 0) {
                Write-Info "   📊 测试数: $($result.TestCount), 通过: $($result.PassedCount), 失败: $($result.FailedCount)"
            }
            Write-Info "   ⏱️  耗时: $($result.Duration.ToString('mm\:ss\.fff'))"
        } else {
            Write-Error "❌ $testType 测试失败"
            if ($result.ErrorMessage) {
                Write-Error "   错误: $($result.ErrorMessage)"
            }
            if ($Report -and (Test-Path $logFile)) {
                Write-Warning "   📄 详细日志: $logFile"
            }
        }

        $testResults[$testType] = $result
    }

    # 计算最终统计
    $global:TestStats.EndTime = Get-Date
    $global:TestStats.Duration = $global:TestStats.EndTime - $global:TestStats.StartTime

    # 生成测试报告
    if ($Report) {
        Write-TestHeader "生成测试报告"

        $reportFile = "$ReportDir\test-report-$Timestamp.md"

        # 生成 Markdown 报告
        $reportContent = @"
# Admin 前端自动化测试报告

**生成时间**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**测试类型**: $Type
**总耗时**: $($global:TestStats.Duration.ToString("hh\:mm\:ss\.fff"))

## 📊 测试统计摘要

| 指标 | 数量 |
|------|------|
| 总测试数 | $($global:TestStats.TotalTests) |
| ✅ 通过 | $($global:TestStats.PassedTests) |
| ❌ 失败 | $($global:TestStats.FailedTests) |
| ⏭️ 跳过 | $($global:TestStats.SkippedTests) |
| 📈 通过率 | $(if ($global:TestStats.TotalTests -gt 0) { [math]::Round(($global:TestStats.PassedTests / $global:TestStats.TotalTests) * 100, 1) } else { 0 })% |

## 🧪 测试结果详情

"@

        foreach ($testType in $testTypes) {
            $result = $testResults[$testType]
            $status = if ($result.Success) { "✅ 通过" } else { "❌ 失败" }
            $reportContent += @"

### $testType 测试 - $status

- **状态**: $($result.Success ? "成功" : "失败")
- **耗时**: $($result.Duration.ToString("mm\:ss\.fff"))
- **测试数**: $($result.TestCount)
- **通过**: $($result.PassedCount)
- **失败**: $($result.FailedCount)

"@
            if (-not $result.Success -and $result.ErrorMessage) {
                $reportContent += @"
**错误信息**:
```
$($result.ErrorMessage)
```

"@
            }
        }

        $reportContent += @"

## 📋 详细日志

"@

        foreach ($testType in $testTypes) {
            $logFile = "$ReportDir\$testType-$Timestamp.log"
            if (Test-Path $logFile) {
                $result = $testResults[$testType]
                $status = if ($result.Success) { "✅" } else { "❌" }
                $reportContent += @"

### $status $testType 测试日志

**日志文件**: $logFile

``````
$(Get-Content $logFile -Raw)
``````
"@
            }
        }

        # 生成 JSON 报告（可选）
        if ($OutputFormat -eq "json" -or $OutputFormat -eq "all") {
            $jsonReport = @{
                timestamp = $Timestamp
                testType = $Type
                statistics = $global:TestStats
                results = @{}
                system = @{
                    nodeVersion = $(try { & node --version } catch { "unknown" })
                    npmVersion = $(try { & npm --version } catch { "unknown" })
                    powershellVersion = $PSVersionTable.PSVersion.ToString()
                }
            }

            foreach ($testType in $testTypes) {
                $result = $testResults[$testType]
                $jsonReport.results[$testType] = @{
                    success = $result.Success
                    duration = $result.Duration.TotalMilliseconds
                    testCount = $result.TestCount
                    passedCount = $result.PassedCount
                    failedCount = $result.FailedCount
                    errorMessage = $result.ErrorMessage
                    logFile = "$ReportDir\$testType-$Timestamp.log"
                }
            }

            $jsonFile = "$ReportDir\test-report-$Timestamp.json"
            $jsonReport | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonFile -Encoding UTF8
            Write-Verbose "JSON 报告已生成: $jsonFile"
        }

        $reportContent | Out-File -FilePath $reportFile -Encoding UTF8
        Write-Success "✅ Markdown 报告已生成: $reportFile"
    }

    # 显示最终总结
    Write-TestHeader "测试执行总结"

    $allPassed = $true
    foreach ($testType in $testTypes) {
        $result = $testResults[$testType]
        if ($result.Success) {
            Write-Success "✅ $testType : 通过 ($($result.Duration.ToString('mm\:ss\.fff')))"
        } else {
            Write-Error "❌ $testType : 失败 ($($result.Duration.ToString('mm\:ss\.fff')))"
            $allPassed = $false
        }
    }

    Write-TestSummary $global:TestStats

    Write-Info "`n════════════════════════════════════════`n"

    if ($allPassed) {
        Write-Success "🎉 所有测试通过！"
        exit 0
    } else {
        Write-Error "💥 部分测试失败，请检查上面的输出和日志文件"
        if ($Report) {
            Write-Info "📄 详细报告: $ReportDir\test-report-$Timestamp.md"
        }
        exit 1
    }
}
catch {
    Write-Error "💥 运行测试时发生严重错误: $_"
    Write-Error "🔍 错误详情: $($_.Exception.Message)"
    Write-Error "📍 错误位置: $($_.InvocationInfo.ScriptName):$($_.InvocationInfo.ScriptLineNumber)"

    # 记录错误到日志
    if ($Report) {
        $errorLog = "$ReportDir\error-$Timestamp.log"
        $errorInfo = @"
Error occurred at $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Exception: $($_.Exception.Message)
StackTrace: $($_.Exception.StackTrace)
Script: $($_.InvocationInfo.ScriptName)
Line: $($_.InvocationInfo.ScriptLineNumber)

System Info:
- PowerShell: $($PSVersionTable.PSVersion)
- Node: $(try { & node --version } catch { "unknown" })
- NPM: $(try { & npm --version } catch { "unknown" })
- Working Directory: $(Get-Location)
- Admin Path: $AdminPath
- Report Dir: $ReportDir
"@
        $errorInfo | Out-File -FilePath $errorLog -Encoding UTF8
        Write-Warning "📄 错误日志已保存: $errorLog"
    }

    exit 1
}
finally {
    Pop-Location
}

