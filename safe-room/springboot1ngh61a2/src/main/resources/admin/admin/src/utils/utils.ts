import storage from './storage'
import menu from './menu'

/**
 * Check if user has permission for a specific action
 * @param tableName - The table/module name to check permissions for
 * @param key - The action key to check (e.g., 'Add', 'Update', 'Delete', 'View')
 * @returns true if user has permission, false otherwise
 */
export function isAuth(tableName: string, key: string): boolean {
  let role = storage.get('role')
  if (!role) {
    role = 'Administrator'
  }
  const menus = menu.list()
  for (let i = 0; i < menus.length; i++) {
    if (menus[i]?.roleName === role) {
      for (let j = 0; j < (menus[i]?.backMenu?.length || 0); j++) {
        for (let k = 0; k < (menus[i]?.backMenu?.[j]?.child?.length || 0); k++) {
          if (tableName === menus[i]?.backMenu?.[j]?.child?.[k]?.tableName) {
            const buttons = menus[i]?.backMenu?.[j]?.child?.[k]?.buttons?.join(',') || ''
            return buttons.indexOf(key) !== -1 || false
          }
        }
      }
    }
  }
  return false
}

/**
 * Get current date and time in format (yyyy-MM-dd hh:mm:ss)
 * @returns Formatted date-time string
 */
export function getCurDateTime(): string {
  const currentTime = new Date()
  const year = currentTime.getFullYear()
  const month =
    currentTime.getMonth() + 1 < 10 ? '0' + (currentTime.getMonth() + 1) : String(currentTime.getMonth() + 1)
  const day = currentTime.getDate() < 10 ? '0' + currentTime.getDate() : String(currentTime.getDate())
  const hour = currentTime.getHours() < 10 ? '0' + currentTime.getHours() : String(currentTime.getHours())
  const minute = currentTime.getMinutes() < 10 ? '0' + currentTime.getMinutes() : String(currentTime.getMinutes())
  const second = currentTime.getSeconds() < 10 ? '0' + currentTime.getSeconds() : String(currentTime.getSeconds())
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/**
 * Get current date in format (yyyy-MM-dd)
 * @returns Formatted date string
 */
export function getCurDate(): string {
  const currentTime = new Date()
  const year = currentTime.getFullYear()
  const month =
    currentTime.getMonth() + 1 < 10 ? '0' + (currentTime.getMonth() + 1) : String(currentTime.getMonth() + 1)
  const day = currentTime.getDate() < 10 ? '0' + currentTime.getDate() : String(currentTime.getDate())
  return `${year}-${month}-${day}`
}
