/**
 * API Response Types
 */

export interface ApiResponse<T = any> {
  code: number
  msg: string
  data?: T
  [key: string]: any
}

export interface PageResult<T = any> {
  total: number
  list: T[]
}

export interface PageParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: any
}

