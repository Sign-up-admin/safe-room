<template>
  <button class="test-button" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  click: []
}>()
</script>

<style scoped>
.test-button {
  background: blue;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}
</style>
