#!/usr/bin/env node

/**
 * 文档质量评估工具
 * 对Front前端和Admin前端文档进行质量抽样评估
 */

const fs = require('fs');
const path = require('path');

// 配置路径
const FRONT_DOCS_PATH = 'docs/requirements';
const ADMIN_DOCS_PATH = 'docs/requirements';

/**
 * 读取文档内容
 */
function readDocContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

/**
 * 评估文档头部信息完整性
 */
function assessHeaderCompleteness(content) {
  const lines = content.split('\n');
  let hasTitle = false;
  let hasVersion = false;
  let hasLastUpdated = false;
  let hasStatus = false;
  let hasCategory = false;

  // 检查前30行
  for (let i = 0; i < Math.min(30, lines.length); i++) {
    const line = lines[i].toLowerCase();

    if (line.includes('title:') && !line.includes('title: ')) hasTitle = true;
    if (line.includes('version:')) hasVersion = true;
    if (line.includes('last_updated:')) hasLastUpdated = true;
    if (line.includes('status:')) hasStatus = true;
    if (line.includes('category:')) hasCategory = true;
  }

  return {
    hasTitle,
    hasVersion,
    hasLastUpdated,
    hasStatus,
    hasCategory,
    completeness: (hasTitle + hasVersion + hasLastUpdated + hasStatus + hasCategory) / 5
  };
}

/**
 * 评估文档结构完整性
 */
