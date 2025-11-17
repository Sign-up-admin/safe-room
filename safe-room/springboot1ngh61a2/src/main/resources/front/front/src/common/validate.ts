type ValidatorRule = (rule: any, value: any, callback: (error?: Error) => void) => void

interface Validate {
  isEmail2: (s: string) => boolean
  isEmail: ValidatorRule
  isEmailNotNull: ValidatorRule
  isMobile2: (s: string) => boolean
  isMobile: ValidatorRule
  isMobileNotNull: ValidatorRule
  isPhone: ValidatorRule
  isPhone2: (s: string) => boolean
  isPhoneNotNull: ValidatorRule
  isURL: ValidatorRule
  isURL2: (s: string) => boolean
  isURLNotNull: ValidatorRule
  isNumber: ValidatorRule
  isNumber2: (s: string) => boolean
  isNumberNotNull: ValidatorRule
  isIntNumer: ValidatorRule
  isIntNumer2: (s: string) => boolean
  isIntNumerNotNull: ValidatorRule
  isIdCard: ValidatorRule
  isIdCard2: (idcard: string) => boolean
  isIdCardNotNull: ValidatorRule
}

const validate: Validate = {
  isEmail2: function (s: string): boolean {
    return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s)
  },
  isEmail: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的邮箱'))
    } else {
      callback()
    }
  },
  isEmailNotNull: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的邮箱'))
    } else if (!value) {
      callback(new Error('请输入邮箱'))
    } else {
      callback()
    }
  },
  isMobile2: function (s: string): boolean {
    return /^1[3456789]\d{9}$/.test(s)
  },
  isMobile: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /^1[3456789]\d{9}$/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的手机号码'))
    } else {
      callback()
    }
  },
  isMobileNotNull: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /^1[3456789]\d{9}$/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的手机号码'))
    } else if (!value) {
      callback(new Error('请输入手机号码'))
    } else {
      callback()
    }
  },
  isPhone: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /^([0-9]{3,4}-)?[0-9]{7,8}$/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的电话号码'))
    } else {
      callback()
    }
  },
  isPhone2: function (s: string): boolean {
    return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s)
  },
  isPhoneNotNull: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /^([0-9]{3,4}-)?[0-9]{7,8}$/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的电话号码'))
    } else if (!value) {
      callback(new Error('请输入电话号码'))
    } else {
      callback()
    }
  },
  isURL: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /^http[s]?:\/\/.*/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的URL地址'))
    } else {
      callback()
    }
  },
  isURL2: function (s: string): boolean {
    return /^http[s]?:\/\/.*/.test(s)
  },
  isURLNotNull: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /^http[s]?:\/\/.*/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的URL地址'))
    } else if (!value) {
      callback(new Error('请输入地址'))
    } else {
      callback()
    }
  },
  isNumber: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /(^-?[+-]?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)([eE][+-]?[0-9]+)?$)|(^$)/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的数字'))
    } else {
      callback()
    }
  },
  isNumber2: function (s: string): boolean {
    return /(^-?[+-]?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)([eE][+-]?[0-9]+)?$)|(^$)/.test(s)
  },
  isNumberNotNull: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /(^-?[+-]?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)([eE][+-]?[0-9]+)?$)|(^$)/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的数字'))
    } else if (!value) {
      callback(new Error('请输入数字'))
    } else {
      callback()
    }
  },
  isIntNumer: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /(^-?\d+$)|(^$)/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的整数'))
    } else {
      callback()
    }
  },
  isIntNumer2: function (s: string): boolean {
    return /(^-?\d+$)|(^$)/.test(s)
  },
  isIntNumerNotNull: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /(^-?\d+$)|(^$)/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的整数'))
    } else if (!value) {
      callback(new Error('请输入整数'))
    } else {
      callback()
    }
  },
  isIdCard: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的身份证'))
    } else {
      callback()
    }
  },
  isIdCard2: function (idcard: string): boolean {
    const regIdCard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (!regIdCard.test(idcard)) {
      return false
    } else {
      return true
    }
  },
  isIdCardNotNull: function (rule: any, value: any, callback: (error?: Error) => void): void {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (value && reg.test(value) === false) {
      callback(new Error('请输入正确的身份证'))
    } else if (!value) {
      callback(new Error('请输入身份证'))
    } else {
      callback()
    }
  },
}

export default validate

