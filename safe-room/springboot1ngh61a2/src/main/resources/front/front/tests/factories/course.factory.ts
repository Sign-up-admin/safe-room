import { faker } from '@faker-js/faker'
import type { validateApiResponse, validatePageResult } from '../../../../../../../../tests/shared/types/api-response.types'

export interface Course {
  id: number
  name: string
  description: string
  category: string
  instructor: string
  instructorId: number
  price: number
  originalPrice?: number
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  image: string
  videoUrl?: string
  capacity: number
  enrolledCount: number
  rating: number
  reviewCount: number
  tags: string[]
  schedule: CourseSchedule[]
  features: string[]
  status: 'active' | 'inactive' | 'draft'
  createTime: string
  updateTime?: string
}

export interface CourseSchedule {
  id: number
  courseId: number
  dayOfWeek: number
  startTime: string
  endTime: string
  maxCapacity: number
  currentCapacity: number
}

/**
 * Create a mock course with default values
 */
export function createMockCourse(overrides: Partial<Course> = {}): Course {
  const difficulty = faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced'])
  const category = faker.helpers.arrayElement([
    'fitness', 'yoga', 'pilates', 'cardio', 'strength', 'dance', 'boxing', 'swimming'
  ])

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.lorem.words({ min: 2, max: 5 }),
    description: faker.lorem.paragraph(),
    category,
    instructor: faker.person.fullName(),
    instructorId: faker.number.int({ min: 1, max: 100 }),
    price: faker.number.int({ min: 50, max: 500 }),
    originalPrice: faker.helpers.maybe(() => faker.number.int({ min: 100, max: 600 }), { probability: 0.3 }),
    duration: faker.helpers.arrayElement([30, 45, 60, 90, 120]),
    difficulty,
    image: faker.image.url(),
    videoUrl: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.5 }),
    capacity: faker.number.int({ min: 10, max: 50 }),
    enrolledCount: faker.number.int({ min: 0, max: 45 }),
    rating: faker.number.float({ min: 3.0, max: 5.0, precision: 0.1 }),
    reviewCount: faker.number.int({ min: 0, max: 200 }),
    tags: faker.helpers.arrayElements([
      '健身', '减肥', '塑形', '增肌', '瑜伽', '普拉提', '有氧', '力量', '舞蹈', '拳击'
    ], { min: 1, max: 3 }),
    schedule: createMockCourseSchedule(3),
    features: faker.helpers.arrayElements([
      '专业教练指导', '小班教学', '免费试听', '设备齐全', '舒适环境', '灵活时间', '进度跟踪', '营养建议'
    ], { min: 2, max: 5 }),
    status: faker.helpers.arrayElement(['active', 'inactive', 'draft']),
    createTime: faker.date.past().toISOString(),
    updateTime: faker.date.recent().toISOString(),
    ...overrides
  }
}

/**
 * Create mock course schedule
 */
export function createMockCourseSchedule(count = 3, courseId?: number): CourseSchedule[] {
  return Array.from({ length: count }, () => ({
    id: faker.number.int({ min: 1, max: 1000 }),
    courseId: courseId || faker.number.int({ min: 1, max: 1000 }),
    dayOfWeek: faker.number.int({ min: 1, max: 7 }),
    startTime: faker.helpers.arrayElement(['09:00', '10:00', '14:00', '15:00', '18:00', '19:00', '20:00']),
    endTime: '', // Will be calculated based on startTime and duration
    maxCapacity: faker.number.int({ min: 10, max: 30 }),
    currentCapacity: faker.number.int({ min: 0, max: 25 })
  })).map(schedule => ({
    ...schedule,
    endTime: calculateEndTime(schedule.startTime, 60) // Assume 60 minutes duration
  }))
}

/**
 * Calculate end time based on start time and duration
 */
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const endHours = Math.floor(totalMinutes / 60)
  const endMinutes = totalMinutes % 60
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
}

/**
 * Create a mock fitness course
 */
export function createMockFitnessCourse(overrides: Partial<Course> = {}): Course {
  return createMockCourse({
    category: 'fitness',
    tags: ['健身', '力量', '增肌'],
    features: ['专业教练', '力量训练设备', '进度跟踪'],
    ...overrides
  })
}

/**
 * Create a mock yoga course
 */
export function createMockYogaCourse(overrides: Partial<Course> = {}): Course {
  return createMockCourse({
    category: 'yoga',
    tags: ['瑜伽', '冥想', '放松'],
    features: ['专业瑜伽教练', '冥想指导', '身心平衡'],
    ...overrides
  })
}

/**
 * Create a mock cardio course
 */
export function createMockCardioCourse(overrides: Partial<Course> = {}): Course {
  return createMockCourse({
    category: 'cardio',
    tags: ['有氧', '减肥', '心肺'],
    features: ['心肺训练', '燃脂效果', '体能提升'],
    ...overrides
  })
}

/**
 * Create multiple mock courses
 */
export function createMockCourses(count: number, overrides: Partial<Course> = {}): Course[] {
  return Array.from({ length: count }, () => createMockCourse(overrides))
}

/**
 * Create mock courses by category
 */
export function createMockCoursesByCategory(category: string, count = 5): Course[] {
  return createMockCourses(count, { category })
}

/**
 * Create a mock course with full details
 */
