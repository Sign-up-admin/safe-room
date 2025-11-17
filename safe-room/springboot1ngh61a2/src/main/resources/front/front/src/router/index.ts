import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

// Main components
import Index from '../pages/index.vue'
import Home from '../pages/home/home.vue'
import Login from '../pages/login/login.vue'
import Register from '../pages/register/register.vue'
import Center from '../pages/center/center.vue'
import Storeup from '../pages/storeup/list.vue'
import News from '../pages/news/news-list.vue'
import NewsDetail from '../pages/news/news-detail.vue'
import payList from '../pages/pay/index.vue'
import NotificationCenter from '../components/NotificationCenter.vue'

// Lazy load other components with error handling
// 使用函数包装动态导入，添加错误处理
const createLazyComponent = (importFn: () => Promise<any>) => () =>
  importFn().catch(error => {
    console.error('Failed to load component:', error)
    // 静默处理错误，避免阻塞路由导航
    // 在实际导航时会再次尝试加载
    return Promise.reject(error)
  })

// Lazy load other components
const yonghuList = createLazyComponent(() => import('../pages/yonghu/list.vue'))
const yonghuDetail = createLazyComponent(() => import('../pages/yonghu/detail.vue'))
const yonghuAdd = createLazyComponent(() => import('../pages/yonghu/add.vue'))
const jianshenjiaolianList = createLazyComponent(() => import('../pages/jianshenjiaolian/list.vue'))
const jianshenjiaolianDetail = createLazyComponent(() => import('../pages/jianshenjiaolian/detail.vue'))
const jianshenjiaolianAdd = createLazyComponent(() => import('../pages/jianshenjiaolian/add.vue'))
const sijiaoyuyueList = createLazyComponent(() => import('../pages/sijiaoyuyue/list.vue'))
const sijiaoyuyueDetail = createLazyComponent(() => import('../pages/sijiaoyuyue/detail.vue'))
const sijiaoyuyueAdd = createLazyComponent(() => import('../pages/sijiaoyuyue/add.vue'))
const kechengleixingList = createLazyComponent(() => import('../pages/kechengleixing/list.vue'))
const kechengleixingDetail = createLazyComponent(() => import('../pages/kechengleixing/detail.vue'))
const kechengleixingAdd = createLazyComponent(() => import('../pages/kechengleixing/add.vue'))
const jianshenkechengList = createLazyComponent(() => import('../pages/jianshenkecheng/list.vue'))
const jianshenkechengDetail = createLazyComponent(() => import('../pages/jianshenkecheng/detail.vue'))
const jianshenkechengAdd = createLazyComponent(() => import('../pages/jianshenkecheng/add.vue'))
const kechengyuyueList = createLazyComponent(() => import('../pages/kechengyuyue/list.vue'))
const kechengyuyueDetail = createLazyComponent(() => import('../pages/kechengyuyue/detail.vue'))
const kechengyuyueAdd = createLazyComponent(() => import('../pages/kechengyuyue/add.vue'))
const kechengtuikeList = createLazyComponent(() => import('../pages/kechengtuike/list.vue'))
const kechengtuikeDetail = createLazyComponent(() => import('../pages/kechengtuike/detail.vue'))
const kechengtuikeAdd = createLazyComponent(() => import('../pages/kechengtuike/add.vue'))
const huiyuankaList = createLazyComponent(() => import('../pages/huiyuanka/list.vue'))
const huiyuankaDetail = createLazyComponent(() => import('../pages/huiyuanka/detail.vue'))
const huiyuankaAdd = createLazyComponent(() => import('../pages/huiyuanka/add.vue'))
const huiyuankagoumaiList = createLazyComponent(() => import('../pages/huiyuankagoumai/list.vue'))
const huiyuankagoumaiDetail = createLazyComponent(() => import('../pages/huiyuankagoumai/detail.vue'))
const huiyuankagoumaiAdd = createLazyComponent(() => import('../pages/huiyuankagoumai/add.vue'))
const daoqitixingList = createLazyComponent(() => import('../pages/daoqitixing/list.vue'))
const daoqitixingDetail = createLazyComponent(() => import('../pages/daoqitixing/detail.vue'))
const daoqitixingAdd = createLazyComponent(() => import('../pages/daoqitixing/add.vue'))
const huiyuanxufeiList = createLazyComponent(() => import('../pages/huiyuanxufei/list.vue'))
const huiyuanxufeiDetail = createLazyComponent(() => import('../pages/huiyuanxufei/detail.vue'))
const huiyuanxufeiAdd = createLazyComponent(() => import('../pages/huiyuanxufei/add.vue'))
const jianshenqicaiList = createLazyComponent(() => import('../pages/jianshenqicai/list.vue'))
const jianshenqicaiDetail = createLazyComponent(() => import('../pages/jianshenqicai/EquipmentDetail.vue'))
const jianshenqicaiAdd = createLazyComponent(() => import('../pages/jianshenqicai/add.vue'))
const newstypeList = createLazyComponent(() => import('../pages/newstype/list.vue'))
const newstypeDetail = createLazyComponent(() => import('../pages/newstype/NewstypeDetail.vue'))
const newstypeAdd = createLazyComponent(() => import('../pages/newstype/add.vue'))
const discussjianshenkechengList = createLazyComponent(() => import('../pages/discussjianshenkecheng/list.vue'))
const discussjianshenkechengDetail = createLazyComponent(() => import('../pages/discussjianshenkecheng/detail.vue'))
const discussjianshenkechengAdd = createLazyComponent(() => import('../pages/discussjianshenkecheng/add.vue'))
const chatList = createLazyComponent(() => import('../pages/chat/list.vue'))
const chatAdd = createLazyComponent(() => import('../pages/chat/add.vue'))
// Legal pages
const legalRequirements = createLazyComponent(() => import('../pages/legal/requirements.vue'))
const legalTerms = createLazyComponent(() => import('../pages/legal/terms.vue'))
const legalPrivacy = createLazyComponent(() => import('../pages/legal/privacy.vue'))
const legalDisclaimer = createLazyComponent(() => import('../pages/legal/disclaimer.vue'))
// API docs
const apiDocs = createLazyComponent(() => import('../pages/api/docs.vue'))

