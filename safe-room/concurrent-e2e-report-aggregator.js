#!/usr/bin/env node

/**
 * 前端E2E测试报告聚合器
 * 收集并汇总两个前端工程的测试结果
 */

const fs = require('fs');
const path = require('path');

class E2EReportAggregator {
    constructor() {
        this.adminReportPath = 'springboot1ngh61a2/src/main/resources/admin/admin/playwright-report';
        this.frontReportPath = 'springboot1ngh61a2/src/main/resources/front/front/playwright-report';
        this.outputPath = 'concurrent-e2e-report';
    }

    /**
     * 读取JSON报告文件
     */
    readJsonReport(reportPath) {
        const jsonPath = path.join(reportPath, 'results.json');
        if (!fs.existsSync(jsonPath)) {
            console.warn(`报告文件不存在: ${jsonPath}`);
            return null;
        }

        try {
            const content = fs.readFileSync(jsonPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`读取报告文件失败: ${jsonPath}`, error);
            return null;
        }
    }

    /**
     * 分析测试结果
     */
    analyzeResults(results) {
        if (!results) return null;

        const stats = {
            total: results.suites?.length || 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: results.stats?.duration || 0,
            tests: []
        };

        // 遍历所有测试套件
        results.suites?.forEach(suite => {
            suite.specs?.forEach(spec => {
                spec.tests?.forEach(test => {
                    const testResult = {
                        title: test.title,
                        file: spec.file,
                        status: test.results?.[0]?.status || 'unknown',
                        duration: test.results?.[0]?.duration || 0,
                        error: test.results?.[0]?.error?.message || null
                    };

                    stats.tests.push(testResult);

                    switch (testResult.status) {
                        case 'passed':
                            stats.passed++;
                            break;
                        case 'failed':
                            stats.failed++;
                            break;
                        case 'skipped':
                            stats.skipped++;
                            break;
                    }
                });
            });
        });

        return stats;
    }

    /**
     * 生成汇总报告
     */
    generateSummaryReport(adminResults, frontResults) {
        const adminStats = this.analyzeResults(adminResults);
        const frontStats = this.analyzeResults(frontResults);

        const summary = {
            timestamp: new Date().toISOString(),
            execution: {
                type: 'concurrent',
                projects: ['admin', 'front']
            },
            results: {
                admin: adminStats,
                front: frontStats,
                total: {
                    tests: (adminStats?.tests?.length || 0) + (frontStats?.tests?.length || 0),
                    passed: (adminStats?.passed || 0) + (frontStats?.passed || 0),
                    failed: (adminStats?.failed || 0) + (frontStats?.failed || 0),
                    skipped: (adminStats?.skipped || 0) + (frontStats?.skipped || 0),
                    duration: (adminStats?.duration || 0) + (frontStats?.duration || 0)
                }
            },
            performance: {
                admin: {
                    averageTestTime: adminStats?.tests?.length ?
                        adminStats.duration / adminStats.tests.length : 0,
                    passRate: adminStats?.total ?
                        (adminStats.passed / adminStats.total * 100).toFixed(2) : 0
                },
                front: {
                    averageTestTime: frontStats?.tests?.length ?
                        frontStats.duration / frontStats.tests.length : 0,
                    passRate: frontStats?.total ?
                        (frontStats.passed / frontStats.total * 100).toFixed(2) : 0
                },
                overall: {
                    averageTestTime: this.getOverallAverageTestTime(adminStats, frontStats),
                    passRate: this.getOverallPassRate(adminStats, frontStats)
                }
            },
            issues: this.identifyIssues(adminStats, frontStats)
        };

        return summary;
    }

    getOverallAverageTestTime(adminStats, frontStats) {
        const totalTests = (adminStats?.tests?.length || 0) + (frontStats?.tests?.length || 0);
        const totalDuration = (adminStats?.duration || 0) + (frontStats?.duration || 0);
        return totalTests ? (totalDuration / totalTests).toFixed(2) : 0;
    }

    getOverallPassRate(adminStats, frontStats) {
        const totalTests = (adminStats?.total || 0) + (frontStats?.total || 0);
        const totalPassed = (adminStats?.passed || 0) + (frontStats?.passed || 0);
        return totalTests ? (totalPassed / totalTests * 100).toFixed(2) : 0;
    }

