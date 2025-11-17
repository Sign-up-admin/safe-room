<template>
  <div class="menu-preview">
    <!-- Vertical sidebar layout -->
    <el-scrollbar
      :wrap-class="
        isCollapse ? 'scrollbar-wrapper scrollbar-wrapper-close' : 'scrollbar-wrapper scrollbar-wrapper-open'
      "
    >
      <el-button :style="verticalStyle2[isCollapse ? 'close' : 'open'].btn.default" type="primary" @click="collapse">
        <span
          class="icon iconfont"
          :style="verticalStyle2[isCollapse ? 'close' : 'open'].btn.icon.default"
          :class="verticalStyle2[isCollapse ? 'close' : 'open'].btn.icon.text"
        ></span
        >{{ verticalStyle2[isCollapse ? 'close' : 'open'].btn.text }}
      </el-button>
      <div class="userinfo" :style="verticalStyle2[isCollapse ? 'close' : 'open'].userinfo.box.default">
        <el-image
          v-if="avatar"
          :style="verticalStyle2[isCollapse ? 'close' : 'open'].userinfo.img.default"
          :src="avatar ? baseUrl + avatar : defaultAvatar"
          fit="cover"
        ></el-image>
        <div :style="verticalStyle2[isCollapse ? 'close' : 'open'].userinfo.nickname.default">
          {{ adminName }}
        </div>
      </div>
      <el-menu
        :default-active="activeMenu"
        :unique-opened="true"
        :style="verticalStyle2[isCollapse ? 'close' : 'open'].menu.box.default"
        class="el-menu-vertical-2"
        :collapse-transition="false"
        :collapse="isCollapse"
      >
        <el-menu-item
          class="home"
          :popper-append-to-body="false"
          popper-class="home"
          :style="verticalStyle2[isCollapse ? 'close' : 'open'].home.one.box.default"
          index="/"
          @click="menuHandler('')"
        >
          <div class="el-tooltip">
            <i
              :style="verticalStyle2[isCollapse ? 'close' : 'open'].home.one.icon.default"
              class="icon iconfont icon-shouye-zhihui"
            ></i>
            <span :style="verticalStyle2[isCollapse ? 'close' : 'open'].home.one.title.default">{{
              verticalStyle2.open.home.one.title.text
            }}</span>
          </div>
        </el-menu-item>
        <el-submenu
          class="user"
          popper-class="user"
          :popper-append-to-body="false"
          :style="verticalStyle2[isCollapse ? 'close' : 'open'].user.one.box.default"
          index="1"
        >
          <template #title>
            <i
              :style="verticalStyle2[isCollapse ? 'close' : 'open'].user.one.icon.default"
              class="icon iconfont icon-kuaijiezhifu"
            ></i>
            <span :style="verticalStyle2[isCollapse ? 'close' : 'open'].user.one.title.default">{{
              verticalStyle2.open.user.one.title.text
            }}</span>
          </template>
          <el-menu-item index="/updatePassword" @click="menuHandler('updatePassword')">Change Password</el-menu-item>
          <el-menu-item index="/center" @click="menuHandler('center')">Personal Information</el-menu-item>
        </el-submenu>
        <template v-for="(menu, index) in menuList?.backMenu || []" :key="'menu-' + index">
          <el-submenu
            v-if="menu.child.length > 1 || !verticalIsMultiple"
            :key="'submenu-' + index"
            class="other"
            popper-class="other"
            :popper-append-to-body="false"
            :style="verticalStyle2[isCollapse ? 'close' : 'open'].menu.one.box.default"
            :index="index + 2 + ''"
          >
            <template #title>
              <i
                :style="verticalStyle2[isCollapse ? 'close' : 'open'].menu.one.icon.default"
                class="el-icon-menu"
                :class="icons[index]"
              ></i>
              <span :style="verticalStyle2[isCollapse ? 'close' : 'open'].menu.one.title.default">{{
                menu.menu + (verticalFlag ? ' Management' : '')
              }}</span>
            </template>
            <el-menu-item
              v-for="(child, sort) in menu.child"
              :key="sort"
              :index="'/' + child.tableName"
              @click="menuHandler(child.tableName)"
              >{{ child.menu }}</el-menu-item>
            >
          </el-submenu>
          <el-menu-item
            v-if="menu.child.length <= 1 && verticalIsMultiple"
            :key="'menuitem-' + index"
            class="other"
            popper-class="other"
            :style="verticalStyle2[isCollapse ? 'close' : 'open'].menu.one.box.default"
            :index="'/' + menu.child[0].tableName"
            @click="menuHandler(menu.child[0].tableName)"
          >
            <div class="el-tooltip">
              <i
                :style="verticalStyle2[isCollapse ? 'close' : 'open'].menu.one.icon.default"
                class="el-icon-menu"
                :class="icons[index]"
              ></i>
              <span :style="verticalStyle2[isCollapse ? 'close' : 'open'].menu.one.title.default">{{
                menu.child[0].menu + (verticalFlag ? ' Management' : '')
              }}</span>
            </div>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts" name="IndexAsideStatic">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import menu from '@/utils/menu'
