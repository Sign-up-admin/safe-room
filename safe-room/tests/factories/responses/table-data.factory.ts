/**
 * 表格数据工厂
 * 创建和管理表格显示的数据，整合现有的data.factory.ts功能
 */

import {
  EnhancedBaseFactory,
  createRequiredFieldsValidator,
  createTypeValidator,
  createBaseValidator
} from '../base/base-factory'

// ========== 类型定义 ==========

/**
 * 基础表格数据接口
 */
export interface BaseTableData {
  id: number
  createTime: string
  updateTime?: string
  status: number
}

/**
 * 表格列配置接口
 */
export interface TableColumn<T = any> {
  prop: keyof T
  label: string
  width?: number | string
  sortable?: boolean
  filterable?: boolean
  align?: 'left' | 'center' | 'right'
  formatter?: (value: any, row: T, column: TableColumn<T>) => string
  slot?: string
}

/**
 * 表格操作按钮接口
 */
export interface TableAction {
  label: string
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  icon?: string
  action: string
  visible?: (row: any) => boolean
  disabled?: (row: any) => boolean
}

/**
 * 表格配置接口
 */
export interface TableConfig<T = any> {
  columns: TableColumn<T>[]
  actions?: TableAction[]
  selectable?: boolean
  expandable?: boolean
  showIndex?: boolean
  indexLabel?: string
}

/**
 * 表格数据包装器接口
 */
export interface TableDataWrapper<T = any> {
  data: T[]
  config: TableConfig<T>
  total: number
  loading: boolean
  emptyText: string
}

/**
 * 表单数据接口
 */
export interface FormData {
  name: string
  description: string
  status: number
  sort: number
  createTime: string
  updateTime?: string
}

/**
 * 搜索参数接口
 */
export interface SearchParams {
  keyword?: string
  status?: number
  dateRange?: [string, string]
  category?: string
  page?: number
  size?: number
  sort?: string
  order?: 'asc' | 'desc'
}

/**
 * 统计数据接口
 */
export interface StatisticsData {
  totalCount: number
  activeCount: number
  inactiveCount: number
  todayCount: number
  weekCount: number
  monthCount: number
  growth: number
  chartData: Array<{ date: string; value: number }>
}

/**
 * 操作日志接口
 */
export interface OperationLog {
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
}

/**
 * 系统配置接口
 */
export interface SystemConfig {
  id: number
  key: string
  value: any
  type: string
  description: string
  group: string
  status: number
  createTime: string
  updateTime?: string
}

/**
 * 表格数据工厂类
 */
export class TableDataFactory extends EnhancedBaseFactory<BaseTableData> {
  constructor() {
    super({
      validator: createBaseValidator('tableData', (data: BaseTableData) => {
        const errors: string[] = []
        const warnings: string[] = []

        // 基础字段验证
        if (!data.id || typeof data.id !== 'number') {
          errors.push('ID必须是有效数字')
        }
        if (!data.createTime) {
          errors.push('创建时间不能为空')
        }
        if (data.status !== 0 && data.status !== 1) {
          warnings.push('状态值建议为0或1')
        }

        // 时间格式验证
        try {
          new Date(data.createTime)
        } catch {
          errors.push('创建时间格式无效')
        }

        if (data.updateTime) {
          try {
            new Date(data.updateTime)
          } catch {
            warnings.push('更新时间格式无效')
          }
        }

        return { isValid: errors.length === 0, errors, warnings }
      })
    })
  }

  /**
   * 创建表格数据（基础版本）
   */
  createTableData<T extends BaseTableData>(
    count: number,
    baseData: Partial<T>,
    overrides: Partial<T> = {}
  ): Array<T & BaseTableData> {
    return Array.from({ length: count }, (_, index) => {
      const id = (overrides.id ?? baseData.id ?? 0) + index + 1
      const createdAt = new Date(Date.now() - this.randomNumber(0, 365 * 24 * 60 * 60 * 1000)) // 过去一年内

      return this.mergeDefaults({
        id,
        createTime: createdAt.toISOString(),
        updateTime: this.randomBoolean() ? new Date(createdAt.getTime() + this.randomNumber(0, 30 * 24 * 60 * 60 * 1000)).toISOString() : undefined,
        status: this.randomFromArray([0, 1]),
        ...baseData
      } as T & BaseTableData, overrides)
    })
  }

