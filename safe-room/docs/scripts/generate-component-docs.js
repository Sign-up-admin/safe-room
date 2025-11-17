#!/usr/bin/env node

/**
 * 组件文档生成工具
 *
 * 支持多框架组件文档生成，包括：
 * - Vue 组件文档生成
 * - React 组件文档生成
 * - Angular 组件文档生成
 * - Web Components 文档生成
 * - 组件API文档生成
 * - 组件使用示例生成
 *
 * 使用方法：
 * node generate-component-docs.js [options]
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

class ComponentDocGenerator {
  constructor() {
    this.templates = {}
    this.loadTemplates()
  }

  /**
   * 加载文档模板
   */
  loadTemplates() {
    const templateDir = path.join(__dirname, '../templates')

    // 加载组件模板
    const componentTemplatePath = path.join(templateDir, 'web-components-template.md')
    if (fs.existsSync(componentTemplatePath)) {
      this.templates.webComponents = fs.readFileSync(componentTemplatePath, 'utf-8')
    }

    console.log('Templates loaded:', Object.keys(this.templates))
  }

  /**
   * 生成组件文档
   */
  async generateComponentDocs(options = {}) {
    const {
      sourceDir = 'src/components',
      outputDir = 'docs/technical/frontend/components',
      frameworks = ['vue', 'react', 'angular', 'web-components'],
      includeExamples = true,
      includeTests = true
    } = options

    console.log('Generating component documentation...')
    console.log('Source directory:', sourceDir)
    console.log('Output directory:', outputDir)
    console.log('Frameworks:', frameworks.join(', '))

    // 扫描组件文件
    const components = await this.scanComponents(sourceDir, frameworks)

    console.log(`Found ${components.length} components`)

    // 生成文档
    for (const component of components) {
      await this.generateComponentDoc(component, outputDir, {
        includeExamples,
        includeTests,
        frameworks
      })
    }

    // 生成组件索引
    await this.generateComponentIndex(components, outputDir)

    console.log('Component documentation generation completed!')
  }

  /**
   * 扫描组件文件
   */
  async scanComponents(sourceDir, frameworks) {
    const components = []

    for (const framework of frameworks) {
      const pattern = this.getComponentFilePattern(framework, sourceDir)
      const files = await glob(pattern, { cwd: process.cwd() })

      for (const file of files) {
        const component = await this.parseComponentFile(file, framework)
        if (component) {
          components.push(component)
        }
      }
    }

    return components
  }

  /**
   * 获取组件文件匹配模式
   */
  getComponentFilePattern(framework, sourceDir) {
    const patterns = {
      vue: `${sourceDir}/**/*.vue`,
      react: `${sourceDir}/**/*.{tsx,jsx,ts,js}`,
      angular: `${sourceDir}/**/*.component.{ts,js}`,
      'web-components': `${sourceDir}/**/*.{ts,js}`
    }

    return patterns[framework] || `${sourceDir}/**/*.{ts,js,vue,tsx,jsx}`
  }

  /**
   * 解析组件文件
   */
  async parseComponentFile(filePath, framework) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const component = {
        name: this.extractComponentName(filePath, content, framework),
        framework,
        filePath,
        props: [],
        events: [],
        slots: [],
        methods: [],
        description: '',
        examples: []
      }

      // 根据框架解析组件信息
      switch (framework) {
        case 'vue':
          this.parseVueComponent(content, component)
          break
        case 'react':
          this.parseReactComponent(content, component)
          break
        case 'angular':
          this.parseAngularComponent(content, component)
          break
        case 'web-components':
          this.parseWebComponent(content, component)
          break
      }

      return component
    } catch (error) {
      console.warn(`Failed to parse component ${filePath}:`, error.message)
      return null
    }
  }

  /**
   * 提取组件名称
   */
  extractComponentName(filePath, content, framework) {
    const fileName = path.basename(filePath, path.extname(filePath))

    // 从文件名提取组件名
    let componentName = fileName
      .replace(/\.component$/, '')
      .replace(/Component$/, '')
      .replace(/^[a-z]/, c => c.toUpperCase())
      .replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase())

    // 尝试从代码中提取更准确的名称
    switch (framework) {
      case 'vue':
        const vueMatch = content.match(/name:\s*['"]([^'"]+)['"]/)
        if (vueMatch) componentName = vueMatch[1]
        break
      case 'react':
        const reactMatch = content.match(/function\s+(\w+)|const\s+(\w+)\s*=\s*\(/)
        if (reactMatch) componentName = reactMatch[1] || reactMatch[2]
        break
      case 'angular':
        const angularMatch = content.match(/selector:\s*['"]([^'"]+)['"]/)
        if (angularMatch) componentName = angularMatch[1].replace(/^\[|\]$/, '')
        break
      case 'web-components':
        const wcMatch = content.match(/customElements\.define\(\s*['"]([^'"]+)['"]/)
        if (wcMatch) componentName = wcMatch[1]
        break
    }

    return componentName
  }

  /**
   * 解析Vue组件
   */
  parseVueComponent(content, component) {
    // 解析props
    const propsMatch = content.match(/props:\s*\{([^}]+)\}/s)
    if (propsMatch) {
      const propsContent = propsMatch[1]
      const propMatches = propsContent.matchAll(/(\w+):\s*\{([^}]+)\}/g)
      for (const match of propMatches) {
        const [, name, config] = match
        component.props.push({
          name,
          type: this.extractTypeFromConfig(config),
          default: this.extractDefaultFromConfig(config),
          required: config.includes('required: true'),
          description: this.extractDescription(content, name)
        })
      }
    }

    // 解析events
    const emitMatch = content.match(/emits:\s*\[([^\]]+)\]/)
    if (emitMatch) {
      const events = emitMatch[1].split(',').map(e => e.trim().replace(/['"]/g, ''))
      component.events = events.map(event => ({
        name: event,
        description: this.extractDescription(content, event)
      }))
    }

    // 解析methods
    const methodsMatch = content.match(/methods:\s*\{([^}]+)\}/s)
    if (methodsMatch) {
      const methodsContent = methodsMatch[1]
      const methodMatches = methodsContent.matchAll(/(\w+)\s*\(/g)
      for (const match of methodMatches) {
        component.methods.push({
          name: match[1],
          description: this.extractDescription(content, match[1])
        })
      }
    }
  }

  /**
   * 解析React组件
   */
  parseReactComponent(content, component) {
    // 解析props接口
    const interfaceMatch = content.match(/interface\s+\w*Props\s*\{([^}]+)\}/s)
    if (interfaceMatch) {
      const propsContent = interfaceMatch[1]
      const propMatches = propsContent.matchAll(/(\w+)(\??):\s*([^;]+);?\s*\/\/?\s*(.*)?$/gm)
      for (const match of propMatches) {
        const [, name, optional, type, comment] = match
        component.props.push({
          name,
          type: this.normalizeTypeScriptType(type),
          required: !optional,
          description: comment || ''
        })
      }
    }

    // 解析事件处理
    const eventMatches = content.matchAll(/on(\w+)\??:\s*\([^)]*\)\s*=>\s*void/g)
    for (const match of eventMatches) {
      const eventName = match[1].charAt(0).toLowerCase() + match[1].slice(1)
      component.events.push({
        name: eventName,
        description: `Triggered when ${eventName} occurs`
      })
    }
  }

  /**
   * 解析Angular组件
   */
  parseAngularComponent(content, component) {
    // 解析@Input装饰器
    const inputMatches = content.matchAll(/@Input\(\)\s+(\w+)(\??):\s*([^;]+);?\s*\/\/?\s*(.*)?$/gm)
    for (const match of inputMatches) {
      const [, name, optional, type, comment] = match
      component.props.push({
        name,
        type: this.normalizeTypeScriptType(type),
        required: !optional,
        description: comment || ''
      })
    }

    // 解析@Output装饰器
    const outputMatches = content.matchAll(/@Output\(\)\s+(\w+)\s*=\s*new\s+EventEmitter/g)
    for (const match of outputMatches) {
      component.events.push({
        name: match[1],
        description: `Emitted when ${match[1]} event occurs`
      })
    }
  }

  /**
   * 解析Web Components
   */
  parseWebComponent(content, component) {
    // 解析observedAttributes
    const attributesMatch = content.match(/observedAttributes[^}]+return\s*\[([^\]]+)\]/s)
    if (attributesMatch) {
      const attributes = attributesMatch[1].split(',').map(attr => attr.trim().replace(/['"]/g, ''))
      component.props = attributes.map(attr => ({
        name: attr,
        type: 'string',
        required: false,
        description: `Attribute: ${attr}`
      }))
    }

    // 解析自定义事件
    const eventMatches = content.matchAll(/dispatchEvent\(new\s+CustomEvent\(\s*['"]([^'"]+)['"]/g)
    for (const match of eventMatches) {
      component.events.push({
        name: match[1],
        description: `Custom event: ${match[1]}`
      })
    }
  }

  /**
   * 生成组件文档
   */
  async generateComponentDoc(component, outputDir, options) {
    const { frameworks } = options

    // 创建输出目录
    const componentDir = path.join(outputDir, component.name.toUpperCase())
    fs.mkdirSync(componentDir, { recursive: true })

    // 生成框架特定的文档
    for (const framework of frameworks) {
      if (component.framework === framework) {
        const docContent = this.generateFrameworkDoc(component, framework)
        const fileName = `${component.name.toUpperCase()}.md`
        const filePath = path.join(componentDir, fileName)

        fs.writeFileSync(filePath, docContent, 'utf-8')
        console.log(`Generated: ${filePath}`)
      }
    }
  }

  /**
   * 生成框架特定的文档
   */
  generateFrameworkDoc(component, framework) {
    const template = this.templates.webComponents || this.getDefaultTemplate()

    let content = template
      .replace(/\{\{ComponentName\}\}/g, component.name)
      .replace(/\{\{component-name\}\}/g, this.toKebabCase(component.name))
      .replace(/\{\{version\}\}/g, '1.0.0')
      .replace(/\{\{status\}\}/g, 'active')
      .replace(/\{\{tag-name\}\}/g, `custom-${this.toKebabCase(component.name)}`)

    // 生成API文档
    content = this.insertApiDocumentation(content, component)

    return content
  }

  /**
   * 插入API文档
   */
  insertApiDocumentation(content, component) {
    // 生成属性表格
    if (component.props.length > 0) {
      const propsTable = this.generatePropsTable(component.props)
      content = content.replace(
        /\| 属性名 \| 类型 \| 默认值 \| 必需 \| 描述 \|[\s\S]*?\|/m,
        `| 属性名 | 类型 | 默认值 | 必需 | 描述 |\n|--------|------|--------|------|------|\n${propsTable}`
      )
    }

    // 生成事件表格
    if (component.events.length > 0) {
      const eventsTable = this.generateEventsTable(component.events)
      content = content.replace(
        /\| 事件名 \| 描述 \| 事件详情 \|[\s\S]*?\|/m,
        `| 事件名 | 描述 | 事件详情 |\n|--------|------|----------|\n${eventsTable}`
      )
    }

    // 生成方法表格
    if (component.methods.length > 0) {
      const methodsTable = this.generateMethodsTable(component.methods)
      content = content.replace(
        /\| 方法名 \| 参数 \| 返回值 \| 描述 \|[\s\S]*?\|/m,
        `| 方法名 | 参数 | 返回值 | 描述 |\n|--------|------|--------|------|\n${methodsTable}`
      )
    }

    return content
  }

  /**
   * 生成属性表格
   */
  generatePropsTable(props) {
    return props.map(prop =>
      `| ${prop.name} | \`${prop.type}\` | \`${prop.default || '-'}\` | ${prop.required ? '是' : '否'} | ${prop.description} |`
    ).join('\n')
  }

  /**
   * 生成事件表格
   */
  generateEventsTable(events) {
    return events.map(event =>
      `| ${event.name} | ${event.description} | \`{ detail: {} }\` |`
    ).join('\n')
  }

  /**
   * 生成方法表格
   */
  generateMethodsTable(methods) {
    return methods.map(method =>
      `| ${method.name} | \`()\` | \`void\` | ${method.description} |`
    ).join('\n')
  }

  /**
   * 生成组件索引
   */
  async generateComponentIndex(components, outputDir) {
    const indexContent = `# 前端组件文档索引

> **版本**：v1.0.0
> **更新日期**：${new Date().toISOString().split('T')[0]}
> **适用范围**：前端开发团队
> **状态**：active

---

## 📋 组件列表

| 组件名称 | 框架 | 状态 | 文档链接 |
|----------|------|------|----------|
${components.map(comp =>
  `| ${comp.name} | ${comp.framework} | active | [查看文档](${comp.name.toUpperCase()}/${comp.name.toUpperCase()}.md) |`
).join('\n')}

---

## 📊 统计信息

- **总组件数**：${components.length}
- **Vue组件**：${components.filter(c => c.framework === 'vue').length}
- **React组件**：${components.filter(c => c.framework === 'react').length}
- **Angular组件**：${components.filter(c => c.framework === 'angular').length}
- **Web Components**：${components.filter(c => c.framework === 'web-components').length}

---

*此索引由组件文档生成工具自动生成，请勿手动修改。*
`

    const indexPath = path.join(outputDir, 'INDEX.md')
    fs.writeFileSync(indexPath, indexContent, 'utf-8')
    console.log(`Generated component index: ${indexPath}`)
  }

  /**
   * 工具方法
   */
  extractTypeFromConfig(config) {
    const typeMatch = config.match(/type:\s*(\w+)/)
    return typeMatch ? typeMatch[1].toLowerCase() : 'string'
  }

  extractDefaultFromConfig(config) {
    const defaultMatch = config.match(/default:\s*([^,\n}]+)/)
    return defaultMatch ? defaultMatch[1].trim() : undefined
  }

  extractDescription(content, name) {
    // 查找注释
    const commentPattern = new RegExp(`//\\s*${name}[:\\s]*([^\\n]+)`, 'i')
    const commentMatch = content.match(commentPattern)
    return commentMatch ? commentMatch[1].trim() : `${name}属性`
  }

  normalizeTypeScriptType(type) {
    return type.replace(/\|/g, '\\|').trim()
  }

  toKebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
  }

  getDefaultTemplate() {
    return `# {{ComponentName}} 组件文档

> **版本**：{{version}}
> **状态**：{{status}}

## 基本信息

- **组件名称**: {{ComponentName}}
- **标签名**: <{{tag-name}}>
- **框架**: {{framework}}

## API 参考

### 属性 (Attributes/Properties)

| 属性名 | 类型 | 默认值 | 必需 | 描述 |
|--------|------|--------|------|------|
| 属性名 | 类型 | 默认值 | 必需 | 描述 |

### 事件 (Events)

| 事件名 | 描述 | 事件详情 |
|--------|------|----------|
| 事件名 | 描述 | 事件详情 |

### 方法 (Methods)

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| 方法名 | 参数 | 返回值 | 描述 |

## 使用示例

### 基本用法

\`\`\`html
<{{tag-name}}>
  <!-- 组件内容 -->
</{{tag-name}}>
\`\`\`

---

*本文档由组件文档生成工具自动生成。*
`
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2)
  const options = {}

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true
      options[key] = value
    }
  }

  const generator = new ComponentDocGenerator()

  try {
    await generator.generateComponentDocs({
      sourceDir: options.source || 'src/components',
      outputDir: options.output || 'docs/technical/frontend/components',
      frameworks: options.frameworks ? options.frameworks.split(',') : ['vue', 'react', 'angular', 'web-components'],
      includeExamples: options.examples !== false,
      includeTests: options.tests !== false
    })

    console.log('✅ Component documentation generated successfully!')
  } catch (error) {
    console.error('❌ Failed to generate component documentation:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = ComponentDocGenerator
