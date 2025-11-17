# GitHub Copilot 使用指南

## 概述

本指南为项目文档工程团队定义GitHub Copilot的使用规范和最佳实践，确保AI辅助生成的代码和文档符合项目标准。

## 文档生成规范

### 1. JSDoc注释标准

```javascript
/**
 * 用户认证服务
 * 处理用户登录、注册、权限验证等功能
 *
 * @param {Object} credentials - 用户凭据对象
 * @param {string} credentials.username - 用户名，必填
 * @param {string} credentials.password - 密码，必填，经过哈希处理
 * @returns {Promise<Object>} 返回认证结果
 * @returns {boolean} result.success - 是否认证成功
 * @returns {string} result.token - JWT访问令牌
 * @returns {Object} result.user - 用户信息
 * @throws {AuthenticationError} 当用户名或密码错误时抛出
 * @throws {ValidationError} 当输入参数不符合要求时抛出
 *
 * @example
 * ```javascript
 * const authService = new AuthService();
 * try {
 *   const result = await authService.authenticate({
 *     username: 'john@example.com',
 *     password: 'hashed_password'
 *   });
 *   if (result.success) {
 *     console.log('登录成功:', result.user.name);
 *   }
 * } catch (error) {
 *   console.error('认证失败:', error.message);
 * }
 * ```
 */
async function authenticate(credentials) {
  // 输入验证
  if (!credentials.username || !credentials.password) {
    throw new ValidationError('用户名和密码不能为空');
  }

  // 数据库查询用户
  const user = await this.userRepository.findByUsername(credentials.username);
  if (!user) {
    throw new AuthenticationError('用户不存在');
  }

  // 密码验证
  const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
  if (!isValidPassword) {
    throw new AuthenticationError('密码错误');
  }

  // 生成JWT令牌
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name
    }
  };
}
```

### 2. Vue组件文档

```vue
<template>
  <div class="user-profile">
    <div class="avatar">
      <img :src="avatarUrl" :alt="username" />
    </div>
    <div class="info">
      <h3>{{ displayName }}</h3>
      <p>{{ bio }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 用户资料展示组件
 * 显示用户头像、姓名和简介信息
 */

// 组件属性定义
interface Props {
  /** 用户ID，用于获取用户数据 */
  userId: string;
  /** 用户名 */
  username: string;
  /** 显示名称 */
  displayName?: string;
  /** 用户头像URL */
  avatarUrl?: string;
  /** 用户简介 */
  bio?: string;
  /** 组件大小 */
  size?: 'small' | 'medium' | 'large';
}

// 组件事件定义
interface Emits {
  /** 点击用户资料时触发 */
  (e: 'click', userId: string): void;
  /** 编辑资料时触发 */
  (e: 'edit', userId: string): void;
}

// 使用defineProps和defineEmits定义属性和事件
const props = withDefaults(defineProps<Props>(), {
  displayName: '',
  avatarUrl: '',
  bio: '',
  size: 'medium'
});

const emit = defineEmits<Emits>();

// 响应式数据
const isLoading = ref(false);
const error = ref<string | null>(null);

// 计算属性
const avatarSize = computed(() => {
  switch (props.size) {
    case 'small': return '32px';
    case 'large': return '96px';
    default: return '64px';
  }
});

// 事件处理函数
const handleClick = () => {
  emit('click', props.userId);
};

const handleEdit = () => {
  emit('edit', props.userId);
};
</script>

<style scoped>
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar img {
  width: v-bind(avatarSize);
  height: v-bind(avatarSize);
  border-radius: 50%;
  object-fit: cover;
}

.info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
}

.info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style>
```

### 3. TypeScript类型定义

