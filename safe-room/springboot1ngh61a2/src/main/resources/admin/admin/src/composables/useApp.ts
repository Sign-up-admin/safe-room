/**
 * 应用级组合式函数
 * 提供全局工具函数的访问
 */
import { getCurrentInstance } from 'vue'
import type { ComponentInternalInstance } from 'vue'
import * as echarts from 'echarts'
import md5 from 'js-md5'
import { isAuth, getCurDate, getCurDateTime } from '@/utils/utils'
import base from '@/utils/base'
import storage from '@/utils/storage'
import * as validate from '@/utils/validate'
import http from '@/utils/http'
import api from '@/utils/api'

/**
 * 获取全局属性（向后兼容）
 */
export function useApp() {
  const instance = getCurrentInstance() as ComponentInternalInstance | null
  const app = instance?.appContext.app

  return {
    // 工具函数
    $validate: validate,
    $http: http,
    $echarts: echarts,
    $base: base.get(),
    $project: base.getProjectName(),
    $storage: storage,
    $api: api,
    isAuth,
    getCurDateTime,
    getCurDate,
    $md5: md5,
  }
}

/**
 * 直接导出工具函数（推荐使用）
 */
export { validate, http, api, storage, base, isAuth, getCurDate, getCurDateTime }
export { default as md5 } from 'js-md5'

