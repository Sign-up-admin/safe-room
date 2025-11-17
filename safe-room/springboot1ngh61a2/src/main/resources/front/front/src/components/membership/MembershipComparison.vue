<template>
  <div class="membership-comparison">
    <header class="comparison-header">
      <h3 class="comparison-title">{{ title }}</h3>
      <p class="comparison-subtitle">{{ subtitle }}</p>
    </header>

    <!-- 移动端折叠式对比 -->
    <div v-if="isMobile" class="comparison-mobile">
      <div
        v-for="card in cards"
        :key="card.id"
        class="mobile-card-item"
        :class="{ 'mobile-card-item--active': card.id === selectedCardId }"
        @click="$emit('card-select', card)"
      >
        <div class="mobile-card-header">
          <h4>{{ card.huiyuankamingcheng }}</h4>
          <span class="mobile-card-price">{{ formatCurrency(card.jiage) }}</span>
        </div>

        <div class="mobile-benefits-list">
          <div
            v-for="metric in comparisonMetrics"
            :key="metric.key"
            class="mobile-benefit-item"
          >
            <span class="benefit-label">{{ metric.label }}</span>
            <div class="benefit-value">
              <div
                class="benefit-bar"
                :style="{ width: `${metric.values[card.id!] ?? 10}%` }"
              ></div>
              <span class="benefit-text">{{ metric.format(metric.values[card.id!] ?? 0, card) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 桌面端表格对比 -->
    <div v-else class="comparison-table">
      <!-- 表头 -->
      <div class="comparison-table-header">
        <div class="comparison-table-cell comparison-table-cell--label">
          <span>对比项目</span>
        </div>
        <div
          v-for="card in cards"
          :key="card.id"
          class="comparison-table-cell comparison-table-cell--header"
          :class="{ 'comparison-table-cell--active': card.id === selectedCardId }"
          @mouseenter="hoveredCardId = card.id"
          @mouseleave="hoveredCardId = null"
        >
          <div class="card-header-content">
            <h4>{{ card.huiyuankamingcheng }}</h4>
            <span class="card-price">{{ formatCurrency(card.jiage) }}</span>
          </div>
        </div>
      </div>

      <!-- 对比行 -->
      <div
        v-for="metric in comparisonMetrics"
        :key="metric.key"
        class="comparison-row"
        :class="{ 'comparison-row--highlight': hoveredCardId }"
      >
        <div class="comparison-table-cell comparison-table-cell--label">
          <div class="metric-info">
            <span class="metric-label">{{ metric.label }}</span>
            <small class="metric-desc">{{ metric.desc }}</small>
          </div>
        </div>

        <div
          v-for="card in cards"
          :key="card.id"
          class="comparison-table-cell"
          :class="{
            'comparison-table-cell--active': card.id === selectedCardId,
            'comparison-table-cell--highlight': card.id === hoveredCardId
          }"
        >
          <div class="metric-visualization">
            <!-- 条形图 -->
            <div class="metric-bar-container">
              <div
                class="metric-bar"
                :style="{ width: `${metric.values[card.id!] ?? 10}%` }"
              ></div>
            </div>

            <!-- 数值显示 -->
            <div class="metric-value">
              {{ metric.format(metric.values[card.id!] ?? 0, card) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例说明 -->
    <div class="comparison-legend">
      <div class="legend-item">
        <div class="legend-color legend-color--low"></div>
        <span>基础水平</span>
      </div>
      <div class="legend-item">
        <div class="legend-color legend-color--medium"></div>
        <span>进阶水平</span>
      </div>
      <div class="legend-item">
        <div class="legend-color legend-color--high"></div>
        <span>尊享水平</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Huiyuanka } from '@/types/modules'
import { formatCurrency } from '@/utils/formatters'

interface Props {
  cards: Huiyuanka[]
  selectedCardId?: number
  title?: string
  subtitle?: string
}

interface ComparisonMetric {
  key: string
  label: string
  desc: string
  values: Record<number, number>
  format: (value: number, card: Huiyuanka) => string
}

const props = withDefaults(defineProps<Props>(), {
  title: '会员卡对比',
  subtitle: '不同卡种的核心权益对比',
})

const emit = defineEmits<{
  'card-select': [card: Huiyuanka]
}>()

const hoveredCardId = ref<number | null>(null)

// 检测是否为移动端
const isMobile = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768
  }
  return false
})

