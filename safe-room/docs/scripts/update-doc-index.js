#!/usr/bin/env node

/**
 * 文档索引更新脚本
 *
 * 功能：
 * - 自动扫描文档目录结构
 * - 生成和更新主索引文件 (INDEX.md)
 * - 更新各分类子索引文件 (requirements/INDEX.md, technical/INDEX.md等)
 * - 更新文档交叉引用和关系图
 * - 维护文档关系图（Mermaid格式）
 * - 生成文档导航页面
 * - 自动更新文档版本号
 * - 生成文档变更日志
 * - 集成文档质量检查
 *
 * 使用方法：
 * node docs/scripts/update-doc-index.js [options]
 *
 * 选项：
 * --dry-run         预览模式，不实际写入文件
 * --verbose         详细输出
 * --update-versions 自动更新文档版本号
 * --check-quality   包含质量检查
 * --help            显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// 导入相关模块
const { loadMetadataConfig, parseDocMetadata } = require('./validate-docs');

// 配置
const CONFIG = {
  // 文档根目录
  docsRoot: 'docs',

  // 索引文件配置
  indexFiles: {
    main: 'INDEX.md',
    requirements: 'requirements/INDEX.md',
    technical: 'technical/INDEX.md',
    development: 'development/INDEX.md',
    reports: 'reports/INDEX.md'
  },

  // 状态图标
  statusIcons: {
    'active': '✅',
    'deprecated': '⚠️',
    'draft': '🔄'
  },

  // 分类图标映射
  categoryIcons: {
    'requirements': '📋',
    'technical': '🔧',
    'development': '🛠️',
    'reports': '📊'
  },

  // 文档类型映射
  docTypes: {
    'REQUIREMENTS': '需求文档',
    'GUIDE': '指南文档',
    'REPORT': '报告文档',
    'API': 'API文档',
    'ARCHITECTURE': '架构文档',
    'DATABASE': '数据库文档',
    'DEPLOYMENT': '部署文档',
    'TESTING': '测试文档',
    'DEVELOPMENT': '开发文档'
  }
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

  console.log('📚 开始更新文档索引...\n');

  // 扫描文档结构
  const docStructure = await scanDocStructure();

  if (options.verbose) {
    console.log('扫描到的文档结构:');
    console.log(JSON.stringify(docStructure, null, 2));
    console.log();
  }

  // 质量检查（如果启用）
  if (options.checkQuality) {
    console.log('🔍 正在进行文档质量检查...');
    const qualityReport = await checkDocQuality(docStructure, options);
    if (options.verbose) {
      console.log('质量检查结果:');
      console.log(JSON.stringify(qualityReport, null, 2));
      console.log();
    }
  }

  // 更新文档版本号（如果启用）
  if (options.updateVersions) {
    await updateDocVersions(docStructure, options);
  }

  // 生成和更新所有索引文件
  await generateAllIndexFiles(docStructure, options);

  if (options.dryRun) {
    console.log('📋 预览模式完成');
    return;
  }

  console.log('✅ 所有索引文件已更新');

  // 生成文档关系图（Mermaid格式）
  await generateMermaidRelationships(docStructure, options);

  // 生成文档导航页面
  await generateNavigationPage(docStructure, options);

  // 生成文档变更日志
  await generateChangelog(docStructure, options);
}

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const options = {
    dryRun: false,
    verbose: false,
    help: false,
    updateVersions: false,
    checkQuality: false
  };

  for (const arg of args) {
    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--update-versions':
        options.updateVersions = true;
        break;
      case '--check-quality':
        options.checkQuality = true;
        break;
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * 扫描文档结构
 */
