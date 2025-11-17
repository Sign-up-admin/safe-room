import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBookingConflict } from '@/composables/useBookingConflict'

const courseListMock = vi.fn()
const coachListMock = vi.fn()

vi.mock('@/services/crud', () => ({
  getModuleService: (module: string) => {
    if (module === 'kechengyuyue') {
      return { list: courseListMock }
    }
    if (module === 'sijiaoyuyue') {
      return { list: coachListMock }
    }
    throw new Error(`Unexpected module ${module}`)
  },
}))

describe('useBookingConflict', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    courseListMock.mockResolvedValue({
      list: [
        {
          id: 1,
          yuyueshijian: '2025-01-10 09:00:00',
          kechengmingcheng: '燃脂团课',
        },
      ],
      total: 1,
    })
    coachListMock.mockResolvedValue({
      list: [
        {
          id: 2,
          yuyueshijian: '2025-01-10 09:00:00',
          jiaolianxingming: '教练 Li',
        },
      ],
      total: 1,
    })
  })

  it('refreshes bookings and exposes conflict helpers', async () => {
    const booking = useBookingConflict('pro-user')

    await booking.refresh()

    expect(courseListMock).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 200, yonghuzhanghao: 'pro-user' }),
    )
    expect(coachListMock).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 200, yonghuzhanghao: 'pro-user' }),
    )

    expect(booking.hasConflict('2025-01-10', '09:00')).toBe(true)
    expect(booking.resolveRemaining('2025-01-10', '09:00', 3)).toBe(1)
    expect(booking.conflictDetails('2025-01-10', '09:00')).toEqual([
      '课程预约：燃脂团课',
      '私教预约：教练 Li',
    ])
  })

  it('honors stored account info and handles empty schedules', async () => {
    localStorage.setItem('userInfo', JSON.stringify({ yonghuzhanghao: 'storage-user' }))
    courseListMock.mockResolvedValueOnce({ list: [], total: 0 })
    coachListMock.mockResolvedValueOnce({ list: [], total: 0 })

    const booking = useBookingConflict()
    expect(booking.account.value).toBe('storage-user')

    await booking.refresh()
    expect(booking.loading.value).toBe(false)
    expect(booking.hasConflict('2025-01-11', '10:00')).toBe(false)
    expect(booking.resolveRemaining('2025-01-11', '10:00', 5)).toBe(5)
    expect(booking.conflictDetails('2025-01-11', '10:00')).toEqual([])
  })
})


