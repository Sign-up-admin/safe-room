#!/usr/bin/env node

/**
 * 测试指标聚合器
 *
 * 聚合和分析测试结果指标，提供趋势分析和健康度评估
 */

const fs = require('fs')
const path = require('path')

class TestMetricsAggregator {
  constructor(options = {}) {
    this.options = {
      dataDir: options.dataDir || path.join(process.cwd(), 'test-results'),
      historyFile: options.historyFile || path.join(process.cwd(), 'test-results', 'metrics-history.json'),
      retentionDays: options.retentionDays || 30,
      ...options
    }

    this.metrics = []
    this.aggregatedData = null
    this.loadHistory()
  }

  /**
   * 加载历史指标数据
   */
  loadHistory() {
    try {
      if (fs.existsSync(this.options.historyFile)) {
        const data = JSON.parse(fs.readFileSync(this.options.historyFile, 'utf8'))
        this.metrics = Array.isArray(data) ? data : []
      } else {
        this.metrics = []
      }
    } catch (error) {
      console.warn('加载历史指标失败:', error.message)
      this.metrics = []
    }
  }

  /**
   * 保存历史指标数据
   */
  saveHistory() {
    try {
      const dir = path.dirname(this.options.historyFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.options.historyFile, JSON.stringify(this.metrics, null, 2))
    } catch (error) {
      console.error('保存历史指标失败:', error.message)
    }
  }

  /**
   * 添加新的指标数据
   */
  addMetrics(resultData) {
    const metric = {
      id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: resultData.timestamp || new Date().toISOString(),
      framework: resultData.framework,
      source: resultData.source,
      summary: resultData.summary,
      coverage: resultData.coverage,
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        timestamp: new Date().toISOString()
      }
    }

    this.metrics.push(metric)

    // 清理过期数据
    this.cleanupOldMetrics()

    // 保存到历史文件
    this.saveHistory()

