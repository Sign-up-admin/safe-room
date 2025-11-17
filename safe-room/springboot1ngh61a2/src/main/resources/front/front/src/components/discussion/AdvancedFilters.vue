<template>
  <div class="advanced-filters" role="search" aria-label="高级筛选器">
    <!-- 基础搜索栏 -->
    <div class="search-bar" role="search" aria-label="关键词搜索">
      <el-input
        ref="searchInput"
        v-model="filters.keyword"
        placeholder="搜索标题、内容、作者..."
        prefix-icon="Search"
        clearable
        aria-label="搜索讨论内容"
        role="searchbox"
        @input="handleKeywordChange"
        @keyup.enter="handleSearch"
      />
      <div v-if="searchSuggestions.length > 0" class="search-suggestions">
        <div class="suggestion-header">
          <span>搜索建议</span>
          <span class="suggestion-count">{{ searchSuggestions.length }}</span>
        </div>
        <div class="suggestion-list">
          <button
            v-for="suggestion in searchSuggestions.slice(0, 5)"
            :key="suggestion"
            class="suggestion-item"
            role="option"
            :aria-label="`应用搜索建议：${suggestion}`"
            @click="applySuggestion(suggestion)"
            @keydown.enter="applySuggestion(suggestion)"
            @keydown.space.prevent="applySuggestion(suggestion)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21l-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- 展开/收起筛选面板 -->
    <div class="filters-toggle">
      <TechButton
        size="sm"
        variant="outline"
        :aria-expanded="showAdvanced"
        aria-controls="advanced-filters-panel"
        aria-label="切换高级筛选面板"
        @click="showAdvanced = !showAdvanced"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            v-if="!showAdvanced"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            v-else
            d="M19 9l-7 7-7-7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        高级筛选 {{ activeFiltersCount > 0 ? `(${activeFiltersCount})` : '' }}
      </TechButton>
    </div>

    <!-- 高级筛选面板 -->
    <transition name="slide-down">
      <div
        v-if="showAdvanced"
        id="advanced-filters-panel"
        class="advanced-filters-panel"
        role="region"
        aria-label="高级筛选选项"
      >
        <div class="filters-grid">
          <!-- 课程筛选 -->
          <div class="filter-group">
            <label for="course-select" class="filter-label">关联课程</label>
            <el-select
              id="course-select"
              v-model="filters.courseId"
              placeholder="选择课程"
              clearable
              filterable
              multiple
              collapse-tags
              collapse-tags-tooltip
              :loading="coursesLoading"
              aria-label="按课程筛选"
              @change="handleFilterChange"
            >
              <el-option
                v-for="course in availableCourses"
                :key="course.id"
                :label="course.kehnegmingcheng"
                :value="course.id"
              />
            </el-select>
          </div>

          <!-- 标签筛选 -->
          <div class="filter-group">
            <label class="filter-label">标签筛选</label>
            <div class="tag-cloud-filter" role="group" aria-label="标签筛选">
              <button
                v-for="tag in availableTags"
                :key="tag.name"
                class="tag-filter-chip"
                :class="[
                  {
                    'tag-filter-chip--active': filters.tags.includes(tag.name),
                    'tag-filter-chip--hot': tag.level === 'hot',
                  },
                ]"
                :aria-pressed="filters.tags.includes(tag.name)"
                :aria-label="`筛选${tag.name}标签${filters.tags.includes(tag.name) ? '（已选中）' : ''}`"
                role="checkbox"
                @click="toggleTag(tag.name)"
                @keydown.enter="toggleTag(tag.name)"
                @keydown.space.prevent="toggleTag(tag.name)"
              >
                {{ tag.name }}
                <span v-if="tag.count" class="tag-count">{{ tag.count }}</span>
              </button>
            </div>
          </div>

          <!-- 时间范围筛选 -->
          <div class="filter-group">
            <label class="filter-label">发布时间</label>
            <el-select
              v-model="filters.timeRange"
              placeholder="选择时间范围"
              clearable
              aria-label="按发布时间筛选"
              @change="handleFilterChange"
            >
              <el-option label="全部时间" value="" />
              <el-option label="最近24小时" value="1d" />
              <el-option label="最近7天" value="7d" />
              <el-option label="最近30天" value="30d" />
              <el-option label="最近3个月" value="90d" />
              <el-option label="最近1年" value="365d" />
            </el-select>
          </div>

          <!-- 状态筛选 -->
          <div class="filter-group">
            <label class="filter-label">讨论状态</label>
            <div class="status-filters" role="group" aria-label="状态筛选">
              <el-checkbox-group v-model="filters.status" @change="handleFilterChange">
                <el-checkbox label="pinned" aria-label="置顶讨论">置顶</el-checkbox>
                <el-checkbox label="featured" aria-label="精华讨论">精华</el-checkbox>
                <el-checkbox label="hot" aria-label="热门讨论">热门</el-checkbox>
              </el-checkbox-group>
            </div>
          </div>

          <!-- 排序方式 -->
          <div class="filter-group">
            <label class="filter-label">排序方式</label>
            <el-radio-group
              v-model="filters.sort"
              class="sort-options"
              role="radiogroup"
              aria-label="排序方式"
              @change="handleFilterChange"
            >
              <el-radio-button label="latest" aria-label="按最新发布时间排序">最新发布</el-radio-button>
              <el-radio-button label="hot" aria-label="按热度排序">热门程度</el-radio-button>
              <el-radio-button label="replies" aria-label="按回复数排序">回复最多</el-radio-button>
              <el-radio-button label="views" aria-label="按浏览数排序">浏览最多</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 作者筛选 -->
          <div class="filter-group">
            <label for="author-input" class="filter-label">作者</label>
            <el-input
              id="author-input"
              v-model="filters.author"
              placeholder="输入作者用户名"
              clearable
              aria-label="按作者筛选"
              @input="handleAuthorChange"
              @keyup.enter="handleFilterChange"
            />
          </div>
        </div>

        <!-- 筛选操作 -->
        <div class="filter-actions">
          <TechButton
            size="sm"
            variant="outline"
            :disabled="activeFiltersCount === 0"
            aria-label="重置所有筛选条件"
            @click="resetFilters"
          >
            重置筛选
          </TechButton>
          <TechButton size="sm" aria-label="应用当前筛选条件" @click="applyFilters"> 应用筛选 </TechButton>
        </div>

        <!-- 筛选结果统计 -->
        <div v-if="resultStats" class="filter-stats">
          <span class="stats-text">
            找到 <strong>{{ resultStats.total }}</strong> 个讨论
            <span v-if="resultStats.filtered > 0">
              （筛选后显示 <strong>{{ resultStats.filtered }}</strong> 个）
            </span>
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import TechButton from '@/components/common/TechButton.vue'

