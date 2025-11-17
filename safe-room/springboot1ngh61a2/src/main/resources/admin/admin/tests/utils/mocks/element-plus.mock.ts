/**
 * Element Plus Mock 工具
 * 提供完整的 Element Plus 组件模拟实现
 */

import { vi } from 'vitest'
import { defineComponent, h } from 'vue'

// Element Plus 组件的类型定义
export interface MockElementPlusComponent {
  name: string
  template?: string
  props?: Record<string, any>
  [key: string]: any
}

export interface MockElementPlusPlugin {
  install(app: any): void
  ElMenu?: MockElementPlusComponent
  ElMenuItem?: MockElementPlusComponent
  ElSubMenu?: MockElementPlusComponent
  ElMenuItemGroup?: MockElementPlusComponent
}

/**
 * 创建 Element Plus 组件 mock
 */
export function createElementPlusMock(): MockElementPlusPlugin {
  const components = {
    ElMenu: {
      name: 'ElMenu',
      template: '<ul><slot /></ul>',
      props: {
        defaultActive: { type: String, default: '' },
        mode: { type: String, default: 'vertical' }
      }
    },
    ElMenuItem: {
      name: 'ElMenuItem',
      template: '<li><slot /></li>',
      props: {
        index: { type: [String, Number], required: true }
      }
    },
    ElSubMenu: {
      name: 'ElSubMenu',
      template: '<li><div><slot name="title" /></div><ul><slot /></ul></li>',
      props: {
        index: { type: [String, Number], required: true }
      }
    },
    ElMenuItemGroup: {
      name: 'ElMenuItemGroup',
      template: '<li><div><slot name="title" /></div><ul><slot /></ul></li>',
      props: {
        title: { type: String, default: '' }
      }
    }
  }

  const plugin: MockElementPlusPlugin = {
    install(app: any) {
      // 注册 PascalCase 版本
      Object.entries(components).forEach(([name, component]) => {
        app.component(name, component)
      })

      // 注册 kebab-case 版本
      app.component('ElMenu', components.ElMenu)
      app.component('ElMenuItem', components.ElMenuItem)
      app.component('ElSubmenu', components.ElSubMenu)
      app.component('ElMenuItemGroup', components.ElMenuItemGroup)
    },
    ...components
  }

  return plugin
}

/**
 * 创建单个 Element Plus 组件 mock
 */
export function createComponentMock(componentName: string, template?: string, props?: Record<string, any>): MockElementPlusComponent {
  return {
    name: componentName,
    template: template || `<div><slot /></div>`,
    props: props || {},
    // 添加组件的其他方法
    setup: vi.fn(),
    render: vi.fn(),
    data: vi.fn(() => ({})),
    methods: {},
    computed: {},
    watch: {}
  }
}

/**
 * 创建支持作用域插槽的 Element Plus 组件 mock
 */
export function createScopedSlotComponentMock(
  componentName: string,
  props: Record<string, any> = {},
  scopedSlotProps: Record<string, any> = {}
): any {
  return defineComponent({
    name: componentName,
    props: props,
    setup(props, { slots }) {
      return () => {
        // 如果有默认插槽，调用它并传递作用域参数
        if (slots.default) {
          const slotContent = slots.default(scopedSlotProps)
          return h('div', { class: `el-${componentName.toLowerCase()}` }, slotContent)
        }
        return h('div', { class: `el-${componentName.toLowerCase()}` })
      }
    }
  })
}

/**
 * 创建菜单组件系列 mock
 */
export function createMenuComponentsMock() {
  return {
    ElMenu: createComponentMock('ElMenu', '<ul><slot /></ul>', {
      defaultActive: { type: String, default: '' },
      mode: { type: String, default: 'vertical' },
      collapse: { type: Boolean, default: false },
      backgroundColor: { type: String, default: '#ffffff' },
      textColor: { type: String, default: '#303133' },
      activeTextColor: { type: String, default: '#409EFF' }
    }),
    ElMenuItem: createComponentMock('ElMenuItem', '<li><slot /></li>', {
      index: { type: [String, Number], required: true },
      route: { type: [String, Object] },
      disabled: { type: Boolean, default: false }
    }),
    ElSubMenu: createComponentMock('ElSubMenu', '<li><div><slot name="title" /></div><ul><slot /></ul></li>', {
      index: { type: [String, Number], required: true },
      popperClass: { type: String, default: '' },
      disabled: { type: Boolean, default: false }
    }),
    ElMenuItemGroup: createComponentMock('ElMenuItemGroup', '<li><div><slot name="title" /></div><ul><slot /></ul></li>', {
      title: { type: String, default: '' }
    })
  }
}

/**
 * 创建表单组件系列 mock
 */
export function createFormComponentsMock() {
  return {
    ElInput: createComponentMock('ElInput', '<input><slot /></input>', {
      modelValue: { type: [String, Number], default: '' },
      placeholder: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
      readonly: { type: Boolean, default: false }
    }),
    ElButton: createComponentMock('ElButton', '<button><slot /></button>', {
      type: { type: String, default: 'default' },
      size: { type: String, default: 'default' },
      disabled: { type: Boolean, default: false },
      loading: { type: Boolean, default: false }
    }),
    ElSelect: createComponentMock('ElSelect', '<select><slot /></select>', {
      modelValue: { type: [String, Number, Array], default: '' },
      placeholder: { type: String, default: '' },
      disabled: { type: Boolean, default: false }
    }),
    ElForm: createComponentMock('ElForm', '<form><slot /></form>', {
      model: { type: Object, default: () => ({}) },
      rules: { type: Object, default: () => ({}) }
    }),
    ElFormItem: createComponentMock('ElFormItem', '<div><slot /></div>', {
      prop: { type: String, default: '' },
      label: { type: String, default: '' }
    })
  }
}

/**
 * 安装 Element Plus mock 到 Vue 应用
 */
export function installElementPlusMock(app: any, options: { size?: string, zIndex?: number } = {}) {
  const mockPlugin = createElementPlusMock()
  app.use(mockPlugin, options)
  return mockPlugin
}

/**
 * 创建卡片组件系列 mock
 */
export function createCardComponentsMock() {
  return {
    ElCard: createComponentMock('ElCard', '<div class="el-card"><div class="el-card__header"><slot name="header" /></div><div class="el-card__body"><slot /></div></div>', {
      header: { type: String, default: '' },
      bodyStyle: { type: [String, Object, Array], default: () => ({}) },
      shadow: { type: String, default: 'always' }
    })
  }
}

/**
 * 创建面包屑组件系列 mock
 */
export function createBreadcrumbComponentsMock() {
  return {
    ElBreadcrumb: createComponentMock('ElBreadcrumb', '<div class="el-breadcrumb"><slot /></div>', {
      separator: { type: String, default: '/' },
      separatorClass: { type: String, default: '' }
    }),
    ElBreadcrumbItem: createComponentMock('ElBreadcrumbItem', '<span class="el-breadcrumb__item"><span class="el-breadcrumb__inner"><slot /></span><i class="el-breadcrumb__separator"><slot name="separator" /></slot></i></span>', {
      to: { type: [String, Object] },
      replace: { type: Boolean, default: false }
    })
  }
}

