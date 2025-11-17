import { faker } from '@faker-js/faker'
import type { validateApiResponse, validatePageResult } from '../../../../../../../tests/shared/types/api-response.types'

/**
 * Create mock table data for admin lists
 */
export function createMockTableData<T extends Record<string, any>>(
  count: number,
  baseData: T,
  overrides: Partial<T> = {}
): Array<T & { id: number; createTime: string; updateTime?: string; status: number }> {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    ...baseData,
    createTime: faker.date.past().toISOString(),
    updateTime: faker.date.recent().toISOString(),
    status: faker.helpers.arrayElement([0, 1]),
    ...overrides
  }))
}

/**
 * Create mock pagination data
 */
export function createMockPagination(overrides: Partial<{
  current: number
  size: number
  total: number
  pages: number
  hasNext: boolean
  hasPrevious: boolean
}> = {}) {
  const total = overrides.total || faker.number.int({ min: 50, max: 1000 })
  const size = overrides.size || 10
  const current = overrides.current || faker.number.int({ min: 1, max: Math.ceil(total / size) })
  const pages = Math.ceil(total / size)

  return {
    current,
    size,
    total,
    pages,
    hasNext: current < pages,
    hasPrevious: current > 1,
    ...overrides
  }
}

/**
 * Create mock API response wrapper
 */
export function createMockApiResponse<T>(
  data: T,
  overrides: Partial<{
    code: number
    message: string
    success: boolean
  }> = {}
) {
  return {
    code: overrides.code || 200,
    message: overrides.message || 'success',
    data,
    success: overrides.success !== undefined ? overrides.success : true
  }
}

/**
 * Create mock API list response
 */
export function createMockApiListResponse<T>(
  items: T[],
  overrides: Partial<{
    pagination: any
    code: number
    message: string
  }> = {}
) {
  const pagination = createMockPagination({
    total: items.length,
    ...overrides.pagination
  })

  return createMockApiResponse({
    list: items,
    pagination
  }, overrides)
}

/**
 * Create mock form data
 */
export function createMockFormData(overrides: Partial<Record<string, any>> = {}) {
  return {
    name: faker.lorem.words({ min: 1, max: 3 }),
    description: faker.lorem.sentence(),
    status: faker.helpers.arrayElement([0, 1]),
    sort: faker.number.int({ min: 1, max: 100 }),
    createTime: faker.date.past().toISOString(),
    updateTime: faker.date.recent().toISOString(),
    ...overrides
  }
}

/**
 * Create mock search/filter parameters
 */
export function createMockSearchParams(overrides: Partial<{
  keyword?: string
  status?: number
  dateRange?: [string, string]
  category?: string
  page?: number
  size?: number
  sort?: string
  order?: 'asc' | 'desc'
}> = {}) {
  return {
    keyword: faker.helpers.maybe(() => faker.lorem.word(), { probability: 0.3 }),
    status: faker.helpers.maybe(() => faker.helpers.arrayElement([0, 1]), { probability: 0.5 }),
    dateRange: faker.helpers.maybe(() => [
      faker.date.past().toISOString().split('T')[0],
      faker.date.recent().toISOString().split('T')[0]
    ], { probability: 0.4 }),
    category: faker.helpers.maybe(() => faker.lorem.word(), { probability: 0.3 }),
    page: faker.number.int({ min: 1, max: 10 }),
    size: faker.helpers.arrayElement([10, 20, 50, 100]),
    sort: faker.helpers.arrayElement(['createTime', 'updateTime', 'name', 'sort']),
    order: faker.helpers.arrayElement(['asc', 'desc']),
    ...overrides
  }
}

/**
 * Create mock statistics data
 */
export function createMockStatistics(overrides: Partial<{
  totalCount: number
  activeCount: number
  inactiveCount: number
  todayCount: number
  weekCount: number
  monthCount: number
  growth: number
  chartData: Array<{ date: string; value: number }>
}> = {}) {
  const totalCount = faker.number.int({ min: 100, max: 10000 })
  const activeCount = Math.floor(totalCount * faker.number.float({ min: 0.3, max: 0.9 }))

  return {
    totalCount,
    activeCount,
    inactiveCount: totalCount - activeCount,
    todayCount: faker.number.int({ min: 0, max: 50 }),
    weekCount: faker.number.int({ min: 10, max: 200 }),
    monthCount: faker.number.int({ min: 50, max: 500 }),
    growth: faker.number.float({ min: -0.2, max: 0.5 }),
    chartData: Array.from({ length: 30 }, (_, i) => ({
      date: faker.date.recent({ days: 30 - i }).toISOString().split('T')[0],
      value: faker.number.int({ min: 1, max: 100 })
    })),
    ...overrides
  }
}

/**
 * Create mock operation log
 */
