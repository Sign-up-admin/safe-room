import CryptoJS from 'crypto-js'

const KEY = '1234567890123456'
const IV = ''

// DES加密
export const encryptDes = (message: string): string => {
  const keyHex = (CryptoJS as any).enc.Utf8.parse(KEY)
  const encrypted = (CryptoJS as any).DES.encrypt(message, keyHex, {
    mode: (CryptoJS as any).mode.ECB,
    padding: (CryptoJS as any).pad.Pkcs7,
  })
  return encrypted.toString()
}

// DES解密
export const decryptDes = (ciphertext: string): string => {
  const keyHex = (CryptoJS as any).enc.Utf8.parse(KEY)
  // direct decrypt ciphertext
  const decrypted = (CryptoJS as any).DES.decrypt(
    {
      ciphertext: (CryptoJS as any).enc.Base64.parse(ciphertext),
    },
    keyHex,
    {
      mode: (CryptoJS as any).mode.ECB,
      padding: (CryptoJS as any).pad.Pkcs7,
    },
  )
  return decrypted.toString((CryptoJS as any).enc.Utf8)
}

export const encryptAes = (msg: string): string => {
  const cmode = (CryptoJS as any).mode.CBC
  const cpad = (CryptoJS as any).pad.Pkcs7
  const ciphertext = (CryptoJS as any).AES.encrypt(msg, (CryptoJS as any).enc.Utf8.parse(KEY), {
    mode: cmode,
    padding: cpad,
    iv: (CryptoJS as any).enc.Utf8.parse(IV),
  }).toString()
  return ciphertext
}

export const decryptAes = (msg: string): string => {
  const cmode = (CryptoJS as any).mode.CBC
  const cpad = (CryptoJS as any).pad.Pkcs7
  const bytes = (CryptoJS as any).AES.decrypt(msg, (CryptoJS as any).enc.Utf8.parse(KEY), {
    mode: cmode,
    padding: cpad,
    iv: (CryptoJS as any).enc.Utf8.parse(IV),
  })
  const originText = bytes.toString((CryptoJS as any).enc.Utf8)
  return originText
}
