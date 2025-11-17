---
title: SERVICE GOVERNANCE DOCS
version: v1.0.0
last_updated: 2025-11-17
status: active
category: technical
tags: [microservice, governance, service-discovery, configuration, monitoring]
---

# 🎛️ 服务治理文档

> **版本**：v1.0.0
> **更新日期**：2025-11-17
> **适用范围**：微服务架构治理
> **状态**：active

---

## 📋 目录

- [概述](#概述)
- [服务发现](#服务发现)
- [配置管理](#配置管理)
- [负载均衡](#负载均衡)
- [熔断与降级](#熔断与降级)
- [限流与隔离](#限流与隔离)
- [监控与告警](#监控与告警)
- [日志聚合](#日志聚合)
- [链路追踪](#链路追踪)
- [服务网格](#服务网格)
- [部署策略](#部署策略)
- [故障恢复](#故障恢复)

---

## 📖 概述

### 治理目标

服务治理是微服务架构的核心能力，确保系统在分布式环境下的稳定性、可观测性和可维护性。本文档定义了健身房综合管理系统微服务架构的治理策略和实施规范。

### 治理原则

- **自动化优先**：治理策略应尽可能自动化执行
- **可观测性**：确保每个治理决策都有完整的监控和追踪
- **故障隔离**：单个服务的故障不应影响整个系统
- **渐进式实施**：治理能力应随业务发展逐步完善
- **标准化**：所有服务遵循统一的治理规范

### 治理架构

```
┌─────────────────────────────────────┐
│           治理控制面                │
│  ┌─────────┬─────────┬─────────┐    │
│  │ 服务发现│ 配置中心│ 监控平台│    │
│  └─────────┴─────────┴─────────┘    │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│           服务网格                  │
│  ┌─────────┬─────────┬─────────┐    │
│  │ 负载均衡│ 熔断器  │ 限流器  │    │
│  └─────────┴─────────┴─────────┘    │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│           业务服务层                │
│  ┌─────────┬─────────┬─────────┐    │
│  │ 用户服务│ 订单服务│ 支付服务│    │
│  └─────────┴─────────┴─────────┘    │
└─────────────────────────────────────┘
```

---

## 🔍 服务发现

### 服务注册

#### 服务元数据
```json
{
  "serviceId": "{{service-id}}",
  "serviceName": "{{ServiceName}}",
  "version": "{{version}}",
  "environment": "production|staging|development",
  "host": "{{pod-ip}}",
  "port": 8080,
  "protocol": "http",
  "healthCheck": {
    "path": "/health",
    "interval": 30,
    "timeout": 5,
    "healthyThreshold": 2,
    "unhealthyThreshold": 3
  },
  "metadata": {
    "team": "{{team-name}}",
    "owner": "{{owner-email}}",
    "description": "{{service-description}}",
    "dependencies": ["service-a", "service-b"],
    "tags": ["api", "microservice"],
    "weight": 100,
    "canary": false
  }
}
```

#### 注册流程
```typescript
// 服务注册器
class ServiceRegistrar {
  private registry: ServiceRegistry

  async register(serviceInfo: ServiceMetadata): Promise<void> {
    try {
      // 验证服务信息
      await this.validateServiceInfo(serviceInfo)

      // 生成实例ID
      const instanceId = this.generateInstanceId(serviceInfo)

      // 注册到服务中心
      await this.registry.register({
        ...serviceInfo,
        instanceId,
        registeredAt: new Date().toISOString(),
        status: 'STARTING'
      })

      // 开始健康检查
      this.startHealthCheck(instanceId, serviceInfo.healthCheck)

      console.log(`Service ${serviceInfo.serviceId} registered successfully`)
    } catch (error) {
      console.error('Service registration failed:', error)
      throw error
    }
  }

  async unregister(instanceId: string): Promise<void> {
    await this.registry.unregister(instanceId)
    console.log(`Service instance ${instanceId} unregistered`)
  }
}
```

### 服务发现

#### 客户端发现
```typescript
// 服务发现器
class ServiceDiscoverer {
  private registry: ServiceRegistry
  private cache: Map<string, ServiceInstance[]> = new Map()
  private cacheTimeout = 30000 // 30秒缓存

  async discover(serviceName: string, filter?: ServiceFilter): Promise<ServiceInstance[]> {
    // 检查缓存
    const cached = this.getFromCache(serviceName)
    if (cached) {
      return this.applyFilter(cached, filter)
    }

    // 从注册中心获取
    const instances = await this.registry.discover(serviceName)
    const healthyInstances = instances.filter(inst => inst.status === 'UP')

    // 更新缓存
    this.setCache(serviceName, healthyInstances)

    return this.applyFilter(healthyInstances, filter)
  }

  async getServiceUrl(serviceName: string, filter?: ServiceFilter): Promise<string> {
    const instances = await this.discover(serviceName, filter)
    if (instances.length === 0) {
      throw new Error(`No healthy instances found for service: ${serviceName}`)
    }

    // 负载均衡选择实例
    const instance = this.loadBalancer.select(instances)
    return `${instance.protocol}://${instance.host}:${instance.port}`
  }

  private getFromCache(serviceName: string): ServiceInstance[] | null {
    const cached = this.cache.get(serviceName)
    if (!cached) return null

    const now = Date.now()
    const cacheTime = cached[0]?.cachedAt || 0

    if (now - cacheTime > this.cacheTimeout) {
      this.cache.delete(serviceName)
      return null
    }

    return cached
  }

  private setCache(serviceName: string, instances: ServiceInstance[]): void {
    const cachedInstances = instances.map(inst => ({
      ...inst,
      cachedAt: Date.now()
    }))
    this.cache.set(serviceName, cachedInstances)
  }

  private applyFilter(instances: ServiceInstance[], filter?: ServiceFilter): ServiceInstance[] {
    if (!filter) return instances

    return instances.filter(inst => {
      if (filter.version && inst.version !== filter.version) return false
      if (filter.environment && inst.environment !== filter.environment) return false
      if (filter.tags && !filter.tags.every(tag => inst.metadata.tags?.includes(tag))) return false
      if (filter.canary !== undefined && inst.metadata.canary !== filter.canary) return false
      return true
    })
  }
}
```

#### 服务器端发现
```yaml
# Nginx Upstream配置（示例）
upstream user-service {
    server user-service-1:8080 weight=100;
    server user-service-2:8080 weight=100;
    server user-service-3:8080 weight=100;
    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;

    location /api/users/ {
        proxy_pass http://user-service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 健康检查
        health_check interval=10 fails=3 passes=2;
    }
}
```

---

## ⚙️ 配置管理

### 配置层次结构

#### 配置分类
```
全局配置 (Global)
├── 环境配置 (Environment)
│   ├── production
│   ├── staging
│   └── development
│       └── 服务配置 (Service)
│           ├── user-service
│           │   ├── 数据库配置
│           │   ├── Redis配置
│           │   ├── 消息队列配置
│           │   └── 业务配置
│           └── order-service
│               └── ...
└── 运行时配置 (Runtime)
    ├── 功能开关
    ├── 限流配置
    └── 动态路由
```

### 配置中心集成

#### 配置获取
```typescript
// 配置客户端
class ConfigClient {
  private configCache: Map<string, any> = new Map()
  private watchers: Map<string, ConfigWatcher[]> = new Map()

  async get<T>(key: string, defaultValue?: T): Promise<T> {
    // 检查缓存
    if (this.configCache.has(key)) {
      return this.configCache.get(key)
    }

    // 从配置中心获取
    const value = await this.configServer.get(key)
    if (value !== undefined) {
      this.configCache.set(key, value)
      return value
    }

    if (defaultValue !== undefined) {
      return defaultValue
    }

    throw new Error(`Configuration key not found: ${key}`)
  }

  async watch(key: string, callback: (newValue: any, oldValue: any) => void): Promise<() => void> {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, [])
    }

    const watchers = this.watchers.get(key)!
    watchers.push({ callback, lastValue: undefined })

    // 订阅配置变更
    await this.configServer.watch(key, (newValue) => {
      const oldValue = this.configCache.get(key)
      this.configCache.set(key, newValue)

      // 通知所有观察者
      watchers.forEach(watcher => {
        if (watcher.lastValue !== newValue) {
          watcher.callback(newValue, watcher.lastValue)
          watcher.lastValue = newValue
        }
      })
    })

    // 返回取消订阅函数
    return () => {
      const index = watchers.findIndex(w => w.callback === callback)
      if (index > -1) {
        watchers.splice(index, 1)
      }
    }
  }

  async set(key: string, value: any): Promise<void> {
    await this.configServer.set(key, value)
    this.configCache.set(key, value)
  }
}
```

#### 配置热更新
```typescript
// 配置管理器
class ConfigurationManager {
  private configClient: ConfigClient
  private dynamicConfigs: Map<string, (newValue: any) => void> = new Map()

  constructor(configClient: ConfigClient) {
    this.configClient = configClient
    this.initializeDynamicConfigs()
  }

  private initializeDynamicConfigs() {
    // 数据库连接池配置
    this.watchConfig('database.pool.maxSize', (newValue) => {
      this.updateDatabasePoolSize(newValue)
    })

    // Redis连接配置
    this.watchConfig('redis.connection.maxTotal', (newValue) => {
      this.updateRedisPoolSize(newValue)
    })

    // 限流配置
    this.watchConfig('rateLimit.requestsPerMinute', (newValue) => {
      this.updateRateLimit(newValue)
    })

    // 功能开关
    this.watchConfig('features.newCheckoutFlow', (newValue) => {
      this.toggleFeature('newCheckoutFlow', newValue)
    })
  }

  private watchConfig(key: string, handler: (newValue: any) => void) {
    this.configClient.watch(key, handler).catch(error => {
      console.error(`Failed to watch config ${key}:`, error)
    })
  }

  private updateDatabasePoolSize(maxSize: number) {
    console.log(`Updating database pool size to: ${maxSize}`)
    // 更新数据库连接池配置
    // 注意：这可能需要重启连接或优雅关闭
  }

  private updateRedisPoolSize(maxSize: number) {
    console.log(`Updating Redis pool size to: ${maxSize}`)
    // 更新Redis连接池
  }

  private updateRateLimit(requestsPerMinute: number) {
    console.log(`Updating rate limit to: ${requestsPerMinute} req/min`)
    // 更新限流规则
  }

  private toggleFeature(featureName: string, enabled: boolean) {
    console.log(`${enabled ? 'Enabling' : 'Disabling'} feature: ${featureName}`)
    // 切换功能开关
  }
}
```

### 配置验证

#### 配置模式验证
```typescript
// 配置验证器
class ConfigValidator {
  private schemas: Map<string, Schema> = new Map()

  constructor() {
    this.initializeSchemas()
  }

  private initializeSchemas() {
    // 数据库配置模式
    this.schemas.set('database', {
      type: 'object',
      required: ['host', 'port', 'database', 'username'],
      properties: {
        host: { type: 'string', format: 'hostname' },
        port: { type: 'integer', minimum: 1, maximum: 65535 },
        database: { type: 'string', minLength: 1 },
        username: { type: 'string', minLength: 1 },
        password: { type: 'string', minLength: 8 },
        pool: {
          type: 'object',
          properties: {
            maxSize: { type: 'integer', minimum: 1, maximum: 100 },
            minSize: { type: 'integer', minimum: 0 },
            maxIdleTime: { type: 'integer', minimum: 0 }
          }
        }
      }
    })

    // Redis配置模式
    this.schemas.set('redis', {
      type: 'object',
      required: ['host', 'port'],
      properties: {
        host: { type: 'string', format: 'hostname' },
        port: { type: 'integer', minimum: 1, maximum: 65535 },
        password: { type: 'string' },
        database: { type: 'integer', minimum: 0, maximum: 15 },
        cluster: { type: 'boolean' },
        sentinel: {
          type: 'object',
          properties: {
            masterName: { type: 'string' },
            nodes: {
              type: 'array',
              items: { type: 'string', format: 'hostport' }
            }
          }
        }
      }
    })
  }

  validate(configKey: string, configValue: any): ValidationResult {
    const schema = this.schemas.get(configKey)
    if (!schema) {
      return { valid: true, errors: [] } // 无模式时跳过验证
    }

    const errors: string[] = []

    // 基本类型验证
    if (!this.validateType(configValue, schema)) {
      errors.push(`Invalid type for ${configKey}`)
    }

    // 必需字段验证
    if (schema.required) {
      for (const required of schema.required) {
        if (!(required in configValue)) {
          errors.push(`Missing required field: ${required}`)
        }
      }
    }

    // 属性验证
    if (schema.properties) {
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        if (prop in configValue) {
          const propErrors = this.validateProperty(prop, configValue[prop], propSchema)
          errors.push(...propErrors)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private validateType(value: any, schema: Schema): boolean {
    switch (schema.type) {
      case 'string': return typeof value === 'string'
      case 'number': return typeof value === 'number'
      case 'integer': return typeof value === 'number' && Number.isInteger(value)
      case 'boolean': return typeof value === 'boolean'
      case 'object': return typeof value === 'object' && value !== null
      case 'array': return Array.isArray(value)
      default: return true
    }
  }

  private validateProperty(propName: string, value: any, schema: PropertySchema): string[] {
    const errors: string[] = []

    // 类型验证
    if (!this.validateType(value, schema)) {
      errors.push(`${propName}: invalid type`)
    }

    // 范围验证
    if (typeof value === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push(`${propName}: must be >= ${schema.minimum}`)
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push(`${propName}: must be <= ${schema.maximum}`)
      }
    }

    // 字符串验证
    if (typeof value === 'string') {
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        errors.push(`${propName}: must be at least ${schema.minLength} characters`)
      }
      if (schema.format === 'hostname' && !this.isValidHostname(value)) {
        errors.push(`${propName}: invalid hostname format`)
      }
    }

    return errors
  }

  private isValidHostname(hostname: string): boolean {
    const hostnameRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?$/
    return hostnameRegex.test(hostname)
  }
}
```

---

## ⚖️ 负载均衡

### 负载均衡策略

#### 轮询策略
```typescript
class RoundRobinLoadBalancer implements LoadBalancer {
  private index = 0

  select(instances: ServiceInstance[]): ServiceInstance {
    if (instances.length === 0) {
      throw new Error('No instances available')
    }

    const instance = instances[this.index % instances.length]
    this.index = (this.index + 1) % instances.length

    return instance
  }
}
```

#### 加权轮询策略
```typescript
class WeightedRoundRobinLoadBalancer implements LoadBalancer {
  private currentIndex = 0
  private currentWeight = 0
  private maxWeight = 0
  private gcd = 0

  constructor() {
    // 计算最大公约数用于优化
  }

  select(instances: ServiceInstance[]): ServiceInstance {
    while (true) {
      this.currentIndex = (this.currentIndex + 1) % instances.length

      if (this.currentIndex === 0) {
        this.currentWeight = this.currentWeight - this.gcd
        if (this.currentWeight <= 0) {
          this.currentWeight = this.maxWeight
        }
      }

      const instance = instances[this.currentIndex]
      if (instance.metadata.weight >= this.currentWeight) {
        return instance
      }
    }
  }
}
```

#### 随机策略
```typescript
class RandomLoadBalancer implements LoadBalancer {
  select(instances: ServiceInstance[]): ServiceInstance {
    if (instances.length === 0) {
      throw new Error('No instances available')
    }

    const randomIndex = Math.floor(Math.random() * instances.length)
    return instances[randomIndex]
  }
}
```

#### 最少连接策略
```typescript
class LeastConnectionLoadBalancer implements LoadBalancer {
  private connectionCounts: Map<string, number> = new Map()

  select(instances: ServiceInstance[]): ServiceInstance {
    if (instances.length === 0) {
      throw new Error('No instances available')
    }

    // 找到连接数最少的实例
    let selectedInstance = instances[0]
    let minConnections = this.getConnectionCount(selectedInstance.instanceId)

    for (const instance of instances) {
      const connections = this.getConnectionCount(instance.instanceId)
      if (connections < minConnections) {
        selectedInstance = instance
        minConnections = connections
      }
    }

    // 增加连接计数
    this.incrementConnectionCount(selectedInstance.instanceId)

    return selectedInstance
  }

  private getConnectionCount(instanceId: string): number {
    return this.connectionCounts.get(instanceId) || 0
  }

  private incrementConnectionCount(instanceId: string): void {
    const current = this.getConnectionCount(instanceId)
    this.connectionCounts.set(instanceId, current + 1)
  }

  // 当请求完成时调用此方法减少连接计数
  decrementConnectionCount(instanceId: string): void {
    const current = this.getConnectionCount(instanceId)
    if (current > 0) {
      this.connectionCounts.set(instanceId, current - 1)
    }
  }
}
```

### 健康检查

#### 被动健康检查
```typescript
class PassiveHealthChecker {
  private unhealthyInstances: Set<string> = new Set()
  private failureCounts: Map<string, number> = new Map()

  check(instance: ServiceInstance, response: HttpResponse): HealthStatus {
    const instanceId = instance.instanceId

    if (this.isSuccessfulResponse(response)) {
      // 成功响应，重置失败计数
      this.failureCounts.delete(instanceId)
      this.unhealthyInstances.delete(instanceId)
      return HealthStatus.HEALTHY
    } else {
      // 失败响应，增加失败计数
      const failures = (this.failureCounts.get(instanceId) || 0) + 1
      this.failureCounts.set(instanceId, failures)

      if (failures >= 3) { // 连续失败3次
        this.unhealthyInstances.add(instanceId)
        return HealthStatus.UNHEALTHY
      }

      return HealthStatus.DEGRADED
    }
  }

  isHealthy(instance: ServiceInstance): boolean {
    return !this.unhealthyInstances.has(instance.instanceId)
  }

  private isSuccessfulResponse(response: HttpResponse): boolean {
    // 2xx状态码为成功
    return response.status >= 200 && response.status < 300
  }
}
```

#### 主动健康检查
```typescript
class ActiveHealthChecker {
  private checkInterval = 30000 // 30秒
  private timeout = 5000 // 5秒超时
  private healthyThreshold = 2
  private unhealthyThreshold = 3

  constructor(private serviceRegistry: ServiceRegistry) {
    this.startHealthChecks()
  }

  private startHealthChecks() {
    setInterval(async () => {
      const allInstances = await this.serviceRegistry.getAllInstances()

      for (const instance of allInstances) {
        await this.checkInstanceHealth(instance)
      }
    }, this.checkInterval)
  }

  private async checkInstanceHealth(instance: ServiceInstance): Promise<void> {
    const healthUrl = `${instance.protocol}://${instance.host}:${instance.port}/health`

    try {
      const response = await this.makeHealthRequest(healthUrl)

      if (this.isHealthyResponse(response)) {
        await this.markInstanceHealthy(instance)
      } else {
        await this.markInstanceUnhealthy(instance)
      }
    } catch (error) {
      console.error(`Health check failed for ${instance.instanceId}:`, error)
      await this.markInstanceUnhealthy(instance)
    }
  }

  private async makeHealthRequest(url: string): Promise<HttpResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'ServiceHealthChecker/1.0'
        }
      })

      clearTimeout(timeoutId)
      return {
        status: response.status,
        body: await response.text()
      }
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private isHealthyResponse(response: HttpResponse): boolean {
    return response.status === 200 &&
           response.body.includes('"status":"UP"')
  }

  private async markInstanceHealthy(instance: ServiceInstance): Promise<void> {
    const currentFailures = instance.failureCount || 0

    if (currentFailures > 0) {
      // 减少失败计数
      const newInstance = {
        ...instance,
        failureCount: Math.max(0, currentFailures - 1),
        status: currentFailures <= 1 ? 'UP' : 'DEGRADED'
      }

      await this.serviceRegistry.updateInstance(newInstance)
    }
  }

  private async markInstanceUnhealthy(instance: ServiceInstance): Promise<void> {
    const currentFailures = (instance.failureCount || 0) + 1

    const newInstance = {
      ...instance,
      failureCount: currentFailures,
      status: currentFailures >= this.unhealthyThreshold ? 'DOWN' : 'DEGRADED'
    }

    await this.serviceRegistry.updateInstance(newInstance)
  }
}
```

---

## 🔌 熔断与降级

### 熔断器模式

#### 熔断器状态机
```typescript
enum CircuitBreakerState {
  CLOSED = 'CLOSED',     // 关闭状态，正常请求
  OPEN = 'OPEN',         // 打开状态，快速失败
  HALF_OPEN = 'HALF_OPEN' // 半开状态，试探性请求
}

class CircuitBreaker {
  private state = CircuitBreakerState.CLOSED
  private failureCount = 0
  private lastFailureTime = 0
  private successCount = 0

  // 配置参数
  private failureThreshold = 5    // 失败阈值
  private timeout = 60000         // 熔断超时时间 (1分钟)
  private successThreshold = 3    // 成功阈值 (半开状态)

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HALF_OPEN
      } else {
        throw new CircuitBreakerError('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await operation()

      this.onSuccess()
      return result

    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failureCount = 0

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++

      if (this.successCount >= this.successThreshold) {
        this.reset()
      }
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.failureThreshold) {
      this.trip()
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.timeout
  }

  private trip(): void {
    this.state = CircuitBreakerState.OPEN
    console.log('Circuit breaker tripped to OPEN state')
  }

  private reset(): void {
    this.state = CircuitBreakerState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    console.log('Circuit breaker reset to CLOSED state')
  }

  getState(): CircuitBreakerState {
    return this.state
  }
}
```

### 降级策略

#### 服务降级
```typescript
interface DegradationStrategy {
  name: string
  condition: (context: RequestContext) => boolean
  action: (context: RequestContext) => Promise<Response>
}

class ServiceDegradationManager {
  private strategies: DegradationStrategy[] = []

  constructor() {
    this.initializeStrategies()
  }

  private initializeStrategies() {
    // 缓存降级
    this.strategies.push({
      name: 'cache-fallback',
      condition: (context) => context.cacheUnavailable,
      action: async (context) => {
        // 返回缓存数据或默认值
        return this.getCachedResponse(context)
      }
    })

    // 功能降级
    this.strategies.push({
      name: 'feature-degradation',
      condition: (context) => context.highLoad,
      action: async (context) => {
        // 简化响应，移除非核心功能
        return this.getSimplifiedResponse(context)
      }
    })

    // 服务降级
    this.strategies.push({
      name: 'service-fallback',
      condition: (context) => context.serviceUnavailable,
      action: async (context) => {
        // 返回预定义的降级响应
        return this.getFallbackResponse(context)
      }
    })
  }

  async applyDegradation(context: RequestContext): Promise<Response | null> {
    for (const strategy of this.strategies) {
      if (strategy.condition(context)) {
        console.log(`Applying degradation strategy: ${strategy.name}`)
        return await strategy.action(context)
      }
    }

    return null // 不需要降级
  }

  private async getCachedResponse(context: RequestContext): Promise<Response> {
    // 从缓存获取数据
    const cachedData = await this.cache.get(context.cacheKey)
    return {
      status: 200,
      data: cachedData || this.getDefaultData(),
      metadata: {
        source: 'cache',
        degraded: true
      }
    }
  }

  private async getSimplifiedResponse(context: RequestContext): Promise<Response> {
    // 返回简化版数据
    const fullData = await this.getFullData(context)
    const simplifiedData = this.simplifyData(fullData)

    return {
      status: 200,
      data: simplifiedData,
      metadata: {
        source: 'simplified',
        degraded: true,
        features: ['basic-info'] // 仅包含基本信息
      }
    }
  }

  private async getFallbackResponse(context: RequestContext): Promise<Response> {
    // 返回静态降级数据
    return {
      status: 200,
      data: this.getStaticFallbackData(),
      metadata: {
        source: 'fallback',
        degraded: true,
        message: 'Service temporarily unavailable'
      }
    }
  }
}
```

---

## 🚦 限流与隔离

### 分布式限流

#### 令牌桶算法
```typescript
class TokenBucketRateLimiter {
  private tokens: number
  private lastRefillTime: number
  private readonly maxTokens: number
  private readonly refillRate: number // 令牌/秒

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens
    this.tokens = maxTokens
    this.refillRate = refillRate
    this.lastRefillTime = Date.now()
  }

  async acquire(tokens: number = 1): Promise<boolean> {
    this.refill()

    if (this.tokens >= tokens) {
      this.tokens -= tokens
      return true
    }

    return false
  }

  private refill(): void {
    const now = Date.now()
    const timePassed = (now - this.lastRefillTime) / 1000 // 秒
    const tokensToAdd = Math.floor(timePassed * this.refillRate)

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
      this.lastRefillTime = now
    }
  }

  getAvailableTokens(): number {
    this.refill()
    return this.tokens
  }
}
```

#### 滑动窗口算法
```typescript
class SlidingWindowRateLimiter {
  private requests: number[] = []
  private readonly windowSize: number // 毫秒
  private readonly maxRequests: number

  constructor(windowSize: number, maxRequests: number) {
    this.windowSize = windowSize
    this.maxRequests = maxRequests
  }

  async acquire(): Promise<boolean> {
    const now = Date.now()

    // 移除过期请求
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.windowSize
    )

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now)
      return true
    }

    return false
  }

  getRemainingRequests(): number {
    const now = Date.now()
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.windowSize
    )

    return Math.max(0, this.maxRequests - this.requests.length)
  }

  getResetTime(): number {
    if (this.requests.length === 0) {
      return Date.now()
    }

    const oldestRequest = Math.min(...this.requests)
    return oldestRequest + this.windowSize
  }
}
```

### 隔离策略

#### 线程池隔离
```typescript
class ThreadPoolIsolation {
  private pools: Map<string, ThreadPool> = new Map()

