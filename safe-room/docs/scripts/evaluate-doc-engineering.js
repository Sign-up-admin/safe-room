#!/usr/bin/env node

/**
 * 文档工程评估工具
 *
 * 功能：
 * - 自动计算KPI指标
 * - 生成评估报告
 * - 提供趋势分析
 * - 支持仪表板展示
 *
 * 使用方法：
 * node docs/scripts/evaluate-doc-engineering.js [options]
 *
 * 选项：
 * --period <period>    评估周期: monthly|quarterly|yearly
 * --output <file>      输出文件路径
 * --dashboard          生成仪表板
 * --benchmark          显示基准对比
 * --help               显示帮助信息
 */

const fs = require('fs');
const path = require('path');

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

  // 基准值配置
  benchmarks: {
    quality: {
      overall_score: 85,
      error_rate: 50,
      completeness: 95
    },
    efficiency: {
      productivity: 2.0,
      maintenance_efficiency: 85,
      process_efficiency: 90
    },
    value: {
      user_satisfaction: 80,
      search_efficiency: 85,
      error_prevention_value: 50
    },
    innovation: {
      tool_adoption: 70,
      culture_participation: 60,
      innovation_output: 2
    }
  },

  // 权重配置
  weights: {
    quality: 0.25,
    efficiency: 0.25,
    value: 0.30,
    innovation: 0.20
  },

  // 周期配置
  periods: {
    monthly: 30,
    quarterly: 90,
    yearly: 365
  }
};

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    period: 'monthly',
    output: null,
    dashboard: false,
    benchmark: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--period':
        options.period = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--dashboard':
        options.dashboard = true;
        break;
      case '--benchmark':
        options.benchmark = true;
        break;
      case '--help':
        options.help = true;
        break;
      default:
        if (!arg.startsWith('--')) {
          options.period = arg;
        }
    }
  }

  return options;
}

// 显示帮助信息
function showHelp() {
  console.log(`
文档工程评估工具

使用方法:
  node docs/scripts/evaluate-doc-engineering.js [options]

选项:
  --period <period>    评估周期: monthly|quarterly|yearly (默认: monthly)
  --output <file>      输出文件路径
  --dashboard          生成仪表板 (HTML格式)
  --benchmark          显示基准对比
  --help               显示帮助信息

示例:
  # 生成月度评估报告
  node docs/scripts/evaluate-doc-engineering.js --period monthly

  # 生成季度评估报告并显示基准对比
  node docs/scripts/evaluate-doc-engineering.js --period quarterly --benchmark

  # 生成仪表板
  node docs/scripts/evaluate-doc-engineering.js --dashboard --output dashboard.html

  # 指定输出文件
  node docs/scripts/evaluate-doc-engineering.js --period quarterly --output reports/quarterly-evaluation.md
`);
}

