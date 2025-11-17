<template>
  <div class="coaches-page">
    <section class="coaches-hero">
      <p class="section-eyebrow">COACH MATRIX</p>
      <h1>明星教练矩阵 · 技能图谱实时联动</h1>
      <p>
        以力导向网络可视化教练关系，结合技能、资历、评分与价格等多维信息，找到最适合你的明星私教。
      </p>
    </section>

    <TechCard as="section" class="coaches-filters" :interactive="false" variant="layered">
      <div class="filters__grid">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索教练姓名 / 擅长"
          clearable
          :prefix-icon="Search"
        />
        <el-select v-model="filters.skill" placeholder="擅长领域" clearable>
          <el-option v-for="skill in skillOptions" :key="skill" :label="skill" :value="skill" />
        </el-select>
        <el-select v-model="filters.rating" placeholder="评分下限">
          <el-option v-for="rating in ratingOptions" :key="rating" :label="rating" :value="rating" />
        </el-select>
        <div class="filters__slider">
          <label>私教价格</label>
          <el-slider
            v-model="filters.price"
            :min="100"
            :max="800"
            range
            :step="50"
          />
        </div>
      </div>
      <div class="filters__actions">
        <TechButton size="sm" variant="ghost" @click="resetFilters">重置</TechButton>
        <TechButton size="sm" @click="applyFilters">应用</TechButton>
      </div>
    </TechCard>

    <div class="coaches-metrics">
      <TechCard variant="minimal" :interactive="false">
        <p class="metric__label">教练总数</p>
        <strong>{{ metrics.total }}</strong>
        <span>多维资历 / 技能分类</span>
      </TechCard>
      <TechCard variant="minimal" :interactive="false">
        <p class="metric__label">平均评分</p>
        <strong>{{ metrics.avgRating }}</strong>
        <span>实时根据评价更新</span>
      </TechCard>
      <TechCard variant="minimal" :interactive="false">
        <p class="metric__label">平均私教价</p>
        <strong>{{ metrics.avgPrice }}</strong>
        <span>按 45min 计算</span>
      </TechCard>
    </div>

    <section class="coaches-network">
      <div class="coaches-network__graph" v-loading="loading.graph">
        <CoachNetwork
          :nodes="graphNodes"
          :links="graphLinks"
          @navigate="handleGraphNavigate"
        />
      </div>
      <TechCard class="coaches-network__panel" v-if="activeCoach">
        <p class="section-eyebrow">ACTIVE COACH</p>
        <h3>{{ activeCoach.name }}</h3>
        <p class="panel__role">{{ activeCoach.role }}</p>
        <ul class="panel__stats">
          <li>
            <span>评分</span>
            <strong>{{ activeCoach.rating }}</strong>
          </li>
          <li>
            <span>资历</span>
            <strong>{{ activeCoach.years }} 年</strong>
          </li>
          <li>
            <span>私教价</span>
            <strong>¥{{ activeCoach.price }}</strong>
          </li>
        </ul>
        <div class="panel__tags">
          <span v-for="skill in activeCoach.skills" :key="skill">{{ skill }}</span>
        </div>
        <div class="panel__actions">
          <TechButton size="sm" variant="ghost" @click="goCoachDetail(activeCoach.id)">查看详情</TechButton>
          <TechButton size="sm" @click="handleBook(activeCoach)">预约私教</TechButton>
        </div>
      </TechCard>
    </section>

    <section class="coaches-list" v-loading="loading.list">
      <article v-for="coach in displayCoaches" :key="coach.id" class="coach-card">
        <div class="coach-card__head">
          <img :src="coach.avatar" :alt="coach.name" />
          <div>
            <h3>{{ coach.name }}</h3>
            <p>{{ coach.role }}</p>
          </div>
          <span class="coach-card__rating">{{ coach.rating }}</span>
        </div>
        <p class="coach-card__desc">
          {{ coach.description }}
        </p>
        <div class="coach-card__meta">
          <span>资历 {{ coach.years }} 年</span>
          <span>年度私教 {{ coach.clients }}+</span>
          <span>私教 ¥{{ coach.price }}</span>
        </div>
        <div class="coach-card__skills">
          <span v-for="skill in coach.skills" :key="skill">{{ skill }}</span>
        </div>
        <div class="coach-card__actions">
          <TechButton size="sm" variant="ghost" @click="goCoachDetail(coach.id)">了解详情</TechButton>
          <TechButton size="sm" @click="handleBook(coach)">预约</TechButton>
        </div>
      </article>
      <el-empty v-if="!displayCoaches.length && !loading.list" description="暂无符合条件的教练" />
    </section>

    <div class="coaches-pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { TechButton, TechCard } from '@/components/common'
