# API文档CI/CD脚本 (PowerShell)
# 用于在本地或CI环境中自动生成和验证API文档

param(
    [switch]$CheckOnly,
    [switch]$Generate,
    [switch]$Validate,
    [switch]$Commit,
    [switch]$Deploy,
    [switch]$All,
    [switch]$Help
)

# 配置
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$DocsDir = Join-Path $ProjectRoot "docs"
$ApiDocsDir = Join-Path $DocsDir "technical\api"
$GeneratedDoc = Join-Path $ApiDocsDir "GENERATED_API.md"

# 日志函数
function Write-LogInfo {
    param([string]$Message)
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [INFO] $Message"
}

function Write-LogError {
    param([string]$Message)
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [ERROR] $Message" -ForegroundColor Red
}

function Write-LogWarn {
    param([string]$Message)
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [WARN] $Message" -ForegroundColor Yellow
}

# 检查依赖
function Test-Dependencies {
    Write-LogInfo "检查依赖..."

    # 检查Node.js
    try {
        $nodeVersion = & node --version 2>$null
        Write-LogInfo "Node.js版本: $nodeVersion"
    } catch {
        Write-LogError "未找到Node.js，请安装Node.js"
        exit 1
    }

    # 检查npm
    try {
        $npmVersion = & npm --version 2>$null
        Write-LogInfo "npm版本: $npmVersion"
    } catch {
        Write-LogError "未找到npm，请安装npm"
        exit 1
    }

    # 检查Git
    try {
        $gitVersion = & git --version 2>$null
        Write-LogInfo "Git版本: $gitVersion"
    } catch {
        Write-LogError "未找到Git，请安装Git"
        exit 1
    }

    Write-LogInfo "依赖检查通过"
}

# 检查Controller文件变更
function Test-ControllerChanges {
    Write-LogInfo "检查Controller文件变更..."

    # 获取变更的文件
    $changedFiles = ""
    if ($env:CI_COMMIT_BEFORE_SHA -and $env:CI_COMMIT_SHA) {
        # GitLab CI
        $changedFiles = & git diff --name-only $env:CI_COMMIT_BEFORE_SHA $env:CI_COMMIT_SHA 2>$null
    } elseif ($env:GITHUB_SHA -and $env:GITHUB_BASE_REF) {
        # GitHub Actions
        $changedFiles = & git diff --name-only "origin/$env:GITHUB_BASE_REF" $env:GITHUB_SHA 2>$null
    } else {
        # 本地检查（与上次提交比较）
        $changedFiles = & git diff --name-only HEAD~1 HEAD 2>$null
    }

    # 检查Controller文件
    $controllerChanged = ($changedFiles | Where-Object { $_ -match "springboot1ngh61a2\\src\\main\\java\\com\\controller\\.*\.java" }).Count

    if ($controllerChanged -gt 0) {
        Write-LogInfo "检测到 $controllerChanged 个Controller文件变更"
        return $true
    } else {
        Write-LogInfo "未检测到Controller文件变更"
        return $false
    }
}

# 安装依赖
function Install-Dependencies {
    Write-LogInfo "安装项目依赖..."

    Push-Location $ProjectRoot
    try {
        & npm install
        if ($LASTEXITCODE -ne 0) {
            Write-LogError "依赖安装失败"
            exit 1
        }
    } finally {
        Pop-Location
    }

    Write-LogInfo "依赖安装完成"
}

# 生成API文档
function New-ApiDocs {
    Write-LogInfo "生成API文档..."

    Push-Location $ProjectRoot

    try {
        # 确保输出目录存在
        if (!(Test-Path $ApiDocsDir)) {
            New-Item -ItemType Directory -Path $ApiDocsDir -Force | Out-Null
        }

        # 生成文档
        & node docs/scripts/generate-api-docs.js --output $GeneratedDoc --verbose

        if ($LASTEXITCODE -ne 0) {
            Write-LogError "API文档生成失败"
            exit 1
        }

        if (Test-Path $GeneratedDoc) {
            Write-LogInfo "API文档生成成功: $GeneratedDoc"
        } else {
            Write-LogError "API文档文件未生成"
            exit 1
        }
    } finally {
        Pop-Location
    }
}

