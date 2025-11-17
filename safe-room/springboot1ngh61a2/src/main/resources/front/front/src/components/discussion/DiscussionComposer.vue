<template>
  <div class="discussion-composer" role="dialog" aria-modal="true" aria-labelledby="composer-title">
    <!-- 发布按钮 -->
    <div class="composer-trigger" @click="toggleComposer" v-if="!isVisible">
      <TechButton size="lg" :icon="Plus">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        发布讨论
      </TechButton>
    </div>

    <!-- 编辑器界面 -->
    <div class="composer-editor" v-show="isVisible">
      <div class="editor-header">
        <h3 id="composer-title">{{ isEditMode ? '编辑讨论' : '发布新讨论' }}</h3>
        <div class="editor-actions">
          <TechButton size="sm" variant="outline" @click="saveDraft" :disabled="!hasContent">
            💾 保存草稿
          </TechButton>
          <TechButton size="sm" variant="outline" @click="toggleComposer">
            取消
          </TechButton>
          <TechButton size="sm" @click="submitDiscussion" :loading="submitting" :disabled="!canSubmit">
            {{ isEditMode ? '更新' : '发布' }}
          </TechButton>
        </div>
      </div>

      <!-- 讨论标题 -->
      <div class="editor-field">
        <label for="discussion-title" class="field-label">
          讨论标题 <span class="required">*</span>
        </label>
        <el-input
          id="discussion-title"
          v-model="formData.title"
          placeholder="请输入讨论标题（最多50个字符）"
          maxlength="50"
          show-word-limit
          aria-required="true"
          :aria-describedby="'title-help'"
        />
        <div id="title-help" class="sr-only">标题最多50个字符，必填项</div>
      </div>

      <!-- 关联课程 -->
      <div class="editor-field">
        <label for="discussion-course" class="field-label">
          关联课程
        </label>
        <el-select
          id="discussion-course"
          v-model="formData.refid"
          placeholder="选择相关课程（可选）"
          clearable
          filterable
          :aria-label="'关联课程选择'"
        >
          <el-option
            v-for="course in courseOptions"
            :key="course.value"
            :label="course.label"
            :value="course.value"
          />
        </el-select>
      </div>

      <!-- 标签选择 -->
      <div class="editor-field">
        <label class="field-label">
          话题标签
        </label>
        <div class="tag-selector" role="group" aria-label="选择话题标签">
          <el-checkbox-group v-model="selectedTags" aria-label="话题标签选择组">
            <el-checkbox
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :aria-label="`选择标签 ${tag}`"
            >
              {{ tag }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <!-- 富文本编辑器 -->
      <div class="editor-field">
        <label class="field-label">
          讨论内容 <span class="required">*</span>
        </label>
        <div class="editor-container">
          <!-- 工具栏 -->
          <div class="editor-toolbar">
            <button
              v-for="tool in toolbarTools"
              :key="tool.id"
              class="toolbar-btn"
              @click="executeCommand(tool)"
              :title="tool.title"
              :aria-label="tool.title"
            >
              <component :is="tool.icon" size="16" />
            </button>
            <div class="toolbar-separator"></div>
            <button class="toolbar-btn" @click="insertImage" title="插入图片" aria-label="插入图片">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="9" cy="9" r="2" stroke="currentColor" stroke-width="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button class="toolbar-btn" @click="insertLink" title="插入链接" aria-label="插入链接">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- 编辑区域 -->
          <div
            ref="editorRef"
            class="editor-content"
            contenteditable="true"
            :placeholder="'分享你的经验和心得...' + (isEditMode ? '' : '\\n\\n记得选择合适的标签哦！')"
            @input="handleContentInput"
            @paste="handlePaste"
            @keydown="handleKeydown"
            :aria-label="'讨论内容编辑器'"
          ></div>

          <!-- 字数统计 -->
          <div class="editor-footer">
            <div class="character-count">
              {{ contentLength }}/2000
            </div>
            <div class="editor-hints">
              <span v-if="isSavingDraft" class="saving-indicator">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                正在保存草稿...
              </span>
              <span v-else-if="lastSaved" class="saved-indicator">
                ✓ 已保存 {{ formatLastSaved(lastSaved) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 附件上传 -->
      <div class="editor-field">
        <label class="field-label">
          附件上传
        </label>
        <div class="attachment-upload">
          <div class="upload-zone" @click="triggerFileSelect" @drop="handleDrop" @dragover.prevent>
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              @change="handleFileSelect"
              style="display: none"
            />
            <div class="upload-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"/>
                <path d="M14 2v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 18v-6M9 15l3 3 3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p>点击上传或拖拽文件到此处</p>
              <small>支持图片、PDF、Word文档等，最多5个文件</small>
            </div>
          </div>

          <!-- 已上传文件列表 -->
          <div class="uploaded-files" v-if="uploadedFiles.length > 0">
            <div
              v-for="(file, index) in uploadedFiles"
              :key="index"
              class="uploaded-file-item"
            >
              <div class="file-info">
                <img v-if="file.type.startsWith('image/')" :src="file.preview" :alt="file.name" class="file-preview" />
                <div v-else class="file-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"/>
                    <path d="M14 2v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="file-details">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </div>
              </div>
              <button class="remove-file-btn" @click="removeFile(index)" :aria-label="'删除文件' + file.name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 发布选项 -->
      <div class="editor-options">
        <el-checkbox v-model="formData.isAnonymous" :aria-label="'匿名发布'">
          匿名发布
        </el-checkbox>
        <el-checkbox v-model="formData.allowReply" :aria-label="'允许回复'">
          允许回复
        </el-checkbox>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { TechButton } from '@/components/common'
import { getModuleService } from '@/services/crud'
import type { Jianshenkecheng } from '@/types/modules'

// 图标组件
const Plus = 'Plus'

// Props
interface Props {
  visible?: boolean
  editData?: any
  courseOptions?: Array<{ label: string; value: number }>
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  courseOptions: () => []
})

// Emits
const emit = defineEmits<{
  submit: [data: any]
  cancel: []
  saveDraft: [data: any]
}>()

// 状态
const isVisible = ref(false)
const submitting = ref(false)
const isSavingDraft = ref(false)
const lastSaved = ref<Date | null>(null)
const editorRef = ref<HTMLDivElement>()
const fileInputRef = ref<HTMLInputElement>()

// 表单数据
const formData = ref({
  title: '',
  content: '',
  refid: undefined as number | undefined,
  tags: [] as string[],
  isAnonymous: false,
  allowReply: true
})

const selectedTags = ref<string[]>([])

// 上传文件
const uploadedFiles = ref<Array<{
  file: File
  name: string
  size: number
  type: string
  preview?: string
}>>([])

// 编辑器工具栏
const toolbarTools = [
  { id: 'bold', title: '粗体', icon: 'Bold', command: 'bold' },
  { id: 'italic', title: '斜体', icon: 'Italic', command: 'italic' },
  { id: 'underline', title: '下划线', icon: 'underline', command: 'underline' },
  { id: 'strikethrough', title: '删除线', icon: 'strikethrough', command: 'strikethrough' },
  { id: 'code', title: '行内代码', icon: 'Code', command: 'code' },
  { id: 'blockquote', title: '引用', icon: 'Quote', command: 'blockquote' },
  { id: 'list', title: '无序列表', icon: 'List', command: 'insertUnorderedList' },
  { id: 'ordered-list', title: '有序列表', icon: 'ListOrdered', command: 'insertOrderedList' }
]

// 可用标签
const availableTags = [
  '训练', '饮食', '进阶', '复训', '器材', '心得', '问题', '建议',
  '教练推荐', '瘦身', '增肌', '塑形', '康复', '瑜伽', '跑步', '游泳'
]

// 计算属性
const isEditMode = computed(() => !!props.editData)
const hasContent = computed(() => formData.value.title.trim() || formData.value.content.trim())
const canSubmit = computed(() => formData.value.title.trim() && formData.value.content.trim() && !submitting.value)
const contentLength = computed(() => formData.value.content.length)

// 监听器
watch(() => props.visible, (newVal) => {
  isVisible.value = newVal
})

watch(selectedTags, (newTags) => {
  formData.value.tags = newTags
}, { deep: true })

// 方法
const toggleComposer = () => {
  if (isVisible.value) {
    // 隐藏时检查是否有未保存的内容
    if (hasContent.value) {
      ElMessageBox.confirm('内容尚未保存，确定要取消吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetForm()
        emit('cancel')
      })
    } else {
      resetForm()
      emit('cancel')
    }
  } else {
    isVisible.value = true
    nextTick(() => {
      editorRef.value?.focus()
    })
  }
}

const resetForm = () => {
  formData.value = {
    title: '',
    content: '',
    refid: undefined,
    tags: [],
    isAnonymous: false,
    allowReply: true
  }
  selectedTags.value = []
  uploadedFiles.value = []
  isVisible.value = false
}

const handleContentInput = () => {
  if (editorRef.value) {
    formData.value.content = editorRef.value.innerHTML
  }
  // 自动保存草稿
  autoSaveDraft()
}

const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+Enter 快捷发布
  if (event.ctrlKey && event.key === 'Enter' && canSubmit.value) {
    event.preventDefault()
    submitDiscussion()
  }
}

