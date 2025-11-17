/**
 * 模块Builder构建器
 * 提供链式API来构建模块数据
 */

import { AdminModule } from '../entities/module.factory'
import { faker } from '@faker-js/faker'

// ========== 模块Builder类 ==========

/**
 * 模块Builder类
 * 使用链式调用构建复杂的模块数据
 */
export class ModuleBuilder {
  private data: Partial<AdminModule> = {}

  constructor() {
    this.reset()
  }

  /**
   * 重置为默认值
   */
  reset(): this {
    this.data = {
      id: faker.number.int({ min: 1, max: 9999 }),
      name: faker.helpers.arrayElement([
        '用户管理', '课程管理', '预约管理', '订单管理', '财务管理',
        '系统设置', '权限管理', '数据统计', '日志管理', '消息管理'
      ]),
      path: `/${faker.lorem.slug()}`,
      component: `${faker.lorem.slug()}/index`,
      icon: faker.helpers.arrayElement([
        'user', 'book', 'calendar', 'shopping', 'money', 'setting', 'lock',
        'chart', 'file-text', 'message', 'dashboard', 'team', 'tool', 'database'
      ]),
      title: '',
      hidden: false,
      sort: faker.number.int({ min: 1, max: 100 }),
      parentId: undefined,
      children: [],
      status: 1,
      createTime: faker.date.recent().toISOString(),
      updateTime: faker.date.recent().toISOString()
    }
    // 设置title为name的值
    this.data.title = this.data.name
    return this
  }

  /**
   * 设置ID
   */
  withId(id: number): this {
    this.data.id = id
    return this
  }

  /**
   * 设置名称
   */
  withName(name: string): this {
    this.data.name = name
    this.data.title = name
    return this
  }

  /**
   * 设置路径
   */
  withPath(path: string): this {
    this.data.path = path
    return this
  }

  /**
   * 设置组件
   */
  withComponent(component: string): this {
    this.data.component = component
    return this
  }

  /**
   * 设置图标
   */
  withIcon(icon: string): this {
    this.data.icon = icon
    return this
  }

  /**
   * 设置标题
   */
  withTitle(title: string): this {
    this.data.title = title
    return this
  }

  /**
   * 设置重定向
   */
  withRedirect(redirect: string): this {
    this.data.redirect = redirect
    return this
  }

  /**
   * 设置是否隐藏
   */
  hidden(isHidden: boolean = true): this {
    this.data.hidden = isHidden
    return this
  }

  /**
   * 设置排序
   */
  withSort(sort: number): this {
    this.data.sort = sort
    return this
  }

  /**
   * 设置父模块ID
   */
  withParent(parentId: number): this {
    this.data.parentId = parentId
    return this
  }

  /**
   * 设置为根模块
   */
  asRoot(): this {
    this.data.parentId = undefined
    this.data.hidden = false
    return this
  }

  /**
   * 设置为子模块
   */
  asChild(parentId: number): this {
    this.data.parentId = parentId
    return this
  }

  /**
   * 设置状态
   */
  withStatus(status: number): this {
    this.data.status = status
    return this
  }

  /**
   * 设置为启用状态
   */
  enabled(): this {
    this.data.status = 1
    return this
  }

  /**
   * 设置为禁用状态
   */
  disabled(): this {
    this.data.status = 0
    return this
  }

  /**
   * 设置创建时间
   */
  withCreateTime(createTime: Date | string): this {
    this.data.createTime = createTime instanceof Date ? createTime.toISOString() : createTime
    return this
  }

  /**
   * 设置更新时间
   */
  withUpdateTime(updateTime: Date | string): this {
    this.data.updateTime = updateTime instanceof Date ? updateTime.toISOString() : updateTime
    return this
  }

  /**
   * 设置meta信息
   */
  withMeta(meta: Partial<AdminModule['meta']>): this {
    this.data.meta = {
      title: this.data.title || this.data.name || '',
      icon: this.data.icon || 'default',
      hidden: this.data.hidden || false,
      keepAlive: false,
      roles: ['admin'],
      permissions: [`${this.data.path?.replace('/', '') || 'module'}:view`],
      ...meta
    }
    return this
  }