# 验证API文档
function Test-ApiDocs {
    Write-LogInfo "验证API文档..."

    if (!(Test-Path $GeneratedDoc)) {
        Write-LogError "API文档文件不存在: $GeneratedDoc"
        exit 1
    }

    # 检查文件大小
    $fileSize = (Get-Item $GeneratedDoc).Length
    if ($fileSize -lt 1000) {
        Write-LogError "API文档文件过小，可能生成失败"
        exit 1
    }

    # 检查基本内容
    $content = Get-Content $GeneratedDoc -Raw

    if ($content -notmatch "自动生成的API文档") {
        Write-LogError "API文档缺少标题信息"
        exit 1
    }

    if ($content -notmatch "控制器数量") {
        Write-LogError "API文档缺少控制器统计信息"
        exit 1
    }

    if ($content -notmatch "## 🎯") {
        Write-LogError "API文档缺少控制器章节"
        exit 1
    }

    Write-LogInfo "API文档验证通过"
}

# 提交文档变更
function Save-ApiDocs {
    Write-LogInfo "检查文档变更..."

    Push-Location $ProjectRoot

    try {
        # 检查文档是否有变更
        $diff = & git diff --quiet $GeneratedDoc 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-LogInfo "API文档无变更"
            return
        }

        # 配置Git用户信息
        if ($env:CI) {
            & git config user.email ($env:GIT_USER_EMAIL, "ci@local.dev" -ne $null)[0]
            & git config user.name ($env:GIT_USER_NAME, "CI Bot" -ne $null)[0]
        }

        # 添加文档
        & git add $GeneratedDoc

        # 检查是否有变更需要提交
        $diff = & git diff --cached --quiet 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-LogInfo "暂存区无变更"
            return
        }

        $commitMsg = "docs: 自动更新API文档"
        if ($env:CI_COMMIT_SHORT_SHA) {
            $commitMsg += " ($($env:CI_COMMIT_SHORT_SHA))"
        } elseif ($env:GITHUB_SHA) {
            $commitMsg += " ($($env:GITHUB_SHA.Substring(0,8)))"
        }

        & git commit -m $commitMsg

        Write-LogInfo "API文档已提交: $commitMsg"
    } finally {
        Pop-Location
    }
}

# 部署文档（可选）
function Publish-ApiDocs {
    Write-LogInfo "部署API文档..."

    # 这里可以添加文档部署逻辑
    # 例如：复制到网站目录、上传到CDN等

    Write-LogInfo "文档部署完成"
}

# 显示帮助信息
function Show-Help {
    @"
API文档CI/CD脚本 (PowerShell)

用法: .\ci-api-docs.ps1 [选项]

选项:
  -CheckOnly    只检查是否有Controller变更，不生成文档
  -Generate     生成API文档
  -Validate     验证API文档
  -Commit       提交文档变更
  -Deploy       部署文档
  -All          执行完整流程（默认）
  -Help         显示帮助信息

环境变量:
  CI            在CI环境中运行
  GITHUB_SHA    GitHub Actions提交SHA
  GITHUB_BASE_REF  GitHub Actions基础分支
  CI_COMMIT_SHA GitLab CI提交SHA
  CI_COMMIT_BEFORE_SHA  GitLab CI之前的提交SHA

示例:
  .\ci-api-docs.ps1 -All                    # 执行完整流程
  .\ci-api-docs.ps1 -CheckOnly              # 只检查变更
  .\ci-api-docs.ps1 -Generate -Validate     # 生成并验证文档
"@
}

# 主函数
function Invoke-Main {
    $checkOnly = $CheckOnly
    $doGenerate = $Generate
    $doValidate = $Validate
    $doCommit = $Commit
    $doDeploy = $Deploy

    if ($Help) {
        Show-Help
        exit 0
    }

    # 默认执行完整流程
    if (!$checkOnly -and !$doGenerate -and !$doValidate -and !$doCommit -and !$doDeploy) {
        if ($All) {
            $doGenerate = $true
            $doValidate = $true
            $doCommit = $true
            $doDeploy = $true
        }
    }

    Write-LogInfo "开始API文档CI/CD流程..."

    # 检查依赖
    Test-Dependencies

    # 检查Controller变更
    $hasChanges = Test-ControllerChanges
    if (!$hasChanges) {
        if ($checkOnly) {
            Write-LogInfo "未检测到Controller变更，退出"
            exit 0
        }
        Write-LogWarn "未检测到Controller变更，但继续执行"
    }

    if ($checkOnly) {
        exit 0
    }

    # 安装依赖
    Install-Dependencies

    # 生成文档
    if ($doGenerate) {
        New-ApiDocs
    }

    # 验证文档
    if ($doValidate) {
        Test-ApiDocs
    }

    # 提交文档
    if ($doCommit) {
        Save-ApiDocs
    }

    # 部署文档
    if ($doDeploy) {
        Publish-ApiDocs
    }

    Write-LogInfo "API文档CI/CD流程完成 ✅"
}

# 执行主函数
Invoke-Main

