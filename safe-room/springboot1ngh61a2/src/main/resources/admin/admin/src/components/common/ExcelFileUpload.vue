<template>
  <div>
    <!-- 上传文件组件 -->
    <el-upload
      ref="uploadRef"
      :action="getActionUrl"
      list-type="picture-card"
      accept=".xls,.xlsx"
      :limit="limit"
      :headers="myHeaders"
      :on-exceed="handleExceed"
      :on-preview="handleUploadPreview"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadErr"
      :before-upload="handleBeforeUpload"
      :show-file-list="false"
    >
      <el-icon><Plus /></el-icon>
      <template #tip>
        <div class="el-upload__tip" style="color: #838fa1">{{ tip }}</div>
      </template>
    </el-upload>
    <el-dialog v-model="dialogVisible" size="small" append-to-body>
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="ExcelFileUpload">
import { ref, computed, watch, getCurrentInstance, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadFiles, UploadProps } from 'element-plus'
import type { ApiResponse, FileUploadResponse } from '@/types/api'
import storage from '@/utils/storage'

interface Props {
  tip?: string
  action?: string
  limit?: number
  multiple?: boolean
  fileUrls?: string
}

const props = withDefaults(defineProps<Props>(), {
  tip: '',
  action: 'file/upload',
  limit: 1,
  multiple: false,
  fileUrls: '',
})

const emit = defineEmits<{
  change: [value: string]
}>()

const instance = getCurrentInstance()
const uploadRef = ref()

const dialogVisible = ref(false)
const dialogImageUrl = ref('')
const fileList = ref<UploadFile[]>([])
const fileUrlList = ref<string[]>([])
const myHeaders = ref<Record<string, string>>({})

const getActionUrl = computed(() => {
  const base = (instance?.appContext.config.globalProperties['$base'] as any) || {}
  return `/${base.name || 'springboot1ngh61a2'}/${props.action}`
})

const init = () => {
  if (props.fileUrls) {
    fileUrlList.value = props.fileUrls.split(',')
    const fileArray: UploadFile[] = []
    fileUrlList.value.forEach((item, index) => {
      const url = item
      const name = String(index)
      const file: UploadFile = {
        name,
        url,
        uid: Date.now() + index,
        status: 'success',
      }
      fileArray.push(file)
    })
    setFileList(fileArray)
  }
}

const handleBeforeUpload: UploadProps['beforeUpload'] = () => 
  // Can add validation here
   true


const handleUploadSuccess = (res: ApiResponse<FileUploadResponse>, _file: UploadFile, fileList: UploadFiles) => {
  if (res && res.code === 0) {
    const lastFile = fileList[fileList.length - 1]
    if (lastFile) {
      lastFile.url = 'upload/' + res.data.file
    }
    setFileList(fileList)
    emit('change', fileUrlList.value.join(','))
    ElMessage.success('文件导入成功')
  } else {
    ElMessage.error(res.msg || '导入失败')
  }
}

const handleUploadErr = () => {
  ElMessage.error('文件导入失败')
}

const handleRemove = (_file: UploadFile, fileList: UploadFiles) => {
  setFileList(fileList)
  emit('change', fileUrlList.value.join(','))
}

const handleUploadPreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url || ''
  dialogVisible.value = true
}

const handleExceed = () => {
  ElMessage.warning(`最多上传${props.limit}个文件`)
}

const setFileList = (files: UploadFiles) => {
  const fileArray: UploadFile[] = []
  const fileUrlArray: string[] = []
  const token = storage.get('Token')
  const base = (instance?.appContext.config.globalProperties['$base'] as any) || {}
  const baseUrl = base.url || 'http://localhost:8080/springboot1ngh61a2/'

  files.forEach(item => {
    let url = item.url?.split('?')[0] || ''
    if (!url.startsWith('http')) {
      url = baseUrl + url
    }
    const name = item.name || ''
    const file: UploadFile = {
      name,
      url: url + '?token=' + token,
      uid: item.uid || Date.now(),
      status: item.status || 'success',
    }
    fileArray.push(file)
    fileUrlArray.push(url)
  })
  fileList.value = fileArray
  fileUrlList.value = fileUrlArray
}

watch(
  () => props.fileUrls,
  () => {
    init()
  },
)

onMounted(() => {
  init()
  myHeaders.value = {
    Token: storage.get('Token'),
  }
  fileList.value = []
})
</script>


