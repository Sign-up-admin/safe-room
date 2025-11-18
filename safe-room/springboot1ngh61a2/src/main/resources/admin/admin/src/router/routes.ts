import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/password-login',
    name: 'PasswordLogin',
    component: () => import('@/views/password-login.vue'),
    meta: { title: '账号密码登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home.vue'),
    meta: { title: '首页', requiresAuth: true }
  },
  {
    path: '/center',
    name: 'Center',
    component: () => import('@/views/center.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/updatePassword',
    name: 'UpdatePassword',
    component: () => import('@/views/update-password.vue'),
    meta: { title: '修改密码', requiresAuth: true }
  },
  {
    path: '/yonghu',
    name: 'Yonghu',
    component: () => import('@/views/modules/yonghu/list.vue'),
    meta: { title: '用户管理', requiresAuth: true }
  },
  {
    path: '/jianshenjiaolian',
    name: 'Jianshenjiaolian',
    component: () => import('@/views/modules/jianshenjiaolian/list.vue'),
    meta: { title: '健身教练管理', requiresAuth: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: { title: '页面未找到' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

