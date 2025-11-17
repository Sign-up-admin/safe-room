#!/usr/bin/env node

/**
 * 文档重组工具
 *
 * 功能：
 * - 分析文档分类分布
 * - 根据分类规则重组文档
 * - 自动移动文档到对应目录
 * - 更新文档引用和链接
 * - 生成重组报告
 *
 * 使用方法：
 * node docs/scripts/reorganize-docs.js [options]
 *
 * 选项：
 * --analyze          仅分析，不执行重组
 * --execute          执行文档重组
 * --force            强制执行，不询问确认
 * --backup           创建备份
 * --dry-run          试运行，显示将要执行的操作
 * --category <cat>   仅重组指定分类的文档
 * --help             显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const readline = require('readline');

// 导入相关模块
const { parseDocMetadata, loadMetadataConfig } = require('./validate-docs');

// 配置
const CONFIG = {
  // 需要处理的文件模式
  patterns: [
    'docs/**/*.md'
  ],

  // 排除的文件
  exclude: [
    'node_modules/**',
    'docs/scripts/**',
    'docs/templates/**',
    'docs/.doc-*',
    'docs/INDEX.md',
    'docs/requirements/INDEX.md',
    'docs/technical/INDEX.md',
    'docs/development/INDEX.md',
    'docs/reports/INDEX.md'
  ],

  // 跳过处理的文件
  skipFiles: [
    'README.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md'
  ]
};

// 重组结果
let results = {
  analyzed: 0,
  toMove: 0,
  moved: 0,
  skipped: 0,
  errors: 0,
  linksUpdated: 0,
  backups: []
};

// 重组计划
let reorganizationPlan = [];

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

  console.log('🔄 开始文档重组...\n');

  // 分析阶段
  console.log('📊 第一阶段：分析文档分布');
  await analyzeDocuments(options);

  if (options.analyze) {
    printAnalysisReport();
    return;
  }

  // 规划阶段
  console.log('\n📋 第二阶段：生成重组计划');
  generateReorganizationPlan(options);

  if (reorganizationPlan.length === 0) {
    console.log('没有需要重组的文档');
    return;
  }

  // 执行阶段
  if (options.execute || options.dryRun) {
    console.log('\n🚀 第三阶段：执行重组');

    if (!options.force && !options.dryRun) {
      const confirmed = await confirmExecution();
      if (!confirmed) {
        console.log('重组已取消');
        return;
      }
    }

    await executeReorganization(options);
  }

  // 清理阶段
  console.log('\n🧹 第四阶段：清理和验证');
  await cleanupAndVerify(options);

  // 输出结果
  printResults(options);
}

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const options = {
    analyze: false,
    execute: false,
    force: false,
    backup: false,
    dryRun: false,
    category: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--analyze':
        options.analyze = true;
        break;
      case '--execute':
        options.execute = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--backup':
        options.backup = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--category':
        options.category = args[++i];
        break;
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * 分析文档分布
 */
async function analyzeDocuments(options) {
  const files = await getFilesToAnalyze();

  for (const file of files) {
    results.analyzed++;
    await analyzeFile(file, options);
  }
}

/**
 * 获取要分析的文件
 */
async function getFilesToAnalyze() {
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
 * 分析单个文件
 */
async function analyzeFile(filePath, options) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const metadata = parseDocMetadata(content);

    const currentCategory = metadata.category;
    const suggestedCategory = determineSuggestedCategory(filePath, metadata);
    const targetDir = getTargetDirectory(suggestedCategory);

    const shouldMove = shouldMoveDocument(filePath, currentCategory, suggestedCategory, options);

    if (shouldMove) {
      reorganizationPlan.push({
        file: filePath,
        currentCategory,
        suggestedCategory,
        targetDir,
        reason: getMoveReason(filePath, currentCategory, suggestedCategory)
      });
    }

  } catch (error) {
    results.errors++;
    console.error(`  ❌ 分析失败 ${filePath}: ${error.message}`);
  }
}

/**
 * 确定建议的分类
 */
function determineSuggestedCategory(filePath, metadata) {
  const config = loadMetadataConfig();
  const relativePath = path.relative('docs', filePath);

  // 1. 基于目录位置判断
  for (const [category, categoryConfig] of Object.entries(config.category_config)) {
    if (relativePath.startsWith(categoryConfig.directory.replace('docs/', ''))) {
      return category;
    }
  }

  // 2. 基于文件名判断
  const fileName = path.basename(filePath).toLowerCase();

  if (fileName.includes('requirements') || fileName.includes('_requirements')) {
    return 'requirements';
  }

  if (fileName.includes('architecture') || fileName.includes('api') ||
      fileName.includes('database') || fileName.includes('deployment')) {
    return 'technical';
  }

  if (fileName.includes('guide') || fileName.includes('testing') ||
      fileName.includes('strategy') || fileName.includes('ci')) {
    return 'development';
  }

  if (fileName.includes('report') || fileName.includes('review') ||
      fileName.includes('analysis')) {
    return 'reports';
  }

  // 3. 基于元数据判断
  if (metadata.category && config.category_config[metadata.category]) {
    return metadata.category;
  }

  // 4. 默认分类
  return 'technical';
}

