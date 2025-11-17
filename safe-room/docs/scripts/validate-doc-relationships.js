#!/usr/bin/env node

/**
 * 文档关联关系验证工具
 *
 * 功能：
 * - 验证文档关联关系的有效性
 * - 检查关联关系的双向一致性
 * - 发现孤立的文档和断开的链接
 * - 生成关联关系健康报告
 * - 自动修复简单的关联关系问题
 *
 * 使用方法：
 * node docs/scripts/validate-doc-relationships.js [options]
 *
 * 选项：
 * --fix          自动修复可修复的问题
 * --strict       严格模式，警告也算错误
 * --verbose      详细输出
 * --update-json  更新关系JSON文件
 * --help         显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// 导入相关模块
const { parseDocMetadata } = require('./validate-docs');

// 配置
const CONFIG = {
  // 文档根目录 - 动态检测
  get docsRoot() {
    // 如果当前目录包含 docs/ 子目录，则使用相对路径
    const cwd = process.cwd();
    if (cwd.endsWith('docs') || cwd.endsWith('docs/') || cwd.endsWith('docs\\')) {
      return '.';
    }
    return 'docs';
  },

  // 关系文件路径
  get relationshipsFile() {
    return path.join(CONFIG.docsRoot, 'DOC_RELATIONSHIPS.json');
  },

  // 扫描模式
  get patterns() {
    const root = this.docsRoot;
    return [
      `${root}/**/*.md`
    ];
  },

  // 排除文件
  exclude: [
    'node_modules/**',
    'docs/scripts/**',
    'docs/templates/**',
    'docs/.doc-*'
  ]
};

// 验证结果
let results = {
  total: 0,
  valid: 0,
  invalid: 0,
  orphaned: 0,
  bidirectional: 0,
  issues: [],
  suggestions: []
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

  console.log('🔗 开始验证文档关联关系...\n');

  // 加载关系数据
  const relationships = loadRelationships();

  // 扫描所有文档
  const allDocs = await scanAllDocuments();

  // 验证关联关系
  await validateRelationships(relationships, allDocs, options);

  // 检查孤立文档
  checkOrphanedDocuments(allDocs, relationships);

  // 检查双向一致性
  checkBidirectionalConsistency(relationships, options);

  // 更新关系JSON文件（如果指定）
  if (options.updateJson) {
    await updateRelationshipsJson(allDocs);
  }

  // 输出结果
  printResults(options);

  // 设置退出码
  const hasErrors = results.invalid > 0 || (results.issues.length > 0 && options.strict);
  if (hasErrors) {
    process.exit(1);
  }
}

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const options = {
    fix: false,
    strict: false,
    verbose: false,
    updateJson: false,
    help: false
  };

  for (const arg of args) {
    switch (arg) {
      case '--fix':
        options.fix = true;
        break;
      case '--strict':
        options.strict = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--update-json':
        options.updateJson = true;
        break;
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * 加载关系数据
 */
function loadRelationships() {
  const relationshipsPath = CONFIG.relationshipsFile;

  if (!fs.existsSync(relationshipsPath)) {
    console.warn(`⚠️ 关系文件不存在: ${relationshipsPath}`);
    return {};
  }

  try {
    const content = fs.readFileSync(relationshipsPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ 无法加载关系文件: ${error.message}`);
    return {};
  }
}

/**
 * 扫描所有文档
 */
async function scanAllDocuments() {
  const files = await glob(CONFIG.patterns, {
    ignore: CONFIG.exclude
  });

  const docs = {};

  for (const file of files) {
    const filePath = file; // file已经是完整的相对路径
    const relativePath = path.relative(CONFIG.docsRoot, file).replace(/\\/g, '/');

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const metadata = parseDocMetadata(content);

      docs[relativePath] = {
        path: relativePath,
        title: metadata.title || path.basename(file, '.md'),
        category: metadata.category,
        relatedDocs: metadata.related_docs || [],
        status: metadata.status || 'active',
        content: content,
        metadata: metadata
      };
    } catch (error) {
      console.warn(`⚠️ 无法读取文档 ${file}: ${error.message}`);
    }
  }

  return docs;
}

/**
 * 验证关联关系
 */
