/**
 * Admin前端测试数据工厂统一导出
 * 整合所有测试数据工厂，提供统一的API接口
 */

// ========== 基础工厂类 ==========
export {
  EnhancedBaseFactory,
  EnhancedFactoryManager,
  enhancedFactoryManager,
  createBaseValidator,
  createRequiredFieldsValidator,
  createTypeValidator,
  ValidationResult,
  DataValidator,
  CleanupCallback,
  FactoryOptions
} from './base/base-factory'

// ========== 实体工厂 ==========
export {
  AdminUser,
  USER_PRESETS,
  AdminUserFactory,
  adminUserFactory,
  createAdminUser,
  createAdminUsers,
  createTestAdmin,
  createSuperAdmin,
  createAdmin
} from './entities/user.factory'

export {
  AdminModule,
  MODULE_PRESETS,
  AdminModuleFactory,
  adminModuleFactory,
  createAdminModule,
  createAdminModules,
  createMenuModule,
  createNavigationMenu,
  createMenuTree
} from './entities/module.factory'

export {
  AdminPermission,
  PERMISSION_PRESETS,
  AdminPermissionFactory,
  adminPermissionFactory,
  createAdminPermission,
  createAdminPermissions,
  createApiPermission,
  createMenuPermission,
  createResourcePermissions,
  createPermissionTree
} from './entities/permission.factory'

export {
  AdminRole,
  ROLE_PRESETS,
  AdminRoleFactory,
  adminRoleFactory,
  createAdminRole,
  createAdminRoles,
  createSuperAdminRole,
  createAdminRole as createRole,
  createCompleteRoleSystem
} from './entities/role.factory'

export {
  AdminDepartment,
  DEPARTMENT_PRESETS,
  AdminDepartmentFactory,
  adminDepartmentFactory,
  createAdminDepartment,
  createAdminDepartments,
  createCompleteDepartmentStructure,
  createTechDepartment,
  createProductDepartment
} from './entities/department.factory'

// ========== 响应工厂 ==========
export {
  ApiResponse,
  ListResponse,
  PaginationData,
  ErrorResponse,
  UploadResponse,
  BatchResponse,
  RESPONSE_PRESETS,
  ApiResponseFactory,
  apiResponseFactory,
  createSuccessResponse,
  createErrorResponse,
  createListResponse,
  createPaginatedResponse
} from './responses/api-response.factory'

export {
  PaginationQuery,
  PaginationMeta,
  AdvancedPaginationData,
  PaginationConfig,
  PAGINATION_PRESETS,
  PaginationFactory,
  paginationFactory,
  createPagination,
  createRandomPagination,
  createAdvancedPagination,
  createEmptyPagination
} from './responses/pagination.factory'

export {
  BaseTableData,
  TableColumn,
  TableAction,
  TableConfig,
  TableDataWrapper,
  FormData,
  SearchParams,
  StatisticsData,
  OperationLog,
  SystemConfig,
  TableDataFactory,
  tableDataFactory,
  createTableData,
  createUserTableData,
  createFormData,
  createStatisticsData
} from './responses/table-data.factory'

// ========== Builder构建器 ==========
export {
  UserBuilder,
  userBuilder,
  buildUser,
  buildSuperAdmin,
  buildAdmin,
  buildTestUser,
  buildRandomUser,
  buildUserList
} from './builders/user-builder'

export {
  ModuleBuilder,
  moduleBuilder,
  buildModule,
  buildUserManagement,
  buildCourseManagement,
  buildDashboard,
  buildNavigationMenu,
  buildRandomModule
} from './builders/module-builder'

export {
  ResponseBuilder,
  ListResponseBuilder,
  responseBuilder,
  listResponseBuilder,
  buildSuccessResponse,
  buildErrorResponse,
  buildListResponse,
  buildPaginatedResponse,
  buildRandomResponse
} from './builders/response-builder'

