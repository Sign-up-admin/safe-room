import { describe, it, expect } from 'vitest'
import pinia from '@/stores/index'

describe('Pinia Store 配置', () => {
  it('应该正确导出pinia实例', () => {
    expect(pinia).toBeDefined()
    expect(pinia).toBeInstanceOf(Object)
    expect(pinia.install).toBeDefined()
    expect(typeof pinia.install).toBe('function')
  })

  it('pinia实例应该有必要的属性', () => {
    expect(pinia.state).toBeDefined()
    expect(pinia._s).toBeDefined()
    expect(pinia._e).toBeDefined()
    expect(pinia._a).toBeDefined()
  })
})
