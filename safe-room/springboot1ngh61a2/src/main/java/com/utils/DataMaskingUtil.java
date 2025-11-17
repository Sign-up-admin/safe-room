package com.utils;

import org.apache.commons.lang3.StringUtils;

/**
 * 敏感数据脱敏工具类
 * 用于日志输出时对敏感数据进行脱敏处理
 */
public class DataMaskingUtil {
    
    /**
     * 手机号脱敏
     * @param phone 手机号
     * @return 脱敏后的手机号，如：138****5678
     */
    public static String maskPhone(String phone) {
        if (StringUtils.isBlank(phone) || phone.length() < 7) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }
    
    /**
     * 身份证号脱敏
     * @param idCard 身份证号
     * @return 脱敏后的身份证号，如：110101********1234
     */
    public static String maskIdCard(String idCard) {
        if (StringUtils.isBlank(idCard) || idCard.length() < 8) {
            return idCard;
        }
        return idCard.substring(0, 6) + "********" + idCard.substring(idCard.length() - 4);
    }
    
    /**
     * 邮箱脱敏
     * @param email 邮箱
     * @return 脱敏后的邮箱，如：abc****@example.com
     */
    public static String maskEmail(String email) {
        if (StringUtils.isBlank(email) || !email.contains("@")) {
            return email;
        }
        String[] parts = email.split("@");
        if (parts[0].length() <= 2) {
            return email;
        }
        String prefix = parts[0].substring(0, 2);
        return prefix + "****@" + parts[1];
    }
    
    /**
     * 银行卡号脱敏
     * @param cardNumber 银行卡号
     * @return 脱敏后的银行卡号，如：6222********1234
     */
    public static String maskBankCard(String cardNumber) {
        if (StringUtils.isBlank(cardNumber) || cardNumber.length() < 8) {
            return cardNumber;
        }
        return cardNumber.substring(0, 4) + "********" + cardNumber.substring(cardNumber.length() - 4);
    }
    
    /**
     * 密码脱敏（完全隐藏）
     * @param password 密码
     * @return "******"
     */
    public static String maskPassword(String password) {
        if (StringUtils.isBlank(password)) {
            return password;
        }
        return "******";
    }
    
    /**
     * 姓名脱敏
     * @param name 姓名
     * @return 脱敏后的姓名，如：张*、李**
     */
    public static String maskName(String name) {
        if (StringUtils.isBlank(name)) {
            return name;
        }
        if (name.length() == 1) {
            return name;
        } else if (name.length() == 2) {
            return name.charAt(0) + "*";
        } else {
            return name.charAt(0) + "*" + name.charAt(name.length() - 1);
        }
    }
}

