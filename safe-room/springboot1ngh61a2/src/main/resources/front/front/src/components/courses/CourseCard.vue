<template>
  <TechCard class="course-card" variant="solid" data-testid="course-card">
    <div class="course-card__media" :style="mediaStyle" data-testid="course-card-media">
      <span class="course-card__tag" data-testid="course-card-tag">{{ course.kechengleixing || '特色课程' }}</span>
      <span class="course-card__badge" data-testid="course-card-badge">{{ intensityLabel }}</span>
    </div>
    <div class="course-card__body" data-testid="course-card-body">
      <header class="course-card__header" data-testid="course-card-header">
        <h3 data-testid="course-card-title">{{ course.kechengmingcheng }}</h3>
        <p data-testid="course-card-description">{{ course.kechengjianjie || '沉浸式智能训练体验，匹配个人体能数据与训练目标。' }}</p>
      </header>
      <ul class="course-card__meta">
        <li>
          <label>上课时间</label>
          <span>{{ formattedDate }}</span>
        </li>
        <li>
          <label>地点</label>
          <span>{{ course.shangkedidian || '旗舰馆' }}</span>
        </li>
        <li>
          <label>私教</label>
          <span>{{ course.jiaolianxingming || '明星教练' }}</span>
        </li>
        <li>
          <label>热度</label>
          <span>{{ (course.clicknum ?? 0) + 120 }}+</span>
        </li>
      </ul>
      <div class="course-card__footer">
        <div class="course-card__price">
          <p>单次</p>
          <strong>{{ formattedPrice }}</strong>
        </div>
        <div class="course-card__actions" data-testid="course-card-actions">
          <TechButton size="sm" variant="ghost" data-testid="course-card-view-button" @click="$emit('view', course)"> 查看详情 </TechButton>
          <TechButton size="sm" data-testid="course-card-book-button" @click="$emit('book', course)"> 预约体验 </TechButton>
        </div>
      </div>
    </div>
  </TechCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Jianshenkecheng } from '@/types/modules'
import config from '@/config/config'
import { formatCurrency, formatDate } from '@/utils/formatters'

const props = defineProps<{
  course: Jianshenkecheng
  intensity?: string
}>()

const formattedDate = computed(() =>
  props.course.shangkeshijian ? formatDate(props.course.shangkeshijian) : '随时预约',
)

const formattedPrice = computed(() => (props.course.kechengjiage ? formatCurrency(props.course.kechengjiage) : '¥198'))

const mediaStyle = computed(() => {
  const url = resolveAssetUrl(props.course.tupian)
  return url
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.8) 100%), url(${url})`,
      }
    : undefined
})

const intensityLabel = computed(() => {
  if (props.intensity) return props.intensity
  const labels = ['燃脂', '增肌', '塑形', '康复']
  return labels[props.course.id ? props.course.id % labels.length : 0]
})

const resolveAssetUrl = (path?: string) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  if (!path.trim()) return ''
  const normalizedBase = config.baseUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.course-card {
  gap: 0;
  padding: 0;

  &__media {
    height: 220px;
    border-radius: $card-radius $card-radius 0 0;
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: space-between;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  &__tag,
  &__badge {
    @include pill;
    background: rgba(0, 0, 0, 0.5);
    color: $color-yellow;
    border: 1px solid rgba(253, 216, 53, 0.4);
  }

  &__badge {
    background: linear-gradient(135deg, rgba(253, 216, 53, 0.15), rgba(253, 216, 53, 0.08));
    backdrop-filter: blur(10px);
    color: $color-yellow;
    border: 1px solid rgba(253, 216, 53, 0.3);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.3),
      0 0 12px rgba(253, 216, 53, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    font-weight: 600;
    letter-spacing: 0.15em;
    padding: 6px 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: linear-gradient(135deg, rgba(253, 216, 53, 0.2), rgba(253, 216, 53, 0.12));
      border-color: rgba(253, 216, 53, 0.5);
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.4),
        0 0 16px rgba(253, 216, 53, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }
  }

  &__body {
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__header {
    h3 {
      margin: 0;
      font-size: 1.4rem;
    }

    p {
      margin: 8px 0 0;
      color: $color-text-secondary;
    }
  }

  &__meta {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;

    li {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        text-transform: uppercase;
        letter-spacing: 0.3em;
        font-size: 0.7rem;
        color: $color-text-secondary;
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 16px;
  }

  &__price {
    p {
      margin: 0;
      color: $color-text-secondary;
    }

    strong {
      font-size: 1.6rem;
      letter-spacing: 0.1em;
    }
  }

  &__actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

@media (max-width: 720px) {
  .course-card__media {
    height: 180px;
  }
}
</style>
