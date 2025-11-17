<template>
  <div class="discuss-page" v-loading="loading" role="main" aria-labelledby="discuss-heading">
    <!-- 跳过链接 -->
    <a href="#main-content" class="skip-link sr-only">跳到主要内容</a>
    <a href="#search-section" class="skip-link sr-only">跳到搜索区域</a>
    <a href="#hot-topics-section" class="skip-link sr-only">跳到热门话题</a>
    <a href="#discussions-section" class="skip-link sr-only">跳到讨论列表</a>

    <header class="discuss-hero" id="main-content">
      <div>
        <p class="section-eyebrow">COMMUNITY LAB</p>
        <h1 id="discuss-heading">课程讨论区</h1>
        <p class="hero-description">围绕课程体验、训练技巧与饮食分享，随时发声。</p>
      </div>
      <div class="hero-actions">
        <TechButton
          size="sm"
          @click="showComposer = true"
          aria-label="发布新讨论"
        >
          发布讨论
        </TechButton>
      </div>
    </header>

    <!-- 热门话题区域 -->
    <section id="hot-topics-section" class="hot-topics" aria-labelledby="hot-topics-heading">
      <TechCard title="热门话题" subtitle="精选讨论 · 热门排行">
        <!-- 时间范围选择器 -->
        <div class="time-range-selector" role="group" aria-label="选择热门话题时间范围">
          <button
            v-for="range in timeRangeOptions"
            :key="range.value"
            :class="['time-range-btn', { 'active': selectedTimeRange === range.value }]"
            @click="changeTimeRange(range.value)"
            :aria-pressed="selectedTimeRange === range.value"
            :aria-label="`查看${range.label}热门话题`"
          >
            {{ range.label }}
          </button>
        </div>

        <!-- 热门话题网格 -->
        <div
          ref="hotTopicsContainer"
          class="topics-grid"
          role="list"
          aria-label="热门话题列表"
          tabindex="0"
          @focus="activateHotTopicsNav"
        >
          <div
            v-for="(topic, index) in currentHotTopics"
            :key="topic.id"
            class="topic-card"
            @click="handleTopicClick(topic, index)"
            role="listitem"
            tabindex="-1"
            :aria-label="`${topic.title}话题，热度${topic.heat}，${topic.postCount}个讨论`"
            @keydown.enter="handleTopicClick(topic, index)"
            @keydown.space.prevent="handleTopicClick(topic, index)"
          >
            <div class="topic-header">
              <h4>{{ topic.title }}</h4>
              <div class="topic-badges">
                <span class="topic-heat">{{ topic.heat }}</span>
                <span class="topic-trend" :class="`trend--${topic.trend}`">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path v-if="topic.trend === 'up'" d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path v-else-if="topic.trend === 'hot'" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2"/>
                    <circle v-else cx="12" cy="12" r="3" fill="currentColor"/>
                  </svg>
                </span>
              </div>
            </div>
            <p class="topic-desc">{{ topic.description }}</p>
            <div class="topic-meta">
              <span class="topic-posts">{{ topic.postCount }} 个讨论</span>
              <span class="topic-activity">{{ formatTimeAgo(topic.lastActivity) }}</span>
            </div>
          </div>
        </div>

        <!-- 推荐话题提示 -->
        <div v-if="recommendedTopics.length > 0" class="recommendation-hint">
          <TechButton size="sm" variant="outline" @click="showRecommendations = !showRecommendations">
            💡 个性化推荐
          </TechButton>
          <div v-if="showRecommendations" class="recommendations-list">
            <h5>根据您的兴趣推荐：</h5>
            <div class="recommendation-tags">
              <span
                v-for="topic in recommendedTopics.slice(0, 3)"
                :key="topic.id"
                class="recommendation-tag"
                @click="goToTopic(topic)"
              >
                {{ topic.title }}
              </span>
            </div>
          </div>
        </div>
      </TechCard>
    </section>

    <!-- 标签云 -->
    <section id="tag-cloud-section" class="tag-cloud-section" aria-labelledby="tag-cloud-heading">
      <TechCard title="话题标签" subtitle="发现感兴趣的内容">
        <TopicCloud
          :tags="allTags"
          :animated="true"
          :show-count="true"
          :show-stats="true"
          @tag-click="handleTagCloudClick"
          @tag-hover="handleTagHover"
        />
      </TechCard>
    </section>

    <!-- 高级筛选区域 -->
    <section id="search-section" class="advanced-search-section" role="search" aria-label="高级搜索和筛选">
      <AdvancedFilters
        v-model="searchFilters"
        :available-courses="availableCourses"
        :available-tags="availableTags"
        :result-stats="filterStats"
        @search="handleAdvancedSearch"
        @reset="handleResetFilters"
        @keyword-change="handleKeywordChange"
        @author-change="handleAuthorChange"
      />
    </section>

    <section
      id="discussions-section"
      ref="discussionsContainer"
      class="discuss-list"
      aria-label="讨论列表"
      tabindex="0"
      @focus="activateDiscussionsNav"
    >
      <TechCard
        v-for="(item, index) in discussions"
        :key="item.id"
        class="discuss-card"
        :class="{
          'discuss-card--pinned': item.isPinned,
          'discuss-card--featured': item.isFeatured,
          'discuss-card--hot': item.isHot
        }"
        :interactive="false"
        role="article"
        tabindex="-1"
        :aria-labelledby="`discuss-title-${item.id}`"
        :aria-describedby="`discuss-content-${item.id} discuss-meta-${item.id}`"
        @click="handleDiscussionClick(item, index)"
        @keydown.enter="handleDiscussionClick(item, index)"
        @keydown.space.prevent="handleDiscussionClick(item, index)"
      >
        <!-- 置顶/精华/热门标识 -->
        <div class="discuss-badges" v-if="item.isPinned || item.isFeatured || item.isHot">
          <span v-if="item.isPinned" class="badge badge--pinned">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M21 5H3v14h18V5zM7 7h10v2H7V7zm0 4h10v2H7v9zm0 4h7v2H7v-2z" stroke="currentColor" stroke-width="2"/>
            </svg>
            置顶
          </span>
          <span v-if="item.isFeatured" class="badge badge--featured">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2"/>
            </svg>
            精华
          </span>
          <span v-if="item.isHot" class="badge badge--hot">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2"/>
            </svg>
            热门
          </span>
        </div>

        <header class="discuss-card__header">
          <div class="avatar">
            <img :src="resolveAssetUrl(item.avatarurl)" alt="头像" />
            <div class="user-level" v-if="item.userLevel">{{ item.userLevel }}</div>
          </div>
          <div class="user-info">
            <div class="user-meta">
              <strong>{{ item.nickname || '匿名会员' }}</strong>
                <button
                  v-if="canFollowUser(item.userid || 0)"
                  class="follow-btn"
                  :class="{ 'follow-btn--following': isFollowingUser(item.userid || 0) }"
                  @click="toggleFollow(item)"
                >
                  {{ isFollowingUser(item.userid || 0) ? '已关注' : '+ 关注' }}
                </button>
            </div>
            <small>{{ formatCourseName(item.refid) }}</small>
          </div>
          <div class="header-actions">
            <TechButton size="sm" variant="text" @click="goDetail(item)">详情</TechButton>
            <div class="more-menu">
              <button class="more-btn" @click="toggleMoreMenu(item)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="1" fill="currentColor"/>
                  <circle cx="12" cy="5" r="1" fill="currentColor"/>
                  <circle cx="12" cy="19" r="1" fill="currentColor"/>
                </svg>
              </button>
              <div v-if="item.showMenu" class="more-dropdown">
                <button v-if="canReport(item)" @click="reportDiscussion(item)">举报</button>
                <button v-if="canPin(item)" @click="togglePin(item)">
                  {{ item.isPinned ? '取消置顶' : '置顶讨论' }}
                </button>
                <button v-if="canFeature(item)" @click="toggleFeatured(item)">
                  {{ item.isFeatured ? '取消精华' : '设为精华' }}
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- 标签系统 -->
        <div class="discuss-tags" v-if="item.tags && item.tags.length">
          <span v-for="tag in item.tags" :key="tag" class="tag-item" @click="filterByTag(tag)">
            #{{ tag }}
          </span>
        </div>

        <div class="discuss-content">
          <p :id="`discuss-content-${item.id}`" class="discuss-card__content">{{ item.content }}</p>

          <!-- 图片附件 -->
          <div class="discuss-attachments" v-if="item.attachments && item.attachments.length">
            <div class="attachment-grid">
              <div
                v-for="(attachment, index) in item.attachments.slice(0, 4)"
                :key="index"
                class="attachment-item"
                @click="openAttachment(attachment)"
              >
                <img v-if="attachment.type === 'image'" :src="attachment.url" :alt="attachment.name" />
                <div v-else class="attachment-file">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"/>
                    <path d="M14 2v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ attachment.name }}</span>
                </div>
                <div v-if="item.attachments.length > 4 && index === 3" class="attachment-overlay">
                  +{{ item.attachments.length - 4 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer :id="`discuss-meta-${item.id}`" class="discuss-card__footer">
          <div class="footer-left">
            <div class="tagline">
              <span>{{ formatTimeAgo(item.addtime) }}</span>
              <span v-if="item.replyCount"> · {{ item.replyCount }} 回复</span>
              <span v-if="item.viewCount"> · {{ item.viewCount }} 阅读</span>
            </div>
          </div>
          <div class="action-buttons" role="group" aria-label="讨论操作">
            <TechButton
              size="sm"
              variant="text"
              :loading="likeLoading === item.id"
              @click="handleLike(item)"
              :aria-label="`点赞讨论，当前${item.likes || 0}个赞`"
            >
              👍 {{ item.likes || 0 }}
            </TechButton>
            <TechButton
              size="sm"
              variant="text"
              @click="toggleReply(item)"
              :aria-label="`回复讨论，展开回复表单`"
            >
              💬 回复
            </TechButton>
            <TechButton
              size="sm"
              variant="text"
              @click="shareDiscussion(item)"
              :aria-label="`分享讨论`"
            >
              📤 分享
            </TechButton>
            <TechButton
              size="sm"
              variant="outline"
              @click="goDetail(item)"
              :aria-label="`查看讨论详情`"
            >
              查看详情
            </TechButton>
          </div>
        </footer>

        <!-- 快速回复 -->
        <div v-if="item.showReply" class="quick-reply" role="form" aria-label="快速回复表单">
          <div class="reply-input-group">
            <label :for="`reply-textarea-${item.id}`" class="sr-only">回复内容</label>
            <textarea
              :id="`reply-textarea-${item.id}`"
              v-model="item.replyContent"
              placeholder="@用户名 回复内容..."
              class="reply-textarea"
              rows="3"
              maxlength="500"
              :aria-describedby="`reply-count-${item.id}`"
            ></textarea>
            <div class="reply-actions">
              <div :id="`reply-count-${item.id}`" class="character-count" aria-live="polite">
                {{ (item.replyContent || '').length }}/500
              </div>
              <button
                class="reply-attach-btn"
                @click="attachToReply(item)"
                aria-label="添加附件"
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"/>
                  <path d="M14 2v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="reply-buttons">
                <TechButton
                  size="sm"
                  variant="outline"
                  @click="cancelReply(item)"
                  aria-label="取消回复"
                  type="button"
                >
                  取消
                </TechButton>
                <TechButton
                  size="sm"
                  @click="submitReply(item)"
                  :disabled="!item.replyContent?.trim()"
                  :aria-label="`提交回复，${item.replyContent?.trim() ? '内容已填写' : '请填写内容'}`"
                  type="submit"
                >
                  回复
                </TechButton>
              </div>
            </div>
          </div>
        </div>

        <!-- 多级回复组件 -->
        <DiscussionReplies
          v-if="item.replies && item.replies.length > 0"
          :replies="item.replies"
          :discussion-id="item.id"
          @reply-submitted="handleReplySubmitted"
          @reply-liked="handleReplyLiked"
        />
      </TechCard>
      <el-empty v-if="!discussions.length && !loading" description="暂无讨论" />
    </section>

    <!-- 个性化推荐区域 -->
    <section id="recommendations-section" class="recommendations-section" v-if="personalizedRecommendations.length > 0" aria-labelledby="recommendations-heading">
      <TechCard title="为您推荐" subtitle="基于您的兴趣智能推荐">
        <div class="recommendations-grid">
          <RecommendationCard
            v-for="item in personalizedRecommendations.slice(0, 6)"
            :key="item.id"
            :item="item"
            :score="item.score"
            :reason="item.reason"
            @click="handleRecommendationClick"
            @like="handleRecommendationLike"
            @share="handleRecommendationShare"
            @dismiss="handleRecommendationDismiss"
          />
        </div>
      </TechCard>
    </section>

    <!-- 讨论发布器 -->
    <DiscussionComposer
      :visible="showComposer"
      :course-options="courseOptions"
      @submit="handleDiscussionSubmit"
      @cancel="showComposer = false"
      @save-draft="handleDraftSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { TechButton, TechCard, RecommendationCard } from '@/components/common'
import { DiscussionReplies, TopicCloud, AdvancedFilters } from '@/components/discussion'
import { useHotTopics } from '@/composables/useHotTopics'
import { useDiscussionManagement } from '@/composables/useDiscussionManagement'
import { useKeyboardNavigation } from '@/composables/useKeyboardNavigation'
import { useScreenReaderAnnouncements } from '@/composables/useFocusManagement'
import { useRecommendation } from '@/composables/useRecommendation'
import { useAdvancedSearch } from '@/composables/useAdvancedSearch'
import { getModuleService } from '@/services/crud'
import type { Discussjianshenkecheng, Jianshenkecheng } from '@/types/modules'
import config from '@/config/config'
import defaultAvatar from '@/assets/touxiang.png'

const router = useRouter()
const discussService = getModuleService('discussjianshenkecheng')
const courseService = getModuleService('jianshenkecheng')

// 使用热门话题组合式API
const {
  hotTopics,
  recommendedTopics,
  topicsByTimeRange,
  setTimeRange,
  setUserInterests
} = useHotTopics(discussions)

// 使用讨论管理组合式API
const {
  togglePinDiscussion,
  toggleFeatureDiscussion,
  reportDiscussion: reportDiscussionMgmt,
  toggleFollowUser,
  canPinDiscussion: canPin,
  canFeatureDiscussion: canFeature,
  canReportDiscussion: canReport,
  canFollowUser,
  isFollowingUser
} = useDiscussionManagement()

// 使用高级搜索组合式API
const {
  filters: searchFilters,
  isSearching,
  searchResults,
  searchHistory,
  searchSuggestions,
  availableCourses,
  availableTags,
  activeFiltersCount,
  hasActiveFilters,
  filterStats,
  handleKeywordChange,
  applySuggestion,
  performSearch,
  resetFilters,
  applyFilters,
  toggleTag,
  updateFilters,
  init: initAdvancedSearch
} = useAdvancedSearch({
  enableSuggestions: true,
  enableHistory: true,
  maxSuggestions: 8
})

// 使用屏幕阅读器公告
const {
  announce,
  announceStatus,
  announceError,
  announceSuccess,
  announceNavigation,
  announceLoading
} = useScreenReaderAnnouncements()

// 使用智能推荐系统
const {
  recommendations,
  personalizedRecommendations,
  setAvailableItems,
  addInteraction,
  dismissRecommendation
} = useRecommendation()

const loading = ref(false)
const discussions = ref<Discussjianshenkecheng[]>([])
const courseOptions = ref<Array<{ label: string; value: number }>>([])
const likeLoading = ref<number | null>(null)

// 热门话题相关状态
const selectedTimeRange = ref<'24h' | '7d' | '30d'>('7d')
const showRecommendations = ref(false)

// 讨论发布器状态
const showComposer = ref(false)

// 键盘导航相关
const hotTopicsContainer = ref<HTMLElement>()
const {
  currentIndex: hotTopicIndex,
  activate: activateHotTopicsNav,
  setCurrentIndex: setHotTopicIndex
} = useKeyboardNavigation(ref([]), {
  vertical: true,
  horizontal: true,
  loop: true,
  onActivate: (index) => {
    if (currentHotTopics.value[index]) {
      goToTopic(currentHotTopics.value[index])
    }
  }
})

// 讨论列表键盘导航
const discussionsContainer = ref<HTMLElement>()
const {
  currentIndex: discussionIndex,
  activate: activateDiscussionsNav,
  setCurrentIndex: setDiscussionIndex
} = useKeyboardNavigation(ref([]), {
  vertical: true,
  loop: false,
  onActivate: (index) => {
    if (discussions.value[index]) {
      goDetail(discussions.value[index])
    }
  }
})
const timeRangeOptions = [
  { label: '24小时', value: '24h' as const },
  { label: '7天', value: '7d' as const },
  { label: '30天', value: '30d' as const }
]

// 当前用户信息（模拟）
const currentUser = ref({
  id: 1,
  nickname: '当前用户'
})

// 关注状态管理
const followingUsers = ref(new Set<number>())

const filters = reactive({
  keyword: '',
  courseId: undefined as number | undefined,
  tag: '',
  sort: 'latest',
})

const tags = ['训练', '饮食', '进阶', '复训', '器材']
const sortOptions = [
  { label: '最新', value: 'latest' },
  { label: '热门', value: 'hot' },
  { label: '官方回复', value: 'official' },
]

// 标签云数据
const allTags = computed(() => {
  const tagStats: Record<string, { count: number; trend: 'up' | 'down' | 'stable' }> = {}

  // 统计所有讨论中的标签使用情况
  discussions.value.forEach(discussion => {
    if (discussion.tags) {
      discussion.tags.forEach((tag: string) => {
        if (!tagStats[tag]) {
          tagStats[tag] = { count: 0, trend: 'stable' }
        }
        tagStats[tag].count++
      })
    }
  })

  // 为标签添加趋势和等级
  return Object.entries(tagStats).map(([name, stats]) => ({
    name,
    count: stats.count,
    level: getTagLevel(stats.count),
    trend: stats.trend
  }))
})

// 根据使用次数确定标签等级
function getTagLevel(count: number): 'low' | 'medium' | 'high' | 'hot' {
  if (count >= 20) return 'hot'
  if (count >= 10) return 'high'
  if (count >= 5) return 'medium'
  return 'low'
}

// 当前热门话题（基于选择的时间范围）
const currentHotTopics = computed(() => {
  return topicsByTimeRange.value[selectedTimeRange.value] || hotTopics.value
})

// 热门话题相关方法
function changeTimeRange(range: '24h' | '7d' | '30d') {
  selectedTimeRange.value = range
  setTimeRange(range)
}

function handleTopicClick(topic: any, index: number) {
  setHotTopicIndex(index)
  goToTopic(topic)
}

function handleDiscussionClick(item: any, index: number) {
  setDiscussionIndex(index)
  goDetail(item)
}

function goToTopic(topic: any) {
  // 根据话题跳转到相关讨论列表
  filters.tag = topic.title
  handleSearch()
  ElMessage.info(`正在查看"${topic.title}"话题的讨论`)

  // 记录用户行为
  addInteraction({
    itemId: String(topic.id),
    itemType: 'topic',
    action: 'view',
    weight: 1
  })
}

function updateRecommendationItems() {
  // 从讨论和话题中生成推荐项目
  const recommendationItems = [
    // 从热门话题生成推荐
    ...currentHotTopics.value.map(topic => ({
      id: `topic-${topic.id}`,
      title: topic.title,
      description: topic.description,
      tags: [topic.title],
      likes: Math.floor(topic.heat / 10),
      type: 'topic' as const,
      meta: [
        { label: '讨论数', value: String(topic.postCount) },
        { label: '热度', value: String(topic.heat) }
      ]
    })),
    // 从讨论中生成推荐（排除当前显示的）
    ...discussions.value.slice(5).map(discussion => ({
      id: `discussion-${discussion.id}`,
      title: discussion.content?.substring(0, 50) + '...',
      description: discussion.content?.substring(0, 100) + '...',
      tags: discussion.tags || [],
      likes: discussion.likes || 0,
      type: 'discussion' as const,
      meta: [
        { label: '回复', value: String(discussion.replyCount || 0) },
        { label: '查看', value: String(discussion.viewCount || 0) }
      ]
    }))
  ]

  setAvailableItems(recommendationItems)
}

onMounted(async () => {
  loadCourses()
  loadDiscussions()

  // 初始化高级搜索
  await initAdvancedSearch()
})

async function loadCourses() {
  try {
    const { list } = await courseService.list({ page: 1, limit: 100, sort: 'addtime', order: 'desc' })
    courseOptions.value =
      list?.map((item: Jianshenkecheng) => ({ label: item.kechengmingcheng, value: Number(item.id) })) ?? []
  } catch (error) {
    console.warn('加载课程失败', error)
  }
}

async function loadDiscussions() {
  loading.value = true
  announceLoading('讨论列表', true)
  try {
    const params: Record<string, any> = { page: 1, limit: 20, order: 'desc' }
    if (filters.keyword) params.content = filters.keyword
    if (filters.courseId) params.refid = filters.courseId
    const list = await discussService.autoSort(params)

    // 为讨论添加增强属性（模拟数据）
    const enhancedList = (list || []).map((item: any, index: number) => ({
      ...item,
      isPinned: index === 0, // 第一条设为置顶
      isFeatured: index === 1, // 第二条设为精华
      isHot: Math.random() > 0.7, // 随机热门
      tags: generateTags(item.content || ''),
      attachments: Math.random() > 0.8 ? generateAttachments() : [],
      replyCount: Math.floor(Math.random() * 20),
      viewCount: Math.floor(Math.random() * 100),
      userLevel: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.5'][Math.floor(Math.random() * 4)],
      isFollowing: followingUsers.value.has(item.userid || 0),
      showReply: false,
      showMenu: false,
      replyContent: '',
      replies: generateMockReplies(item.id) // 生成模拟回复数据
    }))

    discussions.value = applyClientFilters(enhancedList)
    announceLoading('讨论列表', false)
    announceStatus(`已加载 ${discussions.value.length} 条讨论`)

    // 设置推荐项目
    updateRecommendationItems()
  } catch (error) {
    console.error(error)
    ElMessage.error('加载讨论失败')
    announceError('加载讨论失败')
  } finally {
    loading.value = false
  }
}

// 生成模拟标签
function generateTags(content: string): string[] {
  const availableTags = ['训练', '饮食', '进阶', '复训', '器材', '心得', '问题', '建议']
  const count = Math.floor(Math.random() * 3) + 1
  return availableTags.sort(() => Math.random() - 0.5).slice(0, count)
}

// 生成模拟附件
function generateAttachments() {
  const types = ['image', 'file']
  const count = Math.floor(Math.random() * 3) + 1
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    type: types[Math.floor(Math.random() * types.length)],
    name: `attachment_${i + 1}.jpg`,
    url: `https://via.placeholder.com/200x150?text=Attachment+${i + 1}`
  }))
}

