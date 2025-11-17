---
title: PERFORMANCE OPTIMIZATION REQUIREMENTS
version: v1.0.0
last_updated: 2025-11-17
status: critical
category: requirements
tags: [performance, optimization, loading, animation, critical]
---

# ⚡ 性能优化需求文档

> **版本**：v1.0.0
> **更新日期**：2025-11-17
> **适用范围**：前端性能优化
> **状态**：critical
> **优先级**：P0 - 立即执行
> **关键词**：性能优化, 加载速度, 动效性能, 内存管理, 资源优化

---

## 📋 目录

- [文档概述](#文档概述)
- [性能现状分析](#性能现状分析)
- [设计目标](#设计目标)
- [加载性能优化](#加载性能优化)
- [运行时性能优化](#运行时性能优化)
- [动效性能优化](#动效性能优化)
- [内存管理优化](#内存管理优化)
- [资源优化策略](#资源优化策略)
- [监控与测量](#监控与测量)
- [技术实现方案](#技术实现方案)
- [验收标准](#验收标准)
- [实施计划](#实施计划)

---

## 📖 文档概述

### 目的

制定全面的性能优化策略，提升健身房综合管理系统的加载速度、运行效率和用户体验，确保在各种设备和网络条件下都能提供流畅的服务。

### 范围

- **加载性能**：首屏加载、资源加载、缓存策略
- **运行时性能**：JavaScript执行、渲染性能、交互响应
- **动效性能**：动画流畅度、GPU加速、降级策略
- **内存管理**：内存泄漏检测、垃圾回收优化
- **资源优化**：图片压缩、代码分割、CDN优化

### 关键问题解决

| 问题领域 | 当前状态 | 目标状态 |
|----------|----------|----------|
| 首屏加载 | >5秒 | <3秒 |
| 动效流畅度 | 卡顿明显 | 60FPS稳定 |
| 内存使用 | 泄漏风险高 | 优化管理 |
| 资源体积 | 未优化 | 压缩优化 |

---

## 📊 性能现状分析

### 核心性能指标

#### 加载性能
- **First Contentful Paint (FCP)**：当前3.2秒，目标<1.8秒
- **Largest Contentful Paint (LCP)**：当前4.8秒，目标<2.5秒
- **First Input Delay (FID)**：当前120ms，目标<100ms
- **Cumulative Layout Shift (CLS)**：当前0.15，目标<0.1

#### 运行时性能
- **JavaScript执行时间**：平均占用35%CPU
- **渲染帧率**：复杂页面<45FPS
- **内存使用**：持续使用>150MB
- **网络请求**：平均页面>50个请求

### 性能瓶颈识别

#### 加载阶段瓶颈
1. **大体积资源**：Three.js等重型库未按需加载
2. **同步阻塞**：CSS/JS资源阻塞渲染
3. **图片未优化**：大尺寸图片未压缩
4. **缓存策略缺失**：静态资源缓存不合理

#### 运行时瓶颈
1. **动效性能差**：Three.js动画在低端设备卡顿
2. **内存泄漏**：组件卸载时事件监听器未清理
3. **重渲染频繁**：状态更新导致不必要的组件重渲染
4. **布局抖动**：DOM操作导致页面重排

#### 网络瓶颈
1. **请求数量多**：未进行资源合并和代码分割
2. **CDN未优化**：静态资源CDN配置不合理
3. **预加载缺失**：关键资源未进行预加载

---

## 🎯 设计目标

### 性能目标

#### 量化指标目标
- **Core Web Vitals**: 全部指标达到"良好"标准
- **Lighthouse性能评分**: ≥90分
- **首次加载时间**: <3秒 (3G网络)
- **交互响应时间**: <100ms
- **内存使用峰值**: <100MB
- **帧率稳定性**: 60FPS持续

#### 用户体验目标
- **感知性能**: 用户感觉应用快速响应
- **流畅体验**: 动画和交互无卡顿
- **电池续航**: 优化功耗，延长设备使用时间
- **网络适应**: 在各种网络条件下都能正常使用

#### 技术目标
- **代码分割**: 首屏包体积减少40%
- **缓存命中率**: 静态资源缓存命中率>80%
- **错误率**: JavaScript运行时错误率<1%
- **兼容性**: 支持更多低端设备

### 优先级分层

#### P0 - 关键性能 (立即修复)
- 首屏加载时间优化
- 严重内存泄漏修复
- 阻塞性渲染问题解决

#### P1 - 重要性能 (本月完成)
- 动效性能优化
- 图片和资源优化
- 缓存策略完善

#### P2 - 持续优化 (长期改进)
- 代码分割和懒加载
- 高级缓存策略
- 性能监控体系

---

## 🚀 加载性能优化

### 首屏加载优化

#### 关键渲染路径优化
```javascript
// 优化关键渲染路径
// 1. 消除阻塞渲染的CSS
<link rel="preload" href="critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

// 2. 异步加载非关键CSS
<link rel="preload" href="non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

// 3. 延迟加载JavaScript
<script defer src="app.js"></script>

// 4. 预加载关键资源
<link rel="preload" href="hero-image.jpg" as="image">
<link rel="dns-prefetch" href="//api.example.com">
```

#### 代码分割策略
```javascript
// 路由级代码分割
const HomePage = () => import(/* webpackChunkName: "home" */ '@/pages/Home.vue')
const BookingPage = () => import(/* webpackChunkName: "booking" */ '@/pages/Booking.vue')

// 组件级代码分割
const HeavyChart = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "charts" */ '@/components/HeavyChart.vue'),
  loadingComponent: LoadingSpinner
})

// 库级代码分割
const loadThreeJS = async () => {
  const THREE = await import(/* webpackChunkName: "threejs" */ 'three')
  return THREE
}
```

#### 资源优先级管理
```html
<!-- 关键资源 - 最高优先级 -->
<link rel="preload" href="critical-font.woff2" as="font" crossorigin>
<link rel="preload" href="critical-script.js" as="script">

<!-- 重要资源 - 高优先级 -->
<link rel="prefetch" href="important-image.jpg">

<!-- 非关键资源 - 低优先级 -->
<link rel="prefetch" href="lazy-loaded-component.js">
```

### 图片优化策略

#### 响应式图片
```html
<!-- 使用srcset提供多尺寸图片 -->
<img
  src="image-800w.jpg"
  srcset="image-400w.jpg 400w,
          image-800w.jpg 800w,
          image-1200w.jpg 1200w"
  sizes="(max-width: 768px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
  alt="健身房设施"
>

<!-- WebP格式支持 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="健身房设施">
</picture>
```

#### 懒加载实现
```typescript
// 图片懒加载组件
<template>
  <img
    ref="imgRef"
    :data-src="src"
    :alt="alt"
    class="lazy-image"
    @load="onLoad"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  src: string
  alt?: string
}>()

const imgRef = ref<HTMLImageElement>()
const isLoaded = ref(false)
const hasError = ref(false)

const loadImage = () => {
  if (!imgRef.value) return

  const img = imgRef.value
  img.src = props.src
  img.classList.add('loading')
}

const onLoad = () => {
  isLoaded.value = true
  imgRef.value?.classList.remove('loading')
  imgRef.value?.classList.add('loaded')
}

const onError = () => {
  hasError.value = true
  // 加载失败处理
}

// 懒加载逻辑
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage()
          observer.disconnect()
        }
      })
    },
    { rootMargin: '50px' }
  )

  if (imgRef.value) {
    observer.observe(imgRef.value)
  }
})
</script>
```

### 缓存策略优化

#### HTTP缓存配置
```nginx
# nginx缓存配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
  add_header X-Cache-Status $upstream_cache_status;

  # Brotli压缩 (如果支持)
  brotli on;
  brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}

# API缓存
location /api/ {
  # 短期缓存
  expires 5m;
  add_header Cache-Control "private, max-age=300";

  # 条件缓存
  if_modified_since before;
  add_header Last-Modified $date_gmt;
}
```

#### Service Worker缓存
```typescript
// service-worker.js
const CACHE_NAME = 'gym-app-v1'
const STATIC_CACHE = 'gym-static-v1'
const DYNAMIC_CACHE = 'gym-dynamic-v1'

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/static/css/main.css',
        '/static/js/main.js',
        '/static/images/logo.png'
      ])
    })
  )
})

// 网络优先策略 (Network First)
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirstStrategy(event.request))
  } else {
    event.respondWith(cacheFirstStrategy(event.request))
  }
})

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    const cache = await caches.open(DYNAMIC_CACHE)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    return caches.match(request)
  }
}

async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    const cache = await caches.open(DYNAMIC_CACHE)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    return new Response('Offline fallback')
  }
}
```

---

## ⚙️ 运行时性能优化

### JavaScript执行优化

#### 防抖和节流
```typescript
// 防抖函数 - 延迟执行
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数 - 限制执行频率
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 使用示例
const debouncedSearch = debounce(handleSearch, 300)
const throttledScroll = throttle(handleScroll, 100)
```

#### 虚拟滚动实现
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
  return {
    start: Math.max(0, start - 5), // 多渲染5个缓冲
    end: Math.min(props.items.length, end + 5)
  }
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
    containerRef.value.addEventListener('scroll', handleScroll, { passive: true })
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

### 渲染性能优化

#### Reactivity优化
```typescript
// 使用computed缓存计算结果
const filteredCourses = computed(() => {
  let filtered = courses.value

  if (searchQuery.value) {
    filtered = filtered.filter(course =>
      course.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

// 使用shallowRef减少深度响应
import { shallowRef } from 'vue'

const heavyData = shallowRef({
  // 大对象，不会触发深度监听
})

// 使用markRaw标记非响应式对象
import { markRaw } from 'vue'

const threeScene = markRaw(new THREE.Scene()) // Three.js对象不需要响应式
```

#### 组件渲染优化
```vue
<template>
  <!-- 使用v-memo缓存渲染 -->
  <CourseCard
    v-for="course in courses"
    :key="course.id"
    v-memo="[course.name, course.price, course.image]"
    :course="course"
    @click="selectCourse"
  />
</template>

<script setup lang="ts">
// 使用v-once缓存静态内容
</script>

<style scoped>
/* 使用contain优化渲染隔离 */
.card {
  contain: layout style paint;
}

/* 使用will-change提示浏览器优化 */
.card:hover {
  will-change: transform;
}
</style>
```

---

## 🎭 动效性能优化

### GPU加速优化

#### 硬件加速策略
```css
/* 强制GPU加速 */
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* 动效元素优化 */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* 清理will-change */
.animated-element:not(:hover) {
  will-change: auto;
}
```

#### 动效降级策略
```typescript
// 检测设备性能
const isLowEndDevice = () => {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

  if (!gl) return true // 无WebGL支持

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
  if (debugInfo) {
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    // 检测低端GPU
    return /Intel.*HD.*Graphics|Intel.*UHD.*Graphics|Mesa.*Intel/i.test(renderer)
  }

  return false
}

// 条件动效
const useAdaptiveAnimation = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isLowEnd = isLowEndDevice()

  return {
    enableHeavyAnimations: !prefersReducedMotion && !isLowEnd,
    enableBasicAnimations: !prefersReducedMotion,
    reduceMotion: prefersReducedMotion
  }
}
```

### Three.js性能优化

#### 场景优化
```typescript
// 1. 使用LOD (Level of Detail)
const lod = new THREE.LOD()

const highDetail = createHighDetailMesh()
const mediumDetail = createMediumDetailMesh()
const lowDetail = createLowDetailMesh()

lod.addLevel(highDetail, 0)      // 近距离高精度
lod.addLevel(mediumDetail, 50)   // 中距离中等精度
lod.addLevel(lowDetail, 100)     // 远距离低精度

scene.add(lod)

// 2. 实例化渲染 (InstancedMesh)
const instanceCount = 1000
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })

const instancedMesh = new THREE.InstancedMesh(geometry, material, instanceCount)

for (let i = 0; i < instanceCount; i++) {
  const matrix = new THREE.Matrix4()
  matrix.setPosition(Math.random() * 100, Math.random() * 100, Math.random() * 100)
  instancedMesh.setMatrixAt(i, matrix)
}

scene.add(instancedMesh)

// 3. 纹理优化
const texture = new THREE.TextureLoader().load('texture.jpg')
texture.generateMipmaps = false  // 禁用mipmap节省内存
texture.minFilter = THREE.LinearFilter
texture.magFilter = THREE.LinearFilter

// 4. 几何体合并
const mergedGeometry = new THREE.BufferGeometry()
const geometries = [geom1, geom2, geom3]
mergedGeometry.merge(...geometries)

// 5. 视锥剔除优化
const frustum = new THREE.Frustum()
const matrix = new THREE.Matrix4().multiplyMatrices(
  camera.projectionMatrix,
  camera.matrixWorldInverse
)
frustum.setFromProjectionMatrix(matrix)

// 只渲染可见对象
scene.children.forEach((child) => {
  if (child instanceof THREE.Mesh) {
    child.visible = frustum.intersectsObject(child)
  }
})
```

#### 渲染器优化
```typescript
// 渲染器配置优化
const renderer = new THREE.WebGLRenderer({
  antialias: false,        // 关闭抗锯齿节省性能
  alpha: true,
  powerPreference: 'low-power', // 优先使用低功耗GPU
  precision: 'mediump'     // 使用中等精度
})

// 设置像素比例 (移动端优化)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// 阴影优化
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap // 平衡质量和性能

// 后期处理优化 (如果使用)
const composer = new EffectComposer(renderer)
composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // 降低后期处理分辨率
```

---

## 🧠 内存管理优化

### 内存泄漏检测和修复

#### 事件监听器清理
```typescript
// 组合式API中的事件清理
import { onMounted, onUnmounted } from 'vue'

export function useEventListener(
  target: EventTarget,
  event: string,
  handler: EventListener
) {
  onMounted(() => {
    target.addEventListener(event, handler)
  })

  onUnmounted(() => {
    target.removeEventListener(event, handler)
  })
}

// Three.js对象清理
const disposeThreeObject = (object: THREE.Object3D) => {
  if (object.geometry) {
    object.geometry.dispose()
  }

  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach(material => material.dispose())
    } else {
      object.material.dispose()
    }
  }

  // 递归清理子对象
  object.children.forEach(child => disposeThreeObject(child))
}

// 组件卸载时清理
onUnmounted(() => {
  if (sceneRef.value) {
    disposeThreeObject(sceneRef.value)
    renderer.dispose()
  }
})
```

#### 定时器和异步操作清理
```typescript
// 定时器管理
export function useTimeout(fn: () => void, delay: number) {
  const timeoutRef = ref<NodeJS.Timeout>()

  const start = () => {
    timeoutRef.value = setTimeout(fn, delay)
  }

  const stop = () => {
    if (timeoutRef.value) {
      clearTimeout(timeoutRef.value)
      timeoutRef.value = undefined
    }
  }

  onUnmounted(stop)

  return { start, stop }
}

// 防抖函数的内存管理
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
) {
  const timeoutRef = ref<NodeJS.Timeout>()

  const debounced = (...args: Parameters<T>) => {
    if (timeoutRef.value) {
      clearTimeout(timeoutRef.value)
    }

    timeoutRef.value = setTimeout(() => {
      func(...args)
    }, wait)
  }

  onUnmounted(() => {
    if (timeoutRef.value) {
      clearTimeout(timeoutRef.value)
    }
  })

  return debounced
}
```

### 内存使用监控

#### 性能内存监控
```typescript
// 内存使用监控
export function useMemoryMonitor() {
  const memoryInfo = ref<MemoryInfo>()

  const updateMemoryInfo = () => {
    if ('memory' in performance) {
      memoryInfo.value = (performance as any).memory
    }
  }

  const startMonitoring = (interval = 5000) => {
    updateMemoryInfo()
    const intervalId = setInterval(updateMemoryInfo, interval)

    onUnmounted(() => {
      clearInterval(intervalId)
    })
  }

  return {
    memoryInfo,
    startMonitoring,
    updateMemoryInfo
  }
}

// 内存泄漏检测
export function detectMemoryLeaks() {
  if ('memory' in performance) {
    const initialMemory = (performance as any).memory.usedJSHeapSize

    // 运行一系列操作
    // ...

    const finalMemory = (performance as any).memory.usedJSHeapSize
    const memoryIncrease = finalMemory - initialMemory

    if (memoryIncrease > 10 * 1024 * 1024) { // 10MB
      console.warn('Potential memory leak detected:', memoryIncrease, 'bytes')
    }
  }
}
```

---

## 📦 资源优化策略

### 构建优化

#### Vite构建配置优化
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { splitVendorChunkPlugin } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 代码分割
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus'],
          'animation-vendor': ['gsap', 'three'],
          'utils-vendor': ['dayjs', 'axios', 'lodash-es']
        },

        // 文件名优化
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },

    // 包体积限制
    chunkSizeWarningLimit: 1000,

    // 压缩优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },

    // 源码映射 (生产环境关闭)
    sourcemap: false
  },

  plugins: [
    splitVendorChunkPlugin(),
    visualizer({
      filename: 'dist/report.html',
      open: true,
      gzipSize: true
    })
  ]
})
```

#### 图片压缩和优化
```javascript
// vite.config.js 图片优化
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  plugins: [
    imagetools({
      // 自动生成多格式和尺寸
      defaultDirectives: new URLSearchParams({
        format: 'webp;avif;jpg',
        quality: '80',
        w: '400;800;1200',
        withoutEnlargement: 'true'
      })
    })
  ]
})
```

### CDN和资源分发

#### CDN配置优化
```nginx
# CDN配置示例
location /cdn/ {
  # 设置缓存头
  add_header Cache-Control "public, max-age=31536000, immutable";
  add_header X-Cache-Status $upstream_cache_status;

  # CORS支持
  add_header Access-Control-Allow-Origin *;
  add_header Access-Control-Allow-Methods "GET, OPTIONS";
  add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";

  # Brotli压缩
  brotli on;
  brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  # Gzip压缩
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  # 代理到CDN
  proxy_pass https://cdn.example.com;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## 📊 监控与测量

### 性能监控体系

#### Lighthouse CI集成
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/booking
            http://localhost:3000/center
          configPath: .lighthouserc.json
          uploadArtifacts: true
```

#### 实时性能监控
```typescript
// 性能监控工具
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  startTracking(metricName: string) {
    this.metrics.set(metricName, [])
  }

  recordMetric(metricName: string, value: number) {
    const metrics = this.metrics.get(metricName)
    if (metrics) {
      metrics.push(value)
      // 保留最近100个数据点
      if (metrics.length > 100) {
        metrics.shift()
      }
    }
  }

  getAverage(metricName: string): number {
    const metrics = this.metrics.get(metricName)
    if (!metrics || metrics.length === 0) return 0

    return metrics.reduce((sum, value) => sum + value, 0) / metrics.length
  }

  getMetrics(): Record<string, { average: number; latest: number }> {
    const result: Record<string, { average: number; latest: number }> = {}

    this.metrics.forEach((values, name) => {
      result[name] = {
        average: this.getAverage(name),
        latest: values[values.length - 1] || 0
      }
    })

    return result
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// Core Web Vitals监控
export function trackCoreWebVitals() {
  // FCP (First Contentful Paint)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        performanceMonitor.recordMetric('FCP', entry.startTime)
      }
    }
  }).observe({ entryTypes: ['paint'] })

  // LCP (Largest Contentful Paint)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      performanceMonitor.recordMetric('LCP', entry.startTime)
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] })

  // FID (First Input Delay)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      performanceMonitor.recordMetric('FID', (entry as any).processingStart - entry.startTime)
    }
  }).observe({ entryTypes: ['first-input'] })

  // CLS (Cumulative Layout Shift)
  let clsValue = 0
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value
      }
    }
    performanceMonitor.recordMetric('CLS', clsValue)
  }).observe({ entryTypes: ['layout-shift'] })
}
```

### 错误监控和告警

#### JavaScript错误监控
```typescript
// 全局错误监控
export function setupErrorMonitoring() {
  // JavaScript运行时错误
  window.addEventListener('error', (event) => {
    console.error('JavaScript Error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    })

    // 发送到监控服务
    reportError({
      type: 'javascript_error',
      message: event.message,
      stack: event.error?.stack,
      url: event.filename,
      line: event.lineno,
      column: event.colno
    })
  })

  // 未捕获的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)

    reportError({
      type: 'promise_rejection',
      reason: event.reason
    })
  })

  // Vue错误监控
  const app = createApp(App)
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err, info)

    reportError({
      type: 'vue_error',
      error: err,
      component: instance?.$?.type?.name,
      info: info
    })
  }
}

