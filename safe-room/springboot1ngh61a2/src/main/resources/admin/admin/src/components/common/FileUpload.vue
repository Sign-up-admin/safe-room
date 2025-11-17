<template>
  <div>
    <!-- 上传文件组件 -->
    <el-upload
      v-if="type === 1"
      ref="uploadRef"
      :action="getActionUrl"
      list-type="picture-card"
      :multiple="multiple"
      :limit="limit"
      :headers="myHeaders"
      :file-list="fileList"
      :on-exceed="handleExceed"
      :on-preview="handleUploadPreview"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadErr"
      :before-upload="handleBeforeUpload"
    >
      <el-icon><Plus /></el-icon>
      <template #tip>
        <div class="el-upload__tip" style="color: #838fa1">{{ tip }}</div>
      </template>
    </el-upload>
    <el-upload
      v-else
      ref="uploadRef"
      drag
      :action="getActionUrl"
      :multiple="multiple"
      :limit="limit"
      :headers="myHeaders"
      :file-list="fileList"
      :on-exceed="handleExceed"
      :on-preview="handleUploadPreview"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadErr"
      :before-upload="handleBeforeUpload"
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip" style="color: #838fa1">{{ tip }}</div>
      </template>
    </el-upload>
    <el-dialog v-model="dialogVisible" size="small" append-to-body>
      <img v-if="type === 1" width="100%" :src="dialogImageUrl" alt="" />
      <video v-if="type === 2" width="100%" :src="dialogImageUrl" alt="" controls />
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="FileUpload">
import { ref, computed, watch, getCurrentInstance, onMounted } from 'vue'
import { Plus, UploadFilled } from '@element-plus/icons-vue'
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
  type?: number
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  tip: '',
  action: 'file/upload',
  limit: 3,
  multiple: false,
  fileUrls: '',
  type: 1,
  modelValue: '',
})

const emit = defineEmits<{
  change: [value: string]
  'update:modelValue': [value: string]
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
  const urls = props.modelValue || props.fileUrls
  if (urls) {
    fileUrlList.value = urls.split(',').filter(Boolean)
    const fileArray: UploadFile[] = []
    fileUrlList.value.forEach((item, index) => {
      const url = item.trim()
      if (!url) return
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

// 允许的文件类型
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
]

// 文件大小限制（字节）
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// 安全的文件名处理
function sanitizeFileName(fileName: string): string {
  // 移除路径分隔符和特殊字符，只保留安全的文件名
  return fileName
    .replace(/^.*[\\/]/, '') // 移除路径
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // 移除非法字符
    .replace(/\s+/g, '_') // 空格替换为下划线
    .substring(0, 255) // 限制长度
}

const handleBeforeUpload: UploadProps['beforeUpload'] = file => {
  // 文件类型验证
  const isImage = props.type === 1
  const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE

  if (!allowedTypes.includes(file.type)) {
    const typeName = isImage ? '图片' : '文件'
    const allowedExts = isImage
      ? 'jpg, jpeg, png, webp'
      : 'pdf, doc, docx, xls, xlsx, txt, zip'
    ElMessage.error(`${typeName}格式不支持，仅支持：${allowedExts}`)
    return false
  }

  // 文件大小验证
  if (file.size > maxSize) {
    const typeName = isImage ? '图片' : '文件'
    const maxSizeMB = maxSize / (1024 * 1024)
    ElMessage.error(`${typeName}大小不能超过${maxSizeMB}MB`)
    return false
  }

  // 文件名安全检查
  if (file.name) {
    const sanitizedName = sanitizeFileName(file.name)
    if (sanitizedName !== file.name) {
      // 如果文件名被修改，可以在这里处理
      console.warn('文件名已清理:', file.name, '->', sanitizedName)
    }
  }

  // 检查文件内容（简单验证）
  if (file.size === 0) {
    ElMessage.error('文件不能为空')
    return false
  }

  return true
}


const handleUploadSuccess = (res: ApiResponse<FileUploadResponse>, _file: UploadFile, fileList: UploadFiles) => {
  if (res && res.code === 0) {
    const lastFile = fileList[fileList.length - 1]
    if (lastFile && res.data) {
      lastFile.url = 'upload/' + res.data.file
    }
    setFileList(fileList)
    const urlString = fileUrlList.value.join(',')
    emit('change', urlString)
    emit('update:modelValue', urlString)
  } else {
    ElMessage.error(res.msg || '上传失败')
  }
}

const handleUploadErr = () => {
  ElMessage.error('文件上传失败')
}

const handleRemove = (_file: UploadFile, fileList: UploadFiles) => {
  setFileList(fileList)
  const urlString = fileUrlList.value.join(',')
  emit('change', urlString)
  emit('update:modelValue', urlString)
}

const handleUploadPreview = (file: UploadFile) => {
  if (props.type > 2) {
    window.open(file.url)
    return false
  }
  dialogImageUrl.value = file.url || ''
  dialogVisible.value = true
  return undefined
}

const handleExceed = () => {
  ElMessage.warning(`最多上传${props.limit}张图片`)
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
  () => props.fileUrls || props.modelValue,
  () => {
    init()
  },
  { immediate: true },
)

onMounted(() => {
  init()
  myHeaders.value = {
    Token: storage.get('Token'),
  }
})
</script>


