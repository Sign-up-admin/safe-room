const fs = require('fs');
const path = require('path');

function analyzeRequirementsDocs() {
  const requirementsDir = 'docs/requirements';
  const stats = {
    total: 0,
    active: 0,
    draft: 0,
    deprecated: 0,
    byCategory: {},
    byVersion: {},
    byUpdateDate: {},
    formatIssues: [],
    missingHeaders: [],
    fileList: []
  };

  function processFile(filePath) {
    const relativePath = path.relative(requirementsDir, filePath);
    stats.fileList.push(relativePath);

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Check if file has YAML header
    if (!lines[0].startsWith('---')) {
      stats.missingHeaders.push(relativePath);
      return;
    }

    stats.total++;

    // Extract header info
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

    // Analyze header
    if (header.status) {
      stats[header.status] = (stats[header.status] || 0) + 1;
    }

    if (header.category) {
      stats.byCategory[header.category] = (stats.byCategory[header.category] || 0) + 1;
    }

    if (header.version) {
      stats.byVersion[header.version] = (stats.byVersion[header.version] || 0) + 1;
    }

    if (header.last_updated) {
      stats.byUpdateDate[header.last_updated] = (stats.byUpdateDate[header.last_updated] || 0) + 1;
    }

    // Check format issues
    const requiredFields = ['title', 'version', 'last_updated', 'status', 'category'];
    const missingFields = requiredFields.filter(field => !header[field]);
    if (missingFields.length > 0) {
      stats.formatIssues.push({
        file: relativePath,
        missing: missingFields
      });
    }
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
        processFile(fullPath);
      }
    }
  }

  scanDirectory(requirementsDir);

  // Generate report
  console.log('=== 需求文档完整性检查报告 ===');
  console.log(`总文档数: ${stats.total}`);
  console.log(`活跃文档: ${stats.active}`);
  console.log(`草稿文档: ${stats.draft}`);
  console.log(`已弃用文档: ${stats.deprecated}`);
  console.log();

  console.log('按分类统计:');
  Object.entries(stats.byCategory).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
  console.log();

  console.log('版本分布:');
  Object.entries(stats.byVersion).forEach(([ver, count]) => {
    console.log(`  v${ver}: ${count}`);
  });
  console.log();

  console.log('更新时间分布:');
  Object.entries(stats.byUpdateDate).forEach(([date, count]) => {
    console.log(`  ${date}: ${count}`);
  });
  console.log();

  console.log('文档列表:');
  stats.fileList.forEach(file => {
    console.log(`  ${file}`);
  });
  console.log();

  if (stats.formatIssues.length > 0) {
    console.log('格式问题文档:');
    stats.formatIssues.forEach(issue => {
      console.log(`  ${issue.file}: 缺少 ${issue.missing.join(', ')}`);
    });
    console.log();
  }

  if (stats.missingHeaders.length > 0) {
    console.log('缺少头部信息的文档:');
    stats.missingHeaders.forEach(file => {
      console.log(`  ${file}`);
    });
    console.log();
  }

  // Write detailed report to file
  const report = {
    summary: {
      totalDocuments: stats.total,
      activeDocuments: stats.active,
      draftDocuments: stats.draft,
      deprecatedDocuments: stats.deprecated
    },
    byCategory: stats.byCategory,
    byVersion: stats.byVersion,
    byUpdateDate: stats.byUpdateDate,
    allFiles: stats.fileList,
    formatIssues: stats.formatIssues,
    missingHeaders: stats.missingHeaders,
    analysisTime: new Date().toISOString()
  };

  fs.writeFileSync('docs/reports/requirements-integrity-report.json', JSON.stringify(report, null, 2));
  console.log('详细报告已保存到: docs/reports/requirements-integrity-report.json');
}

analyzeRequirementsDocs();
