#!/usr/bin/env node

/**
 * 文档维护者绩效评估工具
 *
 * 功能：
 * - 自动评估文档维护者绩效
 * - 生成绩效报告和建议
 * - 支持批量评估和趋势分析
 *
 * 使用方法：
 * node docs/scripts/assess-maintainer-performance.js [options]
 *
 * 选项：
 * --user <username>    指定评估用户
 * --period <period>    评估周期: monthly|quarterly|yearly
 * --output <file>      输出文件路径
 * --batch              批量评估所有维护者
 * --help               显示帮助信息
 */

const fs = require('fs');
const path = require('path');

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

  // 评估周期配置
  periods: {
    monthly: 30 * 24 * 60 * 60 * 1000,    // 30天
    quarterly: 90 * 24 * 60 * 60 * 1000,  // 90天
    yearly: 365 * 24 * 60 * 60 * 1000     // 365天
  },

  // 评估权重
  weights: {
    quality: 0.4,      // 质量指标权重
    timeliness: 0.3,   // 时效性指标权重
    collaboration: 0.2, // 协作性指标权重
    innovation: 0.1    // 创新性指标权重
  },

  // 评分标准
  grading: {
    excellent: { min: 90, max: 100, label: '优秀' },
    good: { min: 80, max: 89, label: '良好' },
    satisfactory: { min: 70, max: 79, label: '合格' },
    poor: { min: 60, max: 69, label: '不合格' },
    critical: { min: 0, max: 59, label: '严重不合格' }
  }
};

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    user: null,
    period: 'monthly',
    output: null,
    batch: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--user':
        options.user = args[++i];
        break;
      case '--period':
        options.period = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--batch':
        options.batch = true;
        break;
      case '--help':
        options.help = true;
        break;
      default:
        if (!options.user && !arg.startsWith('--')) {
          options.user = arg;
        }
    }
  }

  return options;
}

// 显示帮助信息
function showHelp() {
  console.log(`
文档维护者绩效评估工具

使用方法:
  node docs/scripts/assess-maintainer-performance.js [options]

选项:
  --user <username>    指定评估用户
  --period <period>    评估周期: monthly|quarterly|yearly (默认: monthly)
  --output <file>      输出文件路径
  --batch              批量评估所有维护者
  --help               显示帮助信息

示例:
  # 评估特定用户月度绩效
  node docs/scripts/assess-maintainer-performance.js --user john.doe

  # 生成季度绩效报告
  node docs/scripts/assess-maintainer-performance.js --user john.doe --period quarterly

  # 批量评估所有维护者
  node docs/scripts/assess-maintainer-performance.js --batch --period quarterly

  # 指定输出文件
  node docs/scripts/assess-maintainer-performance.js --user john.doe --output reports/performance-john-doe.md
`);
}

// 模拟维护者数据（实际应该从配置或数据库获取）
function getMaintainers() {
  return [
    {
      username: 'john.doe',
      name: 'John Doe',
      role: 'Senior Developer',
      documents: [
        'docs/technical/api/API_REFERENCE.md',
        'docs/technical/api/API_SECURITY.md',
        'docs/development/guides/DEVELOPMENT.md'
      ],
      joinDate: '2024-01-15'
    },
    {
      username: 'jane.smith',
      name: 'Jane Smith',
      role: 'Technical Writer',
      documents: [
        'docs/README.md',
        'docs/DOCUMENTATION_GUIDE.md',
        'docs/DOC_LIFECYCLE_MANAGEMENT.md'
      ],
      joinDate: '2024-02-01'
    },
    {
      username: 'bob.wilson',
      name: 'Bob Wilson',
      role: 'Backend Developer',
      documents: [
        'docs/technical/database/DATABASE.md',
        'docs/technical/database/DATABASE_SCHEMA.md'
      ],
      joinDate: '2024-03-10'
    }
  ];
}

