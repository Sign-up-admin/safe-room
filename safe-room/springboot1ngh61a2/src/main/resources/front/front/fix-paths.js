const fs = require('fs');
const path = require('path');

// 需要修复的文件目录
const dirs = [
  'src/composables',
  'tests/unit/composables',
  'tests/unit/components',
  'tests/unit/pages',
  'tests/unit/services',
  'tests/unit/stores',
  'tests/unit/utils',
  'tests/unit/types'
];

// 路径别名映射
const aliasMap = {
  '@/': '../',
  '~/': '../'
};

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 替换路径别名
    Object.entries(aliasMap).forEach(([alias, replacement]) => {
      const regex = new RegExp(`from ['"]${alias}`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `from '${replacement}`);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      fixFile(filePath);
    }
  });
}

console.log('Starting path alias fix...');

dirs.forEach(dir => {
  processDir(dir);
});

console.log('Path alias fix completed!');
