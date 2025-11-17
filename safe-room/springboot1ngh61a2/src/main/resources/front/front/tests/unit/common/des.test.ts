import { vi } from 'vitest'

vi.mock('@/common/cryptojs.js', async () => {
  const CryptoJS = await import('crypto-js')
  return {
    default: CryptoJS,
    __esModule: true,
  }
})

import { decryptAes, decryptDes, encryptAes, encryptDes } from '@/common/des'

describe('encryption helpers', () => {
  it('encrypts and decrypts DES payloads', () => {
    const plaintext = 'hello-des'
    const cipher = encryptDes(plaintext)
    expect(cipher).not.toBe(plaintext)
    expect(decryptDes(cipher)).toBe(plaintext)
  })

  it('encrypts and decrypts AES payloads', () => {
    const plaintext = 'hello-aes'
    const cipher = encryptAes(plaintext)
    expect(cipher).not.toBe(plaintext)
    expect(decryptAes(cipher)).toBe(plaintext)
  })
})


