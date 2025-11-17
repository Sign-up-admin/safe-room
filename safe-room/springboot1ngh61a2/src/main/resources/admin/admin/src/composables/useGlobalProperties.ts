/**
 * 全局属性组合式函数
 * 使用 provide/inject 替代全局属性注入，提供更好的类型安全和组合式API支持
 */
import { inject, provide, type InjectionKey } from 'vue'
import type { App } from 'vue'
import http from '@/utils/http'
import * as echarts from 'echarts'
import base from '@/utils/base'
import storage from '@/utils/storage'
import api from '@/utils/api'
import * as validate from '@/utils/validate'
import { isAuth, getCurDate, getCurDateTime } from '@/utils/utils'
import md5 from 'js-md5'

/**
 * 全局属性接口
 */
export interface GlobalProperties {
  $http: typeof http
  $echarts: typeof echarts
  $base: ReturnType<typeof base.get>
  $project: ReturnType<typeof base.getProjectName>
  $storage: typeof storage
  $api: typeof api
  $validate: typeof validate
  isAuth: typeof isAuth
  getCurDateTime: typeof getCurDateTime
  getCurDate: typeof getCurDate
  $md5: typeof md5
}

/**
 * Injection key for global properties
 */
export const GLOBAL_PROPERTIES_KEY: InjectionKey<GlobalProperties> = Symbol('globalProperties')

/**
 * 提供全局属性
 */
export function provideGlobalProperties(app: App) {
  const globalProperties: GlobalProperties = {
    $http: http,
    $echarts: echarts,
    $base: base.get(),
    $project: base.getProjectName(),
    $storage: storage,
    $api: api,
    $validate: validate,
    isAuth,
    getCurDateTime,
    getCurDate,
    $md5: md5,
  }

  // 使用 provide 提供给所有子组件
  app.provide(GLOBAL_PROPERTIES_KEY, globalProperties)

  // 为了向后兼容，仍然设置全局属性（但推荐使用 inject）
  Object.assign(app.config.globalProperties, globalProperties)
}

/**
 * 注入全局属性（组合式API）
 */
export function useGlobalProperties(): GlobalProperties {
  const properties = inject(GLOBAL_PROPERTIES_KEY)
  if (!properties) {
    throw new Error('useGlobalProperties must be used within a component that has provideGlobalProperties')
  }
  return properties
}

