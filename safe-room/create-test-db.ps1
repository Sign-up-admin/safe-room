# 创建测试数据库脚本
# 用于创建 fitness_gym_test 数据库供测试使用

$DB_NAME = "fitness_gym_test"
$DB_USER = "postgres"
$DB_PASSWORD = "postgres"
$DB_HOST = "localhost"
$DB_PORT = "5432"

Write-Host "========================================="
Write-Host "  创建测试数据库"
Write-Host "========================================="
Write-Host ""

Write-Host "数据库配置:"
Write-Host "  数据库名: $DB_NAME"
Write-Host "  主机: $DB_HOST"
Write-Host "  端口: $DB_PORT"
Write-Host "  用户: $DB_USER"
Write-Host ""

# 设置环境变量
$env:PGPASSWORD = $DB_PASSWORD

# 检查 PostgreSQL 是否可用
Write-Host "检查 PostgreSQL 连接..."
try {
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "连接失败"
    }
    Write-Host "✓ PostgreSQL 连接正常" -ForegroundColor Green
} catch {
    Write-Host "错误: 无法连接到 PostgreSQL 数据库！" -ForegroundColor Red
    Write-Host "请确保 PostgreSQL 已启动并且连接信息正确。"
    Write-Host "提示: 可以使用 docker-compose up -d 启动数据库"
    exit 1
}
Write-Host ""

# 检查数据库是否已存在
Write-Host "检查数据库是否已存在..."
$checkResult = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" 2>&1
if ($checkResult -match "1") {
    Write-Host "数据库 '$DB_NAME' 已存在，跳过创建。" -ForegroundColor Yellow
    Write-Host "如需重新创建，请先删除: DROP DATABASE $DB_NAME;" -ForegroundColor Yellow
} else {
    # 创建数据库
    Write-Host "创建数据库 '$DB_NAME'..."
    $createResult = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME WITH ENCODING='UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 数据库创建成功" -ForegroundColor Green
    } else {
        Write-Host "错误: 创建数据库失败" -ForegroundColor Red
        Write-Host $createResult
        exit 1
    }
}
Write-Host ""

Write-Host "测试数据库准备完成！" -ForegroundColor Green
Write-Host ""
Write-Host "现在可以运行测试:"
Write-Host "  cd springboot1ngh61a2"
Write-Host "  mvn test"
Write-Host ""

