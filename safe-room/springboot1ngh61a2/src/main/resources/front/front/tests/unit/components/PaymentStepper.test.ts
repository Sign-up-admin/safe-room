import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PaymentStepper from '@/components/payment/PaymentStepper.vue'

describe('PaymentStepper', () => {
  it('applies step statuses based on current step', () => {
    const steps = [
      { label: '选择课程', description: '挑选训练方案' },
      { label: '填写信息', description: '确认个人信息' },
      { label: '支付结果', description: '生成订单' },
    ]

    const wrapper = mount(PaymentStepper, {
      props: {
        steps,
        current: 2,
      },
    })

    const items = wrapper.findAll('.payment-stepper__item')
    expect(items[0].classes()).toContain('payment-stepper__item--done')
    expect(items[1].classes()).toContain('payment-stepper__item--current')
    expect(items[2].classes()).toContain('payment-stepper__item--upcoming')
  })
})