import { VERTICAL_STYLE_2 } from '@/constants/sidebarStyles'
import http from '@/utils/http'
import storage from '@/utils/storage'
import base from '@/utils/base'
import defaultAvatarUrl from '@/assets/img/avator.png'

interface MenuItem {
  menu: string
  child: Array<{
    menu: string
    tableName: string
  }>
}

interface MenuList {
  backMenu: MenuItem[]
  roleName?: string
}

interface Props {
  isCollapse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCollapse: false,
})

const emit = defineEmits<{
  (e: 'oncollapsechange', value: boolean): void
}>()

const route = useRoute()
const router = useRouter()

const menuList = ref<MenuList>({ backMenu: [] })
const dynamicMenuRoutes = ref<Array<{ name?: string; component?: any; meta?: { menuId?: number } }>>([])
const role = ref('')
const user = ref<Record<string, any> | null>(null)
const avatar = ref('')
const verticalFlag = ref(false)
const localCollapse = ref(props.isCollapse)
const isCollapse = computed(() => props.isCollapse ?? localCollapse.value)
const verticalStyle2 = VERTICAL_STYLE_2
const verticalIsMultiple = ref(true)
const menulistBorderBottom = ref({})

const icons = ref([
  'el-icon-s-cooperation',
  'el-icon-s-order',
  'el-icon-s-platform',
  'el-icon-s-fold',
  'el-icon-s-unfold',
  'el-icon-s-operation',
  'el-icon-s-promotion',
  'el-icon-s-release',
  'el-icon-s-ticket',
  'el-icon-s-management',
  'el-icon-s-open',
  'el-icon-s-shop',
  'el-icon-s-marketing',
  'el-icon-s-flag',
  'el-icon-s-comment',
  'el-icon-s-finance',
  'el-icon-s-claim',
  'el-icon-s-custom',
  'el-icon-s-opportunity',
  'el-icon-s-data',
  'el-icon-s-check',
  'el-icon-s-grid',
  'el-icon-menu',
  'el-icon-chat-dot-square',
  'el-icon-message',
  'el-icon-postcard',
  'el-icon-position',
  'el-icon-microphone',
  'el-icon-close-notification',
  'el-icon-bangzhu',
  'el-icon-time',
  'el-icon-odometer',
  'el-icon-crop',
  'el-icon-aim',
  'el-icon-switch-button',
  'el-icon-full-screen',
  'el-icon-copy-document',
  'el-icon-mic',
  'el-icon-stopwatch',
])

const baseUrl = computed(() => base.get().url)
const adminName = computed(() => storage.get('adminName') || '')
const defaultAvatar = defaultAvatarUrl

const activeMenu = computed(() => {
  const { meta, path } = route
  // If activeMenu is set in meta, use it to highlight the sidebar
  if (meta?.activeMenu) {
    return meta.activeMenu as string
  }
  return path
})

watch(avatar, () => {
  // Force update when avatar changes
  nextTick()
})

