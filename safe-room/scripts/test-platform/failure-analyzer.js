#!/usr/bin/env node

/**
 * 测试失败自动分析器
 *
 * 解析错误信息，识别失败模式，提供修复建议和根本原因分析
 */

const fs = require('fs')
const path = require('path')

class FailureAnalyzer {
  constructor(historyManager, collector) {
    this.historyManager = historyManager
    this.collector = collector

    // 错误模式定义
    this.errorPatterns = this.defineErrorPatterns()

    // 修复建议映射
    this.remediationMap = this.defineRemediationMap()
  }

  /**
   * 定义错误模式
   */
  defineErrorPatterns() {
    return {
      // 网络相关错误
      network: {
        patterns: [
          /ECONNREFUSED/i,
          /ENOTFOUND/i,
          /ETIMEDOUT/i,
          /network.*error/i,
          /connection.*refused/i,
          /dns.*lookup/i
        ],
        category: 'network',
        severity: 'medium'
      },

      // 超时错误
      timeout: {
        patterns: [
          /timeout/i,
          /timed.*out/i,
          /operation.*timed.*out/i,
          /test.*timeout/i,
          /exceeded.*timeout/i
        ],
        category: 'timeout',
        severity: 'medium'
      },

      // 选择器错误
      selector: {
        patterns: [
          /selector.*not.*found/i,
          /element.*not.*found/i,
          /unable.*to.*locate.*element/i,
          /no.*element.*found/i,
          /locator.*resolution/i
        ],
        category: 'selector',
        severity: 'high'
      },

      // 断言错误
      assertion: {
        patterns: [
          /expect.*received/i,
          /assertion.*failed/i,
          /expected.*but.*received/i,
          /tobe/i,
          /toequal/i,
          /tocontain/i
        ],
        category: 'assertion',
        severity: 'low'
      },

      // API错误
      api: {
        patterns: [
          /api.*error/i,
          /http.*error/i,
          /status.*code.*[45]\d{2}/i,
          /request.*failed/i,
          /response.*error/i
        ],
        category: 'api',
        severity: 'high'
      },

      // 内存/性能错误
      memory: {
        patterns: [
          /out.*of.*memory/i,
          /heap.*overflow/i,
          /memory.*limit/i,
          /stack.*overflow/i,
          /maximum.*call.*stack/i
        ],
        category: 'memory',
        severity: 'critical'
      },

      // 文件系统错误
      filesystem: {
        patterns: [
          /enoent/i,
          /file.*not.*found/i,
          /permission.*denied/i,
          /access.*denied/i,
          /read.*error/i
        ],
        category: 'filesystem',
        severity: 'medium'
      },

      // 依赖错误
      dependency: {
        patterns: [
          /module.*not.*found/i,
          /cannot.*resolve.*module/i,
          /missing.*dependency/i,
          /package.*not.*found/i,
          /import.*error/i
        ],
        category: 'dependency',
        severity: 'high'
      },

      // 配置错误
      configuration: {
        patterns: [
          /config.*error/i,
          /configuration.*invalid/i,
          /missing.*config/i,
          /env.*variable.*not.*set/i,
          /environment.*error/i
        ],
        category: 'configuration',
        severity: 'medium'
      },

      // 数据库错误
      database: {
        patterns: [
          /database.*error/i,
          /connection.*failed/i,
          /query.*failed/i,
          /sql.*error/i,
          /orm.*error/i
        ],
        category: 'database',
        severity: 'high'
      },

      // 认证/授权错误
      auth: {
        patterns: [
          /unauthorized/i,
          /forbidden/i,
          /authentication.*failed/i,
          /authorization.*failed/i,
          /access.*denied/i
        ],
        category: 'auth',
        severity: 'medium'
      }
    }
  }

