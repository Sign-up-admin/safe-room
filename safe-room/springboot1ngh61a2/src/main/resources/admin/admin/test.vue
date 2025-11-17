<template>
  <div class="test">
    <h1>Test Component</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
const message = 'Hello World'
</script>

<style scoped>
.test {
  padding: 20px;
}
</style>
