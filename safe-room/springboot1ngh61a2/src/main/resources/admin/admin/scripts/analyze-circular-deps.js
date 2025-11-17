#!/usr/bin/env node

/**
 * 循环依赖分析脚本
 * 使用 madge 分析循环依赖，生成详细报告
 */

import fs from 'fs';
import path from 'path';
import madge from 'madge';

/**
 * 分析循环依赖
 * @returns {Promise<Object>} 分析结果
 */
async function analyzeCircularDeps() {
  console.log('🔄 开始分析循环依赖...');

  const config = {
    baseDir: path.join(__dirname, '..'),
    fileExtensions: ['ts', 'js', 'vue'],
    tsConfig: path.join(__dirname, '..', 'tsconfig.json'),
    includeNpm: false, // 不包含 npm 包
    excludeRegExp: [
      /node_modules/,
      /\.spec\.ts$/,
      /\.test\.ts$/,
      /\.d\.ts$/
    ]
  };

  try {
    const result = await madge(path.join(__dirname, '..', 'src'), config);
    const circularDeps = result.circular();

    return {
      circularDeps,
      dependencyGraph: result.obj(),
      warnings: result.warnings()
    };
  } catch (error) {
    console.error('❌ 分析循环依赖失败:', error.message);
    throw error;
  }
}

/**
 * 生成报告
 * @param {Object} analysisResult - 分析结果
 */
function generateReport(analysisResult) {
  const { circularDeps, dependencyGraph, warnings } = analysisResult;

  const reportPath = path.join(__dirname, '..', 'reports', 'circular-deps-report.json');
  const htmlReportPath = path.join(__dirname, '..', 'reports', 'circular-deps-report.html');
  const graphPath = path.join(__dirname, '..', 'reports', 'dependency-graph.json');

  // 确保 reports 目录存在
  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // JSON 报告
  const jsonReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalCircularDependencies: circularDeps.length,
      totalModules: Object.keys(dependencyGraph).length,
      warningsCount: warnings ? warnings.length : 0
    },
    circularDependencies: circularDeps,
    warnings: warnings || [],
    dependencyGraph
  };

  fs.writeFileSync(reportPath, JSON.stringify(jsonReport, null, 2), 'utf8');
  fs.writeFileSync(graphPath, JSON.stringify(dependencyGraph, null, 2), 'utf8');

  // HTML 报告
  const htmlContent = generateHtmlReport(jsonReport);
  fs.writeFileSync(htmlReportPath, htmlContent, 'utf8');

  console.log(`📄 JSON报告已保存: ${path.relative(process.cwd(), reportPath)}`);
  console.log(`📊 依赖图已保存: ${path.relative(process.cwd(), graphPath)}`);
  console.log(`🌐 HTML报告已保存: ${path.relative(process.cwd(), htmlReportPath)}`);
}

/**
 * 生成 HTML 报告
 * @param {Object} report - 报告数据
 * @returns {string} HTML 内容
 */
function generateHtmlReport(report) {
  const { summary, circularDependencies, warnings } = report;

  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>循环依赖分析报告</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .summary { display: flex; gap: 20px; margin: 20px; }
        .summary-item { flex: 1; text-align: center; padding: 15px; background: #ecf0f1; border-radius: 6px; }
        .summary-number { font-size: 2em; font-weight: bold; color: #e74c3c; }
        .section { margin: 20px; }
        .circular-dep { margin-bottom: 15px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; }
        .dep-chain { font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .dep-arrow { color: #e74c3c; font-weight: bold; }
        .warning { margin-bottom: 10px; padding: 10px; background: #d4edda; border-left: 4px solid #28a745; border-radius: 4px; }
        .no-issues { text-align: center; padding: 40px; color: #28a745; font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>循环依赖分析报告</h1>
            <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>

        <div class="summary">
            <div class="summary-item">
                <div class="summary-number">${summary.totalCircularDependencies}</div>
                <div>循环依赖链</div>
            </div>
            <div class="summary-item">
                <div class="summary-number">${summary.totalModules}</div>
                <div>总模块数</div>
            </div>
            <div class="summary-item">
                <div class="summary-number">${summary.warningsCount}</div>
                <div>警告信息</div>
            </div>
        </div>
`;

  // 循环依赖部分
  html += `<div class="section"><h2>循环依赖详情</h2>`;
  if (circularDependencies.length === 0) {
    html += `<div class="no-issues">🎉 恭喜！项目中没有发现循环依赖。</div>`;
  } else {
    circularDependencies.forEach((chain, index) => {
      const chainPath = chain.map(file => path.relative(path.join(__dirname, '..', 'src'), file)).join(' → ');
      html += `
        <div class="circular-dep">
            <h3>循环依赖链 ${index + 1}</h3>
            <div class="dep-chain">${chainPath}</div>
            <p><strong>影响文件:</strong></p>
            <ul>
                ${chain.map(file => `<li>${path.relative(path.join(__dirname, '..'), file)}</li>`).join('')}
            </ul>
        </div>
`;
    });
  }
  html += `</div>`;

  // 警告信息部分
  if (warnings && warnings.length > 0) {
    html += `<div class="section"><h2>警告信息</h2>`;
    warnings.forEach(warning => {
      html += `<div class="warning">${warning}</div>`;
    });
    html += `</div>`;
  }

  html += `
    </div>
</body>
</html>
`;

  return html;
}

/**
 * 主函数
 */
async function main() {
  try {
    const analysisResult = await analyzeCircularDeps();
    generateReport(analysisResult);

    const { circularDeps, warnings } = analysisResult;

    console.log('✅ 循环依赖分析完成！');
    console.log(`📊 发现 ${circularDeps.length} 个循环依赖链`);
    console.log(`⚠️  发现 ${warnings ? warnings.length : 0} 个警告`);

    if (circularDeps.length > 0) {
      console.log('\n🔍 循环依赖链详情:');
      circularDeps.forEach((chain, index) => {
        const chainPath = chain.map(file => path.relative(path.join(__dirname, '..', 'src'), file)).join(' → ');
        console.log(`  ${index + 1}. ${chainPath}`);
      });
    }

  } catch (error) {
    console.error('❌ 分析失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeCircularDeps, generateReport };
