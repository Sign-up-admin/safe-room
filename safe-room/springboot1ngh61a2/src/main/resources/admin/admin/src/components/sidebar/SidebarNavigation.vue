<template>
  <!-- Sidebar Content -->
  <div class="overflow-hidden" style="opacity: 1">
    <div class="h-dvh px-0.5 pb-0.5 pt-1 w-sidebar">
      <div
        class="t-custom-scrollbar h-full overflow-x-hidden overflow-y-auto"
      >
        <div class="flex min-h-full w-full flex-col px-1 justify-between">
          <!-- Navigation Section -->
          <div
            class="bg-sidebar-light dark:bg-sidebar-dark before:pointer-events-none before:absolute before:h-10 before:w-full before:from-sidebar-light before:to-transparent dark:before:from-sidebar-dark pointer-events-none sticky top-0 z-10 pb-3 pt-[52px]"
            style="transform: none; transform-origin: 50% 50% 0px"
          >
            <div
              class="bg-sidebar-light dark:bg-sidebar-dark pointer-events-auto relative flex flex-col items-start gap-0.5 pt-4"
            >
              <!-- Navigation Buttons -->
              <div
                class="relative w-full"
                style="transform: none; transform-origin: 50% 50% 0px"
              >
                <button
                  aria-label="Discover"
                  :aria-selected="activeItem === 'discover'"
                  type="button"
                  class="relative flex items-center text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-white/8 dark:active:bg-white/5 text-sm justify-center min-h-9 min-w-9 gap-x-1.5 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 pointer-events-auto w-full flex-col px-2 py-1.5"
                  data-testid="sidebar-discover-button"
                  data-spatial-navigation-autofocus="false"
                  @click="$emit('navigate', 'discover')"
                >
                  <span class="flex w-full items-center justify-between">
                    <span class="flex min-w-0 gap-2.5">
                      <span
                        class="relative flex shrink-0 items-center justify-center size-6"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          class="size-6"
                        >
                          <path
                            d="M3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM7.08349 8.70767C6.67722 7.6882 7.68791 6.67747 8.7074 7.08372L12.7356 8.68888C13.9078 9.15602 14.8461 10.0704 15.3431 11.2303L17.1969 15.5557C17.6414 16.5929 16.5927 17.6415 15.5555 17.197L11.2301 15.3433C10.0703 14.8462 9.15587 13.908 8.68872 12.7358L7.08349 8.70767ZM8.69209 8.69233L10.0822 12.1805C10.4018 12.9825 11.0274 13.6245 11.821 13.9646L15.572 15.5721L13.9644 11.8212C13.6243 11.0276 12.9824 10.4019 12.1803 10.0823L8.69209 8.69233Z"
                          ></path>
                        </svg>
                      </span>
                      <span
                        class="flex min-w-0 flex-1 flex-col"
                        style="opacity: 1"
                      >
                        <span
                          class="flex min-h-6 w-full items-center gap-1.5 text-start text-base-dense-medium"
                          >Discover</span
                        >
                      </span>
                    </span>
                  </span>
                </button>
              </div>

              <div
                class="relative w-full"
                style="transform: none; transform-origin: 50% 50% 0px"
              >
                <button
                  aria-label="Imagine"
                  :aria-selected="activeItem === 'imagine'"
                  type="button"
                  class="relative flex items-center text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-white/8 dark:active:bg-white/5 text-sm justify-center min-h-9 min-w-9 gap-x-1.5 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 pointer-events-auto w-full flex-col px-2 py-1.5"
                  data-spatial-navigation-autofocus="false"
                  @click="$emit('navigate', 'imagine')"
                >
                  <span class="flex w-full items-center justify-between">
                    <span class="flex min-w-0 gap-2.5">
                      <span
                        class="relative flex shrink-0 items-center justify-center size-6"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          class="size-6"
                        >
                          <path
                            d="M2 5.25C2 3.45507 3.45507 2 5.25 2H14.75C16.5449 2 18 3.45507 18 5.25V8H16.5V5.25C16.5 4.2835 15.7165 3.5 14.75 3.5H5.25C4.2835 3.5 3.5 4.2835 3.5 5.25V12.75C3.5 13.7165 4.2835 14.5 5.25 14.5H8V16H5.25C3.45507 16 2 14.5449 2 12.75V5.25ZM19 13.25C19 13.9404 18.4404 14.5 17.75 14.5C17.0596 14.5 16.5 13.9404 16.5 13.25C16.5 12.5596 17.0596 12 17.75 12C18.4404 12 19 12.5596 19 13.25ZM9 12.25C9 10.4551 10.4551 9 12.25 9H18.75C20.5449 9 22 10.4551 22 12.25V18.75C22 20.5449 20.5449 22 18.75 22H12.25C10.4551 22 9 20.5449 9 18.75V12.25ZM12.25 10.5C11.2835 10.5 10.5 11.2835 10.5 12.25V18.75C10.5 18.9393 10.5301 19.1216 10.5856 19.2923L13.98 16.1069C14.845 15.2977 16.1892 15.2977 17.0542 16.1069L20.4246 19.2598C20.4736 19.0985 20.5 18.9273 20.5 18.75V12.25C20.5 11.2835 19.7165 10.5 18.75 10.5H12.25ZM12.25 20.5H18.75C18.9854 20.5 19.2099 20.4535 19.4149 20.3693L16.0295 17.2023C15.7411 16.9326 15.2931 16.9326 15.0047 17.2023L11.6167 20.3819C11.8131 20.4582 12.0267 20.5 12.25 20.5ZM5.75 5C6.16421 5 6.5 5.33579 6.5 5.75V6.25C6.5 6.66421 6.16421 7 5.75 7C5.33579 7 5 6.66421 5 6.25V5.75C5 5.33579 5 5.75 5 5.75C5 5.33579 5.33579 5 5.75 5ZM6.5 8.75C6.5 8.33579 6.16421 8 5.75 8C5.33579 8 5 8.33579 5 8.75V9.25C5 9.66421 5.33579 10 5.75 10C6.16421 10 6.5 9.66421 6.5 9.25V8.75ZM14.25 5C14.6642 5 15 5.33579 15 5.75V6.25C15 6.66421 14.6642 7 14.25 7C13.8358 7 13.5 6.66421 13.5 6.25V5.75C13.5 5.33579 13.8358 5 14.25 5ZM6.5 11.75C6.5 11.3358 6.16421 11 5.75 11C5.33579 11 5 11.3358 5 11.75V12.25C5 12.6642 5.33579 13 5.75 13C6.16421 13 6.5 12.6642 6.5 12.25V11.75Z"
                          ></path>
                        </svg>
                      </span>
                      <span
                        class="flex min-w-0 flex-1 flex-col"
                        style="opacity: 1"
                      >
                        <span
                          class="flex min-h-6 w-full items-center gap-1.5 text-start text-base-dense-medium"
                          >Imagine
                          <div
                            class="flex h-4 shrink-0 items-center rounded px-1.5 text-2xs bg-accent-350/30 text-accent-650 dark:bg-accent-450/30"
                          >
                            New
                          </div></span
                        >
                      </span>
                    </span>
                  </span>
                </button>
              </div>

              <div
                class="relative w-full"
                style="transform: none; transform-origin: 50% 50% 0px"
              >
                <button
                  aria-label="Library"
                  :aria-selected="activeItem === 'library'"
                  type="button"
                  class="relative flex items-center text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-white/8 dark:active:bg-white/5 text-sm justify-center min-h-9 min-w-9 gap-x-1.5 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 pointer-events-auto w-full flex-col px-2 py-1.5"
                  data-spatial-navigation-autofocus="false"
                  @click="$emit('navigate', 'library')"
                >
                  <span class="flex w-full items-center justify-between">
                    <span class="flex min-w-0 gap-2.5">
                      <span
                        class="relative flex shrink-0 items-center justify-center size-6"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          class="size-6"
                        >
                          <path
                            d="M11.0656 8.00389L11.25 7.99875H18.75C20.483 7.99875 21.8992 9.3552 21.9949 11.0643L22 11.2487V18.7487C22 20.4818 20.6435 21.898 18.9344 21.9936L18.75 21.9987H11.25C9.51697 21.9987 8.10075 20.6423 8.00515 18.9332L8 18.7487V11.2487C8 9.51571 9.35646 8.0995 11.0656 8.00389ZM18.75 9.49875H11.25C10.3318 9.49875 9.57881 10.2059 9.5058 11.1052L9.5 11.2487V18.7487C9.5 19.6669 10.2071 20.4199 11.1065 20.4929L11.25 20.4987H18.75C19.6682 20.4987 20.4212 19.7916 20.4942 18.8923L20.5 18.7487V11.2487C20.5 10.2822 19.7165 9.49875 18.75 9.49875ZM15.5818 4.23284L15.6345 4.40964L16.327 6.998H14.774L14.1856 4.79787C13.9355 3.86431 12.9759 3.31029 12.0423 3.56044L4.79787 5.50158C3.91344 5.73856 3.36966 6.61227 3.52756 7.49737L3.56044 7.64488L5.50158 14.8893C5.69372 15.6064 6.30445 16.0996 7.00045 16.1764L7.00056 17.6816C5.69932 17.6051 4.52962 16.7445 4.10539 15.4544L4.05269 15.2776L2.11155 8.03311C1.66301 6.35913 2.6067 4.6401 4.23284 4.10539L4.40964 4.05269L11.6541 2.11155C13.3281 1.66301 15.0471 2.6067 15.5818 4.23284Z"
                          ></path>
                        </svg>
                      </span>
                      <span
                        class="flex min-w-0 flex-1 flex-col"
                        style="opacity: 1"
                      >
                        <span
                          class="flex min-h-6 w-full items-center gap-1.5 text-start text-base-dense-medium"
                          >Library</span
                        >
                      </span>
                    </span>
                  </span>
                </button>
              </div>

              <div
                class="relative w-full"
                style="transform: none; transform-origin: 50% 50% 0px"
              >
                <button
                  aria-label="Labs"
                  :aria-selected="activeItem === 'labs'"
                  type="button"
                  class="relative flex items-center text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-white/8 dark:active:bg-white/5 text-sm justify-center min-h-9 min-w-9 gap-x-1.5 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 pointer-events-auto w-full flex-col px-2 py-1.5"
                  data-spatial-navigation-autofocus="false"
                  @click="$emit('navigate', 'labs')"
                >
                  <span class="flex w-full items-center justify-between">
                    <span class="flex min-w-0 gap-2.5">
                      <span
                        class="relative flex shrink-0 items-center justify-center size-6"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          class="size-6"
                        >
                          <path
                            d="M8 4.5H8.99998V10.7382C8.99998 11.1132 8.90628 11.4822 8.72739 11.8117L5.14269 18.415C4.50968 19.5811 5.35388 20.9999 6.68068 20.9999H17.3193C18.6461 20.9999 19.4903 19.5811 18.8573 18.415L15.2726 11.8117C15.0937 11.4822 15 11.1132 15 10.7382V4.5H16C16.4142 4.5 16.75 4.16421 16.75 3.75C16.75 3.33579 16.4142 3 16 3H8C7.58579 3 7.25 3.33579 7.25 3.75C7.25 4.16421 7.58579 4.5 8 4.5ZM10.5 10.7382V4.5H13.5V10.7382C13.5 11.3631 13.6561 11.9781 13.9543 12.5273L14.7537 14H9.24621L10.0457 12.5273C10.3438 11.9781 10.5 11.3631 10.5 10.7382ZM8.43192 15.5H15.568L17.539 19.1307C17.6294 19.2973 17.5088 19.4999 17.3193 19.4999H6.68068C6.49114 19.4999 6.37054 19.2973 6.46097 19.1307L8.43192 15.5Z"
                          ></path>
                        </svg>
                      </span>
                      <span
                        class="flex min-w-0 flex-1 flex-col"
                        style="opacity: 1"
                      >
                        <span
                          class="flex min-h-6 w-full items-center gap-1.5 text-start text-base-dense-medium"
                          >Labs</span
                        >
                      </span>
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// SidebarNavigation component - handles navigation menu
// - Discover, Imagine, Library, Labs buttons
// - Navigation state management

defineProps<{
  activeItem?: string
}>()

defineEmits<{
  navigate: [item: string]
}>()
</script>

<style scoped>
/* SidebarNavigation-specific styles */
</style>
