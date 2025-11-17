#!/usr/bin/env node

/**
 * Test Health Metrics Collector
 *
 * Collects comprehensive test health metrics from various sources
 * Aggregates data for dashboard generation and monitoring
 *
 * Usage:
 * node scripts/collect-test-health-metrics.js [options]
 *
 * Options:
 * --test-reports <dir>    Test reports directory
 * --coverage-reports <dir> Coverage reports directory
 * --output <file>         Output metrics file (default: test-health-metrics.json)
 * --history <dir>         History directory for trend analysis
 * --include-trends        Include trend analysis
 * --verbose              Verbose output
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  testReportsDir: process.env.TEST_REPORTS_DIR || path.join(__dirname, '..', 'springboot1ngh61a2', 'target', 'surefire-reports'),
  coverageReportsDir: process.env.COVERAGE_REPORTS_DIR || path.join(__dirname, '..', 'springboot1ngh61a2', 'target', 'site', 'jacoco'),
  outputFile: process.env.METRICS_OUTPUT || path.join(__dirname, '..', 'test-health-metrics.json'),
  historyDir: process.env.HISTORY_DIR || path.join(__dirname, '..', 'springboot1ngh61a2', 'coverage-history'),
  includeTrends: process.argv.includes('--include-trends'),
  verbose: process.argv.includes('--verbose')
};

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  const nextArg = process.argv[i + 1];

  switch (arg) {
    case '--test-reports':
      CONFIG.testReportsDir = nextArg;
      i++;
      break;
    case '--coverage-reports':
      CONFIG.coverageReportsDir = nextArg;
      i++;
      break;
    case '--output':
      CONFIG.outputFile = nextArg;
      i++;
      break;
    case '--history':
      CONFIG.historyDir = nextArg;
      i++;
      break;
  }
}

// Health metrics data structure
let healthMetrics = {
  timestamp: new Date().toISOString(),
  collection: {
    testReports: { found: false, count: 0 },
    coverageReports: { found: false, count: 0 },
    historyData: { found: false, count: 0 }
  },
  testExecution: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    errorTests: 0,
    skippedTests: 0,
    executionTime: 0,
    successRate: 0,
    averageTestTime: 0,
    flakyTests: 0
  },
  coverage: {
    lineCoverage: 0,
    branchCoverage: 0,
    instructionCoverage: 0,
    methodCoverage: 0,
    classCoverage: 0,
    controllerCoverage: 0,
    serviceCoverage: 0,
    newCoverage: 0,
    coverageGaps: []
  },
  quality: {
    buildErrors: 0,
    buildWarnings: 0,
    testReliability: 100,
    codeQualityScore: 0,
    securityIssues: 0
  },
  performance: {
    testExecutionTime: 0,
    memoryUsage: 0,
    parallelExecution: false,
    performanceRegressions: 0
  },
  trends: {
    coverageTrend: 'stable',
    testTimeTrend: 'stable',
    failureRateTrend: 'stable',
    qualityTrend: 'stable'
  },
  alerts: [],
  recommendations: []
};

/**
 * Collect test execution metrics from Surefire XML reports
 */
