/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, SessionResponse } from '@/types/api'
import { tokenStorage } from '@/utils/secureStorage'
import storage from '@/utils/storage'
import http from '@/utils/http'
import api from '@/utils/api'

interface UserState {
  user: User | null
  token: string | null
  role: string | null
  permissions: string[]
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const role = ref<string | null>(null)
  const permissions = ref<string[]>([])

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => user.value?.username || '')
  const userRole = computed(() => role.value || '')

  /**
   * 初始化用户信息（从存储中恢复）
   */
  function initUser() {
    const storedToken = tokenStorage.getToken() || storage.get('Token')
    if (storedToken) {
      token.value = storedToken
      // 尝试从存储中恢复用户信息
      const storedUser = storage.get('user')
      if (storedUser && typeof storedUser === 'object') {
        user.value = storedUser as User
      }
      const storedRole = storage.get('role')
      if (storedRole) {
        role.value = storedRole
      }
    }
  }

  /**
   * 设置用户信息
   */
  function setUser(userData: User | null, userToken: string | null, userRole: string | null) {
    user.value = userData
    token.value = userToken
    role.value = userRole

    if (userToken) {
      tokenStorage.setToken(userToken)
      storage.set('Token', userToken)
    }
    if (userData) {
      storage.set('user', userData)
    }
    if (userRole) {
      storage.set('role', userRole)
    }
  }

  /**
   * 获取当前用户会话信息
   */
  async function fetchSession(): Promise<SessionResponse | null> {
    try {
      const response = await http.get<SessionResponse>(api.session)
      if (response.data) {
        user.value = response.data as User
        role.value = response.data.role || null
        storage.set('user', response.data)
        storage.set('role', response.data.role)
        return response.data
      }
      return null
    } catch (error) {
      console.error('获取用户会话失败:', error)
      return null
    }
  }

  /**
   * 设置权限
   */
  function setPermissions(perms: string[]) {
    permissions.value = perms
  }

  /**
   * 检查权限
   */
  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  /**
   * 检查角色
   */
  function hasRole(roleName: string): boolean {
    return role.value === roleName
  }

  /**
   * 登出
   */
  function logout() {
    user.value = null
    token.value = null
    role.value = null
    permissions.value = []
    tokenStorage.clearToken()
    storage.remove('Token')
    storage.remove('user')
    storage.remove('role')
  }

  // 初始化
  initUser()

  return {
    // 状态
    user,
    token,
    role,
    permissions,
    // 计算属性
    isAuthenticated,
    userName,
    userRole,
    // 方法
    setUser,
    fetchSession,
    setPermissions,
    hasPermission,
    hasRole,
    logout,
    initUser,
  }
})
