/**
 * CRUD配置辅助函数
 * 提供配置化CRUD组件的辅助功能
 */
import type { TableColumnConfig, SearchFieldConfig, FormFieldConfig, ApiEndpoints } from '@/types/crud'
import { formatDate, formatDateTime, formatCurrency } from '@/utils/format'

/**
 * 创建表格列配置
 * @param columns 列配置数组
 * @returns Element Plus表格列配置
 */
export function createTableColumns(columns: TableColumnConfig[]) {
  return columns
    .filter(column => !column.hidden)
    .map(column => ({
      prop: column.prop,
      label: column.label,
      width: column.width,
      minWidth: column.minWidth,
      sortable: column.sortable,
      fixed: column.fixed,
      align: column.align || 'left',
      showOverflowTooltip: column.showOverflowTooltip !== false,
      formatter: column.formatter,
      // 如果有自定义插槽，使用插槽名称
      ...(column.slot ? { slot: column.slot } : {}),
    }))
}

/**
 * 创建搜索表单项
 * @param searchFields 搜索字段配置
 * @returns Element Plus表单项配置
 */
export function createSearchFormItems(searchFields: SearchFieldConfig[]) {
  return searchFields.map(field => ({
    prop: field.key,
    label: field.label,
    component: getSearchComponentType(field.type),
    componentProps: getSearchComponentProps(field),
    span: 6, // 默认占用6个栅格列
    clearable: field.clearable !== false,
    ...field,
  }))
}

/**
 * 创建表单字段配置
 * @param formFields 表单字段配置
 * @returns Element Plus表单项配置
 */
export function createFormItems(formFields: FormFieldConfig[]) {
  return formFields.map(field => ({
    prop: field.key,
    label: field.label,
    component: field.component || getFormComponentType(field.type),
    componentProps: {
      ...getFormComponentProps(field),
      ...(field.componentProps || {}),
    },
    rules: field.rules,
    span: field.span || 24,
    offset: field.offset || 0,
    required: field.required,
    hidden: field.hidden,
    readonly: field.readonly,
    placeholder: field.placeholder,
  }))
}

/**
 * 标准化API端点配置
 * @param endpoints API端点配置
 * @param moduleKey 模块键
 * @returns 标准化的API端点配置
 */
export function normalizeApiEndpoints(endpoints: Partial<ApiEndpoints>, moduleKey: string): ApiEndpoints {
  return {
    list: endpoints.list || `${moduleKey}/list`,
    page: endpoints.page || `${moduleKey}/page`,
    info: endpoints.info || ((id) => `${moduleKey}/info/${id}`),
    save: endpoints.save || `${moduleKey}/save`,
    update: endpoints.update || `${moduleKey}/update`,
    delete: endpoints.delete || `${moduleKey}/delete`,
    batchDelete: endpoints.batchDelete || `${moduleKey}/batchDelete`,
    export: endpoints.export || `${moduleKey}/export`,
    import: endpoints.import || `${moduleKey}/import`,
  }
}

/**
 * 获取搜索组件类型
 * @param fieldType 字段类型
 * @returns 组件名称
 */
function getSearchComponentType(fieldType: string): string {
  const typeMap: Record<string, string> = {
    text: 'el-input',
    number: 'el-input-number',
    date: 'el-date-picker',
    datetime: 'el-date-picker',
    select: 'el-select',
    boolean: 'el-select',
  }
  return typeMap[fieldType] || 'el-input'
}

/**
 * 获取搜索组件属性
 * @param field 字段配置
 * @returns 组件属性
 */
