/**
 * 邮箱验证
 */
export function isEmail(s: string): boolean {
  return /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s)
}

/**
 * 手机号码验证
 */
export function isMobile(s: string): boolean {
  return /^1[3456789]\d{9}$/.test(s)
}

/**
 * 电话号码验证
 */
export function isPhone(s: string): boolean {
  return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s)
}

/**
 * URL地址验证
 */
export function isURL(s: string): boolean {
  return /^http[s]?:\/\/.*/.test(s)
}

/**
 * 匹配数字，可以是小数，不可以是负数,可以为空
 */
export function isNumber(s: string): boolean {
  return /(^-?[+-]?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)([eE][+-]?[0-9]+)?$)|(^$)/.test(s)
}

/**
 * 匹配整数，可以为空
 */
export function isIntNumer(s: string): boolean {
  return /(^-?\d+$)|(^$)/.test(s)
}

/**
 * 身份证校验
 */
export function checkIdCard(idcard: string): boolean {
  const regIdCard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (!regIdCard.test(idcard)) {
    return false
  } else {
    return true
  }
}
