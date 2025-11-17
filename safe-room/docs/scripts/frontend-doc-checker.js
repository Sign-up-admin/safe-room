#!/usr/bin/env node

/**
 * Front前端文档质量检查工具
 * 检查文档头部信息、格式规范、内容质量等
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

class FrontendDocChecker {
  constructor() {
    this.errors = []
    this.warnings = []
    this.passed = []
    this.stats = {
      total: 0,
      passed: 0,
      warnings: 0,
      errors: 0
    }
  }

  /**
   * 检查单个文档文件
   * @param {string} filePath - 文件路径
   */
  checkFile(filePath) {
    this.stats.total++

    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')
      const fileName = path.basename(filePath)

      console.log(`\n🔍 检查文件: ${filePath}`)

      // 检查头部信息
      this.checkHeader(content, filePath)

      // 检查文档结构
      this.checkStructure(content, lines, filePath)

      // 检查内容质量
      this.checkContentQuality(content, filePath)

      // 检查命名规范
      this.checkNaming(fileName, filePath)

      // 检查格式规范
      this.checkFormatting(content, filePath)

      if (this.errors.length === 0 && this.warnings.length === 0) {
        this.passed.push(filePath)
        this.stats.passed++
        console.log(`✅ ${fileName} 检查通过`)
      } else {
        console.log(`❌ ${fileName} 检查失败`)
        console.log(`   错误: ${this.errors.length}, 警告: ${this.warnings.length}`)
      }

    } catch (error) {
      this.errors.push(`${filePath}: 文件读取失败 - ${error.message}`)
      console.log(`❌ ${fileName} 读取失败: ${error.message}`)
    }
  }

  /**
   * 检查文档头部信息
   * @param {string} content - 文件内容
   * @param {string} filePath - 文件路径
   */
  checkHeader(content, filePath) {
    const headerMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (!headerMatch) {
      this.errors.push(`${filePath}: 缺少文档头部信息`)
      return
    }

    const header = headerMatch[1]
    const requiredFields = ['title', 'version', 'last_updated', 'status', 'category', 'tags']

    for (const field of requiredFields) {
      if (!header.includes(`${field}:`)) {
        this.errors.push(`${filePath}: 头部缺少必需字段 '${field}'`)
      }
    }

    // 检查状态值
    if (header.includes('status:')) {
      const statusMatch = header.match(/status:\s*(.+)/)
      if (statusMatch) {
        const status = statusMatch[1].trim()
        if (!['active', 'draft', 'deprecated'].includes(status)) {
          this.warnings.push(`${filePath}: 状态值 '${status}' 无效，应为 'active', 'draft' 或 'deprecated'`)
        }
      }
    }

    // 检查分类值
    if (header.includes('category:')) {
      const categoryMatch = header.match(/category:\s*(.+)/)
      if (categoryMatch) {
        const category = categoryMatch[1].trim()
        if (!['requirements', 'technical', 'development', 'reports'].includes(category)) {
          this.warnings.push(`${filePath}: 分类值 '${category}' 无效`)
        }
      }
    }
  }

  /**
   * 检查文档结构
   * @param {string} content - 文件内容
   * @param {string[]} lines - 文件行数组
   * @param {string} filePath - 文件路径
   */
  checkStructure(content, lines, filePath) {
    // 检查是否包含必要的结构元素
    const hasToc = content.includes('## 📋 目录')
    const hasOverview = content.includes('## 📖 概述')

    if (!hasToc) {
      this.warnings.push(`${filePath}: 建议添加目录部分`)
    }

    if (!hasOverview) {
      this.errors.push(`${filePath}: 缺少概述部分`)
    }

    // 检查标题层级
    const headings = lines.filter(line => line.match(/^#{1,6}\s+/))
    let hasInvalidStructure = false

    for (let i = 0; i < headings.length; i++) {
      const currentLevel = headings[i].match(/^#{1,6}/)[0].length
      if (i > 0) {
        const prevLevel = headings[i - 1].match(/^#{1,6}/)[0].length
        if (currentLevel > prevLevel + 1) {
          hasInvalidStructure = true
          break
        }
      }
    }

    if (hasInvalidStructure) {
      this.warnings.push(`${filePath}: 标题层级结构不规范，建议避免跳跃式标题`)
    }
  }

  /**
   * 检查内容质量
   * @param {string} content - 文件内容
   * @param {string} filePath - 文件路径
   */
  checkContentQuality(content, filePath) {
    // 检查是否有TODO或FIXME
    if (content.includes('TODO') || content.includes('FIXME')) {
      this.warnings.push(`${filePath}: 包含未完成的TODO或FIXME标记`)
    }

    // 检查是否有占位符文本
    const placeholders = ['[请填写]', '[待补充]', '[TODO]', '[说明]']
    for (const placeholder of placeholders) {
      if (content.includes(placeholder)) {
        this.warnings.push(`${filePath}: 包含未填充的占位符 '${placeholder}'`)
      }
    }

    // 检查代码块是否有语言标识
    const codeBlocks = content.match(/```(\w*)/g)
    if (codeBlocks) {
      for (const block of codeBlocks) {
        if (block === '```') {
          this.warnings.push(`${filePath}: 代码块缺少语言标识`)
        }
      }
    }

    // 检查是否有断开的链接
    const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g)
    if (links) {
      for (const link of links) {
        if (link.includes('(./') || link.includes('../')) {
          // 检查相对路径是否存在
          const linkMatch = link.match(/\[([^\]]+)\]\(([^)]+)\)/)
          if (linkMatch) {
            const linkPath = linkMatch[2]
            if (linkPath.startsWith('./') || linkPath.startsWith('../')) {
              const fullPath = path.resolve(path.dirname(filePath), linkPath)
              if (!fs.existsSync(fullPath) && !fs.existsSync(fullPath + '.md')) {
                this.warnings.push(`${filePath}: 链接指向不存在的文件 '${linkPath}'`)
              }
            }
          }
        }
      }
    }

    // 新增：完整性评分检查
    this.checkCompletenessScore(content, filePath)

    // 新增：代码示例有效性检查
    this.checkCodeExamples(content, filePath)

    // 新增：文档时效性检查
    this.checkDocumentTimeliness(content, filePath)

    // 新增：术语一致性检查
    this.checkTermConsistency(content, filePath)
  }

  /**
   * 检查文档完整性评分
   * @param {string} content - 文件内容
   * @param {string} filePath - 文件路径
   */
  checkCompletenessScore(content, lines, filePath) {
    let completenessScore = 100
    const issues = []

    // 检查必需的结构元素
    const requiredElements = {
      overview: '## 📖 概述',
      toc: '## 📋 目录',
      examples: ['## 💡 示例代码', '## 🚀 安装使用'],
      related: '## 📚 相关链接'
    }

    // 检查概述
    if (!content.includes(requiredElements.overview)) {
      completenessScore -= 20
      issues.push('缺少概述部分')
    }

    // 检查目录
    if (!content.includes(requiredElements.toc)) {
      completenessScore -= 10
      issues.push('缺少目录部分')
    }

    // 检查示例（至少要有一个）
    const hasExamples = requiredElements.examples.some(example => content.includes(example))
    if (!hasExamples) {
      completenessScore -= 15
      issues.push('缺少使用示例')
    }

    // 检查相关链接
    if (!content.includes(requiredElements.related)) {
      completenessScore -= 10
      issues.push('缺少相关链接部分')
    }

    // 检查内容长度（太短可能内容不完整）
    const contentLength = content.replace(/^---[\s\S]*?---/, '').trim().length
    if (contentLength < 500) {
      completenessScore -= 10
      issues.push('文档内容过短，可能信息不完整')
    }

    // 检查是否有实质性内容（不仅仅是模板）
    const substantiveContentIndicators = [
      /```[\s\S]*?```/,  // 代码块
      /\[([^\]]+)\]\(([^)]+)\)/,  // 链接
      /\|.*\|.*\|/,  // 表格
      /- [^\s]/  // 列表项
    ]

    let substantiveElements = 0
    for (const indicator of substantiveContentIndicators) {
      if (indicator.test(content)) {
        substantiveElements++
      }
    }

    if (substantiveElements < 2) {
      completenessScore -= 15
      issues.push('文档缺乏实质性内容')
    }

    if (completenessScore < 80) {
      this.warnings.push(`${filePath}: 完整性评分过低 (${completenessScore}/100) - ${issues.join(', ')}`)
    }
  }

  /**
   * 检查代码示例有效性
   * @param {string} content - 文件内容
   * @param {string} filePath - 文件路径
   */
  checkCodeExamples(content, filePath) {
    const codeBlocks = content.match(/```(\w*)[\s\S]*?```/g)

    if (!codeBlocks || codeBlocks.length === 0) {
      return // 没有代码块，跳过检查
    }

    for (let i = 0; i < codeBlocks.length; i++) {
      const block = codeBlocks[i]
      const lines = block.split('\n')
      const language = lines[0].match(/```(\w*)/)?.[1] || ''

      // 检查语言标识
      if (!language) {
        this.warnings.push(`${filePath}: 代码块 ${i + 1} 缺少语言标识`)
        continue
      }

      const codeContent = lines.slice(1, -1).join('\n').trim()

      // 检查代码块是否为空
      if (!codeContent) {
        this.warnings.push(`${filePath}: 代码块 ${i + 1} (${language}) 为空`)
        continue
      }

      // 检查代码基本语法（简化检查）
      if (language === 'javascript' || language === 'typescript') {
        this.validateJavaScriptCode(codeContent, filePath, i + 1)
      } else if (language === 'vue') {
        this.validateVueCode(codeContent, filePath, i + 1)
      } else if (language === 'bash' || language === 'shell') {
        this.validateShellCode(codeContent, filePath, i + 1)
      }
    }
  }

  /**
   * 验证JavaScript/TypeScript代码
   * @param {string} code - 代码内容
   * @param {string} filePath - 文件路径
   * @param {number} blockIndex - 代码块索引
   */
  validateJavaScriptCode(code, filePath, blockIndex) {
    // 基本语法检查（简化版）
    const issues = []

    // 检查括号匹配
    const openBraces = (code.match(/\{/g) || []).length
    const closeBraces = (code.match(/\}/g) || []).length
    if (openBraces !== closeBraces) {
      issues.push('花括号不匹配')
    }

    // 检查基本语法错误
    if (code.includes('function') && !code.includes('(')) {
      issues.push('函数定义语法错误')
    }

    // 检查导入语句
    const imports = code.match(/import\s+.*from\s+['"]([^'"]+)['"]/g)
    if (imports) {
      for (const imp of imports) {
        const match = imp.match(/from\s+['"]([^'"]+)['"]/)
        if (match) {
          const modulePath = match[1]
          if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
            // 检查相对路径文件是否存在（简化检查）
            // 这里可以扩展为实际的文件存在性检查
          }
        }
      }
    }

    if (issues.length > 0) {
      this.warnings.push(`${filePath}: 代码块 ${blockIndex} (javascript) 存在问题 - ${issues.join(', ')}`)
    }
  }

  /**
   * 验证Vue代码
   * @param {string} code - 代码内容
   * @param {string} filePath - 文件路径
   * @param {number} blockIndex - 代码块索引
   */
  validateVueCode(code, filePath, blockIndex) {
    const issues = []

    // 检查Vue模板语法
    if (code.includes('<template>') && !code.includes('</template>')) {
      issues.push('Vue模板标签不完整')
    }

    // 检查Vue组件基本结构
    if (code.includes('<script setup') && !code.includes('</script>')) {
      issues.push('Vue脚本标签不完整')
    }

    if (issues.length > 0) {
      this.warnings.push(`${filePath}: 代码块 ${blockIndex} (vue) 存在问题 - ${issues.join(', ')}`)
    }
  }

  /**
   * 验证Shell代码
   * @param {string} code - 代码内容
   * @param {string} filePath - 文件路径
   * @param {number} blockIndex - 代码块索引
   */
  validateShellCode(code, filePath, blockIndex) {
    const issues = []

    // 检查基本的shell语法
    const lines = code.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // 检查管道语法
      if (line.includes('|') && !line.includes(' | ')) {
        issues.push(`第${i + 1}行管道语法可能有误`)
      }

      // 检查重定向
      if (line.includes('>>') && !line.includes(' >> ')) {
        issues.push(`第${i + 1}行重定向语法可能有误`)
      }
    }

    if (issues.length > 0) {
      this.warnings.push(`${filePath}: 代码块 ${blockIndex} (bash) 存在问题 - ${issues.join(', ')}`)
    }
  }

  /**
   * 检查文档时效性
   * @param {string} content - 文件内容
   * @param {string} filePath - 文件路径
   */
  checkDocumentTimeliness(content, filePath) {
    // 检查最后更新日期
    const lastUpdatedMatch = content.match(/last_updated:\s*(\d{4}-\d{2}-\d{2})/)
    if (lastUpdatedMatch) {
      const lastUpdated = new Date(lastUpdatedMatch[1])
      const now = new Date()
      const daysSinceUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24))

      // 如果超过90天没有更新，发出警告
      if (daysSinceUpdate > 90) {
        this.warnings.push(`${filePath}: 文档超过90天未更新 (最后更新: ${lastUpdatedMatch[1]})`)
      } else if (daysSinceUpdate > 30) {
        // 超过30天，给出信息提示
        this.warnings.push(`${filePath}: 文档超过30天未更新 (最后更新: ${lastUpdatedMatch[1]})`)
      }

      // 检查未来日期
      if (lastUpdated > now) {
        this.errors.push(`${filePath}: 更新日期不能是未来日期 (${lastUpdatedMatch[1]})`)
      }
    } else {
      this.warnings.push(`${filePath}: 缺少最后更新日期信息`)
    }

    // 检查版本号格式
    const versionMatch = content.match(/version:\s*([^\s]+)/)
    if (versionMatch) {
      const version = versionMatch[1]
      // 检查语义化版本格式
      if (!/^\d+\.\d+\.\d+(-[\w\.\-]+)?(\+[\w\.\-]+)?$/.test(version)) {
        this.warnings.push(`${filePath}: 版本号格式不符合语义化版本规范 (${version})`)
      }
    }
  }

  /**
   * 检查术语一致性
   * @param {string} content - 文件内容
   * @param {string} filePath - 文件路径
   */
  checkTermConsistency(content, filePath) {
    // 定义术语映射表
    const termMappings = {
      // 中英文术语统一
      '前端': ['front-end', 'frontend'],
      '后端': ['back-end', 'backend'],
      '组件': ['component'],
      '函数': ['function', 'method'],
      '参数': ['parameter', 'param'],
      '属性': ['property', 'attribute'],
      '配置': ['configuration', 'config'],
      '安装': ['installation', 'install'],
      '使用': ['usage', 'use'],
      '示例': ['example', 'sample']
    }

    const inconsistencies = []

    // 检查术语使用一致性
    for (const [standardTerm, variants] of Object.entries(termMappings)) {
      let foundVariants = []

      // 检查中文标准术语
      if (content.includes(standardTerm)) {
        foundVariants.push(standardTerm)
      }

      // 检查英文变体
      for (const variant of variants) {
        if (variant !== standardTerm && content.includes(variant)) {
          foundVariants.push(variant)
        }
      }

      // 如果找到多个变体，说明不一致
      if (foundVariants.length > 1) {
        inconsistencies.push(`${standardTerm} 的变体: ${foundVariants.join(', ')}`)
      }
    }

    // 检查常见拼写错误
    const commonTypos = {
      'teh': 'the',
      'recieve': 'receive',
      'seperate': 'separate',
      'occured': 'occurred',
      'comparision': 'comparison',
      'defininig': 'defining',
      'exmaple': 'example'
    }

    for (const [typo, correct] of Object.entries(commonTypos)) {
      if (content.toLowerCase().includes(typo)) {
        inconsistencies.push(`可能的拼写错误: "${typo}" 应为 "${correct}"`)
      }
    }

    if (inconsistencies.length > 0) {
      this.warnings.push(`${filePath}: 发现术语不一致或拼写问题 - ${inconsistencies.join('; ')}`)
    }
  }

  /**
   * 检查命名规范
   * @param {string} fileName - 文件名
   * @param {string} filePath - 文件路径
   */
  checkNaming(fileName, filePath) {
    // 检查文件扩展名
    if (!fileName.endsWith('.md')) {
      this.errors.push(`${filePath}: 文件扩展名不是 .md`)
    }

    // 检查文件名格式（大写英文+下划线）
    if (!/^[A-Z][A-Z_]*\.md$/.test(fileName)) {
      this.warnings.push(`${filePath}: 文件名不符合大写英文+下划线规范`)
    }
  }

  /**
   * 检查格式规范
   * @param {string} content - 文件内容
   * @param {string} filePath - 文件路径
   */
  checkFormatting(content, filePath) {
    // 检查行尾空格
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].endsWith(' ')) {
        this.warnings.push(`${filePath}:${i + 1}: 行尾包含空格`)
      }
    }

    // 检查连续空行
    let consecutiveEmptyLines = 0
    for (const line of lines) {
      if (line.trim() === '') {
        consecutiveEmptyLines++
        if (consecutiveEmptyLines > 2) {
          this.warnings.push(`${filePath}: 存在连续3个以上的空行`)
          break
        }
      } else {
        consecutiveEmptyLines = 0
      }
    }

    // 检查中英文混用
    const mixedContent = content.match(/[\u4e00-\u9fa5][A-Za-z]|[A-Za-z][\u4e00-\u9fa5]/g)
    if (mixedContent && mixedContent.length > 0) {
      this.warnings.push(`${filePath}: 存在中英文字符混用，可能影响可读性`)
    }
  }

  /**
   * 生成检查报告
   */
  generateReport() {
    const report = {
      summary: {
        total: this.stats.total,
        passed: this.stats.passed,
        warnings: this.stats.warnings,
        errors: this.stats.errors,
        passRate: this.stats.total > 0 ? ((this.stats.passed / this.stats.total) * 100).toFixed(1) : '0'
      },
      errors: this.errors,
      warnings: this.warnings,
      passed: this.passed,
      timestamp: new Date().toISOString()
    }

    return report
  }

  /**
   * 打印报告
   */
  printReport() {
    const report = this.generateReport()

    console.log('\n' + '='.repeat(60))
    console.log('📊 Front前端文档质量检查报告')
    console.log('='.repeat(60))
    console.log(`总文件数: ${report.summary.total}`)
    console.log(`通过数: ${report.summary.passed}`)
    console.log(`警告数: ${report.summary.warnings}`)
    console.log(`错误数: ${report.summary.errors}`)
    console.log(`通过率: ${report.summary.passRate}%`)
    console.log('='.repeat(60))

    if (report.errors.length > 0) {
      console.log('\n❌ 错误列表:')
      report.errors.forEach(error => console.log(`  • ${error}`))
    }

    if (report.warnings.length > 0) {
      console.log('\n⚠️  警告列表:')
      report.warnings.forEach(warning => console.log(`  • ${warning}`))
    }

    if (report.passed.length > 0 && report.errors.length === 0 && report.warnings.length === 0) {
      console.log('\n✅ 所有文件检查通过！')
    }
  }

  /**
   * 保存报告到文件
   * @param {string} outputPath - 输出路径
   */
  saveReport(outputPath = './docs/reports/frontend/quality/doc-quality-report.json') {
    const report = this.generateReport()

    // 确保目录存在
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8')
    console.log(`\n💾 报告已保存到: ${outputPath}`)
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  const checker = new FrontendDocChecker()

  let files = []

  if (args.length > 0) {
    // 检查指定文件
    files = args.filter(arg => arg.endsWith('.md'))
  } else {
    // 检查所有Front前端文档
    try {
      const patterns = [
        'docs/technical/frontend/**/*.md',
        'docs/development/frontend/**/*.md',
        'docs/reports/frontend/**/*.md'
      ]

      for (const pattern of patterns) {
        const patternFiles = await glob(pattern, { cwd: process.cwd() })
        files.push(...patternFiles)
      }
    } catch (error) {
      console.error('❌ 查找文件失败:', error.message)
      process.exit(1)
    }
  }

  if (files.length === 0) {
    console.log('❌ 未找到要检查的文件')
    process.exit(1)
  }

  console.log(`🔍 开始检查 ${files.length} 个文档文件...`)

  for (const file of files) {
    checker.checkFile(file)
  }

  checker.printReport()
  checker.saveReport()

  // 根据检查结果设置退出码
  const report = checker.generateReport()
  if (report.summary.errors > 0) {
    process.exit(1)
  } else if (report.summary.warnings > 0) {
    process.exit(0) // 警告不影响退出码
  } else {
    process.exit(0)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 检查过程出错:', error)
    process.exit(1)
  })
}

module.exports = FrontendDocChecker
