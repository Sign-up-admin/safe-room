#!/usr/bin/env node

/**
 * 测试历史管理器
 *
 * 管理测试结果的历史数据，提供查询、清理和分析功能
 */

const fs = require('fs')
const path = require('path')

class TestHistoryManager {
  constructor(options = {}) {
    this.options = {
      dataDir: options.dataDir || path.join(process.cwd(), 'test-results'),
      historyFile: options.historyFile || path.join(process.cwd(), 'test-results', 'test-history.json'),
      maxEntries: options.maxEntries || 1000,
      retentionDays: options.retentionDays || 90,
      ...options
    }

    this.history = []
    this.indexes = {
      byFramework: new Map(),
      byDate: new Map(),
      byStatus: new Map(),
      bySource: new Map()
    }

    this.loadHistory()
    this.buildIndexes()
  }

  /**
   * 加载历史数据
   */
  loadHistory() {
    try {
      if (fs.existsSync(this.options.historyFile)) {
        const data = JSON.parse(fs.readFileSync(this.options.historyFile, 'utf8'))
        this.history = Array.isArray(data) ? data : []
      } else {
        this.history = []
      }
    } catch (error) {
      console.warn('加载历史数据失败:', error.message)
      this.history = []
    }
  }

  /**
   * 保存历史数据
   */
  saveHistory() {
    try {
      const dir = path.dirname(this.options.historyFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.options.historyFile, JSON.stringify(this.history, null, 2))
    } catch (error) {
      console.error('保存历史数据失败:', error.message)
    }
  }

  /**
   * 构建索引
   */
  buildIndexes() {
    this.indexes.byFramework.clear()
    this.indexes.byDate.clear()
    this.indexes.byStatus.clear()
    this.indexes.bySource.clear()

    this.history.forEach((entry, index) => {
      // 按框架索引
      const framework = entry.framework || 'unknown'
      if (!this.indexes.byFramework.has(framework)) {
        this.indexes.byFramework.set(framework, [])
      }
      this.indexes.byFramework.get(framework).push(index)

      // 按日期索引
      const date = new Date(entry.timestamp).toISOString().split('T')[0]
      if (!this.indexes.byDate.has(date)) {
        this.indexes.byDate.set(date, [])
      }
      this.indexes.byDate.get(date).push(index)

      // 按状态索引
      const status = entry.summary?.success ? 'passed' : 'failed'
      if (!this.indexes.byStatus.has(status)) {
        this.indexes.byStatus.set(status, [])
      }
      this.indexes.byStatus.get(status).push(index)

      // 按来源索引
      const source = entry.source || 'unknown'
      if (!this.indexes.bySource.has(source)) {
        this.indexes.bySource.set(source, [])
      }
      this.indexes.bySource.get(source).push(index)
    })
  }

  /**
   * 添加历史条目
   */
  addEntry(entry) {
    const historyEntry = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      framework: entry.framework,
      source: entry.source,
      summary: entry.summary,
      coverage: entry.coverage,
      testSuites: entry.testSuites,
      metadata: {
        ...entry.metadata,
        storedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    }

    this.history.unshift(historyEntry)

    // 清理过期数据
    this.cleanupOldEntries()

    // 重建索引
    this.buildIndexes()

    // 保存到文件
    this.saveHistory()

    console.log(`添加历史条目: ${historyEntry.framework} - ${historyEntry.id}`)
    return historyEntry
  }

  /**
   * 清理过期条目
   */
  cleanupOldEntries() {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.options.retentionDays)

    const originalLength = this.history.length
    this.history = this.history.filter(entry => {
      const entryDate = new Date(entry.timestamp)
      return entryDate >= cutoffDate
    })

    // 限制最大条目数
    if (this.history.length > this.options.maxEntries) {
      this.history = this.history.slice(0, this.options.maxEntries)
    }

