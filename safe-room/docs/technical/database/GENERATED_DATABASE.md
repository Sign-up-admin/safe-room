# 🗄️ 自动生成的数据库文档

> 从SQL文件和Java实体类自动生成的数据库文档
>
> **生成时间**: 2025-11-16T17:02:37.313Z
> **表数量**: 29

## 📋 数据库概览

| 表名 | 字段数 | 索引数 | 约束数 | 来源 |
|------|--------|--------|--------|------|
| legal_terms | 8 | 0 | 0 | fix-database-schema.sql |
| membership_card | 7 | 0 | 0 | fix-database-schema.sql |
| operation_log | 8 | 4 | 0 | fix-database-schema.sql |
| config | 3 | 0 | 0 | test-schema.sql |
| chat | 6 | 1 | 0 | test-schema.sql |
| daoqitixing | 8 | 1 | 0 | test-schema.sql |
| discussjianshenkecheng | 9 | 2 | 0 | test-schema.sql |
| huiyuanka | 7 | 0 | 0 | test-schema.sql |
| huiyuankagoumai | 12 | 1 | 0 | test-schema.sql |
| huiyuanxufei | 11 | 1 | 0 | test-schema.sql |
| jianshenjiaolian | 13 | 1 | 0 | test-schema.sql |
| jianshenkecheng | 20 | 2 | 0 | test-schema.sql |
| jianshenqicai | 9 | 1 | 0 | test-schema.sql |
| news | 5 | 1 | 0 | test-schema.sql |
| storeup | 8 | 3 | 0 | test-schema.sql |
| yuyuekecheng | 14 | 2 | 0 | test-schema.sql |
| yuyuekecheng_pingjia | 9 | 0 | 0 | test-schema.sql |
| yuyueqicai | 12 | 2 | 0 | test-schema.sql |
| users | 9 | 0 | 0 | test-schema.sql |
| yonghu | 16 | 0 | 0 | test-schema.sql |
| messages | 8 | 4 | 0 | test-schema.sql |
| token | 7 | 0 | 0 | test-schema.sql |
| kechengleixing | 6 | 0 | 0 | schema-h2.sql |
| kechengtuike | 17 | 0 | 0 | schema-h2.sql |
| kechengyuyue | 19 | 0 | 0 | schema-h2.sql |
| message | 8 | 0 | 0 | schema-h2.sql |
| newstype | 6 | 0 | 0 | schema-h2.sql |
| sijiaoyuyue | 20 | 0 | 0 | schema-h2.sql |
| assets | 18 | 3 | 0 | schema-postgresql.sql |

## 📊 legal_terms

**来源**: fix-database-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| type | VARCHAR(100) | ✓ |  |
| title | VARCHAR(200) | ✗ | NOT NULL, |
| version | VARCHAR(50) | ✓ |  |
| content | TEXT | ✗ | NOT NULL, |
| status | VARCHAR(50) | ✓ |  |
| effective_date | TIMESTAMP | ✓ |  |
| update_time | TIMESTAMP | ✓ | DEFAULT CURRENT_TIMESTAMP, |
| create_time | TIMESTAMP | ✗ | DEFAULT CURRENT_TIMESTAMP NOT NULL |


## 📊 membership_card

**来源**: fix-database-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| membership_card_name | VARCHAR(200) | ✗ | NOT NULL, |
| image | TEXT | ✓ |  |
| validity_period | VARCHAR(200) | ✓ |  |
| price | INT | ✓ |  |
| usage_instructions | TEXT | ✓ |  |
| membership_card_details | TEXT | ✓ |  |
| addtime | TIMESTAMP | ✗ | DEFAULT CURRENT_TIMESTAMP NOT NULL |


## 📊 operation_log

