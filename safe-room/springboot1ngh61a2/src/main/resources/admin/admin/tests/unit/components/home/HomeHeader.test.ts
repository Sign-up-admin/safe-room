import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeHeader from '@/components/home/HomeHeader.vue'

describe('HomeHeader.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(HomeHeader, {
      attachTo: document.body
    })
  })

  it('renders the header structure correctly', () => {
    expect(wrapper.exists()).toBe(true)

    // Check main header container
    const headerContainer = wrapper.find('.pointer-events-none.sticky')
    expect(headerContainer.exists()).toBe(true)

    // Check header wrapper
    const headerWrapper = wrapper.find('.absolute.flex.w-full.flex-col')
    expect(headerWrapper.exists()).toBe(true)

    // Check backdrop blur container
    const backdropContainer = wrapper.find('.pointer-events-auto.absolute.inset-0.h-16')
    expect(backdropContainer.exists()).toBe(true)
  })

  it('has proper CSS classes for header styling', () => {
    const headerContainer = wrapper.find('.pointer-events-none.sticky')
    expect(headerContainer.classes()).toContain('pointer-events-none')
    expect(headerContainer.classes()).toContain('sticky')
    expect(headerContainer.classes()).toContain('top-0')
    expect(headerContainer.classes()).toContain('w-full')
    expect(headerContainer.classes()).toContain('z-20')
  })

  it('has proper backdrop blur effect', () => {
    const backdropElement = wrapper.find('.backdrop-blur-2xl.backdrop-saturate-200')
    expect(backdropElement.exists()).toBe(true)
    expect(backdropElement.classes()).toContain('backdrop-blur-2xl')
    expect(backdropElement.classes()).toContain('backdrop-saturate-200')
    expect(backdropElement.classes()).toContain('bg-background-150/95')
  })

  it('has proper opacity styling', () => {
    const opacityContainer = wrapper.find('[style*="opacity: 1"]')
    expect(opacityContainer.exists()).toBe(true)
  })

  it('has proper height constraints', () => {
    const heightElement = wrapper.find('.h-16.overflow-hidden')
    expect(heightElement.exists()).toBe(true)
    expect(heightElement.classes()).toContain('h-16')
    expect(heightElement.classes()).toContain('overflow-hidden')
  })

  it('includes proper data attributes for testing', () => {
    const stickyHeader = wrapper.find('[data-testid="sticky-header"]')
    expect(stickyHeader.exists()).toBe(true)
  })

  it('renders without any content in default state', () => {
    expect(wrapper.text()).toBe('')
  })

  it('has proper responsive design classes', () => {
    const responsiveElement = wrapper.find('.dark\\:bg-background-150\\/90')
    expect(responsiveElement.exists()).toBe(true)
  })
})
