---
title: DEPLOYMENT
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
tags: [deployment, production, docker, spring-boot]
---

# 生产环境部署指南

> 相关文档：`README.md`（快速开始）、`docs/ARCHITECTURE.md`（系统架构）、`docs/DATABASE.md`（数据模型）。如需完整文档列表，请查阅 `docs/README.md`。

## 环境要求

- Docker 和 Docker Compose
- Java 21+
- Maven 3.6+

## 快速开始

### 1. 配置环境变量

复制环境变量模板并修改：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置数据库密码等敏感信息：

```env
# Database Configuration
POSTGRES_DB=fitness_gym
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_PORT=5432

# Spring Boot Application Configuration
SERVER_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fitness_gym
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

# Database Connection Pool Configuration
DB_POOL_MIN_IDLE=10
DB_POOL_MAX_SIZE=50
```

### 2. 启动数据库容器

```bash
docker-compose up -d
```

这将启动PostgreSQL数据库容器，并自动执行：
- 创建数据库
- 执行schema-postgresql.sql创建表结构
- 执行data.sql插入初始数据

### 3. 验证数据库

检查容器状态：

```bash
docker-compose ps
```

查看数据库日志：

```bash
docker-compose logs postgres
```

### 4. 配置Spring Boot应用

#### 开发环境

使用默认配置 `application.yml`，直接运行：

```bash
cd springboot1ngh61a2
mvn spring-boot:run
```

#### 生产环境

使用生产配置 `application-prod.yml`：

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

或者设置环境变量：

```bash
export SPRING_PROFILES_ACTIVE=prod
mvn spring-boot:run
```

确保 `.env` 文件中的环境变量已正确设置。

### 5. 验证应用

应用启动后，访问：

- API基础路径: `http://localhost:8080/springboot1ngh61a2`
- 健康检查: `http://localhost:8080/springboot1ngh61a2/user/login`

## 数据库管理

### 连接数据库

```bash
docker exec -it fitness_gym_postgres psql -U postgres -d fitness_gym
```

### 备份数据库

```bash
docker exec fitness_gym_postgres pg_dump -U postgres fitness_gym > backup.sql
```

### 恢复数据库

```bash
docker exec -i fitness_gym_postgres psql -U postgres fitness_gym < backup.sql
```

### 停止和清理

停止容器：

```bash
docker-compose down
```

停止并删除数据卷（**警告：会删除所有数据**）：

```bash
docker-compose down -v
```

## 故障排查

### 数据库连接失败

1. 检查容器是否运行：`docker-compose ps`
2. 检查端口是否被占用：`netstat -an | grep 5432`
3. 查看数据库日志：`docker-compose logs postgres`
4. 验证环境变量：确保 `.env` 文件中的配置正确

### 应用启动失败

1. 检查数据库是否可访问
2. 验证 `application-prod.yml` 中的数据库连接配置
3. 查看应用日志：`logs/springboot-schema.log`
4. 确认Java版本：`java -version`（需要Java 21+）

### 数据初始化问题

如果数据未正确初始化：

1. 删除数据卷并重新创建：
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

2. 手动执行SQL脚本：
   ```bash
   docker exec -i fitness_gym_postgres psql -U postgres fitness_gym < springboot1ngh61a2/src/main/resources/schema-postgresql.sql
   docker exec -i fitness_gym_postgres psql -U postgres fitness_gym < springboot1ngh61a2/src/main/resources/data.sql
   ```

## 安全建议

1. **生产环境必须修改默认密码**
   - 修改 `.env` 文件中的 `POSTGRES_PASSWORD` 和 `DB_PASSWORD`
   - 使用强密码（至少16个字符，包含大小写字母、数字和特殊字符）

2. **限制数据库访问**
   - 生产环境建议移除端口映射或使用防火墙限制访问
   - 仅允许应用服务器访问数据库

3. **定期备份**
   - 设置定期数据库备份任务
   - 将备份存储在安全的位置

4. **监控和日志**
   - 定期检查应用日志
   - 监控数据库性能指标

## 性能优化

### 数据库连接池

根据实际负载调整 `application-prod.yml` 中的连接池参数：

```yaml
hikari:
  minimum-idle: 10        # 最小空闲连接数
  maximum-pool-size: 50   # 最大连接池大小
```

### JVM参数

生产环境建议添加JVM参数：

