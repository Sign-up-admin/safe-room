#!/usr/bin/env node

/**
 * HTML Coverage Report Generator
 *
 * Generates detailed HTML coverage reports from JaCoCo XML reports
 * Includes package-level analysis, trends, and interactive visualizations
 *
 * Usage:
 * node scripts/generate-coverage-report.js [options]
 *
 * Options:
 * --input <file>    Input JaCoCo XML file (default: springboot1ngh61a2/target/site/jacoco/jacoco.xml)
 * --output <file>   Output HTML file (default: coverage-report.html)
 * --title <title>   Report title (default: Code Coverage Report)
 * --history <dir>  History directory for trend analysis
 * --thresholds <file> Configuration file with coverage thresholds
 * --verbose        Verbose output
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  inputFile: process.env.COVERAGE_XML || path.join(__dirname, '..', 'springboot1ngh61a2', 'target', 'site', 'jacoco', 'jacoco.xml'),
  outputFile: process.env.REPORT_OUTPUT || path.join(__dirname, '..', 'coverage-report.html'),
  title: process.env.REPORT_TITLE || 'Code Coverage Report',
  historyDir: process.env.HISTORY_DIR || path.join(__dirname, '..', 'springboot1ngh61a2', 'coverage-history'),
  thresholdsFile: process.env.THRESHOLDS_FILE || path.join(__dirname, '..', 'springboot1ngh61a2', '.test-config.json'),
  verbose: process.argv.includes('--verbose')
};

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  const nextArg = process.argv[i + 1];

  switch (arg) {
    case '--input':
      CONFIG.inputFile = nextArg;
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
      CONFIG.historyDir = nextArg;
      i++;
      break;
    case '--thresholds':
      CONFIG.thresholdsFile = nextArg;
      i++;
      break;
  }
}

// Coverage data structure
let coverageData = {
  summary: {
    lineCoverage: 0,
    branchCoverage: 0,
    instructionCoverage: 0,
    methodCoverage: 0,
    classCoverage: 0,
    complexityCoverage: 0,
    timestamp: new Date().toISOString()
  },
  packages: [],
  classes: [],
  thresholds: {
    line: 65,
    branch: 45,
    instruction: 65,
    method: 75,
    class: 90,
    controller: 30,
    service: 60
  },
  trends: []
};

/**
 * Parse JaCoCo XML coverage report
 */
function parseCoverageReport(xmlFilePath) {
  const xml2js = require('xml2js');

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(xmlFilePath)) {
      reject(new Error(`Coverage report file not found: ${xmlFilePath}`));
      return;
    }

    const xmlContent = fs.readFileSync(xmlFilePath, 'utf8');

    xml2js.parseString(xmlContent, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      const report = result.report;
      const parsedData = {
        packages: [],
        classes: []
      };

      // Parse package-level coverage
      if (report.package) {
        parsedData.packages = report.package.map(pkg => {
          const pkgData = {
            name: pkg.$.name,
            line: calculateCoverage(pkg.counter, 'LINE'),
            branch: calculateCoverage(pkg.counter, 'BRANCH'),
            instruction: calculateCoverage(pkg.counter, 'INSTRUCTION'),
            method: calculateCoverage(pkg.counter, 'METHOD'),
            class: calculateCoverage(pkg.counter, 'CLASS'),
            complexity: calculateCoverage(pkg.counter, 'COMPLEXITY'),
            classes: []
          };

          // Parse class-level coverage
          if (pkg.class) {
            pkgData.classes = pkg.class.map(cls => ({
              name: cls.$.name,
              sourceFileName: cls.$.sourcefilename,
              line: calculateCoverage(cls.counter, 'LINE'),
              branch: calculateCoverage(cls.counter, 'BRANCH'),
              instruction: calculateCoverage(cls.counter, 'INSTRUCTION'),
              method: calculateCoverage(cls.counter, 'METHOD'),
              complexity: calculateCoverage(cls.counter, 'COMPLEXITY')
            }));
          }

          return pkgData;
        });
      }

      // Calculate overall coverage
      parsedData.summary = {
        line: calculateCoverage(report.counter, 'LINE'),
        branch: calculateCoverage(report.counter, 'BRANCH'),
        instruction: calculateCoverage(report.counter, 'INSTRUCTION'),
        method: calculateCoverage(report.counter, 'METHOD'),
        class: calculateCoverage(report.counter, 'CLASS'),
        complexity: calculateCoverage(report.counter, 'COMPLEXITY')
      };

      resolve(parsedData);
    });
  });
}

