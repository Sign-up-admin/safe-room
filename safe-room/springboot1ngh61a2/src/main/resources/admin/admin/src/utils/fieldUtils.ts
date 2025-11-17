/**
 * 字段工具函数
 */
import { COLUMN_LABEL_MAP, FIELD_TYPE_MAP, DEFAULT_HIDDEN_COLUMNS } from '@/constants/fieldMaps'
import type { FieldType } from '@/types/crud'
import base from '@/utils/base'

/**
 * 获取字段标签
 */
export function getColumnLabel(column: string, customMap?: Record<string, string>): string {
  const map = customMap || COLUMN_LABEL_MAP
  return map[column] || column
}

/**
 * 获取字段类型
 */
export function getFieldType(column: string, customMap?: Record<string, FieldType>): FieldType {
  const map = customMap || FIELD_TYPE_MAP
  return (map[column] || 'text') as FieldType
}

/**
 * 获取图片URL
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const baseConfig = base.get()
  const baseUrl = baseConfig.url || 'http://localhost:8080/springboot1ngh61a2/'
  if (url.startsWith('upload/')) {
    return baseUrl + url
  }
  return baseUrl + 'upload/' + url
}

/**
 * 格式化单元格值
 */
export function formatCellValue(value: any, column: string, customTypeMap?: Record<string, FieldType>): string {
  if (value === null || value === undefined) return '-'
  
  const fieldType = getFieldType(column, customTypeMap)
  
  if (fieldType === 'datetime' || fieldType === 'date') {
    return value || '-'
  }
  
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  
  if (typeof value === 'number' && column === 'status') {
    return value === 1 ? '启用' : '禁用'
  }
  
  // 图片字段显示预览
  if (fieldType === 'image' && value) {
    return '[图片]'
  }
  
  // 富文本字段显示摘要
  if (fieldType === 'richtext' && value) {
    const text = String(value).replace(/<[^>]*>/g, '').trim()
    return text.length > 50 ? text.substring(0, 50) + '...' : text || '-'
  }
  
  return String(value)
}

/**
 * 获取显示列（排除隐藏列）
 */
export function getDisplayColumns(
  sample: Record<string, any> | null | undefined,
  hiddenColumns: string[] = DEFAULT_HIDDEN_COLUMNS,
  maxColumns?: number,
): string[] {
  if (!sample) return []
  
  const columns = Object.keys(sample).filter((key) => !hiddenColumns.includes(key))
  
  if (maxColumns) {
    return columns.slice(0, maxColumns)
  }
  
  return columns
}

/**
 * 生成表单验证规则
 */
export function generateFormRules(
  columns: string[],
  customLabelMap?: Record<string, string>,
  requiredColumns?: string[],
): Record<string, any[]> {
  const rules: Record<string, any[]> = {}
  const labelMap = customLabelMap || COLUMN_LABEL_MAP
  
  columns.forEach((column) => {
    if (column !== 'id') {
      const isRequired = !requiredColumns || requiredColumns.includes(column)
      if (isRequired) {
        rules[column] = [
          {
            required: true,
            message: `请输入${getColumnLabel(column, labelMap)}`,
            trigger: 'blur',
          },
        ]
      }
    }
  })
  
  return rules
}