    const removedCount = originalLength - this.history.length
    if (removedCount > 0) {
      console.log(`清理了 ${removedCount} 条过期历史数据`)
    }
  }

  /**
   * 查询历史数据
   */
  query(options = {}) {
    const {
      framework,
      dateFrom,
      dateTo,
      status,
      source,
      limit = 50,
      offset = 0,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = options

    let indexes = []

    // 应用过滤器
    if (framework) {
      indexes = this.indexes.byFramework.get(framework) || []
    } else if (status) {
      indexes = this.indexes.byStatus.get(status) || []
    } else if (source) {
      indexes = this.indexes.bySource.get(source) || []
    } else {
      // 没有过滤器，返回所有索引
      indexes = Array.from({ length: this.history.length }, (_, i) => i)
    }

    // 应用日期过滤
    if (dateFrom || dateTo) {
      indexes = indexes.filter(index => {
        const entry = this.history[index]
        const entryDate = new Date(entry.timestamp)

        if (dateFrom && entryDate < new Date(dateFrom)) return false
        if (dateTo && entryDate > new Date(dateTo)) return false

        return true
      })
    }

    // 排序
    indexes.sort((a, b) => {
      const entryA = this.history[a]
      const entryB = this.history[b]

      let comparison = 0

      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(entryA.timestamp) - new Date(entryB.timestamp)
          break
        case 'duration':
          comparison = (entryA.summary?.duration || 0) - (entryB.summary?.duration || 0)
          break
        case 'tests':
          comparison = (entryA.summary?.totalTests || 0) - (entryB.summary?.totalTests || 0)
          break
        default:
          comparison = 0
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    // 应用分页
    const paginatedIndexes = indexes.slice(offset, offset + limit)

    // 获取结果
    const results = paginatedIndexes.map(index => this.history[index])

    return {
      results,
      total: indexes.length,
      limit,
      offset,
      hasMore: offset + limit < indexes.length
    }
  }

  /**
   * 获取统计信息
   */
  getStats(options = {}) {
    const { framework, dateFrom, dateTo } = options

    // 获取过滤后的数据
    const queryResult = this.query({ framework, dateFrom, dateTo, limit: this.history.length })
    const entries = queryResult.results

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        dateRange: { from: null, to: null },
        frameworks: {},
        successRate: 0,
        avgDuration: 0,
        totalTests: 0
      }
    }

    const stats = {
      totalEntries: entries.length,
      dateRange: {
        from: entries[entries.length - 1].timestamp,
        to: entries[0].timestamp
      },
      frameworks: {},
      successRate: 0,
      avgDuration: 0,
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalSkipped: 0
    }

    // 按框架分组统计
    const frameworkGroups = {}
    entries.forEach(entry => {
      const fw = entry.framework || 'unknown'
      if (!frameworkGroups[fw]) {
        frameworkGroups[fw] = []
      }
      frameworkGroups[fw].push(entry)
    })

    Object.keys(frameworkGroups).forEach(fw => {
      const fwEntries = frameworkGroups[fw]
      const fwStats = {
        count: fwEntries.length,
        successRate: 0,
        avgDuration: 0,
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0
      }

      fwEntries.forEach(entry => {
        if (entry.summary) {
          fwStats.totalTests += entry.summary.totalTests || 0
          fwStats.totalPassed += entry.summary.passedTests || 0
          fwStats.totalFailed += entry.summary.failedTests || 0
          fwStats.avgDuration += entry.summary.duration || 0
        }
      })

      fwStats.successRate = fwStats.totalTests > 0 ?
        (fwStats.totalPassed / fwStats.totalTests) * 100 : 0
      fwStats.avgDuration = fwStats.count > 0 ?
        fwStats.avgDuration / fwStats.count : 0

      stats.frameworks[fw] = fwStats

      stats.totalTests += fwStats.totalTests
      stats.totalPassed += fwStats.totalPassed
      stats.totalFailed += fwStats.totalFailed
    })

    stats.successRate = stats.totalTests > 0 ?
      (stats.totalPassed / stats.totalTests) * 100 : 0
    stats.avgDuration = entries.reduce((sum, entry) =>
      sum + (entry.summary?.duration || 0), 0) / entries.length

    return stats
  }

  /**
   * 获取趋势分析
   */
  getTrends(options = {}) {
    const { framework, days = 30, interval = 'day' } = options

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // 获取时间范围内的数据
    const entries = this.query({
      framework,
      dateFrom: startDate.toISOString(),
      dateTo: endDate.toISOString(),
      limit: this.history.length
    }).results

    if (entries.length === 0) {
      return {
        successRate: [],
        duration: [],
        testCount: [],
        coverage: []
      }
    }

    // 按时间间隔分组
    const grouped = this.groupByInterval(entries, interval)

    const trends = {
      successRate: [],
      duration: [],
      testCount: [],
      coverage: []
    }

    Object.keys(grouped).sort().forEach(dateKey => {
      const dayEntries = grouped[dateKey]
      const dayStats = this.calculateDayStats(dayEntries)

      trends.successRate.push({
        date: dateKey,
        value: dayStats.successRate
      })

      trends.duration.push({
        date: dateKey,
        value: dayStats.avgDuration
      })

      trends.testCount.push({
        date: dateKey,
        value: dayStats.totalTests
      })

      if (dayStats.coverage) {
        trends.coverage.push({
          date: dateKey,
          value: dayStats.coverage.lines?.percentage || 0
        })
      }
    })

    return trends
  }

  /**
   * 按时间间隔分组
   */
  groupByInterval(entries, interval) {
    const grouped = {}

    entries.forEach(entry => {
      const date = new Date(entry.timestamp)
      let key

      switch (interval) {
        case 'hour':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`
          break
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        default:
          key = date.toISOString().split('T')[0]
      }

      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(entry)
    })

    return grouped
  }

  /**
   * 计算一天的统计
   */
  calculateDayStats(entries) {
    const stats = {
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalDuration: 0,
      successRate: 0,
      avgDuration: 0,
      coverage: null
    }

    entries.forEach(entry => {
      if (entry.summary) {
        stats.totalTests += entry.summary.totalTests || 0
        stats.totalPassed += entry.summary.passedTests || 0
        stats.totalFailed += entry.summary.failedTests || 0
        stats.totalDuration += entry.summary.duration || 0
      }

      if (entry.coverage) {
        stats.coverage = entry.coverage
      }
    })

    stats.successRate = stats.totalTests > 0 ?
      (stats.totalPassed / stats.totalTests) * 100 : 0
    stats.avgDuration = entries.length > 0 ?
      stats.totalDuration / entries.length : 0

    return stats
  }

  /**
   * 查找相似失败模式
   */
  findFailurePatterns(options = {}) {
    const { framework, days = 7, minOccurrences = 2 } = options

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // 获取失败的测试
    const failedEntries = this.query({
      framework,
      status: 'failed',
      dateFrom: startDate.toISOString(),
      dateTo: endDate.toISOString(),
      limit: this.history.length
    }).results

    const failurePatterns = {}

    failedEntries.forEach(entry => {
      if (entry.testSuites) {
        entry.testSuites.forEach(suite => {
          if (suite.tests) {
            suite.tests.forEach(test => {
              if (test.status === 'failed' && test.error) {
                const errorKey = this.normalizeError(test.error)

                if (!failurePatterns[errorKey]) {
                  failurePatterns[errorKey] = {
                    error: errorKey,
                    occurrences: 0,
                    tests: [],
                    lastSeen: entry.timestamp,
                    frameworks: new Set(),
                    sources: new Set()
                  }
                }

                const pattern = failurePatterns[errorKey]
                pattern.occurrences++
                pattern.tests.push({
                  name: test.name,
                  suite: suite.name,
                  timestamp: entry.timestamp
                })
                pattern.frameworks.add(entry.framework)
                pattern.sources.add(entry.source)
                pattern.lastSeen = entry.timestamp
              }
            })
          }
        })
      }
    })

    // 过滤掉发生次数少的模式
    const significantPatterns = Object.values(failurePatterns)
      .filter(pattern => pattern.occurrences >= minOccurrences)
      .map(pattern => ({
        ...pattern,
        frameworks: Array.from(pattern.frameworks),
        sources: Array.from(pattern.sources)
      }))
      .sort((a, b) => b.occurrences - a.occurrences)

    return significantPatterns
  }

  /**
   * 标准化错误信息
   */
  normalizeError(error) {
    // 提取错误的核心信息，忽略具体的数值和时间戳
    const normalized = error
      .replace(/\d+/g, 'NUMBER')
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, 'TIMESTAMP')
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, 'UUID')
      .replace(/at\s+.*?\.js:\d+:\d+/g, 'at FILE:LINE:COLUMN')
      .slice(0, 200) // 限制长度

    return normalized
  }

  /**
   * 导出数据
   */
  exportData(options = {}) {
    const { format = 'json', outputPath, queryOptions = {} } = options

    const data = this.query(queryOptions)

    let content
    let fileExtension

    switch (format) {
      case 'json':
        content = JSON.stringify(data.results, null, 2)
        fileExtension = 'json'
        break
      case 'csv':
        content = this.convertToCSV(data.results)
        fileExtension = 'csv'
        break
      default:
        throw new Error(`不支持的导出格式: ${format}`)
    }

    const finalPath = outputPath || path.join(this.options.dataDir, `history-export.${fileExtension}`)

    fs.writeFileSync(finalPath, content)
    console.log(`历史数据已导出到: ${finalPath}`)

    return finalPath
  }

  /**
   * 转换为CSV格式
   */
  convertToCSV(entries) {
    const lines = []

    // CSV头部
    lines.push('ID,Timestamp,Framework,Source,Total Tests,Passed,Failed,Skipped,Duration,Success')

    // 数据行
    entries.forEach(entry => {
      const row = [
        entry.id,
        entry.timestamp,
        entry.framework,
        entry.source,
        entry.summary?.totalTests || 0,
        entry.summary?.passedTests || 0,
        entry.summary?.failedTests || 0,
        entry.summary?.skippedTests || 0,
        entry.summary?.duration || 0,
        entry.summary?.success ? 'true' : 'false'
      ]

      lines.push(row.map(field => `"${field}"`).join(','))
    })

    return lines.join('\n')
  }

  /**
   * 获取存储信息
   */
  getStorageInfo() {
    const stats = fs.statSync(this.options.historyFile)
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)

    return {
      filePath: this.options.historyFile,
      fileSize: `${sizeMB} MB`,
      totalEntries: this.history.length,
      oldestEntry: this.history.length > 0 ? this.history[this.history.length - 1].timestamp : null,
      newestEntry: this.history.length > 0 ? this.history[0].timestamp : null,
      frameworks: Array.from(this.indexes.byFramework.keys()),
      retentionDays: this.options.retentionDays,
      maxEntries: this.options.maxEntries
    }
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  const options = {
    dataDir: args.find((arg, index) => arg === '--data-dir' && args[index + 1])?.[index + 1] || './test-results',
    framework: args.find((arg, index) => arg === '--framework' && args[index + 1])?.[index + 1],
    limit: parseInt(args.find((arg, index) => arg === '--limit' && args[index + 1])?.[index + 1] || '50'),
    format: args.find((arg, index) => arg === '--format' && args[index + 1])?.[index + 1] || 'json',
    output: args.find((arg, index) => arg === '--output' && args[index + 1])?.[index + 1]
  }

  const manager = new TestHistoryManager(options)

  try {
    switch (command) {
      case 'query':
        const queryResult = manager.query({
          framework: options.framework,
          limit: options.limit
        })
        console.log(JSON.stringify(queryResult, null, 2))
        break

      case 'stats':
        const stats = manager.getStats({ framework: options.framework })
        console.log('=== 历史统计 ===')
        console.log(`总条目数: ${stats.totalEntries}`)
        console.log(`日期范围: ${stats.dateRange.from} 至 ${stats.dateRange.to}`)
        console.log(`整体成功率: ${stats.successRate.toFixed(2)}%`)
        console.log(`平均执行时间: ${stats.avgDuration.toFixed(2)}ms`)
        console.log(`总测试数: ${stats.totalTests}`)
        break

      case 'trends':
        const trends = manager.getTrends({ framework: options.framework })
        console.log('=== 趋势分析 ===')
        console.log('成功率趋势:', trends.successRate.slice(-5))
        console.log('执行时间趋势:', trends.duration.slice(-5))
        break

      case 'failures':
        const patterns = manager.findFailurePatterns({ framework: options.framework })
        console.log('=== 失败模式分析 ===')
        patterns.slice(0, 10).forEach((pattern, index) => {
          console.log(`${index + 1}. ${pattern.error.substring(0, 100)}... (${pattern.occurrences} 次)`)
        })
        break

      case 'export':
        const exportPath = manager.exportData({
          format: options.format,
          outputPath: options.output,
          queryOptions: { framework: options.framework, limit: options.limit }
        })
        console.log(`数据已导出到: ${exportPath}`)
        break

      case 'info':
        const info = manager.getStorageInfo()
        console.log('=== 存储信息 ===')
        console.log(`文件路径: ${info.filePath}`)
        console.log(`文件大小: ${info.fileSize}`)
        console.log(`总条目数: ${info.totalEntries}`)
        console.log(`最旧条目: ${info.oldestEntry}`)
        console.log(`最新条目: ${info.newestEntry}`)
        console.log(`框架类型: ${info.frameworks.join(', ')}`)
        break

      default:
        console.log('使用方法:')
        console.log('  node history-manager.js query [--framework <name>] [--limit <num>]')
        console.log('  node history-manager.js stats [--framework <name>]')
        console.log('  node history-manager.js trends [--framework <name>]')
        console.log('  node history-manager.js failures [--framework <name>]')
        console.log('  node history-manager.js export [--format <format>] [--output <path>]')
        console.log('  node history-manager.js info')
        console.log('')
        console.log('选项:')
        console.log('  --framework: 过滤特定框架')
        console.log('  --limit: 查询结果限制 (默认: 50)')
        console.log('  --format: 导出格式 json|csv (默认: json)')
        console.log('  --data-dir: 数据目录路径 (默认: ./test-results)')
        console.log('  --output: 输出文件路径')
        break
    }
  } catch (error) {
    console.error('操作失败:', error.message)
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

module.exports = TestHistoryManager
