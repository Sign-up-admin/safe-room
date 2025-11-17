import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElTable, ElTableColumn } from 'element-plus'
import TimeableComponent from '@/components/timeable.vue'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElTable: {
    name: 'ElTable',
    template: '<table><slot /></table>',
    props: ['data', 'spanMethod', 'border', 'headerCellStyle', 'cellStyle'],
    emits: []
  },
  ElTableColumn: {
    name: 'ElTableColumn',
    template: '<col><slot /></col>',
    props: ['prop', 'label', 'width', 'align'],
    emits: []
  }
}))

describe('timeable.vue (Timetable)', () => {
  let wrapper: any

  const mockEvents = [
    {
      id: 1,
      title: '数学课',
      content: '高等数学',
      week: 1, // Monday
      start: 1,
      end: 1,
      order: 1
    },
    {
      id: 2,
      title: '英语课',
      content: '大学英语',
      week: 3, // Wednesday
      start: 2,
      end: 2,
      order: 2
    }
  ]

  const mockTime = [
    { sjd: '08:00-09:30', jc: '1<br><div style="font-size: 12px">(08:00-09:30)</div>', jc1: 1, sectionnum: 1, starttime: '08:00', endtime: '09:30' },
    { sjd: '09:45-11:15', jc: '2<br><div style="font-size: 12px">(09:45-11:15)</div>', jc1: 2, sectionnum: 2, starttime: '09:45', endtime: '11:15' },
    { sjd: '14:00-15:30', jc: '3<br><div style="font-size: 12px">(14:00-15:30)</div>', jc1: 3, sectionnum: 3, starttime: '14:00', endtime: '15:30' },
    { sjd: '15:45-17:15', jc: '4<br><div style="font-size: 12px">(15:45-17:15)</div>', jc1: 4, sectionnum: 4, starttime: '15:45', endtime: '17:15' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    wrapper = mount(TimeableComponent, {
      props: {
        events: mockEvents,
        time: mockTime,
        morningLength: 2,
        afternoonLength: 2,
        length: 4
      },
      global: {
        stubs: {
          'el-table': true,
          'el-table-column': true
        }
      }
    })
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.panel').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ElTable' }).exists()).toBe(true)
  })

  it('has correct props', () => {
    const vm = wrapper.vm
    expect(vm.events).toEqual(mockEvents)
    expect(vm.time).toEqual(mockTime)
    expect(vm.morningLength).toBe(2)
    expect(vm.afternoonLength).toBe(2)
    expect(vm.length).toBe(4)
  })

  it('initializes with correct data structure', () => {
    const vm = wrapper.vm
    expect(vm.timetable).toBeInstanceOf(Array)
    expect(vm.weeks).toEqual(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
    expect(vm.allPalette).toBeInstanceOf(Array)
    expect(vm.allPalette.length).toBeGreaterThan(0)
  })

  it('creates timetable structure on mount', () => {
    const vm = wrapper.vm
    // Should have created timetable data based on time prop
    expect(vm.timetable.length).toBe(mockTime.length)
  })

  it('merges event data into timetable', () => {
    const vm = wrapper.vm

    // Check if events are properly merged
    const mondaySlot = vm.timetable.find((slot: any) => slot.jc1 === 1)
    const wednesdaySlot = vm.timetable.find((slot: any) => slot.jc1 === 2)

    if (mondaySlot && wednesdaySlot) {
      expect(mondaySlot.mon.title).toBe('数学课')
      expect(mondaySlot.mon.content).toBe('高等数学')
      expect(wednesdaySlot.wed.title).toBe('英语课')
      expect(wednesdaySlot.wed.content).toBe('大学英语')
    }
  })

  it('emits timetableClick event when cell is clicked', async () => {
    const vm = wrapper.vm

    // Mock timetableClick method
    const emitSpy = vi.spyOn(vm, '$emit')

    // Call timetableClick method directly
    vm.timetableClick(123)

    expect(emitSpy).toHaveBeenCalledWith('timetableClick', 123)
  })

  it('applies correct cell styles', () => {
    const vm = wrapper.vm

    // Mock row and column data
    const mockRow = {
      mon: { title: 'Test Course', content: 'Test Content' },
      tue: { title: undefined }
    }

    const mockColumn = { property: 'mon' }

    const style = vm.tableCellStyle({ row: mockRow, column: mockColumn })

    // Should return background color for cells with content
    expect(style).toContain('background-color')
    expect(style).toContain('color: #fff')
  })

  it('does not apply styles to time/jc columns', () => {
    const vm = wrapper.vm

    const mockRow = { jc: '1<br><div style="font-size: 12px">(08:00-09:30)</div>', sjd: '08:00-09:30', jc1: 1 }
    const mockColumn = { property: 'jc' }

    const style = vm.tableCellStyle({ row: mockRow, column: mockColumn })

    // Should return undefined for time/jc columns
    expect(style).toBeUndefined()
  })

  it('generates random integers correctly', () => {
    const vm = wrapper.vm

    // Test multiple calls to ensure they return valid integers
    for (let i = 0; i < 10; i++) {
      const result = vm.getRandomInt(0, 10)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(10)
      expect(Number.isInteger(result)).toBe(true)
    }
  })

  it('watches events prop changes', async () => {
    const vm = wrapper.vm
    const mergeDataSpy = vi.spyOn(vm, 'mergeData')

    // Update events prop
    await wrapper.setProps({
      events: [...mockEvents, {
        id: 3,
        title: '物理课',
        content: '大学物理',
        week: 5, // Friday
        start: 3,
        end: 3,
        order: 3
      }]
    })

    expect(mergeDataSpy).toHaveBeenCalled()
  })

  it('watches time prop changes', async () => {
    const vm = wrapper.vm
    const makeTimetableSpy = vi.spyOn(vm, 'makeTimetable')

    // Update time prop
    await wrapper.setProps({
      time: [...mockTime, { sjd: '16:00-17:30', jc: '5<br><div style="font-size: 12px">(16:00-17:30)</div>', jc1: 5, sectionnum: 5, starttime: '16:00', endtime: '17:30' }]
    })

    expect(makeTimetableSpy).toHaveBeenCalled()
  })

  it('renders all weekday columns', () => {
    const columns = wrapper.findAllComponents({ name: 'ElTableColumn' })

    // Should have columns for time period, class period, and 7 days
    expect(columns.length).toBeGreaterThanOrEqual(9)

    const weekdayLabels = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
    weekdayLabels.forEach(label => {
      const column = columns.find(col => col.props('label') === label)
      expect(column).toBeDefined()
    })
  })

  it('handles object span method', () => {
    const vm = wrapper.vm

    // objectSpanMethod should be defined
    expect(typeof vm.objectSpanMethod).toBe('function')

    // Test with sample parameters
    const result = vm.objectSpanMethod({ row: 0, column: 0 })
    // Should return an object with rowspan and colspan
    expect(typeof result).toBe('object')
  })

  it('handles empty events array', () => {
    const wrapperEmpty = mount(TimeableComponent, {
      props: {
        events: [],
        time: mockTime
      },
      global: {
        stubs: {
          'el-table': true,
          'el-table-column': true
        }
      }
    })

    const vm = wrapperEmpty.vm
    expect(vm.events).toEqual([])
    // Should still create timetable structure
    expect(vm.timetable.length).toBe(mockTime.length)
  })

  it('handles empty time array', () => {
    const wrapperEmpty = mount(TimeableComponent, {
      props: {
        events: mockEvents,
        time: []
      },
      global: {
        stubs: {
          'el-table': true,
          'el-table-column': true
        }
      }
    })

    const vm = wrapperEmpty.vm
    expect(vm.time).toEqual([])
    expect(vm.timetable).toEqual([])
  })

  it('applies table styling props', () => {
    const table = wrapper.findComponent({ name: 'ElTable' })

    expect(table.props('border')).toBe(true)
    expect(typeof table.props('headerCellStyle')).toBe('object')
    expect(typeof table.props('cellStyle')).toBe('function')
  })

  it('handles cell click events', () => {
    const vm = wrapper.vm
    const emitSpy = vi.spyOn(vm, '$emit')

    // Simulate clicking on a timetable cell
    vm.timetableClick('test-id')

    expect(emitSpy).toHaveBeenCalledWith('timetableClick', 'test-id')
  })
})
