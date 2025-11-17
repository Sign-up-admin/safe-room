---
title: DESIGN SYSTEM DOCUMENTATION
version: v1.0.0
last_updated: 2025-11-17
status: active
category: technical
tags: [design-system, visual-guidelines, interaction-patterns, component-library]
---

# 🎨 健身房管理系统设计系统文档

> **版本**：v1.0.0
> **更新日期**：2025-11-17
> **适用范围**：前端设计系统、组件库、视觉规范
> **状态**：active

---

## 📋 目录

- [概述](#概述)
- [设计原则](#设计原则)
- [视觉语言](#视觉语言)
- [色彩系统](#色彩系统)
- [字体系统](#字体系统)
- [组件设计规范](#组件设计规范)
- [动效规范](#动效规范)
- [响应式设计](#响应式设计)
- [无障碍设计](#无障碍设计)
- [使用指南](#使用指南)

---

## 📖 概述

### 目的

建立统一的视觉设计语言，确保所有页面和组件保持一致的品牌体验，提升用户认知效率和操作舒适度。

### 范围

- 色彩系统和视觉层次
- 字体规范和排版系统
- 组件设计模式和交互规范
- 动效语言和过渡效果
- 响应式布局和断点系统
- 无障碍设计原则

### 设计理念

**科技 · 专业 · 沉浸 · 高效**

- **科技感**：黑金配色 + 霓虹效果 + 玻璃拟物
- **专业性**：清晰的信息层次 + 规范的组件设计
- **沉浸式**：流畅动效 + 连续的视觉体验
- **高效性**：统一的交互模式 + 直观的操作反馈

---

## 🎯 设计原则

### 一致性原则

- **视觉一致**：统一的色彩、字体、图标、间距
- **交互一致**：标准化的组件行为和反馈模式
- **体验一致**：跨设备、跨页面的连续性体验

### 层次性原则

- **信息层次**：通过大小、颜色、间距建立内容优先级
- **视觉层次**：引导用户注意力，突出重要操作
- **功能层次**：清晰的功能分组和操作流程

### 可用性原则

- **直观操作**：减少认知负荷，操作结果可预测
- **反馈及时**：所有交互都有明确的状态反馈
- **容错友好**：引导用户避免错误，提供纠错机制

### 性能原则

- **加载高效**：优化资源加载，减少等待时间
- **动效流畅**：60FPS的流畅体验，避免性能浪费
- **响应快速**：即时反馈，提升操作感知性能

---

## 🌈 视觉语言

### 整体风格

- **科技黑金**：深黑背景 + 科技黄主色 + 金色点缀
- **玻璃拟物**：半透明背景 + 模糊效果 + 微妙阴影
- **霓虹边缘**：发光描边 + 渐变效果 + 动态光晕
- **数据驱动**：图表可视化 + 数字展示 + 状态指示

### 关键元素

#### 卡片设计
```css
/* 基础卡片样式 */
.card {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(253, 216, 53, 0.1);
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
}

/* 悬停效果 */
.card:hover {
  border-color: rgba(253, 216, 53, 0.3);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
  transform: translateY(-4px);
}
```

#### 按钮系统
```css
/* 主按钮 */
.btn-primary {
  background: linear-gradient(135deg, #fdd835 0%, #ffb300 100%);
  color: #0a0a0a;
  border-radius: 12px;
  font-weight: 600;
}

/* 次按钮 */
.btn-secondary {
  background: rgba(253, 216, 53, 0.1);
  border: 1px solid rgba(253, 216, 53, 0.3);
  color: #fdd835;
}
```

---

## 🎨 色彩系统

### 基础色彩

| 色彩 | 十六进制 | RGBA | 用途 | CSS变量 |
|------|----------|------|------|---------|
| 科技黄 | `#FDD835` | `rgba(253, 216, 53, 1)` | 主色、强调、CTA | `--color-primary` |
| 深黑 | `#0A0A0A` | `rgba(10, 10, 10, 1)` | 主要背景 | `--color-bg-primary` |
| 科技灰 | `#1A1A1A` | `rgba(26, 26, 26, 1)` | 卡片背景、次级背景 | `--color-bg-secondary` |
| 冷灰 | `#9EA1A6` | `rgba(158, 161, 166, 1)` | 辅助文字、分割线 | `--color-text-secondary` |
| 暖灰 | `#BDBDBD` | `rgba(189, 189, 189, 1)` | 正文文字 | `--color-text-primary` |
| 浅白 | `#FFFFFF` | `rgba(255, 255, 255, 1)` | 高亮文字、图标 | `--color-text-accent` |

### 功能色彩

| 状态 | 色彩 | 用途 |
|------|------|------|
| 成功 | `#4CAF50` | 操作成功、确认状态 |
| 警告 | `#FF9800` | 需要注意、提醒信息 |
| 错误 | `#F44336` | 操作失败、错误状态 |
| 信息 | `#2196F3` | 一般信息、链接 |

### 透明度系统

| 透明度 | 值 | 用途 |
|--------|----|------|
| 高透明 | `0.9-1.0` | 主要文字、重要元素 |
| 中透明 | `0.6-0.8` | 次要文字、图标 |
| 低透明 | `0.3-0.5` | 装饰元素、分割线 |
| 微透明 | `0.1-0.2` | 背景叠加、微妙效果 |

---

## 📝 字体系统

### 字体族

```css
/* 主要字体 */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* 等宽字体（代码） */
font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
```

### 字体大小

| 级别 | 大小(px) | 行高 | 用途 | CSS类 |
|------|----------|------|------|-------|
| Display | 48 | 1.2 | 页面标题 | `.text-display` |
| H1 | 36 | 1.3 | 主要标题 | `.text-h1` |
| H2 | 28 | 1.4 | 副标题 | `.text-h2` |
| H3 | 24 | 1.4 | 区块标题 | `.text-h3` |
| H4 | 20 | 1.5 | 卡片标题 | `.text-h4` |
| Body Large | 16 | 1.6 | 正文大 | `.text-body-lg` |
| Body | 14 | 1.6 | 正文 | `.text-body` |
| Body Small | 12 | 1.5 | 辅助文字 | `.text-body-sm` |
| Caption | 11 | 1.4 | 注释 | `.text-caption` |

### 字体权重

| 权重 | 值 | 用途 |
|------|----|------|
| Light | 300 | 大标题、装饰性文字 |
| Regular | 400 | 正文、普通按钮 |
| Medium | 500 | 强调文字、次标题 |
| SemiBold | 600 | 按钮文字、标签 |
| Bold | 700 | 重要标题、强调内容 |

---

## 🧩 组件设计规范

### 基础组件

#### 按钮 (Button)

```vue
<!-- 主按钮 -->
<TechButton type="primary" size="large">
  立即预约
</TechButton>

<!-- 次按钮 -->
<TechButton type="secondary" size="medium">
  查看详情
</TechButton>

<!-- 危险按钮 -->
<TechButton type="danger" size="small">
  取消预约
</TechButton>
```

**设计规范：**
- 圆角：12px
- 内边距：水平16px，垂直12px
- 文字居中，14px Medium
- Hover：发光增强8%，上浮2px
- Loading：显示旋转图标，禁用交互

#### 卡片 (Card)

```vue
<TechCard
  title="会员卡详情"
  :glow="true"
  :hover-lift="true"
>
  <template #content>
    <!-- 卡片内容 -->
  </template>
</TechCard>
```

**设计规范：**
- 圆角：18px
- 背景：半透明黑色 + 模糊
- 边框：微光描边
- 阴影：多层阴影系统
- 内边距：24px

#### 输入框 (Input)

```vue
<TechInput
  v-model="value"
  label="手机号"
  type="tel"
  :required="true"
  placeholder="请输入手机号"
/>
```

**设计规范：**
- 背景：深色半透明
- 边框：聚焦时科技黄
- 文字：浅白
- 占位符：灰色
- 错误状态：红色边框 + 提示文字

### 复合组件

#### 数据卡片 (StatsCard)

```vue
<StatsCard
  title="本月训练次数"
  :value="28"
  unit="次"
  :trend="{ value: 15, type: 'up' }"
  icon="fitness"
/>
```

#### 预约卡片 (BookingCard)

```vue
<BookingCard
  :booking="bookingData"
  :show-actions="true"
  @edit="handleEdit"
  @cancel="handleCancel"
/>
```

#### 图表容器 (ChartContainer)

```vue
<ChartContainer
  title="训练趋势"
  :loading="false"
  :height="300"
>
  <ECharts :options="chartOptions" />
</ChartContainer>
```

---

## ✨ 动效规范

### 动效原则

- **目的性**：每个动效都有明确的目的
- **一致性**：统一的缓动曲线和时长
- **性能优先**：优先使用transform和opacity
- **适度原则**：增强而不干扰用户注意力

### 缓动曲线

```css
/* 标准缓动 */
--easing-standard: cubic-bezier(0.4, 0, 0.2, 1);

/* 进入动效 */
--easing-enter: cubic-bezier(0, 0, 0.2, 1);

/* 退出动效 */
--easing-exit: cubic-bezier(0.4, 0, 1, 1);

/* 强调动效 */
--easing-emphasis: cubic-bezier(0.4, 0, 0.6, 1);
```

### 时长系统

| 类型 | 时长(ms) | 用途 |
|------|----------|------|
| 快速 | 150-200 | 简单状态变化、悬停反馈 |
| 标准 | 250-300 | 页面切换、组件出现 |
| 慢速 | 350-500 | 复杂动效、重要反馈 |

### 常见动效模式

#### 悬停效果 (Hover Effects)

```css
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
  border-color: rgba(253, 216, 53, 0.3);
}
```

#### 页面过渡 (Page Transitions)

```css
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
```

#### 加载动画 (Loading Animations)

```css
.loading-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

---

## 📱 响应式设计

### 断点系统

| 设备 | 断点(px) | 容器宽度 | 列数 | 应用场景 |
|------|----------|----------|------|----------|
| Mobile | < 768 | 100% | 1 | 手机端 |
| Tablet | 768 - 1199 | 720px | 2 | 平板端 |
| Desktop | 1200 - 1599 | 1140px | 3-4 | 桌面端 |
| Large | >= 1600 | 1320px | 4-5 | 大屏幕 |

### 响应式策略

#### 布局响应

```css
/* 响应式网格 */
.grid-responsive {
  display: grid;
  gap: 24px;
}

@media (max-width: 767px) {
  .grid-responsive {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

#### 组件响应

```css
/* 响应式按钮 */
.btn-responsive {
  padding: 12px 16px;
  font-size: 14px;
}

@media (max-width: 767px) {
  .btn-responsive {
    padding: 14px 20px;
    font-size: 16px; /* 移动端增大点击区域 */
  }
}
```

#### 内容响应

```css
/* 响应式文字 */
.text-responsive {
  font-size: clamp(14px, 2vw, 16px);
  line-height: 1.6;
}

/* 响应式图片 */
.img-responsive {
  width: 100%;
  height: auto;
  object-fit: cover;
}
```

---

## ♿ 无障碍设计

### 键盘导航

- **Tab顺序**：逻辑性的tab顺序
- **焦点指示**：清晰的焦点样式
- **快捷键**：常用操作的键盘快捷键

```css
/* 焦点样式 */
.focus-visible:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 屏幕阅读器

- **ARIA标签**：完整的ARIA属性
- **语义化HTML**：正确的标签使用
- **隐藏装饰性内容**：aria-hidden="true"

```html
<!-- 有意义的按钮 -->
<button aria-label="预约课程">
  <Icon name="calendar" aria-hidden="true" />
  预约
</button>

<!-- 状态区域 -->
<div aria-live="polite" aria-atomic="true">
  预约成功！
</div>
```

### 色彩对比

- **文字对比度**：至少4.5:1的对比度
- **非文字对比度**：至少3:1的对比度
- **颜色独立**：不依赖颜色传达信息

### 触摸友好

- **最小点击区域**：44px × 44px
- **触摸反馈**：明显的触摸反馈
- **手势支持**：支持原生手势

---

## 📚 使用指南

### 设计资源

- **Figma文件**：[设计系统组件库](https://figma.com/...)
- **图标库**：[自定义图标库](https://iconify.design/...)
- **字体文件**：系统字体栈
- **色彩工具**：[Adobe Color](https://color.adobe.com/)

### 开发资源

- **CSS变量**：`src/styles/variables.css`
- **组件库**：`src/components/tech/`
- **工具函数**：`src/utils/design-system.ts`
- **组合式API**：`src/composables/useDesignSystem.ts`

### 维护流程

1. **设计更新**：设计师在Figma中更新，同步到开发
2. **代码实现**：开发人员实现新的设计规范
3. **文档更新**：及时更新本文档和组件文档
4. **评审确认**：跨部门评审确保一致性

### 版本控制

| 版本 | 日期 | 更新内容 | 更新人 |
|------|------|----------|--------|
| v1.0.0 | 2025-11-17 | 初始版本，建立完整设计系统 | 设计工程团队 |

---

*本文档为设计系统规范文件，应与实际组件库保持同步更新。如有设计问题，请联系设计团队。*
