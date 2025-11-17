#!/bin/sh
# 可选的覆盖率检查脚本
# 使用方法: ENABLE_COVERAGE_CHECK=true npm run prepare 或在pre-commit中启用

if [ "$ENABLE_COVERAGE_CHECK" != "true" ]; then
  echo "⏭️  覆盖率检查已跳过 (设置 ENABLE_COVERAGE_CHECK=true 启用)"
  exit 0
fi

echo "🔍 运行覆盖率检查..."

# 运行覆盖率测试
npm run test:coverage

# 检查退出码
if [ $? -eq 0 ]; then
  echo "✅ 覆盖率检查通过"
  exit 0
else
  echo "❌ 覆盖率检查失败，请确保覆盖率达到阈值"
  echo "💡 提示: 可以通过设置 ENABLE_COVERAGE_CHECK=false 跳过此检查"
  exit 1
fi

