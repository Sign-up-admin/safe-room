---
title: ANIMATION LIBRARY REQUIREMENTS
version: v1.0.0
last_updated: 2025-11-16
status: active
category: requirements
---# 动效库需求文档（Animation Library v1.0）

> 版本：v1.0
> 更新日期：2025-11-16
> 适用范围：`springboot1ngh61a2/src/main/resources/front/front`

---

## 1. 文档目的

建立统一的动效语言体系，为全站提供一致、高性能、可复用的动画效果，确保在不同终端上的优质体验。

---

## 2. 设计原则

### 2.1 核心理念

| 原则 | 说明 |
| --- | --- |
| **性能优先** | 动效不得影响核心功能性能 |
| **一致性** | 全站使用统一的动效语言 |
| **渐进增强** | 高性能设备全动效，低性能设备降级 |
| **可访问性** | 支持用户的动效偏好设置 |

### 2.2 动效分级

| 等级 | 复杂度 | 适用场景 | 性能要求 |
| --- | --- | --- | --- |
| L1（基础） | 简单过渡 | 按钮反馈、状态变化 | ≥30fps 所有设备 |
| L2（增强） | 中等动效 | 页面过渡、悬停效果 | ≥45fps Pad+、≥30fps Mobile |
| L3（沉浸） | 复杂动画 | Hero 区域、数据可视化 | ≥60fps PC、降级处理 |

---

## 3. 动效类型体系

### 3.1 页面级动效

#### 3.1.1 页面进入/离开

```typescript
// 组合式 API
export const usePageTransition = (direction: 'forward' | 'backward' = 'forward') => {
  const enterAnimation = () => {
    gsap.fromTo('.page-content',
      { opacity: 0, y: direction === 'forward' ? 20 : -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
  };

  const leaveAnimation = () => {
    return gsap.to('.page-content', {
      opacity: 0,
      y: direction === 'forward' ? -20 : 20,
      duration: 0.4,
      ease: 'power2.in'
    });
  };

  return { enterAnimation, leaveAnimation };
};
```

**使用场景**：路由切换、模态框显示
**性能策略**：PC 全动效，Mobile 简化透明度过渡

#### 3.1.2 内容加载

```typescript
export const useContentReveal = () => {
  const revealElements = (selector: string) => {
    gsap.set(selector, { opacity: 0, y: 30 });

    ScrollTrigger.batch(selector, {
      onEnter: (elements) => {
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out'
        });
      },
      start: 'top 80%'
    });
  };

  return { revealElements };
};
```

**使用场景**：列表项、卡片网格
**性能策略**：使用 IntersectionObserver，避免大量元素同时动画

### 3.2 组件级动效

#### 3.2.1 Hover 效果

```scss
@mixin hover-glow($scale: 1.02, $glow: 8px, $duration: 0.3s) {
  transition: all $duration ease;

  &:hover {
    transform: scale($scale);
    box-shadow: 0 0 $glow rgba(253, 216, 53, 0.3);
  }

  // 移动端禁用变换，仅保留阴影
  @media (hover: none) {
    &:hover {
      transform: none;
    }
  }
}
```

**使用场景**：卡片、按钮、链接
**性能策略**：使用 CSS transform，避免重排

#### 3.2.2 状态反馈

```typescript
export const useStateAnimation = () => {
  const successAnimation = (element: Element) => {
    const tl = gsap.timeline();
    tl.to(element, { scale: 1.1, duration: 0.2 })
      .to(element, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
    return tl;
  };

  const errorAnimation = (element: Element) => {
    gsap.to(element, {
      x: -10,
      yoyo: true,
      repeat: 3,
      duration: 0.1,
      ease: 'power2.inOut'
    });
  };

  return { successAnimation, errorAnimation };
};
```

**使用场景**：表单提交、操作反馈
**性能策略**：短时动效，及时清理

### 3.3 数据可视化动效

#### 3.3.1 图表动画

```typescript
export const useChartAnimation = () => {
  const animateBarChart = (chart: any) => {
    gsap.from(chart.data.datasets[0].data, {
      scaleY: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => chart.update()
    });
  };

  const animateLineChart = (chart: any) => {
    const path = chart.ctx.canvas.querySelector('path');
    if (path) {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.out'
      });
    }
  };

  return { animateBarChart, animateLineChart };
};
```

**使用场景**：统计图表、仪表盘
**性能策略**：Canvas 优化，减少重绘

### 3.4 加载状态动效

#### 3.4.1 骨架屏

```vue
<template>
  <div class="skeleton-card" v-if="loading">
    <div class="skeleton-image"></div>
    <div class="skeleton-text"></div>
    <div class="skeleton-text short"></div>
  </div>
</template>

<style scoped>
.skeleton-card {
  @include glass-card();
  padding: spacing(lg);
}

.skeleton-image,
.skeleton-text {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
```

**使用场景**：内容加载等待
**性能策略**：纯 CSS 实现，无 JavaScript

#### 3.4.2 粒子加载

```typescript
export const useParticleLoader = () => {
  const createParticles = (container: Element, count: number = 20) => {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      container.appendChild(particle);

      gsap.set(particle, {
        x: Math.random() * 100,
        y: Math.random() * 100,
        scale: Math.random() * 0.5 + 0.5
      });

      gsap.to(particle, {
        x: '+=20',
        y: '+=20',
        rotation: 360,
        duration: Math.random() * 2 + 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    }
  };

  return { createParticles };
};
```