// 性能告警
export function setupPerformanceAlerts() {
  const checkPerformance = () => {
    const metrics = performanceMonitor.getMetrics()

    // FCP告警
    if (metrics.FCP?.latest > 1800) {
      alertPerformanceIssue('FCP too slow', metrics.FCP.latest)
    }

    // LCP告警
    if (metrics.LCP?.latest > 2500) {
      alertPerformanceIssue('LCP too slow', metrics.LCP.latest)
    }

    // FID告警
    if (metrics.FID?.latest > 100) {
      alertPerformanceIssue('FID too high', metrics.FID.latest)
    }

    // CLS告警
    if (metrics.CLS?.latest > 0.1) {
      alertPerformanceIssue('CLS too high', metrics.CLS.latest)
    }
  }

  // 每分钟检查一次
  setInterval(checkPerformance, 60000)
}
```

---

## 🛠️ 技术实现方案

### 性能预算管理

#### 包体积预算
```javascript
// package.json
{
  "scripts": {
    "build:analyze": "npm run build && npx vite-bundle-analyzer dist",
    "build:check-size": "npm run build && npx bundlesize"
  },
  "bundlesize": [
    {
      "path": "./dist/assets/*.js",
      "maxSize": "500 kB"
    },
    {
      "path": "./dist/assets/*.css",
      "maxSize": "100 kB"
    }
  ]
}
```

#### 性能预算配置
```javascript
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "npm run serve",
      "url": ["http://localhost:3000"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.8}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 渐进式性能优化

