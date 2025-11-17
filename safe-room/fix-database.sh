#!/bin/bash
# 数据库修复脚本 - 添加缺失的列
# 适用于 PostgreSQL 数据库

HOST=${DB_HOST:-localhost}
PORT=${DB_PORT:-5432}
DATABASE=${DB_NAME:-fitness_gym}
USER=${DB_USER:-postgres}
PASSWORD=${DB_PASSWORD:-postgres}

echo "开始修复数据库..."
echo "数据库: $DATABASE@${HOST}:${PORT}"

# 检查 psql 是否可用
if ! command -v psql &> /dev/null; then
    echo "错误: 未找到 psql 命令。请确保 PostgreSQL 客户端已安装。"
    exit 1
fi

# 创建临时 SQL 文件
SQL_FILE=$(mktemp)
cat > "$SQL_FILE" << 'EOF'
-- 修复 yonghu 表：添加缺失的 huiyuankamingcheng 列
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'yonghu' 
        AND column_name = 'huiyuankamingcheng'
    ) THEN
        ALTER TABLE yonghu ADD COLUMN huiyuankamingcheng VARCHAR(200);
        RAISE NOTICE '已添加列 huiyuankamingcheng';
    ELSE
        RAISE NOTICE '列 huiyuankamingcheng 已存在，跳过';
    END IF;
END $$;

-- 验证修复结果
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'yonghu' 
AND column_name = 'huiyuankamingcheng';
EOF

# 执行 SQL
export PGPASSWORD="$PASSWORD"
if psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -f "$SQL_FILE"; then
    echo ""
    echo "数据库修复成功！"
else
    echo ""
    echo "数据库修复失败！"
    rm -f "$SQL_FILE"
    unset PGPASSWORD
    exit 1
fi

# 清理
rm -f "$SQL_FILE"
unset PGPASSWORD

echo ""
echo "修复完成！"

