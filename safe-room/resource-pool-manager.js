#!/usr/bin/env node

/**
 * 智能资源池管理器
 * 管理系统资源（如数据库连接、浏览器实例、端口等）的分配和回收
 */

const { spawn } = require('child_process');
const os = require('os');

class ResourcePoolManager {
    constructor(options = {}) {
        this.options = {
            maxDbConnections: options.maxDbConnections || 10,
            maxBrowserInstances: options.maxBrowserInstances || 8,
            portRange: options.portRange || { start: 3000, end: 4000 },
            enableResourceTracking: options.enableResourceTracking !== false,
            cleanupInterval: options.cleanupInterval || 30000, // 30秒清理间隔
            resourceTimeout: options.resourceTimeout || 300000, // 5分钟超时
            ...options
        };

        this.pools = {
            database: new ResourcePool('database', this.options.maxDbConnections),
            browser: new ResourcePool('browser', this.options.maxBrowserInstances),
            port: new PortResourcePool(this.options.portRange),
            service: new ServiceResourcePool()
        };

        this.resourceTracker = new ResourceTracker();
        this.cleanupTimer = null;
        this.isInitialized = false;
    }

    /**
     * 初始化资源池
     */
    async initialize() {
        console.log('🔄 初始化智能资源池管理器...');

        try {
            // 初始化各个资源池
            for (const [poolName, pool] of Object.entries(this.pools)) {
                await pool.initialize();
                console.log(`✅ ${poolName}资源池初始化完成`);
            }

            // 启动资源跟踪
            if (this.options.enableResourceTracking) {
                this.startResourceTracking();
            }

            // 启动清理定时器
            this.startCleanupTimer();

            this.isInitialized = true;
            console.log('✅ 资源池管理器初始化完成');

        } catch (error) {
            console.error('❌ 资源池管理器初始化失败:', error);
            throw error;
        }
    }

    /**
     * 清理资源池
     */
    async cleanup() {
        console.log('🧹 清理资源池...');

        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }

        // 清理所有资源池
        for (const [poolName, pool] of Object.entries(this.pools)) {
            try {
                await pool.cleanup();
                console.log(`✅ ${poolName}资源池清理完成`);
            } catch (error) {
                console.error(`❌ ${poolName}资源池清理失败:`, error);
            }
        }

