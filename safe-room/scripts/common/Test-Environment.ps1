# Test-Environment.ps1
# 统一的测试环境检查和依赖管理函数库

# 全局变量用于存储环境信息
$script:EnvironmentInfo = @{
    NodeVersion = $null
    NpmVersion = $null
    NpxVersion = $null
    IsWindows = $false
    IsLinux = $false
    IsMacOS = $false
}

# 初始化环境信息
function Initialize-EnvironmentInfo {
    # 检测操作系统
    $script:EnvironmentInfo.IsWindows = $false
    $script:EnvironmentInfo.IsLinux = $false
    $script:EnvironmentInfo.IsMacOS = $false

    if ($PSVersionTable.PSVersion.Major -ge 6) {
        # PowerShell Core 6+
        switch ($PSVersionTable.Platform) {
            'Win32NT' { $script:EnvironmentInfo.IsWindows = $true }
            'Unix' {
                try {
                    $osName = uname -s 2>$null
                    if ($osName -eq 'Linux') {
                        $script:EnvironmentInfo.IsLinux = $true
                    } elseif ($osName -eq 'Darwin') {
                        $script:EnvironmentInfo.IsMacOS = $true
                    }
                } catch {
                    # 如果uname不可用，假设是Linux
                    $script:EnvironmentInfo.IsLinux = $true
                }
            }
            default { $script:EnvironmentInfo.IsWindows = $true }
        }
    } else {
        # Windows PowerShell
        $script:EnvironmentInfo.IsWindows = $true
    }

    # 检测Node.js工具版本
    try {
        $script:EnvironmentInfo.NodeVersion = & node --version 2>$null
    } catch {
        $script:EnvironmentInfo.NodeVersion = $null
    }

    try {
        $script:EnvironmentInfo.NpmVersion = & npm --version 2>$null
    } catch {
        $script:EnvironmentInfo.NpmVersion = $null
    }

    try {
        $script:EnvironmentInfo.NpxVersion = & npx --version 2>$null
    } catch {
        $script:EnvironmentInfo.NpxVersion = $null
    }
}

# 统一的日志记录函数
function Write-TestLog {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,

        [Parameter(Mandatory=$false)]
        [ValidateSet("INFO", "WARN", "ERROR", "SUCCESS", "DEBUG")]
        [string]$Level = "INFO",

        [Parameter(Mandatory=$false)]
        [switch]$NoTimestamp,

        [Parameter(Mandatory=$false)]
        [switch]$NoColor
    )

    $timestamp = if ($NoTimestamp) { "" } else { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') " }

    $logMessage = "$timestamp[$Level] $Message"

    if ($NoColor) {
        Write-Host $logMessage
    } else {
        switch ($Level) {
            "INFO" { Write-Host $logMessage -ForegroundColor Cyan }
            "WARN" { Write-Host $logMessage -ForegroundColor Yellow }
            "ERROR" { Write-Host $logMessage -ForegroundColor Red }
            "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
            "DEBUG" { Write-Host $logMessage -ForegroundColor Magenta }
            default { Write-Host $logMessage }
        }
    }
}

# 检查命令是否存在
function Test-CommandExists {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Command,

        [Parameter(Mandatory=$false)]
        [string]$FriendlyName = $Command,

        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    try {
        $null = Get-Command $Command -ErrorAction Stop
        if ($Verbose) {
            Write-TestLog "✓ $FriendlyName 已安装" "SUCCESS"
        }
        return $true
    } catch {
        if ($Verbose) {
            Write-TestLog "✗ $FriendlyName 未找到" "ERROR"
        }
        return $false
    }
}

# 转换路径为跨平台格式
function Convert-ToCrossPlatformPath {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )

    Initialize-EnvironmentInfo

    if ($script:EnvironmentInfo.IsWindows) {
        # Windows: 确保使用反斜杠，但处理正斜杠输入
        return $Path -replace '/', '\'
    } else {
        # Linux/macOS: 使用正斜杠
        return $Path -replace '\\', '/'
    }
}

# 获取跨平台兼容的路径分隔符
function Get-PathSeparator {
    Initialize-EnvironmentInfo

    if ($script:EnvironmentInfo.IsWindows) {
        return '\'
    } else {
        return '/'
    }
}

# 组合路径（跨平台）
function Join-CrossPlatformPath {
    param(
        [Parameter(Mandatory=$true, ValueFromRemainingArguments=$true)]
        [string[]]$Paths
    )

    $separator = Get-PathSeparator
    $result = $Paths[0]

    for ($i = 1; $i -lt $Paths.Length; $i++) {
        $path = $Paths[$i]
        # 移除路径开头和结尾的分隔符
        $result = $result.TrimEnd($separator)
        $path = $path.TrimStart($separator)
        $result = $result + $separator + $path
    }

    return Convert-ToCrossPlatformPath $result
}

