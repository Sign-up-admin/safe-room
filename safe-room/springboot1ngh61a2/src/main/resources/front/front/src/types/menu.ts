export interface MenuChild {
  allButtons: string[]
  appFrontIcon: string
  buttons: string[]
  menu: string
  menuJump?: string
  tableName: string
}

export interface MenuItem {
  child: MenuChild[]
  menu: string
}

export interface MenuRole {
  backMenu: MenuItem[]
  frontMenu?: MenuItem[]
  hasBackLogin: string
  hasBackRegister: string
  hasFrontLogin: string
  hasFrontRegister: string
  roleName: string
  tableName: string
}
