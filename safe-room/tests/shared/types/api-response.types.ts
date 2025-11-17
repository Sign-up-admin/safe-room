/**
 * 统一的API响应类型定义
 * 用于测试数据管理，确保Mock数据与实际API接口格式一致
 */

// ========== 基础响应类型 ==========

/**
 * 标准API响应格式
 * 兼容front和admin端的响应格式
 */
export interface ApiResponse<T = any> {
  code: number  // 0表示成功，非0表示失败
  msg: string   // 响应消息
  data?: T      // 响应数据（可选，兼容不同业务场景）
  [key: string]: any // 允许扩展字段
}

/**
 * 错误响应格式
 */
export interface ErrorResponse {
  code: number
  msg: string
  error?: string
  details?: any
}

/**
 * 成功响应格式
 */
export interface SuccessResponse<T = any> extends ApiResponse<T> {
  code: 0
  data: T
}

// ========== 分页相关类型 ==========

/**
 * 分页结果类型
 * 兼容front的PageResult和admin的ListResponse
 */
export interface PageResult<T = any> {
  list: T[]        // 数据列表
  total: number    // 总记录数
  page?: number    // 当前页码
  limit?: number   // 每页条数
  pages?: number   // 总页数
  hasNext?: boolean     // 是否有下一页
  hasPrevious?: boolean // 是否有上一页
  [key: string]: any    // 允许扩展字段
}

/**
 * 分页API响应
 */
export interface PageApiResponse<T = any> extends ApiResponse<PageResult<T>> {
  data: PageResult<T>
}

/**
 * 分页查询参数
 */
export interface PageParams {
  page?: number     // 页码，从1开始，默认1
  limit?: number    // 每页条数，默认10，最大100
  sort?: string     // 排序字段
  order?: 'asc' | 'desc'  // 排序方向，默认desc
  keyword?: string  // 搜索关键词
  [key: string]: any // 允许扩展字段
}

// ========== 业务响应类型 ==========

/**
 * 列表API响应（通用列表查询结果）
 */
export interface ListApiResponse<T = any> extends PageApiResponse<T> {
  data: PageResult<T>
}

/**
 * 详情API响应（单条记录查询结果）
 */
export interface DetailApiResponse<T = any> extends ApiResponse<T> {
  data: T
}

/**
 * 创建/更新操作响应
 */
export interface MutationApiResponse<T = any> extends ApiResponse<T> {
  data?: T // 创建成功时返回新创建的对象，更新时可能不返回
}

/**
 * 删除操作响应
 */
export interface DeleteApiResponse extends ApiResponse<{ count?: number }> {
  // 删除操作通常只返回成功/失败状态
}

// ========== 类型验证工具 ==========

/**
 * 验证API响应格式是否符合规范
 */
export function validateApiResponse(response: any): response is ApiResponse {
  return (
    response &&
    typeof response === 'object' &&
    typeof response.code === 'number' &&
    typeof response.msg === 'string'
  )
}

/**
 * 验证分页响应格式
 */
export function validatePageResult(result: any): result is PageResult {
  return (
    result &&
    typeof result === 'object' &&
    Array.isArray(result.list) &&
    typeof result.total === 'number'
  )
}

/**
 * 验证分页API响应格式
 */
export function validatePageApiResponse(response: any): response is PageApiResponse {
  return (
    validateApiResponse(response) &&
    response.data &&
    validatePageResult(response.data)
  )
}

/**
 * 类型守卫：检查是否为成功响应
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.code === 0
}

/**
 * 类型守卫：检查是否为错误响应
 */
export function isErrorResponse(response: ApiResponse): response is ErrorResponse {
  return response.code !== 0
}

// ========== 导出类型别名（兼容现有代码） ==========

export type StandardApiResponse<T = any> = ApiResponse<T>
export type PaginatedResponse<T = any> = PageApiResponse<T>
export type ListResponse<T = any> = ListApiResponse<T>
export type SingleResponse<T = any> = DetailApiResponse<T>
