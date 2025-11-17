#!/usr/bin/env node

/**
 * 文档生命周期管理工具
 *
 * 功能：
 * - 管理文档状态转换
 * - 自动化审查流程
 * - 生命周期监控和报告
 * - 文档归档管理
 *
 * 使用方法：
 * node docs/scripts/manage-doc-lifecycle.js [command] [options]
 *
 * 命令：
 * status          显示文档状态
 * promote         提升文档状态
 * review          发起审查流程
 * archive         归档文档
 * report          生成生命周期报告
 *
 * 选项：
 * --file <file>   指定文档文件
 * --status <status> 目标状态
 * --help          显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

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

  // 文档状态
  statuses: ['draft', 'review', 'approved', 'published', 'archived'],

  // 状态转换规则
  transitions: {
    draft: ['review', 'archived'],
    review: ['draft', 'approved', 'archived'],
    approved: ['review', 'published', 'archived'],
    published: ['review', 'archived'],
    archived: [] // 归档状态不可逆转
  },

  // 审查配置
  review: {
    minReviewers: 1,
    maxReviewTime: 7 * 24 * 60 * 60 * 1000, // 7天
    autoApproveThreshold: 0.8 // 80%通过率自动批准
  }
};

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    command: 'status',
    file: null,
    status: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case 'status':
      case 'promote':
      case 'review':
      case 'archive':
      case 'report':
        options.command = arg;
        break;
      case '--file':
        options.file = args[++i];
        break;
      case '--status':
        options.status = args[++i];
        break;
      case '--help':
        options.help = true;
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`未知选项: ${arg}`);
          process.exit(1);
        } else if (!options.file) {
          options.file = arg;
        }
    }
  }

  return options;
}

// 显示帮助信息
function showHelp() {
  console.log(`
文档生命周期管理工具

使用方法:
  node docs/scripts/manage-doc-lifecycle.js [command] [options]

命令:
  status          显示文档状态 (默认)
  promote         提升文档状态
  review          发起审查流程
  archive         归档文档
  report          生成生命周期报告

选项:
  --file <file>   指定文档文件
  --status <status> 目标状态 (用于promote命令)
  --help          显示帮助信息

示例:
  # 显示所有文档状态
  node docs/scripts/manage-doc-lifecycle.js status

  # 显示特定文档状态
  node docs/scripts/manage-doc-lifecycle.js status --file docs/README.md

  # 提升文档状态
  node docs/scripts/manage-doc-lifecycle.js promote --file docs/README.md --status review

  # 发起审查
  node docs/scripts/manage-doc-lifecycle.js review --file docs/README.md

  # 归档文档
  node docs/scripts/manage-doc-lifecycle.js archive --file docs/README.md

  # 生成报告
  node docs/scripts/manage-doc-lifecycle.js report
`);
}

// 读取文档元数据
function readDocMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const metadataMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!metadataMatch) {
      return null;
    }

    const metadata = {};
    const lines = metadataMatch[1].split('\n');

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        metadata[key.trim()] = value;
      }
    }

    return metadata;
  } catch (error) {
    console.warn(`⚠️ 无法读取文档 ${filePath}: ${error.message}`);
    return null;
  }
}

// 更新文档元数据
function updateDocMetadata(filePath, updates) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const metadataMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!metadataMatch) {
      console.error(`❌ 文档 ${filePath} 缺少元数据头部`);
      return false;
    }

    const metadata = {};
    const lines = metadataMatch[1].split('\n');

    // 解析现有元数据
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        metadata[key.trim()] = value;
      }
    }

    // 应用更新
    Object.assign(metadata, updates);

    // 重新生成元数据字符串
    const newMetadataLines = Object.entries(metadata).map(([key, value]) => `${key}: ${value}`);
    const newMetadata = `---\n${newMetadataLines.join('\n')}\n---`;

    // 替换内容
    content = content.replace(/^---\n[\s\S]*?\n---/, newMetadata);

    // 写入文件
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`❌ 更新文档元数据失败 ${filePath}: ${error.message}`);
    return false;
  }
}

// 显示文档状态
async function showStatus(options) {
  const patterns = [`${CONFIG.docsRoot}/**/*.md`];
  const files = await glob(patterns, { ignore: ['**/node_modules/**'] });

  if (options.file) {
    // 显示特定文档状态
    const metadata = readDocMetadata(options.file);
    if (metadata) {
      console.log(`📄 ${options.file}`);
      console.log(`   状态: ${metadata.status || 'unknown'}`);
      console.log(`   版本: ${metadata.version || 'unknown'}`);
      console.log(`   更新时间: ${metadata.last_updated || 'unknown'}`);
      console.log(`   分类: ${metadata.category || 'unknown'}`);
    } else {
      console.error(`❌ 无法读取文档 ${options.file}`);
    }
  } else {
    // 显示所有文档状态统计
    const statusCounts = {};
    const categoryCounts = {};

    for (const file of files) {
      const metadata = readDocMetadata(file);
      if (metadata) {
        const status = metadata.status || 'unknown';
        const category = metadata.category || 'unknown';

        statusCounts[status] = (statusCounts[status] || 0) + 1;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    }

    console.log('📊 文档状态统计:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} 个文档`);
    });

    console.log('\n📂 文档分类统计:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} 个文档`);
    });

    console.log(`\n📋 总计: ${files.length} 个文档文件`);
  }
}

