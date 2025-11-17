<template>
  <div class="home">
    <main class="home__main">
      <HeroSection @book="handleBook" @view-courses="() => handleNav({ routeName: 'courses' })" />
      <CoachNetwork :nodes="coachNodes" :links="coachLinks" @navigate="handleCoachNavigate" v-loading="loading.coaches" />
      <ServiceCards @navigate="handleServiceNavigate" />

      <section class="home__section home__section--combined" v-loading="loading.courses">
        <!-- 背景视频 -->
        <video
          class="combined-bg-video"
          :src="videoBgSrc"
          autoplay
          muted
          loop
          playsinline
        />
        
        <!-- 内容层 -->
        <div class="combined-content">
          <!-- 热门课程部分 -->
          <div class="combined-courses-section">
            <div class="section-header">
              <div>
                <p class="section-eyebrow">HOT COURSES</p>
                <h2>热门课程</h2>
                <span class="section-description">根据点击量与预约数据实时推荐</span>
              </div>
              <el-button type="primary" text @click="handleNav({ routeName: 'courses' })">全部课程</el-button>
            </div>
            <div class="course-grid">
              <article v-for="course in hotCourses" :key="course.id" class="course-card">
                <div class="course-thumb" :style="backgroundStyle(course.tupian)">
                  <span v-if="!course.tupian">暂无图片</span>
                </div>
                <div class="course-body">
                  <div class="course-tag">{{ course.kechengleixing || '特色课程' }}</div>
                  <h3>{{ course.kechengmingcheng }}</h3>
                  <p class="course-meta">
                    <span>{{ formatDate(course.shangkeshijian) }}</span>
                    <span>{{ formatCurrency(course.kechengjiage) }}</span>
                  </p>
                  <el-button type="primary" link @click="goCourseDetail(course.id)">查看详情</el-button>
                </div>
              </article>
            </div>
            <el-empty v-if="!hotCourses.length && !loading.courses" description="暂无课程数据" />
          </div>
        </div>
      </section>

      <section class="home__section home__section--news" v-loading="loading.news">
        <div class="section-header">
          <div>
            <p class="section-eyebrow">LATEST UPDATES</p>
            <h2>最新公告</h2>
          </div>
          <el-button type="primary" text @click="handleNav({ routeName: 'about' })">查看全部</el-button>
        </div>
        <div class="news-grid">
          <article v-for="item in latestNews" :key="item.id" class="news-card">
            <img v-if="item.picture" :src="resolveAssetUrl(item.picture)" alt="公告封面" />
            <div class="news-text">
              <p class="news-tag">{{ item.typename || '公告' }}</p>
              <h3 @click="goNewsDetail(item.id)">{{ item.title }}</h3>
              <p class="news-description">{{ item.introduction || '敬请期待详情' }}</p>
              <div class="news-meta">
                <span>{{ formatDate(item.addtime) }}</span>
                <el-button type="primary" link @click="goNewsDetail(item.id)">阅读更多</el-button>
              </div>
            </div>
          </article>
        </div>
        <el-empty v-if="!latestNews.length && !loading.news" description="暂无公告" />
      </section>

      <Testimonials />

      <TechCard
        as="section"
        class="home__cta"
        eyebrow="JOIN THE FUTURE"
        title="立即预约体验，解锁下一阶段的体能与状态"
        :interactive="false"
        variant="layered"
      >
        <template #footer>
          <TechButton size="lg" @click="handleJoin">立即加入</TechButton>
        </template>
      </TechCard>
    </main>

    <TechFooter />
    <FloatingServiceButton />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/common/http'
import config from '@/config/config'
import { FloatingServiceButton, HeroSection, ServiceCards, TechFooter } from '@/components/home'
import { TechButton, TechCard } from '@/components/common'
import type { NewsItem } from '@/types/content'
import { getModuleService } from '@/services/crud'
import type { Jianshenjiaolian, Jianshenkecheng } from '@/types/modules'
import type { ApiResponse, PageResult } from '@/types/api'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { CoachLink } from '@/utils/forceGraph'
import type { CoachNodeView } from '@/types/views'

const CoachNetwork = defineAsyncComponent(() => import('@/components/home/CoachNetwork.vue'))
const Testimonials = defineAsyncComponent(() => import('@/components/home/Testimonials.vue'))

