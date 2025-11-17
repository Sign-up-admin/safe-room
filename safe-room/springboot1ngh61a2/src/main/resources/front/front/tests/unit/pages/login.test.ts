import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import Login from '@/pages/login/login.vue'

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register' },
    { path: '/home', name: 'home' }
  ]
})

// Mock dependencies
vi.mock('@/common/http', () => ({
  default: {
    post: vi.fn()
  }
}))

vi.mock('@/common/storage', () => ({
  default: {
    set: vi.fn(),
    get: vi.fn()
  }
}))

vi.mock('@/config/menu', () => ({
  default: {
    list: vi.fn(() => [
      {
        roleName: '用户',
        tableName: 'yonghu',
        hasFrontLogin: '是'
      },
      {
        roleName: '管理员',
        tableName: 'users',
        hasFrontLogin: '否'
      }
    ])
  }
}), { virtual: true })

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

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

describe('Login.vue', () => {
  let wrapper: any
  let httpPostMock: any

  beforeAll(async () => {
    const { default: http } = await import('@/common/http')
    httpPostMock = vi.mocked(http.post)
  })

  beforeEach(async () => {
    router.push('/login')
    await router.isReady()

    // Reset mocks
    vi.clearAllMocks()
    const { default: http } = await import('@/common/http')
    httpPostMock = vi.mocked(http.post)

    wrapper = mount(Login, {
      global: {
        plugins: [router],
        stubs: {
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-checkbox': true,
          'el-link': true,
          'el-alert': true
        }
      }
    })
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.login-page').exists()).toBe(true)
    expect(wrapper.find('.login-grid').exists()).toBe(true)
  })

  it('displays hero section content', () => {
    const heroSection = wrapper.find('.login-hero')
    expect(heroSection.exists()).toBe(true)
    expect(heroSection.text()).toContain('WELCOME BACK')
    expect(heroSection.text()).toContain('登录后即可预约课程、管理会员卡')
    expect(heroSection.text()).toContain('科技助力训练')
  })

  it('displays login form section', () => {
    const formSection = wrapper.find('.login-form')
    expect(formSection.exists()).toBe(true)
    expect(formSection.text()).toContain('会员登录')
    expect(formSection.text()).toContain('输入账号密码，开启高效训练体验')
  })

  it('has hero section features list', () => {
    const heroSection = wrapper.find('.login-hero')
    const listItems = heroSection.findAll('li')
    expect(listItems.length).toBe(3)
    expect(listItems[0].text()).toBe('在线预约私教 / 团课')
    expect(listItems[1].text()).toBe('查看公告与课程动态')
    expect(listItems[2].text()).toBe('续费会员卡、查看消费记录')
  })

  it('initializes with correct default values', () => {
    const vm = wrapper.vm
    expect(vm.loginForm.username).toBe('')
    expect(vm.loginForm.password).toBe('')
    expect(vm.loginForm.tableName).toBe('yonghu')
    expect(vm.submitting).toBe(false)
    expect(vm.rememberMe).toBe(true)
    expect(vm.errorMessage).toBe('')
  })

  it('loads remembered username from localStorage on mount', async () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'front_username') return 'testuser'
      if (key === 'UserTableName') return 'yonghu'
      return null
    })

    // Re-mount component to trigger onMounted
    const newWrapper = mount(Login, {
      global: {
        plugins: [router],
        stubs: wrapper.global.stubs
      }
    })

    await newWrapper.vm.$nextTick()

    const vm = newWrapper.vm
    expect(vm.loginForm.username).toBe('testuser')
    expect(localStorageMock.getItem).toHaveBeenCalledWith('front_username')
  })

  it('loads saved role from localStorage on mount', async () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'UserTableName') return 'yonghu'
      return null
    })

    await wrapper.vm.$nextTick()

    const vm = wrapper.vm
    expect(vm.loginForm.tableName).toBe('yonghu')
    expect(localStorageMock.getItem).toHaveBeenCalledWith('UserTableName')
  })

  it('computes role options correctly', () => {
    const vm = wrapper.vm
    const expectedRoles = [
      { label: '用户', value: 'yonghu' }
    ]
    expect(vm.roleOptions).toEqual(expectedRoles)
  })

  it('shows role selector when multiple roles available', async () => {
    // Mock multiple roles - import the mock directly
    const { default: menuMock } = await import('@/config/menu')
    vi.mocked(menuMock.list).mockReturnValue([
      {
        roleName: '用户',
        tableName: 'yonghu',
        hasFrontLogin: '是'
      },
      {
        roleName: '教练',
        tableName: 'jianshenjiaolian',
        hasFrontLogin: '是'
      }
    ])

    // Re-mount component to get new computed values
    const newWrapper = mount(Login, {
      global: {
        plugins: [router],
        stubs: wrapper.global.stubs
      }
    })

    await newWrapper.vm.$nextTick()

    const vm = newWrapper.vm
    expect(vm.roleOptions.length).toBe(2)
  })

  it('validates form fields correctly', () => {
    const vm = wrapper.vm
    expect(vm.rules.username[0].required).toBe(true)
    expect(vm.rules.password[0].required).toBe(true)
    expect(vm.rules.tableName[0].required).toBe(true)
  })

  it('handles successful login', async () => {
    const mockResponse = {
      data: {
        code: 0,
        msg: '登录成功',
        token: 'mock-token'
      }
    }
    httpPostMock.mockResolvedValue(mockResponse)

    const vm = wrapper.vm
    vm.loginForm.username = 'testuser'
    vm.loginForm.password = 'password123'

    await vm.handleLogin()

    expect(httpPostMock).toHaveBeenCalledWith('/yonghu/login', null, {
      params: {
        username: 'testuser',
        password: 'password123'
      }
    })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('front_username', 'testuser')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('UserTableName', 'yonghu')
  })

  it('handles login failure', async () => {
    const mockResponse = {
      data: {
        code: 1,
        msg: '用户名或密码错误'
      }
    }
    httpPostMock.mockResolvedValue(mockResponse)

    const vm = wrapper.vm
    vm.loginForm.username = 'testuser'
    vm.loginForm.password = 'wrongpassword'

    await vm.handleLogin()

    expect(vm.errorMessage).toBe('用户名或密码错误')
    expect(vm.submitting).toBe(false)
  })

  it('prevents multiple simultaneous login attempts', async () => {
    const vm = wrapper.vm
    vm.submitting = true

    await vm.handleLogin()

    expect(httpPostMock).not.toHaveBeenCalled()
  })

  it('navigates to register page', async () => {
    const pushSpy = vi.spyOn(router, 'push')

    const vm = wrapper.vm
    await vm.goToRegister()

    expect(pushSpy).toHaveBeenCalledWith('/index/register')
  })

  it('clears remembered username when rememberMe is false', async () => {
    const mockResponse = {
      data: {
        code: 0,
        msg: '登录成功',
        token: 'mock-token'
      }
    }
    httpPostMock.mockResolvedValue(mockResponse)

    const vm = wrapper.vm
    vm.loginForm.username = 'testuser'
    vm.loginForm.password = 'password123'
    vm.rememberMe = false

    await vm.handleLogin()

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('front_username')
  })

  it('shows error alert when errorMessage is set', async () => {
    const vm = wrapper.vm
    vm.errorMessage = '登录失败'

    await wrapper.vm.$nextTick()

    // Re-mount component to trigger reactivity
    const newWrapper = mount(Login, {
      global: {
        plugins: [router],
        stubs: wrapper.global.stubs
      },
      data() {
        return {
          errorMessage: '登录失败'
        }
      }
    })

    await newWrapper.vm.$nextTick()

    const alert = newWrapper.findComponent({ name: 'el-alert' })
    expect(alert.exists()).toBe(true)
    expect(alert.props('title')).toBe('登录失败')
    expect(alert.props('type')).toBe('error')
  })

  it('has correct form structure', () => {
    expect(wrapper.find('.form-header').exists()).toBe(true)
    expect(wrapper.find('.form-actions').exists()).toBe(true)
    expect(wrapper.find('.submit-btn').exists()).toBe(true)
  })

  it('displays submit button text based on submitting state', async () => {
    const vm = wrapper.vm

    // Initial state
    expect(wrapper.find('.submit-btn').text()).toBe('登录')

    // Submitting state - re-mount component to trigger reactivity
    const newWrapper = mount(Login, {
      global: {
        plugins: [router],
        stubs: wrapper.global.stubs
      },
      data() {
        return {
          submitting: true
        }
      }
    })

    await newWrapper.vm.$nextTick()
    expect(newWrapper.find('.submit-btn').text()).toBe('登录中...')
  })
})
