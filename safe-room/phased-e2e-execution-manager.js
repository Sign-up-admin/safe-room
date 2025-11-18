#!/usr/bin/env node

/**
 * 前端E2E分阶段并发执行管理器
 * 实现智能的测试分阶段执行，支持阶段内并发和跨阶段依赖管理
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class PhasedE2EExecutionManager {
    constructor() {
        this.phases = this.definePhases();
        this.resourceManager = new ResourceManager();
        this.stateManager = new PhaseStateManager();
        this.testDependencyAnalyzer = new TestDependencyAnalyzer();
    }

    /**
     * 定义执行阶段
     */
    definePhases() {
        return {
            preparation: {
                id: 'preparation',
                name: '准备阶段',
                description: '环境准备、依赖安装、数据库重置',
                order: 1,
                concurrency: 1, // 串行执行
                timeout: 300000, // 5分钟
                tasks: [
                    { name: 'check-environment', type: 'system', priority: 'high' },
                    { name: 'install-dependencies', type: 'system', priority: 'high' },
                    { name: 'reset-database', type: 'system', priority: 'high' },
                    { name: 'start-services', type: 'system', priority: 'high' }
                ],
                successCriteria: 'all_tasks_pass',
                failureAction: 'stop_all'
            },

            foundation: {
                id: 'foundation',
                name: '基础功能测试阶段',
                description: '基础功能验证（登录、导航、基础CRUD）',
                order: 2,
                concurrency: 1, // 默认串行执行，稳定优先
                maxConcurrency: 8, // 并行模式时的最大并发数
                timeout: 600000, // 10分钟
                testCategories: ['auth', 'navigation', 'basic-crud'],
                batchSize: 1, // 串行模式下批次大小为1
                successCriteria: '80_percent_pass',
                failureAction: 'continue_with_warning',
                retryStrategy: {
                    maxRetries: 2,
                    backoffMultiplier: 1.5
                }
            },

            business: {
                id: 'business',
                name: '业务逻辑测试阶段',
                description: '具体业务功能测试',
                order: 3,
                concurrency: 1, // 默认串行执行，稳定优先
                maxConcurrency: 6, // 并行模式时的最大并发数
                timeout: 900000, // 15分钟
                testCategories: ['business-logic', 'workflows', 'validation'],
                batchSize: 1, // 串行模式下批次大小为1
                dependsOn: ['foundation'],
                successCriteria: '75_percent_pass',
                failureAction: 'fail_phase',
                parallelGroups: {
                    'user-management': ['user-create', 'user-update', 'user-delete'],
                    'order-processing': ['order-create', 'order-payment', 'order-fulfillment'],
                    'reporting': ['report-generation', 'report-export', 'report-filters']
                }
            },

            integration: {
                id: 'integration',
                name: '集成测试阶段',
                description: '跨模块集成测试',
                order: 4,
                concurrency: 2, // 低并发，确保顺序
                timeout: 1200000, // 20分钟
                testCategories: ['integration', 'end-to-end', 'cross-module'],
                dependsOn: ['business'],
                successCriteria: 'all_critical_pass',
                failureAction: 'fail_all',
                sequentialGroups: [
                    'user-order-integration',
                    'payment-reporting-integration',
                    'full-workflow-integration'
                ]
            },

            cleanup: {
                id: 'cleanup',
                name: '清理阶段',
                description: '测试数据清理、环境重置',
                order: 5,
                concurrency: 1,
                timeout: 180000, // 3分钟
                tasks: [
                    { name: 'cleanup-test-data', type: 'system', priority: 'high' },
                    { name: 'stop-services', type: 'system', priority: 'high' },
                    { name: 'generate-final-report', type: 'system', priority: 'high' }
                ],
                successCriteria: 'best_effort',
                failureAction: 'log_warning'
            }
        };
    }

    /**
     * 执行分阶段测试
     */
    async executePhasedTests(options = {}) {
        const {
            targetProjects = ['admin', 'front'],
            mode = 'serial', // 'serial', 'balanced', 'thorough' - 默认串行执行
            maxParallel = 1, // 默认非并发，适合笔记本环境
            failFast = false,
            verbose = false
        } = options;

        console.log('🚀 开始分阶段E2E测试执行');
        console.log(`📋 执行模式: ${mode}`);
        console.log(`🎯 目标项目: ${targetProjects.join(', ')}`);
        console.log(`${maxParallel === 1 ? '🔒 非并发模式（串行执行，适合笔记本）' : '⚡ 最大并发数: ' + maxParallel}`);

        const executionContext = {
            startTime: Date.now(),
            projects: targetProjects,
            mode,
            maxParallel,
            failFast,
            verbose,
            phaseResults: [],
            globalState: {}
        };

        try {
            // 初始化资源管理器
            await this.resourceManager.initialize();

            // 按顺序执行各个阶段
            for (const [phaseId, phase] of Object.entries(this.phases)) {
                const phaseResult = await this.executePhase(phaseId, phase, executionContext);

                executionContext.phaseResults.push(phaseResult);

                if (phaseResult.status === 'failed' && phase.failureAction === 'stop_all') {
                    console.log(`❌ ${phase.name}失败，停止执行`);
                    break;
                }

                if (failFast && phaseResult.status === 'failed') {
                    console.log(`❌ 快速失败模式：${phase.name}失败，终止执行`);
                    break;
                }
            }

            // 生成最终报告
            await this.generateFinalReport(executionContext);

        } catch (error) {
            console.error('❌ 分阶段执行过程中发生错误:', error);
            throw error;
        } finally {
            // 清理资源
            await this.resourceManager.cleanup();
        }
    }

    /**
     * 执行单个阶段
     */
    async executePhase(phaseId, phase, context) {
        console.log(`\n📍 开始执行阶段: ${phase.name}`);
        console.log(`📝 描述: ${phase.description}`);

        const phaseStartTime = Date.now();
        const phaseResult = {
            id: phaseId,
            name: phase.name,
            status: 'running',
            startTime: phaseStartTime,
            tasks: [],
            metrics: {}
        };

        try {
            // 检查依赖
            if (phase.dependsOn) {
                const dependenciesMet = this.checkPhaseDependencies(phase, context.phaseResults);
                if (!dependenciesMet) {
                    throw new Error(`阶段依赖未满足: ${phase.dependsOn.join(', ')}`);
                }
            }

            // 准备阶段任务
            const tasks = await this.preparePhaseTasks(phase, context);

            // 根据并发策略执行任务
            const taskResults = await this.executePhaseTasks(phase, tasks, context);

            // 评估阶段成功标准
            const success = this.evaluatePhaseSuccess(phase, taskResults);

            phaseResult.status = success ? 'success' : 'failed';
            phaseResult.tasks = taskResults;
            phaseResult.endTime = Date.now();
            phaseResult.duration = phaseResult.endTime - phaseResult.startTime;
            phaseResult.metrics = this.calculatePhaseMetrics(taskResults);

            console.log(`✅ ${phase.name}完成 - 状态: ${phaseResult.status}, 耗时: ${(phaseResult.duration/1000).toFixed(1)}秒`);

        } catch (error) {
            console.error(`❌ ${phase.name}执行失败:`, error.message);
            phaseResult.status = 'failed';
            phaseResult.error = error.message;
            phaseResult.endTime = Date.now();
            phaseResult.duration = phaseResult.endTime - phaseResult.startTime;
        }

        return phaseResult;
    }

    /**
     * 准备阶段任务
     */
    async preparePhaseTasks(phase, context) {
        if (phase.tasks) {
            // 系统任务阶段
            return phase.tasks.map(task => ({
                id: `${phase.id}-${task.name}`,
                name: task.name,
                type: 'system',
                priority: task.priority,
                project: null,
                estimatedDuration: this.estimateTaskDuration(task)
            }));
        } else {
            // 测试执行阶段
            const testTasks = [];

            for (const project of context.projects) {
                const projectTests = await this.discoverTestsForPhase(phase, project);
                testTasks.push(...projectTests);
            }

            // 应用批次策略
            return this.applyBatchStrategy(phase, testTasks);
        }
    }

    /**
     * 执行阶段任务
     */
    async executePhaseTasks(phase, tasks, context) {
        const concurrency = this.calculatePhaseConcurrency(phase, context);

        if (concurrency === 1 || phase.sequentialGroups) {
            // 串行执行
            return this.executeTasksSequentially(tasks, context);
        } else {
            // 并发执行
            return this.executeTasksConcurrently(tasks, concurrency, context);
        }
    }

    /**
     * 计算阶段并发数
     */
    calculatePhaseConcurrency(phase, context) {
        if (typeof phase.concurrency === 'number') {
            return phase.concurrency;
        }

        if (phase.concurrency === 'auto') {
            const availableResources = this.resourceManager.getAvailableConcurrency();
            return Math.min(phase.maxConcurrency || 4, availableResources, context.maxParallel);
        }

        return 2; // 默认并发数
    }

    /**
     * 串行执行任务
     */
    async executeTasksSequentially(tasks, context) {
        const results = [];

        for (const task of tasks) {
            const result = await this.executeSingleTask(task, context);
            results.push(result);

            if (context.failFast && result.status === 'failed') {
                break;
            }
        }

        return results;
    }

    /**
     * 并发执行任务
     */
    async executeTasksConcurrently(tasks, concurrency, context) {
        const results = [];
        const batches = this.createConcurrentBatches(tasks, concurrency);

        for (const batch of batches) {
            const batchPromises = batch.map(task =>
                this.executeSingleTask(task, context)
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // 检查是否需要提前停止
            const failedTasks = batchResults.filter(r => r.status === 'failed');
            if (context.failFast && failedTasks.length > 0) {
                break;
            }
        }

        return results;
    }

    /**
     * 执行单个任务
     */
    async executeSingleTask(task, context) {
        const taskStartTime = Date.now();
        const result = {
            id: task.id,
            name: task.name,
            type: task.type,
            project: task.project,
            status: 'running',
            startTime: taskStartTime
        };

        try {
            if (task.type === 'system') {
                await this.executeSystemTask(task, context);
            } else {
                await this.executeTestTask(task, context);
            }

            result.status = 'success';

        } catch (error) {
            result.status = 'failed';
            result.error = error.message;
            console.error(`❌ 任务 ${task.name} 失败:`, error.message);
        }

        result.endTime = Date.now();
        result.duration = result.endTime - result.startTime;

        return result;
    }

    /**
     * 执行系统任务
     */
    async executeSystemTask(task, context) {
        switch (task.name) {
            case 'check-environment':
                await this.checkEnvironment();
                break;
            case 'install-dependencies':
                await this.installDependencies(context.projects);
                break;
            case 'reset-database':
                await this.resetDatabase();
                break;
            case 'start-services':
                await this.startServices();
                break;
            case 'cleanup-test-data':
                await this.cleanupTestData();
                break;
            case 'stop-services':
                await this.stopServices();
                break;
            case 'generate-final-report':
                await this.generateFinalReport(context);
                break;
            default:
                throw new Error(`未知的系统任务: ${task.name}`);
        }
    }

    /**
     * 执行测试任务
     */
    async executeTestTask(task, context) {
        const projectPath = `springboot1ngh61a2/src/main/resources/${task.project}/${task.project}`;

        return new Promise((resolve, reject) => {
            let testCommand;
            let testArgs = [];

            if (task.files && task.files.length > 0) {
                // 运行指定的测试文件
                testCommand = 'npx';
                testArgs = ['playwright', 'test', ...task.files];
            } else {
                // 运行所有测试
                testCommand = 'npm';
                testArgs = ['run', 'test:e2e'];
            }

            const env = {
                ...process.env,
                E2E_PARALLEL: context.mode === 'serial' ? 'false' : 'true',
                E2E_BASE_URL: `http://127.0.0.1:${task.project === 'admin' ? 8081 : 8082}`,
                E2E_PORT: task.project === 'admin' ? '8081' : '8082',
                NODE_ENV: 'test',
                CI: process.env.CI || 'false'
            };

            if (context.verbose) {
                console.log(`🔧 执行测试命令: ${testCommand} ${testArgs.join(' ')}`);
                console.log(`📁 工作目录: ${projectPath}`);
            }

            const child = spawn(testCommand, testArgs, {
                cwd: projectPath,
                stdio: context.verbose ? 'inherit' : ['pipe', 'pipe', 'pipe'],
                env
            });

            let stdout = '';
            let stderr = '';

            if (!context.verbose) {
                child.stdout?.on('data', (data) => {
                    stdout += data.toString();
                });

                child.stderr?.on('data', (data) => {
                    stderr += data.toString();
                });
            }

            child.on('close', (code) => {
                if (code === 0) {
                    if (context.verbose) {
                        console.log(`✅ 测试任务 ${task.name} 成功完成`);
                    }
                    resolve();
                } else {
                    const errorMsg = stderr || stdout || `退出码: ${code}`;
                    console.error(`❌ 测试任务 ${task.name} 失败: ${errorMsg}`);
                    reject(new Error(`测试执行失败: ${errorMsg}`));
                }
            });

            child.on('error', (error) => {
                console.error(`❌ 测试任务 ${task.name} 启动失败:`, error);
                reject(error);
            });

            // 设置超时
            const timeout = task.estimatedDuration || 300000; // 5分钟默认超时
            setTimeout(() => {
                child.kill('SIGTERM');
                reject(new Error(`测试执行超时 (${timeout/1000}秒)`));
            }, timeout);
        });
    }

    /**
     * 检查阶段依赖
     */
    checkPhaseDependencies(phase, previousResults) {
        if (!phase.dependsOn) return true;

        return phase.dependsOn.every(depPhaseId => {
            const depResult = previousResults.find(r => r.id === depPhaseId);
            return depResult && depResult.status === 'success';
        });
    }

    /**
     * 评估阶段成功标准
     */
    evaluatePhaseSuccess(phase, taskResults) {
        const totalTasks = taskResults.length;
        const passedTasks = taskResults.filter(r => r.status === 'success').length;
        const passRate = totalTasks > 0 ? (passedTasks / totalTasks) * 100 : 0;

        switch (phase.successCriteria) {
            case 'all_tasks_pass':
                return passRate === 100;
            case '80_percent_pass':
                return passRate >= 80;
            case '75_percent_pass':
                return passRate >= 75;
            case 'all_critical_pass':
                return this.checkCriticalTasksPass(taskResults);
            case 'best_effort':
                return true; // 清理阶段总是成功
            default:
                return passRate >= 50;
        }
    }

    /**
     * 检查关键任务是否通过
     */
    checkCriticalTasksPass(taskResults) {
        const criticalTasks = taskResults.filter(r => r.priority === 'high');
        return criticalTasks.every(r => r.status === 'success');
    }

    /**
     * 计算阶段指标
     */
    calculatePhaseMetrics(taskResults) {
        const totalTasks = taskResults.length;
        const passedTasks = taskResults.filter(r => r.status === 'success').length;
        const failedTasks = taskResults.filter(r => r.status === 'failed').length;
        const totalDuration = taskResults.reduce((sum, r) => sum + r.duration, 0);
        const avgDuration = totalTasks > 0 ? totalDuration / totalTasks : 0;

        return {
            totalTasks,
            passedTasks,
            failedTasks,
            passRate: totalTasks > 0 ? (passedTasks / totalTasks) * 100 : 0,
            totalDuration,
            avgDuration,
            minDuration: Math.min(...taskResults.map(r => r.duration)),
            maxDuration: Math.max(...taskResults.map(r => r.duration))
        };
    }

    /**
     * 生成最终报告
     */
    async generateFinalReport(context) {
        const reportPath = 'phased-e2e-execution-report';
        if (!fs.existsSync(reportPath)) {
            fs.mkdirSync(reportPath, { recursive: true });
        }

        const report = {
            timestamp: new Date().toISOString(),
            execution: {
                mode: context.mode,
                projects: context.projects,
                maxParallel: context.maxParallel,
                failFast: context.failFast,
                totalDuration: Date.now() - context.startTime
            },
            phases: context.phaseResults,
            summary: this.calculateExecutionSummary(context.phaseResults)
        };

        // 生成JSON报告
        const jsonPath = path.join(reportPath, 'phased-execution-report.json');
        fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

        // 生成HTML报告
        const htmlPath = path.join(reportPath, 'phased-execution-report.html');
        const htmlReport = this.generateHtmlReport(report);
        fs.writeFileSync(htmlPath, htmlReport);

        console.log(`📊 分阶段执行报告已生成:`);
        console.log(`   JSON: ${jsonPath}`);
        console.log(`   HTML: ${htmlPath}`);
    }

    /**
     * 计算执行汇总
     */
    calculateExecutionSummary(phaseResults) {
        const totalPhases = phaseResults.length;
        const successfulPhases = phaseResults.filter(r => r.status === 'success').length;
        const failedPhases = phaseResults.filter(r => r.status === 'failed').length;
        const totalTasks = phaseResults.reduce((sum, phase) =>
            sum + (phase.metrics?.totalTasks || 0), 0);
        const passedTasks = phaseResults.reduce((sum, phase) =>
            sum + (phase.metrics?.passedTasks || 0), 0);

        return {
            totalPhases,
            successfulPhases,
            failedPhases,
            successRate: totalPhases > 0 ? (successfulPhases / totalPhases) * 100 : 0,
            totalTasks,
            passedTasks,
            overallPassRate: totalTasks > 0 ? (passedTasks / totalTasks) * 100 : 0,
            totalDuration: phaseResults.reduce((sum, phase) => sum + (phase.duration || 0), 0)
        };
    }

    /**
     * 生成HTML报告
     */
    generateHtmlReport(report) {
        // 这里实现HTML报告生成，暂时返回简化版本
        return `
<!DOCTYPE html>
<html>
<head>
    <title>分阶段E2E执行报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .phase { border: 1px solid #ccc; margin: 10px 0; padding: 10px; }
        .success { border-color: #28a745; background: #d4edda; }
        .failed { border-color: #dc3545; background: #f8d7da; }
        .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>分阶段E2E执行报告</h1>
    <div class="summary">
        <h2>执行汇总</h2>
        <p>总阶段数: ${report.summary.totalPhases}</p>
        <p>成功阶段: ${report.summary.successfulPhases}</p>
        <p>失败阶段: ${report.summary.failedPhases}</p>
        <p>成功率: ${report.summary.successRate.toFixed(1)}%</p>
        <p>总任务数: ${report.summary.totalTasks}</p>
        <p>通过任务: ${report.summary.passedTasks}</p>
        <p>总通过率: ${report.summary.overallPassRate.toFixed(1)}%</p>
        <p>总耗时: ${(report.summary.totalDuration / 1000).toFixed(1)}秒</p>
    </div>

    <h2>阶段详情</h2>
    ${report.phases.map(phase => `
        <div class="phase ${phase.status}">
            <h3>${phase.name} (${phase.status})</h3>
            <p>耗时: ${(phase.duration / 1000).toFixed(1)}秒</p>
            ${phase.metrics ? `
                <p>任务数: ${phase.metrics.totalTasks}, 通过: ${phase.metrics.passedTasks}, 失败: ${phase.metrics.failedTasks}</p>
                <p>通过率: ${phase.metrics.passRate.toFixed(1)}%</p>
            ` : ''}
            ${phase.error ? `<p class="error">错误: ${phase.error}</p>` : ''}
        </div>
    `).join('')}
</body>
</html>`;
    }

    /**
     * 检查测试环境
     */
    async checkEnvironment() {
        console.log('🔍 检查测试环境...');

        const checks = [
            { name: 'Node.js', command: 'node --version', required: true },
            { name: 'npm', command: 'npm --version', required: true },
            { name: 'Java', command: 'java -version', required: true },
            { name: 'Maven', command: 'mvn --version', required: true }
        ];

        let allPassed = true;

        for (const check of checks) {
            try {
                const result = await this.runCommand(check.command);
                console.log(`✅ ${check.name}: ${result.trim()}`);
            } catch (error) {
                if (check.required) {
                    console.error(`❌ ${check.name} 未找到或无法运行: ${error.message}`);
                    allPassed = false;
                } else {
                    console.warn(`⚠️ ${check.name} 检查失败: ${error.message}`);
                }
            }
        }

        // 检查端口可用性
        const ports = [8080, 8081, 8082, 5173, 3000];
        for (const port of ports) {
            try {
                const result = await this.runCommand(`netstat -an | find ":${port} "`, { ignoreErrors: true });
                if (result) {
                    console.warn(`⚠️ 端口 ${port} 可能已被占用`);
                } else {
                    console.log(`✅ 端口 ${port} 可用`);
                }
            } catch (error) {
                // 忽略端口检查错误
            }
        }

        if (!allPassed) {
            throw new Error('环境检查失败，缺少必要组件');
        }

        console.log('✅ 环境检查完成');
    }

    /**
     * 安装项目依赖
     */
    async installDependencies(projects) {
        console.log('📦 安装项目依赖...');

        for (const project of projects) {
            const projectPath = `springboot1ngh61a2/src/main/resources/${project}/${project}`;

            if (!fs.existsSync(projectPath)) {
                console.warn(`⚠️ 项目路径不存在: ${projectPath}`);
                continue;
            }

            console.log(`📦 安装 ${project} 项目的依赖...`);

            try {
                // 清理缓存
                await this.runCommand('npm cache clean --force', { cwd: projectPath, ignoreErrors: true });

                // 安装依赖
                await this.runCommand('npm install', { cwd: projectPath, timeout: 300000 });

                console.log(`✅ ${project} 项目依赖安装完成`);
            } catch (error) {
                console.error(`❌ ${project} 项目依赖安装失败: ${error.message}`);
                throw error;
            }
        }

        console.log('✅ 所有项目依赖安装完成');
    }

    /**
     * 重置测试数据库
     */
    async resetDatabase() {
        console.log('🗄️ 重置测试数据库...');

        try {
            // 停止数据库服务（如果正在运行）
            await this.runCommand('powershell.exe -ExecutionPolicy Bypass -File stop-db.ps1', { ignoreErrors: true });

            // 等待服务停止
            await new Promise(resolve => setTimeout(resolve, 5000));

            // 启动数据库
            await this.runCommand('powershell.exe -ExecutionPolicy Bypass -File start-db.ps1');

            // 等待数据库启动
            await new Promise(resolve => setTimeout(resolve, 10000));

            // 清理测试数据
            await this.runCommand('powershell.exe -ExecutionPolicy Bypass -File reset-admin-password.ps1');

            // 验证数据库连接 - 使用 pg_isready
            const testConnection = await this.runCommand('docker exec fitness_gym_postgres pg_isready -U postgres -d fitness_gym', { ignoreErrors: true });
            if (testConnection.includes('accepting connections')) {
                console.log('✅ 数据库连接验证成功');
            } else {
                console.warn('⚠️ 数据库连接验证失败，但继续执行');
            }

            console.log('✅ 数据库重置完成');

        } catch (error) {
            console.error(`❌ 数据库重置失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 启动测试服务
     */
    async startServices() {
        console.log('🚀 启动测试服务...');

        try {
            // 启动后端服务
            console.log('🚀 启动后端服务...');
            const backendJob = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', 'start-all.ps1'], {
                stdio: 'pipe',
                detached: true
            });

            // 等待后端服务启动
            console.log('⏳ 等待后端服务启动...');
            let backendReady = false;
            let attempts = 0;
            const maxAttempts = 30; // 最多等待5分钟

            while (!backendReady && attempts < maxAttempts) {
                try {
                    await new Promise(resolve => setTimeout(resolve, 10000)); // 每10秒检查一次
                    attempts++;

                    // 检查多个可能的端点
                    const endpoints = [
                        'curl -f http://localhost:8080/actuator/health',
                        'curl -f http://localhost:8080/api/health',
                        'curl -f http://localhost:8080/health',
                        'curl -f http://localhost:8080/'
                    ];

                    for (const endpoint of endpoints) {
                        try {
                            const response = await this.runCommand(endpoint, { ignoreErrors: true, timeout: 5000 });
                            if (response && (response.includes('status') || response.includes('200') || response.includes('OK') || response.includes('success'))) {
                                backendReady = true;
                                console.log(`✅ 后端服务启动成功 (端点: ${endpoint})`);
                                break;
                            }
                        } catch (e) {
                            // 继续尝试下一个端点
                        }
                    }
                } catch (error) {
                    console.log(`⏳ 后端服务启动中... (尝试 ${attempts}/${maxAttempts})`);
                }
            }

            if (!backendReady) {
                throw new Error('后端服务启动超时');
            }

            // 启动前端服务
            console.log('🚀 启动前端服务...');
            const projects = ['admin', 'front'];

            for (const project of projects) {
                const projectPath = `springboot1ngh61a2/src/main/resources/${project}/${project}`;
                const port = project === 'admin' ? '8081' : '8082';

                console.log(`🚀 启动 ${project} 前端服务 (端口 ${port})...`);

                const frontendProcess = spawn('npm', ['run', 'dev', '--', '--host', '0.0.0.0', '--port', port], {
                    cwd: projectPath,
                    stdio: 'pipe',
                    detached: true
                });

                // 等待前端服务启动
                let frontendReady = false;
                let frontendAttempts = 0;
                const maxFrontendAttempts = 20; // 最多等待2分钟

                while (!frontendReady && frontendAttempts < maxFrontendAttempts) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 6000)); // 每6秒检查一次
                        frontendAttempts++;

                        const response = await this.runCommand(
                            `curl -f http://localhost:${port}`,
                            { ignoreErrors: true, timeout: 3000 }
                        );

                        if (response) {
                            frontendReady = true;
                            console.log(`✅ ${project} 前端服务启动成功 (端口 ${port})`);
                        }
                    } catch (error) {
                        console.log(`⏳ ${project} 前端服务启动中... (尝试 ${frontendAttempts}/${maxFrontendAttempts})`);
                    }
                }

                if (!frontendReady) {
                    console.warn(`⚠️ ${project} 前端服务启动可能失败，继续执行测试`);
                }
            }

            console.log('✅ 所有服务启动完成');

        } catch (error) {
            console.error(`❌ 服务启动失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 清理测试数据
     */
    async cleanupTestData() {
        console.log('🧹 清理测试数据...');

        try {
            // 运行清理脚本
            await this.runCommand('powershell.exe -ExecutionPolicy Bypass -File cleanup-test-data.sql', { ignoreErrors: true });

            // 清理测试截图和报告
            const cleanupDirs = [
                'test-results/screenshots',
                'playwright-report',
                'phased-e2e-execution-report'
            ];

            for (const dir of cleanupDirs) {
                if (fs.existsSync(dir)) {
                    // 删除目录内容但保留目录结构
                    const files = fs.readdirSync(dir);
                    for (const file of files) {
                        const filePath = path.join(dir, file);
                        try {
                            if (fs.statSync(filePath).isFile()) {
                                fs.unlinkSync(filePath);
                            }
                        } catch (error) {
                            console.warn(`⚠️ 无法删除文件: ${filePath}`);
                        }
                    }
                }
            }

            console.log('✅ 测试数据清理完成');

        } catch (error) {
            console.warn(`⚠️ 测试数据清理部分失败: ${error.message}`);
            // 不抛出错误，因为清理失败不应该阻挡测试执行
        }
    }

    /**
     * 停止测试服务
     */
    async stopServices() {
        console.log('🛑 停止测试服务...');

        try {
            // 停止后端服务
            await this.runCommand('powershell.exe -ExecutionPolicy Bypass -File stop-all.ps1', { ignoreErrors: true });

            // 停止前端服务进程
            const projects = ['admin', 'front'];
            for (const project of projects) {
                const port = project === 'admin' ? '8081' : '8082';
                try {
                    // 查找并终止占用端口的进程
                    await this.runCommand(`for /f "tokens=5" %a in ('netstat -ano ^| find ":${port} "') do taskkill /f /pid %a`, { ignoreErrors: true });
                } catch (error) {
                    // 忽略进程终止错误
                }
            }

            // 等待服务完全停止
            await new Promise(resolve => setTimeout(resolve, 5000));

            console.log('✅ 服务停止完成');

        } catch (error) {
            console.warn(`⚠️ 服务停止部分失败: ${error.message}`);
            // 不抛出错误，因为停止失败通常不影响后续操作
        }
    }

    /**
     * 运行命令的辅助方法
     */
    async runCommand(command, options = {}) {
        const { cwd, ignoreErrors = false, timeout = 60000 } = options;

        return new Promise((resolve, reject) => {
            const child = spawn('cmd.exe', ['/c', command], {
                cwd,
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            const timer = setTimeout(() => {
                child.kill('SIGTERM');
                reject(new Error(`命令执行超时: ${command}`));
            }, timeout);

            child.on('close', (code) => {
                clearTimeout(timer);
                if (code === 0 || ignoreErrors) {
                    resolve(stdout || stderr);
                } else {
                    reject(new Error(`命令失败 (退出码 ${code}): ${stderr || stdout}`));
                }
            });

            child.on('error', (error) => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }

    /**
     * 估算任务执行时长
     */
    estimateTaskDuration(task) {
        // 基于任务类型和名称估算执行时间
        if (task.type === 'system') {
            switch (task.name) {
                case 'check-environment':
                    return 10000; // 10秒
                case 'install-dependencies':
                    return 120000; // 2分钟
                case 'reset-database':
                    return 30000; // 30秒
                case 'start-services':
                    return 60000; // 1分钟
                case 'cleanup-test-data':
                    return 20000; // 20秒
                case 'stop-services':
                    return 15000; // 15秒
                case 'generate-final-report':
                    return 10000; // 10秒
                default:
                    return 30000; // 30秒默认
            }
        } else {
            // 测试任务估算时间
            const testCount = task.files?.length || 1;
            const baseTimePerTest = 45000; // 每个测试45秒（包括设置时间）
            return Math.max(testCount * baseTimePerTest, 60000); // 最少1分钟
        }
    }

    /**
     * 发现阶段对应的测试文件
     */
    async discoverTestsForPhase(phase, project) {
        const testDir = `springboot1ngh61a2/src/main/resources/${project}/${project}/tests/e2e`;
        const tasks = [];

        try {
            if (!fs.existsSync(testDir)) {
                console.warn(`⚠️ 测试目录不存在: ${testDir}`);
                return tasks;
            }

            const testFiles = fs.readdirSync(testDir)
                .filter(file => file.endsWith('.spec.ts') || file.endsWith('.test.ts'))
                .map(file => path.join(testDir, file));

            if (testFiles.length === 0) {
                console.warn(`⚠️ 未找到测试文件在: ${testDir}`);
                return tasks;
            }

            // 根据阶段分类测试文件
            const categorizedFiles = this.categorizeTestFiles(testFiles, phase);

            if (categorizedFiles.length === 0) {
                console.warn(`⚠️ 阶段 ${phase.id} 没有匹配的测试文件`);
                return tasks;
            }

            // 创建测试任务
            if (phase.batchSize && phase.batchSize > 1) {
                // 批次执行
                const batches = this.createTestBatches(categorizedFiles, phase.batchSize);
                batches.forEach((batch, index) => {
                    tasks.push({
                        id: `${phase.id}-${project}-batch-${index + 1}`,
                        name: `${project}-${phase.id}-batch-${index + 1}`,
                        type: 'test',
                        project: project,
                        files: batch,
                        estimatedDuration: this.estimateTaskDuration({ type: 'test', files: batch }),
                        priority: 'medium'
                    });
                });
            } else {
                // 单文件执行
                categorizedFiles.forEach(file => {
                    const fileName = path.basename(file, path.extname(file));
                    tasks.push({
                        id: `${phase.id}-${project}-${fileName}`,
                        name: `${project}-${fileName}`,
                        type: 'test',
                        project: project,
                        files: [file],
                        estimatedDuration: this.estimateTaskDuration({ type: 'test', files: [file] }),
                        priority: 'medium'
                    });
                });
            }

        } catch (error) {
            console.error(`❌ 发现测试文件失败 (${project}):`, error.message);
        }

        return tasks;
    }

    /**
     * 根据阶段分类测试文件
     */
    categorizeTestFiles(testFiles, phase) {
        const categorized = [];

        for (const file of testFiles) {
            const fileName = path.basename(file).toLowerCase();

            // 根据阶段和文件名匹配
            let matchesPhase = false;

            switch (phase.id) {
                case 'foundation':
                    // 基础功能：认证、导航、基础CRUD
                    matchesPhase = fileName.includes('auth') ||
                                  fileName.includes('login') ||
                                  fileName.includes('pages') ||
                                  fileName.includes('crud') ||
                                  fileName.includes('navigation');
                    break;

                case 'business':
                    // 业务逻辑：预约、支付、用户管理等
                    matchesPhase = fileName.includes('booking') ||
                                  fileName.includes('payment') ||
                                  fileName.includes('profile') ||
                                  fileName.includes('favorites') ||
                                  fileName.includes('membership') ||
                                  fileName.includes('news') ||
                                  fileName.includes('chat');
                    break;

                case 'integration':
                    // 集成测试：跨模块测试、端到端流程
                    matchesPhase = fileName.includes('user-journey') ||
                                  fileName.includes('integration') ||
                                  fileName.includes('flow') ||
                                  fileName.includes('complete') ||
                                  fileName.includes('end-to-end');
                    break;

                default:
                    matchesPhase = true; // 其他阶段包含所有测试
            }

            if (matchesPhase) {
                categorized.push(file);
            }
        }

        return categorized;
    }

    /**
     * 创建测试批次
     */
    createTestBatches(testFiles, batchSize) {
        const batches = [];
        for (let i = 0; i < testFiles.length; i += batchSize) {
            batches.push(testFiles.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * 应用批次策略
     */
    applyBatchStrategy(phase, tasks) {
        if (!phase.batchSize || phase.batchSize <= 1) {
            return tasks;
        }

        // 根据任务数量和批次大小重新分组
        const batchedTasks = [];
        for (let i = 0; i < tasks.length; i += phase.batchSize) {
            const batch = tasks.slice(i, i + phase.batchSize);
            const combinedTask = {
                id: `${phase.id}-batch-${Math.floor(i / phase.batchSize) + 1}`,
                name: `${phase.id}-batch-${Math.floor(i / phase.batchSize) + 1}`,
                type: 'test',
                project: batch[0].project,
                files: batch.flatMap(task => task.files || []),
                estimatedDuration: batch.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0),
                priority: batch.some(task => task.priority === 'high') ? 'high' : 'medium'
            };
            batchedTasks.push(combinedTask);
        }

        return batchedTasks;
    }
    createConcurrentBatches(tasks, concurrency) {
        const batches = [];
        for (let i = 0; i < tasks.length; i += concurrency) {
            batches.push(tasks.slice(i, i + concurrency));
        }
        return batches;
    }
}

// 资源管理器类
class ResourceManager {
    async initialize() { /* 实现资源初始化 */ }
    getAvailableConcurrency() { return 4; }
    async cleanup() { /* 实现资源清理 */ }
}

// 阶段状态管理器类
class PhaseStateManager {
    // 实现跨阶段状态管理
}

// 测试依赖分析器类
class TestDependencyAnalyzer {
    // 实现测试依赖分析
}

// 如果直接运行此脚本
if (require.main === module) {
    const manager = new PhasedE2EExecutionManager();

    // 解析命令行参数
    const args = process.argv.slice(2);
    const options = {
        targetProjects: ['admin', 'front'], // 默认包含两个前端项目
        mode: 'serial', // 默认串行模式，适合笔记本
        maxParallel: 1, // 默认非并发
        failFast: false,
        verbose: false
    };

    // 解析参数
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--fast':
                options.mode = 'balanced';
                options.maxParallel = 4;
                break;
            case '--thorough':
                options.mode = 'thorough';
                options.maxParallel = 2;
                break;
            case '--serial':
                options.mode = 'serial';
                options.maxParallel = 1;
                break;
            case '--fail-fast':
                options.failFast = true;
                break;
            case '--verbose':
                options.verbose = true;
                break;
            case '--only-admin':
                options.targetProjects = ['admin'];
                break;
            case '--only-front':
                options.targetProjects = ['front'];
                break;
            default:
                if (arg.startsWith('--max-parallel=')) {
                    options.maxParallel = parseInt(arg.split('=')[1]);
                } else if (arg.startsWith('--projects=')) {
                    options.targetProjects = arg.split('=')[1].split(',');
                }
                break;
        }
    }

    console.log('🚀 启动分阶段E2E测试执行...');
    console.log(`📋 配置: ${JSON.stringify(options, null, 2)}\n`);

    manager.executePhasedTests(options).catch(error => {
        console.error('❌ 分阶段执行失败:', error);
        process.exit(1);
    });
}

module.exports = PhasedE2EExecutionManager;
