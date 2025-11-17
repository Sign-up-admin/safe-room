# 数据库恢复脚本
# 支持从备份文件恢复PostgreSQL数据库

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,

    [Parameter(Mandatory=$false)]
    [string]$DatabaseName,

    [switch]$CreateDatabase,
    [switch]$DropExisting,
    [switch]$Decrypt,
    [string]$DecryptionKey,
    [switch]$VerifyOnly,
    [switch]$Help
)

# 配置
$SCRIPT_VERSION = "2.0.0"
$LOG_FILE = ".\restore-database_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# 数据库配置（从环境变量读取）
$DB_HOST = $env:DB_HOST ?? "localhost"
$DB_PORT = $env:DB_PORT ?? "5432"
$DB_NAME = $env:DB_NAME ?? "fitness_gym"
$DB_USER = $env:DB_USER ?? "postgres"
$DB_PASSWORD = $env:DB_PASSWORD ?? ""

# 如果指定了数据库名，使用指定的
if ($DatabaseName) {
    $DB_NAME = $DatabaseName
}

# 日志函数
function Write-LogInfo {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp [INFO] $Message"
    Write-Host $logMessage -ForegroundColor Green
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Write-LogWarn {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp [WARN] $Message"
    Write-Host $logMessage -ForegroundColor Yellow
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Write-LogError {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp [ERROR] $Message"
    Write-Host $logMessage -ForegroundColor Red
    Add-Content -Path $LOG_FILE -Value $logMessage
}

# 验证备份文件
function Test-BackupFile {
    param([string]$FilePath)

    Write-LogInfo "Validating backup file: $FilePath"

    if (-not (Test-Path $FilePath)) {
        Write-LogError "Backup file does not exist: $FilePath"
        return $false
    }

    $fileInfo = Get-Item $FilePath
    $fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)

    Write-LogInfo "Backup file size: $fileSizeMB MB"
    Write-LogInfo "Backup file modified: $($fileInfo.LastWriteTime)"

    # 检查文件是否可读
    try {
        $fileStream = [System.IO.File]::OpenRead($FilePath)
        $fileStream.Close()
        Write-LogInfo "Backup file is readable"
        return $true
    } catch {
        Write-LogError "Backup file is not readable: $_"
        return $false
    }
}

# 解密备份文件
function Unprotect-BackupFile {
    param([string]$FilePath, [string]$Key)

    if (-not $Key) {
        Write-LogWarn "No decryption key provided, assuming file is not encrypted"
        return $FilePath
    }

    $decryptedFilePath = $FilePath -replace '\.enc$', ''

    Write-LogInfo "Decrypting backup file: $FilePath"

    try {
        if (Get-Command openssl -ErrorAction SilentlyContinue) {
            $keyFile = [System.IO.Path]::GetTempFileName()
            $Key | Out-File -FilePath $keyFile -Encoding ASCII -NoNewline

            & openssl enc -d -aes-256-cbc -in $FilePath -out $decryptedFilePath -pass file:$keyFile 2>$null

            Remove-Item $keyFile -Force

            if ($LASTEXITCODE -eq 0) {
                Write-LogInfo "Decryption completed: $decryptedFilePath"
                return $decryptedFilePath
            } else {
                Write-LogError "Decryption failed"
                return $null
            }
        } else {
            Write-LogWarn "OpenSSL not found, cannot decrypt"
            return $null
        }
    } catch {
        Write-LogError "Decryption failed: $_"
        return $null
    }
}

# 测试数据库连接
function Test-DatabaseConnection {
    param([string]$TestDatabase = $DB_NAME)

    Write-LogInfo "Testing database connection..."

    try {
        $env:PGPASSWORD = $DB_PASSWORD
        $result = & pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER -d $TestDatabase 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-LogInfo "Database connection successful"
            return $true
        } else {
            Write-LogError "Database connection failed: $result"
            return $false
        }
    } catch {
        Write-LogError "Failed to test database connection: $_"
        return $false
    } finally {
        $env:PGPASSWORD = $null
    }
}

# 创建数据库
function New-Database {
    param([string]$DatabaseName)

    Write-LogInfo "Creating database: $DatabaseName"

    try {
        $env:PGPASSWORD = $DB_PASSWORD
        $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DatabaseName;" 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-LogInfo "Database created successfully"
            return $true
        } else {
            Write-LogError "Failed to create database: $result"
            return $false
        }
    } catch {
        Write-LogError "Failed to create database: $_"
        return $false
    } finally {
        $env:PGPASSWORD = $null
    }
}

# 删除现有数据库
function Remove-Database {
    param([string]$DatabaseName)

    Write-LogWarn "Dropping existing database: $DatabaseName"

    # 首先终止所有连接
    Write-LogInfo "Terminating active connections to database..."
    try {
        $env:PGPASSWORD = $DB_PASSWORD
        $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = '$DatabaseName' AND pid <> pg_backend_pid();
        " 2>&1
    } catch {
        Write-LogWarn "Failed to terminate connections: $_"
    } finally {
        $env:PGPASSWORD = $null
    }

    # 删除数据库
    try {
        $env:PGPASSWORD = $DB_PASSWORD
        $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DatabaseName;" 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-LogInfo "Database dropped successfully"
            return $true
        } else {
            Write-LogError "Failed to drop database: $result"
            return $false
        }
    } catch {
        Write-LogError "Failed to drop database: $_"
        return $false
    } finally {
        $env:PGPASSWORD = $null
    }
}

