---
title: TESTING
version: v1.0.0
last_updated: 2025-11-16
status: active
category: development
tags: [testing, validation, guide, database, api]
---

# 测试验证指南

> 相关参考：`docs/DEVELOPMENT.md`（开发流程）、`docs/API.md`（接口列表）、`docs/TESTING_STRATEGY.md`（测试策略）、`docs/TESTING_IMPLEMENTATION.md`（测试实现）、`docs/TESTING_BEST_PRACTICES.md`（测试最佳实践）、`docs/TESTING_EXAMPLES.md`（测试示例）、`BACKEND_AUTOMATION.md`（后端自动化覆盖率）。更多文档见 `docs/README.md`。

## 1. 数据库初始化验证

### 启动数据库容器

```bash
# Windows PowerShell
.\start-db.ps1

# Linux/Mac
chmod +x start-db.sh
./start-db.sh

# 或直接使用 docker-compose
docker-compose up -d
```

### 验证数据库表结构

连接到数据库容器：

```bash
docker exec -it fitness_gym_postgres psql -U postgres -d fitness_gym
```

执行以下SQL验证表是否存在：

```sql
-- 列出所有表
\dt

-- 验证关键表
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 应该看到以下表：
-- chat, config, daoqitixing, discussjianshenkecheng, huiyuanka,
-- huiyuankagoumai, huiyuanxufei, jianshenjiaolian, jianshenkecheng,
-- jianshenqicai, kechengleixing, kechengtuike, kechengyuyue,
-- news, newstype, sijiaoyuyue, storeup, token, users, yonghu
```

### 验证初始数据

```sql
-- 检查config表数据
SELECT * FROM config;

-- 应该看到3条记录：
-- 1. picture1
-- 2. picture2  
-- 3. systemName

-- 检查users表数据
SELECT * FROM users;

-- 应该看到管理员账户：
-- username: admin, password: admin

-- 检查其他表数据
SELECT COUNT(*) FROM kechengleixing;
SELECT COUNT(*) FROM jianshenjiaolian;
SELECT COUNT(*) FROM jianshenkecheng;
SELECT COUNT(*) FROM yonghu;
SELECT COUNT(*) FROM news;
```

## 2. 后端应用验证

### 启动应用

```bash
cd springboot1ngh61a2

# 开发环境
mvn spring-boot:run

# 生产环境
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### 验证应用启动

检查日志中是否有以下信息：
- "Started SpringbootSchemaApplication"
- 数据库连接成功
- 没有异常错误

### 测试API端点

#### 测试用户登录（管理员）

```bash
# 使用curl测试
curl -X POST "http://localhost:8080/springboot1ngh61a2/users/login" \
  -d "username=admin&password=admin"

# 应该返回JSON，包含token字段
```

#### 测试用户登录（普通用户）

```bash
curl -X POST "http://localhost:8080/springboot1ngh61a2/yonghu/login" \
  -d "username=user01&password=123456"
```

#### 测试异常处理

测试不存在的端点：

```bash
curl "http://localhost:8080/springboot1ngh61a2/nonexistent"

# 应该返回统一的错误格式：
# {"code":404,"msg":"Not Found"}
```

## 3. 数据库连接池验证

### 检查连接池配置

应用启动后，查看日志确认HikariCP配置：

```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
```

### 监控连接池

可以通过JMX或日志监控连接池状态。在application.yml中已配置：
- minimum-idle: 5
- maximum-pool-size: 20

## 4. 全局异常处理验证

### 测试各种异常场景

#### SQL异常测试

尝试访问不存在的资源（需要先登录获取token）：

```bash
# 先登录获取token
TOKEN=$(curl -X POST "http://localhost:8080/springboot1ngh61a2/users/login" \
  -d "username=admin&password=admin" | jq -r '.token')

# 使用无效ID访问资源
curl -H "Token: $TOKEN" \
  "http://localhost:8080/springboot1ngh61a2/yonghu/info/999999999"