  /**
   * 创建用户表格数据
   */
  createUserTableData(count: number, overrides: any = {}): Array<any & BaseTableData> {
    return this.createTableData(count, {
      username: () => this.randomUsername(),
      realName: () => this.randomName(),
      email: () => this.randomEmail(),
      phone: () => this.randomPhone(),
      role: () => this.randomFromArray(['admin', 'manager', 'operator', 'user']),
      status: () => this.randomFromArray([0, 1]),
      createTime: () => this.randomDate().toISOString(),
      ...overrides
    })
  }

  /**
   * 创建课程表格数据
   */
  createCourseTableData(count: number, overrides: any = {}): Array<any & BaseTableData> {
    return this.createTableData(count, {
      name: () => this.faker.lorem.words({ min: 2, max: 4 }),
      description: () => this.randomSentence(),
      price: () => this.randomNumber(50, 500),
      instructor: () => this.randomName(),
      category: () => this.randomFromArray(['瑜伽', '健身', '舞蹈', '武术']),
      status: () => this.randomFromArray([0, 1]),
      createTime: () => this.randomDate().toISOString(),
      ...overrides
    })
  }

  /**
   * 创建订单表格数据
   */
  createOrderTableData(count: number, overrides: any = {}): Array<any & BaseTableData> {
    return this.createTableData(count, {
      orderNo: () => `ORD${this.randomString(8).toUpperCase()}`,
      userId: () => this.randomNumber(1, 1000),
      username: () => this.randomUsername(),
      courseName: () => this.faker.lorem.words({ min: 2, max: 4 }),
      amount: () => this.randomNumber(50, 1000),
      status: () => this.randomFromArray([0, 1, 2, 3]), // 0:待支付, 1:已支付, 2:已取消, 3:已退款
      payTime: () => this.randomBoolean() ? this.randomDate().toISOString() : undefined,
      createTime: () => this.randomDate().toISOString(),
      ...overrides
    })
  }

  /**
   * 创建表单数据
   */
  createFormData(overrides: Partial<FormData> = {}): FormData {
    return this.mergeDefaults({
      name: this.faker.lorem.words({ min: 1, max: 3 }),
      description: this.randomSentence(),
      status: this.randomFromArray([0, 1]),
      sort: this.randomNumber(1, 100),
      createTime: this.randomDate().toISOString(),
      updateTime: this.randomBoolean() ? this.randomDate().toISOString() : undefined
    }, overrides)
  }

  /**
   * 创建搜索参数
   */
  createSearchParams(overrides: Partial<SearchParams> = {}): SearchParams {
    return {
      keyword: this.randomBoolean() ? this.faker.lorem.word() : undefined,
      status: this.randomBoolean() ? this.randomFromArray([0, 1]) : undefined,
      dateRange: this.randomBoolean() ? [
        this.randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        this.randomDate().toISOString().split('T')[0]
      ] : undefined,
      category: this.randomBoolean() ? this.faker.lorem.word() : undefined,
      page: 1,
      size: this.randomFromArray([10, 20, 50, 100]),
      sort: this.randomFromArray(['createTime', 'updateTime', 'name', 'sort']),
      order: this.randomFromArray(['asc', 'desc']),
      ...overrides
    }
  }

