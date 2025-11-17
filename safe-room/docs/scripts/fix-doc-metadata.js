#!/usr/bin/env node

/**
 * 文档元数据批量修复工具
 *
 * 功能：
 * - 扫描文档，识别缺少标准头部信息的文件
 * - 自动为文档添加标准头部信息
 * - 支持交互式确认和批量处理
 * - 生成修复报告
 *
 * 使用方法：
 * node docs/scripts/fix-doc-metadata.js [options] [files...]
 *
 * 选项：
 * --scan-only        仅扫描，不修复
 * --force            强制修复，不询问确认
 * --backup           创建备份文件
 * --verbose          详细输出
 * --category <cat>   为指定分类的文档添加头部
 * --help             显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const readline = require('readline');

// 导入验证模块
const { parseDocMetadata, loadMetadataConfig } = require('./validate-docs');

// 配置
const CONFIG = {
  // 需要处理的文件模式
  patterns: [
    'docs/**/*.md',
    'README.md',
    'CHANGELOG.md'
  ],

  // 排除的文件
  exclude: [
    'node_modules/**',
    'docs/scripts/**',
    'docs/templates/**',
    'docs/.doc-*'
  ],

  // 跳过不需要头部的文件
  skipFiles: [
    'README.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md'
  ]
};

// 修复结果
let results = {
  scanned: 0,
  fixed: 0,
  skipped: 0,
  errors: 0,
  backups: []
};

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    return;
  }

  console.log('🔧 开始文档元数据修复...\n');

  // 获取要处理的文件
  const files = await getFilesToFix(options.files);

  if (files.length === 0) {
    console.log('没有找到需要修复的文件');
    return;
  }

  console.log(`找到 ${files.length} 个文件待处理\n`);

  // 处理每个文件
  for (const file of files) {
    await processFile(file, options);
  }

  // 输出结果
  printResults(options);

  // 设置退出码
  if (results.errors > 0) {
    process.exit(1);
  }
}

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const options = {
    scanOnly: false,
    force: false,
    backup: false,
    verbose: false,
    category: null,
    help: false,
    files: []
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--scan-only':
        options.scanOnly = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--backup':
        options.backup = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--category':
        options.category = args[++i];
        break;
      case '--help':
        options.help = true;
        break;
      default:
        if (!arg.startsWith('--')) {
          options.files.push(arg);
        }
        break;
    }
  }

  return options;
}

/**
 * 获取要修复的文件列表
 */
async function getFilesToFix(specifiedFiles) {
  if (specifiedFiles.length > 0) {
    return specifiedFiles.filter(file => fs.existsSync(file));
  }

  const files = [];
  for (const pattern of CONFIG.patterns) {
    const matches = await glob(pattern, {
      ignore: CONFIG.exclude
    });
    files.push(...matches);
  }

  return [...new Set(files)].sort();
}

/**
 * 处理单个文件
 */
