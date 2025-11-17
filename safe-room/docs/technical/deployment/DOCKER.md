---
title: DOCKER
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---
# Docker 实践指南

本指南介绍如何使用 Docker 对健身房综合管理系统进行本地开发与生产部署，包括镜像构建、环境配置、服务编排和常见问题排查。

## 架构概览

- **backend**：Spring Boot 3.3.5 应用，负责 API 与静态资源服务。
- **front / admin**：两个 Vue 3 + Vite 项目，通过多阶段构建结果打包进 Spring Boot 的静态资源目录。
- **postgres**：PostgreSQL 13 数据库，启动时自动导入 `schema-postgresql.sql` 与 `data.sql`。
- **网络**：容器间通过 `fitness_gym_network` 通信，外部只暴露 8080（API/前端）与 5432（数据库）端口。

## 前置要求

| 组件 | 版本 |
| --- | --- |
| Docker Engine | 24+ |
| Docker Compose | v2（内置于 Docker Desktop） |
| CPU/内存 | 4 vCPU / 8 GB RAM（建议） |

准备 `.env` 文件（可从 `.env.example` 复制）以覆盖默认环境变量。

## 关键文件

| 文件 | 说明 |
| --- | --- |
| `.dockerignore` | 构建上下文排除列表（node_modules、target、日志等） |
| `.env.example` | 环境变量模板 |
| `springboot1ngh61a2/Dockerfile` | Node + Maven + JRE 的多阶段构建 |
| `docker-compose.yml` | 定义 `backend` 与 `postgres` 服务 |

## 镜像构建

```bash
docker compose build backend
```

构建流程：
1. 在 Node 阶段分别安装并构建 front/admin。
2. 在 Maven 阶段将 dist 产物写回资源目录并执行 `mvn clean package -DskipTests`。
3. 在运行时阶段复制 JAR，安装 curl（供健康检查使用），暴露 8080 端口。

## 启动与停止

```bash
# 启动所有服务
docker compose up -d

# 查看运行情况
docker compose ps

# 进入日志
docker compose logs -f backend
docker compose logs -f postgres

# 停止服务
docker compose down

# 停止并清除数据卷（谨慎）
docker compose down -v
```

启动完成后访问：
- 前台/后台静态资源：`http://localhost:8080/springboot1ngh61a2/`
- API 示例：`http://localhost:8080/springboot1ngh61a2/user/login`

## 开发模式建议

1. **本地开发 + Docker 数据库**  
   - 手动运行 `mvn spring-boot:run` / `npm run dev`，仅启动 `postgres` 容器。  
   - 命令：`docker compose up -d postgres`

2. **全容器开发**  
   - 修改代码后运行 `docker compose build backend && docker compose up -d backend`。  
   - 可挂载源代码并在容器内执行 `mvn spring-boot:run`（需自定义 Compose 覆盖文件）。

## 生产部署建议

1. 设置安全的 `.env`：自定义数据库密码、连接池大小、`SERVER_PORT`、`JAVA_OPTS`。
2. 使用反向代理（Nginx/Traefik）终止 TLS 并转发到 `backend` 容器。
3. 配置持久化：
   - `postgres_data`：数据库数据。
   - `backend_logs`：后端日志，位于 `/app/logs`。
4. 监控健康检查：Compose 会轮询 `http://backend:8080/.../user/login`。
5. 备份策略：通过 `pg_dump` 定期导出数据库，或挂载备份脚本到 `postgres` 容器。

## 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| `backend` 构建失败 | 检查 `.dockerignore` 是否排除必要文件；确认 Node/Maven 依赖可用；查看 `docker compose build backend` 输出 |
| `backend` 无法连接数据库 | 确认 `.env` 中 `DB_HOST=postgres`；检查 `postgres` 日志和健康状态 |
| 端口占用 | 修改 `.env` 中的 `SERVER_PORT` 或 `POSTGRES_PORT`，再次 `docker compose up -d` |
| 数据未初始化 | 删除卷 `docker compose down -v` 并重启；或手动 `docker exec -i fitness_gym_postgres psql ... < schema-postgresql.sql` |
| 健康检查失败 | 容器内执行 `curl -v http://localhost:8080/springboot1ngh61a2/user/login`，检查应用日志 `/app/logs` |