function collectTestExecutionMetrics() {
  if (!fs.existsSync(CONFIG.testReportsDir)) {
    if (CONFIG.verbose) console.log(`Test reports directory not found: ${CONFIG.testReportsDir}`);
    return;
  }

  const xmlFiles = fs.readdirSync(CONFIG.testReportsDir)
    .filter(file => file.endsWith('.xml'));

  if (xmlFiles.length === 0) {
    if (CONFIG.verbose) console.log('No test report XML files found');
    return;
  }

  healthMetrics.collection.testReports.found = true;
  healthMetrics.collection.testReports.count = xmlFiles.length;

  let totalTests = 0, passedTests = 0, failedTests = 0, errorTests = 0, skippedTests = 0, totalTime = 0;

  xmlFiles.forEach(file => {
    try {
      const filePath = path.join(CONFIG.testReportsDir, file);
      const xmlContent = fs.readFileSync(filePath, 'utf8');

      // Parse XML using regex (simple approach)
      const testsMatch = xmlContent.match(/tests="(\d+)"/);
      const failuresMatch = xmlContent.match(/failures="(\d+)"/);
      const errorsMatch = xmlContent.match(/errors="(\d+)"/);
      const skippedMatch = xmlContent.match(/skipped="(\d+)"/);
      const timeMatch = xmlContent.match(/time="([\d.]+)"/);

      if (testsMatch) totalTests += parseInt(testsMatch[1]);
      if (failuresMatch) failedTests += parseInt(failuresMatch[1]);
      if (errorsMatch) errorTests += parseInt(errorsMatch[1]);
      if (skippedMatch) skippedTests += parseInt(skippedMatch[1]);
      if (timeMatch) totalTime += parseFloat(timeMatch[1]);

    } catch (error) {
      if (CONFIG.verbose) console.warn(`Failed to parse test report ${file}: ${error.message}`);
    }
  });

  passedTests = totalTests - failedTests - errorTests - skippedTests;

  healthMetrics.testExecution.totalTests = totalTests;
  healthMetrics.testExecution.passedTests = passedTests;
  healthMetrics.testExecution.failedTests = failedTests;
  healthMetrics.testExecution.errorTests = errorTests;
  healthMetrics.testExecution.skippedTests = skippedTests;
  healthMetrics.testExecution.executionTime = Math.round(totalTime * 100) / 100;
  healthMetrics.testExecution.successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 10000) / 100 : 0;
  healthMetrics.testExecution.averageTestTime = totalTests > 0 ? Math.round((totalTime / totalTests) * 1000) / 1000 : 0;

  if (CONFIG.verbose) {
    console.log(`Test Execution Metrics:`);
    console.log(`  Total: ${totalTests}, Passed: ${passedTests}, Failed: ${failedTests}, Errors: ${errorTests}, Skipped: ${skippedTests}`);
    console.log(`  Success Rate: ${healthMetrics.testExecution.successRate}%, Average Time: ${healthMetrics.testExecution.averageTestTime}s`);
  }
}

/**
 * Collect coverage metrics from JaCoCo XML report
 */
function collectCoverageMetrics() {
  const jacocoXmlPath = path.join(CONFIG.coverageReportsDir, 'jacoco.xml');

  if (!fs.existsSync(jacocoXmlPath)) {
    if (CONFIG.verbose) console.log(`JaCoCo XML report not found: ${jacocoXmlPath}`);
    return;
  }

  healthMetrics.collection.coverageReports.found = true;
  healthMetrics.collection.coverageReports.count = 1;

  try {
    const xmlContent = fs.readFileSync(jacocoXmlPath, 'utf8');

    // Use xml2js if available, otherwise fallback to regex
    let xml2js;
    try {
      xml2js = require('xml2js');
    } catch {
      xml2js = null;
    }

    if (xml2js) {
      // Use xml2js for proper parsing
      const parser = new xml2js.Parser();
      parser.parseString(xmlContent, (err, result) => {
        if (err) throw err;

        const report = result.report;
        healthMetrics.coverage.lineCoverage = calculateCoverage(report.counter, 'LINE');
        healthMetrics.coverage.branchCoverage = calculateCoverage(report.counter, 'BRANCH');
        healthMetrics.coverage.instructionCoverage = calculateCoverage(report.counter, 'INSTRUCTION');
        healthMetrics.coverage.methodCoverage = calculateCoverage(report.counter, 'METHOD');
        healthMetrics.coverage.classCoverage = calculateCoverage(report.counter, 'CLASS');

        // Calculate package-level coverage
        if (report.package) {
          const controllerPackages = report.package.filter(pkg => pkg.$.name.includes('controller'));
          const servicePackages = report.package.filter(pkg => pkg.$.name.includes('service'));

          if (controllerPackages.length > 0) {
            const controllerTotal = controllerPackages.reduce((sum, pkg) => sum + parseInt(pkg.counter.find(c => c.$.type === 'LINE').$.total), 0);
            const controllerCovered = controllerPackages.reduce((sum, pkg) => sum + parseInt(pkg.counter.find(c => c.$.type === 'LINE').$.covered), 0);
            healthMetrics.coverage.controllerCoverage = controllerTotal > 0 ? Math.round((controllerCovered / controllerTotal) * 10000) / 100 : 0;
          }

          if (servicePackages.length > 0) {
            const serviceTotal = servicePackages.reduce((sum, pkg) => sum + parseInt(pkg.counter.find(c => c.$.type === 'LINE').$.total), 0);
            const serviceCovered = servicePackages.reduce((sum, pkg) => sum + parseInt(pkg.counter.find(c => c.$.type === 'LINE').$.covered), 0);
            healthMetrics.coverage.serviceCoverage = serviceTotal > 0 ? Math.round((serviceCovered / serviceTotal) * 10000) / 100 : 0;
          }
        }
      });
    } else {
      // Fallback regex parsing
      healthMetrics.coverage.lineCoverage = extractCoverage(xmlContent, 'LINE');
      healthMetrics.coverage.branchCoverage = extractCoverage(xmlContent, 'BRANCH');
      healthMetrics.coverage.instructionCoverage = extractCoverage(xmlContent, 'INSTRUCTION');
      healthMetrics.coverage.methodCoverage = extractCoverage(xmlContent, 'METHOD');
      healthMetrics.coverage.classCoverage = extractCoverage(xmlContent, 'CLASS');
    }

    if (CONFIG.verbose) {
      console.log(`Coverage Metrics:`);
      console.log(`  Line: ${healthMetrics.coverage.lineCoverage}%, Branch: ${healthMetrics.coverage.branchCoverage}%`);
      console.log(`  Controller: ${healthMetrics.coverage.controllerCoverage}%, Service: ${healthMetrics.coverage.serviceCoverage}%`);
    }

  } catch (error) {
    console.error(`Failed to parse coverage report: ${error.message}`);
  }
}

