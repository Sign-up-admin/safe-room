#!/usr/bin/env node

/**
 * 智能测试分批器
 * 根据测试依赖关系、执行时间和资源需求智能分组测试，实现最优的并发执行
 */

const TestDependencyAnalyzer = require('./test-dependency-analyzer');

class SmartTestBatcher {
    constructor(options = {}) {
        this.dependencyAnalyzer = new TestDependencyAnalyzer();
        this.options = {
            maxBatchSize: options.maxBatchSize || 3,
            maxBatchDuration: options.maxBatchDuration || 300000, // 5分钟
            balanceStrategy: options.balanceStrategy || 'duration', // 'duration', 'count', 'balanced'
            resourceAware: options.resourceAware !== false,
            ...options
        };
        this.testAnalysisCache = new Map();
    }

    /**
     * 为项目创建智能测试批次
     */
    async createBatchesForProject(projectName, phase = null) {
        console.log(`🔄 开始为 ${projectName} 项目创建智能测试批次...`);

        // 获取测试分析结果
        const analysis = await this.getTestAnalysis(projectName);

        // 筛选指定阶段的测试（如果指定了阶段）
        let targetTests = analysis.tests;
        if (phase) {
            targetTests = targetTests.filter(test => test.phase === phase);
        }

        if (targetTests.length === 0) {
            console.log(`⚠️ ${projectName} 项目${phase ? ` ${phase}阶段` : ''}没有找到测试文件`);
            return {
                project: projectName,
                phase,
                batches: [],
                statistics: {
                    totalTests: 0,
                    totalBatches: 0,
                    avgBatchSize: 0,
                    totalEstimatedDuration: 0
                }
            };
        }

        // 创建批次
        const batches = this.createOptimalBatches(targetTests, analysis, projectName);

        // 计算统计信息
        const statistics = this.calculateBatchStatistics(batches);

        console.log(`✅ ${projectName} 项目批次创建完成:`);
        console.log(`   总测试数: ${statistics.totalTests}`);
        console.log(`   批次数: ${statistics.totalBatches}`);
        console.log(`   平均批次大小: ${statistics.avgBatchSize.toFixed(1)}`);
        console.log(`   预估总耗时: ${(statistics.totalEstimatedDuration / 1000).toFixed(1)}秒`);

        return {
            project: projectName,
            phase,
            batches,
            statistics
        };
    }

    /**
     * 获取测试分析结果（带缓存）
     */
    async getTestAnalysis(projectName) {
        if (this.testAnalysisCache.has(projectName)) {
            return this.testAnalysisCache.get(projectName);
        }

        const analysis = await this.dependencyAnalyzer.analyzeProjectTests(projectName);
        this.testAnalysisCache.set(projectName, analysis);
        return analysis;
    }

    /**
     * 创建最优测试批次
     */
    createOptimalBatches(tests, analysis, projectName) {
        const batches = [];

        // 首先按依赖关系分组
        const dependencyGroups = this.groupByDependencies(tests, analysis);

        // 对每个依赖组进行内部批次划分
        for (const group of dependencyGroups) {
            const groupBatches = this.createBatchesForGroup(group, projectName);
            batches.push(...groupBatches);
        }

        // 应用批次优化策略
        return this.optimizeBatches(batches);
    }

    /**
     * 按依赖关系分组
     */
    groupByDependencies(tests, analysis) {
        const groups = [];
        const processed = new Set();

        // 使用依赖分析器获取并行组
        const parallelGroups = this.dependencyAnalyzer.getParallelGroups(null, tests[0]?.project);

        if (parallelGroups.length > 0) {
            // 如果有预定义的并行组，使用它们
            for (const group of parallelGroups) {
                groups.push(group);
                group.forEach(test => processed.add(`${test.project}:${test.file}`));
            }
        }

        // 处理剩余的测试
        for (const test of tests) {
            const testKey = `${test.project}:${test.file}`;
            if (processed.has(testKey)) continue;

            // 查找可以并行执行的其他测试
            const independentGroup = this.findIndependentGroup(test, tests, processed);
            groups.push(independentGroup);
        }

        return groups;
    }

    /**
     * 为依赖组创建批次
     */
    createBatchesForGroup(group, projectName) {
        if (group.length === 0) return [];

        // 按策略排序测试
        const sortedTests = this.sortTestsByStrategy(group);

        // 创建批次
        const batches = [];
        let currentBatch = [];
        let currentBatchDuration = 0;

        for (const test of sortedTests) {
            const testDuration = test.estimatedDuration;

            // 检查是否可以加入当前批次
            const canAddToCurrentBatch = this.canAddToBatch(
                currentBatch,
                test,
                currentBatchDuration,
                testDuration
            );

            if (canAddToCurrentBatch) {
                currentBatch.push(test);
                currentBatchDuration += testDuration;
            } else {
                // 创建新批次
                if (currentBatch.length > 0) {
                    batches.push(this.createBatch(currentBatch, projectName));
                }
                currentBatch = [test];
                currentBatchDuration = testDuration;
            }
        }

        // 添加最后一个批次
        if (currentBatch.length > 0) {
            batches.push(this.createBatch(currentBatch, projectName));
        }

        return batches;
    }

