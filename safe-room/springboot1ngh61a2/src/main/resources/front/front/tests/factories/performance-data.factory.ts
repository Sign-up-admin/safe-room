import { faker } from '@faker-js/faker'

/**
 * Performance Data Factory - 性能测试数据工厂
 * 生成大量测试数据用于性能测试场景
 */

export interface PerformanceTestData {
  users: any[]
  courses: any[]
  bookings: any[]
  coaches: any[]
  memberships: any[]
  news: any[]
  equipment: any[]
  metadata: {
    generatedAt: Date
    totalRecords: number
    dataSize: string
  }
}

/**
 * 生成大规模用户数据
 */
export function generatePerformanceUsers(count: number): any[] {
  console.log(`Generating ${count} performance test users...`)

  const users = []
  for (let i = 0; i < count; i++) {
    users.push({
      id: i + 1,
      yonghuzhanghao: `perf_user_${i + 1}`,
      yonghuxingming: faker.person.fullName(),
      shoujihaoma: faker.phone.number(),
      youxiang: `perf_user_${i + 1}@example.com`,
      xingbie: faker.helpers.arrayElement(['男', '女']),
      shenfenzheng: generateIdCard(),
      touxiang: `/uploads/avatar_${(i % 10) + 1}.jpg`,
      zhuangtai: '正常',
      addtime: faker.date.past({ years: 2 }).toISOString().slice(0, 19).replace('T', ' ')
    })
  }

  return users
}

/**
 * 生成大规模课程数据
 */
export function generatePerformanceCourses(count: number): any[] {
  console.log(`Generating ${count} performance test courses...`)

  const courseTypes = ['有氧健身', '力量训练', '瑜伽', '搏击', '舞蹈', '游泳', '篮球', '足球']
  const instructors = ['张教练', '李教练', '王教练', '赵教练', '刘教练', '陈教练', '杨教练', '黄教练']

  const courses = []
  for (let i = 0; i < count; i++) {
    courses.push({
      id: i + 1,
      kechengmingcheng: `${faker.helpers.arrayElement(courseTypes)}课程_${i + 1}`,
      kechengjianjie: faker.lorem.sentences(2),
      kechengleixing: faker.helpers.arrayElement(courseTypes),
      jiage: faker.number.int({ min: 50, max: 500 }),
      shichang: `${faker.helpers.arrayElement([30, 45, 60, 90])}分钟`,
      shangkeshijian: faker.date.future({ years: 1 }).toISOString().slice(0, 16).replace('T', ' '),
      shangkedidian: `场地${faker.number.int({ min: 1, max: 20 })}`,
      jiaolianxingming: faker.helpers.arrayElement(instructors),
      clicknum: faker.number.int({ min: 0, max: 1000 }),
      tupian: `/uploads/course_${(i % 20) + 1}.jpg`,
      addtime: faker.date.past({ years: 1 }).toISOString().slice(0, 19).replace('T', ' ')
    })
  }

  return courses
}

/**
 * 生成大规模预约数据
 */
export function generatePerformanceBookings(count: number, users: any[], courses: any[]): any[] {
  console.log(`Generating ${count} performance test bookings...`)

  const bookings = []
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users)
    const course = faker.helpers.arrayElement(courses)

    bookings.push({
      id: i + 1,
      kechengid: course.id,
      kechengmingcheng: course.kechengmingcheng,
      yonghuzhanghao: user.yonghuzhanghao,
      yonghuxingming: user.yonghuxingming,
      shoujihaoma: user.shoujihaoma,
      yuyueshijian: faker.date.future({ days: 30 }).toISOString().slice(0, 16).replace('T', ' '),
      zhuangtai: faker.helpers.arrayElement(['已预约', '已确认', '已完成', '已取消']),
      beizhu: faker.lorem.sentence(),
      addtime: faker.date.past({ days: 30 }).toISOString().slice(0, 19).replace('T', ' ')
    })
  }

  return bookings
}

/**
 * 生成大规模教练数据
 */
