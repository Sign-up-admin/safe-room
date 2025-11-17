/**
 * 模板解析测试
 * 测试Vue组件模板的解析、嵌套和渲染功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createApp, defineComponent, ref, reactive, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Mock Element Plus components for template testing
vi.mock('element-plus', () => ({
  ElButton: {
    name: 'ElButton',
    template: '<button :class="type" :disabled="disabled"><slot /></button>',
    props: ['type', 'size', 'disabled']
  },
  ElInput: {
    name: 'ElInput',
    template: '<input :value="modelValue" :placeholder="placeholder" :disabled="disabled" />',
    props: ['modelValue', 'placeholder', 'disabled']
  },
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><div v-if="header" class="el-card__header">{{ header }}</div><div class="el-card__body"><slot /></div></div>',
    props: ['header']
  },
  default: {
    install(app: any) {
      app.component('ElButton', this.ElButton)
      app.component('ElInput', this.ElInput)
      app.component('ElCard', this.ElCard)
    }
  }
}))

describe('Template Parsing Tests', () => {
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

  describe('Basic Template Parsing', () => {
    it('should parse simple HTML templates', () => {
      const SimpleTemplate = defineComponent({
        template: '<div class="container"><h1>Hello World</h1><p>Simple template</p></div>'
      })

      const wrapper = mount(SimpleTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.classes()).toContain('container')
      expect(wrapper.find('h1').text()).toBe('Hello World')
      expect(wrapper.find('p').text()).toBe('Simple template')
    })

    it('should parse templates with Vue directives', async () => {
      const DirectiveTemplate = defineComponent({
        data() {
          return {
            show: true
          }
        },
        template: '<div><span v-if="show">Visible</span><span v-else>Hidden</span></div>'
      })

      const wrapper = mount(DirectiveTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('Visible')

      // Change data and check reactivity
      await wrapper.setData({ show: false })
      await nextTick()
      expect(wrapper.text()).toBe('Hidden')
    })

    it('should parse templates with class and style bindings', () => {
      const BindingTemplate = defineComponent({
        data() {
          return {
            dynamicClass: 'active',
            dynamicStyle: { color: 'red' },
            message: 'Styled Text'
          }
        },
        template: '<div :class="dynamicClass" :style="dynamicStyle">{{ message }}</div>'
      })

      const wrapper = mount(BindingTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.classes()).toContain('active')
      expect(wrapper.attributes('style')).toContain('color: red')
      expect(wrapper.text()).toBe('Styled Text')
    })

    it('should parse templates with event handlers', async () => {
      const EventTemplate = defineComponent({
        data() {
          return {
            count: 0
          }
        },
        methods: {
          increment() {
            this.count++
          }
        },
        template: '<button @click="increment">{{ count }}</button>'
      })

      const wrapper = mount(EventTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('0')

      await wrapper.find('button').trigger('click')
      await nextTick()
      expect(wrapper.text()).toBe('1')
    })
  })

  describe('Nested Component Parsing', () => {
    it('should parse nested components correctly', () => {
      const ChildComponent = defineComponent({
        name: 'ChildComponent',
        props: {
          content: {
            type: String,
            default: 'Default Content'
          }
        },
        template: '<div class="child">{{ content }}</div>'
      })

      const ParentComponent = defineComponent({
        name: 'ParentComponent',
        components: {
          ChildComponent
        },
        template: `
          <div class="parent">
            <ChildComponent content="Child 1" />
            <ChildComponent content="Child 2" />
          </div>
        `
      })

      const wrapper = mount(ParentComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.classes()).toContain('parent')
      expect(wrapper.findAll('.child')).toHaveLength(2)
      expect(wrapper.text()).toContain('Child 1')
      expect(wrapper.text()).toContain('Child 2')
    })

    it('should handle deeply nested components', () => {
      const LeafComponent = defineComponent({
        name: 'LeafComponent',
        props: ['value'],
        template: '<span>{{ value }}</span>'
      })

      const MiddleComponent = defineComponent({
        name: 'MiddleComponent',
        components: { LeafComponent },
        props: ['value'],
        template: '<div><LeafComponent :value="value" /></div>'
      })

      const RootComponent = defineComponent({
        name: 'RootComponent',
        components: { MiddleComponent },
        template: '<div><MiddleComponent value="Nested Value" /></div>'
      })

      const wrapper = mount(RootComponent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('Nested Value')
    })

    it('should handle sibling component nesting', () => {
      const ComponentA = defineComponent({
        name: 'ComponentA',
        props: ['prop'],
        template: '<div>A: {{ prop }}</div>'
      })

      const ComponentB = defineComponent({
        name: 'ComponentB',
        props: ['prop'],
        template: '<div>B: {{ prop }}</div>'
      })

      const Parent = defineComponent({
        name: 'Parent',
        components: {
          ComponentA,
          ComponentB
        },
        template: `
          <div>
            <ComponentA prop="First" />
            <ComponentB prop="Second" />
            <ComponentA prop="Third" />
          </div>
        `
      })

      const wrapper = mount(Parent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toContain('A: First')
      expect(wrapper.text()).toContain('B: Second')
      expect(wrapper.text()).toContain('A: Third')
    })
  })

  describe('Dynamic Component Parsing', () => {
    it('should parse dynamic components with <component> tag', async () => {
      const ComponentA = defineComponent({
        template: '<div>Component A</div>'
      })

      const ComponentB = defineComponent({
        template: '<div>Component B</div>'
      })

      const DynamicParent = defineComponent({
        components: {
          ComponentA,
          ComponentB
        },
        data() {
          return {
            currentComponent: 'ComponentA'
          }
        },
        template: '<div><component :is="currentComponent" /></div>'
      })

      const wrapper = mount(DynamicParent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('Component A')

      // Switch to ComponentB
      wrapper.vm.currentComponent = 'ComponentB'
      await nextTick()
      expect(wrapper.text()).toBe('Component B')
    })

    it('should handle dynamic component with keep-alive', async () => {
      const ComponentA = defineComponent({
        data() {
          return { count: 0 }
        },
        mounted() {
          this.count = 1
        },
        template: '<div>A: {{ count }}</div>'
      })

      const ComponentB = defineComponent({
        data() {
          return { count: 0 }
        },
        mounted() {
          this.count = 2
        },
        template: '<div>B: {{ count }}</div>'
      })

      const Parent = defineComponent({
        components: {
          ComponentA,
          ComponentB
        },
        data() {
          return {
            currentComponent: 'ComponentA'
          }
        },
        template: `
          <div>
            <keep-alive>
              <component :is="currentComponent" />
            </keep-alive>
          </div>
        `
      })

      const wrapper = mount(Parent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('A: 1')

      // Switch to ComponentB
      wrapper.vm.currentComponent = 'ComponentB'
      await nextTick()
      expect(wrapper.text()).toBe('B: 2')

      // Switch back to ComponentA - should maintain state with keep-alive
      wrapper.vm.currentComponent = 'ComponentA'
      await nextTick()
      expect(wrapper.text()).toBe('A: 1')
    })
  })

  describe('Slot Parsing', () => {
    it('should parse default slots', () => {
      const SlotComponent = defineComponent({
        name: 'SlotComponent',
        template: '<div class="slot-wrapper"><slot /></div>'
      })

      const Parent = defineComponent({
        name: 'Parent',
        components: { SlotComponent },
        template: '<SlotComponent>Default slot content</SlotComponent>'
      })

      const wrapper = mount(Parent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.classes()).toContain('slot-wrapper')
      expect(wrapper.text()).toBe('Default slot content')
    })

    it('should parse named slots', () => {
      const LayoutComponent = defineComponent({
        name: 'LayoutComponent',
        template: `
          <div class="layout">
            <header><slot name="header" /></header>
            <main><slot /></main>
            <footer><slot name="footer" /></footer>
          </div>
        `
      })

      const Parent = defineComponent({
        name: 'Parent',
        components: { LayoutComponent },
        template: `
          <LayoutComponent>
            <template #header>Header Content</template>
            Main Content
            <template #footer>Footer Content</template>
          </LayoutComponent>
        `
      })

      const wrapper = mount(Parent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.classes()).toContain('layout')
      expect(wrapper.text()).toContain('Header Content')
      expect(wrapper.text()).toContain('Main Content')
      expect(wrapper.text()).toContain('Footer Content')
    })

    it('should parse scoped slots', () => {
      const ListComponent = defineComponent({
        name: 'ListComponent',
        data() {
          return {
            items: [
              { id: 1, name: 'Item 1', value: 100 },
              { id: 2, name: 'Item 2', value: 200 }
            ]
          }
        },
        template: `
          <ul>
            <li v-for="item in items" :key="item.id">
              <slot :item="item" :index="$index">{{ item.name }}</slot>
            </li>
          </ul>
        `
      })

      const Parent = defineComponent({
        name: 'Parent',
        components: { ListComponent },
        template: `
          <ListComponent>
            <template #default="{ item, index }">
              {{ item.name }} - {{ item.value }} ({{ index }})
            </template>
          </ListComponent>
        `
      })

      const wrapper = mount(Parent, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.findAll('li')).toHaveLength(2)
      expect(wrapper.text()).toContain('Item 1 - 100')
      expect(wrapper.text()).toContain('Item 2 - 200')
    })
  })

  describe('List Rendering and Conditionals', () => {
    it('should parse v-for directive', () => {
      const ListTemplate = defineComponent({
        data() {
          return {
            items: [
              { id: 1, name: 'Item 1' },
              { id: 2, name: 'Item 2' },
              { id: 3, name: 'Item 3' }
            ]
          }
        },
        template: '<ul><li v-for="item in items" :key="item.id">{{ item.name }}</li></ul>'
      })

      const wrapper = mount(ListTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.findAll('li')).toHaveLength(3)
      expect(wrapper.text()).toContain('Item 1')
      expect(wrapper.text()).toContain('Item 2')
      expect(wrapper.text()).toContain('Item 3')
    })

    it('should parse v-if and v-else directives', async () => {
      const ConditionalTemplate = defineComponent({
        data() {
          return {
            condition: true,
            showMessage: false,
            message: 'Hidden message'
          }
        },
        template: `
          <div>
            <div v-if="condition">True condition</div>
            <div v-else>False condition</div>
            <div v-if="showMessage">{{ message }}</div>
          </div>
        `
      })

      const wrapper = mount(ConditionalTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toContain('True condition')
      expect(wrapper.text()).not.toContain('False condition')
      expect(wrapper.text()).not.toContain('Hidden message')

      // Change conditions
      wrapper.setData({ condition: false, showMessage: true })
      await nextTick()
      expect(wrapper.text()).toContain('False condition')
      expect(wrapper.text()).toContain('Hidden message')
    })

    it('should parse v-show directive', () => {
      const ShowTemplate = defineComponent({
        data() {
          return {
            visible: true
          }
        },
        template: '<div v-show="visible">Visible content</div>'
      })

      const wrapper = mount(ShowTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.isVisible()).toBe(true)
      expect(wrapper.text()).toBe('Visible content')

      await wrapper.setData({ visible: false })
      await nextTick()
      expect(wrapper.isVisible()).toBe(false)
    })

    it('should parse complex conditional and list rendering', () => {
      const ComplexTemplate = defineComponent({
        data() {
          return {
            showList: true,
            items: [
              { id: 1, name: 'Item 1', visible: true },
              { id: 2, name: 'Item 2', visible: false },
              { id: 3, name: 'Item 3', visible: true }
            ]
          }
        },
        computed: {
          filteredItems() {
            return this.items.filter(item => item.visible)
          }
        },
        template: `
          <div>
            <ul v-if="showList">
              <li v-for="item in filteredItems" :key="item.id" v-show="item.visible">
                {{ item.name }}
              </li>
            </ul>
            <div v-else>No items to show</div>
          </div>
        `
      })

      const wrapper = mount(ComplexTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.findAll('li')).toHaveLength(2)
      expect(wrapper.text()).toContain('Item 1')
      expect(wrapper.text()).toContain('Item 3')
      expect(wrapper.text()).not.toContain('Item 2')
    })
  })

  describe('Template Binding and Expressions', () => {
    it('should parse text interpolation', () => {
      const InterpolationTemplate = defineComponent({
        data() {
          return {
            name: 'John',
            age: 25
          }
        },
        template: '<div>Hello {{ name }}, you are {{ age }} years old!</div>'
      })

      const wrapper = mount(InterpolationTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('Hello John, you are 25 years old!')
    })

    it('should parse complex expressions in templates', () => {
      const ExpressionTemplate = defineComponent({
        data() {
          return {
            message: 'hello',
            count: 5
          }
        },
        template: '<div>{{ message.toUpperCase() }} - {{ count * 2 + 1 }}</div>'
      })

      const wrapper = mount(ExpressionTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toBe('HELLO - 11')
    })

    it('should parse attribute bindings', () => {
      const AttributeTemplate = defineComponent({
        data() {
          return {
            inputValue: 'test value',
            placeholderText: 'Enter text',
            isDisabled: false
          }
        },
        template: '<input :value="inputValue" :placeholder="placeholderText" :disabled="isDisabled">'
      })

      const wrapper = mount(AttributeTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.attributes('value')).toBe('test value')
      expect(wrapper.attributes('placeholder')).toBe('Enter text')
      expect(wrapper.attributes('disabled')).toBeUndefined()
    })

    it('should parse class and style object bindings', () => {
      const ClassStyleTemplate = defineComponent({
        data() {
          return {
            classObject: {
              active: true,
              disabled: false,
              'text-primary': true
            },
            styleObject: {
              color: 'red',
              fontSize: '14px',
              marginTop: '10px'
            }
          }
        },
        template: '<div :class="classObject" :style="styleObject">Styled Element</div>'
      })

      const wrapper = mount(ClassStyleTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.classes()).toContain('active')
      expect(wrapper.classes()).toContain('text-primary')
      expect(wrapper.classes()).not.toContain('disabled')

      const style = wrapper.attributes('style')
      expect(style).toContain('color: red')
      expect(style).toContain('font-size: 14px')
      expect(style).toContain('margin-top: 10px')
    })
  })

  describe('Template Error Handling', () => {
    it('should handle malformed templates gracefully', () => {
      const MalformedTemplate = defineComponent({
        template: '<div>Unclosed <span>tag</div>'
      })

      expect(() => {
        mount(MalformedTemplate, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).toThrow()
    })

    it('should handle undefined variables in templates', () => {
      const UndefinedVarTemplate = defineComponent({
        data() {
          return {
            // undefinedVariable is not defined
          }
        },
        template: '<div>{{ undefinedVariable }}</div>'
      })

      const wrapper = mount(UndefinedVarTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Vue handles undefined variables gracefully
      expect(wrapper.text()).toBe('')
    })

    it('should handle invalid expressions in templates', () => {
      const InvalidExpressionTemplate = defineComponent({
        data() {
          return {
            invalid: null
          }
        },
        template: '<div>{{ invalid.syntax }}</div>'
      })

      expect(() => {
        mount(InvalidExpressionTemplate, {
          global: {
            plugins: [router, pinia]
          }
        })
      }).toThrow()
    })

    it('should handle circular references in templates', () => {
      const CircularTemplate = defineComponent({
        template: '<div>{{ this }}</div>'
      })

      const wrapper = mount(CircularTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Vue handles circular references
      expect(wrapper.text()).toBe('[object Object]')
    })
  })

  describe('Integration with Element Plus', () => {
    it('should parse Element Plus components in templates', () => {
      const ElementPlus = require('element-plus').default
      app.use(ElementPlus)

      const ElementTemplate = defineComponent({
        template: `
          <div>
            <el-button type="primary">Primary Button</el-button>
            <el-input placeholder="Enter text" />
            <el-card header="Card Title">Card content</el-card>
          </div>
        `
      })

      const wrapper = mount(ElementTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.find('input').exists()).toBe(true)
      expect(wrapper.find('.el-card').exists()).toBe(true)
      expect(wrapper.text()).toContain('Primary Button')
      expect(wrapper.text()).toContain('Card content')
    })

    it('should handle Element Plus component props in templates', () => {
      const ElementPlus = require('element-plus').default
      app.use(ElementPlus)

      const ElementPropsTemplate = defineComponent({
        data() {
          return {
            isDisabled: true,
            inputValue: 'test',
            placeholder: 'Test placeholder'
          }
        },
        template: `
          <div>
            <el-button :disabled="isDisabled" type="success">Button</el-button>
            <el-input :model-value="inputValue" :placeholder="placeholder" />
          </div>
        `
      })

      const wrapper = mount(ElementPropsTemplate, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
      expect(wrapper.find('input').attributes('value')).toBe('test')
      expect(wrapper.find('input').attributes('placeholder')).toBe('Test placeholder')
    })
  })
})
