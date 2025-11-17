#!/usr/bin/env powershell
<#
.SYNOPSIS
    Admin前端自动化测试脚本
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("unit", "integration", "coverage", "all")]
    [string]$Type = "all",

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
$AdminPath = "springboot1ngh61a2\src\main\resources\admin\admin"

# 主逻辑
Write-Info "========================================="
Write-Info "Admin 前端测试自动化"
Write-Info "========================================="
Write-Info "测试类型: $Type"
Write-Info "生成报告: $GenerateReport"
Write-Info "详细输出: $Verbose"
Write-Info "========================================="

Push-Location $AdminPath

try {
    # 检查依赖
    if (-not (Test-Path "node_modules")) {
        Write-Warning "安装依赖..."
        npm install
    }

    # 运行测试
    switch ($Type) {
        "unit" {
            Write-Info "运行单元测试..."
            npm run test:unit
        }
        "integration" {
            Write-Info "运行集成测试..."
            npm run test:integration
        }
        "coverage" {
            Write-Info "运行覆盖率测试..."
            npm run test:coverage
        }
        "all" {
            Write-Info "运行所有测试..."
            npm run test:all
        }
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Success "测试完成！"
        exit 0
    } else {
        Write-Error "测试失败！"
        exit 1
    }
}
catch {
    Write-Error "运行测试时出错: $_"
    exit 1
}
finally {
    Pop-Location
}