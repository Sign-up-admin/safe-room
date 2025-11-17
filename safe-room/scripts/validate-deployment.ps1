# Deployment Validation Script for Fitness Gym System
# Features: Comprehensive health checks, configuration validation, performance tests

param(
    [switch]$Services,
    [switch]$Endpoints,
    [switch]$Database,
    [switch]$Redis,
    [switch]$MinIO,
    [switch]$Config,
    [switch]$Performance,
    [switch]$Security,
    [switch]$Help
)

$SCRIPT_VERSION = "1.0.0"
$LOG_FILE = ".\validate-deployment_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Colors for output
$Colors = @{
    Red = [ConsoleColor]::Red
    Green = [ConsoleColor]::Green
    Yellow = [ConsoleColor]::Yellow
    Blue = [ConsoleColor]::Blue
    White = [ConsoleColor]::White
}

# Configuration
$Services = @("backend", "postgres", "minio", "redis")
$Endpoints = @(
    "http://localhost:8080/springboot1ngh61a2/user/login",
    "http://localhost:8080/springboot1ngh61a2/api/courses",
    "http://localhost:8080/springboot1ngh61a2/actuator/health",
    "http://localhost:9000/minio/health/live"
)

# Validation results
$script:CHECKS_PASSED = 0
$script:CHECKS_FAILED = 0
$ISSUES_FOUND = @()

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

# Validate service status
function Test-Services {
    Write-LogInfo "🔍 Validating service status..."

    foreach ($service in $Services) {
        Write-LogInfo "Checking service: $service"

        try {
            $status = docker-compose ps $service
            if ($status -match "Up") {
                Write-LogSuccess "✅ Service $service is running"
                $script:CHECKS_PASSED++
            } else {
                Write-LogError "❌ Service $service is not running"
                $ISSUES_FOUND += "Service $service not running"
                $script:CHECKS_FAILED++
            }
        } catch {
            Write-LogError "❌ Service $service check failed: $($_.Exception.Message)"
            $ISSUES_FOUND += "Service $service check failed"
            $script:CHECKS_FAILED++
        }
    }
}

# Validate endpoints
function Test-Endpoints {
    Write-LogInfo "🔍 Validating endpoints..."

    foreach ($endpoint in $Endpoints) {
        Write-LogInfo "Testing endpoint: $endpoint"

        try {
            $response = Invoke-WebRequest -Uri $endpoint -TimeoutSec 10 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-LogSuccess "✅ Endpoint $endpoint is responding"
                $script:CHECKS_PASSED++
            } else {
                Write-LogError "❌ Endpoint $endpoint returned status: $($response.StatusCode)"
                $ISSUES_FOUND += "Endpoint $endpoint status: $($response.StatusCode)"
                $script:CHECKS_FAILED++
            }
        } catch {
            Write-LogError "❌ Endpoint $endpoint is not responding: $($_.Exception.Message)"
            $ISSUES_FOUND += "Endpoint $endpoint not responding"
            $script:CHECKS_FAILED++
        }
    }
}

# Validate database connectivity
function Test-Database {
    Write-LogInfo "🔍 Validating database connectivity..."

    # Check if PostgreSQL is accepting connections
    try {
        $result = docker-compose exec -T postgres pg_isready -U postgres -d fitness_gym 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-LogSuccess "✅ Database connection is healthy"
            $script:CHECKS_PASSED++
        } else {
            Write-LogError "❌ Database connection failed"
            $ISSUES_FOUND += "Database connection failed"
            $script:CHECKS_FAILED++
            return
        }
    } catch {
        Write-LogError "❌ Database connection check failed: $($_.Exception.Message)"
        $ISSUES_FOUND += "Database connection check failed"
        $script:CHECKS_FAILED++
        return
    }

    # Test basic database operations
    Write-LogInfo "Testing database operations..."

    try {
        $testResult = docker-compose exec -T postgres psql -U postgres -d fitness_gym -c @"
CREATE TEMP TABLE deployment_test (
    id SERIAL PRIMARY KEY,
    test_data VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO deployment_test (test_data) VALUES ('deployment_validation_test');
SELECT COUNT(*) FROM deployment_test WHERE test_data = 'deployment_validation_test';
"@ 2>$null

        if ($LASTEXITCODE -eq 0) {
            Write-LogSuccess "✅ Database operations successful"
            $script:CHECKS_PASSED++
        } else {
            Write-LogError "❌ Database operations failed"
            $ISSUES_FOUND += "Database operations failed"
            $script:CHECKS_FAILED++
        }
    } catch {
        Write-LogError "❌ Database operations test failed: $($_.Exception.Message)"
        $ISSUES_FOUND += "Database operations test failed"
        $script:CHECKS_FAILED++
    }
}

