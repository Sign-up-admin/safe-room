<template>
  <div class="rich-text-editor">
    <QuillEditor
      ref="quillEditorRef"
      v-model:content="content"
      content-type="html"
      :options="editorOptions"
      @update:content="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { ElMessage } from 'element-plus'
import storage from '@/utils/storage'
import http from '@/utils/http'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import DOMPurify from 'dompurify'

interface Props {
  modelValue?: string
  placeholder?: string
  minHeight?: string
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  minHeight: '200px',
  maxHeight: '500px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const quillEditorRef = ref()
const content = ref(props.modelValue)

// 监听外部值变化
watch(
  () => props.modelValue,
  val => {
    if (val !== content.value) {
      content.value = val
    }
  },
)

// 监听内部值变化
watch(content, val => {
  emit('update:modelValue', val)
  emit('change', val)
})

const editorOptions = computed(() => ({
  placeholder: props.placeholder,
  theme: 'snow',
  modules: {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
        ['blockquote', 'code-block'], // 引用  代码块
        [{ header: 1 }, { header: 2 }], // 1、2 级标题
        [{ list: 'ordered' }, { list: 'bullet' }], // 有序、无序列表
        [{ script: 'sub' }, { script: 'super' }], // 上标/下标
        [{ indent: '-1' }, { indent: '+1' }], // 缩进
        [{ size: ['small', false, 'large', 'huge'] }], // 字体大小
        [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题
        [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
        [{ font: [] }], // 字体种类
        [{ align: [] }], // 对齐方式
        ['clean'], // 清除文本格式
        ['link', 'image', 'video'], // 链接、图片、视频
      ],
      handlers: {
        image: function () {
          // 自定义图片上传处理
          const input = document.createElement('input')
          input.setAttribute('type', 'file')
          input.setAttribute('accept', 'image/jpeg,image/jpg,image/png,image/webp')
          input.click()

          input.onchange = async () => {
            const file = input.files?.[0]
            if (!file) return

            // 检查文件大小（5MB）
            if (file.size > 5 * 1024 * 1024) {
              ElMessage.error('图片大小不能超过5MB')
              return
            }

            // 上传图片
            try {
              const formData = new FormData()
              formData.append('file', file)

              const token = storage.get('Token') || ''
              const response = await http.post(API_ENDPOINTS.FILE.UPLOAD, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  token,
                },
              })

              if (response.data.code === 0 && response.data.data) {
                const imageUrl = response.data.data.url || response.data.data
                const quill = quillEditorRef.value?.getQuill()
                if (quill) {
                  const range = quill.getSelection(true)
                  quill.insertEmbed(range.index, 'image', imageUrl)
                  quill.setSelection(range.index + 1)
                }
                ElMessage.success('图片上传成功')
              } else {
                ElMessage.error(response.data.msg || '图片上传失败')
              }
            } catch (error: any) {
              ElMessage.error(error.message || '图片上传失败')
            }
          }
        },
      },
    },
  },
}))

// 内容验证和清理
function sanitizeContent(html: string): string {
  if (!html) return ''
  
  // 使用DOMPurify清理HTML内容，防止XSS攻击
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
      'a', 'img', 'video', 'iframe',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'width', 'height', 'class', 'style',
      'target', 'rel', 'frameborder', 'allowfullscreen',
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  })
  
  return cleanHtml
}

// 内容长度验证
function validateContentLength(html: string): boolean {
  // 移除HTML标签，只计算纯文本长度
  const textContent = html.replace(/<[^>]*>/g, '')
  const maxLength = 10000 // 最大10000字符
  
  if (textContent.length > maxLength) {
    ElMessage.warning(`内容长度不能超过${maxLength}个字符`)
    return false
  }
  
  return true
}

const handleChange = (value: string) => {
  // 验证内容长度
  if (!validateContentLength(value)) {
    return
  }
  
  // 清理内容
  const sanitized = sanitizeContent(value)
  content.value = sanitized
}

// 暴露方法
defineExpose({
  getContent: () => 
    // 返回清理后的内容
     sanitizeContent(content.value)
  ,
  setContent: (html: string) => {
    // 设置内容时自动清理
    content.value = sanitizeContent(html)
  },
  clear: () => {
    content.value = ''
  },
  validate: () => 
    // 验证内容
     validateContentLength(content.value)
  ,
})
</script>

<style scoped lang="scss">
.rich-text-editor {
  :deep(.ql-container) {
    min-height: v-bind('minHeight');
    max-height: v-bind('maxHeight');
    overflow-y: auto;
    border-bottom: 1px solid #dcdfe6;
    border-left: 1px solid #dcdfe6;
    border-right: 1px solid #dcdfe6;
    border-top: none;
    border-radius: 0 0 4px 4px;
  }

  :deep(.ql-editor) {
    min-height: v-bind('minHeight');
  }

  :deep(.ql-toolbar) {
    border-top: 1px solid #dcdfe6;
    border-left: 1px solid #dcdfe6;
    border-right: 1px solid #dcdfe6;
    border-bottom: none;
    border-radius: 4px 4px 0 0;
  }
}
</style>
