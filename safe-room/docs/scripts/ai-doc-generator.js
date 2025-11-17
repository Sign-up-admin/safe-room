#!/usr/bin/env node

/**
 * AI文档生成器
 * 集成Claude和ChatGPT API，实现自动化文档生成
 */

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const config = require('../config/ai-tools-config.js');

// AI工具类
class AIToolManager {
  constructor() {
    this.config = config;
    this.claude = null;
    this.chatgpt = null;
    this.cache = new Map();
    this.initializeClients();
  }

  initializeClients() {
    // 初始化Claude客户端
    if (this.config.claude.apiKey) {
      this.claude = new Anthropic({
        apiKey: this.config.claude.apiKey,
      });
    }

    // 初始化ChatGPT客户端
    if (this.config.chatgpt.apiKey) {
      this.chatgpt = new OpenAI({
        apiKey: this.config.chatgpt.apiKey,
      });
    }
  }

  /**
   * 根据场景选择合适的AI工具
   */
  selectTool(scenario) {
    const toolName = this.config.strategy.scenarios[scenario] || this.config.strategy.primary;

    switch (toolName) {
      case 'claude':
        return this.claude ? 'claude' : (this.chatgpt ? 'chatgpt' : null);
      case 'chatgpt':
        return this.chatgpt ? 'chatgpt' : (this.claude ? 'claude' : null);
      default:
        return this.config.strategy.primary;
    }
  }

