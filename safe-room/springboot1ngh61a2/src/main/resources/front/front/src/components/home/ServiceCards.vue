<template>
  <section class="services">
    <!-- 背景视频 -->
    <video
      class="services__bg-video"
      :src="sectionVideoSrc"
      autoplay
      muted
      loop
      playsinline
      @error="handleSectionVideoError"
    />
    
    <!-- 内容层 -->
    <div class="services__content">
      <div class="services__header">
        <p class="services__eyebrow">PROGRAMS</p>
        <h2 class="services__title">高效训练 · 量化成果</h2>
        <p class="services__subtitle">6 大核心课程矩阵，覆盖增肌、燃脂、康复与体态塑形</p>
      </div>

      <div class="services__grid">
      <article
        v-for="(card, index) in cards"
        :key="card.title"
        class="services__card"
        :class="{ 
          'services__card--use-first-bg': index >= 3,
          'services__card--video-only': index === 2
        }"
        :style="{
          '--card-accent': card.accent,
          backgroundImage: getCardBackground(card, index),
        }"
        @mouseenter="() => handleHover(card.title)"
        @mouseleave="() => handleHover(null)"
      >
        <video
          v-if="shouldShowVideo(card, index)"
          :src="getVideoSrc(card, index)"
          autoplay
          muted
          loop
          playsinline
          @error="(e) => handleVideoError(e, index)"
          @loadeddata="() => handleVideoLoaded(index)"
        />

        <div class="services__card-overlay" />
        <div class="services__card-content">
          <p class="services__card-tag">{{ card.tag }}</p>
          <h3>{{ card.title }}</h3>
          <p>{{ card.description }}</p>
          <button class="services__card-cta" @click="$emit('navigate', card)">
            查看详情
          </button>
        </div>
      </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import config from '@/config/config'

interface ServiceCard {
  title: string
  description: string
  tag: string
  accent: string
  media: {
    type: 'image' | 'video'
    src: string
  }
  slug: string
}

const cards: ServiceCard[] = [
  {
    title: '增肌特训',
    description: '力量周期化训练 + AI 负重监测，实现肌肉线条和爆发力双提升。',
    tag: 'PRO SERIES',
    accent: '#FDD835',
    media: { type: 'image', src: '' },
    slug: 'mass',
  },
  {
    title: '燃脂训练',
    description: '高强度间歇 + 代谢调控课程，搭配实时心率监控，精准燃脂。',
    tag: 'HIIT',
    accent: '#FFC727',
    media: { type: 'image', src: '' }, // 外部视频链接失效，改为图片
    slug: 'fat-burn',
  },
  {
    title: '体态塑形',
    description: '筋膜放松 + 体态矫正组合，恢复身体力线，塑造高级气质。',
    tag: 'POSTURE',
    accent: '#FFEB3B',
    media: { type: 'video', src: '' }, // 视频源由 getVideoSrc 函数动态提供
    slug: 'posture',
  },
  {
    title: '高级私教',
    description: '明星教练 1v1 指导，结合 AI 动作识别与营养周期表，定制方案。',
    tag: 'VIP',
    accent: '#FFE082',
    media: { type: 'image', src: '' }, // 外部视频链接可能失效，改为图片
    slug: 'vip',
  },
  {
    title: '团体课程',
    description: '能量团课 + 氛围灯光 + 互动装置，团队燃烧热血。',
    tag: 'TEAM',
    accent: '#FFD54F',
    media: { type: 'image', src: '' },
    slug: 'group',
  },
  {
    title: '场馆环境',
    description: '黑黄未来感空间，智能物联设备，24h 自由训练体验。',
    tag: 'SPACE',
    accent: '#FFF59D',
    media: { type: 'image', src: '' },
    slug: 'environment',
  },
]

const handleHover = (title: string | null) => {
  if (!title) return
}

// 视频加载错误处理
const handleVideoError = (event: Event, index: number) => {
  const video = event.target as HTMLVideoElement
  console.warn(`视频加载失败 (卡片 ${index}):`, video.src)
  // 隐藏视频元素，避免显示错误
  if (video) {
    video.style.display = 'none'
  }
}

// 视频加载成功
const handleVideoLoaded = (index: number) => {
  console.log(`视频加载成功 (卡片 ${index})`)
}

// 获取第一个卡片的背景
const firstCard = cards[0]
const firstCardBackground = firstCard.media.type === 'image' 
  ? `url(${firstCard.media.src})` 
  : undefined

