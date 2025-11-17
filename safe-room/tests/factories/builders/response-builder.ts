/**
 * 响应Builder构建器
 * 提供链式API来构建各种API响应数据
 */

import { ApiResponse, ListResponse, PaginationData } from '../responses/api-response.factory'
import { faker } from '@faker-js/faker'

// ========== 响应Builder类 ==========

/**
 * 响应Builder类
 * 使用链式调用构建复杂的API响应数据
 */
export class ResponseBuilder<T = any> {
  private data: Partial<ApiResponse<T>> = {}

  constructor() {
    this.reset()
  }

  /**
   * 重置为默认成功响应
   */
  reset(): this {
    this.data = {
      code: 200,
      message: 'success',
      data: undefined as T,
      success: true,
      timestamp: new Date().toISOString(),
      requestId: faker.string.uuid()
    }
    return this
  }

  /**
   * 设置响应代码
   */
  withCode(code: number): this {
    this.data.code = code
    // 自动更新success字段
    this.data.success = code >= 200 && code < 300
    return this
  }

  /**
   * 设置响应消息
   */
  withMessage(message: string): this {
    this.data.message = message
    return this
  }

  /**
   * 设置响应数据
   */
  withData(data: T): this {
    this.data.data = data
    return this
  }

  /**
   * 设置成功状态
   */
  success(success: boolean = true): this {
    this.data.success = success
    return this
  }

  /**
   * 设置时间戳
   */
  withTimestamp(timestamp: Date | string): this {
    this.data.timestamp = timestamp instanceof Date ? timestamp.toISOString() : timestamp
    return this
  }

  /**
   * 设置请求ID
   */
  withRequestId(requestId: string): this {
    this.data.requestId = requestId
    return this
  }

  /**
   * 设置为成功响应
   */
  asSuccess(message: string = '操作成功'): this {
    return this
      .withCode(200)
      .withMessage(message)
      .success(true)
  }

  /**
   * 设置为创建成功响应
   */
  asCreated(message: string = '创建成功'): this {
    return this
      .withCode(201)
      .withMessage(message)
      .success(true)
  }

  /**
   * 设置为更新成功响应
   */
  asUpdated(message: string = '更新成功'): this {
    return this
      .withCode(200)
      .withMessage(message)
      .success(true)
  }

  /**
   * 设置为删除成功响应
   */
  asDeleted(message: string = '删除成功'): this {
    return this
      .withCode(200)
      .withMessage(message)
      .success(true)
  }

  /**
   * 设置为错误响应
   */
  asError(code: number = 500, message: string = '操作失败'): this {
    return this
      .withCode(code)
      .withMessage(message)
      .success(false)
  }

  /**
   * 设置为客户端错误
   */
  asBadRequest(message: string = '请求参数错误'): this {
    return this.asError(400, message)
  }

  /**
   * 设置为未授权错误
   */
  asUnauthorized(message: string = '未授权访问'): this {
    return this.asError(401, message)
  }

  /**
   * 设置为禁止访问错误
   */
  asForbidden(message: string = '禁止访问'): this {
    return this.asError(403, message)
  }

  /**
   * 设置为未找到错误
   */
  asNotFound(message: string = '资源不存在'): this {
    return this.asError(404, message)
  }

  /**
   * 设置为服务器错误
   */
  asServerError(message: string = '服务器内部错误'): this {
    return this.asError(500, message)
  }

  /**
   * 设置为列表响应
   */
  asListResponse(items: any[], pagination: PaginationData, message: string = '获取成功'): this {
    const listData = {
      list: items,
      pagination
    }
    return this
      .asSuccess(message)
      .withData(listData as T)
  }

  /**
   * 设置为分页响应（自动计算分页信息）
   */
  asPaginatedResponse(
    items: any[],
    currentPage: number = 1,
    pageSize: number = 10,
    totalItems?: number,
    message: string = '获取成功'
  ): this {
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

    return this.asListResponse(items, pagination, message)
  }

  /**
   * 设置为统计数据响应
   */
  asStatisticsResponse(stats: Record<string, any>, message: string = '统计数据获取成功'): this {
    return this
      .asSuccess(message)
      .withData(stats as T)
  }

  /**
   * 设置为选项数据响应
   */
  asOptionsResponse(
    options: Array<{ label: string; value: any; disabled?: boolean }>,
    message: string = '选项数据获取成功'
  ): this {
    return this
      .asSuccess(message)
      .withData(options as T)
  }