## 最佳实践

- **构建缓存**：调整 `.dockerignore`，仅复制必要文件，缩小上下文。
- **多阶段优化**：前端与后端分阶段构建，最终镜像仅包含运行时依赖与可执行 JAR。
- **配置外部化**：所有敏感和环境相关配置通过 `.env` / Compose `environment` 提供。
- **日志与备份**：将 `backend_logs`、`postgres_data` 映射到宿主机或远程存储，便于集中管理。
- **安全**：生产环境务必修改默认密码、限制数据库端口访问、使用 TLS/反向代理。

按照以上步骤，即可在本地或生产环境中稳定地构建、启动与运维 Docker 化的健身房综合管理系统。

---

## 多环境部署

### 环境配置管理

#### 环境变量文件组织

```bash
# 项目根目录下的环境配置文件
.env.example        # 示例配置
.env.dev           # 开发环境
.env.test          # 测试环境
.env.prod          # 生产环境

# Docker Compose覆盖文件
docker-compose.yml          # 基础配置
docker-compose.dev.yml      # 开发环境覆盖
docker-compose.test.yml     # 测试环境覆盖
docker-compose.prod.yml     # 生产环境覆盖
```

#### 环境变量配置示例

```bash
# .env.dev - 开发环境
COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml
SPRING_PROFILES_ACTIVE=dev
DEBUG=true
POSTGRES_DB=fitness_gym_dev
POSTGRES_USER=dev_user
POSTGRES_PASSWORD=dev_password
SERVER_PORT=8080

# .env.test - 测试环境
COMPOSE_FILE=docker-compose.yml:docker-compose.test.yml
SPRING_PROFILES_ACTIVE=test
POSTGRES_DB=fitness_gym_test
POSTGRES_USER=test_user
POSTGRES_PASSWORD=test_password
SERVER_PORT=8081

# .env.prod - 生产环境
COMPOSE_FILE=docker-compose.yml:docker-compose.prod.yml
SPRING_PROFILES_ACTIVE=prod
POSTGRES_DB=fitness_gym_prod
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=${PROD_DB_PASSWORD}
SERVER_PORT=8080
```

#### 环境特定Docker Compose配置

```yaml
# docker-compose.dev.yml - 开发环境覆盖
services:
  backend:
    environment:
      JAVA_OPTS: -Xmx512m -Xms256m -Djava.security.egd=file:/dev/./urandom
    volumes:
      - ./springboot1ngh61a2:/app:cached  # 挂载源代码，支持热重载
    ports:
      - "8080:8080"
      - "5005:5005"  # 远程调试端口

  postgres:
    ports:
      - "5432:5432"  # 开发环境暴露数据库端口

  minio:
    ports:
      - "9000:9000"
      - "9001:9001"  # 开发环境暴露MinIO端口

# docker-compose.test.yml - 测试环境覆盖
services:
  backend:
    environment:
      JAVA_OPTS: -Xmx1g -Xms512m
    volumes:
      - ./test-results:/app/test-results  # 测试结果挂载

  postgres:
    environment:
      POSTGRES_DB: fitness_gym_test
    volumes:
      - postgres_test_data:/var/lib/postgresql/data  # 独立的测试数据库

# docker-compose.prod.yml - 生产环境覆盖
services:
  backend:
    environment:
      JAVA_OPTS: -Xmx4g -Xms2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"

  postgres:
    environment:
      POSTGRES_DB: fitness_gym_prod
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    logging:
      driver: "syslog"
      options:
        syslog-address: "tcp://log-server:514"
        tag: "fitness-gym-postgres"

  minio:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### 环境切换脚本

```bash
#!/bin/bash
# switch-environment.sh - 环境切换脚本

ENV=$1

if [ -z "$ENV" ]; then
    echo "Usage: $0 <dev|test|prod>"
    exit 1
fi

ENV_FILE=".env.$ENV"
if [ ! -f "$ENV_FILE" ]; then
    echo "Environment file $ENV_FILE not found"
    exit 1
fi

# 备份当前环境
if [ -f ".env" ]; then
    cp .env .env.backup
fi

# 切换环境
cp "$ENV_FILE" .env