// 收集评估数据
function collectAssessmentData(maintainer, period) {
  const periodMs = CONFIG.periods[period];
  const now = new Date();
  const periodStart = new Date(now.getTime() - periodMs);

  // 模拟数据收集（实际应该从Git历史、工具使用记录等获取）
  const data = {
    // 质量指标
    quality: {
      completeness: 85,    // 文档完整性
      accuracy: 90,        // 文档准确性
      formatting: 88,      // 格式规范性
      score: 0
    },

    // 时效性指标
    timeliness: {
      updateFrequency: 92, // 更新频率
      responseTime: 85,    // 响应时间
      releaseFrequency: 78, // 发布频率
      score: 0
    },

    // 协作性指标
    collaboration: {
      reviewParticipation: 88, // 审查参与度
      knowledgeSharing: 82,    // 知识分享
      teamSupport: 90,         // 团队支持
      score: 0
    },

    // 创新性指标
    innovation: {
      toolImprovements: 75,    // 工具改进
      processOptimization: 80, // 流程优化
      score: 0
    },

    // 总体统计
    statistics: {
      docsMaintained: maintainer.documents.length,
      updatesThisPeriod: Math.floor(Math.random() * 15) + 5,
      reviewsParticipated: Math.floor(Math.random() * 10) + 3,
      issuesReported: Math.floor(Math.random() * 8) + 2,
      issuesResolved: Math.floor(Math.random() * 6) + 1
    },

    // 时间范围
    period: {
      start: periodStart.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
      type: period
    }
  };

  // 计算各维度得分
  data.quality.score = Math.round(
    (data.quality.completeness * 0.4 +
     data.quality.accuracy * 0.4 +
     data.quality.formatting * 0.2)
  );

  data.timeliness.score = Math.round(
    (data.timeliness.updateFrequency * 0.5 +
     data.timeliness.responseTime * 0.3 +
     data.timeliness.releaseFrequency * 0.2)
  );

  data.collaboration.score = Math.round(
    (data.collaboration.reviewParticipation * 0.4 +
     data.collaboration.knowledgeSharing * 0.3 +
     data.collaboration.teamSupport * 0.3)
  );

  data.innovation.score = Math.round(
    (data.innovation.toolImprovements * 0.5 +
     data.innovation.processOptimization * 0.5)
  );

  return data;
}

// 计算总分
function calculateTotalScore(data) {
  return Math.round(
    data.quality.score * CONFIG.weights.quality +
    data.timeliness.score * CONFIG.weights.timeliness +
    data.collaboration.score * CONFIG.weights.collaboration +
    data.innovation.score * CONFIG.weights.innovation
  );
}

// 获取评分等级
function getGradeLabel(score) {
  for (const [key, grade] of Object.entries(CONFIG.grading)) {
    if (score >= grade.min && score <= grade.max) {
      return grade.label;
    }
  }
  return '未知';
}

