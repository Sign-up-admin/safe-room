/**
 * XSS防护工具
 * 提供HTML清理、转义等功能，防止XSS攻击
 */
import DOMPurify from 'dompurify'

// 类型声明
declare global {
  namespace DOMPurify {
    interface Config {
      ALLOWED_TAGS?: string[]
      ALLOWED_ATTR?: string[]
      ALLOW_DATA_ATTR?: boolean
      [key: string]: any
    }
  }
}

/**
 * 清理HTML内容，移除潜在的XSS攻击代码
 * @param html - 需要清理的HTML字符串
 * @param options - DOMPurify配置选项
 * @returns 清理后的安全HTML字符串
 */
export function sanitizeHtml(html: string, options?: DOMPurify.Config): string {
  if (!html) return ''
  
  // 默认配置：允许常见的HTML标签和属性，但移除脚本和事件处理器
  const defaultOptions: DOMPurify.Config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span', 'hr'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target'],
    ALLOW_DATA_ATTR: false,
    ...options
  }
  
  return DOMPurify.sanitize(html, defaultOptions)
}

/**
 * 转义HTML特殊字符，防止XSS攻击
 * @param text - 需要转义的文本
 * @returns 转义后的安全文本
 */
export function escapeHtml(text: string | number | null | undefined): string {
  if (text == null) return ''
  
  const str = String(text)
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  return str.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * 移除HTML标签，只保留纯文本
 * @param html - 包含HTML标签的字符串
 * @returns 纯文本内容
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  
  // 先清理HTML，然后提取文本
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
  return clean.trim()
}

/**
 * 检测字符串是否包含潜在的XSS攻击代码
 * @param input - 需要检测的字符串
 * @returns 如果包含XSS代码返回true，否则返回false
 */
export function containsXss(input: string): boolean {
  if (!input) return false
  
  // 检测常见的XSS攻击模式
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // 事件处理器，如 onclick=
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi,
    /<style[^>]*>.*?<\/style>/gi
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

/**
 * 清理并验证用户输入
 * @param input - 用户输入
 * @param allowHtml - 是否允许HTML标签，默认false
 * @returns 清理后的安全字符串
 */
export function sanitizeInput(input: string, allowHtml = false): string {
  if (!input) return ''
  
  if (allowHtml) {
    return sanitizeHtml(input)
  } else {
    return escapeHtml(input)
  }
}

