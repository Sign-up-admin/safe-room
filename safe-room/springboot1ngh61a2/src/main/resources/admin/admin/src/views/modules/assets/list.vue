<template>
  <div class="assets-page">
    <TableFilter
      v-model="filterForm"
      :asset-type-options="assetTypeOptions"
      :module-options="moduleOptions"
      :usage-options="usageOptions"
      :status-options="statusOptions"
      @search="applyFilters"
      @reset="resetFilters"
    />
    <ModuleCrudPage
      ref="crudRef"
      module-key="assets"
      title="素材管理"
      :query-params="appliedFilters"
      enable-selection
    >
      <template #toolbar="{ selectedRows }">
        <div class="toolbar-content">
          <BatchOperationBar
            :selected-rows="selectedRows"
            @batch-delete="handleBatchDelete"
            @batch-enable="(rows) => handleBatchStatus(rows, 'active')"
            @batch-disable="(rows) => handleBatchStatus(rows, 'deprecated')"
          />
          <ExportButton :data="selectedRows" />
        </div>
      </template>
      <template #columns>
        <el-table-column label="预览" width="140">
          <template #default="{ row }">
            <div class="preview-thumb" @click="openPreview(row)">
              <img v-if="isImage(row)" :src="resolveAssetUrl(row.filePath)" alt="thumb" />
              <video v-else-if="isVideo(row)" :src="resolveAssetUrl(row.filePath)" muted loop playsinline />
              <el-icon v-else>
                <PictureFilled />
              </el-icon>
            </div>
          </template>
        </el-table-column>
      </template>
      <template #form="{ formModel, isEditing }">
        <input ref="fileInputRef" type="file" class="sr-only" @change="handleFileChange" />
        <el-form label-width="110px" :model="formModel" class="asset-form" :inline="false">
          <el-form-item label="素材名称">
            <el-input v-model="formModel.assetName" placeholder="如 hero_home_v1" />
          </el-form-item>
          <el-form-item label="素材类型">
            <el-select v-model="formModel.assetType" placeholder="请选择素材类型">
              <el-option v-for="item in assetTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="所属模块">
                <el-select v-model="formModel.module" filterable placeholder="选择模块">
                  <el-option v-for="item in moduleOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用途">
                <el-select v-model="formModel.usage" filterable placeholder="选择用途">
                  <el-option v-for="item in usageOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="版本号">
                <el-input v-model="formModel.version" placeholder="如 v1" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="上传人">
                <el-input v-model="formModel.uploadUser" placeholder="记录上传人" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="标签">
            <el-input v-model="formModel.tags" placeholder="多个标签用逗号分隔，如 hero,homepage" clearable />
          </el-form-item>
          <el-form-item label="分类">
            <el-radio-group v-model="formModel.category">
              <el-radio-button value="static">静态资源</el-radio-button>
              <el-radio-button value="runtime">运行时上传</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="formModel.status">
              <el-radio-button v-for="item in statusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="formModel.description" type="textarea" :rows="3" placeholder="素材描述、使用注意等" />
          </el-form-item>
          <el-form-item label="文件上传">
            <div class="upload-row">
              <el-button type="primary" :loading="uploading" @click="triggerUpload(formModel)">
                {{ uploading ? '上传中...' : '选择文件' }}
              </el-button>
              <span v-if="formModel.filePath" class="file-path">{{ formModel.filePath }}</span>
            </div>
            <p class="upload-tip">支持 WebP/JPG/PNG/MP4/SVG/GLB 等，单图建议 ≤3MB，视频 ≤60MB</p>
          </el-form-item>
          <el-row v-if="formModel.width || formModel.height || formModel.dimensions" :gutter="16">
            <el-col :span="12">
              <el-form-item label="宽度(px)">
                <el-input-number v-model="formModel.width" :min="0" :step="10" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="高度(px)">
                <el-input-number v-model="formModel.height" :min="0" :step="10" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item v-if="formModel.dimensions" label="尺寸">
            <el-tag type="info">{{ formModel.dimensions }}</el-tag>
          </el-form-item>
        </el-form>
      </template>
      <template #formFooter="{ close, submit, loading, formModel }">
        <div class="assets-form-footer">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleSave(formModel as Record<string, any>, submit)">
            {{ loading ? '保存中' : '保存素材' }}
          </el-button>
        </div>
      </template>
    </ModuleCrudPage>
    <el-dialog v-model="previewVisible" width="720px" :title="previewAsset?.assetName || '素材预览'">
      <div v-if="previewAsset" class="preview-panel">
        <img
          v-if="isImage(previewAsset)"
          :src="resolveAssetUrl(previewAsset.filePath)"
          class="preview-media"
          alt="asset"
        />
        <video
          v-else-if="isVideo(previewAsset)"
          :src="resolveAssetUrl(previewAsset.filePath)"
          class="preview-media"
          controls
          autoplay
          muted
          loop
        />
        <iframe v-else-if="isSvg(previewAsset)" :src="resolveAssetUrl(previewAsset.filePath)" class="svg-frame" />
        <el-empty v-else description="暂不支持该类型预览" />
      </div>
      <template #footer>
        <div v-if="previewAsset" class="preview-meta">
          <span>类型：{{ previewAsset.assetType }}</span>
          <span>尺寸：{{ previewAsset.dimensions || '--' }}</span>
          <span>大小：{{ formatSize(previewAsset.fileSize) }}</span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PictureFilled } from '@element-plus/icons-vue'
