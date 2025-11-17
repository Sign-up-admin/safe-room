import { vi } from 'vitest'

// Mock Element Plus components
const ElButton = {
  name: 'ElButton',
  props: {
    type: { type: String, default: 'default' },
    size: { type: String, default: 'default' },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  },
  template: '<button :class="buttonClass" @click="$emit(\'click\')"><slot /></button>',
  computed: {
    buttonClass() {
      return ['el-button', `el-button--${this.type}`, `el-button--${this.size}`]
    }
  }
}

const ElInput = {
  name: 'ElInput',
  props: {
    modelValue: { type: [String, Number], default: '' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false }
  },
  template: '<input :value="modelValue" :placeholder="placeholder" :disabled="disabled" :readonly="readonly" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  emits: ['update:modelValue']
}

const ElTable = {
  name: 'ElTable',
  props: {
    data: { type: Array, default: () => [] },
    stripe: { type: Boolean, default: false },
    border: { type: Boolean, default: false },
    size: { type: String, default: 'default' }
  },
  template: '<table class="el-table"><tbody><slot /></tbody></table>'
}

const ElTableColumn = {
  name: 'ElTableColumn',
  props: {
    prop: { type: String, default: '' },
    label: { type: String, default: '' },
    width: { type: [String, Number], default: '' },
    minWidth: { type: [String, Number], default: '' }
  },
  template: '<col :style="{ width: width + \'px\', minWidth: minWidth + \'px\' }" />'
}

const ElForm = {
  name: 'ElForm',
  props: {
    model: { type: Object, default: () => ({}) },
    rules: { type: Object, default: () => ({}) },
    labelWidth: { type: [String, Number], default: '80px' }
  },
  template: '<form class="el-form"><slot /></form>'
}

const ElFormItem = {
  name: 'ElFormItem',
  props: {
    label: { type: String, default: '' },
    prop: { type: String, default: '' },
    required: { type: Boolean, default: false }
  },
  template: '<div class="el-form-item"><label v-if="label">{{ label }}</label><slot /></div>'
}

const ElDialog = {
  name: 'ElDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
    width: { type: [String, Number], default: '50%' },
    center: { type: Boolean, default: false }
  },
  template: '<div v-if="modelValue" class="el-dialog"><div class="el-dialog__header"><span>{{ title }}</span></div><div class="el-dialog__body"><slot /></div></div>',
  emits: ['update:modelValue']
}

const ElMenu = {
  name: 'ElMenu',
  props: {
    mode: { type: String, default: 'vertical' },
    collapse: { type: Boolean, default: false },
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#303133' },
    activeTextColor: { type: String, default: '#409eff' }
  },
  template: '<ul class="el-menu"><slot /></ul>'
}

const ElMenuItem = {
  name: 'ElMenuItem',
  props: {
    index: { type: String, required: true },
    disabled: { type: Boolean, default: false }
  },
  template: '<li class="el-menu-item" @click="$emit(\'click\')"><slot /></li>',
  emits: ['click']
}

const ElSubMenu = {
  name: 'ElSubMenu',
  props: {
    index: { type: String, required: true },
    disabled: { type: Boolean, default: false }
  },
  template: '<li class="el-submenu"><div class="el-submenu__title"><slot name="title" /></div><ul class="el-menu"><slot /></ul></li>'
}

// Additional components for admin interface
const ElSelect = {
  name: 'ElSelect',
  props: {
    modelValue: { type: [String, Number, Array], default: '' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false }
  },
  template: '<select :value="modelValue" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
  emits: ['update:modelValue']
}

const ElOption = {
  name: 'ElOption',
  props: {
    value: { type: [String, Number], required: true },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
  },
  template: '<option :value="value" :disabled="disabled">{{ label || value }}</option>'
}

const ElPagination = {
  name: 'ElPagination',
  props: {
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 10 },
    total: { type: Number, default: 0 },
    layout: { type: String, default: 'prev, pager, next' }
  },
  template: '<div class="el-pagination"><slot /></div>',
  emits: ['current-change', 'size-change']
}

const ElBreadcrumb = {
  name: 'ElBreadcrumb',
  props: {
    separator: { type: String, default: '/' }
  },
  template: '<div class="el-breadcrumb"><slot /></div>'
}

const ElBreadcrumbItem = {
  name: 'ElBreadcrumbItem',
  props: {
    to: { type: [String, Object], default: '' }
  },
  template: '<span class="el-breadcrumb__item"><slot /></span>'
}

// Mock Element Plus services
const ElMessage = {
  success: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  closeAll: vi.fn()
}

const ElMessageBox = {
  alert: vi.fn().mockResolvedValue(),
  confirm: vi.fn().mockResolvedValue(),
  prompt: vi.fn().mockResolvedValue()
}

const ElNotification = {
  success: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  closeAll: vi.fn()
}

const ElLoading = {
  service: vi.fn(() => ({
    close: vi.fn()
  }))
}

// Main Element Plus mock
const ElementPlus = {
  install: vi.fn((app) => {
    // Register components
    app.component('ElButton', ElButton)
    app.component('ElInput', ElInput)
    app.component('ElTable', ElTable)
    app.component('ElTableColumn', ElTableColumn)
    app.component('ElForm', ElForm)
    app.component('ElFormItem', ElFormItem)
    app.component('ElDialog', ElDialog)
    app.component('ElMenu', ElMenu)
    app.component('ElMenuItem', ElMenuItem)
    app.component('ElSubMenu', ElSubMenu)
    app.component('ElSelect', ElSelect)
    app.component('ElOption', ElOption)
    app.component('ElPagination', ElPagination)
    app.component('ElBreadcrumb', ElBreadcrumb)
    app.component('ElBreadcrumbItem', ElBreadcrumbItem)

    // Register kebab-case versions
    app.component('ElButton', ElButton)
    app.component('ElInput', ElInput)
    app.component('ElTable', ElTable)
    app.component('ElTableColumn', ElTableColumn)
    app.component('ElForm', ElForm)
    app.component('ElFormItem', ElFormItem)
    app.component('ElDialog', ElDialog)
    app.component('ElMenu', ElMenu)
    app.component('ElMenuItem', ElMenuItem)
    app.component('ElSubmenu', ElSubMenu)
    app.component('ElSelect', ElSelect)
    app.component('ElOption', ElOption)
    app.component('ElPagination', ElPagination)
    app.component('ElBreadcrumb', ElBreadcrumb)
    app.component('ElBreadcrumbItem', ElBreadcrumbItem)
  }),

  // Export components
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

  // Export services
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElLoading
}

export default ElementPlus

// Named exports
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
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElLoading
}
