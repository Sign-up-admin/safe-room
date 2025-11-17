# 数据库修复脚本 - 为前端测试准备PostgreSQL数据库
# 执行时间：2025-11-XX

param(
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [string]$DbName = "fitness_gym",
    [string]$DbUser = "postgres",
    [string]$DbPass = "postgres"
)

Write-Host "开始修复PostgreSQL数据库以支持前端测试..." -ForegroundColor Green

# 检查psql客户端是否可用
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCmd) {
    Write-Host "错误：未找到PostgreSQL客户端(psql)。请确保PostgreSQL已安装并在PATH中。" -ForegroundColor Red
    exit 1
}

# 数据库连接字符串
$connectionString = "-h $DbHost -p $DbPort -U $DbUser -d $DbName"
$env:PGPASSWORD = $DbPass

# 执行数据库修复脚本
$sqlFile = "fix-database-for-tests.sql"

if (Test-Path $sqlFile) {
    Write-Host "执行数据库修复脚本：$sqlFile" -ForegroundColor Yellow
    try {
        & psql $connectionString -f $sqlFile
        if ($LASTEXITCODE -eq 0) {
            Write-Host "数据库修复脚本执行成功！" -ForegroundColor Green
        } else {
            Write-Host "数据库修复脚本执行失败！" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "执行数据库修复脚本时出错：$($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "错误：找不到数据库修复脚本文件 $sqlFile" -ForegroundColor Red
    exit 1
}

# 验证关键数据
Write-Host "验证数据库修复结果..." -ForegroundColor Yellow

# 检查用户表
$userCount = & psql $connectionString -c "SELECT COUNT(*) FROM yonghu WHERE yonghuzhanghao = 'testuser';" -t -A
if ($userCount -gt 0) {
    Write-Host "✓ 测试用户数据存在" -ForegroundColor Green
} else {
    Write-Host "✗ 测试用户数据缺失" -ForegroundColor Red
}

# 检查教练表
$coachCount = & psql $connectionString -c "SELECT COUNT(*) FROM jianshenjiaolian WHERE jiaoliangonghao = 'testcoach';" -t -A
if ($coachCount -gt 0) {
    Write-Host "✓ 测试教练数据存在" -ForegroundColor Green
} else {
    Write-Host "✗ 测试教练数据缺失" -ForegroundColor Red
}

# 检查课程表
$courseCount = & psql $connectionString -c "SELECT COUNT(*) FROM jianshenkecheng WHERE name = '测试课程';" -t -A
if ($courseCount -gt 0) {
    Write-Host "✓ 测试课程数据存在" -ForegroundColor Green
} else {
    Write-Host "✗ 测试课程数据缺失" -ForegroundColor Red
}

Write-Host "数据库修复完成！" -ForegroundColor Green
Write-Host ""
Write-Host "现在可以运行前端测试了。" -ForegroundColor Cyan
