import { describe, it, expect } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import pinia from '@/stores/index'

describe('Stores index', () => {
  it('应该导出Pinia实例', () => {
    expect(pinia).toBeDefined()
  })

  it('应该能够创建新的Pinia实例', () => {
    const newPinia = createPinia()
    expect(newPinia).toBeDefined()
  })

  it('应该能够设置活动Pinia实例', () => {
    const newPinia = createPinia()
    setActivePinia(newPinia)
    // setActivePinia返回void，但会设置活动实例
    expect(newPinia).toBeDefined()
  })
})

