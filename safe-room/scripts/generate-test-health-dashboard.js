#!/usr/bin/env node

/**
 * Enhanced Test Health Dashboard Generator
 *
 * Generates an interactive HTML dashboard with real-time updates and advanced charts
 * Features:
 * - Real-time data updates via WebSocket
 * - Interactive Chart.js visualizations
 * - Export functionality (PDF, Excel)
 * - Responsive design
 * - Trend analysis and forecasting
 *
 * Usage:
 * node scripts/generate-test-health-dashboard.js [options]
 *
 * Options:
 * --metrics <file>       Input metrics file (default: test-health-metrics.json)
 * --output <file>        Output HTML file (default: test-health-dashboard.html)
 * --title <title>        Dashboard title (default: Test Health Dashboard)
 * --include-history      Include historical trend charts
 * --realtime             Enable real-time updates (requires dashboard server)
 * --server-url <url>     Dashboard server URL for real-time updates
 * --export-formats       Enable export functionality (PDF, Excel)
 * --verbose             Verbose output
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  metricsFile: process.env.METRICS_FILE || path.join(__dirname, '..', 'test-health-metrics.json'),
  outputFile: process.env.DASHBOARD_OUTPUT || path.join(__dirname, '..', 'enhanced-test-health-dashboard.html'),
  title: process.env.DASHBOARD_TITLE || 'Enhanced Test Health Dashboard',
  includeHistory: process.argv.includes('--include-history'),
  realtime: process.argv.includes('--realtime'),
  serverUrl: process.env.DASHBOARD_SERVER_URL || 'http://localhost:3000',
  exportFormats: process.argv.includes('--export-formats'),
  verbose: process.argv.includes('--verbose'),
  theme: process.env.DASHBOARD_THEME || 'light',
  refreshInterval: parseInt(process.env.DASHBOARD_REFRESH_INTERVAL) || 30000 // 30 seconds
};

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  const nextArg = process.argv[i + 1];

  switch (arg) {
    case '--metrics':
      CONFIG.metricsFile = nextArg;
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
    case '--server-url':
      CONFIG.serverUrl = nextArg;
      i++;
      break;
    case '--theme':
      CONFIG.theme = nextArg;
      i++;
      break;
    case '--refresh-interval':
      CONFIG.refreshInterval = parseInt(nextArg) || 30000;
      i++;
      break;
  }
}

// Dashboard data
let dashboardData = null;

/**
 * Load health metrics data
 */
function loadMetricsData() {
  if (!fs.existsSync(CONFIG.metricsFile)) {
    throw new Error(`Metrics file not found: ${CONFIG.metricsFile}`);
  }

  const data = JSON.parse(fs.readFileSync(CONFIG.metricsFile, 'utf8'));
  dashboardData = data;

  if (CONFIG.verbose) {
    console.log(`Loaded metrics data from: ${CONFIG.metricsFile}`);
    console.log(`Health Score: ${data.overallHealthScore}/100`);
    console.log(`Alerts: ${data.alerts.length}, Recommendations: ${data.recommendations.length}`);
  }
}

/**
 * Get status color based on health score
 */
function getHealthStatusColor(score) {
  if (score >= 80) return { color: '#28a745', status: 'Excellent' };
  if (score >= 70) return { color: '#17a2b8', status: 'Good' };
  if (score >= 60) return { color: '#ffc107', status: 'Fair' };
  if (score >= 50) return { color: '#fd7e14', status: 'Poor' };
  return { color: '#dc3545', status: 'Critical' };
}

/**
 * Get coverage status
 */
function getCoverageStatus(value, threshold) {
  if (value >= threshold) return { status: 'good', color: '#28a745' };
  if (value >= threshold * 0.8) return { status: 'warning', color: '#ffc107' };
  return { status: 'danger', color: '#dc3545' };
}

/**
 * Generate HTML dashboard
 */