export function generatePerformanceCoaches(count: number): any[] {
  console.log(`Generating ${count} performance test coaches...`)

  const specializations = ['力量训练', '有氧健身', '瑜伽', '搏击', '体态矫正', '康复训练', '营养指导']
  const levels = ['初级教练', '中级教练', '高级教练', '资深教练']

  const coaches = []
  for (let i = 0; i < count; i++) {
    coaches.push({
      id: i + 1,
      jiaoliangonghao: `COACH_${(i + 1).toString().padStart(4, '0')}`,
      jiaolianxingming: faker.person.fullName(),
      xingbie: faker.helpers.arrayElement(['男', '女']),
      nianling: faker.number.int({ min: 25, max: 50 }),
      shanchanglingyu: faker.helpers.arrayElement(specializations),
      jingyan: `${faker.number.int({ min: 1, max: 15 })}年`,
      jiage: faker.number.int({ min: 200, max: 1000 }),
      pingfen: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
      jianjie: faker.lorem.paragraph(),
      zhuangtai: '在职',
      tupian: `/uploads/coach_${(i % 15) + 1}.jpg`,
      addtime: faker.date.past({ years: 2 }).toISOString().slice(0, 19).replace('T', ' ')
    })
  }

  return coaches
}

/**
 * 生成大规模会员卡数据
 */
export function generatePerformanceMemberships(count: number): any[] {
  console.log(`Generating ${count} performance test memberships...`)

  const membershipTypes = [
    { name: '日卡', duration: 1, price: 20 },
    { name: '周卡', duration: 7, price: 100 },
    { name: '月卡', duration: 30, price: 299 },
    { name: '季卡', duration: 90, price: 799 },
    { name: '半年卡', duration: 180, price: 1399 },
    { name: '年卡', duration: 365, price: 2499 },
    { name: 'VIP年卡', duration: 365, price: 3999 }
  ]

  const memberships = []
  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(membershipTypes)
    memberships.push({
      id: i + 1,
      huiyuankamingcheng: `${type.name}_${i + 1}`,
      jiage: type.price,
      youxiaoqi: type.duration,
      huiyuankaxiangqing: faker.lorem.sentences(2),
      zhuangtai: '可用',
      tupian: `/uploads/membership_${(i % 7) + 1}.jpg`,
      addtime: faker.date.past({ years: 1 }).toISOString().slice(0, 19).replace('T', ' ')
    })
  }

  return memberships
}

/**
 * 生成大规模新闻数据
 */
export function generatePerformanceNews(count: number): any[] {
  console.log(`Generating ${count} performance test news...`)

  const categories = ['健身知识', '营养健康', '教练推荐', '活动公告', '会员故事']
  const authors = ['健身专家', '营养师', '资深教练', '健身达人', '健康顾问']

  const news = []
  for (let i = 0; i < count; i++) {
    news.push({
      id: i + 1,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(3),
      author: faker.helpers.arrayElement(authors),
      addtime: faker.date.past({ months: 6 }).toISOString().slice(0, 19).replace('T', ' '),
      clicknum: faker.number.int({ min: 0, max: 5000 }),
      thumbsupnum: faker.number.int({ min: 0, max: 200 }),
      crazilynum: faker.number.int({ min: 0, max: 50 }),
      newstype: faker.helpers.arrayElement(categories),
      tupian: `/uploads/news_${(i % 10) + 1}.jpg`
    })
  }

  return news
}

/**
 * 生成大规模设备数据
 */
export function generatePerformanceEquipment(count: number): any[] {
  console.log(`Generating ${count} performance test equipment...`)

  const equipmentTypes = ['有氧器材', '力量器材', '辅助器材', '康复器材']
  const equipmentNames = [
    '跑步机', '椭圆机', '单车', '划船机', '哑铃', '杠铃', '卧推架', '深蹲架',
    '瑜伽垫', '瑜伽砖', '拉伸带', '按摩椅', '体脂秤', '握力器'
  ]

  const equipment = []
  for (let i = 0; i < count; i++) {
    const name = faker.helpers.arrayElement(equipmentNames)
    equipment.push({
      id: i + 1,
      qicaimingcheng: name,
      qicaileixing: faker.helpers.arrayElement(equipmentTypes),
      zhuangtai: faker.helpers.arrayElement(['可用', '使用中', '维修中', '报废']),
      weizhi: `区域${faker.number.int({ min: 1, max: 10 })}`,
      jiage: faker.helpers.arrayElement(['免费', `${faker.number.int({ min: 10, max: 100 })}元/小时`]),
      shuliang: faker.number.int({ min: 1, max: 20 }),
      tupian: `/uploads/equipment_${(i % 14) + 1}.jpg`,
      addtime: faker.date.past({ years: 1 }).toISOString().slice(0, 19).replace('T', ' ')
    })
  }

  return equipment
}