// 生成模拟回复数据
function generateMockReplies(discussionId: number) {
  const replyCount = Math.floor(Math.random() * 8) + 2 // 2-10条回复
  const replies = []

  for (let i = 0; i < replyCount; i++) {
    const replyId = discussionId * 100 + i + 1
    const userNames = ['健身达人', '运动小白', '教练助理', '健身爱好者', '营养专家']
    const contents = [
      '这个建议很实用！我也要试试',
      '谢谢分享，很有帮助 👍',
      '@健身达人 你说的对，我之前也遇到过类似问题',
      '请问具体应该怎么操作呢？',
      '这个方法不错，值得学习',
      '我有不同的看法，大家可以一起讨论',
      '感谢教练的指导！',
      '这个课程安排很合理'
    ]

    const reply = {
      id: replyId,
      userId: Math.floor(Math.random() * 100) + 10,
      userNickname: userNames[Math.floor(Math.random() * userNames.length)],
      userAvatar: `https://via.placeholder.com/40x40?text=${replyId}`,
      userLevel: ['Lv.1', 'Lv.2', 'Lv.3'][Math.floor(Math.random() * 3)],
      content: contents[Math.floor(Math.random() * contents.length)],
      createTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      likeCount: Math.floor(Math.random() * 20),
      isLiked: Math.random() > 0.8,
      isOfficial: Math.random() > 0.9,
      parentId: null,
      parentUserNickname: null,
      attachments: Math.random() > 0.95 ? generateAttachments() : [],
      children: []
    }

    replies.push(reply)

    // 为一些回复添加子回复（模拟嵌套回复）
    if (Math.random() > 0.6 && replies.length > 1) {
      const childReply = {
        id: replyId * 100 + 1,
        userId: Math.floor(Math.random() * 100) + 20,
        userNickname: userNames[Math.floor(Math.random() * userNames.length)],
        userAvatar: `https://via.placeholder.com/40x40?text=${replyId * 100 + 1}`,
        userLevel: ['Lv.1', 'Lv.2'][Math.floor(Math.random() * 2)],
        content: `回复 @${reply.userNickname}：${contents[Math.floor(Math.random() * contents.length)]}`,
        createTime: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        likeCount: Math.floor(Math.random() * 10),
        isLiked: Math.random() > 0.9,
        isOfficial: false,
        parentId: replyId,
        parentUserNickname: reply.userNickname,
        attachments: [],
        children: []
      }
      reply.children = [childReply]
    }
  }

  return replies
}