echo "Switched to $ENV environment"

# 显示当前配置
echo "Current configuration:"
grep -E "^(COMPOSE_FILE|SPRING_PROFILES_ACTIVE|SERVER_PORT)=" .env

# 可选：重启服务
read -p "Restart services? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down
    docker-compose up -d
    docker-compose ps
fi
```

### 环境隔离最佳实践

#### 网络隔离

```yaml
# 不同环境的网络隔离
networks:
  dev_network:
    driver: bridge
    name: fitness_gym_dev
  test_network:
    driver: bridge
    name: fitness_gym_test
  prod_network:
    driver: bridge
    name: fitness_gym_prod
    internal: true  # 生产环境网络隔离
```

#### 数据隔离

```yaml
# 不同环境的独立数据卷
volumes:
  postgres_dev_data:
    name: fitness_gym_postgres_dev
  postgres_test_data:
    name: fitness_gym_postgres_test
  postgres_prod_data:
    name: fitness_gym_postgres_prod
  backend_dev_logs:
    name: fitness_gym_backend_dev_logs
  backend_prod_logs:
    name: fitness_gym_backend_prod_logs
```

---

## CI/CD集成

### GitHub Actions工作流

#### 完整的CI/CD流水线

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: fitness_gym_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up JDK 21
      uses: actions/setup-java@v4
      with:
        java-version: '21'
        distribution: 'temurin'
        cache: maven

    - name: Cache Maven dependencies
      uses: actions/cache@v3
      with:
        path: ~/.m2
        key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
        restore-keys: ${{ runner.os }}-m2

    - name: Run tests
      run: mvn test -Dspring.profiles.active=test

    - name: Generate test report
      uses: dorny/test-reporter@v1
      if: success() || failure()
      with:
        name: JUnit Tests
        path: '**/surefire-reports/*.xml'
        reporter: java-junit

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: ./springboot1ngh61a2
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy-dev:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: development

    steps:
    - name: Deploy to development
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.DEV_HOST }}
        username: ${{ secrets.DEV_USER }}
        key: ${{ secrets.DEV_KEY }}
        script: |
          cd /opt/fitness-gym
          git pull origin develop
          cp .env.dev .env
          docker-compose pull
          docker-compose up -d
          docker-compose ps

  deploy-prod:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.PROD_HOST }}
        username: ${{ secrets.PROD_USER }}
        key: ${{ secrets.PROD_KEY }}
        script: |
          cd /opt/fitness-gym
          git pull origin main
          cp .env.prod .env

          # 蓝绿部署
          docker-compose pull
          docker tag fitness_gym_backend:latest fitness_gym_backend:previous
          docker-compose up -d

          # 健康检查
          sleep 30
          if curl -f http://localhost:8080/springboot1ngh61a2/health; then
              echo "Deployment successful"
              # 清理旧镜像
              docker image prune -f
          else
              echo "Deployment failed, rolling back"
              docker tag fitness_gym_backend:previous fitness_gym_backend:latest
              docker-compose up -d
              exit 1
          fi
```

### Jenkins Pipeline

