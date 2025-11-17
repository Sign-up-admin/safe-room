<template>
  <div class="board-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据看板</span>
        </div>
      </template>
      <div class="board-content">
        <p>数据看板内容</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="Board">
// Board component
</script>

<style scoped>
.board-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.board-content {
  min-height: 400px;
}
</style>
