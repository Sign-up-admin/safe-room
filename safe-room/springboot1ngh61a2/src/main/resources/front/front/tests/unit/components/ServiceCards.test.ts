import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ServiceCards from '@/components/home/ServiceCards.vue'

describe('ServiceCards', () => {
  it('renders service cards and emits navigate event', async () => {
    const wrapper = mount(ServiceCards)

    const cards = wrapper.findAll('.services__card')
    expect(cards.length).toBeGreaterThan(0)

    await cards[0].find('button').trigger('click')
    expect(wrapper.emitted('navigate')?.[0]?.[0]).toMatchObject({ title: expect.any(String) })
  })
})


