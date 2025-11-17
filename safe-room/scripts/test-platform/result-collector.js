#!/usr/bin/env node

/**
 * 测试结果收集器
 *
 * 实时收集和解析Vitest、Playwright和其他测试框架的结果
 * 支持多种输入格式和输出格式
 */

const fs = require('fs')
const path = require('path')
const { EventEmitter } = require('events')

class TestResultCollector extends EventEmitter {
  constructor(options = {}) {
    super()
    this.options = {
      watchMode: options.watchMode || false,
      outputDir: options.outputDir || path.join(process.cwd(), 'test-results'),
      formats: options.formats || ['json', 'html'],
      realtime: options.realtime || false,
      ...options
    }

    this.results = new Map()
    this.metrics = new Map()
    this.activeRuns = new Set()

    // 确保输出目录存在
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true })
    }

    this.setupEventHandlers()
  }

  /**
   * 设置事件处理器
   */
  setupEventHandlers() {
    // 监听进程退出
    process.on('SIGINT', () => this.cleanup())
    process.on('SIGTERM', () => this.cleanup())

    // 如果是实时模式，设置文件监听
    if (this.options.realtime) {
      this.setupFileWatchers()
    }
  }

  /**
   * 设置文件监听器
   */
  setupFileWatchers() {
    // 监听Vitest结果文件
    const vitestResultPaths = [
      'coverage/coverage-final.json',
      'coverage/lcov.info',
      'test-results.json'
    ]

    // 监听Playwright结果文件
    const playwrightResultPaths = [
      'playwright-report/index.html',
      'playwright-report/results.json',
      'test-results/playwright-results.json'
    ]

    const allPaths = [...vitestResultPaths, ...playwrightResultPaths]

    allPaths.forEach(resultPath => {
      const fullPath = path.resolve(resultPath)
      if (fs.existsSync(fullPath)) {
        this.watchFile(fullPath)
      }
    })
  }

  /**
   * 监听单个文件
   */
  watchFile(filePath) {
    try {
      fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
        if (curr.mtime > prev.mtime) {
          console.log(`检测到文件变化: ${filePath}`)
          this.processFile(filePath)
        }
      })
    } catch (error) {
      console.warn(`无法监听文件 ${filePath}: ${error.message}`)
    }
  }

  /**
   * 处理文件变化
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const fileName = path.basename(filePath)
      const fileExt = path.extname(filePath)

      let result
      if (fileExt === '.json') {
        result = this.parseJsonResult(content, fileName)
      } else if (fileExt === '.html') {
        result = this.parseHtmlResult(content, fileName)
      } else if (fileName === 'lcov.info') {
        result = this.parseLcovResult(content, fileName)
      }

      if (result) {
        await this.storeResult(result)
        this.emit('result', result)
      }
    } catch (error) {
      console.error(`处理文件失败 ${filePath}: ${error.message}`)
      this.emit('error', { file: filePath, error: error.message })
    }
  }

  /**
   * 解析JSON格式的测试结果
   */
  parseJsonResult(content, fileName) {
    try {
      const data = JSON.parse(content)

      // 检测是Vitest还是Playwright结果
      if (data.testResults || data.coverageMap) {
        return this.parseVitestResult(data, fileName)
      } else if (data.suites || data.specs) {
        return this.parsePlaywrightResult(data, fileName)
      } else if (data.totalTests !== undefined) {
        return this.parseAggregatedResult(data, fileName)
      }

      return null
    } catch (error) {
      console.error(`解析JSON失败 ${fileName}: ${error.message}`)
      return null
    }
  }

  /**
   * 解析Vitest测试结果
   */
  parseVitestResult(data, fileName) {
    const result = {
      framework: 'vitest',
      timestamp: new Date().toISOString(),
      source: fileName,
      summary: {
        totalTests: data.numTotalTests || 0,
        passedTests: data.numPassedTests || 0,
        failedTests: data.numFailedTests || 0,
        skippedTests: data.numSkippedTests || 0,
        duration: data.duration || 0,
        success: data.success !== false
      },
      coverage: data.coverageMap ? this.extractCoverageMetrics(data.coverageMap) : null,
      testSuites: data.testResults ? this.extractVitestSuites(data.testResults) : [],
      raw: data
    }

    return result
  }

  /**
   * 解析Playwright测试结果
   */
  parsePlaywrightResult(data, fileName) {
    const result = {
      framework: 'playwright',
      timestamp: new Date().toISOString(),
      source: fileName,
      summary: {
        totalTests: data.stats?.all || 0,
        passedTests: data.stats?.passed || 0,
        failedTests: data.stats?.failed || 0,
        skippedTests: data.stats?.skipped || 0,
        duration: data.stats?.duration || 0,
        success: (data.stats?.failed || 0) === 0
      },
      testSuites: data.suites ? this.extractPlaywrightSuites(data.suites) : [],
      raw: data
    }

    return result
  }

  /**
   * 解析聚合的测试结果
   */
  parseAggregatedResult(data, fileName) {
    return {
      framework: 'aggregated',
      timestamp: new Date().toISOString(),
      source: fileName,
      summary: {
        totalTests: data.totalTests || 0,
        passedTests: data.passedTests || 0,
        failedTests: data.failedTests || 0,
        skippedTests: data.skippedTests || 0,
        duration: data.duration || 0,
        success: data.success !== false
      },
      coverage: data.coverage || null,
      testSuites: data.testSuites || [],
      raw: data
    }
  }

  /**
   * 解析HTML格式的结果（用于Playwright HTML报告）
   */
  parseHtmlResult(content, fileName) {
    // 简单的HTML解析，提取关键信息
    const result = {
      framework: 'playwright',
      timestamp: new Date().toISOString(),
      source: fileName,
      summary: this.extractHtmlSummary(content),
      raw: content
    }

    return result
  }

  /**
   * 解析LCOV覆盖率结果
   */
  parseLcovResult(content, fileName) {
    const coverage = this.parseLcovData(content)

    return {
      framework: 'coverage',
      timestamp: new Date().toISOString(),
      source: fileName,
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        duration: 0,
        success: true
      },
      coverage,
      raw: content
    }
  }

  /**
   * 提取覆盖率指标
   */
  extractCoverageMetrics(coverageMap) {
    const metrics = {
      lines: { total: 0, covered: 0, percentage: 0 },
      functions: { total: 0, covered: 0, percentage: 0 },
      branches: { total: 0, covered: 0, percentage: 0 },
      statements: { total: 0, covered: 0, percentage: 0 }
    }

    // 解析Vitest覆盖率数据
    Object.values(coverageMap).forEach(fileCoverage => {
      if (fileCoverage && typeof fileCoverage === 'object') {
        // 行覆盖率
        if (fileCoverage.lines) {
          metrics.lines.total += fileCoverage.lines.total || 0
          metrics.lines.covered += fileCoverage.lines.covered || 0
        }

        // 函数覆盖率
        if (fileCoverage.functions) {
          metrics.functions.total += fileCoverage.functions.total || 0
          metrics.functions.covered += fileCoverage.functions.covered || 0
        }

        // 分支覆盖率
        if (fileCoverage.branches) {
          metrics.branches.total += fileCoverage.branches.total || 0
          metrics.branches.covered += fileCoverage.branches.covered || 0
        }

        // 语句覆盖率
        if (fileCoverage.statements) {
          metrics.statements.total += fileCoverage.statements.total || 0
          metrics.statements.covered += fileCoverage.statements.covered || 0
        }
      }
    })

    // 计算百分比
    Object.keys(metrics).forEach(key => {
      const metric = metrics[key]
      metric.percentage = metric.total > 0 ? (metric.covered / metric.total) * 100 : 0
    })

    return metrics
  }

  /**
   * 提取Vitest测试套件
   */
  extractVitestSuites(testResults) {
    return testResults.map(suite => ({
      name: suite.testFilePath || suite.displayName || 'Unknown',
      tests: suite.numPassingTests + suite.numFailingTests + suite.numSkippedTests,
      failures: suite.numFailingTests,
      errors: 0,
      skipped: suite.numSkippedTests,
      time: suite.duration || 0,
      tests: suite.tests ? suite.tests.map(test => ({
        name: test.title,
        status: test.status,
        duration: test.duration || 0,
        error: test.failureMessages ? test.failureMessages.join('\n') : null
      })) : []
    }))
  }

  /**
   * 提取Playwright测试套件
   */
  extractPlaywrightSuites(suites) {
    return suites.map(suite => ({
      name: suite.title,
      tests: suite.specs ? suite.specs.reduce((total, spec) => total + spec.tests.length, 0) : 0,
      failures: suite.specs ? suite.specs.reduce((total, spec) =>
        total + spec.tests.filter(test => test.results.some(r => r.status === 'failed')).length, 0) : 0,
      errors: suite.specs ? suite.specs.reduce((total, spec) =>
        total + spec.tests.filter(test => test.results.some(r => r.status === 'timedOut')).length, 0) : 0,
      skipped: suite.specs ? suite.specs.reduce((total, spec) =>
        total + spec.tests.filter(test => test.results.some(r => r.status === 'skipped')).length, 0) : 0,
      time: suite.specs ? suite.specs.reduce((total, spec) =>
        total + spec.tests.reduce((specTotal, test) =>
          specTotal + test.results.reduce((testTotal, result) => testTotal + result.duration, 0), 0), 0) : 0,
      tests: suite.specs ? suite.specs.flatMap(spec =>
        spec.tests.map(test => ({
          name: test.title,
          status: test.results[0]?.status || 'unknown',
          duration: test.results[0]?.duration || 0,
          error: test.results[0]?.error?.message || null
        }))
      ) : []
    }))
  }

  /**
   * 从HTML中提取摘要信息
   */
  extractHtmlSummary(htmlContent) {
    // 简单的正则表达式提取关键信息
    const totalMatch = htmlContent.match(/(\d+)\s*tests?/i)
    const passedMatch = htmlContent.match(/(\d+)\s*passed/i)
    const failedMatch = htmlContent.match(/(\d+)\s*failed/i)
    const durationMatch = htmlContent.match(/(\d+)\s*ms|(\d+\.?\d*)\s*s/i)

    return {
      totalTests: totalMatch ? parseInt(totalMatch[1]) : 0,
      passedTests: passedMatch ? parseInt(passedMatch[1]) : 0,
      failedTests: failedMatch ? parseInt(failedMatch[1]) : 0,
      skippedTests: 0,
      duration: durationMatch ? parseFloat(durationMatch[1] || durationMatch[2]) : 0,
      success: failedMatch ? parseInt(failedMatch[1]) === 0 : true
    }
  }

  /**
   * 解析LCOV数据
   */
  parseLcovData(lcovContent) {
    const lines = lcovContent.split('\n')
    const files = {}
    let currentFile = null

    lines.forEach(line => {
      if (line.startsWith('SF:')) {
        currentFile = line.substring(3)
        files[currentFile] = {
          lines: { total: 0, covered: 0 },
          functions: { total: 0, covered: 0 },
          branches: { total: 0, covered: 0 },
          statements: { total: 0, covered: 0 }
        }
      } else if (currentFile && line.startsWith('LF:')) {
        files[currentFile].lines.total = parseInt(line.substring(3))
      } else if (currentFile && line.startsWith('LH:')) {
        files[currentFile].lines.covered = parseInt(line.substring(3))
      } else if (currentFile && line.startsWith('FNF:')) {
        files[currentFile].functions.total = parseInt(line.substring(4))
      } else if (currentFile && line.startsWith('FNH:')) {
        files[currentFile].functions.covered = parseInt(line.substring(4))
      } else if (currentFile && line.startsWith('BRF:')) {
        files[currentFile].branches.total = parseInt(line.substring(4))
      } else if (currentFile && line.startsWith('BRH:')) {
        files[currentFile].branches.covered = parseInt(line.substring(4))
      }
    })

    // 计算总体覆盖率
    const totals = {
      lines: { total: 0, covered: 0 },
      functions: { total: 0, covered: 0 },
      branches: { total: 0, covered: 0 },
      statements: { total: 0, covered: 0 }
    }

    Object.values(files).forEach(file => {
      Object.keys(totals).forEach(key => {
        totals[key].total += file[key].total
        totals[key].covered += file[key].covered
      })
    })

    // 计算百分比
    Object.keys(totals).forEach(key => {
      totals[key].percentage = totals[key].total > 0 ?
        (totals[key].covered / totals[key].total) * 100 : 0
    })

    return {
      files,
      totals,
      fileCount: Object.keys(files).length
    }
  }

  /**
   * 存储测试结果
   */
  async storeResult(result) {
    const id = `${result.framework}-${Date.now()}`
    this.results.set(id, result)

    // 保存到文件
    if (this.options.formats.includes('json')) {
      const outputPath = path.join(this.options.outputDir, `${id}.json`)
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
    }

    // 更新指标
    await this.updateMetrics(result)

    console.log(`存储测试结果: ${result.framework} - ${result.summary.totalTests} tests`)
  }

  /**
   * 更新指标
   */
  async updateMetrics(result) {
    const framework = result.framework
    const existing = this.metrics.get(framework) || {
      totalRuns: 0,
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalSkipped: 0,
      totalDuration: 0,
      successRate: 0,
      lastRun: null,
      history: []
    }

    existing.totalRuns++
    existing.totalTests += result.summary.totalTests
    existing.totalPassed += result.summary.passedTests
    existing.totalFailed += result.summary.failedTests
    existing.totalSkipped += result.summary.skippedTests
    existing.totalDuration += result.summary.duration
    existing.successRate = existing.totalTests > 0 ?
      ((existing.totalPassed / existing.totalTests) * 100) : 0
    existing.lastRun = result.timestamp

    // 保留最近10次运行的历史
    existing.history.unshift({
      timestamp: result.timestamp,
      success: result.summary.success,
      duration: result.summary.duration,
      tests: result.summary.totalTests,
      passed: result.summary.passedTests,
      failed: result.summary.failedTests
    })

    if (existing.history.length > 10) {
      existing.history = existing.history.slice(0, 10)
    }

    this.metrics.set(framework, existing)

    // 保存指标
    const metricsPath = path.join(this.options.outputDir, 'metrics.json')
    fs.writeFileSync(metricsPath, JSON.stringify(Object.fromEntries(this.metrics), null, 2))
  }

  /**
   * 获取结果统计
   */
  getStats() {
    const stats = {
      totalResults: this.results.size,
      frameworks: {},
      overall: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        totalSkipped: 0,
        successRate: 0
      }
    }

    for (const [framework, metrics] of this.metrics) {
      stats.frameworks[framework] = {
        runs: metrics.totalRuns,
        tests: metrics.totalTests,
        passed: metrics.totalPassed,
        failed: metrics.totalFailed,
        skipped: metrics.totalSkipped,
        successRate: metrics.successRate,
        lastRun: metrics.lastRun
      }

      stats.overall.totalTests += metrics.totalTests
      stats.overall.totalPassed += metrics.totalPassed
      stats.overall.totalFailed += metrics.totalFailed
      stats.overall.totalSkipped += metrics.totalSkipped
    }

    stats.overall.successRate = stats.overall.totalTests > 0 ?
      (stats.overall.totalPassed / stats.overall.totalTests) * 100 : 0

    return stats
  }

  /**
   * 获取指定框架的结果
   */
  getResultsByFramework(framework, limit = 10) {
    const results = Array.from(this.results.values())
      .filter(result => result.framework === framework)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return results.slice(0, limit)
  }

  /**
   * 清理资源
   */
  cleanup() {
    console.log('清理测试结果收集器资源...')

    // 停止文件监听
    if (this.options.realtime) {
      // 清理所有文件监听器
    }

    // 保存最终统计
    const finalStats = this.getStats()
    const finalStatsPath = path.join(this.options.outputDir, 'final-stats.json')
    fs.writeFileSync(finalStatsPath, JSON.stringify(finalStats, null, 2))

    console.log(`最终统计已保存到: ${finalStatsPath}`)
  }

  /**
   * 启动收集器
   */
  async start() {
    console.log('启动测试结果收集器...')
    console.log(`输出目录: ${this.options.outputDir}`)
    console.log(`实时模式: ${this.options.realtime}`)
    console.log(`支持格式: ${this.options.formats.join(', ')}`)

    if (!this.options.watchMode) {
      // 单次收集模式，处理现有的结果文件
      await this.collectExistingResults()
    }
  }

  /**
   * 收集现有的结果文件
   */
  async collectExistingResults() {
    const resultFiles = [
      'coverage/coverage-final.json',
      'coverage/lcov.info',
      'playwright-report/results.json',
      'playwright-report/index.html',
      'test-results.json',
      'coverage/coverage-summary.json'
    ]

    for (const file of resultFiles) {
      if (fs.existsSync(file)) {
        console.log(`处理现有结果文件: ${file}`)
        await this.processFile(file)
      }
    }
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2)
  const options = {
    watchMode: args.includes('--watch'),
    outputDir: args.find((arg, index) => arg === '--output' && args[index + 1])?.[index + 1] || './test-results',
    formats: args.find((arg, index) => arg === '--formats' && args[index + 1])?.[index + 1]?.split(',') || ['json'],
    realtime: args.includes('--realtime')
  }

  const collector = new TestResultCollector(options)

  try {
    await collector.start()

    if (options.watchMode) {
      console.log('进入监听模式... (按 Ctrl+C 退出)')
      // 保持进程运行
      process.stdin.resume()
    } else {
      // 显示统计信息
      const stats = collector.getStats()
      console.log('\n=== 测试结果统计 ===')
      console.log(`总结果数: ${stats.totalResults}`)
      console.log(`整体成功率: ${stats.overall.successRate.toFixed(2)}%`)
      console.log(`总测试数: ${stats.overall.totalTests}`)
      console.log(`通过: ${stats.overall.totalPassed}`)
      console.log(`失败: ${stats.overall.totalFailed}`)
      console.log(`跳过: ${stats.overall.totalSkipped}`)
    }
  } catch (error) {
    console.error('收集器运行失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('未处理的错误:', error)
    process.exit(1)
  })
}

module.exports = TestResultCollector
