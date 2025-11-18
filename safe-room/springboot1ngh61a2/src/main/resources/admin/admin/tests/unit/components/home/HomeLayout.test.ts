import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeLayout from '@/components/home/HomeLayout.vue'

describe('HomeLayout.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(HomeLayout, {
      slots: {
        sidebar: '<div data-testid="sidebar-content">Sidebar Content</div>',
        main: '<div data-testid="main-content">Main Content</div>'
      },
      attachTo: document.body
    })
  })

  it('renders the layout structure correctly', () => {
    expect(wrapper.exists()).toBe(true)

    // Check main app container
    const appContainer = wrapper.find('#app')
    expect(appContainer.exists()).toBe(true)

    // Check layout container
    const layoutContainer = wrapper.find('.flex.h-full.overflow-hidden')
    expect(layoutContainer.exists()).toBe(true)

    // Check sidebar slot
    const sidebarSlot = wrapper.find('[data-testid="sidebar-content"]')
    expect(sidebarSlot.exists()).toBe(true)
    expect(sidebarSlot.text()).toBe('Sidebar Content')

    // Check main content slot
    const mainSlot = wrapper.find('[data-testid="main-content"]')
    expect(mainSlot.exists()).toBe(true)
    expect(mainSlot.text()).toBe('Main Content')
  })

  it('has proper CSS classes for layout', () => {
    const layoutContainer = wrapper.find('.flex.h-full.overflow-hidden')
    expect(layoutContainer.classes()).toContain('flex')
    expect(layoutContainer.classes()).toContain('h-full')
    expect(layoutContainer.classes()).toContain('overflow-hidden')
    expect(layoutContainer.classes()).toContain('bg-sidebar-light')
  })

  it('has proper sidebar styling', () => {
    const sidebarContainer = wrapper.find('.absolute.h-full.w-0')
    expect(sidebarContainer.exists()).toBe(true)
    expect(sidebarContainer.attributes('style')).toContain('width: 290px')
  })

  it('has proper main content styling', () => {
    const mainContent = wrapper.find('main')
    expect(mainContent.exists()).toBe(true)
    expect(mainContent.classes()).toContain('relative')
    expect(mainContent.classes()).toContain('flex')
    expect(mainContent.classes()).toContain('w-full')
    expect(mainContent.classes()).toContain('min-w-0')
  })

  it('includes screen reader announcements', () => {
    const srContainer = wrapper.find('.sr-only')
    expect(srContainer.exists()).toBe(true)

    const politeAnnouncement = srContainer.find('div[aria-live="polite"]')
    const assertiveAnnouncement = srContainer.find('div[aria-live="assertive"]')

    expect(politeAnnouncement.exists()).toBe(true)
    expect(assertiveAnnouncement.exists()).toBe(true)
  })

  it('has proper accessibility attributes', () => {
    const sidebarContainer = wrapper.find('[role="navigation"]')
    expect(sidebarContainer.exists()).toBe(true)
  })

  it('renders slots correctly when provided', () => {
    expect(wrapper.html()).toContain('Sidebar Content')
    expect(wrapper.html()).toContain('Main Content')
  })

  it('has correct CSS custom properties', () => {
    const appContainer = wrapper.find('#app')
    const style = appContainer.attributes('style')

    expect(style).toContain('--layout-offset-y: 6px')
    expect(style).toContain('--composer-container-height: 260px')
    expect(style).toContain('--sidebar-header-secondary-buttons-collapsed-width: 0px')
    expect(style).toContain('--header-controls-inline-start-width: 0px')
  })
})
