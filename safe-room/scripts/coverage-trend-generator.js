#!/usr/bin/env node

/**
 * Coverage Trend Generator
 * Generates coverage trend visualizations from historical data
 */

const fs = require('fs');
const path = require('path');

class CoverageTrendGenerator {
    constructor() {
        this.coverageHistoryDir = path.join(__dirname, '..', 'springboot1ngh61a2', 'coverage-history');
        this.outputDir = path.join(__dirname, '..', 'docs');
        this.ensureDirectories();
    }

    ensureDirectories() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    loadCoverageData() {
        const data = [];
        if (!fs.existsSync(this.coverageHistoryDir)) {
            console.log('No coverage history directory found');
            return data;
        }

        const files = fs.readdirSync(this.coverageHistoryDir)
            .filter(file => file.startsWith('coverage_') && file.endsWith('.json'))
            .sort();

        for (const file of files) {
            try {
                const filePath = path.join(this.coverageHistoryDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const coverageData = JSON.parse(content);
                data.push(coverageData);
            } catch (error) {
                console.error(`Error reading coverage file ${file}:`, error.message);
            }
        }

        // Sort by timestamp
        return data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    generateTrendData(coverageData) {
        const trendData = {
            labels: [],
            lineCoverage: [],
            branchCoverage: [],
            timestamps: [],
            commits: []
        };

        coverageData.forEach(item => {
            trendData.labels.push(new Date(item.timestamp).toLocaleDateString());
            trendData.lineCoverage.push(item.line_coverage || 0);
            trendData.branchCoverage.push(item.branch_coverage || 0);
            trendData.timestamps.push(item.timestamp);
            trendData.commits.push(item.commit ? item.commit.substring(0, 7) : 'unknown');
        });

        return trendData;
    }

    generateHTMLReport(trendData, coverageData) {
        const latestData = coverageData[coverageData.length - 1] || {};
        const previousData = coverageData[coverageData.length - 2] || {};

        const lineChange = latestData.line_coverage - (previousData.line_coverage || 0);
        const branchChange = latestData.branch_coverage - (previousData.branch_coverage || 0);

        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spring Boot Schema - Coverage Trend Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #007bff;
        }
        .metric-label {
            color: #666;
            margin-top: 5px;
        }
        .change {
            font-size: 0.8em;
            margin-top: 5px;
        }
        .change.positive { color: #28a745; }
        .change.negative { color: #dc3545; }
        .chart-container {
            position: relative;
            height: 400px;
            margin-bottom: 30px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
        }
        .data-table th, .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .data-table th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        .build-link {
            color: #007bff;
            text-decoration: none;
        }
        .build-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏗️ Spring Boot Schema - Coverage Trend Report</h1>
            <p>代码覆盖率趋势分析报告</p>
            <p><small>Generated on ${new Date().toLocaleString('zh-CN')}</small></p>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${latestData.line_coverage || 0}%</div>
                <div class="metric-label">Line Coverage</div>
                <div class="change ${lineChange >= 0 ? 'positive' : 'negative'}">
                    ${lineChange >= 0 ? '+' : ''}${lineChange.toFixed(1)}%
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${latestData.branch_coverage || 0}%</div>
                <div class="metric-label">Branch Coverage</div>
                <div class="change ${branchChange >= 0 ? 'positive' : 'negative'}">
                    ${branchChange >= 0 ? '+' : ''}${branchChange.toFixed(1)}%
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${coverageData.length}</div>
                <div class="metric-label">Total Builds</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${latestData.branch || 'N/A'}</div>
                <div class="metric-label">Current Branch</div>
            </div>
        </div>

        <div class="chart-container">
            <canvas id="coverageChart"></canvas>
        </div>

        <h2>📊 Coverage History</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Commit</th>
                    <th>Line Coverage</th>
                    <th>Branch Coverage</th>
                    <th>Branch</th>
                    <th>Build</th>
                </tr>
            </thead>
            <tbody>
                ${coverageData.slice(-10).reverse().map(item => `
                    <tr>
                        <td>${new Date(item.timestamp).toLocaleDateString('zh-CN')}</td>
                        <td><code>${item.commit ? item.commit.substring(0, 7) : 'unknown'}</code></td>
                        <td>${item.line_coverage || 0}%</td>
                        <td>${item.branch_coverage || 0}%</td>
                        <td>${item.branch || 'N/A'}</td>
                        <td><a href="${item.build_url || '#'}" class="build-link" target="_blank">View Build</a></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <script>
        const ctx = document.getElementById('coverageChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(trendData.labels)},
                datasets: [{
                    label: 'Line Coverage (%)',
                    data: ${JSON.stringify(trendData.lineCoverage)},
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }, {
                    label: 'Branch Coverage (%)',
                    data: ${JSON.stringify(trendData.branchCoverage)},
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Coverage Trend Over Time'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Coverage Percentage (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;
    }

    generateMarkdownReport(trendData, coverageData) {
        const latestData = coverageData[coverageData.length - 1] || {};
        const previousData = coverageData[coverageData.length - 2] || {};

        const lineChange = latestData.line_coverage - (previousData.line_coverage || 0);
        const branchChange = latestData.branch_coverage - (previousData.branch_coverage || 0);

        return `# Coverage Trend Report

## Overview

This report shows the code coverage trends for the Spring Boot Schema project.

### Current Metrics

| Metric | Current Value | Change |
|--------|---------------|---------|
| Line Coverage | ${latestData.line_coverage || 0}% | ${lineChange >= 0 ? '+' : ''}${lineChange.toFixed(1)}% |
| Branch Coverage | ${latestData.branch_coverage || 0}% | ${branchChange >= 0 ? '+' : ''}${branchChange.toFixed(1)}% |
| Total Builds | ${coverageData.length} | - |
| Current Branch | ${latestData.branch || 'N/A'} | - |

## Coverage Thresholds

- **Line Coverage**: ≥65%
- **Branch Coverage**: ≥45%
- **Instruction Coverage**: ≥65%
- **Method Coverage**: ≥75%
- **Class Coverage**: ≥90%

## Recent Coverage History

| Date | Commit | Line Coverage | Branch Coverage | Branch | Build Link |
|------|--------|---------------|-----------------|---------|------------|
${coverageData.slice(-10).reverse().map(item =>
    `| ${new Date(item.timestamp).toLocaleDateString('zh-CN')} | ${item.commit ? item.commit.substring(0, 7) : 'unknown'} | ${item.line_coverage || 0}% | ${item.branch_coverage || 0}% | ${item.branch || 'N/A'} | [View](${item.build_url || '#'}) |`
).join('\n')}

## Trend Analysis

### Coverage Goals
- **Short-term (3 months)**: Achieve 65% line coverage, 45% branch coverage
- **Medium-term (6 months)**: Reach 75% line coverage, 60% branch coverage
- **Long-term (12 months)**: Maintain 80%+ coverage across all metrics

### Recommendations
1. **Focus on Controller layer**: Currently at ~7% coverage, target 30%
2. **Improve Service layer testing**: Current ~13% coverage, target 60%
3. **Add integration tests**: Use Testcontainers for database testing
4. **Regular monitoring**: Track coverage trends weekly

## Methodology

Coverage data is collected from:
- JaCoCo reports generated during CI/CD pipeline
- Automated test execution on each push/PR
- Historical data stored in \`coverage-history/\` directory

---

*Report generated on ${new Date().toLocaleString('zh-CN')}*
*Generated by coverage-trend-generator.js*`;
    }

    generateReports() {
        const coverageData = this.loadCoverageData();
        const trendData = this.generateTrendData(coverageData);

        // Generate HTML report
        const htmlReport = this.generateHTMLReport(trendData, coverageData);
        const htmlPath = path.join(this.outputDir, 'coverage-trend-report.html');
        fs.writeFileSync(htmlPath, htmlReport, 'utf8');
        console.log(`HTML report generated: ${htmlPath}`);

        // Generate Markdown report
        const markdownReport = this.generateMarkdownReport(trendData, coverageData);
        const markdownPath = path.join(this.outputDir, 'COVERAGE_TREND.md');
        fs.writeFileSync(markdownPath, markdownReport, 'utf8');
        console.log(`Markdown report generated: ${markdownPath}`);
    }

    static run() {
        const generator = new CoverageTrendGenerator();
        generator.generateReports();
    }
}

// Run if called directly
if (require.main === module) {
    CoverageTrendGenerator.run();
}

module.exports = CoverageTrendGenerator;