/**
 * 获取目标目录
 */
function getTargetDirectory(category) {
  const config = loadMetadataConfig();
  const categoryConfig = config.category_config[category];

  if (!categoryConfig) {
    return 'docs/technical/'; // 默认目录
  }

  return path.join('docs', categoryConfig.directory);
}

/**
 * 判断是否应该移动文档
 */
function shouldMoveDocument(filePath, currentCategory, suggestedCategory, options) {
  // 跳过特殊文件
  if (CONFIG.skipFiles.some(file => filePath.endsWith(file))) {
    return false;
  }

  // 分类过滤
  if (options.category && suggestedCategory !== options.category) {
    return false;
  }

  // 检查是否已在正确目录
  const targetDir = getTargetDirectory(suggestedCategory);
  const currentDir = path.dirname(filePath);

  if (currentDir === targetDir.replace(/\/$/, '')) {
    return false;
  }

  return currentCategory !== suggestedCategory;
}

/**
 * 获取移动原因
 */
function getMoveReason(filePath, currentCategory, suggestedCategory) {
  const reasons = [];

  if (!currentCategory) {
    reasons.push('缺少分类信息');
  }

  const fileName = path.basename(filePath).toLowerCase();

  if (suggestedCategory === 'requirements' &&
      (fileName.includes('requirements') || fileName.includes('需求'))) {
    reasons.push('文件名包含需求关键词');
  }

  if (suggestedCategory === 'technical' &&
      (fileName.includes('api') || fileName.includes('database') ||
       fileName.includes('architecture'))) {
    reasons.push('文件名包含技术关键词');
  }

  if (suggestedCategory === 'development' &&
      (fileName.includes('guide') || fileName.includes('testing'))) {
    reasons.push('文件名包含开发关键词');
  }

  if (suggestedCategory === 'reports' &&
      (fileName.includes('report') || fileName.includes('review'))) {
    reasons.push('文件名包含报告关键词');
  }

  return reasons.join(', ');
}

/**
 * 生成重组计划
 */
