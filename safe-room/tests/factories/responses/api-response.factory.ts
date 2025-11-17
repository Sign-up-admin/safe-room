/**
 * API响应工厂
 * 创建和管理API响应数据
 */

import {
  EnhancedBaseFactory,
  createRequiredFieldsValidator,
  createTypeValidator,
  createBaseValidator
} from '../base/base-factory'

// ========== 类型定义 ==========

/**
 * 标准API响应接口
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
  timestamp?: string
  requestId?: string
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T = any> {
  list: T[]
  pagination: PaginationData
}

/**
 * 分页数据接口
 */
export interface PaginationData {
  current: number
  size: number
  total: number
  pages: number
  hasNext: boolean
  hasPrevious: boolean
}

/**
 * 列表响应接口
 */
export interface ListResponse<T = any> extends ApiResponse<PaginatedResponse<T>> {}

/**
 * 错误响应接口
 */
export interface ErrorResponse {
  code: number
  message: string
  errors?: string[]
  details?: Record<string, any>
}

/**
 * 文件上传响应接口
 */
export interface UploadResponse {
  fileId: string
  fileName: string
  fileSize: number
  fileUrl: string
  fileType: string
}

/**
 * 批量操作响应接口
 */
export interface BatchResponse<T = any> {
  successCount: number
  failCount: number
  totalCount: number
  successItems: T[]
  failItems: Array<{ item: T; error: string }>
}

/**
 * 响应预设数据
 */
export const RESPONSE_PRESETS = {
  success: {
    code: 200,
    message: '操作成功',
    success: true
  },
  created: {
    code: 201,
    message: '创建成功',
    success: true
  },
  updated: {
    code: 200,
    message: '更新成功',
    success: true
  },
  deleted: {
    code: 200,
    message: '删除成功',
    success: true
  },
  badRequest: {
    code: 400,
    message: '请求参数错误',
    success: false
  },
  unauthorized: {
    code: 401,
    message: '未授权访问',
    success: false
  },
  forbidden: {
    code: 403,
    message: '禁止访问',
    success: false
  },
  notFound: {
    code: 404,
    message: '资源不存在',
    success: false
  },
  serverError: {
    code: 500,
    message: '服务器内部错误',
    success: false
  }
}

/**
 * API响应工厂类
 */
export class ApiResponseFactory extends EnhancedBaseFactory<ApiResponse> {
  constructor() {
    super({
      validator: createBaseValidator('apiResponse', (response: ApiResponse) => {
        const errors: string[] = []
        const warnings: string[] = []

        // 基础字段验证
        if (typeof response.code !== 'number') {
          errors.push('响应代码必须是数字')
        }
        if (!response.message || response.message.trim().length === 0) {
          errors.push('响应消息不能为空')
        }
        if (typeof response.success !== 'boolean') {
          errors.push('success字段必须是布尔值')
        }

        // 成功响应的验证
        if (response.success && response.code >= 400) {
          warnings.push('成功响应不应该使用错误状态码')
        }

        // 错误响应的验证
        if (!response.success && response.code < 400) {
          warnings.push('错误响应应该使用4xx或5xx状态码')
        }

        return { isValid: errors.length === 0, errors, warnings }
      })
    })
  }

  /**
   * 创建API响应
   */
  create<T = any>(data: T, overrides: Partial<ApiResponse<T>> = {}): ApiResponse<T> {
    const now = new Date().toISOString()

    return this.mergeDefaults({
      code: 200,
      message: 'success',
      data,
      success: true,
      timestamp: now,
      requestId: this.randomUuid()
    }, overrides)
  }

  /**
   * 创建成功响应
   */
  createSuccess<T = any>(data: T, message = '操作成功', overrides: Partial<ApiResponse<T>> = {}): ApiResponse<T> {
    return this.create(data, {
      ...RESPONSE_PRESETS.success,
      message,
      ...overrides
    })
  }

  /**
   * 创建创建成功响应
   */
  createCreated<T = any>(data: T, message = '创建成功', overrides: Partial<ApiResponse<T>> = {}): ApiResponse<T> {
    return this.create(data, {
      ...RESPONSE_PRESETS.created,
      message,
      ...overrides
    })
  }

