<template>
  <div class="layout app-dark-bg">
    <div class="layout__backdrop" aria-hidden="true"></div>
    <header class="layout__header">
      <div class="layout__logo" @click="go('/index/home')">
        <div class="layout__logo-mark">
          <span></span>
        </div>
        <div>
          <p class="layout__logo-eyebrow">NEO GYM</p>
          <strong>智能健身房</strong>
        </div>
      </div>
      <nav class="layout__nav">
        <button
          v-for="item in navItems"
          :key="item.url"
          :class="['layout__nav-item', { 'layout__nav-item--active': isActive(item.url) }]"
          @click="go(item.url)"
        >
          <span>{{ item.name }}</span>
          <i class="layout__nav-indicator"></i>
        </button>
      </nav>
      <div class="layout__actions">
        <button
          :class="['layout__nav-item', { 'layout__nav-item--active': isActive('/index/storeup') }]"
          @click="go('/index/storeup')"
        >
          <span>我的收藏</span>
          <i class="layout__nav-indicator"></i>
        </button>
        <button class="yellow-button layout__cta" @click="handleAuth">
          {{ isLoggedIn ? '个人中心' : '立即登录' }}
        </button>
      </div>
    </header>

    <main class="layout__body">
      <router-view />
    </main>

    <footer class="layout__footer">
      <div class="layout__footer-row">
        <div>
          <p class="layout__logo-eyebrow">POWER YOUR DAY</p>
          <strong>Stronger Every Day.</strong>
        </div>
        <div class="layout__footer-links">
          <a @click.prevent="go('/index/news')">品牌资讯</a>
          <a @click.prevent="go('/index/jianshenkecheng')">课程体系</a>
          <a @click.prevent="go('/index/center')">会员服务</a>
        </div>
      </div>
      <hr class="panel-divider" />
      <p>© {{ currentYear }} 智能健身房 · 健康 · 科技 · 力量</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import config from '@/config/config'

const router = useRouter()
const route = useRoute()
const navItems = config.indexNav
const currentYear = new Date().getFullYear()

const isLoggedIn = computed(() => !!localStorage.getItem('frontToken'))

function go(url: string) {
  // 确保路径格式正确
  const targetPath = url.startsWith('/') ? url : `/${url}`
  
  // 如果已经在目标路径，不重复跳转
  if (route.path === targetPath) return
  
  // 执行路由跳转
  router.push(targetPath).catch((err) => {
    // 忽略重复导航错误
    if (err.name !== 'NavigationDuplicated') {
      console.error('路由跳转失败:', err, '目标路径:', targetPath, '当前路径:', route.path)
    }
  })
}

function handleAuth() {
  if (isLoggedIn.value) {
    router.push('/index/center')
  } else {
    router.push('/login')
  }
}

function isActive(url: string) {
  // 精确匹配
  if (route.path === url) return true
  // 匹配子路由，如 /index/jianshenjiaolian 应该匹配 /index/jianshenjiaolianDetail
  // 但要确保是完整的路径段匹配，避免误匹配
  if (route.path.startsWith(url + '/') || route.path.startsWith(url + 'Detail') || route.path.startsWith(url + 'Add')) {
    return true
  }
  return false
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.layout {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--color-text-primary);
}

.layout__backdrop {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(253, 216, 53, 0.12), transparent 35%),
    radial-gradient(circle at 80% 0%, rgba(253, 216, 53, 0.18), transparent 45%),
    radial-gradient(circle at 50% 80%, rgba(253, 216, 53, 0.1), transparent 40%),
    linear-gradient(120deg, rgba(12, 12, 12, 0.9), rgba(2, 2, 2, 0.95));
  z-index: 0;
}

.layout__header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 4vw;
  margin: 12px 4vw;
  border-radius: 999px;
  background: rgba(6, 6, 6, 0.8);
  border: 1px solid rgba(253, 216, 53, 0.12);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}

.layout__logo {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;

  &-mark {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    background: linear-gradient(140deg, rgba(253, 216, 53, 0.25), rgba(253, 216, 53, 0));
    border: 1px solid rgba(253, 216, 53, 0.4);
    display: grid;
    place-items: center;

    span {
      width: 18px;
      height: 18px;
      border: 2px solid #fdd835;
      border-radius: 6px;
      box-shadow: 0 0 12px rgba(253, 216, 53, 0.6);
    }
  }

  strong {
    font-size: 1rem;
    letter-spacing: 0.3em;
  }
}

.layout__logo-eyebrow {
  margin: 0;
  @include section-eyebrow;
}

.layout__nav {
  display: flex;
  gap: 12px;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

.layout__nav-item {
  position: relative;
  border: none;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 18px;
  padding: 10px 20px;
  color: var(--color-text-secondary);
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: var(--transition-base);
  overflow: hidden;

  span {
    position: relative;
    z-index: 1;
  }

  .layout__nav-indicator {
    position: absolute;
    inset: auto auto 0 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(253, 216, 53, 0.8), transparent);
    opacity: 0;
    transition: var(--transition-base);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, rgba(253, 216, 53, 0.18), transparent 55%);
    opacity: 0;
    transition: var(--transition-base);
  }

  &--active,
  &:hover {
    color: var(--color-text-primary);
    transform: translateY(-2px);

    .layout__nav-indicator {
      opacity: 1;
    }

    &::before {
      opacity: 1;
    }
  }
}

.layout__actions {
  display: flex;
  gap: 12px;
  align-items: center;
}


.layout__cta {
  min-width: 180px;
}

.layout__body {
  position: relative;
  z-index: 1;
  flex: 1;
  padding-bottom: 60px;
}

.layout__footer {
  position: relative;
  z-index: 1;
  padding: 48px 4vw 32px;
  background: rgba(5, 5, 5, 0.9);
  border-top: 1px solid rgba(253, 216, 53, 0.18);
  margin-top: auto;

  p {
    margin: 0;
    color: var(--color-text-secondary);
  }
}

.layout__footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

.layout__footer-links {
  display: flex;
  gap: 24px;

  a {
    color: var(--color-text-primary);
    text-decoration: none;
    letter-spacing: 0.2em;
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition-base);

    &:hover {
      color: var(--color-yellow);
    }
  }
}

@media (max-width: 1024px) {
  .layout__header {
    flex-direction: column;
    border-radius: 32px;
  }

  .layout__nav {
    width: 100%;
  }

  .layout__footer-row {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 640px) {
  .layout__header {
    margin: 12px;
    padding: 18px;
  }

  .layout__nav-item {
    flex: 1 1 calc(50% - 12px);
    text-align: center;
  }

  .layout__actions {
    flex-direction: column;
    width: 100%;

    .layout__cta {
      width: 100%;
    }
  }
}
</style>