# 恢复数据库
function Restore-Database {
    param([string]$BackupFilePath, [string]$DatabaseName)

    Write-LogInfo "Starting database restore..."
    Write-LogInfo "Backup file: $BackupFilePath"
    Write-LogInfo "Target database: $DatabaseName"

    $startTime = Get-Date
    Write-LogInfo "Restore start time: $startTime"

    try {
        $env:PGPASSWORD = $DB_PASSWORD

        # pg_restore 参数说明：
        # -h: 主机
        # -p: 端口
        # -U: 用户名
        # -d: 数据库名
        # -c: 清理（删除现有对象）
        # -v: 详细输出
        # -F: 格式 (c = custom)

        $pgRestoreArgs = @(
            "-h", $DB_HOST,
            "-p", $DB_PORT,
            "-U", $DB_USER,
            "-d", $DatabaseName,
            "-c",       # clean (drop existing objects)
            "-v",       # verbose
            "-F", "c",  # custom format
            $BackupFilePath
        )

        Write-LogInfo "Executing: pg_restore $($pgRestoreArgs -join ' ')"
        $result = & pg_restore @pgRestoreArgs 2>&1

        if ($LASTEXITCODE -eq 0) {
            $endTime = Get-Date
            $duration = $endTime - $startTime

            Write-LogInfo "Database restore completed successfully"
            Write-LogInfo "Duration: $($duration.TotalSeconds) seconds"

            return @{
                Success = $true
                Duration = $duration.TotalSeconds
            }
        } else {
            Write-LogError "Database restore failed: $result"
            return @{
                Success = $false
                Error = $result
            }
        }
    } catch {
        Write-LogError "Database restore failed with exception: $_"
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    } finally {
        $env:PGPASSWORD = $null
    }
}

# 验证恢复结果
function Test-RestoreResult {
    param([string]$DatabaseName)

    Write-LogInfo "Verifying restore result..."

    $checks = @(
        @{
            Name = "Database exists"
            Query = "SELECT datname FROM pg_database WHERE datname = '$DatabaseName';"
            ExpectedRows = 1
        },
        @{
            Name = "Users table exists"
            Query = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';"
            ExpectedRows = 1
        },
        @{
            Name = "Users table has data"
            Query = "SELECT COUNT(*) FROM users;"
            MinRows = 0
        },
        @{
            Name = "Courses table exists"
            Query = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses';"
            ExpectedRows = 1
        },
        @{
            Name = "Orders table exists"
            Query = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders';"
            ExpectedRows = 1
        }
    )

    $allChecksPassed = $true

    foreach ($check in $checks) {
        try {
            $env:PGPASSWORD = $DB_PASSWORD
            $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DatabaseName -t -c $check.Query 2>$null

            if ($LASTEXITCODE -eq 0) {
                $rowCount = [int]($result.Trim())
                $expectedRows = $check.ExpectedRows ?? $check.MinRows ?? 0

                if ($check.ContainsKey('ExpectedRows') -and $rowCount -eq $expectedRows) {
                    Write-LogInfo "✅ $($check.Name): $rowCount rows (expected: $expectedRows)"
                } elseif ($check.ContainsKey('MinRows') -and $rowCount -ge $expectedRows) {
                    Write-LogInfo "✅ $($check.Name): $rowCount rows (minimum: $expectedRows)"
                } elseif (-not $check.ContainsKey('ExpectedRows') -and -not $check.ContainsKey('MinRows')) {
                    Write-LogInfo "✅ $($check.Name): Query executed successfully"
                } else {
                    Write-LogError "❌ $($check.Name): $rowCount rows (expected: $expectedRows)"
                    $allChecksPassed = $false
                }
            } else {
                Write-LogError "❌ $($check.Name): Query failed"
                $allChecksPassed = $false
            }
        } catch {
            Write-LogError "❌ $($check.Name): Exception occurred - $_"
            $allChecksPassed = $false
        } finally {
            $env:PGPASSWORD = $null
        }
    }

    return $allChecksPassed
}

# 生成恢复报告
function New-RestoreReport {
    param([hashtable]$RestoreResult)

    $reportPath = $LOG_FILE -replace '\.log$', '_report.json'

    $report = @{
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
        version = $SCRIPT_VERSION
        backup_file = $BackupFile
        database = @{
            host = $DB_HOST
            port = $DB_PORT
            name = $DB_NAME
            user = $DB_USER
        }
        options = @{
            create_database = $CreateDatabase
            drop_existing = $DropExisting
            decrypt = $Decrypt
            verify_only = $VerifyOnly
        }
        result = $RestoreResult
        log_file = $LOG_FILE
    }

    $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8

    Write-LogInfo "Restore report generated: $reportPath"
}