export function createMockOperationLog(overrides: Partial<{
  id: number
  userId: number
  username: string
  operation: string
  method: string
  url: string
  params?: string
  result?: string
  ip: string
  userAgent: string
  duration: number
  status: number
  createTime: string
  errorMessage?: string
}> = {}) {
  const operations = [
    '登录', '登出', '创建用户', '更新用户', '删除用户',
    '创建课程', '更新课程', '删除课程', '查看列表', '导出数据',
    '修改设置', '重置密码', '批量操作', '数据备份', '系统维护'
  ]

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  const statuses = [200, 201, 204, 400, 401, 403, 404, 500]

  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    userId: faker.number.int({ min: 1, max: 100 }),
    username: faker.internet.username(),
    operation: faker.helpers.arrayElement(operations),
    method: faker.helpers.arrayElement(methods),
    url: faker.internet.url(),
    params: faker.helpers.maybe(() => JSON.stringify({
      id: faker.number.int(),
      name: faker.lorem.word()
    }), { probability: 0.6 }),
    result: faker.helpers.maybe(() => 'success', { probability: 0.8 }),
    ip: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    duration: faker.number.int({ min: 10, max: 5000 }),
    status: faker.helpers.arrayElement(statuses),
    createTime: faker.date.recent().toISOString(),
    errorMessage: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }),
    ...overrides
  }
}

/**
 * Create mock system config
 */
export function createMockSystemConfig(overrides: Partial<{
  id: number
  key: string
  value: any
  type: string
  description: string
  group: string
  status: number
  createTime: string
  updateTime?: string
}> = {}) {
  const configKeys = [
    'site.title', 'site.description', 'site.logo', 'site.favicon',
    'system.maintenance', 'system.debug', 'cache.enabled', 'cache.ttl',
    'email.enabled', 'email.host', 'email.port', 'email.username',
    'upload.maxSize', 'upload.allowedTypes', 'security.cors',
    'log.level', 'log.maxFiles', 'log.maxSize'
  ]

  const groups = ['site', 'system', 'cache', 'email', 'upload', 'security', 'log']
  const types = ['string', 'number', 'boolean', 'json', 'array']

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    key: faker.helpers.arrayElement(configKeys),
    value: faker.helpers.arrayElement([
      faker.lorem.word(),
      faker.number.int(),
      faker.datatype.boolean(),
      JSON.stringify({ key: faker.lorem.word() }),
      JSON.stringify([faker.lorem.word(), faker.lorem.word()])
    ]),
    type: faker.helpers.arrayElement(types),
    description: faker.lorem.sentence(),
    group: faker.helpers.arrayElement(groups),
    status: faker.helpers.arrayElement([0, 1]),
    createTime: faker.date.past().toISOString(),
    updateTime: faker.date.recent().toISOString(),
    ...overrides
  }
}

/**
 * Create mock notification data
 */
export function createMockNotification(overrides: Partial<{
  id: number
  title: string
  content: string
  type: string
  level: string
  status: number
  createTime: string
  updateTime?: string
  senderId?: number
  senderName?: string
  recipientIds?: number[]
}> = {}) {
  const types = ['system', 'user', 'warning', 'error', 'info']
  const levels = ['low', 'medium', 'high', 'urgent']

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    title: faker.lorem.words({ min: 2, max: 5 }),
    content: faker.lorem.paragraph(),
    type: faker.helpers.arrayElement(types),
    level: faker.helpers.arrayElement(levels),
    status: faker.helpers.arrayElement([0, 1, 2]), // 0: unread, 1: read, 2: archived
    createTime: faker.date.recent().toISOString(),
    updateTime: faker.date.recent().toISOString(),
    senderId: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 100 }), { probability: 0.7 }),
    senderName: faker.helpers.maybe(() => faker.person.fullName(), { probability: 0.7 }),
    recipientIds: faker.helpers.arrayElements(
      Array.from({ length: 10 }, (_, i) => i + 1),
      { min: 1, max: 5 }
    ),
    ...overrides
  }
}

/**
 * Create mock file upload data
 */
export function createMockFileUpload(overrides: Partial<{
  id: number
  name: string
  originalName: string
  size: number
  type: string
  path: string
  url: string
  status: number
  createTime: string
  uploaderId: number
  uploaderName: string
}> = {}) {
  const fileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
  const extensions = ['.jpg', '.png', '.gif', '.pdf', '.txt']

  const typeIndex = faker.number.int({ min: 0, max: fileTypes.length - 1 })

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.string.uuid() + extensions[typeIndex],
    originalName: faker.system.fileName() + extensions[typeIndex],
    size: faker.number.int({ min: 1024, max: 10485760 }), // 1KB to 10MB
    type: fileTypes[typeIndex],
    path: `/uploads/${faker.date.recent().getFullYear()}/${faker.date.recent().getMonth() + 1}/`,
    url: faker.internet.url(),
    status: faker.helpers.arrayElement([0, 1]),
    createTime: faker.date.recent().toISOString(),
    uploaderId: faker.number.int({ min: 1, max: 100 }),
    uploaderName: faker.person.fullName(),
    ...overrides
  }
}

// ========== 数据一致性检查函数 ==========

/**
 * 验证表格数据项的基本结构
 */