/**
 * Calculate coverage percentage from JaCoCo counters
 */
function calculateCoverage(counters, type) {
  if (!counters) return 0;

  const counter = Array.isArray(counters)
    ? counters.find(c => c.$.type === type)
    : counters;

  if (!counter || counter.$.type !== type) return 0;

  const covered = parseInt(counter.$.covered);
  const total = parseInt(counter.$.missed) + covered;

  return total > 0 ? Math.round((covered / total) * 10000) / 100 : 0;
}

/**
 * Extract coverage using regex (fallback method)
 */
function extractCoverage(xmlContent, type) {
  const regex = new RegExp(`<counter type="${type}" covered="([^"]*)" missed="([^"]*)"`);
  const match = xmlContent.match(regex);

  if (match) {
    const covered = parseInt(match[1]);
    const missed = parseInt(match[2]);
    const total = covered + missed;
    return total > 0 ? Math.round((covered / total) * 10000) / 100 : 0;
  }

  return 0;
}

/**
 * Collect quality metrics
 */
function collectQualityMetrics() {
  // Check for build logs
  const buildLogPath = path.join(CONFIG.testReportsDir, '..', 'build.log');
  if (fs.existsSync(buildLogPath)) {
    try {
      const buildLog = fs.readFileSync(buildLogPath, 'utf8');
      healthMetrics.quality.buildErrors = (buildLog.match(/ERROR|error/g) || []).length;
      healthMetrics.quality.buildWarnings = (buildLog.match(/WARNING|warning/g) || []).length;

      if (CONFIG.verbose) {
        console.log(`Quality Metrics:`);
        console.log(`  Build Errors: ${healthMetrics.quality.buildErrors}, Warnings: ${healthMetrics.quality.buildWarnings}`);
      }
    } catch (error) {
      if (CONFIG.verbose) console.warn(`Failed to read build log: ${error.message}`);
    }
  }

  // Calculate test reliability score
  const totalTests = healthMetrics.testExecution.totalTests;
  const failedTests = healthMetrics.testExecution.failedTests + healthMetrics.testExecution.errorTests;

  if (totalTests > 0) {
    healthMetrics.quality.testReliability = Math.round(((totalTests - failedTests) / totalTests) * 10000) / 100;
  }

  // Calculate overall code quality score (simplified)
  const coverageScore = (
    healthMetrics.coverage.lineCoverage * 0.3 +
    healthMetrics.coverage.branchCoverage * 0.2 +
    healthMetrics.coverage.methodCoverage * 0.2 +
    healthMetrics.coverage.classCoverage * 0.1 +
    healthMetrics.quality.testReliability * 0.2
  );

  healthMetrics.quality.codeQualityScore = Math.round(Math.min(100, coverageScore));
}

