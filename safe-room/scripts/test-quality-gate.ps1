# Test Quality Gate Script for Windows
# Checks test results, coverage, and quality metrics

param(
    [string]$TestReportPath = ".\target\surefire-reports",
    [string]$CoverageReportPath = ".\target\site\jacoco\jacoco.xml",
    [string]$ConfigFile = ".\.test-config.json",
    [switch]$Strict,
    [switch]$Verbose
)

# Configuration
$Config = @{
    TestFailureThreshold = 0
    CoverageThresholds = @{
        Line = 65
        Branch = 45
        Instruction = 65
        Method = 75
        Class = 90
        Controller = 30
        Service = 60
    }
    MaxTestDuration = 1800  # 30 minutes
}

# Load custom configuration if exists
if (Test-Path $ConfigFile) {
    try {
        $CustomConfig = Get-Content $ConfigFile | ConvertFrom-Json
        if ($CustomConfig.TestFailureThreshold) { $Config.TestFailureThreshold = $CustomConfig.TestFailureThreshold }
        if ($CustomConfig.CoverageThresholds) { $Config.CoverageThresholds = $CustomConfig.CoverageThresholds }
        if ($CustomConfig.MaxTestDuration) { $Config.MaxTestDuration = $CustomConfig.MaxTestDuration }
    } catch {
        Write-Warning "Failed to load configuration file: $ConfigFile"
    }
}

# Results tracking
$Results = @{
    Tests = @{
        Total = 0
        Passed = 0
        Failed = 0
        Errors = 0
        Skipped = 0
    }
    Coverage = @{
        Line = 0
        Branch = 0
        Instruction = 0
        Method = 0
        Class = 0
        Controller = 0
        Service = 0
    }
    Quality = @{
        BuildErrors = 0
        BuildWarnings = 0
        TestDuration = 0
    }
    FailedChecks = 0
    Warnings = 0
}

