<template>
  <button class="payment-method" :class="{ 'payment-method--active': active, 'payment-method--hovered': isHovered }" @click="$emit('select', method.id)" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="payment-method__icon">
      <img :src="method.icon" :alt="method.name" loading="lazy" />
    </div>
    <div class="payment-method__content">
      <header>
        <h4>{{ method.name }}</h4>
        <span>{{ method.channel }}</span>
      </header>
      <p>{{ method.description }}</p>
      <small>{{ method.extra }}</small>
    </div>
    <div class="payment-method__fee-info">
      <span class="payment-method__fee">{{ method.fee }}</span>
      <div v-if="isHovered" class="payment-method__details">
        <div class="detail-item">
          <span class="detail-label">到账时间：</span>
          <span class="detail-value">{{ method.arrivalTime || '实时' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">单笔限额：</span>
          <span class="detail-value">{{ method.limit || '无限制' }}</span>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface PaymentMethod {
  id: string
  name: string
  channel: string
  description: string
  extra?: string
  fee: string
  icon: string
  arrivalTime?: string
  limit?: string
}

defineProps<{
  method: PaymentMethod
  active?: boolean
}>()

defineEmits<{
  (e: 'select', id: string): void
}>()

const isHovered = ref(false)
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.payment-method {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  gap: 16px;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.3s ease;
  color: $color-text-primary;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(253, 216, 53, 0.4);
    box-shadow: 0 8px 25px rgba(253, 216, 53, 0.15);
    background: rgba(253, 216, 53, 0.05);
  }

  &--active {
    border-color: rgba(253, 216, 53, 0.8);
    box-shadow: $shadow-glow;
    background: rgba(253, 216, 53, 0.08);
  }

  &--hovered {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(253, 216, 53, 0.1), transparent);
      animation: shimmer 0.6s ease-in-out;
    }
  }
}

.payment-method__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;

  img {
    width: 32px;
    height: 32px;
  }
}

.payment-method__content {
  flex: 1;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    h4 {
      margin: 0;
      letter-spacing: 0.08em;
    }

    span {
      color: $color-text-secondary;
      font-size: 0.85rem;
    }
  }

  p {
    margin: 0;
  }

  small {
    color: $color-text-secondary;
  }
}

.payment-method__fee-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 80px;
}

.payment-method__fee {
  font-weight: 600;
  letter-spacing: 0.1em;
  color: $color-yellow;
}

.payment-method__details {
  background: rgba(253, 216, 53, 0.1);
  border: 1px solid rgba(253, 216, 53, 0.3);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 0.8rem;
  opacity: 0;
  transform: translateY(10px);
  animation: slideIn 0.3s ease-out forwards;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.detail-value {
  color: $color-text-primary;
  font-weight: 600;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

