#!/usr/bin/env node

/**
 * 生成测试摘要报告
 * 用于CI/CD流程中的测试结果汇总和分析
 */

const fs = require('fs')
const path = require('path')

class TestSummaryGenerator {
  constructor() {
    this.testResultsDir = 'test-results'
    this.outputDir = 'test-summary-report'
    this.ensureOutputDir()
  }

  /**
   * 生成完整的测试摘要
   */
  async generateSummary() {
    console.log('🔍 正在分析测试结果...')

    const frontendResults = await this.analyzeTestResults('frontend')
    const adminResults = await this.analyzeTestResults('admin')
    const performanceMetrics = await this.analyzePerformanceMetrics()
    const coverageMetrics = await this.analyzeCoverageMetrics()

    const summary = {
      timestamp: new Date().toISOString(),
      environment: {
        ci: process.env.CI === 'true',
        branch: process.env.GITHUB_REF_NAME || 'unknown',
        commit: process.env.GITHUB_SHA || 'unknown',
        nodeVersion: process.version
      },
      frontend: frontendResults,
      admin: adminResults,
      performance: performanceMetrics,
      coverage: coverageMetrics,
      overall: {
        totalTests: frontendResults.total + adminResults.total,
        totalPassed: frontendResults.passed + adminResults.passed,
        totalFailed: frontendResults.failed + adminResults.failed,
        totalSkipped: frontendResults.skipped + adminResults.skipped,
        overallSuccessRate: 0,
        status: 'unknown'
      },
      recommendations: this.generateRecommendations(frontendResults, adminResults, performanceMetrics, coverageMetrics)
    }

    // 计算总体成功率
    summary.overall.overallSuccessRate = summary.overall.totalTests > 0
      ? ((summary.overall.totalPassed / summary.overall.totalTests) * 100).toFixed(2)
      : 0

    // 确定整体状态
    if (summary.overall.totalFailed === 0 && summary.overall.totalTests > 0) {
      summary.overall.status = 'passed'
    } else if (summary.overall.totalFailed > 0) {
      summary.overall.status = 'failed'
    } else {
      summary.overall.status = 'no_tests'
    }

    // 保存摘要
    this.saveSummary(summary)

    console.log('✅ 测试摘要生成完成')
    console.log(`📊 总体通过率: ${summary.overall.overallSuccessRate}%`)
    console.log(`📈 前端测试: ${frontendResults.successRate}% (${frontendResults.passed}/${frontendResults.total})`)
    console.log(`📈 管理后台测试: ${adminResults.successRate}% (${adminResults.passed}/${adminResults.total})`)

    return summary
  }

  /**
   * 分析测试结果
   */
  async analyzeTestResults(type) {
    const resultsPath = path.join(this.testResultsDir, type === 'frontend' ? 'chromium-1' : 'admin-test-results', 'results.json')

    try {
      if (!fs.existsSync(resultsPath)) {
        console.warn(`⚠️ ${type}测试结果文件不存在: ${resultsPath}`)
        return this.createEmptyResults()
      }

      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
      const stats = results.stats || {}

      return {
        total: stats.tests || 0,
        passed: stats.passes || 0,
        failed: stats.failures || 0,
        skipped: stats.pending || 0,
        duration: stats.duration || 0,
        successRate: stats.tests > 0 ? ((stats.passes / stats.tests) * 100).toFixed(2) : 0
      }
    } catch (error) {
      console.warn(`⚠️ 解析${type}测试结果失败:`, error.message)
      return this.createEmptyResults()
    }
  }

  /**
   * 分析性能指标
   */
  async analyzePerformanceMetrics() {
    const perfFiles = this.findFiles('**/performance-metrics.json')

    if (perfFiles.length === 0) {
      return {
        totalDuration: 0,
        averageDuration: 0,
        slowestTest: 'N/A',
        fastestTest: 'N/A',
        percentile95: 0
      }
    }

    try {
      const allMetrics = []

      for (const file of perfFiles) {
        const metrics = JSON.parse(fs.readFileSync(file, 'utf8'))
        allMetrics.push(...(metrics.results || []))
      }

      const durations = allMetrics.map(m => m.duration || 0).filter(d => d > 0)
      const sortedDurations = durations.sort((a, b) => a - b)

      return {
        totalDuration: durations.reduce((sum, d) => sum + d, 0),
        averageDuration: durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
        slowestTest: allMetrics.find(m => m.duration === Math.max(...durations))?.name || 'N/A',
        fastestTest: allMetrics.find(m => m.duration === Math.min(...durations))?.name || 'N/A',
        percentile95: sortedDurations[Math.floor(sortedDurations.length * 0.95)] || 0
      }
    } catch (error) {
      console.warn('⚠️ 性能指标分析失败:', error.message)
      return {
        totalDuration: 0,
        averageDuration: 0,
        slowestTest: 'N/A',
        fastestTest: 'N/A',
        percentile95: 0
      }
    }
  }

