import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TechStepper from '@/components/common/TechStepper.vue'

describe('TechStepper', () => {
  const steps = [
    { title: '步骤1', description: '描述1' },
    { title: '步骤2', description: '描述2' },
    { title: '步骤3' },
  ]

  it('renders all steps with correct titles', () => {
    const wrapper = mount(TechStepper, {
      props: {
        steps,
        currentStep: 0,
      },
    })

    expect(wrapper.text()).toContain('步骤1')
    expect(wrapper.text()).toContain('步骤2')
    expect(wrapper.text()).toContain('步骤3')
  })

  it('marks current step as active', () => {
    const wrapper = mount(TechStepper, {
      props: {
        steps,
        currentStep: 1,
      },
    })

    const items = wrapper.findAll('.tech-stepper__item')
    expect(items[1].classes()).toContain('tech-stepper__item--active')
  })

  it('marks completed steps correctly', () => {
    const wrapper = mount(TechStepper, {
      props: {
        steps,
        currentStep: 2,
      },
    })

    const items = wrapper.findAll('.tech-stepper__item')
    expect(items[0].classes()).toContain('tech-stepper__item--completed')
    expect(items[1].classes()).toContain('tech-stepper__item--completed')
  })

  it('marks future steps as disabled', () => {
    const wrapper = mount(TechStepper, {
      props: {
        steps,
        currentStep: 0,
      },
    })

    const items = wrapper.findAll('.tech-stepper__item')
    expect(items[1].classes()).toContain('tech-stepper__item--disabled')
    expect(items[2].classes()).toContain('tech-stepper__item--disabled')
  })

  it('renders in vertical mode', () => {
    const wrapper = mount(TechStepper, {
      props: {
        steps,
        vertical: true,
      },
    })

    expect(wrapper.classes()).toContain('tech-stepper--vertical')
  })

  it('shows checkmark for completed steps', () => {
    const wrapper = mount(TechStepper, {
      props: {
        steps,
        currentStep: 1,
      },
    })

    const checkmarks = wrapper.findAll('.tech-stepper__check')
    expect(checkmarks.length).toBe(1) // Only step 0 is completed
  })

  it('shows step numbers for non-completed steps', () => {
    const wrapper = mount(TechStepper, {
      props: {
        steps,
        currentStep: 0,
      },
    })

    const numbers = wrapper.findAll('.tech-stepper__number')
    expect(numbers.length).toBe(3) // All steps show numbers
  })
})

