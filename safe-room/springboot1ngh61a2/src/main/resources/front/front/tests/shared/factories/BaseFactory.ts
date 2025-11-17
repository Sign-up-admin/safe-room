/**
 * 基础工厂类
 * 提供测试数据生成的通用功能
 */
export abstract class BaseFactory<T> {
  protected sequence = 0;

  /**
   * 生成下一个序列号
   */
  protected nextId(): number {
    return ++this.sequence;
  }

  /**
   * 生成随机字符串
   */
  protected randomString(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成随机数字
   */
  protected randomNumber(min = 0, max = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 从数组中随机选择一个元素
   */
  protected randomFromArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 生成随机日期
   */
  protected randomDate(start?: Date, end?: Date): Date {
    const startDate = start || new Date(2020, 0, 1);
    const endDate = end || new Date();

    return new Date(
      startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
    );
  }

  /**
   * 生成随机布尔值
   */
  protected randomBoolean(): boolean {
    return Math.random() > 0.5;
  }

  /**
   * 生成随机邮箱
   */
  protected randomEmail(domain = 'example.com'): string {
    return `${this.randomString(8)}@${domain}`;
  }

  /**
   * 生成随机电话号码
   */
  protected randomPhone(): string {
    return `1${this.randomNumber(3000000000, 9999999999)}`;
  }

  /**
   * 合并默认属性和覆盖属性
   */
  protected mergeDefaults(defaults: Partial<T>, overrides: Partial<T> = {}): T {
    return { ...defaults, ...overrides } as T;
  }

  /**
   * 创建单个实例
   */
  abstract create(overrides?: Partial<T>): T;

  /**
   * 创建多个实例
   */
  createMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * 重置序列号
   */
  reset(): void {
    this.sequence = 0;
  }
}

/**
 * 工厂管理器
 * 用于管理多个工厂实例
 */
export class FactoryManager {
  private factories = new Map<string, BaseFactory<any>>();

  /**
   * 注册工厂
   */
  register<T>(name: string, factory: BaseFactory<T>): void {
    this.factories.set(name, factory);
  }

  /**
   * 获取工厂
   */
  get<T>(name: string): BaseFactory<T> | undefined {
    return this.factories.get(name);
  }

  /**
   * 重置所有工厂
   */
  resetAll(): void {
    for (const factory of this.factories.values()) {
      factory.reset();
    }
  }
}

// 全局工厂管理器实例
export const factoryManager = new FactoryManager();
