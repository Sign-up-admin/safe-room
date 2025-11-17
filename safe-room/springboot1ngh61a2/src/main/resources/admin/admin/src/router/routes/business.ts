/**
 * 业务模块路由配置
 */
import { RouteRecordRaw } from 'vue-router'

/**
 * 业务模块路由
 * 使用懒加载优化性能
 */
export const businessRoutes: RouteRecordRaw[] = [
  {
    path: '/news',
    name: 'Announcement',
    component: () => import('@/views/modules/news/list.vue'),
  },
  {
    path: '/jianshenkecheng',
    name: 'Fitness Course',
    component: () => import('@/views/modules/jianshenkecheng/list.vue'),
  },
  {
    path: '/huiyuankagoumai',
    name: 'Membership Card Purchase',
    component: () => import('@/views/modules/huiyuankagoumai/list.vue'),
  },
  {
    path: '/huiyuanka',
    name: 'Membership Card',
    component: () => import('@/views/modules/huiyuanka/list.vue'),
  },
  {
    path: '/jianshenqicai',
    name: 'Fitness Equipment',
    component: () => import('@/views/modules/jianshenqicai/list.vue'),
  },
  {
    path: '/kechengtuike',
    name: 'Course Refund',
    component: () => import('@/views/modules/kechengtuike/list.vue'),
  },
  {
    path: '/kechengleixing',
    name: 'Course Type',
    component: () => import('@/views/modules/kechengleixing/list.vue'),
  },
  {
    path: '/jianshenjiaolian',
    name: 'Fitness Coach',
    component: () => import('@/views/modules/jianshenjiaolian/list.vue'),
  },
  {
    path: '/daoqitixing',
    name: 'Expiration Reminder',
    component: () => import('@/views/modules/daoqitixing/list.vue'),
  },
  {
    path: '/yonghu',
    name: 'User',
    component: () => import('@/views/modules/yonghu/list.vue'),
  },
  {
    path: '/chat',
    name: 'Feedback',
    component: () => import('@/views/modules/chat/list.vue'),
  },
  {
    path: '/sijiaoyuyue',
    name: 'Private Coaching Reservation',
    component: () => import('@/views/modules/sijiaoyuyue/list.vue'),
  },
  {
    path: '/kechengyuyue',
    name: 'Course Reservation',
    component: () => import('@/views/modules/kechengyuyue/list.vue'),
  },
  {
    path: '/huiyuanxufei',
    name: 'Membership Renewal',
    component: () => import('@/views/modules/huiyuanxufei/list.vue'),
  },
  {
    path: '/config',
    name: 'Carousel Management',
    component: () => import('@/views/modules/config/list.vue'),
  },
  {
    path: '/discussjianshenkecheng',
    name: 'Fitness Course Comment',
    component: () => import('@/views/modules/discussjianshenkecheng/list.vue'),
  },
  {
    path: '/newstype',
    name: 'Announcement Category',
    component: () => import('@/views/modules/newstype/list.vue'),
  },
  {
    path: '/assets',
    name: 'Asset Management',
    component: () => import('@/views/modules/assets/list.vue'),
  },
]

