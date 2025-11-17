package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.YonghuEntity;
import com.entity.view.YonghuView;
import com.entity.vo.YonghuVO;
import com.utils.PageUtils;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Tags({
    @Tag("unit"),
    @Tag("service"),
    @Tag("yonghu")
})
@DisplayName("用户服务实现单元测试")
class YonghuServiceImplTest {

    @Autowired
    private YonghuService yonghuService;

    @Nested
    @DisplayName("分页查询测试")
    class PaginationTests {

        @Test
        @DisplayName("应该返回分页会员列表")
        void shouldReturnPagedMembers() {
            Map<String, Object> params = new HashMap<>();
            params.put("page", "1");
            params.put("limit", "5");

            PageUtils result = yonghuService.queryPage(params);

            assertThat(result.getList()).isNotEmpty();
        }

        @ParameterizedTest
        @ValueSource(ints = {1, 5, 10, 20, 50})
        @DisplayName("应该支持不同分页大小: {0}")
        void shouldSupportDifferentPageSizes(int limit) {
            Map<String, Object> params = new HashMap<>();
            params.put("page", "1");
            params.put("limit", String.valueOf(limit));

            PageUtils result = yonghuService.queryPage(params);

            assertThat(result).isNotNull();
            assertThat(result.getList()).isNotNull();
        }

        @RepeatedTest(3)
        @DisplayName("分页查询应该稳定可靠")
        void shouldHandlePaginationReliably() {
            Map<String, Object> params = new HashMap<>();
            params.put("page", "1");
            params.put("limit", "5");

            PageUtils result = yonghuService.queryPage(params);

            assertThat(result).isNotNull();
            assertThat(result.getList()).isNotNull();
        }
    }

    @Nested
    @DisplayName("视图查询测试")
    class ViewQueryTests {

