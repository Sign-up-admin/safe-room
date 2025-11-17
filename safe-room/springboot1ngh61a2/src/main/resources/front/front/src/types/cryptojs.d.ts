declare module '@/common/cryptojs.js' {
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
    encrypt(
      message: string | WordArray,
      key: WordArray,
      cfg?: { mode?: any; padding?: any },
    ): CipherParams
    decrypt(
      ciphertext: string | CipherParams,
      key: WordArray,
      cfg?: { mode?: any; padding?: any },
    ): WordArray
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
}

