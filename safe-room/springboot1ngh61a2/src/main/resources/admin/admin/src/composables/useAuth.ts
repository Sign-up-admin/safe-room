import { computed } from 'vue'
import { isAuth as checkAuth } from '@/utils/utils'

/**
 * 权限检查组合式函数
 * @param moduleKey 模块键名
 * @returns 权限对象
 */
export function useAuth(moduleKey: string) {
  const permissions = computed(() => ({
    create: checkAuth(moduleKey, 'Add'),
    update: checkAuth(moduleKey, 'Edit'),
    remove: checkAuth(moduleKey, 'Delete'),
    view: checkAuth(moduleKey, 'View'),
    export: checkAuth(moduleKey, 'Export'),
  }))

  const hasOperations = computed(
    () => permissions.value.view || permissions.value.update || permissions.value.remove
  )

  return {
    permissions,
    hasOperations,
  }
}

