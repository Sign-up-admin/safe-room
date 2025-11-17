---
title: TECHNICAL IMPLEMENTATION GUIDE
version: v1.0.0
last_updated: 2025-11-17
status: active
category: technical
tags: [technical, implementation, components, animations, architecture]
---

# 🔧 技术实现指南

> **版本**：v1.0.0
> **更新日期**：2025-11-17
> **适用范围**：前端技术实现、组件开发、动效系统
> **状态**：active

---

## 📋 目录

- [概述](#概述)
- [架构设计](#架构设计)
- [核心组件库](#核心组件库)
- [动效系统](#动效系统)
- [状态管理](#状态管理)
- [API集成](#api集成)
- [性能优化](#性能优化)
- [测试策略](#测试策略)
- [部署配置](#部署配置)

---

## 📖 概述

### 技术栈概览

```
前端框架: Vue 3.5.13 + TypeScript 5.3.3
构建工具: Vite 5.0.8
状态管理: Pinia 2.1.7
UI组件库: Element Plus 2.5.0 (深度定制)
动效引擎: GSAP 3.12.5 + Three.js r156
测试框架: Vitest 4.0.9 + Playwright 1.40.1
代码质量: ESLint + Prettier + TypeScript
```

### 实现原则

- **组件化**：一切皆组件，高度复用
- **类型安全**：全面TypeScript，零运行时错误
- **性能优先**：懒加载、虚拟滚动、内存优化
- **可维护性**：清晰架构、文档完善、测试覆盖

---

## 🏗️ 架构设计

### 项目结构

```
src/
├── components/          # 组件库
│   ├── tech/           # 科技风格基础组件
│   ├── booking/        # 预约相关组件
│   ├── common/         # 通用组件
│   └── home/           # 首页专用组件
├── composables/        # 组合式API
│   ├── animations/     # 动效相关
│   ├── business/       # 业务逻辑
│   └── ui/            # UI逻辑
├── pages/             # 页面组件
├── stores/            # Pinia状态管理
├── types/             # TypeScript类型定义
├── utils/             # 工具函数
├── styles/            # 样式文件
└── services/          # API服务层
```

### 组件分层架构

```
┌─────────────────┐
│   页面组件      │  Page Components
│   (路由级别)    │  - 完整的页面实现
└─────────────────┘
         │
┌─────────────────┐
│   复合组件      │  Composite Components
│   (业务级别)    │  - 业务功能组合
└─────────────────┘
         │
┌─────────────────┐
│   基础组件      │  Base Components
│   (UI级别)      │  - 通用UI组件
└─────────────────┘
         │
┌─────────────────┐
│   原子组件      │  Atomic Components
│   (设计级别)    │  - 最基础的元素
└─────────────────┘
```

---

## 🧩 核心组件库

### 科技风格基础组件 (Tech Components)

#### TechCard - 科技卡片

```vue
<template>
  <div
    class="tech-card"
    :class="{ 'tech-card--glow': glow, 'tech-card--hover-lift': hoverLift }"
  >
    <div class="tech-card__header" v-if="title || $slots.header">
      <h3 class="tech-card__title" v-if="title">{{ title }}</h3>
      <slot name="header" />
    </div>

    <div class="tech-card__content">
      <slot />
    </div>

    <div class="tech-card__footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  glow?: boolean
  hoverLift?: boolean
}

withDefaults(defineProps<Props>(), {
  glow: false,
  hoverLift: true
})
</script>

<style scoped>
.tech-card {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(253, 216, 53, 0.1);
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tech-card--hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
  border-color: rgba(253, 216, 53, 0.3);
}

.tech-card--glow {
  position: relative;
}

.tech-card--glow::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #fdd835, #ffb300, #fdd835);
  border-radius: 20px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tech-card--glow:hover::before {
  opacity: 0.3;
}
</style>
```

**使用示例：**

```vue
<TechCard title="会员信息" :glow="true">
  <div class="member-info">
    <p>会员等级：黄金会员</p>
    <p>到期时间：2025-12-31</p>
  </div>
</TechCard>
```

#### TechButton - 科技按钮

```vue
<template>
  <button
    class="tech-button"
    :class="[
      `tech-button--${type}`,
      `tech-button--${size}`,
      { 'tech-button--loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <div class="tech-button__content">
      <slot name="prefix" v-if="$slots.prefix" />
      <span class="tech-button__text">
        <slot>{{ text }}</slot>
      </span>
      <slot name="suffix" v-if="$slots.suffix" />
    </div>

    <div class="tech-button__loading" v-if="loading">
      <div class="tech-button__spinner"></div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ButtonType = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'small' | 'medium' | 'large'

interface Props {
  type?: ButtonType
  size?: ButtonSize
  text?: string
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.tech-button {
  position: relative;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.tech-button--primary {
  background: linear-gradient(135deg, #fdd835 0%, #ffb300 100%);
  color: #0a0a0a;
}

.tech-button--secondary {
  background: rgba(253, 216, 53, 0.1);
  border: 1px solid rgba(253, 216, 53, 0.3);
  color: #fdd835;
}

.tech-button--large {
  padding: 16px 24px;
  font-size: 16px;
}

.tech-button--medium {
  padding: 12px 20px;
  font-size: 14px;
}

.tech-button--small {
  padding: 8px 16px;
  font-size: 12px;
}

.tech-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(253, 216, 53, 0.3);
}

.tech-button--loading {
  pointer-events: none;
}

.tech-button__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

#### TechInput - 科技输入框

```vue
<template>
  <div class="tech-input-wrapper">
    <label class="tech-input__label" v-if="label">
      {{ label }}
      <span class="tech-input__required" v-if="required">*</span>
    </label>

    <div class="tech-input" :class="{ 'tech-input--error': hasError, 'tech-input--focused': focused }">
      <slot name="prefix" v-if="$slots.prefix" />

      <input
        ref="inputRef"
        v-model="localValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        class="tech-input__field"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
      />

      <slot name="suffix" v-if="$slots.suffix" />
    </div>

    <div class="tech-input__error" v-if="hasError">
      <slot name="error">{{ errorMessage }}</slot>
    </div>

    <div class="tech-input__hint" v-if="hint && !hasError">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  errorMessage?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  readonly: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: InputEvent]
}>()

const inputRef = ref<HTMLInputElement>()
const focused = ref(false)
const localValue = ref(props.modelValue)

const hasError = computed(() => Boolean(props.errorMessage))

watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})

const handleFocus = (event: FocusEvent) => {
  focused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  focused.value = false
  emit('blur', event)
}

const handleInput = (event: InputEvent) => {
  const target = event.target as HTMLInputElement
  localValue.value = target.value
  emit('update:modelValue', target.value)
  emit('input', event)
}

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>

<style scoped>
.tech-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tech-input__label {
  color: #bdbdbd;
  font-size: 14px;
  font-weight: 500;
}

.tech-input__required {
  color: #f44336;
}

.tech-input {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(253, 216, 53, 0.1);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tech-input--focused {
  border-color: rgba(253, 216, 53, 0.5);
  box-shadow: 0 0 0 3px rgba(253, 216, 53, 0.1);
}

.tech-input--error {
  border-color: #f44336;
}

.tech-input__field {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 14px;
  outline: none;
}

.tech-input__field::placeholder {
  color: #9ea1a6;
}

.tech-input__error {
  color: #f44336;
  font-size: 12px;
}

.tech-input__hint {
  color: #9ea1a6;
  font-size: 12px;
}
</style>
```

### 预约相关组件 (Booking Components)

#### BookingCalendar - 预约日历

```vue
<template>
  <div class="booking-calendar">
    <div class="booking-calendar__header">
      <TechButton @click="previousMonth" type="ghost" size="small">
        <IconChevronLeft />
      </TechButton>

      <h3 class="booking-calendar__title">
        {{ currentMonth.format('YYYY年MM月') }}
      </h3>

      <TechButton @click="nextMonth" type="ghost" size="small">
        <IconChevronRight />
      </TechButton>
    </div>

    <div class="booking-calendar__weekdays">
      <div v-for="weekday in weekdays" :key="weekday" class="booking-calendar__weekday">
        {{ weekday }}
      </div>
    </div>

    <div class="booking-calendar__days">
      <div
        v-for="day in days"
        :key="day.date"
        class="booking-calendar__day"
        :class="{
          'booking-calendar__day--disabled': day.disabled,
          'booking-calendar__day--selected': day.selected,
          'booking-calendar__day--today': day.isToday,
          'booking-calendar__day--has-events': day.hasEvents
        }"
        @click="selectDay(day)"
      >
        <span class="booking-calendar__day-number">{{ day.date }}</span>
        <div class="booking-calendar__day-events" v-if="day.events?.length">
          <div
            v-for="event in day.events.slice(0, 3)"
            :key="event.id"
            class="booking-calendar__event-dot"
            :style="{ backgroundColor: event.color }"
          />
        </div>
      </div>
    </div>

    <div class="booking-calendar__time-slots" v-if="selectedDay">
      <h4 class="booking-calendar__time-title">
        {{ selectedDay.format('MM月DD日') }} 可预约时间
      </h4>

      <div class="booking-calendar__time-grid">
        <TechButton
          v-for="slot in timeSlots"
          :key="slot.time"
          :type="slot.selected ? 'primary' : 'secondary'"
          size="small"
          :disabled="slot.disabled"
          @click="selectTimeSlot(slot)"
        >
          {{ slot.time }}
          <span v-if="slot.available !== undefined" class="booking-calendar__availability">
            ({{ slot.available }})
          </span>
        </TechButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'

interface TimeSlot {
  time: string
  available?: number
  disabled: boolean
  selected: boolean
}

interface CalendarDay {
  date: number
  fullDate: Dayjs
  disabled: boolean
  selected: boolean
  isToday: boolean
  hasEvents: boolean
  events?: Array<{ id: string; color: string }>
}

const props = defineProps<{
  modelValue?: Dayjs
  timeSlots?: TimeSlot[]
  disabledDates?: Dayjs[]
  events?: Array<{ date: Dayjs; color: string; id: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Dayjs]
  'time-slot-selected': [slot: TimeSlot]
}>()

const currentMonth = ref(dayjs())
const selectedDay = ref<Dayjs>()
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const days = computed((): CalendarDay[] => {
  const startOfMonth = currentMonth.value.startOf('month')
  const endOfMonth = currentMonth.value.endOf('month')
  const startDate = startOfMonth.startOf('week')
  const endDate = endOfMonth.endOf('week')

  const days: CalendarDay[] = []
  let current = startDate

  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    const dayEvents = props.events?.filter(event =>
      event.date.isSame(current, 'day')
    ) || []

    days.push({
      date: current.date(),
      fullDate: current,
      disabled: isDisabled(current),
      selected: selectedDay.value?.isSame(current, 'day') || false,
      isToday: current.isSame(dayjs(), 'day'),
      hasEvents: dayEvents.length > 0,
      events: dayEvents
    })

    current = current.add(1, 'day')
  }

  return days
})

const isDisabled = (date: Dayjs): boolean => {
  if (props.disabledDates) {
    return props.disabledDates.some(disabledDate =>
      disabledDate.isSame(date, 'day')
    )
  }
  return false
}

const selectDay = (day: CalendarDay) => {
  if (!day.disabled) {
    selectedDay.value = day.fullDate
    emit('update:modelValue', day.fullDate)
  }
}

const selectTimeSlot = (slot: TimeSlot) => {
  if (!slot.disabled) {
    emit('time-slot-selected', slot)
  }
}

const previousMonth = () => {
  currentMonth.value = currentMonth.value.subtract(1, 'month')
}

const nextMonth = () => {
  currentMonth.value = currentMonth.value.add(1, 'month')
}

onMounted(() => {
  if (props.modelValue) {
    currentMonth.value = props.modelValue.startOf('month')
    selectedDay.value = props.modelValue
  }
})
</script>

<style scoped>
.booking-calendar {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(253, 216, 53, 0.1);
  border-radius: 18px;
  padding: 24px;
}

.booking-calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.booking-calendar__title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

.booking-calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.booking-calendar__weekday {
  text-align: center;
  color: #9ea1a6;
  font-size: 12px;
  font-weight: 500;
  padding: 8px;
}

.booking-calendar__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.booking-calendar__day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.booking-calendar__day:hover:not(.booking-calendar__day--disabled) {
  background: rgba(253, 216, 53, 0.1);
  transform: translateY(-2px);
}

.booking-calendar__day--selected {
  background: rgba(253, 216, 53, 0.2);
  border: 1px solid rgba(253, 216, 53, 0.5);
}

.booking-calendar__day--today {
  border: 1px solid rgba(253, 216, 53, 0.3);
}

.booking-calendar__day--disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.booking-calendar__day-number {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.booking-calendar__day-events {
  display: flex;
  gap: 2px;
  margin-top: 4px;
}

.booking-calendar__event-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.booking-calendar__time-slots {
  border-top: 1px solid rgba(253, 216, 53, 0.1);
  padding-top: 24px;
}

.booking-calendar__time-title {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.booking-calendar__time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.booking-calendar__availability {
  font-size: 12px;
  opacity: 0.8;
}
</style>
```

#### CoursePicker - 课程选择器

```vue
<template>
  <div class="course-picker">
    <div class="course-picker__search">
      <TechInput
        v-model="searchQuery"
        placeholder="搜索课程名称或教练"
        @input="handleSearch"
      >
        <template #prefix>
          <IconSearch />
        </template>
      </TechInput>
    </div>

    <div class="course-picker__filters">
      <div class="course-picker__filter-group">
        <label class="course-picker__filter-label">课程类型</label>
        <div class="course-picker__filter-options">
          <TechButton
            v-for="category in categories"
            :key="category.id"
            :type="selectedCategory === category.id ? 'primary' : 'secondary'"
            size="small"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </TechButton>
        </div>
      </div>

      <div class="course-picker__filter-group">
        <label class="course-picker__filter-label">难度等级</label>
        <div class="course-picker__filter-options">
          <TechButton
            v-for="level in levels"
            :key="level.id"
            :type="selectedLevel === level.id ? 'primary' : 'secondary'"
            size="small"
            @click="selectLevel(level.id)"
          >
            {{ level.name }}
          </TechButton>
        </div>
      </div>
    </div>

    <div class="course-picker__list">
      <TechCard
        v-for="course in filteredCourses"
        :key="course.id"
        class="course-picker__item"
        :hover-lift="true"
        @click="selectCourse(course)"
      >
        <div class="course-picker__course-content">
          <div class="course-picker__course-header">
            <h4 class="course-picker__course-title">{{ course.name }}</h4>
            <div class="course-picker__course-meta">
              <span class="course-picker__course-duration">
                <IconClock />
                {{ course.duration }}分钟
              </span>
              <span class="course-picker__course-level" :class="`course-picker__course-level--${course.level}`">
                {{ getLevelName(course.level) }}
              </span>
            </div>
          </div>

          <p class="course-picker__course-description">{{ course.description }}</p>

          <div class="course-picker__course-footer">
            <div class="course-picker__course-coach">
              <img :src="course.coach.avatar" class="course-picker__coach-avatar" />
              <span class="course-picker__coach-name">{{ course.coach.name }}</span>
            </div>

            <div class="course-picker__course-price">
              <span class="course-picker__price-value">¥{{ course.price }}</span>
              <span class="course-picker__price-unit">/次</span>
            </div>
          </div>
        </div>
      </TechCard>
    </div>

    <div class="course-picker__pagination" v-if="totalPages > 1">
      <TechButton
        @click="previousPage"
        :disabled="currentPage === 1"
        type="ghost"
        size="small"
      >
        上一页
      </TechButton>

      <span class="course-picker__page-info">
        {{ currentPage }} / {{ totalPages }}
      </span>

      <TechButton
        @click="nextPage"
        :disabled="currentPage === totalPages"
        type="ghost"
        size="small"
      >
        下一页
      </TechButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Course, Coach } from '@/types'

interface Props {
  courses: Course[]
  selectedCourse?: Course
}

interface Category {
  id: string
  name: string
}

interface Level {
  id: string
  name: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'course-selected': [course: Course]
}>()

const searchQuery = ref('')
const selectedCategory = ref<string>('')
const selectedLevel = ref<string>('')
const currentPage = ref(1)
const pageSize = 12

const categories: Category[] = [
  { id: '', name: '全部' },
  { id: 'strength', name: '力量训练' },
  { id: 'cardio', name: '有氧运动' },
  { id: 'yoga', name: '瑜伽' },
  { id: 'dance', name: '舞蹈' },
  { id: 'pilates', name: '普拉提' }
]

const levels: Level[] = [
  { id: '', name: '全部' },
  { id: 'beginner', name: '入门' },
  { id: 'intermediate', name: '中级' },
  { id: 'advanced', name: '高级' }
]

const filteredCourses = computed(() => {
  let filtered = props.courses

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(course =>
      course.name.toLowerCase().includes(query) ||
      course.coach.name.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query)
    )
  }

  // 分类过滤
  if (selectedCategory.value) {
    filtered = filtered.filter(course => course.category === selectedCategory.value)
  }

  // 难度过滤
  if (selectedLevel.value) {
    filtered = filtered.filter(course => course.level === selectedLevel.value)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredCourses.value.length / pageSize))

const paginatedCourses = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredCourses.value.slice(start, end)
})

const selectCourse = (course: Course) => {
  emit('course-selected', course)
}

const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
  currentPage.value = 1
}

const selectLevel = (levelId: string) => {
  selectedLevel.value = levelId
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const getLevelName = (level: string): string => {
  const levelMap: Record<string, string> = {
    'beginner': '入门',
    'intermediate': '中级',
    'advanced': '高级'
  }
  return levelMap[level] || level
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

watch(filteredCourses, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.course-picker {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.course-picker__search {
  max-width: 400px;
}

.course-picker__filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-picker__filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.course-picker__filter-label {
  color: #bdbdbd;
  font-size: 14px;
  font-weight: 500;
}

.course-picker__filter-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.course-picker__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.course-picker__item {
  cursor: pointer;
}

.course-picker__course-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-picker__course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.course-picker__course-title {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.course-picker__course-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.course-picker__course-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #9ea1a6;
  font-size: 12px;
}

.course-picker__course-level {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}

.course-picker__course-level--beginner {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.course-picker__course-level--intermediate {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.course-picker__course-level--advanced {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.course-picker__course-description {
  color: #bdbdbd;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.course-picker__course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-picker__course-coach {
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-picker__coach-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.course-picker__coach-name {
  color: #9ea1a6;
  font-size: 12px;
}

.course-picker__course-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.course-picker__price-value {
  color: #fdd835;
  font-size: 18px;
  font-weight: 600;
}

.course-picker__price-unit {
  color: #9ea1a6;
  font-size: 12px;
}

.course-picker__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.course-picker__page-info {
  color: #bdbdbd;
  font-size: 14px;
}
</style>
```

---

## ✨ 动效系统

### GSAP动效库

#### useHoverGlow - 悬停发光效果

```typescript
// src/composables/animations/useHoverGlow.ts
import { gsap } from 'gsap'
import { onMounted, onUnmounted } from 'vue'

export interface HoverGlowOptions {
  glowColor?: string
  glowIntensity?: number
  duration?: number
  ease?: string
}

export function useHoverGlow(
  elementRef: Ref<HTMLElement | null>,
  options: HoverGlowOptions = {}
) {
  const {
    glowColor = 'rgba(253, 216, 53, 0.3)',
    glowIntensity = 0.5,
    duration = 0.3,
    ease = 'power2.out'
  } = options

  let ctx: gsap.Context

  const initHoverGlow = () => {
    if (!elementRef.value) return

    ctx = gsap.context(() => {
      const element = elementRef.value!

      // 设置初始状态
      gsap.set(element, {
        '--glow-color': 'rgba(253, 216, 53, 0)',
        '--glow-opacity': 0
      })

      // 创建悬停时间线
      const hoverTimeline = gsap.timeline({ paused: true })

      hoverTimeline
        .to(element, {
          '--glow-opacity': glowIntensity,
          duration,
          ease
        })
        .to(element, {
          y: -4,
          duration,
          ease
        }, 0)

      // 绑定事件
      element.addEventListener('mouseenter', () => hoverTimeline.play())
      element.addEventListener('mouseleave', () => hoverTimeline.reverse())

    }, elementRef.value)
  }

  const destroyHoverGlow = () => {
    if (ctx) {
      ctx.revert()
    }
  }

  onMounted(() => {
    initHoverGlow()
  })

  onUnmounted(() => {
    destroyHoverGlow()
  })

  return {
    initHoverGlow,
    destroyHoverGlow
  }
}
```

#### usePageTransition - 页面过渡动效

```typescript
// src/composables/animations/usePageTransition.ts
import { gsap } from 'gsap'
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

export interface PageTransitionOptions {
  enterDuration?: number
  exitDuration?: number
  staggerDelay?: number
  ease?: string
}

export function usePageTransition(
  containerRef: Ref<HTMLElement | null>,
  options: PageTransitionOptions = {}
) {
  const route = useRoute()

  const {
    enterDuration = 0.6,
    exitDuration = 0.4,
    staggerDelay = 0.1,
    ease = 'power3.out'
  } = options

  let ctx: gsap.Context

  const animatePageEnter = () => {
    if (!containerRef.value) return

    ctx = gsap.context(() => {
      const container = containerRef.value!
      const elements = container.querySelectorAll('.animate-on-enter')

      gsap.set(elements, {
        opacity: 0,
        y: 30,
        scale: 0.95
      })

      gsap.to(elements, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: enterDuration,
        ease,
        stagger: staggerDelay
      })
    }, containerRef.value)
  }

  const animatePageExit = (): Promise<void> => {
    return new Promise((resolve) => {
      if (!containerRef.value) {
        resolve()
        return
      }

      ctx = gsap.context(() => {
        const container = containerRef.value!
        const elements = container.querySelectorAll('.animate-on-enter')

        gsap.to(elements, {
          opacity: 0,
          y: -20,
          scale: 0.95,
          duration: exitDuration,
          ease: 'power2.in',
          stagger: staggerDelay,
          onComplete: resolve
        })
      }, containerRef.value)
    })
  }

  // 监听路由变化
  watch(() => route.path, async (newPath, oldPath) => {
    if (oldPath && newPath !== oldPath) {
      await animatePageExit()
      animatePageEnter()
    }
  })

  onMounted(() => {
    animatePageEnter()
  })

  onUnmounted(() => {
    if (ctx) {
      ctx.revert()
    }
  })

  return {
    animatePageEnter,
    animatePageExit
  }
}
```

#### useLoadingGlow - 加载发光动效

```typescript
// src/composables/animations/useLoadingGlow.ts
import { gsap } from 'gsap'
import { onMounted, onUnmounted } from 'vue'

export interface LoadingGlowOptions {
  colors?: string[]
  duration?: number
  intensity?: number
}

export function useLoadingGlow(
  elementRef: Ref<HTMLElement | null>,
  isLoading: Ref<boolean>,
  options: LoadingGlowOptions = {}
) {
  const {
    colors = ['#fdd835', '#ffb300', '#ff8f00'],
    duration = 2,
    intensity = 0.6
  } = options

  let ctx: gsap.Context
  let animation: gsap.core.Timeline

  const startLoadingGlow = () => {
    if (!elementRef.value) return

    ctx = gsap.context(() => {
      const element = elementRef.value!

      // 创建颜色循环动画
      animation = gsap.timeline({ repeat: -1 })

      colors.forEach((color, index) => {
        animation.to(element, {
          '--glow-color': color,
          '--glow-opacity': intensity,
          duration: duration / colors.length,
          ease: 'none'
        }, index * (duration / colors.length))
      })

      // 添加脉冲效果
      gsap.to(element, {
        '--glow-scale': 1.05,
        duration: duration / 2,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true
      })

    }, elementRef.value)
  }

  const stopLoadingGlow = () => {
    if (animation) {
      animation.kill()
    }

    if (elementRef.value) {
      gsap.to(elementRef.value, {
        '--glow-opacity': 0,
        '--glow-scale': 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
  }

  // 监听加载状态
  watch(isLoading, (loading) => {
    if (loading) {
      startLoadingGlow()
    } else {
      stopLoadingGlow()
    }
  })

  onMounted(() => {
    if (isLoading.value) {
      startLoadingGlow()
    }
  })

  onUnmounted(() => {
    if (ctx) {
      ctx.revert()
    }
    if (animation) {
      animation.kill()
    }
  })

  return {
    startLoadingGlow,
    stopLoadingGlow
  }
}
```

### Three.js 3D动效

#### useParticleSystem - 粒子系统

```typescript
// src/composables/animations/useParticleSystem.ts
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

export interface ParticleSystemOptions {
  count?: number
  size?: number
  color?: string
  speed?: number
  spread?: number
}

export function useParticleSystem(
  containerRef: Ref<HTMLElement | null>,
  options: ParticleSystemOptions = {}
) {
  const {
    count = 100,
    size = 2,
    color = '#fdd835',
    speed = 1,
    spread = 50
  } = options

  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let particles: THREE.Points
  let animationId: number

  const initParticleSystem = () => {
    if (!containerRef.value) return

    const container = containerRef.value

    // 创建场景
    scene = new THREE.Scene()

    // 创建相机
    camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 100

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread

      velocities[i * 3] = (Math.random() - 0.5) * speed
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speed
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speed
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // 创建材质
    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })

    // 创建粒子系统
    particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // 开始动画
    animate()
  }

  const animate = () => {
    animationId = requestAnimationFrame(animate)

    if (particles) {
      particles.rotation.x += 0.001
      particles.rotation.y += 0.002

      // 更新粒子位置
      const positions = particles.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3]
        positions[i * 3 + 1] += velocities[i * 3 + 1]
        positions[i * 3 + 2] += velocities[i * 3 + 2]

        // 边界检查
        if (Math.abs(positions[i * 3]) > spread / 2) velocities[i * 3] *= -1
        if (Math.abs(positions[i * 3 + 1]) > spread / 2) velocities[i * 3 + 1] *= -1
        if (Math.abs(positions[i * 3 + 2]) > spread / 2) velocities[i * 3 + 2] *= -1
      }

      particles.geometry.attributes.position.needsUpdate = true
    }

    renderer.render(scene, camera)
  }

  const resize = () => {
    if (!containerRef.value || !camera || !renderer) return

    const container = containerRef.value
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  const destroyParticleSystem = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }

    if (renderer) {
      renderer.dispose()
    }

    if (containerRef.value && renderer.domElement) {
      containerRef.value.removeChild(renderer.domElement)
    }
  }

  onMounted(() => {
    initParticleSystem()
    window.addEventListener('resize', resize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    destroyParticleSystem()
  })

  return {
    initParticleSystem,
    destroyParticleSystem,
    resize
  }
}
```

---

## 📊 状态管理

### Pinia Store 架构

#### 应用全局状态

```typescript
// src/stores/app.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const isLoading = ref(false)
  const user = ref<User | null>(null)
  const theme = ref<'light' | 'dark'>('dark')
  const language = ref<'zh' | 'en'>('zh')

  // 计算属性
  const isAuthenticated = computed(() => Boolean(user.value))
  const displayName = computed(() => user.value?.name || '游客')

  // 动作
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setUser = (userData: User | null) => {
    user.value = userData
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const setLanguage = (newLanguage: 'zh' | 'en') => {
    language.value = newLanguage
    // 更新i18n实例
  }

  return {
    // 状态
    isLoading,
    user,
    theme,
    language,

    // 计算属性
    isAuthenticated,
    displayName,

    // 动作
    setLoading,
    setUser,
    setTheme,
    setLanguage
  }
})
```

#### 预约状态管理

```typescript
// src/stores/booking.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Course, Coach, Booking } from '@/types'

export const useBookingStore = defineStore('booking', () => {
  // 预约流程状态
  const currentStep = ref<1 | 2 | 3>(1)
  const selectedCourse = ref<Course | null>(null)
  const selectedCoach = ref<Coach | null>(null)
  const selectedDateTime = ref<Date | null>(null)
  const bookingForm = ref({
    notes: '',
    contactName: '',
    contactPhone: '',
    emergencyContact: ''
  })

  // 冲突检测状态
  const conflicts = ref<Booking[]>([])
  const isCheckingConflicts = ref(false)

  // 预约列表
  const bookings = ref<Booking[]>([])
  const isLoadingBookings = ref(false)

  // 计算属性
  const isStepValid = computed(() => {
    switch (currentStep.value) {
      case 1:
        return Boolean(selectedCourse.value)
      case 2:
        return Boolean(selectedDateTime.value)
      case 3:
        return Boolean(
          bookingForm.value.contactName &&
          bookingForm.value.contactPhone
        )
      default:
        return false
    }
  })

  const canProceed = computed(() => {
    return isStepValid.value && conflicts.value.length === 0
  })

  const bookingSummary = computed(() => {
    if (!selectedCourse.value || !selectedDateTime.value) return null

    return {
      course: selectedCourse.value,
      coach: selectedCoach.value,
      dateTime: selectedDateTime.value,
      form: bookingForm.value,
      totalPrice: selectedCourse.value.price
    }
  })

  // 动作
  const nextStep = () => {
    if (canProceed.value && currentStep.value < 3) {
      currentStep.value++
    }
  }

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  const selectCourse = (course: Course) => {
    selectedCourse.value = course
    // 如果课程指定了教练，自动选择
    if (course.coachId) {
      // 获取教练信息
      selectedCoach.value = null // 需要从API获取
    }
  }

  const selectDateTime = async (dateTime: Date) => {
    selectedDateTime.value = dateTime
    await checkConflicts()
  }

  const checkConflicts = async () => {
    if (!selectedDateTime.value) return

    isCheckingConflicts.value = true
    try {
      // 调用API检查冲突
      const conflictData = await bookingApi.checkConflicts({
        dateTime: selectedDateTime.value,
        courseId: selectedCourse.value?.id
      })
      conflicts.value = conflictData
    } catch (error) {
      console.error('检查冲突失败:', error)
      conflicts.value = []
    } finally {
      isCheckingConflicts.value = false
    }
  }

  const submitBooking = async () => {
    if (!bookingSummary.value) return null

    try {
      const booking = await bookingApi.createBooking(bookingSummary.value)
      // 重置状态
      resetBooking()
      return booking
    } catch (error) {
      console.error('创建预约失败:', error)
      throw error
    }
  }

  const resetBooking = () => {
    currentStep.value = 1
    selectedCourse.value = null
    selectedCoach.value = null
    selectedDateTime.value = null
    bookingForm.value = {
      notes: '',
      contactName: '',
      contactPhone: '',
      emergencyContact: ''
    }
    conflicts.value = []
  }

  const loadBookings = async () => {
    isLoadingBookings.value = true
    try {
      const bookingList = await bookingApi.getUserBookings()
      bookings.value = bookingList
    } catch (error) {
      console.error('加载预约列表失败:', error)
    } finally {
      isLoadingBookings.value = false
    }
  }

  return {
    // 状态
    currentStep,
    selectedCourse,
    selectedCoach,
    selectedDateTime,
    bookingForm,
    conflicts,
    isCheckingConflicts,
    bookings,
    isLoadingBookings,

    // 计算属性
    isStepValid,
    canProceed,
    bookingSummary,

    // 动作
    nextStep,
    previousStep,
    selectCourse,
    selectDateTime,
    checkConflicts,
    submitBooking,
    resetBooking,
    loadBookings
  }
})
```

---

## 🔗 API集成

### 服务层架构

#### 通用CRUD服务

```typescript
// src/services/crud.ts
import { http } from '@/utils/http'
import type { ApiResponse, PaginationParams, CrudService } from '@/types'

export class GenericCrudService<T extends { id: string | number }> implements CrudService<T> {
  constructor(private endpoint: string) {}

  async list(params?: PaginationParams): Promise<ApiResponse<T[]>> {
    return http.get(`${this.endpoint}/list`, { params })
  }

  async get(id: string | number): Promise<ApiResponse<T>> {
    return http.get(`${this.endpoint}/${id}`)
  }

  async create(data: Omit<T, 'id'>): Promise<ApiResponse<T>> {
    return http.post(this.endpoint, data)
  }

  async update(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
    return http.put(`${this.endpoint}/${id}`, data)
  }

  async delete(id: string | number): Promise<ApiResponse<void>> {
    return http.delete(`${this.endpoint}/${id}`)
  }

  async batchDelete(ids: (string | number)[]): Promise<ApiResponse<void>> {
    return http.post(`${this.endpoint}/batch-delete`, { ids })
  }
}

// 模块服务工厂
export function getModuleService<T extends { id: string | number }>(moduleKey: string): CrudService<T> {
  return new GenericCrudService<T>(`/api/${moduleKey}`)
}
```

#### 预约专用服务

```typescript
// src/services/booking.ts
import { http } from '@/utils/http'
import type { ApiResponse, Course, Coach, Booking, BookingConflict } from '@/types'

export class BookingService {
  // 课程相关
  async getCourses(params?: { category?: string; level?: string }): Promise<ApiResponse<Course[]>> {
    return http.get('/api/courses', { params })
  }

  async getCourse(id: string): Promise<ApiResponse<Course>> {
    return http.get(`/api/courses/${id}`)
  }

  // 教练相关
  async getCoaches(params?: { specialty?: string }): Promise<ApiResponse<Coach[]>> {
    return http.get('/api/coaches', { params })
  }

  async getCoach(id: string): Promise<ApiResponse<Coach>> {
    return http.get(`/api/coaches/${id}`)
  }

  // 预约相关
  async createBooking(bookingData: {
    courseId: string
    coachId?: string
    dateTime: Date
    notes?: string
    contactName: string
    contactPhone: string
    emergencyContact?: string
  }): Promise<ApiResponse<Booking>> {
    return http.post('/api/bookings', bookingData)
  }

  async getUserBookings(): Promise<ApiResponse<Booking[]>> {
    return http.get('/api/bookings/user')
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<ApiResponse<Booking>> {
    return http.put(`/api/bookings/${id}`, data)
  }

  async cancelBooking(id: string): Promise<ApiResponse<void>> {
    return http.put(`/api/bookings/${id}/cancel`)
  }

  // 冲突检测
  async checkConflicts(params: {
    courseId?: string
    coachId?: string
    dateTime: Date
    excludeBookingId?: string
  }): Promise<ApiResponse<BookingConflict[]>> {
    return http.get('/api/bookings/check-conflicts', { params })
  }

  // 可预约时间段
  async getAvailableSlots(courseId: string, date: string): Promise<ApiResponse<{
    time: string
    available: number
    total: number
  }[]>> {
    return http.get('/api/courses/${courseId}/available-slots', {
      params: { date }
    })
  }
}

export const bookingService = new BookingService()
```

### HTTP客户端封装

```typescript
// src/utils/http.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { useAppStore } from '@/stores/app'
import type { ApiResponse } from '@/types'

class HttpClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const appStore = useAppStore()

        // 添加认证头
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 添加语言头
        config.headers['Accept-Language'] = appStore.language

        // 显示loading
        if (config.showLoading !== false) {
          appStore.setLoading(true)
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const appStore = useAppStore()
        appStore.setLoading(false)

        const { data } = response

        // 处理业务错误
        if (data.code !== 200) {
          // 显示错误消息
          console.error(data.message)
          throw new Error(data.message)
        }

        return response
      },
      (error) => {
        const appStore = useAppStore()
        appStore.setLoading(false)

        // 处理HTTP错误
        if (error.response) {
          const { status, data } = error.response

          switch (status) {
            case 401:
              // 未授权，跳转登录
              console.error('未授权，请重新登录')
              break
            case 403:
              console.error('访问被拒绝')
              break
            case 404:
              console.error('请求地址不存在')
              break
            case 500:
              console.error('服务器内部错误')
              break
            default:
              console.error(data?.message || '网络错误')
          }
        } else if (error.code === 'ECONNABORTED') {
          console.error('请求超时')
        } else {
          console.error('网络连接失败')
        }

        return Promise.reject(error)
      }
    )
  }

  // GET请求
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get(url, config).then(res => res.data)
  }

  // POST请求
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config).then(res => res.data)
  }

  // PUT请求
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config).then(res => res.data)
  }

  // DELETE请求
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config).then(res => res.data)
  }

  // PATCH请求
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.patch(url, data, config).then(res => res.data)
  }
}

