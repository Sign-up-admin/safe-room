<template>
  <!-- Composer - Input area with controls -->
  <div
    data-testid="composer"
    class="pointer-events-none absolute bottom-0 flex sm:bottom-1/2 sm:translate-y-1/2 sm:pt-36 z-10 w-full max-sm:w-full"
    role="region"
    aria-label="Message composer"
    aria-describedby="composer-description"
  >
    <!-- Hidden description for screen readers -->
    <div id="composer-description" class="sr-only">
      Message input area with file upload, mode selection, and quick action buttons
    </div>

    <input
      ref="fileInputRef"
      accept=".jpg,.jpeg,.png,.webp,.svg,.txt,.pdf,.docx,.xlsx,.pptx,.json,.xml,.csv,.md,.js,.css,.html,.htm,.xml"
      class="hidden"
      aria-hidden="true"
      type="file"
      multiple
      @change="handleFileUpload"
    />

    <!-- Main Composer Container -->
    <div
      class="relative flex w-full flex-col-reverse items-center px-3 sm:flex-col sm:mb-0 mb-4 composer-main-container"
    >
      <!-- Input Container -->
      <div
        class="relative max-h-full min-h-composer min-w-16 max-w-chat rounded-5xl composer-input-container"
      >
        <!-- Main Input Background -->
        <div
          class="relative shadow-tinted-xl backdrop-blur-2xl backdrop-saturate-200 bg-accent-100/60 dark:bg-muted-200/50 composer-input-background composer-shadow-effect"
        >
          <div
            class="pointer-events-auto relative flex flex-col overflow-hidden contrast-more:border-2 composer-content-container"
            data-testid="composer-content"
          >
            <!-- Gradient Background -->
            <div
              class="relative max-h-full w-expanded-composer max-w-chat bg-gradient-to-b p-1.5 to-background-400/8 from-background-400/5 dark:from-background-200/65 dark:to-background-200/65 composer-gradient-background"
            >
              <!-- Content Background -->
              <div
                class="bg-white/90 dark:bg-background-100/45 composer-content-background"
              >
                <div
                  class="relative flex grow flex-col overflow-hidden before:absolute before:inset-0 before:rounded-3xl before:border-2 before:border-stroke-350 w-auto rounded-3xl contrast-more:border-2 before:opacity-0 composer-input-wrapper"
                >

                  <!-- Input Area -->
                  <div
                    class="flex items-end min-h-0 w-auto grow mt-1 composer-input-area"
                  >
                    <div
                      class="relative grow overflow-hidden composer-input-relative"
                    >
                      <div
                        class="relative flex size-full cursor-text overflow-hidden text-black dark:text-white composer-input-cursor"
                      >
                        <div
                          class="flex grow flex-col gap-4 py-user-input composer-input-flex"
                        >
                          <!-- Scrollable Input Container -->
                          <div
                            class="t-custom-scrollbar scrollbar-stable overflow-y-auto px-4 max-h-user-input-shallow"
                          >
                            <div class="relative">
                              <label
                                class="invisible block h-0 w-0 overflow-hidden whitespace-nowrap"
                                for="userInput"
                                >Message Copilot</label
                              >
                              <textarea
                                ref="textareaRef"
                                v-model="inputValue"
                                class="font-ligatures-none inline-block h-user-input w-full resize-none overflow-y-hidden whitespace-pre-wrap bg-transparent align-top outline-none placeholder:text-foreground-450 dark:text-white dark:placeholder:text-foreground-600 text-base-dense composer-textarea"
                                :placeholder="props.placeholder"
                                :disabled="props.disabled"
                                :maxlength="props.maxLength"
                                :aria-invalid="isOverLimit"
                                :aria-describedby="showError && errorMessage ? 'composer-error' : undefined"
                                id="userInput"
                                role="textbox"
                                aria-autocomplete="both"
                                aria-multiline="true"
                                spellcheck="false"
                                enterkeyhint="enter"
                                data-testid="composer-input"
                                @input="handleInput"
                                @keydown="handleKeydown"
                                @compositionstart="isComposing = true"
                                @compositionend="isComposing = false"
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Error Message -->
                    <div
                      v-if="showError && errorMessage"
                      v-memo="[errorMessage]"
                      id="composer-error"
                      class="composer-error-message"
                      role="alert"
                      aria-live="polite"
                    >
                      {{ errorMessage }}
                    </div>

                    <!-- Character Counter -->
                    <div
                      v-if="props.maxLength && isNearLimit"
                      v-memo="[characterCount, props.maxLength]"
                      class="composer-char-counter"
                    >
                      {{ characterCount }}/{{ props.maxLength }}
                    </div>
                  </div>
                </div>

                <!-- Bottom Controls -->
                <div
                  class="relative bottom-0 flex justify-between pb-0.5 pe-2.5 ps-1.5 composer-bottom-controls"
                >
                  <!-- Left Controls -->
                  <div class="flex gap-1">
                    <!-- Home Button -->
                    <div
                      class="relative shrink-0 my-1 h-9 overflow-hidden composer-home-button"
                    >
                      <button
                        type="button"
                        class="absolute flex items-center justify-center rounded-xl size-9 p-1 text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-black/30 dark:active:bg-black/20 disabled:active:bg-transparent disabled:active:bg-none composer-home-button-element"
                        disabled
                        aria-hidden="true"
                        aria-label="Go to home"
                        title="Go to home"
                        data-testid="home-button"
                      >
                        <svg
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          class="size-6"
                          aria-hidden="true"
                        >
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
                              <stop
                                offset="0.0955758"
                                stop-color="#00AEFF"
                              ></stop>
                              <stop
                                offset="0.773185"
                                stop-color="#2253CE"
                              ></stop>
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
                              <stop
                                offset="0.633728"
                                stop-color="#FF5F3D"
                              ></stop>
                              <stop
                                offset="0.923392"
                                stop-color="#C02B3C"
                              ></stop>
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
                              <stop
                                offset="0.843838"
                                stop-color="#0D91E1"
                              ></stop>
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
                              <stop
                                offset="0.0661714"
                                stop-color="#8C48FF"
                              ></stop>
                              <stop offset="0.5" stop-color="#F2598A"></stop>
                              <stop
                                offset="0.895833"
                                stop-color="#FFB152"
                              ></stop>
                            </radialGradient>
                            <linearGradient
                              id="paint5_linear_262034_2117"
                              x1="28.6736"
                              y1="8.30469"
                              x2="28.6627"
                              y2="13.617"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop
                                offset="0.0581535"
                                stop-color="#F8ADFA"
                              ></stop>
                              <stop
                                offset="0.708063"
                                stop-color="#A86EDD"
                                stop-opacity="0"
                              ></stop>
                            </linearGradient>
                          </defs>
                        </svg>
                      </button>
                    </div>

                    <!-- Left Action Buttons -->
                    <div class="flex gap-2 items-center">
                      <!-- Create/Open Button -->
                      <div class="relative">
                        <button
                          aria-label="Open"
                          type="button"
                          class="relative flex items-center text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-black/30 dark:active:bg-black/20 text-sm justify-center min-h-9 min-w-9 after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 h-9 select-none gap-1 rounded-2xl border border-black/8 dark:border-white/8 p-0"
                          title="Open"
                          data-testid="composer-create-button"
                          data-spatial-navigation-autofocus="false"
                          @click="fileInputRef?.click()"
                        >
                          <div
                            class="bg-current forced-color-adjust-none size-6 composer-add-icon"
                          ></div>
                        </button>
                      </div>

                      <!-- Smart Mode Button -->
                      <div class="relative">
                        <button
                          aria-label="Smart (GPT-5)"
                          type="button"
                          class="relative flex items-center text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-black/30 dark:active:bg-black/20 text-sm justify-center min-h-9 min-w-9 px-2.5 py-1 after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 h-9 select-none gap-1 rounded-2xl border border-black/8 dark:border-white/8 ps-2.5 pe-2.5"
                          title="Smart (GPT-5)"
                          data-testid="composer-chat-mode-smart-button"
                          data-spatial-navigation-autofocus="false"
                          @click="handleModeChange('smart')"
                        >
                          <span elementtiming="composer-input" class="text-sm"
                            >Smart (GPT-5)</span
                          >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            class="size-4 rotate-90"
                          >
                            <path
                              d="M8.46967 4.21967C8.17678 4.51256 8.17678 4.98744 8.46967 5.28033L15.1893 12L8.46967 18.7197C8.17678 19.0126 8.17678 19.4874 8.46967 19.7803C8.76256 20.0732 9.23744 20.0732 9.53033 19.7803L16.7803 12.5303C17.0732 12.2374 17.0732 11.7626 16.7803 11.4697L9.53033 4.21967C9.23744 3.92678 8.76256 3.92678 8.46967 4.21967Z"
                            ></path>
                          </svg>
                        </button>
                      </div>

                      <!-- Hidden Dialog Placeholder -->
                      <dialog
                        class="fixed inset-0 m-auto rounded-4xl border border-white/10 bg-background-150 text-foreground-800 shadow-xl dark:bg-background-250 backdrop:bg-background-850/30 dark:backdrop:bg-background-150/70 composer-hidden-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="dialog-placeholder"
                      ></dialog>
                    </div>
                  </div>

                  <!-- Right Controls -->
                  <div class="flex gap-2 items-center">
                    <!-- Talk to Copilot Button -->
                    <div class="relative">
                      <button
                        aria-label="Talk to Copilot"
                        type="button"
                        class="relative flex items-center text-foreground-800 fill-foreground-800 active:text-foreground-600 active:fill-foreground-600 dark:active:text-foreground-650 dark:active:fill-foreground-650 bg-transparent safe-hover:bg-black/5 active:bg-black/3 dark:safe-hover:bg-black/30 dark:active:bg-black/20 text-sm justify-center min-h-9 min-w-9 after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 h-9 select-none gap-1 rounded-2xl p-0"
                        title="Talk to Copilot"
                        data-testid="audio-call-button"
                        data-spatial-navigation-autofocus="false"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          class="size-6"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M16.7673 6.54284C16.7673 3.91128 14.634 1.77799 12.0024 1.77799C9.37089 1.77799 7.2376 3.91129 7.2376 6.54284L7.2376 13.5647C7.2376 16.1963 9.37089 18.3296 12.0024 18.3296C14.634 18.3296 16.7673 16.1963 16.7673 13.5647L16.7673 6.54284ZM12.0024 3.28268C13.803 3.28268 15.2626 4.7423 15.2626 6.54284L15.2626 13.5647C15.2626 15.3652 13.803 16.8249 12.0024 16.8249C10.2019 16.8249 8.74229 15.3652 8.74229 13.5647L8.74229 6.54284C8.74229 4.7423 10.2019 3.28268 12.0024 3.28268Z"
                            fill="currentColor"
                          ></path>
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M20.0274 8.79987C19.6119 8.79987 19.2751 9.1367 19.2751 9.55221V13.5647C19.2751 17.5813 16.019 20.8374 12.0024 20.8374C7.98587 20.8374 4.72979 17.5813 4.72979 13.5647L4.72979 9.55221C4.72979 9.1367 4.39295 8.79987 3.97744 8.79987C3.56193 8.79987 3.2251 9.1367 3.2251 9.55221L3.2251 13.5647C3.2251 18.4123 7.15485 22.3421 12.0024 22.3421C16.85 22.3421 20.7798 18.4123 20.7798 13.5647V9.55221C20.7798 9.1367 20.443 8.79987 20.0274 8.79987Z"
                            fill="currentColor"
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
      </div>

      <!-- Starter Prompts -->
      <div
        class="flex h-[150px] w-full max-w-chat flex-none items-end px-2 sm:flex-initial sm:items-start z-20 composer-starter-prompts"
        role="region"
        aria-label="Quick action prompts"
      >
        <div
          class="mx-auto flex w-full flex-col gap-3 px-2 pointer-events-auto sm:mt-8"
        >
          <div
            role="list"
            class="flex w-full gap-2 px-1 py-1 sm:flex-wrap sm:py-4 scrollbar-container max-h-[110px] overflow-x-auto overflow-y-hidden sm:justify-start composer-prompts-list"
            v-memo="[inputValue.length > 0]"
          >
            <!-- Starter Prompt Buttons -->
            <button
              v-for="(prompt, index) in starterPrompts"
              :key="prompt.text"
              type="button"
              class="shadow-none dark:shadow-none relative flex items-center text-sm min-h-10 px-3 py-2 gap-x-2 rounded-xl after:rounded-xl after:absolute after:inset-0 after:pointer-events-none after:border after:border-transparent after:contrast-more:border-2 outline-2 outline-offset-1 focus-visible:z-[1] focus-visible:outline focus-visible:outline-stroke-900 text-foreground-550 active:text-foreground-350 dark:text-foreground-600 active:dark:text-foreground-550 bg-white/30 safe-hover:bg-black/3 active:bg-black/2 dark:bg-black/3 dark:safe-hover:bg-white/5 dark:active:bg-white/3 border-[1px] border-black/8 dark:border-white/8 min-w-fit"
              role="button"
              tabindex="0"
              :aria-label="prompt.label"
              :data-testid="`starter-prompt-${prompt.text.toLowerCase().replace(/\s+/g, '-')}`"
              :data-item-id="prompt.text.toLowerCase().replace(/\s+/g, '-')"
              @click="handleStarterPrompt(prompt.text)"
              @keydown.enter="handleStarterPrompt(prompt.text)"
              @keydown.space.prevent="handleStarterPrompt(prompt.text)"
            >
              <span class="px-1 text-sm">{{ prompt.text }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch, onMounted } from 'vue'

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Props
interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  autoFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Message Copilot',
  disabled: false,
  maxLength: 10000,
  autoFocus: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': [value: string]
  'file-upload': [files: FileList]
  'mode-change': [mode: string]
}>()

