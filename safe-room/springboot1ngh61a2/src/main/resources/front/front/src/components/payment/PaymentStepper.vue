<template>
  <ol class="payment-stepper">
    <li
      v-for="(step, index) in steps"
      :key="step.label"
      class="payment-stepper__item"
      :class="[`payment-stepper__item--${statusFor(index)}`]"
    >
      <span class="payment-stepper__index">{{ index + 1 }}</span>
      <div>
        <p class="payment-stepper__label">{{ step.label }}</p>
        <small>{{ step.description }}</small>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
interface StepItem {
  label: string
  description?: string
}

const props = withDefaults(
  defineProps<{
    steps: StepItem[]
    current?: number
  }>(),
  {
    current: 1,
    steps: () => [],
  },
)

function statusFor(index: number) {
  if (index + 1 < props.current) return 'done'
  if (index + 1 === props.current) return 'current'
  return 'upcoming'
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.payment-stepper {
  list-style: none;
  display: flex;
  gap: 18px;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;

  // 移动端优化
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    max-width: 100%;
  }
}

.payment-stepper__item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 18px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  background: rgba(0, 0, 0, 0.6);
  transition: all 0.3s ease;

  small {
    color: rgba(255, 255, 255, 0.6);
  }

  // 移动端优化
  @media (max-width: 768px) {
    padding: 16px 20px;
    border-radius: 16px;
    gap: 16px;

    // 触摸设备上的更大触摸目标
    @media (hover: none) and (pointer: coarse) {
      padding: 20px;
      margin: 4px 0;
    }
  }

  &--done {
    border-color: rgba(253, 216, 53, 0.8);
    background: linear-gradient(135deg, rgba(253, 216, 53, 0.1), rgba(0, 0, 0, 0.7));
    box-shadow: 0 0 20px rgba(253, 216, 53, 0.3);
  }

  &--current {
    border-color: #fdd835;
    background: linear-gradient(135deg, rgba(253, 216, 53, 0.2), rgba(0, 0, 0, 0.8));
    box-shadow:
      0 0 30px rgba(253, 216, 53, 0.5),
      0 0 60px rgba(253, 216, 53, 0.2);
    animation: glow 2s ease-in-out infinite alternate;
  }

  &--upcoming {
    opacity: 0.7;
  }
}

.payment-stepper__index {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(253, 216, 53, 0.3);
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: #fdd835;
  transition: all 0.3s ease;

  .payment-stepper__item--current & {
    background: linear-gradient(135deg, #fdd835, #ffb300);
    border-color: #fdd835;
    box-shadow: 0 0 15px rgba(253, 216, 53, 0.6);
    color: #000;
  }

  .payment-stepper__item--done & {
    background: linear-gradient(135deg, #fdd835, #ffb300);
    border-color: rgba(253, 216, 53, 0.8);
    color: #000;
  }
}

.payment-stepper__label {
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.9);
  transition: color 0.3s ease;

  .payment-stepper__item--current & {
    color: #fdd835;
  }
}

@keyframes glow {
  from {
    box-shadow:
      0 0 30px rgba(253, 216, 53, 0.5),
      0 0 60px rgba(253, 216, 53, 0.2);
  }
  to {
    box-shadow:
      0 0 40px rgba(253, 216, 53, 0.7),
      0 0 80px rgba(253, 216, 53, 0.3);
  }
}
</style>
