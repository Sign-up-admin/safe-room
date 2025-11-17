<template>
  <div v-if="html" :class="className" v-html="sanitizedHtml" />
  <div v-else :class="className">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { sanitizeHtml } from '@/utils/security'

interface Props {
  html?: string | null
  className?: string
  allowTags?: string[]
  allowAttrs?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  html: null,
  className: '',
  allowTags: undefined,
  allowAttrs: undefined,
})

const sanitizedHtml = computed(() => {
  if (!props.html) return ''

  const options: {
    ALLOWED_TAGS?: string[]
    ALLOWED_ATTR?: string[]
  } = {}

  if (props.allowTags) {
    options.ALLOWED_TAGS = props.allowTags
  }

  if (props.allowAttrs) {
    options.ALLOWED_ATTR = props.allowAttrs
  }

  return sanitizeHtml(props.html, options)
})
</script>