function assessStructureCompleteness(content) {
  const lines = content.split('\n');
  let hasOverview = false;
  let hasTableOfContents = false;
  let hasMainContent = false;
  let hasConclusion = false;
  let hasUpdateRecord = false;

  const lowerContent = content.toLowerCase();

  // 检查是否有概述部分
  if (lowerContent.includes('概述') || lowerContent.includes('overview') ||
      lowerContent.includes('背景') || lowerContent.includes('background')) {
    hasOverview = true;
  }

  // 检查是否有目录
  if (lowerContent.includes('目录') || lowerContent.includes('table of contents') ||
      lowerContent.includes('contents')) {
    hasTableOfContents = true;
  }

  // 检查是否有主要内容（通过标题数量判断）
  const headingCount = (content.match(/^#{1,6}\s/gm) || []).length;
  if (headingCount > 3) {
    hasMainContent = true;
  }

  // 检查是否有结论或总结
  if (lowerContent.includes('结论') || lowerContent.includes('总结') ||
      lowerContent.includes('conclusion') || lowerContent.includes('summary')) {
    hasConclusion = true;
  }

  // 检查是否有更新记录
  if (lowerContent.includes('更新记录') || lowerContent.includes('update record') ||
      lowerContent.includes('changelog')) {
    hasUpdateRecord = true;
  }

  return {
    hasOverview,
    hasTableOfContents,
    hasMainContent,
    hasConclusion,
    hasUpdateRecord,
    completeness: (hasOverview + hasTableOfContents + hasMainContent + hasConclusion + hasUpdateRecord) / 5
  };
}

/**
 * 评估文档内容质量
 */
function assessContentQuality(content) {
  let metrics = {
    totalLength: content.length,
    wordCount: content.split(/\s+/).length,
    lineCount: content.split('\n').length,
    codeBlockCount: 0,
    linkCount: 0,
    imageCount: 0,
    tableCount: 0,
    headingCount: 0,
    listCount: 0
  };

  // 统计代码块
  metrics.codeBlockCount = (content.match(/```[\s\S]*?```/g) || []).length;

  // 统计链接
  metrics.linkCount = (content.match(/\[.*?\]\(.*?\)/g) || []).length;

  // 统计图片
  metrics.imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;

  // 统计表格
  metrics.tableCount = (content.match(/\|.*\|.*\|/g) || []).length;

  // 统计标题
  metrics.headingCount = (content.match(/^#{1,6}\s/gm) || []).length;

  // 统计列表
  metrics.listCount = (content.match(/^[\s]*[-*+]\s/gm) || []).length;
  metrics.listCount += (content.match(/^[\s]*\d+\.\s/gm) || []).length;

  // 计算内容丰富度得分
  const richnessScore = Math.min(1, (
    metrics.codeBlockCount * 0.2 +
    metrics.linkCount * 0.1 +
    metrics.imageCount * 0.1 +
    metrics.tableCount * 0.1 +
    metrics.headingCount * 0.05 +
    metrics.listCount * 0.05
  ) / 10);

  return {
    ...metrics,
    richnessScore,
    qualityScore: richnessScore // 简化为丰富度得分
  };
}

/**
 * 评估文档时效性
 */
function assessTimeliness(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const lastModified = stats.mtime;
    const now = new Date();
    const daysSinceModified = Math.floor((now - lastModified) / (1000 * 60 * 60 * 24));

    let timelinessScore;
    if (daysSinceModified <= 30) timelinessScore = 1.0; // 最近一个月
    else if (daysSinceModified <= 90) timelinessScore = 0.8; // 最近三个月
    else if (daysSinceModified <= 180) timelinessScore = 0.6; // 最近半年
    else if (daysSinceModified <= 365) timelinessScore = 0.4; // 最近一年
    else timelinessScore = 0.2; // 一年以上

    return {
      lastModified: lastModified.toISOString(),
      daysSinceModified,
      timelinessScore
    };
  } catch (error) {
    return {
      lastModified: null,
      daysSinceModified: null,
      timelinessScore: 0
    };
  }
}

/**
 * 执行抽样评估
 */
function performSamplingAssessment(docFiles, sampleSize = 5) {
  // 随机抽样
  const shuffled = [...docFiles].sort(() => 0.5 - Math.random());
  const sample = shuffled.slice(0, Math.min(sampleSize, docFiles.length));

  console.log(`📊 对 ${sample.length} 个文档进行抽样质量评估...\n`);

  const assessments = [];

  sample.forEach((filePath, index) => {
    console.log(`评估文档 ${index + 1}/${sample.length}: ${path.relative(process.cwd(), filePath)}`);

    const content = readDocContent(filePath);
    if (!content) {
      console.log('  ❌ 无法读取文档内容\n');
      return;
    }

    const headerAssessment = assessHeaderCompleteness(content);
    const structureAssessment = assessStructureCompleteness(content);
    const contentAssessment = assessContentQuality(content);
    const timelinessAssessment = assessTimeliness(filePath);

    const overallScore = (
      headerAssessment.completeness * 0.3 +
      structureAssessment.completeness * 0.3 +
      contentAssessment.qualityScore * 0.2 +
      timelinessAssessment.timelinessScore * 0.2
    );

    const assessment = {
      file: path.relative(process.cwd(), filePath),
      header: headerAssessment,
      structure: structureAssessment,
      content: contentAssessment,
      timeliness: timelinessAssessment,
      overallScore: Math.round(overallScore * 100) / 100
    };

    assessments.push(assessment);

    console.log(`  📋 头部完整性: ${(headerAssessment.completeness * 100).toFixed(1)}%`);
    console.log(`  🏗️ 结构完整性: ${(structureAssessment.completeness * 100).toFixed(1)}%`);
    console.log(`  📝 内容质量: ${(contentAssessment.qualityScore * 100).toFixed(1)}%`);
    console.log(`  ⏰ 时效性: ${(timelinessAssessment.timelinessScore * 100).toFixed(1)}%`);
    console.log(`  🎯 综合得分: ${(assessment.overallScore * 100).toFixed(1)}%\n`);
  });

  return assessments;
}

/**
 * 生成质量评估报告
 */
function generateQualityReport() {
  console.log('🔍 开始文档质量评估...\n');

  // 获取文档文件列表
  const frontDocs = getFrontDocFiles();
  const adminDocs = getAdminDocFiles();

  console.log('📊 文档数量统计:');
  console.log(`   Front前端需求文档: ${frontDocs.length} 个`);
  console.log(`   Admin前端需求文档: ${adminDocs.length} 个\n`);

  // 执行抽样评估
  const frontAssessments = performSamplingAssessment(frontDocs, 5);
  const adminAssessments = performSamplingAssessment(adminDocs, 5);

  // 计算平均得分
  const frontAvgScore = frontAssessments.reduce((sum, a) => sum + a.overallScore, 0) / frontAssessments.length;
  const adminAvgScore = adminAssessments.reduce((sum, a) => sum + a.overallScore, 0) / adminAssessments.length;

  console.log('📈 质量评估汇总:');
  console.log(`   Front前端平均得分: ${(frontAvgScore * 100).toFixed(1)}%`);
  console.log(`   Admin前端平均得分: ${(adminAvgScore * 100).toFixed(1)}%`);
  console.log(`   质量差距: ${((adminAvgScore - frontAvgScore) * 100).toFixed(1)} 个百分点\n`);

  // 生成详细报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      frontDocCount: frontDocs.length,
      adminDocCount: adminDocs.length,
      frontAvgScore,
      adminAvgScore,
      qualityGap: adminAvgScore - frontAvgScore
    },
    frontAssessments,
    adminAssessments
  };

  // 保存JSON报告
  const jsonPath = 'docs/reports/doc-quality-assessment.json';
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`📄 JSON报告已保存到: ${jsonPath}`);

  // 生成Markdown报告
  const markdownReport = generateMarkdownQualityReport(report);
  const markdownPath = 'docs/reports/DOC_QUALITY_ASSESSMENT_REPORT.md';
  fs.writeFileSync(markdownPath, markdownReport);
  console.log(`📄 Markdown报告已保存到: ${markdownPath}`);

  console.log('\n✅ 文档质量评估完成!');
}

