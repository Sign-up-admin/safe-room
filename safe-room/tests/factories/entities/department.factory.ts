/**
 * Admin部门工厂
 * 创建和管理部门数据
 */

import {
  EnhancedBaseFactory,
  createRequiredFieldsValidator,
  createTypeValidator,
  createBaseValidator
} from '../base/base-factory'

// ========== 类型定义 ==========

/**
 * Admin部门接口
 */
export interface AdminDepartment {
  id: number
  name: string
  code: string
  parentId?: number
  leader: string
  phone?: string
  email?: string
  status: number // 0: disabled, 1: enabled
  sort: number
  createTime: string
  updateTime?: string
  description?: string
  memberCount: number
  level: number // 部门层级
  path: string // 部门路径，如：1.2.3
}

/**
 * 部门预设数据
 */
export const DEPARTMENT_PRESETS = {
  company: {
    name: '公司总部',
    code: 'company',
    description: '公司总部部门',
    level: 1,
    status: 1,
    memberCount: 0
  },
  tech: {
    name: '技术部',
    code: 'tech',
    description: '负责产品开发和技术支持',
    level: 2,
    status: 1,
    memberCount: 0
  },
  product: {
    name: '产品部',
    code: 'product',
    description: '负责产品规划和设计',
    level: 2,
    status: 1,
    memberCount: 0
  },
  operation: {
    name: '运营部',
    code: 'operation',
    description: '负责运营和市场推广',
    level: 2,
    status: 1,
    memberCount: 0
  },
  sales: {
    name: '销售部',
    code: 'sales',
    description: '负责销售和客户关系管理',
    level: 2,
    status: 1,
    memberCount: 0
  },
  finance: {
    name: '财务部',
    code: 'finance',
    description: '负责财务管理和会计核算',
    level: 2,
    status: 1,
    memberCount: 0
  },
  hr: {
    name: '人事部',
    code: 'hr',
    description: '负责人事管理和招聘工作',
    level: 2,
    status: 1,
    memberCount: 0
  }
}

/**
 * Admin部门工厂类
 */
export class AdminDepartmentFactory extends EnhancedBaseFactory<AdminDepartment> {
  private readonly departmentNames = [
    '技术部', '产品部', '运营部', '销售部', '财务部', '人事部',
    '客服部', '市场部', '设计部', '测试部', '运维部', '项目部'
  ]

  private readonly departmentCodes = [
    'tech', 'product', 'operation', 'sales', 'finance', 'hr',
    'support', 'marketing', 'design', 'qa', 'ops', 'project'
  ]

  private departmentCounter = 0

  constructor() {
    super({
      validator: createBaseValidator('adminDepartment', (department: AdminDepartment) => {
        const errors: string[] = []
        const warnings: string[] = []

        // 基础字段验证
        if (!department.name || department.name.trim().length === 0) {
          errors.push('部门名称不能为空')
        }
        if (!department.code || department.code.trim().length === 0) {
          errors.push('部门代码不能为空')
        }
        if (!department.leader || department.leader.trim().length === 0) {
          errors.push('部门负责人不能为空')
        }
        if (department.status !== 0 && department.status !== 1) {
          errors.push('部门状态必须是0或1')
        }
        if (department.level < 1) {
          errors.push('部门层级必须大于0')
        }
        if (department.memberCount < 0) {
          warnings.push('成员数量不能为负数')
        }

        // 路径验证
        if (!department.path || department.path.trim().length === 0) {
          errors.push('部门路径不能为空')
        } else {
          // 验证路径格式（数字.数字.数字）
          const pathRegex = /^\d+(\.\d+)*$/
          if (!pathRegex.test(department.path)) {
            errors.push('部门路径格式无效，应为数字.数字格式')
          }
        }

        // 邮箱格式验证
        if (department.email && !department.email.includes('@')) {
          warnings.push('邮箱格式可能无效')
        }

        return { isValid: errors.length === 0, errors, warnings }
      })
    })
  }

