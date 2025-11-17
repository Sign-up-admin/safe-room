/**
 * API Response Types
 */

export interface ApiResponse<T extends Record<string, unknown> = Record<string, unknown>> {
  code: number
  msg: string
  data: T
}

export interface PageResult<T = Record<string, unknown>> {
  total: number
  list: T[]
  [key: string]: unknown
}

export interface PageParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: unknown
}

/**
 * Common entity types
 */
export interface BaseEntity {
  id?: number
  createTime?: string
  updateTime?: string
}

/**
 * User related types
 */
export interface User extends BaseEntity {
  username?: string
  password?: string
  role?: string
  headportrait?: string
  [key: string]: unknown
}

/**
 * Fitness Coach types
 */
export interface FitnessCoach extends BaseEntity {
  gonghao?: string
  mima?: string
  xingming?: string
  xingbie?: string
  touxiang?: string
  zhaopian?: string
  [key: string]: unknown
}

/**
 * Course types
 */
export interface Course extends BaseEntity {
  kechengmingcheng?: string
  kechengleixing?: string
  kechengtupian?: string
  [key: string]: unknown
}

/**
 * Reservation types
 */
export interface Reservation extends BaseEntity {
  yonghuid?: number
  kechengid?: number
  yuyueshijian?: string
  [key: string]: unknown
}

/**
 * Membership Card types
 */
export interface MembershipCard extends BaseEntity {
  huiyuankamingcheng?: string
  huiyuankajiage?: number
  huiyuankatupian?: string
  [key: string]: unknown
}

/**
 * File upload response
 */
export interface FileUploadResponse extends Record<string, unknown> {
  file: string
  url?: string
}

/**
 * Chart data types
 */
export interface ChartDataPoint {
  name: string
  value: number
}

export interface DailyChartData {
  date: string
  count: number
}

/**
 * Login request/response
 */
export interface LoginRequest {
  username: string
  password: string
  roleName?: string
}

export interface LoginResponse {
  token?: string
  user?: User | FitnessCoach
  roleName?: string
  tableName?: string
}

/**
 * Session response
 */
export interface SessionResponse {
  id?: number
  username?: string
  role?: string
  [key: string]: unknown
}

/**
 * 通用CRUD操作响应
 */
export interface CrudResponse<T extends Record<string, unknown> = Record<string, unknown>> {
  code: number
  msg: string
  data: T
}

/**
 * 列表查询参数
 */
export interface ListQueryParams extends PageParams {
  keyword?: string
  [key: string]: unknown
}

/**
 * 导出参数
 */
export interface ExportParams {
  keyword?: string
  [key: string]: unknown
}
