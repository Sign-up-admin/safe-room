/**
 * 仪表板API路由
 *
 * 处理仪表板相关的API请求
 */

const express = require('express')

class DashboardAPI {
  constructor(aggregator, historyManager) {
    this.aggregator = aggregator
    this.historyManager = historyManager
    this.router = express.Router()

    this.setupRoutes()
  }

  setupRoutes() {
    // 获取仪表板概览数据
    this.router.get('/overview', this.getOverview.bind(this))

    // 获取实时统计
    this.router.get('/realtime-stats', this.getRealtimeStats.bind(this))

    // 获取健康度评分
    this.router.get('/health-score', this.getHealthScore.bind(this))

    // 获取警报和通知
    this.router.get('/alerts', this.getAlerts.bind(this))

    // 获取推荐操作
    this.router.get('/recommendations', this.getRecommendations.bind(this))
  }

  /**
   * 获取仪表板概览数据
   */
  async getOverview(req, res) {
    try {
      const { timeRange = 'week', includeTrends = 'true' } = req.query

      const overview = this.aggregator.getAggregatedData(timeRange)

      // 如果需要趋势数据，获取更多历史数据
      let trends = null
      if (includeTrends === 'true') {
        trends = this.historyManager.getTrends({
          days: timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 1,
          interval: 'day'
        })
      }

      const response = {
        summary: {
          totalRuns: overview.totalRuns,
          healthScore: overview.health.score,
          healthLevel: overview.health.level,
          successRate: overview.overall.successRate,
          avgDuration: overview.overall.avgDuration,
          totalTests: overview.overall.totalTests,
          coverage: overview.overall.coverage
        },
        frameworks: overview.frameworks,
        trends: trends,
        generatedAt: overview.generatedAt
      }

      res.json({
        success: true,
        data: response
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取仪表板概览失败',
        message: error.message
      })
    }
  }

  /**
   * 获取实时统计数据
   */
  async getRealtimeStats(req, res) {
    try {
      const { timeRange = 'hour' } = req.query

      const stats = this.aggregator.getAggregatedData(timeRange)
      const recentRuns = this.historyManager.query({
        limit: 10,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      })

      const response = {
        current: {
          successRate: stats.overall.successRate,
          totalTests: stats.overall.totalTests,
          avgDuration: stats.overall.avgDuration,
          healthScore: stats.health.score
        },
        recentRuns: recentRuns.results.map(run => ({
          id: run.id,
          framework: run.framework,
          timestamp: run.timestamp,
          success: run.summary.success,
          duration: run.summary.duration,
          tests: run.summary.totalTests
        })),
        lastUpdated: new Date().toISOString()
      }

      res.json({
        success: true,
        data: response
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取实时统计失败',
        message: error.message
      })
    }
  }

  /**
   * 获取健康度评分详情
   */
  async getHealthScore(req, res) {
    try {
      const { timeRange = 'week' } = req.query

      const aggregated = this.aggregator.getAggregatedData(timeRange)
      const healthScore = aggregated.health.score
      const healthLevel = aggregated.health.level

      // 计算健康度各个维度的评分
      const dimensions = {
        successRate: this.calculateSuccessRateScore(aggregated.overall.successRate),
        testCoverage: aggregated.overall.coverage ?
          this.calculateCoverageScore(aggregated.overall.coverage.lines.percentage) : 0,
        consistency: this.calculateConsistencyScore(aggregated),
        performance: this.calculatePerformanceScore(aggregated.overall.avgDuration),
        failureRate: this.calculateFailureRateScore(aggregated.overall.successRate)
      }

      // 计算趋势
      const trends = this.historyManager.getTrends({ days: 7 })
      const trendDirection = this.calculateTrendDirection(trends.successRate)

      const response = {
        overall: {
          score: healthScore,
          level: healthLevel,
          grade: this.scoreToGrade(healthScore)
        },
        dimensions,
        trend: trendDirection,
        factors: aggregated.health.factors,
        recommendations: this.generateHealthRecommendations(dimensions, trendDirection),
        calculatedAt: new Date().toISOString()
      }

      res.json({
        success: true,
        data: response
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取健康度评分失败',
        message: error.message
      })
    }
  }