  /**
   * 分析覆盖率指标
   */
  async analyzeCoverageMetrics() {
    const coverageFiles = this.findFiles('**/coverage-summary.json')

    if (coverageFiles.length === 0) {
      return {
        overall: 0,
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
        status: 'no_coverage'
      }
    }

    try {
      let totalStatements = 0
      let coveredStatements = 0
      let totalBranches = 0
      let coveredBranches = 0
      let totalFunctions = 0
      let totalLines = 0
      let coveredLines = 0

      for (const file of coverageFiles) {
        const coverage = JSON.parse(fs.readFileSync(file, 'utf8'))
        const total = coverage.total || {}

        totalStatements += total.statements?.total || 0
        coveredStatements += total.statements?.covered || 0
        totalBranches += total.branches?.total || 0
        coveredBranches += total.branches?.covered || 0
        totalFunctions += total.functions?.total || 0
        totalLines += total.lines?.total || 0
        coveredLines += total.lines?.covered || 0
      }

      const statementsPct = totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0
      const branchesPct = totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0
      const functionsPct = totalFunctions > 0 ? (totalFunctions / Math.max(totalFunctions, 1)) * 100 : 0
      const linesPct = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0
      const overall = (statementsPct + branchesPct + functionsPct + linesPct) / 4

      let status = 'passed'
      if (overall < 70) status = 'failed'
      else if (overall < 80) status = 'warning'

      return {
        overall: overall.toFixed(2),
        statements: statementsPct.toFixed(2),
        branches: branchesPct.toFixed(2),
        functions: functionsPct.toFixed(2),
        lines: linesPct.toFixed(2),
        status
      }
    } catch (error) {
      console.warn('⚠️ 覆盖率指标分析失败:', error.message)
      return {
        overall: 0,
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
        status: 'error'
      }
    }
  }

  /**
   * 生成优化建议
   */
  generateRecommendations(frontend, admin, performance, coverage) {
    const recommendations = []

    // 基于测试结果的建议
    if (frontend.successRate < 90) {
      recommendations.push('前端E2E测试通过率低于90%，建议检查和修复失败的测试用例')
    }

    if (admin.successRate < 90) {
      recommendations.push('管理后台E2E测试通过率低于90%，建议检查和修复失败的测试用例')
    }

    // 基于性能的建议
    if (performance.averageDuration > 10000) {
      recommendations.push('平均测试执行时间超过10秒，建议优化测试性能或分离慢速测试')
    }

    if (performance.totalDuration > 300000) { // 5分钟
      recommendations.push('总测试执行时间超过5分钟，建议实施测试分片或并行执行')
    }

    // 基于覆盖率的建议
    if (parseFloat(coverage.overall) < 80) {
      recommendations.push('代码覆盖率低于80%，建议增加更多的测试用例')
    }

    if (parseFloat(coverage.branches) < 75) {
      recommendations.push('分支覆盖率偏低，建议增加条件分支的测试覆盖')
    }

    // CI/CD建议
    if (!process.env.CI) {
      recommendations.push('建议在CI/CD环境中运行完整测试套件以获得最佳结果')
    }

    return recommendations
  }

  /**
   * 创建空的测试结果
   */
  createEmptyResults() {
    return {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      successRate: 0
    }
  }

