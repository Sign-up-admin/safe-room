#!/usr/bin/env node

/**
 * 测试结果聚合工具
 *
 * 功能：
 * - 聚合front和admin项目的测试结果
 * - 生成统一的测试报告
 * - 计算总体通过率
 * - 生成HTML和JSON格式的报告
 *
 * 使用方法：
 * node scripts/aggregate-test-results.js
 */

const fs = require('fs')
const path = require('path')

class TestResultsAggregator {
  constructor() {
    this.results = {
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        passRate: 0,
        executionTime: 0,
        timestamp: new Date().toISOString()
      },
      projects: {
        front: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          passRate: 0,
          executionTime: 0,
          suites: []
        },
        admin: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          passRate: 0,
          executionTime: 0,
          suites: []
        }
      },
      details: []
    }
  }

  /**
   * 扫描测试结果文件
   */
  scanTestResults() {
    const projects = ['front', 'admin']
    const resultFiles = []

    projects.forEach(project => {
      const projectPath = `springboot1ngh61a2/src/main/resources/${project}/${project}`

      // 查找playwright报告
      const playwrightReport = path.join(projectPath, 'playwright-report')
      if (fs.existsSync(playwrightReport)) {
        const files = fs.readdirSync(playwrightReport)
        files.forEach(file => {
          if (file.endsWith('.json')) {
            resultFiles.push({
              project,
              type: 'playwright',
              path: path.join(playwrightReport, file)
            })
          }
        })
      }

      // 查找vitest结果
      const vitestResults = path.join(projectPath, 'test-results.json')
      if (fs.existsSync(vitestResults)) {
        resultFiles.push({
          project,
          type: 'vitest',
          path: vitestResults
        })
      }

      // 查找coverage结果
      const coverageResults = path.join(projectPath, 'coverage', 'coverage-summary.json')
      if (fs.existsSync(coverageResults)) {
        resultFiles.push({
          project,
          type: 'coverage',
          path: coverageResults
        })
      }
    })

    return resultFiles
  }

  /**
   * 解析Playwright测试结果
   */
  parsePlaywrightResults(filePath, project) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const data = JSON.parse(content)

      const suite = {
        name: path.basename(filePath, '.json'),
        specs: [],
        stats: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0
        }
      }

      if (data.suites && data.suites.length > 0) {
        data.suites.forEach(testSuite => {
          if (testSuite.specs) {
            testSuite.specs.forEach(spec => {
              const specResult = {
                title: spec.title,
                file: spec.file,
                tests: spec.tests?.length || 0,
                duration: spec.tests?.reduce((sum, test) => sum + (test.results?.[0]?.duration || 0), 0) || 0,
                status: this.getSpecStatus(spec)
              }

              suite.specs.push(specResult)
              suite.stats.total += spec.tests?.length || 0
              suite.stats.duration += specResult.duration

              // 统计通过/失败/跳过
              spec.tests?.forEach(test => {
                const result = test.results?.[0]
                if (result) {
                  if (result.status === 'passed') {
                    suite.stats.passed++
                  } else if (result.status === 'failed') {
                    suite.stats.failed++
                  } else if (result.status === 'skipped') {
                    suite.stats.skipped++
                  }
                }
              })
            })
          }
        })
      }

      return suite
    } catch (error) {
      console.warn(`Failed to parse Playwright results: ${filePath}`, error.message)
      return null
    }
  }

  /**
   * 获取规范状态
   */
  getSpecStatus(spec) {
    if (!spec.tests || spec.tests.length === 0) return 'unknown'

    const hasFailed = spec.tests.some(test =>
      test.results?.some(result => result.status === 'failed')
    )
    const hasSkipped = spec.tests.some(test =>
      test.results?.some(result => result.status === 'skipped')
    )

    if (hasFailed) return 'failed'
    if (hasSkipped) return 'skipped'
    return 'passed'
  }

  /**
   * 解析Vitest测试结果
   */
  parseVitestResults(filePath, project) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const data = JSON.parse(content)

      return {
        name: 'Unit Tests',
        stats: {
          total: data.numTotalTests || 0,
          passed: data.numPassedTests || 0,
          failed: data.numFailedTests || 0,
          skipped: 0,
          duration: data.testResults?.reduce((sum, result) => sum + (result.perfStats?.runtime || 0), 0) || 0
        }
      }
    } catch (error) {
      console.warn(`Failed to parse Vitest results: ${filePath}`, error.message)
      return null
    }
  }

  /**
   * 解析覆盖率结果
   */
  parseCoverageResults(filePath, project) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const data = JSON.parse(content)

      return {
        name: 'Coverage',
        coverage: data.total || {},
        stats: {
          lines: data.total?.lines?.pct || 0,
          functions: data.total?.functions?.pct || 0,
          branches: data.total?.branches?.pct || 0,
          statements: data.total?.statements?.pct || 0
        }
      }
    } catch (error) {
      console.warn(`Failed to parse coverage results: ${filePath}`, error.message)
      return null
    }
  }

  /**
   * 聚合所有结果
   */
  async aggregate() {
    console.log('🔍 Scanning test results...')

    const resultFiles = this.scanTestResults()
    console.log(`📁 Found ${resultFiles.length} result files`)

    for (const file of resultFiles) {
      console.log(`📄 Processing: ${file.path}`)

      let parsedResult = null

      switch (file.type) {
        case 'playwright':
          parsedResult = this.parsePlaywrightResults(file.path, file.project)
          if (parsedResult) {
            this.results.projects[file.project].suites.push(parsedResult)
            this.results.projects[file.project].total += parsedResult.stats.total
            this.results.projects[file.project].passed += parsedResult.stats.passed
            this.results.projects[file.project].failed += parsedResult.stats.failed
            this.results.projects[file.project].skipped += parsedResult.stats.skipped
            this.results.projects[file.project].executionTime += parsedResult.stats.duration
          }
          break

        case 'vitest':
          parsedResult = this.parseVitestResults(file.path, file.project)
          if (parsedResult) {
            this.results.projects[file.project].suites.push(parsedResult)
            this.results.projects[file.project].total += parsedResult.stats.total
            this.results.projects[file.project].passed += parsedResult.stats.passed
            this.results.projects[file.project].failed += parsedResult.stats.failed
            this.results.projects[file.project].executionTime += parsedResult.stats.duration
          }
          break

        case 'coverage':
          parsedResult = this.parseCoverageResults(file.path, file.project)
          if (parsedResult) {
            this.results.projects[file.project].coverage = parsedResult
          }
          break
      }

      if (parsedResult) {
        this.results.details.push({
          project: file.project,
          type: file.type,
          file: file.path,
          result: parsedResult
        })
      }
    }

    // 计算总体统计
    this.calculateSummary()
  }

  /**
   * 计算汇总统计
   */
  calculateSummary() {
    const { projects, summary } = this.results

    summary.totalTests = projects.front.total + projects.admin.total
    summary.passedTests = projects.front.passed + projects.admin.passed
    summary.failedTests = projects.front.failed + projects.admin.failed
    summary.skippedTests = projects.front.skipped + projects.admin.skipped
    summary.executionTime = projects.front.executionTime + projects.admin.executionTime

    summary.passRate = summary.totalTests > 0
      ? Math.round((summary.passedTests / summary.totalTests) * 100)
      : 0

    // 计算各项目通过率
    Object.keys(projects).forEach(project => {
      const proj = projects[project]
      proj.passRate = proj.total > 0 ? Math.round((proj.passed / proj.total) * 100) : 0
    })
  }

  /**
   * 生成JSON报告
   */
  generateJsonReport() {
    const outputDir = 'test-reports'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const fileName = `test-report-${Date.now()}.json`
    const filePath = path.join(outputDir, fileName)

    fs.writeFileSync(filePath, JSON.stringify(this.results, null, 2))
    console.log(`📄 JSON report saved: ${filePath}`)

    return filePath
  }

  /**
   * 生成HTML报告
   */
  generateHtmlReport() {
    const html = this.generateHtmlContent()

    const outputDir = 'test-reports'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const fileName = `test-report-${Date.now()}.html`
    const filePath = path.join(outputDir, fileName)

    fs.writeFileSync(filePath, html)
    console.log(`🌐 HTML report saved: ${filePath}`)

    return filePath
  }

  /**
   * 生成HTML内容
   */
  generateHtmlContent() {
    const { summary, projects } = this.results

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>前端测试报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .metric { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 2em; font-weight: bold; color: #007bff; }
        .projects { padding: 0 30px 30px; }
        .project { margin-bottom: 30px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
        .project-header { background: #f8f9fa; padding: 15px 20px; border-bottom: 1px solid #e9ecef; }
        .project-content { padding: 20px; }
        .status-passed { color: #28a745; }
        .status-failed { color: #dc3545; }
        .status-skipped { color: #ffc107; }
        .coverage { background: #e7f3ff; padding: 10px; border-radius: 4px; margin-top: 10px; }
        .suite { margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
        .spec { margin: 5px 0; padding: 5px; border-left: 3px solid #007bff; }
        .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #e9ecef; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 前端测试报告</h1>
            <p>生成时间: ${new Date(summary.timestamp).toLocaleString('zh-CN')}</p>
        </div>

        <div class="summary">
            <div class="metric">
                <h3>总测试数</h3>
                <div class="value">${summary.totalTests}</div>
            </div>
            <div class="metric">
                <h3>通过率</h3>
                <div class="value">${summary.passRate}%</div>
            </div>
            <div class="metric">
                <h3>通过测试</h3>
                <div class="value status-passed">${summary.passedTests}</div>
            </div>
            <div class="metric">
                <h3>失败测试</h3>
                <div class="value status-failed">${summary.failedTests}</div>
            </div>
            <div class="metric">
                <h3>跳过测试</h3>
                <div class="value status-skipped">${summary.skippedTests}</div>
            </div>
            <div class="metric">
                <h3>执行时间</h3>
                <div class="value">${Math.round(summary.executionTime / 1000)}s</div>
            </div>
        </div>

        <div class="projects">
            ${Object.entries(projects).map(([projectName, projectData]) => `
                <div class="project">
                    <div class="project-header">
                        <h2>${projectName.toUpperCase()} 项目</h2>
                        <div>通过率: ${projectData.passRate}% | 总计: ${projectData.total} | 通过: ${projectData.passed} | 失败: ${projectData.failed}</div>
                    </div>
                    <div class="project-content">
                        ${projectData.coverage ? `
                            <div class="coverage">
                                <h4>📊 覆盖率</h4>
                                <div>行覆盖率: ${projectData.coverage.stats.lines}%</div>
                                <div>函数覆盖率: ${projectData.coverage.stats.functions}%</div>
                                <div>分支覆盖率: ${projectData.coverage.stats.branches}%</div>
                                <div>语句覆盖率: ${projectData.coverage.stats.statements}%</div>
                            </div>
                        ` : ''}

                        ${projectData.suites.map(suite => `
                            <div class="suite">
                                <h4>${suite.name}</h4>
                                <div>总计: ${suite.stats.total} | 通过: ${suite.stats.passed} | 失败: ${suite.stats.failed} | 跳过: ${suite.stats.skipped}</div>
                                <div>执行时间: ${Math.round(suite.stats.duration / 1000)}s</div>
                                ${suite.specs ? suite.specs.map(spec => `
                                    <div class="spec status-${spec.status}">
                                        <strong>${spec.title}</strong>
                                        <span>(${spec.tests} tests, ${Math.round(spec.duration / 1000)}s)</span>
                                    </div>
                                `).join('') : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="footer">
            <p>报告由测试结果聚合工具生成 | ${new Date().toLocaleString('zh-CN')}</p>
        </div>
    </div>
</body>
</html>`
  }

  /**
   * 打印控制台摘要
   */
  printSummary() {
    console.log('\n🎯 测试结果摘要')
    console.log('='.repeat(50))
    console.log(`总测试数: ${this.results.summary.totalTests}`)
    console.log(`通过测试: ${this.results.summary.passedTests}`)
    console.log(`失败测试: ${this.results.summary.failedTests}`)
    console.log(`跳过测试: ${this.results.summary.skippedTests}`)
    console.log(`通过率: ${this.results.summary.passRate}%`)
    console.log(`执行时间: ${Math.round(this.results.summary.executionTime / 1000)}s`)
    console.log('='.repeat(50))

    console.log('\n📊 项目详情')
    Object.entries(this.results.projects).forEach(([project, data]) => {
      console.log(`${project}: ${data.passRate}% 通过率 (${data.passed}/${data.total})`)
    })
  }

  /**
   * 主执行方法
   */
  async run() {
    console.log('🚀 开始聚合测试结果...')

    await this.aggregate()
    this.printSummary()

    const jsonReport = this.generateJsonReport()
    const htmlReport = this.generateHtmlReport()

    console.log('\n✅ 测试结果聚合完成!')
    console.log(`📄 JSON报告: ${jsonReport}`)
    console.log(`🌐 HTML报告: ${htmlReport}`)

    return {
      json: jsonReport,
      html: htmlReport,
      summary: this.results.summary
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const aggregator = new TestResultsAggregator()
  aggregator.run().catch(error => {
    console.error('❌ 测试结果聚合失败:', error)
    process.exit(1)
  })
}

module.exports = TestResultsAggregator
