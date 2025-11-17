import { MockRule } from './MockManager';
import { adminUserFactory } from '../factories';

/**
 * 管理员认证相关API Mock规则
 */
export const adminAuthApiMocks: Record<string, MockRule> = {
  // 管理员登录
  adminLogin: {
    url: '/api/admin/auth/login',
    method: 'POST',
    response: {
      token: 'mock-admin-jwt-token-12345',
      user: adminUserFactory.createTestAdmin(),
      permissions: ['user.manage', 'content.manage', 'reports.view'],
      expiresIn: 3600,
    },
    status: 200,
  },

  // 管理员登出
  adminLogout: {
    url: '/api/admin/auth/logout',
    method: 'POST',
    response: { success: true, message: 'Logged out successfully' },
    status: 200,
  },

  // 获取管理员信息
  getAdminProfile: {
    url: '/api/admin/profile',
    method: 'GET',
    response: adminUserFactory.createTestAdmin(),
    status: 200,
  },

  // 刷新管理员token
  refreshAdminToken: {
    url: '/api/admin/auth/refresh',
    method: 'POST',
    response: {
      token: 'mock-admin-refreshed-jwt-token-67890',
      expiresIn: 3600,
    },
    status: 200,
  },

  // 登录失败
  adminLoginFailure: {
    url: '/api/admin/auth/login',
    method: 'POST',
    response: { error: 'Invalid admin credentials', code: 'INVALID_ADMIN_CREDENTIALS' },
    status: 401,
  },
};

/**
 * 用户管理相关API Mock规则
 */
export const userManagementApiMocks: Record<string, MockRule> = {
  // 获取用户列表
  getUsers: {
    url: '/api/admin/users',
    method: 'GET',
    response: {
      data: adminUserFactory.createUserList(20), // 这里应该用userFactory，但为了兼容性暂时用adminUserFactory
      total: 150,
      page: 1,
      limit: 20,
      filters: {
        status: null,
        role: null,
        department: null,
      },
    },
    status: 200,
  },

  // 获取单个用户信息
  getUser: {
    url: /^\/api\/admin\/users\/\d+$/,
    method: 'GET',
    response: adminUserFactory.createActiveUser(),
    status: 200,
  },

  // 创建用户
  createUser: {
    url: '/api/admin/users',
    method: 'POST',
    response: {
      success: true,
      message: 'User created successfully',
      data: adminUserFactory.createActiveUser(),
    },
    status: 201,
  },

  // 更新用户信息
  updateUser: {
    url: /^\/api\/admin\/users\/\d+$/,
    method: 'PUT',
    response: {
      success: true,
      message: 'User updated successfully',
    },
    status: 200,
  },

  // 删除用户
  deleteUser: {
    url: /^\/api\/admin\/users\/\d+$/,
    method: 'DELETE',
    response: {
      success: true,
      message: 'User deleted successfully',
    },
    status: 200,
  },

  // 批量操作用户
  batchUpdateUsers: {
    url: '/api/admin/users/batch',
    method: 'PUT',
    response: {
      success: true,
      message: 'Users updated successfully',
      updatedCount: 5,
    },
    status: 200,
  },
};

/**
 * 内容管理相关API Mock规则
 */
export const contentManagementApiMocks: Record<string, MockRule> = {
  // 获取课程列表（管理）
  getAdminCourses: {
    url: '/api/admin/courses',
    method: 'GET',
    response: {
      data: [], // 这里应该用courseFactory
      total: 45,
      page: 1,
      limit: 10,
    },
    status: 200,
  },

  // 审核课程
  reviewCourse: {
    url: /^\/api\/admin\/courses\/\d+\/review$/,
    method: 'PUT',
    response: {
      success: true,
      message: 'Course review completed',
      status: 'approved',
    },
    status: 200,
  },

  // 获取新闻列表
  getNews: {
    url: '/api/admin/news',
    method: 'GET',
    response: {
      data: [
        {
          id: 1,
          title: '新课程上线通知',
          content: '我们很高兴宣布新的健身课程现已上线...',
          status: 'published',
          author: 'admin',
          createdAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        },
      ],
      total: 25,
      page: 1,
      limit: 10,
    },
    status: 200,
  },

  // 发布新闻
  publishNews: {
    url: '/api/admin/news',
    method: 'POST',
    response: {
      success: true,
      message: 'News published successfully',
      data: {
        id: 2,
        title: '系统维护通知',
        status: 'published',
        createdAt: new Date().toISOString(),
      },
    },
    status: 201,
  },
};

/**
 * 统计和报表相关API Mock规则
 */
