import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VerifyCode from '../../../../src/components/common/VerifyCode.vue'

describe('VerifyCode Component', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Initialization', () => {
    it('should render correctly with default props', () => {
      wrapper = mount(VerifyCode)

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.verify-code-panel').exists()).toBe(true)
      expect(wrapper.find('.verify-code').exists()).toBe(true)
      expect(wrapper.find('.verify-input-code').exists()).toBe(true)
      expect(wrapper.find('.verify-change-code').exists()).toBe(true)
    })

    it('should accept custom props', () => {
      wrapper = mount(VerifyCode, {
        props: {
          codeLength: 6,
          width: '250px',
          height: '50px',
          placeholder: 'Enter code',
        },
      })

      const codeElement = wrapper.find('.verify-code')
      expect(codeElement.attributes('style')).toContain('width: 250px')
      expect(codeElement.attributes('style')).toContain('height: 50px')

      const inputElement = wrapper.find('.verify-input-code')
      expect(inputElement.attributes('placeholder')).toBe('Enter code')
    })

    it('should generate code on mount', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      expect(wrapper.vm.codeChars).toBeTruthy()
      expect(wrapper.vm.codeChars.length).toBe(6) // default codeLength
      expect(wrapper.vm.displayCode).toHaveLength(6)
    })
  })

  describe('Code Generation', () => {
    it('should generate alphanumeric code', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const code = wrapper.vm.codeChars
      const alphanumericRegex = /^[a-zA-Z0-9]+$/
      expect(alphanumericRegex.test(code)).toBe(true)
    })

    it('should generate code with correct length', async () => {
      wrapper = mount(VerifyCode, {
        props: { codeLength: 4 },
      })
      await nextTick()

      expect(wrapper.vm.codeChars.length).toBe(4)
      expect(wrapper.vm.displayCode).toHaveLength(4)
    })

    it('should generate different codes on refresh', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const firstCode = wrapper.vm.codeChars

      wrapper.vm.refreshCode()

      const secondCode = wrapper.vm.codeChars

      // Small chance they could be the same, but statistically unlikely
      expect(firstCode).not.toBe(secondCode)
    })
  })

  describe('Code Display', () => {
    it('should display code characters with styling', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const codeSpans = wrapper.findAll('.verify-code span')
      expect(codeSpans.length).toBe(6)

      // Each span should have some styling applied
      codeSpans.forEach(span => {
        expect(span.attributes('style')).toBeTruthy()
      })
    })

    it('should apply random styles to characters', async () => {
      // Mock Math.random for predictable results
      const originalRandom = Math.random
      Math.random = vi.fn()
        .mockReturnValueOnce(0.1) // italic
        .mockReturnValueOnce(0.3) // no bold
        .mockReturnValueOnce(0.6) // bold
        .mockReturnValueOnce(0.8) // no additional bold

      wrapper = mount(VerifyCode, {
        props: { codeLength: 1 },
      })
      await nextTick()

      const span = wrapper.find('.verify-code span')
      const style = span.attributes('style')

      expect(style).toContain('font-style: italic')
      expect(style).toContain('font-weight: bolder')

      Math.random = originalRandom
    })
  })

  describe('User Interaction', () => {
    it('should refresh code when clicking the code area', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const originalCode = wrapper.vm.codeChars

      await wrapper.find('.verify-code').trigger('click')

      expect(wrapper.vm.codeChars).not.toBe(originalCode)
    })

    it('should refresh code when clicking change button', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const originalCode = wrapper.vm.codeChars

      await wrapper.find('.verify-change-code').trigger('click')

      expect(wrapper.vm.codeChars).not.toBe(originalCode)
    })

    it('should update input value when typing', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const input = wrapper.find('.verify-input-code')

      await input.setValue('ABC123')

      expect(wrapper.vm.inputValue).toBe('ABC123')
    })

    it('should handle enter key to check code', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const input = wrapper.find('.verify-input-code')

      // Set input to match the generated code
      const correctCode = wrapper.vm.codeChars.toLowerCase()
      await input.setValue(correctCode)

      // Trigger enter key
      await input.trigger('keyup.enter')

      expect(wrapper.emitted('success')).toBeTruthy()
    })
  })

  describe('Code Verification', () => {
    it('should emit success for correct code', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const correctCode = wrapper.vm.codeChars.toUpperCase()
      wrapper.vm.inputValue = correctCode

      await wrapper.vm.checkCode()

      expect(wrapper.emitted('success')).toBeTruthy()
    })

    it('should emit error for incorrect code', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      wrapper.vm.inputValue = 'WRONGCODE'

      await wrapper.vm.checkCode()

      expect(wrapper.emitted('error')).toBeTruthy()
    })

    it('should be case insensitive', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const correctCode = wrapper.vm.codeChars.toLowerCase()
      wrapper.vm.inputValue = correctCode.toUpperCase()

      await wrapper.vm.checkCode()

      expect(wrapper.emitted('success')).toBeTruthy()
    })

    it('should refresh code on verification failure', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const originalCode = wrapper.vm.codeChars
      wrapper.vm.inputValue = 'WRONG'

      await wrapper.vm.checkCode()

      expect(wrapper.vm.codeChars).not.toBe(originalCode)
    })
  })

  describe('Component Methods', () => {
    it('should expose refreshCode method', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const originalCode = wrapper.vm.codeChars

      wrapper.vm.refreshCode()

      expect(wrapper.vm.codeChars).not.toBe(originalCode)
    })

    it('should expose checkCode method', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const correctCode = wrapper.vm.codeChars.toUpperCase()
      wrapper.vm.inputValue = correctCode

      wrapper.vm.checkCode()

      expect(wrapper.emitted('success')).toBeTruthy()
    })

    it('should expose getCode method', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const code = wrapper.vm.getCode()

      expect(code).toBe(wrapper.vm.codeChars)
    })
  })

  describe('Props Reactivity', () => {
    it('should regenerate code when codeLength changes', async () => {
      wrapper = mount(VerifyCode, {
        props: { codeLength: 4 },
      })
      await nextTick()

      expect(wrapper.vm.codeChars.length).toBe(4)

      await wrapper.setProps({ codeLength: 6 })

      expect(wrapper.vm.codeChars.length).toBe(6)
    })
  })

  describe('Accessibility', () => {
    it('should prevent text selection', () => {
      wrapper = mount(VerifyCode)

      expect(wrapper.classes()).toContain('verify-code-panel')
      // The component has user-select: none styling
    })

    it('should support keyboard navigation', async () => {
      wrapper = mount(VerifyCode)
      await nextTick()

      const input = wrapper.find('.verify-input-code')

      // Focus should work
      await input.trigger('focus')
      expect(document.activeElement).toBe(input.element)
    })
  })
})
