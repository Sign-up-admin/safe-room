#!/usr/bin/env node

/**
 * Front前端代码需求分析工具
 * 分析Front前端代码对文档的需求
 */

const fs = require('fs');
const path = require('path');

// 配置路径
const FRONT_CODE_PATH = 'springboot1ngh61a2/src/main/resources/front/front/src';

/**
 * 分析Vue组件结构
 */
function analyzeVueComponents() {
  const components = {
    total: 0,
    pages: 0,
    components: 0,
    composables: 0,
    byDirectory: {},
    byType: {}
  };

  try {
    function scanDirectory(dirPath, relativePath = '') {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDirectory(fullPath, path.join(relativePath, item));
        } else if (item.endsWith('.vue')) {
          components.total++;
          const dir = relativePath;

          if (dir.startsWith('pages')) {
            components.pages++;
          } else if (dir.startsWith('components')) {
            components.components++;
          }

          components.byDirectory[dir] = (components.byDirectory[dir] || 0) + 1;

          // 分析组件类型
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('<template>')) {
              components.byType['template'] = (components.byType['template'] || 0) + 1;
            }
            if (content.includes('<script setup') || content.includes('<script>')) {
              components.byType['script'] = (components.byType['script'] || 0) + 1;
            }
            if (content.includes('<style')) {
              components.byType['style'] = (components.byType['style'] || 0) + 1;
            }
          } catch (error) {
            // 忽略读取错误
          }
        }
      }
    }

    scanDirectory(FRONT_CODE_PATH);
  } catch (error) {
    console.error('分析Vue组件失败:', error.message);
  }

  return components;
}

/**
 * 分析组合式函数
 */
function analyzeComposables() {
  const composables = {
    total: 0,
    files: [],
    byCategory: {},
    dependencies: {}
  };

  try {
    const composablesPath = path.join(FRONT_CODE_PATH, 'composables');
    if (fs.existsSync(composablesPath)) {
      const files = fs.readdirSync(composablesPath);

      for (const file of files) {
        if (file.endsWith('.ts')) {
          composables.total++;
          composables.files.push(file);

          const filePath = path.join(composablesPath, file);
          const content = fs.readFileSync(filePath, 'utf8');

          // 分析依赖关系
          const imports = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
          composables.dependencies[file] = imports.map(imp => {
            const match = imp.match(/from\s+['"]([^'"]+)['"]/);
            return match ? match[1] : '';
          }).filter(dep => dep);

          // 分类组合式函数
          if (file.includes('useBooking') || file.includes('useCoach') || file.includes('useCourse')) {
            composables.byCategory['business'] = (composables.byCategory['business'] || 0) + 1;
          } else if (file.includes('useAnimation') || file.includes('useMotion') || file.includes('useParticle')) {
            composables.byCategory['animation'] = (composables.byCategory['animation'] || 0) + 1;
          } else if (file.includes('useNotification') || file.includes('useMessage')) {
            composables.byCategory['communication'] = (composables.byCategory['communication'] || 0) + 1;
          } else {
            composables.byCategory['utility'] = (composables.byCategory['utility'] || 0) + 1;
          }
        }
      }
    }
  } catch (error) {
    console.error('分析组合式函数失败:', error.message);
  }

  return composables;
}

/**
 * 分析工具函数
 */
function analyzeUtils() {
  const utils = {
    total: 0,
    files: [],
    byCategory: {},
    functions: {}
  };

  try {
    const utilsPath = path.join(FRONT_CODE_PATH, 'utils');
    if (fs.existsSync(utilsPath)) {
      const files = fs.readdirSync(utilsPath);

      for (const file of files) {
        if (file.endsWith('.ts')) {
          utils.total++;
          utils.files.push(file);

          const filePath = path.join(utilsPath, file);
          const content = fs.readFileSync(filePath, 'utf8');

          // 提取导出的函数
          const exports = content.match(/export\s+(?:const|function)\s+(\w+)/g) || [];
          utils.functions[file] = exports.map(exp => {
            const match = exp.match(/export\s+(?:const|function)\s+(\w+)/);
            return match ? match[1] : '';
          }).filter(fn => fn);

          // 分类工具函数
          if (file.includes('http') || file.includes('api')) {
            utils.byCategory['network'] = (utils.byCategory['network'] || 0) + 1;
          } else if (file.includes('validate')) {
            utils.byCategory['validation'] = (utils.byCategory['validation'] || 0) + 1;
          } else if (file.includes('storage')) {
            utils.byCategory['storage'] = (utils.byCategory['storage'] || 0) + 1;
          } else {
            utils.byCategory['utility'] = (utils.byCategory['utility'] || 0) + 1;
          }
        }
      }
    }
  } catch (error) {
    console.error('分析工具函数失败:', error.message);
  }

  return utils;
}

