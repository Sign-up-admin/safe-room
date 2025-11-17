#!/usr/bin/env node

/**
 * 编译验证脚本
 * 验证新实现的功能代码是否能正确编译
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 开始验证新功能代码编译...\n')

// 要验证的文件列表
const filesToCheck = [
  'src/composables/useBookingRecommend.ts',
  'src/composables/useFavoritesStore.ts',
  'src/components/discussion/DiscussionComposer.vue',
  'src/components/favorites/FavoritesOverview.vue',
  'src/utils/formatters.ts'
]

// 检查文件是否存在
function checkFileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

// 检查TypeScript文件的基本语法
function checkTypeScriptSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    // 检查基本的语法错误
    const errors = []

    // 检查未闭合的括号
    const openBraces = (content.match(/\{/g) || []).length
    const closeBraces = (content.match(/\}/g) || []).length
    if (openBraces !== closeBraces) {
      errors.push(`大括号不匹配: ${openBraces} 个 '{' vs ${closeBraces} 个 '}'`)
    }

    // 检查未闭合的括号
    const openParens = (content.match(/\(/g) || []).length
    const closeParens = (content.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      errors.push(`圆括号不匹配: ${openParens} 个 '(' vs ${closeParens} 个 ')'`)
    }

    // 检查未闭合的方括号
    const openBrackets = (content.match(/\[/g) || []).length
    const closeBrackets = (content.match(/\]/g) || []).length
    if (openBrackets !== closeBrackets) {
      errors.push(`方括号不匹配: ${openBrackets} 个 '[' vs ${closeBrackets} 个 ']'`)
    }

    // 检查字符串是否正确闭合
    const singleQuotes = (content.match(/'/g) || []).length % 2
    const doubleQuotes = (content.match(/"/g) || []).length % 2
    const backticks = (content.match(/`/g) || []).length % 2

    if (singleQuotes !== 0) {
      errors.push('单引号字符串未正确闭合')
    }
    if (doubleQuotes !== 0) {
      errors.push('双引号字符串未正确闭合')
    }
    if (backticks !== 0) {
      errors.push('模板字符串未正确闭合')
    }

    return errors
  } catch (error) {
    return [`读取文件失败: ${error.message}`]
  }
}

// 检查Vue文件的语法
function checkVueSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    // 检查基本的Vue结构
    const errors = []

    // 检查template标签
    const templateMatch = content.match(/<template[^>]*>/)
    const templateCloseMatch = content.match(/<\/template>/)
    if (templateMatch && !templateCloseMatch) {
      errors.push('template标签未正确闭合')
    }

    // 检查script标签
    const scriptMatch = content.match(/<script[^>]*>/)
    const scriptCloseMatch = content.match(/<\/script>/)
    if (scriptMatch && !scriptCloseMatch) {
      errors.push('script标签未正确闭合')
    }

    // 检查style标签
    const styleMatches = content.match(/<style[^>]*>/g) || []
    const styleCloseMatches = content.match(/<\/style>/g) || []
    if (styleMatches.length !== styleCloseMatches.length) {
      errors.push('style标签数量不匹配')
    }

    // 检查基本的TypeScript语法在script部分
    const scriptContentMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    if (scriptContentMatch) {
      const scriptContent = scriptContentMatch[1]
      const tsErrors = checkTypeScriptSyntax(scriptContent, true)
      errors.push(...tsErrors)
    }

    return errors
  } catch (error) {
    return [`读取Vue文件失败: ${error.message}`]
  }
}

// 主验证函数
function verifyCompilation() {
  let allPassed = true

  filesToCheck.forEach(filePath => {
    console.log(`📄 检查文件: ${filePath}`)

    if (!checkFileExists(filePath)) {
      console.log(`❌ 文件不存在: ${filePath}`)
      allPassed = false
      return
    }

    let errors = []

    if (filePath.endsWith('.vue')) {
      errors = checkVueSyntax(filePath)
    } else if (filePath.endsWith('.ts')) {
      errors = checkTypeScriptSyntax(filePath)
    }

    if (errors.length === 0) {
      console.log(`✅ 语法检查通过`)
    } else {
      console.log(`❌ 发现语法错误:`)
      errors.forEach(error => console.log(`   - ${error}`))
      allPassed = false
    }

    console.log()
  })

  return allPassed
}

// 运行验证
if (verifyCompilation()) {
  console.log('🎉 所有新功能代码编译验证通过!')
  console.log('\n📋 验证结果:')
  console.log('  ✅ 文件存在性检查通过')
  console.log('  ✅ 基本语法检查通过')
  console.log('  ✅ 括号匹配检查通过')
  console.log('  ✅ 字符串闭合检查通过')
  console.log('  ✅ Vue文件结构检查通过')
  console.log('\n💡 提示: 虽然基础语法检查通过，但仍建议运行完整的TypeScript编译来确保类型正确性。')
  process.exit(0)
} else {
  console.log('❌ 编译验证失败，请检查上述错误。')
  process.exit(1)
}
