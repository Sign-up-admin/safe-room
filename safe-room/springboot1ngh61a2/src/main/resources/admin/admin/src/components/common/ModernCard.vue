<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  elevated?: boolean
  outlined?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  elevated: false,
  outlined: false
})

const cardClasses = computed(() => [
  'modern-card',
  {
    'modern-card--elevated': props.elevated,
    'modern-card--outlined': props.outlined
  }
])
</script>

<style scoped lang="scss">
@import '@/styles/mixins';

.modern-card {
  @include card();
  display: flex;
  flex-direction: column;
}

.modern-card--elevated {
  box-shadow: var(--shadow-xl);
}

.modern-card--outlined {
  background: transparent;
  backdrop-filter: none;
  border: 2px solid var(--color-border-medium);
}

.card-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
}

.card-title {
  font-size: var(--font-size-display-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.card-body {
  flex: 1;
}

.card-footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-light);
}
</style>



