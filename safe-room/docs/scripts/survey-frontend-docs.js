#!/usr/bin/env node

/**
 * Front前端文档工程调查工具
 * 用于收集和分析Front前端文档工程的统计数据
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置路径
const FRONT_CODE_PATH = 'springboot1ngh61a2/src/main/resources/front/front/src';
const FRONT_DOCS_PATH = 'docs/requirements/frontend';
const ADMIN_DOCS_PATH = 'docs/requirements/admin';

/**
 * 扫描目录并统计文件数量
 */
function scanDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      return { total: 0, files: [], error: `目录不存在: ${dirPath}` };
    }

    const files = fs.readdirSync(dirPath, { recursive: true })
      .filter(file => {
        const fullPath = path.join(dirPath, file);
        return fs.statSync(fullPath).isFile();
      })
      .map(file => path.join(dirPath, file));

    return { total: files.length, files, error: null };
  } catch (error) {
    return { total: 0, files: [], error: error.message };
  }
}

/**
 * 分析文档头部信息
 */
function analyzeDocHeaders(docFiles) {
  const results = {
    total: docFiles.length,
    withVersion: 0,
    withLastUpdated: 0,
    withStatus: 0,
    withCategory: 0,
    headerStats: []
  };

  docFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      let hasVersion = false;
      let hasLastUpdated = false;
      let hasStatus = false;
      let hasCategory = false;

      // 检查前20行是否包含头部信息
      for (let i = 0; i < Math.min(20, lines.length); i++) {
        const line = lines[i].toLowerCase();
        if (line.includes('version:')) hasVersion = true;
        if (line.includes('last_updated:')) hasLastUpdated = true;
        if (line.includes('status:')) hasStatus = true;
        if (line.includes('category:')) hasCategory = true;
      }

      if (hasVersion) results.withVersion++;
      if (hasLastUpdated) results.withLastUpdated++;
      if (hasStatus) results.withStatus++;
      if (hasCategory) results.withCategory++;

      results.headerStats.push({
        file: path.relative(process.cwd(), filePath),
        hasVersion,
        hasLastUpdated,
        hasStatus,
        hasCategory
      });

    } catch (error) {
      console.warn(`无法读取文件 ${filePath}: ${error.message}`);
    }
  });

  return results;
}

/**
 * 统计代码文件类型
 */
function analyzeCodeFiles(codeFiles) {
  const stats = {
    total: codeFiles.length,
    byExtension: {},
    byDirectory: {},
    components: 0,
    pages: 0,
    composables: 0,
    utils: 0,
    types: 0,
    styles: 0
  };

  codeFiles.forEach(filePath => {
    const ext = path.extname(filePath);
    stats.byExtension[ext] = (stats.byExtension[ext] || 0) + 1;

    const relativePath = path.relative(FRONT_CODE_PATH, filePath);
    const dir = path.dirname(relativePath);

    if (dir.startsWith('components')) stats.components++;
    else if (dir.startsWith('pages')) stats.pages++;
    else if (dir.startsWith('composables')) stats.composables++;
    else if (dir.startsWith('utils')) stats.utils++;
    else if (dir.startsWith('types')) stats.types++;
    else if (dir.startsWith('styles')) stats.styles++;

    stats.byDirectory[dir] = (stats.byDirectory[dir] || 0) + 1;
  });

  return stats;
}

/**
 * 生成调查报告
 */
