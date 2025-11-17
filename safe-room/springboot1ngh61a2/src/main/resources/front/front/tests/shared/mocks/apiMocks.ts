import { MockRule } from './MockManager';
import { userFactory } from '../factories';

/**
 * 用户相关API Mock规则
 */
export const userApiMocks: Record<string, MockRule> = {
  // 获取用户信息
  getCurrentUser: {
    url: '/api/user/profile',
    method: 'GET',
    response: userFactory.createTestUser(),
    status: 200,
  },

  // 更新用户信息
  updateUserProfile: {
    url: '/api/user/profile',
    method: 'PUT',
    response: { success: true, message: 'Profile updated successfully' },
    status: 200,
  },

  // 用户登录
  login: {
    url: '/api/auth/login',
    method: 'POST',
    response: {
      token: 'mock-jwt-token-12345',
      user: userFactory.createTestUser(),
      expiresIn: 3600,
    },
    status: 200,
  },

  // 用户注册
  register: {
    url: '/api/auth/register',
    method: 'POST',
    response: {
      success: true,
      message: 'Registration successful',
      user: userFactory.createActiveUser(),
    },
    status: 201,
  },

  // 用户登出
  logout: {
    url: '/api/auth/logout',
    method: 'POST',
    response: { success: true, message: 'Logged out successfully' },
    status: 200,
  },

  // 刷新token
  refreshToken: {
    url: '/api/auth/refresh',
    method: 'POST',
    response: {
      token: 'mock-refreshed-jwt-token-67890',
      expiresIn: 3600,
    },
    status: 200,
  },

  // 获取用户列表（管理员功能）
  getUsers: {
    url: '/api/users',
    method: 'GET',
    response: {
      data: userFactory.createUserList(10),
      total: 10,
      page: 1,
      limit: 10,
    },
    status: 200,
  },

  // 登录失败场景
  loginFailure: {
    url: '/api/auth/login',
    method: 'POST',
    response: { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
    status: 401,
    errorResponse: { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
    errorStatus: 401,
  },
};

/**
 * 课程相关API Mock规则
 */
export const courseApiMocks: Record<string, MockRule> = {
  // 获取课程列表
  getCourses: {
    url: '/api/courses',
    method: 'GET',
    response: {
      data: userFactory.createCourseList(5), // 注意：这里应该使用courseFactory，但为了兼容性暂时使用userFactory
      total: 25,
      page: 1,
      limit: 5,
    },
    status: 200,
  },

  // 获取单个课程详情
  getCourse: {
    url: /^\/api\/courses\/\d+$/,
    method: 'GET',
    response: userFactory.createCourse(), // 同上
    status: 200,
  },

  // 创建课程
  createCourse: {
    url: '/api/courses',
    method: 'POST',
    response: {
      success: true,
      message: 'Course created successfully',
      data: userFactory.createCourse(),
    },
    status: 201,
  },

  // 更新课程
  updateCourse: {
    url: /^\/api\/courses\/\d+$/,
    method: 'PUT',
    response: {
      success: true,
      message: 'Course updated successfully',
    },
    status: 200,
  },

  // 删除课程
  deleteCourse: {
    url: /^\/api\/courses\/\d+$/,
    method: 'DELETE',
    response: {
      success: true,
      message: 'Course deleted successfully',
    },
    status: 200,
  },

  // 报名课程
  enrollCourse: {
    url: /^\/api\/courses\/\d+\/enroll$/,
    method: 'POST',
    response: {
      success: true,
      message: 'Successfully enrolled in course',
    },
    status: 200,
  },
};

/**
 * 预约相关API Mock规则
 */
export const bookingApiMocks: Record<string, MockRule> = {
  // 获取我的预约
  getMyBookings: {
    url: '/api/bookings',
    method: 'GET',
    response: {
      data: [],
      total: 0,
    },
    status: 200,
  },

  // 创建预约
  createBooking: {
    url: '/api/bookings',
    method: 'POST',
    response: {
      success: true,
      message: 'Booking created successfully',
      data: {
        id: 1,
        courseId: 1,
        userId: 1,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
    },
    status: 201,
  },

  // 取消预约
  cancelBooking: {
    url: /^\/api\/bookings\/\d+$/,
    method: 'DELETE',
    response: {
      success: true,
      message: 'Booking cancelled successfully',
    },
    status: 200,
  },
};

/**
 * 通知相关API Mock规则
 */
export const notificationApiMocks: Record<string, MockRule> = {
  // 获取通知列表
  getNotifications: {
    url: '/api/notifications',
    method: 'GET',
    response: {
      data: [
        {
          id: 1,
          title: '课程提醒',
          message: '您报名的瑜伽课程即将开始',
          type: 'course_reminder',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      unreadCount: 1,
    },
    status: 200,
  },

  // 标记通知为已读
  markNotificationRead: {
    url: /^\/api\/notifications\/\d+\/read$/,
    method: 'PUT',
    response: {
      success: true,
      message: 'Notification marked as read',
    },
    status: 200,
  },
};

/**
 * 公共API Mock规则（错误场景等）
 */
export const commonApiMocks: Record<string, MockRule> = {
  // 网络错误
  networkError: {
    url: '/api/network-error',
    method: 'GET',
    response: { error: 'Network error' },
    status: 500,
  },

  // 未授权
  unauthorized: {
    url: '/api/unauthorized',
    method: 'GET',
    response: { error: 'Unauthorized', code: 'UNAUTHORIZED' },
    status: 401,
  },

  // 禁止访问
  forbidden: {
    url: '/api/forbidden',
    method: 'GET',
    response: { error: 'Forbidden', code: 'FORBIDDEN' },
    status: 403,
  },

  // 未找到
  notFound: {
    url: '/api/not-found',
    method: 'GET',
    response: { error: 'Not found', code: 'NOT_FOUND' },
    status: 404,
  },

  // 服务器错误
  serverError: {
    url: '/api/server-error',
    method: 'GET',
    response: { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    status: 500,
  },

  // 超时
  timeout: {
    url: '/api/timeout',
    method: 'GET',
    response: { error: 'Request timeout', code: 'TIMEOUT' },
    status: 408,
    delay: 35000, // 超过默认35秒超时
  },
};

/**
 * 所有API Mock规则的集合
 */
export const allApiMocks = {
  ...userApiMocks,
  ...courseApiMocks,
  ...bookingApiMocks,
  ...notificationApiMocks,
  ...commonApiMocks,
};