//配置路由
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/index/home',
  },
  {
    path: '/index',
    component: Index,
    children: [
      {
        path: 'home',
        component: Home,
      },
      {
        path: 'center',
        component: Center,
      },
      {
        path: 'notifications',
        component: NotificationCenter,
        meta: { title: '消息中心' },
      },
      {
        path: 'pay',
        component: payList,
      },
      {
        path: 'storeup',
        component: Storeup,
      },
      {
        path: 'news',
        component: News,
      },
      {
        path: 'newsDetail',
        component: NewsDetail,
      },
      {
        path: 'yonghu',
        component: yonghuList,
      },
      {
        path: 'yonghuDetail',
        component: yonghuDetail,
      },
      {
        path: 'yonghuAdd',
        component: yonghuAdd,
      },
      {
        path: 'jianshenjiaolian',
        component: jianshenjiaolianList,
      },
      {
        path: 'jianshenjiaolianDetail',
        component: jianshenjiaolianDetail,
      },
      {
        path: 'jianshenjiaolianAdd',
        component: jianshenjiaolianAdd,
      },
      {
        path: 'sijiaoyuyue',
        component: sijiaoyuyueList,
      },
      {
        path: 'sijiaoyuyueDetail',
        component: sijiaoyuyueDetail,
      },
      {
        path: 'sijiaoyuyueAdd',
        component: sijiaoyuyueAdd,
      },
      {
        path: 'kechengleixing',
        component: kechengleixingList,
      },
      {
        path: 'kechengleixingDetail',
        component: kechengleixingDetail,
      },
      {
        path: 'kechengleixingAdd',
        component: kechengleixingAdd,
      },
      {
        path: 'jianshenkecheng',
        component: jianshenkechengList,
      },
      {
        path: 'jianshenkechengDetail',
        component: jianshenkechengDetail,
      },
      {
        path: 'jianshenkechengAdd',
        component: jianshenkechengAdd,
      },
      {
        path: 'kechengyuyue',
        component: kechengyuyueList,
      },
      {
        path: 'kechengyuyueDetail',
        component: kechengyuyueDetail,
      },
      {
        path: 'kechengyuyueAdd',
        component: kechengyuyueAdd,
      },
      {
        path: 'kechengtuike',
        component: kechengtuikeList,
      },
      {
        path: 'kechengtuikeDetail',
        component: kechengtuikeDetail,
      },
      {
        path: 'kechengtuikeAdd',
        component: kechengtuikeAdd,
      },
      {
        path: 'huiyuanka',
        component: huiyuankaList,
      },
      {
        path: 'huiyuankaDetail',
        component: huiyuankaDetail,
      },
      {
        path: 'huiyuankaAdd',
        component: huiyuankaAdd,
      },
      {
        path: 'huiyuankagoumai',
        component: huiyuankagoumaiList,
      },
      {
        path: 'huiyuankagoumaiDetail',
        component: huiyuankagoumaiDetail,
      },
      {
        path: 'huiyuankagoumaiAdd',
        component: huiyuankagoumaiAdd,
      },
      {
        path: 'daoqitixing',
        component: daoqitixingList,
      },
      {
        path: 'daoqitixingDetail',
        component: daoqitixingDetail,
      },
      {
        path: 'daoqitixingAdd',
        component: daoqitixingAdd,
      },
      {
        path: 'huiyuanxufei',
        component: huiyuanxufeiList,
      },
      {
        path: 'huiyuanxufeiDetail',
        component: huiyuanxufeiDetail,
      },
      {
        path: 'huiyuanxufeiAdd',
        component: huiyuanxufeiAdd,
      },
      {
        path: 'jianshenqicai',
        component: jianshenqicaiList,
      },
      {
        path: 'jianshenqicaiDetail',
        component: jianshenqicaiDetail,
      },
      {
        path: 'jianshenqicaiAdd',
        component: jianshenqicaiAdd,
      },
      {
        path: 'newstype',
        component: newstypeList,
      },
      {
        path: 'newstypeDetail',
        component: newstypeDetail,
      },
      {
        path: 'newstypeAdd',
        component: newstypeAdd,
      },
      {
        path: 'discussjianshenkecheng',
        component: discussjianshenkechengList,
      },
      {
        path: 'discussjianshenkechengDetail',
        component: discussjianshenkechengDetail,
      },
      {
        path: 'discussjianshenkechengAdd',
        component: discussjianshenkechengAdd,
      },
      {
        path: 'chat',
        component: chatList,
      },
      {
        path: 'chatAdd',
        component: chatAdd,
      },
      {
        path: 'legal/requirements',
        component: legalRequirements,
      },
      {
        path: 'legal/terms',
        component: legalTerms,
      },
      {
        path: 'legal/disclaimer',
        component: legalDisclaimer,
      },
      {
        path: 'api/docs',
        component: apiDocs,
      },
    ],
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/register',
    component: Register,
  },
  {
    path: '/terms',
    component: legalTerms,
  },
  {
    path: '/privacy',
    component: legalPrivacy,
  },
  {
    path: '/error/:code',
    name: 'ErrorPage',
    component: () => import('../pages/error/ErrorPage.vue'),
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/error/404.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // 禁用路由预加载，避免动态导入路径解析问题
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 路由守卫：权限验证
router.beforeEach((to, from, next) => {
  // 公开路由，无需验证
  const publicRoutes = [
    '/login',
    '/register',
    '/terms',
    '/privacy',
    '/error',
    // 首页相关公开路由
    '/index/home',
    '/index/news',
    '/index/newsDetail',
    // 课程相关公开路由
    '/index/jianshenkecheng',
    '/index/jianshenkechengDetail',
    '/index/kechengleixing',
    '/index/kechengleixingDetail',
    // 教练相关公开路由
    '/index/jianshenjiaolian',
    '/index/jianshenjiaolianDetail',
    // 器材相关公开路由
    '/index/jianshenqicai',
    '/index/jianshenqicaiDetail',
    // 讨论相关公开路由
    '/index/discussjianshenkecheng',
    '/index/discussjianshenkechengDetail',
    // 用户相关公开路由（详情页通常可以公开查看）
    '/index/yonghuDetail',
    // 会员卡相关公开路由（允许未登录用户查看和购买）
    '/index/huiyuanka',
    '/index/huiyuankaDetail',
    '/index/huiyuankagoumai',
    '/index/huiyuankagoumaiDetail',
    // 法律页面（所有子路由）
    '/index/legal',
    // API文档（所有子路由）
    '/index/api',
  ]

  // 检查是否是公开路由
  const isPublicRoute = publicRoutes.some(
    route =>
      // 精确匹配或路径以公开路由开头
      to.path === route || to.path.startsWith(route + '/'),
  )

  if (isPublicRoute) {
    next()
    return
  }

  // 需要登录的路由
  const token = localStorage.getItem('frontToken')

  if (!token) {
    // 未登录，重定向到登录页
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
