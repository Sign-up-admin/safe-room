<template>
  <!-- HomeLayout component - Main layout container with sidebar and main content -->
  <div
    id="app"
    style="
      --layout-offset-y: 6px;
      --composer-container-height: 260px;
      --sidebar-header-secondary-buttons-collapsed-width: 0px;
      --header-controls-inline-start-width: 0px;
    "
  >
    <!-- Screen reader announcements -->
    <div class="sr-only">
      <div aria-live="polite" aria-atomic="true"></div>
      <div aria-live="assertive" aria-atomic="true"></div>
    </div>

    <!-- Main layout container -->
    <div
      class="flex h-full overflow-hidden bg-sidebar-light dark:bg-sidebar-dark"
    >
      <!-- Sidebar slot -->
      <div
        class="absolute h-full w-0 will-change-auto max-md:bg-sidebar-light max-md:dark:bg-sidebar-dark md:relative md:w-[290px] max-md:z-40"
        style="width: 290px"
      >
        <div
          class="relative w-full bg-sidebar-light dark:bg-sidebar-dark"
          role="navigation"
        >
          <!-- Sidebar content will be provided via slot -->
          <slot name="sidebar"></slot>
        </div>
      </div>

      <!-- Main content area -->
      <main
        class="relative flex w-full min-w-0 will-change-auto after:pointer-events-none after:fixed after:inset-2 after:z-30 after:rounded-container after:border after:border-transparent after:opacity-0 after:transition-opacity after:duration-0 dark:after:border-white/12 dark:after:border-s-white/8 md:after:opacity-100 md:after:duration-1000 after:start-[290px] md:pt-1.5 md:pb-1.5 md:pe-1.5"
      >
        <!-- Main content will be provided via slot -->
        <slot name="main"></slot>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// HomeLayout component - Main layout container with sidebar and main content areas
// Props and types will be defined as needed
</script>

<style scoped>
/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Main layout styles */
.flex {
  display: flex;
}

.h-full {
  height: 100%;
}

.overflow-hidden {
  overflow: hidden;
}

.bg-sidebar-light {
  --tw-bg-opacity: 1;
  background-color: rgb(248 250 252 / var(--tw-bg-opacity));
}

.dark\:bg-sidebar-dark {
  --tw-bg-opacity: 1;
  background-color: rgb(15 23 42 / var(--tw-bg-opacity));
}

.absolute {
  position: absolute;
}

.w-0 {
  width: 0px;
}

.will-change-auto {
  will-change: auto;
}

.max-md\:bg-sidebar-light {
  max-width: 768px;
  --tw-bg-opacity: 1;
  background-color: rgb(248 250 252 / var(--tw-bg-opacity));
}

.max-md\:dark\:bg-sidebar-dark {
  max-width: 768px;
  --tw-bg-opacity: 1;
  background-color: rgb(15 23 42 / var(--tw-bg-opacity));
}

.md\:relative {
  position: relative;
}

.md\:w-\[290px\] {
  width: 290px;
}

.max-md\:z-40 {
  z-index: 40;
}

.relative {
  position: relative;
}

.w-full {
  width: 100%;
}

.min-w-0 {
  min-width: 0px;
}

.after\:pointer-events-none::after {
  pointer-events: none;
}

.after\:fixed::after {
  position: fixed;
}

.after\:inset-2::after {
  inset: 8px;
}

.after\:z-30::after {
  z-index: 30;
}

.after\:rounded-container::after {
  border-radius: var(--border-radius-container);
}

.after\:border::after {
  border-width: 1px;
  border-style: solid;
}

.after\:border-transparent::after {
  --tw-border-opacity: 1;
  border-color: rgb(0 0 0 / var(--tw-border-opacity));
}

.after\:opacity-0::after {
  opacity: 0;
}

.after\:transition-opacity::after {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.after\:duration-0::after {
  transition-duration: 0s;
}

.dark\:after\:border-white\/12::after {
  --tw-border-opacity: 1;
  border-color: rgb(255 255 255 / 0.12);
}

.dark\:after\:border-s-white\/8::after {
  border-inline-start-color: rgb(255 255 255 / 0.08);
}

.md\:after\:opacity-100::after {
  opacity: 1;
}

.md\:after\:duration-1000::after {
  transition-duration: 1000ms;
}

.after\:start-\[290px\]::after {
  inset-inline-start: 290px;
}

.md\:pt-1\.5::after {
  padding-top: 6px;
}

.md\:pb-1\.5::after {
  padding-bottom: 6px;
}

.md\:pe-1\.5::after {
  padding-right: 6px;
}
</style>
