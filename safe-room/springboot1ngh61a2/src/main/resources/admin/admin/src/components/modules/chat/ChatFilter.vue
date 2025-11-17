<template>
  <div class="filter-section">
    <ElForm :model="filterForm" inline>
      <ElFormItem label="回复状态">
        <ElSelect v-model="filterForm.isreply" placeholder="请选择回复状态" clearable style="width: 150px">
          <ElOption label="全部" :value="null" />
          <ElOption label="未回复" :value="0" />
          <ElOption label="已回复" :value="1" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="留言内容">
        <ElInput v-model="filterForm.ask" placeholder="请输入留言内容关键词" clearable style="width: 200px" />
      </ElFormItem>
      <ElFormItem>
        <ElButton type="primary" @click="handleSearch">查询</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts" name="ChatFilter">
import { ElForm, ElFormItem, ElSelect, ElOption, ElInput, ElButton } from 'element-plus'

interface FilterForm {
  isreply: number | null
  ask: string
}

interface Props {
  modelValue: FilterForm
}

interface Emits {
  (e: 'update:modelValue', value: FilterForm): void
  (e: 'search'): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const filterForm = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  emit('reset')
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.filter-section {
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}
</style>
