<template>
  <div class="batch-operation-bar">
    <ElButton
      type="danger"
      plain
      :disabled="!hasSelection"
      :loading="loading && currentOperation === 'delete'"
      @click="handleBatchDelete"
    >
      批量删除
    </ElButton>
    <ElButton
      plain
      :disabled="!hasSelection"
      :loading="loading && currentOperation === 'enable'"
      @click="handleBatchEnable"
    >
      批量启用
    </ElButton>
    <ElButton
      plain
      :disabled="!hasSelection"
      :loading="loading && currentOperation === 'disable'"
      @click="handleBatchDisable"
    >
      批量停用
    </ElButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElButton } from 'element-plus'

interface Props {
  selectedRows: Array<Record<string, any>>
  loading?: boolean
  currentOperation?: 'delete' | 'enable' | 'disable' | null
}

interface Emits {
  (e: 'batch-delete', rows: Array<Record<string, any>>): void
  (e: 'batch-enable', rows: Array<Record<string, any>>): void
  (e: 'batch-disable', rows: Array<Record<string, any>>): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  currentOperation: null,
})

const emit = defineEmits<Emits>()

const hasSelection = computed(() => props.selectedRows && props.selectedRows.length > 0)

const handleBatchDelete = () => {
  if (hasSelection.value) {
    emit('batch-delete', props.selectedRows)
  }
}

const handleBatchEnable = () => {
  if (hasSelection.value) {
    emit('batch-enable', props.selectedRows)
  }
}

const handleBatchDisable = () => {
  if (hasSelection.value) {
    emit('batch-disable', props.selectedRows)
  }
}
</script>

<style scoped lang="scss">
.batch-operation-bar {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