import ModuleCrudPage from '@/components/common/ModuleCrudPage.vue'
import TableFilter from '@/components/common/TableFilter.vue'
import BatchOperationBar from '@/components/common/BatchOperationBar.vue'
import ExportButton from '@/components/common/ExportButton.vue'
import http from '@/utils/http'
import base from '@/utils/base'

type FormModel = Record<string, any>

const crudRef = ref<InstanceType<typeof ModuleCrudPage> | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const currentFormModel = ref<FormModel | null>(null)
const uploading = ref(false)
const previewVisible = ref(false)
const previewAsset = ref<FormModel | null>(null)
const assetBaseUrl = base.get().url
const filterForm = reactive<{
  keyword: string
  assetType: string
  module: string
  usage: string
  status: string
  dateRange: string[] | ''
}>({
  keyword: '',
  assetType: '',
  module: '',
  usage: '',
  status: '',
  dateRange: '',
})

const appliedFilters = reactive<Record<string, any>>({
  keyword: '',
  assetType: '',
  module: '',
  usage: '',
  status: '',
  startDate: '',
  endDate: '',
})

const assetTypeOptions = [
  { label: '图片 (Image)', value: 'image' },
  { label: '视频 (Video)', value: 'video' },
  { label: '图标/SVG', value: 'icon' },
  { label: '3D 模型', value: 'model' },
  { label: 'Lottie 动画', value: 'lottie' },
  { label: '其他', value: 'other' },
]

const moduleOptions = ['home', 'course', 'coach', 'news', 'equipment', 'user', 'marketing', 'system']
const usageOptions = ['hero', 'thumbnail', 'background', 'poster', 'icon', 'video-cover', 'gallery']
const statusOptions = [
  { label: '可用', value: 'active' },
  { label: '停用', value: 'deprecated' },
  { label: '归档', value: 'archived' },
]

const resolveAssetUrl = (path?: string) => {
  if (!path) return ''
  const clean = path.startsWith('/') ? path.substring(1) : path
  return assetBaseUrl + clean
}

const isImage = (row: FormModel) =>
  row?.assetType === 'image' || ['jpg', 'jpeg', 'png', 'webp'].includes((row?.fileFormat || '').toLowerCase())
const isVideo = (row: FormModel) =>
  row?.assetType === 'video' || ['mp4', 'webm', 'mov', 'mkv'].includes((row?.fileFormat || '').toLowerCase())
const isSvg = (row: FormModel) => row?.assetType === 'icon' || (row?.fileFormat || '').toLowerCase() === 'svg'

const openPreview = (row: FormModel) => {
  previewAsset.value = row
  previewVisible.value = true
}

const triggerUpload = (formModel: FormModel) => {
  currentFormModel.value = formModel
  fileInputRef.value?.click()
}

