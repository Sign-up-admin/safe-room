#!/usr/bin/env node

/**
 * PR自动文档生成器
 * 监听代码变更，自动生成和更新相关文档
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const AIToolManager = require('./ai-doc-generator.js');

class PRDocGenerator {
  constructor() {
    this.aiManager = new AIToolManager();
    this.config = this.loadConfig();
  }

  loadConfig() {
    return {
      // 支持的文件类型
      supportedExtensions: ['.js', '.ts', '.vue', '.java', '.py'],

      // 文档映射规则
      docMapping: {
        'controller': 'docs/technical/api/',
        'service': 'docs/technical/backend/',
        'component': 'docs/technical/frontend/components/',
        'model': 'docs/technical/backend/models/',
        'config': 'docs/technical/backend/config/'
      },

      // 变更类型映射
      changeTypes: {
        'added': '新增',
        'modified': '修改',
        'deleted': '删除',
        'renamed': '重命名'
      },

      // 文档模板
      templates: {
        prSummary: 'docs/templates/pr-summary-template.md',
        changeLog: 'docs/templates/change-log-template.md'
      }
    };
  }

  /**
   * 分析PR变更
   */
  async analyzePR(prNumber, repoPath = process.cwd()) {
    console.log(`🔍 分析PR #${prNumber} 的变更...`);

    try {
      // 获取PR信息
      const prInfo = await this.getPRInfo(prNumber);

      // 获取变更文件
      const changedFiles = await this.getChangedFiles(prNumber);

      // 分析变更内容
      const analysis = await this.analyzeChanges(changedFiles, repoPath);

      // 生成文档更新
      const docUpdates = await this.generateDocUpdates(analysis, prInfo);

      // 生成PR总结文档
      const prSummary = await this.generatePRSummary(prInfo, analysis, docUpdates);

      return {
        prInfo,
        analysis,
        docUpdates,
        prSummary
      };

    } catch (error) {
      console.error('❌ PR分析失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取PR基本信息
   */
  async getPRInfo(prNumber) {
    // 这里应该调用GitHub API获取PR信息
    // 暂时使用模拟数据
    return {
      number: prNumber,
      title: `feat: 添加用户认证功能`,
      author: 'developer@example.com',
      branch: 'feature/user-auth',
      baseBranch: 'main',
      createdAt: new Date().toISOString(),
      description: '实现用户登录、注册和权限验证功能'
    };
  }

  /**
   * 获取变更文件列表
   */
  async getChangedFiles(prNumber) {
    try {
      // 使用git命令获取变更文件
      const gitCommand = `git diff --name-status HEAD~1`;
      const output = execSync(gitCommand, { encoding: 'utf-8' });

      const files = output.trim().split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [status, file] = line.split('\t');
          return {
            status: this.parseGitStatus(status),
            path: file,
            extension: path.extname(file)
          };
        })
        .filter(file => this.config.supportedExtensions.includes(file.extension));

      console.log(`📁 发现 ${files.length} 个相关文件变更`);
      return files;

    } catch (error) {
      console.warn('⚠️ 无法获取git变更信息，使用默认分析');
      return [];
    }
  }

  /**
   * 解析git状态
   */
  parseGitStatus(status) {
    const statusMap = {
      'A': 'added',
      'M': 'modified',
      'D': 'deleted',
      'R': 'renamed'
    };
    return statusMap[status] || 'modified';
  }

  /**
   * 分析变更内容
   */
  async analyzeChanges(changedFiles, repoPath) {
    const analysis = {
      summary: {
        totalFiles: changedFiles.length,
        added: 0,
        modified: 0,
        deleted: 0,
        byType: {}
      },
      details: [],
      impactedAreas: new Set(),
      breakingChanges: []
    };

    for (const file of changedFiles) {
      const fileAnalysis = await this.analyzeFile(file, repoPath);
      analysis.details.push(fileAnalysis);

      // 统计变更类型
      analysis.summary[file.status] = (analysis.summary[file.status] || 0) + 1;

      // 分类统计
      const type = this.getFileType(file.path);
      analysis.summary.byType[type] = (analysis.summary.byType[type] || 0) + 1;

      // 识别影响范围
      const impactedAreas = this.identifyImpactedAreas(file, fileAnalysis);
      impactedAreas.forEach(area => analysis.impactedAreas.add(area));

      // 检测破坏性变更
      const breakingChanges = this.detectBreakingChanges(file, fileAnalysis);
      analysis.breakingChanges.push(...breakingChanges);
    }

    analysis.impactedAreas = Array.from(analysis.impactedAreas);
    return analysis;
  }

  /**
   * 分析单个文件
   */
  async analyzeFile(file, repoPath) {
    const filePath = path.join(repoPath, file.path);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      const analysis = {
        file: file.path,
        type: this.getFileType(file.path),
        status: file.status,
        size: content.length,
        lines: content.split('\n').length,
        functions: [],
        classes: [],
        imports: [],
        exports: [],
        changes: []
      };

      // 分析代码结构
      if (file.extension === '.js' || file.extension === '.ts') {
        Object.assign(analysis, this.analyzeJavaScriptFile(content));
      } else if (file.extension === '.vue') {
        Object.assign(analysis, this.analyzeVueFile(content));
      } else if (file.extension === '.java') {
        Object.assign(analysis, this.analyzeJavaFile(content));
      }

      return analysis;

    } catch (error) {
      console.warn(`⚠️ 无法分析文件 ${file.path}: ${error.message}`);
      return {
        file: file.path,
        type: 'unknown',
        status: file.status,
        error: error.message
      };
    }
  }

  /**
   * 获取文件类型
   */
  getFileType(filePath) {
    const filename = path.basename(filePath).toLowerCase();

    if (filename.includes('controller')) return 'controller';
    if (filename.includes('service')) return 'service';
    if (filename.includes('component') || filename.endsWith('.vue')) return 'component';
    if (filename.includes('model') || filename.includes('entity')) return 'model';
    if (filename.includes('config')) return 'config';
    if (filename.includes('test')) return 'test';

    return 'other';
  }

  /**
   * 分析JavaScript/TypeScript文件
   */
  analyzeJavaScriptFile(content) {
    const analysis = {
      functions: [],
      classes: [],
      imports: [],
      exports: []
    };

    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 检测函数定义
      const funcMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)|\bconst\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/);
      if (funcMatch) {
        const funcName = funcMatch[1] || funcMatch[2];
        if (funcName) {
          analysis.functions.push({
            name: funcName,
            line: i + 1,
            signature: line
          });
        }
      }

      // 检测类定义
      const classMatch = line.match(/(?:export\s+)?class\s+(\w+)/);
      if (classMatch) {
        analysis.classes.push({
          name: classMatch[1],
          line: i + 1
        });
      }

      // 检测导入
      const importMatch = line.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        analysis.imports.push(importMatch[1]);
      }

      // 检测导出
      const exportMatch = line.match(/export\s+(?:const|let|var|function|class)?\s*(\w+)/);
      if (exportMatch) {
        analysis.exports.push(exportMatch[1]);
      }
    }

    return analysis;
  }

  /**
   * 分析Vue文件
   */
  analyzeVueFile(content) {
    const analysis = {
      props: [],
      emits: [],
      components: [],
      template: false,
      script: false,
      style: false
    };

    // 检测文件结构
    analysis.template = /<template>/.test(content);
    analysis.script = /<script/.test(content);
    analysis.style = /<style/.test(content);

    // 提取props定义
    const propsMatch = content.match(/props:\s*\{([^}]+)\}/s);
    if (propsMatch) {
      const propsContent = propsMatch[1];
      const propMatches = propsContent.match(/(\w+):\s*\{[^}]*type:\s*(\w+)[^}]*\}/g);
      if (propMatches) {
        analysis.props = propMatches.map(prop => {
          const match = prop.match(/(\w+):\s*\{[^}]*type:\s*(\w+)/);
          return match ? { name: match[1], type: match[2] } : null;
        }).filter(Boolean);
      }
    }

    // 提取emits定义
    const emitsMatch = content.match(/emits:\s*\[([^\]]+)\]/);
    if (emitsMatch) {
      analysis.emits = emitsMatch[1].split(',').map(e => e.trim().replace(/['"]/g, ''));
    }

    return analysis;
  }

  /**
   * 分析Java文件
   */
  analyzeJavaFile(content) {
    const analysis = {
      className: '',
      methods: [],
      annotations: [],
      imports: []
    };

    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 检测类定义
      const classMatch = line.match(/(?:public\s+)?(?:abstract\s+)?class\s+(\w+)/);
      if (classMatch) {
        analysis.className = classMatch[1];
      }

      // 检测方法定义
      const methodMatch = line.match(/(?:public|private|protected)\s+(?:\w+\s+)+(\w+)\s*\([^)]*\)/);
      if (methodMatch) {
        analysis.methods.push({
          name: methodMatch[1],
          line: i + 1,
          signature: line
        });
      }

      // 检测注解
      if (line.startsWith('@')) {
        analysis.annotations.push({
          name: line.substring(1),
          line: i + 1
        });
      }

      // 检测导入
      const importMatch = line.match(/import\s+([^;]+)/);
      if (importMatch) {
        analysis.imports.push(importMatch[1]);
      }
    }

    return analysis;
  }

  /**
   * 识别影响范围
   */
  identifyImpactedAreas(file, fileAnalysis) {
    const areas = new Set();

    // 根据文件类型判断影响范围
    switch (fileAnalysis.type) {
      case 'controller':
        areas.add('API接口');
        areas.add('后端服务');
        break;
      case 'service':
        areas.add('业务逻辑');
        areas.add('数据处理');
        break;
      case 'component':
        areas.add('前端界面');
        areas.add('用户体验');
        break;
      case 'model':
        areas.add('数据模型');
        areas.add('数据库结构');
        break;
      case 'config':
        areas.add('系统配置');
        areas.add('环境设置');
        break;
    }

    // 根据代码变更判断影响
    if (fileAnalysis.functions && fileAnalysis.functions.length > 0) {
      areas.add('功能实现');
    }

    if (fileAnalysis.exports && fileAnalysis.exports.length > 0) {
      areas.add('模块接口');
    }

    return areas;
  }

  /**
   * 检测破坏性变更
   */
  detectBreakingChanges(file, fileAnalysis) {
    const breakingChanges = [];

    // 检查API变更
    if (file.type === 'controller') {
      if (fileAnalysis.methods) {
        fileAnalysis.methods.forEach(method => {
          if (method.signature.includes('public')) {
            breakingChanges.push({
              type: 'API变更',
              description: `控制器方法 ${method.name} 可能影响API接口`,
              severity: 'high'
            });
          }
        });
      }
    }

    // 检查组件Props变更
    if (file.type === 'component' && fileAnalysis.props) {
      fileAnalysis.props.forEach(prop => {
        breakingChanges.push({
          type: '组件接口变更',
          description: `组件属性 ${prop.name} 变更可能影响使用方`,
          severity: 'medium'
        });
      });
    }

    return breakingChanges;
  }

  /**
   * 生成文档更新
   */
  async generateDocUpdates(analysis, prInfo) {
    const docUpdates = {
      generated: [],
      updated: [],
      suggested: []
    };

    // 为每个变更的文件生成或更新文档
    for (const fileAnalysis of analysis.details) {
      try {
        const docUpdate = await this.generateFileDoc(fileAnalysis, prInfo);
        if (docUpdate) {
          docUpdates.generated.push(docUpdate);
        }
      } catch (error) {
        console.warn(`⚠️ 生成文档失败 ${fileAnalysis.file}: ${error.message}`);
      }
    }

    // 生成变更日志
    const changeLog = await this.generateChangeLog(analysis, prInfo);
    docUpdates.generated.push({
      type: 'changelog',
      path: `docs/changelog/pr-${prInfo.number}.md`,
      content: changeLog
    });

    return docUpdates;
  }

  /**
   * 为单个文件生成文档
   */
  async generateFileDoc(fileAnalysis, prInfo) {
    const filePath = fileAnalysis.file;
    const fileType = fileAnalysis.type;

    // 确定文档输出路径
    const docPath = this.getDocPath(filePath, fileType);
    if (!docPath) return null;

    let docContent = '';

    // 根据文件类型生成不同文档
    switch (fileType) {
      case 'controller':
      case 'service':
        docContent = await this.aiManager.generateApiDoc(
          this.readFileContent(filePath),
          {
            fileType,
            prNumber: prInfo.number,
            changeType: fileAnalysis.status
          }
        );
        break;

      case 'component':
        docContent = await this.aiManager.generateComponentDoc(
          this.readFileContent(filePath),
          {
            fileType,
            prNumber: prInfo.number,
            changeType: fileAnalysis.status
          }
        );
        break;

      default:
        // 使用通用文档生成
        docContent = await this.aiManager.enhanceDocumentation(
          `文件: ${filePath}\n类型: ${fileType}\n变更: ${fileAnalysis.status}`,
          'expand'
        );
    }

    return {
      type: fileType,
      path: docPath,
      content: docContent,
      sourceFile: filePath
    };
  }

  /**
   * 获取文档输出路径
   */
  getDocPath(filePath, fileType) {
    const baseName = path.basename(filePath, path.extname(filePath));
    const mapping = this.config.docMapping[fileType];

    if (!mapping) return null;

    return path.join(mapping, `${baseName}.md`);
  }

  /**
   * 读取文件内容
   */
  readFileContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.warn(`⚠️ 无法读取文件 ${filePath}: ${error.message}`);
      return '';
    }
  }

  /**
   * 生成变更日志
   */
  async generateChangeLog(analysis, prInfo) {
    const template = `# PR #${prInfo.number} 变更日志

## 概述

**标题**: ${prInfo.title}
**作者**: ${prInfo.author}
**时间**: ${new Date().toISOString()}
**分支**: ${prInfo.branch} → ${prInfo.baseBranch}

## 变更统计

- **总文件数**: ${analysis.summary.totalFiles}
- **新增**: ${analysis.summary.added}
- **修改**: ${analysis.summary.modified}
- **删除**: ${analysis.summary.deleted}

## 变更详情

| 文件 | 类型 | 变更类型 | 影响范围 |
|------|------|----------|----------|
${analysis.details.map(detail => `| ${detail.file} | ${detail.type} | ${this.config.changeTypes[detail.status]} | ${this.identifyImpactedAreas({path: detail.file}, detail).join(', ')} |`).join('\n')}

## 影响范围

${Array.from(analysis.impactedAreas).map(area => `- ${area}`).join('\n')}

## 破坏性变更

${analysis.breakingChanges.length > 0
  ? analysis.breakingChanges.map(change =>
      `- **${change.type}**: ${change.description} (严重程度: ${change.severity})`
    ).join('\n')
  : '无破坏性变更'
}

## 文档更新

本次PR自动生成了以下文档：

${analysis.details.map(detail => `- ${detail.file} → ${this.getDocPath(detail.file, detail.type) || '无对应文档'}`).join('\n')}

---

*自动生成于 ${new Date().toISOString()}*
`;

    return template;
  }

  /**
   * 生成PR总结文档
   */
  async generatePRSummary(prInfo, analysis, docUpdates) {
    const summary = `# PR #${prInfo.number} 总结报告

## PR信息

- **标题**: ${prInfo.title}
- **作者**: ${prInfo.author}
- **创建时间**: ${prInfo.createdAt}
- **目标分支**: ${prInfo.baseBranch}

## 变更分析

### 文件变更统计
- 新增文件: ${analysis.summary.added}
- 修改文件: ${analysis.summary.modified}
- 删除文件: ${analysis.summary.deleted}

### 影响范围
${analysis.impactedAreas.map(area => `- ${area}`).join('\n')}

## 生成的文档

### API文档
${docUpdates.generated.filter(d => d.type === 'controller' || d.type === 'service').map(d => `- ${d.path}`).join('\n') || '无'}

### 组件文档
${docUpdates.generated.filter(d => d.type === 'component').map(d => `- ${d.path}`).join('\n') || '无'}

### 其他文档
${docUpdates.generated.filter(d => !['controller', 'service', 'component'].includes(d.type)).map(d => `- ${d.path}`).join('\n') || '无'}

## 质量检查

- ✅ 文档自动生成完成
- ✅ 变更日志已创建
- ✅ 影响范围已分析

## 下一步操作

1. 审查生成的文档内容
2. 确认API变更的兼容性
3. 更新相关使用文档
4. 通知相关团队成员

---

*AI生成于 ${new Date().toISOString()}*
`;

    return summary;
  }

  /**
   * 保存文档更新
   */
  async saveDocUpdates(docUpdates, basePath = 'docs') {
    for (const update of docUpdates.generated) {
      const fullPath = path.join(basePath, update.path);

      // 确保目录存在
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 写入文件
      fs.writeFileSync(fullPath, update.content);
      console.log(`📝 已生成文档: ${fullPath}`);
    }
  }

  /**
   * 运行PR文档生成
   */
  async run(options = {}) {
    const {
      prNumber,
      repoPath = process.cwd(),
      save = true,
      output = 'docs'
    } = options;

    if (!prNumber) {
      console.error('请提供PR编号: --pr-number <number>');
      process.exit(1);
    }

    try {
      console.log(`🚀 开始处理PR #${prNumber}...`);

      const result = await this.analyzePR(prNumber, repoPath);

      console.log('📊 分析完成，结果:');
      console.log(`   - 变更文件: ${result.analysis.summary.totalFiles}`);
      console.log(`   - 生成文档: ${result.docUpdates.generated.length}`);
      console.log(`   - 影响范围: ${result.analysis.impactedAreas.join(', ')}`);

      if (save) {
        await this.saveDocUpdates(result.docUpdates, output);
        console.log('✅ 文档已保存');
      }

      // 保存PR总结
      const summaryPath = path.join(output, `pr-summary-${prNumber}.md`);
      fs.writeFileSync(summaryPath, result.prSummary);
      console.log(`📋 PR总结已保存: ${summaryPath}`);

      return result;

    } catch (error) {
      console.error('❌ 处理失败:', error.message);
      throw error;
    }
  }
}

// CLI接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--pr-number':
      case '-p':
        options.prNumber = args[++i];
        break;
      case '--repo-path':
      case '-r':
        options.repoPath = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--no-save':
        options.save = false;
        break;
    }
  }

  const generator = new PRDocGenerator();
  generator.run(options).catch(console.error);
}

module.exports = PRDocGenerator;
