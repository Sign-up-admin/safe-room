<template>
  <div v-loading="loading" class="equipment-detail">
    <section class="detail-hero">
      <div class="hero-content">
        <div class="breadcrumb">
          <TechButton size="sm" variant="text" @click="$emit('back')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            返回列表
          </TechButton>
        </div>
        <h1>{{ record?.qicaimingcheng }}</h1>
        <p class="equipment-subtitle">{{ record?.qicaijieshao || '沉浸式训练体验，支持数据追踪。' }}</p>
        <div class="equipment-meta">
          <span class="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M20 7h-3V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z"
              />
              <path d="M14 12v3" />
              <path d="M8 12v3" />
            </svg>
            {{ record?.pinpai || '智能器材' }}
          </span>
          <span class="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10,8 16,12 10,16 10,8" />
            </svg>
            {{ deriveDifficulty(record) }}
          </span>
          <span class="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
              />
            </svg>
            {{ record?.shoushenxiaoguo || '综合训练' }}
          </span>
        </div>
      </div>
      <div class="hero-visual">
        <div v-if="record?.tupian" class="equipment-image">
          <img :src="resolveAssetUrl(record.tupian)" :alt="record.qicaimingcheng" />
        </div>
        <div v-else class="equipment-placeholder">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path
              d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
            />
          </svg>
          <p>器材图片</p>
        </div>
      </div>
    </section>

    <section class="detail-tabs">
      <div class="tab-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-button"
          :class="[{ 'tab-button--active': activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="tab-content">
        <!-- 3D展示标签页 -->
        <div v-if="activeTab === '3d'" class="tab-panel">
          <TechCard title="3D沉浸体验" subtitle="360°全方位查看 · 交互式操作">
            <Equipment3DViewer v-if="record" :equipment="record" />
          </TechCard>
        </div>

        <!-- 规格参数标签页 -->
        <div v-if="activeTab === 'specs'" class="tab-panel">
          <TechCard title="技术规格" subtitle="详细参数信息">
            <div class="specs-grid">
              <div class="spec-row">
                <span class="spec-label">器材名称</span>
                <span class="spec-value">{{ record?.qicaimingcheng }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">品牌</span>
                <span class="spec-value">{{ record?.pinpai || '智能器材' }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">训练效果</span>
                <span class="spec-value">{{ record?.shoushenxiaoguo || '综合训练' }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">重量</span>
                <span class="spec-value">{{ record?.zhongliang || '待补充' }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">尺寸</span>
                <span class="spec-value">{{ record?.chicun || '待补充' }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">难度等级</span>
                <span class="spec-value">{{ deriveDifficulty(record) }}</span>
              </div>
            </div>
          </TechCard>
        </div>

        <!-- 使用教程标签页 -->
        <div v-if="activeTab === 'tutorial'" class="tab-panel">
          <TechCard title="使用教程" subtitle="图文指导 · 安全要点">
            <div v-if="record?.shiyongfangfa" class="tutorial-content">
              <SafeHtml :html="record.shiyongfangfa" />
            </div>
            <div v-else class="tutorial-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10,8 16,12 10,16 10,8" />
              </svg>
              <h3>教程内容制作中</h3>
              <p>我们正在准备详细的使用教程，请稍后查看。</p>
            </div>
          </TechCard>
        </div>

        <!-- 预约体验标签页 -->
        <div v-if="activeTab === 'booking'" class="tab-panel">
          <TechCard title="预约体验" subtitle="立即预约 · 专业指导">
            <div class="booking-section">
              <p class="booking-intro">体验这款专业器材，感受科技带来的训练革新。我们的教练将为您提供个性化指导。</p>
              <div class="booking-actions">
                <TechButton size="lg" @click="goBooking">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  预约体验
                </TechButton>
                <TechButton size="lg" variant="outline" @click="goCourseList">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                  查看课程
                </TechButton>
              </div>
            </div>
          </TechCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TechButton, TechCard, Equipment3DViewer } from '@/components/common'
import { getModuleService } from '@/services/crud'
import SafeHtml from '@/components/common/SafeHtml.vue'
import type { Jianshenqicai } from '@/types/modules'

interface Emits {
  (e: 'back'): void
}

const props = defineProps<{
  id?: number | string
}>()

defineEmits<Emits>()

const router = useRouter()
const equipmentService = getModuleService('jianshenqicai')

const record = ref<Jianshenqicai | null>(null)
const loading = ref(false)
const activeTab = ref('3d')

const tabs = [
  { key: '3d', label: '3D展示' },
  { key: 'specs', label: '技术规格' },
  { key: 'tutorial', label: '使用教程' },
  { key: 'booking', label: '预约体验' },
]

onMounted(() => {
  if (props.id) {
    loadEquipmentDetail()
  }
})

async function loadEquipmentDetail() {
  loading.value = true
  try {
    const detail = await equipmentService.detail(props.id!)
    // detail 可能是字符串或对象，根据实际API返回调整
    if (typeof detail === 'string') {
      // 如果是字符串，可能需要额外处理或这是错误的情况
      console.warn('Detail returned as string:', detail)
      record.value = null
    } else {
      record.value = detail as Jianshenqicai
    }
  } catch (error) {
    console.error(error)
    record.value = null
  } finally {
    loading.value = false
  }
}

function resolveAssetUrl(path?: string) {
  if (!path) return new URL('@/assets/jianshe.png', import.meta.url).href
  if (/^https?:\/\//i.test(path)) return path
  const base = import.meta.env.VITE_APP_BASE_API?.replace(/\/$/, '') || ''
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

function deriveDifficulty(equipment?: Jianshenqicai | null) {
  if (!equipment?.shiyongfangfa) return '进阶'
  if (equipment.shiyongfangfa.includes('初学') || equipment.shiyongfangfa.includes('友好')) return '初学'
  if (equipment.shiyongfangfa.includes('专业') || equipment.shiyongfangfa.includes('竞赛')) return '专业'
  return '进阶'
}

function goBooking() {
  router.push('/index/kechengyuyue')
}

function goCourseList() {
  router.push('/index/jianshenkecheng')
}
</script>

<style scoped lang="scss">
.equipment-detail {
  min-height: 100vh;
  background:
    radial-gradient(circle at 10% 20%, rgba(253, 216, 53, 0.18), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(253, 216, 53, 0.12), transparent 45%), #020202;
  padding: 48px 24px 80px;
}

.detail-hero {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 48px;
  align-items: center;
  margin-bottom: 48px;
}

.hero-content {
  .breadcrumb {
    margin-bottom: 16px;
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 16px 0;
    background: linear-gradient(135deg, #fdd835, #ffb300);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .equipment-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 24px 0;
    line-height: 1.6;
  }
}

.equipment-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;

    svg {
      color: rgba(253, 216, 53, 0.8);
    }
  }
}

.hero-visual {
  .equipment-image {
    border-radius: 24px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);

    img {
      width: 100%;
      height: 300px;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    &:hover img {
      transform: scale(1.05);
    }
  }

  .equipment-placeholder {
    height: 300px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px dashed rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);

    svg {
      margin-bottom: 16px;
    }

    h3 {
      margin: 0 0 8px 0;
      font-size: 1.2rem;
    }

    p {
      margin: 0;
      font-size: 0.9rem;
    }
  }
}

.detail-tabs {
  max-width: 1200px;
  margin: 0 auto;
}

.tab-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.tab-button {
  padding: 12px 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;

  &--active {
    border-color: rgba(253, 216, 53, 0.8);
    color: #fdd835;
    box-shadow: 0 0 20px rgba(253, 216, 53, 0.3);
  }
}

.tab-content {
  .tab-panel {
    animation: fadeIn 0.3s ease;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.spec-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);

  .spec-label {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }

  .spec-value {
    color: #fff;
    font-weight: 600;
  }
}

.tutorial-content {
  :deep(p) {
    margin-bottom: 16px;
    line-height: 1.6;
  }

  :deep(ul),
  :deep(ol) {
    margin-bottom: 16px;
    padding-left: 24px;
  }

  :deep(li) {
    margin-bottom: 8px;
  }
}

.tutorial-placeholder {
  text-align: center;
  padding: 48px;
  color: rgba(255, 255, 255, 0.5);

  svg {
    margin-bottom: 24px;
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 16px 0;
    font-size: 1.5rem;
  }

  p {
    margin: 0;
    font-size: 1rem;
  }
}

.booking-section {
  text-align: center;

  .booking-intro {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 32px;
    line-height: 1.6;
  }

  .booking-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 1024px) {
  .detail-hero {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .hero-visual {
    order: -1;
  }
}

@media (max-width: 768px) {
  .equipment-detail {
    padding: 32px 16px 60px;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .specs-grid {
    grid-template-columns: 1fr;
  }

  .tab-nav {
    flex-wrap: wrap;
  }

  .booking-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