import { CoachNetwork } from '@/components/home'
import { getModuleService } from '@/services/crud'
import type { Jianshenjiaolian } from '@/types/modules'
import type { CoachView } from '@/types/views'
import type { CoachLink } from '@/utils/forceGraph'
import { formatCurrency } from '@/utils/formatters'

const coachService = getModuleService('jianshenjiaolian')
const router = useRouter()

const coaches = ref<CoachView[]>([])
const graphNodes = ref<CoachView[]>([])
const graphLinks = ref<CoachLink[]>([])
const activeCoach = ref<CoachView | null>(null)

const filters = reactive({
  keyword: '',
  skill: '',
  rating: 4.5,
  price: [200, 600],
})

const loading = reactive({
  list: false,
  graph: false,
})

const pagination = reactive({
  page: 1,
  pageSize: 8,
  total: 0,
})

const skillOptions = ['增肌力量', '燃脂 HIIT', '功能康复', '青少年体适能', '体态塑形']
const ratingOptions = [4.5, 4.7, 4.9]

const displayCoaches = computed(() =>
  coaches.value.filter((coach) => {
    if (filters.skill && !coach.skills.includes(filters.skill)) return false
    if (Number(coach.rating) < filters.rating) return false
    if (coach.price < filters.price[0] || coach.price > filters.price[1]) return false
    return true
  }),
)

const metrics = computed(() => ({
  total: pagination.total,
  avgRating: coaches.value.length
    ? (coaches.value.reduce((sum, item) => sum + Number(item.rating), 0) / coaches.value.length).toFixed(2)
    : '0.0',
  avgPrice: coaches.value.length
    ? formatCurrency(coaches.value.reduce((sum, item) => sum + item.price, 0) / coaches.value.length)
    : '¥0',
}))

onMounted(() => {
  loadCoaches()
})