const router = useRouter()
const courseService = getModuleService('jianshenkecheng')
const coachService = getModuleService('jianshenjiaolian')

const hotCourses = ref<Jianshenkecheng[]>([])
const latestNews = ref<NewsItem[]>([])
const coachNodes = ref<CoachNodeView[]>([])
const coachLinks = ref<CoachLink[]>([])
const loading = reactive({
  courses: false,
  news: false,
  coaches: false,
})

onMounted(async () => {
  try {
    // Load data in parallel but handle errors gracefully
    const promises = [
      loadHotCourses(),
      loadNews(),
      loadCoaches()
    ]

    // Use Promise.allSettled to prevent one failure from blocking others
    const results = await Promise.allSettled(promises)

    // Log any rejections for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const functionNames = ['loadHotCourses', 'loadNews', 'loadCoaches']
        console.warn(`${functionNames[index]} failed:`, result.reason)
      }
    })
  } catch (error) {
    console.error('Critical error during page initialization:', error)
    ElMessage.error('页面初始化失败，请刷新重试')
  }
})

const handleNav = (item: { routeName?: string }) => {
  if (!item.routeName) return
  switch (item.routeName) {
    case 'home':
      router.push('/index/home')
      break
    case 'courses':
      router.push('/index/jianshenkecheng')
      break
    case 'coaches':
      router.push('/index/jianshenjiaolian')
      break
    case 'environment':
      router.push('/index/jianshenqicai')
      break
    case 'about':
      router.push('/index/news')
      break
    case 'contact':
      router.push('/index/center')
      break
    default:
      break
  }
}

const handleJoin = () => {
  router.push('/register')
}

const handleBook = () => {
  router.push('/index/kechengyuyue')
}

const handleCoachNavigate = (coach: { id: string }) => {
  router.push({ path: '/index/jianshenjiaolianDetail', query: { id: coach.id } })
}

const handleServiceNavigate = (card: { slug: string }) => {
  router.push({ path: '/index/jianshenkecheng', query: { focus: card.slug } })
}

async function loadHotCourses() {
  loading.courses = true
  try {
    const { list } = await courseService.list({ page: 1, limit: 6, sort: 'clicknum', order: 'desc' })
    hotCourses.value = list
  } catch (error) {
    console.error(error)
    ElMessage.error('无法获取热门课程')
  } finally {
    loading.courses = false
  }
}

async function loadNews() {
  loading.news = true
  try {
    const response = await http.get<ApiResponse<PageResult<NewsItem>>>('/news/list', {
      params: { page: 1, limit: 4, sort: 'addtime', order: 'desc' },
    })
    latestNews.value = response.data.data?.list ?? []
  } catch (error) {
    console.error(error)
    ElMessage.error('加载公告失败')
  } finally {
    loading.news = false
  }
}

async function loadCoaches() {
  loading.coaches = true
  try {
    const { list } = await coachService.list({
      page: 1,
      limit: 6,
      order: 'desc',
      sort: 'addtime',
    })
    const mapped = (list ?? []).map((coach, index) => mapCoachToNode(coach, index))
    coachNodes.value = mapped
    coachLinks.value = buildCoachLinks(mapped)
  } catch (error) {
    console.error(error)
    ElMessage.error('加载教练数据失败')
  } finally {
    loading.coaches = false
  }
}

function mapCoachToNode(coach: Jianshenjiaolian, index: number): CoachNodeView {
  const id = String(coach.id ?? coach.jiaoliangonghao ?? index)
  const strengthTags = ['力量与体能', '燃脂塑形', '功能康复', '青少年体适能']
  const role =
    coach.gerenjianjie?.slice(0, 24) ||
    `${strengthTags[index % strengthTags.length]} · 认证私教`

  return {
    id,
    name: coach.jiaolianxingming || coach.jiaoliangonghao || `明星教练 ${index + 1}`,
    avatar: resolveAssetUrl(coach.zhaopian),
    role,
    clients: `${200 + index * 80}+`,
    awards: `${5 + (index % 4)}`,
    rating: (4.86 + index * 0.02).toFixed(2),
    featured: index === 0,
  }
}