onMounted(() => {
  // Shuffle icons
  icons.value.sort(() => 0.5 - Math.random())

  const menus = menu.list()
  if (menus && menus.length > 0) {
    // 如果 menus 是数组，需要根据 role 找到对应的菜单项
    if (Array.isArray(menus)) {
      role.value = storage.get('role')
      for (let i = 0; i < menus.length; i++) {
        const item = menus[i] as any
        if (item.roleName == role.value) {
          menuList.value = item
          break
        }
      }
      // 如果没找到匹配的，使用第一个或者默认结构
      if (Array.isArray(menuList.value)) {
        menuList.value = (menus[0] as any) || { backMenu: [] }
      }
    } else {
      menuList.value = menus as any
    }
  } else {
    const params = {
      page: 1,
      limit: 1,
      sort: 'id',
    }

    http
      .get('/menu/list', { params })
      .then(response => {
        const data = response.data
        if (data && data.code === 0) {
          const parsedMenus = JSON.parse(data.data.list[0].menujson)
          storage.set('menus', parsedMenus)

          // 如果解析结果是数组，需要根据 role 找到对应的菜单项
          if (Array.isArray(parsedMenus)) {
            role.value = storage.get('role')
            for (let i = 0; i < parsedMenus.length; i++) {
              const item = parsedMenus[i] as any
              if (item.roleName == role.value) {
                menuList.value = item
                break
              }
            }
            // 如果没找到匹配的，使用第一个或者默认结构
            if (Array.isArray(menuList.value) || !menuList.value) {
              menuList.value = (parsedMenus[0] as any) || { backMenu: [] }
            }
          } else {
            menuList.value = parsedMenus
          }
        }
      })
      .catch(error => {
        console.error('Failed to fetch menu list:', error)
      })
  }

  // 确保 menuList.value 始终有 backMenu 属性
  if (!menuList.value || !menuList.value.backMenu) {
    menuList.value = { backMenu: [] }
  }

  styleChange()

  const sessionTable = storage.get('sessionTable')
  if (sessionTable) {
    http
      .get(`/${sessionTable}/session`)
      .then(response => {
        const data = response.data
        if (data && data.code === 0) {
          if (sessionTable == 'yonghu') {
            avatar.value = data.data.touxiang
          }
          if (sessionTable == 'jianshenjiaolian') {
            avatar.value = data.data.zhaopian
          }
          if (sessionTable == 'users') {
            avatar.value = data.data.image
          }
          user.value = data.data
        } else {
          ElMessage.error(data.msg)
        }
      })
      .catch(error => {
        console.error('Failed to fetch user session:', error)
      })
  }
})

function collapse() {
  localCollapse.value = !localCollapse.value
  emit('oncollapsechange', localCollapse.value)
}

function styleChange() {
  nextTick(() => {
    document.querySelectorAll('.el-menu-vertical-2 .el-submenu .el-menu').forEach(el => {
      el.removeAttribute('style')
      const icon = { border: 'none', display: 'none' }
      Object.keys(icon).forEach(key => {
        ;(el as HTMLElement).style[key as any] = icon[key as keyof typeof icon]
      })
    })
  })
}

function menuHandler(name: string) {
  const path = '/' + name
  router.push(path)
}
</script>

<style lang="scss" scoped>
.menu-preview {
  .el-scrollbar {
    height: 100%;

    & :deep() .scrollbar-wrapper {
      overflow-x: hidden;
    }

    // 竖向
    .el-menu-vertical-demo {
      .el-submenu:first-of-type :deep() .el-submenu__title .el-submenu__icon-arrow {
        display: none;
      }
    }

    .el-menu-vertical-demo > .el-menu-item {
      cursor: pointer;
      padding: 0 20px;
      color: #333;
      white-space: nowrap;
      background: #fff;
      position: relative;
    }

    .el-menu-vertical-demo > .el-menu-item:hover {
      color: #fff;
      background: blue;
    }

    .el-menu-vertical-demo .el-submenu :deep() .el-submenu__title {
      cursor: pointer;
      padding: 0 20px;
      color: #333;
      white-space: nowrap;
      background: #fff;
      position: relative;
    }

    .el-menu-vertical-demo .el-submenu :deep() .el-submenu__title:hover {
      color: #fff;
      background: blue;
    }

    .el-menu-vertical-demo .el-submenu :deep() .el-submenu__title .el-submenu__icon-arrow {
      margin: -7px 0 0;
      top: 50%;
      color: inherit;
      vertical-align: middle;
      font-size: 12px;
      position: absolute;
      right: 20px;
    }

    .el-menu-vertical-demo .el-submenu {
      padding: 0;
      margin: 0;
      list-style: none;
    }

    // .el-menu-vertical-demo .el-submenu :deep() .el-menu {
    //         //     border: none;
    //         //     display: none;
    //         // }

    .el-menu-vertical-demo .el-submenu :deep() .el-menu .el-menu-item {
      padding: 0 40px;
      color: #666;
      background: #fff;
      line-height: 50px;
      height: 50px;
    }

    .el-menu-vertical-demo .el-submenu :deep() .el-menu .el-menu-item:hover {
      padding: 0 40px;
      color: #fff;
      background: red;
      line-height: 50px;
      height: 50px;
    }

    .el-menu-vertical-demo .el-submenu :deep() .el-menu .el-menu-item.is-active {
      padding: 0 40px;
      color: #fff;
      background: blue;
      line-height: 50px;
      height: 50px;
    }

    // 竖向
  }
}

