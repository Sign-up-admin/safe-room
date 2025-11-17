<template>
  <div class="api-docs-page">
    <TechCard class="docs-card" :interactive="false">
      <template #header>
        <div class="docs-header">
          <h1>API 接口文档</h1>
          <p class="docs-subtitle">对外 API 服务的帮助与指导</p>
        </div>
      </template>

      <div class="docs-content">
        <section>
          <h2>1. 概述</h2>
          <p>
            本文档提供了智能健身房管理系统对外 API 接口的详细说明，包括接口地址、请求参数、响应格式等信息。开发者可以使用这些 API 集成到自己的应用中。
          </p>
        </section>

        <section>
          <h2>2. 基础信息</h2>
          <h3>2.1 Base URL</h3>
          <div class="code-block">
            <code>http://&lt;host&gt;:8080/springboot1ngh61a2</code>
          </div>

          <h3>2.2 请求格式</h3>
          <ul>
            <li><strong>Content-Type:</strong> application/json;charset=UTF-8</li>
            <li><strong>请求方法:</strong> GET、POST、PUT、DELETE</li>
            <li><strong>字符编码:</strong> UTF-8</li>
          </ul>

          <h3>2.3 响应格式</h3>
          <p>所有接口统一返回 JSON 格式：</p>
          <div class="code-block">
            <pre>{
  "code": 0,
  "msg": "success",
  "data": {
    // 具体数据
  }
}</pre>
          </div>
        </section>

        <section>
          <h2>3. 认证机制</h2>
          <h3>3.1 Token 认证</h3>
          <p>除登录、注册等公开接口外，其他接口需要在请求头中携带 Token：</p>
          <div class="code-block">
            <pre>Headers:
  Token: &lt;your-token&gt;</pre>
          </div>

          <h3>3.2 获取 Token</h3>
          <p>通过登录接口获取 Token：</p>
          <div class="code-block">
            <pre>POST /users/login
Content-Type: application/x-www-form-urlencoded

username=admin&password=admin

Response:
{
  "code": 0,
  "msg": "登录成功",
  "token": "a1b2c3d4e5f6",
  "role": "users"
}</pre>
          </div>
        </section>

        <section>
          <h2>4. 错误码说明</h2>
          <table class="api-table">
            <thead>
              <tr>
                <th>错误码</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0</td>
                <td>成功</td>
              </tr>
              <tr>
                <td>401</td>
                <td>Token 缺失或失效</td>
              </tr>
              <tr>
                <td>403</td>
                <td>权限不足或账号被锁定</td>
              </tr>
              <tr>
                <td>404</td>
                <td>资源不存在</td>
              </tr>
              <tr>
                <td>500</td>
                <td>服务器内部错误</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>5. 通用接口</h2>
          <h3>5.1 分页查询</h3>
          <p>大多数列表接口支持分页查询：</p>
          <div class="code-block">
            <pre>GET /{module}/list?page=1&limit=10&sort=addtime&order=desc

