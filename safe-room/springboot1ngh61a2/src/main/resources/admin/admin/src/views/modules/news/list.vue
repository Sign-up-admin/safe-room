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
    <template #table-column-tupian="{ row }">
      <el-image
        v-if="row.tupian"
        :src="row.tupian"
        :preview-src-list="[row.tupian]"
        fit="cover"
        style="width: 80px; height: 60px; border-radius: 4px"
        lazy
      />
      <span v-else style="color: #a0a4b3">暂无封面</span>
    </template>

    <template #table-column-newstype="{ row }">
      <el-tag v-if="row.newstypeEntity" type="info">
        {{ row.newstypeEntity.leixing || '未分类' }}
      </el-tag>
      <span v-else style="color: #a0a4b3">未分类</span>
    </template>

    <!-- 自定义表单字段 -->
    <template #form-field-newstype="{ formModel, isEditing }">
      <el-select
        v-model="formModel.newstype"
        placeholder="请选择公告分类"
        style="width: 100%"
        filterable
        clearable
      >
        <el-option
          v-for="type in newsTypes"
          :key="type.id"
          :label="type.leixing"
          :value="type.id"
        />
      </el-select>
      <el-button
        text
        type="primary"
        size="small"
        style="margin-top: 8px"
        @click="showCreateTypeDialog = true"
      >
        + 快速创建分类
      </el-button>
    </template>

    <template #form-field-tupian="{ formModel }">
      <ImageUpload
        v-model="formModel.tupian"
        :limit="1"
        :multiple="false"
        list-type="picture-card"
        tip="支持jpg/png/webp格式，大小不超过5MB"
      />
      <div v-if="formModel.tupian" class="image-preview-tip">
        <el-text type="info" size="small">当前封面：</el-text>
        <el-image
          :src="formModel.tupian"
          style="width: 200px; height: 120px; margin-top: 8px; border-radius: 4px"
          fit="cover"
        />
      </div>
    </template>

    <template #form-field-neirong="{ formModel }">
      <RichTextEditor
        v-model="formModel.neirong"
        placeholder="请输入公告内容..."
        min-height="300px"
        max-height="600px"
      />
    </template>

    <!-- 自定义详情字段 -->
    <template #detail-field-neirong="{ value }">
      <div class="content-preview">
        <SafeHtml :html="value || '暂无内容'" />
      </div>
    </template>

    <template #detail-field-newstype="{ value: row }">
      <el-tag v-if="row?.newstypeEntity" type="info">
        {{ row.newstypeEntity.leixing || '未分类' }}
      </el-tag>
      <span v-else>未分类</span>
    </template>

    <template #detail-field-tupian="{ value }">
      <el-image
        v-if="value"
        :src="value"
        style="max-width: 400px; max-height: 300px"
        fit="contain"
      />
      <span v-else>暂无封面</span>
    </template>
  </ModuleCrudPage>

  <!-- 快速创建分类对话框 -->
  <el-dialog v-model="showCreateTypeDialog" title="快速创建分类" width="400px">
    <el-form ref="typeFormRef" :model="newTypeForm" :rules="typeFormRules">
      <el-form-item label="分类名称" prop="leixing">
        <el-input v-model="newTypeForm.leixing" placeholder="请输入分类名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showCreateTypeDialog = false">取消</el-button>
      <el-button type="primary" @click="createType">创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import ImageUpload from '@/components/common/ImageUpload.vue'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import SafeHtml from '@/components/common/SafeHtml.vue'
import ModuleCrudPage from '@/components/common/ModuleCrudPage.vue'
import type { CrudPageConfig } from '@/types/crud'

// 新闻类型数据
const newsTypes = ref<Record<string, any>[]>([])
const showCreateTypeDialog = ref(false)
const typeFormRef = ref()
const newTypeForm = reactive({
  leixing: '',
})