export function validateTableDataItem<T extends Record<string, any>>(
  item: any,
  requiredFields: (keyof T)[]
): item is T & { id: number; createTime: string; status: number } {
  const baseFieldsValid = (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.createTime === 'string' &&
    typeof item.status === 'number' &&
    (item.status === 0 || item.status === 1)
  )

  if (!baseFieldsValid) return false

  // 检查必需字段
  return requiredFields.every(field => {
    const value = item[field as string]
    return value !== undefined && value !== null
  })
}

/**
 * 验证表格数据列表一致性
 */
export function validateTableDataListConsistency<T extends Record<string, any>>(
  items: any[],
  requiredFields: (keyof T)[] = []
): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  if (!Array.isArray(items)) {
    errors.push('Input is not an array')
    return { isValid: false, errors, warnings }
  }

  const ids = new Set<number>()

  items.forEach((item, index) => {
    if (!validateTableDataItem(item, requiredFields)) {
      errors.push(`Table data item at index ${index} has invalid structure`)
    }

    // 检查ID唯一性
    if (ids.has(item.id)) {
      warnings.push(`Duplicate ID ${item.id} found`)
    }
    ids.add(item.id)

    // 检查创建时间合理性
    const createDate = new Date(item.createTime)
    if (isNaN(createDate.getTime())) {
      warnings.push(`Invalid createTime format for item ${item.id}`)
    }

    // 检查更新时间（如果存在）
    if (item.updateTime) {
      const updateDate = new Date(item.updateTime)
      if (isNaN(updateDate.getTime())) {
        warnings.push(`Invalid updateTime format for item ${item.id}`)
      } else if (updateDate < createDate) {
        warnings.push(`Update time is before create time for item ${item.id}`)
      }
    }

    // 检查状态值合理性
    if (item.status !== 0 && item.status !== 1) {
      warnings.push(`Invalid status value ${item.status} for item ${item.id}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 验证分页数据
 */
export function validatePaginationData(pagination: any): boolean {
  return (
    pagination &&
    typeof pagination === 'object' &&
    typeof pagination.current === 'number' &&
    typeof pagination.size === 'number' &&
    typeof pagination.total === 'number' &&
    typeof pagination.pages === 'number' &&
    typeof pagination.hasNext === 'boolean' &&
    typeof pagination.hasPrevious === 'boolean' &&
    pagination.current > 0 &&
    pagination.size > 0 &&
    pagination.total >= 0 &&
    pagination.pages >= 0
  )
}

/**
 * 验证API列表响应数据
 */
export function validateApiListResponseData<T extends Record<string, any>>(
  response: any,
  requiredItemFields: (keyof T)[] = []
): boolean {
  return (
    response &&
    typeof response === 'object' &&
    validatePageResult(response) &&
    Array.isArray(response.list) &&
    response.list.every((item: any) => validateTableDataItem(item, requiredItemFields))
  )
}

/**
 * 验证统计数据
 */
export function validateStatisticsData(stats: any): boolean {
  const requiredFields = [
    'totalCount', 'activeCount', 'inactiveCount',
    'todayCount', 'weekCount', 'monthCount', 'growth'
  ]

  const baseValid = (
    stats &&
    typeof stats === 'object' &&
    requiredFields.every(field => typeof stats[field] === 'number')
  )

  if (!baseValid) return false

  // 检查计数逻辑合理性
  return (
    stats.totalCount >= 0 &&
    stats.activeCount >= 0 &&
    stats.inactiveCount >= 0 &&
    stats.todayCount >= 0 &&
    stats.activeCount + stats.inactiveCount <= stats.totalCount &&
    Array.isArray(stats.chartData)
  )
}

/**
 * 创建验证后的表格数据
 */
export function createValidatedTableData<T extends Record<string, any>>(
  count: number,
  baseData: T,
  overrides: Partial<T> = {},
  requiredFields: (keyof T)[] = []
): Array<T & { id: number; createTime: string; updateTime?: string; status: number }> {
  const data = createMockTableData(count, baseData, overrides)
  const validation = validateTableDataListConsistency(data, requiredFields)

  if (!validation.isValid) {
    console.warn('Table data validation warnings:', validation.warnings)
    throw new Error(`Table data validation failed: ${validation.errors.join(', ')}`)
  }

  return data
}

/**
 * 创建验证后的分页数据
 */
export function createValidatedPagination(overrides: any = {}): {
  current: number
  size: number
  total: number
  pages: number
  hasNext: boolean
  hasPrevious: boolean
} {
  const pagination = createMockPagination(overrides)

  if (!validatePaginationData(pagination)) {
    throw new Error('Generated pagination data is invalid')
  }

  return pagination
}

/**
 * 创建验证后的统计数据
 */
export function createValidatedStatistics(overrides: any = {}): {
  totalCount: number
  activeCount: number
  inactiveCount: number
  todayCount: number
  weekCount: number
  monthCount: number
  growth: number
  chartData: Array<{ date: string; value: number }>
} {
  const stats = createMockStatistics(overrides)

  if (!validateStatisticsData(stats)) {
    throw new Error('Generated statistics data is invalid')
  }

  return stats
}
