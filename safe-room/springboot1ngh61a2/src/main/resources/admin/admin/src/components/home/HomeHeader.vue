<template>
  <!-- HomeHeader component - extracted from home.vue lines 533-547 -->
  <div
    class="pointer-events-none sticky top-0 w-full z-20"
    style="opacity: 1"
  >
    <div
      class="absolute flex w-full flex-col"
      data-testid="sticky-header"
    >
      <div style="opacity: 1">
        <div
          class="pointer-events-auto absolute inset-0 h-16 overflow-hidden backdrop-blur-2xl backdrop-saturate-200 bg-background-150/95 dark:bg-background-150/90"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// HomeHeader component - Page header with sticky background blur effect
// Props and types will be defined as needed
</script>

<style scoped>
/* HomeHeader-specific styles */
</style>
