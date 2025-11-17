#!/usr/bin/env node

/**
 * CHANGELOG自动生成工具
 *
 * 功能：
 * - 从Git提交历史生成CHANGELOG
 * - 自动分类提交类型（feat, fix, docs, etc.）
 * - 生成语义化版本的变更日志
 * - 支持多语言版本
 *
 * 使用方法：
 * node docs/scripts/generate-changelog.js [options]
 *
 * 选项：
 * --output <file>    输出文件路径 (默认: CHANGELOG.md)
 * --from <ref>       开始引用 (默认: 最近的tag)
 * --to <ref>         结束引用 (默认: HEAD)
 * --format <format>  输出格式: markdown|json (默认: markdown)
 * --lang <lang>      语言: zh|en (默认: zh)
 * --verbose          详细输出
 * --help             显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  // 提交类型映射
  commitTypes: {
    feat: { label: '✨ 新功能', section: 'Features' },
    fix: { label: '🐛 修复', section: 'Bug Fixes' },
    docs: { label: '📚 文档', section: 'Documentation' },
    style: { label: '💅 样式', section: 'Styles' },
    refactor: { label: '♻️ 重构', section: 'Code Refactoring' },
    perf: { label: '⚡ 性能优化', section: 'Performance Improvements' },
    test: { label: '🧪 测试', section: 'Tests' },
    chore: { label: '🔧 构建工具', section: 'Chores' },
    ci: { label: '🚀 CI/CD', section: 'Continuous Integration' },
    revert: { label: '⏪ 回滚', section: 'Reverts' },
    build: { label: '📦 构建', section: 'Build System' }
  },

  // 语言配置
  languages: {
    zh: {
      title: '变更日志',
      unreleased: '未发布',
      sections: {
        Features: '新功能',
        'Bug Fixes': '修复',
        Documentation: '文档',
        Styles: '样式',
        'Code Refactoring': '代码重构',
        'Performance Improvements': '性能优化',
        Tests: '测试',
        Chores: '构建工具',
        'Continuous Integration': '持续集成',
        Reverts: '回滚',
        'Build System': '构建系统'
      }
    },
    en: {
      title: 'Changelog',
      unreleased: 'Unreleased',
      sections: {
        Features: 'Features',
        'Bug Fixes': 'Bug Fixes',
        Documentation: 'Documentation',
        Styles: 'Styles',
        'Code Refactoring': 'Code Refactoring',
        'Performance Improvements': 'Performance Improvements',
        Tests: 'Tests',
        Chores: 'Chores',
        'Continuous Integration': 'Continuous Integration',
        Reverts: 'Reverts',
        'Build System': 'Build System'
      }
    }
  }
};

// 解析结果
let changelogData = {
  version: 'Unreleased',
  date: null,
  commits: [],
  sections: {}
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

  console.log('📝 开始生成CHANGELOG...\n');

  // 获取Git提交历史
  const commits = await getGitCommits(options);

  // 解析提交信息
  parseCommits(commits, options);

  // 生成CHANGELOG
  const content = generateChangelog(options);

  // 写入文件
  const outputPath = options.output || 'CHANGELOG.md';
  fs.writeFileSync(outputPath, content, 'utf-8');

  console.log(`✅ CHANGELOG已生成: ${outputPath}`);
  console.log(`📊 处理了 ${changelogData.commits.length} 个提交`);
}

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const options = {
    output: null,
    from: null,
    to: 'HEAD',
    format: 'markdown',
    lang: 'zh',
    verbose: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--output':
        options.output = args[++i];
        break;
      case '--from':
        options.from = args[++i];
        break;
      case '--to':
        options.to = args[++i];
        break;
      case '--format':
        options.format = args[++i];
        break;
      case '--lang':
        options.lang = args[++i];
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * 获取Git提交历史
 */
async function getGitCommits(options) {
  try {
    // 获取最近的tag作为起始点（如果没有指定from）
    let fromRef = options.from;
    if (!fromRef) {
      try {
        fromRef = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
      } catch {
        fromRef = execSync('git rev-list --max-parents=0 HEAD', { encoding: 'utf-8' }).trim();
      }
    }

    // 获取提交历史
    const gitCommand = `git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=short --no-merges ${fromRef}..${options.to}`;
    const gitOutput = execSync(gitCommand, { encoding: 'utf-8' });

    if (options.verbose) {
      console.log(`🔍 Git命令: ${gitCommand}`);
    }

    return gitOutput.split('\n').filter(line => line.trim());
  } catch (error) {
    console.error('获取Git提交历史失败:', error.message);
    return [];
  }
}

/**
 * 解析提交信息
 */
function parseCommits(commitLines, options) {
  const lang = CONFIG.languages[options.lang];

  for (const line of commitLines) {
    if (!line.trim()) continue;

    const [hash, author, email, date, message] = line.split('|');

    // 解析提交类型和范围
    const commitInfo = parseCommitMessage(message);

    if (commitInfo) {
      const commit = {
        hash: hash.substring(0, 8),
        author,
        email,
        date,
        type: commitInfo.type,
        scope: commitInfo.scope,
        subject: commitInfo.subject,
        body: commitInfo.body,
        footer: commitInfo.footer,
        breaking: commitInfo.breaking
      };

      changelogData.commits.push(commit);

      // 按类型分组
      const sectionKey = CONFIG.commitTypes[commitInfo.type]?.section || 'Other';
      if (!changelogData.sections[sectionKey]) {
        changelogData.sections[sectionKey] = [];
      }
      changelogData.sections[sectionKey].push(commit);

      if (options.verbose) {
        console.log(`📝 解析提交: ${commit.type} - ${commit.subject}`);
      }
    }
  }

  // 设置版本和日期
  if (changelogData.commits.length > 0) {
    changelogData.date = changelogData.commits[0].date;
  }
}

