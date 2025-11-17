#!/usr/bin/env node

/**
 * Documentation Validator for Fitness Gym System
 * Validates documentation files for completeness, links, and formatting
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  docsDir: path.join(__dirname, '..'),
  excludeDirs: ['node_modules', '.git', 'build', 'dist'],
  requiredSections: ['概述', '安装', '使用', '配置'],
  maxFileSize: 1024 * 1024, // 1MB
  timeout: 5000 // 5 seconds
};

// Validation results
const results = {
  totalFiles: 0,
  validFiles: 0,
  invalidFiles: 0,
  warnings: [],
  errors: [],
  brokenLinks: [],
  missingSections: []
};

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath) {
  const relativePath = path.relative(CONFIG.docsDir, filePath);
  return CONFIG.excludeDirs.some(dir => relativePath.startsWith(dir));
}

/**
 * Validate Markdown file
 */
function validateMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.relative(CONFIG.docsDir, filePath);
  let isValid = true;

  results.totalFiles++;

  // Check file size
  const stats = fs.statSync(filePath);
  if (stats.size > CONFIG.maxFileSize) {
    results.warnings.push(`${fileName}: File size exceeds ${CONFIG.maxFileSize} bytes`);
  }

  // Check encoding (basic check for invalid characters)
  if (content.includes('\ufffd')) {
    results.errors.push(`${fileName}: Contains invalid UTF-8 characters`);
    isValid = false;
  }

  // Check for required sections (for Chinese docs)
  const hasRequiredSections = CONFIG.requiredSections.every(section =>
    content.includes(`# ${section}`) || content.includes(`## ${section}`)
  );

  if (!hasRequiredSections) {
    const missingSections = CONFIG.requiredSections.filter(section =>
      !content.includes(`# ${section}`) && !content.includes(`## ${section}`)
    );
    results.missingSections.push(`${fileName}: Missing sections: ${missingSections.join(', ')}`);
  }

  // Check for broken internal links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const [, , link] = match;

    // Skip external links and anchors
    if (link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:')) {
      continue;
    }

    // Check relative links
    const linkPath = path.resolve(path.dirname(filePath), link);
    if (!fs.existsSync(linkPath) && !fs.existsSync(linkPath + '.md')) {
      results.brokenLinks.push(`${fileName}: Broken link: ${link}`);
      isValid = false;
    }
  }

  // Check for TODO comments
  if (content.includes('TODO') || content.includes('FIXME')) {
    results.warnings.push(`${fileName}: Contains TODO/FIXME comments`);
  }

  // Check for empty sections
  const emptySectionRegex = /#{1,6}\s+.+\n\n#{1,6}/g;
  if (emptySectionRegex.test(content)) {
    results.warnings.push(`${fileName}: Contains empty sections`);
  }

  if (isValid) {
    results.validFiles++;
  } else {
    results.invalidFiles++;
  }

  return isValid;
}

/**
 * Validate JSON file
 */
function validateJsonFile(filePath) {
  const fileName = path.relative(CONFIG.docsDir, filePath);
  let isValid = true;

  results.totalFiles++;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    results.validFiles++;
  } catch (error) {
    results.errors.push(`${fileName}: Invalid JSON - ${error.message}`);
    results.invalidFiles++;
    isValid = false;
  }

  return isValid;
}

/**
 * Check external links (basic check)
 */
function checkExternalLinks(content, fileName) {
  const externalLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const links = [];
  let match;

  while ((match = externalLinkRegex.exec(content)) !== null) {
    const [, , url] = match;
    links.push(url);
  }

  // Note: In a real implementation, you would check these links
  // For now, just log that external link checking is available
  if (links.length > 0) {
    console.log(`📊 ${fileName}: Found ${links.length} external links (checking disabled)`);
  }
}

/**
 * Generate validation report
 */
