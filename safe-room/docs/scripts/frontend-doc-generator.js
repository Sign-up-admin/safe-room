#!/usr/bin/env node

/**
 * Front前端文档自动生成工具
 * 基于代码自动生成文档模板
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

class FrontendDocGenerator {
  constructor() {
    this.templates = {}
    this.loadTemplates()
  }

  /**
   * 加载文档模板
   */
  loadTemplates() {
    // 这里可以加载预定义的模板
    this.templates = {
      component: this.getComponentTemplate(),
      composable: this.getComposableTemplate(),
      page: this.getPageTemplate()
    }
  }

  /**
   * 生成组件文档
   * @param {string} componentPath - 组件文件路径
   * @param {string} outputPath - 输出路径
   */
  async generateComponentDoc(componentPath, outputPath) {
    try {
      const componentName = this.extractComponentName(componentPath)
      const componentInfo = await this.parseVueComponent(componentPath)

      let template = this.templates.component
      template = template.replace(/\[COMPONENT NAME\]/g, componentName)
      template = template.replace(/\[component-type\]/g, 'component')
      template = template.replace(/\[ComponentName\]/g, componentName)

      // 填充组件信息
      if (componentInfo.props && componentInfo.props.length > 0) {
        const propsTable = this.generatePropsTable(componentInfo.props)
        template = template.replace('| v-model | `string \\| number` | `\'\'` | 否 | 双向绑定值 |', propsTable)
      }

      if (componentInfo.events && componentInfo.events.length > 0) {
        const eventsTable = this.generateEventsTable(componentInfo.events)
        template = template.replace('| change | `(value: string \\| number)` | 值改变时触发 |', eventsTable)
      }

      // 写入文件
      fs.writeFileSync(outputPath, template, 'utf-8')
      console.log(`✅ 组件文档已生成: ${outputPath}`)

    } catch (error) {
      console.error(`❌ 生成组件文档失败: ${error.message}`)
      throw error
    }
  }

  /**
   * 生成组合式函数文档
   * @param {string} composablePath - 组合式函数文件路径
   * @param {string} outputPath - 输出路径
   */
  async generateComposableDoc(composablePath, outputPath) {
    try {
      const functionName = this.extractFunctionName(composablePath)
      const functionInfo = await this.parseTypeScriptFunction(composablePath)

      let template = this.templates.composable
      template = template.replace(/\[FUNCTION NAME\]/g, functionName)
      template = template.replace(/\[ComposableName\]/g, functionName)
      template = template.replace(/\[useFunctionName\]/g, `use${functionName}`)

      // 填充函数信息
      if (functionInfo.params && functionInfo.params.length > 0) {
        const paramsTable = this.generateParamsTable(functionInfo.params)
        template = template.replace('| param1 | `string` | `\'\'` | 否 | 参数1说明 |', paramsTable)
      }

      if (functionInfo.returnType) {
        template = template.replace('result: `T`', `result: \`${functionInfo.returnType}\``)
      }

      // 写入文件
      fs.writeFileSync(outputPath, template, 'utf-8')
      console.log(`✅ 组合式函数文档已生成: ${outputPath}`)

    } catch (error) {
      console.error(`❌ 生成组合式函数文档失败: ${error.message}`)
      throw error
    }
  }

  /**
   * 生成页面文档
   * @param {string} pagePath - 页面文件路径
   * @param {string} outputPath - 输出路径
   */
  async generatePageDoc(pagePath, outputPath) {
    try {
      const pageName = this.extractPageName(pagePath)
      const pageInfo = await this.parseVuePage(pagePath)

      let template = this.templates.page
      template = template.replace(/\[PAGE NAME\]/g, pageName)
      template = template.replace(/\[page-type\]/g, 'page')
      template = template.replace(/\[PageName\]/g, pageName)
      template = template.replace(/PageName/g, pageName)

      // 填充页面信息
      if (pageInfo.route) {
        template = template.replace('/path/to/page', pageInfo.route)
      }

      // 写入文件
      fs.writeFileSync(outputPath, template, 'utf-8')
      console.log(`✅ 页面文档已生成: ${outputPath}`)

    } catch (error) {
      console.error(`❌ 生成页面文档失败: ${error.message}`)
      throw error
    }
  }

  /**
   * 从文件路径提取组件名称
   * @param {string} filePath - 文件路径
   * @returns {string} 组件名称
   */
  extractComponentName(filePath) {
    const fileName = path.basename(filePath, '.vue')
    return fileName.split('-').map(part =>
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('')
  }

  /**
   * 从文件路径提取函数名称
   * @param {string} filePath - 文件路径
   * @returns {string} 函数名称
   */
  extractFunctionName(filePath) {
    const fileName = path.basename(filePath, '.ts')
    if (fileName.startsWith('use')) {
      return fileName.substring(3)
    }
    return fileName
  }

  /**
   * 从文件路径提取页面名称
   * @param {string} filePath - 文件路径
   * @returns {string} 页面名称
   */
  extractPageName(filePath) {
    const relativePath = path.relative('src/pages', filePath)
    const dirName = path.dirname(relativePath)
    const fileName = path.basename(filePath, '.vue')

    if (dirName === '.') {
      return fileName
    }

    return `${dirName}/${fileName}`
  }

  /**
   * 解析Vue组件文件
   * @param {string} filePath - 文件路径
   * @returns {Object} 组件信息
   */
  async parseVueComponent(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8')

    // 简单的解析，实际项目中可以使用vue/compiler-sfc
    const props = []
    const events = []
    const slots = []

    // 解析props
    const propsMatch = content.match(/props:\s*{([^}]*)}/s)
    if (propsMatch) {
      const propsContent = propsMatch[1]
      const propMatches = propsContent.match(/(\w+):\s*{[^}]*type:\s*([^,}]+)/g)
      if (propMatches) {
        propMatches.forEach(match => {
          const [, name, type] = match.match(/(\w+):\s*{[^}]*type:\s*([^,}]+)/)
          props.push({
            name,
            type: this.mapType(type),
            required: match.includes('required: true'),
            default: match.match(/default:\s*([^,}]+)/)?.[1] || ''
          })
        })
      }
    }

    // 解析emits
    const emitsMatch = content.match(/emits:\s*\[([^\]]*)\]/)
    if (emitsMatch) {
      const emitsContent = emitsMatch[1]
      const emitMatches = emitsContent.match(/'([^']+)'/g)
      if (emitMatches) {
        emitMatches.forEach(match => {
          const eventName = match.replace(/'/g, '')
          events.push({
            name: eventName,
            params: [] // 简化处理
          })
        })
      }
    }

    return { props, events, slots }
  }

  /**
   * 解析TypeScript函数文件
   * @param {string} filePath - 文件路径
   * @returns {Object} 函数信息
   */
  async parseTypeScriptFunction(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8')

    // 简单的解析，实际项目中可以使用TypeScript Compiler API
    const params = []
    let returnType = 'any'

    // 解析函数参数
    const functionMatch = content.match(/export.*function\s+\w+\s*\(([^)]*)\)/)
    if (functionMatch) {
      const paramsContent = functionMatch[1]
      const paramMatches = paramsContent.match(/(\w+):\s*([^,]+)/g)
      if (paramMatches) {
        paramMatches.forEach(match => {
          const [, name, type] = match.match(/(\w+):\s*([^,]+)/)
          params.push({
            name,
            type: this.mapType(type),
            required: !type.includes('?'),
            default: ''
          })
        })
      }
    }

    // 解析返回类型
    const returnMatch = content.match(/:\s*([^=\s{]+)\s*{/)
    if (returnMatch) {
      returnType = returnMatch[1]
    }

    return { params, returnType }
  }

  /**
   * 解析Vue页面文件
   * @param {string} filePath - 文件路径
   * @returns {Object} 页面信息
   */
  async parseVuePage(filePath) {
    // 简化实现，实际项目中可以解析路由配置
    const route = `/${path.relative('src/pages', filePath).replace(/\/index\.vue$/, '').replace(/\.vue$/, '').replace(/\\/g, '/')}`

    return { route }
  }

  /**
   * 类型映射
   * @param {string} type - 原始类型
   * @returns {string} 映射后的类型
   */
  mapType(type) {
    const typeMap = {
      'String': 'string',
      'Number': 'number',
      'Boolean': 'boolean',
      'Array': 'array',
      'Object': 'object',
      'Function': 'function'
    }

    return typeMap[type] || type.toLowerCase()
  }

  /**
   * 生成Props表格
   * @param {Array} props - Props数组
   * @returns {string} 表格字符串
   */
  generatePropsTable(props) {
    return props.map(prop =>
      `| ${prop.name} | \`${prop.type}\` | \`${prop.default || ''}\` | ${prop.required ? '是' : '否'} | ${prop.name}属性说明 |`
    ).join('\n')
  }

  /**
   * 生成Events表格
   * @param {Array} events - Events数组
   * @returns {string} 表格字符串
   */
  generateEventsTable(events) {
    return events.map(event =>
      `| ${event.name} | \`(${event.params.join(', ')})\` | ${event.name}事件说明 |`
    ).join('\n')
  }

  /**
   * 生成参数表格
   * @param {Array} params - 参数数组
   * @returns {string} 表格字符串
   */
  generateParamsTable(params) {
    return params.map(param =>
      `| ${param.name} | \`${param.type}\` | \`${param.default || ''}\` | ${param.required ? '是' : '否'} | ${param.name}参数说明 |`
    ).join('\n')
  }

  /**
   * 获取组件文档模板
   * @returns {string} 模板字符串
   */
  getComponentTemplate() {
    return `---
title: [COMPONENT NAME]
version: v1.0.0
last_updated: 2025-11-16
status: draft
category: technical
tags: [vue, component, [component-type]]
---

# [组件名称]组件文档

> **版本**：v1.0.0
> **更新日期**：2025-11-16
> **适用范围**：[组件适用场景]
> **关键词**：[关键词列表]

---

## 📋 目录

- [概述](#概述)
- [功能特性](#功能特性)
- [安装使用](#安装使用)
- [API文档](#api文档)
- [示例代码](#示例代码)
- [注意事项](#注意事项)
- [更新日志](#更新日志)

---

## 📖 概述

### 组件介绍

[组件的详细介绍，包括主要功能和使用场景]

### 设计理念

[组件的设计理念和目标]

### 兼容性

- **Vue版本**：3.x
- **浏览器支持**：Chrome 80+, Firefox 75+, Safari 13+

---

## ✨ 功能特性

- [ ] **特性1**：特性描述
- [ ] **特性2**：特性描述
- [ ] **特性3**：特性描述

---

## 🚀 安装使用

### 基础用法

\`\`\`vue
<template>
  <[ComponentName]
    v-model="value"
    :prop1="propValue1"
    @event1="handleEvent1"
  />
</template>

<script setup lang="ts">
import [ComponentName] from '@/components/[ComponentName].vue'

const value = ref('')
const propValue1 = 'example'

const handleEvent1 = (data) => {
  console.log('Event data:', data)
}
</script>
\`\`\`

### 高级用法

\`\`\`vue
<template>
  <[ComponentName]
    v-model="value"
    :config="advancedConfig"
    @custom-event="handleCustomEvent"
  >
    <template #slot1>
      自定义插槽内容
    </template>
  </[ComponentName]>
</template>

<script setup lang="ts">
const advancedConfig = {
  option1: 'value1',
  option2: 'value2'
}

const handleCustomEvent = (payload) => {
  // 处理复杂事件
}
</script>
\`\`\`

---

## 📚 API文档

### Props 属性

| 属性名 | 类型 | 默认值 | 必需 | 说明 |
|--------|------|--------|------|------|
| v-model | \`string \| number\` | \`''\` | 否 | 双向绑定值 |
| prop1 | \`string\` | \`'default'\` | 否 | 属性1说明 |

### Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| change | \`(value: string \| number)\` | 值改变时触发 |

### Slots 插槽

| 插槽名 | 说明 | 作用域参数 |
|--------|------|------------|
| default | 默认插槽 | - |

### Methods 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| focus | \`()\` | \`void\` | 获取焦点 |

---

## 💡 示例代码

### 基础示例

\`\`\`vue
<template>
  <[ComponentName] v-model="inputValue" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputValue = ref('Hello World')
</script>
\`\`\`

---

## ⚠️ 注意事项

### 使用限制

- [ ] 组件必须在Vue 3.x环境中使用
- [ ] 需要正确配置TypeScript类型

### 性能考虑

- [ ] 大数据量场景建议使用虚拟滚动

---

## 📝 更新日志

### v1.0.0 (2025-11-16)

- ✨ 初始版本发布
- ✨ 支持基础功能

---

## 📚 相关链接

- [组件源码](../../src/components/[ComponentName].vue)
- [使用示例](../../examples/[ComponentName]Example.vue)

---

**最后更新**：2025-11-16
**维护责任人**：[组件开发者]
**联系方式**：[开发者邮箱]`
  }

  /**
   * 获取组合式函数文档模板
   * @returns {string} 模板字符串
   */
  getComposableTemplate() {
    return `---
title: USE [FUNCTION NAME]
version: v1.0.0
last_updated: 2025-11-16
status: draft
category: technical
tags: [vue, composable, composition-function]
---

# use[FunctionName] 组合式函数文档

> **版本**：v1.0.0
> **更新日期**：2025-11-16
> **适用范围**：[函数适用场景]
> **关键词**：[关键词列表]

---

## 📋 目录

- [概述](#概述)
- [功能特性](#功能特性)
- [安装使用](#安装使用)
- [API文档](#api文档)
- [示例代码](#示例代码)
- [类型定义](#类型定义)
- [注意事项](#注意事项)
- [更新日志](#更新日志)

---

## 📖 概述

### 函数介绍

[函数的详细介绍，包括主要功能和使用场景]

### 设计理念

[函数的设计理念和目标]

### 依赖要求

- **Vue版本**：3.x
- **TypeScript**：4.0+

---

## ✨ 功能特性

- [ ] **特性1**：特性描述
- [ ] **特性2**：特性描述

---

## 🚀 安装使用

### 基础用法

\`\`\`typescript
import { use[FunctionName] } from '@/composables/use[FunctionName]'

const { result, loading, error } = use[FunctionName]()
\`\`\`

### 组合式API用法

\`\`\`vue
<script setup lang="ts">
import { use[FunctionName] } from '@/composables/use[FunctionName]'

const { result, loading, error, execute } = use[FunctionName]({
  param1: 'value1'
})
</script>
\`\`\`

---

## 📚 API文档

### 参数选项

| 参数名 | 类型 | 默认值 | 必需 | 说明 |
|--------|------|--------|------|------|
| param1 | \`string\` | \`''\` | 否 | 参数1说明 |

### 返回值

| 属性名 | 类型 | 说明 |
|--------|------|------|
| result | \`T\` | 执行结果 |
| loading | \`boolean\` | 加载状态 |
| error | \`Error \| null\` | 错误信息 |

---

## 💡 示例代码

### 基础示例

\`\`\`vue
<template>
  <div>
    <button @click="execute" :disabled="loading">
      {{ loading ? '执行中...' : '执行' }}
    </button>

    <div v-if="result">
      结果: {{ result }}
    </div>

    <div v-if="error" class="error">
      错误: {{ error.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { use[FunctionName] } from '@/composables/use[FunctionName]'

const { result, loading, error, execute } = use[FunctionName]({
  param1: 'example'
})
</script>
\`\`\`

---

## 📝 类型定义

\`\`\`typescript
interface Use[FunctionName]Options {
  param1?: string
}

interface Use[FunctionName]Return<T = any> {
  result: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  execute: () => Promise<T>
}
\`\`\`

---

## ⚠️ 注意事项

### 使用限制

- [ ] 必须在Vue 3 setup函数或\`<script setup>\`中使用

### 性能考虑

- [ ] 避免在模板中直接调用execute方法

---

## 📝 更新日志

### v1.0.0 (2025-11-16)

- ✨ 初始版本发布

---

## 📚 相关链接

- [函数源码](../../src/composables/use[FunctionName].ts)

---

**最后更新**：2025-11-16
**维护责任人**：[函数开发者]
**联系方式**：[开发者邮箱]`
  }

  /**
   * 获取页面文档模板
   * @returns {string} 模板字符串
   */
  getPageTemplate() {
    return `---
title: [PAGE NAME] PAGE
version: v1.0.0
last_updated: 2025-11-16
status: draft
category: technical
tags: [vue, page, [page-type]]
---

# [页面名称]页面文档

> **版本**：v1.0.0
> **更新日期**：2025-11-16
> **适用范围**：[页面适用场景]
> **关键词**：[关键词列表]

---

## 📋 目录

- [概述](#概述)
- [功能特性](#功能特性)
- [路由配置](#路由配置)
- [页面结构](#页面结构)
- [使用方法](#使用方法)
- [数据流](#数据流)
- [权限控制](#权限控制)
- [注意事项](#注意事项)
- [更新日志](#更新日志)

---

## 📖 概述

### 页面介绍

[页面的详细介绍，包括主要功能和业务场景]

### 设计目标

[页面的设计目标和用户价值]

### 技术栈

- **框架**：Vue 3 + TypeScript
- **UI库**：Element Plus

---

## ✨ 功能特性

- [ ] **特性1**：特性描述
- [ ] **特性2**：特性描述

---

## 🛣️ 路由配置

### 路由信息

| 属性 | 值 |
|------|-----|
| 路径 | \`/path/to/page\` |
| 名称 | \`PageName\` |
| 组件 | \`pages/pageName/index.vue\` |

---

## 🏗️ 页面结构

### 组件层次

\`\`\`
PageName/
├── index.vue          # 主页面组件
└── components/        # 页面专用组件
\`\`\`

### 主组件结构

\`\`\`vue
<template>
  <div class="page-container">
    <!-- 页面内容 -->
    <PageContent :data="pageData" />
  </div>
</template>

<script setup lang="ts">
// 页面逻辑
</script>
\`\`\`

---

## 📖 使用方法

### 基础用法

\`\`\`vue
<template>
  <PageName />
</template>
\`\`\`

---

## 🔄 数据流

### 数据获取

\`\`\`typescript
const { data, loading, error, loadData } = usePageData()

onMounted(() => {
  loadData()
})
\`\`\`

---

## 🔐 权限控制

### 页面权限

| 权限 | 说明 |
|------|------|
| 查看权限 | 可以访问页面 |

---

## ⚠️ 注意事项

### 性能优化

- [ ] 列表页面使用虚拟滚动

---

## 📝 更新日志

### v1.0.0 (2025-11-16)

- ✨ 初始版本发布

---

## 📚 相关链接

- [页面源码](../../src/pages/pageName/index.vue)

---

**最后更新**：2025-11-16
**维护责任人**：[页面开发者]
**联系方式**：[开发者邮箱]`
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length < 3) {
    console.log('用法:')
    console.log('  生成组件文档: npm run docs:generate -- --type component --name ComponentName')
    console.log('  生成组合式函数文档: npm run docs:generate -- --type composable --name useFunctionName')
    console.log('  生成页面文档: npm run docs:generate -- --type page --name PageName')
    process.exit(1)
  }

  const generator = new FrontendDocGenerator()
  const type = args[1]
  const name = args[3]

  try {
    switch (type) {
      case 'component':
        const componentPath = `src/components/${name}.vue`
        const componentOutput = `docs/technical/frontend/components/${name.toUpperCase()}.md`
        await generator.generateComponentDoc(componentPath, componentOutput)
        break

      case 'composable':
        const composablePath = `src/composables/${name}.ts`
        const composableOutput = `docs/technical/frontend/composables/${name.toUpperCase()}.md`
        await generator.generateComposableDoc(composablePath, composableOutput)
        break

      case 'page':
        const pagePath = `src/pages/${name}/index.vue`
        const pageOutput = `docs/technical/frontend/pages/${name.toUpperCase()}_PAGE.md`
        await generator.generatePageDoc(pagePath, pageOutput)
        break

      default:
        console.error(`❌ 不支持的类型: ${type}`)
        process.exit(1)
    }

    console.log('✅ 文档生成完成！')

  } catch (error) {
    console.error('❌ 文档生成失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 执行出错:', error)
    process.exit(1)
  })
}

module.exports = FrontendDocGenerator