        this.isInitialized = false;
    }

    /**
     * 分配数据库连接
     */
    async allocateDatabaseConnection(project, testId) {
        this.ensureInitialized();

        const connection = await this.pools.database.allocate({
            project,
            testId,
            type: 'database-connection',
            allocatedAt: Date.now()
        });

        if (this.options.enableResourceTracking) {
            this.resourceTracker.trackAllocation('database', connection.id, { project, testId });
        }

        return connection;
    }

    /**
     * 分配浏览器实例
     */
    async allocateBrowserInstance(project, testId, options = {}) {
        this.ensureInitialized();

        const browser = await this.pools.browser.allocate({
            project,
            testId,
            type: 'browser-instance',
            browserType: options.browserType || 'chromium',
            headless: options.headless !== false,
            allocatedAt: Date.now()
        });

        if (this.options.enableResourceTracking) {
            this.resourceTracker.trackAllocation('browser', browser.id, { project, testId, ...options });
        }

        return browser;
    }

    /**
     * 分配端口
     */
    async allocatePort(project, service = 'unknown') {
        this.ensureInitialized();

        const port = await this.pools.port.allocate({
            project,
            service,
            type: 'port',
            allocatedAt: Date.now()
        });

        if (this.options.enableResourceTracking) {
            this.resourceTracker.trackAllocation('port', port.id, { project, service });
        }

        return port;
    }

    /**
     * 启动服务
     */
    async startService(serviceName, config) {
        this.ensureInitialized();

        const service = await this.pools.service.allocate({
            serviceName,
            config,
            type: 'service',
            startedAt: Date.now()
        });

        if (this.options.enableResourceTracking) {
            this.resourceTracker.trackAllocation('service', service.id, { serviceName, config });
        }

        return service;
    }

    /**
     * 释放资源
     */
    async releaseResource(resourceType, resourceId) {
        const pool = this.pools[resourceType];
        if (!pool) {
            throw new Error(`未知的资源类型: ${resourceType}`);
        }

        try {
            await pool.release(resourceId);

            if (this.options.enableResourceTracking) {
                this.resourceTracker.trackRelease(resourceType, resourceId);
            }

            console.log(`✅ 释放${resourceType}资源: ${resourceId}`);

        } catch (error) {
            console.error(`❌ 释放${resourceType}资源失败 ${resourceId}:`, error);
            throw error;
        }
    }

    /**
     * 批量释放资源
     */
    async releaseResources(resourceType, resourceIds) {
        const releasePromises = resourceIds.map(id =>
            this.releaseResource(resourceType, id).catch(error => {
                console.warn(`释放资源失败 ${resourceType}:${id}:`, error.message);
                return null; // 不抛出错误，继续释放其他资源
            })
        );

        await Promise.all(releasePromises);
    }

    /**
     * 获取资源池状态
     */
    getPoolStatus() {
        const status = {};

        for (const [poolName, pool] of Object.entries(this.pools)) {
            status[poolName] = pool.getStatus();
        }

        return {
            pools: status,
            overall: this.getOverallStatus(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 获取整体状态
     */
    getOverallStatus() {
        const status = this.getPoolStatus();
        let totalAllocated = 0;
        let totalAvailable = 0;
        let totalCapacity = 0;

        for (const pool of Object.values(status.pools)) {
            totalAllocated += pool.allocated;
            totalAvailable += pool.available;
            totalCapacity += pool.capacity;
        }

        const utilizationRate = totalCapacity > 0 ? (totalAllocated / totalCapacity) * 100 : 0;

        return {
            totalAllocated,
            totalAvailable,
            totalCapacity,
            utilizationRate: Math.round(utilizationRate * 100) / 100,
            health: this.assessHealth(utilizationRate)
        };
    }

    /**
     * 评估健康状态
     */
    assessHealth(utilizationRate) {
        if (utilizationRate < 50) return 'healthy';
        if (utilizationRate < 80) return 'warning';
        if (utilizationRate < 95) return 'critical';
        return 'exhausted';
    }

    /**
     * 获取资源使用统计
     */
    getResourceStatistics() {
        if (!this.options.enableResourceTracking) {
            return { enabled: false };
        }

        return {
            enabled: true,
            allocations: this.resourceTracker.getAllocationStats(),
            usage: this.resourceTracker.getUsageStats(),
            leaks: this.resourceTracker.detectLeaks()
        };
    }

    /**
     * 启动资源跟踪
     */
    startResourceTracking() {
        this.trackingInterval = setInterval(() => {
            const leaks = this.resourceTracker.detectLeaks();
            if (leaks.length > 0) {
                console.warn('⚠️ 检测到可能的资源泄漏:', leaks);
            }
        }, 60000); // 每分钟检查一次
    }

    /**
     * 启动清理定时器
     */
    startCleanupTimer() {
        this.cleanupTimer = setInterval(async () => {
            try {
                await this.performCleanup();
            } catch (error) {
                console.error('资源清理过程中发生错误:', error);
            }
        }, this.options.cleanupInterval);
    }

    /**
     * 执行清理
     */
    async performCleanup() {
        const now = Date.now();
        const timeout = this.options.resourceTimeout;

        // 清理超时的资源
        for (const [poolName, pool] of Object.entries(this.pools)) {
            const timedOutResources = pool.getTimedOutResources(now - timeout);

            if (timedOutResources.length > 0) {
                console.log(`🧹 清理超时${poolName}资源: ${timedOutResources.length}个`);

                for (const resourceId of timedOutResources) {
                    try {
                        await pool.forceRelease(resourceId);
                        if (this.options.enableResourceTracking) {
                            this.resourceTracker.trackRelease(poolName, resourceId);
                        }
                    } catch (error) {
                        console.error(`强制释放资源失败 ${poolName}:${resourceId}:`, error);
                    }
                }
            }
        }
    }

    /**
     * 确保已初始化
     */
    ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error('资源池管理器未初始化，请先调用 initialize()');
        }
    }

    /**
     * 创建测试执行上下文
     */
    async createTestContext(project, testId) {
        this.ensureInitialized();

        const context = {
            project,
            testId,
            resources: {},
            allocatedAt: Date.now()
        };

        try {
            // 分配基础资源
            context.resources.database = await this.allocateDatabaseConnection(project, testId);
            context.resources.browser = await this.allocateBrowserInstance(project, testId);
            context.resources.port = await this.allocatePort(project, 'test-service');

            console.log(`✅ 为测试 ${testId} 创建执行上下文`);

            return {
                ...context,
                release: async () => {
                    await this.releaseTestContext(context);
                }
            };

        } catch (error) {
            // 如果分配失败，清理已分配的资源
            await this.releaseAllocatedResources(context.resources);
            throw error;
        }
    }

    /**
     * 释放测试执行上下文
     */
    async releaseTestContext(context) {
        if (!context.resources) return;

        const resources = Object.entries(context.resources);
        const releasePromises = resources.map(([type, resource]) =>
            this.releaseResource(type, resource.id).catch(error => {
                console.warn(`释放测试上下文资源失败 ${type}:${resource.id}:`, error);
                return null;
            })
        );

        await Promise.all(releasePromises);
        console.log(`✅ 释放测试 ${context.testId} 执行上下文`);
    }

    /**
     * 释放已分配的资源（错误恢复用）
     */
    async releaseAllocatedResources(resources) {
        const releasePromises = Object.entries(resources).map(([type, resource]) =>
            resource ? this.releaseResource(type, resource.id).catch(() => null) : Promise.resolve()
        );

        await Promise.all(releasePromises);
    }

    /**
     * 获取资源分配建议
     */
    getResourceAllocationAdvice(project, phase) {
        const poolStatus = this.getPoolStatus();
        const advice = [];

        // 数据库连接建议
        const dbPool = poolStatus.pools.database;
        if (dbPool.available < 2) {
            advice.push({
                type: 'warning',
                resource: 'database',
                message: '数据库连接不足，建议减少并发数',
                suggestion: '降低并发数或增加连接池大小'
            });
        }

        // 浏览器实例建议
        const browserPool = poolStatus.pools.browser;
        if (browserPool.available < phase === 'integration' ? 1 : 2) {
            advice.push({
                type: 'warning',
                resource: 'browser',
                message: '浏览器实例不足，可能影响测试执行',
                suggestion: '等待资源释放或增加浏览器实例限制'
            });
        }

        // 端口建议
        const portPool = poolStatus.pools.port;
        if (portPool.available < 3) {
            advice.push({
                type: 'warning',
                resource: 'port',
                message: '可用端口不足',
                suggestion: '检查端口占用或扩大端口范围'
            });
        }

        return advice;
    }
}