```bash
java -Xms512m -Xmx2048m -XX:+UseG1GC -jar your-app.jar --spring.profiles.active=prod
```

---

## 生产环境最佳实践

### 1. 环境隔离

#### 部署环境分离

```bash
# 开发环境
export SPRING_PROFILES_ACTIVE=dev
export DB_HOST=dev-db.example.com

# 测试环境
export SPRING_PROFILES_ACTIVE=test
export DB_HOST=test-db.example.com

# 生产环境
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=prod-db.example.com
```

#### 多环境配置

创建不同环境的配置文件：

```
springboot1ngh61a2/src/main/resources/
├── application.yml          # 公共配置
├── application-dev.yml      # 开发环境
├── application-test.yml     # 测试环境
└── application-prod.yml     # 生产环境
```

### 2. 资源管理

#### CPU和内存分配

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
    environment:
      JAVA_OPTS: >
        -Xms2g -Xmx4g
        -XX:+UseG1GC
        -XX:MaxGCPauseMillis=200
```

#### 存储优化

```yaml
# 使用SSD存储卷
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /ssd/postgres

  backend_logs:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /ssd/logs
```

### 3. 网络配置

#### 反向代理配置

使用Nginx作为反向代理：

```nginx
# nginx.conf
upstream backend {
    server backend1:8080 weight=1;
    server backend2:8080 weight=1;
}

