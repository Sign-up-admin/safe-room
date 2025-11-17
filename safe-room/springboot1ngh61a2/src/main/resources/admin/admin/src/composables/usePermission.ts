/**
 * 权限检查组合式函数
 */
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { isAuth } from '@/utils/utils'

/**
 * 使用权限的组合式函数
 */
export function usePermission() {
  const userStore = useUserStore()

  /**
   * 检查是否有权限
   */
  function checkPermission(tableName: string, action: string): boolean {
    return isAuth(tableName, action)
  }

  /**
   * 检查是否有查看权限
   */
  function canView(tableName: string): boolean {
    return checkPermission(tableName, 'View')
  }

  /**
   * 检查是否有新增权限
   */
  function canCreate(tableName: string): boolean {
    return checkPermission(tableName, 'Add')
  }

  /**
   * 检查是否有编辑权限
   */
  function canUpdate(tableName: string): boolean {
    return checkPermission(tableName, 'Update')
  }

  /**
   * 检查是否有删除权限
   */
  function canDelete(tableName: string): boolean {
    return checkPermission(tableName, 'Delete')
  }

  /**
   * 获取权限对象
   */
  function getPermissions(tableName: string) {
    return {
      view: canView(tableName),
      create: canCreate(tableName),
      update: canUpdate(tableName),
      remove: canDelete(tableName),
    }
  }

  return {
    checkPermission,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    getPermissions,
    isAuthenticated: computed(() => userStore.isAuthenticated),
    userRole: computed(() => userStore.userRole),
  }
}
