import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 路由配置
const routes: RouteRecordRaw[] = [
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
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/views/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home.vue'),
        meta: { title: '首页', requiresAuth: true }
      },
      {
        path: 'center',
        name: 'Center',
        component: () => import('@/views/center.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      },
      {
        path: 'updatePassword',
        name: 'UpdatePassword',
        component: () => import('@/views/update-password.vue'),
        meta: { title: '修改密码', requiresAuth: true }
      },
      {
        path: 'yonghu',
        name: 'Yonghu',
        component: () => import('@/views/modules/yonghu/list.vue'),
        meta: { title: '用户管理', requiresAuth: true }
      },
      {
        path: 'jianshenjiaolian',
        name: 'Jianshenjiaolian',
        component: () => import('@/views/modules/jianshenjiaolian/list.vue'),
        meta: { title: '健身教练管理', requiresAuth: true }
      }
    ]
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

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 初始化用户信息
  if (!userStore.isAuthenticated) {
    userStore.initUser()
  }

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 健身房管理系统后台`
  }

  // 权限检查
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && userStore.isAuthenticated) {
    // 已登录用户访问登录页，重定向到首页
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
