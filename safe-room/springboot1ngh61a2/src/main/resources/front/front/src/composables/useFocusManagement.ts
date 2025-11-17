import { ref, nextTick, type Ref } from 'vue'

// 焦点管理选项
export interface FocusManagementOptions {
  returnFocus?: boolean // 操作完成后是否返回原始焦点
  autoFocus?: boolean   // 是否自动聚焦到指定元素
  trapFocus?: boolean   // 是否在容器内捕获焦点
  initialFocus?: string // 初始聚焦的选择器
  restoreFocus?: boolean // 是否恢复之前的焦点
}

// 焦点堆栈，用于管理焦点历史
const focusStack: HTMLElement[] = []

export function useFocusManagement(containerRef: Ref<HTMLElement | null>, options: FocusManagementOptions = {}) {
  const {
    returnFocus = true,
    autoFocus = false,
    trapFocus = false,
    initialFocus,
    restoreFocus = true
  } = options

  const previousFocus = ref<HTMLElement | null>(null)
  const isActive = ref(false)

  // 保存当前焦点
  const saveFocus = () => {
    if (typeof document !== 'undefined') {
      previousFocus.value = document.activeElement as HTMLElement
      focusStack.push(previousFocus.value)
    }
  }

  // 恢复之前保存的焦点
  const restoreFocusFn = () => {
    if (restoreFocus && focusStack.length > 0) {
      const element = focusStack.pop()
      if (element && typeof element.focus === 'function') {
        element.focus()
      }
    }
  }

  // 设置焦点到指定元素
  const setFocus = async (selector: string) => {
    await nextTick()

    if (!containerRef.value) return

    const element = containerRef.value.querySelector(selector) as HTMLElement
    if (element && typeof element.focus === 'function') {
      element.focus()
    }
  }

  // 设置焦点到容器内的第一个可聚焦元素
  const focusFirst = async () => {
    await nextTick()

    if (!containerRef.value) return

    const focusableElements = containerRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus()
    }
  }

  // 设置焦点到容器内的最后一个可聚焦元素
  const focusLast = async () => {
    await nextTick()

    if (!containerRef.value) return

    const focusableElements = containerRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length > 0) {
      (focusableElements[focusableElements.length - 1] as HTMLElement).focus()
    }
  }

  // 激活焦点管理
  const activate = async () => {
    isActive.value = true
    saveFocus()

    if (autoFocus) {
      if (initialFocus) {
        await setFocus(initialFocus)
      } else {
        await focusFirst()
      }
    }
  }

  // 停用焦点管理
  const deactivate = () => {
    isActive.value = false

    if (returnFocus) {
      restoreFocusFn()
    }
  }

  // 处理Tab键循环（焦点捕获）
  const handleTabKey = (event: KeyboardEvent) => {
    if (!trapFocus || !containerRef.value) return

    const focusableElements = containerRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }
  }

  // 处理Escape键
  const handleEscapeKey = (callback?: () => void) => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (callback) {
          callback()
        } else {
          deactivate()
        }
      }
    }

    return handler
  }

  return {
    isActive,
    previousFocus,
    saveFocus,
    restoreFocus: restoreFocusFn,
    setFocus,
    focusFirst,
    focusLast,
    activate,
    deactivate,
    handleTabKey,
    handleEscapeKey
  }
}

// =================================
// 屏幕阅读器公告系统
// =================================

export interface AnnouncementOptions {
  priority?: 'polite' | 'assertive' // 公告优先级
  clearExisting?: boolean // 是否清除现有公告
}

export function useScreenReaderAnnouncements() {
  const liveRegion = ref<HTMLElement | null>(null)

  // 创建实时区域（如果不存在）
  const createLiveRegion = () => {
    if (typeof document === 'undefined') return

    if (!liveRegion.value) {
      liveRegion.value = document.createElement('div')
      liveRegion.value.setAttribute('aria-live', 'polite')
      liveRegion.value.setAttribute('aria-atomic', 'true')
      liveRegion.value.style.position = 'absolute'
      liveRegion.value.style.left = '-10000px'
      liveRegion.value.style.width = '1px'
      liveRegion.value.style.height = '1px'
      liveRegion.value.style.overflow = 'hidden'

      document.body.appendChild(liveRegion.value)
    }
  }

  // 公告消息
  const announce = (message: string, options: AnnouncementOptions = {}) => {
    const { priority = 'polite', clearExisting = false } = options

    if (typeof document === 'undefined') return

    createLiveRegion()

    if (!liveRegion.value) return

    // 设置公告优先级
    liveRegion.value.setAttribute('aria-live', priority)

    // 清除现有内容（如果需要）
    if (clearExisting) {
      liveRegion.value.textContent = ''
    }

    // 添加新消息
    // 使用微延迟确保屏幕阅读器能够检测到变化
    setTimeout(() => {
      if (liveRegion.value) {
        liveRegion.value.textContent = message
      }
    }, 100)
  }

  // 公告状态变化
  const announceStatus = (status: string, context?: string) => {
    const message = context ? `${context}: ${status}` : status
    announce(message, { priority: 'polite' })
  }

  // 公告错误
  const announceError = (error: string) => {
    announce(`错误: ${error}`, { priority: 'assertive' })
  }

  // 公告成功
  const announceSuccess = (message: string) => {
    announce(`成功: ${message}`, { priority: 'polite' })
  }

  // 公告导航变化
  const announceNavigation = (location: string, action = '导航到') => {
    announce(`${action} ${location}`, { priority: 'polite' })
  }

  // 公告加载状态
  const announceLoading = (item: string, isLoading: boolean) => {
    const status = isLoading ? '正在加载' : '加载完成'
    announce(`${item} ${status}`, { priority: 'polite' })
  }

  return {
    announce,
    announceStatus,
    announceError,
    announceSuccess,
    announceNavigation,
    announceLoading
  }
}

// =================================
// 无障碍路由管理
// =================================

export function useAccessibleRouting() {
  const routeHistory: string[] = []

  // 公告路由变化
  const announceRouteChange = (newRoute: string, oldRoute?: string) => {
    if (typeof document === 'undefined') return

    const pageTitle = document.title || '页面'
    let announcement = `已导航到 ${pageTitle}`

    if (oldRoute) {
      announcement = `从 ${oldRoute} 导航到 ${pageTitle}`
    }

    // 更新路由历史
    routeHistory.push(newRoute)
    if (routeHistory.length > 10) {
      routeHistory.shift() // 保持历史记录在合理范围内
    }

    // 查找并聚焦页面主要标题
    setTimeout(() => {
      const headings = document.querySelectorAll('h1, [role="heading"]')
      if (headings.length > 0) {
        (headings[0] as HTMLElement).focus()
      } else {
        // 如果没有标题，聚焦页面主要内容
        const main = document.querySelector('main, [role="main"]')
        if (main) {
          (main as HTMLElement).focus()
        }
      }
    }, 100)

    // 公告路由变化
    const { announceNavigation } = useScreenReaderAnnouncements()
    announceNavigation(pageTitle, '已导航到')
  }

  // 返回上一页
  const goBack = () => {
    if (routeHistory.length > 1) {
      routeHistory.pop() // 移除当前页面
      const previousRoute = routeHistory[routeHistory.length - 1]

      const { announceNavigation } = useScreenReaderAnnouncements()
      announceNavigation(previousRoute, '返回到')

      return previousRoute
    }
    return null
  }

  return {
    announceRouteChange,
    goBack,
    routeHistory
  }
}