  /**
   * 创建部门
   */
  create(overrides: Partial<AdminDepartment> = {}): AdminDepartment {
    const id = overrides.id ?? this.nextId()
    const createdAt = overrides.createTime ? new Date(overrides.createTime) : this.randomDate()

    // 如果没有指定基本信息，随机生成
    const index = this.randomNumber(0, this.departmentNames.length - 1)
    const name = overrides.name ?? this.departmentNames[index]
    const code = overrides.code ?? this.departmentCodes[index]

    // 生成路径（如果没有指定parentId，则为根部门）
    const path = overrides.path ?? (overrides.parentId ? `${overrides.parentId}.${id}` : `${id}`)
    const level = overrides.level ?? (overrides.parentId ? 2 : 1)

    return this.mergeDefaults({
      id,
      name,
      code,
      parentId: undefined,
      leader: this.randomName(),
      phone: this.randomPhone(),
      email: `${code}@company.com`,
      status: this.randomFromArray([0, 1]),
      sort: this.randomNumber(1, 100),
      createTime: createdAt.toISOString(),
      updateTime: this.randomBoolean() ? this.randomDate(createdAt).toISOString() : undefined,
      description: this.generateDepartmentDescription(name),
      memberCount: this.randomNumber(0, 50),
      level,
      path
    }, overrides)
  }

  /**
   * 生成部门描述
   */
  private generateDepartmentDescription(name: string): string {
    const descriptions: Record<string, string> = {
      '技术部': '负责产品开发和技术支持工作',
      '产品部': '负责产品规划、设计和需求分析',
      '运营部': '负责运营策略制定和执行',
      '销售部': '负责销售目标达成和客户关系维护',
      '财务部': '负责财务管理和会计核算工作',
      '人事部': '负责人事管理和招聘培训工作',
      '客服部': '负责客户服务和技术支持',
      '市场部': '负责市场推广和品牌建设',
      '设计部': '负责产品界面和用户体验设计',
      '测试部': '负责产品质量 assurance 和测试',
      '运维部': '负责系统运维和基础设施管理',
      '项目部': '负责项目管理和协调工作'
    }

    return descriptions[name] || `负责${name}相关业务工作`
  }

  /**
   * 创建预设部门
   */
  createPresetDepartment(preset: keyof typeof DEPARTMENT_PRESETS, overrides: Partial<AdminDepartment> = {}): AdminDepartment {
    return this.create({
      ...DEPARTMENT_PRESETS[preset],
      ...overrides
    })
  }

  /**
   * 创建根部门（公司总部）
   */
  createRootDepartment(overrides: Partial<AdminDepartment> = {}): AdminDepartment {
    return this.createPresetDepartment('company', {
      id: 1,
      path: '1',
      ...overrides
    })
  }

  /**
   * 创建子部门
   */
  createSubDepartment(parentId: number, parentPath: string, overrides: Partial<AdminDepartment> = {}): AdminDepartment {
    const id = overrides.id ?? this.nextId()
    return this.create({
      parentId,
      path: `${parentPath}.${id}`,
      level: this.calculateLevel(parentPath) + 1,
      ...overrides
    })
  }

  /**
   * 计算部门层级
   */
  private calculateLevel(path: string): number {
    return path.split('.').length
  }

  /**
   * 创建技术部门
   */
  createTechDepartment(parentId?: number, parentPath?: string, overrides: Partial<AdminDepartment> = {}): AdminDepartment {
    const baseOverrides = parentId && parentPath
      ? { parentId, path: `${parentPath}.${this.nextId()}`, level: this.calculateLevel(parentPath) + 1 }
      : {}

    return this.createPresetDepartment('tech', {
      ...baseOverrides,
      ...overrides
    })
  }

