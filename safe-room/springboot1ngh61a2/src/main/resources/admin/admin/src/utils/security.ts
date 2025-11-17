/**
 * XSS防护工具
 * 提供HTML清理、转义等功能，防止XSS攻击
 */
import DOMPurify from 'dompurify'

/**
 * 清理HTML内容，移除潜在的XSS攻击代码
 * @param html - 需要清理的HTML字符串
 * @param options - DOMPurify配置选项
 * @returns 清理后的安全HTML字符串
 */
export function sanitizeHtml(html: string, options?: any): string {
  if (!html) return ''

  // 默认配置：允许常见的HTML标签和属性，但移除脚本和事件处理器
  const defaultOptions: any = {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
      'a',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'div',
      'span',
      'hr',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target'],
    ALLOW_DATA_ATTR: false,
    ...options,
  }

  return String(DOMPurify.sanitize(html, defaultOptions))
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
    "'": '&#039;',
  }

  return str.replace(/[&<>"']/g, m => map[m] || m)
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
    /<style[^>]*>.*?<\/style>/gi,
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

/**
 * 递归清理对象中的所有字符串属性，防止XSS攻击
 * @param obj - 需要清理的对象
 * @param allowHtml - 是否允许HTML标签，默认false
 * @param maxDepth - 最大递归深度，防止循环引用，默认10
 * @returns 清理后的对象副本
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T, allowHtml = false, maxDepth = 10): T {
  if (!obj || typeof obj !== 'object' || maxDepth <= 0) {
    return obj
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'string') {
        return sanitizeInput(item, allowHtml)
      } else if (typeof item === 'object' && item !== null) {
        return sanitizeObject(item, allowHtml, maxDepth - 1)
      }
      return item
    }) as unknown as T
  }

  // 处理普通对象
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // 清理字符串值
      sanitized[key] = sanitizeInput(value, allowHtml)
    } else if (typeof value === 'object' && value !== null) {
      // 递归处理嵌套对象
      sanitized[key] = sanitizeObject(value, allowHtml, maxDepth - 1)
    } else {
      // 其他类型保持不变
      sanitized[key] = value
    }
  }

  return sanitized as T
}

/**
 * 深度清理表单数据，专门用于提交前的安全处理
 * @param formData - 表单数据对象
 * @returns 清理后的表单数据
 */
export function sanitizeFormData<T extends Record<string, any>>(formData: T): T {
  return sanitizeObject(formData, false) // 表单数据默认不允许HTML
}

/**
 * 清理富文本内容，允许安全的HTML标签
 * @param content - 富文本内容
 * @returns 清理后的安全HTML
 */
export function sanitizeRichContent(content: string): string {
  if (!content) return ''
  return sanitizeHtml(content, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
      'a',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'div',
      'span',
      'hr',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
  })
}