export const http = new HttpClient()
```

---

## ⚡ 性能优化

### 组件懒加载

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/pages/Home.vue')
    },
    {
      path: '/booking',
      name: 'Booking',
      component: () => import('@/pages/Booking.vue'),
      children: [
        {
          path: 'course',
          name: 'CourseBooking',
          component: () => import('@/pages/booking/CourseBooking.vue')
        },
        {
          path: 'coach',
          name: 'CoachBooking',
          component: () => import('@/pages/booking/CoachBooking.vue')
        }
      ]
    }
  ]
})
```

### 虚拟滚动

```vue
<template>
  <div class="virtual-list" ref="containerRef">
    <div
      class="virtual-list__viewport"
      :style="{ height: `${totalHeight}px` }"
    >
      <div
        class="virtual-list__offset"
        :style="{ transform: `translateY(${offset}px)` }"
      >
        <div
          v-for="item in visibleItems"
          :key="item.id"
          class="virtual-list__item"
        >
          <slot :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  items: any[]
  itemHeight: number
  containerHeight: number
}

const props = defineProps<Props>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

const totalHeight = computed(() => props.items.length * props.itemHeight)

const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const end = start + Math.ceil(props.containerHeight / props.itemHeight)
  return { start: Math.max(0, start - 5), end: Math.min(props.items.length, end + 5) }
})

const visibleItems = computed(() => {
  const { start, end } = visibleRange.value
  return props.items.slice(start, end)
})

const offset = computed(() => visibleRange.value.start * props.itemHeight)

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
}

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.virtual-list {
  height: v-bind('containerHeight + "px"');
  overflow: auto;
}

.virtual-list__viewport {
  position: relative;
}

.virtual-list__offset {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.virtual-list__item {
  height: v-bind('itemHeight + "px"');
}
</style>
```

