import { describe, it, expect } from 'vitest'
import { encryptDes, decryptDes, encryptAes, decryptAes } from '@/utils/des'

describe('DES/AES加密工具', () => {
  describe('DES加密解密', () => {
    it('应该能够加密字符串', () => {
      const message = 'test message'
      const encrypted = encryptDes(message)
      expect(encrypted).toBeTruthy()
      expect(encrypted).not.toBe(message)
      expect(typeof encrypted).toBe('string')
    })

    it('应该能够正确解密加密后的字符串', () => {
      const message = 'test message 123'
      const encrypted = encryptDes(message)
      const decrypted = decryptDes(encrypted)
      expect(decrypted).toBe(message)
    })

    it('应该能够处理中文字符', () => {
      const message = '测试中文消息'
      const encrypted = encryptDes(message)
      const decrypted = decryptDes(encrypted)
      expect(decrypted).toBe(message)
    })

    it('应该能够处理特殊字符', () => {
      const message = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const encrypted = encryptDes(message)
      const decrypted = decryptDes(encrypted)
      expect(decrypted).toBe(message)
    })

    it('应该能够处理空字符串', () => {
      const message = ''
      const encrypted = encryptDes(message)
      const decrypted = decryptDes(encrypted)
      expect(decrypted).toBe(message)
    })

    it('应该能够处理长字符串', () => {
      const message = 'a'.repeat(1000)
      const encrypted = encryptDes(message)
      const decrypted = decryptDes(encrypted)
      expect(decrypted).toBe(message)
    })
  })

  describe('AES加密解密', () => {
    it('应该能够加密字符串', () => {
      const message = 'test message'
      const encrypted = encryptAes(message)
      expect(encrypted).toBeTruthy()
      expect(encrypted).not.toBe(message)
      expect(typeof encrypted).toBe('string')
    })

    it('应该能够正确解密加密后的字符串', () => {
      const message = 'test message 123'
      const encrypted = encryptAes(message)
      const decrypted = decryptAes(encrypted)
      expect(decrypted).toBe(message)
    })

    it('应该能够处理中文字符', () => {
      const message = '测试中文消息'
      const encrypted = encryptAes(message)
      const decrypted = decryptAes(encrypted)
      expect(decrypted).toBe(message)
    })

    it('应该能够处理特殊字符', () => {
      const message = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const encrypted = encryptAes(message)
      const decrypted = decryptAes(encrypted)
      expect(decrypted).toBe(message)
    })

    it('应该能够处理空字符串', () => {
      const message = ''
      const encrypted = encryptAes(message)
      const decrypted = decryptAes(encrypted)
      expect(decrypted).toBe(message)
    })

    it('应该能够处理长字符串', () => {
      const message = 'a'.repeat(1000)
      const encrypted = encryptAes(message)
      const decrypted = decryptAes(encrypted)
      expect(decrypted).toBe(message)
    })
  })
})