**使用场景**：重要操作等待
**性能策略**：限制粒子数量，PC ≥50 个，Mobile ≤10 个

---

## 4. 动效配置系统

### 4.1 全局配置

```typescript
// src/composables/useAnimationConfig.ts
export const useAnimationConfig = () => {
  const config = reactive({
    // 用户偏好
    prefersReducedMotion: false,
    // 设备能力
    isLowPower: false,
    // 终端类型
    isMobile: false,

    // 动效参数
    durations: {
      fast: 0.2,
      normal: 0.4,
      slow: 0.8
    },
    easings: {
      default: 'power3.out',
      bounce: 'back.out(1.7)',
      smooth: 'power2.inOut'
    }
  });

  // 检测用户偏好
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    config.prefersReducedMotion = mediaQuery.matches;

    config.isMobile = window.innerWidth < 768;
    config.isLowPower = navigator.hardwareConcurrency <= 2;
  });

  return { config };
};
```

### 4.2 性能监控

```typescript
export const usePerformanceMonitor = () => {
  const fps = ref(60);
  const frameCount = ref(0);
  let lastTime = performance.now();

  const measureFPS = () => {
    const currentTime = performance.now();
    frameCount.value++;

    if (currentTime - lastTime >= 1000) {
      fps.value = Math.round((frameCount.value * 1000) / (currentTime - lastTime));
      frameCount.value = 0;
      lastTime = currentTime;
    }

    requestAnimationFrame(measureFPS);
  };

  onMounted(() => {
    requestAnimationFrame(measureFPS);
  });

  return { fps };
};
```

---

## 5. 终端适配策略

### 5.1 PC 端（≥1200px）

- **动效复杂度**：全功能，支持 L1/L2/L3
- **性能要求**：≥60fps，GPU 加速
- **特殊处理**：鼠标悬停、键盘交互

### 5.2 Pad 端（768-1199px）

- **动效复杂度**：L1/L2，简化 L3
- **性能要求**：≥45fps，减少粒子数量
- **特殊处理**：触控反馈，适配大屏幕

### 5.3 Mobile 端（<768px）

- **动效复杂度**：主要 L1，静态化 L2/L3
- **性能要求**：≥30fps，最小化计算
- **特殊处理**：触控优化，减少电量消耗

---

## 6. 使用指南

### 6.1 动效命名约定

```typescript
// 组合式函数命名
export const useHoverGlow = () => {};        // 悬停发光
export const usePageTransition = () => {};   // 页面过渡
export const useLoadingAnimation = () => {}; // 加载动画
export const useSuccessFeedback = () => {};  // 成功反馈

// 工具函数命名
export const animateElement = () => {};      // 元素动画
export const createParticleSystem = () => {}; // 创建粒子系统
```

### 6.2 组件集成示例

```vue
<template>
  <TechCard
    @mouseenter="handleHover"
    @mouseleave="handleLeave"
    :class="{ 'card--hovered': isHovered }"
  >
    <slot />
  </TechCard>
</template>

<script setup>
import { useHoverGlow } from '@/composables/useAnimationLibrary';

const { glowIn, glowOut } = useHoverGlow();
const isHovered = ref(false);

const handleHover = () => {
  isHovered.value = true;
  glowIn($el);
};

const handleLeave = () => {
  isHovered.value = false;
  glowOut($el);
};
</script>
```

---

## 7. 测试与验收

### 7.1 性能测试

| 动效类型 | PC 要求 | Pad 要求 | Mobile 要求 |
| --- | --- | --- | --- |
| 页面过渡 | ≥60fps | ≥45fps | ≥30fps |
| 悬停效果 | ≥60fps | ≥45fps | N/A（禁用） |
| 图表动画 | ≥60fps | ≥30fps | 静态 |
| 粒子效果 | ≥50fps | ≥30fps | ≤5 个粒子 |

### 7.2 可访问性测试

- [ ] 支持 `prefers-reduced-motion` 设置
- [ ] 动画时长 ≤5s，避免眩晕
- [ ] 提供动画暂停/停止控制
- [ ] 屏幕阅读器正确描述动效

### 7.3 跨浏览器测试

- [ ] Chrome/Edge：完整支持
- [ ] Firefox：GSAP 兼容性
- [ ] Safari：WebKit 优化
- [ ] Mobile Safari：性能优化

---

## 8. 实施路线图

### 8.1 第一阶段：核心动效库（已完成）

- ✅ 基础组合式 API
- ✅ Hover 效果系统
- ✅ 页面过渡动画

### 8.2 第二阶段：增强功能（进行中）

- 🔄 图表动画集成
- 🔄 粒子系统优化
- 🔄 性能监控体系

### 8.3 第三阶段：智能化（计划中）

- 📋 AI 动效生成
- 📋 用户偏好学习
- 📋 动效 A/B 测试

---

## 9. 维护与更新

### 9.1 版本管理

- 动效库单独维护版本号
- 重大更新需要兼容性测试
- 新动效需经过设计评审

### 9.2 性能监控

- 生产环境监控动效性能
- 根据用户设备调整动效复杂度
- 定期优化动画代码

---

> 动效是提升用户体验的重要手段，但性能永远是第一优先级。本文档将随项目发展持续更新，确保动效系统为用户带来价值而非负担。</contents>
</xai:function_call">...