export const analyticsApiMocks: Record<string, MockRule> = {
  // 获取仪表板统计数据
  getDashboardStats: {
    url: '/api/admin/dashboard/stats',
    method: 'GET',
    response: {
      totalUsers: 1250,
      activeUsers: 890,
      totalCourses: 45,
      totalBookings: 320,
      revenue: 45000,
      growth: {
        users: 12.5,
        bookings: 8.3,
        revenue: 15.2,
      },
    },
    status: 200,
  },

  // 获取用户增长趋势
  getUserGrowthTrend: {
    url: '/api/admin/analytics/user-growth',
    method: 'GET',
    response: {
      data: [
        { date: '2024-01', users: 1200, newUsers: 120 },
        { date: '2024-02', users: 1250, newUsers: 50 },
        { date: '2024-03', users: 1250, newUsers: 0 },
      ],
      period: 'monthly',
    },
    status: 200,
  },

  // 获取课程统计
  getCourseStats: {
    url: '/api/admin/analytics/courses',
    method: 'GET',
    response: {
      popularCourses: [
        { id: 1, title: '瑜伽基础', enrollments: 45, rating: 4.8 },
        { id: 2, title: '力量训练', enrollments: 38, rating: 4.6 },
      ],
      categoryStats: [
        { category: '瑜伽', count: 12, enrollments: 156 },
        { category: '力量训练', count: 8, enrollments: 98 },
      ],
    },
    status: 200,
  },

  // 导出报表
  exportReport: {
    url: '/api/admin/reports/export',
    method: 'POST',
    response: {
      success: true,
      downloadUrl: '/api/admin/reports/download/12345',
      expiresIn: 3600,
    },
    status: 200,
  },
};

/**
 * 系统管理相关API Mock规则
 */
export const systemManagementApiMocks: Record<string, MockRule> = {
  // 获取系统日志
  getSystemLogs: {
    url: '/api/admin/system/logs',
    method: 'GET',
    response: {
      data: [
        {
          id: 1,
          level: 'INFO',
          message: 'User login successful',
          timestamp: new Date().toISOString(),
          userId: 123,
        },
        {
          id: 2,
          level: 'WARN',
          message: 'High memory usage detected',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          userId: null,
        },
      ],
      total: 1250,
      page: 1,
      limit: 50,
    },
    status: 200,
  },

  // 获取系统配置
  getSystemConfig: {
    url: '/api/admin/system/config',
    method: 'GET',
    response: {
      siteName: '健身房管理系统',
      maintenanceMode: false,
      maxUploadSize: 10485760,
      sessionTimeout: 3600,
      emailNotifications: true,
      smsNotifications: false,
    },
    status: 200,
  },

  // 更新系统配置
  updateSystemConfig: {
    url: '/api/admin/system/config',
    method: 'PUT',
    response: {
      success: true,
      message: 'System configuration updated',
    },
    status: 200,
  },

  // 获取备份列表
  getBackups: {
    url: '/api/admin/system/backups',
    method: 'GET',
    response: {
      data: [
        {
          id: 1,
          filename: 'backup-2024-01-15.sql',
          size: 5242880,
          createdAt: '2024-01-15T10:00:00Z',
          status: 'completed',
        },
      ],
      total: 10,
    },
    status: 200,
  },

  // 创建备份
  createBackup: {
    url: '/api/admin/system/backups',
    method: 'POST',
    response: {
      success: true,
      message: 'Backup created successfully',
      backupId: 2,
    },
    status: 201,
  },
};

/**
 * 权限管理相关API Mock规则
 */
export const permissionApiMocks: Record<string, MockRule> = {
  // 获取角色列表
  getRoles: {
    url: '/api/admin/roles',
    method: 'GET',
    response: {
      data: [
        {
          id: 1,
          name: 'super_admin',
          displayName: '超级管理员',
          permissions: ['*'],
          userCount: 2,
        },
        {
          id: 2,
          name: 'admin',
          displayName: '管理员',
          permissions: ['user.manage', 'content.manage', 'reports.view'],
          userCount: 5,
        },
      ],
      total: 4,
    },
    status: 200,
  },

  // 创建角色
  createRole: {
    url: '/api/admin/roles',
    method: 'POST',
    response: {
      success: true,
      message: 'Role created successfully',
      data: {
        id: 5,
        name: 'moderator',
        displayName: '版主',
        permissions: ['content.manage'],
      },
    },
    status: 201,
  },

  // 更新角色权限
  updateRolePermissions: {
    url: /^\/api\/admin\/roles\/\d+\/permissions$/,
    method: 'PUT',
    response: {
      success: true,
      message: 'Role permissions updated',
    },
    status: 200,
  },
};

/**
 * 所有管理后台API Mock规则的集合
 */
export const allAdminApiMocks = {
  ...adminAuthApiMocks,
  ...userManagementApiMocks,
  ...contentManagementApiMocks,
  ...analyticsApiMocks,
  ...systemManagementApiMocks,
  ...permissionApiMocks,
};