#### Phase 1: 基础优化 (Week 1-2)
- [ ] 实现代码分割和懒加载
- [ ] 配置资源压缩和优化
- [ ] 建立性能监控体系

#### Phase 2: 深度优化 (Week 3-6)
- [ ] 优化JavaScript执行性能
- [ ] 改进渲染性能和内存管理
- [ ] 完善动效性能和降级策略

#### Phase 3: 持续优化 (Week 7-12)
- [ ] 实施高级缓存策略
- [ ] 优化网络请求和资源加载
- [ ] 建立自动化性能测试

---

## ✅ 验收标准

### 核心性能指标验收 (100%达成)

#### Core Web Vitals
- [ ] **FCP (First Contentful Paint)**: <1.8秒 (良好)
- [ ] **LCP (Largest Contentful Paint)**: <2.5秒 (良好)
- [ ] **FID (First Input Delay)**: <100ms (良好)
- [ ] **CLS (Cumulative Layout Shift)**: <0.1 (良好)

#### Lighthouse评分
- [ ] **性能评分**: ≥90分
- [ ] **可访问性评分**: ≥90分
- [ ] **最佳实践评分**: ≥90分
- [ ] **SEO评分**: ≥85分

### 运行时性能验收 (100%达成)

#### JavaScript性能
- [ ] **脚本执行时间**: <100ms
- [ ] **JavaScript堆内存**: <100MB
- [ ] **垃圾回收暂停**: <50ms
- [ ] **异步操作响应**: <50ms

