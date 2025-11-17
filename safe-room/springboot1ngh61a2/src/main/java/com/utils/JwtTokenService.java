package com.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.apache.commons.lang3.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT Token服务
 * 生成和验证JWT Token，包含设备指纹绑定
 */
public class JwtTokenService {
    
    private static final String SECRET_KEY = "fitness-gym-secret-key-2024-security-enhanced-very-long-key-for-hmac-sha256";
    private static final long EXPIRATION_TIME = 3600000; // 1小时，单位：毫秒
    private static final SecretKey KEY = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    
    /**
     * 生成JWT Token
     * @param userId 用户ID
     * @param username 用户名
     * @param tableName 表名
     * @param role 角色
     * @param deviceFingerprint 设备指纹（IP+User-Agent的哈希）
     * @return JWT Token
     */
    public static String generateToken(Long userId, String username, String tableName, String role, String deviceFingerprint) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);
        claims.put("tableName", tableName);
        claims.put("role", role);
        claims.put("deviceFingerprint", deviceFingerprint);
        
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(KEY)
                .compact();
    }
    
    /**
     * 从Token中获取Claims
     * @param token JWT Token
     * @return Claims
     */
    public static Claims getClaimsFromToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(KEY)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 验证Token是否有效
     * @param token JWT Token
     * @param deviceFingerprint 设备指纹
     * @return 是否有效
     */
    public static boolean validateToken(String token, String deviceFingerprint) {
        if (StringUtils.isBlank(token)) {
            return false;
        }
        
        Claims claims = getClaimsFromToken(token);
        if (claims == null) {
            return false;
        }
        
        // 检查Token是否过期
        Date expiration = claims.getExpiration();
        if (expiration.before(new Date())) {
            return false;
        }
        
        // 验证设备指纹
        String tokenFingerprint = claims.get("deviceFingerprint", String.class);
        if (StringUtils.isNotBlank(deviceFingerprint) && !deviceFingerprint.equals(tokenFingerprint)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 从Token中获取用户ID
     * @param token JWT Token
     * @return 用户ID
     */
    public static Long getUserIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        if (claims == null) {
            return null;
        }
        Object userId = claims.get("userId");
        if (userId instanceof Integer) {
            return ((Integer) userId).longValue();
        } else if (userId instanceof Long) {
            return (Long) userId;
        }
        return null;
    }
    
    /**
     * 从Token中获取用户名
     * @param token JWT Token
     * @return 用户名
     */
    public static String getUsernameFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        if (claims == null) {
            return null;
        }
        return claims.get("username", String.class);
    }
    
    /**
     * 从Token中获取角色
     * @param token JWT Token
     * @return 角色
     */
    public static String getRoleFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        if (claims == null) {
            return null;
        }
        return claims.get("role", String.class);
    }
    
    /**
     * 从Token中获取表名
     * @param token JWT Token
     * @return 表名
     */
    public static String getTableNameFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        if (claims == null) {
            return null;
        }
        return claims.get("tableName", String.class);
    }
    
    /**
     * 生成设备指纹
     * @param ip IP地址
     * @param userAgent User-Agent
     * @return 设备指纹（MD5哈希）
     */
    public static String generateDeviceFingerprint(String ip, String userAgent) {
        String combined = (ip != null ? ip : "") + "|" + (userAgent != null ? userAgent : "");
        return EncryptUtil.md5(combined);
    }
}