    identifyIssues(adminStats, frontStats) {
        const issues = [];

        // 检查失败率
        if (adminStats?.failed > 0) {
            issues.push({
                type: 'failure',
                project: 'admin',
                message: `Admin前端有 ${adminStats.failed} 个测试失败`,
                severity: 'high'
            });
        }

        if (frontStats?.failed > 0) {
            issues.push({
                type: 'failure',
                project: 'front',
                message: `用户前端有 ${frontStats.failed} 个测试失败`,
                severity: 'high'
            });
        }

        // 检查性能问题
        const avgAdminTime = adminStats?.tests?.length ?
            adminStats.duration / adminStats.tests.length : 0;
        const avgFrontTime = frontStats?.tests?.length ?
            frontStats.duration / frontStats.tests.length : 0;

        if (avgAdminTime > 30000) { // 30秒
            issues.push({
                type: 'performance',
                project: 'admin',
                message: `Admin前端平均测试时间过长: ${(avgAdminTime/1000).toFixed(2)}秒`,
                severity: 'medium'
            });
        }

        if (avgFrontTime > 45000) { // 45秒
            issues.push({
                type: 'performance',
                project: 'front',
                message: `用户前端平均测试时间过长: ${(avgFrontTime/1000).toFixed(2)}秒`,
                severity: 'medium'
            });
        }

        // 检查跳过测试
        if (adminStats?.skipped > 0) {
            issues.push({
                type: 'skipped',
                project: 'admin',
                message: `Admin前端有 ${adminStats.skipped} 个测试被跳过`,
                severity: 'low'
            });
        }

        if (frontStats?.skipped > 0) {
            issues.push({
                type: 'skipped',
                project: 'front',
                message: `用户前端有 ${frontStats.skipped} 个测试被跳过`,
                severity: 'low'
            });
        }

        return issues;
    }

