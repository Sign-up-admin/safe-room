#!/usr/bin/env node

/**
 * Enhanced Test Report Generator
 *
 * Generates interactive HTML reports with real-time updates, advanced charts, and export functionality
 * Features:
 * - Real-time data updates via WebSocket
 * - Interactive Chart.js visualizations
 * - PDF and Excel export
 * - Responsive design
 * - Trend analysis and forecasting
 */

const fs = require('fs')
const path = require('path')

class EnhancedReportGenerator {
  constructor(options = {}) {
    this.options = {
      dataDir: options.dataDir || path.join(process.cwd(), 'test-results'),
      outputDir: options.outputDir || path.join(process.cwd(), 'reports'),
      serverUrl: options.serverUrl || 'http://localhost:3000',
      enableRealtime: options.enableRealtime !== false,
      theme: options.theme || 'light',
      refreshInterval: options.refreshInterval || 30000,
      exportFormats: options.exportFormats || ['pdf', 'excel', 'json'],
      ...options
    }

    this.templates = {
      light: this.getLightTheme(),
      dark: this.getDarkTheme()
    }

    // 确保输出目录存在
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true })
    }
  }

  /**
   * 生成完整的HTML报告
   */
  async generateReport(reportType = 'dashboard', data = null, options = {}) {
    const {
      title = 'Enhanced Test Report',
      includeCharts = true,
      includeRealtime = this.options.enableRealtime,
      includeExport = true
    } = options

    // 加载数据（如果没有提供）
    const reportData = data || await this.loadReportData()

    // 生成HTML内容
    const htmlContent = this.generateHTMLContent(reportType, reportData, {
      title,
      includeCharts,
      includeRealtime,
      includeExport
    })

    // 保存报告
    const outputPath = path.join(this.options.outputDir, `${reportType}-report.html`)
    fs.writeFileSync(outputPath, htmlContent, 'utf8')

    console.log(`✅ Enhanced ${reportType} report generated: ${outputPath}`)
    return outputPath
  }

  /**
   * 加载报告数据
   */
  async loadReportData() {
    // 这里应该从测试结果收集器和聚合器加载数据
    // 暂时返回模拟数据
    return {
      summary: {
        totalTests: 150,
        passedTests: 135,
        failedTests: 12,
        skippedTests: 3,
        successRate: 90,
        avgDuration: 45000,
        coverage: {
          lines: 85.5,
          functions: 88.2,
          branches: 79.3,
          statements: 86.1
        }
      },
      frameworks: {
        vitest: {
          runs: 5,
          tests: 120,
          passed: 108,
          failed: 10,
          skipped: 2,
          successRate: 90,
          avgDuration: 35000
        },
        playwright: {
          runs: 3,
          tests: 30,
          passed: 27,
          failed: 2,
          skipped: 1,
          successRate: 90,
          avgDuration: 65000
        }
      },
      trends: {
        successRate: this.generateTrendData(30, 85, 95, 'successRate'),
        duration: this.generateTrendData(30, 40000, 50000, 'duration'),
        coverage: this.generateTrendData(30, 80, 90, 'coverage')
      },
      alerts: [
        {
          id: 'coverage-drop',
          type: 'warning',
          severity: 'medium',
          title: '覆盖率下降',
          message: '行覆盖率从88%下降到85.5%',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ],
      recommendations: [
        {
          type: 'coverage',
          priority: 'medium',
          title: '提高代码覆盖率',
          description: '分支覆盖率低于80%，建议增加条件分支测试'
        },
        {
          type: 'performance',
          priority: 'low',
          title: '优化测试执行时间',
          description: '平均执行时间略有增加，考虑并行执行'
        }
      ],
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * 生成HTML内容
   */
  generateHTMLContent(reportType, data, options) {
    const { title, includeCharts, includeRealtime, includeExport } = options

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3"></script>

    <!-- Export libraries -->
    ${includeExport ? `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    ` : ''}

    <!-- Socket.IO for real-time updates -->
    ${includeRealtime ? `<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>` : ''}

    <style>
        ${this.templates[this.options.theme]}

        /* Real-time indicator */
        .realtime-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000;
        }

        .realtime-indicator.connected {
            background: #28a745;
            color: white;
        }

        .realtime-indicator.disconnected {
            background: #dc3545;
            color: white;
        }

        .realtime-indicator.connecting {
            background: #ffc107;
            color: #212529;
        }

        /* Export buttons */
        .export-buttons {
            position: fixed;
            top: 20px;
            left: 20px;
            display: flex;
            gap: 10px;
            z-index: 1000;
        }

        .export-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }

        .export-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .export-btn.pdf { background: #dc3545; color: white; }
        .export-btn.excel { background: #28a745; color: white; }
        .export-btn.json { background: #007bff; color: white; }

        /* Loading overlay */
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }

        .loading-overlay.dark {
            background: rgba(33, 37, 41, 0.8);
        }

        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Responsive charts */
        .chart-container {
            position: relative;
            height: 400px;
            width: 100%;
        }

        @media (max-width: 768px) {
            .chart-container {
                height: 300px;
            }
        }
    </style>
</head>
<body>
    <!-- Export Buttons -->
    ${includeExport ? `
    <div class="export-buttons">
        <button class="export-btn pdf" onclick="exportReport('pdf')">
            📄 导出PDF
        </button>
        <button class="export-btn excel" onclick="exportReport('excel')">
            📊 导出Excel
        </button>
        <button class="export-btn json" onclick="exportReport('json')">
            📋 导出JSON
        </button>
    </div>
    ` : ''}

    <!-- Real-time Status Indicator -->
    ${includeRealtime ? `
    <div id="realtime-indicator" class="realtime-indicator disconnected">
        🔴 离线
    </div>
    ` : ''}

    <!-- Loading Overlay -->
    <div id="loading-overlay" class="loading-overlay ${this.options.theme}">
        <div class="loading-spinner"></div>
    </div>

    <!-- Main Content -->
    <div class="container">
        <header class="header">
            <h1>${title}</h1>
            <div class="header-meta">
                <span>生成时间: ${new Date(data.generatedAt).toLocaleString('zh-CN')}</span>
                <span id="last-update">最后更新: ${new Date().toLocaleString('zh-CN')}</span>
            </div>
        </header>

        <!-- Summary Cards -->
        <section class="summary-section">
            <div class="metric-grid">
                <div class="metric-card">
                    <h3>测试总数</h3>
                    <div class="metric-value">${data.summary.totalTests}</div>
                    <div class="metric-trend" id="total-tests-trend"></div>
                </div>
                <div class="metric-card">
                    <h3>成功率</h3>
                    <div class="metric-value">${data.summary.successRate}%</div>
                    <div class="metric-trend" id="success-rate-trend"></div>
                </div>
                <div class="metric-card">
                    <h3>覆盖率</h3>
                    <div class="metric-value">${data.summary.coverage.lines}%</div>
                    <div class="metric-trend" id="coverage-trend"></div>
                </div>
                <div class="metric-card">
                    <h3>平均耗时</h3>
                    <div class="metric-value">${Math.round(data.summary.avgDuration / 1000)}s</div>
                    <div class="metric-trend" id="duration-trend"></div>
                </div>
            </div>
        </section>

        <!-- Charts Section -->
        ${includeCharts ? `
        <section class="charts-section">
            <div class="chart-grid">
                <div class="chart-card">
                    <h3>成功率趋势</h3>
                    <div class="chart-container">
                        <canvas id="successRateChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h3>覆盖率趋势</h3>
                    <div class="chart-container">
                        <canvas id="coverageChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h3>执行时间趋势</h3>
                    <div class="chart-container">
                        <canvas id="durationChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h3>框架对比</h3>
                    <div class="chart-container">
                        <canvas id="frameworkChart"></canvas>
                    </div>
                </div>
            </div>
        </section>
        ` : ''}

        <!-- Details Section -->
        <section class="details-section">
            <div class="details-grid">
                <!-- Framework Details -->
                <div class="detail-card">
                    <h3>框架详情</h3>
                    <div id="framework-details">
                        ${this.generateFrameworkDetailsHTML(data.frameworks)}
                    </div>
                </div>

                <!-- Alerts -->
                <div class="detail-card">
                    <h3>警报 (${data.alerts.length})</h3>
                    <div id="alerts-list">
                        ${this.generateAlertsHTML(data.alerts)}
                    </div>
                </div>

                <!-- Recommendations -->
                <div class="detail-card">
                    <h3>建议</h3>
                    <div id="recommendations-list">
                        ${this.generateRecommendationsHTML(data.recommendations)}
                    </div>
                </div>

                <!-- Coverage Details -->
                <div class="detail-card">
                    <h3>覆盖率详情</h3>
                    <div id="coverage-details">
                        ${this.generateCoverageDetailsHTML(data.summary.coverage)}
                    </div>
                </div>
            </div>
        </section>
    </div>

    <!-- Scripts -->
    <script>
        // Report data
        const reportData = ${JSON.stringify(data)};
        const reportOptions = ${JSON.stringify({
          includeCharts,
          includeRealtime,
          includeExport,
          theme: this.options.theme,
          refreshInterval: this.options.refreshInterval
        })};

        // Initialize report
        document.addEventListener('DOMContentLoaded', function() {
            ${includeCharts ? 'initializeCharts();' : ''}
            ${includeRealtime ? 'initializeRealtime();' : ''}
            ${includeExport ? 'initializeExport();' : ''}

            updateTimestamps();
        });

        ${includeCharts ? this.generateChartScripts(data) : ''}

        ${includeRealtime ? this.generateRealtimeScripts() : ''}

        ${includeExport ? this.generateExportScripts() : ''}

        // Update timestamps
        function updateTimestamps() {
            const now = new Date().toLocaleString('zh-CN');
            document.getElementById('last-update').textContent = '最后更新: ' + now;
        }
    </script>
</body>
</html>`
  }

  /**
   * 生成图表脚本
   */
  generateChartScripts(data) {
    return `
        function initializeCharts() {
            // Success Rate Chart
            const successRateCtx = document.getElementById('successRateChart').getContext('2d');
            new Chart(successRateCtx, {
                type: 'line',
                data: {
                    labels: reportData.trends.successRate.map(d => new Date(d.date).toLocaleDateString('zh-CN')),
                    datasets: [{
                        label: '成功率 (%)',
                        data: reportData.trends.successRate.map(d => d.value),
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 70,
                            max: 100
                        }
                    }
                }
            });

            // Coverage Chart
            const coverageCtx = document.getElementById('coverageChart').getContext('2d');
            new Chart(coverageCtx, {
                type: 'line',
                data: {
                    labels: reportData.trends.coverage.map(d => new Date(d.date).toLocaleDateString('zh-CN')),
                    datasets: [{
                        label: '行覆盖率 (%)',
                        data: reportData.trends.coverage.map(d => d.value),
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 70,
                            max: 100
                        }
                    }
                }
            });

            // Duration Chart
            const durationCtx = document.getElementById('durationChart').getContext('2d');
            new Chart(durationCtx, {
                type: 'line',
                data: {
                    labels: reportData.trends.duration.map(d => new Date(d.date).toLocaleDateString('zh-CN')),
                    datasets: [{
                        label: '执行时间 (ms)',
                        data: reportData.trends.duration.map(d => d.value),
                        borderColor: '#ffc107',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });

            // Framework Comparison Chart
            const frameworkCtx = document.getElementById('frameworkChart').getContext('2d');
            const frameworks = Object.keys(reportData.frameworks);

            new Chart(frameworkCtx, {
                type: 'bar',
                data: {
                    labels: frameworks,
                    datasets: [{
                        label: '成功率 (%)',
                        data: frameworks.map(fw => reportData.frameworks[fw].successRate),
                        backgroundColor: '#28a745'
                    }, {
                        label: '测试数量',
                        data: frameworks.map(fw => reportData.frameworks[fw].tests),
                        backgroundColor: '#007bff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    `
  }

  /**
   * 生成实时更新脚本
   */
  generateRealtimeScripts() {
    return `
        let socket;

        function initializeRealtime() {
            const indicator = document.getElementById('realtime-indicator');

            socket = io('${this.options.serverUrl}');

            socket.on('connect', function() {
                indicator.className = 'realtime-indicator connected';
                indicator.textContent = '🟢 在线';
                console.log('Connected to dashboard server');
            });

            socket.on('disconnect', function() {
                indicator.className = 'realtime-indicator disconnected';
                indicator.textContent = '🔴 离线';
                console.log('Disconnected from dashboard server');
            });

            socket.on('connect_error', function(error) {
                indicator.className = 'realtime-indicator connecting';
                indicator.textContent = '🟡 连接中...';
                console.error('Connection error:', error);
            });

            // Subscribe to updates
            socket.emit('subscribe', ['dashboard', 'alerts']);

            // Handle real-time updates
            socket.on('stats-update', function(data) {
                updateRealtimeStats(data);
            });

            socket.on('alerts-update', function(data) {
                updateRealtimeAlerts(data);
            });

            // Periodic refresh fallback
            setInterval(function() {
                if (socket.disconnected) {
                    refreshData();
                }
            }, reportOptions.refreshInterval);
        }

        function updateRealtimeStats(data) {
            // Update metric values
            const successRateElement = document.querySelector('.metric-card:nth-child(2) .metric-value');
            if (successRateElement) {
                successRateElement.textContent = data.successRate + '%';
            }

            updateTimestamps();
        }

        function updateRealtimeAlerts(data) {
            const alertsContainer = document.getElementById('alerts-list');
            if (alertsContainer && data.alerts) {
                alertsContainer.innerHTML = generateAlertsHTML(data.alerts);
            }
        }

        function refreshData() {
            // Fallback data refresh when WebSocket is disconnected
            updateTimestamps();
        }
    `
  }

  /**
   * 生成导出脚本
   */
  generateExportScripts() {
    return `
        function initializeExport() {
            // Export functions are available globally
            window.exportReport = exportReport;
        }

        async function exportReport(format) {
            const loading = document.getElementById('loading-overlay');
            loading.style.display = 'flex';

            try {
                switch (format) {
                    case 'pdf':
                        await exportToPDF();
                        break;
                    case 'excel':
                        exportToExcel();
                        break;
                    case 'json':
                        exportToJSON();
                        break;
                }
            } catch (error) {
                console.error('Export failed:', error);
                alert('导出失败: ' + error.message);
            } finally {
                loading.style.display = 'none';
            }
        }

        async function exportToPDF() {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Capture the dashboard as image
            const canvas = await html2canvas(document.body, {
                scale: 2,
                useCORS: true,
                allowTaint: true
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('test-report.pdf');
        }

        function exportToExcel() {
            const workbook = XLSX.utils.book_new();

            // Summary sheet
            const summaryData = [
                ['指标', '值'],
                ['测试总数', reportData.summary.totalTests],
                ['通过测试', reportData.summary.passedTests],
                ['失败测试', reportData.summary.failedTests],
                ['跳过测试', reportData.summary.skippedTests],
                ['成功率', reportData.summary.successRate + '%'],
                ['平均耗时', Math.round(reportData.summary.avgDuration / 1000) + 's'],
                ['行覆盖率', reportData.summary.coverage.lines + '%'],
                ['函数覆盖率', reportData.summary.coverage.functions + '%'],
                ['分支覆盖率', reportData.summary.coverage.branches + '%']
            ];

            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

            // Trends sheet
            const trendsData = [['日期', '成功率', '覆盖率', '执行时间']];
            const maxLength = Math.max(
                reportData.trends.successRate.length,
                reportData.trends.coverage.length,
                reportData.trends.duration.length
            );

            for (let i = 0; i < maxLength; i++) {
                trendsData.push([
                    reportData.trends.successRate[i]?.date || '',
                    reportData.trends.successRate[i]?.value || '',
                    reportData.trends.coverage[i]?.value || '',
                    reportData.trends.duration[i]?.value || ''
                ]);
            }

            const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
            XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Trends');

            XLSX.writeFile(workbook, 'test-report.xlsx');
        }

        function exportToJSON() {
            const dataStr = JSON.stringify(reportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = 'test-report.json';
            link.click();
        }
    `
  }

  /**
   * 生成框架详情HTML
   */
  generateFrameworkDetailsHTML(frameworks) {
    return Object.entries(frameworks).map(([name, stats]) => `
        <div class="framework-item">
            <h4>${name.toUpperCase()}</h4>
            <div class="framework-stats">
                <span>运行次数: ${stats.runs}</span>
                <span>测试数: ${stats.tests}</span>
                <span>成功率: ${stats.successRate}%</span>
                <span>平均耗时: ${Math.round(stats.avgDuration / 1000)}s</span>
            </div>
        </div>
    `).join('')
  }

  /**
   * 生成警报HTML
   */
  generateAlertsHTML(alerts) {
    if (alerts.length === 0) {
      return '<p class="no-data">暂无警报</p>'
    }

    return alerts.map(alert => `
        <div class="alert-item alert-${alert.severity}">
            <div class="alert-header">
                <span class="alert-title">${alert.title}</span>
                <span class="alert-time">${new Date(alert.timestamp).toLocaleString('zh-CN')}</span>
            </div>
            <p class="alert-message">${alert.message}</p>
        </div>
    `).join('')
  }

  /**
   * 生成建议HTML
   */
  generateRecommendationsHTML(recommendations) {
    if (recommendations.length === 0) {
      return '<p class="no-data">暂无建议</p>'
    }

    return recommendations.map(rec => `
        <div class="recommendation-item priority-${rec.priority}">
            <div class="recommendation-header">
                <span class="recommendation-title">${rec.title}</span>
                <span class="recommendation-priority">${rec.priority}</span>
            </div>
            <p class="recommendation-description">${rec.description}</p>
        </div>
    `).join('')
  }

  /**
   * 生成覆盖率详情HTML
   */
  generateCoverageDetailsHTML(coverage) {
    return `
        <div class="coverage-metrics">
            <div class="coverage-item">
                <span class="coverage-label">行覆盖率</span>
                <span class="coverage-value">${coverage.lines}%</span>
                <div class="coverage-bar">
                    <div class="coverage-fill" style="width: ${coverage.lines}%"></div>
                </div>
            </div>
            <div class="coverage-item">
                <span class="coverage-label">函数覆盖率</span>
                <span class="coverage-value">${coverage.functions}%</span>
                <div class="coverage-bar">
                    <div class="coverage-fill" style="width: ${coverage.functions}%"></div>
                </div>
            </div>
            <div class="coverage-item">
                <span class="coverage-label">分支覆盖率</span>
                <span class="coverage-value">${coverage.branches}%</span>
                <div class="coverage-bar">
                    <div class="coverage-fill" style="width: ${coverage.branches}%"></div>
                </div>
            </div>
            <div class="coverage-item">
                <span class="coverage-label">语句覆盖率</span>
                <span class="coverage-value">${coverage.statements}%</span>
                <div class="coverage-bar">
                    <div class="coverage-fill" style="width: ${coverage.statements}%"></div>
                </div>
            </div>
        </div>
    `
  }

  /**
   * 生成趋势数据
   */
  generateTrendData(days, minValue, maxValue, type) {
    const data = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      let value
      switch (type) {
        case 'successRate':
          value = Math.random() * (maxValue - minValue) + minValue
          break
        case 'duration':
          value = Math.random() * (maxValue - minValue) + minValue
          break
        case 'coverage':
          value = Math.random() * (maxValue - minValue) + minValue
          break
        default:
          value = Math.random() * 100
      }

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100
      })
    }

    return data
  }

  /**
   * 获取浅色主题样式
   */
  getLightTheme() {
    return `
        :root {
            --primary-color: #007bff;
            --success-color: #28a745;
            --warning-color: #ffc107;
            --danger-color: #dc3545;
            --info-color: #17a2b8;
            --background-color: #ffffff;
            --surface-color: #f8f9fa;
            --text-color: #212529;
            --border-color: #dee2e6;
            --shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--surface-color);
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: linear-gradient(135deg, var(--primary-color) 0%, #6c5ce7 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: var(--shadow);
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }

        .header-meta {
            display: flex;
            justify-content: space-between;
            opacity: 0.9;
            font-size: 0.9em;
        }

        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: var(--background-color);
            padding: 30px;
            border-radius: 12px;
            box-shadow: var(--shadow);
            text-align: center;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .metric-card h3 {
            color: #6c757d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .metric-value {
            font-size: 2.8em;
            font-weight: 700;
            margin-bottom: 8px;
            color: var(--text-color);
        }

        .metric-trend {
            font-size: 0.85em;
            color: #6c757d;
        }

        .charts-section {
            margin-bottom: 30px;
        }

        .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 20px;
        }

        .chart-card {
            background: var(--background-color);
            padding: 25px;
            border-radius: 12px;
            box-shadow: var(--shadow);
        }

        .chart-card h3 {
            margin-bottom: 20px;
            color: var(--text-color);
            font-size: 1.2em;
        }

        .details-section {
            margin-bottom: 30px;
        }

        .details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }

        .detail-card {
            background: var(--background-color);
            padding: 25px;
            border-radius: 12px;
            box-shadow: var(--shadow);
        }

        .detail-card h3 {
            margin-bottom: 20px;
            color: var(--text-color);
            font-size: 1.2em;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .framework-item {
            margin-bottom: 20px;
            padding: 15px;
            background: var(--surface-color);
            border-radius: 8px;
        }

        .framework-item h4 {
            margin-bottom: 10px;
            color: var(--primary-color);
        }

        .framework-stats {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            font-size: 0.9em;
        }

        .framework-stats span {
            background: var(--primary-color);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
        }

        .alert-item {
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid;
        }

        .alert-critical {
            background: #f8d7da;
            border-left-color: var(--danger-color);
        }

        .alert-high {
            background: #f8d7da;
            border-left-color: #dc3545;
        }

        .alert-medium {
            background: #fff3cd;
            border-left-color: var(--warning-color);
        }

        .alert-low {
            background: #d1ecf1;
            border-left-color: var(--info-color);
        }

        .alert-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .alert-title {
            font-weight: 600;
        }

        .alert-time {
            font-size: 0.8em;
            opacity: 0.7;
        }

        .recommendation-item {
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid;
        }

        .priority-critical {
            background: #f8d7da;
            border-left-color: var(--danger-color);
        }

        .priority-high {
            background: #f8d7da;
            border-left-color: #dc3545;
        }

        .priority-medium {
            background: #fff3cd;
            border-left-color: var(--warning-color);
        }

        .priority-low {
            background: #d1ecf1;
            border-left-color: var(--info-color);
        }

        .recommendation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .recommendation-title {
            font-weight: 600;
        }

        .recommendation-priority {
            font-size: 0.8em;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
            font-weight: 600;
        }

        .coverage-metrics {
            display: grid;
            gap: 15px;
        }

        .coverage-item {
            display: grid;
            grid-template-columns: 120px 60px 1fr;
            align-items: center;
            gap: 15px;
        }

        .coverage-label {
            font-weight: 500;
        }

        .coverage-value {
            font-weight: 700;
            text-align: center;
        }

        .coverage-bar {
            height: 8px;
            background: var(--surface-color);
            border-radius: 4px;
            overflow: hidden;
        }

        .coverage-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--success-color), var(--primary-color));
            border-radius: 4px;
        }

        .no-data {
            text-align: center;
            color: #6c757d;
            font-style: italic;
            padding: 20px;
        }

        @media (max-width: 768px) {
            .container {
                padding: 15px;
            }

            .header {
                padding: 30px 20px;
            }

            .header h1 {
                font-size: 2em;
            }

            .metric-grid {
                grid-template-columns: 1fr;
            }

            .chart-grid {
                grid-template-columns: 1fr;
            }

            .details-grid {
                grid-template-columns: 1fr;
            }
        }
    `
  }

  /**
   * 获取深色主题样式
   */
  getDarkTheme() {
    return `
        :root {
            --primary-color: #0d6efd;
            --success-color: #198754;
            --warning-color: #fd7e14;
            --danger-color: #dc3545;
            --info-color: #0dcaf0;
            --background-color: #1a1a1a;
            --surface-color: #2d2d2d;
            --text-color: #ffffff;
            --border-color: #404040;
            --shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        /* 继承浅色主题的所有样式，但覆盖颜色变量 */
        ${this.getLightTheme().replace(/var\(--[^)]+\)/g, match => {
          // 深色主题的颜色映射
          const colorMap = {
            'var(--primary-color)': '#0d6efd',
            'var(--success-color)': '#198754',
            'var(--warning-color)': '#fd7e14',
            'var(--danger-color)': '#dc3545',
            'var(--info-color)': '#0dcaf0',
            'var(--background-color)': '#1a1a1a',
            'var(--surface-color)': '#2d2d2d',
            'var(--text-color)': '#ffffff',
            'var(--border-color)': '#404040',
            'var(--shadow)': '0 2px 4px rgba(0,0,0,0.3)'
          }
          return colorMap[match] || match
        })}
    `
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2)

  const options = {
    reportType: args.find((arg, index) => arg === '--type' && args[index + 1])?.[index + 1] || 'dashboard',
    title: args.find((arg, index) => arg === '--title' && args[index + 1])?.[index + 1] || 'Enhanced Test Report',
    theme: args.find((arg, index) => arg === '--theme' && args[index + 1])?.[index + 1] || 'light',
    includeCharts: !args.includes('--no-charts'),
    includeRealtime: args.includes('--realtime'),
    includeExport: !args.includes('--no-export'),
    outputDir: args.find((arg, index) => arg === '--output-dir' && args[index + 1])?.[index + 1] || './reports'
  }

  const generator = new EnhancedReportGenerator(options)

  try {
    const outputPath = await generator.generateReport(options.reportType, null, options)
    console.log(`报告生成完成: ${outputPath}`)
  } catch (error) {
    console.error('报告生成失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('未处理的错误:', error)
    process.exit(1)
  })
}

module.exports = EnhancedReportGenerator