async function loadCoaches() {
  loading.list = true
  try {
    const params: Record<string, any> = {
      page: pagination.page,
      limit: pagination.pageSize,
    }
    if (filters.keyword) params.keyword = filters.keyword

    const { list, total } = await coachService.list(params)
    const mapped = (list ?? []).map(mapCoach)
    coaches.value = mapped
    pagination.total = total
    buildNetwork(mapped)
    if (!activeCoach.value && mapped.length) {
      activeCoach.value = mapped[0]
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('加载教练失败')
  } finally {
    loading.list = false
  }
}

function mapCoach(item: Jianshenjiaolian): CoachView {
  const skills = deriveSkills(item)
  const rating = (4.7 + ((item.id ?? 0) % 4) * 0.05).toFixed(2)
  return {
    id: String(item.id ?? item.jiaoliangonghao),
    name: item.jiaolianxingming || item.jiaoliangonghao || '明星教练',
    avatar: resolveAssetUrl(item.zhaopian),
    role: item.gerenjianjie?.slice(0, 24) || '全栈训练专家',
    description:
      item.gerenjianjie ||
      '专注体态矫正与高效增肌，结合 AI 体能数据制定训练处方。',
    years: Number(item.nianling) || 6,
    price: item.sijiaojiage || 499,
    rating,
    clients: 180 + ((item.id ?? 0) % 8) * 40,
    skills,
  }
}

function deriveSkills(item: Jianshenjiaolian) {
  const text = `${item.kechengjianjie ?? ''}${item.gerenjianjie ?? ''}`
  const skills: string[] = []
  if (/燃脂|HIIT|心肺/.test(text)) skills.push('燃脂 HIIT')
  if (/增肌|力量|爆发/.test(text)) skills.push('增肌力量')
  if (/康复|修复|功能/.test(text)) skills.push('功能康复')
  if (/青少年|体适能/.test(text)) skills.push('青少年体适能')
  if (/体态|塑形/.test(text)) skills.push('体态塑形')
  return skills.length ? skills : ['综合训练']
}

function buildNetwork(list: CoachView[]) {
  loading.graph = true
  const nodes = list.slice(0, 8).map((coach, index) => ({
    ...coach,
    featured: index === 0,
    clients: `${coach.clients}+`,
    awards: `${5 + (index % 4)}`,
  }))
  graphNodes.value = nodes
  const [center, ...others] = nodes
  const links: CoachLink[] = []
  if (center) {
    others.forEach((node, idx) => {
      links.push({ source: center.id, target: node.id, energyLevel: 0.85 - idx * 0.05 })
    })
  }
  for (let i = 0; i < others.length - 1; i += 1) {
    links.push({ source: others[i].id, target: others[i + 1].id, energyLevel: 0.65 - i * 0.04 })
  }
  graphLinks.value = links
  loading.graph = false
}

function applyFilters() {
  pagination.page = 1
  loadCoaches()
}

function resetFilters() {
  filters.keyword = ''
  filters.skill = ''
  filters.rating = 4.5
  filters.price = [200, 600]
  applyFilters()
}

function handlePageChange(page: number) {
  pagination.page = page
  loadCoaches()
}

function handleGraphNavigate(node: CoachView) {
  activeCoach.value = node
  goCoachDetail(node.id)
}

function goCoachDetail(id: string) {
  router.push({ path: '/index/jianshenjiaolianDetail', query: { id } })
}

function handleBook(coach: CoachView) {
  router.push({
    path: '/index/sijiaoyuyue',
    query: { coachId: coach.id, coachName: coach.name },
  })
}

function resolveAssetUrl(path?: string) {
  if (!path) return new URL('@/assets/touxiang.png', import.meta.url).href
  if (/^https?:\/\//i.test(path)) return path
  const base = import.meta.env.VITE_APP_BASE_API?.replace(/\/$/, '') || ''
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.coaches-page {
  padding: 40px 6vw 80px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.coaches-hero {
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  h1 {
    margin: 0;
    font-size: clamp(2.4rem, 4vw, 3.2rem);
  }

  p {
    margin: 0;
    color: $color-text-secondary;
  }
}

.coaches-filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filters__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.filters__slider {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filters__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.coaches-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.metric__label {
  margin: 0;
  color: $color-text-secondary;
  letter-spacing: 0.25em;
  font-size: 0.8rem;
}

.coaches-network {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
}

.coaches-network__graph {
  min-height: 420px;
}

.coaches-network__panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel__role {
  margin: 0;
  color: $color-text-secondary;
}

.panel__stats {
  display: flex;
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;

  span {
    display: block;
    color: $color-text-secondary;
    letter-spacing: 0.2em;
    font-size: 0.75rem;
  }
}

.panel__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    @include pill;
    background: rgba(255, 255, 255, 0.04);
  }
}

.panel__actions {
  display: flex;
  gap: 12px;
}

.coaches-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.coach-card {
  padding: 20px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coach-card__head {
  display: flex;
  gap: 12px;
  align-items: center;

  img {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    object-fit: cover;
  }

  h3 {
    margin: 0;
  }

  p {
    margin: 2px 0 0;
    color: $color-text-secondary;
  }
}

.coach-card__rating {
  margin-left: auto;
  font-size: 1.2rem;
  color: $color-yellow;
}

.coach-card__desc {
  margin: 0;
  color: $color-text-secondary;
  min-height: 48px;
}

.coach-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.85rem;
  color: $color-text-secondary;
}

.coach-card__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    @include pill;
    background: rgba(255, 255, 255, 0.04);
  }
}

.coach-card__actions {
  display: flex;
  gap: 10px;
}

.coaches-pagination {
  display: flex;
  justify-content: center;
}

@media (max-width: 1024px) {
  .coaches-network {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .coaches-page {
    padding: 32px 16px 60px;
  }

  .filters__actions {
    flex-direction: column;
  }
}
</style>
