import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

/**
 * Mock配置接口
 */
export interface MockConfig {
  enabled: boolean;
  delay?: number;
  errorRate?: number;
  baseUrl?: string;
}

/**
 * Mock规则接口
 */
export interface MockRule {
  url: string | RegExp;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  response: any;
  status?: number;
  delay?: number;
  errorResponse?: any;
  errorStatus?: number;
}

/**
 * Mock管理器类
 * 统一管理axios mock适配器和mock规则
 */
export class MockManager {
  private mockAdapter: MockAdapter | null = null;
  private config: MockConfig;
  private rules: Map<string, MockRule> = new Map();
  private isInitialized = false;

  constructor(config: Partial<MockConfig> = {}) {
    this.config = {
      enabled: true,
      delay: 200, // Admin API响应稍快
      errorRate: 0.03, // 3%错误率
      baseUrl: '/api/admin',
      ...config,
    };
  }

  /**
   * 初始化mock适配器
   */
  initialize(): void {
    if (this.isInitialized) return;

    this.mockAdapter = new MockAdapter(axios, {
      delayResponse: this.config.delay,
    });

    this.isInitialized = true;

    // 应用所有已注册的规则
    for (const rule of this.rules.values()) {
      this.applyRule(rule);
    }
  }

  /**
   * 销毁mock适配器
   */
  destroy(): void {
    if (this.mockAdapter) {
      this.mockAdapter.restore();
      this.mockAdapter = null;
    }
    this.isInitialized = false;
    this.rules.clear();
  }

  /**
   * 注册mock规则
   */
  register(ruleId: string, rule: MockRule): void {
    this.rules.set(ruleId, rule);

    if (this.isInitialized && this.mockAdapter) {
      this.applyRule(rule);
    }
  }

  /**
   * 取消注册mock规则
   */
  unregister(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule && this.mockAdapter) {
      this.mockAdapter.resetHandlers();
      // 重新应用剩余规则
      for (const remainingRule of this.rules.values()) {
        if (remainingRule !== rule) {
          this.applyRule(remainingRule);
        }
      }
    }
    this.rules.delete(ruleId);
  }

  /**
   * 更新mock规则
   */
  update(ruleId: string, updates: Partial<MockRule>): void {
    const existingRule = this.rules.get(ruleId);
    if (existingRule) {
      const updatedRule = { ...existingRule, ...updates };
      this.register(ruleId, updatedRule);
    }
  }

  /**
   * 启用/禁用mock
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (enabled && !this.isInitialized) {
      this.initialize();
    } else if (!enabled && this.isInitialized) {
      this.destroy();
    }
  }

  /**
   * 获取mock配置
   */
  getConfig(): MockConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<MockConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.mockAdapter) {
      // 重新初始化以应用新配置
      this.destroy();
      this.initialize();
    }
  }

  /**
   * 应用单个mock规则
   */
  private applyRule(rule: MockRule): void {
    if (!this.mockAdapter) return;

    const method = rule.method || 'GET';
    const status = rule.status || 200;
    const delay = rule.delay || this.config.delay || 0;

    // 模拟随机错误
    const shouldError = this.config.errorRate && Math.random() < this.config.errorRate;

    const responseHandler = (): [number, any] | Promise<[number, any]> => {
      // 添加延迟
      if (delay > 0) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve([shouldError ? (rule.errorStatus || 500) : status,
                    shouldError ? (rule.errorResponse || { error: 'Mock error' }) : rule.response]);
          }, delay);
        });
      }

      return [shouldError ? (rule.errorStatus || 500) : status,
             shouldError ? (rule.errorResponse || { error: 'Mock error' }) : rule.response];
    };

    // 根据HTTP方法注册mock
    switch (method) {
      case 'GET':
        this.mockAdapter.onGet(rule.url).reply(responseHandler);
        break;
      case 'POST':
        this.mockAdapter.onPost(rule.url).reply(responseHandler);
        break;
      case 'PUT':
        this.mockAdapter.onPut(rule.url).reply(responseHandler);
        break;
      case 'DELETE':
        this.mockAdapter.onDelete(rule.url).reply(responseHandler);
        break;
      case 'PATCH':
        this.mockAdapter.onPatch(rule.url).reply(responseHandler);
        break;
    }
  }

  /**
   * 重置所有handlers（用于测试清理）
   */
  reset(): void {
    if (this.mockAdapter) {
      this.mockAdapter.reset();
    }
  }

  /**
   * 获取所有注册的规则
   */
  getRules(): Map<string, MockRule> {
    return new Map(this.rules);
  }

  /**
   * 获取指定规则
   */
  getRule(ruleId: string): MockRule | undefined {
    return this.rules.get(ruleId);
  }
}

// 全局mock管理器实例
export const mockManager = new MockManager();

/**
 * 便捷的mock注册函数
 */
export function registerMock(ruleId: string, rule: MockRule): void {
  mockManager.register(ruleId, rule);
}

/**
 * 便捷的mock清理函数
 */
export function resetMocks(): void {
  mockManager.reset();
}

/**
 * 便捷的mock启用/禁用函数
 */
export function setMocksEnabled(enabled: boolean): void {
  mockManager.setEnabled(enabled);
}
