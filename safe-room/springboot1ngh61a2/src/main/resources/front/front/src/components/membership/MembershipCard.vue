<template>
  <article
    :class="[
      'membership-card',
      {
        'membership-card--active': active,
        'membership-card--featured': featured,
      },
    ]"
    :aria-label="`${card.huiyuankamingcheng}会员卡，价格${formatCurrency(card.jiage)}，有效期${card.youxiaoqi}`"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- 流动发光边框效果 -->
    <div class="membership-card__glow" v-if="active || featured"></div>

    <!-- 卡片主体 -->
    <div class="membership-card__inner">
      <!-- 卡片头部 -->
      <header class="membership-card__header">
        <div class="membership-card__title-section">
          <h3 class="membership-card__title">{{ card.huiyuankamingcheng }}</h3>
          <span class="membership-card__duration">{{ card.youxiaoqi || '12 个月' }}</span>
        </div>

        <!-- 特色标签 -->
        <div v-if="featured" class="membership-card__badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
          </svg>
          推荐
        </div>
      </header>

      <!-- 卡片描述 -->
      <p class="membership-card__description">
        {{ card.shiyongshuoming || '专属训练权益、预约优先' }}
      </p>

      <!-- 权益标签 -->
      <div class="membership-card__benefits">
        <div
          v-for="benefit in displayBenefits"
          :key="benefit.text"
          class="benefit-tag"
          :class="benefit.type"
        >
          <div :class="['benefit-icon', benefit.iconClass]"></div>
          <span>{{ benefit.text }}</span>
        </div>
      </div>

      <!-- 价格区域 -->
      <div class="membership-card__price">
        <div class="price-main">
          <strong class="price-amount">{{ formatCurrency(card.jiage || 0) }}</strong>
          <small class="price-unit">/ {{ card.youxiaoqi || '12 个月' }}</small>
        </div>
        <small class="price-benefits-count">含 {{ displayBenefits.length }} 项权益</small>
      </div>

      <!-- 卡片图片 -->
      <div class="membership-card__image">
        <img
          :src="resolveAssetUrl(card.tupian)"
          :alt="`${card.huiyuankamingcheng}卡片图片`"
          loading="lazy"
        />
        <!-- 装饰性渐变遮罩 -->
        <div class="image-overlay"></div>
      </div>

      <!-- 悬停时的额外信息 -->
      <div class="membership-card__hover-info" v-if="showHoverInfo">
        <div class="hover-benefits">
          <div
            v-for="benefit in displayBenefits.slice(0, 3)"
            :key="benefit.text"
            class="hover-benefit-item"
          >
            <div :class="['hover-benefit-icon', benefit.iconClass]"></div>
            <span>{{ benefit.text }}</span>
          </div>
        </div>
        <TechButton size="sm" variant="outline" class="hover-cta">
          查看详情
        </TechButton>
      </div>
    </div>

    <!-- 实体卡片效果层 -->
    <div class="membership-card__texture"></div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TechButton } from '@/components/common'
import type { Huiyuanka } from '@/types/modules'
import { formatCurrency } from '@/utils/formatters'

// 图标组件 - 临时使用占位符，实际项目中需要正确配置SVG组件导入

interface Props {
  card: Huiyuanka
  active?: boolean
  featured?: boolean
  showHoverInfo?: boolean
}

interface Benefit {
  text: string
  type: string
  iconClass: string
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  featured: false,
  showHoverInfo: false,
})

const emit = defineEmits<{
  select: [card: Huiyuanka]
}>()

// 计算显示的权益
const displayBenefits = computed<Benefit[]>(() => {
  const benefits = deriveBenefits(props.card)
  return benefits.slice(0, 4).map((benefit, index) => ({
    text: benefit,
    type: getBenefitType(benefit),
    iconClass: getBenefitIcon(benefit, index),
  }))
})

