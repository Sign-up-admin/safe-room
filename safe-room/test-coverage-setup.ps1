#!/usr/bin/env powershell

<#
.SYNOPSIS
    测试覆盖率设置是否正常工作
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("front", "admin")]
    [string]$Project
)

Write-Host "Testing coverage setup for $Project project..." -ForegroundColor Cyan

# Set project path
$projectPath = if ($Project -eq "front") {
    "springboot1ngh61a2\src\main\resources\front\front"
} else {
    "springboot1ngh61a2\src\main\resources\admin\admin"
}

# Check if project directory exists
if (!(Test-Path $projectPath)) {
    Write-Host "Error: Project directory $projectPath not found!" -ForegroundColor Red
    exit 1
}

# Change to project directory
Push-Location $projectPath

try {
    # Check if package.json exists
    if (!(Test-Path "package.json")) {
        Write-Host "Error: package.json not found in $projectPath!" -ForegroundColor Red
        exit 1
    }

    # Check if vitest config exists
    if (!(Test-Path "vitest.config.ts")) {
        Write-Host "Error: vitest.config.ts not found in $projectPath!" -ForegroundColor Red
        exit 1
    }

    # Check if tests directory exists
    if (!(Test-Path "tests")) {
        Write-Host "Error: tests directory not found in $projectPath!" -ForegroundColor Red
        exit 1
    }

    Write-Host "✓ Project structure verified" -ForegroundColor Green

    # Check npm/node availability
    try {
        $nodeVersion = & node --version 2>$null
        $npmVersion = & npm --version 2>$null
        Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
        Write-Host "✓ NPM version: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "Error: Node.js or NPM not available!" -ForegroundColor Red
        exit 1
    }

    # Check if dependencies are installed
    if (!(Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        & npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: Failed to install dependencies!" -ForegroundColor Red
            exit 1
        }
    }

    Write-Host "✓ Dependencies installed" -ForegroundColor Green

    # Run a quick test to check if vitest works
    Write-Host "Running a quick test..." -ForegroundColor Yellow
    $testOutput = & npx vitest run --reporter=verbose --run tests/unit/common/errorHandler.test.ts 2>&1
    $exitCode = $LASTEXITCODE

    if ($exitCode -eq 0) {
        Write-Host "✓ Test execution successful" -ForegroundColor Green
    } else {
        Write-Host "⚠ Test execution had issues (this might be expected if tests are still being fixed)" -ForegroundColor Yellow
        Write-Host "Test output:" -ForegroundColor Gray
        Write-Host $testOutput -ForegroundColor Gray
    }

    # Check coverage directory creation
    Write-Host "Testing coverage generation..." -ForegroundColor Yellow
    $coverageOutput = & npx vitest run --coverage --run tests/unit/common/errorHandler.test.ts 2>&1
    $coverageExitCode = $LASTEXITCODE

    if (Test-Path "coverage") {
        Write-Host "✓ Coverage directory created" -ForegroundColor Green

        # Check coverage files
        $coverageFiles = Get-ChildItem "coverage" -Recurse -File
        Write-Host "✓ Coverage files generated: $($coverageFiles.Count)" -ForegroundColor Green

        # List coverage files
        $coverageFiles | ForEach-Object {
            Write-Host "  - $($_.Name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠ Coverage directory not created" -ForegroundColor Yellow
    }

    Write-Host "`nCoverage setup test completed!" -ForegroundColor Cyan

} finally {
    Pop-Location
}
