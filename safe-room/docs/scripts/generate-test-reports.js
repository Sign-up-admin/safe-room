#!/usr/bin/env node

/**
 * 测试报告自动生成工具
 *
 * 功能：
 * - 从测试结果文件生成测试报告
 * - 分析覆盖率报告生成覆盖率文档
 * - 生成测试趋势分析
 * - 支持多种测试框架的结果解析
 *
 * 使用方法：
 * node docs/scripts/generate-test-reports.js [options]
 *
 * 选项：
 * --output <file>    输出文件路径 (默认: docs/reports/test-reports/GENERATED_TEST_REPORT.md)
 * --coverage        生成覆盖率报告
 * --trend           生成趋势分析
 * --verbose         详细输出
 * --help            显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// 配置
const CONFIG = {
  // 测试结果文件模式
  testResultPatterns: [
    '**/target/surefire-reports/*.xml',
    '**/target/failsafe-reports/*.xml',
    '**/test-results/**/*.json',
    '**/coverage/**/*.json',
    '**/lcov-report/**/*.html',
    '**/coverage/lcov.info'
  ],

  // 覆盖率阈值
  coverageThresholds: {
    excellent: 90,
    good: 80,
    fair: 70,
    poor: 50
  }
};

// 解析结果
let testReports = {
  unitTests: [],
  integrationTests: [],
  coverage: null,
  trends: [],
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    coveragePercentage: 0,
    executionTime: 0
  }
};

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    return;
  }

  console.log('🧪 开始分析测试结果生成报告...\n');

  // 分析测试结果
  await analyzeTestResults(options);

  // 分析覆盖率（如果启用）
  if (options.coverage) {
    await analyzeCoverage(options);
  }

  // 分析趋势（如果启用）
  if (options.trend) {
    await analyzeTrends(options);
  }

  // 生成报告
  const content = generateTestReport(options);

  // 写入文件
  const outputPath = options.output || 'docs/reports/test-reports/GENERATED_TEST_REPORT.md';
  ensureDirectoryExists(path.dirname(outputPath));
  fs.writeFileSync(outputPath, content, 'utf-8');

  console.log(`✅ 测试报告已生成: ${outputPath}`);
}

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const options = {
    output: null,
    coverage: false,
    trend: false,
    verbose: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--output':
        options.output = args[++i];
        break;
      case '--coverage':
        options.coverage = true;
        break;
      case '--trend':
        options.trend = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * 分析测试结果
 */
async function analyzeTestResults(options) {
  for (const pattern of CONFIG.testResultPatterns) {
    const files = await glob(pattern);

    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');

        if (file.endsWith('.xml')) {
          parseJUnitXml(file, content, options);
        } else if (file.endsWith('.json')) {
          parseJsonResult(file, content, options);
        } else if (file.includes('lcov')) {
          // 覆盖率文件在单独处理
        }

        if (options.verbose) {
          console.log(`📊 分析测试结果: ${file}`);
        }
      }
    }
  }
}

/**
 * 分析覆盖率
 */
async function analyzeCoverage(options) {
  // 查找覆盖率文件
  const coverageFiles = await glob('**/lcov.info');

  if (coverageFiles.length > 0) {
    const coverageFile = coverageFiles[0];
    const content = fs.readFileSync(coverageFile, 'utf-8');
    testReports.coverage = parseLcovInfo(content);

    if (options.verbose) {
      console.log(`📈 分析覆盖率: ${coverageFile}`);
    }
  }
}

/**
 * 分析趋势
 */
async function analyzeTrends(options) {
  // 查找历史测试结果
  const historyFiles = await glob('**/test-results/**/*.json').sort();

  const trends = [];
  for (const file of historyFiles.slice(-10)) { // 最近10次
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const result = JSON.parse(content);
      trends.push({
        date: extractDateFromFile(file),
        tests: result.numTotalTests || 0,
        passed: result.numPassedTests || 0,
        failed: result.numFailedTests || 0,
        coverage: result.coverage || 0
      });
    } catch (error) {
      // 忽略解析错误
    }
  }

  testReports.trends = trends;

  if (options.verbose) {
    console.log(`📉 分析趋势: ${trends.length} 个数据点`);
  }
}