// 根据权益内容确定类型
function getBenefitType(benefit: string): string {
  if (benefit.includes('预约') || benefit.includes('优先')) return 'priority'
  if (benefit.includes('私教') || benefit.includes('教练')) return 'trainer'
  if (benefit.includes('设施') || benefit.includes('场地')) return 'facility'
  if (benefit.includes('嘉宾') || benefit.includes('活动')) return 'guest'
  if (benefit.includes('客服') || benefit.includes('顾问')) return 'service'
  return 'default'
}

// 根据权益内容获取图标类名
function getBenefitIcon(benefit: string, index: number): string {
  if (benefit.includes('预约') || benefit.includes('优先')) return 'icon-priority'
  if (benefit.includes('私教') || benefit.includes('教练')) return 'icon-trainer'
  if (benefit.includes('设施') || benefit.includes('场地')) return 'icon-facility'
  if (benefit.includes('嘉宾') || benefit.includes('活动')) return 'icon-guest'
  if (benefit.includes('客服') || benefit.includes('顾问')) return 'icon-service'

  // 默认图标循环
  const defaultIcons = ['icon-calendar', 'icon-trainer', 'icon-facility', 'icon-guest']
  return defaultIcons[index % defaultIcons.length]
}

// 从卡片数据中提取权益
function deriveBenefits(card: Huiyuanka): string[] {
  const text = card.shiyongshuoming || card.huiyuankaxiangqing || ''
  const segments = text.split(/[\n、。,，]/).map(item => item.trim()).filter(Boolean)
  if (segments.length) return segments.slice(0, 6)

  // 默认权益
  return [
    '课程预约优先 72h',
    '私教单次 9 折',
    '智能体测 1 次/月',
    '专属客服顾问',
    '限定活动优先',
    '嘉宾权益 2 次',
  ]
}

function resolveAssetUrl(path?: string): string {
  if (!path) return new URL('@/assets/jianshe.png', import.meta.url).href
  if (/^https?:\/\//i.test(path)) return path
  const base = import.meta.env.VITE_APP_BASE_API?.replace(/\/$/, '') || ''
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

function handleClick() {
  emit('select', props.card)
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.membership-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.6));
  border: 1px solid rgba(255, 255, 255, 0.08);

  // 实体卡片纹理效果
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(253, 216, 53, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(253, 216, 53, 0.05) 0%, transparent 50%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%);
    pointer-events: none;
  }

  // 金色描边效果
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(253, 216, 53, 0.2), rgba(253, 216, 53, 0.1), transparent);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow:
      0 12px 40px rgba(253, 216, 53, 0.25),
      0 0 20px rgba(253, 216, 53, 0.15);
    border-color: rgba(253, 216, 53, 0.3);

    &::after {
      opacity: 1;
    }
  }

  &:focus-visible {
    outline: 2px solid $color-yellow;
    outline-offset: 2px;
  }

  &--active {
    border-color: rgba(253, 216, 53, 0.8);
    box-shadow: $shadow-glow, 0 8px 32px rgba(253, 216, 53, 0.3);
    background: linear-gradient(135deg, rgba(253, 216, 53, 0.1), rgba(0, 0, 0, 0.8));

    &::after {
      opacity: 1;
    }
  }

  &--featured {
    border-color: rgba(253, 216, 53, 0.6);
    box-shadow: 0 0 30px rgba(253, 216, 53, 0.2);

    .membership-card__badge {
      opacity: 1;
    }
  }
}

.membership-card__glow {
  position: absolute;
  inset: -2px;
  border-radius: 26px;
  background: linear-gradient(45deg,
    transparent,
    rgba(253, 216, 53, 0.3),
    transparent,
    rgba(253, 216, 53, 0.3),
    transparent
  );
  background-size: 200% 200%;
  animation: glow-flow 3s linear infinite;
  z-index: -1;
}

@keyframes glow-flow {
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
}

.membership-card__inner {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.membership-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.membership-card__title-section {
  flex: 1;
  min-width: 0;
}

.membership-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: $color-text-primary;
  line-height: 1.2;
}

