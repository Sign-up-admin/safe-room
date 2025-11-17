<template>
  <div class="admin-layout">
    <IndexHeader class="admin-layout__header" />
    <IndexAside
      v-if="'vertical' === layoutMode"
      :is-collapse="isCollapse"
      class="admin-layout__aside" :class="[isCollapse ? 'admin-layout__aside--collapsed' : 'admin-layout__aside--expanded']"
      @oncollapsechange="collapseChange"
    />
    <el-main
      class="admin-layout__content" :class="[
        layoutMode === 'vertical' ? 'admin-layout__content--vertical' : 'admin-layout__content--horizontal',
        layoutMode === 'vertical' && isCollapse ? 'admin-layout__content--collapsed' : '',
      ]"
    >
      <bread-crumbs :title="title" class="bread-crumbs" />
      <TagsView />
      <router-view class="router-view" />
    </el-main>
  </div>
</template>

<script setup lang="ts" name="IndexMain">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import IndexAside from '@/components/index/IndexAsideStatic.vue'
import IndexHeader from '@/components/index/IndexHeader.vue'
import TagsView from '@/components/index/TagsView/index.vue'
import type { MenuRole } from '@/types/menu'
import { useUserStore } from '@/stores/user'
import menu from '@/utils/menu'
import storage from '@/utils/storage'

const savedCollapse = storage.get('asideCollapse') === 'true'
const menuList = ref<MenuRole[]>([])
const role = ref('')
const title = ref('')
const userStore = useUserStore()
const isCollapse = ref(savedCollapse)
const preferredCollapse = ref(savedCollapse)
const isMobile = ref(false)
const updatingFromResize = ref(false)
const layoutMode = ref<'vertical' | 'horizontal'>('vertical')

watch(isCollapse, val => {
  if (updatingFromResize.value) return
  preferredCollapse.value = val
  storage.set('asideCollapse', val)
})

function init() {
  // Initialization logic if needed
}

function collapseChange(collapse: boolean) {
  isCollapse.value = collapse
}

function handleResize() {
  updatingFromResize.value = true
  isMobile.value = window.innerWidth < 992
  if (isMobile.value) {
    isCollapse.value = true
  } else {
    isCollapse.value = preferredCollapse.value
  }
  setTimeout(() => {
    updatingFromResize.value = false
  }, 0)
}

onMounted(() => {
  const menus = menu.list()
  menuList.value = menus
  role.value = userStore.userRole || ''
  handleResize()
  window.addEventListener('resize', handleResize)
  init()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens' as *;

.admin-layout {
  min-height: 100vh;
  background: $color-bg-main;
}

.bread-crumbs {
  padding: spacing(md) 30px;
  margin: 0;
}

.router-view {
  min-height: calc(100vh - 200px);
  padding: spacing(md) 0;
}

// 响应式设计
@media (width <= 768px) {
  .bread-crumbs {
    padding: spacing(sm) 16px;
  }

  .router-view {
    padding: spacing(sm) 0;
    min-height: calc(100vh - 160px);
  }
}

@media (width > 768px) and (width <= 1024px) {
  .bread-crumbs {
    padding: spacing(sm) 20px;
  }
}
</style>