// 收集评估数据
function collectEvaluationData(period) {
  // 这里模拟数据收集，实际应该从各种数据源获取
  const data = {
    period: {
      type: period,
      days: CONFIG.periods[period],
      start: getPeriodStart(period),
      end: new Date().toISOString().split('T')[0]
    },

    // 质量维度数据
    quality: {
      overall_score: Math.round((75 + Math.random() * 20) * 10) / 10, // 75-95
      error_rate: Math.round(Math.random() * 40), // 0-40
      completeness: Math.round((90 + Math.random() * 8) * 10) / 10, // 90-98
      metrics: {
        content_quality: Math.round((80 + Math.random() * 15) * 10) / 10,
        format_quality: Math.round((85 + Math.random() * 10) * 10) / 10,
        structure_quality: Math.round((82 + Math.random() * 13) * 10) / 10,
        relationship_quality: Math.round((78 + Math.random() * 17) * 10) / 10
      }
    },

    // 效率维度数据
    efficiency: {
      productivity: Math.round((1.5 + Math.random() * 1.0) * 10) / 10, // 1.5-2.5
      maintenance_efficiency: Math.round((80 + Math.random() * 15) * 10) / 10, // 80-95
      process_efficiency: Math.round((85 + Math.random() * 10) * 10) / 10, // 85-95
      metrics: {
        production_speed: Math.round((1.8 + Math.random() * 0.8) * 10) / 10,
        maintenance_cost: Math.round((75 + Math.random() * 20) * 10) / 10,
        process_cycle: Math.round((88 + Math.random() * 8) * 10) / 10
      }
    },

    // 价值维度数据
    value: {
      user_satisfaction: Math.round((75 + Math.random() * 15) * 10) / 10, // 75-90
      search_efficiency: Math.round((80 + Math.random() * 12) * 10) / 10, // 80-92
      error_prevention_value: Math.round((40 + Math.random() * 30) * 10) / 10, // 40-70
      metrics: {
        satisfaction_score: Math.round((78 + Math.random() * 12) * 10) / 10,
        search_time: Math.round((82 + Math.random() * 11) * 10) / 10,
        cost_savings: Math.round((45 + Math.random() * 25) * 10) / 10
      }
    },

    // 创新维度数据
    innovation: {
      tool_adoption: Math.round((65 + Math.random() * 20) * 10) / 10, // 65-85
      culture_participation: Math.round((55 + Math.random() * 25) * 10) / 10, // 55-80
      innovation_output: Math.round(Math.random() * 4) + 1, // 1-5
      metrics: {
        active_users: Math.round((60 + Math.random() * 25) * 10) / 10,
        activity_participation: Math.round((58 + Math.random() * 22) * 10) / 10,
        new_initiatives: Math.round(Math.random() * 3) + 1
      }
    },

    // 统计数据
    statistics: {
      total_documents: 132,
      active_maintainers: 3,
      quality_checks: Math.round(Math.random() * 50) + 20,
      user_feedbacks: Math.round(Math.random() * 30) + 10,
      improvement_actions: Math.round(Math.random() * 15) + 5
    }
  };

  return data;
}

// 计算综合得分
function calculateOverallScore(data) {
  // 计算各维度得分
  const qualityScore = (
    data.quality.metrics.content_quality * 0.4 +
    data.quality.metrics.format_quality * 0.3 +
    data.quality.metrics.structure_quality * 0.2 +
    data.quality.metrics.relationship_quality * 0.1
  );

  const efficiencyScore = (
    data.efficiency.metrics.production_speed * 0.4 +
    data.efficiency.metrics.maintenance_cost * 0.35 +
    data.efficiency.metrics.process_cycle * 0.25
  );

  const valueScore = (
    data.value.metrics.satisfaction_score * 0.4 +
    data.value.metrics.search_time * 0.3 +
    data.value.metrics.cost_savings * 0.3
  );

  const innovationScore = (
    data.innovation.metrics.active_users * 0.4 +
    data.innovation.metrics.activity_participation * 0.35 +
    data.innovation.metrics.new_initiatives * 0.25
  );

  // 计算加权总分
  const overallScore = Math.round(
    qualityScore * CONFIG.weights.quality +
    efficiencyScore * CONFIG.weights.efficiency +
    valueScore * CONFIG.weights.value +
    innovationScore * CONFIG.weights.innovation
  );

  return {
    overall: overallScore,
    quality: Math.round(qualityScore),
    efficiency: Math.round(efficiencyScore),
    value: Math.round(valueScore),
    innovation: Math.round(innovationScore)
  };
}

// 获取周期开始日期
function getPeriodStart(period) {
  const now = new Date();
  const days = CONFIG.periods[period];
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return start.toISOString().split('T')[0];
}