/**
 * Collect historical trend data
 */
function collectTrendData() {
  if (!CONFIG.includeTrends || !fs.existsSync(CONFIG.historyDir)) {
    return;
  }

  const historyFiles = fs.readdirSync(CONFIG.historyDir)
    .filter(file => file.endsWith('.json'))
    .sort()
    .slice(-10); // Last 10 data points

  if (historyFiles.length === 0) return;

  healthMetrics.collection.historyData.found = true;
  healthMetrics.collection.historyData.count = historyFiles.length;

  const historyData = [];
  historyFiles.forEach(file => {
    try {
      const filePath = path.join(CONFIG.historyDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      historyData.push(data);
    } catch (error) {
      if (CONFIG.verbose) console.warn(`Failed to parse history file ${file}: ${error.message}`);
    }
  });

  // Analyze trends
  if (historyData.length >= 3) {
    analyzeTrends(historyData);
  }
}

/**
 * Analyze trends from historical data
 */
function analyzeTrends(historyData) {
  // Coverage trend
  const coverageValues = historyData.map(d => d.coverage?.line_percentage || d.line_coverage || 0).filter(v => v > 0);
  if (coverageValues.length >= 2) {
    const recent = coverageValues.slice(-3);
    const trend = recent[recent.length - 1] - recent[0];
    healthMetrics.trends.coverageTrend = trend > 1 ? 'improving' : trend < -1 ? 'declining' : 'stable';
  }

  // Test execution time trend
  const timeValues = historyData.map(d => d.test_duration_seconds || 0).filter(v => v > 0);
  if (timeValues.length >= 2) {
    const recent = timeValues.slice(-3);
    const trend = recent[recent.length - 1] - recent[0];
    healthMetrics.trends.testTimeTrend = trend > 10 ? 'increasing' : trend < -10 ? 'decreasing' : 'stable';
  }

  // Failure rate trend
  const failureValues = historyData.map(d => d.test_failures || 0);
  if (failureValues.length >= 2) {
    const recent = failureValues.slice(-3);
    const trend = recent[recent.length - 1] - recent[0];
    healthMetrics.trends.failureRateTrend = trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable';
  }
}

/**
 * Generate alerts and recommendations based on metrics
 */
function generateAlertsAndRecommendations() {
  const alerts = [];
  const recommendations = [];

  // Coverage alerts
  if (healthMetrics.coverage.lineCoverage < 65) {
    alerts.push({
      level: 'critical',
      message: `Line coverage (${healthMetrics.coverage.lineCoverage}%) is below 65% threshold`,
      metric: 'lineCoverage'
    });
    recommendations.push('Add more unit tests to achieve minimum line coverage of 65%');
  }

  if (healthMetrics.coverage.controllerCoverage < 30) {
    alerts.push({
      level: 'high',
      message: `Controller coverage (${healthMetrics.coverage.controllerCoverage}%) is below 30% threshold`,
      metric: 'controllerCoverage'
    });
    recommendations.push('Add integration tests for controller endpoints');
  }

  if (healthMetrics.coverage.serviceCoverage < 60) {
    alerts.push({
      level: 'high',
      message: `Service coverage (${healthMetrics.coverage.serviceCoverage}%) is below 60% threshold`,
      metric: 'serviceCoverage'
    });
    recommendations.push('Improve service layer testing with better mocking and edge case coverage');
  }

  // Test execution alerts
  if (healthMetrics.testExecution.successRate < 95) {
    alerts.push({
      level: 'high',
      message: `Test success rate (${healthMetrics.testExecution.successRate}%) is below 95%`,
      metric: 'testSuccessRate'
    });
    recommendations.push('Fix failing tests and address test flakiness');
  }

  if (healthMetrics.testExecution.failedTests > 0) {
    alerts.push({
      level: 'critical',
      message: `${healthMetrics.testExecution.failedTests} tests are currently failing`,
      metric: 'testFailures'
    });
    recommendations.push('Immediately fix failing tests before merging');
  }

  // Quality alerts
  if (healthMetrics.quality.buildErrors > 0) {
    alerts.push({
      level: 'critical',
      message: `${healthMetrics.quality.buildErrors} build errors detected`,
      metric: 'buildErrors'
    });
    recommendations.push('Fix compilation errors in the codebase');
  }

  if (healthMetrics.quality.buildWarnings > 20) {
    alerts.push({
      level: 'medium',
      message: `${healthMetrics.quality.buildWarnings} build warnings detected`,
      metric: 'buildWarnings'
    });
    recommendations.push('Address build warnings to improve code quality');
  }

  // Trend alerts
  if (healthMetrics.trends.coverageTrend === 'declining') {
    alerts.push({
      level: 'medium',
      message: 'Coverage is trending downward over recent builds',
      metric: 'coverageTrend'
    });
    recommendations.push('Review recent changes that may have reduced test coverage');
  }

  if (healthMetrics.trends.testTimeTrend === 'increasing') {
    alerts.push({
      level: 'low',
      message: 'Test execution time is increasing',
      metric: 'testTimeTrend'
    });
    recommendations.push('Optimize test execution time and consider parallel execution');
  }

  healthMetrics.alerts = alerts;
  healthMetrics.recommendations = recommendations;
}

/**
 * Calculate health score
 */
function calculateHealthScore() {
  let score = 100;

  // Deduct points for coverage below thresholds
  if (healthMetrics.coverage.lineCoverage < 65) score -= (65 - healthMetrics.coverage.lineCoverage) * 0.5;
  if (healthMetrics.coverage.branchCoverage < 45) score -= (45 - healthMetrics.coverage.branchCoverage) * 0.3;
  if (healthMetrics.coverage.controllerCoverage < 30) score -= (30 - healthMetrics.coverage.controllerCoverage) * 0.4;
  if (healthMetrics.coverage.serviceCoverage < 60) score -= (60 - healthMetrics.coverage.serviceCoverage) * 0.3;

  // Deduct points for test failures
  score -= healthMetrics.testExecution.failedTests * 5;
  score -= healthMetrics.testExecution.errorTests * 5;

  // Deduct points for build issues
  score -= healthMetrics.quality.buildErrors * 10;
  score -= Math.min(healthMetrics.quality.buildWarnings, 10); // Cap at 10 points

  // Deduct points for low success rate
  if (healthMetrics.testExecution.successRate < 100) {
    score -= (100 - healthMetrics.testExecution.successRate) * 0.5;
  }

  healthMetrics.overallHealthScore = Math.max(0, Math.round(score));
}

/**
 * Save metrics to file
 */
function saveMetrics() {
  const outputDir = path.dirname(CONFIG.outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(healthMetrics, null, 2), 'utf8');

  if (CONFIG.verbose) {
    console.log(`Health metrics saved to: ${CONFIG.outputFile}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting Test Health Metrics Collection...');

    // Collect all metrics
    collectTestExecutionMetrics();
    collectCoverageMetrics();
    collectQualityMetrics();
    collectTrendData();

    // Generate insights
    generateAlertsAndRecommendations();
    calculateHealthScore();

    // Save results
    saveMetrics();

    console.log(`✅ Test health metrics collected successfully`);
    console.log(`📊 Overall Health Score: ${healthMetrics.overallHealthScore}/100`);
    console.log(`🎯 Tests: ${healthMetrics.testExecution.successRate}% success rate`);
    console.log(`📈 Coverage: ${healthMetrics.coverage.lineCoverage}% line, ${healthMetrics.coverage.branchCoverage}% branch`);
    console.log(`⚠️  Alerts: ${healthMetrics.alerts.length}`);

    if (CONFIG.verbose) {
      console.log(`📋 Collection Summary:`);
      console.log(`   - Test Reports: ${healthMetrics.collection.testReports.found ? 'Found' : 'Not Found'} (${healthMetrics.collection.testReports.count})`);
      console.log(`   - Coverage Reports: ${healthMetrics.collection.coverageReports.found ? 'Found' : 'Not Found'} (${healthMetrics.collection.coverageReports.count})`);
      console.log(`   - History Data: ${healthMetrics.collection.historyData.found ? 'Found' : 'Not Found'} (${healthMetrics.collection.historyData.count})`);
    }

  } catch (error) {
    console.error('❌ Error collecting test health metrics:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
