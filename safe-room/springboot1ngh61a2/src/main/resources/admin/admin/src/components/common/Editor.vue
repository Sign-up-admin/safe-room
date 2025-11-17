<template>
  <div>
    <!-- 图片上传组件辅助 -->
    <el-upload
      ref="uploadRef"
      class="avatar-uploader"
      :action="getActionUrl"
      name="file"
      :headers="header"
      :show-file-list="false"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      :before-upload="beforeUpload"
      style="display: none"
    ></el-upload>

    <QuillEditor
      ref="quillEditorRef"
      v-model:content="content"
      content-type="html"
      :options="editorOption"
      @blur="onEditorBlur"
      @focus="onEditorFocus"
      @update:content="onEditorChange"
    />
  </div>
</template>

<script setup lang="ts" name="Editor">
import { ref, computed, watch, getCurrentInstance } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { useUserStore } from '@/stores/user'

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  action: 'file/upload',
  maxSize: 4000,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 工具栏配置
const toolbarOptions = [
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
]

interface Props {
  modelValue: string
  action?: string
  maxSize?: number
}

const instance = getCurrentInstance()
const uploadRef = ref()
const quillEditorRef = ref()
const content = ref(props.modelValue)
const quillUpdateImg = ref(false)
const userStore = useUserStore()

const header = computed(() => ({
  Token: userStore.token,
}))

const getActionUrl = computed(() => {
  const base = (instance?.appContext.config.globalProperties['$base'] as any) || {}
  return `/${base.name || 'springboot1ngh61a2'}/${props.action}`
})

const editorOption = {
  placeholder: '',
  theme: 'snow',
  modules: {
    toolbar: {
      container: toolbarOptions,
      handlers: {
        image: function () {
          // Use the upload component ref instead of document.querySelector
          if (uploadRef.value) {
            const uploadComponent = uploadRef.value as any
            // Access the internal input element through the upload component
            const inputEl = uploadComponent.$el?.querySelector('input[type="file"]')
            if (inputEl) {
              inputEl.click()
            }
          }
        },
      },
    },
  },
}

watch(
  () => props.modelValue,
  newVal => {
    content.value = newVal
  },
)

watch(content, newVal => {
  emit('update:modelValue', newVal)
})

const onEditorBlur = () => {
  // 失去焦点事件
}

const onEditorFocus = () => {
  // 获得焦点事件
}

const onEditorChange = () => {
  // 内容改变事件
  emit('update:modelValue', content.value)
}

const beforeUpload: UploadProps['beforeUpload'] = () => {
  quillUpdateImg.value = true
  return true
}

const uploadSuccess = (res: any) => {
  // @vueup/vue-quill: access quill instance via ref
  const quillEditor = quillEditorRef.value
  if (!quillEditor) {
    quillUpdateImg.value = false
    ElMessage.error('编辑器未初始化')
    return
  }

  // Get quill instance - the ref exposes the quill instance directly
  const quill = (quillEditor as any).getQuill?.() || (quillEditor as any).quill
  if (quill && res.code === 0) {
    const length = quill.getSelection()?.index || 0
    const base = (instance?.appContext.config.globalProperties['$base'] as any) || {}
    const baseUrl = base.url || 'http://localhost:8080/springboot1ngh61a2/'
    quill.insertEmbed(length, 'image', baseUrl + 'upload/' + res.file)
    quill.setSelection(length + 1)
  } else {
    ElMessage.error('图片插入失败')
  }
  quillUpdateImg.value = false
}

const uploadError = () => {
  quillUpdateImg.value = false
  ElMessage.error('图片插入失败')
}
</script>

<style>
.editor {
  line-height: normal !important;
}
.ql-snow .ql-tooltip[data-mode='link']::before {
  content: 'Please enter link address:';
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0;
  content: 'Save';
  padding-right: 0;
}

.ql-snow .ql-tooltip[data-mode='video']::before {
  content: 'Please enter video address:';
}
.ql-container {
  height: 400px;
}

.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: '14px';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='small']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='small']::before {
  content: '10px';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='large']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='large']::before {
  content: '18px';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='huge']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='huge']::before {
  content: '32px';
}

.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: '文本';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='1']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before {
  content: '标题1';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='2']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before {
  content: '标题2';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='3']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before {
  content: '标题3';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='4']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before {
  content: '标题4';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='5']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before {
  content: '标题5';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='6']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='6']::before {
  content: '标题6';
}

.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: '标准字体';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value='serif']::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value='serif']::before {
  content: '衬线字体';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value='monospace']::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value='monospace']::before {
  content: '等宽字体';
}
</style>