# 检查项目路径是否存在
function Test-ProjectPath {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path,

        [Parameter(Mandatory=$false)]
        [string]$ProjectName = "项目",

        [Parameter(Mandatory=$false)]
        [switch]$CreateIfMissing,

        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    # 转换路径为当前平台格式
    $normalizedPath = Convert-ToCrossPlatformPath $Path

    if (Test-Path $normalizedPath) {
        if ($Verbose) {
            Write-TestLog "✓ $ProjectName 路径存在: $normalizedPath" "SUCCESS"
        }
        return $true
    } else {
        if ($CreateIfMissing) {
            try {
                New-Item -ItemType Directory -Path $normalizedPath -Force | Out-Null
                Write-TestLog "✓ 已创建 $ProjectName 路径: $normalizedPath" "SUCCESS"
                return $true
            } catch {
                Write-TestLog "✗ 无法创建 $ProjectName 路径: $normalizedPath - $($_.Exception.Message)" "ERROR"
                return $false
            }
        } else {
            if ($Verbose) {
                Write-TestLog "✗ $ProjectName 路径不存在: $normalizedPath" "ERROR"
            }
            return $false
        }
    }
}

# 检查并安装Node.js依赖
function Install-Dependencies {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProjectPath,

        [Parameter(Mandatory=$false)]
        [string]$ProjectName = "项目",

        [Parameter(Mandatory=$false)]
        [switch]$Force,

        [Parameter(Mandatory=$false)]
        [switch]$AutoRepair,

        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    $normalizedPath = Convert-ToCrossPlatformPath $ProjectPath

    if (-not (Test-ProjectPath -Path $normalizedPath -ProjectName $ProjectName -Verbose:$Verbose)) {
        return $false
    }

    Push-Location $normalizedPath

    try {
        $nodeModulesPath = Join-CrossPlatformPath $normalizedPath "node_modules"
        $packageJsonPath = Join-CrossPlatformPath $normalizedPath "package.json"
        $packageLockPath = Join-CrossPlatformPath $normalizedPath "package-lock.json"
        $yarnLockPath = Join-CrossPlatformPath $normalizedPath "yarn.lock"
        $pnpmLockPath = Join-CrossPlatformPath $normalizedPath "pnpm-lock.yaml"

        # 检查package.json是否存在
        if (-not (Test-Path $packageJsonPath)) {
            Write-TestLog "✗ $ProjectName 中未找到 package.json 文件" "ERROR"
            return $false
        }

        # 检查是否已安装依赖
        if ((Test-Path $nodeModulesPath) -and -not $Force) {
            # 验证依赖完整性（包括版本一致性和健康检查）
            if (Test-DependenciesIntegrity -ProjectPath $normalizedPath -CheckVersions -Verbose:$Verbose) {
                if ($Verbose) {
                    Write-TestLog "✓ $ProjectName 依赖已存在且完整" "SUCCESS"
                }
                return $true
            } else {
                if ($Verbose) {
                    Write-TestLog "⚠️ $ProjectName 依赖不完整或存在问题，重新安装..." "WARN"
                }
            }
        }

        if ($Verbose) {
            Write-TestLog "正在安装 $ProjectName 依赖..." "INFO"
        }

        # 检测包管理器
        $packageManager = Get-PackageManager -ProjectPath $normalizedPath
        if (-not $packageManager) {
            Write-TestLog "✗ 未找到可用的包管理器 (npm/yarn/pnpm)" "ERROR"
            if ($AutoRepair) {
                Write-TestLog "尝试安装 npm..." "INFO"
                if (Install-NpmIfMissing -Verbose:$Verbose) {
                    $packageManager = "npm"
                } else {
                    return $false
                }
            } else {
                return $false
            }
        }

        # 执行依赖安装
        $installCommand = switch ($packageManager) {
            "yarn" { "yarn install" }
            "pnpm" { "pnpm install" }
            default { "npm install" }
        }

        $installResult = Invoke-TestCommand $installCommand -Verbose:$Verbose

        if ($installResult.Success) {
            # 验证安装结果（包括版本一致性和健康检查）
            if (Test-DependenciesIntegrity -ProjectPath $normalizedPath -CheckVersions -Verbose:$Verbose) {
                if ($Verbose) {
                    Write-TestLog "✓ $ProjectName 依赖安装成功" "SUCCESS"
                }
                return $true
            } else {
                Write-TestLog "⚠️ $ProjectName 依赖安装完成但验证失败" "WARN"
                # 自动修复：尝试修复依赖问题
                if ($AutoRepair) {
                    Write-TestLog "尝试自动修复依赖问题..." "INFO"
                    if (Repair-Dependencies -ProjectPath $normalizedPath -ProjectName $ProjectName -Verbose:$Verbose) {
                        return $true
                    }
                }
                return $false
            }
        } else {
            Write-TestLog "✗ $ProjectName 依赖安装失败: $($installResult.Output)" "ERROR"

            # 自动修复：尝试清理缓存并重试
            if ($AutoRepair) {
                Write-TestLog "尝试清理缓存并重试..." "INFO"
                Clear-PackageCache -PackageManager $packageManager -Verbose:$Verbose
                $retryResult = Invoke-TestCommand $installCommand -Verbose:$Verbose

                if ($retryResult.Success -and (Test-DependenciesIntegrity -ProjectPath $normalizedPath -CheckVersions -Verbose:$Verbose)) {
                    Write-TestLog "✓ 重试后依赖安装成功" "SUCCESS"
                    return $true
                } else {
                    # 最后的修复尝试
                    Write-TestLog "重试失败，尝试强制修复..." "WARN"
                    if (Repair-Dependencies -ProjectPath $normalizedPath -ProjectName $ProjectName -Force -Verbose:$Verbose) {
                        return $true
                    }
                }
            }

            return $false
        }

    } catch {
        Write-TestLog "✗ 安装 $ProjectName 依赖时出错: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        Pop-Location
    }
}

