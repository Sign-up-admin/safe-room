/**
 * 本地存储工具类
 * 提供通用的本地存储操作
 */

/**
 * 获取存储的值
 * @param key 存储键
 * @returns 存储的值，如果不存在则返回null
 */
function get<T = any>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Failed to parse stored value for key "${key}":`, error);
    return null;
  }
}

/**
 * 设置存储的值
 * @param key 存储键
 * @param value 要存储的值
 */
function set<T = any>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to store value for key "${key}":`, error);
  }
}

/**
 * 移除存储的值
 * @param key 存储键
 */
function remove(key: string): void {
  localStorage.removeItem(key);
}

/**
 * 清空所有存储
 */
function clear(): void {
  localStorage.clear();
}

/**
 * 检查键是否存在
 * @param key 存储键
 * @returns 是否存在
 */
function has(key: string): boolean {
  return localStorage.getItem(key) !== null;
}

/**
 * 获取所有存储的键
 * @returns 键的数组
 */
function keys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      keys.push(key);
    }
  }
  return keys;
}

// 默认导出storage对象
const storage = {
  get,
  set,
  remove,
  clear,
  has,
  keys,
};

export default storage;