async function scanDocStructure() {
  const structure = {};
  const config = loadMetadataConfig();

  // 扫描所有Markdown文件
  const mdFiles = await glob('**/*.md', {
    cwd: CONFIG.docsRoot,
    ignore: [
      'node_modules/**',
      'templates/**',
      'scripts/**',
      '.doc-*'
    ]
  });

  for (const file of mdFiles) {
    const filePath = path.join(CONFIG.docsRoot, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // 解析文档元数据
    const metadata = parseDocMetadata(content);
    const relativePath = file.replace(/\\/g, '/');

    // 确定分类
    const category = getDocCategory(relativePath, config);

    if (!structure[category]) {
      structure[category] = [];
    }

    structure[category].push({
      path: relativePath,
      title: metadata.title || getTitleFromContent(content) || path.basename(file, '.md'),
      type: getDocType(file),
      status: metadata.status || 'active',
      version: metadata.version || 'v1.0.0',
      lastUpdated: metadata.last_updated || '未知',
      description: getDocDescription(content),
      tags: Array.isArray(metadata.tags) ? metadata.tags : (metadata.tags ? metadata.tags.split(',').map(t => t.trim()) : []),
      category: category,
      expiryDays: getCategoryExpiryDays(category, config)
    });
  }

  return structure;
}

/**
 * 文档质量检查
 */
async function checkDocQuality(structure, options) {
  const config = loadMetadataConfig();
  const report = {
    total: 0,
    valid: 0,
    issues: [],
    scores: {
      format: 0,
      content: 0,
      timeliness: 0,
      relationships: 0
    }
  };

  const allDocs = Object.values(structure).flat();
  report.total = allDocs.length;

  for (const doc of allDocs) {
    const issues = [];

    // 检查必需字段
    if (!doc.title || doc.title === path.basename(doc.path, '.md')) {
      issues.push('缺少标题或标题不规范');
    }

    if (!doc.version || doc.version === 'v1.0.0') {
      issues.push('版本信息缺失或为默认值');
    }

    if (!doc.lastUpdated || doc.lastUpdated === '未知') {
      issues.push('更新日期缺失');
    }

    if (!doc.status) {
      issues.push('状态信息缺失');
    }

    // 检查过期情况
    if (doc.lastUpdated !== '未知' && doc.expiryDays) {
      const daysSinceUpdate = Math.floor((new Date() - new Date(doc.lastUpdated)) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate > doc.expiryDays) {
        issues.push(`文档已过期${daysSinceUpdate - doc.expiryDays}天`);
      }
    }

    // 检查描述完整性
    if (!doc.description || doc.description.length < 10) {
      issues.push('描述信息过短或缺失');
    }

    if (issues.length === 0) {
      report.valid++;
    } else {
      report.issues.push({
        doc: doc.path,
        title: doc.title,
        issues: issues
      });
    }
  }

  // 计算质量分数
  const validRatio = report.valid / report.total;
  report.scores.format = Math.round(validRatio * 100);
  report.scores.content = Math.round(validRatio * 100);
  report.scores.timeliness = Math.round(validRatio * 100);
  report.scores.relationships = Math.round(validRatio * 100);

  return report;
}

/**
 * 生成所有索引文件
 */
async function generateAllIndexFiles(structure, options) {
  const indexGenerators = {
    [CONFIG.indexFiles.main]: generateMainIndexContent,
    [CONFIG.indexFiles.requirements]: generateRequirementsIndexContent,
    [CONFIG.indexFiles.technical]: generateTechnicalIndexContent,
    [CONFIG.indexFiles.development]: generateDevelopmentIndexContent,
    [CONFIG.indexFiles.reports]: generateReportsIndexContent
  };

  for (const [indexPath, generator] of Object.entries(indexGenerators)) {
    const content = generator(structure);

    if (options.dryRun) {
      console.log(`📋 预览 ${indexPath}:`);
      console.log('=' .repeat(50));
      console.log(content.substring(0, 500) + '...');
      console.log('=' .repeat(50));
      continue;
    }

    const fullPath = path.join(CONFIG.docsRoot, indexPath);
    fs.writeFileSync(fullPath, content, 'utf-8');

    if (options.verbose) {
      console.log(`✅ 索引文件已更新: ${indexPath}`);
    }
  }
}


/**
 * 从内容获取标题
 */
function getTitleFromContent(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.substring(2).trim();
    }
  }
  return null;
}

/**
 * 获取文档分类
 */