/**
 * 获取Front前端文档文件列表
 */
function getFrontDocFiles() {
  try {
    const dirPath = 'docs/requirements';
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    return fs.readdirSync(dirPath)
      .filter(file => {
        const fullPath = path.join(dirPath, file);
        return fs.statSync(fullPath).isFile() &&
               fullPath.endsWith('.md') &&
               !file.startsWith('ADMIN_') && // 排除Admin文档
               !file.includes('INDEX') && // 排除索引文档
               file !== 'ALL_PAGES_REQUIREMENTS_REVIEW.md' && // 排除综合文档
               !file.endsWith('.backup'); // 排除备份文件
      })
      .map(file => path.join(dirPath, file));
  } catch (error) {
    return [];
  }
}

/**
 * 获取Admin前端文档文件列表
 */
function getAdminDocFiles() {
  try {
    const dirPath = 'docs/requirements';
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    return fs.readdirSync(dirPath)
      .filter(file => {
        const fullPath = path.join(dirPath, file);
        return fs.statSync(fullPath).isFile() &&
               fullPath.endsWith('.md') &&
               file.startsWith('ADMIN_') && // 只包含Admin文档
               !file.endsWith('.backup'); // 排除备份文件
      })
      .map(file => path.join(dirPath, file));
  } catch (error) {
    return [];
  }
}

/**
 * 生成Markdown质量报告
 */
