<template>
  <component
    :is="componentTag"
    class="tech-button"
    :class="[
      `tech-button--${variant}`,
      `tech-button--${size}`,
      { 'tech-button--block': block, 'tech-button--loading': loading },
    ]"
    :disabled="disabled || loading"
    v-bind="restAttrs"
  >
    <span v-if="loading" class="tech-button__spinner" aria-hidden="true"></span>
    <slot name="icon" />
    <span class="tech-button__label">
      <slot />
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

type Variant = 'primary' | 'outline' | 'ghost' | 'text'
type Size = 'md' | 'lg' | 'sm'

const props = withDefaults(
  defineProps<{
    as?: keyof HTMLElementTagNameMap
    variant?: Variant
    size?: Size
    block?: boolean
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    as: 'button',
    variant: 'primary',
    size: 'md',
    block: false,
    loading: false,
    disabled: false,
  },
)

const attrs = useAttrs()
const componentTag = computed(() => props.as)
const restAttrs = computed(() => ({
  type: props.as === 'button' ? 'button' : undefined,
  ...attrs,
}))
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.tech-button {
  @include yellow-button(false, 48px);
  border: none;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 0.85rem;
  position: relative;
  overflow: hidden;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  &--outline {
    @include yellow-button(true, 48px);
    background: transparent;
    color: $color-yellow;
  }

  &--ghost {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: $color-text-primary;
  }

  &--text {
    background: transparent;
    border: none;
    color: $color-yellow;
    box-shadow: none;
    padding: 0;
    height: auto;
    letter-spacing: 0.1em;

    &:hover {
      transform: none;
      text-decoration: underline;
    }
  }

  &--lg {
    height: 56px;
    padding: 0 40px;
    font-size: 0.95rem;
  }

  &--sm {
    height: 40px;
    padding: 0 20px;
    font-size: 0.78rem;
  }

  &--block {
    width: 100%;
    justify-content: center;
  }

  &__spinner {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(0, 0, 0, 0.3);
    border-top-color: #0a0a0a;
    animation: spin 0.75s linear infinite;
  }

  &--loading {
    pointer-events: none;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

