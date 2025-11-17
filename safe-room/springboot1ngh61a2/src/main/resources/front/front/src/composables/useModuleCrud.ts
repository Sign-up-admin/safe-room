import { computed, reactive, ref, watch, toRaw } from 'vue'
import type { ModuleKey, ModuleEntityMap } from '@/types/modules'
import type { PageParams } from '@/types/api'
import { getModuleConfig } from '@/config/modules'
import { getModuleService } from '@/services/crud'

interface PaginationState {
  page: number
  limit: number
  total: number
}

export function useModuleList<K extends ModuleKey>(key: K, initialParams: Partial<PageParams> = {}) {
  const config = getModuleConfig(key)
  const service = getModuleService(key)
  const loading = ref(false)
  const records = ref<ModuleEntityMap[K][]>([])
  const pagination = reactive<PaginationState>({
    page: initialParams.page || 1,
    limit: initialParams.limit || 10,
    total: 0,
  })
  const searchForm = reactive<Record<string, any>>({})

  const listParams = computed(() => ({
    page: pagination.page,
    limit: pagination.limit,
    ...(config.defaultSort ? { sort: config.defaultSort.prop, order: config.defaultSort.order } : {}),
    ...initialParams,
    ...searchForm,
  }))

  async function fetchList() {
    loading.value = true
    try {
      const data = await service.list(listParams.value)
      records.value = data.list
      pagination.total = data.total
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    pagination.page = 1
    fetchList()
  }

  function resetSearch() {
    Object.keys(searchForm).forEach(key => {
      searchForm[key] = undefined
    })
    pagination.page = 1
    fetchList()
  }

  function handlePageChange(page: number) {
    pagination.page = page
    fetchList()
  }

  function handlePageSizeChange(size: number) {
    pagination.limit = size
    pagination.page = 1
    fetchList()
  }

  watch(
    () => [listParams.value.page, listParams.value.limit],
    () => {
      fetchList()
    },
    { immediate: true },
  )

  return {
    config,
    loading,
    records,
    pagination,
    searchForm,
    fetchList,
    handleSearch,
    resetSearch,
    handlePageChange,
    handlePageSizeChange,
  }
}

export function useModuleDetail<K extends ModuleKey>(key: K) {
  const service = getModuleService(key)
  const loading = ref(false)
  const record = ref<ModuleEntityMap[K] | null>(null)

  async function fetchDetail(id: number | string) {
    loading.value = true
    try {
      record.value = await service.detail(id)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    record,
    fetchDetail,
  }
}

export function useModuleForm<K extends ModuleKey>(key: K, initialData: Partial<ModuleEntityMap[K]> = {}) {
  const service = getModuleService(key)
  const config = getModuleConfig(key)
  const formModel = reactive<Partial<ModuleEntityMap[K]>>({ ...initialData })
  const saving = ref(false)

  function setFormData(data: Partial<ModuleEntityMap[K]>) {
    Object.assign(formModel, data)
  }

  async function submit(isEdit = false) {
    saving.value = true
    try {
      const formData = toRaw(formModel) as Partial<ModuleEntityMap[K]>
      if (isEdit) {
        await service.update(formData)
      } else {
        await service.create(formData)
      }
    } finally {
      saving.value = false
    }
  }

  function resetForm() {
    Object.keys(formModel).forEach(key => {
      delete formModel[key as keyof typeof formModel]
    })
    Object.assign(formModel, initialData)
  }

  return {
    config,
    formModel,
    saving,
    setFormData,
    submit,
    resetForm,
  }
}