  /**
   * 定义修复建议映射
   */
  defineRemediationMap() {
    return {
      network: {
        title: '网络连接问题',
        suggestions: [
          '检查网络连接是否稳定',
          '验证API端点是否可访问',
          '检查防火墙和代理设置',
          '考虑添加重试机制',
          '验证DNS解析是否正常'
        ],
        priority: 'high'
      },

      timeout: {
        title: '测试超时问题',
        suggestions: [
          '增加超时时间设置',
          '优化测试等待逻辑',
          '检查页面加载性能',
          '考虑使用智能等待策略',
          '并行执行测试以减少总时间'
        ],
        priority: 'medium'
      },

      selector: {
        title: '元素选择器问题',
        suggestions: [
          '检查元素是否存在于DOM中',
          '验证选择器语法是否正确',
          '考虑使用更稳定的data-testid属性',
          '检查页面是否已完全加载',
          '添加适当的等待条件'
        ],
        priority: 'high'
      },

      assertion: {
        title: '断言失败',
        suggestions: [
          '检查测试数据的正确性',
          '验证应用逻辑是否按预期工作',
          '检查断言条件是否合理',
          '考虑更新测试期望值',
          '添加更详细的错误信息'
        ],
        priority: 'low'
      },

      api: {
        title: 'API请求问题',
        suggestions: [
          '检查API端点和方法是否正确',
          '验证请求参数和数据格式',
          '检查认证和授权',
          '查看服务器日志',
          '考虑使用Mock数据进行调试'
        ],
        priority: 'high'
      },

      memory: {
        title: '内存不足问题',
        suggestions: [
          '增加Node.js内存限制',
          '优化测试数据大小',
          '检查内存泄漏',
          '分批执行测试',
          '升级系统内存'
        ],
        priority: 'critical'
      },

      filesystem: {
        title: '文件系统问题',
        suggestions: [
          '检查文件路径是否正确',
          '验证文件权限',
          '确保目录存在',
          '检查磁盘空间',
          '验证文件编码格式'
        ],
        priority: 'medium'
      },

      dependency: {
        title: '依赖问题',
        suggestions: [
          '检查package.json依赖版本',
          '重新安装node_modules',
          '验证模块导入路径',
          '检查TypeScript类型定义',
          '更新依赖到兼容版本'
        ],
        priority: 'high'
      },

      configuration: {
        title: '配置问题',
        suggestions: [
          '检查环境变量设置',
          '验证配置文件语法',
          '检查配置文件的路径',
          '比较不同环境的配置差异',
          '添加配置验证'
        ],
        priority: 'medium'
      },

      database: {
        title: '数据库问题',
        suggestions: [
          '检查数据库连接配置',
          '验证数据库服务状态',
          '检查SQL查询语法',
          '查看数据库日志',
          '考虑使用数据库迁移'
        ],
        priority: 'high'
      },

      auth: {
        title: '认证授权问题',
        suggestions: [
          '检查认证令牌是否有效',
          '验证用户权限设置',
          '检查会话管理',
          '查看认证服务状态',
          '更新认证配置'
        ],
        priority: 'medium'
      }
    }
  }

  /**
   * 分析失败的测试结果
   */
  async analyzeFailure(testResult) {
    const analysis = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      testResultId: testResult.id,
      framework: testResult.framework,
      timestamp: new Date().toISOString(),
      summary: this.analyzeSummary(testResult),
      patterns: [],
      rootCause: null,
      recommendations: [],
      severity: 'low',
      confidence: 0
    }

    // 分析测试套件中的失败
    if (testResult.testSuites) {
      for (const suite of testResult.testSuites) {
        if (suite.tests) {
          for (const test of suite.tests) {
            if (test.status === 'failed' && test.error) {
              const testAnalysis = this.analyzeTestFailure(test, suite)
              analysis.patterns.push(testAnalysis)
            }
          }
        }
      }
    }

    // 确定整体严重程度和置信度
    analysis.severity = this.determineOverallSeverity(analysis.patterns)
    analysis.confidence = this.calculateConfidence(analysis.patterns)

    // 识别根本原因
    analysis.rootCause = this.identifyRootCause(analysis.patterns)

    // 生成修复建议
    analysis.recommendations = this.generateRecommendations(analysis)