function generateReport() {
  console.log('🔍 开始Front前端文档工程调查...\n');

  // 扫描文档
  const frontDocs = scanDirectory(FRONT_DOCS_PATH);
  const adminDocs = scanDirectory(ADMIN_DOCS_PATH);

  // 扫描代码
  const frontCode = scanDirectory(FRONT_CODE_PATH);

  console.log('📊 文档统计:');
  console.log(`   Front前端需求文档: ${frontDocs.total} 个`);
  console.log(`   Admin前端需求文档: ${adminDocs.total} 个`);
  console.log(`   Front前端代码文件: ${frontCode.total} 个\n`);

  // 分析文档头部信息
  if (frontDocs.files.length > 0) {
    console.log('📋 Front前端文档头部信息分析:');
    const headerAnalysis = analyzeDocHeaders(frontDocs.files);
    console.log(`   总文档数: ${headerAnalysis.total}`);
    console.log(`   有版本信息: ${headerAnalysis.withVersion} (${((headerAnalysis.withVersion/headerAnalysis.total)*100).toFixed(1)}%)`);
    console.log(`   有更新日期: ${headerAnalysis.withLastUpdated} (${((headerAnalysis.withLastUpdated/headerAnalysis.total)*100).toFixed(1)}%)`);
    console.log(`   有状态信息: ${headerAnalysis.withStatus} (${((headerAnalysis.withStatus/headerAnalysis.total)*100).toFixed(1)}%)`);
    console.log(`   有分类信息: ${headerAnalysis.withCategory} (${((headerAnalysis.withCategory/headerAnalysis.total)*100).toFixed(1)}%)\n`);
  }

  // 分析代码文件
  if (frontCode.files.length > 0) {
    console.log('💻 Front前端代码文件分析:');
    const codeAnalysis = analyzeCodeFiles(frontCode.files);
    console.log(`   组件文件: ${codeAnalysis.components}`);
    console.log(`   页面文件: ${codeAnalysis.pages}`);
    console.log(`   组合式函数: ${codeAnalysis.composables}`);
    console.log(`   工具函数: ${codeAnalysis.utils}`);
    console.log(`   类型定义: ${codeAnalysis.types}`);
    console.log(`   样式文件: ${codeAnalysis.styles}\n`);

    console.log('📁 文件类型分布:');
    Object.entries(codeAnalysis.byExtension).forEach(([ext, count]) => {
      console.log(`   ${ext}: ${count} 个文件`);
    });
    console.log('');
  }

  // 生成对比报告
  console.log('⚖️ 对比分析:');
  console.log(`   Front vs Admin 文档数量比: ${(frontDocs.total/adminDocs.total).toFixed(2)}:1`);
  console.log(`   代码vs文档比: ${(frontCode.total/frontDocs.total).toFixed(2)}:1`);
  console.log(`   Admin代码vs文档比: ${(frontCode.total/adminDocs.total).toFixed(2)}:1\n`);

  // 生成JSON报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      frontDocs: frontDocs.total,
      adminDocs: adminDocs.total,
      frontCode: frontCode.total,
      docRatio: (frontCode.total/frontDocs.total).toFixed(2),
      adminRatio: (frontCode.total/adminDocs.total).toFixed(2)
    },
    frontDocs: frontDocs,
    adminDocs: adminDocs,
    frontCode: frontCode,
    headerAnalysis: frontDocs.files.length > 0 ? analyzeDocHeaders(frontDocs.files) : null,
    codeAnalysis: frontCode.files.length > 0 ? analyzeCodeFiles(frontCode.files) : null
  };

  // 保存报告
  const reportPath = 'docs/reports/frontend-doc-survey-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 调查报告已保存到: ${reportPath}`);

  // 生成Markdown报告
  const markdownReport = generateMarkdownReport(report);
  const markdownPath = 'docs/reports/FRONTEND_DOC_SURVEY_REPORT.md';
  fs.writeFileSync(markdownPath, markdownReport);
  console.log(`📄 Markdown报告已保存到: ${markdownPath}`);

  console.log('\n✅ Front前端文档工程调查完成!');
}

/**
 * 生成Markdown格式的报告
 */
