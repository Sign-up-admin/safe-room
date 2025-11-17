<template>
  <el-container class="admin-layout">
    <IndexMain />
  </el-container>
</template>

<script setup lang="ts" name="Index">
import IndexMain from '@/components/index/IndexMain.vue'
</script>

<style scoped lang="scss">
.admin-layout {
  position: fixed;
  inset: 0;
}
</style>
