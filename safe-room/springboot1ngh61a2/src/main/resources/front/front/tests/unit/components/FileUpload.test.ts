import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, beforeEach } from 'vitest'
import FileUpload from '@/components/FileUpload.vue'

const elementStubs = {
  'el-upload': defineComponent({
    name: 'ElUpload',
    template: '<div><slot /></div>',
  }),
  'el-dialog': defineComponent({
    name: 'ElDialog',
    props: ['visible'],
    template: '<div><slot /></div>',
  }),
}

describe('FileUpload component', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('frontToken', 'token-123')
  })

  it('computes upload url and normalizes initial file list', async () => {
    const wrapper = mount(FileUpload, {
      props: {
        action: 'file/upload',
        fileUrls: 'upload/a.png,upload/b.png',
      },
      global: {
        stubs: elementStubs,
      },
    })

    await nextTick()

    expect(wrapper.vm.getActionUrl).toContain('/springboot1ngh61a2/file/upload')
    expect(wrapper.vm.fileList.length).toBe(2)
    expect(wrapper.vm.fileList[0].url).toContain('?token=token-123')
    expect(wrapper.vm.fileUrlList[0]).toContain('http://localhost:8080/springboot1ngh61a2/upload/a.png')
  })
})


