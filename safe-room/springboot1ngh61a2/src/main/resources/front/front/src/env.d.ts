/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, any>, Record<string, any>, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_BASE_API: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv & {
    readonly DEV: boolean
    readonly PROD: boolean
    readonly MODE: string
  }
}

// Vue 全局属性类型声明
import type { AxiosInstance } from 'axios'
import type config from '@/config/config'
import type validate from '@/common/validate'

declare module 'vue' {
  interface ComponentCustomProperties {
    $config: typeof config
    $validate: typeof validate
    isAuth: (tableName: string, key: string) => boolean
    isBackAuth: (tableName: string, key: string) => boolean
    getCurDateTime: () => string
    getCurDate: () => string
    encryptDes: (message: string) => string
    decryptDes: (ciphertext: string) => string
    encryptAes: (msg: string) => string
    decryptAes: (msg: string) => string
    $http: AxiosInstance
  }
}

