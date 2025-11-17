#!/usr/bin/env node

/**
 * HTML Test Report Generator
 *
 * Generates detailed HTML test reports from Surefire XML reports
 * Includes test execution time, failure reasons, stack traces, and trend analysis
 *
 * Usage:
 * node scripts/generate-html-test-report.js [options]
 *
 * Options:
 * --input <dir>     Input directory with XML reports (default: springboot1ngh61a2/target/surefire-reports)
 * --output <file>   Output HTML file (default: test-report.html)
 * --title <title>   Report title (default: Backend Test Report)
 * --history <file>  History JSON file for trend analysis
 * --verbose         Verbose output
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const CONFIG = {
  inputDir: process.env.TEST_REPORT_DIR || path.join(__dirname, '..', 'springboot1ngh61a2', 'target', 'surefire-reports'),
  outputFile: process.env.REPORT_OUTPUT || path.join(__dirname, '..', 'test-report.html'),
  title: process.env.REPORT_TITLE || 'Backend Test Report',
  historyFile: process.env.HISTORY_FILE,
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
    case '--title':
      CONFIG.title = nextArg;
      i++;
      break;
    case '--history':
      CONFIG.historyFile = nextArg;
      i++;
      break;
  }
}

// Test results data structure
let testResults = {
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    errorTests: 0,
    skippedTests: 0,
    executionTime: 0,
    timestamp: new Date().toISOString()
  },
  testSuites: [],
  failures: [],
  trends: []
};

/**
 * Parse Surefire XML test report
 */
function parseTestReport(xmlFilePath) {
  const fs = require('fs');
  const xml2js = require('xml2js');

  return new Promise((resolve, reject) => {
    const xmlContent = fs.readFileSync(xmlFilePath, 'utf8');

    xml2js.parseString(xmlContent, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      const testSuite = result.testsuite;
      const testsuiteData = {
        name: testSuite.$.name || path.basename(xmlFilePath, '.xml'),
        tests: parseInt(testSuite.$.tests || 0),
        failures: parseInt(testSuite.$.failures || 0),
        errors: parseInt(testSuite.$.errors || 0),
        skipped: parseInt(testSuite.$.skipped || 0),
        time: parseFloat(testSuite.$.time || 0),
        timestamp: testSuite.$.timestamp || new Date().toISOString(),
        testCases: []
      };

      // Parse individual test cases
      if (testSuite.testcase) {
        testsuiteData.testCases = testSuite.testcase.map(tc => ({
          name: tc.$.name,
          className: tc.$.classname,
          time: parseFloat(tc.$.time || 0),
          status: tc.failure ? 'failed' : tc.error ? 'error' : tc.skipped ? 'skipped' : 'passed',
          failure: tc.failure ? {
            message: tc.failure[0].$.message,
            type: tc.failure[0].$.type,
            stackTrace: tc.failure[0]._
          } : null,
          error: tc.error ? {
            message: tc.error[0].$.message,
            type: tc.error[0].$.type,
            stackTrace: tc.error[0]._
          } : null
        }));
      }

      resolve(testsuiteData);
    });
  });
}

/**
 * Load historical test data for trend analysis
 */
function loadHistoricalData() {
  if (!CONFIG.historyFile || !fs.existsSync(CONFIG.historyFile)) {
    return [];
  }

  try {
    const historyData = JSON.parse(fs.readFileSync(CONFIG.historyFile, 'utf8'));
    return Array.isArray(historyData) ? historyData : [];
  } catch (error) {
    console.warn('Failed to load historical data:', error.message);
    return [];
  }
}

/**
 * Analyze test results and extract summary information
 */
function analyzeResults() {
  testResults.summary.totalTests = testResults.testSuites.reduce((sum, suite) => sum + suite.tests, 0);
  testResults.summary.passedTests = testResults.testSuites.reduce((sum, suite) => sum + (suite.tests - suite.failures - suite.errors - suite.skipped), 0);
  testResults.summary.failedTests = testResults.testSuites.reduce((sum, suite) => sum + suite.failures, 0);
  testResults.summary.errorTests = testResults.testSuites.reduce((sum, suite) => sum + suite.errors, 0);
  testResults.summary.skippedTests = testResults.testSuites.reduce((sum, suite) => sum + suite.skipped, 0);
  testResults.summary.executionTime = testResults.testSuites.reduce((sum, suite) => sum + suite.time, 0);

  // Extract failures for detailed reporting
  testResults.failures = testResults.testSuites.flatMap(suite =>
    suite.testCases
      .filter(tc => tc.status === 'failed' || tc.status === 'error')
      .map(tc => ({
        testSuite: suite.name,
        testCase: tc.name,
        className: tc.className,
        status: tc.status,
        message: tc.failure?.message || tc.error?.message,
        type: tc.failure?.type || tc.error?.type,
        stackTrace: tc.failure?.stackTrace || tc.error?.stackTrace
      }))
  );

  // Load trends
  testResults.trends = loadHistoricalData();
}