/**
 * 创建反馈组件系列 mock
 */
export function createFeedbackComponentsMock() {
  return {
    ElResult: createComponentMock('ElResult', '<div class="el-result"><div class="el-result__icon"><slot name="icon" /></div><div class="el-result__title"><slot name="title" /></div><div class="el-result__sub-title"><slot name="sub-title" /></div><div class="el-result__extra"><slot name="extra" /></div></div>', {
      title: { type: String, default: '' },
      subTitle: { type: String, default: '' },
      icon: { type: String, default: 'info' }
    }),
    ElEmpty: createComponentMock('ElEmpty', '<div class="el-empty"><div class="el-empty__image"><slot name="image" /></div><div class="el-empty__description"><slot name="description" /></div><div class="el-empty__bottom"><slot name="default" /></div></div>', {
      image: { type: String, default: '' },
      imageSize: { type: Number, default: undefined },
      description: { type: String, default: '' }
    }),
    ElAlert: createComponentMock('ElAlert', '<div class="el-alert"><div class="el-alert__content"><span class="el-alert__title"><slot name="title" /></span><p class="el-alert__description"><slot /></p></div><i class="el-alert__closebtn"><slot name="close" /></i></div>', {
      title: { type: String, default: '' },
      type: { type: String, default: 'info' },
      description: { type: String, default: '' },
      closable: { type: Boolean, default: true },
      center: { type: Boolean, default: false },
      closeText: { type: String, default: '' },
      showIcon: { type: Boolean, default: false },
      effect: { type: String, default: 'light' }
    })
  }
}

/**
 * 创建数据录入组件系列 mock
 */