export function createMockCourseWithDetails(overrides: Partial<Course & {
  instructor: any
  reviews: any[]
  enrolledUsers: any[]
}> = {}) {
  const course = createMockCourse(overrides)

  return {
    ...course,
    instructor: {
      id: course.instructorId,
      name: course.instructor,
      bio: faker.lorem.paragraph(),
      avatar: faker.image.avatar(),
      rating: faker.number.float({ min: 4.0, max: 5.0, precision: 0.1 }),
      experience: faker.number.int({ min: 1, max: 10 })
    },
    reviews: Array.from({ length: course.reviewCount }, () => ({
      id: faker.number.int({ min: 1, max: 1000 }),
      userId: faker.number.int({ min: 1, max: 100 }),
      courseId: course.id,
      rating: faker.number.int({ min: 3, max: 5 }),
      comment: faker.lorem.sentence(),
      createTime: faker.date.past().toISOString()
    })),
    enrolledUsers: Array.from({ length: course.enrolledCount }, () => ({
      id: faker.number.int({ min: 1, max: 100 }),
      name: faker.person.fullName(),
      avatar: faker.image.avatar()
    })),
    ...overrides
  }
}

/**
 * Create mock course statistics
 */
export function createMockCourseStats(overrides: Partial<{
  totalCourses: number
  activeCourses: number
  totalEnrollments: number
  averageRating: number
  popularCategories: Array<{ category: string; count: number }>
  revenue: number
}> = {}) {
  return {
    totalCourses: faker.number.int({ min: 50, max: 200 }),
    activeCourses: faker.number.int({ min: 40, max: 180 }),
    totalEnrollments: faker.number.int({ min: 1000, max: 10000 }),
    averageRating: faker.number.float({ min: 4.0, max: 4.8, precision: 0.1 }),
    popularCategories: [
      { category: 'fitness', count: faker.number.int({ min: 20, max: 50 }) },
      { category: 'yoga', count: faker.number.int({ min: 15, max: 40 }) },
      { category: 'cardio', count: faker.number.int({ min: 10, max: 35 }) },
      { category: 'strength', count: faker.number.int({ min: 8, max: 30 }) }
    ],
    revenue: faker.number.int({ min: 50000, max: 500000 }),
    ...overrides
  }
}

/**
 * Create mock course category
 */
export function createMockCourseCategory(overrides: Partial<{
  id: number
  name: string
  description: string
  icon: string
  courseCount: number
  status: number
}> = {}) {
  return {
    id: faker.number.int({ min: 1, max: 100 }),
    name: faker.helpers.arrayElement(['健身', '瑜伽', '有氧', '力量', '舞蹈', '游泳', '拳击', '普拉提']),
    description: faker.lorem.sentence(),
    icon: faker.helpers.arrayElement(['fitness', 'yoga', 'cardio', 'strength', 'dance', 'swim', 'boxing', 'pilates']),
    courseCount: faker.number.int({ min: 5, max: 50 }),
    status: 1,
    ...overrides
  }
}

// ========== 数据一致性检查函数 ==========

/**
 * 验证Course对象是否符合接口规范
 */
export function validateCourseData(course: any): course is Course {
  return (
    course &&
    typeof course === 'object' &&
    typeof course.id === 'number' &&
    typeof course.name === 'string' &&
    typeof course.description === 'string' &&
    typeof course.category === 'string' &&
    typeof course.instructor === 'string' &&
    typeof course.instructorId === 'number' &&
    typeof course.price === 'number' &&
    typeof course.duration === 'number' &&
    typeof course.difficulty === 'string' &&
    Array.isArray(course.tags) &&
    Array.isArray(course.schedule) &&
    Array.isArray(course.features) &&
    typeof course.status === 'string' &&
    typeof course.createTime === 'string'
  )
}

/**
 * 验证Course数组数据一致性
 */
export function validateCourseListConsistency(courses: Course[]): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  if (!Array.isArray(courses)) {
    errors.push('Input is not an array')
    return { isValid: false, errors, warnings }
  }

  courses.forEach((course, index) => {
    if (!validateCourseData(course)) {
      errors.push(`Course at index ${index} has invalid structure`)
    }

    // 检查ID唯一性
    const duplicateIds = courses.filter((c, i) => c.id === course.id && i !== index)
    if (duplicateIds.length > 0) {
      warnings.push(`Duplicate course ID ${course.id} found`)
    }

    // 检查价格合理性
    if (course.price < 0) {
      warnings.push(`Course ${course.name} has negative price`)
    }

    // 检查容量合理性
    if (course.capacity < 0) {
      warnings.push(`Course ${course.name} has negative capacity`)
    }

    // 检查评分范围
    if (course.rating < 0 || course.rating > 5) {
      warnings.push(`Course ${course.name} has invalid rating ${course.rating}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 验证课程统计数据
 */
export function validateCourseStats(stats: any): boolean {
  return (
    stats &&
    typeof stats === 'object' &&
    typeof stats.totalCourses === 'number' &&
    typeof stats.activeCourses === 'number' &&
    typeof stats.totalEnrollments === 'number' &&
    typeof stats.averageRating === 'number' &&
    Array.isArray(stats.popularCategories) &&
    typeof stats.revenue === 'number' &&
    stats.totalCourses >= 0 &&
    stats.activeCourses >= 0 &&
    stats.totalEnrollments >= 0 &&
    stats.revenue >= 0
  )
}

/**
 * 创建验证后的课程数据（带类型检查）
 */
export function createValidatedCourse(overrides: Partial<Course> = {}): Course {
  const course = createMockCourse(overrides)

  if (!validateCourseData(course)) {
    throw new Error('Generated course data does not match Course interface')
  }

  return course
}

/**
 * 创建验证后的课程列表
 */
export function createValidatedCourses(count: number, overrides: Partial<Course> = {}): Course[] {
  const courses = createMockCourses(count, overrides)
  const validation = validateCourseListConsistency(courses)

  if (!validation.isValid) {
    console.warn('Course list validation warnings:', validation.warnings)
    throw new Error(`Course list validation failed: ${validation.errors.join(', ')}`)
  }

  return courses
}
