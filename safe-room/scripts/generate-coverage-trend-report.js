#!/usr/bin/env node

/**
 * Coverage Trend Report Generator
 *
 * Generates detailed trend analysis reports from coverage history data
 * Includes statistical analysis, forecasting, and actionable insights
 *
 * Usage:
 * node scripts/generate-coverage-trend-report.js [options]
 *
 * Options:
 * --input <dir>     Input coverage history directory (default: springboot1ngh61a2/coverage-history)
 * --output <file>   Output analysis report file (default: coverage-trend-analysis.md)
 * --forecast        Include trend forecasting
 * --recommendations Include specific recommendations
 * --verbose         Verbose output
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  inputDir: process.env.COVERAGE_HISTORY_DIR || path.join(__dirname, '..', 'springboot1ngh61a2', 'coverage-history'),
  outputFile: process.env.REPORT_OUTPUT || path.join(__dirname, '..', 'coverage-trend-analysis.md'),
  includeForecast: process.argv.includes('--forecast'),
  includeRecommendations: process.argv.includes('--recommendations') || !process.argv.includes('--no-recommendations'),
  verbose: process.argv.includes('--verbose')
};

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  const nextArg = process.argv[i + 1];

  switch (arg) {
    case '--input':
      CONFIG.inputDir = nextArg;
      i++;
      break;
    case '--output':
      CONFIG.outputFile = nextArg;
      i++;
      break;
  }
}

// Analysis data structure
let analysisData = {
  summary: {
    totalBuilds: 0,
    dateRange: { start: null, end: null },
    averageCoverage: {},
    trendDirection: {},
    volatility: {},
    qualityGatePassRate: 0
  },
  trends: {},
  forecasts: {},
  recommendations: [],
  insights: []
};

/**
 * Load and parse coverage history data
 */
function loadCoverageHistory() {
  if (!fs.existsSync(CONFIG.inputDir)) {
    console.warn(`Coverage history directory not found: ${CONFIG.inputDir}`);
    return [];
  }

  const files = fs.readdirSync(CONFIG.inputDir)
    .filter(file => file.startsWith('coverage_') && file.endsWith('.json'))
    .sort();

  const history = [];
  for (const file of files) {
    try {
      const filePath = path.join(CONFIG.inputDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      history.push(data);
    } catch (error) {
      console.warn(`Failed to parse ${file}: ${error.message}`);
    }
  }

  // Sort by timestamp
  return history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/**
 * Calculate basic statistical measures
 */
function calculateStatistics(values) {
  if (values.length === 0) return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    min: Math.round(Math.min(...values) * 100) / 100,
    max: Math.round(Math.max(...values) * 100) / 100
  };
}

/**
 * Perform linear regression analysis
 */
function linearRegression(dataPoints) {
  const n = dataPoints.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0, direction: 'insufficient-data' };

  const sumX = (n * (n - 1)) / 2;
  const sumY = dataPoints.reduce((sum, val, idx) => sum + val, 0);
  const sumXY = dataPoints.reduce((sum, val, idx) => sum + (val * idx), 0);
  const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  const totalSumSquares = dataPoints.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  const residualSumSquares = dataPoints.reduce((sum, val, idx) => {
    const predicted = slope * idx + intercept;
    return sum + Math.pow(val - predicted, 2);
  }, 0);

  const r2 = totalSumSquares > 0 ? 1 - (residualSumSquares / totalSumSquares) : 0;

  // Determine trend direction
  let direction = 'stable';
  if (slope > 0.01) direction = 'improving';
  else if (slope < -0.01) direction = 'declining';

  return {
    slope: Math.round(slope * 10000) / 10000,
    intercept: Math.round(intercept * 100) / 100,
    r2: Math.round(r2 * 100) / 100,
    direction,
    confidence: Math.abs(slope) * 100 // Rough confidence indicator
  };
}

/**
 * Generate trend forecasts
 */
