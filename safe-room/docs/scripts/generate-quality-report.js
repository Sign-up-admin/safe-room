#!/usr/bin/env node

/**
 * 文档质量报告生成工具
 *
 * 功能：
 * - 综合分析文档质量指标
 * - 生成详细的质量报告
 * - 计算质量趋势和改进建议
 * - 支持多种输出格式（Markdown、JSON、HTML）
 * - 定期质量监控和预警
 *
 * 使用方法：
 * node docs/scripts/generate-quality-report.js [options]
 *
 * 选项：
 * --output <file>    输出文件路径 (默认: docs/reports/DOC_QUALITY_REPORT.md)
 * --format <format>  输出格式: markdown|json|html (默认: markdown)
 * --baseline <file>  基准文件，用于趋势对比
 * --verbose          详细输出
 * --help             显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// 导入相关模块
const { loadMetadataConfig, parseDocMetadata } = require('./validate-docs');

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
  ],

  // 输出配置
  defaultOutput: 'docs/reports/DOC_QUALITY_REPORT.md',

  // 质量评分标准
  qualityThresholds: {
    excellent: 90,
    good: 75,
    fair: 60,
    poor: 0
  }
};

// 质量报告数据
let qualityReport = {
  summary: {
    generatedAt: new Date().toISOString(),
    totalDocuments: 0,
    qualityScore: 0,
    grade: '',
    trend: 'stable'
  },
  metrics: {
    format: {
      score: 0,
      total: 0,
      valid: 0,
      issues: []
    },
    content: {
      score: 0,
      total: 0,
      valid: 0,
      issues: []
    },
    timeliness: {
      score: 0,
      total: 0,
      valid: 0,
      issues: []
    },
    relationships: {
      score: 0,
      total: 0,
      valid: 0,
      issues: []
    }
  },
  categoryAnalysis: {},
  recommendations: [],
  trends: {}
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

  console.log('📊 开始生成文档质量报告...\n');

  // 收集质量数据
  await collectQualityData();

  // 计算质量指标
  calculateQualityMetrics();

  // 生成改进建议
  generateRecommendations();

  // 加载趋势数据（如果有基准文件）
  if (options.baseline) {
    loadTrendData(options.baseline);
  }

  // 输出报告
  await outputReport(options);

  console.log('✅ 质量报告生成完成');
}

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const options = {
    output: CONFIG.defaultOutput,
    format: 'markdown',
    baseline: null,
    verbose: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--output':
        options.output = args[++i];
        break;
      case '--format':
        options.format = args[++i];
        break;
      case '--baseline':
        options.baseline = args[++i];
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
 * 收集质量数据
 */