function getSearchComponentProps(field: SearchFieldConfig): Record<string, any> {
  const props: Record<string, any> = {
    placeholder: field.placeholder || `请输入${field.label}`,
    clearable: field.clearable !== false,
  }

  switch (field.type) {
    case 'number':
      props.controls = false
      break
    case 'date':
      props.type = field.dateType || 'date'
      props.format = 'YYYY-MM-DD'
      props.valueFormat = 'YYYY-MM-DD'
      break
    case 'datetime':
      props.type = field.dateType || 'datetime'
      props.format = 'YYYY-MM-DD HH:mm:ss'
      props.valueFormat = 'YYYY-MM-DD HH:mm:ss'
      break
    case 'daterange':
      props.type = 'daterange'
      props.rangeSeparator = '至'
      props.startPlaceholder = '开始日期'
      props.endPlaceholder = '结束日期'
      props.format = 'YYYY-MM-DD'
      props.valueFormat = 'YYYY-MM-DD'
      break
    case 'datetimerange':
      props.type = 'datetimerange'
      props.rangeSeparator = '至'
      props.startPlaceholder = '开始时间'
      props.endPlaceholder = '结束时间'
      props.format = 'YYYY-MM-DD HH:mm:ss'
      props.valueFormat = 'YYYY-MM-DD HH:mm:ss'
      break
    case 'select':
      if (field.multiple) {
        props.multiple = true
        props.collapseTags = true
        props.collapseTagsTooltip = true
      }
      props.filterable = field.filterable !== false
      props.placeholder = field.placeholder || `请选择${field.label}`
      break
    case 'boolean':
      props.placeholder = `请选择${field.label}`
      props.options = [
        { label: '是', value: true },
        { label: '否', value: false },
      ]
      break
  }

  return props
}

/**
 * 获取表单组件类型
 * @param fieldType 字段类型
 * @returns 组件名称
 */
function getFormComponentType(fieldType: string): string {
  const typeMap: Record<string, string> = {
    text: 'el-input',
    textarea: 'el-input',
    number: 'el-input-number',
    date: 'el-date-picker',
    datetime: 'el-date-picker',
    select: 'el-select',
    boolean: 'el-switch',
    image: 'ImageUpload',
    file: 'el-upload',
    richtext: 'RichTextEditor',
    password: 'el-input',
  }
  return typeMap[fieldType] || 'el-input'
}

/**
 * 获取表单组件属性
 * @param field 字段配置
 * @returns 组件属性
 */
function getFormComponentProps(field: FormFieldConfig): Record<string, any> {
  const props: Record<string, any> = {
    placeholder: field.placeholder || `请输入${field.label}`,
  }

  switch (field.type) {
    case 'text':
      props.maxlength = 200
      props.showWordLimit = true
      break
    case 'textarea':
      props.type = 'textarea'
      props.rows = field.rows || 4
      props.maxlength = 1000
      props.showWordLimit = true
      break
    case 'number':
      props.controls = false
      if (field.rules) {
        const minRule = field.rules.find(r => r.min !== undefined)
        const maxRule = field.rules.find(r => r.max !== undefined)
        if (minRule) props.min = minRule.min
        if (maxRule) props.max = maxRule.max
      }
      break
    case 'date':
      props.type = 'date'
      props.format = 'YYYY-MM-DD'
      props.valueFormat = 'YYYY-MM-DD'
      break
    case 'datetime':
      props.type = 'datetime'
      props.format = 'YYYY-MM-DD HH:mm:ss'
      props.valueFormat = 'YYYY-MM-DD HH:mm:ss'
      break
    case 'select':
      props.filterable = true
      props.placeholder = field.placeholder || `请选择${field.label}`
      break
    case 'boolean':
      props.activeText = '是'
      props.inactiveText = '否'
      break
    case 'password':
      props.type = 'password'
      props.showPassword = true
      break
    case 'richtext':
      props.minHeight = '200px'
      props.maxHeight = '400px'
      break
  }

  return props
}

/**
 * 格式化字段值显示
 * @param value 字段值
 * @param fieldType 字段类型
 * @returns 格式化后的显示值
 */
export function formatFieldValue(value: any, fieldType: string): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  switch (fieldType) {
    case 'date':
      return formatDate(value)
    case 'datetime':
      return formatDateTime(value)
    case 'boolean':
      return value ? '是' : '否'
    case 'number':
      return typeof value === 'number' ? value.toString() : value
    case 'currency':
      return formatCurrency(value)
    default:
      return String(value)
  }
}

/**
 * 获取默认表格操作列配置
 * @param permissions 权限配置
 * @returns 操作列配置
 */
export function getDefaultActionColumn(permissions: {
  view?: boolean
  update?: boolean
  remove?: boolean
}): TableColumnConfig {
  return {
    prop: 'actions',
    label: '操作',
    width: 200,
    fixed: 'right',
    align: 'center',
    slot: 'actions',
  }
}

/**
 * 获取默认表格序号列配置
 * @returns 序号列配置
 */
export function getDefaultIndexColumn(): TableColumnConfig {
  return {
    prop: 'index',
    label: '#',
    width: 60,
    align: 'center',
    formatter: (_row: any, _column: any, _cellValue: any, index: number) => index + 1,
  }
}