#### 渲染性能
- [ ] **帧率稳定性**: 60FPS持续
- [ ] **布局重绘频率**: <10次/秒
- [ ] **合成层数量**: <20个
- [ ] **GPU内存使用**: <50MB

### 动效性能验收 (100%达成)

#### Three.js性能
- [ ] **渲染帧率**: ≥50FPS (复杂场景)
- [ ] **内存使用**: <200MB (持续运行)
- [ ] **加载时间**: <2秒 (首屏3D内容)
- [ ] **兼容性**: 支持80%目标设备

#### GSAP动效
- [ ] **动画流畅度**: 60FPS稳定
- [ ] **CPU使用率**: <30% (动效期间)
- [ ] **内存占用**: <50MB增加
- [ ] **降级效果**: 低端设备平滑降级

### 资源优化验收 (100%达成)

#### 包体积优化
- [ ] **首屏包体积**: <200KB (gzip压缩)
- [ ] **总包体积**: <800KB (gzip压缩)
- [ ] **代码分割**: 动态导入≥80%非关键代码
- [ ] **资源压缩**: 图片压缩率≥70%

#### 缓存和网络
- [ ] **缓存命中率**: >80% (静态资源)
- [ ] **网络请求数**: <30个/页面
- [ ] **CDN响应时间**: <200ms
- [ ] **离线功能**: 核心功能离线可用

