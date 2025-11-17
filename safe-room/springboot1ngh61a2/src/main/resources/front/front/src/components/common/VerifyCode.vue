<template>
  <div class="verify-code-panel">
    <div
      class="verify-code"
      :style="codeStyle"
      @click="refreshCode"
    >
      <span
        v-for="(char, index) in displayCode"
        :key="index"
        :style="getCharStyle(index)"
      >
        {{ char }}
      </span>
    </div>
    <div class="verify-code-area">
      <div class="verify-input-area">
        <input
          v-model="inputValue"
          type="text"
          class="verify-input-code"
          :placeholder="placeholder"
          @keyup.enter="checkCode"
        />
      </div>
      <div class="verify-change-area">
        <a class="verify-change-code" @click="refreshCode">换一张</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

// Props
interface Props {
  type?: number
  codeLength?: number
  width?: string
  height?: string
  fontSize?: string
  placeholder?: string
  autoFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 1,
  codeLength: 6,
  width: '200px',
  height: '60px',
  fontSize: '30px',
  placeholder: '请输入验证码',
  autoFocus: false
})

// Emits
const emit = defineEmits<{
  ready: []
  success: []
  error: []
}>()

// Refs
const inputValue = ref('')
const codeChars = ref('')
const displayCode = ref<string[]>([])

// Constants
const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const bgColors = ['#fffff0', '#f0ffff', '#f0fff0', '#fff0f0']
const textColors = ['#FF0033', '#006699', '#993366', '#FF9900', '#66CC66', '#FF33CC']

// Computed
const codeStyle = computed(() => ({
  width: props.width,
  height: props.height,
  lineHeight: props.height,
  fontSize: props.fontSize,
  backgroundColor: bgColors[Math.floor(Math.random() * bgColors.length)],
  color: textColors[Math.floor(Math.random() * textColors.length)]
}))

// Methods
function generateCode() {
  let code = ''
  for (let i = 0; i < props.codeLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  codeChars.value = code
  generateDisplayCode()
}

function generateDisplayCode() {
  displayCode.value = codeChars.value.split('')
}

function getCharStyle(index: number) {
  const styles: Record<string, string> = {}

  // Random italic
  if (index % 2 === 0) {
    styles.fontStyle = 'italic'
    styles.marginRight = '10px'
  } else {
    styles.fontWeight = 'bolder'
  }

  // Random additional bold
  if (Math.floor(Math.random() * 2) === 1) {
    styles.fontWeight = 'bolder'
  }

  return styles
}

function refreshCode() {
  generateCode()
  inputValue.value = ''
}

function checkCode() {
  const userInput = inputValue.value.toUpperCase()
  const correctCode = codeChars.value.toUpperCase()

  if (userInput === correctCode) {
    emit('success')
  } else {
    emit('error')
    refreshCode()
  }
}

// Expose methods
defineExpose({
  refreshCode,
  checkCode,
  getCode: () => codeChars.value
})

// Lifecycle
onMounted(() => {
  generateCode()
  emit('ready')
})

// Watch for prop changes
watch(() => props.codeLength, () => {
  generateCode()
})
</script>

<style scoped>
.verify-code-panel {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.verify-code {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.verify-code:hover {
  border-color: #409eff;
}

.verify-code-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.verify-input-area {
  flex: 1;
}

.verify-input-code {
  width: 100%;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s ease;
}

.verify-input-code:focus {
  border-color: #409eff;
}

.verify-change-code {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}

.verify-change-code:hover {
  text-decoration: underline;
}
</style>
