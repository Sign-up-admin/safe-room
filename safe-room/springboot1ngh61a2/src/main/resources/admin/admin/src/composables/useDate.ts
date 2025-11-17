/**
 * 日期工具组合式函数
 */
import { getCurDate, getCurDateTime } from '@/utils/utils'

/**
 * 使用日期工具的组合式函数
 */
export function useDate() {
  /**
   * 获取当前日期时间
   */
  function getCurrentDateTime(): string {
    return getCurDateTime()
  }

  /**
   * 获取当前日期
   */
  function getCurrentDate(): string {
    return getCurDate()
  }

  /**
   * 格式化日期
   */
  function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) {
      return ''
    }

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    const second = String(d.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hour)
      .replace('mm', minute)
      .replace('ss', second)
  }

  /**
   * 解析日期字符串
   */
  function parseDate(dateString: string): Date | null {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  }

  return {
    getCurrentDateTime,
    getCurrentDate,
    formatDate,
    parseDate,
  }
}

