import { ref, onMounted, onUnmounted, type Ref } from 'vue'

// 键盘导航方向
export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'home' | 'end'

// 键盘导航选项
export interface KeyboardNavigationOptions {
  loop?: boolean // 是否循环导航
  vertical?: boolean // 是否垂直导航
  horizontal?: boolean // 是否水平导航
  activateOnFocus?: boolean // 聚焦时是否激活
  preventDefault?: boolean // 是否阻止默认行为
  onNavigate?: (direction: NavigationDirection, currentIndex: number) => void
  onActivate?: (index: number) => void
}

export function useKeyboardNavigation(
  itemsRef: Ref<HTMLElement[]>,
  options: KeyboardNavigationOptions = {}
) {
  const {
    loop = true,
    vertical = true,
    horizontal = false,
    activateOnFocus = false,
    preventDefault = true,
    onNavigate,
    onActivate
  } = options

  const currentIndex = ref(0)
  const isActive = ref(false)

  // 设置焦点到指定项目
  const focusItem = (index: number) => {
    if (index < 0 || index >= itemsRef.value.length) return

    currentIndex.value = index
    const element = itemsRef.value[index]
    if (element) {
      element.focus()
      if (activateOnFocus) {
        onActivate?.(index)
      }
    }
  }

  // 导航到下一个项目
  const navigateNext = () => {
    let nextIndex = currentIndex.value + 1
    if (nextIndex >= itemsRef.value.length) {
      nextIndex = loop ? 0 : currentIndex.value
    }
    focusItem(nextIndex)
    onNavigate?.('down', nextIndex)
  }

  // 导航到上一个项目
  const navigatePrevious = () => {
    let prevIndex = currentIndex.value - 1
    if (prevIndex < 0) {
      prevIndex = loop ? itemsRef.value.length - 1 : currentIndex.value
    }
    focusItem(prevIndex)
    onNavigate?.('up', prevIndex)
  }

  // 导航到第一个项目
  const navigateFirst = () => {
    focusItem(0)
    onNavigate?.('home', 0)
  }

  // 导航到最后一个项目
  const navigateLast = () => {
    const lastIndex = itemsRef.value.length - 1
    focusItem(lastIndex)
    onNavigate?.('end', lastIndex)
  }

  // 处理键盘事件
  const handleKeydown = (event: KeyboardEvent) => {
    if (!isActive.value) return

    let handled = false

    switch (event.key) {
      case 'ArrowDown':
        if (vertical) {
          navigateNext()
          handled = true
        }
        break
      case 'ArrowUp':
        if (vertical) {
          navigatePrevious()
          handled = true
        }
        break
      case 'ArrowRight':
        if (horizontal) {
          navigateNext()
          handled = true
        }
        break
      case 'ArrowLeft':
        if (horizontal) {
          navigatePrevious()
          handled = true
        }
        break
      case 'Home':
        navigateFirst()
        handled = true
        break
      case 'End':
        navigateLast()
        handled = true
        break
      case 'Enter':
      case ' ':
        onActivate?.(currentIndex.value)
        handled = true
        break
    }

    if (handled && preventDefault) {
      event.preventDefault()
    }
  }

  // 激活键盘导航
  const activate = () => {
    isActive.value = true
  }

  // 停用键盘导航
  const deactivate = () => {
    isActive.value = false
  }

  // 设置当前索引
  const setCurrentIndex = (index: number) => {
    currentIndex.value = index
  }

  // 监听键盘事件
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    currentIndex,
    isActive,
    focusItem,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    activate,
    deactivate,
    setCurrentIndex
  }
}

// =================================
// 日历键盘导航
// =================================

export function useCalendarKeyboardNavigation(calendarRef: Ref<HTMLElement | null>) {
  const selectedDate = ref<Date | null>(null)
  const focusedDate = ref<Date | null>(null)

  const {
    currentIndex,
    focusItem,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    activate
  } = useKeyboardNavigation(ref([]), {
    loop: false,
    vertical: true,
    horizontal: true,
    onNavigate: (direction, index) => {
      // 更新聚焦日期
      updateFocusedDate(direction)
    },
    onActivate: (index) => {
      // 选择日期
      if (focusedDate.value) {
        selectedDate.value = focusedDate.value
      }
    }
  })

  const updateFocusedDate = (direction: NavigationDirection) => {
    if (!focusedDate.value) {
      focusedDate.value = new Date()
      return
    }

    const current = focusedDate.value
    let newDate = new Date(current)

    switch (direction) {
      case 'up':
        newDate.setDate(current.getDate() - 7)
        break
      case 'down':
        newDate.setDate(current.getDate() + 7)
        break
      case 'left':
        newDate.setDate(current.getDate() - 1)
        break
      case 'right':
        newDate.setDate(current.getDate() + 1)
        break
      case 'home':
        newDate = new Date(current.getFullYear(), current.getMonth(), 1)
        break
      case 'end':
        newDate = new Date(current.getFullYear(), current.getMonth() + 1, 0)
        break
    }

    focusedDate.value = newDate
  }

  const focusDate = (date: Date) => {
    focusedDate.value = date
    selectedDate.value = date
  }

  const selectDate = (date: Date) => {
    selectedDate.value = date
    focusedDate.value = date
  }

  return {
    selectedDate,
    focusedDate,
    focusDate,
    selectDate,
    activate
  }
}