function applyClientFilters(list: Discussjianshenkecheng[]) {
  return list
    .filter((item) => (filters.tag ? (item.content || '').includes(filters.tag) : true))
    .sort((a, b) => {
      if (filters.sort === 'hot') return (b.reply?.length || 0) - (a.reply?.length || 0)
      if (filters.sort === 'official') {
        const aOfficial = a.reply ? 1 : 0
        const bOfficial = b.reply ? 1 : 0
        return bOfficial - aOfficial
      }
      return (b.addtime?.localeCompare(a.addtime || '') || 0) - (a.addtime?.localeCompare(b.addtime || '') || 0)
    })
}

function handleSearch() {
  loadDiscussions()
}

function changeSort(value: string) {
  filters.sort = value
  loadDiscussions()
}

// 高级搜索处理方法
function handleAdvancedSearch(searchFilters: any) {
  // 更新本地筛选状态以保持兼容性
  filters.keyword = searchFilters.keyword
  filters.courseId = searchFilters.courseId?.[0] || ''
  filters.tag = searchFilters.tags?.[0] || ''
  filters.sort = searchFilters.sort

  // 执行搜索
  performSearch()

  // 公告搜索结果
  announce(`搜索完成，找到 ${filterStats.value.total} 个讨论${filterStats.value.filtered > 0 ? `，显示 ${filterStats.value.filtered} 个` : ''}`)
}

