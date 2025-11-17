<template>
  <el-card class="filter-card" shadow="never">
    <el-form :model="filterForm" label-width="70px" inline>
      <el-form-item label="关键词">
        <el-input v-model="filterForm.keyword" placeholder="名称/标签" clearable />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="filterForm.assetType" placeholder="全部" clearable>
          <el-option
            v-for="item in assetTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="模块">
        <el-select v-model="filterForm.module" placeholder="全部" clearable filterable>
          <el-option
            v-for="item in moduleOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用途">
        <el-select v-model="filterForm.usage" placeholder="全部" clearable filterable>
          <el-option
            v-for="item in usageOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="filterForm.status" placeholder="全部" clearable>
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="时间">
        <el-date-picker
          v-model="filterForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <div class="filter-actions">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FilterForm {
  keyword: string
  assetType: string
  module: string
  usage: string
  status: string
  dateRange: string[] | ''
}

interface OptionItem {
  label: string
  value: string
}

interface Props {
  modelValue: FilterForm
  assetTypeOptions: OptionItem[]
  moduleOptions: string[]
  usageOptions: string[]
  statusOptions: OptionItem[]
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
.filter-card {
  margin-bottom: 24px;
}

.filter-actions {
  display: flex;
  gap: 12px;
}
</style>