// Reactive data
const inputValue = ref(props.modelValue)
const isComposing = ref(false)
const fileInputRef = ref<HTMLInputElement>()
const textareaRef = ref<HTMLTextAreaElement>()

// Error handling
const errorMessage = ref('')
const isOverLimit = ref(false)
const showError = ref(false)

// Computed properties
const canSubmit = computed(() => {
  return inputValue.value.trim().length > 0 && !props.disabled && !isOverLimit.value
})

const hasContent = computed(() => {
  return inputValue.value.trim().length > 0
})

const characterCount = computed(() => {
  return inputValue.value.length
})

const isNearLimit = computed(() => {
  return props.maxLength && characterCount.value > props.maxLength * 0.9
})

// Memoized prompts array to avoid recreation
const starterPrompts = computed(() => [
  { text: 'Create an image', label: 'Create an image - starter prompt 1 of 8' },
  { text: 'Recommend a product', label: 'Recommend a product - starter prompt 2 of 8' },
  { text: 'Improve writing', label: 'Improve writing - starter prompt 3 of 8' },
  { text: 'Write a first draft', label: 'Write a first draft - starter prompt 4 of 8' },
  { text: 'Say it with care', label: 'Say it with care - starter prompt 5 of 8' },
  { text: 'Design a logo', label: 'Design a logo - starter prompt 6 of 8' },
  { text: 'Get advice', label: 'Get advice - starter prompt 7 of 8' },
  { text: 'Draft a text', label: 'Draft a text - starter prompt 8 of 8' }
])