// 提升文档状态
function promoteStatus(options) {
  if (!options.file || !options.status) {
    console.error('❌ 请指定文档文件和目标状态');
    console.log('使用方法: node manage-doc-lifecycle.js promote --file <file> --status <status>');
    return;
  }

  const metadata = readDocMetadata(options.file);
  if (!metadata) {
    console.error(`❌ 无法读取文档 ${options.file}`);
    return;
  }

  const currentStatus = metadata.status;
  const targetStatus = options.status;

  // 验证状态转换
  if (!CONFIG.statuses.includes(targetStatus)) {
    console.error(`❌ 无效的目标状态: ${targetStatus}`);
    console.log(`有效状态: ${CONFIG.statuses.join(', ')}`);
    return;
  }

  if (currentStatus && !CONFIG.transitions[currentStatus]?.includes(targetStatus)) {
    console.error(`❌ 无法从 ${currentStatus} 转换为 ${targetStatus}`);
    console.log(`允许的转换: ${CONFIG.transitions[currentStatus]?.join(', ') || '无'}`);
    return;
  }

  // 更新状态
  const updates = {
    status: targetStatus,
    last_updated: new Date().toISOString().split('T')[0]
  };

  if (updateDocMetadata(options.file, updates)) {
    console.log(`✅ 文档状态已更新: ${currentStatus || 'unknown'} → ${targetStatus}`);
    console.log(`📄 ${options.file}`);
  }
}

// 发起审查流程
function startReview(options) {
  if (!options.file) {
    console.error('❌ 请指定要审查的文档文件');
    return;
  }

  const metadata = readDocMetadata(options.file);
  if (!metadata) {
    console.error(`❌ 无法读取文档 ${options.file}`);
    return;
  }

  // 更新状态为review
  const updates = {
    status: 'review',
    last_updated: new Date().toISOString().split('T')[0]
  };

  if (updateDocMetadata(options.file, updates)) {
    console.log(`🔍 文档已提交审查:`);
    console.log(`📄 ${options.file}`);
    console.log(`👥 需要至少 ${CONFIG.review.minReviewers} 位审查者`);
    console.log(`⏰ 审查期限: ${CONFIG.review.maxReviewTime / (24 * 60 * 60 * 1000)} 天`);
  }
}

// 归档文档
function archiveDocument(options) {
  if (!options.file) {
    console.error('❌ 请指定要归档的文档文件');
    return;
  }

  const metadata = readDocMetadata(options.file);
  if (!metadata) {
    console.error(`❌ 无法读取文档 ${options.file}`);
    return;
  }

  // 更新状态为archived
  const updates = {
    status: 'archived',
    last_updated: new Date().toISOString().split('T')[0]
  };

  if (updateDocMetadata(options.file, updates)) {
    console.log(`📦 文档已归档:`);
    console.log(`📄 ${options.file}`);
    console.log(`📅 归档时间: ${updates.last_updated}`);
  }
}

// 生成生命周期报告
async function generateReport(options) {
  const patterns = [`${CONFIG.docsRoot}/**/*.md`];
  const files = await glob(patterns, { ignore: ['**/node_modules/**'] });

  const report = {
    summary: {
      total: files.length,
      byStatus: {},
      byCategory: {},
      outdated: 0,
      needsReview: 0
    },
    details: []
  };

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (const file of files) {
    const metadata = readDocMetadata(file);
    if (metadata) {
      const status = metadata.status || 'unknown';
      const category = metadata.category || 'unknown';
      const lastUpdated = metadata.last_updated ? new Date(metadata.last_updated) : null;

      // 统计状态
      report.summary.byStatus[status] = (report.summary.byStatus[status] || 0) + 1;

      // 统计分类
      report.summary.byCategory[category] = (report.summary.byCategory[category] || 0) + 1;

      // 检查过期文档
      if (!lastUpdated || lastUpdated < thirtyDaysAgo) {
        report.summary.outdated++;
      }

      // 检查需要审查的文档
      if (status === 'review') {
        report.summary.needsReview++;
      }

      report.details.push({
        file: path.relative(CONFIG.docsRoot, file),
        status,
        category,
        version: metadata.version,
        lastUpdated: metadata.last_updated,
        outdated: !lastUpdated || lastUpdated < thirtyDaysAgo
      });
    }
  }

  // 生成报告内容
  let content = `# 📊 文档生命周期报告

> **生成时间**: ${now.toISOString()}
> **文档总数**: ${report.summary.total}

## 📈 统计概览

### 状态分布
`;

  Object.entries(report.summary.byStatus).forEach(([status, count]) => {
    const percentage = ((count / report.summary.total) * 100).toFixed(1);
    content += `- ${status}: ${count} 个 (${percentage}%)\n`;
  });

  content += `
### 分类分布
`;
  Object.entries(report.summary.byCategory).forEach(([category, count]) => {
    content += `- ${category}: ${count} 个\n`;
  });

  content += `
### 健康指标
- 📅 过期文档: ${report.summary.outdated} 个
- 🔍 待审查文档: ${report.summary.needsReview} 个
- ✅ 正常文档: ${report.summary.total - report.summary.outdated - report.summary.needsReview} 个

## 📋 详细列表

| 文档 | 状态 | 分类 | 版本 | 更新时间 | 状态 |
|------|------|------|------|----------|------|
`;

  report.details.forEach(doc => {
    const status = doc.outdated ? '过期' : '正常';
    content += `| ${doc.file} | ${doc.status} | ${doc.category} | ${doc.version || '-'} | ${doc.lastUpdated || '-'} | ${status} |\n`;
  });

  // 保存报告
  const reportPath = `${CONFIG.docsRoot}/reports/DOC_LIFECYCLE_REPORT.md`;
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, content, 'utf-8');
  console.log(`✅ 生命周期报告已生成: ${reportPath}`);
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
      case 'status':
        await showStatus(options);
        break;
      case 'promote':
        promoteStatus(options);
        break;
      case 'review':
        startReview(options);
        break;
      case 'archive':
        archiveDocument(options);
        break;
      case 'report':
        await generateReport(options);
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
  readDocMetadata,
  updateDocMetadata,
  CONFIG
};