function buildCoachLinks(nodes: CoachNodeView[]): CoachLink[] {
  if (nodes.length <= 1) return []
  const [center, ...others] = nodes
  const links: CoachLink[] = others.map((node, idx) => ({
    source: center.id,
    target: node.id,
    energyLevel: 0.85 - idx * 0.08,
  }))

  for (let i = 0; i < others.length - 1; i += 1) {
    links.push({
      source: others[i].id,
      target: others[i + 1].id,
      energyLevel: 0.65 - i * 0.06,
    })
  }

  return links
}

function goCourseDetail(id?: number) {
  if (!id) return
  router.push({ path: '/index/jianshenkechengDetail', query: { id } })
}

function goNewsDetail(id?: number) {
  if (!id) return
  router.push({ path: '/index/newsDetail', query: { id } })
}

function resolveAssetUrl(path?: string) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  if (!path.trim()) return ''
  const normalizedBase = config.baseUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

function backgroundStyle(path?: string) {
  const imageUrl = resolveAssetUrl(path)
  if (!imageUrl) {
    return {}
  }
  return { backgroundImage: `url(${imageUrl})` }
}

// 获取背景视频源
const normalizedBase = config.baseUrl.replace(/\/$/, '')
const videoBgSrc = `${normalizedBase}/file/video/qicai.mp4`
</script>

<style scoped lang="scss">
.home {
  background: #020202;
  min-height: 100vh;
  color: #fff;
  padding-top: 24px;

  &__main {
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 64px;
    padding-bottom: 80px;
  }

  &__section {
    margin: 0 6vw;
    padding: 40px 48px;
    border-radius: 24px;
    background: rgba(10, 10, 10, 0.75);
    border: 1px solid rgba(253, 216, 53, 0.15);
    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.35);
  }

  &__section--grid,
  &__section--news {
    background: rgba(8, 8, 8, 0.9);
  }

  &__section--combined {
    position: relative;
    overflow: hidden;
    padding: 0;
    margin: 0 0 64px 0;
    background: transparent;
    border: none;
    box-shadow: none;
    min-height: 600px;
  }

  &__cta {
    margin: 0 6vw;

    :deep(.tech-card__footer) {
      justify-content: flex-end;
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;

  h2 {
    margin: 6px 0;
    font-size: 32px;
    color: #f7fbea;
  }
  
}

.section-eyebrow {
  color: #fdd835;
  letter-spacing: 0.4em;
  margin: 0;
  
}

.section-description {
  color: #9aa0b3;
  font-size: 0.95rem;
  
}

.carousel-item {
  position: relative;
  border-radius: 24px;
  overflow: hidden;

  img {
    width: 100%;
    height: 360px;
    object-fit: cover;
  }
}

.carousel-caption {
  position: absolute;
  left: 40px;
  bottom: 40px;
  padding: 16px 24px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.55);
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.course-card {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

.course-thumb {
  width: 100%;
  height: 160px;
  background-color: rgba(255, 255, 255, 0.04);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cdd0d6;
}

.course-body {
  padding: 20px;

  h3 {
    margin: 12px 0 8px;
    font-size: 20px;
  }
}

.course-tag {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(253, 216, 53, 0.15);
  color: #fdd835;
  font-size: 0.85rem;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  color: #a0a4b3;
  margin-bottom: 6px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.news-card {
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 15, 15, 0.6);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
}

.news-text {
  padding: 20px;

  h3 {
    margin: 10px 0;
    cursor: pointer;
  }
}

.news-tag {
  color: #fdd835;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
}

.news-description {
  color: #b9bdc8;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  color: #8f94a5;
}

// 合并卡片样式
.combined-bg-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
  opacity: 1;
}

.combined-content {
  position: relative;
  z-index: 1;
  margin: 0 6vw;
  padding: 40px 48px;
  border-radius: 24px;
  background: transparent;
  border: none;
  box-shadow: none;
}

@media (max-width: 900px) {
  .home {
    &__section {
      margin: 0 24px;
      padding: 24px;
    }

    &__cta {
      flex-direction: column;
      text-align: center;
    }
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .combined-content {
    margin: 0 24px;
    padding: 24px;
  }
}
</style>
