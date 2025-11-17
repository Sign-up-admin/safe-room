/**
 * Admin前端测试工具库统一导出入口
 *
 * 该文件整合了所有测试辅助函数，提供统一的导入接口
 * 包含组件挂载、Mock创建、数据生成、断言辅助等功能
 */

// =============================================================================
// 基础组件测试辅助函数 (优先使用unit-test-helpers版本)
// =============================================================================

export {
  // 基础组件挂载函数
  createTestApp,
  createTestRouter,
  createTestPinia,
  mountComponent,

  // 挂载选项配置
  createMountOptions,

  // Element Plus组件mock
  elementPlusMocks,

  // jQuery mock
  createJQueryMock,

  // 异步测试辅助
  waitForNextTick,

  // Mock工具
  mockUtils,

  // 测试清理
  cleanupTest,

  // 测试描述模板
  createTestSuite,

  // 断言辅助函数
  testAssertions,

  // 表格测试环境
  createTableTestEnvironment,
  mountTableComponent,

  // 组件Wrapper工厂函数
  createComponentWrapper,
  createFormWrapper,
  createTableWrapper,
  createDialogWrapper,
  ComponentWrapperConfig,
  ComponentWrappers,

  // Mock创建器
  createUnifiedMocks,
  createApiMocks,
  createDataMocks,
  createCombinedMocks,
  MockCreatorConfig,
  MockCreators
} from './unit-test-helpers'

// =============================================================================
// Admin专用测试辅助函数
// =============================================================================

export {
  // Admin应用创建和挂载 (重命名以区分)
  createTestApp as createAdminApp,
  mountComponent as mountAdminComponent,
  mountAdminComponent as mountAuthenticatedAdminComponent,
  mountWithRouteParams,
  mountTableComponent as mountAdminTableComponent,
  mountFormComponent,

  // Admin环境设置
  createHappyDOMWrapper,
  waitForElementPlus,
  setupAdminAuth,
  cleanupTestEnvironment,

  // API Mock和响应
  createMockResponse,
  createMockError,
  mockApiResponse,
  createMockStore,

  // 数据生成函数
  createMockUser,
  createMockModule,
  createMockMenu,
  createMockTableData,
  createMockFormData,
  createMockPagination,

  // 异步操作
  nextTick,
  createMockEvent,
  createMockFile,
  waitForAsync,

  // E2E测试辅助
  mockAdminApi,
  seedAdminSession,
  loginAsAdmin,
  navigateToModule
} from './test-helpers'

// =============================================================================
// 测试数据工厂
// =============================================================================

export {
  // 数据工厂类
  DataFactory,
  TableDataFactory,
  FormDataFactory,
  ApiResponseFactory,
  BaseFactory,

  // 预定义工厂实例
  UserFactory,
  ModuleFactory,
  MenuFactory,
  RoleFactory,
  PermissionFactory,
  UserTableFactory,
  ModuleTableFactory,
  UserFormFactory,
  ModuleFormFactory,

  // 数据生成器集合
  DataGenerators,

  // 测试场景
  TestScenarios
} from './data-factory'

// =============================================================================
// Element Plus Mock工厂函数
// =============================================================================

export {
  // 组件mock工厂
  createComponentMocks,
  createMenuComponentsMock,
  createFormComponentsMock,
  createDataComponentsMock,
  createLayoutComponentsMock,
  createCardComponentsMock,
  createBreadcrumbComponentsMock,
  createFeedbackComponentsMock,
  createDataEntryComponentsMock,
  createDataDisplayComponentsMock,
  createNavigationComponentsMock,
  createOverlayComponentsMock,
  createOtherComponentsMock,

  // 服务mock工厂
  createServiceMocks,

  // 图标mock工厂
  createIconsMock,

  // 综合mock工厂
  createElementPlusMock,
  createElementPlusTestEnvironment,

  // 单个组件创建
  createComponentMock,
  createScopedSlotComponentMock,

  // mock安装函数
  installElementPlusMock,

  // 默认测试环境
  elementPlusTestEnvironment
} from './mocks/element-plus.mock'

// =============================================================================
// 其他工具
// =============================================================================

// 重新导出常用的测试库函数，方便使用
export { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
export { mount, VueWrapper, MountingOptions } from '@vue/test-utils'
export type { Component } from 'vue'

// =============================================================================
// 类型定义
// =============================================================================

export type {
  MockElementPlusComponent,
  MockElementPlusPlugin
} from './mocks/element-plus.mock'
