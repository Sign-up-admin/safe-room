<template>
  <component
    :is="tag"
    class="tech-card"
    :class="[
      `tech-card--variant-${variant}`,
      {
        'tech-card--interactive': interactive,
        'tech-card--borderless': borderless,
        'tech-card--ghost': ghost,
      },
    ]"
    :style="{
      '--tech-card-padding': padding,
    }"
  >
    <header v-if="hasHeader" class="tech-card__header">
      <div class="tech-card__heading">
        <p v-if="eyebrow" class="tech-card__eyebrow">{{ eyebrow }}</p>
        <div class="tech-card__title-wrap">
          <slot name="icon" />
          <div>
            <h3 v-if="title" class="tech-card__title">{{ title }}</h3>
            <p v-if="subtitle" class="tech-card__subtitle">{{ subtitle }}</p>
          </div>
        </div>
      </div>
      <div v-if="$slots.actions" class="tech-card__actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="tech-card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="tech-card__footer">
      <slot name="footer" />
    </footer>
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

type Variant = 'solid' | 'layered' | 'minimal'

const props = withDefaults(
  defineProps<{
    as?: keyof HTMLElementTagNameMap
    title?: string
    subtitle?: string
    eyebrow?: string
    variant?: Variant
    padding?: string
    interactive?: boolean
    borderless?: boolean
    ghost?: boolean
  }>(),
  {
    as: 'section',
    variant: 'solid',
    padding: '32px',
    interactive: true,
    borderless: false,
    ghost: false,
  },
)

const slots = useSlots()
const tag = computed(() => props.as)
const hasHeader = computed(() => !!(props.title || props.subtitle || props.eyebrow || slots.icon || slots.actions))
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.tech-card {
  @include glass-card();
  padding: var(--tech-card-padding, 32px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: transform $transition-base, box-shadow $transition-base, border-color $transition-base;

  &--variant-layered {
    background: linear-gradient(160deg, rgba(253, 216, 53, 0.08), rgba(10, 10, 10, 0.92));
  }

  &--variant-minimal {
    background: $color-panel-ghost;
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: none;
  }

  &--interactive {
    @include hover-glow();
  }

  &--borderless {
    border-color: transparent;
  }

  &--ghost {
    background: rgba(255, 255, 255, 0.02);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: flex-start;
  }

  &__heading {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__title-wrap {
    display: flex;
    gap: 12px;
    align-items: center;

    :slotted(svg) {
      width: 32px;
      height: 32px;
      color: $color-yellow;
    }
  }

  &__title {
    margin: 0;
    font-size: clamp(1.4rem, 2vw, 1.8rem);
  }

  &__subtitle {
    margin: 4px 0 0;
    color: $color-text-secondary;
    font-size: 0.95rem;
  }

  &__eyebrow {
    @include section-eyebrow;
    margin: 0;
  }

  &__actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__footer {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 16px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
}
</style>