function handleResetFilters() {
  // 重置本地筛选状态
  filters.keyword = ''
  filters.courseId = ''
  filters.tag = ''
  filters.sort = 'latest'

  // 重新加载讨论列表
  loadDiscussions()

  announce('筛选条件已重置')
}

function handleAuthorChange(author: string) {
  // 处理作者筛选变化
  searchFilters.author = author
}

function goCreate() {
  router.push('/index/discussjianshenkechengAdd')
}

function goDetail(item: Discussjianshenkecheng) {
  router.push({ path: '/index/discussjianshenkechengDetail', query: { id: item.id } })
}

async function handleLike(item: Discussjianshenkecheng) {
  if (!item.id) return
  likeLoading.value = item.id
  try {
    await discussService.thumbsup(item.id, 1)
    item.likes = (item.likes || 0) + 1
    ElMessage.success('感谢点赞！')
    announceSuccess(`已为讨论"${item.content?.substring(0, 20)}..."点赞`)
  } catch (error) {
    console.error(error)
    ElMessage.error('点赞失败')
    announceError('点赞失败')
  } finally {
    likeLoading.value = null
  }
}

function formatCourseName(refId?: number) {
  if (!refId) return '未关联课程'
  const course = courseOptions.value.find((option) => option.value === refId)
  return course ? course.label : `#${refId}`
}