**来源**: fix-database-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| userid | BIGINT | ✓ |  |
| username | VARCHAR(100) | ✓ |  |
| table_name | VARCHAR(100) | ✓ |  |
| operation_type | VARCHAR(50) | ✓ |  |
| content | TEXT | ✓ |  |
| ip | VARCHAR(50) | ✓ |  |
| user_agent | TEXT | ✓ |  |
| addtime | TIMESTAMP | ✗ | DEFAULT CURRENT_TIMESTAMP NOT NULL |

### 索引

- **idx_operation_log_userid**: userid
- **idx_operation_log_operation_type**: operation_type
- **idx_operation_log_table_name**: table_name
- **idx_operation_log_addtime**: addtime


## 📊 config

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| name | VARCHAR(100) | ✗ | NOT NULL, |
| config_value | VARCHAR(100) | ✓ |  |
| url | VARCHAR(500) | ✓ |  |


## 📊 chat

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| userid | BIGINT | ✗ | NOT NULL, |
| adminid | BIGINT | ✓ |  |
| ask | CLOB | ✓ |  |
| reply | CLOB | ✓ |  |
| isreply | INTEGER | ✓ |  |

### 索引

- **idx_chat_userid**: userid


## 📊 daoqitixing

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| yonghuzhanghao | VARCHAR(200) | ✓ |  |
| yonghuxingming | VARCHAR(200) | ✓ |  |
| touxiang | CLOB | ✓ |  |
| huiyuankahao | VARCHAR(200) | ✓ |  |
| youxiaoqizhi | DATE | ✓ |  |
| tixingshijian | TIMESTAMP | ✓ |  |
| beizhu | VARCHAR(200) | ✓ |  |

### 索引

- **idx_daoqitixing_yonghuzhanghao**: yonghuzhanghao


## 📊 discussjianshenkecheng

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| refid | BIGINT | ✗ | NOT NULL, |
| userid | BIGINT | ✗ | NOT NULL, |
| avatarurl | CLOB | ✓ |  |
| nickname | VARCHAR(200) | ✓ |  |
| content | CLOB | ✗ | NOT NULL, |
| reply | CLOB | ✓ |  |
| sfsh | VARCHAR(200) | ✓ | DEFAULT '待审核', |
| clicktime | TIMESTAMP | ✓ |  |

### 索引

- **idx_discussjianshenkecheng_refid**: refid
- **idx_discussjianshenkecheng_userid**: userid


## 📊 huiyuanka

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| huiyuankamingcheng | VARCHAR(200) | ✗ | NOT NULL, |
| tupian | CLOB | ✓ |  |
| youxiaoqi | VARCHAR(200) | ✗ | NOT NULL, |
| jiage | INTEGER | ✓ |  |
| shiyongshuoming | CLOB | ✓ |  |
| huiyuankaxiangqing | CLOB | ✓ |  |


## 📊 huiyuankagoumai

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| huiyuankahao | VARCHAR(200) | ✓ |  |
| huiyuankamingcheng | VARCHAR(200) | ✓ |  |
| tupian | CLOB | ✓ |  |
| youxiaoqi | VARCHAR(200) | ✓ |  |
| jiage | INTEGER | ✓ |  |
| goumairiqi | DATE | ✓ |  |
| yonghuzhanghao | VARCHAR(200) | ✓ |  |
| yonghuxingming | VARCHAR(200) | ✓ |  |
| shoujihaoma | VARCHAR(200) | ✓ |  |
| ispay | VARCHAR(200) | ✓ | DEFAULT '未支付', |
| UNIQUE | (huiyuankahao) | ✓ |  |

### 索引

- **idx_huiyuankagoumai_yonghuzhanghao**: yonghuzhanghao


## 📊 huiyuanxufei

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| yonghuzhanghao | VARCHAR(200) | ✓ |  |
| yonghuxingming | VARCHAR(200) | ✓ |  |
| touxiang | CLOB | ✓ |  |
| jiaofeibianhao | VARCHAR(200) | ✓ |  |
| huiyuankamingcheng | VARCHAR(200) | ✗ | NOT NULL, |
| youxiaoqi | VARCHAR(200) | ✓ |  |
| jiage | DOUBLE | ✓ | PRECISION, |
| xufeishijian | TIMESTAMP | ✓ |  |
| ispay | VARCHAR(200) | ✓ | DEFAULT '未支付', |
| UNIQUE | (jiaofeibianhao) | ✓ |  |

