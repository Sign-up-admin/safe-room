<template>
  <div class="membership-benefits">
    <header class="benefits-header">
      <h3 class="benefits-title">{{ title }}</h3>
      <p class="benefits-subtitle">{{ subtitle }}</p>
    </header>

    <!-- 图表切换器 -->
    <div class="chart-controls">
      <div class="chart-type-selector">
        <button
          v-for="type in chartTypes"
          :key="type.key"
          :class="['chart-type-btn', { 'chart-type-btn--active': activeChartType === type.key }]"
          @click="activeChartType = type.key"
        >
          {{ type.label }}
        </button>
      </div>

      <div class="card-selector">
        <select v-model="selectedCardId" class="card-select">
          <option
            v-for="card in cards"
            :key="card.id"
            :value="card.id"
          >
            {{ card.huiyuankamingcheng }}
          </option>
        </select>
      </div>
    </div>

    <!-- 图表容器 -->
    <div class="chart-container" :class="`chart-container--${activeChartType}`">
      <!-- 雷达图 -->
      <div v-if="activeChartType === 'radar'" ref="radarChartRef" class="radar-chart"></div>

      <!-- 柱状图 -->
      <div v-else-if="activeChartType === 'bar'" ref="barChartRef" class="bar-chart"></div>

      <!-- 对比环形图 -->
      <div v-else-if="activeChartType === 'comparison'" ref="comparisonChartRef" class="comparison-chart"></div>
    </div>

    <!-- 权益说明 -->
    <div class="benefits-explanation">
      <div class="explanation-grid">
        <div
          v-for="benefit in currentBenefitsData"
          :key="benefit.key"
          class="explanation-item"
        >
          <div class="benefit-icon">
            <div :class="`benefit-icon-${benefit.key}`"></div>
          </div>
          <div class="benefit-content">
            <h4>{{ benefit.label }}</h4>
            <p>{{ benefit.description }}</p>
            <div class="benefit-value">
              <span class="value">{{ benefit.value }}</span>
              <small>{{ benefit.unit }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import * as d3 from 'd3'
import { lineRadial } from 'd3-shape'
import { pie, arc } from 'd3-shape'
import type { Huiyuanka } from '@/types/modules'

interface Props {
  cards: Huiyuanka[]
  selectedCardId?: number
  title?: string
  subtitle?: string
}

interface BenefitData {
  key: string
  label: string
  description: string
  value: string | number
  unit: string
  score: number // 0-100的分数，用于图表
}

interface ChartType {
  key: string
  label: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '权益可视化',
  subtitle: '不同卡种的核心权益对比分析',
})

const emit = defineEmits<{
  'card-select': [cardId: number]
}>()

// 图表类型
const chartTypes: ChartType[] = [
  { key: 'radar', label: '雷达图' },
  { key: 'bar', label: '柱状图' },
  { key: 'comparison', label: '对比环形' },
]

// 响应式数据
const activeChartType = ref('radar')
const selectedCardId = ref(props.selectedCardId || props.cards[0]?.id || 0)

// 图表容器引用
const radarChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
const comparisonChartRef = ref<HTMLElement>()

// 图表实例
let radarChart: d3.Selection<SVGGElement, unknown, null, undefined> | null = null
let barChart: d3.Selection<SVGGElement, unknown, null, undefined> | null = null
let comparisonChart: d3.Selection<SVGGElement, unknown, null, undefined> | null = null

// 当前选中卡片的权益数据
const currentBenefitsData = computed<BenefitData[]>(() => {
  const card = props.cards.find(c => c.id === selectedCardId.value)
  if (!card) return []

  return generateBenefitsData(card)
})

