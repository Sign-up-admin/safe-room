import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SidebarNavigation from '@/components/sidebar/SidebarNavigation.vue'

describe('SidebarNavigation.vue', () => {
  let wrapper: any
  const mockEmit = vi.fn()

  beforeEach(() => {
    mockEmit.mockClear()
    wrapper = mount(SidebarNavigation, {
      props: {
        activeItem: 'discover'
      },
      attachTo: document.body,
      global: {
        stubs: ['svg']
      }
    })
  })

  it('renders navigation structure correctly', () => {
    expect(wrapper.exists()).toBe(true)

    // Check main navigation container
    const navContainer = wrapper.find('.overflow-hidden')
    expect(navContainer.exists()).toBe(true)

    // Check navigation section
    const navSection = wrapper.find('.bg-sidebar-light.dark\\:bg-sidebar-dark')
    expect(navSection.exists()).toBe(true)
  })

  it('displays all navigation buttons', () => {
    const navButtons = wrapper.findAll('button[aria-label]')
    expect(navButtons.length).toBe(4) // Discover, Imagine, Library, Labs
  })

  it('renders Discover button with correct attributes', () => {
    const discoverButton = wrapper.find('button[aria-label="Discover"]')
    expect(discoverButton.exists()).toBe(true)
    expect(discoverButton.attributes('aria-selected')).toBe('true')
  })

  it('renders Imagine button with new badge', () => {
    const imagineButton = wrapper.find('button[aria-label="Imagine"]')
    expect(imagineButton.exists()).toBe(true)

    const newBadge = imagineButton.find('.bg-accent-350\\/30.text-accent-650')
    expect(newBadge.exists()).toBe(true)
    expect(newBadge.text()).toBe('New')
  })

  it('renders Library button correctly', () => {
    const libraryButton = wrapper.find('button[aria-label="Library"]')
    expect(libraryButton.exists()).toBe(true)
    expect(libraryButton.attributes('aria-selected')).toBe('false')
  })

  it('renders Labs button correctly', () => {
    const labsButton = wrapper.find('button[aria-label="Labs"]')
    expect(labsButton.exists()).toBe(true)
    expect(labsButton.attributes('aria-selected')).toBe('false')
  })

  it('has proper button styling classes', () => {
    const buttons = wrapper.findAll('button[aria-label]')
    buttons.forEach(button => {
      expect(button.classes()).toContain('relative')
      expect(button.classes()).toContain('flex')
      expect(button.classes()).toContain('items-center')
      expect(button.classes()).toContain('rounded-xl')
    })
  })

  it('includes SVG icons for each navigation item', () => {
    const svgs = wrapper.findAll('svg')
    expect(svgs.length).toBe(4) // One for each navigation item
  })

  it('has proper accessibility attributes', () => {
    const buttons = wrapper.findAll('button[aria-label]')
    buttons.forEach(button => {
      expect(button.attributes('aria-label')).toBeDefined()
      expect(button.attributes('type')).toBe('button')
    })
  })

  it('changes active item when prop updates', async () => {
    await wrapper.setProps({ activeItem: 'library' })

    const libraryButton = wrapper.find('button[aria-label="Library"]')
    const discoverButton = wrapper.find('button[aria-label="Discover"]')

    expect(libraryButton.attributes('aria-selected')).toBe('true')
    expect(discoverButton.attributes('aria-selected')).toBe('false')
  })

  it('renders buttons with proper attributes', () => {
    const imagineButton = wrapper.find('button[aria-label="Imagine"]')

    // Check that the button exists and has proper attributes
    expect(imagineButton.exists()).toBe(true)
    expect(imagineButton.attributes('aria-label')).toBe('Imagine')
    expect(imagineButton.attributes('type')).toBe('button')
  })

  it('has proper styling classes', () => {
    const navContainer = wrapper.find('.bg-sidebar-light')
    expect(navContainer.exists()).toBe(true)

    // Check for dark mode classes
    const darkModeElements = wrapper.findAll('[class*="dark:"]')
    expect(darkModeElements.length).toBeGreaterThan(0)
  })

  it('has proper dark mode classes', () => {
    const darkModeElement = wrapper.find('.dark\\:bg-sidebar-dark')
    expect(darkModeElement.exists()).toBe(true)
  })
})