const executeCommand = (tool: any) => {
  document.execCommand(tool.command)
  editorRef.value?.focus()
}

const insertImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      uploadImage(file)
    }
  }
  input.click()
}

const insertLink = () => {
  const url = prompt('请输入链接地址：')
  if (url) {
    const text = window.getSelection()?.toString() || '链接'
    document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${text}</a>`)
  }
}

const handlePaste = (event: ClipboardEvent) => {
  // 处理粘贴的图片
  const items = event.clipboardData?.items
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        event.preventDefault()
        const file = items[i].getAsFile()
        if (file) {
          uploadImage(file)
        }
      }
    }
  }
}

const uploadImage = async (file: File) => {
  try {
    // 这里应该调用实际的文件上传API
    console.log('上传图片:', file.name)

    // 模拟上传成功
    const imageUrl = URL.createObjectURL(file)
    document.execCommand('insertHTML', false, `<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto;" />`)

    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  }
}

const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    Array.from(files).forEach(file => addFile(file))
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files) {
    Array.from(files).forEach(file => addFile(file))
  }
}

const addFile = (file: File) => {
  if (uploadedFiles.value.length >= 5) {
    ElMessage.warning('最多只能上传5个文件')
    return
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB
    ElMessage.warning('文件大小不能超过10MB')
    return
  }

  const fileData = {
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
  }

  uploadedFiles.value.push(fileData)
}

