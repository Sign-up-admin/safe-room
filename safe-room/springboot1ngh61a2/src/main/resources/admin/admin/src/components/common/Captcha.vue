<template>
  <div class="captcha-container">
    <div
      ref="captchaRef"
      class="captcha-code"
      :style="{
        width: width,
        height: height,
        fontSize: fontSize,
        backgroundColor: backgroundColor,
      }"
      @click="refreshCode"
    >
      {{ displayCode }}
    </div>
    <div class="captcha-actions">
      <el-button text size="small" class="refresh-btn" @click="refreshCode">
        <el-icon><RefreshRight /></el-icon>
        换一张
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'

interface Props {
  width?: string
  height?: string
  fontSize?: string
  backgroundColor?: string
  length?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: '120px',
  height: '40px',
  fontSize: '20px',
  backgroundColor: '#f5f5f5',
  length: 4,
})

const captchaRef = ref<HTMLDivElement>()
const code = ref('')

// 生成随机验证码
const generateCode = () => {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  let result = ''
  for (let i = 0; i < props.length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 刷新验证码
const refreshCode = () => {
  code.value = generateCode()
}

// 显示的验证码（带干扰效果）
const displayCode = computed(() => code.value.split('').join(' '))

// 验证验证码
const validateCode = (inputCode: string): boolean => inputCode.toLowerCase() === code.value.toLowerCase()

// 获取当前验证码
const getCode = (): string => code.value

onMounted(() => {
  refreshCode()
})

// 暴露方法给父组件
defineExpose({
  refreshCode,
  validateCode,
  getCode,
})
</script>

<style scoped lang="scss">
.captcha-container {
  display: flex;
  align-items: center;
  gap: 12px;

  .captcha-code {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    color: #303133;
    letter-spacing: 2px;
    background-image:
      linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%);
    background-size: 4px 4px;
    background-position:
      0 0,
      0 2px,
      2px -2px,
      -2px 0;
    transition: all 0.3s ease;

    &:hover {
      border-color: #c0c4cc;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .captcha-actions {
    .refresh-btn {
      color: #606266;
      font-size: 14px;

      &:hover {
        color: #409eff;
      }

      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

// 响应式设计
@media (width <= 480px) {
  .captcha-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    .captcha-actions {
      align-self: flex-end;
    }
  }
}
</style>
