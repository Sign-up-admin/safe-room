<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar">
      <div class="sidebar-header">
        <h1 v-if="!isCollapse" class="logo">健身房管理系统</h1>
        <h1 v-else class="logo-collapsed">GYM</h1>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        
        <el-menu-item index="/yonghu">
          <el-icon><UserFilled /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        
        <el-menu-item index="/jianshenjiaolian">
          <el-icon><Avatar /></el-icon>
          <template #title>健身教练</template>
        </el-menu-item>
        
        <el-menu-item index="/center">
          <el-icon><UserFilled /></el-icon>
          <template #title>个人中心</template>
        </el-menu-item>
        
        <el-menu-item index="/updatePassword">
          <el-icon><Lock /></el-icon>
          <template #title>修改密码</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            :icon="isCollapse ? Expand : Fold"
            circle
            @click="toggleSidebar"
          />
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ userStore.displayName || '管理员' }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="center">个人中心</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled,
  UserFilled,
  Avatar,
  Lock,
  Fold,
  Expand,
  ArrowDown
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { logout } from '@/utils/auth'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)

const activeMenu = computed(() => {
  return route.path
})

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'center':
      router.push('/center')
      break
    case 'password':
      router.push('/updatePassword')
      break
    case 'logout':
      logout()
      ElMessage.success('已退出登录')
      router.push('/login')
      break
  }
}

onMounted(() => {
  // 检查用户是否已登录
  if (!userStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/mixins';

.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid var(--color-border-light);
  transition: width var(--duration-300) var(--ease-in-out);
  overflow: hidden;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--gradient-primary);
  color: var(--color-text-inverse);

  .logo {
    font-size: var(--font-size-body-lg);
    font-weight: var(--font-weight-semibold);
    margin: 0;
    white-space: nowrap;
  }

  .logo-collapsed {
    font-size: var(--font-size-body-md);
    font-weight: var(--font-weight-bold);
    margin: 0;
  }
}

.sidebar-menu {
  border: none;
  height: calc(100vh - 64px);
  overflow-y: auto;

  :deep(.el-menu-item) {
    height: 56px;
    line-height: 56px;
    margin: var(--space-1) var(--space-2);
    border-radius: var(--radius-lg);
    transition: all var(--duration-200) var(--ease-in-out);

    &:hover {
      background: rgba(59, 130, 246, 0.1);
    }

    &.is-active {
      background: var(--gradient-primary);
      color: var(--color-text-inverse);

      .el-icon {
        color: var(--color-text-inverse);
      }
    }
  }
}

.main-container {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
}

.header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  transition: all var(--duration-200) var(--ease-in-out);

  &:hover {
    background: var(--color-bg-tertiary);
  }

  .username {
    font-size: var(--font-size-body-md);
    color: var(--color-text-primary);
  }
}

.main-content {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
  background: var(--color-bg-secondary);
}

// 响应式设计
@include respond-to(md) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(0);
    transition: transform var(--duration-300) var(--ease-in-out);

    &.is-collapse {
      transform: translateX(-100%);
    }
  }

  .main-container {
    margin-left: 0;
  }
}
</style>