const typeFormRules = {
  leixing: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

// CRUD配置
const crudConfig: CrudPageConfig = {
  moduleKey: 'news',
  title: '公告管理',
  apiEndpoints: {
    page: API_ENDPOINTS.NEWS.PAGE,
    info: (id) => API_ENDPOINTS.NEWS.INFO(id),
    save: API_ENDPOINTS.NEWS.SAVE,
    update: API_ENDPOINTS.NEWS.UPDATE,
    delete: API_ENDPOINTS.NEWS.DELETE,
  },
  columns: [
    {
      prop: 'tupian',
      label: '封面',
      width: 100,
      slot: 'tupian', // 使用自定义插槽
    },
    {
      prop: 'biaoti',
      label: '标题',
      minWidth: 200,
      showOverflowTooltip: true,
    },
    {
      prop: 'newstype',
      label: '分类',
      width: 120,
      slot: 'newstype', // 使用自定义插槽
    },
    {
      prop: 'clicktime',
      label: '点击量',
      width: 100,
      align: 'center',
    },
    {
      prop: 'addtime',
      label: '发布时间',
      minWidth: 160,
    },
  ],
  searchFields: [
    {
      key: 'newstype',
      label: '公告分类',
      type: 'select',
      placeholder: '请选择分类',
      width: 200,
      clearable: true,
      options: [], // 将在获取数据后动态设置
    },
    {
      key: 'biaoti',
      label: '标题',
      type: 'text',
      placeholder: '请输入标题关键词',
      width: 200,
      clearable: true,
    },
  ],
  formFields: [
    {
      key: 'biaoti',
      label: '标题',
      type: 'text',
      required: true,
      rules: [
        { required: true, message: '请输入标题', trigger: 'blur' },
        { max: 200, message: '标题不能超过200个字符', trigger: 'blur' },
      ],
    },
    {
      key: 'newstype',
      label: '分类',
      type: 'select',
      required: true,
      rules: [{ required: true, message: '请选择分类', trigger: 'change' }],
    },
    {
      key: 'tupian',
      label: '封面图片',
      type: 'image',
      required: true,
      rules: [{ required: true, message: '请上传图片', trigger: 'change' }],
    },
    {
      key: 'neirong',
      label: '内容',
      type: 'richtext',
      required: true,
      rules: [{ required: true, message: '请输入内容', trigger: 'blur' }],
    },
  ],
  defaultSort: { prop: 'addtime', order: 'desc' },
  enableSelection: false,
  enablePagination: true,
  enableSearch: true,
  enableCreate: true,
  enableUpdate: true,
  enableDelete: true,
  enableDetail: true,
  enableExport: true,
  enableImport: false,
  formDialogWidth: '900px',
  detailDialogWidth: '800px',
}

// 获取公告分类列表
const fetchNewsTypes = async () => {
  try {
    const response = await http.get(API_ENDPOINTS.NEWSTYPE.LIST)
    if (response.data.code === 0) {
      newsTypes.value = response.data.data || []
      // 更新搜索字段的选项
      const searchField = crudConfig.searchFields?.find(f => f.key === 'newstype')
      if (searchField) {
        searchField.options = [
          { label: '全部', value: null },
          ...newsTypes.value.map(type => ({
            label: type.leixing,
            value: type.id,
          })),
        ]
      }
    }
  } catch (error: any) {
    console.error('获取分类列表失败:', error)
  }
}

// 快速创建分类
const createType = async () => {
  if (!typeFormRef.value) return
  await typeFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    try {
      await http.post(API_ENDPOINTS.NEWSTYPE.SAVE, { leixing: newTypeForm.leixing })
      ElMessage.success('分类创建成功')
      showCreateTypeDialog.value = false
      newTypeForm.leixing = ''
      await fetchNewsTypes()
    } catch (error: any) {
      ElMessage.error(error.message || '创建失败')
    }
  })
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

// 初始化
onMounted(() => {
  fetchNewsTypes()
})
</script>

<style scoped lang="scss">
// 内容预览样式
.content-preview {
  max-height: 400px;
  overflow-y: auto;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  line-height: 1.6;

  :deep(img) {
    max-width: 100%;
    height: auto;
  }
}

// 图片预览提示样式
.image-preview-tip {
  margin-top: 8px;
}
</style>