# 安装Playwright浏览器
function Install-PlaywrightBrowsers {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProjectPath,

        [Parameter(Mandatory=$false)]
        [string]$ProjectName = "项目",

        [Parameter(Mandatory=$false)]
        [switch]$Force,

        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    if (-not (Test-ProjectPath -Path $ProjectPath -ProjectName $ProjectName -Verbose:$Verbose)) {
        return $false
    }

    Push-Location $ProjectPath

    try {
        $playwrightCache = "node_modules\.cache\playwright"

        if ((Test-Path $playwrightCache) -and -not $Force) {
            if ($Verbose) {
                Write-TestLog "✓ Playwright 浏览器已安装" "SUCCESS"
            }
            return $true
        }

        if ($Verbose) {
            Write-TestLog "正在安装 Playwright 浏览器..." "INFO"
        }

        # 检查npx是否可用
        if (-not (Test-CommandExists -Command "npx" -Verbose:$Verbose)) {
            Write-TestLog "✗ npx 未安装，无法安装 Playwright 浏览器" "ERROR"
            return $false
        }

        # 执行playwright install
        $installResult = Invoke-TestCommand "npx playwright install --with-deps" -Verbose:$Verbose

        if ($installResult.Success) {
            if ($Verbose) {
                Write-TestLog "✓ Playwright 浏览器安装成功" "SUCCESS"
            }
            return $true
        } else {
            Write-TestLog "⚠️ Playwright 浏览器安装失败，E2E 测试可能无法运行: $($installResult.Output)" "WARN"
            return $false
        }

    } catch {
        Write-TestLog "⚠️ 安装 Playwright 浏览器时出错: $($_.Exception.Message)" "WARN"
        return $false
    } finally {
        Pop-Location
    }
}

# 执行测试命令的辅助函数
function Invoke-TestCommand {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Command,

        [Parameter(Mandatory=$false)]
        [string]$LogFile,

        [Parameter(Mandatory=$false)]
        [switch]$CaptureOutput,

        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    if ($Verbose) {
        Write-TestLog "执行命令: $Command" "DEBUG"
    }

    try {
        if ($CaptureOutput -and $LogFile) {
            $output = Invoke-Expression "$Command 2>&1" | Tee-Object -FilePath $LogFile
            $result = @{
                Success = ($LASTEXITCODE -eq 0)
                Output = $output
                ExitCode = $LASTEXITCODE
            }
        } else {
            Invoke-Expression $Command
            $result = @{
                Success = ($LASTEXITCODE -eq 0)
                Output = ""
                ExitCode = $LASTEXITCODE
            }
        }
        return $result
    } catch {
        if ($Verbose) {
            Write-TestLog "命令执行异常: $($_.Exception.Message)" "DEBUG"
        }
        return @{
            Success = $false
            Output = $_.Exception.Message
            ExitCode = 1
        }
    }
}

