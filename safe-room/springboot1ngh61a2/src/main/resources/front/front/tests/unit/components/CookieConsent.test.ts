import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CookieConsent from '@/components/CookieConsent.vue'

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

// Mock setTimeout
vi.useFakeTimers()

describe('CookieConsent.vue', () => {
  let wrapper: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.clearAllTimers()

    // Reset localStorage mocks
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {
      // Mock implementation for setItem
    })
    localStorageMock.removeItem.mockImplementation(() => {
      // Mock implementation for removeItem
    })
    localStorageMock.clear.mockImplementation(() => {
      // Mock implementation for clear
    })

    wrapper = await mount(CookieConsent, {
      global: {
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-checkbox': true
        },
        provide: {
          $config: { baseUrl: '/api' }
        }
      },
      attachTo: document.body
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('shows dialog after timeout when no consent exists', async () => {
    // Initially dialog should not be visible
    expect(wrapper.vm.dialogVisible).toBe(false)

    // Fast-forward setTimeout
    await vi.advanceTimersByTime(1000)

    expect(wrapper.vm.dialogVisible).toBe(true)
  })

  it('does not show dialog if consent already exists', async () => {
    localStorageMock.getItem.mockReturnValue('accepted')

    // Remount component
    wrapper = mount(CookieConsent, {
      global: {
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-checkbox': true
        }
      }
    })

    await vi.advanceTimersByTime(1000)

    expect(wrapper.vm.dialogVisible).toBe(false)
  })

  it('loads saved cookie settings from localStorage', async () => {
    const savedSettings = {
      necessary: true,
      analytics: true,
      marketing: false
    }

    localStorageMock.getItem
      .mockReturnValueOnce('accepted') // consent
      .mockReturnValueOnce(JSON.stringify(savedSettings)) // settings

    wrapper = mount(CookieConsent, {
      global: {
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-checkbox': true
        }
      }
    })

    expect(wrapper.vm.cookieSettings).toEqual(savedSettings)
  })

  it('handles accept button click', async () => {
    await vi.advanceTimersByTime(1000) // Show dialog

    const vm = wrapper.vm
    vm.cookieSettings.analytics = true
    vm.cookieSettings.marketing = true

    await vm.handleAccept()

    expect(localStorageMock.setItem).toHaveBeenCalledWith('cookie_consent', 'accepted')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cookie_settings',
      JSON.stringify(vm.cookieSettings)
    )
    expect(vm.dialogVisible).toBe(false)
  })

  it('handles reject button click', async () => {
    await vi.advanceTimersByTime(1000) // Show dialog

    const vm = wrapper.vm
    vm.cookieSettings.analytics = true
    vm.cookieSettings.marketing = true

    await vm.handleReject()

    expect(localStorageMock.setItem).toHaveBeenCalledWith('cookie_consent', 'rejected')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cookie_settings',
      JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false
      })
    )
    expect(vm.dialogVisible).toBe(false)
  })

  it('toggles custom settings view', async () => {
    await vi.advanceTimersByTime(1000)

    const vm = wrapper.vm
    expect(vm.showCustom).toBe(false)

    // Show custom settings
    vm.showCustom = true
    await wrapper.vm.$nextTick()

    expect(vm.showCustom).toBe(true)

    // Hide custom settings
    vm.showCustom = false
    await wrapper.vm.$nextTick()

    expect(vm.showCustom).toBe(false)
  })

  it('applies cookie settings correctly', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      // Mock implementation for console.log
    })

    const vm = wrapper.vm
    vm.cookieSettings.analytics = true
    vm.cookieSettings.marketing = true

    vm.applyCookieSettings()

    expect(consoleSpy).toHaveBeenCalledWith('Analytics cookies enabled')
    expect(consoleSpy).toHaveBeenCalledWith('Marketing cookies enabled')

    consoleSpy.mockRestore()
  })

  it('prevents multiple consent checks', async () => {
    const vm = wrapper.vm
    vm.hasChecked = true

    vm.checkCookieConsent()

    // Should not trigger setTimeout again
    expect(vi.getTimerCount()).toBe(0)
  })

  it('handles invalid JSON in saved settings', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      // Mock implementation for console.error
    })

    localStorageMock.getItem
      .mockReturnValueOnce('accepted')
      .mockReturnValueOnce('invalid json')

    wrapper = mount(CookieConsent, {
      global: {
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-checkbox': true
        }
      }
    })

    expect(consoleSpy).toHaveBeenCalledWith('Failed to parse cookie settings', expect.any(SyntaxError))

    consoleSpy.mockRestore()
  })

  it('prevents dialog from showing if consent is given during timeout', async () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'cookie_consent') {
        // Return null initially, then return consent
        return vi.getTimerCount() > 0 ? 'accepted' : null
      }
      return null
    })

    wrapper = mount(CookieConsent, {
      global: {
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-checkbox': true
        }
      }
    })

    await vi.advanceTimersByTime(1000)

    expect(wrapper.vm.dialogVisible).toBe(false)
  })

  it('has correct default cookie settings', () => {
    const vm = wrapper.vm
    expect(vm.cookieSettings).toEqual({
      necessary: true,
      analytics: false,
      marketing: false
    })
  })

  it('necessary cookies cannot be disabled', () => {
    const vm = wrapper.vm
    // The necessary checkbox should be disabled in the template
    // and the value should always remain true
    expect(vm.cookieSettings.necessary).toBe(true)
  })

  it('initializes with correct state', () => {
    const vm = wrapper.vm
    expect(vm.dialogVisible).toBe(false)
    expect(vm.showCustom).toBe(false)
    expect(vm.hasChecked).toBe(true) // Set to true after onBeforeMount
  })
})
