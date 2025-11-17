import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Stepper from '@/components/common/Stepper.vue'

describe('Stepper', () => {
  it('calculates step statuses and triggers CTA actions', async () => {
    const cta = vi.fn()
    const steps = [
      { label: '信息确认' },
      { label: '支付订单' },
      { label: '预约成功', status: 'completed', cta, ctaLabel: '查看预约' },
    ]

    const wrapper = mount(Stepper, {
      props: {
        steps,
        current: 1,
        orientation: 'vertical',
      },
    })

    const items = wrapper.findAll('.tech-stepper__item')
    expect(items).toHaveLength(3)
    expect(items[0].classes()).toContain('tech-stepper__item--completed')
    expect(items[1].classes()).toContain('tech-stepper__item--current')
    expect(items[2].classes()).toContain('tech-stepper__item--completed')

    await wrapper.find('.tech-stepper__cta').trigger('click')
    expect(cta).toHaveBeenCalled()
  })
})