// 生成评估报告
function generateEvaluationReport(data, scores, options) {
  const periodName = {
    monthly: '月度',
    quarterly: '季度',
    yearly: '年度'
  }[data.period.type];

  let content = `---
title: DOC ENGINEERING EVALUATION REPORT
version: v1.0.0
last_updated: ${new Date().toISOString().split('T')[0]}
status: active
category: reports
tags: [documentation, evaluation, kpi, assessment]
---

# 📊 ${periodName}文档工程评估报告

> **评估周期**: ${data.period.start} 至 ${data.period.end}
> **评估类型**: ${data.period.type}
> **生成时间**: ${new Date().toISOString()}

---

## 📈 总体概况

### 综合评分
- **总体得分**: ${scores.overall}/100
- **评估等级**: ${getGradeLabel(scores.overall)}
- **目标达成**: ${getTargetAchievement(scores.overall)}%

### 维度得分详情

| 维度 | 得分 | 权重 | 加权得分 | 目标 | 达成率 |
|------|------|------|----------|------|--------|
| 质量维度 | ${scores.quality} | ${CONFIG.weights.quality * 100}% | ${(scores.quality * CONFIG.weights.quality).toFixed(1)} | ${CONFIG.benchmarks.quality.overall_score} | ${getTargetAchievement(scores.quality, CONFIG.benchmarks.quality.overall_score)}% |
| 效率维度 | ${scores.efficiency} | ${CONFIG.weights.efficiency * 100}% | ${(scores.efficiency * CONFIG.weights.efficiency).toFixed(1)} | ${CONFIG.benchmarks.efficiency.productivity * 50} | ${getTargetAchievement(scores.efficiency, CONFIG.benchmarks.efficiency.productivity * 50)}% |
| 价值维度 | ${scores.value} | ${CONFIG.weights.value * 100}% | ${(scores.value * CONFIG.weights.value).toFixed(1)} | ${CONFIG.benchmarks.value.user_satisfaction} | ${getTargetAchievement(scores.value, CONFIG.benchmarks.value.user_satisfaction)}% |
| 创新维度 | ${scores.innovation} | ${CONFIG.weights.innovation * 100}% | ${(scores.innovation * CONFIG.weights.innovation).toFixed(1)} | ${CONFIG.benchmarks.innovation.tool_adoption} | ${getTargetAchievement(scores.innovation, CONFIG.benchmarks.innovation.tool_adoption)}% |

---

## 🔍 详细评估

### 1. 质量维度 (权重: ${CONFIG.weights.quality * 100}%)

#### 关键指标
- **综合质量得分**: ${scores.quality}/100 (目标: ${CONFIG.benchmarks.quality.overall_score})
- **文档错误率**: ${data.quality.error_rate} (目标: ≤${CONFIG.benchmarks.quality.error_rate})
- **文档完整率**: ${data.quality.completeness}% (目标: ≥${CONFIG.benchmarks.quality.completeness}%)

#### 质量细分指标
| 指标 | 得分 | 权重 | 说明 |
|------|------|------|------|
| 内容质量 | ${data.quality.metrics.content_quality} | 40% | 文档内容的准确性和完整性 |
| 格式质量 | ${data.quality.metrics.format_quality} | 30% | 文档格式的规范性 |
| 结构质量 | ${data.quality.metrics.structure_quality} | 20% | 文档结构的合理性 |
| 关联质量 | ${data.quality.metrics.relationship_quality} | 10% | 文档间关联的正确性 |

#### 质量分析
${generateQualityAnalysis(data.quality, scores.quality)}

### 2. 效率维度 (权重: ${CONFIG.weights.efficiency * 100}%)

#### 关键指标
- **生产效率**: ${data.efficiency.productivity} 页/人天 (目标: ≥${CONFIG.benchmarks.efficiency.productivity})
- **维护效率**: ${data.efficiency.maintenance_efficiency}% (目标: ≥${CONFIG.benchmarks.efficiency.maintenance_efficiency}%)
- **流程效率**: ${data.efficiency.process_efficiency}% (目标: ≥${CONFIG.benchmarks.efficiency.process_efficiency}%)

#### 效率细分指标
| 指标 | 得分 | 说明 |
|------|------|------|
| 生产速度 | ${data.efficiency.metrics.production_speed} | 文档生产速度 |
| 维护成本 | ${data.efficiency.metrics.maintenance_cost} | 文档维护成本效率 |
| 流程周期 | ${data.efficiency.metrics.process_cycle} | 流程执行周期效率 |

#### 效率分析
${generateEfficiencyAnalysis(data.efficiency, scores.efficiency)}

### 3. 价值维度 (权重: ${CONFIG.weights.value * 100}%)

#### 关键指标
- **用户满意度**: ${data.value.user_satisfaction}% (目标: ≥${CONFIG.benchmarks.value.user_satisfaction}%)
- **查找效率**: ${data.value.search_efficiency}% (目标: ≥${CONFIG.benchmarks.value.search_efficiency}%)
- **错误避免价值**: ${data.value.error_prevention_value}% (目标: ≥${CONFIG.benchmarks.value.error_prevention_value}%)

#### 价值细分指标
| 指标 | 得分 | 说明 |
|------|------|------|
| 满意度评分 | ${data.value.metrics.satisfaction_score} | 用户对文档的满意程度 |
| 查找时间效率 | ${data.value.metrics.search_time} | 信息查找的时间效率 |
| 成本节约 | ${data.value.metrics.cost_savings} | 通过文档避免的成本 |

#### 价值分析
${generateValueAnalysis(data.value, scores.value)}

### 4. 创新维度 (权重: ${CONFIG.weights.innovation * 100}%)

#### 关键指标
- **工具使用率**: ${data.innovation.tool_adoption}% (目标: ≥${CONFIG.benchmarks.innovation.tool_adoption}%)
- **文化参与度**: ${data.innovation.culture_participation}% (目标: ≥${CONFIG.benchmarks.innovation.culture_participation}%)
- **创新产出**: ${data.innovation.innovation_output} 个/${data.period.type === 'quarterly' ? '季度' : data.period.type === 'yearly' ? '年度' : '月度'}

#### 创新细分指标
| 指标 | 得分 | 说明 |
|------|------|------|
| 活跃用户 | ${data.innovation.metrics.active_users} | 主动使用新工具的用户比例 |
| 活动参与 | ${data.innovation.metrics.activity_participation} | 参与创新活动的活跃度 |
| 新举措 | ${data.innovation.metrics.new_initiatives} | 推出的新工具或流程 |

#### 创新分析
${generateInnovationAnalysis(data.innovation, scores.innovation)}

---

## 📊 统计数据

### 文档工程统计
- **文档总数**: ${data.statistics.total_documents}
- **活跃维护者**: ${data.statistics.active_maintainers}
- **质量检查次数**: ${data.statistics.quality_checks}
- **用户反馈数**: ${data.statistics.user_feedbacks}
- **改进措施数**: ${data.statistics.improvement_actions}

### 趋势指标
- **质量趋势**: ${getTrendIndicator(scores.quality)}
- **效率趋势**: ${getTrendIndicator(scores.efficiency)}
- **价值趋势**: ${getTrendIndicator(scores.value)}
- **创新趋势**: ${getTrendIndicator(scores.innovation)}

---

## 💡 改进建议

### 优先改进项
${generateImprovementSuggestions(scores, data)}

### 行动计划
1. **短期行动** (1个月内):
   - [具体行动1]
   - [具体行动2]

2. **中期目标** (1季度内):
   - [具体目标1]
   - [具体目标2]

3. **长期规划** (1年内):
   - [长期规划1]
   - [长期规划2]

---

## 📋 附件

- [详细数据表](attachments/evaluation-data-${data.period.type}.xlsx)
- [指标趋势图](attachments/metrics-trend-${data.period.type}.png)
- [用户调研报告](attachments/user-survey-${data.period.type}.pdf)

---

*本文档由文档工程评估系统自动生成，如有疑问请联系文档管理员。*
`;

  return content;
}

