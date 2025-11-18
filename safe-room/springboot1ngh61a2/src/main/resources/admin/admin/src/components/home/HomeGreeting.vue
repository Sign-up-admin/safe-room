<template>
  <!-- HomeGreeting component - extracted from home.vue lines 553-568 -->
  <div class="relative pt-10 min-h-[60px] sm:min-h-[120px]"></div>
  <div
    class="mt-2 flex flex-col items-start text-pretty pe-0 sm:absolute sm:inset-x-0 sm:inset-y-0 sm:mx-auto sm:mt-0 sm:max-w-chat sm:px-4 sm:pb-[calc(var(--composer-container-height))]"
    style="opacity: 1"
  >
    <div
      class="order-1 flex w-full flex-col gap-2 sm:top-0 sm:h-full sm:justify-center"
    >
      <div
        class="flex w-full flex-col items-start justify-start sm:justify-end sm:mb-8 sm:h-[100px] text-2xl sm:ps-2"
        data-testid="launch-greeting"
      >
        <h1>Hey, nice to see you. What&rsquo;s new?</h1>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// HomeGreeting component - Welcome message area
// Props and types will be defined as needed
</script>

<style scoped>
/* HomeGreeting-specific styles */
</style>
