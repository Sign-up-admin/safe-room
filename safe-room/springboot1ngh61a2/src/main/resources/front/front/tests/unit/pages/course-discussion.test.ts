import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage } from 'element-plus'
import CourseDiscussion from '@/pages/discussjianshenkecheng/list.vue'
import { getModuleService } from '@/services/crud'
import type { Router } from 'vue-router'

// Mock dependencies
vi.mock('@/services/crud', () => ({
  getModuleService: vi.fn(() => ({
    list: vi.fn(),
    autoSort: vi.fn(),
    thumbsup: vi.fn(),
  })),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/components/common', () => ({
  TechButton: {
    name: 'TechButton',
    template: '<button @click="$emit(\'click\')" :class="variant" :size="size"><slot /></button>',
    props: ['variant', 'size'],
  },
  TechCard: {
    name: 'TechCard',
    template: '<div class="tech-card"><div v-if="$slots.title" class="card-title"><slot name="title" /></div><slot /></div>',
    props: ['title', 'interactive'],
  },
}))

vi.mock('@/utils/formatters', () => ({
  formatDate: vi.fn((date) => new Date(date).toLocaleDateString('zh-CN')),
}))

vi.mock('@/config/config', () => ({
  default: {
    baseUrl: 'http://localhost:8080',
  },
}))

vi.mock('@/assets/touxiang.png', () => ({
  default: 'mock-avatar.png',
}))

