#!/usr/bin/env node

/**
 * Front前端文档质量监控仪表板
 * 实现实时质量指标展示和趋势图表
 */

const fs = require('fs')
const path = require('path')
const { FrontendDocQualityAssessor } = require('./frontend-doc-quality-assessor')

class FrontendDocQualityDashboard {
  constructor() {
    this.assessor = new FrontendDocQualityAssessor()
    this.charts = []
  }

  /**
   * 生成质量仪表板
   */
  async generateDashboard(options = {}) {
    const { format = 'console', output = 'docs/reports/quality/dashboard.md' } = options

    console.log('📊 生成质量仪表板...')

    // 获取最新评估数据
    const assessments = await this.assessor.assessAllDocuments()
    const summary = this.assessor.calculateSummary(assessments)

    // 生成仪表板内容
    let dashboard = ''

    if (format === 'console') {
      dashboard = this.generateConsoleDashboard(summary, assessments)
    } else if (format === 'markdown') {
      dashboard = this.generateMarkdownDashboard(summary, assessments)
    } else if (format === 'json') {
      dashboard = this.generateJsonDashboard(summary, assessments)
    }

    // 输出仪表板
    if (format === 'console') {
      console.log(dashboard)
    } else {
      // 确保目录存在
      const dir = path.dirname(output)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      if (format === 'json') {
        fs.writeFileSync(output, JSON.stringify(JSON.parse(dashboard), null, 2), 'utf-8')
      } else {
        fs.writeFileSync(output, dashboard, 'utf-8')
      }

      console.log(`✅ 仪表板已生成: ${output}`)
    }

    return {
      summary,
      assessments,
      dashboard
    }
  }