function Write-LogInfo {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-LogSuccess {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-LogWarning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-LogError {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-TestResults {
    Write-LogInfo "Analyzing test results..."

    if (-not (Test-Path $TestReportPath)) {
        Write-LogError "Test report path not found: $TestReportPath"
        $Results.FailedChecks++
        return
    }

    $xmlFiles = Get-ChildItem -Path $TestReportPath -Filter "*.xml" -File
    if ($xmlFiles.Count -eq 0) {
        Write-LogError "No test report XML files found in: $TestReportPath"
        $Results.FailedChecks++
        return
    }

    foreach ($xmlFile in $xmlFiles) {
        try {
            [xml]$xmlContent = Get-Content $xmlFile.FullName

            $testSuite = $xmlContent.testsuite
            if ($testSuite) {
                $Results.Tests.Total += [int]$testSuite.tests
                $Results.Tests.Failed += [int]$testSuite.failures
                $Results.Tests.Errors += [int]$testSuite.errors
                $Results.Tests.Skipped += [int]$testSuite.skipped
            }
        } catch {
            Write-LogWarning "Failed to parse test report: $($xmlFile.Name)"
        }
    }

    $Results.Tests.Passed = $Results.Tests.Total - $Results.Tests.Failed - $Results.Tests.Errors - $Results.Tests.Skipped

    Write-LogInfo "Test Results: Total=$($Results.Tests.Total), Passed=$($Results.Tests.Passed), Failed=$($Results.Tests.Failed), Errors=$($Results.Tests.Errors), Skipped=$($Results.Tests.Skipped)"

    $totalFailures = $Results.Tests.Failed + $Results.Tests.Errors
    if ($totalFailures -gt $Config.TestFailureThreshold) {
        Write-LogError "Test failures ($totalFailures) exceed threshold ($($Config.TestFailureThreshold))")
        $Results.FailedChecks++
    } else {
        Write-LogSuccess "Test failures within acceptable threshold"
    }
}

function Test-CoverageResults {
    Write-LogInfo "Analyzing coverage results..."

    if (-not (Test-Path $CoverageReportPath)) {
        Write-LogError "Coverage report not found: $CoverageReportPath"
        $Results.FailedChecks++
        return
    }

    try {
        [xml]$xmlContent = Get-Content $CoverageReportPath

        # Extract coverage counters
        $counters = $xmlContent.report.counter

        foreach ($counter in $counters) {
            $type = $counter.type
            $covered = [int]$counter.covered
            $total = [int]$counter.total
            $percentage = [math]::Round(($covered / $total) * 100, 2)

            switch ($type) {
                "LINE" { $Results.Coverage.Line = $percentage }
                "BRANCH" { $Results.Coverage.Branch = $percentage }
                "INSTRUCTION" { $Results.Coverage.Instruction = $percentage }
                "METHOD" { $Results.Coverage.Method = $percentage }
                "CLASS" { $Results.Coverage.Class = $percentage }
            }
        }

        # Extract package-level coverage
        $packages = $xmlContent.report.package
        $controllerPackages = $packages | Where-Object { $_.name -like "*controller*" }
        $servicePackages = $packages | Where-Object { $_.name -like "*service*" }

        if ($controllerPackages) {
            $controllerTotal = ($controllerPackages.counter | Where-Object { $_.type -eq "LINE" } | Measure-Object -Property total -Sum).Sum
            $controllerCovered = ($controllerPackages.counter | Where-Object { $_.type -eq "LINE" } | Measure-Object -Property covered -Sum).Sum
            if ($controllerTotal -gt 0) {
                $Results.Coverage.Controller = [math]::Round(($controllerCovered / $controllerTotal) * 100, 2)
            }
        }

        if ($servicePackages) {
            $serviceTotal = ($servicePackages.counter | Where-Object { $_.type -eq "LINE" } | Measure-Object -Property total -Sum).Sum
            $serviceCovered = ($servicePackages.counter | Where-Object { $_.type -eq "LINE" } | Measure-Object -Property covered -Sum).Sum
            if ($serviceTotal -gt 0) {
                $Results.Coverage.Service = [math]::Round(($serviceCovered / $serviceTotal) * 100, 2)
            }
        }

        Write-LogInfo "Coverage Results: Line=$($Results.Coverage.Line)%, Branch=$($Results.Coverage.Branch)%, Method=$($Results.Coverage.Method)%, Class=$($Results.Coverage.Class)%"
        Write-LogInfo "Package Coverage: Controller=$($Results.Coverage.Controller)%, Service=$($Results.Coverage.Service)%"

    } catch {
        Write-LogError "Failed to parse coverage report: $($_.Exception.Message)"
        $Results.FailedChecks++
        return
    }

    # Check coverage thresholds
    $coverageChecks = @(
        @{ Name = "Line"; Value = $Results.Coverage.Line; Threshold = $Config.CoverageThresholds.Line },
        @{ Name = "Branch"; Value = $Results.Coverage.Branch; Threshold = $Config.CoverageThresholds.Branch },
        @{ Name = "Instruction"; Value = $Results.Coverage.Instruction; Threshold = $Config.CoverageThresholds.Instruction },
        @{ Name = "Method"; Value = $Results.Coverage.Method; Threshold = $Config.CoverageThresholds.Method },
        @{ Name = "Class"; Value = $Results.Coverage.Class; Threshold = $Config.CoverageThresholds.Class },
        @{ Name = "Controller"; Value = $Results.Coverage.Controller; Threshold = $Config.CoverageThresholds.Controller },
        @{ Name = "Service"; Value = $Results.Coverage.Service; Threshold = $Config.CoverageThresholds.Service }
    )

    foreach ($check in $coverageChecks) {
        if ($check.Value -lt $check.Threshold) {
            Write-LogError "$($check.Name) coverage ($($check.Value)%) below threshold ($($check.Threshold)%)")
            $Results.FailedChecks++
        } elseif ($Verbose) {
            Write-LogSuccess "$($check.Name) coverage ($($check.Value)%) meets threshold ($($check.Threshold)%)")
        }
    }
}

function Test-QualityMetrics {
    Write-LogInfo "Analyzing quality metrics..."

    # Check build logs for errors and warnings
    $buildLogPath = ".\target\surefire-reports\build.log"
    if (Test-Path $buildLogPath) {
        $buildLog = Get-Content $buildLogPath -Raw

        $Results.Quality.BuildErrors = ($buildLog | Select-String -Pattern "ERROR|error" -AllMatches).Matches.Count
        $Results.Quality.BuildWarnings = ($buildLog | Select-String -Pattern "WARNING|warning" -AllMatches).Matches.Count

        Write-LogInfo "Build Quality: Errors=$($Results.Quality.BuildErrors), Warnings=$($Results.Quality.BuildWarnings)"

        if ($Results.Quality.BuildErrors -gt 0) {
            Write-LogError "Build errors detected: $($Results.Quality.BuildErrors)")
            $Results.FailedChecks++
        }

        if ($Results.Quality.BuildWarnings -gt 50) {
            Write-LogWarning "High number of build warnings: $($Results.Quality.BuildWarnings)")
            $Results.Warnings++
        }
    }

    # Check test execution time
    $durationFile = ".\target\surefire-reports\test-duration.txt"
    if (Test-Path $durationFile) {
        try {
            $Results.Quality.TestDuration = [int](Get-Content $durationFile -Raw)
            Write-LogInfo "Test Execution Time: $($Results.Quality.TestDuration) seconds"

            if ($Results.Quality.TestDuration -gt $Config.MaxTestDuration) {
                Write-LogWarning "Test execution time exceeds maximum ($($Config.MaxTestDuration) seconds)")
                $Results.Warnings++
            }
        } catch {
            Write-LogWarning "Failed to read test duration"
        }
    }
}