    /**
     * 生成HTML报告
     */
    generateHtmlReport(summary) {
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>前端E2E测试并发执行报告</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; padding: 30px; }
        .card { background: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid #007bff; }
        .card.success { border-left-color: #28a745; }
        .card.warning { border-left-color: #ffc107; }
        .card.danger { border-left-color: #dc3545; }
        .metric { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .label { font-size: 0.9em; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .projects { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 0 30px 30px; }
        .project-card { border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
        .project-header { background: #007bff; color: white; padding: 15px; font-weight: bold; }
        .project-content { padding: 20px; }
        .issues { padding: 0 30px 30px; }
        .issue { padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid; }
        .issue.high { border-left-color: #dc3545; background: #f8d7da; }
        .issue.medium { border-left-color: #ffc107; background: #fff3cd; }
        .issue.low { border-left-color: #17a2b8; background: #d1ecf1; }
        .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #e9ecef; }
        .progress-bar { background: #e9ecef; border-radius: 10px; height: 20px; margin: 10px 0; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 前端E2E测试并发执行报告</h1>
            <p>执行时间: ${new Date(summary.timestamp).toLocaleString('zh-CN')}</p>
            <p>执行模式: 并发执行 | 项目: Admin前端 + 用户前端</p>
        </div>

        <div class="summary">
            <div class="card success">
                <div class="label">总测试数</div>
                <div class="metric">${summary.results.total.tests}</div>
            </div>
            <div class="card success">
                <div class="label">通过测试</div>
                <div class="metric">${summary.results.total.passed}</div>
            </div>
            <div class="card ${summary.results.total.failed > 0 ? 'danger' : 'success'}">
                <div class="label">失败测试</div>
                <div class="metric">${summary.results.total.failed}</div>
            </div>
            <div class="card">
                <div class="label">通过率</div>
                <div class="metric">${summary.performance.overall.passRate}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${summary.performance.overall.passRate}%"></div>
                </div>
            </div>
        </div>

        <div class="projects">
            <div class="project-card">
                <div class="project-header">Admin前端测试结果</div>
                <div class="project-content">
                    <p><strong>测试总数:</strong> ${summary.results.admin?.total || 0}</p>
                    <p><strong>通过:</strong> ${summary.results.admin?.passed || 0}</p>
                    <p><strong>失败:</strong> ${summary.results.admin?.failed || 0}</p>
                    <p><strong>跳过:</strong> ${summary.results.admin?.skipped || 0}</p>
                    <p><strong>通过率:</strong> ${summary.performance.admin.passRate}%</p>
                    <p><strong>平均耗时:</strong> ${(summary.results.admin?.duration / 1000 || 0).toFixed(2)}秒</p>
                </div>
            </div>

            <div class="project-card">
                <div class="project-header">用户前端测试结果</div>
                <div class="project-content">
                    <p><strong>测试总数:</strong> ${summary.results.front?.total || 0}</p>
                    <p><strong>通过:</strong> ${summary.results.front?.passed || 0}</p>
                    <p><strong>失败:</strong> ${summary.results.front?.failed || 0}</p>
                    <p><strong>跳过:</strong> ${summary.results.front?.skipped || 0}</p>
                    <p><strong>通过率:</strong> ${summary.performance.front.passRate}%</p>
                    <p><strong>平均耗时:</strong> ${(summary.results.front?.duration / 1000 || 0).toFixed(2)}秒</p>
                </div>
            </div>
        </div>

        ${summary.issues.length > 0 ? `
        <div class="issues">
            <h3>⚠️ 发现的问题</h3>
            ${summary.issues.map(issue => `
                <div class="issue ${issue.severity}">
                    <strong>${issue.project.toUpperCase()}: </strong>${issue.message}
                </div>
            `).join('')}
        </div>
        ` : `
        <div class="issues">
            <h3>✅ 没有发现问题</h3>
            <p>所有测试均正常执行，性能指标在合理范围内。</p>
        </div>
        `}

        <div class="footer">
            <p>报告生成时间: ${new Date().toLocaleString('zh-CN')} | 并发执行优化版</p>
        </div>
    </div>
</body>
</html>`;

        return html;
    }

    /**
     * 保存报告
     */
    saveReport(summary, htmlReport) {
        // 确保输出目录存在
        if (!fs.existsSync(this.outputPath)) {
            fs.mkdirSync(this.outputPath, { recursive: true });
        }

        // 保存JSON报告
        const jsonPath = path.join(this.outputPath, 'concurrent-e2e-summary.json');
        fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), 'utf8');

        // 保存HTML报告
        const htmlPath = path.join(this.outputPath, 'concurrent-e2e-report.html');
        fs.writeFileSync(htmlPath, htmlReport, 'utf8');

        console.log(`📊 汇总报告已保存:`);
        console.log(`   JSON: ${jsonPath}`);
        console.log(`   HTML: ${htmlPath}`);

        return { jsonPath, htmlPath };
    }

    /**
     * 主执行方法
     */
    async run() {
        console.log('🔄 开始聚合前端E2E测试报告...');

        // 读取两个项目的报告
        const adminResults = this.readJsonReport(this.adminReportPath);
        const frontResults = this.readJsonReport(this.frontReportPath);

        if (!adminResults && !frontResults) {
            console.error('❌ 未找到任何测试报告文件');
            process.exit(1);
        }

        // 生成汇总报告
        const summary = this.generateSummaryReport(adminResults, frontResults);
        const htmlReport = this.generateHtmlReport(summary);

        // 保存报告
        const paths = this.saveReport(summary, htmlReport);

        // 输出控制台摘要
        console.log('\n📈 执行摘要:');
        console.log(`   总测试数: ${summary.results.total.tests}`);
        console.log(`   通过: ${summary.results.total.passed}`);
        console.log(`   失败: ${summary.results.total.failed}`);
        console.log(`   通过率: ${summary.performance.overall.passRate}%`);
        console.log(`   总耗时: ${(summary.results.total.duration / 1000).toFixed(2)}秒`);

        if (summary.issues.length > 0) {
            console.log('\n⚠️ 发现问题:');
            summary.issues.forEach(issue => {
                console.log(`   ${issue.severity.toUpperCase()}: ${issue.message}`);
            });
        }

        console.log(`\n📄 详细报告: file://${path.resolve(paths.htmlPath)}`);

        // 根据结果设置退出码
        const hasFailures = summary.results.total.failed > 0;
        process.exit(hasFailures ? 1 : 0);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const aggregator = new E2EReportAggregator();
    aggregator.run().catch(error => {
        console.error('聚合报告时发生错误:', error);
        process.exit(1);
    });
}

module.exports = E2EReportAggregator;