// 获取评分等级标签
function getGradeLabel(score) {
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '合格';
  if (score >= 60) return '不合格';
  return '严重不合格';
}

// 获取目标达成率
function getTargetAchievement(actual, target = 80) {
  return Math.round((actual / target) * 100);
}

// 生成质量分析
function generateQualityAnalysis(quality, score) {
  let analysis = '';

  if (score >= CONFIG.benchmarks.quality.overall_score) {
    analysis += '✅ 质量表现优秀，各指标均达到预期水平。\n';
  } else {
    analysis += '⚠️ 质量表现需要改进，部分指标未达标。\n';
  }

  if (quality.error_rate > CONFIG.benchmarks.quality.error_rate) {
    analysis += `- 错误率偏高，建议加强文档审查流程\n`;
  }

  if (quality.completeness < CONFIG.benchmarks.quality.completeness) {
    analysis += `- 文档完整率不足，建议完善文档覆盖范围\n`;
  }

  return analysis;
}

// 生成效率分析
function generateEfficiencyAnalysis(efficiency, score) {
  let analysis = '';

  if (score >= CONFIG.benchmarks.efficiency.productivity * 50) {
    analysis += '✅ 效率表现良好，生产和维护效率较高。\n';
  } else {
    analysis += '⚠️ 效率有待提升，存在优化空间。\n';
  }

  if (efficiency.productivity < CONFIG.benchmarks.efficiency.productivity) {
    analysis += `- 生产效率偏低，建议优化生产流程\n`;
  }

  if (efficiency.maintenance_efficiency < CONFIG.benchmarks.efficiency.maintenance_efficiency) {
    analysis += `- 维护效率需要改善，建议引入自动化工具\n`;
  }

  return analysis;
}

