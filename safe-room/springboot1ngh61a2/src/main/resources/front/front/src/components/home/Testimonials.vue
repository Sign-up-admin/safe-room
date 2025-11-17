<template>
  <section class="testimonials">
    <div class="testimonials__header">
      <p class="testimonials__eyebrow">REVIEWS</p>
      <h2>好评如潮 · 真实体验</h2>
    </div>

    <div
      class="testimonials__track"
      @mouseenter="pause"
      @mouseleave="resume"
      ref="trackRef"
    >
      <article v-for="item in visibleTestimonials" :key="item.id" class="testimonials__card">
        <div class="testimonials__user">
          <img :src="item.avatar" :alt="item.user" width="40" height="40" />
          <div>
            <p class="testimonials__user-name">{{ item.user }}</p>
            <p class="testimonials__user-meta">{{ item.type }}</p>
          </div>
          <div class="testimonials__stars">
            <span v-for="index in 5" :key="index">★</span>
          </div>
        </div>
        <p class="testimonials__content">“{{ item.content }}”</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

interface Testimonial {
  id: string
  user: string
  type: string
  avatar: string
  content: string
}

const testimonials: Testimonial[] = [
  {
    id: 't1',
    user: 'Sophie · 产品经理',
    type: '体态塑形会员',
    avatar: new URL('@/assets/touxiang.png', import.meta.url).href,
    content: 'AI 姿态捕捉真的很神奇，私教根据我的工作强度定了详细的恢复计划，肩颈舒缓多了。',
  },
  {
    id: 't2',
    user: 'Kevin · 创业者',
    type: '高级私教会员',
    avatar: new URL('@/assets/touxiang.png', import.meta.url).href,
    content: '24h 场馆 + 智能预约系统，配合顶级教练，人到场就能开启高效训练模式。',
  },
  {
    id: 't3',
    user: 'Ivy · 模特',
    type: '燃脂训练会员',
    avatar: new URL('@/assets/touxiang.png', import.meta.url).href,
    content: '光影氛围和音乐超燃，每次团课都像沉浸式舞台，顺便完成当日燃脂目标。',
  },
  {
    id: 't4',
    user: 'Marcus · 程序员',
    type: '康复训练会员',
    avatar: new URL('@/assets/touxiang.png', import.meta.url).href,
    content: '手腕老损伤在教练的康复计划中逐步恢复，还引入了三维动作分析，很靠谱。',
  },
]

const trackRef = ref<HTMLDivElement>()
const isPaused = ref(false)
let animationId: number | null = null
let offset = 0

const visibleTestimonials = computed(() => [...testimonials, ...testimonials])

const animate = () => {
  if (!trackRef.value || isPaused.value) return
  offset -= 0.5
  trackRef.value.style.transform = `translateX(${offset}px)`
  if (Math.abs(offset) > trackRef.value.scrollWidth / 2) {
    offset = 0
  }
  animationId = requestAnimationFrame(animate)
}

const pause = () => {
  isPaused.value = true
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

const resume = () => {
  if (!trackRef.value || animationId) return
  isPaused.value = false
  animationId = requestAnimationFrame(animate)
}

const { observe, disconnect } = useScrollAnimation(
  () => trackRef.value,
  (entry) => {
    if (entry.isIntersecting) {
      resume()
    } else {
      pause()
    }
  },
  { threshold: 0.1 },
)

onMounted(() => {
  observe()
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  disconnect()
})
</script>

<style scoped lang="scss">
.testimonials {
  padding: 120px 0;
  background: #030303;
  color: #fff;

  &__header {
    text-align: center;
    margin-bottom: 48px;
  }

  &__eyebrow {
    color: #fdd835;
    letter-spacing: 0.4em;
    font-size: 0.85rem;
  }

  &__track {
    display: flex;
    gap: 24px;
    width: max-content;
    padding: 0 6vw;
    will-change: transform;
  }

  &__card {
    width: 320px;
    background: rgba(10, 10, 10, 0.86);
    border-radius: 18px;
    padding: 24px;
    border: 1px solid rgba(253, 216, 53, 0.18);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 12px;

    img {
      border: 2px solid rgba(253, 216, 53, 0.65);
    }
  }

  &__user-name {
    margin: 0;
  }

  &__user-meta {
    margin: 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
  }

  &__stars {
    margin-left: auto;
    color: #fdd835;
  }

  &__content {
    margin-top: 18px;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.9);
  }
}

@media (max-width: 768px) {
  .testimonials {
    padding: 80px 0;

    &__track {
      padding: 0 20px;
    }

    &__card {
      width: 260px;
    }
  }
}

@media (max-width: 520px) {
  .testimonials {
    &__card {
      width: 220px;
      padding: 20px;
    }
  }
}
</style>

