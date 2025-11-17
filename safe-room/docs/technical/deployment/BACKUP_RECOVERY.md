---
title: BACKUP RECOVERY
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---
# 备份恢复指南

> 版本：v1.0
> 更新日期：2025-11-16
> 适用范围：Docker部署环境

---

## 概述

本文档介绍健身房综合管理系统的备份和恢复策略，包括数据库备份、文件备份、配置备份以及灾难恢复预案。确保数据安全是运维工作的重要组成部分。

## 备份策略

### 1.1 备份类型

#### 数据库备份

健身房管理系统使用PostgreSQL数据库，需要定期备份以下内容：

- **全量备份**：完整数据库备份，每周执行一次
- **增量备份**：自上次备份以来的变更，每日执行
- **事务日志备份**：WAL日志备份，支持时间点恢复

#### 文件备份

- **应用日志**：`/app/logs` 目录下的所有日志文件
- **上传文件**：`/app/static/upload` 目录下的用户上传文件
- **配置文件**：`.env`、Nginx配置等关键配置文件

#### 系统备份

- **Docker卷**：数据库数据卷、日志卷、上传文件卷
- **Docker镜像**：应用镜像的备份
- **系统配置**：Docker Compose配置、环境变量模板

### 1.2 备份频率

| 备份类型 | 频率 | 保留期 | 存储位置 |
|---------|------|--------|----------|
| 数据库全量备份 | 每周日02:00 | 4周 | 本地 + 云存储 |
| 数据库增量备份 | 每日02:00（工作日） | 7天 | 本地 |
| 文件备份 | 每日03:00 | 30天 | 本地 + 云存储 |
| 日志备份 | 每日04:00 | 90天 | 本地 |
| 配置备份 | 变更时手动 | 永久 | Git仓库 |

### 1.3 备份存储策略

#### 本地存储

```bash
# 备份目录结构
/backup/
├── database/
│   ├── full/           # 全量备份
│   ├── incremental/    # 增量备份
│   └── wal/           # WAL日志
├── files/
│   ├── uploads/       # 上传文件
│   ├── logs/          # 日志文件
│   └── config/        # 配置文件
└── docker/
    ├── images/        # Docker镜像
    └── volumes/       # 卷快照
```

#### 云存储

- **对象存储**：使用MinIO或AWS S3存储重要备份
- **异地备份**：至少一份备份存储在不同地理位置
- **加密传输**：所有备份在传输和存储时进行加密

---

## 2. 数据库备份

### 2.1 全量备份

#### 使用pg_dump进行备份

```bash
#!/bin/bash
# full-backup.sh - 数据库全量备份脚本

BACKUP_DIR="/backup/database/full"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/fitness_gym_full_$DATE.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 设置PostgreSQL密码
export PGPASSWORD=$POSTGRES_PASSWORD

# 执行全量备份
pg_dump -h localhost -U postgres -d fitness_gym \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        --verbose \
        > $BACKUP_FILE

# 压缩备份文件
gzip $BACKUP_FILE

echo "全量备份完成: $BACKUP_FILE.gz"

# 清理旧备份（保留4周）
find $BACKUP_DIR -name "*.gz" -mtime +28 -delete

# 验证备份
if [ $? -eq 0 ]; then
    echo "备份验证成功"
    # 上传到对象存储
    # aws s3 cp $BACKUP_FILE.gz s3://backup-bucket/database/full/
else
    echo "备份失败"
    exit 1
fi
```

#### Docker环境下的备份

```bash
# 使用Docker Compose执行备份
docker-compose exec postgres pg_dump -U postgres fitness_gym \
    --no-owner --no-privileges --clean --if-exists \
    > backup_$(date +%Y%m%d_%H%M%S).sql

# 或者直接从宿主机执行
docker exec fitness_gym_postgres pg_dump -U postgres fitness_gym \
    --no-owner --no-privileges --clean --if-exists \
    > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2.2 增量备份

#### 使用pg_basebackup

```bash
#!/bin/bash
# incremental-backup.sh - 增量备份脚本