  /**
   * 获取警报和通知
   */
  async getAlerts(req, res) {
    try {
      const { severity = 'all', limit = 20 } = req.query

      const alerts = []
      const aggregated = this.aggregator.getAggregatedData('week')

      // 成功率警报
      if (aggregated.overall.successRate < 80) {
        alerts.push({
          id: 'low-success-rate',
          type: 'warning',
          severity: 'high',
          title: '测试成功率偏低',
          message: `当前成功率仅为 ${aggregated.overall.successRate.toFixed(1)}%，低于80%阈值`,
          value: aggregated.overall.successRate,
          threshold: 80,
          timestamp: new Date().toISOString()
        })
      }

      // 覆盖率警报
      if (aggregated.overall.coverage && aggregated.overall.coverage.lines.percentage < 70) {
        alerts.push({
          id: 'low-coverage',
          type: 'warning',
          severity: 'medium',
          title: '代码覆盖率不足',
          message: `当前行覆盖率为 ${aggregated.overall.coverage.lines.percentage.toFixed(1)}%，低于70%目标`,
          value: aggregated.overall.coverage.lines.percentage,
          threshold: 70,
          timestamp: new Date().toISOString()
        })
      }

      // 执行时间警报
      if (aggregated.overall.avgDuration > 300000) { // 5分钟
        alerts.push({
          id: 'slow-execution',
          type: 'info',
          severity: 'low',
          title: '测试执行时间较长',
          message: `平均执行时间为 ${(aggregated.overall.avgDuration / 1000).toFixed(1)}秒，建议优化性能`,
          value: aggregated.overall.avgDuration,
          threshold: 300000,
          timestamp: new Date().toISOString()
        })
      }

      // 过滤按严重程度
      let filteredAlerts = alerts
      if (severity !== 'all') {
        const severityLevels = severity.split(',')
        filteredAlerts = alerts.filter(alert => severityLevels.includes(alert.severity))
      }

      // 按时间排序并限制数量
      filteredAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      filteredAlerts = filteredAlerts.slice(0, parseInt(limit))

      res.json({
        success: true,
        data: {
          alerts: filteredAlerts,
          total: filteredAlerts.length,
          severities: {
            critical: filteredAlerts.filter(a => a.severity === 'critical').length,
            high: filteredAlerts.filter(a => a.severity === 'high').length,
            medium: filteredAlerts.filter(a => a.severity === 'medium').length,
            low: filteredAlerts.filter(a => a.severity === 'low').length
          }
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取警报失败',
        message: error.message
      })
    }
  }

  /**
   * 获取推荐操作
   */
  async getRecommendations(req, res) {
    try {
      const { category = 'all', limit = 10 } = req.query

      const recommendations = []
      const aggregated = this.aggregator.getAggregatedData('week')

      // 基于当前状态生成推荐
      if (aggregated.overall.successRate < 90) {
        recommendations.push({
          id: 'improve-success-rate',
          category: 'quality',
          priority: 'high',
          title: '提高测试成功率',
          description: '分析失败的测试用例，修复不稳定的测试',
          impact: 'high',
          effort: 'medium',
          actionable: true
        })
      }

      if (aggregated.overall.coverage && aggregated.overall.coverage.lines.percentage < 80) {
        recommendations.push({
          id: 'increase-coverage',
          category: 'coverage',
          priority: 'medium',
          title: '增加代码覆盖率',
          description: '为未覆盖的代码路径添加单元测试',
          impact: 'medium',
          effort: 'high',
          actionable: true
        })
      }

      if (aggregated.overall.avgDuration > 200000) { // 200秒
        recommendations.push({
          id: 'optimize-performance',
          category: 'performance',
          priority: 'medium',
          title: '优化测试性能',
          description: '并行执行测试，减少不必要的等待时间',
          impact: 'medium',
          effort: 'medium',
          actionable: true
        })
      }

      // 检查失败模式
      const failurePatterns = this.historyManager.findFailurePatterns({ days: 7 })
      if (failurePatterns.length > 0) {
        recommendations.push({
          id: 'fix-failure-patterns',
          category: 'stability',
          priority: 'high',
          title: '修复重复失败模式',
          description: `发现 ${failurePatterns.length} 个重复失败模式，需要优先修复`,
          impact: 'high',
          effort: 'high',
          actionable: true,
          metadata: { patternCount: failurePatterns.length }
        })
      }

      // 过滤和排序推荐
      let filteredRecommendations = recommendations

      if (category !== 'all') {
        const categories = category.split(',')
        filteredRecommendations = recommendations.filter(rec =>
          categories.includes(rec.category))
      }

      // 按优先级排序
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      filteredRecommendations.sort((a, b) =>
        priorityOrder[b.priority] - priorityOrder[a.priority])

      filteredRecommendations = filteredRecommendations.slice(0, parseInt(limit))

      res.json({
        success: true,
        data: {
          recommendations: filteredRecommendations,
          total: filteredRecommendations.length,
          categories: {
            quality: filteredRecommendations.filter(r => r.category === 'quality').length,
            coverage: filteredRecommendations.filter(r => r.category === 'coverage').length,
            performance: filteredRecommendations.filter(r => r.category === 'performance').length,
            stability: filteredRecommendations.filter(r => r.category === 'stability').length
          }
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取推荐失败',
        message: error.message
      })
    }
  }

  // ========== 辅助方法 ==========

  calculateSuccessRateScore(successRate) {
    if (successRate >= 95) return 100
    if (successRate >= 90) return 80
    if (successRate >= 80) return 60
    if (successRate >= 70) return 40
    return 20
  }

  calculateCoverageScore(coveragePercentage) {
    if (coveragePercentage >= 90) return 100
    if (coveragePercentage >= 80) return 80
    if (coveragePercentage >= 70) return 60
    if (coveragePercentage >= 60) return 40
    return 20
  }

  calculateConsistencyScore(aggregated) {
    // 简化的计算逻辑，实际应该基于历史数据的标准差
    const successRate = aggregated.overall.successRate
    const healthFactors = aggregated.health.factors

    // 如果健康度评分高，说明一致性较好
    return Math.min(100, healthFactors.consistency * 100)
  }

  calculatePerformanceScore(avgDuration) {
    // 基于平均执行时间评分（毫秒）
    if (avgDuration < 60000) return 100 // < 1分钟
    if (avgDuration < 120000) return 80 // < 2分钟
    if (avgDuration < 300000) return 60 // < 5分钟
    if (avgDuration < 600000) return 40 // < 10分钟
    return 20 // >= 10分钟
  }

  calculateFailureRateScore(successRate) {
    return this.calculateSuccessRateScore(successRate)
  }

  calculateTrendDirection(successRateTrend) {
    if (successRateTrend.length < 2) return 'stable'

    const recent = successRateTrend.slice(-7) // 最近7天
    if (recent.length < 2) return 'stable'

    const firstHalf = recent.slice(0, Math.floor(recent.length / 2))
    const secondHalf = recent.slice(Math.floor(recent.length / 2))

    const firstAvg = firstHalf.reduce((sum, item) => sum + item.value, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.value, 0) / secondHalf.length

    const change = ((secondAvg - firstAvg) / firstAvg) * 100

    if (change > 2) return 'improving'
    if (change < -2) return 'declining'
    return 'stable'
  }

  scoreToGrade(score) {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  generateHealthRecommendations(dimensions, trend) {
    const recommendations = []

    if (dimensions.successRate < 70) {
      recommendations.push('优先修复测试失败问题，提高成功率')
    }

    if (dimensions.testCoverage < 60) {
      recommendations.push('增加单元测试覆盖率，特别关注核心业务逻辑')
    }

    if (dimensions.performance < 70) {
      recommendations.push('优化测试执行性能，考虑并行执行和缓存策略')
    }

    if (trend === 'declining') {
      recommendations.push('分析趋势下降的原因，及时干预质量问题')
    }

    return recommendations
  }
}

module.exports = DashboardAPI
