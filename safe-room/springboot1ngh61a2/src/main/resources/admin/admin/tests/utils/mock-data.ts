/**
 * Admin项目Mock数据定义
 * 用于E2E测试的模拟数据
 */

// 用户数据
export const adminMockUsers = [
  { yonghuming: '测试用户1', shouji: '13800138001', shenfenzheng: '110101199001011234' },
  { yonghuming: '测试用户2', shouji: '13800138002', shenfenzheng: '110101199001011235' },
  { yonghuming: '测试用户3', shouji: '13800138003', shenfenzheng: '110101199001011236' },
]

// 教练数据
export const adminMockCoaches = [
  { jiaolianxingming: '张教练', nianling: 28, zhuanye: '力量训练', jingyan: '5年' },
  { jiaolianxingming: '李教练', nianling: 32, zhuanye: '瑜伽', jingyan: '8年' },
  { jiaolianxingming: '王教练', nianling: 26, zhuanye: '有氧健身', jingyan: '3年' },
]

// 课程数据
export const adminMockCourses = [
  { kechengmingcheng: '燃脂课', kechengleixing: '有氧', shichang: '60分钟', jiage: '100' },
  { kechengmingcheng: '力量训练', kechengleixing: '力量', shichang: '90分钟', jiage: '150' },
  { kechengmingcheng: '瑜伽课', kechengleixing: '瑜伽', shichang: '75分钟', jiage: '120' },
]

// 课程预约数据
export const adminMockCourseBookings = [
  { yonghuming: '测试用户1', kechengmingcheng: '燃脂课', yuyueshijian: '2024-01-15 10:00', zhuangtai: '已预约' },
  { yonghuming: '测试用户2', kechengmingcheng: '力量训练', yuyueshijian: '2024-01-16 14:00', zhuangtai: '已确认' },
  { yonghuming: '测试用户3', kechengmingcheng: '瑜伽课', yuyueshijian: '2024-01-17 09:00', zhuangtai: '已完成' },
]

// 私教预约数据
export const adminMockCoachBookings = [
  { yonghuming: '测试用户1', jiaolianxingming: '张教练', yuyueshijian: '2024-01-20 10:00', zhuangtai: '已预约' },
  { yonghuming: '测试用户2', jiaolianxingming: '李教练', yuyueshijian: '2024-01-21 15:00', zhuangtai: '已确认' },
  { yonghuming: '测试用户3', jiaolianxingming: '王教练', yuyueshijian: '2024-01-22 11:00', zhuangtai: '已完成' },
]

// 会员卡数据
export const adminMockMembershipCards = [
  { huiyuankamingcheng: '月卡', youxiaoqi: '30天', jiage: '200', fuwuneirong: '无限次健身' },
  { huiyuankamingcheng: '季卡', youxiaoqi: '90天', jiage: '550', fuwuneirong: '无限次健身+1次私教' },
  { huiyuankamingcheng: '年卡', youxiaoqi: '365天', jiage: '2000', fuwuneirong: '无限次健身+4次私教' },
]

// 会员卡购买数据
export const adminMockMembershipPurchases = [
  { yonghuming: '测试用户1', huiyuankamingcheng: '月卡', goumaishijian: '2024-01-01', zhuangtai: '已激活' },
  { yonghuming: '测试用户2', huiyuankamingcheng: '季卡', goumaishijian: '2024-01-05', zhuangtai: '已激活' },
  { yonghuming: '测试用户3', huiyuankamingcheng: '年卡', goumaishijian: '2024-01-10', zhuangtai: '已激活' },
]

// Mock数据记录集合
export const adminMockRecords = {
  users: adminMockUsers,
  coaches: adminMockCoaches,
  courses: adminMockCourses,
  courseBookings: adminMockCourseBookings,
  coachBookings: adminMockCoachBookings,
  membershipCards: adminMockMembershipCards,
  membershipPurchases: adminMockMembershipPurchases,
}

// Mock数据键类型
export type AdminMockKey = keyof typeof adminMockRecords
