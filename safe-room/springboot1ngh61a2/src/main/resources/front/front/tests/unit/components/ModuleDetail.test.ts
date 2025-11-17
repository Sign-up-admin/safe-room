import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import ModuleDetail from '@/components/modules/ModuleDetail.vue'

const detailState = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const vue = require('vue') as typeof import('vue')
  return {
    record: vue.ref<any>(null),
    loading: vue.ref(false),
    fetchDetail: vi.fn(),
  }
})

vi.mock('@/composables/useModuleCrud', () => ({
  useModuleDetail: () => detailState,
}))

vi.mock('@/config/modules', () => ({
  moduleConfigs: {
    course: {
      name: '课程',
      fields: [
        { prop: 'title', label: '标题', type: 'text' },
        { prop: 'start', label: '开课时间', type: 'date' },
        { prop: 'price', label: '价格', type: 'number' },
        { prop: 'cover', label: '封面', type: 'image' },
      ],
    },
  },
}))

const elementStubs = {
  'el-card': {
    template: '<div class="el-card"><slot name="header" /><slot /></div>',
  },
  ElCard: {
    template: '<div class="el-card"><slot name="header" /><slot /></div>',
  },
  'el-button': {
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  },
  ElButton: {
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  },
  'el-descriptions': {
    template: '<dl><slot /></dl>',
  },
  ElDescriptions: {
    template: '<dl><slot /></dl>',
  },
  'el-descriptions-item': {
    template: '<div class="desc-item"><slot /></div>',
  },
  ElDescriptionsItem: {
    template: '<div class="desc-item"><slot /></div>',
  },
  'el-image': {
    props: ['src'],
    template: '<img :src="src" alt="img" />',
  },
  ElImage: {
    props: ['src'],
    template: '<img :src="src" alt="img" />',
  },
  'el-empty': {
    template: '<p class="empty">empty</p>',
  },
  ElEmpty: {
    template: '<p class="empty">empty</p>',
  },
}

describe('ModuleDetail', () => {
  beforeEach(() => {
    detailState.record.value = null
    detailState.loading.value = false
    detailState.fetchDetail.mockClear()
  })

  it('fetches detail when id changes', () => {
    mount(ModuleDetail, {
      props: {
        moduleKey: 'course',
        id: 10,
      },
      global: {
        stubs: elementStubs,
      },
    })

    expect(detailState.fetchDetail).toHaveBeenCalledWith(10)
  })

  it('renders prefetched data with formatted fields', async () => {
    const prefetched = {
      title: 'AI 私教',
      start: '2025-01-11T00:00:00.000Z',
      price: 199,
      cover: 'https://cdn.example.com/image.png',
    }

    const wrapper = mount(ModuleDetail, {
      props: {
        moduleKey: 'course',
        prefetched,
      },
      global: {
        stubs: elementStubs,
      },
    })

    await nextTick()

    expect(detailState.fetchDetail).not.toHaveBeenCalled()
    expect(detailState.record.value).toEqual(prefetched)
  })
})