  constructor() {
    // 初始化不同服务的线程池
    this.pools.set('user-service', new ThreadPool(10, 50))
    this.pools.set('order-service', new ThreadPool(20, 100))
    this.pools.set('payment-service', new ThreadPool(5, 20))
  }

  async execute<T>(
    serviceName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const pool = this.pools.get(serviceName)
    if (!pool) {
      throw new Error(`No thread pool configured for service: ${serviceName}`)
    }

    return await pool.execute(operation)
  }

  getPoolStats(serviceName: string): PoolStats {
    const pool = this.pools.get(serviceName)
    if (!pool) {
      throw new Error(`No thread pool configured for service: ${serviceName}`)
    }

    return pool.getStats()
  }
}

class ThreadPool {
  private activeThreads = 0
  private queue: QueuedTask[] = []
  private readonly minThreads: number
  private readonly maxThreads: number

  constructor(minThreads: number, maxThreads: number) {
    this.minThreads = minThreads
    this.maxThreads = maxThreads
  }

  async execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject
      })

      this.tryExecute()
    })
  }

  private tryExecute(): void {
    if (this.activeThreads >= this.maxThreads) {
      return // 达到最大线程数，等待
    }

    const queuedTask = this.queue.shift()
    if (!queuedTask) {
      return // 队列为空
    }

    this.activeThreads++
    this.executeTask(queuedTask)
  }

  private async executeTask(queuedTask: QueuedTask): Promise<void> {
    try {
      const result = await queuedTask.task()
      queuedTask.resolve(result)
    } catch (error) {
      queuedTask.reject(error)
    } finally {
      this.activeThreads--
      this.tryExecute() // 尝试执行下一个任务
    }
  }

  getStats(): PoolStats {
    return {
      activeThreads: this.activeThreads,
      queuedTasks: this.queue.length,
      maxThreads: this.maxThreads,
      utilization: this.activeThreads / this.maxThreads
    }
  }
}
```

#### 舱壁隔离模式
```typescript
class BulkheadIsolation {
  private compartments: Map<string, Compartment> = new Map()