    console.log(`添加指标数据: ${metric.framework} - ${metric.summary.totalTests} tests`)
    return metric
  }

  /**
   * 清理过期指标数据
   */
  cleanupOldMetrics() {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.options.retentionDays)

    const originalLength = this.metrics.length
    this.metrics = this.metrics.filter(metric => {
      const metricDate = new Date(metric.timestamp)
      return metricDate >= cutoffDate
    })

    const removedCount = originalLength - this.metrics.length
    if (removedCount > 0) {
      console.log(`清理了 ${removedCount} 条过期指标数据`)
    }
  }

  /**
   * 获取聚合数据
   */
  getAggregatedData(timeRange = 'all') {
    if (this.aggregatedData && this.aggregatedData.timeRange === timeRange) {
      return this.aggregatedData
    }

    const filteredMetrics = this.filterMetricsByTimeRange(timeRange)

    const aggregated = {
      timeRange,
      totalRuns: filteredMetrics.length,
      frameworks: {},
      overall: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        totalSkipped: 0,
        totalDuration: 0,
        successRate: 0,
        avgDuration: 0,
        coverage: null
      },
      trends: this.calculateTrends(filteredMetrics),
      health: this.calculateHealthScore(filteredMetrics),
      generatedAt: new Date().toISOString()
    }

    // 按框架聚合
    const frameworkGroups = {}
    filteredMetrics.forEach(metric => {
      const framework = metric.framework
      if (!frameworkGroups[framework]) {
        frameworkGroups[framework] = []
      }
      frameworkGroups[framework].push(metric)
    })

    // 计算每个框架的统计
    Object.keys(frameworkGroups).forEach(framework => {
      const frameworkMetrics = frameworkGroups[framework]
      const stats = this.calculateFrameworkStats(frameworkMetrics)

      aggregated.frameworks[framework] = stats
      aggregated.overall.totalTests += stats.totalTests
      aggregated.overall.totalPassed += stats.totalPassed
      aggregated.overall.totalFailed += stats.totalFailed
      aggregated.overall.totalSkipped += stats.totalSkipped
      aggregated.overall.totalDuration += stats.totalDuration
    })

    // 计算整体统计
    if (aggregated.overall.totalTests > 0) {
      aggregated.overall.successRate =
        (aggregated.overall.totalPassed / aggregated.overall.totalTests) * 100
    }

    if (aggregated.totalRuns > 0) {
      aggregated.overall.avgDuration = aggregated.overall.totalDuration / aggregated.totalRuns
    }

    // 计算覆盖率（如果有的话）
    aggregated.overall.coverage = this.calculateOverallCoverage(filteredMetrics)

    this.aggregatedData = aggregated
    return aggregated
  }

  /**
   * 按时间范围过滤指标
   */
  filterMetricsByTimeRange(timeRange) {
    const now = new Date()
    let cutoffDate

    switch (timeRange) {
      case 'hour':
        cutoffDate = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case 'day':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        return this.metrics
    }

    return this.metrics.filter(metric => {
      const metricDate = new Date(metric.timestamp)
      return metricDate >= cutoffDate
    })
  }

  /**
   * 计算框架统计
   */
  calculateFrameworkStats(frameworkMetrics) {
    const stats = {
      runs: frameworkMetrics.length,
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalSkipped: 0,
      totalDuration: 0,
      successRate: 0,
      avgDuration: 0,
      coverage: null,
      recentRuns: [],
      lastRun: null
    }

    frameworkMetrics.forEach(metric => {
      stats.totalTests += metric.summary.totalTests
      stats.totalPassed += metric.summary.passedTests
      stats.totalFailed += metric.summary.failedTests
      stats.totalSkipped += metric.summary.skippedTests
      stats.totalDuration += metric.summary.duration

      if (metric.coverage) {
        stats.coverage = stats.coverage || {}
        // 合并覆盖率数据
        Object.keys(metric.coverage).forEach(key => {
          if (!stats.coverage[key]) {
            stats.coverage[key] = { ...metric.coverage[key] }
          } else {
            stats.coverage[key].total += metric.coverage[key].total
            stats.coverage[key].covered += metric.coverage[key].covered
            stats.coverage[key].percentage =
              stats.coverage[key].total > 0 ?
                (stats.coverage[key].covered / stats.coverage[key].total) * 100 : 0
          }
        })
      }
    })

    if (stats.totalTests > 0) {
      stats.successRate = (stats.totalPassed / stats.totalTests) * 100
    }

    if (stats.runs > 0) {
      stats.avgDuration = stats.totalDuration / stats.runs
    }

    // 获取最近的运行记录
    stats.recentRuns = frameworkMetrics
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map(m => ({
        timestamp: m.timestamp,
        success: m.summary.success,
        duration: m.summary.duration,
        tests: m.summary.totalTests
      }))

    if (frameworkMetrics.length > 0) {
      stats.lastRun = frameworkMetrics
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
        .timestamp
    }

    return stats
  }

  /**
   * 计算整体覆盖率
   */
  calculateOverallCoverage(metrics) {
    const coverageMetrics = metrics.filter(m => m.coverage).map(m => m.coverage)
    if (coverageMetrics.length === 0) return null

    const overallCoverage = {
      lines: { total: 0, covered: 0, percentage: 0 },
      functions: { total: 0, covered: 0, percentage: 0 },
      branches: { total: 0, covered: 0, percentage: 0 },
      statements: { total: 0, covered: 0, percentage: 0 }
    }

    coverageMetrics.forEach(coverage => {
      Object.keys(overallCoverage).forEach(key => {
        if (coverage[key]) {
          overallCoverage[key].total += coverage[key].total || 0
          overallCoverage[key].covered += coverage[key].covered || 0
        }
      })
    })

    // 计算百分比
    Object.keys(overallCoverage).forEach(key => {
      const metric = overallCoverage[key]
      metric.percentage = metric.total > 0 ? (metric.covered / metric.total) * 100 : 0
    })

    return overallCoverage
  }

  /**
   * 计算趋势
   */
  calculateTrends(metrics) {
    if (metrics.length < 2) {
      return {
        successRateTrend: 'stable',
        durationTrend: 'stable',
        testCountTrend: 'stable',
        coverageTrend: 'stable'
      }
    }

    // 按时间排序
    const sortedMetrics = metrics.sort((a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp)
    )

    const trends = {
      successRateTrend: this.calculateTrend(
        sortedMetrics.map(m => (m.summary.totalTests > 0 ?
          (m.summary.passedTests / m.summary.totalTests) * 100 : 0))
      ),
      durationTrend: this.calculateTrend(
        sortedMetrics.map(m => m.summary.duration)
      ),
      testCountTrend: this.calculateTrend(
        sortedMetrics.map(m => m.summary.totalTests)
      ),
      coverageTrend: this.calculateCoverageTrend(sortedMetrics)
    }

    return trends
  }

  /**
   * 计算单个指标的趋势
   */
  calculateTrend(values) {
    if (values.length < 2) return 'stable'

    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100

    if (changePercent > 5) return 'increasing'
    if (changePercent < -5) return 'decreasing'
    return 'stable'
  }

  /**
   * 计算覆盖率趋势
   */
  calculateCoverageTrend(metrics) {
    const coverageValues = metrics
      .filter(m => m.coverage && m.coverage.lines)
      .map(m => m.coverage.lines.percentage)

    return this.calculateTrend(coverageValues)
  }

  /**
   * 计算健康度评分
   */
  calculateHealthScore(metrics) {
    if (metrics.length === 0) {
      return {
        score: 0,
        level: 'unknown',
        factors: {}
      }
    }

    const aggregated = this.getAggregatedData()
    const factors = {
      successRate: Math.min(aggregated.overall.successRate / 100, 1) * 40, // 40%
      testCoverage: aggregated.overall.coverage ?
        Math.min(aggregated.overall.coverage.lines.percentage / 100, 1) * 30 : 0, // 30%
      consistency: this.calculateConsistencyScore(metrics) * 20, // 20%
      recentPerformance: this.calculateRecentPerformanceScore(metrics) * 10 // 10%
    }

    const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0)

    let level
    if (totalScore >= 80) level = 'excellent'
    else if (totalScore >= 70) level = 'good'
    else if (totalScore >= 60) level = 'fair'
    else if (totalScore >= 50) level = 'poor'
    else level = 'critical'

    return {
      score: Math.round(totalScore),
      level,
      factors
    }
  }

  /**
   * 计算一致性评分
   */
  calculateConsistencyScore(metrics) {
    if (metrics.length < 2) return 1

    const successRates = metrics.map(m =>
      m.summary.totalTests > 0 ?
        (m.summary.passedTests / m.summary.totalTests) : 0
    )

    const avg = successRates.reduce((sum, rate) => sum + rate, 0) / successRates.length
    const variance = successRates.reduce((sum, rate) => sum + Math.pow(rate - avg, 2), 0) / successRates.length
    const stdDev = Math.sqrt(variance)

    // 标准差越小，一致性越高
    return Math.max(0, 1 - (stdDev * 2))
  }

  /**
   * 计算近期性能评分
   */
  calculateRecentPerformanceScore(metrics) {
    if (metrics.length === 0) return 0

    // 获取最近5次运行
    const recentMetrics = metrics
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)

    const recentSuccessRate = recentMetrics.reduce((sum, m) => {
      const rate = m.summary.totalTests > 0 ?
        (m.summary.passedTests / m.summary.totalTests) : 0
      return sum + rate
    }, 0) / recentMetrics.length

    return recentSuccessRate
  }

  /**
   * 获取报告数据
   */
  generateReport(timeRange = 'week') {
    const aggregated = this.getAggregatedData(timeRange)

    return {
      summary: {
        timeRange,
        generatedAt: aggregated.generatedAt,
        totalRuns: aggregated.totalRuns,
        healthScore: aggregated.health.score,
        healthLevel: aggregated.health.level
      },
      overall: aggregated.overall,
      frameworks: aggregated.frameworks,
      trends: aggregated.trends,
      recommendations: this.generateRecommendations(aggregated)
    }
  }

  /**
   * 生成建议
   */
  generateRecommendations(aggregated) {
    const recommendations = []

    // 基于成功率
    if (aggregated.overall.successRate < 80) {
      recommendations.push('测试成功率偏低，建议修复失败的测试用例')
    }

    // 基于覆盖率
    if (aggregated.overall.coverage && aggregated.overall.coverage.lines.percentage < 70) {
      recommendations.push('代码覆盖率不足，建议增加单元测试覆盖')
    }

    // 基于趋势
    if (aggregated.trends.successRateTrend === 'decreasing') {
      recommendations.push('测试成功率呈下降趋势，需要及时关注')
    }

    if (aggregated.trends.durationTrend === 'increasing') {
      recommendations.push('测试执行时间增加，建议优化测试性能')
    }

    // 基于健康度
    if (aggregated.health.score < 60) {
      recommendations.push('整体测试健康度不佳，需要全面改进测试质量')
    }

    return recommendations
  }

  /**
   * 导出数据
   */
  exportData(format = 'json', outputPath = null) {
    const report = this.generateReport()

    let content
    let fileExtension

    switch (format) {
      case 'json':
        content = JSON.stringify(report, null, 2)
        fileExtension = 'json'
        break
      case 'csv':
        content = this.convertToCSV(report)
        fileExtension = 'csv'
        break
      default:
        throw new Error(`不支持的导出格式: ${format}`)
    }

    const finalPath = outputPath || path.join(this.options.dataDir, `metrics-report.${fileExtension}`)

    fs.writeFileSync(finalPath, content)
    console.log(`指标报告已导出到: ${finalPath}`)

    return finalPath
  }

  /**
   * 转换为CSV格式
   */
  convertToCSV(report) {
    const lines = []

    // 标题
    lines.push('Metric,Value,Unit')

    // 整体统计
    lines.push(`Total Runs,${report.overall.totalTests},tests`)
    lines.push(`Passed Tests,${report.overall.totalPassed},tests`)
    lines.push(`Failed Tests,${report.overall.totalFailed},tests`)
    lines.push(`Skipped Tests,${report.overall.totalSkipped},tests`)
    lines.push(`Success Rate,${report.overall.successRate.toFixed(2)},%`)
    lines.push(`Average Duration,${report.overall.avgDuration.toFixed(2)},ms`)

    // 覆盖率
    if (report.overall.coverage) {
      lines.push(`Line Coverage,${report.overall.coverage.lines.percentage.toFixed(2)},%`)
      lines.push(`Function Coverage,${report.overall.coverage.functions.percentage.toFixed(2)},%`)
      lines.push(`Branch Coverage,${report.overall.coverage.branches.percentage.toFixed(2)},%`)
    }

    return lines.join('\n')
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  const options = {
    dataDir: args.find((arg, index) => arg === '--data-dir' && args[index + 1])?.[index + 1] || './test-results',
    timeRange: args.find((arg, index) => arg === '--time-range' && args[index + 1])?.[index + 1] || 'week',
    format: args.find((arg, index) => arg === '--format' && args[index + 1])?.[index + 1] || 'json',
    output: args.find((arg, index) => arg === '--output' && args[index + 1])?.[index + 1]
  }

  const aggregator = new TestMetricsAggregator(options)

  try {
    switch (command) {
      case 'report':
        const report = aggregator.generateReport(options.timeRange)
        console.log('=== 测试指标报告 ===')
        console.log(`时间范围: ${options.timeRange}`)
        console.log(`总运行次数: ${report.summary.totalRuns}`)
        console.log(`健康度评分: ${report.summary.healthScore}/100 (${report.summary.healthLevel})`)
        console.log(`成功率: ${report.overall.successRate.toFixed(2)}%`)
        console.log(`平均执行时间: ${report.overall.avgDuration.toFixed(2)}ms`)

        if (report.overall.coverage) {
          console.log(`行覆盖率: ${report.overall.coverage.lines.percentage.toFixed(2)}%`)
        }

        if (report.recommendations.length > 0) {
          console.log('\n建议:')
          report.recommendations.forEach(rec => console.log(`- ${rec}`))
        }
        break

      case 'export':
        const outputPath = aggregator.exportData(options.format, options.output)
        console.log(`报告已导出到: ${outputPath}`)
        break

      case 'stats':
        const stats = aggregator.getAggregatedData(options.timeRange)
        console.log(JSON.stringify(stats, null, 2))
        break

      default:
        console.log('使用方法:')
        console.log('  node metrics-aggregator.js report [--time-range <range>]')
        console.log('  node metrics-aggregator.js export [--format <format>] [--output <path>]')
        console.log('  node metrics-aggregator.js stats [--time-range <range>]')
        console.log('')
        console.log('选项:')
        console.log('  --time-range: hour|day|week|month|all (默认: week)')
        console.log('  --format: json|csv (默认: json)')
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

module.exports = TestMetricsAggregator
