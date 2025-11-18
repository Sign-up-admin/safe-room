#!/usr/bin/env node

/**
 * 质量门禁检查脚本
 * 用于CI/CD流程的质量控制
 */

const fs = require('fs')
const path = require('path')

class QualityGateChecker {
  constructor() {
    this.summaryPath = 'test-summary-report/summary.json'
    this.qualityThresholds = {
      overallSuccessRate: 90,      // 总体通过率 >= 90%
      frontendSuccessRate: 85,     // 前端通过率 >= 85%
      adminSuccessRate: 85,        // 管理后台通过率 >= 85%
      coverage: {
        overall: 75,               // 总覆盖率 >= 75%
        statements: 75,            // 语句覆盖率 >= 75%
        branches: 70,              // 分支覆盖率 >= 70%
        functions: 80              // 函数覆盖率 >= 80%
      },
      performance: {
        maxTotalDuration: 600000,  // 总执行时间 <= 10分钟
        maxAverageDuration: 15000, // 平均测试时间 <= 15秒
        maxSlowTests: 10           // 慢速测试数量 <= 10个
      }
    }
  }

  /**
   * 执行质量门禁检查
   */
  async checkQualityGate() {
    console.log('🔍 正在执行质量门禁检查...')

    try {
      // 读取测试摘要
      const summary = JSON.parse(fs.readFileSync(this.summaryPath, 'utf8'))

      // 执行各项检查
      const checks = {
        overallSuccessRate: this.checkOverallSuccessRate(summary),
        frontendSuccessRate: this.checkFrontendSuccessRate(summary),
        adminSuccessRate: this.checkAdminSuccessRate(summary),
        coverage: this.checkCoverage(summary),
        performance: this.checkPerformance(summary),
        criticalFailures: this.checkCriticalFailures(summary)
      }

      // 计算总体结果
      const passed = Object.values(checks).every(check => check.passed)
      const failedChecks = Object.entries(checks)
        .filter(([_, check]) => !check.passed)
        .map(([name, check]) => ({ name, ...check }))

      const result = {
        passed,
        checks,
        failedChecks,
        summary: {
          totalChecks: Object.keys(checks).length,
          passedChecks: Object.values(checks).filter(c => c.passed).length,
          failedChecks: failedChecks.length
        },
        timestamp: new Date().toISOString(),
        environment: summary.environment
      }

      // 输出结果
      this.outputResults(result)

      // 保存结果
      this.saveResults(result)

      // 根据结果决定退出码
      if (!passed) {
        console.error('❌ 质量门禁检查失败')
        process.exit(1)
      } else {
        console.log('✅ 质量门禁检查通过')
        process.exit(0)
      }

    } catch (error) {
      console.error('❌ 质量门禁检查执行失败:', error.message)
      process.exit(1)
    }
  }

  /**
   * 检查总体成功率
   */
  checkOverallSuccessRate(summary) {
    const successRate = parseFloat(summary.overall.overallSuccessRate)
    const threshold = this.qualityThresholds.overallSuccessRate
    const passed = successRate >= threshold

    return {
      passed,
      actual: successRate,
      threshold,
      message: passed
        ? `总体成功率 ${successRate}% 达到阈值 ${threshold}%`
        : `总体成功率 ${successRate}% 低于阈值 ${threshold}%`
    }
  }

  /**
   * 检查前端成功率
   */
  checkFrontendSuccessRate(summary) {
    const successRate = parseFloat(summary.frontend.successRate)
    const threshold = this.qualityThresholds.frontendSuccessRate
    const passed = successRate >= threshold

    return {
      passed,
      actual: successRate,
      threshold,
      message: passed
        ? `前端成功率 ${successRate}% 达到阈值 ${threshold}%`
        : `前端成功率 ${successRate}% 低于阈值 ${threshold}%`
    }
  }

  /**
   * 检查管理后台成功率
   */
  checkAdminSuccessRate(summary) {
    const successRate = parseFloat(summary.admin.successRate)
    const threshold = this.qualityThresholds.adminSuccessRate
    const passed = successRate >= threshold

    return {
      passed,
      actual: successRate,
      threshold,
      message: passed
        ? `管理后台成功率 ${successRate}% 达到阈值 ${threshold}%`
        : `管理后台成功率 ${successRate}% 低于阈值 ${threshold}%`
    }
  }

