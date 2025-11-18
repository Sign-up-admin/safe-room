param(
    [switch]$Force,
    [switch]$DryRun
)

Write-Host "=== E2E Test Reports Cleanup Script ===" -ForegroundColor Cyan
Write-Host "Starting cleanup of E2E test reports..." -ForegroundColor Green

# Define directories to clean
$cleanupDirectories = @(
    "springboot1ngh61a2/src/main/resources/front/front/playwright-report",
    "springboot1ngh61a2/src/main/resources/front/front/test-results",
    "test-reports/admin/p2p-reports",
    "phased-e2e-execution-report",
    "test-results",
    "reports",
    "coverage-e2e"
)

# Define specific files to delete
$specificFiles = @(
    "test-reports/admin/p2p-results.json",
    "test-results\.last-run.json"
)

$filesDeleted = 0
$totalSizeFreed = 0

function Get-FileSize {
    param([string]$Path)
    try {
        if (Test-Path $Path) {
            return (Get-Item $Path).Length
        }
    } catch {
        return 0
    }
    return 0
}

function Format-Size {
    param([long]$Size)
    if ($Size -lt 1024) { return "$Size B" }
    if ($Size -lt 1048576) { return "{0:N2} KB" -f ($Size / 1024) }
    if ($Size -lt 1073741824) { return "{0:N2} MB" -f ($Size / 1048576) }
    return "{0:N2} GB" -f ($Size / 1073741824)
}

# Clean directories
foreach ($dir in $cleanupDirectories) {
    if (Test-Path $dir) {
        Write-Host "Cleaning directory: $dir" -ForegroundColor Yellow

        try {
            $files = Get-ChildItem -Path $dir -File -Recurse -ErrorAction SilentlyContinue

            foreach ($file in $files) {
                $size = Get-FileSize $file.FullName

                if ($DryRun) {
                    Write-Host "  Would delete: $($file.FullName) ($(Format-Size $size))"
                } else {
                    try {
                        Remove-Item $file.FullName -Force -ErrorAction Stop
                        $filesDeleted++
                        $totalSizeFreed += $size
                        Write-Host "  Deleted: $($file.Name) ($(Format-Size $size))"
                    } catch {
                        Write-Host "  Failed to delete: $($file.FullName) - $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
            }
        } catch {
            Write-Host "  Error processing directory $dir : $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Directory does not exist: $dir" -ForegroundColor Gray
    }
}

# Clean specific files
Write-Host "Cleaning specific files..." -ForegroundColor Yellow
foreach ($file in $specificFiles) {
    if (Test-Path $file) {
        $size = Get-FileSize $file

        if ($DryRun) {
            Write-Host "  Would delete: $file ($(Format-Size $size))"
        } else {
            try {
                Remove-Item $file -Force -ErrorAction Stop
                $filesDeleted++
                $totalSizeFreed += $size
                Write-Host "  Deleted: $file ($(Format-Size $size))"
            } catch {
                Write-Host "  Failed to delete: $file - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "File does not exist: $file" -ForegroundColor Gray
    }
}

# Summary
Write-Host "" -ForegroundColor White
Write-Host "=== Cleanup Summary ===" -ForegroundColor Cyan
Write-Host "Files deleted: $filesDeleted"
Write-Host "Space freed: $(Format-Size $totalSizeFreed)"

if ($DryRun) {
    Write-Host "This was a DRY RUN - no files were actually deleted" -ForegroundColor Yellow
} else {
    Write-Host "Cleanup completed successfully!" -ForegroundColor Green
}
