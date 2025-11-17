---
title: WEB COMPONENTS INTEGRATION
version: v1.0.0
last_updated: 2025-11-17
status: active
category: technical
tags: [web-components, integration, vue, react, angular, framework-agnostic]
---

# 🔗 Web Components集成指南

> **版本**：v1.0.0
> **更新日期**：2025-11-17
> **适用范围**：前端开发团队
> **状态**：active

---

## 📋 目录

- [概述](#概述)
- [Web Components基础](#web-components基础)
- [Vue集成](#vue集成)
- [React集成](#react集成)
- [Angular集成](#angular集成)
- [样式和主题](#样式和主题)
- [事件处理](#事件处理)
- [生命周期管理](#生命周期管理)
- [性能优化](#性能优化)
- [测试策略](#测试策略)
- [调试和开发工具](#调试和开发工具)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 📖 概述

### 为什么需要Web Components

Web Components是浏览器原生支持的组件化技术，提供以下优势：

- **框架无关**：一次开发，多框架使用
- **标准化**：基于浏览器原生API，无需额外依赖
- **封装性强**：Shadow DOM提供样式和行为隔离
- **可重用性**：组件可在任意项目中复用
- **性能优秀**：原生实现，无框架抽象开销

### 集成目标

本指南旨在帮助开发团队：

- ✅ **掌握Web Components开发技能**
- ✅ **实现Vue/React/Angular与Web Components的无缝集成**
- ✅ **建立统一的组件开发和使用规范**
- ✅ **优化跨框架组件的性能和用户体验**

### 适用场景

- **企业级应用**：需要同时支持多个前端框架
- **设计系统**：构建框架无关的组件库
- **微前端架构**：应用间的组件共享
- **第三方集成**：与外部系统的组件集成

---

## 🌟 Web Components基础

### 核心API

#### Custom Elements
```typescript
// 定义自定义元素
class MyElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <style>
        .container {
          padding: 1rem;
          border: 1px solid #ccc;
        }
      </style>
      <div class="container">
        <slot></slot>
      </div>
    `
  }
}

// 注册元素
customElements.define('my-element', MyElement)

// 使用元素
document.body.innerHTML = '<my-element>Hello World!</my-element>'
```

#### Shadow DOM
```typescript
class ShadowElement extends HTMLElement {
  private shadow: ShadowRoot

  constructor() {
    super()
    // 创建Shadow Root
    this.shadow = this.attachShadow({ mode: 'open' })

    // 添加样式和内容
    this.shadow.innerHTML = `
      <style>
        .shadow-content {
          color: blue;
          font-weight: bold;
        }
      </style>
      <div class="shadow-content">
        <slot></slot>
      </div>
    `
  }

  // Shadow DOM内部样式不会影响外部
  // 外部样式也不会影响Shadow DOM内部
}
```

#### HTML Templates
```typescript
// 定义模板
const template = document.createElement('template')
template.innerHTML = `
  <style>
    .template-content {
      background: lightblue;
      padding: 1rem;
    }
  </style>
  <div class="template-content">
    <slot name="header"></slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
`

// 使用模板
class TemplateElement extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.appendChild(template.content.cloneNode(true))
  }
}
```

### 属性和状态管理

#### 响应式属性
```typescript
class ReactiveElement extends HTMLElement {
  // 定义观察的属性
  static get observedAttributes() {
    return ['value', 'disabled', 'max-length']
  }

  private _value = ''
  private _disabled = false
  private _maxLength = 100

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  // 属性变化回调
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case 'value':
        this._value = newValue
        this.updateDisplay()
        break
      case 'disabled':
        this._disabled = newValue === 'true'
        this.updateDisabledState()
        break
      case 'max-length':
        this._maxLength = parseInt(newValue) || 100
        this.updateValidation()
        break
    }
  }

  // getter/setter
  get value() {
    return this._value
  }

  set value(newValue: string) {
    this._value = newValue
    this.setAttribute('value', newValue)
    this.updateDisplay()
  }

  get disabled() {
    return this._disabled
  }

  set disabled(newValue: boolean) {
    this._disabled = newValue
    this.setAttribute('disabled', newValue.toString())
    this.updateDisabledState()
  }
}
```

---

## 🟢 Vue集成

### 基本集成

#### 全局注册
```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 导入Web Components
import './components/web-components/index.js'

const app = createApp(App)
app.mount('#app')
```

#### 组件使用
```vue
<template>
  <div>
    <!-- 基本使用 -->
    <custom-button @click="handleClick">
      Vue按钮
    </custom-button>

    <!-- 属性绑定 -->
    <custom-input
      v-model="inputValue"
      :disabled="isDisabled"
      placeholder="请输入内容"
    />

    <!-- 事件监听 -->
    <custom-select
      :options="options"
      @change="handleSelectChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputValue = ref('')
const isDisabled = ref(false)
const options = ref(['选项1', '选项2', '选项3'])

const handleClick = () => {
  console.log('按钮被点击')
}

const handleSelectChange = (event: CustomEvent) => {
  console.log('选择改变:', event.detail)
}
</script>
```

### v-model支持

#### 实现双向绑定
```typescript
// Web Component实现
class CustomInput extends HTMLElement {
  private _value = ''

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.render()
    this.attachEventListeners()
  }

  get value() {
    return this._value
  }

  set value(newValue: string) {
    this._value = newValue
    this.updateInput()
    // 触发input事件，支持v-model
    this.dispatchEvent(new Event('input', { bubbles: true }))
  }

  private render() {
    this.shadowRoot!.innerHTML = `
      <input type="text" value="${this._value}" />
    `
  }

  private attachEventListeners() {
    const input = this.shadowRoot!.querySelector('input')
    input?.addEventListener('input', (e) => {
      this._value = (e.target as HTMLInputElement).value
      this.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }

  private updateInput() {
    const input = this.shadowRoot!.querySelector('input')
    if (input) {
      input.value = this._value
    }
  }
}

// Vue使用
const inputValue = ref('')
// v-model会自动处理input事件
```

### 生命周期集成

#### Vue生命周期与Web Components生命周期
```typescript
class VueCompatibleElement extends HTMLElement {
  private vueInstance: any = null

  connectedCallback() {
    // Web Component连接到DOM时
    this.initializeVueComponent()
  }

  disconnectedCallback() {
    // Web Component从DOM移除时
    this.destroyVueComponent()
  }

  private initializeVueComponent() {
    // 创建Vue组件实例
    // 这里可以集成Vue的组件系统
  }

  private destroyVueComponent() {
    if (this.vueInstance) {
      this.vueInstance.$destroy()
    }
  }
}
```

### 样式集成

#### CSS变量支持
```vue
<template>
  <custom-button class="primary-button">
    主要按钮
  </custom-button>
</template>

<style scoped>
.primary-button {
  --button-color: #007bff;
  --button-hover-color: #0056b3;
}
</style>
```

```typescript
// Web Component样式实现
class CustomButton extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.render()
  }

  private render() {
    this.shadowRoot!.innerHTML = `
      <style>
        button {
          background-color: var(--button-color, #6c757d);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          cursor: pointer;
        }

        button:hover {
          background-color: var(--button-hover-color, #5a6268);
        }
      </style>
      <button>
        <slot></slot>
      </button>
    `
  }
}
```

---

## 🔴 React集成

### 基本集成

#### 导入和使用
```tsx
import React, { useRef, useEffect } from 'react'
import './components/web-components/index.js'

const MyComponent: React.FC = () => {
  const buttonRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    if (button) {
      const handleClick = () => {
        console.log('Web Component按钮被点击')
      }

      button.addEventListener('custom-click', handleClick)
      return () => {
        button.removeEventListener('custom-click', handleClick)
      }
    }
  }, [])

  return (
    <div>
      <custom-button ref={buttonRef}>
        React按钮
      </custom-button>
    </div>
  )
}
```

### 属性和状态管理

#### useImperativeHandle集成
```tsx
import React, { forwardRef, useImperativeHandle, useRef } from 'react'

interface CustomInputHandle {
  focus: () => void
  getValue: () => string
  setValue: (value: string) => void
}

const CustomInput = forwardRef<CustomInputHandle>((props, ref) => {
  const inputRef = useRef<HTMLElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus()
    },
    getValue: () => {
      return (inputRef.current as any)?.value || ''
    },
    setValue: (value: string) => {
      if (inputRef.current) {
        (inputRef.current as any).value = value
      }
    }
  }))

  return (
    <custom-input ref={inputRef} {...props} />
  )
})

