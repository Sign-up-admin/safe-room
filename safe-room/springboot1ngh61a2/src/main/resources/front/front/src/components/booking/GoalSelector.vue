<template>
  <section class="goal-selector">
    <div class="goal-selector__chips">
      <button
        v-for="goal in goals"
        :key="goal"
        class="goal-chip"
        :class="[{ 'goal-chip--active': selectedGoalsModel.includes(goal) }]"
        @click="toggleGoal(goal)"
      >
        {{ goal }}
      </button>
    </div>

    <div class="goal-selector__price-chart">
      <h4>套餐价格曲线</h4>
      <div class="price-chart-container">
        <svg ref="chartSvgRef" class="price-chart" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" :stop-color="chartGradientStart" stop-opacity="0.3" />
              <stop offset="100%" :stop-color="chartGradientEnd" stop-opacity="0.05" />
            </linearGradient>
          </defs>
          <!-- 网格线 -->
          <g class="chart-grid">
            <line
              v-for="i in 4"
              :key="`grid-h-${i}`"
              :x1="0"
              :y1="i * 50"
              :x2="400"
              :y2="i * 50"
              stroke="rgba(255,255,255,0.05)"
            />
            <line
              v-for="i in packageOptions.length"
              :key="`grid-v-${i}`"
              :x1="(i * 400) / (packageOptions.length + 1)"
              :y1="0"
              :x2="(i * 400) / (packageOptions.length + 1)"
              :y2="200"
              stroke="rgba(255,255,255,0.05)"
            />
          </g>
          <!-- 价格曲线区域 -->
          <path :d="priceAreaPath" fill="url(#priceGradient)" />
          <!-- 价格曲线 -->
          <path
            :d="priceLinePath"
            fill="none"
            stroke="#fdd835"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- 数据点 -->
          <circle
            v-for="(point, index) in chartPoints"
            :key="`point-${index}`"
            :cx="point.x"
            :cy="point.y"
            :r="point.active ? 6 : 4"
            :fill="point.active ? '#fdd835' : 'rgba(253, 216, 53, 0.6)'"
            :stroke="point.active ? '#fff' : 'transparent'"
            stroke-width="2"
            class="chart-point"
            @mouseenter="highlightPoint(index)"
            @mouseleave="unhighlightPoint"
          />
          <!-- 标签 -->
          <text
            v-for="(point, index) in chartPoints"
            :key="`label-${index}`"
            :x="point.x"
            :y="point.y - 15"
            text-anchor="middle"
            fill="#fdd835"
            font-size="12"
            font-weight="600"
          >
            ¥{{ point.price.toFixed(0) }}
          </text>
        </svg>
      </div>
    </div>

    <div class="goal-selector__packages">
      <article
        v-for="(pkg, index) in packageOptions"
        :key="pkg.label"
        class="package-card"
        :class="[{ 'package-card--active': pkg.label === selectedPackage?.label }]"
        @click="$emit('update:selectedPackage', pkg)"
        @mouseenter="highlightPoint(index)"
        @mouseleave="unhighlightPoint"
      >
        <div class="package-card__badge">{{ pkg.sessions }} 次 · {{ pkg.duration }}</div>
        <h3>{{ pkg.label }}</h3>
        <p>{{ pkg.desc }}</p>
        <strong>¥{{ priceCalculator(pkg).toFixed(2) }}</strong>
      </article>
    </div>

    <slot name="actions" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface PackageOption {
  label: string
  sessions: number
  duration: string
  desc: string
}

const props = defineProps<{
  goals: string[]
  selectedGoals: string[]
  packageOptions: PackageOption[]
  selectedPackage?: PackageOption
  priceCalculator: (pkg: PackageOption) => number
}>()

const emit = defineEmits<{
  (e: 'update:selectedGoals', value: string[]): void
  (e: 'update:selectedPackage', value: PackageOption): void
}>()

const chartSvgRef = ref<SVGSVGElement>()
const highlightedIndex = ref<number | null>(null)

const selectedGoalsModel = computed({
  get: () => props.selectedGoals,
  set: (value: string[]) => emit('update:selectedGoals', value),
})