  /**
   * 创建统计数据
   */
  createStatisticsData(overrides: Partial<StatisticsData> = {}): StatisticsData {
    const totalCount = this.randomNumber(100, 10000)
    const activeCount = Math.floor(totalCount * this.faker.number.float({ min: 0.3, max: 0.9 }))

    return this.mergeDefaults({
      totalCount,
      activeCount,
      inactiveCount: totalCount - activeCount,
      todayCount: this.randomNumber(0, 50),
      weekCount: this.randomNumber(10, 200),
      monthCount: this.randomNumber(50, 500),
      growth: this.faker.number.float({ min: -0.2, max: 0.5 }),
      chartData: Array.from({ length: 30 }, (_, i) => ({
        date: this.faker.date.recent({ days: 30 - i }).toISOString().split('T')[0],
        value: this.randomNumber(1, 100)
      }))
    }, overrides)
  }

  /**
   * 创建操作日志数据
   */
  createOperationLogData(count: number, overrides: Partial<OperationLog> = {}): OperationLog[] {
    const operations = [
      '登录', '登出', '创建用户', '更新用户', '删除用户',
      '创建课程', '更新课程', '删除课程', '查看报表', '导出数据',
      '修改设置', '重置密码', '批量操作', '数据备份', '系统维护'
    ]

    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    const statuses = [200, 201, 204, 400, 401, 403, 404, 500]

    return Array.from({ length: count }, (_, index) => {
      const id = (overrides.id ?? 0) + index + 1
      const userId = overrides.userId ?? this.randomNumber(1, 100)

      return this.mergeDefaults({
        id,
        userId,
        username: `user${userId}`,
        operation: this.randomFromArray(operations),
        method: this.randomFromArray(methods),
        url: `/api/${this.faker.lorem.slug()}`,
        params: this.randomBoolean() ? JSON.stringify({
          id: this.randomNumber(1, 1000),
          name: this.faker.lorem.word()
        }) : undefined,
        result: this.randomBoolean() ? 'success' : undefined,
        ip: this.randomIp(),
        userAgent: this.randomUserAgent(),
        duration: this.randomNumber(10, 2000),
        status: this.randomFromArray(statuses),
        createTime: this.randomDate().toISOString(),
        errorMessage: this.randomBoolean() ? this.randomSentence() : undefined
      } as OperationLog, overrides)
    })
  }

  /**
   * 创建系统配置数据
   */
  createSystemConfigData(count: number, overrides: Partial<SystemConfig> = {}): SystemConfig[] {
    const configKeys = [
      'site.title', 'site.description', 'site.logo', 'site.favicon',
      'system.maintenance', 'system.debug', 'cache.enabled', 'cache.ttl',
      'email.enabled', 'email.host', 'email.port', 'email.username',
      'upload.maxSize', 'upload.allowedTypes', 'security.cors',
      'log.level', 'log.maxFiles', 'log.maxSize'
    ]

    const groups = ['site', 'system', 'cache', 'email', 'upload', 'security', 'log']
    const types = ['string', 'number', 'boolean', 'json', 'array']

    return Array.from({ length: count }, (_, index) => {
      const id = (overrides.id ?? 0) + index + 1

      return this.mergeDefaults({
        id,
        key: this.randomFromArray(configKeys),
        value: this.generateConfigValue(this.randomFromArray(types)),
        type: this.randomFromArray(types),
        description: this.randomSentence(),
        group: this.randomFromArray(groups),
        status: this.randomFromArray([0, 1]),
        createTime: this.randomDate().toISOString(),
        updateTime: this.randomBoolean() ? this.randomDate().toISOString() : undefined
      } as SystemConfig, overrides)
    })
  }

  /**
   * 生成配置值
   */
  private generateConfigValue(type: string): any {
    switch (type) {
      case 'string':
        return this.faker.lorem.word()
      case 'number':
        return this.randomNumber(1, 1000)
      case 'boolean':
        return this.randomBoolean()
      case 'json':
        return JSON.stringify({ key: this.faker.lorem.word() })
      case 'array':
        return JSON.stringify([this.faker.lorem.word(), this.faker.lorem.word()])
      default:
        return this.faker.lorem.word()
    }
  }

