#!/usr/bin/env node

/**
 * 文档工程调查数据收集脚本
 *
 * 功能：
 * - 文档数量统计（按分类、按类型、按状态）
 * - 文档质量指标统计
 * - Git历史分析
 * - 文档关联关系分析
 * - 文档格式规范检查
 *
 * 使用方法：
 * node docs/scripts/survey-data-collector.js [options]
 *
 * 选项：
 * --stats           生成基本统计数据
 * --quality         生成质量分析数据
 * --history         生成历史趋势数据
 * --relationships   生成关联关系数据
 * --all             生成所有数据（默认）
 * --output <dir>    输出目录（默认: docs/reports/survey-data/）
 * --help            显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { glob } = require('glob');

// 配置
const CONFIG = {
  // 文档根目录
  docsRoot: 'docs',

  // 输出目录
  outputDir: 'docs/reports/survey-data',

  // 分类映射
  categories: {
    'requirements/': '需求文档',
    'technical/': '技术文档',
    'development/': '开发文档',
    'reports/': '报告文档',
    'templates/': '模板文档'
  },

  // 状态映射
  statuses: {
    'active': '活跃',
    'deprecated': '废弃',
    'draft': '草稿'
  }
};

// 工具函数
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function writeMarkdown(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

function getGitHistory(filePath) {
  try {
    const cmd = `git log --follow --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso -- "${filePath}"`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    return output.split('\n').filter(line => line.trim()).map(line => {
      const [hash, author, email, date, subject] = line.split('|');
      return { hash, author, email, date, subject };
    });
  } catch (error) {
    return [];
  }
}

function parseDocMetadata(content) {
  const metadata = {};
  const lines = content.split('\n');

  let inHeader = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === '---') {
      if (!inHeader) {
        inHeader = true;
      } else {
        break;
      }
      continue;
    }

    if (inHeader && line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      metadata[key.trim()] = value;
    }
  }

  return metadata;
}

// 数据收集函数
async function collectBasicStats() {
  console.log('📊 收集基本统计数据...');

  const stats = {
    timestamp: new Date().toISOString(),
    total: 0,
    byCategory: {},
    byStatus: {},
    byType: {},
    metadataStats: {
      withVersion: 0,
      withLastUpdated: 0,
      withStatus: 0,
      withCategory: 0
    }
  };

  // 扫描所有文档
  const pattern = `${CONFIG.docsRoot}/**/*.md`;
  const files = await glob(pattern);

  for (const file of files) {
    const relativePath = path.relative(CONFIG.docsRoot, file);
    stats.total++;

    // 分类统计
    const category = Object.keys(CONFIG.categories).find(cat => relativePath.startsWith(cat));
    if (category) {
      stats.byCategory[CONFIG.categories[category]] = (stats.byCategory[CONFIG.categories[category]] || 0) + 1;
    } else {
      stats.byCategory['其他'] = (stats.byCategory['其他'] || 0) + 1;
    }

    // 读取文件内容检查元数据
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const metadata = parseDocMetadata(content);

      // 状态统计
      if (metadata.status) {
        stats.byStatus[CONFIG.statuses[metadata.status] || metadata.status] =
          (stats.byStatus[CONFIG.statuses[metadata.status] || metadata.status] || 0) + 1;
      }

      // 元数据统计
      if (metadata.version) stats.metadataStats.withVersion++;
      if (metadata.last_updated) stats.metadataStats.withLastUpdated++;
      if (metadata.status) stats.metadataStats.withStatus++;
      if (metadata.category) stats.metadataStats.withCategory++;

    } catch (error) {
      console.warn(`⚠️  无法读取文件 ${file}:`, error.message);
    }
  }

  return stats;
}

async function collectQualityData() {
  console.log('🔍 收集质量分析数据...');

  const quality = {
    timestamp: new Date().toISOString(),
    formatIssues: [],
    contentIssues: [],
    linkIssues: [],
    metadataCompleteness: {}
  };

  const pattern = `${CONFIG.docsRoot}/**/*.md`;
  const files = await glob(pattern);

  for (const file of files) {
    const relativePath = path.relative(CONFIG.docsRoot, file);

    try {
      const content = fs.readFileSync(file, 'utf-8');

      // 检查格式问题
      if (!content.includes('---')) {
        quality.formatIssues.push({
          file: relativePath,
          issue: '缺少文档头部元数据'
        });
      }

      // 检查内容问题
      if (content.length < 100) {
        quality.contentIssues.push({
          file: relativePath,
          issue: '文档内容过短'
        });
      }

      // 检查链接问题
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(content)) !== null) {
        const link = match[2];
        if (link.startsWith('../') || link.startsWith('./')) {
          // 检查内部链接是否存在
          const linkPath = path.resolve(path.dirname(file), link);
          if (!fs.existsSync(linkPath) && !fs.existsSync(linkPath.replace(/\.md$/, '') + '.md')) {
            quality.linkIssues.push({
              file: relativePath,
              link: link,
              issue: '内部链接指向不存在的文件'
            });
          }
        }
      }

    } catch (error) {
      quality.formatIssues.push({
        file: relativePath,
        issue: `文件读取错误: ${error.message}`
      });
    }
  }

  return quality;
}

async function collectHistoryData() {
  console.log('📈 收集历史趋势数据...');

  const history = {
    timestamp: new Date().toISOString(),
    commits: [],
    fileHistories: {}
  };

  try {
    // 获取所有文档的Git历史
    const cmd = `git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso --name-only --since="2024-01-01" -- docs/`;
    const output = execSync(cmd, { encoding: 'utf-8' });

    const lines = output.split('\n');
    let currentCommit = null;

    for (const line of lines) {
      if (line.includes('|')) {
        // 这是提交信息行
        const [hash, author, email, date, subject] = line.split('|');
        currentCommit = { hash, author, email, date, subject, files: [] };
        history.commits.push(currentCommit);
      } else if (line.trim() && currentCommit) {
        // 这是文件路径行
        if (line.startsWith('docs/')) {
          currentCommit.files.push(line);
        }
      }
    }

  } catch (error) {
    console.warn('⚠️  获取Git历史失败:', error.message);
  }

  // 分析各文件的详细历史
  const pattern = `${CONFIG.docsRoot}/**/*.md`;
  const files = await glob(pattern);

  for (const file of files) {
    const relativePath = path.relative(CONFIG.docsRoot, file);
    const fileHistory = getGitHistory(file);

    if (fileHistory.length > 0) {
      history.fileHistories[relativePath] = {
        commitCount: fileHistory.length,
        firstCommit: fileHistory[fileHistory.length - 1],
        lastCommit: fileHistory[0],
        authors: [...new Set(fileHistory.map(c => c.author))]
      };
    }
  }

  return history;
}

async function collectRelationshipsData() {
  console.log('🔗 收集关联关系数据...');

  const relationships = {
    timestamp: new Date().toISOString(),
    links: {},
    references: {},
    dependencies: {}
  };

  const pattern = `${CONFIG.docsRoot}/**/*.md`;
  const files = await glob(pattern);

  for (const file of files) {
    const relativePath = path.relative(CONFIG.docsRoot, file);

    try {
      const content = fs.readFileSync(file, 'utf-8');

      // 分析内部链接
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(content)) !== null) {
        const link = match[2];
        if (link.startsWith('../') || link.startsWith('./') || link.startsWith('docs/')) {
          // 标准化链接路径
          let normalizedLink = link;
          if (link.startsWith('docs/')) {
            normalizedLink = link.substring(5);
          }

          if (!relationships.links[relativePath]) {
            relationships.links[relativePath] = [];
          }
          relationships.links[relativePath].push({
            text: match[1],
            target: normalizedLink
          });
        }
      }

      // 分析文档引用
      const metadata = parseDocMetadata(content);
      if (metadata.tags) {
        const tags = metadata.tags.split(',').map(tag => tag.trim());
        relationships.references[relativePath] = tags;
      }

    } catch (error) {
      console.warn(`⚠️  无法分析文件 ${file}:`, error.message);
    }
  }

  return relationships;
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const options = {
    stats: args.includes('--stats') || args.includes('--all') || args.length === 0,
    quality: args.includes('--quality') || args.includes('--all') || args.length === 0,
    history: args.includes('--history') || args.includes('--all') || args.length === 0,
    relationships: args.includes('--relationships') || args.includes('--all') || args.length === 0,
    output: args.find(arg => arg.startsWith('--output='))?.split('=')[1] || CONFIG.outputDir
  };

  if (args.includes('--help')) {
    console.log(`
