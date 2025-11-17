<template>
  <div>
    <el-skeleton v-if="loading" :rows="6" animated />
    <ModuleForm
      v-else
      :module-key="moduleKey"
      :mode="isEdit ? 'edit' : 'create'"
      :initial-data="initialData"
      @success="handleSuccess"
      @cancel="goBack"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ModuleForm from '@/components/modules/ModuleForm.vue'
import type { ModuleKey } from '@/types/modules'
import { getModuleService } from '@/services/crud'

const props = defineProps<{
  moduleKey: ModuleKey
  listRoute: string
}>()

const route = useRoute()
const router = useRouter()
const service = getModuleService(props.moduleKey)

const isEdit = computed(() => Boolean(route.query.id))
const loading = ref(false)
const initialData = ref<Record<string, any> | undefined>()

watchEffect(() => {
  const id = route.query.id as string | undefined
  if (!id) {
    loading.value = false
    initialData.value = undefined
    return
  }
  loading.value = true
  service
    .detail(id)
    .then(data => {
      initialData.value = data
    })
    .finally(() => {
      loading.value = false
    })
})

function handleSuccess() {
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
  router.push(props.listRoute)
}

function goBack() {
  router.push(props.listRoute)
}
</script>
