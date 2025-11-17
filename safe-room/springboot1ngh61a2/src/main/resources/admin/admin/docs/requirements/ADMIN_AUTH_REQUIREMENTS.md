# 权限管理系统需求文档（Admin Authorization v1.0）

> 版本：v1.0
> 更新日期：2025-11-16（基于现有代码实现）
> 适用文件：`src/constants/menu.ts`、`src/utils/utils.ts`
> 关联组件：所有需要权限控制的页面和组件

---

## 0. 设计关键词

角色隔离 · 权限精细 · 配置驱动 · 安全可控 · 动态验证

> 目标：实现基于角色的细粒度权限控制，确保不同用户仅能访问授权的资源和功能。

---

## 1. 权限系统架构

### 1.1 核心组件

| 组件 | 文件位置 | 功能说明 |
| --- | --- | --- |
| **菜单配置** | `src/constants/menu.ts` | 定义所有菜单项和权限点 |
| **权限函数** | `src/utils/utils.ts::isAuth()` | 权限检查核心逻辑 |
| **路由守卫** | `src/router/index.ts` | 路由级别权限验证 |
| **组件权限** | 各Vue组件 | UI级别权限控制 |

### 1.2 权限模型

**三层权限结构**：
1. **角色层**：Administrator（管理员）、Coach（教练）、CustomerService（客服）
2. **模块层**：用户管理、课程管理、会员管理等业务模块
3. **操作层**：Add（新增）、Edit（编辑）、Delete（删除）、View（查看）等具体操作

---

## 2. 菜单配置结构

### 2.1 配置格式

```typescript
export const MENU_CONFIG: MenuRole[] = [
  {
    roleName: 'Administrator', // 角色名称
    backMenu: [ // 后台菜单配置
      {
        menu: 'User Management', // 菜单组名称
        child: [ // 子菜单项
          {
            menu: 'User', // 菜单项名称
            tableName: 'yonghu', // 对应的表名/模块标识
            buttons: ['Add', 'View', 'Edit', 'Delete'], // 允许的操作
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Home Total'], // 所有可能的操作
            // ... 其他配置
          }
        ]
      }
    ],
    frontMenu: [...] // 前台菜单（可选）
  }
]
```

### 2.2 权限键说明

| 权限键 | 说明 | 使用场景 |
| --- | --- | --- |
| `Add` | 新增权限 | 新增按钮、保存操作 |
| `Edit` | 编辑权限 | 编辑按钮、更新操作 |
| `Delete` | 删除权限 | 删除按钮、批量删除 |
| `View` | 查看权限 | 查看详情、列表显示 |
| `Home Total` | 首页统计 | 仪表盘数据卡片显示 |
| `Home Statistics` | 首页图表 | 仪表盘图表显示 |
| `Export` | 导出权限 | 数据导出功能 |

### 2.3 角色权限配置

**Administrator（管理员）**：
- 拥有所有模块的完整权限
- 可管理其他管理员账号
- 可查看所有操作日志

**Coach（教练）**：
- 仅能管理自己的课程和预约
- 可查看相关会员信息
- 权限范围受限于个人数据

**CustomerService（客服）**：
- 主要查看权限，部分编辑权限
- 可管理反馈和消息
- 无删除权限

---

## 3. 权限检查机制

### 3.1 isAuth函数详解

**函数签名**：
```typescript
function isAuth(tableName: string, key: string): boolean
```

**参数说明**：
- `tableName`: 模块标识（如'yonghu', 'jianshenkecheng'）
- `key`: 权限键（如'Add', 'Edit', 'Delete'）

**实现逻辑**：
```typescript
export function isAuth(tableName: string, key: string): boolean {
  // 1. 获取当前用户角色
  let role = storage.get('role')
  if (!role) role = 'Administrator'

  // 2. 获取菜单配置
  const menus = menu.list()

  // 3. 查找匹配的角色配置
  for (let i = 0; i < menus.length; i++) {
    if (menus[i]?.roleName === role) {
      // 4. 遍历后台菜单
      for (let j = 0; j < (menus[i]?.backMenu?.length || 0); j++) {
        for (let k = 0; k < (menus[i]?.backMenu?.[j]?.child?.length || 0); k++) {
          // 5. 匹配表名
          if (tableName === menus[i]?.backMenu?.[j]?.child?.[k]?.tableName) {
            // 6. 检查权限键是否存在
            const buttons = menus[i]?.backMenu?.[j]?.child?.[k]?.buttons?.join(',') || ''
            return buttons.indexOf(key) !== -1 || false
          }
        }
      }
    }
  }
  return false
}
```

### 3.2 使用示例

