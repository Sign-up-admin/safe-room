---
title: WEB COMPONENTS TEMPLATE
version: v1.0.0
last_updated: 2025-11-17
status: template
category: technical
tags: [web-components, template, framework-agnostic]
---

# 🌐 Web Components 文档模板

> **模板版本**：v1.0.0
> **更新日期**：2025-11-17
> **适用范围**：Web Components组件开发
> **状态**：template

---

## 📋 模板说明

本模板用于标准化Web Components组件的文档格式，确保在Vue、React、Angular等框架中保持一致的API和行为。

---

## 🎯 组件概述

### 基本信息
- **组件名称**: `TechStepper`
- **标签名**: `<custom-tech-stepper>`
- **版本**: 1.0.0
- **状态**: active

### 功能描述
{{简要描述组件的核心功能}}

### 使用场景
{{描述组件的典型使用场景}}

---

## 🔧 API 参考

### 属性 (Attributes/Properties)

| 属性名 | 类型 | 默认值 | 必需 | 描述 |
|--------|------|--------|------|------|
| `property-name` | `String` | `default-value` | 是/否 | 属性描述 |

### 事件 (Events)

| 事件名 | 描述 | 事件详情 |
|--------|------|----------|
| `event-name` | 事件触发条件 | `{ detail: { data } }` |

### 方法 (Methods)

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `methodName(param)` | `param: Type` | `ReturnType` | 方法功能描述 |

### 插槽 (Slots)

| 插槽名 | 描述 |
|--------|------|
| `default` | 默认内容插槽 |
| `named-slot` | 具名插槽 |

---

## 🚀 使用示例

### 基本用法
```html
<!-- HTML中使用 -->
<custom-tech-stepper property-name="value">
  <div slot="named-slot">内容</div>
</custom-tech-stepper>
```

### Vue集成
```vue
<template>
  <custom-tech-stepper
    ref="componentRef"
    property-name="value"
    @event-name="handleEvent"
  >
    <div slot="named-slot">Vue内容</div>
  </custom-tech-stepper>
</template>

<script setup lang="ts">
import 'custom-tech-stepper' from '@/components/web-components/TechStepper.js'

const componentRef = ref()

const handleEvent = (event: CustomEvent) => {
  console.log('Event received:', event.detail)
}
</script>
```

### React集成
```tsx
import React, { useRef } from 'react'
import 'custom-tech-stepper' from '@/components/web-components/TechStepper.js'

const MyComponent: React.FC = () => {
  const componentRef = useRef<HTMLElement>(null)

  const handleEvent = (event: CustomEvent) => {
    console.log('Event received:', event.detail)
  }

  return (
    <custom-tech-stepper
      ref={componentRef}
      property-name="value"
      onEvent-name={handleEvent}
    >
      <div slot="named-slot">React内容</div>
    </custom-tech-stepper>
  )
}
```

### Angular集成
```typescript
import { Component } from '@angular/core'

@Component({
  selector: 'app-my-component',
  template: `
    <custom-tech-stepper
      #componentRef
      [property-name]="'value'"
      (event-name)="handleEvent($event)"
    >
      <div slot="named-slot">Angular内容</div>
    </custom-tech-stepper>
  `
})
export class MyComponent {
  componentRef!: HTMLElement

  handleEvent(event: CustomEvent) {
    console.log('Event received:', event.detail)
  }
}
```

---

## 🎨 样式定制

### CSS变量
```css
custom-tech-stepper {
  /* 自定义样式变量 */
  --primary-color: #your-color;
  --font-size: 14px;
  --border-radius: 4px;
}
```

### 主题适配
```css
/* 暗色主题 */
.dark-theme custom-tech-stepper {
  --primary-color: #dark-color;
}

/* 浅色主题 */
.light-theme custom-tech-stepper {
  --primary-color: #light-color;
}
```

---

## 🔗 兼容性

### 框架兼容性

| 框架 | 版本要求 | 集成方式 | 支持度 |
|------|----------|----------|--------|
| Vue 3 | >= 3.0.0 | 原生支持 | ⭐⭐⭐⭐⭐ |
| React | >= 16.8.0 | 事件代理 | ⭐⭐⭐⭐⭐ |
| Angular | >= 12.0.0 | 模板语法 | ⭐⭐⭐⭐⭐ |
| 原生HTML | 所有现代浏览器 | 直接使用 | ⭐⭐⭐⭐⭐ |

### 浏览器兼容性

| 浏览器 | 最低版本 | 支持特性 |
|--------|----------|----------|
| Chrome | 67+ | Shadow DOM, Custom Elements |
| Firefox | 63+ | Shadow DOM, Custom Elements |
| Safari | 12.1+ | Shadow DOM, Custom Elements |
| Edge | 79+ | Shadow DOM, Custom Elements |

---

## 🐛 已知问题

### 问题1: 描述
**状态**: 待修复 / 已修复
**影响**: 影响范围描述
**解决方案**: 临时解决方案或修复说明

### 问题2: 描述
**状态**: 待修复 / 已修复
**影响**: 影响范围描述
**解决方案**: 临时解决方案或修复说明

---

## 📚 相关文档

- [Web Components集成指南](../technical/frontend/WEB_COMPONENTS_INTEGRATION.md)
- [多框架兼容性指南](../technical/frontend/MULTI_FRAMEWORK_GUIDE.md)
- [组件开发规范](../development/frontend/guides/COMPONENT_DEVELOPMENT_GUIDE.md)

---

## 🔄 更新记录

| 版本 | 日期 | 更新内容 | 更新人 |
|------|------|----------|--------|
| 1.0.0 | 2025-11-17 | 初始版本 | - |

---

*本模板基于Web Components标准设计，确保跨框架一致性。如有特殊需求请联系架构组。*
