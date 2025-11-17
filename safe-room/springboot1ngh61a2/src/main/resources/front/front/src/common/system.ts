import menu from '@/config/menu'

export function isAuth(tableName: string, key: string): boolean {
  let role = localStorage.getItem('UserTableName')
  if (!role) {
    role = 'users'
  }
  const menus = menu.list()
  for (let i = 0; i < menus.length; i++) {
    if (menus[i].tableName === role) {
      for (let j = 0; j < menus[i].frontMenu.length; j++) {
        for (let k = 0; k < menus[i].frontMenu[j].child.length; k++) {
          if (tableName === menus[i].frontMenu[j].child[k].tableName) {
            const buttons = menus[i].frontMenu[j].child[k].buttons.join(',')
            return buttons.indexOf(key) !== -1 || false
          }
        }
      }
    }
  }
  return false
}

export function isBackAuth(tableName: string, key: string): boolean {
  const role = localStorage.getItem('UserTableName')
  const menus = menu.list()
  for (let i = 0; i < menus.length; i++) {
    if (menus[i].tableName === role) {
      for (let j = 0; j < menus[i].backMenu.length; j++) {
        for (let k = 0; k < menus[i].backMenu[j].child.length; k++) {
          if (tableName === menus[i].backMenu[j].child[k].tableName) {
            const buttons = menus[i].backMenu[j].child[k].buttons.join(',')
            return buttons.indexOf(key) !== -1 || false
          }
        }
      }
    }
  }
  return false
}

/**
 * 获取当前时间（yyyy-MM-dd hh:mm:ss）
 */
export function getCurDateTime(): string {
  const currentTime = new Date()
  const year = currentTime.getFullYear()
  const month =
    currentTime.getMonth() + 1 < 10
      ? '0' + (currentTime.getMonth() + 1)
      : String(currentTime.getMonth() + 1)
  const day =
    currentTime.getDate() < 10
      ? '0' + currentTime.getDate()
      : String(currentTime.getDate())
  const hour = currentTime.getHours()
  const minute = currentTime.getMinutes()
  const second = currentTime.getSeconds()
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/**
 * 获取当前日期（yyyy-MM-dd）
 */
export function getCurDate(): string {
  const currentTime = new Date()
  const year = currentTime.getFullYear()
  const month =
    currentTime.getMonth() + 1 < 10
      ? '0' + (currentTime.getMonth() + 1)
      : String(currentTime.getMonth() + 1)
  const day =
    currentTime.getDate() < 10
      ? '0' + currentTime.getDate()
      : String(currentTime.getDate())
  return `${year}-${month}-${day}`
}

