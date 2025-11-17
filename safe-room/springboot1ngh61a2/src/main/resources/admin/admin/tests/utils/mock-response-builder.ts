/**
 * Mock响应生成器 - 后台管理
 * 基于统一的API响应类型生成Mock数据
 */

import type {
  ApiResponse,
  PageApiResponse,
  ErrorResponse,
  PageResult,
  PageParams
} from '../../../../../../../../tests/shared/types/api-response.types'

/**
 * 创建标准API响应
 */
export function createApiResponse<T>(
  data: T,
  options?: { code?: number; msg?: string }
): ApiResponse<T> {
  const { code = 0, msg = 'success' } = options || {}

  return {
    code,
    msg,
    data
  }
}

/**
 * 创建分页API响应
 */
export function createPageResponse<T>(
  list: T[],
  pagination: {
    total: number
    page?: number
    limit?: number
    pages?: number
    hasNext?: boolean
    hasPrevious?: boolean
  }
): PageApiResponse<T> {
  const pageResult: PageResult<T> = {
    list,
    ...pagination
  }

  return createApiResponse(pageResult, { code: 0, msg: 'success' })
}

/**
 * 创建分页响应（使用分页参数自动计算）
 */
export function createPageResponseFromParams<T>(
  items: T[],
  params: PageParams = {},
  totalOverride?: number
): PageApiResponse<T> {
  const page = params.page || 1
  const limit = params.limit || 10
  const total = totalOverride ?? items.length

  // 计算分页信息
  const pages = Math.ceil(total / limit)
  const hasNext = page < pages
  const hasPrevious = page > 1

  return createPageResponse(items, {
    total,
    page,
    limit,
    pages,
    hasNext,
    hasPrevious
  })
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  code = 500,
  msg = '操作失败',
  error?: string
): ErrorResponse {
  const response: ErrorResponse = {
    code,
    msg
  }

  if (error) {
    response.error = error
  }

  return response
}

/**
 * 创建成功响应（便捷方法）
 */
export function createSuccessResponse<T>(
  data: T,
  msg = '操作成功'
): ApiResponse<T> {
  return createApiResponse(data, { code: 0, msg })
}

/**
 * 创建失败响应（便捷方法）
 */
export function createFailureResponse(
  msg = '操作失败',
  code = 500
): ErrorResponse {
  return createErrorResponse(code, msg)
}

// ========== 业务特定响应生成器 ==========

/**
 * 创建列表查询响应
 */
export function createListResponse<T>(
  items: T[],
  params: PageParams = {},
  totalOverride?: number
): PageApiResponse<T> {
  return createPageResponseFromParams(items, params, totalOverride)
}

/**
 * 创建详情查询响应
 */
export function createDetailResponse<T>(
  data: T,
  msg = '查询成功'
): ApiResponse<T> {
  return createApiResponse(data, { code: 0, msg })
}

/**
 * 创建创建操作响应
 */
export function createCreateResponse<T>(
  data: T,
  msg = '新增成功'
): ApiResponse<T> {
  return createApiResponse(data, { code: 0, msg })
}

/**
 * 创建更新操作响应
 */
export function createUpdateResponse<T>(
  data: T,
  msg = '更新成功'
): ApiResponse<T> {
  return createApiResponse(data, { code: 0, msg })
}

/**
 * 创建删除操作响应
 */
export function createDeleteResponse(
  affectedCount?: number,
  msg = '删除成功'
): ApiResponse<{ count?: number }> {
  const data = affectedCount !== undefined ? { count: affectedCount } : { count: 0 }
  return createApiResponse(data, { code: 0, msg })
}

/**
 * 创建登录响应
 */
export function createLoginResponse(
  token: string,
  user: any,
  msg = '登录成功'
): ApiResponse<{ token: string; user: any }> {
  return createApiResponse({ token, user }, { code: 0, msg })
}

/**
 * 创建登出响应
 */
export function createLogoutResponse(
  msg = '登出成功'
): ApiResponse {
  return createApiResponse({}, { code: 0, msg })
}

/**
 * 创建菜单列表响应
 */
export function createMenuListResponse(
  menus: any[],
  msg = '获取菜单成功'
): ApiResponse<any[]> {
  return createApiResponse(menus, { code: 0, msg })
}

/**
 * 创建用户列表响应
 */
export function createUserListResponse(
  users: any[],
  pagination: any,
  msg = '获取用户列表成功'
): PageApiResponse<any> {
  return createPageResponse(users, { ...pagination, msg })
}

/**
 * 创建配置列表响应
 */
export function createConfigListResponse(
  configs: any[],
  pagination: any,
  msg = '获取配置列表成功'
): PageApiResponse<any> {
  return createPageResponse(configs, { ...pagination, msg })
}

// ========== 批量响应生成器 ==========

/**
 * 创建多个响应（用于测试多种场景）
 */
export function createMultipleResponses<T>(
  successData: T[],
  errorCodes: number[] = [],
  baseMsg = '操作'
): Array<ApiResponse<T> | ErrorResponse> {
  const responses: Array<ApiResponse<T> | ErrorResponse> = []

  // 成功响应
  successData.forEach((data) => {
    responses.push(createSuccessResponse(data, `${baseMsg}成功`))
  })

  // 错误响应
  errorCodes.forEach((code) => {
    responses.push(createErrorResponse(code, `${baseMsg}失败`, `Error ${code}`))
  })

  return responses
}

/**
 * 创建分页响应集合（用于测试不同分页场景）
 */
export function createPaginationTestResponses<T>(
  allItems: T[],
  scenarios: Array<{
    page: number
    limit: number
    expectedTotal: number
  }>
): PageApiResponse<T>[] {
  return scenarios.map(({ page, limit, expectedTotal }) => {
    const startIndex = (page - 1) * limit
    const endIndex = Math.min(startIndex + limit, allItems.length)
    const pageItems = allItems.slice(startIndex, endIndex)

    return createPageResponse(pageItems, {
      total: expectedTotal,
      page,
      limit,
      pages: Math.ceil(expectedTotal / limit),
      hasNext: endIndex < expectedTotal,
      hasPrevious: page > 1
    })
  })
}

// ========== 权限相关响应 ==========

/**
 * 创建权限验证响应
 */
export function createPermissionResponse(
  hasPermission: boolean,
  permissions: string[] = [],
  msg = '权限检查完成'
): ApiResponse<{ hasPermission: boolean; permissions: string[] }> {
  return createApiResponse(
    { hasPermission, permissions },
    { code: 0, msg }
  )
}

/**
 * 创建角色列表响应
 */
export function createRoleListResponse(
  roles: any[],
  pagination: any,
  msg = '获取角色列表成功'
): PageApiResponse<any> {
  return createPageResponse(roles, { ...pagination, msg })
}

/**
 * 创建日志列表响应
 */
export function createLogListResponse(
  logs: any[],
  pagination: any,
  msg = '获取日志列表成功'
): PageApiResponse<any> {
  return createPageResponse(logs, { ...pagination, msg })
}
