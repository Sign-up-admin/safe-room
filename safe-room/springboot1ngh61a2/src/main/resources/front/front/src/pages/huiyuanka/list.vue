<template>
  <div class="membership-page" role="main" aria-label="会员卡总览页面">
    <section class="membership-hero" aria-labelledby="hero-title">
      <div>
        <p class="section-eyebrow">BLACK & GOLD CLUB</p>
        <h1 id="hero-title">会员卡矩阵 · 权益一目了然</h1>
        <p>
          从入门体验到黑金尊享，会员卡提供不同的训练次数、私教折扣与预约优先级。挑选最适合你的训练旅程。
        </p>
        <div class="hero-actions">
          <TechButton size="lg" @click="goPurchase(selectedCard?.id)">立即购买</TechButton>
          <TechButton size="lg" variant="outline" @click="scrollToSection('matrix')">查看卡种</TechButton>
        </div>
      </div>
      <div class="hero-highlight">
        <p>本月推荐</p>
        <strong>{{ selectedCard?.huiyuankamingcheng || '黑金尊享卡' }}</strong>
        <span>{{ formatCurrency(selectedCard?.jiage || 9999) }} / {{ selectedCard?.youxiaoqi || '12 个月' }}</span>
      </div>
    </section>

    <section id="matrix" class="card-matrix" v-loading="loading.cards" aria-labelledby="matrix-title" role="region">
      <h2 id="matrix-title" class="sr-only">会员卡选择</h2>
      <div
        ref="cardContainerRef"
        class="card-matrix__container"
        @mouseenter="pauseAutoScroll"
        @mouseleave="resumeAutoScroll"
      >
        <MembershipCard
          v-for="(card, index) in cards"
          :key="card.id"
          :card="card"
          :active="card.id === selectedCardId"
          :featured="card.id === featuredCardId"
          :show-hover-info="true"
          @select="onCardSelect"
        />
      </div>

      <!-- 滚动指示器 -->
      <div class="card-matrix__indicators" role="tablist" aria-label="会员卡选择指示器">
        <button
          v-for="(card, index) in cards"
          :key="card.id"
          :class="['indicator', { 'indicator--active': card.id === selectedCardId }]"
          @click="selectCard(card.id)"
          @keydown.left.prevent="navigateCards(-1)"
          @keydown.right.prevent="navigateCards(1)"
          @keydown.enter.prevent="selectCard(card.id)"
          @keydown.space.prevent="selectCard(card.id)"
          :aria-label="`选择${card.huiyuankamingcheng}会员卡`"
          :aria-selected="card.id === selectedCardId"
          role="tab"
          :tabindex="card.id === selectedCardId ? 0 : -1"
        ></button>
      </div>

      <el-empty v-if="!cards.length && !loading.cards" description="暂无会员卡" />
    </section>

    <section class="membership-details" v-if="selectedCard" aria-labelledby="details-title" role="region">
      <TechCard class="membership-detail-card" :title="selectedCard.huiyuankamingcheng" :subtitle="selectedCard.youxiaoqi">
        <template #title>
          <h3 id="details-title">{{ selectedCard.huiyuankamingcheng }}</h3>
        </template>
        <template #icon>
          <span class="detail-badge">主打权益</span>
        </template>
        <ul class="benefit-list">
          <li v-for="benefit in deriveBenefits(selectedCard)" :key="benefit">
            <span></span>
            <p>{{ benefit }}</p>
          </li>
        </ul>
        <template #footer>
          <div class="detail-footer">
            <div>
              <small>价格</small>
              <strong>{{ formatCurrency(selectedCard.jiage || 0) }}</strong>
            </div>
            <TechButton size="sm" @click="goPurchase(selectedCard.id)">立即购买</TechButton>
          </div>
        </template>
      </TechCard>

      <MembershipComparison
        :cards="cards"
        :selected-card-id="selectedCardId"
        title="会员卡对比"
        subtitle="不同卡种的核心权益对比"
        @card-select="selectCard"
      />

      <MembershipBenefits
        :cards="cards"
        :selected-card-id="selectedCardId"
        title="权益可视化"
        subtitle="多维度权益对比分析"
        @card-select="selectCard"
      />
    </section>

    <section class="membership-faq" aria-labelledby="faq-title" role="region">
      <TechCard title="会员口碑" subtitle="真实会员的声音">
        <template #title>
          <h3 id="faq-title">会员口碑</h3>
        </template>
        <div class="testimonial-grid">
          <article v-for="item in testimonials" :key="item.user">
            <header>
              <strong>{{ item.user }}</strong>
              <span>{{ item.card }}</span>
            </header>
            <p>{{ item.content }}</p>
          </article>
        </div>
      </TechCard>

      <TechCard title="常见问题" subtitle="了解更多细节" :interactive="false">
        <dl class="faq-list">
          <div v-for="faq in faqs" :key="faq.q">
            <dt>{{ faq.q }}</dt>
            <dd>{{ faq.a }}</dd>
          </div>
        </dl>
      </TechCard>
    </section>

    <TechCard class="membership-cta" variant="layered" :interactive="false" title="立即加入" subtitle="获取专属顾问服务">
      <template #title>
        <h3 id="cta-title">立即加入</h3>
      </template>
      <p>预约体验、锁定教练、优先参加限定活动。购卡即享尊贵权益。</p>
      <template #footer>
        <div class="cta-actions">
          <TechButton size="lg" @click="goPurchase(selectedCard?.id)">立即购卡</TechButton>
          <TechButton size="lg" variant="outline" @click="contactService">咨询顾问</TechButton>
        </div>
      </template>
    </TechCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { TechButton, TechCard } from '@/components/common'
