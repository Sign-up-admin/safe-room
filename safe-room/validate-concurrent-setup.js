#!/usr/bin/env node

/**
 * 并发执行配置验证脚本
 * 验证两个前端工程的并发测试配置是否正确
 */

const fs = require('fs');
const path = require('path');

class ConcurrentSetupValidator {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.successes = [];
    }

    /**
     * 验证Playwright配置文件
     */
    validatePlaywrightConfig(projectName, configPath) {
        console.log(`🔍 验证 ${projectName} Playwright配置...`);

        if (!fs.existsSync(configPath)) {
            this.issues.push(`${projectName}: Playwright配置文件不存在: ${configPath}`);
            return false;
        }

        try {
            const configContent = fs.readFileSync(configPath, 'utf8');

            // 检查fullyParallel配置（现在是条件性的）
            if (!configContent.includes('fullyParallel:') || !configContent.includes('E2E_PARALLEL')) {
                this.issues.push(`${projectName}: fullyParallel 配置不正确`);
            } else {
                this.successes.push(`${projectName}: fullyParallel 配置正确（条件性控制）`);
            }

            // 检查workers配置
            if (!configContent.includes('workers:')) {
                this.warnings.push(`${projectName}: 未配置 workers，建议添加以优化并发控制`);
            } else {
                this.successes.push(`${projectName}: workers 配置存在`);
            }

            // 检查baseURL配置
            if (!configContent.includes('baseURL:')) {
                this.issues.push(`${projectName}: 未配置 baseURL`);
            } else {
                this.successes.push(`${projectName}: baseURL 已配置`);
            }

            return true;
        } catch (error) {
            this.issues.push(`${projectName}: 读取配置文件失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 验证package.json脚本
     */
    validatePackageScripts(projectName, packagePath) {
        console.log(`🔍 验证 ${projectName} package.json脚本...`);

        if (!fs.existsSync(packagePath)) {
            this.issues.push(`${projectName}: package.json文件不存在: ${packagePath}`);
            return false;
        }

        try {
            const packageContent = fs.readFileSync(packagePath, 'utf8');
            const packageJson = JSON.parse(packageContent);

            const scripts = packageJson.scripts || {};

            // 检查必要的脚本
            const requiredScripts = ['test:e2e', 'test:e2e:ui', 'test:e2e:debug'];
            requiredScripts.forEach(script => {
                if (!scripts[script]) {
                    this.issues.push(`${projectName}: 缺少必要的脚本: ${script}`);
                } else {
                    this.successes.push(`${projectName}: ${script} 脚本存在`);
                }
            });

            return true;
        } catch (error) {
            this.issues.push(`${projectName}: 解析package.json失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 验证测试目录结构
     */
    validateTestStructure(projectName, testDir) {
        console.log(`🔍 验证 ${projectName} 测试目录结构...`);

        if (!fs.existsSync(testDir)) {
            this.issues.push(`${projectName}: 测试目录不存在: ${testDir}`);
            return false;
        }

        // 检查e2e目录
        const e2eDir = path.join(testDir, 'e2e');
        if (!fs.existsSync(e2eDir)) {
            this.issues.push(`${projectName}: e2e测试目录不存在: ${e2eDir}`);
            return false;
        }

        // 统计测试文件数量
        try {
            const testFiles = fs.readdirSync(e2eDir)
                .filter(file => file.endsWith('.spec.ts') || file.endsWith('.test.ts'));

            if (testFiles.length === 0) {
                this.warnings.push(`${projectName}: 未找到任何测试文件`);
            } else {
                this.successes.push(`${projectName}: 发现 ${testFiles.length} 个测试文件`);
            }

            return true;
        } catch (error) {
            this.issues.push(`${projectName}: 读取测试目录失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 验证并发执行脚本
     */
    validateConcurrentScript() {
        console.log('🔍 验证并发执行脚本...');

        const scriptPath = 'concurrent-frontend-e2e-runner.ps1';
        if (!fs.existsSync(scriptPath)) {
            this.issues.push(`并发执行脚本不存在: ${scriptPath}`);
            return false;
        }

        try {
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');

            // 检查必要的函数和逻辑
            const requiredElements = [
                'Start-ConcurrentTests',
                'Test-Project',
                'MaxConcurrency',
                'Start-Job'
            ];

            requiredElements.forEach(element => {
                if (!scriptContent.includes(element)) {
                    this.issues.push(`并发脚本缺少必要元素: ${element}`);
                } else {
                    this.successes.push(`并发脚本包含: ${element}`);
                }
            });

            return true;
        } catch (error) {
            this.issues.push(`读取并发脚本失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 验证报告聚合器
     */
    validateReportAggregator() {
        console.log('🔍 验证报告聚合器...');

        const aggregatorPath = 'concurrent-e2e-report-aggregator.js';
        if (!fs.existsSync(aggregatorPath)) {
            this.issues.push(`报告聚合器不存在: ${aggregatorPath}`);
            return false;
        }

        try {
            const aggregatorContent = fs.readFileSync(aggregatorPath, 'utf8');

            // 检查必要的类和方法
            const requiredElements = [
                'E2EReportAggregator',
                'generateSummaryReport',
                'generateHtmlReport',
                'analyzeResults'
            ];

            requiredElements.forEach(element => {
                if (!aggregatorContent.includes(element)) {
                    this.issues.push(`报告聚合器缺少必要元素: ${element}`);
                } else {
                    this.successes.push(`报告聚合器包含: ${element}`);
                }
            });

            return true;
        } catch (error) {
            this.issues.push(`读取报告聚合器失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 验证根package.json
     */
    validateRootPackageJson() {
        console.log('🔍 验证根package.json...');

        const packagePath = 'package.json';
        if (!fs.existsSync(packagePath)) {
            this.issues.push(`根package.json不存在: ${packagePath}`);
            return false;
        }

        try {
            const packageContent = fs.readFileSync(packagePath, 'utf8');
            const packageJson = JSON.parse(packageContent);

            const scripts = packageJson.scripts || {};

            // 检查并发相关的脚本
            const concurrentScripts = [
                'test:e2e:serial',
                'test:e2e:parallel',
                'test:e2e:serial:admin',
                'test:e2e:serial:front',
                'test:e2e:parallel:admin',
                'test:e2e:parallel:front',
                'report:e2e:aggregate'
            ];

            concurrentScripts.forEach(script => {
                if (!scripts[script]) {
                    this.issues.push(`根package.json缺少并发脚本: ${script}`);
                } else {
                    this.successes.push(`根package.json包含并发脚本: ${script}`);
                }
            });

            return true;
        } catch (error) {
            this.issues.push(`解析根package.json失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 生成验证报告
     */
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('🔍 并发执行配置验证报告');
        console.log('='.repeat(60));

        if (this.successes.length > 0) {
            console.log('\n✅ 配置正确的项目:');
            this.successes.forEach(success => console.log(`   ${success}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️  配置警告:');
            this.warnings.forEach(warning => console.log(`   ${warning}`));
        }

        if (this.issues.length > 0) {
            console.log('\n❌ 配置问题:');
            this.issues.forEach(issue => console.log(`   ${issue}`));
        }

        const totalChecks = this.successes.length + this.warnings.length + this.issues.length;
        const successRate = totalChecks > 0 ? ((this.successes.length / totalChecks) * 100).toFixed(1) : 0;

        console.log('\n📊 验证统计:');
        console.log(`   总检查项: ${totalChecks}`);
        console.log(`   正确配置: ${this.successes.length}`);
        console.log(`   警告: ${this.warnings.length}`);
        console.log(`   问题: ${this.issues.length}`);
        console.log(`   配置正确率: ${successRate}%`);

        console.log('='.repeat(60));

        return {
            totalChecks,
            successes: this.successes.length,
            warnings: this.warnings.length,
            issues: this.issues.length,
            successRate: parseFloat(successRate)
        };
    }

    /**
     * 主执行方法
     */
    async run() {
        console.log('🚀 开始验证并发执行配置...\n');

        // 验证Admin前端
        this.validatePlaywrightConfig(
            'Admin前端',
            'springboot1ngh61a2/src/main/resources/admin/admin/playwright.config.ts'
        );
        this.validatePackageScripts(
            'Admin前端',
            'springboot1ngh61a2/src/main/resources/admin/admin/package.json'
        );
        this.validateTestStructure(
            'Admin前端',
            'springboot1ngh61a2/src/main/resources/admin/admin/tests'
        );

        // 验证用户前端
        this.validatePlaywrightConfig(
            '用户前端',
            'springboot1ngh61a2/src/main/resources/front/front/playwright.config.ts'
        );
        this.validatePackageScripts(
            '用户前端',
            'springboot1ngh61a2/src/main/resources/front/front/package.json'
        );
        this.validateTestStructure(
            '用户前端',
            'springboot1ngh61a2/src/main/resources/front/front/tests'
        );

        // 验证并发基础设施
        this.validateConcurrentScript();
        this.validateReportAggregator();
        this.validateRootPackageJson();

        // 生成报告
        const stats = this.generateReport();

        // 根据结果设置退出码
        const hasCriticalIssues = this.issues.some(issue =>
            issue.includes('不存在') ||
            issue.includes('失败') ||
            issue.includes('缺少必要的脚本')
        );

        if (hasCriticalIssues) {
            console.log('\n❌ 发现关键配置问题，需要修复后才能正常使用并发执行');
            process.exit(1);
        } else if (stats.successRate >= 90) {
            console.log('\n✅ 配置验证通过，并发执行已准备就绪');
            process.exit(0);
        } else {
            console.log('\n⚠️  配置验证部分通过，建议检查警告信息');
            process.exit(0);
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const validator = new ConcurrentSetupValidator();
    validator.run().catch(error => {
        console.error('验证配置时发生错误:', error);
        process.exit(1);
    });
}

module.exports = ConcurrentSetupValidator;