// Methods
const debouncedAdjustHeight = debounce(adjustTextareaHeight, 100)

const validateInput = () => {
  const value = inputValue.value
  isOverLimit.value = props.maxLength ? value.length > props.maxLength : false

  if (isOverLimit.value) {
    errorMessage.value = `输入内容超过最大长度限制 ${props.maxLength} 个字符`
    showError.value = true
  } else if (isNearLimit.value) {
    errorMessage.value = `即将达到最大长度限制 (${characterCount.value}/${props.maxLength})`
    showError.value = true
  } else {
    errorMessage.value = ''
    showError.value = false
  }
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const newValue = target.value

  // Prevent input if over limit
  if (props.maxLength && newValue.length > props.maxLength) {
    inputValue.value = newValue.substring(0, props.maxLength)
    target.value = inputValue.value
  } else {
    inputValue.value = newValue
  }

  emit('update:modelValue', inputValue.value)
  validateInput()
  debouncedAdjustHeight()
}

const handleKeydown = (event: KeyboardEvent) => {
  // Only prevent default and submit if Enter is pressed without Shift and not composing
  if (event.key === 'Enter' && !event.shiftKey && !isComposing.value && canSubmit.value) {
    event.preventDefault()
    handleSubmit()
  }
}

const handleSubmit = () => {
  if (!canSubmit.value) return

  const value = inputValue.value.trim()
  emit('submit', value)

  // Clear input after submit
  inputValue.value = ''
  emit('update:modelValue', '')
  adjustTextareaHeight()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('file-upload', target.files)
  }
  // Reset file input
  target.value = ''
}

