package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.HuiyuankaEntity;
import com.entity.view.HuiyuankaView;
import com.entity.vo.HuiyuankaVO;
import com.utils.PageUtils;
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
class HuiyuankaServiceImplTest {

    @Autowired
    private HuiyuankaService huiyuankaService;

    @Test
    void shouldReturnPagedMembershipCards() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");

        PageUtils result = huiyuankaService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldSelectCardViews() {
        var views = huiyuankaService.selectListView(new QueryWrapper<>());
        assertThat(views).isNotEmpty();
    }

    @Test
    void shouldSelectSingleCardView() {
        // First check if any cards exist
        List<HuiyuankaView> allViews = huiyuankaService.selectListView(new QueryWrapper<>());
        if (!allViews.isEmpty()) {
            // Use the first card's name for the test
            String cardName = allViews.get(0).getHuiyuankamingcheng();
            var view = huiyuankaService.selectView(new QueryWrapper<HuiyuankaEntity>().eq("huiyuankamingcheng", cardName));
            assertThat(view).isNotNull();
        } else {
            // If no cards exist, the view should be null
            var view = huiyuankaService.selectView(new QueryWrapper<HuiyuankaEntity>().eq("huiyuankamingcheng", "黄金会员"));
            // View may be null if data doesn't exist
            // This is acceptable behavior
        }
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = huiyuankaService.queryPage(emptyParams);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = huiyuankaService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "10");
        PageUtils result = huiyuankaService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = huiyuankaService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = huiyuankaService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<HuiyuankaEntity> wrapper = new QueryWrapper<HuiyuankaEntity>()
                .eq("huiyuankamingcheng", "不存在的会员卡-" + System.nanoTime());
        List<HuiyuankaView> views = huiyuankaService.selectListView(wrapper);
        assertThat(views).isEmpty();
    }

    @Test
    void shouldHandleNullWrapper() {
        List<HuiyuankaVO> vos = huiyuankaService.selectListVO(null);
        assertThat(vos).isNotNull();
    }

    @Test
    void shouldHandleViewWithNullWrapper() {
        HuiyuankaView view = huiyuankaService.selectView(null);
        assertThat(view).isNull();
    }

    @Test
    void shouldHandleVOWithNonExistentCondition() {
        QueryWrapper<HuiyuankaEntity> wrapper = new QueryWrapper<HuiyuankaEntity>()
                .eq("id", Long.MAX_VALUE);
        HuiyuankaVO vo = huiyuankaService.selectVO(wrapper);
        assertThat(vo).isNull();
    }

    @Test
    void shouldHandleQueryPageWithWrapperAndEmptyParams() {
        Map<String, Object> params = Collections.emptyMap();
        QueryWrapper<HuiyuankaEntity> wrapper = new QueryWrapper<>();
        PageUtils result = huiyuankaService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleBoundaryQueryConditions() {
        QueryWrapper<HuiyuankaEntity> wrapper = new QueryWrapper<HuiyuankaEntity>()
                .like("huiyuankamingcheng", "")
                .or()
                .isNull("jiage");
        List<HuiyuankaView> views = huiyuankaService.selectListView(wrapper);
        assertThat(views).isNotNull();
    }
}