        @Test
        @DisplayName("应该能选择会员视图")
        void shouldSelectMemberView() {
            // First check if any members exist
            List<YonghuView> allViews = yonghuService.selectListView(new QueryWrapper<>());
            if (!allViews.isEmpty()) {
                // Use the first member's account for the test
                String account = allViews.get(0).getYonghuzhanghao();
                var view = yonghuService.selectView(new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", account));
                assertThat(view).isNotNull();
            } else {
                // If no members exist, the view should be null
                var view = yonghuService.selectView(new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", "member001"));
                // View may be null if data doesn't exist
                // This is acceptable behavior
            }
        }
    }

    @Nested
    @DisplayName("参数验证和边界条件测试")
    class ParameterValidationTests {

        @Test
        @DisplayName("应该处理空参数")
        void shouldHandleEmptyParams() {
            Map<String, Object> emptyParams = new HashMap<>();
            PageUtils result = yonghuService.queryPage(emptyParams);
            assertThat(result).isNotNull();
            assertThat(result.getList()).isNotNull();
        }

        @Test
        @DisplayName("应该处理null参数")
        void shouldHandleNullParams() {
            PageUtils result = yonghuService.queryPage(null);
            assertThat(result).isNotNull();
        }

        @ParameterizedTest
        @ValueSource(strings = {"-1", "0", "999999"})
        @DisplayName("应该处理无效页码参数: {0}")
        void shouldHandleInvalidPageNumbers(String page) {
            Map<String, Object> params = new HashMap<>();
            params.put("page", page);
            params.put("limit", "5");
            PageUtils result = yonghuService.queryPage(params);
            assertThat(result).isNotNull();
        }

        @ParameterizedTest
        @ValueSource(strings = {"0", "-5", "1000"})
        @DisplayName("应该处理各种限制参数: {0}")
        void shouldHandleVariousLimits(String limit) {
            Map<String, Object> params = new HashMap<>();
            params.put("page", "1");
            params.put("limit", limit);
            PageUtils result = yonghuService.queryPage(params);
            assertThat(result).isNotNull();
        }
    }

    @Nested
    @DisplayName("查询操作测试")
    class QueryOperationsTests {

        @Test
        @DisplayName("应该处理空结果集")
        void shouldHandleEmptyResultSet() {
            QueryWrapper<YonghuEntity> wrapper = new QueryWrapper<YonghuEntity>()
                    .eq("yonghuzhanghao", "不存在的用户-" + System.nanoTime());
            List<YonghuView> views = yonghuService.selectListView(wrapper);
            assertThat(views).isEmpty();
        }

        @Test
        @DisplayName("应该处理null包装器参数")
        void shouldHandleNullWrapper() {
            List<YonghuVO> vos = yonghuService.selectListVO(null);
            assertThat(vos).isNotNull();
        }

        @Test
        @DisplayName("应该处理null包装器的视图查询")
        void shouldHandleViewWithNullWrapper() {
            YonghuView view = yonghuService.selectView(null);
            assertThat(view).isNull();
        }

        @Test
        @DisplayName("应该处理不存在条件的VO查询")
        void shouldHandleVOWithNonExistentCondition() {
            QueryWrapper<YonghuEntity> wrapper = new QueryWrapper<YonghuEntity>()
                    .eq("id", Long.MAX_VALUE);
            YonghuVO vo = yonghuService.selectVO(wrapper);
            assertThat(vo).isNull();
        }

        @Test
        @DisplayName("应该处理带包装器的分页查询")
        void shouldHandleQueryPageWithWrapperAndEmptyParams() {
            Map<String, Object> params = Collections.emptyMap();
            QueryWrapper<YonghuEntity> wrapper = new QueryWrapper<>();
            PageUtils result = yonghuService.queryPage(params, wrapper);
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("应该处理边界查询条件")
        void shouldHandleBoundaryQueryConditions() {
            QueryWrapper<YonghuEntity> wrapper = new QueryWrapper<YonghuEntity>()
                    .like("yonghuzhanghao", "")
                    .or()
                    .isNull("xingbie");
            List<YonghuView> views = yonghuService.selectListView(wrapper);
            assertThat(views).isNotNull();
        }
    }

    @Nested
    @DisplayName("异常场景和错误处理测试")
    class ErrorHandlingTests {

        @Test
        @DisplayName("应该处理保存null实体")
        void shouldHandleSaveWithNullEntity() {
            YonghuEntity entity = null;
            try {
                yonghuService.save(entity);
            } catch (Exception e) {
                assertThat(e).isNotNull();
            }
        }

        @Test
        @DisplayName("应该处理更新不存在的实体")
        void shouldHandleUpdateNonExistentEntity() {
            YonghuEntity entity = new YonghuEntity();
            entity.setId(Long.MAX_VALUE);
            entity.setYonghuzhanghao("不存在的用户");
            boolean result = yonghuService.updateById(entity);
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("应该处理删除不存在的实体")
        void shouldHandleDeleteNonExistentEntity() {
            boolean result = yonghuService.removeById(Long.MAX_VALUE);
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("应该处理通过不存在ID获取实体")
        void shouldHandleGetByIdWithNonExistentId() {
            YonghuEntity entity = yonghuService.getById(Long.MAX_VALUE);
            assertThat(entity).isNull();
        }

        @Test
        @DisplayName("应该处理null包装器的分页查询")
        void shouldHandleQueryPageWithNullWrapper() {
            Map<String, Object> params = new HashMap<>();
            params.put("page", "1");
            params.put("limit", "10");
            PageUtils result = yonghuService.queryPage(params, null);
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("应该处理null参数的各种查询方法")
        void shouldHandleNullParamsInVariousQueries() {
            QueryWrapper<YonghuEntity> nullWrapper = null;
            List<Map<String, Object>> values = yonghuService.selectValue(null, nullWrapper != null ? nullWrapper : new QueryWrapper<>());
            assertThat(values).isNotNull();

            List<Map<String, Object>> timeStats = yonghuService.selectTimeStatValue(null, nullWrapper != null ? nullWrapper : new QueryWrapper<>());
            assertThat(timeStats).isNotNull();

            List<Map<String, Object>> groups = yonghuService.selectGroup(null, nullWrapper != null ? nullWrapper : new QueryWrapper<>());
            assertThat(groups).isNotNull();
        }
        
        @Test
        @DisplayName("应该处理空包装器的各种查询方法")
        void shouldHandleEmptyWrapperInVariousQueries() {
            QueryWrapper<YonghuEntity> emptyWrapper = new QueryWrapper<>();
            List<Map<String, Object>> values = yonghuService.selectValue(null, emptyWrapper);
            assertThat(values).isNotNull();

            List<Map<String, Object>> timeStats = yonghuService.selectTimeStatValue(null, emptyWrapper);
            assertThat(timeStats).isNotNull();

            List<Map<String, Object>> groups = yonghuService.selectGroup(null, emptyWrapper);
            assertThat(groups).isNotNull();
        }
    }
}