async function validateRelationships(relationships, allDocs, options) {
  results.total = Object.keys(relationships).length;

  for (const [sourcePath, targets] of Object.entries(relationships)) {
    // 检查源文档是否存在
    if (!allDocs[sourcePath]) {
      addIssue(sourcePath, '源文档不存在', `文档 ${sourcePath} 在关系文件中声明但实际不存在`);
      continue;
    }

    // 检查目标文档是否存在
    const validTargets = [];
    const invalidTargets = [];

    for (const target of targets) {
      if (allDocs[target]) {
        validTargets.push(target);
      } else {
        invalidTargets.push(target);
        addIssue(sourcePath, '无效的关联关系', `关联文档 ${target} 不存在`);
      }
    }

    if (invalidTargets.length === 0) {
      results.valid++;
    } else {
      results.invalid++;
    }

    // 自动修复（如果启用）
    if (options.fix && invalidTargets.length > 0) {
      const fixedTargets = targets.filter(target => allDocs[target]);
      relationships[sourcePath] = fixedTargets;
      console.log(`🔧 已修复 ${sourcePath} 的关联关系`);
    }
  }

  // 检查文档元数据中的关联关系
  for (const [docPath, docInfo] of Object.entries(allDocs)) {
    if (docInfo.relatedDocs && docInfo.relatedDocs.length > 0) {
      for (const relatedDoc of docInfo.relatedDocs) {
        if (!allDocs[relatedDoc]) {
          addIssue(docPath, '文档元数据中的无效关联', `关联文档 ${relatedDoc} 不存在`);

          // 建议添加到关系文件中
          if (!relationships[docPath]) {
            relationships[docPath] = [];
          }
          if (!relationships[docPath].includes(relatedDoc)) {
            results.suggestions.push({
              type: 'add_relationship',
              source: docPath,
              target: relatedDoc,
              reason: '文档元数据中声明但关系文件缺失'
            });
          }
        }
      }
    }
  }
}

/**
 * 检查孤立文档
 */
function checkOrphanedDocuments(allDocs, relationships) {
  const referencedDocs = new Set();

  // 收集所有被引用的文档
  for (const targets of Object.values(relationships)) {
    for (const target of targets) {
      referencedDocs.add(target);
    }
  }

  // 检查孤立文档
  for (const [docPath, docInfo] of Object.entries(allDocs)) {
    if (!referencedDocs.has(docPath) && !relationships[docPath]) {
      results.orphaned++;
      addIssue(docPath, '孤立文档', '文档没有被其他文档引用，且自身也没有引用其他文档');

      // 为核心文档添加建议
      if (isCoreDocument(docPath)) {
        results.suggestions.push({
          type: 'add_core_relationships',
          doc: docPath,
          reason: '核心文档应该有关联关系'
        });
      }
    }
  }
}

/**
 * 检查双向一致性
 */
function checkBidirectionalConsistency(relationships, options) {
  const reverseRelationships = {};

  // 建立反向关系
  for (const [source, targets] of Object.entries(relationships)) {
    for (const target of targets) {
      if (!reverseRelationships[target]) {
        reverseRelationships[target] = [];
      }
      reverseRelationships[target].push(source);
    }
  }

  // 检查双向一致性
  for (const [source, targets] of Object.entries(relationships)) {
    for (const target of targets) {
      const reverseTargets = relationships[target] || [];
      if (!reverseTargets.includes(source)) {
        results.bidirectional++;
        addIssue(source, '缺少双向关联', `${source} 引用了 ${target}，但 ${target} 没有反向引用 ${source}`);

        // 自动修复
        if (options.fix) {
          if (!relationships[target]) {
            relationships[target] = [];
          }
          if (!relationships[target].includes(source)) {
            relationships[target].push(source);
            console.log(`🔧 已添加双向关联: ${target} → ${source}`);
          }
        }
      } else {
        results.bidirectional++;
      }
    }
  }
}

/**
 * 判断是否为核心文档
 */
function isCoreDocument(docPath) {
  const coreDocs = [
    'README.md',
    'ARCHITECTURE.md',
    'CHANGELOG.md',
    'docs/DOCUMENTATION_GUIDE.md',
    'docs/INDEX.md'
  ];

  return coreDocs.some(coreDoc => docPath.endsWith(coreDoc));
}

/**
 * 添加问题
 */
function addIssue(doc, type, description) {
  results.issues.push({
    doc,
    type,
    description
  });
}

/**
 * 输出结果
 */
function printResults(options) {
  console.log('\n📊 关联关系验证结果:');
  console.log(`  验证关系: ${results.total}`);
  console.log(`  有效关系: ${results.valid}`);
  console.log(`  无效关系: ${results.invalid}`);
  console.log(`  孤立文档: ${results.orphaned}`);
  console.log(`  双向关联: ${results.bidirectional}`);
  console.log(`  发现问题: ${results.issues.length}`);
  console.log(`  改进建议: ${results.suggestions.length}`);

  if (results.issues.length > 0) {
    console.log('\n❌ 发现的问题:');
    results.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.doc}: ${issue.type} - ${issue.description}`);
    });
  }

  if (results.suggestions.length > 0) {
    console.log('\n💡 改进建议:');
    results.suggestions.forEach((suggestion, index) => {
      console.log(`  ${index + 1}. ${suggestion.type}: ${suggestion.doc || suggestion.source}${suggestion.target ? ` → ${suggestion.target}` : ''} - ${suggestion.reason}`);
    });
  }

  if (results.invalid === 0 && results.orphaned === 0) {
    console.log('\n✅ 关联关系验证通过');
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
文档关联关系验证工具

使用方法:
  node docs/scripts/validate-doc-relationships.js [options]

选项:
  --fix          自动修复可修复的问题
  --strict       严格模式，警告也算错误
  --verbose      详细输出
  --update-json  更新关系JSON文件
  --help         显示帮助信息

示例:
  # 验证关联关系
  node docs/scripts/validate-doc-relationships.js

  # 自动修复问题
  node docs/scripts/validate-doc-relationships.js --fix

  # 严格模式验证
  node docs/scripts/validate-doc-relationships.js --strict

  # 详细输出
  node docs/scripts/validate-doc-relationships.js --verbose
`);
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('验证过程中发生错误:', error);
    process.exit(1);
  });
}

