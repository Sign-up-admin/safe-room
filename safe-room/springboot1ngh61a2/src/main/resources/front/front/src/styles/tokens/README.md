# Design Token System

## 概述

本Design Token系统为前端项目提供了一套完整的视觉设计规范和开发工具，包括颜色、字体、间距、边框、阴影和动画等所有视觉元素的标准化定义。

## 文件结构

```
tokens/
├── _index.scss          # 主入口文件
├── _colors.scss         # 颜色系统
├── _typography.scss     # 字体系统
├── _spacing.scss        # 间距系统
├── _borders.scss        # 边框和圆角
├── _shadows.scss        # 阴影系统
├── _animations.scss     # 动画系统
└── README.md           # 文档
```

## 设计原则

### 1. 一致性 (Consistency)

- 统一的视觉语言
- 标准化的组件样式
- 跨平台一致的表现

### 2. 可扩展性 (Scalability)

- 模块化的token组织
- 易于添加新的设计元素
- 支持主题切换

### 3. 可维护性 (Maintainability)

- 集中化的设计定义
- 向后兼容的迁移策略
- 清晰的文档和使用指南

### 4. 无障碍性 (Accessibility)

- 支持高对比度模式
- 考虑色盲用户
- 支持减少动画偏好

## 颜色系统 (Colors)

### 基础颜色

```scss
$color-black: #000000;
$color-white: #ffffff;
$color-transparent: transparent;
```

### 品牌颜色

```scss
$color-primary-yellow: #fdd835; // 主品牌色
$color-primary-yellow-soft: rgba(253, 216, 53, 0.2); // 柔和版本
$color-primary-yellow-glow: rgba(253, 216, 53, 0.35); // 发光效果
```

### 功能颜色

```scss
$color-success: #4caf50; // 成功状态
$color-warning: #ff9800; // 警告状态
$color-error: #f44336; // 错误状态
$color-info: #2196f3; // 信息状态
```

### 使用方式

```scss
// SCSS变量
.my-element {
  color: $color-primary-yellow;
  background: $color-bg-card;
}

// CSS自定义属性
.my-element {
  color: var(--color-primary);
  background: var(--color-bg-card);
}
```

## 字体系统 (Typography)

### 字体族

```scss
$font-family-primary: 'Montserrat', 'Segoe UI', 'PingFang SC', sans-serif;
$font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 字体大小比例

基于8px网格系统的字体大小比例：

```scss
$font-size-xs: 0.75rem; // 12px
$font-size-sm: 0.875rem; // 14px
$font-size-base: 1rem; // 16px (基准)
$font-size-lg: 1.125rem; // 18px
$font-size-xl: 1.25rem; // 20px
// ... 更多尺寸
```

### 使用方式

```scss
// 直接使用变量
.heading {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
}

// 使用混合宏
.page-title {
  @include typography('h1');
}

.body-text {
  @include typography('body');
}
```

## 间距系统 (Spacing)

### 间距比例

基于4px的基础单位，创建8px网格：

```scss
$spacing-4: 0.25rem; // 4px
$spacing-8: 0.5rem; // 8px
$spacing-16: 1rem; // 16px
$spacing-24: 1.5rem; // 24px
$spacing-32: 2rem; // 32px
```

### 使用方式

```scss
// 工具类
.my-element {
  @include padding(16); // padding: 1rem
  @include margin-top(8); // margin-top: 0.5rem
  @include gap(12); // gap: 0.75rem
}

// 快捷工具类
.card {
  @include p-16; // padding: var(--spacing-16)
  @include m-8; // margin: var(--spacing-8)
}
```

## 阴影系统 (Shadows)

### 阴影等级

```scss
$shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### 特殊效果阴影

```scss
$shadow-glow-yellow: 0 0 20px rgba(253, 216, 53, 0.4);
$shadow-card: $shadow-md;
$shadow-modal: $shadow-xl;
```

## 动画系统 (Animations)

### 持续时间

```scss
$duration-fast: 150ms;
$duration-normal: 250ms;
$duration-slow: 350ms;
```

### 缓动函数