const handleModeChange = (mode: string) => {
  emit('mode-change', mode)
}

const handleStarterPrompt = (promptText: string) => {
  inputValue.value = promptText
  emit('update:modelValue', promptText)
  adjustTextareaHeight()

  // Focus textarea after setting value
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const adjustTextareaHeight = () => {
  const textarea = textareaRef.value
  if (textarea) {
    // Store current scroll position
    const scrollTop = textarea.scrollTop

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'

    // Calculate new height with constraints
    const minHeight = 22 // Minimum height in pixels
    const maxHeight = 200 // Maximum height in pixels
    const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight))

    textarea.style.height = newHeight + 'px'

    // Restore scroll position if it was scrolled
    textarea.scrollTop = scrollTop
  }
}

// Watch for external model value changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== inputValue.value) {
    inputValue.value = newValue
    nextTick(() => adjustTextareaHeight())
  }
})

// Auto focus on mount if requested
onMounted(() => {
  if (props.autoFocus) {
    nextTick(() => {
      textareaRef.value?.focus()
    })
  }
})

// Expose methods for parent components
defineExpose({
  focus: () => textareaRef.value?.focus(),
  clear: () => {
    inputValue.value = ''
    emit('update:modelValue', '')
    adjustTextareaHeight()
  }
})
</script>

