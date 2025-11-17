import { mount } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import SafeHtml from '@/components/common/SafeHtml.vue'

const mockSanitizeHtml = vi.fn((html: string) => html.replace(/<script>/g, ''))

vi.mock('@/utils/security', () => ({
  sanitizeHtml: (html: string, options?: any) => mockSanitizeHtml(html, options),
}))

describe('SafeHtml', () => {
  beforeEach(() => {
    mockSanitizeHtml.mockClear()
    mockSanitizeHtml.mockImplementation((html: string) => html.replace(/<script>/g, ''))
  })

  it('renders sanitized HTML when html prop is provided', () => {
    const wrapper = mount(SafeHtml, {
      props: {
        html: '<p>Hello World</p>',
      },
    })

    expect(wrapper.html()).toContain('<p>Hello World</p>')
    expect(wrapper.find('div').exists()).toBe(true)
  })

  it('applies className prop', () => {
    const wrapper = mount(SafeHtml, {
      props: {
        html: '<p>Test</p>',
        className: 'custom-class',
      },
    })

    expect(wrapper.classes()).toContain('custom-class')
  })

  it('passes allowTags and allowAttrs to sanitizeHtml', () => {
    mount(SafeHtml, {
      props: {
        html: '<p>Test</p>',
        allowTags: ['p', 'div'],
        allowAttrs: ['class'],
      },
    })

    // Verify sanitizeHtml was called
    expect(mockSanitizeHtml).toHaveBeenCalled()
    const callArgs = mockSanitizeHtml.mock.calls[0]
    expect(callArgs[0]).toBe('<p>Test</p>')
    expect(callArgs[1]).toMatchObject({
      ALLOWED_TAGS: ['p', 'div'],
      ALLOWED_ATTR: ['class'],
    })
  })
})