  /**
   * 创建产品部门
   */
  createProductDepartment(parentId?: number, parentPath?: string, overrides: Partial<AdminDepartment> = {}): AdminDepartment {
    const baseOverrides = parentId && parentPath
      ? { parentId, path: `${parentPath}.${this.nextId()}`, level: this.calculateLevel(parentPath) + 1 }
      : {}

    return this.createPresetDepartment('product', {
      ...baseOverrides,
      ...overrides
    })
  }

  /**
   * 创建运营部门
   */
  createOperationDepartment(parentId?: number, parentPath?: string, overrides: Partial<AdminDepartment> = {}): AdminDepartment {
    const baseOverrides = parentId && parentPath
      ? { parentId, path: `${parentPath}.${this.nextId()}`, level: this.calculateLevel(parentPath) + 1 }
      : {}

    return this.createPresetDepartment('operation', {
      ...baseOverrides,
      ...overrides
    })
  }

  /**
   * 创建完整的部门结构
   */
  createCompleteDepartmentStructure(): AdminDepartment[] {
    const departments: AdminDepartment[] = []

    // 创建根部门
    const root = this.createRootDepartment()
    departments.push(root)

    // 创建二级部门
    const secondaryDepartments = [
      { preset: 'tech' as const, children: ['design', 'qa', 'ops'] },
      { preset: 'product' as const, children: [] },
      { preset: 'operation' as const, children: ['marketing'] },
      { preset: 'sales' as const, children: [] },
      { preset: 'finance' as const, children: [] },
      { preset: 'hr' as const, children: [] }
    ]

    let currentId = 2

    secondaryDepartments.forEach(({ preset, children }) => {
      const dept = this.createPresetDepartment(preset, {
        id: currentId++,
        path: `${root.id}.${currentId - 1}`,
        level: 2
      })
      departments.push(dept)

      // 创建三级部门
      children.forEach(childCode => {
        const childDept = this.create({
          id: currentId++,
          name: childCode === 'design' ? '设计部' :
                childCode === 'qa' ? '测试部' :
                childCode === 'ops' ? '运维部' : '市场部',
          code: childCode,
          parentId: dept.id,
          path: `${dept.path}.${currentId - 1}`,
          level: 3,
          description: this.generateDepartmentDescription(
            childCode === 'design' ? '设计部' :
            childCode === 'qa' ? '测试部' :
            childCode === 'ops' ? '运维部' : '市场部'
          )
        })
        departments.push(childDept)
      })
    })

    return departments
  }

  /**
   * 创建扁平化的部门列表（用于测试）
   */
  createFlatDepartmentList(count: number): AdminDepartment[] {
    const departments: AdminDepartment[] = []

    for (let i = 0; i < count; i++) {
      const dept = this.create({
        id: i + 1,
        path: `${i + 1}`,
        level: 1
      })
      departments.push(dept)
    }

    return departments
  }

  /**
   * 构建部门树结构
   */
  buildDepartmentTree(departments: AdminDepartment[]): AdminDepartment[] {
    const departmentMap = new Map<number, AdminDepartment>()
    const rootDepartments: AdminDepartment[] = []

    // 建立ID映射
    departments.forEach(department => {
      departmentMap.set(department.id, { ...department, memberCount: department.memberCount || 0 })
    })

    // 构建树结构
    departments.forEach(department => {
      const departmentWithChildren = departmentMap.get(department.id)!
      if (department.parentId && departmentMap.has(department.parentId)) {
        const parent = departmentMap.get(department.parentId)!
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(departmentWithChildren)

        // 更新父部门的成员数量
        parent.memberCount += departmentWithChildren.memberCount
      } else {
        rootDepartments.push(departmentWithChildren)
      }
    })

    return rootDepartments
  }

  /**
   * 获取部门的完整路径名称
   */
  getDepartmentFullPath(department: AdminDepartment, allDepartments: AdminDepartment[]): string {
    const pathSegments: string[] = []
    let current: AdminDepartment | undefined = department

    while (current) {
      pathSegments.unshift(current.name)
      current = current.parentId ? allDepartments.find(d => d.id === current!.parentId) : undefined
    }

    return pathSegments.join(' > ')
  }