/**
 * 通用资源池基类
 */
class ResourcePool {
    constructor(type, maxSize) {
        this.type = type;
        this.maxSize = maxSize;
        this.resources = new Map(); // resourceId -> resource
        this.available = new Set();
        this.allocated = new Set();
    }

    async initialize() {
        // 子类实现具体的初始化逻辑
    }

    async allocate(metadata) {
        if (this.allocated.size >= this.maxSize) {
            throw new Error(`${this.type}资源池已满 (最大容量: ${this.maxSize})`);
        }

        // 查找可用资源
        let resourceId = null;
        if (this.available.size > 0) {
            resourceId = this.available.values().next().value;
            this.available.delete(resourceId);
        } else {
            // 创建新资源
            resourceId = await this.createResource(metadata);
        }

        this.allocated.add(resourceId);
        this.resources.set(resourceId, { ...metadata, allocatedAt: Date.now() });

        return {
            id: resourceId,
            type: this.type,
            metadata
        };
    }

    async release(resourceId) {
        if (!this.allocated.has(resourceId)) {
            throw new Error(`资源 ${resourceId} 未被分配`);
        }

        // 清理资源
        await this.cleanupResource(resourceId);

        this.allocated.delete(resourceId);
        this.available.add(resourceId);
    }

    async forceRelease(resourceId) {
        if (this.allocated.has(resourceId)) {
            await this.release(resourceId);
        }
    }