const removeFile = (index: number) => {
  const file = uploadedFiles.value[index]
  if (file.preview) {
    URL.revokeObjectURL(file.preview)
  }
  uploadedFiles.value.splice(index, 1)
}

const autoSaveDraft = (() => {
  let timeout: number
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      if (hasContent.value) {
        saveDraft(true)
      }
    }, 2000) // 2秒后自动保存
  }
})()

const saveDraft = async (isAuto = false) => {
  try {
    isSavingDraft.value = true

    const draftData = {
      ...formData.value,
      selectedTags: selectedTags.value,
      uploadedFiles: uploadedFiles.value.map(f => ({ name: f.name, size: f.size, type: f.type })),
      timestamp: new Date().toISOString()
    }

    // 保存到localStorage
    localStorage.setItem('discussion-draft', JSON.stringify(draftData))
    lastSaved.value = new Date()

    if (!isAuto) {
      ElMessage.success('草稿已保存')
    }

    emit('saveDraft', draftData)
  } catch (error) {
    console.error('保存草稿失败:', error)
    if (!isAuto) {
      ElMessage.error('保存草稿失败')
    }
  } finally {
    isSavingDraft.value = false
  }
}

const submitDiscussion = async () => {
  if (!canSubmit.value) return

  try {
    submitting.value = true

    const submitData = {
      ...formData.value,
      tags: selectedTags.value,
      attachments: uploadedFiles.value.map(f => f.file),
      addtime: new Date().toISOString()
    }

    // 清除草稿
    localStorage.removeItem('discussion-draft')

    emit('submit', submitData)
    resetForm()
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败，请重试')
  } finally {
    submitting.value = false
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatLastSaved = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`

  const hours = Math.floor(minutes / 60)
  return `${hours}小时前`
}

// 生命周期
onMounted(() => {
  // 恢复草稿
  const draft = localStorage.getItem('discussion-draft')
  if (draft) {
    try {
      const draftData = JSON.parse(draft)
      formData.value = {
        title: draftData.title || '',
        content: draftData.content || '',
        refid: draftData.refid,
        tags: draftData.tags || [],
        isAnonymous: draftData.isAnonymous || false,
        allowReply: draftData.allowReply !== false
      }
      selectedTags.value = draftData.selectedTags || []
      lastSaved.value = new Date(draftData.timestamp)
    } catch (error) {
      console.warn('恢复草稿失败:', error)
    }
  }
})

onUnmounted(() => {
  // 清理对象URL
  uploadedFiles.value.forEach(file => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
  })
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.discussion-composer {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.composer-trigger {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.composer-editor {
  width: 100vw;
  max-width: 800px;
  max-height: 80vh;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  h3 {
    margin: 0;
    color: $color-text-primary;
    font-size: 1.25rem;
    font-weight: 600;
  }
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.editor-field {
  padding: 16px 24px;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
}

.field-label {
  display: block;
  margin-bottom: 8px;
  color: $color-text-primary;
  font-size: 0.9rem;
  font-weight: 500;
}

.required {
  color: #ff6b6b;
}

.tag-selector {
  margin-top: 8px;
}

.editor-container {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: $color-text-secondary;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: $color-text-primary;
  }

  &.active {
    background: rgba(253, 216, 53, 0.1);
    color: $color-yellow;
  }
}

.toolbar-separator {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 8px;
}

.editor-content {
  min-height: 200px;
  max-height: 400px;
  padding: 16px;
  color: $color-text-primary;
  outline: none;
  overflow-y: auto;
  font-family: inherit;
  line-height: 1.6;

  &:empty::before {
    content: attr(placeholder);
    color: $color-text-secondary;
    pointer-events: none;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 8px 0;
  }

  :deep(a) {
    color: #4a90e2;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(code) {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9em;
  }

  :deep(blockquote) {
    border-left: 3px solid $color-yellow;
    padding-left: 12px;
    margin: 8px 0;
    color: $color-text-secondary;
  }
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.8rem;
}

.character-count {
  color: $color-text-secondary;
}

.editor-hints {
  display: flex;
  align-items: center;
  gap: 12px;
}

.saving-indicator,
.saved-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: $color-text-secondary;
  font-size: 0.75rem;
}

.saved-indicator {
  color: #4caf50;
}

.attachment-upload {
  margin-top: 8px;
}

.upload-zone {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(253, 216, 53, 0.4);
    background: rgba(253, 216, 53, 0.02);
  }
}

.upload-placeholder {
  color: $color-text-secondary;

  svg {
    margin-bottom: 8px;
    opacity: 0.6;
  }

  p {
    margin: 8px 0 4px 0;
    font-weight: 500;
  }

  small {
    font-size: 0.8rem;
    opacity: 0.7;
  }
}

.uploaded-files {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uploaded-file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-preview {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.file-details {
  flex: 1;

  .file-name {
    display: block;
    color: $color-text-primary;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .file-size {
    display: block;
    color: $color-text-secondary;
    font-size: 0.75rem;
  }
}

.remove-file-btn {
  padding: 4px;
  background: transparent;
  border: none;
  color: $color-text-secondary;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 152, 0, 0.1);
    color: #ff9800;
  }
}

.editor-options {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 16px;
}

// 响应式设计
@media (max-width: 768px) {
  .discussion-composer {
    bottom: 10px;
    right: 10px;
  }

  .composer-editor {
    width: calc(100vw - 20px);
    max-height: 90vh;
  }

  .editor-header {
    padding: 16px 20px;

    h3 {
      font-size: 1.1rem;
    }
  }

  .editor-actions {
    flex-wrap: wrap;
  }

  .editor-field {
    padding: 12px 20px;
  }

  .editor-toolbar {
    padding: 8px 12px;
  }

  .toolbar-btn {
    width: 28px;
    height: 28px;
  }

  .editor-content {
    padding: 12px;
    min-height: 150px;
    max-height: 300px;
  }

  .editor-options {
    padding: 12px 20px;
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .composer-editor {
    width: calc(100vw - 10px);
  }

  .editor-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .editor-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .upload-zone {
    padding: 16px;
  }

  .uploaded-file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .file-info {
    width: 100%;
  }
}

// 无障碍访问辅助类
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>