import { MembershipCard, MembershipComparison, MembershipBenefits } from '@/components/membership'
import { getModuleService } from '@/services/crud'
import type { Huiyuanka } from '@/types/modules'
import { formatCurrency } from '@/utils/formatters'
import { gsap } from 'gsap'

const router = useRouter()
const cardService = getModuleService('huiyuanka')

const cards = ref<Huiyuanka[]>([])
const selectedIndex = ref(0)
const loading = reactive({
  cards: false,
})

// 自动滚动相关
const cardContainerRef = ref<HTMLElement>()
const autoScrollInterval = ref<number | null>(null)
const isAutoScrolling = ref(true)
const scrollSpeed = 2000 // 2秒切换一次
const cardWidth = 280 // 卡片宽度估算

const selectedCard = computed(() => cards.value[selectedIndex.value] || cards.value[0])
const selectedCardId = computed(() => selectedCard.value?.id || null)
const featuredCardId = computed(() => cards.value[0]?.id || null)

function onCardSelect(card: Huiyuanka) {
  const index = cards.value.findIndex(c => c.id === card.id)
  if (index >= 0) {
    selectedIndex.value = index
  }
}

// 自动滚动方法
function startAutoScroll() {
  if (cards.value.length <= 1) return

  stopAutoScroll() // 确保先停止之前的定时器

  autoScrollInterval.value = window.setInterval(() => {
    if (!isAutoScrolling.value) return

    selectedIndex.value = (selectedIndex.value + 1) % cards.value.length
    scrollToSelectedCard()
  }, scrollSpeed)
}

function stopAutoScroll() {
  if (autoScrollInterval.value) {
    clearInterval(autoScrollInterval.value)
    autoScrollInterval.value = null
  }
}

function pauseAutoScroll() {
  isAutoScrolling.value = false
}

function resumeAutoScroll() {
  isAutoScrolling.value = true
}

function scrollToSelectedCard() {
  if (!cardContainerRef.value) return

  const container = cardContainerRef.value
  const selectedCardElement = container.children[selectedIndex.value] as HTMLElement

  if (selectedCardElement) {
    // 使用GSAP平滑滚动到选中卡片
    gsap.to(container, {
      scrollLeft: selectedCardElement.offsetLeft - container.offsetWidth / 2 + selectedCardElement.offsetWidth / 2,
      duration: 0.8,
      ease: 'power2.out',
    })
  }
}

function selectCard(cardId: number) {
  const index = cards.value.findIndex(c => c.id === cardId)
  if (index >= 0) {
    selectedIndex.value = index
    scrollToSelectedCard()
  }
}

function setHoveredCard(cardId: number | null) {
  // 可以在这里添加悬停状态管理
  // 目前主要用于暂停自动滚动
}

function navigateCards(direction: number) {
  const currentIndex = cards.value.findIndex(card => card.id === selectedCardId.value)
  if (currentIndex === -1) return

  const newIndex = (currentIndex + direction + cards.value.length) % cards.value.length
  selectCard(cards.value[newIndex].id!)
}

const comparisonMetrics = computed(() => {
  const priceMetric = {
    key: 'price',
    label: '价格',
    desc: '含课程/权益价值',
    values: toValueMap((card) => Math.min(100, Math.max(20, (Number(card.jiage) || 0) / 100))),
    format: (value: number) => formatCurrency((value / 100) * (selectedCard.value?.jiage || 1)),
  }
  const durationMetric = {
    key: 'duration',
    label: '有效期',
    desc: '越长越划算',
    values: toValueMap((card) => {
      const months = parseInt(card.youxiaoqi || '12', 10)
      return Math.min(100, months * 8)
    }),
    format: (_: number, card: Huiyuanka) => card.youxiaoqi || '12 个月',
  }
  const prestigeMetric = {
    key: 'priority',
    label: '预约优先级',
    desc: '高端卡拥有更高优先权',
    values: toValueMap((card, index) => 40 + index * (50 / (cards.value.length || 1))),
    format: (value: number) => (value >= 80 ? '尊享' : value >= 60 ? '高级' : '标准'),
  }
  return [priceMetric, durationMetric, prestigeMetric]
})

const testimonials = [
  { user: 'Neo · 产品经理', card: '黑金尊享卡', content: '三个月内体脂降低 6%，私教预约优先真的太香了。' },
  { user: 'Ivy · 设计师', card: '能量提升卡', content: '每周 3 次训练 + 体态课程，整个人都自信了。' },
  { user: 'Leo · 跑者', card: '燃脂提升卡', content: '预约窗口提前 3 天，比赛季也不用抢场地。' },
]