/**
 * 生成完整的性能测试数据集
 */
export function generatePerformanceTestData(config: {
  users?: number
  courses?: number
  bookings?: number
  coaches?: number
  memberships?: number
  news?: number
  equipment?: number
} = {}): PerformanceTestData {
  const startTime = Date.now()

  console.log('Starting performance test data generation...')

  // 默认配置
  const defaultConfig = {
    users: 1000,
    courses: 500,
    bookings: 2000,
    coaches: 50,
    memberships: 20,
    news: 200,
    equipment: 100,
    ...config
  }

  // 生成数据
  const users = generatePerformanceUsers(defaultConfig.users!)
  const courses = generatePerformanceCourses(defaultConfig.courses!)
  const bookings = generatePerformanceBookings(defaultConfig.bookings!, users, courses)
  const coaches = generatePerformanceCoaches(defaultConfig.coaches!)
  const memberships = generatePerformanceMemberships(defaultConfig.memberships!)
  const news = generatePerformanceNews(defaultConfig.news!)
  const equipment = generatePerformanceEquipment(defaultConfig.equipment!)

  // 计算数据大小
  const totalRecords = users.length + courses.length + bookings.length +
                      coaches.length + memberships.length + news.length + equipment.length

  const dataSize = calculateDataSize({
    users,
    courses,
    bookings,
    coaches,
    memberships,
    news,
    equipment
  })

  const endTime = Date.now()
  const generationTime = endTime - startTime

  console.log(`Performance test data generation completed in ${generationTime}ms`)
  console.log(`Generated ${totalRecords} total records (${dataSize})`)

  return {
    users,
    courses,
    bookings,
    coaches,
    memberships,
    news,
    equipment,
    metadata: {
      generatedAt: new Date(),
      totalRecords,
      dataSize
    }
  }
}

/**
 * 生成身份证号（模拟）
 */
function generateIdCard(): string {
  const provinces = ['11', '12', '13', '14', '15', '21', '22', '23', '31', '32', '33', '34', '35', '36', '37', '41', '42', '43', '44', '45', '46', '50', '51', '52', '53', '54', '61', '62', '63', '64', '65']
  const province = faker.helpers.arrayElement(provinces)
  const city = faker.number.int({ min: 10, max: 99 }).toString().padStart(2, '0')
  const district = faker.number.int({ min: 10, max: 99 }).toString().padStart(2, '0')

  const birthYear = faker.date.past({ years: 50, refDate: new Date(2000, 0, 1) }).getFullYear()
  const birthMonth = (faker.number.int({ min: 1, max: 12 })).toString().padStart(2, '0')
  const birthDay = (faker.number.int({ min: 1, max: 28 })).toString().padStart(2, '0')

  const sequence = faker.number.int({ min: 100, max: 999 }).toString()

  return `${province}${city}${district}${birthYear}${birthMonth}${birthDay}${sequence}${faker.helpers.arrayElement(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])}`
}

/**
 * 计算数据大小
 */
function calculateDataSize(data: any): string {
  const jsonString = JSON.stringify(data)
  const bytes = new Blob([jsonString]).size

  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/**
 * 生成压力测试数据（更极端的情况）
 */
export function generateStressTestData(): PerformanceTestData {
  return generatePerformanceTestData({
    users: 10000,
    courses: 2000,
    bookings: 50000,
    coaches: 200,
    memberships: 100,
    news: 1000,
    equipment: 500
  })
}

/**
 * 生成内存压力测试数据
 */
export function generateMemoryStressData(): PerformanceTestData {
  return generatePerformanceTestData({
    users: 50000,
    courses: 10000,
    bookings: 100000,
    coaches: 1000,
    memberships: 500,
    news: 5000,
    equipment: 2000
  })
}

/**
 * 导出性能测试数据到文件
 */
export async function exportPerformanceData(data: PerformanceTestData, filename: string): Promise<void> {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })

  // 在Node.js环境中使用fs
  if (typeof window === 'undefined') {
    const fs = await import('fs')
    const path = await import('path')

    const filePath = path.join(process.cwd(), 'test-results', 'performance-data', filename)
    const dir = path.dirname(filePath)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(filePath, jsonString)
    console.log(`Performance data exported to: ${filePath}`)
  } else {
    // 在浏览器环境中创建下载
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