  /**
   * 添加角色权限
   */
  withRoles(roles: string[]): this {
    if (!this.data.meta) {
      this.withMeta({})
    }
    this.data.meta!.roles = roles
    return this
  }

  /**
   * 添加权限
   */
  withPermissions(permissions: string[]): this {
    if (!this.data.meta) {
      this.withMeta({})
    }
    this.data.meta!.permissions = permissions
    return this
  }

  /**
   * 设置为可缓存
   */
  keepAlive(enabled: boolean = true): this {
    if (!this.data.meta) {
      this.withMeta({})
    }
    this.data.meta!.keepAlive = enabled
    return this
  }

  /**
   * 添加子模块
   */
  addChild(child: AdminModule): this {
    if (!this.data.children) {
      this.data.children = []
    }
    this.data.children.push(child)
    return this
  }

  /**
   * 设置子模块列表
   */
  withChildren(children: AdminModule[]): this {
    this.data.children = children
    return this
  }

  /**
   * 设置为用户管理模块
   */
  asUserManagement(): this {
    return this
      .withName('用户管理')
      .withPath('/users')
      .withComponent('users/index')
      .withIcon('user')
      .withPermissions(['user:view'])
      .withRoles(['admin', 'manager'])
  }

  /**
   * 设置为课程管理模块
   */
  asCourseManagement(): this {
    return this
      .withName('课程管理')
      .withPath('/courses')
      .withComponent('courses/index')
      .withIcon('book')
      .withPermissions(['course:view'])
      .withRoles(['admin', 'manager'])
  }

  /**
   * 设置为系统设置模块
   */
  asSystemSettings(): this {
    return this
      .withName('系统设置')
      .withPath('/settings')
      .withComponent('settings/index')
      .withIcon('setting')
      .withPermissions(['system:view'])
      .withRoles(['admin'])
  }

  /**
   * 设置为数据统计模块
   */
  asStatistics(): this {
    return this
      .withName('数据统计')
      .withPath('/statistics')
      .withComponent('statistics/index')
      .withIcon('chart')
      .withPermissions(['reports:view'])
      .withRoles(['admin', 'manager'])
  }

  /**
   * 设置为仪表板模块
   */
  asDashboard(): this {
    return this
      .withName('首页')
      .withPath('/dashboard')
      .withComponent('dashboard/index')
      .withIcon('dashboard')
      .keepAlive(true)
      .withPermissions(['dashboard:view'])
      .withRoles(['admin', 'manager', 'user'])
  }

  /**
   * 设置为列表页面子模块
   */
  asListPage(): this {
    return this
      .withName('列表')
      .withPath('list')
      .withComponent('list')
      .hidden(false)
      .withSort(1)
  }

  /**
   * 设置为创建页面子模块
   */
  asCreatePage(): this {
    return this
      .withName('新增')
      .withPath('create')
      .withComponent('create')
      .hidden(false)
      .withSort(2)
  }

  /**
   * 设置为编辑页面子模块
   */
  asEditPage(): this {
    return this
      .withName('编辑')
      .withPath('edit')
      .withComponent('edit')
      .hidden(true)
      .withSort(3)
  }

  /**
   * 设置为详情页面子模块
   */
  asDetailPage(): this {
    return this
      .withName('详情')
      .withPath('detail')
      .withComponent('detail')
      .hidden(true)
      .withSort(4)
  }

  /**
   * 设置为随机模块
   */
  randomize(): this {
    const moduleTypes = [
      { name: '用户管理', path: '/users', component: 'users/index', icon: 'user' },
      { name: '课程管理', path: '/courses', component: 'courses/index', icon: 'book' },
      { name: '预约管理', path: '/bookings', component: 'bookings/index', icon: 'calendar' },
      { name: '订单管理', path: '/orders', component: 'orders/index', icon: 'shopping' },
      { name: '财务管理', path: '/finance', component: 'finance/index', icon: 'money' },
      { name: '系统设置', path: '/settings', component: 'settings/index', icon: 'setting' },
      { name: '权限管理', path: '/permissions', component: 'permissions/index', icon: 'lock' },
      { name: '数据统计', path: '/statistics', component: 'statistics/index', icon: 'chart' }
    ]

    const randomType = faker.helpers.arrayElement(moduleTypes)

    return this
      .withId(faker.number.int({ min: 1, max: 9999 }))
      .withName(randomType.name)
      .withPath(randomType.path)
      .withComponent(randomType.component)
      .withIcon(randomType.icon)
      .withSort(faker.number.int({ min: 1, max: 100 }))
      .withStatus(faker.helpers.arrayElement([0, 1]))
      .hidden(faker.datatype.boolean())
      .withCreateTime(faker.date.past())
      .withUpdateTime(faker.date.recent())
  }