```typescript
/**
 * 用户实体类型定义
 */
export interface User {
  /** 用户唯一标识符 */
  id: string;
  /** 用户名，唯一 */
  username: string;
  /** 邮箱地址 */
  email: string;
  /** 显示名称 */
  displayName: string;
  /** 用户头像URL */
  avatarUrl?: string;
  /** 用户角色 */
  role: UserRole;
  /** 账户状态 */
  status: UserStatus;
  /** 创建时间 */
  createdAt: Date;
  /** 最后更新时间 */
  updatedAt: Date;
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  /** 普通用户 */
  USER = 'user',
  /** 管理员 */
  ADMIN = 'admin',
  /** 超级管理员 */
  SUPER_ADMIN = 'super_admin'
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  /** 活跃状态 */
  ACTIVE = 'active',
  /** 未验证 */
  UNVERIFIED = 'unverified',
  /** 已禁用 */
  DISABLED = 'disabled',
  /** 已删除 */
  DELETED = 'deleted'
}

/**
 * 用户创建数据类型
 */
export interface CreateUserData {
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email: string;
  /** 密码（明文） */
  password: string;
  /** 显示名称 */
  displayName?: string;
}

/**
 * 用户更新数据类型
 */
export interface UpdateUserData {
  /** 显示名称 */
  displayName?: string;
  /** 邮箱 */
  email?: string;
  /** 头像URL */
  avatarUrl?: string;
}
```

## 代码编写规范

### 1. 错误处理

```javascript
/**
 * 数据获取函数
 * @param {string} resourceId - 资源ID
 * @returns {Promise<Object>} 资源数据
 * @throws {NotFoundError} 资源不存在
 * @throws {PermissionError} 权限不足
 */
async function fetchResource(resourceId) {
  try {
    // 参数验证
    if (!resourceId) {
      throw new ValidationError('资源ID不能为空');
    }

    // 权限检查
    const hasPermission = await checkPermission(resourceId);
    if (!hasPermission) {
      throw new PermissionError('无权访问此资源');
    }

    // 数据获取
    const resource = await this.resourceRepository.findById(resourceId);
    if (!resource) {
      throw new NotFoundError('资源不存在');
    }

    return resource;
  } catch (error) {
    // 记录错误日志
    logger.error('获取资源失败:', {
      resourceId,
      error: error.message,
      stack: error.stack
    });

    // 重新抛出错误，保持错误类型
    throw error;
  }
}
```

### 2. 异步编程

```javascript
/**
 * 批量处理用户数据
 * @param {Array<User>} users - 用户列表
 * @returns {Promise<Array<ProcessedUser>>} 处理后的用户数据
 */
async function processUsers(users) {
  const results = [];

  // 使用Promise.allSettled处理并发请求
  const promises = users.map(async (user) => {
    try {
      const processed = await processSingleUser(user);
      return { status: 'fulfilled', value: processed };
    } catch (error) {
      return { status: 'rejected', reason: error };
    }
  });

  const outcomes = await Promise.allSettled(promises);

  // 处理结果
  for (const outcome of outcomes) {
    if (outcome.status === 'fulfilled') {
      results.push(outcome.value);
    } else {
      logger.warn('用户处理失败:', outcome.reason);
      // 可以选择跳过或使用默认值
    }
  }

  return results;
}
```

## 最佳实践

### 1. 注释原则

- **功能注释**：解释做什么，而不是怎么做
- **参数注释**：说明类型、含义、约束条件
- **返回值注释**：详细说明返回的数据结构
- **异常注释**：列出可能抛出的异常类型

### 2. 命名规范

- 使用有意义的英文单词
- 遵循驼峰命名法
- 布尔变量以is/has/can开头
- 常量使用全大写加下划线

### 3. 代码组织

- 相关功能放在一起
- 公共逻辑抽取为工具函数
- 使用适当的抽象层次
- 保持函数单一职责

### 4. 性能考虑

- 避免不必要的计算
- 使用缓存优化重复操作
- 注意内存使用效率
- 合理使用异步编程

## 项目特定规则

### 文档工程项目规范

1. **中文优先**：所有注释和文档使用中文
2. **完整性要求**：每个公共API必须有完整文档
3. **示例丰富**：提供多种使用场景的示例
4. **类型严格**：使用TypeScript确保类型安全

### 微服务架构注意事项

1. **服务边界**：明确服务职责范围
2. **接口契约**：详细定义API接口规范
3. **错误处理**：统一的错误处理机制
4. **监控埋点**：关键节点添加监控代码

---

*本指南由AI辅助编写，最后更新时间：2025-11-17*
