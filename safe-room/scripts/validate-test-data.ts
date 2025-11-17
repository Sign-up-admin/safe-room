#!/usr/bin/env tsx

/**
 * 测试数据一致性检查脚本
 * 用于CI验证，确保测试数据符合规范
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'
import { MockDataValidator, generateValidationReport } from '../tests/shared/utils/mock-validator'
import { factoryRegistry } from '../tests/shared/registry/factory-registry'

// ========== 配置 ==========

const CONFIG = {
  // 测试文件目录
  testDirs: [
    'springboot1ngh61a2/src/main/resources/front/front/tests',
    'springboot1ngh61a2/src/main/resources/admin/admin/tests'
  ],

  // 需要检查的文件扩展名
  extensions: ['.ts', '.js'],

  // 排除的文件和目录
  excludePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/*.d.ts',
    '**/setup/**',
    '**/mocks/**',
    '**/fixtures/**'
  ],

  // 输出文件
  outputFile: 'test-data-validation-report.json',
  reportDir: 'docs/reports/test-validation'
}

// ========== 类型定义 ==========

interface ValidationIssue {
  file: string
  line: number
  column: number
  type: 'hardcoded_data' | 'invalid_mock' | 'missing_factory' | 'validation_error'
  severity: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
}

interface ValidationResult {
  file: string
  issues: ValidationIssue[]
  score: number // 0-100, 质量评分
  stats: {
    totalLines: number
    hardcodedDataCount: number
    mockUsageCount: number
    factoryUsageCount: number
  }
}

interface ValidationReport {
  timestamp: string
  summary: {
    totalFiles: number
    filesWithIssues: number
    totalIssues: number
    averageScore: number
    issuesByType: Record<string, number>
    issuesBySeverity: Record<string, number>
  }
  results: ValidationResult[]
  recommendations: string[]
}

// ========== 工具函数 ==========

/**
 * 查找所有测试文件
 */
async function findTestFiles(): Promise<string[]> {
  const patterns = CONFIG.testDirs.flatMap(dir =>
    CONFIG.extensions.map(ext => path.join(dir, `**/*${ext}`))
  )

  const allFiles: string[] = []
  for (const pattern of patterns) {
    const files = await glob(pattern, {
      ignore: CONFIG.excludePatterns,
      absolute: true
    })
    allFiles.push(...files)
  }

  return [...new Set(allFiles)] // 去重
}

/**
 * 读取文件内容
 */
function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    console.warn(`Failed to read file: ${filePath}`, error)
    return ''
  }
}

/**
 * 解析代码行号
 */
function getLineNumber(content: string, index: number): number {
  const lines = content.substring(0, index).split('\n')
  return lines.length
}

/**
 * 解析列号
 */
function getColumnNumber(content: string, index: number): number {
  const lines = content.substring(0, index).split('\n')
  return lines[lines.length - 1].length + 1
}

// ========== 验证规则 ==========

/**
 * 检查硬编码数据
 */
function checkHardcodedData(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const lines = content.split('\n')

  // 匹配硬编码的对象数据
  const hardcodedPatterns = [
    // 硬编码的用户数据
    /{[^}]*\bid\s*:\s*\d+[^}]*\bname\s*:\s*['"][^'"]*['"][^}]*}/g,
    // 硬编码的ID
    /\bid\s*:\s*\d+/g,
    // 硬编码的邮箱
    /\bemail\s*:\s*['"][^'"]*@[^'"]*['"]/g,
    // 硬编码的响应数据
    /mockResolvedValueOnce\s*\(\s*\{\s*data\s*:\s*\{[^}]*\}\s*\}\s*\)/g
  ]

  lines.forEach((line, lineIndex) => {
    hardcodedPatterns.forEach(pattern => {
      const matches = line.match(pattern)
      if (matches) {
        matches.forEach(match => {
          // 检查是否已经使用了工厂函数
          if (!line.includes('createMock') && !line.includes('createValidated')) {
            issues.push({
              file: '', // 将在调用时设置
              line: lineIndex + 1,
              column: line.indexOf(match) + 1,
              type: 'hardcoded_data',
              severity: 'warning',
              message: `Found hardcoded test data: ${match.substring(0, 50)}...`,
              suggestion: 'Consider using factory functions like createMockUser() or createMockCourse()'
            })
          }
        })
      }
    })
  })

  return issues
}

/**
 * 检查Mock使用情况
 */
