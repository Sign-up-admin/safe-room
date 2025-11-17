<template>
  <div class="navbar">
    <div class="title">
      <span class="title-name">{{ projectName }}</span>
    </div>

    <el-dropdown trigger="click" class="user-dropdown" @command="handleCommand">
      <div class="el-dropdown-link">
        <el-image v-if="user" class="avatar" :src="avatar ? baseUrl + avatar : defaultAvatar" fit="cover" />
        <span class="username">{{ adminName }}</span>
        <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="top-el-dropdown-menu">
          <el-dropdown-item class="item1" command="">Home</el-dropdown-item>
          <el-dropdown-item class="item2" command="center">User Info</el-dropdown-item>
          <el-dropdown-item v-if="role !== 'Administrator'" class="item3" command="front">
            Visit Frontend
          </el-dropdown-item>
          <el-dropdown-item class="item4" command="logout">Logout</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts" name="IndexHeader">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { User, FitnessCoach } from '@/types/api'
import { useTagsViewStore } from '@/stores/tagsView'
import { useUserStore } from '@/stores/user'
import http from '@/utils/http'
import storage from '@/utils/storage'
import base from '@/utils/base'

const router = useRouter()
const tagsViewStore = useTagsViewStore()
const userStore = useUserStore()

const user = ref<User | FitnessCoach | null>(null)
const projectName = computed(() => base.getProjectName())
const baseUrl = computed(() => base.get().url)
const adminName = computed(() => storage.get('adminName') || '')
const role = computed(() => userStore.userRole || '')

const avatar = computed(() => storage.get('headportrait') || '')

// 处理测试环境中的URL构造问题
const defaultAvatar = (() => {
  try {
    return new URL('@/assets/img/avator.png', import.meta.url).href
  } catch (error) {
    // 测试环境fallback
    return '/assets/img/avator.png'
  }
})()

function handleCommand(name: string) {
  if (name === 'front') {
    onIndexTap()
  } else if (name === 'logout') {
    onLogout()
  } else {
    router.push(`/${name}`)
  }
}

function onLogout() {
  storage.clear()
  tagsViewStore.delAllViews()
  router.replace({
    name: 'login',
  })
}

function onIndexTap() {
  window.location.href = base.get().indexUrl
}

onMounted(() => {
  const sessionTable = storage.get('sessionTable')
  if (sessionTable) {
    http
      .get(`/${sessionTable}/session`)
      .then(response => {
        const data = response.data
        if (data && data.code === 0) {
          if (sessionTable === 'yonghu') {
            storage.set('headportrait', data.data.touxiang)
          }
          if (sessionTable === 'jianshenjiaolian') {
            storage.set('headportrait', data.data.zhaopian)
          }
          if (sessionTable === 'users') {
            storage.set('headportrait', data.data.image)
          }
          storage.set('userForm', JSON.stringify(data.data))
          user.value = data.data
          storage.set('userid', data.data.id)
        } else {
          ElMessage.error(data.msg)
        }
      })
      .catch(error => {
        console.error('Failed to fetch user session:', error)
      })
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens' as *;
@use '@/styles/mixins' as *;

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.title {
  margin: 0 25%;
  text-align: center;
  background: none;
  display: block;
  width: 50%;
  position: absolute;
  order: 1;

  .title-name {
    padding: 0 0 0 12px;
    line-height: 44px;
    font-size: 16px;
    color: $color-text-primary;
    font-weight: 600;
  }
}

.user-dropdown {
  position: fixed;
  right: 45px;
  z-index: 9999;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color $transition-base;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .username {
    color: $color-text-primary;
    line-height: 32px;
    font-size: 14px;
  }

  .dropdown-icon {
    color: $color-text-secondary;
    font-size: 14px;
  }
}

:deep(.top-el-dropdown-menu) {
  border: 1px solid $color-border;
  border-radius: 8px;
  padding: 8px 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  margin: 8px 0;
  background: $color-panel-strong;
  backdrop-filter: blur(10px);

  .el-dropdown-menu__item {
    cursor: pointer;
    padding: 0 20px;
    margin: 0;
    outline: 0;
    color: $color-text-primary;
    background: transparent;
    font-size: 14px;
    line-height: 36px;
    transition: background-color $transition-base;

    &:hover {
      background: rgba(58, 128, 255, 0.15);
      color: $color-primary;
    }
  }
}
</style>
