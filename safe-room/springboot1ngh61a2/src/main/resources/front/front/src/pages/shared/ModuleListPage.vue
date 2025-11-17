<template>
  <ModuleList
    ref="listRef"
    :module-key="moduleKey"
    @view="goDetail"
    @edit="goEdit"
    @delete="handleDelete"
    @selection-change="handleSelectionChange"
  >
    <template #header-actions>
      <div class="module-list-toolbar">
        <el-button type="primary" @click="goCreate">新增{{ config.name }}</el-button>
        <el-tag v-if="totalCount !== null" type="info" class="module-list-count">
          总数：{{ totalCount }}
        </el-tag>
        <el-button text type="primary" @click="refreshStats">统计</el-button>
        <template v-if="showAuditActions">
          <el-button
            :disabled="!selectedRows.length || shLoading"
            @click="handleBatchAudit('已通过')"
            :loading="shLoading && auditOperation === '已通过'"
          >
            批量通过
          </el-button>
          <el-button
            type="danger"
            plain
            :disabled="!selectedRows.length || shLoading"
            @click="handleBatchAudit('已拒绝')"
            :loading="shLoading && auditOperation === '已拒绝'"
          >
            批量拒绝
          </el-button>
        </template>
      </div>
    </template>
  </ModuleList>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ModuleList from '@/components/modules/ModuleList.vue'
import { getModuleService } from '@/services/crud'
import type { ModuleKey } from '@/types/modules'
import { moduleConfigs } from '@/config/modules'

const props = defineProps<{
  moduleKey: ModuleKey
  detailRoute: string
  formRoute: string
}>()

const router = useRouter()
const service = getModuleService(props.moduleKey)
const config = moduleConfigs[props.moduleKey]
const listRef = ref<InstanceType<typeof ModuleList> | null>(null)
const selectedRows = ref<Record<string, any>[]>([])
const shLoading = ref(false)
const auditOperation = ref<'已通过' | '已拒绝' | null>(null)
const totalCount = ref<number | null>(null)

const auditModules: ModuleKey[] = ['kechengyuyue', 'sijiaoyuyue', 'kechengtuike']
const showAuditActions = computed(() => auditModules.includes(props.moduleKey))

onMounted(() => {
  refreshStats()
})

function goCreate() {
  router.push(props.formRoute)
}

function goDetail(row: Record<string, any>) {
  router.push({ path: props.detailRoute, query: { id: row[config.primaryKey] } })
}

function goEdit(row: Record<string, any>) {
  router.push({ path: props.formRoute, query: { id: row[config.primaryKey] } })
}

async function handleDelete(row: Record<string, any>) {
  await ElMessageBox.confirm(`确认删除该${config.name}吗？`, '提示', { type: 'warning' })
  const id = row[config.primaryKey]
  if (id === undefined || id === null) return
  await service.remove([id as number])
  ElMessage.success('删除成功')
  listRef.value?.refresh()
}

function handleSelectionChange(rows: Record<string, any>[]) {
  selectedRows.value = rows
}

async function refreshStats() {
  try {
    const count = await service.fetchStats<number>('count')
    totalCount.value = count ?? 0
  } catch (error) {
    console.warn('统计数据获取失败', error)
  }
}

async function handleBatchAudit(status: '已通过' | '已拒绝') {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择需要审核的记录')
    return
  }
  const ids = selectedRows.value
    .map((row) => row[config.primaryKey])
    .filter((id): id is number | string => id !== undefined && id !== null)
  if (!ids.length) return
  const confirmMsg = `确认将选中的 ${ids.length} 条记录标记为「${status}」吗？`
  await ElMessageBox.confirm(confirmMsg, '批量审核', { type: 'warning' })
  shLoading.value = true
  auditOperation.value = status
  try {
    await service.shBatch(ids, status, status === '已拒绝' ? '前台审核' : undefined)
    ElMessage.success('批量审核已完成')
    selectedRows.value = []
    listRef.value?.refresh()
  } finally {
    shLoading.value = false
    auditOperation.value = null
  }
}
</script>

<style scoped>
.module-list-toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.module-list-count {
  align-self: center;
}
</style>


