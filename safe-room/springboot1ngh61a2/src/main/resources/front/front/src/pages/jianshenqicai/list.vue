<template>
  <div v-loading="loading" class="equipment-page">
    <!-- 3D器材展厅 -->
    <section class="equipment-showroom">
      <div class="showroom-header">
        <h2>3D器材展厅</h2>
        <p>沉浸式体验 · 智能推荐</p>
      </div>

      <div ref="showroomRef" class="showroom-3d">
        <div
          v-for="(equipment, index) in featuredEquipment"
          :key="equipment.id"
          class="equipment-3d-item"
          :style="{ transform: `translateZ(${index * 50}px)` }"
          @click="() => {}"
        >
          <div class="equipment-3d-card">
            <div class="equipment-3d-image">
              <img :src="resolveAssetUrl(equipment.tupian)" :alt="equipment.qicaimingcheng" />
              <div class="equipment-3d-overlay">
                <h4>{{ equipment.qicaimingcheng }}</h4>
                <p>{{ equipment.qicaileixing }}</p>
              </div>
            </div>
            <div class="equipment-3d-info">
              <div class="equipment-specs">
                <span class="spec-item">难度: {{ equipment.nandu }}</span>
                <span class="spec-item">适用: {{ equipment.shiyongrenqun }}</span>
              </div>
              <TechButton size="sm" @click.stop="viewTutorial(equipment)">使用教程</TechButton>
            </div>
          </div>
        </div>
      </div>

      <!-- 控制面板 -->
      <div class="showroom-controls">
        <button class="control-btn" @click="rotateShowroom(-90)">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button class="control-btn control-btn--reset" @click="resetShowroom">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12a9 9 0 0115-6.7L21 8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M21 3v5h-5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M21 12a9 9 0 01-15 6.7L3 16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3 21v-5h5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button class="control-btn" @click="rotateShowroom(90)">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- 智能推荐 -->
      <div v-if="selectedEquipment" class="showroom-recommendations">
        <h3>为你推荐</h3>
        <div class="recommendations-grid">
          <div
            v-for="rec in getRecommendations()"
            :key="rec.id"
            class="recommendation-item"
            @click="selectForShowcase(rec)"
          >
            <img :src="resolveAssetUrl(rec.tupian)" :alt="rec.qicaimingcheng" />
            <div class="recommendation-info">
              <h4>{{ rec.qicaimingcheng }}</h4>
              <p>{{ rec.qicaileixing }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="equipment-hero">
      <div>
        <p class="section-eyebrow">EQUIPMENT LAB</p>
        <h1>沉浸式器材展厅 · 选择你的训练搭档</h1>
        <p>按照肌群/训练目的筛选器材，查看参数、教程与预约入口。</p>
        <div class="hero-actions">
          <TechButton size="lg" @click="goBooking">预约体验</TechButton>
          <TechButton size="lg" variant="outline" @click="refresh">刷新数据</TechButton>
        </div>
      </div>
      <div class="hero-visual">
        <div class="orb"></div>
        <div class="grid"></div>
      </div>
    </section>

    <section class="equipment-filters">
      <div class="filter-group">
        <label>分类</label>
        <div class="filter-tags">
          <button
            v-for="category in categories"
            :key="category"
            class="filter-tag"
            :class="[{ 'filter-tag--active': filters.category === category }]"
            @click="filters.category = category"
          >
            {{ category }}
          </button>
        </div>
      </div>
      <div class="filter-group">
        <label>难度</label>
        <div class="filter-tags">
          <button
            v-for="level in levels"
            :key="level"
            class="filter-tag"
            :class="[{ 'filter-tag--active': filters.level === level }]"
            @click="filters.level = level"
          >
            {{ level }}
          </button>
        </div>
      </div>
    </section>

    <section class="equipment-grid">
      <TechCard v-for="item in filteredEquipment" :key="item.id" class="equipment-card" :interactive="false">
        <div class="equipment-media">
          <img :src="resolveAssetUrl(item.tupian)" :alt="item.qicaimingcheng" />
          <span class="equipment-chip">{{ item.pinpai || '智能器材' }}</span>
        </div>
        <div class="equipment-body">
          <h3>{{ item.qicaimingcheng }}</h3>
          <p>{{ item.qicaijieshao || '沉浸式训练体验，支持数据追踪。' }}</p>
          <ul class="equipment-tags">
            <li>{{ item.shoushenxiaoguo || '综合训练' }}</li>
            <li>{{ deriveDifficulty(item) }}</li>
          </ul>
        </div>
        <div class="equipment-actions">
          <TechButton size="sm" variant="outline" @click="selectForShowcase(item)">3D展示</TechButton>
          <TechButton size="sm" variant="outline" @click="viewTutorial(item)">查看教程</TechButton>
          <TechButton size="sm" @click="viewDetail(item)">查看详情</TechButton>
        </div>
      </TechCard>
      <el-empty v-if="!filteredEquipment.length && !loading" description="暂无符合条件的器材" />
    </section>

    <section v-if="selectedEquipment" class="showcase-section">
      <TechCard title="3D器材展示" subtitle="沉浸式体验 · 360°查看">
        <Equipment3DViewer :equipment="selectedEquipment" />
      </TechCard>
    </section>

    <section v-if="featuredTutorials.length" class="tutorial-section">
      <TechCard title="器材教程精选" subtitle="图文 & 视频">
        <div class="tutorial-grid">
          <article v-for="tutorial in featuredTutorials" :key="tutorial.id">
            <h4>{{ tutorial.qicaimingcheng }}</h4>
            <p>{{ tutorial.shiyongfangfa || '敬请期待教程详情' }}</p>
            <TechButton size="sm" variant="text" @click="viewDetail(tutorial)">查看详情</TechButton>
          </article>
        </div>
      </TechCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { TechButton, TechCard, Equipment3DViewer } from '@/components/common'
import { getModuleService } from '@/services/crud'
import type { Jianshenqicai } from '@/types/modules'

const router = useRouter()
const equipmentService = getModuleService('jianshenqicai')

// 3D展厅相关状态
const showroomRotation = ref(0)
const selectedEquipment = ref<Jianshenqicai | null>(null)
const featuredEquipment = ref<Jianshenqicai[]>([])

const equipment = ref<Jianshenqicai[]>([])
const loading = ref(false)
const filters = reactive({ category: '全部', level: '全部' })

const categories = ['全部', '胸背', '下肢', '核心', '功能性']
const levels = ['全部', '初学', '进阶', '专业']

onMounted(() => {
  refresh()
})

function refresh() {
  loadEquipment()
}

async function loadEquipment() {
  loading.value = true
  try {
    const { list } = await equipmentService.list({ page: 1, limit: 12 })
    equipment.value = list ?? []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const filteredEquipment = computed(() =>
  equipment.value.filter(item => {
    const matchCategory = filters.category === '全部' || (item.shoushenxiaoguo || '').includes(filters.category)
    const matchLevel = filters.level === '全部' || deriveDifficulty(item) === filters.level
    return matchCategory && matchLevel
  }),
)

const featuredTutorials = computed(() => equipment.value.filter(item => item.shiyongfangfa).slice(0, 3))

function deriveDifficulty(item: Jianshenqicai) {
  if (!item.shiyongfangfa) return '进阶'
  if (item.shiyongfangfa.includes('初学') || item.shiyongfangfa.includes('友好')) return '初学'
  if (item.shiyongfangfa.includes('专业') || item.shiyongfangfa.includes('竞赛')) return '专业'
  return '进阶'
}

function resolveAssetUrl(path?: string) {
  if (!path) return new URL('@/assets/jianshe.png', import.meta.url).href
  if (/^https?:\/\//i.test(path)) return path
  const base = import.meta.env.VITE_APP_BASE_API?.replace(/\/$/, '') || ''
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

function viewDetail(item: Jianshenqicai) {
  selectedEquipment.value = item
  router.push({ path: '/index/jianshenqicaiDetail', query: { id: item.id } })
}

function selectForShowcase(item: Jianshenqicai) {
  selectedEquipment.value = item
  // 滚动到3D展示区域
  const showcaseSection = document.querySelector('.showcase-section')
  if (showcaseSection) {
    showcaseSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function viewTutorial(item: Jianshenqicai) {
  router.push({ path: '/index/jianshenqicaiDetail', query: { id: item.id, tab: 'tutorial' } })
}

function goBooking() {
  router.push('/index/kechengyuyue')
}

function rotateShowroom(angle: number) {
  showroomRotation.value = (showroomRotation.value + angle) % 360
}

function resetShowroom() {
  showroomRotation.value = 0
}

function getRecommendations() {
  // 基于当前选中的设备生成推荐
  if (!selectedEquipment.value) return []

  const currentCategory = selectedEquipment.value.shoushenxiaoguo || ''
  return equipment.value
    .filter(item => item.id !== selectedEquipment.value?.id)
    .filter(item => item.shoushenxiaoguo?.includes(currentCategory.split('·')[0] || ''))
    .slice(0, 4)
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.equipment-page {
  padding: 48px 6vw 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.equipment-hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  align-items: center;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.hero-visual {
  position: relative;
  min-height: 220px;
  border-radius: 32px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.orb {
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(253, 216, 53, 0.6), transparent 60%);
  top: 30px;
  left: 50px;
  animation: orbFloat 6s ease-in-out infinite;
}

.grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

@keyframes orbFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.equipment-filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    color: $color-text-secondary;
    letter-spacing: 0.1em;
  }
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 6px 14px;
  background: transparent;
  cursor: pointer;

  &--active {
    border-color: rgba(253, 216, 53, 0.8);
    color: $color-yellow;
    box-shadow: $shadow-glow;
  }
}

.equipment-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.equipment-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  overflow: hidden;
}

.equipment-media {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);

  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
}

.equipment-chip {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 24px);
}

.equipment-body {
  min-width: 0;

  h3 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0 0 8px;
  }

  p {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin: 0 0 8px;
  }
}

.equipment-tags {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  li {
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    padding: 2px 10px;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}

.equipment-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tutorial-section {
  margin-top: 16px;
}

.tutorial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;

  article {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 12px;
  }
}

@media (max-width: 640px) {
  .equipment-page {
    padding: 32px 16px 60px;
  }
}
</style>
