<template>
  <div class="mobile-form" :class="{ 'mobile-form--loading': loading }">
    <div class="mobile-form__header" v-if="$slots.header">
      <slot name="header" />
    </div>

    <div class="mobile-form__content">
      <slot />
    </div>

    <div class="mobile-form__actions" v-if="$slots.actions">
      <slot name="actions" />
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading" class="mobile-form__skeleton">
      <div class="skeleton-item" v-for="i in 4" :key="i">
        <div class="skeleton-label"></div>
        <div class="skeleton-input"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading?: boolean
  enableTouchKeyboard?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  enableTouchKeyboard: true,
})

// 触摸键盘优化
const handleTouchStart = (e: TouchEvent) => {
  if (props.enableTouchKeyboard) {
    // 防止iOS Safari缩放
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      target.style.fontSize = '16px'
    }
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  // 可以在这里添加其他触摸处理逻辑
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.mobile-form {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;

  &--loading {
    position: relative;
    pointer-events: none;
  }

  &__header {
    padding: 20px 20px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 20px;
  }

  &__content {
    padding: 0 20px;
  }

  &__actions {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin-top: 20px;

    // 移动端按钮堆叠
    display: flex;
    flex-direction: column;
    gap: 12px;

    :deep(.el-button) {
      width: 100%;
      height: 48px; // 更大的触摸目标
      border-radius: 12px;
      font-size: 16px; // 防止iOS缩放
    }
  }

  &__skeleton {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 10, 10, 0.9);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 16px;
  }
}

.skeleton-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-label {
  height: 14px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
  width: 60px;
}

.skeleton-input {
  height: 48px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(255, 255, 255, 0.08) 100%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 12px;
}

@keyframes skeleton-loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

// 移动端输入框优化
:deep(.el-input) {
  .el-input__inner {
    height: 48px;
    border-radius: 12px;
    font-size: 16px; // 防止iOS缩放
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: $color-text-primary;

    &:focus {
      border-color: rgba(253, 216, 53, 0.5);
      box-shadow: 0 0 0 2px rgba(253, 216, 53, 0.1);
    }

    &::placeholder {
      color: $color-text-secondary;
    }
  }
}

:deep(.el-select) {
  .el-select__input {
    height: 48px;

    .el-input__inner {
      height: 48px;
    }
  }
}

:deep(.el-form-item) {
  margin-bottom: 20px;

  .el-form-item__label {
    color: $color-text-primary;
    font-weight: 500;
    margin-bottom: 8px;
    display: block;
  }

  .el-form-item__error {
    margin-top: 4px;
    font-size: 14px;
  }
}

// 触摸优化
@media (hover: none) and (pointer: coarse) {
  .mobile-form {
    // 在触摸设备上增加触摸目标大小
    :deep(button) {
      min-height: 44px; // iOS人机界面指南推荐的最小触摸目标
    }
  }
}

@media (max-width: 640px) {
  .mobile-form {
    border-radius: 12px;

    &__header {
      padding: 16px 16px 0;
    }

    &__content {
      padding: 0 16px;
    }

    &__actions {
      padding: 16px;
      margin-top: 16px;
    }
  }
}
</style>
