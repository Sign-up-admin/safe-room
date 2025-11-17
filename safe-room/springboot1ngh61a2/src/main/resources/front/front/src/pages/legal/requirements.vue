<template>
  <div class="legal-page">
    <TechCard class="legal-card" :interactive="false">
      <template #header>
        <div class="legal-header">
          <h1>工程需求文档</h1>
          <p class="legal-subtitle">项目开发规范与需求说明</p>
        </div>
      </template>

      <div class="legal-content">
        <section>
          <h2>1. 项目概述</h2>
          <p>本项目是一个智能健身房管理系统，旨在为用户提供便捷的健身服务预约、课程管理、会员卡购买等功能。</p>
        </section>

        <section>
          <h2>2. 技术栈</h2>
          <ul>
            <li><strong>前端：</strong>Vue 3 + TypeScript + Vite + Element Plus</li>
            <li><strong>后端：</strong>Spring Boot + MyBatis-Plus</li>
            <li><strong>数据库：</strong>MySQL</li>
            <li><strong>构建工具：</strong>Maven</li>
          </ul>
        </section>

        <section>
          <h2>3. 功能模块</h2>
          <h3>3.1 用户端功能</h3>
          <ul>
            <li>用户注册与登录</li>
            <li>课程浏览与预约</li>
            <li>教练信息查看与私教预约</li>
            <li>会员卡购买与管理</li>
            <li>个人中心与收藏管理</li>
            <li>公告资讯浏览</li>
          </ul>

          <h3>3.2 管理端功能</h3>
          <ul>
            <li>用户管理</li>
            <li>课程管理</li>
            <li>教练管理</li>
            <li>预约管理</li>
            <li>会员卡管理</li>
            <li>公告管理</li>
            <li>系统配置</li>
          </ul>
        </section>

        <section>
          <h2>4. 开发规范</h2>
          <h3>4.1 代码规范</h3>
          <ul>
            <li>使用 TypeScript 进行类型检查</li>
            <li>遵循 ESLint 代码规范</li>
            <li>组件使用 Composition API</li>
            <li>统一使用 TechCard、TechButton 等设计系统组件</li>
          </ul>

          <h3>4.2 命名规范</h3>
          <ul>
            <li>组件使用 PascalCase</li>
            <li>变量和函数使用 camelCase</li>
            <li>常量使用 UPPER_SNAKE_CASE</li>
            <li>文件使用 kebab-case</li>
          </ul>

          <h3>4.3 Git 提交规范</h3>
          <ul>
            <li>feat: 新功能</li>
            <li>fix: 修复bug</li>
            <li>docs: 文档更新</li>
            <li>style: 代码格式调整</li>
            <li>refactor: 代码重构</li>
            <li>test: 测试相关</li>
            <li>chore: 构建/工具相关</li>
          </ul>
        </section>

        <section>
          <h2>5. API 接口规范</h2>
          <ul>
            <li>统一使用 RESTful API 设计</li>
            <li>请求头需携带 Token 进行身份验证</li>
            <li>统一响应格式：{ code, msg, data }</li>
            <li>错误码：0-成功，401-未授权，403-权限不足，500-服务器错误</li>
          </ul>
        </section>

        <section>
          <h2>6. 安全要求</h2>
          <ul>
            <li>密码加密存储</li>
            <li>Token 认证机制</li>
            <li>XSS 防护</li>
            <li>CSRF 防护</li>
            <li>SQL 注入防护</li>
            <li>敏感数据加密传输</li>
          </ul>
        </section>

        <section>
          <h2>7. 性能要求</h2>
          <ul>
            <li>页面首屏加载时间 &lt; 3秒</li>
            <li>API 响应时间 &lt; 500ms</li>
            <li>支持路由懒加载</li>
            <li>图片资源优化（WebP格式）</li>
            <li>代码分割与按需加载</li>
          </ul>
        </section>

        <section>
          <h2>8. 测试要求</h2>
          <ul>
            <li>单元测试覆盖率 ≥ 70%</li>
            <li>关键功能需进行 E2E 测试</li>
            <li>接口测试覆盖所有 API</li>
            <li>兼容性测试（Chrome、Firefox、Safari、Edge）</li>
          </ul>
        </section>

        <section>
          <h2>9. 部署要求</h2>
          <ul>
            <li>支持 Docker 容器化部署</li>
            <li>支持前后端分离部署</li>
            <li>配置环境变量管理</li>
            <li>日志记录与监控</li>
          </ul>
        </section>

        <section>
          <h2>10. 文档要求</h2>
          <ul>
            <li>API 接口文档（docs/API.md）</li>
            <li>架构设计文档（docs/ARCHITECTURE.md）</li>
            <li>数据库设计文档（docs/DATABASE.md）</li>
            <li>部署文档（docs/DEPLOYMENT.md）</li>
            <li>开发指南（docs/DEVELOPMENT.md）</li>
          </ul>
        </section>
      </div>

      <template #footer>
        <div class="legal-footer">
          <p>最后更新：{{ currentDate }}</p>
          <TechButton size="sm" variant="outline" @click="goBack">返回首页</TechButton>
        </div>
      </template>
    </TechCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { TechCard, TechButton } from '@/components/common'

const router = useRouter()
const currentDate = computed(() => new Date().toLocaleDateString('zh-CN'))

function goBack() {
  router.push('/index/home')
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.legal-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 48px 20px 80px;
}

.legal-card {
  padding: 48px;
}

.legal-header {
  margin-bottom: 32px;
  text-align: center;

  h1 {
    margin: 0 0 8px;
    font-size: 2.5rem;
    font-weight: 700;
  }
}

.legal-subtitle {
  margin: 0;
  color: $color-text-secondary;
  font-size: 1.1rem;
}

.legal-content {
  line-height: 1.8;
  color: $color-text-secondary;

  section {
    margin-bottom: 32px;

    h2 {
      margin: 0 0 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid rgba(253, 216, 53, 0.3);
      color: $color-text-primary;
      font-size: 1.5rem;
    }

    h3 {
      margin: 24px 0 12px;
      color: $color-text-primary;
      font-size: 1.2rem;
    }

    p {
      margin: 0 0 16px;
    }

    ul {
      margin: 0 0 16px;
      padding-left: 24px;

      li {
        margin-bottom: 8px;

        strong {
          color: $color-text-primary;
        }
      }
    }
  }
}

.legal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  p {
    margin: 0;
    color: $color-text-secondary;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .legal-card {
    padding: 24px;
  }

  .legal-header h1 {
    font-size: 2rem;
  }

  .legal-footer {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
