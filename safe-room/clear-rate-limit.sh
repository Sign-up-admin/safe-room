#!/bin/bash
# 清除登录限流记录的Bash脚本
# 使用方法：chmod +x clear-rate-limit.sh && ./clear-rate-limit.sh

SERVER_URL="${1:-http://192.168.3.142:8081}"
IP="${2:-}"
KEY="${3:-}"

BASE_URL="$SERVER_URL/springboot1ngh61a2/admin/clearRateLimit"

echo "========================================"
echo "清除登录限流记录工具"
echo "========================================"
echo ""

# 构建请求URL
URL="$BASE_URL"
PARAMS=""

if [ -n "$IP" ]; then
    PARAMS="ip=$IP"
fi

if [ -n "$KEY" ]; then
    if [ -n "$PARAMS" ]; then
        PARAMS="$PARAMS&key=$KEY"
    else
        PARAMS="key=$KEY"
    fi
fi

if [ -n "$PARAMS" ]; then
    URL="$URL?$PARAMS"
fi

echo "请求URL: $URL"
echo ""

# 发送请求
RESPONSE=$(curl -s -X POST "$URL" -H "Content-Type: application/json")

# 检查响应
if [ $? -eq 0 ]; then
    CODE=$(echo "$RESPONSE" | grep -o '"code":[0-9]*' | grep -o '[0-9]*')
    MSG=$(echo "$RESPONSE" | grep -o '"msg":"[^"]*"' | sed 's/"msg":"\(.*\)"/\1/')
    
    if [ "$CODE" = "0" ]; then
        echo "✓ 成功：$MSG"
        echo ""
        echo "现在可以重新尝试登录了！"
    else
        echo "✗ 失败：$MSG"
    fi
else
    echo "✗ 请求失败"
    echo ""
    echo "提示："
    echo "1. 检查服务器地址是否正确"
    echo "2. 检查应用是否正在运行"
    echo "3. 如果配置了安全密钥，请提供密钥参数"
    echo ""
    echo "使用示例："
    echo "  ./clear-rate-limit.sh http://localhost:8080"
    echo "  ./clear-rate-limit.sh http://localhost:8080 192.168.1.100 your_secret_key"
fi





