import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  sanitizeHtml,
  escapeHtml,
  stripHtml,
  containsXss,
  sanitizeInput
} from '@/utils/security'

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn()
  }
}), { virtual: true })

// Import after mocking
import DOMPurify from 'dompurify'

describe('security utilities', () => {
  let mockDOMPurify: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDOMPurify = vi.mocked(DOMPurify)
    mockDOMPurify.sanitize.mockImplementation((html: string, config?: any) => {
      if (config?.ALLOWED_TAGS?.length === 0) {
        return html.replace(/<[^>]*>/g, '')
      }
      return html
        .replace(/<script[^>]*>.*?<\/script>/gi, '[SCRIPT REMOVED]')
        .replace(/javascript:/gi, '[JAVASCRIPT REMOVED]')
        .replace(/on\w+\s*=/gi, '[EVENT REMOVED]')
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sanitizeHtml', () => {
    it('should sanitize HTML with default configuration', () => {
      const html = '<p>Hello <script>alert("xss")</script> World</p>'
      const result = sanitizeHtml(html)

      expect(mockDOMPurify.sanitize).toHaveBeenCalledWith(html, expect.objectContaining({
        ALLOWED_TAGS: expect.any(Array),
        ALLOWED_ATTR: expect.any(Array),
        ALLOW_DATA_ATTR: false
      }))
    })

    it('should merge custom options with defaults', () => {
      const html = '<p>test</p>'
      const customOptions = { ALLOWED_TAGS: ['div'] }

      sanitizeHtml(html, customOptions)

      expect(mockDOMPurify.sanitize).toHaveBeenCalledWith(html, expect.objectContaining({
        ALLOWED_TAGS: ['div'], // Custom option should override default
        ALLOWED_ATTR: expect.any(Array),
        ALLOW_DATA_ATTR: false
      }))
    })

    it('should handle empty or null input', () => {
      expect(sanitizeHtml('')).toBe('')
      expect(sanitizeHtml(null as any)).toBe('')
      expect(sanitizeHtml(undefined as any)).toBe('')
    })

    it('should allow common HTML tags', () => {
      const html = '<p>Paragraph</p><strong>Bold</strong><em>Italic</em><a href="http://example.com">Link</a>'
      const result = sanitizeHtml(html)

      expect(mockDOMPurify.sanitize).toHaveBeenCalled()
    })

    it('should remove script tags and javascript URLs', () => {
      const html = '<p>Hello</p><script>alert("xss")</script><a href="javascript:alert(1)">Click</a>'
      sanitizeHtml(html)

      expect(mockDOMPurify.sanitize).toHaveBeenCalledWith(html, expect.any(Object))
    })
  })

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<div>"Hello & goodbye"</div>')).toBe('&lt;div&gt;&quot;Hello &amp; goodbye&quot;&lt;/div&gt;')
      expect(escapeHtml("It's a test")).toBe('It&#039;s a test')
    })

    it('should handle different input types', () => {
      expect(escapeHtml(123)).toBe('123')
      expect(escapeHtml(null)).toBe('')
      expect(escapeHtml(undefined)).toBe('')
      expect(escapeHtml('')).toBe('')
    })

    it('should escape all special characters', () => {
      const input = '&<>"\''
      const result = escapeHtml(input)
      expect(result).toBe('&amp;&lt;&gt;&quot;&#039;')
    })

    it('should not double-escape', () => {
      const input = '&lt;div&gt;'
      const result = escapeHtml(input)
      expect(result).toBe('&amp;lt;div&amp;gt;')
    })
  })

  describe('stripHtml', () => {
    it('should remove all HTML tags and return plain text', () => {
      const html = '<p>Hello <strong>World</strong>!</p><br><em>Test</em>'
      const result = stripHtml(html)

      expect(result).toBe('Hello World!Test')
      expect(mockDOMPurify.sanitize).toHaveBeenCalledWith(html, { ALLOWED_TAGS: [] })
    })

    it('should handle empty or null input', () => {
      expect(stripHtml('')).toBe('')
      expect(stripHtml(null)).toBe('')
      expect(stripHtml(undefined)).toBe('')
    })

    it('should trim whitespace', () => {
      expect(stripHtml('  <p>test</p>  ')).toBe('test')
    })

    it('should handle complex HTML structures', () => {
      const html = '<div><p>Nested <span>content</span></p><ul><li>Item 1</li><li>Item 2</li></ul></div>'
      const result = stripHtml(html)

      expect(result).toBe('Nested contentItem 1Item 2')
    })
  })

  describe('containsXss', () => {
    it('should detect script tags', () => {
      expect(containsXss('<script>alert("xss")</script>')).toBe(true)
      expect(containsXss('<SCRIPT>alert("xss")</SCRIPT>')).toBe(true)
      expect(containsXss('<script type="text/javascript">alert("xss")</script>')).toBe(true)
    })

    it('should detect javascript URLs', () => {
      expect(containsXss('javascript:alert("xss")')).toBe(true)
      expect(containsXss('JAVASCRIPT:alert("xss")')).toBe(true)
      expect(containsXss('javascript:void(0)')).toBe(true)
    })

    it('should detect event handlers', () => {
      expect(containsXss('<img onload="alert(1)">')).toBe(true)
      expect(containsXss('<div onclick="alert(1)">')).toBe(true)
      expect(containsXss('<button onmouseover=alert(1)>')).toBe(true)
    })

    it('should detect iframe, object, and embed tags', () => {
      expect(containsXss('<iframe src="malicious.com"></iframe>')).toBe(true)
      expect(containsXss('<object data="malicious.swf">')).toBe(true)
      expect(containsXss('<embed src="malicious.swf">')).toBe(true)
    })

    it('should detect link and meta tags', () => {
      expect(containsXss('<link rel="stylesheet" href="malicious.css">')).toBe(true)
      expect(containsXss('<meta http-equiv="refresh" content="0;url=malicious.com">')).toBe(true)
    })

    it('should detect style tags', () => {
      expect(containsXss('<style>body { background: url("malicious.com"); }</style>')).toBe(true)
    })

    it('should not flag safe content', () => {
      expect(containsXss('')).toBe(false)
      expect(containsXss('Hello World')).toBe(false)
      expect(containsXss('<p>Safe paragraph</p>')).toBe(false)
      expect(containsXss('<div class="safe">Content</div>')).toBe(false)
      expect(containsXss('<a href="http://example.com">Safe link</a>')).toBe(false)
      expect(containsXss('<img src="image.jpg" alt="Safe image">')).toBe(false)
    })

    it('should handle null or undefined input', () => {
      expect(containsXss(null as any)).toBe(false)
      expect(containsXss(undefined as any)).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should escape HTML when allowHtml is false (default)', () => {
      const input = '<script>alert("xss")</script>Hello & goodbye'
      const result = sanitizeInput(input)

      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Hello &amp; goodbye')
    })

    it('should sanitize HTML when allowHtml is true', () => {
      const input = '<p>Hello <script>alert("xss")</script> World</p>'
      const result = sanitizeInput(input, true)

      expect(result).toBe('[SCRIPT REMOVED]Hello [SCRIPT REMOVED] World')
    })

    it('should handle empty or null input', () => {
      expect(sanitizeInput('')).toBe('')
      expect(sanitizeInput(null as any)).toBe('')
      expect(sanitizeInput(undefined as any)).toBe('')
    })

    it('should preserve safe HTML when allowHtml is true', () => {
      const input = '<p>Safe <strong>text</strong></p>'
      const result = sanitizeInput(input, true)

      expect(result).toBe('<p>Safe <strong>text</strong></p>')
    })
  })

  describe('integration tests', () => {
    it('should work together to provide comprehensive XSS protection', () => {
      const maliciousInput = '<script>alert("xss")</script><img src="x" onerror="alert(1)">Hello World'

      // First check for XSS
      const hasXss = containsXss(maliciousInput)
      expect(hasXss).toBe(true)

      // Then sanitize based on result
      const safeOutput = sanitizeInput(maliciousInput, false)
      expect(safeOutput).not.toContain('<script>')
      expect(safeOutput).not.toContain('onerror')
      expect(safeOutput).toContain('Hello World')
    })

    it('should handle complex attack vectors', () => {
      const attacks = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert(1)>',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<object data="javascript:alert(1)"></object>'
      ]

      attacks.forEach(attack => {
        expect(containsXss(attack)).toBe(true)
        const sanitized = sanitizeInput(attack, false)
        expect(sanitized).not.toContain('script')
        expect(sanitized).not.toContain('javascript:')
        expect(sanitized).not.toContain('onerror')
      })
    })

    it('should preserve legitimate content', () => {
      const safeContent = '<p>This is <strong>safe</strong> content with <a href="http://example.com">links</a></p>'

      expect(containsXss(safeContent)).toBe(false)
      const sanitized = sanitizeInput(safeContent, true)
      expect(sanitized).toContain('<p>')
      expect(sanitized).toContain('<strong>')
      expect(sanitized).toContain('<a href="http://example.com">')
    })
  })

  describe('performance and edge cases', () => {
    it('should handle large inputs efficiently', () => {
      const largeInput = '<p>'.repeat(1000) + 'content' + '</p>'.repeat(1000)

      const start = Date.now()
      const result = sanitizeInput(largeInput, true)
      const end = Date.now()

      expect(end - start).toBeLessThan(1000) // Should complete within 1 second
      expect(result).toBeDefined()
    })

    it('should handle malformed HTML gracefully', () => {
      const malformed = '<p><strong><em>unclosed tags'
      const result = sanitizeInput(malformed, true)

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle special characters and unicode', () => {
      const unicodeInput = 'Hello 世界 🌍 <script>alert(1)</script>'
      const result = sanitizeInput(unicodeInput, false)

      expect(result).toContain('Hello 世界 🌍')
      expect(result).not.toContain('<script>')
    })
  })
})
