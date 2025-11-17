declare module '@/common/cryptojs.js' {
  export interface WordArray {
    toString(encoder?: Encoder): string
    words: number[]
    sigBytes: number
  }

  export interface CipherParams {
    ciphertext: WordArray
    key?: WordArray
    iv?: WordArray
    salt?: WordArray
    algorithm?: string
    mode?: ModeInstance
    padding?: PadInstance
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

  export interface ModeInstance {
    name: string
  }

  export interface Mode {
    ECB: ModeInstance
    CBC: ModeInstance
  }

  export interface PadInstance {
    name: string
  }

  export interface Pad {
    Pkcs7: PadInstance
  }

  export interface DES {
    encrypt(message: string | WordArray, key: WordArray, cfg?: { mode?: ModeInstance; padding?: PadInstance }): CipherParams
    decrypt(ciphertext: string | CipherParams, key: WordArray, cfg?: { mode?: ModeInstance; padding?: PadInstance }): WordArray
  }

  export interface AES {
    encrypt(
      message: string | WordArray,
      key: WordArray,
      cfg?: { mode?: ModeInstance; padding?: PadInstance; iv?: WordArray },
    ): CipherParams
    decrypt(
      ciphertext: string | CipherParams,
      key: WordArray,
      cfg?: { mode?: ModeInstance; padding?: PadInstance; iv?: WordArray },
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
}
