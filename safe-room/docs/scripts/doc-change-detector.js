#!/usr/bin/env node

/**
 * 文档变更检测和一致性检查工具
 * 检测代码变更对文档的影响，确保文档与代码的一致性
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class DocChangeDetector {
  constructor() {
    this.config = this.loadConfig();
    this.cache = this.loadCache();
  }

  loadConfig() {
    return {
      // 检测范围
      scopes: {
        api: {
          codePattern: 'springboot1ngh61a2/src/main/java/**/*.java',
          docPattern: 'docs/technical/api/**/*.md',
          detectors: ['api-signature', 'annotation-change', 'method-addition']
        },
        component: {
          codePattern: 'springboot1ngh61a2/src/main/resources/front/front/src/**/*.vue',
          docPattern: 'docs/technical/frontend/components/**/*.md',
          detectors: ['prop-change', 'event-change', 'slot-change']
        },
        config: {
          codePattern: '**/*config*.{js,ts,json,yml,yaml}',
          docPattern: 'docs/technical/backend/config/**/*.md',
          detectors: ['config-key-change', 'structure-change']
        }
      },

      // 检测规则
      rules: {
        'api-signature': {
          severity: 'high',
          message: 'API接口签名变更可能破坏向后兼容性'
        },
        'annotation-change': {
          severity: 'medium',
          message: '注解变更可能影响API行为'
        },
        'method-addition': {
          severity: 'low',
          message: '新增方法需要补充文档'
        },
        'prop-change': {
          severity: 'high',
          message: '组件属性变更影响使用方'
        },
        'event-change': {
          severity: 'high',
          message: '组件事件变更影响交互逻辑'
        },
        'slot-change': {
          severity: 'medium',
          message: '插槽变更影响组件布局'
        }
      },

      // 缓存配置
      cache: {
        file: '.doc-change-cache.json',
        ttl: 3600000 // 1小时
      }
    };
  }

  loadCache() {
    try {
      const cachePath = this.config.cache.file;
      if (fs.existsSync(cachePath)) {
        const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        // 清理过期缓存
        const now = Date.now();
        Object.keys(cacheData).forEach(key => {
          if (now - cacheData[key].timestamp > this.config.cache.ttl) {
            delete cacheData[key];
          }
        });
        return cacheData;
      }
    } catch (error) {
      console.warn('⚠️ 加载缓存失败:', error.message);
    }
    return {};
  }

  saveCache() {
    try {
      fs.writeFileSync(this.config.cache.file, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.warn('⚠️ 保存缓存失败:', error.message);
    }
  }

  /**
   * 执行变更检测
   */
  async detectChanges(options = {}) {
    const {
      scope = 'all',
      baseline = 'HEAD~1',
      target = 'HEAD',
      output = 'console'
    } = options;

    console.log(`🔍 开始变更检测...`);
    console.log(`   基准: ${baseline}`);
    console.log(`   目标: ${target}`);
    console.log(`   范围: ${scope}`);

    const results = {
      timestamp: new Date().toISOString(),
      baseline,
      target,
      scope,
      changes: [],
      inconsistencies: [],
      recommendations: []
    };

    // 获取变更文件
    const changedFiles = await this.getChangedFiles(baseline, target);

    // 根据范围过滤文件
    const relevantFiles = this.filterRelevantFiles(changedFiles, scope);

    console.log(`📁 发现 ${changedFiles.length} 个变更文件，${relevantFiles.length} 个相关文件`);

    // 分析每个相关文件
    for (const file of relevantFiles) {
      const fileAnalysis = await this.analyzeFileChanges(file, baseline, target);
      if (fileAnalysis.changes.length > 0) {
        results.changes.push(fileAnalysis);
      }
    }

    // 检测文档一致性
    results.inconsistencies = await this.detectInconsistencies(results.changes);

    // 生成修复建议
    results.recommendations = this.generateRecommendations(results);

    // 输出结果
    this.outputResults(results, output);

    // 更新缓存
    this.updateCache(results);
    this.saveCache();

    return results;
  }

  /**
   * 获取变更文件列表
   */
  async getChangedFiles(baseline, target) {
    try {
      const gitCommand = `git diff --name-status ${baseline} ${target}`;
      const output = execSync(gitCommand, { encoding: 'utf-8' });

      return output.trim().split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [status, file] = line.split('\t');
          return {
            status: this.parseGitStatus(status),
            path: file,
            extension: path.extname(file)
          };
        });

    } catch (error) {
      console.error('❌ 获取变更文件失败:', error.message);
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
      'R': 'renamed',
      'C': 'copied',
      'U': 'unmerged'
    };
    return statusMap[status] || 'unknown';
  }

  /**
   * 过滤相关文件
   */
  filterRelevantFiles(files, scope) {
    if (scope === 'all') {
      return files.filter(file =>
        Object.values(this.config.scopes).some(config =>
          this.matchPattern(file.path, config.codePattern)
        )
      );
    }

    const scopeConfig = this.config.scopes[scope];
    if (!scopeConfig) {
      console.warn(`⚠️ 未知的检测范围: ${scope}`);
      return [];
    }

    return files.filter(file =>
      this.matchPattern(file.path, scopeConfig.codePattern)
    );
  }

  /**
   * 匹配文件模式
   */
  matchPattern(filePath, pattern) {
    // 简单的glob匹配实现
    const regex = new RegExp(pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.')
    );
    return regex.test(filePath);
  }

  /**
   * 分析单个文件的变更
   */
  async analyzeFileChanges(file, baseline, target) {
    const analysis = {
      file: file.path,
      status: file.status,
      scope: this.getFileScope(file.path),
      changes: [],
      hash: this.getFileHash(file.path)
    };

    try {
      // 获取文件变更详情
      const diff = await this.getFileDiff(file.path, baseline, target);

      // 根据文件类型应用不同的检测器
      const detectors = this.getDetectorsForFile(file.path);
      for (const detector of detectors) {
        const detectedChanges = await this.applyDetector(detector, file, diff);
        analysis.changes.push(...detectedChanges);
      }

    } catch (error) {
      console.warn(`⚠️ 分析文件失败 ${file.path}: ${error.message}`);
    }

    return analysis;
  }

  /**
   * 获取文件差异
   */
  async getFileDiff(filePath, baseline, target) {
    try {
      const gitCommand = `git diff ${baseline} ${target} -- ${filePath}`;
      const output = execSync(gitCommand, { encoding: 'utf-8' });
      return output;
    } catch (error) {
      // 文件可能不存在于baseline中
      return '';
    }
  }

  /**
   * 获取文件所属范围
   */
  getFileScope(filePath) {
    for (const [scope, config] of Object.entries(this.config.scopes)) {
      if (this.matchPattern(filePath, config.codePattern)) {
        return scope;
      }
    }
    return 'unknown';
  }

  /**
   * 获取适用于文件的检测器
   */
  getDetectorsForFile(filePath) {
    const scope = this.getFileScope(filePath);
    const scopeConfig = this.config.scopes[scope];
    return scopeConfig ? scopeConfig.detectors : [];
  }

  /**
   * 应用检测器
   */
  async applyDetector(detectorName, file, diff) {
    const detector = this.detectors[detectorName];
    if (!detector) {
      console.warn(`⚠️ 未找到检测器: ${detectorName}`);
      return [];
    }

    try {
      return await detector.call(this, file, diff);
    } catch (error) {
      console.warn(`⚠️ 检测器 ${detectorName} 执行失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 检测器集合
   */
  detectors = {
    /**
     * API签名变更检测
     */
    'api-signature': async function(file, diff) {
      const changes = [];
      const lines = diff.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检测方法签名变更
        if (line.startsWith('@@') && line.includes('@@')) {
          // 这是一个diff块
          const hunk = this.extractHunk(lines, i);
          const methodChanges = this.detectMethodSignatureChanges(hunk);

          changes.push(...methodChanges.map(change => ({
            type: 'api-signature',
            ...change,
            severity: this.config.rules['api-signature'].severity
          })));
        }
      }

      return changes;
    },

    /**
     * 注解变更检测
     */
    'annotation-change': async function(file, diff) {
      const changes = [];
      const annotationRegex = /^[-+](\s*)@\w+/gm;
      let match;

      while ((match = annotationRegex.exec(diff)) !== null) {
        const line = match[0];
        const isAddition = line.startsWith('+');

        changes.push({
          type: 'annotation-change',
          description: `注解 ${line.substring(1).trim()} ${isAddition ? '新增' : '删除'}`,
          line: this.getLineNumber(diff, match.index),
          severity: this.config.rules['annotation-change'].severity
        });
      }

      return changes;
    },

    /**
     * 方法新增检测
     */
    'method-addition': async function(file, diff) {
      const changes = [];
      const methodRegex = /^\+(\s*)(public|private|protected)?(\s+)([\w<>]+\s+)?(\w+)\s*\(/gm;
      let match;

      while ((match = methodRegex.exec(diff)) !== null) {
        changes.push({
          type: 'method-addition',
          description: `新增方法: ${match[5]}`,
          line: this.getLineNumber(diff, match.index),
          severity: this.config.rules['method-addition'].severity
        });
      }

      return changes;
    },

    /**
     * 组件属性变更检测
     */
    'prop-change': async function(file, diff) {
      const changes = [];
      const propRegex = /^[-+](\s*)(props|defineProps)/gm;
      let match;

      while ((match = propRegex.exec(diff)) !== null) {
        const line = match[0];
        const isAddition = line.startsWith('+');

        changes.push({
          type: 'prop-change',
          description: `组件属性定义 ${isAddition ? '新增' : '删除'}`,
          line: this.getLineNumber(diff, match.index),
          severity: this.config.rules['prop-change'].severity
        });
      }

      return changes;
    },

    /**
     * 组件事件变更检测
     */
    'event-change': async function(file, diff) {
      const changes = [];
      const eventRegex = /^[-+](\s*)(emit|defineEmits)/gm;
      let match;

      while ((match = eventRegex.exec(diff)) !== null) {
        const line = match[0];
        const isAddition = line.startsWith('+');

        changes.push({
          type: 'event-change',
          description: `组件事件定义 ${isAddition ? '新增' : '删除'}`,
          line: this.getLineNumber(diff, match.index),
          severity: this.config.rules['event-change'].severity
        });
      }

      return changes;
    }
  };

  /**
   * 提取diff块
   */
  extractHunk(lines, startIndex) {
    const hunk = [];
    let i = startIndex;

    // 跳过hunk头
    if (lines[i].startsWith('@@')) i++;

    // 收集hunk内容直到下一个hunk或文件结束
    while (i < lines.length && !lines[i].startsWith('@@')) {
      hunk.push(lines[i]);
      i++;
    }

    return hunk;
  }

  /**
   * 检测方法签名变更
   */
  detectMethodSignatureChanges(hunk) {
    const changes = [];
    const methodRegex = /^(?:[-+]\s*)(public|private|protected)?\s+[\w<>[\]]+\s+(\w+)\s*\([^)]*\)/;

    hunk.forEach(line => {
      const match = line.match(methodRegex);
      if (match) {
        const isAddition = line.startsWith('+');
        changes.push({
          description: `方法 ${match[2]} ${isAddition ? '新增' : '删除/修改'}`,
          method: match[2],
          visibility: match[1] || 'package'
        });
      }
    });

    return changes;
  }

  /**
   * 获取行号
   */
  getLineNumber(diff, index) {
    const beforeIndex = diff.lastIndexOf('\n', index);
    const lineStart = diff.lastIndexOf('\n@@', beforeIndex) + 1;
    const lineContent = diff.substring(lineStart, beforeIndex);

    // 解析@@ -a,b +c,d @@格式获取行号
    const hunkMatch = lineContent.match(/@@\s*-(\d+),?\d*\s*\+(\d+),?\d*\s*@@/);
    if (hunkMatch) {
      return parseInt(hunkMatch[2]);
    }

    return 0;
  }

  /**
   * 获取文件哈希
   */
  getFileHash(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return '';
    }
  }

  /**
   * 检测文档一致性问题
   */
  async detectInconsistencies(changes) {
    const inconsistencies = [];

    for (const change of changes) {
      // 检查是否有对应的文档
      const docPath = this.getCorrespondingDocPath(change.file);
      if (!docPath) {
        inconsistencies.push({
          type: 'missing-documentation',
          file: change.file,
          message: `缺少对应的文档文件`,
          severity: 'medium'
        });
        continue;
      }

      // 检查文档是否是最新的
      const docExists = fs.existsSync(docPath);
      if (!docExists) {
        inconsistencies.push({
          type: 'outdated-documentation',
          file: change.file,
          docPath,
          message: `文档文件不存在`,
          severity: 'high'
        });
        continue;
      }

      // 检查文档内容是否包含变更信息
      const docContent = fs.readFileSync(docPath, 'utf-8');
      const needsUpdate = this.checkDocNeedsUpdate(change, docContent);

      if (needsUpdate) {
        inconsistencies.push({
          type: 'content-mismatch',
          file: change.file,
          docPath,
          message: `文档内容与代码变更不一致`,
          severity: 'medium'
        });
      }
    }

    return inconsistencies;
  }

  /**
   * 获取对应的文档路径
   */
  getCorrespondingDocPath(codePath) {
    const scope = this.getFileScope(codePath);
    if (scope === 'unknown') return null;

    const scopeConfig = this.config.scopes[scope];
    const baseName = path.basename(codePath, path.extname(codePath));

    // 根据不同类型生成文档路径
    switch (scope) {
      case 'api':
        return path.join('docs/technical/api', `${baseName}.md`);
      case 'component':
        return path.join('docs/technical/frontend/components', baseName, `${baseName}.md`);
      case 'config':
        return path.join('docs/technical/backend/config', `${baseName}.md`);
      default:
        return null;
    }
  }

  /**
   * 检查文档是否需要更新
   */
  checkDocNeedsUpdate(change, docContent) {
    // 简单的启发式检查
    for (const changeItem of change.changes) {
      switch (changeItem.type) {
        case 'method-addition':
          if (!docContent.includes(changeItem.method)) {
            return true;
          }
          break;
        case 'prop-change':
          if (!docContent.includes('props') || !docContent.includes('属性')) {
            return true;
          }
          break;
      }
    }
    return false;
  }

  /**
   * 生成修复建议
   */
  generateRecommendations(results) {
    const recommendations = [];

    // 根据变更类型生成建议
    results.changes.forEach(change => {
      change.changes.forEach(changeItem => {
        const rule = this.config.rules[changeItem.type];
        if (rule) {
          recommendations.push({
            type: changeItem.type,
            file: change.file,
            message: rule.message,
            severity: rule.severity,
            action: this.getRecommendedAction(changeItem.type)
          });
        }
      });
    });

    // 根据不一致问题生成建议
    results.inconsistencies.forEach(inconsistency => {
      recommendations.push({
        type: inconsistency.type,
        file: inconsistency.file,
        message: inconsistency.message,
        severity: inconsistency.severity,
        action: this.getConsistencyAction(inconsistency.type)
      });
    });

    return recommendations;
  }

  /**
   * 获取推荐操作
   */
  getRecommendedAction(changeType) {
    const actions = {
      'api-signature': '更新API文档，说明变更影响和兼容性',
      'annotation-change': '检查注解变更是否影响API行为，更新文档',
      'method-addition': '为新增方法编写完整的API文档',
      'prop-change': '更新组件文档的Props部分',
      'event-change': '更新组件文档的Events部分'
    };
    return actions[changeType] || '检查并更新相关文档';
  }

  /**
   * 获取一致性修复操作
   */
  getConsistencyAction(inconsistencyType) {
    const actions = {
      'missing-documentation': '创建对应的文档文件',
      'outdated-documentation': '生成或更新文档内容',
      'content-mismatch': '同步文档内容以反映代码变更'
    };
    return actions[inconsistencyType] || '检查文档一致性';
  }

  /**
   * 输出结果
   */
  outputResults(results, format) {
    switch (format) {
      case 'json':
        console.log(JSON.stringify(results, null, 2));
        break;
      case 'file':
        const outputPath = `docs/reports/change-detection-${Date.now()}.json`;
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        console.log(`📄 检测结果已保存到: ${outputPath}`);
        break;
      default:
        this.outputConsole(results);
    }
  }

  /**
   * 控制台输出
   */
  outputConsole(results) {
    console.log('\n📊 变更检测结果');
    console.log('='.repeat(50));

    console.log(`🔍 检测范围: ${results.scope}`);
    console.log(`📁 变更文件: ${results.changes.length}`);
    console.log(`⚠️ 不一致问题: ${results.inconsistencies.length}`);
    console.log(`💡 修复建议: ${results.recommendations.length}`);

    if (results.changes.length > 0) {
      console.log('\n📋 详细变更:');
      results.changes.forEach(change => {
        console.log(`  📄 ${change.file} (${change.status})`);
        change.changes.forEach(item => {
          const severity = item.severity === 'high' ? '🔴' :
                          item.severity === 'medium' ? '🟡' : '🟢';
          console.log(`    ${severity} ${item.description}`);
        });
      });
    }

    if (results.inconsistencies.length > 0) {
      console.log('\n⚠️ 文档一致性问题:');
      results.inconsistencies.forEach(issue => {
        const severity = issue.severity === 'high' ? '🔴' :
                        issue.severity === 'medium' ? '🟡' : '🟢';
        console.log(`  ${severity} ${issue.file}: ${issue.message}`);
      });
    }

    if (results.recommendations.length > 0) {
      console.log('\n💡 修复建议:');
      results.recommendations.forEach(rec => {
        const severity = rec.severity === 'high' ? '🔴' :
                        rec.severity === 'medium' ? '🟡' : '🟢';
        console.log(`  ${severity} ${rec.action}`);
        console.log(`    📄 ${rec.file}`);
      });
    }
  }

  /**
   * 更新缓存
   */
  updateCache(results) {
    results.changes.forEach(change => {
      this.cache[change.file] = {
        hash: change.hash,
        timestamp: Date.now(),
        lastAnalysis: results.timestamp
      };
    });
  }
}

// CLI接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--scope':
      case '-s':
        options.scope = args[++i];
        break;
      case '--baseline':
      case '-b':
        options.baseline = args[++i];
        break;
      case '--target':
      case '-t':
        options.target = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
    }
  }

  const detector = new DocChangeDetector();
  detector.detectChanges(options).catch(console.error);
}

module.exports = DocChangeDetector;
