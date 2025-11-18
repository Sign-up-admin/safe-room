import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

/**
 * Test Reporting Utilities - 测试报告工具
 * 提供综合的测试报告生成、覆盖率分析和趋势跟踪
 */

export interface TestReport {
  summary: TestSummary
  coverage: CoverageReport
  performance: PerformanceReport
  trends: TrendReport
  recommendations: string[]
  metadata: ReportMetadata
}

export interface TestSummary {
  total: number
  passed: number
  failed: number
  skipped: number
  duration: number
  successRate: number
  failureRate: number
  averageDuration: number
  slowestTest: {
    name: string
    duration: number
  }
  fastestTest: {
    name: string
    duration: number
  }
}

export interface CoverageReport {
  overall: {
    statements: number
    branches: number
    functions: number
    lines: number
  }
  files: FileCoverage[]
  thresholds: CoverageThresholds
  status: 'passed' | 'failed' | 'warning'
}

export interface FileCoverage {
  filename: string
  statements: number
  branches: number
  functions: number
  lines: number
}

export interface CoverageThresholds {
  statements: number
  branches: number
  functions: number
  lines: number
}

export interface PerformanceReport {
  totalDuration: number
  averageTestDuration: number
  percentile95: number
  percentile99: number
  slowTests: Array<{
    name: string
    duration: number
    category: string
  }>
  performanceBudget: {
    status: 'passed' | 'failed'
    violations: string[]
  }
}

export interface TrendReport {
  previousRuns: Array<{
    date: string
    successRate: number
    duration: number
    coverage: number
  }>
  trend: 'improving' | 'stable' | 'declining'
  changes: {
    successRate: number
    duration: number
    coverage: number
  }
}

export interface ReportMetadata {
  generatedAt: string
  testEnvironment: string
  playwrightVersion: string
  nodeVersion: string
  gitCommit?: string
  branch?: string
}

export class TestReporter {
  private reportDir: string
  private coverageDir: string

  constructor(reportDir = 'test-results') {
    this.reportDir = reportDir
    this.coverageDir = path.join(reportDir, 'coverage')
    this.ensureDirectories()
  }

  /**
   * 生成完整的测试报告
   */
  async generateComprehensiveReport(testResults: any[]): Promise<TestReport> {
    console.log('Generating comprehensive test report...')

    const summary = this.generateTestSummary(testResults)
    const coverage = await this.generateCoverageReport()
    const performance = this.generatePerformanceReport(testResults)
    const trends = await this.generateTrendReport()
    const recommendations = this.generateRecommendations(summary, coverage, performance)

    const report: TestReport = {
      summary,
      coverage,
      performance,
      trends,
      recommendations,
      metadata: this.generateMetadata()
    }

    await this.saveReport(report)
    return report
  }

  /**
   * 生成测试摘要
   */
  private generateTestSummary(testResults: any[]): TestSummary {
    const total = testResults.length
    const passed = testResults.filter(t => t.status === 'passed').length
    const failed = testResults.filter(t => t.status === 'failed').length
    const skipped = testResults.filter(t => t.status === 'skipped').length

    const durations = testResults.map(t => t.duration || 0).filter(d => d > 0)
    const totalDuration = durations.reduce((sum, d) => sum + d, 0)
    const averageDuration = totalDuration / durations.length

    const sortedDurations = [...durations].sort((a, b) => b - a)

    return {
      total,
      passed,
      failed,
      skipped,
      duration: totalDuration,
      successRate: (passed / total) * 100,
      failureRate: (failed / total) * 100,
      averageDuration,
      slowestTest: {
        name: testResults.find(t => t.duration === sortedDurations[0])?.title || 'Unknown',
        duration: sortedDurations[0] || 0
      },
      fastestTest: {
        name: testResults.find(t => t.duration === sortedDurations[sortedDurations.length - 1])?.title || 'Unknown',
        duration: sortedDurations[sortedDurations.length - 1] || 0
      }
    }
  }