  /**
   * 设置为文件上传响应
   */
  asUploadResponse(
    fileName: string,
    fileSize: number,
    fileUrl: string,
    fileType: string,
    message: string = '文件上传成功'
  ): this {
    const uploadData = {
      fileId: faker.string.uuid(),
      fileName,
      fileSize,
      fileUrl,
      fileType
    }

    return this
      .asSuccess(message)
      .withData(uploadData as T)
  }

  /**
   * 设置为批量操作响应
   */
  asBatchResponse(
    items: any[],
    successCount: number,
    failItems: Array<{ item: any; error: string }>,
    message: string = '批量操作完成'
  ): this {
    const batchData = {
      successCount,
      failCount: failItems.length,
      totalCount: items.length,
      successItems: items.slice(0, successCount),
      failItems
    }

    return this
      .asSuccess(message)
      .withData(batchData as T)
  }

  /**
   * 设置为树形数据响应
   */
  asTreeResponse(treeData: any[], message: string = '树形数据获取成功'): this {
    return this
      .asSuccess(message)
      .withData(treeData as T)
  }

  /**
   * 设置为异步任务响应
   */
  asAsyncTaskResponse(
    taskId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed' = 'pending',
    progress?: number,
    result?: any,
    message: string = '任务已提交'
  ): this {
    const taskData = {
      taskId,
      status,
      progress: progress ?? (status === 'completed' ? 100 : 0),
      result,
      submittedAt: new Date().toISOString()
    }

    return this
      .asSuccess(message)
      .withData(taskData as T)
  }

  /**
   * 设置为WebSocket推送响应
   */
  asWebSocketResponse(
    event: string,
    payload: any,
    message: string = '推送消息'
  ): this {
    const wsData = {
      event,
      payload,
      timestamp: new Date().toISOString()
    }

    return this
      .asSuccess(message)
      .withData(wsData as T)
  }

  /**
   * 设置为缓存数据响应
   */
  asCachedResponse(
    data: any,
    cacheKey: string,
    expiresAt?: string,
    message: string = '缓存数据获取成功'
  ): this {
    const cachedData = {
      data,
      cacheKey,
      cachedAt: new Date().toISOString(),
      expiresAt: expiresAt ?? new Date(Date.now() + 3600000).toISOString() // 默认1小时
    }

    return this
      .asSuccess(message)
      .withData(cachedData as T)
  }

  /**
   * 添加错误详情
   */
  withErrorDetails(errors: string[], details?: Record<string, any>): this {
    if (!this.data.data) {
      this.data.data = {} as T
    }
    (this.data.data as any).errors = errors
    if (details) {
      (this.data.data as any).details = details
    }
    return this
  }

  /**
   * 设置为随机响应（用于测试错误处理）
   */
  randomize(errorProbability: number = 0.1): this {
    if (faker.datatype.boolean() && Math.random() < errorProbability) {
      // 返回随机错误
      const errorCodes = [400, 401, 403, 404, 500]
      const errorMessages = [
        '请求参数错误', '未授权访问', '禁止访问', '资源不存在', '服务器内部错误'
      ]
      const randomIndex = faker.number.int({ min: 0, max: errorCodes.length - 1 })

      return this
        .asError(errorCodes[randomIndex], errorMessages[randomIndex])
        .withErrorDetails([faker.lorem.sentence()])
    }

    return this.asSuccess()
  }

  /**
   * 延迟响应（模拟网络延迟）
   */
  async delay(ms: number = 1000): Promise<this> {
    await new Promise(resolve => setTimeout(resolve, ms))
    return this
  }

  /**
   * 批量设置属性
   */
  withOverrides(overrides: Partial<ApiResponse<T>>): this {
    Object.assign(this.data, overrides)
    return this
  }

  /**
   * 从现有响应复制
   */
  fromResponse(response: Partial<ApiResponse<T>>): this {
    this.data = { ...response }
    return this
  }

  /**
   * 获取当前数据（用于调试）
   */
  getData(): Partial<ApiResponse<T>> {
    return { ...this.data }
  }