#### 声明式Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        IMAGE_NAME = 'fitness-gym-backend'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: env.BRANCH_NAME,
                    credentialsId: 'git-credentials',
                    url: 'https://github.com/your-org/fitness-gym.git'
            }
        }

        stage('Test') {
            agent {
                docker {
                    image 'maven:3.9.4-openjdk-21'
                    args '-v $HOME/.m2:/root/.m2'
                }
            }
            steps {
                sh 'mvn clean test -Dspring.profiles.active=test'
                junit '**/target/surefire-reports/*.xml'
            }
        }

        stage('Build') {
            steps {
                script {
                    // 使用Docker BuildKit
                    env.DOCKER_BUILDKIT = 1
                    env.COMPOSE_DOCKER_CLI_BUILD = 1

                    docker.build("${DOCKER_REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}")
                }
            }
        }

        stage('Security Scan') {
            steps {
                script {
                    // Trivy漏洞扫描
                    docker.image('aquasec/trivy:latest').inside("--entrypoint=''") {
                        sh "trivy image --exit-code 1 --no-progress ${DOCKER_REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}"
                    }
                }
            }
        }

        stage('Push') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'registry-credentials') {
                        def image = docker.image("${DOCKER_REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Dev') {
            when {
                branch 'develop'
            }
            steps {
                sshagent(['dev-server-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no user@dev-server << EOF
                        cd /opt/fitness-gym
                        sed -i "s/fitness_gym_backend:.*/fitness_gym_backend:${BUILD_NUMBER}/" docker-compose.yml
                        cp .env.dev .env
                        docker-compose pull
                        docker-compose up -d
                        docker-compose ps
EOF
                    '''
                }
            }
        }

        stage('Deploy to Prod') {
            when {
                branch 'main'
            }
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    input message: 'Deploy to production?', ok: 'Deploy'
                }

                sshagent(['prod-server-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no user@prod-server << EOF
                        cd /opt/fitness-gym
                        # 备份当前版本
                        docker tag fitness_gym_backend:latest fitness_gym_backend:backup-${BUILD_NUMBER}

                        # 更新镜像版本
                        sed -i "s/fitness_gym_backend:.*/fitness_gym_backend:${BUILD_NUMBER}/" docker-compose.yml
                        cp .env.prod .env

                        # 滚动更新
                        docker-compose up -d backend

                        # 等待健康检查
                        for i in {1..30}; do
                            if curl -f http://localhost:8080/springboot1ngh61a2/health >/dev/null 2>&1; then
                                echo "Health check passed"
                                exit 0
                            fi
                            sleep 10
                        done

                        echo "Health check failed, rolling back"
                        docker tag fitness_gym_backend:backup-${BUILD_NUMBER} fitness_gym_backend:latest
                        docker-compose up -d backend
                        exit 1
EOF
                    '''
                }
            }
        }
    }

    post {
        always {
            // 清理工作空间
            cleanWs()

            // 发送通知
            script {
                def color = currentBuild.result == 'SUCCESS' ? 'good' : 'danger'
                def message = "Pipeline ${currentBuild.fullDisplayName} - ${currentBuild.result}"

                slackSend(
                    color: color,
                    message: message,
                    channel: '#ci-cd'
                )
            }
        }

        failure {
            // 失败时发送详细通知
            emailext(
                subject: "Jenkins Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: '''${SCRIPT, template="groovy-html.template"}''',
                to: 'dev-team@example.com',
                attachLog: true
            )
        }
    }
}
```

### GitLab CI/CD

#### .gitlab-ci.yml

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - security
  - deploy

variables:
  DOCKER_HOST: tcp://docker:2376
  DOCKER_TLS_CERTDIR: "/certs"
  DOCKER_DRIVER: overlay2

test:
  stage: test
  image: maven:3.9.4-openjdk-21
  services:
    - postgres:16-alpine
  variables:
    POSTGRES_DB: fitness_gym_test
    POSTGRES_USER: test
    POSTGRES_PASSWORD: test
  script:
    - mvn clean test -Dspring.profiles.active=test
  artifacts:
    reports:
      junit: "**/target/surefire-reports/*.xml"
    expire_in: 1 week

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA ./springboot1ngh61a2
    - docker push $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
  only:
    - main
    - develop

security_scan:
  stage: security
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker pull $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
    - docker run --rm -v /var/run/docker.sock:/var/run/docker.sock
      aquasec/trivy:latest image --exit-code 1
      $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
  allow_failure: true

deploy_dev:
  stage: deploy
  script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan -H $DEV_HOST >> ~/.ssh/known_hosts
    - |
      ssh $DEV_USER@$DEV_HOST << EOF
        cd /opt/fitness-gym
        git pull origin develop
        sed -i "s|image:.*|image: $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA|" docker-compose.yml
        cp .env.dev .env
        docker-compose pull
        docker-compose up -d
        docker-compose ps
      EOF
  environment:
    name: development
    url: http://dev.fitness-gym.com
  only:
    - develop

deploy_prod:
  stage: deploy
  script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan -H $PROD_HOST >> ~/.ssh/known_hosts
    - |
      ssh $PROD_USER@$PROD_HOST << EOF
        cd /opt/fitness-gym

        # 备份当前部署
        cp docker-compose.yml docker-compose.yml.backup
        docker tag fitness_gym_backend:latest fitness_gym_backend:rollback-$CI_COMMIT_SHA

        # 部署新版本
        git pull origin main
        sed -i "s|image:.*|image: $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA|" docker-compose.yml
        cp .env.prod .env
        docker-compose pull
        docker-compose up -d

        # 健康检查
        sleep 30
        if curl -f http://localhost:8080/springboot1ngh61a2/health; then
            echo "部署成功"
            docker image prune -f
        else
            echo "部署失败，回滚"
            cp docker-compose.yml.backup docker-compose.yml
            docker tag fitness_gym_backend:rollback-$CI_COMMIT_SHA fitness_gym_backend:latest
            docker-compose up -d
            exit 1
        fi
      EOF
  environment:
    name: production
    url: https://fitness-gym.com
  when: manual
  only:
    - main
```

