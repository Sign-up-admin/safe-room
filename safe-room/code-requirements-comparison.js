const fs = require('fs');
const path = require('path');

function analyzeCodeRequirementsComparison() {
  const analysis = {
    implementedFeatures: {
      frontend: {
        pages: [],
        components: [],
        composables: []
      },
      backend: {
        controllers: [],
        services: [],
        entities: []
      },
      database: {
        tables: []
      }
    },
    documentedFeatures: {
      frontend: [],
      admin: [],
      common: []
    },
    comparison: {
      implementedNotDocumented: [],
      documentedNotImplemented: [],
      fullyMatched: []
    },
    analysisTime: new Date().toISOString()
  };

  // 1. 分析前端已实现功能
  function analyzeFrontend() {
    const frontendSrc = 'springboot1ngh61a2/src/main/resources/front/front/src';

    // 分析页面
    const pagesDir = path.join(frontendSrc, 'pages');
    if (fs.existsSync(pagesDir)) {
      const pageDirs = fs.readdirSync(pagesDir).filter(item =>
        fs.statSync(path.join(pagesDir, item)).isDirectory()
      );

      pageDirs.forEach(pageDir => {
        const pageFiles = fs.readdirSync(path.join(pagesDir, pageDir))
          .filter(file => file.endsWith('.vue'))
          .map(file => file.replace('.vue', ''));

        analysis.implementedFeatures.frontend.pages.push({
          module: pageDir,
          pages: pageFiles,
          route: `/${pageDir}`
        });
      });
    }

    // 分析组件
    const componentsDir = path.join(frontendSrc, 'components');
    if (fs.existsSync(componentsDir)) {
      const componentDirs = fs.readdirSync(componentsDir).filter(item =>
        fs.statSync(path.join(componentsDir, item)).isDirectory()
      );

      componentDirs.forEach(compDir => {
        const compFiles = fs.readdirSync(path.join(componentsDir, compDir))
          .filter(file => file.endsWith('.vue'))
          .map(file => file.replace('.vue', ''));

        analysis.implementedFeatures.frontend.components.push({
          category: compDir,
          components: compFiles
        });
      });
    }

    // 分析组合式函数
    const composablesDir = path.join(frontendSrc, 'composables');
    if (fs.existsSync(composablesDir)) {
      const composableFiles = fs.readdirSync(composablesDir)
        .filter(file => file.endsWith('.ts'))
        .map(file => file.replace('.ts', ''));

      analysis.implementedFeatures.frontend.composables = composableFiles;
    }
  }

  // 2. 分析后端已实现功能
  function analyzeBackend() {
    const backendSrc = 'springboot1ngh61a2/src/main/java/com';

    // 分析控制器
    const controllerDir = path.join(backendSrc, 'controller');
    if (fs.existsSync(controllerDir)) {
      const controllers = fs.readdirSync(controllerDir)
        .filter(file => file.endsWith('Controller.java'))
        .map(file => file.replace('Controller.java', ''));

      analysis.implementedFeatures.backend.controllers = controllers;
    }

    // 分析服务
    const serviceDir = path.join(backendSrc, 'service');
    if (fs.existsSync(serviceDir)) {
      const services = fs.readdirSync(serviceDir)
        .filter(file => file.endsWith('Service.java') || file.endsWith('ServiceImpl.java'))
        .map(file => file.replace('.java', ''));

      analysis.implementedFeatures.backend.services = services;
    }

    // 分析实体
    const entityDir = path.join(backendSrc, 'entity');
    if (fs.existsSync(entityDir)) {
      const entities = fs.readdirSync(entityDir)
        .filter(file => file.endsWith('Entity.java') && !file.includes('model') && !file.includes('view') && !file.includes('vo'))
        .map(file => file.replace('Entity.java', ''));

      analysis.implementedFeatures.backend.entities = entities;
    }
  }

  // 3. 分析数据库表结构
  function analyzeDatabase() {
    const schemaFile = 'springboot1ngh61a2/db/springboot1ngh61a2.sql';
    if (fs.existsSync(schemaFile)) {
      const content = fs.readFileSync(schemaFile, 'utf8');
      const tableMatches = content.match(/CREATE TABLE (\w+)/g);
      if (tableMatches) {
        const tables = tableMatches.map(match => match.replace('CREATE TABLE ', ''));
        analysis.implementedFeatures.database.tables = tables;
      }
    }
  }

  // 4. 分析需求文档
  function analyzeRequirements() {
    const requirementsDir = 'docs/requirements';
    const requirementFiles = [];

    function scanRequirements(dir) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.includes('backup-') &&
            ['admin', 'frontend', 'common'].includes(item)) {
          scanRequirements(fullPath);
        } else if (item.endsWith('.md') && !item.includes('.backup-')) {
          const relativePath = path.relative(requirementsDir, fullPath);
          requirementFiles.push({
            file: relativePath,
            module: item.replace('_REQUIREMENTS.md', '').replace('REQUIREMENTS.md', '').toLowerCase()
          });
        }
      }
    }

    scanRequirements(requirementsDir);

    // 分类需求文档
    requirementFiles.forEach(req => {
      if (req.file.startsWith('admin/') || req.module.includes('admin')) {
        analysis.documentedFeatures.admin.push(req);
      } else if (req.file.includes('frontend/') || req.module.includes('frontend')) {
        analysis.documentedFeatures.frontend.push(req);
      } else {
        analysis.documentedFeatures.common.push(req);
      }
    });
  }

  // 5. 执行对比分析
  function performComparison() {
    // 前端页面对比
    const documentedPages = analysis.documentedFeatures.frontend
      .filter(req => !req.module.includes('admin'))
      .map(req => req.module);

    analysis.implementedFeatures.frontend.pages.forEach(pageGroup => {
      const implementedPages = pageGroup.pages;
      const documentedRelated = documentedPages.filter(doc =>
        doc.includes(pageGroup.module) || pageGroup.module.includes(doc)
      );

      implementedPages.forEach(page => {
        const hasDocumentation = documentedRelated.some(doc =>
          doc.includes(page.toLowerCase()) || page.toLowerCase().includes(doc)
        );

        if (!hasDocumentation) {
          analysis.comparison.implementedNotDocumented.push({
            type: 'frontend_page',
            module: pageGroup.module,
            feature: page,
            route: pageGroup.route
          });
        } else {
          analysis.comparison.fullyMatched.push({
            type: 'frontend_page',
            module: pageGroup.module,
            feature: page
          });
        }
      });
    });

    // 组件对比
    analysis.implementedFeatures.frontend.components.forEach(compGroup => {
      compGroup.components.forEach(comp => {
        const hasDocumentation = analysis.documentedFeatures.frontend.some(req =>
          req.module.includes(comp.toLowerCase()) || comp.toLowerCase().includes(req.module)
        );

        if (!hasDocumentation) {
          analysis.comparison.implementedNotDocumented.push({
            type: 'frontend_component',
            category: compGroup.category,
            feature: comp
          });
        }
      });
    });

    // 组合式函数对比
    analysis.implementedFeatures.frontend.composables.forEach(composable => {
      const hasDocumentation = analysis.documentedFeatures.frontend.some(req =>
        req.module.includes(composable.toLowerCase()) || composable.toLowerCase().includes(req.module)
      );

      if (!hasDocumentation) {
        analysis.comparison.implementedNotDocumented.push({
          type: 'frontend_composable',
          feature: composable
        });
      }
    });

    // 后端控制器对比
    analysis.implementedFeatures.backend.controllers.forEach(controller => {
      const hasDocumentation = analysis.documentedFeatures.admin.some(req =>
        req.module.includes(controller.toLowerCase()) || controller.toLowerCase().includes(req.module)
      );

      if (!hasDocumentation) {
        analysis.comparison.implementedNotDocumented.push({
          type: 'backend_controller',
          feature: controller
        });
      }
    });

    // 实体对比
    analysis.implementedFeatures.backend.entities.forEach(entity => {
      const hasDocumentation = [...analysis.documentedFeatures.admin, ...analysis.documentedFeatures.common].some(req =>
        req.module.includes(entity.toLowerCase()) || entity.toLowerCase().includes(req.module)
      );

      if (!hasDocumentation) {
        analysis.comparison.implementedNotDocumented.push({
          type: 'backend_entity',
          feature: entity
        });
      }
    });

    // 检查文档化但未实现的功能
    // 这是比较困难的，需要基于文档内容分析，这里提供基本检查
    analysis.documentedFeatures.frontend.forEach(req => {
      const moduleName = req.module;
      const hasImplementation = analysis.implementedFeatures.frontend.pages.some(page =>
        page.module.includes(moduleName) || moduleName.includes(page.module)
      );

      if (!hasImplementation) {
        analysis.comparison.documentedNotImplemented.push({
          type: 'frontend_requirement',
          feature: req.file,
          module: moduleName
        });
      }
    });
  }

  // 执行所有分析
  analyzeFrontend();
  analyzeBackend();
  analyzeDatabase();
  analyzeRequirements();
  performComparison();

  // 生成报告
  console.log('=== 代码与需求对比分析报告 ===');
  console.log(`分析时间: ${analysis.analysisTime}`);
  console.log();

  console.log('已实现功能统计:');
  console.log(`- 前端页面模块: ${analysis.implementedFeatures.frontend.pages.length}`);
  console.log(`- 前端组件类别: ${analysis.implementedFeatures.frontend.components.length}`);
  console.log(`- 前端组合式函数: ${analysis.implementedFeatures.frontend.composables.length}`);
  console.log(`- 后端控制器: ${analysis.implementedFeatures.backend.controllers.length}`);
  console.log(`- 后端实体: ${analysis.implementedFeatures.backend.entities.length}`);
  console.log(`- 数据库表: ${analysis.implementedFeatures.database.tables.length}`);
  console.log();

  console.log('已文档化功能统计:');
  console.log(`- 前端需求文档: ${analysis.documentedFeatures.frontend.length}`);
  console.log(`- 管理后台需求文档: ${analysis.documentedFeatures.admin.length}`);
  console.log(`- 通用需求文档: ${analysis.documentedFeatures.common.length}`);
  console.log();

  console.log('对比结果:');
  console.log(`- 已实现但未文档化: ${analysis.comparison.implementedNotDocumented.length}`);
  console.log(`- 文档化但未实现: ${analysis.comparison.documentedNotImplemented.length}`);
  console.log(`- 完全匹配: ${analysis.comparison.fullyMatched.length}`);
  console.log();

  if (analysis.comparison.implementedNotDocumented.length > 0) {
    console.log('🚨 已实现但未文档化的功能:');
    analysis.comparison.implementedNotDocumented.forEach(item => {
      console.log(`  ${item.type}: ${item.feature} (${item.module || item.category || 'unknown'})`);
    });
    console.log();
  }

  if (analysis.comparison.documentedNotImplemented.length > 0) {
    console.log('⚠️ 文档化但未实现的功能:');
    analysis.comparison.documentedNotImplemented.forEach(item => {
      console.log(`  ${item.type}: ${item.feature}`);
    });
    console.log();
  }

  // 保存详细报告
  fs.writeFileSync('docs/reports/code-requirements-comparison.json', JSON.stringify(analysis, null, 2));
  console.log('详细报告已保存到: docs/reports/code-requirements-comparison.json');

  return analysis;
}

analyzeCodeRequirementsComparison();
