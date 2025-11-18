<template>
  <!-- HomeActions component - extracted from home.vue lines 996-1084 -->
  <div
    class="flex h-[150px] w-full max-w-chat flex-none items-end px-2 sm:flex-initial sm:items-start z-20"
    style="opacity: 1"
  >
    <div
      class="mx-auto flex w-full flex-col gap-3 px-2 pointer-events-auto sm:mt-8"
    >
      <div
        role="list"
        class="flex w-full gap-2 px-1 py-1 sm:flex-wrap sm:py-4 scrollbar-container max-h-[110px] overflow-x-auto overflow-y-hidden sm:justify-start"
        style="opacity: 1"
      >
        <button
          type="button"
          class="shadow-none dark:shadow-none relative flex items-center text-sm min-h-10 px-3 py-2 gap-x-2 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 text-foreground-550 active:text-foreground-350 dark:text-foreground-600 active:dark:text-foreground-550 bg-white/30 safe-hover:bg-black/3 active:bg-black/2 dark:bg-black/3 dark:safe-hover:bg-white/5 dark:active:bg-white/3 border-[1px] border-black/8 dark:border-white/8 min-w-fit"
          aria-label="Starter prompt Create an image 1 of 8"
          data-testid="starter-prompt-create-an-image"
          data-item-id="create-an-image"
        >
          <span class="px-1 text-sm"
            >Create an image</span
          ></button
        ><button
          type="button"
          class="shadow-none dark:shadow-none relative flex items-center text-sm min-h-10 px-3 py-2 gap-x-2 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 text-foreground-550 active:text-foreground-350 dark:text-foreground-600 active:dark:text-foreground-550 bg-white/30 safe-hover:bg-black/3 active:bg-black/2 dark:bg-black/3 dark:safe-hover:bg-white/5 dark:active:bg-white/3 border-[1px] border-black/8 dark:border-white/8 min-w-fit"
          aria-label="Starter prompt Recommend a product 2 of 8"
          data-testid="starter-prompt-recommend-a-product"
          data-item-id="recommend-a-product"
        >
          <span class="px-1 text-sm"
            >Recommend a product</span
          ></button
        ><button
          type="button"
          class="shadow-none dark:shadow-none relative flex items-center text-sm min-h-10 px-3 py-2 gap-x-2 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 text-foreground-550 active:text-foreground-350 dark:text-foreground-600 active:dark:text-foreground-550 bg-white/30 safe-hover:bg-black/3 active:bg-black/2 dark:bg-black/3 dark:safe-hover:bg-white/5 dark:active:bg-white/3 border-[1px] border-black/8 dark:border-white/8 min-w-fit"
          aria-label="Starter prompt Improve writing 3 of 8"
          data-testid="starter-prompt-improve-writing"
          data-item-id="improve-writing"
        >
          <span class="px-1 text-sm"
            >Improve writing</span
          ></button
        ><button
          type="button"
          class="shadow-none dark:shadow-none relative flex items-center text-sm min-h-10 px-3 py-2 gap-x-2 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 text-foreground-550 active:text-foreground-350 dark:text-foreground-600 active:dark:text-foreground-550 bg-white/30 safe-hover:bg-black/3 active:bg-black/2 dark:bg-black/3 dark:safe-hover:bg-white/5 dark:active:bg-white/3 border-[1px] border-black/8 dark:border-white/8 min-w-fit"
          aria-label="Starter prompt Write a first draft 4 of 8"
          data-testid="starter-prompt-write-a-first-draft"
          data-item-id="write-a-first-draft"
        >
          <span class="px-1 text-sm"
            >Write a first draft</span
          ></button
        ><button
          type="button"
          class="shadow-none dark:shadow-none relative flex items-center text-sm min-h-10 px-3 py-2 gap-x-2 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 text-foreground-550 active:text-foreground-350 dark:text-foreground-600 active:dark:text-foreground-550 bg-white/30 safe-hover:bg-black/3 active:bg-black/2 dark:bg-black/3 dark:safe-hover:bg-white/5 dark:active:bg-white/3 border-[1px] border-black/8 dark:border-white/8 min-w-fit"
          aria-label="Starter prompt Say it with care 5 of 8"
          data-testid="starter-prompt-say-it-with-care"
          data-item-id="say-it-with-care"
        >
          <span class="px-1 text-sm"
            >Say it with care</span
          ></button
        ><button
          type="button"
          class="shadow-none dark:shadow-none relative flex items-center text-sm min-h-10 px-3 py-2 gap-x-2 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 text-foreground-550 active:text-foreground-350 dark:text-foreground-600 active:dark:text-foreground-550 bg-white/30 safe-hover:bg-black/3 active:bg-black/2 dark:bg-black/3 dark:safe-hover:bg-white/5 dark:active:bg-white/3 border-[1px] border-black/8 dark:border-white/8 min-w-fit"
          aria-label="Starter prompt Design a logo 6 of 8"
          data-testid="starter-prompt-design-a-logo"
          data-item-id="design-a-logo"
        >
          <span class="px-1 text-sm">Design a logo</span></button
        ><button
          type="button"
          class="shadow-none dark:shadow-none relative flex items-center text-sm min-h-10 px-3 py-2 gap-x-2 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 text-foreground-550 active:text-foreground-350 dark:text-foreground-600 active:dark:text-foreground-550 bg-white/30 safe-hover:bg-black/3 active:bg-black/2 dark:bg-black/3 dark:safe-hover:bg-white/5 dark:active:bg-white/3 border-[1px] border-black/8 dark:border-white/8 min-w-fit"
          aria-label="Starter prompt Get advice 7 of 8"
          data-testid="starter-prompt-get-advice"
          data-item-id="get-advice"
        >
          <span class="px-1 text-sm">Get advice</span></button
        ><button
          type="button"
          class="shadow-none dark:shadow-none relative flex items-center text-sm min-h-10 px-3 py-2 gap-x-2 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 text-foreground-550 active:text-foreground-350 dark:text-foreground-600 active:dark:text-foreground-550 bg-white/30 safe-hover:bg-black/3 active:bg-black/2 dark:bg-black/3 dark:safe-hover:bg-white/5 dark:active:bg-white/3 border-[1px] border-black/8 dark:border-white/8 min-w-fit"
          aria-label="Starter prompt Draft a text 8 of 8"
          data-testid="starter-prompt-draft-a-text"
          data-item-id="draft-a-text"
        >
          <span class="px-1 text-sm">Draft a text</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// HomeActions component - Starter prompts buttons
// Props and types will be defined as needed
</script>

<style scoped>
/* HomeActions-specific styles */
</style>