function resolveAssetUrl(path?: string) {
  if (!path) return defaultAvatar
  if (/^https?:\/\//i.test(path)) return path
  const normalizedBase = config.baseUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

function formatTimeAgo(time: string | undefined) {
  if (!time) return '—'
  const now = new Date()
  const past = new Date(time)
  const diff = now.getTime() - past.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

// 用户相关函数
function isCurrentUser(item: any) {
  return item.userid === currentUser.value.id
}

async function toggleFollow(item: any) {
  const userId = item.userid || item.id
  const userData = {
    userId,
    nickname: item.nickname || '用户',
    isFollowing: isFollowingUser(userId)
  }

  await toggleFollowUser(userData)
  item.isFollowing = userData.isFollowing
}

// 讨论操作函数
function toggleMoreMenu(item: any) {
  item.showMenu = !item.showMenu
}


async function togglePin(item: any) {
  const success = await togglePinDiscussion(item)
  if (success) {
    item.showMenu = false
  }
}

async function toggleFeatured(item: any) {
  const success = await toggleFeatureDiscussion(item)
  if (success) {
    item.showMenu = false
  }
}

async function reportDiscussion(item: any) {
  const success = await reportDiscussionMgmt(item)
  if (success) {
    item.showMenu = false
  }
}

// 标签筛选
function filterByTag(tag: string) {
  filters.tag = tag
  handleSearch()
}

// 回复功能
function toggleReply(item: any) {
  item.showReply = !item.showReply
  if (!item.showReply) {
    item.replyContent = ''
  }
}

function cancelReply(item: any) {
  item.showReply = false
  item.replyContent = ''
}

function submitReply(item: any) {
  if (!item.replyContent.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  if (item.replyContent.length > 500) {
    ElMessage.warning('回复内容不能超过500个字符')
    return
  }

  // 模拟提交回复
  console.log('Submitting reply:', item.replyContent)

  // 创建新回复对象
  const newReply = {
    id: Date.now(),
    userId: currentUser.value.id,
    userNickname: currentUser.value.nickname,
    userAvatar: defaultAvatar,
    userLevel: 'Lv.1',
    content: item.replyContent,
    createTime: new Date().toISOString(),
    likeCount: 0,
    isLiked: false,
    isOfficial: false,
    parentId: null,
    parentUserNickname: null,
    attachments: [],
    children: []
  }

  // 添加到讨论的回复列表
  if (!item.replies) {
    item.replies = []
  }
  item.replies.unshift(newReply)

  // 更新回复计数
  item.replyCount = (item.replyCount || 0) + 1
  item.showReply = false
  item.replyContent = ''

  ElMessage.success('回复已发布')

  // 触发通知机制（模拟）
  triggerReplyNotification(item, newReply)
}

function attachToReply(item: any) {
  // 模拟文件选择
  ElMessage.info('文件上传功能开发中')
}

// 附件查看
function openAttachment(attachment: any) {
  if (attachment.type === 'image') {
    // 打开图片预览
    window.open(attachment.url, '_blank')
  } else {
    // 下载文件
    const link = document.createElement('a')
    link.href = attachment.url
    link.download = attachment.name
    link.click()
  }
}

// 分享功能
function shareDiscussion(item: any) {
  const url = `${window.location.origin}/index/discussjianshenkechengDetail?id=${item.id}`

  if (navigator.share) {
    navigator.share({
      title: item.content,
      text: '快来看看这个有趣的讨论',
      url: url
    })
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
  }
}

// 多级回复事件处理
function handleReplySubmitted(reply: any) {
  // 更新讨论的回复计数
  const discussion = discussions.value.find(d => d.id === reply.discussionId)
  if (discussion) {
    discussion.replyCount = (discussion.replyCount || 0) + 1
  }

  // 触发通知机制
  triggerReplyNotification(null, reply)
}

function handleReplyLiked(replyId: number, isLiked: boolean) {
  // 这里可以添加额外的点赞逻辑，比如更新全局点赞统计
  console.log(`Reply ${replyId} ${isLiked ? 'liked' : 'unliked'}`)
}

// 回复通知机制
function triggerReplyNotification(discussion: any, reply: any) {
  // 模拟通知机制
  const notificationMessage = discussion
    ? `您的讨论"${discussion.content?.substring(0, 20)}..."收到了新回复`
    : `您在讨论中收到了一条新回复`

  console.log('Notification triggered:', notificationMessage)

  // 这里可以集成实际的通知服务，比如：
  // 1. 站内信通知
  // 2. 邮件通知
  // 3. 短信通知
  // 4. 浏览器推送通知

  // 模拟发送通知到相关用户
  if (reply.parentId) {
    // 如果是回复其他人的回复，通知被回复者
    const parentReply = findReplyById(reply.parentId)
    if (parentReply) {
      console.log(`Notifying ${parentReply.userNickname} about reply from ${reply.userNickname}`)
    }
  } else if (discussion) {
    // 如果是回复讨论，通知讨论发起者
    console.log(`Notifying ${discussion.nickname || 'discussion author'} about reply from ${reply.userNickname}`)
  }

  // 显示通知提示（实际应用中会通过通知中心显示）
  ElMessage.info('回复通知已发送')
}

// 查找回复的辅助函数
function findReplyById(replyId: number): any {
  for (const discussion of discussions.value) {
    if (discussion.replies) {
      const reply = discussion.replies.find((r: any) => r.id === replyId)
      if (reply) return reply

      // 在子回复中查找
      for (const parentReply of discussion.replies) {
        if (parentReply.children) {
          const childReply = parentReply.children.find((r: any) => r.id === replyId)
          if (childReply) return childReply
        }
      }
    }
  }
  return null
}

// 标签云事件处理
function handleTagCloudClick(tag: any) {
  filters.tag = tag.name
  handleSearch()
  ElMessage.info(`正在筛选"${tag.name}"标签的讨论`)
}

function handleTagHover(tag: any, isHover: boolean) {
  // 可以添加悬停时的额外效果，比如显示标签统计信息
  if (isHover) {
    console.log(`标签"${tag.name}"有${tag.count}个讨论`)
  }
}

// 讨论发布器事件处理
async function handleDiscussionSubmit(discussionData: any) {
  try {
    // 创建讨论数据
    const submitData = {
      ...discussionData,
      userid: currentUser.value.id,
      nickname: discussionData.isAnonymous ? '匿名用户' : currentUser.value.nickname,
      content: discussionData.content,
      addtime: discussionData.addtime
    }

    // 调用API保存讨论
    const result = await discussService.save(submitData)

    // 添加到讨论列表
    const newDiscussion = {
      ...submitData,
      id: result.id || Date.now(),
      isPinned: false,
      isFeatured: false,
      isHot: false,
      tags: discussionData.tags,
      attachments: [],
      replyCount: 0,
      viewCount: 0,
      userLevel: 'Lv.1',
      isFollowing: false,
      showReply: false,
      showMenu: false,
      replyContent: '',
      replies: []
    }

    discussions.value.unshift(newDiscussion)

    ElMessage.success('讨论发布成功')
    showComposer.value = false

    // 刷新热门话题
    // 这里可以触发热门话题重新计算
  } catch (error) {
    console.error('发布讨论失败:', error)
    ElMessage.error('发布失败，请重试')
  }
}

function handleDraftSave(draftData: any) {
  console.log('草稿已保存:', draftData)
  // 这里可以添加草稿保存的额外逻辑，比如显示保存状态
}

// 推荐相关事件处理
function handleRecommendationClick(item: any) {
  // 根据推荐项目类型跳转
  if (item.type === 'topic') {
    goToTopic({ title: item.title, id: item.id })
  } else if (item.type === 'discussion') {
    const discussionId = String(item.id).replace('discussion-', '')
    const discussion = discussions.value.find(d => d.id === Number(discussionId))
    if (discussion) {
      goDetail(discussion)
    }
  }

  // 记录点击行为
  addInteraction({
    itemId: String(item.id),
    itemType: item.type,
    action: 'view',
    weight: 2
  })
}

function handleRecommendationLike(item: any) {
  // 记录点赞行为
  addInteraction({
    itemId: String(item.id),
    itemType: item.type,
    action: 'like',
    weight: 3
  })

  ElMessage.success('感谢您的反馈！')
}

function handleRecommendationShare(item: any) {
  // 记录分享行为
  addInteraction({
    itemId: String(item.id),
    itemType: item.type,
    action: 'share',
    weight: 2
  })
}

function handleRecommendationDismiss(item: any) {
  dismissRecommendation(item.id)

  // 记录用户不感兴趣的行为
  addInteraction({
    itemId: String(item.id),
    itemType: item.type,
    action: 'view',
    weight: -1 // 负权重表示不感兴趣
  })
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.discuss-page {
  padding: 48px 20px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.discuss-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

// 高级搜索区域样式
.advanced-search-section {
  margin-bottom: var(--space-lg);
}

.discuss-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
}

.discuss-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;

  &--pinned {
    border-color: rgba(74, 144, 226, 0.5);
    background: rgba(74, 144, 226, 0.05);

    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(74, 144, 226, 0.3), rgba(253, 216, 53, 0.2));
      z-index: -1;
    }
  }

  &--featured {
    border-color: rgba(253, 216, 53, 0.5);
    background: rgba(253, 216, 53, 0.05);
  }

  &--hot {
    border-color: rgba(255, 152, 0, 0.5);
    background: rgba(255, 152, 0, 0.05);
  }
}

// 置顶/精华/热门标识
.discuss-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;

  &--pinned {
    background: rgba(74, 144, 226, 0.2);
    color: #4a90e2;
  }

  &--featured {
    background: rgba(253, 216, 53, 0.2);
    color: $color-yellow;
  }

  &--hot {
    background: rgba(255, 152, 0, 0.2);
    color: #ff9800;
  }
}

.discuss-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-level {
  position: absolute;
  bottom: -2px;
  right: -2px;
  padding: 2px 6px;
  border-radius: 8px;
  background: $color-yellow;
  color: rgba(0, 0, 0, 0.8);
  font-size: 0.7rem;
  font-weight: 600;
}

.user-info {
  flex: 1;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;

  strong {
    color: $color-text-primary;
  }
}

.follow-btn {
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid rgba(253, 216, 53, 0.3);
  background: transparent;
  color: $color-yellow;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(253, 216, 53, 0.1);
    border-color: rgba(253, 216, 53, 0.5);
  }

  &--following {
    background: rgba(253, 216, 53, 0.1);
    border-color: rgba(253, 216, 53, 0.5);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.more-menu {
  position: relative;
}

.more-btn {
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  color: $color-text-secondary;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.more-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 4px 0;
  min-width: 120px;
  z-index: 100;

  button {
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: $color-text-primary;
    text-align: left;
    cursor: pointer;
    font-size: 0.9rem;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

// 标签系统
.discuss-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  padding: 4px 8px;
  background: rgba(74, 144, 226, 0.1);
  border: 1px solid rgba(74, 144, 226, 0.2);
  border-radius: 12px;
  color: #4a90e2;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(74, 144, 226, 0.2);
    border-color: rgba(74, 144, 226, 0.4);
  }
}

// 附件系统
.discuss-attachments {
  margin-top: 8px;
}

.attachment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
}

.attachment-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.attachment-file {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;

  span {
    font-size: 0.7rem;
    color: $color-text-secondary;
    text-align: center;
    word-break: break-all;
  }
}

.attachment-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
}