### 索引

- **idx_huiyuanxufei_yonghuzhanghao**: yonghuzhanghao


## 📊 jianshenjiaolian

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| jiaoliangonghao | VARCHAR(200) | ✗ | NOT NULL, |
| mima | VARCHAR(200) | ✗ | NOT NULL, |
| password_hash | VARCHAR(255) | ✓ |  |
| jiaolianxingming | VARCHAR(200) | ✓ |  |
| touxiang | CLOB | ✓ |  |
| xingbie | VARCHAR(200) | ✓ |  |
| nianling | INTEGER | ✓ |  |
| shoujihaoma | VARCHAR(200) | ✓ |  |
| zhiyejieshao | CLOB | ✓ |  |
| status | INTEGER | ✓ | DEFAULT 0, |
| failed_login_attempts | INTEGER | ✓ | DEFAULT 0, |
| lock_until | TIMESTAMP | ✓ |  |

### 索引

- **idx_jianshenjiaolian_jiaoliangonghao**: jiaoliangonghao


## 📊 jianshenkecheng

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| kechengmingcheng | VARCHAR(200) | ✗ | NOT NULL, |
| kechengleixing | VARCHAR(200) | ✗ | NOT NULL, |
| tupian | CLOB | ✓ |  |
| shangkeshijian | TIMESTAMP | ✗ | NOT NULL, |
| shangkedidian | VARCHAR(200) | ✗ | NOT NULL, |
| kechengjiage | DOUBLE | ✓ | PRECISION, |
| kechengjianjie | CLOB | ✓ |  |
| kechengshipin | CLOB | ✓ |  |
| shangkejihua | CLOB | ✓ |  |
| shangkeshichang | INTEGER | ✓ |  |
| baomingrenshu | INTEGER | ✓ | DEFAULT 0, |
| yuyuerenshu | INTEGER | ✓ | DEFAULT 0, |
| status | INTEGER | ✓ | DEFAULT 0, |
| jiaoliangonghao | VARCHAR(200) | ✓ |  |
| jiaolianxingming | VARCHAR(200) | ✓ |  |
| clicktime | TIMESTAMP | ✓ |  |
| clicknum | INTEGER | ✓ | DEFAULT 0, |
| discussnum | INTEGER | ✓ | DEFAULT 0, |
| storeupnum | INTEGER | ✓ | DEFAULT 0 |

### 索引

- **idx_jianshenkecheng_kechengleixing**: kechengleixing
- **idx_jianshenkecheng_status**: status


## 📊 jianshenqicai

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| qicaimingcheng | VARCHAR(200) | ✗ | NOT NULL, |
| qicaileixing | VARCHAR(200) | ✗ | NOT NULL, |
| tupian | CLOB | ✓ |  |
| qicaizhuangtai | VARCHAR(200) | ✓ |  |
| shuliang | INTEGER | ✓ |  |
| weizhi | VARCHAR(200) | ✓ |  |
| qicaijianjie | CLOB | ✓ |  |
| status | INTEGER | ✓ | DEFAULT 0 |

### 索引

- **idx_jianshenqicai_qicaileixing**: qicaileixing


## 📊 news

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| title | VARCHAR(200) | ✗ | NOT NULL, |
| introduction | CLOB | ✓ |  |
| picture | CLOB | ✓ |  |
| content | CLOB | ✓ |  |

### 索引

- **idx_news_addtime**: addtime


## 📊 storeup

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| userid | BIGINT | ✗ | NOT NULL, |
| refid | BIGINT | ✗ | NOT NULL, |
| tablename | VARCHAR(200) | ✓ |  |
| name | VARCHAR(200) | ✓ |  |
| picture | CLOB | ✓ |  |
| type | VARCHAR(200) | ✓ | DEFAULT '1', |
| inteltype | VARCHAR(200) | ✓ |  |