async function collectQualityData() {
  const files = await glob(CONFIG.patterns, {
    ignore: CONFIG.exclude
  });

  qualityReport.summary.totalDocuments = files.length;

  const config = loadMetadataConfig();

  for (const file of files) {
    // file已经是完整的相对路径，直接使用
    const filePath = file;
    const relativePath = path.relative(CONFIG.docsRoot, file).replace(/\\/g, '/');

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const metadata = parseDocMetadata(content);
      const category = metadata.category || 'uncategorized';

      // 初始化分类分析
      if (!qualityReport.categoryAnalysis[category]) {
        qualityReport.categoryAnalysis[category] = {
          total: 0,
          valid: 0,
          score: 0
        };
      }

      qualityReport.categoryAnalysis[category].total++;

      // 格式检查
      const formatScore = checkFormatQuality(metadata, config);
      qualityReport.metrics.format.total++;
      if (formatScore === 1) {
        qualityReport.metrics.format.valid++;
      } else {
        qualityReport.metrics.format.issues.push({
          doc: relativePath,
          issues: getFormatIssues(metadata, config)
        });
      }

      // 内容检查
      const contentScore = checkContentQuality(content, metadata);
      qualityReport.metrics.content.total++;
      if (contentScore === 1) {
        qualityReport.metrics.content.valid++;
      } else {
        qualityReport.metrics.content.issues.push({
          doc: relativePath,
          issues: getContentIssues(content, metadata)
        });
      }

      // 时效性检查
      const timelinessScore = checkTimelinessQuality(metadata, config);
      qualityReport.metrics.timeliness.total++;
      if (timelinessScore === 1) {
        qualityReport.metrics.timeliness.valid++;
      } else {
        qualityReport.metrics.timeliness.issues.push({
          doc: relativePath,
          issues: getTimelinessIssues(metadata, config)
        });
      }

      // 关联关系检查
      const relationshipsScore = checkRelationshipsQuality(metadata, content);
      qualityReport.metrics.relationships.total++;
      if (relationshipsScore === 1) {
        qualityReport.metrics.relationships.valid++;
      } else {
        qualityReport.metrics.relationships.issues.push({
          doc: relativePath,
          issues: getRelationshipsIssues(metadata, content)
        });
      }

      // 更新分类统计
      const docScore = (formatScore + contentScore + timelinessScore + relationshipsScore) / 4;
      if (docScore >= 0.8) {
        qualityReport.categoryAnalysis[category].valid++;
      }
      qualityReport.categoryAnalysis[category].score += docScore;

    } catch (error) {
      console.warn(`⚠️ 无法分析文档 ${file}: ${error.message}`);
    }
  }

  // 计算分类平均分
  for (const category in qualityReport.categoryAnalysis) {
    const cat = qualityReport.categoryAnalysis[category];
    cat.score = cat.total > 0 ? Math.round((cat.score / cat.total) * 100) : 0;
  }
}

/**
 * 检查格式质量
 */
function checkFormatQuality(metadata, config) {
  const requiredFields = Object.keys(config.required_fields);
  const missingFields = requiredFields.filter(field => !metadata[field]);

  if (missingFields.length > 0) return 0;

  // 检查字段格式
  for (const field of requiredFields) {
    const fieldConfig = config.required_fields[field];
    if (fieldConfig.validation) {
      if (fieldConfig.validation.pattern) {
        const regex = new RegExp(fieldConfig.validation.pattern);
        if (!regex.test(metadata[field])) return 0;
      }
      if (fieldConfig.validation.enum && !fieldConfig.validation.enum.includes(metadata[field])) {
        return 0;
      }
    }
  }

  return 1;
}

/**
 * 检查内容质量
 */
function checkContentQuality(content, metadata) {
  // 检查描述长度
  const description = extractDescription(content);
  if (!description || description.length < 20) return 0;

  // 检查是否有基本结构
  const hasStructure = content.includes('##') || content.includes('###');
  if (!hasStructure) return 0;

  // 检查是否有代码示例（对于技术文档）
  if (metadata.category === 'technical' && !content.includes('```')) return 0.5;

  return 1;
}

/**
 * 检查时效性质量
 */
function checkTimelinessQuality(metadata, config) {
  if (!metadata.last_updated) return 0;

  const categoryConfig = config.category_config[metadata.category];
  if (!categoryConfig) return 0.5;

  const lastUpdated = new Date(metadata.last_updated);
  const now = new Date();
  const daysSinceUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));

  if (daysSinceUpdate > categoryConfig.expiry_days) return 0;

  return 1;
}

/**
 * 检查关联关系质量
 */
function checkRelationshipsQuality(metadata, content) {
  // 检查是否声明了关联文档
  if (metadata.related_docs && metadata.related_docs.length > 0) return 1;

  // 检查内容中是否有链接
  const hasLinks = content.includes('](');
  if (hasLinks) return 0.8;

  return 0.5;
}

/**
 * 获取格式问题
 */
function getFormatIssues(metadata, config) {
  const issues = [];
  const requiredFields = Object.keys(config.required_fields);

  for (const field of requiredFields) {
    if (!metadata[field]) {
      issues.push(`缺少必需字段: ${field}`);
    } else {
      const fieldConfig = config.required_fields[field];
      if (fieldConfig.validation) {
        if (fieldConfig.validation.pattern) {
          const regex = new RegExp(fieldConfig.validation.pattern);
          if (!regex.test(metadata[field])) {
            issues.push(`字段 ${field} 格式不正确`);
          }
        }
        if (fieldConfig.validation.enum && !fieldConfig.validation.enum.includes(metadata[field])) {
          issues.push(`字段 ${field} 值无效`);
        }
      }
    }
  }

  return issues;
}