  /**
   * 创建更新成功响应
   */
  createUpdated<T = any>(data: T, message = '更新成功', overrides: Partial<ApiResponse<T>> = {}): ApiResponse<T> {
    return this.create(data, {
      ...RESPONSE_PRESETS.updated,
      message,
      ...overrides
    })
  }

  /**
   * 创建删除成功响应
   */
  createDeleted(message = '删除成功', overrides: Partial<ApiResponse> = {}): ApiResponse {
    return this.create(null, {
      ...RESPONSE_PRESETS.deleted,
      message,
      ...overrides
    })
  }

  /**
   * 创建错误响应
   */
  createError(
    code: number = 500,
    message: string = '操作失败',
    errors?: string[],
    details?: Record<string, any>,
    overrides: Partial<ApiResponse> = {}
  ): ApiResponse {
    const errorResponse: ApiResponse = {
      code,
      message,
      success: false,
      data: null,
      timestamp: new Date().toISOString(),
      requestId: this.randomUuid(),
      ...overrides
    }

    // 添加错误详情
    if (errors || details) {
      (errorResponse.data as any) = { errors, details }
    }

    return errorResponse
  }

  /**
   * 创建预设错误响应
   */
  createPresetError(preset: keyof typeof RESPONSE_PRESETS, overrides: Partial<ApiResponse> = {}): ApiResponse {
    const presetData = RESPONSE_PRESETS[preset]
    if (presetData.success) {
      throw new Error(`预设 ${preset} 不是错误响应`)
    }

    return this.createError(presetData.code, presetData.message, undefined, undefined, overrides)
  }

  /**
   * 创建列表响应
   */
  createListResponse<T>(
    items: T[],
    pagination: PaginationData,
    message = '获取成功',
    overrides: Partial<ListResponse<T>> = {}
  ): ListResponse<T> {
    return this.createSuccess({
      list: items,
      pagination
    }, message, overrides)
  }

  /**
   * 创建分页响应（自动计算分页信息）
   */
  createPaginatedResponse<T>(
    items: T[],
    currentPage = 1,
    pageSize = 10,
    totalItems?: number,
    message = '获取成功',
    overrides: Partial<ListResponse<T>> = {}
  ): ListResponse<T> {
    const total = totalItems ?? items.length
    const totalPages = Math.ceil(total / pageSize)

    const pagination: PaginationData = {
      current: currentPage,
      size: pageSize,
      total,
      pages: totalPages,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1
    }

    return this.createListResponse(items, pagination, message, overrides)
  }

  /**
   * 创建文件上传响应
   */
  createUploadResponse(
    fileName: string,
    fileSize: number,
    fileUrl: string,
    fileType: string,
    message = '文件上传成功',
    overrides: Partial<ApiResponse<UploadResponse>> = {}
  ): ApiResponse<UploadResponse> {
    const uploadData: UploadResponse = {
      fileId: this.randomUuid(),
      fileName,
      fileSize,
      fileUrl,
      fileType
    }

    return this.createSuccess(uploadData, message, overrides)
  }

  /**
   * 创建批量操作响应
   */
  createBatchResponse<T>(
    items: T[],
    successCount: number,
    failItems: Array<{ item: T; error: string }>,
    message = '批量操作完成',
    overrides: Partial<ApiResponse<BatchResponse<T>>> = {}
  ): ApiResponse<BatchResponse<T>> {
    const batchData: BatchResponse<T> = {
      successCount,
      failCount: failItems.length,
      totalCount: items.length,
      successItems: items.slice(0, successCount),
      failItems
    }

    return this.createSuccess(batchData, message, overrides)
  }

  /**
   * 创建统计数据响应
   */
  createStatisticsResponse(
    stats: Record<string, any>,
    message = '统计数据获取成功',
    overrides: Partial<ApiResponse> = {}
  ): ApiResponse {
    return this.createSuccess(stats, message, overrides)
  }

  /**
   * 创建选项数据响应（用于下拉框等）
   */
  createOptionsResponse(
    options: Array<{ label: string; value: any; disabled?: boolean }>,
    message = '选项数据获取成功',
    overrides: Partial<ApiResponse> = {}
  ): ApiResponse {
    return this.createSuccess(options, message, overrides)
  }

  /**
   * 创建树形数据响应
   */
  createTreeResponse<T extends { children?: T[] }>(
    treeData: T[],
    message = '树形数据获取成功',
    overrides: Partial<ApiResponse> = {}
  ): ApiResponse {
    return this.createSuccess(treeData, message, overrides)
  }

