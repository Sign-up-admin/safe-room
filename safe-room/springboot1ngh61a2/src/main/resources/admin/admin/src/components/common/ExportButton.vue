<template>
  <el-button
    plain
    :disabled="disabled || !hasData"
    @click="handleExport"
  >
    导出索引
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

interface ExportColumn {
  key: string
  label: string
}

interface Props {
  data: Array<Record<string, any>>
  filename?: string
  columns?: ExportColumn[]
  disabled?: boolean
}

interface Emits {
  (e: 'export', data: Array<Record<string, any>>): void
}

const props = withDefaults(defineProps<Props>(), {
  filename: '',
  disabled: false,
})

const emit = defineEmits<Emits>()

// Default columns for assets export
const defaultColumns: ExportColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'assetName', label: '名称' },
  { key: 'assetType', label: '类型' },
  { key: 'module', label: '模块' },
  { key: 'usage', label: '用途' },
  { key: 'version', label: '版本' },
  { key: 'status', label: '状态' },
  { key: 'filePath', label: '路径' },
  { key: 'tags', label: '标签' },
]

const hasData = computed(() => props.data && props.data.length > 0)

const columns = computed(() => props.columns || defaultColumns)

const handleExport = () => {
  if (!hasData.value) {
    ElMessage.warning('请选择需要导出的数据')
    return
  }

  try {
    const headers = columns.value.map(col => col.label)
    const lines = props.data.map(item =>
      columns.value.map(col => toCsvValue(item[col.key]))
    )

    const csvContent = [headers, ...lines]
      .map(row => row.join(','))
      .join('\n')

    // Add UTF-8 BOM for proper Chinese character support
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const filename = props.filename || `assets_${Date.now()}.csv`
    link.download = filename

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('已导出数据')
    emit('export', props.data)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// Helper function to properly format CSV values
const toCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) return '""'
  const str = String(value).replace(/"/g, '""')
  // If the string contains commas, newlines, or quotes, wrap in quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str}"`
  }
  return str
}
</script>
