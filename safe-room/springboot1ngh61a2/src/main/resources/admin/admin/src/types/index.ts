/**
 * 通用类型定义
 */

// API响应基础类型
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data?: T
}

// 分页参数
export interface PaginationParams {
  page: number
  limit: number
}

// 分页响应
export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  limit: number
}

// 通用查询参数
export interface QueryParams extends PaginationParams {
  [key: string]: any
}

