---
title: MICROSERVICE API TEMPLATE
version: v1.0.0
last_updated: 2025-11-17
status: template
category: technical
tags: [microservice, api, template, openapi]
---

# 🔧 微服务API文档模板

> **模板版本**：v1.0.0
> **更新日期**：2025-11-17
> **适用范围**：微服务API开发
> **状态**：template

---

## 📋 模板说明

本模板用于标准化微服务API的文档格式，确保在分布式架构中保持一致的API设计和文档规范。

---

## 🎯 服务概述

### 基本信息
- **服务名称**: `{{ServiceName}}`
- **服务ID**: `{{service-id}}`
- **版本**: {{version}}
- **状态**: {{status}}
- **负责人**: {{owner}}

### 功能描述
{{简要描述微服务的核心功能和职责}}

### 架构位置
- **命名空间**: `{{namespace}}`
- **部署环境**: {{environments}}
- **依赖服务**: {{dependencies}}

---

## 🔗 服务接口

### 服务发现
```yaml
# Kubernetes Service定义
apiVersion: v1
kind: Service
metadata:
  name: {{service-id}}
  namespace: {{namespace}}
  labels:
    app: {{service-id}}
    version: {{version}}
spec:
  selector:
    app: {{service-id}}
  ports:
    - name: http
      port: 80
      targetPort: 8080
      protocol: TCP
  type: ClusterIP
```

### 健康检查端点

#### GET /health
健康检查接口

**响应示例**:
```json
{
  "status": "UP",
  "timestamp": "2025-11-17T10:00:00Z",
  "version": "{{version}}",
  "uptime": "7d 4h 23m",
  "dependencies": {
    "database": "UP",
    "redis": "UP",
    "message-queue": "UP"
  }
}
```

#### GET /readiness
就绪检查接口

**响应示例**:
```json
{
  "status": "READY",
  "checks": [
    {
      "name": "database",
      "status": "UP",
      "responseTime": "45ms"
    },
    {
      "name": "cache",
      "status": "UP",
      "responseTime": "12ms"
    }
  ]
}
```

---

## 📡 API规范

### 基础信息
- **Base URL**: `http://{{service-id}}.{{namespace}}.svc.cluster.local:8080`
- **API版本**: `v1`
- **认证方式**: `Bearer Token` / `API Key` / `mTLS`
- **数据格式**: `application/json`
- **字符编码**: `UTF-8`

### 公共请求头
```http
# 必需头
Authorization: Bearer {token}
X-Request-ID: {uuid}
X-Timestamp: {timestamp}
Content-Type: application/json

# 可选头
X-User-ID: {userId}
X-Tenant-ID: {tenantId}
X-Client-Version: {version}
Accept-Language: zh-CN,en-US
```