  /**
   * 批量设置属性
   */
  withOverrides(overrides: Partial<AdminModule>): this {
    Object.assign(this.data, overrides)
    return this
  }

  /**
   * 从现有模块复制
   */
  fromModule(module: Partial<AdminModule>): this {
    this.data = { ...module }
    return this
  }

  /**
   * 获取当前数据（用于调试）
   */
  getData(): Partial<AdminModule> {
    return { ...this.data }
  }

  /**
   * 构建最终模块对象
   */
  build(): AdminModule {
    // 确保必要字段存在
    if (!this.data.id) {
      this.data.id = faker.number.int({ min: 1, max: 9999 })
    }
    if (!this.data.name) {
      this.data.name = faker.lorem.words({ min: 1, max: 2 })
    }
    if (!this.data.path) {
      this.data.path = `/${faker.lorem.slug()}`
    }
    if (!this.data.component) {
      this.data.component = `${faker.lorem.slug()}/index`
    }
    if (!this.data.icon) {
      this.data.icon = 'default'
    }
    if (!this.data.title) {
      this.data.title = this.data.name
    }
    if (!this.data.createTime) {
      this.data.createTime = faker.date.recent().toISOString()
    }

    // 确保meta存在
    if (!this.data.meta) {
      this.withMeta({})
    }

    return this.data as AdminModule
  }

  /**
   * 构建完整的模块树
   */
  buildWithChildren(childBuilders: ModuleBuilder[]): AdminModule {
    const module = this.build()
    module.children = childBuilders.map(builder => builder.build())
    return module
  }

  /**
   * 克隆当前Builder
   */
  clone(): ModuleBuilder {
    const newBuilder = new ModuleBuilder()
    newBuilder.data = { ...this.data }
    return newBuilder
  }
}

// ========== 便捷构建函数 ==========

/**
 * 创建模块Builder实例
 */
export function moduleBuilder(): ModuleBuilder {
  return new ModuleBuilder()
}

/**
 * 快速构建模块
 */
export function buildModule(overrides: Partial<AdminModule> = {}): AdminModule {
  return new ModuleBuilder().withOverrides(overrides).build()
}

/**
 * 构建用户管理模块
 */
export function buildUserManagement(overrides: Partial<AdminModule> = {}): AdminModule {
  return new ModuleBuilder().asUserManagement().withOverrides(overrides).build()
}

/**
 * 构建课程管理模块
 */
export function buildCourseManagement(overrides: Partial<AdminModule> = {}): AdminModule {
  return new ModuleBuilder().asCourseManagement().withOverrides(overrides).build()
}

/**
 * 构建仪表板模块
 */
export function buildDashboard(overrides: Partial<AdminModule> = {}): AdminModule {
  return new ModuleBuilder().asDashboard().withOverrides(overrides).build()
}

/**
 * 构建导航菜单树
 */
export function buildNavigationMenu(): AdminModule[] {
  return [
    new ModuleBuilder().asDashboard().withId(1).withSort(1).build(),
    new ModuleBuilder().asUserManagement().withId(2).withSort(2).build(),
    new ModuleBuilder().asCourseManagement().withId(3).withSort(3).build(),
    new ModuleBuilder().asStatistics().withId(4).withSort(4).build(),
    new ModuleBuilder().asSystemSettings().withId(5).withSort(10).build()
  ]
}

/**
 * 构建随机模块
 */
export function buildRandomModule(overrides: Partial<AdminModule> = {}): AdminModule {
  return new ModuleBuilder().randomize().withOverrides(overrides).build()
}
