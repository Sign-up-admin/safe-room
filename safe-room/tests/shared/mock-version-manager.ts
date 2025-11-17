/**
 * Mock数据版本管理器
 *
 * 提供Mock数据的版本控制、API同步检查和统一响应格式管理
 */

import fs from 'fs'
import path from 'path'

export interface MockVersion {
  version: string
  timestamp: string
  description: string
  changes: string[]
  checksum: string
}

export interface ApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  version: string
  schema: any
  examples: any[]
  lastUpdated: string
}

export interface MockSyncResult {
  isInSync: boolean
  version: string
  differences: {
    missing: string[]
    outdated: string[]
    extra: string[]
  }
  recommendations: string[]
}

export interface ResponseTemplate {
  success: {
    code: number
    msg: string
    data?: any
  }
  error: {
    code: number
    msg: string
    error?: any
  }
  pagination: {
    code: number
    msg: string
    data: {
      list: any[]
      pagination: {
        current: number
        size: number
        total: number
        pages: number
        hasNext: boolean
        hasPrevious: boolean
      }
    }
  }
}

/**
 * Mock版本管理器类
 */
export class MockVersionManager {
  private versions: MockVersion[] = []
  private endpoints: Map<string, ApiEndpoint> = new Map()
  private responseTemplates: ResponseTemplate
  private versionFile: string
  private endpointFile: string

  constructor(basePath: string = './tests/shared') {
    this.versionFile = path.join(basePath, 'mock-versions.json')
    this.endpointFile = path.join(basePath, 'api-endpoints.json')

    this.responseTemplates = {
      success: {
        code: 200,
        msg: 'success'
      },
      error: {
        code: 500,
        msg: 'Internal server error'
      },
      pagination: {
        code: 200,
        msg: 'success',
        data: {
          list: [],
          pagination: {
            current: 1,
            size: 10,
            total: 0,
            pages: 0,
            hasNext: false,
            hasPrevious: false
          }
        }
      }
    }

    this.loadVersions()
    this.loadEndpoints()
  }

  /**
   * 创建新版本
   */
  createVersion(description: string, changes: string[]): string {
    const version = this.generateVersionNumber()
    const newVersion: MockVersion = {
      version,
      timestamp: new Date().toISOString(),
      description,
      changes,
      checksum: this.generateChecksum(changes)
    }

    this.versions.unshift(newVersion)
    this.saveVersions()

    console.log(`Created mock version: ${version}`)
    return version
  }

  /**
   * 注册API端点
   */
  registerEndpoint(endpoint: Omit<ApiEndpoint, 'lastUpdated'>): void {
    const key = `${endpoint.method}:${endpoint.path}`
    const fullEndpoint: ApiEndpoint = {
      ...endpoint,
      lastUpdated: new Date().toISOString()
    }

    this.endpoints.set(key, fullEndpoint)
    this.saveEndpoints()

    console.log(`Registered API endpoint: ${key} (v${endpoint.version})`)
  }

  /**
   * 获取端点信息
   */
  getEndpoint(method: string, path: string): ApiEndpoint | undefined {
    const key = `${method}:${path}`
    return this.endpoints.get(key)
  }

  /**
   * 检查Mock数据与API同步状态
   */
  async checkSyncStatus(apiSpecPath?: string): Promise<MockSyncResult> {
    const differences = {
      missing: [] as string[],
      outdated: [] as string[],
      extra: [] as string[]
    }

    const recommendations: string[] = []

    try {
      // 如果提供了API规范文件，尝试加载并比较
      if (apiSpecPath && fs.existsSync(apiSpecPath)) {
        const apiSpec = JSON.parse(fs.readFileSync(apiSpecPath, 'utf8'))
        // 这里可以实现具体的API规范比较逻辑
        console.log('API spec comparison not yet implemented')
      }

      // 检查版本一致性
      const latestVersion = this.getLatestVersion()
      const version = latestVersion?.version || '0.0.0'

      // 基本检查逻辑（可以扩展）
      const isInSync = differences.missing.length === 0 && differences.outdated.length === 0

      if (!isInSync) {
        recommendations.push('Run mock data synchronization')
        recommendations.push('Update mock versions to match API changes')
      }

      return {
        isInSync,
        version,
        differences,
        recommendations
      }
    } catch (error) {
      console.error('Failed to check sync status:', error)
      return {
        isInSync: false,
        version: 'unknown',
        differences: {
          missing: ['sync-check-failed'],
          outdated: [],
          extra: []
        },
        recommendations: ['Check mock version manager configuration']
      }
    }
  }

  /**
   * 获取响应模板
   */
  getResponseTemplate(type: keyof ResponseTemplate): ResponseTemplate[keyof ResponseTemplate] {
    return JSON.parse(JSON.stringify(this.responseTemplates[type]))
  }

  /**
   * 创建标准成功响应
   */
  createSuccessResponse<T = any>(data?: T): ResponseTemplate['success'] & { data?: T } {
    const template = this.getResponseTemplate('success')
    return data !== undefined ? { ...template, data } : template
  }