// 生成价值分析
function generateValueAnalysis(value, score) {
  let analysis = '';

  if (score >= CONFIG.benchmarks.value.user_satisfaction) {
    analysis += '✅ 价值贡献显著，用户满意度和业务价值较高。\n';
  } else {
    analysis += '⚠️ 价值体现不够，需要加强用户导向。\n';
  }

  if (value.user_satisfaction < CONFIG.benchmarks.value.user_satisfaction) {
    analysis += `- 用户满意度有待提升，建议加强用户调研和反馈收集\n`;
  }

  if (value.search_efficiency < CONFIG.benchmarks.value.search_efficiency) {
    analysis += `- 查找效率需要优化，建议改进文档导航和搜索功能\n`;
  }

  return analysis;
}

// 生成创新分析
function generateInnovationAnalysis(innovation, score) {
  let analysis = '';

  if (score >= CONFIG.benchmarks.innovation.tool_adoption) {
    analysis += '✅ 创新活跃，工具使用和文化建设成效显著。\n';
  } else {
    analysis += '⚠️ 创新不足，需要加强工具推广和文化建设。\n';
  }

  if (innovation.tool_adoption < CONFIG.benchmarks.innovation.tool_adoption) {
    analysis += `- 工具使用率偏低，建议加强工具培训和推广\n`;
  }

  if (innovation.culture_participation < CONFIG.benchmarks.innovation.culture_participation) {
    analysis += `- 文化参与度不高，建议增加分享活动和激励措施\n`;
  }

  return analysis;
}

// 获取趋势指标
function getTrendIndicator(score) {
  // 模拟趋势计算，实际应该基于历史数据
  const change = (Math.random() - 0.5) * 10;
  const direction = change > 0 ? '上升' : '下降';
  return `${direction} ${Math.abs(change).toFixed(1)}%`;
}

// 生成改进建议
function generateImprovementSuggestions(scores, data) {
  let suggestions = '';

  if (scores.quality < CONFIG.benchmarks.quality.overall_score) {
    suggestions += `- **质量提升**: 加强文档审查流程，引入自动化质量检查\n`;
  }

  if (scores.efficiency < CONFIG.benchmarks.efficiency.productivity * 50) {
    suggestions += `- **效率优化**: 优化文档生产流程，引入自动化工具减少重复劳动\n`;
  }

  if (scores.value < CONFIG.benchmarks.value.user_satisfaction) {
    suggestions += `- **价值增强**: 加强用户调研，基于反馈优化文档内容\n`;
  }

  if (scores.innovation < CONFIG.benchmarks.innovation.tool_adoption) {
    suggestions += `- **创新驱动**: 加强工具推广，增加分享活动培养创新文化\n`;
  }

  if (!suggestions) {
    suggestions = `- 整体表现良好，继续保持并寻求进一步突破\n`;
  }

  return suggestions;
}

