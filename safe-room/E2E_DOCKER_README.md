# 前端E2E测试 Docker运行指南

本指南说明如何在Docker环境中运行前端E2E测试，后端由您控制。

## 前置条件

1. 确保后端服务已启动并运行在 `http://localhost:8080`（或您指定的地址）
2. 确保前端服务已启动：
   - 用户端前端：`http://localhost:8082`
   - 管理端前端：`http://localhost:5173`
3. 确保Docker和Docker Compose已安装

## 运行E2E测试

### 运行用户端前端E2E测试

```bash
# 使用默认配置（后端在localhost:8080，前端在localhost:8082）
docker-compose --profile e2e up front-e2e

# 自定义后端和前端地址
BACKEND_URL=http://your-backend:8080 \
FRONT_E2E_BASE_URL=http://your-frontend:8082 \
docker-compose --profile e2e up front-e2e
```

### 运行管理端前端E2E测试

```bash
# 使用默认配置（后端在localhost:8080，前端在localhost:5173）
docker-compose --profile e2e up admin-e2e

# 自定义后端和前端地址
BACKEND_URL=http://your-backend:8080 \
ADMIN_E2E_BASE_URL=http://your-admin-frontend:5173 \
docker-compose --profile e2e up admin-e2e
```

### 同时运行两个测试

```bash
docker-compose --profile e2e up front-e2e admin-e2e
```

## 环境变量配置

可以通过环境变量自定义配置：

- `BACKEND_URL`: 后端API地址（默认: `http://host.docker.internal:8080`）
- `FRONT_E2E_BASE_URL`: 用户端前端地址（默认: `http://host.docker.internal:8082`）
- `ADMIN_E2E_BASE_URL`: 管理端前端地址（默认: `http://host.docker.internal:5173`）

## 查看测试报告

测试报告会保存在以下目录：

- 用户端测试报告: `./test-reports/front/`
- 管理端测试报告: `./test-reports/admin/`

## 注意事项

1. **网络连接**: Docker容器通过 `host.docker.internal` 访问宿主机上的服务。如果您的后端不在宿主机上，请修改 `BACKEND_URL` 环境变量。

2. **端口映射**: 确保后端和前端服务的端口已正确映射到宿主机。

3. **测试完成后**: 测试容器会在完成后自动退出，不会自动重启。

4. **重新构建**: 如果修改了测试代码或依赖，需要重新构建镜像：
   ```bash
   docker-compose --profile e2e build front-e2e
   docker-compose --profile e2e build admin-e2e
   ```

## 故障排除

### 无法连接到后端

如果测试无法连接到后端，请检查：

1. 后端服务是否正在运行
2. 后端地址是否正确（使用 `BACKEND_URL` 环境变量）
3. Docker网络配置是否正确

### 无法连接到前端

如果测试无法连接到前端，请检查：

1. 前端服务是否正在运行
2. 前端地址是否正确（使用 `FRONT_E2E_BASE_URL` 或 `ADMIN_E2E_BASE_URL` 环境变量）
3. 前端服务是否绑定到 `0.0.0.0` 而不是 `localhost`

### 查看测试日志

```bash
# 查看用户端测试日志
docker-compose --profile e2e logs front-e2e

# 查看管理端测试日志
docker-compose --profile e2e logs admin-e2e
```

