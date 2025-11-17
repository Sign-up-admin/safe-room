/**
 * 用户相关类型定义
 */

// 用户角色
export type UserRole = 'yonghu' | 'jianshenjiaolian' | 'admin'

// 用户信息
export interface UserInfo {
  id?: number
  username?: string
  name?: string
  role?: UserRole
  token?: string
  avatar?: string
  [key: string]: any
}

// 登录凭证
export interface LoginCredentials {
  username: string
  password: string
  role?: UserRole
}

// 注册表单数据
export interface RegisterFormData {
  role: UserRole
  username: string
  password: string
  password2: string
  name: string
  phone?: string
  [key: string]: any
}