# 显示帮助信息
function Show-Help {
    $helpText = @"
Database Restore Script v$SCRIPT_VERSION

Usage: .\restore-database.ps1 -BackupFile <String> [Parameters]

Required Parameters:
    -BackupFile         Path to the backup file to restore

Optional Parameters:
    -DatabaseName       Target database name (default: from environment)
    -CreateDatabase     Create the database if it doesn't exist
    -DropExisting      Drop existing database before restore
    -Decrypt           Decrypt the backup file before restore
    -DecryptionKey     Key to decrypt the backup file
    -VerifyOnly        Only verify the backup file, don't restore
    -Help              Show this help

Environment Variables:
    DB_HOST             Database host (default: localhost)
    DB_PORT             Database port (default: 5432)
    DB_NAME             Database name (default: fitness_gym)
    DB_USER             Database user (default: postgres)
    DB_PASSWORD         Database password

Examples:
    # Basic restore
    .\restore-database.ps1 -BackupFile ".\backups\fitness_gym_db_backup_full_20251116.sql"

    # Restore to new database
    .\restore-database.ps1 -BackupFile ".\backups\fitness_gym_db_backup_full_20251116.sql" -DatabaseName "fitness_gym_restored"

    # Create database and restore
    .\restore-database.ps1 -BackupFile ".\backups\fitness_gym_db_backup_full_20251116.sql" -CreateDatabase

    # Drop existing and restore
    .\restore-database.ps1 -BackupFile ".\backups\fitness_gym_db_backup_full_20251116.sql" -DropExisting

    # Decrypt and restore
    .\restore-database.ps1 -BackupFile ".\backups\backup.sql.enc" -Decrypt -DecryptionKey "my-secret-key"

    # Only verify backup file
    .\restore-database.ps1 -BackupFile ".\backups\backup.sql" -VerifyOnly
"@
    Write-Host $helpText
}

# 主函数
function Invoke-Main {
    if ($Help) {
        Show-Help
        exit 0
    }

    Write-LogInfo "Starting database restore script v$SCRIPT_VERSION"
    Write-LogInfo "Backup file: $BackupFile"
    Write-LogInfo "Target database: $DB_NAME"

    # 验证备份文件
    if (-not (Test-BackupFile $BackupFile)) {
        Write-LogError "Backup file validation failed"
        exit 1
    }

    # 如果只是验证，则提前退出
    if ($VerifyOnly) {
        Write-LogInfo "Backup file verification completed successfully"
        exit 0
    }

    # 解密文件（如果需要）
    $workingFile = $BackupFile
    if ($Decrypt) {
        $workingFile = Unprotect-BackupFile $BackupFile $DecryptionKey
        if (-not $workingFile) {
            Write-LogError "Failed to decrypt backup file"
            exit 1
        }
    }

    # 测试数据库连接（连接到postgres数据库）
    if (-not (Test-DatabaseConnection "postgres")) {
        Write-LogError "Cannot connect to PostgreSQL server"
        exit 1
    }

    # 处理数据库创建/删除
    if ($DropExisting) {
        if (-not (Remove-Database $DB_NAME)) {
            Write-LogError "Failed to drop existing database"
            exit 1
        }
    }

    if ($CreateDatabase) {
        if (-not (New-Database $DB_NAME)) {
            Write-LogError "Failed to create database"
            exit 1
        }
    }

    # 测试目标数据库连接
    if (-not (Test-DatabaseConnection $DB_NAME)) {
        Write-LogError "Cannot connect to target database: $DB_NAME"
        exit 1
    }

    # 执行恢复
    $restoreResult = Restore-Database $workingFile $DB_NAME

    if (-not $restoreResult.Success) {
        Write-LogError "Database restore failed: $($restoreResult.Error)"
        New-RestoreReport $restoreResult
        exit 1
    }

    # 验证恢复结果
    Write-LogInfo "Verifying restore results..."
    $verificationPassed = Test-RestoreResult $DB_NAME

    if (-not $verificationPassed) {
        Write-LogWarn "Restore verification failed - some checks did not pass"
        $restoreResult.VerificationPassed = $false
    } else {
        Write-LogInfo "Restore verification passed"
        $restoreResult.VerificationPassed = $true
    }

    # 清理临时文件
    if ($Decrypt -and $workingFile -ne $BackupFile) {
        Write-LogInfo "Cleaning up decrypted temporary file: $workingFile"
        Remove-Item $workingFile -Force -ErrorAction SilentlyContinue
    }

    # 生成报告
    New-RestoreReport $restoreResult

    if ($verificationPassed) {
        Write-LogInfo "Database restore completed successfully"
        Write-LogInfo "Log file: $LOG_FILE"
        exit 0
    } else {
        Write-LogWarn "Database restore completed with verification warnings"
        Write-LogWarn "Please review the restore results manually"
        Write-LogWarn "Log file: $LOG_FILE"
        exit 1
    }
}

# 运行主函数
Invoke-Main
