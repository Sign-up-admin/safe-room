<template>
  <div class="module-page">
    <header class="module-page__header">
      <div>
        <p class="eyebrow">{{ moduleKey }}</p>
        <h2>{{ title }}</h2>
      </div>
      <div class="actions">
        <el-button v-if="permissions.create" type="primary" @click="openForm">新增</el-button>
        <el-button @click="fetchList">刷新</el-button>
      </div>
    </header>

    <div class="table-container">
      <el-table :data="records" border stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="permissions.update" text size="small" @click="openForm(row)">编辑</el-button>
            <el-button v-if="permissions.remove" text type="danger" size="small" @click="removeRow(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Props {
  moduleKey: string
  title: string
  queryParams?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  queryParams: () => ({})
})

const emit = defineEmits<{
  refresh: []
}>()

// 权限
const permissions = reactive({
  create: true,
  update: true,
  remove: true,
  view: true,
  export: false
})

// 数据
const records = ref<any[]>([
  { id: 1, name: '示例数据1' },
  { id: 2, name: '示例数据2' }
])

// 表单相关
const formVisible = ref(false)
const currentFormModel = ref<any>(null)

// 方法
const fetchList = () => {
  emit('refresh')
}

// 暴露给父组件的方法
defineExpose({
  refresh: fetchList
})

const openForm = (row?: any) => {
  currentFormModel.value = row || {}
  formVisible.value = true
}

const removeRow = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 这里应该调用删除API
    ElMessage.success('删除成功')
    fetchList()
  } catch {
    // 用户取消操作
  }
}
</script>

<style lang="scss" scoped>
.module-page {
  padding: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .eyebrow {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 12px;
    }
  }
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}
</style>