.membership-card__duration {
  font-size: 0.875rem;
  color: $color-text-secondary;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.membership-card__badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  background: linear-gradient(135deg, $color-yellow, rgba(253, 216, 53, 0.8));
  color: rgba(0, 0, 0, 0.8);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  opacity: 0.8;
  transition: opacity 0.3s ease;

  svg {
    width: 10px;
    height: 10px;
  }
}

.membership-card__description {
  color: $color-text-secondary;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
}

.membership-card__benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.benefit-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);

  &.priority {
    border-color: rgba(253, 216, 53, 0.3);
    background: rgba(253, 216, 53, 0.05);
  }

  &.trainer {
    border-color: rgba(74, 144, 226, 0.3);
    background: rgba(74, 144, 226, 0.05);
  }

  &.facility {
    border-color: rgba(142, 68, 173, 0.3);
    background: rgba(142, 68, 173, 0.05);
  }

  &.guest {
    border-color: rgba(241, 196, 15, 0.3);
    background: rgba(241, 196, 15, 0.05);
  }

  .benefit-icon {
    width: 12px;
    height: 12px;
    opacity: 0.8;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;

    &.icon-calendar {
      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V8.5C3 7.39543 3.89543 6.5 5 6.5H19C20.1046 6.5 21 7.39543 21 8.5Z' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M7 11H9M12 11H14M7 14H9M12 14H14' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e");
    }

    &.icon-trainer {
      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12 2C10.8954 2 10 2.89543 10 4V6H14V4C14 2.89543 13.1046 2 12 2Z' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M8 6V8C8 9.10457 8.89543 10 10 10H14C15.1046 10 16 9.10457 16 8V6' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M6 12V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V12' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3ccircle cx='9' cy='14' r='1' fill='currentColor'/%3e%3ccircle cx='15' cy='14' r='1' fill='currentColor'/%3e%3cpath d='M9 16H15' stroke='currentColor' stroke-width='1.5' stroke-linecap='round'/%3e%3c/svg%3e");
    }

    &.icon-facility {
      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M3 21H21M5 21V7L12 3L19 7V21M9 21V15C9 13.8954 9.89543 13 11 13H13C14.1046 13 15 13.8954 15 15V21' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3ccircle cx='12' cy='9' r='2' stroke='currentColor' stroke-width='1.5'/%3e%3c/svg%3e");
    }

    &.icon-guest {
      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e");
    }

    &.icon-priority {
      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M13 2L3 14H12L11 22L21 10H12L13 2Z' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e");
    }

    &.icon-service {
      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e");
    }
  }
}

.membership-card__price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: auto;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: $color-yellow;
  line-height: 1;
}

.price-unit {
  font-size: 0.875rem;
  color: $color-text-secondary;
}

.price-benefits-count {
  color: $color-text-secondary;
  font-size: 0.75rem;
}

.membership-card__image {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 8px;

  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    display: block;
  }

  .image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.1) 0%,
      transparent 50%,
      rgba(253, 216, 53, 0.05) 100%
    );
  }
}

.membership-card__hover-info {
  position: absolute;
  inset: 20px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.membership-card:hover .membership-card__hover-info {
  opacity: 1;
  transform: translateY(0);
}

.hover-benefits {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hover-benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: $color-text-secondary;

  .hover-benefit-icon {
    width: 16px;
    height: 16px;
    color: $color-yellow;
  }
}

.hover-cta {
  align-self: flex-start;
  margin-top: 12px;
}

.membership-card__texture {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  opacity: 0.5;
}

// 响应式设计
@media (max-width: 768px) {
  .membership-card {
    border-radius: 20px;

    &:hover {
      transform: translateY(-4px) scale(1.01);
    }
  }

  .membership-card__inner {
    padding: 16px;
    gap: 12px;
  }

  .membership-card__title {
    font-size: 1.125rem;
  }

  .membership-card__benefits {
    gap: 4px;
  }

  .benefit-tag {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
}
</style>
