<template>
  <section class="module-placeholder">
    <el-empty :description="message">
      <template #default>
        <p>
          Module <code>{{ moduleName }}</code> is not yet implemented.
        </p>
        <p>Please check back later or contact the administrator.</p>
      </template>
    </el-empty>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  moduleName: string
}>()

const message = computed(() => `Coming soon: ${props.moduleName}`)
</script>

<style scoped>
.module-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 24px;
}
</style>