```

#### 参数验证异常

测试缺少必需参数：

```bash
curl -X POST "http://localhost:8080/springboot1ngh61a2/users/register" \
  -H "Content-Type: application/json" \
  -d "{}"
```

所有异常应该返回统一的格式：
```json
{
  "code": 500,
  "msg": "错误信息"
}
```

## 5. Docker配置验证

### 验证容器健康状态

```bash
docker ps

# 应该看到fitness_gym_postgres容器状态为"healthy"
```

### 验证数据持久化

```bash
# 停止容器
docker-compose down

# 重新启动
docker-compose up -d

# 验证数据是否还在
docker exec -it fitness_gym_postgres psql -U postgres -d fitness_gym -c "SELECT COUNT(*) FROM config;"
```

### 验证环境变量

```bash
# 检查容器环境变量
docker exec fitness_gym_postgres env | grep POSTGRES
```

## 6. 生产环境配置验证

### 使用生产配置启动

```bash
export SPRING_PROFILES_ACTIVE=prod
mvn spring-boot:run
```

### 验证环境变量加载

检查日志确认：
- 数据库连接使用环境变量中的值
- 连接池配置使用生产环境参数（min-idle: 10, max-size: 50）

### 验证日志配置

检查日志文件是否创建：

```bash
ls -la logs/springboot-schema.log
```

## 7. 完整功能测试清单

- [ ] 数据库容器成功启动
- [ ] 所有表结构正确创建
- [ ] 初始数据正确插入
- [ ] 应用成功启动并连接数据库
- [ ] 管理员登录功能正常
- [ ] 普通用户登录功能正常
- [ ] 异常处理返回统一格式
- [ ] 数据库连接池正常工作
- [ ] Docker数据持久化正常
- [ ] 生产环境配置正确加载
- [ ] 日志文件正常生成

## 8. 常见问题排查

### 问题：数据库连接失败

**解决方案：**
1. 检查Docker容器是否运行：`docker ps`
2. 检查端口是否被占用：`netstat -an | grep 5432`
3. 验证.env文件中的数据库配置
4. 检查防火墙设置

### 问题：数据未初始化

**解决方案：**
1. 删除数据卷重新创建：`docker-compose down -v && docker-compose up -d`
2. 检查挂载的SQL文件路径是否正确
3. 查看容器日志：`docker-compose logs postgres`

### 问题：应用启动失败

**解决方案：**
1. 检查Java版本：`java -version`（需要Java 21+）
2. 检查数据库是否可访问
3. 查看应用日志：`logs/springboot-schema.log`
4. 验证配置文件语法
 
## 9. 后端自动化调试执行方式

1. **初始化 H2 测试库**  
   测试框架会在每个用例前自动运行 `test-schema.sql` 和 `test-data.sql`，无需人工干预。

2. **运行完整后端自动化调试**  
   ```bash
   cd springboot1ngh61a2
   mvn test
   ```
   该命令会执行：
   - 所有控制器 `MockMvc` 集成测试（基于 `AbstractControllerIntegrationTest`）
   - 所有 service/dao 单元测试
   - JaCoCo 覆盖率检查（要求行覆盖率 ≥ 60%，分支覆盖率 ≥ 50%，指令覆盖率 ≥ 60%）
   - 文件/错误上报等基础能力（`FileControllerTest`、`ErrorReportControllerTest`、`CommonControllerTest`）
   - 全量 23 个业务控制器（chat → storeup）与 24 个 service 层实现（会员、课程、预约、提醒、系统配置等）
   - 边界条件测试（null参数、空集合、无效参数、异常场景）
   - 分支覆盖测试（条件判断、参数验证）

3. **查看覆盖率报告**  
   测试完成后可在 `springboot1ngh61a2/target/site/jacoco/index.html` 打开浏览器查看详情。

4. **CI 集成建议**  
   在 CI（例如 GitHub Actions）中添加步骤：
   ```bash
   mvn --batch-mode test
   ```
   若覆盖率低于阈值或测试失败，构建会直接失败。

5. **调试单个模块**  
   通过 `-Dtest=ClassNameTest` 运行指定测试，例如：
   ```bash
   mvn test -Dtest=JianshenkechengControllerTest
   ```

### 问题：异常处理不工作

**解决方案：**
1. 确认GlobalExceptionHandler类在正确的包路径
2. 检查@RestControllerAdvice注解
3. 查看应用启动日志确认类被加载

## 10. 前端自动化测试执行方式

### 环境准备

1. **安装依赖**
```bash
# 根目录安装前端测试依赖
npm install

