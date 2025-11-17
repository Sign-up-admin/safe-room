/**
 * Mock数据同步验证工具
 * 用于验证Mock数据与实际API接口格式的一致性
 */

import type {
  ApiResponse,
  PageApiResponse,
  ErrorResponse,
  PageResult,
  validateApiResponse,
  validatePageResult,
  validatePageApiResponse
} from '../types/api-response.types'

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  details?: any
}

/**
 * API定义接口（用于对比Mock数据）
 */
export interface ApiDefinition {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  responseType: 'single' | 'list' | 'page'
  dataStructure?: Record<string, any>
  requiredFields?: string[]
}

/**
 * Mock数据验证器类
 */
export class MockDataValidator {

  /**
   * 验证API响应格式
   */
  static validateApiResponse(response: any, apiDef?: ApiDefinition): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 基础格式验证
    if (!validateApiResponse(response)) {
      errors.push('Response does not match ApiResponse interface')
      return { isValid: false, errors, warnings }
    }

    // 状态码验证
    if (typeof response.code !== 'number') {
      errors.push('Response code must be a number')
    } else if (response.code !== 0 && response.code !== 200) {
      // 检查是否为业务错误码
      if (response.code > 0) {
        warnings.push(`Business error code ${response.code} detected`)
      }
    }

    // 消息验证
    if (!response.msg || typeof response.msg !== 'string') {
      errors.push('Response msg must be a non-empty string')
    }

