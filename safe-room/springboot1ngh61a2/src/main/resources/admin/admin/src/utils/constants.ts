/**
 * 常量定义
 */

// API基础URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 用户角色
export const USER_ROLES = {
  YONGHU: 'yonghu',
  JIANSHENJIAOLIAN: 'jianshenjiaolian',
  ADMIN: 'admin'
} as const

// 角色选项（用于注册页面）
export const ROLE_OPTIONS = [
  { label: '会员用户', value: USER_ROLES.YONGHU },
  { label: '健身教练', value: USER_ROLES.JIANSHENJIAOLIAN }
]

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  THEME: 'theme'
} as const

// 页面标题
export const PAGE_TITLES = {
  LOGIN: '登录',
  REGISTER: '注册',
  HOME: '首页',
  CENTER: '个人中心',
  UPDATE_PASSWORD: '修改密码'
} as const


