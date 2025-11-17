#!/usr/bin/env node

/**
 * 多框架组件文档管理系统
 * 实现框架无关的组件文档体系，支持Vue、React、Angular等多框架统一管理
 */

const fs = require('fs');
const path = require('path');

class MultiFrameworkComponentManager {
  constructor() {
    this.config = this.loadConfig();
    this.componentRegistry = this.loadComponentRegistry();
    this.frameworkAdapters = this.loadFrameworkAdapters();
  }

  loadConfig() {
    return {
      // 支持的框架
      supportedFrameworks: ['vue', 'react', 'angular', 'svelte', 'web-components'],

      // 组件文档结构
      componentStructure: {
        metadata: 'component.json',
        documentation: 'README.md',
        examples: 'examples/',
        tests: 'tests/',
        types: 'types/'
      },

      // 文档模板
      templates: {
        component: 'docs/templates/component-template.md',
        frameworkSpecific: 'docs/templates/framework-specific/',
        migration: 'docs/templates/migration-guide.md'
      },

      // 注册表配置
      registry: {
        file: '.component-registry.json',
        autoUpdate: true,
        validation: true
      }
    };
  }

  loadComponentRegistry() {
    try {
      const registryPath = this.config.registry.file;
      if (fs.existsSync(registryPath)) {
        return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      }
    } catch (error) {
      console.warn('⚠️ 加载组件注册表失败:', error.message);
    }

    return {
      components: {},
      frameworks: {},
      lastUpdated: new Date().toISOString()
    };
  }

  loadFrameworkAdapters() {
    const adapters = {};

    // Vue适配器
    adapters.vue = {
      name: 'Vue',
      extensions: ['.vue'],
      detectComponent: (content) => content.includes('<template>') && content.includes('<script'),
      extractMetadata: (content) => this.extractVueMetadata(content),
      generateDocs: (component) => this.generateVueDocs(component)
    };

    // React适配器
    adapters.react = {
      name: 'React',
      extensions: ['.jsx', '.tsx'],
      detectComponent: (content) => /import React.*from 'react'/i.test(content) || /function \w+\s*\(/.test(content),
      extractMetadata: (content) => this.extractReactMetadata(content),
      generateDocs: (component) => this.generateReactDocs(component)
    };

    // Angular适配器
    adapters.angular = {
      name: 'Angular',
      extensions: ['.ts'],
      detectComponent: (content) => /@Component\s*\({/.test(content),
      extractMetadata: (content) => this.extractAngularMetadata(content),
      generateDocs: (component) => this.generateAngularDocs(component)
    };

    // Web Components适配器
    adapters['web-components'] = {
      name: 'Web Components',
      extensions: ['.js', '.ts'],
      detectComponent: (content) => /customElements\.define/.test(content) || /class.*extends.*HTMLElement/.test(content),
      extractMetadata: (content) => this.extractWebComponentMetadata(content),
      generateDocs: (component) => this.generateWebComponentDocs(component)
    };

    return adapters;
  }

  /**
   * 扫描并注册组件
   */
  async scanAndRegisterComponents(basePath = 'src') {
    console.log(`🔍 扫描组件目录: ${basePath}`);

    const components = [];

    for (const framework of this.config.supportedFrameworks) {
      const adapter = this.frameworkAdapters[framework];
      if (!adapter) continue;

      console.log(`📦 扫描 ${adapter.name} 组件...`);

      const frameworkComponents = await this.scanFrameworkComponents(basePath, adapter);
      components.push(...frameworkComponents);

      console.log(`   发现 ${frameworkComponents.length} 个 ${adapter.name} 组件`);
    }

    // 更新注册表
    this.updateComponentRegistry(components);

    console.log(`✅ 共注册 ${components.length} 个组件`);
    return components;
  }

  /**
   * 扫描特定框架的组件
   */
  async scanFrameworkComponents(basePath, adapter) {
    const components = [];

    function scanDir(dir) {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDir(fullPath);
        } else if (stat.isFile() && adapter.extensions.some(ext => item.endsWith(ext))) {
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              if (adapter.detectComponent(content)) {
                const component = {
                  id: this.generateComponentId(fullPath),
                  path: fullPath,
                  framework: adapter.name.toLowerCase(),
                  name: this.extractComponentName(fullPath, content, adapter),
                  metadata: adapter.extractMetadata(content),
                  lastModified: stat.mtime.toISOString()
                };
                components.push(component);
              }
            }
          } catch (error) {
            console.warn(`⚠️ 处理组件失败 ${fullPath}: ${error.message}`);
          }
        }
      }
    }

