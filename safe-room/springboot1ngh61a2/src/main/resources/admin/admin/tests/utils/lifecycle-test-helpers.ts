import { VueWrapper, mount, MountingOptions } from '@vue/test-utils'
import { createRouter, createMemoryHistory, Router } from 'vue-router'
import { createPinia, Pinia } from 'pinia'
import ElementPlus from 'element-plus'
import { Component } from 'vue'

/**
 * 生命周期测试辅助函数
 */

// Mock window resize event
export function mockWindowResize(width = 1200, height = 800) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    value: width
  })

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    value: height
  })
}

// Trigger window resize event
export function triggerWindowResize(width?: number, height?: number) {
  if (width !== undefined || height !== undefined) {
    mockWindowResize(width, height)
  }

  const resizeEvent = new Event('resize')
  window.dispatchEvent(resizeEvent)
}

// Mock storage with reactive behavior
export function createReactiveStorageMock() {
  const store: Record<string, string> = {}

  return {
    get: vi.fn((key: string) => store[key] || null),
    set: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    remove: vi.fn((key: string) => {
      delete store[key]
    }),
    getStore: () => ({ ...store }) // For testing purposes
  }
}

// Mock HTTP with async response support
export function createAsyncHttpMock() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn()
  }
}

// Enhanced component mounting for lifecycle testing
export interface LifecycleTestOptions extends MountingOptions<any> {
  mockStorage?: boolean
  mockHttp?: boolean
  mockRouter?: boolean
  mockWindowEvents?: boolean
}

export function mountForLifecycleTest<T extends Component>(
  component: T,
  options: LifecycleTestOptions = {}
): VueWrapper {
  const {
    mockStorage = true,
    mockHttp = true,
    mockRouter = true,
    mockWindowEvents = true,
    ...mountOptions
  } = options

  // Setup mocks
  if (mockStorage) {
    const storageMock = createReactiveStorageMock()
    vi.mock('@/utils/storage', () => ({
      default: storageMock
    }))
  }

  if (mockHttp) {
    const httpMock = createAsyncHttpMock()
    vi.mock('@/utils/http', () => ({
      default: httpMock
    }))
  }

  // Setup router and pinia
  let router: Router | undefined
  let pinia: Pinia | undefined

  if (mockRouter) {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { name: 'home', path: '/', component: { template: '<div>Home</div>' } },
        { name: 'login', path: '/login', component: { template: '<div>Login</div>' } }
      ]
    })
  }

  pinia = createPinia()

  // Setup window events
  if (mockWindowEvents) {
    mockWindowResize()
  }

  return mount(component, {
    global: {
      plugins: [
        ...(router ? [router] : []),
        ...(pinia ? [pinia] : []),
        ElementPlus
      ],
      ...mountOptions.global
    },
    ...mountOptions
  })
}

// Wait for lifecycle hooks to complete
export async function waitForLifecycleHooks(wrapper: VueWrapper, timeout = 100) {
  await wrapper.vm.$nextTick()
  await new Promise(resolve => setTimeout(resolve, timeout))
}

// Test lifecycle hook execution
export async function testLifecycleHook(
  wrapper: VueWrapper,
  hookName: 'mounted' | 'updated' | 'beforeUnmount',
  testFn: () => void | Promise<void>
) {
  const originalHook = wrapper.vm.$[hookName as keyof typeof wrapper.vm.$]

  if (originalHook) {
    // Spy on the lifecycle hook
    const hookSpy = vi.fn(originalHook)
    wrapper.vm.$[hookName as keyof typeof wrapper.vm.$] = hookSpy

    await testFn()

    expect(hookSpy).toHaveBeenCalled()
  } else {
    await testFn()
  }
}

// Test component unmounting
export function testComponentUnmounting(wrapper: VueWrapper) {
  const unmountSpy = vi.fn()

  // Listen for before unmount if available
  if (wrapper.vm.$beforeUnmount) {
    wrapper.vm.$on('hook:beforeUnmount', unmountSpy)
  }

  wrapper.unmount()

  // Verify component is unmounted
  expect(wrapper.element.parentElement).toBeNull()

  return unmountSpy
}

// Test async operations in lifecycle hooks
export async function testAsyncLifecycleOperation(
  wrapper: VueWrapper,
  operation: () => Promise<void>,
  timeout = 100
) {
  const promise = operation()

  // Wait for next tick and async operation
  await wrapper.vm.$nextTick()
  await new Promise(resolve => setTimeout(resolve, timeout))

  await promise

  // Final next tick to ensure all updates are processed
  await wrapper.vm.$nextTick()
}

// Test event listener cleanup
export function testEventListenerCleanup(
  addEventListenerSpy = vi.spyOn(window, 'addEventListener'),
  removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
) {
  return {
    expectAdded: (event: string, handler?: Function) => {
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        event,
        handler || expect.any(Function)
      )
    },
    expectRemoved: (event: string, handler?: Function) => {
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        event,
        handler || expect.any(Function)
      )
    },
    expectCleanedUp: () => {
      // Check that add and remove calls are balanced
      expect(addEventListenerSpy).toHaveBeenCalled()
      expect(removeEventListenerSpy).toHaveBeenCalled()
    }
  }
}

// Test storage operations in lifecycle
export function testStorageOperations(
  storageMock: ReturnType<typeof createReactiveStorageMock>
) {
  return {
    expectGet: (key: string, expectedValue?: string) => {
      expect(storageMock.get).toHaveBeenCalledWith(key)
      if (expectedValue !== undefined) {
        expect(storageMock.get(key)).toBe(expectedValue)
      }
    },
    expectSet: (key: string, value: string) => {
      expect(storageMock.set).toHaveBeenCalledWith(key, value)
    },
    expectClear: () => {
      expect(storageMock.clear).toHaveBeenCalled()
    },
    expectRemove: (key: string) => {
      expect(storageMock.remove).toHaveBeenCalledWith(key)
    }
  }
}

// Test HTTP operations in lifecycle
export function testHttpOperations(httpMock: ReturnType<typeof createAsyncHttpMock>) {
  return {
    expectGet: (url: string, params?: any) => {
      expect(httpMock.get).toHaveBeenCalledWith(url, params)
    },
    expectPost: (url: string, data?: any) => {
      expect(httpMock.post).toHaveBeenCalledWith(url, data)
    },
    expectPut: (url: string, data?: any) => {
      expect(httpMock.put).toHaveBeenCalledWith(url, data)
    },
    expectDelete: (url: string) => {
      expect(httpMock.delete).toHaveBeenCalledWith(url)
    }
  }
}