// 对比指标配置
const comparisonMetrics = computed<ComparisonMetric[]>(() => {
  return [
    {
      key: 'price',
      label: '价格优势',
      desc: '性价比评估',
      values: toValueMap((card) => {
        const price = Number(card.jiage) || 0
        // 价格越低，性价比越高（用100减去标准化价格）
        const maxPrice = Math.max(...props.cards.map(c => Number(c.jiage) || 0))
        const minPrice = Math.min(...props.cards.map(c => Number(c.jiage) || 0))
        if (maxPrice === minPrice) return 50
        return 100 - ((price - minPrice) / (maxPrice - minPrice)) * 80
      }),
      format: (value: number) => {
        if (value >= 80) return '超高'
        if (value >= 60) return '较高'
        if (value >= 40) return '中等'
        return '基础'
      },
    },
    {
      key: 'duration',
      label: '有效期',
      desc: '服务时长',
      values: toValueMap((card) => {
        const months = parseInt(card.youxiaoqi || '12', 10)
        return Math.min(100, months * 8)
      }),
      format: (_: number, card: Huiyuanka) => card.youxiaoqi || '12 个月',
    },
    {
      key: 'priority',
      label: '预约优先级',
      desc: '预约响应速度',
      values: toValueMap((card, index) => 30 + index * (70 / (props.cards.length || 1))),
      format: (value: number) => {
        if (value >= 80) return '尊享优先'
        if (value >= 60) return '高级优先'
        if (value >= 40) return '标准优先'
        return '普通预约'
      },
    },
    {
      key: 'trainer_discount',
      label: '私教折扣',
      desc: '私人教练优惠',
      values: toValueMap((card, index) => {
        // 根据卡种等级设置不同的折扣力度
        const discounts = [70, 80, 90, 95] // 7折, 8折, 9折, 9.5折
        return discounts[index % discounts.length] || 70
      }),
      format: (value: number) => `${value / 10} 折`,
    },
    {
      key: 'facility_access',
      label: '设施权限',
      desc: '场馆设施使用',
      values: toValueMap((card, index) => 40 + index * (60 / (props.cards.length || 1))),
      format: (value: number) => {
        if (value >= 80) return '全部开放'
        if (value >= 60) return '大部分开放'
        if (value >= 40) return '基础设施'
        return '限时使用'
      },
    },
    {
      key: 'guest_benefits',
      label: '嘉宾权益',
      desc: '特殊活动邀请',
      values: toValueMap((card, index) => index * (100 / (props.cards.length || 1))),
      format: (value: number, card: Huiyuanka) => {
        const benefits = deriveGuestBenefits(card)
        return benefits.length > 0 ? `${benefits.length} 项` : '无'
      },
    },
  ]
})

// 将卡片数据转换为数值映射
function toValueMap(getter: (card: Huiyuanka, index: number) => number): Record<number, number> {
  return props.cards.reduce<Record<number, number>>((acc, card, index) => {
    if (card.id) {
      acc[card.id] = getter(card, index)
    }
    return acc
  }, {})
}

