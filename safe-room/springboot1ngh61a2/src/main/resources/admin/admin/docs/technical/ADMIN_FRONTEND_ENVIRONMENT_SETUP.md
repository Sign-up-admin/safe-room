# Admin 前端开发环境详细配置指南

> 版本：v1.0
> 更新日期：2025-11-16
> 适用项目：`springboot1ngh61a2/src/main/resources/admin/admin`

---

## 目录

- [1. 概述](#1-概述)
- [2. 系统要求](#2-系统要求)
- [3. Windows 环境配置](#3-windows-环境配置)
- [4. macOS 环境配置](#4-macos-环境配置)
- [5. Linux 环境配置](#5-linux-环境配置)
- [6. 开发工具配置](#6-开发工具配置)
- [7. 项目初始化](#7-项目初始化)
- [8. 代码编辑器配置](#8-代码编辑器配置)
- [9. 数据库配置](#9-数据库配置)
- [10. 测试环境配置](#10-测试环境配置)
- [11. 常见问题](#11-常见问题)
- [12. 附录](#12-附录)

---

## 1. 概述

本文档提供 Admin 前端项目在不同操作系统下的详细开发环境配置指南，确保所有开发者都能快速搭建一致的开发环境。

### 1.1 环境组成

- **Node.js**: JavaScript 运行环境
- **npm/yarn**: 包管理工具
- **Git**: 版本控制
- **代码编辑器**: VS Code 推荐
- **数据库**: MySQL (后端需要)
- **浏览器**: Chrome/Firefox (开发调试)

### 1.2 配置检查清单

- [ ] Node.js >= 16.0.0
- [ ] npm >= 8.0.0 或 yarn >= 1.22.0
- [ ] Git >= 2.0.0
- [ ] 代码编辑器配置完成
- [ ] 项目依赖安装完成
- [ ] 开发服务器启动成功
- [ ] 数据库连接正常

---

## 2. 系统要求

### 2.1 硬件要求

| 组件 | 最低要求 | 推荐配置 |
|------|----------|----------|
| CPU | 双核 2.0GHz | 四核 3.0GHz+ |
| 内存 | 4GB | 8GB+ |
| 存储 | 10GB 可用空间 | 50GB SSD |
| 显示器 | 1366x768 | 1920x1080 |

### 2.2 软件要求

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 16.0.0 | LTS 版本推荐 |
| npm | >= 8.0.0 | 与 Node.js 捆绑 |
| Git | >= 2.0.0 | 版本控制 |
| MySQL | >= 5.7 | 数据库 (后端需要) |
| Chrome | >= 90 | 开发调试浏览器 |

---

## 3. Windows 环境配置

### 3.1 Node.js 安装

#### 方法1: 使用安装程序 (推荐)

1. **下载 Node.js**
   - 访问 [nodejs.org](https://nodejs.org/)
   - 下载 LTS 版本 (推荐 18.x 或 20.x)

2. **运行安装程序**
   ```bash
   # 以管理员身份运行 .msi 文件
   # 按照安装向导完成安装
   ```

3. **验证安装**
   ```bash
   node --version
   npm --version
   ```

#### 方法2: 使用 nvm-windows

1. **下载 nvm-windows**
   ```bash
   # 从 GitHub 下载最新版本
   # https://github.com/coreybutler/nvm-windows/releases
   ```

2. **安装并配置**
   ```bash
   # 安装完成后，打开 PowerShell
   nvm install 18.17.0
   nvm use 18.17.0
   nvm alias default 18.17.0
   ```

3. **验证**
   ```bash
   node --version  # 应显示 v18.17.0
   npm --version   # 应显示 9.x.x
   ```

### 3.2 Git 安装

1. **下载 Git**
   - 访问 [git-scm.com](https://git-scm.com/)
   - 下载 Windows 版本

2. **安装配置**
   ```bash
   # 运行安装程序，选择以下选项：
   # - Use Git from Git Bash only (推荐)
   # - Checkout Windows-style, commit Unix-style line endings
   # - Use Windows' default console window
   ```

3. **配置用户信息**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

4. **生成 SSH 密钥** (可选，用于 GitHub)
   ```bash
   ssh-keygen -t ed25519 -C "your.email@example.com"
   # 将公钥添加到 GitHub
   ```

### 3.3 开发工具配置

#### 3.3.1 PowerShell 配置

1. **启用脚本执行**
   ```powershell
   # 以管理员身份打开 PowerShell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **安装 Windows Terminal** (推荐)
   - 从 Microsoft Store 安装 Windows Terminal
   - 配置 PowerShell 作为默认 shell

#### 3.3.2 环境变量

确保以下路径在 `PATH` 环境变量中：
- `C:\Program Files\Node.js\`
- `C:\Program Files\Git\cmd\`
- `C:\Users\%USERNAME%\AppData\Roaming\npm`

### 3.4 项目初始化

```bash
# 克隆项目
git clone https://github.com/your-org/admin-frontend.git
cd admin-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

---

## 4. macOS 环境配置

### 4.1 Homebrew 安装

Homebrew 是 macOS 的包管理器，先安装它：

```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 添加到 PATH
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 4.2 Node.js 安装

#### 方法1: 使用 Homebrew (推荐)

```bash
# 安装 Node.js LTS
brew install node

# 验证安装
node --version
npm --version
```

#### 方法2: 使用 nvm

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell
source ~/.zshrc

# 安装并使用 Node.js
nvm install 18.17.0
nvm use 18.17.0
nvm alias default 18.17.0
```

### 4.3 Git 安装

```bash
# 使用 Homebrew 安装 Git
brew install git

# 配置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your.email@example.com"
```

### 4.4 开发工具

#### 4.4.1 iTerm2 (推荐终端)

```bash
# 安装 iTerm2
brew install --cask iterm2

# 配置 Zsh
# macOS 默认使用 Zsh，配置如下：
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### 4.4.2 其他工具

```bash
# 安装常用开发工具
brew install --cask visual-studio-code
brew install --cask google-chrome
brew install --cask firefox
```

### 4.5 项目初始化

```bash
# 克隆项目
git clone https://github.com/your-org/admin-frontend.git
cd admin-frontend

# 安装依赖
npm install

# 如果遇到权限问题
sudo chown -R $(whoami) ~/.npm

# 启动开发服务器
npm run dev
```

---

## 5. Linux 环境配置

### 5.1 Node.js 安装

#### Ubuntu/Debian

```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### CentOS/RHEL

```bash
# 使用 NodeSource 仓库
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node --version
npm --version
```

#### Arch Linux

```bash
# 使用 pacman
sudo pacman -S nodejs npm

# 验证安装
node --version
npm --version
```

### 5.2 Git 安装

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install git

# 配置
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### CentOS/RHEL

```bash
sudo yum install git

# 配置
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 5.3 开发工具

#### 5.3.1 安装 VS Code

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install software-properties-common apt-transport-https wget
wget -q https://packages.microsoft.com/keys/microsoft.asc -O- | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main"
sudo apt install code

# CentOS/RHEL
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
sudo yum install code
```

#### 5.3.2 安装 Chrome

```bash
# Ubuntu/Debian
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt update
sudo apt install google-chrome-stable

# CentOS/RHEL
sudo wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
sudo yum localinstall google-chrome-stable_current_x86_64.rpm
```

### 5.4 项目初始化

```bash
# 克隆项目
git clone https://github.com/your-org/admin-frontend.git
cd admin-frontend

# 安装依赖
npm install

# 如果遇到权限问题
sudo chown -R $USER:$(id -gn $USER) ~/.npm

# 启动开发服务器
npm run dev
```

---

## 6. 开发工具配置

### 6.1 VS Code 插件推荐

安装以下 VS Code 插件以获得最佳开发体验：

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "stylelint.vscode-stylelint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "vue.volar",
    "ms-vscode.vscode-css-peek",
    "zignd.html-css-class-completion",
    "ms-vscode-remote.remote-ssh",
    "ms-vscode-remote.remote-ssh-edit",
    "gruntfuggly.todo-tree",
    "ms-vscode.vscode-css-intellisense"
  ]
}
```

### 6.2 VS Code 设置

创建 `.vscode/settings.json`：

```json
{
  // TypeScript
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,

  // ESLint
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "eslint.codeAction.showDocumentation": {
    "enable": true
  },

  // Prettier
  "prettier.configPath": ".prettierrc",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,

  // Stylelint
  "stylelint.validate": ["css", "scss", "vue"],

  // Vue
  "vue.server.petiteVue.supportHtmlFile": false,

  // 文件关联
  "files.associations": {
    "*.vue": "vue"
  },

  // 排除文件
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true,
    "**/.DS_Store": true
  },

  // 搜索排除
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  }
}
```

### 6.3 Git 配置

```bash
# 配置 Git 忽略文件权限
git config core.fileMode false

# 配置换行符处理
git config core.autocrlf input  # Linux/macOS
# git config core.autocrlf true # Windows

# 配置 Git LFS (如果使用大文件)
git lfs install
git lfs track "*.png"
git lfs track "*.jpg"
```

---

## 7. 项目初始化

### 7.1 克隆项目

```bash
# HTTPS 方式
git clone https://github.com/your-org/admin-frontend.git

# SSH 方式 (需要配置 SSH 密钥)
git clone git@github.com:your-org/admin-frontend.git

cd admin-frontend
```

### 7.2 环境变量配置

```bash
# 复制环境变量模板
cp .env.example .env.development

# 编辑环境变量
# .env.development
VITE_API_BASE_URL=http://localhost:8080/springboot1ngh61a2
VITE_APP_TITLE=健身房管理系统
VITE_APP_ENV=development
VITE_DEBUG=true
```

### 7.3 依赖安装

```bash
# 安装项目依赖
npm install

# 如果安装缓慢，使用国内镜像
npm config set registry https://registry.npmmirror.com

# 或使用 yarn
npm install -g yarn
yarn install
```

### 7.4 验证安装

```bash
# 检查依赖版本
npm list --depth=0

# 检查脚本可用性
npm run

# 运行代码检查
npm run check
```

### 7.5 启动开发服务器

```bash
# 启动开发服务器
npm run dev

# 访问应用
# http://localhost:8081

# 如果端口被占用
npm run dev -- --port 8082
```

---

## 8. 代码编辑器配置

### 8.1 VS Code 工作区设置

创建 `.vscode/extensions.json`：

```json
{
  "recommendations": [
    "vue.volar",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "stylelint.vscode-stylelint",
    "ms-vscode.vscode-typescript-next"
  ],
  "unwantedRecommendations": [
    "ms-vscode.vscode-typescript",
    "hookyqr.beautify"
  ]
}
```

### 8.2 代码格式化配置

创建 `.prettierrc`：

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "vueIndentScriptAndStyle": false
}
```

### 8.3 ESLint 配置

项目已配置 ESLint，规则包括：

- Vue 3 推荐规则
- TypeScript 推荐规则
- Prettier 兼容规则

### 8.4 调试配置

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug in Chrome",
      "url": "http://localhost:8081",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack://_virtual/*": "${workspaceFolder}/*"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${file}"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 9. 数据库配置

### 9.1 MySQL 安装

#### Windows

```bash
# 下载 MySQL Installer
# https://dev.mysql.com/downloads/installer/

# 运行安装程序，选择以下组件：
# - MySQL Server
# - MySQL Workbench
# - MySQL Shell

# 设置 root 密码：admin123
```

#### macOS

```bash
# 使用 Homebrew
brew install mysql
brew services start mysql

# 安全配置
mysql_secure_installation
```

#### Linux (Ubuntu)

```bash
sudo apt update
sudo apt install mysql-server

# 安全配置
sudo mysql_secure_installation

# 启动服务
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 9.2 数据库初始化

```bash
# 连接到 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE springboot1ngh61a2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin123';
GRANT ALL PRIVILEGES ON springboot1ngh61a2.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;

# 退出
EXIT;
```

### 9.3 导入数据

```bash
# 导入 SQL 文件
mysql -u admin -p springboot1ngh61a2 < db/springboot1ngh61a2.sql

# 或使用 MySQL Workbench 导入
```

### 9.4 连接配置

确保后端 `application.yml` 中数据库配置正确：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/springboot1ngh61a2?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
    username: admin
    password: admin123
    driver-class-name: com.mysql.cj.jdbc.Driver
```

---

## 10. 测试环境配置

### 10.1 单元测试配置

```bash
# 运行单元测试
npm run test:unit

# 运行测试覆盖率
npm run test:coverage

# 监听模式运行测试
npm run test:unit:watch
```

### 10.2 端到端测试配置

```bash
# 安装 Playwright 浏览器
npx playwright install

# 运行 E2E 测试
npm run test:e2e

# 调试模式
npm run test:e2e:debug
```

### 10.3 测试数据准备

```bash
# 创建测试数据库
CREATE DATABASE springboot1ngh61a2_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入测试数据
mysql -u admin -p springboot1ngh61a2_test < db/test-data.sql
```

---

## 11. 常见问题

### 11.1 Node.js 相关问题

#### 问题: npm install 失败

```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json

# 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 重新安装
npm install
```

#### 问题: 权限错误

```bash
# Linux/macOS
sudo chown -R $(whoami) ~/.npm

# 或使用 nvm 安装 Node.js
```

#### 问题: 版本冲突

```bash
# 检查当前版本
node --version
npm --version

# 使用 nvm 切换版本
nvm use 18.17.0
```

### 11.2 Git 相关问题

#### 问题: SSH 连接失败

```bash
# 检查 SSH 密钥
ls -la ~/.ssh/

# 测试连接
ssh -T git@github.com

# 重新生成密钥
ssh-keygen -t ed25519 -C "your.email@example.com"
```

#### 问题: 换行符问题

```bash
# 配置 Git
git config --global core.autocrlf input  # Linux/macOS
git config --global core.autocrlf true  # Windows
```

### 11.3 开发服务器问题

#### 问题: 端口被占用

```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8081
kill -9 <PID>
```

#### 问题: 热更新不生效

```bash
# 检查文件是否在 src/ 目录
# 重启开发服务器
npm run dev
```

### 11.4 编辑器问题

#### 问题: VS Code 插件不工作

```bash
# 重新安装插件
# 检查 VS Code 版本
code --version

# 重启 VS Code
```

#### 问题: TypeScript 错误

```bash
# 检查 TypeScript 版本
npm list typescript

# 重新安装依赖
rm -rf node_modules
npm install
```

---

## 12. 附录

### 12.1 环境变量说明

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_API_BASE_URL` | `/springboot1ngh61a2` | API 基础 URL |
| `VITE_APP_TITLE` | `健身房管理系统` | 应用标题 |
| `VITE_APP_ENV` | `development` | 环境标识 |
| `VITE_DEBUG` | `false` | 调试模式 |

### 12.2 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览构建结果

# 代码质量
npm run check        # 代码检查
npm run format       # 代码格式化
npm run type-check   # 类型检查

# 测试
npm run test:unit    # 单元测试
npm run test:coverage # 测试覆盖率
npm run test:e2e     # 端到端测试

# Git
git status           # 查看状态
git add .            # 添加文件
git commit -m "msg"  # 提交
git push             # 推送
```

### 12.3 推荐学习资源

- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 手册](https://www.typescriptlang.org/)
- [Vite 指南](https://vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/)
- [ESLint 规则](https://eslint.org/docs/rules/)

### 12.4 团队约定

#### 代码规范

- 使用 TypeScript 严格模式
- 遵循 Vue 3 Composition API
- 使用 ESLint + Prettier 格式化
- 提交前运行 `npm run check`

#### 分支管理

```bash
# 主分支
main        # 生产分支
develop     # 开发分支

# 功能分支
feature/xxx # 新功能
bugfix/xxx  # 修复
hotfix/xxx  # 紧急修复
```

#### 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建工具
```

---

**文档维护者**: 开发团队
**最后更新**: 2025-11-16
**版本**: v1.0