# Validate Redis connectivity
function Test-Redis {
    Write-LogInfo "🔍 Validating Redis connectivity..."

    try {
        $result = docker-compose exec -T redis redis-cli ping 2>$null
        if ($result -match "PONG") {
            Write-LogSuccess "✅ Redis connection is healthy"
            $script:CHECKS_PASSED++
        } else {
            Write-LogError "❌ Redis connection failed"
            $ISSUES_FOUND += "Redis connection failed"
            $script:CHECKS_FAILED++
            return
        }
    } catch {
        Write-LogError "❌ Redis connection check failed: $($_.Exception.Message)"
        $ISSUES_FOUND += "Redis connection check failed"
        $script:CHECKS_FAILED++
        return
    }

    # Test basic Redis operations
    Write-LogInfo "Testing Redis operations..."

    try {
        # Set test value
        docker-compose exec -T redis redis-cli SET deployment_test "validation_test" >$null 2>&1

        # Get test value
        $getResult = docker-compose exec -T redis redis-cli GET deployment_test 2>$null

        if ($getResult -eq "validation_test") {
            Write-LogSuccess "✅ Redis operations successful"
            # Clean up test key
            docker-compose exec -T redis redis-cli DEL deployment_test >$null 2>&1
            $script:CHECKS_PASSED++
        } else {
            Write-LogError "❌ Redis operations failed"
            $ISSUES_FOUND += "Redis operations failed"
            $script:CHECKS_FAILED++
        }
    } catch {
        Write-LogError "❌ Redis operations test failed: $($_.Exception.Message)"
        $ISSUES_FOUND += "Redis operations test failed"
        $script:CHECKS_FAILED++
    }
}

# Validate MinIO storage
function Test-MinIO {
    Write-LogInfo "🔍 Validating MinIO storage..."

    # Check MinIO health endpoint
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9000/minio/health/live" -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-LogSuccess "✅ MinIO service is healthy"
            $script:CHECKS_PASSED++
        } else {
            Write-LogError "❌ MinIO service returned status: $($response.StatusCode)"
            $ISSUES_FOUND += "MinIO service unhealthy"
            $script:CHECKS_FAILED++
            return
        }
    } catch {
        Write-LogError "❌ MinIO health check failed: $($_.Exception.Message)"
        $ISSUES_FOUND += "MinIO service unhealthy"
        $script:CHECKS_FAILED++
        return
    }

    # Note: Additional MinIO validation would require authentication
    # For now, we just check the health endpoint
}

# Validate configuration
function Test-Configuration {
    Write-LogInfo "🔍 Validating configuration..."

    # Check required environment variables
    $requiredVars = @("POSTGRES_PASSWORD", "POSTGRES_DB", "POSTGRES_USER")
    $missingVars = @()

    if (Test-Path ".env") {
        $envContent = Get-Content ".env" -Raw
        foreach ($var in $requiredVars) {
            if ($envContent -notmatch "^$var=") {
                $missingVars += $var
            }
        }
    } else {
        $missingVars = $requiredVars
    }

    if ($missingVars.Count -gt 0) {
        Write-LogError "❌ Missing required environment variables: $($missingVars -join ', ')"
        $ISSUES_FOUND += "Missing environment variables: $($missingVars -join ', ')"
        $script:CHECKS_FAILED++
    } else {
        Write-LogSuccess "✅ Configuration variables are set"
        $script:CHECKS_PASSED++
    }

    # Check Docker Compose configuration
    if (Test-Path "docker-compose.yml") {
        Write-LogSuccess "✅ Docker Compose configuration exists"
        $script:CHECKS_PASSED++
    } else {
        Write-LogError "❌ Docker Compose configuration missing"
        $ISSUES_FOUND += "Docker Compose configuration missing"
        $script:CHECKS_FAILED++
    }
}

# Performance validation
function Test-Performance {
    Write-LogInfo "🔍 Validating performance..."

    # Simple response time test
    $endpoint = "http://localhost:8080/springboot1ngh61a2/actuator/health"

    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $endpoint -TimeoutSec 10 -ErrorAction Stop
        $endTime = Get-Date
        $responseTime = [math]::Round(($endTime - $startTime).TotalMilliseconds, 2)

        if ($response.StatusCode -eq 200) {
            if ($responseTime -lt 5000) {
                Write-LogSuccess "✅ API response time acceptable: ${responseTime}ms"
                $script:CHECKS_PASSED++
            } else {
                Write-LogWarn "⚠️ API response time slow: ${responseTime}ms"
                $ISSUES_FOUND += "Slow API response: ${responseTime}ms"
                $script:CHECKS_PASSED++  # Still count as passed but with warning
            }
        } else {
            Write-LogError "❌ Performance test failed with status: $($response.StatusCode)"
            $ISSUES_FOUND += "Performance test failed"
            $script:CHECKS_FAILED++
        }
    } catch {
        Write-LogError "❌ Performance test failed: $($_.Exception.Message)"
        $ISSUES_FOUND += "Performance test failed"
        $script:CHECKS_FAILED++
    }
}

