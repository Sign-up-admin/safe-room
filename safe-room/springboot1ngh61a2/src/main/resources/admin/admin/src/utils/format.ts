/**
 * 格式化工具函数
 */
import { getCurDate, getCurDateTime } from './utils'

/**
 * 格式化日期
 */
export function formatDate(date: string | Date | null | undefined, format = 'YYYY-MM-DD'): string {
  if (!date) return '-'
  if (typeof date === 'string') {
    return date || '-'
  }
  // 可以扩展更多格式化逻辑
  return getCurDate()
}

/**
 * 格式化日期时间
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  format = 'YYYY-MM-DD HH:mm:ss'
): string {
  if (!date) return '-'
  if (typeof date === 'string') {
    return date || '-'
  }
  return getCurDateTime()
}

/**
 * 格式化数字
 */
export function formatNumber(value: number | string | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || value === '') return '-'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '-'
  return num.toFixed(decimals)
}

/**
 * 格式化货币
 */
export function formatCurrency(value: number | string | null | undefined, symbol = '¥'): string {
  if (value === null || value === undefined || value === '') return '-'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '-'
  return `${symbol}${num.toFixed(2)}`
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number | string | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || value === '') return '-'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '-'
  return `${(num * 100).toFixed(decimals)}%`
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number | string | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes === '') return '-'
  const size = typeof bytes === 'string' ? parseFloat(bytes) : bytes
  if (isNaN(size) || size < 0) return '-'
  if (size === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(size) / Math.log(k))
  return `${parseFloat((size / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化布尔值
 */
export function formatBoolean(value: boolean | number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  if (typeof value === 'number') {
    return value === 1 || value > 0 ? '是' : '否'
  }
  if (typeof value === 'string') {
    const lower = value.toLowerCase()
    return lower === 'true' || lower === '1' || lower === 'yes' ? '是' : '否'
  }
  return '-'
}

/**
 * 格式化状态
 */
export function formatStatus(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-'
  const status = typeof value === 'string' ? parseInt(value) : value
  if (isNaN(status)) return '-'
  return status === 1 ? '启用' : '禁用'
}

/**
 * 截断文本
 */
export function truncateText(text: string | null | undefined, maxLength = 50, suffix = '...'): string {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

/**
 * 移除HTML标签
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

