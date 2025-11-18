# 健身房管理系统数据库设计文档

## 概述

本文档描述了健身房管理系统的完整数据库设计，包括所有数据表的结构、字段定义、索引和约束。

**数据库版本**: MySQL 5.7.31 / PostgreSQL
**字符集**: utf8mb4 / utf8
**更新日期**: 2024-11-17

## 数据库表清单

| 序号 | 表名 | 中文名 | 说明 |
|------|------|--------|------|
| 1 | chat | 留言反馈 | 用户与管理员的聊天记录 |
| 2 | config | 配置文件 | 系统配置参数 |
| 3 | daoqitixing | 到期提醒 | 会员卡到期提醒 |
| 4 | discussjianshenkecheng | 健身课程评论 | 课程评论表 |
| 5 | huiyuanka | 会员卡 | 会员卡信息 |
| 6 | huiyuankagoumai | 会员卡购买 | 会员卡购买记录 |
| 7 | huiyuanxufei | 会员续费 | 会员续费记录 |
| 8 | jianshenjiaolian | 健身教练 | 教练信息 |
| 9 | jianshenkecheng | 健身课程 | 课程信息 |
| 10 | jianshenqicai | 健身器材 | 器材信息 |
| 11 | kechengleixing | 课程类型 | 课程分类 |
| 12 | kechengtuike | 课程退课 | 退课申请 |
| 13 | kechengyuyue | 课程预约 | 课程预约记录 |
| 14 | news | 公告信息 | 系统公告 |
| 15 | newstype | 公告分类 | 公告分类 |
| 16 | sijiaoyuyue | 私教预约 | 私人教练预约 |
| 17 | storeup | 收藏表 | 用户收藏记录 |
| 18 | token | Token表 | 用户认证令牌 |
| 19 | users | 用户表 | 管理员用户 |
| 20 | yonghu | 用户 | 普通用户 |
| 21 | legal_terms | 法律条款 | 法律条款文档 |
| 22 | operation_log | 操作日志 | 系统操作日志 |
| 23 | messages | 站内消息 | 用户消息通知 |

---

## 详细表结构

### 1. chat (留言反馈)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| userid | bigint(20) | NO | - | 用户id |
| adminid | bigint(20) | YES | NULL | 管理员id |
| ask | longtext | YES | NULL | 提问 |
| reply | longtext | YES | NULL | 回复 |
| isreply | int(11) | YES | NULL | 是否回复 |

**索引**: PRIMARY KEY (id)

### 2. config (配置文件)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| name | varchar(100) | NO | - | 配置参数名称 |
| value | varchar(100) | YES | NULL | 配置参数值 |
| url | varchar(500) | YES | NULL | url |

**索引**: PRIMARY KEY (id)

### 3. daoqitixing (到期提醒)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| yonghuzhanghao | varchar(200) | YES | NULL | 用户账号 |
| yonghuxingming | varchar(200) | YES | NULL | 用户姓名 |
| touxiang | longtext | YES | NULL | 头像 |
| huiyuankahao | varchar(200) | YES | NULL | 会员卡号 |
| youxiaoqizhi | date | YES | NULL | 有效期至 |
| tixingshijian | datetime | YES | NULL | 提醒时间 |
| beizhu | varchar(200) | YES | NULL | 备注 |

**索引**: PRIMARY KEY (id)

### 4. discussjianshenkecheng (健身课程评论表)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| refid | bigint(20) | NO | - | 关联表id |
| userid | bigint(20) | NO | - | 用户id |
| avatarurl | longtext | YES | NULL | 头像 |
| nickname | varchar(200) | YES | NULL | 用户名 |
| content | longtext | NO | - | 评论内容 |
| reply | longtext | YES | NULL | 回复内容 |

**索引**: PRIMARY KEY (id)

### 5. huiyuanka (会员卡)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| huiyuankamingcheng | varchar(200) | NO | - | 会员卡名称 |
| tupian | longtext | YES | NULL | 图片 |
| youxiaoqi | varchar(200) | NO | - | 有效期 |
| jiage | int(11) | YES | NULL | 价格 |
| shiyongshuoming | longtext | YES | NULL | 使用说明 |
| huiyuankaxiangqing | longtext | YES | NULL | 会员卡详情 |

