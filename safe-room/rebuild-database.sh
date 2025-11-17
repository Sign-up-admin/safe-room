#!/bin/bash
# 数据库重建脚本
# 用于重建并初始化 PostgreSQL 数据库

# 默认配置
DB_NAME="${DB_NAME:-fitness_gym}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "========================================="
echo "  数据库重建脚本"
echo "========================================="
echo ""

echo "数据库配置:"
echo "  数据库名: $DB_NAME"
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  用户: $DB_USER"
echo ""

# 检查 PostgreSQL 是否可用
echo "检查 PostgreSQL 连接..."
export PGPASSWORD="$DB_PASSWORD"
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo "错误: 无法连接到 PostgreSQL 数据库！"
    echo "请确保 PostgreSQL 已启动并且连接信息正确。"
    exit 1
fi
echo "✓ PostgreSQL 连接正常"
echo ""

# 确认操作
echo "警告: 此操作将删除数据库 '$DB_NAME' 中的所有数据！"
read -p "是否继续？(yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "操作已取消。"
    exit 0
fi
echo ""

# 终止现有连接
echo "终止现有数据库连接..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" > /dev/null 2>&1
echo "✓ 连接已终止"
echo ""

# 删除数据库
echo "删除现有数据库 '$DB_NAME'..."
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" > /dev/null 2>&1; then
    echo "警告: 删除数据库时出现错误（可能数据库不存在）"
else
    echo "✓ 数据库已删除"
fi
echo ""

# 创建新数据库
echo "创建新数据库 '$DB_NAME'..."
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME WITH ENCODING='UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0;" > /dev/null 2>&1; then
    echo "错误: 创建数据库失败！"
    exit 1
fi
echo "✓ 数据库已创建"
echo ""

# 执行 schema 脚本
SCHEMA_FILE="springboot1ngh61a2/src/main/resources/schema-postgresql.sql"
if [ -f "$SCHEMA_FILE" ]; then
    echo "执行数据库结构脚本..."
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE" > /dev/null 2>&1; then
        echo "错误: 执行 schema 脚本失败！"
        exit 1
    fi
    echo "✓ 数据库结构已创建"
    echo ""
else
    echo "警告: 找不到 schema 文件: $SCHEMA_FILE"
    echo ""
fi

# 执行 data 脚本
DATA_FILE="springboot1ngh61a2/src/main/resources/data.sql"
if [ -f "$DATA_FILE" ]; then
    echo "执行初始数据脚本..."
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$DATA_FILE" > /dev/null 2>&1; then
        echo "错误: 执行 data 脚本失败！"
        exit 1
    fi
    echo "✓ 初始数据已插入"
    echo ""
else
    echo "警告: 找不到 data 文件: $DATA_FILE"
    echo ""
fi

# 验证数据库
echo "验证数据库..."
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
USER_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users;" | xargs)

echo "✓ 数据库验证完成"
echo "  表数量: $TABLE_COUNT"
echo "  用户数量: $USER_COUNT"
echo ""

echo "========================================="
echo "  数据库重建完成！"
echo "========================================="
echo ""
echo "默认账户信息:"
echo "  管理员: admin / admin"
echo "  用户: user01-user10 / 123456"
echo "  教练: coach001-coach005 / 123456"
echo ""
echo "注意: 首次登录时，系统会自动将密码迁移到 BCrypt 加密格式。"
echo ""

unset PGPASSWORD