### 索引

- **idx_storeup_userid**: userid
- **idx_storeup_refid**: refid
- **idx_storeup_tablename**: tablename


## 📊 yuyuekecheng

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| kechengmingcheng | VARCHAR(200) | ✓ |  |
| kechengleixing | VARCHAR(200) | ✓ |  |
| tupian | CLOB | ✓ |  |
| shangkeshijian | TIMESTAMP | ✓ |  |
| shangkedidian | VARCHAR(200) | ✓ |  |
| kechengjiage | DOUBLE | ✓ | PRECISION, |
| yonghuzhanghao | VARCHAR(200) | ✓ |  |
| yonghuxingming | VARCHAR(200) | ✓ |  |
| shoujihaoma | VARCHAR(200) | ✓ |  |
| yuyueshijian | TIMESTAMP | ✓ |  |
| beizhu | VARCHAR(200) | ✓ |  |
| sfsh | VARCHAR(200) | ✓ | DEFAULT '待审核', |
| shhf | CLOB | ✓ |  |

### 索引

- **idx_yuyuekecheng_yonghuzhanghao**: yonghuzhanghao
- **idx_yuyuekecheng_sfsh**: sfsh


## 📊 yuyuekecheng_pingjia

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| refid | BIGINT | ✗ | NOT NULL, |
| userid | BIGINT | ✗ | NOT NULL, |
| avatarurl | CLOB | ✓ |  |
| nickname | VARCHAR(200) | ✓ |  |
| content | CLOB | ✗ | NOT NULL, |
| reply | CLOB | ✓ |  |
| sfsh | VARCHAR(200) | ✓ | DEFAULT '待审核', |
| clicktime | TIMESTAMP | ✓ |  |


## 📊 yuyueqicai

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| qicaimingcheng | VARCHAR(200) | ✓ |  |
| qicaileixing | VARCHAR(200) | ✓ |  |
| tupian | CLOB | ✓ |  |
| yuyueshijian | TIMESTAMP | ✓ |  |
| yuyueshichang | INTEGER | ✓ |  |
| yonghuzhanghao | VARCHAR(200) | ✓ |  |
| yonghuxingming | VARCHAR(200) | ✓ |  |
| shoujihaoma | VARCHAR(200) | ✓ |  |
| beizhu | VARCHAR(200) | ✓ |  |
| sfsh | VARCHAR(200) | ✓ | DEFAULT '待审核', |
| shhf | CLOB | ✓ |  |

### 索引

- **idx_yuyueqicai_yonghuzhanghao**: yonghuzhanghao
- **idx_yuyueqicai_sfsh**: sfsh


## 📊 users

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| username | VARCHAR(100) | ✗ | NOT NULL, |
| password | VARCHAR(100) | ✗ | NOT NULL, |
| password_hash | VARCHAR(255) | ✓ |  |
| failed_login_attempts | INTEGER | ✓ | DEFAULT 0, |
| lock_until | TIMESTAMP | ✓ |  |
| image | VARCHAR(200) | ✓ |  |
| role | VARCHAR(100) | ✓ | DEFAULT '管理员', |
| status | INTEGER | ✓ | DEFAULT 0, |
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP |


## 📊 yonghu

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| yonghuzhanghao | VARCHAR(200) | ✗ | NOT NULL, |
| mima | VARCHAR(200) | ✗ | NOT NULL, |
| password_hash | VARCHAR(255) | ✓ |  |
| yonghuxingming | VARCHAR(200) | ✓ |  |
| touxiang | CLOB | ✓ |  |
| xingbie | VARCHAR(200) | ✓ |  |
| shengao | VARCHAR(200) | ✓ |  |
| tizhong | VARCHAR(200) | ✓ |  |
| shoujihaoma | VARCHAR(200) | ✓ |  |
| huiyuankahao | VARCHAR(200) | ✓ |  |
| huiyuankamingcheng | VARCHAR(200) | ✓ |  |
| youxiaoqizhi | VARCHAR(200) | ✓ |  |
| status | INTEGER | ✓ | DEFAULT 0, |
| failed_login_attempts | INTEGER | ✓ | DEFAULT 0, |
| lock_until | TIMESTAMP | ✓ |  |


