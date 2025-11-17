<template>
  <section class="coach-recommend">
    <div class="coach-recommend__filters">
      <el-input
        v-model="keywordModel"
        placeholder="教练姓名 / 擅长"
        clearable
        :prefix-icon="Search"
        @keyup.enter="$emit('refresh')"
      />
      <el-select v-model="skillModel" placeholder="擅长领域" clearable>
        <el-option v-for="skill in skillOptions" :key="skill" :label="skill" :value="skill" />
      </el-select>
      <el-select v-model="priceModel" placeholder="价格上限">
        <el-option v-for="price in priceOptions" :key="price" :label="`≤ ¥${price}`" :value="price" />
      </el-select>
      <TechButton size="sm" @click="$emit('refresh')">搜索</TechButton>
    </div>

    <div class="coach-recommend__list" v-loading="loading">
      <article
        v-for="(coach, index) in coaches"
        :key="coach.id"
        :class="['coach-card', { 'coach-card--active': coach.id === selectedCoach?.id }]"
        :style="{ '--index': index }"
        @click="$emit('select', coach)"
        @mouseenter="handleCardHover($event)"
        @mouseleave="handleCardLeave($event)"
      >
        <img :src="resolveAssetUrl(coach.zhaopian)" :alt="coach.jiaolianxingming" loading="lazy" />
        <div class="coach-card__body">
          <p class="coach-card__eyebrow">{{ coach.gerenjianjie?.slice(0, 12) || '综合训练' }}</p>
          <h3>{{ coach.jiaolianxingming }}</h3>
          <p class="coach-card__desc">{{ coach.gerenjianjie || '全能私教 · 训练周期定制' }}</p>
          <div v-if="coach.recommendReason" class="coach-card__reason">
            <span class="recommend-badge">推荐</span>
            {{ coach.recommendReason }}
          </div>
          <div class="coach-card__meta">
            <span>¥{{ coach.sijiaojiage || 499 }}/45min</span>
            <span>评分 {{ Number(coach.rating || deriveRating(coach)).toFixed(1) }}</span>
          </div>
        </div>
      </article>
      <el-empty v-if="!coaches.length && !loading" description="暂无教练" />
    </div>

    <div class="coach-recommend__actions">
      <TechButton size="sm" variant="ghost" @click="$emit('viewAll')">查看明星教练</TechButton>
      <slot name="actions" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import gsap from 'gsap'
import type { Jianshenjiaolian } from '@/types/modules'
import { TechButton } from '@/components/common'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    coaches: Jianshenjiaolian[]
    selectedCoach?: Jianshenjiaolian
    keyword: string
    skill: string
    price: number
    skillOptions: string[]
    priceOptions: number[]
  }>(),
  {
    loading: false,
    coaches: () => [],
    keyword: '',
    skill: '',
    price: 600,
    skillOptions: () => [],
    priceOptions: () => [],
  },
)

const emit = defineEmits<{
  (e: 'update:keyword', value: string): void
  (e: 'update:skill', value: string): void
  (e: 'update:price', value: number): void
  (e: 'refresh'): void
  (e: 'select', coach: Jianshenjiaolian): void
  (e: 'viewAll'): void
}>()

const keywordModel = computed({
  get: () => props.keyword,
  set: (value: string) => emit('update:keyword', value),
})

const skillModel = computed({
  get: () => props.skill,
  set: (value: string) => emit('update:skill', value),
})

const priceModel = computed({
  get: () => props.price,
  set: (value: number) => emit('update:price', value),
})

function deriveRating(coach: Jianshenjiaolian) {
  return (4.7 + ((coach.id ?? 0) % 4) * 0.05).toFixed(2)
}

function resolveAssetUrl(path?: string) {
  if (!path) return new URL('@/assets/touxiang.png', import.meta.url).href
  if (/^https?:\/\//i.test(path)) return path
  const base = import.meta.env.VITE_APP_BASE_API?.replace(/\/$/, '') || ''
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

function handleCardHover(event: MouseEvent) {
  const card = event.currentTarget as HTMLElement
  gsap.to(card, {
    y: -8,
    scale: 1.02,
    rotationY: 5,
    boxShadow: '0 12px 32px rgba(253, 216, 53, 0.3)',
    duration: 0.3,
    ease: 'power2.out',
  })
}

function handleCardLeave(event: MouseEvent) {
  const card = event.currentTarget as HTMLElement
  gsap.to(card, {
    y: 0,
    scale: 1,
    rotationY: 0,
    boxShadow: 'none',
    duration: 0.3,
    ease: 'power2.out',
  })
}

onMounted(() => {
  // 初始进入动画
  gsap.from('.coach-card', {
    y: 30,
    opacity: 0,
    stagger: 0.1,
    duration: 0.5,
    ease: 'power3.out',
  })
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.coach-recommend {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coach-recommend__filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.coach-recommend__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.coach-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: $transition-base;
  transform-style: preserve-3d;
  perspective: 1000px;
  will-change: transform, box-shadow;

  &--active {
    border-color: $color-yellow;
    box-shadow: $shadow-glow;
  }

  &:hover {
    border-color: rgba(253, 216, 53, 0.6);
  }

  img {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.1);
  }
}

.coach-card__body {
  flex: 1;

  h3 {
    margin: 0;
  }
}

.coach-card__eyebrow {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
}

.coach-card__desc {
  margin: 6px 0;
  color: $color-text-secondary;
  min-height: 36px;
}

.coach-card__reason {
  margin: 8px 0;
  font-size: 0.8rem;
  color: $color-yellow;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.recommend-badge {
  background: linear-gradient(120deg, #fdd835, #f6c300);
  color: #000;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.coach-card__meta {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: $color-text-secondary;
}

.coach-recommend__actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

@media (max-width: 640px) {
  .coach-recommend__actions {
    flex-direction: column;
  }
}
</style>

