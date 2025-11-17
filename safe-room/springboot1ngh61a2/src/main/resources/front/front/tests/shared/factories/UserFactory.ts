import { BaseFactory, factoryManager } from './BaseFactory';

/**
 * 用户接口定义
 */
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'inactive' | 'banned';
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
}

/**
 * 用户工厂类
 */
export class UserFactory extends BaseFactory<User> {
  private readonly roles: User['role'][] = ['user', 'admin', 'moderator'];
  private readonly statuses: User['status'][] = ['active', 'inactive', 'banned'];
  private readonly themes: User['preferences']['theme'][] = ['light', 'dark'];
  private readonly languages = ['zh-CN', 'en-US', 'zh-TW'];

  create(overrides: Partial<User> = {}): User {
    const id = overrides.id ?? this.nextId();
    const createdAt = overrides.createdAt ?? this.randomDate();

    return this.mergeDefaults({
      id,
      username: `user_${id}_${this.randomString(4)}`,
      email: this.randomEmail('test.com'),
      phone: this.randomPhone(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
      role: this.randomFromArray(this.roles),
      status: this.randomFromArray(this.statuses),
      createdAt,
      updatedAt: overrides.updatedAt ?? new Date(createdAt.getTime() + this.randomNumber(0, 86400000)), // 最多1天后
      isVerified: this.randomBoolean(),
      preferences: {
        theme: this.randomFromArray(this.themes),
        language: this.randomFromArray(this.languages),
        notifications: this.randomBoolean(),
      },
    }, overrides);
  }

  /**
   * 创建管理员用户
   */
  createAdmin(overrides: Partial<User> = {}): User {
    return this.create({
      role: 'admin',
      status: 'active',
      isVerified: true,
      ...overrides,
    });
  }

  /**
   * 创建活跃用户
   */
  createActiveUser(overrides: Partial<User> = {}): User {
    return this.create({
      status: 'active',
      isVerified: true,
      ...overrides,
    });
  }

  /**
   * 创建测试用户（用于登录测试）
   */
  createTestUser(overrides: Partial<User> = {}): User {
    return this.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      status: 'active',
      isVerified: true,
      ...overrides,
    });
  }

  /**
   * 创建批量用户（用于列表测试）
   */
  createUserList(count: number, baseOverrides: Partial<User> = {}): User[] {
    return this.createMany(count, baseOverrides);
  }
}

// 注册用户工厂
const userFactory = new UserFactory();
factoryManager.register('user', userFactory);

// 导出工厂实例
export { userFactory };
export default userFactory;