export function createDataEntryComponentsMock() {
  return {
    ElCheckbox: createComponentMock('ElCheckbox', '<label class="el-checkbox"><span class="el-checkbox__input"><input type="checkbox" /><span class="el-checkbox__inner"></span></span><span class="el-checkbox__label"><slot /></span></label>', {
      modelValue: { type: [Boolean, String, Number], default: false },
      label: { type: [String, Boolean, Number, Object] },
      trueLabel: { type: [String, Number], default: undefined },
      falseLabel: { type: [String, Number], default: undefined },
      disabled: { type: Boolean, default: false },
      border: { type: Boolean, default: false },
      size: { type: String, default: '' },
      name: { type: String },
      checked: { type: Boolean, default: false },
      indeterminate: { type: Boolean, default: false },
      validateEvent: { type: Boolean, default: true }
    }),
    ElRadio: createComponentMock('ElRadio', '<label class="el-radio"><span class="el-radio__input"><input type="radio" /><span class="el-radio__inner"></span></span><span class="el-radio__label"><slot /></span></label>', {
      modelValue: { type: [Boolean, String, Number], default: undefined },
      label: { type: [String, Boolean, Number, Object], default: undefined },
      disabled: { type: Boolean, default: false },
      border: { type: Boolean, default: false },
      size: { type: String, default: '' },
      name: { type: String }
    }),
    ElRadioGroup: createComponentMock('ElRadioGroup', '<div class="el-radio-group"><slot /></div>', {
      modelValue: { type: [Boolean, String, Number], default: undefined },
      size: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
      textColor: { type: String, default: '#ffffff' },
      fill: { type: String, default: '#409EFF' }
    }),
    ElRadioButton: createComponentMock('ElRadioButton', '<label class="el-radio-button"><input type="radio" class="el-radio-button__orig-radio" /><span class="el-radio-button__inner"><slot /></span></label>', {
      label: { type: [String, Boolean, Number, Object], default: undefined },
      disabled: { type: Boolean, default: false },
      name: { type: String }
    }),
    ElInputNumber: createComponentMock('ElInputNumber', '<div class="el-input-number"><input type="number" class="el-input__inner" /><span class="el-input-number__decrease"><span class="el-icon-minus"></span></span><span class="el-input-number__increase"><span class="el-icon-plus"></span></span></div>', {
      modelValue: { type: [Number, String], default: undefined },
      min: { type: Number, default: -Infinity },
      max: { type: Number, default: Infinity },
      step: { type: Number, default: 1 },
      stepStrictly: { type: Boolean, default: false },
      precision: { type: Number, default: undefined },
      size: { type: String, default: '' },
      readonly: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      controls: { type: Boolean, default: true },
      controlsPosition: { type: String, default: '' },
      name: { type: String, default: undefined },
      label: { type: String, default: undefined },
      placeholder: { type: String, default: undefined },
      validateEvent: { type: Boolean, default: true }
    }),
    ElSwitch: createComponentMock('ElSwitch', '<div class="el-switch"><input class="el-switch__input" type="checkbox" /><span class="el-switch__core"><span class="el-switch__button"></span></span></div>', {
      modelValue: { type: [Boolean, String, Number], default: false },
      disabled: { type: Boolean, default: false },
      loading: { type: Boolean, default: false },
      size: { type: String, default: '' },
      width: { type: [Number, String], default: undefined },
      inlinePrompt: { type: Boolean, default: false },
      activeIcon: { type: [String, Object], default: undefined },
      inactiveIcon: { type: [String, Object], default: undefined },
      activeText: { type: String, default: '' },
      inactiveText: { type: String, default: '' },
      activeColor: { type: String, default: undefined },
      inactiveColor: { type: String, default: undefined },
      borderColor: { type: String, default: undefined },
      activeValue: { type: [Boolean, String, Number], default: true },
      inactiveValue: { type: [Boolean, String, Number], default: false },
      name: { type: String, default: undefined },
      validateEvent: { type: Boolean, default: true },
      beforeChange: { type: Function, default: undefined }
    }),
    ElRate: createComponentMock('ElRate', '<div class="el-rate"><span class="el-rate__item" v-for="item in max" :key="item"><i class="el-rate__icon" :class="{ \'el-rate__icon--on\': item <= modelValue }"><slot name="character" /></i></span></div>', {
      modelValue: { type: Number, default: 0 },
      max: { type: Number, default: 5 },
      size: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
      allowHalf: { type: Boolean, default: false },
      lowThreshold: { type: Number, default: 2 },
      highThreshold: { type: Number, default: 4 },
      colors: { type: [Array, Object], default: () => ['#F7BA2A', '#F7BA2A', '#F7BA2A'] },
      voidColor: { type: String, default: '#C6D1DE' },
      disabledVoidColor: { type: String, default: '#EFF2F7' },
      icons: { type: [Array, Object], default: () => ['StarFilled', 'StarFilled', 'StarFilled'] },
      voidIcon: { type: [String, Object], default: 'Star' },
      disabledVoidIcon: { type: [String, Object], default: 'StarFilled' },
      showText: { type: Boolean, default: false },
      showScore: { type: Boolean, default: false },
      textColor: { type: String, default: '#1F2D3D' },
      texts: { type: Array, default: () => ['极差', '失望', '一般', '满意', '惊喜'] },
      scoreTemplate: { type: String, default: '{value}' },
      clearable: { type: Boolean, default: false }
    }),
    ElSlider: createComponentMock('ElSlider', '<div class="el-slider"><div class="el-slider__runway"><div class="el-slider__bar"></div><div class="el-slider__button-wrapper"><div class="el-slider__button"></div></div></div></div>', {
      modelValue: { type: [Number, Array], default: 0 },
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
      step: { type: Number, default: 1 },
      showInput: { type: Boolean, default: false },
      showInputControls: { type: Boolean, default: true },
      inputSize: { type: String, default: 'small' },
      showStops: { type: Boolean, default: false },
      showTooltip: { type: Boolean, default: true },
      formatTooltip: { type: Function, default: (val: number) => val },
      disabled: { type: Boolean, default: false },
      range: { type: Boolean, default: false },
      vertical: { type: Boolean, default: false },
      height: { type: String, default: '' },
      debounce: { type: Number, default: 300 },
      label: { type: String, default: undefined },
      tooltipClass: { type: String, default: undefined },
      marks: { type: Object, default: undefined }
    }),
    ElDatePicker: createComponentMock('ElDatePicker', '<div class="el-date-editor"><input type="text" class="el-input__inner" /><span class="el-input__suffix"><span class="el-input__suffix-inner"><i class="el-input__icon el-icon-date"></i></span></span></div>', {
      modelValue: { type: [Date, Array, String, Number], default: undefined },
      readonly: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      size: { type: String, default: '' },
      editable: { type: Boolean, default: true },
      clearable: { type: Boolean, default: true },
      placeholder: { type: String, default: '' },
      startPlaceholder: { type: String, default: '' },
      endPlaceholder: { type: String, default: '' },
      type: { type: String, default: 'date' },
      format: { type: String, default: 'YYYY-MM-DD' },
      popperClass: { type: String, default: '' },
      rangeSeparator: { type: String, default: '-' },
      defaultValue: { type: [Date, Array], default: undefined },
      defaultTime: { type: [Date, Array], default: undefined },
      valueFormat: { type: String, default: '' },
      unlinkPanels: { type: Boolean, default: false },
      prefixIcon: { type: [String, Object], default: 'Date' },
      clearIcon: { type: [String, Object], default: 'CircleClose' },
      validateEvent: { type: Boolean, default: true },
      shortcuts: { type: Array, default: () => [] },
      disabledDate: { type: Function, default: undefined },
      cellClassName: { type: Function, default: undefined },
      teleported: { type: Boolean, default: true }
    }),
    ElTimePicker: createComponentMock('ElTimePicker', '<div class="el-date-editor"><input type="text" class="el-input__inner" /><span class="el-input__suffix"><span class="el-input__suffix-inner"><i class="el-input__icon el-icon-time"></i></span></span></div>', {
      modelValue: { type: [Date, String], default: undefined },
      readonly: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      editable: { type: Boolean, default: true },
      clearable: { type: Boolean, default: true },
      size: { type: String, default: '' },
      placeholder: { type: String, default: '' },
      startPlaceholder: { type: String, default: '' },
      endPlaceholder: { type: String, default: '' },
      isRange: { type: Boolean, default: false },
      arrowControl: { type: Boolean, default: false },
      popperClass: { type: String, default: '' },
      rangeSeparator: { type: String, default: '-' },
      format: { type: String, default: 'HH:mm:ss' },
      defaultValue: { type: [Date, Array], default: undefined },
      valueFormat: { type: String, default: '' },
      prefixIcon: { type: [String, Object], default: 'Clock' },
      clearIcon: { type: [String, Object], default: 'CircleClose' },
      disabledHours: { type: Function, default: undefined },
      disabledMinutes: { type: Function, default: undefined },
      disabledSeconds: { type: Function, default: undefined },
      teleported: { type: Boolean, default: true }
    }),
    ElColorPicker: createComponentMock('ElColorPicker', '<div class="el-color-picker"><div class="el-color-picker__trigger"><span class="el-color-picker__color"><span class="el-color-picker__color-inner"></span></span></div></div>', {
      modelValue: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
      size: { type: String, default: '' },
      showAlpha: { type: Boolean, default: false },
      colorFormat: { type: String, default: undefined },
      popperClass: { type: String, default: '' },
      predefine: { type: Array, default: () => [] },
      validateEvent: { type: Boolean, default: true },
      tabindex: { type: [String, Number], default: 0 },
      teleported: { type: Boolean, default: true }
    }),
    ElCascader: createComponentMock('ElCascader', '<div class="el-cascader"><div class="el-input el-input--suffix"><input type="text" class="el-input__inner" readonly /><span class="el-input__suffix"><span class="el-input__suffix-inner"><i class="el-input__icon el-icon-arrow-down"></i></span></span></div></div>', {
      modelValue: { type: [Array, String, Number], default: () => [] },
      options: { type: Array, default: () => [] },
      props: { type: Object, default: () => ({}) },
      size: { type: String, default: '' },
      placeholder: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
      clearable: { type: Boolean, default: true },
      showAllLevels: { type: Boolean, default: true },
      collapseTags: { type: Boolean, default: false },
      collapseTagsTooltip: { type: Boolean, default: false },
      separator: { type: String, default: '/' },
      filterable: { type: Boolean, default: false },
      filterMethod: { type: Function, default: undefined },
      debounce: { type: Number, default: 300 },
      beforeFilter: { type: Function, default: () => true },
      popperClass: { type: String, default: '' },
      teleported: { type: Boolean, default: true },
      tagType: { type: String, default: 'info' },
      validateEvent: { type: Boolean, default: true }
    }),
    ElTransfer: createComponentMock('ElTransfer', '<div class="el-transfer"><div class="el-transfer-panel"><div class="el-transfer-panel__header"><label class="el-checkbox"><span class="el-transfer-panel__header"><slot name="left-header" /></span></label></div><div class="el-transfer-panel__body"><slot name="left-footer" /></div></div><div class="el-transfer__buttons"><button class="el-transfer__button"><i class="el-icon-arrow-left"></i></button><button class="el-transfer__button"><i class="el-icon-arrow-right"></i></button></div><div class="el-transfer-panel"><div class="el-transfer-panel__header"><label class="el-checkbox"><span class="el-transfer-panel__header"><slot name="right-header" /></span></label></div><div class="el-transfer-panel__body"><slot name="right-footer" /></div></div></div>', {
      modelValue: { type: Array, default: () => [] },
      data: { type: Array, default: () => [] },
      filterable: { type: Boolean, default: false },
      filterPlaceholder: { type: String, default: '请输入搜索内容' },
      filterMethod: { type: Function, default: undefined },
      targetOrder: { type: String, default: 'original' },
      titles: { type: Array, default: () => ['列表 1', '列表 2'] },
      buttonTexts: { type: Array, default: () => [] },
      renderContent: { type: Function, default: undefined },
      format: { type: Object, default: () => ({}) },
      props: { type: Object, default: () => ({}) },
      leftDefaultChecked: { type: Array, default: () => [] },
      rightDefaultChecked: { type: Array, default: () => [] },
      validateEvent: { type: Boolean, default: true }
    }),
    ElTreeSelect: createComponentMock('ElTreeSelect', '<div class="el-select"><div class="el-input el-input--suffix"><input type="text" class="el-input__inner" readonly /><span class="el-input__suffix"><span class="el-input__suffix-inner"><i class="el-input__icon el-icon-arrow-down"></i></span></span></div></div>', {
      modelValue: { type: [Array, String, Number, Boolean, Object], default: undefined },
      multiple: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      size: { type: String, default: '' },
      clearable: { type: Boolean, default: true },
      collapseTags: { type: Boolean, default: false },
      collapseTagsTooltip: { type: Boolean, default: false },
      multipleLimit: { type: Number, default: 0 },
      name: { type: String, default: '' },
      placeholder: { type: String, default: '请选择' },
      filterable: { type: Boolean, default: false },
      allowCreate: { type: Boolean, default: false },
      filterMethod: { type: Function, default: undefined },
      remote: { type: Boolean, default: false },
      remoteMethod: { type: Function, default: undefined },
      loading: { type: Boolean, default: false },
      loadingText: { type: String, default: 'Loading' },
      noMatchText: { type: String, default: '无匹配数据' },
      noDataText: { type: String, default: '无数据' },
      popperClass: { type: String, default: '' },
      reserveKeyword: { type: Boolean, default: true },
      defaultFirstOption: { type: Boolean, default: false },
      teleported: { type: Boolean, default: true },
      persistent: { type: Boolean, default: true },
      automaticDropdown: { type: Boolean, default: false },
      clearIcon: { type: [String, Object], default: 'CircleClose' },
      fitInputWidth: { type: Boolean, default: false },
      suffixIcon: { type: [String, Object], default: 'ArrowDown' },
      tagType: { type: String, default: 'info' },
      validateEvent: { type: Boolean, default: true },
      data: { type: Array, default: () => [] },
      props: { type: Object, default: () => ({}) },
      checkStrictly: { type: Boolean, default: false },
      renderAfterExpand: { type: Boolean, default: true },
      showCheckbox: { type: Boolean, default: false },
      checkOnClickNode: { type: Boolean, default: false },
      lazy: { type: Boolean, default: false },
      accordion: { type: Boolean, default: false },
      indent: { type: Number, default: 16 },
      icon: { type: [String, Object], default: undefined }
    })
  }
}