  /**
   * 生成覆盖率报告
   */
  private generateCoverageReport(): CoverageReport {
    try {
      // 尝试读取覆盖率文件
      const coveragePath = path.join(this.coverageDir, 'coverage-summary.json')

      if (!fs.existsSync(coveragePath)) {
        return this.generateEmptyCoverageReport()
      }

      const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'))

      const overall = coverageData.total || {}
      const files: FileCoverage[] = []

      // 处理文件级覆盖率
      Object.entries(coverageData).forEach(([filename, data]: [string, any]) => {
        if (filename !== 'total') {
          files.push({
            filename,
            statements: data.statements?.pct || 0,
            branches: data.branches?.pct || 0,
            functions: data.functions?.pct || 0,
            lines: data.lines?.pct || 0
          })
        }
      })

      // 检查阈值
      const thresholds: CoverageThresholds = {
        statements: 80,
        branches: 75,
        functions: 85,
        lines: 80
      }

      const status = this.determineCoverageStatus(overall, thresholds)

      return {
        overall: {
          statements: overall.statements?.pct || 0,
          branches: overall.branches?.pct || 0,
          functions: overall.functions?.pct || 0,
          lines: overall.lines?.pct || 0
        },
        files,
        thresholds,
        status
      }
    } catch (error) {
      console.warn('Failed to generate coverage report:', error)
      return this.generateEmptyCoverageReport()
    }
  }

