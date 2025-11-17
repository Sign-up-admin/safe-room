import CryptoJS from './cryptojs.js'

const KEY = '1234567890123456'
const IV = 'abcdefghijklmnop'

// DES加密
export const encryptDes = (message: string): string => {
  const keyHex = CryptoJS.enc.Utf8.parse(KEY)
  const encrypted = CryptoJS.DES.encrypt(message, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.toString()
}

// DES解密
export const decryptDes = (ciphertext: string): string => {
  const keyHex = CryptoJS.enc.Utf8.parse(KEY)
  // direct decrypt ciphertext
  const decrypted = CryptoJS.DES.decrypt(
    {
      ciphertext: CryptoJS.enc.Base64.parse(ciphertext),
    },
    keyHex,
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    },
  )
  return decrypted.toString(CryptoJS.enc.Utf8)
}

export const encryptAes = (msg: string): string => {
  const cmode = CryptoJS.mode.CBC
  const cpad = CryptoJS.pad.Pkcs7
  const ciphertext = CryptoJS.AES.encrypt(msg, CryptoJS.enc.Utf8.parse(KEY), {
    mode: cmode,
    padding: cpad,
    iv: CryptoJS.enc.Utf8.parse(IV),
  }).toString()
  return ciphertext
}

export const decryptAes = (msg: string): string => {
  const cmode = CryptoJS.mode.CBC
  const cpad = CryptoJS.pad.Pkcs7
  const bytes = CryptoJS.AES.decrypt(msg, CryptoJS.enc.Utf8.parse(KEY), {
    mode: cmode,
    padding: cpad,
    iv: CryptoJS.enc.Utf8.parse(IV),
  })
  const originText = bytes.toString(CryptoJS.enc.Utf8)
  return originText
}