**索引**: PRIMARY KEY (id)

### 6. huiyuankagoumai (会员卡购买)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| huiyuankahao | varchar(200) | YES | NULL | 会员卡号 |
| huiyuankamingcheng | varchar(200) | YES | NULL | 会员卡名称 |
| tupian | longtext | YES | NULL | 图片 |
| youxiaoqi | varchar(200) | YES | NULL | 有效期 |
| jiage | int(11) | YES | NULL | 价格 |
| goumairiqi | date | YES | NULL | 购买日期 |
| yonghuzhanghao | varchar(200) | YES | NULL | 用户账号 |
| yonghuxingming | varchar(200) | YES | NULL | 用户姓名 |
| shoujihaoma | varchar(200) | YES | NULL | 手机号码 |
| ispay | varchar(200) | YES | '未支付' | 是否支付 |

**索引**: PRIMARY KEY (id), UNIQUE KEY (huiyuankahao)

### 7. huiyuanxufei (会员续费)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| yonghuzhanghao | varchar(200) | YES | NULL | 用户账号 |
| yonghuxingming | varchar(200) | YES | NULL | 用户姓名 |
| touxiang | longtext | YES | NULL | 头像 |
| jiaofeibianhao | varchar(200) | YES | NULL | 缴费编号 |
| huiyuankamingcheng | varchar(200) | NO | - | 会员卡名称 |
| youxiaoqi | varchar(200) | YES | NULL | 有效期 |
| jiage | double | YES | NULL | 价格 |
| xufeishijian | datetime | YES | NULL | 续费时间 |
| ispay | varchar(200) | YES | '未支付' | 是否支付 |

**索引**: PRIMARY KEY (id), UNIQUE KEY (jiaofeibianhao)

### 8. jianshenjiaolian (健身教练)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| jiaoliangonghao | varchar(200) | NO | - | 教练工号 |
| mima | varchar(200) | NO | - | 密码 |
| jiaolianxingming | varchar(200) | NO | - | 教练姓名 |
| zhaopian | longtext | YES | NULL | 照片 |
| xingbie | varchar(200) | NO | - | 性别 |
| nianling | varchar(200) | YES | NULL | 年龄 |
| shengao | varchar(200) | YES | NULL | 身高 |
| tizhong | varchar(200) | YES | NULL | 体重 |
| lianxidianhua | varchar(200) | YES | NULL | 联系电话 |
| sijiaojiage | double | YES | NULL | 私教价格/节 |
| gerenjianjie | longtext | YES | NULL | 个人简介 |

**索引**: PRIMARY KEY (id), UNIQUE KEY (jiaoliangonghao)

### 9. jianshenkecheng (健身课程)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| kechengmingcheng | varchar(200) | NO | - | 课程名称 |
| kechengleixing | varchar(200) | NO | - | 课程类型 |
| tupian | longtext | YES | NULL | 图片 |
| shangkeshijian | datetime | NO | - | 上课时间 |
| shangkedidian | varchar(200) | NO | - | 上课地点 |
| kechengjiage | double | YES | NULL | 课程价格 |
| kechengjianjie | longtext | YES | NULL | 课程简介 |
| kechengshipin | longtext | YES | NULL | 课程视频 |
| jiaoliangonghao | varchar(200) | NO | - | 教练工号 |
| jiaolianxingming | varchar(200) | YES | NULL | 教练姓名 |
| clicktime | datetime | YES | NULL | 最近点击时间 |
| clicknum | int(11) | YES | 0 | 点击次数 |
| discussnum | int(11) | YES | 0 | 评论数 |
| storeupnum | int(11) | YES | 0 | 收藏数 |

**索引**: PRIMARY KEY (id)

### 10. jianshenqicai (健身器材)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| qicaimingcheng | varchar(200) | NO | - | 器材名称 |
| tupian | longtext | YES | NULL | 图片 |
| pinpai | varchar(200) | YES | NULL | 品牌 |
| shiyongfangfa | longtext | YES | NULL | 使用方法 |
| shoushenxiaoguo | longtext | YES | NULL | 瘦身效果 |
| qicaijieshao | longtext | YES | NULL | 器材介绍 |
| jiaoxueshipin | longtext | YES | NULL | 教学视频 |

**索引**: PRIMARY KEY (id)