const handleFileChange = async () => {
  if (!fileInputRef.value?.files?.length || !currentFormModel.value) return
  const file = fileInputRef.value.files[0]
  try {
    uploading.value = true
    const model = currentFormModel.value
    const formData = new FormData()
    formData.append('file', file)
    formData.append('assetName', model.assetName || file.name)
    formData.append('assetType', model.assetType || 'image')
    formData.append('module', model.module || 'general')
    formData.append('usage', model.usage || 'general')
    formData.append('version', model.version || 'v1')
    formData.append('tags', model.tags || '')
    formData.append('category', model.category || 'static')
    formData.append('status', model.status || 'active')
    formData.append('description', model.description || '')
    formData.append('uploadUser', model.uploadUser || '')
    const response = await http.post('/file/uploadAsset', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const payload = response.data
    if (payload?.code === 0) {
      model.filePath = payload.file
      model.width = payload.width
      model.height = payload.height
      model.dimensions = payload.dimensions
      ElMessage.success('文件上传成功')
    } else {
      throw new Error(payload?.msg || '上传失败')
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '上传失败')
  } finally {
    uploading.value = false
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

const handleSave = (formModel: FormModel | undefined, submit: () => void) => {
  if (!formModel) return
  if (!formModel.assetName) {
    ElMessage.warning('请输入素材名称')
    return
  }
  if (!formModel.filePath) {
    ElMessage.warning('请上传素材文件')
    return
  }
  submit()
}

const formatSize = (size?: number) => {
  if (!size) return '--'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const handleBatchDelete = async (rows: FormModel[]) => {
  if (!rows.length) {
    ElMessage.warning('请先选择需要删除的素材')
    return
  }
  await ElMessageBox.confirm(`确定删除选中的 ${rows.length} 个素材？该操作不可恢复。`, '批量删除', {
    type: 'warning',
  })
  const ids = rows.map(row => row.id)
  await http.post('/assets/delete', ids)
  ElMessage.success('批量删除成功')
  crudRef.value?.refresh()
}

const handleBatchStatus = async (rows: FormModel[], status: string) => {
  if (!rows.length) {
    ElMessage.warning('请至少选择一条素材')
    return
  }
  const label = status === 'active' ? '启用' : '停用'
  await http.post('/assets/batchStatus', {
    ids: rows.map(row => row.id),
    status,
  })
  ElMessage.success(`已批量${label}`)
  crudRef.value?.refresh()
}


const applyFilters = () => {
  appliedFilters.keyword = filterForm.keyword.trim()
  appliedFilters.assetType = filterForm.assetType
  appliedFilters.module = filterForm.module
  appliedFilters.usage = filterForm.usage
  appliedFilters.status = filterForm.status
  if (Array.isArray(filterForm.dateRange) && filterForm.dateRange.length === 2) {
    appliedFilters.startDate = filterForm.dateRange[0]
    appliedFilters.endDate = filterForm.dateRange[1]
  } else {
    appliedFilters.startDate = ''
    appliedFilters.endDate = ''
  }
  crudRef.value?.refresh()
}

const resetFilters = () => {
  filterForm.keyword = ''
  filterForm.assetType = ''
  filterForm.module = ''
  filterForm.usage = ''
  filterForm.status = ''
  filterForm.dateRange = ''
  applyFilters()
}

applyFilters()
</script>

<style scoped lang="scss">
.assets-page {
  padding: 24px;
}

.toolbar-content {
  display: flex;
  gap: 8px;
  align-items: center;
}

.asset-form {
  .upload-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 8px;
  }
}

.file-path {
  font-size: 12px;
  color: #838fa1;
}

.upload-tip {
  font-size: 12px;
  color: #a0a4b3;
  margin: 0;
}

.assets-form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.sr-only {
  position: absolute;
  clip: rect(0, 0, 0, 0);
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.preview-thumb {
  width: 100px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #0f1b37;
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.preview-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-media {
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.svg-frame {
  width: 100%;
  height: 360px;
  border: none;
}

.preview-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #a0a4b3;
}
</style>
