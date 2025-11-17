# Automated Test Runner for Fitness Gym System
# Features: Unit tests, Integration tests, E2E tests, Performance tests

param(
    [switch]$Unit,
    [switch]$Integration,
    [switch]$E2E,
    [switch]$Performance,
    [switch]$Help
)

$SCRIPT_VERSION = "1.0.0"
$LOG_FILE = ".\fitness-gym-tests_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Colors for output
$Colors = @{
    Red = [ConsoleColor]::Red
    Green = [ConsoleColor]::Green
    Yellow = [ConsoleColor]::Yellow
    Blue = [ConsoleColor]::Blue
    White = [ConsoleColor]::White
}

# Test configuration
$BACKEND_DIR = "springboot1ngh61a2"
$FRONTEND_DIR = "$BACKEND_DIR\src\main\resources\front\front"
$ADMIN_DIR = "$BACKEND_DIR\src\main\resources\admin\admin"

# Test results
$TEST_RESULTS = @()
$TOTAL_TESTS = 0
$script:PASSED_TESTS = 0
$script:FAILED_TESTS = 0

# Logging functions
function Write-LogInfo {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [INFO] $Message"
    Write-Host $logMessage -ForegroundColor $Colors.Blue
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Write-LogWarn {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [WARN] $Message"
    Write-Host $logMessage -ForegroundColor $Colors.Yellow
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Write-LogError {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [ERROR] $Message"
    Write-Host $logMessage -ForegroundColor $Colors.Red
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Write-LogSuccess {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [SUCCESS] $Message"
    Write-Host $logMessage -ForegroundColor $Colors.Green
    Add-Content -Path $LOG_FILE -Value $logMessage
}

# Run backend unit tests
function Invoke-BackendUnitTests {
    Write-LogInfo "🏃 Running backend unit tests..."

    if (-not (Test-Path $BACKEND_DIR)) {
        Write-LogError "Backend directory not found: $BACKEND_DIR"
        return $false
    }

    Push-Location $BACKEND_DIR

    try {
        # Run Maven tests
        $process = Start-Process -FilePath "mvn" -ArgumentList "test", "-Dspring.profiles.active=test", "-q" -NoNewWindow -Wait -PassThru
        if ($process.ExitCode -eq 0) {
            Write-LogSuccess "Backend unit tests passed"
            $TEST_RESULTS += "backend_unit: PASSED"
            $script:PASSED_TESTS++
            $result = $true
        } else {
            Write-LogError "Backend unit tests failed"
            $TEST_RESULTS += "backend_unit: FAILED"
            $script:FAILED_TESTS++
            $result = $false
        }
    } catch {
        Write-LogError "Backend unit tests failed with exception: $($_.Exception.Message)"
        $TEST_RESULTS += "backend_unit: FAILED"
        $script:FAILED_TESTS++
        $result = $false
    }

    $script:TOTAL_TESTS++
    Pop-Location
    return $result
}

# Run frontend unit tests
function Invoke-FrontendUnitTests {
    param([string]$ProjectName, [string]$ProjectDir)

    Write-LogInfo "🏃 Running $ProjectName frontend unit tests..."

    if (-not (Test-Path $ProjectDir)) {
        Write-LogWarn "$ProjectName directory not found: $ProjectDir"
        return $true
    }

    Push-Location $ProjectDir

    try {
        # Install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-LogInfo "Installing dependencies for $ProjectName..."
            & npm ci
        }

        # Run unit tests
        $process = Start-Process -FilePath "npm" -ArgumentList "run", "test:unit" -NoNewWindow -Wait -PassThru
        if ($process.ExitCode -eq 0) {
            Write-LogSuccess "$ProjectName frontend unit tests passed"
            $TEST_RESULTS += "${ProjectName}_unit: PASSED"
            $script:PASSED_TESTS++
            $result = $true
        } else {
            Write-LogError "$ProjectName frontend unit tests failed"
            $TEST_RESULTS += "${ProjectName}_unit: FAILED"
            $script:FAILED_TESTS++
            $result = $false
        }
    } catch {
        Write-LogError "$ProjectName frontend unit tests failed with exception: $($_.Exception.Message)"
        $TEST_RESULTS += "${ProjectName}_unit: FAILED"
        $script:FAILED_TESTS++
        $result = $false
    }

    $script:TOTAL_TESTS++
    Pop-Location
    return $result
}

# Run integration tests
function Invoke-IntegrationTests {
    Write-LogInfo "🔗 Running integration tests..."

    # Start test environment with Docker Compose
    if (Test-Path "docker-compose.test.yml") {
        Write-LogInfo "Starting test environment..."

        try {
            # Clean up any existing containers
            & docker-compose -f docker-compose.test.yml down -v 2>$null

            # Start services
            $process = Start-Process -FilePath "docker-compose" -ArgumentList "-f", "docker-compose.test.yml", "up", "--abort-on-container-exit", "--timeout", "300" -NoNewWindow -Wait -PassThru
            if ($process.ExitCode -eq 0) {
                Write-LogSuccess "Integration tests passed"
                $TEST_RESULTS += "integration: PASSED"
                $script:PASSED_TESTS++
                $result = $true
            } else {
                Write-LogError "Integration tests failed"
                $TEST_RESULTS += "integration: FAILED"
                $script:FAILED_TESTS++
                $result = $false
            }

            # Clean up
            & docker-compose -f docker-compose.test.yml down -v 2>$null
        } catch {
            Write-LogError "Integration tests failed with exception: $($_.Exception.Message)"
            $TEST_RESULTS += "integration: FAILED"
            $script:FAILED_TESTS++
            $result = $false
        }
    } else {
        Write-LogWarn "Integration test configuration not found: docker-compose.test.yml"
        Write-LogInfo "Skipping integration tests"
        $TEST_RESULTS += "integration: SKIPPED"
        $result = $true
    }

    $script:TOTAL_TESTS++
    return $result
}

# Run E2E tests
function Invoke-E2ETests {
    Write-LogInfo "🌐 Running E2E tests..."

    # Check if npx is available
    try {
        $npxVersion = & npx --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            # Run E2E tests for frontend
            if (Test-Path $FRONTEND_DIR) {
                Push-Location $FRONTEND_DIR

                try {
                    $process = Start-Process -FilePath "npm" -ArgumentList "run", "test:e2e" -NoNewWindow -Wait -PassThru
                    if ($process.ExitCode -eq 0) {
                        Write-LogSuccess "Frontend E2E tests passed"
                        $TEST_RESULTS += "frontend_e2e: PASSED"
                        $script:PASSED_TESTS++
                    } else {
                        Write-LogError "Frontend E2E tests failed"
                        $TEST_RESULTS += "frontend_e2e: FAILED"
                        $script:FAILED_TESTS++
                    }
                } catch {
                    Write-LogError "Frontend E2E tests failed with exception: $($_.Exception.Message)"
                    $TEST_RESULTS += "frontend_e2e: FAILED"
                    $script:FAILED_TESTS++
                }

                Pop-Location
            }

            # Run E2E tests for admin
            if (Test-Path $ADMIN_DIR) {
                Push-Location $ADMIN_DIR

                try {
                    $process = Start-Process -FilePath "npm" -ArgumentList "run", "test:e2e" -NoNewWindow -Wait -PassThru
                    if ($process.ExitCode -eq 0) {
                        Write-LogSuccess "Admin E2E tests passed"
                        $TEST_RESULTS += "admin_e2e: PASSED"
                        $script:PASSED_TESTS++
                    } else {
                        Write-LogError "Admin E2E tests failed"
                        $TEST_RESULTS += "admin_e2e: FAILED"
                        $script:FAILED_TESTS++
                    }
                } catch {
                    Write-LogError "Admin E2E tests failed with exception: $($_.Exception.Message)"
                    $TEST_RESULTS += "admin_e2e: FAILED"
                    $script:FAILED_TESTS++
                }

                Pop-Location
            }
        } else {
            Write-LogWarn "E2E test tools not available (npx not found)"
            $TEST_RESULTS += "e2e: SKIPPED"
        }
    } catch {
        Write-LogWarn "E2E test tools not available"
        $TEST_RESULTS += "e2e: SKIPPED"
    }

    $script:TOTAL_TESTS++
}

# Run performance tests
function Invoke-PerformanceTests {
    Write-LogInfo "⚡ Running performance tests..."

    # Check if Artillery is available
    try {
        $artilleryVersion = & npx artillery --version 2>$null
        if (($LASTEXITCODE -eq 0) -and (Test-Path "artillery-config.yml")) {
            $process = Start-Process -FilePath "npx" -ArgumentList "artillery", "run", "--output", "performance-results.json", "artillery-config.yml" -NoNewWindow -Wait -PassThru
            if ($process.ExitCode -eq 0) {
                Write-LogSuccess "Performance tests passed"
                $TEST_RESULTS += "performance: PASSED"
                $script:PASSED_TESTS++
                $result = $true
            } else {
                Write-LogError "Performance tests failed"
                $TEST_RESULTS += "performance: FAILED"
                $script:FAILED_TESTS++
                $result = $false
            }
        } else {
            Write-LogWarn "Performance test configuration not found or Artillery not available"
            $TEST_RESULTS += "performance: SKIPPED"
            $result = $true
        }
    } catch {
        Write-LogWarn "Performance test tools not available"
        $TEST_RESULTS += "performance: SKIPPED"
        $result = $true
    }

    $script:TOTAL_TESTS++
    return $result
}

# Generate test report
function New-TestReport {
    Write-LogInfo "📊 Generating test report..."

    $reportFile = "test-report-$(Get-Date -Format 'yyyyMMdd_HHmmss').md"
    $successRate = if ($TOTAL_TESTS -gt 0) { [math]::Round(($script:PASSED_TESTS * 100) / $TOTAL_TESTS, 2) } else { 0 }

    $reportContent = @"
# 🧪 Fitness Gym System Test Report

**Generated**: $(Get-Date)
**Total Tests**: $TOTAL_TESTS
**Passed**: $($script:PASSED_TESTS)
**Failed**: $($script:FAILED_TESTS)
**Success Rate**: $successRate%

## Test Results

"@

    foreach ($result in $TEST_RESULTS) {
        $reportContent += "- $result`n"
    }

    $reportContent += @"

## Test Execution Details

**Backend Unit Tests**: $(& mvn --version 2>$null | Select-Object -First 1 | ForEach-Object { $_ -replace 'Apache Maven ', '' } | Out-String).Trim()
**Frontend Unit Tests**: $(& node --version 2>$null | Out-String).Trim()
**Integration Tests**: Docker Compose $(& docker-compose --version 2>$null | Out-String).Trim()
**E2E Tests**: $(& npx playwright --version 2>$null | Out-String).Trim()
**Performance Tests**: $(& npx artillery --version 2>$null | Out-String).Trim()

## Log File

Test execution log: $LOG_FILE

---
*Generated by automated test runner v$SCRIPT_VERSION*
"@

    $reportContent | Out-File -FilePath $reportFile -Encoding UTF8
    Write-LogInfo "Test report generated: $reportFile"
}

# Show help
function Show-Help {
    $helpText = @"
Automated Test Runner for Fitness Gym System v$SCRIPT_VERSION

Usage: .\run-tests.ps1 [Options]

Options:
    -Unit        Run only unit tests
    -Integration Run only integration tests
    -E2E         Run only E2E tests
    -Performance Run only performance tests
    -Help        Show this help message

If no options specified, runs all tests.

Examples:
    .\run-tests.ps1                      # Run all tests
    .\run-tests.ps1 -Unit               # Run only unit tests
    .\run-tests.ps1 -Integration        # Run only integration tests
    .\run-tests.ps1 -E2E                # Run only E2E tests
    .\run-tests.ps1 -Performance        # Run only performance tests
"@
    Write-Host $helpText
}

# Main function
function Invoke-Main {
    if ($Help) {
        Show-Help
        exit 0
    }

    Write-LogInfo "🚀 Starting Fitness Gym System Test Suite v$SCRIPT_VERSION"

    # Determine which tests to run
    $runAll = -not ($Unit -or $Integration -or $E2E -or $Performance)

    if ($runAll -or $Unit) {
        Invoke-BackendUnitTests
        Invoke-FrontendUnitTests "frontend" $FRONTEND_DIR
        Invoke-FrontendUnitTests "admin" $ADMIN_DIR
    }

    if ($runAll -or $Integration) {
        Invoke-IntegrationTests
    }

    if ($runAll -or $E2E) {
        Invoke-E2ETests
    }

    if ($runAll -or $Performance) {
        Invoke-PerformanceTests
    }

    # Generate report
    New-TestReport

    # Summary
    Write-LogInfo "🏁 Test execution completed"
    Write-LogInfo "Total: $TOTAL_TESTS, Passed: $($script:PASSED_TESTS), Failed: $($script:FAILED_TESTS)"

    if ($script:FAILED_TESTS -eq 0) {
        Write-LogSuccess "🎉 All tests passed!"
        exit 0
    } else {
        Write-LogError "❌ Some tests failed. Check the log file: $LOG_FILE"
        exit 1
    }
}

# Run main function
Invoke-Main
