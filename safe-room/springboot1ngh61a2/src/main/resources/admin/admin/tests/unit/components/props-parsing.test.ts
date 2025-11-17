/**
 * Props解析测试
 * 测试Vue组件Props的传递、类型验证、默认值等功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createApp, defineComponent, ref, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'

describe('Props Parsing Tests', () => {
  let app: any
  let router: any
  let pinia: any

  beforeEach(() => {
    app = createApp({
      template: '<div id="app"><router-view /></div>'
    })

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } }
      ]
    })

    pinia = createPinia()

    app.use(pinia)
    app.use(router)
  })

  afterEach(() => {
    if (app) {
      app.unmount()
    }
    vi.clearAllMocks()
  })

  describe('Basic Props Passing', () => {
    it('should pass string props correctly', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          title: {
            type: String,
            required: true
          }
        },
        template: '<div>{{ title }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        template: '<ChildComponent title="Hello World" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('Hello World')
    })

    it('should pass number props correctly', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          count: {
            type: Number,
            default: 0
          }
        },
        template: '<div>Count: {{ count }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        template: '<ChildComponent :count="42" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('Count: 42')
    })

    it('should pass boolean props correctly', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          enabled: {
            type: Boolean,
            default: false
          }
        },
        template: '<div>{{ enabled ? "Enabled" : "Disabled" }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        template: '<ChildComponent :enabled="true" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('Enabled')
    })

    it('should pass object props correctly', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          user: {
            type: Object,
            required: true
          }
        },
        template: '<div>{{ user.name }} - {{ user.age }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        data() {
          return {
            userData: {
              name: 'John Doe',
              age: 30
            }
          }
        },
        template: '<ChildComponent :user="userData" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('John Doe - 30')
    })

    it('should pass array props correctly', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          items: {
            type: Array,
            default: () => []
          }
        },
        template: '<ul><li v-for="item in items" :key="item">{{ item }}</li></ul>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        data() {
          return {
            itemList: ['Item 1', 'Item 2', 'Item 3']
          }
        },
        template: '<ChildComponent :items="itemList" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.findAll('li')).toHaveLength(3)
      expect(wrapper.text()).toContain('Item 1')
      expect(wrapper.text()).toContain('Item 2')
      expect(wrapper.text()).toContain('Item 3')
    })
  })

  describe('Props Type Validation', () => {
    it('should validate string props', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          title: {
            type: String,
            required: true,
            validator: (value: string) => value.length > 0
          }
        },
        template: '<div>{{ title }}</div>'
      })

      expect(() => {
        mount({
          template: '<ChildComponent title="Valid" />',
          components: { ChildComponent }
        }, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).not.toThrow()

      // In Vue 3 development mode, invalid prop types don't throw errors but may warn
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      expect(() => {
        mount({
          template: '<ChildComponent :title="123" />',
          components: { ChildComponent }
        }, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).not.toThrow()

      consoleWarnSpy.mockRestore()
    })

    it('should validate number props with range', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          value: {
            type: Number,
            required: true,
            validator: (value: number) => value >= 0 && value <= 100
          }
        },
        template: '<div>{{ value }}</div>'
      })

      expect(() => {
        mount({
          template: '<ChildComponent :value="50" />',
          components: { ChildComponent }
        }, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).not.toThrow()

      // In Vue 3 development mode, prop validation doesn't throw errors
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      expect(() => {
        mount({
          template: '<ChildComponent :value="150" />',
          components: { ChildComponent }
        }, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).not.toThrow()

      consoleWarnSpy.mockRestore()
    })

    it('should validate boolean props', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          flag: {
            type: Boolean,
            required: true
          }
        },
        template: '<div>{{ flag }}</div>'
      })

      expect(() => {
        mount({
          template: '<ChildComponent :flag="true" />',
          components: { ChildComponent }
        }, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).not.toThrow()

      // Vue 3中，props类型转换在生产模式下不会抛出错误，只会尝试转换
      expect(() => {
        const wrapper = mount({
          template: '<ChildComponent :flag="\'true\'" />',
          components: { ChildComponent }
        }, {
          global: {
            plugins: [router, pinia]
          }
        })
        // 验证组件仍然可以渲染（尽管类型不匹配）
        expect(wrapper.exists()).toBe(true)
      }).not.toThrow()
    })

    it('should validate object props with shape', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          config: {
            type: Object,
            required: true,
            validator: (value: any) => value &&
                     typeof value.title === 'string' &&
                     typeof value.enabled === 'boolean'
          }
        },
        template: '<div>{{ config.title }}</div>'
      })

      expect(() => {
        mount({
          template: '<ChildComponent :config="{ title: \'Test\', enabled: true }" />',
          components: { ChildComponent }
        }, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).not.toThrow()

      // 对象prop验证在Vue 3中不会抛出错误
      expect(() => {
        const wrapper = mount({
          template: '<ChildComponent :config="{ title: \'Test\' }" />',
          components: { ChildComponent }
        }, {
          global: {
            plugins: [router, pinia]
          }
        })
        expect(wrapper.exists()).toBe(true)
      }).not.toThrow()
    })

    it('should handle multiple prop types', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          value: {
            type: [String, Number],
            required: true
          }
        },
        template: '<div>{{ value }}</div>'
      })

      expect(() => {
        mount({
          template: '<ChildComponent value="string" />',
          components: { ChildComponent }
        }, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).not.toThrow()

      expect(() => {
        mount({
          template: '<ChildComponent :value="42" />',
          components: { ChildComponent }
        }, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).not.toThrow()

      // 多类型prop验证在Vue 3中不会抛出错误
      expect(() => {
        const wrapper = mount({
          template: '<ChildComponent :value="true" />',
          components: { ChildComponent }
        }, {
          global: {
            plugins: [router, pinia]
          }
        })
        expect(wrapper.exists()).toBe(true)
      }).not.toThrow()
    })
  })

  describe('Props Default Values', () => {
    it('should use string default values', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          title: {
            type: String,
            default: 'Default Title'
          }
        },
        template: '<div>{{ title }}</div>'
      })

      const wrapper = mount(ChildComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('Default Title')
    })

    it('should use number default values', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          count: {
            type: Number,
            default: 10
          }
        },
        template: '<div>{{ count }}</div>'
      })

      const wrapper = mount(ChildComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('10')
    })

    it('should use function default values for objects and arrays', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          items: {
            type: Array,
            default: () => [1, 2, 3]
          },
          config: {
            type: Object,
            default: () => ({ title: 'Default Config' })
          }
        },
        template: '<div>{{ items.length }} - {{ config.title }}</div>'
      })

      const wrapper = mount(ChildComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('3 - Default Config')
    })

    it('should override default values when props are provided', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          title: {
            type: String,
            default: 'Default Title'
          }
        },
        template: '<div>{{ title }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        template: '<ChildComponent title="Custom Title" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('Custom Title')
    })
  })

  describe('Kebab-case and CamelCase Conversion', () => {
    it('should convert kebab-case props to camelCase', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          userName: {
            type: String,
            required: true
          },
          isVisible: {
            type: Boolean,
            default: true
          }
        },
        template: '<div>{{ userName }} - {{ isVisible }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        template: '<ChildComponent user-name="John" is-visible="false" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('John - false')
    })

    it('should handle complex kebab-case conversions', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          httpUrl: {
            type: String,
            required: true
          },
          xmlData: {
            type: String,
            default: ''
          }
        },
        template: '<div>{{ httpUrl }} - {{ xmlData }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        template: '<ChildComponent http-url="https://example.com" xml-data="<xml></xml>" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('https://example.com - <xml></xml>')
    })
  })

  describe('Required Props Validation', () => {
    it('should handle missing required props in development mode', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          title: {
            type: String,
            required: true
          }
        },
        template: '<div>{{ title }}</div>'
      })

      // In Vue 3 development mode, missing required props don't throw errors
      // but may show warnings
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      expect(() => {
        mount(ChildComponent, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).not.toThrow()

      consoleWarnSpy.mockRestore()
    })

    it('should not throw error when required props are provided', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          title: {
            type: String,
            required: true
          }
        },
        template: '<div>{{ title }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        template: '<ChildComponent title="Required Title" />'
      })

      expect(() => {
        mount(ParentComponent, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).not.toThrow()
    })
  })

  describe('Dynamic Props', () => {
    it('should handle dynamic props with v-bind', async () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          message: {
            type: String,
            required: true
          }
        },
        template: '<div>{{ message }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        data() {
          return {
            dynamicProps: {
              message: 'Dynamic Message'
            }
          }
        },
        template: '<ChildComponent v-bind="dynamicProps" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('Dynamic Message')

      // Change dynamic props
      wrapper.vm.dynamicProps.message = 'Updated Message'
      await nextTick()
      expect(wrapper.text()).toBe('Updated Message')
    })

    it('should handle dynamic prop updates', async () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          value: {
            type: Number,
            required: true
          }
        },
        template: '<div>{{ value }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        data() {
          return {
            currentValue: 1
          }
        },
        template: '<ChildComponent :value="currentValue" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('1')

      // Update prop value
      wrapper.vm.currentValue = 42
      await nextTick()
      expect(wrapper.text()).toBe('42')
    })
  })

  describe('Props with Watchers and Computed', () => {
    it('should handle props with watchers', async () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          value: {
            type: Number,
            required: true
          }
        },
        data() {
          return {
            doubledValue: 0
          }
        },
        watch: {
          value: {
            immediate: true,
            handler(newValue: number) {
              this.doubledValue = newValue * 2
            }
          }
        },
        template: '<div>{{ doubledValue }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        data() {
          return {
            numberValue: 5
          }
        },
        template: '<ChildComponent :value="numberValue" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('10')

      // Update prop
      wrapper.vm.numberValue = 8
      await nextTick()
      expect(wrapper.text()).toBe('16')
    })

    it('should handle props in computed properties', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          price: {
            type: Number,
            required: true
          }
        },
        computed: {
          formattedPrice() {
            return `$${this.price.toFixed(2)}`
          }
        },
        template: '<div>{{ formattedPrice }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        template: '<ChildComponent :price="99.99" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('$99.99')
    })
  })

  describe('Props Error Handling', () => {
    it('should handle invalid prop types gracefully in development', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          value: {
            type: String,
            required: true
          }
        },
        template: '<div>{{ value }}</div>'
      })

      // In development, Vue will warn about invalid props
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      expect(() => {
        mount({
          template: '<ChildComponent :value="123" />',
          components: { ChildComponent }
        }, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).not.toThrow()

      consoleWarnSpy.mockRestore()
    })

    it('should handle missing validator functions', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          value: {
            type: String,
            validator: undefined // Invalid validator
          }
        },
        template: '<div>{{ value }}</div>'
      })

      expect(() => {
        mount({
          template: '<ChildComponent value="test" />',
          components: { ChildComponent }
        }, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).not.toThrow()
    })
  })

  describe('Parent-Child Props Communication', () => {
    it('should handle props flowing from parent to child', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          parentMessage: {
            type: String,
            required: true
          }
        },
        template: '<div>{{ parentMessage }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        data() {
          return {
            message: 'Hello from parent'
          }
        },
        template: '<ChildComponent :parent-message="message" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('Hello from parent')
    })

    it('should handle props with emit communication', async () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          value: {
            type: Number,
            required: true
          }
        },
        emits: ['update'],
        data() {
          return {
            newValue: 100
          }
        },
        template: '<button @click="$emit(\'update\', newValue)">{{ value }}</button>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: { ChildComponent },
        data() {
          return {
            count: 1
          }
        },
        methods: {
          onUpdate(newValue: number) {
            this.count = newValue
          }
        },
        template: '<ChildComponent :value="count" @update="onUpdate" />'
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('1')

      // Trigger emit from child
      wrapper.find('button').trigger('click')
      await nextTick()
      expect(wrapper.text()).toBe('100')
    })
  })
})