  /**
   * 创建异步任务响应
   */
  createAsyncTaskResponse(
    taskId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    progress?: number,
    result?: any,
    message = '任务已提交',
    overrides: Partial<ApiResponse> = {}
  ): ApiResponse {
    const taskData = {
      taskId,
      status,
      progress: progress ?? (status === 'completed' ? 100 : 0),
      result,
      submittedAt: new Date().toISOString()
    }

    return this.createSuccess(taskData, message, overrides)
  }

  /**
   * 创建WebSocket推送响应
   */
  createWebSocketResponse(
    event: string,
    payload: any,
    message = '推送消息',
    overrides: Partial<ApiResponse> = {}
  ): ApiResponse {
    const wsData = {
      event,
      payload,
      timestamp: new Date().toISOString()
    }

    return this.createSuccess(wsData, message, overrides)
  }

  /**
   * 创建缓存数据响应
   */
  createCachedResponse<T>(
    data: T,
    cacheKey: string,
    expiresAt?: string,
    message = '缓存数据获取成功',
    overrides: Partial<ApiResponse> = {}
  ): ApiResponse {
    const cachedData = {
      data,
      cacheKey,
      cachedAt: new Date().toISOString(),
      expiresAt: expiresAt ?? new Date(Date.now() + 3600000).toISOString() // 默认1小时
    }

    return this.createSuccess(cachedData, message, overrides)
  }

  /**
   * 模拟网络延迟响应
   */
  async createDelayedResponse<T>(
    data: T,
    delayMs: number = 1000,
    overrides: Partial<ApiResponse<T>> = {}
  ): Promise<ApiResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, delayMs))
    return this.create(data, overrides)
  }

  /**
   * 创建随机响应（用于测试错误处理）
   */
  createRandomResponse<T>(
    data: T,
    errorProbability = 0.1,
    overrides: Partial<ApiResponse<T>> = {}
  ): ApiResponse<T> {
    if (this.randomBoolean() && Math.random() < errorProbability) {
      // 返回随机错误
      const errorPresets = Object.keys(RESPONSE_PRESETS).filter(key =>
        !RESPONSE_PRESETS[key as keyof typeof RESPONSE_PRESETS].success
      ) as Array<keyof typeof RESPONSE_PRESETS>

      const randomError = this.randomFromArray(errorPresets)
      return this.createPresetError(randomError, overrides) as ApiResponse<T>
    }

    return this.createSuccess(data, undefined, overrides)
  }

  /**
   * 验证响应格式
   */
  validateResponseFormat<T>(response: any): response is ApiResponse<T> {
    return (
      response &&
      typeof response === 'object' &&
      typeof response.code === 'number' &&
      typeof response.message === 'string' &&
      typeof response.success === 'boolean' &&
      'data' in response
    )
  }

  /**
   * 验证列表响应格式
   */
  validateListResponseFormat<T>(response: any): response is ListResponse<T> {
    return (
      this.validateResponseFormat(response) &&
      response.data &&
      Array.isArray(response.data.list) &&
      response.data.pagination &&
      typeof response.data.pagination === 'object'
    )
  }
}

// ========== 全局工厂实例 ==========

export const apiResponseFactory = new ApiResponseFactory()

// ========== 便捷创建函数 ==========

/**
 * 创建成功响应
 */
export function createSuccessResponse<T = any>(data: T, message?: string, overrides?: Partial<ApiResponse<T>>): ApiResponse<T> {
  return apiResponseFactory.createSuccess(data, message, overrides)
}

/**
 * 创建错误响应
 */
export function createErrorResponse(code?: number, message?: string, errors?: string[], details?: Record<string, any>): ApiResponse {
  return apiResponseFactory.createError(code, message, errors, details)
}

/**
 * 创建列表响应
 */
export function createListResponse<T>(items: T[], pagination: PaginationData, message?: string): ListResponse<T> {
  return apiResponseFactory.createListResponse(items, pagination, message)
}

/**
 * 创建分页响应
 */
export function createPaginatedResponse<T>(items: T[], currentPage?: number, pageSize?: number, totalItems?: number): ListResponse<T> {
  return apiResponseFactory.createPaginatedResponse(items, currentPage, pageSize, totalItems)
}
