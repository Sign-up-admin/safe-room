---
title: API
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---
# 后端 API 文档

`springboot1ngh61a2` 由 Spring Boot + MyBatis-Plus 提供 REST API，统一服务于前台站点、后台管理与移动端。本文档覆盖 23 个 Controller 的全部接口，明确鉴权要求、请求/响应结构与典型示例。

> **约定**：除明确标记 `@IgnoreAuth` 的接口外，均需在请求头携带 `Token: <token>`。

---

## 目录

1. [基本约定与响应格式](#基本约定与响应格式)
2. [错误码](#错误码)
3. [通用参数说明](#通用参数说明)
4. [鉴权与账号体系](#鉴权与账号体系)
5. [课程与教练](#课程与教练)
6. [预约与退课](#预约与退课)
7. [会员卡与支付](#会员卡与支付)
8. [内容、互动与收藏](#内容互动与收藏)
9. [配置、提醒与系统工具](#配置提醒与系统工具)
10. [文件与通用接口](#文件与通用接口)
11. [前端需求增强接口](#前端需求增强接口)
12. [附录：统计/报表接口](#附录统计报表接口)

---

## 基本约定与响应格式

| 项目 | 说明 |
| --- | --- |
| Base URL | `http://<host>:8080/springboot1ngh61a2` |
| Content-Type | `application/json;charset=UTF-8`（上传文件除外） |
| 鉴权 | 登录接口返回 `token`，后续以 `Token` 头传递；会话相关信息保存在 `HttpSession` |
| CSRF 保护 | 非 GET 请求需携带 `X-CSRF-Token` 头 |
| 分页参数 | `page`（从 1 开始，默认 1）、`limit`（每页条数，默认 10） |
| 模糊/区间查询 | 统一由 `MPUtil.likeOrEq`、`between` 实现，直接在 QueryString 传递字段即可 |

所有接口返回结构：

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "...": "..."
  }
}
```

- `code != 0` 表示失败，`msg` 包含错误信息。
- 分页接口的 `data` 为 `PageUtils` 结构：`list`, `total`, `page`, `limit`.
- 统计接口直接返回数组/数值。

---

## 错误码

| code | 描述 | 前端处理 |
| --- | --- | --- |
| 0 | 成功 | 正常返回数据 |
| 401 | Token 缺失或失效 | 跳转 `/error/401`，清空 localStorage |
| 403 | 权限不足/账号被锁定 | 跳转 `/error/403`，清空 localStorage |
| 404 | 资源不存在 | 返回错误信息 |
| 500 | 业务/系统异常，`msg` 为原因 | 业务请求不跳转，其他跳转 `/error/500` |

---

## 通用参数说明

- `Long[] ids`：批量删除、审核等接口统一使用 JSON 数组。
- `sfsh`：审核状态，常见取值 `待审核`、`已通过`、`已拒绝`。
- `shhf`：审核回复。
- `ispay`：支付状态，常见 `未支付` / `已支付`。
- `tableName`、`username`、`userId`：由后台登录流程注入 Session，用于数据隔离（教练/会员仅能看自己的数据）。

---

## CRUD 通用模式

前台客户端与后台管理端共用同一套 Controller，但约定的路径存在少量差异。以下表格可用于快速对照：

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表（分页） | GET | `/{module}/list`（公开数据）<br>`/{module}/page`（带 Session 过滤） | `/{module}/list`（统一入口） | 传 `page`、`limit`、`sort`、`order` |
| 多条件筛选 | GET | `/{module}/lists`、`/{module}/query` | 同前台 | 精确匹配或模糊查询 |
| 详情 | GET | `/{module}/detail/{id}` | `/{module}/info/{id}` | 访问详情通常会记录点击量 |
| 新增 | POST | `/{module}/add` | `/{module}/save` | Body 为模块实体 JSON |
| 更新 | POST | `/{module}/update` | 同前台 | 需包含主键 `id` |
| 删除 | POST | `/{module}/delete` | 同前台 | Body 为 `Long[] ids` |
| 点赞/点踩 | POST | `/{module}/thumbsup/{id}?type=1|0` | 同前台 | 仅支持部分内容模块 |
| 智能排序 | GET | `/{module}/autoSort`、`/{module}/autoSort2` | 同前台 | 详见[特殊接口](#特殊接口) |
| 批量审核 | POST | `/{module}/shBatch` | 同前台 | 需传 `ids`、`sfsh`、`shhf` |

### 请求/响应示例

```bash
# 前台：查询课程列表
curl -H "Token: <token>" \
  "http://localhost:8080/springboot1ngh61a2/jianshenkecheng/list?page=1&limit=10"

# 后台：新增课程
curl -X POST -H "Content-Type: application/json" -H "Token: <token>" \
  -d '{ "kechengmingcheng": "TRX 核心", "kechengleixing": "私教", "jiaoliangonghao": "coach001" }' \
  "http://localhost:8080/springboot1ngh61a2/jianshenkecheng/save"

# 前台：提交私教预约
curl -X POST -H "Content-Type: application/json" -H "Token: <token>" \
  -d '{ "yuyuebianhao": "AP20251115001", "jiaoliangonghao": "coach001", "yuyueshijian": "2025-11-20 10:00:00" }' \
  "http://localhost:8080/springboot1ngh61a2/sijiaoyuyue/add"

# 后台：批量审核预约
curl -X POST -H "Content-Type: application/json" -H "Token: <token>" \
  "http://localhost:8080/springboot1ngh61a2/kechengyuyue/shBatch?sfsh=已通过&shhf=确认上课" \
  -d "[11,12,15]"
```

响应示例：

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [],
    "total": 0,
    "page": 1,
    "limit": 10
  }
}
```

### 特殊接口

- `/{module}/autoSort`：按 `clicknum` 或 `clicktime` 降序，常用于“热门”列表。
- `/{module}/autoSort2`：协同过滤，综合收藏/点赞数据。
- `/{module}/shBatch`：批量审核，`ids` 为数组，其余参数走 query string。
- 统计接口：`/{module}/value/*`、`/valueMul/*`、`/group/*`、`/count`，详见[附录](#附录统计报表接口)。
- 资源管理专属：
  - `POST /file/uploadAsset`：ElementPlus 上传组件使用，返回 `filePath`。
  - `POST /assets/delete`：批量删除素材。
  - `POST /assets/batchStatus`：批量上下架/启用素材。

---

## 鉴权与账号体系

### 控制器范围

- `/users`：系统管理员账号
- `/user`：通用用户（可用于扩展）
- `/yonghu`：会员端用户
- `/jianshenjiaolian`：教练账号

### 端点速览

| 模块 | Method | Path | 描述 | 鉴权 |
| --- | --- | --- | --- | --- |
| 登录 | POST | `/users/login` `/user/login` `/yonghu/login` `/jianshenjiaolian/login` | 账号密码登录，返回 token | `@IgnoreAuth` |
| 注册 | POST | `*/register` | 创建对应角色账号 | `@IgnoreAuth` |
| 重置密码 | POST | `*/resetPass` | 将密码重置为 `123456` | `@IgnoreAuth` |
| 退出登录 | GET/POST | `*/logout` | 清除 Session | 需 Token |
| Session 信息 | GET | `*/session` | 返回当前登录用户实体 | 需 Token |
| CRUD | GET/POST | `*/page` `*/list` `*/info/{id}` `*/detail/{id}` `*/save|add` `*/update` `*/delete` | 通用数据管理 | 需 Token（`/list`、`/detail` 多为 `@IgnoreAuth`） |

### 请求示例：管理员登录

```bash
curl -X POST "http://localhost:8080/springboot1ngh61a2/users/login" \
  -d "username=admin&password=admin"
```

响应：

```json
{
  "code": 0,
  "msg": "登录成功",
  "token": "a1b2c3d4",
  "role": "users"
}
```

### 主要字段

- `UsersEntity / UserEntity`：`username`, `password`, `role`, `status`.
- `YonghuEntity`：`yonghuzhanghao`, `mima`, `yonghuxingming`, `touxiang`, `xingbie`, `shengao`, `tizhong`, `huiyuankahao`, `youxiaoqizhi`, `status`.
- `JianshenjiaolianEntity`：`jiaoliangonghao`, `mima`, `jiaolianxingming`, `xingbie`, `nianxian`, `jianjie`, `shoujihaoma`.

---

## 模块 CRUD 速查（前台 / 后台）

| 模块 (Controller) | 实体/用途 | 前台 CRUD | 后台 CRUD | 备注 |
| --- | --- | --- | --- | --- |
| `/yonghu` | 会员档案 | `list/detail/add/update/delete` | `list/info/save/update/delete` | 支持 `/remind/{column}/{type}` 生成到期提醒 |
| `/jianshenjiaolian` | 教练档案 | `list/detail/add/update/delete` | 同前台 | 教练账号可独立登录 |
| `/jianshenkecheng` | 健身课程 | `list/detail/add/update/delete` + `autoSort/autoSort2` | 同前台 | 点击会自增 `clicknum` |
| `/kechengyuyue` | 课程预约 | `list/detail/add/update/delete/shBatch` | 同前台 | 会员/教练自动拼接账号过滤 |
| `/sijiaoyuyue` | 私教预约 | 同上 | 同上 | 教练端自动注入 `jiaoliangonghao` |
| `/kechengtuike` | 退课 | `list/detail/add/update/delete/shBatch` | 同前台 | 审核通过后可触发退款 |
| `/kechengleixing` | 课程类型 | `list/detail/add/update/delete` | 同前台 | 供前台筛选课程 |
| `/jianshenqicai` | 器材库 | `list/detail/add/update/delete` | 同前台 | 支持图文/教学视频字段 |
| `/huiyuanka` | 会员卡定义 | `list/detail/add/update/delete` | 同前台 | `/list` 默认对外开放 |
| `/huiyuankagoumai` | 购卡记录 | `list/detail/add/update/delete` | 同前台 | 列表自动绑定 `yonghuzhanghao` |
| `/huiyuanxufei` | 续费记录 | `list/detail/add/update/delete` | 同前台 | 含 `sfsh` 与 `ispay` |
| `/daoqitixing` | 到期提醒 | `list/detail/add/update/delete` | 同前台 | 常配合 `/remind` 使用 |
| `/news` | 公告资讯 | `list/detail/add/update/delete/thumbsup` | 同前台 | 点赞/点踩 `type=1|0` |
| `/newstype` | 公告分类 | `list/detail/add/update/delete` | 同前台 | 供 `news` 关联 |
| `/discussjianshenkecheng` | 课程讨论 | `list/detail/add/update/delete/autoSort` | 同前台 | `autoSort` 按 `clicktime` |
| `/storeup` | 收藏夹 | `list/detail/add/update/delete/autoSort` | 同前台 | 普通用户仅能看自己的收藏 |
| `/chat` | 留言/客服 | `list/detail/add/update/delete/autoSort` | 同前台 | 自动维护 `isreply` 状态 |
| `/config` | 通用配置 | `list/detail/add/update/delete` | 同前台 | 供首页轮播等读取 |
| `/assets` | 资源中心 | 前台只读（通过 `/assets/list`） | `/assets/list|save|update|delete|batchStatus` | 仅后台维护；上传走 `/file/uploadAsset` |
| `/users` | 后台管理员 | 无前台接口 | `login/register/resetPass/list/info/update/delete` | 与 `role`/菜单控制台联动 |
| `/errorReport` | 前端异常上报 | `/errorReport/add` | `/errorReport/list/save/update/delete` | 在 SPA 错误收集器中使用 |

> **提示**：上表仅列 CRUD 主干，统计接口、审核接口参考[CRUD 通用模式](#crud-通用模式)与各领域章节。

---

## 课程与教练

### `/jianshenkecheng` 健身课程

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表/分页 | GET | `/jianshenkecheng/list`（公开） | `/jianshenkecheng/list`<br>`/jianshenkecheng/page` | `page/list` 均支持 `page`,`limit`,`sort`,`order` |
| 多条件查询 | GET | `/jianshenkecheng/lists` `/jianshenkecheng/query` | 同前台 | 支持精确匹配与模糊查询 |
| 详情 | GET | `/jianshenkecheng/detail/{id}` | `/jianshenkecheng/info/{id}` | 访问详情会自动 `clicknum+1` |
| 新增 | POST | `/jianshenkecheng/add` | `/jianshenkecheng/save` | Body 为 `JianshenkechengEntity` |
| 更新 | POST | `/jianshenkecheng/update` | 同前台 | 需携带 `id` |
| 删除 | POST | `/jianshenkecheng/delete` | 同前台 | Body: `Long[] ids` |
| 智能推荐 | GET | `/jianshenkecheng/autoSort` | 同前台 | 按浏览量排序 |
| 协同推荐 | GET | `/jianshenkecheng/autoSort2` | 同前台 | 基于收藏/点赞 |
| 统计 | GET | `/jianshenkecheng/value/*` `/group/*` `/count` | 同前台 | 详见附录 |

**关键字段**：`kechengmingcheng`, `kechengleixing`, `tupian`, `shangkeshijian`, `shangkedidian`, `kechengjiage`, `kechengjianjie`, `jiaoliangonghao`, `clicknum`.

**分页查询示例**

```bash
curl -H "Token: <token>" \
  "http://localhost:8080/springboot1ngh61a2/jianshenkecheng/page?page=1&limit=10&kechengleixing=瑜伽"
```

响应中的 `data.list` 为课程数组，携带 `total`、`page` 等分页信息。

### `/jianshenjiaolian` 教练档案

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表/分页 | GET | `/jianshenjiaolian/list` | `/jianshenjiaolian/list` `/jianshenjiaolian/page` | 非管理员会自动拼接 `jiaoliangonghao` 条件 |
| 详情 | GET | `/jianshenjiaolian/detail/{id}` | `/jianshenjiaolian/info/{id}` | |
| 新增 | POST | `/jianshenjiaolian/add` | `/jianshenjiaolian/save` | 校验 `jiaoliangonghao` 唯一性 |
| 更新 | POST | `/jianshenjiaolian/update` | 同前台 | |
| 删除 | POST | `/jianshenjiaolian/delete` | 同前台 | |

**关键字段**：`jiaoliangonghao`, `jiaolianxingming`, `xingbie`, `nianxian`, `jianjie`, `shoujihaoma`, `touxiang`, `shanchanglingyu`, `sijiaojiage`.

补充特性：

- 教练可通过 `/jianshenjiaolian/login`、`/register` 独立登录。
- Session 中 `tableName=jianshenjiaolian` 时，列表/预约等模块会自动过滤该教练数据。

**教练筛选与推荐**

前端可通过以下方式实现教练推荐功能：

1. **按条件筛选**：使用 `/jianshenjiaolian/list` 配合查询参数
   ```bash
   # 按性别筛选
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/jianshenjiaolian/list?xingbie=男&page=1&limit=10"
   
   # 按擅长领域模糊查询
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/jianshenjiaolian/list?shanchanglingyu=增肌&page=1&limit=10"
   ```

2. **按价格排序**：使用 `sort` 和 `order` 参数
   ```bash
   # 按私教价格升序
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/jianshenjiaolian/list?sort=sijiaojiage&order=asc&page=1&limit=10"
   ```

3. **推荐逻辑**：前端可根据用户历史预约记录、收藏数据，结合筛选条件实现个性化推荐。

---

## 预约与退课

### `/kechengyuyue` 课程预约

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表/分页 | GET | `/kechengyuyue/list`（自动拼接 `yonghuzhanghao`） | `/kechengyuyue/list` `/kechengyuyue/page` | 管理端根据角色过滤 |
| 详情 | GET | `/kechengyuyue/detail/{id}` | `/kechengyuyue/info/{id}` | |
| 新增 | POST | `/kechengyuyue/add` | `/kechengyuyue/save` | Body: `KechengyuyueEntity` |
| 更新 | POST | `/kechengyuyue/update` | 同前台 | 可修改预约时间、审核状态等 |
| 删除 | POST | `/kechengyuyue/delete` | 同前台 | 支持批量 |
| 批量审核 | POST | `/kechengyuyue/shBatch` | 同前台 | Query：`sfsh`,`shhf`；Body：`ids` |
| 统计/报表 | GET | `/kechengyuyue/value/*` `/group/*` `/count` | 同前台 | |

**字段说明**：`yuyuebianhao`, `kechengmingcheng`, `yuyueshijian`, `jiaoliangonghao`, `yonghuzhanghao`, `yonghuxingming`, `shoujihaoma`, `beizhu`, `sfsh`, `shhf`, `ispay`.

**提交预约示例**

```bash
curl -X POST -H "Content-Type: application/json" -H "Token: <token>" \
  -d '{
    "kechengmingcheng": "燃脂训练营",
    "jiaoliangonghao": "coach001",
    "yonghuzhanghao": "user01",
    "yuyueshijian": "2025-11-16 09:00:00",
    "shoujihaoma": "13800000000"
  }' \
  "http://localhost:8080/springboot1ngh61a2/kechengyuyue/add"
```

### `/sijiaoyuyue` 私教预约

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表/分页 | GET | `/sijiaoyuyue/list` | `/sijiaoyuyue/list` `/sijiaoyuyue/page` | 教练登录后会自动过滤 `jiaoliangonghao` |
| 详情 | GET | `/sijiaoyuyue/detail/{id}` | `/sijiaoyuyue/info/{id}` | |
| 新增 | POST | `/sijiaoyuyue/add` | `/sijiaoyuyue/save` | |
| 更新 | POST | `/sijiaoyuyue/update` | 同前台 | 用于调整 `sfsh` 与 `shhf` |
| 删除 | POST | `/sijiaoyuyue/delete` | 同前台 | |
| 批量审核 | POST | `/sijiaoyuyue/shBatch` | 同前台 | 接口语义与课程预约一致 |

**字段说明**：`yuyuebianhao`, `jiaoliangonghao`, `jiaolianxingming`, `yuyueshijian`, `sijiaojiage`, `yonghuzhanghao`, `huiyuankahao`, `yonghuxingming`, `shoujihaoma`, `beizhu`, `sfsh`, `shhf`, `ispay`.

**提交私教预约示例**

```bash
curl -X POST -H "Content-Type: application/json" -H "Token: <token>" \
  -d '{
    "jiaoliangonghao": "coach001",
    "jiaolianxingming": "张教练",
    "yuyueshijian": "2025-11-20 10:00:00",
    "sijiaojiage": 200.00,
    "yonghuzhanghao": "user01",
    "yonghuxingming": "李四",
    "shoujihaoma": "13800000000",
    "beizhu": "增肌训练，45分钟"
  }' \
  "http://localhost:8080/springboot1ngh61a2/sijiaoyuyue/add"
```

### `/kechengtuike` 课程退课

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表/分页 | GET | `/kechengtuike/list` | `/kechengtuike/list` `/kechengtuike/page` | 会员端自动注入 `yonghuzhanghao` |
| 详情 | GET | `/kechengtuike/detail/{id}` | `/kechengtuike/info/{id}` | |
| 新增 | POST | `/kechengtuike/add` | `/kechengtuike/save` | |
| 更新 | POST | `/kechengtuike/update` | 同前台 | 审核退课申请 |
| 删除 | POST | `/kechengtuike/delete` | 同前台 | |
| 批量审核 | POST | `/kechengtuike/shBatch` | 同前台 | |
| 统计 | GET | `/kechengtuike/value/*` `/group/*` `/count` | 同前台 | |

字段：`tuikebianhao`, `kechengmingcheng`, `tuikeyuanyin`, `sfsh`, `shhf`, `ispay`。

---

## 会员卡与支付

 会员卡与支付

### 卡定义：`/huiyuanka`

| 功能 | Method | Path | 说明 |
| --- | --- | --- | --- |
| 列表/详情 | GET | `/page` `/list` `/info/{id}` `/detail/{id}` | `/list` 为 `@IgnoreAuth` |
| 维护 | POST | `/save` `/add` `/update` `/delete` | |

**字段**：`huiyuankamingcheng`, `tupian`, `jiage`, `youxiaoqi`, `huiyuantequan`, `miaoshu`.

### 购买记录：`/huiyuankagoumai`

- `page/list` 会在会员端自动注入 `yonghuzhanghao`。
- 新增接口用于生成购买记录，支持统计：`/value`, `/group`, `/count`.
- 典型字段：`goumaibianhao`, `huiyuankamingcheng`, `jiage`, `goumaishijian`, `ispay`.

### 续费记录：`/huiyuanxufei`

- 接口结构与 `huiyuankagoumai` 相同，字段包括 `xufeibianhao`, `huiyuankamingcheng`, `jiage`, `xufeishijian`, `sfsh`.

### 会员主档：`/yonghu`

- 参考鉴权章节。
- `save/add/update` 会校验账号唯一性。
- `/remind/{columnName}/{type}` 可对日期字段（如 `youxiaoqizhi`）生成到期提醒数量。

**会员权益字段说明**

会员卡相关字段：
- `huiyuankahao`：会员卡号
- `youxiaoqizhi`：有效期至（日期格式：`yyyy-MM-dd`）
- `huiyuankamingcheng`：会员卡名称（通过关联 `/huiyuanka` 表获取）

**会员权益查询示例**

```bash
# 查询会员详情（包含会员卡信息）
curl -H "Token: <token>" \
  "http://localhost:8080/springboot1ngh61a2/yonghu/detail/{id}"

# 查询会员卡定义（获取权益详情）
curl -H "Token: <token>" \
  "http://localhost:8080/springboot1ngh61a2/huiyuanka/list"
```

**会员卡购买流程接口调用顺序**

1. 查询会员卡列表：`GET /huiyuanka/list`
2. 查询会员卡详情：`GET /huiyuanka/detail/{id}`
3. 创建购买记录：`POST /huiyuankagoumai/add`
4. 查询支付状态：`GET /huiyuankagoumai/detail/{id}`（通过 `ispay` 字段判断）
5. 更新会员信息：`POST /yonghu/update`（更新 `huiyuankahao` 和 `youxiaoqizhi`）

---

## 内容、互动与收藏

### `/news` 公告信息 & `/newstype`

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表/分页 | GET | `/news/list` | `/news/list` `/news/page` | `list` 为公开接口 |
| 详情 | GET | `/news/detail/{id}` | `/news/info/{id}` | 自动记录 `clicktime`、`clicknum` |
| 新增 | POST | `/news/add` | `/news/save` | |
| 更新 | POST | `/news/update` | 同前台 | |
| 删除 | POST | `/news/delete` | 同前台 | |
| 点赞/点踩 | POST | `/news/thumbsup/{id}?type=1|0` | 同前台 | `type=1` 赞，`0` 踩 |

`/newstype`（公告分类）支持相同的 `list/detail/add/save/update/delete` 组合，用于维护分类字典。

**`/newstype` 接口速记**

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表/分页 | GET | `/newstype/list` | `/newstype/list` `/page` | |
| 详情 | GET | `/newstype/detail/{id}` | `/newstype/info/{id}` | |
| 新增 | POST | `/newstype/add` | `/newstype/save` | |
| 更新 | POST | `/newstype/update` | 同前台 | |
| 删除 | POST | `/newstype/delete` | 同前台 | |

### `/discussjianshenkecheng` 课程讨论

- 标准 CRUD + `/autoSort`（按 `clicktime` 降序）。
- 字段：`refid`（关联课程ID）, `userid`（用户ID）, `nickname`（昵称）, `content`（讨论内容）, `reply`（回复内容）, `clicktime`（发布时间）, `sfsh`（审核状态）.

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表/分页 | GET | `/discussjianshenkecheng/list` | `/discussjianshenkecheng/list` `/page` | 支持按 `refid` 筛选特定课程的讨论 |
| 详情 | GET | `/discussjianshenkecheng/detail/{id}` | `/discussjianshenkecheng/info/{id}` | |
| 新增 | POST | `/discussjianshenkecheng/add` | `/discussjianshenkecheng/save` | 提交后需审核（`sfsh=待审核`） |
| 更新 | POST | `/discussjianshenkecheng/update` | 同前台 | 可用于回复（更新 `reply` 字段） |
| 删除 | POST | `/discussjianshenkecheng/delete` | 同前台 | |
| 热门排序 | GET | `/discussjianshenkecheng/autoSort` | 同前台 | 按 `clicktime` 降序 |

**发帖示例**

```bash
curl -X POST -H "Content-Type: application/json" -H "Token: <token>" \
  -d '{
    "refid": 123,
    "userid": 1,
    "nickname": "健身达人",
    "content": "这个课程效果怎么样？",
    "sfsh": "待审核"
  }' \
  "http://localhost:8080/springboot1ngh61a2/discussjianshenkecheng/add"
```

**回复示例**

```bash
curl -X POST -H "Content-Type: application/json" -H "Token: <token>" \
  -d '{
    "id": 456,
    "reply": "效果很好，推荐！",
    "sfsh": "已通过"
  }' \
  "http://localhost:8080/springboot1ngh61a2/discussjianshenkecheng/update"
```

**按课程筛选讨论**

```bash
# 查询特定课程的所有讨论
curl -H "Token: <token>" \
  "http://localhost:8080/springboot1ngh61a2/discussjianshenkecheng/list?refid=123&sfsh=已通过"
```

### `/storeup` 收藏夹

- 管理收藏状态，常见 `type=1` 表示收藏。
- 管理端 `/page` 会根据角色控制可见数据，普通用户仅能看到自己的收藏。
- `/autoSort` 供前台按点击时间降序展示。

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表/分页 | GET | `/storeup/list` | `/storeup/list` `/page` | 会员端自动注入 `userid` |
| 详情 | GET | `/storeup/detail/{id}` | `/storeup/info/{id}` | |
| 新增 | POST | `/storeup/add` | `/storeup/save` | `type=1` 表示收藏 |
| 更新 | POST | `/storeup/update` | 同前台 | |
| 删除 | POST | `/storeup/delete` | 同前台 | 支持批量 |
| 热门排序 | GET | `/storeup/autoSort` | 同前台 | 按 `clicktime` |

**字段说明**：`refid`（关联资源ID）, `tablename`（资源表名，如 `jianshenkecheng`、`jianshenjiaolian`、`news`）, `name`（资源名称）, `picture`（资源图片）, `type`（类型，1=收藏）, `inteltype`（分类）, `userid`（用户ID）, `clicktime`（点击时间）.

**批量删除收藏示例**

```bash
curl -X POST -H "Content-Type: application/json" -H "Token: <token>" \
  -d "[101,102,103]" \
  "http://localhost:8080/springboot1ngh61a2/storeup/delete"
```

**收藏推荐实现**

前端可根据收藏数据实现推荐功能：

1. 查询用户收藏列表：`GET /storeup/list?userid={userId}`
2. 分析收藏类型分布（通过 `tablename` 和 `inteltype` 字段）
3. 根据收藏偏好，调用对应模块的推荐接口：
   - 课程推荐：`GET /jianshenkecheng/autoSort2`（协同过滤）
   - 教练推荐：`GET /jianshenjiaolian/list`（配合筛选条件）
   - 新闻推荐：`GET /news/list`（按分类筛选）

### `/chat` 留言反馈

- `/page` `/list`：非管理员自动注入 `userid`。
- `/save` `/add`：当存在 `ask` 或 `reply` 字段时自动调整 `isreply` 状态、维护未回复记录。
- `/autoSort`：按 `clicktime` 排序。

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表/分页 | GET | `/chat/list` | `/chat/list` `/page` | 非管理员自动注入 `userid` |
| 详情 | GET | `/chat/detail/{id}` | `/chat/info/{id}` | |
| 新增 | POST | `/chat/add` | `/chat/save` | 根据 `ask/reply` 自动更新 `isreply` |
| 更新 | POST | `/chat/update` | 同前台 | |
| 删除 | POST | `/chat/delete` | 同前台 | |
| 热门排序 | GET | `/chat/autoSort` | 同前台 | 按 `clicktime` |

---

## 配置、提醒与系统工具

### `/config`

- 管理系统配置键值，接口包括 `page/list/info/detail/save/add/update/delete`.

**接口速记**

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表/分页 | GET | `/config/list` | `/config/list` `/config/page` | 用于首页轮播、文案配置 |
| 详情 | GET | `/config/detail/{id}` | `/config/info/{id}` | |
| 新增 | POST | `/config/add` | `/config/save` | |
| 更新 | POST | `/config/update` | 同前台 | 常用于更新 banner、联系方式 |
| 删除 | POST | `/config/delete` | 同前台 | |

### `/daoqitixing`

- 用于到期提醒任务，拥有标准 CRUD 与统计接口。

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表/分页 | GET | `/daoqitixing/list` | `/daoqitixing/list` `/page` | 自动注入登录用户，便于查看自己的提醒 |
| 详情 | GET | `/daoqitixing/detail/{id}` | `/daoqitixing/info/{id}` | |
| 新增 | POST | `/daoqitixing/add` | `/daoqitixing/save` | |
| 更新 | POST | `/daoqitixing/update` | 同前台 | 可搭配 `/common/remind` |
| 删除 | POST | `/daoqitixing/delete` | 同前台 | |
| 统计 | GET | `/daoqitixing/value/*` `/group/*` `/count` | 同前台 | |

### `/errorReport`

- 收集前端或用户的异常报告，标准 CRUD。

### `/kechengleixing`、`/jianshenqicai`

- 课程类型与健身器材管理，均提供 `page/list/info/detail/save/add/update/delete`。

| 模块 | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- |
| `/kechengleixing` | `/kechengleixing/list` `/detail/{id}` `/add` | `/kechengleixing/list` `/info/{id}` `/save` | 仅少量字段：`kechengleixing`，供课程筛选 |
| `/jianshenqicai` | `/jianshenqicai/list` `/detail/{id}` `/add` | `/jianshenqicai/list` `/info/{id}` `/save` | 字段含 `qicaimingcheng`, `tupian`, `shiyongfangfa`, `jiaoxueshipin` |

### `/assets` 资源管理

| 操作 | Method | 前台路径 | 后台路径 | 说明 |
| --- | --- | --- | --- | --- |
| 列表/分页 | GET | `/assets/list`（只读） | `/assets/list` `/assets/page` | 支持关键词、模块、使用场景过滤 |
| 新增 | POST | —— | `/assets/save` | 仅后台允许新增 |
| 更新 | POST | —— | `/assets/update` | 可批量调整标签、状态 |
| 删除 | POST | —— | `/assets/delete` | Body: `Long[] ids` |
| 批量状态 | POST | —— | `/assets/batchStatus` | 批量启停用资源 |
| 上传 | POST | `/file/uploadAsset` | `/file/uploadAsset` | FormData 字段 `file`，返回 `filePath` |

> 门户展示素材直接读取 `/assets/list` 或读取静态 `config` 内容。

---

## 文件与通用接口

### `/file` 文件上传下载

#### MinIO配置说明

系统支持两种存储方式：
- **本地文件系统**：默认方式，文件存储在服务器本地
- **MinIO对象存储**：通过配置 `minio.enabled=true` 启用

MinIO配置项（`application.yml`）：
```yaml
minio:
  enabled: false  # 是否启用MinIO
  endpoint: http://localhost:9000  # MinIO服务地址
  access-key: minioadmin  # 访问密钥
  secret-key: minioadmin  # 密钥
  bucket-name: fitness-gym  # 存储桶名称
  secure: false  # 是否使用HTTPS
  presigned-url-expiry: 3600  # 预签名URL过期时间（秒）
```

#### 基础文件接口

| 功能 | Method | Path | 说明 |
| --- | --- | --- | --- |
| 上传 | POST | `/file/upload` | `@IgnoreAuth`；FormData 字段名为 `file`，可带 `type`；支持MinIO和本地存储 |
| 下载 | GET | `/file/download?fileName=xxx.jpg` | `@IgnoreAuth`；直接返回二进制；自动识别MinIO/本地存储 |
| 删除 | POST | `/file/delete?fileName=xxx.jpg` | `@IgnoreAuth`；删除指定文件 |

上传成功返回：

```json
{
  "code": 0,
  "msg": "success",
  "file": "1718641112000.png"
}
```

#### 视频在线播放接口

| 功能 | Method | Path | 说明 |
| --- | --- | --- | --- |
| 视频流式播放 | GET | `/file/video/{fileName}` | `@IgnoreAuth`；支持HTTP Range请求（206 Partial Content），支持进度控制 |
| 视频信息 | GET | `/file/video/info/{fileName}` | `@IgnoreAuth`；获取视频元数据（大小、格式等） |

**视频播放接口说明**：
- 支持HTTP Range请求，浏览器视频播放器可自动处理进度控制
- 支持格式：mp4, webm, mov, mkv, avi, flv
- 自动识别MinIO和本地文件系统

**请求示例**：
```bash
# 完整视频请求
curl "http://localhost:8080/springboot1ngh61a2/file/video/sample.mp4"

# Range请求（支持进度控制）
curl -H "Range: bytes=0-1023" \
  "http://localhost:8080/springboot1ngh61a2/file/video/sample.mp4"
```

**响应示例（Range请求）**：
- HTTP状态码：206 Partial Content
- Headers：
  - `Content-Range: bytes 0-1023/1048576`
  - `Accept-Ranges: bytes`
  - `Content-Type: video/mp4`

**获取视频信息响应**：
```json
{
  "code": 0,
  "msg": "success",
  "fileName": "sample.mp4",
  "fileSize": 1048576,
  "contentType": "video/mp4",
  "format": "mp4"
}
```

#### 文件管理接口

| 功能 | Method | Path | 说明 |
| --- | --- | --- | --- |
| 文件列表 | GET | `/file/list?prefix=upload/&page=1&limit=20` | `@IgnoreAuth`；列出MinIO中的文件（需启用MinIO）；支持前缀过滤和分页 |
| 文件预览URL | GET | `/file/preview/{fileName}` | `@IgnoreAuth`；获取文件预览/访问URL |
| 预签名URL | GET | `/file/presigned/{fileName}?expiry=3600` | `@IgnoreAuth`；生成MinIO预签名URL（临时访问，需启用MinIO） |

**文件列表响应**：
```json
{
  "code": 0,
  "msg": "success",
  "list": ["upload/image1.jpg", "upload/video1.mp4"],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

**预览URL响应**：
```json
{
  "code": 0,
  "msg": "success",
  "url": "http://localhost:9000/fitness-gym/upload/image1.jpg?X-Amz-Algorithm=...",
  "fileName": "image1.jpg"
}
```

**预签名URL响应**：
```json
{
  "code": 0,
  "msg": "success",
  "url": "http://localhost:9000/fitness-gym/upload/video1.mp4?X-Amz-Algorithm=...",
  "expiry": 3600
}
```

#### 素材上传接口（增强版）

| 功能 | Method | Path | 说明 |
| --- | --- | --- | --- |
| 素材上传 | POST | `/file/uploadAsset` | FormData字段：`file`（必需），`assetName`, `assetType`, `module`, `usage`, `version`, `tags`, `category`, `status`, `description`, `uploadUser`（可选） |

**说明**：
- 自动识别文件类型（图片/视频/图标/模型/Lottie）
- 图片自动读取尺寸信息
- 支持MinIO和本地存储
- 文件大小限制：图片≤3MB，视频≤60MB，其他≤30MB

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "file": "upload/assets/course/image/course-hero_v1_1234567890.jpg",
  "assetId": 123,
  "width": 1920,
  "height": 1080,
  "dimensions": "1920x1080"
}
```

### `/common` 通用数据接口

| Path | 功能 | 说明 |
| --- | --- | --- |
| `/option/{table}/{column}` | 级联下拉 | 支持附加 `conditionColumn`, `conditionValue` |
| `/follow/{table}/{column}` | 根据列值取单条记录 | 自动映射到对应实体 |
| `/sh/{table}` | 更新 `sfsh` 状态 | Body 需携带 `id`, `sfsh`, `shhf` |
| `/remind/{table}/{column}/{type}` | 提醒数量 | `type=2` 代表日期范围，支持 `remindstart`、`remindend` 天数 |
| `/cal/{table}/{column}` | 单列求和/聚合 | 返回 `{ "data": { "sum": 123 } }` |
| `/group/{table}/{column}` | 分组统计 | |
| `/value/{table}/{x}/{y}` | 按值统计 | |
| `/value/{table}/{x}/{y}/{timeStatType}` | 时间维度统计 | `timeStatType` 支持 `day|week|month` |

所有接口默认 `@IgnoreAuth`，便于前台获取通用数据。

---

## 前端需求增强接口

> **说明**：本章节补充前端需求文档（2025-11-15版本）中明确提到的特殊接口使用方式和最佳实践。相关需求文档参考：`docs/requirements\requirements\FRONTEND_REQUIREMENTS_INDEX.md`

### 预约冲突检测

**需求来源**：`COURSE_BOOKING_REQUIREMENTS.md`、`PRIVATE_COACH_BOOKING_REQUIREMENTS.md`

前端通过组合式API `useBookingConflict.ts` 实现冲突检测，核心逻辑如下：

1. **获取用户预约列表**：同时查询课程预约和私教预约
   ```bash
   # 查询课程预约
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/kechengyuyue/list?yonghuzhanghao={userAccount}&page=1&limit=200"
   
   # 查询私教预约
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/sijiaoyuyue/list?yonghuzhanghao={userAccount}&page=1&limit=200"
   ```

2. **冲突检测逻辑**：
   - 前端解析预约时间字段 `yuyueshijian`（格式：`yyyy-MM-dd HH:mm:ss`）
   - 提取日期和时间段（如 `09:00`、`14:00`、`19:00`）
   - 构建时间段使用映射表，检查新预约时间段是否已被占用
   - 如果同一时间段已有预约（课程或私教），则标记为冲突

3. **冲突详情**：返回冲突的预约信息，包括课程名称、教练姓名等

**最佳实践**：
- 在用户选择时间段前，预先加载用户的预约列表
- 使用前端缓存减少重复请求
- 提交预约前再次检查冲突，防止并发问题

### 时间段可用性查询

**需求来源**：`COURSE_BOOKING_REQUIREMENTS.md`（日历视图、剩余名额）

前端通过以下方式实现时间段可用性查询：

1. **查询课程预约统计**：
   ```bash
   # 按时间段分组统计预约数量
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/kechengyuyue/group/yuyueshijian"
   ```

2. **计算剩余名额**：
   - 前端定义每个时间段的容量（如默认6个名额）
   - 统计该时间段的已预约数量
   - 剩余名额 = 总容量 - 已预约数量

3. **状态判断**：
   - `available`：剩余名额 > 3
   - `low`：剩余名额 ≤ 3 且 > 0
   - `disabled`：剩余名额 = 0
   - `conflict`：用户在该时间段已有预约

**示例实现**：
```javascript
// 前端伪代码
const capacity = 6; // 时间段容量
const bookings = await fetchBookingsByTimeSlot(date, time);
const used = bookings.length;
const remaining = Math.max(capacity - used, 0);
const status = remaining > 3 ? 'available' : remaining > 0 ? 'low' : 'disabled';
```

### 支付状态轮询

**需求来源**：`requirements\requirements\PAYMENT_REQUIREMENTS.md`（支付状态监控、轮询）

前端通过轮询方式查询支付状态，实现方式如下：

1. **查询支付状态**：
   ```bash
   # 查询订单详情（通过 ispay 字段判断支付状态）
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/{tableName}/detail/{recordId}"
   ```

2. **支付状态字段说明**：
   - `ispay = "未支付"`：待支付
   - `ispay = "已支付"`：支付成功
   - `ispay = "支付失败"`：支付失败

3. **轮询最佳实践**：
   - 轮询间隔：2秒
   - 最大轮询次数：30次（约1分钟）
   - 支付成功后立即停止轮询
   - 页面卸载时清理轮询定时器

**前端实现示例**（参考 `usePaymentStatus.ts`）：
```typescript
// 轮询函数
async function fetchPaymentStatus() {
  const response = await http.get(`/${tableName}/detail/${recordId}`);
  const state = response.data.data?.ispay;
  if (state === '已支付') return 'success';
  if (state === '支付失败') return 'failed';
  return 'pending';
}

// 启动轮询
const interval = setInterval(async () => {
  const status = await fetchPaymentStatus();
  if (status !== 'pending') {
    clearInterval(interval);
    // 处理支付结果
  }
}, 2000);
```

### 私教价格计算

**需求来源**：`PRIVATE_COACH_BOOKING_REQUIREMENTS.md`（套餐、时长、地点影响价格）

私教价格计算逻辑：

1. **基础价格**：从教练信息中获取 `sijiaojiage`（单位：元/45分钟）

2. **价格影响因素**：
   - **套餐次数**：4次、8次、12次（次数越多，单次价格越低）
   - **时长**：45分钟、60分钟、90分钟（时长越长，价格越高）
   - **地点**：门店/上门（上门可能加收服务费）

3. **计算方式**（前端实现）：
   ```javascript
   // 前端伪代码
   const basePrice = coach.sijiaojiage; // 基础价格（45分钟）
   const packageDiscount = {
     4: 1.0,    // 无折扣
     8: 0.9,    // 9折
     12: 0.85   // 8.5折
   };
   const durationMultiplier = {
     45: 1.0,
     60: 1.3,
     90: 1.8
   };
   const locationFee = location === '上门' ? 50 : 0;
   
   const totalPrice = (basePrice * packageDiscount[packageCount] * durationMultiplier[duration] + locationFee) * packageCount;
   ```

4. **提交预约时**：将计算后的总价写入 `sijiaojiage` 字段

### 训练数据统计

**需求来源**：`USER_CENTER_REQUIREMENTS.md`（训练数据面板、图表数据）

获取用户训练统计数据的方式：

1. **预约次数统计**：
   ```bash
   # 统计用户课程预约总数
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/kechengyuyue/count?yonghuzhanghao={userAccount}"
   
   # 统计用户私教预约总数
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/sijiaoyuyue/count?yonghuzhanghao={userAccount}"
   ```

2. **按时间维度统计**：
   ```bash
   # 按天统计预约数量
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/kechengyuyue/value/yuyueshijian/yuyuebianhao/day?yonghuzhanghao={userAccount}"
   ```

3. **获取用户预约列表**（用于计算训练时长等）：
   ```bash
   # 查询已完成的预约（sfsh=已通过）
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/kechengyuyue/list?yonghuzhanghao={userAccount}&sfsh=已通过&page=1&limit=100"
   ```

4. **前端数据处理**：
   - 统计近4周的预约次数
   - 计算总训练时长（根据课程时长或私教时长）
   - 生成图表数据（折线图、柱状图）

### 用户预约管理

**需求来源**：`USER_CENTER_REQUIREMENTS.md`（预约管理、快捷操作）

获取用户预约列表和状态：

1. **课程预约列表**：
   ```bash
   # 查询用户的课程预约（自动过滤）
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/kechengyuyue/list?page=1&limit=10&sort=yuyueshijian&order=desc"
   ```

2. **私教预约列表**：
   ```bash
   # 查询用户的私教预约
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/sijiaoyuyue/list?page=1&limit=10&sort=yuyueshijian&order=desc"
   ```

3. **预约状态筛选**：
   - `sfsh=待审核`：待审核的预约
   - `sfsh=已通过`：已确认的预约
   - `sfsh=已拒绝`：被拒绝的预约

4. **快捷操作**：
   - **取消预约**：`POST /kechengyuyue/delete` 或 `POST /sijiaoyuyue/delete`
   - **改期**：`POST /kechengyuyue/update` 修改 `yuyueshijian` 字段
   - **查看详情**：`GET /kechengyuyue/detail/{id}` 或 `GET /sijiaoyuyue/detail/{id}`

### 新闻标签筛选

**需求来源**：`requirements\requirements\NEWS_LIST_REQUIREMENTS.md`（分类筛选、标签）

新闻筛选和标签功能：

1. **按分类筛选**：
   ```bash
   # 查询新闻分类列表
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/newstype/list"
   
   # 按分类筛选新闻
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/news/list?newstype={categoryId}&page=1&limit=10"
   ```

2. **按关键词搜索**：
   ```bash
   # 标题模糊查询
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/news/list?title={keyword}&page=1&limit=10"
   ```

3. **标签实现**：
   - 前端可通过 `newstype` 字段实现标签筛选
   - 或使用 `title`、`content` 字段的关键词匹配实现标签功能

4. **排序**：
   ```bash
   # 按时间排序
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/news/list?sort=addtime&order=desc&page=1&limit=10"
   
   # 按阅读量排序
   curl -H "Token: <token>" \
     "http://localhost:8080/springboot1ngh61a2/news/list?sort=clicknum&order=desc&page=1&limit=10"
   ```

---

## 附录：统计/报表接口

下列模块都额外提供 `/value`, `/valueMul`, `/value/*/{timeStatType}`, `/group/{columnName}`, `/count` 等统计接口，并保持一致的参数语义：

- `/jianshenkecheng`
- `/kechengyuyue`
- `/sijiaoyuyue`
- `/kechengtuike`
- `/huiyuankagoumai`
- `/huiyuanxufei`
- `/yonghu` 与 `/user`

### 示例：按天统计会员卡购买金额

```bash
curl -H "Token: <token>" \
  "http://localhost:8080/springboot1ngh61a2/huiyuankagoumai/value/goumaishijian/jiage/day"
```

响应：

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    { "goumaishijian": "2025-11-10", "jiage": 1280.0 },
    { "goumaishijian": "2025-11-11", "jiage": 980.0 }
  ]
}
```

---

## 版本与测试

- 所有接口均在 `springboot1ngh61a2/src/test/java/com/controller/*` 通过 MockMvc 覆盖，提交前请运行 `mvn test`.
- 新增或调整接口需同步更新：
  - Controller / Service / Mapper
  - 对应测试
  - `docs/API.md`
  - 前端 `front`、`admin` 项目的 API 封装（如 `src/constants/apiEndpoints.js`）

如需更多字段细节，请参考 `springboot1ngh61a2/src/main/java/com/entity` 与对应 `mapper/*.xml`。