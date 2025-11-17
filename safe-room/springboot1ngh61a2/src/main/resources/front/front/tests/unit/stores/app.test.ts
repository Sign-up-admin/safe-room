import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAppStore } from '@/stores/app'

describe('stores/app', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('creates a lightweight application store', () => {
    const store = useAppStore()
    expect(store.$id).toBe('app')
    expect(store.$state).toEqual({})
  })
})