---

## 镜像管理最佳实践

### 镜像生命周期管理

#### 镜像版本策略

```bash
# 版本标签策略
# 主版本标签
docker tag fitness_gym_backend:latest fitness_gym_backend:v1.0.0

# 提交哈希标签
docker tag fitness_gym_backend:latest fitness_gym_backend:abc1234

# 分支标签
docker tag fitness_gym_backend:latest fitness_gym_backend:feature-user-auth

# 时间戳标签
docker tag fitness_gym_backend:latest fitness_gym_backend:20241116-143000
```

#### 镜像清理策略

```bash
#!/bin/bash
# docker-image-cleanup.sh

echo "=== Docker镜像清理 ==="

# 显示当前镜像
echo "当前镜像列表:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# 删除悬空镜像
echo "删除悬空镜像..."
docker image prune -f

# 删除特定时间前的镜像（保留最近30天的标签）
echo "清理旧镜像标签..."
docker images --format "{{.Repository}}:{{.Tag}}" | \
    grep "fitness_gym_backend:" | \
    while read image; do
        # 检查镜像创建时间
        created=$(docker inspect --format='{{.Created}}' "$image" 2>/dev/null)
        if [ $? -eq 0 ]; then
            created_timestamp=$(date -d "$created" +%s)
            thirty_days_ago=$(date -d '30 days ago' +%s)

            if [ $created_timestamp -lt $thirty_days_ago ]; then
                # 检查是否被容器使用
                if ! docker ps -a --format "{{.Image}}" | grep -q "^${image}$"; then
                    echo "删除旧镜像: $image"
                    docker rmi "$image"
                fi
            fi
        fi
    done

# 显示清理结果
echo "清理后的镜像列表:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# 显示磁盘使用情况
echo "Docker磁盘使用情况:"
docker system df
```

### 镜像分发策略

#### 私有镜像仓库

```yaml
# docker-compose.registry.yml
services:
  registry:
    image: registry:2.8
    ports:
      - "5000:5000"
    environment:
      REGISTRY_STORAGE_FILESYSTEM_ROOTDIRECTORY: /data
      REGISTRY_HTTP_TLS_CERTIFICATE: /certs/domain.crt
      REGISTRY_HTTP_TLS_KEY: /certs/domain.key
    volumes:
      - registry_data:/data
      - ./certs:/certs
    restart: unless-stopped

  registry-ui:
    image: joxit/docker-registry-ui:latest
    ports:
      - "8082:80"
    environment:
      REGISTRY_URL: https://registry:5000
      DELETE_IMAGES: true
    depends_on:
      - registry
```

#### 镜像推送脚本

```bash
#!/bin/bash
# push-images.sh

REGISTRY="your-registry.com:5000"
IMAGE_NAME="fitness-gym-backend"

# 登录镜像仓库
echo "$REGISTRY_PASSWORD" | docker login $REGISTRY -u $REGISTRY_USER --password-stdin

# 推送多标签镜像
tags=("latest" "$(date +%Y%m%d-%H%M%S)" "$GIT_COMMIT")

for tag in "${tags[@]}"; do
    echo "推送镜像: $REGISTRY/$IMAGE_NAME:$tag"

    # 添加标签
    docker tag $IMAGE_NAME:latest $REGISTRY/$IMAGE_NAME:$tag

    # 推送镜像
    docker push $REGISTRY/$IMAGE_NAME:$tag

    if [ $? -eq 0 ]; then
        echo "✅ 镜像推送成功: $REGISTRY/$IMAGE_NAME:$tag"
    else
        echo "❌ 镜像推送失败: $REGISTRY/$IMAGE_NAME:$tag"
        exit 1
    fi
done

# 清理本地标签（保留latest）
for tag in "${tags[@]:1}"; do
    docker rmi $REGISTRY/$IMAGE_NAME:$tag
done

echo "镜像推送完成"
```