    // 根据API定义验证数据结构
    if (apiDef && response.data) {
      const dataValidation = this.validateDataStructure(response.data, apiDef)
      errors.push(...dataValidation.errors)
      warnings.push(...dataValidation.warnings)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 验证分页API响应格式
   */
  static validatePageApiResponse(response: any, apiDef?: ApiDefinition): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 基础API响应验证
    const apiValidation = this.validateApiResponse(response, apiDef)
    errors.push(...apiValidation.errors)
    warnings.push(...apiValidation.warnings)

    if (!apiValidation.isValid) {
      return { isValid: false, errors, warnings }
    }

    // 分页数据验证
    if (!validatePageApiResponse(response)) {
      errors.push('Response does not match PageApiResponse interface')
      return { isValid: false, errors, warnings }
    }

    const pageData = response.data

    // 分页参数验证
    if (pageData.page && typeof pageData.page !== 'number') {
      warnings.push('page should be a number')
    }

    if (pageData.limit && typeof pageData.limit !== 'number') {
      warnings.push('limit should be a number')
    }

    if (pageData.total !== undefined && typeof pageData.total !== 'number') {
      errors.push('total must be a number')
    }

    // 分页逻辑验证
    if (pageData.page && pageData.limit && pageData.total) {
      const expectedPages = Math.ceil(pageData.total / pageData.limit)
      if (pageData.pages && pageData.pages !== expectedPages) {
        warnings.push(`pages (${pageData.pages}) does not match calculated value (${expectedPages})`)
      }

      if (pageData.hasNext !== undefined && pageData.hasPrevious !== undefined) {
        const calculatedHasNext = pageData.page < expectedPages
        const calculatedHasPrevious = pageData.page > 1

        if (pageData.hasNext !== calculatedHasNext) {
          warnings.push(`hasNext (${pageData.hasNext}) does not match calculated value (${calculatedHasNext})`)
        }

        if (pageData.hasPrevious !== calculatedHasPrevious) {
          warnings.push(`hasPrevious (${pageData.hasPrevious}) does not match calculated value (${calculatedHasPrevious})`)
        }
      }
    }

    // 列表数据验证
    if (Array.isArray(pageData.list)) {
      pageData.list.forEach((item: any, index: number) => {
        if (!item || typeof item !== 'object') {
          errors.push(`List item at index ${index} is not a valid object`)
        } else if (!item.id) {
          warnings.push(`List item at index ${index} is missing id field`)
        }
      })
    } else {
      errors.push('list must be an array')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 验证数据结构是否符合API定义
   */
  static validateDataStructure(data: any, apiDef: ApiDefinition): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!apiDef.dataStructure && !apiDef.requiredFields) {
      return { isValid: true, errors, warnings }
    }

    // 检查必需字段
    if (apiDef.requiredFields) {
      apiDef.requiredFields.forEach(field => {
        if (!(field in data)) {
          errors.push(`Required field '${field}' is missing`)
        }
      })
    }

    // 检查数据结构
    if (apiDef.dataStructure) {
      const structureValidation = this.validateObjectStructure(data, apiDef.dataStructure)
      errors.push(...structureValidation.errors)
      warnings.push(...structureValidation.warnings)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 验证对象结构
   */
  static validateObjectStructure(obj: any, structure: Record<string, any>): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    Object.entries(structure).forEach(([key, expectedType]) => {
      const actualValue = obj[key]

      if (actualValue === undefined || actualValue === null) {
        if (expectedType.endsWith('?')) {
          // 可选字段
          return
        } else {
          errors.push(`Required field '${key}' is missing`)
          return
        }
      }

      const cleanType = expectedType.replace('?', '')
      const actualType = typeof actualValue

      // 基础类型检查
      if (cleanType === 'string' && actualType !== 'string') {
        errors.push(`Field '${key}' should be string, got ${actualType}`)
      } else if (cleanType === 'number' && actualType !== 'number') {
        errors.push(`Field '${key}' should be number, got ${actualType}`)
      } else if (cleanType === 'boolean' && actualType !== 'boolean') {
        errors.push(`Field '${key}' should be boolean, got ${actualType}`)
      } else if (cleanType === 'array' && !Array.isArray(actualValue)) {
        errors.push(`Field '${key}' should be array, got ${actualType}`)
      } else if (cleanType === 'object' && (actualType !== 'object' || Array.isArray(actualValue))) {
        errors.push(`Field '${key}' should be object, got ${actualType}`)
      }

      // 特殊验证
      if (cleanType === 'email' && actualType === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(actualValue)) {
          warnings.push(`Field '${key}' does not match email format`)
        }
      }

      if (cleanType === 'url' && actualType === 'string') {
        try {
          new URL(actualValue)
        } catch {
          warnings.push(`Field '${key}' is not a valid URL`)
        }
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 对比Mock数据与API定义
   */
  static compareWithApiDefinition(mockData: any, apiDef: ApiDefinition): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 根据响应类型进行不同验证
    switch (apiDef.responseType) {
      case 'single':
        return this.validateApiResponse(mockData, apiDef)

      case 'list':
      case 'page':
        return this.validatePageApiResponse(mockData, apiDef)

      default:
        errors.push(`Unknown response type: ${apiDef.responseType}`)
        return { isValid: false, errors, warnings }
    }
  }

  /**
   * 批量验证Mock数据集合
   */
  static validateMockDataBatch(
    mockDataMap: Record<string, any>,
    apiDefinitions: Record<string, ApiDefinition>
  ): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {}

    Object.entries(mockDataMap).forEach(([key, mockData]) => {
      const apiDef = apiDefinitions[key]
      if (apiDef) {
        results[key] = this.compareWithApiDefinition(mockData, apiDef)
      } else {
        results[key] = {
          isValid: false,
          errors: [`No API definition found for ${key}`],
          warnings: []
        }
      }
    })

    return results
  }

  /**
   * 生成验证报告
   */
  static generateValidationReport(results: Record<string, ValidationResult>): string {
    let report = '# Mock数据验证报告\n\n'

    const totalEndpoints = Object.keys(results).length
    const validEndpoints = Object.values(results).filter(r => r.isValid).length
    const invalidEndpoints = totalEndpoints - validEndpoints

    report += `## 概览\n\n`
    report += `- 总端点数: ${totalEndpoints}\n`
    report += `- 验证通过: ${validEndpoints}\n`
    report += `- 验证失败: ${invalidEndpoints}\n`
    report += `- 通过率: ${((validEndpoints / totalEndpoints) * 100).toFixed(1)}%\n\n`

    if (invalidEndpoints > 0) {
      report += `## 失败详情\n\n`

      Object.entries(results)
        .filter(([_, result]) => !result.isValid)
        .forEach(([endpoint, result]) => {
          report += `### ${endpoint}\n\n`
          if (result.errors.length > 0) {
            report += `**错误:**\n`
            result.errors.forEach(error => {
              report += `- ${error}\n`
            })
          }
          if (result.warnings.length > 0) {
            report += `**警告:**\n`
            result.warnings.forEach(warning => {
              report += `- ${warning}\n`
            })
          }
          report += '\n'
        })
    }

    const allWarnings = Object.values(results)
      .flatMap(r => r.warnings)

    if (allWarnings.length > 0) {
      report += `## 所有警告\n\n`
      allWarnings.forEach(warning => {
        report += `- ${warning}\n`
      })
      report += '\n'
    }

    return report
  }
}

/**
 * 便捷验证函数
 */
export function validateApiResponse(response: any, apiDef?: ApiDefinition): ValidationResult {
  return MockDataValidator.validateApiResponse(response, apiDef)
}

export function validatePageApiResponse(response: any, apiDef?: ApiDefinition): ValidationResult {
  return MockDataValidator.validatePageApiResponse(response, apiDef)
}

export function compareWithApiDefinition(mockData: any, apiDef: ApiDefinition): ValidationResult {
  return MockDataValidator.compareWithApiDefinition(mockData, apiDef)
}

export function validateMockDataBatch(
  mockDataMap: Record<string, any>,
  apiDefinitions: Record<string, ApiDefinition>
): Record<string, ValidationResult> {
  return MockDataValidator.validateMockDataBatch(mockDataMap, apiDefinitions)
}

export function generateValidationReport(results: Record<string, ValidationResult>): string {
  return MockDataValidator.generateValidationReport(results)
}

/**
 * 测试时的自动验证函数
 */
export function assertMockDataValid(
  mockData: any,
  apiDef?: ApiDefinition,
  context?: string
): void {
  let result: ValidationResult

  if (apiDef?.responseType === 'page' || apiDef?.responseType === 'list') {
    result = validatePageApiResponse(mockData, apiDef)
  } else {
    result = validateApiResponse(mockData, apiDef)
  }

  if (!result.isValid) {
    const contextMsg = context ? ` (${context})` : ''
    const errorMsg = `Mock data validation failed${contextMsg}:\n` +
      `Errors: ${result.errors.join(', ')}\n` +
      `Warnings: ${result.warnings.join(', ')}`

    throw new Error(errorMsg)
  }

  if (result.warnings.length > 0) {
    const contextMsg = context ? ` (${context})` : ''
    console.warn(`Mock data validation warnings${contextMsg}:`, result.warnings.join(', '))
  }
}