    /**
     * 按策略排序测试
     */
    sortTestsByStrategy(tests) {
        const sorted = [...tests];

        switch (this.options.balanceStrategy) {
            case 'duration':
                // 按执行时间降序排序（贪心算法）
                return sorted.sort((a, b) => b.estimatedDuration - a.estimatedDuration);

            case 'count':
                // 按复杂度排序（API调用数 + DB操作数）
                return sorted.sort((a, b) => {
                    const aComplexity = (a.metadata.apiCalls?.length || 0) +
                                      (a.metadata.databaseOperations?.length || 0);
                    const bComplexity = (b.metadata.apiCalls?.length || 0) +
                                      (b.metadata.databaseOperations?.length || 0);
                    return bComplexity - aComplexity;
                });

            case 'balanced':
            default:
                // 平衡策略：优先级 + 执行时间
                return sorted.sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    const aPriority = priorityOrder[a.priority] || 1;
                    const bPriority = priorityOrder[b.priority] || 1;

                    if (aPriority !== bPriority) {
                        return bPriority - aPriority;
                    }

                    return b.estimatedDuration - a.estimatedDuration;
                });
        }
    }

    /**
     * 检查是否可以加入批次
     */
    canAddToBatch(currentBatch, test, currentDuration, testDuration) {
        // 检查批次大小限制
        if (currentBatch.length >= this.options.maxBatchSize) {
            return false;
        }

        // 检查总执行时间限制
        if (currentDuration + testDuration > this.options.maxBatchDuration) {
            return false;
        }

        // 检查资源冲突（简化的检查）
        if (this.options.resourceAware) {
            return this.checkResourceCompatibility(currentBatch, test);
        }

        return true;
    }

    /**
     * 检查资源兼容性
     */
    checkResourceCompatibility(existingTests, newTest) {
        // 检查是否有相同的外部依赖冲突
        const existingExternals = new Set();
        existingTests.forEach(test => {
            test.dependencies?.external?.forEach(ext => existingExternals.add(ext));
        });

        const newExternals = new Set(newTest.dependencies?.external || []);
        const conflicts = [...existingExternals].some(ext => newExternals.has(ext));

        // 如果有相同的外部依赖，不允许并行执行
        return !conflicts;
    }

    /**
     * 创建批次对象
     */
    createBatch(tests, projectName) {
        const totalDuration = tests.reduce((sum, test) => sum + test.estimatedDuration, 0);
        const avgDuration = totalDuration / tests.length;

        // 计算批次复杂度
        const complexity = this.calculateBatchComplexity(tests);

        return {
            id: `batch_${projectName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            project: projectName,
            tests: tests.map(test => ({
                file: test.file,
                fullPath: test.fullPath,
                estimatedDuration: test.estimatedDuration,
                category: test.category,
                priority: test.priority
            })),
            statistics: {
                testCount: tests.length,
                totalEstimatedDuration: totalDuration,
                avgTestDuration: avgDuration,
                complexity,
                categories: this.getBatchCategories(tests)
            },
            execution: {
                parallel: tests.length > 1,
                maxConcurrency: Math.min(tests.length, this.options.maxBatchSize),
                estimatedDuration: totalDuration
            }
        };
    }

    /**
     * 计算批次复杂度
     */
    calculateBatchComplexity(tests) {
        let complexity = 0;

        for (const test of tests) {
            // API调用复杂度
            complexity += (test.metadata?.apiCalls?.length || 0) * 2;

            // 数据库操作复杂度
            complexity += (test.metadata?.databaseOperations?.length || 0) * 3;

            // 页面对象复杂度
            complexity += (test.metadata?.pageObjects?.length || 0) * 1;

            // 状态依赖复杂度
            complexity += (test.dependencies?.state?.length || 0) * 2;

            // 优先级加成
            const priorityMultiplier = { high: 1.5, medium: 1.2, low: 1.0 };
            complexity *= priorityMultiplier[test.priority] || 1.0;
        }

        return complexity;
    }

    /**
     * 获取批次分类统计
     */
    getBatchCategories(tests) {
        const categories = {};
        tests.forEach(test => {
            const category = test.category || 'unknown';
            categories[category] = (categories[category] || 0) + 1;
        });
        return categories;
    }

    /**
     * 查找独立可并行执行的测试组
     */
    findIndependentGroup(startTest, allTests, processed) {
        const group = [];
        const startKey = `${startTest.project}:${startTest.file}`;

        // 广度优先搜索，查找没有依赖冲突的测试
        const queue = [startTest];
        const visited = new Set();

        while (queue.length > 0) {
            const current = queue.shift();
            const currentKey = `${current.project}:${current.file}`;

            if (visited.has(currentKey) || processed.has(currentKey)) continue;
            visited.add(currentKey);

            // 检查当前测试是否可以加入组
            const hasConflict = group.some(existing => {
                const existingKey = `${existing.project}:${existing.file}`;
                return this.dependencyAnalyzer.hasDependency(existingKey, currentKey) ||
                       this.dependencyAnalyzer.hasDependency(currentKey, existingKey);
            });

            if (!hasConflict) {
                group.push(current);
                processed.add(currentKey);

                // 查找可以并行执行的其他测试
                for (const test of allTests) {
                    const testKey = `${test.project}:${test.file}`;
                    if (!visited.has(testKey) && !processed.has(testKey)) {
                        const canParallel = !this.dependencyAnalyzer.hasDependency(currentKey, testKey) &&
                                          !this.dependencyAnalyzer.hasDependency(testKey, currentKey);

                        if (canParallel) {
                            queue.push(test);
                        }
                    }
                }
            }
        }

        return group;
    }

    /**
     * 优化批次分布
     */
    optimizeBatches(batches) {
        if (batches.length <= 1) return batches;

        // 按执行时间均衡批次
        const optimized = [...batches].sort((a, b) => {
            return b.statistics.totalEstimatedDuration - a.statistics.totalEstimatedDuration;
        });

        // 重新平衡批次（可选的高级优化）
        return this.rebalanceBatches(optimized);
    }

    /**
     * 重新平衡批次
     */
    rebalanceBatches(batches) {
        // 简化的重新平衡策略：合并小批次
        const result = [];
        let currentBatch = null;

        for (const batch of batches) {
            if (!currentBatch) {
                currentBatch = batch;
                continue;
            }

            // 检查是否可以合并
            const combinedDuration = currentBatch.statistics.totalEstimatedDuration +
                                   batch.statistics.totalEstimatedDuration;
            const combinedTests = currentBatch.tests.length + batch.tests.length;

            if (combinedDuration <= this.options.maxBatchDuration &&
                combinedTests <= this.options.maxBatchSize) {
                // 合并批次
                currentBatch.tests.push(...batch.tests);
                currentBatch.statistics = this.recalculateBatchStatistics(currentBatch);
            } else {
                result.push(currentBatch);
                currentBatch = batch;
            }
        }

        if (currentBatch) {
            result.push(currentBatch);
        }

        return result;
    }

    /**
     * 重新计算批次统计信息
     */
    recalculateBatchStatistics(batch) {
        const totalDuration = batch.tests.reduce((sum, test) => sum + test.estimatedDuration, 0);
        const avgDuration = totalDuration / batch.tests.length;
        const complexity = this.calculateBatchComplexity(batch.tests);
        const categories = this.getBatchCategories(batch.tests);

        return {
            testCount: batch.tests.length,
            totalEstimatedDuration: totalDuration,
            avgTestDuration: avgDuration,
            complexity,
            categories
        };
    }

    /**
     * 计算批次统计信息
     */
    calculateBatchStatistics(batches) {
        const totalTests = batches.reduce((sum, batch) => sum + batch.tests.length, 0);
        const totalBatches = batches.length;
        const avgBatchSize = totalTests / totalBatches;
        const totalEstimatedDuration = batches.reduce((sum, batch) =>
            sum + batch.statistics.totalEstimatedDuration, 0);

        return {
            totalTests,
            totalBatches,
            avgBatchSize,
            totalEstimatedDuration,
            batchesBySize: this.groupBatchesBySize(batches),
            batchesByDuration: this.groupBatchesByDuration(batches)
        };
    }

    /**
     * 按大小分组批次
     */
    groupBatchesBySize(batches) {
        const groups = { small: 0, medium: 0, large: 0 };

        batches.forEach(batch => {
            const size = batch.tests.length;
            if (size === 1) groups.small++;
            else if (size <= 3) groups.medium++;
            else groups.large++;
        });

        return groups;
    }

    /**
     * 按持续时间分组批次
     */
    groupBatchesByDuration(batches) {
        const groups = { fast: 0, normal: 0, slow: 0 };

        batches.forEach(batch => {
            const duration = batch.statistics.totalEstimatedDuration;
            if (duration <= 60000) groups.fast++; // 1分钟内
            else if (duration <= 180000) groups.normal++; // 3分钟内
            else groups.slow++; // 超过3分钟
        });

        return groups;
    }

    /**
     * 获取批次执行计划
     */
    getExecutionPlan(projectName, phase = null) {
        return this.createBatchesForProject(projectName, phase);
    }

    /**
     * 导出批次配置
     */
    exportBatchConfig(batchResult) {
        const config = {
            project: batchResult.project,
            phase: batchResult.phase,
            timestamp: new Date().toISOString(),
            options: this.options,
            batches: batchResult.batches.map(batch => ({
                id: batch.id,
                testCount: batch.statistics.testCount,
                estimatedDuration: batch.statistics.totalEstimatedDuration,
                tests: batch.tests.map(test => test.file)
            })),
            statistics: batchResult.statistics
        };

        return config;
    }
}

module.exports = SmartTestBatcher;
