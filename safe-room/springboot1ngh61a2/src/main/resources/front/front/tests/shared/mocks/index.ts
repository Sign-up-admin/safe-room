/**
 * Mock管理导出文件
 * 统一导出所有mock相关功能
 */

// Mock管理器
export {
  MockManager,
  mockManager,
  registerMock,
  resetMocks,
  setMocksEnabled
} from './MockManager';

export type { MockConfig, MockRule } from './MockManager';

// API Mock规则
export {
  userApiMocks,
  courseApiMocks,
  bookingApiMocks,
  notificationApiMocks,
  commonApiMocks,
  allApiMocks,
} from './apiMocks';

/**
 * 初始化所有mock规则
 */
export function initializeAllMocks(): void {
  const { mockManager } = require('./MockManager');

  // 注册所有API mock规则
  Object.entries(allApiMocks).forEach(([ruleId, rule]) => {
    mockManager.register(ruleId, rule);
  });

  mockManager.initialize();
}

/**
 * 清理所有mock
 */
export function cleanupMocks(): void {
  const { mockManager } = require('./MockManager');
  mockManager.destroy();
}

/**
 * 切换mock状态
 */
export function toggleMocks(enabled: boolean): void {
  const { setMocksEnabled } = require('./MockManager');
  setMocksEnabled(enabled);
}

/**
 * 为测试场景快速设置mock
 */
export class MockScenario {
  private enabledRules: string[] = [];

  /**
   * 启用用户认证相关的mock
   */
  withAuth(): MockScenario {
    const authRules = ['getCurrentUser', 'login', 'logout', 'refreshToken'];
    this.enableRules(authRules);
    return this;
  }

  /**
   * 启用课程相关的mock
   */
  withCourses(): MockScenario {
    const courseRules = ['getCourses', 'getCourse', 'createCourse', 'updateCourse', 'deleteCourse'];
    this.enableRules(courseRules);
    return this;
  }

  /**
   * 启用预约相关的mock
   */
  withBookings(): MockScenario {
    const bookingRules = ['getMyBookings', 'createBooking', 'cancelBooking'];
    this.enableRules(bookingRules);
    return this;
  }

  /**
   * 启用通知相关的mock
   */
  withNotifications(): MockScenario {
    const notificationRules = ['getNotifications', 'markNotificationRead'];
    this.enableRules(notificationRules);
    return this;
  }

  /**
   * 启用所有成功的mock（排除错误场景）
   */
  withSuccessOnly(): MockScenario {
    const successRules = Object.keys(allApiMocks).filter(
      ruleId => !ruleId.includes('Error') &&
                !ruleId.includes('Failure') &&
                ruleId !== 'unauthorized' &&
                ruleId !== 'forbidden' &&
                ruleId !== 'notFound' &&
                ruleId !== 'serverError' &&
                ruleId !== 'timeout'
    );
    this.enableRules(successRules);
    return this;
  }

  /**
   * 启用错误场景mock
   */
  withErrors(): MockScenario {
    const errorRules = ['networkError', 'unauthorized', 'forbidden', 'notFound', 'serverError', 'loginFailure'];
    this.enableRules(errorRules);
    return this;
  }

  /**
   * 启用指定规则
   */
  enableRules(ruleIds: string[]): MockScenario {
    const { mockManager } = require('./MockManager');

    ruleIds.forEach(ruleId => {
      if (allApiMocks[ruleId]) {
        mockManager.register(ruleId, allApiMocks[ruleId]);
        this.enabledRules.push(ruleId);
      }
    });

    return this;
  }

  /**
   * 应用mock配置
   */
  apply(): void {
    const { mockManager } = require('./MockManager');

    if (this.enabledRules.length > 0) {
      mockManager.initialize();
    }
  }

  /**
   * 清理当前场景的所有mock
   */
  cleanup(): void {
    const { mockManager } = require('./MockManager');

    this.enabledRules.forEach(ruleId => {
      mockManager.unregister(ruleId);
    });

    this.enabledRules = [];
  }
}

/**
 * 创建mock场景
 */
export function createMockScenario(): MockScenario {
  return new MockScenario();
}

// 默认导出mock管理器
export default mockManager;