// ========== 清理工具 ==========
export {
  CleanupManager,
  CleanupScope,
  CleanupTask,
  CleanupStats,
  cleanupManager,
  registerCleanupTask,
  executeAllCleanups,
  createCleanupScope,
  createDatabaseCleanupTask,
  createFileCleanupTask,
  createCacheCleanupTask,
  createMemoryCleanupTask
} from './cleanup/cleanup-manager'

export {
  TestContext,
  TestContextManager,
  TestContextOptions,
  TestContextStats,
  ResourceManager,
  testContextManager,
  createTestContext,
  getActiveTestContext,
  cleanupActiveContext,
  withTestContext,
  autoCleanup,
  GenericResourceManager,
  userResourceManager,
  databaseResourceManager
} from './cleanup/test-context'

// ========== 工厂注册和初始化 ==========
import { factoryRegistry } from '../shared/factory-registry'

/**
 * 初始化所有Admin测试数据工厂
 * 注册到统一的工厂注册表中
 */
export function initializeAdminFactories(): void {
  console.log('Initializing Admin test data factories...')

  try {
    // 注册实体工厂
    factoryRegistry.register('admin-user-factory', adminUserFactory, {
      name: 'admin-user-factory',
      description: 'Admin user entity factory with validation and builders',
      category: 'entity',
      tags: ['admin', 'user', 'entity']
    })

    factoryRegistry.register('admin-module-factory', adminModuleFactory, {
      name: 'admin-module-factory',
      description: 'Admin module entity factory with validation and builders',
      category: 'entity',
      tags: ['admin', 'module', 'entity']
    })

    factoryRegistry.register('admin-permission-factory', adminPermissionFactory, {
      name: 'admin-permission-factory',
      description: 'Admin permission entity factory with validation',
      category: 'entity',
      tags: ['admin', 'permission', 'entity']
    })

    factoryRegistry.register('admin-role-factory', adminRoleFactory, {
      name: 'admin-role-factory',
      description: 'Admin role entity factory with validation',
      category: 'entity',
      tags: ['admin', 'role', 'entity']
    })

    factoryRegistry.register('admin-department-factory', adminDepartmentFactory, {
      name: 'admin-department-factory',
      description: 'Admin department entity factory with validation',
      category: 'entity',
      tags: ['admin', 'department', 'entity']
    })

    // 注册响应工厂
    factoryRegistry.register('api-response-factory', apiResponseFactory, {
      name: 'api-response-factory',
      description: 'API response factory with various response types',
      category: 'response',
      tags: ['admin', 'api', 'response']
    })

    factoryRegistry.register('pagination-factory', paginationFactory, {
      name: 'pagination-factory',
      description: 'Pagination data factory with advanced features',
      category: 'response',
      tags: ['admin', 'pagination', 'response']
    })

    factoryRegistry.register('table-data-factory', tableDataFactory, {
      name: 'table-data-factory',
      description: 'Table data factory with validation and statistics',
      category: 'response',
      tags: ['admin', 'table', 'data', 'response']
    })

    // 注册Builder工厂
    factoryRegistry.register('user-builder-factory', () => new UserBuilder(), {
      name: 'user-builder-factory',
      description: 'User builder factory for fluent API',
      category: 'mock',
      tags: ['admin', 'user', 'builder', 'fluent']
    })

    factoryRegistry.register('module-builder-factory', () => new ModuleBuilder(), {
      name: 'module-builder-factory',
      description: 'Module builder factory for fluent API',
      category: 'mock',
      tags: ['admin', 'module', 'builder', 'fluent']
    })

    factoryRegistry.register('response-builder-factory', () => new ResponseBuilder(), {
      name: 'response-builder-factory',
      description: 'Response builder factory for fluent API',
      category: 'mock',
      tags: ['admin', 'response', 'builder', 'fluent']
    })

    console.log('Admin factories initialized successfully')
    console.log(`Registered ${factoryRegistry.listByProject('admin').length} admin factories`)

  } catch (error) {
    console.error('Failed to initialize admin factories:', error)
    throw error
  }
}

