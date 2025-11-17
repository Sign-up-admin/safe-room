#!/usr/bin/env node

/**
 * 未使用导入检测脚本
 * 使用 ESLint API 检测并报告未使用的 imports
 */

import fs from 'fs';
import path from 'path';
import { ESLint } from 'eslint';
import glob from 'glob';

// 匹配的文件类型
const FILE_PATTERNS = [
  'src/**/*.ts',
  'src/**/*.vue',
  '!src/**/*.d.ts', // 排除类型定义文件
  '!src/**/*.spec.ts', // 排除测试文件
  '!src/**/*.test.ts'
];

// ESLint 配置
const ESLINT_CONFIG = {
  extends: ['@vue/eslint-config-typescript'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    'vue/no-unused-vars': 'error',
    'no-unused-vars': 'off' // 关闭基础规则，使用 TypeScript 版本
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  }
};

/**
 * 检测未使用的导入
 * @param {string[]} files - 文件列表
 * @returns {Promise<Object>} 检测结果
 */
async function detectUnusedImports(files) {
  console.log('🔍 开始检测未使用的导入...');

  const eslint = new ESLint({
    baseConfig: ESLINT_CONFIG,
    useEslintrc: false,
    fix: false
  });

  const results = await eslint.lintFiles(files);
  const unusedImports = {};

  for (const result of results) {
    if (result.messages.length === 0) continue;

    const filePath = path.relative(process.cwd(), result.filePath);
    const fileUnusedImports = [];

    for (const message of result.messages) {
      if (message.ruleId === '@typescript-eslint/no-unused-vars' ||
          message.ruleId === 'vue/no-unused-vars') {
        fileUnusedImports.push({
          line: message.line,
          column: message.column,
          variable: message.message.match(/'([^']+)'/)?.[1] || 'unknown',
          message: message.message
        });
      }
    }

    if (fileUnusedImports.length > 0) {
      unusedImports[filePath] = fileUnusedImports;
    }
  }

  return unusedImports;
}

/**
 * 生成报告
 * @param {Object} unusedImports - 未使用导入数据
 */
function generateReport(unusedImports) {
  const reportPath = path.join(__dirname, '..', 'reports', 'unused-imports-report.json');
  const htmlReportPath = path.join(__dirname, '..', 'reports', 'unused-imports-report.html');

  // 确保 reports 目录存在
  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // JSON 报告
  fs.writeFileSync(reportPath, JSON.stringify(unusedImports, null, 2), 'utf8');

  // HTML 报告
  const htmlContent = generateHtmlReport(unusedImports);
  fs.writeFileSync(htmlReportPath, htmlContent, 'utf8');

  console.log(`📄 JSON报告已保存: ${path.relative(process.cwd(), reportPath)}`);
  console.log(`🌐 HTML报告已保存: ${path.relative(process.cwd(), htmlReportPath)}`);
}

/**
 * 生成 HTML 报告
 * @param {Object} unusedImports - 未使用导入数据
 * @returns {string} HTML 内容
 */
function generateHtmlReport(unusedImports) {
  const totalFiles = Object.keys(unusedImports).length;
  const totalIssues = Object.values(unusedImports).reduce((sum, issues) => sum + issues.length, 0);

  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>未使用导入检测报告</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .summary { display: flex; gap: 20px; margin: 20px; }
        .summary-item { flex: 1; text-align: center; padding: 15px; background: #ecf0f1; border-radius: 6px; }
        .summary-number { font-size: 2em; font-weight: bold; color: #e74c3c; }
        .file-list { margin: 20px; }
        .file-item { margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
        .file-header { background: #34495e; color: white; padding: 10px 15px; cursor: pointer; display: flex; justify-content: space-between; }
        .file-issues { padding: 15px; background: #f8f9fa; }
        .issue { margin-bottom: 8px; padding: 8px; background: #fff3cd; border-left: 4px solid #ffc107; }
        .toggle-btn { background: none; border: none; color: white; font-size: 16px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>未使用导入检测报告</h1>
            <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>

        <div class="summary">
            <div class="summary-item">
                <div class="summary-number">${totalFiles}</div>
                <div>存在问题的文件</div>
            </div>
            <div class="summary-item">
                <div class="summary-number">${totalIssues}</div>
                <div>未使用的导入</div>
            </div>
        </div>

        <div class="file-list">
            <h2>详细报告</h2>
`;

  for (const [filePath, issues] of Object.entries(unusedImports)) {
    html += `
            <div class="file-item">
                <div class="file-header" onclick="toggleIssues(this)">
                    <span>${filePath}</span>
                    <span class="toggle-btn">${issues.length} 个问题 ▼</span>
                </div>
                <div class="file-issues">
`;

    for (const issue of issues) {
      html += `
                    <div class="issue">
                        <strong>第 ${issue.line} 行:</strong> ${issue.message}
                    </div>
`;
    }

    html += `
                </div>
            </div>
`;
  }

  html += `
        </div>
    </div>

    <script>
        function toggleIssues(header) {
            const issues = header.nextElementSibling;
            const btn = header.querySelector('.toggle-btn');
            if (issues.style.display === 'none') {
                issues.style.display = 'block';
                btn.textContent = btn.textContent.replace('▶', '▼');
            } else {
                issues.style.display = 'none';
                btn.textContent = btn.textContent.replace('▼', '▶');
            }
        }
    </script>
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
    // 查找所有匹配的文件
    const files = await glob(FILE_PATTERNS, {
      cwd: path.join(__dirname, '..'),
      absolute: true
    });

    console.log(`📁 找到 ${files.length} 个文件需要检测`);

    // 检测未使用的导入
    const unusedImports = await detectUnusedImports(files);

    // 生成报告
    generateReport(unusedImports);

    const totalFiles = Object.keys(unusedImports).length;
    const totalIssues = Object.values(unusedImports).reduce((sum, issues) => sum + issues.length, 0);

    console.log('✅ 未使用导入检测完成！');
    console.log(`📊 发现 ${totalFiles} 个文件存在 ${totalIssues} 个未使用的导入`);

    if (totalIssues > 0) {
      console.log('💡 建议运行: npm run lint -- --fix 来自动修复部分问题');
    }

  } catch (error) {
    console.error('❌ 检测失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { detectUnusedImports, generateReport };
