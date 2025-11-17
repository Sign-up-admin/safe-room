#!/usr/bin/env node

/**
 * 新功能测试运行脚本
 * 用于验证新实现功能的自动化测试
 */

const { execSync } = require('child_process')
const path = require('path')

console.log('🏃 正在运行新功能自动化测试...\n')

const testFiles = [
  'tests/unit/composables/useBookingRecommend.test.ts',
  'tests/unit/composables/useFavoritesStore.test.ts',
  'tests/unit/components/discussion/DiscussionComposer.test.ts',
  'tests/unit/components/favorites/FavoritesOverview.test.ts',
  'tests/unit/utils/formatters.test.ts'
]

try {
  // 运行新功能测试
  console.log('📋 测试文件列表:')
  testFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`)
  })
  console.log()

  // 使用vitest运行测试
  const testCommand = `npm run test:new-features`
  console.log(`🔧 执行命令: ${testCommand}\n`)

  const result = execSync(testCommand, {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    encoding: 'utf8'
  })

  console.log('\n✅ 所有新功能测试通过!')
  console.log('\n📊 测试覆盖的功能模块:')
  console.log('  • 课程预约智能推荐算法 (useBookingRecommend)')
  console.log('  • 收藏管理状态存储 (useFavoritesStore)')
  console.log('  • 讨论发帖组件 (DiscussionComposer)')
  console.log('  • 收藏概览组件 (FavoritesOverview)')
  console.log('  • 格式化工具函数 (formatters)')

} catch (error) {
  console.error('\n❌ 测试运行失败:')
  console.error(error.message)

  if (error.stdout) {
    console.log('\n📝 测试输出:')
    console.log(error.stdout)
  }

  if (error.stderr) {
    console.log('\n⚠️ 错误信息:')
    console.log(error.stderr)
  }

  process.exit(1)
}

console.log('\n🎯 测试完成! 所有新功能都已通过自动化测试验证。')
console.log('\n💡 提示:')
console.log('  • 使用 `npm run test:new-features:watch` 启动监听模式')
console.log('  • 使用 `npm run test:coverage` 查看测试覆盖率')
console.log('  • 使用 `npm run test:unit:ui` 启动可视化测试界面')