// 生成权益数据
function generateBenefitsData(card: Huiyuanka): BenefitData[] {
  const baseData: BenefitData[] = [
    {
      key: 'price',
      label: '价格优势',
      description: '性价比综合评估',
      value: calculatePriceScore(card),
      unit: '分',
      score: calculatePriceScoreValue(card),
    },
    {
      key: 'duration',
      label: '有效期',
      description: '服务时长保障',
      value: parseInt(card.youxiaoqi || '12'),
      unit: '个月',
      score: Math.min(100, parseInt(card.youxiaoqi || '12') * 8),
    },
    {
      key: 'trainer',
      label: '私教服务',
      description: '专业教练指导',
      value: calculateTrainerDiscount(card),
      unit: '折',
      score: calculateTrainerScore(card),
    },
    {
      key: 'facility',
      label: '设施权限',
      description: '场馆设施使用',
      value: calculateFacilityAccess(card),
      unit: '项',
      score: calculateFacilityScore(card),
    },
    {
      key: 'priority',
      label: '预约优先',
      description: '预约响应速度',
      value: calculatePriorityLevel(card),
      unit: '级',
      score: calculatePriorityScore(card),
    },
    {
      key: 'guest',
      label: '嘉宾权益',
      description: '特殊活动邀请',
      value: calculateGuestBenefits(card),
      unit: '次',
      score: calculateGuestScore(card),
    },
  ]

  return baseData
}

// 计算各项数值的函数
function calculatePriceScore(card: Huiyuanka): number {
  const prices = props.cards.map(c => Number(c.jiage) || 0)
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)
  const currentPrice = Number(card.jiage) || 0

  if (maxPrice === minPrice) return 85

  // 价格越低分数越高
  const score = 100 - ((currentPrice - minPrice) / (maxPrice - minPrice)) * 40
  return Math.round(score)
}

function calculatePriceScoreValue(card: Huiyuanka): number {
  return calculatePriceScore(card)
}

function calculateTrainerDiscount(card: Huiyuanka): number {
  // 根据卡种名称判断折扣力度
  const name = card.huiyuankamingcheng?.toLowerCase() || ''
  if (name.includes('尊享') || name.includes('黑金')) return 9.5
  if (name.includes('高级') || name.includes('提升')) return 9.0
  return 8.5
}

function calculateTrainerScore(card: Huiyuanka): number {
  const discount = calculateTrainerDiscount(card)
  return (discount - 8) * 50 + 50 // 8.5折=50分，9.5折=100分
}

function calculateFacilityAccess(card: Huiyuanka): number {
  // 根据卡种等级设置设施权限数量
  const name = card.huiyuankamingcheng?.toLowerCase() || ''
  if (name.includes('尊享') || name.includes('黑金')) return 15
  if (name.includes('高级') || name.includes('提升')) return 12
  return 8
}

function calculateFacilityScore(card: Huiyuanka): number {
  const access = calculateFacilityAccess(card)
  return Math.min(100, access * 6.67) // 15项=100分
}

function calculatePriorityLevel(card: Huiyuanka): number {
  const name = card.huiyuankamingcheng?.toLowerCase() || ''
  if (name.includes('尊享') || name.includes('黑金')) return 5
  if (name.includes('高级') || name.includes('提升')) return 4
  return 3
}

function calculatePriorityScore(card: Huiyuanka): number {
  const level = calculatePriorityLevel(card)
  return (level - 2) * 33.33 // 3级=33分，5级=100分
}

function calculateGuestBenefits(card: Huiyuanka): number {
  const name = card.huiyuankamingcheng?.toLowerCase() || ''
  if (name.includes('尊享') || name.includes('黑金')) return 6
  if (name.includes('高级') || name.includes('提升')) return 4
  return 2
}

function calculateGuestScore(card: Huiyuanka): number {
  const benefits = calculateGuestBenefits(card)
  return Math.min(100, benefits * 16.67) // 6次=100分
}