  constructor() {
    // 为不同类型的操作创建隔离舱
    this.compartments.set('database', new Compartment(10, 1000))
    this.compartments.set('external-api', new Compartment(5, 5000))
    this.compartments.set('cache', new Compartment(20, 100))
  }

  async execute<T>(
    compartmentName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const compartment = this.compartments.get(compartmentName)
    if (!compartment) {
      throw new Error(`No compartment configured for: ${compartmentName}`)
    }

    return await compartment.execute(operation)
  }

  getCompartmentStats(compartmentName: string): CompartmentStats {
    const compartment = this.compartments.get(compartmentName)
    if (!compartment) {
      throw new Error(`No compartment configured for: ${compartmentName}`)
    }

    return compartment.getStats()
  }
}

class Compartment {
  private semaphore: Semaphore
  private timeout: number

  constructor(maxConcurrent: number, timeoutMs: number) {
    this.semaphore = new Semaphore(maxConcurrent)
    this.timeout = timeoutMs
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const release = await this.semaphore.acquire()

    try {
      // 使用 Promise.race 实现超时控制
      const result = await Promise.race([
        operation(),
        this.createTimeoutPromise()
      ])

      return result
    } finally {
      release()
    }
  }

  private createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${this.timeout}ms`))
      }, this.timeout)
    })
  }

  getStats(): CompartmentStats {
    return {
      availableSlots: this.semaphore.available(),
      waitingCount: this.semaphore.waitingCount(),
      maxConcurrent: this.semaphore.maxCount
    }
  }
}

class Semaphore {
  private permits: number
  private readonly maxPermits: number
  private waiting: Array<() => void> = []

  constructor(maxPermits: number) {
    this.permits = maxPermits
    this.maxPermits = maxPermits
  }

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      if (this.permits > 0) {
        this.permits--
        resolve(() => this.release())
      } else {
        this.waiting.push(() => {
          this.permits--
          resolve(() => this.release())
        })
      }
    })
  }

  private release(): void {
    this.permits++

    if (this.waiting.length > 0 && this.permits > 0) {
      const next = this.waiting.shift()
      if (next) next()
    }
  }

  available(): number {
    return this.permits
  }

  waitingCount(): number {
    return this.waiting.length
  }

  get maxCount(): number {
    return this.maxPermits
  }
}
```

---

## 📊 监控与告警

### 监控指标体系

#### 服务健康指标
```prometheus
# 服务实例状态
service_instance_status{service="user-service",instance="pod-123",version="1.0.0"} 1

# 服务响应时间
service_response_time_seconds{service="user-service",endpoint="/api/users",quantile="0.95"} 0.245

# 服务错误率
service_error_rate{service="user-service",endpoint="/api/users",status="5xx"} 0.023

# 服务吞吐量
service_requests_total{service="user-service",endpoint="/api/users",method="GET"} 15420
```

#### 系统资源指标
```prometheus
# CPU使用率
service_cpu_usage_percent{service="user-service",instance="pod-123"} 67.5

# 内存使用率
service_memory_usage_percent{service="user-service",instance="pod-123"} 78.3

# 磁盘使用率
service_disk_usage_percent{service="user-service",instance="pod-123"} 45.2

# 网络I/O
service_network_rx_bytes_total{service="user-service",instance="pod-123"} 1024000
service_network_tx_bytes_total{service="user-service",instance="pod-123"} 2048000
```

#### 业务指标
```prometheus
# 业务成功率
business_success_rate{service="payment-service",operation="process_payment"} 0.987

# 业务响应时间
business_response_time_seconds{service="order-service",operation="create_order",quantile="0.95"} 1.234

# 业务吞吐量
business_operations_total{service="user-service",operation="user_registration"} 1234
```

### 告警规则配置

#### 基础告警规则
```yaml
# 服务不可用告警
- alert: ServiceDown
  expr: up{service=~".+"} == 0
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Service {{ $labels.service }} is down"
    description: "Service {{ $labels.service }} has been down for more than 5 minutes"

# 高错误率告警
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High error rate on {{ $labels.service }}"
    description: "Error rate is {{ $value | printf \"%.2f\" }}%"

# 高响应时间告警
- alert: HighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High response time on {{ $labels.service }}"
    description: "95th percentile response time is {{ $value }}s"
```

#### 业务告警规则
```yaml
# 业务失败率告警
- alert: BusinessFailureRate
  expr: rate(business_operations_total{result="failure"}[5m]) / rate(business_operations_total[5m]) > 0.01
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High business failure rate on {{ $labels.service }}"
    description: "Business operation {{ $labels.operation }} failure rate is {{ $value | printf \"%.2f\" }}%"

# 队列积压告警
- alert: QueueBacklog
  expr: message_queue_depth > 1000
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High queue backlog on {{ $labels.queue }}"
    description: "Queue {{ $labels.queue }} has {{ $value }} pending messages"
```

### 告警处理流程

#### 告警分级和响应
```typescript
enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

interface AlertRule {
  name: string
  condition: string
  severity: AlertSeverity
  description: string
  runbook: string
  team: string
}

class AlertManager {
  private rules: AlertRule[] = []
  private escalationPolicies: Map<AlertSeverity, EscalationPolicy> = new Map()

  constructor() {
    this.initializeRules()
    this.initializeEscalationPolicies()
  }

  private initializeRules() {
    this.rules = [
      {
        name: 'ServiceDown',
        condition: 'up{service=~".+"} == 0',
        severity: AlertSeverity.CRITICAL,
        description: 'Service is completely down',
        runbook: 'https://wiki.company.com/service-down-runbook',
        team: 'platform-team'
      },
      {
        name: 'HighErrorRate',
        condition: 'rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05',
        severity: AlertSeverity.WARNING,
        description: 'Error rate is above 5%',
        runbook: 'https://wiki.company.com/high-error-rate-runbook',
        team: 'backend-team'
      }
    ]
  }

  private initializeEscalationPolicies() {
    this.escalationPolicies.set(AlertSeverity.CRITICAL, {
      immediateNotification: true,
      escalationTime: 5 * 60 * 1000, // 5分钟
      escalationLevels: [
        { channels: ['slack', 'email'], users: ['oncall-engineer'] },
        { channels: ['phone', 'sms'], users: ['tech-lead'] },
        { channels: ['phone', 'sms'], users: ['engineering-manager'] }
      ]
    })

    this.escalationPolicies.set(AlertSeverity.WARNING, {
      immediateNotification: false,
      escalationTime: 30 * 60 * 1000, // 30分钟
      escalationLevels: [
        { channels: ['slack'], users: ['oncall-engineer'] }
      ]
    })
  }

  async processAlert(alert: Alert): Promise<void> {
    const rule = this.findMatchingRule(alert)

    if (rule) {
      await this.notifyTeams(alert, rule)
      await this.startEscalation(alert, rule)
      await this.createIncident(alert, rule)
    }
  }

  private findMatchingRule(alert: Alert): AlertRule | null {
    return this.rules.find(rule => rule.name === alert.name) || null
  }

  private async notifyTeams(alert: Alert, rule: AlertRule): Promise<void> {
    const policy = this.escalationPolicies.get(rule.severity)

    if (policy?.immediateNotification) {
      await this.sendNotifications(alert, rule, policy.escalationLevels[0])
    }
  }

  private async startEscalation(alert: Alert, rule: AlertRule): Promise<void> {
    const policy = this.escalationPolicies.get(rule.severity)

    if (policy && policy.escalationLevels.length > 1) {
      for (let i = 1; i < policy.escalationLevels.length; i++) {
        setTimeout(async () => {
          // 检查告警是否仍然活跃
          if (await this.isAlertStillActive(alert)) {
            await this.sendNotifications(alert, rule, policy.escalationLevels[i])
          }
        }, policy.escalationTime * i)
      }
    }
  }

  private async createIncident(alert: Alert, rule: AlertRule): Promise<void> {
    if (rule.severity === AlertSeverity.CRITICAL) {
      await this.incidentManagement.createIncident({
        title: alert.name,
        description: rule.description,
        severity: rule.severity,
        affectedServices: [alert.service],
        runbook: rule.runbook,
        assignedTeam: rule.team
      })
    }
  }

  private async sendNotifications(
    alert: Alert,
    rule: AlertRule,
    level: EscalationLevel
  ): Promise<void> {
    for (const channel of level.channels) {
      for (const user of level.users) {
        await this.notificationService.send(channel, user, {
          subject: `${rule.severity.toUpperCase()}: ${alert.name}`,
          body: this.formatAlertMessage(alert, rule),
          priority: this.getChannelPriority(channel, rule.severity)
        })
      }
    }
  }

  private formatAlertMessage(alert: Alert, rule: AlertRule): string {
    return `
Alert: ${alert.name}
Service: ${alert.service}
Severity: ${rule.severity}
Description: ${rule.description}
Value: ${alert.value}
Time: ${alert.timestamp}

Runbook: ${rule.runbook}
    `.trim()
  }

  private getChannelPriority(channel: string, severity: AlertSeverity): string {
    if (severity === AlertSeverity.CRITICAL) {
      return channel === 'phone' ? 'high' : 'urgent'
    }
    return 'normal'
  }

  private async isAlertStillActive(alert: Alert): Promise<boolean> {
    // 检查告警是否仍然触发
    // 这里应该查询监控系统
    return true // 简化实现
  }
}
```

---

## 📋 日志聚合

### 结构化日志规范

#### 日志级别定义
```typescript
enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5
}

interface StructuredLog {
  timestamp: string
  level: LogLevel
  service: string
  instance: string
  version: string
  traceId?: string
  spanId?: string
  requestId?: string
  userId?: string
  tenantId?: string
  operation: string
  duration?: number
  status: 'success' | 'failure' | 'degraded'
  message: string
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  metadata: Record<string, any>
  tags: string[]
}
```

#### 日志输出格式
```json
{
  "timestamp": "2025-11-17T10:00:00.123Z",
  "level": "INFO",
  "service": "user-service",
  "instance": "user-service-7f8b9c",
  "version": "1.2.3",
  "traceId": "abc123def456",
  "spanId": "span789",
  "requestId": "req-101112",
  "userId": "user-131415",
  "tenantId": "tenant-161718",
  "operation": "getUserProfile",
  "duration": 45,
  "status": "success",
  "message": "User profile retrieved successfully",
  "metadata": {
    "userId": "user-131415",
    "fields": ["name", "email", "avatar"],
    "cacheHit": true
  },
  "tags": ["api", "cache", "user"]
}
```

### 日志聚合架构

#### 日志收集器
```typescript
class LogCollector {
  private buffers: Map<string, LogEntry[]> = new Map()
  private flushInterval: number
  private batchSize: number

  constructor(flushInterval = 5000, batchSize = 100) {
    this.flushInterval = flushInterval
    this.batchSize = batchSize
    this.startPeriodicFlush()
  }

  log(entry: LogEntry): void {
    const key = `${entry.service}:${entry.level}`

    if (!this.buffers.has(key)) {
      this.buffers.set(key, [])
    }

    const buffer = this.buffers.get(key)!
    buffer.push(entry)

    // 达到批次大小时立即刷新
    if (buffer.length >= this.batchSize) {
      this.flushBuffer(key, buffer)
    }
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flushAllBuffers()
    }, this.flushInterval)
  }

  private flushAllBuffers(): void {
    for (const [key, buffer] of this.buffers.entries()) {
      if (buffer.length > 0) {
        this.flushBuffer(key, buffer)
      }
    }
  }

  private flushBuffer(key: string, buffer: LogEntry[]): void {
    // 发送到日志聚合系统
    this.sendToAggregator(key, buffer.splice(0))

    // 清空缓冲区
    this.buffers.delete(key)
  }

  private async sendToAggregator(key: string, entries: LogEntry[]): Promise<void> {
    try {
      await fetch('/api/logs/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batchId: this.generateBatchId(),
          entries
        })
      })
    } catch (error) {
      console.error('Failed to send logs to aggregator:', error)
      // 可以实现重试逻辑
    }
  }

  private generateBatchId(): string {
    return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
```

#### 日志聚合器
```typescript
class LogAggregator {
  private storage: LogStorage
  private indexers: LogIndexer[] = []
  private processors: LogProcessor[] = []

  constructor(storage: LogStorage) {
    this.storage = storage
    this.initializeIndexers()
    this.initializeProcessors()
  }

  async processBatch(batch: LogBatch): Promise<void> {
    // 验证批次
    if (!this.validateBatch(batch)) {
      throw new Error('Invalid log batch')
    }

    // 预处理日志
    const processedEntries = await this.preprocessEntries(batch.entries)

    // 存储日志
    await this.storage.storeBatch(processedEntries)

    // 建立索引
    for (const indexer of this.indexers) {
      await indexer.indexBatch(processedEntries)
    }

    // 后处理
    for (const processor of this.processors) {
      await processor.processBatch(processedEntries)
    }

    // 更新统计信息
    await this.updateStatistics(processedEntries)
  }

  private validateBatch(batch: LogBatch): boolean {
    return batch.entries.every(entry =>
      entry.timestamp &&
      entry.service &&
      entry.level !== undefined &&
      entry.message
    )
  }

  private async preprocessEntries(entries: LogEntry[]): Promise<LogEntry[]> {
    return Promise.all(entries.map(async entry => ({
      ...entry,
      processedAt: new Date().toISOString(),
      // 添加额外的元数据
      environment: await this.detectEnvironment(entry),
      region: await this.detectRegion(entry),
      sanitizedMessage: this.sanitizeMessage(entry.message)
    })))
  }

  private initializeIndexers(): void {
    // 时间索引
    this.indexers.push(new TimeBasedIndexer())

    // 服务索引
    this.indexers.push(new ServiceBasedIndexer())

    // 错误索引
    this.indexers.push(new ErrorBasedIndexer())

    // 用户索引
    this.indexers.push(new UserBasedIndexer())
  }

  private initializeProcessors(): void {
    // 错误检测处理器
    this.processors.push(new ErrorDetectionProcessor())

    // 性能监控处理器
    this.processors.push(new PerformanceMonitoringProcessor())

    // 安全事件处理器
    this.processors.push(new SecurityEventProcessor())

    // 业务指标处理器
    this.processors.push(new BusinessMetricsProcessor())
  }
}
```

---

## 🔗 链路追踪

### 分布式追踪实现

#### 追踪上下文管理
```typescript
class TraceContext {
  private static instance: TraceContext
  private activeSpan: Span | null = null
  private baggage: Map<string, string> = new Map()

  static getInstance(): TraceContext {
    if (!TraceContext.instance) {
      TraceContext.instance = new TraceContext()
    }
    return TraceContext.instance
  }

  startSpan(operationName: string, options: SpanOptions = {}): Span {
    const span = new Span(operationName, options.parentSpan || this.activeSpan)

    if (!this.activeSpan) {
      // 根span，生成新的traceId
      span.traceId = this.generateTraceId()
    } else {
      // 子span，继承traceId
      span.traceId = this.activeSpan.traceId
    }

    span.spanId = this.generateSpanId()
    this.activeSpan = span

    return span
  }

  finishSpan(span: Span): void {
    span.finish()
    this.activeSpan = span.parent || null
  }

  getCurrentSpan(): Span | null {
    return this.activeSpan
  }

  setBaggageItem(key: string, value: string): void {
    this.baggage.set(key, value)
  }

  getBaggageItem(key: string): string | undefined {
    return this.baggage.get(key)
  }

  injectHeaders(headers: Record<string, string>): void {
    const span = this.getCurrentSpan()
    if (span) {
      headers['X-Trace-Id'] = span.traceId
      headers['X-Span-Id'] = span.spanId
      if (span.parentSpanId) {
        headers['X-Parent-Span-Id'] = span.parentSpanId
      }
    }

    // 注入baggage
    for (const [key, value] of this.baggage.entries()) {
      headers[`X-Baggage-${key}`] = value
    }
  }

  extractFromHeaders(headers: Record<string, string>): void {
    // 提取追踪信息
    if (headers['X-Trace-Id']) {
      // 创建子span
    }

    // 提取baggage
    for (const [key, value] of Object.entries(headers)) {
      if (key.startsWith('X-Baggage-')) {
        const baggageKey = key.substring('X-Baggage-'.length)
        this.baggage.set(baggageKey, value)
      }
    }
  }

  private generateTraceId(): string {
    return this.generateId(16)
  }

  private generateSpanId(): string {
    return this.generateId(8)
  }

  private generateId(length: number): string {
    const chars = 'abcdef0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}
```

#### 追踪拦截器
```typescript
class TracingInterceptor {
  intercept(request: HttpRequest, next: HttpHandler): Observable<HttpResponse> {
    const traceContext = TraceContext.getInstance()

    // 开始新的span
    const span = traceContext.startSpan(`${request.method} ${request.url}`, {
      tags: {
        'http.method': request.method,
        'http.url': request.url,
        'http.scheme': request.url.startsWith('https') ? 'https' : 'http'
      }
    })

    // 注入追踪头
    traceContext.injectHeaders(request.headers)

    const subscription = next.handle(request).subscribe({
      next: (response) => {
        // 添加响应信息到span
        span.setTag('http.status_code', response.status)
        span.setTag('http.response_size', this.getResponseSize(response))

        // 完成span
        traceContext.finishSpan(span)
      },
      error: (error) => {
        // 记录错误
        span.setTag('error', true)
        span.setTag('error.message', error.message)

        // 完成span
        traceContext.finishSpan(span)

        throw error
      }
    })

    return new Observable(subscriber => {
      subscription.add(() => {
        subscriber.complete()
      })
    })
  }

  private getResponseSize(response: HttpResponse): number {
    // 计算响应体大小
    if (response.body && typeof response.body === 'string') {
      return response.body.length
    }
    return 0
  }
}
```

---

## 🕸️ 服务网格

### 服务网格架构

#### 数据平面和控制平面
```yaml
# Istio Service Mesh配置示例
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: user-service-routing
  namespace: {{namespace}}
spec:
  hosts:
    - user-service
  http:
    - match:
        - headers:
            x-feature-flag:
              exact: new-ui
      route:
        - destination:
            host: user-service
            subset: v2
      # 金丝雀发布
      weight: 10
    - route:
        - destination:
            host: user-service
            subset: v1
      weight: 90
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: user-service-dr
  namespace: {{namespace}}
spec:
  host: user-service
  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
```

#### 流量管理策略
```typescript
interface TrafficPolicy {
  service: string
  routes: RouteRule[]
  loadBalancing: LoadBalancingPolicy
  circuitBreaker: CircuitBreakerPolicy
  timeout: TimeoutPolicy
  retry: RetryPolicy
}

interface RouteRule {
  match: {
    headers?: Record<string, string>
    method?: string[]
    path?: string
  }
  route: {
    destination: string
    weight?: number
    headers?: Record<string, string>
  }
}

class ServiceMeshManager {
  private policies: Map<string, TrafficPolicy> = new Map()

  async applyTrafficPolicy(service: string, policy: TrafficPolicy): Promise<void> {
    // 验证策略
    await this.validatePolicy(policy)

    // 应用到服务网格
    await this.deployToMesh(service, policy)

    // 存储策略
    this.policies.set(service, policy)

    // 监控策略效果
    this.monitorPolicyEffectiveness(service, policy)
  }

  async updateTrafficDistribution(service: string, distribution: TrafficDistribution): Promise<void> {
    const policy = this.policies.get(service)
    if (!policy) {
      throw new Error(`No traffic policy found for service: ${service}`)
    }

    // 更新路由权重
    policy.routes = policy.routes.map(route => ({
      ...route,
      weight: distribution[route.route.destination] || route.weight || 0
    }))

    await this.applyTrafficPolicy(service, policy)
  }

  private async validatePolicy(policy: TrafficPolicy): Promise<void> {
    // 验证路由权重之和为100
    const totalWeight = policy.routes.reduce((sum, route) => sum + (route.weight || 0), 0)
    if (totalWeight !== 100) {
      throw new Error('Route weights must sum to 100')
    }

    // 验证超时设置合理性
    if (policy.timeout.request > policy.timeout.idle) {
      throw new Error('Request timeout cannot be greater than idle timeout')
    }
  }

  private async deployToMesh(service: string, policy: TrafficPolicy): Promise<void> {
    // 转换为Istio配置
    const istioConfig = this.convertToIstioConfig(service, policy)

    // 部署到Kubernetes
    await this.kubernetesClient.apply(istioConfig)
  }

  private convertToIstioConfig(service: string, policy: TrafficPolicy): any {
    // 转换为Istio VirtualService和DestinationRule配置
    return {
      apiVersion: 'networking.istio.io/v1beta1',
      kind: 'VirtualService',
      metadata: {
        name: `${service}-vs`,
        namespace: process.env.NAMESPACE
      },
      spec: {
        hosts: [service],
        http: policy.routes.map(route => ({
          match: route.match,
          route: [{
            destination: {
              host: route.route.destination
            },
            weight: route.weight
          }]
        }))
      }
    }
  }

  private monitorPolicyEffectiveness(service: string, policy: TrafficPolicy): void {
    // 设置监控指标
    // 跟踪流量分布是否符合预期
    // 监控错误率和响应时间变化
  }
}
```

---

## 🚀 部署策略

### 滚动更新策略

#### 金丝雀发布
```typescript
class CanaryDeployment {
  private k8sClient: KubernetesClient
  private monitoring: MonitoringService

  async deployCanary(
    service: string,
    newVersion: string,
    trafficPercentage: number = 10
  ): Promise<void> {
    // 创建新版本的部署
    await this.createCanaryDeployment(service, newVersion)

    // 配置流量分配
    await this.configureTrafficSplit(service, trafficPercentage)

    // 监控新版本表现
    await this.monitorCanaryHealth(service, newVersion)

    // 根据监控结果决定是否继续发布
    const healthCheck = await this.performCanaryAnalysis(service, newVersion)

    if (healthCheck.passed) {
      // 增加流量到100%
      await this.promoteCanary(service, newVersion)
    } else {
      // 回滚到旧版本
      await this.rollbackCanary(service, newVersion)
    }
  }

  private async createCanaryDeployment(service: string, version: string): Promise<void> {
    const deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: `${service}-canary`,
        labels: {
          app: service,
          version: version,
          canary: 'true'
        }
      },
      spec: {
        replicas: 1, // 先部署1个副本
        selector: {
          matchLabels: {
            app: service,
            version: version
          }
        },
        template: {
          metadata: {
            labels: {
              app: service,
              version: version,
              canary: 'true'
            }
          },
          spec: {
            containers: [{
              name: service,
              image: `${service}:${version}`,
              ports: [{ containerPort: 8080 }],
              resources: {
                requests: { cpu: '100m', memory: '256Mi' },
                limits: { cpu: '200m', memory: '512Mi' }
              }
            }]
          }
        }
      }
    }

    await this.k8sClient.createDeployment(deployment)
  }

  private async configureTrafficSplit(service: string, percentage: number): Promise<void> {
    const virtualService = {
      apiVersion: 'networking.istio.io/v1beta1',
      kind: 'VirtualService',
      metadata: {
        name: `${service}-canary`,
      },
      spec: {
        hosts: [service],
        http: [{
          route: [
            {
              destination: { host: `${service}-canary` },
              weight: percentage
            },
            {
              destination: { host: service },
              weight: 100 - percentage
            }
          ]
        }]
      }
    }

    await this.k8sClient.applyVirtualService(virtualService)
  }

  private async monitorCanaryHealth(service: string, version: string): Promise<void> {
    // 监控关键指标
    const metrics = [
      `http_requests_total{service="${service}",version="${version}"}`,
      `http_request_duration_seconds{service="${service}",version="${version}"}`,
      `http_errors_total{service="${service}",version="${version}"}`
    ]

    // 设置告警阈值
    await this.monitoring.createCanaryAlerts(service, version, {
      errorRateThreshold: 0.05,    // 5%错误率
      latencyThreshold: 2.0,       // 2秒延迟
      minObservationTime: 300000   // 5分钟观察期
    })
  }

  private async performCanaryAnalysis(service: string, version: string): Promise<CanaryHealthCheck> {
    const metrics = await this.monitoring.getCanaryMetrics(service, version)

    return {
      passed: metrics.errorRate < 0.05 && metrics.p95Latency < 2.0,
      metrics,
      recommendations: this.generateRecommendations(metrics)
    }
  }

  private generateRecommendations(metrics: CanaryMetrics): string[] {
    const recommendations = []

    if (metrics.errorRate > 0.05) {
      recommendations.push('错误率偏高，建议检查错误处理逻辑')
    }

    if (metrics.p95Latency > 2.0) {
      recommendations.push('响应时间偏慢，建议优化性能')
    }

    if (metrics.cpuUsage > 80) {
      recommendations.push('CPU使用率较高，建议增加资源或优化代码')
    }

    return recommendations
  }

  private async promoteCanary(service: string, version: string): Promise<void> {
    // 将金丝雀版本设为稳定版本
    await this.k8sClient.scaleDeployment(service, 0) // 停止旧版本
    await this.k8sClient.renameDeployment(`${service}-canary`, service)
    await this.k8sClient.scaleDeployment(service, 3) // 启动新版本

    // 更新流量规则
    await this.k8sClient.removeVirtualService(`${service}-canary`)
  }

  private async rollbackCanary(service: string, version: string): Promise<void> {
    // 删除金丝雀部署
    await this.k8sClient.deleteDeployment(`${service}-canary`)

    // 恢复原始流量规则
    await this.k8sClient.removeVirtualService(`${service}-canary`)
  }
}
```

#### 蓝绿部署
```typescript
class BlueGreenDeployment {
  private k8sClient: KubernetesClient
  private loadBalancer: LoadBalancerService

  async deployBlueGreen(
    service: string,
    newVersion: string,
    healthCheckUrl: string
  ): Promise<void> {
    // 创建绿色环境
    await this.createGreenEnvironment(service, newVersion)

    // 等待绿色环境就绪
    await this.waitForGreenReady(service, healthCheckUrl)

    // 执行切换
    await this.switchTrafficToGreen(service)

    // 验证切换结果
    await this.verifyGreenHealth(service)

    // 清理蓝色环境
    await this.cleanupBlueEnvironment(service)
  }

  private async createGreenEnvironment(service: string, version: string): Promise<void> {
    const greenDeployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: `${service}-green`,
        labels: {
          app: service,
          environment: 'green',
          version: version
        }
      },
      spec: {
        replicas: 3,
        selector: {
          matchLabels: {
            app: service,
            environment: 'green'
          }
        },
        template: {
          metadata: {
            labels: {
              app: service,
              environment: 'green',
              version: version
            }
          },
          spec: {
            containers: [{
              name: service,
              image: `${service}:${version}`,
              ports: [{ containerPort: 8080 }],
              readinessProbe: {
                httpGet: { path: '/health', port: 8080 },
                initialDelaySeconds: 30,
                periodSeconds: 10
              },
              livenessProbe: {
                httpGet: { path: '/health', port: 8080 },
                initialDelaySeconds: 60,
                periodSeconds: 30
              }
            }]
          }
        }
      }
    }

    await this.k8sClient.createDeployment(greenDeployment)

    // 创建绿色环境的Service
    const greenService = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: `${service}-green`,
        labels: {
          app: service,
          environment: 'green'
        }
      },
      spec: {
        selector: {
          app: service,
          environment: 'green'
        },
        ports: [{
          port: 80,
          targetPort: 8080
        }]
      }
    }

    await this.k8sClient.createService(greenService)
  }

  private async waitForGreenReady(service: string, healthCheckUrl: string): Promise<void> {
    const maxRetries = 30 // 5分钟
    const retryInterval = 10000 // 10秒

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`http://${service}-green/health`)
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'UP') {
            return // 绿色环境就绪
          }
        }
      } catch (error) {
        console.log(`Green environment not ready yet, retry ${i + 1}/${maxRetries}`)
      }

      await new Promise(resolve => setTimeout(resolve, retryInterval))
    }

    throw new Error('Green environment failed to become ready')
  }

  private async switchTrafficToGreen(service: string): Promise<void> {
    // 更新负载均衡器指向绿色环境
    await this.loadBalancer.updateTarget(`${service}-green`)

    // 等待一段时间让流量完全切换
    await new Promise(resolve => setTimeout(resolve, 30000))
  }

  private async verifyGreenHealth(service: string): Promise<void> {
    // 监控一段时间内的错误率和响应时间
    const monitoringPeriod = 5 * 60 * 1000 // 5分钟

    const startTime = Date.now()
    let errorCount = 0
    let totalRequests = 0

    while (Date.now() - startTime < monitoringPeriod) {
      // 检查服务健康状态
      const health = await this.checkServiceHealth(service)

      if (!health.healthy) {
        throw new Error('Green environment health check failed')
      }

      // 收集性能指标
      const metrics = await this.monitoring.getServiceMetrics(service)
      totalRequests += metrics.requests
      errorCount += metrics.errors

      await new Promise(resolve => setTimeout(resolve, 10000)) // 每10秒检查一次
    }

    const errorRate = errorCount / totalRequests
    if (errorRate > 0.05) { // 5%错误率阈值
      throw new Error(`Green environment error rate too high: ${(errorRate * 100).toFixed(2)}%`)
    }
  }

  private async cleanupBlueEnvironment(service: string): Promise<void> {
    // 删除蓝色环境部署和服务
    await this.k8sClient.deleteDeployment(`${service}-blue`)
    await this.k8sClient.deleteService(`${service}-blue`)

    // 重命名绿色环境为生产环境
    await this.k8sClient.renameDeployment(`${service}-green`, service)
    await this.k8sClient.renameService(`${service}-green`, service)
  }
}
```

---

## 🛟 故障恢复

### 故障检测和分类

#### 故障检测器
```typescript
class FailureDetector {
  private healthChecks: Map<string, HealthCheck> = new Map()
  private failureHistory: Map<string, FailureRecord[]> = new Map()

