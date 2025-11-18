/**
 * 性能测试配置
 * 用于监控测试执行性能
 */

// 性能监控（仅在浏览器环境中启用）
if (typeof globalThis.performance !== 'undefined' && globalThis.performance.now) {
  const originalNow = globalThis.performance.now.bind(globalThis.performance)
  let testStartTime: number | null = null

  beforeAll(() => {
    testStartTime = originalNow()
  })

  afterAll(() => {
    if (testStartTime !== null) {
      const duration = originalNow() - testStartTime
      console.log(`测试总执行时间: ${duration.toFixed(2)}ms`)
    }
  })
}
