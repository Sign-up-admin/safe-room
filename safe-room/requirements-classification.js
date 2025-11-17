const fs = require('fs');

// 收集所有已发掘的需求
function collectAllRequirements() {
  const allRequirements = {
    businessRequirements: [],
    nonFunctionalRequirements: [],
    exceptions: [],
    total: 0
  };

  // 读取业务需求
  try {
    const businessProcessData = JSON.parse(fs.readFileSync('docs/reports/business-process-discovery.json', 'utf8'));
    if (businessProcessData.businessRequirements) {
      allRequirements.businessRequirements = businessProcessData.businessRequirements;
    }
    if (businessProcessData.exceptionScenarios) {
      allRequirements.exceptions = businessProcessData.exceptionScenarios;
    }
  } catch (e) {
    console.log('无法读取业务流程发现数据');
  }

  // 读取非功能性需求
  try {
    const nonFunctionalData = JSON.parse(fs.readFileSync('docs/reports/non-functional-requirements-discovery.json', 'utf8'));
    allRequirements.nonFunctionalRequirements = [
      ...nonFunctionalData.performance || [],
      ...nonFunctionalData.security || [],
      ...nonFunctionalData.usability || [],
      ...nonFunctionalData.maintainability || []
    ];
  } catch (e) {
    console.log('无法读取非功能性需求数据');
  }

  // 读取代码逆向发掘的需求
  try {
    const codeDiscoveryData = JSON.parse(fs.readFileSync('docs/reports/code-reverse-engineering-requirements.json', 'utf8'));
    if (codeDiscoveryData.businessRequirements) {
      // 合并业务需求，避免重复
      const existingSources = new Set(allRequirements.businessRequirements.map(r => r.source + r.requirement));
      codeDiscoveryData.businessRequirements.forEach(req => {
        const key = req.source + req.requirement;
        if (!existingSources.has(key)) {
          allRequirements.businessRequirements.push(req);
        }
      });
    }
  } catch (e) {
    console.log('无法读取代码逆向发掘数据');
  }

  allRequirements.total = allRequirements.businessRequirements.length +
                          allRequirements.nonFunctionalRequirements.length +
                          allRequirements.exceptions.length;

  return allRequirements;
}

// 需求分类和优先级排序
function classifyAndPrioritizeRequirements(requirements) {
  const classifiedRequirements = {
    functional: {
      P0: [],
      P1: [],
      P2: []
    },
    nonFunctional: {
      P0: [],
      P1: [],
      P2: []
    },
    exceptions: [],
    byModule: {},
    statistics: {
      total: requirements.total,
      functional: 0,
      nonFunctional: 0,
      exceptions: requirements.exceptions.length
    }
  };

  // 分类业务需求（功能性需求）
  requirements.businessRequirements.forEach(req => {
    const priority = req.priority || inferPriorityFromContent(req);
    if (!classifiedRequirements.functional[priority]) {
      classifiedRequirements.functional[priority] = [];
    }
    classifiedRequirements.functional[priority].push(req);

    // 按模块分类
    const module = inferModule(req);
    if (!classifiedRequirements.byModule[module]) {
      classifiedRequirements.byModule[module] = { P0: [], P1: [], P2: [] };
    }
    classifiedRequirements.byModule[module][priority].push(req);

    classifiedRequirements.statistics.functional++;
  });

  // 分类非功能性需求
  requirements.nonFunctionalRequirements.forEach(req => {
    const priority = req.priority || inferPriorityFromContent(req);
    if (!classifiedRequirements.nonFunctional[priority]) {
      classifiedRequirements.nonFunctional[priority] = [];
    }
    classifiedRequirements.nonFunctional[priority].push(req);

    classifiedRequirements.statistics.nonFunctional++;
  });

  // 处理异常场景
  requirements.exceptions.forEach(exception => {
    const priority = exception.type === 'user_flow_exception' ? 'P1' : 'P2';
    exception.priority = priority;
    classifiedRequirements.exceptions.push(exception);
  });

  return classifiedRequirements;
}

