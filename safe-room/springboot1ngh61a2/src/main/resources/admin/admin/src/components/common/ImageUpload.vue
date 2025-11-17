<template>
  <div class="image-upload">
    <el-upload
      ref="uploadRef"
      :action="uploadUrl"
      :headers="headers"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      :limit="limit"
      :multiple="multiple"
      :accept="accept"
      :drag="drag"
      :list-type="listType"
      :disabled="disabled"
    >
      <template v-if="listType === 'picture-card'">
        <el-icon><Plus /></el-icon>
      </template>
      <template v-else-if="drag">
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
      </template>
      <template v-else>
        <el-button type="primary">选择图片</el-button>
      </template>
      <template #tip>
        <div v-if="tip" class="el-upload__tip">{{ tip }}</div>
      </template>
    </el-upload>

    <el-dialog v-model="previewVisible" title="图片预览" width="800px" append-to-body>
      <img :src="previewUrl" style="width: 100%; max-height: 600px; object-fit: contain" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, UploadFilled } from '@element-plus/icons-vue'
import http from '@/utils/http'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import storage from '@/utils/storage'

interface Props {
  modelValue?: string | string[]
  limit?: number
  multiple?: boolean
  accept?: string
  maxSize?: number // MB
  drag?: boolean
  listType?: 'text' | 'picture' | 'picture-card'
  disabled?: boolean
  tip?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  limit: 1,
  multiple: false,
  accept: 'image/jpeg,image/jpg,image/png,image/webp',
  maxSize: 5,
  drag: true,
  listType: 'picture-card',
  disabled: false,
  tip: '支持jpg/png/webp格式，大小不超过5MB',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
  change: [value: string | string[]]
}>()

const uploadRef = ref()
const previewVisible = ref(false)
const previewUrl = ref('')
const fileList = ref<any[]>([])

const uploadUrl = computed(() => {
  const baseUrl = http.defaults.baseURL || ''
  return `${baseUrl}/${API_ENDPOINTS.FILE.UPLOAD}`
})

const headers = computed(() => {
  const token = storage.get('Token') || ''
  return {
    token,
  }
})

// 监听modelValue变化，更新fileList
watch(
  () => props.modelValue,
  val => {
    if (!val) {
      fileList.value = []
      return
    }

    if (Array.isArray(val)) {
      fileList.value = val.map((url, index) => ({
        uid: index,
        name: `image-${index}.jpg`,
        url,
        status: 'success',
      }))
    } else {
      fileList.value = [
        {
          uid: 0,
          name: 'image.jpg',
          url: val,
          status: 'success',
        },
      ]
    }
  },
  { immediate: true },
)

const beforeUpload = (file: File): boolean => {
  // 检查文件类型
  const validTypes = props.accept.split(',').map(t => t.trim())
  const fileType = file.type
  const isValidType = validTypes.some(type => {
    if (type.startsWith('image/')) {
      return fileType.startsWith('image/')
    }
    return fileType === type
  })

  if (!isValidType) {
    ElMessage.error(`只能上传 ${props.accept} 格式的图片！`)
    return false
  }

  // 检查文件大小
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB！`)
    return false
  }

  return true
}

const handleSuccess = (response: any, file: any) => {
  if (response.code === 0 && response.data) {
    const imageUrl = response.data.url || response.data
    if (props.multiple) {
      const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []
      currentValue.push(imageUrl)
      emit('update:modelValue', currentValue)
      emit('change', currentValue)
    } else {
      emit('update:modelValue', imageUrl)
      emit('change', imageUrl)
    }
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}

const handleError = (error: any) => {
  ElMessage.error('上传失败，请重试')
  console.error('Upload error:', error)
}

const handleRemove = (file: any) => {
  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = currentValue.indexOf(file.url)
    if (index > -1) {
      currentValue.splice(index, 1)
      emit('update:modelValue', currentValue)
      emit('change', currentValue)
    }
  } else {
    emit('update:modelValue', '')
    emit('change', '')
  }
}

const handlePreview = (file: any) => {
  previewUrl.value = file.url || file.response?.data?.url || file.response?.data
  previewVisible.value = true
}

// 暴露方法供父组件调用
defineExpose({
  clearFiles: () => {
    uploadRef.value?.clearFiles()
    fileList.value = []
    emit('update:modelValue', props.multiple ? [] : '')
    emit('change', props.multiple ? [] : '')
  },
})
</script>

<style scoped lang="scss">
.image-upload {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #3a80ff;
    }
  }

  :deep(.el-upload--picture-card) {
    width: 120px;
    height: 120px;
    line-height: 120px;
  }

  :deep(.el-upload-list--picture-card) {
    .el-upload-list__item {
      width: 120px;
      height: 120px;
    }
  }

  :deep(.el-upload__tip) {
    color: #a0a4b3;
    font-size: 12px;
    margin-top: 8px;
  }
}
</style>
