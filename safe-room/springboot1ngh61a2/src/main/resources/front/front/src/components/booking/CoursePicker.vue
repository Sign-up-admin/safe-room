<template>
  <section class="course-picker" data-testid="booking-course-selection">
    <div class="course-picker__filters">
      <el-input
        v-model="keywordModel"
        placeholder="搜索课程 / 关键字"
        clearable
        :prefix-icon="Search"
        data-testid="courses-search-input"
        @keyup.enter="$emit('refresh')"
      />
      <el-select v-model="typeModel" placeholder="课程类型" clearable data-testid="courses-filter-select">
        <el-option v-for="type in courseTypes" :key="type" :label="type" :value="type" />
      </el-select>
      <TechButton size="sm" @click="$emit('refresh')">搜索</TechButton>
    </div>
    <div v-loading="loading" class="course-picker__list" data-testid="courses-list-container">
      <article
        v-for="course in courses"
        :key="course.id"
        class="course-picker__item"
        :class="[{ 'course-picker__item--selected': course.id === selectedCourse?.id }]"
        :data-testid="`course-card-${course.id}`"
        @click="$emit('select', course)"
      >
        <img :src="resolveAssetUrl(course.tupian)" :alt="course.kechengmingcheng" loading="lazy" />
        <div>
          <p class="course-picker__eyebrow">{{ course.kechengleixing || '特色课程' }}</p>
          <h3 :data-testid="`course-title-${course.id}`">{{ course.kechengmingcheng }}</h3>
          <p class="course-picker__description" :data-testid="`course-description-${course.id}`">
            {{ course.kechengjianjie || '智能训练 · 动作实时纠错' }}
          </p>
        </div>
        <strong>{{ formatCurrency(course.kechengjiage || 0) }}</strong>
      </article>
      <el-empty v-if="!courses.length && !loading" description="暂无课程" />
    </div>
    <div class="course-picker__actions">
      <TechButton size="sm" variant="outline" @click="$emit('viewAll')">查看全部课程</TechButton>
      <slot name="actions" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { Jianshenkecheng } from '@/types/modules'
import { formatCurrency } from '@/utils/formatters'
import { TechButton } from '@/components/common'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    courses: Jianshenkecheng[]
    courseTypes: string[]
    selectedCourse?: Jianshenkecheng
    keyword: string
    type: string
  }>(),
  {
    loading: false,
    courses: () => [],
    courseTypes: () => [],
    keyword: '',
    type: '',
  },
)

const emit = defineEmits<{
  (e: 'update:keyword', value: string): void
  (e: 'update:type', value: string): void
  (e: 'refresh'): void
  (e: 'select', course: Jianshenkecheng): void
  (e: 'viewAll'): void
}>()

const keywordModel = computed({
  get: () => props.keyword,
  set: (value: string) => {
    emit('update:keyword', value)
  },
})

const typeModel = computed({
  get: () => props.type,
  set: (value: string) => {
    emit('update:type', value)
  },
})

function resolveAssetUrl(path?: string) {
  if (!path) return new URL('@/assets/jianshe.png', import.meta.url).href
  if (/^https?:\/\//i.test(path)) return path
  const base = import.meta.env.VITE_APP_BASE_API?.replace(/\/$/, '') || ''
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.course-picker {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-picker__filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  > * {
    flex: 1;
    min-width: 180px;
  }
}

.course-picker__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.course-picker__item {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: $transition-base;

  &--selected {
    border-color: $color-yellow;
    box-shadow: $shadow-glow;
  }

  img {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    object-fit: cover;
  }

  h3 {
    margin: 0;
  }

  strong {
    margin-left: auto;
    letter-spacing: 0.08em;
  }
}

.course-picker__eyebrow {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
}

.course-picker__description {
  margin: 4px 0 0;
  color: $color-text-secondary;
}

.course-picker__actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

@media (max-width: 640px) {
  .course-picker__actions {
    flex-direction: column;
  }
}
</style>
