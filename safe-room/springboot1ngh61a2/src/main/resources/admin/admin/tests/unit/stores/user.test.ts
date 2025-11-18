import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import type { UserInfo } from '@/types/user'

describe('useUserStore', () => {
  beforeEach(() => {
    // 创建新的pinia实例
    setActivePinia(createPinia())
    // 清空localStorage
    localStorage.clear()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useUserStore()
      expect(store.userInfo).toBeNull()
      expect(store.token).toBe('')
      expect(store.isAuthenticated).toBe(false)
      expect(store.username).toBe('')
      expect(store.userRole).toBeNull()
      expect(store.displayName).toBe('访客')
    })
  })

  describe('setUserInfo', () => {
    it('应该设置用户信息', () => {
      const store = useUserStore()
      const userInfo: UserInfo = {
        id: 1,
        username: 'testuser',
        name: 'Test User',
        role: 'ADMIN',
        token: 'test-token',
      }

      store.setUserInfo(userInfo)

      expect(store.userInfo).toEqual(userInfo)
      expect(store.token).toBe('test-token')
      expect(store.isAuthenticated).toBe(true)
      expect(localStorage.getItem('token')).toBe('test-token')
    })

    it('应该更新计算属性', () => {
      const store = useUserStore()
      const userInfo: UserInfo = {
        id: 1,
        username: 'testuser',
        name: 'Test User',
        role: 'ADMIN',
        token: 'test-token',
      }

      store.setUserInfo(userInfo)

      expect(store.username).toBe('testuser')
      expect(store.userRole).toBe('ADMIN')
      expect(store.displayName).toBe('Test User')
    })

    it('没有name时应该使用username作为displayName', () => {
      const store = useUserStore()
      const userInfo: UserInfo = {
        id: 1,
        username: 'testuser',
        role: 'USER',
        token: 'test-token',
      }

      store.setUserInfo(userInfo)

      expect(store.displayName).toBe('testuser')
    })
  })

  describe('setToken', () => {
    it('应该设置token', () => {
      const store = useUserStore()
      store.setToken('new-token')

      expect(store.token).toBe('new-token')
      expect(store.isAuthenticated).toBe(true)
      expect(localStorage.getItem('token')).toBe('new-token')
    })

    it('空token应该设置isAuthenticated为false', () => {
      const store = useUserStore()
      store.setToken('')
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('logout', () => {
    it('应该清除所有用户信息', () => {
      const store = useUserStore()
      const userInfo: UserInfo = {
        id: 1,
        username: 'testuser',
        role: 'ADMIN',
        token: 'test-token',
      }

      store.setUserInfo(userInfo)
      store.logout()

      expect(store.userInfo).toBeNull()
      expect(store.token).toBe('')
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('userInfo')).toBeNull()
    })
  })

  describe('initUser', () => {
    it('应该从localStorage初始化用户信息', () => {
      const userInfo: UserInfo = {
        id: 1,
        username: 'testuser',
        name: 'Test User',
        role: 'ADMIN',
      }

      localStorage.setItem('token', 'saved-token')
      localStorage.setItem('userInfo', JSON.stringify(userInfo))

      const store = useUserStore()
      store.initUser()

      expect(store.token).toBe('saved-token')
      expect(store.isAuthenticated).toBe(true)
      expect(store.userInfo).toEqual(userInfo)
    })

    it('无效的userInfo JSON应该被忽略', () => {
      localStorage.setItem('token', 'saved-token')
      localStorage.setItem('userInfo', 'invalid-json')

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const store = useUserStore()
      store.initUser()

      expect(store.token).toBe('saved-token')
      expect(store.userInfo).toBeNull()

      consoleErrorSpy.mockRestore()
    })

    it('没有保存的信息时应该保持初始状态', () => {
      const store = useUserStore()
      store.initUser()

      expect(store.token).toBe('')
      expect(store.isAuthenticated).toBe(false)
      expect(store.userInfo).toBeNull()
    })
  })
})