/**
 * 解析JUnit XML
 */
function parseJUnitXml(filePath, content, options) {
  // 简化XML解析（实际项目中可能需要更完善的XML解析器）
  const testSuiteMatch = content.match(/<testsuite[^>]*>/g);

  if (testSuiteMatch) {
    const suiteMatch = testSuiteMatch[0].match(/tests="(\d+)"\s+failures="(\d+)"\s+errors="(\d+)"\s+skipped="(\d+)"/);

    if (suiteMatch) {
      const tests = parseInt(suiteMatch[1]);
      const failures = parseInt(suiteMatch[2]);
      const errors = parseInt(suiteMatch[3]);
      const skipped = parseInt(suiteMatch[4]);

      const testResult = {
        file: filePath,
        type: filePath.includes('surefire') ? 'unit' : 'integration',
        tests,
        failures,
        errors,
        skipped,
        passed: tests - failures - errors - skipped,
        time: extractTimeFromXml(content)
      };

      // 更新汇总
      testReports.summary.totalTests += tests;
      testReports.summary.passedTests += testResult.passed;
      testReports.summary.failedTests += failures + errors;
      testReports.summary.skippedTests += skipped;
      testReports.summary.executionTime += testResult.time;

      // 分类存储
      if (testResult.type === 'unit') {
        testReports.unitTests.push(testResult);
      } else {
        testReports.integrationTests.push(testResult);
      }
    }
  }
}

/**
 * 解析JSON结果
 */
function parseJsonResult(filePath, content, options) {
  try {
    const result = JSON.parse(content);

    const testResult = {
      file: filePath,
      type: filePath.includes('unit') ? 'unit' : 'integration',
      tests: result.numTotalTests || 0,
      passed: result.numPassedTests || 0,
      failed: result.numFailedTests || 0,
      skipped: result.numSkippedTests || 0,
      time: result.testResults ? result.testResults.reduce((sum, r) => sum + (r.perfStats?.runtime || 0), 0) : 0
    };

    // 更新汇总
    testReports.summary.totalTests += testResult.tests;
    testReports.summary.passedTests += testResult.passed;
    testReports.summary.failedTests += testResult.failed;
    testReports.summary.skippedTests += testResult.skipped;
    testReports.summary.executionTime += testResult.time;

    // 分类存储
    if (testResult.type === 'unit') {
      testReports.unitTests.push(testResult);
    } else {
      testReports.integrationTests.push(testResult);
    }
  } catch (error) {
    console.warn(`解析JSON测试结果失败 ${filePath}:`, error.message);
  }
}

/**
 * 解析LCOV覆盖率信息
 */
function parseLcovInfo(content) {
  const lines = content.split('\n');
  let coverage = {
    lines: { found: 0, hit: 0 },
    functions: { found: 0, hit: 0 },
    branches: { found: 0, hit: 0 }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('LF:')) {
      coverage.lines.found += parseInt(trimmed.substring(3));
    } else if (trimmed.startsWith('LH:')) {
      coverage.lines.hit += parseInt(trimmed.substring(3));
    } else if (trimmed.startsWith('FNF:')) {
      coverage.functions.found += parseInt(trimmed.substring(4));
    } else if (trimmed.startsWith('FNH:')) {
      coverage.functions.hit += parseInt(trimmed.substring(4));
    } else if (trimmed.startsWith('BRF:')) {
      coverage.branches.found += parseInt(trimmed.substring(4));
    } else if (trimmed.startsWith('BRH:')) {
      coverage.branches.hit += parseInt(trimmed.substring(4));
    }
  }

  // 计算百分比
  coverage.lines.percentage = coverage.lines.found > 0 ?
    Math.round((coverage.lines.hit / coverage.lines.found) * 100) : 0;
  coverage.functions.percentage = coverage.functions.found > 0 ?
    Math.round((coverage.functions.hit / coverage.functions.found) * 100) : 0;
  coverage.branches.percentage = coverage.branches.found > 0 ?
    Math.round((coverage.branches.hit / coverage.branches.found) * 100) : 0;

  return coverage;
}

/**
 * 提取XML中的时间
 */
function extractTimeFromXml(content) {
  const timeMatch = content.match(/time="([^"]*)"/);
  return timeMatch ? parseFloat(timeMatch[1]) : 0;
}