### 资源优化

#### 图片懒加载

```vue
<template>
  <img
    v-lazy="src"
    :alt="alt"
    class="lazy-image"
    @load="onLoad"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  src: string
  alt?: string
  placeholder?: string
}

const props = defineProps<Props>()

const isLoaded = ref(false)
const hasError = ref(false)

const onLoad = () => {
  isLoaded.value = true
}

const onError = () => {
  hasError.value = true
}
</script>

<style scoped>
.lazy-image {
  transition: opacity 0.3s ease;
  opacity: v-bind('isLoaded ? 1 : 0.3');
}

.lazy-image[data-src] {
  background: linear-gradient(90deg, #f0f0f0 25%, transparent 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: loading 1.4s ease-in-out infinite;
}

@keyframes loading {
  0% { background-position: 100% 50%; }
  100% { background-position: -100% 50%; }
}
</style>
```

#### 代码分割

```typescript
// src/utils/code-splitting.ts
import { defineAsyncComponent } from 'vue'

// 异步组件加载
export const AsyncTechCard = defineAsyncComponent({
  loader: () => import('@/components/tech/TechCard.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})

// 按路由分割
export const routeComponents = {
  Home: () => import('@/pages/Home.vue'),
  Booking: () => import('@/pages/Booking.vue'),
  Profile: () => import('@/pages/Profile.vue')
}

// 第三方库分割
export const loadHeavyLibrary = async () => {
  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')

  gsap.registerPlugin(ScrollTrigger)
  return { gsap, ScrollTrigger }
}
```