# 前端项目目录安装依赖
cd springboot1ngh61a2/src/main/resources/front/front
npm install

cd ../admin/admin
npm install
```

2. **安装Playwright浏览器**（E2E测试需要）
```bash
# 在前端项目目录下
npx playwright install
```

### 测试执行命令

#### 使用自动化脚本（推荐）

```powershell
# Windows PowerShell - 运行所有前端测试
.\run-frontend-tests.ps1

# 运行单元测试
.\run-frontend-tests.ps1 -Type unit

# 运行E2E测试
.\run-frontend-tests.ps1 -Type e2e

# 只运行前端应用测试
.\run-frontend-tests.ps1 -App front

# 只运行后台应用测试
.\run-frontend-tests.ps1 -App admin

# Watch模式（开发时）
.\run-frontend-tests.ps1 -Type unit -Watch

# UI模式（可视化界面）
.\run-frontend-tests.ps1 -Type unit -UI
.\run-frontend-tests.ps1 -Type e2e -UI

# Debug模式（E2E测试）
.\run-frontend-tests.ps1 -Type e2e -Debug
```

#### 使用npm脚本

```bash
# 根目录运行
npm run test:unit          # 所有单元测试
npm run test:e2e           # 所有E2E测试
npm run test:unit:front    # 前端单元测试
npm run test:unit:admin    # 后台单元测试
npm run test:e2e:front     # 前端E2E测试
npm run test:e2e:admin     # 后台E2E测试
npm run coverage           # 所有覆盖率测试
npm run coverage:front     # 前端覆盖率
npm run coverage:admin     # 后台覆盖率
```

#### 项目目录下运行

```bash
# 前端项目
cd springboot1ngh61a2/src/main/resources/front/front
npm run test:unit          # 单元测试
npm run test:coverage      # 覆盖率测试
npm run test:e2e           # E2E测试
npm run test:unit:watch    # Watch模式
npm run test:unit:ui       # UI模式

# 后台项目
cd springboot1ngh61a2/src/main/resources/admin/admin
npm run test:unit          # 单元测试
npm run test:coverage      # 覆盖率测试
npm run test:e2e           # E2E测试
```

### 测试覆盖率

> 📖 **详细指南**: 有关前端测试覆盖率的完整方法，请参考 [`FRONTEND_COVERAGE_METHODS.md`](FRONTEND_COVERAGE_METHODS.md)

#### 查看覆盖率报告

```bash
# 生成覆盖率报告
npm run coverage:report

# 查看HTML报告
# Windows: start coverage/index.html
# 或在浏览器中打开 coverage/index.html
```

#### 覆盖率阈值

- **前端单元测试**: 行覆盖率 ≥30%, 函数覆盖率 ≥30%, 分支覆盖率 ≥25%, 语句覆盖率 ≥30%
- **后台单元测试**: 行覆盖率 ≥80%, 函数覆盖率 ≥80%, 分支覆盖率 ≥70%, 语句覆盖率 ≥80%
- **长期目标**: 前端 ≥80%, 后端 ≥80%

### 故障排查

#### 问题：依赖未安装

**错误**: `Cannot find module 'vitest'`

**解决**:
```bash
cd springboot1ngh61a2/src/main/resources/front/front
npm install
```

#### 问题：Playwright浏览器未安装

**错误**: `browserType.launch: Executable doesn't exist`