# 检查测试环境完整性
function Test-TestEnvironment {
    param(
        [Parameter(Mandatory=$false)]
        [string[]]$RequiredCommands = @("node", "npm", "npx"),

        [Parameter(Mandatory=$false)]
        [string[]]$ProjectPaths = @(),

        [Parameter(Mandatory=$false)]
        [switch]$InstallDependencies,

        [Parameter(Mandatory=$false)]
        [switch]$InstallPlaywright,

        [Parameter(Mandatory=$false)]
        [switch]$AutoRepair,

        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    $allChecksPass = $true
    $repairAttempts = @()
    $failedChecks = @()

    # 初始化环境信息
    Initialize-EnvironmentInfo

    # 检查必需命令
    Write-TestLog "🔍 检查必需命令..." "INFO"
    foreach ($cmd in $RequiredCommands) {
        if (-not (Test-CommandExists -Command $cmd -Verbose:$Verbose)) {
            $failedChecks += "命令 '$cmd' 未找到"
            if ($AutoRepair) {
                Write-TestLog "🔧 尝试自动修复: 安装缺失的命令 '$cmd'" "WARN"
                $repairResult = Repair-MissingCommand -Command $cmd -Verbose:$Verbose
                if ($repairResult.Success) {
                    $repairAttempts += "成功安装命令 '$cmd'"
                    Write-TestLog "✅ 命令 '$cmd' 安装成功" "SUCCESS"
                } else {
                    $repairAttempts += "安装命令 '$cmd' 失败: $($repairResult.Message)"
                    Write-TestLog "❌ 安装命令 '$cmd' 失败: $($repairResult.Message)" "ERROR"
                    $allChecksPass = $false
                }
            } else {
                $allChecksPass = $false
            }
        } else {
            Write-TestLog "✅ 命令 '$cmd' 已找到" "SUCCESS"
        }
    }

    # 检查项目路径
    if ($ProjectPaths.Count -gt 0) {
        Write-TestLog "🔍 检查项目路径..." "INFO"
        foreach ($path in $ProjectPaths) {
            if (-not (Test-ProjectPath -Path $path -Verbose:$Verbose)) {
                $failedChecks += "项目路径 '$path' 无效"
                $allChecksPass = $false
            } else {
                Write-TestLog "✅ 项目路径 '$path' 有效" "SUCCESS"
            }
        }
    }

    # 安装依赖（如果需要）
    if ($InstallDependencies -and $ProjectPaths.Count -gt 0) {
        Write-TestLog "🔍 检查项目依赖..." "INFO"
        foreach ($path in $ProjectPaths) {
            if (-not (Install-Dependencies -ProjectPath $path -Verbose:$Verbose)) {
                $failedChecks += "项目 '$path' 依赖安装失败"
                $allChecksPass = $false
            } else {
                Write-TestLog "✅ 项目 '$path' 依赖安装成功" "SUCCESS"
            }
        }
    }

    # 安装Playwright浏览器（如果需要）
    if ($InstallPlaywright -and $ProjectPaths.Count -gt 0) {
        Write-TestLog "🔍 检查Playwright浏览器..." "INFO"
        foreach ($path in $ProjectPaths) {
            $browserResult = Install-PlaywrightBrowsers -ProjectPath $path -Verbose:$Verbose
            if (-not $browserResult) {
                $failedChecks += "项目 '$path' Playwright浏览器安装失败"
                # Playwright浏览器安装失败不影响整体检查结果，只记录警告
                Write-TestLog "⚠️ 项目 '$path' Playwright浏览器安装失败，但不影响测试执行" "WARN"
            } else {
                Write-TestLog "✅ 项目 '$path' Playwright浏览器安装成功" "SUCCESS"
            }
        }
    }

    # 检查跨平台兼容性
    Write-TestLog "🔍 检查跨平台兼容性..." "INFO"
    $compatibilityResult = Test-CrossPlatformCompatibility -Verbose:$Verbose
    if (-not $compatibilityResult.Compatible) {
        $failedChecks += "跨平台兼容性问题: $($compatibilityResult.Message)"
        if ($AutoRepair -and $compatibilityResult.CanRepair) {
            Write-TestLog "🔧 尝试修复跨平台兼容性问题..." "WARN"
            $repairResult = Repair-CrossPlatformCompatibility -Verbose:$Verbose
            if ($repairResult.Success) {
                $repairAttempts += "跨平台兼容性修复成功"
                Write-TestLog "✅ 跨平台兼容性修复成功" "SUCCESS"
            } else {
                $repairAttempts += "跨平台兼容性修复失败: $($repairResult.Message)"
                Write-TestLog "❌ 跨平台兼容性修复失败: $($repairResult.Message)" "ERROR"
                $allChecksPass = $false
            }
        } else {
            $allChecksPass = $false
        }
    } else {
        Write-TestLog "✅ 跨平台兼容性检查通过" "SUCCESS"
    }

    # 生成环境健康报告
    $healthReport = @{
        AllChecksPass = $allChecksPass
        FailedChecks = $failedChecks
        RepairAttempts = $repairAttempts
        EnvironmentInfo = @{
            NodeVersion = $script:EnvironmentInfo.NodeVersion
            NpmVersion = $script:EnvironmentInfo.NpmVersion
            NpxVersion = $script:EnvironmentInfo.NpxVersion
            Platform = $(if ($script:EnvironmentInfo.IsWindows) { 'Windows' } elseif ($script:EnvironmentInfo.IsLinux) { 'Linux' } elseif ($script:EnvironmentInfo.IsMacOS) { 'macOS' } else { 'Unknown' })
            PowerShellVersion = $PSVersionTable.PSVersion.ToString()
            PSEdition = $PSVersionTable.PSEdition
        }
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }

    # 保存健康报告
    $reportPath = Join-Path $env:TEMP "test-environment-health-report.json"
    try {
        $healthReport | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8 -Force
        if ($Verbose) {
            Write-TestLog "环境健康报告已保存到: $reportPath" "INFO"
        }
    } catch {
        Write-TestLog "保存环境健康报告失败: $($_.Exception.Message)" "WARN"
    }

    # 输出环境摘要
    if ($Verbose) {
        Write-TestLog "环境检查摘要:" "INFO"
        Write-TestLog "  Node.js: $($script:EnvironmentInfo.NodeVersion)" "INFO"
        Write-TestLog "  NPM: $($script:EnvironmentInfo.NpmVersion)" "INFO"
        Write-TestLog "  NPX: $($script:EnvironmentInfo.NpxVersion)" "INFO"
        Write-TestLog "  平台: $(if ($script:EnvironmentInfo.IsWindows) { 'Windows' } elseif ($script:EnvironmentInfo.IsLinux) { 'Linux' } elseif ($script:EnvironmentInfo.IsMacOS) { 'macOS' } else { 'Unknown' })" "INFO"
        Write-TestLog "  PowerShell: $($PSVersionTable.PSVersion) ($($PSVersionTable.PSEdition))" "INFO"

        if ($repairAttempts.Count -gt 0) {
            Write-TestLog "修复尝试:" "INFO"
            foreach ($attempt in $repairAttempts) {
                Write-TestLog "  $attempt" "INFO"
            }
        }

        if ($failedChecks.Count -gt 0) {
            Write-TestLog "失败检查:" "WARN"
            foreach ($check in $failedChecks) {
                Write-TestLog "  ❌ $check" "WARN"
            }
        }
    }

    return $allChecksPass
}

# 自动修复缺失的命令
function Repair-MissingCommand {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Command,

        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    try {
        switch ($Command) {
            "node" {
                if ($script:EnvironmentInfo.IsWindows) {
                    # 尝试使用 winget 或 chocolatey 安装 Node.js
                    if (Test-CommandExists -Command "winget" -Verbose:$Verbose) {
                        $output = Invoke-CrossPlatformCommand -Command "winget install OpenJS.NodeJS"
                        if ($LASTEXITCODE -eq 0) {
                            return @{ Success = $true; Message = "使用 winget 安装 Node.js 成功" }
                        }
                    }
                    if (Test-CommandExists -Command "choco" -Verbose:$Verbose) {
                        $output = Invoke-CrossPlatformCommand -Command "choco install nodejs -y"
                        if ($LASTEXITCODE -eq 0) {
                            return @{ Success = $true; Message = "使用 Chocolatey 安装 Node.js 成功" }
                        }
                    }
                } elseif ($script:EnvironmentInfo.IsLinux) {
                    # Linux 系统使用包管理器
                    $output = Invoke-CrossPlatformCommand -Command "curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
                    if ($LASTEXITCODE -eq 0) {
                        return @{ Success = $true; Message = "使用 NodeSource 安装 Node.js 成功" }
                    }
                } elseif ($script:EnvironmentInfo.IsMacOS) {
                    # macOS 使用 Homebrew
                    if (Test-CommandExists -Command "brew" -Verbose:$Verbose) {
                        $output = Invoke-CrossPlatformCommand -Command "brew install node"
                        if ($LASTEXITCODE -eq 0) {
                            return @{ Success = $true; Message = "使用 Homebrew 安装 Node.js 成功" }
                        }
                    }
                }
                return @{ Success = $false; Message = "无法自动安装 Node.js，请手动安装 Node.js" }
            }
            "npm" {
                # npm 通常随 Node.js 一起安装，如果缺失可能是安装问题
                if (Test-CommandExists -Command "node" -Verbose:$Verbose) {
                    return @{ Success = $false; Message = "Node.js 已安装但 npm 缺失，可能需要重新安装 Node.js" }
                } else {
                    return @{ Success = $false; Message = "需要先安装 Node.js" }
                }
            }
            "npx" {
                # npx 通常随 npm 一起安装
                if (Test-CommandExists -Command "npm" -Verbose:$Verbose) {
                    return @{ Success = $false; Message = "npm 已安装但 npx 缺失，可能需要更新 npm" }
                } else {
                    return @{ Success = $false; Message = "需要先安装 npm" }
                }
            }
            default {
                return @{ Success = $false; Message = "不支持自动安装命令: $Command" }
            }
        }
    } catch {
        return @{ Success = $false; Message = "修复过程中出错: $($_.Exception.Message)" }
    }
}

# 检查跨平台兼容性
function Test-CrossPlatformCompatibility {
    param(
        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    $issues = @()
    $canRepair = $true

    # 检查 PowerShell 版本
    $psVersion = $PSVersionTable.PSVersion
    if ($psVersion.Major -lt 5) {
        $issues += "PowerShell 版本太低: $psVersion (需要 5.1+)"
        $canRepair = $false
    }

    # 检查是否为 PowerShell Core (推荐用于跨平台)
    $isCore = $PSVersionTable.PSEdition -eq "Core"
    if (-not $isCore -and $psVersion.Major -lt 6) {
        $issues += "建议使用 PowerShell Core 以获得更好的跨平台兼容性"
    }

    # 检查路径分隔符使用
    # 注意：这里我们无法直接检测脚本中的路径问题，但可以检查当前环境

    # 检查命令执行方式
    # 验证 Invoke-CrossPlatformCommand 函数是否工作正常
    try {
        $testResult = Invoke-CrossPlatformCommand -Command "echo test"
        if ($LASTEXITCODE -ne 0) {
            $issues += "跨平台命令执行测试失败"
        }
    } catch {
        $issues += "跨平台命令执行函数异常: $($_.Exception.Message)"
        $canRepair = $false
    }

    return @{
        Compatible = ($issues.Count -eq 0)
        Issues = $issues
        Message = ($issues.Count -gt 0) ? ($issues -join "; ") : "兼容性检查通过"
        CanRepair = $canRepair
    }
}

# 修复跨平台兼容性问题
function Repair-CrossPlatformCompatibility {
    param(
        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    try {
        $compatibilityResult = Test-CrossPlatformCompatibility -Verbose:$Verbose

        if ($compatibilityResult.Compatible) {
            return @{ Success = $true; Message = "跨平台兼容性已正常" }
        }

        $fixedIssues = @()

        # 这里可以添加具体的修复逻辑
        # 目前主要依赖于现有的兼容性检查

        if ($compatibilityResult.CanRepair) {
            # 验证修复是否成功
            $postCheck = Test-CrossPlatformCompatibility -Verbose:$Verbose
            if ($postCheck.Compatible) {
                return @{ Success = $true; Message = "跨平台兼容性修复成功" }
            } else {
                return @{ Success = $false; Message = "修复后仍存在问题: $($postCheck.Message)" }
            }
        } else {
            return @{ Success = $false; Message = "某些兼容性问题无法自动修复: $($compatibilityResult.Message)" }
        }
    } catch {
        return @{ Success = $false; Message = "修复过程中出错: $($_.Exception.Message)" }
    }
}

# 检测包管理器类型
function Get-PackageManager {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProjectPath
    )

    $normalizedPath = Convert-ToCrossPlatformPath $ProjectPath

    # 按优先级检测包管理器
    $managers = @(
        @{ Name = "pnpm"; LockFile = "pnpm-lock.yaml"; Command = "pnpm" },
        @{ Name = "yarn"; LockFile = "yarn.lock"; Command = "yarn" },
        @{ Name = "npm"; LockFile = "package-lock.json"; Command = "npm" }
    )

    foreach ($manager in $managers) {
        $lockFilePath = Join-CrossPlatformPath $normalizedPath $manager.LockFile
        if ((Test-Path $lockFilePath) -and (Test-CommandExists -Command $manager.Command)) {
            return $manager.Name
        }
    }

    # 如果没有锁定文件，使用可用的包管理器
    foreach ($manager in $managers) {
        if (Test-CommandExists -Command $manager.Command) {
            return $manager.Name
        }
    }

    return $null
}

# 测试依赖完整性
function Test-DependenciesIntegrity {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProjectPath,

        [Parameter(Mandatory=$false)]
        [switch]$Verbose,

        [Parameter(Mandatory=$false)]
        [switch]$CheckVersions
    )

    $normalizedPath = Convert-ToCrossPlatformPath $ProjectPath
    $nodeModulesPath = Join-CrossPlatformPath $normalizedPath "node_modules"
    $packageJsonPath = Join-CrossPlatformPath $normalizedPath "package.json"

    if (-not (Test-Path $nodeModulesPath) -or -not (Test-Path $packageJsonPath)) {
        return $false
    }

    try {
        # 读取package.json
        $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
        $dependencies = @()
        $devDependencies = @()

        if ($packageJson.dependencies) {
            $dependencies = $packageJson.dependencies
        }
        if ($packageJson.devDependencies) {
            $devDependencies = $packageJson.devDependencies
        }

        # 检查关键依赖是否存在
        $missingDeps = @()
        $allDeps = @{}
        foreach ($prop in $packageJson.dependencies.PSObject.Properties) {
            $allDeps[$prop.Name] = $prop.Value
        }
        foreach ($prop in $packageJson.devDependencies.PSObject.Properties) {
            $allDeps[$prop.Name] = $prop.Value
        }

        foreach ($dep in $allDeps.Keys) {
            $depPath = Join-CrossPlatformPath $nodeModulesPath $dep
            if (-not (Test-Path $depPath)) {
                $missingDeps += $dep
            }
        }

        if ($missingDeps.Count -gt 0) {
            if ($Verbose) {
                Write-TestLog "缺少依赖: $($missingDeps -join ', ')" "DEBUG"
            }
            return $false
        }

        # 版本一致性检查
        if ($CheckVersions) {
            $versionMismatches = Test-DependencyVersionConsistency -ProjectPath $normalizedPath -Verbose:$Verbose
            if ($versionMismatches.Count -gt 0) {
                if ($Verbose) {
                    Write-TestLog "依赖版本不一致: $($versionMismatches -join ', ')" "WARN"
                }
                return $false
            }
        }

        # node_modules健康检查
        $healthCheck = Test-NodeModulesHealth -ProjectPath $normalizedPath -Verbose:$Verbose
        if (-not $healthCheck.Healthy) {
            if ($Verbose) {
                Write-TestLog "node_modules健康检查失败: $($healthCheck.Issues -join ', ')" "WARN"
            }
            return $false
        }

        return $true
    } catch {
        if ($Verbose) {
            Write-TestLog "检查依赖完整性时出错: $($_.Exception.Message)" "DEBUG"
        }
        return $false
    }
}

# 检查依赖版本一致性
function Test-DependencyVersionConsistency {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProjectPath,

        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    $normalizedPath = Convert-ToCrossPlatformPath $ProjectPath
    $packageJsonPath = Join-CrossPlatformPath $normalizedPath "package.json"
    $nodeModulesPath = Join-CrossPlatformPath $normalizedPath "node_modules"

    $mismatches = @()

    try {
        $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json

        # 检查所有依赖
        $allDeps = @{}
        if ($packageJson.dependencies) {
            foreach ($prop in $packageJson.dependencies.PSObject.Properties) {
                $allDeps[$prop.Name] = @{
                    RequiredVersion = $prop.Value
                    Type = "dependency"
                }
            }
        }
        if ($packageJson.devDependencies) {
            foreach ($prop in $packageJson.devDependencies.PSObject.Properties) {
                $allDeps[$prop.Name] = @{
                    RequiredVersion = $prop.Value
                    Type = "devDependency"
                }
            }
        }

        foreach ($depName in $allDeps.Keys) {
            $depInfo = $allDeps[$depName]
            $depPath = Join-CrossPlatformPath $nodeModulesPath $depName
            $packagePath = Join-CrossPlatformPath $depPath "package.json"

            if (Test-Path $packagePath) {
                try {
                    $installedPackage = Get-Content $packagePath -Raw | ConvertFrom-Json
                    $installedVersion = $installedPackage.version

                    # 简单版本比较（可以扩展为更复杂的语义版本比较）
                    $requiredVersion = $depInfo.RequiredVersion -replace '^[\^~]', ''
                    if ($installedVersion -ne $requiredVersion) {
                        $mismatches += "$depName (需要: $($depInfo.RequiredVersion), 已安装: $installedVersion)"
                    }
                } catch {
                    $mismatches += "$depName (无法读取已安装版本)"
                }
            }
        }
    } catch {
        if ($Verbose) {
            Write-TestLog "检查版本一致性时出错: $($_.Exception.Message)" "DEBUG"
        }
    }

    return $mismatches
}

# 检查node_modules健康状态
function Test-NodeModulesHealth {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProjectPath,

        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    $normalizedPath = Convert-ToCrossPlatformPath $ProjectPath
    $nodeModulesPath = Join-CrossPlatformPath $normalizedPath "node_modules"

    $result = @{
        Healthy = $true
        Issues = @()
    }

    try {
        # 检查目录权限
        try {
            $testFile = Join-CrossPlatformPath $nodeModulesPath "health-check.tmp"
            "test" | Out-File -FilePath $testFile -Encoding UTF8 -ErrorAction Stop
            Remove-Item $testFile -ErrorAction SilentlyContinue
        } catch {
            $result.Healthy = $false
            $result.Issues += "目录权限问题"
        }

        # 检查是否存在损坏的包
        $packageFiles = Get-ChildItem -Path $nodeModulesPath -Filter "package.json" -Recurse -ErrorAction SilentlyContinue
        foreach ($packageFile in $packageFiles) {
            try {
                $packageContent = Get-Content $packageFile.FullName -Raw -ErrorAction Stop
                $packageJson = $packageContent | ConvertFrom-Json
                if (-not $packageJson.name -or -not $packageJson.version) {
                    $result.Healthy = $false
                    $result.Issues += "损坏的包: $($packageFile.Directory.Name)"
                }
            } catch {
                $result.Healthy = $false
                $result.Issues += "无法解析包: $($packageFile.Directory.Name)"
            }
        }

        # 检查磁盘空间
        try {
            $nodeModulesSize = (Get-ChildItem -Path $nodeModulesPath -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            $availableSpace = (Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'" -ErrorAction SilentlyContinue).FreeSpace

            if ($availableSpace -and ($availableSpace -lt 1GB)) {  # 1GB = 1073741824 bytes
                $result.Healthy = $false
                $result.Issues += "磁盘空间不足"
            }
        } catch {
            # 忽略磁盘空间检查错误
        }

    } catch {
        $result.Healthy = $false
        $result.Issues += "健康检查失败: $($_.Exception.Message)"
    }

    return $result
}

# 自动修复依赖问题
function Repair-Dependencies {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProjectPath,

        [Parameter(Mandatory=$false)]
        [string]$ProjectName = "项目",

        [Parameter(Mandatory=$false)]
        [switch]$Force,

        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    if ($Verbose) {
        Write-TestLog "开始修复 $ProjectName 依赖..." "INFO"
    }

    $normalizedPath = Convert-ToCrossPlatformPath $ProjectPath

    try {
        Push-Location $normalizedPath

        # 清理缓存和锁文件
        $cacheFiles = @(
            ".npm",
            "node_modules/.cache",
            "package-lock.json",
            "yarn.lock",
            "pnpm-lock.yaml"
        )

        foreach ($cacheFile in $cacheFiles) {
            if (Test-Path $cacheFile) {
                if ($Verbose) {
                    Write-TestLog "清理缓存文件: $cacheFile" "DEBUG"
                }
                Remove-Item $cacheFile -Recurse -Force -ErrorAction SilentlyContinue
            }
        }

        # 清理node_modules（如果强制修复）
        if ($Force) {
            if (Test-Path "node_modules") {
                if ($Verbose) {
                    Write-TestLog "强制清理node_modules" "WARN"
                }
                Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
            }
        }

        # 重新安装依赖
        $success = Install-Dependencies -ProjectPath $normalizedPath -ProjectName $ProjectName -Force -AutoRepair -Verbose:$Verbose

        if ($success) {
            if ($Verbose) {
                Write-TestLog "✓ $ProjectName 依赖修复成功" "SUCCESS"
            }
            return $true
        } else {
            Write-TestLog "✗ $ProjectName 依赖修复失败" "ERROR"
            return $false
        }

    } catch {
        Write-TestLog "修复依赖时出错: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        Pop-Location
    }
}

# 安装npm（如果缺失）
function Install-NpmIfMissing {
    param(
        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    if (Test-CommandExists -Command "npm") {
        return $true
    }

    if ($Verbose) {
        Write-TestLog "尝试安装 npm..." "INFO"
    }

    # 检查Node.js是否已安装
    if (-not (Test-CommandExists -Command "node")) {
        Write-TestLog "✗ Node.js 未安装，无法安装 npm" "ERROR"
        return $false
    }

    # 在某些系统上，npm 可能与 Node.js 一起安装但不在 PATH 中
    # 尝试刷新环境变量
    try {
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        if (Test-CommandExists -Command "npm") {
            if ($Verbose) {
                Write-TestLog "✓ npm 通过环境变量刷新找到" "SUCCESS"
            }
            return $true
        }
    } catch {
        # 忽略错误，继续尝试其他方法
    }

    # 在 Windows 上尝试使用 winget 或 chocolatey
    if ($script:EnvironmentInfo.IsWindows) {
        if (Test-CommandExists -Command "winget") {
            $result = Invoke-TestCommand "winget install OpenJS.NodeJS" -Verbose:$Verbose
            if ($result.Success) {
                if ($Verbose) {
                    Write-TestLog "✓ 通过 winget 安装 Node.js/npm 成功" "SUCCESS"
                }
                return $true
            }
        }

        if (Test-CommandExists -Command "choco") {
            $result = Invoke-TestCommand "choco install nodejs -y" -Verbose:$Verbose
            if ($result.Success) {
                if ($Verbose) {
                    Write-TestLog "✓ 通过 chocolatey 安装 Node.js/npm 成功" "SUCCESS"
                }
                return $true
            }
        }
    }

    Write-TestLog "✗ 无法自动安装 npm，请手动安装 Node.js" "ERROR"
    return $false
}

# 清理包管理器缓存
function Clear-PackageCache {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PackageManager,

        [Parameter(Mandatory=$false)]
        [switch]$Verbose
    )

    if ($Verbose) {
        Write-TestLog "清理 $PackageManager 缓存..." "INFO"
    }

    $clearCommand = switch ($PackageManager) {
        "yarn" { "yarn cache clean" }
        "pnpm" { "pnpm store prune" }
        default { "npm cache clean --force" }
    }

    $result = Invoke-TestCommand $clearCommand -Verbose:$Verbose

    if ($result.Success) {
        if ($Verbose) {
            Write-TestLog "✓ $PackageManager 缓存清理完成" "SUCCESS"
        }
    } else {
        if ($Verbose) {
            Write-TestLog "⚠️ $PackageManager 缓存清理失败: $($result.Output)" "WARN"
        }
    }
}

# 导出函数供其他脚本使用
Export-ModuleMember -Function @(
    'Initialize-EnvironmentInfo',
    'Write-TestLog',
    'Test-CommandExists',
    'Test-ProjectPath',
    'Install-Dependencies',
    'Install-PlaywrightBrowsers',
    'Invoke-TestCommand',
    'Test-TestEnvironment',
    'Get-PackageManager',
    'Test-DependenciesIntegrity',
    'Install-NpmIfMissing',
    'Clear-PackageCache'
)
