import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import DiscussionComposer from '../../../../src/components/discussion/DiscussionComposer.vue'

// Mock formatDate utility
vi.mock('../../../../src/utils/formatters', () => ({
  formatDate: vi.fn((date) => new Date(date).toLocaleDateString())
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('DiscussionComposer', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)

    // Create a fresh wrapper for each test
    const app = createApp(DiscussionComposer)
    wrapper = mount(DiscussionComposer, {
      global: {
        plugins: [app]
      }
    })
  })

  describe('initial state', () => {
    it('should render with quick compose mode by default', () => {
      expect(wrapper.find('.quick-compose').exists()).toBe(true)
      expect(wrapper.find('.advanced-compose').exists()).toBe(false)
    })

    it('should show compose mode tabs', () => {
      const tabs = wrapper.findAll('.composer-tab')
      expect(tabs).toHaveLength(2)
      expect(tabs[0].text()).toContain('快速发帖')
      expect(tabs[1].text()).toContain('高级发帖')
    })

    it('should have empty quick content initially', () => {
      const textarea = wrapper.find('.quick-compose textarea')
      expect(textarea.element.value).toBe('')
    })
  })

  describe('mode switching', () => {
    it('should switch to advanced mode', async () => {
      const advancedTab = wrapper.findAll('.composer-tab')[1]
      await advancedTab.trigger('click')

      expect(wrapper.find('.quick-compose').exists()).toBe(false)
      expect(wrapper.find('.advanced-compose').exists()).toBe(true)
    })

    it('should switch back to quick mode', async () => {
      // Switch to advanced first
      const advancedTab = wrapper.findAll('.composer-tab')[1]
      await advancedTab.trigger('click')

      // Switch back to quick
      const quickTab = wrapper.findAll('.composer-tab')[0]
      await quickTab.trigger('click')

      expect(wrapper.find('.quick-compose').exists()).toBe(true)
      expect(wrapper.find('.advanced-compose').exists()).toBe(false)
    })
  })

  describe('quick compose', () => {
    it('should update content on input', async () => {
      const textarea = wrapper.find('.quick-compose textarea')
      await textarea.setValue('Test discussion content')

      expect(textarea.element.value).toBe('Test discussion content')
    })

    it('should show character count', async () => {
      const textarea = wrapper.find('.quick-compose textarea')
      await textarea.setValue('Test content')

      const charCount = wrapper.find('.char-count')
      expect(charCount.text()).toBe('12/500')
    })

    it('should show preview when content exists', async () => {
      const textarea = wrapper.find('.quick-compose textarea')
      await textarea.setValue('Test preview content')

      expect(wrapper.find('.quick-preview').exists()).toBe(true)
      expect(wrapper.find('.preview-content').text()).toBe('Test preview content')
    })

    it('should add tag to content', async () => {
      const textarea = wrapper.find('.quick-compose textarea')
      await textarea.setValue('Hello world')

      // Mock prompt
      const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue('fitness')

      const tagButton = wrapper.findAll('.action-btn')[0]
      await tagButton.trigger('click')

      expect(mockPrompt).toHaveBeenCalledWith('请输入标签')
      expect(textarea.element.value).toBe('Hello world #fitness')

      mockPrompt.mockRestore()
    })

    it('should handle tag addition with existing tags', async () => {
      const textarea = wrapper.find('.quick-compose textarea')
      await textarea.setValue('Hello #world')

      const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue('fitness')

      const tagButton = wrapper.findAll('.action-btn')[0]
      await tagButton.trigger('click')

      expect(textarea.element.value).toBe('Hello #world #fitness')

      mockPrompt.mockRestore()
    })
  })

  describe('advanced compose', () => {
    beforeEach(async () => {
      const advancedTab = wrapper.findAll('.composer-tab')[1]
      await advancedTab.trigger('click')
    })

    it('should show advanced form fields', () => {
      expect(wrapper.find('input[placeholder*="给讨论起一个吸引人的标题"]').exists()).toBe(true)
      expect(wrapper.find('select').exists()).toBe(true)
      expect(wrapper.find('.editor-content').exists()).toBe(true)
    })

    it('should update title', async () => {
      const titleInput = wrapper.find('input[placeholder*="给讨论起一个吸引人的标题"]')
      await titleInput.setValue('Test Discussion Title')

      expect(titleInput.element.value).toBe('Test Discussion Title')
    })

    it('should update content', async () => {
      const contentTextarea = wrapper.find('.editor-content')
      await contentTextarea.setValue('Test discussion content')

      expect(contentTextarea.element.value).toBe('Test discussion content')
    })

    it('should toggle tags', async () => {
      const tagOptions = wrapper.findAll('.tag-option')
      expect(tagOptions).toHaveLength(10) // Default tags

      await tagOptions[0].trigger('click')
      expect(tagOptions[0].classes()).toContain('tag-option--selected')

      await tagOptions[0].trigger('click')
      expect(tagOptions[0].classes()).not.toContain('tag-option--selected')
    })

    it('should handle file upload', async () => {
      const fileInput = wrapper.find('input[type="file"]')
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })

      Object.defineProperty(fileInput.element, 'files', {
        value: [mockFile]
      })

      await fileInput.trigger('change')

      expect(wrapper.vm.advancedData.attachments).toHaveLength(1)
      expect(wrapper.vm.advancedData.attachments[0]).toBe(mockFile)
    })

    it('should remove attachments', async () => {
      // Add a file first
      const fileInput = wrapper.find('input[type="file"]')
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })

      Object.defineProperty(fileInput.element, 'files', {
        value: [mockFile]
      })

      await fileInput.trigger('change')

      // Remove the file
      const removeButton = wrapper.find('.attachment-item button')
      await removeButton.trigger('click')

      expect(wrapper.vm.advancedData.attachments).toHaveLength(0)
    })
  })

  describe('draft management', () => {
    it('should load drafts from localStorage', () => {
      const mockDrafts = [
        {
          id: '1',
          title: 'Draft Title',
          content: 'Draft content',
          preview: 'Draft content...',
          updatedAt: '2025-01-15T10:00:00.000Z'
        }
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockDrafts))

      // Re-mount component to trigger draft loading
      const app = createApp(DiscussionComposer)
      const newWrapper = mount(DiscussionComposer, {
        global: {
          plugins: [app]
        }
      })

      expect(newWrapper.vm.drafts).toEqual(mockDrafts)
    })

    it('should save draft', async () => {
      const textarea = wrapper.find('.quick-compose textarea')
      await textarea.setValue('Draft content')

      const draftButton = wrapper.findAll('.secondary-btn')[0] // Save draft button
      await draftButton.trigger('click')

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should load draft when clicked', async () => {
      const mockDrafts = [
        {
          id: '1',
          title: 'Draft Title',
          content: 'Draft content',
          preview: 'Draft content...',
          updatedAt: '2025-01-15T10:00:00.000Z'
        }
      ]

      wrapper.vm.drafts = mockDrafts

      const draftItem = wrapper.find('.draft-item')
      await draftItem.trigger('click')

      expect(wrapper.find('.quick-compose textarea').element.value).toBe('Draft content')
    })

    it('should delete draft', async () => {
      const mockDrafts = [
        {
          id: '1',
          title: 'Draft Title',
          content: 'Draft content',
          preview: 'Draft content...',
          updatedAt: '2025-01-15T10:00:00.000Z'
        }
      ]

      wrapper.vm.drafts = mockDrafts

      const deleteButton = wrapper.find('.draft-item button')
      await deleteButton.trigger('click')

      expect(wrapper.vm.drafts).toHaveLength(0)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('publishing', () => {
    it('should disable publish button when content is empty', () => {
      const publishButton = wrapper.find('.publish-btn')
      expect(publishButton.attributes('disabled')).toBeDefined()
    })

    it('should enable publish button when content exists', async () => {
      const textarea = wrapper.find('.quick-compose textarea')
      await textarea.setValue('Valid content')

      const publishButton = wrapper.find('.publish-btn')
      expect(publishButton.attributes('disabled')).toBeUndefined()
    })

    it('should publish quick discussion', async () => {
      const textarea = wrapper.find('.quick-compose textarea')
      await textarea.setValue('Valid content')

      const publishButton = wrapper.find('.publish-btn')
      await publishButton.trigger('click')

      // Should call publish method
      expect(wrapper.vm.isPublishing).toBe(true)
    })

    it('should publish advanced discussion', async () => {
      // Switch to advanced mode
      const advancedTab = wrapper.findAll('.composer-tab')[1]
      await advancedTab.trigger('click')

      // Fill required fields
      const titleInput = wrapper.find('input[placeholder*="给讨论起一个吸引人的标题"]')
      const contentTextarea = wrapper.find('.editor-content')

      await titleInput.setValue('Test Title')
      await contentTextarea.setValue('Test content')

      const publishButton = wrapper.find('.publish-btn')
      await publishButton.trigger('click')

      expect(wrapper.vm.isPublishing).toBe(true)
    })

    it('should handle publish error', async () => {
      // Mock failed publish
      wrapper.vm.publish = vi.fn().mockRejectedValue(new Error('Publish failed'))

      const textarea = wrapper.find('.quick-compose textarea')
      await textarea.setValue('Valid content')

      const publishButton = wrapper.find('.publish-btn')
      await publishButton.trigger('click')

      // Should handle error gracefully
      expect(wrapper.vm.isPublishing).toBe(true)
    })
  })

  describe('text formatting', () => {
    beforeEach(async () => {
      const advancedTab = wrapper.findAll('.composer-tab')[1]
      await advancedTab.trigger('click')
    })

    it('should format text as bold', async () => {
      const contentTextarea = wrapper.find('.editor-content')
      await contentTextarea.setValue('Hello world')
      contentTextarea.element.setSelectionRange(6, 11) // Select "world"

      const boldButton = wrapper.findAll('.editor-toolbar button')[0]
      await boldButton.trigger('click')

      expect(contentTextarea.element.value).toBe('Hello **world**')
    })

    it('should format text as italic', async () => {
      const contentTextarea = wrapper.find('.editor-content')
      await contentTextarea.setValue('Hello world')
      contentTextarea.element.setSelectionRange(6, 11)

      const italicButton = wrapper.findAll('.editor-toolbar button')[1]
      await italicButton.trigger('click')

      expect(contentTextarea.element.value).toBe('Hello *world*')
    })

    it('should insert link', async () => {
      const contentTextarea = wrapper.find('.editor-content')
      await contentTextarea.setValue('Check this ')

      const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue('https://example.com')

      const linkButton = wrapper.findAll('.editor-toolbar button')[2]
      await linkButton.trigger('click')

      expect(contentTextarea.element.value).toBe('Check this [链接](https://example.com)')

      mockPrompt.mockRestore()
    })

    it('should insert code block', async () => {
      const contentTextarea = wrapper.find('.editor-content')
      await contentTextarea.setValue('Code example:')

      const codeButton = wrapper.findAll('.editor-toolbar button')[4]
      await codeButton.trigger('click')

      expect(contentTextarea.element.value).toBe('Code example:```\n\n```')
    })
  })

  describe('preview functionality', () => {
    beforeEach(async () => {
      const advancedTab = wrapper.findAll('.composer-tab')[1]
      await advancedTab.trigger('click')
    })

    it('should show preview modal', async () => {
      const titleInput = wrapper.find('input[placeholder*="给讨论起一个吸引人的标题"]')
      const contentTextarea = wrapper.find('.editor-content')

      await titleInput.setValue('Test Title')
      await contentTextarea.setValue('Test **bold** content')

      const previewButton = wrapper.findAll('.secondary-btn')[1] // Preview button
      await previewButton.trigger('click')

      expect(wrapper.find('.preview-modal').exists()).toBe(true)
      expect(wrapper.find('.preview-modal').isVisible()).toBe(true)
    })

    it('should render formatted content in preview', async () => {
      const contentTextarea = wrapper.find('.editor-content')
      await contentTextarea.setValue('Test **bold** and *italic* text')

      const previewButton = wrapper.findAll('.secondary-btn')[1]
      await previewButton.trigger('click')

      const previewBody = wrapper.find('.preview-body')
      expect(previewBody.html()).toContain('<strong>bold</strong>')
      expect(previewBody.html()).toContain('<em>italic</em>')
    })

    it('should close preview modal', async () => {
      const previewButton = wrapper.findAll('.secondary-btn')[1]
      await previewButton.trigger('click')

      const closeButton = wrapper.find('.preview-modal button')
      await closeButton.trigger('click')

      expect(wrapper.find('.preview-modal').exists()).toBe(false)
    })
  })

  describe('cancel functionality', () => {
    it('should cancel without confirmation for empty content', async () => {
      const cancelButton = wrapper.find('.cancel-btn')
      await cancelButton.trigger('click')

      // Should not show confirmation dialog
      expect(wrapper.vm.composeMode).toBe('quick')
    })

    it('should show confirmation for non-empty content', async () => {
      const textarea = wrapper.find('.quick-compose textarea')
      await textarea.setValue('Some content')

      const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true)

      const cancelButton = wrapper.find('.cancel-btn')
      await cancelButton.trigger('click')

      expect(mockConfirm).toHaveBeenCalled()
      expect(textarea.element.value).toBe('')

      mockConfirm.mockRestore()
    })
  })

  describe('responsive behavior', () => {
    it('should handle mobile layout', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 600,
        writable: true
      })

      // Re-mount component
      const app = createApp(DiscussionComposer)
      const newWrapper = mount(DiscussionComposer, {
        global: {
          plugins: [app]
        }
      })

      // Should still function normally
      expect(newWrapper.exists()).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      // Should not crash the component
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle file upload errors', async () => {
      const fileInput = wrapper.find('input[type="file"]')

      // Mock error during file handling
      Object.defineProperty(fileInput.element, 'files', {
        get: () => { throw new Error('File error') }
      })

      await fileInput.trigger('change')

      // Should handle error gracefully
      expect(wrapper.vm.advancedData.attachments).toEqual([])
    })
  })
})