  /**
   * 查找文件
   */
  findFiles(pattern) {
    const results = []

    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return

      const items = fs.readdirSync(dir)

      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          walkDir(fullPath)
        } else if (this.matchesPattern(item, pattern)) {
          results.push(fullPath)
        }
      }
    }

    walkDir(this.testResultsDir)
    return results
  }

  /**
   * 模式匹配
   */
  matchesPattern(filename, pattern) {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
    return regex.test(filename)
  }

  /**
   * 确保输出目录存在
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  /**
   * 保存摘要
   */
  saveSummary(summary) {
    const summaryPath = path.join(this.outputDir, 'summary.json')
    const htmlPath = path.join(this.outputDir, 'summary.html')

    // 保存JSON
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))

    // 生成HTML报告
    const html = this.generateHtmlReport(summary)
    fs.writeFileSync(htmlPath, html)

    console.log(`📄 摘要报告已保存到: ${summaryPath}`)
    console.log(`🌐 HTML报告已保存到: ${htmlPath}`)
  }

  /**
   * 生成HTML报告
   */
  generateHtmlReport(summary) {
    const statusColors = {
      passed: '#28a745',
      failed: '#dc3545',
      warning: '#ffc107',
      no_tests: '#6c757d',
      no_coverage: '#6c757d',
      error: '#dc3545'
    }

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E2E测试摘要报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1000px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .metric-card { background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; border-left: 4px solid #007bff; }
        .metric-value { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .metric-label { color: #6c757d; font-size: 0.9em; }
        .status-passed { border-left-color: #28a745; }
        .status-passed .metric-value { color: #28a745; }
        .status-failed { border-left-color: #dc3545; }
        .status-failed .metric-value { color: #dc3545; }
        .status-warning { border-left-color: #ffc107; }
        .status-warning .metric-value { color: #ffc107; }
        .section { margin: 0 30px 30px; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .section h3 { margin-top: 0; color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .recommendations ul { margin: 0; padding-left: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background: #f8f9fa; font-weight: 600; }
        .environment { background: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>E2E测试摘要报告</h1>
            <p>生成时间: ${new Date(summary.timestamp).toLocaleString('zh-CN')}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card status-${summary.overall.status}">
                <div class="metric-value">${summary.overall.overallSuccessRate}%</div>
                <div class="metric-label">总体通过率</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.overall.totalTests}</div>
                <div class="metric-label">总测试数</div>
            </div>
            <div class="metric-card status-${summary.coverage.status}">
                <div class="metric-value">${summary.coverage.overall}%</div>
                <div class="metric-label">代码覆盖率</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${(summary.performance.totalDuration / 1000).toFixed(1)}s</div>
                <div class="metric-label">总耗时</div>
            </div>
        </div>

        <div class="section">
            <h3>测试结果详情</h3>
            <table>
                <tr><th>测试类型</th><th>总计</th><th>通过</th><th>失败</th><th>跳过</th><th>通过率</th></tr>
                <tr>
                    <td>前端E2E</td>
                    <td>${summary.frontend.total}</td>
                    <td>${summary.frontend.passed}</td>
                    <td>${summary.frontend.failed}</td>
                    <td>${summary.frontend.skipped}</td>
                    <td>${summary.frontend.successRate}%</td>
                </tr>
                <tr>
                    <td>管理后台E2E</td>
                    <td>${summary.admin.total}</td>
                    <td>${summary.admin.passed}</td>
                    <td>${summary.admin.failed}</td>
                    <td>${summary.admin.skipped}</td>
                    <td>${summary.admin.successRate}%</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <h3>性能指标</h3>
            <table>
                <tr><th>指标</th><th>数值</th></tr>
                <tr><td>总执行时间</td><td>${(summary.performance.totalDuration / 1000).toFixed(2)}s</td></tr>
                <tr><td>平均测试时间</td><td>${summary.performance.averageDuration.toFixed(0)}ms</td></tr>
                <tr><td>最慢测试</td><td>${summary.performance.slowestTest}</td></tr>
                <tr><td>最快测试</td><td>${summary.performance.fastestTest}</td></tr>
                <tr><td>95th百分位</td><td>${summary.performance.percentile95}ms</td></tr>
            </table>
        </div>

        <div class="section">
            <h3>覆盖率详情</h3>
            <table>
                <tr><th>类型</th><th>覆盖率</th></tr>
                <tr><td>语句覆盖</td><td>${summary.coverage.statements}%</td></tr>
                <tr><td>分支覆盖</td><td>${summary.coverage.branches}%</td></tr>
                <tr><td>函数覆盖</td><td>${summary.coverage.functions}%</td></tr>
                <tr><td>行覆盖</td><td>${summary.coverage.lines}%</td></tr>
            </table>
        </div>

        ${summary.recommendations.length > 0 ? `
        <div class="section">
            <h3>优化建议</h3>
            <div class="recommendations">
                <ul>
                    ${summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
        ` : ''}

        <div class="section">
            <h3>环境信息</h3>
            <div class="environment">
                <strong>CI环境:</strong> ${summary.environment.ci ? '是' : '否'} |
                <strong>分支:</strong> ${summary.environment.branch} |
                <strong>提交:</strong> ${summary.environment.commit.substring(0, 8)} |
                <strong>Node.js:</strong> ${summary.environment.nodeVersion}
            </div>
        </div>
    </div>
</body>
</html>`
  }
}

// 执行摘要生成
if (require.main === module) {
  const generator = new TestSummaryGenerator()
  generator.generateSummary().catch(console.error)
}

module.exports = TestSummaryGenerator
