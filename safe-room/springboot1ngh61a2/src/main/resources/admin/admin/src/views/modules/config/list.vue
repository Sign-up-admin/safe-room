<template>
  <ModuleCrudPage
    :config="crudConfig"
    @create="handleCreate"
    @update="handleUpdate"
    @delete="handleDelete"
    @view="handleView"
    @export="handleExport"
    @import="handleImport"
  >
    <!-- 自定义表格列 -->
    <template #table-column-sort="{ row, $index }">
      <el-input-number
        v-model="row.sort"
        :min="0"
        :max="999"
        size="small"
        style="width: 70px"
        @change="handleSortChange(row, $index)"
      />
    </template>

    <template #table-column-url="{ row }">
      <el-image
        v-if="row.url"
        :src="row.url"
        :preview-src-list="[row.url]"
        fit="cover"
        style="width: 100px; height: 60px; border-radius: 4px"
        lazy
      />
      <span v-else style="color: #a0a4b3">暂无图片</span>
    </template>

    <!-- 自定义表单字段 -->
    <template #form-field-url="{ formModel }">
      <ImageUpload
        v-model="formModel.url"
        :limit="1"
        :multiple="false"
        list-type="picture-card"
        tip="支持jpg/png/webp格式，大小不超过5MB"
      />
      <div v-if="formModel.url" class="image-preview-tip">
        <el-text type="info" size="small">当前图片：</el-text>
        <el-image
          :src="formModel.url"
          style="width: 200px; height: 120px; margin-top: 8px; border-radius: 4px"
          fit="cover"
        />
      </div>
    </template>

    <template #form-field-sort="{ formModel }">
      <el-input-number
        v-model="formModel.sort"
        :min="0"
        :max="999"
        placeholder="数字越大越靠前"
        style="width: 200px"
      />
      <el-text type="info" size="small" style="margin-left: 8px">数字越大越靠前</el-text>
    </template>

    <!-- 自定义详情字段 -->
    <template #detail-field-url="{ value }">
      <el-image
        v-if="value"
        :src="value"
        style="max-width: 400px; max-height: 300px"
        fit="contain"
      />
      <span v-else>暂无图片</span>
    </template>
  </ModuleCrudPage>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import http from '@/utils/http'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import ImageUpload from '@/components/common/ImageUpload.vue'
import ModuleCrudPage from '@/components/common/ModuleCrudPage.vue'
import type { CrudPageConfig } from '@/types/crud'

// CRUD配置
const crudConfig: CrudPageConfig = {
  moduleKey: 'config',
  title: '轮播管理',
  apiEndpoints: {
    page: API_ENDPOINTS.CONFIG.PAGE,
    info: (id) => API_ENDPOINTS.CONFIG.INFO(id),
    save: API_ENDPOINTS.CONFIG.SAVE,
    update: API_ENDPOINTS.CONFIG.UPDATE,
    delete: API_ENDPOINTS.CONFIG.DELETE,
  },
  columns: [
    {
      prop: 'sort',
      label: '排序',
      width: 80,
      slot: 'sort', // 使用自定义插槽
    },
    {
      prop: 'url',
      label: '缩略图',
      width: 120,
      slot: 'url', // 使用自定义插槽
    },
    {
      prop: 'name',
      label: '标题',
      minWidth: 200,
      showOverflowTooltip: true,
    },
    {
      prop: 'value',
      label: '描述',
      minWidth: 200,
      showOverflowTooltip: true,
    },
    {
      prop: 'url',
      label: '图片URL',
      minWidth: 200,
      showOverflowTooltip: true,
    },
    {
      prop: 'addtime',
      label: '添加时间',
      minWidth: 160,
    },
  ],
  formFields: [
    {
      key: 'name',
      label: '标题',
      type: 'text',
      required: true,
      rules: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    },
    {
      key: 'value',
      label: '描述',
      type: 'textarea',
      required: false,
      rules: [],
    },
    {
      key: 'url',
      label: '图片',
      type: 'image',
      required: true,
      rules: [{ required: true, message: '请上传图片', trigger: 'change' }],
    },
    {
      key: 'sort',
      label: '排序',
      type: 'number',
      required: false,
      rules: [],
    },
  ],
  defaultSort: { prop: 'sort', order: 'desc' },
  enableSelection: false,
  enablePagination: true,
  enableSearch: false,
  enableCreate: true,
  enableUpdate: true,
  enableDelete: true,
  enableDetail: true,
  enableExport: true,
  enableImport: false,
  formDialogWidth: '600px',
  detailDialogWidth: '600px',
}

// 处理排序变化
const handleSortChange = async (row: Record<string, any>, index: number) => {
  try {
    await http.post(API_ENDPOINTS.CONFIG.UPDATE, {
      id: row.id,
      sort: row.sort,
    })
    ElMessage.success('排序已更新')
  } catch (error: any) {
    ElMessage.error(error.message || '更新排序失败')
    // 失败时可以刷新列表或者其他处理
  }
}

// 事件处理函数
const handleCreate = () => {
  // 可以在这里添加创建前的逻辑
}

const handleUpdate = (record: any) => {
  // 可以在这里添加更新后的逻辑
}

const handleDelete = (record: any) => {
  // 可以在这里添加删除后的逻辑
}

const handleView = (record: any) => {
  // 可以在这里添加查看逻辑
}

const handleExport = () => {
  // 可以在这里添加导出前的逻辑
}

const handleImport = (file: File) => {
  // 可以在这里添加导入逻辑
}
</script>

<style scoped lang="scss">
// 图片预览提示样式
.image-preview-tip {
  margin-top: 8px;
}
</style>
