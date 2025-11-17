#!/usr/bin/env node

/**
 * Front前端文档索引工具
 * 自动生成和更新文档索引
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

class FrontendDocIndexer {
  constructor() {
    this.documents = []
  }

  /**
   * 扫描文档目录
   * @param {string} pattern - 扫描模式
   * @returns {Array} 文档列表
   */
  async scanDocuments(pattern) {
    try {
      const files = await glob(pattern, { cwd: process.cwd() })
      const documents = []

      for (const file of files) {
        const docInfo = await this.parseDocument(file)
        if (docInfo) {
          documents.push(docInfo)
        }
      }

      return documents
    } catch (error) {
      console.error(`❌ 扫描文档失败: ${error.message}`)
      return []
    }
  }

  /**
   * 解析文档信息
   * @param {string} filePath - 文件路径
   * @returns {Object|null} 文档信息
   */
  async parseDocument(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')

      // 解析头部信息
      const headerMatch = content.match(/^---\n([\s\S]*?)\n---/)
      if (!headerMatch) {
        return null
      }

      const header = headerMatch[1]
      const headerLines = header.split('\n')
      const metadata = {}

      for (const line of headerLines) {
        const match = line.match(/^(\w+):\s*(.+)$/)
        if (match) {
          const [, key, value] = match
          metadata[key] = value.trim()
        }
      }

      // 解析标题
      const titleLine = lines.find(line => line.startsWith('# '))
      const title = titleLine ? titleLine.substring(2).trim() : metadata.title || '未命名文档'

      return {
        filePath,
        title,
        metadata,
        category: metadata.category || 'unknown',
        status: metadata.status || 'unknown',
        lastUpdated: metadata.last_updated || 'unknown'
      }

    } catch (error) {
      console.warn(`⚠️ 解析文档失败 ${filePath}: ${error.message}`)
      return null
    }
  }

  /**
   * 生成技术文档索引
   * @param {string} outputPath - 输出路径
   */
  async generateTechnicalIndex(outputPath = 'docs/technical/frontend/INDEX.md') {
    console.log('🔍 扫描技术文档...')

    const patterns = [
      'docs/technical/frontend/**/*.md'
    ]

    const documents = []
    for (const pattern of patterns) {
      const docs = await this.scanDocuments(pattern)
      documents.push(...docs)
    }

    // 按子目录分组
    const grouped = this.groupDocumentsByCategory(documents)

    // 生成索引内容
    let content = this.getTechnicalIndexTemplate()

    // 填充架构文档
    if (grouped.architecture && grouped.architecture.length > 0) {
      content = content.replace(
        '| [FRONTEND_ARCHITECTURE_OVERVIEW.md](architecture/FRONTEND_ARCHITECTURE_OVERVIEW.md) | Front前端整体架构概览 | ✅ 已创建 |',
        this.generateDocumentTable(grouped.architecture, 'architecture/')
      )
    }

    // 填充组件文档
    if (grouped.components && grouped.components.length > 0) {
      const componentTable = this.generateDocumentTable(grouped.components, 'components/')
      content = content.replace(
        '#### 主要组件列表',
        `#### 主要组件列表\n\n${componentTable}\n\n**统计**：共${grouped.components.length}个组件文档`
      )
    }

    // 填充组合式函数文档
    if (grouped.composables && grouped.composables.length > 0) {
      const composableTable = this.generateDocumentTable(grouped.composables, 'composables/')
      content = content.replace(
        '### 主要组合式函数列表',
        `### 主要组合式函数列表\n\n${composableTable}\n\n**统计**：共${grouped.composables.length}个函数文档`
      )
    }

    // 填充API文档
    if (grouped.api && grouped.api.length > 0) {
      const apiTable = this.generateDocumentTable(grouped.api, 'api/')
      content = content.replace(
        '### API文档列表',
        `### API文档列表\n\n${apiTable}\n\n**统计**：共${grouped.api.length}个API文档`
      )
    }

    // 填充类型定义文档
    if (grouped.types && grouped.types.length > 0) {
      const typesTable = this.generateDocumentTable(grouped.types, 'types/')
      content = content.replace(
        '### 主要类型定义',
        `### 主要类型定义\n\n${typesTable}\n\n**统计**：共${grouped.types.length}个类型文档`
      )
    }

    // 更新统计信息
    const totalDocs = documents.length
    content = content.replace('**总文档数**：预估150+个', `**总文档数**：${totalDocs}个`)
    content = content.replace('**已创建**：1个 (架构概览)', `**已创建**：${totalDocs}个`)
    content = content.replace('**待创建**：149+个', `**待创建**：${Math.max(0, 150 - totalDocs)}+个`)

    // 确保目录存在
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(outputPath, content, 'utf-8')
    console.log(`✅ 技术文档索引已更新: ${outputPath}`)
  }

  /**
   * 生成开发文档索引
   * @param {string} outputPath - 输出路径
   */
  async generateDevelopmentIndex(outputPath = 'docs/development/frontend/INDEX.md') {
    console.log('🔍 扫描开发文档...')

    const patterns = [
      'docs/development/frontend/**/*.md'
    ]

    const documents = []
    for (const pattern of patterns) {
      const docs = await this.scanDocuments(pattern)
      documents.push(...docs)
    }

    // 按子目录分组
    const grouped = this.groupDocumentsByCategory(documents)

    // 生成索引内容
    let content = this.getDevelopmentIndexTemplate()

    // 填充指南文档
    if (grouped.guides && grouped.guides.length > 0) {
      const guidesTable = this.generateDocumentTable(grouped.guides, 'guides/')
      content = content.replace(
        '| [FRONTEND_DOCUMENTATION_STANDARDS.md](guides/FRONTEND_DOCUMENTATION_STANDARDS.md) | 文档编写规范和标准 | ✅ 已创建 |',
        guidesTable
      )
    }

    // 填充测试文档
    if (grouped.testing && grouped.testing.length > 0) {
      const testingTable = this.generateDocumentTable(grouped.testing, 'testing/')
      content = content.replace(
        '| [TESTING_STRATEGY.md](testing/TESTING_STRATEGY.md) | 测试策略和计划 | 📝 待创建 |',
        testingTable
      )
    }

    // 填充部署文档
    if (grouped.deployment && grouped.deployment.length > 0) {
      const deploymentTable = this.generateDocumentTable(grouped.deployment, 'deployment/')
      content = content.replace(
        '| [BUILD_DEPLOYMENT.md](deployment/BUILD_DEPLOYMENT.md) | 构建和部署流程 | 📝 待创建 |',
        deploymentTable
      )
    }

    // 确保目录存在
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(outputPath, content, 'utf-8')
    console.log(`✅ 开发文档索引已更新: ${outputPath}`)
  }

  /**
   * 生成报告文档索引
   * @param {string} outputPath - 输出路径
   */
  async generateReportsIndex(outputPath = 'docs/reports/frontend/INDEX.md') {
    console.log('🔍 扫描报告文档...')

    const patterns = [
      'docs/reports/frontend/**/*.md'
    ]

    const documents = []
    for (const pattern of patterns) {
      const docs = await this.scanDocuments(pattern)
      documents.push(...docs)
    }

    // 按子目录分组
    const grouped = this.groupDocumentsByCategory(documents)

    // 生成索引内容
    let content = this.getReportsIndexTemplate()

    // 填充质量报告
    if (grouped.quality && grouped.quality.length > 0) {
      const qualityTable = this.generateDocumentTable(grouped.quality, 'quality/')
      content = content.replace(
        '| [DOC_QUALITY_REPORT.md](quality/DOC_QUALITY_REPORT.md) | 文档质量综合评估报告 | 📝 待创建 |',
        qualityTable
      )
    }

    // 填充覆盖率报告
    if (grouped.coverage && grouped.coverage.length > 0) {
      const coverageTable = this.generateDocumentTable(grouped.coverage, 'coverage/')
      content = content.replace(
        '| [TEST_COVERAGE_REPORT.md](coverage/TEST_COVERAGE_REPORT.md) | 单元测试覆盖率报告 | 📝 待创建 |',
        coverageTable
      )
    }

    // 确保目录存在
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(outputPath, content, 'utf-8')
    console.log(`✅ 报告文档索引已更新: ${outputPath}`)
  }

  /**
   * 按类别分组文档
   * @param {Array} documents - 文档列表
   * @returns {Object} 分组后的文档
   */
  groupDocumentsByCategory(documents) {
    const grouped = {}

    for (const doc of documents) {
      const relativePath = path.relative('docs', doc.filePath)
      const parts = relativePath.split(path.sep)

      if (parts.length >= 3) {
        const category = parts[2] // 如: architecture, components, guides等
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push(doc)
      }
    }

    return grouped
  }

  /**
   * 生成文档表格
   * @param {Array} documents - 文档列表
   * @param {string} basePath - 基础路径
   * @returns {string} 表格字符串
   */
  generateDocumentTable(documents, basePath) {
    return documents.map(doc => {
      const fileName = path.basename(doc.filePath)
      const statusIcon = this.getStatusIcon(doc.metadata.status)
      const relativePath = `${basePath}${fileName}`
      const description = this.extractDescription(doc.filePath) || doc.title

      return `| [${fileName}](${relativePath}) | ${description} | ${statusIcon} |`
    }).join('\n')
  }

  /**
   * 获取状态图标
   * @param {string} status - 状态
   * @returns {string} 图标
   */
  getStatusIcon(status) {
    switch (status) {
      case 'active': return '✅'
      case 'draft': return '📝'
      case 'deprecated': return '⚠️'
      default: return '❓'
    }
  }

  /**
   * 从文档中提取描述
   * @param {string} filePath - 文件路径
   * @returns {string} 描述
   */
  extractDescription(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')

      // 查找关键词行
      const keywordsLine = lines.find(line => line.includes('**关键词**：'))
      if (keywordsLine) {
        return keywordsLine.split('：')[1]?.trim() || ''
      }

      // 查找概述部分
      const overviewIndex = lines.findIndex(line => line.includes('## 📖 概述'))
      if (overviewIndex !== -1 && overviewIndex + 1 < lines.length) {
        return lines[overviewIndex + 1].trim()
      }

    } catch (error) {
      // 忽略错误
    }

    return ''
  }

  /**
   * 获取技术文档索引模板
   * @returns {string} 模板
   */
  getTechnicalIndexTemplate() {
    return `---
title: FRONTEND TECHNICAL DOCUMENTATION INDEX
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
tags: [frontend, technical, documentation, index]
---

# Front前端技术文档索引

> **版本**：v1.0.0
> **更新日期**：2025-11-16
> **适用范围**：Front前端技术文档导航
> **关键词**：技术文档, 前端, 索引, 导航

---

## 📋 目录

- [概述](#概述)
- [架构文档](#架构文档)
- [组件文档](#组件文档)
- [组合式函数文档](#组合式函数文档)
- [API文档](#api文档)
- [类型定义文档](#类型定义文档)
- [文档维护](#文档维护)

---

## 📖 概述

本索引提供Front前端项目技术文档的完整导航，包括架构设计、组件实现、API接口、类型定义等技术层面的详细文档。

### 文档组织结构

\`\`\`
docs/technical/frontend/
├── INDEX.md                    # 技术文档索引（本文件）
├── architecture/               # 架构文档
├── components/                 # 组件文档
├── composables/                # 组合式函数文档
├── api/                        # API文档
└── types/                      # 类型定义文档
\`\`\`

---

## 🏗️ 架构文档

### 核心架构文档

| 文档名称 | 描述 | 状态 |
|----------|------|------|
| [FRONTEND_ARCHITECTURE_OVERVIEW.md](architecture/FRONTEND_ARCHITECTURE_OVERVIEW.md) | Front前端整体架构概览 | ✅ 已创建 |

---

## 🧩 组件文档

#### 主要组件列表

**统计**：共0个组件文档

---

## 🔧 组合式函数文档

### 主要组合式函数列表

**统计**：共0个函数文档

---

## 🔌 API文档

### API文档列表

**统计**：共0个API文档

---

## 📝 类型定义文档

### 主要类型定义

**统计**：共0个类型文档

---

## 🔄 文档维护

### 维护原则

1. **及时更新**：代码变更后及时更新对应文档
2. **质量保证**：所有文档需经过技术审查
3. **版本同步**：文档版本与代码版本保持同步

### 维护流程

1. 开发完成 → 更新技术文档
2. 代码审查 → 文档同步审查
3. 版本发布 → 文档版本更新

### 文档统计

- **总文档数**：预估150+个
- **已创建**：1个 (架构概览)
- **待创建**：149+个
- **完成度**：0.7%

---

## 📚 相关链接

- [Front前端开发文档索引](../development/frontend/INDEX.md)
- [Front前端报告文档索引](../reports/frontend/INDEX.md)
- [文档编写规范](../development/frontend/guides/FRONTEND_DOCUMENTATION_STANDARDS.md)

---

**最后更新**：2025-11-16
**维护责任人**：前端开发团队
**联系方式**：tech-docs@company.com`
  }

  /**
   * 获取开发文档索引模板
   * @returns {string} 模板
   */
  getDevelopmentIndexTemplate() {
    return `---
title: FRONTEND DEVELOPMENT DOCUMENTATION INDEX
version: v1.0.0
last_updated: 2025-11-16
status: active
category: development
tags: [frontend, development, documentation, index]
---

# Front前端开发文档索引

> **版本**：v1.0.0
> **更新日期**：2025-11-16
> **适用范围**：Front前端开发文档导航
> **关键词**：开发文档, 前端, 指南, 索引

---

## 📋 目录

- [概述](#概述)
- [开发指南](#开发指南)
- [测试文档](#测试文档)
- [部署文档](#部署文档)
- [开发工具](#开发工具)

---

## 📖 概述

本索引提供Front前端项目开发相关文档的完整导航，包括开发环境搭建、开发流程、测试策略、部署运维等开发全生命周期的指导文档。

---

## 📚 开发指南

### 环境搭建

| 文档名称 | 描述 | 状态 |
|----------|------|------|
| [FRONTEND_DOCUMENTATION_STANDARDS.md](guides/FRONTEND_DOCUMENTATION_STANDARDS.md) | 文档编写规范和标准 | ✅ 已创建 |

---

## 🧪 测试文档

### 测试策略

| 文档名称 | 描述 | 状态 |
|----------|------|------|
| [TESTING_STRATEGY.md](testing/TESTING_STRATEGY.md) | 测试策略和计划 | 📝 待创建 |

---

## 🚀 部署文档

### 构建部署

| 文档名称 | 描述 | 状态 |
|----------|------|------|
| [BUILD_DEPLOYMENT.md](deployment/BUILD_DEPLOYMENT.md) | 构建和部署流程 | 📝 待创建 |

---

## 🛠️ 开发工具

### 核心工具

- **包管理**：npm/yarn - 依赖管理和脚本运行
- **构建工具**：Vite - 快速构建和开发服务器
- **代码检查**：ESLint - 代码质量检查
- **类型检查**：TypeScript - 类型安全检查

---

## 📚 相关链接

- [Front前端技术文档索引](../technical/frontend/INDEX.md)
- [Front前端报告文档索引](../reports/frontend/INDEX.md)

---

**最后更新**：2025-11-16
**维护责任人**：前端开发团队
**联系方式**：dev-docs@company.com`
  }

  /**
   * 获取报告文档索引模板
   * @returns {string} 模板
   */
  getReportsIndexTemplate() {
    return `---
title: FRONTEND REPORTS DOCUMENTATION INDEX
version: v1.0.0
last_updated: 2025-11-16
status: active
category: reports
tags: [frontend, reports, documentation, index]
---

# Front前端报告文档索引

> **版本**：v1.0.0
> **更新日期**：2025-11-16
> **适用范围**：Front前端报告文档导航
> **关键词**：报告文档, 前端, 质量, 覆盖率

---

## 📋 目录

- [概述](#概述)
- [质量报告](#质量报告)
- [覆盖率报告](#覆盖率报告)
- [其他报告](#其他报告)
- [报告生成](#报告生成)

---

## 📖 概述

本索引提供Front前端项目报告文档的完整导航，包括文档质量分析、代码覆盖率统计等各类报告文档。

---

## 📊 质量报告

### 文档质量报告

| 报告名称 | 描述 | 状态 |
|----------|------|------|
| [DOC_QUALITY_REPORT.md](quality/DOC_QUALITY_REPORT.md) | 文档质量综合评估报告 | 📝 待创建 |

---

## 📈 覆盖率报告

### 测试覆盖率报告

| 报告名称 | 描述 | 状态 |
|----------|------|------|
| [TEST_COVERAGE_REPORT.md](coverage/TEST_COVERAGE_REPORT.md) | 单元测试覆盖率报告 | 📝 待创建 |

---

## 📋 其他报告

### 性能报告

- [ ] 待添加

---

## 🤖 报告生成

### 自动化生成工具

Front前端报告采用自动化生成方式，确保报告的及时性和准确性。

---

## 📚 相关链接

- [Front前端技术文档索引](../technical/frontend/INDEX.md)
- [Front前端开发文档索引](../development/frontend/INDEX.md)

---

**最后更新**：2025-11-16
**维护责任人**：质量保证团队
**联系方式**：qa-reports@company.com`
  }

  /**
   * 更新所有索引
   */
  async updateAllIndexes() {
    try {
      await this.generateTechnicalIndex()
      await this.generateDevelopmentIndex()
      await this.generateReportsIndex()
      console.log('✅ 所有索引更新完成！')
    } catch (error) {
      console.error('❌ 更新索引失败:', error.message)
      throw error
    }
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  const indexer = new FrontendDocIndexer()

  try {
    if (args.length === 0 || args[0] === '--all') {
      // 更新所有索引
      await indexer.updateAllIndexes()
    } else if (args[0] === '--technical') {
      // 更新技术文档索引
      await indexer.generateTechnicalIndex()
    } else if (args[0] === '--development') {
      // 更新开发文档索引
      await indexer.generateDevelopmentIndex()
    } else if (args[0] === '--reports') {
      // 更新报告文档索引
      await indexer.generateReportsIndex()
    } else {
      console.log('用法:')
      console.log('  更新所有索引: npm run docs:index')
      console.log('  更新技术文档索引: npm run docs:index -- --technical')
      console.log('  更新开发文档索引: npm run docs:index -- --development')
      console.log('  更新报告文档索引: npm run docs:index -- --reports')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ 索引更新失败:', error.message)
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

module.exports = FrontendDocIndexer
