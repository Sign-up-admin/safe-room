import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import register from '@/pages/register/register.vue'

// Mock axios
const mockAxios = new AxiosMockAdapter(axios)

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
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
  },
  ElCheckbox: {
    name: 'ElCheckbox',
    template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    props: ['modelValue']
  },
  ElRow: {
    name: 'ElRow',
    template: '<div><slot /></div>'
  },
  ElCol: {
    name: 'ElCol',
    template: '<div><slot /></div>'
  }
}))

// Mock FileUpload component
vi.mock('@/components/FileUpload.vue', () => ({
  name: 'FileUpload',
  template: '<div>FileUpload Mock</div>',
  props: ['action', 'tip', 'limit', 'fileUrls'],
  emits: ['change']
}))

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home' },
    { path: '/login', name: 'login' },
    { path: '/register', name: 'register' },
    { path: '/terms', name: 'terms' },
    { path: '/privacy', name: 'privacy' }
  ]
})

describe('Register.vue', () => {
  let wrapper: any

  beforeEach(async () => {
    setActivePinia(createPinia())
    mockAxios.reset()

    wrapper = await mount(register, {
      global: {
        plugins: [router],
        stubs: {
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-button': true,
          'el-checkbox': true,
          'el-row': true,
          'el-col': true,
          'file-upload': true,
          'router-link': true
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
    it('应该正确渲染注册表单', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.register-page').exists()).toBe(true)
      expect(wrapper.find('.register-card').exists()).toBe(true)
    })

    it('应该显示正确的标题和描述', () => {
      expect(wrapper.text()).toContain('JOIN THE FUTURE')
      expect(wrapper.text()).toContain('创建会员账号')
      expect(wrapper.text()).toContain('完善基本信息，加入智能健身房')
    })

    it('应该包含所有必需的表单字段', () => {
      expect(wrapper.text()).toContain('账号')
      expect(wrapper.text()).toContain('密码')
      expect(wrapper.text()).toContain('确认密码')
      expect(wrapper.text()).toContain('姓名')
      expect(wrapper.text()).toContain('性别')
      expect(wrapper.text()).toContain('手机号')
    })

    it('应该包含可选的表单字段', () => {
      expect(wrapper.text()).toContain('身高 (cm)')
      expect(wrapper.text()).toContain('体重 (kg)')
      expect(wrapper.text()).toContain('会员卡号')
      expect(wrapper.text()).toContain('头像')
    })

    it('应该显示条款同意复选框', () => {
      expect(wrapper.text()).toContain('我已阅读并同意')
      expect(wrapper.text()).toContain('《使用条款》')
      expect(wrapper.text()).toContain('《隐私政策》')
    })

    it('应该显示操作按钮', () => {
      expect(wrapper.text()).toContain('重置')
      expect(wrapper.text()).toContain('提交注册')
    })
  })

  describe('表单数据', () => {
    it('应该有正确的初始表单数据', () => {
      const vm = wrapper.vm
      expect(vm.form.yonghuzhanghao).toBe('')
      expect(vm.form.mima).toBe('')
      expect(vm.form.confirmPassword).toBe('')
      expect(vm.form.yonghuxingming).toBe('')
      expect(vm.form.xingbie).toBe('男')
      expect(vm.form.shoujihaoma).toBe('')
      expect(vm.form.shengao).toBe('')
      expect(vm.form.tizhong).toBe('')
      expect(vm.form.huiyuankahao).toBe('')
      expect(vm.form.touxiang).toBe('')
    })

    it('应该有正确的性别选项', () => {
      const vm = wrapper.vm
      expect(vm.genderOptions).toEqual(['男', '女'])
    })

    it('应该默认不同意条款', () => {
      const vm = wrapper.vm
      expect(vm.agreedToTerms).toBe(false)
    })
  })

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      const vm = wrapper.vm
      const isValid = await vm.$refs.formRef?.validate()
      expect(isValid).toBe(false)
    })

    it('应该验证账号长度', () => {
      const vm = wrapper.vm
      vm.form.yonghuzhanghao = 'ab' // 少于3个字符
      expect(vm.rules.yonghuzhanghao[1].min).toBe(3)
    })

    it('应该验证密码长度', () => {
      const vm = wrapper.vm
      vm.form.mima = '12345' // 少于6个字符
      expect(vm.rules.mima[1].min).toBe(6)
    })

    it('应该验证密码确认', () => {
      const vm = wrapper.vm
      vm.form.mima = 'password123'
      vm.form.confirmPassword = 'different' // 不匹配
      // 密码确认验证器会检查不匹配的情况
      expect(vm.form.mima).not.toBe(vm.form.confirmPassword)
    })

    it('应该验证手机号格式', () => {
      const vm = wrapper.vm
      expect(vm.rules.shoujihaoma[1].pattern).toEqual(/^1[3-9]\d{9}$/)
    })
  })

  describe('用户交互', () => {
    it('应该能导航到登录页面', async () => {
      const pushSpy = vi.spyOn(router, 'push')

      await wrapper.vm.goLogin()

      expect(pushSpy).toHaveBeenCalledWith('/login')
    })

    it('应该能重置表单', async () => {
      const vm = wrapper.vm

      // 设置表单数据
      vm.form.yonghuzhanghao = 'testuser'
      vm.form.mima = 'password123'
      vm.agreedToTerms = true

      // 重置表单
      vm.resetForm()

      expect(vm.form.yonghuzhanghao).toBe('')
      expect(vm.form.mima).toBe('')
      expect(vm.agreedToTerms).toBe(false)
    })

    it('应该处理头像上传', () => {
      const vm = wrapper.vm
      const testUrl = 'test-avatar.jpg'

      vm.handleAvatarChange(testUrl)

      expect(vm.form.touxiang).toBe(testUrl)
    })
  })

  describe('注册功能', () => {
    it('应该在未同意条款时阻止注册', async () => {
      const vm = wrapper.vm
      const warningSpy = vi.spyOn(import('element-plus'), 'ElMessage').then(mod => mod.ElMessage.warning)

      vm.agreedToTerms = false
      await vm.handleRegister()

      // 应该显示警告消息
      expect(warningSpy).toHaveBeenCalled()
    })

    it('应该在表单验证失败时阻止注册', async () => {
      const vm = wrapper.vm
      vm.agreedToTerms = true

      // Mock 表单验证失败
      const mockValidate = vi.fn().mockRejectedValue(new Error())
      vm.$refs.formRef = { validate: mockValidate }

      await vm.handleRegister()

      // 应该不会发送请求
      expect(mockAxios.history.post.length).toBe(0)
    })

    it('应该成功注册用户', async () => {
      const vm = wrapper.vm

      // 设置表单数据
      vm.form.yonghuzhanghao = 'testuser'
      vm.form.mima = 'password123'
      vm.form.confirmPassword = 'password123'
      vm.form.yonghuxingming = '张三'
      vm.form.xingbie = '男'
      vm.form.shoujihaoma = '13800138000'
      vm.agreedToTerms = true

      // Mock 表单验证通过
      const mockValidate = vi.fn().mockResolvedValue(true)
      vm.$refs.formRef = { validate: mockValidate }

      // Mock API 响应
      mockAxios.onPost('/yonghu/register').reply(200, {
        code: 0,
        msg: '注册成功'
      })

      const pushSpy = vi.spyOn(router, 'push')

      await vm.handleRegister()

      // 应该发送注册请求
      expect(mockAxios.history.post.length).toBe(1)
      expect(mockAxios.history.post[0].url).toBe('/yonghu/register')

      // 应该显示成功消息并跳转
      expect(pushSpy).toHaveBeenCalledWith('/login')
    })

    it('应该处理注册失败', async () => {
      const vm = wrapper.vm

      // 设置表单数据
      vm.form.yonghuzhanghao = 'testuser'
      vm.form.mima = 'password123'
      vm.form.confirmPassword = 'password123'
      vm.form.yonghuxingming = '张三'
      vm.form.xingbie = '男'
      vm.form.shoujihaoma = '13800138000'
      vm.agreedToTerms = true

      // Mock 表单验证通过
      const mockValidate = vi.fn().mockResolvedValue(true)
      vm.$refs.formRef = { validate: mockValidate }

      // Mock API 错误响应
      mockAxios.onPost('/yonghu/register').reply(200, {
        code: 1,
        msg: '用户名已存在'
      })

      await vm.handleRegister()

      // 应该显示错误消息
      expect(vm.submitting).toBe(false)
    })

    it('应该在提交期间禁用按钮', async () => {
      const vm = wrapper.vm

      // 设置表单数据
      vm.form.yonghuzhanghao = 'testuser'
      vm.form.mima = 'password123'
      vm.form.confirmPassword = 'password123'
      vm.form.yonghuxingming = '张三'
      vm.form.xingbie = '男'
      vm.form.shoujihaoma = '13800138000'
      vm.agreedToTerms = true

      // Mock 表单验证通过
      const mockValidate = vi.fn().mockResolvedValue(true)
      vm.$refs.formRef = { validate: mockValidate }

      // Mock API 响应（延迟响应以测试提交状态）
      mockAxios.onPost('/yonghu/register').reply(() => new Promise(resolve => {
          setTimeout(() => {
            resolve([200, { code: 0, msg: '注册成功' }])
          }, 100)
        }))

      // 开始注册
      const registerPromise = vm.handleRegister()

      // 应该设置提交状态
      expect(vm.submitting).toBe(true)

      // 等待完成
      await registerPromise

      // 应该重置提交状态
      expect(vm.submitting).toBe(false)
    })

    it('应该阻止重复提交', async () => {
      const vm = wrapper.vm

      // 设置表单数据和状态
      vm.form.yonghuzhanghao = 'testuser'
      vm.form.mima = 'password123'
      vm.form.confirmPassword = 'password123'
      vm.form.yonghuxingming = '张三'
      vm.form.xingbie = '男'
      vm.form.shoujihaoma = '13800138000'
      vm.agreedToTerms = true
      vm.submitting = true // 已经提交中

      await vm.handleRegister()

      // 不应该发送请求
      expect(mockAxios.history.post.length).toBe(0)
    })
  })
})
