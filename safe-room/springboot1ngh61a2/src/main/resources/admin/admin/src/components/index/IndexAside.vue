<template>
  <el-aside class="index-aside" width="200px">
    <div class="index-aside-inner">
      <el-menu default-active="1" class="admin-menu">
        <el-menu-item index="1" @click="menuHandler('/')"> 首页 </el-menu-item>
        <SubMenu v-for="menu in menuList" :key="menu.menuId" :menu="menu" :dynamic-menu-routes="dynamicMenuRoutes" />
      </el-menu>
    </div>
  </el-aside>
</template>

<script setup lang="ts" name="IndexAside">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import SubMenu from '@/components/index/IndexAsideSub.vue'

const router = useRouter()
const menuList = ref<MenuRole[]>([])
const dynamicMenuRoutes = ref<MenuRole[]>([])

function menuHandler(path: string) {
  router.push({ path })
}

onMounted(() => {
  // 获取动态菜单数据并且渲染
  menuList.value = JSON.parse(sessionStorage.getItem('menuList') || '[]')
  dynamicMenuRoutes.value = JSON.parse(sessionStorage.getItem('dynamicMenuRoutes') || '[]')
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens' as *;
@use '@/styles/mixins' as *;

.index-aside {
  margin-top: 80px;
  overflow: hidden;

  .index-aside-inner {
    width: 217px;
    height: 100%;
    overflow-y: scroll;
  }
}

.admin-menu {
  background: transparent;
  border: none;

  :deep(.el-menu-item) {
    color: $color-text-primary;

    &:hover {
      background: rgba(58, 128, 255, 0.15);
      color: $color-primary;
    }

    &.is-active {
      background: rgba(58, 128, 255, 0.2);
      color: $color-primary;
    }
  }
}
</style>
