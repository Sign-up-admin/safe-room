# API 接口文档模板

---
title: API 接口文档
version: v1.0.0
last_updated: YYYY-MM-DD
status: active
category: technical
tags: [api, rest, documentation]
---

# API 接口文档

> **版本**：v1.0.0
> **更新日期**：YYYY-MM-DD
> **Base URL**：`https://api.example.com/v1`
> **认证方式**：Bearer Token

---

## 📋 目录

- [快速开始](#快速开始)
- [认证授权](#认证授权)
- [通用规范](#通用规范)
- [接口列表](#接口列表)
- [数据模型](#数据模型)
- [错误码](#错误码)
- [SDK与工具](#sdk与工具)

---

## 🚀 快速开始

### 环境信息

| 环境 | Base URL | 说明 |
|------|----------|------|
| 生产 | `https://api.example.com/v1` | 生产环境 |
| 测试 | `https://api-test.example.com/v1` | 测试环境 |
| 开发 | `http://localhost:8080/api/v1` | 本地开发 |

### 认证示例

```bash
# 获取访问令牌
curl -X POST https://api.example.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "pass"}'

# 使用令牌访问API
curl -X GET https://api.example.com/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔐 认证授权

### 支持的认证方式

#### 1. Bearer Token

```http
Authorization: Bearer <token>
```

#### 2. API Key

```http
X-API-Key: <api-key>
```

### 获取令牌

```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer"
  }
}
```

### 令牌刷新

```http
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

---

## 📋 通用规范

### 请求格式

#### HTTP 方法

- `GET`：查询数据
- `POST`：创建资源
- `PUT`：更新资源（完整更新）
- `PATCH`：部分更新资源
- `DELETE`：删除资源

#### 请求头

```http
Content-Type: application/json
Authorization: Bearer <token>
X-Request-ID: <uuid>  // 可选，用于追踪请求
X-API-Version: v1      // 可选，指定API版本
```

#### 查询参数

```http
GET /users?page=1&limit=10&sort=name&order=asc
```

### 响应格式

#### 成功响应

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "result": "data"
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "request_id": "uuid-string"
}
```

#### 错误响应

```json
{
  "code": 1001,
  "msg": "参数错误",
  "data": null,
  "timestamp": "2024-01-01T00:00:00Z",
  "request_id": "uuid-string"
}
```

#### 分页响应

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {"id": 1, "name": "Item 1"},
      {"id": 2, "name": "Item 2"}
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "total_pages": 10
  }
}
```

### 数据类型

| 类型 | 说明 | 示例 |
|------|------|------|
| string | 字符串 | `"hello"` |
| number | 数字 | `123` |
| boolean | 布尔值 | `true` |
| object | 对象 | `{"key": "value"}` |
| array | 数组 | `[1, 2, 3]` |
| date | 日期时间 | `"2024-01-01T00:00:00Z"` |

---

## 📚 接口列表

### 用户管理

#### 获取用户列表

```http
GET /users
```

**查询参数**：

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| limit | integer | 否 | 每页数量，默认10 |
| keyword | string | 否 | 搜索关键词 |
| status | string | 否 | 用户状态 |

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

#### 获取用户详情

```http
GET /users/{id}
```

**路径参数**：

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | integer | 是 | 用户ID |

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 创建用户

```http
POST /users
```

**请求体**：

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "profile": {
    "first_name": "string",
    "last_name": "string"
  }
}
```

**请求参数说明**：

| 参数 | 类型 | 必需 | 说明 | 验证规则 |
|------|------|------|------|----------|
| username | string | 是 | 用户名 | 3-20字符，只能包含字母数字下划线 |
| email | string | 是 | 邮箱 | 有效的邮箱格式 |
| password | string | 是 | 密码 | 至少8字符，包含大小写字母和数字 |
| profile.first_name | string | 否 | 名 | 2-50字符 |
| profile.last_name | string | 否 | 姓 | 2-50字符 |

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 更新用户

```http
PUT /users/{id}
```

**路径参数**：

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | integer | 是 | 用户ID |

**请求体**：

```json
{
  "email": "new_email@example.com",
  "profile": {
    "first_name": "Jane",
    "last_name": "Smith"
  }
}
```

#### 删除用户

```http
DELETE /users/{id}
```

**路径参数**：

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | integer | 是 | 用户ID |

---

## 📊 数据模型

### User 用户模型

```typescript
interface User {
  id: number;                    // 用户ID
  username: string;              // 用户名
  email: string;                 // 邮箱
  password?: string;             // 密码（仅创建时需要）
  status: 'active' | 'inactive'; // 用户状态
  profile?: UserProfile;         // 用户资料
  created_at: string;            // 创建时间
  updated_at: string;            // 更新时间
}

interface UserProfile {
  first_name?: string;           // 名
  last_name?: string;            // 姓
  avatar?: string;               // 头像URL
  phone?: string;                // 手机号
  bio?: string;                  // 个人简介
}
```

### 其他模型

#### Pagination 分页模型

```typescript
interface Pagination {
  page: number;      // 当前页码
  limit: number;     // 每页数量
  total: number;     // 总记录数
  total_pages: number; // 总页数
}
```

#### Error 错误模型

```typescript
interface ApiError {
  code: number;      // 错误码
  msg: string;       // 错误信息
  data?: any;        // 额外错误数据
  timestamp: string; // 错误发生时间
  request_id: string; // 请求ID
}
```

---

## ❌ 错误码

### 通用错误码

| 错误码 | HTTP状态码 | 说明 | 示例场景 |
|--------|------------|------|----------|
| 0 | 200 | 成功 | 操作成功 |
| 1000 | 400 | 参数错误 | 必填参数缺失 |
| 1001 | 400 | 参数格式错误 | 邮箱格式不正确 |
| 1002 | 400 | 参数值无效 | 状态值不在允许范围内 |
| 2000 | 401 | 未授权 | 未提供认证信息 |
| 2001 | 401 | 认证失败 | 用户名或密码错误 |
| 2002 | 401 | 令牌过期 | Access Token已过期 |
| 2003 | 403 | 权限不足 | 用户无权访问该资源 |
| 3000 | 404 | 资源不存在 | 用户ID不存在 |
| 4000 | 409 | 资源冲突 | 用户名已被使用 |
| 5000 | 500 | 服务器错误 | 数据库连接失败 |

### 业务错误码

| 错误码 | HTTP状态码 | 说明 | 所属模块 |
|--------|------------|------|----------|
| 10000 | 400 | 用户名已存在 | 用户管理 |
| 10001 | 400 | 邮箱已存在 | 用户管理 |
| 10002 | 400 | 密码强度不足 | 用户管理 |
| 20000 | 400 | 余额不足 | 支付模块 |
| 20001 | 400 | 支付超时 | 支付模块 |

---

## 🛠️ SDK 与工具

### JavaScript SDK

```javascript
import { ApiClient } from '@example/api-sdk';

const client = new ApiClient({
  baseURL: 'https://api.example.com/v1',
  apiKey: 'your-api-key'
});

// 获取用户列表
const users = await client.users.list({
  page: 1,
  limit: 10
});

// 创建用户
const newUser = await client.users.create({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'secure_password'
});
```

### cURL 示例

```bash
# 获取用户列表
curl -X GET "https://api.example.com/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 创建用户
curl -X POST "https://api.example.com/v1/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure_password"
  }'
```

### Postman 集合

[下载 Postman 集合](https://api.example.com/docs/postman-collection.json)

---

## 📈 配额与限制

### 请求限制

| 类型 | 限制 | 重置周期 |
|------|------|----------|
| 每分钟请求数 | 60 | 1分钟 |
| 每日请求数 | 10000 | 24小时 |
| 并发请求数 | 10 | 实时 |

### 数据限制

| 资源 | 限制 | 说明 |
|------|------|------|
| 请求体大小 | 10MB | JSON请求体的最大大小 |
| 响应超时 | 30秒 | API响应的最大超时时间 |
| 文件上传大小 | 50MB | 单个文件的最大大小 |

---

## 🔄 更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|----------|--------|
| YYYY-MM-DD | v1.0.0 | 初始版本 | API团队 |
| YYYY-MM-DD | v1.1.0 | 添加用户管理接口 | API团队 |
