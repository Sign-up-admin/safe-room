import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import center from '@/pages/center/center.vue'

// Mock axios
const mockAxios = new AxiosMockAdapter(axios)

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn().mockResolvedValue(true)
  },
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot name="label" /><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue']
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
    props: ['modelValue']
  },
  ElOption: {
    name: 'ElOption',
    template: '<option :value="value">{{ label }}</option>',
    props: ['value', 'label']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button @click="$emit(\'click\')"><slot /></button>'
  }
}))

// Mock TechButton and TechCard components
vi.mock('@/components/common/TechButton.vue', () => ({
  name: 'TechButton',
  template: '<button @click="$emit(\'click\')"><slot /></button>',
  props: ['size', 'variant']
}))

vi.mock('@/components/common/TechCard.vue', () => ({
  name: 'TechCard',
  template: '<div class="tech-card"><slot /></div>',
  props: ['title', 'subtitle', 'interactive']
}))

// Mock FileUpload component
vi.mock('@/components/FileUpload.vue', () => ({
  name: 'FileUpload',
  template: '<div>FileUpload Mock</div>',
  props: ['action', 'tip', 'limit', 'fileUrls'],
  emits: ['change']
}))

// Mock crud service
vi.mock('@/services/crud', () => ({
  getModuleService: vi.fn(() => ({
    list: vi.fn().mockResolvedValue({ list: [], total: 0 })
  }))
}))

// Mock formatters
vi.mock('@/utils/formatters', () => ({
  formatDate: vi.fn((date) => date || '待定')
}))

// Mock storage
vi.mock('@/common/storage', () => ({
  default: {
    remove: vi.fn()
  }
}))

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home' },
    { path: '/login', name: 'login' },
    { path: '/center', name: 'center' },
    { path: '/index/kechengyuyue', name: 'courseBooking' },
    { path: '/index/huiyuanka', name: 'membership' },
    { path: '/index/pay', name: 'pay' }
  ]
})