## 📊 messages

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| userid | BIGINT | ✗ | NOT NULL, |
| title | VARCHAR(255) | ✗ | NOT NULL, |
| content | CLOB | ✗ | NOT NULL, |
| type | VARCHAR(50) | ✗ | NOT NULL DEFAULT 'system', |
| isread | INTEGER | ✗ | NOT NULL DEFAULT 0, |
| related_type | VARCHAR(100) | ✓ |  |
| related_id | BIGINT | ✓ |  |

### 索引

- **idx_messages_userid**: userid
- **idx_messages_isread**: isread
- **idx_messages_type**: type
- **idx_messages_related**: related_type, related_id


## 📊 token

**来源**: springboot1ngh61a2\target\test-classes\test-schema.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| userid | BIGINT | ✗ | NOT NULL, |
| username | VARCHAR(100) | ✗ | NOT NULL, |
| tablename | VARCHAR(100) | ✓ |  |
| role | VARCHAR(100) | ✓ |  |
| token | VARCHAR(200) | ✗ | NOT NULL, |
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| expiratedtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP |


## 📊 kechengleixing

**来源**: springboot1ngh61a2\target\test-classes\schema-h2.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| kechengleixing | VARCHAR(200) | ✓ |  |
| clicktime | TIMESTAMP | ✓ |  |
| clicknum | INTEGER | ✓ | DEFAULT 0, |
| discussnum | INTEGER | ✓ | DEFAULT 0, |
| storeupnum | INTEGER | ✓ | DEFAULT 0 |


## 📊 kechengtuike

**来源**: springboot1ngh61a2\target\test-classes\schema-h2.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| tuikebianhao | VARCHAR(200) | ✓ |  |
| kechengmingcheng | VARCHAR(200) | ✓ |  |
| tupian | TEXT | ✓ |  |
| kechengleixing | VARCHAR(200) | ✓ |  |
| shangkeshijian | TIMESTAMP | ✓ |  |
| shangkedidian | VARCHAR(200) | ✓ |  |
| tuikeshijian | TIMESTAMP | ✓ |  |
| huiyuankahao | VARCHAR(200) | ✓ |  |
| yonghuzhanghao | VARCHAR(200) | ✓ |  |
| yonghuxingming | VARCHAR(200) | ✓ |  |
| shoujihaoma | VARCHAR(200) | ✓ |  |
| crossuserid | BIGINT | ✓ |  |
| crossrefid | BIGINT | ✓ |  |
| sfsh | VARCHAR(200) | ✓ | DEFAULT '待审核', |
| shhf | TEXT | ✓ |  |
| ispay | VARCHAR(200) | ✓ |  |


## 📊 kechengyuyue

**来源**: springboot1ngh61a2\target\test-classes\schema-h2.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| yuyuebianhao | VARCHAR(200) | ✓ |  |
| kechengmingcheng | VARCHAR(200) | ✓ |  |
| tupian | TEXT | ✓ |  |
| kechengleixing | VARCHAR(200) | ✓ |  |
| shangkeshijian | TIMESTAMP | ✓ |  |
| shangkedidian | VARCHAR(200) | ✓ |  |
| jiaoliangonghao | VARCHAR(200) | ✓ |  |
| jiaolianxingming | VARCHAR(200) | ✓ |  |
| yuyueshijian | TIMESTAMP | ✓ |  |
| huiyuankahao | VARCHAR(200) | ✓ |  |
| yonghuzhanghao | VARCHAR(200) | ✓ |  |
| yonghuxingming | VARCHAR(200) | ✓ |  |
| shoujihaoma | VARCHAR(200) | ✓ |  |
| crossuserid | BIGINT | ✓ |  |
| crossrefid | BIGINT | ✓ |  |
| sfsh | VARCHAR(200) | ✓ | DEFAULT '待审核', |
| shhf | TEXT | ✓ |  |
| ispay | VARCHAR(200) | ✓ |  |