---

## 🧪 测试策略

### 单元测试

```typescript
// src/components/tech/__tests__/TechButton.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TechButton from '../TechButton.vue'

describe('TechButton', () => {
  it('renders correctly', () => {
    const wrapper = mount(TechButton, {
      props: {
        type: 'primary',
        text: 'Click me'
      }
    })

    expect(wrapper.text()).toContain('Click me')
    expect(wrapper.classes()).toContain('tech-button--primary')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(TechButton, {
      props: { text: 'Click me' }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(TechButton, {
      props: {
        text: 'Click me',
        disabled: true
      }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('shows loading state', () => {
    const wrapper = mount(TechButton, {
      props: {
        text: 'Loading',
        loading: true
      }
    })

    expect(wrapper.classes()).toContain('tech-button--loading')
    expect(wrapper.find('.tech-button__spinner').exists()).toBe(true)
  })
})
```

### 组合式API测试

```typescript
// src/composables/__tests__/useHoverGlow.test.ts
import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useHoverGlow } from '../animations/useHoverGlow'
import { gsap } from 'gsap'

// Mock GSAP
vi.mock('gsap', () => ({
  gsap: {
    context: vi.fn(),
    set: vi.fn(),
    to: vi.fn(),
    timeline: vi.fn(() => ({
      paused: true,
      play: vi.fn(),
      reverse: vi.fn()
    }))
  }
}))

describe('useHoverGlow', () => {
  it('initializes hover glow effect', () => {
    const elementRef = ref(document.createElement('div'))

    useHoverGlow(elementRef)

    expect(gsap.context).toHaveBeenCalled()
  })

  it('handles custom options', () => {
    const elementRef = ref(document.createElement('div'))
    const options = {
      glowColor: '#ff0000',
      glowIntensity: 0.8,
      duration: 0.5
    }

    useHoverGlow(elementRef, options)

    expect(gsap.context).toHaveBeenCalled()
  })
})
```