BACKUP_DIR="/backup/database/incremental"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/fitness_gym_incremental_$DATE"

# 创建备份目录
mkdir -p $BACKUP_PATH

# 执行增量备份
docker-compose exec postgres pg_basebackup \
    -D $BACKUP_PATH \
    -U postgres \
    -Ft \
    -z \
    -P

echo "增量备份完成: $BACKUP_PATH"

# 清理旧备份（保留7天）
find $BACKUP_DIR -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \;
```

### 2.3 WAL日志备份

#### 配置WAL归档

在`docker-compose.yml`中添加WAL归档配置：

```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_DB: fitness_gym
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_INITDB_ARGS: "-E UTF8 --locale=C"
    TZ: Asia/Shanghai
    PGDATA: /var/lib/postgresql/data/pgdata
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./backup/wal:/backup/wal
    - ./scripts/postgres-wal-archive.sh:/usr/local/bin/wal-archive.sh
  command:
    - "postgres"
    - "-c"
    - "wal_level=replica"
    - "-c"
    - "archive_mode=on"
    - "-c"
    - "archive_command=/usr/local/bin/wal-archive.sh %p %f"
    - "-c"
    - "archive_timeout=3600"
```

#### WAL归档脚本

```bash
#!/bin/bash
# postgres-wal-archive.sh

WAL_FILE=$1
WAL_NAME=$2
BACKUP_DIR="/backup/wal"

# 创建归档目录
mkdir -p $BACKUP_DIR

# 复制WAL文件到归档目录
cp $WAL_FILE $BACKUP_DIR/$WAL_NAME

# 压缩WAL文件
gzip $BACKUP_DIR/$WAL_NAME

# 清理旧WAL文件（保留30天）
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "WAL文件已归档: $WAL_NAME"
```

---

## 3. 文件备份

### 3.1 上传文件备份

```bash
#!/bin/bash
# files-backup.sh - 文件备份脚本

BACKUP_DIR="/backup/files"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/uploads_$DATE.tar.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份上传文件
docker run --rm \
    -v fitness_gym_upload_data:/data \
    -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/uploads_$DATE.tar.gz -C / data

echo "上传文件备份完成: $BACKUP_FILE"

# 验证备份
if [ -f "$BACKUP_FILE" ]; then
    echo "备份验证成功，大小: $(du -h $BACKUP_FILE | cut -f1)"
else
    echo "备份失败"
    exit 1
fi

# 清理旧备份（保留30天）
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +30 -delete
```

### 3.2 日志文件备份

```bash
#!/bin/bash
# logs-backup.sh - 日志备份脚本

BACKUP_DIR="/backup/files/logs"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/logs_$DATE.tar.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份应用日志
docker run --rm \
    -v fitness_gym_backend_logs:/logs \
    -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/logs_$DATE.tar.gz -C / logs

echo "日志备份完成: $BACKUP_FILE"

# 压缩并清理（保留90天）
find $BACKUP_DIR -name "logs_*.tar.gz" -mtime +90 -delete
```

### 3.3 配置文件备份

```bash
#!/bin/bash
# config-backup.sh - 配置备份脚本

BACKUP_DIR="/backup/files/config"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/config_$DATE.tar.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份配置文件
tar czf $BACKUP_FILE \
    .env \
    docker-compose.yml \
    nginx.conf \
    --exclude='*.log' \
    --exclude='node_modules'

echo "配置备份完成: $BACKUP_FILE"

# 验证备份
if [ -f "$BACKUP_FILE" ]; then
    echo "配置备份验证成功"
    # 提交到Git仓库
    git add .
    git commit -m "配置备份 $DATE"
    git push origin main
else
    echo "配置备份失败"
    exit 1
fi
```

---

## 4. Docker资源备份

### 4.1 Docker镜像备份

```bash
#!/bin/bash
# docker-images-backup.sh - Docker镜像备份

