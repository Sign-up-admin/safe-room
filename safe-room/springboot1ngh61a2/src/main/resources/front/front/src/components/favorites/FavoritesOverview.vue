<template>
  <TechCard title="收藏概览" subtitle="数据统计与类型分布" :interactive="false">
    <div class="overview-grid">
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalCount }}</div>
            <div class="stat-label">总收藏数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ recentCount }}</div>
            <div class="stat-label">7天内收藏</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ categoryCount }}</div>
            <div class="stat-label">收藏分类</div>
          </div>
        </div>
      </div>

      <!-- 类型分布图表 -->
      <div class="chart-section">
        <h4>收藏类型分布</h4>
        <div class="chart-container">
          <svg width="200" height="200" viewBox="0 0 200 200" class="donut-chart">
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="20" />
            <circle
              v-for="(segment, index) in chartSegments"
              :key="index"
              cx="100"
              cy="100"
              r="40"
              fill="none"
              :stroke="segment.color"
              stroke-width="20"
              :stroke-dasharray="`${segment.dashArray} ${251.2 - segment.dashArray}`"
              :stroke-dashoffset="segment.dashOffset"
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div class="chart-legend">
            <div v-for="segment in chartSegments" :key="segment.label" class="legend-item">
              <div class="legend-color" :style="{ backgroundColor: segment.color }"></div>
              <span class="legend-label">{{ segment.label }}</span>
              <span class="legend-value">{{ segment.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TechCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TechCard } from '@/components/common'

interface CategoryData {
  name: string
  count: number
  color: string
}

interface Props {
  categories: CategoryData[]
  totalCount: number
  recentCount: number
}

const props = defineProps<Props>()

const categoryCount = computed(() => props.categories.length)

const chartSegments = computed(() => {
  if (props.totalCount === 0) return []

  const colors = ['#4a90e2', '#f44336', '#4caf50', '#ff9800', '#9c27b0']
  let currentOffset = 0

  return props.categories.map((category, index) => {
    const percentage = category.count / props.totalCount
    const dashArray = percentage * 251.2 // 2 * π * 40

    const segment = {
      label: category.name,
      value: category.count,
      color: colors[index % colors.length],
      dashArray,
      dashOffset: -currentOffset,
    }

    currentOffset += dashArray
    return segment
  })
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(253, 216, 53, 0.1);
  border-radius: 8px;
  color: #fdd835;

  svg {
    width: 20px;
    height: 20px;
  }
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: $color-text-primary;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: $color-text-secondary;
  margin-top: 4px;
}

.chart-section {
  h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: $color-text-primary;
  }
}

.chart-container {
  display: flex;
  align-items: center;
  gap: 24px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
  }
}

.donut-chart {
  flex-shrink: 0;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-label {
  flex: 1;
  font-size: 14px;
  color: $color-text-secondary;
}

.legend-value {
  font-size: 14px;
  font-weight: 600;
  color: $color-text-primary;
}
</style>
