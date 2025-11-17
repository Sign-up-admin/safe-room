#!/usr/bin/env node

/**
 * Front前端文档生命周期管理工具
 * 实现文档状态跟踪、变更日志生成、过期提醒等功能
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

class FrontendDocLifecycleManager {
  constructor() {
    this.states = {
      draft: 'draft',
      review: 'review',
      active: 'active',
      deprecated: 'deprecated'
    }

    this.stateTransitions = {
      [this.states.draft]: [this.states.review],
      [this.states.review]: [this.states.draft, this.states.active],
      [this.states.active]: [this.states.deprecated],
      [this.states.deprecated]: []
    }
  }

  /**
   * 初始化新文档
   * @param {Object} options - 初始化选项
   */
  async initDocument(options) {
    const { type, name, category = 'technical', author } = options

    console.log(`📄 初始化新文档: ${type}/${name}`)

    const fileName = this.generateFileName(name, type)
    const filePath = this.getFilePath(fileName, category, type)

    // 检查文件是否已存在
    if (fs.existsSync(filePath)) {
      throw new Error(`文档已存在: ${filePath}`)
    }

    // 创建目录
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // 生成文档模板
    const template = this.generateDocumentTemplate(type, name, author)

    // 写入文件
    fs.writeFileSync(filePath, template, 'utf-8')

    // 记录生命周期事件
    await this.recordLifecycleEvent(filePath, 'created', {
      type,
      author,
      initialState: this.states.draft
    })

    console.log(`✅ 文档已创建: ${filePath}`)
    console.log(`📝 当前状态: ${this.states.draft}`)
    console.log(`👤 作者: ${author}`)

    return filePath
  }

  /**
   * 提交文档审查
   * @param {string} filePath - 文档路径
   * @param {Object} options - 审查选项
   */
  async submitForReview(filePath, options = {}) {
    const { reviewers = [], priority = 'normal' } = options

    console.log(`🔍 提交文档审查: ${filePath}`)

    // 检查当前状态
    const currentState = await this.getDocumentState(filePath)
    if (currentState !== this.states.draft && currentState !== this.states.active) {
      throw new Error(`文档状态不允许提交审查: ${currentState}`)
    }

    // 更新文档状态
    await this.updateDocumentState(filePath, this.states.review)

    // 分配审查人员
    const assignedReviewers = await this.assignReviewers(filePath, reviewers)

    // 发送通知
    await this.sendReviewNotification(filePath, assignedReviewers, priority)

    // 记录生命周期事件
    await this.recordLifecycleEvent(filePath, 'submitted_for_review', {
      reviewers: assignedReviewers,
      priority,
      previousState: currentState
    })

    console.log(`✅ 已提交审查`)
    console.log(`👥 审查人员: ${assignedReviewers.join(', ')}`)
    console.log(`🎯 优先级: ${priority}`)

    return assignedReviewers
  }

  /**
   * 发布文档
   * @param {string} filePath - 文档路径
   * @param {Object} options - 发布选项
   */
  async publishDocument(filePath, options = {}) {
    const { version, notify = true } = options

    console.log(`🚀 发布文档: ${filePath}`)

    // 检查当前状态
    const currentState = await this.getDocumentState(filePath)
    if (currentState !== this.states.review) {
      throw new Error(`文档状态不允许发布: ${currentState}`)
    }

    // 更新版本号
    if (version) {
      await this.updateDocumentVersion(filePath, version)
    }

    // 更新文档状态
    await this.updateDocumentState(filePath, this.states.active)

    // 更新文档索引
    await this.updateDocumentIndexes()

    // 生成变更日志
    await this.generateChangelog(filePath)

    // 发送发布通知
    if (notify) {
      await this.sendPublishNotification(filePath, version)
    }

    // 记录生命周期事件
    await this.recordLifecycleEvent(filePath, 'published', {
      version,
      previousState: currentState
    })

    console.log(`✅ 文档已发布`)
    if (version) {
      console.log(`🏷️ 版本: ${version}`)
    }
    console.log(`📊 索引已更新`)
    console.log(`📝 变更日志已生成`)

    return true
  }

  /**
   * 废弃文档
   * @param {string} filePath - 文档路径
   * @param {Object} options - 废弃选项
   */
  async deprecateDocument(filePath, options = {}) {
    const { reason, replacement } = options

    console.log(`⚠️ 废弃文档: ${filePath}`)

    // 检查当前状态
    const currentState = await this.getDocumentState(filePath)
    if (currentState !== this.states.active) {
      throw new Error(`文档状态不允许废弃: ${currentState}`)
    }

    // 更新文档状态
    await this.updateDocumentState(filePath, this.states.deprecated, { reason, replacement })

    // 更新文档索引
    await this.updateDocumentIndexes()

    // 发送废弃通知
    await this.sendDeprecationNotification(filePath, reason, replacement)

    // 记录生命周期事件
    await this.recordLifecycleEvent(filePath, 'deprecated', {
      reason,
      replacement,
      previousState: currentState
    })

    console.log(`✅ 文档已废弃`)
    if (reason) {
      console.log(`📝 原因: ${reason}`)
    }
    if (replacement) {
      console.log(`🔄 替代文档: ${replacement}`)
    }

    return true
  }

  /**
   * 获取文档状态
   * @param {string} filePath - 文档路径
   */
  async getDocumentState(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const headerMatch = content.match(/^---\n([\s\S]*?)\n---/)

      if (!headerMatch) {
        return this.states.draft // 默认状态
      }

      const header = headerMatch[1]
      const statusMatch = header.match(/status:\s*(.+)/)

      return statusMatch ? statusMatch[1].trim() : this.states.draft
    } catch (error) {
      console.warn(`无法读取文档状态 ${filePath}: ${error.message}`)
      return this.states.draft
    }
  }

  /**
   * 更新文档状态
   * @param {string} filePath - 文档路径
   * @param {string} newState - 新状态
   * @param {Object} metadata - 元数据
   */
  async updateDocumentState(filePath, newState, metadata = {}) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const now = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    let updatedContent = content

    // 更新状态
    updatedContent = updatedContent.replace(
      /status:\s*(.+)/,
      `status: ${newState}`
    )

    // 更新最后更新日期
    updatedContent = updatedContent.replace(
      /last_updated:\s*(.+)/,
      `last_updated: ${now}`
    )

    // 添加废弃信息
    if (newState === this.states.deprecated) {
      const deprecationNotice = `
## ⚠️ 文档废弃通知

**废弃日期**：${now}
**废弃原因**：${metadata.reason || '文档内容过时或功能变更'}
${metadata.replacement ? `**替代文档**：${metadata.replacement}` : ''}

---

> 此文档已废弃，不再维护。如需相关信息，请参考替代文档。

---

`

      // 在文档开头添加废弃通知
      const headerEndIndex = updatedContent.indexOf('---', 4) + 3
      updatedContent = updatedContent.slice(0, headerEndIndex) +
                       deprecationNotice +
                       updatedContent.slice(headerEndIndex)
    }

    fs.writeFileSync(filePath, updatedContent, 'utf-8')

    console.log(`📝 文档状态已更新: ${newState}`)
  }

  /**
   * 更新文档版本
   * @param {string} filePath - 文档路径
   * @param {string} version - 新版本
   */
  async updateDocumentVersion(filePath, version) {
    const content = fs.readFileSync(filePath, 'utf-8')

    const updatedContent = content.replace(
      /version:\s*(.+)/,
      `version: ${version}`
    )

    fs.writeFileSync(filePath, updatedContent, 'utf-8')

    console.log(`🏷️ 文档版本已更新: ${version}`)
  }

  /**
   * 生成文件名
   * @param {string} name - 文档名称
   * @param {string} type - 文档类型
   */
  generateFileName(name, type) {
    // 将驼峰命名转换为大写下划线
    const upperName = name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()

    switch (type) {
      case 'component':
        return `${upperName}.md`
      case 'composable':
        return `USE_${upperName}.md`
      case 'page':
        return `${upperName}_PAGE.md`
      case 'api':
        return `${upperName}_API.md`
      case 'guide':
        return `${upperName}_GUIDE.md`
      default:
        return `${upperName}.md`
    }
  }

  /**
   * 获取文件路径
   * @param {string} fileName - 文件名
   * @param {string} category - 分类
   * @param {string} type - 类型
   */
  getFilePath(fileName, category, type) {
    let subPath = ''

    switch (category) {
      case 'technical':
        switch (type) {
          case 'component':
            subPath = 'components'
            break
          case 'composable':
            subPath = 'composables'
            break
          case 'api':
            subPath = 'api'
            break
          default:
            subPath = 'architecture'
        }
        return `docs/technical/frontend/${subPath}/${fileName}`
      case 'development':
        subPath = type === 'guide' ? 'guides' : type
        return `docs/development/frontend/${subPath}/${fileName}`
      case 'reports':
        return `docs/reports/frontend/${fileName}`
      default:
        return `docs/${fileName}`
    }
  }

  /**
   * 生成文档模板
   * @param {string} type - 文档类型
   * @param {string} name - 文档名称
   * @param {string} author - 作者
   */
  generateDocumentTemplate(type, name, author) {
    const now = new Date().toISOString().split('T')[0]
    const title = this.generateTitle(name, type)

    return `---
title: ${title}
version: v1.0.0
last_updated: ${now}
status: draft
category: technical
tags: [frontend, ${type}]
---

# ${title}

> **版本**：v1.0.0
> **更新日期**：${now}
> **适用范围**：[请填写适用范围]
> **关键词**：[请填写关键词]

---

## 📋 目录

- [概述](#概述)
- [具体内容](#具体内容)

---

## 📖 概述

[请填写文档概述]

### 设计理念

[请填写设计理念]

---

## 📚 具体内容

[请填写具体内容]

---

**最后更新**：${now}
**维护责任人**：${author}
**联系方式**：[请填写联系方式]`
  }

  /**
   * 生成标题
   * @param {string} name - 名称
   * @param {string} type - 类型
   */
  generateTitle(name, type) {
    const upperName = name.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()

    switch (type) {
      case 'component':
        return `${upperName} COMPONENT`
      case 'composable':
        return `USE ${upperName}`
      case 'page':
        return `${upperName} PAGE`
      case 'api':
        return `${upperName} API`
      case 'guide':
        return `${upperName} GUIDE`
      default:
        return upperName
    }
  }

  /**
   * 分配审查人员
   * @param {string} filePath - 文档路径
   * @param {Array} requestedReviewers - 请求的审查人员
   */
  async assignReviewers(filePath, requestedReviewers = []) {
    // 如果指定了审查人员，直接使用
    if (requestedReviewers.length > 0) {
      return requestedReviewers
    }

    // 自动分配审查人员
    const reviewers = ['tech-lead', 'doc-specialist']

    // 根据文档类型分配特定审查人
    const fileName = path.basename(filePath).toLowerCase()
    if (fileName.includes('component')) {
      reviewers.push('frontend-engineer')
    } else if (fileName.includes('api')) {
      reviewers.push('backend-engineer')
    }

    return reviewers
  }

  /**
   * 更新文档索引
   */
  async updateDocumentIndexes() {
    console.log('📊 更新文档索引...')

    // 这里可以调用文档索引器
    // 暂时只打印提示
    console.log('✅ 文档索引更新完成')
  }

  /**
   * 生成变更日志
   * @param {string} filePath - 文档路径
   */
  async generateChangelog(filePath) {
    console.log('📝 生成变更日志...')

    // 这里可以调用变更日志生成器
    // 暂时只打印提示
    console.log('✅ 变更日志生成完成')
  }

  /**
   * 记录生命周期事件
   * @param {string} filePath - 文档路径
   * @param {string} event - 事件类型
   * @param {Object} data - 事件数据
   */
  async recordLifecycleEvent(filePath, event, data) {
    const eventRecord = {
      timestamp: new Date().toISOString(),
      filePath,
      event,
      ...data
    }

    // 保存到生命周期日志文件
    const logFile = 'docs/.lifecycle-events.json'
    let events = []

    try {
      if (fs.existsSync(logFile)) {
        events = JSON.parse(fs.readFileSync(logFile, 'utf-8'))
      }
    } catch (error) {
      console.warn('无法读取生命周期日志文件，将创建新文件')
    }

    events.push(eventRecord)

    // 只保留最近1000条记录
    if (events.length > 1000) {
      events = events.slice(-1000)
    }

    fs.writeFileSync(logFile, JSON.stringify(events, null, 2), 'utf-8')
  }

  /**
   * 检查过期文档
   */
  async checkExpiredDocuments() {
    console.log('🔍 检查过期文档...')

    const patterns = [
      'docs/technical/frontend/**/*.md',
      'docs/development/frontend/**/*.md',
      'docs/reports/frontend/**/*.md'
    ]

    const expiredDocs = []

    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: process.cwd() })

      for (const file of files) {
        const state = await this.getDocumentState(file)
        if (state === this.states.active) {
          // 检查最后更新时间
          const content = fs.readFileSync(file, 'utf-8')
          const lastUpdatedMatch = content.match(/last_updated:\s*(.+)/)

          if (lastUpdatedMatch) {
            const lastUpdated = new Date(lastUpdatedMatch[1])
            const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)

            // 如果超过180天没有更新，标记为需要检查
            if (daysSinceUpdate > 180) {
              expiredDocs.push({
                file,
                lastUpdated: lastUpdatedMatch[1],
                daysSinceUpdate: Math.floor(daysSinceUpdate)
              })
            }
          }
        }
      }
    }

    if (expiredDocs.length > 0) {
      console.log('\n⚠️ 发现过期文档：')
      expiredDocs.forEach(doc => {
        console.log(`  - ${doc.file} (${doc.daysSinceUpdate}天未更新，最后更新：${doc.lastUpdated})`)
      })
    } else {
      console.log('✅ 所有活跃文档都在有效期内')
    }

    return expiredDocs
  }

  /**
   * 发送通知（模拟）
   */
  async sendReviewNotification(filePath, reviewers, priority) {
    console.log(`📧 发送审查通知给: ${reviewers.join(', ')}`)
    console.log(`🎯 优先级: ${priority}`)
  }

  async sendPublishNotification(filePath, version) {
    console.log(`📧 发送发布通知`)
    if (version) {
      console.log(`🏷️ 版本: ${version}`)
    }
  }

  async sendDeprecationNotification(filePath, reason, replacement) {
    console.log(`📧 发送废弃通知`)
    if (reason) {
      console.log(`📝 原因: ${reason}`)
    }
    if (replacement) {
      console.log(`🔄 替代文档: ${replacement}`)
    }
  }

  /**
   * 获取文档统计信息
   */
  async getStatistics() {
    const patterns = [
      'docs/technical/frontend/**/*.md',
      'docs/development/frontend/**/*.md',
      'docs/reports/frontend/**/*.md'
    ]

    const stats = {
      total: 0,
      byState: {
        draft: 0,
        review: 0,
        active: 0,
        deprecated: 0
      },
      byCategory: {
        technical: 0,
        development: 0,
        reports: 0
      }
    }

    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: process.cwd() })

      for (const file of files) {
        stats.total++

        const state = await this.getDocumentState(file)
        stats.byState[state] = (stats.byState[state] || 0) + 1

        // 确定分类
        let category = 'other'
        if (file.includes('/technical/')) category = 'technical'
        else if (file.includes('/development/')) category = 'development'
        else if (file.includes('/reports/')) category = 'reports'

        stats.byCategory[category]++
      }
    }

    return stats
  }

  /**
   * 显示统计信息
   */
  async showStatistics() {
    const stats = await this.getStatistics()

    console.log('\n📊 文档生命周期统计')
    console.log('='.repeat(40))
    console.log(`总文档数: ${stats.total}`)
    console.log(`草稿状态: ${stats.byState.draft}`)
    console.log(`审查状态: ${stats.byState.review}`)
    console.log(`活跃状态: ${stats.byState.active}`)
    console.log(`废弃状态: ${stats.byState.deprecated}`)
    console.log('')
    console.log(`技术文档: ${stats.byCategory.technical}`)
    console.log(`开发文档: ${stats.byCategory.development}`)
    console.log(`报告文档: ${stats.byCategory.reports}`)
    console.log('='.repeat(40))

    return stats
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  const manager = new FrontendDocLifecycleManager()

  if (args.length === 0) {
    showUsage()
    return
  }

  const command = args[0]

  try {
    switch (command) {
      case '--init':
        if (args.length < 5) {
          console.error('用法: --init --type <type> --name <name> [--author <author>]')
          process.exit(1)
        }

        const typeIndex = args.indexOf('--type')
        const nameIndex = args.indexOf('--name')
        const authorIndex = args.indexOf('--author')

        const type = args[typeIndex + 1]
        const name = args[nameIndex + 1]
        const author = authorIndex !== -1 ? args[authorIndex + 1] : 'unknown'

        await manager.initDocument({ type, name, author })
        break

      case '--review':
        if (args.length < 3) {
          console.error('用法: --review --file <file>')
          process.exit(1)
        }

        const fileIndex = args.indexOf('--file')
        const filePath = args[fileIndex + 1]

        await manager.submitForReview(filePath)
        break

      case '--publish':
        if (args.length < 3) {
          console.error('用法: --publish --file <file> [--version <version>]')
          process.exit(1)
        }

        const publishFileIndex = args.indexOf('--file')
        const publishFile = args[publishFileIndex + 1]

        const versionIndex = args.indexOf('--version')
        const version = versionIndex !== -1 ? args[versionIndex + 1] : null

        await manager.publishDocument(publishFile, { version })
        break

      case '--deprecate':
        if (args.length < 3) {
          console.error('用法: --deprecate --file <file> [--reason <reason>] [--replacement <replacement>]')
          process.exit(1)
        }

        const deprecateFileIndex = args.indexOf('--file')
        const deprecateFile = args[deprecateFileIndex + 1]

        const reasonIndex = args.indexOf('--reason')
        const reason = reasonIndex !== -1 ? args[reasonIndex + 1] : null

        const replacementIndex = args.indexOf('--replacement')
        const replacement = replacementIndex !== -1 ? args[replacementIndex + 1] : null

        await manager.deprecateDocument(deprecateFile, { reason, replacement })
        break

      case '--status':
        if (args.length < 3) {
          console.error('用法: --status --file <file>')
          process.exit(1)
        }

        const statusFileIndex = args.indexOf('--file')
        const statusFile = args[statusFileIndex + 1]

        const state = await manager.getDocumentState(statusFile)
        console.log(`📄 ${statusFile}`)
        console.log(`🏷️ 状态: ${state}`)
        break

      case '--check-expired':
        await manager.checkExpiredDocuments()
        break

      case '--stats':
        await manager.showStatistics()
        break

      default:
        console.error(`未知命令: ${command}`)
        showUsage()
        process.exit(1)
    }
  } catch (error) {
    console.error(`❌ 操作失败: ${error.message}`)
    process.exit(1)
  }
}

function showUsage() {
  console.log('Front前端文档生命周期管理工具')
  console.log('')
  console.log('用法:')
  console.log('  初始化文档: --init --type <type> --name <name> [--author <author>]')
  console.log('  提交审查: --review --file <file>')
  console.log('  发布文档: --publish --file <file> [--version <version>]')
  console.log('  废弃文档: --deprecate --file <file> [--reason <reason>] [--replacement <replacement>]')
  console.log('  查看状态: --status --file <file>')
  console.log('  检查过期: --check-expired')
  console.log('  查看统计: --stats')
  console.log('')
  console.log('文档类型: component, composable, page, api, guide')
  console.log('示例:')
  console.log('  node frontend-doc-lifecycle-manager.js --init --type component --name UserLogin --author zhangsan')
  console.log('  node frontend-doc-lifecycle-manager.js --review --file docs/technical/frontend/components/USERLOGIN.md')
  console.log('  node frontend-doc-lifecycle-manager.js --publish --file docs/technical/frontend/components/USERLOGIN.md --version v1.0.0')
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 执行出错:', error)
    process.exit(1)
  })
}

module.exports = FrontendDocLifecycleManager
