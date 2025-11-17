/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.svg' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
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

declare module 'crypto-js' {
  export interface WordArray {
    toString(encoder?: any): string
  }

  export interface CipherParams {
    ciphertext: WordArray
  }

  export interface Encoder {
    stringify(wordArray: WordArray): string
    parse(str: string): WordArray
  }

  export interface Utf8 {
    parse(str: string): WordArray
  }

  export interface Base64 {
    parse(str: string): WordArray
  }

  export interface Mode {
    ECB: any
    CBC: any
  }

  export interface Pad {
    Pkcs7: any
  }

  export interface DES {
    encrypt(message: string | WordArray, key: WordArray, cfg?: { mode?: any; padding?: any }): CipherParams
    decrypt(ciphertext: string | CipherParams, key: WordArray, cfg?: { mode?: any; padding?: any }): WordArray
  }

  export interface AES {
    encrypt(
      message: string | WordArray,
      key: WordArray,
      cfg?: { mode?: any; padding?: any; iv?: WordArray },
    ): CipherParams
    decrypt(
      ciphertext: string | CipherParams,
      key: WordArray,
      cfg?: { mode?: any; padding?: any; iv?: WordArray },
    ): WordArray
  }

  export const enc: {
    Utf8: Utf8
    Base64: Base64
  }

  export const mode: Mode
  export const pad: Pad
  export const DES: DES
  export const AES: AES

  const CryptoJS: {
    enc: typeof enc
    mode: typeof mode
    pad: typeof pad
    DES: typeof DES
    AES: typeof AES
  }

  export default CryptoJS
}
