import { describe, expect, it, vi } from 'vitest'

vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue')
  const originalRenderSlot = actual.renderSlot
  const originalResolveComponent = actual.resolveComponent

  const elInputStub = actual.defineComponent({
    name: 'ElInputStub',
    props: {
      modelValue: {
        type: [String, Number],
        default: '',
      },
      type: {
        type: String,
        default: 'text',
      },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const onInput = (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value)
      return () =>
        actual.h(props.type === 'textarea' ? 'textarea' : 'input', {
          class: 'el-input-stub',
          value: props.modelValue,
          onInput,
        })
    },
  })

  const elFormStub = actual.defineComponent({
    name: 'ElFormStub',
    setup(_, { slots }) {
      return () => actual.h('form', { class: 'el-form' }, slots.default ? slots.default() : [])
    },
  })

  const elFormItemStub = actual.defineComponent({
    name: 'ElFormItemStub',
    props: {
      label: {
        type: String,
        default: '',
      },
    },
    setup(props, { slots }) {
      return () =>
        actual.h('div', { class: 'el-form-item' }, [
          actual.h('label', props.label),
          ...(slots.default ? slots.default() : []),
        ])
    },
  })

  const elCheckboxStub = actual.defineComponent({
    name: 'ElCheckboxStub',
    props: {
      modelValue: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:modelValue'],
    setup(props, { emit, slots }) {
      const onChange = (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).checked)
      return () =>
        actual.h('label', { class: 'el-checkbox-stub' }, [
          actual.h('input', { type: 'checkbox', checked: props.modelValue, onChange }),
          ...(slots.default ? slots.default() : []),
        ])
    },
  })

  const componentMap: Record<string, any> = {
    'el-form': elFormStub,
    'el-form-item': elFormItemStub,
    'el-input': elInputStub,
    'el-checkbox': elCheckboxStub,
  }

  return {
    ...actual,
    renderSlot: (...args: Parameters<typeof originalRenderSlot>) => {
      const [slots, name, props = {}, fallback] = args
      if (!actual.getCurrentInstance?.()) {
        const slot = slots?.[name]
        const children = slot ? slot(props) : fallback ? fallback() : []
        return actual.h(actual.Fragment, null, children)
      }
      return originalRenderSlot(...args)
    },
    resolveComponent: (name: string, maybeSelfRef?: boolean) => {
      if (componentMap[name]) {
        return componentMap[name]
      }
      return originalResolveComponent(name as any, maybeSelfRef as any)
    },
  }
})

import { mount } from '@vue/test-utils'
import BookingSummary from '@/components/booking/BookingSummary.vue'

const mountSummary = (props = {}, slots = {}) =>
  mount(BookingSummary, {
    props: {
      contact: '',
      phone: '',
      remark: '',
      agreement: false,
      ...props,
    },
    slots,
  })

describe('BookingSummary', () => {
  it('renders booking information and action slot', () => {
    const wrapper = mountSummary(
      {
        courseName: 'AI 燃脂营',
        slotLabel: '周一 09:00',
        amount: 188,
      },
      {
        actions: '<button class="confirm-btn">确认预约</button>',
      },
    )

    const cards = wrapper.findAll('.booking-summary__grid article')
    expect(cards[0].text()).toContain('AI 燃脂营')
    expect(cards[1].text()).toContain('周一 09:00')
    expect(cards[2].text()).toContain('¥188.00')
    expect(wrapper.find('.confirm-btn').exists()).toBe(true)
  })

  it('emits updates when form fields change', async () => {
    const wrapper = mountSummary({
      contact: '张三',
      phone: '13800000000',
      remark: '加强核心',
      agreement: true,
    })

    const textInputs = wrapper.findAll('input.el-input-stub')
    expect(textInputs).toHaveLength(2)

    await textInputs[0].setValue('李四')
    await textInputs[1].setValue('13900000000')

    const remarkInput = wrapper.find('textarea.el-input-stub')
    await remarkInput.setValue('体验燃脂')

    const checkbox = wrapper.find('.el-checkbox-stub input[type="checkbox"]')
    await checkbox.setValue(false)

    expect(wrapper.emitted('update:contact')?.[0]?.[0]).toBe('李四')
    expect(wrapper.emitted('update:phone')?.[0]?.[0]).toBe('13900000000')
    expect(wrapper.emitted('update:remark')?.[0]?.[0]).toBe('体验燃脂')
    expect(wrapper.emitted('update:agreement')?.[0]?.[0]).toBe(false)
  })
})


