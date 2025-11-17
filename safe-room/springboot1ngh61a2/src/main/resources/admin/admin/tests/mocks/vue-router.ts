import { vi } from 'vitest'

export const createRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  beforeEach: vi.fn(),
  afterEach: vi.fn(),
  beforeResolve: vi.fn(),
  afterEach: vi.fn(),
  onError: vi.fn(),
  isReady: vi.fn().mockResolvedValue(undefined),
  install: vi.fn()
}))

export const createWebHistory = vi.fn(() => ({
  base: '',
  destroy: vi.fn()
}))

export const createMemoryHistory = vi.fn(() => ({
  base: '',
  destroy: vi.fn()
}))

export const createWebHashHistory = vi.fn(() => ({
  base: '',
  destroy: vi.fn()
}))

export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  options: {},
  currentRoute: {
    path: '/',
    name: 'home',
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: [],
    meta: {},
    redirectedFrom: undefined
  }
}))

export const useRoute = vi.fn(() => ({
  path: '/',
  name: 'home',
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  matched: [],
  meta: {},
  redirectedFrom: undefined
}))

export const onBeforeRouteLeave = vi.fn()
export const onBeforeRouteUpdate = vi.fn()

// Default export for Vue plugin
const VueRouterMock = {
  createRouter,
  createWebHistory,
  createMemoryHistory,
  createWebHashHistory,
  useRouter,
  useRoute,
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  install: vi.fn()
}

export default VueRouterMock
