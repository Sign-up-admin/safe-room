# 数据库备份脚本
# 支持PostgreSQL数据库的完整备份和增量备份

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("full", "incremental")]
    [string]$BackupType = "full",

    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".\backups",

    [Parameter(Mandatory=$false)]
    [string]$RetentionDays = "30",

    [switch]$Compress,
    [switch]$Encrypt,
    [string]$EncryptionKey,
    [switch]$UploadToS3,
    [string]$S3Bucket,
    [string]$S3Path,
    [switch]$Help
)

# 配置
$SCRIPT_VERSION = "2.0.0"
$LOG_FILE = ".\backup-database_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$BACKUP_PREFIX = "fitness_gym_db_backup"
$TIMESTAMP = Get-Date -Format 'yyyyMMdd_HHmmss'

# 数据库配置（从环境变量读取）
$DB_HOST = $env:DB_HOST ?? "localhost"
$DB_PORT = $env:DB_PORT ?? "5432"
$DB_NAME = $env:DB_NAME ?? "fitness_gym"
$DB_USER = $env:DB_USER ?? "postgres"
$DB_PASSWORD = $env:DB_PASSWORD ?? ""

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

# 测试数据库连接
function Test-DatabaseConnection {
    Write-LogInfo "Testing database connection..."

    try {
        $env:PGPASSWORD = $DB_PASSWORD
        $result = & pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME 2>&1
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

# 创建备份目录
function New-BackupDirectory {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-LogInfo "Created backup directory: $Path"
    }
}

# 执行完整备份
function Invoke-FullBackup {
    param([string]$OutputDir)

    Write-LogInfo "Starting full database backup..."

    $backupFileName = "${BACKUP_PREFIX}_full_${TIMESTAMP}.sql"
    $backupFilePath = Join-Path $OutputDir $backupFileName

    $startTime = Get-Date
    Write-LogInfo "Backup start time: $startTime"

    try {
        $env:PGPASSWORD = $DB_PASSWORD

        # pg_dump 参数说明：
        # -h: 主机
        # -p: 端口
        # -U: 用户名
        # -d: 数据库名
        # -F: 格式 (c = custom, p = plain text)
        # -b: 包含大对象
        # -v: 详细输出
        # -f: 输出文件

        $pgDumpArgs = @(
            "-h", $DB_HOST,
            "-p", $DB_PORT,
            "-U", $DB_USER,
            "-d", $DB_NAME,
            "-F", "c",  # custom format (compressed)
            "-b",       # include large objects
            "-v",       # verbose
            "-f", $backupFilePath
        )

        Write-LogInfo "Executing: pg_dump $($pgDumpArgs -join ' ')"
        $result = & pg_dump @pgDumpArgs 2>&1

        if ($LASTEXITCODE -eq 0) {
            $endTime = Get-Date
            $duration = $endTime - $startTime

            $fileSize = (Get-Item $backupFilePath).Length
            $fileSizeMB = [math]::Round($fileSize / 1MB, 2)

            Write-LogInfo "Full backup completed successfully"
            Write-LogInfo "Backup file: $backupFilePath"
            Write-LogInfo "File size: $fileSizeMB MB"
            Write-LogInfo "Duration: $($duration.TotalSeconds) seconds"

            return @{
                Success = $true
                FilePath = $backupFilePath
                FileSize = $fileSize
                Duration = $duration.TotalSeconds
                BackupType = "full"
            }
        } else {
            Write-LogError "Full backup failed: $result"
            return @{
                Success = $false
                Error = $result
            }
        }
    } catch {
        Write-LogError "Full backup failed with exception: $_"
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    } finally {
        $env:PGPASSWORD = $null
    }
}

# 执行增量备份（基于WAL归档）
function Invoke-IncrementalBackup {
    param([string]$OutputDir)

    Write-LogInfo "Starting incremental database backup..."

    # 检查是否启用了WAL归档
    $walArchiveDir = Join-Path $OutputDir "wal_archive"
    New-BackupDirectory $walArchiveDir

    # 对于增量备份，我们需要：
    # 1. 确保WAL归档已启用
    # 2. 创建基础备份
    # 3. 持续归档WAL文件

    Write-LogWarn "Incremental backup requires WAL archiving to be enabled"
    Write-LogWarn "This is a simplified implementation. For production use,"
    Write-LogWarn "consider using tools like pgBackRest, Barman, or WAL-G"

    # 创建一个标记文件表示增量备份
    $backupFileName = "${BACKUP_PREFIX}_incremental_${TIMESTAMP}.marker"
    $backupFilePath = Join-Path $OutputDir $backupFileName

    $backupInfo = @"
Incremental Backup Marker
Timestamp: $TIMESTAMP
Type: WAL-based incremental backup
Note: This is a placeholder. Implement proper incremental backup logic.
"@

    $backupInfo | Out-File -FilePath $backupFilePath -Encoding UTF8

    Write-LogInfo "Incremental backup marker created: $backupFilePath"

    return @{
        Success = $true
        FilePath = $backupFilePath
        BackupType = "incremental"
        Note = "Marker file created - implement proper incremental backup"
    }
}

# 压缩备份文件
function Compress-BackupFile {
    param([string]$FilePath)

    $compressedFilePath = "$FilePath.gz"

    Write-LogInfo "Compressing backup file: $FilePath"

    try {
        # 使用7zip或gzip压缩（如果可用）
        if (Get-Command 7z -ErrorAction SilentlyContinue) {
            & 7z a -tgzip $compressedFilePath $FilePath | Out-Null
        } elseif (Get-Command gzip -ErrorAction SilentlyContinue) {
            & gzip -c $FilePath > $compressedFilePath
        } else {
            Write-LogWarn "No compression tool found, skipping compression"
            return $FilePath
        }

        # 删除原始文件
        Remove-Item $FilePath -Force

        $compressedSize = (Get-Item $compressedFilePath).Length
        $compressionRatio = [math]::Round(((Get-Item $compressedFilePath).Length / $compressedSize) * 100, 2)

        Write-LogInfo "Compression completed: $compressedFilePath (${compressionRatio}% of original)"

        return $compressedFilePath
    } catch {
        Write-LogError "Compression failed: $_"
        return $FilePath
    }
}

# 加密备份文件
function Protect-BackupFile {
    param([string]$FilePath, [string]$Key)

    if (-not $Key) {
        Write-LogWarn "No encryption key provided, skipping encryption"
        return $FilePath
    }

    $encryptedFilePath = "$FilePath.enc"

    Write-LogInfo "Encrypting backup file: $FilePath"

    try {
        # 使用OpenSSL加密（如果可用）
        if (Get-Command openssl -ErrorAction SilentlyContinue) {
            $keyFile = [System.IO.Path]::GetTempFileName()
            $Key | Out-File -FilePath $keyFile -Encoding ASCII -NoNewline

            & openssl enc -aes-256-cbc -salt -in $FilePath -out $encryptedFilePath -pass file:$keyFile 2>$null

            Remove-Item $keyFile -Force

            if ($LASTEXITCODE -eq 0) {
                Remove-Item $FilePath -Force
                Write-LogInfo "Encryption completed: $encryptedFilePath"
                return $encryptedFilePath
            } else {
                Write-LogError "Encryption failed"
                return $FilePath
            }
        } else {
            Write-LogWarn "OpenSSL not found, skipping encryption"
            return $FilePath
        }
    } catch {
        Write-LogError "Encryption failed: $_"
        return $FilePath
    }
}

# 上传到S3
function Send-BackupToS3 {
    param([string]$FilePath, [string]$Bucket, [string]$Key)

    if (-not $Bucket) {
        Write-LogWarn "No S3 bucket specified, skipping upload"
        return $false
    }

    Write-LogInfo "Uploading backup to S3: s3://$Bucket/$Key"

    try {
        # 使用AWS CLI上传（如果可用）
        if (Get-Command aws -ErrorAction SilentlyContinue) {
            $result = & aws s3 cp $FilePath "s3://$Bucket/$Key" 2>&1

            if ($LASTEXITCODE -eq 0) {
                Write-LogInfo "Upload to S3 completed successfully"
                return $true
            } else {
                Write-LogError "Upload to S3 failed: $result"
                return $false
            }
        } else {
            Write-LogWarn "AWS CLI not found, skipping S3 upload"
            return $false
        }
    } catch {
        Write-LogError "Upload to S3 failed: $_"
        return $false
    }
}

# 清理旧备份
function Clear-OldBackups {
    param([string]$BackupDir, [int]$RetentionDays)

    Write-LogInfo "Cleaning up old backups (retention: ${RetentionDays} days)..."

    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)

    $oldBackups = Get-ChildItem $BackupDir -File |
        Where-Object { $_.LastWriteTime -lt $cutoffDate -and $_.Name -like "${BACKUP_PREFIX}*" }

    foreach ($backup in $oldBackups) {
        Write-LogInfo "Removing old backup: $($backup.FullName)"
        Remove-Item $backup.FullName -Force
    }

    $removedCount = $oldBackups.Count
    Write-LogInfo "Cleaned up $removedCount old backup files"
}

