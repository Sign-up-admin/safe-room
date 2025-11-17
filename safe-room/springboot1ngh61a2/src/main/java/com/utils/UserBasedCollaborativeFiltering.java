package com.utils;

import java.util.*;

/**
 * 基于用户的协同过滤推荐算法工具类
 */
public class UserBasedCollaborativeFiltering {
    
    private Map<String, Map<String, Double>> ratings;
    
    /**
     * 构造函数
     * @param ratings 用户评分数据，格式为 Map<用户ID, Map<物品ID, 评分>>
     */
    public UserBasedCollaborativeFiltering(Map<String, Map<String, Double>> ratings) {
        this.ratings = ratings != null ? ratings : new HashMap<>();
    }
    
    /**
     * 为指定用户推荐物品
     * @param userId 用户ID
     * @param numRecommendations 推荐数量
     * @return 推荐物品ID列表
     */
    public List<String> recommendItems(String userId, int numRecommendations) {
        if (ratings == null || ratings.isEmpty() || !ratings.containsKey(userId)) {
            return new ArrayList<>();
        }
        
        Map<String, Double> userRatings = ratings.get(userId);
        if (userRatings == null || userRatings.isEmpty()) {
            return new ArrayList<>();
        }
        
        Map<String, Double> scores = new HashMap<>();
        Map<String, Double> similarities = new HashMap<>();
        
        // 计算与其他用户的相似度
        for (Map.Entry<String, Map<String, Double>> entry : ratings.entrySet()) {
            if (entry.getKey().equals(userId)) {
                continue;
            }
            
            double similarity = calculateSimilarityString(userRatings, entry.getValue());
            if (similarity > 0) {
                similarities.put(entry.getKey(), similarity);
                // 计算推荐分数
                for (Map.Entry<String, Double> rating : entry.getValue().entrySet()) {
                    if (!userRatings.containsKey(rating.getKey())) {
                        scores.put(rating.getKey(), 
                            scores.getOrDefault(rating.getKey(), 0.0) + similarity * rating.getValue());
                    }
                }
            }
        }
        
        // 按分数排序并返回前N个
        return scores.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(numRecommendations)
            .map(Map.Entry::getKey)
            .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * 计算用户相似度（余弦相似度）- String版本
     * @param user1Ratings 用户1的评分
     * @param user2Ratings 用户2的评分
     * @return 相似度值（0-1之间）
     */
    private double calculateSimilarityString(Map<String, Double> user1Ratings, Map<String, Double> user2Ratings) {
        if (user1Ratings == null || user2Ratings == null || user1Ratings.isEmpty() || user2Ratings.isEmpty()) {
            return 0.0;
        }
        
        Set<String> commonItems = new HashSet<>(user1Ratings.keySet());
        commonItems.retainAll(user2Ratings.keySet());
        
        if (commonItems.isEmpty()) {
            return 0.0;
        }
        
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;
        
        for (String itemId : commonItems) {
            double rating1 = user1Ratings.get(itemId);
            double rating2 = user2Ratings.get(itemId);
            dotProduct += rating1 * rating2;
            norm1 += rating1 * rating1;
            norm2 += rating2 * rating2;
        }
        
        if (norm1 == 0.0 || norm2 == 0.0) {
            return 0.0;
        }
        
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
    
    /**
     * 计算用户相似度（余弦相似度）
     * @param user1Ratings 用户1的评分
     * @param user2Ratings 用户2的评分
     * @return 相似度值（0-1之间）
     */
    public static double calculateSimilarity(Map<Long, Double> user1Ratings, Map<Long, Double> user2Ratings) {
        if (user1Ratings == null || user2Ratings == null || user1Ratings.isEmpty() || user2Ratings.isEmpty()) {
            return 0.0;
        }
        
        Set<Long> commonItems = new HashSet<>(user1Ratings.keySet());
        commonItems.retainAll(user2Ratings.keySet());
        
        if (commonItems.isEmpty()) {
            return 0.0;
        }
        
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;
        
        for (Long itemId : commonItems) {
            double rating1 = user1Ratings.get(itemId);
            double rating2 = user2Ratings.get(itemId);
            dotProduct += rating1 * rating2;
            norm1 += rating1 * rating1;
            norm2 += rating2 * rating2;
        }
        
        if (norm1 == 0.0 || norm2 == 0.0) {
            return 0.0;
        }
        
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
    
    /**
     * 获取推荐列表
     * @param userRatings 用户评分
     * @param allUserRatings 所有用户的评分
     * @param topN 返回前N个推荐
     * @return 推荐列表
     */
    public static List<Long> getRecommendations(Map<Long, Double> userRatings, 
                                                Map<Long, Map<Long, Double>> allUserRatings, 
                                                int topN) {
        if (userRatings == null || allUserRatings == null || userRatings.isEmpty()) {
            return new ArrayList<>();
        }
        
        Map<Long, Double> scores = new HashMap<>();
        Map<Long, Double> similarities = new HashMap<>();
        
        for (Map.Entry<Long, Map<Long, Double>> entry : allUserRatings.entrySet()) {
            double similarity = calculateSimilarity(userRatings, entry.getValue());
            if (similarity > 0) {
                similarities.put(entry.getKey(), similarity);
                for (Map.Entry<Long, Double> rating : entry.getValue().entrySet()) {
                    if (!userRatings.containsKey(rating.getKey())) {
                        scores.put(rating.getKey(), 
                            scores.getOrDefault(rating.getKey(), 0.0) + similarity * rating.getValue());
                    }
                }
            }
        }
        
        // 按分数排序并返回前N个
        return scores.entrySet().stream()
            .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
            .limit(topN)
            .map(Map.Entry::getKey)
            .collect(java.util.stream.Collectors.toList());
    }
}