// 雷达图绘制
function drawRadarChart() {
  if (!radarChartRef.value) return

  const element = radarChartRef.value
  const data = currentBenefitsData.value

  // 清空之前的图表
  d3.select(element).selectAll('*').remove()

  const margin = { top: 50, right: 50, bottom: 50, left: 50 }
  const width = element.clientWidth - margin.left - margin.right
  const height = element.clientHeight - margin.top - margin.bottom

  const radius = Math.min(width, height) / 2
  const angleSlice = (Math.PI * 2) / data.length

  const svg = d3.select(element)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`)

  // 网格线
  const levels = 5
  for (let level = 0; level < levels; level++) {
    const levelFactor = radius * ((level + 1) / levels)

    svg.selectAll(`.level-${level}`)
      .data(data)
      .enter()
      .append('line')
      .attr('x1', (d, i) => levelFactor * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y1', (d, i) => levelFactor * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('x2', (d, i) => levelFactor * Math.cos(angleSlice * (i + 1) - Math.PI / 2))
      .attr('y2', (d, i) => levelFactor * Math.sin(angleSlice * (i + 1) - Math.PI / 2))
      .attr('stroke', 'rgba(255, 255, 255, 0.1)')
      .attr('stroke-width', 1)
  }

  // 轴线
  const axis = svg.selectAll('.axis')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'axis')

  axis.append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
    .attr('y2', (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
    .attr('stroke', 'rgba(255, 255, 255, 0.2)')
    .attr('stroke-width', 1)

  // 数据多边形
  const radarLine = lineRadial<BenefitData>()
    .curve(d3.curveLinearClosed)
    .radius(d => (d.score / 100) * radius)
    .angle((d, i) => i * angleSlice)

  svg.append('path')
    .datum(data)
    .attr('d', radarLine)
    .attr('fill', 'rgba(253, 216, 53, 0.2)')
    .attr('stroke', 'rgba(253, 216, 53, 0.8)')
    .attr('stroke-width', 2)

  // 数据点
  svg.selectAll('.radar-point')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'radar-point')
    .attr('cx', (d, i) => (d.score / 100) * radius * Math.cos(angleSlice * i - Math.PI / 2))
    .attr('cy', (d, i) => (d.score / 100) * radius * Math.sin(angleSlice * i - Math.PI / 2))
    .attr('r', 4)
    .attr('fill', '#fdd835')
    .attr('stroke', '#000')
    .attr('stroke-width', 2)

  radarChart = svg
}

// 柱状图绘制
function drawBarChart() {
  if (!barChartRef.value) return

  const element = barChartRef.value
  const data = currentBenefitsData.value

  d3.select(element).selectAll('*').remove()

  const margin = { top: 20, right: 30, bottom: 60, left: 60 }
  const width = element.clientWidth - margin.left - margin.right
  const height = element.clientHeight - margin.top - margin.bottom

  const svg = d3.select(element)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3.scaleBand()
    .range([0, width])
    .domain(data.map(d => d.key))
    .padding(0.2)

  const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, 100])

  // X轴
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .style('fill', 'rgba(255, 255, 255, 0.7)')
    .style('font-size', '12px')

  // Y轴
  svg.append('g')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .style('fill', 'rgba(255, 255, 255, 0.7)')
    .style('font-size', '12px')

  // 柱子
  svg.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.key)!)
    .attr('y', d => y(d.score))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.score))
    .attr('fill', 'rgba(253, 216, 53, 0.8)')
    .attr('stroke', 'rgba(253, 216, 53, 1)')
    .attr('stroke-width', 1)
    .attr('rx', 4)

  barChart = svg
}

// 对比环形图绘制
function drawComparisonChart() {
  if (!comparisonChartRef.value) return

  const element = comparisonChartRef.value
  const data = currentBenefitsData.value

  d3.select(element).selectAll('*').remove()

  const margin = { top: 20, right: 20, bottom: 20, left: 20 }
  const width = element.clientWidth - margin.left - margin.right
  const height = element.clientHeight - margin.top - margin.bottom
  const radius = Math.min(width, height) / 2

  const svg = d3.select(element)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`)

  const pieGenerator = pie<BenefitData>()
    .value(d => d.score)
    .sort(null)

  const arcGenerator = arc<d3.PieArcDatum<BenefitData>>()
    .innerRadius(radius * 0.3)
    .outerRadius(radius)

  const color = d3.scaleOrdinal<string>()
    .domain(data.map(d => d.key))
    .range([
      'rgba(253, 216, 53, 0.8)',
      'rgba(74, 144, 226, 0.8)',
      'rgba(142, 68, 173, 0.8)',
      'rgba(241, 196, 15, 0.8)',
      'rgba(231, 76, 60, 0.8)',
      'rgba(52, 152, 219, 0.8)',
    ])

  // 绘制扇形
  const arcs = svg.selectAll('.arc')
    .data(pieGenerator(data))
    .enter()
    .append('g')
    .attr('class', 'arc')

  arcs.append('path')
    .attr('d', arcGenerator)
    .attr('fill', d => color(d.data.key))
    .attr('stroke', 'rgba(255, 255, 255, 0.2)')
    .attr('stroke-width', 1)

  // 添加标签
  arcs.append('text')
    .attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
    .attr('dy', '0.35em')
    .style('text-anchor', 'middle')
    .style('fill', 'white')
    .style('font-size', '12px')
    .style('font-weight', '500')
    .text(d => d.data.label)

  comparisonChart = svg
}