  /**
   * 构建最终响应对象
   */
  build(): ApiResponse<T> {
    // 确保必要字段存在
    if (this.data.code === undefined) {
      this.data.code = 200
    }
    if (!this.data.message) {
      this.data.message = this.data.success ? 'success' : 'error'
    }
    if (this.data.success === undefined) {
      this.data.success = this.data.code >= 200 && this.data.code < 300
    }
    if (!this.data.timestamp) {
      this.data.timestamp = new Date().toISOString()
    }
    if (!this.data.requestId) {
      this.data.requestId = faker.string.uuid()
    }

    return this.data as ApiResponse<T>
  }

  /**
   * 克隆当前Builder
   */
  clone(): ResponseBuilder<T> {
    const newBuilder = new ResponseBuilder<T>()
    newBuilder.data = { ...this.data }
    return newBuilder
  }
}

// ========== 列表响应Builder类 ==========

/**
 * 列表响应Builder类
 * 专门用于构建列表和分页响应
 */
export class ListResponseBuilder<T = any> extends ResponseBuilder<ListResponse<T>> {
  private items: T[] = []
  private paginationData?: PaginationData

  /**
   * 设置列表数据
   */
  withItems(items: T[]): this {
    this.items = items
    return this
  }

  /**
   * 设置分页数据
   */
  withPagination(pagination: PaginationData): this {
    this.paginationData = pagination
    return this
  }

  /**
   * 设置分页参数（自动计算分页信息）
   */
  withPaginationParams(current: number = 1, size: number = 10, total?: number): this {
    const totalItems = total ?? this.items.length
    const pages = Math.ceil(totalItems / size)

    this.paginationData = {
      current,
      size,
      total: totalItems,
      pages,
      hasNext: current < pages,
      hasPrevious: current > 1
    }

    return this
  }

  /**
   * 构建列表响应
   */
  buildList(message: string = '获取成功'): ListResponse<T> {
    if (!this.paginationData) {
      // 如果没有分页数据，创建默认分页
      this.withPaginationParams()
    }

    return super
      .asListResponse(this.items, this.paginationData!, message)
      .build() as ListResponse<T>
  }

  /**
   * 构建空列表响应
   */
  buildEmpty(message: string = '暂无数据'): ListResponse<T> {
    return this
      .withItems([])
      .withPaginationParams(1, 10, 0)
      .asSuccess(message)
      .build() as ListResponse<T>
  }

  /**
   * 构建大数据分页响应
   */
  buildLargeData(
    totalItems: number = 10000,
    currentPage: number = 1,
    pageSize: number = 50,
    message: string = '获取成功'
  ): ListResponse<T> {
    // 生成当前页的数据
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, totalItems)
    const pageItems = this.items.slice(startIndex, endIndex)

    return this
      .withItems(pageItems)
      .withPaginationParams(currentPage, pageSize, totalItems)
      .asSuccess(message)
      .build() as ListResponse<T>
  }
}

// ========== 便捷构建函数 ==========

/**
 * 创建响应Builder实例
 */
export function responseBuilder<T = any>(): ResponseBuilder<T> {
  return new ResponseBuilder<T>()
}

/**
 * 创建列表响应Builder实例
 */
export function listResponseBuilder<T = any>(): ListResponseBuilder<T> {
  return new ListResponseBuilder<T>()
}

/**
 * 快速构建成功响应
 */
export function buildSuccessResponse<T = any>(data: T, message?: string): ApiResponse<T> {
  return new ResponseBuilder<T>().asSuccess(message).withData(data).build()
}

/**
 * 快速构建错误响应
 */
export function buildErrorResponse(code?: number, message?: string): ApiResponse {
  return new ResponseBuilder().asError(code, message).build()
}

/**
 * 快速构建列表响应
 */
export function buildListResponse<T>(
  items: T[],
  pagination: PaginationData,
  message?: string
): ListResponse<T> {
  return new ListResponseBuilder<T>()
    .withItems(items)
    .withPagination(pagination)
    .buildList(message)
}

/**
 * 快速构建分页响应
 */
export function buildPaginatedResponse<T>(
  items: T[],
  currentPage?: number,
  pageSize?: number,
  totalItems?: number
): ListResponse<T> {
  return new ListResponseBuilder<T>()
    .withItems(items)
    .withPaginationParams(currentPage, pageSize, totalItems)
    .buildList()
}

/**
 * 构建随机响应
 */
export function buildRandomResponse<T>(data: T, errorProbability?: number): ApiResponse<T> {
  return new ResponseBuilder<T>().randomize(errorProbability).withData(data).build()
}
