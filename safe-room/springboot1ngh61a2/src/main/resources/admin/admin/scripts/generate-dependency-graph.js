#!/usr/bin/env node

/**
 * 依赖关系图生成脚本
 * 生成项目依赖关系图（DOT格式和可视化HTML）
 */

import fs from 'fs';
import path from 'path';
import madge from 'madge';

/**
 * 生成依赖关系图
 * @returns {Promise<Object>} 图数据
 */
async function generateDependencyGraph() {
  console.log('📊 开始生成依赖关系图...');

  const config = {
    baseDir: path.join(__dirname, '..'),
    fileExtensions: ['ts', 'js', 'vue'],
    tsConfig: path.join(__dirname, '..', 'tsconfig.json'),
    includeNpm: false, // 不包含 npm 包
    excludeRegExp: [
      /node_modules/,
      /\.spec\.ts$/,
      /\.test\.ts$/,
      /\.d\.ts$/
    ]
  };

  try {
    const result = await madge(path.join(__dirname, '..', 'src'), config);
    return {
      dependencyGraph: result.obj(),
      circularDeps: result.circular(),
      warnings: result.warnings()
    };
  } catch (error) {
    console.error('❌ 生成依赖图失败:', error.message);
    throw error;
  }
}

/**
 * 生成 DOT 格式的图
 * @param {Object} graph - 依赖图数据
 * @returns {string} DOT 格式字符串
 */
function generateDotGraph(graph) {
  let dot = 'digraph DependencyGraph {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=box, style=filled, fillcolor=lightblue];\n';
  dot += '  edge [color=blue];\n\n';

  // 添加节点
  const nodes = new Set();
  Object.keys(graph).forEach(file => {
    const relativePath = path.relative(path.join(__dirname, '..', 'src'), file);
    nodes.add(`"${relativePath}"`);
  });

  // 添加所有依赖的目标节点
  Object.values(graph).forEach(deps => {
    deps.forEach(dep => {
      const relativePath = path.relative(path.join(__dirname, '..', 'src'), dep);
      nodes.add(`"${relativePath}"`);
    });
  });

  // 写入节点定义
  nodes.forEach(node => {
    dot += `  ${node};\n`;
  });
  dot += '\n';

  // 添加边
  Object.entries(graph).forEach(([file, deps]) => {
    const fromPath = path.relative(path.join(__dirname, '..', 'src'), file);
    deps.forEach(dep => {
      const toPath = path.relative(path.join(__dirname, '..', 'src'), dep);
      dot += `  "${fromPath}" -> "${toPath}";\n`;
    });
  });

  dot += '}\n';
  return dot;
}

/**
 * 生成 HTML 可视化图表
 * @param {Object} graph - 依赖图数据
 * @param {Array} circularDeps - 循环依赖
 * @returns {string} HTML 内容
 */
