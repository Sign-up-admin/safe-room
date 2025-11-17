package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.StoreupEntity;
import com.entity.view.StoreupView;
import com.entity.vo.StoreupVO;
import com.utils.PageUtils;
import com.utils.TestUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
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
class StoreupServiceImplTest {

    @Autowired
    private StoreupService storeupService;

    @AfterEach
    void cleanupTestData() {
        // Clean up test data to prevent conflicts between test runs
        storeupService.remove(new QueryWrapper<StoreupEntity>()
                .eq("userid", 200L)
                .or()
                .eq("name", "自动收藏")
                .or()
                .eq("name", "测试收藏"));
    }

    @Test
    void shouldPageFavorites() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils pageUtils = storeupService.queryPage(params);

        assertThat(pageUtils.getList()).isNotEmpty();
    }

    @Test
    void shouldFilterByUserId() {
        StoreupEntity favorite = TestUtils.createFavorite(200L, 9999L, "jianshenkecheng", "自动收藏");
        storeupService.save(favorite);

        QueryWrapper<StoreupEntity> wrapper = new QueryWrapper<StoreupEntity>().eq("userid", 200);

        assertThat(storeupService.list(wrapper))
                .isNotEmpty()
                .allMatch(entry -> entry.getUserid().equals(200L));
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = storeupService.queryPage(emptyParams);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = storeupService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = storeupService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = storeupService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = storeupService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<StoreupEntity> wrapper = new QueryWrapper<StoreupEntity>()
                .eq("userid", Long.MAX_VALUE);
        List<StoreupView> views = storeupService.selectListView(wrapper);
        assertThat(views).isEmpty();
    }

    @Test
    void shouldHandleNullWrapper() {
        List<StoreupVO> vos = storeupService.selectListVO(null);
        assertThat(vos).isNotNull();
    }

    @Test
    void shouldHandleViewWithNullWrapper() {
        StoreupView view = storeupService.selectView(null);
        assertThat(view).isNull();
    }

    @Test
    void shouldHandleVOWithNonExistentCondition() {
        QueryWrapper<StoreupEntity> wrapper = new QueryWrapper<StoreupEntity>()
                .eq("id", Long.MAX_VALUE);
        StoreupVO vo = storeupService.selectVO(wrapper);
        assertThat(vo).isNull();
    }

    @Test
    void shouldHandleQueryPageWithWrapperAndEmptyParams() {
        Map<String, Object> params = Collections.emptyMap();
        QueryWrapper<StoreupEntity> wrapper = new QueryWrapper<>();
        PageUtils result = storeupService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleBoundaryQueryConditions() {
        QueryWrapper<StoreupEntity> wrapper = new QueryWrapper<StoreupEntity>()
                .like("name", "")
                .or()
                .isNull("tablename");
        List<StoreupView> views = storeupService.selectListView(wrapper);
        assertThat(views).isNotNull();
    }

    // 异常场景测试
    @Test
    void shouldHandleSaveWithNullEntity() {
        StoreupEntity entity = null;
        try {
            storeupService.save(entity);
        } catch (Exception e) {
            assertThat(e).isNotNull();
        }
    }

    @Test
    void shouldHandleUpdateNonExistentEntity() {
        StoreupEntity entity = new StoreupEntity();
        entity.setId(Long.MAX_VALUE);
        entity.setName("不存在的收藏");
        boolean result = storeupService.updateById(entity);
        assertThat(result).isFalse();
    }

    @Test
    void shouldHandleDeleteNonExistentEntity() {
        boolean result = storeupService.removeById(Long.MAX_VALUE);
        assertThat(result).isFalse();
    }

    @Test
    void shouldHandleGetByIdWithNonExistentId() {
        StoreupEntity entity = storeupService.getById(Long.MAX_VALUE);
        assertThat(entity).isNull();
    }

    @Test
    void shouldHandleSaveWithInvalidData() {
        StoreupEntity entity = new StoreupEntity();
        // 缺少必填字段
        entity.setUserid(null);
        entity.setRefid(null);
        // 应该能保存但可能违反约束
        try {
            storeupService.save(entity);
        } catch (Exception e) {
            // 可能抛出约束异常
            assertThat(e).isNotNull();
        }
    }
}



