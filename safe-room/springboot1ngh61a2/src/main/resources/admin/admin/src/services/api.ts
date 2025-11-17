/**
 * API服务层
 * 统一的API调用接口
 */
import http from '@/utils/http'
import type { ApiResponse } from '@/utils/http'

export interface ListParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  keyword?: string
  [key: string]: any
}

export interface ListResponse<T = any> {
  total: number
  list: T[]
  [key: string]: unknown
}

/**
 * 通用CRUD API服务
 */
export class CrudService<T extends Record<string, unknown> = Record<string, unknown>> {
  constructor(private moduleKey: string) {}

  /**
   * 获取列表
   */
  async list(params: ListParams = {}) {
    const response = await http.get<ApiResponse<ListResponse<T>>>(`/${this.moduleKey}/list`, { params })
    if (response.data.code === 0) {
      return response.data.data
    }
    throw new Error((response.data as any)?.msg || '获取列表失败')
  }

  /**
   * 获取详情
   */
  async info(id: number | string) {
    const response = await http.get<ApiResponse<T>>(`/${this.moduleKey}/info/${id}`)
    if (response.data.code === 0) {
      return response.data.data
    }
    throw new Error((response.data as any)?.msg || '获取详情失败')
  }

  /**
   * 新增
   */
  async save(data: Partial<T>) {
    const response = await http.post<ApiResponse>(`/${this.moduleKey}/save`, data)
    if (response.data.code === 0) {
      return response.data.data
    }
    throw new Error((response.data as any)?.msg || '新增失败')
  }

  /**
   * 更新
   */
  async update(data: Partial<T> & { id: number | string }) {
    const response = await http.post<ApiResponse>(`/${this.moduleKey}/update`, data)
    if (response.data.code === 0) {
      return response.data.data
    }
    throw new Error((response.data as any)?.msg || '更新失败')
  }

  /**
   * 删除
   */
  async delete(ids: (number | string)[]) {
    const response = await http.post<ApiResponse>(`/${this.moduleKey}/delete`, ids)
    if (response.data.code === 0) {
      return response.data.data
    }
    throw new Error((response.data as any)?.msg || '删除失败')
  }
}

/**
 * 创建CRUD服务实例
 */
export function createCrudService<T extends Record<string, unknown> = Record<string, unknown>>(moduleKey: string) {
  return new CrudService<T>(moduleKey)
}