describe('Center.vue', () => {
  let wrapper: any

  beforeEach(async () => {
    setActivePinia(createPinia())
    mockAxios.reset()

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })

    wrapper = await mount(center, {
      global: {
        plugins: [router],
        stubs: {
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-button': true,
          'tech-button': true,
          'tech-card': true,
          'file-upload': true
        }
      }
    })

    // Wait for router to be ready
    await router.isReady()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  describe('页面渲染', () => {
    it('应该正确渲染个人中心页面', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.center-page').exists()).toBe(true)
    })

    it('应该显示用户资料摘要', () => {
      expect(wrapper.text()).toContain('WELCOME BACK')
    })

    it('应该显示操作按钮', () => {
      expect(wrapper.text()).toContain('重置密码')
      expect(wrapper.text()).toContain('退出登录')
    })

    it('应该显示统计信息', () => {
      expect(wrapper.text()).toContain('7 天内到期提醒')
      expect(wrapper.text()).toContain('30 天内到期提醒')
      expect(wrapper.text()).toContain('即将开始的预约')
    })

    it('应该显示训练数据卡片', () => {
      expect(wrapper.text()).toContain('训练数据')
      expect(wrapper.text()).toContain('近 4 周训练趋势')
    })

    it('应该显示快捷链接', () => {
      expect(wrapper.text()).toContain('预约课程')
      expect(wrapper.text()).toContain('会员卡')
      expect(wrapper.text()).toContain('支付中心')
    })
  })

  describe('数据初始化', () => {
    it('应该在挂载时加载用户资料', async () => {
      const vm = wrapper.vm

      // Mock API response
      mockAxios.onGet('/yonghu/session').reply(200, {
        code: 0,
        data: {
          id: 1,
          yonghuzhanghao: 'testuser',
          yonghuxingming: '张三',
          xingbie: '男',
          shoujihaoma: '13800138000',
          huiyuankahao: 'MEM001'
        }
      })

      // Mock reminder stats
      mockAxios.onGet('/yonghu/remind/youxiaoqizhi/2').reply(200, {
        code: 0,
        count: 2
      })

      await vm.fetchProfile()

      expect(vm.profile.yonghuzhanghao).toBe('testuser')
      expect(vm.profile.yonghuxingming).toBe('张三')
      expect(vm.loading).toBe(false)
    })

    it('应该在未登录时跳转到登录页', async () => {
      const vm = wrapper.vm
      const replaceSpy = vi.spyOn(router, 'replace')

      // Mock API response - no data
      mockAxios.onGet('/yonghu/session').reply(200, {
        code: 0,
        data: null
      })

      await vm.fetchProfile()

      expect(replaceSpy).toHaveBeenCalledWith('/login')
    })

    it('应该加载提醒统计', async () => {
      const vm = wrapper.vm

      mockAxios.onGet('/yonghu/remind/youxiaoqizhi/2').reply((config) => {
        if (config.params.remindend === 7) {
          return [200, { code: 0, count: 3 }]
        }
        if (config.params.remindend === 30) {
          return [200, { code: 0, count: 8 }]
        }
        return [200, { code: 0, count: 0 }]
      })

      await vm.fetchReminderStats()

      expect(vm.remindStats.week).toBe(3)
      expect(vm.remindStats.month).toBe(8)
    })

    it('应该加载预约信息', async () => {
      const vm = wrapper.vm

      const mockCourses = {
        list: [
          { id: 1, kechengmingcheng: '瑜伽课程', yuyueshijian: '2025-01-15 10:00' }
        ]
      }

      const mockCoaches = {
        list: [
          { id: 2, jiaolianxingming: '李教练', yuyueshijian: '2025-01-16 14:00' }
        ]
      }

      // Mock the service calls
      const courseService = { list: vi.fn().mockResolvedValue(mockCourses) }
      const coachService = { list: vi.fn().mockResolvedValue(mockCoaches) }

      vi.mocked(await import('@/services/crud')).getModuleService
        .mockImplementation((module: string) => {
          if (module === 'kechengyuyue') return courseService
          if (module === 'sijiaoyuyue') return coachService
          return { list: vi.fn().mockResolvedValue({ list: [] }) }
        })

      await vm.fetchBookings()

      expect(vm.upcomingBookings.length).toBe(2)
      expect(courseService.list).toHaveBeenCalled()
      expect(coachService.list).toHaveBeenCalled()
    })
  })

  describe('训练数据可视化', () => {
    it('应该计算训练趋势数据', () => {
      const vm = wrapper.vm
      const trend = vm.trainingTrend

      expect(trend.length).toBe(4)
      expect(trend[0].label).toBe('W-1')
      expect(trend[3].label).toBe('W-4')

      trend.forEach((item: any) => {
        expect(item.value).toBeGreaterThanOrEqual(20)
        expect(item.value).toBeLessThanOrEqual(100)
        expect(item.label).toMatch(/^W-\d+$/)
      })
    })

    it('应该计算训练指标', () => {
      const vm = wrapper.vm
      const trend = vm.trainingTrend

      // 平均训练强度应该是一个有效数字
      const avgIntensity = Math.round(trend.reduce((sum: number, item: any) => sum + item.value, 0) / trend.length)
      expect(avgIntensity).toBeGreaterThanOrEqual(20)
      expect(avgIntensity).toBeLessThanOrEqual(100)

      // 最高训练强度应该大于等于所有值
      const maxIntensity = Math.max(...trend.map((item: any) => item.value))
      expect(maxIntensity).toBeGreaterThanOrEqual(20)
      expect(maxIntensity).toBeLessThanOrEqual(100)
    })

    it('应该正确处理头像URL', () => {
      const vm = wrapper.vm

      // 默认头像
      vm.profile.touxiang = ''
      expect(vm.avatarUrl).toContain('touxiang.png')

      // 完整URL
      vm.profile.touxiang = 'https://example.com/avatar.jpg'
      expect(vm.avatarUrl).toBe('https://example.com/avatar.jpg')

      // 相对路径
      vm.profile.touxiang = 'uploads/avatar.jpg'
      expect(vm.avatarUrl).toMatch(/\/uploads\/avatar\.jpg$/)
    })
  })

  describe('用户交互', () => {
    it('应该处理头像变更', () => {
      const vm = wrapper.vm
      const testUrl = 'new-avatar.jpg'

      vm.handleAvatarChange(testUrl)

      expect(vm.profile.touxiang).toBe(testUrl)
    })

    it('应该重置表单', () => {
      const vm = wrapper.vm

      // 设置原始资料
      vm.originalProfile = {
        yonghuxingming: '原始姓名',
        xingbie: '女'
      }

      // 修改当前资料
      vm.profile.yonghuxingming = '修改后姓名'
      vm.profile.xingbie = '男'

      vm.resetForm()

      expect(vm.profile.yonghuxingming).toBe('原始姓名')
      expect(vm.profile.xingbie).toBe('女')
    })
  })

  describe('保存功能', () => {
    it('应该成功保存个人资料', async () => {
      const vm = wrapper.vm

      // 设置表单数据
      vm.profile.yonghuxingming = '张三'
      vm.profile.xingbie = '男'
      vm.profile.shoujihaoma = '13800138000'

      // Mock 表单验证通过
      const mockValidate = vi.fn().mockResolvedValue(true)
      vm.$refs.formRef = { validate: mockValidate }

      // Mock API 响应
      mockAxios.onPost('/yonghu/update').reply(200, {
        code: 0,
        msg: '更新成功'
      })

      await vm.saveProfile()

      expect(mockAxios.history.post.length).toBe(1)
      expect(vm.saving).toBe(false)
      expect(vm.originalProfile?.yonghuxingming).toBe('张三')
    })

    it('应该在表单验证失败时阻止保存', async () => {
      const vm = wrapper.vm

      // Mock 表单验证失败
      const mockValidate = vi.fn().mockRejectedValue(new Error())
      vm.$refs.formRef = { validate: mockValidate }

      await vm.saveProfile()

      // 不应该发送请求
      expect(mockAxios.history.post.length).toBe(0)
    })
  })

  describe('退出登录', () => {
    it('应该成功退出登录', async () => {
      const vm = wrapper.vm
      const replaceSpy = vi.spyOn(router, 'replace')

      // Mock API 响应
      mockAxios.onPost('/yonghu/logout').reply(200, {
        code: 0
      })

      await vm.logout()

      expect(replaceSpy).toHaveBeenCalledWith('/login')
      expect(localStorage.removeItem).toHaveBeenCalledWith('UserTableName')
      expect(localStorage.removeItem).toHaveBeenCalledWith('userInfo')
      expect(localStorage.removeItem).toHaveBeenCalledWith('userid')
    })
  })

  describe('重置密码', () => {
    it('应该成功重置密码', async () => {
      const vm = wrapper.vm

      vm.profile.yonghuzhanghao = 'testuser'

      // Mock API 响应
      mockAxios.onPost('/yonghu/resetPass').reply(200, {
        code: 0,
        msg: '密码重置成功'
      })

      await vm.resetPassword()

      expect(mockAxios.history.post.length).toBe(1)
      const request = mockAxios.history.post[0]
      expect(request.params.username).toBe('testuser')
    })

    it('应该在没有用户名时阻止重置', async () => {
      const vm = wrapper.vm

      vm.profile.yonghuzhanghao = ''

      await vm.resetPassword()

      expect(mockAxios.history.post.length).toBe(0)
    })
  })

  describe('快捷链接', () => {
    it('应该包含正确的快捷链接配置', () => {
      const vm = wrapper.vm

      expect(vm.quickLinks).toEqual([
        { label: '预约课程', desc: '查看课程排期', path: '/index/kechengyuyue' },
        { label: '会员卡', desc: '查看权益与续费', path: '/index/huiyuanka' },
        { label: '支付中心', desc: '管理支付记录', path: '/index/pay' }
      ])
    })
  })
})
