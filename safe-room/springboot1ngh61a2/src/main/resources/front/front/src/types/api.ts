/**
 * API Response Types
 */

export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data?: T
  [key: string]: unknown
}

export interface PageResult<T = unknown> {
  total: number
  list: T[]
}

export interface PageParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: string | number | undefined
}