  /**
   * 生成空的覆盖率报告
   */
  private generateEmptyCoverageReport(): CoverageReport {
    return {
      overall: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0
      },
      files: [],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 85,
        lines: 80
      },
      status: 'failed'
    }
  }

  /**
   * 判断覆盖率状态
   */
  private determineCoverageStatus(overall: any, thresholds: CoverageThresholds): 'passed' | 'failed' | 'warning' {
    const statements = overall.statements?.pct || 0
    const branches = overall.branches?.pct || 0
    const functions = overall.functions?.pct || 0
    const lines = overall.lines?.pct || 0

    const allPassed = statements >= thresholds.statements &&
                     branches >= thresholds.branches &&
                     functions >= thresholds.functions &&
                     lines >= thresholds.lines

    if (allPassed) return 'passed'

    const anyCritical = statements < 70 || functions < 75 || lines < 70
    return anyCritical ? 'failed' : 'warning'
  }

  /**
   * 生成性能报告
   */
  private generatePerformanceReport(testResults: any[]): PerformanceReport {
    const durations = testResults.map(t => t.duration || 0).filter(d => d > 0)
    const sortedDurations = [...durations].sort((a, b) => a - b)

    const percentile95 = sortedDurations[Math.floor(sortedDurations.length * 0.95)] || 0
    const percentile99 = sortedDurations[Math.floor(sortedDurations.length * 0.99)] || 0

    const slowTests = testResults
      .filter(t => (t.duration || 0) > 30000)
      .map(t => ({
        name: t.title || 'Unknown',
        duration: t.duration || 0,
        category: this.categorizeTest(t.title || '')
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)

    const totalDuration = durations.reduce((sum, d) => sum + d, 0)

    return {
      totalDuration,
      averageTestDuration: totalDuration / durations.length,
      percentile95,
      percentile99,
      slowTests,
      performanceBudget: {
        status: totalDuration < 300000 ? 'passed' : 'failed', // 5分钟预算
        violations: totalDuration >= 300000 ? ['Total execution time exceeds 5 minutes'] : []
      }
    }
  }

  /**
   * 分类测试
   */
  private categorizeTest(testName: string): string {
    if (testName.includes('api') || testName.includes('API')) return 'API'
    if (testName.includes('ui') || testName.includes('UI')) return 'UI'
    if (testName.includes('integration')) return 'Integration'
    if (testName.includes('performance')) return 'Performance'
    return 'General'
  }

  /**
   * 生成趋势报告
   */
  private generateTrendReport(): TrendReport {
    try {
      const historyPath = path.join(this.reportDir, 'test-history.json')
      const previousRuns = fs.existsSync(historyPath)
        ? JSON.parse(fs.readFileSync(historyPath, 'utf-8'))
        : []

      // 计算趋势
      const recentRuns = previousRuns.slice(-5) // 最近5次运行
      if (recentRuns.length < 2) {
        return {
          previousRuns: recentRuns,
          trend: 'stable',
          changes: {
            successRate: 0,
            duration: 0,
            coverage: 0
          }
        }
      }

      const current = recentRuns[recentRuns.length - 1]
      const previous = recentRuns[recentRuns.length - 2]

      const successRateChange = current.successRate - previous.successRate
      const durationChange = current.duration - previous.duration
      const coverageChange = (current.coverage || 0) - (previous.coverage || 0)

      let trend: 'improving' | 'stable' | 'declining' = 'stable'
      if (successRateChange > 1 && coverageChange > 1) {
        trend = 'improving'
      } else if (successRateChange < -1 || coverageChange < -1) {
        trend = 'declining'
      }

      return {
        previousRuns: recentRuns,
        trend,
        changes: {
          successRate: successRateChange,
          duration: durationChange,
          coverage: coverageChange
        }
      }
    } catch (error) {
      console.warn('Failed to generate trend report:', error)
      return {
        previousRuns: [],
        trend: 'stable',
        changes: {
          successRate: 0,
          duration: 0,
          coverage: 0
        }
      }
    }
  }

  /**
   * 生成建议
   */
  private generateRecommendations(
    summary: TestSummary,
    coverage: CoverageReport,
    performance: PerformanceReport
  ): string[] {
    const recommendations: string[] = []

    // 基于测试结果的建议
    if (summary.failureRate > 10) {
      recommendations.push('❌ 测试失败率较高，建议优先修复失败的测试用例')
    }

    if (summary.successRate < 90) {
      recommendations.push('⚠️ 测试通过率低于90%，需要提高测试稳定性')
    }

    // 基于覆盖率的建议
    if (coverage.status === 'failed') {
      recommendations.push('❌ 代码覆盖率未达到最低阈值要求')
    } else if (coverage.status === 'warning') {
      recommendations.push('⚠️ 部分覆盖率指标接近阈值，建议增加测试覆盖')
    }

    if (coverage.overall.statements < 80) {
      recommendations.push('📊 语句覆盖率偏低，建议增加单元测试')
    }

    if (coverage.overall.branches < 75) {
      recommendations.push('🌿 分支覆盖率偏低，建议增加条件分支测试')
    }

    // 基于性能的建议
    if (performance.averageTestDuration > 10000) {
      recommendations.push('⏱️ 平均测试执行时间较长，建议优化测试性能')
    }

    if (performance.slowTests.length > 5) {
      recommendations.push('🐌 存在较多慢速测试，建议分离或优化慢速测试')
    }

    if (performance.performanceBudget.status === 'failed') {
      recommendations.push('⏰ 测试执行时间超出预算，建议优化CI/CD流程')
    }

    // 通用建议
    if (recommendations.length === 0) {
      recommendations.push('✅ 测试质量良好，继续保持当前标准')
    }

    return recommendations
  }

  /**
   * 生成元数据
   */
  private generateMetadata(): ReportMetadata {
    const gitCommit = this.getGitCommit()
    const branch = this.getGitBranch()

    return {
      generatedAt: new Date().toISOString(),
      testEnvironment: process.env.NODE_ENV || 'test',
      playwrightVersion: this.getPackageVersion('@playwright/test'),
      nodeVersion: process.version,
      gitCommit,
      branch
    }
  }

  /**
   * 获取Git提交信息
   */
  private getGitCommit(): string | undefined {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim()
    } catch {
      return undefined
    }
  }

  /**
   * 获取Git分支信息
   */
  private getGitBranch(): string | undefined {
    try {
      return execSync('git branch --show-current', { encoding: 'utf-8' }).trim()
    } catch {
      return undefined
    }
  }

  /**
   * 获取包版本
   */
  private getPackageVersion(packageName: string): string {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      return packageJson.dependencies?.[packageName] ||
             packageJson.devDependencies?.[packageName] || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  /**
   * 保存报告
   */
  private saveReport(report: TestReport): void {
    const reportPath = path.join(this.reportDir, 'comprehensive-report.json')
    const htmlReportPath = path.join(this.reportDir, 'comprehensive-report.html')

    // 保存JSON报告
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    // 生成HTML报告
    const htmlContent = this.generateHtmlReport(report)
    fs.writeFileSync(htmlReportPath, htmlContent)

    console.log(`✅ Test report saved to: ${reportPath}`)
    console.log(`✅ HTML report saved to: ${htmlReportPath}`)
  }

  /**
   * 生成HTML报告
   */
  private generateHtmlReport(report: TestReport): string {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>前端E2E测试报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .metric-card { background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; border-left: 4px solid #007bff; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #6c757d; margin-top: 5px; }
        .status-passed { border-left-color: #28a745; }
        .status-failed { border-left-color: #dc3545; }
        .status-warning { border-left-color: #ffc107; }
        .section { margin: 30px; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
        .section h2 { margin-top: 0; color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 10px 0; }
        .recommendations ul { margin: 0; padding-left: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background: #f8f9fa; font-weight: 600; }
        .trend-improving { color: #28a745; }
        .trend-stable { color: #6c757d; }
        .trend-declining { color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>前端E2E测试报告</h1>
            <p>生成时间: ${new Date(report.metadata.generatedAt).toLocaleString('zh-CN')}</p>
            <p>环境: ${report.metadata.testEnvironment} | 分支: ${report.metadata.branch || 'unknown'}</p>
        </div>

        <div class="summary-grid">
            <div class="metric-card ${report.summary.successRate >= 90 ? 'status-passed' : 'status-failed'}">
                <div class="metric-value">${report.summary.successRate.toFixed(1)}%</div>
                <div class="metric-label">通过率</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.total}</div>
                <div class="metric-label">总测试数</div>
            </div>
            <div class="metric-card ${report.coverage.status === 'passed' ? 'status-passed' : report.coverage.status === 'warning' ? 'status-warning' : 'status-failed'}">
                <div class="metric-value">${report.coverage.overall.statements.toFixed(1)}%</div>
                <div class="metric-label">代码覆盖率</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${(report.summary.duration / 1000).toFixed(1)}s</div>
                <div class="metric-label">总耗时</div>
            </div>
        </div>

        <div class="section">
            <h2>测试摘要</h2>
            <table>
                <tr><th>指标</th><th>数值</th><th>状态</th></tr>
                <tr><td>通过测试</td><td>${report.summary.passed}</td><td class="status-passed">✓</td></tr>
                <tr><td>失败测试</td><td>${report.summary.failed}</td><td class="${report.summary.failed > 0 ? 'status-failed' : 'status-passed'}">${report.summary.failed > 0 ? '✗' : '✓'}</td></tr>
                <tr><td>跳过测试</td><td>${report.summary.skipped}</td><td>-</td></tr>
                <tr><td>平均耗时</td><td>${report.summary.averageDuration.toFixed(0)}ms</td><td>-</td></tr>
                <tr><td>最慢测试</td><td>${report.summary.slowestTest.name} (${report.summary.slowestTest.duration}ms)</td><td>-</td></tr>
            </table>
        </div>

        <div class="section">
            <h2>覆盖率报告</h2>
            <table>
                <tr><th>类型</th><th>覆盖率</th><th>阈值</th><th>状态</th></tr>
                <tr>
                    <td>语句覆盖</td>
                    <td>${report.coverage.overall.statements.toFixed(1)}%</td>
                    <td>${report.coverage.thresholds.statements}%</td>
                    <td class="${report.coverage.overall.statements >= report.coverage.thresholds.statements ? 'status-passed' : 'status-failed'}">
                        ${report.coverage.overall.statements >= report.coverage.thresholds.statements ? '✓' : '✗'}
                    </td>
                </tr>
                <tr>
                    <td>分支覆盖</td>
                    <td>${report.coverage.overall.branches.toFixed(1)}%</td>
                    <td>${report.coverage.thresholds.branches}%</td>
                    <td class="${report.coverage.overall.branches >= report.coverage.thresholds.branches ? 'status-passed' : 'status-failed'}">
                        ${report.coverage.overall.branches >= report.coverage.thresholds.branches ? '✓' : '✗'}
                    </td>
                </tr>
                <tr>
                    <td>函数覆盖</td>
                    <td>${report.coverage.overall.functions.toFixed(1)}%</td>
                    <td>${report.coverage.thresholds.functions}%</td>
                    <td class="${report.coverage.overall.functions >= report.coverage.thresholds.functions ? 'status-passed' : 'status-failed'}">
                        ${report.coverage.overall.functions >= report.coverage.thresholds.functions ? '✓' : '✗'}
                    </td>
                </tr>
            </table>
        </div>

        <div class="section">
            <h2>性能分析</h2>
            <table>
                <tr><th>指标</th><th>数值</th></tr>
                <tr><td>总执行时间</td><td>${(report.performance.totalDuration / 1000).toFixed(2)}s</td></tr>
                <tr><td>平均测试时间</td><td>${report.performance.averageTestDuration.toFixed(0)}ms</td></tr>
                <tr><td>95th百分位</td><td>${report.performance.percentile95}ms</td></tr>
                <tr><td>99th百分位</td><td>${report.performance.percentile99}ms</td></tr>
                <tr><td>慢速测试数量</td><td>${report.performance.slowTests.length}</td></tr>
            </table>
        </div>

        <div class="section">
            <h2>趋势分析</h2>
            <p>当前趋势: <span class="trend-${report.trends.trend}">${report.trends.trend === 'improving' ? '上升' : report.trends.trend === 'declining' ? '下降' : '稳定'}</span></p>
            <table>
                <tr><th>指标</th><th>变化</th></tr>
                <tr><td>通过率</td><td class="${report.trends.changes.successRate > 0 ? 'trend-improving' : report.trends.changes.successRate < 0 ? 'trend-declining' : 'trend-stable'}">${report.trends.changes.successRate > 0 ? '+' : ''}${report.trends.changes.successRate.toFixed(2)}%</td></tr>
                <tr><td>执行时间</td><td class="${report.trends.changes.duration < 0 ? 'trend-improving' : report.trends.changes.duration > 0 ? 'trend-declining' : 'trend-stable'}">${report.trends.changes.duration > 0 ? '+' : ''}${(report.trends.changes.duration / 1000).toFixed(2)}s</td></tr>
                <tr><td>覆盖率</td><td class="${report.trends.changes.coverage > 0 ? 'trend-improving' : report.trends.changes.coverage < 0 ? 'trend-declining' : 'trend-stable'}">${report.trends.changes.coverage > 0 ? '+' : ''}${report.trends.changes.coverage.toFixed(2)}%</td></tr>
            </table>
        </div>

        <div class="section">
            <h2>优化建议</h2>
            <div class="recommendations">
                <ul>
                    ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="section">
            <h2>环境信息</h2>
            <table>
                <tr><th>项目</th><th>版本</th></tr>
                <tr><td>Playwright</td><td>${report.metadata.playwrightVersion}</td></tr>
                <tr><td>Node.js</td><td>${report.metadata.nodeVersion}</td></tr>
                <tr><td>Git提交</td><td>${report.metadata.gitCommit || 'unknown'}</td></tr>
                <tr><td>分支</td><td>${report.metadata.branch || 'unknown'}</td></tr>
            </table>
        </div>
    </div>
</body>
</html>`
  }

  /**
   * 确保目录存在
   */
  private ensureDirectories(): void {
    const dirs = [this.reportDir, this.coverageDir]

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }
}

/**
 * 便捷函数
 */
export function createTestReporter(reportDir?: string): TestReporter {
  return new TestReporter(reportDir)
}

export async function generateTestReport(testResults: any[], reportDir?: string): Promise<TestReport> {
  const reporter = createTestReporter(reportDir)
  return await reporter.generateComprehensiveReport(testResults)
}
