<template>
  <ol ref="stepperRef" class="tech-stepper" :class="[`tech-stepper--${orientation}`]">
    <li
      v-for="(step, index) in steps"
      :key="step.key ?? index"
      :ref="el => setStepRef(el, index)"
      class="tech-stepper__item"
      :class="`tech-stepper__item--${statusFor(index)}`"
    >
      <div class="tech-stepper__indicator">
        <span v-if="step.icon" class="tech-stepper__icon">
          <component :is="step.icon" />
        </span>
        <span v-else>{{ index + 1 }}</span>
        <span class="tech-stepper__progress" />
      </div>
      <div class="tech-stepper__content">
        <p class="tech-stepper__label">{{ step.label }}</p>
        <p v-if="step.description" class="tech-stepper__description">
          {{ step.description }}
        </p>
        <button v-if="step.cta" class="tech-stepper__cta" type="button" @click="step.cta?.()">
          {{ step.ctaLabel ?? '查看详情' }}
        </button>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useStepTransition } from '@/composables/useStepTransition'

type StepStatus = 'upcoming' | 'current' | 'completed'

interface StepItem {
  key?: string | number
  label: string
  description?: string
  status?: StepStatus
  icon?: string | object
  cta?: () => void
  ctaLabel?: string
}

const props = withDefaults(
  defineProps<{
    steps: StepItem[]
    current?: number
    orientation?: 'horizontal' | 'vertical'
  }>(),
  {
    current: 0,
    orientation: 'horizontal',
  },
)

const stepperRef = ref<HTMLElement>()
const stepRefs = ref<(HTMLElement | null)[]>([])
const previousStep = ref(props.current)

const { transition, highlightStep, resetGlow } = useStepTransition()

const setStepRef = (el: unknown, index: number) => {
  if (el) {
    stepRefs.value[index] = el as HTMLElement
  } else {
    stepRefs.value[index] = null
  }
}

const statusFor = (index: number): StepStatus => {
  const manualStatus = props.steps[index]?.status
  if (manualStatus) return manualStatus
  if (index < props.current) return 'completed'
  if (index === props.current) return 'current'
  return 'upcoming'
}

watch(
  () => props.current,
  async (newStep, oldStep) => {
    if (oldStep !== undefined && newStep !== oldStep) {
      await nextTick()
      const stepElements = stepRefs.value.filter(Boolean) as HTMLElement[]
      if (stepElements.length > 0) {
        await transition(oldStep, newStep, stepElements)
      }
      previousStep.value = newStep
    }
  },
)

onMounted(async () => {
  await nextTick()
  const stepElements = stepRefs.value.filter(Boolean) as HTMLElement[]
  if (stepElements.length > 0 && props.current >= 0) {
    highlightStep(props.current, stepElements)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.tech-stepper {
  list-style: none;
  display: flex;
  gap: 24px;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;

  &--vertical {
    flex-direction: column;
    gap: 18px;
  }

  &__item {
    display: flex;
    gap: 16px;
    padding: 16px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.08);

    &:first-of-type {
      border-top: none;
    }
  }

  &__indicator {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: grid;
    place-items: center;
    position: relative;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: $color-text-secondary;
    background: rgba(255, 255, 255, 0.02);
    overflow: hidden;
  }

  &__progress {
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, rgba(253, 216, 53, 0.2), rgba(253, 216, 53, 0.05));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.45s ease;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: min(320px, 60vw);
  }

  &__label {
    margin: 0;
    font-size: 1rem;
    letter-spacing: 0.08em;
  }

  &__description {
    margin: 0;
    color: $color-text-secondary;
    font-size: 0.9rem;
  }

  &__cta {
    background: none;
    border: none;
    color: $color-yellow;
    font-size: 0.85rem;
    padding: 0;
    text-align: left;
    cursor: pointer;
  }

  &__item--completed {
    .tech-stepper__indicator {
      border-color: $color-yellow;
      color: $color-bg-dark;
      background: linear-gradient(120deg, #fdd835, #f6c300);
      box-shadow: $shadow-glow;
    }

    .tech-stepper__progress {
      transform: scaleX(1);
    }
  }

  &__item--current {
    .tech-stepper__indicator {
      border-color: rgba(253, 216, 53, 0.55);
      color: $color-yellow;
      transition: all 0.3s ease;
    }

    .tech-stepper__progress {
      transform: scaleX(0.65);
    }
  }

  &__item {
    transition: transform 0.3s ease;
  }

  &__indicator {
    transition: all 0.3s ease;
    will-change: transform, box-shadow;
  }
}

@media (max-width: 768px) {
  .tech-stepper {
    gap: 16px;
  }

  .tech-stepper__item {
    padding: 12px 0;
    gap: 12px;
  }

  .tech-stepper__indicator {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  .tech-stepper__content {
    max-width: 100%;
  }

  .tech-stepper__label {
    font-size: 0.9rem;
  }

  .tech-stepper__description {
    font-size: 0.85rem;
  }
}

@media (max-width: 640px) {
  .tech-stepper {
    flex-direction: column;
    gap: 12px;
  }

  .tech-stepper__item {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 10px 0;
  }

  .tech-stepper__indicator {
    width: 32px;
    height: 32px;
    font-size: 0.85rem;
  }
}
</style>
