/**
 * 管理后台Mock管理导出文件
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

// Admin API Mock规则
export {
  adminAuthApiMocks,
  userManagementApiMocks,
  contentManagementApiMocks,
  analyticsApiMocks,
  systemManagementApiMocks,
  permissionApiMocks,
  allAdminApiMocks,
} from './adminApiMocks';

/**
 * 初始化所有管理后台mock规则
 */
export function initializeAllMocks(): void {
  const { mockManager } = require('./MockManager');

  // 注册所有管理后台API mock规则
  Object.entries(allAdminApiMocks).forEach(([ruleId, rule]) => {
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
 * 为管理后台测试场景快速设置mock
 */
export class AdminMockScenario {
  private enabledRules: string[] = [];

  /**
   * 启用管理员认证相关的mock
   */
  withAdminAuth(): AdminMockScenario {
    const authRules = ['adminLogin', 'adminLogout', 'getAdminProfile', 'refreshAdminToken'];
    this.enableRules(authRules);
    return this;
  }

  /**
   * 启用用户管理相关的mock
   */
  withUserManagement(): AdminMockScenario {
    const userRules = ['getUsers', 'getUser', 'createUser', 'updateUser', 'deleteUser', 'batchUpdateUsers'];
    this.enableRules(userRules);
    return this;
  }

  /**
   * 启用内容管理相关的mock
   */
  withContentManagement(): AdminMockScenario {
    const contentRules = ['getAdminCourses', 'reviewCourse', 'getNews', 'publishNews'];
    this.enableRules(contentRules);
    return this;
  }

  /**
   * 启用统计分析相关的mock
   */
  withAnalytics(): AdminMockScenario {
    const analyticsRules = ['getDashboardStats', 'getUserGrowthTrend', 'getCourseStats', 'exportReport'];
    this.enableRules(analyticsRules);
    return this;
  }

  /**
   * 启用系统管理相关的mock
   */
  withSystemManagement(): AdminMockScenario {
    const systemRules = ['getSystemLogs', 'getSystemConfig', 'updateSystemConfig', 'getBackups', 'createBackup'];
    this.enableRules(systemRules);
    return this;
  }

  /**
   * 启用权限管理相关的mock
   */
  withPermissions(): AdminMockScenario {
    const permissionRules = ['getRoles', 'createRole', 'updateRolePermissions'];
    this.enableRules(permissionRules);
    return this;
  }

  /**
   * 启用所有成功的mock（排除错误场景）
   */
  withSuccessOnly(): AdminMockScenario {
    const successRules = Object.keys(allAdminApiMocks).filter(
      ruleId => !ruleId.includes('Failure') && !ruleId.includes('Error')
    );
    this.enableRules(successRules);
    return this;
  }

  /**
   * 启用错误场景mock
   */
  withErrors(): AdminMockScenario {
    const errorRules = ['adminLoginFailure'];
    this.enableRules(errorRules);
    return this;
  }

  /**
   * 启用仪表板完整场景
   */
  withDashboard(): AdminMockScenario {
    return this.withAdminAuth()
               .withAnalytics()
               .withUserManagement()
               .withContentManagement();
  }

  /**
   * 启用指定规则
   */
  enableRules(ruleIds: string[]): AdminMockScenario {
    const { mockManager } = require('./MockManager');

    ruleIds.forEach(ruleId => {
      if (allAdminApiMocks[ruleId]) {
        mockManager.register(ruleId, allAdminApiMocks[ruleId]);
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
 * 创建管理后台mock场景
 */
export function createAdminMockScenario(): AdminMockScenario {
  return new AdminMockScenario();
}

// 默认导出mock管理器
export default mockManager;