/**
 * 获取内容问题
 */
function getContentIssues(content, metadata) {
  const issues = [];

  const description = extractDescription(content);
  if (!description || description.length < 20) {
    issues.push('描述信息过短或缺失');
  }

  const hasStructure = content.includes('##') || content.includes('###');
  if (!hasStructure) {
    issues.push('缺少基本文档结构');
  }

  if (metadata.category === 'technical' && !content.includes('```')) {
    issues.push('技术文档缺少代码示例');
  }

  return issues;
}

/**
 * 获取时效性问题
 */
function getTimelinessIssues(metadata, config) {
  const issues = [];

  if (!metadata.last_updated) {
    issues.push('缺少更新日期');
    return issues;
  }

  const categoryConfig = config.category_config[metadata.category];
  if (categoryConfig) {
    const lastUpdated = new Date(metadata.last_updated);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));

    if (daysSinceUpdate > categoryConfig.expiry_days) {
      issues.push(`文档已过期 ${daysSinceUpdate - categoryConfig.expiry_days} 天`);
    }
  }

  return issues;
}

/**
 * 获取关联关系问题
 */
function getRelationshipsIssues(metadata, content) {
  const issues = [];

  if (!metadata.related_docs || metadata.related_docs.length === 0) {
    issues.push('未声明关联文档');
  }

  const hasLinks = content.includes('](');
  if (!hasLinks) {
    issues.push('文档中缺少链接');
  }

  return issues;
}

/**
 * 提取文档描述
 */