    scanDir.call(this, basePath);
    return components;
  }

  /**
   * 生成组件ID
   */
  generateComponentId(filePath) {
    return filePath.replace(/[/\\]/g, '-').replace(/\.[^.]+$/, '');
  }

  /**
   * 提取组件名称
   */
  extractComponentName(filePath, content, adapter) {
    const fileName = path.basename(filePath, path.extname(filePath));

    // 根据不同框架提取组件名
    switch (adapter.name.toLowerCase()) {
      case 'vue':
        const vueMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
        return vueMatch ? vueMatch[1] : fileName;

      case 'react':
        const reactMatch = content.match(/(?:export\s+)?(?:default\s+)?function\s+(\w+)/) ||
                          content.match(/(?:export\s+)?(?:const|function)\s+(\w+)\s*=\s*\(/);
        return reactMatch ? reactMatch[1] : fileName;

      case 'angular':
        const angularMatch = content.match(/selector:\s*['"]([^'"]+)['"]/);
        return angularMatch ? angularMatch[1] : fileName;

      case 'web-components':
        const wcMatch = content.match(/customElements\.define\(\s*['"]([^'"]+)['"]/);
        return wcMatch ? wcMatch[1] : fileName;

      default:
        return fileName;
    }
  }

  /**
   * 提取Vue组件元数据
   */
  extractVueMetadata(content) {
    const metadata = {
      props: [],
      emits: [],
      slots: [],
      expose: []
    };

    // 提取props
    const propsMatch = content.match(/props:\s*\{([^}]+)\}/s);
    if (propsMatch) {
      const propsContent = propsMatch[1];
      const propMatches = propsContent.match(/(\w+):\s*\{[^}]*type:\s*([^,}]+)/g);
      if (propMatches) {
        metadata.props = propMatches.map(prop => {
          const match = prop.match(/(\w+):\s*\{[^}]*type:\s*([^,]+)/);
          return match ? {
            name: match[1],
            type: match[2].trim(),
            required: prop.includes('required: true')
          } : null;
        }).filter(Boolean);
      }
    }

    // 提取emits
    const emitsMatch = content.match(/emits:\s*\[([^\]]+)\]/);
    if (emitsMatch) {
      metadata.emits = emitsMatch[1].split(',').map(e => e.trim().replace(/['"]/g, ''));
    }

    return metadata;
  }

  /**
   * 提取React组件元数据
   */
  extractReactMetadata(content) {
    const metadata = {
      props: [],
      state: [],
      hooks: []
    };

    // 提取props类型定义
    const propTypesMatch = content.match(/(\w+)\.propTypes\s*=\s*\{([^}]+)\}/s);
    if (propTypesMatch) {
      const propsContent = propTypesMatch[1];
      const propMatches = propsContent.match(/(\w+):\s*PropTypes\.(\w+)/g);
      if (propMatches) {
        metadata.props = propMatches.map(prop => {
          const match = prop.match(/(\w+):\s*PropTypes\.(\w+)/);
          return match ? {
            name: match[1],
            type: match[2],
            required: prop.includes('.isRequired')
          } : null;
        }).filter(Boolean);
      }
    }

    // 提取hooks使用
    const hookMatches = content.match(/use\w+\s*\(/g);
    if (hookMatches) {
      metadata.hooks = [...new Set(hookMatches.map(hook => hook.trim()))];
    }

    return metadata;
  }

  /**
   * 提取Angular组件元数据
   */
  extractAngularMetadata(content) {
    const metadata = {
      selector: '',
      inputs: [],
      outputs: [],
      template: false,
      styles: false
    };

    // 提取selector
    const selectorMatch = content.match(/selector:\s*['"]([^'"]+)['"]/);
    if (selectorMatch) {
      metadata.selector = selectorMatch[1];
    }

    // 提取inputs
    const inputsMatch = content.match(/inputs:\s*\[([^\]]+)\]/);
    if (inputsMatch) {
      metadata.inputs = inputsMatch[1].split(',').map(i => i.trim().replace(/['"]/g, ''));
    }

    // 提取outputs
    const outputsMatch = content.match(/outputs:\s*\[([^\]]+)\]/);
    if (outputsMatch) {
      metadata.outputs = outputsMatch[1].split(',').map(o => o.trim().replace(/['"]/g, ''));
    }

    return metadata;
  }

  /**
   * 提取Web Components元数据
   */
  extractWebComponentMetadata(content) {
    const metadata = {
      tagName: '',
      observedAttributes: [],
      methods: [],
      properties: []
    };

    // 提取tagName
    const tagMatch = content.match(/customElements\.define\(\s*['"]([^'"]+)['"]/);
    if (tagMatch) {
      metadata.tagName = tagMatch[1];
    }

    // 提取observedAttributes
    const attrMatch = content.match(/observedAttributes:\s*\[([^\]]+)\]/);
    if (attrMatch) {
      metadata.observedAttributes = attrMatch[1].split(',').map(a => a.trim().replace(/['"]/g, ''));
    }

    // 提取方法
    const methodMatches = content.match(/(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/g);
    if (methodMatches) {
      metadata.methods = methodMatches.map(method => {
        const match = method.match(/(?:async\s+)?(\w+)\s*\(/);
        return match ? match[1] : null;
      }).filter(Boolean);
    }

    return metadata;
  }

  /**
   * 更新组件注册表
   */
  updateComponentRegistry(components) {
    components.forEach(component => {
      this.componentRegistry.components[component.id] = component;
    });

    // 按框架分组统计
    this.componentRegistry.frameworks = {};
    Object.values(this.componentRegistry.components).forEach(component => {
      if (!this.componentRegistry.frameworks[component.framework]) {
        this.componentRegistry.frameworks[component.framework] = [];
      }
      this.componentRegistry.frameworks[component.framework].push(component.id);
    });

    this.componentRegistry.lastUpdated = new Date().toISOString();
    this.saveComponentRegistry();
  }

  /**
   * 保存组件注册表
   */
  saveComponentRegistry() {
    try {
      fs.writeFileSync(this.config.registry.file, JSON.stringify(this.componentRegistry, null, 2));
    } catch (error) {
      console.error('❌ 保存组件注册表失败:', error.message);
    }
  }

  /**
   * 生成统一组件文档
   */
  async generateUnifiedComponentDocs(componentId, outputDir = 'docs/technical/frontend/components') {
    const component = this.componentRegistry.components[componentId];
    if (!component) {
      throw new Error(`组件 ${componentId} 不存在`);
    }

    console.log(`📝 生成组件文档: ${component.name}`);

    // 生成框架无关的基础文档
    const baseDoc = await this.generateBaseComponentDoc(component);

    // 生成框架特定的文档
    const frameworkDoc = await this.generateFrameworkSpecificDoc(component);

    // 生成使用示例
    const examples = await this.generateComponentExamples(component);

    // 生成迁移指南
    const migrationGuide = await this.generateMigrationGuide(component);

    // 保存文档
    const componentDir = path.join(outputDir, component.name);
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }

    fs.writeFileSync(path.join(componentDir, 'README.md'), baseDoc);
    fs.writeFileSync(path.join(componentDir, 'FRAMEWORK.md'), frameworkDoc);
    fs.writeFileSync(path.join(componentDir, 'EXAMPLES.md'), examples);
    fs.writeFileSync(path.join(componentDir, 'MIGRATION.md'), migrationGuide);

    // 生成元数据文件
    fs.writeFileSync(path.join(componentDir, 'component.json'), JSON.stringify(component, null, 2));

    console.log(`✅ 组件文档已生成: ${componentDir}`);
    return componentDir;
  }

  /**
   * 生成基础组件文档
   */
  async generateBaseComponentDoc(component) {
    const template = `# ${component.name}

**框架**: ${component.framework}
**位置**: ${component.path}
**更新时间**: ${component.lastModified}

## 概述

${this.generateComponentDescription(component)}

## 功能特性

${this.generateFeatureList(component)}

## 安装使用

\`\`\`bash
# 安装依赖
npm install ${this.getFrameworkPackage(component.framework)}

# 导入组件
${this.generateImportExample(component)}
\`\`\`

## 基本用法

\`\`\`${this.getCodeLanguage(component.framework)}
${this.generateBasicUsageExample(component)}
\`\`\`

## API参考

### 属性 (Props)

${this.generatePropsTable(component.metadata.props)}

### 事件 (Events)

${this.generateEventsTable(component.metadata)}

### 方法 (Methods)

${this.generateMethodsTable(component.metadata)}

## 主题定制

${this.generateThemeCustomization(component)}

## 无障碍访问

${this.generateAccessibilityInfo(component)}

## 浏览器兼容性

${this.generateCompatibilityInfo(component.framework)}

## 相关链接

- [源码](${component.path})
- [测试](./tests/)
- [示例](./examples/)
- [框架特定文档](./FRAMEWORK.md)

---

*自动生成于 ${new Date().toISOString()}*
`;

    return template;
  }

  /**
   * 生成框架特定文档
   */
  async generateFrameworkSpecificDoc(component) {
    const adapter = this.frameworkAdapters[component.framework];
    if (!adapter) {
      return '# 框架特定信息\n\n暂无框架特定信息\n';
    }

    return adapter.generateDocs(component);
  }

  /**
   * 生成Vue框架文档
   */
  generateVueDocs(component) {
    return `# Vue.js 框架特定信息

## 组件注册

### 全局注册
\`\`\`javascript
import { createApp } from 'vue'
import ${component.name} from '${component.path}'

const app = createApp(App)
app.component('${component.name}', ${component.name})
\`\`\`

### 局部注册
\`\`\`vue
<script setup>
import ${component.name} from '${component.path}'
</script>

<template>
  <${component.name} v-bind="$props" v-on="$listeners" />
</template>
\`\`\`

## Composition API使用

\`\`\`vue
<script setup>
import { ref } from 'vue'
import ${component.name} from '${component.path}'

const componentRef = ref()
</script>

<template>
  <${component.name} ref="componentRef" />
</template>
\`\`\`

## TypeScript支持

\`\`\`vue
<script setup lang="ts">
import ${component.name} from '${component.path}'

interface Props {
  // 组件属性类型定义
}

const props = defineProps<Props>()
</script>
\`\`\`
`;
  }

  /**
   * 生成React框架文档
   */
  generateReactDocs(component) {
    return `# React 框架特定信息

## 组件导入

\`\`\`javascript
import ${component.name} from '${component.path}'

// 或者
import { ${component.name} } from '${component.path}'
\`\`\`

## Hooks使用

\`\`\`javascript
import { useState, useEffect } from 'react'
import ${component.name} from '${component.path}'

function App() {
  const [value, setValue] = useState('')

  return (
    <${component.name}
      value={value}
      onChange={setValue}
    />
  )
}
\`\`\`

## TypeScript支持

\`\`\`typescript
import ${component.name} from '${component.path}'

interface AppProps {
  // 属性类型定义
}

const App: React.FC<AppProps> = () => {
  return <${component.name} />
}
\`\`\`
`;
  }

  /**
   * 生成Angular框架文档
   */
  generateAngularDocs(component) {
    return `# Angular 框架特定信息

## 模块导入

\`\`\`typescript
import { ${component.name}Module } from '${component.path.replace('.ts', '.module')}'

@NgModule({
  imports: [${component.name}Module],
})
export class AppModule {}
\`\`\`

## 组件使用

\`\`\`html
<${component.metadata.selector || 'app-component'}
  [inputProperty]="value"
  (outputEvent)="handleEvent($event)">
</${component.metadata.selector || 'app-component'}>
\`\`\`

## 依赖注入

\`\`\`typescript
import { Component } from '@angular/core'

@Component({
  selector: 'app-container',
  template: \`<${component.metadata.selector || 'app-component'}></${component.metadata.selector || 'app-component'}>\`
})
export class ContainerComponent {
  constructor() {
    // 依赖注入逻辑
  }
}
\`\`\`
`;
  }

  /**
   * 生成Web Components框架文档
   */
  generateWebComponentDocs(component) {
    return `# Web Components 框架特定信息

## 注册组件

\`\`\`javascript
// 组件已自动注册，无需手动注册
// 如果需要动态注册：
import '${component.path}'
\`\`\`

## HTML使用

\`\`\`html
<${component.metadata.tagName}>
  <!-- 组件内容 -->
</${component.metadata.tagName}>
\`\`\`

## JavaScript操作

\`\`\`javascript
const component = document.querySelector('${component.metadata.tagName}')

// 设置属性
component.setAttribute('attribute-name', 'value')

// 监听事件
component.addEventListener('custom-event', (event) => {
  console.log('Event received:', event.detail)
})
\`\`\`

## 样式定制

\`\`\`css
${component.metadata.tagName} {
  /* 组件样式 */
}

${component.metadata.tagName}::part(component-part) {
  /* 组件内部样式 */
}
\`\`\`
`;
  }

  /**
   * 生成组件示例
   */
  async generateComponentExamples(component) {
    return `# ${component.name} 使用示例

## 基本示例

\`\`\`${this.getCodeLanguage(component.framework)}
${this.generateBasicUsageExample(component)}
\`\`\`

## 高级用法

\`\`\`${this.getCodeLanguage(component.framework)}
${this.generateAdvancedUsageExample(component)}
\`\`\`

## 完整示例

查看 [\`examples\`](./examples/) 目录中的完整示例代码。

## 在线演示

- [CodeSandbox示例](https://codesandbox.io/)
- [StackBlitz示例](https://stackblitz.com/)

## 常见问题

### Q: 如何自定义样式？
A: ${component.framework} 组件支持通过CSS变量进行样式定制。

### Q: 支持哪些浏览器？
A: 详见兼容性说明。

---

*自动生成于 ${new Date().toISOString()}*
`;
  }

  /**
   * 生成迁移指南
   */
  async generateMigrationGuide(component) {
    return `# ${component.name} 迁移指南

## 从旧版本迁移

### 破坏性变更

- **属性重命名**: \`oldProp\` → \`newProp\`
- **事件变更**: \`old-event\` → \`new-event\`
- **默认值变更**: 某些属性的默认值已更改

### 迁移步骤

1. **更新属性名**
   \`\`\`${this.getCodeLanguage(component.framework)}
   // 旧版本
   <${component.name} oldProp="value" />

   // 新版本
   <${component.name} newProp="value" />
   \`\`\`

2. **更新事件监听**
   \`\`\`${this.getCodeLanguage(component.framework)}
   // 旧版本
   <${component.name} @old-event="handler" />

   // 新版本
   <${component.name} @new-event="handler" />
   \`\`\`

3. **检查默认值**
   某些属性的默认行为可能已更改，请检查是否需要显式设置。

## 跨框架迁移

### 从Vue迁移到React

\`\`\`javascript
// Vue版本
<template>
  <${component.name} :value="data" @change="handleChange" />
</template>

// React版本
<${component.name} value={data} onChange={handleChange} />
\`\`\`

### 从React迁移到Angular

\`\`\`typescript
// React版本
<${component.name} value={data} onChange={handleChange} />

// Angular版本
<${component.name} [value]="data" (change)="handleChange($event)"></${component.name}>
\`\`\`

## 自动化迁移

我们提供了迁移工具来帮助自动化迁移过程：

\`\`\`bash
# 运行迁移工具
npm run migrate -- --component ${component.name} --from vue --to react
\`\`\`

## 兼容性保证

- ✅ 向后兼容：旧API仍可使用，但会显示弃用警告
- ✅ 渐进迁移：可以逐步迁移，无需一次性更改所有代码
- ✅ 工具支持：提供Codemod工具自动化迁移

---

*自动生成于 ${new Date().toISOString()}*
`;
  }

  /**
   * 辅助方法
   */
  generateComponentDescription(component) {
    const descriptions = {
      vue: '一个Vue.js组件，提供...',
      react: '一个React组件，提供...',
      angular: '一个Angular组件，提供...',
      'web-components': '一个Web Components组件，提供...'
    };
    return descriptions[component.framework] || '一个UI组件';
  }

  generateFeatureList(component) {
    return '- ✅ 功能1\n- ✅ 功能2\n- ✅ 功能3';
  }

  getFrameworkPackage(framework) {
    const packages = {
      vue: '@vue/runtime-core',
      react: 'react',
      angular: '@angular/core',
      'web-components': '无额外依赖'
    };
    return packages[framework] || '组件库';
  }

  generateImportExample(component) {
    const examples = {
      vue: `import ${component.name} from '${component.path}'`,
      react: `import ${component.name} from '${component.path}'`,
      angular: `import { ${component.name} } from '${component.path}'`,
      'web-components': `import '${component.path}'`
    };
    return examples[component.framework] || `import ${component.name}`;
  }

  getCodeLanguage(framework) {
    const languages = {
      vue: 'vue',
      react: 'jsx',
      angular: 'typescript',
      'web-components': 'javascript'
    };
    return languages[framework] || 'javascript';
  }

  generateBasicUsageExample(component) {
    // 简化的示例生成逻辑
    return `// 基本使用示例\n<${component.name} />`;
  }

  generateAdvancedUsageExample(component) {
    // 简化的高级示例生成逻辑
    return `// 高级使用示例\n<${component.name} prop="value" />`;
  }

  generatePropsTable(props) {
    if (!props || props.length === 0) {
      return '| 属性 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| 无 | - | - | 无属性 |\n';
    }

    let table = '| 属性 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n';
    props.forEach(prop => {
      table += `| ${prop.name} | ${prop.type} | - | ${prop.required ? '必需' : '可选'} |\n`;
    });
    return table;
  }

  generateEventsTable(metadata) {
    const events = metadata.emits || metadata.outputs || [];
    if (events.length === 0) {
      return '| 事件 | 参数 | 说明 |\n|------|------|------|\n| 无 | - | 无事件 |\n';
    }

    let table = '| 事件 | 参数 | 说明 |\n|------|------|------|\n';
    events.forEach(event => {
      table += `| ${event} | - | 事件说明 |\n`;
    });
    return table;
  }

  generateMethodsTable(metadata) {
    const methods = metadata.methods || [];
    if (methods.length === 0) {
      return '| 方法 | 参数 | 返回值 | 说明 |\n|------|------|--------|------|\n| 无 | - | - | 无方法 |\n';
    }

    let table = '| 方法 | 参数 | 返回值 | 说明 |\n|------|------|--------|------|\n';
    methods.forEach(method => {
      table += `| ${method} | - | - | 方法说明 |\n`;
    });
    return table;
  }

  generateThemeCustomization(component) {
    return '组件支持通过CSS变量进行主题定制。';
  }

  generateAccessibilityInfo(component) {
    return '组件遵循WCAG 2.1 AA标准，支持键盘导航和屏幕阅读器。';
  }

  generateCompatibilityInfo(framework) {
    const compatibilities = {
      vue: '支持Vue 2.6+ 和 Vue 3.0+',
      react: '支持React 16.8+',
      angular: '支持Angular 12+',
      'web-components': '支持所有现代浏览器'
    };
    return compatibilities[framework] || '详见项目兼容性要求';
  }

  /**
   * 批量生成文档
   */
  async generateAllComponentDocs(outputDir = 'docs/technical/frontend/components') {
    console.log('🚀 开始批量生成组件文档...');

    const components = Object.values(this.componentRegistry.components);
    console.log(`📦 处理 ${components.length} 个组件`);

    for (const component of components) {
      try {
        await this.generateUnifiedComponentDocs(component.id, outputDir);
      } catch (error) {
        console.error(`❌ 生成组件文档失败 ${component.name}: ${error.message}`);
      }
    }

    console.log('✅ 批量文档生成完成');
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const components = Object.values(this.componentRegistry.components);
    const frameworks = Object.keys(this.componentRegistry.frameworks);

    const stats = {
      totalComponents: components.length,
      frameworks: {},
      lastUpdated: this.componentRegistry.lastUpdated
    };

    frameworks.forEach(framework => {
      stats.frameworks[framework] = this.componentRegistry.frameworks[framework].length;
    });

    return stats;
  }
}

// CLI接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const manager = new MultiFrameworkComponentManager();

  switch (command) {
    case 'scan':
      const scanPath = args[1] || 'src';
      manager.scanAndRegisterComponents(scanPath);
      break;

    case 'generate':
      const componentId = args[1];
      const outputDir = args[2] || 'docs/technical/frontend/components';
      if (componentId) {
        manager.generateUnifiedComponentDocs(componentId, outputDir);
      } else {
        console.error('请提供组件ID');
      }
      break;

    case 'generate-all':
      const allOutputDir = args[1] || 'docs/technical/frontend/components';
      manager.generateAllComponentDocs(allOutputDir);
      break;

    case 'stats':
      const stats = manager.getStats();
      console.log('📊 组件管理系统统计:');
      console.log(JSON.stringify(stats, null, 2));
      break;

    default:
      console.log(`
多框架组件文档管理系统使用帮助：

用法: node multi-framework-component-manager.js <command> [options]

命令:
  scan [path]                    扫描并注册组件 (默认: src)
  generate <componentId> [output] 生成单个组件文档
  generate-all [output]          批量生成所有组件文档
  stats                          显示统计信息

示例:
  node multi-framework-component-manager.js scan src/components
  node multi-framework-component-manager.js generate my-button
  node multi-framework-component-manager.js generate-all
  node multi-framework-component-manager.js stats
      `);
  }
}

module.exports = MultiFrameworkComponentManager;
