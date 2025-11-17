import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CourseCard from '@/components/courses/CourseCard.vue'

const TechCardStub = {
  template: '<div class="tech-card" v-bind="$attrs"><slot /></div>',
  inheritAttrs: false,
}

const TechButtonStub = {
  template: '<button class="tech-button tech-btn" @click="$emit(\'click\')"><slot /></button>',
}

describe('CourseCard', () => {
  it('formats course information and emits actions', async () => {
    const course = {
      id: 3,
      kechengmingcheng: 'AI 燃脂营',
      kechengjianjie: '智能训练',
      kechengleixing: '燃脂',
      shangkeshijian: '2025-01-12T09:00:00.000Z',
      shangkedidian: '旗舰馆',
      jiaolianxingming: 'Coach Li',
      clicknum: 30,
      kechengjiage: 299,
      tupian: '/upload/course.jpg',
    }

    const wrapper = mount(CourseCard, {
      props: {
        course,
        intensity: '爆燃',
      },
      global: {
        stubs: {
          TechCard: TechCardStub,
        },
        components: {
          TechButton: TechButtonStub,
        },
      },
    })

    expect(wrapper.find('.course-card__badge').text()).toBe('爆燃')
    expect(wrapper.text()).toContain('¥299.00')
    expect(wrapper.text()).toContain('2025-01-12')

    const mediaStyle = (wrapper.vm as any).mediaStyle
    expect(mediaStyle?.backgroundImage ?? '').toContain('upload/course.jpg')

    expect(wrapper.text()).toContain('预约体验')
  })
})


