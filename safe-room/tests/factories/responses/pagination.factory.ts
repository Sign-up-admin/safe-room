/**
 * 分页数据工厂
 * 创建和管理分页相关的数据
 */

import {
  EnhancedBaseFactory,
  createRequiredFieldsValidator,
  createTypeValidator,
  createBaseValidator
} from '../base/base-factory'

// ========== 类型定义 ==========

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
 * 分页查询参数接口
 */
export interface PaginationQuery {
  page?: number
  size?: number
  sort?: string
  order?: 'asc' | 'desc'
  keyword?: string
  filters?: Record<string, any>
}

/**
 * 分页元数据接口
 */
export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  from: number
  to: number
}

/**
 * 高级分页信息接口
 */
export interface AdvancedPaginationData extends PaginationData {
  from: number
  to: number
  showing: string
  meta: PaginationMeta
}

/**
 * 分页配置接口
 */
export interface PaginationConfig {
  defaultPageSize: number
  maxPageSize: number
  defaultSort: string
  defaultOrder: 'asc' | 'desc'
}

/**
 * 分页预设数据
 */
export const PAGINATION_PRESETS = {
  small: {
    current: 1,
    size: 10,
    total: 50
  },
  medium: {
    current: 1,
    size: 20,
    total: 200
  },
  large: {
    current: 1,
    size: 50,
    total: 1000
  },
  empty: {
    current: 1,
    size: 10,
    total: 0
  },
  singlePage: {
    current: 1,
    size: 10,
    total: 5
  },
  lastPage: {
    current: 5,
    size: 10,
    total: 50
  }
}

/**
 * 分页工厂类
 */
export class PaginationFactory extends EnhancedBaseFactory<PaginationData> {
  private readonly defaultConfig: PaginationConfig = {
    defaultPageSize: 10,
    maxPageSize: 100,
    defaultSort: 'createTime',
    defaultOrder: 'desc'
  }

  constructor(config: Partial<PaginationConfig> = {}) {
    super({
      validator: createBaseValidator('paginationData', (pagination: PaginationData) => {
        const errors: string[] = []
        const warnings: string[] = []

        // 基础字段验证
        if (pagination.current < 1) {
          errors.push('当前页码不能小于1')
        }
        if (pagination.size < 1) {
          errors.push('每页大小不能小于1')
        }
        if (pagination.total < 0) {
          errors.push('总条数不能为负数')
        }
        if (pagination.pages < 0) {
          errors.push('总页数不能为负数')
        }

        // 逻辑一致性验证
        const expectedPages = Math.ceil(pagination.total / pagination.size)
        if (pagination.pages !== expectedPages) {
          warnings.push(`总页数应为${expectedPages}，当前为${pagination.pages}`)
        }

        if (pagination.current > pagination.pages && pagination.total > 0) {
          warnings.push('当前页码超过了总页数')
        }

        // hasNext和hasPrevious逻辑验证
        const expectedHasNext = pagination.current < pagination.pages
        const expectedHasPrevious = pagination.current > 1

        if (pagination.hasNext !== expectedHasNext) {
          warnings.push(`hasNext应为${expectedHasNext}，当前为${pagination.hasNext}`)
        }

        if (pagination.hasPrevious !== expectedHasPrevious) {
          warnings.push(`hasPrevious应为${expectedHasPrevious}，当前为${pagination.hasPrevious}`)
        }

        return { isValid: errors.length === 0, errors, warnings }
      })
    })

    this.defaultConfig = { ...this.defaultConfig, ...config }
  }

  /**
   * 创建分页数据
   */
  create(overrides: Partial<PaginationData> = {}): PaginationData {
    // 设置默认值
    const current = overrides.current ?? 1
    const size = overrides.size ?? this.defaultConfig.defaultPageSize
    const total = overrides.total ?? this.randomNumber(0, 1000)

    // 计算总页数
    const pages = Math.ceil(total / size)

    // 确保当前页不超出范围
    const validCurrent = Math.min(Math.max(1, current), Math.max(1, pages))

    return this.mergeDefaults({
      current: validCurrent,
      size,
      total,
      pages,
      hasNext: validCurrent < pages,
      hasPrevious: validCurrent > 1
    }, overrides)
  }