// 根据内容推断优先级
function inferPriorityFromContent(req) {
  const content = (req.requirement || req.context || '').toLowerCase();
  const source = (req.source || '').toLowerCase();

  // P0: 核心安全、支付、认证相关
  if (content.includes('安全') || content.includes('支付') ||
      content.includes('认证') || content.includes('权限') ||
      content.includes('加密') || source.includes('支付') ||
      source.includes('认证')) {
    return 'P0';
  }

  // P1: 重要功能和性能
  if (content.includes('性能') || content.includes('响应') ||
      content.includes('用户体验') || content.includes('可用性') ||
      content.includes('管理') || content.includes('监控')) {
    return 'P1';
  }

  // P2: 辅助功能和优化
  return 'P2';
}

// 根据需求内容推断所属模块
function inferModule(req) {
  const content = (req.requirement || req.context || '').toLowerCase();
  const source = (req.source || '').toLowerCase();

  if (content.includes('用户') || content.includes('认证') || content.includes('登录') ||
      content.includes('注册') || source.includes('用户认证')) {
    return '用户管理';
  }

  if (content.includes('课程') || content.includes('预约') || content.includes('booking') ||
      source.includes('课程预约') || source.includes('预约流程')) {
    return '课程预约';
  }

  if (content.includes('会员') || content.includes('支付') || content.includes('购买') ||
      source.includes('会员购买') || source.includes('支付')) {
    return '会员服务';
  }

  if (content.includes('教练') || content.includes('私教') || source.includes('教练预约')) {
    return '教练服务';
  }

  if (content.includes('管理') || content.includes('后台') || content.includes('admin') ||
      source.includes('管理后台') || source.includes('内容管理')) {
    return '管理后台';
  }

  if (content.includes('性能') || content.includes('响应') || content.includes('并发')) {
    return '性能优化';
  }

  if (content.includes('安全') || content.includes('加密') || content.includes('权限')) {
    return '安全保障';
  }

  if (content.includes('可用性') || content.includes('体验') || content.includes('响应式')) {
    return '用户体验';
  }

  if (content.includes('代码') || content.includes('测试') || content.includes('文档')) {
    return '可维护性';
  }

  return '其他功能';
}

// 生成分类报告
function generateClassificationReport(classifiedRequirements) {
  console.log('=== 需求分类与优先级排序报告 ===');

  console.log('\n需求统计:');
  console.log(`总需求数: ${classifiedRequirements.statistics.total}`);
  console.log(`功能性需求: ${classifiedRequirements.statistics.functional}`);
  console.log(`非功能性需求: ${classifiedRequirements.statistics.nonFunctional}`);
  console.log(`异常场景: ${classifiedRequirements.statistics.exceptions}`);

  console.log('\n功能性需求优先级分布:');
  Object.entries(classifiedRequirements.functional).forEach(([priority, reqs]) => {
    console.log(`  ${priority}: ${reqs.length}项`);
  });

  console.log('\n非功能性需求优先级分布:');
  Object.entries(classifiedRequirements.nonFunctional).forEach(([priority, reqs]) => {
    console.log(`  ${priority}: ${reqs.length}项`);
  });

  console.log('\n按模块分类统计:');
  Object.entries(classifiedRequirements.byModule).forEach(([module, priorities]) => {
    const total = priorities.P0.length + priorities.P1.length + priorities.P2.length;
    console.log(`  ${module}: ${total}项 (P0:${priorities.P0.length}, P1:${priorities.P1.length}, P2:${priorities.P2.length})`);
  });

  // 生成详细报告
  const detailedReport = {
    summary: classifiedRequirements.statistics,
    functionalRequirements: {
      P0: classifiedRequirements.functional.P0.map(req => ({
        module: inferModule(req),
        source: req.source,
        requirement: req.requirement,
        priority: req.priority
      })),
      P1: classifiedRequirements.functional.P1.map(req => ({
        module: inferModule(req),
        source: req.source,
        requirement: req.requirement,
        priority: req.priority
      })),
      P2: classifiedRequirements.functional.P2.map(req => ({
        module: inferModule(req),
        source: req.source,
        requirement: req.requirement,
        priority: req.priority
      }))
    },
    nonFunctionalRequirements: {
      P0: classifiedRequirements.nonFunctional.P0,
      P1: classifiedRequirements.nonFunctional.P1,
      P2: classifiedRequirements.nonFunctional.P2
    },
    exceptions: classifiedRequirements.exceptions,
    moduleBreakdown: classifiedRequirements.byModule,
    analysisTime: new Date().toISOString()
  };

  fs.writeFileSync('docs/reports/requirements-classification-priority.json', JSON.stringify(detailedReport, null, 2));
  console.log('\n详细报告已保存到: docs/reports/requirements-classification-priority.json');

  return detailedReport;
}

