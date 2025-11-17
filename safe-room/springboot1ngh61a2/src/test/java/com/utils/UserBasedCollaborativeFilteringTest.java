package com.utils;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class UserBasedCollaborativeFilteringTest {

    @Test
    void recommendItemsShouldReturnHighestScoredItems() {
        Map<String, Map<String, Double>> ratings = new HashMap<>();
        ratings.put("u1", Map.of("i1", 5.0, "i2", 3.0));
        ratings.put("u2", Map.of("i1", 5.0, "i3", 4.0));
        ratings.put("u3", Map.of("i2", 3.0, "i4", 5.0));

        UserBasedCollaborativeFiltering filtering = new UserBasedCollaborativeFiltering(ratings);

        List<String> recommendations = filtering.recommendItems("u1", 2);

        assertThat(recommendations).contains("i3");
    }

    @Test
    void calculateSimilarityShouldReturnCosineSimilarity() {
        Map<Long, Double> user1 = Map.of(1L, 5.0, 2L, 3.0);
        Map<Long, Double> user2 = Map.of(1L, 5.0, 2L, 3.0);

        double similarity = UserBasedCollaborativeFiltering.calculateSimilarity(user1, user2);

        assertThat(similarity).isEqualTo(1.0);
    }

    @Test
    void getRecommendationsShouldMergeScoresFromSimilarUsers() {
        Map<Long, Double> target = Map.of(1L, 5.0);
        Map<Long, Map<Long, Double>> all = new HashMap<>();
        all.put(2L, Map.of(1L, 5.0, 3L, 4.0));
        all.put(3L, Map.of(2L, 2.0, 3L, 5.0));

        List<Long> recommendations = UserBasedCollaborativeFiltering.getRecommendations(target, all, 1);

        assertThat(recommendations).containsExactly(3L);
    }

    @Test
    void recommendItemsShouldHandleEmptyRatings() {
        UserBasedCollaborativeFiltering filtering = new UserBasedCollaborativeFiltering(new HashMap<>());
        List<String> recommendations = filtering.recommendItems("user", 5);
        assertThat(recommendations).isEmpty();
    }

    @Test
    void recommendItemsShouldHandleNullRatings() {
        UserBasedCollaborativeFiltering filtering = new UserBasedCollaborativeFiltering(null);
        List<String> recommendations = filtering.recommendItems("user", 5);
        assertThat(recommendations).isEmpty();
    }

    @Test
    void recommendItemsShouldHandleNonExistentUser() {
        Map<String, Map<String, Double>> ratings = new HashMap<>();
        ratings.put("u1", Map.of("i1", 5.0));
        UserBasedCollaborativeFiltering filtering = new UserBasedCollaborativeFiltering(ratings);
        List<String> recommendations = filtering.recommendItems("nonexistent", 5);
        assertThat(recommendations).isEmpty();
    }

    @Test
    void recommendItemsShouldHandleUserWithNoRatings() {
        Map<String, Map<String, Double>> ratings = new HashMap<>();
        ratings.put("u1", new HashMap<>());
        ratings.put("u2", Map.of("i1", 5.0));
        UserBasedCollaborativeFiltering filtering = new UserBasedCollaborativeFiltering(ratings);
        List<String> recommendations = filtering.recommendItems("u1", 5);
        assertThat(recommendations).isEmpty();
    }

    @Test
    void recommendItemsShouldHandleZeroRecommendations() {
        Map<String, Map<String, Double>> ratings = new HashMap<>();
        ratings.put("u1", Map.of("i1", 5.0));
        ratings.put("u2", Map.of("i1", 5.0, "i2", 4.0));
        UserBasedCollaborativeFiltering filtering = new UserBasedCollaborativeFiltering(ratings);
        List<String> recommendations = filtering.recommendItems("u1", 0);
        assertThat(recommendations).isEmpty();
    }

    @Test
    void recommendItemsShouldHandleNegativeRecommendations() {
        Map<String, Map<String, Double>> ratings = new HashMap<>();
        ratings.put("u1", Map.of("i1", 5.0));
        ratings.put("u2", Map.of("i1", 5.0, "i2", 4.0));
        UserBasedCollaborativeFiltering filtering = new UserBasedCollaborativeFiltering(ratings);
        List<String> recommendations = filtering.recommendItems("u1", -1);
        assertThat(recommendations).isEmpty();
    }

    @Test
    void recommendItemsShouldHandleNoSimilarUsers() {
        Map<String, Map<String, Double>> ratings = new HashMap<>();
        ratings.put("u1", Map.of("i1", 5.0));
        ratings.put("u2", Map.of("i2", 5.0)); // No common items with u1
        UserBasedCollaborativeFiltering filtering = new UserBasedCollaborativeFiltering(ratings);
        List<String> recommendations = filtering.recommendItems("u1", 5);
        assertThat(recommendations).isEmpty();
    }

    @Test
    void recommendItemsShouldHandleAllItemsAlreadyRated() {
        Map<String, Map<String, Double>> ratings = new HashMap<>();
        ratings.put("u1", Map.of("i1", 5.0, "i2", 4.0));
        ratings.put("u2", Map.of("i1", 5.0, "i2", 4.0)); // Same ratings as u1
        UserBasedCollaborativeFiltering filtering = new UserBasedCollaborativeFiltering(ratings);
        List<String> recommendations = filtering.recommendItems("u1", 5);
        assertThat(recommendations).isEmpty();
    }

    @Test
    void calculateSimilarityShouldHandleIdenticalUsers() {
        Map<Long, Double> user1 = Map.of(1L, 5.0, 2L, 3.0, 3L, 4.0);
        Map<Long, Double> user2 = Map.of(1L, 5.0, 2L, 3.0, 3L, 4.0);

        double similarity = UserBasedCollaborativeFiltering.calculateSimilarity(user1, user2);
        assertThat(similarity).isEqualTo(1.0);
    }

    @Test
    void calculateSimilarityShouldHandleOppositeUsers() {
        Map<Long, Double> user1 = Map.of(1L, 5.0, 2L, 3.0);
        Map<Long, Double> user2 = Map.of(1L, 1.0, 2L, 5.0);

        double similarity = UserBasedCollaborativeFiltering.calculateSimilarity(user1, user2);
        assertThat(similarity).isLessThan(1.0);
        assertThat(similarity).isGreaterThan(0.0);
    }

    @Test
    void calculateSimilarityShouldReturnZeroForNoCommonItems() {
        Map<Long, Double> user1 = Map.of(1L, 5.0, 2L, 3.0);
        Map<Long, Double> user2 = Map.of(3L, 5.0, 4L, 3.0);

        double similarity = UserBasedCollaborativeFiltering.calculateSimilarity(user1, user2);
        assertThat(similarity).isEqualTo(0.0);
    }

    @Test
    void calculateSimilarityShouldReturnZeroForNullInputs() {
        double similarity1 = UserBasedCollaborativeFiltering.calculateSimilarity(null, Map.of(1L, 5.0));
        double similarity2 = UserBasedCollaborativeFiltering.calculateSimilarity(Map.of(1L, 5.0), null);
        double similarity3 = UserBasedCollaborativeFiltering.calculateSimilarity(null, null);

        assertThat(similarity1).isEqualTo(0.0);
        assertThat(similarity2).isEqualTo(0.0);
        assertThat(similarity3).isEqualTo(0.0);
    }

    @Test
    void calculateSimilarityShouldReturnZeroForEmptyInputs() {
        Map<Long, Double> empty = new HashMap<>();
        double similarity1 = UserBasedCollaborativeFiltering.calculateSimilarity(empty, Map.of(1L, 5.0));
        double similarity2 = UserBasedCollaborativeFiltering.calculateSimilarity(Map.of(1L, 5.0), empty);

        assertThat(similarity1).isEqualTo(0.0);
        assertThat(similarity2).isEqualTo(0.0);
    }

    @Test
    void calculateSimilarityShouldHandleSingleCommonItem() {
        Map<Long, Double> user1 = Map.of(1L, 5.0, 2L, 3.0);
        Map<Long, Double> user2 = Map.of(1L, 4.0, 3L, 2.0);

        double similarity = UserBasedCollaborativeFiltering.calculateSimilarity(user1, user2);
        assertThat(similarity).isGreaterThan(0.0);
        assertThat(similarity).isLessThanOrEqualTo(1.0);
    }

    @Test
    void getRecommendationsShouldHandleNullInputs() {
        List<Long> result1 = UserBasedCollaborativeFiltering.getRecommendations(null, new HashMap<>(), 5);
        List<Long> result2 = UserBasedCollaborativeFiltering.getRecommendations(new HashMap<>(), null, 5);
        List<Long> result3 = UserBasedCollaborativeFiltering.getRecommendations(new HashMap<>(), new HashMap<>(), 5);

        assertThat(result1).isEmpty();
        assertThat(result2).isEmpty();
        assertThat(result3).isEmpty();
    }

    @Test
    void getRecommendationsShouldHandleEmptyUserRatings() {
        Map<Long, Double> emptyUser = new HashMap<>();
        Map<Long, Map<Long, Double>> allUsers = new HashMap<>();
        allUsers.put(1L, Map.of(1L, 5.0));

        List<Long> recommendations = UserBasedCollaborativeFiltering.getRecommendations(emptyUser, allUsers, 5);
        assertThat(recommendations).isEmpty();
    }

    @Test
    void getRecommendationsShouldHandleZeroTopN() {
        Map<Long, Double> user = Map.of(1L, 5.0);
        Map<Long, Map<Long, Double>> allUsers = new HashMap<>();
        allUsers.put(2L, Map.of(1L, 5.0, 2L, 4.0));

        List<Long> recommendations = UserBasedCollaborativeFiltering.getRecommendations(user, allUsers, 0);
        assertThat(recommendations).isEmpty();
    }

    @Test
    void getRecommendationsShouldHandleNegativeTopN() {
        Map<Long, Double> user = Map.of(1L, 5.0);
        Map<Long, Map<Long, Double>> allUsers = new HashMap<>();
        allUsers.put(2L, Map.of(1L, 5.0, 2L, 4.0));

        List<Long> recommendations = UserBasedCollaborativeFiltering.getRecommendations(user, allUsers, -1);
        assertThat(recommendations).isEmpty();
    }

    @Test
    void getRecommendationsShouldReturnLimitedResults() {
        Map<Long, Double> user = Map.of(1L, 5.0);
        Map<Long, Map<Long, Double>> allUsers = new HashMap<>();
        allUsers.put(2L, Map.of(1L, 5.0, 2L, 5.0, 3L, 4.0, 4L, 3.0, 5L, 2.0));

        List<Long> recommendations = UserBasedCollaborativeFiltering.getRecommendations(user, allUsers, 3);
        assertThat(recommendations).hasSize(3);
    }

    @Test
    void getRecommendationsShouldHandleLargeTopN() {
        Map<Long, Double> user = Map.of(1L, 5.0);
        Map<Long, Map<Long, Double>> allUsers = new HashMap<>();
        allUsers.put(2L, Map.of(1L, 5.0, 2L, 4.0));

        List<Long> recommendations = UserBasedCollaborativeFiltering.getRecommendations(user, allUsers, 100);
        assertThat(recommendations).hasSizeLessThanOrEqualTo(1); // Only one item available
    }
}
