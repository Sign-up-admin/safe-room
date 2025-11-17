#!/usr/bin/env node

/**
 * 测试依赖关系分析器
 * 分析E2E测试文件之间的依赖关系，为分阶段并发执行提供决策依据
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

class TestDependencyAnalyzer {
    constructor() {
        this.dependencyGraph = new Map();
        this.testMetadata = new Map();
        this.reverseDependencies = new Map();
    }

    /**
     * 分析项目的所有测试文件
     */
    async analyzeProjectTests(projectName) {
        const projectPath = `springboot1ngh61a2/src/main/resources/${projectName}/${projectName}`;
        const testDir = path.join(projectPath, 'tests', 'e2e');

        console.log(`🔍 开始分析 ${projectName} 项目测试依赖关系...`);

        if (!fs.existsSync(testDir)) {
            console.warn(`⚠️ 测试目录不存在: ${testDir}`);
            return {
                project: projectName,
                tests: [],
                dependencies: new Map(),
                categories: {}
            };
        }

        const testFiles = this.discoverTestFiles(testDir);
        const analysisResults = [];

        for (const testFile of testFiles) {
            const result = await this.analyzeTestFile(testFile, projectName);
            if (result) {
                analysisResults.push(result);
            }
        }

        // 构建依赖图
        this.buildDependencyGraph(analysisResults);

        // 分类测试
        const categories = this.categorizeTests(analysisResults);

        console.log(`✅ ${projectName} 项目分析完成，发现 ${analysisResults.length} 个测试文件`);

        return {
            project: projectName,
            tests: analysisResults,
            dependencies: this.dependencyGraph,
            reverseDependencies: this.reverseDependencies,
            categories
        };
    }

    /**
     * 发现测试文件
     */
    discoverTestFiles(testDir) {
        const testFiles = [];

        function scanDir(dir) {
            const items = fs.readdirSync(dir);

            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    scanDir(fullPath);
                } else if (this.isTestFile(item)) {
                    testFiles.push(fullPath);
                }
            }
        }

        scanDir.call(this, testDir);
        return testFiles;
    }

    /**
     * 判断是否为测试文件
     */
    isTestFile(filename) {
        return filename.endsWith('.spec.ts') ||
               filename.endsWith('.test.ts') ||
               filename.endsWith('.spec.js') ||
               filename.endsWith('.test.js');
    }

    /**
     * 分析单个测试文件
     */
    async analyzeTestFile(filePath, projectName) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(`springboot1ngh61a2/src/main/resources/${projectName}/${projectName}`, filePath);

            // 解析AST
            const ast = this.parseTestFile(content);

            // 提取测试元数据
            const metadata = this.extractTestMetadata(ast, content);

            // 分析依赖关系
            const dependencies = this.analyzeDependencies(ast, content, projectName);

            // 估算执行时间
            const estimatedDuration = this.estimateTestDuration(metadata);

            // 确定测试阶段
            const phase = this.determineTestPhase(metadata, dependencies);

            return {
                file: relativePath,
                fullPath: filePath,
                project: projectName,
                metadata,
                dependencies,
                estimatedDuration,
                phase,
                category: this.categorizeTest(metadata, dependencies),
                priority: this.determinePriority(metadata, dependencies)
            };

        } catch (error) {
            console.warn(`⚠️ 分析测试文件失败 ${filePath}:`, error.message);
            return null;
        }
    }

    /**
     * 解析测试文件AST
     */
    parseTestFile(content) {
        try {
            return parse(content, {
                sourceType: 'module',
                plugins: [
                    'typescript',
                    'decorators-legacy',
                    ['pipelineOperator', { proposal: 'minimal' }],
                    'optionalChaining',
                    'nullishCoalescingOperator'
                ]
            });
        } catch (error) {
            // 如果TypeScript解析失败，尝试JavaScript解析
            try {
                return parse(content, {
                    sourceType: 'module',
                    plugins: ['optionalChaining', 'nullishCoalescingOperator']
                });
            } catch (jsError) {
                throw new Error(`无法解析文件: ${error.message}`);
            }
        }
    }

    /**
     * 提取测试元数据
     */
    extractTestMetadata(ast, content) {
        const metadata = {
            describeBlocks: [],
            testCases: [],
            beforeEach: [],
            afterEach: [],
            fixtures: [],
            pageObjects: [],
            apiCalls: [],
            databaseOperations: []
        };

        traverse(ast, {
            CallExpression: (path) => {
                const callee = path.node.callee;

                // 提取describe块
                if (this.isDescribeCall(callee)) {
                    const title = this.extractStringArgument(path.node.arguments[0]);
                    metadata.describeBlocks.push({
                        title,
                        location: path.node.loc
                    });
                }

                // 提取test/it块
                if (this.isTestCall(callee)) {
                    const title = this.extractStringArgument(path.node.arguments[0]);
                    metadata.testCases.push({
                        title,
                        location: path.node.loc,
                        async: this.isAsyncFunction(path.node.arguments[1])
                    });
                }

                // 提取hooks
                if (this.isHookCall(callee)) {
                    const hookType = callee.name;
                    if (!metadata[hookType]) metadata[hookType] = [];
                    metadata[hookType].push({
                        location: path.node.loc
                    });
                }

                // 提取页面对象使用
                if (this.isPageObjectUsage(path)) {
                    metadata.pageObjects.push({
                        name: this.extractPageObjectName(path),
                        location: path.node.loc
                    });
                }

                // 提取API调用
                if (this.isApiCall(path)) {
                    metadata.apiCalls.push({
                        endpoint: this.extractApiEndpoint(path),
                        method: this.extractHttpMethod(path),
                        location: path.node.loc
                    });
                }

                // 提取数据库操作
                if (this.isDatabaseOperation(path)) {
                    metadata.databaseOperations.push({
                        operation: this.extractDatabaseOperation(path),
                        location: path.node.loc
                    });
                }
            },

            VariableDeclarator: (path) => {
                // 提取fixture使用
                if (this.isFixtureDeclaration(path)) {
                    metadata.fixtures.push({
                        name: path.node.id.name,
                        location: path.node.loc
                    });
                }
            }
        });

        return metadata;
    }

    /**
     * 分析依赖关系
     */
    analyzeDependencies(ast, content, projectName) {
        const dependencies = {
            files: [],      // 文件依赖
            data: [],       // 数据依赖
            state: [],      // 状态依赖
            external: []    // 外部服务依赖
        };

        // 分析import语句
        traverse(ast, {
            ImportDeclaration: (path) => {
                const importPath = path.node.source.value;

                // 检查是否导入其他测试文件或页面对象
                if (this.isTestRelatedImport(importPath)) {
                    dependencies.files.push({
                        type: 'import',
                        path: importPath,
                        relative: this.resolveImportPath(importPath, projectName)
                    });
                }
            }
        });

        // 分析内容中的依赖标记
        const dependencyMarkers = this.extractDependencyMarkers(content);
        dependencies.data = dependencyMarkers.data;
        dependencies.state = dependencyMarkers.state;
        dependencies.external = dependencyMarkers.external;

        return dependencies;
    }

    /**
     * 提取依赖标记
     */
    extractDependencyMarkers(content) {
        const markers = {
            data: [],
            state: [],
            external: []
        };

        // 匹配注释中的依赖标记
        const dependencyRegex = /\/\/\s*@depends?\s+(.+)/g;
        const stateRegex = /\/\/\s*@requires?\s+(.+)/g;
        const externalRegex = /\/\/\s*@external\s+(.+)/g;

        let match;
        while ((match = dependencyRegex.exec(content)) !== null) {
            markers.data.push(match[1].trim());
        }

        while ((match = stateRegex.exec(content)) !== null) {
            markers.state.push(match[1].trim());
        }

        while ((match = externalRegex.exec(content)) !== null) {
            markers.external.push(match[1].trim());
        }

        return markers;
    }

    /**
     * 估算测试执行时间
     */
    estimateTestDuration(metadata) {
        let baseDuration = 10000; // 基础10秒

        // 根据测试用例数量调整
        baseDuration += metadata.testCases.length * 2000; // 每个测试2秒

        // 根据API调用调整
        baseDuration += metadata.apiCalls.length * 1000; // 每个API调用1秒

        // 根据数据库操作调整
        baseDuration += metadata.databaseOperations.length * 3000; // 每个DB操作3秒

        // 根据页面对象使用调整
        baseDuration += metadata.pageObjects.length * 1500; // 每个页面对象1.5秒

        return Math.max(baseDuration, 5000); // 最少5秒
    }

    /**
     * 确定测试所属阶段
     */
    determineTestPhase(metadata, dependencies) {
        // 基于测试内容和依赖确定阶段

        // 集成测试：有多个外部依赖或跨模块调用
        if (dependencies.external.length > 2 ||
            (metadata.apiCalls.length > 5 && metadata.databaseOperations.length > 2)) {
            return 'integration';
        }

        // 业务逻辑测试：有状态依赖或复杂的工作流
        if (dependencies.state.length > 0 ||
            metadata.testCases.some(tc => tc.title.toLowerCase().includes('workflow'))) {
            return 'business';
        }

        // 基础功能测试：简单的CRUD或导航
        if (metadata.testCases.some(tc =>
            tc.title.toLowerCase().includes('login') ||
            tc.title.toLowerCase().includes('navigate') ||
            tc.title.toLowerCase().includes('create') ||
            tc.title.toLowerCase().includes('basic'))) {
            return 'foundation';
        }

        // 默认归类为基础阶段
        return 'foundation';
    }

    /**
     * 分类测试
     */
    categorizeTest(metadata, dependencies) {
        // 基于内容和依赖进行更细粒度的分类

        if (metadata.testCases.some(tc => tc.title.toLowerCase().includes('login'))) {
            return 'auth';
        }

        if (metadata.testCases.some(tc => tc.title.toLowerCase().includes('navigate'))) {
            return 'navigation';
        }

        if (metadata.apiCalls.some(api => api.endpoint.includes('/users'))) {
            return 'user-management';
        }

        if (metadata.apiCalls.some(api => api.endpoint.includes('/orders'))) {
            return 'order-processing';
        }

        if (metadata.testCases.some(tc => tc.title.toLowerCase().includes('report'))) {
            return 'reporting';
        }

        return 'general';
    }

    /**
     * 确定测试优先级
     */
    determinePriority(metadata, dependencies) {
        // 基于依赖关系和复杂度确定优先级

        if (dependencies.external.length > 0) {
            return 'high'; // 有外部依赖的测试优先级高
        }

        if (metadata.databaseOperations.length > 3) {
            return 'high'; // 复杂数据库操作优先级高
        }

        if (metadata.testCases.length > 10) {
            return 'medium'; // 多测试用例文件优先级中等
        }

        return 'low';
    }

    /**
     * 构建依赖图
     */
    buildDependencyGraph(analysisResults) {
        this.dependencyGraph.clear();
        this.reverseDependencies.clear();

        for (const result of analysisResults) {
            const fileKey = `${result.project}:${result.file}`;
            this.dependencyGraph.set(fileKey, result.dependencies.files || []);

            // 构建反向依赖图
            for (const dep of result.dependencies.files || []) {
                const depKey = dep.relative ? `${result.project}:${dep.relative}` : dep.path;
                if (!this.reverseDependencies.has(depKey)) {
                    this.reverseDependencies.set(depKey, []);
                }
                this.reverseDependencies.get(depKey).push(fileKey);
            }
        }
    }

    /**
     * 分类测试
     */
    categorizeTests(analysisResults) {
        const categories = {};

        for (const result of analysisResults) {
            const category = result.category;
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(result);
        }

        // 按优先级排序
        for (const category in categories) {
            categories[category].sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
        }

        return categories;
    }

    /**
     * 获取阶段测试
     */
    getTestsForPhase(phase, projectName) {
        // 从分析结果中筛选指定阶段的测试
        const projectResults = Array.from(this.testMetadata.values())
            .filter(result => result.project === projectName && result.phase === phase);

        return projectResults.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * 获取可并行执行的测试组
     */
    getParallelGroups(phase, projectName) {
        const phaseTests = this.getTestsForPhase(phase, projectName);
        const groups = [];

        // 基于依赖关系分组
        const processed = new Set();
        const testMap = new Map(phaseTests.map(t => [`${t.project}:${t.file}`, t]));

        for (const test of phaseTests) {
            if (processed.has(`${test.project}:${test.file}`)) continue;

            const group = this.findIndependentGroup(test, testMap, processed);
            if (group.length > 0) {
                groups.push(group);
            }
        }

        return groups;
    }

    /**
     * 查找独立可并行执行的测试组
     */
    findIndependentGroup(startTest, testMap, processed) {
        const group = [];
        const queue = [startTest];
        const visited = new Set();

        while (queue.length > 0) {
            const current = queue.shift();
            const currentKey = `${current.project}:${current.file}`;

            if (visited.has(currentKey) || processed.has(currentKey)) continue;
            visited.add(currentKey);

            // 检查是否可以加入当前组（没有依赖冲突）
            const canAdd = group.every(existing => {
                const existingKey = `${existing.project}:${existing.file}`;
                return !this.hasDependency(existingKey, currentKey) &&
                       !this.hasDependency(currentKey, existingKey);
            });

            if (canAdd) {
                group.push(current);
                processed.add(currentKey);

                // 查找可以并行执行的其他测试
                for (const [key, test] of testMap) {
                    if (!visited.has(key) && !processed.has(key)) {
                        const testKey = `${test.project}:${test.file}`;
                        if (!this.hasDependency(currentKey, testKey) &&
                            !this.hasDependency(testKey, currentKey)) {
                            queue.push(test);
                        }
                    }
                }
            }
        }

        return group;
    }

    /**
     * 检查两个测试之间是否有依赖关系
     */
    hasDependency(fromKey, toKey) {
        const dependencies = this.dependencyGraph.get(fromKey) || [];
        return dependencies.some(dep => {
            const depKey = dep.relative ? `${dep.project || 'unknown'}:${dep.relative}` : dep.path;
            return depKey === toKey;
        });
    }

    // 辅助方法
    isDescribeCall(callee) {
        return callee.name === 'describe' ||
               (callee.type === 'MemberExpression' && callee.object.name === 'test' && callee.property.name === 'describe');
    }

    isTestCall(callee) {
        return callee.name === 'it' || callee.name === 'test' ||
               (callee.type === 'MemberExpression' && callee.object.name === 'test' &&
                (callee.property.name === 'it' || callee.property.name === 'test'));
    }

    isHookCall(callee) {
        return ['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].includes(callee.name);
    }

    isPageObjectUsage(path) {
        // 简化的页面对象检测逻辑
        return path.node.callee && path.node.callee.type === 'MemberExpression';
    }

    isApiCall(path) {
        // 简化的API调用检测
        const code = path.toString();
        return code.includes('axios') || code.includes('fetch') || code.includes('api');
    }

    isDatabaseOperation(path) {
        // 简化的数据库操作检测
        const code = path.toString();
        return code.includes('sql') || code.includes('database') || code.includes('db');
    }

    isFixtureDeclaration(path) {
        return path.node.init && path.node.init.type === 'CallExpression' &&
               path.node.init.callee.name === 'fixture';
    }

    extractStringArgument(arg) {
        return arg && arg.type === 'StringLiteral' ? arg.value : 'unknown';
    }

    extractPageObjectName(path) {
        return path.node.callee.object.name || 'unknown';
    }

    extractApiEndpoint(path) {
        // 简化的端点提取
        return 'unknown';
    }

    extractHttpMethod(path) {
        // 简化的方法提取
        return 'GET';
    }

    extractDatabaseOperation(path) {
        // 简化的操作提取
        return 'unknown';
    }

    isTestRelatedImport(importPath) {
        return importPath.includes('/tests/') ||
               importPath.includes('/pages/') ||
               importPath.includes('/fixtures/');
    }

    resolveImportPath(importPath, projectName) {
        // 简化的路径解析
        return importPath;
    }

    isAsyncFunction(func) {
        return func && func.type === 'ArrowFunctionExpression' && func.async;
    }
}

module.exports = TestDependencyAnalyzer;
