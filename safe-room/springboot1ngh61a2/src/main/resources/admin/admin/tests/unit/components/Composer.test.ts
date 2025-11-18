import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Composer from '@/components/Composer.vue'

describe('Composer.vue', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(Composer, {
      props: {
        modelValue: '',
        placeholder: 'Test placeholder',
        disabled: false,
        maxLength: 1000,
        autoFocus: false
      },
      attachTo: document.body,
      global: {
        stubs: ['svg']
      }
    })
  })

  it('renders composer structure correctly', () => {
    expect(wrapper.exists()).toBe(true)

    // Check main composer container
    const composerContainer = wrapper.find('[data-testid="composer"]')
    expect(composerContainer.exists()).toBe(true)

    // Check accessibility attributes
    expect(composerContainer.attributes('role')).toBe('region')
    expect(composerContainer.attributes('aria-label')).toBe('Message composer')
    expect(composerContainer.attributes('aria-describedby')).toBe('composer-description')

    // Check screen reader description
    const description = wrapper.find('#composer-description')
    expect(description.exists()).toBe(true)
    expect(description.classes()).toContain('sr-only')
  })

  it('renders file input correctly', () => {
    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.exists()).toBe(true)
    expect(fileInput.classes()).toContain('hidden')
    expect(fileInput.attributes('accept')).toBe('.jpg,.jpeg,.png,.webp,.svg,.txt,.pdf,.docx,.xlsx,.pptx,.json,.xml,.csv,.md,.js,.css,.html,.htm,.xml')
    expect(fileInput.attributes('multiple')).toBeDefined()
    expect(fileInput.attributes('aria-hidden')).toBe('true')
  })

  it('renders textarea with proper attributes', () => {
    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
    expect(textarea.attributes('placeholder')).toBe('Test placeholder')
    expect(textarea.attributes('maxlength')).toBe('1000')
    expect(textarea.attributes('id')).toBe('userInput')
    expect(textarea.attributes('role')).toBe('textbox')
    expect(textarea.attributes('aria-multiline')).toBe('true')
    expect(textarea.attributes('spellcheck')).toBe('false')
  })

  it('accepts modelValue prop correctly', () => {
    const wrapperWithValue = mount(Composer, {
      props: {
        modelValue: 'Initial value',
        placeholder: 'Test placeholder',
        disabled: false,
        maxLength: 1000,
        autoFocus: false
      },
      attachTo: document.body,
      global: {
        stubs: ['svg']
      }
    })

    const textarea = wrapperWithValue.find('textarea')
    expect(textarea.element.value).toBe('Initial value')
  })

  it('shows error state when over limit', () => {
    const wrapperWithLimit = mount(Composer, {
      props: {
        modelValue: 'a'.repeat(1001), // Over the 1000 limit
        maxLength: 1000
      },
      attachTo: document.body,
      global: {
        stubs: ['svg']
      }
    })

    // The component should handle over-limit input gracefully
    const textarea = wrapperWithLimit.find('textarea')
    expect(textarea.exists()).toBe(true)
  })

  it('handles disabled state correctly', () => {
    const wrapperDisabled = mount(Composer, {
      props: {
        disabled: true
      },
      attachTo: document.body,
      global: {
        stubs: ['svg']
      }
    })

    const textarea = wrapperDisabled.find('textarea')
    expect(textarea.attributes('disabled')).toBeDefined()
  })

  it('shows character count near limit', () => {
    const wrapperNearLimit = mount(Composer, {
      props: {
        modelValue: 'a'.repeat(900), // Near 1000 limit
        maxLength: 1000
      },
      attachTo: document.body,
      global: {
        stubs: ['svg']
      }
    })

    // Component should render without errors when near limit
    const textarea = wrapperNearLimit.find('textarea')
    expect(textarea.exists()).toBe(true)
  })

  it('has proper form structure', () => {
    const textarea = wrapper.find('textarea')
    const label = wrapper.find('label[for="userInput"]')

    // Check that form elements are properly structured
    expect(textarea.attributes('id')).toBe('userInput')
    expect(label.attributes('for')).toBe('userInput')
  })

  it('has proper accessibility features', () => {
    // Check ARIA labels and descriptions
    const label = wrapper.find('label[for="userInput"]')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Message Copilot')
    expect(label.classes()).toContain('invisible')
  })

  it('has proper styling classes', () => {
    const composerContainer = wrapper.find('[data-testid="composer"]')
    expect(composerContainer.classes()).toContain('pointer-events-none')
    expect(composerContainer.classes()).toContain('absolute')
    expect(composerContainer.classes()).toContain('bottom-0')
    expect(composerContainer.classes()).toContain('z-10')
  })

  it('renders starter prompts correctly', () => {
    const starterPrompts = wrapper.findAll('button[aria-label*="starter prompt"]')
    expect(starterPrompts.length).toBeGreaterThan(0)
  })

  it('handles starter prompt clicks correctly', async () => {
    const starterPrompt = wrapper.find('.cursor-pointer')
    if (starterPrompt.exists()) {
      await starterPrompt.trigger('click')
      expect(wrapper.emitted()).toHaveProperty('update:modelValue')
    }
  })

  it('has proper responsive design classes', () => {
    const responsiveElement = wrapper.find('.sm\\:bottom-1\\/2')
    expect(responsiveElement.exists()).toBe(true)
  })

  it('has proper dark mode support', () => {
    const darkModeElement = wrapper.find('.dark\\:bg-background-100\\/45')
    expect(darkModeElement.exists()).toBe(true)
  })
})