**按钮权限控制**：
```vue
<template>
  <!-- 新增按钮 - 需要Add权限 -->
  <el-button v-if="isAuth('yonghu', 'Add')" type="primary" @click="openForm()">
    新增
  </el-button>

  <!-- 编辑按钮 - 需要Edit权限 -->
  <el-button v-if="isAuth('yonghu', 'Edit')" @click="editRow(row)">
    编辑
  </el-button>

  <!-- 删除按钮 - 需要Delete权限 -->
  <el-button v-if="isAuth('yonghu', 'Delete')" type="danger" @click="deleteRow(row)">
    删除
  </el-button>
</template>
```

**组件级别权限**：
```vue
<script setup lang="ts">
// 计算属性：权限状态
const permissions = computed(() => ({
  create: isAuth(props.moduleKey, 'Add'),
  update: isAuth(props.moduleKey, 'Edit'),
  remove: isAuth(props.moduleKey, 'Delete'),
  view: isAuth(props.moduleKey, 'View'),
}))
</script>
```

---

## 4. 数据隔离机制

### 4.1 教练角色数据隔离

**实现方式**：通过session存储的username字段过滤数据

```java
// 后端Controller示例
@RequestMapping("/page")
public R page(@RequestParam Map<String, Object> params, JianshenkechengEntity entity,
              HttpServletRequest request) {
    String tableName = request.getSession().getAttribute("tableName").toString();
    if(tableName.equals("jianshenjiaolian")) {
        // 教练角色：仅能看到自己的课程
        entity.setJiaoliangonghao((String)request.getSession().getAttribute("username"));
    }
    // ... 查询逻辑
}
```

### 4.2 前端路由守卫

```typescript
// router/index.ts
const router = createRouter({
  // ... 路由配置
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = storage.get('token')
  if (!token && to.path !== '/login') {
    next('/login')
    return
  }

  // 检查路由权限（如果配置了meta.auth）
  if (to.meta?.auth && !isAuth(to.meta.auth.table, to.meta.auth.key)) {
    ElMessage.warning('无权限访问')
    next(false)
    return
  }

  next()
})
```

---

## 5. 安全考虑

### 5.1 前后端双重验证

- **前端验证**：UI隐藏、用户体验优化
- **后端验证**：接口级别强制检查，防止绕过

### 5.2 Token安全

- **自动续期**：接口请求时自动检查过期
- **过期处理**：跳转登录页，清空本地存储
- **请求拦截**：统一添加认证头

### 5.3 操作审计

所有关键操作自动记录到 `operation_log` 表：
- 数据增删改操作
- 权限相关的配置变更
- 登录/登出记录

---

## 6. 配置管理

### 6.1 权限配置更新流程

1. **修改配置**：编辑 `src/constants/menu.ts`
2. **测试验证**：检查各角色权限是否正确
3. **代码审查**：确保配置变更合理
4. **部署上线**：重新构建发布

### 6.2 动态权限扩展（预留）

未来可扩展为数据库驱动的动态权限：
- 权限表：存储角色-模块-操作关系
- 管理界面：可视化配置权限
- 缓存机制：Redis缓存权限数据

---

## 7. 测试策略

### 7.1 权限测试用例

| 测试场景 | 预期结果 | 测试方法 |
| --- | --- | --- |
| 管理员访问所有功能 | 全部功能可用 | 登录管理员账号，检查各模块权限 |
| 教练访问个人数据 | 仅个人相关数据可见 | 登录教练账号，验证数据隔离 |
| 客服查看权限 | 查看功能正常，编辑受限 | 登录客服账号，检查操作按钮 |
| 无权限功能隐藏 | 按钮/菜单不显示 | 使用无权限账号测试 |

### 7.2 安全测试

- **越权访问测试**：尝试直接访问无权限接口
- **Token过期测试**：模拟Token过期场景
- **数据隔离测试**：验证不同角色数据可见性

---

## 8. 验收标准

| 维度 | 标准 | 验收方式 |
| --- | --- | --- |
| **功能完整性** | 所有角色权限正确配置和验证 | 角色切换测试 |
| **安全合规** | 无越权访问，前后端验证一致 | 安全测试 |
| **用户体验** | 无权限功能优雅隐藏 | UI验收 |
| **可维护性** | 权限配置清晰，易于修改 | 代码审查 |

---

## 9. 后续优化

- [ ] **动态权限管理**：数据库驱动权限配置
- [ ] **细粒度权限**：字段级别/数据行级别权限控制
- [ ] **权限缓存**：提高权限检查性能
- [ ] **权限审计**：记录权限变更历史
- [ ] **角色继承**：支持角色层级和权限继承

---
