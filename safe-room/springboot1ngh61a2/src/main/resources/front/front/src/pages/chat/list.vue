<template>
  <div v-loading="loading" class="chat-page">
    <header class="chat-header">
      <div>
        <p class="section-eyebrow">FEEDBACK LOOP</p>
        <h1>会员留言 · 实时响应</h1>
        <span>系统按最新反馈自动排序，方便快速查看</span>
      </div>
      <TechButton size="sm" @click="goCreate">我要留言</TechButton>
    </header>

    <section class="chat-list">
      <article v-for="item in messages" :key="item.id" class="chat-card">
        <header>
          <strong>{{ item.ask || '无主题' }}</strong>
          <span>{{ formatDateTime(item.addtime) }}</span>
        </header>
        <p>{{ item.ask || '正在等待处理...' }}</p>
        <div v-if="item.reply" class="chat-reply">
          <small>客服回复 · {{ formatDateTime(item.replytime) }}</small>
          <p>{{ item.reply }}</p>
        </div>
        <div class="chat-status" :class="{ 'chat-status--pending': item.isreply !== 1 }">
          {{ item.isreply === 1 ? '已回复' : '待回复' }}
        </div>
      </article>
      <el-empty v-if="!messages.length && !loading" description="暂无留言" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { TechButton } from '@/components/common'
import http from '@/common/http'
import type { ApiResponse, PageResult } from '@/types/api'
import { formatDateTime } from '@/utils/formatters'

interface ChatMessage {
  id?: number
  ask?: string
  reply?: string
  replytime?: string
  addtime?: string
  isreply?: number
}

const router = useRouter()
const loading = ref(false)
const messages = ref<ChatMessage[]>([])

onMounted(() => {
  loadMessages()
})

async function loadMessages() {
  loading.value = true
  try {
    const response = await http.get<ApiResponse<PageResult<ChatMessage>>>('/chat/autoSort', {
      params: { page: 1, limit: 20 },
    })
    messages.value = response.data.data?.list ?? []
  } finally {
    loading.value = false
  }
}

function goCreate() {
  router.push('/index/chatAdd')
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.chat-page {
  padding: 48px 20px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  h1 {
    margin: 8px 0;
  }

  span {
    color: $color-text-secondary;
  }
}

.chat-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.chat-card {
  @include glass-card;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: $color-text-secondary;

    strong {
      color: $color-text-primary;
    }
  }

  p {
    margin: 0;
  }
}

.chat-reply {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);

  small {
    color: $color-text-secondary;
  }

  p {
    margin-top: 4px;
  }
}

.chat-status {
  margin-top: auto;
  align-self: flex-end;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(76, 175, 80, 0.5);
  color: #4caf50;

  &--pending {
    border-color: rgba(255, 167, 38, 0.5);
    color: #ffa726;
  }
}
</style>
