<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 初始化应用
onMounted(() => {
  // 初始化用户信息
  userStore.initUser()
  
  // 初始化主题
  const savedTheme = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', savedTheme)
})
</script>

<style>
#app {
  min-height: 100vh;
  width: 100%;
}
</style>