function extractDescription(content) {
  const lines = content.split('\n');
  let inOverview = false;

  for (const line of lines) {
    if (line.includes('## 📖 概述') || line.includes('## 概述')) {
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
 * 计算质量指标
 */
function calculateQualityMetrics() {
  // 计算各维度得分
  qualityReport.metrics.format.score = qualityReport.metrics.format.total > 0
    ? Math.round((qualityReport.metrics.format.valid / qualityReport.metrics.format.total) * 100)
    : 0;
  qualityReport.metrics.content.score = qualityReport.metrics.content.total > 0
    ? Math.round((qualityReport.metrics.content.valid / qualityReport.metrics.content.total) * 100)
    : 0;
  qualityReport.metrics.timeliness.score = qualityReport.metrics.timeliness.total > 0
    ? Math.round((qualityReport.metrics.timeliness.valid / qualityReport.metrics.timeliness.total) * 100)
    : 0;
  qualityReport.metrics.relationships.score = qualityReport.metrics.relationships.total > 0
    ? Math.round((qualityReport.metrics.relationships.valid / qualityReport.metrics.relationships.total) * 100)
    : 0;

  // 计算总得分
  const totalScore = (qualityReport.metrics.format.score + qualityReport.metrics.content.score +
                     qualityReport.metrics.timeliness.score + qualityReport.metrics.relationships.score) / 4;

  qualityReport.summary.qualityScore = Math.round(totalScore);

  // 确定等级
  if (totalScore >= CONFIG.qualityThresholds.excellent) {
    qualityReport.summary.grade = '优秀';
  } else if (totalScore >= CONFIG.qualityThresholds.good) {
    qualityReport.summary.grade = '良好';
  } else if (totalScore >= CONFIG.qualityThresholds.fair) {
    qualityReport.summary.grade = '一般';
  } else {
    qualityReport.summary.grade = '需改进';
  }
}

/**
 * 生成改进建议
 */
function generateRecommendations() {
  const recommendations = [];

  // 格式问题建议
  if (qualityReport.metrics.format.score < 80) {
    recommendations.push({
      priority: 'high',
      category: 'format',
      title: '完善文档格式规范',
      description: `格式规范得分仅为 ${qualityReport.metrics.format.score}%，建议使用文档修复工具批量完善`,
      actions: [
        '运行 docs/scripts/fix-doc-metadata.js --force 批量修复',
        '更新 docs/DOCUMENTATION_GUIDE.md 明确格式要求',
        '培训团队成员文档格式规范'
      ]
    });
  }

  // 内容质量建议
  if (qualityReport.metrics.content.score < 80) {
    recommendations.push({
      priority: 'high',
      category: 'content',
      title: '提升文档内容质量',
      description: `内容质量得分仅为 ${qualityReport.metrics.content.score}%，需要完善文档结构和内容`,
      actions: [
        '为缺少描述的文档补充概述信息',
        '为技术文档添加代码示例',
        '完善文档目录结构'
      ]
    });
  }

  // 时效性建议
  if (qualityReport.metrics.timeliness.score < 80) {
    recommendations.push({
      priority: 'medium',
      category: 'timeliness',
      title: '改善文档更新频率',
      description: `${qualityReport.metrics.timeliness.issues.length} 个文档过期，建议建立定期更新机制`,
      actions: [
        '设置文档过期提醒机制',
        '建立文档维护责任制',
        '定期审查和更新文档'
      ]
    });
  }

  // 关联关系建议
  if (qualityReport.metrics.relationships.score < 80) {
    recommendations.push({
      priority: 'medium',
      category: 'relationships',
      title: '完善文档关联关系',
      description: `关联关系得分仅为 ${qualityReport.metrics.relationships.score}%，建议建立文档间的引用关系`,
      actions: [
        '在文档元数据中声明 related_docs',
        '更新 DOC_RELATIONSHIPS.json 文件',
        '运行关联关系验证工具检查'
      ]
    });
  }

  qualityReport.recommendations = recommendations;
}

/**
 * 加载趋势数据
 */
function loadTrendData(baselineFile) {
  try {
    if (fs.existsSync(baselineFile)) {
      const baselineData = JSON.parse(fs.readFileSync(baselineFile, 'utf-8'));

      // 计算趋势
      const currentScore = qualityReport.summary.qualityScore;
      const previousScore = baselineData.summary.qualityScore;

      if (currentScore > previousScore) {
        qualityReport.summary.trend = 'improving';
      } else if (currentScore < previousScore) {
        qualityReport.summary.trend = 'declining';
      } else {
        qualityReport.summary.trend = 'stable';
      }

      qualityReport.trends = {
        previousScore,
        currentScore,
        change: currentScore - previousScore
      };
    }
  } catch (error) {
    console.warn(`⚠️ 无法加载基准数据: ${error.message}`);
  }
}

/**
 * 输出报告
 */
async function outputReport(options) {
  let content = '';

  switch (options.format) {
    case 'json':
      content = JSON.stringify(qualityReport, null, 2);
      break;
    case 'html':
      content = generateHtmlReport();
      break;
    default:
      content = generateMarkdownReport();
      break;
  }

  // 确保输出目录存在
  const outputDir = path.dirname(options.output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(options.output, content, 'utf-8');
  console.log(`📄 质量报告已保存到: ${options.output}`);
}

/**
 * 生成 Markdown 报告
 */
function generateMarkdownReport() {
  let content = `# 📊 文档质量报告

> **生成时间**：${new Date(qualityReport.summary.generatedAt).toLocaleString()}
> **总文档数**：${qualityReport.summary.totalDocuments}
> **质量得分**：${qualityReport.summary.qualityScore}/100
> **等级**：${qualityReport.summary.grade}
> **趋势**：${getTrendText(qualityReport.summary.trend)}

---

## 📋 目录

- [质量概览](#质量概览)
- [详细指标](#详细指标)
- [分类分析](#分类分析)
- [问题清单](#问题清单)
- [改进建议](#改进建议)

---

## 🎯 质量概览

### 总体评分

| 指标 | 得分 | 状态 |
|------|------|------|
| **总体质量** | ${qualityReport.summary.qualityScore}/100 | ${getGradeIcon(qualityReport.summary.grade)} ${qualityReport.summary.grade} |
| **格式规范** | ${qualityReport.metrics.format.score}/100 | ${getScoreIcon(qualityReport.metrics.format.score)} |
| **内容完整** | ${qualityReport.metrics.content.score}/100 | ${getScoreIcon(qualityReport.metrics.content.score)} |
| **时效性** | ${qualityReport.metrics.timeliness.score}/100 | ${getScoreIcon(qualityReport.metrics.timeliness.score)} |
| **关联关系** | ${qualityReport.metrics.relationships.score}/100 | ${getScoreIcon(qualityReport.metrics.relationships.score)} |

`;

  if (qualityReport.trends.change !== undefined) {
    content += `
### 质量趋势

| 时期 | 得分 | 变化 |
|------|------|------|
| 上次报告 | ${qualityReport.trends.previousScore}/100 | - |
| 本次报告 | ${qualityReport.trends.currentScore}/100 | ${qualityReport.trends.change > 0 ? '+' : ''}${qualityReport.trends.change} |

`;
  }

  content += `---

## 📈 详细指标

### 格式规范性

- **得分**：${qualityReport.metrics.format.score}/100
- **有效文档**：${qualityReport.metrics.format.valid}/${qualityReport.metrics.format.total}
- **问题文档**：${qualityReport.metrics.format.issues.length}

### 内容完整性

- **得分**：${qualityReport.metrics.content.score}/100
- **有效文档**：${qualityReport.metrics.content.valid}/${qualityReport.metrics.content.total}
- **问题文档**：${qualityReport.metrics.content.issues.length}

### 时效性

- **得分**：${qualityReport.metrics.timeliness.score}/100
- **有效文档**：${qualityReport.metrics.timeliness.valid}/${qualityReport.metrics.timeliness.total}
- **问题文档**：${qualityReport.metrics.timeliness.issues.length}

### 关联关系

- **得分**：${qualityReport.metrics.relationships.score}/100
- **有效文档**：${qualityReport.metrics.relationships.valid}/${qualityReport.metrics.relationships.total}
- **问题文档**：${qualityReport.metrics.relationships.issues.length}

---

## 📂 分类分析

| 分类 | 文档数量 | 质量得分 | 状态 |
|------|----------|----------|------|
`;

  for (const [category, data] of Object.entries(qualityReport.categoryAnalysis)) {
    content += `| ${getCategoryDisplayName(category)} | ${data.total} | ${data.score}/100 | ${getScoreIcon(data.score)} |\n`;
  }

  content += `
---

## ⚠️ 问题清单

### 格式问题

`;

  qualityReport.metrics.format.issues.slice(0, 10).forEach((issue, index) => {
    content += `#### ${index + 1}. ${issue.doc}\n\n`;
    issue.issues.forEach(problem => {
      content += `- ${problem}\n`;
    });
    content += '\n';
  });

  content += `### 内容问题

`;

  qualityReport.metrics.content.issues.slice(0, 10).forEach((issue, index) => {
    content += `#### ${index + 1}. ${issue.doc}\n\n`;
    issue.issues.forEach(problem => {
      content += `- ${problem}\n`;
    });
    content += '\n';
  });

  content += `---

## 💡 改进建议

`;

  qualityReport.recommendations.forEach((rec, index) => {
    content += `### ${index + 1}. ${rec.title}

**优先级**：${getPriorityText(rec.priority)}
**类别**：${rec.category}
**描述**：${rec.description}

**建议措施**：
${rec.actions.map(action => `- ${action}`).join('\n')}

---
`;
  });

  content += `
## 📝 更新记录

| 日期 | 版本 | 得分 | 等级 | 主要变化 |
|------|------|------|------|----------|
| ${new Date(qualityReport.summary.generatedAt).toISOString().split('T')[0]} | v1.0.0 | ${qualityReport.summary.qualityScore}/100 | ${qualityReport.summary.grade} | 初始版本 |

---

*本文档由自动化工具生成，最后更新时间：${new Date(qualityReport.summary.generatedAt).toISOString()}*
`;

  return content;
}

/**
 * 生成 HTML 报告
 */
function generateHtmlReport() {
  // 这里可以实现 HTML 格式的报告
  // 暂时返回简单的 HTML
  return `
<!DOCTYPE html>
<html>
<head>
    <title>文档质量报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .score { font-size: 24px; font-weight: bold; }
        .excellent { color: #28a745; }
        .good { color: #17a2b8; }
        .fair { color: #ffc107; }
        .poor { color: #dc3545; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>📊 文档质量报告</h1>
    <p><strong>生成时间：</strong>${new Date(qualityReport.summary.generatedAt).toLocaleString()}</p>
    <p><strong>总文档数：</strong>${qualityReport.summary.totalDocuments}</p>
    <p><strong>质量得分：</strong><span class="score ${qualityReport.summary.grade.toLowerCase()}">${qualityReport.summary.qualityScore}/100</span></p>
    <p><strong>等级：</strong>${qualityReport.summary.grade}</p>

    <h2>质量指标</h2>
    <table>
        <tr><th>指标</th><th>得分</th><th>状态</th></tr>
        <tr><td>格式规范</td><td>${qualityReport.metrics.format.score}/100</td><td>${getScoreIcon(qualityReport.metrics.format.score)}</td></tr>
        <tr><td>内容完整</td><td>${qualityReport.metrics.content.score}/100</td><td>${getScoreIcon(qualityReport.metrics.content.score)}</td></tr>
        <tr><td>时效性</td><td>${qualityReport.metrics.timeliness.score}/100</td><td>${getScoreIcon(qualityReport.metrics.timeliness.score)}</td></tr>
        <tr><td>关联关系</td><td>${qualityReport.metrics.relationships.score}/100</td><td>${getScoreIcon(qualityReport.metrics.relationships.score)}</td></tr>
    </table>
</body>
</html>
`;
}

/**
 * 获取等级图标
 */
function getGradeIcon(grade) {
  const icons = {
    '优秀': '🏆',
    '良好': '👍',
    '一般': '⚠️',
    '需改进': '❌'
  };
  return icons[grade] || '❓';
}

/**
 * 获取分数图标
 */
function getScoreIcon(score) {
  if (score >= 90) return '🟢';
  if (score >= 75) return '🟡';
  if (score >= 60) return '🟠';
  return '🔴';
}

/**
 * 获取趋势文本
 */
function getTrendText(trend) {
  const texts = {
    'improving': '↗️ 提升',
    'declining': '↘️ 下降',
    'stable': '➡️ 稳定'
  };
  return texts[trend] || '❓ 未知';
}

/**
 * 获取优先级文本
 */
function getPriorityText(priority) {
  const texts = {
    'high': '🔴 高',
    'medium': '🟡 中',
    'low': '🟢 低'
  };
  return texts[priority] || priority;
}

/**
 * 获取分类显示名称
 */
function getCategoryDisplayName(category) {
  const names = {
    'requirements': '需求文档',
    'technical': '技术文档',
    'development': '开发文档',
    'reports': '报告文档',
    'uncategorized': '未分类'
  };
  return names[category] || category;
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
文档质量报告生成工具

使用方法:
  node docs/scripts/generate-quality-report.js [options]

选项:
  --output <file>     输出文件路径 (默认: docs/reports/DOC_QUALITY_REPORT.md)
  --format <format>   输出格式: markdown|json|html (默认: markdown)
  --baseline <file>   基准文件，用于趋势对比
  --verbose           详细输出
  --help              显示帮助信息

示例:
  # 生成 Markdown 格式的质量报告
  node docs/scripts/generate-quality-report.js

  # 生成 JSON 格式报告
  node docs/scripts/generate-quality-report.js --format json --output quality.json

  # 与基准文件对比趋势
  node docs/scripts/generate-quality-report.js --baseline previous-report.json
`);
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('报告生成过程中发生错误:', error);
    process.exit(1);
  });
}

module.exports = {
  collectQualityData,
  calculateQualityMetrics,
  generateRecommendations,
  generateMarkdownReport
};
