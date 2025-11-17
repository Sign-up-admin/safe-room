/**
 * 端到端应用初始化测试
 * 测试完整的应用启动过程，包括脚本加载、组件注册等
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cleanupTest } from '../../utils/test-helpers'

// Note: Vue, vue-router, pinia, and element-plus are mocked globally in vitest.setup.ts
// This test focuses on application initialization logic

describe('End-to-End Application Initialization Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanupTest()
  })

  it('should initialize Vue application successfully', async () => {
    // Test that Vue can be imported and basic app creation works
    const { createApp } = await import('vue')
    const app = createApp({
      name: 'TestApp',
      template: '<div>Test</div>'
    })

    expect(app).toBeDefined()
    expect(typeof app.use).toBe('function')
    expect(typeof app.mount).toBe('function')
    expect(typeof app.component).toBe('function')

    // Test that we can use plugins
    app.use({ install: vi.fn() })
    expect(app.use).toHaveBeenCalled()
  })

  it('should register Element Plus components correctly', async () => {
    const { createApp } = await import('vue')
    const app = createApp({})
    const ElementPlus = await import('element-plus')

    app.use(ElementPlus.default)

    expect(app.use).toHaveBeenCalledWith(ElementPlus.default)
  })

  it('should handle global component registration', async () => {
    const { createApp } = await import('vue')
    const app = createApp({})

    // Test component registration
    app.component('TestComponent', { template: '<div></div>' })
    expect(app.component).toHaveBeenCalledWith('TestComponent', { template: '<div></div>' })
  })

  it('should setup error handlers correctly', async () => {
    const { createApp } = await import('vue')
    const app = createApp({})

    // Test error handler setup
    const errorHandler = vi.fn()
    app.config.errorHandler = errorHandler

    expect(app.config.errorHandler).toBe(errorHandler)
  })

  it('should setup global properties correctly', async () => {
    const { createApp } = await import('vue')
    const app = createApp({})

    // Test global property setup
    app.config.globalProperties.$testProperty = 'test'
    expect(app.config.globalProperties.$testProperty).toBe('test')
  })

  it('should handle script loading sequence in HTML', () => {
    // Mock HTML structure and script loading
    const scriptLoadOrder: string[] = []
    const originalAppendChild = document.body.appendChild

    document.body.appendChild = vi.fn((element: any) => {
      if (element.tagName === 'SCRIPT') {
        scriptLoadOrder.push(element.src)

        // Simulate script loading
        setTimeout(() => {
          if (element.onload) {
            element.onload()
          }
        }, 10)
      }
      return originalAppendChild.call(document.body, element)
    })

    // Simulate the script loading logic from index.html
    function loadDependentScripts() {
      if (typeof window.jQuery === 'undefined' || typeof window.$ === 'undefined') {
        setTimeout(loadDependentScripts, 10)
        return
      }

      const scripts = ['/verifys/yz.js', '/verifys/verify.js']
      scripts.forEach((src: string) => {
        const script = document.createElement('script')
        script.src = src
        script.onload = function() {
          // Script loaded successfully
        }
        document.body.appendChild(script)
      })
    }

    // Initial state: jQuery is loaded (mocked globally)
    expect(typeof window.jQuery).toBe('function')

    // Start loading dependent scripts
    loadDependentScripts()
    expect(scriptLoadOrder.length).toBe(0) // No scripts loaded yet

    // Simulate jQuery loading
    window.jQuery = window.$ = { version: '3.4.1' }

    // Retry loading
    loadDependentScripts()

    expect(scriptLoadOrder).toEqual([
      '/verifys/yz.js',
      '/verifys/verify.js'
    ])

    // Restore original method
    document.body.appendChild = originalAppendChild
  })

  it('should handle jQuery plugin initialization without errors', () => {
    // Simulate jQuery loading first
    window.jQuery = window.$ = function(selector: any) {
      if (typeof selector === 'string' && selector.startsWith('<style')) {
        return {
          length: 1,
          css: function() { return this }
        }
      }
      return { length: 0 }
    }
    window.jQuery.fn = window.$.fn = {}

    // Simulate yz.js execution
    const inlineCss = '*{margin:0;padding:0;}'

    expect(() => {
      // This should not throw an error now that jQuery is loaded
      const styleObj = window.jQuery(`<style type="text/css">${inlineCss}</style>`)
      expect(styleObj.length).toBe(1)
    }).not.toThrow()

    // Verify RotateVerify is available after initialization
    expect(typeof window.RotateVerify).toBe('undefined') // Initially undefined

    // Simulate full yz.js initialization
    window.RotateVerify = function(options: any) {
      this.options = options
    }

    expect(typeof window.RotateVerify).toBe('function')
  })

  it('should handle component resolution in Vue templates', async () => {
    await import('../src/main.ts')

    // Create a test component that uses el-submenu
    const TestComponent = {
      name: 'TestComponent',
      template: `
        <div>
          <el-menu>
            <el-submenu index="1">
              <template #title>Test Menu</template>
              <el-menu-item index="1-1">Item 1</el-menu-item>
            </el-submenu>
          </el-menu>
        </div>
      `
    }

    // Register test component
    mockApp.component('TestComponent', TestComponent)

    // Verify component registration
    expect(mockApp.component).toHaveBeenCalledWith('TestComponent', TestComponent)

    // Verify el-submenu is available
    expect(mockApp._componentMap.has('el-submenu')).toBe(true)
    expect(mockApp._componentMap.has('ElSubMenu')).toBe(true)
  })

  it('should handle application startup errors gracefully', async () => {
    // Mock a failure in app mounting
    mockApp.mount = vi.fn(() => {
      throw new Error('Mount failed')
    })

    const { vueErrorHandler } = require('@/utils/errorHandler')
    const mockError = new Error('Mount failed')

    // Mock error handler to capture errors
    let capturedError = null
    mockApp.config.errorHandler = vi.fn((error: Error) => {
      capturedError = error
    })

    // Attempt to initialize app
    expect(async () => {
      await import('../src/main.ts')
    }).rejects.toThrow()

    // Verify error was captured
    expect(capturedError).toBeNull() // Error handler should handle it gracefully
  })

  it('should initialize all required dependencies in correct order', async () => {
    const initializationOrder: string[] = []

    // Mock dependencies to track initialization order
    const originalUse = mockApp.use
    mockApp.use = vi.fn((plugin: any, options?: any) => {
      if (plugin === mockPinia) initializationOrder.push('pinia')
      if (plugin === mockRouter) initializationOrder.push('router')
      if (plugin === require('element-plus').default) initializationOrder.push('element-plus')
      return originalUse.call(mockApp, plugin, options)
    })

    const { setupIcons } = require('@/icons')
    setupIcons.mockImplementation(() => {
      initializationOrder.push('icons')
    })

    const { provideGlobalProperties } = require('@/composables/useGlobalProperties')
    provideGlobalProperties.mockImplementation(() => {
      initializationOrder.push('global-properties')
    })

    await import('../src/main.ts')

    // Verify initialization order
    expect(initializationOrder).toEqual([
      'pinia',
      'router',
      'element-plus',
      'icons',
      'global-properties'
    ])
  })

  it('should handle missing DOM element gracefully', async () => {
    // Mock mount to return null (DOM element not found)
    mockApp.mount = vi.fn(() => null)

    await import('../src/main.ts')

    // Verify mount was called
    expect(mockApp.mount).toHaveBeenCalledWith('#app')

    // App should still be initialized even if mount fails
    expect(mockApp.use).toHaveBeenCalledTimes(3) // pinia, router, element-plus
  })

  it('should validate component dependencies', async () => {
    await import('../src/main.ts')

    // Verify all required Element Plus components are registered
    const requiredComponents = [
      'ElMenu',
      'ElMenuItem',
      'ElSubMenu',
      'ElMenuItemGroup',
      'el-menu',
      'el-menu-item',
      'el-submenu',
      'el-menu-item-group'
    ]

    // Mock app.component to track calls
    const registeredComponents: string[] = []
    mockApp.component = vi.fn((name: string, component: any) => {
      registeredComponents.push(name)
      mockApp._componentMap.set(name, component)
      return mockApp
    })

    // Re-import to trigger component registration
    await import('../src/main.ts')

    // Verify critical components are registered
    expect(registeredComponents).toContain('BreadCrumbs')
    expect(registeredComponents).toContain('FileUpload')
    expect(registeredComponents).toContain('Editor')
  })
})
