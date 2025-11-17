package com.utils;

import org.apache.commons.lang3.StringUtils;

/**
 * 密码复杂度验证工具类
 */
public class PasswordValidator {
    
    /**
     * 验证密码复杂度
     * 规则：至少8位，包含大小写字母和数字
     * @param password 密码
     * @return 验证结果，null表示通过，否则返回错误信息
     */
    public static String validate(String password) {
        if (StringUtils.isBlank(password)) {
            return "密码不能为空";
        }
        
        if (password.length() < 8) {
            return "密码长度至少8位";
        }
        
        boolean hasUpperCase = false;
        boolean hasLowerCase = false;
        boolean hasDigit = false;
        
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) {
                hasUpperCase = true;
            } else if (Character.isLowerCase(c)) {
                hasLowerCase = true;
            } else if (Character.isDigit(c)) {
                hasDigit = true;
            }
        }
        
        if (!hasUpperCase) {
            return "密码必须包含至少一个大写字母";
        }
        
        if (!hasLowerCase) {
            return "密码必须包含至少一个小写字母";
        }
        
        if (!hasDigit) {
            return "密码必须包含至少一个数字";
        }
        
        return null; // 验证通过
    }
    
    /**
     * 检查密码是否符合复杂度要求
     * @param password 密码
     * @return 是否符合要求
     */
    public static boolean isValid(String password) {
        return validate(password) == null;
    }
}

