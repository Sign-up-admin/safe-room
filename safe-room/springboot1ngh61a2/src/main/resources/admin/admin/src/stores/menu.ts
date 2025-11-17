/**
 * 菜单状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuRole } from '@/types/menu'

interface MenuState {
  menuList: MenuRole[]
  dynamicMenuRoutes: MenuRole[]
}

/**
 * 菜单状态管理Store
 */
export const useMenuStore = defineStore('menu', () => {
  // 状态
  const menuList = ref<MenuRole[]>([])
  const dynamicMenuRoutes = ref<MenuRole[]>([])

  // 计算属性
  const hasMenuData = computed(() => menuList.value.length > 0)
  const hasDynamicRoutes = computed(() => dynamicMenuRoutes.value.length > 0)

  /**
   * 设置菜单列表
   */
  function setMenuList(menus: MenuRole[]) {
    menuList.value = menus
    // 持久化到sessionStorage
    try {
      sessionStorage.setItem('menuList', JSON.stringify(menus))
    } catch (error) {
      console.warn('Failed to save menuList to sessionStorage:', error)
    }
  }

  /**
   * 设置动态菜单路由
   */
  function setDynamicMenuRoutes(routes: MenuRole[]) {
    dynamicMenuRoutes.value = routes
    // 持久化到sessionStorage
    try {
      sessionStorage.setItem('dynamicMenuRoutes', JSON.stringify(routes))
    } catch (error) {
      console.warn('Failed to save dynamicMenuRoutes to sessionStorage:', error)
    }
  }

  /**
   * 初始化菜单数据（从sessionStorage恢复）
   */
  function initMenu() {
    try {
      const storedMenuList = sessionStorage.getItem('menuList')
      if (storedMenuList) {
        menuList.value = JSON.parse(storedMenuList)
      }

      const storedDynamicRoutes = sessionStorage.getItem('dynamicMenuRoutes')
      if (storedDynamicRoutes) {
        dynamicMenuRoutes.value = JSON.parse(storedDynamicRoutes)
      }
    } catch (error) {
      console.warn('Failed to restore menu data from sessionStorage:', error)
      // 如果解析失败，清空数据
      menuList.value = []
      dynamicMenuRoutes.value = []
    }
  }

  /**
   * 清除菜单数据
   */
  function clearMenu() {
    menuList.value = []
    dynamicMenuRoutes.value = []
    try {
      sessionStorage.removeItem('menuList')
      sessionStorage.removeItem('dynamicMenuRoutes')
    } catch (error) {
      console.warn('Failed to clear menu data from sessionStorage:', error)
    }
  }

  /**
   * 根据角色名称获取菜单
   */
  function getMenuByRole(roleName: string): MenuRole | undefined {
    return menuList.value.find(menu => menu.roleName === roleName)
  }

  /**
   * 获取所有后台菜单
   */
  function getAllBackMenus(): MenuItem[] {
    return menuList.value.flatMap(role => role.backMenu)
  }

  // 初始化
  initMenu()

  return {
    // 状态
    menuList,
    dynamicMenuRoutes,
    // 计算属性
    hasMenuData,
    hasDynamicRoutes,
    // 方法
    setMenuList,
    setDynamicMenuRoutes,
    initMenu,
    clearMenu,
    getMenuByRole,
    getAllBackMenus,
  }
})
