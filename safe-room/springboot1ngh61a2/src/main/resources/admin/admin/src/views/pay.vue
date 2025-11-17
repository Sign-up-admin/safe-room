<template>
  <div v-loading="loading" class="pay-page">
    <el-card class="pay-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div>
            <h2>确认支付</h2>
            <p>业务表：{{ payment.table || '未指定' }}</p>
          </div>
          <el-tag size="large" type="success">金额：¥{{ amount }}</el-tag>
        </div>
      </template>

      <el-descriptions v-if="payment.payload" :column="2" border>
        <el-descriptions-item v-for="(value, key) in summaryFields" :key="key" :label="key">
          {{ payment.payload[value] ?? '--' }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="methods">
        <el-radio-group v-model="payment.method">
          <el-radio-button value="微信支付" />
          <el-radio-button value="支付宝" />
          <el-radio-button value="银行卡转账" />
        </el-radio-group>
      </div>

      <div class="actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmPay">确认支付</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="PayView">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/utils/http'
import storage from '@/utils/storage'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)

const payment = ref({
  table: storage.get('paytable') || '',
  payload: storage.getObj<Record<string, any>>('payObject'),
  method: '',
})

const amount = computed(() => payment.value.payload?.jiage || payment.value.payload?.kechengjiage || 0)
const summaryFields = ['title', 'kechengmingcheng', 'huiyuankamingcheng', 'yonghuxingming']

async function confirmPay() {
  if (!payment.value.method) {
    ElMessage.warning('请选择支付方式')
    return
  }
  if (!payment.value.table || !payment.value.payload) {
    ElMessage.error('缺少支付记录')
    return
  }
  await ElMessageBox.confirm('确认已经完成支付？', '提示', { type: 'warning' })
  submitting.value = true
  try {
    const payload = { ...payment.value.payload, ispay: '已支付' }
    await http.post(`/${payment.value.table}/update`, payload)
    ElMessage.success('支付成功')
    router.back()
  } catch (error) {
    console.error(error)
    ElMessage.error('支付失败')
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped lang="scss">
.pay-page {
  padding: 32px;
}

.pay-card {
  max-width: 720px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.methods {
  margin: 24px 0;
  display: flex;
  justify-content: center;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