function checkMockUsage(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const lines = content.split('\n')

  lines.forEach((line, lineIndex) => {
    // 检查是否使用了旧的Mock方式
    if (line.includes('mockResolvedValueOnce') && line.includes('{ data:')) {
      // 检查是否使用了新的响应生成器
      if (!line.includes('createApiResponse') && !line.includes('createListResponse')) {
        issues.push({
          file: '',
          line: lineIndex + 1,
          column: 1,
          type: 'invalid_mock',
          severity: 'warning',
          message: 'Mock response not using standardized format',
          suggestion: 'Use createApiResponse() or createListResponse() for consistent API responses'
        })
      }
    }
  })

  return issues
}

/**
 * 检查工厂函数使用情况
 */
function checkFactoryUsage(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const lines = content.split('\n')

  // 检查是否有测试数据但没有使用工厂
  const hasTestData = lines.some(line =>
    line.includes('describe(') || line.includes('it(') || line.includes('test(')
  )

  const hasFactoryUsage = lines.some(line =>
    line.includes('createMock') || line.includes('createValidated')
  )

  if (hasTestData && !hasFactoryUsage) {
    issues.push({
      file: '',
      line: 1,
      column: 1,
      type: 'missing_factory',
      severity: 'info',
      message: 'Test file contains test data but no factory functions detected',
      suggestion: 'Consider importing and using factory functions for consistent test data'
    })
  }

  return issues
}

// ========== 主要验证函数 ==========

/**
 * 验证单个文件
 */
function validateFile(filePath: string): ValidationResult {
  const content = readFileContent(filePath)
  const lines = content.split('\n')

  const issues: ValidationIssue[] = []

  // 运行各种检查
  issues.push(...checkHardcodedData(content).map(issue => ({ ...issue, file: filePath })))
  issues.push(...checkMockUsage(content).map(issue => ({ ...issue, file: filePath })))
  issues.push(...checkFactoryUsage(content).map(issue => ({ ...issue, file: filePath })))

  // 计算统计信息
  const stats = {
    totalLines: lines.length,
    hardcodedDataCount: issues.filter(i => i.type === 'hardcoded_data').length,
    mockUsageCount: (content.match(/mockResolvedValueOnce/g) || []).length,
    factoryUsageCount: (content.match(/createMock|createValidated/g) || []).length
  }

  // 计算质量评分 (0-100)
  const score = calculateQualityScore(stats, issues)

  return {
    file: filePath,
    issues,
    score,
    stats
  }
}

/**
 * 计算质量评分
 */
function calculateQualityScore(stats: ValidationResult['stats'], issues: ValidationIssue[]): number {
  let score = 100

  // 硬编码数据严重扣分
  score -= issues.filter(i => i.type === 'hardcoded_data').length * 5

  // 无效Mock扣分
  score -= issues.filter(i => i.type === 'invalid_mock').length * 3

  // 工厂函数使用加分
  if (stats.factoryUsageCount > 0) {
    score += Math.min(stats.factoryUsageCount * 2, 20)
  }

  // 基于代码行数的惩罚（过长的文件可能需要重构）
  if (stats.totalLines > 500) {
    score -= 10
  }

  return Math.max(0, Math.min(100, score))
}

// ========== 报告生成 ==========

/**
 * 生成验证报告
 */
function generateReport(results: ValidationResult[]): ValidationReport {
  const totalFiles = results.length
  const filesWithIssues = results.filter(r => r.issues.length > 0).length
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0)
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalFiles

  const issuesByType: Record<string, number> = {}
  const issuesBySeverity: Record<string, number> = {}

  results.forEach(result => {
    result.issues.forEach(issue => {
      issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1
      issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1
    })
  })

  const recommendations = generateRecommendations(results, {
    totalFiles,
    filesWithIssues,
    totalIssues,
    averageScore,
    issuesByType,
    issuesBySeverity
  })

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles,
      filesWithIssues,
      totalIssues,
      averageScore,
      issuesByType,
      issuesBySeverity
    },
    results,
    recommendations
  }
}

/**
 * 生成改进建议
 */
function generateRecommendations(
  results: ValidationResult[],
  summary: ValidationReport['summary']
): string[] {
  const recommendations: string[] = []

  if (summary.averageScore < 70) {
    recommendations.push('Overall test data quality needs improvement')
  }

  if (summary.issuesByType.hardcoded_data > summary.totalFiles * 0.5) {
    recommendations.push('High number of hardcoded data detected. Consider implementing more factory functions')
  }

  if (summary.issuesByType.invalid_mock > 0) {
    recommendations.push('Some tests are not using standardized Mock response format. Update to use createApiResponse()')
  }

  if (summary.issuesByType.missing_factory > summary.totalFiles * 0.3) {
    recommendations.push('Many test files lack factory function usage. Consider adding factory imports and usage')
  }

  const lowScoreFiles = results.filter(r => r.score < 60).map(r => path.basename(r.file))
  if (lowScoreFiles.length > 0) {
    recommendations.push(`Files with low quality scores: ${lowScoreFiles.join(', ')}`)
  }

  return recommendations
}