function generateValidationReport() {
  const reportPath = path.join(CONFIG.docsDir, 'reports', 'validation-report.md');

  // Ensure reports directory exists
  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  let report = `# Documentation Validation Report

> **Generated**: ${new Date().toISOString()}

## Summary

| Metric | Count |
|--------|-------|
| Total Files | ${results.totalFiles} |
| Valid Files | ${results.validFiles} |
| Invalid Files | ${results.invalidFiles} |
| Warnings | ${results.warnings.length} |
| Errors | ${results.errors.length} |

## Results

`;

  if (results.errors.length > 0) {
    report += `### ❌ Errors\n\n`;
    results.errors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += `\n`;
  }

  if (results.warnings.length > 0) {
    report += `### ⚠️ Warnings\n\n`;
    results.warnings.forEach(warning => {
      report += `- ${warning}\n`;
    });
    report += `\n`;
  }

  if (results.brokenLinks.length > 0) {
    report += `### 🔗 Broken Links\n\n`;
    results.brokenLinks.forEach(link => {
      report += `- ${link}\n`;
    });
    report += `\n`;
  }

  if (results.missingSections.length > 0) {
    report += `### 📝 Missing Sections\n\n`;
    results.missingSections.forEach(section => {
      report += `- ${section}\n`;
    });
    report += `\n`;
  }

  if (results.errors.length === 0 && results.warnings.length === 0 &&
      results.brokenLinks.length === 0 && results.missingSections.length === 0) {
    report += `### ✅ All Checks Passed\n\n`;
    report += `No errors, warnings, or broken links found.\n\n`;
  }

  report += `## Validation Rules

### File Checks
- ✅ UTF-8 encoding validation
- ✅ File size limits (< ${CONFIG.maxFileSize} bytes)
- ✅ Required sections present

### Content Checks
- ✅ Internal link validation
- ✅ JSON syntax validation
- ✅ TODO/FIXME comment detection

### Link Checks
- ✅ Internal link resolution
- ⚠️ External link checking (disabled)

---

*Generated by documentation validator*
`;

  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`📄 Validation report saved: ${reportPath}`);

  return reportPath;
}

/**
 * Main validation function
 */
function validateDocumentation() {
  console.log('🔍 Starting documentation validation...');

  // Find all documentation files
  const markdownFiles = glob.sync(path.join(CONFIG.docsDir, '**/*.md'), {
    ignore: CONFIG.excludeDirs.map(dir => `**/${dir}/**`)
  });

  const jsonFiles = glob.sync(path.join(CONFIG.docsDir, '**/*.json'), {
    ignore: CONFIG.excludeDirs.map(dir => `**/${dir}/**`)
  });

  console.log(`📁 Found ${markdownFiles.length} Markdown files and ${jsonFiles.length} JSON files`);

  // Validate Markdown files
  markdownFiles.forEach(file => {
    if (!shouldExclude(file)) {
      console.log(`🔍 Validating: ${path.relative(CONFIG.docsDir, file)}`);
      validateMarkdownFile(file);
    }
  });

  // Validate JSON files
  jsonFiles.forEach(file => {
    if (!shouldExclude(file)) {
      console.log(`🔍 Validating: ${path.relative(CONFIG.docsDir, file)}`);
      validateJsonFile(file);
    }
  });

  // Generate report
  const reportPath = generateValidationReport();

  console.log('✅ Documentation validation completed');
  console.log(`📊 Results: ${results.validFiles}/${results.totalFiles} files valid`);

  return {
    total: results.totalFiles,
    valid: results.validFiles,
    invalid: results.invalidFiles,
    errors: results.errors.length,
    warnings: results.warnings.length,
    reportPath
  };
}

/**
 * Main execution
 */
function main() {
  try {
    const stats = validateDocumentation();

    // Exit with error code if there are validation failures
    if (stats.invalid > 0 || stats.errors > 0) {
      console.log('❌ Documentation validation failed');
      console.log(`   Invalid files: ${stats.invalid}`);
      console.log(`   Errors: ${stats.errors}`);
      process.exit(1);
    } else {
      console.log('✅ All documentation validation checks passed');
      if (stats.warnings > 0) {
        console.log(`⚠️  ${stats.warnings} warnings found (see report for details)`);
      }
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error during documentation validation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateDocumentation,
  validateMarkdownFile,
  validateJsonFile,
  shouldExclude,
  CONFIG
};