<template>
  <!-- Conversations Section -->
  <div class="grow" style="opacity: 1">
    <div class="relative flex grow flex-col py-5">
      <h2
        class="mb-6 flex gap-2 px-2.5 align-middle text-base-dense-medium"
        data-testid="sidebar-conversations-header"
      >
        Conversations
      </h2>
      <div
        class="flex w-full select-none flex-col gap-px whitespace-nowrap"
        role="listbox"
        aria-label="Our conversations together"
        tabindex="-1"
      >
        <div
          class="mb-3 px-2.5 text-sm-medium mt-0"
          aria-hidden="true"
        >
          <span
            class="text-foreground-550/95 dark:text-foreground-600/85"
            >Today</span
          >
        </div>
        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          class="relative cursor-pointer rounded-xl text-start hover:bg-black/5 focus:bg-black/5 active:bg-black/8 contrast-more:outline-2 contrast-more:focus:outline dark:fill-white dark:hover:bg-white/8 dark:focus:bg-white/8 dark:active:bg-white/5 h-9 text-sm pe-1 ps-2.5"
          role="option"
          tabindex="0"
          :aria-selected="selectedConversationId === conversation.id"
          :aria-label="`Today, ${conversation.title}`"
          @click="$emit('select-conversation', conversation.id)"
        >
          <div class="flex size-full items-center justify-between">
            <div
              class="flex h-full min-w-0 flex-1 items-center pe-2"
            >
              <p
                class="truncate"
                :title="conversation.title"
              >
                {{ conversation.title }}
              </p>
            </div>
            <button
              type="button"
              class="relative flex items-center text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-black/30 dark:active:bg-black/20 text-sm justify-center size-7 rounded-lg after:rounded-lg after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900"
              title="View Options"
              data-spatial-navigation-autofocus="false"
              @click.stop="$emit('view-options', conversation.id)"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                class="size-5"
              >
                <path
                  d="M6.25 10C6.25 10.6904 5.69036 11.25 5 11.25C4.30964 11.25 3.75 10.6904 3.75 10C3.75 9.30964 4.30964 8.75 5 8.75C5.69036 8.75 6.25 9.30964 6.25 10ZM11.25 10C11.25 10.6904 10.6904 11.25 10 11.25C9.30964 11.25 8.75 10.6904 8.75 10C8.75 9.30964 9.30964 8.75 10 8.75C10.6904 8.75 11.25 9.30964 11.25 10ZM15 11.25C15.6904 11.25 16.25 10.6904 16.25 10C16.25 9.30964 15.6904 8.75 15 8.75C14.3096 8.75 13.75 9.30964 13.75 10C13.75 10.6904 14.3096 11.25 15 11.25Z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer Section -->
  <div class="z-40 absolute bottom-0 hidden"></div>
  <div
    class="pointer-events-none sticky bottom-0 z-30 w-full bg-sidebar-light px-0 py-1.5 will-change-transform dark:bg-sidebar-dark before:pointer-events-none before:absolute before:-top-10 before:h-10 before:w-full before:bg-gradient-to-b before:from-transparent before:to-sidebar-light before:opacity-90 dark:before:to-sidebar-dark after:absolute after:top-0 after:mx-1 after:w-[calc(100%-8px)] after:border-b after:border-black/8 dark:after:border-white/10"
    role="menu"
  >
    <button
      type="button"
      class="relative flex text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-white/8 dark:active:bg-white/5 text-sm min-h-10 min-w-10 gap-x-2 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 pointer-events-auto items-center justify-center p-2 w-full"
      title="Sign in"
      role="menuitem"
      data-testid="sidebar-settings-button"
      data-spatial-navigation-autofocus="true"
      @click="$emit('sign-in')"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        class="size-6 shrink-0"
        alt-text="Profile image"
      >
        <path
          d="M17.7545 14.0002C18.9966 14.0002 20.0034 15.007 20.0034 16.2491V16.8245C20.0034 17.7188 19.6838 18.5836 19.1023 19.263C17.5329 21.0965 15.1457 22.0013 12.0004 22.0013C8.8545 22.0013 6.46849 21.0962 4.90219 19.2619C4.32242 18.583 4.00391 17.7195 4.00391 16.8267V16.2491C4.00391 15.007 5.01076 14.0002 6.25278 14.0002H17.7545ZM17.7545 15.5002H6.25278C5.83919 15.5002 5.50391 15.8355 5.50391 16.2491V16.8267C5.50391 17.3624 5.69502 17.8805 6.04287 18.2878C7.29618 19.7555 9.26206 20.5013 12.0004 20.5013C14.7387 20.5013 16.7063 19.7555 17.9627 18.2876C18.3117 17.8799 18.5034 17.361 18.5034 16.8245V16.2491C18.5034 15.8355 18.1681 15.5002 17.7545 15.5002ZM12.0004 2.00488C14.7618 2.00488 17.0004 4.24346 17.0004 7.00488C17.0004 9.76631 14.7618 12.0049 12.0004 12.0049C9.23894 12.0049 7.00036 9.76631 7.00036 7.00488C7.00036 4.24346 9.23894 2.00488 12.0004 2.00488ZM12.0004 3.50488C10.0674 3.50488 8.50036 5.07189 8.50036 7.00488C8.50036 8.93788 10.0674 10.5049 12.0004 10.5049C13.9334 10.5049 15.5004 8.93788 15.5004 7.00488C15.5004 5.07189 13.9334 3.50488 12.0004 3.50488Z"
        ></path>
      </svg>
      <span class="ms-0.5 w-full text-start">Sign in</span>
    </button>
  </div>
</template>

<script setup lang="ts">
// SidebarConversations component - handles conversation list and footer
// - Conversation items display and selection
// - Sign in button

interface Conversation {
  id: string
  title: string
}

defineProps<{
  conversations?: Conversation[]
  selectedConversationId?: string
}>()

defineEmits<{
  'select-conversation': [conversationId: string]
  'view-options': [conversationId: string]
  'sign-in': []
}>()
</script>

<style scoped>
/* SidebarConversations-specific styles */
</style>