  constructor() {
    this.initializeHealthChecks()
  }

  private initializeHealthChecks() {
    // 基础设施健康检查
    this.addHealthCheck('database', {
      type: 'database',
      check: () => this.checkDatabaseHealth(),
      timeout: 5000,
      interval: 30000,
      failureThreshold: 3
    })

    // 外部服务健康检查
    this.addHealthCheck('payment-service', {
      type: 'external-service',
      check: () => this.checkExternalServiceHealth('payment-service'),
      timeout: 10000,
      interval: 60000,
      failureThreshold: 2
    })

    // 消息队列健康检查
    this.addHealthCheck('message-queue', {
      type: 'message-queue',
      check: () => this.checkMessageQueueHealth(),
      timeout: 5000,
      interval: 30000,
      failureThreshold: 3
    })
  }

  private addHealthCheck(name: string, check: HealthCheck): void {
    this.healthChecks.set(name, check)
    this.startHealthCheck(name, check)
  }

  private startHealthCheck(name: string, check: HealthCheck): void {
    let consecutiveFailures = 0

    setInterval(async () => {
      try {
        const result = await Promise.race([
          check.check(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), check.timeout)
          )
        ])

        if (result.healthy) {
          consecutiveFailures = 0
          this.recordHealthEvent(name, 'healthy', result)
        } else {
          consecutiveFailures++
          this.recordHealthEvent(name, 'unhealthy', result)

          if (consecutiveFailures >= check.failureThreshold) {
            await this.handleFailure(name, check.type, result)
          }
        }
      } catch (error) {
        consecutiveFailures++
        this.recordHealthEvent(name, 'error', { error: error.message })

        if (consecutiveFailures >= check.failureThreshold) {
          await this.handleFailure(name, check.type, { error: error.message })
        }
      }
    }, check.interval)
  }

  private async handleFailure(name: string, type: string, details: any): Promise<void> {
    const failure: FailureRecord = {
      component: name,
      type,
      timestamp: new Date().toISOString(),
      details,
      severity: this.determineSeverity(type, details)
    }

    // 记录故障历史
    this.recordFailure(failure)

    // 触发恢复策略
    await this.recoveryManager.handleFailure(failure)

    // 发送告警
    await this.alertManager.sendAlert({
      level: failure.severity,
      title: `${type} failure detected: ${name}`,
      description: `Component ${name} is failing`,
      details: failure
    })
  }

  private determineSeverity(type: string, details: any): 'low' | 'medium' | 'high' | 'critical' {
    switch (type) {
      case 'database':
        return 'critical'
      case 'external-service':
        return details.error?.includes('timeout') ? 'high' : 'medium'
      case 'message-queue':
        return 'high'
      default:
        return 'medium'
    }
  }

  private recordFailure(failure: FailureRecord): void {
    const history = this.failureHistory.get(failure.component) || []
    history.push(failure)

    // 只保留最近100条记录
    if (history.length > 100) {
      history.shift()
    }

    this.failureHistory.set(failure.component, history)
  }

  private recordHealthEvent(component: string, status: string, details: any): void {
    console.log(`Health check for ${component}: ${status}`, details)
  }
}
```

### 自动恢复策略

#### 恢复管理器
```typescript
class RecoveryManager {
  private strategies: Map<string, RecoveryStrategy> = new Map()

