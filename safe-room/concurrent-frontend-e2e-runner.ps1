# 前端E2E测试并发执行脚本
# 支持两个前端工程的并行测试执行

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("admin", "front", "both")]
    [string]$App = "both",

    [Parameter(Mandatory=$false)]
    [switch]$Parallel,  # 新增：是否启用并行执行，默认false（适合笔记本）

    [Parameter(Mandatory=$false)]
    [int]$MaxConcurrency = 2,  # 默认降低并发数，适合笔记本

    [Parameter(Mandatory=$false)]
    [switch]$CI,

    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# 配置信息
$Config = @{
    Admin = @{
        Path = "springboot1ngh61a2/src/main/resources/admin/admin"
        Port = 8081
        Workers = if ($CI) { 2 } else { 4 }
    }
    Front = @{
        Path = "springboot1ngh61a2/src/main/resources/front/front"
        Port = 8082
        Workers = if ($CI) { 3 } else { 6 }
    }
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Test-Project {
    param(
        [string]$ProjectName,
        [string]$ProjectPath,
        [int]$Port,
        [int]$Workers
    )

    Write-Info "开始执行 ${ProjectName} 前端E2E测试"

    try {
        Push-Location $ProjectPath

        # 设置环境变量
        $env:E2E_PORT = $Port
        $env:E2E_BASE_URL = "http://127.0.0.1:$Port"
        if ($Parallel) {
            $env:E2E_PARALLEL = "true"
            $env:PLAYWRIGHT_WORKERS = $Workers
        } else {
            $env:E2E_PARALLEL = "false"
        }

        if ($CI) {
            $env:CI = "true"
        }

        # 执行测试
        $testCommand = "npm run test:e2e"
        if ($Verbose) {
            Write-Info "执行命令: $testCommand"
        }

        $startTime = Get-Date
        $result = Invoke-Expression $testCommand 2>&1
        $endTime = Get-Date
        $duration = $endTime - $startTime

        $exitCode = $LASTEXITCODE

        if ($exitCode -eq 0) {
            Write-Success "${ProjectName} 前端E2E测试通过 (耗时: $($duration.TotalSeconds.ToString("F2"))秒)"
            return @{
                Project = $ProjectName
                Success = $true
                Duration = $duration.TotalSeconds
                Output = $result
            }
        } else {
            Write-Error "${ProjectName} 前端E2E测试失败 (耗时: $($duration.TotalSeconds.ToString("F2"))秒)"
            return @{
                Project = $ProjectName
                Success = $false
                Duration = $duration.TotalSeconds
                Output = $result
                ExitCode = $exitCode
            }
        }

    } catch {
        Write-Error "${ProjectName} 前端E2E测试执行异常: $($_.Exception.Message)"
        return @{
            Project = $ProjectName
            Success = $false
            Duration = 0
            Error = $_.Exception.Message
        }
    } finally {
        Pop-Location

        # 清理环境变量
        Remove-Item Env:E2E_PORT -ErrorAction SilentlyContinue
        Remove-Item Env:E2E_BASE_URL -ErrorAction SilentlyContinue
        Remove-Item Env:E2E_PARALLEL -ErrorAction SilentlyContinue
        Remove-Item Env:PLAYWRIGHT_WORKERS -ErrorAction SilentlyContinue
        Remove-Item Env:CI -ErrorAction SilentlyContinue
    }
}

function Start-ConcurrentTests {
    param([string[]]$Projects)

    Write-Info "启动并发测试执行 (最大并发数: $MaxConcurrency)"

    $jobs = @()
    $results = @()

    foreach ($project in $Projects) {
        $projectConfig = $Config[$project]

        $job = Start-Job -ScriptBlock {
            param($ProjectName, $ProjectPath, $Port, $Workers, $CI, $Verbose)

            # 在作业中重新定义函数
            function Write-Info { param([string]$Message) Write-Host "ℹ️  [$ProjectName] $Message" -ForegroundColor Cyan }
            function Write-Success { param([string]$Message) Write-Host "✅ [$ProjectName] $Message" -ForegroundColor Green }
            function Write-Error { param([string]$Message) Write-Host "❌ [$ProjectName] $Message" -ForegroundColor Red }

            try {
                Push-Location $ProjectPath

                # 设置环境变量
                $env:E2E_PORT = $Port
                $env:E2E_BASE_URL = "http://127.0.0.1:$Port"
                if ($Parallel) {
                    $env:E2E_PARALLEL = "true"
                } else {
                    $env:E2E_PARALLEL = "false"
                }

                if ($CI) {
                    $env:CI = "true"
                }

                # 执行测试
                $startTime = Get-Date
                $result = & npm run test:e2e 2>&1
                $endTime = Get-Date
                $duration = $endTime - $startTime
                $exitCode = $LASTEXITCODE

                return @{
                    Project = $ProjectName
                    Success = ($exitCode -eq 0)
                    Duration = $duration.TotalSeconds
                    Output = ($result | Out-String)
                    ExitCode = $exitCode
                }

            } catch {
                return @{
                    Project = $ProjectName
                    Success = $false
                    Duration = 0
                    Error = $_.Exception.Message
                }
            } finally {
                Pop-Location
            }

        } -ArgumentList $project, $projectConfig.Path, $projectConfig.Port, $projectConfig.Workers, $CI.IsPresent, $Verbose.IsPresent

        $jobs += $job

        # 控制并发数量
        if ($jobs.Count -ge $MaxConcurrency) {
            Write-Info "达到最大并发数限制 ($MaxConcurrency)，等待任务完成..."
            $completedJobs = $jobs | Wait-Job -Any
            foreach ($completedJob in $completedJobs) {
                $result = Receive-Job $completedJob
                $results += $result
                $jobs = $jobs | Where-Object { $_.Id -ne $completedJob.Id }
            }
        }
    }

    # 等待所有剩余任务完成
    if ($jobs.Count -gt 0) {
        Write-Info "等待剩余任务完成..."
        $jobs | Wait-Job | ForEach-Object {
            $result = Receive-Job $_
            $results += $result
        }
    }

    return $results
}

# 主执行逻辑
Write-Info "前端E2E测试并发执行器启动"
Write-Info "应用: $App"
Write-Info "执行模式: $($Parallel ? '并行' : '串行') (笔记本友好)"
if ($Parallel) {
    Write-Info "最大并发数: $MaxConcurrency"
}
Write-Info "CI模式: $($CI.IsPresent)"
Write-Info "详细输出: $($Verbose.IsPresent)"

$projects = @()
switch ($App) {
    "admin" { $projects = @("Admin") }
    "front" { $projects = @("Front") }
    "both" { $projects = @("Admin", "Front") }
}

if ($projects.Count -eq 0) {
    Write-Error "未选择任何项目"
    exit 1
}

Write-Info "将并发执行以下项目: $($projects -join ', ')"

$startTime = Get-Date

if ($Parallel -and $MaxConcurrency -gt 1 -and $projects.Count -gt 1) {
    # 并发执行
    Write-Info "使用并行执行模式 (适合高性能机器)"
    $results = Start-ConcurrentTests -Projects $projects
} else {
    # 串行执行（默认，适合笔记本）
    Write-Info "使用串行执行模式 (笔记本友好，资源节省)"
    $results = @()
    foreach ($project in $projects) {
        $projectConfig = $Config[$project]
        $result = Test-Project -ProjectName $project -ProjectPath $projectConfig.Path -Port $projectConfig.Port -Workers $projectConfig.Workers
        $results += $result
    }
}

$endTime = Get-Date
$totalDuration = $endTime - $startTime

# 输出汇总结果
Write-Host "`n" + "="*60 -ForegroundColor Magenta
Write-Host " 测试执行汇总报告 " -ForegroundColor Magenta
Write-Host "="*60 -ForegroundColor Magenta

$successCount = ($results | Where-Object { $_.Success }).Count
$totalCount = $results.Count

Write-Host "总项目数: $totalCount" -ForegroundColor White
Write-Host "成功项目数: $successCount" -ForegroundColor Green
Write-Host "失败项目数: $($totalCount - $successCount)" -ForegroundColor Red
Write-Host "总耗时: $($totalDuration.TotalSeconds.ToString("F2"))秒" -ForegroundColor White
Write-Host "平均耗时: $(($totalDuration.TotalSeconds / $totalCount).ToString("F2"))秒/项目" -ForegroundColor White

# 生成汇总报告
Write-Info "生成测试执行汇总报告..."
try {
    $reportResult = & node concurrent-e2e-report-aggregator.js
    if ($LASTEXITCODE -eq 0) {
        Write-Success "测试报告生成成功"
    } else {
        Write-Warning "测试报告生成时发现问题，但继续执行"
    }
} catch {
    Write-Warning "生成测试报告时发生错误: $($_.Exception.Message)"
}

if ($successCount -eq $totalCount) {
    Write-Success "所有测试执行成功! 🎉"
    Write-Host "`n📄 查看详细报告: $(Resolve-Path "concurrent-e2e-report\concurrent-e2e-report.html")" -ForegroundColor Cyan
    exit 0
} else {
    Write-Error "部分测试执行失败"

    # 显示失败详情
    Write-Host "`n失败项目详情:" -ForegroundColor Red
    foreach ($result in ($results | Where-Object { -not $_.Success })) {
        Write-Host "  - $($result.Project): $($result.Error)" -ForegroundColor Red
    }

    Write-Host "`n📄 查看详细报告: $(Resolve-Path "concurrent-e2e-report\concurrent-e2e-report.html")" -ForegroundColor Cyan
    exit 1
}