    async createResource(metadata) {
        // 子类实现具体的资源创建逻辑
        return `resource_${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async cleanupResource(resourceId) {
        // 子类实现具体的资源清理逻辑
    }

    async cleanup() {
        // 清理所有资源
        for (const resourceId of this.allocated) {
            try {
                await this.forceRelease(resourceId);
            } catch (error) {
                console.error(`清理资源失败 ${resourceId}:`, error);
            }
        }

        this.resources.clear();
        this.available.clear();
        this.allocated.clear();
    }

    getStatus() {
        return {
            type: this.type,
            capacity: this.maxSize,
            available: this.available.size,
            allocated: this.allocated.size,
            utilization: Math.round((this.allocated.size / this.maxSize) * 100 * 100) / 100
        };
    }

    getTimedOutResources(timeoutThreshold) {
        const timedOut = [];

        for (const [resourceId, metadata] of this.resources) {
            if (metadata.allocatedAt && metadata.allocatedAt < timeoutThreshold) {
                timedOut.push(resourceId);
            }
        }

        return timedOut;
    }
}

/**
 * 端口资源池
 */
class PortResourcePool extends ResourcePool {
    constructor(portRange) {
        super('port', portRange.end - portRange.start + 1);
        this.portRange = portRange;
        this.usedPorts = new Set();
    }

    async initialize() {
        // 初始化时检查端口可用性
        for (let port = this.portRange.start; port <= this.portRange.end; port++) {
            if (await this.isPortAvailable(port)) {
                this.available.add(port.toString());
            }
        }
    }

    async createResource(metadata) {
        // 端口资源是预分配的，这里直接返回可用端口
        if (this.available.size === 0) {
            throw new Error('没有可用的端口');
        }

        const port = this.available.values().next().value;
        this.available.delete(port);
        this.usedPorts.add(parseInt(port));

        return port;
    }

    async cleanupResource(resourceId) {
        const port = parseInt(resourceId);
        this.usedPorts.delete(port);
        // 端口资源可以被重用，不需要特殊清理
    }

    async isPortAvailable(port) {
        return new Promise((resolve) => {
            const net = require('net');
            const server = net.createServer();

            server.listen(port, () => {
                server.close();
                resolve(true);
            });

            server.on('error', () => {
                resolve(false);
            });
        });
    }
}

/**
 * 服务资源池
 */
class ServiceResourcePool extends ResourcePool {
    constructor() {
        super('service', 10); // 最多同时运行10个服务
        this.runningServices = new Map();
    }

    async createResource(metadata) {
        const { serviceName, config } = metadata;
        const serviceId = `service_${serviceName}_${Date.now()}`;

        // 启动服务
        const serviceProcess = await this.startServiceProcess(serviceName, config);
        this.runningServices.set(serviceId, serviceProcess);

        return serviceId;
    }

    async cleanupResource(resourceId) {
        const serviceProcess = this.runningServices.get(resourceId);
        if (serviceProcess) {
            serviceProcess.kill();
            this.runningServices.delete(resourceId);
        }
    }

    async startServiceProcess(serviceName, config) {
        // 这里实现具体的服务启动逻辑
        // 为了简化，返回一个mock进程
        return {
            pid: Math.floor(Math.random() * 10000),
            kill: () => console.log(`停止服务: ${serviceName}`)
        };
    }
}

/**
 * 资源跟踪器
 */
class ResourceTracker {
    constructor() {
        this.allocations = new Map(); // resourceId -> allocationInfo
        this.usageStats = {
            byType: new Map(),
            byProject: new Map(),
            totalAllocations: 0,
            totalReleases: 0
        };
    }

    trackAllocation(resourceType, resourceId, metadata) {
        this.allocations.set(resourceId, {
            type: resourceType,
            allocatedAt: Date.now(),
            metadata,
            released: false
        });

        this.usageStats.totalAllocations++;

        // 按类型统计
        if (!this.usageStats.byType.has(resourceType)) {
            this.usageStats.byType.set(resourceType, 0);
        }
        this.usageStats.byType.set(resourceType, this.usageStats.byType.get(resourceType) + 1);

        // 按项目统计
        const project = metadata.project || 'unknown';
        if (!this.usageStats.byProject.has(project)) {
            this.usageStats.byProject.set(project, { allocations: 0, releases: 0 });
        }
        this.usageStats.byProject.get(project).allocations++;
    }

    trackRelease(resourceType, resourceId) {
        const allocation = this.allocations.get(resourceId);
        if (allocation) {
            allocation.released = true;
            allocation.releasedAt = Date.now();
            allocation.duration = allocation.releasedAt - allocation.allocatedAt;
        }

        this.usageStats.totalReleases++;

        // 更新项目统计
        const metadata = allocation?.metadata;
        if (metadata?.project) {
            const projectStats = this.usageStats.byProject.get(metadata.project);
            if (projectStats) {
                projectStats.releases++;
            }
        }
    }

    getAllocationStats() {
        const activeAllocations = Array.from(this.allocations.values())
            .filter(a => !a.released);

        const avgDuration = Array.from(this.allocations.values())
            .filter(a => a.released && a.duration)
            .reduce((sum, a) => sum + a.duration, 0) / Math.max(1, this.usageStats.totalReleases);

        return {
            active: activeAllocations.length,
            total: this.usageStats.totalAllocations,
            avgDuration: Math.round(avgDuration / 1000), // 秒
            byType: Object.fromEntries(this.usageStats.byType),
            byProject: Object.fromEntries(this.usageStats.byProject)
        };
    }

    getUsageStats() {
        return { ...this.usageStats };
    }

    detectLeaks() {
        const now = Date.now();
        const leakThreshold = 10 * 60 * 1000; // 10分钟

        return Array.from(this.allocations.values())
            .filter(allocation =>
                !allocation.released &&
                (now - allocation.allocatedAt) > leakThreshold
            )
            .map(allocation => ({
                resourceId: allocation.type + '_' + allocation.metadata?.testId,
                allocatedAt: new Date(allocation.allocatedAt).toISOString(),
                duration: Math.round((now - allocation.allocatedAt) / 1000 / 60), // 分钟
                metadata: allocation.metadata
            }));
    }
}

module.exports = ResourcePoolManager;