/**
 * 从文件名提取日期
 */
function extractDateFromFile(filePath) {
  const fileName = path.basename(filePath);
  const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
}

/**
 * 获取覆盖率等级
 */
function getCoverageLevel(percentage) {
  if (percentage >= CONFIG.coverageThresholds.excellent) return { level: '优秀', color: '🟢' };
  if (percentage >= CONFIG.coverageThresholds.good) return { level: '良好', color: '🟡' };
  if (percentage >= CONFIG.coverageThresholds.fair) return { level: '一般', color: '🟠' };
  return { level: '需改进', color: '🔴' };
}

/**
 * 生成测试报告
 */
function generateTestReport(options) {
  let content = `# 🧪 自动生成的测试报告

> 从测试结果自动生成的测试报告
>
> **生成时间**: ${new Date().toISOString()}
> **测试总数**: ${testReports.summary.totalTests}
> **通过测试**: ${testReports.summary.passedTests}
> **失败测试**: ${testReports.summary.failedTests}
> **跳过测试**: ${testReports.summary.skippedTests}

## 📊 测试概览

`;

  // 测试汇总
  const passRate = testReports.summary.totalTests > 0 ?
    Math.round((testReports.summary.passedTests / testReports.summary.totalTests) * 100) : 0;

  content += '| 指标 | 数值 | 状态 |\n';
  content += '|------|------|------|\n';
  content += `| 总测试数 | ${testReports.summary.totalTests} | - |\n`;
  content += `| 通过测试 | ${testReports.summary.passedTests} | ✅ |\n`;
  content += `| 失败测试 | ${testReports.summary.failedTests} | ${testReports.summary.failedTests > 0 ? '❌' : '✅'} |\n`;
  content += `| 跳过测试 | ${testReports.summary.skippedTests} | ⚠️ |\n`;
  content += `| 通过率 | ${passRate}% | ${passRate >= 80 ? '✅' : '⚠️'} |\n`;
  content += `| 执行时间 | ${testReports.summary.executionTime.toFixed(2)}s | - |\n`;

  // 覆盖率信息
  if (options.coverage && testReports.coverage) {
    const coverage = testReports.coverage;
    const linesLevel = getCoverageLevel(coverage.lines.percentage);
    const functionsLevel = getCoverageLevel(coverage.functions.percentage);
    const branchesLevel = getCoverageLevel(coverage.branches.percentage);

    content += '\n### 📈 代码覆盖率\n\n';
    content += '| 类型 | 覆盖率 | 等级 |\n';
    content += '|------|--------|------|\n';
    content += `| 行覆盖率 | ${coverage.lines.percentage}% | ${linesLevel.color} ${linesLevel.level} |\n`;
    content += `| 函数覆盖率 | ${coverage.functions.percentage}% | ${functionsLevel.color} ${functionsLevel.level} |\n`;
    content += `| 分支覆盖率 | ${coverage.branches.percentage}% | ${branchesLevel.color} ${branchesLevel.level} |\n`;
  }

  // 详细测试结果
  if (testReports.unitTests.length > 0) {
    content += '\n### 🧪 单元测试详情\n\n';
    content += '| 文件 | 总测试 | 通过 | 失败 | 跳过 | 通过率 |\n';
    content += '|------|--------|------|------|------|--------|\n';

    testReports.unitTests.forEach(test => {
      const passRate = test.tests > 0 ? Math.round((test.passed / test.tests) * 100) : 0;
      content += `| ${path.basename(test.file)} | ${test.tests} | ${test.passed} | ${test.failures} | ${test.skipped} | ${passRate}% |\n`;
    });
  }

  if (testReports.integrationTests.length > 0) {
    content += '\n### 🔗 集成测试详情\n\n';
    content += '| 文件 | 总测试 | 通过 | 失败 | 跳过 | 通过率 |\n';
    content += '|------|--------|------|------|------|--------|\n';

    testReports.integrationTests.forEach(test => {
      const passRate = test.tests > 0 ? Math.round((test.passed / test.tests) * 100) : 0;
      content += `| ${path.basename(test.file)} | ${test.tests} | ${test.passed} | ${test.failures} | ${test.skipped} | ${passRate}% |\n`;
    });
  }

  // 趋势分析
  if (options.trend && testReports.trends.length > 0) {
    content += '\n### 📉 测试趋势\n\n';
    content += '| 日期 | 总测试 | 通过 | 失败 | 通过率 | 覆盖率 |\n';
    content += '|------|--------|------|------|--------|--------|\n';

    testReports.trends.forEach(trend => {
      const passRate = trend.tests > 0 ? Math.round((trend.passed / trend.tests) * 100) : 0;
      content += `| ${trend.date} | ${trend.tests} | ${trend.passed} | ${trend.failed} | ${passRate}% | ${trend.coverage}% |\n`;
    });

    // 生成趋势图表
    content += '\n#### 通过率趋势图\n\n';
    content += '```mermaid\ngraph LR\n';

    testReports.trends.forEach((trend, index) => {
      const passRate = trend.tests > 0 ? Math.round((trend.passed / trend.tests) * 100) : 0;
      content += `    ${index + 1}["${trend.date}\\n${passRate}%"]\n`;
      if (index > 0) {
        content += `    ${index} --> ${index + 1}\n`;
      }
    });

    content += '```\n';
  }

  // 失败测试详情
  const failedTests = [...testReports.unitTests, ...testReports.integrationTests]
    .filter(test => test.failures > 0);

  if (failedTests.length > 0) {
    content += '\n### ❌ 失败测试详情\n\n';
    failedTests.forEach(test => {
      content += `#### ${path.basename(test.file)}\n\n`;
      content += `- **失败数量**: ${test.failures}\n`;
      content += `- **错误数量**: ${test.errors || 0}\n\n`;
    });
  }

  // 改进建议
  content += '\n### 💡 改进建议\n\n';

  if (passRate < 80) {
    content += '- ⚠️ 测试通过率偏低，建议增加测试用例覆盖\n';
  }

  if (options.coverage && testReports.coverage) {
    const coverage = testReports.coverage;
    if (coverage.lines.percentage < CONFIG.coverageThresholds.good) {
      content += '- 📈 代码覆盖率有待提高，建议添加更多测试\n';
    }
  }

  if (testReports.summary.failedTests > 0) {
    content += '- 🔧 存在失败的测试，建议及时修复\n';
  }

  if (testReports.trends.length > 1) {
    const recent = testReports.trends.slice(-2);
    const improvement = recent[1] && recent[0] ?
      (recent[1].passed / recent[1].tests * 100) - (recent[0].passed / recent[0].tests * 100) : 0;

    if (improvement > 5) {
      content += '- 📈 测试质量正在改善，继续保持\n';
    } else if (improvement < -5) {
      content += '- 📉 测试质量有所下降，需要关注\n';
    }
  }

  content += '\n## 📋 测试环境信息\n\n';
  content += `- **测试框架**: JUnit/Vitest/Playwright\n`;
  content += `- **覆盖率工具**: JaCoCo/Istanbul\n`;
  content += `- **CI/CD**: GitHub Actions\n`;
  content += `- **报告生成时间**: ${new Date().toISOString()}\n\n`;

  content += '---\n\n';
  content += '*此报告由工具自动生成，基于最新的测试结果*';

  return content;
}

/**
 * 确保目录存在
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
测试报告生成工具

使用方法:
  node docs/scripts/generate-test-reports.js [options]

选项:
  --output <file>    输出文件路径 (默认: docs/reports/test-reports/GENERATED_TEST_REPORT.md)
  --coverage        生成覆盖率报告
  --trend           生成趋势分析
  --verbose         详细输出
  --help            显示帮助信息

示例:
  # 生成基础测试报告
  node docs/scripts/generate-test-reports.js

  # 生成包含覆盖率的完整报告
  node docs/scripts/generate-test-reports.js --coverage --trend

  # 指定输出文件
  node docs/scripts/generate-test-reports.js --output test-report.md

  # 详细输出
  node docs/scripts/generate-test-reports.js --verbose
`);
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('生成测试报告时发生错误:', error);
    process.exit(1);
  });
}

module.exports = {
  analyzeTestResults,
  analyzeCoverage,
  analyzeTrends,
  generateTestReport,
  getCoverageLevel
};
