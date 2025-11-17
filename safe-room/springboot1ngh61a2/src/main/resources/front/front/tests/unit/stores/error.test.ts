import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useErrorStore } from '@/stores/error'

describe('错误状态管理', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应该有正确的初始状态', () => {
    const errorStore = useErrorStore()
    expect(errorStore.lastError).toBeNull()
  })

  it('应该能设置错误信息', () => {
    const errorStore = useErrorStore()
    const testError = {
      code: 'TEST_ERROR',
      message: '测试错误信息',
      from: 'test-component'
    }

    errorStore.setError(testError.code, testError.message, testError.from)

    expect(errorStore.lastError).not.toBeNull()
    expect(errorStore.lastError?.code).toBe(testError.code)
    expect(errorStore.lastError?.message).toBe(testError.message)
    expect(errorStore.lastError?.from).toBe(testError.from)
    expect(errorStore.lastError?.timestamp).toBeGreaterThan(0)
  })

  it('应该能清除错误信息', () => {
    const errorStore = useErrorStore()

    // 先设置错误
    errorStore.setError('TEST_ERROR', '测试错误', 'test-component')
    expect(errorStore.lastError).not.toBeNull()

    // 清除错误
    errorStore.clearError()
    expect(errorStore.lastError).toBeNull()
  })

  it('应该用新错误覆盖旧错误', () => {
    const errorStore = useErrorStore()

    // 设置第一个错误
    errorStore.setError('OLD_ERROR', '旧错误', 'old-component')
    expect(errorStore.lastError?.code).toBe('OLD_ERROR')

    // 设置第二个错误
    errorStore.setError('NEW_ERROR', '新错误', 'new-component')
    expect(errorStore.lastError?.code).toBe('NEW_ERROR')
    expect(errorStore.lastError?.message).toBe('新错误')
    expect(errorStore.lastError?.from).toBe('new-component')
  })

  it('应该生成正确的时间戳', () => {
    const errorStore = useErrorStore()
    const beforeTime = Date.now()

    errorStore.setError('TEST_ERROR', '测试错误', 'test-component')

    const afterTime = Date.now()
    const errorTimestamp = errorStore.lastError?.timestamp

    expect(errorTimestamp).toBeGreaterThanOrEqual(beforeTime)
    expect(errorTimestamp).toBeLessThanOrEqual(afterTime)
  })
})
