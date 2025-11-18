/**
 * 认证相关工具函数
 */

import { STORAGE_KEYS } from './constants'
import { useUserStore } from '@/stores/user'
import router from '@/router'

/**
 * 获取Token
 */
export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

/**
 * 设置Token
 */
export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)
}

/**
 * 移除Token
 */
export function removeToken(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getToken()
}

/**
 * 退出登录
 */
export function logout(): void {
  const userStore = useUserStore()
  userStore.logout()
  router.push({ name: 'Login' })
}

/**
 * 检查权限
 * @param permission 权限标识
 */
export function hasPermission(permission: string): boolean {
  // TODO: 实现权限检查逻辑
  return true
}

/**
 * 检查角色
 * @param role 角色
 */
export function hasRole(role: string): boolean {
  const userStore = useUserStore()
  return userStore.userRole === role
}


