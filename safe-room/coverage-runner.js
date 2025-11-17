#!/usr/bin/env node

/**
 * 前端测试覆盖率运行器
 * 运行前端项目的测试并生成覆盖率报告
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

class CoverageRunner {
  constructor() {
    this.projects = {
      front: 'springboot1ngh61a2/src/main/resources/front/front',
      admin: 'springboot1ngh61a2/src/main/resources/admin/admin'
    }
    this.results = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    }
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`)
  }

  async runCommand(command, cwd, description) {
    return new Promise((resolve, reject) => {
      this.log(`Running: ${description}`, 'info')

      const child = spawn(command, {
        cwd,
        shell: true,
        stdio: 'inherit'
      })

      child.on('close', (code) => {
        if (code === 0) {
          this.log(`${description} completed successfully`, 'success')
          resolve()
        } else {
          this.log(`${description} failed with code ${code}`, 'error')
          reject(new Error(`Command failed: ${command}`))
        }
      })

      child.on('error', (error) => {
        this.log(`Error running ${description}: ${error.message}`, 'error')
        reject(error)
      })
    })
  }

  async runTests(projectName, testType = 'coverage') {
    const projectPath = this.projects[projectName]
    const startTime = Date.now()

    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project path not found: ${projectPath}`)
    }

    this.log(`Starting ${testType} tests for ${projectName}`, 'info')

    try {
      // Ensure dependencies are installed
      if (!fs.existsSync(path.join(projectPath, 'node_modules'))) {
        this.log(`Installing dependencies for ${projectName}...`, 'warning')
        await this.runCommand('npm install', projectPath, `Install dependencies for ${projectName}`)
      }

      // Run tests with coverage
      const command = testType === 'coverage'
        ? 'npx vitest run --coverage --run'
        : 'npx vitest run --run'

      await this.runCommand(command, projectPath, `Run ${testType} tests for ${projectName}`)

      const duration = (Date.now() - startTime) / 1000
      const coveragePath = path.join(projectPath, 'coverage')

      // Check if coverage was generated
      const hasCoverage = fs.existsSync(coveragePath)

      this.results.push({
        project: projectName,
        type: testType,
        success: true,
        duration: duration.toFixed(2),
        coverageGenerated: hasCoverage,
        coveragePath: hasCoverage ? coveragePath : null
      })

      this.log(`${projectName} ${testType} tests completed in ${duration.toFixed(2)}s`, 'success')

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000
      this.results.push({
        project: projectName,
        type: testType,
        success: false,
        duration: duration.toFixed(2),
        error: error.message
      })

      this.log(`${projectName} ${testType} tests failed: ${error.message}`, 'error')
      throw error
    }
  }

  generateReport() {
    const reportPath = 'FRONTEND_COVERAGE_REPORT.md'
    const timestamp = new Date().toISOString()

    let report = `# 前端测试覆盖率报告\n\n`
    report += `**生成时间**: ${timestamp}\n\n`
    report += `## 测试结果汇总\n\n`

    let totalTests = 0
    let passedTests = 0
    let totalDuration = 0

    this.results.forEach(result => {
      totalTests++
      totalDuration += parseFloat(result.duration)

      if (result.success) {
        passedTests++
        report += `### ✅ ${result.project} - ${result.type}\n`
        report += `- 状态: 通过\n`
        report += `- 耗时: ${result.duration}s\n`
        if (result.coverageGenerated) {
          report += `- 覆盖率报告: ${result.coveragePath}\n`
        }
        report += `\n`
      } else {
        report += `### ❌ ${result.project} - ${result.type}\n`
        report += `- 状态: 失败\n`
        report += `- 耗时: ${result.duration}s\n`
        report += `- 错误: ${result.error}\n`
        report += `\n`
      }
    })

    report += `## 统计信息\n\n`
    report += `- 总测试数: ${totalTests}\n`
    report += `- 通过测试: ${passedTests}\n`
    report += `- 失败测试: ${totalTests - passedTests}\n`
    report += `- 总耗时: ${totalDuration.toFixed(2)}s\n`
    report += `- 通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`

    fs.writeFileSync(reportPath, report, 'utf8')
    this.log(`Report generated: ${reportPath}`, 'success')

    return reportPath
  }

  async run(project = 'both', testType = 'coverage') {
    try {
      this.log('Starting frontend coverage testing...', 'info')

      const projects = project === 'both' ? ['front', 'admin'] : [project]

      for (const projectName of projects) {
        await this.runTests(projectName, testType)
      }

      const reportPath = this.generateReport()

      const allPassed = this.results.every(r => r.success)
      if (allPassed) {
        this.log('All tests passed!', 'success')
        process.exit(0)
      } else {
        this.log('Some tests failed. Check the report for details.', 'error')
        process.exit(1)
      }

    } catch (error) {
      this.log(`Coverage testing failed: ${error.message}`, 'error')
      process.exit(1)
    }
  }
}

// CLI interface
const args = process.argv.slice(2)
const project = args.find(arg => arg.startsWith('--project='))?.split('=')[1] || 'both'
const testType = args.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'coverage'

const runner = new CoverageRunner()
runner.run(project, testType)
