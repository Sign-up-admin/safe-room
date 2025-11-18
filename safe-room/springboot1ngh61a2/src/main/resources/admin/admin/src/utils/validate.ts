/**
 * 表单校验工具函数
 */

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证密码强度（至少6位）
 */
export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * 验证必填字段
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

/**
 * 验证密码确认
 */
export function validatePasswordConfirm(
  password: string,
  passwordConfirm: string,
): boolean {
  return password === passwordConfirm;
}

/**
 * 验证用户名（字母、数字、下划线，3-20位）
 */
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * 表单验证规则生成器
 */
export const rules = {
  required: (message: string = "此字段为必填项") => ({
    required: true,
    message,
    trigger: "blur",
    validator: (_rule: any, value: any, callback: Function) => {
      if (!validateRequired(value)) {
        callback(new Error(message));
      } else {
        callback();
      }
    },
  }),

  email: (message: string = "请输入有效的邮箱地址") => ({
    type: "email",
    message,
    trigger: "blur",
    validator: (_rule: any, value: any, callback: Function) => {
      if (!value || validateEmail(value)) {
        callback();
      } else {
        callback(new Error(message));
      }
    },
  }),

  phone: (message: string = "请输入有效的手机号") => ({
    pattern: /^1[3-9]\d{9}$/,
    message,
    trigger: "blur",
  }),

  password: (message: string = "密码长度至少6位") => ({
    min: 6,
    message,
    trigger: "blur",
  }),

  passwordConfirm: (
    passwordField: string = "password",
    message: string = "两次密码输入不一致",
  ) => ({
    validator: (_rule: any, value: any, callback: Function, form?: any) => {
      if (!value) {
        callback();
        return;
      }
      const password = form?.[passwordField];
      if (validatePasswordConfirm(password, value)) {
        callback();
      } else {
        callback(new Error(message));
      }
    },
    trigger: "blur",
  }),
};
