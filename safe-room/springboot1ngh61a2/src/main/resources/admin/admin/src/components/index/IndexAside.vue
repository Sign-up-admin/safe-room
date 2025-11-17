<template>
  <el-aside class="index-aside" width="200px">
    <div class="index-aside-inner">
      <el-menu default-active="1" class="admin-menu">
        <el-menu-item index="1" @click="menuHandler('/')"> 首页 </el-menu-item>
        <SubMenu v-for="menu in convertToSubMenuFormat(menuList)" :key="menu.menuId" :menu="menu" :dynamic-menu-routes="convertToSubMenuFormat(dynamicMenuRoutes)" />
      </el-menu>
    </div>
  </el-aside>
</template>

<script setup lang="ts" name="IndexAside">
import { useRouter } from 'vue-router'
import SubMenu from '@/components/index/IndexAsideSub.vue'
import type { MenuRole } from '@/types/menu'
import { useMenuStore } from '@/stores/menu'

// 定义SubMenu期望的菜单项接口
interface SubMenuItem {
  menuId: number | string
  name: string
  list?: SubMenuItem[]
}

const router = useRouter()
const menuStore = useMenuStore()

// 使用store的响应式状态
const { menuList, dynamicMenuRoutes } = menuStore

// 转换MenuRole为SubMenu期望的格式
function convertToSubMenuFormat(menuRoles: MenuRole[]): SubMenuItem[] {
  return menuRoles.map((role, roleIndex) => ({
    menuId: roleIndex,
    name: role.roleName,
    list: role.backMenu.map((menuItem, menuIndex) => ({
      menuId: `${roleIndex}-${menuIndex}`,
      name: menuItem.menu,
      list: menuItem.child.map((child, childIndex) => ({
        menuId: `${roleIndex}-${menuIndex}-${childIndex}`,
        name: child.menu
      }))
    }))
  }))
}

function menuHandler(path: string) {
  router.push({ path })
}
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
