# 数据库重建脚本
# 用于重建并初始化 PostgreSQL 数据库

param(
    [string]$DbName = "fitness_gym",
    [string]$DbUser = "postgres",
    [string]$DbPassword = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  数据库重建脚本" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 设置环境变量
$env:PGPASSWORD = $DbPassword

# 构建连接字符串
$connectionString = "host=$DbHost port=$DbPort user=$DbUser"

Write-Host "数据库配置:" -ForegroundColor Yellow
Write-Host "  数据库名: $DbName" -ForegroundColor White
Write-Host "  主机: $DbHost" -ForegroundColor White
Write-Host "  端口: $DbPort" -ForegroundColor White
Write-Host "  用户: $DbUser" -ForegroundColor White
Write-Host ""

# 检查 PostgreSQL 是否可用
Write-Host "检查 PostgreSQL 连接..." -ForegroundColor Yellow
$checkConnection = & psql -h $DbHost -p $DbPort -U $DbUser -d postgres -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 无法连接到 PostgreSQL 数据库！" -ForegroundColor Red
    Write-Host "请确保 PostgreSQL 已启动并且连接信息正确。" -ForegroundColor Red
    exit 1
}
Write-Host "✓ PostgreSQL 连接正常" -ForegroundColor Green
Write-Host ""

# 确认操作
Write-Host "警告: 此操作将删除数据库 '$DbName' 中的所有数据！" -ForegroundColor Red
$confirm = Read-Host "是否继续？(yes/no)"
if ($confirm -ne "yes") {
    Write-Host "操作已取消。" -ForegroundColor Yellow
    exit 0
}
Write-Host ""

# 终止现有连接
Write-Host "终止现有数据库连接..." -ForegroundColor Yellow
& psql -h $DbHost -p $DbPort -U $DbUser -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DbName' AND pid <> pg_backend_pid();" 2>&1 | Out-Null
Write-Host "✓ 连接已终止" -ForegroundColor Green
Write-Host ""

# 删除数据库
Write-Host "删除现有数据库 '$DbName'..." -ForegroundColor Yellow
$dropDb = & psql -h $DbHost -p $DbPort -U $DbUser -d postgres -c "DROP DATABASE IF EXISTS $DbName;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "警告: 删除数据库时出现错误（可能数据库不存在）" -ForegroundColor Yellow
} else {
    Write-Host "✓ 数据库已删除" -ForegroundColor Green
}
Write-Host ""

# 创建新数据库
Write-Host "创建新数据库 '$DbName'..." -ForegroundColor Yellow
$createDb = & psql -h $DbHost -p $DbPort -U $DbUser -d postgres -c "CREATE DATABASE $DbName WITH ENCODING='UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 创建数据库失败！" -ForegroundColor Red
    Write-Host $createDb -ForegroundColor Red
    exit 1
}
Write-Host "✓ 数据库已创建" -ForegroundColor Green
Write-Host ""

# 执行 schema 脚本
$schemaFile = "springboot1ngh61a2\src\main\resources\schema-postgresql.sql"
if (Test-Path $schemaFile) {
    Write-Host "执行数据库结构脚本..." -ForegroundColor Yellow
    $schemaResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $schemaFile 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 执行 schema 脚本失败！" -ForegroundColor Red
        Write-Host $schemaResult -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ 数据库结构已创建" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "警告: 找不到 schema 文件: $schemaFile" -ForegroundColor Yellow
    Write-Host ""
}

# 执行 data 脚本
$dataFile = "springboot1ngh61a2\src\main\resources\data.sql"
if (Test-Path $dataFile) {
    Write-Host "执行初始数据脚本..." -ForegroundColor Yellow
    $dataResult = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $dataFile 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 执行 data 脚本失败！" -ForegroundColor Red
        Write-Host $dataResult -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ 初始数据已插入" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "警告: 找不到 data 文件: $dataFile" -ForegroundColor Yellow
    Write-Host ""
}

# 验证数据库
Write-Host "验证数据库..." -ForegroundColor Yellow
$tableCount = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>&1
$userCount = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -c "SELECT COUNT(*) FROM users;" 2>&1

Write-Host "✓ 数据库验证完成" -ForegroundColor Green
Write-Host "  表数量: $($tableCount.Trim())" -ForegroundColor White
Write-Host "  用户数量: $($userCount.Trim())" -ForegroundColor White
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  数据库重建完成！" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "默认账户信息:" -ForegroundColor Yellow
Write-Host "  管理员: admin / admin" -ForegroundColor White
Write-Host "  用户: user01-user10 / 123456" -ForegroundColor White
Write-Host "  教练: coach001-coach005 / 123456" -ForegroundColor White
Write-Host ""
Write-Host "注意: 首次登录时，系统会自动将密码迁移到 BCrypt 加密格式。" -ForegroundColor Yellow
Write-Host ""

# 清理环境变量
Remove-Item Env:\PGPASSWORD