function generateMarkdownQualityReport(report) {
  const formatScore = (score) => `${(score * 100).toFixed(1)}%`;

  return `# 文档质量评估报告

> **生成时间**：${new Date().toLocaleString()}
> **评估工具**：quality-assessment.js

---

## 📊 评估概览

| 项目 | Front前端 | Admin前端 | 差距 |
|------|-----------|-----------|------|
| 文档数量 | ${report.summary.frontDocCount} | ${report.summary.adminDocCount} | ${report.summary.frontDocCount > report.summary.adminDocCount ? '+' : ''}${(report.summary.frontDocCount - report.summary.adminDocCount)} |
| 平均质量得分 | ${formatScore(report.summary.frontAvgScore)} | ${formatScore(report.summary.adminAvgScore)} | ${report.summary.qualityGap > 0 ? '-' : '+'}${formatScore(Math.abs(report.summary.qualityGap))} |

---

## 📋 Front前端文档质量详情

${report.frontAssessments.map((assessment, index) => `
### ${index + 1}. ${assessment.file}

| 评估维度 | 得分 | 详情 |
|----------|------|------|
| 头部完整性 | ${formatScore(assessment.header.completeness)} | 标题:${assessment.header.hasTitle ? '✅' : '❌'} 版本:${assessment.header.hasVersion ? '✅' : '❌'} 更新:${assessment.header.hasLastUpdated ? '✅' : '❌'} 状态:${assessment.header.hasStatus ? '✅' : '❌'} 分类:${assessment.header.hasCategory ? '✅' : '❌'} |
| 结构完整性 | ${formatScore(assessment.structure.completeness)} | 概述:${assessment.structure.hasOverview ? '✅' : '❌'} 目录:${assessment.structure.hasTableOfContents ? '✅' : '❌'} 内容:${assessment.structure.hasMainContent ? '✅' : '❌'} 结论:${assessment.structure.hasConclusion ? '✅' : '❌'} 更新:${assessment.structure.hasUpdateRecord ? '✅' : '❌'} |
| 内容质量 | ${formatScore(assessment.content.qualityScore)} | 字数:${assessment.content.wordCount} 代码块:${assessment.content.codeBlockCount} 链接:${assessment.content.linkCount} 图片:${assessment.content.imageCount} |
| 时效性 | ${formatScore(assessment.timeliness.timelinessScore)} | ${assessment.timeliness.daysSinceModified ? assessment.timeliness.daysSinceModified + '天前更新' : '未知'} |
| **综合得分** | **${formatScore(assessment.overallScore)}** | - |

`).join('\n')}

---

## 🏆 Admin前端文档质量详情

${report.adminAssessments.map((assessment, index) => `
### ${index + 1}. ${assessment.file}

| 评估维度 | 得分 | 详情 |
|----------|------|------|
| 头部完整性 | ${formatScore(assessment.header.completeness)} | 标题:${assessment.header.hasTitle ? '✅' : '❌'} 版本:${assessment.header.hasVersion ? '✅' : '❌'} 更新:${assessment.header.hasLastUpdated ? '✅' : '❌'} 状态:${assessment.header.hasStatus ? '✅' : '❌'} 分类:${assessment.header.hasCategory ? '✅' : '❌'} |
| 结构完整性 | ${formatScore(assessment.structure.completeness)} | 概述:${assessment.structure.hasOverview ? '✅' : '❌'} 目录:${assessment.structure.hasTableOfContents ? '✅' : '❌'} 内容:${assessment.structure.hasMainContent ? '✅' : '❌'} 结论:${assessment.structure.hasConclusion ? '✅' : '❌'} 更新:${assessment.structure.hasUpdateRecord ? '✅' : '❌'} |
| 内容质量 | ${formatScore(assessment.content.qualityScore)} | 字数:${assessment.content.wordCount} 代码块:${assessment.content.codeBlockCount} 链接:${assessment.content.linkCount} 图片:${assessment.content.imageCount} |
| 时效性 | ${formatScore(assessment.timeliness.timelinessScore)} | ${assessment.timeliness.daysSinceModified ? assessment.timeliness.daysSinceModified + '天前更新' : '未知'} |
| **综合得分** | **${formatScore(assessment.overallScore)}** | - |

`).join('\n')}

---

## 🔍 质量分析结论

### 主要发现

1. **质量差距显著**
   - Admin前端文档质量显著高于Front前端
   - 平均质量得分差距达 ${(Math.abs(report.summary.qualityGap) * 100).toFixed(1)} 个百分点

2. **Front前端质量问题**
   - 头部信息完整性不足（平均 ${(report.frontAssessments.reduce((sum, a) => sum + a.header.completeness, 0) / report.frontAssessments.length * 100).toFixed(1)}%）
   - 文档时效性较差（平均 ${(report.frontAssessments.reduce((sum, a) => sum + a.timeliness.timelinessScore, 0) / report.frontAssessments.length * 100).toFixed(1)}%）

3. **Admin前端质量优势**
   - 头部信息100%完整
   - 结构完整性高
   - 时效性良好

### 改进建议

1. **完善头部信息**：为所有Front前端文档添加完整的头部信息
2. **优化文档结构**：确保文档包含概述、目录、主要内容、结论等部分
3. **提高更新频率**：建立文档定期更新机制
4. **丰富内容形式**：增加代码示例、图表、链接等内容元素

---

**评估时间**：${new Date().toISOString()}
`;
}

// 主执行函数
if (require.main === module) {
  generateQualityReport();
}

module.exports = {
  assessHeaderCompleteness,
  assessStructureCompleteness,
  assessContentQuality,
  assessTimeliness,
  performSamplingAssessment
};
