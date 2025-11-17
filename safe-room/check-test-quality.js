#!/usr/bin/env node

/**
 * 测试质量检查工具
 * 自动化检查和格式化测试代码，确保测试质量
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestQualityChecker {
    constructor() {
        this.issues = [];
        this.stats = {
            filesChecked: 0,
            issuesFound: 0,
            issuesFixed: 0,
            testsFound: 0
        };
    }

    /**
     * 主检查方法
     */
    async check(projects = ['front', 'admin'], options = {}) {
        const {
            fix = false,
            verbose = false,
            strict = false
        } = options;

        console.log('🔍 开始测试质量检查...');
        console.log(`📋 检查项目: ${projects.join(', ')}`);
        console.log(`🔧 自动修复: ${fix ? '启用' : '禁用'}`);
        console.log(`📊 严格模式: ${strict ? '启用' : '禁用'}\n`);

        for (const project of projects) {
            await this.checkProject(project, { fix, verbose, strict });
        }

        this.printSummary();
        return this.stats.issuesFound === 0;
    }

    /**
     * 检查单个项目
     */
    async checkProject(projectName, options) {
        const testDir = `springboot1ngh61a2/src/main/resources/${projectName}/${projectName}/tests`;
        const srcDir = `springboot1ngh61a2/src/main/resources/${projectName}/${projectName}/src`;

        if (!fs.existsSync(testDir)) {
            console.warn(`⚠️ 测试目录不存在: ${testDir}`);
            return;
        }

        console.log(`\n📂 检查项目: ${projectName}`);

        // 检查测试文件
        await this.checkTestFiles(testDir, options);

        // 检查源码中的测试相关代码
        if (fs.existsSync(srcDir)) {
            await this.checkSourceFiles(srcDir, options);
        }

        // 检查测试配置
        await this.checkTestConfig(projectName, options);
    }

    /**
     * 检查测试文件
     */
    async checkTestFiles(testDir, options) {
        const testFiles = this.findTestFiles(testDir);

        for (const file of testFiles) {
            this.stats.filesChecked++;
            await this.checkTestFile(file, options);
        }
    }

    /**
     * 检查单个测试文件
     */
    async checkTestFile(filePath, options) {
        const { fix, verbose, strict } = options;
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);

        if (verbose) {
            console.log(`  🔍 检查: ${fileName}`);
        }

        // 基本语法检查
        await this.checkSyntax(filePath, content, options);

        // 测试结构检查
        this.checkTestStructure(filePath, content, options);

        // 测试命名规范检查
        this.checkNamingConventions(filePath, content, options);

        // 测试最佳实践检查
        this.checkBestPractices(filePath, content, options);

        // 代码质量检查
        this.checkCodeQuality(filePath, content, options);

        if (strict) {
            // 严格模式下的额外检查
            this.checkStrictRequirements(filePath, content, options);
        }
    }

    /**
     * 语法检查
     */
    async checkSyntax(filePath, content, options) {
        const { fix } = options;

        try {
            // 尝试解析TypeScript/JavaScript
            if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
                // 使用Node.js检查语法
                const tempFile = path.join(process.cwd(), 'temp_check.js');
                fs.writeFileSync(tempFile, content.replace(/import.*from/g, '// import'));

                try {
                    execSync(`node --check "${tempFile}"`, { stdio: 'pipe' });
                } catch (error) {
                    this.addIssue(filePath, 'error', '语法错误', error.message);
                } finally {
                    if (fs.existsSync(tempFile)) {
                        fs.unlinkSync(tempFile);
                    }
                }
            }
        } catch (error) {
            this.addIssue(filePath, 'error', '语法检查失败', error.message);
        }
    }

    /**
     * 测试结构检查
     */
    checkTestStructure(filePath, content, options) {
        // 检查describe块
        const describeMatches = content.match(/test\.describe\(/g);
        if (!describeMatches || describeMatches.length === 0) {
            this.addIssue(filePath, 'warning', '测试结构', '缺少test.describe块');
        }

        // 检查测试用例
        const testMatches = content.match(/test\(['"`](.*?)['"`]/g);
        if (!testMatches || testMatches.length === 0) {
            this.addIssue(filePath, 'error', '测试结构', '没有找到任何测试用例');
        } else {
            this.stats.testsFound += testMatches.length;
        }

        // 检查beforeEach/afterEach
        const setupTeardown = content.match(/(beforeEach|afterEach)\(/g);
        if (!setupTeardown || setupTeardown.length === 0) {
            this.addIssue(filePath, 'info', '测试结构', '建议添加beforeEach/afterEach进行测试设置和清理');
        }

        // 检查await使用
        const asyncOps = content.match(/(page\.|expect\()/g);
        const awaits = content.match(/await /g);
        if (asyncOps && asyncOps.length > (awaits ? awaits.length * 2 : 0)) {
            this.addIssue(filePath, 'warning', '异步操作', '可能存在未正确使用await的异步操作');
        }
    }

    /**
     * 命名规范检查
     */
    checkNamingConventions(filePath, content, options) {
        // 检查测试名称
        const testNames = content.match(/test\(['"`](.*?)['"`]/g);
        if (testNames) {
            for (const testMatch of testNames) {
                const testName = testMatch.match(/test\(['"`](.*?)['"`]/)?.[1];
                if (testName) {
                    // 检查测试名称长度
                    if (testName.length < 10) {
                        this.addIssue(filePath, 'info', '命名规范', `测试名称过短: "${testName}"`);
                    }

                    // 检查测试名称描述性
                    if (!/\b(应该|可以|能够|正确|成功|失败|显示|加载|验证)\b/.test(testName)) {
                        this.addIssue(filePath, 'info', '命名规范', `测试名称建议更具描述性: "${testName}"`);
                    }
                }
            }
        }

        // 检查describe名称
        const describeNames = content.match(/describe\(['"`](.*?)['"`]/g);
        if (describeNames) {
            for (const describeMatch of describeNames) {
                const describeName = describeMatch.match(/describe\(['"`](.*?)['"`]/)?.[1];
                if (describeName && describeName.length < 5) {
                    this.addIssue(filePath, 'info', '命名规范', `描述块名称过短: "${describeName}"`);
                }
            }
        }
    }

    /**
     * 最佳实践检查
     */
    checkBestPractices(filePath, content, options) {
        // 检查硬编码等待
        const hardWaits = content.match(/waitForTimeout\(|setTimeout\(/g);
        if (hardWaits && hardWaits.length > 0) {
            this.addIssue(filePath, 'warning', '最佳实践', `发现${hardWaits.length}处硬编码等待，建议使用条件等待`);
        }

        // 检查data-testid使用
        const testIds = content.match(/data-testid|getByTestId/g);
        if (!testIds) {
            this.addIssue(filePath, 'info', '最佳实践', '建议使用data-testid属性提高测试稳定性');
        }

        // 检查页面对象模式使用
        const pageObjects = content.match(/selectors\.|pageObjects\./g);
        if (!pageObjects) {
            this.addIssue(filePath, 'info', '最佳实践', '建议使用页面对象模式提高维护性');
        }

        // 检查错误处理
        const tryCatch = content.match(/try\s*\{[\s\S]*?\}\s*catch/g);
        const expectThrows = content.match(/expect.*toThrow|expect.*rejects/g);
        if (!tryCatch && !expectThrows) {
            this.addIssue(filePath, 'info', '最佳实践', '建议添加适当的错误处理');
        }

        // 检查截图使用
        const screenshots = content.match(/screenshot\(/g);
        if (!screenshots) {
            this.addIssue(filePath, 'info', '最佳实践', '建议在关键步骤添加截图以便调试');
        }
    }

    /**
     * 代码质量检查
     */
    checkCodeQuality(filePath, content, options) {
        const { fix } = options;
        let modified = false;

        // 检查控制台日志
        const consoleLogs = content.match(/console\.(log|warn|error)/g);
        if (consoleLogs && consoleLogs.length > 2) {
            this.addIssue(filePath, 'info', '代码质量', `发现${consoleLogs.length}个控制台日志，生产环境建议移除`);
        }

        // 检查注释覆盖率
        const commentLines = (content.match(/^[\s]*\/\//gm) || []).length;
        const codeLines = content.split('\n').filter(line =>
            line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('/*')
        ).length;

        const commentRatio = codeLines > 0 ? (commentLines / codeLines) * 100 : 0;
        if (commentRatio < 10) {
            this.addIssue(filePath, 'info', '代码质量', `注释覆盖率较低: ${commentRatio.toFixed(1)}%`);
        }

        // 检查重复代码模式
        const duplicatePatterns = this.findDuplicatePatterns(content);
        if (duplicatePatterns.length > 0) {
            this.addIssue(filePath, 'warning', '代码质量', `发现${duplicatePatterns.length}处可能的重复代码`);
        }

        // 自动修复（如果启用）
        if (fix && modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            this.stats.issuesFixed++;
        }
    }

    /**
     * 严格要求检查
     */
    checkStrictRequirements(filePath, content, options) {
        // 检查导入顺序
        const imports = content.match(/^import.*$/gm);
        if (imports && imports.length > 1) {
            const sortedImports = [...imports].sort();
            const isSorted = imports.every((imp, index) => imp === sortedImports[index]);
            if (!isSorted) {
                this.addIssue(filePath, 'warning', '严格要求', '导入语句应按字母顺序排序');
            }
        }

        // 检查最大函数长度
        const functions = content.match(/^(?:async\s+)?(?:function|const.*=>|.*=\s*\()/gm);
        if (functions && functions.length > 0) {
            // 简单的函数长度检查（这里可以改进为更精确的分析）
            const lines = content.split('\n');
            let currentFunction = null;
            let functionStart = -1;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                if (functions.some(func => line.includes(func.replace(/^.*?(function|=>|\()\s*/, '$1')))) {
                    currentFunction = line;
                    functionStart = i;
                }

                if (currentFunction && (line.includes('}') || line.includes('};'))) {
                    const functionLength = i - functionStart;
                    if (functionLength > 50) {
                        this.addIssue(filePath, 'warning', '严格要求', `函数过长: ${currentFunction.trim()} (${functionLength}行)`);
                    }
                    currentFunction = null;
                }
            }
        }

        // 检查魔法数字
        const magicNumbers = content.match(/\b\d{2,}\b/g);
        if (magicNumbers) {
            const filteredNumbers = magicNumbers.filter(num =>
                !['0', '1', '100', '200', '300', '400', '500'].includes(num) &&
                !num.startsWith('20') && // 年份
                num.length > 1
            );
            if (filteredNumbers.length > 0) {
                this.addIssue(filePath, 'info', '严格要求', `发现${filteredNumbers.length}个可能的魔法数字，建议使用常量`);
            }
        }
    }

    /**
     * 检查源码文件
     */
    async checkSourceFiles(srcDir, options) {
        // 检查组件是否有对应的测试
        const components = this.findComponents(srcDir);
        const tests = this.findTestFiles(srcDir.replace('/src', '/tests'));

        const testCoverage = components.filter(comp => {
            const compName = path.basename(comp, path.extname(comp));
            return tests.some(test =>
                path.basename(test).toLowerCase().includes(compName.toLowerCase())
            );
        });

        const coverage = components.length > 0 ? (testCoverage.length / components.length) * 100 : 0;

        if (coverage < 80) {
            this.addIssue(srcDir, 'warning', '测试覆盖', `组件测试覆盖率: ${coverage.toFixed(1)}%`);
        }
    }

    /**
     * 检查测试配置
     */
    async checkTestConfig(projectName, options) {
        const configFile = `springboot1ngh61a2/src/main/resources/${projectName}/${projectName}/playwright.config.ts`;

        if (!fs.existsSync(configFile)) {
            this.addIssue(configFile, 'error', '配置检查', '缺少Playwright配置文件');
            return;
        }

        const configContent = fs.readFileSync(configFile, 'utf8');

        // 检查基本配置
        const requiredConfigs = [
            'testDir',
            'timeout',
            'expect',
            'use',
            'projects'
        ];

        for (const config of requiredConfigs) {
            if (!configContent.includes(config + ':')) {
                this.addIssue(configFile, 'warning', '配置检查', `缺少配置项: ${config}`);
            }
        }

        // 检查浏览器配置
        if (!configContent.includes('Desktop Chrome') || !configContent.includes('Desktop Firefox')) {
            this.addIssue(configFile, 'info', '配置检查', '建议配置多种浏览器进行测试');
        }
    }

    /**
     * 查找测试文件
     */
    findTestFiles(dir) {
        const files = [];

        function scan(directory) {
            if (!fs.existsSync(directory)) return;

            const items = fs.readdirSync(directory);

            for (const item of items) {
                const fullPath = path.join(directory, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    scan(fullPath);
                } else if (item.endsWith('.spec.ts') || item.endsWith('.test.ts')) {
                    files.push(fullPath);
                }
            }
        }

        scan(dir);
        return files;
    }

    /**
     * 查找组件文件
     */
    findComponents(dir) {
        const files = [];

        function scan(directory) {
            if (!fs.existsSync(directory)) return;

            const items = fs.readdirSync(directory);

            for (const item of items) {
                const fullPath = path.join(directory, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    scan(fullPath);
                } else if (item.endsWith('.vue') || item.endsWith('.tsx') || item.endsWith('.jsx')) {
                    files.push(fullPath);
                }
            }
        }

        scan(dir);
        return files;
    }

    /**
     * 查找重复代码模式
     */
    findDuplicatePatterns(content) {
        const lines = content.split('\n');
        const patterns = [];
        const seen = new Map();

        for (let i = 0; i < lines.length - 3; i++) {
            const pattern = lines.slice(i, i + 4).join('\n');
            if (pattern.length > 50) { // 只检查较长的模式
                const count = seen.get(pattern) || 0;
                seen.set(pattern, count + 1);
                if (count >= 2) {
                    patterns.push(pattern);
                }
            }
        }

        return patterns;
    }

    /**
     * 添加问题
     */
    addIssue(file, severity, category, message) {
        this.issues.push({
            file,
            severity,
            category,
            message,
            timestamp: new Date().toISOString()
        });
        this.stats.issuesFound++;
    }

    /**
     * 打印摘要
     */
    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 测试质量检查结果');
        console.log('='.repeat(60));

        console.log(`📁 检查文件数: ${this.stats.filesChecked}`);
        console.log(`🧪 发现测试数: ${this.stats.testsFound}`);
        console.log(`⚠️ 发现问题数: ${this.stats.issuesFound}`);
        console.log(`🔧 自动修复数: ${this.stats.issuesFixed}`);

        if (this.issues.length > 0) {
            console.log('\n🔍 问题详情:');

            const issuesBySeverity = {
                error: this.issues.filter(i => i.severity === 'error'),
                warning: this.issues.filter(i => i.severity === 'warning'),
                info: this.issues.filter(i => i.severity === 'info')
            };

            for (const [severity, issues] of Object.entries(issuesBySeverity)) {
                if (issues.length > 0) {
                    const emoji = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';
                    console.log(`\n${emoji} ${severity.toUpperCase()} (${issues.length}):`);

                    // 按类别分组显示
                    const byCategory = {};
                    issues.forEach(issue => {
                        if (!byCategory[issue.category]) {
                            byCategory[issue.category] = [];
                        }
                        byCategory[issue.category].push(issue);
                    });

                    for (const [category, catIssues] of Object.entries(byCategory)) {
                        console.log(`  ${category}:`);
                        catIssues.slice(0, 3).forEach(issue => {
                            const fileName = path.basename(issue.file);
                            console.log(`    • ${fileName}: ${issue.message}`);
                        });
                        if (catIssues.length > 3) {
                            console.log(`    ... 还有 ${catIssues.length - 3} 个问题`);
                        }
                    }
                }
            }
        }

        console.log('\n' + '='.repeat(60));

        const success = this.stats.issuesFound === 0;
        if (success) {
            console.log('✅ 所有检查通过！测试质量良好。');
        } else {
            console.log('⚠️ 发现一些问题需要注意。');
            console.log('💡 建议: 运行 `node check-test-quality.js --fix` 自动修复部分问题');
        }

        console.log('='.repeat(60));
    }
}

// CLI接口
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {
        fix: args.includes('--fix'),
        verbose: args.includes('--verbose'),
        strict: args.includes('--strict'),
        help: args.includes('--help')
    };

    const projects = args.filter(arg => !arg.startsWith('--') && arg !== 'front' && arg !== 'admin')
        .length > 0 ? args.filter(arg => !arg.startsWith('--')) : ['front', 'admin'];

    if (options.help) {
        console.log(`
测试质量检查工具

用法:
  node check-test-quality.js [选项] [项目...]

选项:
  --fix      自动修复发现的问题
  --verbose  显示详细检查过程
  --strict   启用严格检查模式
  --help     显示此帮助信息

项目:
  front     检查前端用户项目（默认）
  admin     检查前端管理项目（默认）

示例:
  node check-test-quality.js --fix
  node check-test-quality.js --verbose front
  node check-test-quality.js --strict --fix front admin
        `);
        process.exit(0);
    }

    const checker = new TestQualityChecker();
    checker.check(projects, options).then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('检查过程中发生错误:', error);
        process.exit(1);
    });
}

module.exports = TestQualityChecker;
