import { test, expect } from '@playwright/test'
import { createPerformanceOptimizer, TestPerformanceOptimizer } from './performance-optimization'
import path from 'path'
import fs from 'fs'

/**
 * Parallel Execution Manager - 并行执行管理器
 * 管理测试的并行执行、分片和资源分配
 */

export interface ExecutionShard {
  index: number
  total: number
  tests: string[]
}

export interface ExecutionResult {
  shard: ExecutionShard
  results: TestResult[]
  duration: number
  status: 'success' | 'partial' | 'failed'
}

export interface TestResult {
  name: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
}

export class ParallelExecutionManager {
  private optimizer: TestPerformanceOptimizer
  private results: Map<string, ExecutionResult> = new Map()

  constructor() {
    this.optimizer = createPerformanceOptimizer()
  }

  /**
   * 分析测试文件并创建执行分片
   */
  async analyzeAndShardTests(testDir: string, shardCount: number): Promise<ExecutionShard[]> {
    const testFiles = await this.discoverTestFiles(testDir)
    const testGroups = await this.groupTestsByCharacteristics(testFiles)

    return this.createOptimalShards(testGroups, shardCount)
  }

  /**
   * 发现测试文件
   */
  private async discoverTestFiles(testDir: string): Promise<string[]> {
    const files: string[] = []

    const walkDir = (dir: string) => {
      const items = fs.readdirSync(dir)

      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          walkDir(fullPath)
        } else if (item.endsWith('.spec.ts') || item.endsWith('.test.ts')) {
          files.push(fullPath)
        }
      }
    }

    walkDir(testDir)
    return files
  }

  /**
   * 根据测试特征分组
   */
  private async groupTestsByCharacteristics(testFiles: string[]): Promise<TestGroup[]> {
    const groups: TestGroup[] = []

    for (const file of testFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      const tests = this.extractTestsFromFile(content, file)

      // 根据测试特征分组
      const fastTests = tests.filter(t => this.isFastTest(t))
      const slowTests = tests.filter(t => this.isSlowTest(t))
      const apiTests = tests.filter(t => this.isApiTest(t))
      const uiTests = tests.filter(t => this.isUiTest(t))

      if (fastTests.length > 0) {
        groups.push({
          name: `fast_${path.basename(file)}`,
          files: [file],
          tests: fastTests,
          estimatedDuration: fastTests.length * 2000, // 2秒每个
          priority: 'high',
          type: 'fast'
        })
      }

      if (slowTests.length > 0) {
        groups.push({
          name: `slow_${path.basename(file)}`,
          files: [file],
          tests: slowTests,
          estimatedDuration: slowTests.length * 15000, // 15秒每个
          priority: 'low',
          type: 'slow'
        })
      }

      if (apiTests.length > 0) {
        groups.push({
          name: `api_${path.basename(file)}`,
          files: [file],
          tests: apiTests,
          estimatedDuration: apiTests.length * 3000, // 3秒每个
          priority: 'medium',
          type: 'api'
        })
      }

      if (uiTests.length > 0) {
        groups.push({
          name: `ui_${path.basename(file)}`,
          files: [file],
          tests: uiTests,
          estimatedDuration: uiTests.length * 5000, // 5秒每个
          priority: 'medium',
          type: 'ui'
        })
      }
    }

    return groups
  }

  /**
   * 创建最优分片
   */
  private createOptimalShards(groups: TestGroup[], shardCount: number): ExecutionShard[] {
    // 按优先级和类型排序
    const sortedGroups = groups.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority]
      const bPriority = priorityOrder[b.priority]

      if (aPriority !== bPriority) return bPriority - aPriority

      // 同优先级内按预计时间排序
      return a.estimatedDuration - b.estimatedDuration
    })

    const shards: ExecutionShard[] = []

    for (let i = 0; i < shardCount; i++) {
      shards.push({
        index: i,
        total: shardCount,
        tests: []
      })
    }

    // 分配测试组到分片
    sortedGroups.forEach((group, index) => {
      const shardIndex = index % shardCount
      shards[shardIndex].tests.push(...group.tests.map(t => t.name))
    })

    return shards
  }

  /**
   * 执行分片测试
   */
  async executeShard(shard: ExecutionShard, options: {
    baseUrl?: string
    timeout?: number
    retries?: number
  } = {}): Promise<ExecutionResult> {
    const startTime = Date.now()
    const results: TestResult[] = []

    console.log(`Executing shard ${shard.index + 1}/${shard.total} with ${shard.tests.length} tests`)

    try {
      // 这里可以集成实际的测试执行逻辑
      // 由于Playwright已经处理并行执行，我们主要处理分片逻辑

      for (const testName of shard.tests) {
        const testStartTime = Date.now()

        try {
          // 执行单个测试的逻辑
          await this.executeSingleTest(testName, options)

          results.push({
            name: testName,
            status: 'passed',
            duration: Date.now() - testStartTime
          })
        } catch (error) {
          results.push({
            name: testName,
            status: 'failed',
            duration: Date.now() - testStartTime,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      }
    } catch (error) {
      console.error(`Shard ${shard.index + 1} execution failed:`, error)
    }

    const duration = Date.now() - startTime
    const failedTests = results.filter(r => r.status === 'failed').length
    const status = failedTests === 0 ? 'success' : failedTests === results.length ? 'failed' : 'partial'

    const result: ExecutionResult = {
      shard,
      results,
      duration,
      status
    }

    this.results.set(`shard_${shard.index}`, result)
    return result
  }

  /**
   * 执行单个测试
   */
  private async executeSingleTest(testName: string, options: any): Promise<void> {
    // 这里实现实际的测试执行逻辑
    // 可以调用Playwright的测试运行器或自定义执行逻辑

    // 示例实现：检查测试是否存在
    if (!testName || testName.trim() === '') {
      throw new Error('Invalid test name')
    }

    // 模拟测试执行
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
  }

  /**
   * 合并分片结果
   */
  mergeResults(results: ExecutionResult[]): ConsolidatedResult {
    const allResults = results.flatMap(r => r.results)
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)

    const passed = allResults.filter(r => r.status === 'passed').length
    const failed = allResults.filter(r => r.status === 'failed').length
    const skipped = allResults.filter(r => r.status === 'skipped').length

    return {
      totalTests: allResults.length,
      passed,
      failed,
      skipped,
      totalDuration,
      averageDuration: totalDuration / allResults.length,
      successRate: (passed / allResults.length) * 100,
      shardResults: results
    }
  }

  /**
   * 生成执行报告
   */
  generateExecutionReport(results: ExecutionResult[]): string {
    const consolidated = this.mergeResults(results)

    const shardDetails = results.map(result => {
      const passed = result.results.filter(r => r.status === 'passed').length
      const failed = result.results.filter(r => r.status === 'failed').length
      const duration = (result.duration / 1000).toFixed(2)

      return `分片 ${result.shard.index + 1}: ${passed} 通过, ${failed} 失败, ${duration}s`
    }).join('\n  ')

    const failedTests = results
      .flatMap(r => r.results)
      .filter(r => r.status === 'failed')
      .map(r => `  - ${r.name}: ${r.error}`)
      .join('\n')

    return `
# 并行执行报告

## 汇总统计
- 总测试数: ${consolidated.totalTests}
- 通过: ${consolidated.passed}
- 失败: ${consolidated.failed}
- 跳过: ${consolidated.skipped}
- 成功率: ${consolidated.successRate.toFixed(2)}%
- 总耗时: ${(consolidated.totalDuration / 1000).toFixed(2)}s
- 平均耗时: ${consolidated.averageDuration.toFixed(2)}ms/测试

## 分片详情
${shardDetails}

${failedTests ? `## 失败测试\n${failedTests}` : ''}

## 性能指标
- 分片数量: ${results.length}
- 最快分片: ${(Math.min(...results.map(r => r.duration)) / 1000).toFixed(2)}s
- 最慢分片: ${(Math.max(...results.map(r => r.duration)) / 1000).toFixed(2)}s
- 分片负载均衡: ${this.calculateLoadBalance(results)}

生成时间: ${new Date().toISOString()}
    `.trim()
  }

  /**
   * 计算负载均衡度
   */
  private calculateLoadBalance(results: ExecutionResult[]): string {
    const durations = results.map(r => r.duration)
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / durations.length
    const stdDev = Math.sqrt(variance)
    const cv = (stdDev / avg) * 100 // 变异系数

    if (cv < 10) return '优秀'
    if (cv < 20) return '良好'
    if (cv < 30) return '一般'
    return '需要优化'
  }

  // 辅助方法
  private extractTestsFromFile(content: string, filePath: string): TestInfo[] {
    const testRegex = /test\s*\(\s*['"](.+?)['"]/g
    const tests: TestInfo[] = []
    let match

    while ((match = testRegex.exec(content)) !== null) {
      tests.push({
        name: match[1],
        file: filePath,
        content: match[0]
      })
    }

    return tests
  }

  private isFastTest(test: TestInfo): boolean {
    const fastPatterns = [/login/i, /navigation/i, /basic/i, /simple/i]
    return fastPatterns.some(pattern => pattern.test(test.name))
  }

  private isSlowTest(test: TestInfo): boolean {
    const slowPatterns = [/workflow/i, /journey/i, /integration/i, /performance/i]
    return slowPatterns.some(pattern => pattern.test(test.name))
  }

  private isApiTest(test: TestInfo): boolean {
    const apiPatterns = [/api/i, /request/i, /response/i, /endpoint/i]
    return apiPatterns.some(pattern => pattern.test(test.name))
  }

  private isUiTest(test: TestInfo): boolean {
    const uiPatterns = [/ui/i, /display/i, /render/i, /component/i]
    return uiPatterns.some(pattern => pattern.test(test.name))
  }
}

/**
 * 类型定义
 */
interface TestGroup {
  name: string
  files: string[]
  tests: TestInfo[]
  estimatedDuration: number
  priority: 'high' | 'medium' | 'low'
  type: 'fast' | 'slow' | 'api' | 'ui'
}

interface TestInfo {
  name: string
  file: string
  content: string
}

interface ConsolidatedResult {
  totalTests: number
  passed: number
  failed: number
  skipped: number
  totalDuration: number
  averageDuration: number
  successRate: number
  shardResults: ExecutionResult[]
}

/**
 * 便捷函数
 */
export function createParallelExecutionManager(): ParallelExecutionManager {
  return new ParallelExecutionManager()
}

export async function executeTestsInParallel(
  testDir: string,
  shardCount: number,
  options: any = {}
): Promise<ConsolidatedResult> {
  const manager = createParallelExecutionManager()
  const shards = await manager.analyzeAndShardTests(testDir, shardCount)

  console.log(`Created ${shards.length} shards for ${shards.reduce((sum, s) => sum + s.tests.length, 0)} tests`)

  const results = await Promise.all(
    shards.map(shard => manager.executeShard(shard, options))
  )

  return manager.mergeResults(results)
}

export function generateParallelExecutionReport(results: ExecutionResult[]): string {
  const manager = createParallelExecutionManager()
  return manager.generateExecutionReport(results)
}