  /**
   * 创建表格配置
   */
  createTableConfig<T = any>(columns: Partial<TableColumn<T>>[], actions?: TableAction[]): TableConfig<T> {
    const fullColumns: TableColumn<T>[] = columns.map(col => ({
      prop: col.prop!,
      label: col.label || String(col.prop),
      width: col.width,
      sortable: col.sortable ?? false,
      filterable: col.filterable ?? false,
      align: col.align || 'left',
      formatter: col.formatter,
      slot: col.slot
    }))

    return {
      columns: fullColumns,
      actions,
      selectable: true,
      expandable: false,
      showIndex: true,
      indexLabel: '#'
    }
  }

  /**
   * 创建表格数据包装器
   */
  createTableDataWrapper<T extends BaseTableData>(
    data: T[],
    config: TableConfig<T>,
    overrides: Partial<TableDataWrapper<T>> = {}
  ): TableDataWrapper<T> {
    return this.mergeDefaults({
      data,
      config,
      total: data.length,
      loading: false,
      emptyText: '暂无数据'
    }, overrides)
  }

  /**
   * 验证表格数据一致性
   */
  validateTableDataConsistency<T extends BaseTableData>(
    data: T[],
    requiredFields: (keyof T)[] = []
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    if (!Array.isArray(data)) {
      errors.push('数据必须是数组')
      return { isValid: false, errors, warnings }
    }

    const ids = new Set<number>()

    data.forEach((item, index) => {
      // 检查基础字段
      if (!this.validateData(item as BaseTableData).isValid) {
        errors.push(`第${index + 1}条数据基础字段验证失败`)
      }

      // 检查必需字段
      requiredFields.forEach(field => {
        if (item[field] === undefined || item[field] === null) {
          errors.push(`第${index + 1}条数据缺少必需字段: ${String(field)}`)
        }
      })

      // 检查ID唯一性
      if (ids.has(item.id)) {
        warnings.push(`ID重复: ${item.id}`)
      }
      ids.add(item.id)

      // 检查时间顺序
      if (item.updateTime) {
        const createTime = new Date(item.createTime)
        const updateTime = new Date(item.updateTime)
        if (updateTime < createTime) {
          warnings.push(`第${index + 1}条数据的更新时间早于创建时间`)
        }
      }
    })

    return { isValid: errors.length === 0, errors, warnings }
  }

  /**
   * 创建验证后的表格数据
   */
  createValidatedTableData<T extends BaseTableData>(
    count: number,
    baseData: Partial<T>,
    overrides: Partial<T> = {},
    requiredFields: (keyof T)[] = []
  ): Array<T & BaseTableData> {
    const data = this.createTableData(count, baseData, overrides)
    const validation = this.validateTableDataConsistency(data, requiredFields)

    if (!validation.isValid) {
      console.warn('表格数据验证警告:', validation.warnings)
      throw new Error(`表格数据验证失败: ${validation.errors.join(', ')}`)
    }

    return data
  }
}

// ========== 全局工厂实例 ==========

export const tableDataFactory = new TableDataFactory()

// ========== 便捷创建函数 ==========

/**
 * 创建表格数据
 */
export function createTableData<T extends BaseTableData>(
  count: number,
  baseData: Partial<T>,
  overrides?: Partial<T>
): Array<T & BaseTableData> {
  return tableDataFactory.createTableData(count, baseData, overrides)
}

/**
 * 创建用户表格数据
 */
export function createUserTableData(count: number, overrides?: any): Array<any & BaseTableData> {
  return tableDataFactory.createUserTableData(count, overrides)
}

/**
 * 创建表单数据
 */
export function createFormData(overrides?: Partial<FormData>): FormData {
  return tableDataFactory.createFormData(overrides)
}

/**
 * 创建统计数据
 */
export function createStatisticsData(overrides?: Partial<StatisticsData>): StatisticsData {
  return tableDataFactory.createStatisticsData(overrides)
}