function New-QualityGateReport {
    Write-LogInfo "Generating quality gate report..."

    $reportPath = "quality-gate-report-$(Get-Date -Format 'yyyyMMdd_HHmmss').md"

    $reportContent = @"
# Quality Gate Report

**Generated**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Configuration**: $ConfigFile
**Strict Mode**: $Strict

## Executive Summary

**Status**: $(if ($Results.FailedChecks -gt 0) { "❌ FAILED" } else { "✅ PASSED" })
**Failed Checks**: $($Results.FailedChecks)
**Warnings**: $($Results.Warnings)

## Test Results

- **Total Tests**: $($Results.Tests.Total)
- **Passed**: $($Results.Tests.Passed)
- **Failed**: $($Results.Tests.Failed)
- **Errors**: $($Results.Tests.Errors)
- **Skipped**: $($Results.Tests.Skipped)

## Coverage Metrics

- **Line Coverage**: $($Results.Coverage.Line)%
- **Branch Coverage**: $($Results.Coverage.Branch)%
- **Instruction Coverage**: $($Results.Coverage.Instruction)%
- **Method Coverage**: $($Results.Coverage.Method)%
- **Class Coverage**: $($Results.Coverage.Class)%
- **Controller Coverage**: $($Results.Coverage.Controller)%
- **Service Coverage**: $($Results.Coverage.Service)%

## Quality Metrics

- **Build Errors**: $($Results.Quality.BuildErrors)
- **Build Warnings**: $($Results.Quality.BuildWarnings)
- **Test Duration**: $($Results.Quality.TestDuration) seconds

## Thresholds

- **Test Failure Threshold**: $($Config.TestFailureThreshold)
- **Line Coverage Minimum**: $($Config.CoverageThresholds.Line)%
- **Branch Coverage Minimum**: $($Config.CoverageThresholds.Branch)%
- **Controller Coverage Minimum**: $($Config.CoverageThresholds.Controller)%
- **Service Coverage Minimum**: $($Config.CoverageThresholds.Service)%
- **Max Test Duration**: $($Config.MaxTestDuration) seconds

---

*Generated by Test Quality Gate Script v1.0.0*
"@

    $reportContent | Out-File -FilePath $reportPath -Encoding UTF8
    Write-LogInfo "Quality gate report saved to: $reportPath"

    return $reportPath
}

# Main execution
try {
    Write-LogInfo "Starting Test Quality Gate Analysis..."
    Write-LogInfo "Configuration loaded from: $ConfigFile"

    # Run all checks
    Test-TestResults
    Test-CoverageResults
    Test-QualityMetrics

    # Generate report
    $reportPath = New-QualityGateReport

    # Summary
    Write-Host "`n" + "="*60 -ForegroundColor Cyan
    Write-Host " QUALITY GATE SUMMARY " -ForegroundColor Cyan
    Write-Host "="*60 -ForegroundColor Cyan

    Write-Host "Failed Checks: $($Results.FailedChecks)" -ForegroundColor $(if ($Results.FailedChecks -gt 0) { "Red" } else { "Green" })
    Write-Host "Warnings: $($Results.Warnings)" -ForegroundColor $(if ($Results.Warnings -gt 0) { "Yellow" } else { "Green" })

    if ($Results.FailedChecks -gt 0) {
        Write-LogError "QUALITY GATE FAILED - $Results.FailedChecks checks failed"
        Write-LogInfo "Report saved to: $reportPath"
        exit 1
    } else {
        Write-LogSuccess "QUALITY GATE PASSED - All checks successful"
        if ($Results.Warnings -gt 0) {
            Write-LogWarning "$Results.Warnings warnings detected - consider addressing"
        }
        exit 0
    }

} catch {
    Write-LogError "Quality gate execution failed: $($_.Exception.Message)"
    exit 1
}
