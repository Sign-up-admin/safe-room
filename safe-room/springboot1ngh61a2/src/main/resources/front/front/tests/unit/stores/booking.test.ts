import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useBookingStore } from '@/stores/booking'

describe('stores/booking', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('updates booking selections and contact info', () => {
    const store = useBookingStore()

    store.setCourse(10)
    store.setSlot({ date: '2025-01-10', time: '09:00', label: '早间' })
    store.updateContact({ contact: 'Alice', phone: '123', remark: 'prefers AM' })

    expect(store.selectedCourseId).toBe(10)
    expect(store.slot).toEqual({ date: '2025-01-10', time: '09:00', label: '早间' })
    expect(store.contact).toBe('Alice')
    expect(store.phone).toBe('123')
    expect(store.remark).toBe('prefers AM')

    store.reset()
    expect(store.selectedCourseId).toBeUndefined()
    expect(store.slot).toBeUndefined()
    expect(store.contact).toBe('')
    expect(store.phone).toBe('')
    expect(store.remark).toBe('')
  })
})