// =================================
// 表格键盘导航
// =================================

export interface TableNavigationOptions extends KeyboardNavigationOptions {
  rows: number
  cols: number
  onCellNavigate?: (row: number, col: number) => void
  onCellActivate?: (row: number, col: number) => void
}

export function useTableKeyboardNavigation(
  tableRef: Ref<HTMLElement | null>,
  options: TableNavigationOptions
) {
  const { rows, cols, onCellNavigate, onCellActivate, ...navOptions } = options

  const currentRow = ref(0)
  const currentCol = ref(0)

  const {
    focusItem,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    activate
  } = useKeyboardNavigation(ref([]), {
    ...navOptions,
    loop: false,
    onNavigate: (direction) => {
      navigateCell(direction)
    },
    onActivate: () => {
      onCellActivate?.(currentRow.value, currentCol.value)
    }
  })

  const navigateCell = (direction: NavigationDirection) => {
    let newRow = currentRow.value
    let newCol = currentCol.value

    switch (direction) {
      case 'up':
        newRow = Math.max(0, currentRow.value - 1)
        break
      case 'down':
        newRow = Math.min(rows - 1, currentRow.value + 1)
        break
      case 'left':
        newCol = Math.max(0, currentCol.value - 1)
        break
      case 'right':
        newCol = Math.min(cols - 1, currentCol.value + 1)
        break
      case 'home':
        newRow = 0
        newCol = 0
        break
      case 'end':
        newRow = rows - 1
        newCol = cols - 1
        break
    }

    if (newRow !== currentRow.value || newCol !== currentCol.value) {
      currentRow.value = newRow
      currentCol.value = newCol
      onCellNavigate?.(newRow, newCol)
      focusCell(newRow, newCol)
    }
  }

  const focusCell = (row: number, col: number) => {
    if (!tableRef.value) return

    const cellSelector = `[data-row="${row}"][data-col="${col}"]`
    const cell = tableRef.value.querySelector(cellSelector) as HTMLElement
    if (cell) {
      cell.focus()
    }
  }

  const setCurrentCell = (row: number, col: number) => {
    currentRow.value = row
    currentCol.value = col
    focusCell(row, col)
  }

  return {
    currentRow,
    currentCol,
    focusCell,
    setCurrentCell,
    navigateCell,
    activate
  }
}

// =================================
// 步骤条键盘导航
// =================================

export function useStepperKeyboardNavigation(
  stepperRef: Ref<HTMLElement | null>,
  totalSteps: number
) {
  const currentStep = ref(0)

  const {
    focusItem,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    activate
  } = useKeyboardNavigation(ref([]), {
    loop: false,
    vertical: false,
    horizontal: true,
    onNavigate: (direction, index) => {
      currentStep.value = index
    },
    onActivate: (index) => {
      // 可以触发步骤切换逻辑
      console.log(`Activated step ${index + 1}`)
    }
  })

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      currentStep.value = stepIndex
      focusItem(stepIndex)
    }
  }

  const nextStep = () => {
    if (currentStep.value < totalSteps - 1) {
      navigateNext()
    }
  }

  const previousStep = () => {
    if (currentStep.value > 0) {
      navigatePrevious()
    }
  }

  return {
    currentStep,
    goToStep,
    nextStep,
    previousStep,
    activate
  }
}

// =================================
// 通用键盘快捷键
// =================================

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  handler: () => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeydown = (event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      if (
        event.key === shortcut.key &&
        !!event.ctrlKey === !!shortcut.ctrlKey &&
        !!event.altKey === !!shortcut.altKey &&
        !!event.shiftKey === !!shortcut.shiftKey
      ) {
        event.preventDefault()
        shortcut.handler()
        break
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    // 返回快捷键列表，用于显示帮助信息
    shortcuts
  }
}
