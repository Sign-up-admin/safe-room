#!/usr/bin/env node

/**
 * 阶段内动态并发控制器
 * 根据系统资源、测试状态和性能指标动态调整并发执行参数
 */

const os = require('os');
const { performance } = require('perf_hooks');

class PhaseConcurrencyController {
    constructor(options = {}) {
        this.options = {
            minConcurrency: options.minConcurrency || 1,
            maxConcurrency: options.maxConcurrency || 8,
            targetCpuUsage: options.targetCpuUsage || 70, // 目标CPU使用率 %
            targetMemoryUsage: options.targetMemoryUsage || 80, // 目标内存使用率 %
            adjustmentInterval: options.adjustmentInterval || 5000, // 调整间隔 ms
            monitoringWindow: options.monitoringWindow || 10000, // 监控窗口 ms
            adaptiveMode: options.adaptiveMode !== false, // 自适应模式
            ...options
        };

        this.currentConcurrency = this.options.minConcurrency;
        this.monitoringData = [];
        this.adjustmentTimer = null;
        this.isRunning = false;

        // 性能指标历史
        this.performanceHistory = {
            cpu: [],
            memory: [],
            responseTime: [],
            errorRate: []
        };
    }

    /**
     * 开始并发控制
     */
    async start(phase, initialTasks = []) {
        console.log(`🚀 启动阶段并发控制器 - ${phase.name}`);
        console.log(`📊 初始并发数: ${this.currentConcurrency}`);

        this.isRunning = true;
        this.phase = phase;
        this.activeTasks = new Set(initialTasks);

        // 启动监控和调整
        this.startMonitoring();

        // 仅在并发模式下启用自适应调整
        if (this.currentConcurrency > 1 && this.options.adaptiveMode) {
            this.startAdaptiveAdjustment();
        } else if (this.currentConcurrency === 1) {
            console.log('🔒 非并发模式：跳过自适应调整');
        }

        return {
            getCurrentConcurrency: () => this.currentConcurrency,
            updateTaskStatus: (taskId, status) => this.updateTaskStatus(taskId, status),
            addTasks: (tasks) => this.addTasks(tasks),
            removeTasks: (tasks) => this.removeTasks(tasks),
            getMetrics: () => this.getCurrentMetrics(),
            stop: () => this.stop()
        };
    }

    /**
     * 停止并发控制
     */
    stop() {
        console.log('🛑 停止阶段并发控制器');
        this.isRunning = false;

        if (this.adjustmentTimer) {
            clearInterval(this.adjustmentTimer);
            this.adjustmentTimer = null;
        }
    }

    /**
     * 启动系统监控
     */
    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            if (!this.isRunning) return;

            const metrics = this.collectSystemMetrics();
            this.monitoringData.push({
                timestamp: Date.now(),
                ...metrics
            });

            // 保持监控窗口大小
            const cutoffTime = Date.now() - this.options.monitoringWindow;
            this.monitoringData = this.monitoringData.filter(
                data => data.timestamp > cutoffTime
            );

