/**
 * 组件测试辅助函数
 * 提供统一的组件测试工具函数
 */

import { vi } from 'vitest'
import { mount, MountingOptions } from '@vue/test-utils'
import { Component, h } from 'vue'

/**
 * 创建作用域插槽mock
 */
export function createScopedSlotMock(scopedProps: Record<string, any> = {}) {
  return vi.fn().mockReturnValue(scopedProps)
}

/**
 * 挂载包含表格的组件
 */
export function mountWithTable<T extends Component>(
  component: T,
  options: MountingOptions<any> = {},
  tableData: any[] = []
): ReturnType<typeof mount> {
  const defaultOptions: MountingOptions<any> = {
    global: {
      stubs: {
        'el-table': {
          name: 'ElTable',
          props: { data: { type: Array, default: () => [] } },
          template: '<table class="el-table"><tbody><slot /></tbody></table>'
        },
        'el-table-column': {
          name: 'ElTableColumn',
          props: {
            type: { type: String, default: 'default' },
            label: String,
            prop: String,
            width: [String, Number]
          },
          setup(props: any, { slots }: any) {
            return () => {
              // 如果有默认插槽，调用它并传递作用域参数
              if (slots.default) {
                const slotContent = slots.default({
                  row: tableData[0] || {},
                  column: props,
                  $index: 0
                })
                return h('div', { class: 'el-table-column' }, slotContent)
              }
              return h('col', { style: { width: props.width + 'px' } })
            }
          }
        },
        'el-button': '<button><slot /></button>',
        'el-input': '<input />',
        'el-form': '<form><slot /></form>',
        'el-form-item': '<div><slot /></div>',
        'el-dialog': '<div><slot /></div>',
        'el-pagination': '<div class="el-pagination"><slot /></div>'
      }
    }
  }

  return mount(component, {
    ...defaultOptions,
    ...options,
    global: {
      ...defaultOptions.global,
      ...options.global,
      stubs: {
        ...defaultOptions.global?.stubs,
        ...options.global?.stubs
      }
    }
  })
}

/**
 * 创建表格测试数据mock
 */
export function createTableDataMock(count = 3, template?: Partial<any>): any[] {
  const defaultTemplate = {
    id: (i: number) => i + 1,
    name: (i: number) => `Item ${i + 1}`,
    status: (i: number) => ['active', 'inactive', 'pending'][i % 3],
    createdAt: () => new Date().toISOString()
  }

  const mergedTemplate = { ...defaultTemplate, ...template }

  return Array.from({ length: count }, (_, i) => {
    const item: any = {}
    Object.entries(mergedTemplate).forEach(([key, value]) => {
      item[key] = typeof value === 'function' ? value(i) : value
    })
    return item
  })
}

/**
 * 创建支持作用域插槽的表格列mock
 */
export function createTableColumnMock(props: Record<string, any> = {}, scopedProps: Record<string, any> = {}) {
  return {
    name: 'ElTableColumn',
    props: {
      type: { type: String, default: 'default' },
      label: String,
      prop: String,
      width: [String, Number],
      ...props
    },
    setup(props: any, { slots }: any) {
      return () => {
        // 如果有默认插槽，调用它并传递作用域参数
        if (slots.default) {
          const slotContent = slots.default({
            row: scopedProps.row || {},
            column: { ...props, ...scopedProps.column },
            $index: scopedProps.$index || 0
          })
          return h('div', { class: 'el-table-column' }, slotContent)
        }
        return h('col', { style: { width: props.width + 'px' } })
      }
    }
  }
}

/**
 * 创建完整的表格mock环境
 */
export function createTableMockEnvironment(tableData: any[] = []) {
  return {
    tableData,
    mountWithTable: (component: Component, options: MountingOptions<any> = {}) =>
      mountWithTable(component, options, tableData),
    createTableData: (count?: number, template?: Partial<any>) =>
      createTableDataMock(count, template),
    createTableColumn: (props?: Record<string, any>, scopedProps?: Record<string, any>) =>
      createTableColumnMock(props, scopedProps),
    createScopedSlot: (scopedProps: Record<string, any> = {}) =>
      createScopedSlotMock(scopedProps)
  }
}

/**
 * 验证作用域插槽是否正确接收参数
 */
export function assertScopedSlotCalled(slotMock: any, expectedProps: Record<string, any>) {
  expect(slotMock).toHaveBeenCalledWith(expectedProps)
}

/**
 * 验证表格数据渲染
 */
export function assertTableDataRendered(wrapper: any, data: any[]) {
  const table = wrapper.findComponent({ name: 'ElTable' })
  expect(table.exists()).toBe(true)
  expect(table.props('data')).toEqual(data)
}

/**
 * 创建表单验证mock
 */
export function createFormValidationMock() {
  return {
    validate: vi.fn().mockResolvedValue(true),
    validateField: vi.fn().mockResolvedValue([]),
    clearValidate: vi.fn(),
    resetFields: vi.fn()
  }
}

/**
 * 创建Element Plus组件mock
 */
export function createElementPlusMocks() {
  return {
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      closeAll: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue(),
      alert: vi.fn().mockResolvedValue(),
      prompt: vi.fn().mockResolvedValue()
    },
    ElLoading: {
      service: vi.fn(() => ({ close: vi.fn() }))
    },
    ElNotification: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    }
  }
}