CustomInput.displayName = 'CustomInput'

// 使用示例
const ParentComponent: React.FC = () => {
  const inputRef = useRef<CustomInputHandle>(null)

  const handleFocus = () => {
    inputRef.current?.focus()
  }

  const handleGetValue = () => {
    console.log('当前值:', inputRef.current?.getValue())
  }

  return (
    <div>
      <CustomInput ref={inputRef} placeholder="输入内容" />
      <button onClick={handleFocus}>聚焦输入框</button>
      <button onClick={handleGetValue}>获取值</button>
    </div>
  )
}
```

### 事件处理优化

#### 自定义Hook
```tsx
import { useEffect, useRef } from 'react'

function useWebComponentEvent<T = any>(
  ref: React.RefObject<HTMLElement>,
  eventName: string,
  handler: (event: CustomEvent<T>) => void
) {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    const eventHandler = (event: Event) => {
      handler(event as CustomEvent<T>)
    }

    element.addEventListener(eventName, eventHandler)
    return () => {
      element.removeEventListener(eventName, eventHandler)
    }
  }, [ref, eventName, handler])
}

// 使用示例
const MyComponent: React.FC = () => {
  const buttonRef = useRef<HTMLElement>(null)

  useWebComponentEvent(buttonRef, 'custom-click', (event) => {
    console.log('收到事件:', event.detail)
  })

  return (
    <custom-button ref={buttonRef}>
      点击我
    </custom-button>
  )
}
```

### TypeScript类型支持

#### 类型定义
```tsx
// web-components.d.ts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'custom-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        variant?: 'primary' | 'secondary'
        size?: 'small' | 'medium' | 'large'
      }

      'custom-input': React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
      > & {
        label?: string
        error?: string
      }

      'custom-select': React.DetailedHTMLProps<
        React.SelectHTMLAttributes<HTMLSelectElement>,
        HTMLSelectElement
      > & {
        options?: string[]
        multiple?: boolean
      }
    }
  }
}

declare namespace React {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // 扩展HTML属性以支持自定义属性
  }
}

export {}
```

---

## 🔵 Angular集成

### 基本集成

#### 模块配置
```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { AppComponent } from './app.component'

// 导入Web Components
import './components/web-components/index.js'

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // 允许使用自定义元素
})
export class AppModule { }
```

#### 组件使用
```typescript
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core'

