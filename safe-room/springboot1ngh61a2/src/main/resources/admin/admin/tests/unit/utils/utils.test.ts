import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isAuth, getCurDateTime, getCurDate } from '../../../src/utils/utils'
import storage from '../../../src/utils/storage'
import menu from '../../../src/utils/menu'

// Mock dependencies
vi.mock('@/utils/storage', () => ({
  default: {
    get: vi.fn(),
  },
}))

vi.mock('@/utils/menu', () => ({
  default: {
    list: vi.fn(() => [
      {
        roleName: 'Administrator',
        backMenu: [
          {
            menu: '系统管理',
            child: [
              {
                menu: '用户管理',
                tableName: 'users',
                buttons: ['Add', 'Update', 'Delete', 'View'],
              },
            ],
          },
        ],
      },
    ]),
  },
}))

describe('Utils工具', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isAuth', () => {
    it('如果用户有权限，应该返回true', () => {
      ;(storage.get as any).mockReturnValue('Administrator')
      const result = isAuth('users', 'Add')
      expect(result).toBe(true)
    })

    it('如果用户没有权限，应该返回false', () => {
      ;(storage.get as any).mockReturnValue('Administrator')
      const result = isAuth('users', 'Export')
      expect(result).toBe(false)
    })

    it('如果角色不存在，应该使用默认角色Administrator', () => {
      ;(storage.get as any).mockReturnValue(null)
      const result = isAuth('users', 'Add')
      expect(result).toBe(true)
    })

    it('如果tableName不存在，应该返回false', () => {
      ;(storage.get as any).mockReturnValue('Administrator')
      const result = isAuth('nonexistent', 'Add')
      expect(result).toBe(false)
    })

    it('如果按钮列表为空，应该返回false', () => {
      ;(storage.get as any).mockReturnValue('Administrator')
      const result = isAuth('users', 'Nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('getCurDateTime', () => {
    it('应该返回格式化的日期时间字符�?, () => {
      const result = getCurDateTime()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{1,2}:\d{1,2}:\d{1,2}$/)
    })

    it('应该包含当前日期', () => {
      const result = getCurDateTime()
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      expect(result).toContain(`${year}-${month}-${day}`)
    })

    it('月份和日期应该是两位�?, () => {
      const result = getCurDateTime()
      const parts = result.split(' ')
      const datePart = parts[0]
      const [year, month, day] = datePart.split('-')
      expect(month.length).toBe(2)
      expect(day.length).toBe(2)
    })
  })

  describe('getCurDate', () => {
    it('应该返回格式化的日期字符�?, () => {
      const result = getCurDate()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('应该包含当前日期', () => {
      const result = getCurDate()
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      expect(result).toBe(`${year}-${month}-${day}`)
    })

    it('月份和日期应该是两位�?, () => {
      const result = getCurDate()
      const [year, month, day] = result.split('-')
      expect(month.length).toBe(2)
      expect(day.length).toBe(2)
    })

    it('不应该包含时间部�?, () => {
      const result = getCurDate()
      expect(result).not.toContain(':')
      expect(result.split(' ').length).toBe(1)
    })
  })
})