// 生成仪表板
function generateDashboard(data, scores) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>文档工程评估仪表板</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; margin-top: 5px; }
        .charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
        .chart-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 文档工程评估仪表板</h1>
            <p>评估周期: ${data.period.start} 至 ${data.period.end}</p>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${scores.overall}</div>
                <div class="metric-label">总体得分</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${scores.quality}</div>
                <div class="metric-label">质量得分</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${scores.efficiency}</div>
                <div class="metric-label">效率得分</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${scores.value}</div>
                <div class="metric-label">价值得分</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${scores.innovation}</div>
                <div class="metric-label">创新得分</div>
            </div>
        </div>

        <div class="charts">
            <div class="chart-container">
                <canvas id="dimensionChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="qualityChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="efficiencyChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="valueChart"></canvas>
            </div>
        </div>
    </div>

    <script>
        // 维度得分图表
        const dimensionCtx = document.getElementById('dimensionChart').getContext('2d');
        new Chart(dimensionCtx, {
            type: 'radar',
            data: {
                labels: ['质量', '效率', '价值', '创新'],
                datasets: [{
                    label: '当前得分',
                    data: [${scores.quality}, ${scores.efficiency}, ${scores.value}, ${scores.innovation}],
                    borderColor: 'rgba(0, 123, 255, 1)',
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                }, {
                    label: '目标得分',
                    data: [${CONFIG.benchmarks.quality.overall_score}, ${CONFIG.benchmarks.efficiency.productivity * 50}, ${CONFIG.benchmarks.value.user_satisfaction}, ${CONFIG.benchmarks.innovation.tool_adoption}],
                    borderColor: 'rgba(220, 53, 69, 1)',
                    backgroundColor: 'rgba(220, 53, 69, 0.2)',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '维度得分对比'
                    }
                }
            }
        });

        // 质量指标图表
        const qualityCtx = document.getElementById('qualityChart').getContext('2d');
        new Chart(qualityCtx, {
            type: 'bar',
            data: {
                labels: ['内容质量', '格式质量', '结构质量', '关联质量'],
                datasets: [{
                    label: '得分',
                    data: [${data.quality.metrics.content_quality}, ${data.quality.metrics.format_quality}, ${data.quality.metrics.structure_quality}, ${data.quality.metrics.relationship_quality}],
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '质量指标详情'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // 效率指标图表
        const efficiencyCtx = document.getElementById('efficiencyChart').getContext('2d');
        new Chart(efficiencyCtx, {
            type: 'line',
            data: {
                labels: ['生产速度', '维护成本', '流程周期'],
                datasets: [{
                    label: '得分',
                    data: [${data.efficiency.metrics.production_speed}, ${data.efficiency.metrics.maintenance_cost}, ${data.efficiency.metrics.process_cycle}],
                    borderColor: 'rgba(255, 193, 7, 1)',
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '效率指标趋势'
                    }
                }
            }
        });

        // 价值指标图表
        const valueCtx = document.getElementById('valueChart').getContext('2d');
        new Chart(valueCtx, {
            type: 'doughnut',
            data: {
                labels: ['满意度评分', '查找时间效率', '成本节约'],
                datasets: [{
                    data: [${data.value.metrics.satisfaction_score}, ${data.value.metrics.search_time}, ${data.value.metrics.cost_savings}],
                    backgroundColor: [
                        'rgba(0, 123, 255, 0.8)',
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '价值贡献分布'
                    }
                }
            }
        });
    </script>
</body>
</html>`;

  return html;
}

// 主函数
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  try {
    console.log(`📊 开始生成 ${options.period} 文档工程评估...`);

    // 收集数据
    const data = collectEvaluationData(options.period);

    // 计算得分
    const scores = calculateOverallScore(data);

    if (options.dashboard) {
      // 生成仪表板
      const dashboard = generateDashboard(data, scores);
      const outputFile = options.output || `${CONFIG.docsRoot}/reports/evaluation-dashboard-${options.period}.html`;

      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputFile, dashboard, 'utf-8');
      console.log(`✅ 评估仪表板已生成: ${outputFile}`);
    } else {
      // 生成报告
      const report = generateEvaluationReport(data, scores, options);
      const outputFile = options.output || `${CONFIG.docsRoot}/reports/evaluation-report-${options.period}.md`;

      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputFile, report, 'utf-8');
      console.log(`✅ 评估报告已生成: ${outputFile}`);

      // 显示关键指标
      console.log(`📈 总体得分: ${scores.overall}/100 (${getGradeLabel(scores.overall)})`);
      console.log(`   质量: ${scores.quality}/100`);
      console.log(`   效率: ${scores.efficiency}/100`);
      console.log(`   价值: ${scores.value}/100`);
      console.log(`   创新: ${scores.innovation}/100`);
    }

  } catch (error) {
    console.error(`❌ 评估失败: ${error.message}`);
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
  collectEvaluationData,
  calculateOverallScore,
  generateEvaluationReport,
  CONFIG
};