  constructor() {
    this.initializeStrategies()
  }

  private initializeStrategies() {
    // 数据库连接恢复策略
    this.strategies.set('database', {
      name: 'database-recovery',
      steps: [
        {
          name: 'check-connection-pool',
          action: async () => {
            // 检查连接池状态
            const poolStats = await this.database.getPoolStats()
            return poolStats.active < poolStats.max ? 'success' : 'failed'
          },
          timeout: 10000
        },
        {
          name: 'recreate-connections',
          action: async () => {
            // 重新创建数据库连接
            await this.database.recreatePool()
            return 'success'
          },
          timeout: 30000
        }
      ],
      fallback: async () => {
        // 降级到只读模式或返回缓存数据
        await this.enableReadOnlyMode()
      }
    })

    // 外部服务恢复策略
    this.strategies.set('external-service', {
      name: 'service-circuit-breaker',
      steps: [
        {
          name: 'check-service-health',
          action: async (context) => {
            const health = await this.checkServiceHealth(context.serviceName)
            return health ? 'success' : 'failed'
          },
          timeout: 5000
        }
      ],
      fallback: async (context) => {
        // 启用熔断器
        await this.circuitBreaker.trip(context.serviceName)
        // 启用降级服务
        await this.fallbackService.activate(context.serviceName)
      }
    })
  }

