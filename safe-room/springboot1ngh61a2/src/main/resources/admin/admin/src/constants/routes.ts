/**
 * 路由常量定义
 */

/**
 * 公开路由列表（无需认证）
 */
export const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/error'] as const

/**
 * 模块路由配置
 */
export const MODULE_ROUTES = {
  NEWS: '/news',
  JIANSHENKECHENG: '/jianshenkecheng',
  HUIYUANKAGOUMAI: '/huiyuankagoumai',
  HUIYUANKA: '/huiyuanka',
  JIANSHENQICAI: '/jianshenqicai',
  KECHENGTUIKE: '/kechengtuike',
  KECHENGLEIXING: '/kechengleixing',
  JIANSHENJIAOLIAN: '/jianshenjiaolian',
  DAOQITIXING: '/daoqitixing',
  YONGHU: '/yonghu',
  CHAT: '/chat',
  SIJIAOYUYUE: '/sijiaoyuyue',
  KECHENGYUYUE: '/kechengyuyue',
  HUIYUANXUFEI: '/huiyuanxufei',
  CONFIG: '/config',
  DISCUSSJIANSHENKECHENG: '/discussjianshenkecheng',
  NEWSTYPE: '/newstype',
  ASSETS: '/assets',
  SERVICE_STATUS: '/service-status',
  LEGAL_TERMS: '/legal-terms',
  OPERATION_LOG: '/operation-log',
  USERS: '/users',
  SYSTEM_MESSAGES: '/system-messages',
} as const

/**
 * 路由名称常量
 */
export const ROUTE_NAMES = {
  SYSTEM_HOME: 'System Home',
  SYSTEM_HOME_DASHBOARD: 'System Home Dashboard',
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot-password',
  RESET_PASSWORD: 'reset-password',
  ERROR_PAGE: 'ErrorPage',
  NOT_FOUND: 'NotFound',
  CHANGE_PASSWORD: 'Change Password',
  PAYMENT: 'Payment',
  PERSONAL_INFORMATION: 'Personal Information',
  ANNOUNCEMENT: 'Announcement',
  FITNESS_COURSE: 'Fitness Course',
  MEMBERSHIP_CARD_PURCHASE: 'Membership Card Purchase',
  MEMBERSHIP_CARD: 'Membership Card',
  FITNESS_EQUIPMENT: 'Fitness Equipment',
  COURSE_REFUND: 'Course Refund',
  COURSE_TYPE: 'Course Type',
  FITNESS_COACH: 'Fitness Coach',
  EXPIRATION_REMINDER: 'Expiration Reminder',
  USER: 'User',
  FEEDBACK: 'Feedback',
  PRIVATE_COACHING_RESERVATION: 'Private Coaching Reservation',
  COURSE_RESERVATION: 'Course Reservation',
  MEMBERSHIP_RENEWAL: 'Membership Renewal',
  CAROUSEL_MANAGEMENT: 'Carousel Management',
  FITNESS_COURSE_COMMENT: 'Fitness Course Comment',
  ANNOUNCEMENT_CATEGORY: 'Announcement Category',
  ASSET_MANAGEMENT: 'Asset Management',
  SERVICE_STATUS: 'Service Status',
  LEGAL_TERMS_MANAGEMENT: 'Legal Terms Management',
  OPERATION_LOG: 'Operation Log',
  SYSTEM_MESSAGES: 'System Messages',
  ADMIN_USERS: 'Admin Users',
} as const