function getDocCategory(relativePath, config) {
  // 基于目录路径判断
  for (const [category, categoryConfig] of Object.entries(config.category_config)) {
    if (relativePath.startsWith(categoryConfig.directory.replace('docs/', ''))) {
      return category;
    }
  }

  // 基于文件名特征判断
  const fileName = path.basename(relativePath).toLowerCase();
  if (fileName.includes('requirements') || fileName.includes('需求')) {
    return 'requirements';
  }

  if (fileName.includes('api') || fileName.includes('architecture') ||
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

  // 默认分类
  return 'technical';
}

/**
 * 获取分类的过期天数
 */
function getCategoryExpiryDays(category, config) {
  const categoryConfig = config.category_config[category];
  return categoryConfig ? categoryConfig.expiry_days : 180;
}

/**
 * 获取文档类型
 */
function getDocType(fileName) {
  for (const [pattern, type] of Object.entries(CONFIG.docTypes)) {
    if (fileName.includes(pattern)) {
      return type;
    }
  }
  return '文档';
}

/**
 * 获取文档描述
 */
function getDocDescription(content) {
  const lines = content.split('\n');
  let inOverview = false;

  for (const line of lines) {
    if (line.includes('## 概述') || line.includes('## 📖 概述')) {
      inOverview = true;
      continue;
    }

    if (inOverview && line.startsWith('##')) {
      break;
    }

    if (inOverview && line.trim() && !line.startsWith('#')) {
      return line.trim().replace(/^[-*]\s*/, '');
    }
  }

  return '';
}

/**
 * 生成索引内容
 */
function generateIndexContent(structure) {
  let content = `# 前端需求文档体系

> 版本：v2.0
> 更新日期：${new Date().toISOString().split('T')[0]}
> 适用范围：Front项目 + Admin项目

---

## 📋 文档导航

### 🎯 快速开始
- **[FRONTEND_REQUIREMENTS_OVERVIEW.md](FRONTEND_REQUIREMENTS_OVERVIEW.md)** - 全站功能需求总览（推荐从这里开始）
- **[FRONTEND_REQUIREMENTS_INDEX.md](FRONTEND_REQUIREMENTS_INDEX.md)** - 完整文档索引
- **[FRONTEND_MISSING_FEATURES_REQUIREMENTS.md](FRONTEND_MISSING_FEATURES_REQUIREMENTS.md)** - 当前缺失功能补充

`;

  // 按分类生成内容
  for (const [categoryName, docs] of Object.entries(structure)) {
    content += `### ${getCategoryIcon(categoryName)} ${categoryName}\n\n`;

    if (categoryName.includes('需求文档')) {
      content += generateRequirementsSection(docs);
    } else {
      content += generateGeneralSection(docs, categoryName);
    }

    content += '\n---\n\n';
  }

  // 添加项目状态总览
  content += `## 📊 项目状态总览

### 🎯 功能完成度
- **Front项目**：${calculateCompletion(structure['前端需求文档'] || [])}% 总体完成度
- **Admin项目**：${calculateCompletion(structure['管理后台需求文档'] || [])}% 总体完成度

### 📈 设计系统完成度
- **视觉统一度**：Front 40% → Admin 60% (总体 50%)
- **交互统一度**：Front 30% → Admin 70% (总体 50%)
- **响应式适配**：PC 90% / Pad 50% / Mobile 40%

### ✅ 文档完整性
- **需求文档**：${Object.values(structure).flat().length} 份文档
- **技术文档**：${(structure['技术文档'] || []).length} 份文档
- **开发文档**：${(structure['开发文档'] || []).length} 份文档

---

## 🤝 贡献指南

### 文档维护
1. **产品经理**：需求文档内容准确性
2. **设计师**：交互和视觉规范
3. **前端开发**：实现与文档一致性
4. **测试工程师**：验收标准验证

### 文档更新流程
1. 发现文档与实现不一致
2. 提交文档更新需求
3. 相关方确认修改内容
4. 更新文档并同步通知
5. 更新索引文档版本号

---

## 📞 联系方式

如有文档相关问题或建议，请通过以下方式联系：
- **项目经理**：负责需求文档审核
- **技术负责人**：负责技术实现咨询
- **文档维护者**：负责文档格式规范

---

> 💡 **提示**：建议从 [FRONTEND_REQUIREMENTS_OVERVIEW.md](FRONTEND_REQUIREMENTS_OVERVIEW.md) 开始了解项目全貌，然后根据具体需求查看相应页面文档。
`;

  return content;
}

/**
 * 生成需求文档章节
 */
function generateRequirementsSection(docs) {
  let content = `| 文档 | 版本 | 更新日期 | 状态 | 说明 |
|------|------|----------|------|------|\n`;

  docs
    .sort((a, b) => a.title.localeCompare(b.title))
    .forEach(doc => {
      const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
      content += `| [${doc.title}](${doc.path}) | ${doc.version} | ${doc.lastUpdated} | ${statusIcon} | ${doc.description || '-'} |\n`;
    });

  return content;
}

/**
 * 生成通用文档章节
 */
function generateGeneralSection(docs, categoryName) {
  let content = '';

  docs
    .sort((a, b) => a.title.localeCompare(b.title))
    .forEach(doc => {
      const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
      content += `- ${statusIcon} **[${doc.title}](${doc.path})** - ${doc.description || '暂无描述'}\n`;
    });

  return content;
}

/**
 * 获取分类图标
 */
function getCategoryIcon(categoryName) {
  const iconMap = {
    '前端需求文档': '📱',
    '管理后台需求文档': '🛠️',
    '通用需求文档': '🔗',
    '架构文档': '🏗️',
    'API文档': '🔌',
    '数据库文档': '🗄️',
    '部署文档': '🚀',
    '开发指南': '📚',
    '测试文档': '🧪',
    '贡献指南': '🤝',
    '测试报告': '📊',
    '代码审查报告': '🔍'
  };

  return iconMap[categoryName] || '📄';
}

/**
 * 计算完成度
 */
function calculateCompletion(docs) {
  if (docs.length === 0) return 0;

  const completedDocs = docs.filter(doc => doc.status === 'active').length;
  return Math.round((completedDocs / docs.length) * 100);
}

/**
 * 生成Mermaid格式的文档关系图
 */
async function generateMermaidRelationships(structure, options) {
  const relationships = {};

  // 分析文档间的引用关系
  for (const [category, docs] of Object.entries(structure)) {
    for (const doc of docs) {
      const filePath = path.join(CONFIG.docsRoot, doc.path);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        relationships[doc.path] = findReferences(content, structure);
      }
    }
  }

  // 生成Mermaid图表
  let mermaidContent = 'graph TD\n';

  // 添加节点
  const allDocs = Object.values(structure).flat();
  allDocs.forEach(doc => {
    const nodeId = doc.path.replace(/\//g, '_').replace(/\./g, '_');
    const nodeLabel = `${doc.title}\\n(${doc.type})`;
    mermaidContent += `    ${nodeId}["${nodeLabel}"]\n`;
  });

  mermaidContent += '\n    %% 关系连线\n';

  // 添加关系连线
  for (const [sourcePath, targets] of Object.entries(relationships)) {
    const sourceId = sourcePath.replace(/\//g, '_').replace(/\./g, '_');
    targets.forEach(targetPath => {
      const targetId = targetPath.replace(/\//g, '_').replace(/\./g, '_');
      mermaidContent += `    ${sourceId} --> ${targetId}\n`;
    });
  }

  // 添加分类分组（使用subgraph）
  for (const [categoryName, docs] of Object.entries(structure)) {
    mermaidContent += `\n    subgraph "${categoryName}"\n`;
    docs.forEach(doc => {
      const nodeId = doc.path.replace(/\//g, '_').replace(/\./g, '_');
      mermaidContent += `        ${nodeId}\n`;
    });
    mermaidContent += '    end\n';
  }

  // 生成关系图文件
  const mermaidPath = path.join(CONFIG.docsRoot, 'DOC_RELATIONSHIPS.md');
  const fullContent = `# 文档关系图

> 自动生成的文档关系图，显示文档间的引用关系

\`\`\`mermaid
${mermaidContent}
\`\`\`

## 关系说明

- **节点**: 每个文档
- **连线**: 文档间的引用关系
- **分组**: 按文档分类分组

## 更新时间

${new Date().toISOString()}
`;

  fs.writeFileSync(mermaidPath, fullContent, 'utf-8');

  if (options.verbose) {
    console.log(`📊 Mermaid文档关系图已生成: ${mermaidPath}`);
  }

  // 同时生成JSON格式用于其他工具使用
  const relationshipsPath = path.join(CONFIG.docsRoot, 'DOC_RELATIONSHIPS.json');
  fs.writeFileSync(relationshipsPath, JSON.stringify(relationships, null, 2), 'utf-8');
}

/**
 * 查找文档引用
 */
function findReferences(content, structure) {
  const references = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2];

    // 只处理相对链接
    if (!url.startsWith('http') && url.includes('.md')) {
      references.push(url);
    }
  }

  return references;
}

/**
 * 更新文档版本号
 */
async function updateDocVersions(structure, options) {
  const allDocs = Object.values(structure).flat();

  for (const doc of allDocs) {
    const filePath = path.join(CONFIG.docsRoot, doc.path);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const metadata = parseDocMetadata(content);

      // 检查是否需要更新版本
      const needsUpdate = shouldUpdateVersion(metadata, content);

      if (needsUpdate) {
        const newVersion = incrementVersion(metadata.version || 'v1.0.0');
        const newLastUpdated = new Date().toISOString().split('T')[0];

        // 更新文档头部
        const updatedContent = updateDocMetadata(content, {
          version: newVersion,
          last_updated: newLastUpdated
        });

        fs.writeFileSync(filePath, updatedContent, 'utf-8');

        if (options.verbose) {
          console.log(`🔄 更新文档版本: ${doc.path} (${metadata.version} → ${newVersion})`);
        }
      }
    }
  }
}

/**
 * 判断是否需要更新版本
 */
function shouldUpdateVersion(metadata, content) {
  // 如果没有版本信息，需要添加
  if (!metadata.version) return true;

  // 如果内容有重大变更，可以考虑更新版本
  // 这里简化逻辑：如果更新日期超过30天，自动更新补丁版本
  if (metadata.last_updated) {
    const lastUpdated = new Date(metadata.last_updated);
    const daysSinceUpdate = (new Date() - lastUpdated) / (1000 * 60 * 60 * 24);

    return daysSinceUpdate > 30; // 每月更新一次补丁版本
  }

  return false;
}

/**
 * 递增版本号
 */
function incrementVersion(version) {
  // 移除v前缀进行处理
  const cleanVersion = version.replace(/^v/, '');
  const parts = cleanVersion.split('.');

  if (parts.length !== 3) return version;

  // 递增补丁版本
  const patch = parseInt(parts[2]) + 1;
  return `v${parts[0]}.${parts[1]}.${patch}`;
}

/**
 * 更新文档元数据
 */
function updateDocMetadata(content, updates) {
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontMatterMatch) {
    // 如果没有front matter，添加一个
    const frontMatter = `---
title: ${updates.title || '文档标题'}
version: ${updates.version}
last_updated: ${updates.last_updated}
---

`;
    return frontMatter + content;
  }

  let frontMatter = frontMatterMatch[1];
  const restOfContent = content.substring(frontMatterMatch[0].length);

  // 更新各个字段
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}:.*$`, 'm');
    if (regex.test(frontMatter)) {
      frontMatter = frontMatter.replace(regex, `${key}: ${value}`);
    } else {
      frontMatter += `\n${key}: ${value}`;
    }
  }

  return `---\n${frontMatter}\n---${restOfContent}`;
}

/**
 * 生成文档导航页面
 */
async function generateNavigationPage(structure, options) {
  let navContent = `# 📚 文档导航中心