@Component({
  selector: 'app-my-component',
  template: `
    <custom-button
      #buttonElement
      (custom-click)="handleClick($event)">
      Angular按钮
    </custom-button>

    <custom-input
      #inputElement
      [value]="inputValue"
      (input)="onInputChange($event)">
    </custom-input>
  `
})
export class MyComponent implements AfterViewInit {
  @ViewChild('buttonElement', { static: true })
  buttonElement!: ElementRef<HTMLElement>

  @ViewChild('inputElement', { static: true })
  inputElement!: ElementRef<HTMLElement>

  inputValue = '初始值'

  ngAfterViewInit() {
    // 组件初始化后的额外配置
    this.setupEventListeners()
  }

  handleClick(event: CustomEvent) {
    console.log('Angular中处理点击事件:', event.detail)
  }

  onInputChange(event: Event) {
    const target = event.target as any
    this.inputValue = target.value
  }

  private setupEventListeners() {
    // 额外的原生事件监听器设置
    const button = this.buttonElement.nativeElement
    button.addEventListener('mouseenter', () => {
      console.log('鼠标进入按钮')
    })
  }
}
```

### 指令集成

#### 自定义指令
```typescript
import { Directive, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core'

@Directive({
  selector: '[webComponentBridge]'
})
export class WebComponentBridgeDirective implements OnInit, OnDestroy {
  @Input() componentConfig: any
  @Output() componentEvent = new EventEmitter<any>()

  private eventListeners: { [key: string]: (event: Event) => void } = {}

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.setupComponent()
    this.setupEventListeners()
  }

  ngOnDestroy() {
    this.removeEventListeners()
  }

  private setupComponent() {
    const element = this.elementRef.nativeElement as HTMLElement

    // 配置组件属性
    if (this.componentConfig) {
      Object.keys(this.componentConfig).forEach(key => {
        if (typeof this.componentConfig[key] === 'boolean') {
          if (this.componentConfig[key]) {
            element.setAttribute(key, '')
          } else {
            element.removeAttribute(key)
          }
        } else {
          element.setAttribute(key, this.componentConfig[key])
        }
      })
    }
  }

  private setupEventListeners() {
    const element = this.elementRef.nativeElement as HTMLElement

    // 监听所有自定义事件
    const events = ['custom-click', 'value-change', 'selection-change']
    events.forEach(eventName => {
      const listener = (event: Event) => {
        this.componentEvent.emit({
          type: eventName,
          originalEvent: event,
          detail: (event as CustomEvent).detail
        })
      }

      this.eventListeners[eventName] = listener
      element.addEventListener(eventName, listener)
    })
  }

  private removeEventListeners() {
    const element = this.elementRef.nativeElement as HTMLElement

    Object.keys(this.eventListeners).forEach(eventName => {
      element.removeEventListener(eventName, this.eventListeners[eventName])
    })
  }
}

// 使用示例
@Component({
  template: `
    <custom-select
      webComponentBridge
      [componentConfig]="selectConfig"
      (componentEvent)="handleComponentEvent($event)">
    </custom-select>
  `
})
export class SelectComponent {
  selectConfig = {
    multiple: true,
    placeholder: '请选择...'
  }

  handleComponentEvent(event: any) {
    console.log('组件事件:', event)
  }
}
```

### 依赖注入集成

#### 服务桥接
```typescript
import { Injectable, Injector } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class WebComponentService {
  constructor(private injector: Injector) {}

  createComponent(elementTag: string, config: any): HTMLElement {
    const element = document.createElement(elementTag) as any

    // 注入Angular服务到Web Component
    element._angularInjector = this.injector

    // 配置组件
    Object.keys(config).forEach(key => {
      element[key] = config[key]
    })

    return element
  }

  bridgeAngularService(webComponent: any, serviceKey: string) {
    // 将Angular服务桥接到Web Component
    const service = this.injector.get(serviceKey)
    webComponent._services = webComponent._services || {}
    webComponent._services[serviceKey] = service
  }
}

// 使用示例
@Component({
  template: '<div #container></div>'
})
export class ContainerComponent implements AfterViewInit {
  @ViewChild('container', { static: true })
  container!: ElementRef<HTMLDivElement>

  constructor(private webComponentService: WebComponentService) {}

