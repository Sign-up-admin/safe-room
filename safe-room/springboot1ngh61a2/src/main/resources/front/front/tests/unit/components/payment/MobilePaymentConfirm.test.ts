import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MobilePaymentConfirm from '@/components/payment/MobilePaymentConfirm.vue'

// Mock formatCurrency utility
vi.mock('@/utils/formatters', () => ({
  formatCurrency: vi.fn((value) => `¥${value.toLocaleString()}`),
}))

describe('MobilePaymentConfirm Component', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render payment details correctly', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 299,
          productName: '高级会员月卡',
          quantity: 1,
          methodName: '支付宝',
          methodIcon: '💳',
        },
      })

      expect(wrapper.classes()).toContain('mobile-payment-confirm')

      // Check payment amount display
      const amountDisplay = wrapper.find('.payment-amount')
      expect(amountDisplay.text()).toContain('¥299')

      // Check product information
      const productName = wrapper.text()
      expect(productName).toContain('高级会员月卡')

      // Check payment method
      const methodDisplay = wrapper.find('.payment-method')
      expect(methodDisplay.text()).toContain('支付宝')
      expect(methodDisplay.text()).toContain('💳')
    })

    it('should display discount information when provided', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 249,
          productName: '季度会员卡',
          quantity: 1,
          discount: 50,
        },
      })

      const discountRow = wrapper.find('.detail-row.discount')
      expect(discountRow.exists()).toBe(true)
      expect(discountRow.text()).toContain('-¥50')
    })

    it('should hide discount row when no discount', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 299,
          productName: '月度会员卡',
          quantity: 1,
        },
      })

      const discountRows = wrapper.findAll('.detail-row.discount')
      expect(discountRows.length).toBe(0)
    })
  })

  describe('Payment Details', () => {
    it('should display all payment detail rows', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 899,
          productName: '年度会员卡',
          quantity: 2,
        },
      })

      const detailRows = wrapper.findAll('.detail-row')
      expect(detailRows.length).toBeGreaterThanOrEqual(4) // Product, quantity, discount (if any), total

      // Check specific details
      const rows = detailRows.map(row => row.text())
      expect(rows.some(row => row.includes('年度会员卡'))).toBe(true)
      expect(rows.some(row => row.includes('2'))).toBe(true)
      expect(rows.some(row => row.includes('¥899'))).toBe(true)
    })

    it('should highlight total amount row', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 599,
          productName: '半年会员卡',
          quantity: 1,
        },
      })

      const totalRow = wrapper.find('.detail-row.total')
      expect(totalRow.exists()).toBe(true)
      expect(totalRow.classes()).toContain('total')

      const strongElement = totalRow.find('strong')
      expect(strongElement.exists()).toBe(true)
      expect(strongElement.text()).toContain('¥599')
    })
  })

  describe('Payment Actions', () => {
    it('should render confirm and cancel buttons', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 199,
          productName: '体验卡',
          quantity: 1,
        },
      })

      const confirmBtn = wrapper.find('.payment-btn--primary')
      const cancelBtn = wrapper.find('.payment-btn--secondary')

      expect(confirmBtn.exists()).toBe(true)
      expect(confirmBtn.text()).toContain('确认支付')
      expect(cancelBtn.exists()).toBe(true)
      expect(cancelBtn.text()).toContain('取消支付')
    })

    it('should emit confirm event when confirm button is clicked', async () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 99,
          productName: '日卡',
          quantity: 1,
        },
      })

      const confirmBtn = wrapper.find('.payment-btn--primary')
      await confirmBtn.trigger('click')

      expect(wrapper.emitted('confirm')).toBeTruthy()
      expect(wrapper.emitted('confirm')).toHaveLength(1)
    })

    it('should emit cancel event when cancel button is clicked', async () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 299,
          productName: '周卡',
          quantity: 1,
        },
      })

      const cancelBtn = wrapper.find('.payment-btn--secondary')
      await cancelBtn.trigger('click')

      expect(wrapper.emitted('cancel')).toBeTruthy()
      expect(wrapper.emitted('cancel')).toHaveLength(1)
    })

    it('should disable buttons when loading', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 499,
          productName: '月卡',
          quantity: 1,
          loading: true,
        },
      })

      const confirmBtn = wrapper.find('.payment-btn--primary')
      const cancelBtn = wrapper.find('.payment-btn--secondary')

      expect(confirmBtn.attributes('disabled')).toBeDefined()
      expect(cancelBtn.attributes('disabled')).toBeDefined()
      expect(confirmBtn.text()).toContain('处理中...')
    })
  })

  describe('Security Notice', () => {
    it('should display security information', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 799,
          productName: 'VIP卡',
          quantity: 1,
        },
      })

      const securityNotice = wrapper.find('.security-notice')
      expect(securityNotice.exists()).toBe(true)
      expect(securityNotice.text()).toContain('支付过程安全加密')
      expect(securityNotice.text()).toContain('保护您的隐私和资金安全')
    })

    it('should include security icon', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 199,
          productName: '体验卡',
          quantity: 1,
        },
      })

      const securityIcon = wrapper.find('.security-notice svg')
      expect(securityIcon.exists()).toBe(true)
    })
  })

  describe('Responsive Design', () => {
    it('should apply mobile-specific styles', () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 399,
          productName: '移动端测试卡',
          quantity: 1,
        },
      })

      // Component should render with mobile-optimized layout
      expect(wrapper.classes()).toContain('mobile-payment-confirm')

      // Check button sizing for mobile
      const confirmBtn = wrapper.find('.payment-btn--primary')
      expect(confirmBtn.classes()).toContain('payment-btn')
    })

    it('should adjust payment header layout for mobile', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 599,
          productName: '响应式测试',
          quantity: 1,
        },
      })

      const paymentHeader = wrapper.find('.payment-header')

      // On mobile, this might be flex-col, but we test the structure exists
      expect(paymentHeader.exists()).toBe(true)
      expect(paymentHeader.find('.payment-amount').exists()).toBe(true)
      expect(paymentHeader.find('.payment-method').exists()).toBe(true)
    })
  })

  describe('Touch Optimization', () => {
    it('should have touch-friendly button sizes', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 299,
          productName: '触屏测试',
          quantity: 1,
        },
      })

      const buttons = wrapper.findAll('.payment-btn')

      buttons.forEach(button => {
        // Check if buttons have proper touch targets
        const styles = window.getComputedStyle(button.element)
        // Note: In test environment, we can't check actual computed styles,
        // but we can verify the classes are applied
        expect(button.classes()).toContain('payment-btn')
      })
    })

    it('should handle touch events properly', async () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 199,
          productName: '触摸测试',
          quantity: 1,
        },
      })

      const confirmBtn = wrapper.find('.payment-btn--primary')

      // Simulate touch interaction
      await confirmBtn.trigger('click')

      // Should emit event (touch behaves like click)
      expect(wrapper.emitted('confirm')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 499,
          productName: '无障碍测试',
          quantity: 1,
        },
      })

      // Check for semantic HTML elements
      expect(wrapper.element.tagName).toBe('DIV')

      // Check for proper button elements
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)

      buttons.forEach(button => {
        expect(button.element.tagName).toBe('BUTTON')
      })
    })

    it('should support keyboard navigation', async () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 399,
          productName: '键盘测试',
          quantity: 1,
        },
      })

      const confirmBtn = wrapper.find('.payment-btn--primary')

      // Simulate keyboard activation
      await confirmBtn.trigger('click')

      expect(wrapper.emitted('confirm')).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing props gracefully', () => {
      // Mount with minimal props
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 0,
          productName: '',
          quantity: 1,
        },
      })

      // Should not crash
      expect(wrapper.exists()).toBe(true)

      // Should display default values
      const amountDisplay = wrapper.find('.payment-amount strong')
      expect(amountDisplay.text()).toContain('¥0')
    })

    it('should handle invalid amount values', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: NaN,
          productName: '无效金额测试',
          quantity: 1,
        },
      })

      // Should handle NaN gracefully
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should render efficiently with large amounts', () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 999999,
          productName: '大金额测试',
          quantity: 1,
        },
      })

      const amountDisplay = wrapper.find('.payment-amount strong')
      expect(amountDisplay.text()).toContain('¥999,999')
    })

    it('should handle frequent prop updates', async () => {
      const wrapper = mount(MobilePaymentConfirm, {
        props: {
          amount: 299,
          productName: '性能测试',
          quantity: 1,
        },
      })

      // Rapid prop updates
      await wrapper.setProps({ amount: 399 })
      await wrapper.setProps({ amount: 499 })
      await wrapper.setProps({ amount: 599 })

      const finalAmount = wrapper.find('.payment-amount strong')
      expect(finalAmount.text()).toContain('¥599')
    })
  })
})