  /**
   * 生成控制台仪表板
   */
  generateConsoleDashboard(summary, assessments) {
    let output = ''

    // 标题
    output += '\n' + '='.repeat(80) + '\n'
    output += '🎯 Front前端文档质量仪表板\n'
    output += '='.repeat(80) + '\n'

    // 总体概览
    output += '\n📈 总体概览\n'
    output += '-'.repeat(40) + '\n'
    output += `总文档数: ${summary.totalDocuments}\n`
    output += `有效评估: ${summary.validDocuments}\n`
    output += `平均得分: ${this.colorizeScore(summary.averageScore)}/100\n`
    output += `生成时间: ${new Date().toLocaleString()}\n`

    // 得分分布
    output += '\n📊 得分分布\n'
    output += '-'.repeat(40) + '\n'
    const dist = summary.scoreDistribution
    const total = summary.validDocuments
    output += `🏆 优秀 (≥90): ${dist.excellent} (${total > 0 ? ((dist.excellent/total)*100).toFixed(1) : 0}%)\n`
    output += `✅ 良好 (80-89): ${dist.good} (${total > 0 ? ((dist.good/total)*100).toFixed(1) : 0}%)\n`
    output += `⚠️  一般 (70-79): ${dist.fair} (${total > 0 ? ((dist.fair/total)*100).toFixed(1) : 0}%)\n`
    output += `❌ 较差 (<70): ${dist.poor} (${total > 0 ? ((dist.poor/total)*100).toFixed(1) : 0}%)\n`

    // 质量指标雷达图
    output += '\n🎯 质量指标雷达图\n'
    output += '-'.repeat(40) + '\n'
    output += this.generateRadarChart(summary.metricsAverages)

    // 质量趋势
    output += '\n📈 质量趋势\n'
    output += '-'.repeat(40) + '\n'
    output += this.generateTrendChart()

    // 问题文档排行
    output += '\n🚨 问题文档排行\n'
    output += '-'.repeat(40) + '\n'
    const problemDocs = assessments
      .filter(a => !a.error && a.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)

    if (problemDocs.length > 0) {
      problemDocs.forEach((doc, index) => {
        output += `${index + 1}. ${this.colorizeScore(doc.score)} - ${doc.fileName}\n`
        if (doc.issues && doc.issues.length > 0) {
          output += `   🔍 主要问题: ${doc.issues[0].description}\n`
        }
      })
    } else {
      output += '🎉 没有严重问题的文档！\n'
    }

    // 优秀文档榜单
    output += '\n🏆 优秀文档榜单\n'
    output += '-'.repeat(40) + '\n'
    const excellentDocs = assessments
      .filter(a => !a.error && a.score >= 90)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    if (excellentDocs.length > 0) {
      excellentDocs.forEach((doc, index) => {
        output += `${index + 1}. ${this.colorizeScore(doc.score)} - ${doc.fileName}\n`
      })
    } else {
      output += '📚 继续努力，争取更多优秀文档！\n'
    }

    // 质量建议
    output += '\n💡 质量改进建议\n'
    output += '-'.repeat(40) + '\n'
    const recommendations = this.assessor.generateRecommendations(assessments)
    if (recommendations.length > 0) {
      recommendations.slice(0, 5).forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'
        output += `${priority} ${rec.suggestion}\n`
      })
    } else {
      output += '🎯 文档质量表现良好！\n'
    }

    output += '='.repeat(80) + '\n'

    return output
  }

  /**
   * 生成Markdown仪表板
   */
  generateMarkdownDashboard(summary, assessments) {
    let output = '# 📊 Front前端文档质量仪表板\n\n'
    output += `**生成时间**: ${new Date().toLocaleString()}\n\n`

    // 总体概览
    output += '## 📈 总体概览\n\n'
    output += '| 指标 | 值 |\n'
    output += '|------|-----|\n'
    output += `| 总文档数 | ${summary.totalDocuments} |\n`
    output += `| 有效评估 | ${summary.validDocuments} |\n`
    output += `| 平均得分 | ${this.getScoreBadge(summary.averageScore)} |\n\n`

    // 得分分布
    output += '## 📊 得分分布\n\n'
    const dist = summary.scoreDistribution
    const total = summary.validDocuments

    output += '| 等级 | 数量 | 占比 |\n'
    output += '|------|------|------|\n'
    output += `| 🏆 优秀 (≥90) | ${dist.excellent} | ${total > 0 ? ((dist.excellent/total)*100).toFixed(1) : 0}% |\n`
    output += `| ✅ 良好 (80-89) | ${dist.good} | ${total > 0 ? ((dist.good/total)*100).toFixed(1) : 0}% |\n`
    output += `| ⚠️ 一般 (70-79) | ${dist.fair} | ${total > 0 ? ((dist.fair/total)*100).toFixed(1) : 0}% |\n`
    output += `| ❌ 较差 (<70) | ${dist.poor} | ${total > 0 ? ((dist.poor/total)*100).toFixed(1) : 0}% |\n\n`

    // 质量指标
    output += '## 🎯 质量指标详情\n\n'
    output += '| 指标 | 得分 | 状态 |\n'
    output += '|------|------|------|\n'

    for (const [metric, score] of Object.entries(summary.metricsAverages)) {
      const status = score >= 85 ? '✅ 优秀' : score >= 70 ? '⚠️ 需改进' : '❌ 严重不足'
      const scoreBadge = this.getScoreBadge(score)
      output += `| ${this.getMetricName(metric)} | ${scoreBadge} | ${status} |\n`
    }

    output += '\n'

    // 问题文档
    output += '## 🚨 需要关注的文档\n\n'
    const problemDocs = assessments
      .filter(a => !a.error && a.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)

    if (problemDocs.length > 0) {
      output += '| 得分 | 文档 | 主要问题 |\n'
      output += '|------|------|----------|\n'

      problemDocs.forEach(doc => {
        const issue = doc.issues && doc.issues.length > 0 ? doc.issues[0].description : '无'
        output += `| ${this.getScoreBadge(doc.score)} | ${doc.fileName} | ${issue} |\n`
      })
    } else {
      output += '🎉 所有文档质量均良好！\n'
    }

    output += '\n'

    // 改进建议
    output += '## 💡 改进建议\n\n'
    const recommendations = this.assessor.generateRecommendations(assessments)

    if (recommendations.length > 0) {
      recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴 高优先级' : rec.priority === 'medium' ? '🟡 中优先级' : '🟢 低优先级'
        output += `${index + 1}. **${priority}**: ${rec.suggestion}\n`
      })
    } else {
      output += '🎯 文档质量表现优秀，继续保持！\n'
    }

    return output
  }

  /**
   * 生成JSON仪表板
   */
  generateJsonDashboard(summary, assessments) {
    const dashboard = {
      title: 'Front前端文档质量仪表板',
      generatedAt: new Date().toISOString(),
      summary,
      assessments: assessments.slice(0, 50), // 只包含前50个文档的详细信息
      charts: {
        scoreDistribution: this.generateScoreDistributionChart(summary.scoreDistribution),
        metricsRadar: this.generateMetricsRadarChart(summary.metricsAverages),
        trend: this.generateTrendData()
      }
    }

    return JSON.stringify(dashboard, null, 2)
  }

  /**
   * 生成雷达图
   */
  generateRadarChart(metrics) {
    const metricsList = ['completeness', 'accuracy', 'readability', 'consistency', 'structure', 'technical']
    const values = metricsList.map(metric => metrics[metric] || 0)

    // 使用简单的字符画雷达图
    let chart = ''
    const maxRadius = 10
    const centerX = 15
    const centerY = 10

    // 绘制背景圆圈
    for (let r = 2; r <= maxRadius; r += 2) {
      chart += ' '.repeat(centerX - r) + '○'.repeat(r * 2 + 1) + '\n'
    }

    // 计算各点位置并绘制
    const points = []
    metricsList.forEach((metric, index) => {
      const angle = (index / metricsList.length) * 2 * Math.PI - Math.PI / 2
      const radius = (values[index] / 100) * maxRadius
      const x = Math.round(centerX + radius * Math.cos(angle))
      const y = Math.round(centerY + radius * Math.sin(angle))
      points.push({ x, y, metric: this.getMetricShortName(metric), value: values[index] })
    })

    // 简单绘制点
    const grid = Array(centerY * 2 + 1).fill().map(() => Array(centerX * 2 + 1).fill(' '))

    points.forEach(point => {
      if (point.x >= 0 && point.x < grid[0].length && point.y >= 0 && point.y < grid.length) {
        grid[point.y][point.x] = '●'
      }
    })

    // 添加标签
    chart += '\n指标说明:\n'
    metricsList.forEach((metric, index) => {
      const shortName = this.getMetricShortName(metric)
      const value = values[index]
      chart += `${shortName}: ${this.getMetricName(metric)} (${value})\n`
    })

    return chart
  }

  /**
   * 生成趋势图表
   */
  generateTrendChart() {
    // 从历史数据生成趋势
    const history = this.assessor.assessmentHistory

    if (history.length < 2) {
      return '需要至少两次评估才能显示趋势'
    }

    let chart = '时间趋势 (最近5次评估):\n\n'
    const recentHistory = history.slice(-5)

    recentHistory.forEach((entry, index) => {
      const date = new Date(entry.timestamp).toLocaleDateString()
      const score = entry.summary.averageScore
      const bar = '█'.repeat(Math.round(score / 10))
      chart += `${date}: ${bar} ${score}\n`
    })

    return chart
  }

  /**
   * 生成得分分布图表数据
   */
  generateScoreDistributionChart(distribution) {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0)

    return {
      labels: ['优秀 (≥90)', '良好 (80-89)', '一般 (70-79)', '较差 (<70)'],
      data: [
        distribution.excellent,
        distribution.good,
        distribution.fair,
        distribution.poor
      ],
      percentages: [
        total > 0 ? ((distribution.excellent / total) * 100).toFixed(1) : 0,
        total > 0 ? ((distribution.good / total) * 100).toFixed(1) : 0,
        total > 0 ? ((distribution.fair / total) * 100).toFixed(1) : 0,
        total > 0 ? ((distribution.poor / total) * 100).toFixed(1) : 0
      ]
    }
  }

  /**
   * 生成指标雷达图数据
   */
  generateMetricsRadarChart(metrics) {
    return {
      labels: [
        '完整性',
        '准确性',
        '可读性',
        '一致性',
        '结构性',
        '技术性'
      ],
      data: [
        metrics.completeness || 0,
        metrics.accuracy || 0,
        metrics.readability || 0,
        metrics.consistency || 0,
        metrics.structure || 0,
        metrics.technical || 0
      ]
    }
  }

  /**
   * 生成趋势数据
   */
  generateTrendData() {
    const history = this.assessor.assessmentHistory

    return history.slice(-10).map(entry => ({
      date: entry.timestamp.split('T')[0],
      score: entry.summary.averageScore,
      documents: entry.assessmentsCount
    }))
  }

  /**
   * 颜色化得分显示
   */
  colorizeScore(score) {
    // 在控制台中，我们无法真正改变颜色，但可以用符号表示
    if (score >= 90) return `🏆${score}`
    if (score >= 80) return `✅${score}`
    if (score >= 70) return `⚠️${score}`
    return `❌${score}`
  }

  /**
   * 获取得分徽章 (Markdown)
   */
  getScoreBadge(score) {
    if (score >= 90) return `🏆 ${score}`
    if (score >= 80) return `✅ ${score}`
    if (score >= 70) return `⚠️ ${score}`
    return `❌ ${score}`
  }

  /**
   * 获取指标名称
   */
  getMetricName(metric) {
    const names = {
      completeness: '完整性',
      accuracy: '准确性',
      readability: '可读性',
      consistency: '一致性',
      structure: '结构合理性',
      technical: '技术规范性'
    }
    return names[metric] || metric
  }

  /**
   * 获取指标简称
   */
  getMetricShortName(metric) {
    const names = {
      completeness: '完整',
      accuracy: '准确',
      readability: '可读',
      consistency: '一致',
      structure: '结构',
      technical: '技术'
    }
    return names[metric] || metric.substring(0, 2)
  }

  /**
   * 启动实时监控
   */
  async startRealTimeMonitoring(interval = 300000) { // 默认5分钟
    console.log(`🔍 启动实时质量监控 (间隔: ${interval/1000}秒)...`)

    const monitor = async () => {
      try {
        await this.generateDashboard({ format: 'console' })
        console.log(`📊 下次更新: ${new Date(Date.now() + interval).toLocaleTimeString()}`)
      } catch (error) {
        console.error(`❌ 监控出错: ${error.message}`)
      }
    }

    // 立即执行一次
    await monitor()

    // 设置定期执行
    return setInterval(monitor, interval)
  }

  /**
   * 生成质量报告邮件内容
   */
  async generateEmailReport() {
    const assessments = await this.assessor.assessAllDocuments()
    const summary = this.assessor.calculateSummary(assessments)

    let email = 'Subject: Front前端文档质量周报\n\n'
    email += 'Front前端文档质量报告\n'
    email += '=' * 50 + '\n\n'
    email += `报告日期: ${new Date().toLocaleDateString()}\n`
    email += `总文档数: ${summary.totalDocuments}\n`
    email += `平均得分: ${summary.averageScore}/100\n\n`

    email += '得分分布:\n'
    const dist = summary.scoreDistribution
    email += `- 优秀 (≥90): ${dist.excellent}\n`
    email += `- 良好 (80-89): ${dist.good}\n`
    email += `- 一般 (70-79): ${dist.fair}\n`
    email += `- 较差 (<70): ${dist.poor}\n\n`

    // 添加问题文档
    const problemDocs = assessments
      .filter(a => !a.error && a.score < 70)
      .slice(0, 5)

    if (problemDocs.length > 0) {
      email += '需要关注的文档:\n'
      problemDocs.forEach(doc => {
        email += `- ${doc.fileName}: ${doc.score}分\n`
      })
      email += '\n'
    }

    email += '访问完整报告: [质量仪表板链接]\n'

    return email
  }

  /**
   * 导出图表数据
   */
  async exportChartData(outputDir = 'docs/reports/quality/charts') {
    console.log('📊 导出图表数据...')

    const assessments = await this.assessor.assessAllDocuments()
    const summary = this.assessor.calculateSummary(assessments)

    // 确保目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // 导出各种图表数据
    const charts = {
      scoreDistribution: this.generateScoreDistributionChart(summary.scoreDistribution),
      metricsRadar: this.generateMetricsRadarChart(summary.metricsAverages),
      trend: this.generateTrendData(),
      problemDocuments: assessments
        .filter(a => !a.error && a.score < 70)
        .map(a => ({
          name: a.fileName,
          score: a.score,
          issues: a.issues?.map(i => i.description) || []
        })),
      excellentDocuments: assessments
        .filter(a => !a.error && a.score >= 90)
        .map(a => ({
          name: a.fileName,
          score: a.score
        }))
    }

    fs.writeFileSync(
      path.join(outputDir, 'charts-data.json'),
      JSON.stringify(charts, null, 2),
      'utf-8'
    )

    console.log(`✅ 图表数据已导出: ${outputDir}/charts-data.json`)

    return charts
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  const dashboard = new FrontendDocQualityDashboard()

  if (args.length === 0) {
    showUsage()
    return
  }

  const command = args[0]

  try {
    switch (command) {
      case '--show':
        const format = args[2] || 'console'
        await dashboard.generateDashboard({ format })
        break

      case '--export':
        const output = args[2] || 'docs/reports/quality/dashboard.md'
        const exportFormat = args[4] === '--format' ? args[5] : 'markdown'
        await dashboard.generateDashboard({ format: exportFormat, output })
        break

      case '--monitor':
        const interval = args[2] ? parseInt(args[2]) * 1000 : 300000
        console.log('启动实时监控模式... (Ctrl+C 退出)')
        const monitorId = await dashboard.startRealTimeMonitoring(interval)

        // 处理退出信号
        process.on('SIGINT', () => {
          console.log('\n🛑 停止监控')
          clearInterval(monitorId)
          process.exit(0)
        })
        break

      case '--email':
        const emailContent = await dashboard.generateEmailReport()
        console.log('📧 邮件报告内容:')
        console.log(emailContent)
        break

      case '--charts':
        const chartDir = args[2] || 'docs/reports/quality/charts'
        await dashboard.exportChartData(chartDir)
        break

      default:
        console.error(`未知命令: ${command}`)
        showUsage()
        process.exit(1)
    }
  } catch (error) {
    console.error(`❌ 操作失败: ${error.message}`)
    process.exit(1)
  }
}

function showUsage() {
  console.log('Front前端文档质量监控仪表板')
  console.log('')
  console.log('用法:')
  console.log('  显示仪表板: --show [--format console|markdown|json]')
  console.log('  导出仪表板: --export <output_file> [--format markdown|json]')
  console.log('  实时监控: --monitor [interval_seconds]')
  console.log('  生成邮件: --email')
  console.log('  导出图表: --charts [output_dir]')
  console.log('')
  console.log('示例:')
  console.log('  node frontend-doc-quality-dashboard.js --show')
  console.log('  node frontend-doc-quality-dashboard.js --export dashboard.html --format markdown')
  console.log('  node frontend-doc-quality-dashboard.js --monitor 600')
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 执行出错:', error)
    process.exit(1)
  })
}

module.exports = FrontendDocQualityDashboard
