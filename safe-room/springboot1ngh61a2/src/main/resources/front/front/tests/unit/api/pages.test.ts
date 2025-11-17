import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockPush = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockReplace = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockCurrentRoute = vi.hoisted(() => ({
  value: {
    path: '/current',
  },
}))

vi.mock('@/router', () => {
  return {
    default: {
      push: mockPush,
      replace: mockReplace,
      currentRoute: mockCurrentRoute,
    },
  }
})

import http from '@/common/http'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

describe('Front 页面 API 测试', () => {
  let mock: MockAdapter

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    mock = new MockAdapter(http)
    mockPush.mockClear()
    mockReplace.mockClear()
  })

  afterEach(() => {
    mock.restore()
    vi.clearAllMocks()
  })

  describe('登录相关 API', () => {
    describe('用户登录', () => {
      it('成功登录用户账户', async () => {
        const loginData = {
          username: 'testuser',
          password: 'password123'
        }
        const mockResponse = {
          code: 0,
          data: {
            id: 123,
            username: 'testuser',
            role: 'user',
            token: 'user-token-123'
          }
        }

        mock.onPost(API_ENDPOINTS.AUTH.LOGIN('yonghu')).reply(200, mockResponse)

        const response = await http.post(API_ENDPOINTS.AUTH.LOGIN('yonghu'), loginData)

        expect(response.data).toEqual(mockResponse)
        expect(mock.history.post[0].data).toEqual(JSON.stringify(loginData))
      })

      it('登录失败 - 用户名不存在', async () => {
        const loginData = {
          username: 'nonexistent',
          password: 'password123'
        }

        mock.onPost(API_ENDPOINTS.AUTH.LOGIN('yonghu')).reply(200, {
          code: 401,
          msg: '用户名或密码错误'
        })

        await expect(http.post(API_ENDPOINTS.AUTH.LOGIN('yonghu'), loginData))
          .rejects.toThrow('用户名或密码错误')
      })

      it('登录失败 - 密码错误', async () => {
        const loginData = {
          username: 'testuser',
          password: 'wrongpassword'
        }

        mock.onPost(API_ENDPOINTS.AUTH.LOGIN('yonghu')).reply(200, {
          code: 401,
          msg: '用户名或密码错误'
        })

        await expect(http.post(API_ENDPOINTS.AUTH.LOGIN('yonghu'), loginData))
          .rejects.toThrow('用户名或密码错误')
      })

      it('登录失败 - 账户被锁定', async () => {
        const loginData = {
          username: 'lockeduser',
          password: 'password123'
        }

        mock.onPost(API_ENDPOINTS.AUTH.LOGIN('yonghu')).reply(200, {
          code: 423,
          msg: '账户已被锁定，请联系管理员'
        })

        await expect(http.post(API_ENDPOINTS.AUTH.LOGIN('yonghu'), loginData))
          .rejects.toThrow('账户已被锁定，请联系管理员')
      })

      it('处理登录网络错误', async () => {
        const loginData = {
          username: 'testuser',
          password: 'password123'
        }

        mock.onPost(API_ENDPOINTS.AUTH.LOGIN('yonghu')).networkError()

        await expect(http.post(API_ENDPOINTS.AUTH.LOGIN('yonghu'), loginData))
          .rejects.toThrow('网络连接失败，请检查网络设置')
      })
    })

    describe('教练登录', () => {
      it('成功登录教练账户', async () => {
        const loginData = {
          username: 'coach123',
          password: 'coachpass'
        }
        const mockResponse = {
          code: 0,
          data: {
            id: 456,
            username: 'coach123',
            role: 'coach',
            token: 'coach-token-456',
            specialty: '健身教练'
          }
        }

        mock.onPost(API_ENDPOINTS.AUTH.LOGIN('jianshenjiaolian')).reply(200, mockResponse)

        const response = await http.post(API_ENDPOINTS.AUTH.LOGIN('jianshenjiaolian'), loginData)

        expect(response.data).toEqual(mockResponse)
        expect(response.data.data.role).toBe('coach')
      })
    })

    describe('会话管理', () => {
      it('获取当前用户会话信息', async () => {
        localStorage.setItem('frontToken', 'valid-token')
        const mockSession = {
          code: 0,
          data: {
            id: 123,
            username: 'testuser',
            role: 'user',
            lastLogin: '2024-01-01T10:00:00Z'
          }
        }

        mock.onGet(API_ENDPOINTS.AUTH.SESSION('yonghu')).reply(200, mockSession)

        const response = await http.get(API_ENDPOINTS.AUTH.SESSION('yonghu'))

        expect(response.data).toEqual(mockSession)
      })

      it('会话已过期', async () => {
        localStorage.setItem('frontToken', 'expired-token')

        mock.onGet(API_ENDPOINTS.AUTH.SESSION('yonghu')).reply(200, {
          code: 401,
          msg: '会话已过期，请重新登录'
        })

        await expect(http.get(API_ENDPOINTS.AUTH.SESSION('yonghu')))
          .rejects.toThrow('会话已过期，请重新登录')
      })
    })

    describe('密码重置', () => {
      it('请求密码重置', async () => {
        const resetData = {
          username: 'testuser',
          email: 'test@example.com'
        }

        mock.onPost(API_ENDPOINTS.AUTH.RESET_PASS('yonghu')).reply(200, {
          code: 0,
          msg: '密码重置邮件已发送'
        })

        const response = await http.post(API_ENDPOINTS.AUTH.RESET_PASS('yonghu'), resetData)

        expect(response.data.code).toBe(0)
        expect(response.data.msg).toContain('密码重置邮件已发送')
      })

      it('密码重置 - 用户不存在', async () => {
        const resetData = {
          username: 'nonexistent',
          email: 'invalid@example.com'
        }

        mock.onPost(API_ENDPOINTS.AUTH.RESET_PASS('yonghu')).reply(200, {
          code: 404,
          msg: '用户不存在'
        })

        await expect(http.post(API_ENDPOINTS.AUTH.RESET_PASS('yonghu'), resetData))
          .rejects.toThrow('用户不存在')
      })
    })

    describe('用户注册', () => {
      it('成功注册新用户', async () => {
        const registerData = {
          username: 'newuser',
          password: 'password123',
          email: 'newuser@example.com',
          phone: '13800138000'
        }

        mock.onPost(API_ENDPOINTS.AUTH.REGISTER('yonghu')).reply(200, {
          code: 0,
          data: {
            id: 789,
            username: 'newuser',
            email: 'newuser@example.com'
          },
          msg: '注册成功'
        })

        const response = await http.post(API_ENDPOINTS.AUTH.REGISTER('yonghu'), registerData)

        expect(response.data.code).toBe(0)
        expect(response.data.data.username).toBe('newuser')
      })

      it('注册失败 - 用户名已存在', async () => {
        const registerData = {
          username: 'existinguser',
          password: 'password123',
          email: 'test@example.com'
        }

        mock.onPost(API_ENDPOINTS.AUTH.REGISTER('yonghu')).reply(200, {
          code: 409,
          msg: '用户名已存在'
        })

        await expect(http.post(API_ENDPOINTS.AUTH.REGISTER('yonghu'), registerData))
          .rejects.toThrow('用户名已存在')
      })

      it('注册失败 - 邮箱已被使用', async () => {
        const registerData = {
          username: 'newuser2',
          password: 'password123',
          email: 'existing@example.com'
        }

        mock.onPost(API_ENDPOINTS.AUTH.REGISTER('yonghu')).reply(200, {
          code: 409,
          msg: '邮箱已被注册'
        })

        await expect(http.post(API_ENDPOINTS.AUTH.REGISTER('yonghu'), registerData))
          .rejects.toThrow('邮箱已被注册')
      })
    })

    describe('用户退出', () => {
      it('成功退出登录', async () => {
        localStorage.setItem('frontToken', 'user-token')

        mock.onPost(API_ENDPOINTS.AUTH.LOGOUT('yonghu')).reply(200, {
          code: 0,
          msg: '退出成功'
        })

        const response = await http.post(API_ENDPOINTS.AUTH.LOGOUT('yonghu'))

        expect(response.data.code).toBe(0)
        expect(response.data.msg).toBe('退出成功')
      })
    })
  })

  describe('用户中心 API', () => {
    beforeEach(() => {
      localStorage.setItem('frontToken', 'user-token-123')
    })

    describe('用户信息管理', () => {
      it('获取用户信息', async () => {
        const mockUser = {
          id: 123,
          username: 'testuser',
          email: 'test@example.com',
          phone: '13800138000',
          avatar: '/uploads/avatar.jpg',
          createTime: '2024-01-01T00:00:00Z'
        }

        mock.onGet(API_ENDPOINTS.YONGHU.DETAIL(123)).reply(200, {
          code: 0,
          data: mockUser
        })

        const response = await http.get(API_ENDPOINTS.YONGHU.DETAIL(123))

        expect(response.data.data).toEqual(mockUser)
      })

      it('更新用户信息', async () => {
        const updateData = {
          id: 123,
          email: 'newemail@example.com',
          phone: '13800138999'
        }

        mock.onPost(API_ENDPOINTS.YONGHU.UPDATE).reply(200, {
          code: 0,
          msg: '更新成功'
        })

        const response = await http.post(API_ENDPOINTS.YONGHU.UPDATE, updateData)

        expect(response.data.code).toBe(0)
        expect(response.data.msg).toBe('更新成功')
      })

      it('更新密码', async () => {
        const passwordData = {
          id: 123,
          oldPassword: 'oldpass123',
          newPassword: 'newpass456'
        }

        mock.onPost(API_ENDPOINTS.YONGHU.UPDATE).reply(200, {
          code: 0,
          msg: '密码更新成功'
        })

        const response = await http.post(API_ENDPOINTS.YONGHU.UPDATE, passwordData)

        expect(response.data.code).toBe(0)
        expect(response.data.msg).toBe('密码更新成功')
      })

      it('更新失败 - 原密码错误', async () => {
        const passwordData = {
          id: 123,
          oldPassword: 'wrongpass',
          newPassword: 'newpass456'
        }

        mock.onPost(API_ENDPOINTS.YONGHU.UPDATE).reply(200, {
          code: 400,
          msg: '原密码错误'
        })

        await expect(http.post(API_ENDPOINTS.YONGHU.UPDATE, passwordData))
          .rejects.toThrow('原密码错误')
      })
    })

    describe('收藏管理', () => {
      it('获取用户收藏列表', async () => {
        const mockFavorites = {
          list: [
            { id: 1, title: '收藏的课程1', type: 'course' },
            { id: 2, title: '收藏的课程2', type: 'course' }
          ],
          total: 2
        }

        mock.onGet(API_ENDPOINTS.STOREUP.LIST).reply(200, {
          code: 0,
          data: mockFavorites
        })

        const response = await http.get(API_ENDPOINTS.STOREUP.LIST, {
          params: { userid: 123, sort: 'addtime', order: 'desc' }
        })

        expect(response.data.data).toEqual(mockFavorites)
      })

      it('添加收藏', async () => {
        const favoriteData = {
          userid: 123,
          refid: 456,
          tablename: 'jianshenkecheng',
          name: '收藏的健身课程'
        }

        mock.onPost(API_ENDPOINTS.STOREUP.ADD).reply(200, {
          code: 0,
          msg: '收藏成功'
        })

        const response = await http.post(API_ENDPOINTS.STOREUP.ADD, favoriteData)

        expect(response.data.code).toBe(0)
        expect(response.data.msg).toBe('收藏成功')
      })

      it('取消收藏', async () => {
        mock.onPost(API_ENDPOINTS.STOREUP.DELETE).reply(200, {
          code: 0,
          msg: '取消收藏成功'
        })

        const response = await http.post(API_ENDPOINTS.STOREUP.DELETE, [789])

        expect(response.data.code).toBe(0)
        expect(response.data.msg).toBe('取消收藏成功')
      })
    })
  })

  describe('首页数据 API', () => {
    describe('新闻资讯', () => {
      it('获取新闻列表', async () => {
        const mockNews = {
          list: [
            {
              id: 1,
              title: '健身新趋势',
              content: '介绍最新的健身方法...',
              addtime: '2024-01-01T10:00:00Z'
            },
            {
              id: 2,
              title: '营养搭配指南',
              content: '科学的营养摄入方法...',
              addtime: '2024-01-02T10:00:00Z'
            }
          ],
          total: 2
        }

        mock.onGet(API_ENDPOINTS.NEWS.LIST).reply(200, {
          code: 0,
          data: mockNews
        })

        const response = await http.get(API_ENDPOINTS.NEWS.LIST, {
          params: { page: 1, limit: 10 }
        })

        expect(response.data.data).toEqual(mockNews)
        expect(response.data.data.list).toHaveLength(2)
      })

      it('获取新闻详情', async () => {
        const mockNewsDetail = {
          id: 1,
          title: '健身新趋势',
          content: '详细介绍最新的健身方法和科学依据...',
          addtime: '2024-01-01T10:00:00Z',
          clicknum: 1250,
          thumbsupnum: 89
        }

        mock.onGet(API_ENDPOINTS.NEWS.DETAIL(1)).reply(200, {
          code: 0,
          data: mockNewsDetail
        })

        const response = await http.get(API_ENDPOINTS.NEWS.DETAIL(1))

        expect(response.data.data).toEqual(mockNewsDetail)
        expect(response.data.data.title).toBe('健身新趋势')
      })

      it('点赞新闻', async () => {
        mock.onPost(API_ENDPOINTS.NEWS.THUMBSUP(1)).reply(200, {
          code: 0,
          msg: '点赞成功'
        })

        const response = await http.post(API_ENDPOINTS.NEWS.THUMBSUP(1), undefined, {
          params: { type: 1 }
        })

        expect(response.data.code).toBe(0)
        expect(response.data.msg).toBe('点赞成功')
      })
    })

    describe('健身教练', () => {
      it('获取教练列表', async () => {
        const mockCoaches = {
          list: [
            {
              id: 1,
              name: '张教练',
              specialty: '健身训练',
              experience: '5年',
              rating: 4.8
            },
            {
              id: 2,
              name: '李教练',
              specialty: '瑜伽教学',
              experience: '3年',
              rating: 4.9
            }
          ],
          total: 2
        }

        mock.onGet(API_ENDPOINTS.JIANSHENJIAOLIAN.LIST).reply(200, {
          code: 0,
          data: mockCoaches
        })

        const response = await http.get(API_ENDPOINTS.JIANSHENJIAOLIAN.LIST, {
          params: { page: 1, limit: 12 }
        })

        expect(response.data.data).toEqual(mockCoaches)
        expect(response.data.data.list[0].specialty).toBe('健身训练')
      })

      it('获取教练详情', async () => {
        const mockCoachDetail = {
          id: 1,
          name: '张教练',
          specialty: '健身训练',
          experience: '5年',
          introduction: '专业健身教练，拥有丰富的训练经验...',
          certificates: ['健身教练证书', '营养师证书'],
          rating: 4.8,
          reviewCount: 156
        }

        mock.onGet(API_ENDPOINTS.JIANSHENJIAOLIAN.DETAIL(1)).reply(200, {
          code: 0,
          data: mockCoachDetail
        })

        const response = await http.get(API_ENDPOINTS.JIANSHENJIAOLIAN.DETAIL(1))

        expect(response.data.data).toEqual(mockCoachDetail)
        expect(response.data.data.certificates).toContain('健身教练证书')
      })
    })

    describe('健身课程', () => {
      it('获取课程列表', async () => {
        const mockCourses = {
          list: [
            {
              id: 1,
              name: 'HIIT高强度训练',
              category: '健身',
              duration: 45,
              difficulty: '中级',
              price: 299
            },
            {
              id: 2,
              name: '瑜伽入门课程',
              category: '瑜伽',
              duration: 60,
              difficulty: '初级',
              price: 199
            }
          ],
          total: 2
        }

        mock.onGet(API_ENDPOINTS.JIANSHENKECHENG.LIST).reply(200, {
          code: 0,
          data: mockCourses
        })

        const response = await http.get(API_ENDPOINTS.JIANSHENKECHENG.LIST, {
          params: { page: 1, limit: 20 }
        })

        expect(response.data.data).toEqual(mockCourses)
        expect(response.data.data.list[0].name).toBe('HIIT高强度训练')
      })

      it('获取热门课程（自动排序）', async () => {
        const mockPopularCourses = [
          { id: 1, name: '热门课程1', popularity: 95 },
          { id: 2, name: '热门课程2', popularity: 87 }
        ]

        mock.onGet(API_ENDPOINTS.JIANSHENKECHENG.AUTO_SORT).reply(200, {
          code: 0,
          data: mockPopularCourses
        })

        const response = await http.get(API_ENDPOINTS.JIANSHENKECHENG.AUTO_SORT, {
          params: { limit: 10 }
        })

        expect(response.data.data).toEqual(mockPopularCourses)
        expect(response.data.data[0].popularity).toBe(95)
      })

      it('获取推荐课程（协同过滤）', async () => {
        const mockRecommendedCourses = [
          { id: 5, name: '推荐课程1', score: 0.92 },
          { id: 8, name: '推荐课程2', score: 0.87 }
        ]

        mock.onGet(API_ENDPOINTS.JIANSHENKECHENG.AUTO_SORT2).reply(200, {
          code: 0,
          data: mockRecommendedCourses
        })

        const response = await http.get(API_ENDPOINTS.JIANSHENKECHENG.AUTO_SORT2, {
          params: { userid: 123, limit: 5 }
        })

        expect(response.data.data).toEqual(mockRecommendedCourses)
        expect(response.data.data[0].score).toBe(0.92)
      })
    })

    describe('课程预约', () => {
      it('获取预约列表', async () => {
        const mockReservations = {
          list: [
            {
              id: 1,
              courseName: 'HIIT训练',
              coachName: '张教练',
              reservationTime: '2024-01-15 10:00',
              status: '已预约'
            }
          ],
          total: 1
        }

        mock.onGet(API_ENDPOINTS.KECHENGYUYUE.LIST).reply(200, {
          code: 0,
          data: mockReservations
        })

        const response = await http.get(API_ENDPOINTS.KECHENGYUYUE.LIST, {
          params: { userid: 123 }
        })

        expect(response.data.data).toEqual(mockReservations)
      })

      it('创建课程预约', async () => {
        const reservationData = {
          userid: 123,
          courseid: 456,
          coachid: 789,
          reservationTime: '2024-01-15 10:00:00',
          remarks: '希望重点训练腹部'
        }

        mock.onPost(API_ENDPOINTS.KECHENGYUYUE.ADD).reply(200, {
          code: 0,
          data: { id: 1001 },
          msg: '预约成功'
        })

        const response = await http.post(API_ENDPOINTS.KECHENGYUYUE.ADD, reservationData)

        expect(response.data.code).toBe(0)
        expect(response.data.data.id).toBe(1001)
        expect(response.data.msg).toBe('预约成功')
      })

      it('预约失败 - 课程已满', async () => {
        const reservationData = {
          userid: 123,
          courseid: 456,
          reservationTime: '2024-01-15 10:00:00'
        }

        mock.onPost(API_ENDPOINTS.KECHENGYUYUE.ADD).reply(200, {
          code: 409,
          msg: '该课程预约已满'
        })

        await expect(http.post(API_ENDPOINTS.KECHENGYUYUE.ADD, reservationData))
          .rejects.toThrow('该课程预约已满')
      })

      it('预约失败 - 时间冲突', async () => {
        const reservationData = {
          userid: 123,
          courseid: 456,
          reservationTime: '2024-01-15 10:00:00'
        }

        mock.onPost(API_ENDPOINTS.KECHENGYUYUE.ADD).reply(200, {
          code: 409,
          msg: '该时间段已有预约'
        })

        await expect(http.post(API_ENDPOINTS.KECHENGYUYUE.ADD, reservationData))
          .rejects.toThrow('该时间段已有预约')
      })
    })

    describe('私教预约', () => {
      it('创建私教预约', async () => {
        const privateReservationData = {
          userid: 123,
          coachid: 456,
          reservationTime: '2024-01-20 14:00:00',
          duration: 60,
          trainingType: 'personal training'
        }

        mock.onPost(API_ENDPOINTS.SIJIAOYUYUE.ADD).reply(200, {
          code: 0,
          data: { id: 2001 },
          msg: '私教预约成功'
        })

        const response = await http.post(API_ENDPOINTS.SIJIAOYUYUE.ADD, privateReservationData)

        expect(response.data.code).toBe(0)
        expect(response.data.data.id).toBe(2001)
      })
    })

    describe('会员卡管理', () => {
      it('获取会员卡列表', async () => {
        const mockCards = {
          list: [
            {
              id: 1,
              name: '金卡会员',
              price: 1999,
              duration: 365,
              benefits: ['无限次课程', '优先预约', '专属教练']
            },
            {
              id: 2,
              name: '银卡会员',
              price: 999,
              duration: 180,
              benefits: ['20次课程', '普通预约']
            }
          ],
          total: 2
        }

        mock.onGet(API_ENDPOINTS.HUIYUANKA.LIST).reply(200, {
          code: 0,
          data: mockCards
        })

        const response = await http.get(API_ENDPOINTS.HUIYUANKA.LIST)

        expect(response.data.data).toEqual(mockCards)
        expect(response.data.data.list[0].name).toBe('金卡会员')
      })

      it('会员卡购买', async () => {
        const purchaseData = {
          userid: 123,
          cardid: 1,
          paymentMethod: 'alipay',
          amount: 1999
        }

        mock.onPost(API_ENDPOINTS.HUIYUANKAGOUMAI.ADD).reply(200, {
          code: 0,
          data: {
            id: 3001,
            orderNumber: 'ORDER20240115001',
            status: '待支付'
          },
          msg: '订单创建成功'
        })

        const response = await http.post(API_ENDPOINTS.HUIYUANKAGOUMAI.ADD, purchaseData)

        expect(response.data.code).toBe(0)
        expect(response.data.data.status).toBe('待支付')
      })
    })

    describe('会员续费', () => {
      it('获取续费记录', async () => {
        const mockRenewals = {
          list: [
            {
              id: 1,
              userid: 123,
              amount: 999,
              renewalDate: '2024-01-01',
              expiryDate: '2025-01-01'
            }
          ],
          total: 1
        }

        mock.onGet(API_ENDPOINTS.HUIYUANXUFEI.LIST).reply(200, {
          code: 0,
          data: mockRenewals
        })

        const response = await http.get(API_ENDPOINTS.HUIYUANXUFEI.LIST, {
          params: { userid: 123 }
        })

        expect(response.data.data).toEqual(mockRenewals)
      })

      it('提交续费申请', async () => {
        const renewalData = {
          userid: 123,
          renewalType: 'annual',
          amount: 999,
          paymentMethod: 'wechat'
        }

        mock.onPost(API_ENDPOINTS.HUIYUANXUFEI.ADD).reply(200, {
          code: 0,
          data: { id: 4001 },
          msg: '续费申请提交成功'
        })

        const response = await http.post(API_ENDPOINTS.HUIYUANXUFEI.ADD, renewalData)

        expect(response.data.code).toBe(0)
        expect(response.data.msg).toBe('续费申请提交成功')
      })
    })
  })

  describe('其他页面 API', () => {
    describe('课程讨论', () => {
      it('获取课程讨论列表', async () => {
        const mockDiscussions = {
          list: [
            {
              id: 1,
              courseid: 123,
              userid: 456,
              content: '这门课程很不错！',
              addtime: '2024-01-01T15:30:00Z',
              thumbsupnum: 12
            }
          ],
          total: 1
        }

        mock.onGet(API_ENDPOINTS.DISCUSSJIANSHENKECHENG.LIST).reply(200, {
          code: 0,
          data: mockDiscussions
        })

        const response = await http.get(API_ENDPOINTS.DISCUSSJIANSHENKECHENG.LIST, {
          params: { courseid: 123, page: 1 }
        })

        expect(response.data.data).toEqual(mockDiscussions)
      })

      it('发布课程讨论', async () => {
        const discussionData = {
          courseid: 123,
          userid: 456,
          content: '课程内容很详细，教练讲解也很专业！'
        }

        mock.onPost(API_ENDPOINTS.DISCUSSJIANSHENKECHENG.ADD).reply(200, {
          code: 0,
          data: { id: 5001 },
          msg: '评论发表成功'
        })

        const response = await http.post(API_ENDPOINTS.DISCUSSJIANSHENKECHENG.ADD, discussionData)

        expect(response.data.code).toBe(0)
        expect(response.data.msg).toBe('评论发表成功')
      })
    })

    describe('聊天功能', () => {
      it('获取聊天记录', async () => {
        const mockMessages = {
          list: [
            {
              id: 1,
              fromid: 123,
              toid: 456,
              content: '您好，我想咨询课程详情',
              addtime: '2024-01-01T16:00:00Z',
              isreply: 0
            },
            {
              id: 2,
              fromid: 456,
              toid: 123,
              content: '您好，请问有什么可以帮您的吗？',
              addtime: '2024-01-01T16:05:00Z',
              isreply: 1
            }
          ],
          total: 2
        }

        mock.onGet(API_ENDPOINTS.CHAT.LIST).reply(200, {
          code: 0,
          data: mockMessages
        })

        const response = await http.get(API_ENDPOINTS.CHAT.LIST, {
          params: { userid: 123, page: 1, sort: 'addtime', order: 'desc' }
        })

        expect(response.data.data).toEqual(mockMessages)
        expect(response.data.data.list).toHaveLength(2)
      })

      it('发送聊天消息', async () => {
        const messageData = {
          fromid: 123,
          toid: 456,
          content: '我想预约明天上午的课程'
        }

        mock.onPost(API_ENDPOINTS.CHAT.ADD).reply(200, {
          code: 0,
          data: { id: 6001 },
          msg: '消息发送成功'
        })

        const response = await http.post(API_ENDPOINTS.CHAT.ADD, messageData)

        expect(response.data.code).toBe(0)
        expect(response.data.msg).toBe('消息发送成功')
      })
    })

    describe('到期提醒', () => {
      it('获取到期提醒列表', async () => {
        const mockReminders = {
          list: [
            {
              id: 1,
              userid: 123,
              message: '您的会员卡将于2024-02-01到期',
              remindDate: '2024-01-15',
              status: 'unread'
            }
          ],
          total: 1
        }

        mock.onGet(API_ENDPOINTS.DAOQITIXING.LIST).reply(200, {
          code: 0,
          data: mockReminders
        })

        const response = await http.get(API_ENDPOINTS.DAOQITIXING.LIST, {
          params: { userid: 123, status: 'unread' }
        })

        expect(response.data.data).toEqual(mockReminders)
      })
    })

    describe('健身器材', () => {
      it('获取健身器材列表', async () => {
        const mockEquipment = {
          list: [
            {
              id: 1,
              name: '跑步机',
              category: '有氧器材',
              status: '可用',
              location: '一楼健身区'
            },
            {
              id: 2,
              name: '哑铃组',
              category: '力量训练',
              status: '使用中',
              location: '二楼力量区'
            }
          ],
          total: 2
        }

        mock.onGet(API_ENDPOINTS.JIANSHENQICAI.LIST).reply(200, {
          code: 0,
          data: mockEquipment
        })

        const response = await http.get(API_ENDPOINTS.JIANSHENQICAI.LIST, {
          params: { status: '可用' }
        })

        expect(response.data.data).toEqual(mockEquipment)
      })
    })

    describe('文件上传下载', () => {
      it('上传文件', async () => {
        const formData = new FormData()
        formData.append('file', new Blob(['test content'], { type: 'text/plain' }), 'test.txt')

        mock.onPost(API_ENDPOINTS.FILE.UPLOAD).reply(200, {
          code: 0,
          data: {
            url: '/uploads/test.txt',
            filename: 'test.txt',
            size: 12
          },
          msg: '文件上传成功'
        })

        const response = await http.post(API_ENDPOINTS.FILE.UPLOAD, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        expect(response.data.code).toBe(0)
        expect(response.data.data.filename).toBe('test.txt')
      })

      it('下载文件', async () => {
        const mockFileBlob = new Blob(['file content'], { type: 'application/pdf' })

        mock.onGet('/file/download/123').reply(200, mockFileBlob, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="document.pdf"'
        })

        const response = await http.get('/file/download/123', {
          responseType: 'blob'
        })

        expect(response.data).toBeInstanceOf(Blob)
        // 对于 blob 响应，headers 可能通过 response.headers 访问
        const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type']
        expect(contentType).toBe('application/pdf')
      })
    })

    describe('系统配置', () => {
      it('获取系统配置', async () => {
        const mockConfig = {
          list: [
            {
              id: 1,
              name: 'system_name',
              value: '健身管理系统'
            },
            {
              id: 2,
              name: 'contact_phone',
              value: '400-123-4567'
            }
          ],
          total: 2
        }

        mock.onGet(API_ENDPOINTS.CONFIG.LIST).reply(200, {
          code: 0,
          data: mockConfig
        })

        const response = await http.get(API_ENDPOINTS.CONFIG.LIST)

        expect(response.data.data).toEqual(mockConfig)
      })
    })
  })

  describe('错误处理和边界情况', () => {
    it('处理401未授权错误', async () => {
      localStorage.setItem('frontToken', 'expired-token')

      mock.onGet(API_ENDPOINTS.YONGHU.DETAIL(123)).reply(200, {
        code: 401,
        msg: '未授权访问'
      })

      await expect(http.get(API_ENDPOINTS.YONGHU.DETAIL(123))).rejects.toThrow('未授权访问')
    })

    it('处理403禁止访问错误', async () => {
      mock.onGet('/admin/only').reply(200, {
        code: 403,
        msg: '禁止访问'
      })

      await expect(http.get('/admin/only')).rejects.toThrow('禁止访问')
    })

    it('处理404资源不存在错误', async () => {
      mock.onGet(API_ENDPOINTS.JIANSHENKECHENG.DETAIL(9999)).reply(200, {
        code: 404,
        msg: '课程不存在'
      })

      await expect(http.get(API_ENDPOINTS.JIANSHENKECHENG.DETAIL(9999))).rejects.toThrow('课程不存在')
    })

    it('处理500服务器内部错误', async () => {
      mock.onPost(API_ENDPOINTS.KECHENGYUYUE.ADD).reply(200, {
        code: 500,
        msg: '服务器内部错误'
      })

      await expect(http.post(API_ENDPOINTS.KECHENGYUYUE.ADD, {})).rejects.toThrow('服务器内部错误')
    })

    it('处理网络超时', async () => {
      mock.onGet(API_ENDPOINTS.NEWS.LIST).timeout()

      await expect(http.get(API_ENDPOINTS.NEWS.LIST)).rejects.toThrow('网络请求超时，请稍后重试')
    })

    it('处理网络连接错误', async () => {
      mock.onPost(API_ENDPOINTS.CHAT.ADD).networkError()

      await expect(http.post(API_ENDPOINTS.CHAT.ADD, { content: 'test' })).rejects.toThrow('网络连接失败，请检查网络设置')
    })

    it('处理大数据响应', async () => {
      const largeList = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        title: `课程${i + 1}`,
        description: `这是第${i + 1}门课程的详细描述...`.repeat(10)
      }))

      mock.onGet(API_ENDPOINTS.JIANSHENKECHENG.LIST).reply(200, {
        code: 0,
        data: { list: largeList, total: 1000 }
      })

      const response = await http.get(API_ENDPOINTS.JIANSHENKECHENG.LIST)

      expect(response.data.data.list).toHaveLength(1000)
      expect(response.data.data.total).toBe(1000)
    })

    it('处理特殊字符和Unicode', async () => {
      const unicodeData = {
        title: '测试标题 - 中文English日本語',
        content: '特殊字符：!@#$%^&*()_+-=[]{}|;:,.<>?`~',
        emoji: '😀👍🎉'
      }

      mock.onPost(API_ENDPOINTS.NEWS.ADD).reply(200, {
        code: 0,
        data: unicodeData
      })

      const response = await http.post(API_ENDPOINTS.NEWS.ADD, unicodeData)

      expect(response.data.data.title).toContain('中文English日本語')
      expect(response.data.data.emoji).toBe('😀👍🎉')
    })

    it('处理空数据和null值', async () => {
      const emptyData = {
        title: '',
        description: null,
        tags: [],
        metadata: {}
      }

      mock.onPost(API_ENDPOINTS.NEWS.ADD).reply(200, {
        code: 0,
        data: emptyData
      })

      const response = await http.post(API_ENDPOINTS.NEWS.ADD, emptyData)

      expect(response.data.data.title).toBe('')
      expect(response.data.data.description).toBeNull()
      expect(response.data.data.tags).toEqual([])
    })
  })
})
