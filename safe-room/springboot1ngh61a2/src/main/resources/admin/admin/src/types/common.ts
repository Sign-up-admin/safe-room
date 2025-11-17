/**
 * 通用类型定义
 */

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: unknown
}

/**
 * 分页结果
 */
export interface PaginationResult<T extends Record<string, unknown> = Record<string, unknown>> {
  total: number
  list: T[]
  records?: T[] // 兼容字段
}

/**
 * 表格列配置
 */
export interface TableColumn {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean
  formatter?: (row: Record<string, unknown>, column: TableColumn, cellValue: unknown) => string
}

/**
 * 表单规则
 */
export interface FormRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change' | 'submit'
  validator?: (rule: FormRule, value: unknown, callback: (error?: Error) => void) => void
  pattern?: RegExp
  min?: number
  max?: number
  type?: 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email'
}

/**
 * 操作权限
 */
export interface Permissions {
  view?: boolean
  create?: boolean
  update?: boolean
  remove?: boolean
  export?: boolean
}

/**
 * 模块配置
 */
export interface ModuleConfig {
  key: string
  title: string
  apiPrefix: string
  permissions?: Permissions
  columns?: TableColumn[]
  formFields?: string[]
}