  async handleFailure(failure: FailureRecord): Promise<void> {
    const strategy = this.strategies.get(failure.type)

    if (strategy) {
      try {
        const result = await this.executeRecoveryStrategy(strategy, failure)

        if (result.success) {
          console.log(`Recovery successful for ${failure.component}`)
          await this.alertManager.sendRecoveryNotification(failure, 'success')
        } else {
          console.log(`Recovery failed for ${failure.component}, executing fallback`)
          await strategy.fallback(failure)
          await this.alertManager.sendRecoveryNotification(failure, 'fallback')
        }
      } catch (error) {
        console.error(`Recovery execution failed for ${failure.component}:`, error)
        await strategy.fallback(failure)
        await this.alertManager.sendRecoveryNotification(failure, 'error')
      }
    } else {
      console.log(`No recovery strategy defined for failure type: ${failure.type}`)
      await this.alertManager.sendRecoveryNotification(failure, 'no-strategy')
    }
  }

  private async executeRecoveryStrategy(
    strategy: RecoveryStrategy,
    failure: FailureRecord
  ): Promise<RecoveryResult> {
    for (const step of strategy.steps) {
      try {
        console.log(`Executing recovery step: ${step.name}`)

        const result = await Promise.race([
          step.action(failure),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), step.timeout)
          )
        ])

        if (result === 'failed') {
          return { success: false, failedStep: step.name }
        }
      } catch (error) {
        console.error(`Recovery step ${step.name} failed:`, error)
        return { success: false, failedStep: step.name, error: error.message }
      }
    }

    return { success: true }
  }
}
```

---

## 📚 相关文档

- [微服务API文档模板](../templates/microservice-api-template.md)
- [服务网格治理指南](../technical/service-mesh/governance.md)
- [故障恢复手册](../operations/failure-recovery-manual.md)

---

*本服务治理文档定义了微服务架构的核心治理策略和实施规范，确保系统在分布式环境下的稳定性、可观测性和可维护性。如有疑问请联系平台架构组。*
