#!/usr/bin/env node

/**
 * API文档同步检查工具
 *
 * 功能：
 * - 检查API文档最后更新时间
 * - 对比Controller代码的最后修改时间
 * - 提醒文档需要更新的情况
 * - 生成同步状态报告
 *
 * 使用方法：
 * node scripts/check-api-docs-sync.js [options]
 *
 * 选项：
 * --docs-path <path>    API文档路径 (默认: docs/technical/api)
 * --code-path <path>    源代码路径 (默认: springboot1ngh61a2/src/main/java/com/controller)
 * --threshold <hours>   时间阈值(小时) (默认: 24)
 * --verbose             详细输出
 * --help                显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const CONFIG = {
  docsPath: 'docs/technical/api',
  codePath: 'springboot1ngh61a2/src/main/java/com/controller',
  thresholdHours: 24,
  verbose: false
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

  console.log('🔍 开始检查API文档同步状态...\n');

  try {
    const result = await checkApiDocsSync(options);

    printReport(result);

    // 根据检查结果设置退出码
    if (result.needsUpdate.length > 0) {
      console.log('\n⚠️  发现文档不同步的情况，请及时更新API文档');
      process.exit(1);
    } else {
      console.log('\n✅ API文档同步状态良好');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message);
    process.exit(1);
  }
}

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const options = { ...CONFIG };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--docs-path':
        options.docsPath = args[++i];
        break;
      case '--code-path':
        options.codePath = args[++i];
        break;
      case '--threshold':
        options.thresholdHours = parseInt(args[++i]);
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
 * 检查API文档同步状态
 */
async function checkApiDocsSync(options) {
  const result = {
    docsLastModified: null,
    codeLastModified: null,
    timeDiff: 0,
    needsUpdate: [],
    summary: {
      totalControllers: 0,
      recentChanges: 0,
      outdatedDocs: false
    }
  };

  // 获取API文档最后修改时间
  const docsFiles = await glob(path.join(options.docsPath, '*.md'));
  if (docsFiles.length > 0) {
    let latestDocTime = 0;
    for (const file of docsFiles) {
      const stat = fs.statSync(file);
      if (stat.mtime.getTime() > latestDocTime) {
        latestDocTime = stat.mtime.getTime();
      }
    }
    result.docsLastModified = new Date(latestDocTime);
  }

  // 获取Controller代码最后修改时间
  const controllerFiles = await glob(path.join(options.codePath, '*.java'));
  result.summary.totalControllers = controllerFiles.length;

  if (controllerFiles.length > 0) {
    let latestCodeTime = 0;
    for (const file of controllerFiles) {
      const stat = fs.statSync(file);
      if (stat.mtime.getTime() > latestCodeTime) {
        latestCodeTime = stat.mtime.getTime();
      }
    }
    result.codeLastModified = new Date(latestCodeTime);
  }

  // 计算时间差（毫秒）
  if (result.docsLastModified && result.codeLastModified) {
    result.timeDiff = result.codeLastModified.getTime() - result.docsLastModified.getTime();
    const hoursDiff = result.timeDiff / (1000 * 60 * 60);

    if (hoursDiff > options.thresholdHours) {
      result.needsUpdate.push({
        type: 'time_threshold',
        message: `代码最后修改时间比文档新${Math.round(hoursDiff)}小时`,
        threshold: options.thresholdHours
      });
      result.summary.outdatedDocs = true;
    }
  }

  // 检查是否有新添加的Controller
  if (result.docsLastModified && result.codeLastModified) {
    const recentlyModifiedControllers = controllerFiles.filter(file => {
      const stat = fs.statSync(file);
      const hoursSinceModified = (Date.now() - stat.mtime.getTime()) / (1000 * 60 * 60);
      return hoursSinceModified <= options.thresholdHours;
    });

    result.summary.recentChanges = recentlyModifiedControllers.length;

    if (recentlyModifiedControllers.length > 0 && result.timeDiff > 0) {
      result.needsUpdate.push({
        type: 'recent_changes',
        message: `发现${recentlyModifiedControllers.length}个Controller在最近${options.thresholdHours}小时内有修改`,
        files: recentlyModifiedControllers.map(f => path.basename(f))
      });
    }
  }

  // 检查文档是否存在
  if (!result.docsLastModified) {
    result.needsUpdate.push({
      type: 'missing_docs',
      message: '未找到API文档文件'
    });
  }

  // 检查代码文件是否存在
  if (!result.codeLastModified) {
    result.needsUpdate.push({
      type: 'missing_code',
      message: '未找到Controller源代码文件'
    });
  }

  return result;
}

/**
 * 打印检查报告
 */
function printReport(result) {
  console.log('📊 API文档同步检查报告\n');

  console.log('📅 时间信息:');
  if (result.docsLastModified) {
    console.log(`  文档最后更新: ${result.docsLastModified.toLocaleString()}`);
  } else {
    console.log('  文档最后更新: 未找到文档文件');
  }

  if (result.codeLastModified) {
    console.log(`  代码最后修改: ${result.codeLastModified.toLocaleString()}`);
  } else {
    console.log('  代码最后修改: 未找到代码文件');
  }

  console.log('\n📈 统计信息:');
  console.log(`  Controller总数: ${result.summary.totalControllers}`);
  console.log(`  近期修改数量: ${result.summary.recentChanges}`);

  if (result.timeDiff !== 0) {
    const hoursDiff = Math.abs(result.timeDiff) / (1000 * 60 * 60);
    const direction = result.timeDiff > 0 ? '代码比文档新' : '文档比代码新';
    console.log(`  时间差异: ${direction}${Math.round(hoursDiff)}小时`);
  }

  if (result.needsUpdate.length > 0) {
    console.log('\n⚠️  需要更新:');
    result.needsUpdate.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.message}`);
      if (item.files && item.files.length > 0) {
        console.log(`     涉及文件: ${item.files.join(', ')}`);
      }
    });
  } else {
    console.log('\n✅ 无需更新');
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
API文档同步检查工具

检查API文档与Controller代码的同步状态，当代码有更新而文档未及时更新时会发出警告。

使用方法:
  node scripts/check-api-docs-sync.js [options]

选项:
  --docs-path <path>    API文档路径 (默认: docs/technical/api)
  --code-path <path>    源代码路径 (默认: springboot1ngh61a2/src/main/java/com/controller)
  --threshold <hours>   时间阈值(小时) (默认: 24)
  --verbose             详细输出
  --help                显示帮助信息

示例:
  # 检查默认路径
  node scripts/check-api-docs-sync.js

  # 指定自定义路径和阈值
  node scripts/check-api-docs-sync.js --docs-path docs/api --code-path src/main/java --threshold 48

  # 详细输出模式
  node scripts/check-api-docs-sync.js --verbose

退出码:
  0 - 文档同步良好
  1 - 发现文档不同步情况
`);
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  checkApiDocsSync,
  parseArgs
};
