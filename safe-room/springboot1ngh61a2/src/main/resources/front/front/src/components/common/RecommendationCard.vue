<template>
  <div class="recommendation-card" :class="{ 'recommendation-card--interactive': interactive }">
    <div class="recommendation-header">
      <div class="recommendation-badge" :class="`recommendation-badge--${type}`">
        <component :is="getIcon()" size="16" />
        <span>{{ getTypeLabel() }}</span>
      </div>
      <div v-if="showScore" class="recommendation-score">
        <span class="score-label">匹配度</span>
        <div class="score-bar">
          <div class="score-fill" :style="{ width: `${score}%` }"></div>
        </div>
        <span class="score-value">{{ score }}%</span>
      </div>
    </div>

    <div class="recommendation-content">
      <h4 class="recommendation-title">
        <component :is="interactive ? 'button' : 'span'" :class="{ 'title-link': interactive }" @click="handleClick">
          {{ item.title || item.name }}
        </component>
      </h4>

      <p v-if="item.description" class="recommendation-description">
        {{ item.description }}
      </p>

      <div v-if="item.meta" class="recommendation-meta">
        <span v-for="(meta, index) in item.meta" :key="index" class="meta-item">
          {{ meta.label }}: {{ meta.value }}
        </span>
      </div>

      <div v-if="item.tags && item.tags.length" class="recommendation-tags">
        <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag"> #{{ tag }} </span>
      </div>
    </div>

    <div v-if="interactive" class="recommendation-actions">
      <button
        class="action-btn like-btn"
        :class="{ 'like-btn--liked': item.isLiked }"
        :aria-label="`点赞 ${item.title || item.name}`"
        @click="handleLike"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ item.likes || 0 }}
      </button>

      <button class="action-btn share-btn" :aria-label="`分享 ${item.title || item.name}`" @click="handleShare">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <polyline
            points="16,6 12,2 8,6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <line
            x1="12"
            y1="2"
            x2="12"
            y2="15"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        分享
      </button>

      <button class="action-btn dismiss-btn" :aria-label="`不再推荐 ${item.title || item.name}`" @click="handleDismiss">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <!-- 推荐理由 -->
    <div v-if="reason" class="recommendation-reason">
      <small class="reason-text">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
          <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        {{ reason }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = withDefaults(defineProps<Props>(), {
  type: 'discussion',
  showScore: true,
  interactive: true,
})
// Emits
const emit = defineEmits<{
  click: [item: RecommendationItem]
  like: [item: RecommendationItem]
  share: [item: RecommendationItem]
  dismiss: [item: RecommendationItem]
}>()
// 图标组件
const Star = 'Star'
const TrendingUp = 'TrendingUp'
const Users = 'Users'
const BookOpen = 'BookOpen'

// Props
interface RecommendationItem {
  id: string | number
  title?: string
  name?: string
  description?: string
  meta?: Array<{ label: string; value: string }>
  tags?: string[]
  likes?: number
  isLiked?: boolean
  type: 'discussion' | 'course' | 'user' | 'topic'
  score?: number
}

interface Props {
  item: RecommendationItem
  type?: 'discussion' | 'course' | 'user' | 'topic'
  score?: number
  reason?: string
  showScore?: boolean
  interactive?: boolean
}

// 计算属性
const score = computed(() => props.score || props.item.score || 0)

// 方法
const getIcon = () => {
  switch (props.type) {
    case 'discussion':
      return BookOpen
    case 'course':
      return BookOpen
    case 'user':
      return Users
    case 'topic':
      return TrendingUp
    default:
      return Star
  }
}

const getTypeLabel = () => {
  switch (props.type) {
    case 'discussion':
      return '讨论'
    case 'course':
      return '课程'
    case 'user':
      return '用户'
    case 'topic':
      return '话题'
    default:
      return '推荐'
  }
}

const handleClick = () => {
  emit('click', props.item)
}

const handleLike = () => {
  emit('like', props.item)
}

const handleShare = () => {
  // 模拟分享功能
  const url = `${window.location.origin}/item/${props.item.id}`
  if (navigator.share) {
    navigator.share({
      title: props.item.title || props.item.name,
      text: props.item.description,
      url: url,
    })
  } else {
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
  }
  emit('share', props.item)
}

const handleDismiss = () => {
  emit('dismiss', props.item)
  ElMessage.info('已减少此类推荐')
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens/index.scss';

.recommendation-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-16);
  transition: var(--transition-normal);
  position: relative;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-card);
  }

  &--interactive {
    cursor: pointer;
  }
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-12);
}