.discuss-card__content {
  margin: 0;
  color: $color-text-primary;
  min-height: 44px;
}

.discuss-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

// 快速回复
.quick-reply {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.reply-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: $color-text-primary;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: rgba(253, 216, 53, 0.5);
    box-shadow: 0 0 0 2px rgba(253, 216, 53, 0.1);
  }

  &::placeholder {
    color: $color-text-secondary;
  }
}

.reply-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.character-count {
  font-size: 0.8rem;
  color: $color-text-secondary;
  min-width: 60px;
}

.reply-attach-btn {
  padding: 6px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  color: $color-text-secondary;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.reply-buttons {
  display: flex;
  gap: 8px;
}

// 页脚布局调整
.footer-left {
  flex: 1;
}

.discuss-card__footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .discuss-card__header {
    flex-wrap: wrap;
  }

  .header-actions {
    margin-top: 8px;
    justify-content: space-between;
    width: 100%;
  }

  .attachment-grid {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .discuss-list {
    grid-template-columns: 1fr;
  }

  .discuss-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .user-meta {
    width: 100%;
    justify-content: space-between;
  }

  .header-actions {
    margin-top: 0;
  }

  .reply-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .reply-buttons {
    justify-content: flex-end;
  }

  // 热门话题样式
.hot-topics {
  margin-bottom: 24px;
}

.time-range-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.time-range-btn {
  padding: 6px 12px;
  border: 1px solid rgba(253, 216, 53, 0.3);
  border-radius: 16px;
  background: transparent;
  color: $color-yellow;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(253, 216, 53, 0.1);
    border-color: rgba(253, 216, 53, 0.5);
  }

  &.active {
    background: rgba(253, 216, 53, 0.1);
    border-color: rgba(253, 216, 53, 0.8);
    box-shadow: $shadow-glow;
  }
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.topic-card {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(253, 216, 53, 0.3);
    background: rgba(253, 216, 53, 0.05);
    transform: translateY(-2px);
  }
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;

  h4 {
    color: $color-text-primary;
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }
}

.topic-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topic-heat {
  padding: 2px 6px;
  border-radius: 10px;
  background: rgba(253, 216, 53, 0.2);
  color: $color-yellow;
  font-size: 0.7rem;
  font-weight: 600;
}

.topic-trend {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;

  &.trend--up {
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
  }

  &.trend--hot {
    background: rgba(255, 152, 0, 0.2);
    color: #ff9800;
  }

  &.trend--new {
    background: rgba(74, 144, 226, 0.2);
    color: #4a90e2;
  }
}

.topic-desc {
  color: $color-text-secondary;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 8px 0;
}

.topic-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: $color-text-secondary;
}