/**
 * 解析提交消息
 */
function parseCommitMessage(message) {
  // 匹配Conventional Commits格式: type(scope): subject
  const commitRegex = /^(\w+)(?:\(([^)]+)\))?: (.+)$/;
  const match = message.match(commitRegex);

  if (!match) return null;

  const [, type, scope, subject] = match;

  // 检查是否为breaking change
  const breaking = subject.includes('BREAKING CHANGE') ||
                   message.includes('BREAKING CHANGE') ||
                   type.startsWith('!');

  return {
    type: type.replace('!', ''),
    scope,
    subject: subject.replace(/^BREAKING CHANGE:?\s*/, ''),
    body: '',
    footer: '',
    breaking
  };
}

/**
 * 生成CHANGELOG
 */
function generateChangelog(options) {
  const lang = CONFIG.languages[options.lang];

  let content = `# ${lang.title}\n\n`;
  content += `All notable changes to this project will be documented in this file.\n\n`;
  content += `The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\n`;
  content += `and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`;

  // 未发布版本
  content += `## [${changelogData.version}] - ${changelogData.date || new Date().toISOString().split('T')[0]}\n\n`;

  // 生成各部分
  const sectionOrder = [
    'Features',
    'Bug Fixes',
    'Documentation',
    'Styles',
    'Code Refactoring',
    'Performance Improvements',
    'Tests',
    'Chores',
    'Continuous Integration',
    'Build System',
    'Reverts'
  ];

  for (const sectionKey of sectionOrder) {
    if (changelogData.sections[sectionKey] && changelogData.sections[sectionKey].length > 0) {
      const sectionName = lang.sections[sectionKey] || sectionKey;
      content += `### ${sectionName}\n\n`;

      changelogData.sections[sectionKey].forEach(commit => {
        const scope = commit.scope ? `**${commit.scope}**: ` : '';
        const breaking = commit.breaking ? ' ⚠️' : '';
        content += `- ${scope}${commit.subject}${breaking} (${commit.hash})\n`;
      });

      content += '\n';
    }
  }

  // 如果没有任何分类的提交，显示所有提交
  if (Object.keys(changelogData.sections).length === 0 && changelogData.commits.length > 0) {
    content += '### Changes\n\n';
    changelogData.commits.forEach(commit => {
      content += `- ${commit.subject} (${commit.hash})\n`;
    });
    content += '\n';
  }

  // 统计信息
  content += '### 📊 统计信息\n\n';
  content += `- **总提交数**: ${changelogData.commits.length}\n`;

  const typeStats = {};
  changelogData.commits.forEach(commit => {
    typeStats[commit.type] = (typeStats[commit.type] || 0) + 1;
  });

  content += '- **提交类型分布**:\n';
  Object.entries(typeStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      const label = CONFIG.commitTypes[type]?.label || type;
      content += `  - ${label}: ${count}\n`;
    });

  const breakingChanges = changelogData.commits.filter(c => c.breaking).length;
  if (breakingChanges > 0) {
    content += `- **破坏性变更**: ${breakingChanges}\n`;
  }

  content += '\n---\n\n';

  // 贡献者信息
  const contributors = [...new Set(changelogData.commits.map(c => c.author))];
  if (contributors.length > 0) {
    content += '### 👥 贡献者\n\n';
    contributors.forEach(contributor => {
      content += `- ${contributor}\n`;
    });
    content += '\n---\n\n';
  }

  // 添加生成信息
  content += `*此CHANGELOG由工具自动生成于 ${new Date().toISOString()}*\n`;

  return content;
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
CHANGELOG生成工具

使用方法:
  node docs/scripts/generate-changelog.js [options]

选项:
  --output <file>    输出文件路径 (默认: CHANGELOG.md)
  --from <ref>       开始引用 (默认: 最近的tag)
  --to <ref>         结束引用 (默认: HEAD)
  --format <format>  输出格式: markdown|json (默认: markdown)
  --lang <lang>      语言: zh|en (默认: zh)
  --verbose          详细输出
  --help             显示帮助信息

示例:
  # 生成完整的CHANGELOG
  node docs/scripts/generate-changelog.js

  # 生成特定版本范围的CHANGELOG
  node docs/scripts/generate-changelog.js --from v1.0.0 --to v1.1.0

  # 生成英文版本
  node docs/scripts/generate-changelog.js --lang en

  # 指定输出文件
  node docs/scripts/generate-changelog.js --output docs/CHANGELOG.md

  # 详细输出
  node docs/scripts/generate-changelog.js --verbose
`);
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('生成CHANGELOG时发生错误:', error);
    process.exit(1);
  });
}

module.exports = {
  getGitCommits,
  parseCommits,
  parseCommitMessage,
  generateChangelog
};