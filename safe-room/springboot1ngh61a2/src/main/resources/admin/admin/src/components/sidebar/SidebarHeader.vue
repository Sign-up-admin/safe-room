<template>
  <div
    class="absolute h-full w-0 will-change-auto md:relative md:w-[290px] max-md:z-40"
    :class="[
      isMobile ? 'bg-sidebar-light dark:bg-sidebar-dark' : ''
    ]"
    style="width: 290px"
  >
    <div
      class="relative w-full bg-sidebar-light dark:bg-sidebar-dark"
      role="navigation"
    >
      <!-- Sidebar Header -->
      <div
        class="pointer-events-none absolute start-0 top-0 w-full pe-2.5 ps-0.5 z-40"
        :class="[
          isMobile ? 'py-1.5' : 'py-3'
        ]"
      >
        <div class="relative">
          <div
            class="absolute flex min-w-full items-end justify-between p-1 gap-0.5"
          >
            <!-- Copilot Logo Button -->
            <div class="flex w-0 items-center">
              <button
                type="button"
                class="text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-white/8 dark:active:bg-white/5 text-sm justify-center min-h-9 min-w-9 px-2.5 py-1 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 pointer-events-auto absolute start-1 top-1 flex items-center gap-2.5 pe-2.5 ps-2"
                title="Go to Copilot home page"
                role="link"
                data-testid="sidebar-copilot-brand-button"
                data-spatial-navigation-autofocus="false"
                @click="$emit('go-home')"
              >
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="size-6"
                >
                  <!-- Copilot Logo SVG -->
                  <path
                    d="M22.9253 4.97196C22.5214 3.79244 21.4126 3 20.1658 3L18.774 3C17.3622 3 16.1532 4.01106 15.9033 5.40051L14.4509 13.4782L15.0163 11.5829C15.3849 10.347 16.5215 9.5 17.8112 9.5L23.0593 9.5L25.3054 10.809L27.4705 9.5H26.5598C25.313 9.5 24.2042 8.70756 23.8003 7.52804L22.9253 4.97196Z"
                    fill="url(#paint0_radial_262034_2117)"
                  ></path>
                  <path
                    d="M9.39637 27.0147C9.79613 28.2011 10.9084 29 12.1604 29H14.5727C16.1772 29 17.4805 27.704 17.4893 26.0995L17.5315 18.4862L16.9699 20.4033C16.6058 21.6461 15.4659 22.5 14.1708 22.5H8.88959L6.96437 21.0214L4.88007 22.5H5.78013C7.03206 22.5 8.14435 23.299 8.54411 24.4853L9.39637 27.0147Z"
                    fill="url(#paint1_radial_262034_2117)"
                  ></path>
                  <path
                    d="M19.7501 3H8.81266C5.68767 3 3.81268 7.08916 2.56269 11.1783C1.08177 16.0229 -0.856044 22.5021 4.75017 22.5021H9.66051C10.9615 22.5021 12.105 21.6415 12.4657 20.3915C13.2784 17.5759 14.7501 12.4993 15.9014 8.65192C16.4758 6.73249 16.9543 5.08404 17.6886 4.05749C18.1003 3.48196 18.7864 3 19.7501 3Z"
                    fill="url(#paint2_radial_262034_2117)"
                  ></path>
                  <path
                    d="M19.7501 3H8.81266C5.68767 3 3.81268 7.08916 2.56269 11.1783C1.08177 16.0229 -0.856044 22.5021 4.75017 22.5021H9.66051C10.9615 22.5021 12.105 21.6415 12.4657 20.3915C13.2784 17.5759 14.7501 12.4993 15.9014 8.65192C16.4758 6.73249 16.9543 5.08404 17.6886 4.05749C18.1003 3.48196 18.7864 3 19.7501 3Z"
                    fill="url(#paint3_linear_262034_2117)"
                  ></path>
                  <path
                    d="M12.2478 29H23.1852C26.3102 29 28.1852 24.9103 29.4352 20.8207C30.9161 15.9755 32.854 9.49548 27.2477 9.49548H22.3375C21.0364 9.49548 19.893 10.3562 19.5322 11.6062C18.7196 14.4221 17.2479 19.4994 16.0965 23.3474C15.5221 25.2671 15.0436 26.9157 14.3093 27.9424C13.8976 28.518 13.2115 29 12.2478 29Z"
                    fill="url(#paint4_radial_262034_2117)"
                  ></path>
                  <path
                    d="M12.2478 29H23.1852C26.3102 29 28.1852 24.9103 29.4352 20.8207C30.9161 15.9755 32.854 9.49548 27.2477 9.49548H22.3375C21.0364 9.49548 19.893 10.3562 19.5322 11.6062C18.7196 14.4221 17.2479 19.4994 16.0965 23.3474C15.5221 25.2671 15.0436 26.9157 14.3093 27.9424C13.8976 28.518 13.2115 29 12.2478 29Z"
                    fill="url(#paint5_linear_262034_2117)"
                  ></path>
                  <defs>
                    <radialGradient
                      id="paint0_radial_262034_2117"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientTransform="matrix(-7.37821 -8.55084 -7.96607 7.17216 25.5747 13.5466)"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0.0955758" stop-color="#00AEFF"></stop>
                      <stop offset="0.773185" stop-color="#2253CE"></stop>
                      <stop offset="1" stop-color="#0736C4"></stop>
                    </radialGradient>
                    <radialGradient
                      id="paint1_radial_262034_2117"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientTransform="matrix(6.61516 7.92888 7.80904 -6.47171 7.1753 21.9482)"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#FFB657"></stop>
                      <stop offset="0.633728" stop-color="#FF5F3D"></stop>
                      <stop offset="0.923392" stop-color="#C02B3C"></stop>
                    </radialGradient>
                    <radialGradient
                      id="paint2_radial_262034_2117"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientTransform="matrix(-0.990905 -17.2799 98.0282 -5.51056 8.54161 22.4952)"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0.03" stop-color="#FFC800"></stop>
                      <stop offset="0.31" stop-color="#98BD42"></stop>
                      <stop offset="0.49" stop-color="#52B471"></stop>
                      <stop offset="0.843838" stop-color="#0D91E1"></stop>
                    </radialGradient>
                    <linearGradient
                      id="paint3_linear_262034_2117"
                      x1="9.52186"
                      y1="3"
                      x2="10.3572"
                      y2="22.5029"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#3DCBFF"></stop>
                      <stop
                        offset="0.246674"
                        stop-color="#0588F7"
                        stop-opacity="0"
                      ></stop>
                    </linearGradient>
                    <radialGradient
                      id="paint4_radial_262034_2117"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientTransform="matrix(-8.64067 24.4636 -29.4075 -10.797 27.8096 7.58585)"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0.0661714" stop-color="#8C48FF"></stop>
                      <stop offset="0.5" stop-color="#F2598A"></stop>
                      <stop offset="0.895833" stop-color="#FFB152"></stop>
                    </radialGradient>
                    <linearGradient
                      id="paint5_linear_262034_2117"
                      x1="28.6736"
                      y1="8.30469"
                      x2="28.6627"
                      y2="13.617"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0.0581535" stop-color="#F8ADFA"></stop>
                      <stop
                        offset="0.708063"
                        stop-color="#A86EDD"
                        stop-opacity="0"
                      ></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <div class="flex items-center" style="opacity: 1">
                  <span class="flex items-center text-lg-strong">
                    <div
                      class="bg-current forced-color-adjust-none h-[18px] w-[58px]"
                      style="
                        mask-image: url(&quot;/static/cmc/assets/copilot-wordmark-DvWA6bVb.svg&quot;);
                        mask-repeat: no-repeat;
                        mask-position: center center;
                        mask-size: contain;
                      "
                    ></div>
                  </span>
                </div>
              </button>
            </div>
            <!-- Sidebar Controls -->
            <div
              class="pointer-events-auto relative mx-1 flex shrink-0 items-center gap-0.5"
            >
              <!-- Close Sidebar Button -->
              <button
                aria-label="Close sidebar"
                type="button"
                class="relative flex items-center text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-white/8 dark:active:bg-white/5 text-sm justify-center size-9 rounded-xl after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 after:absolute after:inset-0 after:rounded-xl"
                :class="[
                  isMobile ? 'hover:after:bg-black/3 dark:after:hover:bg-white/5' : 'cursor-w-resize'
                ]"
                data-testid="sidebar-toggle-button"
                data-spatial-navigation-autofocus="false"
                data-tooltip-state="closed"
                @click="$emit('toggle-sidebar')"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  class="size-6"
                >
                  <path
                    d="M3.75 8.5C3.75 8.08579 4.08579 7.75 4.5 7.75H5.75C6.16421 7.75 6.5 8.08579 6.5 8.5C6.5 8.91421 6.16421 9.25 5.75 9.25H4.5C4.08579 9.25 3.75 8.91421 3.75 8.5ZM3.75 12C3.75 11.5858 4.08579 11.25 4.5 11.25H5.75C6.16421 11.25 6.5 11.5858 6.5 12C6.5 12.4142 6.16421 12.75 5.75 12.75H4.5C4.08579 12.75 3.75 12.4142 3.75 12ZM3.75 15.5C3.75 15.0858 4.08579 14.75 4.5 14.75H5.75C6.16421 14.75 6.5 15.0858 6.5 15.5C6.5 15.9142 6.16421 16.25 5.75 16.25H4.5C4.08579 16.25 3.75 15.9142 3.75 15.5ZM4.25 3C2.45507 3 1 4.45507 1 6.25V17.75C1 19.5449 2.45508 21 4.25 21H19.75C21.5449 21 23 19.5449 23 17.75V6.25C23 4.45507 21.5449 3 19.75 3H4.25ZM19.75 19.5H9V4.5H19.75C20.7165 4.5 21.5 5.2835 21.5 6.25V17.75C21.5 18.7165 20.7165 19.5 19.75 19.5ZM4.25 4.5H7.5V19.5H4.25C3.2835 19.5 2.5 18.7165 2.5 17.75V6.25C2.5 5.2835 3.2835 4.5 4.25 4.5Z"
                  ></path>
                </svg>
              </button>
              <!-- New Chat and Actions Menu -->
              <div
                class="flex rounded-xl hover:bg-black/3 dark:hover:bg-white/5"
                :class="[
                  isMobile ? 'hover:bg-black/3 dark:hover:bg-white/5' : ''
                ]"
              >
                <button
                  aria-label="Start new chat"
                  type="button"
                  class="relative flex items-center text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-white/8 dark:active:bg-white/5 text-sm justify-center size-9 after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 rounded-sm rounded-s-xl w-[34px]"
                  data-testid="sidebar-new-conversation-button"
                  data-spatial-navigation-autofocus="false"
                  data-tooltip-state="closed"
                  @click="$emit('new-chat')"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    class="size-6"
                  >
                    <path
                      d="M21.7803 3.28033C22.0732 2.98744 22.0732 2.51256 21.7803 2.21967C21.4874 1.92678 21.0125 1.92678 20.7196 2.21967L10.7197 12.2197L10.25 13.75L11.7803 13.2803L21.7803 3.28033ZM6.25 3C4.45507 3 3 4.45508 3 6.25V17.75C3 19.5449 4.45507 21 6.25 21H17.75C19.5449 21 21 19.5449 21 17.75V9.75C21 9.33579 20.6642 9 20.25 9C19.8358 9 19.5 9.33579 19.5 9.75V17.75C19.5 18.7165 18.7165 19.5 17.75 19.5H6.25C5.2835 19.5 4.5 18.7165 4.5 17.75V6.25C4.5 5.2835 5.2835 4.5 6.25 4.5H14.25C14.6642 4.5 15 4.16421 15 3.75C15 3.33579 14.6642 3 14.25 3H6.25Z"
                    ></path>
                  </svg>
                </button>
                <button
                  id="sidebar-new-action-menu-button"
                  aria-expanded="false"
                  aria-haspopup="menu"
                  aria-label="Open actions menu"
                  type="button"
                  class="relative flex items-center text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-white/8 dark:active:bg-white/5 text-sm justify-center min-h-9 py-1 gap-x-1.5 after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 min-w-6 rounded-sm rounded-e-xl px-0"
                  data-testid="sidebar-action-menu-button"
                  data-spatial-navigation-autofocus="false"
                  data-tooltip-state="closed"
                  @click="$emit('open-actions')"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    class="size-3.5 rotate-90"
                  >
                    <path
                      d="M8.46967 4.21967C8.17678 4.51256 8.17678 4.98744 8.46967 5.28033L15.1893 12L8.46967 18.7197C8.17678 19.0126 8.17678 19.4874 8.46967 19.7803C8.76256 20.0732 9.23744 20.0732 9.53033 19.7803L16.7803 12.5303C17.0732 12.2374 17.0732 11.7626 16.7803 11.4697L9.53033 4.21967C9.23744 3.92678 8.76256 3.92678 8.46967 4.21967Z"
                    ></path>
                  </svg>
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
import { computed } from 'vue'

// SidebarHeader component - handles sidebar header controls
// - Copilot logo button
// - Close sidebar button
// - New chat button
// - Actions menu button

// Responsive breakpoint management
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768 // md breakpoint
})

defineEmits<{
  'go-home': []
  'toggle-sidebar': []
  'new-chat': []
  'open-actions': []
}>()
</script>

<style scoped>
/* SidebarHeader-specific styles */
</style>