// 监听变化重新绘制图表
watch([activeChartType, selectedCardId, currentBenefitsData], () => {
  setTimeout(() => {
    if (activeChartType.value === 'radar') {
      drawRadarChart()
    } else if (activeChartType.value === 'bar') {
      drawBarChart()
    } else if (activeChartType.value === 'comparison') {
      drawComparisonChart()
    }
  }, 100)
})

// 监听窗口大小变化
function handleResize() {
  if (activeChartType.value === 'radar') {
    drawRadarChart()
  } else if (activeChartType.value === 'bar') {
    drawBarChart()
  } else if (activeChartType.value === 'comparison') {
    drawComparisonChart()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  drawRadarChart()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 监听selectedCardId变化
watch(() => props.selectedCardId, (newId) => {
  if (newId) {
    selectedCardId.value = newId
  }
})

// 监听selectedCardId变化发射事件
watch(selectedCardId, (newId) => {
  emit('card-select', newId)
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.membership-benefits {
  width: 100%;
}

.benefits-header {
  text-align: center;
  margin-bottom: 32px;

  .benefits-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: $color-text-primary;
    margin: 0 0 8px 0;
  }

  .benefits-subtitle {
    font-size: 0.875rem;
    color: $color-text-secondary;
    margin: 0;
  }
}

.chart-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.chart-type-selector {
  display: flex;
  gap: 8px;
}

.chart-type-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.3);
  color: $color-text-secondary;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(253, 216, 53, 0.5);
    background: rgba(253, 216, 53, 0.1);
  }

  &--active {
    border-color: rgba(253, 216, 53, 0.8);
    background: rgba(253, 216, 53, 0.2);
    color: $color-yellow;
  }
}

.card-selector {
  .card-select {
    padding: 8px 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    color: $color-text-primary;
    font-size: 0.875rem;
    min-width: 150px;

    &:focus {
      outline: none;
      border-color: $color-yellow;
    }

    option {
      background: rgba(0, 0, 0, 0.8);
      color: $color-text-primary;
    }
  }
}

.chart-container {
  height: 400px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.2);
  margin-bottom: 32px;
  overflow: hidden;

  svg {
    width: 100%;
    height: 100%;
  }

  // 图表特定的样式
  &--radar :deep(.radar-point) {
    transition: r 0.3s ease;

    &:hover {
      r: 6;
    }
  }

  &--bar :deep(.bar) {
    transition: fill 0.3s ease;

    &:hover {
      fill: rgba(253, 216, 53, 1) !important;
    }
  }

  &--comparison :deep(.arc path) {
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.8;
    }
  }
}

.benefits-explanation {
  .explanation-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .explanation-item {
    display: flex;
    gap: 12px;
    padding: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(253, 216, 53, 0.3);
      background: rgba(253, 216, 53, 0.05);
    }
  }

  .benefit-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(253, 216, 53, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;

    div {
      width: 20px;
      height: 20px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      opacity: 0.8;
    }
  }

  .benefit-content {
    flex: 1;

    h4 {
      font-size: 1rem;
      font-weight: 600;
      color: $color-text-primary;
      margin: 0 0 4px 0;
    }

    p {
      font-size: 0.875rem;
      color: $color-text-secondary;
      margin: 0 0 8px 0;
      line-height: 1.4;
    }
  }

  .benefit-value {
    display: flex;
    align-items: baseline;
    gap: 4px;

    .value {
      font-size: 1.25rem;
      font-weight: 700;
      color: $color-yellow;
    }

    small {
      font-size: 0.875rem;
      color: $color-text-secondary;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chart-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .chart-container {
    height: 300px;
  }

  .explanation-grid {
    grid-template-columns: 1fr;
  }

  .explanation-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .benefit-icon {
    align-self: center;
  }
}
</style>
