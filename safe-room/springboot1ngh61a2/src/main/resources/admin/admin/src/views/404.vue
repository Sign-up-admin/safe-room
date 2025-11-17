<template>
  <ErrorPage code="404" />
</template>

<script setup lang="ts" name="NotFound">
import { defineAsyncComponent } from 'vue'

const ErrorPage = defineAsyncComponent(() => import('./error/ErrorPage.vue'))
</script>