/**
 * 分析类型定义
 */
function analyzeTypes() {
  const types = {
    total: 0,
    files: [],
    interfaces: {},
    types: {},
    enums: {}
  };

  try {
    const typesPath = path.join(FRONT_CODE_PATH, 'types');
    if (fs.existsSync(typesPath)) {
      const files = fs.readdirSync(typesPath);

      for (const file of files) {
        if (file.endsWith('.ts')) {
          types.total++;
          types.files.push(file);

          const filePath = path.join(typesPath, file);
          const content = fs.readFileSync(filePath, 'utf8');

          // 提取类型定义
          const interfaces = content.match(/export\s+interface\s+(\w+)/g) || [];
          const typeAliases = content.match(/export\s+type\s+(\w+)/g) || [];
          const enums = content.match(/export\s+enum\s+(\w+)/g) || [];

          types.interfaces[file] = interfaces.map(int => {
            const match = int.match(/export\s+interface\s+(\w+)/);
            return match ? match[1] : '';
          }).filter(name => name);

          types.types[file] = typeAliases.map(type => {
            const match = type.match(/export\s+type\s+(\w+)/);
            return match ? match[1] : '';
          }).filter(name => name);

          types.enums[file] = enums.map(enum_ => {
            const match = enum_.match(/export\s+enum\s+(\w+)/);
            return match ? match[1] : '';
          }).filter(name => name);
        }
      }
    }
  } catch (error) {
    console.error('分析类型定义失败:', error.message);
  }

  return types;
}

/**
 * 分析样式文件
 */
function analyzeStyles() {
  const styles = {
    total: 0,
    files: [],
    byType: {},
    customProperties: {}
  };

  try {
    const stylesPath = path.join(FRONT_CODE_PATH, 'styles');
    if (fs.existsSync(stylesPath)) {
      const files = fs.readdirSync(stylesPath);

      for (const file of files) {
        if (file.endsWith('.scss') || file.endsWith('.css')) {
          styles.total++;
          styles.files.push(file);

          const filePath = path.join(stylesPath, file);
          const content = fs.readFileSync(filePath, 'utf8');

          // 分类样式文件
          if (file.includes('responsive')) {
            styles.byType['responsive'] = (styles.byType['responsive'] || 0) + 1;
          } else if (file.includes('theme')) {
            styles.byType['theme'] = (styles.byType['theme'] || 0) + 1;
          } else if (file.includes('token')) {
            styles.byType['design-tokens'] = (styles.byType['design-tokens'] || 0) + 1;
          } else {
            styles.byType['utility'] = (styles.byType['utility'] || 0) + 1;
          }

          // 提取CSS自定义属性
          const customProps = content.match(/--[\w-]+:\s*[^;]+;/g) || [];
          styles.customProperties[file] = customProps;
        }
      }
    }
  } catch (error) {
    console.error('分析样式文件失败:', error.message);
  }

  return styles;
}

/**
 * 生成代码需求分析报告
 */
function generateRequirementsReport() {
  console.log('🔍 开始Front前端代码需求分析...\n');

  const analysis = {
    timestamp: new Date().toISOString(),
    components: analyzeVueComponents(),
    composables: analyzeComposables(),
    utils: analyzeUtils(),
    types: analyzeTypes(),
    styles: analyzeStyles()
  };

  // 输出分析结果
  console.log('📊 代码结构分析:');
  console.log(`   Vue组件总数: ${analysis.components.total}`);
  console.log(`   页面组件: ${analysis.components.pages}`);
  console.log(`   通用组件: ${analysis.components.components}`);
  console.log(`   组合式函数: ${analysis.composables.total}`);
  console.log(`   工具函数: ${analysis.utils.total}`);
  console.log(`   类型定义文件: ${analysis.types.total}`);
  console.log(`   样式文件: ${analysis.styles.total}\n`);

  // 分析文档需求
  const docRequirements = analyzeDocumentationRequirements(analysis);

  console.log('📋 文档需求分析:');
  console.log(`   需组件文档: ${docRequirements.componentDocs} 个`);
  console.log(`   需组合式函数文档: ${docRequirements.composableDocs} 个`);
  console.log(`   需工具函数文档: ${docRequirements.utilDocs} 个`);
  console.log(`   需类型定义文档: ${docRequirements.typeDocs} 个`);
  console.log(`   需样式文档: ${docRequirements.styleDocs} 个\n`);

  // 生成报告
  const report = {
    ...analysis,
    docRequirements,
    summary: {
      totalFiles: analysis.components.total + analysis.composables.total +
                  analysis.utils.total + analysis.types.total + analysis.styles.total,
      docGap: docRequirements.total - 30, // 现有30个需求文档
      docCoverage: ((30 / docRequirements.total) * 100).toFixed(1) + '%'
    }
  };

  // 保存JSON报告
  const jsonPath = 'docs/reports/code-requirements-analysis.json';
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`📄 JSON报告已保存到: ${jsonPath}`);

  // 生成Markdown报告
  const markdownReport = generateMarkdownRequirementsReport(report);
  const markdownPath = 'docs/reports/FRONT_CODE_REQUIREMENTS_ANALYSIS.md';
  fs.writeFileSync(markdownPath, markdownReport);
  console.log(`📄 Markdown报告已保存到: ${markdownPath}`);

  console.log('\n✅ Front前端代码需求分析完成!');
}

