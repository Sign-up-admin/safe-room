/**
 * CRUD 相关类型定义
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'image'
  | 'file'
  | 'richtext'
  | 'password'
  | 'select'

export interface FieldConfig {
  key: string
  label: string
  type: FieldType
  required?: boolean
  options?: Array<{ label: string; value: unknown }>
  placeholder?: string
  rows?: number
  component?: string
  hidden?: boolean
  readonly?: boolean
}

export interface ColumnLabelMap {
  [key: string]: string
}

export interface FieldTypeMap {
  [key: string]: FieldType
}

export interface CrudModuleConfig {
  moduleKey: string
  title: string
  fields?: FieldConfig[]
  columnLabelMap?: ColumnLabelMap
  fieldTypeMap?: FieldTypeMap
  hiddenColumns?: string[]
  defaultPageSize?: number
}

/**
 * 表格列配置
 */
export interface TableColumnConfig {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  sortable?: boolean | string
  fixed?: boolean | 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  formatter?: (row: any, column: any, cellValue: any, index: number) => string
  slot?: string // 自定义插槽名称
  hidden?: boolean
}

/**
 * 搜索字段配置
 */
export interface SearchFieldConfig {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  width?: number | string
  options?: Array<{ label: string; value: unknown }>
  clearable?: boolean
  filterable?: boolean
  multiple?: boolean
  dateType?: 'date' | 'datetime' | 'daterange' | 'datetimerange'
}

/**
 * 表单字段配置
 */
export interface FormFieldConfig extends FieldConfig {
  rules?: Array<{
    required?: boolean
    message?: string
    trigger?: string | string[]
    min?: number
    max?: number
    pattern?: RegExp
    validator?: (rule: any, value: any, callback: Function) => void
  }>
  component?: string // 自定义组件名，如 'ImageUpload', 'RichTextEditor'
  componentProps?: Record<string, any> // 传递给自定义组件的额外属性
  span?: number // 在表单布局中占用的栅格数 (1-24)
  offset?: number // 栅格左侧的间隔格数
}

/**
 * API端点配置
 */
export interface ApiEndpoints {
  list?: string
  page?: string
  info?: (id: string | number) => string
  save?: string
  update?: string
  delete?: string
  batchDelete?: string
  export?: string
  import?: string
}

/**
 * CRUD页面完整配置
 */
export interface CrudPageConfig {
  moduleKey: string
  title: string
  apiEndpoints: ApiEndpoints
  columns: TableColumnConfig[]
  searchFields?: SearchFieldConfig[]
  formFields?: FormFieldConfig[]
  defaultSort?: { prop: string; order: 'asc' | 'desc' }
  defaultPageSize?: number
  enableSelection?: boolean // 是否启用行选择
  enablePagination?: boolean // 是否启用分页
  enableSearch?: boolean // 是否启用搜索
  enableCreate?: boolean // 是否启用新增
  enableUpdate?: boolean // 是否启用编辑
  enableDelete?: boolean // 是否启用删除
  enableBatchDelete?: boolean // 是否启用批量删除
  enableExport?: boolean // 是否启用导出
  enableImport?: boolean // 是否启用导入
  enableDetail?: boolean // 是否启用详情查看
  formDialogWidth?: string | number // 表单对话框宽度
  detailDialogWidth?: string | number // 详情对话框宽度
  tableHeight?: number | string // 表格高度
  customActions?: Array<{
    key: string
    label: string
    type?: 'primary' | 'success' | 'info' | 'warning' | 'danger'
    icon?: string
    handler?: (row?: any, selectedRows?: any[]) => void
  }>
}

