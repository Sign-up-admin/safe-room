<template>
  <header class="smart-header" :class="[`smart-header--${theme}`, { 'smart-header--condensed': isCondensed }]">
    <div class="smart-header__inner">
      <div ref="logoRef" class="smart-header__logo">
        <slot name="logo">
          <span class="smart-header__logo-text">GYM TECH</span>
        </slot>
      </div>

      <!-- 桌面端导航 -->
      <nav class="smart-header__nav smart-header__nav--desktop">
        <button
          v-for="item in navItems"
          :key="item.label"
          class="smart-header__nav-item"
          @click="$emit('navigate', item)"
          @mouseenter="() => emitHover(item)"
        >
          <span>{{ item.label }}</span>
          <span class="smart-header__nav-energy" />
        </button>
      </nav>

      <!-- 移动端汉堡菜单按钮 -->
      <button
        class="smart-header__mobile-toggle"
        :class="{ 'smart-header__mobile-toggle--active': isMobileMenuOpen }"
        @click="toggleMobileMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <button class="smart-header__cta smart-header__cta--desktop" @click="$emit('cta')">
        <span>加入会员</span>
      </button>

      <!-- 移动端菜单 -->
      <div
        class="smart-header__mobile-menu"
        :class="{ 'smart-header__mobile-menu--open': isMobileMenuOpen }"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <nav class="smart-header__nav smart-header__nav--mobile">
          <button
            v-for="item in navItems"
            :key="item.label"
            class="smart-header__nav-item smart-header__nav-item--mobile"
            @click="handleMobileNavigate(item)"
          >
            <span>{{ item.label }}</span>
          </button>
        </nav>
        <button class="smart-header__cta smart-header__cta--mobile" @click="handleMobileCta">
          <span>加入会员</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'

export interface NavItem {
  label: string
  href?: string
  target?: string
  routeName?: string
}

interface Props {
  theme?: 'dark' | 'light'
  navItems: NavItem[]
  scrollThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'dark',
  scrollThreshold: 40,
})

const emit = defineEmits<{
  (e: 'navigate', item: NavItem): void
  (e: 'cta'): void
  (e: 'hover', item: NavItem): void
}>()
const isCondensed = ref(false)
const isMobileMenuOpen = ref(false)
const logoRef = ref<HTMLDivElement>()
const headerTimeline = ref<gsap.core.Timeline>()

const emitHover = (item: NavItem) => {
  emit('hover', item)
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const handleMobileNavigate = (item: NavItem) => {
  emit('navigate', item)
  isMobileMenuOpen.value = false // 关闭菜单
}

const handleMobileCta = () => {
  emit('cta')
  isMobileMenuOpen.value = false // 关闭菜单
}

// 触摸手势支持
const handleTouchStart = (_e: TouchEvent) => {
  // 可以在这里添加触摸开始的逻辑
}

const handleTouchEnd = (e: TouchEvent) => {
  // 可以在这里添加触摸结束的逻辑，比如滑动关闭菜单
  if (isMobileMenuOpen.value) {
    const touch = e.changedTouches[0]
    const menuElement = e.currentTarget as HTMLElement
    const rect = menuElement.getBoundingClientRect()

    // 如果在菜单区域外触摸，关闭菜单
    if (
      touch.clientX < rect.left ||
      touch.clientX > rect.right ||
      touch.clientY < rect.top ||
      touch.clientY > rect.bottom
    ) {
      isMobileMenuOpen.value = false
    }
  }
}

const handleScroll = () => {
  const shouldCondense = window.scrollY > props.scrollThreshold
  if (shouldCondense !== isCondensed.value) {
    isCondensed.value = shouldCondense
    headerTimeline.value?.to(
      '.smart-header',
      {
        height: shouldCondense ? 60 : 90,
        duration: 0.4,
        ease: 'power2.out',
      },
      0,
    )
  }
}

const theme = computed(() => props.theme)

onMounted(() => {
  headerTimeline.value = gsap.timeline({ paused: true })
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  headerTimeline.value?.kill()
})
</script>

<style scoped lang="scss">
.smart-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 90px;
  padding: 0 48px;
  display: flex;
  align-items: center;
  z-index: 1000;
  transition: background 0.35s ease;
  background: rgba(10, 10, 10, 0.65);
  border-bottom: 1px solid rgba(253, 216, 53, 0.12);

  &--condensed {
    background: rgba(10, 10, 10, 0.92);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  }

  &__inner {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__logo {
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: #fdd835;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__nav {
    display: flex;
    gap: 24px;
  }

  &--desktop {
    display: flex;
  }

  &--mobile {
    flex-direction: column;
    gap: 0;
  }

  &__nav-item {
    position: relative;
    border: none;
    background: transparent;
    color: #f5f5f5;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    padding: 8px 0;
    cursor: pointer;
    overflow: hidden;
    transition: color 0.3s ease;

    &:hover {
      color: #fdd835;
    }

    span:first-child {
      position: relative;
      z-index: 1;
    }

    &--mobile {
      width: 100%;
      padding: 16px 24px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 1rem;

      &:hover {
        background: rgba(253, 216, 53, 0.05);
      }
    }
  }

  &__nav-energy {
    position: absolute;
    bottom: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #fdd835, transparent);
    animation: energy-scan 2.5s linear infinite;
  }

  &__cta {
    min-width: 160px;
    height: 44px;
    border-radius: 999px;
    border: 1px solid rgba(253, 216, 53, 0.65);
    background: radial-gradient(circle, rgba(253, 216, 53, 0.25), rgba(10, 10, 10, 0.8));
    color: #fefefe;
    font-weight: 600;
    letter-spacing: 0.1em;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.35s ease;

    &:before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(253, 216, 53, 0.18);
      animation: pulse 2.2s ease-in-out infinite;
    }

    &:hover {
      transform: translateY(-2px) scale(1.02);
    }

    span {
      position: relative;
      z-index: 1;
    }
  }

  &--desktop {
    display: block;
  }

  &--mobile {
    display: none;
  }

  // 移动端汉堡菜单按钮
  &__mobile-toggle {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.3s ease;

    &:hover {
      background: rgba(253, 216, 53, 0.1);
    }

    span {
      width: 20px;
      height: 2px;
      background: #fdd835;
      margin: 2px 0;
      transition: all 0.3s ease;
      transform-origin: center;
    }

    &--active {
      span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
      }

      span:nth-child(2) {
        opacity: 0;
      }

      span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
      }
    }
  }

  // 移动端菜单
  &__mobile-menu {
    position: fixed;
    top: 90px;
    left: 0;
    width: 100%;
    background: rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(253, 216, 53, 0.12);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 999;

    &--open {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
    }
  }
}

@keyframes energy-scan {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes pulse {
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.65;
  }
  100% {
    opacity: 0.3;
  }
}

@media (max-width: 960px) {
  .smart-header {
    padding: 0 24px;

    &__nav--desktop {
      gap: 12px;
      overflow-x: auto;
    }

    &__cta--desktop {
      min-width: 140px;
      height: 40px;
    }
  }
}

@media (max-width: 640px) {
  .smart-header {
    padding: 0 16px;

    &__inner {
      justify-content: space-between;
    }

    &__nav--desktop {
      display: none;
    }

    &__mobile-toggle {
      display: flex;
    }

    &__cta--desktop {
      display: none;
    }

    &__cta--mobile {
      display: block;
      margin: 20px 24px;
      width: calc(100% - 48px);
    }

    &__mobile-menu {
      top: 60px; // 压缩状态下的高度
    }

    &--condensed &__mobile-menu {
      top: 60px;
    }
  }
}
</style>