const chartGradientStart = '#fdd835'
const chartGradientEnd = '#f6c300'

// 计算图表数据点
const chartPoints = computed(() => {
  if (props.packageOptions.length === 0) return []

  const prices = props.packageOptions.map(pkg => props.priceCalculator(pkg))
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)
  const priceRange = maxPrice - minPrice || 1

  const width = 400
  const height = 200
  const padding = 40

  return props.packageOptions.map((pkg, index) => {
    const price = props.priceCalculator(pkg)
    const x = padding + ((width - padding * 2) * index) / (props.packageOptions.length - 1 || 1)
    const y = height - padding - ((price - minPrice) / priceRange) * (height - padding * 2)
    const active = pkg.label === props.selectedPackage?.label || highlightedIndex.value === index

    return { x, y, price, active, index }
  })
})

// 生成价格曲线路径
const priceLinePath = computed(() => {
  if (chartPoints.value.length === 0) return ''

  const points = chartPoints.value
  let path = `M ${points[0].x} ${points[0].y}`

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cp1x = prev.x + (curr.x - prev.x) / 2
    const cp1y = prev.y
    const cp2x = curr.x - (curr.x - prev.x) / 2
    const cp2y = curr.y

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
  }

  return path
})

// 生成价格区域路径（用于填充）
const priceAreaPath = computed(() => {
  if (chartPoints.value.length === 0) return ''

  const points = chartPoints.value
  const height = 200
  const padding = 40
  const bottomY = height - padding

  let path = `M ${points[0].x} ${bottomY} L ${points[0].x} ${points[0].y}`

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cp1x = prev.x + (curr.x - prev.x) / 2
    const cp1y = prev.y
    const cp2x = curr.x - (curr.x - prev.x) / 2
    const cp2y = curr.y

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
  }

  const lastPoint = points[points.length - 1]
  path += ` L ${lastPoint.x} ${bottomY} Z`

  return path
})

function toggleGoal(goal: string) {
  if (selectedGoalsModel.value.includes(goal)) {
    selectedGoalsModel.value = selectedGoalsModel.value.filter(item => item !== goal)
  } else {
    selectedGoalsModel.value = [...selectedGoalsModel.value, goal]
  }
}

function highlightPoint(index: number) {
  highlightedIndex.value = index
}

function unhighlightPoint() {
  highlightedIndex.value = null
}

// 当选中套餐变化时，更新高亮
watch(
  () => props.selectedPackage,
  () => {
    if (props.selectedPackage) {
      const index = props.packageOptions.findIndex(pkg => pkg.label === props.selectedPackage?.label)
      if (index >= 0) {
        highlightedIndex.value = index
      }
    }
  },
)
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.goal-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.goal-selector__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.goal-chip {
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 18px;
  background: transparent;
  cursor: pointer;
  transition: $transition-base;

  &--active {
    border-color: $color-yellow;
    color: $color-yellow;
    box-shadow: $shadow-glow;
  }
}

.goal-selector__packages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.package-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 18px;
  cursor: pointer;
  position: relative;

  &--active {
    border-color: $color-yellow;
    box-shadow: $shadow-glow;
  }

  h3 {
    margin: 8px 0;
  }

  p {
    margin: 0;
    color: $color-text-secondary;
    min-height: 42px;
  }

  strong {
    display: block;
    margin-top: 12px;
    font-size: 1.4rem;
  }
}

.package-card__badge {
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  color: $color-text-secondary;
}

.goal-selector__price-chart {
  margin: 24px 0;
  padding: 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);

  h4 {
    margin: 0 0 16px;
    font-size: 0.9rem;
    letter-spacing: 0.1em;
    color: $color-text-secondary;
  }
}

.price-chart-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.price-chart {
  width: 100%;
  height: auto;
  display: block;
}

.chart-point {
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-point:hover {
  r: 7;
  filter: drop-shadow(0 0 8px rgba(253, 216, 53, 0.8));
}

@media (max-width: 640px) {
  .goal-selector__price-chart {
    padding: 16px;
  }

  .price-chart-container {
    max-width: 100%;
  }
}
</style>