server {
    listen 80;
    server_name your-domain.com;

    # SSL配置
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API代理
    location /springboot1ngh61a2/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时配置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. 日志和监控

#### 集中日志管理

```yaml
# docker-compose.prod.yml
services:
  backend:
    logging:
      driver: "syslog"
      options:
        syslog-address: "tcp://log-server:514"
        tag: "fitness-gym-backend"
```

#### 监控集成

```yaml
# 集成Prometheus监控
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
```

---

## 安全加固

### 1. 网络安全

#### 防火墙配置

```bash
# UFW防火墙规则
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 只开放必要端口
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 22/tcp      # SSH

# 拒绝直接访问数据库端口
sudo ufw deny 5432/tcp

sudo ufw enable
```

#### 网络隔离

```yaml
# docker-compose.prod.yml
networks:
  frontend:
    driver: bridge
    internal: false
  backend:
    driver: bridge
    internal: true  # 内部网络，只允许容器间通信

services:
  nginx:
    networks:
      - frontend

  backend:
    networks:
      - frontend
      - backend

  postgres:
    networks:
      - backend

  minio:
    networks:
      - backend
```

### 2. 应用安全

#### 安全头配置

```java
@Configuration
public class SecurityConfig {

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("https://your-domain.com");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(0);
        return bean;
    }
}
```

#### 密码安全

```yaml
# application-prod.yml
spring:
  security:
    user:
      password: ${ADMIN_PASSWORD}  # 使用环境变量

# 密码复杂度要求
password:
  policy:
    min-length: 12
    require-uppercase: true
    require-lowercase: true
    require-digits: true
    require-special: true
```

### 3. 数据安全

#### 数据库加密

```sql
-- 启用数据加密
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 创建加密函数
CREATE OR REPLACE FUNCTION encrypt_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(password::bytea, 'your-encryption-key', 'aes'), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrypt_password(encrypted_password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN decrypt(decode(encrypted_password, 'hex'), 'your-encryption-key', 'aes')::text;
END;
$$ LANGUAGE plpgsql;
```

#### 备份加密

```bash
# 加密备份文件
openssl enc -aes-256-cbc -salt -in backup.sql -out backup.sql.enc -k $BACKUP_ENCRYPTION_KEY

# 解密恢复
openssl enc -d -aes-256-cbc -in backup.sql.enc -out backup.sql -k $BACKUP_ENCRYPTION_KEY
```

### 4. 访问控制

#### SSH安全加固

```bash
# 禁用root登录
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# 使用密钥认证
ssh-keygen -t rsa -b 4096
ssh-copy-id user@server

# 禁用密码认证
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

sudo systemctl restart sshd
```

#### 数据库访问控制

```sql
-- 创建只读用户
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE fitness_gym TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- 创建应用用户（最小权限）
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE fitness_gym TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
-- 只授予必要的表权限
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON courses TO app_user;
```

---

## 高可用方案

### 1. 负载均衡

#### 多实例部署

```yaml
# docker-compose.prod.yml
services:
  backend-1:
    image: fitness_gym_backend:latest
    environment:
      INSTANCE_ID: 1
      DB_HOST: postgres-primary
    deploy:
      replicas: 1

  backend-2:
    image: fitness_gym_backend:latest
    environment:
      INSTANCE_ID: 2
      DB_HOST: postgres-primary
    deploy:
      replicas: 1

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx-load-balancer.conf:/etc/nginx/nginx.conf
```

#### Nginx负载均衡配置

```nginx
# nginx-load-balancer.conf
upstream backend_cluster {
    server backend-1:8080 weight=1 max_fails=3 fail_timeout=30s;
    server backend-2:8080 weight=1 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend_cluster;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }
}
```

### 2. 数据库高可用

#### PostgreSQL主从复制

```yaml
# 主库配置
services:
  postgres-primary:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: fitness_gym
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "-E UTF8 --locale=C"
    volumes:
      - ./postgres-primary.conf:/etc/postgresql/postgresql.conf
    command:
      - "postgres"
      - "-c"
      - "config_file=/etc/postgresql/postgresql.conf"

  postgres-replica:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: fitness_gym
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./postgres-replica.conf:/etc/postgresql/postgresql.conf
    command:
      - "postgres"
      - "-c"
      - "config_file=/etc/postgresql/postgresql.conf"
    depends_on:
      - postgres-primary
```

#### 主从配置文件

```ini
# postgres-primary.conf
wal_level = replica
max_wal_senders = 3
wal_keep_segments = 64
hot_standby = on
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'
```

```ini
# postgres-replica.conf
hot_standby = on
primary_conninfo = 'host=postgres-primary port=5432 user=postgres password=your_password'
```

### 3. 故障转移

#### 自动故障转移脚本

```bash
#!/bin/bash
# failover.sh

PRIMARY_HOST="postgres-primary"
REPLICA_HOST="postgres-replica"
CHECK_INTERVAL=30

while true; do
    # 检查主库状态
    if ! pg_isready -h $PRIMARY_HOST -p 5432 >/dev/null 2>&1; then
        echo "$(date): Primary database is down, initiating failover"

        # 提升从库为主库
        ssh $REPLICA_HOST "pg_ctl promote -D /var/lib/postgresql/data"

        # 更新应用配置指向新主库
        update_app_config $REPLICA_HOST

        # 发送告警
        alert_team "Database failover completed: $REPLICA_HOST is now primary"

        break
    fi

    sleep $CHECK_INTERVAL
done
```

### 4. 存储高可用

#### MinIO分布式部署

```yaml
services:
  minio-1:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    command: server /data --console-address ":9001"
    volumes:
      - minio1_data:/data

  minio-2:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    command: server /data --console-address ":9001"
    volumes:
      - minio2_data:/data

  minio-3:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    command: server /data --console-address ":9001"
    volumes:
      - minio3_data:/data

  nginx-minio:
    image: nginx:latest
    volumes:
      - ./nginx-minio.conf:/etc/nginx/nginx.conf
    ports:
      - "9000:9000"
```

---

## 回滚流程

### 1. 应用回滚

#### 蓝绿部署回滚

```bash
#!/bin/bash
# rollback-blue-green.sh

# 切换回旧版本
kubectl set image deployment/fitness-gym-backend backend=fitness-gym-backend:v1.0.0

# 等待部署完成
kubectl rollout status deployment/fitness-gym-backend

# 验证回滚成功
curl -f http://your-app/health || exit 1

echo "Rollback completed successfully"
```

#### Docker镜像回滚

```bash
#!/bin/bash
# rollback-docker.sh

# 查看可用镜像
docker images fitness_gym_backend --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}"

# 选择要回滚的版本
ROLLBACK_TAG="v1.0.0"

# 更新docker-compose.yml中的镜像版本
sed -i "s/fitness_gym_backend:.*/fitness_gym_backend:$ROLLBACK_TAG/" docker-compose.yml

# 重新部署
docker-compose up -d backend

# 验证回滚
docker-compose ps backend
curl -f http://localhost:8080/springboot1ngh61a2/user/login || exit 1

echo "Docker rollback completed: $ROLLBACK_TAG"
```

### 2. 数据库回滚

#### 使用备份恢复

```bash
#!/bin/bash
# rollback-database.sh

BACKUP_FILE=$1  # 指定备份文件

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file>"
    exit 1
fi

echo "Starting database rollback to: $BACKUP_FILE"

# 停止应用
docker-compose stop backend

# 备份当前状态（以防万一）
docker-compose exec postgres pg_dump -U postgres fitness_gym > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复到指定备份
cat $BACKUP_FILE | docker-compose exec -T postgres psql -U postgres -d fitness_gym

# 重启应用
docker-compose start backend

# 验证恢复
docker-compose exec postgres psql -U postgres -d fitness_gym -c "SELECT COUNT(*) FROM users;"

echo "Database rollback completed"
```

#### 基于事务的回滚

```sql
-- 如果有具体的回滚脚本
BEGIN;

-- 回滚数据更改
UPDATE users SET status = 'ACTIVE' WHERE id IN (
    SELECT user_id FROM rollback_list
);

-- 回滚配置更改
UPDATE system_config SET value = 'old_value' WHERE key = 'some_config';

-- 删除错误插入的数据
DELETE FROM courses WHERE created_at > '2024-01-15 10:00:00';

COMMIT;

-- 记录回滚操作
INSERT INTO rollback_log (operation, timestamp, reason)
VALUES ('manual_rollback', NOW(), 'Fix data corruption issue');
```

### 3. 配置回滚

#### 配置文件回滚

```bash
#!/bin/bash
# rollback-config.sh

# 从Git恢复配置文件
git checkout HEAD~1 -- .env docker-compose.yml

# 或者从备份恢复
cp .env.backup .env
cp docker-compose.yml.backup docker-compose.yml

# 重新加载配置
docker-compose up -d

echo "Configuration rollback completed"
```

### 4. 回滚验证

#### 自动化验证脚本

```bash
#!/bin/bash
# verify-rollback.sh

echo "=== 回滚验证检查 ==="

# 1. 检查应用健康
if ! curl -f -s http://localhost:8080/springboot1ngh61a2/user/login >/dev/null; then
    echo "❌ 应用健康检查失败"
    exit 1
fi

# 2. 检查数据库连接
if ! docker-compose exec -T postgres pg_isready -U postgres -d fitness_gym >/dev/null; then
    echo "❌ 数据库连接检查失败"
    exit 1
fi

# 3. 检查数据完整性
USER_COUNT=$(docker-compose exec postgres psql -U postgres -d fitness_gym -t -c "SELECT COUNT(*) FROM users;")
if [ "$USER_COUNT" -lt 1 ]; then
    echo "❌ 数据完整性检查失败"
    exit 1
fi

# 4. 检查关键功能
if ! curl -f -s "http://localhost:8080/springboot1ngh61a2/api/courses" >/dev/null; then
    echo "❌ API功能检查失败"
    exit 1
fi

echo "✅ 回滚验证通过"
```

### 5. 回滚流程管理

#### 回滚决策流程

```
问题发现
    ↓
评估影响范围
    ↓
确定回滚范围（应用/数据库/配置）
    ↓
准备回滚计划
    ↓
通知相关方
    ↓
执行回滚
    ↓
验证回滚结果
    ↓
监控系统稳定
    ↓
总结经验教训
```

#### 回滚记录模板

```markdown
# 回滚记录

## 基本信息
- **回滚ID**: ROLLBACK-2024-001
- **执行时间**: 2024-01-15 14:30:00
- **执行人**: 系统管理员
- **回滚原因**: 版本 v1.1.0 存在数据兼容性问题

## 回滚范围
- [x] 应用服务 (backend:v1.1.0 → backend:v1.0.0)
- [x] 数据库 (回滚特定数据更改)
- [ ] 配置文件 (无需回滚)

## 执行步骤
1. 停止应用服务
2. 切换应用镜像版本
3. 执行数据库回滚脚本
4. 重启应用服务
5. 执行验证检查

## 验证结果
- [x] 应用启动正常
- [x] 数据库连接正常
- [x] 数据完整性正常
- [x] API功能正常

## 后续措施
- 修复版本 v1.1.0 的兼容性问题
- 加强回归测试覆盖
- 更新部署流程文档

## 经验教训
- 发布前应进行更完整的兼容性测试
- 准备更详细的回滚预案
- 考虑使用金丝雀发布策略
```

