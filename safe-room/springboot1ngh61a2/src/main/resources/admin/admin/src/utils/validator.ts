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
  return emailRegex.test(email.trim())
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

  // 转换为小写以进行不区分大小写的匹配
  const lowerInput = input.toLowerCase()

  // 1. 检测SQL关键词（必须是独立的单词）
  const sqlKeywords = /(\b(select|insert|update|delete|drop|create|alter|exec|execute|union|script)\b)/gi
  if (sqlKeywords.test(input)) {
    return true
  }

  // 2. 检测SQL注释符号
  const sqlComments = /(--|#|\/\*|\*\/)/g
  if (sqlComments.test(input)) {
    return true
  }

  // 3. 检测分号（在非URL和非路径的上下文中）
  if (input.includes(';') && !isValidUrlOrPath(input)) {
    return true
  }

  // 4. 检测OR/AND注入模式（不匹配正常文本中的"or"和"and"）
  const injectionPatterns = /(\b(or|and)\b\s+\d+\s*=\s*\d+)/gi
  if (injectionPatterns.test(lowerInput)) {
    return true
  }

  // 5. 检测单引号注入模式（多个单引号或单引号后跟分号）
  const singleQuoteInjection = /'{2,}|';\s*--|';\s*#|';\s*(drop|select|insert|update|delete)/gi
  if (singleQuoteInjection.test(lowerInput)) {
    return true
  }

  // 6. 检测双引号注入模式（双引号后跟分号和危险内容的组合）
  const doubleQuoteInjection = /";\s*(?:--|#|\/\*).*?(?:script|javascript|alert|eval|function)/gi
  if (doubleQuoteInjection.test(lowerInput)) {
    return true
  }

  // 7. 检测存储过程调用
  const storedProcedures = /(\b(xp_|sp_)\w+\b)/gi
  if (storedProcedures.test(lowerInput)) {
    return true
  }

  return false
}

/**
 * 检查字符串是否可能是有效的URL或文件路径
 */
function isValidUrlOrPath(input: string): boolean {
  // 检查是否是URL
  try {
    new URL(input)
    return true
  } catch {
    // 不是URL，继续检查
  }

  // 检查是否是文件路径（包含/或\且有扩展名）
  const pathPattern = /^[a-zA-Z]:[\\/]|^\.{1,2}[\\/]|[\\/]/
  if (pathPattern.test(input)) {
    return true
  }

  return false
}

/**
 * 检测XSS攻击模式
 * @param input - 用户输入
 * @returns 如果包含XSS模式返回true，否则返回false
 */
export function containsXss(input: string): boolean {
  if (!input) return false

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
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
