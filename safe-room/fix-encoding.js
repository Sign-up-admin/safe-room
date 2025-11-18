const fs = require('fs');
const path = require('path');

function fixEncodingInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // 修复常见的编码问题
    content = content.replace(/超�?/g, '超时');
    content = content.replace(/长�?/g, '长度');
    content = content.replace(/过�?/g, '过长');
    content = content.replace(/提�?/g, '提示');
    content = content.replace(/阈�?/g, '阈值');
    content = content.replace(/�?/g, '秒');
    content = content.replace(/页�?/g, '页面');
    content = content.replace(/面�?/g, '面时');
    content = content.replace(/间�?/g, '间:');
    content = content.replace(/时�?/g, '时长');
    content = content.replace(/长�?/g, '长:');
    content = content.replace(/�?/g, '间');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed encoding in: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.spec.ts')) {
      fixEncodingInFile(filePath);
    }
  }
}

// 修复前端测试文件
const testDir = 'springboot1ngh61a2/src/main/resources/front/front/tests';
if (fs.existsSync(testDir)) {
  walkDirectory(testDir);
  console.log('Encoding fixes completed!');
} else {
  console.log('Test directory not found');
}