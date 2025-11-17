import { describe, it, expect } from 'vitest'
import { MENU_CONFIG, getMenuList } from '@/constants/menu'

describe('菜单常量', () => {
  describe('MENU_CONFIG', () => {
    it('应该包含菜单配置', () => {
      expect(MENU_CONFIG).toBeDefined()
      expect(Array.isArray(MENU_CONFIG)).toBe(true)
      expect(MENU_CONFIG.length).toBeGreaterThan(0)
    })

    it('每个菜单项应该包含roleName', () => {
      MENU_CONFIG.forEach(menu => {
        expect(menu).toHaveProperty('roleName')
        expect(typeof menu.roleName).toBe('string')
      })
    })

    it('每个菜单项应该包含backMenu', () => {
      MENU_CONFIG.forEach(menu => {
        expect(menu).toHaveProperty('backMenu')
        expect(Array.isArray(menu.backMenu)).toBe(true)
      })
    })

    it('应该包含Administrator角色', () => {
      const adminMenu = MENU_CONFIG.find(m => m.roleName === 'Administrator')
      expect(adminMenu).toBeDefined()
      expect(adminMenu?.backMenu.length).toBeGreaterThan(0)
    })

    it('应该包含User角色', () => {
      const userMenu = MENU_CONFIG.find(m => m.roleName === 'User')
      expect(userMenu).toBeDefined()
    })

    it('应该包含Fitness Coach角色', () => {
      const coachMenu = MENU_CONFIG.find(m => m.roleName === 'Fitness Coach')
      expect(coachMenu).toBeDefined()
    })
  })

  describe('getMenuList', () => {
    it('应该返回菜单配置数组', () => {
      const menuList = getMenuList()
      expect(Array.isArray(menuList)).toBe(true)
      expect(menuList.length).toBeGreaterThan(0)
    })

    it('应该返回MENU_CONFIG', () => {
      const menuList = getMenuList()
      expect(menuList).toBe(MENU_CONFIG)
    })
  })
})

