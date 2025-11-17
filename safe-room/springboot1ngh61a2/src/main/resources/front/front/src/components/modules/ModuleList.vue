<template>
  <div class="module-list">
    <el-card v-if="searchFields.length" class="mb-16">
      <template #header>查询条件</template>
      <el-form :model="searchForm" label-width="100px" class="search-form">
        <el-row :gutter="16">
          <el-col v-for="field in searchFields" :key="field.prop" :span="12">
            <el-form-item :label="field.label">
              <component :is="getSearchComponent(field)" v-bind="getSearchComponentProps(field)">
                <template v-if="field.type === 'select'" #default>
                  <el-option
                    v-for="option in field.options || []"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </template>
              </component>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="actions">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <div class="list-header">
          <h2>{{ config.name }}列表</h2>
          <div class="header-actions">
            <slot name="header-actions">
              <el-button type="primary" @click="$emit('create')">新增{{ config.name }}</el-button>
            </slot>
          </div>
        </div>
      </template>

      <el-table
        :data="records"
        :loading="loading"
        border
        style="width: 100%"
        :row-key="config.primaryKey"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column type="index" width="60" label="#" />
        <el-table-column
          v-for="field in tableFields"
          :key="field.prop"
          :prop="field.prop"
          :label="field.label"
          min-width="140"
        >
          <template #default="{ row }">
            <div v-if="field.type === 'image'">
              <el-image
                v-if="row[field.prop]"
                :src="row[field.prop]"
                :preview-src-list="[row[field.prop]]"
                fit="cover"
                class="thumb"
              />
              <span v-else>--</span>
            </div>
            <span v-else>{{ formatFieldValue(field, row[field.prop]) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="{ row }">
            <slot name="row-actions" :row="row">
              <el-button size="small" text type="primary" @click="$emit('view', row)">详情</el-button>
              <el-button size="small" text @click="$emit('edit', row)">编辑</el-button>
              <el-button size="small" text type="danger" @click="$emit('delete', row)">删除</el-button>
            </slot>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pagination.limit"
          :total="pagination.total"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ModuleKey } from '@/types/modules'
import type { FieldConfig } from '@/config/modules'
import { useModuleList } from '@/composables/useModuleCrud'
import { formatCurrency, formatDate, formatDateTime, stripHtml } from '@/utils/formatters'

interface Emits {
  (e: 'create'): void
  (e: 'view', row: Record<string, any>): void
  (e: 'edit', row: Record<string, any>): void
  (e: 'delete', row: Record<string, any>): void
  (e: 'selection-change', rows: Record<string, any>[]): void
}

const props = defineProps<{
  moduleKey: ModuleKey
}>()

const emit = defineEmits<Emits>()

const {
  config,
  loading,
  records,
  pagination,
  searchForm,
  fetchList,
  handleSearch,
  resetSearch,
  handlePageChange,
  handlePageSizeChange,
} = useModuleList(props.moduleKey)

const tableFields = computed(() => config.fields.filter(field => field.showInTable))
const searchFields = computed(() => config.fields.filter(field => field.showInSearch))

function formatFieldValue(field: FieldConfig, value: any) {
  if (value === undefined || value === null || value === '') {
    return '--'
  }
  if (field.options) {
    const match = field.options.find(option => option.value === value)
    if (match) return match.label
  }
  switch (field.type) {
    case 'date':
      return formatDate(value)
    case 'datetime':
      return formatDateTime(value)
    case 'number':
      return formatCurrency(value, '')
    case 'richtext':
      return stripHtml(value)
    default:
      return value
  }
}

function getSearchComponent(field: FieldConfig) {
  if (field.type === 'select') return 'el-select'
  if (field.type === 'date' || field.type === 'datetime') return 'el-date-picker'
  if (field.type === 'number') return 'el-input-number'
  return 'el-input'
}

function getSearchComponentProps(field: FieldConfig) {
  const common = {
    modelValue: searchForm[field.prop],
    'onUpdate:modelValue': (val: any) => (searchForm[field.prop] = val),
    placeholder: field.placeholder || `请输入${field.label}`,
    clearable: true,
  }
  if (field.type === 'select') {
    return { ...common, filterable: true }
  }
  if (field.type === 'date' || field.type === 'datetime') {
    return {
      ...common,
      type: field.type,
      'value-format': field.type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss',
    }
  }
  if (field.type === 'number') {
    return { ...common, controls: false }
  }
  return common
}

function handleSelectionChange(rows: Record<string, any>[]) {
  emit('selection-change', rows)
}

defineExpose({
  refresh: fetchList,
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.module-list {
  display: flex;
  flex-direction: column;
  gap: 18px;

  :deep(.el-card) {
    @include glass-card();
  }

  :deep(.el-card__header) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(255, 255, 255, 0.02);
  }

  :deep(.el-form) {
    @include form-field-dark;
  }

  :deep(.el-table) {
    background: transparent;
    color: $color-text-primary;

    .el-table__header {
      background: rgba(255, 255, 255, 0.02);
    }

    .el-table__body {
      tr {
        background: transparent;
        transition: background-color $transition-base;

        &:hover {
          background: rgba(255, 255, 255, 0.03);
        }
      }
    }

    .el-table__border {
      border-color: rgba(255, 255, 255, 0.08);
    }
  }

  :deep(.el-pagination) {
    .el-pagination__total,
    .el-pager li,
    .btn-prev,
    .btn-next {
      color: $color-text-secondary;
    }

    .el-pager li.is-active {
      color: $color-yellow;
    }
  }
}

.mb-16 {
  margin-bottom: 16px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: $color-text-secondary;

  h2 {
    margin: 0;
    color: $color-text-primary;
    letter-spacing: 0.12em;
  }
}

.header-actions {
  display: flex;
  gap: 8px;
}

.search-form .actions {
  margin-top: 16px;
}

.thumb {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

@media (max-width: 768px) {
  .module-list {
    :deep(.el-card__body) {
      padding: 12px;
    }

    :deep(.el-table) {
      font-size: 0.85rem;

      .el-table__cell {
        padding: 8px 4px;
      }
    }

    .list-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .header-actions {
      width: 100%;
      flex-wrap: wrap;
    }

    .pagination {
      :deep(.el-pagination) {
        .el-pagination__sizes,
        .el-pagination__jump {
          display: none;
        }
      }
    }
  }
}
</style>
