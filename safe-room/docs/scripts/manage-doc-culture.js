#!/usr/bin/env node

/**
 * 文档文化建设管理工具
 *
 * 功能：
 * - 管理培训活动和报名
 * - 组织分享会和活动
 * - 跟踪激励积分和荣誉
 * - 生成文化建设报告
 *
 * 使用方法：
 * node docs/scripts/manage-doc-culture.js [command] [options]
 *
 * 命令：
 * training     管理培训活动
 * sharing      管理分享活动
 * incentives   管理激励积分
 * report       生成文化建设报告
 *
 * 选项：
 * --action <action>    具体操作: list|create|register|award 等
 * --user <username>    指定用户
 * --event <event>      指定活动
 * --points <points>    积分数量
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

  // 数据文件路径
  dataDir: 'data/culture',
  trainingFile: 'data/culture/training.json',
  sharingFile: 'data/culture/sharing.json',
  incentivesFile: 'data/culture/incentives.json',

  // 默认积分规则
  pointsRules: {
    training_completion: 50,    // 完成培训
    sharing_participation: 30,  // 参与分享
    sharing_host: 100,          // 主持分享
    doc_creation: 20,           // 创建文档
    doc_review: 15,             // 审查文档
    doc_update: 10,             // 更新文档
    quality_improvement: 25,    // 质量改进
    bug_report: 5,              // 报告问题
    feedback_provided: 5        // 提供反馈
  }
};

// 确保数据目录存在
function ensureDataDir() {
  const dataDir = CONFIG.dataDir;
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// 读取数据文件
function readDataFile(filePath, defaultData = {}) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn(`⚠️ 读取数据文件失败 ${filePath}: ${error.message}`);
  }
  return defaultData;
}

// 保存数据文件
function saveDataFile(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`❌ 保存数据文件失败 ${filePath}: ${error.message}`);
  }
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    command: 'report',
    action: 'list',
    user: null,
    event: null,
    points: 0,
    title: '',
    description: '',
    date: '',
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case 'training':
      case 'sharing':
      case 'incentives':
      case 'report':
        options.command = arg;
        break;
      case '--action':
        options.action = args[++i];
        break;
      case '--user':
        options.user = args[++i];
        break;
      case '--event':
        options.event = args[++i];
        break;
      case '--points':
        options.points = parseInt(args[++i]);
        break;
      case '--title':
        options.title = args[++i];
        break;
      case '--description':
        options.description = args[++i];
        break;
      case '--date':
        options.date = args[++i];
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
文档文化建设管理工具

使用方法:
  node docs/scripts/manage-doc-culture.js [command] [options]

命令:
  training     管理培训活动
  sharing      管理分享活动
  incentives   管理激励积分
  report       生成文化建设报告 (默认)

培训管理:
  # 列出所有培训活动
  node docs/scripts/manage-doc-culture.js training --action list

  # 创建培训活动
  node docs/scripts/manage-doc-culture.js training --action create --title "文档基础培训" --description "Markdown和工具使用" --date "2025-12-01"

  # 报名培训活动
  node docs/scripts/manage-doc-culture.js training --action register --event training-001 --user john.doe

分享管理:
  # 列出分享活动
  node docs/scripts/manage-doc-culture.js sharing --action list

  # 创建分享活动
  node docs/scripts/manage-doc-culture.js sharing --action create --title "API文档最佳实践" --description "分享API文档编写经验" --date "2025-11-20"

  # 记录分享参与
  node docs/scripts/manage-doc-culture.js sharing --action participate --event sharing-001 --user john.doe

积分管理:
  # 查看用户积分
  node docs/scripts/manage-doc-culture.js incentives --action check --user john.doe

  # 奖励积分
  node docs/scripts/manage-doc-culture.js incentives --action award --user john.doe --points 50

报告生成:
  # 生成文化建设报告
  node docs/scripts/manage-doc-culture.js report
`);
}

// 培训管理功能
function manageTraining(options) {
  ensureDataDir();
  const data = readDataFile(CONFIG.trainingFile, { events: [], registrations: [] });

  switch (options.action) {
    case 'list':
      console.log('📚 培训活动列表:');
      data.events.forEach(event => {
        const registrations = data.registrations.filter(r => r.eventId === event.id).length;
        console.log(`  ${event.id}: ${event.title} (${event.date}) - ${registrations}人报名`);
        console.log(`    ${event.description}`);
      });
      if (data.events.length === 0) {
        console.log('  暂无培训活动');
      }
      break;

    case 'create':
      if (!options.title || !options.date) {
        console.error('❌ 请提供培训标题和日期');
        return;
      }

      const event = {
        id: `training-${Date.now()}`,
        title: options.title,
        description: options.description || '',
        date: options.date,
        status: 'active',
        created: new Date().toISOString()
      };

      data.events.push(event);
      saveDataFile(CONFIG.trainingFile, data);

      console.log(`✅ 培训活动已创建: ${event.title}`);
      console.log(`   ID: ${event.id}`);
      console.log(`   日期: ${event.date}`);
      break;

    case 'register':
      if (!options.event || !options.user) {
        console.error('❌ 请提供活动ID和用户名');
        return;
      }

      const eventExists = data.events.find(e => e.id === options.event);
      if (!eventExists) {
        console.error(`❌ 活动不存在: ${options.event}`);
        return;
      }

      const existingReg = data.registrations.find(r => r.eventId === options.event && r.user === options.user);
      if (existingReg) {
        console.log(`ℹ️ 用户已报名: ${options.user}`);
        return;
      }

      data.registrations.push({
        eventId: options.event,
        user: options.user,
        registeredAt: new Date().toISOString()
      });

      saveDataFile(CONFIG.trainingFile, data);
      console.log(`✅ 报名成功: ${options.user} -> ${eventExists.title}`);
      break;

    default:
      console.error(`❌ 未知操作: ${options.action}`);
  }
}

// 分享管理功能
function manageSharing(options) {
  ensureDataDir();
  const data = readDataFile(CONFIG.sharingFile, { events: [], participations: [] });

  switch (options.action) {
    case 'list':
      console.log('🎤 分享活动列表:');
      data.events.forEach(event => {
        const participations = data.participations.filter(p => p.eventId === event.id).length;
        console.log(`  ${event.id}: ${event.title} (${event.date}) - ${participations}人参与`);
        console.log(`    ${event.description}`);
      });
      if (data.events.length === 0) {
        console.log('  暂无分享活动');
      }
      break;

    case 'create':
      if (!options.title || !options.date) {
        console.error('❌ 请提供分享标题和日期');
        return;
      }

      const event = {
        id: `sharing-${Date.now()}`,
        title: options.title,
        description: options.description || '',
        date: options.date,
        status: 'active',
        created: new Date().toISOString()
      };

      data.events.push(event);
      saveDataFile(CONFIG.sharingFile, data);

      console.log(`✅ 分享活动已创建: ${event.title}`);
      console.log(`   ID: ${event.id}`);
      console.log(`   日期: ${event.date}`);
      break;

    case 'participate':
      if (!options.event || !options.user) {
        console.error('❌ 请提供活动ID和用户名');
        return;
      }

      const eventExists = data.events.find(e => e.id === options.event);
      if (!eventExists) {
        console.error(`❌ 活动不存在: ${options.event}`);
        return;
      }

      const existingPart = data.participations.find(p => p.eventId === options.event && p.user === options.user);
      if (existingPart) {
        console.log(`ℹ️ 用户已参与: ${options.user}`);
        return;
      }

      data.participations.push({
        eventId: options.event,
        user: options.user,
        participatedAt: new Date().toISOString()
      });

      saveDataFile(CONFIG.sharingFile, data);
      console.log(`✅ 参与记录成功: ${options.user} -> ${eventExists.title}`);
      break;

    default:
      console.error(`❌ 未知操作: ${options.action}`);
  }
}

// 激励管理功能
function manageIncentives(options) {
  ensureDataDir();
  const data = readDataFile(CONFIG.incentivesFile, { users: {} });

  switch (options.action) {
    case 'check':
      if (!options.user) {
        console.error('❌ 请指定用户');
        return;
      }

      const userData = data.users[options.user] || { points: 0, history: [] };
      console.log(`👤 用户: ${options.user}`);
      console.log(`💎 总积分: ${userData.points}`);
      console.log(`📊 获得记录: ${userData.history.length} 次`);

      if (userData.history.length > 0) {
        console.log('\n最近记录:');
        userData.history.slice(-5).forEach(record => {
          console.log(`  ${record.date}: ${record.reason} (+${record.points})`);
        });
      }
      break;

    case 'award':
      if (!options.user || !options.points) {
        console.error('❌ 请指定用户和积分数量');
        return;
      }

      if (!data.users[options.user]) {
        data.users[options.user] = { points: 0, history: [] };
      }

      const user = data.users[options.user];
      user.points += options.points;
      user.history.push({
        date: new Date().toISOString().split('T')[0],
        reason: options.title || '管理员奖励',
        points: options.points
      });

      saveDataFile(CONFIG.incentivesFile, data);
      console.log(`✅ 积分奖励成功: ${options.user} +${options.points} 积分`);
      console.log(`   总积分: ${user.points}`);
      break;

    case 'leaderboard':
      const users = Object.entries(data.users)
        .map(([username, userData]) => ({ username, ...userData }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 10);

      console.log('🏆 积分排行榜:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.username}: ${user.points} 积分`);
      });
      break;

    default:
      console.error(`❌ 未知操作: ${options.action}`);
  }
}

// 生成文化建设报告
function generateCultureReport(options) {
  ensureDataDir();

  // 收集各种数据
  const trainingData = readDataFile(CONFIG.trainingFile, { events: [], registrations: [] });
  const sharingData = readDataFile(CONFIG.sharingFile, { events: [], participations: [] });
  const incentivesData = readDataFile(CONFIG.incentivesFile, { users: {} });

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      trainingEvents: trainingData.events.length,
      trainingRegistrations: trainingData.registrations.length,
      sharingEvents: sharingData.events.length,
      sharingParticipations: sharingData.participations.length,
      activeUsers: Object.keys(incentivesData.users).length,
      totalPoints: Object.values(incentivesData.users).reduce((sum, user) => sum + user.points, 0)
    },
    details: {
      training: trainingData,
      sharing: sharingData,
      incentives: incentivesData
    }
  };

  // 生成报告内容
  let content = `# 🌟 文档文化建设报告

> **生成时间**: ${new Date().toISOString()}
> **报告周期**: 最近30天

---

## 📊 总体概况

| 指标 | 数量 |
|------|------|
| 培训活动 | ${report.summary.trainingEvents} 个 |
| 培训报名 | ${report.summary.trainingRegistrations} 人次 |
| 分享活动 | ${report.summary.sharingEvents} 个 |
| 分享参与 | ${report.summary.sharingParticipations} 人次 |
| 活跃用户 | ${report.summary.activeUsers} 人 |
| 总积分 | ${report.summary.totalPoints} 分 |

---

## 🎓 培训活动统计

### 活动列表
`;

  trainingData.events.forEach(event => {
    const registrations = trainingData.registrations.filter(r => r.eventId === event.id).length;
    content += `- **${event.title}** (${event.date})\n`;
    content += `  - 报名人数: ${registrations}\n`;
    content += `  - 状态: ${event.status}\n`;
  });

  if (trainingData.events.length === 0) {
    content += '- 暂无培训活动\n';
  }

  content += `
### 报名统计
- 总报名人次: ${report.summary.trainingRegistrations}
- 平均报名率: ${report.summary.trainingEvents > 0 ? (report.summary.trainingRegistrations / report.summary.trainingEvents).toFixed(1) : 0} 人/活动

---

## 🎤 分享活动统计

### 活动列表
`;

  sharingData.events.forEach(event => {
    const participations = sharingData.participations.filter(p => p.eventId === event.id).length;
    content += `- **${event.title}** (${event.date})\n`;
    content += `  - 参与人数: ${participations}\n`;
    content += `  - 状态: ${event.status}\n`;
  });

  if (sharingData.events.length === 0) {
    content += '- 暂无分享活动\n';
  }

  content += `
### 参与统计
- 总参与人次: ${report.summary.sharingParticipations}
- 平均参与率: ${report.summary.sharingEvents > 0 ? (report.summary.sharingParticipations / report.summary.sharingEvents).toFixed(1) : 0} 人/活动

---

## 💎 激励积分统计

### 积分排行榜
`;

  const topUsers = Object.entries(incentivesData.users)
    .map(([username, userData]) => ({ username, ...userData }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  topUsers.forEach((user, index) => {
    content += `${index + 1}. **${user.username}**: ${user.points} 积分\n`;
  });

  if (topUsers.length === 0) {
    content += '- 暂无积分记录\n';
  }

  content += `
### 积分分布
- 总积分: ${report.summary.totalPoints}
- 平均积分: ${report.summary.activeUsers > 0 ? (report.summary.totalPoints / report.summary.activeUsers).toFixed(1) : 0} 分/人

---

## 📈 趋势分析

### 活跃度趋势
- 培训活动活跃度: ${getActivityLevel(report.summary.trainingEvents)}
- 分享活动活跃度: ${getActivityLevel(report.summary.sharingEvents)}
- 用户参与活跃度: ${getActivityLevel(report.summary.activeUsers)}

### 改进建议
`;

  // 生成改进建议
  const suggestions = generateSuggestions(report);
  suggestions.forEach(suggestion => {
    content += `- ${suggestion}\n`;
  });

  content += `
---

## 📋 近期活动预告

### 计划中的培训活动
- 文档高级写作技巧培训 (12月)
- 文档工具进阶使用培训 (1月)

### 计划中的分享活动
- 文档质量提升经验分享 (12月)
- 文档文化建设案例分享 (1月)

---

*本文档由文档文化建设管理系统自动生成。*
`;

  // 保存报告
  const reportPath = `${CONFIG.docsRoot}/reports/DOC_CULTURE_BUILDING_REPORT.md`;
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, content, 'utf-8');
  console.log(`✅ 文化建设报告已生成: ${reportPath}`);

  // 显示关键指标
  console.log(`📊 报告摘要:`);
  console.log(`   培训活动: ${report.summary.trainingEvents} 个`);
  console.log(`   分享活动: ${report.summary.sharingEvents} 个`);
  console.log(`   活跃用户: ${report.summary.activeUsers} 人`);
  console.log(`   总积分: ${report.summary.totalPoints} 分`);
}

// 获取活跃度等级
function getActivityLevel(count) {
  if (count >= 10) return '很高';
  if (count >= 5) return '较高';
  if (count >= 2) return '一般';
  if (count >= 1) return '较低';
  return '很低';
}

// 生成改进建议
function generateSuggestions(report) {
  const suggestions = [];

  if (report.summary.trainingEvents < 2) {
    suggestions.push('建议增加培训活动频率，至少每月组织1-2次培训');
  }

  if (report.summary.sharingEvents < 1) {
    suggestions.push('建议每月组织至少1次分享活动，促进知识交流');
  }

  if (report.summary.activeUsers < 5) {
    suggestions.push('建议扩大参与范围，吸引更多成员加入文化建设活动');
  }

  if (report.summary.totalPoints < 100) {
    suggestions.push('建议加强激励机制，增加积分奖励机会');
  }

  if (suggestions.length === 0) {
    suggestions.push('整体表现良好，建议继续保持并寻求进一步提升');
  }

  return suggestions;
}

// 主函数
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  try {
    switch (options.command) {
      case 'training':
        manageTraining(options);
        break;
      case 'sharing':
        manageSharing(options);
        break;
      case 'incentives':
        manageIncentives(options);
        break;
      case 'report':
        generateCultureReport(options);
        break;
      default:
        console.error(`❌ 未知命令: ${options.command}`);
        showHelp();
        process.exit(1);
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
  ensureDataDir,
  readDataFile,
  saveDataFile,
  CONFIG
};
