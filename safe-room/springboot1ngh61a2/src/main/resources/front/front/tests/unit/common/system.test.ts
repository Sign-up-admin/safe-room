import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('@/config/menu', () => {
  const listMock = vi.fn(() => [
    {
      tableName: 'users',
      frontMenu: [
        {
          child: [
            {
              tableName: 'yonghu',
              buttons: ['新增', '查看'],
            },
          ],
        },
      ],
      backMenu: [
        {
          child: [
            {
              tableName: 'yonghu',
              buttons: ['审批'],
            },
          ],
        },
      ],
    },
  ])

  return {
    default: {
      list: listMock,
    },
    __esModule: true,
  }
})

import { getCurDate, getCurDateTime, isAuth, isBackAuth } from '@/common/system'

describe('system utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('checks front-end permissions with default role', () => {
    expect(isAuth('yonghu', '新增')).toBe(true)
    expect(isAuth('yonghu', '删除')).toBe(false)
  })

  it('checks back-end permissions with stored role', () => {
    localStorage.setItem('UserTableName', 'users')
    expect(isBackAuth('yonghu', '审批')).toBe(true)
    expect(isBackAuth('yonghu', '新增')).toBe(false)
  })

  it('formats current time utilities', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T08:09:10Z'))
    expect(getCurDate()).toBe('2024-01-15')
    expect(getCurDateTime()).toMatch(/^2024-01-15 \d{1,2}:\d{1,2}:\d{1,2}$/)
    vi.useRealTimers()
  })
})