export interface FilterOptions {
  keyword: string
  courseId: string[]
  tags: string[]
  timeRange: string
  status: string[]
  sort: string
  author: string
}

export interface Course {
  id: string
  kehnegmingcheng: string
}

export interface Tag {
  name: string
  count?: number
  level?: 'normal' | 'hot' | 'trending'
}

export interface ResultStats {
  total: number
  filtered: number
}

interface Props {
  modelValue: FilterOptions
  availableCourses?: Course[]
  availableTags?: Tag[]
  resultStats?: ResultStats
  coursesLoading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: FilterOptions): void
  (e: 'search', filters: FilterOptions): void
  (e: 'reset'): void
  (e: 'keyword-change', keyword: string): void
  (e: 'author-change', author: string): void
}

const props = withDefaults(defineProps<Props>(), {
  availableCourses: () => [],
  availableTags: () => [],
  resultStats: undefined,
  coursesLoading: false,
})

const emit = defineEmits<Emits>()

// 响应式数据
const showAdvanced = ref(false)
const searchSuggestions = ref<string[]>([])
const searchInput = ref()

// 计算属性
const filters = computed(() => props.modelValue)

const activeFiltersCount = computed(() => {
  let count = 0
  if (props.modelValue.keyword) count++
  if (props.modelValue.courseId.length > 0) count++
  if (props.modelValue.tags.length > 0) count++
  if (props.modelValue.timeRange) count++
  if (props.modelValue.status.length > 0) count++
  if (props.modelValue.author) count++
  return count
})

// 防抖搜索建议
let suggestionTimeout: number | null = null
const handleKeywordChange = (value: string) => {
  emit('keyword-change', value)

  if (suggestionTimeout) {
    clearTimeout(suggestionTimeout)
  }

  if (value.length >= 2) {
    suggestionTimeout = setTimeout(() => {
      generateSearchSuggestions(value)
    }, 300)
  } else {
    searchSuggestions.value = []
  }
}

// 生成搜索建议
const generateSearchSuggestions = (keyword: string) => {
  // 这里可以调用API获取搜索建议
  // 暂时模拟一些建议
  const suggestions = [
    `${keyword} 训练技巧`,
    `${keyword} 饮食建议`,
    `${keyword} 教练推荐`,
    `${keyword} 健身计划`,
    `${keyword} 运动经验`,
  ]
  searchSuggestions.value = suggestions
}