/**
 * 创建数据展示组件系列 mock
 */
export function createDataDisplayComponentsMock() {
  return {
    ElTag: createComponentMock('ElTag', '<span class="el-tag"><span class="el-tag__content"><slot /></span></span>', {
      text: { type: String, default: '' },
      closable: { type: Boolean, default: false },
      type: { type: String, default: '' },
      hit: { type: Boolean, default: false },
      disableTransitions: { type: Boolean, default: false },
      color: { type: String, default: '' },
      size: { type: String, default: '' },
      effect: { type: String, default: 'light' }
    }),
    ElDescriptions: createComponentMock('ElDescriptions', '<div class="el-descriptions"><slot /></div>', {
      border: { type: Boolean, default: false },
      column: { type: Number, default: 3 },
      direction: { type: String, default: 'horizontal' },
      size: { type: String, default: '' },
      title: { type: String, default: '' },
      extra: { type: String, default: '' }
    }),
    ElDescriptionsItem: createComponentMock('ElDescriptionsItem', '<div class="el-descriptions__cell"><div class="el-descriptions__label"><slot name="label" /></div><div class="el-descriptions__content"><slot /></div></div>', {
      label: { type: String, default: '' },
      span: { type: Number, default: 1 },
      width: { type: [String, Number], default: '' },
      minWidth: { type: [String, Number], default: '' },
      align: { type: String, default: 'left' },
      labelAlign: { type: String, default: 'left' },
      className: { type: String, default: '' },
      labelClassName: { type: String, default: '' }
    }),
    ElAvatar: createComponentMock('ElAvatar', '<span class="el-avatar"><img v-if="src" :src="src" :alt="alt" /><span v-else><slot /></span></span>', {
      icon: { type: [String, Object], default: undefined },
      size: { type: [Number, String], default: 'default' },
      shape: { type: String, default: 'circle' },
      src: { type: String, default: '' },
      alt: { type: String, default: '' },
      srcSet: { type: String, default: '' },
      error: { type: Function, default: undefined },
      fit: { type: String, default: 'cover' }
    }),
    ElImage: createComponentMock('ElImage', '<div class="el-image"><img v-if="src" :src="src" :alt="alt" :style="imageStyle" /><div v-else class="el-image__placeholder"><slot name="placeholder" /></div><div v-if="error" class="el-image__error"><slot name="error" /></div><div class="el-image__preview"><slot name="preview" /></div></div>', {
      src: { type: String, default: '' },
      fit: { type: String, default: '' },
      hideOnClickModal: { type: Boolean, default: false },
      loading: { type: String, default: 'eager' },
      lazy: { type: Boolean, default: false },
      scrollContainer: { type: [String, Object], default: undefined },
      previewSrcList: { type: Array, default: () => [] },
      previewTeleported: { type: Boolean, default: false },
      zIndex: { type: Number, default: 2000 },
      initialIndex: { type: Number, default: 0 },
      infinite: { type: Boolean, default: true },
      closeOnPressEscape: { type: Boolean, default: true },
      zoomRate: { type: Number, default: 1.2 },
      minScale: { type: Number, default: 0.2 },
      maxScale: { type: Number, default: 7 },
      crossorigin: { type: [String, Boolean], default: false }
    }),
    ElIcon: createComponentMock('ElIcon', '<i class="el-icon"><slot /></i>', {
      size: { type: [Number, String], default: undefined },
      color: { type: String, default: '' }
    }),
    ElText: createComponentMock('ElText', '<span class="el-text"><slot /></span>', {
      type: { type: String, default: '' },
      size: { type: String, default: '' },
      truncated: { type: Boolean, default: false },
      lineClamp: { type: [String, Number], default: '' },
      tag: { type: String, default: 'span' }
    }),
    ElStatistic: createComponentMock('ElStatistic', '<div class="el-statistic"><div class="el-statistic__head"><slot name="title" /></div><div class="el-statistic__content"><span class="el-statistic__number">{{ value }}</span><span class="el-statistic__suffix"><slot name="suffix" /></span></div></div>', {
      value: { type: [String, Number], default: '' },
      title: { type: String, default: '' },
      prefix: { type: String, default: '' },
      suffix: { type: String, default: '' },
      precision: { type: Number, default: 0 },
      separator: { type: String, default: ',' },
      groupSeparator: { type: String, default: ',' },
      decimalSeparator: { type: String, default: '.' },
      formatter: { type: Function, default: undefined }
    }),
    ElCountdown: createComponentMock('ElCountdown', '<span class="el-countdown"><span class="el-countdown__content">{{ displayValue }}</span></span>', {
      value: { type: [Number, String, Date], default: 0 },
      title: { type: String, default: '' },
      prefix: { type: String, default: '' },
      suffix: { type: String, default: '' },
      format: { type: String, default: 'HH:mm:ss' },
      autoStart: { type: Boolean, default: true },
      valueStyle: { type: [String, Object, Array], default: () => ({}) }
    }),
    ElCalendar: createComponentMock('ElCalendar', '<div class="el-calendar"><div class="el-calendar__header"><div class="el-calendar__title">{{ currentDate }}</div><div class="el-calendar__button-group"><slot name="header" /></div></div><div class="el-calendar__body"><slot /></div></div>', {
      modelValue: { type: Date, default: () => new Date() },
      range: { type: Array, default: () => [] },
      firstDayOfWeek: { type: Number, default: 1 }
    }),
    ElProgress: createComponentMock('ElProgress', '<div class="el-progress"><div class="el-progress-bar"><div class="el-progress-bar__outer"><div class="el-progress-bar__inner" :style="{ width: percentage + \'%\' }"></div></div></div><div class="el-progress__text"><slot /></div></div>', {
      percentage: { type: Number, default: 0 },
      type: { type: String, default: 'line' },
      strokeWidth: { type: Number, default: 6 },
      textInside: { type: Boolean, default: false },
      status: { type: String, default: '' },
      color: { type: [String, Array, Function], default: '' },
      width: { type: Number, default: 126 },
      showText: { type: Boolean, default: true },
      strokeLinecap: { type: String, default: 'round' },
      format: { type: Function, default: (percentage: number) => `${percentage}%` }
    }),
    ElTree: createComponentMock('ElTree', '<div class="el-tree"><div class="el-tree-node"><div class="el-tree-node__content"><span class="el-tree-node__label"><slot /></span></div></div></div>', {
      data: { type: Array, default: () => [] },
      emptyText: { type: String, default: '暂无数据' },
      nodeKey: { type: String, default: 'id' },
      checkStrictly: { type: Boolean, default: false },
      expandOnClickNode: { type: Boolean, default: true },
      checkOnClickNode: { type: Boolean, default: false },
      checkDescendants: { type: Boolean, default: false },
      autoExpandParent: { type: Boolean, default: true },
      defaultExpandAll: { type: Boolean, default: false },
      expandOnTriggerNode: { type: Boolean, default: true },
      defaultCheckedKeys: { type: Array, default: () => [] },
      defaultExpandedKeys: { type: Array, default: () => [] },
      currentNodeKey: { type: [String, Number], default: undefined },
      renderAfterExpand: { type: Boolean, default: true },
      showCheckbox: { type: Boolean, default: false },
      draggable: { type: Boolean, default: false },
      allowDrag: { type: Function, default: undefined },
      allowDrop: { type: Function, default: undefined },
      props: { type: Object, default: () => ({}) },
      lazy: { type: Boolean, default: false },
      highlightCurrent: { type: Boolean, default: false },
      load: { type: Function, default: undefined },
      filterNodeMethod: { type: Function, default: undefined },
      accordion: { type: Boolean, default: false },
      indent: { type: Number, default: 16 },
      icon: { type: [String, Object], default: undefined }
    })
  }
}

