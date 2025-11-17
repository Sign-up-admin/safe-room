<template>
  <div class="course-chart">
    <svg :viewBox="`0 0 ${size} ${size}`" role="img" aria-label="课程收益雷达图">
      <g class="course-chart__grid">
        <polygon v-for="level in 4" :key="level" :points="gridPoints(level / 4)" />
      </g>
      <polyline class="course-chart__outline" :points="points" />
      <g class="course-chart__dots">
        <circle v-for="(point, index) in polarPoints" :key="metrics[index].label" :cx="point.x" :cy="point.y" r="4" />
      </g>
    </svg>

    <ul class="course-chart__legend">
      <li v-for="metric in metrics" :key="metric.label">
        <span>{{ metric.label }}</span>
        <div class="course-chart__bar">
          <div class="course-chart__bar-fill" :style="{ width: `${metric.value}%` }" />
        </div>
        <strong>{{ metric.value }}%</strong>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface BenefitMetric {
  label: string
  value: number
}

const props = withDefaults(
  defineProps<{
    metrics: BenefitMetric[]
    size?: number
  }>(),
  {
    size: 240,
  },
)

const center = computed(() => props.size / 2)
const radius = computed(() => props.size / 2 - 10)

const polarPoints = computed(() =>
  props.metrics.map((metric, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / props.metrics.length
    const valueRadius = (metric.value / 100) * radius.value
    return {
      x: center.value + valueRadius * Math.cos(angle),
      y: center.value + valueRadius * Math.sin(angle),
    }
  }),
)

const points = computed(() => polarPoints.value.map(point => `${point.x},${point.y}`).join(' '))

const gridPoints = (ratio: number) =>
  props.metrics
    .map((_, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / props.metrics.length
      const valueRadius = ratio * radius.value
      const x = center.value + valueRadius * Math.cos(angle)
      const y = center.value + valueRadius * Math.sin(angle)
      return `${x},${y}`
    })
    .join(' ')
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.course-chart {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  align-items: center;

  svg {
    width: 100%;
    height: auto;
  }
}

.course-chart__grid polygon {
  fill: rgba(253, 216, 53, 0.04);
  stroke: rgba(253, 216, 53, 0.12);
}

.course-chart__outline {
  fill: rgba(253, 216, 53, 0.15);
  stroke: $color-yellow;
  stroke-width: 2;
}

.course-chart__dots circle {
  fill: $color-yellow;
  stroke: $color-bg-dark;
  stroke-width: 2;
}

.course-chart__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  li {
    display: grid;
    grid-template-columns: 120px 1fr 40px;
    gap: 12px;
    align-items: center;
  }

  span {
    color: $color-text-secondary;
    letter-spacing: 0.2em;
  }

  strong {
    font-size: 1.1rem;
    text-align: right;
  }
}

.course-chart__bar {
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.course-chart__bar-fill {
  height: 100%;
  background: linear-gradient(120deg, #fdd835, #f6c300);
}

@media (max-width: 900px) {
  .course-chart {
    grid-template-columns: 1fr;
  }
}
</style>
