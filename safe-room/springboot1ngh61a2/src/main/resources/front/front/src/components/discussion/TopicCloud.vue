<template>
  <div class="topic-cloud" :class="{ 'topic-cloud--animated': animated }">
    <div class="topic-cloud__container">
      <span
        v-for="(tag, index) in displayTags"
        :key="tag.name"
        ref="tagElements"
        :class="[
          'topic-cloud__item',
          `topic-cloud__item--${tag.level}`,
          { 'topic-cloud__item--active': activeTag === tag.name }
        ]"
        :style="getTagStyle(tag, index)"
        @click="handleTagClick(tag)"
        @mouseenter="handleTagHover(tag, true)"
        @mouseleave="handleTagHover(tag, false)"
        :aria-label="`${tag.name}标签，${tag.count}个讨论`"
        :tabindex="0"
        @keydown.enter="handleTagClick(tag)"
        @keydown.space.prevent="handleTagClick(tag)"
      >
        <span class="topic-cloud__text">{{ tag.name }}</span>
        <sup v-if="showCount && tag.count > threshold" class="topic-cloud__count">
          {{ tag.count }}
        </sup>
        <span v-if="tag.trend" class="topic-cloud__trend" :class="`topic-cloud__trend--${tag.trend}`">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path v-if="tag.trend === 'up'" d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path v-else-if="tag.trend === 'down'" d="M7 7L17 17M17 17H7M17 17V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle v-else cx="12" cy="12" r="3" fill="currentColor"/>
          </svg>
        </span>
      </span>
    </div>

    <!-- 标签统计信息 -->
    <div v-if="showStats" class="topic-cloud__stats">
      <div class="stats-item">
        <span class="stats-label">热门标签：</span>
        <span class="stats-value">{{ hotTagsCount }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">总讨论数：</span>
        <span class="stats-value">{{ totalDiscussions }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

// 类型定义
export interface TagItem {
  name: string
  count: number
  level: 'low' | 'medium' | 'high' | 'hot'
  trend?: 'up' | 'down' | 'stable'
}

// Props
interface Props {
  tags: TagItem[]
  animated?: boolean
  showCount?: boolean
  showStats?: boolean
  threshold?: number
  maxTags?: number
}

const props = withDefaults(defineProps<Props>(), {
  animated: true,
  showCount: true,
  showStats: false,
  threshold: 5,
  maxTags: 50
})

// Emits
const emit = defineEmits<{
  tagClick: [tag: TagItem]
  tagHover: [tag: TagItem, isHover: boolean]
}>()

// 状态
const tagElements = ref<HTMLElement[]>([])
const activeTag = ref<string>('')

// 计算属性
const displayTags = computed(() => {
  const sortedTags = [...props.tags]
    .sort((a, b) => b.count - a.count)
    .slice(0, props.maxTags)

  // 为标签分配位置（模拟云状布局）
  return sortedTags.map((tag, index) => ({
    ...tag,
    position: calculateTagPosition(index, sortedTags.length)
  }))
})

const hotTagsCount = computed(() => {
  return props.tags.filter(tag => tag.level === 'hot').length
})

const totalDiscussions = computed(() => {
  return props.tags.reduce((sum, tag) => sum + tag.count, 0)
})

// 方法
const calculateTagPosition = (index: number, total: number) => {
  // 使用螺旋布局算法创建云状效果
  const angle = (index / total) * Math.PI * 4 // 两圈螺旋
  const radius = Math.sqrt(index / total) * 100
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius

  return { x, y }
}

const getTagStyle = (tag: TagItem & { position: { x: number; y: number } }, index: number) => {
  const baseSize = getTagSize(tag.level)
  const position = tag.position

  return {
    fontSize: `${baseSize}rem`,
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: `translate(-50%, -50%) ${props.animated ? `rotate(${Math.sin(index) * 5}deg)` : ''}`,
    transitionDelay: `${index * 50}ms`
  }
}

const getTagSize = (level: string): number => {
  const sizes = {
    low: 0.8,
    medium: 1.0,
    high: 1.2,
    hot: 1.5
  }
  return sizes[level as keyof typeof sizes] || 1.0
}

const handleTagClick = (tag: TagItem) => {
  activeTag.value = tag.name
  emit('tagClick', tag)
}

const handleTagHover = (tag: TagItem, isHover: boolean) => {
  emit('tagHover', tag, isHover)
}

// 动画相关
const animateTags = async () => {
  if (!props.animated) return

  await nextTick()

  tagElements.value.forEach((element, index) => {
    // 添加入场动画
    element.style.opacity = '0'
    element.style.transform = 'translate(-50%, -50%) scale(0.5) rotate(-180deg)'

    setTimeout(() => {
      element.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
      element.style.opacity = '1'
      element.style.transform = element.style.transform.replace('scale(0.5) rotate(-180deg)', 'scale(1) rotate(0deg)')
    }, index * 50)
  })
}

onMounted(() => {
  animateTags()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.topic-cloud {
  width: 100%;
  min-height: 200px;
  position: relative;

  &__container {
    position: relative;
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__item {
    position: absolute;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    border-radius: 20px;
    cursor: pointer;
    user-select: none;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    font-weight: 500;
    white-space: nowrap;

    &:hover {
      transform: translate(-50%, -50%) scale(1.1) !important;
      z-index: 10;
    }

    &:focus {
      outline: 2px solid rgba(253, 216, 53, 0.5);
      outline-offset: 2px;
    }

    &--low {
      background: rgba(255, 255, 255, 0.05);
      color: $color-text-secondary;
      border-color: rgba(255, 255, 255, 0.1);

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: $color-text-primary;
      }
    }

    &--medium {
      background: rgba(74, 144, 226, 0.1);
      color: #4a90e2;
      border-color: rgba(74, 144, 226, 0.2);

      &:hover {
        background: rgba(74, 144, 226, 0.2);
        border-color: rgba(74, 144, 226, 0.4);
      }
    }

    &--high {
      background: rgba(253, 216, 53, 0.1);
      color: $color-yellow;
      border-color: rgba(253, 216, 53, 0.2);

      &:hover {
        background: rgba(253, 216, 53, 0.2);
        border-color: rgba(253, 216, 53, 0.4);
      }
    }

    &--hot {
      background: rgba(255, 152, 0, 0.1);
      color: #ff9800;
      border-color: rgba(255, 152, 0, 0.2);
      font-weight: 600;

      &:hover {
        background: rgba(255, 152, 0, 0.2);
        border-color: rgba(255, 152, 0, 0.4);
        transform: translate(-50%, -50%) scale(1.2) !important;
      }
    }

    &--active {
      border-color: rgba(253, 216, 53, 0.8) !important;
      box-shadow: $shadow-glow;
      background: rgba(253, 216, 53, 0.1) !important;
    }
  }

  &__text {
    font-size: inherit;
    line-height: 1;
  }

  &__count {
    font-size: 0.7em;
    opacity: 0.8;
    margin-left: 2px;
  }

  &__trend {
    margin-left: 4px;
    display: inline-flex;
    align-items: center;

    &--up {
      color: #4caf50;
    }

    &--down {
      color: #f44336;
    }

    &--stable {
      color: $color-text-secondary;
    }
  }

  &__stats {
    margin-top: 16px;
    display: flex;
    justify-content: center;
    gap: 24px;
    padding: 12px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: $color-text-secondary;

  .stats-label {
    font-weight: 500;
  }

  .stats-value {
    color: $color-text-primary;
    font-weight: 600;
  }
}

.topic-cloud--animated {
  .topic-cloud__item {
    animation: float 6s ease-in-out infinite;

    &:nth-child(2n) {
      animation-delay: -1s;
      animation-duration: 8s;
    }

    &:nth-child(3n) {
      animation-delay: -2s;
      animation-duration: 7s;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0px);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-5px);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .topic-cloud {
    &__container {
      height: 150px;
    }

    &__item {
      padding: 6px 10px;
      font-size: 0.8rem !important;
    }

    &__stats {
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }
  }
}

@media (max-width: 480px) {
  .topic-cloud {
    &__container {
      height: 120px;
    }

    &__item {
      padding: 4px 8px;
      font-size: 0.7rem !important;

      &:hover {
        transform: translate(-50%, -50%) scale(1.05) !important;
      }
    }
  }
}
</style>