/**
 * 创建导航组件系列 mock
 */
export function createNavigationComponentsMock() {
  return {
    ElTabs: createComponentMock('ElTabs', '<div class="el-tabs"><div class="el-tabs__header"><div class="el-tabs__nav-wrap"><div class="el-tabs__nav-scroll"><div class="el-tabs__nav"><div class="el-tabs__active-bar"></div><div class="el-tabs__item" v-for="tab in tabs" :key="tab.name"><slot :name="tab.name" /></div></div></div></div></div><div class="el-tabs__content"><slot /></div></div>', {
      modelValue: { type: [String, Number], default: undefined },
      type: { type: String, default: '' },
      closable: { type: Boolean, default: false },
      addable: { type: Boolean, default: false },
      editable: { type: Boolean, default: false },
      tabPosition: { type: String, default: 'top' },
      stretch: { type: Boolean, default: false },
      beforeLeave: { type: Function, default: () => true }
    }),
    ElTabPane: createComponentMock('ElTabPane', '<div class="el-tab-pane"><slot /></div>', {
      label: { type: String, default: '' },
      name: { type: [String, Number], default: undefined },
      closable: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      lazy: { type: Boolean, default: false }
    }),
    ElDropdown: createComponentMock('ElDropdown', '<div class="el-dropdown"><div class="el-dropdown__trigger"><slot name="dropdown" /></div><div class="el-dropdown__popper"><slot /></div></div>', {
      type: { type: String, default: 'default' },
      size: { type: String, default: '' },
      maxHeight: { type: [Number, String], default: undefined },
      splitButton: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      placement: { type: String, default: 'bottom-end' },
      trigger: { type: String, default: 'hover' },
      hideOnClick: { type: Boolean, default: true },
      showTimeout: { type: Number, default: 250 },
      hideTimeout: { type: Number, default: 150 },
      tabindex: { type: [Number, String], default: 0 },
      teleported: { type: Boolean, default: true }
    }),
    ElDropdownMenu: createComponentMock('ElDropdownMenu', '<ul class="el-dropdown-menu"><slot /></ul>', {}),
    ElDropdownItem: createComponentMock('ElDropdownItem', '<li class="el-dropdown-menu__item"><slot /></li>', {
      command: { type: [String, Number, Object], default: undefined },
      disabled: { type: Boolean, default: false },
      divided: { type: Boolean, default: false },
      icon: { type: [String, Object], default: undefined }
    }),
    ElSteps: createComponentMock('ElSteps', '<div class="el-steps"><slot /></div>', {
      space: { type: [Number, String], default: '' },
      direction: { type: String, default: 'horizontal' },
      active: { type: Number, default: 0 },
      processStatus: { type: String, default: 'process' },
      finishStatus: { type: String, default: 'finish' },
      alignCenter: { type: Boolean, default: false },
      simple: { type: Boolean, default: false }
    }),
    ElStep: createComponentMock('ElStep', '<div class="el-step"><div class="el-step__head"><div class="el-step__icon"><slot name="icon" /></div></div><div class="el-step__main"><div class="el-step__title"><slot name="title" /></div><div class="el-step__description"><slot name="description" /></div></div></div>', {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      icon: { type: [String, Object], default: undefined },
      status: { type: String, default: '' }
    })
  }
}

/**
 * 创建反馈组件系列 mock（Popover, Tooltip等）
 */