.topic-posts {
  &::after {
    content: '·';
    margin: 0 6px;
  }
}

.recommendation-hint {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.recommendations-list {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;

  h5 {
    color: $color-text-primary;
    font-size: 0.85rem;
    margin: 0 0 8px 0;
    font-weight: 600;
  }
}

.recommendation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recommendation-tag {
  padding: 4px 8px;
  background: rgba(74, 144, 226, 0.1);
  border: 1px solid rgba(74, 144, 226, 0.2);
  border-radius: 12px;
  color: #4a90e2;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(74, 144, 226, 0.2);
    border-color: rgba(74, 144, 226, 0.4);
  }
}

// 移动端标签优化
  .discuss-tags {
    justify-content: center;
  }

  .tag-item {
    font-size: 0.75rem;
    padding: 3px 6px;
  }

  // 移动端附件优化
  .attachment-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
  }

  .attachment-item {
    aspect-ratio: 1;
  }

  // 移动端热门话题优化
  .time-range-selector {
    justify-content: center;
  }

  .time-range-btn {
    padding: 4px 8px;
    font-size: 0.7rem;
  }

  .topics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .topic-card {
    padding: 12px;
  }

  .recommendation-tags {
    justify-content: center;
  }
}

// 推荐区域样式
.recommendations-section {
  margin-top: var(--spacing-24);
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-16);
  margin-top: var(--spacing-16);
}

// 响应式推荐样式
@media (max-width: 768px) {
  .recommendations-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-12);
  }
}

@media (max-width: 480px) {
  .recommendations-section {
    margin-top: var(--spacing-16);
  }

  .recommendations-grid {
    gap: var(--spacing-8);
  }
}

// 跳过链接样式
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  z-index: 10000;
  transition: top 0.3s ease;

  &:focus {
    top: 6px;
  }
}

// 无障碍访问辅助类
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

// 屏幕阅读器专用内容
.sr-only:not(:focus):not(:active) {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
</style>
