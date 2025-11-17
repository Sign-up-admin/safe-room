import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@vueup/vue-quill', () => ({
    QuillEditor: defineComponent({
      name: 'QuillEditor',
      props: ['content'],
      emits: ['update:content'],
      methods: {
        getQuill() {
          return {
            getSelection: () => ({ index: 0 }),
            insertEmbed: vi.fn(),
            setSelection: vi.fn(),
          }
        },
      },
      template: '<div class="quill-editor"></div>',
    }),
  }))

const elementStubs = {
  'el-upload': defineComponent({
    name: 'ElUpload',
    template: '<button><slot /></button>',
  }),
}

import Editor from '@/components/Editor.vue'

describe('Editor component', () => {
  it('computes upload URL from action prop', () => {
    const wrapper = mount(Editor, {
      props: {
        value: '<p>hello</p>',
        action: 'file/upload',
      },
      global: {
        stubs: elementStubs,
      },
    })

    expect(wrapper.vm.getActionUrl).toContain('/springboot1ngh61a2/file/upload')
  })

  it('emits updates when content changes', () => {
    const wrapper = mount(Editor, {
      props: {
        value: '<p>initial</p>',
        action: 'file/upload',
      },
      global: {
        stubs: elementStubs,
      },
    })

    wrapper.vm.onEditorChange('<p>updated</p>')

    expect(wrapper.emitted().input?.[0]).toEqual(['<p>updated</p>'])
    expect(wrapper.emitted()['update:value']?.[0]).toEqual(['<p>updated</p>'])
  })
})


