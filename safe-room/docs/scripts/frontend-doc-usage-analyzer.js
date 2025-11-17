#!/usr/bin/env node

/**
 * Front前端文档使用统计工具
 * 实现文档访问统计、使用趋势分析和使用模式识别
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')
const { execSync } = require('child_process')

class FrontendDocUsageAnalyzer {
  constructor() {
    this.usageData = []
    this.loadUsageData()
  }

  /**
   * 分析文档使用情况
   * @param {Object} options - 分析选项
   */
  async analyzeUsage(options = {}) {
    const { period = 'all', format = 'console' } = options

    console.log('📊 开始分析文档使用情况...')

    // 收集使用数据
    await this.collectUsageData()

    // 生成分析报告
    const analysis = await this.generateAnalysisReport(period)

    // 输出分析结果
    if (format === 'console') {
      this.displayConsoleReport(analysis)
    } else if (format === 'markdown') {
      return this.generateMarkdownReport(analysis)
    } else if (format === 'json') {
      return JSON.stringify(analysis, null, 2)
    }

    return analysis
  }

  /**
   * 收集使用数据
   */
  async collectUsageData() {
    console.log('🔍 收集文档使用数据...')

    // 获取所有文档文件
    const patterns = [
      'docs/technical/frontend/**/*.md',
      'docs/development/frontend/**/*.md',
      'docs/reports/frontend/**/*.md'
    ]

    const allFiles = []
    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: process.cwd() })
      allFiles.push(...files)
    }

    for (const filePath of allFiles) {
      const usageInfo = await this.analyzeFileUsage(filePath)
      this.usageData.push(usageInfo)
    }

    // 保存使用数据
    this.saveUsageData()
  }

  /**
   * 分析单个文件的使用情况
   * @param {string} filePath - 文件路径
   */
  async analyzeFileUsage(filePath) {
    const fullPath = path.resolve(process.cwd(), filePath)
    const content = fs.readFileSync(fullPath, 'utf-8')

    // 基本文件信息
    const stats = fs.statSync(fullPath)
    const fileName = path.basename(filePath)
    const relativePath = path.relative('docs', filePath)

    // Git历史分析
    const gitInfo = await this.getGitInfo(filePath)

    // 内容分析
    const contentAnalysis = this.analyzeContent(content)

    // 引用分析
    const references = await this.findReferences(filePath)

    // 复杂度分析
    const complexity = this.calculateComplexity(content)

    return {
      filePath: relativePath,
      fileName,
      size: stats.size,
      lastModified: stats.mtime.toISOString(),
      gitInfo,
      contentAnalysis,
      references,
      complexity,
      accessMetrics: this.generateAccessMetrics(gitInfo, references)
    }
  }

  /**
   * 获取Git信息
   * @param {string} filePath - 文件路径
   */
  async getGitInfo(filePath) {
    try {
      // 获取提交历史
      const commitCount = execSync(`git log --oneline -- "${filePath}" | wc -l`, { encoding: 'utf8' }).trim()

      // 获取最后修改时间
      const lastCommit = execSync(`git log -1 --format=%ci -- "${filePath}"`, { encoding: 'utf8' }).trim()

      // 获取作者信息
      const authors = execSync(`git log --format=%an -- "${filePath}" | sort | uniq -c | sort -nr`, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const match = line.trim().match(/(\d+)\s+(.+)/)
          return match ? { author: match[2], commits: parseInt(match[1]) } : null
        })
        .filter(Boolean)

      // 获取修改频率（最近30天）
      const recentCommits = execSync(`git log --since="30 days ago" --oneline -- "${filePath}" | wc -l`, { encoding: 'utf8' }).trim()

      return {
        commitCount: parseInt(commitCount),
        lastCommit: lastCommit || null,
        authors,
        recentCommits: parseInt(recentCommits),
        activityLevel: this.calculateActivityLevel(parseInt(commitCount), parseInt(recentCommits))
      }
    } catch (error) {
      // Git信息获取失败，返回默认值
      return {
        commitCount: 0,
        lastCommit: null,
        authors: [],
        recentCommits: 0,
        activityLevel: 'unknown'
      }
    }
  }

  /**
   * 分析内容特征
   * @param {string} content - 文件内容
   */
  analyzeContent(content) {
    const lines = content.split('\n')

    return {
      totalLines: lines.length,
      codeBlocks: (content.match(/```[\s\S]*?```/g) || []).length,
      links: (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length,
      headers: lines.filter(line => line.match(/^#{1,6}\s+/)).length,
      lists: lines.filter(line => line.match(/^[\s]*[-*+]\s/)).length,
      tables: (content.match(/\|.*\|.*\|/g) || []).length,
      images: (content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []).length,
      keywords: this.extractKeywords(content)
    }
  }

  /**
   * 查找文档引用
   * @param {string} filePath - 文件路径
   */
  async findReferences(filePath) {
    const allFiles = await glob('docs/**/*.md', { cwd: process.cwd() })
    const references = []

    for (const otherFile of allFiles) {
      if (otherFile === filePath) continue

      try {
        const content = fs.readFileSync(otherFile, 'utf-8')
        const relativePath = path.relative(path.dirname(otherFile), filePath)

        // 检查是否引用了这个文件
        const linkPatterns = [
          `(${relativePath})`,
          `(${relativePath.replace('.md', '')})`,
          `(${path.basename(filePath)})`
        ]

        for (const pattern of linkPatterns) {
          if (content.includes(pattern)) {
            references.push({
              from: path.relative('docs', otherFile),
              type: 'link'
            })
            break
          }
        }
      } catch (error) {
        // 忽略读取错误
      }
    }

    return references
  }

  /**
   * 计算文档复杂度
   * @param {string} content - 文件内容
   */
  calculateComplexity(content) {
    let complexity = 0

    // 内容长度复杂度
    const length = content.length
    if (length > 10000) complexity += 3
    else if (length > 5000) complexity += 2
    else if (length > 2000) complexity += 1

    // 技术术语密度
    const techTerms = ['API', 'Vue', 'TypeScript', 'JavaScript', '组件', '函数', '接口', '类']
    let techTermCount = 0
    for (const term of techTerms) {
      techTermCount += (content.match(new RegExp(term, 'gi')) || []).length
    }
    const techDensity = techTermCount / (content.split(/\s+/).length / 100)
    if (techDensity > 5) complexity += 2
    else if (techDensity > 2) complexity += 1

    // 代码块数量
    const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length
    if (codeBlocks > 5) complexity += 2
    else if (codeBlocks > 2) complexity += 1

    return {
      score: complexity,
      level: complexity >= 4 ? 'high' : complexity >= 2 ? 'medium' : 'low'
    }
  }

  /**
   * 生成访问指标
   * @param {Object} gitInfo - Git信息
   * @param {Array} references - 引用信息
   */
  generateAccessMetrics(gitInfo, references) {
    // 计算访问热度评分（基于提交频率、引用数量等）
    let popularityScore = 0

    // 基于提交数量
    popularityScore += Math.min(gitInfo.commitCount / 10, 2)

    // 基于引用数量
    popularityScore += Math.min(references.length / 5, 2)

    // 基于最近活动
    if (gitInfo.recentCommits > 0) {
      popularityScore += 1
    }

    return {
      popularityScore: Math.round(popularityScore * 10) / 10,
      popularityLevel: popularityScore >= 3 ? 'high' : popularityScore >= 1.5 ? 'medium' : 'low',
      referenceCount: references.length,
      updateFrequency: gitInfo.activityLevel
    }
  }

  /**
   * 计算活动等级
   * @param {number} totalCommits - 总提交数
   * @param {number} recentCommits - 最近提交数
   */
  calculateActivityLevel(totalCommits, recentCommits) {
    if (totalCommits === 0) return 'new'
    if (recentCommits > totalCommits * 0.3) return 'very_active'
    if (recentCommits > totalCommits * 0.1) return 'active'
    if (recentCommits > 0) return 'moderate'
    return 'inactive'
  }

  /**
   * 提取关键词
   * @param {string} content - 文件内容
   */
  extractKeywords(content) {
    // 简化关键词提取（实际项目中可以使用更复杂的NLP方法）
    const commonKeywords = [
      'Vue', '组件', 'API', '函数', '接口', '配置', '安装', '使用',
      '前端', '后端', '测试', '部署', '开发', '架构', '性能', '安全'
    ]

    const keywords = []
    for (const keyword of commonKeywords) {
      if (content.includes(keyword)) {
        keywords.push(keyword)
      }
    }

    return keywords.slice(0, 10) // 最多返回10个关键词
  }

  /**
   * 生成分析报告
   * @param {string} period - 时间周期
   */
  async generateAnalysisReport(period) {
    const now = new Date()
    let startDate = new Date('2020-01-01') // 默认从2020年开始

    if (period !== 'all') {
      const days = period === 'month' ? 30 : period === 'quarter' ? 90 : period === 'year' ? 365 : 30
      startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    }

    // 过滤数据
    const filteredData = this.usageData.filter(item => {
      if (!item.gitInfo.lastCommit) return true
      const commitDate = new Date(item.gitInfo.lastCommit)
      return commitDate >= startDate
    })

    // 计算统计信息
    const stats = this.calculateUsageStatistics(filteredData)

    // 识别使用模式
    const patterns = this.identifyUsagePatterns(filteredData)

    // 生成趋势分析
    const trends = this.analyzeTrends(filteredData)

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalDocuments: filteredData.length,
      statistics: stats,
      patterns,
      trends,
      recommendations: this.generateRecommendations(stats, patterns, trends)
    }
  }

  /**
   * 计算使用统计
   * @param {Array} data - 使用数据
   */
  calculateUsageStatistics(data) {
    const stats = {
      byCategory: {},
      byComplexity: { high: 0, medium: 0, low: 0 },
      byPopularity: { high: 0, medium: 0, low: 0 },
      byActivity: {},
      totalSize: 0,
      averageSize: 0,
      mostReferenced: [],
      leastReferenced: []
    }

    // 按类别统计
    for (const item of data) {
      const category = item.filePath.split('/')[0] // technical, development, reports
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1

      // 复杂度统计
      stats.byComplexity[item.complexity.level]++

      // 热度统计
      stats.byPopularity[item.accessMetrics.popularityLevel]++

      // 活动统计
      const activity = item.gitInfo.activityLevel
      stats.byActivity[activity] = (stats.byActivity[activity] || 0) + 1

      // 文件大小
      stats.totalSize += item.size
    }

    stats.averageSize = stats.totalSize / data.length

    // 找出最受欢迎和最不受欢迎的文档
    const sortedByReferences = data.sort((a, b) => b.accessMetrics.referenceCount - a.accessMetrics.referenceCount)
    stats.mostReferenced = sortedByReferences.slice(0, 5).map(item => ({
      file: item.fileName,
      references: item.accessMetrics.referenceCount,
      popularity: item.accessMetrics.popularityScore
    }))

    stats.leastReferenced = sortedByReferences.slice(-5).map(item => ({
      file: item.fileName,
      references: item.accessMetrics.referenceCount,
      popularity: item.accessMetrics.popularityScore
    }))

    return stats
  }

  /**
   * 识别使用模式
   * @param {Array} data - 使用数据
   */
  identifyUsagePatterns(data) {
    const patterns = {
      categoryPreferences: {},
      complexityDistribution: {},
      updatePatterns: {},
      contentTypes: {}
    }

    // 分析类别偏好
    for (const item of data) {
      const category = item.filePath.split('/')[0]
      const contentType = this.inferContentType(item)

      patterns.categoryPreferences[category] = (patterns.categoryPreferences[category] || 0) + 1
      patterns.contentTypes[contentType] = (patterns.contentTypes[contentType] || 0) + 1
    }

    // 分析复杂度分布
    const complexities = data.map(item => item.complexity.level)
    for (const complexity of complexities) {
      patterns.complexityDistribution[complexity] = (patterns.complexityDistribution[complexity] || 0) + 1
    }

    return patterns
  }

  /**
   * 推断内容类型
   * @param {Object} item - 数据项
   */
  inferContentType(item) {
    const fileName = item.fileName.toLowerCase()

    if (fileName.includes('component')) return 'component'
    if (fileName.includes('api')) return 'api'
    if (fileName.includes('guide')) return 'guide'
    if (fileName.includes('architecture')) return 'architecture'
    if (fileName.includes('test')) return 'testing'
    if (fileName.includes('report')) return 'report'

    return 'general'
  }

  /**
   * 分析趋势
   * @param {Array} data - 使用数据
   */
  analyzeTrends(data) {
    // 简化趋势分析（实际项目中可以基于历史数据）
    return {
      growthRate: 'stable', // stable, increasing, decreasing
      popularCategories: [],
      emergingTopics: [],
      decliningTopics: []
    }
  }

  /**
   * 生成建议
   * @param {Object} stats - 统计信息
   * @param {Object} patterns - 使用模式
   * @param {Object} trends - 趋势分析
   */
  generateRecommendations(stats, patterns, trends) {
    const recommendations = []

    // 基于统计信息的建议
    if (stats.byPopularity.low > stats.byPopularity.high * 2) {
      recommendations.push({
        type: 'content',
        priority: 'high',
        suggestion: '大量文档访问量较低，建议优化内容质量或合并相似文档'
      })
    }

    if (stats.byActivity.inactive > stats.totalDocuments * 0.3) {
      recommendations.push({
        type: 'maintenance',
        priority: 'medium',
        suggestion: '超过30%的文档长期未更新，建议建立定期审查机制'
      })
    }

    // 基于使用模式的建议
    const totalDocs = Object.values(patterns.categoryPreferences).reduce((sum, count) => sum + count, 0)
    const maxCategory = Object.entries(patterns.categoryPreferences).reduce((max, [cat, count]) =>
      count > max.count ? { category: cat, count } : max, { category: '', count: 0 }
    )

    if (maxCategory.count > totalDocs * 0.6) {
      recommendations.push({
        type: 'balance',
        priority: 'low',
        suggestion: `${maxCategory.category}类文档占比过高，建议增加其他类型文档的覆盖`
      })
    }

    return recommendations
  }

  /**
   * 在控制台显示报告
   * @param {Object} analysis - 分析结果
   */
  displayConsoleReport(analysis) {
    console.log('\n📊 文档使用分析报告')
    console.log('='.repeat(60))
    console.log(`分析周期: ${analysis.period}`)
    console.log(`文档总数: ${analysis.totalDocuments}`)
    console.log(`分析时间: ${new Date().toLocaleString()}`)
    console.log('')

    // 类别分布
    console.log('📂 文档类别分布:')
    for (const [category, count] of Object.entries(analysis.statistics.byCategory)) {
      const percentage = ((count / analysis.totalDocuments) * 100).toFixed(1)
      console.log(`  ${category}: ${count} (${percentage}%)`)
    }
    console.log('')

    // 热度分布
    console.log('🔥 文档热度分布:')
    const popularity = analysis.statistics.byPopularity
    console.log(`  高热度: ${popularity.high}`)
    console.log(`  中热度: ${popularity.medium}`)
    console.log(`  低热度: ${popularity.low}`)
    console.log('')

    // 最受欢迎的文档
    console.log('⭐ 最受欢迎的文档:')
    analysis.statistics.mostReferenced.slice(0, 3).forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.file} (${doc.references}次引用, 热度${doc.popularity})`)
    })
    console.log('')

    // 改进建议
    if (analysis.recommendations.length > 0) {
      console.log('💡 改进建议:')
      analysis.recommendations.forEach((rec, index) => {
        const icon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'
        console.log(`  ${icon} ${rec.suggestion}`)
      })
    }

    console.log('='.repeat(60))
  }

  /**
   * 生成Markdown报告
   * @param {Object} analysis - 分析结果
   */
  generateMarkdownReport(analysis) {
    let report = '# 📊 文档使用分析报告\n\n'
    report += `**分析周期**: ${analysis.period}\n`
    report += `**文档总数**: ${analysis.totalDocuments}\n`
    report += `**生成时间**: ${new Date().toLocaleString()}\n\n`

    // 类别分布
    report += '## 📂 文档类别分布\n\n'
    report += '| 类别 | 数量 | 占比 |\n'
    report += '|------|------|------|\n'

    for (const [category, count] of Object.entries(analysis.statistics.byCategory)) {
      const percentage = ((count / analysis.totalDocuments) * 100).toFixed(1)
      report += `| ${category} | ${count} | ${percentage}% |\n`
    }

    report += '\n'

    // 热度分析
    report += '## 🔥 文档热度分析\n\n'
    const popularity = analysis.statistics.byPopularity
    report += `- **高热度文档**: ${popularity.high} 个\n`
    report += `- **中热度文档**: ${popularity.medium} 个\n`
    report += `- **低热度文档**: ${popularity.low} 个\n\n`

    // 最受欢迎的文档
    report += '## ⭐ 最受欢迎的文档\n\n'
    report += '| 文档 | 引用次数 | 热度评分 |\n'
    report += '|------|----------|----------|\n'

    analysis.statistics.mostReferenced.slice(0, 5).forEach(doc => {
      report += `| ${doc.file} | ${doc.references} | ${doc.popularity} |\n`
    })

    report += '\n'

    // 改进建议
    if (analysis.recommendations.length > 0) {
      report += '## 💡 改进建议\n\n'
      analysis.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴 高优先级' : rec.priority === 'medium' ? '🟡 中优先级' : '🟢 低优先级'
        report += `${index + 1}. **${priority}**: ${rec.suggestion}\n`
      })
    }

    return report
  }

  /**
   * 保存使用数据
   */
  saveUsageData() {
    const dataFile = 'docs/.usage-data.json'
    fs.writeFileSync(dataFile, JSON.stringify(this.usageData, null, 2), 'utf-8')
  }

  /**
   * 加载使用数据
   */
  loadUsageData() {
    try {
      const dataFile = 'docs/.usage-data.json'
      if (fs.existsSync(dataFile)) {
        this.usageData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
      }
    } catch (error) {
      console.warn('无法加载使用数据文件')
      this.usageData = []
    }
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  const analyzer = new FrontendDocUsageAnalyzer()

  if (args.length === 0) {
    showUsage()
    return
  }

  const command = args[0]

  try {
    switch (command) {
      case '--analyze':
        const period = args[2] || 'all'
        const format = args[4] === '--format' ? args[5] : 'console'
        await analyzer.analyzeUsage({ period, format })
        break

      case '--collect':
        await analyzer.collectUsageData()
        console.log('✅ 使用数据收集完成')
        break

      case '--report':
        const reportPeriod = args[2] || 'all'
        const reportFormat = args[4] === '--format' ? args[5] : 'markdown'
        const output = args[6] === '--output' ? args[7] : 'docs/reports/usage/analysis-report.md'

        const report = await analyzer.analyzeUsage({ period: reportPeriod, format: reportFormat })

        if (reportFormat === 'markdown') {
          fs.writeFileSync(output, report, 'utf-8')
          console.log(`✅ 分析报告已生成: ${output}`)
        }
        break

      case '--trends':
        // 显示使用趋势
        console.log('📈 使用趋势分析')
        const trendsAnalysis = await analyzer.analyzeUsage({ period: 'quarter', format: 'json' })
        console.log('趋势数据:', JSON.parse(trendsAnalysis).trends)
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
  console.log('Front前端文档使用统计工具')
  console.log('')
  console.log('用法:')
  console.log('  分析使用情况: --analyze [--period all|month|quarter|year] [--format console|markdown|json]')
  console.log('  收集使用数据: --collect')
  console.log('  生成分析报告: --report [--period <period>] [--format <format>] [--output <file>]')
  console.log('  显示使用趋势: --trends')
  console.log('')
  console.log('示例:')
  console.log('  node frontend-doc-usage-analyzer.js --analyze --period month')
  console.log('  node frontend-doc-usage-analyzer.js --report --period quarter --output usage-report.md')
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 执行出错:', error)
    process.exit(1)
  })
}

module.exports = FrontendDocUsageAnalyzer
