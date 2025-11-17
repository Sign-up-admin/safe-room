import { defineStore } from 'pinia'

export interface BookingSlotDraft {
  iso?: string
  date?: string
  time?: string
  label?: string
  period?: string
}

interface BookingState {
  selectedCourseId?: number
  slot?: BookingSlotDraft
  contact: string
  phone: string
  remark: string
}

export const useBookingStore = defineStore('booking', {
  state: (): BookingState => ({
    selectedCourseId: undefined,
    slot: undefined,
    contact: '',
    phone: '',
    remark: '',
  }),
  actions: {
    setCourse(id?: number) {
      this.selectedCourseId = id
    },
    setSlot(slot?: BookingSlotDraft) {
      this.slot = slot
    },
    updateContact(payload: Partial<Pick<BookingState, 'contact' | 'phone' | 'remark'>>) {
      Object.assign(this, payload)
    },
    reset() {
      this.selectedCourseId = undefined
      this.slot = undefined
      this.contact = ''
      this.phone = ''
      this.remark = ''
    },
  },
})

