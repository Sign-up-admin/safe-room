#!/usr/bin/env node

/**
 * 文档版本管理工具
 *
 * 功能：
 * - 自动管理文档版本号
 * - 生成变更记录
 * - 创建版本标签
 * - 版本发布流程自动化
 *
 * 使用方法：
 * node docs/scripts/manage-doc-versions.js [command] [options]
 *
 * 命令：
 * bump          提升版本号
 * changelog     生成变更记录
 * release       执行发布流程
 * tag           创建Git标签
 * status        显示版本状态
 *
 * 选项：
 * --type <type>     版本类型: patch|minor|major
 * --file <file>     指定文档文件
 * --message <msg>   变更信息
 * --help            显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  // 文档根目录 - 动态检测
  get docsRoot() {
    // 如果当前目录包含 docs/ 子目录，则使用相对路径
    const cwd = process.cwd();
    if (cwd.endsWith('docs') || cwd.endsWith('docs/') || cwd.endsWith('docs\\\\')) {
      return '.';
    }
    return 'docs';
  },

  // 主版本文件
  mainVersionFile: 'docs/README.md',

  // 变更日志文件
  changelogFile: 'docs/DOC_CHANGELOG.md',

  // 版本标签前缀
  tagPrefix: 'v'
};

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    command: 'status',
    type: 'patch',
    file: CONFIG.mainVersionFile,
    message: '',
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case 'bump':
      case 'changelog':
      case 'release':
      case 'tag':
      case 'status':
        options.command = arg;
        break;
      case '--type':
        options.type = args[++i];
        break;
      case '--file':
        options.file = args[++i];
        break;
      case '--message':
        options.message = args[++i];
        break;
      case '--help':
        options.help = true;
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`未知选项: ${arg}`);
          process.exit(1);
        } else if (!options.file && options.command !== 'status') {
          options.file = arg;
        }
    }
  }

  return options;
}

// 显示帮助信息
function showHelp() {
  console.log(`
文档版本管理工具

使用方法:
  node docs/scripts/manage-doc-versions.js [command] [options]

命令:
  bump          提升版本号
  changelog     生成变更记录
  release       执行发布流程
  tag           创建Git标签
  status        显示版本状态 (默认)

选项:
  --type <type>     版本类型: patch|minor|major (默认: patch)
  --file <file>     指定文档文件 (默认: docs/README.md)
  --message <msg>   变更信息
  --help            显示帮助信息

示例:
  # 提升补丁版本
  node docs/scripts/manage-doc-versions.js bump --type patch

  # 提升次版本并添加变更信息
  node docs/scripts/manage-doc-versions.js bump --type minor --message "添加新功能"

  # 生成变更日志
  node docs/scripts/manage-doc-versions.js changelog

  # 执行完整发布流程
  node docs/scripts/manage-doc-versions.js release --type minor

  # 显示当前版本状态
  node docs/scripts/manage-doc-versions.js status
`);
}

// 读取文档版本
function readVersion(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const versionMatch = content.match(/^version:\s*([^\n]+)/m);
    return versionMatch ? versionMatch[1].trim() : null;
  } catch (error) {
    console.warn(`⚠️ 无法读取版本信息 ${filePath}: ${error.message}`);
    return null;
  }
}

// 更新文档版本
function updateVersion(filePath, newVersion) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(
      /^version:\s*[^\n]+/m,
      `version: ${newVersion}`
    );

    // 更新最后更新时间
    const today = new Date().toISOString().split('T')[0];
    content = content.replace(
      /^last_updated:\s*[^\n]+/m,
      `last_updated: ${today}`
    );

    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`❌ 更新版本失败 ${filePath}: ${error.message}`);
    return false;
  }
}

// 解析版本号
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    throw new Error(`无效的版本号格式: ${version}`);
  }
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    string: version
  };
}

// 计算新版本号
function bumpVersion(currentVersion, type) {
  const version = parseVersion(currentVersion);

  switch (type) {
    case 'patch':
      version.patch++;
      break;
    case 'minor':
      version.minor++;
      version.patch = 0;
      break;
    case 'major':
      version.major++;
      version.minor = 0;
      version.patch = 0;
      break;
    default:
      throw new Error(`未知的版本类型: ${type}`);
  }

  version.string = `${version.major}.${version.minor}.${version.patch}`;
  return version;
}

// 提升版本号
function bumpVersionCommand(options) {
  const currentVersion = readVersion(options.file);
  if (!currentVersion) {
    console.error(`❌ 无法获取当前版本 ${options.file}`);
    return false;
  }

  console.log(`📄 当前版本: ${currentVersion}`);

  try {
    const newVersion = bumpVersion(currentVersion, options.type);
    console.log(`⬆️ 目标版本: ${newVersion.string} (${options.type})`);

    if (updateVersion(options.file, newVersion.string)) {
      console.log(`✅ 版本已更新: ${currentVersion} → ${newVersion.string}`);

      // 添加变更记录
      if (options.message) {
        addChangelogEntry(newVersion.string, options.type, options.message);
      }

      return newVersion.string;
    }
  } catch (error) {
    console.error(`❌ 版本提升失败: ${error.message}`);
  }

  return false;
}

// 添加变更日志条目
function addChangelogEntry(version, type, message) {
  const today = new Date().toISOString().split('T')[0];
  const typeIcons = {
    patch: '🐛',
    minor: '✨',
    major: '🎉'
  };

  const entry = `### ${version} (${today})\n- ${typeIcons[type]} ${message}\n`;

  try {
    let content = '';
    const changelogPath = CONFIG.changelogFile;

    if (fs.existsSync(changelogPath)) {
      content = fs.readFileSync(changelogPath, 'utf-8');
    } else {
      content = `---\ntitle: DOC CHANGELOG\nversion: v1.0.0\nlast_updated: ${today}\nstatus: active\ncategory: technical\ntags: [documentation, changelog, version-history]\n---\n\n# 📋 文档变更日志\n\n> **版本**：v1.0.0\n> **更新日期**：${today}\n\n---\n\n## 📝 变更记录\n\n`;
    }

    // 在变更记录部分添加新条目
    const changelogSection = '## 📝 变更记录\n\n';
    if (content.includes(changelogSection)) {
      content = content.replace(
        changelogSection,
        changelogSection + entry + '\n'
      );
    } else {
      content += '\n' + changelogSection + entry + '\n';
    }

    fs.writeFileSync(changelogPath, content, 'utf-8');
    console.log(`📝 变更日志已更新: ${message}`);
  } catch (error) {
    console.warn(`⚠️ 无法更新变更日志: ${error.message}`);
  }
}

// 生成变更日志
function generateChangelog(options) {
  console.log('📋 生成变更日志...');

  // 这里可以从Git历史生成变更日志
  // 目前先创建一个基本的变更日志结构

  const today = new Date().toISOString().split('T')[0];
  const content = `---\ntitle: DOC CHANGELOG\nversion: v1.0.0\nlast_updated: ${today}\nstatus: active\ncategory: technical\ntags: [documentation, changelog, version-history]\n---\n\n# 📋 文档变更日志\n\n> **版本**：v1.0.0\n> **更新日期**：${today}\n\n---\n\n## 📖 概述\n\n本文档记录了项目文档的所有版本变更和重要更新，便于跟踪文档演进历史和功能改进。\n\n---\n\n## 📝 变更记录\n\n### v1.0.0 (${today})\n- 🎉 初始发布：文档工程系统正式上线\n- 📚 新增：完整的文档工程框架\n- 🛠️ 新增：自动化文档生成工具\n- 📊 新增：文档质量监控体系\n\n---\n\n## 📚 相关文档\n\n- [文档版本控制指南](DOC_VERSION_CONTROL.md)\n- [文档生命周期管理指南](DOC_LIFECYCLE_MANAGEMENT.md)\n\n---\n\n*此变更日志自动生成，记录所有版本的重要变更。*\n`;

  fs.writeFileSync(CONFIG.changelogFile, content, 'utf-8');
  console.log(`✅ 变更日志已生成: ${CONFIG.changelogFile}`);
}

// 执行发布流程
function releaseCommand(options) {
  console.log('🚀 开始执行发布流程...');

  try {
    // 1. 提升版本
    const newVersion = bumpVersionCommand(options);
    if (!newVersion) {
      throw new Error('版本提升失败');
    }

    // 2. 生成文档
    console.log('🔄 生成最新文档...');
    try {
      execSync('node docs/scripts/generate-api-docs.js', { stdio: 'inherit' });
      execSync('node docs/scripts/generate-database-docs.js', { stdio: 'inherit' });
      execSync('node docs/scripts/generate-quality-report.js', { stdio: 'inherit' });
      execSync('node docs/scripts/manage-doc-lifecycle.js report', { stdio: 'inherit' });
    } catch (error) {
      console.warn(`⚠️ 文档生成部分失败，继续发布流程: ${error.message}`);
    }

    // 3. 验证文档
    console.log('✅ 验证文档质量...');
    try {
      execSync('node docs/scripts/validate-docs.js --strict docs/', { stdio: 'inherit' });
    } catch (error) {
      console.warn(`⚠️ 文档验证失败，但继续发布流程: ${error.message}`);
    }

    // 4. 创建Git提交
    console.log('💾 创建Git提交...');
    try {
      execSync('git add docs/', { stdio: 'inherit' });
      execSync(`git commit -m "docs: release version ${newVersion}"`, { stdio: 'inherit' });
    } catch (error) {
      console.warn(`⚠️ Git提交失败: ${error.message}`);
    }

    // 5. 创建标签
    console.log('🏷️ 创建Git标签...');
    tagCommand({ ...options, version: newVersion });

    console.log(`🎉 发布完成: v${newVersion}`);

  } catch (error) {
    console.error(`❌ 发布失败: ${error.message}`);
    process.exit(1);
  }
}

// 创建Git标签
function tagCommand(options) {
  const version = options.version || readVersion(options.file);
  if (!version) {
    console.error('❌ 无法获取版本信息');
    return;
  }

  const tagName = `${CONFIG.tagPrefix}${version}`;
  const message = `Release version ${version}`;

  try {
    execSync(`git tag -a ${tagName} -m "${message}"`, { stdio: 'inherit' });
    execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
    console.log(`✅ Git标签已创建: ${tagName}`);
  } catch (error) {
    console.error(`❌ 创建Git标签失败: ${error.message}`);
  }
}

// 显示版本状态
function showStatus(options) {
  const version = readVersion(options.file);
  if (version) {
    console.log(`📄 文档版本: ${version}`);
    console.log(`📁 文件: ${options.file}`);

    // 显示Git信息
    try {
      const gitTag = execSync('git describe --tags --abbrev=0 2>/dev/null', { encoding: 'utf-8' }).trim();
      const gitBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      console.log(`🏷️ 最新标签: ${gitTag}`);
      console.log(`🌿 当前分支: ${gitBranch}`);
    } catch (error) {
      console.log('📝 Git信息: 无法获取');
    }
  } else {
    console.error(`❌ 无法读取版本信息 ${options.file}`);
  }
}

// 主函数
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  try {
    switch (options.command) {
      case 'bump':
        bumpVersionCommand(options);
        break;
      case 'changelog':
        generateChangelog(options);
        break;
      case 'release':
        releaseCommand(options);
        break;
      case 'tag':
        tagCommand(options);
        break;
      case 'status':
        showStatus(options);
        break;
      default:
        console.error(`❌ 未知命令: ${options.command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ 执行失败: ${error.message}`);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error(`❌ 未预期的错误: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  parseVersion,
  bumpVersion,
  readVersion,
  updateVersion,
  CONFIG
};