/**
 * 分析文档需求
 */
function analyzeDocumentationRequirements(analysis) {
  const requirements = {
    componentDocs: analysis.components.total,
    composableDocs: analysis.composables.total,
    utilDocs: analysis.utils.total,
    typeDocs: analysis.types.total,
    styleDocs: analysis.styles.total,
    total: 0,
    byCategory: {
      pages: analysis.components.pages,
      components: analysis.components.components,
      businessLogic: analysis.composables.byCategory.business || 0,
      animations: analysis.composables.byCategory.animation || 0,
      communication: analysis.composables.byCategory.communication || 0,
      utilities: (analysis.composables.byCategory.utility || 0) + analysis.utils.total,
      types: analysis.types.total,
      styles: analysis.styles.total
    }
  };

  requirements.total = requirements.componentDocs + requirements.composableDocs +
                      requirements.utilDocs + requirements.typeDocs + requirements.styleDocs;

  return requirements;
}

/**
 * 生成Markdown需求分析报告
 */
function generateMarkdownRequirementsReport(report) {
  return `# Front前端代码需求分析报告

> **生成时间**：${new Date().toLocaleString()}
> **分析工具**：code-requirements-analysis.js

---

## 📊 代码结构统计

| 类别 | 数量 | 说明 |
|------|------|------|
| Vue组件 | ${report.components.total} | 页面组件${report.components.pages}个，通用组件${report.components.components}个 |
| 组合式函数 | ${report.composables.total} | ${Object.entries(report.composables.byCategory).map(([cat, count]) => `${cat}:${count}`).join(', ')} |
| 工具函数 | ${report.utils.total} | ${Object.entries(report.utils.byCategory).map(([cat, count]) => `${cat}:${count}`).join(', ')} |
| 类型定义 | ${report.types.total} | ${report.types.files.length}个类型文件 |
| 样式文件 | ${report.styles.total} | ${Object.entries(report.styles.byType).map(([type, count]) => `${type}:${count}`).join(', ')} |
| **总计** | **${report.summary.totalFiles}** | **完整的代码资产统计** |

---

## 📋 文档需求分析

### 总体需求

- **现有需求文档**：30个
- **代码文件总数**：${report.summary.totalFiles}个
- **文档覆盖率**：${report.summary.docCoverage}
- **文档缺口**：${report.summary.docGap}个

### 分类需求

| 文档类型 | 需求数量 | 现有数量 | 缺口 | 优先级 |
|----------|----------|----------|------|--------|
| 组件文档 | ${report.docRequirements.componentDocs} | 0 | ${report.docRequirements.componentDocs} | 高 |
| 组合式函数文档 | ${report.docRequirements.composableDocs} | 0 | ${report.docRequirements.composableDocs} | 高 |
| 工具函数文档 | ${report.docRequirements.utilDocs} | 0 | ${report.docRequirements.utilDocs} | 中 |
| 类型定义文档 | ${report.docRequirements.typeDocs} | 0 | ${report.docRequirements.typeDocs} | 中 |
| 样式文档 | ${report.docRequirements.styleDocs} | 0 | ${report.docRequirements.styleDocs} | 低 |
| **总计** | **${report.docRequirements.total}** | **30** | **${report.summary.docGap}** | - |

### 具体需求清单

#### 1. 组件文档需求

**页面组件**（${report.docRequirements.byCategory.pages}个）：
- 首页、课程列表、课程详情、教练列表、教练详情等页面组件
- 需要包含：功能说明、使用方法、参数配置、交互逻辑

**通用组件**（${report.docRequirements.byCategory.components}个）：
- 表单组件、卡片组件、动画组件、上传组件等
- 需要包含：API说明、属性配置、事件处理、样式定制

#### 2. 组合式函数文档需求

**业务逻辑**（${report.docRequirements.byCategory.businessLogic}个）：
- useBooking系列、useCoach系列、useCourse系列函数
- 需要包含：功能说明、参数说明、返回值、使用示例

**动画效果**（${report.docRequirements.byCategory.animations}个）：
- useAnimation、useMotion、useParticle等函数
- 需要包含：动画类型、配置参数、使用方法

**通信功能**（${report.docRequirements.byCategory.communication}个）：
- useNotification、useMessage等函数
- 需要包含：通信机制、事件处理、状态管理

#### 3. 工具函数文档需求

**网络请求**（${report.utils.byCategory.network || 0}个）：
- HTTP客户端、API封装等
- 需要包含：请求方法、错误处理、拦截器配置

**数据验证**（${report.utils.byCategory.validation || 0}个）：
- 表单验证、数据校验等
- 需要包含：验证规则、错误提示、自定义验证

**数据存储**（${report.utils.byCategory.storage || 0}个）：
- 本地存储、会话管理等
- 需要包含：存储机制、安全策略、数据格式

#### 4. 类型定义文档需求

**数据模型**（${report.types.total}个文件）：
- 接口定义、类型别名、枚举类型等
- 需要包含：类型结构、属性说明、使用场景

#### 5. 样式文档需求

**设计系统**（${report.styles.byType['design-tokens'] || 0}个）：
- 设计令牌、颜色系统、字体系统等
- 需要包含：令牌定义、使用方法、主题配置

**响应式设计**（${report.styles.byType.responsive || 0}个）：
- 响应式布局、断点系统等
- 需要包含：断点定义、布局策略、自适应规则

---

## 🔍 分析发现

### 主要问题

1. **文档覆盖严重不足**
   - 现有30个需求文档 vs ${report.docRequirements.total}个代码文件
   - 覆盖率仅${report.summary.docCoverage}，缺口达${report.summary.docGap}个

2. **技术文档完全缺失**
   - 缺少所有组件的技术文档
   - 缺少组合式函数的使用文档
   - 缺少工具函数的API文档

3. **代码复杂度高但文档支撑弱**
   - ${report.components.total}个Vue组件需要文档支撑
   - ${report.composables.total}个组合式函数需要说明
   - ${report.utils.total}个工具函数需要API文档

### 根本原因

1. **开发优先级导致**：更重视功能开发，文档工作相对次要
2. **工具支撑缺失**：缺乏自动化文档生成工具
3. **规范不完善**：缺少文档编写规范和模板
4. **文化建设不足**：团队文档意识有待提高

---

## 💡 建议方案

### 短期方案（1个月）

1. **完善组件文档**
   - 优先编写核心页面组件文档
   - 建立组件文档模板和规范
   - 引入自动化文档生成工具

2. **补充组合式函数文档**
   - 为业务逻辑相关的组合式函数编写文档
   - 建立函数文档的标准格式

### 中期方案（3个月）

1. **完善工具函数文档**
   - 编写网络请求、数据验证等工具函数文档
   - 建立API文档的自动生成机制

2. **建立类型定义文档**
   - 为数据模型编写类型定义文档
   - 集成TypeScript类型自动生成文档

### 长期方案（6个月）

1. **完善样式文档**
   - 编写设计系统和响应式设计文档
   - 建立样式文档的维护机制

2. **建立完整的文档体系**
   - 形成requirements/technical/development/reports四级分类
   - 建立文档质量监控和持续改进机制

---

## 📈 实施建议

### 优先级排序

1. **P0**：核心组件和业务逻辑函数文档
2. **P1**：工具函数和类型定义文档
3. **P2**：样式和设计系统文档
4. **P3**：完善文档工具和流程

### 实施策略

1. **从小开始**：从最核心的组件开始编写文档
2. **模板先行**：先建立文档模板和规范
3. **工具辅助**：引入自动化工具提高效率
4. **持续改进**：建立反馈机制持续优化

### 预期收益

1. **提升开发效率**：完善的文档将减少沟通成本
2. **降低维护成本**：良好的文档将降低交接成本
3. **提高代码质量**：文档驱动开发将提升代码质量
4. **增强团队协作**：标准化的文档将改善协作效果

---

**分析完成时间**：${new Date().toISOString()}
`;
}

// 主执行函数
if (require.main === module) {
  generateRequirementsReport();
}

module.exports = {
  analyzeVueComponents,
  analyzeComposables,
  analyzeUtils,
  analyzeTypes,
  analyzeStyles,
  analyzeDocumentationRequirements
};