> 自动生成的文档导航页面，提供便捷的文档浏览体验

## 🗂️ 文档分类导航

`;

  // 按分类生成导航
  for (const [categoryName, docs] of Object.entries(structure)) {
    navContent += `### ${getCategoryIcon(categoryName)} ${categoryName}\n\n`;

    // 按类型分组显示
    const typeGroups = {};
    docs.forEach(doc => {
      if (!typeGroups[doc.type]) {
        typeGroups[doc.type] = [];
      }
      typeGroups[doc.type].push(doc);
    });

    for (const [type, typeDocs] of Object.entries(typeGroups)) {
      navContent += `#### ${type}\n`;
      typeDocs
        .sort((a, b) => a.title.localeCompare(b.title))
        .forEach(doc => {
          const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
          navContent += `- ${statusIcon} **[${doc.title}](${doc.path})** - ${doc.description || '暂无描述'}\n`;
        });
      navContent += '\n';
    }

    navContent += '---\n\n';
  }

  // 添加搜索和索引功能
  navContent += `## 🔍 快速搜索

### 按关键词搜索

| 关键词 | 相关文档 |
|--------|----------|
| 部署 | [部署文档](technical/deployment/README.md), [Docker部署](technical/deployment/DOCKER.md) |
| 测试 | [测试策略](development/testing/TESTING_STRATEGY.md), [测试指南](development/testing/TESTING_GUIDE.md) |
| API | [API文档](technical/api/API.md), [API安全](technical/api/API_SECURITY.md) |
| 监控 | [监控设置](technical/deployment/MONITORING_SETUP.md), [监控文档](technical/deployment/MONITORING.md) |

### 按状态筛选

- ✅ **活跃文档**: 正在维护的文档
- 🔄 **草稿文档**: 正在编写的文档
- ⚠️ **废弃文档**: 已不再维护的文档

## 📊 文档统计

| 分类 | 文档数量 | 完成度 | 最新更新 |
|------|----------|--------|----------|
`;

  // 生成统计表格
  for (const [categoryName, docs] of Object.entries(structure)) {
    const total = docs.length;
    const active = docs.filter(doc => doc.status === 'active').length;
    const completionRate = total > 0 ? Math.round((active / total) * 100) : 0;
    const latestUpdate = docs
      .filter(doc => doc.lastUpdated !== '未知')
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))[0]?.lastUpdated || '未知';

    navContent += `| ${categoryName} | ${total} | ${completionRate}% | ${latestUpdate} |\n`;
  }

  navContent += `

## 🔗 相关链接

- [文档编写指南](DOCUMENTATION_GUIDE.md)
- [文档关系图](DOC_RELATIONSHIPS.md)
- [文档变更日志](CHANGELOG.md)

---
*最后更新: ${new Date().toISOString()}*
`;

  const navPath = path.join(CONFIG.docsRoot, 'NAVIGATION.md');
  fs.writeFileSync(navPath, navContent, 'utf-8');

  if (options.verbose) {
    console.log(`🧭 文档导航页面已生成: ${navPath}`);
  }
}

