/**
 * 表单操作组合式函数
 * 提供通用的表单提交、验证等功能
 */
import { ref, reactive, computed, type Ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'
import { errorHandler } from '@/utils/errorHandler'
import type { ApiResponse } from './useCrud'

export interface FormOptions {
  moduleKey: string
  onSuccess?: () => void
  onError?: (error: any) => void
}

/**
 * 表单组合式函数
 */
export function useForm<T extends Record<string, any> = Record<string, any>>(
  options: FormOptions
) {
  const { moduleKey, onSuccess, onError } = options

  const formVisible = ref(false)
  const isEditing = ref(false)
  const submitting = ref(false)
  const formRef = ref<FormInstance>()
  const formModel = reactive<Record<string, any>>({}) as T

  /**
   * 打开表单
   */
  function openForm(row?: T) {
    isEditing.value = !!row
    resetForm(row)
    formVisible.value = true
  }

  /**
   * 关闭表单
   */
  function closeForm() {
    formVisible.value = false
  }

  /**
   * 重置表单
   */
  function resetForm(row?: T) {
    // 清空表单
    Object.keys(formModel).forEach(key => {
      delete formModel[key as keyof typeof formModel]
    })
    // 填充数据
    if (row) {
      Object.keys(row).forEach(key => {
        (formModel as any)[key] = row[key as keyof T]
      })
    }
  }

  /**
   * 提交表单
   */
  async function submitForm() {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
    } catch {
      return
    }

    submitting.value = true
    try {
      const endpoint = isEditing.value ? 'update' : 'save'
      const response = await http.post<ApiResponse>(`/${moduleKey}/${endpoint}`, formModel)

      if (response.data.code === 0) {
        ElMessage.success('操作成功')
        formVisible.value = false
        onSuccess?.()
      } else {
        const message = response.data?.msg || '保存失败'
        ElMessage.error(message)
        onError?.(response.data)
      }
    } catch (error: any) {
      // 使用统一错误处理器处理错误
      errorHandler.handleApiError(error, {
        showToast: true,
        redirect: false, // 表单错误通常不需要跳转
        logToConsole: true,
        context: `${moduleKey} Form Submit`
      }).catch(() => {
        // 错误处理器返回rejected promise，这里不需要额外处理
      })
      onError?.(error)
    } finally {
      submitting.value = false
    }
  }

  return {
    formVisible,
    isEditing,
    submitting,
    formRef,
    formModel,
    openForm,
    closeForm,
    resetForm,
    submitForm,
  }
}