/**
 * 更新关系JSON文件
 */
async function updateRelationshipsJson(allDocs) {
  console.log('\n🔄 开始更新关系JSON文件...');

  const relationships = {};

  // 为每个文档生成关联关系
  for (const [docPath, docInfo] of Object.entries(allDocs)) {
    relationships[docPath] = [];

    // 分析文档内容中的链接
    const content = docInfo.content;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      let linkPath = match[2];

      // 跳过外部链接和锚点链接
      if (linkPath.startsWith('http://') || linkPath.startsWith('https://') ||
          linkPath.startsWith('mailto:') || linkPath.startsWith('#')) {
        continue;
      }

      // 清理和规范化路径
      linkPath = linkPath.replace(/\\/g, '/'); // 统一路径分隔符

      // 处理重复路径前缀（如 requirements/requirements/...）
      const parts = linkPath.split('/');
      const uniqueParts = [];
      for (const part of parts) {
        if (part !== '' && (!uniqueParts.includes(part) || part === '..')) {
          uniqueParts.push(part);
        }
      }
      linkPath = uniqueParts.join('/');

      // 移除开头的 docs/ 前缀（如果存在）
      if (linkPath.startsWith('docs/')) {
        linkPath = linkPath.substring(5);
      }

      // 处理相对路径
      if (linkPath.startsWith('./')) {
        const docDir = path.dirname(docPath);
        linkPath = path.relative(CONFIG.docsRoot === '.' ? '' : CONFIG.docsRoot, path.join(docDir, linkPath.substring(2))).replace(/\\/g, '/');
      }

      // 检查目标文档是否存在
      if (allDocs[linkPath] && !relationships[docPath].includes(linkPath)) {
        relationships[docPath].push(linkPath);
      }
    }

    // 添加基于内容的关联关系
    const relatedDocs = generateContentBasedRelationships(docPath, docInfo, allDocs);
    for (const relatedDoc of relatedDocs) {
      if (!relationships[docPath].includes(relatedDoc)) {
        relationships[docPath].push(relatedDoc);
      }
    }
  }

  // 写入JSON文件
  const jsonPath = CONFIG.relationshipsFile;
  fs.writeFileSync(jsonPath, JSON.stringify(relationships, null, 2), 'utf-8');

  console.log(`✅ 关系JSON文件已更新: ${jsonPath}`);
  console.log(`📊 共生成 ${Object.keys(relationships).length} 个文档的关系数据`);
}

/**
 * 基于内容生成关联关系
 */
function generateContentBasedRelationships(docPath, docInfo, allDocs) {
  const relationships = [];
  const content = docInfo.content.toLowerCase();
  const category = docInfo.metadata.category;

  // 根据文档类型和内容生成关联关系
  for (const [otherPath, otherInfo] of Object.entries(allDocs)) {
    if (otherPath === docPath) continue;

    const otherCategory = otherInfo.metadata.category;
    const otherContent = otherInfo.content.toLowerCase();

    // 需求文档关联技术文档
    if (category === 'requirements' && otherCategory === 'technical') {
      if (content.includes('api') && otherContent.includes('api')) {
        relationships.push(otherPath);
      }
      if (content.includes('database') && otherContent.includes('database')) {
        relationships.push(otherPath);
      }
      if (content.includes('security') && otherContent.includes('security')) {
        relationships.push(otherPath);
      }
    }

    // 技术文档关联需求文档
    if (category === 'technical' && otherCategory === 'requirements') {
      if (content.includes('implementation') && otherContent.includes('requirements')) {
        relationships.push(otherPath);
      }
    }

    // 开发文档关联技术文档
    if (category === 'development' && otherCategory === 'technical') {
      if (content.includes('guide') && otherContent.includes('deployment')) {
        relationships.push(otherPath);
      }
      if (content.includes('testing') && otherContent.includes('api')) {
        relationships.push(otherPath);
      }
    }

    // 报告文档关联其他文档
    if (category === 'reports' && content.includes(path.basename(otherPath, '.md').toLowerCase())) {
      relationships.push(otherPath);
    }
  }

  return relationships.slice(0, 10); // 限制关联数量
}

module.exports = {
  loadRelationships,
  validateRelationships,
  checkOrphanedDocuments,
  checkBidirectionalConsistency,
  updateRelationshipsJson
};
