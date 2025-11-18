/**
 * 路由配置入口文件
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './routes'

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 路由守卫已移除，允许自由访问所有路由

export default router
