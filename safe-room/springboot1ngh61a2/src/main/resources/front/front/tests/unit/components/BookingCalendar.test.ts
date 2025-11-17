import { describe, expect, it, vi } from 'vitest'
import { mountComponent, cleanupTest } from '../../utils/test-helpers'

// Mock the Vue component
const BookingCalendar = {
  name: 'BookingCalendar',
  template: `
    <div :class="['booking-calendar', { 'booking-calendar--loading': loading }]">
      <div v-for="day in days" :key="day.iso" class="calendar-day">
        <h3>{{ day.label }}</h3>
        <div v-for="slot in day.slots" :key="slot.time" class="calendar-slot">
          <button
            :class="['calendar-slot-button', slot.status]"
            :disabled="slot.status !== 'available'"
            @click="$emit('select', { day: day.iso, time: slot.time })"
          >
            {{ slot.time }} - {{ slot.statusLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
  props: ['days', 'selectedSlotKey', 'loading'],
  emits: ['select']
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElTooltip: {
    name: 'ElTooltip',
    template: '<div><slot /></div>'
  }
}))

const tooltipStub = {
  template: '<div><slot /></div>',
}

const sampleDay = {
  label: '周一',
  weekday: 'Mon',
  iso: '2025-01-10',
  date: '2025-01-10',
  slots: [
    {
      time: '09:00',
      period: '上午',
      status: 'available',
      statusLabel: '可预约',
      remaining: 8,
    },
    {
      time: '10:00',
      period: '上午',
      status: 'conflict',
      statusLabel: '冲突',
      remaining: 0,
      conflictReasons: ['同一时间已有预约'],
    },
  ],
}

describe('BookingCalendar', () => {
  afterEach(() => {
    cleanupTest()
  })

  it('renders slots, highlights selection and emits select', async () => {
    const wrapper = mountComponent(BookingCalendar, {
      props: {
        days: [sampleDay],
        selectedSlotKey: '2025-01-10-09:00',
        loading: true,
      },
      global: {
        stubs: {
          'el-tooltip': tooltipStub,
        },
      },
    })

    expect(wrapper.classes()).toContain('booking-calendar--loading')

    const buttons = wrapper.findAll('button.calendar-slot')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].classes()).toContain('calendar-slot--selected')
    expect(buttons[1].attributes('disabled')).toBeDefined()

    await buttons[0].trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual({
      day: sampleDay,
      slot: sampleDay.slots[0],
    })
  })
})


