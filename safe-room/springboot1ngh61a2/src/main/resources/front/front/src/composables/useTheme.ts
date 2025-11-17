import { ref, watch, onMounted, readonly } from 'vue'

export type ThemeType = 'dark' | 'light' | 'blue'

const THEME_KEY = 'app-theme'
const currentTheme = ref<ThemeType>('dark')

// 主题配置
const themeConfigs: Record<ThemeType, Record<string, string>> = {
  dark: {
    '--tech-color-bg-deep': '#020202',
    '--tech-color-bg-dark': '#0a0a0a',
    '--tech-color-panel': 'rgba(10, 10, 10, 0.78)',
    '--tech-color-panel-strong': 'rgba(8, 8, 8, 0.92)',
    '--tech-color-panel-ghost': 'rgba(255, 255, 255, 0.04)',
    '--tech-color-yellow': '#fdd835',
    '--tech-color-yellow-soft': 'rgba(253, 216, 53, 0.2)',
    '--tech-color-yellow-glow': 'rgba(253, 216, 53, 0.35)',
    '--tech-color-text-primary': '#f7fbea',
    '--tech-color-text-secondary': '#9ea1a6',
    '--tech-color-text-muted': '#6f737c',
    '--tech-color-border': 'rgba(253, 216, 53, 0.22)',
    '--tech-color-divider': 'rgba(255, 255, 255, 0.08)',
  },
  light: {
    '--tech-color-bg-deep': '#f8f9fa',
    '--tech-color-bg-dark': '#ffffff',
    '--tech-color-panel': 'rgba(255, 255, 255, 0.9)',
    '--tech-color-panel-strong': 'rgba(255, 255, 255, 0.95)',
    '--tech-color-panel-ghost': 'rgba(0, 0, 0, 0.04)',
    '--tech-color-yellow': '#1976d2',
    '--tech-color-yellow-soft': 'rgba(25, 118, 210, 0.1)',
    '--tech-color-yellow-glow': 'rgba(25, 118, 210, 0.25)',
    '--tech-color-text-primary': '#1a1a1a',
    '--tech-color-text-secondary': '#616161',
    '--tech-color-text-muted': '#9e9e9e',
    '--tech-color-border': 'rgba(25, 118, 210, 0.3)',
    '--tech-color-divider': 'rgba(0, 0, 0, 0.12)',
  },
  blue: {
    '--tech-color-bg-deep': '#0f1419',
    '--tech-color-bg-dark': '#1a1d21',
    '--tech-color-panel': 'rgba(26, 29, 33, 0.8)',
    '--tech-color-panel-strong': 'rgba(26, 29, 33, 0.95)',
    '--tech-color-panel-ghost': 'rgba(255, 255, 255, 0.04)',
    '--tech-color-yellow': '#1da1f2',
    '--tech-color-yellow-soft': 'rgba(29, 161, 242, 0.1)',
    '--tech-color-yellow-glow': 'rgba(29, 161, 242, 0.3)',
    '--tech-color-text-primary': '#f7f9fa',
    '--tech-color-text-secondary': '#8b98a5',
    '--tech-color-text-muted': '#5b7083',
    '--tech-color-border': 'rgba(29, 161, 242, 0.25)',
    '--tech-color-divider': 'rgba(255, 255, 255, 0.08)',
  }
}

// 应用主题到DOM
function applyTheme(theme: ThemeType) {
  const root = document.documentElement
  const config = themeConfigs[theme]

  Object.entries(config).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })

  // 更新body类名
  document.body.className = document.body.className.replace(/theme-\w+/g, '').trim()
  document.body.classList.add(`theme-${theme}`)
}

// 从本地存储加载主题
function loadTheme(): ThemeType {
  const saved = localStorage.getItem(THEME_KEY) as ThemeType
  return saved && Object.keys(themeConfigs).includes(saved) ? saved : 'dark'
}

// 保存主题到本地存储
function saveTheme(theme: ThemeType) {
  localStorage.setItem(THEME_KEY, theme)
}

// 初始化主题
function initTheme() {
  const savedTheme = loadTheme()
  currentTheme.value = savedTheme
  applyTheme(savedTheme)
}

export function useTheme() {
  // 初始化主题
  onMounted(() => {
    initTheme()
  })

  // 监听主题变化并应用
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme)
    saveTheme(newTheme)
  })

  const setTheme = (theme: ThemeType) => {
    currentTheme.value = theme
  }

  const toggleTheme = () => {
    const themes: ThemeType[] = ['dark', 'light', 'blue']
    const currentIndex = themes.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return {
    currentTheme: readonly(currentTheme),
    setTheme,
    toggleTheme,
    themes: Object.keys(themeConfigs) as ThemeType[]
  }
}