function generateHtmlGraph(graph, circularDeps) {
  const nodes = [];
  const edges = [];

  // 收集节点和边
  const nodeMap = new Map();

  Object.entries(graph).forEach(([file, deps], index) => {
    const fromPath = path.relative(path.join(__dirname, '..', 'src'), file);
    const fromId = `node_${index}`;

    if (!nodeMap.has(fromPath)) {
      nodeMap.set(fromPath, {
        id: fromId,
        label: fromPath.split('/').pop(),
        fullPath: fromPath,
        group: fromPath.split('/')[0] || 'root'
      });
    }

    deps.forEach((dep, depIndex) => {
      const toPath = path.relative(path.join(__dirname, '..', 'src'), dep);
      const toId = `node_${index}_${depIndex}`;

      if (!nodeMap.has(toPath)) {
        nodeMap.set(toPath, {
          id: toId,
          label: toPath.split('/').pop(),
          fullPath: toPath,
          group: toPath.split('/')[0] || 'root'
        });
      }

      edges.push({
        from: nodeMap.get(fromPath).id,
        to: nodeMap.get(toPath).id
      });
    });
  });

  const nodesArray = Array.from(nodeMap.values());

  // 检查循环依赖
  const circularPaths = new Set();
  circularDeps.forEach(chain => {
    chain.forEach(file => {
      const relativePath = path.relative(path.join(__dirname, '..', 'src'), file);
      circularPaths.add(relativePath);
    });
  });

  // 标记循环依赖节点
  nodesArray.forEach(node => {
    node.color = circularPaths.has(node.fullPath) ? '#ff6b6b' : '#4ecdc4';
  });

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>项目依赖关系图</title>
    <script src="https://unpkg.com/vis-network@9.1.0/dist/vis-network.min.js"></script>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .network-container { height: 600px; border: 1px solid #ddd; border-radius: 4px; margin: 20px; }
        .legend { margin: 20px; padding: 15px; background: #ecf0f1; border-radius: 6px; }
        .legend-item { display: inline-block; margin-right: 20px; }
        .legend-color { display: inline-block; width: 16px; height: 16px; border-radius: 50%; margin-right: 8px; vertical-align: middle; }
        .stats { margin: 20px; display: flex; gap: 20px; }
        .stat-item { flex: 1; text-align: center; padding: 15px; background: #ecf0f1; border-radius: 6px; }
        .stat-number { font-size: 2em; font-weight: bold; color: #3498db; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>项目依赖关系图</h1>
            <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>

        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${nodesArray.length}</div>
                <div>模块数量</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${edges.length}</div>
                <div>依赖关系</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${circularDeps.length}</div>
                <div>循环依赖</div>
            </div>
        </div>

        <div class="legend">
            <div class="legend-item">
                <span class="legend-color" style="background-color: #4ecdc4;"></span>
                正常模块
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background-color: #ff6b6b;"></span>
                循环依赖模块
            </div>
        </div>

        <div id="network" class="network-container"></div>
    </div>

    <script>
        const nodes = ${JSON.stringify(nodesArray)};
        const edges = ${JSON.stringify(edges)};

        const data = {
            nodes: nodes.map(node => ({
                id: node.id,
                label: node.label,
                title: node.fullPath,
                color: node.color,
                group: node.group
            })),
            edges: edges
        };

        const options = {
            nodes: {
                shape: 'box',
                font: {
                    size: 12,
                    face: 'arial'
                }
            },
            edges: {
                arrows: 'to',
                smooth: {
                    type: 'cubicBezier',
                    forceDirection: 'horizontal'
                }
            },
            physics: {
                stabilization: {
                    iterations: 200
                },
                barnesHut: {
                    gravitationalConstant: -80000,
                    centralGravity: 0.3,
                    springLength: 95,
                    springConstant: 0.04
                }
            },
            groups: {
                composables: { color: { background: '#e8f5e8', border: '#4caf50' } },
                components: { color: { background: '#fff3e0', border: '#ff9800' } },
                utils: { color: { background: '#e3f2fd', border: '#2196f3' } },
                stores: { color: { background: '#f3e5f5', border: '#9c27b0' } },
                types: { color: { background: '#fce4ec', border: '#e91e63' } },
                views: { color: { background: '#e8f5e8', border: '#4caf50' } },
                router: { color: { background: '#fff3e0', border: '#ff9800' } },
                constants: { color: { background: '#e3f2fd', border: '#2196f3' } },
                icons: { color: { background: '#f3e5f5', border: '#9c27b0' } }
            }
        };

        const network = new vis.Network(
            document.getElementById('network'),
            data,
            options
        );

        network.on('stabilizationIterationsDone', function() {
            network.setOptions({ physics: false });
        });
    </script>
</body>
</html>
`;
}

/**
 * 保存文件
 * @param {Object} graphData - 图数据
 */
function saveFiles(graphData) {
  const { dependencyGraph, circularDeps } = graphData;

  const docsDir = path.join(__dirname, '..', 'docs', 'dependency-graph');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // DOT 文件
  const dotContent = generateDotGraph(dependencyGraph);
  const dotPath = path.join(docsDir, 'dependency-graph.dot');
  fs.writeFileSync(dotPath, dotContent, 'utf8');
  console.log(`📄 DOT图已保存: ${path.relative(process.cwd(), dotPath)}`);

  // JSON 数据
  const jsonPath = path.join(docsDir, 'dependency-graph.json');
  fs.writeFileSync(jsonPath, JSON.stringify(graphData, null, 2), 'utf8');
  console.log(`📊 JSON数据已保存: ${path.relative(process.cwd(), jsonPath)}`);

  // HTML 可视化
  const htmlContent = generateHtmlGraph(dependencyGraph, circularDeps);
  const htmlPath = path.join(docsDir, 'dependency-graph.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`🌐 HTML图表已保存: ${path.relative(process.cwd(), htmlPath)}`);
}

/**
 * 主函数
 */
async function main() {
  try {
    const graphData = await generateDependencyGraph();
    saveFiles(graphData);

    const { dependencyGraph, circularDeps } = graphData;
    const totalModules = Object.keys(dependencyGraph).length;
    const totalDeps = Object.values(dependencyGraph).reduce((sum, deps) => sum + deps.length, 0);

    console.log('✅ 依赖关系图生成完成！');
    console.log(`📊 共分析 ${totalModules} 个模块，${totalDeps} 个依赖关系`);
    console.log(`🔄 发现 ${circularDeps.length} 个循环依赖`);

    if (circularDeps.length > 0) {
      console.log('\n🔍 循环依赖链:');
      circularDeps.forEach((chain, index) => {
        const chainPath = chain.map(file => path.relative(path.join(__dirname, '..', 'src'), file)).join(' → ');
        console.log(`  ${index + 1}. ${chainPath}`);
      });
    }

  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateDependencyGraph, generateDotGraph, generateHtmlGraph };
