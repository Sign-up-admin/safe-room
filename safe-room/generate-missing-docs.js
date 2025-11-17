#!/usr/bin/env node

/**
 * 生成缺失组件文档清单脚本
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// 获取所有Vue组件文件
async function getVueComponents() {
  const pattern = 'springboot1ngh61a2/src/main/resources/front/front/src/**/*.vue';
  const files = await glob(pattern);

  const components = [];
  const seen = new Set();

  files.forEach(file => {
    const relativePath = path.relative('springboot1ngh61a2/src/main/resources/front/front/src', file);
    const dir = path.dirname(relativePath);
    const baseName = path.basename(file, '.vue');

    let componentName = '';

    // 页面组件命名规则：模块名 + 操作名
    if (dir.startsWith('pages/')) {
      const modulePath = dir.replace('pages/', '');
      if (modulePath.includes('/')) {
        const parts = modulePath.split('/');
        if (parts.length === 2) {
          const [module, action] = parts;
          componentName = `${module}${action}`.toUpperCase();
        } else {
          componentName = baseName.toUpperCase();
        }
      } else {
        componentName = baseName.toUpperCase();
      }
    }
    // 组件库命名规则：直接使用文件名
    else if (dir.startsWith('components/')) {
      componentName = baseName.toUpperCase();
    }
    // 根组件
    else {
      componentName = baseName.toUpperCase();
    }

    // 确保组件名唯一，如果重复则添加路径信息
    if (seen.has(componentName)) {
      componentName = `${componentName}_${dir.replace(/\//g, '_').toUpperCase()}`;
    }
    seen.add(componentName);

    components.push({
      name: componentName,
      path: relativePath,
      type: dir.startsWith('pages/') ? 'page' : 'component'
    });
  });

  return components;
}

// 获取现有文档文件
async function getExistingDocs() {
  const pattern = 'docs/technical/frontend/components/*.md';
  const files = await glob(pattern);

  return files.map(file => path.basename(file, '.md'));
}

// 主函数
async function main() {
  try {
    console.log('🔍 扫描组件文件...');
    const vueComponents = await getVueComponents();
    console.log(`📊 发现 ${vueComponents.length} 个Vue组件`);

    console.log('📋 扫描现有文档...');
    const existingDocs = await getExistingDocs();
    console.log(`📄 发现 ${existingDocs.length} 个文档文件`);

    // 找出缺失的文档
    const componentNames = vueComponents.map(c => c.name);
    const missingComponents = vueComponents.filter(component => !existingDocs.includes(component.name));
    console.log(`❌ 缺失文档 ${missingComponents.length} 个`);

    // 按优先级分类缺失组件
    const priorityComponents = {
      p0: [], // 核心业务组件 (20个)
      p1: [], // 通用功能组件 (30个)
      p2: [], // 业务页面组件 (44个)
      p3: []  // 辅助功能组件 (22个)
    };

    missingComponents.forEach(component => {
      const name = component.name;
      const path = component.path;

      // P0: 核心业务组件
      if (name === 'APP' ||
          name === 'LOGIN' || name === 'REGISTER' ||
          name === 'HOME' || name === 'INDEX' || name === 'CENTER' ||
          path.includes('pay') ||
          path.includes('jianshenkecheng') || // 健身课程
          path.includes('jianshenjiaolian') || // 健身教练
          path.includes('kechengyuyue') || // 课程预约
          path.includes('sijiaoyuyue') // 私教预约
         ) {
        priorityComponents.p0.push(component);
      }
      // P1: 通用功能组件
      else if (path.includes('shared') ||
               name.includes('FORM') ||
               name.includes('BUTTON') ||
               name.includes('CARD') ||
               name.includes('MODAL') ||
               name.includes('NOTIFICATION') ||
               path.includes('components/common')) {
        priorityComponents.p1.push(component);
      }
      // P2: 业务页面组件 (大部分CRUD页面)
      else if (path.includes('pages/') &&
               (name.includes('LIST') || name.includes('ADD') || name.includes('DETAIL'))) {
        priorityComponents.p2.push(component);
      }
      // P3: 其他组件
      else {
        priorityComponents.p3.push(component);
      }
    });

    // 生成报告
    const report = {
      totalComponents: vueComponents.length,
      totalDocs: existingDocs.length,
      missingDocs: missingComponents.length,
      priorityBreakdown: {
        p0: priorityComponents.p0.length,
        p1: priorityComponents.p1.length,
        p2: priorityComponents.p2.length,
        p3: priorityComponents.p3.length
      },
      missingComponents: {
        p0: priorityComponents.p0,
        p1: priorityComponents.p1,
        p2: priorityComponents.p2,
        p3: priorityComponents.p3
      },
      existingComponents: existingDocs.sort(),
      allComponents: vueComponents
    };

    // 保存报告
    fs.writeFileSync('docs/technical/frontend/COMPONENT_DOC_STATUS.json', JSON.stringify(report, null, 2));
    console.log('✅ 组件文档状态报告已生成: docs/technical/frontend/COMPONENT_DOC_STATUS.json');

    // 打印优先级统计
    console.log('\n📊 缺失文档优先级统计:');
    console.log(`  P0核心组件: ${priorityComponents.p0.length} 个`);
    console.log(`  P1通用组件: ${priorityComponents.p1.length} 个`);
    console.log(`  P2页面组件: ${priorityComponents.p2.length} 个`);
    console.log(`  P3辅助组件: ${priorityComponents.p3.length} 个`);

    // 打印P0组件列表
    console.log('\n🎯 P0核心组件缺失文档:');
    priorityComponents.p0.forEach(component => {
      console.log(`  - ${component.name} (${component.path})`);
    });

  } catch (error) {
    console.error('❌ 生成报告失败:', error);
    process.exit(1);
  }
}

main();
