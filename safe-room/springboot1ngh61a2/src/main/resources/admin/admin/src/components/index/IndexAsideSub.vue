<template>
  <el-submenu v-if="menu.list && menu.list.length >= 1" :index="menu.menuId + ''">
    <template #title>
      <span>{{ menu.name }}</span>
    </template>
    <IndexAsideSub v-for="item in menu.list" :key="item.menuId" :menu="item" :dynamic-menu-routes="dynamicMenuRoutes" />
  </el-submenu>
  <el-menu-item v-else :index="menu.menuId + ''" @click="gotoRouteHandle(menu)">
    <span>{{ menu.name }}</span>
  </el-menu-item>
</template>

<script setup lang="ts" name="IndexAsideSub">
import { useRouter } from 'vue-router'

interface MenuItem {
  menuId: number | string
  name: string
  list?: MenuItem[]
}

interface Props {
  menu: MenuItem
  dynamicMenuRoutes: any[]
}

const props = defineProps<Props>()

const router = useRouter()

function gotoRouteHandle(menu: MenuItem) {
  const route = props.dynamicMenuRoutes.filter(item => item.meta?.menuId === menu.menuId)
  if (route.length >= 1) {
    if (route[0].component != null) {
      router.replace({ name: route[0].name as string })
    } else {
      router.push({ name: '404' })
    }
  }
}
</script>
