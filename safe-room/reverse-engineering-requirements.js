const fs = require('fs');
const path = require('path');

function reverseEngineerRequirements() {
  const analysis = {
    frontend: {
      components: [],
      composables: [],
      pages: []
    },
    backend: {
      controllers: [],
      services: [],
      entities: []
    },
    database: {
      tables: []
    },
    businessRequirements: [],
    technicalRequirements: [],
    analysisTime: new Date().toISOString()
  };

  // 1. 深入分析前端组件需求
  function analyzeFrontendComponents() {
    const frontendSrc = 'springboot1ngh61a2/src/main/resources/front/front/src';

    // 分析组件目录
    const componentsDir = path.join(frontendSrc, 'components');
    if (fs.existsSync(componentsDir)) {
      const componentCategories = fs.readdirSync(componentsDir).filter(item =>
        fs.statSync(path.join(componentsDir, item)).isDirectory()
      );

      componentCategories.forEach(category => {
        const categoryPath = path.join(componentsDir, category);
        const componentFiles = fs.readdirSync(categoryPath)
          .filter(file => file.endsWith('.vue'))
          .map(file => file.replace('.vue', ''));

        componentFiles.forEach(compName => {
          const compPath = path.join(categoryPath, compName + '.vue');
          if (fs.existsSync(compPath)) {
            const content = fs.readFileSync(compPath, 'utf8');

            // 提取组件需求信息
            const componentAnalysis = {
              name: compName,
              category: category,
              file: compPath,
              props: extractProps(content),
              functionality: extractFunctionality(content),
              dependencies: extractDependencies(content),
              businessPurpose: inferBusinessPurpose(compName, category, content)
            };

            analysis.frontend.components.push(componentAnalysis);
          }
        });
      });
    }

    // 分析组合式函数
    const composablesDir = path.join(frontendSrc, 'composables');
    if (fs.existsSync(composablesDir)) {
      const composableFiles = fs.readdirSync(composablesDir)
        .filter(file => file.endsWith('.ts'));

      composableFiles.forEach(file => {
        const filePath = path.join(composablesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        const composableAnalysis = {
          name: file.replace('.ts', ''),
          file: filePath,
          exportedFunctions: extractExportedFunctions(content),
          functionality: extractComposableFunctionality(content),
          businessPurpose: inferComposablePurpose(file.replace('.ts', ''), content)
        };

        analysis.frontend.composables.push(composableAnalysis);
      });
    }

    // 分析页面
    const pagesDir = path.join(frontendSrc, 'pages');
    if (fs.existsSync(pagesDir)) {
      const pageModules = fs.readdirSync(pagesDir).filter(item =>
        fs.statSync(path.join(pagesDir, item)).isDirectory()
      );

      pageModules.forEach(module => {
        const modulePath = path.join(pagesDir, module);
        const pageFiles = fs.readdirSync(modulePath)
          .filter(file => file.endsWith('.vue'));

        pageFiles.forEach(pageFile => {
          const pagePath = path.join(modulePath, pageFile);
          const content = fs.readFileSync(pagePath, 'utf8');

          const pageAnalysis = {
            name: pageFile.replace('.vue', ''),
            module: module,
            route: `/${module}/${pageFile.replace('.vue', '')}`,
            functionality: extractPageFunctionality(content),
            components: extractUsedComponents(content),
            businessPurpose: inferPagePurpose(module, pageFile.replace('.vue', ''), content)
          };

          analysis.frontend.pages.push(pageAnalysis);
        });
      });
    }
  }

  // 2. 深入分析后端需求
  function analyzeBackendRequirements() {
    const backendSrc = 'springboot1ngh61a2/src/main/java/com';

    // 分析控制器
    const controllerDir = path.join(backendSrc, 'controller');
    if (fs.existsSync(controllerDir)) {
      const controllers = fs.readdirSync(controllerDir)
        .filter(file => file.endsWith('Controller.java'));

      controllers.forEach(controller => {
        const controllerPath = path.join(controllerDir, controller);
        const content = fs.readFileSync(controllerPath, 'utf8');

        const controllerAnalysis = {
          name: controller.replace('Controller.java', ''),
          file: controllerPath,
          endpoints: extractEndpoints(content),
          businessLogic: extractControllerLogic(content),
          dependencies: extractControllerDependencies(content),
          businessPurpose: inferControllerPurpose(controller.replace('Controller.java', ''), content)
        };

        analysis.backend.controllers.push(controllerAnalysis);
      });
    }

    // 分析服务
    const serviceDir = path.join(backendSrc, 'service');
    if (fs.existsSync(serviceDir)) {
      const services = fs.readdirSync(serviceDir)
        .filter(file => file.endsWith('Service.java') || file.endsWith('ServiceImpl.java'));

      services.forEach(service => {
        const servicePath = path.join(serviceDir, service);
        const content = fs.readFileSync(servicePath, 'utf8');

        const serviceAnalysis = {
          name: service.replace('.java', ''),
          file: servicePath,
          methods: extractServiceMethods(content),
          businessLogic: extractServiceLogic(content),
          businessPurpose: inferServicePurpose(service.replace('.java', ''), content)
        };

        analysis.backend.services.push(serviceAnalysis);
      });
    }

    // 分析实体
    const entityDir = path.join(backendSrc, 'entity');
    if (fs.existsSync(entityDir)) {
      const entities = fs.readdirSync(entityDir)
        .filter(file => file.endsWith('Entity.java') && !file.includes('model') && !file.includes('view') && !file.includes('vo'));

      entities.forEach(entity => {
        const entityPath = path.join(entityDir, entity);
        const content = fs.readFileSync(entityPath, 'utf8');

        const entityAnalysis = {
          name: entity.replace('Entity.java', ''),
          file: entityPath,
          fields: extractEntityFields(content),
          relationships: extractEntityRelationships(content),
          businessPurpose: inferEntityPurpose(entity.replace('Entity.java', ''), content)
        };

        analysis.backend.entities.push(entityAnalysis);
      });
    }
  }

  // 3. 分析数据库表结构需求
  function analyzeDatabaseRequirements() {
    const schemaFile = 'springboot1ngh61a2/db/springboot1ngh61a2.sql';
    if (fs.existsSync(schemaFile)) {
      const content = fs.readFileSync(schemaFile, 'utf8');
      const tableMatches = content.match(/CREATE TABLE (\w+)/g);

      if (tableMatches) {
        const tables = tableMatches.map(match => match.replace('CREATE TABLE ', ''));

        tables.forEach(tableName => {
          // 提取表结构信息
          const tableRegex = new RegExp(`CREATE TABLE ${tableName}[\\s\\S]*?;`, 'i');
          const tableMatch = content.match(tableRegex);

          if (tableMatch) {
            const tableDDL = tableMatch[0];
            const fields = extractTableFields(tableDDL);
            const constraints = extractTableConstraints(tableDDL);

            const tableAnalysis = {
              name: tableName,
              fields: fields,
              constraints: constraints,
              businessPurpose: inferTablePurpose(tableName),
              estimatedRecords: estimateTableSize(tableName)
            };

            analysis.database.tables.push(tableAnalysis);
          }
        });
      }
    }
  }

  // 4. 综合分析业务和技术需求
  function synthesizeRequirements() {
    // 从前端组件推导业务需求
    analysis.frontend.components.forEach(comp => {
      if (comp.businessPurpose) {
        analysis.businessRequirements.push({
          type: 'frontend_component',
          source: comp.name,
          requirement: comp.businessPurpose,
          priority: inferPriority(comp.category, comp.name),
          technicalDependencies: comp.dependencies
        });
      }
    });

    // 从后端接口推导业务需求
    analysis.backend.controllers.forEach(ctrl => {
      if (ctrl.businessPurpose) {
        analysis.businessRequirements.push({
          type: 'backend_api',
          source: ctrl.name,
          requirement: ctrl.businessPurpose,
          priority: inferPriority('backend', ctrl.name),
          endpoints: ctrl.endpoints
        });
      }
    });

    // 从实体推导数据需求
    analysis.backend.entities.forEach(entity => {
      if (entity.businessPurpose) {
        analysis.businessRequirements.push({
          type: 'data_model',
          source: entity.name,
          requirement: entity.businessPurpose,
          priority: inferPriority('data', entity.name),
          fields: entity.fields
        });
      }
    });

    // 推导技术需求
    analysis.technicalRequirements = extractTechnicalRequirements(analysis);
  }

  // 辅助函数
  function extractProps(content) {
    const propsMatch = content.match(/props:\s*{([^}]*)}/s);
    if (propsMatch) {
      return propsMatch[1].split(',').map(p => p.trim()).filter(p => p);
    }
    return [];
  }

  function extractFunctionality(content) {
    const methods = [];
    const methodMatches = content.match(/(\w+)\s*\([^)]*\)\s*{/g);
    if (methodMatches) {
      methods.push(...methodMatches.map(m => m.replace(/\s*\([^)]*\)\s*{/, '')));
    }
    return [...new Set(methods)];
  }

  function extractDependencies(content) {
    const imports = [];
    const importMatches = content.match(/import\s+.*from\s+['"]([^'"]+)['"]/g);
    if (importMatches) {
      imports.push(...importMatches.map(m => m.match(/from\s+['"]([^'"]+)['"]/)[1]));
    }
    return [...new Set(imports)];
  }

  function inferBusinessPurpose(name, category, content) {
    const nameLower = name.toLowerCase();
    const contentLower = content.toLowerCase();

    if (nameLower.includes('booking') || nameLower.includes('reserve')) {
      return '提供课程预约和预订功能';
    }
    if (nameLower.includes('payment')) {
      return '处理支付流程和支付状态管理';
    }
    if (nameLower.includes('membership')) {
      return '管理会员卡和会员权益';
    }
    if (nameLower.includes('course')) {
      return '展示和管理系统课程信息';
    }
    if (nameLower.includes('coach')) {
      return '管理教练信息和私教服务';
    }

    // 基于类别推断
    switch (category) {
      case 'booking': return '支持课程预约和时间安排';
      case 'payment': return '处理在线支付和订单管理';
      case 'membership': return '提供会员服务和权益管理';
      case 'courses': return '展示课程信息和详情';
      case 'discussion': return '支持课程讨论和社区互动';
      default: return `提供${category}相关的用户界面功能`;
    }
  }

  function extractExportedFunctions(content) {
    const exports = [];
    const exportMatches = content.match(/export\s+(?:const|function)\s+(\w+)/g);
    if (exportMatches) {
      exports.push(...exportMatches.map(m => m.match(/export\s+(?:const|function)\s+(\w+)/)[1]));
    }
    return exports;
  }

  function extractComposableFunctionality(content) {
    const functionality = [];
    if (content.includes('ref(') || content.includes('reactive(')) {
      functionality.push('状态管理');
    }
    if (content.includes('watch(') || content.includes('watchEffect(')) {
      functionality.push('响应式监听');
    }
    if (content.includes('axios') || content.includes('fetch')) {
      functionality.push('API调用');
    }
    if (content.includes('router')) {
      functionality.push('路由管理');
    }
    return functionality;
  }

  function inferComposablePurpose(name, content) {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('booking')) {
      return '处理课程预约业务逻辑';
    }
    if (nameLower.includes('payment')) {
      return '管理支付流程和状态';
    }
    if (nameLower.includes('notification')) {
      return '处理消息通知功能';
    }
    if (nameLower.includes('animation')) {
      return '提供动画效果支持';
    }
    if (nameLower.includes('auth')) {
      return '处理用户认证和授权';
    }

    return `提供${name}相关的组合式功能`;
  }

  function extractPageFunctionality(content) {
    const functionality = [];
    if (content.includes('<form') || content.includes('v-model')) {
      functionality.push('表单处理');
    }
    if (content.includes('axios') || content.includes('$http')) {
      functionality.push('数据加载');
    }
    if (content.includes('router') || content.includes('$router')) {
      functionality.push('页面导航');
    }
    if (content.includes('pagination') || content.includes('分页')) {
      functionality.push('数据分页');
    }
    return functionality;
  }

  function extractUsedComponents(content) {
    const components = [];
    const componentMatches = content.match(/<([A-Z]\w*)/g);
    if (componentMatches) {
      components.push(...componentMatches.map(m => m.substring(1)));
    }
    return [...new Set(components)];
  }

  function inferPagePurpose(module, page, content) {
    const moduleLower = module.toLowerCase();
    const pageLower = page.toLowerCase();

    if (pageLower === 'list') {
      return `展示${module}列表信息，支持查询和筛选`;
    }
    if (pageLower === 'detail') {
      return `显示${module}详细信息，支持查看和操作`;
    }
    if (pageLower === 'add') {
      return `提供${module}新增功能，支持数据录入`;
    }

    if (moduleLower.includes('course')) {
      return '提供课程相关的信息展示和管理功能';
    }
    if (moduleLower.includes('member')) {
      return '提供会员服务和权益管理功能';
    }
    if (moduleLower.includes('coach')) {
      return '提供教练信息和服务预约功能';
    }

    return `提供${module}模块的${page}页面功能`;
  }

  function extractEndpoints(content) {
    const endpoints = [];
    const endpointMatches = content.match(/@(Get|Post|Put|Delete)Mapping\([^)]+\)/g);
    if (endpointMatches) {
      endpointMatches.forEach(match => {
        const pathMatch = match.match(/value\s*=\s*["']([^"']+)["']/);
        if (pathMatch) {
          const method = match.match(/@(Get|Post|Put|Delete)/)[1];
          endpoints.push({
            method: method,
            path: pathMatch[1]
          });
        }
      });
    }
    return endpoints;
  }

  function extractControllerLogic(content) {
    const logic = [];
    if (content.includes('@Autowired')) {
      logic.push('依赖注入');
    }
    if (content.includes('Page<')) {
      logic.push('分页查询');
    }
    if (content.includes('save(') || content.includes('update(')) {
      logic.push('数据保存');
    }
    if (content.includes('delete(')) {
      logic.push('数据删除');
    }
    return logic;
  }

  function extractControllerDependencies(content) {
    const dependencies = [];
    const autowiredMatches = content.match(/@Autowired\s+[^;]+(\w+);/g);
    if (autowiredMatches) {
      dependencies.push(...autowiredMatches.map(m => m.match(/(\w+);/)[1]));
    }
    return dependencies;
  }

  function inferControllerPurpose(name, content) {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('user') || nameLower.includes('yonghu')) {
      return '提供用户管理相关的API接口，包括注册、登录、信息管理等';
    }
    if (nameLower.includes('course') || nameLower.includes('jianshenkecheng')) {
      return '提供健身课程相关的API接口，包括课程信息、预约管理等';
    }
    if (nameLower.includes('member') || nameLower.includes('huiyuan')) {
      return '提供会员服务相关的API接口，包括会员卡管理、续费等';
    }
    if (nameLower.includes('coach') || nameLower.includes('jianshenjiaolian')) {
      return '提供教练服务相关的API接口，包括教练信息、私教预约等';
    }
    if (nameLower.includes('news')) {
      return '提供新闻资讯相关的API接口，包括内容发布、展示等';
    }

    return `提供${name}模块的业务API接口`;
  }

  function extractServiceMethods(content) {
    const methods = [];
    const methodMatches = content.match(/public\s+\w+\s+(\w+)\s*\(/g);
    if (methodMatches) {
      methods.push(...methodMatches.map(m => m.match(/public\s+\w+\s+(\w+)\s*\(/)[1]));
    }
    return methods;
  }

  function extractServiceLogic(content) {
    const logic = [];
    if (content.includes('selectList') || content.includes('selectById')) {
      logic.push('数据查询');
    }
    if (content.includes('insert') || content.includes('save')) {
      logic.push('数据插入');
    }
    if (content.includes('update')) {
      logic.push('数据更新');
    }
    if (content.includes('delete')) {
      logic.push('数据删除');
    }
    if (content.includes('@Transactional')) {
      logic.push('事务管理');
    }
    return logic;
  }

  function inferServicePurpose(name, content) {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('user') || nameLower.includes('yonghu')) {
      return '处理用户相关的业务逻辑，包括用户注册、登录验证、信息管理等';
    }
    if (nameLower.includes('course') || nameLower.includes('jianshenkecheng')) {
      return '处理健身课程相关的业务逻辑，包括课程管理、预约处理等';
    }
    if (nameLower.includes('member') || nameLower.includes('huiyuan')) {
      return '处理会员服务相关的业务逻辑，包括会员卡管理、续费处理等';
    }

    return `处理${name.replace('Service', '').replace('Impl', '')}相关的业务逻辑`;
  }

  function extractEntityFields(content) {
    const fields = [];
    const fieldMatches = content.match(/private\s+\w+\s+(\w+)\s*;/g);
    if (fieldMatches) {
      fields.push(...fieldMatches.map(m => m.match(/private\s+\w+\s+(\w+)\s*;/)[1]));
    }
    return fields;
  }

  function extractEntityRelationships(content) {
    const relationships = [];
    if (content.includes('@TableField') || content.includes('@OneToMany') || content.includes('@ManyToOne')) {
      relationships.push('存在关联关系');
    }
    return relationships;
  }

  function inferEntityPurpose(name, content) {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('user') || nameLower.includes('yonghu')) {
      return '存储用户信息，包括基本信息、登录凭据、权限等';
    }
    if (nameLower.includes('course') || nameLower.includes('jianshenkecheng')) {
      return '存储课程信息，包括课程详情、时间安排、教练信息等';
    }
    if (nameLower.includes('member') || nameLower.includes('huiyuan')) {
      return '存储会员信息，包括会员卡类型、有效期、权益等';
    }
    if (nameLower.includes('coach') || nameLower.includes('jianshenjiaolian')) {
      return '存储教练信息，包括基本信息、专长、服务项目等';
    }
    if (nameLower.includes('news')) {
      return '存储新闻资讯内容，包括标题、内容、发布时间等';
    }

    return `存储${name}相关的数据信息`;
  }

  function extractTableFields(tableDDL) {
    const fields = [];
    const lines = tableDDL.split('\n');
    lines.forEach(line => {
      const fieldMatch = line.trim().match(/^`(\w+)`\s+(\w+)/);
      if (fieldMatch) {
        fields.push({
          name: fieldMatch[1],
          type: fieldMatch[2]
        });
      }
    });
    return fields;
  }

  function extractTableConstraints(tableDDL) {
    const constraints = [];
    if (tableDDL.includes('PRIMARY KEY')) {
      constraints.push('主键约束');
    }
    if (tableDDL.includes('FOREIGN KEY') || tableDDL.includes('REFERENCES')) {
      constraints.push('外键约束');
    }
    if (tableDDL.includes('UNIQUE')) {
      constraints.push('唯一约束');
    }
    if (tableDDL.includes('NOT NULL')) {
      constraints.push('非空约束');
    }
    return constraints;
  }

  function inferTablePurpose(tableName) {
    const nameLower = tableName.toLowerCase();

    if (nameLower.includes('user') || nameLower.includes('yonghu')) {
      return '存储系统用户信息';
    }
    if (nameLower.includes('course') || nameLower.includes('jianshenkecheng')) {
      return '存储健身课程信息';
    }
    if (nameLower.includes('member') || nameLower.includes('huiyuan')) {
      return '存储会员相关信息';
    }
    if (nameLower.includes('coach') || nameLower.includes('jianshenjiaolian')) {
      return '存储教练信息';
    }
    if (nameLower.includes('news')) {
      return '存储新闻资讯';
    }
    if (nameLower.includes('order') || nameLower.includes('yuyue')) {
      return '存储预约订单信息';
    }

    return `存储${tableName}相关的数据`;
  }

  function estimateTableSize(tableName) {
    const nameLower = tableName.toLowerCase();

    if (nameLower.includes('user') || nameLower.includes('yonghu')) {
      return '数千至数万条记录';
    }
    if (nameLower.includes('course') || nameLower.includes('jianshenkecheng')) {
      return '数百至数千条记录';
    }
    if (nameLower.includes('order') || nameLower.includes('yuyue')) {
      return '数万至数十万条记录';
    }
    if (nameLower.includes('news')) {
      return '数百至数千条记录';
    }

    return '中等规模数据表';
  }

  function inferPriority(category, name) {
    const nameLower = name.toLowerCase();

    // P0: 核心业务功能
    if (nameLower.includes('login') || nameLower.includes('auth') ||
        nameLower.includes('payment') || nameLower.includes('booking')) {
      return 'P0';
    }

    // P1: 重要业务功能
    if (nameLower.includes('user') || nameLower.includes('course') ||
        nameLower.includes('member') || nameLower.includes('coach')) {
      return 'P1';
    }

    // P2: 辅助功能
    return 'P2';
  }

  function extractTechnicalRequirements(analysis) {
    const techReqs = [];

    // 从前端组件推导技术需求
    const frontendTech = {
      type: 'frontend_technology',
      requirements: [
        'Vue 3 + TypeScript 前端框架',
        '响应式设计和移动端适配',
        '动画效果和用户体验优化',
        '状态管理和数据流处理',
        '组件化开发和代码复用'
      ]
    };
    techReqs.push(frontendTech);

    // 从后端分析推导技术需求
    const backendTech = {
      type: 'backend_technology',
      requirements: [
        'Spring Boot 后端框架',
        'RESTful API 设计',
        '数据持久化和 ORM',
        '事务管理和数据一致性',
        '安全认证和权限控制'
      ]
    };
    techReqs.push(backendTech);

    // 从数据库分析推导技术需求
    const databaseTech = {
      type: 'database_technology',
      requirements: [
        '关系型数据库设计',
        '数据完整性和约束',
        '性能优化和索引设计',
        '数据备份和恢复',
        '并发访问控制'
      ]
    };
    techReqs.push(databaseTech);

    return techReqs;
  }

  // 执行所有分析
  analyzeFrontendComponents();
  analyzeBackendRequirements();
  analyzeDatabaseRequirements();
  synthesizeRequirements();

  // 生成报告
  console.log('=== 代码逆向需求发掘报告 ===');
  console.log(`分析时间: ${analysis.analysisTime}`);
  console.log();

  console.log('前端功能清单:');
  console.log(`- 组件数量: ${analysis.frontend.components.length}`);
  console.log(`- 组合式函数: ${analysis.frontend.composables.length}`);
  console.log(`- 页面模块: ${analysis.frontend.pages.length}`);
  console.log();

  console.log('后端功能清单:');
  console.log(`- 控制器: ${analysis.backend.controllers.length}`);
  console.log(`- 服务类: ${analysis.backend.services.length}`);
  console.log(`- 实体类: ${analysis.backend.entities.length}`);
  console.log();

  console.log('数据库表结构:');
  console.log(`- 数据表: ${analysis.database.tables.length}`);
  console.log();

  console.log('业务需求识别:');
  console.log(`- 业务需求项: ${analysis.businessRequirements.length}`);
  console.log(`- 技术需求项: ${analysis.technicalRequirements.length}`);
  console.log();

  // 按优先级统计业务需求
  const priorityStats = { P0: 0, P1: 0, P2: 0 };
  analysis.businessRequirements.forEach(req => {
    if (priorityStats[req.priority] !== undefined) {
      priorityStats[req.priority]++;
    }
  });

  console.log('需求优先级分布:');
  console.log(`- P0 (核心): ${priorityStats.P0} 项`);
  console.log(`- P1 (重要): ${priorityStats.P1} 项`);
  console.log(`- P2 (辅助): ${priorityStats.P2} 项`);
  console.log();

  // 保存详细报告
  fs.writeFileSync('docs/reports/code-reverse-engineering-requirements.json', JSON.stringify(analysis, null, 2));
  console.log('详细报告已保存到: docs/reports/code-reverse-engineering-requirements.json');

  return analysis;
}

reverseEngineerRequirements();