### 11. kechengleixing (课程类型)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| kechengleixing | varchar(200) | YES | NULL | 课程类型 |

**索引**: PRIMARY KEY (id)

### 12. kechengtuike (课程退课)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| yuyuebianhao | varchar(200) | YES | NULL | 预约编号 |
| kechengmingcheng | varchar(200) | YES | NULL | 课程名称 |
| tupian | longtext | YES | NULL | 图片 |
| kechengleixing | varchar(200) | YES | NULL | 课程类型 |
| shangkeshijian | varchar(200) | YES | NULL | 上课时间 |
| shangkedidian | varchar(200) | YES | NULL | 上课地点 |
| kechengjiage | double | YES | NULL | 课程价格 |
| jiaoliangonghao | varchar(200) | YES | NULL | 教练工号 |
| jiaolianxingming | varchar(200) | YES | NULL | 教练姓名 |
| shenqingshijian | datetime | YES | NULL | 申请时间 |
| huiyuankahao | varchar(200) | NO | - | 会员卡号 |
| yonghuzhanghao | varchar(200) | YES | NULL | 用户账号 |
| yonghuxingming | varchar(200) | YES | NULL | 用户姓名 |
| shoujihaoma | varchar(200) | YES | NULL | 手机号码 |
| tuikeyuanyin | varchar(200) | NO | - | 退课原因 |
| crossuserid | bigint(20) | YES | NULL | 跨表用户id |
| crossrefid | bigint(20) | YES | NULL | 跨表主键id |
| sfsh | varchar(200) | YES | '待审核' | 是否审核 |
| shhf | longtext | YES | NULL | 审核回复 |
| ispay | varchar(200) | YES | '未支付' | 是否支付 |

**索引**: PRIMARY KEY (id)

### 13. kechengyuyue (课程预约)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| yuyuebianhao | varchar(200) | YES | NULL | 预约编号 |
| kechengmingcheng | varchar(200) | YES | NULL | 课程名称 |
| tupian | longtext | YES | NULL | 图片 |
| kechengleixing | varchar(200) | YES | NULL | 课程类型 |
| shangkeshijian | varchar(200) | YES | NULL | 上课时间 |
| shangkedidian | varchar(200) | YES | NULL | 上课地点 |
| kechengjiage | double | YES | NULL | 课程价格 |
| jiaoliangonghao | varchar(200) | YES | NULL | 教练工号 |
| jiaolianxingming | varchar(200) | YES | NULL | 教练姓名 |
| yuyueshijian | datetime | YES | NULL | 预约时间 |
| huiyuankahao | varchar(200) | NO | - | 会员卡号 |
| yonghuzhanghao | varchar(200) | YES | NULL | 用户账号 |
| yonghuxingming | varchar(200) | YES | NULL | 用户姓名 |
| shoujihaoma | varchar(200) | YES | NULL | 手机号码 |
| crossuserid | bigint(20) | YES | NULL | 跨表用户id |
| crossrefid | bigint(20) | YES | NULL | 跨表主键id |
| sfsh | varchar(200) | YES | '待审核' | 是否审核 |
| shhf | longtext | YES | NULL | 审核回复 |
| ispay | varchar(200) | YES | '未支付' | 是否支付 |

**索引**: PRIMARY KEY (id), UNIQUE KEY (yuyuebianhao)

### 14. news (公告信息)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| title | varchar(200) | NO | - | 标题 |
| introduction | longtext | YES | NULL | 简介 |
| typename | varchar(200) | YES | NULL | 分类名称 |
| name | varchar(200) | YES | NULL | 发布人 |
| headportrait | longtext | YES | NULL | 头像 |
| clicknum | int(11) | YES | 0 | 点击次数 |
| clicktime | datetime | YES | NULL | 最近点击时间 |
| thumbsupnum | int(11) | YES | 0 | 赞 |
| crazilynum | int(11) | YES | 0 | 踩 |
| storeupnum | int(11) | YES | 0 | 收藏数 |
| picture | longtext | NO | - | 图片 |
| content | longtext | NO | - | 内容 |

**索引**: PRIMARY KEY (id)

### 15. newstype (公告信息分类)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| typename | varchar(200) | YES | NULL | 分类名称 |

**索引**: PRIMARY KEY (id)