# 生成备份报告
function New-BackupReport {
    param([hashtable]$BackupResult)

    $reportPath = $LOG_FILE -replace '\.log$', '_report.json'

    $report = @{
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
        version = $SCRIPT_VERSION
        backup_type = $BackupType
        database = @{
            host = $DB_HOST
            port = $DB_PORT
            name = $DB_NAME
            user = $DB_USER
        }
        result = $BackupResult
        log_file = $LOG_FILE
    }

    $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8

    Write-LogInfo "Backup report generated: $reportPath"
}

# 显示帮助信息
function Show-Help {
    $helpText = @"
Database Backup Script v$SCRIPT_VERSION

Usage: .\backup-database.ps1 [-BackupType] <String> [Parameters]

Parameters:
    -BackupType          Backup type: full or incremental (default: full)
    -OutputPath          Output directory for backups (default: .\backups)
    -RetentionDays       Days to keep old backups (default: 30)
    -Compress            Compress the backup file
    -Encrypt             Encrypt the backup file
    -EncryptionKey       Encryption key for backup file
    -UploadToS3          Upload backup to S3
    -S3Bucket           S3 bucket name
    -S3Path             S3 path/key for upload
    -Help               Show this help

Environment Variables:
    DB_HOST              Database host (default: localhost)
    DB_PORT              Database port (default: 5432)
    DB_NAME              Database name (default: fitness_gym)
    DB_USER              Database user (default: postgres)
    DB_PASSWORD          Database password

Examples:
    # Full backup
    .\backup-database.ps1

    # Incremental backup with compression
    .\backup-database.ps1 -BackupType incremental -Compress

    # Encrypted backup uploaded to S3
    .\backup-database.ps1 -Encrypt -EncryptionKey "my-secret-key" -UploadToS3 -S3Bucket "my-backups"

    # Custom output directory
    .\backup-database.ps1 -OutputPath "D:\backups" -RetentionDays 7
"@
    Write-Host $helpText
}

