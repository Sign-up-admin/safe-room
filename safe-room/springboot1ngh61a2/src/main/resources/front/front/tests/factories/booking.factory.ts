import { faker } from '@faker-js/faker'
import { createMockUser } from './user.factory'
import { createMockCourse } from './course.factory'

export interface User {
  id: number
  username: string
  email: string
  phone?: string
  avatar?: string
}

export interface Course {
  id: number
  name: string
  description: string
  duration: number
  price: number
  category: string
}

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
  user?: User
  course?: Course
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
export function createMockBookingsForUser(userId: number, count = 5): Booking[] {
  return createMockBookings(count, { userId })
}

/**
 * Create mock bookings for a specific course
 */
export function createMockBookingsForCourse(courseId: number, count = 5): Booking[] {
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

// ========== 数据一致性检查函数 ==========

/**
 * 验证Booking对象是否符合接口规范
 */
export function validateBookingData(booking: any): booking is Booking {
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']

  return (
    booking &&
    typeof booking === 'object' &&
    typeof booking.id === 'number' &&
    typeof booking.userId === 'number' &&
    typeof booking.courseId === 'number' &&
    typeof booking.bookingTime === 'string' &&
    typeof booking.duration === 'number' &&
    typeof booking.status === 'string' &&
    typeof booking.createTime === 'string' &&
    validStatuses.includes(booking.status) &&
    booking.duration > 0 &&
    booking.userId > 0 &&
    booking.courseId > 0
  )
}

/**
 * 验证Booking数组数据一致性
 */
export function validateBookingListConsistency(bookings: Booking[]): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  if (!Array.isArray(bookings)) {
    errors.push('Input is not an array')
    return { isValid: false, errors, warnings }
  }

  const bookingIds = new Set<number>()
  const userCoursePairs = new Set<string>()

  bookings.forEach((booking, index) => {
    if (!validateBookingData(booking)) {
      errors.push(`Booking at index ${index} has invalid structure`)
    }

    // 检查ID唯一性
    if (bookingIds.has(booking.id)) {
      warnings.push(`Duplicate booking ID ${booking.id} found`)
    }
    bookingIds.add(booking.id)

    // 检查用户-课程对的重复预约（同一用户不能重复预约同一课程）
    const pairKey = `${booking.userId}-${booking.courseId}`
    if (userCoursePairs.has(pairKey)) {
      warnings.push(`Duplicate booking for user ${booking.userId} and course ${booking.courseId}`)
    }
    userCoursePairs.add(pairKey)

    // 检查预约时间合理性
    const bookingDate = new Date(booking.bookingTime)
    const now = new Date()
    if (bookingDate < now && booking.status === 'pending') {
      warnings.push(`Booking ${booking.id} has past booking time but pending status`)
    }

    // 检查时长合理性
    if (booking.duration <= 0 || booking.duration > 480) { // 最长8小时
      warnings.push(`Booking ${booking.id} has invalid duration: ${booking.duration} minutes`)
    }

    // 检查状态转换合理性
    if (booking.updateTime) {
      const createDate = new Date(booking.createTime)
      const updateDate = new Date(booking.updateTime)
      if (updateDate < createDate) {
        warnings.push(`Booking ${booking.id} has update time before create time`)
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 验证预约统计数据
 */
export function validateBookingStats(stats: any): boolean {
  const requiredFields = [
    'totalBookings', 'confirmedBookings', 'pendingBookings',
    'cancelledBookings', 'completedBookings', 'todayBookings',
    'thisWeekBookings', 'thisMonthBookings'
  ]

  return (
    stats &&
    typeof stats === 'object' &&
    requiredFields.every(field => typeof stats[field] === 'number' && stats[field] >= 0) &&
    stats.confirmedBookings + stats.pendingBookings + stats.cancelledBookings + stats.completedBookings <= stats.totalBookings
  )
}

/**
 * 验证预约冲突数据
 */
export function validateBookingConflict(conflict: any): boolean {
  const validTypes = ['time_overlap', 'resource_conflict', 'instructor_conflict']

  return (
    conflict &&
    typeof conflict === 'object' &&
    typeof conflict.bookingId === 'number' &&
    typeof conflict.conflictingBookingId === 'number' &&
    typeof conflict.conflictType === 'string' &&
    typeof conflict.message === 'string' &&
    validTypes.includes(conflict.conflictType)
  )
}

/**
 * 创建验证后的预约数据（带类型检查）
 */
export function createValidatedBooking(overrides: Partial<Booking> = {}): Booking {
  const booking = createMockBooking(overrides)

  if (!validateBookingData(booking)) {
    throw new Error('Generated booking data does not match Booking interface')
  }

  return booking
}

/**
 * 创建验证后的预约列表
 */
export function createValidatedBookings(count: number, overrides: Partial<Booking> = {}): Booking[] {
  const bookings = createMockBookings(count, overrides)
  const validation = validateBookingListConsistency(bookings)

  if (!validation.isValid) {
    console.warn('Booking list validation warnings:', validation.warnings)
    throw new Error(`Booking list validation failed: ${validation.errors.join(', ')}`)
  }

  return bookings
}