export function createOverlayComponentsMock() {
  return {
    ElPopover: createComponentMock('ElPopover', '<div class="el-popover"><div class="el-popover__reference"><slot name="reference" /></div><div class="el-popover__popper"><slot /></div></div>', {
      trigger: { type: String, default: 'click' },
      title: { type: String, default: '' },
      content: { type: String, default: '' },
      width: { type: [String, Number], default: 150 },
      placement: { type: String, default: 'bottom' },
      disabled: { type: Boolean, default: false },
      modelValue: { type: Boolean, default: undefined },
      offset: { type: Number, default: undefined },
      transition: { type: String, default: 'el-fade-in-linear' },
      showArrow: { type: Boolean, default: true },
      tabindex: { type: Number, default: undefined },
      popperOptions: { type: Object, default: () => ({}) },
      popperClass: { type: String, default: '' },
      showAfter: { type: Number, default: 0 },
      hideAfter: { type: Number, default: 200 },
      autoClose: { type: Number, default: 0 },
      teleported: { type: Boolean, default: true },
      persistent: { type: Boolean, default: true }
    }),
    ElTooltip: createComponentMock('ElTooltip', '<div class="el-tooltip"><div class="el-tooltip__trigger"><slot /></div><div class="el-tooltip__popper"><slot name="content" /></div></div>', {
      effect: { type: String, default: 'dark' },
      content: { type: String, default: '' },
      placement: { type: String, default: 'bottom' },
      modelValue: { type: Boolean, default: undefined },
      disabled: { type: Boolean, default: false },
      offset: { type: Number, default: 12 },
      transition: { type: String, default: 'el-fade-in-linear' },
      popperOptions: { type: Object, default: () => ({}) },
      showAfter: { type: Number, default: 0 },
      hideAfter: { type: Number, default: 200 },
      autoClose: { type: Number, default: 0 },
      manual: { type: Boolean, default: false },
      popperClass: { type: String, default: '' },
      enterable: { type: Boolean, default: true },
      tabindex: { type: Number, default: undefined },
      teleported: { type: Boolean, default: true },
      trigger: { type: [String, Array], default: 'hover' },
      triggerKeys: { type: Array, default: () => ['Escape'] }
    }),
    ElDialog: createComponentMock('ElDialog', '<div class="el-dialog"><div class="el-dialog__header"><slot name="header" /></div><div class="el-dialog__body"><slot /></div><div class="el-dialog__footer"><slot name="footer" /></div></div>', {
      modelValue: { type: Boolean, default: false },
      title: { type: String, default: '' },
      width: { type: [String, Number], default: '50%' },
      fullscreen: { type: Boolean, default: false },
      top: { type: String, default: '15vh' },
      modal: { type: Boolean, default: true },
      modalClass: { type: String, default: '' },
      appendToBody: { type: Boolean, default: false },
      lockScroll: { type: Boolean, default: true },
      customClass: { type: String, default: '' },
      openDelay: { type: Number, default: 0 },
      closeDelay: { type: Number, default: 0 },
      closeOnClickModal: { type: Boolean, default: true },
      closeOnPressEscape: { type: Boolean, default: true },
      showClose: { type: Boolean, default: true },
      beforeClose: { type: Function, default: null },
      draggable: { type: Boolean, default: false },
      center: { type: Boolean, default: false },
      alignCenter: { type: Boolean, default: false },
      destroyOnClose: { type: Boolean, default: false }
    })
  }
}

/**
 * 创建其他组件系列 mock
 */
export function createOtherComponentsMock() {
  return {
    ElDivider: createComponentMock('ElDivider', '<div class="el-divider"><div class="el-divider__text"><slot /></div></div>', {
      direction: { type: String, default: 'horizontal' },
      contentPosition: { type: String, default: 'center' },
      borderStyle: { type: String, default: 'solid' }
    }),
    ElSpace: createComponentMock('ElSpace', '<div class="el-space"><slot /></div>', {
      alignment: { type: String, default: 'center' },
      class: { type: [String, Object, Array], default: '' },
      direction: { type: String, default: 'horizontal' },
      prefixCls: { type: String, default: '' },
      size: { type: [String, Number, Array], default: 'small' },
      spacer: { type: [String, Number, Object], default: undefined },
      wrap: { type: Boolean, default: false },
      fill: { type: Boolean, default: false },
      fillRatio: { type: Number, default: 100 }
    }),
    ElCollapse: createComponentMock('ElCollapse', '<div class="el-collapse"><slot /></div>', {
      modelValue: { type: [Array, String, Number], default: () => [] },
      accordion: { type: Boolean, default: false }
    }),
    ElCollapseItem: createComponentMock('ElCollapseItem', '<div class="el-collapse-item"><div class="el-collapse-item__header"><slot name="title" /></div><div class="el-collapse-item__wrap"><div class="el-collapse-item__content"><slot /></div></div></div>', {
      name: { type: [String, Number], default: undefined },
      title: { type: String, default: '' },
      disabled: { type: Boolean, default: false }
    }),
    ElUpload: createComponentMock('ElUpload', '<div class="el-upload"><div class="el-upload-dragger"><slot /></div></div>', {
      action: { type: String, default: '' },
      headers: { type: Object, default: () => ({}) },
      method: { type: String, default: 'post' },
      data: { type: Object, default: () => ({}) },
      multiple: { type: Boolean, default: false },
      name: { type: String, default: 'file' },
      drag: { type: Boolean, default: false },
      withCredentials: { type: Boolean, default: false },
      showFileList: { type: Boolean, default: true },
      accept: { type: String, default: '' },
      type: { type: String, default: 'select' },
      beforeUpload: { type: Function, default: undefined },
      beforeRemove: { type: Function, default: undefined },
      onRemove: { type: Function, default: () => {} },
      onChange: { type: Function, default: () => {} },
      onPreview: { type: Function, default: () => {} },
      onSuccess: { type: Function, default: () => {} },
      onError: { type: Function, default: () => {} },
      onProgress: { type: Function, default: () => {} },
      onExceed: { type: Function, default: () => {} },
      fileList: { type: Array, default: () => [] },
      autoUpload: { type: Boolean, default: true },
      listType: { type: String, default: 'text' },
      httpRequest: { type: Function, default: undefined },
      disabled: { type: Boolean, default: false },
      limit: { type: Number, default: undefined },
      onExceeded: { type: Function, default: undefined }
    })
  }
}

/**
 * 创建统一的组件 mock（包含所有组件类型）
 */
export function createComponentMocks() {
  return {
    ...createMenuComponentsMock(),
    ...createFormComponentsMock(),
    ...createDataComponentsMock(),
    ...createLayoutComponentsMock(),
    ...createCardComponentsMock(),
    ...createBreadcrumbComponentsMock(),
    ...createFeedbackComponentsMock(),
    ...createDataEntryComponentsMock(),
    ...createDataDisplayComponentsMock(),
    ...createNavigationComponentsMock(),
    ...createOverlayComponentsMock(),
    ...createOtherComponentsMock()
  }
}

/**
 * 创建完整的 Element Plus mock 环境
 */