文档工程调查数据收集脚本

使用方法:
  node docs/scripts/survey-data-collector.js [options]

选项:
  --stats           生成基本统计数据
  --quality         生成质量分析数据
  --history         生成历史趋势数据
  --relationships   生成关联关系数据
  --all             生成所有数据（默认）
  --output <dir>    输出目录（默认: docs/reports/survey-data/）
  --help            显示帮助信息
`);
    return;
  }

  console.log('🚀 开始文档工程调查数据收集...\n');

  // 确保输出目录存在
  ensureDir(options.output);

  try {
    // 收集数据
    const results = {};

    if (options.stats) {
      results.stats = await collectBasicStats();
      writeJson(`${options.output}/basic-stats.json`, results.stats);
      console.log('✅ 基本统计数据已保存');
    }

    if (options.quality) {
      results.quality = await collectQualityData();
      writeJson(`${options.output}/quality-data.json`, results.quality);
      console.log('✅ 质量分析数据已保存');
    }

    if (options.history) {
      results.history = await collectHistoryData();
      writeJson(`${options.output}/history-data.json`, results.history);
      console.log('✅ 历史趋势数据已保存');
    }

    if (options.relationships) {
      results.relationships = await collectRelationshipsData();
      writeJson(`${options.output}/relationships-data.json`, results.relationships);
      console.log('✅ 关联关系数据已保存');
    }

    // 生成汇总报告
    const summary = {
      timestamp: new Date().toISOString(),
      collected: Object.keys(results),
      outputDir: options.output,
      summary: {}
    };

    if (results.stats) {
      summary.summary.stats = {
        totalDocuments: results.stats.total,
        categories: Object.keys(results.stats.byCategory).length,
        withMetadata: results.stats.metadataStats
      };
    }

    if (results.quality) {
      summary.summary.quality = {
        formatIssues: results.quality.formatIssues.length,
        contentIssues: results.quality.contentIssues.length,
        linkIssues: results.quality.linkIssues.length
      };
    }

    if (results.history) {
      summary.summary.history = {
        totalCommits: results.history.commits.length,
        filesWithHistory: Object.keys(results.history.fileHistories).length
      };
    }

    if (results.relationships) {
      summary.summary.relationships = {
        filesWithLinks: Object.keys(results.relationships.links).length,
        totalLinks: Object.keys(results.relationships.links).reduce((sum, file) =>
          sum + results.relationships.links[file].length, 0)
      };
    }

    writeJson(`${options.output}/collection-summary.json`, summary);

    console.log('\n📋 数据收集完成！');
    console.log(`📁 输出目录: ${options.output}`);
    console.log('📊 收集摘要:', summary.summary);

  } catch (error) {
    console.error('❌ 数据收集失败:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  collectBasicStats,
  collectQualityData,
  collectHistoryData,
  collectRelationshipsData
};