### 16. sijiaoyuyue (私教预约)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| yuyuebianhao | varchar(200) | YES | NULL | 预约编号 |
| jiaoliangonghao | varchar(200) | YES | NULL | 教练工号 |
| jiaolianxingming | varchar(200) | YES | NULL | 教练姓名 |
| zhaopian | longtext | YES | NULL | 照片 |
| sijiaojiage | double | YES | NULL | 私教价格/节 |
| yuyueshijian | datetime | NO | - | 预约时间 |
| yonghuzhanghao | varchar(200) | YES | NULL | 用户账号 |
| yonghuxingming | varchar(200) | YES | NULL | 用户姓名 |
| shoujihaoma | varchar(200) | YES | NULL | 手机号码 |
| huiyuankahao | varchar(200) | NO | - | 会员卡号 |
| beizhu | varchar(200) | YES | NULL | 备注 |
| sfsh | varchar(200) | YES | '待审核' | 是否审核 |
| shhf | longtext | YES | NULL | 审核回复 |
| ispay | varchar(200) | YES | '未支付' | 是否支付 |

**索引**: PRIMARY KEY (id), UNIQUE KEY (yuyuebianhao)

### 17. storeup (收藏表)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| userid | bigint(20) | NO | - | 用户id |
| refid | bigint(20) | YES | NULL | 商品id |
| tablename | varchar(200) | YES | NULL | 表名 |
| name | varchar(200) | NO | - | 名称 |
| picture | longtext | YES | NULL | 图片 |
| type | varchar(200) | YES | '1' | 类型 |
| inteltype | varchar(200) | YES | NULL | 推荐类型 |
| remark | varchar(200) | YES | NULL | 备注 |

**索引**: PRIMARY KEY (id)

### 18. token (token表)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| userid | bigint(20) | NO | - | 用户id |
| username | varchar(100) | NO | - | 用户名 |
| tablename | varchar(100) | YES | NULL | 表名 |
| role | varchar(100) | YES | NULL | 角色 |
| token | varchar(200) | NO | - | 密码 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 新增时间 |
| expiratedtime | timestamp | NO | CURRENT_TIMESTAMP | 过期时间 |

**索引**: PRIMARY KEY (id)

### 19. users (用户表)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| username | varchar(100) | NO | - | 用户名 |
| password | varchar(100) | NO | - | 密码 |
| image | varchar(200) | YES | NULL | 头像 |
| role | varchar(100) | YES | '管理员' | 角色 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 新增时间 |

**索引**: PRIMARY KEY (id)

### 20. yonghu (用户)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | bigint(20) | NO | AUTO_INCREMENT | 主键 |
| addtime | timestamp | NO | CURRENT_TIMESTAMP | 创建时间 |
| yonghuzhanghao | varchar(200) | NO | - | 用户账号 |
| mima | varchar(200) | NO | - | 密码 |
| yonghuxingming | varchar(200) | NO | - | 用户姓名 |
| touxiang | longtext | YES | NULL | 头像 |
| xingbie | varchar(200) | YES | NULL | 性别 |
| shengao | varchar(200) | YES | NULL | 身高 |
| tizhong | varchar(200) | YES | NULL | 体重 |
| shoujihaoma | varchar(200) | YES | NULL | 手机号码 |
| huiyuankahao | varchar(200) | YES | NULL | 会员卡号 |
| youxiaoqizhi | date | YES | NULL | 有效期至 |
| status | int(11) | YES | 0 | 状态 |

**索引**: PRIMARY KEY (id), UNIQUE KEY (yonghuzhanghao)

### 21. legal_terms (法律条款)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | BIGSERIAL | NO | - | 主键 |
| type | VARCHAR(100) | YES | NULL | 类型 |
| title | VARCHAR(200) | NO | - | 标题 |
| version | VARCHAR(50) | YES | NULL | 版本 |
| content | TEXT | NO | - | 内容 |
| status | VARCHAR(50) | YES | NULL | 状态 |
| effective_date | TIMESTAMP | YES | NULL | 生效日期 |
| update_time | TIMESTAMP | YES | CURRENT_TIMESTAMP | 更新时间 |
| create_time | TIMESTAMP | NO | CURRENT_TIMESTAMP | 创建时间 |

**索引**: PRIMARY KEY (id)