            // 更新性能历史
            this.updatePerformanceHistory(metrics);

        }, 1000); // 每秒收集一次
    }

    /**
     * 启动自适应调整
     */
    startAdaptiveAdjustment() {
        if (!this.options.adaptiveMode) return;

        this.adjustmentTimer = setInterval(() => {
            if (!this.isRunning) return;

            this.performAdaptiveAdjustment();
        }, this.options.adjustmentInterval);
    }

    /**
     * 收集系统指标
     */
    collectSystemMetrics() {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        cpus.forEach(cpu => {
            for (let type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });

        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        const cpuUsage = 100 - ~~(100 * idle / total);

        // 内存使用率
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

        // 活动任务数
        const activeTaskCount = this.activeTasks.size;

        // 计算平均响应时间（如果有数据）
        const recentData = this.monitoringData.slice(-10);
        const avgResponseTime = recentData.length > 0
            ? recentData.reduce((sum, data) => sum + (data.avgResponseTime || 0), 0) / recentData.length
            : 0;

        return {
            cpuUsage,
            memoryUsage,
            activeTaskCount,
            avgResponseTime,
            systemLoad: os.loadavg()[0], // 1分钟平均负载
            timestamp: Date.now()
        };
    }

    /**
     * 更新性能历史
     */
    updatePerformanceHistory(metrics) {
        const maxHistorySize = 100;

        this.performanceHistory.cpu.push(metrics.cpuUsage);
        this.performanceHistory.memory.push(metrics.memoryUsage);

        if (this.performanceHistory.cpu.length > maxHistorySize) {
            this.performanceHistory.cpu.shift();
            this.performanceHistory.memory.shift();
        }
    }

    /**
     * 执行自适应调整
     */
    performAdaptiveAdjustment() {
        const currentMetrics = this.getCurrentMetrics();

        if (!currentMetrics) return;

        const newConcurrency = this.calculateOptimalConcurrency(currentMetrics);

        if (newConcurrency !== this.currentConcurrency) {
            console.log(`🔄 调整并发数: ${this.currentConcurrency} → ${newConcurrency}`);
            console.log(`   原因: CPU ${currentMetrics.cpuUsage.toFixed(1)}%, 内存 ${currentMetrics.memoryUsage.toFixed(1)}%`);

            this.currentConcurrency = newConcurrency;
        }
    }

    /**
     * 计算最优并发数
     */
    calculateOptimalConcurrency(metrics) {
        let targetConcurrency = this.currentConcurrency;

        // CPU使用率调整
        if (metrics.cpuUsage > this.options.targetCpuUsage + 10) {
            // CPU过高，减少并发
            targetConcurrency = Math.max(this.options.minConcurrency, targetConcurrency - 1);
        } else if (metrics.cpuUsage < this.options.targetCpuUsage - 10) {
            // CPU较低，增加并发
            targetConcurrency = Math.min(this.options.maxConcurrency, targetConcurrency + 1);
        }

        // 内存使用率调整
        if (metrics.memoryUsage > this.options.targetMemoryUsage + 5) {
            // 内存过高，减少并发
            targetConcurrency = Math.max(this.options.minConcurrency, targetConcurrency - 1);
        }

        // 系统负载调整
        if (metrics.systemLoad > os.cpus().length * 0.8) {
            // 系统负载过高，减少并发
            targetConcurrency = Math.max(this.options.minConcurrency, targetConcurrency - 1);
        }

        // 阶段特定调整
        targetConcurrency = this.applyPhaseSpecificAdjustment(targetConcurrency, metrics);

        // 确保在有效范围内
        return Math.max(this.options.minConcurrency,
               Math.min(this.options.maxConcurrency, targetConcurrency));
    }

    /**
     * 应用阶段特定调整
     */
    applyPhaseSpecificAdjustment(concurrency, metrics) {
        if (!this.phase) return concurrency;

        switch (this.phase.id) {
            case 'foundation':
                // 基础阶段可以更高并发，但要控制资源
                return Math.min(concurrency, 6);

            case 'business':
                // 业务阶段中等并发，避免状态冲突
                return Math.min(concurrency, 4);

            case 'integration':
                // 集成阶段低并发，确保顺序和稳定性
                return Math.min(concurrency, 2);

            case 'preparation':
            case 'cleanup':
                // 准备和清理阶段通常串行
                return 1;

            default:
                return concurrency;
        }
    }

    /**
     * 更新任务状态
     */
    updateTaskStatus(taskId, status) {
        if (status === 'started') {
            this.activeTasks.add(taskId);
        } else if (status === 'completed' || status === 'failed') {
            this.activeTasks.delete(taskId);
        }

        // 记录任务完成时间用于响应时间计算
        if (status === 'completed' || status === 'failed') {
            // 这里可以记录任务的实际执行时间
            // 用于后续的响应时间计算
        }
    }

    /**
     * 添加任务
     */
    addTasks(tasks) {
        tasks.forEach(task => this.activeTasks.add(task.id));
    }

    /**
     * 移除任务
     */
    removeTasks(tasks) {
        tasks.forEach(task => this.activeTasks.delete(task.id));
    }

    /**
     * 获取当前指标
     */
    getCurrentMetrics() {
        if (this.monitoringData.length === 0) return null;

        const recentData = this.monitoringData.slice(-5); // 最近5个数据点
        const latest = recentData[recentData.length - 1];

        return {
            cpuUsage: latest.cpuUsage,
            memoryUsage: latest.memoryUsage,
            activeTaskCount: this.activeTasks.size,
            avgResponseTime: recentData.reduce((sum, data) => sum + (data.avgResponseTime || 0), 0) / recentData.length,
            systemLoad: latest.systemLoad,
            currentConcurrency: this.currentConcurrency,
            timestamp: latest.timestamp
        };
    }

    /**
     * 获取性能趋势
     */
    getPerformanceTrends() {
        const cpuTrend = this.calculateTrend(this.performanceHistory.cpu);
        const memoryTrend = this.calculateTrend(this.performanceHistory.memory);

        return {
            cpuTrend, // 'increasing', 'decreasing', 'stable'
            memoryTrend,
            stability: this.calculateStability()
        };
    }

    /**
     * 计算趋势
     */
    calculateTrend(data) {
        if (data.length < 5) return 'unknown';

        const recent = data.slice(-5);
        const older = data.slice(-10, -5);

        if (older.length === 0) return 'stable';

        const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b) / older.length;

        const diff = recentAvg - olderAvg;

        if (Math.abs(diff) < 2) return 'stable';
        return diff > 0 ? 'increasing' : 'decreasing';
    }

    /**
     * 计算稳定性
     */
    calculateStability() {
        const cpuVariance = this.calculateVariance(this.performanceHistory.cpu);
        const memoryVariance = this.calculateVariance(this.performanceHistory.memory);

        const stabilityScore = (cpuVariance + memoryVariance) / 2;

        if (stabilityScore < 25) return 'high';
        if (stabilityScore < 100) return 'medium';
        return 'low';
    }

    /**
     * 计算方差
     */
    calculateVariance(data) {
        if (data.length < 2) return 0;

        const mean = data.reduce((a, b) => a + b) / data.length;
        const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;

        return variance;
    }

    /**
     * 获取并发控制建议
     */
    getConcurrencyRecommendations() {
        const metrics = this.getCurrentMetrics();
        const trends = this.getPerformanceTrends();

        const recommendations = [];

        if (metrics.cpuUsage > this.options.targetCpuUsage + 15) {
            recommendations.push({
                type: 'warning',
                message: `CPU使用率过高 (${metrics.cpuUsage.toFixed(1)}%)，建议减少并发数`,
                action: 'decrease'
            });
        }

        if (metrics.memoryUsage > this.options.targetMemoryUsage + 10) {
            recommendations.push({
                type: 'warning',
                message: `内存使用率过高 (${metrics.memoryUsage.toFixed(1)}%)，建议减少并发数`,
                action: 'decrease'
            });
        }

        if (trends.cpuTrend === 'increasing' && trends.memoryTrend === 'increasing') {
            recommendations.push({
                type: 'info',
                message: '系统负载持续上升，考虑减少并发数',
                action: 'decrease'
            });
        }

        if (trends.stability === 'low') {
            recommendations.push({
                type: 'info',
                message: '系统性能不稳定，建议降低并发数以提高稳定性',
                action: 'decrease'
            });
        }

        if (metrics.cpuUsage < this.options.targetCpuUsage - 20 &&
            metrics.memoryUsage < this.options.targetMemoryUsage - 20 &&
            trends.stability === 'high') {
            recommendations.push({
                type: 'info',
                message: '系统资源充足，可以考虑增加并发数',
                action: 'increase'
            });
        }

        return recommendations;
    }

    /**
     * 导出监控数据
     */
    exportMonitoringData() {
        return {
            monitoringData: this.monitoringData,
            performanceHistory: this.performanceHistory,
            currentConcurrency: this.currentConcurrency,
            recommendations: this.getConcurrencyRecommendations(),
            phase: this.phase?.id,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 重置控制器状态
     */
    reset() {
        this.stop();
        this.currentConcurrency = this.options.minConcurrency;
        this.monitoringData = [];
        this.activeTasks.clear();
        this.performanceHistory = {
            cpu: [],
            memory: [],
            responseTime: [],
            errorRate: []
        };
    }
}

module.exports = PhaseConcurrencyController;
