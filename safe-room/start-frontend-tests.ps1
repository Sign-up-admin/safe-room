# 前端自动化测试启动脚本
# 快速启动前端测试的便捷脚本

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("unit", "e2e", "coverage", "all")]
    [string]$Type = "unit",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("front", "admin", "both")]
    [string]$App = "front",
    
    [Parameter(Mandatory=$false)]
    [switch]$Watch,
    
    [Parameter(Mandatory=$false)]
    [switch]$UI
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "前端自动化测试启动器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 项目路径
$FrontPath = "springboot1ngh61a2\src\main\resources\front\front"
$AdminPath = "springboot1ngh61a2\src\main\resources\admin\admin"

# 检查路径
if ($App -eq "front" -or $App -eq "both") {
    if (-not (Test-Path $FrontPath)) {
        Write-Host "错误: 找不到前端项目路径: $FrontPath" -ForegroundColor Red
        exit 1
    }
}

if ($App -eq "admin" -or $App -eq "both") {
    if (-not (Test-Path $AdminPath)) {
        Write-Host "错误: 找不到后台项目路径: $AdminPath" -ForegroundColor Red
        exit 1
    }
}

# 运行测试
function Start-Test {
    param(
        [string]$Path,
        [string]$AppName,
        [string]$TestType
    )
    
    Push-Location $Path
    
    try {
        Write-Host "`n正在启动 $AppName - $TestType 测试..." -ForegroundColor Yellow
        Write-Host "路径: $Path`n" -ForegroundColor Gray
        
        $command = ""
        
        switch ($TestType) {
            "unit" {
                if ($Watch) {
                    $command = "npm run test:unit:watch"
                } elseif ($UI) {
                    $command = "npm run test:unit:ui"
                } else {
                    $command = "npm run test:unit"
                }
            }
            "e2e" {
                if ($UI) {
                    $command = "npm run test:e2e:ui"
                } else {
                    $command = "npm run test:e2e"
                }
            }
            "coverage" {
                $command = "npm run test:coverage"
            }
        }
        
        Write-Host "执行命令: $command`n" -ForegroundColor Green
        
        # 检查依赖
        if (-not (Test-Path "node_modules")) {
            Write-Host "正在安装依赖..." -ForegroundColor Yellow
            npm install
        }
        
        # 运行测试
        Invoke-Expression $command
    }
    finally {
        Pop-Location
    }
}

# 确定要运行的应用
$apps = @()
switch ($App) {
    "front" { $apps = @("front") }
    "admin" { $apps = @("admin") }
    "both" { $apps = @("front", "admin") }
}

# 运行测试
foreach ($appName in $apps) {
    $path = if ($appName -eq "front") { $FrontPath } else { $AdminPath }
    
    # Watch 模式只运行一次
    if ($Watch -and $Type -eq "unit") {
        Start-Test -Path $path -AppName $appName -TestType $Type
        exit
    }
    
    Start-Test -Path $path -AppName $appName -TestType $Type
}

Write-Host "`n测试完成！" -ForegroundColor Green

