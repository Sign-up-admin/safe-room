/**
 * 详情查看组合式函数
 * 提供通用的详情查看功能
 */
import { ref, computed, type Ref } from 'vue'

/**
 * 详情查看组合式函数
 */
export function useDetail<T = Record<string, any>>() {
  const detailVisible = ref(false)
  const detailRecord = ref<T | null>(null) as Ref<T | null>

  // 详情标题
  const detailTitle = computed(() => (detailRecord.value ? '详情' : '记录详情'))

  // 格式化的详情数据
  const formattedDetail = computed(() => {
    if (!detailRecord.value) return '暂无数据'
    return JSON.stringify(detailRecord.value, null, 2)
  })

  // 查看详情
  const viewRow = (row: T) => {
    detailRecord.value = row
    detailVisible.value = true
  }

  // 关闭详情
  const closeDetail = () => {
    detailVisible.value = false
    detailRecord.value = null
  }

  return {
    detailVisible,
    detailRecord,
    detailTitle,
    formattedDetail,
    viewRow,
    closeDetail,
  }
}

