# Admin 前端 API 文档

> 版本：v1.0
> 更新日期：2025-11-16
> 适用项目：`springboot1ngh61a2/src/main/resources/admin/admin`

---

## 目录

- [1. 概述](#1-概述)
- [2. API 基础信息](#2-api-基础信息)
- [3. 认证与授权](#3-认证与授权)
- [4. 用户管理 API](#4-用户管理-api)
- [5. 教练管理 API](#5-教练管理-api)
- [6. 课程管理 API](#6-课程管理-api)
- [7. 预约管理 API](#7-预约管理-api)
- [8. 会员卡管理 API](#8-会员卡管理-api)
- [9. 内容管理 API](#9-内容管理-api)
- [10. 系统管理 API](#10-系统管理-api)
- [11. 文件上传 API](#11-文件上传-api)
- [12. 统计分析 API](#12-统计分析-api)
- [13. 错误处理](#13-错误处理)
- [14. 附录](#14-附录)

---

## 1. 概述

本文档详细描述了 Admin 前端系统与后端 API 的接口规范，包括请求格式、响应格式、错误处理等。

### 1.1 API 设计原则

- **RESTful 设计**: 遵循 RESTful API 设计规范
- **统一响应格式**: 所有接口返回统一的 JSON 格式
- **状态码规范**: 使用 HTTP 状态码 + 业务状态码
- **分页规范**: 统一的列表分页参数和响应格式
- **权限控制**: 基于角色的访问控制

### 1.2 基础响应格式

```json
{
  "code": 0,
  "msg": "操作成功",
  "data": {}
}
```

**字段说明**:
- `code`: 业务状态码，0 表示成功，非 0 表示失败
- `msg`: 响应消息
- `data`: 响应数据

---

## 2. API 基础信息

### 2.1 基础 URL

```
生产环境: https://api.yourdomain.com/springboot1ngh61a2
开发环境: http://localhost:8080/springboot1ngh61a2
```

### 2.2 请求头

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `Content-Type` | string | 是 | `application/json; charset=utf-8` |
| `Token` | string | 是 | 用户认证 Token |
| `X-CSRF-Token` | string | 条件 | 非 GET 请求时必需 |

### 2.3 分页参数

所有列表接口支持以下分页参数：

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `page` | number | 1 | 当前页码 |
| `limit` | number | 10 | 每页条数 |
| `sort` | string | - | 排序字段 |
| `order` | string | - | 排序方向 (asc/desc) |

### 2.4 通用响应格式

**成功响应**:
```json
{
  "code": 0,
  "msg": "操作成功",
  "data": {
    "list": [...],
    "total": 100
  }
}
```

**失败响应**:
```json
{
  "code": 400,
  "msg": "参数错误",
  "data": null
}
```

---

## 3. 认证与授权

### 3.1 用户登录

**接口**: `POST /{tableName}/login`

**请求参数**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "token": "jwt_token_here"
  }
}
```

**支持的角色登录**:
- `yonghu` - 普通用户
- `jianshenjiaolian` - 健身教练
- `users` - 管理员用户

### 3.2 用户注册

**接口**: `POST /{tableName}/register`

**请求参数**:
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com",
  "phone": "13800138000"
}
```

### 3.3 重置密码

**接口**: `POST /{tableName}/resetPass`

**请求参数**:
```json
{
  "username": "username",
  "email": "user@example.com"
}
```

### 3.4 退出登录

**接口**: `POST /{tableName}/logout`

### 3.5 获取会话信息

**接口**: `GET /{tableName}/session`

---

## 4. 用户管理 API

### 4.1 获取用户列表

**接口**: `GET /yonghu/list`

**查询参数**:
- `page`: 页码
- `limit`: 每页条数
- `username`: 用户名筛选
- `phone`: 手机号筛选

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "username": "user1",
        "phone": "13800138000",
        "email": "user1@example.com",
        "createTime": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1
  }
}
```

### 4.2 获取用户详情

**接口**: `GET /yonghu/info/{id}`

### 4.3 新增用户

**接口**: `POST /yonghu/save`

**请求参数**:
```json
{
  "username": "newuser",
  "password": "password123",
  "phone": "13800138000",
  "email": "user@example.com"
}
```

### 4.4 更新用户

**接口**: `POST /yonghu/update`

### 4.5 删除用户

**接口**: `POST /yonghu/delete`

**请求参数**:
```json
{
  "ids": [1, 2, 3]
}
```

### 4.6 到期提醒

**接口**: `GET /yonghu/remind/{column}/{type}`

---

## 5. 教练管理 API

### 5.1 获取教练列表

**接口**: `GET /jianshenjiaolian/list`

**查询参数**:
- `page`: 页码
- `limit`: 每页条数
- `name`: 姓名筛选
- `specialty`: 专长筛选

### 5.2 获取教练详情

**接口**: `GET /jianshenjiaolian/info/{id}`

### 5.3 新增教练

**接口**: `POST /jianshenjiaolian/save`

### 5.4 更新教练

**接口**: `POST /jianshenjiaolian/update`

### 5.5 删除教练

**接口**: `POST /jianshenjiaolian/delete`

---

## 6. 课程管理 API

### 6.1 获取课程列表

**接口**: `GET /jianshenkecheng/list`

**查询参数**:
- `page`: 页码
- `limit`: 每页条数
- `name`: 课程名称筛选
- `category`: 分类筛选
- `coachid`: 教练ID筛选

### 6.2 获取课程详情

**接口**: `GET /jianshenkecheng/info/{id}`

### 6.3 智能推荐课程

**接口**: `GET /jianshenkecheng/autoSort`

### 6.4 协同过滤推荐

**接口**: `GET /jianshenkecheng/autoSort2`

**查询参数**:
- `userid`: 用户ID

### 6.5 新增课程

**接口**: `POST /jianshenkecheng/save`

### 6.6 更新课程

**接口**: `POST /jianshenkecheng/update`

### 6.7 删除课程

**接口**: `POST /jianshenkecheng/delete`

---

## 7. 预约管理 API

### 7.1 课程预约

#### 获取预约列表
**接口**: `GET /kechengyuyue/list`

#### 创建预约
**接口**: `POST /kechengyuyue/save`

**请求参数**:
```json
{
  "userid": 1,
  "courseid": 1,
  "coachid": 1,
  "reservationTime": "2024-01-15 10:00:00",
  "remarks": "预约备注"
}
```

#### 批量审核预约
**接口**: `POST /kechengyuyue/shBatch`

**请求参数**:
```json
{
  "ids": [1, 2, 3],
  "status": "approved"
}
```

### 7.2 私教预约

#### 获取私教预约列表
**接口**: `GET /sijiaoyuyue/list`

#### 创建私教预约
**接口**: `POST /sijiaoyuyue/save`

**请求参数**:
```json
{
  "userid": 1,
  "coachid": 1,
  "reservationTime": "2024-01-15 14:00:00",
  "duration": 60,
  "trainingType": "personal training"
}
```

### 7.3 退课管理

#### 获取退课列表
**接口**: `GET /kechengtuike/list`

#### 提交退课申请
**接口**: `POST /kechengtuike/save`

#### 批量审核退课
**接口**: `POST /kechengtuike/shBatch`

---

## 8. 会员卡管理 API

### 8.1 会员卡类型管理

#### 获取会员卡列表
**接口**: `GET /huiyuanka/list`

#### 新增会员卡类型
**接口**: `POST /huiyuanka/save`

**请求参数**:
```json
{
  "name": "金卡会员",
  "price": 1999,
  "duration": 365,
  "benefits": ["无限次课程", "优先预约", "专属教练"]
}
```

### 8.2 会员卡购买

#### 获取购买记录
**接口**: `GET /huiyuankagoumai/list`

#### 购买会员卡
**接口**: `POST /huiyuankagoumai/save`

**请求参数**:
```json
{
  "userid": 1,
  "cardid": 1,
  "paymentMethod": "alipay",
  "amount": 1999
}
```

### 8.3 会员续费

#### 获取续费记录
**接口**: `GET /huiyuanxufei/list`

#### 提交续费申请
**接口**: `POST /huiyuanxufei/save`

---

## 9. 内容管理 API

### 9.1 新闻管理

#### 获取新闻列表
**接口**: `GET /news/list`

#### 获取新闻详情
**接口**: `GET /news/info/{id}`

#### 点赞新闻
**接口**: `POST /news/thumbsup/{id}`

**查询参数**:
- `type`: 1 (点赞) 或 2 (取消点赞)

### 9.2 课程讨论

#### 获取讨论列表
**接口**: `GET /discussjianshenkecheng/list`

**查询参数**:
- `courseid`: 课程ID
- `page`: 页码

#### 发布讨论
**接口**: `POST /discussjianshenkecheng/save`

**请求参数**:
```json
{
  "courseid": 1,
  "userid": 1,
  "content": "课程内容很详细！"
}
```

### 9.3 收藏管理

#### 获取收藏列表
**接口**: `GET /storeup/list`

**查询参数**:
- `userid`: 用户ID
- `sort`: 排序字段
- `order`: 排序方向

#### 添加收藏
**接口**: `POST /storeup/save`

#### 取消收藏
**接口**: `POST /storeup/delete`

---

## 10. 系统管理 API

### 10.1 配置管理

#### 获取配置列表
**接口**: `GET /config/list`

#### 更新配置
**接口**: `POST /config/update`

### 10.2 用户管理（管理员）

#### 获取管理员列表
**接口**: `GET /users/list`

#### 新增管理员
**接口**: `POST /users/save`

### 10.3 操作日志

#### 获取操作日志
**接口**: `GET /operationLog/list`

**查询参数**:
- `page`: 页码
- `limit`: 每页条数
- `username`: 操作用户筛选
- `operation`: 操作类型筛选

#### 导出操作日志
**接口**: `GET /operationLog/export`

### 10.4 到期提醒

#### 获取到期提醒列表
**接口**: `GET /daoqitixing/list`

### 10.5 服务状态

#### 获取服务状态
**接口**: `GET /common/service-status`

---

## 11. 文件上传 API

### 11.1 文件上传

**接口**: `POST /file/upload`

**请求参数** (FormData):
- `file`: 文件对象
- `type`: 文件类型 (可选)

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "url": "/uploads/file.pdf",
    "filename": "file.pdf",
    "size": 1024000
  }
}
```

### 11.2 资产文件上传

**接口**: `POST /file/uploadAsset`

### 11.3 文件下载

**接口**: `GET /file/download`

**查询参数**:
- 文件相关参数

### 11.4 文件删除

**接口**: `POST /file/delete`

---

## 12. 统计分析 API

### 12.1 数据统计接口

所有统计接口遵循以下格式：

#### 数值统计
**接口**: `GET /{module}/value/{x}/{y}`

#### 时间维度统计
**接口**: `GET /{module}/value/{x}/{y}/{timeStatType}`

**时间统计类型**:
- `day`: 按日统计
- `week`: 按周统计
- `month`: 按月统计
- `year`: 按年统计

#### 分组统计
**接口**: `GET /{module}/group/{column}`

#### 计数统计
**接口**: `GET /{module}/count`

### 12.2 常用统计接口

#### 课程预约统计
```javascript
// 按日统计预约金额
GET /kechengyuyue/value/yuyueshijian/kechengjiage/day

// 按课程分组统计预约数
GET /kechengyuyue/group/kechengmingcheng
```

#### 退课统计
```javascript
// 按日统计退课金额
GET /kechengtuike/value/shenqingshijian/kechengjiage/day
```

#### 会员购买统计
```javascript
// 按会员卡类型分组
GET /huiyuankagoumai/group/huiyuankamingcheng
```

---

## 13. 错误处理

### 13.1 HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 423 | 账户被锁定 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用 |

### 13.2 业务状态码

| 状态码 | 说明 |
|--------|------|
| 0 | 操作成功 |
| 400 | 参数错误 |
| 401 | 用户名或密码错误 |
| 403 | 权限不足 |
| 404 | 数据不存在 |
| 409 | 数据冲突（如用户名已存在） |
| 423 | 账户被锁定 |
| 500 | 服务器错误 |

### 13.3 常见错误响应

#### 参数验证错误
```json
{
  "code": 400,
  "msg": "用户名不能为空",
  "data": null
}
```

#### 未授权访问
```json
{
  "code": 401,
  "msg": "请先登录",
  "data": null
}
```

#### 权限不足
```json
{
  "code": 403,
  "msg": "您没有权限执行此操作",
  "data": null
}
```

#### 数据不存在
```json
{
  "code": 404,
  "msg": "用户不存在",
  "data": null
}
```

---

## 14. 附录

### 14.1 API 端点常量

项目中定义了完整的 API 端点常量，位于 `src/constants/apiEndpoints.ts`：

```typescript
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

// 使用示例
const userList = API_ENDPOINTS.YONGHU.LIST // "yonghu/list"
const userDetail = API_ENDPOINTS.YONGHU.INFO(123) // "yonghu/info/123"
```

### 14.2 类型定义

项目使用 TypeScript 进行类型定义，API 相关类型位于 `src/types/api.ts`。

### 14.3 工具函数

项目提供了 API 调用的工具函数，位于 `src/utils/api.ts` 和 `src/utils/http.ts`。

### 14.4 测试覆盖

所有主要 API 端点都有对应的单元测试，测试文件位于 `tests/unit/utils/` 目录。

---

**文档维护者**: 开发团队
**最后更新**: 2025-11-16
**版本**: v1.0
