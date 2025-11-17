<template>
  <div
    id="tags-view-container"
    class="tags-view-container"
    :style="{
      padding: '0px 0px 0',
      margin: '0px auto 0',
      borderColor: '#000',
      overflow: 'hidden',
      background: 'none',
      borderWidth: '0 0 2px',
      display: 'block',
      width: 'calc(100% - 60px)',
      fontSize: '14px',
      borderStyle: 'solid',
      height: 'auto',
    }"
  >
    <ScrollPane ref="scrollPaneRef" class="tags-view-wrapper">
      <div
        class="tags-view-box"
        :style="{ width: 'auto', whiteSpace: 'nowrap', position: 'relative', background: 'none' }"
      >
        <router-link
          v-for="tag in visitedViews"
          ref="tagRefs"
          :key="tag.path"
          :class="isActive(tag) ? 'active' : ''"
          :to="{ path: tag.path, query: tag.query }"
          tag="span"
          class="tags-view-item"
          @click.middle="closeSelectedTag(tag)"
          @contextmenu.prevent="openMenu(tag, $event)"
        >
          <span class="text">{{ tag.name }}</span>
          <el-icon v-if="!tag.meta?.affix" class="close-icon" @click.prevent.stop="closeSelectedTag(tag)">
            <Close />
          </el-icon>
        </router-link>
      </div>
    </ScrollPane>
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li v-if="!(selectedTag.meta && selectedTag.meta.affix)" @click="closeSelectedTag(selectedTag)">Close</li>
      <li @click="closeAllTags(selectedTag)">Close All</li>
    </ul>
  </div>
</template>

<script setup lang="ts" name="TagsView">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close } from '@element-plus/icons-vue'
import { generateTitle } from '@/utils/i18n'
import menu from '@/utils/menu'
import { routes } from '@/router/routes/index'
import { useTagsViewStore } from '@/stores/tagsView'
import storage from '@/utils/storage'
import ScrollPane from './ScrollPane.vue'
import type { RouteLocationNormalized } from 'vue-router'
import type { TagView } from '@/stores/tagsView'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref<TagView>({} as TagView)
const affixTags = ref<TagView[]>([])
const routesList = ref<any[]>([])
const scrollPaneRef = ref<InstanceType<typeof ScrollPane> | null>(null)
const tagRefs = ref<any[]>([])

const visitedViews = computed(() => tagsViewStore.visitedViews)

watch(
  () => route.path,
  () => {
    addTags()
    moveToCurrentTag()
  },
)

watch(visible, value => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})

onMounted(() => {
  const menuList: any[] = []
  const menus = menu.list()
  if (menus && Array.isArray(menus)) {
    menuList.push(...menus)
  }
  const role = storage.get('role') || ''
  for (let i = 0; i < menuList.length; i++) {
    if (menuList[i].roleName == role) {
      routesList.value = menuList[i].backMenu || []
      break
    }
  }
  routesList.value = routes.concat(routesList.value)
  initTags()
  addTags()
})

onBeforeUnmount(() => {
  document.body.removeEventListener('click', closeMenu)
})

function initTags() {
  const affixTagsList = filterAffixTags(routesList.value)
  affixTags.value = affixTagsList
  for (const tag of affixTagsList) {
    // Must have tag name
    if (tag.name) {
      tagsViewStore.addVisitedView(tag)
    }
  }
}

function addTags() {
  const { name } = route
  if (name) {
    tagsViewStore.addView(route as RouteLocationNormalized)
  }
  return false
}

function moveToCurrentTag() {
  nextTick(() => {
    const tags = tagRefs.value
    for (const tag of tags) {
      if (tag?.to?.path === route.path) {
        scrollPaneRef.value?.moveToTarget(tag)
        // when query is different then update
        if (tag.to.fullPath !== route.fullPath) {
          tagsViewStore.updateVisitedView(route as RouteLocationNormalized)
        }
        break
      }
    }
  })
}

