<template>
  <!-- Main Content Area -->
  <div
    class="scrollbar-stable flex size-full flex-col items-center overflow-y-auto overflow-x-hidden overscroll-contain text-foreground-800 sm:min-w-secondary-panel-slim lg:min-w-secondary-panel"
    data-testid="landing-page"
  >
    <!-- Sticky Header -->
    <div
      class="pointer-events-none sticky top-0 w-full z-20"
      style="opacity: 1"
    >
      <div class="absolute flex w-full flex-col" data-testid="sticky-header">
        <div style="opacity: 1">
          <div
            class="pointer-events-auto absolute inset-0 h-16 overflow-hidden backdrop-blur-2xl backdrop-saturate-200 bg-background-150/95 dark:bg-background-150/90"
          ></div>
        </div>
      </div>
    </div>

    <!-- Main Content with padding for composer -->
    <div
      data-tabster='{"mover":{"cyclic":false,"direction":1,"memorizeCurrent":true,"tabbable":true}}'
      class="mb-[var(--composer-container-height)] grow px-6 max-w-chat w-full"
      style="opacity: 1"
    >
      <!-- Spacer -->
      <div class="relative pt-10 min-h-[60px] sm:min-h-[120px]"></div>

      <!-- Welcome Content -->
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
    </div>

    <!-- Settings Wrapper -->
    <div
      class="absolute flex end-6 origin-top-right flex-col items-end rtl:origin-top-left top-6 -me-[14px] -mt-[14px] z-30"
      data-testid="settings-wrapper"
    >
      <div class="flex gap-4">
        <!-- Settings content can be added here -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Launcher component - handles welcome screen and main content area
// This component manages:
// - Welcome greeting
// - Main content layout
// - Settings panel positioning
// - Responsive padding for composer
</script>

<style scoped>
/* Launcher-specific styles */
</style>