## 📊 message

**来源**: springboot1ngh61a2\target\test-classes\schema-h2.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| userid | BIGINT | ✓ |  |
| title | VARCHAR(200) | ✓ |  |
| content | TEXT | ✓ |  |
| type | VARCHAR(50) | ✓ |  |
| isread | INTEGER | ✓ | DEFAULT 0, |
| related_type | VARCHAR(50) | ✓ |  |
| related_id | BIGINT | ✓ |  |
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP |


## 📊 newstype

**来源**: springboot1ngh61a2\target\test-classes\schema-h2.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| newstype | VARCHAR(200) | ✓ |  |
| clicktime | TIMESTAMP | ✓ |  |
| clicknum | INTEGER | ✓ | DEFAULT 0, |
| discussnum | INTEGER | ✓ | DEFAULT 0, |
| storeupnum | INTEGER | ✓ | DEFAULT 0 |


## 📊 sijiaoyuyue

**来源**: springboot1ngh61a2\target\test-classes\schema-h2.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| yuyuebianhao | VARCHAR(200) | ✓ |  |
| jiaoliangonghao | VARCHAR(200) | ✓ |  |
| jiaolianxingming | VARCHAR(200) | ✓ |  |
| zhaopian | TEXT | ✓ |  |
| xingbie | VARCHAR(200) | ✓ |  |
| nianling | VARCHAR(200) | ✓ |  |
| shengao | VARCHAR(200) | ✓ |  |
| tizhong | VARCHAR(200) | ✓ |  |
| yuyueshijian | TIMESTAMP | ✓ |  |
| yuyueshichang | INTEGER | ✓ |  |
| huiyuankahao | VARCHAR(200) | ✓ |  |
| yonghuzhanghao | VARCHAR(200) | ✓ |  |
| yonghuxingming | VARCHAR(200) | ✓ |  |
| shoujihaoma | VARCHAR(200) | ✓ |  |
| crossuserid | BIGINT | ✓ |  |
| crossrefid | BIGINT | ✓ |  |
| sfsh | VARCHAR(200) | ✓ | DEFAULT '待审核', |
| shhf | TEXT | ✓ |  |
| ispay | VARCHAR(200) | ✓ |  |


## 📊 assets

**来源**: springboot1ngh61a2\target\classes\schema-postgresql.sql

### 字段定义

| 字段名 | 类型 | 可空 | 约束 |
|--------|------|------|--------|
| addtime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| updatetime | TIMESTAMP | ✗ | NOT NULL DEFAULT CURRENT_TIMESTAMP, |
| asset_name | VARCHAR(200) | ✗ | NOT NULL, |
| asset_type | VARCHAR(50) | ✗ | NOT NULL, |
| file_path | TEXT | ✗ | NOT NULL, |
| file_size | BIGINT | ✓ |  |
| file_format | VARCHAR(50) | ✓ |  |
| module | VARCHAR(100) | ✓ |  |
| usage | VARCHAR(100) | ✓ |  |
| dimensions | VARCHAR(50) | ✓ |  |
| width | INT | ✓ |  |
| height | INT | ✓ |  |
| version | VARCHAR(50) | ✓ |  |
| description | TEXT | ✓ |  |
| tags | TEXT | ✓ |  |
| category | VARCHAR(50) | ✓ | DEFAULT 'static', |
| status | VARCHAR(50) | ✓ | DEFAULT 'active', |
| upload_user | VARCHAR(100) | ✓ |  |

### 索引

- **idx_assets_type**: asset_type
- **idx_assets_module**: module
- **idx_assets_usage**: usage