  /**
   * 创建预设分页数据
   */
  createPreset(preset: keyof typeof PAGINATION_PRESETS, overrides: Partial<PaginationData> = {}): PaginationData {
    return this.create({
      ...PAGINATION_PRESETS[preset],
      ...overrides
    })
  }

  /**
   * 创建随机分页数据
   */
  createRandom(overrides: Partial<PaginationData> = {}): PaginationData {
    const total = overrides.total ?? this.randomNumber(0, 10000)
    const size = overrides.size ?? this.randomFromArray([10, 20, 50, 100])
    const pages = Math.ceil(total / size)
    const current = overrides.current ?? this.randomNumber(1, Math.max(1, pages))

    return this.create({
      current,
      size,
      total,
      ...overrides
    })
  }

  /**
   * 创建高级分页数据（包含更多元信息）
   */
  createAdvanced(overrides: Partial<PaginationData> = {}): AdvancedPaginationData {
    const pagination = this.create(overrides)
    const from = (pagination.current - 1) * pagination.size + 1
    const to = Math.min(pagination.current * pagination.size, pagination.total)

    const meta: PaginationMeta = {
      page: pagination.current,
      perPage: pagination.size,
      total: pagination.total,
      totalPages: pagination.pages,
      hasNextPage: pagination.hasNext,
      hasPrevPage: pagination.hasPrevious,
      from,
      to
    }

    const showing = pagination.total > 0
      ? `显示 ${from}-${to} 条，共 ${pagination.total} 条`
      : '暂无数据'

    return {
      ...pagination,
      from,
      to,
      showing,
      meta
    }
  }

  /**
   * 创建分页查询参数
   */
  createQueryParams(overrides: Partial<PaginationQuery> = {}): PaginationQuery {
    return {
      page: overrides.page ?? 1,
      size: overrides.size ?? this.defaultConfig.defaultPageSize,
      sort: overrides.sort ?? this.defaultConfig.defaultSort,
      order: overrides.order ?? this.defaultConfig.defaultOrder,
      keyword: overrides.keyword,
      filters: overrides.filters ?? {},
      ...overrides
    }
  }

  /**
   * 从查询参数创建分页数据
   */
  createFromQuery(query: PaginationQuery, totalItems: number): PaginationData {
    const current = query.page ?? 1
    const size = Math.min(query.size ?? this.defaultConfig.defaultPageSize, this.defaultConfig.maxPageSize)

    return this.create({
      current,
      size,
      total: totalItems
    })
  }

  /**
   * 创建第一页分页数据
   */
  createFirstPage(total: number, size?: number): PaginationData {
    return this.create({
      current: 1,
      size: size ?? this.defaultConfig.defaultPageSize,
      total
    })
  }

  /**
   * 创建最后一页分页数据
   */
  createLastPage(total: number, size?: number): PaginationData {
    const pageSize = size ?? this.defaultConfig.defaultPageSize
    const pages = Math.ceil(total / pageSize)

    return this.create({
      current: pages,
      size: pageSize,
      total
    })
  }

  /**
   * 创建中间页分页数据
   */
  createMiddlePage(total: number, size?: number): PaginationData {
    const pageSize = size ?? this.defaultConfig.defaultPageSize
    const pages = Math.ceil(total / pageSize)
    const current = Math.max(1, Math.min(pages, Math.floor(pages / 2)))

    return this.create({
      current,
      size: pageSize,
      total
    })
  }

  /**
   * 创建空数据分页
   */
  createEmpty(size?: number): PaginationData {
    return this.create({
      current: 1,
      size: size ?? this.defaultConfig.defaultPageSize,
      total: 0
    })
  }

  /**
   * 创建大数据分页（用于性能测试）
   */
  createLargeData(current?: number, size?: number): PaginationData {
    return this.create({
      current: current ?? this.randomNumber(1, 100),
      size: size ?? 50,
      total: this.randomNumber(5000, 100000)
    })
  }

