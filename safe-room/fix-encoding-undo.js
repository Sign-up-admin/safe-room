const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function restoreFile(filePath) {
  try {
    // 使用 git checkout 来恢复文件到最后一次提交的状态
    execSync(`git checkout HEAD -- "${filePath}"`, { cwd: process.cwd() });
    console.log(`Restored: ${filePath}`);
  } catch (error) {
    console.error(`Error restoring ${filePath}:`, error.message);
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
      restoreFile(filePath);
    }
  }
}

// 恢复前端测试文件
const testDir = 'springboot1ngh61a2/src/main/resources/front/front/tests';
if (fs.existsSync(testDir)) {
  walkDirectory(testDir);
  console.log('File restoration completed!');
} else {
  console.log('Test directory not found');
}
