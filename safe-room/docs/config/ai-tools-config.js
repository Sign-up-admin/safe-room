/**
 * AI工具集成配置文件
 * 管理Claude、ChatGPT等AI工具的配置和使用策略
 */

module.exports = {
  // Claude配置
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
    model: 'claude-3-sonnet-20240229',
    maxTokens: 2000,
    temperature: 0.3,
    timeout: 30000 // 30秒超时
  },

  // ChatGPT配置
  chatgpt: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    maxTokens: 1500,
    temperature: 0.3,
    timeout: 30000
  },

  // GitHub Copilot配置（工作区级别）
  copilot: {
    enabled: true,
    workspaceInstructions: '.github/copilot-instructions.md',
    autoGenerate: {
      comments: true,
      docstrings: true,
      apiDocs: false // 通过专门脚本处理
    }
  },

  // 使用策略配置
  strategy: {
    // 主要工具选择
    primary: 'claude',      // 主要文档生成使用Claude
    secondary: 'chatgpt',   // 辅助优化使用ChatGPT
    fallback: 'copilot',    // IDE辅助使用Copilot

    // 场景映射
    scenarios: {
      'api-doc-generation': 'claude',
      'component-doc-enhancement': 'claude',
      'code-comment-generation': 'copilot',
      'documentation-review': 'chatgpt',
      'architecture-explanation': 'claude'
    }
  },

  // 文档生成配置
  generation: {
    // 输出格式
    formats: {
      markdown: {
        encoding: 'utf-8',
        lineEnding: 'lf',
        indent: '  '
      },
      json: {
        pretty: true,
        indent: 2
      }
    },

    // 模板配置
    templates: {
      apiDoc: 'docs/templates/api-doc-template.md',
      componentDoc: 'docs/templates/component-doc-template.md',
      architectureDoc: 'docs/templates/architecture-doc-template.md'
    },

    // 质量控制
    quality: {
      minScore: 0.7,        // 最低质量分数
      autoReview: true,     // 自动质量审查
      humanReview: false    // 是否需要人工审查
    }
  },

  // 缓存配置
  cache: {
    enabled: true,
    ttl: 3600000, // 1小时
    directory: '.ai-cache',
    maxSize: '100MB'
  },

  // 监控和日志
  monitoring: {
    enabled: true,
    logLevel: 'info',
    metrics: {
      requestCount: true,
      responseTime: true,
      errorRate: true,
      costTracking: true
    }
  },

  // 安全配置
  security: {
    // 代码脱敏
    codeSanitization: {
      enabled: true,
      removeSecrets: true,
      maskCredentials: true
    },

    // 内容过滤
    contentFilter: {
      enabled: true,
      blockSensitive: true,
      allowDomains: ['*.company.com', '*.github.com']
    }
  }
};