// 应用搜索建议
const applySuggestion = (suggestion: string) => {
  props.modelValue.keyword = suggestion
  searchSuggestions.value = []
  handleSearch()
  // 保持焦点在搜索框
  nextTick(() => {
    searchInput.value?.focus()
  })
}

// 切换标签筛选
const toggleTag = (tagName: string) => {
  const index = props.modelValue.tags.indexOf(tagName)
  if (index > -1) {
    props.modelValue.tags.splice(index, 1)
  } else {
    props.modelValue.tags.push(tagName)
  }
  handleFilterChange()
}

// 处理筛选变化
const handleFilterChange = () => {
  emit('update:modelValue', { ...props.modelValue })
}

// 搜索处理
const handleSearch = () => {
  searchSuggestions.value = []
  emit('search', { ...props.modelValue })
}

// 作者筛选变化处理
const handleAuthorChange = (value: string) => {
  emit('author-change', value)
}

// 应用筛选
const applyFilters = () => {
  emit('search', { ...props.modelValue })
  ElMessage.success('筛选条件已应用')
}

// 重置筛选
const resetFilters = () => {
  const resetFilters: FilterOptions = {
    keyword: '',
    courseId: [],
    tags: [],
    timeRange: '',
    status: [],
    sort: 'latest',
    author: '',
  }
  emit('update:modelValue', resetFilters)
  emit('reset')
  searchSuggestions.value = []
  ElMessage.info('筛选条件已重置')
}

// 监听外部筛选变化
watch(
  () => props.modelValue,
  newFilters => {
    // 可以在这里处理外部筛选变化的逻辑
  },
  { deep: true },
)

onMounted(() => {
  // 初始化时可以加载一些数据
})
</script>

<style lang="scss" scoped>
.advanced-filters {
  background: var(--glass-bg);
  border: var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  backdrop-filter: blur(8px);
  position: relative;
}

.search-bar {
  position: relative;
  margin-bottom: var(--space-md);

  .search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--glass-bg);
    border: var(--glass-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;

    .suggestion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-sm) var(--space-md);
      border-bottom: 1px solid var(--border-color);
      font-size: 0.875rem;
      color: var(--text-secondary);

      .suggestion-count {
        background: var(--accent-color);
        color: white;
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
      }
    }

    .suggestion-list {
      .suggestion-item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        width: 100%;
        padding: var(--space-sm) var(--space-md);
        background: none;
        border: none;
        text-align: left;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--hover-bg);
        }

        &:focus {
          outline: 2px solid var(--accent-color);
          outline-offset: -2px;
        }

        svg {
          color: var(--text-secondary);
          flex-shrink: 0;
        }
      }
    }
  }
}

.filters-toggle {
  margin-bottom: var(--space-md);
}

.advanced-filters-panel {
  border-top: 1px solid var(--border-color);
  padding-top: var(--space-md);
  margin-top: var(--space-md);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.filter-group {
  .filter-label {
    display: block;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: var(--space-sm);
    font-size: 0.875rem;
  }
}

.tag-cloud-filter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);

  .tag-filter-chip {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-full);
    padding: var(--space-xs) var(--space-sm);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      background: var(--hover-bg);
      border-color: var(--accent-color);
    }

    &:focus {
      outline: 2px solid var(--accent-color);
      outline-offset: 2px;
    }

    &--active {
      background: var(--accent-color);
      color: white;
      border-color: var(--accent-color);
    }

    &--hot {
      background: linear-gradient(135deg, var(--warning-color), var(--error-color));
      color: white;
      border-color: transparent;

      &::after {
        content: '🔥';
        margin-left: var(--space-xs);
      }
    }

    .tag-count {
      margin-left: var(--space-xs);
      opacity: 0.7;
      font-size: 0.75rem;
    }
  }
}

.status-filters {
  .el-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }
}

.sort-options {
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .el-radio-button {
    margin-right: 0;
  }
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-color);
}

.filter-stats {
  margin-top: var(--space-md);
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;

  .stats-text strong {
    color: var(--accent-color);
  }
}

// 过渡动画
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

// 响应式设计
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .filter-actions {
    flex-direction: column;

    .tech-button {
      width: 100%;
    }
  }

  .tag-cloud-filter {
    max-height: 120px;
    overflow-y: auto;
  }

  .search-suggestions {
    max-height: 200px;
  }
}
</style>