# 主函数
function Invoke-Main {
    if ($Help) {
        Show-Help
        exit 0
    }

    Write-LogInfo "Starting database backup script v$SCRIPT_VERSION"
    Write-LogInfo "Backup type: $BackupType"
    Write-LogInfo "Output path: $OutputPath"

    # 测试数据库连接
    if (-not (Test-DatabaseConnection)) {
        Write-LogError "Database connection test failed, aborting backup"
        exit 1
    }

    # 创建备份目录
    New-BackupDirectory $OutputPath

    # 执行备份
    $backupResult = $null
    switch ($BackupType) {
        "full" {
            $backupResult = Invoke-FullBackup $OutputPath
        }
        "incremental" {
            $backupResult = Invoke-IncrementalBackup $OutputPath
        }
    }

    if (-not $backupResult.Success) {
        Write-LogError "Backup failed: $($backupResult.Error)"
        New-BackupReport $backupResult
        exit 1
    }

    $backupFilePath = $backupResult.FilePath

    # 压缩
    if ($Compress) {
        $backupFilePath = Compress-BackupFile $backupFilePath
    }

    # 加密
    if ($Encrypt) {
        $backupFilePath = Protect-BackupFile $backupFilePath $EncryptionKey
    }

    # 上传到S3
    if ($UploadToS3) {
        $s3Key = $S3Path ?? "database-backups/$(Split-Path $backupFilePath -Leaf)"
        Send-BackupToS3 $backupFilePath $S3Bucket $s3Key
    }

    # 清理旧备份
    Clear-OldBackups $OutputPath $RetentionDays

    # 生成报告
    New-BackupReport $backupResult

    Write-LogInfo "Database backup completed successfully"
    Write-LogInfo "Backup file: $backupFilePath"
    Write-LogInfo "Log file: $LOG_FILE"
}

# 运行主函数
Invoke-Main
