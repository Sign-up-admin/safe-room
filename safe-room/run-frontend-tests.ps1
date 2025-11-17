# run-frontend-tests.ps1
# 前端自动化测试脚本
# 用于运行前端项目的所有测试（单元测试和E2E测试）

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("unit", "e2e", "coverage", "all")]
    [string]$Type = "all",

    [Parameter(Mandatory=$false)]
    [ValidateSet("front", "admin", "both")]
    [string]$App = "both",

    [Parameter(Mandatory=$false)]
    [switch]$Watch,

    [Parameter(Mandatory=$false)]
    [switch]$UI,

    [Parameter(Mandatory=$false)]
    [switch]$Debug
)

$ErrorActionPreference = "Stop"

# 导入统一的环境检查函数库
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$envLibPath = Join-Path $scriptRoot "scripts\common\Test-Environment.ps1"
if (Test-Path $envLibPath) {
    . $envLibPath
} else {
    Write-Error "错误: 找不到环境检查函数库: $envLibPath"
    exit 1
}

# 兼容性检查 - 确保使用PowerShell 5.1+兼容的语法
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Error "此脚本需要 PowerShell 5.1 或更高版本。当前版本: $($PSVersionTable.PSVersion)"
    exit 1
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

# 项目路径
$FrontPath = "springboot1ngh61a2\src\main\resources\front\front"
$AdminPath = "springboot1ngh61a2\src\main\resources\admin\admin"

# 检查路径是否存在
if (-not (Test-Path $FrontPath)) {
    Write-Error "错误: 找不到前端项目路径: $FrontPath"
    exit 1
}

if (-not (Test-Path $AdminPath)) {
    Write-Error "错误: 找不到后台项目路径: $AdminPath"
    exit 1
}

# 运行测试的函数
function Run-Test {
    param(
        [string]$Path,
        [string]$AppName,
        [string]$TestType,
        [bool]$IsWatch = $false,
        [bool]$IsUI = $false,
        [bool]$IsDebug = $false
    )
    
    Push-Location $Path
    
    try {
        Write-Info "`n========================================="
        Write-Info "运行 $AppName - $TestType 测试"
        Write-Info "=========================================`n"
        
        $command = ""
        
        switch ($TestType) {
            "unit" {
                if ($IsWatch) {
                    $command = "npm run test:unit:watch"
                } elseif ($IsUI) {
                    $command = "npm run test:unit:ui"
                } else {
                    $command = "npm run test:unit"
                }
            }
            "e2e" {
                if ($IsUI) {
                    $command = "npm run test:e2e:ui"
                } elseif ($IsDebug) {
                    $command = "npm run test:e2e:debug"
                } else {
                    $command = "npm run test:e2e"
                }
            }
            "coverage" {
                $command = "npm run test:coverage"
            }
        }
        
        Write-Info "执行命令: $command`n"

        # 使用统一的环境检查和依赖安装
        if (-not (Install-Dependencies -ProjectPath $Path -ProjectName "$AppName 项目")) {
            Write-Error "依赖安装失败"
            return $false
        }
        
        # 运行测试
        $output = Invoke-CrossPlatformCommand -Command $command -WorkingDirectory $Path
        if ($LASTEXITCODE -ne 0) {
            throw "Test execution failed: $output"
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "`n✓ $AppName - $TestType 测试通过"
            return $true
        } else {
            Write-Error "`n✗ $AppName - $TestType 测试失败"
            return $false
        }
    }
    catch {
        Write-Error "运行测试时出错: $_"
        return $false
    }
    finally {
        Pop-Location
    }
}

# 主逻辑
$results = @{}

Write-Info "========================================="
Write-Info "前端自动化测试"
Write-Info "========================================="
Write-Info "测试类型: $Type"
Write-Info "应用: $App"
if ($Watch) { Write-Info "模式: Watch" }
if ($UI) { Write-Info "模式: UI" }
if ($Debug) { Write-Info "模式: Debug" }
Write-Info "=========================================`n"

# 环境检查
Write-TestLog "正在检查测试环境..." "INFO"

# 确定要检查的项目路径
$projectPathsToCheck = @()
switch ($App) {
    "front" { $projectPathsToCheck = @($FrontPath) }
    "admin" { $projectPathsToCheck = @($AdminPath) }
    "both" { $projectPathsToCheck = @($FrontPath, $AdminPath) }
}

# 检查环境
$envCheckPassed = Test-TestEnvironment -RequiredCommands @("node", "npm", "npx") -ProjectPaths $projectPathsToCheck -InstallDependencies

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
    "all" { $testTypes = @("unit", "e2e") }
}

# 确定要运行的应用
$apps = @()
switch ($App) {
    "front" { $apps = @("front") }
    "admin" { $apps = @("admin") }
    "both" { $apps = @("front", "admin") }
}

# 运行测试
foreach ($testType in $testTypes) {
    foreach ($appName in $apps) {
        $path = if ($appName -eq "front") { $FrontPath } else { $AdminPath }
        
        # Watch 模式只运行一次
        if ($Watch -and $testType -eq "unit") {
            Write-Info "`n启动 Watch 模式（按 Ctrl+C 退出）...`n"
            Run-Test -Path $path -AppName $appName -TestType $testType -IsWatch $true
            exit $LASTEXITCODE
        }
        
        $success = Run-Test -Path $path -AppName $appName -TestType $testType -IsUI $UI -IsDebug $Debug
        $results["$appName-$testType"] = $success
        
        if (-not $success) {
            Write-Warning "`n测试失败，是否继续运行其他测试？(Y/N)"
            $continue = Read-Host
            if ($continue -ne "Y" -and $continue -ne "y") {
                Write-Error "测试已中断"
                exit 1
            }
        }
    }
}

# 输出总结
Write-Info "`n========================================="
Write-Info "测试总结"
Write-Info "========================================="

$allPassed = $true
foreach ($key in $results.Keys) {
    if ($results[$key]) {
        Write-Success "✓ $key : 通过"
    } else {
        Write-Error "✗ $key : 失败"
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