// 生成绩效报告
function generatePerformanceReport(maintainer, data) {
  const totalScore = calculateTotalScore(data);
  const gradeLabel = getGradeLabel(totalScore);

  let content = `---
title: DOC MAINTAINER PERFORMANCE REPORT
version: v1.0.0
last_updated: ${new Date().toISOString().split('T')[0]}
status: active
category: reports
tags: [documentation, performance, assessment, maintainer]
---

# 📊 文档维护者绩效评估报告

> **评估对象**：${maintainer.name} (${maintainer.username})
> **职位**：${maintainer.role}
> **评估周期**：${data.period.start} 至 ${data.period.end}
> **评估类型**：${data.period.type}

---

## 👤 基本信息

| 项目 | 内容 |
|------|------|
| 姓名 | ${maintainer.name} |
| 用户名 | ${maintainer.username} |
| 职位 | ${maintainer.role} |
| 入职日期 | ${maintainer.joinDate} |
| 维护文档数 | ${data.statistics.docsMaintained} |

---

## 📈 绩效总览

### 总体评分
- **总分**：${totalScore}/100
- **等级**：${gradeLabel}
- **评估周期**：${data.period.type}

### 各维度得分

| 维度 | 得分 | 权重 | 加权得分 |
|------|------|------|----------|
| 质量指标 | ${data.quality.score} | ${CONFIG.weights.quality * 100}% | ${(data.quality.score * CONFIG.weights.quality).toFixed(1)} |
| 时效性指标 | ${data.timeliness.score} | ${CONFIG.weights.timeliness * 100}% | ${(data.timeliness.score * CONFIG.weights.timeliness).toFixed(1)} |
| 协作性指标 | ${data.collaboration.score} | ${CONFIG.weights.collaboration * 100}% | ${(data.collaboration.score * CONFIG.weights.collaboration).toFixed(1)} |
| 创新性指标 | ${data.innovation.score} | ${CONFIG.weights.innovation * 100}% | ${(data.innovation.score * CONFIG.weights.innovation).toFixed(1)} |

---

## 🔍 详细评估

### 1. 质量指标 (权重: ${CONFIG.weights.quality * 100}%)

| 子指标 | 得分 | 说明 |
|--------|------|------|
| 文档完整性 | ${data.quality.completeness} | 文档内容覆盖是否完整 |
| 文档准确性 | ${data.quality.accuracy} | 文档内容是否准确无误 |
| 格式规范性 | ${data.quality.formatting} | 文档格式是否符合标准 |

**维度得分**：${data.quality.score}/100

### 2. 时效性指标 (权重: ${CONFIG.weights.timeliness * 100}%)

| 子指标 | 得分 | 说明 |
|--------|------|------|
| 更新频率 | ${data.timeliness.updateFrequency} | 文档更新的频率和及时性 |
| 响应时间 | ${data.timeliness.responseTime} | 问题反馈的响应速度 |
| 发布频率 | ${data.timeliness.releaseFrequency} | 文档发布的频率 |

**维度得分**：${data.timeliness.score}/100

### 3. 协作性指标 (权重: ${CONFIG.weights.collaboration * 100}%)

| 子指标 | 得分 | 说明 |
|--------|------|------|
| 审查参与度 | ${data.collaboration.reviewParticipation} | 参与文档审查的积极性 |
| 知识分享 | ${data.collaboration.knowledgeSharing} | 主动分享文档知识 |
| 团队支持 | ${data.collaboration.teamSupport} | 协助团队成员的文档工作 |

**维度得分**：${data.collaboration.score}/100

### 4. 创新性指标 (权重: ${CONFIG.weights.innovation * 100}%)

| 子指标 | 得分 | 说明 |
|--------|------|------|
| 工具改进 | ${data.innovation.toolImprovements} | 提出文档工具改进建议 |
| 流程优化 | ${data.innovation.processOptimization} | 参与文档流程优化工作 |

**维度得分**：${data.innovation.score}/100

---

## 📊 统计数据

### 维护统计
- **维护文档数**：${data.statistics.docsMaintained}
- **本周期更新数**：${data.statistics.updatesThisPeriod}
- **参与审查数**：${data.statistics.reviewsParticipated}
- **报告问题数**：${data.statistics.issuesReported}
- **解决问题数**：${data.statistics.issuesResolved}

### 维护文档列表
`;

  maintainer.documents.forEach(doc => {
    content += `- \`${doc}\`\n`;
  });

  content += `

---

## 💡 改进建议

### 优势
`;

  // 根据得分生成建议
  if (data.quality.score >= 85) {
    content += `- 文档质量优秀，内容完整准确\n`;
  }
  if (data.timeliness.score >= 85) {
    content += `- 更新及时，响应速度快\n`;
  }
  if (data.collaboration.score >= 85) {
    content += `- 协作积极，团队贡献大\n`;
  }
  if (data.innovation.score >= 85) {
    content += `- 创新意识强，积极改进工具和流程\n`;
  }

  content += `
### 需要改进
`;

  if (data.quality.score < 80) {
    content += `- 提升文档质量，关注内容完整性和准确性\n`;
  }
  if (data.timeliness.score < 80) {
    content += `- 提高更新频率，确保文档及时反映最新变化\n`;
  }
  if (data.collaboration.score < 80) {
    content += `- 加强团队协作，多参与审查和知识分享\n`;
  }
  if (data.innovation.score < 80) {
    content += `- 增强创新意识，积极提出改进建议\n`;
  }

  content += `
### 发展建议
- 继续关注文档质量和用户体验
- 积极参与文档工具和流程的改进
- 加强与其他维护者的经验交流
- 考虑承担更多文档维护责任

---

## 📋 考核记录

- **评估日期**：${new Date().toISOString().split('T')[0]}
- **评估周期**：${data.period.type}
- **评估人**：文档管理员
- **下次评估**：${new Date(Date.now() + CONFIG.periods[data.period.type]).toISOString().split('T')[0]}

---

*本文档由文档绩效评估系统自动生成。*
`;

  return content;
}

// 执行单个用户评估
function assessUser(options) {
  const maintainers = getMaintainers();
  const maintainer = maintainers.find(m => m.username === options.user);

  if (!maintainer) {
    console.error(`❌ 未找到用户: ${options.user}`);
    console.log('可用用户:', maintainers.map(m => m.username).join(', '));
    return;
  }

  console.log(`📊 开始评估用户: ${maintainer.name} (${maintainer.username})`);

  const data = collectAssessmentData(maintainer, options.period);
  const report = generatePerformanceReport(maintainer, data);

  const outputFile = options.output ||
    `${CONFIG.docsRoot}/reports/performance-${maintainer.username}-${options.period}.md`;

  // 确保目录存在
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, report, 'utf-8');
  console.log(`✅ 绩效报告已生成: ${outputFile}`);

  // 显示关键指标
  const totalScore = calculateTotalScore(data);
  const gradeLabel = getGradeLabel(totalScore);

  console.log(`📈 总体评分: ${totalScore}/100 (${gradeLabel})`);
  console.log(`   质量: ${data.quality.score}/100`);
  console.log(`   时效性: ${data.timeliness.score}/100`);
  console.log(`   协作性: ${data.collaboration.score}/100`);
  console.log(`   创新性: ${data.innovation.score}/100`);
}