export function createElementPlusTestEnvironment() {
  const mockPlugin = createElementPlusMock()
  const menuComponents = createMenuComponentsMock()
  const formComponents = createFormComponentsMock()
  const dataComponents = createDataComponentsMock()
  const layoutComponents = createLayoutComponentsMock()
  const serviceMocks = createServiceMocks()
  const iconMocks = createIconsMock()

  return {
    plugin: mockPlugin,
    menuComponents,
    formComponents,
    dataComponents,
    layoutComponents,
    serviceMocks,
    iconMocks,
    install: (app: any, options?: any) => installElementPlusMock(app, options),
    // 便捷方法
    createMenu: () => menuComponents,
    createForm: () => formComponents,
    createData: () => dataComponents,
    createLayout: () => layoutComponents,
    createServices: () => serviceMocks,
    createIcons: () => iconMocks,
    createAllComponents: () => createComponentMocks(),
    createComponent: createComponentMock
  }
}

/**
 * 创建 Element Plus 服务 mock
 */
export function createServiceMocks() {
  return {
    ElMessage: {
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      closeAll: vi.fn()
    },
    ElMessageBox: {
      alert: vi.fn().mockResolvedValue(),
      confirm: vi.fn().mockResolvedValue(),
      prompt: vi.fn().mockResolvedValue(),
      close: vi.fn()
    },
    ElNotification: {
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      closeAll: vi.fn(),
      close: vi.fn()
    },
    ElLoading: {
      service: vi.fn(() => ({
        close: vi.fn(),
        setText: vi.fn(),
        remove: vi.fn()
      })),
      close: vi.fn()
    }
  }
}

/**
 * 创建数据展示组件系列 mock（支持作用域插槽）
 */
export function createDataComponentsMock() {
  return {
    ElTable: createScopedSlotComponentMock('ElTable', {
      data: { type: Array, default: () => [] },
      stripe: { type: Boolean, default: false },
      border: { type: Boolean, default: false },
      size: { type: String, default: 'default' },
      fit: { type: Boolean, default: true },
      showHeader: { type: Boolean, default: true },
      highlightCurrentRow: { type: Boolean, default: false },
      currentRowKey: { type: [String, Number], default: '' },
      rowClassName: { type: [String, Function], default: '' },
      rowStyle: { type: [String, Function], default: '' },
      cellClassName: { type: [String, Function], default: '' },
      cellStyle: { type: [String, Function], default: '' },
      headerRowClassName: { type: [String, Function], default: '' },
      headerRowStyle: { type: [String, Function], default: '' },
      headerCellClassName: { type: [String, Function], default: '' },
      headerCellStyle: { type: [String, Function], default: '' },
      rowKey: { type: [String, Function], default: '' },
      emptyText: { type: String, default: '暂无数据' },
      defaultExpandAll: { type: Boolean, default: false },
      expandRowKeys: { type: Array, default: () => [] },
      defaultSort: { type: Object, default: () => ({}) },
      tooltipEffect: { type: String, default: 'dark' },
      showSummary: { type: Boolean, default: false },
      sumText: { type: String, default: '合计' },
      summaryMethod: { type: Function, default: null },
      spanMethod: { type: Function, default: null },
      selectOnIndeterminate: { type: Boolean, default: true },
      indent: { type: Number, default: 16 },
      lazy: { type: Boolean, default: false },
      load: { type: Function, default: () => {} },
      treeProps: { type: Object, default: () => ({ hasChildren: 'hasChildren', children: 'children' }) },
      tableLayout: { type: String, default: 'fixed' },
      scrollbarAlwaysOn: { type: Boolean, default: false },
      flexible: { type: Boolean, default: false }
    }, {
      // 默认的作用域插槽参数
      row: {},
      column: {},
      $index: 0
    }),
    ElTableColumn: createScopedSlotComponentMock('ElTableColumn', {
      type: { type: String, default: 'default' },
      label: { type: [String, Number, Function, Object], default: '' },
      className: { type: String, default: '' },
      labelClassName: { type: String, default: '' },
      property: { type: String, default: '' },
      prop: { type: String, default: '' },
      width: { type: [String, Number], default: '' },
      minWidth: { type: [String, Number], default: '' },
      renderHeader: { type: Function, default: null },
      sortable: { type: [Boolean, String], default: false },
      sortMethod: { type: Function, default: null },
      sortBy: { type: [String, Array, Function], default: '' },
      resizable: { type: Boolean, default: true },
      columnKey: { type: [String, Number], default: '' },
      align: { type: String, default: 'left' },
      headerAlign: { type: String, default: '' },
      showTooltipWhenOverflow: { type: Boolean, default: false },
      showOverflowTooltip: { type: Boolean, default: false },
      fixed: { type: [Boolean, String], default: false },
      formatter: { type: Function, default: null },
      selectable: { type: Function, default: null },
      reserveSelection: { type: Boolean, default: false },
      filterMethod: { type: Function, default: null },
      filteredValue: { type: Array, default: () => [] },
      filters: { type: Array, default: () => [] },
      filterPlacement: { type: String, default: '' },
      filterMultiple: { type: Boolean, default: true },
      index: { type: [Number, Function], default: null },
      sortOrders: { type: Array, default: () => ['ascending', 'descending', null] }
    }, {
      // 默认的作用域插槽参数
      row: {},
      column: {},
      $index: 0
    }),
    ElPagination: createComponentMock('ElPagination', '<div class="el-pagination"><slot /></div>', {
      small: { type: Boolean, default: false },
      background: { type: Boolean, default: false },
      pageSize: { type: Number, default: 10 },
      total: { type: Number, default: 0 },
      pageCount: { type: Number, default: 0 },
      pagerCount: { type: Number, default: 7 },
      currentPage: { type: Number, default: 1 },
      layout: { type: String, default: 'prev, pager, next, jumper, ->, total' },
      pageSizes: { type: Array, default: () => [10, 20, 30, 40, 50, 100] },
      popperClass: { type: String, default: '' },
      prevText: { type: String, default: '' },
      nextText: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
      hideOnSinglePage: { type: Boolean, default: false }
    })
  }
}

/**
 * 创建布局组件系列 mock
 */
export function createLayoutComponentsMock() {
  return {
    ElContainer: createComponentMock('ElContainer', '<div class="el-container"><slot /></div>', {
      direction: { type: String, default: '' }
    }),
    ElHeader: createComponentMock('ElHeader', '<header class="el-header"><slot /></header>', {
      height: { type: [String, Number], default: '60px' }
    }),
    ElAside: createComponentMock('ElAside', '<aside class="el-aside"><slot /></aside>', {
      width: { type: [String, Number], default: '300px' }
    }),
    ElMain: createComponentMock('ElMain', '<main class="el-main"><slot /></main>', {}),
    ElFooter: createComponentMock('ElFooter', '<footer class="el-footer"><slot /></footer>', {
      height: { type: [String, Number], default: '60px' }
    }),
    ElRow: createComponentMock('ElRow', '<div class="el-row"><slot /></div>', {
      gutter: { type: Number, default: 0 },
      justify: { type: String, default: 'start' },
      align: { type: String, default: 'top' },
      tag: { type: String, default: 'div' }
    }),
    ElCol: createComponentMock('ElCol', '<div class="el-col"><slot /></div>', {
      span: { type: Number, default: 24 },
      offset: { type: Number, default: 0 },
      push: { type: Number, default: 0 },
      pull: { type: Number, default: 0 },
      xs: { type: [Number, Object], default: () => ({}) },
      sm: { type: [Number, Object], default: () => ({}) },
      md: { type: [Number, Object], default: () => ({}) },
      lg: { type: [Number, Object], default: () => ({}) },
      xl: { type: [Number, Object], default: () => ({}) },
      tag: { type: String, default: 'div' }
    })
  }
}

