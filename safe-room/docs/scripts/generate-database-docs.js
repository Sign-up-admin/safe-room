#!/usr/bin/env node

/**
 * 数据库文档自动生成工具
 *
 * 功能：
 * - 从SQL文件和Java实体类生成数据库文档
 * - 解析表结构、字段信息、索引、外键关系
 * - 生成Markdown格式的数据库文档
 *
 * 使用方法：
 * node docs/scripts/generate-database-docs.js [options]
 *
 * 选项：
 * --output <file>    输出文件路径 (默认: docs/technical/database/GENERATED_DATABASE.md)
 * --format <format>  输出格式: markdown|html (默认: markdown)
 * --verbose          详细输出
 * --help             显示帮助信息
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// 配置
const CONFIG = {
  // 文档根目录 - 动态检测
  get docsRoot() {
    // 如果当前目录包含 docs/ 子目录，则使用相对路径
    const cwd = process.cwd();
    if (cwd.endsWith('docs') || cwd.endsWith('docs/') || cwd.endsWith('docs\\\\')) {
      return '.';
    }
    return 'docs';
  },

  // SQL文件扫描模式
  sqlPatterns: [
    '**/*.sql',
    '!node_modules/**',
    '!docs/**'
  ],

  // Java实体类扫描模式
  entityPatterns: [
    'springboot1ngh61a2/src/main/java/**/*.java'
  ],

  // 默认输出文件
  defaultOutput: 'docs/technical/database/GENERATED_DATABASE.md'
};

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    output: CONFIG.defaultOutput,
    format: 'markdown',
    verbose: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--output':
        options.output = args[++i];
        break;
      case '--format':
        options.format = args[++i];
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        options.help = true;
        break;
      default:
        if (!arg.startsWith('--')) {
          console.error(`未知参数: ${arg}`);
          process.exit(1);
        }
    }
  }

  return options;
}

// 显示帮助信息
function showHelp() {
  console.log(`
数据库文档生成工具

使用方法:
  node docs/scripts/generate-database-docs.js [options]

选项:
  --output <file>    输出文件路径 (默认: docs/technical/database/GENERATED_DATABASE.md)
  --format <format>  输出格式: markdown|html (默认: markdown)
  --verbose          详细输出
  --help             显示帮助信息

示例:
  # 生成数据库文档
  node docs/scripts/generate-database-docs.js

  # 指定输出文件
  node docs/scripts/generate-database-docs.js --output docs/database.md

  # 详细输出
  node docs/scripts/generate-database-docs.js --verbose
`);
}

