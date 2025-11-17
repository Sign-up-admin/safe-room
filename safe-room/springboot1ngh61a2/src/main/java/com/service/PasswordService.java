package com.service;

import java.util.Date;
import java.util.Calendar;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import com.utils.PasswordEncoderUtil;
import com.utils.PasswordValidator;

/**
 * 密码服务类
 * 处理密码验证、迁移和锁定逻辑
 */
@Service
public class PasswordService {
    
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 30;
    
    /**
     * 验证密码（支持旧密码迁移）
     * @param rawPassword 原始密码
     * @param passwordHash BCrypt哈希密码（可能为null）
     * @param legacyPassword 旧密码（明文，用于迁移）
     * @return 是否验证通过
     */
    public boolean verifyPassword(String rawPassword, String passwordHash, String legacyPassword) {
        if (StringUtils.isBlank(rawPassword)) {
            return false;
        }
        
        // 优先验证BCrypt哈希
        if (StringUtils.isNotBlank(passwordHash) && PasswordEncoderUtil.isBCryptHash(passwordHash)) {
            return PasswordEncoderUtil.matches(rawPassword, passwordHash);
        }
        
        // 如果没有哈希，验证旧密码（用于迁移）
        if (StringUtils.isNotBlank(legacyPassword)) {
            return legacyPassword.equals(rawPassword);
        }
        
        return false;
    }
    
    /**
     * 检查账号是否被锁定
     * @param lockUntil 锁定到期时间
     * @return 是否被锁定
     */
    public boolean isAccountLocked(Date lockUntil) {
        if (lockUntil == null) {
            return false;
        }
        return lockUntil.after(new Date());
    }
    
    /**
     * 处理登录失败
     * @param failedAttempts 当前失败次数
     * @return 新的失败次数
     */
    public int handleLoginFailure(Integer failedAttempts) {
        if (failedAttempts == null) {
            failedAttempts = 0;
        }
        return failedAttempts + 1;
    }
    
    /**
     * 计算锁定到期时间
     * @return 锁定到期时间
     */
    public Date calculateLockUntil() {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.MINUTE, LOCK_DURATION_MINUTES);
        return cal.getTime();
    }
    
    /**
     * 检查是否需要锁定账号
     * @param failedAttempts 失败次数
     * @return 是否需要锁定
     */
    public boolean shouldLockAccount(Integer failedAttempts) {
        if (failedAttempts == null) {
            return false;
        }
        return failedAttempts >= MAX_FAILED_ATTEMPTS;
    }
    
    /**
     * 重置登录失败次数
     */
    public void resetFailedAttempts() {
        // 这个方法主要用于重置，实际重置操作在Service层完成
    }
    
    /**
     * 验证密码复杂度
     * @param password 密码
     * @return 错误信息，null表示通过
     */
    public String validatePasswordStrength(String password) {
        return PasswordValidator.validate(password);
    }
    
    /**
     * 生成随机密码
     * @return 随机密码
     */
    public String generateRandomPassword() {
        // 生成12位随机密码，包含大小写字母和数字
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 12; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}