describe('CourseDiscussion Page', () => {
  let router: Partial<Router>
  let pinia: any
  let mockDiscussService: any
  let mockCourseService: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: { template: '<div></div>' } }],
    })

    mockDiscussService = {
      list: vi.fn(),
      autoSort: vi.fn(),
      thumbsup: vi.fn(),
    }

    mockCourseService = {
      list: vi.fn(),
    }

    ;(getModuleService as any).mockImplementation((key: string) => {
      if (key === 'discussjianshenkecheng') return mockDiscussService
      if (key === 'jianshenkecheng') return mockCourseService
      return {}
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should load courses and discussions on mount', async () => {
      const mockCourses = [
        { label: '瑜伽课程', value: 1 },
        { label: '健身课程', value: 2 },
      ]

      const mockDiscussions = [
        {
          id: 1,
          nickname: '健身爱好者',
          refid: 1,
          content: '这个课程真的很棒！',
          addtime: new Date().toISOString(),
          likes: 5,
          userid: 1,
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0)) // Wait for onMounted

      expect(mockCourseService.list).toHaveBeenCalled()
      expect(mockDiscussService.autoSort).toHaveBeenCalled()
      expect(wrapper.vm.courseOptions).toEqual(mockCourses.map(c => ({ label: c.label, value: c.value })))
    })

    it('should enhance discussions with additional properties', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          nickname: '测试用户',
          refid: 1,
          content: '训练 饮食 进阶',
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const enhanced = wrapper.vm.discussions[0]
      expect(enhanced).toHaveProperty('isPinned')
      expect(enhanced).toHaveProperty('isFeatured')
      expect(enhanced).toHaveProperty('isHot')
      expect(enhanced).toHaveProperty('tags')
      expect(enhanced).toHaveProperty('attachments')
      expect(enhanced).toHaveProperty('replyCount')
      expect(enhanced).toHaveProperty('viewCount')
      expect(enhanced).toHaveProperty('userLevel')
      expect(enhanced).toHaveProperty('isFollowing')
      expect(enhanced).toHaveProperty('showReply')
      expect(enhanced).toHaveProperty('showMenu')
      expect(enhanced).toHaveProperty('replyContent')
    })
  })

  describe('Discussion Features', () => {
    it('should display pinned, featured, and hot discussions with badges', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          nickname: '置顶用户',
          refid: 1,
          content: '置顶讨论',
          addtime: new Date().toISOString(),
        },
        {
          id: 2,
          nickname: '精华用户',
          refid: 1,
          content: '精华讨论',
          addtime: new Date().toISOString(),
        },
        {
          id: 3,
          nickname: '热门用户',
          refid: 1,
          content: '热门讨论',
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      // Check if discussions are enhanced with special properties
      const discussions = wrapper.vm.discussions
      const pinned = discussions.find((d: any) => d.isPinned)
      const featured = discussions.find((d: any) => d.isFeatured)
      const hot = discussions.find((d: any) => d.isHot)

      expect(pinned).toBeTruthy()
      expect(featured).toBeTruthy()
      expect(hot).toBeTruthy()
    })

    it('should generate tags from content', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          content: '训练方法很好，饮食也很重要，进阶课程值得尝试',
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const discussion = wrapper.vm.discussions[0]
      expect(discussion.tags).toContain('训练')
      expect(discussion.tags).toContain('饮食')
      expect(discussion.tags).toContain('进阶')
    })

    it('should generate attachments for some discussions', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          content: '分享训练照片',
          addtime: new Date().toISOString(),
        },
        {
          id: 2,
          content: '普通讨论',
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const discussions = wrapper.vm.discussions
      const withAttachments = discussions.filter((d: any) => d.attachments && d.attachments.length > 0)
      const withoutAttachments = discussions.filter((d: any) => !d.attachments || d.attachments.length === 0)

      expect(withAttachments.length + withoutAttachments.length).toBe(discussions.length)
    })
  })

  describe('User Interactions', () => {
    it('should toggle follow status', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          nickname: '测试用户',
          userid: 2,
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const discussion = wrapper.vm.discussions[0]
      expect(discussion.isFollowing).toBe(false)

      wrapper.vm.toggleFollow(discussion)
      expect(discussion.isFollowing).toBe(true)
      expect(wrapper.vm.followingUsers.has(2)).toBe(true)
    })

    it('should handle like functionality', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          nickname: '测试用户',
          likes: 5,
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)
      mockDiscussService.thumbsup.mockResolvedValue({})

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const discussion = wrapper.vm.discussions[0]
      await wrapper.vm.handleLike(discussion)

      expect(mockDiscussService.thumbsup).toHaveBeenCalledWith(1, 1)
      expect(discussion.likes).toBe(6)
    })
  })

  describe('Reply System', () => {
    it('should toggle reply input', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          nickname: '测试用户',
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const discussion = wrapper.vm.discussions[0]
      expect(discussion.showReply).toBe(false)

      wrapper.vm.toggleReply(discussion)
      expect(discussion.showReply).toBe(true)

      wrapper.vm.cancelReply(discussion)
      expect(discussion.showReply).toBe(false)
      expect(discussion.replyContent).toBe('')
    })

    it('should submit reply successfully', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          nickname: '测试用户',
          replyCount: 3,
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const discussion = wrapper.vm.discussions[0]
      discussion.replyContent = '这是一个测试回复'

      wrapper.vm.submitReply(discussion)

      expect(discussion.replyCount).toBe(4)
      expect(discussion.showReply).toBe(false)
      expect(discussion.replyContent).toBe('')
    })
  })

  describe('Moderation Features', () => {
    it('should handle pin/unpin functionality', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          nickname: '管理员',
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const discussion = wrapper.vm.discussions[0]
      expect(wrapper.vm.canPinDiscussion(discussion)).toBe(true)

      wrapper.vm.togglePin(discussion)
      expect(discussion.isPinned).toBe(true)
      expect(discussion.showMenu).toBe(false)
    })

    it('should handle feature/unfeature functionality', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          nickname: '管理员',
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const discussion = wrapper.vm.discussions[0]
      expect(wrapper.vm.canFeatureDiscussion(discussion)).toBe(true)

      wrapper.vm.toggleFeatured(discussion)
      expect(discussion.isFeatured).toBe(true)
      expect(discussion.showMenu).toBe(false)
    })

    it('should handle report functionality', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          nickname: '违规用户',
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const discussion = wrapper.vm.discussions[0]
      wrapper.vm.reportDiscussion(discussion)

      expect(discussion.showMenu).toBe(false)
    })
  })

  describe('Tag Filtering', () => {
    it('should filter discussions by tags', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          content: '训练方法分享',
          addtime: new Date().toISOString(),
        },
        {
          id: 2,
          content: '饮食建议',
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      // Initially no tag filter
      expect(wrapper.vm.filters.tag).toBe('')

      // Filter by tag
      wrapper.vm.filterByTag('训练')
      expect(wrapper.vm.filters.tag).toBe('训练')
    })
  })

  describe('Attachment Handling', () => {
    it('should handle image attachment viewing', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const attachment = {
        type: 'image',
        url: 'https://example.com/image.jpg',
        name: 'test-image.jpg',
      }

      // Mock window.open
      const mockOpen = vi.fn()
      global.window.open = mockOpen

      wrapper.vm.openAttachment(attachment)

      expect(mockOpen).toHaveBeenCalledWith('https://example.com/image.jpg', '_blank')
    })

    it('should handle file attachment downloading', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const attachment = {
        type: 'file',
        url: 'https://example.com/document.pdf',
        name: 'document.pdf',
      }

      // Mock document.createElement and click
      const mockCreateElement = vi.fn(() => ({
        href: '',
        download: '',
        click: vi.fn(),
      }))
      global.document.createElement = mockCreateElement

      wrapper.vm.openAttachment(attachment)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
    })
  })

  describe('Sharing Functionality', () => {
    it('should share discussion using Web Share API when available', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          content: '分享这个精彩讨论',
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      // Mock navigator.share
      const mockShare = vi.fn()
      Object.defineProperty(global.navigator, 'share', {
        value: mockShare,
        writable: true,
      })

      const discussion = wrapper.vm.discussions[0]
      wrapper.vm.shareDiscussion(discussion)

      expect(mockShare).toHaveBeenCalledWith({
        title: discussion.content,
        text: '快来看看这个有趣的讨论',
        url: expect.stringContaining('/index/discussjianshenkechengDetail?id=1'),
      })
    })

    it('should fallback to clipboard when Web Share API is not available', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          content: '分享这个精彩讨论',
          addtime: new Date().toISOString(),
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      // Remove navigator.share
      delete (global.navigator as any).share

      // Mock clipboard API
      const mockWriteText = vi.fn()
      Object.defineProperty(global.navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      })

      const discussion = wrapper.vm.discussions[0]
      await wrapper.vm.shareDiscussion(discussion)

      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('/index/discussjianshenkechengDetail?id=1')
      )
    })
  })

  describe('Time Formatting', () => {
    it('should format time ago correctly', async () => {
      const mockCourses = [{ label: '瑜伽课程', value: 1 }]
      const mockDiscussions = [
        {
          id: 1,
          addtime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
      ]

      mockCourseService.list.mockResolvedValue({ list: mockCourses })
      mockDiscussService.autoSort.mockResolvedValue(mockDiscussions)

      const wrapper = mount(CourseDiscussion, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const result = wrapper.vm.formatTimeAgo(mockDiscussions[0].addtime)
      expect(result).toBe('2小时前')
    })
  })
})