function generateForecasts(trend, currentValue, periods = 10) {
  if (trend.direction === 'insufficient-data') {
    return { predictions: [], targetDate: null, confidence: 0 };
  }

  const predictions = [];
  const currentIndex = 0;

  for (let i = 1; i <= periods; i++) {
    const predictedValue = trend.slope * (currentIndex + i) + trend.intercept;
    const confidence = Math.max(0, Math.min(100, trend.r2 * 100 - (i * 2))); // Confidence decreases over time

    predictions.push({
      period: i,
      value: Math.max(0, Math.round(predictedValue * 100) / 100),
      confidence: Math.round(confidence)
    });
  }

  // Calculate when target might be reached (e.g., 70% coverage)
  const targetValue = 70;
  let periodsToTarget = null;

  if (trend.slope > 0 && currentValue < targetValue) {
    periodsToTarget = Math.ceil((targetValue - trend.intercept) / trend.slope - currentIndex);
  }

  return {
    predictions,
    targetDate: periodsToTarget ? new Date(Date.now() + periodsToTarget * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
    periodsToTarget,
    confidence: Math.round(trend.r2 * 100)
  };
}

/**
 * Analyze coverage data and generate insights
 */
function analyzeCoverageData(historyData) {
  if (historyData.length === 0) {
    console.warn('No coverage history data available for analysis');
    return;
  }

  analysisData.summary.totalBuilds = historyData.length;
  analysisData.summary.dateRange.start = historyData[0].timestamp;
  analysisData.summary.dateRange.end = historyData[historyData.length - 1].timestamp;

  // Extract coverage metrics
  const metrics = {
    lineCoverage: [],
    branchCoverage: [],
    instructionCoverage: [],
    methodCoverage: [],
    classCoverage: [],
    controllerCoverage: [],
    serviceCoverage: [],
    testDuration: [],
    testFailures: []
  };

  let qualityGatePasses = 0;

  historyData.forEach(item => {
    const lineCov = item.coverage?.line_percentage || item.line_coverage || 0;
    const branchCov = item.coverage?.branch_percentage || item.branch_coverage || 0;

    metrics.lineCoverage.push(lineCov);
    metrics.branchCoverage.push(branchCov);
    metrics.instructionCoverage.push(item.coverage?.instruction_percentage || 0);
    metrics.methodCoverage.push(item.coverage?.method_percentage || 0);
    metrics.classCoverage.push(item.coverage?.class_percentage || 0);
    metrics.controllerCoverage.push(item.coverage?.controller_percentage || 0);
    metrics.serviceCoverage.push(item.coverage?.service_percentage || 0);
    metrics.testDuration.push(item.test_duration_seconds || 0);
    metrics.testFailures.push(item.test_failures || 0);

    // Check quality gate
    if ((item.quality_gate_passed !== false) &&
        lineCov >= 65 && branchCov >= 45 &&
        (item.test_failures || 0) === 0) {
      qualityGatePasses++;
    }
  });

  analysisData.summary.qualityGatePassRate = Math.round((qualityGatePasses / historyData.length) * 100);

  // Calculate statistics for each metric
  Object.keys(metrics).forEach(metric => {
    const values = metrics[metric].filter(v => v > 0);
    if (values.length > 0) {
      analysisData.summary.averageCoverage[metric] = calculateStatistics(values);

      // Calculate trend
      analysisData.trends[metric] = linearRegression(values);

      // Calculate volatility (coefficient of variation)
      const stats = calculateStatistics(values);
      analysisData.summary.volatility[metric] = stats.stdDev > 0 ? Math.round((stats.stdDev / stats.mean) * 100) : 0;

      // Generate forecasts if requested
      if (CONFIG.includeForecast) {
        const currentValue = values[values.length - 1];
        analysisData.forecasts[metric] = generateForecasts(analysisData.trends[metric], currentValue);
      }
    }
  });

  // Generate insights and recommendations
  generateInsights(historyData);
}

/**
 * Generate insights and recommendations based on analysis
 */
function generateInsights(historyData) {
  const insights = [];
  const recommendations = [];

  // Current status insights
  const latest = historyData[historyData.length - 1];
  const lineCov = latest.coverage?.line_percentage || latest.line_coverage || 0;
  const branchCov = latest.coverage?.branch_percentage || latest.branch_coverage || 0;
  const controllerCov = latest.coverage?.controller_percentage || 0;
  const serviceCov = latest.coverage?.service_percentage || 0;

  if (lineCov < 65) {
    insights.push(`❌ Line coverage (${lineCov}%) is below the 65% target`);
    recommendations.push('Increase line coverage by adding more unit tests, especially for complex business logic');
  } else {
    insights.push(`✅ Line coverage (${lineCov}%) meets the 65% target`);
  }

  if (controllerCov < 30) {
    insights.push(`❌ Controller coverage (${controllerCov}%) is significantly below the 30% target`);
    recommendations.push('Add integration tests for controller endpoints using Spring Boot Test');
  }

  if (serviceCov < 60) {
    insights.push(`❌ Service coverage (${serviceCov}%) is below the 60% target`);
    recommendations.push('Improve service layer testing by mocking external dependencies and testing edge cases');
  }

  // Trend insights
  if (analysisData.trends.lineCoverage.direction === 'improving') {
    insights.push('📈 Line coverage is trending upward - good progress being made');
  } else if (analysisData.trends.lineCoverage.direction === 'declining') {
    insights.push('📉 Line coverage is trending downward - immediate attention required');
    recommendations.push('Review recent changes that may have reduced test coverage');
  }

  // Volatility insights
  const lineVolatility = analysisData.summary.volatility.lineCoverage;
  if (lineVolatility > 20) {
    insights.push(`⚠️ High coverage volatility (${lineVolatility}%) indicates inconsistent testing practices`);
    recommendations.push('Implement automated coverage checks in CI/CD to prevent coverage regressions');
  }

  // Test quality insights
  const failureRate = analysisData.summary.averageCoverage.testFailures.mean;
  if (failureRate > 0) {
    insights.push(`⚠️ Average test failures: ${failureRate.toFixed(1)} per build`);
    recommendations.push('Fix flaky tests and ensure test reliability');
  }

  // Forecast insights
  if (CONFIG.includeForecast && analysisData.forecasts.lineCoverage.targetDate) {
    const targetDate = analysisData.forecasts.lineCoverage.targetDate;
    insights.push(`🎯 Projected to reach 70% line coverage by ${targetDate} (at current trend)`);
  }

  analysisData.insights = insights;
  analysisData.recommendations = recommendations;
}

/**
 * Generate markdown report
 */
function generateMarkdownReport() {
  const summary = analysisData.summary;
  const latest = analysisData.trends;

  let report = `# Coverage Trend Analysis Report

**Generated**: ${new Date().toLocaleString()}
**Analysis Period**: ${new Date(summary.dateRange.start).toLocaleDateString()} - ${new Date(summary.dateRange.end).toLocaleDateString()}
**Total Builds Analyzed**: ${summary.totalBuilds}

## Executive Summary

### Current Status
- **Quality Gate Pass Rate**: ${summary.qualityGatePassRate}%
- **Average Line Coverage**: ${summary.averageCoverage.lineCoverage?.mean || 0}%
- **Average Branch Coverage**: ${summary.averageCoverage.branchCoverage?.mean || 0}%
- **Average Controller Coverage**: ${summary.averageCoverage.controllerCoverage?.mean || 0}%
- **Average Service Coverage**: ${summary.averageCoverage.serviceCoverage?.mean || 0}%

### Trend Overview
- **Line Coverage Trend**: ${latest.lineCoverage?.direction || 'unknown'} (${latest.lineCoverage?.slope > 0 ? '+' : ''}${(latest.lineCoverage?.slope * 100 || 0).toFixed(2)}% per build)
- **Branch Coverage Trend**: ${latest.branchCoverage?.direction || 'unknown'} (${latest.branchCoverage?.slope > 0 ? '+' : ''}${(latest.branchCoverage?.slope * 100 || 0).toFixed(2)}% per build)
- **Controller Coverage Trend**: ${latest.controllerCoverage?.direction || 'unknown'}
- **Service Coverage Trend**: ${latest.serviceCoverage?.direction || 'unknown'}

## Detailed Metrics

### Coverage Statistics

| Metric | Mean | Median | Std Dev | Min | Max | Volatility |
|--------|------|--------|---------|-----|-----|------------|
| Line Coverage | ${summary.averageCoverage.lineCoverage?.mean || 0}% | ${summary.averageCoverage.lineCoverage?.median || 0}% | ${summary.averageCoverage.lineCoverage?.stdDev || 0}% | ${summary.averageCoverage.lineCoverage?.min || 0}% | ${summary.averageCoverage.lineCoverage?.max || 0}% | ${summary.volatility.lineCoverage || 0}% |
| Branch Coverage | ${summary.averageCoverage.branchCoverage?.mean || 0}% | ${summary.averageCoverage.branchCoverage?.median || 0}% | ${summary.averageCoverage.branchCoverage?.stdDev || 0}% | ${summary.averageCoverage.branchCoverage?.min || 0}% | ${summary.averageCoverage.branchCoverage?.max || 0}% | ${summary.volatility.branchCoverage || 0}% |
| Controller Coverage | ${summary.averageCoverage.controllerCoverage?.mean || 0}% | ${summary.averageCoverage.controllerCoverage?.median || 0}% | ${summary.averageCoverage.controllerCoverage?.stdDev || 0}% | ${summary.averageCoverage.controllerCoverage?.min || 0}% | ${summary.averageCoverage.controllerCoverage?.max || 0}% | ${summary.volatility.controllerCoverage || 0}% |
| Service Coverage | ${summary.averageCoverage.serviceCoverage?.mean || 0}% | ${summary.averageCoverage.serviceCoverage?.median || 0}% | ${summary.averageCoverage.serviceCoverage?.stdDev || 0}% | ${summary.averageCoverage.serviceCoverage?.min || 0}% | ${summary.averageCoverage.serviceCoverage?.max || 0}% | ${summary.volatility.serviceCoverage || 0}% |

### Test Execution Statistics

| Metric | Mean | Median | Std Dev | Min | Max |
|--------|------|--------|---------|-----|-----|
| Test Duration | ${summary.averageCoverage.testDuration?.mean || 0}s | ${summary.averageCoverage.testDuration?.median || 0}s | ${summary.averageCoverage.testDuration?.stdDev || 0}s | ${summary.averageCoverage.testDuration?.min || 0}s | ${summary.averageCoverage.testDuration?.max || 0}s |
| Test Failures | ${summary.averageCoverage.testFailures?.mean || 0} | ${summary.averageCoverage.testFailures?.median || 0} | ${summary.averageCoverage.testFailures?.stdDev || 0} | ${summary.averageCoverage.testFailures?.min || 0} | ${summary.averageCoverage.testFailures?.max || 0} |

## Trend Analysis

### Coverage Trends
`;

  // Add trend analysis for each metric
  const metrics = ['lineCoverage', 'branchCoverage', 'controllerCoverage', 'serviceCoverage'];
  metrics.forEach(metric => {
    const trend = analysisData.trends[metric];
    if (trend && trend.direction !== 'insufficient-data') {
      const metricName = metric.replace('Coverage', ' Coverage');
      report += `
#### ${metricName}
- **Direction**: ${trend.direction}
- **Slope**: ${trend.slope > 0 ? '+' : ''}${(trend.slope * 100).toFixed(2)}% per build
- **R²**: ${trend.r2} (${trend.r2 > 0.7 ? 'Strong' : trend.r2 > 0.3 ? 'Moderate' : 'Weak'} correlation)
- **Confidence**: ${trend.confidence.toFixed(2)}`;
    }
  });

  // Add forecasts if enabled
  if (CONFIG.includeForecast) {
    report += `

## Forecast Analysis

### Coverage Projections
`;

    metrics.forEach(metric => {
      const forecast = analysisData.forecasts[metric];
      if (forecast && forecast.predictions.length > 0) {
        const metricName = metric.replace('Coverage', ' Coverage');
        report += `
#### ${metricName}
- **Current Trend**: ${analysisData.trends[metric].direction}
- **Forecast Confidence**: ${forecast.confidence}%

**10-Build Projection**:
| Period | Predicted Value | Confidence |
|--------|----------------|------------|
${forecast.predictions.slice(0, 10).map(p => `| +${p.period} | ${p.value}% | ${p.confidence}% |`).join('\n')}

${forecast.targetDate ? `**Target Achievement**: Projected to reach 70% by ${forecast.targetDate} (${forecast.periodsToTarget} builds)` : '**Target Achievement**: Unlikely at current trend'}`;
      }
    });
  }

  // Add insights
  if (analysisData.insights.length > 0) {
    report += `

## Key Insights

${analysisData.insights.map(insight => `- ${insight}`).join('\n')}
`;
  }

  // Add recommendations
  if (CONFIG.includeRecommendations && analysisData.recommendations.length > 0) {
    report += `
## Recommendations

${analysisData.recommendations.map(rec => `- ${rec}`).join('\n')}
`;
  }

  // Add methodology
  report += `

## Methodology

### Data Sources
- JaCoCo coverage reports generated during CI/CD pipeline
- Test execution results from Surefire/Failsafe plugins
- Historical data stored in \`coverage-history/\` directory

### Analysis Methods
- **Statistical Analysis**: Mean, median, standard deviation, volatility calculations
- **Trend Analysis**: Linear regression with R² correlation coefficient
- **Forecasting**: Trend extrapolation with confidence intervals
- **Quality Assessment**: Comparison against predefined thresholds

### Thresholds
- **Line Coverage**: ≥65%
- **Branch Coverage**: ≥45%
- **Instruction Coverage**: ≥65%
- **Method Coverage**: ≥75%
- **Class Coverage**: ≥90%
- **Controller Coverage**: ≥30%
- **Service Coverage**: ≥60%
- **Test Failures**: 0 (strict)

---

*Report generated by Coverage Trend Analysis Tool v1.0.0*
`;

  return report;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting Coverage Trend Analysis...');

    // Load historical data
    const historyData = loadCoverageHistory();
    console.log(`📊 Loaded ${historyData.length} historical data points`);

    if (historyData.length === 0) {
      console.warn('No historical data available. Run some builds first to collect coverage data.');
      return;
    }

    // Analyze data
    analyzeCoverageData(historyData);

    // Generate markdown report
    const reportContent = generateMarkdownReport();

    // Write report to file
    const outputDir = path.dirname(CONFIG.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(CONFIG.outputFile, reportContent, 'utf8');

    console.log(`🎉 Coverage trend analysis report generated: ${CONFIG.outputFile}`);
    console.log(`📈 Analysis Summary: ${analysisData.summary.totalBuilds} builds, Quality Gate Pass Rate: ${analysisData.summary.qualityGatePassRate}%`);

    if (CONFIG.verbose) {
      console.log(`📊 Key Metrics:`);
      console.log(`   - Average Line Coverage: ${analysisData.summary.averageCoverage.lineCoverage?.mean || 0}%`);
      console.log(`   - Line Coverage Trend: ${analysisData.trends.lineCoverage?.direction || 'unknown'}`);
      console.log(`   - Quality Gate Pass Rate: ${analysisData.summary.qualityGatePassRate}%`);
    }

  } catch (error) {
    console.error('❌ Error generating coverage trend analysis:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
