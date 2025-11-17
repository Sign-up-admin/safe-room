/**
 * API请求组合式函数
 * 提供统一的API请求方法
 */
import { useGlobalProperties } from './useGlobalProperties'
import type { ApiResponse, PageResult, PageParams } from '@/types/api'

export interface UseApiOptions {
  showError?: boolean
  showLoading?: boolean
}

/**
 * 使用API的组合式函数
 */
export function useApi() {
  const { $http } = useGlobalProperties()

  /**
   * GET请求
   */
  async function get<T extends Record<string, unknown> = Record<string, unknown>>(url: string, params?: Record<string, unknown>, options?: UseApiOptions): Promise<ApiResponse<T>> {
    const response = await $http.get<ApiResponse<T>>(url, { params })
    return response.data
  }

  /**
   * POST请求
   */
  async function post<T extends Record<string, unknown> = Record<string, unknown>>(url: string, data?: Record<string, unknown>, options?: UseApiOptions): Promise<ApiResponse<T>> {
    const response = await $http.post<ApiResponse<T>>(url, data)
    return response.data
  }

  /**
   * PUT请求
   */
  async function put<T extends Record<string, unknown> = Record<string, unknown>>(url: string, data?: Record<string, unknown>, options?: UseApiOptions): Promise<ApiResponse<T>> {
    const response = await $http.put<ApiResponse<T>>(url, data)
    return response.data
  }

  /**
   * DELETE请求
   */
  async function del<T extends Record<string, unknown> = Record<string, unknown>>(url: string, params?: Record<string, unknown>, options?: UseApiOptions): Promise<ApiResponse<T>> {
    const response = await $http.delete<ApiResponse<T>>(url, { params })
    return response.data
  }

  /**
   * 分页查询
   */
  async function page<T extends Record<string, unknown> = Record<string, unknown>>(
    url: string,
    params: PageParams,
    options?: UseApiOptions,
  ): Promise<ApiResponse<PageResult<T>>> {
    return get<PageResult<T>>(url, params, options)
  }

  return {
    get,
    post,
    put,
    del,
    page,
  }
}