// 解析SQL文件中的表结构
function parseTableFromSQL(content, fileName) {
  const tables = [];
  const lines = content.split('\n');

  let currentTable = null;
  let inCreateTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 检测CREATE TABLE语句
    if (line.toUpperCase().startsWith('CREATE TABLE')) {
      const tableMatch = line.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
      if (tableMatch) {
        currentTable = {
          name: tableMatch[1],
          columns: [],
          indexes: [],
          constraints: [],
          source: fileName,
          line: i + 1
        };
        inCreateTable = true;
        tables.push(currentTable);
        if (CONFIG.verbose) {
          console.log(`📋 发现表: ${currentTable.name}`);
        }
      }
      continue;
    }

    // 如果在CREATE TABLE块内
    if (inCreateTable && currentTable) {
      // 检测表结束
      if (line.includes(');') || line.toUpperCase().includes('ENGINE=')) {
        inCreateTable = false;
        continue;
      }

      // 解析列定义
      const columnMatch = line.match(/^(\w+)\s+([\w\(\)]+)(?:\s+(.*))?,?$/);
      if (columnMatch && !line.toUpperCase().includes('KEY') && !line.toUpperCase().includes('INDEX')) {
        const [, name, type, constraints] = columnMatch;
        currentTable.columns.push({
          name,
          type,
          constraints: constraints || '',
          nullable: !constraints || !constraints.toUpperCase().includes('NOT NULL')
        });
        continue;
      }

      // 解析主键约束
      const pkMatch = line.match(/PRIMARY KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        const columns = pkMatch[1].split(',').map(c => c.trim());
        currentTable.constraints.push({
          type: 'PRIMARY KEY',
          columns
        });
        continue;
      }

      // 解析外键约束
      const fkMatch = line.match(/FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+(\w+)\s*\(([^)]+)\)/i);
      if (fkMatch) {
        const [, localColumns, refTable, refColumns] = fkMatch;
        currentTable.constraints.push({
          type: 'FOREIGN KEY',
          localColumns: localColumns.split(',').map(c => c.trim()),
          refTable,
          refColumns: refColumns.split(',').map(c => c.trim())
        });
        continue;
      }
    }

    // 检测CREATE INDEX语句
    if (line.toUpperCase().startsWith('CREATE INDEX') || line.toUpperCase().startsWith('CREATE UNIQUE INDEX')) {
      const indexMatch = line.match(/CREATE\s+(UNIQUE\s+)?INDEX\s+(?:IF NOT EXISTS\s+)?(\w+)\s+ON\s+(\w+)\s*\(([^)]+)\)/i);
      if (indexMatch) {
        const [, unique, indexName, tableName, columns] = indexMatch;
        const index = {
          name: indexName,
          table: tableName,
          columns: columns.split(',').map(c => c.trim()),
          unique: !!unique,
          source: fileName
        };

        // 找到对应的表并添加索引
        const table = tables.find(t => t.name === tableName);
        if (table) {
          table.indexes.push(index);
        }

        if (CONFIG.verbose) {
          console.log(`🔗 发现索引: ${indexName} on ${tableName}`);
        }
      }
    }
  }

  return tables;
}

// 从Java实体类解析表结构
function parseTableFromEntity(content, fileName) {
  const tables = [];

  // 检测@Entity注解
  if (!content.includes('@Entity') && !content.includes('@Table')) {
    return tables;
  }

  // 提取类名
  const classMatch = content.match(/class\s+(\w+)/);
  if (!classMatch) return tables;

  const className = classMatch[1];
  let tableName = className.toLowerCase() + 's'; // 默认复数形式

  // 检测@Table注解
  const tableAnnotation = content.match(/@Table\s*\([^)]*name\s*=\s*["']([^"']+)["']/);
  if (tableAnnotation) {
    tableName = tableAnnotation[1];
  }

  const table = {
    name: tableName,
    columns: [],
    indexes: [],
    constraints: [],
    source: fileName,
    entity: className
  };

  // 解析@Column字段
  const columnRegex = /@Column\s*\(([^)]*)\)\s*(?:private|protected|public)?\s*([\w<>]+)\s+(\w+)/g;
  let match;

  while ((match = columnRegex.exec(content)) !== null) {
    const annotation = match[1];
    const type = match[2];
    const fieldName = match[3];

    // 解析列注解
    const columnName = annotation.match(/name\s*=\s*["']([^"']+)["']/)?.[1] || fieldName;
    const nullable = !annotation.includes('nullable = false');
    const length = annotation.match(/length\s*=\s*(\d+)/)?.[1] || '';

    table.columns.push({
      name: columnName,
      type: type + (length ? `(${length})` : ''),
      nullable,
      field: fieldName
    });
  }

  // 解析@Id字段
  const idRegex = /@Id\s*(?:\n|\s)*@Column\s*\(([^)]*)\)\s*(?:private|protected|public)?\s*([\w<>]+)\s+(\w+)/g;
  while ((match = idRegex.exec(content)) !== null) {
    const annotation = match[1];
    const fieldName = match[3];

    const columnName = annotation.match(/name\s*=\s*["']([^"']+)["']/)?.[1] || fieldName;

    table.constraints.push({
      type: 'PRIMARY KEY',
      columns: [columnName]
    });
  }

  if (table.columns.length > 0) {
    tables.push(table);
    if (CONFIG.verbose) {
      console.log(`📋 发现实体: ${className} -> ${tableName}`);
    }
  }

  return tables;
}