### E2E测试

```typescript
// tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Course Booking Flow', () => {
  test('completes full booking process', async ({ page }) => {
    // 访问首页
    await page.goto('/')

    // 点击预约课程
    await page.click('[data-testid="book-course-button"]')

    // 选择课程
    await page.click('[data-testid="course-item"]:first-child')

    // 验证步骤1完成
    await expect(page.locator('[data-testid="step-indicator"].active')).toHaveText('1')

    // 选择日期和时间
    await page.click('[data-testid="calendar-day"]:not(.disabled)')
    await page.click('[data-testid="time-slot"]:not(.disabled)')

    // 验证步骤2完成
    await expect(page.locator('[data-testid="step-indicator"].active')).toHaveText('2')

    // 填写预约信息
    await page.fill('[data-testid="contact-name"]', '测试用户')
    await page.fill('[data-testid="contact-phone"]', '13800138000')
    await page.fill('[data-testid="booking-notes"]', '希望预约初级课程')

    // 提交预约
    await page.click('[data-testid="submit-booking"]')

    // 验证成功页面
    await expect(page.locator('[data-testid="booking-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="booking-id"]')).toBeVisible()
  })

  test('shows conflict warning', async ({ page }) => {
    // ... 冲突检测测试
  })

  test('validates form fields', async ({ page }) => {
    // ... 表单验证测试
  })
})
```

---

## 🚀 部署配置

### 构建优化

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { splitVendorChunkPlugin } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    splitVendorChunkPlugin(),
    visualizer({
      filename: 'dist/report.html',
      open: true,
      gzipSize: true
    })
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus'],
          'animation-vendor': ['gsap', 'three'],
          'utils-vendor': ['dayjs', 'axios', 'lodash-es']
        }
      }
    },

    chunkSizeWarningLimit: 1000,

    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

### Docker部署

```dockerfile
# Dockerfile
FROM node:18-alpine as build-stage

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine as production-stage

# 复制构建产物
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  # Gzip压缩
  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # 路由重定向到index.html（SPA支持）
    location / {
      try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
      proxy_pass http://backend:8080;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }
  }
}
```

### CI/CD配置

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: dist

      - name: Deploy to server
        run: |
          echo "Deploying to production server..."
          # 实际部署命令
```

---

*本文档为技术实现指南，将根据项目发展持续更新。如需了解具体实现细节，请查看相应的源代码文件。*
