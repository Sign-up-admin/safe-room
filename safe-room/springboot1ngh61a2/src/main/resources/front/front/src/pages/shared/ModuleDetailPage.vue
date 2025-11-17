<template>
  <div>
    <el-alert v-if="!recordId && !shouldFollow" type="warning" title="未指定要查看的数据" show-icon class="mb-16" />
    <ModuleDetail
      v-else-if="recordId || followRecordData"
      :module-key="moduleKey"
      :id="recordId"
      :prefetched="followRecordData"
      @back="goBack"
    />
    <el-skeleton v-else-if="followLoading" style="width: 100%" animated />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModuleDetail from '@/components/modules/ModuleDetail.vue'
import type { ModuleKey } from '@/types/modules'
import { followRecord } from '@/services/common'

const props = defineProps<{
  moduleKey: ModuleKey
  listRoute: string
}>()

const route = useRoute()
const router = useRouter()

const recordId = computed(() => route.query.id as string | undefined)
const followColumn = computed(() => route.query.followColumn as string | undefined)
const followValue = computed(() => route.query.followValue as string | undefined)
const shouldFollow = computed(() => !recordId.value && !!followColumn.value && !!followValue.value)
const followRecordData = ref<Record<string, any> | null>(null)
const followLoading = ref(false)

watch(
  () => [shouldFollow.value, followValue.value, followColumn.value],
  async () => {
    if (shouldFollow.value && followColumn.value && followValue.value) {
      await loadFollowRecord(followColumn.value, followValue.value)
    } else {
      followRecordData.value = null
    }
  },
  { immediate: true },
)

function goBack() {
  router.push(props.listRoute)
}

async function loadFollowRecord(column: string, value: string) {
  followLoading.value = true
  try {
    followRecordData.value = await followRecord(props.moduleKey, column, value)
  } catch (error) {
    console.warn('获取关联数据失败', error)
    followRecordData.value = null
  } finally {
    followLoading.value = false
  }
}
</script>

<style scoped>
.mb-16 {
  margin-bottom: 16px;
}
</style>


