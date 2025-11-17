#!/bin/bash
# 重置admin账户密码的Bash脚本
# 使用方法：chmod +x reset-admin-password.sh && ./reset-admin-password.sh

set -e

# 默认参数
USERNAME="${1:-admin}"
NEW_PASSWORD="${2:-admin}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-fitness_gym}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

echo "========================================"
echo "重置Admin账户密码工具"
echo "========================================"
echo ""

echo "数据库连接信息："
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo ""

# 检查是否安装了psql
if ! command -v psql &> /dev/null; then
    echo "错误：未找到psql命令。请确保PostgreSQL客户端已安装。"
    echo "或者使用Docker容器中的psql："
    echo "  docker exec -it <postgres-container-name> psql -U postgres -d fitness_gym"
    exit 1
fi

echo "正在重置密码..."

# 执行SQL
export PGPASSWORD="$DB_PASSWORD"

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
-- 重置admin账户密码
UPDATE users 
SET 
    password = '$NEW_PASSWORD',
    password_hash = NULL,
    failed_login_attempts = 0,
    lock_until = NULL
WHERE username = '$USERNAME';

-- 验证更新结果
SELECT id, username, password, 
       CASE WHEN password_hash IS NULL THEN 'NULL (将使用旧密码)' ELSE '已设置' END as password_hash_status,
       failed_login_attempts, lock_until, role 
FROM users 
WHERE username = '$USERNAME';
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "密码重置成功！"
    echo ""
    echo "现在可以使用以下信息登录："
    echo "  用户名: $USERNAME"
    echo "  密码: $NEW_PASSWORD"
    echo ""
    echo "注意：首次登录后，系统会自动将密码迁移到BCrypt加密格式。"
else
    echo "错误：密码重置失败。请检查数据库连接和权限。"
    exit 1
fi

unset PGPASSWORD





