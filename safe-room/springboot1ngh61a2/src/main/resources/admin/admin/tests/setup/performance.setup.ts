/**
 * Vitest 性能监控 Setup
 * 在测试运行期间收集性能指标
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { performanceMonitor } from '../utils/performance-monitor'

// 全局变量用于跟踪当前测试信息
declare global {
  var __currentTestName: string | undefined
  var __currentTestFile: string | undefined
}

/**
 * 初始化性能监控会话
 */
beforeAll(() => {
  performanceMonitor.startSession()
})

/**
 * 测试开始前记录
 */
beforeEach((context) => {
  const testName = context.task.name
  const fileName = context.task.file?.name || 'unknown'

  globalThis.__currentTestName = testName
  globalThis.__currentTestFile = fileName

  performanceMonitor.recordTestStart(testName, fileName)
})

/**
 * 测试结束后记录并清理
 */
afterEach((context) => {
  const testName = globalThis.__currentTestName || context.task.name
  const fileName = globalThis.__currentTestFile || context.task.file?.name || 'unknown'

  performanceMonitor.recordTestEnd(testName, fileName)

  // 清理全局变量
  globalThis.__currentTestName = undefined
  globalThis.__currentTestFile = undefined
})

/**
 * 所有测试结束后生成性能报告
 */
afterAll(async () => {
  // 打印性能报告到控制台
  performanceMonitor.printReport()

  // 保存性能报告到文件
  const reportPath = './test-results/performance-report.json'
  try {
    await performanceMonitor.saveReportToFile(reportPath)
  } catch (error) {
    console.warn('无法保存性能报告文件:', error)
  }

  // 检查慢测试并给出建议
  const slowTests = performanceMonitor.checkForSlowTests(2000) // 2秒阈值
  if (slowTests.length > 0) {
    console.log('\n⚠️ 发现慢测试 (>2秒):')
    slowTests.forEach(test => {
      console.log(`  - ${test.testName} (${test.fileName}): ${test.duration}ms`)
    })
    console.log('建议优化这些测试或考虑拆分为更小的测试单元')
  }

  // 清理性能监控数据
  performanceMonitor.clear()
})
