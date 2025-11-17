import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock constants/menu
vi.mock('../../../src/constants/menu', () => ({
  getMenuList: vi.fn(),
}))

import menu from '../../../src/utils/menu'
import { getMenuList } from '../../../src/constants/menu'

describe('Menu工具', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getMenuList).mockReturnValue([
      {
        roleName: 'Administrator',
        backMenu: [
          {
            menu: '系统管理',
            child: [
              { menu: '用户管理', tableName: 'users' },
              { menu: '角色管理', tableName: 'roles' },
            ],
          },
        ],
      },
    ])
  })

  describe('list', () => {
    it('应该返回菜单列表', () => {
      const result = menu.list()
      expect(result).toBeTruthy()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('应该调用getMenuList函数', () => {
      menu.list()
      expect(vi.mocked(getMenuList)).toHaveBeenCalled()
    })

    it('应该返回正确的菜单结构', () => {
      const result = menu.list()
      expect(result[0]).toHaveProperty('roleName')
      expect(result[0]).toHaveProperty('backMenu')
      expect(Array.isArray(result[0].backMenu)).toBe(true)
    })
  })
})