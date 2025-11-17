<template>
  <div class="breadcrumb-preview">
    <el-breadcrumb :style="{ lineHeight: '1', fontSize: 'inherit' }" separator=">">
      <transition-group name="breadcrumb">
        <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path" class="box">
          <span v-if="item.redirect === 'noRedirect' || index === levelList.length - 1" class="no-redirect">
            {{ item.name }}
          </span>
          <a v-else @click.prevent="handleLink(item)">
            <span
              class="icon iconfont icon-shouye-zhihui"
              :style="{ margin: '0 2px', lineHeight: '1', fontSize: 'inherit', color: '#333', display: 'none' }"
            ></span>
            Home
          </a>
        </el-breadcrumb-item>
      </transition-group>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts" name="BreadCrumbs">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteLocationMatched } from 'vue-router'

interface BreadcrumbItem {
  path: string
  name?: string
  redirect?: string
  meta?: {
    title?: string
  }
}

const route = useRoute()
const router = useRouter()

const levelList = ref<BreadcrumbItem[]>([])

const getBreadcrumb = () => {
  // only show routes with meta.title
  let matched = route.matched.filter(item => item.meta)
  matched = [{ path: '/index', meta: {} } as RouteLocationMatched].concat(matched)

  levelList.value = matched.filter(item => item.meta) as BreadcrumbItem[]
}

// Helper functions (kept for potential future use)
// const isDashboard = (route: BreadcrumbItem) => {
//   const name = route && route.name
//   if (!name) {
//     return false
//   }
//   return name.trim().toLocaleLowerCase() === 'Index'.toLocaleLowerCase()
// }

// const pathCompile = (path: string) => {
//   // Simplified - can use path-to-regexp if needed
//   const { params } = route
//   let compiledPath = path
//   Object.keys(params).forEach((key) => {
//     compiledPath = compiledPath.replace(`:${key}`, params[key] as string)
//   })
//   return compiledPath
// }

const handleLink = (item: BreadcrumbItem) => {
  const { redirect, path } = item
  if (redirect) {
    router.push(redirect)
    return
  }
  if (path) {
    router.push(path)
  } else {
    router.push('/')
  }
}

watch(
  () => route.path,
  () => {
    getBreadcrumb()
  },
  { immediate: true },
)

getBreadcrumb()
</script>

<style lang="scss" scoped>
.el-breadcrumb {
  :deep(.el-breadcrumb__separator) {
    margin: 0 9px;
    color: #ccc;
    font-weight: 500;
  }

  :deep(.el-breadcrumb__inner a) {
    color: #000;
    font-weight: 600;
    display: inline-block;
  }

  :deep(.el-breadcrumb__inner) {
    color: #838e98;
    display: inline-block;
  }
}
</style>