### 公共响应格式
```json
{
  "success": true,
  "code": "200",
  "message": "操作成功",
  "data": {
    // 业务数据
  },
  "meta": {
    "requestId": "req-123456",
    "timestamp": "2025-11-17T10:00:00Z",
    "version": "v1.0.0",
    "processingTime": "45ms"
  },
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 错误响应格式
```json
{
  "success": false,
  "code": "400",
  "message": "参数错误",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确",
      "code": "INVALID_EMAIL_FORMAT"
    }
  ],
  "meta": {
    "requestId": "req-123456",
    "timestamp": "2025-11-17T10:00:00Z"
  }
}
```

---

## 🔄 业务API

### 资源管理

#### 创建资源
**POST** `/api/v1/{{resources}}`

**请求参数**:
```json
{
  "name": "string",
  "description": "string",
  "status": "ACTIVE",
  "metadata": {
    "tags": ["tag1", "tag2"],
    "properties": {
      "key": "value"
    }
  }
}
```

**成功响应**:
```json
{
  "success": true,
  "code": "201",
  "message": "创建成功",
  "data": {
    "id": "res-123456",
    "name": "资源名称",
    "status": "ACTIVE",
    "createdAt": "2025-11-17T10:00:00Z",
    "createdBy": "user-789"
  }
}
```

#### 查询资源列表
**GET** `/api/v1/{{resources}}`

**查询参数**:
- `page`: 页码 (默认: 1)
- `size`: 每页大小 (默认: 20, 最大: 100)
- `sort`: 排序字段 (默认: createdAt)
- `order`: 排序方向 (asc/desc, 默认: desc)
- `status`: 状态过滤
- `search`: 搜索关键词

**响应示例**:
```json
{
  "success": true,
  "code": "200",
  "data": [
    {
      "id": "res-123456",
      "name": "资源名称",
      "status": "ACTIVE",
      "createdAt": "2025-11-17T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

#### 获取资源详情
**GET** `/api/v1/{{resources}}/{id}`

**路径参数**:
- `id`: 资源ID

**响应示例**:
```json
{
  "success": true,
  "code": "200",
  "data": {
    "id": "res-123456",
    "name": "资源名称",
    "description": "资源描述",
    "status": "ACTIVE",
    "metadata": {
      "tags": ["tag1", "tag2"]
    },
    "createdAt": "2025-11-17T10:00:00Z",
    "updatedAt": "2025-11-17T10:00:00Z"
  }
}
```

#### 更新资源
**PUT** `/api/v1/{{resources}}/{id}`

**请求示例**:
```json
{
  "name": "更新后的名称",
  "description": "更新后的描述",
  "status": "INACTIVE"
}
```

#### 删除资源
**DELETE** `/api/v1/{{resources}}/{id}`

**响应示例**:
```json
{
  "success": true,
  "code": "204",
  "message": "删除成功"
}
```

---

## 📨 异步通信

### 事件发布

#### 事件格式
```json
{
  "eventId": "evt-123456",
  "eventType": "{{ServiceName}}.{{Resource}}.{{Action}}",
  "timestamp": "2025-11-17T10:00:00Z",
  "source": "{{service-id}}",
  "version": "v1.0",
  "data": {
    "resourceId": "res-123456",
    "resourceType": "{{Resource}}",
    "action": "{{Action}}",
    "before": { /* 变更前数据 */ },
    "after": { /* 变更后数据 */ },
    "userId": "user-789",
    "tenantId": "tenant-101"
  },
  "metadata": {
    "correlationId": "corr-987654",
    "causationId": "evt-123455"
  }
}
```

### 消息队列集成

#### 发布事件到队列
```typescript
// 事件发布器接口
interface EventPublisher {
  publish(eventType: string, data: any, metadata?: EventMetadata): Promise<void>
}

// 使用示例
const eventPublisher = container.resolve(EventPublisher)

await eventPublisher.publish('{{ServiceName}}.{{Resource}}.Created', {
  resourceId: 'res-123456',
  resourceData: resource
}, {
  correlationId: requestId,
  userId: currentUser.id
})
```

#### 订阅外部事件
```typescript
// 事件处理器接口
interface EventHandler {
  handle(event: DomainEvent): Promise<void>
}

// 事件订阅配置
const eventSubscriptions = [
  {
    eventType: '*.User.Updated',
    handler: UserUpdatedHandler,
    queue: 'user-events-queue'
  },
  {
    eventType: '*.Order.Completed',
    handler: OrderCompletedHandler,
    queue: 'order-events-queue'
  }
]
```

---

## 🔐 安全与权限

### 认证机制

#### JWT Token认证
```typescript
interface JWTPayload {
  sub: string        // 用户ID
  iss: string        // 颁发者
  aud: string        // 受众
  exp: number        // 过期时间
  iat: number        // 颁发时间
  jti: string        // JWT ID
  tenantId: string   // 租户ID
  roles: string[]    // 用户角色
  permissions: string[] // 用户权限
}
```

#### API Key认证
```typescript
interface APIKey {
  keyId: string
  keySecret: string
  tenantId: string
  permissions: string[]
  rateLimit: {
    requests: number
    period: string  // '1m', '1h', '1d'
  }
  expiresAt?: string
}
```

### 授权策略

#### 基于角色的访问控制 (RBAC)
```typescript
interface Permission {
  resource: string    // 资源类型
  action: string      // 操作类型
  scope: 'own' | 'tenant' | 'global'  // 作用域
}

const rolePermissions: Record<string, Permission[]> = {
  'admin': [
    { resource: '*', action: '*', scope: 'global' }
  ],
  'manager': [
    { resource: '{{resources}}', action: '*', scope: 'tenant' },
    { resource: 'reports', action: 'read', scope: 'tenant' }
  ],
  'user': [
    { resource: '{{resources}}', action: 'read', scope: 'own' },
    { resource: '{{resources}}', action: 'create', scope: 'own' },
    { resource: '{{resources}}', action: 'update', scope: 'own' }
  ]
}
```

---

## 📊 可观测性

### 监控指标

#### 业务指标
```prometheus
# HTTP请求指标
http_requests_total{path="/api/v1/{{resources}}", method="GET", status="200"} 1234
http_request_duration_seconds{path="/api/v1/{{resources}}", method="POST", quantile="0.95"} 0.045

# 业务指标
{{service_id}}_resource_created_total 567
{{service_id}}_resource_active_current 1234

# 队列处理指标
message_queue_depth{queue="{{service-id}}-events"} 12
message_processing_duration_seconds{queue="{{service-id}}-events", quantile="0.95"} 0.023
```

#### 系统指标
```prometheus
# JVM指标
jvm_memory_used_bytes{area="heap"} 256000000
jvm_gc_collection_seconds_count{gc="G1 Young Generation"} 1234

# 数据库连接池
db_connection_pool_active 8
db_connection_pool_idle 12
db_connection_pool_waiting 2

# 缓存命中率
cache_hit_ratio{cache="redis"} 0.95
```

### 分布式追踪

#### Trace上下文传播
```typescript
// 追踪上下文接口
interface TraceContext {
  traceId: string
  spanId: string
  parentSpanId?: string
  sampled: boolean
  baggage: Record<string, string>
}

// HTTP头传播
const TRACE_HEADERS = {
  'X-Trace-Id': 'traceId',
  'X-Span-Id': 'spanId',
  'X-Parent-Span-Id': 'parentSpanId',
  'X-Sampled': 'sampled'
}

// 追踪中间件
class TracingMiddleware {
  intercept(request: HttpRequest, next: HttpHandler): Observable<HttpResponse> {
    const traceContext = this.extractTraceContext(request.headers)

    return this.tracer.startSpan('http-request', {
      childOf: traceContext,
      tags: {
        'http.method': request.method,
        'http.url': request.url
      }
    }).run(() => {
      this.injectTraceContext(request.headers)
      return next.handle(request)
    })
  }
}
```

### 日志规范

#### 结构化日志格式
```json
{
  "timestamp": "2025-11-17T10:00:00.123Z",
  "level": "INFO",
  "service": "{{service-id}}",
  "version": "{{version}}",
  "traceId": "abc-123-def-456",
  "spanId": "span-789",
  "requestId": "req-101112",
  "userId": "user-131415",
  "tenantId": "tenant-161718",
  "operation": "create-resource",
  "resource": "{{resources}}",
  "resourceId": "res-123456",
  "duration": 45,
  "status": "success",
  "message": "Resource created successfully",
  "metadata": {
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "parameters": {
      "name": "test-resource",
      "type": "example"
    }
  },
  "error": null
}
```

---

## 🔄 数据一致性

### 分布式事务

#### Saga模式实现
```typescript
interface SagaStep {
  id: string
  action: string
  compensation: string
  dependsOn?: string[]
  timeout?: number
}

interface SagaDefinition {
  name: string
  steps: SagaStep[]
  timeout: number
}

// 创建资源Saga
const createResourceSaga: SagaDefinition = {
  name: 'create-resource',
  timeout: 30000, // 30秒超时
  steps: [
    {
      id: 'validate-input',
      action: 'validateResourceInput',
      compensation: 'clearValidationCache'
    },
    {
      id: 'create-resource',
      action: 'createResource',
      compensation: 'deleteResource',
      dependsOn: ['validate-input']
    },
    {
      id: 'publish-event',
      action: 'publishResourceCreatedEvent',
      compensation: 'publishResourceCreationFailedEvent',
      dependsOn: ['create-resource']
    }
  ]
}
```

### 最终一致性

#### 事件驱动架构
```typescript
interface EventDrivenProcessor {
  process(event: DomainEvent): Promise<void>
  retry(event: DomainEvent, attempt: number): Promise<void>
  dlq(event: DomainEvent, error: Error): Promise<void>
}

// 事件处理器实现
class ResourceCreatedProcessor implements EventDrivenProcessor {
  async process(event: DomainEvent): Promise<void> {
    const { resourceId, resourceData } = event.data

    // 更新搜索索引
    await this.searchIndex.update(resourceId, resourceData)

    // 发送通知
    await this.notificationService.send({
      type: 'RESOURCE_CREATED',
      userId: event.metadata.userId,
      resourceId
    })

    // 更新统计数据
    await this.analyticsService.increment('resources.created')
  }

  async retry(event: DomainEvent, attempt: number): Promise<void> {
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000)
    await new Promise(resolve => setTimeout(resolve, delay))
    return this.process(event)
  }

  async dlq(event: DomainEvent, error: Error): Promise<void> {
    console.error('Failed to process event after retries:', error)
    // 发送告警
    await this.alertService.send({
      level: 'ERROR',
      message: `Event processing failed: ${event.eventType}`,
      details: { event, error: error.message }
    })
  }
}
```

---

## 📈 性能优化

### 缓存策略

#### 多层缓存架构
```typescript
interface CacheLayer {
  name: string
  ttl: number
  maxSize: number
  strategy: 'LRU' | 'LFU' | 'TTL'
}

// 缓存层配置
const cacheLayers: CacheLayer[] = [
  {
    name: 'memory-l1',
    ttl: 300,        // 5分钟
    maxSize: 10000,
    strategy: 'LRU'
  },
  {
    name: 'redis-l2',
    ttl: 3600,       // 1小时
    maxSize: 100000,
    strategy: 'TTL'
  },
  {
    name: 'database-l3',
    ttl: 86400,      // 24小时
    maxSize: -1,     // 无限制
    strategy: 'TTL'
  }
]

// 缓存键生成策略
class CacheKeyGenerator {
  static resourceList(tenantId: string, filters: any, pagination: any): string {
    return `resource:list:${tenantId}:${hash(filters)}:${pagination.page}:${pagination.size}`
  }

  static resourceDetail(resourceId: string): string {
    return `resource:detail:${resourceId}`
  }

  static userPermissions(userId: string, tenantId: string): string {
    return `user:permissions:${userId}:${tenantId}`
  }
}
```

### 数据库优化

#### 查询优化
```sql
-- 优化后的查询示例
SELECT
  r.id,
  r.name,
  r.status,
  r.created_at,
  u.username as created_by_name
FROM resources r
LEFT JOIN users u ON r.created_by = u.id
WHERE r.tenant_id = $1
  AND r.status = ANY($2)
  AND r.created_at >= $3
  AND r.created_at < $4
  AND (r.name ILIKE $5 OR r.description ILIKE $5)
ORDER BY r.created_at DESC
LIMIT $6 OFFSET $7

-- 对应的索引
CREATE INDEX idx_resources_tenant_status_created ON resources (tenant_id, status, created_at DESC);
CREATE INDEX idx_resources_search ON resources USING gin (to_tsvector('chinese', name || ' ' || description));
```

#### 连接池配置
```yaml
# 数据库连接池配置
database:
  pool:
    maxSize: 20
    minSize: 5
    maxIdleTime: 300000  # 5分钟
    maxLifetime: 1800000 # 30分钟
    connectionTimeout: 30000  # 30秒
    validationQuery: "SELECT 1"
    leakDetectionThreshold: 60000  # 1分钟
```

---

## 🧪 测试策略

### 单元测试
```typescript
describe('{{ServiceName}} Service', () => {
  let service: {{ServiceName}}Service
  let mockRepository: jest.Mocked<ResourceRepository>
  let mockEventPublisher: jest.Mocked<EventPublisher>

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    mockEventPublisher = {
      publish: jest.fn()
    }

    service = new {{ServiceName}}Service(mockRepository, mockEventPublisher)
  })

  describe('createResource', () => {
    it('should create resource successfully', async () => {
      const input = { name: 'Test Resource', description: 'Test Description' }
      const expectedResource = { id: 'res-123', ...input, status: 'ACTIVE' }

      mockRepository.create.mockResolvedValue(expectedResource)
      mockEventPublisher.publish.mockResolvedValue(undefined)

      const result = await service.createResource(input, 'user-456')

      expect(result).toEqual(expectedResource)
      expect(mockRepository.create).toHaveBeenCalledWith(input, 'user-456')
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        '{{ServiceName}}.Resource.Created',
        expect.objectContaining({
          resourceId: 'res-123',
          resourceData: expectedResource
        })
      )
    })

    it('should throw error for invalid input', async () => {
      const invalidInput = { name: '', description: 'Test' }

      await expect(service.createResource(invalidInput, 'user-456'))
        .rejects
        .toThrow('Resource name is required')
    })
  })
})
```

### 集成测试
```typescript
describe('{{ServiceName}} API Integration', () => {
  let app: TestApplication
  let client: TestClient

  beforeAll(async () => {
    app = await createTestApplication()
    client = app.getClient()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /api/v1/{{resources}}', () => {
    it('should create resource and return 201', async () => {
      const request = {
        name: 'Integration Test Resource',
        description: 'Created via integration test'
      }

      const response = await client
        .post('/api/v1/{{resources}}')
        .auth('bearer', testToken)
        .send(request)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject({
        name: request.name,
        description: request.description,
        status: 'ACTIVE'
      })
      expect(response.body.data.id).toMatch(/^res-/)

      // 验证事件发布
      await expectEventPublished('{{ServiceName}}.Resource.Created', {
        resourceId: response.body.data.id
      })
    })

    it('should return 400 for invalid input', async () => {
      const invalidRequest = {
        name: '',
        description: 'Invalid resource'
      }

      const response = await client
        .post('/api/v1/{{resources}}')
        .auth('bearer', testToken)
        .send(invalidRequest)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.code).toBe('400')
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: expect.stringContaining('required')
        })
      )
    })
  })
})
```

---

## 📚 相关文档

- [服务治理文档](../technical/backend/SERVICE_GOVERNANCE_DOCS.md)
- [微服务文档指南](../technical/backend/MICROSERVICES_DOCS_GUIDE.md)
- [API设计规范](../technical/api/API_DESIGN_GUIDE.md)

---

## 🔄 更新记录

| 版本 | 日期 | 更新内容 | 更新人 |
|------|------|----------|--------|
| 1.0.0 | 2025-11-17 | 初始版本，建立微服务API文档模板 | - |

---

*本模板基于微服务架构最佳实践设计，确保服务间接口的一致性和可维护性。如有特殊需求请联系架构组。*