// 竖向 样式 open
.scrollbar-wrapper-open .el-menu-vertical-2 > .el-menu-item.other {
  font-size: inherit;
  background: none;
}
.scrollbar-wrapper-open .el-menu-vertical-2 > .el-menu-item.home {
  font-size: inherit;
  background: none;
}
.scrollbar-wrapper-open .el-menu-vertical-2 > .el-menu-item.other > .el-tooltip {
  cursor: pointer;
  border: 0 solid rgba(3, 152, 15, 0.2);
  border-radius: 0;
  padding: 20px;
  color: #fff;
  white-space: nowrap;
  background: none;
  font-size: 16px;
  line-height: 1.2;
  position: relative;
  height: auto;
}

.scrollbar-wrapper-open .el-menu-vertical-2 > .el-menu-item.other > .el-tooltip:hover {
  color: #bbccde !important;
  background: #333 !important;
  height: auto !important;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.other :deep() .el-submenu__title {
  cursor: pointer !important;
  border: 0 solid rgba(3, 152, 15, 0.2) !important;
  border-radius: 0 !important;
  padding: 20px !important;
  color: #fff !important;
  white-space: nowrap !important;
  background: none !important;
  font-size: 16px !important;
  line-height: 1.2 !important;
  position: relative !important;
  height: auto !important;
}
.scrollbar-wrapper-open .el-menu-vertical-2 > .el-menu-item.other.is-active > .el-tooltip {
  color: #bbccde !important;
  background: #333 !important;
  height: auto !important;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.other :deep() .el-submenu__title:hover {
  color: #bbccde !important;
  background: #333 !important;
  height: auto !important;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.other.is-active :deep() .el-submenu__title {
  color: #bbccde !important;
  background: #333 !important;
  height: auto !important;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.other :deep() .el-submenu__title .iconfont {
  margin: 0 3px;
  color: inherit;
  display: block;
  width: 100%;
  font-size: 60px;
  text-align: center;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.other :deep() .el-submenu__title .el-submenu__icon-arrow {
  margin: -7px 0 0;
  top: 50%;
  color: inherit;
  display: none;
  vertical-align: middle;
  font-size: inherit;
  position: absolute;
  right: 20px;
}

.scrollbar-wrapper-open .el-menu-vertical-2 :deep() .el-submenu.other .el-menu {
  border: 0 solid rgba(3, 152, 15, 0.2);
  border-radius: 0;
  margin: 0;
  background: none;
  width: auto;
  font-size: inherit;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.other .el-menu .el-menu-item {
  padding: 0 10px !important;
  margin: 0 !important;
  color: #ccc !important;
  font-size: inherit !important;
  border-color: rgba(126, 96, 16, 0.2) !important;
  line-height: 50px !important;
  border-radius: 0 !important;
  background: none !important;
  width: auto !important;
  border-width: 0 !important;
  border-style: dashed !important;
  text-align: center !important;
  height: 50px !important;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.other .el-menu .el-menu-item:hover {
  padding: 0 10px !important;
  color: #fff !important;
  background: rgba(255, 255, 255, 0.3) !important;
  width: auto !important;
  line-height: 50px !important;
  height: 50px !important;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.other .el-menu .el-menu-item.is-active {
  padding: 0 10px !important;
  color: #fff !important;
  background: rgba(255, 255, 255, 0.3) !important;
  width: auto !important;
  line-height: 50px !important;
  height: 50px !important;
}

// 竖向 样式 close
.scrollbar-wrapper-close .el-menu-vertical-2 > .el-menu-item.other > .el-tooltip {
  cursor: pointer;
  padding: 0 8px;
  color: #c1d2e2;
  white-space: nowrap;
  background: none;
  font-size: inherit;
  position: relative;
}

.scrollbar-wrapper-close .el-menu-vertical-2 > .el-menu-item.other > .el-tooltip:hover {
  color: #c1d2e2;
  background: #263445;
}

.scrollbar-wrapper-close .el-menu-vertical-2 > .el-menu-item.other.is-active > .el-tooltip {
  color: #c1d2e2;
  background: #263445;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.other :deep() .el-submenu__title {
  cursor: pointer !important;
  padding: 0 8px !important;
  color: #c1d2e2 !important;
  white-space: nowrap !important;
  background: none !important;
  font-size: inherit !important;
  position: relative !important;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.other :deep() .el-submenu__title:hover {
  color: #c1d2e2 !important;
  background: #263445 !important;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.other :deep() .el-submenu__title .iconfont {
  margin: 0;
  color: #fff;
  display: inline-block;
  vertical-align: middle;
  width: 42px;
  font-size: 24px;
  text-align: center;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.other :deep() .el-submenu__title .el-submenu__icon-arrow {
  margin: -7px 0 0;
  top: 50%;
  color: inherit;
  display: none;
  vertical-align: middle;
  font-size: 12px;
  position: absolute;
  right: 20px;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.other .el-menu {
  border: none;
  border-radius: 0;
  padding: 0;
  margin: 0 0 0 3px;
  font-size: inherit;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.other .el-menu--vertical.other .el-menu-item {
  border: 0 solid #fbbe62;
  background-color: #304156;
  padding: 0;
  color: #c1d2e2;
  font-size: 14px;
  line-height: 40px;
  text-align: center;
  height: 40px;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.other .el-menu--vertical.other .el-menu-item:hover {
  border: 0 solid #fbbe62;
  padding: 0;
  color: #c1d2e2;
  background: #263445 !important;
  line-height: 40px;
  text-align: center;
  height: 40px;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.other .el-menu--vertical.other .el-menu-item.is-active {
  border: 0 solid #fbbe62;
  padding: 0;
  color: #c1d2e2;
  background: #1f2d3e !important;
  line-height: 40px;
  text-align: center;
  height: 40px;
}

// 竖向 样式 open-首页
.scrollbar-wrapper-open .el-menu-vertical-2 > .el-menu-item.home > .el-tooltip {
  cursor: pointer;
  border: 0 solid rgba(3, 152, 15, 0.2);
  border-radius: 0;
  padding: 20px;
  color: #fff;
  white-space: nowrap;
  background: none;
  font-size: 16px;
  line-height: 1.2;
  position: relative;
  height: auto;
}

.scrollbar-wrapper-open .el-menu-vertical-2 > .el-menu-item.home > .el-tooltip:hover {
  color: #bbccde;
  background: #333;
  height: auto;
}

.scrollbar-wrapper-open .el-menu-vertical-2 > .el-menu-item.home.is-active > .el-tooltip {
  color: #bbccde;
  background: #333;
  height: auto;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.home :deep() .el-submenu__title {
  cursor: pointer !important;
  border: 0 solid rgba(3, 152, 15, 0.2) !important;
  border-radius: 0 !important;
  padding: 20px !important;
  color: #fff !important;
  white-space: nowrap !important;
  background: none !important;
  font-size: 16px !important;
  line-height: 1.2 !important;
  position: relative !important;
  height: auto !important;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.home :deep() .el-submenu__title:hover {
  color: #bbccde !important;
  background: #333 !important;
  height: auto !important;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.home :deep() .el-submenu__title .iconfont {
  margin: 0 3px;
  color: inherit;
  display: block;
  width: 100%;
  font-size: 60px;
  text-align: center;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.home :deep() .el-submenu__title .el-submenu__icon-arrow {
  margin: -7px 0 0;
  top: 50%;
  color: inherit;
  display: none;
  vertical-align: middle;
  font-size: inherit;
  position: absolute;
  right: 20px;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.home .el-menu {
  border: 0 solid rgba(3, 152, 15, 0.2);
  border-radius: 0;
  margin: 0;
  background: none;
  width: auto;
  font-size: inherit;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.home .el-menu .el-menu-item {
  padding: 0 10px;
  margin: 0;
  color: #ccc;
  font-size: inherit;
  border-color: rgba(126, 96, 16, 0.2);
  line-height: 50px;
  border-radius: 0;
  background: none;
  width: auto;
  border-width: 0;
  border-style: dashed;
  text-align: center;
  height: 50px;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.home .el-menu .el-menu-item:hover {
  padding: 0 10px;
  color: #fff;
  background: rgba(255, 255, 255, 0.3);
  width: auto;
  line-height: 50px;
  height: 50px;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.home .el-menu .el-menu-item.is-active {
  padding: 0 10px;
  color: #fff;
  background: rgba(255, 255, 255, 0.3);
  width: auto;
  line-height: 50px;
  height: 50px;
}

// 竖向 样式 close-首页
.scrollbar-wrapper-close .el-menu-vertical-2 > .el-menu-item.home > .el-tooltip {
  cursor: pointer;
  padding: 0 8px;
  color: #c1d2e2;
  white-space: nowrap;
  background: none;
  font-size: inherit;
  position: relative;
}

.scrollbar-wrapper-close .el-menu-vertical-2 > .el-menu-item.home > .el-tooltip:hover {
  color: #c1d2e2;
  background: #263445;
}

.scrollbar-wrapper-close .el-menu-vertical-2 > .el-menu-item.home.is-active > .el-tooltip {
  color: #c1d2e2;
  background: #263445;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.home :deep() .el-submenu__title {
  cursor: pointer;
  padding: 0 8px;
  color: #c1d2e2;
  white-space: nowrap;
  background: none;
  font-size: inherit;
  position: relative;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.home :deep() .el-submenu__title:hover {
  color: #c1d2e2;
  background: #263445;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.home :deep() .el-submenu__title .iconfont {
  margin: 0;
  color: #fff;
  display: inline-block;
  vertical-align: middle;
  width: 42px;
  font-size: 24px;
  text-align: center;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.home :deep() .el-submenu__title .el-submenu__icon-arrow {
  margin: -7px 0 0;
  top: 50%;
  color: inherit;
  display: none;
  vertical-align: middle;
  font-size: 12px;
  position: absolute;
  right: 20px;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.home .el-menu {
  border: none;
  border-radius: 0;
  padding: 0;
  margin: 0 0 0 3px;
  font-size: inherit;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.home .el-menu--vertical.home .el-menu-item {
  border: 0 solid #fbbe62;
  background-color: #304156;
  padding: 0;
  color: #c1d2e2;
  font-size: 14px;
  line-height: 40px;
  text-align: center;
  height: 40px;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.home .el-menu--vertical.home .el-menu-item:hover {
  border: 0 solid #fbbe62;
  padding: 0;
  color: #c1d2e2;
  background: #263445 !important;
  line-height: 40px;
  text-align: center;
  height: 40px;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.home .el-menu--vertical.home .el-menu-item.is-active {
  border: 0 solid #fbbe62;
  padding: 0;
  color: #c1d2e2;
  background: #1f2d3e !important;
  line-height: 40px;
  text-align: center;
  height: 40px;
}

// 竖向 样式 open-个人中心
.scrollbar-wrapper-open .el-menu-vertical-2 > .el-menu-item.user > .el-tooltip {
  cursor: pointer;
  border: 0 solid rgba(3, 152, 15, 0.2);
  border-radius: 0;
  padding: 20px;
  color: #fff;
  white-space: nowrap;
  background: none;
  font-size: 16px;
  line-height: 1.2;
  position: relative;
  height: auto;
}

.scrollbar-wrapper-open .el-menu-vertical-2 > .el-menu-item.user > .el-tooltip:hover {
  color: #bbccde;
  background: #333;
  height: auto;
}

.scrollbar-wrapper-open .el-menu-vertical-2 > .el-menu-item.user.is-active > .el-tooltip {
  color: #bbccde;
  background: #333;
  height: auto;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.user :deep() .el-submenu__title {
  cursor: pointer !important;
  border: 0 solid rgba(3, 152, 15, 0.2) !important;
  border-radius: 0 !important;
  padding: 20px !important;
  color: #fff !important;
  white-space: nowrap !important;
  background: none !important;
  font-size: 16px !important;
  line-height: 1.2 !important;
  position: relative !important;
  height: auto !important;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.user :deep() .el-submenu__title:hover {
  color: #bbccde !important;
  background: #333 !important;
  height: auto !important;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.user :deep() .el-submenu__title .iconfont {
  margin: 0 3px;
  color: inherit;
  display: block;
  width: 100%;
  font-size: 60px;
  text-align: center;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.user :deep() .el-submenu__title .el-submenu__icon-arrow {
  margin: -7px 0 0;
  top: 50%;
  color: inherit;
  display: none;
  vertical-align: middle;
  font-size: inherit;
  position: absolute;
  right: 20px;
}

.scrollbar-wrapper-open .el-menu-vertical-2 :deep() .el-submenu.user .el-menu {
  border: 0 solid rgba(3, 152, 15, 0.2);
  border-radius: 0;
  margin: 0;
  background: none;
  width: auto;
  font-size: inherit;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.user .el-menu .el-menu-item {
  padding: 0 10px !important;
  margin: 0 !important;
  color: #ccc !important;
  font-size: inherit !important;
  border-color: rgba(126, 96, 16, 0.2) !important;
  line-height: 50px !important;
  border-radius: 0 !important;
  background: none !important;
  width: auto !important;
  border-width: 0 !important;
  border-style: dashed !important;
  text-align: center !important;
  height: 50px !important;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.user .el-menu .el-menu-item:hover {
  padding: 0 10px !important;
  color: #fff !important;
  background: rgba(255, 255, 255, 0.3) !important;
  width: auto !important;
  line-height: 50px !important;
  height: 50px !important;
}

.scrollbar-wrapper-open .el-menu-vertical-2 .el-submenu.user .el-menu .el-menu-item.is-active {
  padding: 0 10px !important;
  color: #fff !important;
  background: rgba(255, 255, 255, 0.3) !important;
  width: auto !important;
  line-height: 50px !important;
  height: 50px !important;
}

// 竖向 样式 close-个人中心
.scrollbar-wrapper-close .el-menu-vertical-2 > .el-menu-item.user > .el-tooltip {
  cursor: pointer;
  padding: 0 8px;
  color: #c1d2e2;
  white-space: nowrap;
  background: none;
  font-size: inherit;
  position: relative;
}

.scrollbar-wrapper-close .el-menu-vertical-2 > .el-menu-item.user > .el-tooltip:hover {
  color: #c1d2e2;
  background: #263445;
}

.scrollbar-wrapper-close .el-menu-vertical-2 > .el-menu-item.user.is-active > .el-tooltip {
  color: #c1d2e2;
  background: #263445;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.user :deep() .el-submenu__title {
  cursor: pointer !important;
  padding: 0 8px !important;
  color: #c1d2e2 !important;
  white-space: nowrap !important;
  background: none !important;
  font-size: inherit !important;
  position: relative !important;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.user :deep() .el-submenu__title:hover {
  color: #c1d2e2 !important;
  background: #263445 !important;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.user :deep() .el-submenu__title .iconfont {
  margin: 0;
  color: #fff;
  display: inline-block;
  vertical-align: middle;
  width: 42px;
  font-size: 24px;
  text-align: center;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.user :deep() .el-submenu__title .el-submenu__icon-arrow {
  margin: -7px 0 0;
  top: 50%;
  color: inherit;
  display: none;
  vertical-align: middle;
  font-size: 12px;
  position: absolute;
  right: 20px;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.user .el-menu {
  border: none;
  border-radius: 0;
  padding: 0;
  margin: 0 0 0 3px;
  font-size: inherit;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.user .el-menu--vertical.user .el-menu-item {
  border: 0 solid #fbbe62;
  background-color: #304156;
  padding: 0;
  color: #c1d2e2;
  font-size: 14px;
  line-height: 40px;
  text-align: center;
  height: 40px;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.user .el-menu--vertical.user .el-menu-item:hover {
  border: 0 solid #fbbe62;
  padding: 0;
  color: #c1d2e2;
  background: #263445 !important;
  line-height: 40px;
  text-align: center;
  height: 40px;
}

.scrollbar-wrapper-close .el-menu-vertical-2 .el-submenu.user .el-menu--vertical.user .el-menu-item.is-active {
  border: 0 solid #fbbe62;
  padding: 0;
  color: #c1d2e2;
  background: #1f2d3e !important;
  line-height: 40px;
  text-align: center;
  height: 40px;
}
</style>
