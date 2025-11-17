# frontend-test-automation.ps1
<#
.SYNOPSIS
    Frontend Test Automation Script - Supports parallel execution, failure retry and report aggregation

.DESCRIPTION
    This script provides complete frontend test automation functionality, including:
    - Parallel execution of multiple project tests
    - Failure retry mechanism
    - Test report aggregation
    - Coverage analysis

.PARAMETER Type
    Test type (unit, e2e, coverage, all)

.PARAMETER App
    Application to test (front, admin, both)

.PARAMETER Parallel
    Whether to run tests in parallel

.PARAMETER Retry
    Number of failure retries (default: 2)

.PARAMETER GenerateReport
    Whether to generate aggregated report

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

# 跨平台命令执行函数 - 增强PowerShell兼容性
function Invoke-CrossPlatformCommand {
    param(
        [string]$Command,
        [string]$WorkingDirectory = $null,
        [switch]$UseShellExecute
    )

    try {
        # PowerShell兼容性检查
        $isPSCore = $PSVersionTable.PSVersion.Major -ge 6
        $isWindows = $Global:PlatformInfo.IsWindows

        if ($UseShellExecute -or ($isWindows -and -not $isPSCore)) {
            # Windows PowerShell 或明确要求使用shell执行
            $startInfo = New-Object System.Diagnostics.ProcessStartInfo
            $startInfo.FileName = if ($isWindows) { "cmd.exe" } else { "/bin/bash" }
            $startInfo.Arguments = if ($isWindows) { "/c `"$Command`"" } else { "-c `"$Command`"" }
            $startInfo.UseShellExecute = $false
            $startInfo.RedirectStandardOutput = $true
            $startInfo.RedirectStandardError = $true
            $startInfo.CreateNoWindow = $true
        } else {
            # PowerShell Core 或跨平台场景
            # 解析命令和参数，避免&&解析问题
            $commandParts = $Command -split '(?<!\\)&&'  # 负向预查，避免转义的&&
            if ($commandParts.Length -gt 1) {
                # 多命令链，递归执行
                $results = @()
                foreach ($cmd in $commandParts) {
                    $cmd = $cmd.Trim()
                    if ($cmd) {
                        $result = Invoke-CrossPlatformCommand -Command $cmd.Trim() -WorkingDirectory $WorkingDirectory
                        $results += $result
                        # 检查退出码，如果失败则停止执行
                        if ($LASTEXITCODE -ne 0) {
                            $global:LASTEXITCODE = $LASTEXITCODE
                            return ($results -join "`n")
                        }
                    }
                }
                return ($results -join "`n")
            }

            # 单命令执行
            $commandParts = $Command -split ' '
            $executable = $commandParts[0]
            $arguments = if ($commandParts.Length -gt 1) { $commandParts[1..($commandParts.Length-1)] -join ' ' } else { '' }

            $startInfo = New-Object System.Diagnostics.ProcessStartInfo
            $startInfo.FileName = $executable
            $startInfo.Arguments = $arguments
            $startInfo.UseShellExecute = $false
            $startInfo.RedirectStandardOutput = $true
            $startInfo.RedirectStandardError = $true
            $startInfo.CreateNoWindow = $true
        }

        if ($WorkingDirectory) {
            $startInfo.WorkingDirectory = $WorkingDirectory
        }

        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $startInfo

        # 捕获输出
        $outputBuilder = New-Object System.Text.StringBuilder
        $errorBuilder = New-Object System.Text.StringBuilder

        $process.OutputDataReceived += {
            param($sender, $e)
            if ($e.Data) {
                $outputBuilder.AppendLine($e.Data)
            }
        }

        $process.ErrorDataReceived += {
            param($sender, $e)
            if ($e.Data) {
                $errorBuilder.AppendLine($e.Data)
            }
        }

        $process.Start()
        $process.BeginOutputReadLine()
        $process.BeginErrorReadLine()
        $process.WaitForExit()

        $output = $outputBuilder.ToString()
        $errorOutput = $errorBuilder.ToString()

        # 设置全局退出码
        $global:LASTEXITCODE = $process.ExitCode

        # 返回组合输出
        if ($errorOutput) {
            return $output + "`n" + $errorOutput
        } else {
            return $output
        }
    }
    catch {
        Write-Error "Command execution failed: $_"
        $global:LASTEXITCODE = 1
        return $_.Exception.Message
    }
}

# 跨平台兼容性检查
function Test-PowerShellCompatibility {
    $psVersion = $PSVersionTable.PSVersion
    $minVersion = [version]"5.1"

    if ($psVersion -lt $minVersion) {
        Write-Error "This script requires PowerShell $minVersion or higher. Current version: $psVersion"
        exit 1
    }

    # 检查是否为 PowerShell Core (跨平台版本)
    $isCore = $PSVersionTable.PSEdition -eq "Core"
    if (-not $isCore -and $psVersion.Major -lt 6) {
        Write-Warning "PowerShell Core 7+ is recommended for better cross-platform compatibility"
    }

    Write-Info "PowerShell version: $psVersion ($($PSVersionTable.PSEdition))"
}

# 平台检测（兼容PowerShell 5.1和Core）
function Get-PlatformInfo {
    $osInfo = @{
        IsWindows = $false
        IsLinux = $false
        IsMacOS = $false
        PathSeparator = [System.IO.Path]::DirectorySeparatorChar
        AltPathSeparator = [System.IO.Path]::AltDirectorySeparatorChar
    }

    # 兼容PowerShell 5.1和PowerShell Core的方法
    $isPSCore = $PSVersionTable.PSVersion.Major -ge 6
    if ($isPSCore) {
        # PowerShell Core 6+
        if ($IsWindows) {
            $osInfo.IsWindows = $true
        } elseif ($IsLinux) {
            $osInfo.IsLinux = $true
        } elseif ($IsMacOS) {
            $osInfo.IsMacOS = $true
        }
    } else {
        # Windows PowerShell 5.1
        try {
            $osName = [System.Environment]::OSVersion.Platform.ToString()
            if ($osName -match "Win32NT|Win32S|Win32Windows|WinCE") {
                $osInfo.IsWindows = $true
            } elseif ($osName -match "Unix") {
                # 在Windows PowerShell中，进一步检查
                if ($env:OSTYPE -match "linux") {
                    $osInfo.IsLinux = $true
                } elseif ($env:OSTYPE -match "darwin") {
                    $osInfo.IsMacOS = $true
                } else {
                    # 无法确定，假设为Linux
                    $osInfo.IsLinux = $true
                }
            }
        } catch {
            # 如果检测失败，默认假设为Windows
            $osInfo.IsWindows = $true
        }
    }

    return $osInfo
}

# Cross-platform path normalization
function Resolve-CrossPlatformPath {
    param([string]$Path)

    # Use system path separator
    $pathSeparator = [System.IO.Path]::DirectorySeparatorChar

    # Replace all path separators with system separator
    $normalizedPath = $Path.Replace([System.IO.Path]::AltDirectorySeparatorChar, $pathSeparator)

    # Handle relative paths
    if (-not [System.IO.Path]::IsPathRooted($normalizedPath)) {
        $normalizedPath = Join-Path (Get-Location) $normalizedPath
    }

    # Resolve to absolute path
    try {
        return [System.IO.Path]::GetFullPath($normalizedPath)
    } catch {
        # If resolution fails, return original path
        return $normalizedPath
    }
}

# Execute compatibility check
Test-PowerShellCompatibility
$Global:PlatformInfo = Get-PlatformInfo

# Import unified environment check function library
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$envLibPath = Join-Path $scriptRoot "scripts\common\Test-Environment.ps1"
if (Test-Path $envLibPath) {
    . $envLibPath
} else {
    Write-Error "Error: Environment check function library not found: $envLibPath"
    exit 1
}

# Color output functions
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

# 项目路径解析函数
function Get-ProjectPath {
    param([string]$ProjectName)

    $scriptRoot = $PSScriptRoot
    if (-not $scriptRoot) {
        # 如果在交互式会话中运行，使用当前工作目录
        $scriptRoot = Get-Location
    }

    # 使用跨平台路径分隔符
    $relativePaths = @{
        front = "springboot1ngh61a2" + [System.IO.Path]::DirectorySeparatorChar +
                "src" + [System.IO.Path]::DirectorySeparatorChar +
                "main" + [System.IO.Path]::DirectorySeparatorChar +
                "resources" + [System.IO.Path]::DirectorySeparatorChar +
                "front" + [System.IO.Path]::DirectorySeparatorChar + "front"
        admin = "springboot1ngh61a2" + [System.IO.Path]::DirectorySeparatorChar +
                "src" + [System.IO.Path]::DirectorySeparatorChar +
                "main" + [System.IO.Path]::DirectorySeparatorChar +
                "resources" + [System.IO.Path]::DirectorySeparatorChar +
                "admin" + [System.IO.Path]::DirectorySeparatorChar + "admin"
    }

    $relativePath = $relativePaths[$ProjectName]
    if (-not $relativePath) {
        throw "不支持的项目类型: $ProjectName"
    }

    # 构建完整路径
    $fullPath = Join-Path $scriptRoot $relativePath

    # 使用跨平台路径解析
    $normalizedPath = Resolve-CrossPlatformPath -Path $fullPath

    # 验证路径是否存在
    if (-not (Test-Path $normalizedPath)) {
        throw "项目路径不存在: $normalizedPath (项目: $ProjectName)"
    }

    # 返回规范化的绝对路径
    try {
        return (Resolve-Path $normalizedPath).Path
    } catch {
        throw "无法解析项目路径: $normalizedPath (项目: $ProjectName)"
    }
}

# 项目路径（向后兼容）
$Projects = @{
    front = Get-ProjectPath "front"
    admin = Get-ProjectPath "admin"
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
    [array]$RetryHistory
}

# 重试历史记录类
class RetryRecord {
    [int]$Attempt
    [datetime]$Timestamp
    [string]$FailureType
    [string]$FailureReason
    [int]$DelaySeconds
}

# 智能重试函数
function Invoke-WithSmartRetry {
    param(
        [scriptblock]$ScriptBlock,
        [int]$MaxRetries = 3,
        [int]$BaseDelaySeconds = 1,
        [int]$MaxDelaySeconds = 60,
        [string]$OperationName = "操作"
    )

    $retryHistory = @()
    $attempt = 0
    $lastException = $null

    while ($attempt -le $MaxRetries) {
        try {
            $attemptStartTime = Get-Date

            if ($attempt -gt 0) {
                # 计算指数退避延迟
                $delaySeconds = [Math]::Min($BaseDelaySeconds * [Math]::Pow(2, $attempt - 1), $MaxDelaySeconds)
                $delaySeconds += Get-Random -Minimum 0 -Maximum ($delaySeconds * 0.1)  # 添加随机抖动

                Write-Info "$OperationName 第 $attempt 次重试，等待 ${delaySeconds} 秒..."
                Start-Sleep -Seconds $delaySeconds

                # 记录重试信息
                $retryRecord = [RetryRecord]::new()
                $retryRecord.Attempt = $attempt
                $retryRecord.Timestamp = Get-Date
                $retryRecord.DelaySeconds = $delaySeconds
                $retryHistory += $retryRecord
            }

            # 执行脚本块
            $result = & $ScriptBlock

            # 如果执行成功，返回结果
            return @{
                Success = $true
                Result = $result
                RetryCount = $attempt
                RetryHistory = $retryHistory
                Duration = [math]::Round(((Get-Date) - $attemptStartTime).TotalSeconds, 2)
            }

        } catch {
            $lastException = $_
            $attempt++

            # 分析失败类型
            $failureType = Get-FailureType -Exception $lastException -Output $_.Exception.Message
            $isRetryable = Test-IsRetryableFailure -FailureType $failureType

            # 记录失败信息
            if ($retryHistory.Count -gt 0) {
                $retryHistory[-1].FailureType = $failureType
                $retryHistory[-1].FailureReason = $_.Exception.Message
            }

            if (-not $isRetryable) {
                Write-Warning "$OperationName 遇到不可重试的失败: $failureType"
                break
            }

            if ($attempt -le $MaxRetries) {
                Write-Warning "$OperationName 失败 ($failureType)，准备重试 ($attempt/$MaxRetries)..."
            } else {
                Write-Error "$OperationName 失败，已达到最大重试次数 ($MaxRetries)"
            }
        }
    }

    # 所有重试都失败了
    return @{
        Success = $false
        Result = $null
        RetryCount = $attempt - 1
        RetryHistory = $retryHistory
        Duration = 0
        LastException = $lastException
    }
}

# 分析失败类型
function Get-FailureType {
    param([Exception]$Exception, [string]$Output)

    $message = "$($Exception.Message) $Output".ToLower()

    if ($message -match "network|connection|timeout|dns|unreachable") {
        return "NetworkError"
    }
    elseif ($message -match "permission|access|denied|forbidden") {
        return "PermissionError"
    }
    elseif ($message -match "disk|space|full|quota") {
        return "DiskError"
    }
    elseif ($message -match "memory|outofmemory") {
        return "MemoryError"
    }
    elseif ($message -match "syntax|parse|compile|undefined") {
        return "CodeError"
    }
    elseif ($message -match "dependency|module|package|install") {
        return "DependencyError"
    }
    elseif ($message -match "port|bind|address.*in.*use") {
        return "PortConflictError"
    }
    else {
        return "UnknownError"
    }
}

# 判断失败是否可重试
function Test-IsRetryableFailure {
    param([string]$FailureType)

    $retryableTypes = @(
        "NetworkError",     # 网络问题通常是临时的
        "PortConflictError", # 端口冲突可能是临时的
        "DependencyError"    # 依赖安装问题可能需要重试
    )

    return $FailureType -in $retryableTypes
}

# 清理函数 - 在重试前尝试清理可能的状态
function Clear-TestEnvironment {
    param([string]$Path, [string]$TestType)

    try {
        Push-Location $Path

        # 清理可能的锁文件
        $lockFiles = @("package-lock.json", "yarn.lock", "pnpm-lock.yaml")
        foreach ($lockFile in $lockFiles) {
            if (Test-Path $lockFile) {
                # 不删除锁文件，但可以尝试修复
                Write-Info "检测到锁文件: $lockFile"
            }
        }

        # 清理可能的缓存
        if (Test-Path ".npm") {
            Remove-Item ".npm" -Recurse -Force -ErrorAction SilentlyContinue
        }
        if (Test-Path "node_modules/.cache") {
            Remove-Item "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
        }

        # 对于E2E测试，清理可能的浏览器数据
        if ($TestType -eq "e2e") {
            $browserDataDirs = @(
                "test-results",
                ".playwright-data",
                ".cache/playwright"
            )
            foreach ($dir in $browserDataDirs) {
                if (Test-Path $dir) {
                    Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
                }
            }
        }

        # 清理可能的进程（跨平台兼容）
        try {
            if ($Global:PlatformInfo.IsWindows) {
                # Windows平台
                $nodeProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
                    $_.CommandLine -match $Path.Replace('\', '\\')
                }
                foreach ($process in $nodeProcesses) {
                    try {
                        $process | Stop-Process -Force -ErrorAction SilentlyContinue
                        Write-Info "停止了残留的Node.js进程 (PID: $($process.Id))"
                    } catch {
                        Write-Warning "无法停止进程 PID $($process.Id): $_"
                    }
                }
            } else {
                # Linux/macOS平台
                $escapedPath = $Path.Replace('/', '\/')
                $pids = & pgrep -f "node.*$escapedPath" 2>$null
                if ($pids) {
                    foreach ($pid in $pids) {
                        try {
                            & kill -9 $pid 2>$null
                            Write-Info "停止了残留的Node.js进程 (PID: $pid)"
                        } catch {
                            Write-Warning "无法停止进程 PID $pid: $_"
                        }
                    }
                }
            }
        } catch {
            Write-Warning "清理进程时出错: $_"
        }

    } catch {
        Write-Warning "清理测试环境时出错: $_"
    } finally {
        Pop-Location
    }
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

        # 使用统一的环境检查和依赖安装（启用自动修复）
        if (-not (Install-Dependencies -ProjectPath $Path -ProjectName "$ProjectName project" -AutoRepair -Verbose:$Verbose)) {
            throw "Dependency installation failed"
        }
        
        # 使用智能重试机制执行测试
        $retryResult = Invoke-WithSmartRetry -ScriptBlock {
            # 在重试前清理环境
            Clear-TestEnvironment -Path $Path -TestType $TestType

            # 使用更可靠的命令执行方式，支持跨平台
            $output = Invoke-CrossPlatformCommand -Command $command -WorkingDirectory $Path
            if ($LASTEXITCODE -ne 0) {
                throw "Test execution failed: $output"
            }
            return $output
        } -MaxRetries $MaxRetries -OperationName "$ProjectName - $TestType test"

        # 设置结果
        $result.Success = $retryResult.Success
        $result.RetryCount = $retryResult.RetryCount
        $result.RetryHistory = $retryResult.RetryHistory

        if ($result.Success) {
            $result.Output = $retryResult.Result
            Write-Success "`n✓ $ProjectName - $TestType 测试通过"
        } else {
            $result.Output = $retryResult.LastException.Message
            Write-Error "`n✗ $ProjectName - $TestType 测试失败"

            # 显示重试历史
            if ($result.RetryHistory.Count -gt 0) {
                Write-Info "重试历史:"
                foreach ($retry in $result.RetryHistory) {
                    Write-Info "  第 $($retry.Attempt) 次重试: $($retry.FailureType) - $($retry.FailureReason) (等待 $($retry.DelaySeconds)s)"
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

# 趋势分析类
class TrendAnalysis {
    [string]$MetricName
    [double]$CurrentValue
    [double]$PreviousValue
    [double]$ChangePercent
    [string]$Trend
    [string]$Status

    TrendAnalysis([string]$name, [double]$current, [double]$previous) {
        $this.MetricName = $name
        $this.CurrentValue = $current
        $this.PreviousValue = $previous

        if ($previous -ne 0) {
            $this.ChangePercent = [math]::Round((($current - $previous) / $previous) * 100, 2)
        } else {
            $this.ChangePercent = 0
        }

        $this.Trend = if ($this.ChangePercent -gt 5) { "📈 上升" }
                     elseif ($this.ChangePercent -lt -5) { "📉 下降" }
                     else { "➡️ 稳定" }

        $this.Status = if ($name -like "*失败*" -and $this.ChangePercent -gt 0) { "🔴 恶化" }
                      elseif ($name -like "*失败*" -and $this.ChangePercent -lt 0) { "🟢 改善" }
                      elseif ($name -like "*通过*" -and $this.ChangePercent -gt 0) { "🟢 改善" }
                      elseif ($name -like "*通过*" -and $this.ChangePercent -lt 0) { "🔴 恶化" }
                      else { "🟡 保持" }
    }
}

# 保存历史数据
function Save-TestHistory {
    param([TestResult[]]$Results, [string]$HistoryFile = "frontend-test-history.json")

    $historyData = @{
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
        summary = @{
            total = $Results.Count
            passed = ($Results | Where-Object { $_.Success }).Count
            failed = ($Results | Where-Object { -not $_.Success }).Count
            totalDuration = [math]::Round(($Results | Measure-Object -Property Duration -Sum).Sum, 2)
            averageDuration = if ($Results.Count -gt 0) {
                [math]::Round(($Results | Measure-Object -Property Duration -Average).Average, 2)
            } else { 0 }
        }
        results = $Results | ForEach-Object {
            @{
                project = $_.Project
                type = $_.Type
                success = $_.Success
                duration = $_.Duration
                retryCount = $_.RetryCount
                timestamp = $_.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss")
                retryHistory = $_.RetryHistory | ForEach-Object {
                    @{
                        attempt = $_.Attempt
                        timestamp = $_.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss")
                        failureType = $_.FailureType
                        failureReason = $_.FailureReason
                        delaySeconds = $_.DelaySeconds
                    }
                }
            }
        }
    }

    # 读取现有历史
    $existingHistory = @()
    if (Test-Path $HistoryFile) {
        try {
            $existingHistory = Get-Content $HistoryFile -Raw | ConvertFrom-Json
        } catch {
            Write-Warning "无法读取历史文件，将创建新的历史文件"
            $existingHistory = @()
        }
    }

    # 添加新记录
    $existingHistory += $historyData

    # 保留最近30天的记录
    $cutoffDate = (Get-Date).AddDays(-30)
    $existingHistory = $existingHistory | Where-Object {
        [DateTime]::Parse($_.timestamp) -gt $cutoffDate
    }

    # 保存到文件
    $historyData | ConvertTo-Json -Depth 5 | Set-Content $HistoryFile -Encoding UTF8
    Write-Success "历史数据已保存到 $HistoryFile"
}

# 生成趋势分析
function Generate-TrendAnalysis {
    param([string]$HistoryFile = "frontend-test-history.json")

    if (-not (Test-Path $HistoryFile)) {
        Write-Warning "历史文件不存在，无法生成趋势分析"
        return $null
    }

    try {
        $history = Get-Content $HistoryFile -Raw | ConvertFrom-Json
        if ($history.Count -lt 2) {
            Write-Warning "历史数据不足，无法生成趋势分析"
            return $null
        }

        # 获取最近两次运行
        $recentRuns = $history | Sort-Object { [DateTime]::Parse($_.timestamp) } -Descending | Select-Object -First 2
        $current = $recentRuns[0]
        $previous = $recentRuns[1]

        $trends = @(
            [TrendAnalysis]::new("通过率", ($current.summary.passed / $current.summary.total * 100),
                                 ($previous.summary.passed / $previous.summary.total * 100)),
            [TrendAnalysis]::new("失败数", $current.summary.failed, $previous.summary.failed),
            [TrendAnalysis]::new("平均耗时", $current.summary.averageDuration, $previous.summary.averageDuration),
            [TrendAnalysis]::new("总耗时", $current.summary.totalDuration, $previous.summary.totalDuration)
        )

        return $trends
    } catch {
        Write-Error "生成趋势分析时出错: $_"
        return $null
    }
}

# 生成增强的测试报告
function Generate-TestReport {
    param([TestResult[]]$Results, [string]$HistoryFile = "frontend-test-history.json")

    $reportPath = "frontend-test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"

    # 计算统计信息
    $stats = @{
        Total = $Results.Count
        Passed = ($Results | Where-Object { $_.Success }).Count
        Failed = ($Results | Where-Object { -not $_.Success }).Count
        TotalDuration = [math]::Round(($Results | Measure-Object -Property Duration -Sum).Sum, 2)
        AverageDuration = if ($Results.Count -gt 0) {
            [math]::Round(($Results | Measure-Object -Property Duration -Average).Average, 2)
        } else { 0 }
        PassRate = if ($Results.Count -gt 0) {
            [math]::Round((($Results | Where-Object { $_.Success }).Count / $Results.Count) * 100, 2)
        } else { 0 }
        SlowTests = $Results | Where-Object { $_.Duration -gt 30 } | Sort-Object Duration -Descending
        FailedTests = $Results | Where-Object { -not $_.Success }
    }

    $html = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>前端测试报告</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 4px solid #4CAF50; padding-bottom: 15px; margin-bottom: 30px; font-size: 2.2em; }
        .header-info { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .summary-card { padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.07); transition: transform 0.3s ease; }
        .summary-card:hover { transform: translateY(-5px); }
        .success { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; }
        .failure { background: linear-gradient(135deg, #f44336, #d32f2f); color: white; }
        .warning { background: linear-gradient(135deg, #ff9800, #f57c00); color: white; }
        .info { background: linear-gradient(135deg, #2196F3, #1976D2); color: white; }
        .summary-card h2 { font-size: 2.5em; margin: 0; font-weight: 300; }
        .summary-card p { margin: 10px 0 0 0; font-size: 1.1em; opacity: 0.9; }
        .charts-container { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
        .chart { background: #f8f9fa; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .chart h3 { color: #333; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        th, td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #4CAF50; color: white; font-weight: 600; }
        tr:hover { background: #f5f5f5; }
        .status-success { color: #28a745; font-weight: bold; }
        .status-failure { color: #dc3545; font-weight: bold; }
        .status-warning { color: #ffc107; font-weight: bold; }
        .output { background: #f8f9fa; padding: 15px; border-radius: 6px; font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; max-height: 300px; overflow-y: auto; white-space: pre-wrap; border: 1px solid #dee2e6; }
        .performance-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .performance-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; }
        .tabs { display: flex; margin: 30px 0 20px 0; border-bottom: 2px solid #dee2e6; }
        .tab { padding: 10px 20px; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.3s ease; }
        .tab.active { border-bottom-color: #4CAF50; color: #4CAF50; font-weight: bold; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .retry-info { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 10px; margin: 10px 0; }
        .environment-info { background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 6px; padding: 15px; margin: 20px 0; }
    </style>
    <script>
        function switchTab(tabName) {
            // Hide all tab contents
            const contents = document.querySelectorAll('.tab-content');
            contents.forEach(content => content.classList.remove('active'));

            // Remove active class from all tabs
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => tab.classList.remove('active'));

            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }
    </script>
</head>
<body>
    <div class="container">
        <h1>🧪 前端测试自动化报告</h1>

        <div class="header-info">
            <div>
                <strong>生成时间:</strong> $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')<br>
                <strong>测试环境:</strong> $(if ($Global:PlatformInfo.IsWindows) { "Windows" } elseif ($Global:PlatformInfo.IsLinux) { "Linux" } else { "macOS" })
            </div>
            <div>
                <strong>通过率:</strong> $($stats.PassRate)%<br>
                <strong>平均耗时:</strong> $($stats.AverageDuration)s/测试
            </div>
        </div>

        <div class="summary">
            <div class="summary-card $(if ($stats.Failed -eq 0) { 'success' } elseif ($stats.Failed -lt 3) { 'warning' } else { 'failure' })">
                <h2>$($stats.Total)</h2>
                <p>总测试数</p>
            </div>
            <div class="summary-card success">
                <h2>$($stats.Passed)</h2>
                <p>通过测试</p>
            </div>
            <div class="summary-card $(if ($stats.Failed -eq 0) { 'success' } elseif ($stats.Failed -lt 3) { 'warning' } else { 'failure' })">
                <h2>$($stats.Failed)</h2>
                <p>失败测试</p>
            </div>
            <div class="summary-card info">
                <h2>$($stats.TotalDuration)s</h2>
                <p>总耗时</p>
            </div>
        </div>

        <div class="tabs">
            <div class="tab active" onclick="switchTab('overview')">概览</div>
            <div class="tab" onclick="switchTab('details')">详细结果</div>
            <div class="tab" onclick="switchTab('performance')">性能分析</div>
            $(if ($stats.Failed -gt 0) { '<div class="tab" onclick="switchTab('errors')">错误详情</div>' })
        </div>

        <!-- 概览标签页 -->
        <div id="overview" class="tab-content active">
            <div class="charts-container">
                <div class="chart">
                    <h3>📊 测试分布</h3>
                    <div style="display: flex; justify-content: space-around; align-items: center; height: 200px;">
                        <div style="text-align: center;">
                            <div style="font-size: 3em; color: #28a745;">$($stats.Passed)</div>
                            <div>通过</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 3em; color: $(if ($stats.Failed -eq 0) { '#28a745' } elseif ($stats.Failed -lt 3) { '#ffc107' } else { '#dc3545' });">$($stats.Failed)</div>
                            <div>失败</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 3em; color: #17a2b8;">$([math]::Round($stats.TotalDuration, 1))</div>
                            <div>总耗时(s)</div>
                        </div>
                    </div>
                </div>
                <div class="chart">
                    <h3>⚡ 性能指标</h3>
                    <div style="padding: 20px;">
                        <div style="margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>通过率</span>
                                <span>$($stats.PassRate)%</span>
                            </div>
                            <div class="performance-bar">
                                <div class="performance-fill" style="width: $($stats.PassRate)%"></div>
                            </div>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>平均耗时</span>
                                <span>$($stats.AverageDuration)s</span>
                            </div>
                            <div style="font-size: 0.9em; color: #666;">
                                $(if ($stats.AverageDuration -lt 5) { '🚀 优秀' } elseif ($stats.AverageDuration -lt 15) { '✅ 良好' } elseif ($stats.AverageDuration -lt 30) { '⚠️ 一般' } else { '❌ 需要优化' })
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>慢测试数量</span>
                                <span>$($stats.SlowTests.Count)</span>
                            </div>
                            <div style="font-size: 0.9em; color: $(if ($stats.SlowTests.Count -eq 0) { '#28a745' } elseif ($stats.SlowTests.Count -lt 3) { '#ffc107' } else { '#dc3545' });">
                                $(if ($stats.SlowTests.Count -eq 0) { '✅ 无慢测试' } elseif ($stats.SlowTests.Count -lt 3) { '⚠️ 少量慢测试' } else { '❌ 较多慢测试' })
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 详细结果标签页 -->
        <div id="details" class="tab-content">
            <h2>📋 详细测试结果</h2>
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

    # 添加测试结果详情
    foreach ($result in $Results) {
        $statusClass = if ($result.Success) { 'status-success' } else { 'status-failure' }
        $statusIcon = if ($result.Success) { '✅' } else { '❌' }
        $statusText = if ($result.Success) { '通过' } else { '失败' }

        $html += @"
                    <tr>
                        <td>$($result.Project)</td>
                        <td>$($result.Type)</td>
                        <td><span class="$statusClass">$statusIcon $statusText</span></td>
                        <td>$([math]::Round($result.Duration, 2))s</td>
                        <td>$($result.RetryCount)</td>
                        <td>$($result.Timestamp.ToString('yyyy-MM-dd HH:mm:ss'))</td>
                    </tr>
"@
    }

    $html += @"
                </tbody>
            </table>
        </div>

        <!-- 性能分析标签页 -->
        <div id="performance" class="tab-content">
            <h2>⚡ 性能分析</h2>
            <div class="charts-container">
                <div class="chart">
                    <h3>🐌 慢测试详情</h3>
                    $(if ($stats.SlowTests.Count -gt 0) {
                        "<table style='margin-top: 15px;'><thead><tr><th>测试名称</th><th>耗时(s)</th><th>项目</th></tr></thead><tbody>"
                        foreach ($slowTest in ($stats.SlowTests | Select-Object -First 10)) {
                            "<tr><td>$($slowTest.name)</td><td>$([math]::Round($slowTest.duration, 2))</td><td>$($slowTest.project)</td></tr>"
                        }
                        "</tbody></table>"
                    } else {
                        "<p style='text-align: center; color: #28a745; margin: 40px 0;'>🎉 没有慢测试！</p>"
                    })
                </div>
                <div class="chart">
                    <h3>📊 趋势分析</h3>
                    <div style="padding: 20px;">
"@

    # 添加趋势分析
    $trends = Generate-TrendAnalysis -HistoryFile $HistoryFile
    if ($trends) {
        foreach ($trend in $trends) {
            $trendColor = if ($trend.Status.Contains('🟢')) { '#28a745' } elseif ($trend.Status.Contains('🔴')) { '#dc3545' } else { '#6c757d' }
            $html += @"
                        <div style="margin-bottom: 15px; padding: 10px; background: white; border-radius: 6px; border: 1px solid #dee2e6;">
                            <div style="font-weight: bold; margin-bottom: 5px;">$($trend.MetricName)</div>
                            <div style="font-size: 16px; font-weight: bold; color: $trendColor;">
                                $($trend.Trend) $([math]::Round($trend.ChangePercent, 1))%
                            </div>
                            <div style="font-size: 12px; color: #6c757d;">
                                当前: $($trend.CurrentValue) | 上次: $($trend.PreviousValue)
                            </div>
                        </div>
"@
        }
    } else {
        $html += "<p style='color: #6c757d; text-align: center;'>暂无历史数据进行趋势分析</p>"
    }

    $html += @"
                    </div>
                </div>
            </div>
        </div>
"@

    # 错误详情标签页（仅在有失败测试时显示）
    if ($stats.Failed -gt 0) {
        $html += @"
        <!-- 错误详情标签页 -->
        <div id="errors" class="tab-content">
            <h2>❌ 失败详情</h2>
"@
    }

    # 添加失败测试详情
    $failedResults = $Results | Where-Object { -not $_.Success }
    if ($failedResults.Count -eq 0) {
        $html += @"
        <div style="text-align: center; padding: 60px; color: #28a745;">
            <h3>🎉 所有测试均通过！</h3>
            <p>没有失败的测试需要显示。</p>
        </div>
"@
    } else {
        foreach ($result in $failedResults) {
            $html += @"
            <div style="margin: 20px 0; padding: 20px; border-left: 4px solid #dc3545; background: #f8f9fa; border-radius: 6px;">
                <h3 style="color: #dc3545; margin-top: 0;">$($result.Project) - $($result.Type)</h3>
                <div style="margin-bottom: 10px;">
                    <strong>执行时间:</strong> $($result.Timestamp.ToString('yyyy-MM-dd HH:mm:ss'))<br>
                    <strong>耗时:</strong> $([math]::Round($result.Duration, 2))s<br>
                    <strong>重试次数:</strong> $($result.RetryCount)
                </div>
"@

            # 显示重试历史
            if ($result.RetryHistory -and $result.RetryHistory.Count -gt 0) {
                $html += @"
                <div class="retry-info">
                    <strong>重试历史:</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
"@
                foreach ($retry in $result.RetryHistory) {
                    $html += "<li>第 $($retry.Attempt) 次重试: $($retry.FailureType) (等待 $([math]::Round($retry.DelaySeconds, 1))s)</li>"
                }
                $html += "</ul></div>"
            }

            $html += @"
                <div class="output">$($result.Output -replace '<', '&lt;' -replace '>', '&gt;' -replace '\n', '<br>')</div>
            </div>
"@
        }
    }

    if ($stats.Failed -gt 0) {
        $html += "</div>"
    }

    $html += @"
    </div>
</body>
</html>
"@

        }
    }
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

# 环境检查
Write-TestLog "正在检查测试环境..." "INFO" -Verbose:$Verbose

# 确定要检查的项目路径
$projectPathsToCheck = @()
switch ($App) {
    "front" { $projectPathsToCheck = @($Projects.front) }
    "admin" { $projectPathsToCheck = @($Projects.admin) }
    "both" { $projectPathsToCheck = @($Projects.front, $Projects.admin) }
}

# 检查环境
$envCheckPassed = Test-TestEnvironment -RequiredCommands @("node", "npm", "npx") -ProjectPaths $projectPathsToCheck -InstallDependencies -AutoRepair -Verbose:$Verbose

if (-not $envCheckPassed) {
    Write-TestLog "环境检查失败，请解决上述问题后重试" "ERROR"
    exit 1
}

Write-TestLog "环境检查通过" "SUCCESS"

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

# 改进的并行测试管理函数
function Start-ParallelTestJobs {
    param(
        [array]$TestTasks,
        [int]$MaxParallel = [Math]::Min([Math]::Max($env:NUMBER_OF_PROCESSORS, 1), 4),
        [int]$JobTimeoutMinutes = 30
    )

    $completedResults = @()
    Write-Info "`n启动并行测试 (最大并发数: $MaxParallel)..."

    # 将任务分组为批次
    $batches = @()
    for ($i = 0; $i -lt $TestTasks.Count; $i += $MaxParallel) {
        $batch = $TestTasks[$i..[Math]::Min($i + $MaxParallel - 1, $TestTasks.Count - 1)]
        $batches += ,$batch
    }

    foreach ($batch in $batches) {
        Write-Info "执行批次: $($batch.Count) 个任务"

        # 启动当前批次的任务
        $currentJobs = @()
        foreach ($task in $batch) {
            $jobScript = {
                param($Path, $ProjectName, $TestType, $MaxRetries)

                # 内联Run-Test函数逻辑，避免传递函数的问题
                function Run-Test {
                    param($Path, $ProjectName, $TestType, $MaxRetries)

                    $result = @{
                        Project = $ProjectName
                        Type = $TestType
                        Success = $false
                        Duration = 0
                        Output = ""
                        RetryCount = 0
                        Timestamp = Get-Date
                    }

                    $startTime = Get-Date

                    try {
                        Push-Location $Path

                        $command = switch ($TestType) {
                            "unit" { "npm run test:unit" }
                            "e2e" { "npm run test:e2e" }
                            "coverage" { "npm run test:coverage" }
                        }

                        # 检查依赖
                        if (-not (Test-Path "node_modules")) {
                            npm install | Out-Null
                            if ($LASTEXITCODE -ne 0) {
                                throw "依赖安装失败"
                            }
                        }

                        # 执行测试（不使用重试，因为这会影响并行控制）
                        $output = Invoke-CrossPlatformCommand -Command $command -WorkingDirectory $Path
                        $result.Output = $output

                        if ($LASTEXITCODE -eq 0) {
                            $result.Success = $true
                        } else {
                            $result.Success = $false
                        }
                    }
                    catch {
                        $result.Success = $false
                        $result.Output = $_.Exception.Message
                    }
                    finally {
                        Pop-Location
                        $result.Duration = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)
                    }

                    return $result
                }

                return Run-Test -Path $Path -ProjectName $ProjectName -TestType $TestType -MaxRetries $MaxRetries
            }

            $job = Start-Job -ScriptBlock $jobScript -ArgumentList $task.Path, $task.ProjectName, $task.TestType, $task.MaxRetries
            $currentJobs += $job
        }

        # 等待当前批次完成，带超时
        $timeout = [TimeSpan]::FromMinutes($JobTimeoutMinutes)

        foreach ($job in $currentJobs) {
            try {
                $job | Wait-Job -Timeout $timeout.TotalSeconds | Out-Null

                if ($job.State -eq 'Completed') {
                    $result = Receive-Job -Job $job
                    $completedResults += $result
                } elseif ($job.State -eq 'Failed') {
                    # 任务失败，创建失败结果
                    $failedResult = @{
                        Project = "Unknown"
                        Type = "Unknown"
                        Success = $false
                        Duration = [math]::Round($timeout.TotalSeconds, 2)
                        Output = "Job failed: $($job.ChildJobs[0].JobStateInfo.Reason)"
                        RetryCount = 0
                        Timestamp = Get-Date
                    }
                    $completedResults += $failedResult
                } else {
                    # 任务超时，停止任务
                    $job | Stop-Job -PassThru | Remove-Job | Out-Null
                    $timeoutResult = @{
                        Project = "Unknown"
                        Type = "Unknown"
                        Success = $false
                        Duration = [math]::Round($timeout.TotalSeconds, 2)
                        Output = "Job timed out after ${JobTimeoutMinutes} minutes"
                        RetryCount = 0
                        Timestamp = Get-Date
                    }
                    $completedResults += $timeoutResult
                }
            }
            catch {
                Write-Warning "处理任务结果时出错: $_"
                $errorResult = @{
                    Project = "Unknown"
                    Type = "Unknown"
                    Success = $false
                    Duration = 0
                    Output = "Error processing job result: $($_.Exception.Message)"
                    RetryCount = 0
                    Timestamp = Get-Date
                }
                $completedResults += $errorResult
            }
            finally {
                if ($job) {
                    Remove-Job -Job $job -ErrorAction SilentlyContinue
                }
            }
        }

        Write-Info "批次完成，共处理了 $($currentJobs.Count) 个任务"
    }

    Write-Info "所有并行任务完成"
    return $completedResults
}

# 运行测试
$jobs = @()

foreach ($testType in $testTypes) {
    foreach ($appName in $apps) {
        $path = $Projects[$appName]

        if ($Parallel) {
            # 并行运行 - 使用改进的逻辑
            $task = @{
                Path = $path
                ProjectName = $appName
                TestType = $testType
                MaxRetries = $Retry
            }
            $jobs += $task
        } else {
            # 串行运行
            $result = Run-Test -Path $path -ProjectName $appName -TestType $testType -MaxRetries $Retry
            $Global:TestResults += $result
        }
    }
}

# 处理并行任务
if ($Parallel -and $jobs.Count -gt 0) {
    # 使用改进的并行管理函数
    $parallelResults = Start-ParallelTestJobs -TestTasks $jobs

    # 添加到全局结果
    foreach ($result in $parallelResults) {
        # 转换结果格式以匹配TestResult类
        $testResult = [TestResult]::new()
        $testResult.Project = $result.Project
        $testResult.Type = $result.Type
        $testResult.Success = $result.Success
        $testResult.Duration = $result.Duration
        $testResult.Output = $result.Output
        $testResult.RetryCount = $result.RetryCount
        $testResult.Timestamp = $result.Timestamp

        $Global:TestResults += $testResult
    }
}

# 保存历史数据
Save-TestHistory -Results $Global:TestResults

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