### 22. operation_log (操作日志)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | BIGSERIAL | NO | - | 主键 |
| userid | BIGINT | YES | NULL | 用户id |
| username | VARCHAR(255) | YES | NULL | 用户名 |
| table_name | VARCHAR(255) | YES | NULL | 表名 |
| operation_type | VARCHAR(50) | YES | NULL | 操作类型 |
| content | TEXT | YES | NULL | 内容 |
| ip | VARCHAR(50) | YES | NULL | IP地址 |
| user_agent | TEXT | YES | NULL | 用户代理 |
| addtime | TIMESTAMP | YES | CURRENT_TIMESTAMP | 添加时间 |

**索引**:
- PRIMARY KEY (id)
- INDEX idx_operation_log_userid (userid)
- INDEX idx_operation_log_operation_type (operation_type)
- INDEX idx_operation_log_table_name (table_name)
- INDEX idx_operation_log_addtime (addtime)

### 23. messages (站内消息)

| 字段名 | 类型 | 允许NULL | 默认值 | 注释 |
|--------|------|----------|--------|------|
| id | BIGSERIAL | NO | - | 主键 |
| addtime | TIMESTAMP | NO | CURRENT_TIMESTAMP | 创建时间 |
| userid | BIGINT | NO | - | 用户id |
| title | VARCHAR(255) | NO | - | 消息标题 |
| content | TEXT | NO | - | 消息内容 |
| type | VARCHAR(50) | NO | 'system' | 消息类型 |
| isread | INTEGER | NO | 0 | 是否已读 |
| related_type | VARCHAR(100) | YES | NULL | 关联对象类型 |
| related_id | BIGINT | YES | NULL | 关联对象ID |

**索引**:
- PRIMARY KEY (id)
- INDEX idx_messages_userid (userid)
- INDEX idx_messages_isread (isread)
- INDEX idx_messages_type (type)
- INDEX idx_messages_related (related_type, related_id)

---

## 数据库函数

### 1. round (数值四舍五入)

**参数**: val DOUBLE PRECISION, digits INT DEFAULT 0
**返回类型**: NUMERIC
**用途**: 支持DOUBLE PRECISION类型的四舍五入操作

### 2. date_format (日期格式化)

**参数**: timestamp_val TIMESTAMP, format_str TEXT
**返回类型**: TEXT
**用途**: 将MySQL的DATE_FORMAT格式转换为PostgreSQL的TO_CHAR格式

---

## 数据关系说明

1. **用户系统**: `yonghu` (普通用户) 与 `users` (管理员用户) 分离管理
2. **会员管理**: `huiyuanka` (会员卡类型) -> `huiyuankagoumai` (购买记录) -> `huiyuanxufei` (续费记录)
3. **课程系统**: `kechengleixing` (课程类型) -> `jianshenkecheng` (课程) -> `kechengyuyue` (预约) / `kechengtuike` (退课)
4. **教练系统**: `jianshenjiaolian` (教练) -> `jianshenkecheng` (课程) -> `sijiaoyuyue` (私教预约)
5. **评论系统**: `discussjianshenkecheng` (课程评论)
6. **提醒系统**: `daoqitixing` (到期提醒) -> `messages` (消息通知)
7. **公告系统**: `newstype` (分类) -> `news` (公告)
8. **日志系统**: `operation_log` (操作日志), `chat` (聊天记录)

---

## 数据库配置

- **默认数据库名**: `springboot1ngh61a2`
- **字符集**: utf8mb4 (MySQL) / utf8 (PostgreSQL)
- **引擎**: InnoDB (MySQL)
- **时区**: +00:00 (UTC)

---

## 注意事项

1. 所有表都使用BIGINT作为主键，支持高并发场景
2. 时间戳字段使用TIMESTAMP类型，自动记录创建时间
3. 文件上传字段使用LONGTEXT存储路径信息
4. 支付状态使用中文字符串标识('未支付', '已支付')
5. 审核状态使用字符串标识('待审核', '已审核', '审核通过', '审核拒绝')
6. 部分表存在跨表关联字段(crossuserid, crossrefid)，用于业务逻辑处理
7. 索引设计考虑查询性能，主要针对常用查询字段建立索引
8. 支持多数据库(MySQL/PostgreSQL)，部分语法兼容处理