/**
 * Calculate coverage percentage from JaCoCo counters
 */
function calculateCoverage(counters, type) {
  if (!counters) return 0;

  const counter = counters.find(c => c.$.type === type);
  if (!counter) return 0;

  const covered = parseInt(counter.$.covered);
  const total = parseInt(counter.$.missed) + covered;

  return total > 0 ? Math.round((covered / total) * 10000) / 100 : 0;
}

/**
 * Load coverage thresholds from configuration file
 */
function loadThresholds() {
  if (!fs.existsSync(CONFIG.thresholdsFile)) {
    console.warn(`Thresholds file not found: ${CONFIG.thresholdsFile}, using defaults`);
    return;
  }

  try {
    const config = JSON.parse(fs.readFileSync(CONFIG.thresholdsFile, 'utf8'));
    if (config.coverageThresholds) {
      coverageData.thresholds = { ...coverageData.thresholds, ...config.coverageThresholds };
    }
  } catch (error) {
    console.warn(`Failed to load thresholds: ${error.message}, using defaults`);
  }
}

/**
 * Load historical coverage data for trend analysis
 */
function loadHistoricalData() {
  if (!fs.existsSync(CONFIG.historyDir)) {
    return [];
  }

  try {
    const historyFiles = fs.readdirSync(CONFIG.historyDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(CONFIG.historyDir, file))
      .sort()
      .slice(-20); // Last 20 entries

    const history = historyFiles.map(file => {
      try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch {
        return null;
      }
    }).filter(Boolean);

    return history;
  } catch (error) {
    console.warn(`Failed to load historical data: ${error.message}`);
    return [];
  }
}

/**
 * Analyze coverage data and prepare for reporting
 */
function analyzeCoverageData(parsedData) {
  coverageData.summary = parsedData.summary;
  coverageData.packages = parsedData.packages;

  // Flatten all classes for detailed analysis
  coverageData.classes = parsedData.packages.flatMap(pkg =>
    pkg.classes.map(cls => ({
      ...cls,
      package: pkg.name,
      fullName: `${pkg.name}.${cls.name}`
    }))
  );

  // Sort packages by line coverage (ascending - worst first)
  coverageData.packages.sort((a, b) => a.line - b.line);

  // Load historical data for trends
  coverageData.trends = loadHistoricalData();
}

/**
 * Generate coverage status indicator
 */
function getCoverageStatus(coverage, threshold) {
  if (coverage >= threshold) return 'good';
  if (coverage >= threshold * 0.8) return 'warning';
  return 'danger';
}

/**
 * Generate HTML report
 */