    return analysis
  }

  /**
   * 分析测试失败摘要
   */
  analyzeSummary(testResult) {
    const summary = testResult.summary || {}
    const failureRate = summary.totalTests > 0 ?
      ((summary.failedTests || 0) / summary.totalTests) * 100 : 0

    return {
      totalTests: summary.totalTests || 0,
      failedTests: summary.failedTests || 0,
      failureRate,
      duration: summary.duration || 0,
      isCritical: failureRate > 50 || (summary.failedTests || 0) > 10
    }
  }

  /**
   * 分析单个测试失败
   */
  analyzeTestFailure(test, suite) {
    const errorMessage = test.error || ''
    const errorStack = test.error || ''

    const patterns = this.matchErrorPatterns(errorMessage + ' ' + errorStack)

    return {
      test: {
        name: test.name,
        suite: suite.name,
        duration: test.duration || 0
      },
      error: {
        message: errorMessage,
        stack: errorStack.substring(0, 500) // 限制长度
      },
      patterns,
      primaryCategory: this.determinePrimaryCategory(patterns),
      severity: this.determineSeverity(patterns)
    }
  }

  /**
   * 匹配错误模式
   */
  matchErrorPatterns(errorText) {
    const matches = []

    for (const [patternName, patternDef] of Object.entries(this.errorPatterns)) {
      const { patterns, category, severity } = patternDef

      for (const regex of patterns) {
        if (regex.test(errorText)) {
          matches.push({
            name: patternName,
            category,
            severity,
            matched: errorText.match(regex)?.[0] || '',
            confidence: this.calculatePatternConfidence(regex, errorText)
          })
          break // 只匹配第一个匹配的模式
        }
      }
    }

    return matches
  }

  /**
   * 计算模式匹配置信度
   */
  calculatePatternConfidence(regex, errorText) {
    // 简单的置信度计算：匹配的字符数相对于错误文本长度的比例
    const match = errorText.match(regex)
    if (!match) return 0

    return Math.min(100, (match[0].length / errorText.length) * 200)
  }

  /**
   * 确定主要类别
   */
  determinePrimaryCategory(patterns) {
    if (patterns.length === 0) return 'unknown'

    // 按置信度排序，返回置信度最高的类别
    const sortedPatterns = patterns.sort((a, b) => b.confidence - a.confidence)
    return sortedPatterns[0].category
  }

  /**
   * 确定严重程度
   */
  determineSeverity(patterns) {
    if (patterns.length === 0) return 'low'

    // 取最严重的级别
    const severityLevels = { critical: 4, high: 3, medium: 2, low: 1 }
    const severities = patterns.map(p => p.severity)

    const maxSeverity = severities.reduce((max, current) => {
      return severityLevels[current] > severityLevels[max] ? current : max
    }, 'low')

    return maxSeverity
  }

  /**
   * 确定整体严重程度
   */
  determineOverallSeverity(patterns) {
    if (patterns.length === 0) return 'low'

    const severityCounts = {
      critical: patterns.filter(p => p.severity === 'critical').length,
      high: patterns.filter(p => p.severity === 'high').length,
      medium: patterns.filter(p => p.severity === 'medium').length,
      low: patterns.filter(p => p.severity === 'low').length
    }

    if (severityCounts.critical > 0) return 'critical'
    if (severityCounts.high > 2) return 'high'
    if (severityCounts.high > 0 || severityCounts.medium > 3) return 'medium'
    return 'low'
  }

  /**
   * 计算置信度
   */
  calculateConfidence(patterns) {
    if (patterns.length === 0) return 0

    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
    const patternCount = patterns.length

    // 基于匹配模式数量和平均置信度的综合评分
    return Math.min(100, avgConfidence + (patternCount * 10))
  }

  /**
   * 识别根本原因
   */
  identifyRootCause(patterns) {
    if (patterns.length === 0) {
      return {
        category: 'unknown',
        description: '无法确定根本原因',
        confidence: 0
      }
    }

    // 按类别分组
    const categories = {}
    patterns.forEach(pattern => {
      if (!categories[pattern.category]) {
        categories[pattern.category] = []
      }
      categories[pattern.category].push(pattern)
    })

    // 找到出现次数最多的类别
    let maxCategory = null
    let maxCount = 0

    for (const [category, categoryPatterns] of Object.entries(categories)) {
      if (categoryPatterns.length > maxCount) {
        maxCount = categoryPatterns.length
        maxCategory = category
      }
    }

    const avgConfidence = categories[maxCategory].reduce((sum, p) => sum + p.confidence, 0) / maxCount

    return {
      category: maxCategory,
      description: this.getCategoryDescription(maxCategory),
      confidence: Math.min(100, avgConfidence + (maxCount * 5)),
      occurrences: maxCount
    }
  }

  /**
   * 获取类别描述
   */
  getCategoryDescription(category) {
    const descriptions = {
      network: '网络连接或通信问题',
      timeout: '操作超时，可能是性能或等待逻辑问题',
      selector: 'UI元素定位失败，可能需要更新选择器',
      assertion: '断言失败，测试期望与实际结果不匹配',
      api: 'API请求失败，需要检查后端服务',
      memory: '内存不足或内存泄漏',
      filesystem: '文件系统访问问题',
      dependency: '模块依赖或导入问题',
      configuration: '配置错误或环境变量问题',
      database: '数据库连接或查询问题',
      auth: '认证或授权失败',
      unknown: '未知错误类型'
    }

    return descriptions[category] || descriptions.unknown
  }

  /**
   * 生成修复建议
   */
  generateRecommendations(analysis) {
    const recommendations = []

    if (analysis.rootCause.category !== 'unknown') {
      const remediation = this.remediationMap[analysis.rootCause.category]
      if (remediation) {
        recommendations.push({
          type: 'root-cause',
          title: remediation.title,
          suggestions: remediation.suggestions,
          priority: remediation.priority
        })
      }
    }

    // 基于模式分析添加额外建议
    const patternCategories = [...new Set(analysis.patterns.map(p => p.category))]

    if (patternCategories.includes('selector')) {
      recommendations.push({
        type: 'pattern-specific',
        title: '选择器稳定性改进',
        suggestions: [
          '考虑为关键元素添加稳定的data-testid属性',
          '避免使用基于CSS类名的选择器',
          '使用语义化的ARIA标签和角色',
          '添加适当的等待条件确保元素可见'
        ],
        priority: 'high'
      })
    }

    if (patternCategories.includes('timeout')) {
      recommendations.push({
        type: 'pattern-specific',
        title: '超时处理优化',
        suggestions: [
          '实现智能等待策略',
          '增加重试机制',
          '优化页面加载性能',
          '调整超时配置参数'
        ],
        priority: 'medium'
      })
    }

    if (analysis.summary.failureRate > 30) {
      recommendations.push({
        type: 'general',
        title: '整体质量改进',
        suggestions: [
          '优先修复高影响力的测试失败',
          '改进测试数据质量',
          '增强错误处理和边界条件测试',
          '考虑分阶段修复测试问题'
        ],
        priority: 'high'
      })
    }

    // 按优先级排序
    const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 }
    recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

    return recommendations
  }

  /**
   * 批量分析失败
   */
  async analyzeFailures(timeRange = 'day', framework = null) {
    const failedResults = this.historyManager.query({
      status: 'failed',
      dateFrom: this.getDateRange(timeRange),
      framework,
      limit: 100 // 限制分析数量
    }).results

    const analyses = []

    for (const result of failedResults) {
      try {
        const analysis = await this.analyzeFailure(result)
        analyses.push(analysis)
      } catch (error) {
        console.error(`分析失败 ${result.id}:`, error.message)
      }
    }

    // 汇总分析结果
    const summary = this.summarizeAnalyses(analyses)

    return {
      analyses,
      summary,
      generatedAt: new Date().toISOString(),
      timeRange,
      totalAnalyzed: analyses.length
    }
  }

  /**
   * 汇总分析结果
   */
  summarizeAnalyses(analyses) {
    const summary = {
      totalFailures: analyses.length,
      severityDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
      categoryDistribution: {},
      topPatterns: [],
      avgConfidence: 0,
      recommendations: []
    }

    if (analyses.length === 0) return summary

    // 统计分布
    analyses.forEach(analysis => {
      summary.severityDistribution[analysis.severity]++

      if (analysis.rootCause.category !== 'unknown') {
        summary.categoryDistribution[analysis.rootCause.category] =
          (summary.categoryDistribution[analysis.rootCause.category] || 0) + 1
      }

      summary.avgConfidence += analysis.confidence
    })

    summary.avgConfidence /= analyses.length

    // 找出最常见的模式
    const categoryEntries = Object.entries(summary.categoryDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    summary.topPatterns = categoryEntries.map(([category, count]) => ({
      category,
      count,
      percentage: (count / analyses.length) * 100
    }))

    // 生成总体建议
    summary.recommendations = this.generateOverallRecommendations(summary)

    return summary
  }

  /**
   * 生成总体建议
   */
  generateOverallRecommendations(summary) {
    const recommendations = []

    if (summary.severityDistribution.critical > 0) {
      recommendations.push('紧急处理严重级别的测试失败')
    }

    const topCategory = summary.topPatterns[0]
    if (topCategory && topCategory.percentage > 30) {
      const remediation = this.remediationMap[topCategory.category]
      if (remediation) {
        recommendations.push(`重点解决${remediation.title}问题（占失败总数的${topCategory.percentage.toFixed(1)}%）`)
      }
    }

    if (summary.avgConfidence < 50) {
      recommendations.push('考虑改进错误分析的准确性，可能需要更新错误模式匹配规则')
    }

    return recommendations
  }

  /**
   * 获取日期范围
   */
  getDateRange(timeRange) {
    const now = new Date()
    const ranges = {
      hour: () => new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      day: () => new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      week: () => new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      month: () => new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    return ranges[timeRange]?.() || ranges.day()
  }

  /**
   * 导出分析报告
   */
  async exportAnalysisReport(timeRange = 'week', format = 'json') {
    const analysisResults = await this.analyzeFailures(timeRange)

    let content
    let fileExtension

    switch (format) {
      case 'json':
        content = JSON.stringify(analysisResults, null, 2)
        fileExtension = 'json'
        break
      case 'html':
        content = this.generateHtmlReport(analysisResults)
        fileExtension = 'html'
        break
      default:
        throw new Error(`不支持的导出格式: ${format}`)
    }

    const outputPath = path.join(process.cwd(), 'test-results', `failure-analysis-${timeRange}.${fileExtension}`)
    fs.writeFileSync(outputPath, content)

    console.log(`失败分析报告已导出到: ${outputPath}`)
    return outputPath
  }

  /**
   * 生成HTML报告
   */
  generateHtmlReport(analysisResults) {
    const { analyses, summary } = analysisResults

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>测试失败分析报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .card { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .severity-critical { border-left: 4px solid #dc3545; }
        .severity-high { border-left: 4px solid #fd7e14; }
        .severity-medium { border-left: 4px solid #ffc107; }
        .severity-low { border-left: 4px solid #28a745; }
        .recommendations { background: #e7f3ff; padding: 15px; border-radius: 5px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <div class="header">
        <h1>测试失败分析报告</h1>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        <p>分析时间范围: ${analysisResults.timeRange}</p>
    </div>

    <div class="summary">
        <div class="card">
            <h3>总览</h3>
            <p>失败分析总数: ${summary.totalFailures}</p>
            <p>平均置信度: ${summary.avgConfidence.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>严重程度分布</h3>
            <p>严重: ${summary.severityDistribution.critical}</p>
            <p>高: ${summary.severityDistribution.high}</p>
            <p>中: ${summary.severityDistribution.medium}</p>
            <p>低: ${summary.severityDistribution.low}</p>
        </div>
    </div>

    <div class="card">
        <h3>最常见问题模式</h3>
        <table>
            <thead>
                <tr>
                    <th>类别</th>
                    <th>出现次数</th>
                    <th>百分比</th>
                </tr>
            </thead>
            <tbody>
                ${summary.topPatterns.map(pattern => `
                    <tr>
                        <td>${pattern.category}</td>
                        <td>${pattern.count}</td>
                        <td>${pattern.percentage.toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    ${summary.recommendations.length > 0 ? `
    <div class="recommendations">
        <h3>建议</h3>
        <ul>
            ${summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    <div class="card">
        <h3>详细分析 (${analyses.length} 项)</h3>
        <table>
            <thead>
                <tr>
                    <th>测试框架</th>
                    <th>根本原因</th>
                    <th>严重程度</th>
                    <th>置信度</th>
                </tr>
            </thead>
            <tbody>
                ${analyses.slice(0, 50).map(analysis => `
                    <tr class="severity-${analysis.severity}">
                        <td>${analysis.framework}</td>
                        <td>${analysis.rootCause.description}</td>
                        <td>${analysis.severity}</td>
                        <td>${analysis.confidence.toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  const options = {
    timeRange: args.find((arg, index) => arg === '--time-range' && args[index + 1])?.[index + 1] || 'day',
    framework: args.find((arg, index) => arg === '--framework' && args[index + 1])?.[index + 1],
    format: args.find((arg, index) => arg === '--format' && args[index + 1])?.[index + 1] || 'json',
    output: args.find((arg, index) => arg === '--output' && args[index + 1])?.[index + 1]
  }

  // 这里需要创建analyzer实例，实际使用时需要传入historyManager和collector
  console.log('失败分析器 - CLI模式')

  switch (command) {
    case 'analyze':
      console.log('分析失败模式...')
      console.log(`时间范围: ${options.timeRange}`)
      console.log(`框架: ${options.framework || 'all'}`)
      console.log('注意: 此CLI模式需要完整的数据管理器集成')
      break

    case 'patterns':
      console.log('显示已定义的错误模式...')
      const analyzer = new FailureAnalyzer(null, null)
      console.log('错误模式:', Object.keys(analyzer.errorPatterns))
      break

    default:
      console.log('使用方法:')
      console.log('  node failure-analyzer.js analyze [--time-range <range>] [--framework <name>]')
      console.log('  node failure-analyzer.js patterns')
      console.log('')
      console.log('选项:')
      console.log('  --time-range: hour|day|week|month (默认: day)')
      console.log('  --framework: 过滤特定框架')
      console.log('  --format: 导出格式 json|html (默认: json)')
      console.log('  --output: 输出文件路径')
      break
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('未处理的错误:', error)
    process.exit(1)
  })
}

module.exports = FailureAnalyzer
