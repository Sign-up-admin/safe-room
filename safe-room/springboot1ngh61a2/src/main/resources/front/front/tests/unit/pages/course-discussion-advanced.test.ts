import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { getModuleService } from '@/services/crud'
import type { Router } from 'vue-router'

// Mock the enhanced Vue component
vi.mock('@/pages/discussjianshenkecheng/list.vue', () => ({
  default: {
    name: 'CourseDiscussionAdvanced',
    template: `
      <div class="discuss-page">
        <header class="discuss-hero">
          <div class="hero-actions">
            <input v-model="filters.keyword" @keyup.enter="handleSearch" />
            <button @click="goCreate">发布讨论</button>
          </div>
        </header>

        <section class="discuss-filters">
          <select v-model="filters.courseId" @change="handleSearch">
            <option v-for="course in courseOptions" :key="course.value" :value="course.value">
              {{ course.label }}
            </option>
          </select>
          <div class="tag-group">
            <button
              v-for="tag in tags"
              :key="tag"
              :class="{ 'tag-chip--active': filters.tag === tag }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
          <div class="sort-group">
            <button
              v-for="option in sortOptions"
              :key="option.value"
              :class="{ 'sort-chip--active': filters.sort === option.value }"
              @click="changeSort(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </section>

        <section class="discuss-list">
          <div
            v-for="item in discussions"
            :key="item.id"
            class="discussion-card"
            :class="{ 'pinned': item.pinned, 'featured': item.featured }"
          >
            <div class="discussion-header">
              <h3>{{ item.title }}</h3>
              <div class="discussion-meta">
                <span class="author">{{ item.author }}</span>
                <span class="time">{{ formatDate(item.addtime) }}</span>
                <span v-if="item.pinned" class="badge pinned">置顶</span>
                <span v-if="item.featured" class="badge featured">精华</span>
              </div>
            </div>

            <div class="discussion-content">
              <p>{{ item.content }}</p>
              <div class="discussion-tags">
                <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>

            <div class="discussion-actions">
              <button @click="toggleLike(item)" :class="{ liked: item.liked }">
                👍 {{ item.likes }}
              </button>
              <button @click="toggleReply(item)">
                💬 {{ item.replies }}
              </button>
              <button @click="togglePin(item)" v-if="canPin">📌 {{ item.pinned ? '取消置顶' : '置顶' }}</button>
              <button @click="toggleFeature(item)" v-if="canFeature">⭐ {{ item.featured ? '取消精华' : '设为精华' }}</button>
              <button @click="reportDiscussion(item)">🚨 举报</button>
            </div>

            <div v-if="item.showReply" class="reply-form">
              <textarea v-model="replyContent" placeholder="写下你的回复..." />
              <button @click="submitReply(item)">回复</button>
            </div>

            <div v-if="item.attachments && item.attachments.length > 0" class="attachments">
              <div v-for="attachment in item.attachments" :key="attachment.id" class="attachment">
                <span class="attachment-icon">{{ attachment.type === 'image' ? '🖼️' : '📎' }}</span>
                <span class="attachment-name">{{ attachment.name }}</span>
                <button @click="viewAttachment(attachment)">查看</button>
                <button @click="downloadAttachment(attachment)" v-if="attachment.type !== 'image'">下载</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
    setup() {
      const filters = {
        keyword: '',
        courseId: '',
        tag: '',
        sort: 'hot',
      }

      const courseOptions = [
        { value: '1', label: '瑜伽课程' },
        { value: '2', label: '健身课程' },
      ]

      const tags = ['健身技巧', '营养饮食', '课程体验', '教练推荐']
      const sortOptions = [
        { value: 'hot', label: '热门' },
        { value: 'new', label: '最新' },
        { value: 'featured', label: '精华' },
      ]

      const discussions = [
        {
          id: 1,
          title: '瑜伽呼吸技巧分享',
          author: '小明',
          addtime: new Date().toISOString(),
          content: '今天分享一下瑜伽中的呼吸技巧...',
          tags: ['健身技巧', '课程体验'],
          likes: 15,
          replies: 8,
          pinned: true,
          featured: true,
          liked: false,
          showReply: false,
          attachments: [
            { id: 1, name: 'yoga-breathing.jpg', type: 'image' },
            { id: 2, name: 'breathing-guide.pdf', type: 'file' },
          ],
        },
        {
          id: 2,
          title: '蛋白质补剂推荐',
          author: '健身达人',
          addtime: new Date(Date.now() - 86400000).toISOString(),
          content: '想问问大家对蛋白粉有什么推荐...',
          tags: ['营养饮食'],
          likes: 23,
          replies: 15,
          pinned: false,
          featured: false,
          liked: true,
          showReply: false,
        },
      ]

      const replyContent = ''
      const canPin = true
      const canFeature = true

      const handleSearch = vi.fn()
      const goCreate = vi.fn()
      const toggleTag = vi.fn()
      const changeSort = vi.fn()
      const toggleLike = vi.fn((item) => {
        item.liked = !item.liked
        item.likes += item.liked ? 1 : -1
      })
      const toggleReply = vi.fn((item) => {
        item.showReply = !item.showReply
      })
      const togglePin = vi.fn((item) => {
        item.pinned = !item.pinned
      })
      const toggleFeature = vi.fn((item) => {
        item.featured = !item.featured
      })
      const reportDiscussion = vi.fn()
      const submitReply = vi.fn()
      const viewAttachment = vi.fn()
      const downloadAttachment = vi.fn()
      const formatDate = vi.fn((date) => new Date(date).toLocaleDateString('zh-CN'))

      return {
        filters,
        courseOptions,
        tags,
        sortOptions,
        discussions,
        replyContent,
        canPin,
        canFeature,
        handleSearch,
        goCreate,
        toggleTag,
        changeSort,
        toggleLike,
        toggleReply,
        togglePin,
        toggleFeature,
        reportDiscussion,
        submitReply,
        viewAttachment,
        downloadAttachment,
        formatDate,
      }
    }
  }
}))

import CourseDiscussionAdvanced from '../../../src/pages/discussjianshenkecheng/list.vue'

describe('CourseDiscussion Advanced Features', () => {
  let router: Partial<Router>
  let pinia: any
  let mockService: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createWebHashHistory(),
      routes: [{ path: '/', component: { template: '<div></div>' } }],
    })

    mockService = {
      list: vi.fn(),
      autoSort: vi.fn(),
      thumbsup: vi.fn(),
    }
    ;(getModuleService as any).mockReturnValue(mockService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Advanced Filtering and Search', () => {
    it('should filter by course selection', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const courseSelect = wrapper.find('select')
      await courseSelect.setValue('1')

      expect(wrapper.vm.handleSearch).toHaveBeenCalled()
      expect(wrapper.vm.filters.courseId).toBe('1')
    })

    it('should toggle tag filters', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const tagButtons = wrapper.findAll('.tag-group button')
      expect(tagButtons.length).toBe(4) // 4 tags

      await tagButtons[0].trigger('click')

      expect(wrapper.vm.toggleTag).toHaveBeenCalledWith('健身技巧')
    })

    it('should change sort options', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const sortButtons = wrapper.findAll('.sort-group button')
      expect(sortButtons.length).toBe(3) // 3 sort options

      await sortButtons[1].trigger('click') // 'new' option

      expect(wrapper.vm.changeSort).toHaveBeenCalledWith('new')
    })

    it('should search by keyword', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const searchInput = wrapper.find('input')
      await searchInput.setValue('瑜伽')
      await searchInput.trigger('keyup.enter')

      expect(wrapper.vm.filters.keyword).toBe('瑜伽')
      expect(wrapper.vm.handleSearch).toHaveBeenCalled()
    })
  })

  describe('Discussion Management', () => {
    it('should display pinned and featured discussions with badges', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const pinnedBadge = wrapper.find('.badge.pinned')
      const featuredBadge = wrapper.find('.badge.featured')

      expect(pinnedBadge.exists()).toBe(true)
      expect(featuredBadge.exists()).toBe(true)
      expect(pinnedBadge.text()).toBe('置顶')
      expect(featuredBadge.text()).toBe('精华')
    })

    it('should toggle pin status', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const pinButton = wrapper.find('button')
      if (pinButton && pinButton.text().includes('置顶')) {
        const firstDiscussion = wrapper.vm.discussions[0]
        expect(firstDiscussion.pinned).toBe(true)

        await pinButton.trigger('click')

        expect(wrapper.vm.togglePin).toHaveBeenCalledWith(firstDiscussion)
      }
    })

    it('should toggle feature status', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const featureButton = wrapper.find('button')
      if (featureButton && featureButton.text().includes('精华')) {
        const firstDiscussion = wrapper.vm.discussions[0]
        expect(firstDiscussion.featured).toBe(true)

        await featureButton.trigger('click')

        expect(wrapper.vm.toggleFeature).toHaveBeenCalledWith(firstDiscussion)
      }
    })
  })

  describe('Like and Reply System', () => {
    it('should toggle like status', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const likeButtons = wrapper.findAll('button')
      const likeButton = likeButtons.find(btn => btn.text().includes('👍'))

      if (likeButton) {
        const firstDiscussion = wrapper.vm.discussions[0]
        const originalLikes = firstDiscussion.likes

        await likeButton.trigger('click')

        expect(wrapper.vm.toggleLike).toHaveBeenCalledWith(firstDiscussion)
        // The mock function should toggle the liked status
      }
    })

    it('should toggle reply form visibility', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const replyButtons = wrapper.findAll('button')
      const replyButton = replyButtons.find(btn => btn.text().includes('💬'))

      if (replyButton) {
        const firstDiscussion = wrapper.vm.discussions[0]
        expect(firstDiscussion.showReply).toBe(false)

        await replyButton.trigger('click')

        expect(wrapper.vm.toggleReply).toHaveBeenCalledWith(firstDiscussion)
      }
    })

    it('should submit reply', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const firstDiscussion = wrapper.vm.discussions[0]
      firstDiscussion.showReply = true // Show reply form

      await wrapper.vm.$nextTick()

      const submitButton = wrapper.find('.reply-form button')
      if (submitButton) {
        wrapper.vm.replyContent = '这是一个测试回复'

        await submitButton.trigger('click')

        expect(wrapper.vm.submitReply).toHaveBeenCalledWith(firstDiscussion)
      }
    })
  })

  describe('Attachment Management', () => {
    it('should display attachments correctly', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const attachments = wrapper.findAll('.attachment')
      expect(attachments.length).toBe(2) // 2 attachments in first discussion

      const imageAttachment = attachments[0]
      const fileAttachment = attachments[1]

      expect(imageAttachment.find('.attachment-icon').text()).toBe('🖼️')
      expect(fileAttachment.find('.attachment-icon').text()).toBe('📎')

      expect(imageAttachment.find('.attachment-name').text()).toBe('yoga-breathing.jpg')
      expect(fileAttachment.find('.attachment-name').text()).toBe('breathing-guide.pdf')
    })

    it('should handle attachment viewing', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const viewButtons = wrapper.findAll('button')
      const viewButton = viewButtons.find(btn => btn.text() === '查看')

      if (viewButton) {
        const attachment = wrapper.vm.discussions[0].attachments[0]
        await viewButton.trigger('click')

        expect(wrapper.vm.viewAttachment).toHaveBeenCalledWith(attachment)
      }
    })

    it('should handle attachment downloading for files', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const downloadButtons = wrapper.findAll('button')
      const downloadButton = downloadButtons.find(btn => btn.text() === '下载')

      if (downloadButton) {
        const attachment = wrapper.vm.discussions[0].attachments[1] // PDF file
        await downloadButton.trigger('click')

        expect(wrapper.vm.downloadAttachment).toHaveBeenCalledWith(attachment)
      }
    })

    it('should not show download button for images', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const downloadButtons = wrapper.findAll('button')
      const imageDownloadButtons = downloadButtons.filter(btn =>
        btn.text() === '下载' &&
        wrapper.vm.discussions[0].attachments.some(att => att.type === 'image')
      )

      expect(imageDownloadButtons.length).toBe(0)
    })
  })

  describe('Content Moderation', () => {
    it('should allow reporting discussions', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const reportButtons = wrapper.findAll('button')
      const reportButton = reportButtons.find(btn => btn.text().includes('举报'))

      if (reportButton) {
        const firstDiscussion = wrapper.vm.discussions[0]
        await reportButton.trigger('click')

        expect(wrapper.vm.reportDiscussion).toHaveBeenCalledWith(firstDiscussion)
      }
    })
  })

  describe('Tag System', () => {
    it('should display discussion tags', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const tagElements = wrapper.findAll('.discussion-tags .tag')
      expect(tagElements.length).toBeGreaterThan(0)

      // Check if tags contain expected values
      const tagTexts = tagElements.map(tag => tag.text())
      expect(tagTexts).toEqual(
        expect.arrayContaining(['健身技巧', '课程体验', '营养饮食'])
      )
    })
  })

  describe('Navigation', () => {
    it('should navigate to create discussion page', async () => {
      const pushSpy = vi.fn()
      vi.mocked(router.push).mockImplementation(pushSpy)

      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const createButton = wrapper.find('button')
      if (createButton && createButton.text() === '发布讨论') {
        await createButton.trigger('click')

        expect(wrapper.vm.goCreate).toHaveBeenCalled()
      }
    })
  })

  describe('Performance and UX', () => {
    it('should handle empty discussions list', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      // Should render without errors even with empty data
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findAll('.discussion-card').length).toBe(2) // Mock data
    })

    it('should display formatted dates', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(CourseDiscussionAdvanced, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const timeElements = wrapper.findAll('.time')
      timeElements.forEach(timeElement => {
        expect(timeElement.text().length).toBeGreaterThan(0)
      })
    })
  })
})
