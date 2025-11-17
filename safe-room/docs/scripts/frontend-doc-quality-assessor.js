#!/usr/bin/env node

/**
 * Front前端文档综合质量评估工具
 * 实现多维度质量评分、趋势分析和质量报告生成
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

class FrontendDocQualityAssessor {
  constructor() {
    this.qualityMetrics = {
      completeness: 0,    // 完整性
      accuracy: 0,        // 准确性
      readability: 0,     // 可读性
      consistency: 0,     // 一致性
      structure: 0,       // 结构合理性
      technical: 0        // 技术规范性
    }

    this.weights = {
      completeness: 0.2,
      accuracy: 0.25,
      readability: 0.15,
      consistency: 0.15,
      structure: 0.15,
      technical: 0.1
    }

    this.assessmentHistory = []
    this.loadAssessmentHistory()
  }

  /**
   * 评估单个文档质量
   * @param {string} filePath - 文档路径
   */
  async assessDocument(filePath) {
    console.log(`🔍 评估文档质量: ${filePath}`)

    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')
      const fileName = path.basename(filePath)

      const assessment = {
        filePath,
        fileName,
        timestamp: new Date().toISOString(),
        metrics: {},
        issues: [],
        suggestions: [],
        score: 0
      }

      // 1. 完整性评估
      assessment.metrics.completeness = this.assessCompleteness(content, lines, filePath)

      // 2. 准确性评估
      assessment.metrics.accuracy = this.assessAccuracy(content, filePath)

      // 3. 可读性评估
      assessment.metrics.readability = this.assessReadability(content, lines)

      // 4. 一致性评估
      assessment.metrics.consistency = this.assessConsistency(content, filePath)

      // 5. 结构合理性评估
      assessment.metrics.structure = this.assessStructure(content, lines, filePath)

      // 6. 技术规范性评估
      assessment.metrics.technical = this.assessTechnicalQuality(content, filePath)

      // 计算综合得分
      assessment.score = this.calculateOverallScore(assessment.metrics)

      // 生成问题和建议
      assessment.issues = this.identifyIssues(assessment.metrics, filePath)
      assessment.suggestions = this.generateSuggestions(assessment.metrics, filePath)

      console.log(`📊 质量得分: ${assessment.score.toFixed(1)}/100`)

      return assessment

    } catch (error) {
      console.error(`❌ 评估失败 ${filePath}: ${error.message}`)
      return {
        filePath,
        fileName: path.basename(filePath),
        timestamp: new Date().toISOString(),
        error: error.message,
        score: 0
      }
    }
  }

  /**
   * 评估完整性
   */
  assessCompleteness(content, lines, filePath) {
    let score = 100
    const issues = []

    // 检查头部信息完整性
    const headerMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (!headerMatch) {
      score -= 30
      issues.push('缺少文档头部信息')
    } else {
      const header = headerMatch[1]
      const requiredFields = ['title', 'version', 'last_updated', 'status', 'category', 'tags']

      for (const field of requiredFields) {
        if (!header.includes(`${field}:`)) {
          score -= 5
          issues.push(`头部缺少必需字段: ${field}`)
        }
      }
    }

    // 检查概述部分
    if (!content.includes('## 📖 概述')) {
      score -= 20
      issues.push('缺少概述部分')
    }

    // 检查目录
    if (!content.includes('## 📋 目录')) {
      score -= 10
      issues.push('缺少目录部分')
    }

    // 检查是否有足够的示例
    const codeBlocks = (content.match(/```/g) || []).length / 2
    if (codeBlocks < 1) {
      score -= 15
      issues.push('缺少代码示例')
    }

    // 检查是否有相关链接
    if (!content.includes('## 📚 相关链接')) {
      score -= 10
      issues.push('缺少相关链接部分')
    }

    return Math.max(0, score)
  }

  /**
   * 评估准确性
   */
  assessAccuracy(content, filePath) {
    let score = 100
    const issues = []

    // 检查版本信息是否合理
    const versionMatch = content.match(/version:\s*v?([\d.]+)/)
    if (versionMatch) {
      const version = versionMatch[1]
      const versionParts = version.split('.')
      if (versionParts.length !== 3) {
        score -= 10
        issues.push('版本号格式不规范')
      }
    }

    // 检查日期格式
    const dateMatches = content.match(/last_updated:\s*(\d{4}-\d{2}-\d{2})/g)
    if (dateMatches) {
      for (const match of dateMatches) {
        const dateStr = match.match(/(\d{4}-\d{2}-\d{2})/)[1]
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) {
          score -= 5
          issues.push('日期格式无效')
        } else if (date > new Date()) {
          score -= 5
          issues.push('更新日期不能是未来日期')
        }
      }
    }

    // 检查是否有占位符文本
    const placeholders = ['[请填写]', '[待补充]', '[TODO]']
    for (const placeholder of placeholders) {
      if (content.includes(placeholder)) {
        score -= 10
        issues.push(`包含未填充的占位符: ${placeholder}`)
      }
    }

    // 检查链接格式
    const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g)
    if (links) {
      let invalidLinks = 0
      for (const link of links) {
        const linkMatch = link.match(/\[([^\]]+)\]\(([^)]+)\)/)
        if (linkMatch) {
          const [, , linkPath] = linkMatch
          if (linkPath.startsWith('./') || linkPath.startsWith('../')) {
            // 检查相对路径是否存在
            const fullPath = path.resolve(path.dirname(filePath), linkPath)
            if (!fs.existsSync(fullPath) && !fs.existsSync(fullPath + '.md')) {
              invalidLinks++
            }
          }
        }
      }
      if (invalidLinks > 0) {
        score -= Math.min(20, invalidLinks * 5)
        issues.push(`存在${invalidLinks}个无效链接`)
      }
    }

    return Math.max(0, score)
  }

  /**
   * 评估可读性
   */
  assessReadability(content, lines) {
    let score = 100
    const issues = []

    // 检查段落长度
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0)
    let longParagraphs = 0
    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/).length
      if (words > 150) {
        longParagraphs++
      }
    }
    if (longParagraphs > 0) {
      score -= Math.min(20, longParagraphs * 5)
      issues.push(`${longParagraphs}个段落过长（建议不超过150词）`)
    }

    // 检查标题层级
    const headings = lines.filter(line => line.match(/^#{1,6}\s+/))
    let invalidStructure = false
    for (let i = 0; i < headings.length - 1; i++) {
      const currentLevel = headings[i].match(/^#{1,6}/)[0].length
      const nextLevel = headings[i + 1].match(/^#{1,6}/)[0].length
      if (nextLevel > currentLevel + 1) {
        invalidStructure = true
        break
      }
    }
    if (invalidStructure) {
      score -= 15
      issues.push('标题层级结构不合理')
    }

    // 检查中英文混用
    const mixedContent = content.match(/[\u4e00-\u9fa5][A-Za-z]|[A-Za-z][\u4e00-\u9fa5]/g)
    if (mixedContent && mixedContent.length > 5) {
      score -= 10
      issues.push('存在过多中英文混用')
    }

    // 检查标点符号使用
    const chineseText = content.match(/[\u4e00-\u9fa5]+/g)
    if (chineseText) {
      // 检查全角标点
      const fullWidthPunct = content.match(/[，。！？；：""''（）【】《》]/g)
      if (!fullWidthPunct || fullWidthPunct.length < chineseText.length * 0.1) {
        score -= 5
        issues.push('建议使用全角中文标点')
      }
    }

    return Math.max(0, score)
  }

  /**
   * 评估一致性
   */
  assessConsistency(content, filePath) {
    let score = 100
    const issues = []

    // 检查术语一致性（示例：检查常见术语的拼写）
    const terms = {
      'frontend': ['前端', '前台'],
      'backend': ['后端', '后台'],
      'component': ['组件'],
      'function': ['函数', '方法'],
      'parameter': ['参数'],
      'property': ['属性']
    }

    // 这里可以扩展为更复杂的术语一致性检查
    // 暂时检查一些基本的格式一致性

    // 检查列表格式一致性
    const unorderedLists = content.match(/^\s*[-*+]\s/gm)
    const orderedLists = content.match(/^\s*\d+\.\s/gm)

    // 检查代码块语言标识
    const codeBlocks = content.match(/```(\w*)/g)
    if (codeBlocks) {
      let missingLang = 0
      for (const block of codeBlocks) {
        if (block === '```') {
          missingLang++
        }
      }
      if (missingLang > 0) {
        score -= Math.min(15, missingLang * 3)
        issues.push(`${missingLang}个代码块缺少语言标识`)
      }
    }

    // 检查标题格式一致性
    const titleHeadings = lines.filter(line => line.match(/^#\s+/))
    if (titleHeadings.length !== 1) {
      score -= 10
      issues.push('文档应该有且只有一个一级标题')
    }

    return Math.max(0, score)
  }

  /**
   * 评估结构合理性
   */
  assessStructure(content, lines, filePath) {
    let score = 100
    const issues = []

    // 检查标准结构
    const requiredSections = ['📖 概述', '📋 目录']
    for (const section of requiredSections) {
      if (!content.includes(`## ${section}`)) {
        score -= 15
        issues.push(`缺少必需章节: ${section}`)
      }
    }

    // 检查章节顺序
    const sectionOrder = ['📋 目录', '📖 概述']
    let lastIndex = -1
    for (const section of sectionOrder) {
      const index = content.indexOf(`## ${section}`)
      if (index !== -1 && index < lastIndex) {
        score -= 10
        issues.push('章节顺序不符合规范')
        break
      }
      lastIndex = index
    }

    // 检查页脚信息
    const footerMarkers = ['最后更新', '维护责任人', '联系方式']
    let footerScore = 0
    for (const marker of footerMarkers) {
      if (content.includes(marker)) {
        footerScore += 33
      }
    }
    score = score * 0.8 + footerScore * 0.2

    if (footerScore < 100) {
      issues.push('页脚信息不完整')
    }

    return Math.max(0, score)
  }

  /**
   * 评估技术规范性
   */
  assessTechnicalQuality(content, filePath) {
    let score = 100
    const issues = []

    // 检查文档类型特定的技术规范
    const fileName = path.basename(filePath).toLowerCase()

    if (fileName.includes('component')) {
      // 组件文档的技术规范
      const requiredSections = ['API文档', 'Props 属性', 'Events 事件']
      for (const section of requiredSections) {
        if (!content.includes(section)) {
          score -= 10
          issues.push(`组件文档缺少: ${section}`)
        }
      }

      // 检查是否有使用示例
      if (!content.includes('## 💡 示例代码') && !content.includes('## 🚀 安装使用')) {
        score -= 15
        issues.push('组件文档缺少使用示例')
      }
    }

    if (fileName.includes('api')) {
      // API文档的技术规范
      if (!content.includes('接口地址') && !content.includes('请求参数')) {
        score -= 15
        issues.push('API文档缺少必要的技术信息')
      }
    }

    // 检查代码示例质量
    const codeBlocks = content.match(/```[\s\S]*?```/g)
    if (codeBlocks) {
      for (const block of codeBlocks) {
        // 检查代码块是否有基本的语法结构
        if (block.includes('function') || block.includes('const') || block.includes('class')) {
          // 检查是否有注释
          if (!block.includes('//') && !block.includes('/*')) {
            score -= 2 // 每个缺少注释的代码块减分
          }
        }
      }
    }

    return Math.max(0, score)
  }

  /**
   * 计算综合得分
   */
  calculateOverallScore(metrics) {
    let totalScore = 0

    for (const [metric, weight] of Object.entries(this.weights)) {
      totalScore += metrics[metric] * weight
    }

    return Math.round(totalScore * 10) / 10
  }

  /**
   * 识别问题
   */
  identifyIssues(metrics, filePath) {
    const issues = []

    for (const [metric, score] of Object.entries(metrics)) {
      if (score < 80) {
        issues.push({
          type: metric,
          severity: score < 60 ? 'high' : 'medium',
          description: this.getIssueDescription(metric, score)
        })
      }
    }

    return issues
  }

  /**
   * 生成建议
   */
  generateSuggestions(metrics, filePath) {
    const suggestions = []

    for (const [metric, score] of Object.entries(metrics)) {
      if (score < 90) {
        suggestions.push(...this.getSuggestionsForMetric(metric, score))
      }
    }

    return suggestions
  }

  /**
   * 获取问题描述
   */
  getIssueDescription(metric, score) {
    const descriptions = {
      completeness: `完整性评分过低 (${score})，文档结构或内容不完整`,
      accuracy: `准确性评分过低 (${score})，可能存在信息错误或格式问题`,
      readability: `可读性评分过低 (${score})，文档难以阅读和理解`,
      consistency: `一致性评分过低 (${score})，格式或术语不统一`,
      structure: `结构评分过低 (${score})，文档组织不合理`,
      technical: `技术规范性评分过低 (${score})，不符合技术文档标准`
    }

    return descriptions[metric] || `${metric}评分过低`
  }

  /**
   * 获取针对特定指标的建议
   */
  getSuggestionsForMetric(metric, score) {
    const suggestions = {
      completeness: [
        '完善文档头部信息，确保包含所有必需字段',
        '添加概述和目录部分',
        '补充代码示例和相关链接',
        '检查并完善所有章节内容'
      ],
      accuracy: [
        '验证所有技术信息的准确性',
        '检查链接的有效性',
        '更新版本和日期信息',
        '移除或替换占位符文本'
      ],
      readability: [
        '缩短过长的段落',
        '优化标题层级结构',
        '检查中英文混用情况',
        '使用正确的标点符号'
      ],
      consistency: [
        '统一术语使用',
        '规范代码块格式',
        '确保只有一个一级标题',
        '统一列表和表格格式'
      ],
      structure: [
        '按照标准结构组织内容',
        '调整章节顺序',
        '完善页脚信息',
        '优化内容层次'
      ],
      technical: [
        '添加必要的API文档部分',
        '完善组件属性和事件说明',
        '在代码示例中添加注释',
        '遵循相应的技术文档规范'
      ]
    }

    return suggestions[metric] || [`改进${metric}方面的问题`]
  }

  /**
   * 批量评估文档质量
   */
  async assessAllDocuments(pattern = 'docs/**/*.md') {
    console.log('🔍 开始批量质量评估...')

    const files = await glob(pattern, { cwd: process.cwd() })
    const assessments = []

    console.log(`📄 发现 ${files.length} 个文档文件`)

    for (const file of files) {
      const assessment = await this.assessDocument(file)
      assessments.push(assessment)

      // 显示进度
      const progress = ((assessments.length / files.length) * 100).toFixed(1)
      console.log(`⏳ 进度: ${progress}% (${assessments.length}/${files.length})`)
    }

    return assessments
  }

  /**
   * 生成质量报告
   */
  async generateQualityReport(assessments, outputPath) {
    console.log('📋 生成质量报告...')

    const report = {
      timestamp: new Date().toISOString(),
      summary: this.calculateSummary(assessments),
      assessments: assessments,
      trends: this.analyzeTrends(assessments),
      recommendations: this.generateRecommendations(assessments)
    }

    // 确保目录存在
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8')
    console.log(`✅ 质量报告已保存: ${outputPath}`)

    return report
  }

  /**
   * 计算汇总统计
   */
  calculateSummary(assessments) {
    const validAssessments = assessments.filter(a => !a.error)

    if (validAssessments.length === 0) {
      return {
        totalDocuments: assessments.length,
        validDocuments: 0,
        averageScore: 0,
        scoreDistribution: {}
      }
    }

    const scores = validAssessments.map(a => a.score)
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

    // 得分分布
    const distribution = {
      excellent: scores.filter(s => s >= 90).length,
      good: scores.filter(s => s >= 80 && s < 90).length,
      fair: scores.filter(s => s >= 70 && s < 80).length,
      poor: scores.filter(s => s < 70).length
    }

    return {
      totalDocuments: assessments.length,
      validDocuments: validAssessments.length,
      averageScore: Math.round(averageScore * 10) / 10,
      scoreDistribution: distribution,
      metricsAverages: this.calculateMetricsAverages(validAssessments)
    }
  }

  /**
   * 计算各项指标平均分
   */
  calculateMetricsAverages(assessments) {
    const metrics = ['completeness', 'accuracy', 'readability', 'consistency', 'structure', 'technical']
    const averages = {}

    for (const metric of metrics) {
      const scores = assessments.map(a => a.metrics[metric]).filter(s => s !== undefined)
      averages[metric] = scores.length > 0 ?
        Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10 : 0
    }

    return averages
  }

  /**
   * 分析趋势
   */
  analyzeTrends(assessments) {
    // 这里可以与历史数据比较
    // 暂时返回基本统计
    return {
      comparison: '首次评估，暂无历史对比',
      improvement: null,
      concerning: this.identifyConcerningDocuments(assessments)
    }
  }

  /**
   * 识别需要关注的文档
   */
  identifyConcerningDocuments(assessments) {
    return assessments
      .filter(a => !a.error && a.score < 70)
      .map(a => ({
        file: a.fileName,
        score: a.score,
        mainIssues: a.issues.slice(0, 2).map(i => i.description)
      }))
  }

  /**
   * 生成改进建议
   */
  generateRecommendations(assessments) {
    const recommendations = []

    const summary = this.calculateSummary(assessments)

    // 基于整体得分给出建议
    if (summary.averageScore < 70) {
      recommendations.push({
        priority: 'high',
        category: 'overall',
        suggestion: '整体文档质量需要显著改进，建议进行全面的质量提升计划'
      })
    } else if (summary.averageScore < 85) {
      recommendations.push({
        priority: 'medium',
        category: 'overall',
        suggestion: '文档质量良好，但还有改进空间，建议重点关注薄弱环节'
      })
    }

    // 基于各项指标给出具体建议
    for (const [metric, score] of Object.entries(summary.metricsAverages)) {
      if (score < 80) {
        recommendations.push({
          priority: score < 60 ? 'high' : 'medium',
          category: metric,
          suggestion: this.getMetricImprovementSuggestion(metric, score)
        })
      }
    }

    return recommendations
  }

  /**
   * 获取指标改进建议
   */
  getMetricImprovementSuggestion(metric, score) {
    const suggestions = {
      completeness: '完善文档结构，确保所有必需部分都已包含',
      accuracy: '验证信息准确性，修复链接和格式问题',
      readability: '改进文档可读性，优化段落长度和结构',
      consistency: '统一格式和术语使用，确保一致性',
      structure: '优化文档组织结构，遵循标准规范',
      technical: '提升技术内容质量，完善代码示例和API文档'
    }

    return suggestions[metric] || `改进${metric}方面的质量`
  }

  /**
   * 保存评估历史
   */
  saveAssessmentHistory(assessments) {
    const historyEntry = {
      timestamp: new Date().toISOString(),
      summary: this.calculateSummary(assessments),
      assessmentsCount: assessments.length
    }

    this.assessmentHistory.push(historyEntry)

    // 只保留最近50条历史记录
    if (this.assessmentHistory.length > 50) {
      this.assessmentHistory = this.assessmentHistory.slice(-50)
    }

    const historyFile = 'docs/.quality-history.json'
    fs.writeFileSync(historyFile, JSON.stringify(this.assessmentHistory, null, 2), 'utf-8')
  }

  /**
   * 加载评估历史
   */
  loadAssessmentHistory() {
    try {
      const historyFile = 'docs/.quality-history.json'
      if (fs.existsSync(historyFile)) {
        this.assessmentHistory = JSON.parse(fs.readFileSync(historyFile, 'utf-8'))
      }
    } catch (error) {
      console.warn('无法加载质量评估历史')
      this.assessmentHistory = []
    }
  }

  /**
   * 显示质量统计
   */
  async showStatistics(assessments) {
    const summary = this.calculateSummary(assessments)

    console.log('\n📊 文档质量统计')
    console.log('='.repeat(50))
    console.log(`总文档数: ${summary.totalDocuments}`)
    console.log(`有效评估: ${summary.validDocuments}`)
    console.log(`平均得分: ${summary.averageScore}/100`)
    console.log('')
    console.log('得分分布:')
    console.log(`  🏆 优秀 (≥90): ${summary.scoreDistribution.excellent}`)
    console.log(`  ✅ 良好 (80-89): ${summary.scoreDistribution.good}`)
    console.log(`  ⚠️ 一般 (70-79): ${summary.scoreDistribution.fair}`)
    console.log(`  ❌ 较差 (<70): ${summary.scoreDistribution.poor}`)
    console.log('')
    console.log('各项指标平均分:')
    for (const [metric, score] of Object.entries(summary.metricsAverages)) {
      const icon = score >= 85 ? '✅' : score >= 70 ? '⚠️' : '❌'
      console.log(`  ${icon} ${metric}: ${score}`)
    }
    console.log('='.repeat(50))

    return summary
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  const assessor = new FrontendDocQualityAssessor()

  if (args.length === 0) {
    showUsage()
    return
  }

  const command = args[0]

  try {
    switch (command) {
      case '--assess':
        if (args.length < 3) {
          console.error('用法: --assess --file <file>')
          process.exit(1)
        }

        const fileIndex = args.indexOf('--file')
        const filePath = args[fileIndex + 1]

        const assessment = await assessor.assessDocument(filePath)
        console.log(JSON.stringify(assessment, null, 2))
        break

      case '--assess-all':
        const pattern = args[2] || 'docs/**/*.md'
        const assessments = await assessor.assessAllDocuments(pattern)

        // 显示统计
        await assessor.showStatistics(assessments)

        // 保存历史
        assessor.saveAssessmentHistory(assessments)

        // 生成报告
        const reportPath = 'docs/reports/quality/comprehensive-quality-report.json'
        await assessor.generateQualityReport(assessments, reportPath)
        break

      case '--report':
        const reportPattern = args[2] || 'docs/**/*.md'
        const reportAssessments = await assessor.assessAllDocuments(reportPattern)
        const reportOutput = args[4] || 'docs/reports/quality/quality-report.json'

        await assessor.generateQualityReport(reportAssessments, reportOutput)
        assessor.saveAssessmentHistory(reportAssessments)
        break

      case '--stats':
        const statsPattern = args[2] || 'docs/**/*.md'
        const statsAssessments = await assessor.assessAllDocuments(statsPattern)
        await assessor.showStatistics(statsAssessments)
        break

      case '--trends':
        // 显示质量趋势
        console.log('📈 质量趋势分析')
        console.log('历史评估记录:', assessor.assessmentHistory.length)

        if (assessor.assessmentHistory.length > 1) {
          const latest = assessor.assessmentHistory[assessor.assessmentHistory.length - 1]
          const previous = assessor.assessmentHistory[assessor.assessmentHistory.length - 2]

          const scoreChange = latest.summary.averageScore - previous.summary.averageScore
          const changeIcon = scoreChange > 0 ? '📈' : scoreChange < 0 ? '📉' : '➡️'

          console.log(`${changeIcon} 平均得分变化: ${scoreChange.toFixed(1)}`)
          console.log(`最新评估: ${latest.summary.averageScore} (${latest.timestamp.split('T')[0]})`)
          console.log(`上次评估: ${previous.summary.averageScore} (${previous.timestamp.split('T')[0]})`)
        } else {
          console.log('需要至少两次评估才能分析趋势')
        }
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
  console.log('Front前端文档综合质量评估工具')
  console.log('')
  console.log('用法:')
  console.log('  评估单个文档: --assess --file <file>')
  console.log('  评估所有文档: --assess-all [pattern]')
  console.log('  生成质量报告: --report [pattern] --output <file>')
  console.log('  显示质量统计: --stats [pattern]')
  console.log('  显示质量趋势: --trends')
  console.log('')
  console.log('示例:')
  console.log('  node frontend-doc-quality-assessor.js --assess --file docs/technical/frontend/components/USERLOGIN.md')
  console.log('  node frontend-doc-quality-assessor.js --assess-all')
  console.log('  node frontend-doc-quality-assessor.js --report --output custom-report.json')
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 执行出错:', error)
    process.exit(1)
  })
}

module.exports = FrontendDocQualityAssessor
