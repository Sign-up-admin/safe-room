import { vi } from 'vitest'
import {
  createComponentMocks,
  createServiceMocks,
  createElementPlusMock
} from '../utils/mocks/element-plus.mock'

// Use unified mock factory functions
const componentMocks = createComponentMocks()
const serviceMocks = createServiceMocks()
const elementPlusMock = createElementPlusMock()

// Extract individual components for backward compatibility
const {
  ElButton,
  ElInput,
  ElTable,
  ElTableColumn,
  ElForm,
  ElFormItem,
  ElDialog,
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElSelect,
  ElOption,
  ElPagination,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElContainer,
  ElHeader,
  ElAside,
  ElMain,
  ElFooter,
  ElRow,
  ElCol,
  ElCard,
  ElCheckbox,
  ElRadio,
  ElRadioGroup,
  ElRadioButton,
  ElInputNumber,
  ElSwitch,
  ElRate,
  ElSlider,
  ElDatePicker,
  ElTimePicker,
  ElColorPicker,
  ElCascader,
  ElTransfer,
  ElTreeSelect,
  ElTag,
  ElDescriptions,
  ElDescriptionsItem,
  ElAvatar,
  ElImage,
  ElIcon,
  ElText,
  ElStatistic,
  ElCountdown,
  ElCalendar,
  ElProgress,
  ElTree,
  ElTabs,
  ElTabPane,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElSteps,
  ElStep,
  ElPopover,
  ElTooltip,
  ElResult,
  ElEmpty,
  ElAlert,
  ElDivider,
  ElSpace,
  ElCollapse,
  ElCollapseItem,
  ElUpload
} = componentMocks

const { ElMessage, ElMessageBox, ElNotification, ElLoading } = serviceMocks

// Main Element Plus mock using unified factory
const ElementPlus = {
  install: vi.fn((app) => {
    // Register all components using the unified mock
    Object.entries(componentMocks).forEach(([name, component]) => {
      app.component(name, component)
      // Also register kebab-case versions
      const kebabName = name.replace(/([A-Z])/g, '-$1').toLowerCase()
      app.component(kebabName, component)
    })
  }),

  // Export components
  ...componentMocks,

  // Export services
  ...serviceMocks
}

export default ElementPlus

// Named exports for backward compatibility
export {
  ElButton,
  ElInput,
  ElTable,
  ElTableColumn,
  ElForm,
  ElFormItem,
  ElDialog,
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElSelect,
  ElOption,
  ElPagination,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElContainer,
  ElHeader,
  ElAside,
  ElMain,
  ElFooter,
  ElRow,
  ElCol,
  ElCard,
  ElCheckbox,
  ElRadio,
  ElRadioGroup,
  ElRadioButton,
  ElInputNumber,
  ElSwitch,
  ElRate,
  ElSlider,
  ElDatePicker,
  ElTimePicker,
  ElColorPicker,
  ElCascader,
  ElTransfer,
  ElTreeSelect,
  ElTag,
  ElDescriptions,
  ElDescriptionsItem,
  ElAvatar,
  ElImage,
  ElIcon,
  ElText,
  ElStatistic,
  ElCountdown,
  ElCalendar,
  ElProgress,
  ElTree,
  ElTabs,
  ElTabPane,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElSteps,
  ElStep,
  ElPopover,
  ElTooltip,
  ElResult,
  ElEmpty,
  ElAlert,
  ElDivider,
  ElSpace,
  ElCollapse,
  ElCollapseItem,
  ElUpload,
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElLoading
}