// 从卡片数据中提取嘉宾权益
function deriveGuestBenefits(card: Huiyuanka): string[] {
  const text = card.shiyongshuoming || card.huiyuankaxiangqing || ''
  const segments = text.split(/[\n、。,，]/).map(item => item.trim()).filter(Boolean)
  return segments.filter(item =>
    item.includes('嘉宾') ||
    item.includes('活动') ||
    item.includes('workshop') ||
    item.includes('讲座')
  )
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.membership-comparison {
  width: 100%;
}

.comparison-header {
  text-align: center;
  margin-bottom: 32px;

  .comparison-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: $color-text-primary;
    margin: 0 0 8px 0;
  }

  .comparison-subtitle {
    font-size: 0.875rem;
    color: $color-text-secondary;
    margin: 0;
  }
}

// 移动端样式
.comparison-mobile {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-card-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(253, 216, 53, 0.3);
    background: rgba(253, 216, 53, 0.05);
  }

  &--active {
    border-color: rgba(253, 216, 53, 0.8);
    background: rgba(253, 216, 53, 0.1);
    box-shadow: 0 0 20px rgba(253, 216, 53, 0.3);
  }
}

.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h4 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: $color-text-primary;
  }

  .mobile-card-price {
    font-size: 1.25rem;
    font-weight: 700;
    color: $color-yellow;
  }
}

.mobile-benefits-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-benefit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }
}

.benefit-label {
  font-size: 0.875rem;
  color: $color-text-secondary;
  flex: 1;
}

.benefit-value {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.benefit-bar {
  height: 4px;
  background: linear-gradient(90deg, rgba(253, 216, 53, 0.8), rgba(253, 216, 53, 0.3));
  border-radius: 2px;
  flex: 1;
  transition: width 0.3s ease;
}

.benefit-text {
  font-size: 0.75rem;
  color: $color-text-primary;
  font-weight: 500;
  min-width: 60px;
  text-align: right;
}

// 桌面端表格样式
.comparison-table {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
}

.comparison-table-header {
  display: grid;
  grid-template-columns: 200px repeat(auto-fit, minmax(160px, 1fr));
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.comparison-table-cell {
  padding: 16px;
  display: flex;
  align-items: center;
  border-right: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-right: none;
  }

  &--label {
    background: rgba(0, 0, 0, 0.3);
    font-weight: 600;
    color: $color-text-primary;
    justify-content: flex-start;
  }

  &--header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(253, 216, 53, 0.05);
    }
  }

  &--active {
    background: rgba(253, 216, 53, 0.1);
    border-color: rgba(253, 216, 53, 0.3);
  }

  &--highlight {
    background: rgba(253, 216, 53, 0.08);
    box-shadow: inset 0 0 10px rgba(253, 216, 53, 0.2);
  }
}

.card-header-content {
  text-align: center;
  width: 100%;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: $color-text-primary;
  }

  .card-price {
    font-size: 1.125rem;
    font-weight: 700;
    color: $color-yellow;
  }
}

.comparison-row {
  display: grid;
  grid-template-columns: 200px repeat(auto-fit, minmax(160px, 1fr));
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &--highlight {
    background: rgba(255, 255, 255, 0.01);
  }
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .metric-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-text-primary;
  }

  .metric-desc {
    font-size: 0.75rem;
    color: $color-text-secondary;
  }
}

.metric-visualization {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.metric-bar-container {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
}

.metric-bar {
  height: 100%;
  background: linear-gradient(90deg,
    rgba(253, 216, 53, 0.9),
    rgba(253, 216, 53, 0.6),
    rgba(253, 216, 53, 0.3)
  );
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: bar-shine 2s infinite;
  }
}

@keyframes bar-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.metric-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: $color-text-primary;
  min-width: 80px;
  text-align: right;
}

// 图例样式
.comparison-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: $color-text-secondary;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;

  &--low {
    background: rgba(253, 216, 53, 0.3);
  }

  &--medium {
    background: rgba(253, 216, 53, 0.6);
  }

  &--high {
    background: rgba(253, 216, 53, 0.9);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .comparison-table {
    display: none;
  }

  .comparison-legend {
    gap: 16px;
  }
}

@media (min-width: 769px) {
  .comparison-mobile {
    display: none;
  }
}
</style>