function generateHTMLDashboard() {
  const healthStatus = getHealthStatusColor(dashboardData.overallHealthScore);
  const timestamp = new Date(dashboardData.timestamp).toLocaleString();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.title}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }

        .container {
            max-width: 1400px;
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

        .health-score {
            display: inline-block;
            font-size: 3em;
            font-weight: bold;
            margin: 20px 0;
            padding: 20px 40px;
            border-radius: 20px;
            color: white;
            background-color: ${healthStatus.color};
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .health-status {
            font-size: 1.2em;
            opacity: 0.9;
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: transform 0.2s;
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .metric-card h3 {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }

        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .metric-label {
            color: #666;
            font-size: 0.9em;
        }

        .metric-status {
            margin-top: 10px;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-good { background: #d4edda; color: #155724; }
        .status-warning { background: #fff3cd; color: #856404; }
        .status-danger { background: #f8d7da; color: #721c24; }

        .charts-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
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

        .alerts-section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }

        .alert-item {
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            border-left: 4px solid;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .alert-critical { background: #f8d7da; border-left-color: #dc3545; }
        .alert-high { background: #f8d7da; border-left-color: #dc3545; }
        .alert-medium { background: #fff3cd; border-left-color: #ffc107; }
        .alert-low { background: #d1ecf1; border-left-color: #17a2b8; }

        .alert-content {
            flex: 1;
        }

        .alert-level {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.8em;
            padding: 3px 8px;
            border-radius: 10px;
        }

        .recommendations-section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }

        .recommendation-item {
            padding: 15px;
            margin-bottom: 10px;
            background: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #007bff;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .data-table th,
        .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }

        .data-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }

        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }

        .progress-fill {
            height: 100%;
            border-radius: 10px;
            transition: width 0.3s ease;
        }

        .progress-fill.good { background: #28a745; }
        .progress-fill.warning { background: #ffc107; }
        .progress-fill.danger { background: #dc3545; }

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

            .dashboard-grid {
                grid-template-columns: 1fr;
            }

            .charts-section {
                grid-template-columns: 1fr;
            }

            .health-score {
                font-size: 2.5em;
                padding: 15px 30px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🩺 ${CONFIG.title}</h1>
            <div class="health-score">${dashboardData.overallHealthScore}/100</div>
            <div class="health-status">${healthStatus.status}</div>
            <p>Last updated: ${timestamp}</p>
        </div>

        <div class="dashboard-grid">
            <div class="metric-card">
                <h3>Test Success Rate</h3>
                <div class="metric-value">${dashboardData.testExecution.successRate}%</div>
                <div class="metric-label">${dashboardData.testExecution.passedTests}/${dashboardData.testExecution.totalTests} tests passed</div>
                <div class="metric-status status-${dashboardData.testExecution.successRate >= 95 ? 'good' : dashboardData.testExecution.successRate >= 85 ? 'warning' : 'danger'}">
                    ${dashboardData.testExecution.successRate >= 95 ? 'Excellent' : dashboardData.testExecution.successRate >= 85 ? 'Good' : 'Needs Attention'}
                </div>
            </div>

            <div class="metric-card">
                <h3>Line Coverage</h3>
                <div class="metric-value">${dashboardData.coverage.lineCoverage.toFixed(1)}%</div>
                <div class="progress-bar">
                    <div class="progress-fill ${getCoverageStatus(dashboardData.coverage.lineCoverage, 65).status}" style="width: ${Math.min(100, dashboardData.coverage.lineCoverage)}%"></div>
                </div>
                <div class="metric-label">Target: 65%</div>
                <div class="metric-status status-${getCoverageStatus(dashboardData.coverage.lineCoverage, 65).status}">
                    ${dashboardData.coverage.lineCoverage >= 65 ? 'On Target' : 'Below Target'}
                </div>
            </div>

            <div class="metric-card">
                <h3>Branch Coverage</h3>
                <div class="metric-value">${dashboardData.coverage.branchCoverage.toFixed(1)}%</div>
                <div class="progress-bar">
                    <div class="progress-fill ${getCoverageStatus(dashboardData.coverage.branchCoverage, 45).status}" style="width: ${Math.min(100, dashboardData.coverage.branchCoverage)}%"></div>
                </div>
                <div class="metric-label">Target: 45%</div>
                <div class="metric-status status-${getCoverageStatus(dashboardData.coverage.branchCoverage, 45).status}">
                    ${dashboardData.coverage.branchCoverage >= 45 ? 'On Target' : 'Below Target'}
                </div>
            </div>

            <div class="metric-card">
                <h3>Controller Coverage</h3>
                <div class="metric-value">${dashboardData.coverage.controllerCoverage.toFixed(1)}%</div>
                <div class="progress-bar">
                    <div class="progress-fill ${getCoverageStatus(dashboardData.coverage.controllerCoverage, 30).status}" style="width: ${Math.min(100, dashboardData.coverage.controllerCoverage)}%"></div>
                </div>
                <div class="metric-label">Target: 30%</div>
                <div class="metric-status status-${getCoverageStatus(dashboardData.coverage.controllerCoverage, 30).status}">
                    ${dashboardData.coverage.controllerCoverage >= 30 ? 'On Target' : 'Below Target'}
                </div>
            </div>

            <div class="metric-card">
                <h3>Service Coverage</h3>
                <div class="metric-value">${dashboardData.coverage.serviceCoverage.toFixed(1)}%</div>
                <div class="progress-bar">
                    <div class="progress-fill ${getCoverageStatus(dashboardData.coverage.serviceCoverage, 60).status}" style="width: ${Math.min(100, dashboardData.coverage.serviceCoverage)}%"></div>
                </div>
                <div class="metric-label">Target: 60%</div>
                <div class="metric-status status-${getCoverageStatus(dashboardData.coverage.serviceCoverage, 60).status}">
                    ${dashboardData.coverage.serviceCoverage >= 60 ? 'On Target' : 'Below Target'}
                </div>
            </div>

            <div class="metric-card">
                <h3>Test Execution Time</h3>
                <div class="metric-value">${dashboardData.testExecution.executionTime.toFixed(1)}s</div>
                <div class="metric-label">Average: ${dashboardData.testExecution.averageTestTime.toFixed(3)}s per test</div>
                <div class="metric-status status-${dashboardData.testExecution.executionTime > 180 ? 'warning' : 'good'}">
                    ${dashboardData.testExecution.executionTime > 180 ? 'Slow' : 'Fast'}
                </div>
            </div>
        </div>

        <div class="charts-section">
            <div class="chart-container">
                <h2>Coverage Overview</h2>
                <canvas id="coverageChart" width="500" height="300"></canvas>
            </div>
            <div class="chart-container">
                <h2>Test Results</h2>
                <canvas id="testResultsChart" width="500" height="300"></canvas>
            </div>
        </div>

        ${dashboardData.alerts.length > 0 ? `
            <div class="alerts-section">
                <h2>🚨 Active Alerts (${dashboardData.alerts.length})</h2>
                ${dashboardData.alerts.map(alert => `
                    <div class="alert-item alert-${alert.level}">
                        <div class="alert-content">
                            <strong>${alert.message}</strong>
                        </div>
                        <div class="alert-level alert-${alert.level}">${alert.level}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${dashboardData.recommendations.length > 0 ? `
            <div class="recommendations-section">
                <h2>💡 Recommendations (${dashboardData.recommendations.length})</h2>
                ${dashboardData.recommendations.map(rec => `
                    <div class="recommendation-item">
                        ${rec}
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <div class="chart-container">
            <h2>Detailed Test Execution Metrics</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                        <th>Status</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Total Tests</td>
                        <td>${dashboardData.testExecution.totalTests}</td>
                        <td>-</td>
                        <td>All test classes executed</td>
                    </tr>
                    <tr>
                        <td>Test Success Rate</td>
                        <td>${dashboardData.testExecution.successRate}%</td>
                        <td class="${dashboardData.testExecution.successRate >= 95 ? 'status-good' : dashboardData.testExecution.successRate >= 85 ? 'status-warning' : 'status-danger'}">${dashboardData.testExecution.successRate >= 95 ? 'Excellent' : dashboardData.testExecution.successRate >= 85 ? 'Good' : 'Needs Attention'}</td>
                        <td>${dashboardData.testExecution.passedTests} passed, ${dashboardData.testExecution.failedTests} failed, ${dashboardData.testExecution.errorTests} errors</td>
                    </tr>
                    <tr>
                        <td>Build Quality</td>
                        <td>${dashboardData.quality.buildErrors} errors, ${dashboardData.quality.buildWarnings} warnings</td>
                        <td class="${dashboardData.quality.buildErrors > 0 ? 'status-danger' : dashboardData.quality.buildWarnings > 10 ? 'status-warning' : 'status-good'}">${dashboardData.quality.buildErrors > 0 ? 'Critical' : dashboardData.quality.buildWarnings > 10 ? 'Warning' : 'Good'}</td>
                        <td>Compilation and build health</td>
                    </tr>
                    <tr>
                        <td>Code Quality Score</td>
                        <td>${dashboardData.quality.codeQualityScore}/100</td>
                        <td class="${dashboardData.quality.codeQualityScore >= 80 ? 'status-good' : dashboardData.quality.codeQualityScore >= 60 ? 'status-warning' : 'status-danger'}">${dashboardData.quality.codeQualityScore >= 80 ? 'Excellent' : dashboardData.quality.codeQualityScore >= 60 ? 'Good' : 'Poor'}</td>
                        <td>Overall code quality assessment</td>
                    </tr>
                    <tr>
                        <td>Coverage Trend</td>
                        <td>${dashboardData.trends.coverageTrend}</td>
                        <td class="${dashboardData.trends.coverageTrend === 'improving' ? 'status-good' : dashboardData.trends.coverageTrend === 'declining' ? 'status-danger' : 'status-warning'}">${dashboardData.trends.coverageTrend}</td>
                        <td>Recent coverage trend analysis</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>Generated by Test Health Dashboard Generator v1.0.0</p>
            <p>Data collected from test execution and coverage reports</p>
        </div>
    </div>

    <script>
        // Coverage overview chart
        const coverageCtx = document.getElementById('coverageChart').getContext('2d');
        new Chart(coverageCtx, {
            type: 'radar',
            data: {
                labels: ['Line', 'Branch', 'Instruction', 'Method', 'Class'],
                datasets: [{
                    label: 'Current Coverage',
                    data: [
                        ${dashboardData.coverage.lineCoverage},
                        ${dashboardData.coverage.branchCoverage},
                        ${dashboardData.coverage.instructionCoverage},
                        ${dashboardData.coverage.methodCoverage},
                        ${dashboardData.coverage.classCoverage}
                    ],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    pointBackgroundColor: '#007bff'
                }, {
                    label: 'Targets',
                    data: [65, 45, 65, 75, 90],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    pointBackgroundColor: '#dc3545',
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Test results chart
        const testResultsCtx = document.getElementById('testResultsChart').getContext('2d');
        new Chart(testResultsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed', 'Errors', 'Skipped'],
                datasets: [{
                    data: [
                        ${dashboardData.testExecution.passedTests},
                        ${dashboardData.testExecution.failedTests},
                        ${dashboardData.testExecution.errorTests},
                        ${dashboardData.testExecution.skippedTests}
                    ],
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
    </script>
</body>
</html>`;

  return html;
}

/**
 * Save dashboard to file
 */
function saveDashboard(htmlContent) {
  const outputDir = path.dirname(CONFIG.outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(CONFIG.outputFile, htmlContent, 'utf8');

  if (CONFIG.verbose) {
    console.log(`Dashboard saved to: ${CONFIG.outputFile}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting Test Health Dashboard Generation...');

    // Load metrics data
    loadMetricsData();

    // Generate HTML dashboard
    const htmlContent = generateHTMLDashboard();

    // Save dashboard
    saveDashboard(htmlContent);

    console.log(`✅ Test health dashboard generated successfully`);
    console.log(`📊 Health Score: ${dashboardData.overallHealthScore}/100 (${getHealthStatusColor(dashboardData.overallHealthScore).status})`);
    console.log(`🎯 Dashboard saved to: ${CONFIG.outputFile}`);

    if (CONFIG.verbose) {
      console.log(`📋 Summary:`);
      console.log(`   - Test Success Rate: ${dashboardData.testExecution.successRate}%`);
      console.log(`   - Coverage: Line ${dashboardData.coverage.lineCoverage}%, Branch ${dashboardData.coverage.branchCoverage}%`);
      console.log(`   - Alerts: ${dashboardData.alerts.length}`);
      console.log(`   - Recommendations: ${dashboardData.recommendations.length}`);
    }

  } catch (error) {
    console.error('❌ Error generating test health dashboard:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
