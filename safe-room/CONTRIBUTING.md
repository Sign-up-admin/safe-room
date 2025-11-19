## 贡献指南

欢迎提交 Issue、改进文档或贡献代码。为保持仓库一致性，请遵循以下约定。

### 1. 提交流程

1. Fork 仓库并创建特性分支：`git checkout -b feat/<topic>`
2. 完成开发与本地验证
3. 运行必要的检查与测试
4. 提交 Pull Request，并在描述中关联 Issue、说明变更

### 2. 代码规范

- **前端**：执行 `npm run check:all:fix`（分别在 front/admin 目录）
- **后端**：执行 `mvn test`，确保 JaCoCo 通过阈值
- 提交信息使用英文短句：`feat: add course filter`
- 避免提交 `node_modules`、`target` 等编译产物

### 3. Pull Request 要求

- 描述：包含动机、关键改动、测试情况
- 检查列表：
  - [ ] 相关文档已更新（如 README、docs/*）
  - [ ] 添加/更新测试
  - [ ] 通过本地 lint & test
- 若改动涉及数据库，请附 SQL 迁移/说明

### 4. Issue 模板

| 类型 | 需包含信息 |
| --- | --- |
| Bug | 复现步骤、期望结果、实际结果、日志/截图 |
| Feature | 背景、目标、验收标准、影响范围 |
| 文档 | 需要更新的文件、建议内容 |

### 5. 文档要求

- 新增工程/需求文档请在 `docs/README.md` 中登记
- 需求文档命名遵循 `模块名称_REQUIREMENTS.md`
- 引用其他文档时使用相对路径，便于跳转

### 6. 发布流程（建议）

1. 合并主分支最新代码
2. 更新 `CHANGELOG.md`
3. 打标签：`git tag vX.Y.Z && git push origin vX.Y.Z`

### 7. 开源贡献

欢迎所有形式的贡献。

#### 7.1 贡献类型

- **代码贡献**：修复 Bug、添加新功能、优化代码
- **文档贡献**：改进文档、翻译、添加示例
- **测试贡献**：编写测试用例、提高测试覆盖率
- **问题反馈**：报告 Bug、提出功能建议

#### 7.2 贡献流程

1. Fork 本项目到您的 GitHub 账号
2. 克隆您的 Fork 到本地：`git clone https://github.com/your-username/safe-room.git`
3. 创建特性分支：`git checkout -b feat/your-feature-name`
4. 进行开发和测试
5. 提交更改：`git commit -m 'feat: add your feature'`
6. 推送到您的 Fork：`git push origin feat/your-feature-name`
7. 在 GitHub 上创建 Pull Request

#### 7.3 代码规范

- 遵循项目的代码风格和规范
- 确保所有测试通过
- 添加必要的测试用例
- 更新相关文档

#### 7.4 贡献者致谢

所有贡献者将被记录在 [CONTRIBUTORS.md](CONTRIBUTORS.md) 中。

更多开源信息请查看 [docs/OPEN_SOURCE.md](docs/OPEN_SOURCE.md)。

### 8. 法律与合规

在贡献代码时，请确保：

- 您拥有提交代码的合法权利
- 代码不侵犯任何第三方的知识产权
- 遵守项目的使用条款和隐私政策

如有疑问，可在 Issue 中 @维护者 或通过团队协作渠道沟通。谢谢你的贡献！

