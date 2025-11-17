import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import Home from '@/pages/home/home.vue'

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/courses', name: 'courses' },
    { path: '/coaches', name: 'coaches' },
    { path: '/about', name: 'about' },
    { path: '/contact', name: 'contact' }
  ]
})

// Mock components
vi.mock('@/components/home', () => ({
  SmartHeader: {
    name: 'SmartHeader',
    template: '<header><slot /></header>',
    props: ['navItems'],
    emits: ['navigate', 'cta']
  },
  HeroSection: {
    name: 'HeroSection',
    template: '<section><slot /></section>',
    emits: ['book', 'view-courses']
  },
  ServiceCards: {
    name: 'ServiceCards',
    template: '<div>Service Cards</div>',
    emits: ['navigate']
  },
  TechFooter: {
    name: 'TechFooter',
    template: '<footer>Footer</footer>'
  },
  FloatingServiceButton: {
    name: 'FloatingServiceButton',
    template: '<button>Floating Button</button>'
  }
}))

vi.mock('@/components/common', () => ({
  TechButton: {
    name: 'TechButton',
    template: '<button><slot /></button>',
    props: ['size'],
    emits: ['click']
  },
  TechCard: {
    name: 'TechCard',
    template: '<div><slot name="footer" /></div>',
    props: ['as', 'eyebrow', 'title', 'interactive', 'variant']
  }
}))

vi.mock('@/components/home/CoachNetwork.vue', () => ({
  default: {
    name: 'CoachNetwork',
    template: '<div>Coach Network</div>',
    props: ['nodes', 'links'],
    emits: ['navigate']
  }
}))

vi.mock('@/components/home/Testimonials.vue', () => ({
  default: {
    name: 'Testimonials',
    template: '<div>Testimonials</div>'
  }
}))

// Mock defineAsyncComponent
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    defineAsyncComponent: vi.fn((component) => component)
  }
})

// Mock services and utilities
vi.mock('@/common/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

vi.mock('@/config/config', () => ({
  default: {
    baseUrl: '/api'
  }
}))

vi.mock('@/services/crud', () => ({
  getModuleService: vi.fn(() => ({
    list: vi.fn(),
    get: vi.fn()
  }))
}))

vi.mock('@/utils/formatters', () => ({
  formatCurrency: vi.fn((value) => `¥${value}`),
  formatDate: vi.fn((date) => new Date(date).toLocaleDateString())
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('Home.vue', () => {
  let wrapper: any

  beforeEach(async () => {
    router.push('/')
    await router.isReady()

    wrapper = mount(Home, {
      global: {
        plugins: [router],
        stubs: {
          'el-button': true,
          'el-carousel': true,
          'el-carousel-item': true,
          'el-empty': true
        }
      }
    })

    // Wait for component to mount and initialize
    await wrapper.vm.$nextTick()
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.home').exists()).toBe(true)
    expect(wrapper.find('.home__main').exists()).toBe(true)
  })

  it('includes all main sections', () => {
    expect(wrapper.findComponent({ name: 'SmartHeader' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'HeroSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ServiceCards' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'TechFooter' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'FloatingServiceButton' }).exists()).toBe(true)
  })

  it('has correct navigation items', () => {
    const vm = wrapper.vm
    expect(vm.navItems).toEqual([
      { label: '首页', routeName: 'home' },
      { label: '课程', routeName: 'courses' },
      { label: '明星教练', routeName: 'coaches' },
      { label: '环境', routeName: 'environment' },
      { label: '关于', routeName: 'about' },
      { label: '联系', routeName: 'contact' }
    ])
  })

  it('renders carousel section with empty state', () => {
    const carouselSection = wrapper.find('.home__section--carousel')
    expect(carouselSection.exists()).toBe(true)

    const emptyElement = carouselSection.findComponent({ name: 'el-empty' })
    expect(emptyElement.exists()).toBe(true)
  })

  it('renders course grid section with empty state', () => {
    const courseSection = wrapper.find('.home__section--grid')
    expect(courseSection.exists()).toBe(true)

    const emptyElement = courseSection.findComponent({ name: 'el-empty' })
    expect(emptyElement.exists()).toBe(true)
    expect(emptyElement.props('description')).toBe('暂无课程数据')
  })

  it('renders news section with empty state', () => {
    const newsSection = wrapper.find('.home__section--news')
    expect(newsSection.exists()).toBe(true)

    const emptyElement = newsSection.findComponent({ name: 'el-empty' })
    expect(emptyElement.exists()).toBe(true)
    expect(emptyElement.props('description')).toBe('暂无公告')
  })

  it('renders CTA section with TechCard', () => {
    const ctaSection = wrapper.find('.home__cta')
    expect(ctaSection.exists()).toBe(true)

    const techCard = wrapper.findComponent({ name: 'TechCard' })
    expect(techCard.exists()).toBe(true)
    expect(techCard.props('eyebrow')).toBe('JOIN THE FUTURE')
    expect(techCard.props('title')).toBe('立即预约体验，解锁下一阶段的体能与状态')
  })

  it('includes testimonials component', () => {
    expect(wrapper.findComponent({ name: 'Testimonials' }).exists()).toBe(true)
  })

  it('includes coach network component', () => {
    expect(wrapper.findComponent({ name: 'CoachNetwork' }).exists()).toBe(true)
  })

  it('has proper loading states', () => {
    const vm = wrapper.vm
    expect(vm.loading).toEqual({
      carousel: false,
      courses: false,
      news: false,
      coaches: false
    })
  })

  it('handles navigation correctly', async () => {
    const pushSpy = vi.spyOn(router, 'push')

    const vm = wrapper.vm
    await vm.handleNav({ routeName: 'courses' })

    expect(pushSpy).toHaveBeenCalledWith('/index/jianshenkecheng')
  })

  it('shows section headers with correct content', () => {
    const sectionHeaders = wrapper.findAll('.section-header')

    // Carousel section header
    const carouselHeader = sectionHeaders[0]
    expect(carouselHeader.text()).toContain('精选体验')
    expect(carouselHeader.text()).toContain('场馆轮播图')

    // Course section header
    const courseHeader = sectionHeaders[1]
    expect(courseHeader.text()).toContain('HOT COURSES')
    expect(courseHeader.text()).toContain('热门课程')

    // News section header
    const newsHeader = sectionHeaders[2]
    expect(newsHeader.text()).toContain('LATEST UPDATES')
    expect(newsHeader.text()).toContain('最新公告')
  })
})
