<template>
  <div class="legal-page">
    <TechCard class="legal-card" :interactive="false">
      <template #header>
        <div class="legal-header">
          <h1>免责声明</h1>
          <p class="legal-subtitle">请仔细阅读以下免责声明</p>
        </div>
      </template>

      <div class="legal-content">
        <section>
          <h2>1. 一般性免责</h2>
          <p>
            智能健身房管理系统（以下简称"本平台"）提供的所有信息、内容和服务仅供用户参考使用。本平台不对信息的准确性、完整性、及时性或适用性作任何明示或暗示的保证。用户使用本平台提供的信息和服务所产生的任何后果，本平台不承担任何责任。
          </p>
        </section>

        <section>
          <h2>2. 健身活动风险</h2>
          <p>
            <strong>重要提示：</strong>健身活动存在一定的风险，包括但不限于运动损伤、身体不适等。在使用本平台预约课程、接受私教服务或进行任何健身活动之前，请您：
          </p>
          <ul>
            <li>确保自身身体健康，无运动禁忌症</li>
            <li>如有疾病或身体不适，请咨询医生后再进行健身活动</li>
            <li>根据自身身体状况选择合适的运动强度和方式</li>
            <li>在专业教练指导下进行健身活动</li>
            <li>如感到不适，立即停止运动并寻求医疗帮助</li>
          </ul>
          <p>
            因用户自身原因（包括但不限于隐瞒疾病、不听从教练指导、过度运动等）导致的任何身体损伤、疾病或其他后果，本平台不承担任何责任。
          </p>
        </section>

        <section>
          <h2>3. 服务中断与数据丢失</h2>
          <p>本平台不保证服务的连续性和稳定性。因以下原因导致的服务中断、数据丢失或其他损失，本平台不承担责任：</p>
          <ul>
            <li>系统维护、升级或故障</li>
            <li>网络中断或故障</li>
            <li>不可抗力（如自然灾害、战争、罢工等）</li>
            <li>第三方服务中断</li>
            <li>黑客攻击、病毒入侵等安全事件</li>
            <li>政府行为或法律法规变更</li>
          </ul>
        </section>

        <section>
          <h2>4. 第三方内容与链接</h2>
          <p>
            本平台可能包含第三方提供的内容、链接或服务。本平台不对第三方内容的准确性、合法性、完整性或适用性负责，也不对因使用第三方内容、链接或服务而产生的任何损失承担责任。用户访问第三方链接或使用第三方服务时，应自行承担风险。
          </p>
        </section>

        <section>
          <h2>5. 用户行为责任</h2>
          <p>用户在使用本平台时，应遵守相关法律法规和本平台的服务条款。因以下用户行为导致的任何损失或责任，由用户自行承担：</p>
          <ul>
            <li>违反法律法规的行为</li>
            <li>违反本平台服务条款的行为</li>
            <li>发布虚假、误导性信息</li>
            <li>侵犯他人合法权益</li>
            <li>恶意操作、攻击系统</li>
            <li>其他不当行为</li>
          </ul>
        </section>

        <section>
          <h2>6. 教练与课程质量</h2>
          <p>
            本平台仅为用户和教练提供信息发布和预约服务。本平台不对教练的专业水平、服务质量、课程效果等作任何保证。用户与教练之间的服务关系由双方自行协商确定，本平台不参与其中，也不对双方之间的争议承担责任。
          </p>
        </section>

        <section>
          <h2>7. 支付与退款</h2>
          <p>
            本平台提供支付服务，但不对支付过程中的任何问题承担责任。如发生支付纠纷，用户应与支付服务提供商协商解决。关于退款政策，请参考服务条款中的相关规定。本平台有权根据实际情况调整退款政策，并在合理范围内提前通知用户。
          </p>
        </section>

        <section>
          <h2>8. 数据安全</h2>
          <p>
            本平台采取合理的技术手段保护用户数据安全，但不保证数据的绝对安全。因以下原因导致的数据泄露、丢失或损坏，本平台不承担责任：
          </p>
          <ul>
            <li>用户自身原因（如密码泄露、账户被盗等）</li>
            <li>不可抗力</li>
            <li>第三方攻击或入侵</li>
            <li>法律法规要求</li>
          </ul>
        </section>

        <section>
          <h2>9. 设备与软件</h2>
          <p>
            用户使用本平台所需的设备、软件和网络环境由用户自行准备和维护。因设备故障、软件不兼容、网络问题等导致无法正常使用本平台，本平台不承担责任。
          </p>
        </section>

        <section>
          <h2>10. 责任限制</h2>
          <p>
            在法律允许的最大范围内，本平台对因使用或无法使用本平台而产生的任何直接、间接、偶然、特殊或后果性损害（包括但不限于利润损失、数据丢失、业务中断等）不承担责任，即使本平台已被告知此类损害的可能性。
          </p>
        </section>

        <section>
          <h2>11. 适用法律</h2>
          <p>
            本免责声明受中华人民共和国法律管辖。如本免责声明的任何条款被认定为无效或不可执行，不影响其他条款的效力。
          </p>
        </section>

        <section>
          <h2>12. 免责声明的修改</h2>
          <p>
            本平台有权随时修改本免责声明。修改后的免责声明将在本页面公布。如果您继续使用本平台，即视为您已接受修改后的免责声明。如果您不同意修改后的免责声明，请停止使用本平台。
          </p>
        </section>

        <section>
          <h2>13. 联系我们</h2>
          <p>如果您对本免责声明有任何疑问，请通过以下方式联系我们：</p>
          <ul>
            <li>邮箱：support@example.com</li>
            <li>电话：400-XXX-XXXX</li>
            <li>地址：XXX省XXX市XXX区XXX路XXX号</li>
          </ul>
        </section>
      </div>

      <template #footer>
        <div class="legal-footer">
          <p>最后更新：{{ currentDate }}</p>
          <div class="footer-actions">
            <TechButton size="sm" variant="outline" @click="goToTerms">查看服务条款</TechButton>
            <TechButton size="sm" variant="outline" @click="goBack">返回首页</TechButton>
          </div>
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

function goToTerms() {
  router.push('/index/legal/terms')
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

    p {
      margin: 0 0 16px;

      strong {
        color: $color-yellow;
      }
    }

    ul {
      margin: 0 0 16px;
      padding-left: 24px;

      li {
        margin-bottom: 8px;
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

.footer-actions {
  display: flex;
  gap: 12px;
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

  .footer-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>