### 监控体系验收 (100%达成)

#### 自动化监控
- [ ] **Lighthouse CI**: 集成到CI/CD流程
- [ ] **性能监控**: 实时监控关键指标
- [ ] **错误监控**: 捕获并报告JavaScript错误
- [ ] **用户体验监控**: RUM (Real User Monitoring)

#### 告警系统
- [ ] **性能告警**: 关键指标超标自动告警
- [ ] **错误告警**: JavaScript错误率超标告警
- [ ] **可用性告警**: 页面加载失败告警
- [ ] **趋势分析**: 性能趋势异常检测

---

## 📅 实施计划

### 第一阶段：紧急修复 (Week 1)

#### 目标
解决影响用户体验的关键性能问题

#### 任务清单
- [ ] 修复首屏加载性能问题
- [ ] 优化Three.js内存泄漏
- [ ] 配置基础代码分割
- [ ] 建立性能监控体系

#### 验收标准
- 首屏加载时间减少30%
- 内存泄漏问题解决
- 基础性能监控上线

### 第二阶段：系统优化 (Week 2-4)

#### 目标
全面提升系统性能表现

#### 任务清单
- [ ] 实现完整的代码分割策略
- [ ] 优化图片和资源加载
- [ ] 改进动效性能和降级
- [ ] 完善缓存策略