/**
 * 生成文档变更日志
 */
async function generateChangelog(structure, options) {
  const allDocs = Object.values(structure).flat();

  // 按更新时间排序
  const sortedDocs = allDocs
    .filter(doc => doc.lastUpdated !== '未知')
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

  let changelogContent = `# 📝 文档变更日志

> 自动生成的文档更新记录

## 📅 最新更新

`;

  // 最近30天的更新
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUpdates = sortedDocs.filter(doc => new Date(doc.lastUpdated) > thirtyDaysAgo);

  if (recentUpdates.length > 0) {
    recentUpdates.forEach(doc => {
      const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
      changelogContent += `- **${doc.lastUpdated}** ${statusIcon} [${doc.title}](${doc.path}) - ${doc.type} (${doc.category})\n`;
    });
  } else {
    changelogContent += '*最近30天内没有文档更新*\n';
  }

  changelogContent += '\n## 📊 更新统计\n\n';

  // 按月份统计
  const monthlyStats = {};
  sortedDocs.forEach(doc => {
    const month = doc.lastUpdated.substring(0, 7); // YYYY-MM
    if (!monthlyStats[month]) {
      monthlyStats[month] = { total: 0, byType: {} };
    }
    monthlyStats[month].total++;
    monthlyStats[month].byType[doc.type] = (monthlyStats[month].byType[doc.type] || 0) + 1;
  });

  for (const [month, stats] of Object.entries(monthlyStats).sort().reverse()) {
    changelogContent += `### ${month}\n`;
    changelogContent += `- 总更新数: ${stats.total}\n`;
    for (const [type, count] of Object.entries(stats.byType)) {
      changelogContent += `  - ${type}: ${count}\n`;
    }
    changelogContent += '\n';
  }

  changelogContent += `## 📈 文档健康度

- **总文档数**: ${allDocs.length}
- **活跃文档**: ${allDocs.filter(doc => doc.status === 'active').length}
- **草稿文档**: ${allDocs.filter(doc => doc.status === 'draft').length}
- **废弃文档**: ${allDocs.filter(doc => doc.status === 'deprecated').length}

## 🔄 版本变更记录

| 文档 | 当前版本 | 最后更新 | 状态 |
|------|----------|----------|------|
`;

  sortedDocs.slice(0, 20).forEach(doc => { // 只显示最近20个更新的文档
    const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
    changelogContent += `| [${doc.title}](${doc.path}) | ${doc.version} | ${doc.lastUpdated} | ${statusIcon} |\n`;
  });

  changelogContent += `

---
*自动生成于: ${new Date().toISOString()}*
`;

  const changelogPath = path.join(CONFIG.docsRoot, 'DOC_CHANGELOG.md');
  fs.writeFileSync(changelogPath, changelogContent, 'utf-8');

  if (options.verbose) {
    console.log(`📝 文档变更日志已生成: ${changelogPath}`);
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
文档索引更新工具

使用方法:
  node docs/scripts/update-doc-index.js [options]

选项:
  --dry-run         预览模式，不实际写入文件
  --verbose         详细输出
  --update-versions 自动更新文档版本号
  --help            显示帮助信息

示例:
  # 更新文档索引
  node docs/scripts/update-doc-index.js

  # 自动更新版本号并生成所有内容
  node docs/scripts/update-doc-index.js --update-versions

  # 预览模式
  node docs/scripts/update-doc-index.js --dry-run --verbose

  # 详细输出
  node docs/scripts/update-doc-index.js --verbose
`);
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('更新过程中发生错误:', error);
    process.exit(1);
  });
}

/**
 * 生成主索引内容
 */
function generateMainIndexContent(structure) {
  const allDocs = Object.values(structure).flat();
  const totalDocs = allDocs.length;
  const activeDocs = allDocs.filter(doc => doc.status === 'active').length;

  let content = `---
title: 文档索引
version: v1.0.0
last_updated: ${new Date().toISOString().split('T')[0]}
status: active
category: technical
---

# 📚 健身房综合管理系统文档索引

> **版本**：v1.0.0
> **更新日期**：${new Date().toISOString().split('T')[0]}
> **适用范围**：项目文档导航
> **关键词**：文档索引, 导航, 健身房管理系统

---

## 📋 目录

- [快速开始](#快速开始)
- [文档分类导航](#文档分类导航)
- [核心文档](#核心文档)
- [文档统计](#文档统计)
- [更新记录](#更新记录)

---

## 🚀 快速开始

### 新成员入门

如果您是项目新成员，建议按以下顺序阅读：

1. **[项目概览](README.md)** - 了解项目基本信息
2. **[系统架构](ARCHITECTURE.md)** - 理解系统整体设计
3. **[开发指南](development/guides/DEVELOPMENT.md)** - 掌握开发规范
4. **[部署指南](technical/deployment/DOCKER.md)** - 了解部署流程

### 按角色查找文档

| 角色 | 推荐文档 | 说明 |
|------|----------|------|
| **产品经理** | [需求文档索引](requirements/INDEX.md) | 功能需求和用户界面设计 |
| **开发人员** | [技术文档索引](technical/INDEX.md) | 架构、API、数据库等 |
| **测试人员** | [开发文档索引](development/INDEX.md) | 测试策略和指南 |
| **运维人员** | [部署文档](technical/deployment/) | 部署和运维相关 |

---

## 🗂️ 文档分类导航

### 📋 需求文档 (Requirements)

面向产品和业务人员，描述系统功能和用户体验。

- **[需求文档索引](requirements/INDEX.md)** - 完整需求文档列表
- **[前端需求概览](requirements/frontend/FRONTEND_REQUIREMENTS_OVERVIEW.md)** - 前端功能需求总览

### 🔧 技术文档 (Technical)

面向开发和运维人员，描述技术实现和系统架构。

- **[技术文档索引](technical/INDEX.md)** - 完整技术文档列表
- **[系统架构](ARCHITECTURE.md)** - 整体架构设计
- **[API 文档](technical/api/API.md)** - 接口规范和说明
- **[数据库设计](technical/database/DATABASE.md)** - 数据模型和结构

### 🛠️ 开发文档 (Development)

面向开发团队，描述开发流程和规范。

- **[开发文档索引](development/INDEX.md)** - 完整开发文档列表
- **[开发指南](development/guides/DEVELOPMENT.md)** - 开发规范和流程
- **[测试策略](development/testing/TESTING_STRATEGY.md)** - 测试方法和标准
- **[CI/CD 指南](development/guides/CI_CD_GUIDE.md)** - 持续集成和部署

### 📊 报告文档 (Reports)

项目进展、测试结果和分析报告。

- **[报告文档索引](reports/INDEX.md)** - 完整报告文档列表
- **[测试报告](reports/test-reports/)** - 测试结果和覆盖率

---

## ⭐ 核心文档

### 项目基础

| 文档 | 说明 | 重要性 |
|------|------|--------|
| [README](README.md) | 项目介绍和快速开始 | ⭐⭐⭐⭐⭐ |
| [ARCHITECTURE](ARCHITECTURE.md) | 系统架构设计 | ⭐⭐⭐⭐⭐ |
| [CHANGELOG](CHANGELOG.md) | 版本变更记录 | ⭐⭐⭐⭐ |

### 开发必读

| 文档 | 说明 | 重要性 |
|------|------|--------|
| [开发指南](development/guides/DEVELOPMENT.md) | 开发规范和流程 | ⭐⭐⭐⭐⭐ |
| [测试策略](development/testing/TESTING_STRATEGY.md) | 测试方法和标准 | ⭐⭐⭐⭐⭐ |
| [API 文档](technical/api/API.md) | 接口规范 | ⭐⭐⭐⭐⭐ |
| [数据库设计](technical/database/DATABASE.md) | 数据模型 | ⭐⭐⭐⭐ |

---

## 📊 文档统计

### 总体统计

| 分类 | 文档数量 | 占比 | 状态 |
|------|----------|------|------|
`;

  // 生成分类统计
  const categoryStats = {};
  for (const [category, docs] of Object.entries(structure)) {
    categoryStats[category] = {
      total: docs.length,
      active: docs.filter(doc => doc.status === 'active').length
    };
  }

  for (const [category, stats] of Object.entries(categoryStats)) {
    const percentage = Math.round((stats.total / totalDocs) * 100);
    content += `| ${getCategoryDisplayName(category)} | ${stats.total} | ${percentage}% | ${stats.active}/${stats.total} 活跃 |\n`;
  }

  content += `| **总计** | **${totalDocs}** | **100%** | **${activeDocs}** 活跃 |

### 文档质量指标

| 指标 | 当前状态 | 目标状态 |
|------|----------|----------|
| 格式规范性 | ${Math.round((activeDocs / totalDocs) * 100)}% | 100% |
| 内容完整性 | 待评估 | 优质文档 80%+ |
| 更新及时性 | 待评估 | 90% 三个月内更新 |
| 分类清晰性 | ${Object.keys(categoryStats).length} 个分类 | 4 个标准分类 |

---

## 🔍 文档搜索和导航

### 快速搜索

| 关键词 | 相关文档 |
|--------|----------|
| **用户界面** | 前端需求文档、设计系统 |
| **数据模型** | 数据库文档、API 文档 |
| **测试** | 测试策略、测试报告 |
| **部署** | 部署文档、Docker 配置 |
| **架构** | 架构文档、系统设计 |

---

## 📝 更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|----------|--------|
| ${new Date().toISOString().split('T')[0]} | v1.0.0 | 初始版本，建立文档索引体系 | 文档工程团队 |

---

*本文档由自动化工具生成和维护，最后更新时间：${new Date().toISOString()}*
`;

  return content;
}

/**
 * 生成需求文档索引内容
 */
function generateRequirementsIndexContent(structure) {
  const requirements = structure.requirements || [];
  const frontendReqs = requirements.filter(doc => doc.path.includes('frontend/'));
  const adminReqs = requirements.filter(doc => doc.path.includes('admin/'));

  let content = `---
title: 需求文档索引
version: v1.0.0
last_updated: ${new Date().toISOString().split('T')[0]}
status: active
category: requirements
---

# 📋 需求文档索引

> **版本**：v1.0.0
> **更新日期**：${new Date().toISOString().split('T')[0]}
> **适用范围**：需求文档导航
> **关键词**：需求文档, 功能规格, 用户界面

---

## 📖 概述

### 文档定位

需求文档是健身房综合管理系统的基础，定义了系统的功能范围、用户界面设计、业务流程和验收标准。

### 文档统计

| 分类 | 文档数量 | 占比 | 状态 |
|------|----------|------|------|
| 前端需求文档 | ${frontendReqs.length} | ${Math.round((frontendReqs.length / requirements.length) * 100)}% | ✅ 完整 |
| 管理后台需求文档 | ${adminReqs.length} | ${Math.round((adminReqs.length / requirements.length) * 100)}% | ✅ 完整 |
| **总计** | **${requirements.length}** | **100%** | |

---

## 🌐 前端需求文档

### 核心功能模块

| 文档 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
`;

  frontendReqs.forEach(doc => {
    const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
    content += `| [${doc.title}](${doc.path}) | ${statusIcon} | ${doc.lastUpdated} | ${doc.description || '-'} |\n`;
  });

  content += `
### 管理后台需求文档

| 文档 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
`;

  adminReqs.forEach(doc => {
    const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
    content += `| [${doc.title}](${doc.path}) | ${statusIcon} | ${doc.lastUpdated} | ${doc.description || '-'} |\n`;
  });

  content += `
---

## 📝 更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|----------|--------|
| ${new Date().toISOString().split('T')[0]} | v1.0.0 | 初始版本，建立需求文档索引 | 文档工程团队 |

---

*本文档由自动化工具生成和维护，最后更新时间：${new Date().toISOString()}*
`;

  return content;
}

/**
 * 生成技术文档索引内容
 */
function generateTechnicalIndexContent(structure) {
  const technical = structure.technical || [];

  let content = `---
title: 技术文档索引
version: v1.0.0
last_updated: ${new Date().toISOString().split('T')[0]}
status: active
category: technical
---

# 🔧 技术文档索引

> **版本**：v1.0.0
> **更新日期**：${new Date().toISOString().split('T')[0]}
> **适用范围**：技术文档导航
> **关键词**：技术文档, 系统架构, API, 数据库

---

## 📖 概述

### 技术栈概览

- **后端**：Spring Boot、Java 17、MySQL、Redis
- **前端**：Vue.js 3、Vite、TypeScript
- **部署**：Docker、Nginx、GitHub Actions

### 文档统计

| 分类 | 文档数量 | 占比 | 状态 |
|------|----------|------|------|
| 架构文档 | ${technical.filter(doc => doc.path.includes('architecture')).length} | - | ✅ |
| API 文档 | ${technical.filter(doc => doc.path.includes('api')).length} | - | ✅ |
| 数据库文档 | ${technical.filter(doc => doc.path.includes('database')).length} | - | ✅ |
| 部署文档 | ${technical.filter(doc => doc.path.includes('deployment')).length} | - | ✅ |
| **总计** | **${technical.length}** | **100%** | |

---

## 🏗️ 架构文档

| 文档 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
`;

  technical.filter(doc => doc.path.includes('architecture')).forEach(doc => {
    const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
    content += `| [${doc.title}](${doc.path}) | ${statusIcon} | ${doc.lastUpdated} | ${doc.description || '-'} |\n`;
  });

  content += `
## 🔌 API 文档

| 文档 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
`;

  technical.filter(doc => doc.path.includes('api')).forEach(doc => {
    const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
    content += `| [${doc.title}](${doc.path}) | ${statusIcon} | ${doc.lastUpdated} | ${doc.description || '-'} |\n`;
  });

  content += `
## 🗄️ 数据库文档

| 文档 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
`;

  technical.filter(doc => doc.path.includes('database')).forEach(doc => {
    const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
    content += `| [${doc.title}](${doc.path}) | ${statusIcon} | ${doc.lastUpdated} | ${doc.description || '-'} |\n`;
  });

  content += `
## 🚀 部署文档

| 文档 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
`;

  technical.filter(doc => doc.path.includes('deployment')).forEach(doc => {
    const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
    content += `| [${doc.title}](${doc.path}) | ${statusIcon} | ${doc.lastUpdated} | ${doc.description || '-'} |\n`;
  });

  content += `
---

## 📝 更新记录

| 日期 | 版本 | 更新日期 | 更新内容 | 更新人 |
|------|------|----------|--------|
| ${new Date().toISOString().split('T')[0]} | v1.0.0 | 初始版本，建立技术文档索引 | 文档工程团队 |

---

*本文档由自动化工具生成和维护，最后更新时间：${new Date().toISOString()}*
`;

  return content;
}

/**
 * 生成开发文档索引内容
 */
function generateDevelopmentIndexContent(structure) {
  const development = structure.development || [];

  let content = `---
title: 开发文档索引
version: v1.0.0
last_updated: ${new Date().toISOString().split('T')[0]}
status: active
category: development
---

# 🛠️ 开发文档索引

> **版本**：v1.0.0
> **更新日期**：${new Date().toISOString().split('T')[0]}
> **适用范围**：开发文档导航
> **关键词**：开发文档, 指南, 测试, CI/CD

---

## 📖 概述

### 文档统计

| 分类 | 文档数量 | 占比 | 状态 |
|------|----------|------|------|
| 开发指南 | ${development.filter(doc => doc.path.includes('guides')).length} | - | ✅ |
| 测试文档 | ${development.filter(doc => doc.path.includes('testing')).length} | - | ✅ |
| **总计** | **${development.length}** | **100%** | |

---

## 📚 开发指南

| 文档 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
`;

  development.filter(doc => doc.path.includes('guides')).forEach(doc => {
    const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
    content += `| [${doc.title}](${doc.path}) | ${statusIcon} | ${doc.lastUpdated} | ${doc.description || '-'} |\n`;
  });

  content += `
## 🧪 测试文档

| 文档 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
`;

  development.filter(doc => doc.path.includes('testing')).forEach(doc => {
    const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
    content += `| [${doc.title}](${doc.path}) | ${statusIcon} | ${doc.lastUpdated} | ${doc.description || '-'} |\n`;
  });

  content += `
---

## 📝 更新记录

| 日期 | 版本 | 更新日期 | 更新内容 | 更新人 |
|------|------|----------|--------|
| ${new Date().toISOString().split('T')[0]} | v1.0.0 | 初始版本，建立开发文档索引 | 文档工程团队 |

---

*本文档由自动化工具生成和维护，最后更新时间：${new Date().toISOString()}*
`;

  return content;
}

/**
 * 生成报告文档索引内容
 */
function generateReportsIndexContent(structure) {
  const reports = structure.reports || [];

  let content = `---
title: 报告文档索引
version: v1.0.0
last_updated: ${new Date().toISOString().split('T')[0]}
status: active
category: reports
---

# 📊 报告文档索引

> **版本**：v1.0.0
> **更新日期**：${new Date().toISOString().split('T')[0]}
> **适用范围**：报告文档导航
> **关键词**：报告文档, 测试报告, 代码审查

---

## 📖 概述

### 文档统计

| 分类 | 文档数量 | 占比 | 状态 |
|------|----------|------|------|
| 测试报告 | ${reports.filter(doc => doc.path.includes('test-reports')).length} | - | ✅ |
| 代码审查 | ${reports.filter(doc => doc.path.includes('code-reviews')).length} | - | ✅ |
| **总计** | **${reports.length}** | **100%** | |

---

## 🧪 测试报告

| 报告 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
`;

  reports.filter(doc => doc.path.includes('test-reports')).forEach(doc => {
    const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
    content += `| [${doc.title}](${doc.path}) | ${statusIcon} | ${doc.lastUpdated} | ${doc.description || '-'} |\n`;
  });

  content += `
## 🔍 代码审查记录

| 报告 | 状态 | 更新日期 | 说明 |
|------|------|----------|------|
`;

  reports.filter(doc => doc.path.includes('code-reviews')).forEach(doc => {
    const statusIcon = CONFIG.statusIcons[doc.status] || '❓';
    content += `| [${doc.title}](${doc.path}) | ${statusIcon} | ${doc.lastUpdated} | ${doc.description || '-'} |\n`;
  });

  content += `
---

## 📝 更新记录

| 日期 | 版本 | 更新日期 | 更新内容 | 更新人 |
|------|------|----------|--------|
| ${new Date().toISOString().split('T')[0]} | v1.0.0 | 初始版本，建立报告文档索引 | 文档工程团队 |

---

*本文档由自动化工具生成和维护，最后更新时间：${new Date().toISOString()}*
`;

  return content;
}

/**
 * 获取分类显示名称
 */
function getCategoryDisplayName(category) {
  const names = {
    'requirements': '需求文档',
    'technical': '技术文档',
    'development': '开发文档',
    'reports': '报告文档'
  };
  return names[category] || category;
}

module.exports = {
  scanDocStructure,
  generateIndexContent,
  getDocCategory,
  updateDocVersions,
  generateMermaidRelationships,
  generateNavigationPage,
  generateChangelog,
  incrementVersion,
  updateDocMetadata,
  checkDocQuality,
  generateAllIndexFiles,
  generateMainIndexContent,
  generateRequirementsIndexContent,
  generateTechnicalIndexContent,
  generateDevelopmentIndexContent,
  generateReportsIndexContent
};
