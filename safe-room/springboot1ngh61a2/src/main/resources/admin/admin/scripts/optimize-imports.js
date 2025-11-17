#!/usr/bin/env node

/**
 * 导入路径优化脚本
 * 将相对路径导入转换为 @/ alias 导入
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';

// 目标目录
const SRC_DIR = path.join(__dirname, '..', 'src');

// 匹配的文件类型
const FILE_PATTERNS = [
  'src/**/*.ts',
  'src/**/*.vue',
  '!src/**/*.d.ts', // 排除类型定义文件
  '!src/**/*.spec.ts', // 排除测试文件
  '!src/**/*.test.ts'
];

// 相对路径导入的正则表达式
const RELATIVE_IMPORT_REGEX = /(?:import\s+[^'"]*\s+from\s+['"])\.\.\/([^'"]*)(['"]|;)/g;
const RELATIVE_IMPORT_REGEX_DOUBLE = /(?:import\s+[^'"]*\s+from\s+['"])\.\.\/\.\.\/([^'"]*)(['"]|;)/g;

/**
 * 计算相对路径转换为 @/ alias 的路径
 * @param {string} filePath - 当前文件路径
 * @param {string} relativePath - 相对路径
 * @returns {string} 转换后的 @/ 路径
 */
function convertToAliasPath(filePath, relativePath) {
  // 获取文件所在目录相对于 src 的路径
  const relativeToSrc = path.relative(SRC_DIR, path.dirname(filePath));
  const targetPath = path.resolve(path.dirname(filePath), relativePath);

  // 计算目标文件相对于 src 的路径
  let aliasPath = path.relative(SRC_DIR, targetPath);

  // 统一使用正斜杠
  aliasPath = aliasPath.replace(/\\/g, '/');

  return `@/${aliasPath}`;
}

/**
 * 处理单个文件
 * @param {string} filePath - 文件路径
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 处理单层相对路径 ../
    content = content.replace(RELATIVE_IMPORT_REGEX, (match, relativePath, quote) => {
      // 检查是否是第三方库导入
      if (!relativePath.startsWith('.')) {
        const aliasPath = convertToAliasPath(filePath, `../${relativePath}`);
        modified = true;
        return match.replace(`../${relativePath}`, aliasPath);
      }
      return match;
    });

    // 处理双层相对路径 ../../
    content = content.replace(RELATIVE_IMPORT_REGEX_DOUBLE, (match, relativePath, quote) => {
      // 检查是否是第三方库导入
      if (!relativePath.startsWith('.')) {
        const aliasPath = convertToAliasPath(filePath, `../../${relativePath}`);
        modified = true;
        return match.replace(`../../${relativePath}`, aliasPath);
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 优化导入路径: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始优化导入路径...');

  try {
    // 查找所有匹配的文件
    const files = await glob(FILE_PATTERNS, {
      cwd: path.join(__dirname, '..'),
      absolute: true
    });

    console.log(`📁 找到 ${files.length} 个文件需要处理`);

    let processedCount = 0;

    for (const file of files) {
      processFile(file);
      processedCount++;

      if (processedCount % 10 === 0) {
        console.log(`📊 已处理 ${processedCount}/${files.length} 个文件`);
      }
    }

    console.log('✅ 导入路径优化完成！');
    console.log(`📊 共处理 ${files.length} 个文件`);

  } catch (error) {
    console.error('❌ 优化失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { processFile, convertToAliasPath };