// ========== 主函数 ==========

/**
 * 主验证函数
 */
async function main() {
  console.log('🔍 Starting test data validation...')

  // 初始化工厂注册表
  console.log('📋 Initializing factory registry...')
  factoryRegistry.clear()
  // 这里可以初始化预定义的工厂

  // 查找测试文件
  console.log('🔎 Finding test files...')
  const testFiles = await findTestFiles()
  console.log(`📁 Found ${testFiles.length} test files`)

  // 验证每个文件
  console.log('⚡ Validating files...')
  const results: ValidationResult[] = []

  for (const file of testFiles) {
    console.log(`  Checking: ${path.relative(process.cwd(), file)}`)
    const result = validateFile(file)
    results.push(result)

    if (result.issues.length > 0) {
      console.log(`    ⚠️  Found ${result.issues.length} issues (Score: ${result.score})`)
    } else {
      console.log(`    ✅ No issues found (Score: ${result.score})`)
    }
  }

  // 生成报告
  console.log('📊 Generating report...')
  const report = generateReport(results)

  // 确保输出目录存在
  const outputDir = path.join(process.cwd(), CONFIG.reportDir)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // 写入报告文件
  const outputPath = path.join(outputDir, CONFIG.outputFile)
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8')

  // 生成文本报告
  const textReportPath = path.join(outputDir, 'validation-report.md')
  const textReport = generateTextReport(report)
  fs.writeFileSync(textReportPath, textReport, 'utf-8')

  // 输出总结
  console.log('\n📈 Validation Summary:')
  console.log(`   Total files: ${report.summary.totalFiles}`)
  console.log(`   Files with issues: ${report.summary.filesWithIssues}`)
  console.log(`   Total issues: ${report.summary.totalIssues}`)
  console.log(`   Average score: ${report.summary.averageScore.toFixed(1)}`)
  console.log(`   Reports saved to: ${outputDir}`)

  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:')
    report.recommendations.forEach(rec => console.log(`   • ${rec}`))
  }

  // 返回退出码
  const hasErrors = report.results.some(r => r.issues.some(i => i.severity === 'error'))
  process.exit(hasErrors ? 1 : 0)
}

/**
 * 生成文本报告
 */
function generateTextReport(report: ValidationReport): string {
  let text = '# 测试数据验证报告\n\n'

  text += `生成时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}\n\n`

  text += '## 📊 总览\n\n'
  text += `| 指标 | 数值 |\n`
  text += `|------|------|\n`
  text += `| 总文件数 | ${report.summary.totalFiles} |\n`
  text += `| 有问题文件数 | ${report.summary.filesWithIssues} |\n`
  text += `| 总问题数 | ${report.summary.totalIssues} |\n`
  text += `| 平均质量评分 | ${report.summary.averageScore.toFixed(1)} |\n`
  text += '\n'

  if (Object.keys(report.summary.issuesByType).length > 0) {
    text += '## 🔍 问题类型分布\n\n'
    text += `| 问题类型 | 数量 |\n`
    text += `|----------|------|\n`
    Object.entries(report.summary.issuesByType).forEach(([type, count]) => {
      text += `| ${type} | ${count} |\n`
    })
    text += '\n'
  }

  if (report.recommendations.length > 0) {
    text += '## 💡 改进建议\n\n'
    report.recommendations.forEach(rec => {
      text += `- ${rec}\n`
    })
    text += '\n'
  }

  if (report.results.some(r => r.issues.length > 0)) {
    text += '## 📋 详细问题\n\n'

    report.results
      .filter(r => r.issues.length > 0)
      .forEach(result => {
        text += `### ${path.relative(process.cwd(), result.file)}\n\n`
        text += `质量评分: ${result.score.toFixed(1)}\n\n`

        result.issues.forEach(issue => {
          const severityIcon = {
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
          }[issue.severity] || '❓'

          text += `${severityIcon} **${issue.type}** (行 ${issue.line}): ${issue.message}\n\n`
          if (issue.suggestion) {
            text += `   💡 ${issue.suggestion}\n\n`
          }
        })

        text += '---\n\n'
      })
  }

  return text
}

// ========== 执行脚本 ==========

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  })
}

export { main as validateTestData }
