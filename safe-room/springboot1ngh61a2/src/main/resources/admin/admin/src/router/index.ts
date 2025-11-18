/**
 * 路由配置入口文件
 * 统一管理路由配置和路由守卫
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import { tokenStorage } from '@/utils/secureStorage'
import storage from '@/utils/storage'
import { routes } from './routes'

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

/**
 * 公开路由路径列表（无需认证）
 */
const PUBLIC_ROUTES = ['/login', '/password-login', '/register', '/forgot-password', '/reset-password', '/error']

/**
 * 检查是否是公开路由
 */
function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path === route || path.startsWith(route + '/'))
}

/**
 * 获取Token（优先从secureStorage获取，其次从localStorage获取）
 * 确保能读取到刚设置的token
 */
function getToken(): string | null {
  // 优先从secureStorage获取（带过期时间检查）
  const secureToken = tokenStorage.getToken()
  if (secureToken) {
    return secureToken
  }
  
  // 向后兼容，从localStorage获取
  const legacyToken = storage.get('Token')
  if (legacyToken) {
    return legacyToken
  }
  
  return null
}

/**
 * 路由守卫：权限验证
 */
router.beforeEach((to, _from, next) => {
  // 检查是否是公开路由
  if (isPublicRoute(to.path)) {
    // 如果已登录，访问登录页时重定向到首页
    const token = getToken()
    if (token && (to.path === '/login' || to.path === '/password-login')) {
      next('/')
      return
    }
    next()
    return
  }

  // 检查Token是否存在且有效
  const token = getToken()

  if (!token) {
    // 未登录，清除所有存储并重定向到登录页
    tokenStorage.clearToken()
    storage.remove('Token')
    next({
      path: '/login',
      query: { redirect: to.fullPath }, // 保存原始路径，登录后可以跳转回来
    })
    return
  }

  // Token存在，允许访问
  next()
})

export default router