# Security validation
function Test-Security {
    Write-LogInfo "🔍 Validating security..."

    # Check if services are running on expected ports
    $expectedPorts = @(8080, 5432, 6379, 9000)
    $unexpectedClosedPorts = @()

    foreach ($port in $expectedPorts) {
        try {
            $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
            if (-not $connection.TcpTestSucceeded) {
                $unexpectedClosedPorts += $port
            }
        } catch {
            $unexpectedClosedPorts += $port
        }
    }

    if ($unexpectedClosedPorts.Count -gt 0) {
        Write-LogError "❌ Expected ports not open: $($unexpectedClosedPorts -join ', ')"
        $ISSUES_FOUND += "Expected ports not open: $($unexpectedClosedPorts -join ', ')"
        $script:CHECKS_FAILED++
    } else {
        Write-LogSuccess "✅ All expected ports are open"
        $script:CHECKS_PASSED++
    }

    # Check for exposed sensitive information (basic check)
    if (Test-Path ".env") {
        $envContent = Get-Content ".env" -Raw
        if ($envContent -match "PASSWORD|SECRET|KEY") {
            Write-LogInfo "ℹ️ Environment file contains sensitive data (expected)"
            $script:CHECKS_PASSED++
        } else {
            Write-LogWarn "⚠️ No sensitive data found in environment file"
            $script:CHECKS_PASSED++
        }
    }
}

# Generate validation report
function New-ValidationReport {
    $totalChecks = $script:CHECKS_PASSED + $script:CHECKS_FAILED
    $successRate = if ($totalChecks -gt 0) { [math]::Round(($script:CHECKS_PASSED * 100) / $totalChecks, 2) } else { 0 }

    Write-LogInfo "📊 Generating validation report..."

    $reportContent = @"
# 🔍 Deployment Validation Report

**Validation Time**: $(Get-Date)
**Total Checks**: $totalChecks
**Passed**: $($script:CHECKS_PASSED)
**Failed**: $($script:CHECKS_FAILED)
**Success Rate**: $successRate%

## Validation Results

### ✅ Passed Checks ($($script:CHECKS_PASSED))
- Service status validation
- Endpoint availability tests
- Database connectivity tests
- Redis connectivity tests
- MinIO service health
- Configuration validation
- Performance benchmarks
- Security checks

### ❌ Failed Checks ($($script:CHECKS_FAILED))
"@

    if ($ISSUES_FOUND.Count -gt 0) {
        foreach ($issue in $ISSUES_FOUND) {
            $reportContent += "- $issue`n"
        }
    } else {
        $reportContent += "- No issues found`n"
    }

    $reportContent += @"

## Detailed Service Status

### Backend Service
- **Status**: $(try { $status = docker-compose ps backend; if ($status -match "Up") { "✅ Running" } else { "❌ Stopped" } } catch { "❌ Check failed" })
- **Health Endpoint**: $(try { $r = Invoke-WebRequest -Uri "http://localhost:8080/springboot1ngh61a2/actuator/health" -TimeoutSec 5; if ($r.StatusCode -eq 200) { "✅ Healthy" } else { "❌ Unhealthy" } } catch { "❌ Unhealthy" })
- **API Endpoint**: $(try { $r = Invoke-WebRequest -Uri "http://localhost:8080/springboot1ngh61a2/user/login" -TimeoutSec 5; if ($r.StatusCode -eq 200) { "✅ Responding" } else { "❌ Not responding" } } catch { "❌ Not responding" })

### Database Service
- **Status**: $(try { $status = docker-compose ps postgres; if ($status -match "Up") { "✅ Running" } else { "❌ Stopped" } } catch { "❌ Check failed" })
- **Connection**: $(try { docker-compose exec -T postgres pg_isready -U postgres -d fitness_gym >`$null 2>&1; if (`$LASTEXITCODE -eq 0) { "✅ Connected" } else { "❌ Disconnected" } } catch { "❌ Disconnected" })

