# 备份监控脚本
# 监控备份任务的执行状态和备份文件完整性

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupDir = ".\backups",

    [Parameter(Mandatory=$false)]
    [int]$MaxAgeHours = 24,

    [Parameter(Mandatory=$false)]
    [int]$MinBackupSizeMB = 1,

    [switch]$SendNotifications,
    [string]$SlackWebhookUrl,
    [switch]$GenerateReport,
    [switch]$Help
)

# 配置
$SCRIPT_VERSION = "2.0.0"
$LOG_FILE = ".\backup-monitor_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$REPORT_FILE = ".\backup-monitor-report_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"

# 监控阈值
$WARNING_THRESHOLDS = @{
    MaxAgeHours = $MaxAgeHours
    MinBackupSizeMB = $MinBackupSizeMB
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

# 发送Slack通知
function Send-SlackNotification {
    param([string]$Message, [string]$Color = "good")

    if (-not $SlackWebhookUrl) {
        Write-LogWarn "Slack webhook URL not configured, skipping notification"
        return
    }

    $payload = @{
        attachments = @(
            @{
                color = $Color
                text = $Message
                footer = "Backup Monitor"
                ts = [int](Get-Date -UFormat %s)
            }
        )
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri $SlackWebhookUrl -Method Post -Body $payload -ContentType 'application/json' | Out-Null
        Write-LogInfo "Slack notification sent"
    } catch {
        Write-LogError "Failed to send Slack notification: $_"
    }
}

# 检查备份目录
function Test-BackupDirectory {
    param([string]$Path)

    Write-LogInfo "Checking backup directory: $Path"

    if (-not (Test-Path $Path)) {
        Write-LogError "Backup directory does not exist: $Path"
        return $false
    }

    $directoryInfo = Get-Item $Path

    Write-LogInfo "Backup directory exists: $($directoryInfo.FullName)"
    Write-LogInfo "Last modified: $($directoryInfo.LastWriteTime)"

    return $true
}

# 分析备份文件
function Get-BackupAnalysis {
    param([string]$BackupDir)

    Write-LogInfo "Analyzing backup files in: $BackupDir"

    $backupFiles = Get-ChildItem $BackupDir -File | Where-Object {
        $_.Name -match ".*_backup_.*\.(sql|dump|bak|gz|enc)$"
    }

    $analysis = @{
        TotalFiles = $backupFiles.Count
        TotalSize = 0
        FilesByType = @{}
        FilesByDate = @{}
        LatestBackup = $null
        OldestBackup = $null
        Issues = @()
    }

    foreach ($file in $backupFiles) {
        # 计算总大小
        $analysis.TotalSize += $file.Length

        # 按类型分类
        $extension = $file.Extension.TrimStart('.')
        if (-not $analysis.FilesByType.ContainsKey($extension)) {
            $analysis.FilesByType[$extension] = @()
        }
        $analysis.FilesByType[$extension] += $file

        # 按日期分组
        $dateKey = $file.LastWriteTime.ToString("yyyy-MM-dd")
        if (-not $analysis.FilesByDate.ContainsKey($dateKey)) {
            $analysis.FilesByDate[$dateKey] = @()
        }
        $analysis.FilesByDate[$dateKey] += $file

        # 最新和最旧备份
        if (-not $analysis.LatestBackup -or $file.LastWriteTime -gt $analysis.LatestBackup.LastWriteTime) {
            $analysis.LatestBackup = $file
        }
        if (-not $analysis.OldestBackup -or $file.LastWriteTime -lt $analysis.OldestBackup.LastWriteTime) {
            $analysis.OldestBackup = $file
        }
    }

    # 检查问题
    $analysis.Issues = Get-BackupIssues $backupFiles

    return $analysis
}

# 检查备份问题
function Get-BackupIssues {
    param([array]$BackupFiles)

    $issues = @()

    # 检查是否有备份文件
    if ($BackupFiles.Count -eq 0) {
        $issues += @{
            Type = "Critical"
            Message = "No backup files found"
            Recommendation = "Check backup job configuration and execution"
        }
        return $issues
    }

    # 检查最新备份时间
    $latestBackup = $BackupFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $hoursSinceLatest = (Get-Date) - $latestBackup.LastWriteTime
    $hoursSinceLatestTotal = $hoursSinceLatest.TotalHours

    if ($hoursSinceLatestTotal -gt $WARNING_THRESHOLDS.MaxAgeHours) {
        $issues += @{
            Type = "Warning"
            Message = "Latest backup is $($hoursSinceLatestTotal.ToString("F1")) hours old"
            Recommendation = "Check backup job schedule and execution status"
        }
    }

    # 检查备份文件大小
    foreach ($file in $BackupFiles) {
        $sizeMB = $file.Length / 1MB
        if ($sizeMB -lt $WARNING_THRESHOLDS.MinBackupSizeMB) {
            $issues += @{
                Type = "Warning"
                Message = "Backup file '$($file.Name)' is unusually small: $($sizeMB.ToString("F2")) MB"
                Recommendation = "Verify backup integrity and check for incomplete backups"
            }
        }
    }

    # 检查文件完整性（尝试读取文件头）
    foreach ($file in $BackupFiles | Where-Object { $_.Extension -in @('.sql', '.dump', '.bak') }) {
        try {
            $stream = [System.IO.File]::OpenRead($file.FullName)
            $buffer = New-Object byte[] 1024
            $bytesRead = $stream.Read($buffer, 0, 1024)
            $stream.Close()

            # 检查文件是否为空或损坏
            if ($bytesRead -eq 0) {
                $issues += @{
                    Type = "Critical"
                    Message = "Backup file '$($file.Name)' appears to be empty"
                    Recommendation = "Regenerate the backup file"
                }
            }
        } catch {
            $issues += @{
                Type = "Error"
                Message = "Cannot read backup file '$($file.Name)': $_"
                Recommendation = "Check file permissions and integrity"
            }
        }
    }

    # 检查备份频率
    $datesWithBackups = $BackupFiles | Select-Object -ExpandProperty LastWriteTime | Select-Object -Unique | Sort-Object
    if ($datesWithBackups.Count -lt 7) {
        $issues += @{
            Type = "Info"
            Message = "Only $($datesWithBackups.Count) days with backups in the last period"
            Recommendation = "Consider increasing backup frequency"
        }
    }

    return $issues
}

# 生成监控报告
function New-MonitorReport {
    param([hashtable]$Analysis)

    $report = @{
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
        version = $SCRIPT_VERSION
        backup_directory = $BackupDir
        thresholds = $WARNING_THRESHOLDS
        analysis = @{
            total_files = $Analysis.TotalFiles
            total_size_mb = [math]::Round($Analysis.TotalSize / 1MB, 2)
            files_by_type = $Analysis.FilesByType.Keys | ForEach-Object {
                @{
                    type = $_
                    count = $Analysis.FilesByType[$_].Count
                    total_size_mb = [math]::Round(($Analysis.FilesByType[$_] | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
                }
            }
            files_by_date = $Analysis.FilesByDate.Keys | Sort-Object -Descending | ForEach-Object {
                @{
                    date = $_
                    count = $Analysis.FilesByDate[$_].Count
                }
            }
            latest_backup = $null
            oldest_backup = $null
        }
        issues = $Analysis.Issues
        recommendations = @()
    }

    # 添加最新和最旧备份信息
    if ($Analysis.LatestBackup) {
        $report.analysis.latest_backup = @{
            name = $Analysis.LatestBackup.Name
            size_mb = [math]::Round($Analysis.LatestBackup.Length / 1MB, 2)
            modified = $Analysis.LatestBackup.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
            age_hours = [math]::Round(((Get-Date) - $Analysis.LatestBackup.LastWriteTime).TotalHours, 1)
        }
    }

    if ($Analysis.OldestBackup) {
        $report.analysis.oldest_backup = @{
            name = $Analysis.OldestBackup.Name
            size_mb = [math]::Round($Analysis.OldestBackup.Length / 1MB, 2)
            modified = $Analysis.OldestBackup.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        }
    }

    # 生成建议
    if ($Analysis.Issues.Count -gt 0) {
        $criticalIssues = $Analysis.Issues | Where-Object { $_.Type -eq "Critical" }
        $warningIssues = $Analysis.Issues | Where-Object { $_.Type -eq "Warning" }

        if ($criticalIssues.Count -gt 0) {
            $report.recommendations += "Address $($criticalIssues.Count) critical issues immediately"
        }

        if ($warningIssues.Count -gt 0) {
            $report.recommendations += "Review $($warningIssues.Count) warning issues"
        }
    }

    if ($Analysis.TotalFiles -eq 0) {
        $report.recommendations += "Configure automated backup jobs"
    }

    if ($report.analysis.total_size_mb -gt 1000) {
        $report.recommendations += "Consider implementing backup rotation policy"
    }

    return $report
}

# 显示摘要信息
function Show-Summary {
    param([hashtable]$Analysis, [hashtable]$Report)

    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Backup Monitor Summary" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Backup Directory: $BackupDir" -ForegroundColor White
    Write-Host "Total Files: $($Analysis.TotalFiles)" -ForegroundColor White
    Write-Host "Total Size: $([math]::Round($Analysis.TotalSize / 1MB, 2)) MB" -ForegroundColor White

    if ($Analysis.LatestBackup) {
        Write-Host "Latest Backup: $($Analysis.LatestBackup.Name)" -ForegroundColor White
        Write-Host "Last Modified: $($Analysis.LatestBackup.LastWriteTime)" -ForegroundColor White
    }

    Write-Host ""
    Write-Host "Issues Found: $($Analysis.Issues.Count)" -ForegroundColor Yellow

    foreach ($issue in $Analysis.Issues) {
        $color = switch ($issue.Type) {
            "Critical" { "Red" }
            "Warning" { "Yellow" }
            "Error" { "Red" }
            "Info" { "Cyan" }
            default { "White" }
        }
        Write-Host "  [$($issue.Type)] $($issue.Message)" -ForegroundColor $color
    }

    if ($Report.recommendations.Count -gt 0) {
        Write-Host ""
        Write-Host "Recommendations:" -ForegroundColor Green
        foreach ($rec in $Report.recommendations) {
            Write-Host "  • $rec" -ForegroundColor Green
        }
    }

    Write-Host ""
    Write-Host "Log File: $LOG_FILE" -ForegroundColor Gray
    if ($GenerateReport) {
        Write-Host "Report File: $REPORT_FILE" -ForegroundColor Gray
    }
}

# 发送通知
function Send-Notifications {
    param([hashtable]$Analysis)

    if (-not $SendNotifications) {
        return
    }

    $criticalIssues = $Analysis.Issues | Where-Object { $_.Type -eq "Critical" }
    $warningIssues = $Analysis.Issues | Where-Object { $_.Type -eq "Warning" }

    # 构建通知消息
    $message = "*Backup Monitor Report*`n"
    $message += "Directory: $BackupDir`n"
    $message += "Total Files: $($Analysis.TotalFiles)`n"

    if ($Analysis.LatestBackup) {
        $age = [math]::Round(((Get-Date) - $Analysis.LatestBackup.LastWriteTime).TotalHours, 1)
        $message += "Latest Backup: $($Analysis.LatestBackup.Name) ($age hours ago)`n"
    }

    $color = "good"

    if ($criticalIssues.Count -gt 0) {
        $message += "`n🚨 *Critical Issues:* $($criticalIssues.Count)`n"
        foreach ($issue in $criticalIssues) {
            $message += "• $($issue.Message)`n"
        }
        $color = "danger"
    }

    if ($warningIssues.Count -gt 0) {
        $message += "`n⚠️ *Warning Issues:* $($warningIssues.Count)`n"
        foreach ($issue in $warningIssues) {
            $message += "• $($issue.Message)`n"
        }
        if ($color -eq "good") {
            $color = "warning"
        }
    }

    if ($Analysis.Issues.Count -eq 0) {
        $message += "`n✅ All checks passed"
    }

    Send-SlackNotification -Message $message -Color $color
}

# 显示帮助信息
function Show-Help {
    $helpText = @"
Backup Monitor Script v$SCRIPT_VERSION

Usage: .\backup-monitor.ps1 [Parameters]

Parameters:
    -BackupDir         Backup directory to monitor (default: .\backups)
    -MaxAgeHours       Maximum age in hours for latest backup (default: 24)
    -MinBackupSizeMB   Minimum backup file size in MB (default: 1)
    -SendNotifications Send Slack notifications
    -SlackWebhookUrl   Slack webhook URL for notifications
    -GenerateReport    Generate detailed JSON report
    -Help              Show this help

Examples:
    # Basic monitoring
    .\backup-monitor.ps1

    # Monitor custom directory
    .\backup-monitor.ps1 -BackupDir "D:\backups"

    # Send notifications
    .\backup-monitor.ps1 -SendNotifications -SlackWebhookUrl "https://hooks.slack.com/..."

    # Generate report
    .\backup-monitor.ps1 -GenerateReport
"@
    Write-Host $helpText
}

# 主函数
function Invoke-Main {
    if ($Help) {
        Show-Help
        exit 0
    }

    Write-LogInfo "Starting backup monitor script v$SCRIPT_VERSION"
    Write-LogInfo "Monitoring directory: $BackupDir"

    # 检查备份目录
    if (-not (Test-BackupDirectory $BackupDir)) {
        Write-LogError "Backup directory check failed"
        exit 1
    }

    # 分析备份文件
    $analysis = Get-BackupAnalysis $BackupDir

    # 生成报告
    $report = New-MonitorReport $analysis

    # 保存报告文件
    if ($GenerateReport) {
        $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $REPORT_FILE -Encoding UTF8
        Write-LogInfo "Report generated: $REPORT_FILE"
    }

    # 显示摘要
    Show-Summary $analysis $report

    # 发送通知
    Send-Notifications $analysis

    # 设置退出代码
    $criticalIssues = $analysis.Issues | Where-Object { $_.Type -eq "Critical" }
    if ($criticalIssues.Count -gt 0) {
        Write-LogError "Critical issues found, exiting with error code"
        exit 1
    } else {
        Write-LogInfo "Backup monitoring completed successfully"
        exit 0
    }
}

# 运行主函数
Invoke-Main
