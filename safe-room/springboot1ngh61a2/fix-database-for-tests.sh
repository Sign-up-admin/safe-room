#!/bin/bash

# 数据库修复脚本 - 为前端测试准备数据库
# 执行时间：2025-11-XX

# 默认参数
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"3306"}
DB_NAME=${DB_NAME:-"springboot1ngh61a2"}
DB_USER=${DB_USER:-"root"}
DB_PASS=${DB_PASS:-"123456"}

echo "开始修复数据库以支持前端测试..."

# 检查MySQL客户端是否可用
if ! command -v mysql &> /dev/null; then
    echo "错误：未找到MySQL客户端。请确保MySQL已安装并在PATH中。"
    exit 1
fi

# 数据库连接字符串
CONNECTION_STRING="-h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME"

# 执行数据库修复脚本
SQL_FILE="fix-database-for-tests.sql"

if [ -f "$SQL_FILE" ]; then
    echo "执行数据库修复脚本：$SQL_FILE"
    if mysql $CONNECTION_STRING -e "SOURCE $SQL_FILE"; then
        echo "数据库修复脚本执行成功！"
    else
        echo "数据库修复脚本执行失败！"
        exit 1
    fi
else
    echo "错误：找不到数据库修复脚本文件 $SQL_FILE"
    exit 1
fi

# 验证关键数据
echo "验证数据库修复结果..."

# 检查用户表
USER_COUNT=$(mysql $CONNECTION_STRING -e "SELECT COUNT(*) as count FROM yonghu WHERE yonghuzhanghao = 'testuser';" -s -N)
if [ "$USER_COUNT" -gt 0 ]; then
    echo "✓ 测试用户数据存在"
else
    echo "✗ 测试用户数据缺失"
fi

# 检查教练表
COACH_COUNT=$(mysql $CONNECTION_STRING -e "SELECT COUNT(*) as count FROM jianshenjiaolian WHERE jiaoliangonghao = 'testcoach';" -s -N)
if [ "$COACH_COUNT" -gt 0 ]; then
    echo "✓ 测试教练数据存在"
else
    echo "✗ 测试教练数据缺失"
fi

# 检查课程表
COURSE_COUNT=$(mysql $CONNECTION_STRING -e "SELECT COUNT(*) as count FROM jianshenkecheng WHERE name = '测试课程';" -s -N)
if [ "$COURSE_COUNT" -gt 0 ]; then
    echo "✓ 测试课程数据存在"
else
    echo "✗ 测试课程数据缺失"
fi

echo "数据库修复完成！"
echo ""
echo "现在可以运行前端测试了。"