### 镜像安全加固

#### 最小化基础镜像

```dockerfile
# 使用Distroless镜像
FROM gcr.io/distroless/java21-debian12:latest
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 镜像漏洞扫描

```bash
#!/bin/bash
# scan-image.sh

IMAGE=$1

if [ -z "$IMAGE" ]; then
    echo "Usage: $0 <image-name>"
    exit 1
fi

echo "扫描镜像漏洞: $IMAGE"

# 使用Trivy扫描
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy:latest image \
    --exit-code 1 \
    --no-progress \
    --format table \
    $IMAGE

# 使用Grype扫描
docker run --rm \
    anchore/grype:latest \
    $IMAGE \
    --fail-on high

echo "漏洞扫描完成"
```

#### 镜像签名

```bash
# 使用Cosign签名镜像
cosign sign --key cosign.key $IMAGE_NAME:latest

# 验证镜像签名
cosign verify --key cosign.pub $IMAGE_NAME:latest
```

### 性能监控

#### 镜像大小优化

```bash
# 分析镜像层大小
docker history $IMAGE_NAME:latest --format "table {{.Size}}\t{{.CreatedBy}}"

# 多阶段构建优化
docker build --target production -t $IMAGE_NAME:slim .

# 压缩镜像
docker save $IMAGE_NAME:latest | gzip > image.tar.gz

# 比较大小
ls -lh image.tar.gz
```

#### 运行时性能监控

```bash
# 监控容器性能
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# 查看容器资源使用详情
docker inspect $CONTAINER_NAME | jq '.State, .HostConfig'

# 监控镜像拉取性能
time docker pull $IMAGE_NAME:latest
```

---

## 高级配置

### 服务网格集成

#### 使用Istio进行服务治理

```yaml
# istio配置示例
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: fitness-gym-backend
spec:
  http:
  - match:
    - uri:
        prefix: "/springboot1ngh61a2"
    route:
    - destination:
        host: fitness-gym-backend
        subset: v1
  - match:
    - uri:
        prefix: "/api"
    route:
    - destination:
        host: fitness-gym-backend
        subset: v2
    retries:
      attempts: 3
      perTryTimeout: 2s
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: fitness-gym-backend
spec:
  host: fitness-gym-backend
  subsets:
  - name: v1
    labels:
      version: v1.0.0
  - name: v2
    labels:
      version: v1.1.0
```

### 容器编排扩展

#### Kubernetes部署

```yaml
# k8s-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fitness-gym-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fitness-gym-backend
  template:
    metadata:
      labels:
        app: fitness-gym-backend
    spec:
      containers:
      - name: backend
        image: fitness_gym_backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        resources:
          limits:
            cpu: "2"
            memory: "4Gi"
          requests:
            cpu: "500m"
            memory: "2Gi"
        livenessProbe:
          httpGet:
            path: /springboot1ngh61a2/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /springboot1ngh61a2/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
```

#### Docker Swarm集群

```bash
# 初始化Swarm集群
docker swarm init

# 部署服务栈
docker stack deploy -c docker-compose.swarm.yml fitness-gym

# 查看服务状态
docker stack services fitness-gym

# 扩展服务
docker service scale fitness-gym_backend=5
```

---

## 总结

通过实施多环境部署、CI/CD集成和镜像管理最佳实践，可以：

1. **提高部署效率**：自动化流水线减少手动操作
2. **确保部署质量**：通过测试和安全扫描保证代码质量
3. **降低部署风险**：蓝绿部署和回滚策略保障业务连续性
4. **优化资源使用**：镜像分层和缓存策略提升构建性能
5. **加强安全保障**：镜像扫描和签名保护系统安全

这些最佳实践为健身房综合管理系统提供了企业级的部署和运维能力。