/**
 * Generate HTML report
 */
function generateHTMLReport() {
  const successRate = testResults.summary.totalTests > 0
    ? ((testResults.summary.passedTests / testResults.summary.totalTests) * 100).toFixed(2)
    : 0;

  const status = testResults.summary.failedTests > 0 || testResults.summary.errorTests > 0 ? 'failed' : 'passed';
  const statusColor = status === 'passed' ? '#28a745' : '#dc3545';

  // Generate trend chart data
  const trendLabels = testResults.trends.slice(-10).map(t => new Date(t.timestamp).toLocaleDateString());
  const trendPassRates = testResults.trends.slice(-10).map(t => t.totalTests > 0 ? ((t.passedTests / t.totalTests) * 100) : 0);
  const trendExecutionTimes = testResults.trends.slice(-10).map(t => t.executionTime);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.title}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header .status {
            display: inline-block;
            padding: 10px 20px;
            background-color: ${statusColor};
            border-radius: 20px;
            font-weight: bold;
            font-size: 1.1em;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        .summary-card h3 {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .summary-card .value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .summary-card .passed { color: #28a745; }
        .summary-card .failed { color: #dc3545; }
        .summary-card .skipped { color: #ffc107; }
        .summary-card .total { color: #007bff; }

        .charts-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }

        .chart-container {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .chart-container h2 {
            margin-bottom: 20px;
            color: #333;
            font-size: 1.4em;
        }

        .test-suites {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }

        .test-suite {
            border: 1px solid #e9ecef;
            border-radius: 5px;
            margin-bottom: 15px;
            overflow: hidden;
        }

        .test-suite-header {
            background: #f8f9fa;
            padding: 15px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .test-suite-header:hover {
            background: #e9ecef;
        }

        .test-suite-name {
            font-weight: bold;
        }

        .test-suite-stats {
            display: flex;
            gap: 15px;
            font-size: 0.9em;
        }

        .stat-passed { color: #28a745; }
        .stat-failed { color: #dc3545; }
        .stat-error { color: #dc3545; font-weight: bold; }
        .stat-skipped { color: #ffc107; }

        .test-suite-details {
            display: none;
            padding: 15px;
            background: #f8f9fa;
        }

        .test-case {
            padding: 10px;
            margin-bottom: 5px;
            border-radius: 3px;
            border-left: 4px solid;
        }

        .test-case.passed {
            background: #d4edda;
            border-left-color: #28a745;
        }

        .test-case.failed {
            background: #f8d7da;
            border-left-color: #dc3545;
        }

        .test-case.error {
            background: #f8d7da;
            border-left-color: #dc3545;
        }

        .test-case.skipped {
            background: #fff3cd;
            border-left-color: #ffc107;
        }

        .failures-section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }

        .failure-item {
            border: 1px solid #dc3545;
            border-radius: 5px;
            margin-bottom: 15px;
            overflow: hidden;
        }

        .failure-header {
            background: #f8d7da;
            padding: 15px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .failure-header:hover {
            background: #f5c6cb;
        }

        .failure-title {
            font-weight: bold;
            color: #721c24;
        }

        .failure-type {
            color: #721c24;
            font-size: 0.9em;
        }

        .failure-details {
            display: none;
            padding: 15px;
            background: #f8f9fa;
        }

        .failure-message {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 3px;
            margin-bottom: 10px;
            border-left: 4px solid #dc3545;
            font-family: monospace;
            white-space: pre-wrap;
        }

        .stack-trace {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.8em;
            overflow-x: auto;
            white-space: pre;
            max-height: 300px;
            overflow-y: auto;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }

        .toggle-btn {
            background: none;
            border: none;
            color: #007bff;
            cursor: pointer;
            font-size: 0.9em;
        }

        .toggle-btn:hover {
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }

            .header {
                padding: 20px;
            }

            .header h1 {
                font-size: 2em;
            }

            .summary-grid {
                grid-template-columns: 1fr;
            }

            .charts-section {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${CONFIG.title}</h1>
            <div class="status">${status.toUpperCase()}</div>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value total">${testResults.summary.totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="value passed">${testResults.summary.passedTests}</div>
                <div>(${successRate}%)</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="value failed">${testResults.summary.failedTests}</div>
            </div>
            <div class="summary-card">
                <h3>Errors</h3>
                <div class="value failed">${testResults.summary.errorTests}</div>
            </div>
            <div class="summary-card">
                <h3>Skipped</h3>
                <div class="value skipped">${testResults.summary.skippedTests}</div>
            </div>
            <div class="summary-card">
                <h3>Execution Time</h3>
                <div class="value total">${testResults.summary.executionTime.toFixed(2)}s</div>
            </div>
        </div>

        <div class="charts-section">
            <div class="chart-container">
                <h2>Test Results Distribution</h2>
                <canvas id="resultsChart" width="400" height="300"></canvas>
            </div>
            <div class="chart-container">
                <h2>Test Success Rate Trend</h2>
                <canvas id="trendChart" width="400" height="300"></canvas>
            </div>
        </div>

        <div class="test-suites">
            <h2>Test Suites (${testResults.testSuites.length})</h2>
            ${testResults.testSuites.map(suite => `
                <div class="test-suite">
                    <div class="test-suite-header" onclick="toggleDetails(this)">
                        <div class="test-suite-name">${suite.name}</div>
                        <div class="test-suite-stats">
                            <span class="stat-passed">✓ ${suite.tests - suite.failures - suite.errors - suite.skipped}</span>
                            <span class="stat-failed">✗ ${suite.failures}</span>
                            <span class="stat-error">⚠ ${suite.errors}</span>
                            <span class="stat-skipped">⊘ ${suite.skipped}</span>
                            <span>${suite.time.toFixed(2)}s</span>
                            <button class="toggle-btn">Toggle Details</button>
                        </div>
                    </div>
                    <div class="test-suite-details">
                        ${suite.testCases.map(tc => `
                            <div class="test-case ${tc.status}">
                                <strong>${tc.name}</strong> (${tc.time.toFixed(3)}s)
                                ${tc.status === 'failed' && tc.failure ? `<br><small>${tc.failure.message}</small>` : ''}
                                ${tc.status === 'error' && tc.error ? `<br><small>${tc.error.message}</small>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>

        ${testResults.failures.length > 0 ? `
            <div class="failures-section">
                <h2>Test Failures (${testResults.failures.length})</h2>
                ${testResults.failures.map(failure => `
                    <div class="failure-item">
                        <div class="failure-header" onclick="toggleFailureDetails(this)">
                            <div>
                                <div class="failure-title">${failure.testSuite} › ${failure.testCase}</div>
                                <div class="failure-type">${failure.type}: ${failure.message}</div>
                            </div>
                            <button class="toggle-btn">Show Details</button>
                        </div>
                        <div class="failure-details">
                            <div class="failure-message">${failure.message}</div>
                            <div class="stack-trace">${failure.stackTrace}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <div class="footer">
            <p>Report generated by HTML Test Report Generator v1.0.0</p>
            <p>Test reports from: ${CONFIG.inputDir}</p>
        </div>
    </div>

    <script>
        // Test results distribution chart
        const resultsCtx = document.getElementById('resultsChart').getContext('2d');
        new Chart(resultsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed', 'Errors', 'Skipped'],
                datasets: [{
                    data: [${testResults.summary.passedTests}, ${testResults.summary.failedTests}, ${testResults.summary.errorTests}, ${testResults.summary.skippedTests}],
                    backgroundColor: ['#28a745', '#dc3545', '#dc3545', '#ffc107'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Success rate trend chart
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(trendLabels)},
                datasets: [{
                    label: 'Success Rate (%)',
                    data: ${JSON.stringify(trendPassRates)},
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // Toggle functions
        function toggleDetails(header) {
            const details = header.nextElementSibling;
            details.style.display = details.style.display === 'block' ? 'none' : 'block';
        }

        function toggleFailureDetails(header) {
            const details = header.nextElementSibling;
            details.style.display = details.style.display === 'block' ? 'none' : 'block';
        }
    </script>
</body>
</html>`;

  return html;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting HTML Test Report Generation...');

    // Check if input directory exists
    if (!fs.existsSync(CONFIG.inputDir)) {
      throw new Error(`Input directory not found: ${CONFIG.inputDir}`);
    }

    // Find XML report files
    const xmlFiles = await glob('**/*.xml', { cwd: CONFIG.inputDir });

    if (xmlFiles.length === 0) {
      throw new Error(`No XML test report files found in: ${CONFIG.inputDir}`);
    }

    console.log(`📋 Found ${xmlFiles.length} test report files`);

    // Parse all test reports
    for (const xmlFile of xmlFiles) {
      const xmlFilePath = path.join(CONFIG.inputDir, xmlFile);

      if (CONFIG.verbose) {
        console.log(`📄 Processing: ${xmlFile}`);
      }

      try {
        const testSuiteData = await parseTestReport(xmlFilePath);
        testResults.testSuites.push(testSuiteData);
      } catch (error) {
        console.warn(`⚠️  Failed to parse ${xmlFile}: ${error.message}`);
      }
    }

    console.log(`✅ Parsed ${testResults.testSuites.length} test suites`);

    // Analyze results
    analyzeResults();

    // Generate HTML report
    const htmlContent = generateHTMLReport();

    // Write report to file
    const outputDir = path.dirname(CONFIG.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(CONFIG.outputFile, htmlContent, 'utf8');

    console.log(`🎉 HTML test report generated: ${CONFIG.outputFile}`);
    console.log(`📊 Summary: ${testResults.summary.totalTests} tests, ${testResults.summary.passedTests} passed, ${testResults.summary.failedTests} failed, ${testResults.summary.errorTests} errors`);

  } catch (error) {
    console.error('❌ Error generating HTML test report:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
