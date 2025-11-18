const fs = require('fs');
const path = require('path');

const testDir = 'springboot1ngh61a2/src/main/resources/front/front/tests/e2e';

// 修复映射
const fixes = [
  { from: /API请求拦截和验\?/g, to: 'API请求拦截和验证' },
  { from: /账号或密码错\?/g, to: '账号或密码错误' },
  { from: /开始课程预约完整流程测\?/g, to: '开始课程预约完整流程测试' },
  { from: /应正确显示聊天界\?/g, to: '应正确显示聊天界面' },
  { from: /设置完整的业务流程测试环\?/g, to: '设置完整的业务流程测试环境' },
  { from: /课程讨论\?/g, to: '课程讨论' },
  { from: /应正确显示课程列\?/g, to: '应正确显示课程列表' },
  { from: /应正确显示器材列\?/g, to: '应正确显示器材列表' },
  { from: /应正确显示新闻列\?/g, to: '应正确显示新闻列表' },
  { from: /应正确显示支付页\?/g, to: '应正确显示支付页面' },
  { from: /应正确显示用户中心页\?/g, to: '应正确显示用户中心页面' },
  { from: /应优雅处理网络连接失\?/g, to: '应优雅处理网络连接失败' },
  { from: /网络失败时显示错误提\?/g, to: '网络失败时显示错误提示' },
  { from: /智能重试和错误分类演\?/g, to: '智能重试和错误分类演示' },
  { from: /开始测试监\?/g, to: '开始测试监控' },
  { from: /燃脂私教\?/g, to: '燃脂私教' },
  { from: /已确\?/g, to: '已确认' },
  { from: /续费倒计\?/g, to: '续费倒计时' },
  { from: /收藏夹管理模块测\?/g, to: '收藏夹管理模块测试' },
  { from: /错误处理和边界情况测\?/g, to: '错误处理和边界情况测试' },
  { from: /Front 用户注册到登录完整流\?/g, to: 'Front 用户注册到登录完整流程' },
  { from: /搜索发现和收藏用户旅\?/g, to: '搜索发现和收藏用户旅程' },
  { from: /shared-helpers''/g, to: "shared-helpers'" }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const fix of fixes) {
      if (fix.from.test(content)) {
        content = content.replace(fix.from, fix.to);
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

