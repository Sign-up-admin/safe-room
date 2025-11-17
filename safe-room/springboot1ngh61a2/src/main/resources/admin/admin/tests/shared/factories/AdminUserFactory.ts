import { BaseFactory, factoryManager } from './BaseFactory';

/**
 * 管理员用户接口定义
 */
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'operator';
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  department: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  loginAttempts: number;
}

/**
 * 管理员用户工厂类
 */
export class AdminUserFactory extends BaseFactory<AdminUser> {
  private readonly roles: AdminUser['role'][] = ['super_admin', 'admin', 'moderator', 'operator'];
  private readonly statuses: AdminUser['status'][] = ['active', 'inactive', 'suspended'];
  private readonly departments = ['技术部', '运营部', '市场部', '财务部', '人事部', '客服部'];
  private readonly permissions = [
    'user.manage', 'content.manage', 'system.config', 'reports.view',
    'courses.manage', 'orders.manage', 'finance.view', 'logs.view'
  ];

  create(overrides: Partial<AdminUser> = {}): AdminUser {
    const id = overrides.id ?? this.nextId();
    const createdAt = overrides.createdAt ?? this.randomDate();
    const role = overrides.role ?? this.randomFromArray(this.roles);

    return this.mergeDefaults({
      id,
      username: `admin_${id}_${this.randomString(4)}`,
      email: this.randomEmail('admin.com'),
      phone: this.randomPhone(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin${id}`,
      role,
      permissions: this.generatePermissions(role),
      status: this.randomFromArray(this.statuses),
      department: this.randomFromArray(this.departments),
      lastLoginAt: this.randomBoolean() ? this.randomDate(createdAt) : undefined,
      createdAt,
      updatedAt: overrides.updatedAt ?? new Date(createdAt.getTime() + this.randomNumber(0, 86400000)),
      isVerified: true, // 管理员默认已验证
      twoFactorEnabled: this.randomBoolean(),
      loginAttempts: this.randomNumber(0, 5),
    }, overrides);
  }

  /**
   * 根据角色生成权限列表
   */
  private generatePermissions(role: AdminUser['role']): string[] {
    const rolePermissions = {
      super_admin: [...this.permissions], // 所有权限
      admin: this.permissions.filter(p => !p.includes('system.config')), // 除系统配置外的所有权限
      moderator: ['user.manage', 'content.manage', 'reports.view'], // 内容管理和用户管理
      operator: ['reports.view', 'logs.view'], // 只读权限
    };

    const basePermissions = rolePermissions[role] || [];
    // 随机添加一些额外权限（20%概率）
    const extraPermissions = this.permissions.filter(p =>
      !basePermissions.includes(p) && Math.random() < 0.2
    );

    return [...basePermissions, ...extraPermissions];
  }

  /**
   * 创建超级管理员
   */
  createSuperAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
    return this.create({
      role: 'super_admin',
      status: 'active',
      isVerified: true,
      twoFactorEnabled: true,
      permissions: this.permissions, // 所有权限
      ...overrides,
    });
  }

  /**
   * 创建普通管理员
   */
  createAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
    return this.create({
      role: 'admin',
      status: 'active',
      isVerified: true,
      ...overrides,
    });
  }

  /**
   * 创建测试管理员（用于登录测试）
   */
  createTestAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
    return this.create({
      username: 'testadmin',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      isVerified: true,
      twoFactorEnabled: false,
      ...overrides,
    });
  }

  /**
   * 创建被暂停的管理员
   */
  createSuspendedAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
    return this.create({
      status: 'suspended',
      loginAttempts: this.randomNumber(5, 10),
      ...overrides,
    });
  }

  /**
   * 创建管理员列表
   */
  createAdminList(count: number, baseOverrides: Partial<AdminUser> = {}): AdminUser[] {
    return this.createMany(count, baseOverrides);
  }

  /**
   * 创建指定角色的管理员列表
   */
  createAdminsByRole(role: AdminUser['role'], count: number): AdminUser[] {
    return this.createMany(count, { role });
  }
}

// 注册管理员用户工厂
const adminUserFactory = new AdminUserFactory();
factoryManager.register('adminUser', adminUserFactory);

// 导出工厂实例
export { adminUserFactory };
export default adminUserFactory;
