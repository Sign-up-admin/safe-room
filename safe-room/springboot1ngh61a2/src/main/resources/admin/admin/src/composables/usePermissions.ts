import { computed } from 'vue'
import { isAuth } from '@/utils/utils'

export interface PermissionOptions {
  moduleKey: string
}

/**
 * 权限组合式函数
 * 提供权限检查功能
 */
export function usePermissions(options: PermissionOptions) {
  const { moduleKey } = options

  const permissions = computed(() => ({
    create: isAuth(moduleKey, 'Add'),
    update: isAuth(moduleKey, 'Edit'),
    remove: isAuth(moduleKey, 'Delete'),
    view: isAuth(moduleKey, 'View'),
    export: isAuth(moduleKey, 'Export'),
  }))

  // 是否有操作权限
  const hasOperations = computed(
    () => permissions.value.view || permissions.value.update || permissions.value.remove,
  )

  // 检查单个权限
  function checkPermission(action: 'create' | 'update' | 'remove' | 'view' | 'export'): boolean {
    return permissions.value[action]
  }

  return {
    permissions,
    hasOperations,
    checkPermission,
  }
}