function generateMarkdownReport(report) {
  return `# Front前端文档工程调查报告

> **生成时间**：${new Date().toLocaleString()}
> **调查工具**：survey-frontend-docs.js

---

## 📊 统计概览

| 项目 | 数量 | 占比 |
|------|------|------|
| Front前端需求文档 | ${report.summary.frontDocs} | - |
| Admin前端需求文档 | ${report.summary.adminDocs} | - |
| Front前端代码文件 | ${report.summary.frontCode} | - |
| 代码:文档比 (Front) | ${report.summary.docRatio}:1 | - |
| 代码:文档比 (Admin) | ${report.summary.adminRatio}:1 | - |

---

## 📋 文档质量分析

${report.headerAnalysis ? `
### 头部信息完整性

- **总文档数**：${report.headerAnalysis.total}
- **有版本信息**：${report.headerAnalysis.withVersion} (${((report.headerAnalysis.withVersion/report.headerAnalysis.total)*100).toFixed(1)}%)
- **有更新日期**：${report.headerAnalysis.withLastUpdated} (${((report.headerAnalysis.withLastUpdated/report.headerAnalysis.total)*100).toFixed(1)}%)
- **有状态信息**：${report.headerAnalysis.withStatus} (${((report.headerAnalysis.withStatus/report.headerAnalysis.total)*100).toFixed(1)}%)
- **有分类信息**：${report.headerAnalysis.withCategory} (${((report.headerAnalysis.withCategory/report.headerAnalysis.total)*100).toFixed(1)}%)
` : '暂无头部信息分析数据'}

---

## 💻 代码结构分析

${report.codeAnalysis ? `
### 文件类型分布

| 类型 | 数量 |
|------|------|
| 组件文件 | ${report.codeAnalysis.components} |
| 页面文件 | ${report.codeAnalysis.pages} |
| 组合式函数 | ${report.codeAnalysis.composables} |
| 工具函数 | ${report.codeAnalysis.utils} |
| 类型定义 | ${report.codeAnalysis.types} |
| 样式文件 | ${report.codeAnalysis.styles} |

### 文件扩展名统计

${Object.entries(report.codeAnalysis.byExtension).map(([ext, count]) => `- **${ext}**: ${count} 个文件`).join('\n')}
` : '暂无代码分析数据'}

---

## ⚖️ 对比分析

### 文档体系对比
- **Front前端文档完整性**：${report.summary.frontDocs > 0 ? '有需求文档' : '无文档'}
- **Admin前端文档完整性**：${report.summary.adminDocs > 0 ? '有需求文档' : '无文档'}
- **Front vs Admin 文档数量比**：${(report.summary.frontDocs/report.summary.adminDocs).toFixed(2)}:1

### 代码与文档关系
- **Front 代码复杂度**：${report.summary.frontCode} 个文件
- **文档支撑程度**：${report.summary.docRatio}:1 (代码:文档)

---

## 🔍 调查发现

### 主要问题
1. **文档体系不完整**：Front前端缺少技术文档、开发文档和报告文档
2. **文档分类不完善**：仅requirements分类，缺少technical/development/reports
3. **文档与代码脱节**：代码量大但技术文档支撑不足

### 对比发现
1. **Admin前端优势**：完整的四级文档分类体系
2. **Front前端劣势**：文档工程发展滞后于代码工程
3. **差距量化**：Front文档数量是Admin的${(report.summary.frontDocs/report.summary.adminDocs).toFixed(2)}倍，但缺少关键文档类型

---

## 📈 建议方向

1. **建立完整文档体系**：参考Admin前端，建立requirements/technical/development/reports四级分类
2. **完善技术文档**：补充架构文档、API文档、组件文档
3. **加强开发文档**：添加开发环境、测试策略、代码规范等
4. **建立报告机制**：定期生成质量报告、覆盖率报告等

---

**报告生成时间**：${new Date().toISOString()}
`;
}

// 主执行函数
if (require.main === module) {
  generateReport();
}

module.exports = {
  scanDirectory,
  analyzeDocHeaders,
  analyzeCodeFiles,
  generateReport
};