// 生成可视化报告
function generateVisualizationReport(detailedReport) {
  const visualizationReport = `# 需求分类与优先级可视化报告

## 📊 需求优先级分布

### 功能性需求优先级分布
\`\`\`mermaid
pie title 功能性需求优先级分布
    "P0核心需求" : ${detailedReport.functionalRequirements.P0.length}
    "P1重要需求" : ${detailedReport.functionalRequirements.P1.length}
    "P2辅助需求" : ${detailedReport.functionalRequirements.P2.length}
\`\`\`

### 非功能性需求优先级分布
\`\`\`mermaid
pie title 非功能性需求优先级分布
    "P0核心需求" : ${detailedReport.nonFunctionalRequirements.P0.length}
    "P1重要需求" : ${detailedReport.nonFunctionalRequirements.P1.length}
    "P2辅助需求" : ${detailedReport.nonFunctionalRequirements.P2.length}
\`\`\`

## 🏗️ 模块需求分布

| 模块 | P0 | P1 | P2 | 总数 | 占比 |
|------|----|----|----|------|------|
${Object.entries(detailedReport.moduleBreakdown).map(([module, priorities]) => {
  const total = priorities.P0.length + priorities.P1.length + priorities.P2.length;
  const percentage = ((total / detailedReport.summary.total) * 100).toFixed(1);
  return `| ${module} | ${priorities.P0.length} | ${priorities.P1.length} | ${priorities.P2.length} | ${total} | ${percentage}% |`;
}).join('\n')}

## 🎯 P0核心需求清单

### 功能性核心需求
${detailedReport.functionalRequirements.P0.map((req, index) =>
  `${index + 1}. **${req.module}** - ${req.requirement}`
).join('\n')}

### 非功能性核心需求
${detailedReport.nonFunctionalRequirements.P0.map((req, index) =>
  `${index + 1}. **${req.type}** - ${req.requirement}`
).join('\n')}

## 📋 实施建议

### 第一阶段：核心需求实现（P0）
**时间**: 1-2个月
**重点**: 安全、支付、认证核心功能
**需求数量**: ${detailedReport.functionalRequirements.P0.length + detailedReport.nonFunctionalRequirements.P0.length}项

### 第二阶段：重要需求完善（P1）
**时间**: 2-3个月
**重点**: 性能优化、用户体验提升
**需求数量**: ${detailedReport.functionalRequirements.P1.length + detailedReport.nonFunctionalRequirements.P1.length}项

### 第三阶段：辅助功能优化（P2）
**时间**: 持续改进
**重点**: 细节优化和体验提升
**需求数量**: ${detailedReport.functionalRequirements.P2.length + detailedReport.nonFunctionalRequirements.P2.length}项

---

*报告生成时间: ${detailedReport.analysisTime}*
`;

  fs.writeFileSync('docs/reports/requirements-classification-visualization.md', visualizationReport);
  console.log('可视化报告已保存到: docs/reports/requirements-classification-visualization.md');
}

// 主执行函数
function main() {
  console.log('开始需求分类与优先级排序...');

  const allRequirements = collectAllRequirements();
  console.log(`收集到 ${allRequirements.total} 项需求`);

  const classifiedRequirements = classifyAndPrioritizeRequirements(allRequirements);
  const detailedReport = generateClassificationReport(classifiedRequirements);

  generateVisualizationReport(detailedReport);

  console.log('需求分类与优先级排序完成！');
}

main();