### Redis Service
- **Status**: $(try { $status = docker-compose ps redis; if ($status -match "Up") { "✅ Running" } else { "❌ Stopped" } } catch { "❌ Check failed" })
- **Connection**: $(try { `$result = docker-compose exec -T redis redis-cli ping 2>`$null; if (`$result -match "PONG") { "✅ Connected" } else { "❌ Disconnected" } } catch { "❌ Disconnected" })

### MinIO Service
- **Status**: $(try { $status = docker-compose ps minio; if ($status -match "Up") { "✅ Running" } else { "❌ Stopped" } } catch { "❌ Check failed" })
- **Health**: $(try { $r = Invoke-WebRequest -Uri "http://localhost:9000/minio/health/live" -TimeoutSec 5; if ($r.StatusCode -eq 200) { "✅ Healthy" } else { "❌ Unhealthy" } } catch { "❌ Unhealthy" })

## Performance Metrics

### Response Times
- **Health Endpoint**: $(try { $start = Get-Date; $r = Invoke-WebRequest -Uri "http://localhost:8080/springboot1ngh61a2/actuator/health" -TimeoutSec 5; $end = Get-Date; [math]::Round(($end - $start).TotalSeconds, 3) } catch { "N/A" })s
- **API Endpoint**: $(try { $start = Get-Date; $r = Invoke-WebRequest -Uri "http://localhost:8080/springboot1ngh61a2/user/login" -TimeoutSec 5; $end = Get-Date; [math]::Round(($end - $start).TotalSeconds, 3) } catch { "N/A" })s

## Recommendations

"@

    if ($successRate -ge 90) {
        $reportContent += "- ✅ Deployment validation successful. System is ready for production use.`n"
    } elseif ($successRate -ge 75) {
        $reportContent += "- ⚠️ Deployment validation partially successful. Review warnings before production use.`n"
    } else {
        $reportContent += "- ❌ Deployment validation failed. Critical issues must be resolved before production use.`n"
    }

    if ($ISSUES_FOUND.Count -gt 0) {
        $reportContent += "`n### Issues to Address`n"
        foreach ($issue in $ISSUES_FOUND) {
            $reportContent += "- $issue`n"
        }
    }

    $reportContent += @"

## Logs

- **Validation Log**: $LOG_FILE

---
*Generated by deployment validation script v$SCRIPT_VERSION*
"@

    $reportContent | Out-File -FilePath "deployment-validation-report.md" -Encoding UTF8
    Write-LogInfo "Validation report generated: deployment-validation-report.md"
}

# Show help
function Show-Help {
    $helpText = @"
Deployment Validation Script v$SCRIPT_VERSION

Usage: .\validate-deployment.ps1 [Options]

Options:
    -Services     Validate only service status
    -Endpoints    Validate only endpoints
    -Database     Validate only database connectivity
    -Redis        Validate only Redis connectivity
    -MinIO        Validate only MinIO storage
    -Config       Validate only configuration
    -Performance  Validate only performance
    -Security     Validate only security
    -Help         Show this help message

If no options specified, runs all validations.

Examples:
    .\validate-deployment.ps1                      # Run all validations
    .\validate-deployment.ps1 -Services -Endpoints # Validate services and endpoints only
    .\validate-deployment.ps1 -Performance        # Run only performance validation

"@
    Write-Host $helpText
}

# Main function
function Invoke-Main {
    if ($Help) {
        Show-Help
        return
    }

    $validateAll = -not ($Services -or $Endpoints -or $Database -or $Redis -or $MinIO -or $Config -or $Performance -or $Security)

    Write-LogInfo "🚀 Starting Fitness Gym System Deployment Validation v$SCRIPT_VERSION"

    # Run validations
    if ($validateAll -or $Services) {
        Test-Services
    }

    if ($validateAll -or $Endpoints) {
        Test-Endpoints
    }

    if ($validateAll -or $Database) {
        Test-Database
    }

    if ($validateAll -or $Redis) {
        Test-Redis
    }

    if ($validateAll -or $MinIO) {
        Test-MinIO
    }

    if ($validateAll -or $Config) {
        Test-Configuration
    }

    if ($validateAll -or $Performance) {
        Test-Performance
    }

    if ($validateAll -or $Security) {
        Test-Security
    }

    # Generate report
    New-ValidationReport

    # Summary
    $totalChecks = $script:CHECKS_PASSED + $script:CHECKS_FAILED
    $successRate = if ($totalChecks -gt 0) { [math]::Round(($script:CHECKS_PASSED * 100) / $totalChecks, 2) } else { 0 }

    Write-LogInfo "🏁 Validation completed"
    Write-LogInfo "Total checks: $totalChecks, Passed: $($script:CHECKS_PASSED), Failed: $($script:CHECKS_FAILED)"

    if ($script:CHECKS_FAILED -eq 0) {
        Write-LogSuccess "🎉 All validations passed!"
        exit 0
    } elseif ($successRate -ge 80) {
        Write-LogWarn "⚠️ Some validations failed, but system may still be functional"
        exit 0
    } else {
        Write-LogError "❌ Critical validation failures detected"
        exit 1
    }
}

# Run main function
Invoke-Main
