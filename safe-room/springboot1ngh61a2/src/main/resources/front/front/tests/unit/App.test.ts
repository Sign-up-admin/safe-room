import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', meta: { title: '首页' } },
    { path: '/test', name: 'test', meta: { title: '测试页面' } }
  ]
})

// Mock CookieConsent component
vi.mock('@/components/CookieConsent.vue', () => ({
  default: {
    name: 'CookieConsent',
    template: '<div>Cookie Consent</div>'
  }
}))

describe('App.vue', () => {
  it('renders correctly', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    // Check if main elements are rendered
    expect(wrapper.find('#main-content').exists()).toBe(true)
    expect(wrapper.find('.sr-only').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'CookieConsent' }).exists()).toBe(true)
  })

  it('has correct accessibility attributes', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    const mainContent = wrapper.find('#main-content')
    expect(mainContent.attributes('tabindex')).toBe('-1')
    expect(mainContent.attributes('id')).toBe('main-content')

    const srOnly = wrapper.find('.sr-only')
    expect(srOnly.attributes('role')).toBe('status')
    expect(srOnly.attributes('aria-live')).toBe('polite')
  })

  it('displays live message based on route meta title', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    const liveMessage = wrapper.find('.sr-only')
    expect(liveMessage.text()).toBe('首页 已更新')
  })

  it('displays live message based on route path when no meta title', async () => {
    // Create a new router instance for this test to avoid conflicts
    const testRouter = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', meta: { title: '首页' } },
        { path: '/unknown-path', name: 'unknown' }
      ]
    })

    testRouter.push('/unknown-path')
    await testRouter.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [testRouter]
      }
    })

    const liveMessage = wrapper.find('.sr-only')
    expect(liveMessage.text()).toBe('/unknown-path 已更新')
  })

  it('includes CookieConsent component', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.findComponent({ name: 'CookieConsent' }).exists()).toBe(true)
  })

  it('has proper CSS classes for accessibility', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })

    // Check that sr-only element has proper classes
    expect(wrapper.find('.sr-only').classes()).toContain('sr-only')
  })
})