/**
 * 获取所有已注册的Admin工厂
 */
export function getRegisteredAdminFactories(): string[] {
  return factoryRegistry.listByProject('admin')
}

/**
 * 获取按类别分组的Admin工厂
 */
export function getAdminFactoriesByCategory(): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  const adminFactories = factoryRegistry.listByProject('admin')

  adminFactories.forEach(factoryName => {
    const factory = factoryRegistry.get(factoryName)
    if (factory) {
      const category = factory.metadata.category
      if (!result[category]) {
        result[category] = []
      }
      result[category].push(factoryName)
    }
  })

  return result
}

/**
 * 重置所有Admin工厂
 */
export function resetAllAdminFactories(): void {
  console.log('Resetting all admin factories...')

  // 重置基础工厂
  adminUserFactory.reset()
  adminModuleFactory.reset()
  adminPermissionFactory.reset()
  adminRoleFactory.reset()
  adminDepartmentFactory.reset()
  apiResponseFactory.reset()
  paginationFactory.reset()
  tableDataFactory.reset()

  console.log('All admin factories reset')
}

/**
 * 清理所有Admin工厂资源
 */
export async function cleanupAllAdminFactories(): Promise<void> {
  console.log('Cleaning up all admin factories...')

  // 执行清理回调
  await adminUserFactory.cleanup()
  await adminModuleFactory.cleanup()
  await adminPermissionFactory.cleanup()
  await adminRoleFactory.cleanup()
  await adminDepartmentFactory.cleanup()
  await apiResponseFactory.cleanup()
  await paginationFactory.cleanup()
  await tableDataFactory.cleanup()

  // 执行全局清理管理器
  await cleanupManager.cleanupAll()

  console.log('All admin factories cleaned up')
}

// ========== 默认导出 ==========

/**
 * 默认导出所有工厂管理器和便捷函数
 */
const AdminFactories = {
  // 工厂实例
  userFactory: adminUserFactory,
  moduleFactory: adminModuleFactory,
  permissionFactory: adminPermissionFactory,
  roleFactory: adminRoleFactory,
  departmentFactory: adminDepartmentFactory,
  responseFactory: apiResponseFactory,
  paginationFactory,
  tableDataFactory,

  // 管理器
  cleanupManager,
  testContextManager,
  enhancedFactoryManager,

  // 初始化函数
  initialize: initializeAdminFactories,
  reset: resetAllAdminFactories,
  cleanup: cleanupAllAdminFactories,

  // 便捷函数
  createUser: adminUserFactory.create.bind(adminUserFactory),
  createModule: adminModuleFactory.create.bind(adminModuleFactory),
  createPermission: adminPermissionFactory.create.bind(adminPermissionFactory),
  createRole: adminRoleFactory.create.bind(adminRoleFactory),
  createDepartment: adminDepartmentFactory.create.bind(adminDepartmentFactory),
  createResponse: apiResponseFactory.create.bind(apiResponseFactory),
  createPagination: paginationFactory.create.bind(paginationFactory),
  createTableData: tableDataFactory.createTableData.bind(tableDataFactory),

  // Builder函数
  userBuilder: () => new UserBuilder(),
  moduleBuilder: () => new ModuleBuilder(),
  responseBuilder: () => new ResponseBuilder(),
  listResponseBuilder: () => new ListResponseBuilder(),

  // 统计函数
  getStats: () => ({
    factories: getAdminFactoriesByCategory(),
    cleanup: cleanupManager.getStats(),
    testContexts: testContextManager.getStats()
  })
}

export default AdminFactories

// ========== 自动初始化 ==========

// 在模块加载时自动初始化（可选）
// 可以注释掉这行，如果需要在测试中手动初始化
// initializeAdminFactories()
