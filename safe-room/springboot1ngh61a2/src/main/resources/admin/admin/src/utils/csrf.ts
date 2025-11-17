/**
 * CSRF Token工具
 * 用于生成和管理CSRF Token，防止跨站请求伪造攻击
 */

/**
 * 生成CSRF Token
 * @returns CSRF Token字符串
 */
export function generateCsrfToken(): string {
  // 生成随机字符串作为CSRF Token
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * 获取或生成CSRF Token
 * 如果sessionStorage中已存在，则返回；否则生成新的并存储
 * @returns CSRF Token
 */
export function getOrCreateCsrfToken(): string {
  const storageKey = 'csrf_token'

  // 尝试从sessionStorage获取
  let token = sessionStorage.getItem(storageKey)

  if (!token) {
    // 生成新Token并存储
    token = generateCsrfToken()
    sessionStorage.setItem(storageKey, token)
  }

  return token
}

/**
 * 获取CSRF Token（不自动创建）
 * @returns CSRF Token或null
 */
export function getCsrfToken(): string | null {
  return sessionStorage.getItem('csrf_token')
}

/**
 * 设置CSRF Token
 * @param token - CSRF Token
 */
export function setCsrfToken(token: string): void {
  sessionStorage.setItem('csrf_token', token)
}

/**
 * 清除CSRF Token
 */
export function clearCsrfToken(): void {
  sessionStorage.removeItem('csrf_token')
}

/**
 * 验证CSRF Token
 * @param token - 需要验证的Token
 * @returns 验证通过返回true，否则返回false
 */
export function validateCsrfToken(token: string | null | undefined): boolean {
  if (!token) return false

  const storedToken = getCsrfToken()
  return storedToken !== null && storedToken === token
}

/**
 * CSRF Token请求头名称
 */
export const CSRF_TOKEN_HEADER = 'X-CSRF-Token'