**解决**:
```bash
npx playwright install
```

#### 问题：端口冲突

**错误**: `Port 8080 is already in use`

**解决**:
```bash
# 检查端口占用
netstat -ano | findstr :8080
# 或修改应用端口
```

#### 问题：测试超时

**错误**: `Test timeout of 5000ms exceeded`

**解决**:
```typescript
// vitest.config.ts 中调整超时时间
test: {
  timeout: 10000,  // 10秒
}
```

### CI/CD集成

#### GitHub Actions配置

项目已配置GitHub Actions自动运行测试：

```yaml
# .github/workflows/frontend-test-coverage.yml
name: Frontend Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run frontend tests
        run: npm run test:unit

      - name: Run admin tests
        run: npm run test:unit:admin

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 12. 测试辅助工具

### ServiceTestHelper
提供通用的测试数据构建方法：
- `createPageParams(int page, int limit)`: 创建基本分页参数
- `createPageParamsWithFilter(...)`: 创建带过滤条件的分页参数
- `createValueStatParams(...)`: 创建统计查询参数
- `createTimeStatParams(...)`: 创建时间统计查询参数
- `createGroupParams(...)`: 创建分组查询参数

### ExceptionTestHelper
提供异常场景测试的通用方法：
- `assertThrowsException(...)`: 验证异常被抛出
- `assertNoExceptionOrHandledGracefully(...)`: 验证操作不抛异常或优雅处理
- `assertReturnsNullOrThrowsException(...)`: 验证返回null或抛出异常

## 13. 覆盖率目标

当前覆盖率目标（2025-11-15更新）：
- **行覆盖率**: ≥60%（从50%提升）
- **分支覆盖率**: ≥50%（从40%提升）
- **指令覆盖率**: ≥60%（从50%提升）

这些目标通过以下方式实现：
1. 为所有Service方法添加null参数测试
2. 为所有条件分支添加测试覆盖
3. 添加边界条件和异常场景测试
4. 增强复杂业务逻辑的测试覆盖

## 14. 完整功能测试清单

- [ ] 数据库容器成功启动
- [ ] 所有表结构正确创建
- [ ] 初始数据正确插入
- [ ] 后端应用成功启动并连接数据库
- [ ] 前端应用成功启动
- [ ] 后台应用成功启动
- [ ] 管理员登录功能正常
- [ ] 普通用户登录功能正常
- [ ] 异常处理返回统一格式
- [ ] 数据库连接池正常工作
- [ ] Docker数据持久化正常
- [ ] 生产环境配置正确加载
- [ ] 日志文件正常生成
- [ ] 后端单元测试全部通过
- [ ] 前端单元测试全部通过
- [ ] 后端覆盖率达到目标
- [ ] 前端覆盖率达到目标
- [ ] E2E测试正常运行

## 15. 常见问题排查

### 问题：数据库连接失败

**解决方案：**
1. 检查Docker容器是否运行：`docker ps`
2. 检查端口是否被占用：`netstat -an | grep 5432`
3. 验证.env文件中的数据库配置
4. 检查防火墙设置

### 问题：前端测试失败

**解决方案：**
1. 确认依赖已安装：`npm install`
2. 检查Node.js版本：`node --version`（需要18+）
3. 清理缓存：`rm -rf node_modules && npm install`
4. 检查端口冲突：`lsof -i :8080`

### 问题：覆盖率不达标

**解决方案：**
1. 运行覆盖率报告：`npm run coverage:report`
2. 查看未覆盖的代码行
3. 为未覆盖的分支添加测试用例
4. 检查测试配置的排除规则

### 问题：CI/CD流水线失败

**解决方案：**
1. 检查GitHub Actions日志
2. 验证测试环境配置
3. 确认依赖缓存是否正确
4. 检查网络超时设置