  /**
   * 创建小数据分页
   */
  createSmallData(current?: number, size?: number): PaginationData {
    return this.create({
      current: current ?? 1,
      size: size ?? 10,
      total: this.randomNumber(1, 50)
    })
  }

  /**
   * 计算分页范围
   */
  calculateRange(pagination: PaginationData): { from: number; to: number } {
    const from = (pagination.current - 1) * pagination.size + 1
    const to = Math.min(pagination.current * pagination.size, pagination.total)

    return { from, to }
  }

  /**
   * 获取页码数组（用于分页组件）
   */
  getPageNumbers(pagination: PaginationData, maxDisplay: number = 7): number[] {
    const { current, pages } = pagination
    const pagesArray: number[] = []

    if (pages <= maxDisplay) {
      // 总页数少于最大显示页数，显示所有页码
      for (let i = 1; i <= pages; i++) {
        pagesArray.push(i)
      }
    } else {
      // 计算显示范围
      const half = Math.floor(maxDisplay / 2)
      let start = Math.max(1, current - half)
      let end = Math.min(pages, start + maxDisplay - 1)

      // 调整起始页码，确保显示足够的页码
      if (end - start + 1 < maxDisplay) {
        start = Math.max(1, end - maxDisplay + 1)
      }

      for (let i = start; i <= end; i++) {
        pagesArray.push(i)
      }
    }

    return pagesArray
  }

  /**
   * 验证分页参数
   */
  validatePaginationParams(current: number, size: number, total: number): {
    isValid: boolean
    errors: string[]
    corrected?: { current: number; size: number }
  } {
    const errors: string[] = []

    if (current < 1) {
      errors.push('页码不能小于1')
    }

    if (size < 1) {
      errors.push('每页大小不能小于1')
    }

    if (size > this.defaultConfig.maxPageSize) {
      errors.push(`每页大小不能超过${this.defaultConfig.maxPageSize}`)
    }

    if (total < 0) {
      errors.push('总条数不能为负数')
    }

    const corrected = errors.length > 0 ? {
      current: Math.max(1, current),
      size: Math.min(Math.max(1, size), this.defaultConfig.maxPageSize)
    } : undefined

    return {
      isValid: errors.length === 0,
      errors,
      corrected
    }
  }

  /**
   * 分页导航
   */
  navigate(pagination: PaginationData, action: 'first' | 'prev' | 'next' | 'last' | number): PaginationData {
    let newCurrent = pagination.current

    switch (action) {
      case 'first':
        newCurrent = 1
        break
      case 'prev':
        newCurrent = Math.max(1, pagination.current - 1)
        break
      case 'next':
        newCurrent = Math.min(pagination.pages, pagination.current + 1)
        break
      case 'last':
        newCurrent = pagination.pages
        break
      default:
        newCurrent = Math.max(1, Math.min(pagination.pages, action))
    }

    return this.create({
      ...pagination,
      current: newCurrent
    })
  }

  /**
   * 批量创建不同页的分页数据
   */
  createPageRange(total: number, size: number = 10, pageRange: number[] = []): PaginationData[] {
    const pages = Math.ceil(total / size)
    const pagesToCreate = pageRange.length > 0 ? pageRange : Array.from({ length: pages }, (_, i) => i + 1)

    return pagesToCreate.map(page =>
      this.create({
        current: page,
        size,
        total
      })
    )
  }
}

// ========== 全局工厂实例 ==========

export const paginationFactory = new PaginationFactory()

// ========== 便捷创建函数 ==========

/**
 * 创建分页数据
 */
export function createPagination(overrides?: Partial<PaginationData>): PaginationData {
  return paginationFactory.create(overrides)
}

/**
 * 创建随机分页数据
 */
export function createRandomPagination(overrides?: Partial<PaginationData>): PaginationData {
  return paginationFactory.createRandom(overrides)
}

/**
 * 创建高级分页数据
 */
export function createAdvancedPagination(overrides?: Partial<PaginationData>): AdvancedPaginationData {
  return paginationFactory.createAdvanced(overrides)
}

/**
 * 创建空分页数据
 */
export function createEmptyPagination(size?: number): PaginationData {
  return paginationFactory.createEmpty(size)
}