  /**
   * 生成API文档
   */
  async generateApiDoc(codeSnippet, context = {}) {
    const tool = this.selectTool('api-doc-generation');
    if (!tool) {
      throw new Error('No AI tool available for API documentation generation');
    }

    const prompt = this.buildApiDocPrompt(codeSnippet, context);

    try {
      let response;
      if (tool === 'claude') {
        response = await this.callClaude(prompt);
      } else {
        response = await this.callChatGPT(prompt);
      }

      return this.postProcessApiDoc(response);
    } catch (error) {
      console.error(`AI文档生成失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 生成组件文档
   */
  async generateComponentDoc(componentCode, componentInfo = {}) {
    const tool = this.selectTool('component-doc-enhancement');
    const prompt = this.buildComponentDocPrompt(componentCode, componentInfo);

    try {
      let response;
      if (tool === 'claude') {
        response = await this.callClaude(prompt);
      } else {
        response = await this.callChatGPT(prompt);
      }

      return this.postProcessComponentDoc(response);
    } catch (error) {
      console.error(`组件文档生成失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 优化现有文档
   */
  async enhanceDocumentation(content, enhancementType = 'review') {
    const tool = this.selectTool('documentation-review');
    const prompt = this.buildEnhancementPrompt(content, enhancementType);

    try {
      let response;
      if (tool === 'claude') {
        response = await this.callClaude(prompt);
      } else {
        response = await this.callChatGPT(prompt);
      }

      return response;
    } catch (error) {
      console.error(`文档优化失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 调用Claude API
   */
  async callClaude(prompt) {
    const startTime = Date.now();

    try {
      const response = await this.claude.messages.create({
        model: this.config.claude.model,
        max_tokens: this.config.claude.maxTokens,
        temperature: this.config.claude.temperature,
        system: '你是一个专业的技术文档工程师，擅长编写清晰、准确、规范的技术文档。请使用中文回复。',
        messages: [{ role: 'user', content: prompt }]
      });

      const duration = Date.now() - startTime;
      console.log(`Claude API调用完成，耗时: ${duration}ms`);

      return response.content[0].text;
    } catch (error) {
      console.error(`Claude API调用失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 调用ChatGPT API
   */
  async callChatGPT(prompt) {
    const startTime = Date.now();

    try {
      const response = await this.chatgpt.chat.completions.create({
        model: this.config.chatgpt.model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的技术文档工程师，擅长编写清晰、准确、规范的技术文档。请使用中文回复。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.config.chatgpt.temperature,
        max_tokens: this.config.chatgpt.maxTokens
      });

      const duration = Date.now() - startTime;
      console.log(`ChatGPT API调用完成，耗时: ${duration}ms`);

      return response.choices[0].message.content;
    } catch (error) {
      console.error(`ChatGPT API调用失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 构建API文档生成提示
   */
  buildApiDocPrompt(codeSnippet, context) {
    return `
请根据以下代码片段生成完整的API文档：

**代码片段：**
\`\`\`javascript
${codeSnippet}
\`\`\`

**上下文信息：**
${JSON.stringify(context, null, 2)}

**要求：**
1. 使用Markdown格式
2. 包含完整的函数/方法签名
3. 详细的参数说明（类型、含义、是否必需）
4. 返回值类型和说明
5. 可能抛出的异常
6. 使用示例
7. 注意事项和最佳实践

**输出格式：**
请直接输出Markdown格式的API文档，不要包含其他说明。
    `;
  }

  /**
   * 构建组件文档生成提示
   */
  buildComponentDocPrompt(componentCode, componentInfo) {
    return `
请根据以下Vue组件代码生成完整的组件文档：

**组件代码：**
\`\`\`vue
${componentCode}
\`\`\`

**组件信息：**
${JSON.stringify(componentInfo, null, 2)}

**要求：**
1. 使用Markdown格式
2. 包含组件概述和用途
3. Props属性详细说明
4. Events事件说明
5. Methods方法说明
6. 使用示例
7. 注意事项

**输出格式：**
请直接输出Markdown格式的组件文档。
    `;
  }

  /**
   * 构建文档优化提示
   */
  buildEnhancementPrompt(content, type) {
    const prompts = {
      'simplify': '请简化以下技术文档，使其更易理解，同时保持技术准确性：',
      'expand': '请扩展以下文档，添加更多技术细节、使用示例和最佳实践：',
      'translate': '请将以下技术文档翻译成规范的中文：',
      'review': '请审查以下文档的质量，提供改进建议和修改后的版本：',
      'standardize': '请根据项目文档规范，标准化以下文档的格式和结构：'
    };

    return `${prompts[type] || prompts.review}

**文档内容：**
${content}

请直接输出优化后的文档内容。`;
  }

  /**
   * 后处理API文档
   */
  postProcessApiDoc(content) {
    // 确保Markdown格式正确
    if (!content.includes('#')) {
      content = `# API文档\n\n${content}`;
    }

    // 添加版本信息
    const versionInfo = `\n---\n*生成时间：${new Date().toISOString()} | AI生成*`;

    return content + versionInfo;
  }

  /**
   * 后处理组件文档
   */
  postProcessComponentDoc(content) {
    // 确保组件文档结构完整
    if (!content.includes('## Props')) {
      content += '\n\n## Props\n\n暂无Props定义\n';
    }

    if (!content.includes('## Events')) {
      content += '\n\n## Events\n\n暂无Events定义\n';
    }

    // 添加版本信息
    const versionInfo = `\n---\n*生成时间：${new Date().toISOString()} | AI生成*`;

    return content + versionInfo;
  }

  /**
   * 获取缓存的响应
   */
  getCached(key) {
    if (!this.config.cache.enabled) return null;

    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.config.cache.ttl) {
      return cached.data;
    }

    return null;
  }

  /**
   * 设置缓存
   */
  setCached(key, data) {
    if (!this.config.cache.enabled) return;

    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }
}

// 命令行接口
class AIDocGeneratorCLI {
  constructor() {
    this.aiManager = new AIToolManager();
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'api-doc':
        await this.generateApiDoc(args.slice(1));
        break;
      case 'component-doc':
        await this.generateComponentDoc(args.slice(1));
        break;
      case 'enhance':
        await this.enhanceDoc(args.slice(1));
        break;
      case 'batch':
        await this.batchGenerate(args.slice(1));
        break;
      default:
        this.showHelp();
    }
  }

  async generateApiDoc(args) {
    const [inputFile, outputFile] = args;

    if (!inputFile) {
      console.error('请提供输入文件路径');
      process.exit(1);
    }

    try {
      const code = fs.readFileSync(inputFile, 'utf-8');
      const context = this.extractContextFromFile(inputFile);

      console.log('正在生成API文档...');
      const doc = await this.aiManager.generateApiDoc(code, context);

      const outputPath = outputFile || inputFile.replace(/\.(js|ts)$/, '.api.md');
      fs.writeFileSync(outputPath, doc);

      console.log(`✅ API文档已生成: ${outputPath}`);
    } catch (error) {
      console.error('❌ API文档生成失败:', error.message);
      process.exit(1);
    }
  }

  async generateComponentDoc(args) {
    const [inputFile, outputFile] = args;

    if (!inputFile) {
      console.error('请提供组件文件路径');
      process.exit(1);
    }

    try {
      const code = fs.readFileSync(inputFile, 'utf-8');
      const componentInfo = this.extractComponentInfo(inputFile);

      console.log('正在生成组件文档...');
      const doc = await this.aiManager.generateComponentDoc(code, componentInfo);

      const outputPath = outputFile || inputFile.replace(/\.vue$/, '.md');
      fs.writeFileSync(outputPath, doc);

      console.log(`✅ 组件文档已生成: ${outputPath}`);
    } catch (error) {
      console.error('❌ 组件文档生成失败:', error.message);
      process.exit(1);
    }
  }

  async enhanceDoc(args) {
    const [inputFile, type = 'review', outputFile] = args;

    if (!inputFile) {
      console.error('请提供文档文件路径');
      process.exit(1);
    }

    try {
      const content = fs.readFileSync(inputFile, 'utf-8');

      console.log(`正在优化文档 (${type})...`);
      const enhanced = await this.aiManager.enhanceDocumentation(content, type);

      const outputPath = outputFile || inputFile.replace(/\.md$/, `.enhanced.${type}.md`);
      fs.writeFileSync(outputPath, enhanced);

      console.log(`✅ 文档优化完成: ${outputPath}`);
    } catch (error) {
      console.error('❌ 文档优化失败:', error.message);
      process.exit(1);
    }
  }

  async batchGenerate(args) {
    const [inputDir, outputDir] = args;

    if (!inputDir) {
      console.error('请提供输入目录路径');
      process.exit(1);
    }

    const output = outputDir || './docs/generated';

    // 确保输出目录存在
    if (!fs.existsSync(output)) {
      fs.mkdirSync(output, { recursive: true });
    }

    // 扫描并处理文件
    const files = this.scanFiles(inputDir);
    console.log(`发现 ${files.length} 个文件待处理`);

    for (const file of files) {
      try {
        const relativePath = path.relative(inputDir, file);
        const outputPath = path.join(output, relativePath.replace(/\.(js|ts|vue)$/, '.md'));

        // 确保输出子目录存在
        const outputDirPath = path.dirname(outputPath);
        if (!fs.existsSync(outputDirPath)) {
          fs.mkdirSync(outputDirPath, { recursive: true });
        }

        if (file.endsWith('.vue')) {
          await this.generateComponentDoc([file, outputPath]);
        } else if (file.endsWith('.js') || file.endsWith('.ts')) {
          await this.generateApiDoc([file, outputPath]);
        }

        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`处理文件失败 ${file}: ${error.message}`);
      }
    }

    console.log('✅ 批量文档生成完成');
  }

  scanFiles(dir) {
    const files = [];

    function scan(currentDir) {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scan(fullPath);
        } else if (stat.isFile() && /\.(js|ts|vue)$/.test(item)) {
          files.push(fullPath);
        }
      }
    }

    scan(dir);
    return files;
  }

  extractContextFromFile(filePath) {
    // 提取文件上下文信息
    const dir = path.dirname(filePath);
    const filename = path.basename(filePath);

    return {
      filePath: filePath,
      directory: dir,
      filename: filename,
      project: path.basename(process.cwd()),
      language: filename.endsWith('.ts') ? 'typescript' : 'javascript'
    };
  }

  extractComponentInfo(filePath) {
    const filename = path.basename(filePath, '.vue');

    return {
      name: filename,
      filePath: filePath,
      framework: 'vue',
      version: '3.x'
    };
  }

  showHelp() {
    console.log(`
AI文档生成器使用帮助：

用法: node ai-doc-generator.js <command> [options]

命令:
  api-doc <input-file> [output-file]     生成API文档
  component-doc <input-file> [output-file] 生成组件文档
  enhance <input-file> [type] [output-file] 优化现有文档
  batch <input-dir> [output-dir]         批量生成文档

选项:
  type: simplify|expand|translate|review|standardize (默认: review)

示例:
  node ai-doc-generator.js api-doc src/api/user.js
  node ai-doc-generator.js component-doc src/components/Button.vue
  node ai-doc-generator.js enhance docs/api.md simplify
  node ai-doc-generator.js batch src/components

环境变量:
  CLAUDE_API_KEY    Claude API密钥
  OPENAI_API_KEY    OpenAI API密钥
    `);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const cli = new AIDocGeneratorCLI();
  cli.run().catch(console.error);
}

module.exports = AIToolManager;