<style scoped>
/* Composer-specific styles */

/* Main container styles */
.composer-main-container {
  will-change: auto;
  opacity: 1;
  transform: none;
}

.composer-input-container {
  transform: none;
  transform-origin: 50% 50% 0px;
  opacity: 1;
}

.composer-input-background {
  border-radius: 32px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 16px 24px 0px;
  transform: none;
  transform-origin: 50% 50% 0px;
  opacity: 1;
}

.composer-shadow-effect {
  box-shadow: rgba(248, 188, 140, 0.18) 0px 16px 48px 0px, rgba(0, 0, 0, 0.08) 0px 16px 24px 0px;
}

.composer-content-container {
  border-radius: 32px;
  box-shadow: rgb(255, 255, 255) 0px 0px 0px 1px inset;
  transform: none;
  transform-origin: 50% 50% 0px;
  opacity: 1;
}

.composer-gradient-background {
  border-radius: 32px;
  box-shadow: rgb(255, 255, 255) 0px 0px 0px 1px inset;
  transform: none;
  transform-origin: 50% 50% 0px;
}

.composer-content-background {
  border-radius: 26px;
  transform: none;
  transform-origin: 50% 50% 0px;
}

.composer-input-wrapper {
  transform: none;
  transform-origin: 50% 50% 0px;
}

.composer-placeholder {
  transform: none;
  transform-origin: 50% 50% 0px;
}

.composer-input-area {
  transform: none;
  transform-origin: 50% 50% 0px;
}

.composer-input-relative {
  transform: none;
  transform-origin: 50% 50% 0px;
}

.composer-input-cursor {
  transform: none;
  transform-origin: 50% 50% 0px;
}

.composer-input-flex {
  transform: none;
  transform-origin: 50% 50% 0px;
}


.composer-bottom-controls {
  transform: none;
  transform-origin: 50% 50% 0px;
}

.composer-home-button {
  transform: none;
  transform-origin: 50% 50% 0px;
}

.composer-home-button-element {
  transform: none;
  transform-origin: 50% 50% 0px;
}

.composer-add-icon {
  mask-image: url("/static/cmc/assets/add-BTcFT5ig.svg");
  mask-repeat: no-repeat;
  mask-position: center center;
  mask-size: contain;
}

.composer-hidden-dialog {
  opacity: 0;
}

.composer-starter-prompts {
  opacity: 1;
}

.composer-prompts-list {
  opacity: 1;
}

/* Error and validation styles */
.composer-error-message {
  @apply mt-2 px-3 py-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md dark:text-red-400 dark:bg-red-950 dark:border-red-800;
}

.composer-char-counter {
  @apply mt-1 px-3 text-xs text-foreground-500 text-right;
}

/* Accessibility styles */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
