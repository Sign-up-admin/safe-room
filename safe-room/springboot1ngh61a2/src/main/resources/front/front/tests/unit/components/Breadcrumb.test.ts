import { mount } from '@vue/test-utils'
import Breadcrumb from '@/components/Breadcrumb.vue'

describe('Breadcrumb', () => {
  it('renders provided breadcrumb items', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        breadcrumbItem: [{ name: '首页' }, { name: '详情' }],
        separator: '>',
      },
      global: {
        stubs: {
          'el-breadcrumb': { template: '<nav><slot /></nav>' },
          'el-breadcrumb-item': { template: '<span><slot /></span>' },
        },
      },
    })

    expect(wrapper.text()).toContain('首页')
    expect(wrapper.text()).toContain('详情')
  })
})