const faqs = [
  { q: '会员卡能否升级？', a: '支持在有效期内按差价升级，权益即时同步。' },
  { q: '是否支持转让？', a: '标准卡不可转让，高级卡可在顾问协助下转让一次。' },
  { q: '购卡后如何预约？', a: '登录个人中心，在预约模块选择“会员优先”即可。' },
]

onMounted(() => {
  loadCards()
})

onUnmounted(() => {
  stopAutoScroll()
})

async function loadCards() {
  loading.cards = true
  try {
    const { list } = await cardService.list({ page: 1, limit: 6, sort: 'addtime', order: 'desc' })
    cards.value = list ?? []

    // 数据加载完成后启动自动滚动
    if (cards.value.length > 1) {
      // 延迟启动，让DOM先渲染完成
      setTimeout(() => {
        startAutoScroll()
      }, 1000)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.cards = false
  }
}

function toValueMap(getter: (card: Huiyuanka, index: number) => number) {
  return cards.value.reduce<Record<number, number>>((acc, card, index) => {
    if (card.id) {
      acc[card.id] = getter(card, index)
    }
    return acc
  }, {})
}

function deriveBenefits(card: Huiyuanka) {
  const text = card.shiyongshuoming || card.huiyuankaxiangqing || ''
  const segments = text.split(/[\n、。,，]/).map((item) => item.trim()).filter(Boolean)
  if (segments.length) return segments.slice(0, 6)
  return ['课程预约优先 72h', '私教单次 9 折', '智能体测 1 次/月', '专属客服顾问', '限定活动优先', '嘉宾权益 2 次']
}

function resolveAssetUrl(path?: string) {
  if (!path) return new URL('@/assets/jianshe.png', import.meta.url).href
  if (/^https?:\/\//i.test(path)) return path
  const base = import.meta.env.VITE_APP_BASE_API?.replace(/\/$/, '') || ''
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

function goPurchase(cardId?: number) {
  router.push({ path: '/index/huiyuankagoumai', query: cardId ? { cardId } : undefined })
}

function contactService() {
  window.open('tel:4008008888')
}

function scrollToSection(anchor: string) {
  const element = document.getElementById(anchor)
  element?.scrollIntoView({ behavior: 'smooth' })
}

</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

// 辅助功能样式
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.membership-page {
  padding: 48px 6vw 80px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.membership-hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  align-items: center;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.hero-highlight {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;
  gap: 8px;

  strong {
    font-size: 1.5rem;
  }

  span {
    color: $color-text-secondary;
  }
}

.card-matrix {
  position: relative;
}

.card-matrix__container {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }

  // 移动端单列显示
  @media (max-width: 768px) {
    gap: 12px;
  }
}

.card-matrix__indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(253, 216, 53, 0.6);
    transform: scale(1.2);
  }

  &--active {
    background: $color-yellow;
    box-shadow: 0 0 10px rgba(253, 216, 53, 0.5);
  }
}

.membership-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.detail-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
}

.benefit-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  li {
    display: flex;
    gap: 12px;
    align-items: center;

    span {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: $color-yellow;
      box-shadow: 0 0 12px rgba(253, 216, 53, 0.5);
    }

    p {
      margin: 0;
    }
  }
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.comparison-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comparison-row {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
}

.comparison-row__label {
  margin-bottom: 12px;

  p {
    margin: 0;
    font-weight: 600;
  }

  small {
    color: $color-text-secondary;
  }
}

.comparison-bars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.comparison-bar {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 8px 10px;
  position: relative;

  .comparison-bar__fill {
    display: block;
    height: 8px;
    border-radius: 6px;
    background: linear-gradient(120deg, rgba(253, 216, 53, 0.9), rgba(253, 216, 53, 0.3));
    margin-bottom: 6px;
    transition: width 0.5s ease;
  }

  small {
    color: $color-text-secondary;
    font-size: 0.8rem;
  }

  &--active {
    border: 1px solid rgba(253, 216, 53, 0.6);
    box-shadow: $shadow-glow;

    .comparison-bar__fill {
      background: linear-gradient(120deg, rgba(253, 216, 53, 1), rgba(253, 216, 53, 0.6));
      box-shadow: 0 0 10px rgba(253, 216, 53, 0.5);
    }
  }
}

.membership-faq {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.testimonial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  article {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 14px;

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    p {
      margin: 0;
      color: $color-text-secondary;
    }
  }
}

.faq-list {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  dt {
    font-weight: 600;
    margin: 0;
  }

  dd {
    margin: 4px 0 0;
    color: $color-text-secondary;
  }
}

.membership-cta {
  text-align: center;

  p {
    margin: 12px 0 0;
    color: $color-text-secondary;
  }
}

.cta-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .membership-page {
    padding: 32px 16px 60px;
  }

  .hero-actions,
  .detail-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