  ngAfterViewInit() {
    const customElement = this.webComponentService.createComponent('custom-chart', {
      data: this.chartData,
      options: this.chartOptions
    })

    // 桥接Angular服务
    this.webComponentService.bridgeAngularService(customElement, 'DataService')

    this.container.nativeElement.appendChild(customElement)
  }
}
```

---

## 🎨 样式和主题

### CSS变量系统

#### 全局主题变量
```css
/* 全局CSS变量定义 */
:root {
  /* 颜色系统 */
  --wc-primary-color: #007bff;
  --wc-secondary-color: #6c757d;
  --wc-success-color: #28a745;
  --wc-danger-color: #dc3545;
  --wc-warning-color: #ffc107;
  --wc-info-color: #17a2b8;

  /* 字体系统 */
  --wc-font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --wc-font-size-base: 1rem;
  --wc-font-weight-normal: 400;
  --wc-font-weight-bold: 700;

  /* 间距系统 */
  --wc-spacing-xs: 0.25rem;
  --wc-spacing-sm: 0.5rem;
  --wc-spacing-md: 1rem;
  --wc-spacing-lg: 1.5rem;
  --wc-spacing-xl: 3rem;

  /* 圆角系统 */
  --wc-border-radius-sm: 0.25rem;
  --wc-border-radius-md: 0.375rem;
  --wc-border-radius-lg: 0.5rem;

  /* 阴影系统 */
  --wc-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --wc-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --wc-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

#### 暗色主题支持
```css
/* 暗色主题 */
[data-theme="dark"] {
  --wc-primary-color: #0d6efd;
  --wc-secondary-color: #6c757d;
  --wc-success-color: #198754;
  --wc-danger-color: #dc3545;
  --wc-warning-color: #fd7e14;
  --wc-info-color: #0dcaf0;
}

/* 高对比度主题 */
[data-theme="high-contrast"] {
  --wc-primary-color: #0000ff;
  --wc-secondary-color: #808080;
  --wc-success-color: #008000;
  --wc-danger-color: #ff0000;
  --wc-warning-color: #ffa500;
  --wc-info-color: #00ffff;
}
```

### 组件样式隔离

#### Shadow DOM样式封装
```typescript
class StyledComponent extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.render()
  }

  private render() {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }

        :host([disabled]) {
          opacity: 0.5;
          pointer-events: none;
        }

        :host([size="small"]) .container {
          padding: var(--wc-spacing-xs);
          font-size: 0.875rem;
        }

        :host([size="large"]) .container {
          padding: var(--wc-spacing-lg);
          font-size: 1.125rem;
        }

        .container {
          background: var(--wc-primary-color);
          color: white;
          border: none;
          padding: var(--wc-spacing-sm) var(--wc-spacing-md);
          border-radius: var(--wc-border-radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .container:hover {
          background: color-mix(in srgb, var(--wc-primary-color) 90%, black);
        }

        .container:active {
          transform: scale(0.98);
        }
      </style>
      <div class="container">
        <slot></slot>
      </div>
    `
  }
}
```

### 主题切换机制

#### 运行时主题切换
```typescript
class ThemeManager {
  private static instance: ThemeManager
  private currentTheme = 'light'

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  setTheme(theme: string) {
    this.currentTheme = theme
    document.documentElement.setAttribute('data-theme', theme)

    // 通知所有Web Components主题变更
    const event = new CustomEvent('theme-change', {
      detail: { theme },
      bubbles: true
    })
    document.dispatchEvent(event)
  }

  getCurrentTheme(): string {
    return this.currentTheme
  }
}

// Web Component主题监听
class ThemeAwareComponent extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.setupThemeListener()
    this.render()
  }

  private setupThemeListener() {
    document.addEventListener('theme-change', (event: CustomEvent) => {
      this.updateTheme(event.detail.theme)
    })
  }

  private updateTheme(theme: string) {
    // 根据主题更新组件样式
    const container = this.shadowRoot!.querySelector('.container')
    if (container) {
      container.className = `container theme-${theme}`
    }
  }
}
```

---

## 🎯 事件处理

### 自定义事件系统

#### 事件定义和触发
```typescript
class EventEmitter {
  private listeners: Map<string, Function[]> = new Map()

  addEventListener(eventType: string, listener: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    this.listeners.get(eventType)!.push(listener)
  }

  removeEventListener(eventType: string, listener: Function) {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(eventType: string, detail?: any) {
    const event = new CustomEvent(eventType, {
      detail,
      bubbles: true,
      composed: true // 允许事件穿越Shadow DOM边界
    })
    this.dispatchEvent(event)
  }
}

// 继承事件发射器
class InteractiveComponent extends EventEmitter {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.render()
    this.attachEventListeners()
  }

  private attachEventListeners() {
    const button = this.shadowRoot!.querySelector('button')
    button?.addEventListener('click', () => {
      this.emit('custom-click', {
        timestamp: Date.now(),
        component: this
      })
    })
  }
}
```

### 事件冒泡和捕获

#### Shadow DOM事件处理
```typescript
class ShadowEventComponent extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.render()
  }

  private render() {
    this.shadowRoot!.innerHTML = `
      <div class="outer">
        <div class="inner">
          <button>点击我</button>
        </div>
      </div>
    `

    this.setupEventDelegation()
  }

  private setupEventDelegation() {
    const shadow = this.shadowRoot!

    // 事件委托处理
    shadow.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const path = event.composedPath()

      // 检查点击路径
      if (target.matches('button')) {
        this.handleButtonClick(event)
      } else if (target.closest('.inner')) {
        this.handleInnerClick(event)
      } else if (target.closest('.outer')) {
        this.handleOuterClick(event)
      }
    })

    // 监听来自外部的事件
    this.addEventListener('external-event', (event: CustomEvent) => {
      console.log('收到外部事件:', event.detail)
    })
  }

  private handleButtonClick(event: Event) {
    // 阻止事件冒泡到Shadow DOM外部
    event.stopPropagation()

    // 触发自定义事件
    this.dispatchEvent(new CustomEvent('button-click', {
      detail: { button: event.target },
      bubbles: true,
      composed: true
    }))
  }

  private handleInnerClick(event: Event) {
    console.log('内部区域被点击')
  }

  private handleOuterClick(event: Event) {
    console.log('外部区域被点击')
  }
}
```

---

## 🔄 生命周期管理

### Web Components生命周期

#### 生命周期钩子
```typescript
class LifecycleComponent extends HTMLElement {
  // 声明观察的属性
  static get observedAttributes() {
    return ['data-loaded', 'config']
  }

  private _isConnected = false
  private _config = {}

  constructor() {
    super()
    console.log('constructor: 组件创建')

    // 此时还不能访问DOM
    // 可以进行一些初始化工作
  }

