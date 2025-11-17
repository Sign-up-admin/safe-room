# 前端自动化测试

本目录包含了Front项目的完整自动化测试套件，包括单元测试、组件测试和集成测试。

## 📁 目录结构

```
tests/
├── e2e/                    # 端到端测试
├── fixtures/              # 测试数据和模拟数据
├── setup/                 # 测试环境配置
│   └── test-setup.ts      # 全局测试设置
├── unit/                  # 单元测试
│   ├── composables/       # 组合式API测试
│   ├── components/        # 组件测试
│   ├── pages/            # 页面测试
│   ├── services/         # 服务层测试
│   ├── stores/           # 状态管理测试
│   └── utils/            # 工具函数测试
├── run-new-tests.js      # 新功能测试运行脚本
└── README.md             # 测试文档
```

## 🆕 新功能测试

本次更新新增了对以下功能的自动化测试：

### 1. 课程预约智能推荐算法 (`useBookingRecommend`)
- ✅ 预约模式分析
- ✅ 时间推荐算法
- ✅ 冲突检测
- ✅ 成功率预测

### 2. 收藏管理状态存储 (`useFavoritesStore`)
- ✅ 收藏数据管理
- ✅ 批量操作
- ✅ 筛选和搜索
- ✅ 统计信息计算

### 3. 讨论发帖组件 (`DiscussionComposer`)
- ✅ 快速发帖和高级发帖
- ✅ 草稿管理
- ✅ 文本格式化
- ✅ 文件上传

### 4. 收藏概览组件 (`FavoritesOverview`)
- ✅ 数据可视化
- ✅ 图表渲染
- ✅ 响应式设计
- ✅ 无障碍访问

### 5. 工具函数增强 (`formatters`)
- ✅ 日期格式化
- ✅ 边界情况处理
- ✅ 时区处理

## 🚀 运行测试

### 运行所有新功能测试
```bash
npm run test:new-features
```

### 监听模式运行新功能测试
```bash
npm run test:new-features:watch
```

### 运行所有单元测试
```bash
npm run test:unit
```

### 运行测试覆盖率
```bash
npm run test:coverage
```

### 可视化测试界面
```bash
npm run test:unit:ui
```

### 端到端测试
```bash
npm run test:e2e
```

## 📊 测试覆盖率

当前测试覆盖率目标：
- **语句覆盖率**: ≥ 30%
- **函数覆盖率**: ≥ 30%
- **分支覆盖率**: ≥ 25%
- **行覆盖率**: ≥ 30%

## 🛠️ 测试工具

- **测试框架**: [Vitest](https://vitest.dev/)
- **组件测试**: [@vue/test-utils](https://test-utils.vuejs.org/)
- **断言库**: [Vitest内置](https://vitest.dev/api/)
- **DOM模拟**: [happy-dom](https://github.com/capricorn86/happy-dom)
- **端到端测试**: [Playwright](https://playwright.dev/)

## 📝 编写测试

### 组合式API测试示例

```typescript
import { describe, it, expect, vi } from 'vitest'
import { useYourComposable } from '@/composables/yourComposable'

describe('useYourComposable', () => {
  it('should return expected result', () => {
    const { result } = useYourComposable()
    expect(result.value).toBe(expectedValue)
  })
})
```

### 组件测试示例

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import YourComponent from '@/components/YourComponent.vue'

describe('YourComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(YourComponent, {
      props: { /* props */ }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

## 🔧 测试配置

### 全局设置 (`test-setup.ts`)
- DOM API 模拟
- 浏览器 API 模拟
- HTTP 请求模拟
- 路由和存储模拟

### Vitest配置 (`vitest.config.ts`)
- Vue 组件支持
- 路径别名配置
- 覆盖率配置
- 排除文件配置

## 📈 持续集成

测试在以下情况下自动运行：
- Git 提交前 (pre-commit hook)
- 代码推送时 (CI/CD pipeline)
- 依赖更新时

## 🤝 贡献指南

1. 为新功能编写测试
2. 确保测试覆盖率不下降
3. 遵循现有的测试命名约定
4. 添加必要的测试数据和模拟

## 📞 问题排查

### 常见问题

1. **测试运行失败**
   - 检查依赖是否正确安装
   - 确认环境变量配置正确

2. **组件测试失败**
   - 检查组件依赖是否正确模拟
   - 确认props和事件传递正确

3. **覆盖率不足**
   - 为未测试的代码路径添加测试
   - 检查条件分支覆盖

## 📚 参考资料

- [Vitest 官方文档](https://vitest.dev/)
- [Vue Test Utils 文档](https://test-utils.vuejs.org/)
- [Playwright 文档](https://playwright.dev/)
- [测试驱动开发最佳实践](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