  /**
   * 按层级筛选部门
   */
  filterByLevel(departments: AdminDepartment[], level: number): AdminDepartment[] {
    return departments.filter(department => department.level === level)
  }

  /**
   * 获取子部门
   */
  getChildDepartments(departments: AdminDepartment[], parentId: number): AdminDepartment[] {
    return departments.filter(department => department.parentId === parentId)
  }

  /**
   * 计算部门总成员数（包括子部门）
   */
  calculateTotalMemberCount(department: AdminDepartment, allDepartments: AdminDepartment[]): number {
    let total = department.memberCount

    const childDepartments = this.getChildDepartments(allDepartments, department.id)
    childDepartments.forEach(child => {
      total += this.calculateTotalMemberCount(child, allDepartments)
    })

    return total
  }

  /**
   * 验证部门结构
   */
  validateDepartmentStructure(departments: AdminDepartment[]): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []
    const idMap = new Map<number, AdminDepartment>()
    const pathMap = new Map<string, AdminDepartment>()

    // 建立映射
    departments.forEach(dept => {
      idMap.set(dept.id, dept)
      pathMap.set(dept.path, dept)
    })

    departments.forEach(dept => {
      // 检查父部门是否存在
      if (dept.parentId && !idMap.has(dept.parentId)) {
        errors.push(`部门 ${dept.name} (ID: ${dept.id}) 的父部门不存在`)
      }

      // 检查路径一致性
      const expectedPath = this.buildExpectedPath(dept, idMap)
      if (dept.path !== expectedPath) {
        warnings.push(`部门 ${dept.name} 的路径应为 ${expectedPath}，当前为 ${dept.path}`)
      }

      // 检查层级一致性
      const expectedLevel = dept.path.split('.').length
      if (dept.level !== expectedLevel) {
        warnings.push(`部门 ${dept.name} 的层级应为 ${expectedLevel}，当前为 ${dept.level}`)
      }
    })

    return { isValid: errors.length === 0, errors, warnings }
  }

  /**
   * 构建期望的路径
   */
  private buildExpectedPath(department: AdminDepartment, idMap: Map<number, AdminDepartment>): string {
    const pathSegments: number[] = []
    let current: AdminDepartment | undefined = department

    while (current) {
      pathSegments.unshift(current.id)
      current = current.parentId ? idMap.get(current.parentId) : undefined
    }

    return pathSegments.join('.')
  }
}

// ========== 全局工厂实例 ==========

export const adminDepartmentFactory = new AdminDepartmentFactory()

// ========== 便捷创建函数 ==========

/**
 * 创建单个部门
 */
export function createAdminDepartment(overrides: Partial<AdminDepartment> = {}): AdminDepartment {
  return adminDepartmentFactory.create(overrides)
}

/**
 * 创建多个部门
 */
export function createAdminDepartments(count: number, overrides: Partial<AdminDepartment> = {}): AdminDepartment[] {
  return adminDepartmentFactory.createMany(count, overrides)
}

/**
 * 创建完整的部门结构
 */
export function createCompleteDepartmentStructure(): AdminDepartment[] {
  return adminDepartmentFactory.createCompleteDepartmentStructure()
}

/**
 * 创建技术部门
 */
export function createTechDepartment(parentId?: number, parentPath?: string, overrides: Partial<AdminDepartment> = {}): AdminDepartment {
  return adminDepartmentFactory.createTechDepartment(parentId, parentPath, overrides)
}

/**
 * 创建产品部门
 */
export function createProductDepartment(parentId?: number, parentPath?: string, overrides: Partial<AdminDepartment> = {}): AdminDepartment {
  return adminDepartmentFactory.createProductDepartment(parentId, parentPath, overrides)
}
