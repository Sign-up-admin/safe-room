import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PaymentResult from '@/components/payment/PaymentResult.vue'

const mountResult = (props = {}) =>
  mount(PaymentResult, {
    props: {
      orderNumber: 'ORDER-001',
      amount: 299,
      ...props,
    },
  })

describe('PaymentResult', () => {
  it('shows success state with amount', () => {
    const wrapper = mountResult({ status: 'success' })
    expect(wrapper.classes()).toContain('payment-result--success')
    expect(wrapper.find('h4').text()).toBe('支付成功')
    expect(wrapper.find('p').text()).toBe('已完成支付 ¥299.00')
    expect(wrapper.text()).toContain('订单号：ORDER-001')
  })

  it('shows failure state message', () => {
    const wrapper = mountResult({ status: 'failed', amount: 0 })
    expect(wrapper.classes()).toContain('payment-result--failed')
    expect(wrapper.find('h4').text()).toBe('支付失败')
    expect(wrapper.find('p').text()).toBe('支付未完成，请重试或联系顾问')
  })

  it('shows processing state by default', () => {
    const wrapper = mountResult({ status: 'processing' })
    expect(wrapper.classes()).toContain('payment-result--processing')
    expect(wrapper.find('h4').text()).toBe('等待支付结果')
    expect(wrapper.find('p').text()).toBe('请完成支付，若已支付请点击"我已完成支付"')
  })
})
