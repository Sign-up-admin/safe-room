/**
 * 路由配置模块
 * 将路由配置拆分为模块化结构，便于维护
 */
import { RouteRecordRaw } from 'vue-router'
import { markRaw } from 'vue'

// 基础页面组件
import Index from '@/views/index.vue'
import Home from '@/views/home.vue'
import Login from '@/views/login.vue'
import NotFound from '@/views/404.vue'
import UpdatePassword from '@/views/update-password.vue'
import ForgotPassword from '@/views/forgot-password.vue'
import ResetPassword from '@/views/reset-password.vue'
import Pay from '@/views/pay.vue'
import Register from '@/views/register.vue'
import Center from '@/views/center.vue'

// 业务模块路由配置
import { businessRoutes } from './business'
import { systemRoutes } from './system'

/**
 * 公开路由（无需认证）
 */
export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: markRaw(Login),
    meta: { icon: '', title: 'login' },
  },
  {
    path: '/register',
    name: 'register',
    component: markRaw(Register),
    meta: { icon: '', title: 'register' },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: markRaw(ForgotPassword),
    meta: { icon: '', title: 'forgot-password' },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: markRaw(ResetPassword),
    meta: { icon: '', title: 'reset-password' },
  },
  {
    path: '/error/:code',
    name: 'ErrorPage',
    component: () => import('@/views/error/ErrorPage.vue'),
    props: true,
  },
]

/**
 * 主应用路由（需要认证）
 */
export const mainRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'System Home',
    component: markRaw(Index),
    children: [
      {
        path: '',
        name: 'System Home Dashboard',
        component: markRaw(Home),
        meta: { icon: '', title: 'center', affix: true },
      },
      {
        path: '/updatePassword',
        name: 'Change Password',
        component: markRaw(UpdatePassword),
        meta: { icon: '', title: 'updatePassword' },
      },
      {
        path: '/pay',
        name: 'Payment',
        component: markRaw(Pay),
        meta: { icon: '', title: 'pay' },
      },
      {
        path: '/center',
        name: 'Personal Information',
        component: markRaw(Center),
        meta: { icon: '', title: 'center' },
      },
      // 业务模块路由
      ...businessRoutes,
      // 系统管理路由
      ...systemRoutes,
    ],
  },
]

/**
 * 404路由
 */
export const notFoundRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: markRaw(NotFound),
}

/**
 * 所有路由配置
 */
export const routes: RouteRecordRaw[] = [...publicRoutes, ...mainRoutes, notFoundRoute]

