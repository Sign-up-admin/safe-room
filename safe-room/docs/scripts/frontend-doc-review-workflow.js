#!/usr/bin/env node

/**
 * Front前端文档审查工作流工具
 * 实现审查分配、意见收集、状态跟踪等功能
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

class FrontendDocReviewWorkflow {
  constructor() {
    this.reviewStates = {
      pending: 'pending',
      in_progress: 'in_progress',
      approved: 'approved',
      rejected: 'rejected',
      changes_requested: 'changes_requested'
    }

    this.reviewerRoles = {
      'tech-lead': { priority: 1, expertise: ['architecture', 'api', 'security'] },
      'doc-specialist': { priority: 2, expertise: ['writing', 'structure', 'standards'] },
      'frontend-engineer': { priority: 3, expertise: ['components', 'ui', 'frontend'] },
      'backend-engineer': { priority: 3, expertise: ['api', 'backend', 'database'] },
      'qa-engineer': { priority: 3, expertise: ['testing', 'quality', 'validation'] },
      'product-manager': { priority: 4, expertise: ['requirements', 'user-experience', 'business'] }
    }
  }

  /**
   * 分配审查人员
   * @param {string} filePath - 文档路径
   * @param {Object} options - 分配选项
   */
  async assignReviewers(filePath, options = {}) {
    const { customReviewers = [], priority = 'normal', deadline } = options

    console.log(`👥 分配审查人员: ${filePath}`)

    let reviewers = []

    // 如果指定了自定义审查人员
    if (customReviewers.length > 0) {
      reviewers = customReviewers
    } else {
      // 自动分配审查人员
      reviewers = await this.autoAssignReviewers(filePath, priority)
    }

    // 计算截止时间
    const reviewDeadline = deadline || this.calculateDeadline(priority)

    // 创建审查任务
    const reviewTask = {
      id: this.generateReviewId(),
      filePath,
      reviewers,
      status: this.reviewStates.pending,
      priority,
      deadline: reviewDeadline,
      createdAt: new Date().toISOString(),
      assignedBy: options.assignedBy || 'system',
      comments: [],
      approvals: {}
    }

    // 保存审查任务
    await this.saveReviewTask(reviewTask)

    // 发送分配通知
    await this.sendAssignmentNotifications(reviewTask)

    console.log(`✅ 审查人员已分配:`)
    reviewers.forEach(reviewer => console.log(`  - ${reviewer}`))
    console.log(`⏰ 截止时间: ${reviewDeadline}`)
    console.log(`🎯 优先级: ${priority}`)

    return reviewTask
  }

  /**
   * 自动分配审查人员
   * @param {string} filePath - 文档路径
   * @param {string} priority - 优先级
   */
  async autoAssignReviewers(filePath, priority) {
    const documentInfo = await this.analyzeDocument(filePath)
    const requiredRoles = this.determineRequiredRoles(documentInfo, priority)

    // 基于角色优先级和可用性分配
    const reviewers = []

    for (const role of requiredRoles) {
      const availableReviewers = await this.getAvailableReviewers(role, priority)
      if (availableReviewers.length > 0) {
        // 选择工作量最少的审查人
        const selectedReviewer = await this.selectReviewerByWorkload(availableReviewers)
        reviewers.push(selectedReviewer)
      }
    }

    // 如果没有足够的自动分配，添加默认审查人
    if (reviewers.length < 2) {
      reviewers.push('tech-lead')
      if (reviewers.length < 2) {
        reviewers.push('doc-specialist')
      }
    }

    return [...new Set(reviewers)] // 去重
  }

  /**
   * 分析文档内容
   * @param {string} filePath - 文档路径
   */
  async analyzeDocument(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const fileName = path.basename(filePath).toLowerCase()

    // 确定文档类型
    let type = 'general'
    if (fileName.includes('component')) type = 'component'
    else if (fileName.includes('api')) type = 'api'
    else if (fileName.includes('architecture')) type = 'architecture'
    else if (fileName.includes('guide')) type = 'guide'
    else if (fileName.includes('test')) type = 'testing'

    // 确定分类
    let category = 'technical'
    if (filePath.includes('/development/')) category = 'development'
    else if (filePath.includes('/reports/')) category = 'reports'

    // 检查技术复杂度
    const hasCode = content.includes('```')
    const hasApi = content.includes('API') || content.includes('接口')
    const hasSecurity = content.includes('安全') || content.includes('权限')

    return {
      type,
      category,
      hasCode,
      hasApi,
      hasSecurity,
      complexity: this.assessComplexity(content)
    }
  }

  /**
   * 确定所需审查角色
   * @param {Object} documentInfo - 文档信息
   * @param {string} priority - 优先级
   */
  determineRequiredRoles(documentInfo, priority) {
    const roles = ['tech-lead', 'doc-specialist']

    // 根据文档类型添加特定角色
    switch (documentInfo.type) {
      case 'component':
      case 'frontend':
        roles.push('frontend-engineer')
        break
      case 'api':
      case 'backend':
        roles.push('backend-engineer')
        break
      case 'testing':
        roles.push('qa-engineer')
        break
      case 'requirements':
        roles.push('product-manager')
        break
    }

    // 高优先级文档需要更多审查
    if (priority === 'high' || priority === 'urgent') {
      // 为高优先级文档添加额外审查人
    }

    return roles
  }

  /**
   * 获取可用审查人员
   * @param {string} role - 角色
   * @param {string} priority - 优先级
   */
  async getAvailableReviewers(role, priority) {
    // 模拟获取可用审查人
    // 实际项目中可以从用户管理系统或配置文件获取
    const roleMembers = {
      'tech-lead': ['alice', 'bob'],
      'doc-specialist': ['charlie', 'diana'],
      'frontend-engineer': ['eve', 'frank'],
      'backend-engineer': ['grace', 'henry'],
      'qa-engineer': ['ivy', 'jack'],
      'product-manager': ['kate', 'liam']
    }

    return roleMembers[role] || []
  }

  /**
   * 根据工作量选择审查人
   * @param {Array} reviewers - 候选审查人
   */
  async selectReviewerByWorkload(reviewers) {
    // 模拟工作量检查
    // 实际项目中可以查询当前审查任务数量
    const workloads = await Promise.all(
      reviewers.map(async (reviewer) => {
        const currentTasks = await this.getReviewerWorkload(reviewer)
        return { reviewer, workload: currentTasks }
      })
    )

    // 选择工作量最少的
    workloads.sort((a, b) => a.workload - b.workload)
    return workloads[0].reviewer
  }

  /**
   * 获取审查人当前工作量
   * @param {string} reviewer - 审查人
   */
  async getReviewerWorkload(reviewer) {
    const tasks = await this.getAllReviewTasks()
    return tasks.filter(task =>
      task.reviewers.includes(reviewer) &&
      task.status === this.reviewStates.in_progress
    ).length
  }

  /**
   * 计算审查截止时间
   * @param {string} priority - 优先级
   */
  calculateDeadline(priority) {
    const now = new Date()
    let days = 3 // 默认3天

    switch (priority) {
      case 'urgent':
        days = 1
        break
      case 'high':
        days = 2
        break
      case 'normal':
        days = 3
        break
      case 'low':
        days = 7
        break
    }

    now.setDate(now.getDate() + days)
    return now.toISOString().split('T')[0]
  }

  /**
   * 提交审查意见
   * @param {string} reviewId - 审查ID
   * @param {string} reviewer - 审查人
   * @param {Object} feedback - 审查意见
   */
  async submitReview(reviewId, reviewer, feedback) {
    console.log(`💬 提交审查意见: ${reviewId} by ${reviewer}`)

    const task = await this.getReviewTask(reviewId)
    if (!task) {
      throw new Error(`审查任务不存在: ${reviewId}`)
    }

    if (!task.reviewers.includes(reviewer)) {
      throw new Error(`用户不是此审查任务的审查人: ${reviewer}`)
    }

    // 添加审查意见
    const comment = {
      id: this.generateCommentId(),
      reviewer,
      timestamp: new Date().toISOString(),
      type: feedback.type || 'comment', // comment, approve, reject, request_changes
      content: feedback.content,
      suggestions: feedback.suggestions || [],
      lineNumber: feedback.lineNumber,
      section: feedback.section
    }

    task.comments.push(comment)

    // 更新审查人状态
    task.approvals = task.approvals || {}
    task.approvals[reviewer] = {
      status: feedback.type,
      timestamp: comment.timestamp,
      commentId: comment.id
    }

    // 检查是否可以更新任务状态
    await this.updateReviewTaskStatus(task)

    // 保存更新
    await this.saveReviewTask(task)

    // 发送通知
    await this.sendReviewNotification(task, comment)

    console.log(`✅ 审查意见已提交`)
    console.log(`📝 类型: ${feedback.type}`)
    if (feedback.content) {
      console.log(`💬 内容: ${feedback.content.substring(0, 50)}...`)
    }

    return comment
  }

  /**
   * 更新审查任务状态
   * @param {Object} task - 审查任务
   */
  async updateReviewTaskStatus(task) {
    const approvals = Object.values(task.approvals)
    const totalReviewers = task.reviewers.length
    const completedReviews = approvals.length

    // 如果所有审查人都已完成
    if (completedReviews >= totalReviewers) {
      const hasRejection = approvals.some(a => a.status === 'reject')
      const hasChangesRequested = approvals.some(a => a.status === 'request_changes')
      const allApproved = approvals.every(a => a.status === 'approve')

      if (hasRejection) {
        task.status = this.reviewStates.rejected
      } else if (hasChangesRequested) {
        task.status = this.reviewStates.changes_requested
      } else if (allApproved) {
        task.status = this.reviewStates.approved
      } else {
        task.status = this.reviewStates.in_progress
      }
    } else if (completedReviews > 0) {
      task.status = this.reviewStates.in_progress
    }

    // 如果任务完成，触发后续流程
    if (task.status === this.reviewStates.approved) {
      await this.handleApprovedReview(task)
    } else if (task.status === this.reviewStates.rejected) {
      await this.handleRejectedReview(task)
    }
  }

  /**
   * 处理通过的审查
   * @param {Object} task - 审查任务
   */
  async handleApprovedReview(task) {
    console.log(`🎉 审查通过: ${task.filePath}`)

    // 调用生命周期管理器发布文档
    const { FrontendDocLifecycleManager } = require('./frontend-doc-lifecycle-manager')
    const lifecycleManager = new FrontendDocLifecycleManager()

    try {
      await lifecycleManager.publishDocument(task.filePath)
      console.log(`✅ 文档已自动发布`)
    } catch (error) {
      console.error(`❌ 自动发布失败: ${error.message}`)
    }
  }

  /**
   * 处理被拒绝的审查
   * @param {Object} task - 审查任务
   */
  async handleRejectedReview(task) {
    console.log(`❌ 审查被拒绝: ${task.filePath}`)

    // 通知作者修改
    await this.notifyAuthorOfRejection(task)
  }

  /**
   * 获取审查任务
   * @param {string} reviewId - 审查ID
   */
  async getReviewTask(reviewId) {
    const tasks = await this.getAllReviewTasks()
    return tasks.find(task => task.id === reviewId)
  }

  /**
   * 获取所有审查任务
   */
  async getAllReviewTasks() {
    const reviewFile = 'docs/.review-tasks.json'

    try {
      if (fs.existsSync(reviewFile)) {
        return JSON.parse(fs.readFileSync(reviewFile, 'utf-8'))
      }
    } catch (error) {
      console.warn('无法读取审查任务文件')
    }

    return []
  }

  /**
   * 保存审查任务
   * @param {Object} task - 审查任务
   */
  async saveReviewTask(task) {
    const reviewFile = 'docs/.review-tasks.json'
    let tasks = await this.getAllReviewTasks()

    // 更新或添加任务
    const existingIndex = tasks.findIndex(t => t.id === task.id)
    if (existingIndex >= 0) {
      tasks[existingIndex] = task
    } else {
      tasks.push(task)
    }

    fs.writeFileSync(reviewFile, JSON.stringify(tasks, null, 2), 'utf-8')
  }

  /**
   * 生成审查报告
   * @param {string} reviewId - 审查ID
   */
  async generateReviewReport(reviewId) {
    const task = await this.getReviewTask(reviewId)
    if (!task) {
      throw new Error(`审查任务不存在: ${reviewId}`)
    }

    const report = {
      reviewId: task.id,
      filePath: task.filePath,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline,
      createdAt: task.createdAt,
      reviewers: task.reviewers,
      approvals: task.approvals,
      commentsCount: task.comments.length,
      summary: this.generateReviewSummary(task)
    }

    return report
  }

  /**
   * 生成审查摘要
   * @param {Object} task - 审查任务
   */
  generateReviewSummary(task) {
    const approvals = Object.values(task.approvals)
    const approved = approvals.filter(a => a.status === 'approve').length
    const rejected = approvals.filter(a => a.status === 'reject').length
    const changesRequested = approvals.filter(a => a.status === 'request_changes').length
    const comments = approvals.filter(a => a.status === 'comment').length

    return {
      totalReviewers: task.reviewers.length,
      completedReviews: approvals.length,
      approved,
      rejected,
      changesRequested,
      comments,
      completionRate: (approvals.length / task.reviewers.length * 100).toFixed(1) + '%'
    }
  }

  /**
   * 获取过期审查任务
   */
  async getOverdueReviews() {
    const tasks = await this.getAllReviewTasks()
    const now = new Date()

    return tasks.filter(task => {
      if (task.status === this.reviewStates.pending || task.status === this.reviewStates.in_progress) {
        const deadline = new Date(task.deadline)
        return deadline < now
      }
      return false
    })
  }

  /**
   * 获取审查统计信息
   */
  async getReviewStatistics() {
    const tasks = await this.getAllReviewTasks()
    const overdue = await this.getOverdueReviews()

    const stats = {
      total: tasks.length,
      byStatus: {},
      byPriority: {},
      overdueCount: overdue.length,
      averageCompletionTime: 0
    }

    // 按状态统计
    tasks.forEach(task => {
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1
    })

    // 按优先级统计
    tasks.forEach(task => {
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1
    })

    // 计算平均完成时间
    const completedTasks = tasks.filter(task => task.status === this.reviewStates.approved)
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        const created = new Date(task.createdAt)
        const approved = new Date(Object.values(task.approvals).find(a => a.status === 'approve')?.timestamp || task.createdAt)
        return sum + (approved - created)
      }, 0)
      stats.averageCompletionTime = Math.round(totalTime / completedTasks.length / (1000 * 60 * 60)) // 小时
    }

    return stats
  }

  /**
   * 显示审查统计信息
   */
  async showStatistics() {
    const stats = await this.getReviewStatistics()

    console.log('\n📊 文档审查统计')
    console.log('='.repeat(40))
    console.log(`总审查任务: ${stats.total}`)
    console.log(`待处理: ${stats.byStatus.pending || 0}`)
    console.log(`进行中: ${stats.byStatus.in_progress || 0}`)
    console.log(`已通过: ${stats.byStatus.approved || 0}`)
    console.log(`已拒绝: ${stats.byStatus.rejected || 0}`)
    console.log(`请求修改: ${stats.byStatus.changes_requested || 0}`)
    console.log(`过期任务: ${stats.overdueCount}`)
    console.log(`平均完成时间: ${stats.averageCompletionTime}小时`)
    console.log('='.repeat(40))

    return stats
  }

  /**
   * 评估文档复杂度
   * @param {string} content - 文档内容
   */
  assessComplexity(content) {
    let complexity = 1

    if (content.length > 5000) complexity++
    if (content.includes('```')) complexity++
    if (content.includes('API') || content.includes('接口')) complexity++
    if (content.includes('安全') || content.includes('权限')) complexity++

    return Math.min(complexity, 5)
  }

  /**
   * 生成ID
   */
  generateReviewId() {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  generateCommentId() {
    return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 发送通知（模拟）
   */
  async sendAssignmentNotifications(task) {
    console.log(`📧 发送分配通知给审查人员`)
  }

  async sendReviewNotification(task, comment) {
    console.log(`📧 发送审查意见通知`)
  }

  async notifyAuthorOfRejection(task) {
    console.log(`📧 通知作者审查被拒绝`)
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  const workflow = new FrontendDocReviewWorkflow()

  if (args.length === 0) {
    showUsage()
    return
  }

  const command = args[0]

  try {
    switch (command) {
      case '--assign':
        if (args.length < 3) {
          console.error('用法: --assign --file <file> [--reviewers <reviewer1,reviewer2>] [--priority <priority>]')
          process.exit(1)
        }

        const fileIndex = args.indexOf('--file')
        const filePath = args[fileIndex + 1]

        const reviewersIndex = args.indexOf('--reviewers')
        const reviewers = reviewersIndex !== -1 ? args[reviewersIndex + 1].split(',') : []

        const priorityIndex = args.indexOf('--priority')
        const priority = priorityIndex !== -1 ? args[priorityIndex + 1] : 'normal'

        await workflow.assignReviewers(filePath, { customReviewers: reviewers, priority })
        break

      case '--review':
        if (args.length < 7) {
          console.error('用法: --review --id <reviewId> --reviewer <reviewer> --type <type> --content <content>')
          process.exit(1)
        }

        const idIndex = args.indexOf('--id')
        const reviewId = args[idIndex + 1]

        const reviewerIndex = args.indexOf('--reviewer')
        const reviewer = args[reviewerIndex + 1]

        const typeIndex = args.indexOf('--type')
        const type = args[typeIndex + 1]

        const contentIndex = args.indexOf('--content')
        const content = args[contentIndex + 1]

        await workflow.submitReview(reviewId, reviewer, { type, content })
        break

      case '--report':
        if (args.length < 3) {
          console.error('用法: --report --id <reviewId>')
          process.exit(1)
        }

        const reportIdIndex = args.indexOf('--id')
        const reportId = args[reportIdIndex + 1]

        const report = await workflow.generateReviewReport(reportId)
        console.log(JSON.stringify(report, null, 2))
        break

      case '--overdue':
        const overdue = await workflow.getOverdueReviews()
        if (overdue.length > 0) {
          console.log('\n⚠️ 过期审查任务：')
          overdue.forEach(task => {
            console.log(`  - ${task.id}: ${task.filePath} (截止: ${task.deadline})`)
          })
        } else {
          console.log('✅ 没有过期审查任务')
        }
        break

      case '--stats':
        await workflow.showStatistics()
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
  console.log('Front前端文档审查工作流工具')
  console.log('')
  console.log('用法:')
  console.log('  分配审查: --assign --file <file> [--reviewers <r1,r2>] [--priority <priority>]')
  console.log('  提交审查: --review --id <reviewId> --reviewer <reviewer> --type <type> --content <content>')
  console.log('  生成报告: --report --id <reviewId>')
  console.log('  查看过期: --overdue')
  console.log('  查看统计: --stats')
  console.log('')
  console.log('审查类型: comment, approve, reject, request_changes')
  console.log('优先级: urgent, high, normal, low')
  console.log('示例:')
  console.log('  node frontend-doc-review-workflow.js --assign --file docs/technical/frontend/components/USERLOGIN.md --priority high')
  console.log('  node frontend-doc-review-workflow.js --review --id review_123 --reviewer alice --type approve --content "文档质量良好"')
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 执行出错:', error)
    process.exit(1)
  })
}

module.exports = FrontendDocReviewWorkflow