// 生成Markdown文档
function generateMarkdown(tables) {
  let content = `# 🗄️ 自动生成的数据库文档

> 从SQL文件和Java实体类自动生成的数据库文档
>
> **生成时间**: ${new Date().toISOString()}
> **表数量**: ${tables.length}

## 📋 数据库概览

| 表名 | 字段数 | 索引数 | 约束数 | 来源 |
|------|--------|--------|--------|------|
`;

  // 表概览
  tables.forEach(table => {
    content += `| ${table.name} | ${table.columns.length} | ${table.indexes.length} | ${table.constraints.length} | ${path.basename(table.source)} |\n`;
  });

  // 详细表结构
  tables.forEach(table => {
    content += `\n## 📊 ${table.name}\n\n`;
    if (table.entity) {
      content += `**实体类**: \`${table.entity}\`\n\n`;
    }
    content += `**来源**: ${table.source}\n\n`;

    // 字段信息
    if (table.columns.length > 0) {
      content += `### 字段定义\n\n`;
      content += `| 字段名 | 类型 | 可空 | 约束 |\n`;
      content += `|--------|------|------|--------|\n`;

      table.columns.forEach(column => {
        const constraints = column.constraints || '';
        const nullable = column.nullable ? '✓' : '✗';
        content += `| ${column.name} | ${column.type} | ${nullable} | ${constraints} |\n`;
      });
      content += '\n';
    }

    // 约束信息
    if (table.constraints.length > 0) {
      content += `### 约束\n\n`;
      table.constraints.forEach(constraint => {
        if (constraint.type === 'PRIMARY KEY') {
          content += `- **主键**: ${constraint.columns.join(', ')}\n`;
        } else if (constraint.type === 'FOREIGN KEY') {
          content += `- **外键**: ${constraint.localColumns.join(', ')} -> ${constraint.refTable}(${constraint.refColumns.join(', ')})\n`;
        }
      });
      content += '\n';
    }

    // 索引信息
    if (table.indexes.length > 0) {
      content += `### 索引\n\n`;
      table.indexes.forEach(index => {
        const unique = index.unique ? ' (唯一)' : '';
        content += `- **${index.name}**${unique}: ${index.columns.join(', ')}\n`;
      });
      content += '\n';
    }
  });

  return content;
}

// 主函数
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  console.log('🔍 开始扫描数据库文件生成文档...');

  try {
    // 扫描SQL文件
    const sqlFiles = await glob(CONFIG.sqlPatterns);
    console.log(`📄 发现 ${sqlFiles.length} 个SQL文件`);

    // 扫描Java实体类
    const entityFiles = await glob(CONFIG.entityPatterns);
    console.log(`📋 发现 ${entityFiles.length} 个Java文件`);

    const allTables = [];

    // 解析SQL文件
    for (const file of sqlFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const tables = parseTableFromSQL(content, file);
        allTables.push(...tables);
      } catch (error) {
        console.warn(`⚠️ 无法读取SQL文件 ${file}: ${error.message}`);
      }
    }

    // 解析Java实体类
    for (const file of entityFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const tables = parseTableFromEntity(content, file);
        allTables.push(...tables);
      } catch (error) {
        console.warn(`⚠️ 无法读取实体类文件 ${file}: ${error.message}`);
      }
    }

    // 去重表定义（优先使用实体类定义）
    const tableMap = new Map();
    allTables.forEach(table => {
      const key = table.name;
      if (!tableMap.has(key) || table.entity) { // 实体类定义优先
        tableMap.set(key, table);
      }
    });

    const uniqueTables = Array.from(tableMap.values());
    console.log(`📊 共发现 ${uniqueTables.length} 个表`);

    // 生成文档
    const content = generateMarkdown(uniqueTables);

    // 确保输出目录存在
    const outputDir = path.dirname(options.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(options.output, content, 'utf-8');
    console.log(`✅ 数据库文档已生成: ${options.output}`);

  } catch (error) {
    console.error(`❌ 生成数据库文档失败: ${error.message}`);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error(`❌ 未预期的错误: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  parseTableFromSQL,
  parseTableFromEntity,
  generateMarkdown
};
