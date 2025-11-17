/**
 * 分页组合式函数
 * 提供统一的分页逻辑
 */
import { ref, reactive, computed } from 'vue'
import type { PaginationParams, PaginationResult } from '@/types/common'

export interface UsePaginationOptions {
  defaultPageSize?: number
  pageSizes?: number[]
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { defaultPageSize = 10, pageSizes = [10, 20, 30, 50] } = options

  // 分页状态
  const pagination = reactive({
    page: 1,
    limit: defaultPageSize,
    total: 0,
  })

  // 计算属性
  const pageCount = computed(() => Math.ceil(pagination.total / pagination.limit))
  const hasData = computed(() => pagination.total > 0)

  /**
   * 设置分页信息
   */
  function setPagination(data: Partial<typeof pagination>) {
    Object.assign(pagination, data)
  }

  /**
   * 从API响应中更新分页信息
   */
  function updateFromResponse(response: PaginationResult<any>) {
    pagination.total = response.total || response.list?.length || 0
  }

  /**
   * 重置分页
   */
  function resetPagination() {
    pagination.page = 1
    pagination.limit = defaultPageSize
    pagination.total = 0
  }

  /**
   * 获取分页参数
   */
  function getPaginationParams(): PaginationParams {
    return {
      page: pagination.page,
      limit: pagination.limit,
    }
  }

  /**
   * 处理页码变化
   */
  function handlePageChange(page: number) {
    pagination.page = page
  }

  /**
   * 处理每页条数变化
   */
  function handleSizeChange(size: number) {
    pagination.limit = size
    pagination.page = 1 // 重置到第一页
  }

  return {
    pagination,
    pageCount,
    hasData,
    pageSizes,
    setPagination,
    updateFromResponse,
    resetPagination,
    getPaginationParams,
    handlePageChange,
    handleSizeChange,
  }
}
