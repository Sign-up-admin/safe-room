<template>
  <el-card v-loading="loading">
    <template #header>
      <div class="detail-header">
        <h2>{{ config.name }}详情</h2>
        <el-button @click="$emit('back')">返回列表</el-button>
      </div>
    </template>

    <el-descriptions v-if="record" :column="2" border>
      <el-descriptions-item v-for="field in config.fields" :key="field.prop" :label="field.label">
        <template v-if="field.type === 'image'">
          <el-image
            v-if="record[field.prop]"
            :src="record[field.prop]"
            :preview-src-list="[record[field.prop]]"
            fit="cover"
            class="detail-thumb"
          />
          <span v-else>--</span>
        </template>
        <template v-else-if="field.type === 'richtext'">
          <SafeHtml :html="record[field.prop]" />
        </template>
        <template v-else>
          {{ formatFieldValue(field, record[field.prop]) }}
        </template>
      </el-descriptions-item>
    </el-descriptions>

    <el-empty v-else description="暂无数据" />
  </el-card>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useModuleDetail } from '@/composables/useModuleCrud'
import type { ModuleKey } from '@/types/modules'
import type { FieldConfig } from '@/config/modules'
import { moduleConfigs } from '@/config/modules'
import { formatCurrency, formatDate, formatDateTime, stripHtml } from '@/utils/formatters'
import SafeHtml from '@/components/common/SafeHtml.vue'

interface Emits {
  (e: 'back'): void
}

const props = defineProps<{
  moduleKey: ModuleKey
  id?: number | string
  prefetched?: Record<string, any> | null
}>()

defineEmits<Emits>()

const config = moduleConfigs[props.moduleKey]
const { record, loading, fetchDetail } = useModuleDetail(props.moduleKey)

watch(
  () => props.id,
  value => {
    if (value !== undefined && value !== null) {
      fetchDetail(value)
    }
  },
  { immediate: true },
)

watch(
  () => props.prefetched,
  value => {
    if (value) {
      record.value = value as any
    }
  },
  { immediate: true },
)

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
      return formatCurrency(value)
    case 'richtext':
      // richtext类型使用SafeHtml组件渲染，这里返回原始值
      return value
    default:
      return value
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

:deep(.el-card) {
  @include glass-card();
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;

  h2 {
    margin: 0;
    letter-spacing: 0.2em;
    color: $color-text-primary;
  }
}

.detail-thumb {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

:deep(.el-descriptions) {
  background: transparent;
  color: $color-text-secondary;
}

:deep(.el-descriptions__body) {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.08);
}

:deep(.el-descriptions__table .el-descriptions__label) {
  width: 30%;
  color: $color-text-secondary;
  background: rgba(255, 255, 255, 0.03);
}

:deep(.el-descriptions__table .el-descriptions__content) {
  color: $color-text-primary;
}

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  :deep(.el-descriptions) {
    .el-descriptions__table {
      .el-descriptions__label {
        width: 35%;
        font-size: 0.85rem;
      }

      .el-descriptions__content {
        font-size: 0.85rem;
      }
    }
  }
}
</style>
