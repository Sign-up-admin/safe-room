/**
 * 输入验证工具
 * 提供各种格式验证函数，防止非法输入
 */

/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 * @returns 验证通过返回true，否则返回false
 */
export function validateEmail(email: string): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const trimmed = email.trim()
  // Additional check for consecutive dots
  if (trimmed.includes('..')) return false
  return emailRegex.test(trimmed)
}

/**
 * 验证手机号格式（中国大陆）
 * @param phone - 手机号
 * @returns 验证通过返回true，否则返回false
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone.trim())
}

/**
 * 验证身份证号格式（中国大陆）
 * @param idCard - 身份证号
 * @returns 验证通过返回true，否则返回false
 */
export function validateIdCard(idCard: string): boolean {
  if (!idCard) return false
  // 15位或18位身份证号
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return idCardRegex.test(idCard.trim())
}

/**
 * 验证URL格式
 * @param url - URL地址
 * @returns 验证通过返回true，否则返回false
 */
export function validateUrl(url: string): boolean {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 检测SQL注入攻击模式（前端辅助检测）
 * @param input - 用户输入
 * @returns 如果包含SQL注入模式返回true，否则返回false
 */
export function containsSqlInjection(input: string): boolean {
  if (!input) return false

  // 常见的SQL注入关键词和模式
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /(--|#|\/\*|\*\/|;)/g, // SQL注释符号
    /(\bOR\b.*=.*=|\bAND\b.*=.*=)/gi, // OR 1=1, AND 1=1
    /('|('')|;|--|\*|xp_|sp_)/gi, // 特殊字符
  ]

  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * 检测XSS攻击模式
 * @param input - 用户输入
 * @returns 如果包含XSS模式返回true，否则返回false
 */
export function containsXss(input: string): boolean {
  if (!input) return false

  const xssPatterns = [
    /<script[^>]*>/gi, // Detect script tags (including incomplete ones)
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
  ]

  return xssPatterns.some(pattern => pattern.test(input))
}

/**
 * 验证文件扩展名是否在白名单中
 * @param filename - 文件名
 * @param allowedExtensions - 允许的扩展名列表（不包含点号）
 * @returns 验证通过返回true，否则返回false
 */
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  if (!filename || !allowedExtensions.length) return false

  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return false

  return allowedExtensions.map(e => e.toLowerCase()).includes(ext)
}

/**
 * 验证MIME类型是否在白名单中
 * @param mimeType - MIME类型
 * @param allowedMimeTypes - 允许的MIME类型列表
 * @returns 验证通过返回true，否则返回false
 */
export function validateMimeType(mimeType: string, allowedMimeTypes: string[]): boolean {
  if (!mimeType || !allowedMimeTypes.length) return false

  return allowedMimeTypes.map(m => m.toLowerCase()).includes(mimeType.toLowerCase())
}

/**
 * 验证文件大小
 * @param size - 文件大小（字节）
 * @param maxSize - 最大允许大小（字节）
 * @returns 验证通过返回true，否则返回false
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize
}

/**
 * 验证密码强度
 * @param password - 密码
 * @param minLength - 最小长度，默认8
 * @returns 验证通过返回true，否则返回false
 */
export function validatePasswordStrength(password: string, minLength = 8): boolean {
  if (!password || password.length < minLength) return false

  // 至少包含字母和数字
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)

  return hasLetter && hasNumber
}

/**
 * 验证用户名格式
 * @param username - 用户名
 * @param minLength - 最小长度，默认3
 * @param maxLength - 最大长度，默认20
 * @returns 验证通过返回true，否则返回false
 */
export function validateUsername(username: string, minLength = 3, maxLength = 20): boolean {
  if (!username) return false

  const trimmed = username.trim()
  if (trimmed.length < minLength || trimmed.length > maxLength) return false

  // 只允许字母、数字、下划线、中划线
  const usernameRegex = /^[a-zA-Z0-9_-]+$/
  return usernameRegex.test(trimmed)
}

/**
 * 综合验证用户输入，检测多种攻击模式
 * @param input - 用户输入
 * @returns 验证结果对象
 */
export function validateInput(input: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!input) {
    return { isValid: false, errors: ['输入不能为空'] }
  }

  if (containsSqlInjection(input)) {
    errors.push('输入包含非法字符，疑似SQL注入攻击')
  }

  if (containsXss(input)) {
    errors.push('输入包含非法字符，疑似XSS攻击')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