function refreshSelectedTag(view: TagView) {
  const routeView = visitedViews.value.find(v => v.path === view.path)
  if (routeView) {
    const normalized: RouteLocationNormalized = {
      ...routeView,
      name: routeView.name as string,
    } as any
    tagsViewStore.delCachedView(normalized)
    const { fullPath } = view
    nextTick(() => {
      router.replace({
        path: '/redirect' + fullPath,
      })
    })
  }
}

function closeSelectedTag(view: TagView) {
  const normalized: RouteLocationNormalized = {
    ...view,
    name: view.name as string,
  } as any
  const result = tagsViewStore.delView(normalized)
  if (isActive(view)) {
    toLastView(result.visitedViews, view)
  }
}

function closeOthersTags() {
  if (selectedTag.value) {
    const normalized: RouteLocationNormalized = {
      ...selectedTag.value,
      name: selectedTag.value.name as string,
    } as any
    router.push(selectedTag.value as any)
    tagsViewStore.delOthersViews(normalized)
    moveToCurrentTag()
  }
}

function closeAllTags(view: TagView) {
  const result = tagsViewStore.delAllViews()
  if (affixTags.value.some(tag => tag.path === view.path)) {
    return
  }
  toLastView(result.visitedViews, view)
}

function toLastView(visitedViews: TagView[], view: TagView) {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView as any)
  } else {
    // now the default is to redirect to the home page if there is no tags-view,
    // you can adjust it according to your needs.
    if (view.name === 'Dashboard') {
      // to reload home page
      router.replace({
        path: '/redirect' + view.fullPath,
      })
    } else {
      router.push('/')
    }
  }
}

function openMenu(tag: TagView, e: MouseEvent) {
  const menuMinWidth = 105
  const offsetLeft = (e.currentTarget as HTMLElement)?.getBoundingClientRect().left || 0 // container margin left
  const offsetWidth = (e.currentTarget as HTMLElement)?.offsetWidth || 0 // container width
  const maxLeft = offsetWidth - menuMinWidth // left boundary
  const leftPos = e.clientX - offsetLeft + 15 // 15: margin right

  if (leftPos > maxLeft) {
    left.value = maxLeft
  } else {
    left.value = leftPos
  }

  top.value = e.clientY
  visible.value = true
  selectedTag.value = tag
}

function closeMenu() {
  visible.value = false
}

function isActive(tag: TagView) {
  return tag.path === route.path
}

function filterAffixTags(routes: any[], basePath = '/'): TagView[] {
  const resolvePath = (parent: string, current: string) => {
    if (!current) return parent
    if (current.startsWith('/')) return current
    if (parent.endsWith('/')) return `${parent}${current}`
    return `${parent}/${current}`
  }
  let tags: TagView[] = []
  routes.forEach(route => {
    if (route.meta && route.meta.affix) {
      const tagPath = resolvePath(basePath, route.path || '')
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        query: undefined,
        meta: {
          ...route.meta,
        },
      })
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })
  return tags
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.12),
    0 0 3px 0 rgba(0, 0, 0, 0.04);

  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);

    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;

      &:hover {
        background: #eee;
      }
    }
  }
}

.tags-view-container .tags-view-wrapper .tags-view-item {
  cursor: pointer;
  padding: 0 8px;
  margin: 0 5px 0 0;
  color: #000;
  display: inline-block;
  font-size: inherit;
  border-color: #000;
  line-height: 30px;
  border-radius: 0;
  background: none;
  width: auto;
  border-width: 2px 2px 0;
  border-style: solid;
  height: 30px;
}

.tags-view-container .tags-view-wrapper .tags-view-item:hover {
  color: #589cf6;
  background: none;
  border-color: #589cf6;
  border-width: 2px 2px 0;
  border-style: solid;
}

.tags-view-container .tags-view-wrapper .tags-view-item.active {
  color: #589cf6;
  background: none;
  border-color: #589cf6;
  border-width: 2px 2px 0;
  border-style: solid;
}

.tags-view-container .tags-view-wrapper .tags-view-item .text {
  color: inherit;
  font-size: inherit;
}

.tags-view-container .tags-view-wrapper .tags-view-item .close-icon {
  color: inherit;
  font-size: inherit;
}
</style>
