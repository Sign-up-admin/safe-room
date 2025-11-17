const fs = require('fs');
const path = require('path');

function assessDocumentQuality() {
  const requirementsDir = 'docs/requirements';
  const qualityReport = {
    summary: {
      totalDocuments: 0,
      highQuality: 0,
      mediumQuality: 0,
      lowQuality: 0,
      averageScore: 0
    },
    formatCompliance: {
      headerCompleteness: 0,
      structureCompliance: 0,
      markdownSyntax: 0
    },
    contentCompleteness: {
      functionalDescription: 0,
      acceptanceCriteria: 0,
      technicalImplementation: 0,
      visualDesign: 0
    },
    consistency: {
      terminology: 0,
      formatting: 0,
      naming: 0
    },
    readability: {
      structureClarity: 0,
      languageQuality: 0,
      documentationLinks: 0
    },
    detailedAssessment: [],
    improvementSuggestions: []
  };

  // Quality assessment criteria
  const criteria = {
    headerCompleteness: {
      requiredFields: ['title', 'version', 'last_updated', 'status', 'category'],
      weight: 0.1
    },
    structureCompliance: {
      requiredSections: ['设计关键词', '验收标准', '相关文档'],
      weight: 0.15
    },
    functionalDescription: {
      indicators: ['功能需求', '交互流程', '数据结构'],
      weight: 0.2
    },
    acceptanceCriteria: {
      indicators: ['验收标准', '测试策略'],
      weight: 0.15
    },
    technicalImplementation: {
      indicators: ['技术实现', 'API规范', '边界场景'],
      weight: 0.15
    },
    visualDesign: {
      indicators: ['视觉规范', '响应式策略'],
      weight: 0.1
    },
    consistency: {
      weight: 0.1
    },
    readability: {
      weight: 0.05
    }
  };

  function assessDocument(filePath) {
    const relativePath = path.relative(requirementsDir, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    const assessment = {
      file: relativePath,
      scores: {},
      totalScore: 0,
      quality: 'unknown',
      issues: [],
      suggestions: []
    };

    // 1. Header completeness assessment
    let headerScore = 0;
    if (lines[0].startsWith('---')) {
      let inHeader = false;
      let headerLines = [];

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('---')) {
          if (inHeader) break;
          inHeader = true;
        } else if (inHeader) {
          headerLines.push(lines[i]);
        }
      }

      const header = {};
      headerLines.forEach(line => {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          header[match[1]] = match[2];
        }
      });

      const missingFields = criteria.headerCompleteness.requiredFields.filter(field => !header[field]);
      headerScore = ((criteria.headerCompleteness.requiredFields.length - missingFields.length) / criteria.headerCompleteness.requiredFields.length) * 100;

      if (missingFields.length > 0) {
        assessment.issues.push(`缺少头部字段: ${missingFields.join(', ')}`);
        assessment.suggestions.push('完善文档头部信息，添加所有必需字段');
      }
    } else {
      assessment.issues.push('缺少标准YAML头部');
      assessment.suggestions.push('添加标准文档头部信息');
    }
    assessment.scores.headerCompleteness = headerScore;

    // 2. Structure compliance assessment
    let structureScore = 0;
    const contentText = content.toLowerCase();
    const foundSections = criteria.structureCompliance.requiredSections.filter(section =>
      contentText.includes(section.toLowerCase())
    );
    structureScore = (foundSections.length / criteria.structureCompliance.requiredSections.length) * 100;

    if (foundSections.length < criteria.structureCompliance.requiredSections.length) {
      const missingSections = criteria.structureCompliance.requiredSections.filter(section =>
        !contentText.includes(section.toLowerCase())
      );
      assessment.issues.push(`缺少标准章节: ${missingSections.join(', ')}`);
      assessment.suggestions.push('按照模板添加缺失的标准章节');
    }
    assessment.scores.structureCompliance = structureScore;

    // 3. Functional description assessment
    let functionalScore = 0;
    const foundIndicators = criteria.functionalDescription.indicators.filter(indicator =>
      contentText.includes(indicator.toLowerCase())
    );
    functionalScore = (foundIndicators.length / criteria.functionalDescription.indicators.length) * 100;

    if (foundIndicators.length < criteria.functionalDescription.indicators.length) {
      assessment.issues.push('功能描述不够完整');
      assessment.suggestions.push('补充功能需求描述、交互流程和数据结构');
    }
    assessment.scores.functionalDescription = functionalScore;

    // 4. Acceptance criteria assessment
    let acceptanceScore = 0;
    const foundAcceptance = criteria.acceptanceCriteria.indicators.filter(indicator =>
      contentText.includes(indicator.toLowerCase())
    );
    acceptanceScore = (foundAcceptance.length / criteria.acceptanceCriteria.indicators.length) * 100;

    if (foundAcceptance.length < criteria.acceptanceCriteria.indicators.length) {
      assessment.issues.push('验收标准不完整');
      assessment.suggestions.push('添加详细的验收标准和测试策略');
    }
    assessment.scores.acceptanceCriteria = acceptanceScore;

    // 5. Technical implementation assessment
    let technicalScore = 0;
    const foundTechnical = criteria.technicalImplementation.indicators.filter(indicator =>
      contentText.includes(indicator.toLowerCase())
    );
    technicalScore = (foundTechnical.length / criteria.technicalImplementation.indicators.length) * 100;

    if (foundTechnical.length < criteria.technicalImplementation.indicators.length) {
      assessment.issues.push('技术实现说明不足');
      assessment.suggestions.push('补充技术实现方案、API规范和边界场景处理');
    }
    assessment.scores.technicalImplementation = technicalScore;

    // 6. Visual design assessment
    let visualScore = 0;
    const foundVisual = criteria.visualDesign.indicators.filter(indicator =>
      contentText.includes(indicator.toLowerCase())
    );
    visualScore = (foundVisual.length / criteria.visualDesign.indicators.length) * 100;

    if (foundVisual.length < criteria.visualDesign.indicators.length) {
      assessment.issues.push('视觉设计规范缺失');
      assessment.suggestions.push('补充视觉规范和响应式策略');
    }
    assessment.scores.visualDesign = visualScore;

    // 7. Consistency assessment (basic check for common terms)
    let consistencyScore = 100; // Assume good unless issues found
    const standardTerms = ['前端', '后端', '管理员', '用户', 'API'];
    const inconsistentTerms = [];

    // Check for common inconsistent terms
    if (content.includes('前端') && content.includes('front-end')) {
      inconsistentTerms.push('前端/front-end');
    }
    if (content.includes('后端') && content.includes('backend')) {
      inconsistentTerms.push('后端/backend');
    }

    if (inconsistentTerms.length > 0) {
      consistencyScore = 70;
      assessment.issues.push(`术语不统一: ${inconsistentTerms.join(', ')}`);
      assessment.suggestions.push('统一术语使用，参考文档规范');
    }
    assessment.scores.consistency = consistencyScore;

    // 8. Readability assessment
    let readabilityScore = 85; // Base score

    // Check for links to related documents
    const hasRelatedDocs = contentText.includes('相关文档') || contentText.includes('reference') || contentText.includes('see also');
    if (!hasRelatedDocs) {
      readabilityScore -= 10;
      assessment.issues.push('缺少相关文档引用');
      assessment.suggestions.push('添加相关文档链接');
    }

    // Check for proper section structure
    const hasProperHeadings = /^#{1,6}\s/.test(content);
    if (!hasProperHeadings) {
      readabilityScore -= 5;
      assessment.issues.push('章节结构不清晰');
    }

    assessment.scores.readability = readabilityScore;

    // Calculate total score
    assessment.totalScore =
      assessment.scores.headerCompleteness * criteria.headerCompleteness.weight +
      assessment.scores.structureCompliance * criteria.structureCompliance.weight +
      assessment.scores.functionalDescription * criteria.functionalDescription.weight +
      assessment.scores.acceptanceCriteria * criteria.acceptanceCriteria.weight +
      assessment.scores.technicalImplementation * criteria.technicalImplementation.weight +
      assessment.scores.visualDesign * criteria.visualDesign.weight +
      assessment.scores.consistency * criteria.consistency.weight +
      assessment.scores.readability * criteria.readability.weight;

    // Determine quality level
    if (assessment.totalScore >= 85) {
      assessment.quality = 'high';
      qualityReport.summary.highQuality++;
    } else if (assessment.totalScore >= 70) {
      assessment.quality = 'medium';
      qualityReport.summary.mediumQuality++;
    } else {
      assessment.quality = 'low';
      qualityReport.summary.lowQuality++;
    }

    qualityReport.detailedAssessment.push(assessment);
    return assessment;
  }

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip backup directories but include admin/frontend/common
        if (!item.includes('backup-') && ['admin', 'frontend', 'common'].includes(item)) {
          scanDirectory(fullPath);
        }
      } else if (item.endsWith('.md') && !item.includes('.backup-')) {
        // Only process .md files that are not backups
        assessDocument(fullPath);
        qualityReport.summary.totalDocuments++;
      }
    }
  }

  scanDirectory(requirementsDir);

  // Calculate summary statistics
  const totalScore = qualityReport.detailedAssessment.reduce((sum, doc) => sum + doc.totalScore, 0);
  qualityReport.summary.averageScore = qualityReport.summary.totalDocuments > 0 ?
    totalScore / qualityReport.summary.totalDocuments : 0;

  // Generate improvement suggestions
  const commonIssues = {};
  qualityReport.detailedAssessment.forEach(doc => {
    doc.issues.forEach(issue => {
      commonIssues[issue] = (commonIssues[issue] || 0) + 1;
    });
  });

  Object.entries(commonIssues)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([issue, count]) => {
      qualityReport.improvementSuggestions.push({
        issue,
        frequency: count,
        percentage: ((count / qualityReport.summary.totalDocuments) * 100).toFixed(1) + '%'
      });
    });

  // Write detailed report
  fs.writeFileSync('docs/reports/requirements-quality-assessment.json', JSON.stringify(qualityReport, null, 2));

  // Generate human-readable report
  console.log('=== 需求文档质量评估报告 ===');
  console.log(`总文档数: ${qualityReport.summary.totalDocuments}`);
  console.log(`平均质量评分: ${qualityReport.summary.averageScore.toFixed(1)}分`);
  console.log(`高质量文档: ${qualityReport.summary.highQuality} (${((qualityReport.summary.highQuality/qualityReport.summary.totalDocuments)*100).toFixed(1)}%)`);
  console.log(`中等质量文档: ${qualityReport.summary.mediumQuality} (${((qualityReport.summary.mediumQuality/qualityReport.summary.totalDocuments)*100).toFixed(1)}%)`);
  console.log(`低质量文档: ${qualityReport.summary.lowQuality} (${((qualityReport.summary.lowQuality/qualityReport.summary.totalDocuments)*100).toFixed(1)}%)`);
  console.log();

  console.log('质量评分分布:');
  qualityReport.detailedAssessment
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10)
    .forEach(doc => {
      console.log(`  ${doc.file}: ${doc.totalScore.toFixed(1)}分 (${doc.quality})`);
    });
  console.log();

  console.log('常见质量问题:');
  qualityReport.improvementSuggestions.forEach(suggestion => {
    console.log(`  ${suggestion.issue} (${suggestion.frequency}个文档, ${suggestion.percentage})`);
  });
  console.log();

  console.log('详细报告已保存到: docs/reports/requirements-quality-assessment.json');

  return qualityReport;
}

assessDocumentQuality();
