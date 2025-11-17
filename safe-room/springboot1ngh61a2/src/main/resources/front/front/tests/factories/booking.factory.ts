import { faker } from '@faker-js/faker'
import { createMockUser } from './user.factory'
import { createMockCourse } from './course.factory'

export interface Booking {
  id: number
  userId: number
  courseId: number
  bookingTime: string
  duration: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  createTime: string
  updateTime?: string
  user?: any
  course?: any
}

/**
 * Create a mock booking with default values
 */
export function createMockBooking(overrides: Partial<Booking> = {}): Booking {
  const bookingTime = faker.date.future()
  const duration = faker.helpers.arrayElement([30, 60, 90, 120])

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    userId: faker.number.int({ min: 1, max: 100 }),
    courseId: faker.number.int({ min: 1, max: 50 }),
    bookingTime: bookingTime.toISOString(),
    duration,
    status: faker.helpers.arrayElement(['pending', 'confirmed', 'cancelled', 'completed']),
    notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
    createTime: faker.date.past().toISOString(),
    updateTime: faker.date.recent().toISOString(),
    ...overrides
  }
}

/**
 * Create a mock confirmed booking
 */
export function createMockConfirmedBooking(overrides: Partial<Booking> = {}): Booking {
  return createMockBooking({
    status: 'confirmed',
    bookingTime: faker.date.soon().toISOString(),
    ...overrides
  })
}

/**
 * Create a mock pending booking
 */
export function createMockPendingBooking(overrides: Partial<Booking> = {}): Booking {
  return createMockBooking({
    status: 'pending',
    bookingTime: faker.date.future().toISOString(),
    ...overrides
  })
}

/**
 * Create a mock cancelled booking
 */
export function createMockCancelledBooking(overrides: Partial<Booking> = {}): Booking {
  return createMockBooking({
    status: 'cancelled',
    updateTime: faker.date.recent().toISOString(),
    ...overrides
  })
}

/**
 * Create a mock completed booking
 */
export function createMockCompletedBooking(overrides: Partial<Booking> = {}): Booking {
  return createMockBooking({
    status: 'completed',
    bookingTime: faker.date.past().toISOString(),
    updateTime: faker.date.recent().toISOString(),
    ...overrides
  })
}

/**
 * Create multiple mock bookings
 */
export function createMockBookings(count: number, overrides: Partial<Booking> = {}): Booking[] {
  return Array.from({ length: count }, () => createMockBooking(overrides))
}

/**
 * Create a mock booking with related user and course
 */
export function createMockBookingWithRelations(overrides: Partial<Booking & {
  user: any
  course: any
}> = {}) {
  const user = createMockUser()
  const course = createMockCourse()

  return {
    ...createMockBooking({
      userId: user.id,
      courseId: course.id,
      ...overrides
    }),
    user,
    course,
    ...overrides
  }
}

/**
 * Create mock bookings for a specific user
 */
export function createMockBookingsForUser(userId: number, count: number = 5): Booking[] {
  return createMockBookings(count, { userId })
}

/**
 * Create mock bookings for a specific course
 */
export function createMockBookingsForCourse(courseId: number, count: number = 5): Booking[] {
  return createMockBookings(count, { courseId })
}

/**
 * Create mock booking statistics
 */
export function createMockBookingStats(overrides: Partial<{
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  cancelledBookings: number
  completedBookings: number
  todayBookings: number
  thisWeekBookings: number
  thisMonthBookings: number
}> = {}) {
  const totalBookings = faker.number.int({ min: 100, max: 1000 })
  const confirmedBookings = Math.floor(totalBookings * 0.7)
  const pendingBookings = Math.floor(totalBookings * 0.2)
  const cancelledBookings = Math.floor(totalBookings * 0.05)
  const completedBookings = Math.floor(totalBookings * 0.65)

  return {
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    completedBookings,
    todayBookings: faker.number.int({ min: 0, max: 20 }),
    thisWeekBookings: faker.number.int({ min: 10, max: 100 }),
    thisMonthBookings: faker.number.int({ min: 50, max: 300 }),
    ...overrides
  }
}

/**
 * Create mock booking conflict data
 */
export function createMockBookingConflict(overrides: Partial<{
  bookingId: number
  conflictingBookingId: number
  conflictType: 'time_overlap' | 'resource_conflict' | 'instructor_conflict'
  message: string
}> = {}) {
  return {
    bookingId: faker.number.int({ min: 1, max: 1000 }),
    conflictingBookingId: faker.number.int({ min: 1, max: 1000 }),
    conflictType: faker.helpers.arrayElement(['time_overlap', 'resource_conflict', 'instructor_conflict']),
    message: faker.lorem.sentence(),
    ...overrides
  }
}

/**
 * Create mock booking recommendation
 */
export function createMockBookingRecommendation(overrides: Partial<{
  time: string
  period: string
  confidence: number
  score: number
  isBest: boolean
  reason: string
}> = {}) {
  const hours = faker.number.int({ min: 6, max: 22 })
  const time = `${hours.toString().padStart(2, '0')}:00`

  return {
    time,
    period: hours < 12 ? '上午' : hours < 18 ? '下午' : '晚上',
    confidence: faker.number.float({ min: 0.1, max: 1.0 }),
    score: faker.number.int({ min: 1, max: 10 }),
    isBest: faker.datatype.boolean(),
    reason: faker.lorem.sentence(),
    ...overrides
  }
}
