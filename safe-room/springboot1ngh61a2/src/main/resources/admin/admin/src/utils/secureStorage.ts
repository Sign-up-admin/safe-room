/**
 * 安全存储工具类
 * 提供带过期时间检查的Token存储功能
 */

interface TokenData {
  token: string
  expiry: number
}

const TOKEN_KEY = 'secure_token'
const TOKEN_EXPIRY_HOURS = 24 // Token过期时间：24小时

/**
 * 设置Token到安全存储
 */
export function setToken(token: string): void {
  const expiry = Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000) // 24小时后过期
  const tokenData: TokenData = {
    token,
    expiry
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData))
}

/**
 * 从安全存储获取Token
 * 自动检查过期时间
 */
export function getToken(): string | null {
  try {
    const storedData = localStorage.getItem(TOKEN_KEY)
    if (!storedData) {
      return null
    }

    const tokenData: TokenData = JSON.parse(storedData)

    // 检查是否过期
    if (Date.now() > tokenData.expiry) {
      // Token已过期，清除存储
      clearToken()
      return null
    }

    return tokenData.token
  } catch (error) {
    // 解析失败，清除存储
    clearToken()
    return null
  }
}

/**
 * 清除Token
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 检查Token是否存在且未过期
 */
export function hasValidToken(): boolean {
  return !!getToken()
}

/**
 * 刷新Token过期时间
 */
export function refreshToken(): boolean {
  const token = getToken()
  if (token) {
    setToken(token)
    return true
  }
  return false
}

// 导出tokenStorage对象，保持与现有代码的兼容性
export const tokenStorage = {
  setToken,
  getToken,
  clearToken,
  hasValidToken,
  refreshToken
}