/**
 * 创建完整的图标 mock
 */
export function createIconsMock() {
  return {
    // Basic icons
    User: { name: 'User', template: '<i class="el-icon-user"></i>' },
    Search: { name: 'Search', template: '<i class="el-icon-search"></i>' },
    Plus: { name: 'Plus', template: '<i class="el-icon-plus"></i>' },
    Edit: { name: 'Edit', template: '<i class="el-icon-edit"></i>' },
    Delete: { name: 'Delete', template: '<i class="el-icon-delete"></i>' },
    Check: { name: 'Check', template: '<i class="el-icon-check"></i>' },
    Close: { name: 'Close', template: '<i class="el-icon-close"></i>' },
    Warning: { name: 'Warning', template: '<i class="el-icon-warning"></i>' },
    Info: { name: 'Info', template: '<i class="el-icon-info"></i>' },
    Success: { name: 'Success', template: '<i class="el-icon-success"></i>' },
    Error: { name: 'Error', template: '<i class="el-icon-error"></i>' },
    Loading: { name: 'Loading', template: '<i class="el-icon-loading"></i>' },
    ArrowUp: { name: 'ArrowUp', template: '<i class="el-icon-arrow-up"></i>' },
    ArrowDown: { name: 'ArrowDown', template: '<i class="el-icon-arrow-down"></i>' },
    ArrowLeft: { name: 'ArrowLeft', template: '<i class="el-icon-arrow-left"></i>' },
    ArrowRight: { name: 'ArrowRight', template: '<i class="el-icon-arrow-right"></i>' },

    // Filled icons
    SuccessFilled: { name: 'SuccessFilled', template: '<i class="el-icon-success-filled"></i>' },
    WarningFilled: { name: 'WarningFilled', template: '<i class="el-icon-warning-filled"></i>' },
    InfoFilled: { name: 'InfoFilled', template: '<i class="el-icon-info-filled"></i>' },
    ErrorFilled: { name: 'ErrorFilled', template: '<i class="el-icon-error-filled"></i>' },
    CircleCloseFilled: { name: 'CircleCloseFilled', template: '<i class="el-icon-circle-close-filled"></i>' },

    // Additional icons used in the project
    CircleCheck: { name: 'CircleCheck', template: '<i class="el-icon-circle-check"></i>' },
    CircleClose: { name: 'CircleClose', template: '<i class="el-icon-circle-close"></i>' },
    UserFilled: { name: 'UserFilled', template: '<i class="el-icon-user-filled"></i>' },
    Avatar: { name: 'Avatar', template: '<i class="el-icon-avatar"></i>' },
    Refresh: { name: 'Refresh', template: '<i class="el-icon-refresh"></i>' },
    Lock: { name: 'Lock', template: '<i class="el-icon-lock"></i>' },
    Upload: { name: 'Upload', template: '<i class="el-icon-upload"></i>' },
    Camera: { name: 'Camera', template: '<i class="el-icon-camera"></i>' },
    VideoCamera: { name: 'VideoCamera', template: '<i class="el-icon-video-camera"></i>' },
    SwitchButton: { name: 'SwitchButton', template: '<i class="el-icon-switch-button"></i>' },
    UploadFilled: { name: 'UploadFilled', template: '<i class="el-icon-upload-filled"></i>' },
    PictureFilled: { name: 'PictureFilled', template: '<i class="el-icon-picture-filled"></i>' },
    RefreshRight: { name: 'RefreshRight', template: '<i class="el-icon-refresh-right"></i>' },

    // Icons for navigation and UI components
    Home: { name: 'Home', template: '<i class="el-icon-home"></i>' },
    Setting: { name: 'Setting', template: '<i class="el-icon-setting"></i>' },
    Menu: { name: 'Menu', template: '<i class="el-icon-menu"></i>' },
    More: { name: 'More', template: '<i class="el-icon-more"></i>' },
    MoreFilled: { name: 'MoreFilled', template: '<i class="el-icon-more-filled"></i>' },

    // Data and file icons
    Folder: { name: 'Folder', template: '<i class="el-icon-folder"></i>' },
    FolderOpened: { name: 'FolderOpened', template: '<i class="el-icon-folder-opened"></i>' },
    Document: { name: 'Document', template: '<i class="el-icon-document"></i>' },
    Files: { name: 'Files', template: '<i class="el-icon-files"></i>' },

    // Status icons
    CircleCheckFilled: { name: 'CircleCheckFilled', template: '<i class="el-icon-circle-check-filled"></i>' },
    CircleCloseFilled: { name: 'CircleCloseFilled', template: '<i class="el-icon-circle-close-filled"></i>' },
    CirclePlus: { name: 'CirclePlus', template: '<i class="el-icon-circle-plus"></i>' },
    Remove: { name: 'Remove', template: '<i class="el-icon-remove"></i>' },

    // Navigation icons
    DArrowLeft: { name: 'DArrowLeft', template: '<i class="el-icon-d-arrow-left"></i>' },
    DArrowRight: { name: 'DArrowRight', template: '<i class="el-icon-d-arrow-right"></i>' },
    ArrowUpBold: { name: 'ArrowUpBold', template: '<i class="el-icon-arrow-up-bold"></i>' },
    ArrowDownBold: { name: 'ArrowDownBold', template: '<i class="el-icon-arrow-down-bold"></i>' },

    // Communication icons
    ChatDotRound: { name: 'ChatDotRound', template: '<i class="el-icon-chat-dot-round"></i>' },
    ChatLineRound: { name: 'ChatLineRound', template: '<i class="el-icon-chat-line-round"></i>' },
    Message: { name: 'Message', template: '<i class="el-icon-message"></i>' },

    // Business icons
    Bell: { name: 'Bell', template: '<i class="el-icon-bell"></i>' },
    BellFilled: { name: 'BellFilled', template: '<i class="el-icon-bell-filled"></i>' },
    Clock: { name: 'Clock', template: '<i class="el-icon-clock"></i>' },
    Timer: { name: 'Timer', template: '<i class="el-icon-timer"></i>' },

    // Action icons
    Share: { name: 'Share', template: '<i class="el-icon-share"></i>' },
    Star: { name: 'Star', template: '<i class="el-icon-star"></i>' },
    StarFilled: { name: 'StarFilled', template: '<i class="el-icon-star-filled"></i>' },
    Heart: { name: 'Heart', template: '<i class="el-icon-heart"></i>' },
    HeartFilled: { name: 'HeartFilled', template: '<i class="el-icon-heart-filled"></i>' }
  }
}

/**
 * 默认导出 Element Plus 测试环境
 */
export const elementPlusTestEnvironment = createElementPlusTestEnvironment()

export default elementPlusTestEnvironment
