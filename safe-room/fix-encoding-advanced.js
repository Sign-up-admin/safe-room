const fs = require('fs');
const path = require('path');

const testDir = 'springboot1ngh61a2/src/main/resources/front/front/tests/e2e';

// 修复映射 - 使用更宽泛的匹配
const fixes = [
  // 修复describe中的问题
  { pattern: /test\.describe\('API请求拦截和验[^\']*'/, replace: "test.describe('API请求拦截和验证'"},
  { pattern: /test\.describe\('错误处理和边界情况测[^\']*'/, replace: "test.describe('错误处理和边界情况测试'"},
  { pattern: /test\.describe\('收藏夹管理模块测[^\']*'/, replace: "test.describe('收藏夹管理模块测试'"},
  { pattern: /test\.describe\('Front 用户注册到登录完整流[^\']*'/, replace: "test.describe('Front 用户注册到登录完整流程'"},
  { pattern: /test\.describe\('搜索发现和收藏用户旅[^\']*'/, replace: "test.describe('搜索发现和收藏用户旅程'"},
  
  // 修复test中的问题
  { pattern: /test\('应正确显示聊天界[^\']*'/, replace: "test('应正确显示聊天界面'"},
  { pattern: /test\('应正确显示课程列[^\']*'/, replace: "test('应正确显示课程列表'"},
  { pattern: /test\('应正确显示器材列[^\']*'/, replace: "test('应正确显示器材列表'"},
  { pattern: /test\('应正确显示新闻列[^\']*'/, replace: "test('应正确显示新闻列表'"},
  { pattern: /test\('应正确显示支付页[^\']*'/, replace: "test('应正确显示支付页面'"},
  { pattern: /test\('应正确显示用户中心页[^\']*'/, replace: "test('应正确显示用户中心页面'"},
  { pattern: /test\('应优雅处理网络连接失[^\']*'/, replace: "test('应优雅处理网络连接失败'"},
  { pattern: /test\('网络失败时显示错误提[^\']*'/, replace: "test('网络失败时显示错误提示'"},
  { pattern: /test\('智能重试和错误分类演[^\']*'/, replace: "test('智能重试和错误分类演示'"},
  
  // 修复字符串中的问题
  { pattern: /'账号或密码错[^\']*'/, replace: "'账号或密码错误'"},
  { pattern: /'开始课程预约完整流程测[^\']*'/, replace: "'开始课程预约完整流程测试'"},
  { pattern: /'设置完整的业务流程测试环[^\']*'/, replace: "'设置完整的业务流程测试环境'"},
  { pattern: /'课程讨论[^\']*'/, replace: "'课程讨论'"},
  { pattern: /'已确[^\']*'/, replace: "'已确认'"},
  { pattern: /'续费倒计[^\']*'/, replace: "'续费倒计时'"},
  { pattern: /'燃脂私教[^\']*'/, replace: "'燃脂私教'"},
  { pattern: /'开始测试监[^\']*'/, replace: "'开始测试监控'"},
  
  // 修复import
  { pattern: /from '\.\.\/utils\/shared-helpers''/g, replace: "from '../utils/shared-helpers'"},
  { pattern: /} from '\.\.\/utils\/shared-helpers''/g, replace: "} from '../utils/shared-helpers'"},
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const fix of fixes) {
      if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replace);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixedCount += walkDir(filePath);
    } else if (file.endsWith('.spec.ts')) {
      if (fixFile(filePath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

console.log('开始修复编码问题...');
const count = walkDir(testDir);
console.log(`修复完成！共修复 ${count} 个文件。`);

