/**
 * 敏感数据脱敏工具
 * 用于在显示敏感信息时进行脱敏处理
 */

/**
 * 手机号脱敏
 * @param phone - 手机号
 * @param start - 保留前几位，默认3
 * @param end - 保留后几位，默认4
 * @returns 脱敏后的手机号，如：138****8888
 */
export function maskPhone(phone: string | null | undefined, start = 3, end = 4): string {
  if (!phone) return ''
  
  const str = String(phone).trim()
  if (str.length < start + end) return str
  
  const prefix = str.substring(0, start)
  const suffix = str.substring(str.length - end)
  const mask = '*'.repeat(str.length - start - end)
  
  return `${prefix}${mask}${suffix}`
}

/**
 * 身份证号脱敏
 * @param idCard - 身份证号
 * @param start - 保留前几位，默认3
 * @param end - 保留后几位，默认4
 * @returns 脱敏后的身份证号，如：110***********1234
 */
export function maskIdCard(idCard: string | null | undefined, start = 3, end = 4): string {
  if (!idCard) return ''
  
  const str = String(idCard).trim()
  if (str.length < start + end) return str
  
  const prefix = str.substring(0, start)
  const suffix = str.substring(str.length - end)
  const mask = '*'.repeat(str.length - start - end)
  
  return `${prefix}${mask}${suffix}`
}

/**
 * 银行卡号脱敏
 * @param cardNumber - 银行卡号
 * @param start - 保留前几位，默认4
 * @param end - 保留后几位，默认4
 * @returns 脱敏后的银行卡号，如：6222****1234
 */
export function maskBankCard(cardNumber: string | null | undefined, start = 4, end = 4): string {
  if (!cardNumber) return ''
  
  const str = String(cardNumber).trim().replace(/\s/g, '')
  if (str.length < start + end) return str
  
  const prefix = str.substring(0, start)
  const suffix = str.substring(str.length - end)
  const mask = '*'.repeat(str.length - start - end)
  
  return `${prefix}${mask}${suffix}`
}

/**
 * 邮箱脱敏
 * @param email - 邮箱地址
 * @param showDomain - 是否显示完整域名，默认true
 * @returns 脱敏后的邮箱，如：abc***@example.com
 */
export function maskEmail(email: string | null | undefined, showDomain = true): string {
  if (!email) return ''
  
  const str = String(email).trim()
  const atIndex = str.indexOf('@')
  
  if (atIndex === -1) {
    // 没有@符号，当作普通字符串处理
    if (str.length <= 2) return str
    return `${str[0]}***${str[str.length - 1]}`
  }
  
  const localPart = str.substring(0, atIndex)
  const domain = str.substring(atIndex)
  
  if (localPart.length <= 2) {
    return `${localPart}***${domain}`
  }
  
  const maskedLocal = `${localPart[0]}***${localPart[localPart.length - 1]}`
  
  if (showDomain) {
    return `${maskedLocal}${domain}`
  } else {
    return `${maskedLocal}@***`
  }
}

/**
 * 姓名脱敏
 * @param name - 姓名
 * @returns 脱敏后的姓名，如：张*、李**
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return ''
  
  const str = String(name).trim()
  if (str.length === 1) return str
  if (str.length === 2) return `${str[0]}*`
  
  // 3个字符及以上：保留第一个，其余用*替代
  return `${str[0]}${'*'.repeat(str.length - 1)}`
}

/**
 * 地址脱敏
 * @param address - 地址
 * @param keepLength - 保留前几位，默认6
 * @returns 脱敏后的地址
 */
export function maskAddress(address: string | null | undefined, keepLength = 6): string {
  if (!address) return ''
  
  const str = String(address).trim()
  if (str.length <= keepLength) return str
  
  const prefix = str.substring(0, keepLength)
  return `${prefix}***`
}

/**
 * 通用脱敏函数
 * @param value - 需要脱敏的值
 * @param type - 脱敏类型：'phone' | 'idCard' | 'bankCard' | 'email' | 'name' | 'address'
 * @returns 脱敏后的值
 */
export function maskSensitiveData(
  value: string | null | undefined,
  type: 'phone' | 'idCard' | 'bankCard' | 'email' | 'name' | 'address'
): string {
  if (!value) return ''
  
  switch (type) {
    case 'phone':
      return maskPhone(value)
    case 'idCard':
      return maskIdCard(value)
    case 'bankCard':
      return maskBankCard(value)
    case 'email':
      return maskEmail(value)
    case 'name':
      return maskName(value)
    case 'address':
      return maskAddress(value)
    default:
      return value
  }
}

