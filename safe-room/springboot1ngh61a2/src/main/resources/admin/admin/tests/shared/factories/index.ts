/**
 * 管理后台测试数据工厂导出文件
 * 统一导出所有工厂类和实例
 */

// 基础工厂类
export { BaseFactory, FactoryManager, factoryManager } from './BaseFactory';

// 管理员用户工厂
export { AdminUserFactory, adminUserFactory } from './AdminUserFactory';
export type { AdminUser } from './AdminUserFactory';

// 便捷的工厂创建函数
import { factoryManager } from './BaseFactory';

/**
 * 获取指定名称的工厂
 */
export function getFactory<T>(name: string) {
  return factoryManager.get<T>(name);
}

/**
 * 重置所有工厂状态
 */
export function resetAllFactories() {
  factoryManager.resetAll();
}

// 默认导出工厂管理器
export default factoryManager;
