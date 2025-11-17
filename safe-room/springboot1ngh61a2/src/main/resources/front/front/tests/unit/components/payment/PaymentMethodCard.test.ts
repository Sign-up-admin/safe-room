import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PaymentMethodCard from '@/components/payment/PaymentMethodCard.vue'

const sampleMethod = {
  id: 'alipay',
  name: '支付宝',
  channel: '极速到账',
  description: '使用支付宝完成快捷支付',
  extra: '支持花呗分期',
  fee: '¥0 手续费',
  icon: '/icons/alipay.svg',
}

describe('PaymentMethodCard', () => {
  it('renders method details and highlights active state', () => {
    const wrapper = mount(PaymentMethodCard, {
      props: {
        method: sampleMethod,
        active: true,
      },
    })

    expect(wrapper.classes()).toContain('payment-method--active')
    expect(wrapper.find('img').attributes()).toMatchObject({
      src: sampleMethod.icon,
      alt: sampleMethod.name,
    })
    expect(wrapper.find('h4').text()).toBe(sampleMethod.name)
    expect(wrapper.find('header span').text()).toBe(sampleMethod.channel)
    expect(wrapper.find('.payment-method__content p').text()).toBe(sampleMethod.description)
    expect(wrapper.find('.payment-method__content small').text()).toBe(sampleMethod.extra)
    expect(wrapper.find('.payment-method__fee').text()).toBe(sampleMethod.fee)
  })

  it('emits select event with method id when clicked', async () => {
    const wrapper = mount(PaymentMethodCard, {
      props: {
        method: sampleMethod,
        active: false,
      },
    })

    expect(wrapper.classes()).not.toContain('payment-method--active')

    await wrapper.trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe(sampleMethod.id)
  })
})









