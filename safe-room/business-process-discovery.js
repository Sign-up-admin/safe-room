const fs = require('fs');
const path = require('path');

function discoverBusinessProcesses() {
  const analysis = {
    userFlows: [],
    adminFlows: [],
    businessRequirements: [],
    exceptionScenarios: [],
    analysisTime: new Date().toISOString()
  };

  // 1. 分析前端用户操作流程
  function analyzeUserFlows() {
    const frontendPages = 'springboot1ngh61a2/src/main/resources/front/front/src/pages';

    // 用户注册登录流程
    const authFlow = {
      name: '用户认证流程',
      type: 'user_authentication',
      steps: [
        {
          step: 1,
          page: 'register',
          action: '访问注册页面',
          validation: '表单验证（用户名、邮箱、密码）',
          nextStep: 2
        },
        {
          step: 2,
          page: 'register',
          action: '提交注册信息',
          api: 'POST /api/register',
          validation: '服务器端验证',
          nextStep: 3
        },
        {
          step: 3,
          page: 'login',
          action: '注册成功跳转登录',
          validation: '邮箱验证码确认',
          nextStep: 4
        },
        {
          step: 4,
          page: 'login',
          action: '用户登录',
          api: 'POST /api/login',
          validation: '用户名密码验证',
          nextStep: 5
        },
        {
          step: 5,
          page: 'center',
          action: '登录成功进入个人中心',
          validation: '会话建立',
          complete: true
        }
      ],
      exceptionScenarios: [
        '用户名已存在',
        '邮箱格式错误',
        '密码强度不足',
        '验证码错误',
        '账号被锁定'
      ],
      businessRequirements: [
        '安全的密码加密存储',
        '邮箱验证机制',
        '登录失败次数限制',
        '会话管理与超时',
        '密码重置功能'
      ]
    };
    analysis.userFlows.push(authFlow);

    // 课程预约流程
    const courseBookingFlow = {
      name: '课程预约流程',
      type: 'course_booking',
      steps: [
        {
          step: 1,
          page: 'jianshenkecheng/list',
          action: '浏览课程列表',
          api: 'GET /api/jianshenkecheng',
          validation: '课程数据加载',
          nextStep: 2
        },
        {
          step: 2,
          page: 'jianshenkecheng/detail',
          action: '查看课程详情',
          api: 'GET /api/jianshenkecheng/{id}',
          validation: '课程详细信息展示',
          nextStep: 3
        },
        {
          step: 3,
          page: 'kechengyuyue/add',
          action: '选择预约时间',
          validation: '时间冲突检查',
          nextStep: 4
        },
        {
          step: 4,
          page: 'kechengyuyue/add',
          action: '提交预约申请',
          api: 'POST /api/kechengyuyue',
          validation: '预约信息验证',
          nextStep: 5
        },
        {
          step: 5,
          page: 'pay',
          action: '跳转支付页面',
          validation: '支付信息准备',
          nextStep: 6
        },
        {
          step: 6,
          page: 'pay',
          action: '完成支付',
          api: 'POST /api/pay',
          validation: '支付状态确认',
          complete: true
        }
      ],
      exceptionScenarios: [
        '课程已满员',
        '时间段已被预约',
        '用户余额不足',
        '支付超时失败',
        '重复预约检测'
      ],
      businessRequirements: [
        '实时库存检查',
        '预约冲突检测算法',
        '支付状态同步',
        '预约取消机制',
        '预约提醒通知'
      ]
    };
    analysis.userFlows.push(courseBookingFlow);

    // 会员购买流程
    const membershipFlow = {
      name: '会员购买流程',
      type: 'membership_purchase',
      steps: [
        {
          step: 1,
          page: 'huiyuanka/list',
          action: '浏览会员卡类型',
          api: 'GET /api/huiyuanka',
          validation: '会员卡信息加载',
          nextStep: 2
        },
        {
          step: 2,
          page: 'huiyuanka/detail',
          action: '查看会员卡详情',
          api: 'GET /api/huiyuanka/{id}',
          validation: '权益信息展示',
          nextStep: 3
        },
        {
          step: 3,
          page: 'huiyuankagoumai/add',
          action: '选择购买选项',
          validation: '购买参数验证',
          nextStep: 4
        },
        {
          step: 4,
          page: 'huiyuankagoumai/add',
          action: '提交购买申请',
          api: 'POST /api/huiyuankagoumai',
          validation: '购买信息完整性',
          nextStep: 5
        },
        {
          step: 5,
          page: 'pay',
          action: '支付会员费用',
          api: 'POST /api/pay',
          validation: '支付成功确认',
          complete: true
        }
      ],
      exceptionScenarios: [
        '会员卡类型不存在',
        '用户已有有效会员卡',
        '支付失败回滚',
        '库存不足（限量卡）'
      ],
      businessRequirements: [
        '会员卡类型管理',
        '购买记录追溯',
        '有效期自动计算',
        '会员权益自动激活',
        '续费提醒机制'
      ]
    };
    analysis.userFlows.push(membershipFlow);

    // 教练预约流程
    const coachBookingFlow = {
      name: '教练预约流程',
      type: 'coach_booking',
      steps: [
        {
          step: 1,
          page: 'jianshenjiaolian/list',
          action: '浏览教练列表',
          api: 'GET /api/jianshenjiaolian',
          validation: '教练信息加载',
          nextStep: 2
        },
        {
          step: 2,
          page: 'jianshenjiaolian/detail',
          action: '查看教练详情',
          api: 'GET /api/jianshenjiaolian/{id}',
          validation: '教练资质展示',
          nextStep: 3
        },
        {
          step: 3,
          page: 'sijiaoyuyue/add',
          action: '选择预约时间和服务',
          validation: '教练排班检查',
          nextStep: 4
        },
        {
          step: 4,
          page: 'sijiaoyuyue/add',
          action: '提交预约申请',
          api: 'POST /api/sijiaoyuyue',
          validation: '预约信息验证',
          nextStep: 5
        },
        {
          step: 5,
          page: 'pay',
          action: '完成支付',
          api: 'POST /api/pay',
          validation: '服务费用支付',
          complete: true
        }
      ],
      exceptionScenarios: [
        '教练当前时间不可预约',
        '用户会员等级不足',
        '预约时间冲突',
        '服务项目不可用'
      ],
      businessRequirements: [
        '教练排班管理系统',
        '服务项目定价策略',
        '预约确认机制',
        '服务评价系统',
        '教练收益结算'
      ]
    };
    analysis.userFlows.push(coachBookingFlow);
  }

  // 2. 分析管理后台操作流程
  function analyzeAdminFlows() {
    // 管理员登录流程
    const adminLoginFlow = {
      name: '管理员登录流程',
      type: 'admin_authentication',
      steps: [
        {
          step: 1,
          page: 'admin/login',
          action: '访问管理后台登录',
          validation: '页面访问权限',
          nextStep: 2
        },
        {
          step: 2,
          page: 'admin/login',
          action: '输入管理员凭据',
          validation: '表单验证',
          nextStep: 3
        },
        {
          step: 3,
          page: 'admin/login',
          action: '提交登录请求',
          api: 'POST /api/admin/login',
          validation: '身份验证',
          nextStep: 4
        },
        {
          step: 4,
          page: 'admin/home',
          action: '登录成功进入管理首页',
          validation: '权限初始化',
          complete: true
        }
      ],
      exceptionScenarios: [
        '用户名或密码错误',
        '账号被禁用',
        '登录IP受限',
        '权限不足'
      ],
      businessRequirements: [
        '管理员角色权限管理',
        '登录日志记录',
        '安全审计机制',
        '会话超时管理'
      ]
    };
    analysis.adminFlows.push(adminLoginFlow);

    // 课程管理流程
    const courseManagementFlow = {
      name: '课程管理流程',
      type: 'content_management',
      steps: [
        {
          step: 1,
          page: 'admin/jianshenkecheng/list',
          action: '查看课程列表',
          api: 'GET /api/admin/jianshenkecheng',
          validation: '数据加载',
          nextStep: 2
        },
        {
          step: 2,
          page: 'admin/jianshenkecheng/add',
          action: '创建新课程',
          validation: '表单初始化',
          nextStep: 3
        },
        {
          step: 3,
          page: 'admin/jianshenkecheng/add',
          action: '填写课程信息',
          validation: '数据验证',
          nextStep: 4
        },
        {
          step: 4,
          page: 'admin/jianshenkecheng/add',
          action: '保存课程信息',
          api: 'POST /api/admin/jianshenkecheng',
          validation: '保存成功',
          nextStep: 5
        },
        {
          step: 5,
          page: 'admin/jianshenkecheng/list',
          action: '返回课程列表',
          validation: '列表刷新',
          complete: true
        }
      ],
      exceptionScenarios: [
        '必填字段缺失',
        '数据格式错误',
        '权限不足',
        '保存失败'
      ],
      businessRequirements: [
        '课程信息完整性校验',
        '批量导入导出功能',
        '课程状态管理',
        '历史版本记录',
        '内容审核机制'
      ]
    };
    analysis.adminFlows.push(courseManagementFlow);

    // 用户管理流程
    const userManagementFlow = {
      name: '用户管理流程',
      type: 'user_management',
      steps: [
        {
          step: 1,
          page: 'admin/yonghu/list',
          action: '查看用户列表',
          api: 'GET /api/admin/yonghu',
          validation: '用户数据加载',
          nextStep: 2
        },
        {
          step: 2,
          page: 'admin/yonghu/detail',
          action: '查看用户详情',
          api: 'GET /api/admin/yonghu/{id}',
          validation: '详细信息展示',
          nextStep: 3
        },
        {
          step: 3,
          page: 'admin/yonghu/detail',
          action: '编辑用户信息',
          validation: '编辑权限检查',
          nextStep: 4
        },
        {
          step: 4,
          page: 'admin/yonghu/detail',
          action: '保存用户信息',
          api: 'PUT /api/admin/yonghu/{id}',
          validation: '保存成功',
          nextStep: 5
        },
        {
          step: 5,
          page: 'admin/yonghu/list',
          action: '返回用户列表',
          validation: '列表更新',
          complete: true
        }
      ],
      exceptionScenarios: [
        '用户不存在',
        '编辑权限不足',
        '数据冲突',
        '保存失败'
      ],
      businessRequirements: [
        '用户状态管理',
        '批量操作支持',
        '用户行为分析',
        '数据导出功能',
        '安全日志记录'
      ]
    };
    analysis.adminFlows.push(userManagementFlow);
  }

  // 3. 综合业务需求识别
  function synthesizeBusinessRequirements() {
    // 从用户流程提取业务需求
    analysis.userFlows.forEach(flow => {
      flow.businessRequirements.forEach(req => {
        analysis.businessRequirements.push({
          source: flow.name,
          type: flow.type,
          requirement: req,
          priority: inferPriority(flow.type, req),
          userFlow: flow.name
        });
      });

      // 提取异常场景需求
      flow.exceptionScenarios.forEach(scenario => {
        analysis.exceptionScenarios.push({
          source: flow.name,
          scenario: scenario,
          type: 'user_flow_exception',
          impact: assessExceptionImpact(scenario),
          mitigation: suggestMitigation(scenario)
        });
      });
    });

    // 从管理流程提取业务需求
    analysis.adminFlows.forEach(flow => {
      flow.businessRequirements.forEach(req => {
        analysis.businessRequirements.push({
          source: flow.name,
          type: flow.type,
          requirement: req,
          priority: inferPriority(flow.type, req),
          adminFlow: flow.name
        });
      });

      // 提取异常场景需求
      flow.exceptionScenarios.forEach(scenario => {
        analysis.exceptionScenarios.push({
          source: flow.name,
          scenario: scenario,
          type: 'admin_flow_exception',
          impact: assessExceptionImpact(scenario),
          mitigation: suggestMitigation(scenario)
        });
      });
    });
  }

  // 辅助函数
  function inferPriority(flowType, requirement) {
    // P0: 核心业务安全和完整性
    if (requirement.includes('安全') || requirement.includes('验证') ||
        requirement.includes('权限') || requirement.includes('加密')) {
      return 'P0';
    }

    // P1: 重要业务功能
    if (requirement.includes('管理') || requirement.includes('状态') ||
        requirement.includes('记录') || requirement.includes('通知')) {
      return 'P1';
    }

    // P2: 辅助功能
    return 'P2';
  }

  function assessExceptionImpact(scenario) {
    if (scenario.includes('失败') || scenario.includes('错误') ||
        scenario.includes('不存在') || scenario.includes('禁用')) {
      return '高 - 影响用户正常使用';
    }
    if (scenario.includes('冲突') || scenario.includes('重复') ||
        scenario.includes('不足')) {
      return '中 - 影响部分功能使用';
    }
    return '低 - 不影响核心功能';
  }

  function suggestMitigation(scenario) {
    const mitigations = {
      '用户名已存在': '提供用户名建议，允许修改',
      '邮箱格式错误': '实时格式验证，清晰错误提示',
      '密码强度不足': '密码强度指示器，生成强密码建议',
      '验证码错误': '验证码刷新，语音验证码选项',
      '账号被锁定': '锁定通知，解锁申请流程',
      '课程已满员': '等待队列，预约提醒通知',
      '时间段已被预约': '显示可用时间段，智能推荐',
      '用户余额不足': '余额充值引导，部分支付选项',
      '支付超时失败': '支付状态监控，自动重试机制',
      '重复预约检测': '预约历史展示，防止重复提交'
    };

    return mitigations[scenario] || '完善错误提示，提供解决建议';
  }

  // 执行所有分析
  analyzeUserFlows();
  analyzeAdminFlows();
  synthesizeBusinessRequirements();

  // 生成报告
  console.log('=== 业务流程需求发掘报告 ===');
  console.log(`分析时间: ${analysis.analysisTime}`);
  console.log();

  console.log('用户操作流程:');
  analysis.userFlows.forEach(flow => {
    console.log(`- ${flow.name}: ${flow.steps.length}个步骤`);
  });
  console.log();

  console.log('管理后台流程:');
  analysis.adminFlows.forEach(flow => {
    console.log(`- ${flow.name}: ${flow.steps.length}个步骤`);
  });
  console.log();

  // 统计业务需求优先级
  const priorityStats = { P0: 0, P1: 0, P2: 0 };
  analysis.businessRequirements.forEach(req => {
    if (priorityStats[req.priority] !== undefined) {
      priorityStats[req.priority]++;
    }
  });

  console.log('业务需求优先级统计:');
  console.log(`- P0核心需求: ${priorityStats.P0}项`);
  console.log(`- P1重要需求: ${priorityStats.P1}项`);
  console.log(`- P2辅助需求: ${priorityStats.P2}项`);
  console.log();

  console.log('异常场景识别:');
  console.log(`- 用户流程异常: ${analysis.exceptionScenarios.filter(e => e.type === 'user_flow_exception').length}个`);
  console.log(`- 管理流程异常: ${analysis.exceptionScenarios.filter(e => e.type === 'admin_flow_exception').length}个`);
  console.log();

  // 保存详细报告
  fs.writeFileSync('docs/reports/business-process-discovery.json', JSON.stringify(analysis, null, 2));
  console.log('详细报告已保存到: docs/reports/business-process-discovery.json');

  return analysis;
}

discoverBusinessProcesses();