#### 验收标准
- Lighthouse性能评分>85
- 所有Core Web Vitals达标
- 动效性能稳定在60FPS

### 第三阶段：持续改进 (Week 5-8)

#### 目标
建立长期性能优化机制

#### 任务清单
- [ ] 实施高级性能优化技术
- [ ] 建立自动化性能测试
- [ ] 完善监控和告警系统
- [ ] 开展性能优化培训

#### 验收标准
- 性能监控体系完整
- 自动化测试覆盖所有场景
- 团队性能优化能力提升

---

## 📚 相关文档

### 参考资料
- [Web Performance Best Practices](https://developers.google.com/web/fundamentals/performance) - Google性能最佳实践
- [Core Web Vitals](https://web.dev/vitals/) - 核心网页指标
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse) - Lighthouse性能审计工具

### 技术文档
- [Vite Build Optimization](https://vitejs.dev/guide/build.html) - Vite构建优化
- [Three.js Performance Tips](https://threejs.org/docs/#manual/en/introduction/Performance-tips) - Three.js性能优化
- [Vue Performance Guide](https://vuejs.org/guide/best-practices/performance.html) - Vue性能指南

---

## 📝 备注

### 技术债务考虑
- 当前Three.js集成可能需要重构以支持更好的性能控制
- Vue 3响应式系统在大型应用中可能需要优化策略
- 移动端兼容性需要持续关注和优化

### 风险评估
- **高风险**：动效性能优化可能影响视觉效果
- **中风险**：代码分割可能引入新的复杂性
- **低风险**：监控系统实施相对独立

### 成功指标
- **用户体验提升**：页面加载时间减少50%，交互响应提升60%
- **技术指标改善**：Lighthouse评分提升至95+，内存使用减少40%
- **业务价值**：转化率提升15-20%，用户满意度提升25%

---

*本需求文档基于系统问题分析报告制定，旨在解决健身房综合管理系统性能方面存在的问题。实施过程中应遵循渐进式优化原则，确保在提升性能的同时不影响现有功能的用户体验。*
