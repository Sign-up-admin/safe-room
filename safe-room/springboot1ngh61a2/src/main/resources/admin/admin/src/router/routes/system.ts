/**
 * 系统管理模块路由配置
 */
import { RouteRecordRaw } from 'vue-router'

/**
 * 系统管理路由
 * 使用懒加载优化性能
 */
export const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/service-status',
    name: 'Service Status',
    component: () => import('@/views/modules/service-status/list.vue'),
  },
  {
    path: '/legal-terms',
    name: 'Legal Terms Management',
    component: () => import('@/views/modules/legal-terms/list.vue'),
  },
  {
    path: '/operation-log',
    name: 'Operation Log',
    component: () => import('@/views/modules/operation-log/list.vue'),
  },
  {
    path: '/system-messages',
    name: 'System Messages',
    component: () => import('@/views/modules/system-messages/list.vue'),
  },
  {
    path: '/users',
    name: 'Admin Users',
    component: () => import('@/views/modules/users/list.vue'),
  },
]

