---
title: LIST_PAGES_SIJIAOYUYUE
version: v1.0.0
last_updated: 2025-11-17
status: active
category: technical
tags: [vue, component, frontend, page, booking, sijiaoyuyue]
---

# LIST_PAGES_SIJIAOYUYUE

> **版本**：v1.0.0
> **更新日期**：2025-11-17
> **组件类型**：页面组件
> **适用框架**：Vue 3 + TypeScript + Element Plus
> **依赖组件**：Stepper, TechCard, TechButton, CoachRecommend, GoalSelector, SchedulePlanner, BookingSummary

---

## 📋 目录

- [概述](#概述)
- [功能特性](#功能特性)
- [API接口](#api接口)
- [使用示例](#使用示例)
- [实现细节](#实现细节)
- [测试说明](#测试说明)
- [相关文档](#相关文档)

---

## 📖 概述

### 组件描述

私教预约列表页面是一个完整的多步骤预约流程组件，引导用户完成从教练选择到最终支付的整个私教预约过程。该组件集成了智能推荐、冲突检测、价格计算、进度跟踪等高级功能。

### 适用场景

- 健身房私教预约系统
- 多步骤表单流程
- 需要复杂业务逻辑的预约场景
- 包含推荐算法和冲突检测的预订系统

### 依赖关系

```json
{
  "vue": "^3.3.0",
  "vue-router": "^4.2.0",
  "@vueuse/core": "^10.0.0",
  "element-plus": "^2.4.0"
}
```

---

## ✨ 功能特性

### 核心功能

- [x] **多步骤预约流程**：4步完整预约流程（教练选择→目标设定→时间安排→确认支付）
- [x] **智能教练推荐**：基于用户历史、偏好和价格的个性化推荐算法
- [x] **实时冲突检测**：智能检测预约时间冲突并提供解决方案
- [x] **动态价格计算**：实时计算包含优惠券、会员折扣的最终价格
- [x] **进度跟踪**：可视化预约完成进度和步骤验证
- [x] **响应式设计**：支持桌面和移动设备的自适应布局
- [x] **表单验证**：完整的前端验证和后端提交处理

### 扩展功能

- [x] **时间建议系统**：基于教练可用性和用户偏好提供智能时间推荐
- [x] **页面切换动画**：流畅的步骤切换和页面进入动画效果
- [x] **状态持久化**：预约数据在步骤间保持，支持页面刷新恢复
- [x] **支付方式选择**：支持在线支付和线下支付两种方式
- [x] **预约成功反馈**：预约成功后的多种后续操作引导

---

## 🔧 API接口

### Props 属性

该组件不接受外部props，通过路由参数和内部状态管理控制。

### Events 事件

该组件不触发外部事件，所有交互通过路由导航和内部状态处理。

### Slots 插槽

该组件不提供插槽，所有内容通过内部组件组合实现。

### Expose 方法

该组件不暴露公共方法。

---

## 💡 使用示例

### 基本用法

```vue
<!-- 路由配置 -->
<template>
  <router-view />
</template>

<script setup lang="ts">
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/sijiaoyuyue',
    name: 'PrivateBooking',
    component: () => import('@/pages/sijiaoyuyue/list.vue'),
    meta: { title: '私教预约' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
</script>
```

### 路由参数使用

```typescript
// 从教练列表跳转到预约页面
router.push({
  path: '/sijiaoyuyue',
  query: { coachId: selectedCoach.id }
})
```

### 预约流程集成

```vue
<template>
  <div class="booking-container">
    <!-- 预约流程会自动处理所有步骤 -->
    <PrivateBookingList />
  </div>
</template>

<script setup lang="ts">
import PrivateBookingList from '@/pages/sijiaoyuyue/list.vue'
</script>
```

---

## 🔍 实现细节

### 组件结构

```
src/pages/sijiaoyuyue/list.vue
├── 步骤指示器 (Stepper)
├── 进度跟踪器 (ProgressIndicator)
├── 步骤内容区域
│   ├── 步骤1: 教练选择 (CoachRecommend)
│   ├── 步骤2: 目标设定 (GoalSelector)
│   ├── 步骤3: 时间安排 (SchedulePlanner)
│   └── 步骤4: 确认支付 (BookingSummary)
└── 成功反馈弹窗 (SuccessModal)
```

### 核心逻辑

#### 多步骤流程管理

```typescript
const steps = [
  {
    label: '选择教练',
    description: '匹配擅长领域',
    validation: () => !!selectedCoach.value,
    errorMessage: '请先选择一位教练'
  },
  // ... 其他步骤配置
]

const currentStep = ref(1)

async function goToStep(step: number) {
  // 步骤验证和切换逻辑
  if (step > currentStep.value) {
    const currentStepConfig = steps[currentStep.value]
    if (currentStepConfig.validation && !currentStepConfig.validation()) {
      ElMessage.warning(currentStepConfig.errorMessage)
      return
    }
  }

  // 动画切换
  await stepTransition(currentStep.value - 1, step - 1, stepElements, targetElement)
  currentStep.value = step
}
```

#### 智能教练推荐

```typescript
// 基于用户历史的推荐算法
const { coachesWithReasons } = useCoachRecommend(allCoaches, {
  keyword: coachFilters.keyword,
  skill: coachFilters.skill,
  price: coachFilters.price,
  userHistory: userBookingHistory,
  currentGoals: selectedGoals.value,
  userPreferences: {
    preferredGoals: goalOptions.slice(0, 2),
    budgetRange: [300, 800]
  }
})

coaches.value = coachesWithReasons.value.slice(0, 8)
```

#### 实时冲突检测

```typescript
// 预约时间冲突检测
const bookingConflict = useBookingConflict()

function buildSchedule() {
  return days.map(day => ({
    // ... 日期信息
    slots: timeSlots.map(slot => {
      const conflict = bookingConflict.hasConflict(day.iso, slot.time)
      const remaining = bookingConflict.resolveRemaining(day.iso, slot.time, 6)

      const status = restDay ? 'disabled' :
                    conflict ? 'conflict' :
                    remaining <= 1 ? 'low' : 'available'

      return {
        time: slot.time,
        period: slot.period,
        status,
        statusLabel: getStatusLabel(status),
        remaining,
        conflictReasons: conflict ? bookingConflict.conflictDetails(day.iso, slot.time) : undefined
      }
    })
  }))
}
```

#### 动态价格计算

```typescript
// 使用定价引擎计算最终价格
const { context: pricingContext, priceBreakdown, updateContext } = usePricingEngine()

// 监听数据变化，更新价格
watch([selectedCoach, selectedPackage, selectedGoals], () => {
  updateContext({
    coach: selectedCoach.value,
    package: selectedPackage.value,
    goals: selectedGoals.value
  })
})

const totalPrice = computed(() => priceBreakdown.value.finalPrice)
```

#### 进度跟踪

```typescript
// 计算整体完成进度
const completionProgress = computed(() => {
  const steps = [
    !!selectedCoach.value,        // 步骤1
    !!selectedPackage.value,      // 步骤2
    !!selectedSlot.value,         // 步骤3
    agreement.value && !!contact.value && !!phone.value // 步骤4
  ]

  const completedSteps = steps.filter(Boolean).length
  return Math.round((completedSteps / steps.length) * 100)
})
```

### 数据流管理

#### 状态管理

```typescript
// 响应式状态
const selectedCoach = ref<Jianshenjiaolian>()
const selectedGoals = ref<string[]>(['增肌力量'])
const selectedPackage = ref<PackageOption>(packageOptions[1])
const selectedSlot = ref<SelectedSlot | null>(null)
const paymentMethod = ref('online')
const agreement = ref(false)

// 从store获取联系信息
const { contact, phone, remark } = storeToRefs(bookingStore)
```

#### 数据提交

```typescript
async function submitBooking() {
  if (!selectedCoach.value || !selectedSlot.value) {
    ElMessage.warning('请完成前序步骤')
    return
  }

  // 表单验证
  try {
    await summaryRef.value?.validate()
  } catch (error) {
    ElMessage.warning('请完善表单信息')
    return
  }

  // 构建提交数据
  const payload: Partial<Sijiaoyuyue> = {
    jiaoliangonghao: selectedCoach.value.jiaoliangonghao,
    jiaolianxingming: selectedCoach.value.jiaolianxingming,
    sijiaojiage: totalPrice.value,
    yuyueshijian: `${selectedSlot.value.date} ${selectedSlot.value.time}`,
    yonghuxingming: contact.value,
    shoujihaoma: phone.value,
    beizhu: `${goalSummary.value} · ${selectedPackage.value.label}`,
    ispay: paymentMethod.value === 'online' ? '待支付' : '线下支付'
  }

  await privateService.create(payload)
}
```

### 性能优化

#### 组件懒加载

```typescript
// 动态导入子组件
const { CoachRecommend, GoalSelector, SchedulePlanner, BookingSummary } = await import('@/components/booking')
```

#### 数据缓存

```typescript
// 缓存教练列表和时间表数据
const coaches = ref<Jianshenjiaolian[]>([])
const schedule = computed(() => buildSchedule())
```

#### 防抖处理

```typescript
// 搜索和筛选的防抖处理
const debouncedSearch = useDebounceFn(searchCoaches, 300)
```

---

## 🧪 测试说明

### 单元测试

```typescript
// PrivateBookingList.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import PrivateBookingList from '../list.vue'

describe('PrivateBookingList', () => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/sijiaoyuyue', component: PrivateBookingList }]
  })

  it('should render stepper component', async () => {
    const wrapper = mount(PrivateBookingList, {
      global: { plugins: [router] }
    })

    expect(wrapper.findComponent({ name: 'Stepper' }).exists()).toBe(true)
  })

  it('should show progress indicator', () => {
    const wrapper = mount(PrivateBookingList)
    expect(wrapper.find('.progress-indicator').exists()).toBe(true)
  })

  it('should validate step transitions', async () => {
    const wrapper = mount(PrivateBookingList)
    const vm = wrapper.vm as any

    // 尝试跳过步骤应该失败
    await vm.goToStep(2)
    expect(vm.currentStep).toBe(1) // 仍然在第一步
  })
})
```

### 集成测试

```typescript
// PrivateBookingList.integration.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import PrivateBookingList from '../list.vue'
import { createPinia } from 'pinia'

describe('PrivateBookingList Integration', () => {
  it('should handle coach selection flow', async () => {
    const app = createApp(PrivateBookingList)
    app.use(createPinia())

    const wrapper = mount(PrivateBookingList, {
      global: { plugins: [app] }
    })

    // 模拟教练选择
    const coachRecommend = wrapper.findComponent({ name: 'CoachRecommend' })
    await coachRecommend.vm.$emit('select', mockCoach)

    // 验证状态更新
    expect(wrapper.vm.selectedCoach).toEqual(mockCoach)
    expect(wrapper.vm.currentStep).toBe(2)
  })

  it('should calculate price correctly', async () => {
    const wrapper = mount(PrivateBookingList)

    // 设置教练和套餐
    await wrapper.setData({
      selectedCoach: mockCoach,
      selectedPackage: mockPackage
    })

    // 验证价格计算
    expect(wrapper.vm.totalPrice).toBeGreaterThan(0)
  })
})
```

### E2E测试

```typescript
// private-booking.e2e.spec.ts
import { test, expect } from '@playwright/test'

test('complete private booking flow', async ({ page }) => {
  await page.goto('/sijiaoyuyue')

  // 步骤1: 选择教练
  await page.click('.coach-item:first-child .select-button')
  await page.click('button:has-text("下一步")')

  // 步骤2: 选择目标和套餐
  await page.click('.goal-option:has-text("增肌力量")')
  await page.click('.package-option:first-child')
  await page.click('button:has-text("下一步")')

  // 步骤3: 选择时间
  await page.click('.time-slot.available:first-child')
  await page.click('button:has-text("下一步")')

  // 步骤4: 确认预约
  await page.fill('input[name="contact"]', '测试用户')
  await page.fill('input[name="phone"]', '13800138000')
  await page.click('input[name="agreement"]')
  await page.click('button:has-text("提交预约")')

  // 验证预约成功
  await expect(page.locator('.private-success-card')).toBeVisible()
})
```

---

## 📚 相关文档

### 内部文档

- [教练推荐算法](../technical/frontend/composables/USECOACHRECOMMEND.md)
- [预约冲突检测](../technical/frontend/composables/USEBOOKINGCONFLICT.md)
- [定价引擎](../technical/frontend/composables/USEPRICINGENGINE.md)
- [步骤切换动画](../technical/frontend/composables/USESTEPTRANSITION.md)
- [CoachRecommend组件](../technical/frontend/components/COACHRECOMMEND.md)
- [SchedulePlanner组件](../technical/frontend/components/SCHEDULEPLANNER.md)
- [BookingSummary组件](../technical/frontend/components/BOOKINGSUMMARY.md)

### 外部资源

- [Vue 3 组合式API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
- [Pinia状态管理](https://pinia.vuejs.org/)
- [Vue Router导航守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html)

---

## 🔄 更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|----------|--------|
| 2025-11-17 | v1.0.0 | 初始版本，记录私教预约列表页面技术文档 | 文档工程团队 |
