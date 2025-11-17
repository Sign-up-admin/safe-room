/**
 * 批量修复测试文件中的编码问题和中文字符串处理
 * 主要解决"Unterminated string literal"错误
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';

// 测试文件目录
const testDirs = [
  'tests/unit',
  'tests/integration',
  'tests/e2e'
];

// 修复统计
const stats = {
  filesChecked: 0,
  filesFixed: 0,
  errorsFound: []
};

/**
 * 检查文件编码问题
 */
function checkEncodingIssues(content, filePath) {
  const issues = [];

  // 检查未终止的字符串字面量
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    // 检查单引号字符串
    const singleQuoteMatches = line.match(/'[^'\\]*(?:\\.[^'\\]*)*'/g);
    if (singleQuoteMatches) {
      singleQuoteMatches.forEach(match => {
        // 检查字符串是否在行尾意外结束
        if (match.endsWith('\\') && !line.trim().endsWith(match + ';') && !line.trim().endsWith(match + ',')) {
          issues.push({
            type: 'unterminated_single_quote',
            line: index + 1,
            content: match
          });
        }
      });
    }

    // 检查双引号字符串
    const doubleQuoteMatches = line.match(/"[^"\\]*(?:\\.[^"\\]*)*"/g);
    if (doubleQuoteMatches) {
      doubleQuoteMatches.forEach(match => {
        // 检查字符串是否在行尾意外结束
        if (match.endsWith('\\') && !line.trim().endsWith(match + ';') && !line.trim().endsWith(match + ',')) {
          issues.push({
            type: 'unterminated_double_quote',
            line: index + 1,
            content: match
          });
        }
      });
    }

    // 检查模板字符串
    const templateMatches = line.match(/`[^`\\]*(?:\\.[^`\\]*)*`/g);
    if (templateMatches) {
      templateMatches.forEach(match => {
        if (match.endsWith('\\') && !line.trim().endsWith(match + ';') && !line.trim().endsWith(match + ',')) {
          issues.push({
            type: 'unterminated_template',
            line: index + 1,
            content: match
          });
        }
      });
    }
  });

  // 检查中文字符编码
  const chineseChars = content.match(/[\u4e00-\u9fff]/g);
  if (chineseChars && chineseChars.length > 0) {
    // 检查是否有异常的字符编码
    const suspiciousPatterns = [
      /\\u[0-9a-f]{4}/gi, // Unicode转义
      /�/g, // 替换字符
      /\ufffd/gi // 替换字符的Unicode
    ];

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        issues.push({
          type: 'encoding_issue',
          pattern: pattern.toString(),
          content: content.match(pattern)
        });
      }
    });
  }

  return issues;
}

/**
 * 修复编码问题
 */
function fixEncodingIssues(content, issues) {
  let fixedContent = content;

  issues.forEach(issue => {
    switch (issue.type) {
      case 'unterminated_single_quote':
      case 'unterminated_double_quote':
      case 'unterminated_template':
        // 对于未终止的字符串，尝试修复转义
        const quoteChar = issue.content[0];
        if (issue.content.endsWith('\\')) {
          // 移除末尾的反斜杠，因为它可能导致问题
          const fixedString = issue.content.slice(0, -1) + quoteChar;
          fixedContent = fixedContent.replace(issue.content, fixedString);
        }
        break;

      case 'encoding_issue':
        // 对于编码问题，尝试重新编码中文字符
        // 注意：这是一个简单的修复，可能需要手动检查
        console.warn(`发现编码问题在文件，可能需要手动修复: ${issue.pattern}`);
        break;
    }
  });

  return fixedContent;
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  try {
    stats.filesChecked++;

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = checkEncodingIssues(content, filePath);

    if (issues.length > 0) {
      console.log(`发现 ${issues.length} 个编码问题在: ${filePath}`);
      issues.forEach(issue => {
        console.log(`  - ${issue.type}: ${JSON.stringify(issue)}`);
        stats.errorsFound.push({
          file: filePath,
          ...issue
        });
      });

      // 尝试自动修复
      const fixedContent = fixEncodingIssues(content, issues);
      if (fixedContent !== content) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        stats.filesFixed++;
        console.log(`已自动修复: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`处理文件失败 ${filePath}:`, error.message);
  }
}

/**
 * 递归处理目录
 */
function processDirectory(dirPath) {
  return new Promise((resolve, reject) => {
    const pattern = path.join(dirPath, '**', '*.{ts,js,vue}');
    glob(pattern, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/coverage/**']
    }, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      files.forEach(processFile);
      resolve();
    });
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('=== 开始批量修复测试文件编码问题 ===');
  console.log('工作目录:', process.cwd());

  for (const dir of testDirs) {
    const fullPath = path.resolve(dir);
    console.log(`检查目录: ${fullPath} (存在: ${fs.existsSync(fullPath)})`);
    if (fs.existsSync(fullPath)) {
      console.log(`处理目录: ${dir}`);
      await processDirectory(fullPath);
    } else {
      console.warn(`目录不存在: ${fullPath}`);
    }
  }

  // 输出统计信息
  console.log('\n=== 修复统计 ===');
  console.log(`检查的文件数: ${stats.filesChecked}`);
  console.log(`修复的文件数: ${stats.filesFixed}`);
  console.log(`发现的错误数: ${stats.errorsFound.length}`);

  if (stats.errorsFound.length > 0) {
    console.log('\n发现的错误详情:');
    stats.errorsFound.forEach(error => {
      console.log(`- ${error.file}: ${error.type}`);
    });
  }

  if (stats.filesFixed > 0) {
    console.log('\n建议: 请检查自动修复的文件是否正确，然后重新运行测试。');
  }

  console.log('\n编码问题修复完成!');
}

// 直接运行脚本
main().catch(console.error);

export { checkEncodingIssues, fixEncodingIssues };
