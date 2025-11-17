<template>
  <div class="tech-stepper" :class="{ 'tech-stepper--vertical': vertical }">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="tech-stepper__item"
      :class="{
        'tech-stepper__item--active': index === currentStep,
        'tech-stepper__item--completed': index < currentStep,
        'tech-stepper__item--disabled': index > currentStep,
      }"
    >
      <div class="tech-stepper__node">
        <div class="tech-stepper__node-inner">
          <svg v-if="index < currentStep" class="tech-stepper__check" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span v-else class="tech-stepper__number">{{ index + 1 }}</span>
        </div>
        <div v-if="!vertical && index < steps.length - 1" class="tech-stepper__line"></div>
      </div>
      <div class="tech-stepper__content">
        <div class="tech-stepper__title">{{ step.title }}</div>
        <div v-if="step.description" class="tech-stepper__description">{{ step.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface TechStepperStep {
  title: string
  description?: string
}

const props = withDefaults(
  defineProps<{
    steps: TechStepperStep[]
    currentStep?: number
    vertical?: boolean
  }>(),
  {
    currentStep: 0,
    vertical: false,
  },
)
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.tech-stepper {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  position: relative;

  &--vertical {
    flex-direction: column;
    gap: 32px;
  }

  &__item {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    flex: 1;
    position: relative;
    min-width: 0;

    &--disabled {
      opacity: 0.5;
    }
  }

  &__node {
    position: relative;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__node-inner {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.04);
    border: 2px solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all $transition-base;
    position: relative;
    z-index: 2;
  }

  &__number {
    color: $color-text-secondary;
    font-weight: 600;
    font-size: 0.9rem;
  }

  &__check {
    width: 20px;
    height: 20px;
    color: $color-yellow;
  }

  &__line {
    position: absolute;
    top: 20px;
    left: 40px;
    right: -24px;
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
    z-index: 1;
    transition: all $transition-base;
  }

  &__item--active &__node-inner {
    background: rgba(253, 216, 53, 0.15);
    border-color: $color-yellow;
    box-shadow: 0 0 20px rgba(253, 216, 53, 0.3);
  }

  &__item--active &__number {
    color: $color-yellow;
  }

  &__item--completed &__node-inner {
    background: rgba(253, 216, 53, 0.2);
    border-color: $color-yellow;
  }

  &__item--completed &__line {
    background: linear-gradient(90deg, $color-yellow, rgba(253, 216, 53, 0.3));
  }

  &__content {
    flex: 1;
    min-width: 0;
    padding-top: 8px;
  }

  &__title {
    font-weight: 600;
    color: $color-text-primary;
    margin-bottom: 4px;
    font-size: 0.95rem;
  }

  &__item--active &__title {
    color: $color-yellow;
  }

  &__item--disabled &__title {
    color: $color-text-muted;
  }

  &__description {
    font-size: 0.85rem;
    color: $color-text-secondary;
    line-height: 1.5;
  }

  &__item--disabled &__description {
    color: $color-text-muted;
  }
}

@media (max-width: 768px) {
  .tech-stepper {
    flex-direction: column;
    gap: 24px;

    &__line {
      display: none;
    }

    &__item {
      flex-direction: row;
    }
  }
}
</style>