BACKUP_DIR="/backup/docker/images"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份应用镜像
docker save fitness_gym_backend:latest > $BACKUP_DIR/fitness_gym_backend_$DATE.tar

# 备份PostgreSQL镜像
docker save postgres:16-alpine > $BACKUP_DIR/postgres_16_alpine_$DATE.tar

# 备份MinIO镜像
docker save minio/minio:latest > $BACKUP_DIR/minio_latest_$DATE.tar

# 压缩镜像文件
gzip $BACKUP_DIR/*.tar

echo "Docker镜像备份完成"

# 清理旧镜像备份（保留4周）
find $BACKUP_DIR -name "*.tar.gz" -mtime +28 -delete
```

### 4.2 Docker卷快照

```bash
#!/bin/bash
# docker-volumes-backup.sh - Docker卷备份

BACKUP_DIR="/backup/docker/volumes"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库卷
docker run --rm \
    -v fitness_gym_postgres_data:/source \
    -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/postgres_data_$DATE.tar.gz -C / source

# 备份上传文件卷
docker run --rm \
    -v fitness_gym_upload_data:/source \
    -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/upload_data_$DATE.tar.gz -C / source

echo "Docker卷备份完成"

# 清理旧卷备份（保留7天）
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

---

## 5. 恢复流程

### 5.1 数据库恢复

#### 从全量备份恢复

```bash
#!/bin/bash
# database-restore.sh - 数据库恢复脚本

BACKUP_FILE=$1  # 备份文件路径

if [ -z "$BACKUP_FILE" ]; then
    echo "用法: $0 <备份文件路径>"
    exit 1
fi

# 停止应用服务
docker-compose stop backend

# 恢复数据库
echo "正在恢复数据库..."
cat $BACKUP_FILE | docker-compose exec -T postgres psql -U postgres -d fitness_gym

# 验证恢复
docker-compose exec postgres psql -U postgres -d fitness_gym -c "SELECT COUNT(*) FROM users;"

# 重启应用服务
docker-compose start backend

echo "数据库恢复完成"
```

#### 时间点恢复

```bash
#!/bin/bash
# point-in-time-recovery.sh - 时间点恢复

BASE_BACKUP=$1      # 基础备份
TARGET_TIME=$2      # 恢复目标时间
RECOVERY_DIR="/tmp/recovery"

# 创建恢复目录
mkdir -p $RECOVERY_DIR

# 解压基础备份
tar xzf $BASE_BACKUP -C $RECOVERY_DIR

# 复制WAL文件到恢复目录
cp /backup/wal/*.gz $RECOVERY_DIR/pg_wal/

# 创建recovery.conf
cat > $RECOVERY_DIR/recovery.conf << EOF
restore_command = 'cp /recovery/pg_wal/%f %p'
recovery_target_time = '$TARGET_TIME'
recovery_target_action = 'promote'
EOF

# 执行恢复
docker-compose exec postgres pg_ctl stop -m immediate
docker-compose exec postgres pg_ctl start
```

### 5.2 文件恢复

#### 恢复上传文件

```bash
#!/bin/bash
# files-restore.sh - 文件恢复脚本

BACKUP_FILE=$1  # 备份文件路径

if [ -z "$BACKUP_FILE" ]; then
    echo "用法: $0 <备份文件路径>"
    exit 1
fi

# 停止服务
docker-compose stop backend

# 恢复文件
docker run --rm \
    -v fitness_gym_upload_data:/data \
    -v $(dirname $BACKUP_FILE):/backup \
    alpine sh -c "cd /data && tar xzf /backup/$(basename $BACKUP_FILE)"

# 重启服务
docker-compose start backend

echo "文件恢复完成"
```

### 5.3 Docker资源恢复

#### 恢复Docker镜像

```bash
# 加载镜像
docker load < /backup/docker/images/fitness_gym_backend_latest.tar.gz

# 重新标记
docker tag loaded_image_id fitness_gym_backend:latest
```

#### 恢复Docker卷

```bash
# 停止服务
docker-compose down

# 恢复卷数据
docker run --rm \
    -v fitness_gym_postgres_data:/data \
    -v /backup/docker/volumes:/backup \
    alpine sh -c "cd /data && tar xzf /backup/postgres_data_20241116.tar.gz"

# 重启服务
docker-compose up -d
```

---

## 6. 灾难恢复预案

### 6.1 灾难分级

#### 级别一：服务不可用（RTO: 1小时, RPO: 1小时）

- **触发条件**：单个服务宕机，数据未丢失
- **恢复流程**：
  1. 立即重启受影响服务
  2. 检查服务健康状态
  3. 验证功能正常性

#### 级别二：数据丢失（RTO: 4小时, RPO: 1天）

- **触发条件**：数据卷损坏或误删除
- **恢复流程**：
  1. 停止所有服务
  2. 从最近备份恢复数据
  3. 验证数据完整性
  4. 重启服务

#### 级别三：系统级灾难（RTO: 24小时, RPO: 1周）

- **触发条件**：服务器硬件故障或机房故障
- **恢复流程**：
  1. 在备用服务器上部署系统
  2. 恢复最新全量备份
  3. 重放WAL日志到最新状态
  4. 切换流量

### 6.2 恢复时间目标（RTO）和恢复点目标（RPO）

| 灾难级别 | RTO | RPO | 影响范围 |
|---------|-----|-----|----------|
| 级别一 | 1小时 | 实时 | 单个服务 |
| 级别二 | 4小时 | 1小时 | 部分数据 |
| 级别三 | 24小时 | 1天 | 整个系统 |

### 6.3 应急响应流程

#### 1. 灾难发生

```bash
# 立即执行
echo "$(date): 灾难发生 - $DESCRIPTION" >> /var/log/disaster.log

# 通知团队
# 发送告警邮件/SMS
curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"系统灾难告警: '"$DESCRIPTION"'"}' \
    $SLACK_WEBHOOK_URL
```

#### 2. 评估影响

- 确定影响范围和服务状态
- 评估数据丢失程度
- 确定恢复优先级

#### 3. 执行恢复

- 按照相应级别的恢复流程执行
- 实时更新恢复进度
- 通知相关方

#### 4. 恢复验证

- 验证系统功能正常性
- 检查数据完整性
- 性能测试验证

#### 5. 总结报告

- 记录灾难原因和影响
- 分析恢复过程的不足
- 更新灾难恢复预案

### 6.4 备用系统准备

#### 备用服务器配置

```yaml
# docker-compose.backup.yml
version: '3.8'

services:
  postgres-backup:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: fitness_gym
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_backup_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"  # 使用不同端口避免冲突

  backend-backup:
    image: fitness_gym_backend:latest
    depends_on:
      postgres-backup:
        condition: service_healthy
    environment:
      DB_HOST: postgres-backup
      DB_PORT: 5432
    ports:
      - "8081:8080"  # 使用不同端口
```

#### 自动故障转移脚本

```bash
#!/bin/bash
# failover.sh - 自动故障转移

PRIMARY_HOST="primary-server"
BACKUP_HOST="backup-server"
PRIMARY_STATUS=$(curl -f -s http://$PRIMARY_HOST:8080/health)

if [ $? -ne 0 ]; then
    echo "主系统故障，开始故障转移"

    # 在备用服务器上启动服务
    ssh $BACKUP_HOST "cd /app && docker-compose -f docker-compose.backup.yml up -d"

    # 更新DNS或负载均衡器
    # update-dns.sh $BACKUP_HOST

    # 通知团队
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"系统已切换到备用服务器"}' \
        $SLACK_WEBHOOK_URL
fi
```

---

## 7. 备份验证与测试

### 7.1 定期验证

#### 备份完整性检查

```bash
#!/bin/bash
# backup-verification.sh - 备份验证脚本

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "用法: $0 <备份文件>"
    exit 1
fi

echo "验证备份文件: $BACKUP_FILE"

# 检查文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo "错误: 备份文件不存在"
    exit 1
fi

# 检查文件大小
FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")
if [ $FILE_SIZE -eq 0 ]; then
    echo "错误: 备份文件为空"
    exit 1
fi

echo "文件大小: $(numfmt --to=iec-i --suffix=B $FILE_SIZE)"

# 如果是数据库备份，验证SQL语法
if [[ $BACKUP_FILE == *.sql ]]; then
    echo "验证SQL语法..."
    # 创建临时数据库进行验证
    TEMP_DB="backup_verification_$(date +%s)"
    createdb $TEMP_DB
    psql -d $TEMP_DB -f $BACKUP_FILE --quiet
    if [ $? -eq 0 ]; then
        echo "SQL语法验证通过"
    else
        echo "SQL语法验证失败"
        exit 1
    fi
    dropdb $TEMP_DB
fi

echo "备份验证完成"
```

#### 恢复测试

```bash
#!/bin/bash
# restore-test.sh - 恢复测试脚本

TEST_ENV="test-restore"
BACKUP_FILE=$1

# 创建测试环境
docker-compose -p $TEST_ENV up -d postgres

# 等待数据库启动
sleep 10

# 执行恢复
cat $BACKUP_FILE | docker-compose -p $TEST_ENV exec -T postgres psql -U postgres -d fitness_gym

# 验证恢复结果
TABLE_COUNT=$(docker-compose -p $TEST_ENV exec postgres psql -U postgres -d fitness_gym -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")

echo "恢复测试完成，表数量: $TABLE_COUNT"

# 清理测试环境
docker-compose -p $TEST_ENV down -v
```

### 7.2 备份报告

#### 生成备份报告

```bash
#!/bin/bash
# backup-report.sh - 备份报告生成

REPORT_FILE="/backup/reports/backup_report_$(date +%Y%m%d).txt"

echo "=== 备份状态报告 $(date) ===" > $REPORT_FILE
echo "" >> $REPORT_FILE

# 数据库备份状态
echo "数据库备份:" >> $REPORT_FILE
ls -la /backup/database/full/*.gz | tail -5 >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 文件备份状态
echo "文件备份:" >> $REPORT_FILE
ls -la /backup/files/uploads/*.gz | tail -3 >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 磁盘使用情况
echo "备份存储使用情况:" >> $REPORT_FILE
du -sh /backup/* >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 发送报告
mail -s "每日备份报告 $(date +%Y%m%d)" admin@example.com < $REPORT_FILE
```

---

## 8. 最佳实践

### 8.1 备份策略

- **3-2-1规则**：至少3份备份，2种不同媒体，1份异地存储
- **定期测试**：每月进行一次恢复测试
- **加密保护**：所有备份数据进行加密
- **访问控制**：限制备份文件访问权限

### 8.2 监控告警

- **备份成功监控**：每次备份后验证完整性
- **存储空间监控**：监控备份存储空间使用率
- **备份时间监控**：监控备份执行时间是否正常
- **定期审计**：定期审查备份策略的有效性

### 8.3 文档维护

- **更新恢复文档**：每次系统变更后更新恢复流程
- **人员培训**：定期对运维人员进行灾难恢复培训
- **联系方式更新**：保持应急联系人信息最新
- **演练计划**：制定年度灾难恢复演练计划

---

## 相关文档

- [运维操作指南](DEPLOYMENT_OPERATIONS.md) - 日常运维操作流程
- [故障排查指南](TROUBLESHOOTING.md) - 系统故障诊断和解决
- [脚本参考手册](SCRIPTS_REFERENCE.md) - 备份相关脚本使用说明
- [监控指南](MONITORING.md) - 系统监控和告警配置