  /**
   * 创建标准错误响应
   */
  createErrorResponse(code: number = 500, message: string = 'Internal server error', error?: any): ResponseTemplate['error'] {
    const template = this.getResponseTemplate('error')
    return {
      ...template,
      code,
      msg: message,
      error
    }
  }

  /**
   * 创建分页响应
   */
  createPaginationResponse<T = any>(
    list: T[],
    current: number = 1,
    size: number = 10,
    total: number = list.length
  ): ResponseTemplate['pagination'] {
    const template = this.getResponseTemplate('pagination') as ResponseTemplate['pagination']
    const pages = Math.ceil(total / size)

    return {
      ...template,
      data: {
        list,
        pagination: {
          current,
          size,
          total,
          pages,
          hasNext: current < pages,
          hasPrevious: current > 1
        }
      }
    }
  }

  /**
   * 获取最新版本
   */
  getLatestVersion(): MockVersion | undefined {
    return this.versions[0]
  }

  /**
   * 获取所有版本
   */
  getVersions(): MockVersion[] {
    return [...this.versions]
  }

  /**
   * 获取所有端点
   */
  getEndpoints(): ApiEndpoint[] {
    return Array.from(this.endpoints.values())
  }

  /**
   * 按版本过滤端点
   */
  getEndpointsByVersion(version: string): ApiEndpoint[] {
    return Array.from(this.endpoints.values()).filter(ep => ep.version === version)
  }

  private generateVersionNumber(): string {
    const now = new Date()
    const date = now.toISOString().slice(0, 10).replace(/-/g, '')
    const time = now.toISOString().slice(11, 19).replace(/:/g, '')

    // 如果今天已经有版本，从1开始递增
    const todayVersions = this.versions.filter(v =>
      v.version.startsWith(`${date}.`)
    )

    const revision = todayVersions.length + 1
    return `${date}.${revision}`
  }

  private generateChecksum(data: any): string {
    const crypto = require('crypto')
    const content = JSON.stringify(data, Object.keys(data).sort())
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 8)
  }

  private loadVersions(): void {
    try {
      if (fs.existsSync(this.versionFile)) {
        const data = JSON.parse(fs.readFileSync(this.versionFile, 'utf8'))
        this.versions = Array.isArray(data) ? data : []
      }
    } catch (error) {
      console.warn('Failed to load mock versions:', error.message)
      this.versions = []
    }
  }

  private saveVersions(): void {
    try {
      const dir = path.dirname(this.versionFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.versionFile, JSON.stringify(this.versions, null, 2))
    } catch (error) {
      console.error('Failed to save mock versions:', error.message)
    }
  }

  private loadEndpoints(): void {
    try {
      if (fs.existsSync(this.endpointFile)) {
        const data = JSON.parse(fs.readFileSync(this.endpointFile, 'utf8'))
        this.endpoints = new Map(Object.entries(data))
      }
    } catch (error) {
      console.warn('Failed to load API endpoints:', error.message)
      this.endpoints = new Map()
    }
  }

  private saveEndpoints(): void {
    try {
      const dir = path.dirname(this.endpointFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      const data = Object.fromEntries(this.endpoints)
      fs.writeFileSync(this.endpointFile, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Failed to save API endpoints:', error.message)
    }
  }
}

// ========== 全局实例 ==========

export const mockVersionManager = new MockVersionManager()

// ========== 工具函数 ==========

/**
 * 初始化Mock版本管理器
 */
export function initializeMockVersionManager(): void {
  console.log('Initializing Mock Version Manager...')

  // 创建初始版本（如果还没有）
  if (mockVersionManager.getVersions().length === 0) {
    mockVersionManager.createVersion(
      'Initial mock data version',
      [
        'Created unified mock data structure',
        'Added API response templates',
        'Implemented version tracking'
      ]
    )
  }

  console.log('Mock Version Manager initialized')
}

/**
 * 同步检查装饰器
 */
export function withSyncCheck<T extends (...args: any[]) => any>(
  fn: T,
  endpoint: string,
  method: string = 'GET'
): T {
  return ((...args: Parameters<T>) => {
    const endpointInfo = mockVersionManager.getEndpoint(method, endpoint)
    if (!endpointInfo) {
      console.warn(`Mock endpoint not registered: ${method} ${endpoint}`)
    }

    return fn(...args)
  }) as T
}

/**
 * 版本化Mock数据生成器
 */
export function createVersionedMock<T>(
  generator: () => T,
  version: string,
  metadata?: { endpoint?: string; method?: string }
): () => T {
  return () => {
    if (metadata?.endpoint && metadata?.method) {
      const endpointInfo = mockVersionManager.getEndpoint(metadata.method, metadata.endpoint)
      if (endpointInfo && endpointInfo.version !== version) {
        console.warn(`Mock version mismatch for ${metadata.method} ${metadata.endpoint}: expected ${endpointInfo.version}, got ${version}`)
      }
    }

    return generator()
  }
}

// ========== 默认导出 ==========

export default mockVersionManager