// 执行批量评估
function assessBatch(options) {
  const maintainers = getMaintainers();
  const results = [];

  console.log(`📊 开始批量评估 ${maintainers.length} 个维护者...`);

  for (const maintainer of maintainers) {
    console.log(`\n👤 评估用户: ${maintainer.name}`);
    const data = collectAssessmentData(maintainer, options.period);
    const totalScore = calculateTotalScore(data);
    const gradeLabel = getGradeLabel(totalScore);

    results.push({
      username: maintainer.username,
      name: maintainer.name,
      totalScore,
      grade: gradeLabel,
      quality: data.quality.score,
      timeliness: data.timeliness.score,
      collaboration: data.collaboration.score,
      innovation: data.innovation.score
    });

    // 生成单个报告
    const report = generatePerformanceReport(maintainer, data);
    const outputFile = `${CONFIG.docsRoot}/reports/performance-${maintainer.username}-${options.period}.md`;
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputFile, report, 'utf-8');
  }

  // 生成汇总报告
  const summaryReport = generateBatchSummaryReport(results, options.period);
  const summaryFile = options.output ||
    `${CONFIG.docsRoot}/reports/performance-summary-${options.period}.md`;

  fs.writeFileSync(summaryFile, summaryReport, 'utf-8');
  console.log(`\n✅ 批量评估完成，汇总报告: ${summaryFile}`);
}

// 生成批量评估汇总报告
function generateBatchSummaryReport(results, period) {
  const now = new Date().toISOString().split('T')[0];

  let content = `---
title: DOC MAINTAINERS PERFORMANCE SUMMARY
version: v1.0.0
last_updated: ${now}
status: active
category: reports
tags: [documentation, performance, assessment, summary]
---

# 📊 文档维护者绩效评估汇总报告

> **评估周期**：${period}
> **评估日期**：${now}
> **评估人数**：${results.length}

---

## 📈 总体概览

### 评分分布

| 等级 | 人数 | 占比 |
|------|------|------|
`;

  const gradeCounts = {};
  results.forEach(result => {
    gradeCounts[result.grade] = (gradeCounts[result.grade] || 0) + 1;
  });

  Object.entries(CONFIG.grading).forEach(([key, grade]) => {
    const count = gradeCounts[grade.label] || 0;
    const percentage = ((count / results.length) * 100).toFixed(1);
    content += `| ${grade.label} | ${count} | ${percentage}% |\n`;
  });

  content += `
### 平均得分

| 维度 | 平均分 |
|------|--------|
`;

  const averages = {
    total: results.reduce((sum, r) => sum + r.totalScore, 0) / results.length,
    quality: results.reduce((sum, r) => sum + r.quality, 0) / results.length,
    timeliness: results.reduce((sum, r) => sum + r.timeliness, 0) / results.length,
    collaboration: results.reduce((sum, r) => sum + r.collaboration, 0) / results.length,
    innovation: results.reduce((sum, r) => sum + r.innovation, 0) / results.length
  };

  content += `| 总体 | ${averages.total.toFixed(1)} |\n`;
  content += `| 质量 | ${averages.quality.toFixed(1)} |\n`;
  content += `| 时效性 | ${averages.timeliness.toFixed(1)} |\n`;
  content += `| 协作性 | ${averages.collaboration.toFixed(1)} |\n`;
  content += `| 创新性 | ${averages.innovation.toFixed(1)} |\n`;

  content += `
---

## 👥 个人绩效详情

| 用户名 | 姓名 | 总分 | 等级 | 质量 | 时效性 | 协作性 | 创新性 |
|--------|------|------|------|------|--------|--------|--------|
`;

  results.forEach(result => {
    content += `| ${result.username} | ${result.name} | ${result.totalScore} | ${result.grade} | ${result.quality} | ${result.timeliness} | ${result.collaboration} | ${result.innovation} |\n`;
  });

  content += `

---

## 📋 评估结论

### 优秀表现者
`;

  const excellent = results.filter(r => r.totalScore >= 90);
  if (excellent.length > 0) {
    excellent.forEach(r => {
      content += `- **${r.name}** (${r.username}): ${r.totalScore}分\n`;
    });
  } else {
    content += `- 无\n`;
  }

  content += `
### 需要改进者
`;

  const needsImprovement = results.filter(r => r.totalScore < 80);
  if (needsImprovement.length > 0) {
    needsImprovement.forEach(r => {
      content += `- **${r.name}** (${r.username}): ${r.totalScore}分\n`;
    });
  } else {
    content += `- 无\n`;
  }

  content += `
### 建议措施
- 为优秀维护者提供适当激励
- 为需要改进者提供培训和指导
- 分享优秀维护者的经验和方法
- 继续完善评估体系和工具

---

*本文档由文档绩效评估系统自动生成。*
`;

  return content;
}

// 主函数
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  try {
    if (options.batch) {
      assessBatch(options);
    } else if (options.user) {
      assessUser(options);
    } else {
      console.error('❌ 请指定用户 (--user) 或使用批量模式 (--batch)');
      showHelp();
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
  collectAssessmentData,
  calculateTotalScore,
  getGradeLabel,
  CONFIG
};