function generateHTMLReport() {
  const summary = coverageData.summary;

  // Generate trend data for charts
  const trendLabels = coverageData.trends.map(t => new Date(t.timestamp).toLocaleDateString());
  const trendLineCoverage = coverageData.trends.map(t => t.coverage?.line_percentage || 0);
  const trendBranchCoverage = coverageData.trends.map(t => t.coverage?.branch_percentage || 0);

  // Package coverage analysis
  const controllerPackages = coverageData.packages.filter(p => p.name.includes('controller'));
  const servicePackages = coverageData.packages.filter(p => p.name.includes('service'));
  const otherPackages = coverageData.packages.filter(p => !p.name.includes('controller') && !p.name.includes('service'));

  const avgControllerCoverage = controllerPackages.length > 0
    ? controllerPackages.reduce((sum, p) => sum + p.line, 0) / controllerPackages.length
    : 0;

  const avgServiceCoverage = servicePackages.length > 0
    ? servicePackages.reduce((sum, p) => sum + p.line, 0) / servicePackages.length
    : 0;

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

        .header .timestamp {
            opacity: 0.9;
            font-size: 0.9em;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .summary-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
        }

        .summary-card.line::before { background: #28a745; }
        .summary-card.branch::before { background: #007bff; }
        .summary-card.method::before { background: #ffc107; }
        .summary-card.class::before { background: #dc3545; }
        .summary-card.instruction::before { background: #6f42c1; }

        .summary-card h3 {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }

        .summary-card .value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .summary-card .threshold {
            font-size: 0.8em;
            color: #666;
        }

        .status-good { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-danger { color: #dc3545; }

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

        .packages-section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }

        .package-category {
            margin-bottom: 30px;
        }

        .package-category h3 {
            color: #333;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e9ecef;
        }

        .package-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .package-table th,
        .package-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }

        .package-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
        }

        .package-table tr:hover {
            background: #f8f9fa;
        }

        .coverage-bar {
            position: relative;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
        }

        .coverage-fill {
            height: 100%;
            border-radius: 10px;
            transition: width 0.3s ease;
        }

        .coverage-fill.good { background: #28a745; }
        .coverage-fill.warning { background: #ffc107; }
        .coverage-fill.danger { background: #dc3545; }

        .coverage-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 12px;
            font-weight: bold;
            color: white;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
        }

        .classes-section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }

        .class-item {
            border: 1px solid #e9ecef;
            border-radius: 5px;
            margin-bottom: 10px;
            padding: 15px;
        }

        .class-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .class-name {
            font-weight: bold;
            color: #333;
        }

        .class-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 10px;
            font-size: 0.9em;
        }

        .metric {
            text-align: center;
        }

        .metric-label {
            color: #666;
            font-size: 0.8em;
        }

        .metric-value {
            font-weight: bold;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }

        .tab-container {
            margin-bottom: 20px;
        }

        .tab-buttons {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 1px solid #e9ecef;
        }

        .tab-btn {
            padding: 10px 20px;
            border: none;
            background: none;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            font-weight: 500;
            color: #666;
        }

        .tab-btn.active {
            color: #007bff;
            border-bottom-color: #007bff;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
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
                grid-template-columns: repeat(2, 1fr);
            }

            .charts-section {
                grid-template-columns: 1fr;
            }

            .package-table {
                font-size: 0.8em;
            }

            .class-metrics {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${CONFIG.title}</h1>
            <div class="timestamp">Generated on ${new Date().toLocaleString()}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card line">
                <h3>Line Coverage</h3>
                <div class="value status-${getCoverageStatus(summary.lineCoverage, coverageData.thresholds.line)}">${summary.lineCoverage.toFixed(1)}%</div>
                <div class="threshold">Threshold: ${coverageData.thresholds.line}%</div>
            </div>
            <div class="summary-card branch">
                <h3>Branch Coverage</h3>
                <div class="value status-${getCoverageStatus(summary.branchCoverage, coverageData.thresholds.branch)}">${summary.branchCoverage.toFixed(1)}%</div>
                <div class="threshold">Threshold: ${coverageData.thresholds.branch}%</div>
            </div>
            <div class="summary-card method">
                <h3>Method Coverage</h3>
                <div class="value status-${getCoverageStatus(summary.methodCoverage, coverageData.thresholds.method)}">${summary.methodCoverage.toFixed(1)}%</div>
                <div class="threshold">Threshold: ${coverageData.thresholds.method}%</div>
            </div>
            <div class="summary-card class">
                <h3>Class Coverage</h3>
                <div class="value status-${getCoverageStatus(summary.classCoverage, coverageData.thresholds.class)}">${summary.classCoverage.toFixed(1)}%</div>
                <div class="threshold">Threshold: ${coverageData.thresholds.class}%</div>
            </div>
            <div class="summary-card instruction">
                <h3>Instruction Coverage</h3>
                <div class="value status-${getCoverageStatus(summary.instructionCoverage, coverageData.thresholds.instruction)}">${summary.instructionCoverage.toFixed(1)}%</div>
                <div class="threshold">Threshold: ${coverageData.thresholds.instruction}%</div>
            </div>
        </div>

        <div class="charts-section">
            <div class="chart-container">
                <h2>Coverage Trend</h2>
                <canvas id="trendChart" width="500" height="300"></canvas>
            </div>
            <div class="chart-container">
                <h2>Coverage Distribution</h2>
                <canvas id="distributionChart" width="500" height="300"></canvas>
            </div>
        </div>

        <div class="packages-section">
            <h2>Package Coverage Analysis</h2>

            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="showTab('all')">All Packages</button>
                    <button class="tab-btn" onclick="showTab('controller')">Controller Packages</button>
                    <button class="tab-btn" onclick="showTab('service')">Service Packages</button>
                    <button class="tab-btn" onclick="showTab('other')">Other Packages</button>
                </div>

                <div id="all" class="tab-content active">
                    <table class="package-table">
                        <thead>
                            <tr>
                                <th>Package</th>
                                <th>Line Coverage</th>
                                <th>Branch Coverage</th>
                                <th>Method Coverage</th>
                                <th>Class Coverage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${coverageData.packages.map(pkg => `
                                <tr>
                                    <td>${pkg.name}</td>
                                    <td>
                                        <div class="coverage-bar">
                                            <div class="coverage-fill ${getCoverageStatus(pkg.line, coverageData.thresholds.line)}" style="width: ${pkg.line}%"></div>
                                            <div class="coverage-text">${pkg.line.toFixed(1)}%</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="coverage-bar">
                                            <div class="coverage-fill ${getCoverageStatus(pkg.branch, coverageData.thresholds.branch)}" style="width: ${pkg.branch}%"></div>
                                            <div class="coverage-text">${pkg.branch.toFixed(1)}%</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="coverage-bar">
                                            <div class="coverage-fill ${getCoverageStatus(pkg.method, coverageData.thresholds.method)}" style="width: ${pkg.method}%"></div>
                                            <div class="coverage-text">${pkg.method.toFixed(1)}%</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="coverage-bar">
                                            <div class="coverage-fill ${getCoverageStatus(pkg.class, coverageData.thresholds.class)}" style="width: ${pkg.class}%"></div>
                                            <div class="coverage-text">${pkg.class.toFixed(1)}%</div>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div id="controller" class="tab-content">
                    <div class="package-category">
                        <h3>Controller Packages (Avg: ${avgControllerCoverage.toFixed(1)}%)</h3>
                        <table class="package-table">
                            <thead>
                                <tr>
                                    <th>Package</th>
                                    <th>Line Coverage</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${controllerPackages.map(pkg => `
                                    <tr>
                                        <td>${pkg.name}</td>
                                        <td>
                                            <div class="coverage-bar">
                                                <div class="coverage-fill ${getCoverageStatus(pkg.line, coverageData.thresholds.controller)}" style="width: ${pkg.line}%"></div>
                                                <div class="coverage-text">${pkg.line.toFixed(1)}%</div>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="service" class="tab-content">
                    <div class="package-category">
                        <h3>Service Packages (Avg: ${avgServiceCoverage.toFixed(1)}%)</h3>
                        <table class="package-table">
                            <thead>
                                <tr>
                                    <th>Package</th>
                                    <th>Line Coverage</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${servicePackages.map(pkg => `
                                    <tr>
                                        <td>${pkg.name}</td>
                                        <td>
                                            <div class="coverage-bar">
                                                <div class="coverage-fill ${getCoverageStatus(pkg.line, coverageData.thresholds.service)}" style="width: ${pkg.line}%"></div>
                                                <div class="coverage-text">${pkg.line.toFixed(1)}%</div>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="other" class="tab-content">
                    <table class="package-table">
                        <thead>
                            <tr>
                                <th>Package</th>
                                <th>Line Coverage</th>
                                <th>Branch Coverage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${otherPackages.map(pkg => `
                                <tr>
                                    <td>${pkg.name}</td>
                                    <td>
                                        <div class="coverage-bar">
                                            <div class="coverage-fill ${getCoverageStatus(pkg.line, coverageData.thresholds.line)}" style="width: ${pkg.line}%"></div>
                                            <div class="coverage-text">${pkg.line.toFixed(1)}%</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="coverage-bar">
                                            <div class="coverage-fill ${getCoverageStatus(pkg.branch, coverageData.thresholds.branch)}" style="width: ${pkg.branch}%"></div>
                                            <div class="coverage-text">${pkg.branch.toFixed(1)}%</div>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="classes-section">
            <h2>Lowest Coverage Classes (Top 20)</h2>
            ${coverageData.classes
                .sort((a, b) => a.line - b.line)
                .slice(0, 20)
                .map(cls => `
                <div class="class-item">
                    <div class="class-header">
                        <div class="class-name">${cls.fullName}</div>
                        <div class="class-metrics">
                            <div class="metric">
                                <div class="metric-label">Lines</div>
                                <div class="metric-value status-${getCoverageStatus(cls.line, coverageData.thresholds.line)}">${cls.line.toFixed(1)}%</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">Branches</div>
                                <div class="metric-value status-${getCoverageStatus(cls.branch, coverageData.thresholds.branch)}">${cls.branch.toFixed(1)}%</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">Methods</div>
                                <div class="metric-value status-${getCoverageStatus(cls.method, coverageData.thresholds.method)}">${cls.method.toFixed(1)}%</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">Instructions</div>
                                <div class="metric-value status-${getCoverageStatus(cls.instruction, coverageData.thresholds.instruction)}">${cls.instruction.toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="footer">
            <p>Report generated by HTML Coverage Report Generator v1.0.0</p>
            <p>Coverage data from: ${CONFIG.inputFile}</p>
        </div>
    </div>

    <script>
        // Coverage trend chart
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(trendLabels)},
                datasets: [{
                    label: 'Line Coverage (%)',
                    data: ${JSON.stringify(trendLineCoverage)},
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.1
                }, {
                    label: 'Branch Coverage (%)',
                    data: ${JSON.stringify(trendBranchCoverage)},
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
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Coverage distribution chart
        const distributionCtx = document.getElementById('distributionChart').getContext('2d');
        new Chart(distributionCtx, {
            type: 'radar',
            data: {
                labels: ['Line', 'Branch', 'Method', 'Class', 'Instruction'],
                datasets: [{
                    label: 'Current Coverage',
                    data: [${summary.lineCoverage}, ${summary.branchCoverage}, ${summary.methodCoverage}, ${summary.classCoverage}, ${summary.instructionCoverage}],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    pointBackgroundColor: '#007bff'
                }, {
                    label: 'Thresholds',
                    data: [${coverageData.thresholds.line}, ${coverageData.thresholds.branch}, ${coverageData.thresholds.method}, ${coverageData.thresholds.class}, ${coverageData.thresholds.instruction}],
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
                }
            }
        });

        // Tab switching functionality
        function showTab(tabName) {
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));

            // Remove active class from all tab buttons
            const tabButtons = document.querySelectorAll('.tab-btn');
            tabButtons.forEach(button => button.classList.remove('active'));

            // Show selected tab content
            document.getElementById(tabName).classList.add('active');

            // Add active class to clicked button
            event.target.classList.add('active');
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
    console.log('🚀 Starting HTML Coverage Report Generation...');

    // Load thresholds
    loadThresholds();

    // Parse coverage report
    console.log(`📄 Processing coverage report: ${CONFIG.inputFile}`);
    const parsedData = await parseCoverageReport(CONFIG.inputFile);

    // Analyze data
    analyzeCoverageData(parsedData);

    console.log(`✅ Analyzed ${coverageData.packages.length} packages, ${coverageData.classes.length} classes`);

    // Generate HTML report
    const htmlContent = generateHTMLReport();

    // Write report to file
    const outputDir = path.dirname(CONFIG.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(CONFIG.outputFile, htmlContent, 'utf8');

    console.log(`🎉 HTML coverage report generated: ${CONFIG.outputFile}`);
    console.log(`📊 Summary: Line=${coverageData.summary.lineCoverage.toFixed(1)}%, Branch=${coverageData.summary.branchCoverage.toFixed(1)}%, Method=${coverageData.summary.methodCoverage.toFixed(1)}%, Class=${coverageData.summary.classCoverage.toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error generating HTML coverage report:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