  // 当组件被插入到DOM中时调用
  connectedCallback() {
    console.log('connectedCallback: 组件已连接到DOM')
    this._isConnected = true

    // 此时可以安全地访问DOM
    this.attachShadow({ mode: 'open' })
    this.render()

    // 设置事件监听器
    this.attachEventListeners()

    // 初始化数据
    this.initializeData()
  }

  // 当组件从DOM中移除时调用
  disconnectedCallback() {
    console.log('disconnectedCallback: 组件已从DOM移除')
    this._isConnected = false

    // 清理事件监听器
    this.removeEventListeners()

    // 清理定时器和异步操作
    this.cleanupResources()
  }

  // 当组件移动到新的文档中时调用
  adoptedCallback(oldDocument: Document, newDocument: Document) {
    console.log('adoptedCallback: 组件移动到新文档')
  }

  // 当观察的属性发生变化时调用
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    console.log(`attributeChangedCallback: ${name} 从 ${oldValue} 变为 ${newValue}`)

    switch (name) {
      case 'data-loaded':
        this.handleDataLoaded(newValue === 'true')
        break
      case 'config':
        this.handleConfigChange(newValue)
        break
    }
  }

  private render() {
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = `
      <div class="component">
        <h3>生命周期演示组件</h3>
        <p>已连接: ${this._isConnected}</p>
        <p>配置: ${JSON.stringify(this._config)}</p>
      </div>
    `
  }

  private attachEventListeners() {
    // 添加事件监听器
  }

  private removeEventListeners() {
    // 移除事件监听器
  }

  private initializeData() {
    // 初始化数据
  }

  private cleanupResources() {
    // 清理资源
  }

  private handleDataLoaded(isLoaded: boolean) {
    if (isLoaded) {
      this.render()
    }
  }

  private handleConfigChange(configJson: string) {
    try {
      this._config = JSON.parse(configJson)
      this.render()
    } catch (error) {
      console.error('配置解析失败:', error)
    }
  }
}
```

### 与框架生命周期的协调

#### Vue生命周期桥接
```typescript
class VueLifecycleBridge extends HTMLElement {
  private vueApp: any = null

  connectedCallback() {
    // Web Component连接时，创建Vue应用
    this.createVueApp()
  }

  disconnectedCallback() {
    // Web Component断开时，销毁Vue应用
    this.destroyVueApp()
  }

  private createVueApp() {
    // 创建Vue应用实例
    const { createApp } = require('vue')
    const { ref, onMounted, onUnmounted } = require('vue')

    const app = createApp({
      setup() {
        const count = ref(0)

        onMounted(() => {
          console.log('Vue组件已挂载')
        })

        onUnmounted(() => {
          console.log('Vue组件即将卸载')
        })

        return { count }
      },
      template: '<div>{{ count }}</div>'
    })

    this.vueApp = app
    app.mount(this.shadowRoot!)
  }

  private destroyVueApp() {
    if (this.vueApp) {
      this.vueApp.unmount()
      this.vueApp = null
    }
  }
}
```

---

## ⚡ 性能优化

### 渲染优化

#### Virtual DOM模拟
```typescript
class OptimizedComponent extends HTMLElement {
  private _props = {}
  private _oldVNode: VNode | null = null

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  set props(newProps: any) {
    this._props = { ...this._props, ...newProps }
    this.scheduleUpdate()
  }

  private scheduleUpdate() {
    if (!this._updateScheduled) {
      this._updateScheduled = true
      requestAnimationFrame(() => {
        this.update()
        this._updateScheduled = false
      })
    }
  }

  private update() {
    const newVNode = this.renderVNode()
    const patches = diff(this._oldVNode, newVNode)

    applyPatches(this.shadowRoot!, patches)
    this._oldVNode = newVNode
  }

  private renderVNode(): VNode {
    // 简化的虚拟DOM创建
    return {
      tag: 'div',
      props: { class: 'container' },
      children: [
        { tag: 'h3', children: [this._props.title] },
        { tag: 'p', children: [this._props.content] }
      ]
    }
  }
}

// 简化的diff和patch实现
function diff(oldVNode: VNode | null, newVNode: VNode): Patch[] {
  // 简化的diff算法实现
  return []
}