Query Parameters:
  page: 页码（从1开始，默认1）
  limit: 每页条数（默认10）
  sort: 排序字段
  order: 排序方式（asc/desc）</pre>
          </div>

          <h3>5.2 响应格式（分页）</h3>
          <div class="code-block">
            <pre>{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}</pre>
          </div>
        </section>

        <section>
          <h2>6. 核心接口</h2>
          <h3>6.1 用户相关</h3>
          <table class="api-table">
            <thead>
              <tr>
                <th>接口</th>
                <th>方法</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>/users/login</td>
                <td>POST</td>
                <td>用户登录</td>
              </tr>
              <tr>
                <td>/users/register</td>
                <td>POST</td>
                <td>用户注册</td>
              </tr>
              <tr>
                <td>/users/session</td>
                <td>GET</td>
                <td>获取当前用户信息</td>
              </tr>
              <tr>
                <td>/yonghu/page</td>
                <td>GET</td>
                <td>会员列表（分页）</td>
              </tr>
              <tr>
                <td>/yonghu/detail/{id}</td>
                <td>GET</td>
                <td>会员详情</td>
              </tr>
            </tbody>
          </table>

          <h3>6.2 课程相关</h3>
          <table class="api-table">
            <thead>
              <tr>
                <th>接口</th>
                <th>方法</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>/jianshenkecheng/list</td>
                <td>GET</td>
                <td>课程列表</td>
              </tr>
              <tr>
                <td>/jianshenkecheng/detail/{id}</td>
                <td>GET</td>
                <td>课程详情</td>
              </tr>
              <tr>
                <td>/kechengyuyue/add</td>
                <td>POST</td>
                <td>预约课程</td>
              </tr>
              <tr>
                <td>/kechengyuyue/list</td>
                <td>GET</td>
                <td>我的预约</td>
              </tr>
            </tbody>
          </table>

          <h3>6.3 教练相关</h3>
          <table class="api-table">
            <thead>
              <tr>
                <th>接口</th>
                <th>方法</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>/jianshenjiaolian/list</td>
                <td>GET</td>
                <td>教练列表</td>
              </tr>
              <tr>
                <td>/jianshenjiaolian/detail/{id}</td>
                <td>GET</td>
                <td>教练详情</td>
              </tr>
              <tr>
                <td>/sijiaoyuyue/add</td>
                <td>POST</td>
                <td>预约私教</td>
              </tr>
            </tbody>
          </table>

          <h3>6.4 会员卡相关</h3>
          <table class="api-table">
            <thead>
              <tr>
                <th>接口</th>
                <th>方法</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>/huiyuanka/list</td>
                <td>GET</td>
                <td>会员卡列表</td>
              </tr>
              <tr>
                <td>/huiyuankagoumai/add</td>
                <td>POST</td>
                <td>购买会员卡</td>
              </tr>
              <tr>
                <td>/huiyuankagoumai/list</td>
                <td>GET</td>
                <td>购买记录</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>7. 请求示例</h2>
          <h3>7.1 获取课程列表</h3>
          <div class="code-block">
            <pre>curl -X GET \
  "http://localhost:8080/springboot1ngh61a2/jianshenkecheng/list?page=1&limit=10" \
  -H "Token: your-token-here"</pre>
          </div>

          <h3>7.2 预约课程</h3>
          <div class="code-block">
            <pre>curl -X POST \
  "http://localhost:8080/springboot1ngh61a2/kechengyuyue/add" \
  -H "Content-Type: application/json" \
  -H "Token: your-token-here" \
  -d '{
    "kechengid": 1,
    "yuyueshijian": "2025-11-20 10:00:00",
    "beizhu": "预约备注"
  }'</pre>
          </div>
        </section>

        <section>
          <h2>8. 注意事项</h2>
          <ul>
            <li>所有时间字段使用格式：yyyy-MM-dd HH:mm:ss</li>
            <li>请求频率限制：建议每秒不超过 10 次请求</li>
            <li>Token 有效期：默认 24 小时，过期后需要重新登录</li>
            <li>文件上传接口使用 multipart/form-data 格式</li>
            <li>建议使用 HTTPS 协议确保数据传输安全</li>
            <li>生产环境请妥善保管 API Token，避免泄露</li>
          </ul>
        </section>

        <section>
          <h2>9. SDK 与工具</h2>
          <p>我们提供了以下开发工具和示例代码：</p>
          <ul>
            <li>JavaScript/TypeScript SDK（开发中）</li>
            <li>Python SDK（开发中）</li>
            <li>Postman 接口集合（开发中）</li>
            <li>OpenAPI 规范文档（开发中）</li>
          </ul>
        </section>

        <section>
          <h2>10. 技术支持</h2>
          <p>如果您在使用 API 过程中遇到问题，可以通过以下方式获取帮助：</p>
          <ul>
            <li>查看完整 API 文档：<a href="/docs/API.md" target="_blank">docs/API.md</a></li>
            <li>提交 Issue：GitHub Issues</li>
            <li>联系技术支持：support@example.com</li>
            <li>技术交流群：QQ群 XXXXXX</li>
          </ul>
        </section>
      </div>

      <template #footer>
        <div class="docs-footer">
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

.api-docs-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 20px 80px;
}

.docs-card {
  padding: 48px;
}

.docs-header {
  margin-bottom: 32px;
  text-align: center;

  h1 {
    margin: 0 0 8px;
    font-size: 2.5rem;
    font-weight: 700;
  }
}

.docs-subtitle {
  margin: 0;
  color: $color-text-secondary;
  font-size: 1.1rem;
}

.docs-content {
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

        a {
          color: $color-yellow;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}

.code-block {
  margin: 16px 0;
  padding: 16px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow-x: auto;

  code,
  pre {
    margin: 0;
    color: $color-yellow;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

.api-table {
  width: 100%;
  margin: 16px 0;
  border-collapse: collapse;
  border: 1px solid rgba(255, 255, 255, 0.1);

  thead {
    background: rgba(253, 216, 53, 0.1);

    th {
      padding: 12px;
      text-align: left;
      color: $color-text-primary;
      font-weight: 600;
      border-bottom: 2px solid rgba(253, 216, 53, 0.3);
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);

      &:hover {
        background: rgba(255, 255, 255, 0.02);
      }

      td {
        padding: 12px;
        color: $color-text-secondary;

        &:first-child {
          color: $color-yellow;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }
      }
    }
  }
}

.docs-footer {
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
  .docs-card {
    padding: 24px;
  }

  .docs-header h1 {
    font-size: 2rem;
  }

  .api-table {
    font-size: 0.9rem;

    th,
    td {
      padding: 8px;
    }
  }

  .docs-footer {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>

