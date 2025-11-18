<template>
  <!-- Main Layout Container -->
  <div
    class="flex h-full overflow-hidden bg-sidebar-light dark:bg-sidebar-dark"
  >
    <!-- Sidebar Component -->
    <Sidebar />

    <!-- Main Content Area -->
    <main
      class="relative flex w-full min-w-0 will-change-auto after:pointer-events-none after:fixed after:inset-2 after:z-30 after:rounded-container after:border after:border-transparent after:opacity-0 after:transition-opacity after:duration-0 dark:after:border-white/12 dark:after:border-s-white/8 md:after:opacity-100 md:after:duration-1000 after:start-[290px] md:pt-1.5 md:pb-1.5 md:pe-1.5"
    >
      <!-- Background Layers -->
      <div class="relative size-full overflow-hidden">
        <!-- Fixed Background -->
        <div class="absolute size-full md:t-main-clip-path">
          <div class="fixed inset-0 overflow-hidden">
            <div class="absolute size-full bg-none bg-background-150"></div>
          </div>
        </div>

        <!-- Content Container -->
        <div class="relative size-full overflow-hidden md:rounded-container">
          <!-- Launcher Component -->
          <Launcher />

          <!-- Composer Component -->
          <Composer />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
import Launcher from "./Launcher.vue";
import Composer from "./Composer.vue";

// MainContent component - orchestrates the main layout
// This component manages:
// - Overall page layout structure
// - Sidebar and main content coordination
// - Background layers and clipping
// - Responsive layout adjustments
</script>

<style scoped>
/* MainContent-specific styles */
</style>