```scss
$easing-out: cubic-bezier(0, 0, 0.2, 1);
$easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
$easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 使用方式

```scss
// 基础过渡
.button {
  @include transition(all, normal, out);
}

// 悬停效果
.card {
  @include hover-lift(1.02, fast);
  @include hover-glow(var(--color-primary), 0.3);
}

// 动画类
.loading-spinner {
  @include animate(spin, slow, linear);
}
```

## 主题系统

### 支持的主题

1. **默认主题 (Dark)**: 深色背景，亮色文字
2. **浅色主题 (Light)**: 浅色背景，深色文字
3. **蓝色主题 (Blue)**: Twitter风格的蓝色主题

### 主题切换

```html
<!-- 切换到浅色主题 -->
<html data-theme="light">
  <!-- 切换到蓝色主题 -->
  <html data-theme="blue"></html>
</html>
```

### 自定义主题

```scss
[data-theme='custom'] {
  --color-primary: #your-color;
  --color-bg-deep: #your-bg;
  // ... 其他变量
}
```

## 使用指南

### 1. 导入系统

```scss
// 导入完整系统
@import '@/styles/design-tokens';

// 或只导入需要的部分
@import '@/styles/tokens/colors';
@import '@/styles/tokens/typography';
```

### 2. 在组件中使用

```vue
<template>
  <div class="my-component">
    <h1 class="text-primary font-bold">标题</h1>
    <p class="text-secondary">描述文本</p>
  </div>
</template>

<style scoped lang="scss">
.my-component {
  @include padding(16);
  @include shadow(card);
  @include border-radius(lg);
  @include transition(all, normal);

  &:hover {
    @include hover-lift();
  }
}
</style>
```

### 3. 响应式设计

```scss
.responsive-element {
  @include spacing-responsive(padding, 8, 16, 24);
  @include typography-responsive(font-size, sm, base, lg);
}
```

## 工具类

系统提供了丰富的CSS工具类：

### 间距工具类

```html
<div class="p-16">内边距16px</div>
<div class="m-8">外边距8px</div>
<div class="px-12">左右内边距12px</div>
<div class="py-20">上下内边距20px</div>
```

### 颜色工具类

```html
<p class="text-primary">主要文字</p>
<p class="text-secondary">次要文字</p>
<div class="bg-card">卡片背景</div>
```

### 布局工具类

```html
<div class="d-flex justify-center items-center">居中布局</div>
<div class="w-full h-auto">全宽自适应高度</div>
```

### 动画工具类

```html
<div class="animate-fade-in">淡入动画</div>
<button class="hover-lift">悬停上升</button>
```

## 最佳实践

### 1. 优先使用设计令牌

```scss
// ✅ 推荐
.my-component {
  color: var(--color-text-primary);
  padding: var(--spacing-16);
}

// ❌ 避免
.my-component {
  color: #f7fbea;
  padding: 16px;
}
```

### 2. 使用语义化的工具类

```scss
// ✅ 推荐
.card {
  @include shadow(card);
  @include border-radius(lg);
}

// ❌ 避免直接使用值
.card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
}
```

### 3. 保持一致性

- 在类似组件中使用相同的间距
- 使用统一的颜色语义
- 遵循动画时间规范

## 迁移指南

### 从旧系统迁移

1. 更新导入语句：

   ```scss
   // 旧的
   @import '@/styles/design-tokens';

   // 新的 (保持兼容)
   @import '@/styles/design-tokens';
   ```

2. 逐步替换硬编码值：

   ```scss
   // 旧的
   .element {
     color: #f7fbea;
   }

   // 新的
   .element {
     color: var(--color-text-primary);
   }
   ```

## 维护和更新

### 添加新令牌

1. 在相应文件中添加新变量
2. 更新CSS自定义属性
3. 添加相应的工具类
4. 更新文档

### 主题扩展

1. 在`_colors.scss`中添加主题变量
2. 在`:root`后添加主题选择器
3. 测试主题切换效果

## 相关链接

- [设计系统概览](../DESIGN_SYSTEM_OVERVIEW.md)
- [组件开发指南](../components/README.md)
- [主题定制指南](./themes.md)