async function processFile(filePath, options) {
  results.scanned++;

  if (options.verbose) {
    console.log(`处理文件: ${filePath}`);
  }

  try {
    // 跳过不需要处理的文件
    if (CONFIG.skipFiles.some(file => filePath.endsWith(file))) {
      results.skipped++;
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const metadata = parseDocMetadata(content);

    // 检查是否需要修复
    const needsFix = checkIfNeedsFix(filePath, content, metadata, options);

    if (!needsFix) {
      if (options.verbose) {
        console.log(`  ✓ 文件已符合要求`);
      }
      return;
    }

    // 生成修复内容
    const fixedContent = generateFixedContent(filePath, content, metadata, options);

    if (options.scanOnly) {
      console.log(`  🔍 需要修复: ${filePath}`);
      return;
    }

    // 确认修复
    if (!options.force) {
      const confirmed = await confirmFix(filePath);
      if (!confirmed) {
        results.skipped++;
        return;
      }
    }

    // 创建备份
    if (options.backup) {
      const backupPath = createBackup(filePath);
      results.backups.push(backupPath);
    }

    // 应用修复
    fs.writeFileSync(filePath, fixedContent, 'utf-8');
    results.fixed++;

    console.log(`  ✅ 已修复: ${filePath}`);

  } catch (error) {
    results.errors++;
    console.error(`  ❌ 处理失败 ${filePath}: ${error.message}`);
  }
}

/**
 * 检查文件是否需要修复
 */
function checkIfNeedsFix(filePath, content, metadata, options) {
  const config = loadMetadataConfig();

  // 检查是否已有头部
  const hasFrontMatter = content.trim().startsWith('---');

  // 检查必需字段
  const requiredFields = Object.keys(config.required_fields);
  const missingFields = requiredFields.filter(field => !metadata[field]);

  // 检查分类过滤
  if (options.category && metadata.category !== options.category) {
    return false;
  }

  return !hasFrontMatter || missingFields.length > 0;
}

/**
 * 生成修复后的内容
 */
function generateFixedContent(filePath, content, existingMetadata, options) {
  const config = loadMetadataConfig();

  // 生成新的元数据
  const newMetadata = generateMetadata(filePath, existingMetadata);

  // 构建头部
  const frontMatterLines = ['---'];

  // 添加所有字段
  Object.keys(config.required_fields).forEach(field => {
    const value = newMetadata[field];
    frontMatterLines.push(`${field}: ${formatValue(value)}`);
  });

  Object.keys(config.optional_fields).forEach(field => {
    if (newMetadata[field] !== undefined) {
      const value = newMetadata[field];
      frontMatterLines.push(`${field}: ${formatValue(value)}`);
    }
  });

  frontMatterLines.push('---');

  // 移除旧的头部（如果存在）
  let body = content;
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (frontMatterMatch) {
    body = content.substring(frontMatterMatch[0].length);
  }

  // 确保body以换行符开头（如果有内容）
  if (body && !body.startsWith('\n')) {
    body = '\n' + body;
  }

  return frontMatterLines.join('\n') + body;
}

/**
 * 生成文档元数据
 */
function generateMetadata(filePath, existingMetadata) {
  const config = loadMetadataConfig();

  const metadata = { ...existingMetadata };

  // 设置必需字段的默认值
  if (!metadata.title) {
    metadata.title = generateTitleFromPath(filePath);
  }

  if (!metadata.version) {
    metadata.version = 'v1.0.0';
  }

  if (!metadata.last_updated) {
    metadata.last_updated = new Date().toISOString().split('T')[0];
  }

  if (!metadata.status) {
    metadata.status = 'active';
  }

  if (!metadata.category) {
    metadata.category = inferCategoryFromPath(filePath);
  }

  return metadata;
}

/**
 * 从文件路径生成标题
 */
function generateTitleFromPath(filePath) {
  const fileName = path.basename(filePath, '.md');
  return fileName
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * 从文件路径推断分类
 */
function inferCategoryFromPath(filePath) {
  const relativePath = path.relative('docs', filePath);

  if (relativePath.startsWith('requirements/')) {
    return 'requirements';
  } else if (relativePath.startsWith('technical/')) {
    return 'technical';
  } else if (relativePath.startsWith('development/')) {
    return 'development';
  } else if (relativePath.startsWith('reports/')) {
    return 'reports';
  }

  // 默认分类
  return 'technical';
}

/**
 * 格式化值用于YAML
 */
function formatValue(value) {
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  if (typeof value === 'string') {
    // 如果包含特殊字符，用引号包围
    if (value.includes(':') || value.includes('"') || value.includes("'")) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }

  return String(value);
}

/**
 * 创建备份文件
 */
function createBackup(filePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup-${timestamp}`;

  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

/**
 * 确认修复操作
 */
function confirmFix(filePath) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`修复文件 ${filePath}? (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * 输出结果
 */
function printResults(options) {
  console.log('\n📊 修复结果:');
  console.log(`  扫描文件: ${results.scanned}`);
  console.log(`  已修复: ${results.fixed}`);
  console.log(`  跳过: ${results.skipped}`);
  console.log(`  错误: ${results.errors}`);

  if (results.backups.length > 0) {
    console.log(`\n💾 创建的备份文件:`);
    results.backups.forEach(backup => {
      console.log(`  ${backup}`);
    });
  }

  if (results.fixed > 0) {
    console.log('\n✅ 修复完成');
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
文档元数据修复工具

使用方法:
  node docs/scripts/fix-doc-metadata.js [options] [files...]

选项:
  --scan-only        仅扫描，不修复
  --force            强制修复，不询问确认
  --backup           创建备份文件
  --verbose          详细输出
  --category <cat>   仅修复指定分类的文档
  --help             显示帮助信息

示例:
  # 扫描所有文档
  node docs/scripts/fix-doc-metadata.js --scan-only

  # 修复所有文档（带确认）
  node docs/scripts/fix-doc-metadata.js

  # 强制修复所有文档（不确认）
  node docs/scripts/fix-doc-metadata.js --force

  # 修复特定文件
  node docs/scripts/fix-doc-metadata.js docs/README.md

  # 修复技术文档并创建备份
  node docs/scripts/fix-doc-metadata.js --category technical --backup
`);
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('修复过程中发生错误:', error);
    process.exit(1);
  });
}

module.exports = {
  generateMetadata,
  generateFixedContent,
  checkIfNeedsFix,
  formatValue
};
