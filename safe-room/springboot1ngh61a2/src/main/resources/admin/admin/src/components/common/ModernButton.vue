<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <el-icon v-if="loading" class="loading-icon"><Loading /></el-icon>
    <el-icon v-else-if="icon" class="button-icon"
      ><component :is="icon"
    /></el-icon>
    <span v-if="$slots.default || text" class="button-text">
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Loading } from "@element-plus/icons-vue";

interface Props {
  type?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: any;
  loading?: boolean;
  disabled?: boolean;
  text?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "primary",
  size: "md",
  loading: false,
  disabled: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => [
  "modern-button",
  `modern-button--${props.type}`,
  `modern-button--${props.size}`,
]);

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit("click", event);
  }
};
</script>

<style scoped lang="scss">
@import "@/styles/mixins";

.modern-button {
  @include button-base();
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: none;
  cursor: pointer;
  transition: all var(--duration-200) var(--ease-in-out);

  .loading-icon {
    animation: spin 1s linear infinite;
  }

  .button-icon {
    flex-shrink: 0;
  }

  .button-text {
    white-space: nowrap;
  }
}

// 尺寸变体
.modern-button--sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-body-sm);
  min-height: 36px;
  border-radius: var(--radius-lg);
}

.modern-button--md {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-body-md);
  min-height: 44px;
  border-radius: var(--radius-xl);
}

.modern-button--lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--font-size-body-lg);
  min-height: 52px;
  border-radius: var(--radius-xl);
}

// 类型变体
.modern-button--primary {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-primary-sm);

  &:hover:not(:disabled) {
    box-shadow: var(--shadow-primary-sm);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

.modern-button--secondary {
  @include glassmorphism(0.7, 8px);
  color: var(--color-text-primary);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-sm);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: var(--shadow-md);
  }
}

.modern-button--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid transparent;

  &:hover:not(:disabled) {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }
}

.modern-button--danger {
  background: var(--gradient-danger);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-danger-sm);

  &:hover:not(:disabled) {
    box-shadow: var(--shadow-danger-sm);
    transform: translateY(-2px);
  }
}
</style>
