<template>
  <div class="mobile-payment-confirm">
    <div class="payment-header">
      <div class="payment-amount">
        <small>支付金额</small>
        <strong>¥{{ formatCurrency(amount) }}</strong>
      </div>
      <div class="payment-method">
        <span class="method-icon">{{ methodIcon }}</span>
        <span>{{ methodName }}</span>
      </div>
    </div>

    <div class="payment-details">
      <div class="detail-row">
        <span>商品名称</span>
        <span>{{ productName }}</span>
      </div>
      <div class="detail-row">
        <span>商品数量</span>
        <span>{{ quantity }}</span>
      </div>
      <div class="detail-row" v-if="discount > 0">
        <span>优惠金额</span>
        <span class="discount">-¥{{ formatCurrency(discount) }}</span>
      </div>
      <div class="detail-row total">
        <span>实付金额</span>
        <strong>¥{{ formatCurrency(amount) }}</strong>
      </div>
    </div>

    <div class="payment-actions">
      <button
        class="payment-btn payment-btn--primary"
        @click="$emit('confirm')"
        :disabled="loading"
      >
        <span v-if="loading">处理中...</span>
        <span v-else>确认支付</span>
      </button>
      <button
        class="payment-btn payment-btn--secondary"
        @click="$emit('cancel')"
        :disabled="loading"
      >
        取消支付
      </button>
    </div>

    <!-- 安全提示 -->
    <div class="security-notice">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-9-5z" stroke="currentColor" stroke-width="2"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>支付过程安全加密，保护您的隐私和资金安全</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '@/utils/formatters'

interface Props {
  amount: number
  productName: string
  quantity: number
  discount?: number
  methodName?: string
  methodIcon?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  discount: 0,
  methodName: '支付宝',
  methodIcon: '💳',
  loading: false,
})

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.mobile-payment-confirm {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  max-width: 100%;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.payment-amount {
  display: flex;
  flex-direction: column;
  gap: 4px;

  small {
    color: $color-text-secondary;
    font-size: 0.875rem;
  }

  strong {
    font-size: 1.5rem;
    color: $color-yellow;
    font-weight: 700;
  }
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(74, 144, 226, 0.2);

  .method-icon {
    font-size: 1.2rem;
  }

  span {
    color: #4a90e2;
    font-weight: 500;
  }
}

.payment-details {
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 0.9rem;

  &:not(.total) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  &.total {
    border-top: 2px solid rgba(253, 216, 53, 0.3);
    padding-top: 12px;
    margin-top: 8px;
    font-weight: 600;

    strong {
      color: $color-yellow;
      font-size: 1.1rem;
    }
  }

  .discount {
    color: rgba(76, 175, 80, 0.8);
  }
}

.payment-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.payment-btn {
  height: 48px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--primary {
    background: linear-gradient(135deg, #fdd835, #ffb300);
    color: rgba(0, 0, 0, 0.8);
    box-shadow: 0 4px 15px rgba(253, 216, 53, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(253, 216, 53, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &--secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: $color-text-primary;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
}

.security-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(76, 175, 80, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  font-size: 0.8rem;
  color: rgba(76, 175, 80, 0.8);

  svg {
    flex-shrink: 0;
    color: #4caf50;
  }
}

// 移动端特殊优化
@media (max-width: 640px) {
  .mobile-payment-confirm {
    margin: 0 -16px;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .payment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .payment-amount strong {
    font-size: 1.8rem;
  }

  .payment-btn {
    height: 52px;
    font-size: 17px; // 防止iOS缩放
  }
}

// 触摸设备优化
@media (hover: none) and (pointer: coarse) {
  .payment-btn {
    min-height: 48px; // 确保触摸目标足够大
  }

  .detail-row {
    padding: 12px 0; // 更大的点击区域
  }
}
</style>
