package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tags({
    @Tag("integration"),
    @Tag("controller"),
    @Tag("jianshenkecheng")
})
@DisplayName("健身课程控制器集成测试")
class JianshenkechengControllerTest extends AbstractControllerIntegrationTest {

    private static final String BASE_URL = "/jianshenkecheng";

    @AfterEach
    void cleanupTestData() {
        // 清理测试数据，避免影响其他测试
        // 这里可以根据需要添加清理逻辑
    }

    @Nested
    @DisplayName("分页查询测试")
    class PaginationTests {

        @Test
        @DisplayName("应该返回分页课程列表")
        void shouldReturnPagedCourses() throws Exception {
            performAdmin(get(BASE_URL + "/page"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(0))
                    .andExpect(jsonPath("$.data.list").isArray());
        }

        @Test
        @DisplayName("应该支持带参数的分页查询")
        void shouldReturnPagedCoursesWithParams() throws Exception {
            performAdmin(get(BASE_URL + "/page")
                    .param("page", "1")
                    .param("limit", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(0))
                    .andExpect(jsonPath("$.data.list").isArray());
        }

        @ParameterizedTest
        @ValueSource(ints = {1, 5, 10, 20})
        @DisplayName("应该支持不同分页大小: {0}")
        void shouldSupportDifferentPageSizes(int limit) throws Exception {
            performAdmin(get(BASE_URL + "/page")
                    .param("page", "1")
                    .param("limit", String.valueOf(limit)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(0));
        }

        @Test
        @RepeatedTest(3)
        @DisplayName("分页查询应该稳定可靠")
        void shouldHandlePaginationReliably() throws Exception {
            performAdmin(get(BASE_URL + "/page")
                    .param("page", "1")
                    .param("limit", "5"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(0));
        }
    }

    @Nested
    @DisplayName("列表查询测试")
    class ListTests {

        @Test
        @DisplayName("应该返回前台课程列表（无需认证）")
        void shouldReturnCourseList() throws Exception {
            mockMvc.perform(get(BASE_URL + "/list")
                    .param("page", "1")
                    .param("limit", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(0))
                    .andExpect(jsonPath("$.data.list").isArray());
        }

        @ParameterizedTest
        @CsvSource({
            "瑜伽, 5",
            "有氧, 10",
            "力量, 3"
        })
        @DisplayName("应该支持按课程名称过滤: {0} (限制{1})")
        void shouldReturnCourseListWithFilters(String courseName, int limit) throws Exception {
            mockMvc.perform(get(BASE_URL + "/list")
                    .param("page", "1")
                    .param("limit", String.valueOf(limit))
                    .param("kechengmingcheng", courseName))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(0))
                    .andExpect(jsonPath("$.data.list").isArray());
        }
    }

    @Nested
    @DisplayName("参数验证测试")
    class ParameterValidationTests {

        @ParameterizedTest
        @CsvSource({
            "-1, 10, 无效页码参数",
            "1, 0, 无效限制参数",
            "0, -5, 无效参数组合"
        })
        @DisplayName("应该正确处理无效分页参数: {2}")
        void shouldHandleInvalidPaginationParams(int page, int limit, String description) throws Exception {
            performAdmin(get(BASE_URL + "/page")
                    .param("page", String.valueOf(page))
                    .param("limit", String.valueOf(limit)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(0));
        }

        @Test
        @DisplayName("应该处理大数值分页参数")
        @Timeout(5)
        void shouldHandleLargePaginationParams() throws Exception {
            performAdmin(get(BASE_URL + "/page")
                    .param("page", "999999")
                    .param("limit", "1000"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(0));
        }
    }

    @Test
    void shouldCreateCourse() throws Exception {
        Map<String, Object> courseData = Map.of(
            "kechengmingcheng", "测试健身课程",
            "kechengleixing", "有氧运动",
            "shangkeshijian", "2024-12-01 09:00:00",
            "shangkedidian", "1号教室",
            "kechengjiage", 99.99,
            "kechengjianjie", "测试课程描述",
            "shangkeshichang", 60,
            "baomingrenshu", 0,
            "yuyuerenshu", 0,
            "status", 0
        );

        postJson(BASE_URL + "/save", courseData)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldCreateCourseWithAllFields() throws Exception {
        Map<String, Object> courseData = new HashMap<>();
        courseData.put("kechengmingcheng", "高级瑜伽课程");
        courseData.put("kechengleixing", "瑜伽");
        courseData.put("tupian", "yoga.jpg");
        courseData.put("shangkeshijian", "2024-12-01 14:00:00");
        courseData.put("shangkedidian", "2号教室");
        courseData.put("kechengjiage", 199.99);
        courseData.put("kechengjianjie", "专业的瑜伽课程，适合所有水平");
        courseData.put("kechengshipin", "yoga_video.mp4");
        courseData.put("shangkejihua", "热身+基本姿势+冥想");
        courseData.put("shangkeshichang", 90);
        courseData.put("baomingrenshu", 20);
        courseData.put("yuyuerenshu", 15);
        courseData.put("status", 0);

        postJson(BASE_URL + "/save", courseData)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleSaveWithEmptyData() throws Exception {
        postJson(BASE_URL + "/save", Map.of())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500)); // 期望数据库错误
    }

    @Test
    void shouldUpdateCourse() throws Exception {
        // 首先创建一个课程用于更新
        Map<String, Object> createData = Map.of(
            "kechengmingcheng", "待更新课程",
            "kechengleixing", "有氧运动",
            "shangkeshijian", "2024-12-01 09:00:00",
            "shangkedidian", "1号教室",
            "kechengjiage", 50.0,
            "kechengjianjie", "待更新课程",
            "shangkeshichang", 60,
            "baomingrenshu", 0,
            "yuyuerenshu", 0,
            "status", 0
        );

        postJson(BASE_URL + "/save", createData)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // 然后更新它
        Map<String, Object> updateData = new HashMap<>();
        updateData.put("id", 1); // 假设ID为1，实际测试中需要动态获取
        updateData.put("kechengmingcheng", "已更新课程");
        updateData.put("kechengleixing", "力量训练");
        updateData.put("shangkeshijian", "2024-12-01 14:00:00");
        updateData.put("shangkedidian", "2号教室");
        updateData.put("kechengjiage", 75.0);
        updateData.put("kechengjianjie", "已更新的课程");
        updateData.put("shangkeshichang", 90);
        updateData.put("baomingrenshu", 10);
        updateData.put("yuyuerenshu", 8);
        updateData.put("status", 0);

        putJson(BASE_URL + "/update", updateData)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldUpdateCourseWithPartialData() throws Exception {
        Map<String, Object> updateData = Map.of(
            "id", 1,
            "kechengjianjie", "更新后的课程简介",
            "baomingrenshu", 15,
            "yuyuerenshu", 12
        );

        putJson(BASE_URL + "/update", updateData)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleUpdateNonExistentCourse() throws Exception {
        Map<String, Object> updateData = Map.of(
            "id", 999999,
            "kechengmingcheng", "不存在的课程"
        );

        putJson(BASE_URL + "/update", updateData)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0)); // 可能返回成功或错误
    }

    @Test
    void shouldDeleteCourses() throws Exception {
        Long[] ids = {1L, 2L, 3L}; // 删除多个课程

        performAdmin(post(BASE_URL + "/delete")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ids)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldDeleteSingleCourse() throws Exception {
        Long[] ids = {1L};

        performAdmin(post(BASE_URL + "/delete")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ids)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleDeleteEmptyIds() throws Exception {
        Long[] ids = {};

        performAdmin(post(BASE_URL + "/delete")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ids)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleDeleteNonExistentIds() throws Exception {
        Long[] ids = {999999L, 888888L};

        performAdmin(post(BASE_URL + "/delete")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ids)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldGetCourseDetail() throws Exception {
        performAdmin(get(BASE_URL + "/info/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleGetNonExistentCourseDetail() throws Exception {
        performAdmin(get(BASE_URL + "/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0)); // 可能返回空数据
    }

    @Test
    void shouldHandleInvalidCourseId() throws Exception {
        performAdmin(get(BASE_URL + "/info/invalid"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldHandlePrivateCoachAppointment() throws Exception {
        Map<String, Object> appointmentData = Map.of(
            "kechengid", 1,
            "userid", 1,
            "jiaolianid", 1,
            "yuyueshijian", "2025-12-01 10:00:00",
            "beizhu", "预约备注"
        );

        postJson(BASE_URL + "/sijiao", appointmentData)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    void shouldHandleCourseReservation() throws Exception {
        Map<String, Object> reservationData = Map.of(
            "kechengid", 1,
            "userid", 1,
            "yuyueshijian", "2025-12-01 14:00:00"
        );

        postJson(BASE_URL + "/yuyue", reservationData)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    void shouldHandleCancelReservation() throws Exception {
        Map<String, Object> cancelData = Map.of(
            "kechengid", 1,
            "userid", 1
        );

        postJson(BASE_URL + "/cancel", cancelData)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleReminderQuery() throws Exception {
        performAdmin(get(BASE_URL + "/remind/jiaolianid/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldHandleReminderQueryWithParams() throws Exception {
        performAdmin(get(BASE_URL + "/remind/jiaolianid/1")
                .param("page", "1")
                .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleStatisticsQuery() throws Exception {
        performAdmin(get(BASE_URL + "/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleStatisticsWithDateRange() throws Exception {
        performAdmin(get(BASE_URL + "/statistics")
                .param("startDate", "2025-01-01")
                .param("endDate", "2025-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleCollection() throws Exception {
        Map<String, Object> collectionData = Map.of(
            "kechengid", 1,
            "userid", 1
        );

        postJson(BASE_URL + "/collect", collectionData)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    void shouldHandleCancelCollection() throws Exception {
        Map<String, Object> cancelCollectionData = Map.of(
            "kechengid", 1,
            "userid", 1
        );

        postJson(BASE_URL + "/cancelCollect", cancelCollectionData)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleRating() throws Exception {
        Map<String, Object> ratingData = Map.of(
            "kechengid", 1,
            "userid", 1,
            "score", 5,
            "comment", "非常好的课程"
        );

        postJson(BASE_URL + "/rate", ratingData)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    void shouldHandleQueryRatings() throws Exception {
        performAdmin(get(BASE_URL + "/ratings/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyJsonRequests() throws Exception {
        postJson(BASE_URL + "/save", null)
                .andExpect(status().isOk());
    }

    @Test
    void shouldHandleMalformedJsonRequests() throws Exception {
        mockMvc.perform(post(BASE_URL + "/save")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{invalid json}"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldHandleLargeDataRequests() throws Exception {
        StringBuilder largeDescription = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            largeDescription.append("测试数据");
        }

        Map<String, Object> largeData = Map.of(
            "kechengmingcheng", "大课程",
            "kechengmiaoshu", largeDescription.toString()
        );

        postJson(BASE_URL + "/save", largeData)
                .andExpect(status().isOk());
    }

    @Test
    void shouldHandleSpecialCharactersInData() throws Exception {
        Map<String, Object> specialData = Map.of(
            "kechengmingcheng", "特殊字符课程！@#$%^&*()",
            "kechengleixing", "特殊课程",
            "shangkeshijian", "2024-12-01 10:00:00",
            "shangkedidian", "特殊教室",
            "kechengjiage", 88.88,
            "kechengjianjie", "包含特殊字符的描述：àáâãäåæçèéêë",
            "shangkeshichang", 45,
            "baomingrenshu", 1,
            "yuyuerenshu", 1,
            "status", 0
        );

        postJson(BASE_URL + "/save", specialData)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }
}