// 获取卡片背景样式：从第三个卡片开始（索引2）使用第一个卡片的背景
const getCardBackground = (card: ServiceCard, index: number) => {
  // 第三个卡片（索引2）：显示视频时不使用背景图片
  if (index === 2) {
    return undefined
  }
  // 从第四个卡片开始（索引 >= 3），使用第一个卡片的背景
  if (index >= 3) {
    return firstCardBackground
  }
  // 前两个卡片使用自己的背景
  return card.media.type === 'image' ? `url(${card.media.src})` : undefined
}

// 判断是否应该显示视频
const shouldShowVideo = (card: ServiceCard, index: number) => {
  // 第三个卡片（索引2）：不显示视频，保持透明
  if (index === 2) {
    return false
  }
  // 前两个卡片：如果是视频类型，显示视频
  if (index < 2) {
    return card.media.type === 'video'
  }
  // 从第四个卡片开始：如果第一个卡片是视频，显示第一个卡片的视频
  return firstCard.media.type === 'video'
}

// 获取基础URL
const normalizedBase = config.baseUrl.replace(/\/$/, '')

// 获取视频源
const getVideoSrc = (card: ServiceCard, index: number) => {
  // 前两个卡片使用自己的视频
  if (index < 2) {
    return card.media.src
  }
  // 第三个卡片（索引2）：使用 girlweigt.mp4 视频
  if (index === 2) {
    return `${normalizedBase}/file/video/girlweigt.mp4`
  }
  // 从第四个卡片开始使用第一个卡片的视频
  return firstCard.media.src
}

// Section 背景视频源
const sectionVideoSrc = `${normalizedBase}/file/video/girlweigt.mp4`

// Section 背景视频错误处理
const handleSectionVideoError = (event: Event) => {
  const video = event.target as HTMLVideoElement
  console.error('Section 背景视频加载失败:', video.src, event)
}
</script>

<style scoped lang="scss">
.services {
  position: relative;
  overflow: hidden;
  padding: 140px 6vw;
  background: transparent;
  color: #fefefe;
  min-height: 100vh;

  // 背景视频
  &__bg-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
    pointer-events: none;
    opacity: 0.6; // 提高透明度，让视频更清晰可见
  }

  // 内容层
  &__content {
    position: relative;
    z-index: 1;
  }

  &__header {
    max-width: 640px;
  }

  &__eyebrow {
    color: #fdd835;
    letter-spacing: 0.4em;
    font-size: 0.9rem;
  }

  &__title {
    font-size: clamp(2.4rem, 4vw, 3.6rem);
    margin: 12px 0;
  }

  &__subtitle {
    color: rgba(255, 255, 255, 0.75);
  }

  &__grid {
    margin-top: 64px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
  }

  &__card {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    min-height: 320px;
    background-size: cover;
    background-position: center;
    background-color: rgba(0, 0, 0, 0.3); // 默认背景色
    border: 1px solid rgba(253, 216, 53, 0.18);
    transition: transform 0.4s ease, border-color 0.4s ease;

    video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
      display: block;
    }

    &:hover {
      transform: translateY(-8px) scale(1.01);
      border-color: var(--card-accent, #fdd835);
    }
  }

  // 第三卡片：完全透明，不显示视频
  &__card--video-only {
    background-color: transparent !important;
    background-image: none !important;
    border-color: rgba(253, 216, 53, 0.3) !important;
  }

  // 从第三个卡片开始，隐藏它们原本的视频，使用第一个卡片的背景
  &__card--use-first-bg {
    // 如果第一个卡片是图片，确保背景图片显示
    background-color: transparent;
  }

  &__card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.85) 100%);
    z-index: 1;
  }

  // 第三卡片：overlay 完全透明，让背景视频清晰可见
  &__card--video-only .services__card-overlay {
    display: none !important;
  }

  &__card-content {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 32px;

    h3 {
      margin: 12px 0 8px;
    }

    p {
      margin: 0;
      color: rgba(255, 255, 255, 0.84);
    }
  }

  // 第三卡片：文字添加轻微背景，确保可读性，同时不遮挡视频
  &__card--video-only .services__card-content {
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.2) 60%, rgba(0, 0, 0, 0.4) 100%);
    border-radius: 24px;
  }

  &__card-tag {
    font-size: 0.75rem;
    letter-spacing: 0.45em;
    color: var(--card-accent, #fdd835);
  }

  &__card-cta {
    margin-top: 24px;
    align-self: flex-start;
    padding: 10px 24px;
    border-radius: 999px;
    border: 1px solid rgba(253, 216, 53, 0.65);
    background: transparent;
    color: #fff;
    cursor: pointer;
  }
}

@media (max-width: 768px) {
  .services {
    padding: 100px 5vw;
  }
}

@media (max-width: 600px) {
  .services {
    &__grid {
      grid-template-columns: 1fr;
    }

    &__card {
      min-height: 280px;
    }
  }
}
</style>