function generateReorganizationPlan(options) {
  results.toMove = reorganizationPlan.length;

  if (options.dryRun || options.verbose) {
    console.log(`\n📋 重组计划 (${reorganizationPlan.length} 个文档):`);
    reorganizationPlan.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.file}`);
      console.log(`     从: ${item.currentCategory || '未分类'} → 到: ${item.suggestedCategory}`);
      console.log(`     目标: ${item.targetDir}`);
      console.log(`     原因: ${item.reason}`);
      console.log();
    });
  }
}

/**
 * 执行重组
 */
async function executeReorganization(options) {
  for (const item of reorganizationPlan) {
    try {
      await moveDocument(item, options);
      results.moved++;
    } catch (error) {
      results.errors++;
      console.error(`  ❌ 移动失败 ${item.file}: ${error.message}`);
    }
  }
}

/**
 * 移动文档
 */
async function moveDocument(item, options) {
  const { file, targetDir, suggestedCategory } = item;

  // 确保目标目录存在
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 创建备份
  if (options.backup) {
    const backupPath = createBackup(file);
    results.backups.push(backupPath);
  }

  // 计算新路径
  const fileName = path.basename(file);
  const newPath = path.join(targetDir, fileName);

  if (options.dryRun) {
    console.log(`  🔄 [试运行] ${file} → ${newPath}`);
    return;
  }

  // 移动文件
  fs.renameSync(file, newPath);

  // 更新文档元数据
  updateDocumentMetadata(newPath, suggestedCategory);

  // 查找并更新引用
  await updateReferences(file, newPath);

  console.log(`  ✅ 已移动: ${file} → ${newPath}`);
}

/**
 * 更新文档元数据
 */
function updateDocumentMetadata(filePath, category) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const metadata = parseDocMetadata(content);

    // 更新分类
    metadata.category = category;

    // 重建头部
    const config = loadMetadataConfig();
    const frontMatterLines = ['---'];

    Object.keys(config.required_fields).forEach(field => {
      const value = metadata[field];
      if (value !== undefined) {
        frontMatterLines.push(`${field}: ${formatValue(value)}`);
      }
    });

    Object.keys(config.optional_fields).forEach(field => {
      if (metadata[field] !== undefined) {
        const value = metadata[field];
        frontMatterLines.push(`${field}: ${formatValue(value)}`);
      }
    });

    frontMatterLines.push('---');

    // 更新内容
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n?/);
    let body = content;
    if (frontMatterMatch) {
      body = content.substring(frontMatterMatch[0].length);
    }

    const newContent = frontMatterLines.join('\n') + body;
    fs.writeFileSync(filePath, newContent, 'utf-8');

  } catch (error) {
    console.warn(`  ⚠️ 更新元数据失败 ${filePath}: ${error.message}`);
  }
}

/**
 * 格式化值用于YAML
 */
function formatValue(value) {
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  if (typeof value === 'string') {
    if (value.includes(':') || value.includes('"') || value.includes("'")) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }

  return String(value);
}

/**
 * 更新引用
 */
async function updateReferences(oldPath, newPath) {
  const oldRelativePath = path.relative('docs', oldPath);
  const newRelativePath = path.relative('docs', newPath);

  // 获取所有可能引用该文档的文件
  const files = await getFilesToAnalyze();

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');

      // 查找引用
      const oldRefs = [
        oldRelativePath,
        oldRelativePath.replace(/\.md$/, ''),
        `./${oldRelativePath}`,
        `../${oldRelativePath}`
      ];

      const newRefs = [
        newRelativePath,
        newRelativePath.replace(/\.md$/, ''),
        `./${newRelativePath}`,
        `../${newRelativePath}`
      ];

      let updated = false;
      let newContent = content;

      for (let i = 0; i < oldRefs.length; i++) {
        const oldRef = oldRefs[i];
        const newRef = newRefs[i];

        if (newContent.includes(oldRef)) {
          newContent = newContent.replace(
            new RegExp(escapeRegExp(oldRef), 'g'),
            newRef
          );
          updated = true;
        }
      }

      if (updated) {
        fs.writeFileSync(file, newContent, 'utf-8');
        results.linksUpdated++;
      }

    } catch (error) {
      // 忽略读取错误
    }
  }
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 创建备份
 */
function createBackup(filePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup-${timestamp}`;

  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

/**
 * 确认执行
 */
function confirmExecution() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`确定执行文档重组操作? (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * 清理和验证
 */
async function cleanupAndVerify(options) {
  // 清理空目录
  await cleanupEmptyDirectories();

  // 验证重组结果
  if (!options.dryRun) {
    await verifyReorganization();
  }
}

/**
 * 清理空目录
 */
async function cleanupEmptyDirectories() {
  const dirs = [
    'docs/requirements',
    'docs/technical',
    'docs/development',
    'docs/reports'
  ];

  // 这里可以添加空目录清理逻辑
  // 暂时跳过，避免误删
}

/**
 * 验证重组结果
 */
async function verifyReorganization() {
  console.log('🔍 验证重组结果...');

  const files = await getFilesToAnalyze();
  let validCount = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const metadata = parseDocMetadata(content);

      if (metadata.category) {
        const suggestedCategory = determineSuggestedCategory(file, metadata);
        if (metadata.category === suggestedCategory) {
          validCount++;
        }
      }
    } catch (error) {
      // 忽略验证错误
    }
  }

  console.log(`✅ 验证完成: ${validCount}/${files.length} 个文档分类正确`);
}

/**
 * 输出分析报告
 */
function printAnalysisReport() {
  console.log('\n📊 文档分类分析报告:');
  console.log(`  总文档数: ${results.analyzed}`);
  console.log(`  需要重组: ${results.toMove}`);

  if (reorganizationPlan.length > 0) {
    console.log('\n📋 重组建议:');

    const categoryStats = {};
    reorganizationPlan.forEach(item => {
      categoryStats[item.suggestedCategory] = (categoryStats[item.suggestedCategory] || 0) + 1;
    });

    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 个文档`);
    });
  }
}

/**
 * 输出结果
 */
function printResults(options) {
  console.log('\n📊 重组结果:');
  console.log(`  分析文档: ${results.analyzed}`);
  console.log(`  计划移动: ${results.toMove}`);
  console.log(`  实际移动: ${results.moved}`);
  console.log(`  跳过: ${results.skipped}`);
  console.log(`  错误: ${results.errors}`);
  console.log(`  链接更新: ${results.linksUpdated}`);

  if (results.backups.length > 0) {
    console.log(`\n💾 创建的备份文件:`);
    results.backups.forEach(backup => {
      console.log(`  ${backup}`);
    });
  }

  if (results.moved > 0 && !options.dryRun) {
    console.log('\n✅ 重组完成');
    console.log('\n💡 建议后续操作:');
    console.log('  1. 运行文档校验: node docs/scripts/validate-docs.js');
    console.log('  2. 更新索引文件: node docs/scripts/update-doc-index.js');
    console.log('  3. 提交变更到版本控制');
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
文档重组工具

使用方法:
  node docs/scripts/reorganize-docs.js [options]

选项:
  --analyze          仅分析文档分布
  --execute          执行文档重组
  --force            强制执行，不询问确认
  --backup           创建备份文件
  --dry-run          试运行，显示操作而不执行
  --category <cat>   仅重组指定分类的文档
  --help             显示帮助信息

示例:
  # 分析文档分布
  node docs/scripts/reorganize-docs.js --analyze

  # 试运行重组
  node docs/scripts/reorganize-docs.js --execute --dry-run

  # 执行重组（带备份）
  node docs/scripts/reorganize-docs.js --execute --backup

  # 强制重组特定分类
  node docs/scripts/reorganize-docs.js --execute --force --category technical
`);
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('重组过程中发生错误:', error);
    process.exit(1);
  });
}

module.exports = {
  determineSuggestedCategory,
  getTargetDirectory,
  shouldMoveDocument,
  updateReferences
};