  /**
   * 检查覆盖率
   */
  checkCoverage(summary) {
    const coverage = summary.coverage
    const thresholds = this.qualityThresholds.coverage

    const checks = {
      overall: parseFloat(coverage.overall) >= thresholds.overall,
      statements: parseFloat(coverage.statements) >= thresholds.statements,
      branches: parseFloat(coverage.branches) >= thresholds.branches,
      functions: parseFloat(coverage.functions) >= thresholds.functions
    }

    const passed = Object.values(checks).every(Boolean)

    return {
      passed,
      actual: {
        overall: coverage.overall,
        statements: coverage.statements,
        branches: coverage.branches,
        functions: coverage.functions
      },
      threshold: thresholds,
      message: passed
        ? '所有覆盖率指标均达到阈值要求'
        : `覆盖率未达到要求: ${Object.entries(checks).filter(([_, passed]) => !passed).map(([key, _]) => key).join(', ')}`
    }
  }

  /**
   * 检查性能指标
   */
  checkPerformance(summary) {
    const performance = summary.performance
    const thresholds = this.qualityThresholds.performance

    const checks = {
      totalDuration: performance.totalDuration <= thresholds.maxTotalDuration,
      averageDuration: performance.averageDuration <= thresholds.maxAverageDuration,
      slowTests: (performance.slowTests?.length || 0) <= thresholds.maxSlowTests
    }

    const passed = Object.values(checks).every(Boolean)

    return {
      passed,
      actual: {
        totalDuration: performance.totalDuration,
        averageDuration: performance.averageDuration,
        slowTestsCount: performance.slowTests?.length || 0
      },
      threshold: thresholds,
      message: passed
        ? '所有性能指标均在可接受范围内'
        : `性能指标超出阈值: ${Object.entries(checks).filter(([_, passed]) => !passed).map(([key, _]) => key).join(', ')}`
    }
  }

  /**
   * 检查严重失败
   */
  checkCriticalFailures(summary) {
    const criticalFailures = []

    // 检查是否有完全失败的测试套件
    if (summary.frontend.total > 0 && summary.frontend.failed === summary.frontend.total) {
      criticalFailures.push('前端E2E测试完全失败')
    }

    if (summary.admin.total > 0 && summary.admin.failed === summary.admin.total) {
      criticalFailures.push('管理后台E2E测试完全失败')
    }

    // 检查覆盖率是否为0
    if (parseFloat(summary.coverage.overall) === 0) {
      criticalFailures.push('代码覆盖率数据缺失')
    }

    const passed = criticalFailures.length === 0

    return {
      passed,
      criticalFailures,
      message: passed
        ? '未发现严重失败情况'
        : `发现严重问题: ${criticalFailures.join(', ')}`
    }
  }

  /**
   * 输出检查结果
   */
  outputResults(result) {
    console.log('\n📊 质量门禁检查结果')
    console.log('='.repeat(50))

    Object.entries(result.checks).forEach(([name, check]) => {
      const status = check.passed ? '✅' : '❌'
      console.log(`${status} ${name}: ${check.message}`)
    })

    console.log('\n📈 汇总信息')
    console.log(`总检查项: ${result.summary.totalChecks}`)
    console.log(`通过: ${result.summary.passedChecks}`)
    console.log(`失败: ${result.summary.failedChecks}`)

    if (result.failedChecks.length > 0) {
      console.log('\n❌ 失败检查详情:')
      result.failedChecks.forEach(failure => {
        console.log(`  - ${failure.name}: ${failure.message}`)
      })
    }

    console.log('='.repeat(50))
  }

  /**
   * 保存检查结果
   */
  saveResults(result) {
    const outputDir = 'quality-gate-results'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const resultPath = path.join(outputDir, 'quality-gate-result.json')
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2))

    console.log(`💾 质量门禁结果已保存到: ${resultPath}`)
  }
}

// 执行质量门禁检查
if (require.main === module) {
  const checker = new QualityGateChecker()
  checker.checkQualityGate()
}

module.exports = QualityGateChecker