function applyPatches(root: ShadowRoot, patches: Patch[]) {
  // 应用补丁到DOM
}
```

### 内存管理

#### 内存泄漏防护
```typescript
class MemorySafeComponent extends HTMLElement {
  private _eventListeners: Map<string, Function> = new Map()
  private _timers: Set<number> = new Set()
  private _intervals: Set<number> = new Set()
  private _observers: Set<MutationObserver | IntersectionObserver> = new Set()

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.setupComponent()
  }

  disconnectedCallback() {
    this.cleanup()
  }

  // 安全的定时器管理
  setSafeTimeout(callback: Function, delay: number): number {
    const id = window.setTimeout(() => {
      this._timers.delete(id)
      callback()
    }, delay)
    this._timers.add(id)
    return id
  }

  // 安全的观察器管理
  addSafeObserver(observer: MutationObserver | IntersectionObserver): void {
    this._observers.add(observer)
  }

  // 安全的事件监听器管理
  addSafeEventListener(target: EventTarget, event: string, handler: Function): void {
    const wrappedHandler = (event: Event) => {
      handler(event)
    }

    target.addEventListener(event, wrappedHandler)
    this._eventListeners.set(`${event}-${target}`, wrappedHandler)
  }

  // 清理所有资源
  private cleanup() {
    // 清理定时器
    this._timers.forEach(id => clearTimeout(id))
    this._timers.clear()

    // 清理间隔定时器
    this._intervals.forEach(id => clearInterval(id))
    this._intervals.clear()

    // 清理观察器
    this._observers.forEach(observer => observer.disconnect())
    this._observers.clear()

    // 清理事件监听器
    this._eventListeners.forEach((handler, key) => {
      const [event, target] = key.split('-')
      if (target) {
        (target as any).removeEventListener(event, handler)
      }
    })
    this._eventListeners.clear()
  }
}
```

### 懒加载和代码分割

#### 动态导入
```typescript
class LazyComponent extends HTMLElement {
  private _loaded = false

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.showLoadingState()
  }

  connectedCallback() {
    if (!this._loaded) {
      this.loadComponent()
    }
  }

  private async loadComponent() {
    try {
      // 动态导入组件实现
      const { default: ComponentClass } = await import('./HeavyComponent.js')

      // 创建组件实例
      const component = new ComponentClass()

      // 替换加载状态
      this.shadowRoot!.innerHTML = ''
      this.shadowRoot!.appendChild(component)

      this._loaded = true
    } catch (error) {
      this.showErrorState(error)
    }
  }

  private showLoadingState() {
    this.shadowRoot!.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>正在加载组件...</p>
      </div>
    `
  }

  private showErrorState(error: Error) {
    this.shadowRoot!.innerHTML = `
      <div class="error">
        <p>组件加载失败</p>
        <p class="error-message">${error.message}</p>
        <button onclick="this.parentElement.parentElement.parentElement.loadComponent()">
          重试
        </button>
      </div>
    `
  }
}
```

---

## 🧪 测试策略

### 单元测试

#### Web Components测试
```typescript
// web-component.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('CustomButton', () => {
  let element

  beforeEach(() => {
    // 注册组件
    if (!customElements.get('custom-button')) {
      customElements.define('custom-button', CustomButton)
    }

    // 创建元素
    element = document.createElement('custom-button')
    document.body.appendChild(element)
  })

  afterEach(() => {
    document.body.removeChild(element)
  })

  it('应该正确渲染', () => {
    const button = element.shadowRoot.querySelector('button')
    expect(button).toBeTruthy()
    expect(button.textContent).toBe('')
  })

  it('应该处理插槽内容', () => {
    element.textContent = '测试按钮'
    const button = element.shadowRoot.querySelector('button')
    expect(button.textContent.trim()).toBe('测试按钮')
  })

  it('应该触发点击事件', () => {
    const mockCallback = vi.fn()
    element.addEventListener('custom-click', mockCallback)

    const button = element.shadowRoot.querySelector('button')
    button.click()

    expect(mockCallback).toHaveBeenCalled()
  })

  it('应该支持属性变化', () => {
    element.setAttribute('disabled', 'true')
    expect(element.disabled).toBe(true)

    const button = element.shadowRoot.querySelector('button')
    expect(button.disabled).toBe(true)
  })
})
```

### 集成测试

#### 框架集成测试
```typescript
// vue-integration.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VueComponent from './VueComponent.vue'

describe('Vue + Web Components Integration', () => {
  it('应该正确集成Web Components', async () => {
    const wrapper = mount(VueComponent)

    // 等待Web Component加载
    await new Promise(resolve => setTimeout(resolve, 100))

    // 查找Web Component
    const customElement = wrapper.find('custom-button')
    expect(customElement.exists()).toBe(true)

    // 测试属性传递
    await customElement.setProps({ variant: 'primary' })
    expect(customElement.attributes('variant')).toBe('primary')

    // 测试事件处理
    const mockHandler = vi.fn()
    wrapper.vm.$on('custom-click', mockHandler)

    // 触发Web Component事件
    const button = customElement.element.shadowRoot.querySelector('button')
    button.click()

    expect(mockHandler).toHaveBeenCalled()
  })

  it('应该支持v-model双向绑定', async () => {
    const wrapper = mount(VueComponent)

    const input = wrapper.find('custom-input')

    // 设置值
    await input.setValue('测试值')
    expect(wrapper.vm.inputValue).toBe('测试值')

    // 模拟输入事件
    const nativeInput = input.element.shadowRoot.querySelector('input')
    nativeInput.value = '新值'
    nativeInput.dispatchEvent(new Event('input', { bubbles: true }))

    expect(wrapper.vm.inputValue).toBe('新值')
  })
})
```

### E2E测试

#### Playwright测试
```typescript
// e2e.test.ts
import { test, expect } from '@playwright/test'

test.describe('Web Components E2E', () => {
  test('应该在不同框架中正常工作', async ({ page }) => {
    // 测试Vue版本
    await page.goto('/vue-app')
    await page.waitForSelector('custom-button')

    await page.click('custom-button')
    await expect(page.locator('.notification')).toBeVisible()

    // 测试React版本
    await page.goto('/react-app')
    await page.waitForSelector('custom-button')

    await page.click('custom-button')
    await expect(page.locator('.notification')).toBeVisible()

    // 测试Angular版本
    await page.goto('/angular-app')
    await page.waitForSelector('custom-button')

    await page.click('custom-button')
    await expect(page.locator('.notification')).toBeVisible()
  })

  test('应该保持一致的行为', async ({ page }) => {
    const apps = ['/vue-app', '/react-app', '/angular-app']

    for (const app of apps) {
      await page.goto(app)

      // 测试按钮点击
      await page.click('custom-button')
      const notification = page.locator('.notification')
      await expect(notification).toBeVisible()

      // 测试通知自动消失
      await page.waitForTimeout(3000)
      await expect(notification).not.toBeVisible()
    }
  })
})
```

---

## 🔧 调试和开发工具

### 浏览器开发工具

#### Chrome DevTools扩展
```typescript
// dev-tools-integration.js
class DevToolsIntegration {
  static enable() {
    // 启用Web Components调试
    if ('adoptedStyleSheets' in document) {
      console.log('Web Components调试已启用')
    }

    // 添加自定义检查器
    this.addCustomInspector()
  }

  static addCustomInspector() {
    // 为自定义元素添加调试信息
    const originalDefine = customElements.define

    customElements.define = function(name, constructor, options) {
      // 添加调试信息
      constructor._debugInfo = {
        name,
        definedAt: new Error().stack,
        options
      }

      return originalDefine.call(this, name, constructor, options)
    }
  }

  static inspectComponent(component: HTMLElement) {
    return {
      tagName: component.tagName,
      attributes: Array.from(component.attributes).map(attr => ({
        name: attr.name,
        value: attr.value
      })),
      properties: this.getComponentProperties(component),
      shadowRoot: component.shadowRoot ? this.inspectShadowRoot(component.shadowRoot) : null,
      customProperties: this.getCustomProperties(component)
    }
  }

  static getComponentProperties(component: any) {
    const properties = {}
    const prototype = Object.getPrototypeOf(component)

    // 获取所有属性
    Object.getOwnPropertyNames(prototype).forEach(name => {
      if (name !== 'constructor' && typeof component[name] !== 'function') {
        try {
          properties[name] = component[name]
        } catch (e) {
          properties[name] = '<无法访问>'
        }
      }
    })

    return properties
  }

  static inspectShadowRoot(shadowRoot: ShadowRoot) {
    return {
      mode: shadowRoot.mode,
      children: Array.from(shadowRoot.children).map(child => ({
        tagName: child.tagName,
        className: child.className,
        textContent: child.textContent?.slice(0, 100)
      })),
      styleSheets: shadowRoot.adoptedStyleSheets?.length || 0
    }
  }

  static getCustomProperties(component: HTMLElement) {
    const styles = window.getComputedStyle(component)
    const customProperties = {}

    for (let i = 0; i < styles.length; i++) {
      const property = styles[i]
      if (property.startsWith('--')) {
        customProperties[property] = styles.getPropertyValue(property)
      }
    }

    return customProperties
  }
}

// 启用调试功能
if (process.env.NODE_ENV === 'development') {
  DevToolsIntegration.enable()
}
```

### 开发辅助工具

#### 热重载支持
```typescript
// hot-reload.js
class HotReloadSupport {
  static enable() {
    if (import.meta.hot) {
      import.meta.hot.accept((newModule) => {
        if (newModule) {
          this.reloadComponents(newModule)
        }
      })
    }
  }

  static reloadComponents(newModule: any) {
    // 查找所有相关的Web Components
    const components = document.querySelectorAll('[data-hot-reload]')

    components.forEach(component => {
      const tagName = component.tagName.toLowerCase()

      // 重新定义组件
      if (newModule[tagName]) {
        try {
          customElements.define(`${tagName}-new`, newModule[tagName])

          // 替换现有组件
          const newElement = document.createElement(`${tagName}-new`)
          component.parentNode?.replaceChild(newElement, component)

        } catch (error) {
          console.warn(`热重载失败 ${tagName}:`, error)
        }
      }
    })
  }
}
```

---

## 💡 最佳实践

### 设计原则

#### 1. 渐进式增强
- **基础功能优先**：确保组件在不支持Web Components的环境中有基本功能
- **优雅降级**：为不支持的浏览器提供替代方案
- **功能检测**：使用特性检测而非浏览器检测

#### 2. 标准化API
- **一致的属性命名**：使用标准的HTML属性命名约定
- **统一的事件格式**：自定义事件遵循标准Event接口
- **可预测的行为**：组件行为应该符合用户预期

#### 3. 性能优先
- **懒加载**：按需加载组件代码
- **虚拟化**：大数据集使用虚拟滚动
- **内存管理**：及时清理事件监听器和定时器

### 开发规范

#### 组件命名
```typescript
// 推荐的命名约定
class MyComponent extends HTMLElement {
  // 使用连字符分隔
  // custom-my-component

  // 属性使用驼峰命名
  // myProperty -> my-property

  // 事件使用连字符分隔
  // myEvent -> my-event
}

// 注册时使用完整命名
customElements.define('custom-my-component', MyComponent)
```

#### 样式规范
```css
/* 推荐的样式组织 */
:host {
  /* 组件根样式 */
  display: block;
}

:host([disabled]) {
  /* 状态样式 */
  opacity: 0.5;
}

:host([size="small"]) .content {
  /* 属性样式 */
  font-size: 0.875rem;
}

.content {
  /* 内容样式 */
}

::slotted(*) {
  /* 插槽样式 */
}
```

### 错误处理

#### 优雅的错误处理
```typescript
class RobustComponent extends HTMLElement {
  private errorBoundary: ErrorBoundary

  constructor() {
    super()
    this.errorBoundary = new ErrorBoundary()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    try {
      this.initializeComponent()
    } catch (error) {
      this.handleInitializationError(error)
    }
  }

  private initializeComponent() {
    // 可能抛出异常的操作
    this.render()
    this.attachEventListeners()
    this.loadData()
  }

  private handleInitializationError(error: Error) {
    console.error('组件初始化失败:', error)

    // 显示错误状态
    this.shadowRoot!.innerHTML = `
      <div class="error-state">
        <h3>组件加载失败</h3>
        <p>错误信息: ${error.message}</p>
        <button onclick="this.parentElement.parentElement.retryInitialization()">
          重试
        </button>
      </div>
    `
  }

  retryInitialization() {
    // 清理错误状态
    this.shadowRoot!.innerHTML = '<div class="loading">重新加载中...</div>'

    // 延迟重试，避免立即失败
    setTimeout(() => {
      this.initializeComponent()
    }, 1000)
  }
}

class ErrorBoundary {
  catch(error: Error, context: string) {
    // 记录错误信息
    console.error(`[${context}] 错误:`, error)

    // 发送错误报告
    this.reportError(error, context)

    // 根据错误严重程度决定处理方式
    if (this.isCriticalError(error)) {
      this.handleCriticalError(error)
    } else {
      this.handleRecoverableError(error)
    }
  }

  private reportError(error: Error, context: string) {
    // 发送错误到监控系统
    fetch('/api/errors', {
      method: 'POST',
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        context,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      })
    })
  }

  private isCriticalError(error: Error): boolean {
    // 判断是否为严重错误
    return error.message.includes('ShadowRoot') ||
           error.message.includes('customElements')
  }

  private handleCriticalError(error: Error) {
    // 严重错误处理：显示降级UI
    this.showFallbackUI()
  }

  private handleRecoverableError(error: Error) {
    // 可恢复错误：尝试修复或降级
    this.attemptRecovery(error)
  }

  private showFallbackUI() {
    // 显示基本功能的降级UI
  }

  private attemptRecovery(error: Error) {
    // 尝试自动恢复
  }
}
```

---

## ❓ 常见问题

### 兼容性问题

#### Q: Safari不支持构造样式表，该怎么办？
A: 使用传统样式注入方式作为备选方案。

```typescript
class SafariCompatibleComponent extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    // 检测构造样式表支持
    if ('adoptedStyleSheets' in document) {
      this.useConstructedStylesheets()
    } else {
      this.useTraditionalStyles()
    }
  }

  private useConstructedStylesheets() {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(`
      .content { color: blue; }
    `)
    this.shadowRoot!.adoptedStyleSheets = [sheet]
  }

  private useTraditionalStyles() {
    const style = document.createElement('style')
    style.textContent = `
      .content { color: blue; }
    `
    this.shadowRoot!.appendChild(style)
  }
}
```

#### Q: 组件在Shadow DOM中无法访问外部样式怎么办？
A: 使用CSS自定义属性或显式样式传递。

```typescript
class StyleBridgeComponent extends HTMLElement {
  connectedCallback() {
    this.copyExternalStyles()
  }

  private copyExternalStyles() {
    const externalStyles = window.getComputedStyle(this)
    const shadow = this.shadowRoot!

    // 复制外部样式到内部
    const internalElement = shadow.querySelector('.internal')
    if (internalElement) {
      ;(internalElement as HTMLElement).style.cssText = externalStyles.cssText
    }
  }
}
```

### 性能问题

#### Q: 组件初始化慢怎么办？
A: 使用延迟初始化和代码分割。

```typescript
class LazyInitComponent extends HTMLElement {
  private _initialized = false

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.showPlaceholder()
  }

  connectedCallback() {
    // 延迟初始化
    this.scheduleInitialization()
  }

  private scheduleInitialization() {
    // 使用requestIdleCallback延迟初始化
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.initialize())
    } else {
      setTimeout(() => this.initialize(), 100)
    }
  }

  private async initialize() {
    if (this._initialized) return

    // 动态导入组件逻辑
    const { default: ComponentLogic } = await import('./ComponentLogic.js')

    const logic = new ComponentLogic()
    this.shadowRoot!.appendChild(logic.render())

    this._initialized = true
  }

  private showPlaceholder() {
    this.shadowRoot!.innerHTML = '<div class="placeholder">加载中...</div>'
  }
}
```

### 框架集成问题

#### Q: Vue的响应式在Web Components中不工作怎么办？
A: 使用显式的变更通知。

```typescript
class VueCompatibleComponent extends HTMLElement {
  private _data = {}

  set data(newData: any) {
    this._data = { ...this._data, ...newData }
    this.notifyDataChange()
  }

  get data() {
    return this._data
  }

  private notifyDataChange() {
    // 触发自定义事件通知Vue
    this.dispatchEvent(new CustomEvent('data-change', {
      detail: { data: this._data },
      bubbles: true
    }))
  }
}

// Vue中使用
const component = ref<VueCompatibleComponent>()
const data = ref({})

// 监听数据变化
watch(() => component.value?.data, (newData) => {
  data.value = newData
})

// 更新数据
const updateData = () => {
  component.value!.data = { ...data.value, updated: true }
}
```

---

## 📚 相关文档

- [Web Components文档模板](../templates/web-components-template.md)
- [多框架兼容性指南](../technical/frontend/MULTI_FRAMEWORK_GUIDE.md)
- [组件开发规范](../development/frontend/guides/COMPONENT_DEVELOPMENT_GUIDE.md)
- [Web Components规范](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)

---

*本指南为动态文档，将根据Web Components标准发展和实践经验持续更新。如有疑问请联系前端架构组。*