.recommendation-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4) var(--spacing-8);
  border-radius: var(--border-radius-full);
  font-size: 0.75rem;
  font-weight: 600;

  &--discussion {
    background: rgba(74, 144, 226, 0.1);
    color: #4a90e2;
  }

  &--course {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }

  &--user {
    background: rgba(255, 152, 0, 0.1);
    color: #ff9800;
  }

  &--topic {
    background: rgba(244, 67, 54, 0.1);
    color: #f44336;
  }
}

.recommendation-score {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.score-label {
  font-weight: 500;
}

.score-bar {
  width: 60px;
  height: 4px;
  background: var(--color-bg-ghost);
  border-radius: 2px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-success));
  border-radius: 2px;
  transition: width var(--duration-normal) var(--easing-out);
}

.score-value {
  font-weight: 600;
  color: var(--color-text-primary);
  min-width: 32px;
  text-align: right;
}

.recommendation-content {
  margin-bottom: var(--spacing-12);
}

.recommendation-title {
  margin: 0 0 var(--spacing-8) 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;

  .title-link {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    text-align: left;
    cursor: pointer;
    text-decoration: none;

    &:hover {
      color: var(--color-primary);
    }
  }
}

.recommendation-description {
  margin: 0 0 var(--spacing-8) 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommendation-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-12);
  margin-bottom: var(--spacing-8);
}

.meta-item {
  font-size: 0.8rem;
  color: var(--color-text-secondary);

  &::before {
    content: '•';
    margin-right: var(--spacing-4);
    color: var(--color-text-muted);
  }
}

.recommendation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.tag {
  padding: var(--spacing-2) var(--spacing-6);
  background: var(--color-bg-ghost);
  color: var(--color-text-secondary);
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.recommendation-actions {
  display: flex;
  gap: var(--spacing-8);
  padding-top: var(--spacing-12);
  border-top: 1px solid var(--color-border-light);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-6) var(--spacing-8);
  background: var(--color-bg-ghost);
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius-md);
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--color-border-medium);
    color: var(--color-text-primary);
  }

  &.like-btn {
    &--liked {
      background: rgba(244, 67, 54, 0.1);
      border-color: #f44336;
      color: #f44336;

      svg {
        fill: currentColor;
      }
    }
  }

  &.share-btn:hover {
    background: rgba(74, 144, 226, 0.1);
    border-color: #4a90e2;
    color: #4a90e2;
  }

  &.dismiss-btn:hover {
    background: rgba(244, 67, 54, 0.1);
    border-color: #f44336;
    color: #f44336;
  }
}

.recommendation-reason {
  margin-top: var(--spacing-8);
  padding-top: var(--spacing-8);
  border-top: 1px dashed var(--color-border-light);
}

.reason-text {
  display: inline-flex;
  align-items: flex-start;
  gap: var(--spacing-4);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  line-height: 1.4;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .recommendation-card {
    padding: var(--spacing-12);
  }

  .recommendation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-8);
  }

  .recommendation-actions {
    flex-wrap: wrap;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
    min-width: 80px;
  }

  .recommendation-meta {
    gap: var(--spacing-8);
  }
}

@media (max-width: 480px) {
  .recommendation-score {
    width: 100%;
    justify-content: space-between;
  }

  .score-bar {
    flex: 1;
    max-width: 80px;
  }

  .recommendation-tags {
    justify-content: center;
  }

  .tag {
    font-size: 0.7rem;
    padding: var(--spacing-1) var(--spacing-4);
  }
}
</style>
