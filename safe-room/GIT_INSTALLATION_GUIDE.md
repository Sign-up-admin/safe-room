# Git 安装指南

## 问题诊断
当前系统 PATH 中包含 GitHub Desktop 的路径，但该目录中没有 `git.exe` 可执行文件，导致 Git 命令无法使用。

## 解决方案

### 方案 1：安装 Git for Windows（推荐）

1. **下载 Git for Windows**
   - 访问：https://git-scm.com/download/win
   - 或直接下载：https://github.com/git-for-windows/git/releases/latest

2. **安装步骤**
   - 运行下载的安装程序
   - **重要**：在安装过程中，选择 "Add Git to PATH" 选项
   - 其他选项可以使用默认设置
   - 完成安装

3. **验证安装**
   ```powershell
   git --version
   ```

4. **重启 Cursor/VS Code**
   - 安装完成后，需要重启 Cursor 或 VS Code 才能识别新安装的 Git

### 方案 2：通过 GitHub Desktop 安装 Git

1. 打开 GitHub Desktop
2. 在设置中查找 Git 相关选项
3. 确保 GitHub Desktop 已正确配置 Git

### 方案 3：手动添加到 PATH（如果 Git 已安装但不在 PATH 中）

如果 Git 已经安装在其他位置，可以手动添加到 PATH：

1. 找到 Git 安装目录（通常在 `C:\Program Files\Git\cmd`）
2. 添加到系统 PATH：
   - 右键"此电脑" → 属性 → 高级系统设置 → 环境变量
   - 在"系统变量"中找到 Path，点击编辑
   - 添加 Git 的 cmd 目录路径
   - 确定并重启终端

## 验证修复

安装完成后，在 PowerShell 中运行：

```powershell
git --version
git rev-parse HEAD
```

如果这两个命令都能正常执行，说明问题已解决。

